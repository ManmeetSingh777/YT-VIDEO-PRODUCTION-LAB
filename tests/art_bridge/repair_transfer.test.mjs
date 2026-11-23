// Directive K — L01..L06 reusable repair learning. Rules here use DIAGNOSTIC fixture images (provenance recorded); they prove the
// mechanics of predicate selection, conflict blocking, first-pass delivery and invalidation — never artistic learning (L05).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import url from "node:url";
import { tempFilm, W } from "./universal_fixture.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const RM = await import("../../engine/art_bridge/repair_memory.mjs"), R = await import("../../engine/art_bridge/art_requests.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const BEFORE = path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "crank_base.png"), AFTER = path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "crank_handle.png");
const rule = (id, applies, extra = {}) => ({ rule_id: id, scope: "CONDITIONAL_FAMILY", status: "REPAIR_DEMONSTRATED", applies_when: applies, root_cause: "eye marks were chosen for a mid-distance crop but the head is large on screen", first_request_change: "choose the eye mode from the projected head size before drawing the face", positive_construction_ops: ["draw white almond eye openings with dark pupils when the projected head exceeds the sclera threshold"], source_contrast: "close runner (sclera) vs mid-distance farmer (dark marks)", observed_improvement: "gaze direction became readable at intended size", regression_boundary: "never apply to faces smaller than the sclera threshold or to rear views", before_sha256: fsha(BEFORE), after_sha256: fsha(AFTER), evidence_provenance: "DIAGNOSTIC_FIXTURE", ...extra });
const ctxInes = { family: "ACTING_HUMAN", view: "threeq_r", world_class: "UNSPECIFIED", subject_id: "ines" };
const setup = async (tag, rules) => { const film = tempFilm(tag); fs.writeFileSync(path.join(film, "learning", "REPAIR_MEMORY.json"), JSON.stringify({ version: 1, rules }, null, 2)); const { jobs } = await I.planJobs({ film }); return { film, job: jobs.find((j) => j.root_dependency === "ines_master"), mem: path.join(film, "learning", "REPAIR_MEMORY.json") }; };

test("L01 a failure is recorded against its producer (general class, predicate, invariant); scene-named classes are refused", () => {
  const root = path.join(W, "l01"); fs.rmSync(root, { recursive: true, force: true });
  const rec = { failure_id: "FX-EYE-MODE-001", failure_class: "EYE_MODE_WRONG_FOR_PROJECTED_SCALE", applicability: { family: "ACTING_HUMAN", projected_head_px: ">=120" }, invariant: "eye mode follows projected head size", producer: "films/*/art_designs (F65 decision)", root_mechanism: "decision fixed before the projected size was known", before: { input_hash: fsha(BEFORE) }, status: "IMPLEMENTED_UNQUALIFIED" };
  const f = RM.recordFailure(root, rec); assert.ok(fs.existsSync(f)); assert.throws(() => RM.recordFailure(root, rec)); // immutable
  assert.throws(() => RM.recordFailure(root, { ...rec, failure_id: "FX-2", failure_class: "INES_EYES_TOO_SMALL" }), /general type/);
  const skillRule = RM.promoteToSkillRule(rec, rule("R-EYE-SCALE-1", { family: "ACTING_HUMAN" })); assert.equal(skillRule.failure_id, rec.failure_id);
  assert.throws(() => RM.promoteToSkillRule(rec, rule("R-X", { family: "ACTING_HUMAN", subject_id: "ines" })), /hard-code/);
});

test("L02 a NEW first pass (no local patch) consumes the matching rule: the compiled request carries its positive operations", async () => {
  const { film, job, mem } = await setup("l02", [rule("R-EYE-SCALE-1", { family: "ACTING_HUMAN" })]);
  const c = R.compileArtJob(job, { film, outDir: path.join(W, "l02", "c"), repairMemory: mem }); assert.deepEqual(c.applied_repair_rule_ids, ["R-EYE-SCALE-1"]);
  const p = J(path.join(W, "l02", "c", "STAGE_01_REQUEST.json")).prompt; assert.ok(p.includes("draw white almond eye openings with dark pupils"), "rule operation missing from the first-pass request");
});

test("L03 a non-matching subject receives no rule", async () => {
  const { film, job, mem } = await setup("l03", [rule("R-MACHINE-1", { family: "MACHINE_OR_MECHANISM" })]);
  const c = R.compileArtJob(job, { film, outDir: path.join(W, "l03", "c"), repairMemory: mem }); assert.deepEqual(c.applied_repair_rule_ids, []);
  assert.equal(RM.selectRules({ memory: J(mem), context: ctxInes }).rules.length, 0);
});

test("L04 a rule contradicting the approved design/source blocks (REPAIR_RULE_CONFLICT) instead of being chosen", async () => {
  const bad = rule("R-DARK-MARKS", { family: "ACTING_HUMAN" }, { contradicts: [{ method_id: "F65", forbidden_decision_pattern: "WHITE_SCLERA", reason: "rule demands dark-mark eyes; the design's F65 decision chose white sclera" }] });
  const { film, job, mem } = await setup("l04", [bad]);
  assert.throws(() => R.compileArtJob(job, { film, outDir: path.join(W, "l04", "c"), repairMemory: mem }), (e) => e.code === "REPAIR_RULE_CONFLICT");
  assert.throws(() => RM.selectRules({ memory: { version: 1, rules: [rule("A", { family: "ACTING_HUMAN" }, { excludes: ["B"] }), rule("B", { family: "ACTING_HUMAN" })] }, context: ctxInes }), (e) => e.code === "REPAIR_RULE_CONFLICT");
});

test("L05 diagnostic or missing pixels can never mark artistic learning qualified", () => {
  assert.equal(RM.ruleQualification(rule("R", { family: "ACTING_HUMAN" })).status, "IMPLEMENTED_UNQUALIFIED");
  assert.equal(RM.ruleQualification({ ...rule("R", { family: "ACTING_HUMAN" }), evidence_provenance: undefined }).status, "IMPLEMENTED_UNQUALIFIED");
  assert.equal(RM.ruleQualification({ ...rule("R", { family: "ACTING_HUMAN" }), evidence_provenance: "GPT_PROVIDER_ART", transfer_test: { result: "PASS", unlike_subject: "x" } }).status, "IMPLEMENTED_UNQUALIFIED", "self-described provenance/PASS fields are not evidence (F083)");
});

test("L06 a memory change invalidates only the jobs whose predicate it matches", async () => {
  const { film, job, mem } = await setup("l06", []), design = J(path.join(film, "art_designs", "ines_master.design.json")), d = () => R.dependencyDigest({ job, design, repairMemory: mem }).digest, d0 = d();
  fs.writeFileSync(mem, JSON.stringify({ version: 1, rules: [rule("R-MACHINE-1", { family: "MACHINE_OR_MECHANISM" })] })); assert.equal(d(), d0, "an unrelated rule must not stale this job");
  fs.writeFileSync(mem, JSON.stringify({ version: 1, rules: [rule("R-MACHINE-1", { family: "MACHINE_OR_MECHANISM" }), rule("R-EYE-SCALE-1", { family: "ACTING_HUMAN" })] })); assert.notEqual(d(), d0, "a matching rule must stale this job");
});
