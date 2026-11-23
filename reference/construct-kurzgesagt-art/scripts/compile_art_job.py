#!/usr/bin/env python3
"""Compile a concrete unfamiliar ArtJob into a rule-bearing provider prompt.

No provider is called here. A passed compile proves only that chosen source-derived
construction rules reached the text payload; it does not prove the model obeyed them.
"""

import argparse
import hashlib
import json
import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
OPERATIONS = ROOT / "references" / "STYLE_OPERATIONS.md"
FULL_FILM_METHODS = ROOT / "references" / "FULL_FILM_ROUTER_AND_METHODS.md"
WORLD_METHODS = ROOT / "references" / "WORLD_SYSTEM_CONSTRUCTION.md"
CONDITIONAL_METHODS = ROOT / "references" / "CONDITIONAL_PALETTE_SCALE_AND_ABSTRACTION.md"
MOLECULAR_METHODS = ROOT / "references" / "MOLECULAR_CONSTRUCTOR_F57_F80.md"
KNOWN_METHODS = {f"F{i:02d}" for i in range(1, 81)}
ALLOWED_MEDIA = {
    "WORLD", "MACRO", "SCHEMATIC", "MAP_OR_SCALE",
    "PORTAL_OR_SCREEN", "CINEMATIC_EFFECT", "EDITORIAL_OR_AD",
}
WORLD_CLASSES = {
    "SCENIC_NATURAL", "SCENIC_BUILT", "SCENIC_INTERIOR", "COSMIC_SCALE",
    "BIOLOGICAL_MICRO", "SCHEMATIC_NETWORK", "ABSTRACT_STAGE",
    "ABSTRACT_VOLUME", "NESTED_HABITAT", "PARALLEL_WORLDS",
}
WORLD_REQUIRED_TEXT = (
    "world_purpose", "substrate", "coord_system", "focal_read_test",
)
WORLD_REQUIRED_COLLECTIONS = (
    "regions", "parts", "relationships", "detail_generators",
    "material_ownership", "effect_ownership", "visibility_masks", "native_crop_tests",
    "source_only_witnesses", "content_noncopy_invariants", "allowed_subject_ids",
    "forbidden_extras",
)
MANDATORY_SECTIONS = {
    "original_content",
    "canvas",
    "method_bindings",
    "subject_graph",
    "world",
    "lighting",
    "manufacturing",
    "observable_negative_tests",
    "uncontrolled_high_impact_decisions",
}


def nonempty(value):
    if isinstance(value, str):
        return bool(value.strip())
    if isinstance(value, (list, dict)):
        return bool(value)
    return value is not None


