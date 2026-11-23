// Stage 1 acceptance (spec §4, §11): node --test tests/art_bridge/
// Fixtures are DIAGNOSTIC_FIXTURE rasters (make_fixtures.mjs); they test contracts, never art quality.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { humanGrip, worldPortal, invalidUnreachable, invalidMissingUnderpaint, invalidIllegalViewMorph } from "./make_fixtures.mjs";
import { runCheck } from "../../engine/tools/art_bridge_check.mjs";
import { solveTwoBonePosition, solveContactGraph } from "../../engine/art_bridge/constraints.mjs";
import { buildMethodTrace, checkMethodUses, TRACE_TABLE } from "../../engine/art_bridge/method_trace.mjs";
import { computeCoverage } from "../../engine/art_bridge/coverage.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), ROOT = path.join(here, "fixtures"), TMP = path.join(ROOT, "_tmp");
fs.mkdirSync(TMP, { recursive: true });
let n = 0;
async function check(doc, opts = {}) { const f = path.join(TMP, `m${n++}.json`); fs.writeFileSync(f, JSON.stringify(doc)); return runCheck({ root: ROOT, manifest: path.relative(ROOT, f), ...opts }); }
const codes = (r) => r.errors.map((e) => e.code);
const clone = (o) => JSON.parse(JSON.stringify(o));

test("valid examples pass", async () => {
  for (const m of [humanGrip(), worldPortal()]) { const r = await check(m); assert.equal(r.pass, true, JSON.stringify(r.errors, null, 1)); assert.equal(r.coverage.framesCovered, 7200); }
});
test("checked-in example files match the generator and pass/fail as named", async () => {
  const EX = path.join(here, "..", "..", "schemas", "examples");
  const expect = { valid_human_grip: null, valid_world_portal: null, invalid_unreachable_contact: "UNREACHABLE_IK", invalid_missing_underpaint: "MISSING_UNDERPAINT", invalid_illegal_view_morph: "INVALID_MORPH_TOPOLOGY" };
  for (const [name, code] of Object.entries(expect)) {
    const r = await runCheck({ root: ROOT, manifest: path.relative(ROOT, path.join(EX, `${name}.json`)) });
    if (code === null) assert.equal(r.pass, true, name); else { assert.equal(r.pass, false, name); assert.ok(codes(r).includes(code), `${name}: ${codes(r)}`); }
  }
});
test("unreachable contact reports exact missing distance", async () => {
  const r = await check(invalidUnreachable()); const e = r.errors.find((x) => x.code === "UNREACHABLE_IK");
  assert.ok(e); assert.deepEqual(e.frame_range, [60, 540]); assert.ok(e.details.missingDistance > 0);
});
test("missing underpaint", async () => { assert.ok(codes(await check(invalidMissingUnderpaint())).includes("MISSING_UNDERPAINT")); });
test("illegal view morph", async () => { assert.ok(codes(await check(invalidIllegalViewMorph())).includes("INVALID_MORPH_TOPOLOGY")); });
test("wrong pivot → UNREGISTERED_PIVOT", async () => { const m = humanGrip(); m.assets.find((a) => a.id === "forearm").pivot_xy = [131, 200]; assert.ok(codes(await check(m)).includes("UNREGISTERED_PIVOT")); });
test("invalid parent → error naming the asset", async () => { const m = humanGrip(); m.assets.find((a) => a.id === "forearm").parent_part_id = "nonexistent_part"; const r = await check(m); assert.equal(r.pass, false); assert.ok(r.errors.some((e) => e.record_id === "forearm"), JSON.stringify(codes(r))); });
test("rig with cyclic joints fails", async () => { const m = humanGrip(); m.rigs[0].joints[0].parent_id = "wrist"; const r = await check(m); assert.equal(r.pass, false); });
test("unsupported view state → UNSUPPORTED_VIEW", async () => { const m = humanGrip(); m.rigs[0].view_states.push({ id: "back", asset_bindings: { torso: "torso" }, landmark_correspondence: [], contact_set: [], view_facing: "back", required_underpaint: [], approved_review_id: "diag_review" }); assert.ok(codes(await check(m)).includes("UNSUPPORTED_VIEW")); });
test("circular layer order → OCCLUSION_CONFLICT", async () => { const m = humanGrip(); m.assets.find((a) => a.id === "torso").draw_order_constraints = [{ relation: "ABOVE", asset_id: "upper_arm" }]; assert.ok(codes(await check(m)).includes("OCCLUSION_CONFLICT")); });
test("hash mismatch / missing file / path escape", async () => {
  const a = humanGrip(); a.assets[1].sha256 = "0".repeat(64); assert.ok(codes(await check(a)).includes("ASSET_HASH_MISMATCH"));
  const b = humanGrip(); b.assets[1].file = "diag/does_not_exist.png"; assert.ok(codes(await check(b)).includes("MISSING_ART_ASSET"));
  const c = humanGrip(); c.assets[1].file = "../escape.png"; assert.equal((await check(c)).pass, false);
});
test("production mode rejects diagnostic fixtures", async () => { assert.ok(codes(await check(humanGrip(), { production: true })).includes("UNQUALIFIED_STYLE_ASSET")); });
test("continuous transition without middle art → MISSING_TRANSITION_STATE", async () => { const m = worldPortal(); m.transitions[0].middle_asset_ids = []; assert.ok(codes(await check(m)).includes("MISSING_TRANSITION_STATE")); });
test("schema rejects unknown top-level keys and wrong stage", async () => { const m = humanGrip(); m.extra = 1; assert.ok(codes(await check(m)).includes("SCHEMA_VIOLATION")); const k = humanGrip(); k.stage.fps = 30; assert.ok(codes(await check(k)).includes("SCHEMA_VIOLATION")); });

