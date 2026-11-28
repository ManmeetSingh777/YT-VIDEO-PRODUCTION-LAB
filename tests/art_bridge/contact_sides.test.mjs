// CS-1: hand→socket mapping comes from geometry: a right hand on screen-left must take the screen-left socket whatever the socket is named;
// a declared name-based mapping that crosses is reported. PP-1: prop placement keeps the registered scale and reports per-socket residuals.
import test from "node:test"; import assert from "node:assert/strict"; import { contactSides, propPoseChecked } from "../../engine/art_bridge/physical_motion.mjs";
test("CS-1 contact sides from geometry", () => { const r = contactSides({ shoulders: { palm_r: [947, 765], palm_l: [1085, 797] }, sockets: { grip_l: [952, 850], grip_r: [1062, 850] }, declared: { palm_r: "grip_r", palm_l: "grip_l" } });
  assert.equal(r.crossed, true); assert.deepEqual(r.valid, { palm_r: "grip_l", palm_l: "grip_r" }); });
test("PP-1 prop scale and residuals", () => { const lm = { a: [0, 0], b: [100, 0] }, ok = propPoseChecked(lm, "a", "b", [10, 10], [110, 10]); assert.ok(ok.residual_px.a < 1e-9 && ok.residual_px.b < 1e-9);
  const bad = propPoseChecked(lm, "a", "b", [10, 10], [150, 10]); assert.ok(bad.residual_px.a > 19 && bad.residual_px.b > 19); assert.equal(bad.separation_target_px, 140); });
