// Stage 3 two-way art-to-motion contract — failing-first regression tests for the concrete Ines conflicts
// (hybrid_v2/evidence/stage3_contract/ROOT_CAUSES_AND_CONTRACT.md). Pre-repair run: hybrid_v2/evidence/stage3_contract/S3C_REPRODUCTION_BEFORE.txt.
process.env.ART_BRIDGE_TEST_TRUST = "1"; // only for the labelled TEST_TRUST design approval in S3C-7; production gates never accept it
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { compileArtJob } from "../../engine/art_bridge/art_requests.mjs";
import { planJobs } from "../../engine/art_bridge/art_intake.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FILM = path.join(REPO, "films", "hv2_film001"), W = path.join(REPO, "hybrid_v2", "work", "stage3_contract");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), OLD_DESIGN = path.join(here, "fixtures", "stage3", "ines_master.design.AUDITED_094a1d0.json");
const MEM = path.join(FILM, "learning", "REPAIR_MEMORY.json");
// the audited brief declared its family only in prose; the universal gate (directive E1) refuses an undeclared family outright, so these
// tests state the family the brief described (ACTING_HUMAN) to keep exercising the per-method checks they were written for
const OLD = () => ({ ...J(OLD_DESIGN), art_family: "ACTING_HUMAN" });
const inesJob = async () => (await planJobs({ film: FILM })).jobs.find((j) => j.root_dependency === "ines_master");
const ctx = () => ({ doc: J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan: J(path.join(FILM, "handoff", "ART_DEPENDENCY_PLAN.json")), motionPlans: { S02: J(path.join(FILM, "handoff", "MOTION_PLAN_S02.json")) }, film: FILM });
let JOB; test.before(async () => { JOB = await inesJob(); });
const refusal = (fn) => { try { fn(); return { refused: false, codes: [] }; } catch (e) { return { refused: e.code === "ART_CONTRACT_REFUSED", codes: (e.details?.failures || []).map((f) => `${f.code}${f.method ? ":" + f.method : ""}`), error: e }; } };

