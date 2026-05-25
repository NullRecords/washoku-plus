#!/usr/bin/env python3
"""Merge Sprout Kitchen community snapshots and promote selected dishes into menu-content.json."""

from __future__ import annotations

import argparse
import copy
import json
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
DEFAULT_COMMUNITY_FILE = ROOT / "docs" / "assets" / "data" / "community-submissions.json"
DEFAULT_MENU_FILE = ROOT / "docs" / "assets" / "data" / "menu-content.json"

CUISINE_LABELS = {
    "japanese": "Japanese-inspired",
    "korean": "Korean-inspired",
    "thai": "Thai-inspired",
    "mediterranean": "Mediterranean-inspired",
    "mexican": "Mexican-inspired",
    "global": "Global-inspired",
}

CATEGORY_META = {
    "bowls": ("Bowls", "Bowls meal ideas"),
    "burgers": ("Burgers", "Burgers meal ideas"),
    "global-favorites": ("Global Favorites", "Global Favorites meal ideas"),
    "plates-and-bento": ("Plates & Bento", "Plates & Bento meal ideas"),
    "salads": ("Salads", "Salads meal ideas"),
    "soups-and-noodles": ("Soups & Noodles", "Soups & Noodles meal ideas"),
    "wraps-and-rolls": ("Wraps & Rolls", "Wraps & Rolls meal ideas"),
}

ALLERGEN_TERMS = {
    "fish": ["salmon", "tuna", "fish"],
    "shellfish": ["shrimp", "prawn"],
    "soy": ["tamari", "soy", "tofu", "edamame", "miso", "gochujang"],
    "egg": ["egg"],
}


def utc_now() -> str:
    return __import__("datetime").datetime.now(__import__("datetime").timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_json(path: Path, default: dict[str, Any]) -> dict[str, Any]:
    if not path.exists():
        return copy.deepcopy(default)
    return json.loads(path.read_text(encoding="utf-8"))


def save_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2) + "\n", encoding="utf-8")


def slugify(value: str) -> str:
    return re.sub(r"(^-|-$)", "", re.sub(r"[^a-z0-9]+", "-", (value or "").strip().lower())) or "item"


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def as_list(value: Any) -> list[Any]:
    if isinstance(value, list):
        return value
    if value in (None, ""):
        return []
    return [value]


def parse_recipes(payload: Any) -> list[dict[str, Any]]:
    if isinstance(payload, list):
        return [item for item in payload if isinstance(item, dict)]
    if isinstance(payload, dict):
        for key in ("recipes", "community"):
            if isinstance(payload.get(key), list):
                return [item for item in payload[key] if isinstance(item, dict)]
    return []


def normalize_score(score: Any) -> dict[str, int]:
    score = score if isinstance(score, dict) else {}
    return {
        "tastiness": int(score.get("tastiness") or 0),
        "protein": int(score.get("protein") or 0),
        "nutrition": int(score.get("nutrition") or 0),
        "washoku": int(score.get("washoku") or 0),
        "overall": int(score.get("overall") or 0),
    }


def normalize_nutrition(nutrition: Any) -> dict[str, int]:
    nutrition = nutrition if isinstance(nutrition, dict) else {}
    return {
        "kcal": int(nutrition.get("kcal") or 0),
        "protein": int(nutrition.get("protein") or 0),
        "plants": int(nutrition.get("plants") or 0),
    }


def recipe_fingerprint(recipe: dict[str, Any]) -> str:
    return "|".join(
        [
            clean_text(recipe.get("name")).lower(),
            clean_text(recipe.get("createdAt")).lower(),
            clean_text(recipe.get("cuisine")).lower(),
        ]
    )


