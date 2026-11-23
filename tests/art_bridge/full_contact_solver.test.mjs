// Directive I2/I6 — M02 multi-quadrant IK + branches + FK reprojection (the historical 90°/radian class), M03 orientation-constrained grip on
// a rotating target (reversed palm fails at zero XY), M05 support shifting with planted feet and balance, M10 all-frame feasibility.
import test from "node:test"; import assert from "node:assert/strict";
import path from "node:path"; import url from "node:url"; import fs from "node:fs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const K = await import("../../engine/art_bridge/constraints.mjs"), S = await import("../../engine/art_bridge/contact_solver.mjs");

test("M02 every quadrant, both bend branches: FK of the returned RADIAN angles reproduces the target; reach limits and degeneracy refuse", () => {
  const A = [0, 0], L1 = 80, L2 = 60;
  for (const q of [[90, 40], [-90, 40], [-90, -40], [90, -40], [0, 120], [120, 0], [0, -21], [-21, 0]]) for (const bend of [1, -1]) {
    const s = K.solveTwoBonePosition(A, q, L1, L2, bend), w = [A[0] + L1 * Math.cos(s.shoulderAngle) + L2 * Math.cos(s.forearmAngle), A[1] + L1 * Math.sin(s.shoulderAngle) + L2 * Math.sin(s.forearmAngle)];
    assert.ok(Math.hypot(w[0] - q[0], w[1] - q[1]) < 1e-9, `FK reprojection ${q} bend ${bend}`);
    const asDeg = [A[0] + L1 * Math.cos((s.shoulderAngle * Math.PI) / 180) + L2 * Math.cos((s.forearmAngle * Math.PI) / 180), 0]; assert.ok(Math.hypot(asDeg[0] - q[0], asDeg[1] - q[1]) > 1, "interpreting radians as degrees must be visibly wrong (historical bug class)");
  }
  const up = K.solveTwoBonePosition(A, [0, 100], L1, L2, 1), dn = K.solveTwoBonePosition(A, [0, 100], L1, L2, -1); assert.notDeepEqual(up.elbow.map(Math.round), dn.elbow.map(Math.round), "the two branches are distinct");
  assert.throws(() => K.solveTwoBonePosition(A, [141, 0], L1, L2, 1), (e) => e.code === "UNREACHABLE_IK"); assert.throws(() => K.solveTwoBonePosition(A, [19, 0], L1, L2, 1), (e) => e.code === "UNREACHABLE_IK");
  assert.throws(() => K.solveTwoBonePosition(A, [0, 0], 50, 50, 1), (e) => ["DEGENERATE_IK", "UNREACHABLE_IK"].includes(e.code)); assert.throws(() => K.solveTwoBonePosition(A, [50, 0], L1, L2, 0), (e) => e.code === "UNAPPROVED_BEND_BRANCH");
  const lim = S.solveContact({ root: { x: 0, y: 0 }, chain: [{ id: "u", length: 80, limit_deg: [-10, 10] }, { id: "f", length: 60, limit_deg: [0, 20] }], target: { x: 0, y: 120 } });
  assert.equal(lim.ok, false); assert.equal(lim.failures[0].code, "JOINT_LIMIT_EXCEEDED"); assert.ok(lim.residual_px > 1, "limits are enforced, never clamped into a fake contact");
});

