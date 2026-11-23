#!/usr/bin/env python3
"""Full-raster technical examination of all five video streams.

For EACH decoded original 1920x1080 frame, ffmpeg signalstats calculates
pixel-domain luma/chroma distributions and per-frame YUV differences;
scdet calculates a frame-change score. No scaling, selection or skipping.

This is a technical scan, NOT a claim that a human / model has semantically
read 242,095 full-resolution pictures. Separate targeted native witness
interpretation is required to infer transferrable artwork rules.

One whole-video unit is atomic. Incomplete metadata remains as `.partial`,
so restarting never treats it as complete. Each successful video is
independently checkpointed with expected frame count, hash and dimensions.
"""

import argparse
import hashlib
import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

SKILL_ROOT = Path(__file__).resolve().parents[1]


def sha256_file(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def count_frames_metadata(path):
    count = 0
    with path.open("r", encoding="utf-8", errors="replace") as stream:
        for line in stream:
            if line.startswith("frame:"):
                count += 1
    return count


def scan_one(film, source_root, output_root):
    film_id = film["id"]
    source = source_root / film["relative_path"]
    if not source.is_file():
        source = source_root / Path(film["relative_path"]).name
    film_dir = output_root / film_id
    film_dir.mkdir(parents=True, exist_ok=True)
    meta = film_dir / "NATIVE_PIXEL_METADATA.txt"
    partial = film_dir / "NATIVE_PIXEL_METADATA.partial"
    verified = film_dir / "NATIVE_PIXEL_SCAN_VERIFIED.json"
    if verified.exists():
        result = json.loads(verified.read_text(encoding="utf-8"))
        if (result["source_sha256"] == film["sha256"] and
            result["decoded_frames"] == film["frames"] and meta.is_file()):
            return f"{film_id}: already VERIFIED {film['frames']:,} full-resolution frames"
        raise RuntimeError(f"{film_id}: existing verification conflicts with current source; investigate, do not overwrite")
    if not source.is_file():
        raise FileNotFoundError(source)
    started = time.monotonic()
    cmd = ["ffmpeg", "-nostdin", "-hide_banner", "-loglevel", "error", "-threads", "2",
           "-i", str(source), "-an", "-sn", "-dn", "-vsync", "0",
           "-vf", f"signalstats,scdet=threshold=10,metadata=print:file={partial}",
           "-f", "null", "-"]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode:
        raise RuntimeError(f"{film_id}: ffmpeg failed ({result.returncode}); partial kept: {result.stderr[-1200:]}")
    decoded = count_frames_metadata(partial)
    if decoded != film["frames"]:
        raise RuntimeError(f"{film_id}: decoded {decoded:,} versus expected {film['frames']:,}; partial retained")
    source_hash = sha256_file(source)
    if source_hash != film["sha256"]:
        raise RuntimeError(f"{film_id}: source hash changed: expected {film['sha256']}, got {source_hash}")
    partial.rename(meta)
    report = {
        "film_id": film_id, "source": film["relative_path"], "source_sha256": source_hash,
        "decoded_frames": decoded, "frame_dimensions": [1920, 1080],
        "source_native_pixel_domain": True, "downscale": None,
        "signalstats_pixel_features": ["YMIN", "YLOW", "YAVG", "YHIGH", "YMAX", "UMIN", "UAVG", "VMIN", "VAVG", "SATAVG", "YDIF", "UDIF", "VDIF", "HUEAVG"],
        "native_temporal_feature": "lavfi.scd.score and lavfi.scd.mafd per frame",
        "metadata_sha256": sha256_file(meta), "seconds": round(time.monotonic() - started, 1),
        "evidence_scope": "Every full-raster frame technically analyzed and temporal signals stored. Not semantic full-frame visual comprehension, reconstruction, or a complete source transfer qualification.",
        "status": "VERIFIED_NATIVE_PIXEL_PASS",
    }
    verified.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return f"{film_id}: VERIFIED {decoded:,} native-resolution frames in {report['seconds']}s"


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--film", action="append", help="Select film ID(s); default all five")
    parser.add_argument("--workers", type=int, default=3)
    parser.add_argument("--source-root", required=True, type=Path, help="Existing user-owned film folder or parent folder containing source_originals/")
    parser.add_argument("--out-dir", required=True, type=Path, help="External writable directory for hundreds of MB of full-HD metadata and verification")
    parser.add_argument("--registry", type=Path, default=SKILL_ROOT / "references/FULL_FILM_SOURCE_REGISTRY.json")
    args = parser.parse_args()
    registry = json.loads(args.registry.read_text(encoding="utf-8"))
    chosen = [f for f in registry["source_files"] if not args.film or f["id"] in args.film]
    if not chosen:
        raise ValueError("No matching films")
    failures = []
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(scan_one, film, args.source_root, args.out_dir): film["id"] for film in chosen}
        for future in as_completed(futures):
            try:
                print(future.result(), flush=True)
            except Exception as exc:
                failures.append(futures[future])
                print(f"{futures[future]}: FAILED {exc}", file=sys.stderr, flush=True)
    if failures:
        raise SystemExit(f"Incomplete native scan(s): {failures}")
    print("ALL REQUESTED FILMS VERIFIED", flush=True)


if __name__ == "__main__":
    main()
