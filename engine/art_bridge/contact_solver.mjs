// Bounded articulated contact/support solver (directive I2 / N4; F003, F004, F005, F051, F052). Contact = position + orientation + support
// + morphology + visibility. Variables: permitted root translation (bounded), torso/chain joint angles (limits). Hard: joint limits, limb
// lengths (by construction), planted support feet, contact position AND wrapped orientation. Soft: proximity to the authored pose.
// Analytic two-bone initialization, then damped least squares with box projection. Residuals are measured by forward kinematics AFTER the
// solve (never by copying the target). Unsatisfiable → typed failure with the closest feasible result, never a clamp or a stretched limb.
import { err } from "./errors.mjs";
import { solveTwoBonePosition } from "./constraints.mjs";
const D = Math.PI / 180, wrap = (a) => ((((a + 180) % 360) + 360) % 360) - 180;

/** chain: [{id, length, limit_deg:[lo,hi], rest_deg}] from the root outward (angles RELATIVE to parent, degrees). root: {x,y, bounds?:{dx:[lo,hi],dy:[lo,hi]}} */
export function fkChain(root, chain, angles) {
  let x = root.x, y = root.y, a = 0; const pts = [[x, y]], world = [];
  chain.forEach((j, i) => { a += angles[i]; world.push(a); x += j.length * Math.cos(a * D); y += j.length * Math.sin(a * D); pts.push([x, y]); });
  return { points: pts, end: pts.at(-1), end_angle_deg: wrap(world.at(-1)), world_angles: world };
}
/** solveContact({root, chain, target:{x,y,angle_deg?}, pose0, tol:{px, deg}, rootMovable, supportCheck?}) → {ok, angles, root, residual_px, residual_deg, failures[]} */
export function solveContact({ root, chain, target, pose0 = null, tol = { px: 0.5, deg: 4 }, rootMovable = false, iterations = 400, supportCheck = null }) {
  const n = chain.length, lim = chain.map((j) => j.limit_deg), clampA = (v, i) => Math.min(lim[i][1], Math.max(lim[i][0], v));
  let ang = (pose0 || chain.map((j) => j.rest_deg ?? 0)).map(clampA), r = { x: root.x, y: root.y };
  // analytic initialization for the last two segments (both branches tried; the one inside limits and closest to the pose wins)
  // with an orientation target the last segment (hand/foot) is fixed by the target basis: the two segments before it aim at the implied wrist
  const oriented = Number.isFinite(target.angle_deg) && n >= 3, k0 = oriented ? n - 3 : n - 2;
  if (n >= 2) { const base = fkChain(r, chain.slice(0, k0), ang.slice(0, k0)), A = base.end, L1 = chain[k0].length, L2 = chain[k0 + 1].length, Lh = oriented ? chain[n - 1].length : 0;
    const wrist = oriented ? [target.x - Lh * Math.cos(target.angle_deg * D), target.y - Lh * Math.sin(target.angle_deg * D)] : [target.x, target.y];
    for (const bend of [1, -1]) { try { const s = solveTwoBonePosition(A, wrist, L1, L2, bend), pa = base.world_angles.at(-1) ?? 0, a1 = wrap(s.shoulderAngle / D - pa), a2 = wrap(s.forearmAngle / D - s.shoulderAngle / D);
        const cand = [...ang.slice(0, k0), a1, a2, ...(oriented ? [wrap(target.angle_deg - s.forearmAngle / D)] : [])];
        if (cand.every((v, i) => v >= lim[i][0] - 1e-9 && v <= lim[i][1] + 1e-9)) { ang = cand; break; } } catch { /* unreachable: DLS below reports the closest feasible */ } } }
  const resid = (a, rt) => { const k = fkChain(rt, chain, a), ex = k.end[0] - target.x, ey = k.end[1] - target.y, eo = Number.isFinite(target.angle_deg) ? wrap(k.end_angle_deg - target.angle_deg) : 0; return { ex, ey, eo, k }; };
  const W_ANG = 2, lam0 = 1e-2; let lam = lam0;
  for (let it = 0; it < iterations; it++) {
    const e0 = resid(ang, r), err0 = Math.hypot(e0.ex, e0.ey, W_ANG * e0.eo * D * 50); if (Math.hypot(e0.ex, e0.ey) < tol.px * 0.1 && Math.abs(e0.eo) < tol.deg * 0.1) break;
    const vars = [...ang.map((_, i) => ["a", i]), ...(rootMovable ? [["x"], ["y"]] : [])], h = 1e-4, Jm = [];
    for (const v of vars) { const a2 = [...ang], r2 = { ...r }; if (v[0] === "a") a2[v[1]] += h; else r2[v[0]] += h; const e = resid(a2, r2); Jm.push([(e.ex - e0.ex) / h, (e.ey - e0.ey) / h, (W_ANG * (e.eo - e0.eo) * D * 50) / h]); }
    const res = [e0.ex, e0.ey, W_ANG * e0.eo * D * 50], m = vars.length, JtJ = Array.from({ length: m }, () => Array(m).fill(0)), Jtr = Array(m).fill(0);
    for (let i = 0; i < m; i++) { for (let k = 0; k < 3; k++) Jtr[i] += Jm[i][k] * res[k]; for (let j = 0; j < m; j++) for (let k = 0; k < 3; k++) JtJ[i][j] += Jm[i][k] * Jm[j][k]; JtJ[i][i] += lam; }
    const dx = gauss(JtJ, Jtr.map((v) => -v)); const a3 = ang.map((v, i) => clampA(v + dx[i], i)), r3 = { ...r }; if (rootMovable) { r3.x = clampR(r.x + dx[n], root, "dx"); r3.y = clampR(r.y + dx[n + 1], root, "dy"); }
    const e3 = resid(a3, r3); if (Math.hypot(e3.ex, e3.ey, W_ANG * e3.eo * D * 50) < err0) { ang = a3; r = r3; lam = Math.max(1e-6, lam * 0.5); } else lam *= 4;
  }
  const fin = resid(ang, r), residual_px = Math.hypot(fin.ex, fin.ey), residual_deg = Math.abs(fin.eo), failures = [];
  // reach is judged on the point the chain must actually reach: with an orientation target that is the implied wrist (target − hand vector)
  const reach = chain.slice(0, oriented ? n - 1 : n).reduce((s, j) => s + j.length, 0), aim = oriented ? [target.x - chain[n - 1].length * Math.cos(target.angle_deg * D), target.y - chain[n - 1].length * Math.sin(target.angle_deg * D)] : [target.x, target.y], d = Math.hypot(aim[0] - r.x, aim[1] - r.y);
  if (residual_px > tol.px) failures.push({ code: d > reach + 1e-9 ? "UNREACHABLE_IK" : "JOINT_LIMIT_EXCEEDED", reason: `post-FK position residual ${residual_px.toFixed(3)} px (${oriented ? "oriented wrist" : "target"} ${d.toFixed(1)} px from root, reach ${reach.toFixed(1)} px)`, closest: fin.k.end });
  else if (residual_deg > tol.deg) failures.push({ code: "CONTACT_ORIENTATION_UNSATISFIABLE", reason: `post-FK orientation residual ${residual_deg.toFixed(2)}° within limits`, closest_angle_deg: fin.k.end_angle_deg });
  if (supportCheck) { const s = supportCheck(r, ang, fin.k); if (!s.ok) failures.push({ code: "FOOT_SUPPORT_UNSATISFIABLE", reason: s.reason }); }
  return { ok: failures.length === 0, angles: ang, root: r, residual_px, residual_deg, points: fin.k.points, failures };
}
const clampR = (v, root, k) => { const b = root.bounds?.[k]; if (!b) return k === "dx" ? root.x : root.y; const base = k === "dx" ? root.x : root.y; return Math.min(base + b[1], Math.max(base + b[0], v)); };
function gauss(A, b) { const n = b.length, M = A.map((r, i) => [...r, b[i]]); for (let c = 0; c < n; c++) { let p = c; for (let r = c + 1; r < n; r++) if (Math.abs(M[r][c]) > Math.abs(M[p][c])) p = r; [M[c], M[p]] = [M[p], M[c]]; const piv = M[c][c] || 1e-12; for (let r = 0; r < n; r++) if (r !== c) { const f = M[r][c] / piv; for (let k = c; k <= n; k++) M[r][k] -= f * M[c][k]; } } return M.map((r, i) => r[n] / (r[i] || 1e-12)); }

