#!/usr/bin/env python3
"""Tests that repaired pixels change future matching first-pass requests."""

import copy
import json
import tempfile
import unittest
from pathlib import Path

from PIL import Image

from prepare_first_pass import build
from repair_learning import (
    make_memory, load_memory, matching_rules, record, validate_memory,
)


ROOT = Path(__file__).resolve().parents[1]
BASE_JOB = json.loads((ROOT / "assets/novel_greenhouse_art_job.json").read_text())


class RepairLearningTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.project = Path(self.temporary.name)
        (self.project / "art").mkdir()
        (self.project / "learning").mkdir()
        self.memory_path = self.project / "learning/REPAIR_MEMORY.json"
        self.memory_path.write_text(json.dumps(make_memory()))
        Image.new("RGB", (64, 64), (150, 20, 30)).save(self.project / "art/before.png")
        Image.new("RGB", (64, 64), (30, 150, 40)).save(self.project / "art/after.png")
        self.context = {
            "family": "HUMAN_GESTURE_FULL", "view": "three_quarter",
            "world_class": "FUNCTIONAL_INTERIOR", "subject_id": "H_ORIGINAL",
        }
        self.lesson = {
            "rule_id": "R001_HAIR_PLANES", "scope": "LOCAL_IDENTITY", "status": "REPAIR_DEMONSTRATED",
            "applies_when": dict(self.context),
            "root_cause": "The source prompt omitted bounded garment shadow ownership and allowed smooth rendering",
            "first_request_change": "Name every garment material parent and attach its side-face shade inside that parent",
            "positive_construction_ops": [
                "Construct the near elbow as one closed sleeve silhouette and keep the shadow entirely inside its contour"
            ],
            "source_contrast": "Close acting source has bounded sleeve shades; distant actors omit those patches",
            "observed_improvement": "The repaired arm shows a single attached elbow silhouette where the first image had a muddy blend",
            "regression_boundary": "Use only for this acting character's front-facing sleeve family, not alien organisms",
            "before_path": "art/before.png", "after_path": "art/after.png",
        }

    def film_job(self):
        job = copy.deepcopy(BASE_JOB)
        job["production_mode"] = "COMPLETE_FILM_ART_PACKAGE"
        job["learning_context"] = dict(self.context)
        return job

    def test_full_film_refuses_silent_absence_of_learning_memory(self):
        with self.assertRaisesRegex(ValueError, "require the project repair memory"):
            build(self.film_job())

    def test_empty_memory_still_compiles_proper_full_film_first_pass(self):
        request, receipt = build(self.film_job(), repair_memory=make_memory())
        self.assertTrue(receipt["repair_memory_applied"])
        self.assertEqual([], receipt["applied_repair_rule_ids"])
        self.assertIn("ORIGINAL PER-SUBJECT", request["prompt"])

    def test_real_successful_repair_changes_the_next_first_generation(self):
        observed = record(self.project, self.lesson)
        self.assertEqual(64, len(observed["before_sha256"]))
        memory = load_memory(self.memory_path)
        request, receipt = build(self.film_job(), repair_memory=memory)
        self.assertEqual(["R001_HAIR_PLANES"], receipt["applied_repair_rule_ids"])
        self.assertIn("Construct the near elbow as one closed sleeve", request["prompt"])
        self.assertLess(request["prompt"].index("APPLICABLE OBSERVED REPAIR LESSONS"),
                        request["prompt"].index("TOP HIGH-IMPACT MOLECULAR CHOICES"))
        self.assertNotIn("R001_HAIR_PLANES", build(BASE_JOB)[0]["prompt"])

    def test_local_identity_does_not_contaminate_new_character(self):
        record(self.project, self.lesson)
        new_context = dict(self.context, subject_id="H_NEW_UNRELATED")
        self.assertEqual([], matching_rules(load_memory(self.memory_path), new_context))
        job = self.film_job()
        job["learning_context"] = new_context
        _, receipt = build(job, repair_memory=load_memory(self.memory_path))
        self.assertEqual([], receipt["applied_repair_rule_ids"])

    def test_general_style_rule_requires_conditional_scope_not_subject_copy(self):
        rule = dict(self.lesson, scope="CONDITIONAL_FAMILY", applies_when=dict(self.context))
        with self.assertRaisesRegex(ValueError, "cannot hard-code"):
            record(self.project, rule)
        rule["applies_when"].pop("subject_id")
        recorded = record(self.project, rule)
        self.assertEqual("CONDITIONAL_FAMILY", recorded["scope"])
        new_context = dict(self.context, subject_id="H_ANOTHER")
        self.assertEqual(1, len(matching_rules(load_memory(self.memory_path), new_context)))

    def test_failed_no_change_image_does_not_create_learning(self):
        defective = dict(self.lesson, after_path="art/before.png")
        with self.assertRaisesRegex(ValueError, "distinct"):
            record(self.project, defective)
        self.assertEqual([], load_memory(self.memory_path)["rules"])


if __name__ == "__main__":
    unittest.main()