def normalize_submission(recipe: dict[str, Any], *, imported_from: str = "") -> dict[str, Any]:
    normalized = copy.deepcopy(recipe)
    normalized["id"] = clean_text(recipe.get("id")) or f"r_{slugify(clean_text(recipe.get('name')))}"
    normalized["name"] = clean_text(recipe.get("name")) or "Community Recipe"
    normalized["createdAt"] = clean_text(recipe.get("createdAt")) or utc_now()
    normalized["cuisine"] = clean_text(recipe.get("cuisine")) or "global"
    normalized["votes"] = int(recipe.get("votes") or 0)
    normalized["score"] = normalize_score(recipe.get("score"))
    normalized["nutrition"] = normalize_nutrition(recipe.get("nutrition"))
    normalized["selection"] = recipe.get("selection") if isinstance(recipe.get("selection"), dict) else {}
    normalized["prepPlan"] = as_list(recipe.get("prepPlan"))
    normalized["prep"] = recipe.get("prep") if isinstance(recipe.get("prep"), dict) else {}
    normalized["sliceRound"] = recipe.get("sliceRound") if isinstance(recipe.get("sliceRound"), dict) else {}
    normalized["dishImage"] = clean_text(recipe.get("dishImage"))
    normalized["importedAt"] = clean_text(recipe.get("importedAt")) or utc_now()
    normalized["importedFrom"] = clean_text(recipe.get("importedFrom")) or imported_from
    normalized["sourceLabel"] = clean_text(recipe.get("sourceLabel")) or (f"Snapshot {Path(imported_from).name}" if imported_from else "Checked-in community submissions")
    normalized["reviewStatus"] = clean_text(recipe.get("reviewStatus")) or "pending"
    normalized["reviewNotes"] = clean_text(recipe.get("reviewNotes"))
    normalized["promotedMealId"] = clean_text(recipe.get("promotedMealId"))
    normalized["eligibleForReview"] = normalized["votes"] >= 5 and normalized["score"]["overall"] >= 78
    return normalized


def merge_submission(existing: dict[str, Any], incoming: dict[str, Any]) -> dict[str, Any]:
    merged = copy.deepcopy(existing)
    for key, value in incoming.items():
        if value not in (None, "", [], {}):
            merged[key] = copy.deepcopy(value)

    merged["votes"] = max(int(existing.get("votes") or 0), int(incoming.get("votes") or 0))
    if int(existing.get("score", {}).get("overall") or 0) > int(incoming.get("score", {}).get("overall") or 0):
        merged["score"] = copy.deepcopy(existing["score"])
    if int(existing.get("nutrition", {}).get("protein") or 0) > int(incoming.get("nutrition", {}).get("protein") or 0):
        merged["nutrition"] = copy.deepcopy(existing["nutrition"])

    if clean_text(existing.get("reviewStatus")) not in ("", "pending"):
        merged["reviewStatus"] = existing["reviewStatus"]
    if clean_text(existing.get("reviewNotes")):
        merged["reviewNotes"] = existing["reviewNotes"]
    if clean_text(existing.get("promotedMealId")):
        merged["promotedMealId"] = existing["promotedMealId"]

    merged["eligibleForReview"] = merged["votes"] >= 5 and int(merged["score"]["overall"]) >= 78
    return merged


def extract_selection_names(recipe: dict[str, Any], key: str) -> list[str]:
    values = []
    for item in as_list(recipe.get("selection", {}).get(key)):
        if isinstance(item, dict):
            name = clean_text(item.get("name") or item.get("id"))
        else:
            name = clean_text(item)
        if name and name not in values:
            values.append(name)
    return values


def infer_category(recipe: dict[str, Any], default_category: str) -> str:
    text = " ".join(
        [
            clean_text(recipe.get("name")),
            clean_text(recipe.get("cuisine")),
            " ".join(extract_selection_names(recipe, "starch")),
            " ".join(extract_selection_names(recipe, "flavor")),
        ]
    ).lower()
    if any(term in text for term in ("burger",)):
        return "burgers"
    if any(term in text for term in ("wrap", "roll", "taco", "burrito")):
        return "wraps-and-rolls"
    if any(term in text for term in ("soup", "broth", "ramen", "udon", "noodle")):
        return "soups-and-noodles"
    if any(term in text for term in ("salad", "greens")):
        return "salads"
    if any(term in text for term in ("plate", "bento")):
        return "plates-and-bento"
    if any(term in text for term in ("global",)):
        return "global-favorites"
    return default_category


