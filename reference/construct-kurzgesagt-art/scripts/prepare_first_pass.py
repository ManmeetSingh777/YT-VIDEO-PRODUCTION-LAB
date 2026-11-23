#!/usr/bin/env python3
"""Fail-closed first-pass visual request builder for original, source-guided art.

This program verifies and packages a request for image_gen.imagegen. It does NOT
call the image-generation provider. The agent must submit the exact JSON prompt
and referenced images, then preserve the tool output and inspect the pixels.
"""

import argparse
import hashlib
import json
import sys
from pathlib import Path

from PIL import Image

from compile_art_job import ROOT, compile_job
from repair_learning import first_pass_learning_block, load_memory


PERSON_FAMILIES = {"HUMAN_ACTING_CLOSE", "HUMAN_GESTURE_FULL", "HUMAN_REAR_OCCLUDED", "MASCOT_SIMPLE", "DISTANT_POPULATION"}
KNOWN_FAMILIES = PERSON_FAMILIES | {
    "ANIMAL_OR_MACRO_BIO", "INTERIOR", "SCENIC_NATURAL", "SCENIC_BUILT",
    "ABSTRACT", "MACHINE", "BIOLOGICAL_MICRO", "INFOGRAPHIC", "OPTICAL_EFFECT",
}
REQUIRED_CHARACTER_FIELDS = (
    "subject_id", "family", "unique_original_identity", "intended_view", "screen_bbox_norm",
    "minimum_screen_height_px", "silhouette", "head", "face", "body", "color_surfaces",
    "rendering_exclusions", "state_family", "original_content_noncopy",
)


def nonempty(value):
    return bool(value) if isinstance(value, (str, list, dict)) else value is not None


def file_digest(file_path):
    h = hashlib.sha256()
    with file_path.open("rb") as fh:
        while chunk := fh.read(1 << 20):
            h.update(chunk)
    return h.hexdigest()


def add_missing(errors, data, keys, scope):
    if not isinstance(data, dict):
        errors.append(f"{scope} must be an object")
        return
    for key in keys:
        if not nonempty(data.get(key)):
            errors.append(f"{scope}.{key} missing or empty")


def validate_character(design, declared_subject_ids):
    errors = []
    add_missing(errors, design, REQUIRED_CHARACTER_FIELDS, "character_design")
    if not isinstance(design, dict):
        return errors
    if design.get("subject_id") not in declared_subject_ids:
        errors.append("character_design.subject_id must match a declared subject_graph id")
    if design.get("family") not in PERSON_FAMILIES:
        errors.append("character_design.family must be a supported human/mascot/population family")
    bbox = design.get("screen_bbox_norm")
    if (not isinstance(bbox, list) or len(bbox) != 4 or
        any(not isinstance(v, (int, float)) or isinstance(v, bool) or v < 0 or v > 1 for v in bbox) or
        not (bbox[0] < bbox[2] and bbox[1] < bbox[3])):
        errors.append("character_design.screen_bbox_norm needs ordered numeric 0..1 [left, top, right, bottom]")
    if not isinstance(design.get("minimum_screen_height_px"), int) or design.get("minimum_screen_height_px", 0) <= 0:
        errors.append("character_design.minimum_screen_height_px must be positive integer")
    add_missing(errors, design.get("silhouette"), ("outline_path", "named_masses", "near_far_order"), "character_design.silhouette")
    add_missing(errors, design.get("head"), ("skull_contour", "face_plane", "hair_outer_path", "hair_lobes"), "character_design.head")
    add_missing(errors, design.get("face"), ("visibility", "eye_regions", "brow_regions", "nose_region", "mouth_region", "expression_geometry"), "character_design.face")
    add_missing(errors, design.get("body"), ("garment_masses", "hand_construction", "support_and_weight"), "character_design.body")
    if not isinstance(design.get("color_surfaces"), list) or len(design["color_surfaces"]) < 2:
        errors.append("character_design.color_surfaces requires at least two named parent-owned surfaces")
    else:
        for surface in design["color_surfaces"]:
            add_missing(errors, surface, ("owner", "base_fill", "patches"), "character_design.color_surfaces[]")
    if isinstance(design.get("state_family"), list) and len(design["state_family"]) < 2:
        errors.append("character_design.state_family requires canonical and at least one specified alternate state")
    if isinstance(design.get("rendering_exclusions"), list) and len(design["rendering_exclusions"]) < 2:
        errors.append("character_design.rendering_exclusions needs at least two visible non-source operations to exclude")
    return errors