def validate(job, strict=True):
    errors = []
    if not isinstance(job, dict):
        return ["Top-level ArtJob must be a JSON object"]
    for key in MANDATORY_SECTIONS:
        if key not in job:
            errors.append(f"Missing ArtJob section: {key}")
    if errors:
        return errors
    content = job["original_content"]
    if not isinstance(content, dict):
        errors.append("original_content must be an object")
    elif not all(nonempty(content.get(k)) for k in ("script_excerpt", "scene_goal", "new_subjects")):
        errors.append("Original script excerpt, scene goal and new subjects required")
    elif content.get("noncopy_source_content") is not True:
        errors.append("noncopy_source_content must be true")
    if not isinstance(job["subject_graph"], list) or not job["subject_graph"]:
        errors.append("subject_graph must define concrete subjects")
    else:
        for i, obj in enumerate(job["subject_graph"]):
            if not isinstance(obj, dict):
                errors.append(f"subject_graph[{i}] must be an object")
                continue
            for key in ("id", "family", "whole_silhouette", "view_dependent_parts", "attachment_and_contact", "surface_materials"):
                if not nonempty(obj.get(key)):
                    errors.append(f"subject_graph[{i}].{key} missing or empty")
    if not isinstance(job["method_bindings"], list) or not job["method_bindings"]:
        errors.append("Choose actual source-derived method_bindings")
    else:
        methods = set()
        for i, binding in enumerate(job["method_bindings"]):
            if not isinstance(binding, dict):
                errors.append(f"method_bindings[{i}] must be an object")
                continue
            mid = binding.get("method_id")
            if isinstance(mid, str):
                methods.add(mid)
            if not isinstance(mid, str) or mid not in KNOWN_METHODS:
                errors.append(f"Invalid method_id {mid}")
            for key in ("conditions", "source_witnesses", "invariant_transferred", "variation_required", "observable_verification"):
                if not nonempty(binding.get(key)):
                    errors.append(f"method_bindings[{i}].{key} missing")
        if any(isinstance(m, str) and m.startswith("F") and m[1:].isdigit()
               and 37 <= int(m[1:]) <= 50 for m in methods):
            world = job.get("world_system")
            if not isinstance(world, dict):
                errors.append("F37–F50 requires a machine-checkable world_system object")
            else:
                if world.get("world_class") not in WORLD_CLASSES:
                    errors.append("world_system.world_class must be a valid world class")
                for key in WORLD_REQUIRED_TEXT:
                    if not nonempty(world.get(key)):
                        errors.append(f"world_system.{key} missing")
                for key in WORLD_REQUIRED_COLLECTIONS:
                    if not isinstance(world.get(key), list) or not world[key]:
                        errors.append(f"world_system.{key} must be a nonempty list")
                # Capture the parent/connector graph: a generic descriptive
                # paragraph must not masquerade as an actual world construction.
                parts = world.get("parts", [])
                ids = set()
                if isinstance(parts, list) and parts:
                    ids = {p.get("id") for p in parts if isinstance(p, dict)}
                    if None in ids or len(ids) != len(parts):
                        errors.append("world_system.parts needs unique nonempty IDs")
                    for p in parts:
                        if not isinstance(p, dict) or not all(nonempty(p.get(k)) for k in ("id", "silhouette", "projection", "function")):
                            errors.append("world_system.parts requires id/silhouette/projection/function")
                            break
                    for edge in world.get("relationships", []) if isinstance(world.get("relationships"), list) else []:
                        if (not isinstance(edge, dict) or edge.get("from") not in ids
                                or edge.get("to") not in ids or not nonempty(edge.get("type"))):
                            errors.append("world_system.relationships endpoints must point to actual part IDs")
                            break
                if (isinstance(world.get("source_only_witnesses"), list)
                        and len(set(map(str, world["source_only_witnesses"]))) < 2):
                    errors.append("world_system requires >=2 unlike source-only witnesses")
                effects = world.get("effect_ownership", [])
                if isinstance(effects, list) and effects:
                    for effect in effects:
                        if (not isinstance(effect, dict) or not all(nonempty(effect.get(k)) for k in (
                            "owner", "kind", "allowed_region", "count_or_coverage_limit", "forbidden_regions"
                        ))):
                            errors.append("world_system.effect_ownership requires owner/kind/region/budget/forbidden regions")
                            break
                if isinstance(world.get("allowed_subject_ids"), list) and isinstance(parts, list):
                    if any(subject_id not in ids for subject_id in world["allowed_subject_ids"]):
                        errors.append("world_system.allowed_subject_ids must reference declared part IDs")
    if not isinstance(job["observable_negative_tests"], list) or not job["observable_negative_tests"]:
        errors.append("Observable negative conditions required")
    for group in ("world", "manufacturing", "lighting"):
        if not isinstance(job[group], dict) or not job[group]:
            errors.append(f"Missing functional {group} decisions")
    if "medium_tree" in job:
        media = job["medium_tree"]
        if not isinstance(media, list) or not media or any(m not in ALLOWED_MEDIA for m in media):
            errors.append("medium_tree must be a nonempty list of recognized scene media")
        if isinstance(media, list) and "EDITORIAL_OR_AD" in media and not job.get("editorial_reason"):
            errors.append("EDITORIAL_OR_AD must have an explicit editorial_reason to avoid sponsor contamination")
    if "temporal_plates" in job:
        plates = job["temporal_plates"]
        if not isinstance(plates, list) or not plates or not all(
            isinstance(p, dict) and nonempty(p.get("name")) and p.get("time_s") is not None
            for p in plates
        ):
            errors.append("temporal_plates must have named, timed states")
    if isinstance(job.get("medium_tree"), list) and "PORTAL_OR_SCREEN" in job["medium_tree"]:
        if not isinstance(job.get("viewport_layers"), list) or len(job["viewport_layers"]) < 3:
            errors.append("PORTAL_OR_SCREEN requires >=3 ordered viewport_layers (back/inner/front)")
    if strict and job["uncontrolled_high_impact_decisions"]:
        errors.append("Strict compile blocked: unresolved high-impact style decisions")
    return errors


def parse_rule_fragments():
    found = {}
    for source in (OPERATIONS, FULL_FILM_METHODS, WORLD_METHODS, CONDITIONAL_METHODS, MOLECULAR_METHODS):
        text = source.read_text(encoding="utf-8")
        sections = re.split(r"(?=^## F\d{2} — )", text, flags=re.MULTILINE)
        for section in sections:
            m = re.match(r"## (F\d{2}) — ", section)
            if m:
                found[m.group(1)] = section.strip()
    return found


def provider_rule_text(method_id, fragment):
    """Keep producing instructions, omit illustrative F49 JSON schema boilerplate.

    The actual validated world_system object is already included in the prompt;
    copying a long placeholder example can crowd the provider request and cause
    source/content ambiguity. The full F49 rule remains intact in its source.
    """
    if method_id == "F49":
        return re.sub(r"```json\n[\s\S]*?\n```\n", "[See the validated WORLD SYSTEM block above for the actual geometry and part graph.]\n", fragment, count=1)
    return fragment


def dump(obj):
    return json.dumps(obj, indent=2, ensure_ascii=False, sort_keys=True)