def cuisine_label(raw: str) -> str:
    raw = clean_text(raw).lower()
    return CUISINE_LABELS.get(raw, f"{raw.title()}-inspired" if raw else "Global-inspired")


def infer_allergens(recipe: dict[str, Any]) -> list[str]:
    haystack = " ".join(
        [
            " ".join(extract_selection_names(recipe, "protein")),
            " ".join(extract_selection_names(recipe, "plants")),
            " ".join(extract_selection_names(recipe, "starch")),
            " ".join(extract_selection_names(recipe, "flavor")),
        ]
    ).lower()
    allergens = []
    for allergen, terms in ALLERGEN_TERMS.items():
        if any(term in haystack for term in terms):
            allergens.append(allergen)
    return allergens


def ensure_category(menu_data: dict[str, Any], category_id: str) -> None:
    categories = menu_data.setdefault("categories", [])
    if any(category.get("id") == category_id for category in categories):
        return
    name, description = CATEGORY_META.get(category_id, (category_id.replace("-", " ").title(), "Community-imported meal ideas"))
    categories.append({
        "id": category_id,
        "name": name,
        "description": description,
        "image": "",
        "mealCount": 0,
    })


def recalc_category_counts(menu_data: dict[str, Any]) -> None:
    counts: dict[str, int] = {}
    for meal in menu_data.get("meals", []):
        category = clean_text(meal.get("category")) or "bowls"
        counts[category] = counts.get(category, 0) + 1
    for category in menu_data.get("categories", []):
        category["mealCount"] = counts.get(category.get("id"), 0)


def unique_meal_id(existing_ids: set[str], base_name: str) -> str:
    base_id = f"meal_{slugify(base_name)}"
    candidate = base_id
    index = 2
    while candidate in existing_ids:
        candidate = f"{base_id}-{index}"
        index += 1
    return candidate


def submission_to_meal(recipe: dict[str, Any], existing_ids: set[str], default_category: str) -> dict[str, Any]:
    protein_names = extract_selection_names(recipe, "protein")
    plant_names = extract_selection_names(recipe, "plants")
    starch_names = extract_selection_names(recipe, "starch")
    flavor_names = extract_selection_names(recipe, "flavor")
    protein_text = ", ".join(protein_names)
    flavor_text = ", ".join(flavor_names)

    meat_terms = ("chicken", "turkey", "beef", "pork")
    seafood_terms = ("salmon", "shrimp", "tuna", "fish")
    lower_protein_text = protein_text.lower()
    is_vegetarian = not any(term in lower_protein_text for term in meat_terms + seafood_terms)
    is_pescatarian = is_vegetarian or not any(term in lower_protein_text for term in meat_terms)
    category_id = infer_category(recipe, default_category)

    meal = {
        "id": unique_meal_id(existing_ids, recipe.get("name") or "community-meal"),
        "name": clean_text(recipe.get("name")) or "Community Meal",
        "category": category_id,
        "cuisine": cuisine_label(recipe.get("cuisine")),
        "mealType": "Lunch/Dinner",
        "isVegetarian": is_vegetarian,
        "isPescatarian": is_pescatarian,
        "protein": protein_text or "mixed protein",
        "plants": plant_names,
        "smartStarch": starch_names[0] if starch_names else "rice",
        "flavor": flavor_text or "bright flavor",
        "prepMinutes": max(15, min(45, 8 + len(as_list(recipe.get("prepPlan"))) * 4)),
        "estimatedCalories": int(recipe.get("nutrition", {}).get("kcal") or 0),
        "estimatedProteinG": int(recipe.get("nutrition", {}).get("protein") or 0),
        "allergens": infer_allergens(recipe),
        "wheatWarning": "Verify sauces and broths are certified wheat-free before publishing.",
        "nutWarning": "Review toppings and sauces for nut or seed cross-contact before publishing.",
        "alternatives": "Imported from the Sprout Kitchen community board. Validate ingredients, allergens, and portions before shipping to users.",
        "tags": [
            "Community pick",
            *( ["Vegetarian"] if is_vegetarian else [] ),
            *( ["Pescatarian"] if is_pescatarian and not is_vegetarian else [] ),
            *( ["High protein"] if int(recipe.get("nutrition", {}).get("protein") or 0) >= 25 else [] ),
        ],
        "mapsSearchTerms": [
            clean_text(recipe.get("name")),
            f"{cuisine_label(recipe.get('cuisine'))} meal",
        ],
        "portionNote": "Imported from community review workflow; validate nutrition and allergens before publishing in the app or menu.",
        "image": "",
    }
    existing_ids.add(meal["id"])
    return meal


