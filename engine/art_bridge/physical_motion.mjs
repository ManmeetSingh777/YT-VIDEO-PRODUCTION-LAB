// Physical motion producer (general): converts MEASURED rig geometry + directed constraints into joint-space solutions.
// - buildTree(rig): measured joint hierarchy (canonical rest positions, bone vectors).
// - fk(tree, rel, root): world positions of joints for relative joint angles (deg), root world placement {xy, scale, rot}.
// - twoBoneIK(...): limb solution for a target; the bend direction is the rest pose's (anatomical), reach beyond the bone lengths is REPORTED
//   (reach_ok=false, residual px) — never solved by stretching.
// - solveLimb(tree, chain, target, rel, root): relative angles for [upper, fore] placing the chain's end socket on a world target.
// Film data (contact schedules, directed targets) stays outside; unmeasured inputs are refused, not guessed.
const deg = (r) => (r * 180) / Math.PI, rad = (d) => (d * Math.PI) / 180, rot = ([x, y], a) => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], add = (a, b) => [a[0] + b[0], a[1] + b[1]], len = (v) => Math.hypot(v[0], v[1]), ang = (v) => Math.atan2(v[1], v[0]);
export function buildTree(rig) { if (rig.geometry_status !== "MEASURED") throw new Error(`rig ${rig.id} geometry is ${rig.geometry_status}: measured rest positions are required`);
  const J = new Map(rig.joints.map((j) => [j.id, { ...j, children: [] }])); for (const j of J.values()) if (j.parent_id) J.get(j.parent_id).children.push(j.id);
  const root = [...J.values()].find((j) => !j.parent_id); return { rig: rig.id, J, root: root.id }; }
/** world positions: root at root.xy (rest_xy of the root maps there), each joint rotates its subtree about its own pivot */
export function fk(tree, rel = {}, root = { xy: [0, 0], scale: 1, rot: 0 }) { const out = {}, cum = {}, R = tree.J.get(tree.root);
  const walk = (id, parentWorld, parentRest, parentCum) => { const j = tree.J.get(id), c = parentCum + rad(rel[id] || 0), w = id === tree.root ? root.xy : add(parentWorld, rot(sub(j.rest_xy, parentRest).map((v) => v * root.scale), parentCum));
    out[id] = w; cum[id] = c; for (const k of j.children) walk(k, w, j.rest_xy, c); };
  walk(R.id, root.xy, R.rest_xy, rad(root.rot || 0) + 0); return { pos: out, cum }; }
/** two-bone IK: base, bone lengths, target, bend sign (+1/-1 from the rest pose) → absolute bone directions (rad) */
export function twoBoneIK(base, l1, l2, target, bend) { const d = sub(target, base), dist = len(d), reach = l1 + l2, near = Math.abs(l1 - l2);
  const reach_ok = dist <= reach + 1e-6 && dist >= near - 1e-6, dc = Math.min(Math.max(dist, near + 1e-6), reach - 1e-6);
  const a = Math.acos(Math.min(1, Math.max(-1, (l1 * l1 + dc * dc - l2 * l2) / (2 * l1 * dc)))), base_dir = ang(d), a1 = base_dir - bend * a, elbow = add(base, [l1 * Math.cos(a1), l1 * Math.sin(a1)]), a2 = ang(sub(add(base, [dc * Math.cos(base_dir), dc * Math.sin(base_dir)]), elbow));
  return { a1, a2, reach_ok, residual_px: reach_ok ? 0 : Math.abs(dist - dc) }; }
/** solveLimb: chain {upper, fore, end, endPoint (canonical point carried by `end`, e.g. palm)} → relative angles for upper & fore */
export function solveLimb(tree, chain, target, rel = {}, root = { xy: [0, 0], scale: 1, rot: 0 }) {
  const U = tree.J.get(chain.upper), F = tree.J.get(chain.fore), E = tree.J.get(chain.end), s = root.scale;
  const l1 = len(sub(F.rest_xy, U.rest_xy)) * s, l2 = len(sub(chain.endPoint, F.rest_xy)) * s; // forearm bone extended to the contact point (wrist kept straight)
  const rest1 = ang(sub(F.rest_xy, U.rest_xy)), rest2 = ang(sub(chain.endPoint, F.rest_xy)), bend = Math.sign(Math.sin(rest2 - rest1)) || 1;
  const { pos, cum } = fk(tree, rel, root), parentCum = cum[U.parent_id], ik = twoBoneIK(pos[chain.upper], l1, l2, target, bend);
  const relU = deg(ik.a1 - parentCum - rest1), relF = deg(ik.a2 - ik.a1 - (rest2 - rest1)), norm = (d) => ((d + 540) % 360) - 180;
  const elbowFlex = norm(deg((rest2 - rest1)) + relF); // signed bend after solving (same sign as rest = anatomical)
  return { rel: { [chain.upper]: norm(relU), [chain.fore]: norm(relF) }, reach_ok: ik.reach_ok, residual_px: ik.residual_px, anatomical: Math.sign(elbowFlex) === bend || Math.abs(elbowFlex) < 1, elbow_flex_deg: elbowFlex };
}
/** similarity pose of a prop from two of its sockets placed on two world points (scale fixed by the prop's measured size) */
export function propPose(propLm, sA, sB, worldA, worldB) { const pa = propLm[sA], pb = propLm[sB], a = ang(sub(pb, pa)), b = ang(sub(worldB, worldA)), r = b - a, mid = [(worldA[0] + worldB[0]) / 2, (worldA[1] + worldB[1]) / 2], pm = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  return { rot: r, place: (p) => add(mid, rot(sub(p, pm), r)) }; }
