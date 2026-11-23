#!/usr/bin/env python3
"""Technical completeness of GPT-owned film art, not artistic qualification.

Usage: python scripts/validate_film_art_package.py /path/to/project

Checks actual pixels, receipts, identities, exhaustive contiguous shot frame
coverage, event states and transition proof files. It cannot establish whether
an image matches the intended style or whether moving footage feels good.
"""

import argparse
import hashlib
import json
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from PIL import Image


STAGE_KEYS = (
    "story_truth", "experience", "visual_inventions", "world_direction", "shots",
    "shot_map", "handoffs", "continuity", "narration", "voice_cues", "sound_events",
    "visual_bible", "identities", "asset_dependencies", "art_ledger",
    "registered_views", "frame_score", "camera_attention", "render_instructions",
    "production_status", "direction_review", "authority", "learning",
)
SHOT_KEYS = (
    "id", "viewer_before", "viewer_after", "trigger",
    "causal_action", "attention_path", "camera_path", "experience",
    "outgoing_handoff", "required_assets", "states", "track_file",
)
STATE_KEYS = ("entry", "action", "contact", "consequence", "exit")
TRANSITION_KEYS = (
    "from", "to", "out", "middle", "in", "shared_anchor",
    "handoff_mechanism", "required_assets", "assembly_proof",
)
ASSET_KINDS = {
    "character_master", "pose", "world_plate", "clean_underpaint", "prop", "diagram",
    "ui", "type", "occluder", "alpha_mask", "effect", "transition_state", "keyview",
}
APPROVED_ASSET_STATES = {"GENERATED_AND_REVIEWED", "REPAIRED_AND_REVIEWED", "ASSEMBLY_PROVED"}
RASTER_SUFFIXES = {".png", ".jpg", ".jpeg", ".webp", ".tif", ".tiff"}


def nonempty(value):
    return isinstance(value, (str, list, dict)) and bool(value)


def digest(path):
    result = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            result.update(chunk)
    return result.hexdigest()


def local_file(root, relative, errors, label):
    if not isinstance(relative, str) or not relative.strip():
        errors.append(f"{label}: missing relative file path")
        return None
    candidate = Path(relative)
    if candidate.is_absolute() or ".." in candidate.parts:
        errors.append(f"{label}: path must be within package: {relative}")
        return None
    full = (root / candidate).resolve()
    if not full.is_relative_to(root.resolve()):
        errors.append(f"{label}: path escapes package: {relative}")
        return None
    if not full.is_file() or full.stat().st_size == 0:
        errors.append(f"{label}: missing or empty file: {relative}")
        return None
    return full


def image_pixels(path, errors, label, require_alpha=False):
    try:
        if path.suffix.lower() in RASTER_SUFFIXES:
            with Image.open(path) as im:
                im.load()
                if im.width < 8 or im.height < 8:
                    errors.append(f"{label}: implausibly tiny image {im.width}x{im.height}")
                if require_alpha:
                    alpha = im.getchannel("A") if "A" in im.getbands() else None
                    if alpha is None or alpha.getextrema() == (255, 255):
                        errors.append(f"{label}: true transparency required but absent")
        elif path.suffix.lower() == ".svg":
            root = ET.parse(path).getroot()
            if not root.tag.endswith("svg") or len(root) == 0:
                errors.append(f"{label}: invalid or empty SVG")
            if require_alpha:
                errors.append(f"{label}: SVG alpha cannot be automatically verified; supply inspected RGBA")
        else:
            errors.append(f"{label}: unsupported visible art format: {path.suffix}")
    except (OSError, ValueError, ET.ParseError) as exc:
        errors.append(f"{label}: art cannot be decoded: {exc}")


def check_required(record, keys, errors, name):
    if not isinstance(record, dict):
        errors.append(f"{name}: expected object")
        return False
    for key in keys:
        if not nonempty(record.get(key)):
            errors.append(f"{name}.{key}: missing or empty")
    return True


