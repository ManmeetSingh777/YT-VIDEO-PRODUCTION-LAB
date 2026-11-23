// Contact-aware constraint solving (spec §5.4, §12.1). Pure, deterministic, NON-clamping: an impossible target is a structured failure with
// the required displacement, never a stretched limb or snapped contact. Replaces mn.js ik2 (which clamps at mn.js:167) for every contact.
import { err } from "./errors.mjs";

export function solveTwoBonePosition(A, T, L1, L2, bendSign, epsilon = 1e-7) {
  const validPoint = (p) => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  if (!validPoint(A) || !validPoint(T) || ![L1, L2].every((v) => Number.isFinite(v) && v > 0)) throw err("INVALID_IK_INPUT", { reason: "Invalid IK operands" });
  if (bendSign !== -1 && bendSign !== 1) throw err("UNAPPROVED_BEND_BRANCH", { reason: "Bend side must be approved (+1 or -1)" });
  const dx = T[0] - A[0], dy = T[1] - A[1], d = Math.hypot(dx, dy), lo = Math.abs(L1 - L2), hi = L1 + L2;
  if (d > hi + epsilon || d < lo - epsilon) throw err("UNREACHABLE_IK", { reason: `target at ${d.toFixed(3)} outside reach [${lo.toFixed(3)}, ${hi.toFixed(3)}]`, details: { requestedDistance: d, minimumReach: lo, maximumReach: hi, missingDistance: d > hi ? d - hi : lo - d } });
  if (d < epsilon) throw err("DEGENERATE_IK", { reason: "Ambiguous coincident anchors" });
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), h2 = L1 * L1 - a * a;
  if (h2 < -epsilon) throw err("UNREACHABLE_IK", { reason: "Invalid IK geometry" });
  const h = Math.sqrt(Math.max(0, h2)), ux = dx / d, uy = dy / d;
  const elbow = [A[0] + a * ux - bendSign * h * uy, A[1] + a * uy + bendSign * h * ux];
  return { elbow, wrist: T, shoulder: A, shoulderAngle: Math.atan2(elbow[1] - A[1], elbow[0] - A[0]), forearmAngle: Math.atan2(T[1] - elbow[1], T[0] - elbow[0]) };
}

const angDeg = (r) => (r * 180) / Math.PI;
const wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
/** validateReach(chain, target, limits): chain = {A, L1, L2, bendSign, restUpperDeg, restLowerDeg}; limits = {upper:[min,max], lower:[min,max]} (deg, relative to rest) */
export function validateReach(chain, target, limits = null) {
  const s = solveTwoBonePosition(chain.A, target, chain.L1, chain.L2, chain.bendSign);
  if (limits) {
    const up = wrap(angDeg(s.shoulderAngle) - (chain.restUpperDeg ?? 0)), lowRel = wrap(angDeg(s.forearmAngle) - angDeg(s.shoulderAngle) - ((chain.restLowerDeg ?? 0) - (chain.restUpperDeg ?? 0)));
    if (up < limits.upper[0] - 1e-6 || up > limits.upper[1] + 1e-6) throw err("JOINT_LIMIT_EXCEEDED", { reason: `upper joint ${up.toFixed(2)}° outside [${limits.upper}]`, details: { joint: "upper", angle: up, limits: limits.upper } });
    if (lowRel < limits.lower[0] - 1e-6 || lowRel > limits.lower[1] + 1e-6) throw err("JOINT_LIMIT_EXCEEDED", { reason: `lower joint ${lowRel.toFixed(2)}° outside [${limits.lower}]`, details: { joint: "lower", angle: lowRel, limits: limits.lower } });
    s.relativeAngles = { upper: up, lower: lowRel };
  }
  return s;
}

/** solveContactGraph(frame, sceneState): every ACTIVE contact (start <= f < end) is solved; the source socket is placed ON the target
 *  socket (error = 0 by construction) or a structured failure is returned. sceneState = { chains: {socketId: chain}, targets: {socketId: [x,y]},
 *  contacts: [...], limits?: {socketId: limits} }. Interval semantics are checked on every frame the caller evaluates, not only endpoints. */
export function solveContactGraph(frame, sceneState) {
  const solved = {}, failures = [];
  for (const c of sceneState.contacts) {
    if (!(c.start_frame <= frame && frame < c.end_frame)) continue;
    const chain = sceneState.chains[c.source_socket], target = sceneState.targets[c.target_socket];
    if (!chain || !target) { failures.push(err("CONTACT_DRIFT", { frame_range: [frame, frame + 1], reason: `contact ${c.source_socket}->${c.target_socket} has no chain/target at frame ${frame}` })); continue; }
    try { const s = validateReach(chain, target, sceneState.limits?.[c.source_socket] || null);
      // contact = position AND orientation (directive I2/N4): the palm/sole basis riding the forearm must match the target basis
      let orientation_residual_deg = null;
      if (Number.isFinite(c.target_orientation_deg) && Number.isFinite(chain.palm_orientation_deg)) { orientation_residual_deg = Math.abs(wrap(angDeg(s.forearmAngle) + chain.palm_orientation_deg - c.target_orientation_deg));
        if (orientation_residual_deg > (c.allowed_angle_deg ?? 12)) { failures.push(err("CONTACT_ORIENTATION_UNSATISFIABLE", { frame_range: [frame, frame + 1], dependency: c.source_socket, reason: `palm basis off by ${orientation_residual_deg.toFixed(2)}° at zero position error`, details: { orientation_residual_deg } })); continue; } }
      solved[c.source_socket] = { ...s, error_px: 0, orientation_residual_deg, contact: c }; }
    catch (e) { e.frame_range = [frame, frame + 1]; failures.push(e); }
  }
  return { frame, solved, failures };
}
