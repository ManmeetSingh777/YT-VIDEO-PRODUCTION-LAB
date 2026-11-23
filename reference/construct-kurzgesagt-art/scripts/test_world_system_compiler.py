"""Fail-closed checks for actionable world systems in unfamiliar briefs."""

import copy
import json
import re
import sys
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from compile_art_job import compile_job, parse_rule_fragments, validate


def novel_job():
    job = json.loads((ROOT / "assets/novel_greenhouse_art_job.json").read_text())
    job["job_id"] = "NOVEL-UNFAMILIAR-FLOOD-WORLD"
    job["original_content"] = {
        "script_excerpt": "A floating town shares rainwater through a network of spring-loaded reservoirs.",
        "scene_goal": "Make reservoir-to-home water transport visually traceable.",
        "new_subjects": ["floating neighborhood", "rain reservoir", "visible water paths"],
        "noncopy_source_content": True,
    }
    job["method_bindings"].append({
        "method_id": "F40",
        "conditions": "A new water-management neighborhood needs a visible linked architectural ecosystem",
        "source_witnesses": ["AI@35", "AI@856", "NUCLEAR@296"],
        "invariant_transferred": "face-specific built modules with attached transport, not the source scene arrangement",
        "variation_required": "original reservoir structures, floating neighborhoods and water device classes",
        "observable_verification": "all water routes connect reservoir outlets with actual inhabited modules",
    })
    job["world_system"] = {
        "world_class": "SCENIC_BUILT",
        "world_purpose": "Reveal that reservoirs share runoff with inhabited floating districts",
        "substrate": "three aligned floating modular platforms on contiguous water plane",
        "coord_system": "one 2.5D oblique roof/wall grid with two projected axes",
        "regions": [
            {"id": "water", "shape": "continuous water plane behind and between buildings", "depth": "far", "material": "water"},
            {"id": "town", "shape": "interlocking platforms and reservoir silos", "depth": "mid", "material": "painted composite"},
        ],
        "parts": [
            {"id": "reservoir", "parent": "town", "silhouette": "wide cup cylinder with raised rim and downstream valve", "projection": "2.5D oblique", "function": "stores runoff"},
            {"id": "house", "parent": "town", "silhouette": "elevated pitched-roof dwelling with open supply port", "projection": "2.5D oblique", "function": "consumes stored runoff"},
        ],
        "relationships": [
            {"from": "reservoir", "to": "house", "type": "opaque connected water duct", "path": "curved connected aqueduct over platform"}
        ],
        "detail_generators": [
            {"parent": "house", "unit": "projected front-face window pair", "distribution": "only front-facing wall", "count_or_density": "2 per household", "disabled_when": "far roof silhouette"}
        ],
        "material_ownership": [
            {"part": "reservoir", "fill": "cyan water inside rim", "edge": "solid vessel wall", "light": "none"}
        ],
        "effect_ownership": [
            {"owner": "reservoir", "kind": "water-route signal highlight", "allowed_region": "only connected duct path and inner water", "count_or_coverage_limit": "one main path with three small end-pulses", "forbidden_regions": "homes, trees and empty river"}
        ],
        "visibility_masks": ["water", "platforms", "near architecture", "aqueduct", "front shrubs"],
        "focal_read_test": "water-filled central reservoir is structurally connected to the houses",
        "native_crop_tests": ["aqueduct ends at valve", "roof/wall perspective matches"],
        "source_only_witnesses": ["AI@35", "AI@856"],
        "allowed_subject_ids": ["reservoir", "house"],
        "forbidden_extras": ["unasked human narrator", "source scene objects", "floating unrelated UI"],
        "content_noncopy_invariants": ["no original city", "no source cube", "no source AI avatar"],
    }
    return job