def validate(root):
    root = Path(root).resolve()
    errors = []
    manifest_path = local_file(root, "handoff/ART_AND_MOTION_MANIFEST.json", errors, "manifest")
    if manifest_path is None:
        return errors
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (UnicodeError, ValueError) as exc:
        return [f"manifest: invalid JSON: {exc}"]
    if not isinstance(manifest, dict):
        return ["manifest: expected object"]
    if manifest.get("schema_version") != 1:
        errors.append("manifest: schema_version must be 1")
    if manifest.get("mode") != "COMPLETE_FILM_ART_PACKAGE":
        errors.append("manifest: mode must be COMPLETE_FILM_ART_PACKAGE")
    if not nonempty(manifest.get("project_id")):
        errors.append("manifest: project_id missing")
    if manifest.get("fps") != 60:
        errors.append("manifest: require actual frame score at 60 fps")
    frame_count = manifest.get("total_frames")
    if not isinstance(frame_count, int) or isinstance(frame_count, bool) or frame_count <= 0:
        errors.append("manifest: total_frames must be a positive integer")
        frame_count = 0
    if manifest.get("status") != "READY_FOR_CLAUDE_RENDER":
        errors.append("manifest: art package is still PARTIAL_ART_PACKAGE; do not claim render-ready")

    stage_files = manifest.get("stage_files", {})
    if not isinstance(stage_files, dict):
        errors.append("stage_files: expected object")
        stage_files = {}
    for key in STAGE_KEYS:
        local_file(root, stage_files.get(key), errors, f"stage_files.{key}")

    shots = manifest.get("shots", [])
    if not isinstance(shots, list) or not shots:
        errors.append("shots: no frame-score shots supplied")
        shots = []
    shot_ids = set()
    ordered = []
    for i, shot in enumerate(shots):
        name = f"shots[{i}]"
        if not check_required(shot, SHOT_KEYS, errors, name):
            continue
        shot_id = shot.get("id")
        if shot_id in shot_ids:
            errors.append(f"{name}: duplicate id {shot_id}")
        shot_ids.add(shot_id)
        start, end = shot.get("start"), shot.get("end")
        if any(not isinstance(v, int) or isinstance(v, bool) for v in (start, end)) or start < 0 or end <= start:
            errors.append(f"{name}: invalid integer frame interval [{start}, {end})")
        else:
            ordered.append((start, end, shot_id))
        states = shot.get("states", {})
        if not isinstance(states, dict):
            errors.append(f"{name}.states: must be object")
        else:
            for key in STATE_KEYS:
                if not isinstance(states.get(key), list) or not states[key]:
                    errors.append(f"{name}.states.{key}: must reference actual art for this event")
        track_path = local_file(root, shot.get("track_file"), errors, f"{name}.track_file")
        if track_path:
            try:
                track = json.loads(track_path.read_text(encoding="utf-8"))
                if not isinstance(track, dict) or track.get("frame_start") != start or track.get("frame_end") != end:
                    errors.append(f"{name}: track frame range differs from shot")
                elif not nonempty(track.get("camera_keyframes")) or not nonempty(track.get("attention_cues")) or not nonempty(track.get("asset_tracks")):
                    errors.append(f"{name}: track missing camera, gaze/attention or visible-asset timing")
            except (UnicodeError, ValueError) as exc:
                errors.append(f"{name}: track not usable JSON: {exc}")

    ordered.sort()
    cursor = 0
    for start, end, sid in ordered:
        if start != cursor:
            errors.append(f"frame coverage: gap or overlap before {sid}; expected start {cursor}, got {start}")
        cursor = end
    if cursor != frame_count:
        errors.append(f"frame coverage: ends at {cursor}, expected {frame_count}")

    assets = manifest.get("assets", [])
    if not isinstance(assets, list) or not assets:
        errors.append("assets: no actual artwork files")
        assets = []
    asset_ids = set()
    parents = {}
    for i, asset in enumerate(assets):
        name = f"assets[{i}]"
        if not check_required(asset, ("id", "file", "kind", "status", "sha256", "source_job", "inspection", "uses"), errors, name):
            continue
        aid = asset["id"]
        if aid in asset_ids:
            errors.append(f"{name}: duplicate asset id {aid}")
        asset_ids.add(aid)
        parents[aid] = asset.get("parent_id")
        if asset["kind"] not in ASSET_KINDS:
            errors.append(f"{name}: unknown kind {asset['kind']}")
        if asset["status"] not in APPROVED_ASSET_STATES:
            errors.append(f"{name}: asset not generated and reviewed: {asset['status']}")
        for use in asset.get("uses", []):
            if use not in shot_ids:
                errors.append(f"{name}: uses unknown shot {use}")
        for label in ("source_job", "inspection"):
            local_file(root, asset.get(label), errors, f"{name}.{label}")
        art_path = local_file(root, asset["file"], errors, f"{name}.file")
        if art_path is not None:
            image_pixels(art_path, errors, name, require_alpha=asset.get("alpha_required", False))
            actual_hash = digest(art_path)
            if asset["sha256"] != actual_hash:
                errors.append(f"{name}: SHA256 differs from actual art file")
    for aid, parent in parents.items():
        if parent is not None and parent not in asset_ids:
            errors.append(f"asset {aid}: missing canonical/parent asset {parent}")
    for aid in parents:
        visited = set()
        current = aid
        while current in parents and parents[current] is not None:
            if current in visited:
                errors.append(f"asset {aid}: circular parent lineage")
                break
            visited.add(current)
            current = parents[current]

    for i, shot in enumerate(shots):
        if not isinstance(shot, dict):
            continue
        required = shot.get("required_assets", [])
        if isinstance(required, list):
            for aid in required:
                if aid not in asset_ids:
                    errors.append(f"shots[{i}]: required art missing: {aid}")
            for key in STATE_KEYS:
                for aid in (shot.get("states", {}) or {}).get(key, []):
                    if aid not in asset_ids:
                        errors.append(f"shots[{i}].states.{key}: missing art {aid}")

    masters = manifest.get("identity_masters", [])
    if not isinstance(masters, list):
        errors.append("identity_masters: must be array")
        masters = []
    if any(a.get("kind") in {"character_master", "pose"} for a in assets if isinstance(a, dict)) and not masters:
        errors.append("identity_masters: characters/poses have no locked canonical identity")
    for master in masters:
        if not check_required(master, ("subject_id", "asset_id"), errors, "identity_masters[]"):
            continue
        if master["asset_id"] not in asset_ids:
            errors.append(f"identity_masters: undeclared master image {master['asset_id']}")

    transitions = manifest.get("transitions", [])
    if not isinstance(transitions, list):
        errors.append("transitions: must be an array")
        transitions = []
    keys = set()
    for i, transition in enumerate(transitions):
        name = f"transitions[{i}]"
        if not check_required(transition, TRANSITION_KEYS, errors, name):
            continue
        pair = (transition["from"], transition["to"])
        if pair in keys:
            errors.append(f"{name}: duplicate transition {pair}")
        keys.add(pair)
        for aid in transition.get("required_assets", []):
            if aid not in asset_ids:
                errors.append(f"{name}: missing transition art {aid}")
        proof = local_file(root, transition["assembly_proof"], errors, f"{name}.assembly_proof")
        if proof:
            image_pixels(proof, errors, f"{name}.assembly_proof")
    for left, right in zip(shots, shots[1:]):
        if isinstance(left, dict) and isinstance(right, dict):
            pair = (left.get("id"), right.get("id"))
            if pair not in keys:
                errors.append(f"transitions: missing handoff/assembly evidence {pair[0]} -> {pair[1]}")

    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("package_root", type=Path)
    args = parser.parse_args()
    errors = validate(args.package_root)
    if errors:
        print(f"PARTIAL / INVALID: {len(errors)} technical problem(s)")
        for issue in errors:
            print("-", issue)
        sys.exit(1)
    print("TECHNICAL PACKAGE COMPLETE: inspected files, intervals, IDs and receipts present")
    print("NOT AN ARTISTIC APPROVAL: inspect pixels, 60-fps motion and continuity separately")


if __name__ == "__main__":
    main()
