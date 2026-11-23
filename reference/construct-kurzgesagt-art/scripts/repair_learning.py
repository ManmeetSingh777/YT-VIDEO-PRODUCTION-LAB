#!/usr/bin/env python3
"""Turn an observed successful pixel repair into future first-pass instructions.

The observed repair is judged by the artist/director. This utility verifies
image ancestry, scopes the learned operation, and compiles matching rules into
subsequent image requests. It does not automatically edit the installed skill
or claim that one image establishes a universal studio rule.

Examples:
  python scripts/repair_learning.py init PROJECT_ROOT
  python scripts/repair_learning.py record PROJECT_ROOT LESSON.json
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image


MEMORY_RELATIVE_PATH = "learning/REPAIR_MEMORY.json"
SCOPES = {"LOCAL_IDENTITY", "CONDITIONAL_FAMILY"}
VALID_STATUSES = {"REPAIR_DEMONSTRATED", "TRANSFER_TESTED"}


def sha256(path):
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for piece in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(piece)
    return h.hexdigest()


def required_text(record, key):
    value = record.get(key)
    if not isinstance(value, str) or len(value.strip()) < 12:
        raise ValueError(f"{key}: requires a specific, actionable explanation")
    return value.strip()


def image_in_project(project_root, relative, label):
    if not isinstance(relative, str) or not relative.strip():
        raise ValueError(f"{label}: missing project-relative image path")
    path = Path(relative)
    if path.is_absolute() or ".." in path.parts:
        raise ValueError(f"{label}: image must be inside the project")
    full = (project_root / path).resolve()
    if not full.is_relative_to(project_root.resolve()) or not full.is_file():
        raise ValueError(f"{label}: observed image does not exist: {relative}")
    with Image.open(full) as frame:
        frame.load()
        if frame.width < 16 or frame.height < 16:
            raise ValueError(f"{label}: cannot learn from an implausibly small image")
    return sha256(full)


def make_memory():
    return {"version": 1, "rules": []}


def validate_memory(memory):
    if not isinstance(memory, dict) or memory.get("version") != 1 or not isinstance(memory.get("rules"), list):
        raise ValueError("repair memory must have version=1 and rules array")
    ids = set()
    for rule in memory["rules"]:
        if not isinstance(rule, dict):
            raise ValueError("repair memory rule must be an object")
        rid = rule.get("rule_id")
        if not isinstance(rid, str) or not rid or rid in ids:
            raise ValueError(f"missing or duplicate repair rule id: {rid}")
        ids.add(rid)
        if rule.get("scope") not in SCOPES:
            raise ValueError(f"{rid}: unknown repair scope")
        if rule.get("status") not in VALID_STATUSES:
            raise ValueError(f"{rid}: repair is not demonstrated")
        applies = rule.get("applies_when")
        if not isinstance(applies, dict) or not applies.get("family"):
            raise ValueError(f"{rid}: explicit construction family needed")
        if rule["scope"] == "LOCAL_IDENTITY" and not applies.get("subject_id"):
            raise ValueError(f"{rid}: local repair requires a canonical subject identity")
        if rule["scope"] == "CONDITIONAL_FAMILY" and applies.get("subject_id"):
            raise ValueError(f"{rid}: generalizable rule cannot hard-code one character identity")
        ops = rule.get("positive_construction_ops")
        if not isinstance(ops, list) or not ops or any(not isinstance(op, str) or len(op.strip()) < 12 for op in ops):
            raise ValueError(f"{rid}: requires specific positive drawing/generation operations")
        for key in ("root_cause", "first_request_change", "source_contrast", "observed_improvement", "regression_boundary"):
            required_text(rule, key)
        if rule.get("before_sha256") == rule.get("after_sha256"):
            raise ValueError(f"{rid}: observed image and repaired output must be distinct")
        for key in ("before_sha256", "after_sha256"):
            if not isinstance(rule.get(key), str) or len(rule[key]) != 64:
                raise ValueError(f"{rid}: missing real image hash {key}")
    return memory


def load_memory(path):
    path = Path(path)
    if not path.is_file():
        raise ValueError(f"repair memory missing: {path}; initialize it before the first film ArtJob")
    return validate_memory(json.loads(path.read_text(encoding="utf-8")))


def record(project_root, lesson):
    project_root = Path(project_root).resolve()
    if not isinstance(lesson, dict):
        raise ValueError("lesson must be JSON object")
    if lesson.get("status") not in VALID_STATUSES:
        raise ValueError("successful repair must be observed before lesson is recorded")
    before = image_in_project(project_root, lesson.get("before_path"), "before")
    after = image_in_project(project_root, lesson.get("after_path"), "after")
    candidate = dict(lesson)
    candidate["before_sha256"] = before
    candidate["after_sha256"] = after
    validate_memory({"version": 1, "rules": [candidate]})
    memory_path = project_root / MEMORY_RELATIVE_PATH
    memory = load_memory(memory_path)
    existing = {r["rule_id"]: r for r in memory["rules"]}
    if candidate["rule_id"] in existing:
        raise ValueError(f"repair rule ID already exists: {candidate['rule_id']}; revise with a new versioned ID")
    memory["rules"].append(candidate)
    memory_path.write_text(json.dumps(memory, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return candidate


def matching_rules(memory, context):
    validate_memory(memory)
    if not isinstance(context, dict):
        raise ValueError("first-pass job must supply learning_context")
    for key in ("family", "view", "world_class", "subject_id"):
        if not isinstance(context.get(key), str) or not context[key].strip():
            raise ValueError(f"learning_context.{key}: must name the new asset's actual construction conditions")
    matches = []
    for rule in memory["rules"]:
        conditions = rule["applies_when"]
        if any(conditions.get(k, "*") not in ("*", context[k]) for k in ("family", "view", "world_class")):
            continue
        if rule["scope"] == "LOCAL_IDENTITY" and conditions["subject_id"] != context["subject_id"]:
            continue
        matches.append(rule)
    return matches


def first_pass_learning_block(memory, context):
    rules = matching_rules(memory, context)
    if not rules:
        return "", []
    lines = [
        "APPLICABLE OBSERVED REPAIR LESSONS — APPLY AS POSITIVE CONSTRUCTION BEFORE INVENTING ANY IMAGE DETAIL.",
        "Each operation is conditional on this asset's geometry/view/world; never copy a previous scene or subject.",
    ]
    for rule in rules:
        lines.append(f"{rule['rule_id']} [{rule['scope']} / {rule['status']}]:")
        lines.append("ACTUAL ROOT CAUSE: " + rule["root_cause"])
        lines.append("CHANGE TO THE FIRST IMAGE REQUEST: " + rule["first_request_change"])
        for op in rule["positive_construction_ops"]:
            lines.append("DRAW/CONSTRUCT: " + op)
        lines.append("WHEN NOT TO GENERALIZE: " + rule["regression_boundary"])
    lines.append("Continue with the scene-specific causal construction and source references below.\n")
    return "\n".join(lines), [r["rule_id"] for r in rules]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="action", required=True)
    start = sub.add_parser("init")
    start.add_argument("project_root", type=Path)
    add = sub.add_parser("record")
    add.add_argument("project_root", type=Path)
    add.add_argument("lesson_json", type=Path)
    args = parser.parse_args()
    try:
        path = args.project_root.resolve() / MEMORY_RELATIVE_PATH
        if args.action == "init":
            if path.exists():
                load_memory(path)
                print(f"EXISTING_REPAIR_MEMORY_PRESERVED: {path}")
            else:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(json.dumps(make_memory(), indent=2) + "\n", encoding="utf-8")
                print(f"REPAIR_MEMORY_INITIALIZED: {path}")
        else:
            lesson = json.loads(args.lesson_json.read_text(encoding="utf-8"))
            saved = record(args.project_root, lesson)
            print(f"REPAIR_LEARNED_FOR_NEXT_MATCHING_FIRST_PASS: {saved['rule_id']}")
    except (OSError, ValueError, json.JSONDecodeError) as exc:
        print(f"REPAIR_LEARNING_BLOCKED: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
