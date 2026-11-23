#!/usr/bin/env python3
"""Real input and negative-path tests of the mandatory first-pass provider request."""

import copy
import hashlib
import json
import unittest
from pathlib import Path

from PIL import Image
import numpy as np

from prepare_first_pass import build, validate_control
from compile_art_job import parse_rule_fragments, validate


ROOT = Path(__file__).resolve().parents[1]
TEST_JOB = json.loads((ROOT / "assets/novel_greenhouse_art_job.json").read_text(encoding="utf-8"))


class FirstPassControlTests(unittest.TestCase):
    def test_all_80_method_ids_resolve_to_drawable_source_rules(self):
        fragments = parse_rule_fragments()
        self.assertTrue({f"F{i:02d}" for i in range(1, 81)}.issubset(fragments))
        for mid in ("F57", "F61", "F64", "F71", "F78", "F80"):
            self.assertGreater(len(fragments[mid]), 300)
        altered = copy.deepcopy(TEST_JOB)
        binding = copy.deepcopy(altered["method_bindings"][0])
        binding["method_id"] = "F78"
        altered["method_bindings"] = [binding]
        self.assertEqual([], validate(altered))

    def test_molecular_source_witnesses_are_25_full_hd_verified_images(self):
        manifest = json.loads((ROOT / "references/QUESTION_NATIVE_WITNESS_MANIFEST.json").read_text())
        self.assertFalse(manifest["full_film_semantic_inspection"])
        self.assertEqual(242095, manifest["source_frame_count"])
        self.assertEqual(25, len(manifest["witnesses"]))
        self.assertEqual({"AI", "BRAIN", "MEMORIES", "NUCLEAR", "SOLAR"},
                         {w["film"] for w in manifest["witnesses"]})
        for record in manifest["witnesses"]:
            self.assertEqual("SOURCE_STYLE_ONLY_NOT_CONTENT", record["usage"])
            image_path = ROOT / record["relative_path"]
            self.assertEqual(record["sha256"], hashlib.sha256(image_path.read_bytes()).hexdigest())
            with Image.open(image_path) as picture:
                self.assertEqual((1920, 1080), picture.size)

    def test_molecular_decisions_reach_first_provider_prompt_before_generic_methods(self):
        altered = copy.deepcopy(TEST_JOB)
        first = next(iter(altered["subject_graph"]))["id"]
        altered["molecular_visual_decisions"] = {
            "highest_impact_question": "What original causal path is actually visible?",
            "chosen_methods": ["F57", "F59", "F61", "F78"],
            "positive_source_contrast": "BRAIN@334 acting vs NUCLEAR@420 coverage",
            "contradicting_source_case": "BRAIN@274 acting face refutes mandatory wide angle",
            "primary_proof": {"subject_parent_id": first, "bbox_norm": [0.12, 0.2, 0.88, 0.8],
                              "observable_before_after": "Named physical cause changes connected target"},
            "topology_and_projections": {"view_family": "FLAT_ORTHO", "parts": ["attached parent"]},
            "color_and_surface_owners": {"palette_slots": {"focal": "one parent"}},
            "density_budget_by_region": {"main_proof": ["cause and response"]},
            "animation_ancestry": {"canonical_master_id": "new scene, no copied source"},
            "specific_generational_exclusions": ["no added arrows", "no external photorealism"],
            "falsification_test": "cause endpoint is outside visible frame"
        }
        request, _ = build(altered)
        prompt = request["prompt"]
        self.assertIn("molecular_visual_decisions", altered)
        self.assertIn("F78", prompt)
        self.assertIn("highest", prompt.lower()[:2500])
        self.assertLess(prompt.index("TOP HIGH-IMPACT MOLECULAR CHOICES"),
                        prompt.index("WHOLE VIEWER PROOF"))

    def test_incomplete_molecular_decisions_are_refused_when_supplied(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["molecular_visual_decisions"] = {"chosen_methods": ["F57"]}
        with self.assertRaisesRegex(ValueError, "highest_impact_question"):
            build(altered)

    def test_actual_firstpass_and_regenerated_images_are_preserved_without_relabeling(self):
        receipts = json.loads((ROOT / "references/IMAGEGEN_2026_PROVIDER_RECEIPTS.json").read_text())
        self.assertEqual(4, len(receipts["records"]))
        self.assertEqual(2, sum(x["kind"] == "FIRST_PASS_UNREPAIRED" for x in receipts["records"]))
        self.assertEqual(2, sum(x["attempt"] == 2 for x in receipts["records"]))
        for entry in receipts["records"]:
            path = ROOT / entry["output_path"]
            self.assertTrue(path.is_file())
            self.assertEqual(hashlib.sha256(path.read_bytes()).hexdigest(), entry["output_sha256"])
            with Image.open(path) as frame:
                self.assertEqual(tuple(entry["output_dimensions"]), frame.size)

    def test_native_full_hd_per_frame_numeric_evidence_matches_all_five_receipts(self):
        summary = json.loads((ROOT / "references/NATIVE_1080P_FRAME_STUDY_SUMMARY.json").read_text())
        self.assertEqual(242095, summary["frame_total"])
        accumulated = 0
        for film_id, entry in summary["five_films"].items():
            receipt = json.loads((ROOT / "references/native_scan_verifications" / f"{film_id}.json").read_text())
            self.assertEqual("VERIFIED_NATIVE_PIXEL_PASS", receipt["status"])
            self.assertEqual([1920, 1080], receipt["frame_dimensions"])
            self.assertEqual(entry["frames"], receipt["decoded_frames"])
            with np.load(ROOT / "assets/native_frame_feature_evidence" / f"{film_id}_features.npz") as data:
                self.assertEqual((entry["frames"], 12), data["features"].shape)
                self.assertEqual(12, len(data["feature_names"]))
            accumulated += entry["frames"]
        self.assertEqual(242095, accumulated)

    def test_question_native_witnesses_are_five_film_original_hd_and_intact(self):
        registry = json.loads((ROOT / "references/CONDITIONAL_NATIVE_ANCHOR_MANIFEST.json").read_text())
        self.assertEqual(8, len(registry["selected_witnesses"]))
        self.assertEqual({"AI", "BRAIN", "MEMORIES", "NUCLEAR", "SOLAR"},
                         {w["film"] for w in registry["selected_witnesses"]})
        for witness in registry["selected_witnesses"]:
            self.assertEqual("EXPLAINER_ART", witness["source_class"])
            src = ROOT / witness["path"]
            self.assertTrue(src.is_file(), witness["path"])
            self.assertEqual(hashlib.sha256(src.read_bytes()).hexdigest(), witness["sha256"])
            with Image.open(src) as picture:
                self.assertEqual((1920, 1080), picture.size)

    def test_compiles_actual_reference_paths_and_geometry(self):
        request, manifest = build(TEST_JOB)
        self.assertEqual(2, len(request["referenced_image_paths"]))
        self.assertTrue(all(Path(p).is_file() for p in request["referenced_image_paths"]))
        self.assertTrue(all(x["width"] == 1920 and x["height"] == 1080 for x in manifest["source_image_inputs"]))
        self.assertIn("HUMAN_GESTURE_FULL", request["prompt"])
        self.assertIn("eye_regions", request["prompt"])
        self.assertIn("SOURCE REFERENCE ROLES", request["prompt"])
        self.assertIn("NEW-SCENE PALETTE ROLES", request["prompt"])
        self.assertIn("DENSITY TIERS", request["prompt"])
        self.assertIn("NAMED CAUSAL ENDPOINTS", request["prompt"])
        self.assertEqual("COMPILED_WITH_IMAGES_NOT_SUBMITTED", manifest["status"])
        self.assertFalse(manifest["provider_request_submitted"])

    def test_missing_control_block_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        del altered["first_pass_control"]
        errors, images = validate_control(altered)
        self.assertIn("mandatory", errors[0])
        self.assertFalse(images)

    def test_unavailable_native_witness_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["first_pass_control"]["references"][0]["path"] = "assets/character_native_anchors/does_not_exist.jpg"
        with self.assertRaisesRegex(ValueError, "Native source witness is absent"):
            build(altered)

    def test_source_reference_cannot_escape_skill_directory(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["first_pass_control"]["references"][0]["path"] = "/etc/passwd"
        with self.assertRaisesRegex(ValueError, "Source witness outside skill assets"):
            build(altered)

    def test_missing_character_geometry_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        del altered["first_pass_control"]["character_designs"][0]["face"]["eye_regions"]
        with self.assertRaisesRegex(ValueError, "face.eye_regions missing"):
            build(altered)

    def test_missing_focal_subject_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["first_pass_control"]["subject_specs"] = altered["first_pass_control"]["subject_specs"][0:1]
        with self.assertRaisesRegex(ValueError, "Missing first-pass subject specs"):
            build(altered)

    def test_generic_prompt_without_palette_and_focus_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        del altered["first_pass_control"]["palette_roles"]
        del altered["first_pass_control"]["density_and_focus"]
        with self.assertRaisesRegex(ValueError, "palette_roles"):
            build(altered)

    def test_missing_causal_endpoint_geometry_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        del altered["first_pass_control"]["causal_frame_geometry"]
        with self.assertRaisesRegex(ValueError, "causal_frame_geometry"):
            build(altered)

    def test_causal_endpoint_outside_frame_refused(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["first_pass_control"]["causal_frame_geometry"]["named_visible_anchors"][0]["screen_position_norm"] = [-0.25, 1.1]
        with self.assertRaisesRegex(ValueError, "normalized 0..1"):
            build(altered)

    def test_noncopiable_style_only_tag_required(self):
        altered = copy.deepcopy(TEST_JOB)
        altered["first_pass_control"]["references"][1]["role"] = "Copy this actor"
        with self.assertRaisesRegex(ValueError, "STYLE_ONLY"):
            build(altered)

    def test_overlong_prompt_blocked_without_truncation(self):
        with self.assertRaisesRegex(ValueError, "exceeds provider limit"):
            build(TEST_JOB, max_chars=100)


if __name__ == "__main__":
    unittest.main()
