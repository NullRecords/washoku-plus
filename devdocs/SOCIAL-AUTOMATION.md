# Social Content Automation (Phase 1)

## What this includes

- Daily short-form content pack generation from `docs/assets/data/menu-content.json`.
- Connector-ready publisher interface for YouTube Shorts, Instagram Reels, and TikTok.
- Live publishing support:
  - YouTube Shorts direct upload API (local video file required).
  - Instagram and TikTok webhook submission mode for integration with Make/Zapier/n8n/custom APIs.
- Dry-run queue output for safe daily operation without posting APIs enabled.
- Daily scheduled GitHub Actions workflow to generate and queue content.
- Ad automation rule templates for Meta and TikTok.
- Unified local operations entry point via `ops/startup.sh`.

## Files

- Generator: `docs/tools/generate_shorts_pack.py`
- Publisher interface: `docs/tools/publish_social_content.py`
- Publisher config template: `automation/social/publisher-config.example.json`
- Local runner: `ops/startup.sh`
- Workflow: `.github/workflows/daily-social-pack.yml`
- Outbox queue: `automation/social/outbox/`
- Local video input folder: `automation/social/media/`
- Output packs: `docs/assets/data/social/`
- Ads rules:
  - `automation/social/ad-rules/meta-ads-rules.json`
  - `automation/social/ad-rules/tiktok-ads-rules.json`
- Account setup guide: `devdocs/SOCIAL-ACCOUNT-SETUP.md`

## Local run

Generate a pack and queue it in dry-run mode:

```bash
python docs/tools/generate_shorts_pack.py --count 3
python docs/tools/publish_social_content.py --mode dry-run
```

Preferred unified commands:

```bash
bash ops/startup.sh social-setup
bash ops/startup.sh social-run 3 dry-run
bash ops/startup.sh social-status
```

Live mode command:

```bash
bash ops/startup.sh social-queue live
```

Live mode behavior:

- YouTube: uploads videos directly via YouTube API using credentials in `publisher-config.json`.
- Instagram: posts payload to `platforms.instagram_reels.publishWebhookUrl`.
- TikTok: posts payload to `platforms.tiktok.publishWebhookUrl`.

Optional date override:

```bash
python docs/tools/generate_shorts_pack.py --date 2026-05-29 --count 3
```

## GitHub Actions schedule

Workflow `daily-social-pack.yml` runs daily and on manual dispatch.

- Generates a daily shorts pack
- Builds a publish queue in dry-run mode
- Uploads artifacts for review

## Enabling live publishing later

1. Copy `automation/social/publisher-config.example.json` to `automation/social/publisher-config.json` (local only).
2. Add real platform credentials.
3. Implement live API calls in publisher classes inside `docs/tools/publish_social_content.py`:
   - `YouTubePublisher._publish_live`
   - `InstagramPublisher._publish_live`
   - `TikTokPublisher._publish_live`
4. Follow account and app setup steps in `devdocs/SOCIAL-ACCOUNT-SETUP.md`.
5. Place video files in `automation/social/media/` using the generated filename from each content item's `assets.localVideoPath`.

## Platform constraints

- YouTube Shorts: easiest API path.
- Instagram Reels: requires Meta Business setup and approved API permissions.
- TikTok: requires developer approval and account eligibility.

## Safe operating pattern

- Keep daily workflow in dry-run by default.
- Review queue artifacts each day.
- Move to live mode only after platform approval and token management are in place.
