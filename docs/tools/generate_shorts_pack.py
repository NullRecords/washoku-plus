#!/usr/bin/env python3
"""Generate a daily short-form content pack from menu data."""

from __future__ import annotations

import argparse
import datetime as dt
import json
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_MENU_FILE = ROOT / "docs" / "assets" / "data" / "menu-content.json"
DEFAULT_OUTPUT_DIR = ROOT / "docs" / "assets" / "data" / "social"
DEFAULT_MEDIA_DIR = ROOT / "automation" / "social" / "media"
APP_STORE_URL = "https://apps.apple.com/il/app/washokuplus/id6771856203"
SITE_BASE_URL = "https://www.washokuplus.com"

GUIDES = [
    {
        "title": "What is Washoku?",
        "url": f"{SITE_BASE_URL}/guides/what-is-washoku.html",
    },
    {
        "title": "Wheat-aware Asian meals",
        "url": f"{SITE_BASE_URL}/guides/wheat-aware-asian-meals.html",
    },
    {
        "title": "Protein-forward bowls",
        "url": f"{SITE_BASE_URL}/guides/protein-forward-bowls.html",
    },
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--menu-file", type=Path, default=DEFAULT_MENU_FILE)
    parser.add_argument("--output-dir", type=Path, default=DEFAULT_OUTPUT_DIR)
    parser.add_argument("--media-dir", type=Path, default=DEFAULT_MEDIA_DIR)
    parser.add_argument("--date", type=str, default=dt.date.today().isoformat())
    parser.add_argument("--count", type=int, default=3)
    return parser.parse_args()


def load_menu(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def stable_pick(meals: list[dict], run_date: str, count: int) -> list[dict]:
    seed = int(run_date.replace("-", ""))
    rng = random.Random(seed)
    shuffled = meals[:]
    rng.shuffle(shuffled)
    return shuffled[: max(1, min(count, len(shuffled)))]


def make_hook(meal: dict) -> str:
    protein = meal.get("protein", "protein")
    cuisine = meal.get("cuisine", "global")
    return f"{protein.title()} in under {meal.get('prepMinutes', 25)} minutes? Try this {cuisine} bowl pattern."


def make_shot_list(meal: dict) -> list[str]:
    plants = ", ".join(meal.get("plants", [])[:2]) or "seasonal vegetables"
    return [
        f"Open on finished dish: {meal.get('name', 'Balanced Meal')}",
        f"Ingredient closeups: {meal.get('protein', 'protein')}, {plants}",
        f"Build step: add {meal.get('smartStarch', 'smart starch')} base",
        "Final plate and nutrition callout card",
        "CTA card: Download Washoku Plus on the App Store",
    ]


def make_caption(meal: dict) -> str:
    tags = meal.get("tags", [])
    tag_text = " | ".join(tags[:3]) if tags else "Balanced meal"
    return (
        f"{meal.get('name', 'Balanced Meal')} from Washoku Plus. "
        f"{tag_text}. Educational nutrition guidance only. Download: {APP_STORE_URL}"
    )


def platform_variants(meal: dict, caption: str) -> dict:
    base_name = meal.get("name", "Washoku Plus meal")
    return {
        "youtube_shorts": {
            "title": f"{base_name} in {meal.get('prepMinutes', 25)} min | Washoku Plus",
            "description": caption,
            "hashtags": ["#Shorts", "#MealPrep", "#HealthyEating", "#WashokuPlus"],
        },
        "instagram_reels": {
            "caption": caption,
            "hashtags": ["#mealideas", "#healthyhabits", "#washokuplus", "#reels"],
        },
        "tiktok": {
            "caption": caption,
            "hashtags": ["#mealprep", "#balancedmeals", "#nutritiontips", "#washokuplus"],
        },
    }


def make_item(meal: dict, run_date: str, idx: int, media_dir: Path) -> dict:
    caption = make_caption(meal)
    guide = GUIDES[idx % len(GUIDES)]
    content_id = f"{run_date.replace('-', '')}_{idx + 1}_{meal.get('id', 'meal')}"
    local_video_path = media_dir / f"{content_id}.mp4"
    return {
        "contentId": content_id,
        "publishDate": run_date,
        "mealId": meal.get("id", ""),
        "mealName": meal.get("name", ""),
        "hook": make_hook(meal),
        "scriptLines": [
            "Start with one protein, two plants, one smart starch, one flavor.",
            f"Today: {meal.get('name', 'Balanced meal idea')}.",
            f"Prep time: about {meal.get('prepMinutes', 25)} minutes.",
            f"Estimated protein: {meal.get('estimatedProteinG', 0)}g.",
            "Educational content only, not medical advice.",
        ],
        "shotList": make_shot_list(meal),
        "caption": caption,
        "cta": {
            "text": "Download on the App Store",
            "url": APP_STORE_URL,
        },
        "guideLink": guide,
        "allergyNote": meal.get("wheatWarning") or meal.get("nutWarning") or "Verify labels for allergens.",
        "assets": {
            "dishImage": meal.get("image", ""),
            "localVideoPath": str(local_video_path.relative_to(ROOT)),
            "publicVideoUrl": ""
        },
        "platforms": platform_variants(meal, caption),
    }


def write_outputs(output_dir: Path, run_date: str, payload: dict) -> tuple[Path, Path]:
    output_dir.mkdir(parents=True, exist_ok=True)
    json_path = output_dir / f"daily-shorts-pack-{run_date}.json"
    latest_path = output_dir / "daily-shorts-pack-latest.json"

    json_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")
    latest_path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")

    md_path = output_dir / f"daily-shorts-pack-{run_date}.md"
    lines = [
        f"# Daily Shorts Pack - {run_date}",
        "",
        f"App Store: {APP_STORE_URL}",
        "",
    ]
    for item in payload["items"]:
        lines.extend(
            [
                f"## {item['mealName']}",
                f"- Hook: {item['hook']}",
                f"- CTA: {item['cta']['url']}",
                f"- Guide: {item['guideLink']['url']}",
                f"- Caption: {item['caption']}",
                "",
            ]
        )
    md_path.write_text("\n".join(lines), encoding="utf-8")
    return json_path, md_path


def main() -> int:
    args = parse_args()
    menu = load_menu(args.menu_file)
    meals = menu.get("meals", [])
    if not meals:
        raise SystemExit("No meals found in menu file.")

    args.media_dir.mkdir(parents=True, exist_ok=True)

    selected = stable_pick(meals, args.date, args.count)
    items = [make_item(meal, args.date, idx, args.media_dir) for idx, meal in enumerate(selected)]

    payload = {
        "version": "1.0",
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "publishDate": args.date,
        "source": str(args.menu_file.relative_to(ROOT)),
        "appStoreUrl": APP_STORE_URL,
        "items": items,
    }

    json_path, md_path = write_outputs(args.output_dir, args.date, payload)
    print(f"Wrote {json_path}")
    print(f"Wrote {md_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
