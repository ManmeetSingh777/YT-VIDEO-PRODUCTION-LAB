// Pose-dependent limb solving (directive "Continue physical production" item 5): wrist from the palm socket offset, the 3D elbow test on
// DRAWN (projected) bone lengths, rejection of impossible poses, the drawn-length specification of a foreshortened drawing, and selection of
// the drawing whose measured length solves the pose.   node --test tests/art_bridge/projected_limb.test.mjs
import test from "node:test"; import assert from "node:assert/strict";
const PM = await import("../../engine/art_bridge/physical_motion.mjs");

test("PL-1 wristFromPalm inverts the palm socket offset under the hand angle and rig scale", () => {
  const w = PM.wristFromPalm([100, 50], Math.PI / 2, [10, 0], 2); assert.deepEqual(w.map((v) => +v.toFixed(9)), [100, 30]);
  assert.deepEqual(PM.wristFromPalm([5, 5], 0, [-3, 4]), [8, 1]);
});
test("PL-2 elbow3D: an in-plane arm keeps its 2D angle; a shorter drawn forearm recovers depth (opens the 3D angle); a drawn bone longer than true is impossible", () => {
  const S = [0, 0], E = [0, 100], W = [60, 100]; assert.ok(Math.abs(PM.elbow3D(S, E, W, 100, 60) - 90) < 1e-9, "in-plane right angle");
  const folded = [0, 70]; const flat = PM.elbow3D(S, E, folded, 100, 30), deep = PM.elbow3D(S, E, folded, 100, 60); // same 2D fold, forearm toward camera
  assert.ok(Math.abs(flat) < 1e-9, "fully folded in-plane = 0°"); assert.ok(deep > 55 && deep < 65, `depth opens the angle (${deep})`);
  assert.equal(PM.elbow3D(S, E, [0, 30], 100, 60), null, "70 px drawn forearm with a 60 px true forearm is refused");
});
test("PL-3 solveProjectedLimb rejects hyperflexion, unreachable wrists, raised elbows and inward elbows — with reasons, never stretching", () => {
  const base = { shoulder: [0, 0], upperDrawn: 100, upperTrue: 100, foreTrue: 80, bend: 1 };
  const ok = PM.solveProjectedLimb({ ...base, wrist: [60, 60], foreDrawn: 80 }); assert.equal(ok.ok, true, ok.reasons.join());
  const far = PM.solveProjectedLimb({ ...base, wrist: [300, 0], foreDrawn: 80 }); assert.equal(far.ok, false); assert.match(far.reasons[0], /outside the drawn reach/);
  const hyper = PM.solveProjectedLimb({ ...base, wrist: [0, 30], foreDrawn: 80 }); assert.equal(hyper.ok, false); assert.ok(hyper.reasons.some((r) => /elbow flexion/.test(r)), hyper.reasons.join());
  const fore = PM.solveProjectedLimb({ ...base, wrist: [0, 30], foreDrawn: 75 }); assert.ok(fore.elbow_flex_deg < hyper.elbow_flex_deg, "a foreshortened forearm reduces the 3D flexion of the same 2D fold");
  const up = PM.solveProjectedLimb({ ...base, wrist: [60, -60], foreDrawn: 80, elbowBelowShoulder: true }); if (up.elbow[1] < 0) assert.ok(up.reasons.some((r) => /above the shoulder/.test(r)));
  const a = PM.solveProjectedLimb({ ...base, wrist: [0, 120], foreDrawn: 80, bend: 1, outward: [-1, 0] }), b = PM.solveProjectedLimb({ ...base, wrist: [0, 120], foreDrawn: 80, bend: -1, outward: [-1, 0] });
  assert.notEqual(a.ok, b.ok, "exactly one bend branch puts the elbow on the outer side"); assert.ok([a, b].find((x) => !x.ok).reasons.some((r) => /inside its shoulder/.test(r)));
});
test("PL-4 projectionRequirement returns the drawn-length range that solves EVERY frame; selectDrawing picks the measured variant that solves, or refuses naming each", () => {
  const targets = [0, 10, 20].map((d) => ({ frame: d, shoulder: [0, 0], wrist: [10 + d, 60] })), base = { upperDrawn: 100, upperTrue: 100, foreTrue: 80, bend: 1 };
  const R = PM.projectionRequirement({ targets, ...base, elbowBelowShoulder: true }); assert.equal(R.feasible, true); assert.ok(R.range_px[0] > 0 && R.range_px[1] <= 80);
  for (const p of [R.range_px[0], R.recommended_px, R.range_px[1]]) for (const t of targets) assert.equal(PM.solveProjectedLimb({ ...base, shoulder: t.shoulder, wrist: t.wrist, foreDrawn: p, elbowBelowShoulder: true }).ok, true, `p ${p} frame ${t.frame}`);
  const solveWith = (p) => PM.solveProjectedLimb({ ...base, shoulder: [0, 0], wrist: [0, 45], foreDrawn: p });
  const pick = PM.selectDrawing([{ id: "rest", drawn_px: 80 }, { id: "hold", drawn_px: 60 }], solveWith); assert.equal(pick.id, "hold");
  const none = PM.selectDrawing([{ id: "rest", drawn_px: 80 }], solveWith); assert.equal(none.id, null); assert.match(none.refused[0], /^rest: .*elbow flexion/);
});