def validate_control(job, root=ROOT):
    errors = []
    control = job.get("first_pass_control")
    if not isinstance(control, dict):
        return ["first_pass_control block is mandatory for source-guided image production"], []
    if control.get("version") != 2:
        errors.append("first_pass_control.version must equal 2")
    molecular = job.get("molecular_visual_decisions")
    if molecular is not None:
        add_missing(errors, molecular, (
            "highest_impact_question", "chosen_methods", "positive_source_contrast",
            "contradicting_source_case", "primary_proof", "topology_and_projections",
            "color_and_surface_owners", "density_budget_by_region", "animation_ancestry",
            "specific_generational_exclusions", "falsification_test"),
            "molecular_visual_decisions")
        if isinstance(molecular, dict):
            listed = molecular.get("chosen_methods", [])
            if (not isinstance(listed, list) or not listed or
                    any(not isinstance(m, str) or not m.startswith("F") for m in listed)):
                errors.append("molecular_visual_decisions.chosen_methods must be nonempty method IDs")
            proof = molecular.get("primary_proof", {})
            if isinstance(proof, dict):
                add_missing(errors, proof, ("subject_parent_id", "bbox_norm", "observable_before_after"),
                            "molecular_visual_decisions.primary_proof")
                bb = proof.get("bbox_norm")
                if (not isinstance(bb, list) or len(bb) != 4 or
                        any(not isinstance(v, (float, int)) or isinstance(v, bool) or v < 0 or v > 1 for v in bb) or
                        not (bb[0] < bb[2] and bb[1] < bb[3])):
                    errors.append("molecular_visual_decisions.primary_proof.bbox_norm needs ordered 0..1 [left,top,right,bottom]")
    add_missing(errors, control.get("viewer_proof"), ("what_changes", "recognition_test", "focal_order", "camera_view"), "first_pass_control.viewer_proof")
    if control.get("source_contrast") is None or not nonempty(control.get("source_contrast")):
        errors.append("first_pass_control.source_contrast must name the unlike witness comparison")
    refs = control.get("references")
    images = []
    if not isinstance(refs, list) or len(refs) < 2:
        errors.append("first_pass_control.references requires >=2 actual distinct STYLE-ONLY source images")
    else:
        for i, ref in enumerate(refs):
            add_missing(errors, ref, ("path", "role", "noncopy"), f"first_pass_control.references[{i}]")
            if not isinstance(ref, dict) or not ref.get("path"):
                continue
            if "STYLE_ONLY" not in str(ref.get("role", "")):
                errors.append(f"first_pass_control.references[{i}].role must explicitly say STYLE_ONLY")
            raw = Path(ref["path"])
            full = (root / raw).resolve() if not raw.is_absolute() else raw.resolve()
            if not full.is_relative_to(root.resolve()):
                errors.append(f"Source witness outside skill assets: {ref['path']}")
                continue
            if not full.is_file():
                errors.append(f"Native source witness is absent: {ref['path']}")
                continue
            try:
                with Image.open(full) as im:
                    width, height = im.size
                    im.verify()
                if width < 1280 or height < 720:
                    errors.append(f"Source witness not original-resolution capable: {ref['path']} ({width}x{height})")
                images.append({"path": str(full), "sha256": file_digest(full), "width": width, "height": height, "role": ref.get("role")})
            except (OSError, ValueError) as exc:
                errors.append(f"Source image unreadable {ref['path']}: {exc}")
        if len({x["path"] for x in images}) < 2:
            errors.append("At least two DISTINCT usable source image paths are mandatory")
    add_missing(errors, control.get("asset_state_plan"), ("canonical_master", "derivation_path", "motion_interfaces"), "first_pass_control.asset_state_plan")
    add_missing(errors, control.get("palette_roles"), ("substrate", "focal_subject", "causal_active", "supporting_shapes", "material_plane_rules", "optical_exceptions"), "first_pass_control.palette_roles")
    add_missing(errors, control.get("density_and_focus"), ("t1_major", "t2_owned_partwork", "t3_repeats_or_none", "primary_read_region", "quiet_support_region"), "first_pass_control.density_and_focus")
    add_missing(errors, control.get("causal_frame_geometry"), ("named_visible_anchors", "essential_connections", "frame_edge_policy", "authorized_overlay_symbols"), "first_pass_control.causal_frame_geometry")
    causal = control.get("causal_frame_geometry")
    if isinstance(causal, dict):
        anchors = causal.get("named_visible_anchors")
        if not isinstance(anchors, list) or len(anchors) < 2:
            errors.append("causal_frame_geometry.named_visible_anchors needs at least two named endpoints")
        else:
            for anchor in anchors:
                add_missing(errors, anchor, ("name", "screen_position_norm", "drawable_parent", "visible_mark"), "causal_frame_geometry.named_visible_anchors[]")
                if not isinstance(anchor, dict):
                    continue
                pos = anchor.get("screen_position_norm")
                if (not isinstance(pos, list) or len(pos) != 2 or
                    any(not isinstance(x, (int, float)) or x < 0 or x > 1 for x in pos)):
                    errors.append("causal_frame_geometry anchor requires [x,y] normalized 0..1")
    if not isinstance(control.get("forbidden_extras"), list) or not control["forbidden_extras"]:
        errors.append("first_pass_control.forbidden_extras must prohibit source copies and uncontrolled extras")
    declared = {x.get("id") for x in job.get("subject_graph", []) if isinstance(x, dict)}
    specs = control.get("subject_specs")
    if not isinstance(specs, list) or not specs:
        errors.append("first_pass_control.subject_specs must construct every focal subject")
        specs = []
    for spec in specs:
        add_missing(errors, spec, ("subject_id", "family", "shape_topology", "material_mapping", "focal_scale_and_view", "specific_negative_rendering"), "first_pass_control.subject_specs[]")
        if not isinstance(spec, dict):
            continue
        if spec.get("subject_id") not in declared:
            errors.append("subject_specs subject_id must match subject_graph")
        if spec.get("family") not in KNOWN_FAMILIES:
            errors.append(f"Unknown construction family: {spec.get('family')}")
        if not isinstance(spec.get("specific_negative_rendering"), list) or not spec["specific_negative_rendering"]:
            errors.append("subject_specs requires concrete negative rendering operations")
    missing_subjects = declared - {s.get("subject_id") for s in specs if isinstance(s, dict)}
    if missing_subjects:
        errors.append(f"Missing first-pass subject specs for {sorted(missing_subjects)}")
    character_specs = control.get("character_designs", [])
    if not isinstance(character_specs, list):
        errors.append("character_designs must be a list")
        character_specs = []
    for design in character_specs:
        errors.extend(validate_character(design, declared))
    character_ids = {c.get("subject_id") for c in character_specs if isinstance(c, dict)}
    for spec in specs:
        if isinstance(spec, dict) and spec.get("family") in PERSON_FAMILIES and spec.get("subject_id") not in character_ids:
            errors.append(f"Focal character {spec.get('subject_id')} requires complete character_design")
    return errors, images


