#!/usr/bin/env python3
"""Connector-ready social publisher with dry-run queue output."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import mimetypes
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_PACK_FILE = ROOT / "docs" / "assets" / "data" / "social" / "daily-shorts-pack-latest.json"
DEFAULT_CONFIG_FILE = ROOT / "automation" / "social" / "publisher-config.json"
DEFAULT_OUTBOX = ROOT / "automation" / "social" / "outbox"


class PublisherError(RuntimeError):
    pass


def http_post_json(url: str, payload: dict, headers: dict | None = None) -> dict:
    body = json.dumps(payload).encode("utf-8")
    req_headers = {"Content-Type": "application/json"}
    if headers:
        req_headers.update(headers)
    req = urllib.request.Request(url=url, method="POST", data=body, headers=req_headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            text = response.read().decode("utf-8")
            return json.loads(text) if text else {}
    except urllib.error.HTTPError as exc:
        error_body = exc.read().decode("utf-8", errors="replace")
        raise PublisherError(f"HTTP {exc.code} from {url}: {error_body}") from exc
    except urllib.error.URLError as exc:
        raise PublisherError(f"Request failed for {url}: {exc}") from exc


def resolve_item_media_path(item: dict) -> Path:
    assets = item.get("assets", {}) if isinstance(item.get("assets"), dict) else {}
    media_rel = assets.get("localVideoPath", "")
    if not media_rel:
        raise PublisherError("Missing assets.localVideoPath in content item")
    media_path = ROOT / media_rel
    if not media_path.exists():
        raise PublisherError(f"Video file not found: {media_path}")
    return media_path


class BasePublisher:
    platform = "base"

    def __init__(self, config: dict):
        self.config = config

    def validate_live_config(self) -> None:
        if not self.config:
            raise PublisherError(f"Missing config for {self.platform}")

    def publish(self, item: dict, mode: str) -> dict:
        if mode == "live":
            self.validate_live_config()
            return self._publish_live(item)
        return self._publish_dry_run(item)

    def _publish_live(self, item: dict) -> dict:
        raise PublisherError(f"Live publish not implemented yet for {self.platform}")

    def _publish_dry_run(self, item: dict) -> dict:
        return {
            "platform": self.platform,
            "status": "queued",
            "message": "dry-run queued",
            "contentId": item.get("contentId"),
            "preview": item.get("caption", "")[:180],
        }


class YouTubePublisher(BasePublisher):
    platform = "youtube_shorts"

    def validate_live_config(self) -> None:
        required = ["oauthClientId", "oauthClientSecret", "refreshToken"]
        missing = [key for key in required if not self.config.get(key)]
        if missing:
            raise PublisherError(f"Missing YouTube config keys: {', '.join(missing)}")

    def _refresh_access_token(self) -> str:
        token_url = "https://oauth2.googleapis.com/token"
        payload = {
            "client_id": self.config["oauthClientId"],
            "client_secret": self.config["oauthClientSecret"],
            "refresh_token": self.config["refreshToken"],
            "grant_type": "refresh_token",
        }
        body = urllib.parse.urlencode(payload).encode("utf-8")
        req = urllib.request.Request(
            url=token_url,
            method="POST",
            data=body,
            headers={"Content-Type": "application/x-www-form-urlencoded"},
        )
        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            raise PublisherError(f"Token refresh failed: HTTP {exc.code}: {error_body}") from exc

        access_token = data.get("access_token")
        if not access_token:
            raise PublisherError("Token refresh succeeded but no access_token was returned")
        return access_token

    def _init_resumable_upload(self, access_token: str, item: dict, media_path: Path) -> str:
        title = item.get("platforms", {}).get("youtube_shorts", {}).get("title") or item.get("mealName", "Washoku Plus Short")
        description = item.get("platforms", {}).get("youtube_shorts", {}).get("description") or item.get("caption", "")
        privacy_status = self.config.get("privacyStatus", "public")

        metadata = {
            "snippet": {
                "title": title,
                "description": description,
                "categoryId": str(self.config.get("categoryId", "22")),
            },
            "status": {
                "privacyStatus": privacy_status,
                "selfDeclaredMadeForKids": False,
            },
        }

        upload_url = "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable"
        content_type = mimetypes.guess_type(str(media_path))[0] or "video/mp4"
        req = urllib.request.Request(
            url=upload_url,
            method="POST",
            data=json.dumps(metadata).encode("utf-8"),
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json; charset=UTF-8",
                "X-Upload-Content-Type": content_type,
                "X-Upload-Content-Length": str(media_path.stat().st_size),
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=60) as response:
                location = response.headers.get("Location", "")
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            raise PublisherError(f"Failed to initialize YouTube upload: HTTP {exc.code}: {error_body}") from exc

        if not location:
            raise PublisherError("YouTube upload initialization did not return a resumable Location header")
        return location

    def _upload_video(self, resumable_url: str, access_token: str, media_path: Path) -> dict:
        content_type = mimetypes.guess_type(str(media_path))[0] or "video/mp4"
        video_data = media_path.read_bytes()
        req = urllib.request.Request(
            url=resumable_url,
            method="PUT",
            data=video_data,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": content_type,
                "Content-Length": str(len(video_data)),
            },
        )

        try:
            with urllib.request.urlopen(req, timeout=900) as response:
                data = json.loads(response.read().decode("utf-8"))
        except urllib.error.HTTPError as exc:
            error_body = exc.read().decode("utf-8", errors="replace")
            raise PublisherError(f"YouTube upload failed: HTTP {exc.code}: {error_body}") from exc

        return data

    def _publish_live(self, item: dict) -> dict:
        media_path = resolve_item_media_path(item)
        access_token = self._refresh_access_token()
        resumable_url = self._init_resumable_upload(access_token, item, media_path)
        response = self._upload_video(resumable_url, access_token, media_path)

        video_id = response.get("id", "")
        return {
            "platform": self.platform,
            "status": "published",
            "contentId": item.get("contentId"),
            "videoId": video_id,
            "url": f"https://www.youtube.com/watch?v={video_id}" if video_id else "",
            "message": "uploaded to YouTube",
        }


class InstagramPublisher(BasePublisher):
    platform = "instagram_reels"

    def _publish_live(self, item: dict) -> dict:
        webhook = self.config.get("publishWebhookUrl", "")
        if not webhook:
            raise PublisherError(
                "Instagram live publishing requires platforms.instagram_reels.publishWebhookUrl or a direct API implementation"
            )
        payload = {
            "platform": self.platform,
            "contentId": item.get("contentId"),
            "item": item,
            "requestedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        }
        response = http_post_json(webhook, payload, headers=self._webhook_auth_header())
        return {
            "platform": self.platform,
            "status": "submitted",
            "contentId": item.get("contentId"),
            "message": "submitted to instagram webhook",
            "response": response,
        }

    def _webhook_auth_header(self) -> dict:
        token = self.config.get("webhookToken", "")
        if not token:
            return {}
        return {"Authorization": f"Bearer {token}"}


class TikTokPublisher(BasePublisher):
    platform = "tiktok"

    def _publish_live(self, item: dict) -> dict:
        webhook = self.config.get("publishWebhookUrl", "")
        if not webhook:
            raise PublisherError(
                "TikTok live publishing requires platforms.tiktok.publishWebhookUrl or a direct API implementation"
            )
        payload = {
            "platform": self.platform,
            "contentId": item.get("contentId"),
            "item": item,
            "requestedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        }
        response = http_post_json(webhook, payload, headers=self._webhook_auth_header())
        return {
            "platform": self.platform,
            "status": "submitted",
            "contentId": item.get("contentId"),
            "message": "submitted to tiktok webhook",
            "response": response,
        }

    def _webhook_auth_header(self) -> dict:
        token = self.config.get("webhookToken", "")
        if not token:
            return {}
        return {"Authorization": f"Bearer {token}"}


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--pack-file", type=Path, default=DEFAULT_PACK_FILE)
    parser.add_argument("--config", type=Path, default=DEFAULT_CONFIG_FILE)
    parser.add_argument("--outbox", type=Path, default=DEFAULT_OUTBOX)
    parser.add_argument("--platforms", type=str, default="youtube_shorts,instagram_reels,tiktok")
    parser.add_argument("--mode", choices=["dry-run", "live"], default="dry-run")
    return parser.parse_args()


def load_json(path: Path, fallback: dict | None = None) -> dict:
    if path.exists():
        return json.loads(path.read_text(encoding="utf-8"))
    return {} if fallback is None else fallback


def publisher_map() -> dict[str, type[BasePublisher]]:
    return {
        "youtube_shorts": YouTubePublisher,
        "instagram_reels": InstagramPublisher,
        "tiktok": TikTokPublisher,
    }


def main() -> int:
    args = parse_args()
    pack = load_json(args.pack_file)
    config = load_json(args.config, fallback={"platforms": {}})

    platforms = [p.strip() for p in args.platforms.split(",") if p.strip()]
    items = pack.get("items", [])
    if not items:
        raise SystemExit("No items found in shorts pack. Generate a pack first.")

    queue = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "mode": args.mode,
        "packFile": str(args.pack_file),
        "results": [],
    }

    registry = publisher_map()
    for item in items:
        for platform in platforms:
            publisher_cls = registry.get(platform)
            if publisher_cls is None:
                queue["results"].append(
                    {
                        "platform": platform,
                        "status": "skipped",
                        "reason": "unknown platform",
                        "contentId": item.get("contentId"),
                    }
                )
                continue

            publisher = publisher_cls(config.get("platforms", {}).get(platform, {}))
            try:
                queue["results"].append(publisher.publish(item, args.mode))
            except PublisherError as exc:
                queue["results"].append(
                    {
                        "platform": platform,
                        "status": "failed",
                        "reason": str(exc),
                        "contentId": item.get("contentId"),
                    }
                )

    args.outbox.mkdir(parents=True, exist_ok=True)
    stamp = dt.datetime.now(dt.timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    out_file = args.outbox / f"publish-queue-{stamp}.json"
    out_file.write_text(json.dumps(queue, indent=2) + "\n", encoding="utf-8")

    print(f"Wrote queue file: {out_file}")
    if args.mode == "live":
        print("Live mode currently requires API integration in publisher classes.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
