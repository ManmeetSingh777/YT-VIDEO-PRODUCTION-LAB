#!/usr/bin/env python3
"""Audit all 15 decoded intervals for contiguous *indexed* frame witnesses.

Engineering integrity only: presence of thumbnail bytes is NOT semantic
inspection of original visual art, motion, audio or a qualified method.
"""

import argparse
import json
from collections import Counter
from pathlib import Path


def audit(base: Path) -> dict:
    manifest_path = base / "SOURCE_DECODE_MANIFEST.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    rows = []
    total_positions = 0
    errors = []
    for interval in manifest["sequences"]:
        sid = interval["id"]
        folder = base / "witnesses" / sid
        ledger_path = folder / "FRAME_LEDGER.json"
        if not ledger_path.is_file():
            errors.append(f"{sid}: ledger absent")
            continue
        ledger = json.loads(ledger_path.read_text(encoding="utf-8"))
        positions = [frame["frame"] for frame in ledger["frames"]]
        expected = list(range(ledger["start_frame"], ledger["last_decoded_frame"] + 1))
        missing = [frame["frame"] for frame in ledger["frames"] if not (folder / frame["thumbnail"]).is_file()]
        unknown_native = [
            n
            for n in ledger["native_witness_frames"]
            if not ((folder / f"native_f{n:06d}.jpg").is_file() or (folder / f"native_change_f{n:06d}.jpg").is_file())
        ]
        duplicate = sorted(n for n, count in Counter(positions).items() if count > 1)
        if positions != expected:
            errors.append(f"{sid}: incomplete/out-of-order position series")
        if missing:
            errors.append(f"{sid}: {len(missing)} missing thumbnail files")
        if unknown_native:
            errors.append(f"{sid}: native-witness names not found for {unknown_native}")
        if duplicate:
            errors.append(f"{sid}: duplicate indexed frame positions {duplicate}")
        if ledger["decoded_frame_count"] != len(positions):
            errors.append(f"{sid}: decoded count disagrees with index")
        rows.append({
            "interval": sid,
            "first_frame": positions[0] if positions else None,
            "last_frame": positions[-1] if positions else None,
            "indexed_frames": len(positions),
            "missing_thumbnails": len(missing),
            "listed_native_witnesses": len(ledger["native_witness_frames"]),
            "not_claimed": "native-resolution semantic inspection of every frame",
        })
        total_positions += len(positions)

    if total_positions != 3492:
        errors.append(f"Frame-position sum {total_positions} differs from expected 3492")
    return {
        "engineering_integrity": "PASS" if not errors else "FAIL",
        "intervals_audited": len(rows),
        "total_indexed_positions": total_positions,
        "per_interval": rows,
        "errors": errors,
        "semantic_frame_understanding": "NOT_PROVEN_BY_THIS_AUDIT",
        "construction_method_transfer": "NOT_PROVEN_BY_THIS_AUDIT",
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("decoded_root", type=Path, help="Directory containing SOURCE_DECODE_MANIFEST.json and witnesses/")
    parser.add_argument("--out", type=Path)
    args = parser.parse_args()
    result = audit(args.decoded_root)
    report = json.dumps(result, indent=2)
    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        args.out.write_text(report + "\n", encoding="utf-8")
    print(report)
    return 0 if result["engineering_integrity"] == "PASS" else 2


if __name__ == "__main__":
    raise SystemExit(main())