test("S3C-1 method fidelity: the audited Ines brief (F64 bound as hand construction, F05/F52 mislabelled) is refused before compile", async () => {
  const r = refusal(() => compileArtJob(JOB, { baseJob: OLD(), outDir: path.join(W, "s1"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" }));
  assert.ok(r.refused, "audited design compiled"); for (const m of ["F64", "F05", "F52"]) assert.ok(r.codes.includes(`METHOD_BINDING_MISMATCH:${m}`), r.codes.join(","));
});
test("S3C-2 rig-forced generic geometry without source grounding is refused", async () => {
  const r = refusal(() => compileArtJob(JOB, { baseJob: OLD(), outDir: path.join(W, "s2"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" }));
  assert.ok(r.codes.some((c) => c.startsWith("UNGROUNDED_DESIGN_DECISION")), r.codes.join(","));
});
test("S3C-3 absent (or placeholder) molecular_visual_decisions cannot pass", async () => {
  const r = refusal(() => compileArtJob(JOB, { baseJob: OLD(), outDir: path.join(W, "s3"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" })); assert.ok(r.codes.includes("MOLECULAR_DECISIONS_MISSING"), r.codes.join(","));
  const d = J(path.join(FILM, "art_designs", "ines_master.design.json")); d.molecular_visual_decisions.highest_impact_question = "Which compositional construction would prove THIS new causal claim?";
  const r2 = refusal(() => compileArtJob(JOB, { baseJob: d, outDir: path.join(W, "s3b"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" })); assert.ok(r2.codes.includes("MOLECULAR_DECISIONS_PLACEHOLDER"), r2.codes.join(","));
});
test("S3C-4 view agreement: the motion contract carries the rig's canonical view, and a design/motion view mismatch is refused", async () => {
  assert.equal((await inesJob()).motion_context.view_id, "threeq_r");
  const d = J(path.join(FILM, "art_designs", "ines_master.design.json")); d.first_pass_control.character_designs[0].view_id = "front";
  assert.ok(refusal(() => compileArtJob(JOB, { baseJob: d, outDir: path.join(W, "s4"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" })).codes.includes("CONTRACT_VIEW_MISMATCH"));
});
test("S3C-5 alpha agreement: a STRAIGHT-alpha master compiles with transparent_background true (contract-owned), and a design alpha mismatch is refused", async () => {
  const c = compileArtJob(JOB, { baseJob: J(path.join(FILM, "art_designs", "ines_master.design.json")), outDir: path.join(W, "s5"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" });
  const req = J(path.join(W, "s5", "IMAGEGEN_REQUEST.json")); assert.equal(req.transparent_background, true); assert.equal(c.gate.pass, true); assert.ok(fs.existsSync(path.join(W, "s5", "BRIDGE_REQUEST_CONTRACT.json")));
  const d = J(path.join(FILM, "art_designs", "ines_master.design.json")); d.output.alpha_mode = "OPAQUE";
  assert.ok(refusal(() => compileArtJob(JOB, { baseJob: d, outDir: path.join(W, "s5b"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" })).codes.includes("CONTRACT_ALPHA_MISMATCH"));
});
test("S3C-6 applicability: every method the subject family + motion contract makes applicable is bound faithfully (not all 80)", async () => {
  const { requiredMethods } = await import("../../engine/art_bridge/art_contract.mjs");
  const req = requiredMethods({ design: J(path.join(FILM, "art_designs", "ines_master.design.json")), job: await inesJob(), ...ctx() }).map((x) => x.method);
  for (const m of ["F01", "F05", "F06", "F52", "F58", "F59", "F61", "F62", "F64", "F65", "F66", "F67", "F79", "F80"]) assert.ok(req.includes(m), `${m} missing from ${req}`);
  for (const m of ["F68", "F69", "F71", "F73"]) assert.ok(!req.includes(m), `${m} wrongly required`);
  const r = refusal(() => compileArtJob(JOB, { baseJob: OLD(), outDir: path.join(W, "s6"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" }));
  for (const m of ["F06", "F65", "F66", "F67"]) assert.ok(r.codes.includes(`MISSING_APPLICABLE_METHOD:${m}`), r.codes.join(","));
});
test("S3C-7 a faithful design passes every automated gate but cannot be submitted without a HUMAN design approval", async () => {
  const { preGenerationGate } = await import("../../engine/art_bridge/art_contract.mjs");
  const g = preGenerationGate({ design: J(path.join(FILM, "art_designs", "ines_master.design.json")), job: await inesJob(), ...ctx() });
  assert.equal(g.pass, true, JSON.stringify(g.failures, null, 1)); assert.equal(g.design_approval.status, "BLOCKED_ON_DESIGN_APPROVAL");
  const I = await import("../../engine/art_bridge/art_intake.mjs"), { startProviderStub } = await import("./roundtrip_fixture.mjs"), { exportOutbox } = await import("../../engine/tools/art_outbox.mjs");
  const out = path.join(W, "outbox7"); await exportOutbox({ film: FILM, out }); const job = J(path.join(out, "OUTBOX_INDEX.json")).index.find((r) => r.asset === "ines_master").artjob_id;
  const stub = await startProviderStub(path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "hand_palm.png"));
  try { const r = await I.submitJob({ film: FILM, out, job, env: { IMAGE_PROVIDER: "openai-images", IMAGE_PROVIDER_MODEL: "stub", OPENAI_API_KEY: "test-key-not-real", OPENAI_BASE_URL: stub.url, IMAGE_PROVIDER_CAPS: JSON.stringify({ generate: true, edit: true, transparentRaster: true, multipleReferences: true }) } });
    // directive N3 precedence: story → direction → contract → design; the proposed film has none of the human receipts
    assert.equal(r.status, "REFUSED"); assert.ok(["STORY_APPROVAL_REQUIRED", "DESIGN_APPROVAL_REQUIRED"].includes(r.code), r.code); assert.equal(stub.requests().length, 0); } finally { await stub.close(); }
});
test("S3C-8 (E) approved art determines the rig: different arm proportions are FITTED, not refused; infeasible action → restaging required; approved restaging → feasible", async () => {
  const { buildRigFitCase } = await import("./stage3_rigfit_fixture.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
  const c = await buildRigFitCase(path.join(W, "rigfit"));
  const r = await I.ingestMaster({ film: c.film, asset: "pilot_master", file: c.master, landmarks: c.landmarks, provenance: "DIAGNOSTIC_FIXTURE" });
  assert.equal(r.status, "REGISTERED_PENDING_REVIEW", JSON.stringify(r).slice(0, 400));
  const doc = J(c.manifest), rig = doc.rigs[0], elbow = rig.joints.find((j) => j.id === "elbow_r").rest_xy;
  assert.ok(Math.hypot(elbow[0] - c.measured.elbow_r[0], elbow[1] - c.measured.elbow_r[1]) < 1e-6, `rig elbow ${elbow} vs measured ${c.measured.elbow_r}`);
  const fit = J(path.join(c.film, "registration", "pilot_master", "RIG_FIT_RECEIPT.json")); assert.equal(fit.pixels_changed, false); assert.ok(fit.limb_changes.some((l) => Math.abs(l.ratio - 1) > 0.05));
  assert.equal(fit.feasibility.status, "INFEASIBLE_REQUIRES_RESTAGING_OR_NEW_POSE_ART"); assert.ok(fit.feasibility.failures.some((f) => /UNREACHABLE_IK/.test(f.code)));
  const re = await I.checkRigFeasibility({ film: c.film, identity: "pilot", motionPlan: c.restagedPlan }); assert.equal(re.status, "FEASIBLE");
  const dep = await I.resumeDependentJobs({ film: c.film }); assert.ok(dep.filter((d) => d.role === "DERIVED").every((d) => d.status !== "READY_FOR_SOURCE_ATTACHED_EDIT"), "dependents must wait for a feasible, approved fit");
});
test("S3C-9 (F) a genuinely unsuitable design fails before generation even when every field has text", async () => {
  const d = J(path.join(FILM, "art_designs", "ines_master.design.json")); d.first_pass_control.character_designs[0].family = "HUMAN_REAR_OCCLUDED";
  for (const b of d.method_decisions) if (b.method_id === "F64") b.structured_decision.illustration_family = "REAR_OR_OCCLUDED"; d.first_pass_control.subject_specs[0].family = "HUMAN_REAR_OCCLUDED";
  const r = refusal(() => compileArtJob(JOB, { baseJob: d, outDir: path.join(W, "s9"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" }));
  assert.ok(r.codes.includes("FAMILY_INCOMPATIBLE_WITH_MOTION"), r.codes.join(","));
  const d2 = J(path.join(FILM, "art_designs", "ines_master.design.json")); d2.first_pass_control.character_designs[0].state_family = d2.first_pass_control.character_designs[0].state_family.filter((s) => s !== "profile_turn");
  assert.ok(refusal(() => compileArtJob(JOB, { baseJob: d2, outDir: path.join(W, "s9b"), repairMemory: MEM, contract: ctx(), jobFrom: "ines_master" })).codes.includes("CONTRACT_STATE_MISSING"));
});