/** gripMorphology — staged grip validity beyond XY: palm faces the handle, closure state is GRIP during the hold, thumb on the declared side,
 *  hand/prop layer order matches near/far, contact patch overlaps the handle (rendered-mask overlap fraction when pixels are supplied) */
export function gripMorphology({ palm_normal_deg, handle_normal_deg, closure_state, phase, thumb_side, required_thumb_side, hand_layer, prop_layer, near_far = "HAND_IN_FRONT", patch_overlap = null, min_overlap = 0.6, tol_deg = 30 }) {
  const f = [], facing = Math.abs(wrap(palm_normal_deg - (handle_normal_deg + 180)));
  if (facing > tol_deg) f.push({ code: "CONTACT_ORIENTATION_UNSATISFIABLE", reason: `palm normal is ${facing.toFixed(1)}° from facing the handle (reversed or turned palm)` });
  if (phase === "HOLD" && closure_state !== "GRIP") f.push({ code: "ART_STATE_REQUIRED", reason: `hold phase shows closure ${closure_state}; an approved grip-closure drawing is required` });
  if (required_thumb_side && thumb_side !== required_thumb_side) f.push({ code: "CONTACT_PATCH_MISS", reason: `thumb on ${thumb_side}, handle needs ${required_thumb_side}` });
  if ((near_far === "HAND_IN_FRONT") !== (hand_layer > prop_layer)) f.push({ code: "OCCLUSION_CONFLICT", reason: `hand layer ${hand_layer} vs prop layer ${prop_layer} contradicts ${near_far}` });
  if (patch_overlap !== null && patch_overlap < min_overlap) f.push({ code: "CONTACT_PATCH_MISS", reason: `rendered contact patch overlaps the handle by ${(patch_overlap * 100).toFixed(0)}% (< ${min_overlap * 100}%)` });
  return { ok: f.length === 0, failures: f };
}
/** balance — centre of mass projected on the ground must lie within the support interval (humanoid); other families pass their own model */
export function balance({ segments, support_x, family = "ACTING_HUMAN", style_rationale = null }) {
  if (!["ACTING_HUMAN", "DISTANT_HUMAN"].includes(family)) return { ok: true, model: "family-specific support (not humanoid balance)" };
  const m = segments.reduce((s, g) => s + g.mass, 0), cx = segments.reduce((s, g) => s + g.mass * g.x, 0) / m, [lo, hi] = support_x;
  const ok = cx >= lo && cx <= hi; return ok || style_rationale ? { ok: true, com_x: cx, support_x, style_rationale } : { ok: false, com_x: cx, support_x, code: "FOOT_SUPPORT_UNSATISFIABLE", reason: `centre of mass x=${cx.toFixed(1)} outside support [${lo.toFixed(1)},${hi.toFixed(1)}] without an approved stylistic rationale` };
}
