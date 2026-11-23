#!/usr/bin/env python3
"""Validate and summarize full-HD original-frame numeric visual evidence.

This report must not be interpreted as frame-by-frame model artistic sight.
"""

import argparse
import json
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FIELDS = ["YAVG", "YLOW", "YHIGH", "UAVG", "VAVG", "SATAVG", "HUEAVG", "YDIF", "UDIF", "VDIF"]
META_KEYS = [f"lavfi.signalstats.{k}" for k in FIELDS] + ["lavfi.scd.score", "lavfi.scd.mafd"]


def parse_metadata(path):
    rows = []
    seen_index = -1
    values = {}
    with path.open("r", encoding="utf-8", errors="replace") as source:
        for line in source:
            line = line.strip()
            if line.startswith("frame:"):
                if seen_index >= 0:
                    rows.append([values.get(key, np.nan) for key in META_KEYS])
                value = int(line.split()[0].removeprefix("frame:"))
                if value != seen_index + 1:
                    raise ValueError(f"Non-contiguous frame index in {path}: {value} after {seen_index}")
                seen_index = value
                values = {}
            elif "=" in line:
                key, value = line.split("=", 1)
                if key in META_KEYS:
                    values[key] = float(value)
    if seen_index >= 0:
        rows.append([values.get(key, np.nan) for key in META_KEYS])
    matrix = np.asarray(rows, dtype=np.float32)
    if not np.isfinite(matrix).all():
        raise ValueError(f"Missing or nonfinite native metadata value in {path}")
    return matrix


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--scan-dir", required=True, type=Path, help="--out-dir from replay_native_full_hd_scan.py")
    parser.add_argument("--summary-out", required=True, type=Path, help="Full JSON report path")
    parser.add_argument("--registry", type=Path, default=ROOT / "references/FULL_FILM_SOURCE_REGISTRY.json")
    args = parser.parse_args()
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    summary = {}
    frames_total = 0
    for film in registry["source_files"]:
        film_dir = args.scan_dir / film["id"]
        verified = json.loads((film_dir / "NATIVE_PIXEL_SCAN_VERIFIED.json").read_text())
        matrix = parse_metadata(film_dir / "NATIVE_PIXEL_METADATA.txt")
        if matrix.shape != (film["frames"], len(META_KEYS)):
            raise ValueError(f"{film['id']}: native matrix shape mismatch {matrix.shape}")
        frames_total += len(matrix)
        np.savez_compressed(film_dir / "NATIVE_1080P_TEMPORAL_FEATURES.npz", feature_names=np.asarray(META_KEYS), features=matrix)
        vals = {}
        for column, field in enumerate(META_KEYS):
            series = matrix[:, column]
            vals[field] = {"mean": round(float(series.mean()), 3), "p10": round(float(np.percentile(series, 10)), 3), "median": round(float(np.median(series)), 3), "p90": round(float(np.percentile(series, 90)), 3), "max": round(float(series.max()), 3)}
        change = matrix[:, META_KEYS.index("lavfi.scd.score")]
        luma_change = matrix[:, META_KEYS.index("lavfi.signalstats.YDIF")]
        # These describe changing *pixels*, not how many illustrated bodies or
        # separate layers were animated. A static background plus moving actor
        # can yield a low whole-frame average, as can a dark color field.
        temporal = {
            "native_luma_near_unchanged_le_0_01_fraction": round(float((luma_change <= 0.01).mean()), 5),
            "native_luma_low_change_le_0_25_fraction": round(float((luma_change <= 0.25).mean()), 5),
            "native_luma_strong_change_ge_3_fraction": round(float((luma_change >= 3.0).mean()), 5),
            "per_frame_pixel_change_is_not_a_per_object_animation_census": True,
        }
        indices = np.argsort(change)[::-1]
        best = []
        for index in indices:
            if any(abs(int(index) - prev) < 90 for prev in best):
                continue
            best.append(int(index))
            if len(best) == 16:
                break
        summary[film["id"]] = {"frames": len(matrix), "native_dimensions": verified["frame_dimensions"], "metrics": vals, "temporal_pixel_change": temporal, "top_separated_change_frame_indices": best, "understanding_claim": "Native pixel measurements, not human semantic comprehension"}
        print(f"{film['id']}: summarized {len(matrix):,} full-HD frames", flush=True)
    if frames_total != 242095:
        raise ValueError(f"Total mismatch: {frames_total}")
    report = {"status": "COMPLETE_NATIVE_PIXEL_MEASUREMENT_NOT_EXHAUSTIVE_SEMANTIC_INTERPRETATION", "five_films": summary, "frame_total": frames_total, "scope": "Every source video frame measured on native 1920x1080 pixels by ffmpeg signalstats and scdet; targeted native images required for transfer observations; no claim of visual-semantic comprehension of each of the 242,095 scenes."}
    args.summary_out.parent.mkdir(parents=True, exist_ok=True)
    args.summary_out.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(f"VERIFIED ALL {frames_total:,} original-HD frames", flush=True)


if __name__ == "__main__":
    main()