def build(job, root=ROOT, max_chars=32000, repair_memory=None):
    if job.get("production_mode") == "COMPLETE_FILM_ART_PACKAGE" and repair_memory is None:
        raise ValueError("Full-film image jobs require the project repair memory, including the empty initialized version; run repair_learning.py init")
    repair_block, applied_repair_ids = (first_pass_learning_block(repair_memory, job.get("learning_context"))
                                         if repair_memory is not None else ("", []))
    compiled, trace = compile_job(job, strict=True)
    errors, images = validate_control(job, root=root)
    if errors:
        raise ValueError("\n".join(errors))
    ctl = job["first_pass_control"]
    # The selected molecular operations add real geometry to the first-pass
    # request. Compact JSON punctuation instead of discarding any semantic
    # content or silently truncating image-generator input.
    def exact_json(value):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    priority = (
        "FIRST-PASS ORIGINAL ART CONTROL — EXECUTE THESE ACTUAL CONSTRUCTION DECISIONS.\n"
        "The attached images are STYLE ONLY. Copy no source faces, subjects, costumes, layouts or stories.\n"
        "Do not substitute a painted film, anime face, glossy miniature/3D, photographic lighting or arbitrary scene detail.\n"
        + repair_block +
        "TOP HIGH-IMPACT MOLECULAR CHOICES, IF SPECIFIED: " + exact_json(job.get("molecular_visual_decisions", {"status":"USE F57–F80 METHOD ROUTING"})) + "\n"
        "WHOLE VIEWER PROOF: " + exact_json(ctl["viewer_proof"]) + "\n"
        "TRANSFERABLE SOURCE CONTRAST: " + ctl["source_contrast"] + "\n"
        "ORIGINAL PER-SUBJECT FIRST-PASS GEOMETRY AND MATERIAL OWNERS: " + exact_json(ctl["subject_specs"]) + "\n"
        "HUMAN/CHARACTER FACIAL, SILHOUETTE, COLOR-PLANE LOCKS: " + exact_json(ctl["character_designs"]) + "\n"
        "NEW-SCENE PALETTE ROLES AND PARENT-OWNED PLANES (NOT SOURCE HEX COPY): " + exact_json(ctl["palette_roles"]) + "\n"
        "EXPLANATION-OWNED DENSITY TIERS AND QUIET REGIONS: " + exact_json(ctl["density_and_focus"]) + "\n"
        "MANDATORY NAMED CAUSAL ENDPOINTS AND AUTHORIZED SYMBOLS: " + exact_json(ctl["causal_frame_geometry"]) + "\n"
        "ASSET IDENTITY AND VIEW CONNECTIONS: " + exact_json(ctl["asset_state_plan"]) + "\n"
        "UNAUTHORIZED EXTRAS: " + exact_json(ctl["forbidden_extras"]) + "\n"
        "SOURCE REFERENCE ROLES: " + exact_json([{"role": i["role"], "sha256": i["sha256"]} for i in images]) + "\n"
        "Continue with the verified, filled ArtJob and applicable F methods below.\n\n"
    )
    prompt = priority + compiled
    if len(prompt) > max_chars:
        raise ValueError(f"First-pass payload {len(prompt)} chars exceeds provider limit {max_chars}; select fewer applicable methods or resolve unnecessary prose; do not silently truncate geometry or source evidence")
    request = {"prompt": prompt, "referenced_image_paths": [i["path"] for i in images], "transparent_background": False}
    manifest = {
        "job_id": job.get("job_id"), "status": "COMPILED_WITH_IMAGES_NOT_SUBMITTED",
        "prompt_sha256": hashlib.sha256(prompt.encode("utf-8")).hexdigest(),
        "prompt_characters": len(prompt), "source_image_inputs": images,
        "provider_tool": "image_gen.imagegen", "provider_request_submitted": False,
        "first_pass_output_observed": False, "repaired_output_observed": False,
        "compiled_method_ids": trace["selected_methods"],
        "applied_repair_rule_ids": applied_repair_ids,
        "repair_memory_applied": repair_memory is not None,
        "note": "The model/tool must actually receive this exact prompt and image list; compilation cannot prove that happened.",
    }
    return request, manifest


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("job", type=Path)
    parser.add_argument("--out-dir", type=Path, required=True)
    parser.add_argument("--max-prompt-chars", type=int, default=32000)
    parser.add_argument("--repair-memory", type=Path, help="Project learning/REPAIR_MEMORY.json; required for full-film ArtJobs")
    args = parser.parse_args()
    try:
        job = json.loads(args.job.read_text(encoding="utf-8"))
        repair_memory = load_memory(args.repair_memory) if args.repair_memory else None
        request, manifest = build(job, max_chars=args.max_prompt_chars, repair_memory=repair_memory)
        args.out_dir.mkdir(parents=True, exist_ok=True)
        (args.out_dir / "IMAGEGEN_REQUEST.json").write_text(json.dumps(request, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        (args.out_dir / "PROVIDER_PRE_SUBMISSION_MANIFEST.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(f"COMPILED_WITH_IMAGES_NOT_SUBMITTED: {args.out_dir / 'IMAGEGEN_REQUEST.json'}")
    except (ValueError, OSError, json.JSONDecodeError) as exc:
        print(f"FIRST_PASS_BLOCKED: {exc}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