def load_community_file(path: Path) -> dict[str, Any]:
    payload = load_json(path, {"version": "1.0.0", "updatedAt": utc_now(), "recipes": []})
    recipes = parse_recipes(payload)
    payload["version"] = clean_text(payload.get("version")) or "1.0.0"
    payload["updatedAt"] = clean_text(payload.get("updatedAt")) or utc_now()
    payload["recipes"] = [normalize_submission(recipe) for recipe in recipes]
    return payload


def merge_snapshots(args: argparse.Namespace) -> int:
    community_path = Path(args.community_file)
    community_payload = load_community_file(community_path)
    recipes = community_payload["recipes"]
    by_key = {recipe["id"]: recipe for recipe in recipes}
    by_fingerprint = {recipe_fingerprint(recipe): recipe for recipe in recipes}

    merged_count = 0
    added_count = 0
    for snapshot in args.snapshots:
        snapshot_path = Path(snapshot)
        snapshot_payload = json.loads(snapshot_path.read_text(encoding="utf-8"))
        for raw_recipe in parse_recipes(snapshot_payload):
            incoming = normalize_submission(raw_recipe, imported_from=str(snapshot_path))
            existing = by_key.get(incoming["id"]) or by_fingerprint.get(recipe_fingerprint(incoming))
            if existing:
                merged = merge_submission(existing, incoming)
                recipes[recipes.index(existing)] = merged
                by_key[merged["id"]] = merged
                by_fingerprint[recipe_fingerprint(merged)] = merged
                merged_count += 1
            else:
                recipes.append(incoming)
                by_key[incoming["id"]] = incoming
                by_fingerprint[recipe_fingerprint(incoming)] = incoming
                added_count += 1

    recipes.sort(key=lambda recipe: (-int(recipe.get("votes") or 0), -int(recipe.get("score", {}).get("overall") or 0), clean_text(recipe.get("name")).lower()))
    community_payload["updatedAt"] = utc_now()
    save_json(community_path, community_payload)
    print(f"Merged snapshots into {community_path}")
    print(f"Added {added_count} new recipes and refreshed {merged_count} existing recipes.")
    return 0


def report_snapshots(args: argparse.Namespace) -> int:
    community_payload = load_community_file(Path(args.community_file))
    recipes = community_payload["recipes"]
    if args.eligible_only:
        recipes = [recipe for recipe in recipes if recipe.get("eligibleForReview")]
    for recipe in recipes:
        print(
            f"{recipe['id']} | votes={recipe['votes']} | score={recipe['score']['overall']} | "
            f"status={recipe['reviewStatus']} | {recipe['name']}"
        )
    if not recipes:
        print("No community recipes matched the current filter.")
    return 0


def select_recipes_for_promotion(recipes: list[dict[str, Any]], args: argparse.Namespace) -> list[dict[str, Any]]:
    selected = recipes
    if args.ids:
        wanted = set(args.ids)
        selected = [recipe for recipe in selected if recipe.get("id") in wanted]
    if args.status:
        selected = [recipe for recipe in selected if recipe.get("reviewStatus") == args.status]
    if args.eligible:
        selected = [recipe for recipe in selected if recipe.get("eligibleForReview")]
    if not (args.ids or args.status or args.eligible):
        raise SystemExit("Choose at least one promotion filter: --ids, --status, or --eligible")
    return selected