test("M03 orientation-constrained grip follows a ROTATING target within tolerance; a reversed palm FAILS even with zero XY error", () => {
  const chain = [{ id: "upper", length: 80, limit_deg: [-170, 170] }, { id: "fore", length: 70, limit_deg: [0, 150] }, { id: "hand", length: 18, limit_deg: [-80, 80] }];
  let prev = null; const log = [];
  for (let f = 0; f <= 60; f += 6) { const ang = (f / 60) * 60, hx = 100 + 25 * Math.cos((ang * Math.PI) / 180), hy = 50 + 25 * Math.sin((ang * Math.PI) / 180);
    const r = S.solveContact({ root: { x: 0, y: 0 }, chain, target: { x: hx, y: hy, angle_deg: ang + 60 }, pose0: prev, tol: { px: 0.5, deg: 2 } }); assert.ok(r.ok, `frame ${f}: ${JSON.stringify(r.failures)}`); prev = r.angles; log.push({ f, residual_px: r.residual_px, residual_deg: r.residual_deg }); }
  assert.ok(log.every((x) => x.residual_px < 0.5 && x.residual_deg < 2));
  const ok = S.gripMorphology({ palm_normal_deg: 180, handle_normal_deg: 0, closure_state: "GRIP", phase: "HOLD", thumb_side: "behind", required_thumb_side: "behind", hand_layer: 5, prop_layer: 4, patch_overlap: 0.8 }); assert.equal(ok.ok, true);
  const reversed = S.gripMorphology({ palm_normal_deg: 0, handle_normal_deg: 0, closure_state: "GRIP", phase: "HOLD", thumb_side: "behind", required_thumb_side: "behind", hand_layer: 5, prop_layer: 4, patch_overlap: 0.8 }); assert.ok(reversed.failures.some((x) => x.code === "CONTACT_ORIENTATION_UNSATISFIABLE"));
  const openHold = S.gripMorphology({ palm_normal_deg: 180, handle_normal_deg: 0, closure_state: "OPEN", phase: "HOLD", hand_layer: 3, prop_layer: 4, patch_overlap: 0.3 }); assert.deepEqual(openHold.failures.map((x) => x.code).sort(), ["ART_STATE_REQUIRED", "CONTACT_PATCH_MISS", "OCCLUSION_CONFLICT"]);
  // the +90° basis leaves the hand's ±80° limit on part of the rotation: those frames are refused as JOINT_LIMIT_EXCEEDED (limits are hard)
  { let p0 = null, refused = 0; for (let f = 0; f <= 60; f += 6) { const a = f, r = S.solveContact({ root: { x: 0, y: 0 }, chain, target: { x: 100 + 25 * Math.cos((a * Math.PI) / 180), y: 50 + 25 * Math.sin((a * Math.PI) / 180), angle_deg: a + 90 }, pose0: p0, tol: { px: 0.5, deg: 2 } }); if (!r.ok) { refused++; assert.equal(r.failures[0].code, "JOINT_LIMIT_EXCEEDED"); } p0 = r.angles; } assert.ok(refused > 0); }
  // the same rotation made unreachable under the required palm basis is reported as UNREACHABLE_IK (closest feasible returned), never clamped
  const far = S.solveContact({ root: { x: 0, y: 0 }, chain, target: { x: 139.3, y: 66.2, angle_deg: 102 }, tol: { px: 0.5, deg: 2 } }); assert.equal(far.ok, false); assert.equal(far.failures[0].code, "UNREACHABLE_IK"); assert.ok(far.failures[0].closest);
  fs.mkdirSync(path.join(REPO, "hybrid_v2", "evidence", "system_correction"), { recursive: true }); fs.writeFileSync(path.join(REPO, "hybrid_v2", "evidence", "system_correction", "M03_ROTATING_GRIP_RESIDUALS.json"), JSON.stringify(log, null, 1));
});

test("M05 an out-of-arm reach is solved by bounded root/torso shift with feet planted and balance inside support — or refused, never stretched", () => {
  const chain = [{ id: "torso", length: 60, limit_deg: [-100, -40], rest_deg: -90 }, { id: "upper", length: 70, limit_deg: [-150, 150] }, { id: "fore", length: 60, limit_deg: [0, 150] }];
  const target = { x: 175, y: -70 }, armOnly = S.solveContact({ root: { x: 0, y: 0 }, chain: [{ id: "u", length: 70, limit_deg: [-170, 170] }, { id: "f", length: 60, limit_deg: [0, 150] }], target: { x: target.x, y: target.y + 60 } });
  assert.equal(armOnly.ok, false, "arm alone cannot reach");
  const feet = [-25, 25], support = (r) => S.balance({ segments: [{ mass: 50, x: r.x }, { mass: 15, x: r.x + 30 }], support_x: feet });
  const lean = S.solveContact({ root: { x: 0, y: 0, bounds: { dx: [-20, 20], dy: [0, 0] } }, chain, target, rootMovable: true, supportCheck: (r) => support(r) });
  assert.ok(lean.ok, JSON.stringify(lean.failures)); assert.ok(Math.abs(lean.root.x) <= 20 + 1e-9); assert.ok(support(lean.root).ok);
  const far = S.solveContact({ root: { x: 0, y: 0, bounds: { dx: [-20, 20], dy: [0, 0] } }, chain, target: { x: 260, y: -70 }, rootMovable: true, supportCheck: (r) => support(r) }); assert.equal(far.ok, false); assert.equal(far.failures[0].code, "UNREACHABLE_IK");
  assert.equal(S.balance({ segments: [{ mass: 50, x: 40 }], support_x: feet }).ok, false); assert.equal(S.balance({ segments: [{ mass: 50, x: 40 }], support_x: feet, family: "MACHINE_OR_MECHANISM" }).ok, true, "humanoid balance must not apply to machines");
});

test("M10 feasibility re-solves EVERY action frame and validates state/view edges (not contact snapshots)", async () => {
  const { buildRigFitCase } = await import("./stage3_rigfit_fixture.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
  const c = await buildRigFitCase(path.join(REPO, "hybrid_v2", "work", "m10")), doc = JSON.parse(fs.readFileSync(c.manifest, "utf8"));
  doc.actions[0].view_events.push({ frame: 520, from_state: "open", to_state: "profile_x" }); fs.writeFileSync(c.manifest, JSON.stringify(doc, null, 1));
  const r = await I.checkRigFeasibility({ film: c.film, identity: "pilot", motionPlan: c.restagedPlan });
  assert.ok(r.failures.some((x) => x.code === "UNSUPPORTED_VIEW" && x.frame_range[0] === 520), JSON.stringify(r.failures).slice(0, 400));
  assert.equal(r.checked[0].contact_frames, doc.actions[0].frame_range[1] - doc.actions[0].frame_range[0], "all action frames are solved");
});
