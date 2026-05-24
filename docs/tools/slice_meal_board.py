#!/usr/bin/env python3
"""Slice meal board images into transparent dish cutouts.

This script removes background by edge-connected flood fill, finds dish components,
and exports each dish as a transparent PNG.
"""

from __future__ import annotations

import argparse
import json
from collections import deque
from pathlib import Path
from typing import Any

import numpy as np
from PIL import Image


def estimate_background_color(rgb: np.ndarray) -> np.ndarray:
    h, w, _ = rgb.shape
    border = np.concatenate(
        [
            rgb[0, :, :],
            rgb[h - 1, :, :],
            rgb[:, 0, :],
            rgb[:, w - 1, :],
        ],
        axis=0,
    )
    return np.median(border, axis=0)


def edge_connected_background(rgb: np.ndarray, tolerance: float) -> np.ndarray:
    h, w, _ = rgb.shape
    bg = estimate_background_color(rgb)
    dist = np.linalg.norm(rgb.astype(np.float32) - bg.astype(np.float32), axis=2)
    similar = dist <= tolerance

    visited = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        if similar[0, x]:
            q.append((0, x))
        if similar[h - 1, x]:
            q.append((h - 1, x))
    for y in range(h):
        if similar[y, 0]:
            q.append((y, 0))
        if similar[y, w - 1]:
            q.append((y, w - 1))

    while q:
        y, x = q.popleft()
        if visited[y, x] or not similar[y, x]:
            continue
        visited[y, x] = True
        if y > 0:
            q.append((y - 1, x))
        if y + 1 < h:
            q.append((y + 1, x))
        if x > 0:
            q.append((y, x - 1))
        if x + 1 < w:
            q.append((y, x + 1))

    return visited


def connected_components(mask: np.ndarray, min_area: int) -> list[tuple[int, int, int, int, int]]:
    h, w = mask.shape
    visited = np.zeros_like(mask, dtype=bool)
    boxes: list[tuple[int, int, int, int, int]] = []

    for y in range(h):
        for x in range(w):
            if not mask[y, x] or visited[y, x]:
                continue

            q: deque[tuple[int, int]] = deque([(y, x)])
            visited[y, x] = True
            min_y, max_y = y, y
            min_x, max_x = x, x
            area = 0

            while q:
                cy, cx = q.popleft()
                area += 1
                min_y = min(min_y, cy)
                max_y = max(max_y, cy)
                min_x = min(min_x, cx)
                max_x = max(max_x, cx)

                for ny, nx in ((cy - 1, cx), (cy + 1, cx), (cy, cx - 1), (cy, cx + 1)):
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not visited[ny, nx]:
                        visited[ny, nx] = True
                        q.append((ny, nx))

            if area >= min_area:
                boxes.append((min_x, min_y, max_x, max_y, area))

    boxes.sort(key=lambda b: (b[1], b[0]))
    return boxes


def export_components(
    image_path: Path,
    output_dir: Path,
    tolerance: float,
    min_area: int,
    padding: int,
    prefix: str,
) -> list[dict[str, Any]]:
    img = Image.open(image_path).convert("RGBA")
    rgba = np.array(img)
    rgb = rgba[:, :, :3]

    bg_mask = edge_connected_background(rgb, tolerance=tolerance)
    alpha = np.where(bg_mask, 0, 255).astype(np.uint8)

    # Keep only strong foreground for component detection.
    fg_mask = alpha > 0
    boxes = connected_components(fg_mask, min_area=min_area)

    output_dir.mkdir(parents=True, exist_ok=True)

    exported: list[dict[str, Any]] = []
    for idx, (x0, y0, x1, y1, area) in enumerate(boxes, start=1):
        cx0 = max(0, x0 - padding)
        cy0 = max(0, y0 - padding)
        cx1 = min(img.width - 1, x1 + padding)
        cy1 = min(img.height - 1, y1 + padding)

        crop = rgba[cy0 : cy1 + 1, cx0 : cx1 + 1, :].copy()
        crop_alpha = alpha[cy0 : cy1 + 1, cx0 : cx1 + 1]
        crop[:, :, 3] = crop_alpha

        out_name = f"{prefix}-dish-{idx:02d}.png"
        out_path = output_dir / out_name
        Image.fromarray(crop, mode="RGBA").save(out_path)

        exported.append(
            {
                "id": f"{prefix}-dish-{idx:02d}",
                "image": f"assets/images/dishes/{out_name}",
                "source": image_path.name,
                "bbox": {"x0": int(cx0), "y0": int(cy0), "x1": int(cx1), "y1": int(cy1)},
                "area": int(area),
            }
        )

    return exported


def main() -> None:
    parser = argparse.ArgumentParser(description="Slice meal board images into transparent dish PNGs.")
    parser.add_argument(
        "--inputs",
        nargs="+",
        required=True,
        help="Input PNG files in board order.",
    )
    parser.add_argument(
        "--output-dir",
        required=True,
        help="Output directory for dish PNG files.",
    )
    parser.add_argument(
        "--manifest",
        required=True,
        help="Output JSON manifest path.",
    )
    parser.add_argument("--tolerance", type=float, default=28.0, help="Background color tolerance.")
    parser.add_argument("--min-area", type=int, default=9000, help="Minimum foreground component area.")
    parser.add_argument("--padding", type=int, default=8, help="Padding around each crop box.")
    args = parser.parse_args()

    output_dir = Path(args.output_dir)
    all_assets: list[dict[str, Any]] = []

    for idx, in_path in enumerate(args.inputs, start=1):
        image_path = Path(in_path)
        prefix = f"board-{idx:02d}"
        exported = export_components(
            image_path=image_path,
            output_dir=output_dir,
            tolerance=args.tolerance,
            min_area=args.min_area,
            padding=args.padding,
            prefix=prefix,
        )
        all_assets.extend(exported)

    manifest = {
        "version": "1.0.0",
        "generator": "docs/tools/slice_meal_board.py",
        "assets": all_assets,
        "notes": "Auto-generated transparent dish cutouts. Update category mapping in dish-map.json.",
    }

    manifest_path = Path(args.manifest)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest_path.write_text(json.dumps(manifest, indent=2) + "\n", encoding="utf-8")

    print(f"Exported {len(all_assets)} dishes to {output_dir}")
    print(f"Wrote manifest: {manifest_path}")


if __name__ == "__main__":
    main()