def promote_recipes(args: argparse.Namespace) -> int:
    community_path = Path(args.community_file)
    menu_path = Path(args.menu_file)
    community_payload = load_community_file(community_path)
    menu_data = load_json(menu_path, {"version": "1.0.0", "seed": {"source": "manual", "importedAt": utc_now(), "mealCount": 0}, "categories": [], "meals": []})

    recipes = community_payload["recipes"]
    selected = select_recipes_for_promotion(recipes, args)
    if not selected:
        print("No community recipes matched the promotion filters.")
        return 0

    existing_ids = {clean_text(meal.get("id")) for meal in menu_data.get("meals", [])}
    promoted = []
    for recipe in selected:
        if clean_text(recipe.get("promotedMealId")):
            continue
        meal = submission_to_meal(recipe, existing_ids, args.default_category)
        ensure_category(menu_data, meal["category"])
        menu_data.setdefault("meals", []).append(meal)
        recipe["promotedMealId"] = meal["id"]
        recipe["reviewStatus"] = "approved"
        recipe["reviewNotes"] = clean_text(recipe.get("reviewNotes")) or "Promoted into menu-content.json via community sync script."
        promoted.append((recipe, meal))

    recalc_category_counts(menu_data)
    if args.dry_run:
        print(f"Dry run: would promote {len(promoted)} recipes into {menu_path}")
        for recipe, meal in promoted:
            print(f"- {recipe['id']} -> {meal['id']} ({meal['name']})")
        return 0

    community_payload["updatedAt"] = utc_now()
    menu_data.setdefault("seed", {})["mealCount"] = len(menu_data.get("meals", []))
    save_json(menu_path, menu_data)
    save_json(community_path, community_payload)
    print(f"Promoted {len(promoted)} recipes into {menu_path}")
    for recipe, meal in promoted:
        print(f"- {recipe['id']} -> {meal['id']} ({meal['name']})")
    return 0


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="command", required=True)

    merge_parser = subparsers.add_parser("merge", help="Merge one or more exported community snapshot JSON files.")
    merge_parser.add_argument("snapshots", nargs="+", help="Snapshot JSON files exported from Sprout Kitchen.")
    merge_parser.add_argument("--community-file", default=str(DEFAULT_COMMUNITY_FILE), help="Tracked community submissions JSON file.")
    merge_parser.set_defaults(func=merge_snapshots)

    report_parser = subparsers.add_parser("report", help="Print community submissions from the tracked JSON file.")
    report_parser.add_argument("--community-file", default=str(DEFAULT_COMMUNITY_FILE), help="Tracked community submissions JSON file.")
    report_parser.add_argument("--eligible-only", action="store_true", help="Show only recipes currently eligible for review.")
    report_parser.set_defaults(func=report_snapshots)

    promote_parser = subparsers.add_parser("promote", help="Promote selected community submissions into menu-content.json.")
    promote_parser.add_argument("--community-file", default=str(DEFAULT_COMMUNITY_FILE), help="Tracked community submissions JSON file.")
    promote_parser.add_argument("--menu-file", default=str(DEFAULT_MENU_FILE), help="menu-content.json file to update.")
    promote_parser.add_argument("--ids", nargs="*", help="Specific community recipe IDs to promote.")
    promote_parser.add_argument("--status", choices=["pending", "approved", "rejected"], help="Promote recipes matching a review status.")
    promote_parser.add_argument("--eligible", action="store_true", help="Promote only recipes that meet the vote and score threshold.")
    promote_parser.add_argument("--default-category", default="bowls", help="Fallback category for promoted meals.")
    promote_parser.add_argument("--dry-run", action="store_true", help="Preview promotion changes without writing files.")
    promote_parser.set_defaults(func=promote_recipes)

    return parser


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    return args.func(args)


if __name__ == "__main__":
    raise SystemExit(main())