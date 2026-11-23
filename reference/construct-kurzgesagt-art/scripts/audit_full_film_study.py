#!/usr/bin/env python3
"""Audit retained five-film metadata and selected witness strips.

Checks the 1-fps survey's *source inventory* and 66-frame/22-strip witness
index. These engineering checks cannot prove aesthetic interpretation or
full-fps per-frame semantic inspection.
"""

import argparse
import hashlib
import json
from collections import defaultdict
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--originals-root", type=Path, help="Optional original source root; verify actual MP4 SHA256s")
    args = parser.parse_args()
    registry = json.loads((ROOT / "references/FULL_FILM_SOURCE_REGISTRY.json").read_text())
    witnesses = json.loads((ROOT / "references/NATIVE_WITNESS_MANIFEST.json").read_text())
    errors = []
    rows = registry["source_files"]
    if len(rows) != 5 or len({s["id"] for s in rows}) != 5:
        errors.append("Expected five unique full source originals")
    if sum(s["frames"] for s in rows) != registry["total_video_frames_reported_by_streams"]:
        errors.append("Source frame counts do not total registry count")
    if abs(sum(s["duration_seconds"] for s in rows) - registry["total_duration_seconds"]) > 0.001:
        errors.append("Source durations do not sum to registry length")
    if args.originals_root:
        for s in rows:
            path = args.originals_root / s["relative_path"]
            if not path.is_file():
                errors.append(f"Missing original MP4: {s['id']}")
                continue
            digest = hashlib.sha256()
            with path.open("rb") as stream:
                for chunk in iter(lambda: stream.read(4 * 1024 * 1024), b""):
                    digest.update(chunk)
            if digest.hexdigest() != s["sha256"]:
                errors.append(f"MP4 SHA mismatch: {s['id']}")
    by_group = defaultdict(list)
    for w in witnesses:
        by_group[(w["film"], w["method"])].append(w)
        if w.get("dimensions") != [1920, 1080]:
            errors.append(f"Native witness not 1080p: {w['film']} {w['method']}")
        if not isinstance(w.get("source_time_s"), (int, float)):
            errors.append("Witness missing exact source timestamp")
    if len(witnesses) != 66 or len(by_group) != 22:
        errors.append(f"Expected 66 native witness index entries in 22 three-frame strips, found {len(witnesses)} in {len(by_group)}")
    for (film, method), group in by_group.items():
        if len(group) != 3:
            errors.append(f"Temporal group not three frames: {film} {method}")
        strip = ROOT / "assets" / "full_film_witnesses" / f"{film}_{method}_temporal_strip.jpg"
        if not strip.is_file():
            errors.append(f"Missing retained temporal witness strip: {strip.name}")
            continue
        with Image.open(strip) as im:
            if im.width != 1920 or im.height != 408:
                errors.append(f"Unexpected retained strip dimensions: {strip.name}, {im.size}")
    print(json.dumps({
        "status": "PASS" if not errors else "FAIL",
        "source_films": len(rows),
        "nominal_total_encoded_frames": sum(s["frames"] for s in rows),
        "time_seconds": registry["total_duration_seconds"],
        "indexed_native_frames": len(witnesses),
        "retained_annotated_strips": len(by_group),
        "mp4_sha256_rechecked_this_run": bool(args.originals_root),
        "does_not_prove": "all-frame artistic understanding, motion reconstruction or exact output style equivalence",
        "errors": errors,
    }, indent=2))
    return 2 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
