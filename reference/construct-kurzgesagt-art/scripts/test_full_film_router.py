#!/usr/bin/env python3
"""Pure ArtJob compiler regression tests. Do not confuse with pixel tests."""
import copy
import unittest

from compile_art_job import compile_job, parse_rule_fragments, validate


def example_job():
    return {
        "job_id": "NOVEL-BIOMECHANICAL-SEED-MICROSCOPE",
        "original_content": {
            "script_excerpt": "An invented windmill-powered ceramic greenhouse grows a mineral lattice; a caretaker views it through a portal lens.",
            "scene_goal": "Contrast the physically supported mineral lattice with a magnified atomic growth diagram.",
            "new_subjects": ["ceramic windmill", "caretaker", "inorganic lattice", "lens"],
            "noncopy_source_content": True,
        },
        "canvas": {"aspect": "16:9", "view": "wide horizontal world with inset close-up", "scale": "wide"},
        "medium_tree": ["WORLD", "PORTAL_OR_SCREEN", "SCHEMATIC"],
        "viewport_layers": ["lens_back", "masked_complete_lattice_diagram", "lens_front_highlight"],
        "method_bindings": [
            {"method_id": mid,
             "conditions": "Novel controlled representation shift with connected parts",
             "source_witnesses": ["MEMORIES@464-466", "AI@250-252"],
             "invariant_transferred": "Independently complete inner representation with mask and plane occlusion",
             "variation_required": "Totally new mineral system and ceramic windmill anatomy",
             "observable_verification": "Rim occludes inner crop and external windmill has real supports"}
            for mid in ("F01", "F19", "F20", "F21", "F27", "F31", "F36")
        ],
        "subject_graph": [{
            "id": "windmill", "family": "functional machine",
            "whole_silhouette": "Tapered ceramic tower, connected shaft and four sail-like cantilevers",
            "view_dependent_parts": [{"part": "shaft", "parent": "tower", "shape": "central attached hub"}],
            "attachment_and_contact": [{"child": "shaft", "parent": "tower"}],
            "surface_materials": [{"part": "tower", "base_color_role": "opaque warm clay", "attached_color_patches": ["side-plane shade"]}],
        }],
        "world": {"projection": "consistent oblique tower and near-facing lens", "layers": ["sky", "windmill", "lens_back", "lens_inside", "lens_front"]},
        "lighting": {"opaque_color_patches": ["tower_side"], "optical_reflection_masks": ["lens_top_arc"]},
        "animation": {"scene_tracks": [{"owner": "PORTAL", "time_range": [0, 2], "asset_states": ["closed", "opening", "open"]}]},
        "temporal_plates": [{"name": "closed", "time_s": 0}, {"name": "opening", "time_s": 1.2}, {"name": "open", "time_s": 2.0}],
        "manufacturing": {"route": "HYBRID", "masks_and_layer_order": ["lens_back", "inner_scene", "lens_front"]},
        "observable_negative_tests": ["No copied bird, fly or landscape composition", "No detached shaft"],
        "uncontrolled_high_impact_decisions": [],
    }


class FullFilmRouterTests(unittest.TestCase):
    def test_all_method_sections_are_available(self):
        fragments = parse_rule_fragments()
        for i in range(1, 37):
            self.assertIn(f"F{i:02d}", fragments)

    def test_real_route_and_timed_stages_compile(self):
        payload, trace = compile_job(example_job())
        self.assertIn("## F21", payload)
        self.assertIn("## F36", payload)
        self.assertIn("masked_complete_lattice_diagram", payload)
        self.assertEqual(trace["medium_tree"], ["WORLD", "PORTAL_OR_SCREEN", "SCHEMATIC"])
        self.assertEqual(trace["temporal_plates_count"], 3)
        self.assertFalse(trace["provider_request_submitted"])
        self.assertFalse(trace["transfer_qualified"])

    def test_sponsor_contamination_is_blocked(self):
        job = example_job()
        job["medium_tree"] = ["EDITORIAL_OR_AD"]
        self.assertTrue(any("editorial_reason" in e for e in validate(job)))
        job["editorial_reason"] = "The original new script requests a sponsor card"
        self.assertFalse(validate(job))

    def test_viewport_without_planes_is_rejected(self):
        job = example_job()
        job["viewport_layers"] = ["one_pasted_image"]
        self.assertTrue(any("viewport_layers" in e for e in validate(job)))

    def test_unknown_mode_and_uncontrolled_decision_rejected(self):
        job = example_job()
        job["medium_tree"] = ["ONE_PALETTE_FOR_ALL"]
        job["uncontrolled_high_impact_decisions"] = ["unspecified lens shape"]
        errs = validate(job)
        self.assertTrue(any("medium_tree" in e for e in errs))
        self.assertTrue(any("unresolved high-impact" in e for e in errs))


if __name__ == "__main__":
    unittest.main()