test("coverage walks every frame of [0,7200); gaps, overlaps and missing art spans are exact", () => {
  const m = clone(humanGrip()); m.shots = [{ ...m.shots[0], end_frame: 3000 }, { ...m.shots[0], id: "s2", start_frame: 3100, end_frame: 7200, required_asset_ids: ["absent_asset"] }];
  const c = computeCoverage(m);
  assert.equal(c.framesCovered, 7100);
  assert.deepEqual(c.errors.filter((e) => e.code === "SHOT_COVERAGE_GAP").map((e) => e.frame_range), [[3000, 3100]]);
  assert.deepEqual(c.missingArt, [{ asset_id: "absent_asset", frame_spans: [[3100, 7200]] }]);
  const o = clone(humanGrip()); o.shots.push({ ...o.shots[0], id: "dup", start_frame: 100, end_frame: 200 }); assert.ok(computeCoverage(o).errors.some((e) => e.code === "SHOT_COVERAGE_GAP" && e.frame_range[0] === 100));
});
test("static plate bound as an articulated rig → STATIC_PLATE_NOT_RIG", () => {
  const m = clone(humanGrip()); m.rigs[0].render_parts = [{ asset_id: "actor_master", joint_id: "pelvis", local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: "actor_master", material_owner_id: "diag_actor" }];
  assert.ok(computeCoverage(m).errors.some((e) => e.code === "STATIC_PLATE_NOT_RIG"));
});

test("two-bone IK: exact, non-clamping, bend-branch and degenerate", () => {
  const A = [0, 0], L1 = 80, L2 = 70;
  for (const T of [[100, 30], [-60, 90], [10, 145], [5, 12]]) for (const s of [1, -1]) {
    const { elbow: B, wrist: C } = solveTwoBonePosition(A, T, L1, L2, s, 1e-9);
    assert.ok(Math.abs(Math.hypot(B[0] - A[0], B[1] - A[1]) - L1) < 1e-9); assert.ok(Math.abs(Math.hypot(C[0] - B[0], C[1] - B[1]) - L2) < 1e-9); assert.ok(Math.hypot(C[0] - T[0], C[1] - T[1]) < 1e-9);
    const cross = (T[0] - A[0]) * (B[1] - A[1]) - (T[1] - A[1]) * (B[0] - A[0]); if (Math.hypot(...T) < L1 + L2 - 1e-6) assert.equal(Math.sign(cross), s);
  }
  assert.throws(() => solveTwoBonePosition(A, [200, 0], L1, L2, 1, 1e-9), (e) => e.code === "UNREACHABLE_IK" && Math.abs(e.details.missingDistance - 50) < 1e-9);
  assert.throws(() => solveTwoBonePosition(A, [5, 0], L1, L2, 1, 1e-9), (e) => e.code === "UNREACHABLE_IK");
  assert.throws(() => solveTwoBonePosition(A, [50, 0], L1, L2, 0, 1e-9), (e) => e.code === "UNAPPROVED_BEND_BRANCH");
  assert.throws(() => solveTwoBonePosition(A, [50, 0], -1, L2, 1, 1e-9), (e) => e.code === "INVALID_IK_INPUT");
  assert.throws(() => solveTwoBonePosition(A, A, 70, 70, 1, 1e-9), (e) => e.code === "DEGENERATE_IK");
});
test("contact graph solves only active contacts", () => {
  const scene = { contacts: [{ start_frame: 10, end_frame: 20, source_socket: "grip", target_socket: "h" }], chains: { grip: { A: [0, 0], L1: 80, L2: 70, bendSign: 1 } }, targets: { h: [1000, 0] } };
  assert.equal(solveContactGraph(5, scene).failures.length, 0);
  assert.equal(solveContactGraph(15, scene).failures[0].code, "UNREACHABLE_IK");
});

test("F01–F80 registry: exactly 80 rows, every verdict computed, no hand-set completion", async () => {
  assert.equal(Object.keys(TRACE_TABLE).length, 80);
  const t = await buildMethodTrace({}); assert.equal(t.length, 80);
  for (const r of t) { assert.ok(["NO_CONSUMER_YET", "PENDING_PROVIDER_PIXELS", "ART_PIXELS_PRESENT_REVIEW_PENDING", "CONSUMER_PROVED_MECHANICALLY", "CONSUMER_PRESENT_PROOF_PENDING"].includes(r.verdict)); assert.match(r.source_sha256, /^[0-9a-f]{64}$/); }
  assert.ok(!t.some((r) => r.class === "IMAGE_AUTHORSHIP" && r.verdict === "CONSUMER_PROVED_MECHANICALLY"));
});
test("declared method use without a real consumer → METHOD_NO_REAL_CONSUMER", async () => {
  assert.equal((await checkMethodUses([{ method_id: "F06", record_id: "x" }]))[0].code, "METHOD_NO_REAL_CONSUMER");
  assert.equal((await checkMethodUses([{ method_id: "F06", record_id: "x", consumer_id: "engine/art_bridge/graph.mjs#buildGraphs" }]))[0].code, "METHOD_NO_REAL_CONSUMER");
  assert.equal((await checkMethodUses([{ method_id: "F06", record_id: "x", consumer_id: TRACE_TABLE.F06[1] }])).length, 0);
  const m = humanGrip(); m.method_uses = [{ method_id: "F59", record_id: "actor_rig", consumer_id: "nope#nope" }]; assert.ok(codes(await check(m)).includes("METHOD_NO_REAL_CONSUMER"));
});
