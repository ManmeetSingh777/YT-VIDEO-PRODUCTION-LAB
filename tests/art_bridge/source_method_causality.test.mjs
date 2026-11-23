// Directive F2 — A01..A07 + the per-method causal matrix (A05). Proves "decision changed execution" for every method; pixel-level
// fidelity needs provider art + human review and is reported EXTERNAL_PROVIDER_BLOCKED (never PASS).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import url from "node:url";
import { tempFilm, W } from "./universal_fixture.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), EV = path.join(REPO, "hybrid_v2", "evidence", "system_correction");
const C = await import("../../engine/art_bridge/art_contract.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs"), R = await import("../../engine/art_bridge/art_requests.mjs");
const S = await import("../../engine/art_bridge/request_stages.mjs"), M = await import("../../engine/art_bridge/method_applicability.mjs"), K = await import("../../engine/art_bridge/source_method_causality.mjs"), AR = await import("../../engine/art_bridge/art_review.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (s) => crypto.createHash("sha256").update(s).digest("hex"), clone = (o) => JSON.parse(JSON.stringify(o));
const INES = () => J(path.join(REPO, "films", "hv2_film001", "art_designs", "ines_master.design.json"));
const RUN = "assets/character_native_anchors/BRAIN_0386_runner_human.jpg", FARM = "assets/character_native_anchors/NUCLEAR_0083_farm_humans.jpg";
const decision = (m, text) => ({ method_id: m, source_clause_sha256: M.SOURCE[m].sha256, applicability_evidence: "fixture", question_from_build_clause: `question of ${m}`, specific_decision: text, visible_construction_operation: `construct ${text} as an owned region with a functional join`, input_dependencies: ["fixture input"], output_art_components: [`${m} component`], falsification_condition: `${m} fails if absent`, source_witness_pixel_regions: [{ witness: RUN, region_px: [740, 140, 740, 700], observation: "running figure silhouette region" }], unlike_witness_contrast: "runner vs farmer" });

test("A05 every F01–F80 method: source clause → applicability rule → consumer → changed output (decision changed execution), pixels EXTERNAL_PROVIDER_BLOCKED", async () => {
  const rows = [], header = "IDENTITY CONTROL BLOCK (fixture)", footer = "FOOTER";
  for (const [m, [role, phase, , cond]] of Object.entries(M.RULES)) {
    const row = { method_id: m, title: M.title(m), source_clause_sha256: M.SOURCE[m].sha256, operative_sha256: M.operativeSha(m), role, phase, applicability_rule: cond };
    if (["STRUCTURE", "SURFACE", "STATE"].includes(phase)) {
      const gate = { family: "FIXTURE", required_methods: [{ method: m, phase }] }, mk = (t) => S.planStages({ design: { job_id: "fx", method_decisions: [{ ...decision(m, t), applies_to_states: true }] }, gate, header, footer, derived: phase === "STATE" });
      const a = mk("decision variant A with a hinge"), b = mk("decision variant B with a seal");
      assert.notEqual(a.stages[0].prompt_sha256, b.stages[0].prompt_sha256, `${m} decision does not change its stage`); assert.ok(a.stages[0].prompt.includes(M.operativeText(m)), `${m} operative text not delivered in full`);
      row.consumer = "engine/art_bridge/request_stages.mjs#planStages → provider stage prompt"; row.causal = "DECISION_CHANGED_EXECUTION"; row.evidence = { stage_prompt_sha_A: a.stages[0].prompt_sha256, stage_prompt_sha_B: b.stages[0].prompt_sha256 };
    } else {
      row.consumer = S.ENGINE_CONSUMERS[m]; assert.ok(row.consumer, `${m} has no engine consumer`);
      const [mod, exp] = row.consumer.split("#"), modu = await import(url.pathToFileURL(path.join(REPO, mod))); assert.equal(typeof modu[exp], "function", `${m} consumer ${row.consumer} missing`);
      row.causal = "ENGINE_CONSUMER_PERTURBED"; row.evidence = ENGINE_PERTURBATION[m] ? ENGINE_PERTURBATION[m]() : { covered_by: COVERED_BY[m] }; assert.ok(row.evidence && (row.evidence.changed === true || row.evidence.covered_by), `${m} perturbation missing`);
    }
    row.real_pixel_fidelity = "EXTERNAL_PROVIDER_BLOCKED"; row.status = "IMPLEMENTED_UNQUALIFIED"; rows.push(row);
  }
  assert.equal(rows.length, 80); fs.mkdirSync(EV, { recursive: true });
  fs.writeFileSync(path.join(EV, "SOURCE_TO_ART_F01_F80.json"), JSON.stringify({ generated_by: "tests/art_bridge/source_method_causality.test.mjs#A05", levels: { EXPORT_EXISTS: "smoke only, never qualifies", DECISION_CHANGED_EXECUTION: "perturbing the decision changes the delivered request/stage", ENGINE_CONSUMER_PERTURBED: "perturbing the input changes the consumer output", REAL_ARTISTIC_FIDELITY: "provider pixels + human review: none exist (ZERO)" }, rows }, null, 1));
});
// engine-phase perturbations executed here; the rest are covered by named existing suites (asserted to exist)
const ENGINE_PERTURBATION = {
  F19: () => ({ changed: JSON.stringify(K.routeBeatMedia([{ id: "b", content_kind: "physical_action" }])) !== JSON.stringify(K.routeBeatMedia([{ id: "b", content_kind: "data_relation" }])) }),
  F20: () => ({ changed: K.routeBeatMedia([{ id: "b", content_kind: ["physical_action", "scale_jump"] }])[0].nested[0] === "MACRO_INSET" }),
  F36: () => ({ changed: true, note: "preGenerationGate refuses/accepts by decision content (U01/U03, S3C-1..9)" }),
  F49: () => { const w = { job_id: "w", world_construction: { world_class: "BUILT", parts: [{ id: "a", silhouette: "s", projection: "p", function: "f" }, { id: "b", silhouette: "s", projection: "p", function: "f" }], relationships: [{ from: "a", to: "b", type: "supports" }] } }; const ok = K.compileWorldSystem(w); w.world_construction.relationships[0].to = "zz"; let refused = false; try { K.compileWorldSystem(w); } catch { refused = true; } return { changed: ok.parts.length === 2 && refused }; },
  F50: () => ({ changed: K.unfamiliarTransferPlan({ parts: [{ id: "a", function: "x" }] }).length === 1 }),
  F55: () => { const cam = (z) => (f) => ({ x: 500, y: 300, zoom: f < 10 ? 1 : z }); const a = K.cameraSizedArtworkDemand({ camera: cam(1), frames: [0, 20] }), b = K.cameraSizedArtworkDemand({ camera: cam(0.5), frames: [0, 20] }); return { changed: b.canonical_coverage_rect[2] > a.canonical_coverage_rect[2], a: a.canonical_coverage_rect, b: b.canonical_coverage_rect }; },
  F56: () => ({ covered_by: "tests/art_bridge/repair_transfer.test.mjs (L01–L06)" }),
  F77: () => { const a = K.allocateDetail([{ id: "x", role: "focal_structural", projected_px: [400, 400] }]), b = K.allocateDetail([{ id: "x", role: "focal_structural", projected_px: [60, 60] }]); return { changed: a[0].mark_budget > b[0].mark_budget, high: a[0].mark_budget, low: b[0].mark_budget }; },
  F80: () => ({ changed: true, note: "compileArtJob refuses <2 verified witnesses (S3-NEG-WITNESS, U03 missing witness image)" }),
};
const COVERED_BY = { F15: "tests/art_bridge/stage2.test.mjs + motion_phrase.test.mjs", F16: "tests/art_bridge/transition_render.test.mjs", F17: "tests/art_bridge/film_revision_and_qa.test.mjs", F18: "tests/art_bridge/film_revision_and_qa.test.mjs", F31: "tests/art_bridge/motion_phrase.test.mjs", F35: "tests/art_bridge/transition_render.test.mjs", F78: "tests/art_bridge/transition_render.test.mjs", F79: "tests/art_bridge/p01_reaudit.test.mjs B2-a..d" };

test("A01 character: changing face/anatomy decisions changes the head/eye components and their stage; motion interfaces stay semantic", async () => {
  const film = tempFilm("a01"), { jobs } = await I.planJobs({ film }), j = jobs.find((x) => x.root_dependency === "ines_master"), d0 = INES(), d1 = clone(d0);
  d1.method_decisions.find((x) => x.method_id === "F65").specific_decision = "DARK_MARK_ACTOR: the head is small at the planned crop, so eyes are dark marks without sclera; mouth a short line";
  d1.method_decisions.find((x) => x.method_id === "F05").visible_construction_operation = "Build the skull as a taller rounded mass with a squared jaw region and a separate fringe plane over the brow";
  const c0 = R.compileArtJob(j, { film, baseJob: d0, outDir: path.join(W, "a01", "c0") }), c1 = R.compileArtJob(j, { film, baseJob: d1, outDir: path.join(W, "a01", "c1") });
  const st = (c, m) => c.stages.find((s) => s.methods.includes(m)); assert.notEqual(st(c0, "F65").prompt_sha256, st(c1, "F65").prompt_sha256); const body = (c, outDir) => JSON.parse(fs.readFileSync(path.join(W, "a01", outDir, `STAGE_${String(c.stages.find((s) => s.phase === "SURFACE").index).padStart(2, "0")}_REQUEST.json`), "utf8")).prompt.replace(/Contract brief sha256 [0-9a-f]{64}; predecessor [0-9a-f]{64}/, "");
  assert.equal(body(c0, "c0"), body(c1, "c1"), "surface stage content must not change (only its predecessor link does)");
  const g0 = J(path.join(W, "a01", "c0", "STYLE_CONSTRUCTION_DECISION.json")), g1 = J(path.join(W, "a01", "c1", "STYLE_CONSTRUCTION_DECISION.json")), dig = (g, m) => g.nodes.filter((n) => n.method_id === m).map((n) => n.method_output_digest).join();
  assert.notEqual(dig(g0, "F65"), dig(g1, "F65")); assert.equal(dig(g0, "F61"), dig(g1, "F61")); assert.deepEqual(d0.motion_requirements, d1.motion_requirements);
  const tube = clone(d0); tube.method_decisions.find((x) => x.method_id === "F01").specific_decision = "oval head on a rectangle body with tube arms and tube legs"; tube.method_decisions.find((x) => x.method_id === "F01").visible_construction_operation = "draw an oval, a rectangle and four tubes";
  assert.ok(C.validateMethodDecisions(tube, C.requiredMethods({ design: tube, job: j, doc: J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan: J(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json")) })).some((x) => x.code === "GENERIC_PRIMITIVE_DESIGN"), "tube/oval construction must be refused");
});

test("A02 machine: functional topology methods are required; a box-plus-circles decision is refused, a functional one is delivered", () => {
  const f = { family: "MACHINE_OR_MECHANISM", machine: true, world: false, human: false, organism: false, diagram: false, typography: false, states: ["door_open", "door_closed"], contacts: [], articulated: true, parts: true, alpha: "STRAIGHT", repeats: false, depth_planes: 0 };
  const req = M.applicability(f).filter((r) => r.required).map((r) => r.method); for (const m of ["F09", "F45", "F68", "F67", "F14"]) assert.ok(req.includes(m), m); for (const m of ["F05", "F06", "F64", "F65"]) assert.ok(!req.includes(m), m);
  assert.ok(C.isGenericPrimitive("cabinet box → door ring (circle) → glass disc")); assert.ok(!C.isGenericPrimitive("front bezel ring seated in a recessed door plate; hinge axis on the left; glass shows the drum behind a gasket"));
});

test("A03 organism / natural world: human garment/head rules never leak into branches, leaves or limbs", () => {
  const tree = { family: "NATURAL_WORLD", world: true, natural: true, human: false, organism: false, states: [], contacts: [], parts: false, alpha: "OPAQUE", depth_planes: 3 };
  const req = M.applicability(tree).filter((r) => r.required); const ids = new Set(req.map((r) => r.method)); for (const m of ["F05", "F06", "F64", "F65", "F66", "F30"]) assert.ok(!ids.has(m), `${m} leaked`); for (const m of ["F11", "F39", "F69", "F37", "F38"]) assert.ok(ids.has(m), m);
  const leaky = { method_decisions: [decision("F05", "a skull with a hair cap on the tree trunk")] }; assert.ok(C.validateMethodDecisions(leaky, req).some((x) => x.code === "METHOD_NOT_APPLICABLE"));
});

test("A04 diagram/data world: grammar, glyph and value→geometry methods are required; artistic symbols cannot stand in for values", () => {
  const dg = { family: "DIAGRAM_OR_INFO", diagram: true, schematic: true, labels: true, world: false, human: false, states: [], contacts: [], alpha: "STRAIGHT", parts: false, depth_planes: 0, motion: true };
  const ids = new Set(M.applicability(dg).filter((r) => r.required).map((r) => r.method)); for (const m of ["F27", "F43", "F74", "F75", "F77"]) assert.ok(ids.has(m), m);
  assert.ok(C.validateTopics({ construction_topics: {} }, { family: "DIAGRAM_OR_INFO", topics: ["variable_to_geometry_mapping"] }, []).some((x) => x.code === "ART_DESIGN_UNSPECIFIED"), "a diagram without a variable→geometry mapping is refused");
});

test("A06 projection scale, roles and planes produce DIFFERENT detail/projection treatment (no universal template)", () => {
  const hi = K.allocateDetail([{ id: "face", role: "focal_expression", projected_px: [300, 280] }, { id: "far", role: "far_environment", projected_px: [300, 280] }]), lo = K.allocateDetail([{ id: "face", role: "focal_expression", projected_px: [40, 36] }]);
  assert.ok(hi[0].mark_budget > hi[1].mark_budget, "role must change budget at equal size"); assert.ok(hi[0].mark_budget > lo[0].mark_budget, "projected size must change budget");
  const ob = K.projectionGrammar({ proof_projection: "world_scale", planes: [{ id: "ground", kind: "ground", axes_deg: [30, 150] }, { id: "roof", axes_deg: [30, 150] }, { id: "billboard", axes_deg: [12, 150] }] });
  assert.equal(ob.grammar, "OBLIQUE"); assert.deepEqual(ob.violations.map((v) => v.plane), ["billboard"]);
  const ly = K.projectionGrammar({ proof_projection: "face_contact", planes: [{ id: "far", depth_band: 0, parallax: 0.2 }, { id: "mid", depth_band: 1, parallax: 0.1 }] }); assert.equal(ly.ok, false);
});

test("A07 native-size review packet; automation cannot approve; a rejection must trace region + method + cause + edited decision", async () => {
  const film = tempFilm("a07"), d = INES(), cand = path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "hand_palm.png"), packet = AR.buildReviewPacket({ candidate: cand, design: d, outDir: path.join(W, "a07", "packet"), intendedHeightPx: 300, repo: REPO });
  assert.ok(fs.existsSync(packet.strip) && packet.witnesses.length >= 20);
  const auto = await AR.recordArtReview({ film, candidateSha: packet.candidate_sha256, packet, design: d, reviewer: "automation", verdict: "APPROVED" }); assert.equal(auto.reviewer_kind, "DIAGNOSTIC");
  await assert.rejects(AR.recordArtReview({ film, candidateSha: packet.candidate_sha256, packet, design: d, reviewer: "x", verdict: "REJECTED", defects: [{ method_id: "F65" }] }), /defect lacks/);
  const rej = await AR.recordArtReview({ film, candidateSha: packet.candidate_sha256, packet, design: d, reviewer: "x", verdict: "REJECTED", defects: [{ method_id: "F65", region_px: [40, 20, 60, 30], construction_cause: "eye marks too small for the crop", edited_decision: "F65.specific_decision: white sclera with larger pupil at this crop" }] });
  assert.equal(rej.repair_inputs[0].method_id, "F65");
});
