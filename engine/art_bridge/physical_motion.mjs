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
// bend uses the RUNTIME convention (constraints.mjs#solveTwoBonePosition: elbow = A + a·u + bend·h·(−u_y, u_x)), so a branch solved here is the
// branch the renderer executes. Reach beyond the bone lengths is clamped only to REPORT the residual, never to stretch.
export function twoBoneIK(base, l1, l2, target, bend) { const d = sub(target, base), dist = len(d), reach = l1 + l2, near = Math.abs(l1 - l2);
  const reach_ok = dist <= reach + 1e-6 && dist >= near - 1e-6, dc = Math.min(Math.max(dist, near + 1e-6), reach - 1e-6), u = [d[0] / (dist || 1), d[1] / (dist || 1)];
  const a = (l1 * l1 - l2 * l2 + dc * dc) / (2 * dc), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)), elbow = [base[0] + a * u[0] - bend * h * u[1], base[1] + a * u[1] + bend * h * u[0]], tgt = add(base, [dc * u[0], dc * u[1]]);
  return { a1: ang(sub(elbow, base)), a2: ang(sub(tgt, elbow)), reach_ok, residual_px: reach_ok ? 0 : Math.abs(dist - dc) }; }
/** restBend — the branch (runtime convention) a drawn shoulder/elbow/wrist triple is on */
export const restBend = (A, E, W) => { const d = sub(W, A), dist = len(d) || 1, u = [d[0] / dist, d[1] / dist], v = sub(E, A); return Math.sign(-v[0] * u[1] + v[1] * u[0]) || 1; };
/** solveLimb: chain {upper, fore, end, endPoint (canonical point carried by `end`, e.g. palm)} → relative angles for upper & fore */
export function solveLimb(tree, chain, target, rel = {}, root = { xy: [0, 0], scale: 1, rot: 0 }) {
  const U = tree.J.get(chain.upper), F = tree.J.get(chain.fore), E = tree.J.get(chain.end), s = root.scale;
  const l1 = len(sub(F.rest_xy, U.rest_xy)) * s, l2 = len(sub(chain.endPoint, F.rest_xy)) * s; // forearm bone extended to the contact point (wrist kept straight)
  const rest1 = ang(sub(F.rest_xy, U.rest_xy)), rest2 = ang(sub(chain.endPoint, F.rest_xy)), bend = restBend(U.rest_xy, F.rest_xy, chain.endPoint);
  const { pos, cum } = fk(tree, rel, root), parentCum = cum[U.parent_id], ik = twoBoneIK(pos[chain.upper], l1, l2, target, bend);
  const relU = deg(ik.a1 - parentCum - rest1), relF = deg(ik.a2 - ik.a1 - (rest2 - rest1)), norm = (d) => ((d + 540) % 360) - 180;
  const elbowFlex = norm(deg((rest2 - rest1)) + relF); // signed bend after solving (same sign as rest = anatomical)
  return { rel: { [chain.upper]: norm(relU), [chain.fore]: norm(relF) }, reach_ok: ik.reach_ok, residual_px: ik.residual_px, anatomical: Math.sign(elbowFlex) === (Math.sign(Math.sin(rest2 - rest1)) || 1) || Math.abs(elbowFlex) < 1, elbow_flex_deg: elbowFlex };
}
/** similarity pose of a prop from two of its sockets placed on two world points (scale fixed by the prop's measured size) */
export function propPose(propLm, sA, sB, worldA, worldB) { const pa = propLm[sA], pb = propLm[sB], a = ang(sub(pb, pa)), b = ang(sub(worldB, worldA)), r = b - a, mid = [(worldA[0] + worldB[0]) / 2, (worldA[1] + worldB[1]) / 2], pm = [(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2];
  return { rot: r, place: (p) => add(mid, rot(sub(p, pm), r)) }; }
/** contactSides(...) — bimanual contact validation from GEOMETRY, never from names: for two limbs holding one prop, the order of the hands
 *  (their shoulders) along the prop's socket axis must match the order of the sockets they grip, otherwise the limbs cross. Returns the
 *  geometrically valid hand→socket mapping and whether the declared mapping crosses. */
export function contactSides({ shoulders, sockets, declared }) { // shoulders {handId: [x,y]}, sockets {socketId: [x,y] world}, declared {handId: socketId}
  const hands = Object.keys(shoulders), socks = Object.keys(sockets); if (hands.length !== 2 || socks.length !== 2) throw new Error("contactSides needs exactly two hands and two sockets");
  const axis = sub(sockets[socks[1]], sockets[socks[0]]), proj = (p) => p[0] * axis[0] + p[1] * axis[1];
  const hOrder = [...hands].sort((a, b) => proj(shoulders[a]) - proj(shoulders[b])), sOrder = [...socks].sort((a, b) => proj(sockets[a]) - proj(sockets[b]));
  const valid = { [hOrder[0]]: sOrder[0], [hOrder[1]]: sOrder[1] }, crossed = hands.some((h) => declared[h] !== valid[h]);
  return { valid, crossed, declared };
}
/** propPoseChecked — prop placement from two sockets on two world targets with the prop's REGISTERED scale fixed: reports each socket's
 *  residual and the separation mismatch instead of silently fitting midpoints */
export function propPoseChecked(propLm, sA, sB, worldA, worldB, scale = 1) { const pose = propPose(propLm, sA, sB, worldA, worldB), sep = len(sub(propLm[sB], propLm[sA])) * scale, want = len(sub(worldB, worldA));
  const placeS = (p) => { const m = [(propLm[sA][0] + propLm[sB][0]) / 2, (propLm[sA][1] + propLm[sB][1]) / 2], mid = [(worldA[0] + worldB[0]) / 2, (worldA[1] + worldB[1]) / 2]; return add(mid, rot(sub(p, m).map((v) => v * scale), pose.rot)); };
  const rA = len(sub(placeS(propLm[sA]), worldA)), rB = len(sub(placeS(propLm[sB]), worldB));
  return { rot: pose.rot, place: placeS, separation_prop_px: sep, separation_target_px: want, residual_px: { [sA]: rA, [sB]: rB } }; }
/* ── pose-dependent limb solving (directive item 5) ─────────────────────────────────────────────────────────────────────────────────────────────
 * A 2D drawing of a forearm shows its PROJECTED length. A folded arm whose forearm points toward camera is drawn shorter (a distinct drawing);
 * the anatomical test is made in 3D: the hidden depth of each bone is recovered from its true (rest-drawing) length and its drawn length. */
export const ANATOMY_DEFAULT = Object.freeze({ elbow_flex_deg: [0, 145], wrist_deg: [-80, 70], source: "human elbow flexion 0–145°, wrist flexion/extension ≈ 80°/70° (standard ROM tables)" });
/** wristFromPalm: palm socket target + hand basis angle (rad, world) → wrist (hand joint pivot) world position. palmLocal is the socket's
 *  local offset on the hand joint (canonical px), scale the rig's root scale. */
export const wristFromPalm = (palm, handAngle, palmLocal, scale = 1) => sub(palm, rot(palmLocal.map((v) => v * scale), handAngle));
/** elbow3D: interior elbow angle (deg) from 2D shoulder/elbow/wrist and the bones' TRUE lengths; depth recovered per bone (toward camera, sign s).
 *  Returns null when a drawn bone is LONGER than its true length (impossible drawing/pose combination). */
export function elbow3D(S, E, W, upperTrue, foreTrue, { upperDepthSign = 0, foreDepthSign = -1 } = {}) {
  const u2 = sub(S, E), f2 = sub(W, E), lu = len(u2), lf = len(f2); if (lu > upperTrue + 0.5 || lf > foreTrue + 0.5) return null;
  const zu = upperDepthSign * Math.sqrt(Math.max(0, upperTrue * upperTrue - lu * lu)), zf = foreDepthSign * Math.sqrt(Math.max(0, foreTrue * foreTrue - lf * lf));
  const dot = u2[0] * f2[0] + u2[1] * f2[1] + zu * zf, c = dot / (Math.hypot(lu, zu) * Math.hypot(lf, zf)); return deg(Math.acos(Math.max(-1, Math.min(1, c)))); }
/** solveProjectedLimb — two-bone solve of shoulder→wrist with the DRAWN (projected) lengths of the drawings actually bound, elbow side from the
 *  rig's bend sign, then the 3D anatomical test. Impossible poses are REJECTED with the reason (never stretched, never bent backwards). */
export function solveProjectedLimb({ shoulder, wrist, upperDrawn, foreDrawn, upperTrue, foreTrue, bend, anatomy = ANATOMY_DEFAULT, elbowBelowShoulder = false, outward = null, maxInwardPx = 0 }) {
  const ik = twoBoneIK(shoulder, upperDrawn, foreDrawn, wrist, bend), E = add(shoulder, [upperDrawn * Math.cos(ik.a1), upperDrawn * Math.sin(ik.a1)]);
  const reasons = []; if (!ik.reach_ok) reasons.push(`wrist ${ik.residual_px.toFixed(1)} px outside the drawn reach [${Math.abs(upperDrawn - foreDrawn).toFixed(1)}, ${(upperDrawn + foreDrawn).toFixed(1)}]`);
  const interior = ik.reach_ok ? elbow3D(shoulder, E, wrist, upperTrue, foreTrue) : null, flex = interior == null ? null : 180 - interior;
  if (ik.reach_ok && interior == null) reasons.push("a drawn bone is longer than its true length");
  if (flex != null && (flex < anatomy.elbow_flex_deg[0] - 1e-6 || flex > anatomy.elbow_flex_deg[1] + 1e-6)) reasons.push(`elbow flexion ${flex.toFixed(1)}° outside [${anatomy.elbow_flex_deg}]`);
  if (elbowBelowShoulder && E[1] < shoulder[1]) reasons.push("elbow rises above the shoulder (directed hanging upper arm)");
  if (outward) { const lat = (E[0] - shoulder[0]) * outward[0] + (E[1] - shoulder[1]) * outward[1]; if (lat < -maxInwardPx) reasons.push(`elbow ${(-lat).toFixed(1)} px inside its shoulder (outer side required)`); }
  return { ok: reasons.length === 0, elbow: E, upper_dir: ik.a1, fore_dir: ik.a2, elbow_flex_deg: flex, reasons }; }
/** wristOk — hand angle relative to forearm within the anatomical wrist range (deg, signed in the rig's bend convention) */
export const wristRel = (foreDir, handAngle) => { const d = deg(handAngle - foreDir); return ((d + 540) % 360) - 180; };
/** projectionRequirement — the range of DRAWN forearm lengths for which every target in a directed schedule solves anatomically: the drawing
 *  specification of a foreshortened forearm. targets [{frame, shoulder, wrist}] (world), sampled lengths step px. */
export function projectionRequirement({ targets, upperDrawn, upperTrue, foreTrue, bend, anatomy = ANATOMY_DEFAULT, elbowBelowShoulder = true, outward = null, maxInwardPx = 0, step = 0.5 }) {
  const ok = []; for (let p = step; p <= foreTrue + 1e-9; p += step) { const fails = targets.filter((t) => !solveProjectedLimb({ shoulder: t.shoulder, wrist: t.wrist, upperDrawn, foreDrawn: p, upperTrue, foreTrue, bend, anatomy, elbowBelowShoulder, outward, maxInwardPx }).ok); if (!fails.length) ok.push(+p.toFixed(3)); }
  if (!ok.length) return { feasible: false, range_px: null, recommended_px: null };
  const lo = ok[0], hi = ok.at(-1), contiguous = ok.length === Math.round((hi - lo) / step) + 1; return { feasible: true, range_px: [lo, hi], contiguous, recommended_px: +((lo + hi) / 2).toFixed(2), ratio_of_true: [+(lo / foreTrue).toFixed(3), +(hi / foreTrue).toFixed(3)] }; }
/** selectDrawing — pose-dependent drawing selection: the bound drawing for a limb is the variant whose MEASURED drawn length solves the pose
 *  anatomically; several candidates → the one closest to the pose's ideal; none → a refusal naming the missing drawing. */
export function selectDrawing(variants, solveWith) { const ok = variants.map((v) => ({ v, r: solveWith(v.drawn_px) })).filter((x) => x.r.ok);
  return ok.length ? { id: ok.sort((a, b) => Math.abs(a.r.elbow_flex_deg - 90) - Math.abs(b.r.elbow_flex_deg - 90))[0].v.id, solved: ok[0].r } : { id: null, refused: variants.map((v) => `${v.id}: ${solveWith(v.drawn_px).reasons.join("; ")}`) }; }