class WorldCompilerTest(unittest.TestCase):
    def test_all_molecular_world_rules_exist(self):
        fragments = parse_rule_fragments()
        self.assertTrue(all(f"F{i:02d}" in fragments for i in range(37, 51)))

    def test_novel_world_compiles_and_binds_actual_rule_text(self):
        job = novel_job()
        self.assertEqual(validate(job), [])
        prompt, trace = compile_job(job)
        self.assertIn("Build *dense architectural/ecological worlds*", prompt)
        self.assertIn("floating modular platforms", prompt)
        self.assertIn("face-specific built modules", prompt)
        self.assertTrue(trace["world_construction_compiled"])
        self.assertEqual(trace["world_class"], "SCENIC_BUILT")
        self.assertFalse(trace["provider_request_submitted"])

    def test_vague_world_is_not_sufficient(self):
        job = novel_job()
        job["world_system"] = {"world_class": "SCENIC_BUILT", "world_purpose": "Beautiful town"}
        errors = validate(job)
        self.assertIn("world_system.coord_system missing", errors)
        self.assertIn("world_system.parts must be a nonempty list", errors)

    def test_dangling_pipe_is_rejected(self):
        job = novel_job()
        job["world_system"]["relationships"][0]["to"] = "imaginary_node"
        errors = validate(job)
        self.assertIn("world_system.relationships endpoints must point to actual part IDs", errors)

    def test_missing_unlike_witnesses_is_rejected(self):
        job = novel_job()
        job["world_system"]["source_only_witnesses"] = ["AI@35"]
        errors = validate(job)
        self.assertIn("world_system requires >=2 unlike source-only witnesses", errors)

    def test_extra_actor_and_effect_budget_controls_are_required(self):
        job = novel_job()
        del job["world_system"]["forbidden_extras"]
        job["world_system"]["effect_ownership"][0].pop("count_or_coverage_limit")
        errors = validate(job)
        self.assertIn("world_system.forbidden_extras must be a nonempty list", errors)
        self.assertIn("world_system.effect_ownership requires owner/kind/region/budget/forbidden regions", errors)

    def test_world_schema_does_not_break_existing_jobs(self):
        base = json.loads((ROOT / "assets/novel_greenhouse_art_job.json").read_text())
        self.assertEqual(validate(base), [])

    def test_full_novel_biology_payload_remains_under_provider_limit(self):
        case = json.loads((ROOT / "assets/novel_mycelium_world_art_job.json").read_text())
        self.assertEqual(validate(case), [])
        prompt, trace = compile_job(case)
        self.assertLessEqual(len(prompt), 31500)
        self.assertNotIn('"world_class": "ABSTRACT_VOLUME",', prompt)
        self.assertIn('"world_class": "BIOLOGICAL_MICRO",', prompt)
        self.assertTrue(trace["illustrative_world_schema_removed_from_provider_payload"])

    def test_portable_native_witness_router_images_exist(self):
        router = (ROOT / "references/NATIVE_ANCHOR_ROUTER.md").read_text()
        anchors = set(re.findall(r"`((?:AI|MEMORIES|VOLCANO|NUCLEAR|SOLAR|BRAIN)_\d{4}_[a-z_]+\.jpg)`", router))
        self.assertEqual(len(anchors), 19)
        for name in anchors:
            path = ROOT / "assets/molecular_native_anchors" / name
            self.assertTrue(path.is_file(), f"Missing original-resolution source witness: {name}")
            self.assertGreater(path.stat().st_size, 10000, f"Unexpectedly tiny witness: {name}")

    def test_observed_novel_world_outputs_and_repair_are_retained(self):
        names = [
            "transfer_g_flood_world_source_guided_first.png",
            "transfer_g_flood_world_source_guided_repaired.png",
            "transfer_h_weather_futures_source_guided.png",
            "transfer_i_mycelium_compiler_to_provider.png",
            "transfer_j_sparse_detector_dark_cave.png",
            "transfer_k_underwater_observatory_world.png",
        ]
        for name in names:
            path = ROOT / "assets" / name
            self.assertTrue(path.is_file(), f"Missing observed original-world image {name}")
            self.assertGreater(path.stat().st_size, 100_000)


if __name__ == "__main__":
    unittest.main()
