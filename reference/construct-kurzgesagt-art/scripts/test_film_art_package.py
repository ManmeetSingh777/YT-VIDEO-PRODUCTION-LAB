#!/usr/bin/env python3
"""Regressions: a seven-image test must never masquerade as full film art."""

import copy
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from validate_film_art_package import STAGE_KEYS, digest, validate


class FullFilmArtPackageTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.image_path = self.root / "art" / "images" / "master.png"
        self.image_path.parent.mkdir(parents=True)
        Image.new("RGBA", (32, 32), (50, 100, 180, 255)).save(self.image_path)
        for folder in ("art/jobs", "art/reviews", "motion/tracks", "motion/strips", "handoff"):
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        (self.root / "art/jobs/master.json").write_text('{"job": "original"}')
        (self.root / "art/reviews/master.md").write_text("Native pixel inspection of original master")
        (self.root / "motion/strips/boundary.png").write_bytes(self.image_path.read_bytes())
        self.stage_files = {}
        for key in STAGE_KEYS:
            filename = f"direction/{key}.md"
            path = self.root / filename
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(f"Original authored {key} content")
            self.stage_files[key] = filename
        self.manifest = {
            "schema_version": 1, "project_id": "NEW_ORIGINAL_FILM", "mode": "COMPLETE_FILM_ART_PACKAGE",
            "status": "READY_FOR_CLAUDE_RENDER", "fps": 60, "total_frames": 120,
            "stage_files": self.stage_files,
            "assets": [{
                "id": "master", "file": "art/images/master.png", "kind": "character_master",
                "status": "REPAIRED_AND_REVIEWED", "sha256": digest(self.image_path),
                "source_job": "art/jobs/master.json", "inspection": "art/reviews/master.md",
                "parent_id": None, "alpha_required": False, "uses": ["S01", "S02"],
            }],
            "identity_masters": [{"subject_id": "H_NEW", "asset_id": "master"}],
            "shots": [self.shot("S01", 0, 60), self.shot("S02", 60, 120)],
            "transitions": [{
                "from": "S01", "to": "S02", "out": "foreground departure",
                "middle": "shared matched landmark", "in": "arrival and first action",
                "shared_anchor": "painted face and matching hand", "handoff_mechanism": "matched camera transfer",
                "required_assets": ["master"], "assembly_proof": "motion/strips/boundary.png",
            }],
        }
        self.flush()

    def shot(self, name, start, end):
        track_path = f"motion/tracks/{name}.json"
        (self.root / track_path).write_text(json.dumps({
            "frame_start": start, "frame_end": end,
            "camera_keyframes": [{"f": start, "x": 0}, {"f": end - 1, "x": 30}],
            "attention_cues": [{"f": start, "target": "hand"}],
            "asset_tracks": [{"id": "master", "frames": [start, end - 1]}],
        }))
        return {
            "id": name, "start": start, "end": end,
            "viewer_before": "does not understand attachment", "viewer_after": "understands joint",
            "trigger": "actual lever turns", "causal_action": "shaft moves and gear turns",
            "attention_path": "hand to pivot", "camera_path": "tracks 30 pixels",
            "experience": "brief surprise after contact", "outgoing_handoff": "track gear to joint",
            "required_assets": ["master"],
            "states": {key: ["master"] for key in ("entry", "action", "contact", "consequence", "exit")},
            "track_file": track_path,
        }

    def flush(self):
        (self.root / "handoff/ART_AND_MOTION_MANIFEST.json").write_text(json.dumps(self.manifest, indent=2))

    def test_filled_minimal_technical_contract_passes(self):
        self.assertEqual(validate(self.root), [])

    def test_partial_qualification_cannot_claim_render_ready(self):
        self.manifest["status"] = "PARTIAL_ART_PACKAGE"
        self.flush()
        self.assertTrue(any("PARTIAL_ART_PACKAGE" in e for e in validate(self.root)))

    def test_missing_six_second_coverage_is_caught(self):
        self.manifest["total_frames"] = 7200
        self.flush()
        self.assertTrue(any("frame coverage" in e for e in validate(self.root)))

    def test_seven_hero_images_do_not_replace_contact_states(self):
        self.manifest["shots"][0]["states"].pop("contact")
        self.flush()
        self.assertTrue(any("states.contact" in e for e in validate(self.root)))

    def test_missing_transition_proof_is_caught(self):
        self.manifest["transitions"] = []
        self.flush()
        self.assertTrue(any("missing handoff" in e for e in validate(self.root)))

    def test_absent_canonical_identity_is_caught(self):
        self.manifest["identity_masters"] = []
        self.flush()
        self.assertTrue(any("identity_masters" in e for e in validate(self.root)))

    def test_hash_mismatch_exposes_substituted_art(self):
        self.manifest["assets"][0]["sha256"] = "0" * 64
        self.flush()
        self.assertTrue(any("SHA256 differs" in e for e in validate(self.root)))

    def test_missing_stage_is_caught_before_generation(self):
        del self.manifest["stage_files"]["visual_inventions"]
        self.flush()
        self.assertTrue(any("visual_inventions" in e for e in validate(self.root)))

    def test_alpha_is_real_not_filename_claim(self):
        self.manifest["assets"][0]["kind"] = "alpha_mask"
        self.manifest["assets"][0]["alpha_required"] = True
        self.flush()
        self.assertTrue(any("true transparency" in e for e in validate(self.root)))


if __name__ == "__main__":
    unittest.main()
