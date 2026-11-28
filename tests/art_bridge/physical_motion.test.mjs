// PM-1: FK reproduces the measured rest pose; IK places the end point on a reachable target, keeps the anatomical bend, and REPORTS an
// unreachable target (residual) instead of stretching.
import test from "node:test"; import assert from "node:assert/strict"; import { buildTree, fk, solveLimb } from "../../engine/art_bridge/physical_motion.mjs";
const rig = { id: "R", geometry_status: "MEASURED", joints: [{ id: "root", parent_id: null, rest_xy: [0, 0] }, { id: "upper", parent_id: "root", rest_xy: [0, 0] }, { id: "fore", parent_id: "upper", rest_xy: [100, 0] }, { id: "hand", parent_id: "fore", rest_xy: [100, 80] }] };
test("PM-1 fk/ik", () => { const t = buildTree(rig), r0 = fk(t, {}, { xy: [0, 0], scale: 1 }); assert.deepEqual(r0.pos.hand.map(Math.round), [100, 80]);
  const ch = { upper: "upper", fore: "fore", end: "hand", endPoint: [100, 80] }, s = solveLimb(t, ch, [120, 60]); assert.equal(s.reach_ok, true); assert.equal(s.anatomical, true);
  const p = fk(t, s.rel, { xy: [0, 0], scale: 1 }).pos; const f = p.fore, e = [f[0] + 0, f[1] + 0]; void e;
  const handTip = (() => { const q = fk(t, s.rel).pos.fore, U = fk(t, s.rel).cum.fore, v = [0, 80]; return [q[0] + v[0] * Math.cos(U) - v[1] * Math.sin(U), q[1] + v[0] * Math.sin(U) + v[1] * Math.cos(U)]; })();
  assert.ok(Math.hypot(handTip[0] - 120, handTip[1] - 60) < 1e-6, `end point ${handTip}`);
  const far = solveLimb(t, ch, [400, 0]); assert.equal(far.reach_ok, false); assert.ok(far.residual_px > 100); assert.throws(() => buildTree({ ...rig, geometry_status: "UNMEASURED" }), /measured/); });