def compile_job(job, strict=True):
    errors = validate(job, strict=strict)
    if errors:
        raise ValueError("\n".join(errors))
    fragments = parse_rule_fragments()
    bindings = job["method_bindings"]
    selected = []
    for binding in bindings:
        mid = binding["method_id"]
        if mid not in fragments:
            raise ValueError(f"Rule {mid} missing from construction method sources")
        if mid not in selected:
            selected.append(mid)

    # Dynamic content remains separate from the learned construction instructions.
    prompt = [
        "# SOURCE-GROUNDED ORIGINAL 2D ILLUSTRATION JOB",
        "The witnesses are STYLE-ONLY. Never copy source subjects, original scenes, faces, arrangements, costumes, story beats or props.",
        "The script owns new content; method rules govern illustration construction.",
        "Make complete artworks with connected functional parts and scene-conditional material treatment.",
        "Never silently replace a missing high-impact decision with a generic style adjective.",
        "\n## NEW BRIEF\n" + dump(job["original_content"]),
        "\n## CAMERA / VIEW\n" + dump(job["canvas"]),
        "\n## SCENE MEDIUM ROUTE / NESTING\n" + dump(job.get("medium_tree", ["WORLD"])),
        "\n## VIEWPORT / MASK ORDER\n" + dump(job.get("viewport_layers", [])),
        "\n## ACTUAL SUBJECT CONSTRUCTION\n" + dump(job["subject_graph"]),
        "\n## WORLD / PERSPECTIVE / DETAIL DEPTH\n" + dump(job["world"]),
        "\n## WORLD SYSTEM: PROJECTION / PART GRAPH / MATERIAL OWNERS\n" + dump(job.get("world_system", {})),
        "\n## MATERIAL-OWNED LIGHTING\n" + dump(job["lighting"]),
        "\n## MOTION / ALTERNATE DRAWINGS\n" + dump(job.get("animation", {"still_image": True})),
        "\n## TIMED KEY-PLATE STATES\n" + dump(job.get("temporal_plates", [])),
        "\n## EXECUTION ROUTE / REFERENCE ROLES\n" + dump(job["manufacturing"]),
        "\n## METHOD BINDINGS AND WITNESSES\n" + dump(bindings),
        "\n## FULL APPLICABLE LEARNED CONSTRUCTION METHODS\n"
        + "\n\n".join(provider_rule_text(mid, fragments[mid]) for mid in selected),
        "\n## OBSERVABLE FAILURE CONDITIONS\n" + dump(job["observable_negative_tests"]),
        "\n## DELIVERY\nReturn the actual original illustrated output with enough fidelity to check every structural and material condition. State any limitation plainly.",
    ]
    payload = "\n".join(prompt) + "\n"
    trace = {
        "job_id": job.get("job_id"),
        "status": "COMPILED_NOT_DEMONSTRATED",
        "selected_methods": selected,
        "source_witnesses": list(
            dict.fromkeys(w for binding in bindings for w in binding["source_witnesses"])
        ),
        "method_sources": [str(OPERATIONS), str(FULL_FILM_METHODS), str(WORLD_METHODS), str(CONDITIONAL_METHODS), str(MOLECULAR_METHODS)],
        "method_source": str(OPERATIONS),
        "medium_tree": job.get("medium_tree", ["WORLD"]),
        "temporal_plates_count": len(job.get("temporal_plates", [])),
        "world_construction_compiled": bool(job.get("world_system")),
        "world_class": job.get("world_system", {}).get("world_class"),
        "illustrative_world_schema_removed_from_provider_payload": "F49" in selected,
        "source_job_sha256": hashlib.sha256(dump(job).encode("utf-8")).hexdigest(),
        "prompt_sha256": hashlib.sha256(payload.encode("utf-8")).hexdigest(),
        "prompt_character_count": len(payload),
        "provider_request_submitted": False,
        "output_art_verified": False,
        "transfer_qualified": False,
    }
    return payload, trace


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("job", type=Path, help="Filled ArtJob JSON")
    parser.add_argument("--out", type=Path, required=True, help="Compiled provider prompt")
    parser.add_argument("--trace", type=Path, required=True, help="JSON audit trace")
    parser.add_argument("--allow-open-decisions", action="store_true")
    parser.add_argument("--max-prompt-chars", type=int, default=None,
                        help="Provider maximum; fail before submission if compiled payload exceeds it")
    args = parser.parse_args()
    try:
        job = json.loads(args.job.read_text(encoding="utf-8"))
        payload, trace = compile_job(job, strict=not args.allow_open_decisions)
        if args.max_prompt_chars is not None and len(payload) > args.max_prompt_chars:
            raise ValueError(
                f"Compiled prompt has {len(payload)} characters, over provider limit "
                f"{args.max_prompt_chars}. Select fewer applicable methods or omit "
                "illustrative duplication; do not truncate original geometry."
            )
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"COMPILE_FAIL: {exc}", file=sys.stderr)
        return 2
    args.out.parent.mkdir(parents=True, exist_ok=True)
    args.trace.parent.mkdir(parents=True, exist_ok=True)
    args.out.write_text(payload, encoding="utf-8")
    args.trace.write_text(dump(trace) + "\n", encoding="utf-8")
    print(f"COMPILED_NOT_DEMONSTRATED {len(payload)} chars {len(trace['selected_methods'])} source methods")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
