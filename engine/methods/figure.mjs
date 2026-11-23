// F06 + F66 + F01/F58 + F59 — figure compiler for authored body plans (Gate B, spec §2.4 / §4.5).
// The ART lives in the body plan (Claude-authored, recorded as decisions): which masses exist, where each contour landmark sits relative to
// its bone (u along, v across) or to a joint's bend side, which span characters connect them, which garment fold class each cloth mass
// uses. This module only COMPILES that plan for a pose: FK (+ validated 2-bone IK), bone-local landmark placement, joint bend-side
// landmarks (outer arc / inner crease with compression), and material-class fold geometry driven by the actual bend angle.
// Skeleton centrelines are internal; they are never drawn.
import { need, add, sub, mul, nrm, len, perp, rot, dot, cross, lerp2, polyPath, smoothOpen, ribbon } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { ik2 } from "./body.mjs";

export const FOLD_CLASSES = ["soft_drape", "quilted_compress", "stiff_break"];

/** FK over the joint tree; pose.rot[j] = relative rotation (deg) applied at joint j's parent; pose.ik = {endJoint: {target, mid, root, bendSign}} */
export function solveSkeleton(skel, pose) {
  need("F66 skeleton", skel, { root: "str", joints: "obj" }); need("F66 pose", pose, { rootAt: "vec2", rot: "obj" });
  const J = skel.joints, world = {}, ang = {};
  const visit = (id, parentWorld, parentAng) => {
    const j = J[id]; const a = parentAng + (pose.rot[id] ?? 0);
    world[id] = id === skel.root ? pose.rootAt : add(parentWorld, rot(j.offset, a)); ang[id] = a;
    for (const [cid, c] of Object.entries(J)) if (c.parent === id) visit(cid, world[id], a);
  };
  visit(skel.root, null, pose.rootRot ?? 0);
  // validated IK overrides (reach checked; never silently clamped)
  for (const [end, k] of Object.entries(pose.ik || {})) {
    const { root, mid } = k, l1 = len(sub(world[mid], world[root])), l2 = len(sub(world[end], world[mid]));
    const s = ik2(world[root], k.target, l1, l2, k.bendSign);
    if (!s.reachable) throw new Error(`F66 IK ${end}: UNREACHABLE — ${s.reason} (re-pose the root/torso; no silent clamp)`);
    const dm = sub(s.joint, world[mid]), de = sub(s.end, world[end]);
    world[mid] = s.joint; world[end] = s.end;
    for (const [cid, c] of Object.entries(J)) if (c.parent === end) world[cid] = add(world[cid], de); // carry hand/foot children rigidly
    void dm;
  }
  Object.defineProperty(world, "__ang", { value: ang, enumerable: false });
  return world;
}

/** bend geometry at joint j between bone (parent→j) and bone (j→child) */
function bendAt(W, skel, j, child) {
  const p = skel.joints[j].parent, d1 = nrm(sub(W[j], W[p])), d2 = nrm(sub(W[child], W[j]));
  const theta = Math.atan2(cross(d1, d2), dot(d1, d2)); // signed bend
  let bis = add(perp(d1), perp(d2)); if (len(bis) < 1e-6) bis = perp(d1); bis = nrm(bis);
  const outer = mul(bis, -Math.sign(theta) || 1); // outer side = away from the turn
  return { theta, outer, inner: mul(outer, -1), d1, d2 };
}

/** landmark kinds: {bone:[a,b], u, v} on a bone; {joint, child, side:"outer"|"inner", r, compress?} at a bend; {joint, offset:[x,y]} rigid */
export function placeLandmark(W, skel, l) {
  if (l.bone) { const [a, b] = l.bone, A = W[a], B = W[b]; if (!A || !B) throw new Error(`F66 landmark ${l.id}: bone ${a}→${b} unknown`); const t = nrm(sub(B, A)); return add(lerp2(A, B, l.u), mul(perp(t), l.v)); }
  if (l.side !== undefined) {
    // l.side = +1 (bone-left / perp side) or -1. The landmark stays on ITS side of the limb (no contour crossing); it is compressed
    // toward the joint when that side is the inside of the actual bend, and pushed out on an arc when it is the outside.
    if (l.side !== 1 && l.side !== -1) throw new Error(`F66 landmark ${l.id}: side must be +1 or -1 (limb side), got ${l.side}`);
    const g = bendAt(W, skel, l.joint, l.child), innerSign = Math.sign(dot(perp(g.d1), sub(g.d2, g.d1))) || 1;
    const k = l.side === innerSign ? Math.max(0.15, 1 - (l.compress ?? 0.6) * Math.abs(Math.sin(g.theta))) : 1 + 0.12 * Math.abs(Math.sin(g.theta / 2));
    let n = add(perp(g.d1), perp(g.d2)); n = len(n) < 1e-6 ? perp(g.d1) : nrm(n);
    return add(W[l.joint], mul(n, l.side * l.r * k));
  }
  if (l.joint) { if (!W[l.joint]) throw new Error(`F66 landmark ${l.id}: joint ${l.joint} unknown`); return add(W[l.joint], rot(l.offset, (W.__ang?.[l.joint] ?? 0) * (l.rigid === false ? 0 : 1))); }
  throw new Error(`F66 landmark ${l.id}: needs bone/u/v, joint/side/r, or joint/offset`);
}

/** poseFigure(plan, pose, colors) → regions for every mass + garment folds; plan masses are authored, nothing defaults */
function poseFigure__impl(plan, pose) {
  need("F06 figure plan", plan, { id: "str", skeleton: "obj", masses: "arr", order: "arr" });
  const C = assertSolved(plan.colors, `F06 figure ${plan.id}`), W = solveSkeleton(plan.skeleton, pose), regions = {}, els = [], ports = {};
  for (const m of plan.masses) {
    need(`F06 mass ${m.id}`, m, { id: "str", physicalMass: "str", function: "str", fillRole: "str", landmarks: "arr", spans: "arr", decision: "str" });
    if (!C[m.fillRole]) throw new Error(`F06 mass ${m.id}: fill role ${m.fillRole} not in the solved palette`);
    const lms = m.landmarks.map((l) => ({ id: l.id, joint: l.jointType || "smooth", p: placeLandmark(W, plan.skeleton, l) }));
    const sil = constructSilhouette({ view: pose.view || "front", identity: m.identity || [lms[0].id], landmarks: lms, spans: m.spans });
    regions[m.id] = { d: sil.d, landmarks: Object.fromEntries(lms.map((l) => [l.id, l.p])) };
    for (const l of lms) ports[`${m.id}.${l.id}`] = l.p;
  }
  const layerOf = Object.fromEntries(plan.order.map((id, i) => [id, i]));
  for (const m of plan.masses) { if (layerOf[m.id] === undefined) throw new Error(`F59 figure ${plan.id}: mass ${m.id} missing from the authored depth order`);
    els.push(emitRegion(["F06", "F66", "F01", "F58"], "poseFigure.mass", { id: `${plan.id}.${m.id}`, d: regions[m.id].d, fill: C[m.fillRole], layer: (plan.layer ?? 0) + layerOf[m.id], owner: plan.id, parentId: m.parent || null, decision: m.decision }, [])); }
  // garment folds: per authored fold design, geometry from the ACTUAL bend at that joint and the fold class of the cloth
  for (const f of plan.folds || []) {
    need(`F66 fold ${f.id}`, f, { id: "str", mass: "str", joint: "str", child: "str", cls: FOLD_CLASSES, stiffness: "num", reach: "num+", shadeRole: "str", decision: "str" });
    const g = bendAt(W, plan.skeleton, f.joint, f.child), deg = Math.abs((g.theta * 180) / Math.PI), host = regions[f.mass]; if (!host) throw new Error(`F66 fold ${f.id}: host mass ${f.mass} unknown`);
    const J = W[f.joint], lay = (plan.layer ?? 0) + layerOf[f.mass] + 0.01;
    const emit = (k, d) => els.push(emitRegion(["F66", "F02", "F06"], `poseFigure.fold.${f.cls}`, { id: `${plan.id}.${f.id}.${k}`, d, fill: C[f.shadeRole], clip: host.d, layer: lay, owner: `${plan.id}.${f.mass}`, decision: f.decision }, []));
    if (deg < 12) continue; // straight joint: no compression folds (the source ties folds to the bend)
    const crease = add(J, mul(g.inner, f.reach * 0.55)), n = Math.max(1, Math.round((deg / 40) * (1 - f.stiffness) * 3));
    if (f.cls === "soft_drape") {
      // tapered crescents radiating from the inner crease, alternating up and down the two bones, length ∝ sin(bend/2)
      for (let k = 0; k < n; k++) { const dir = k % 2 ? mul(g.d1, -1) : g.d2, spread = (Math.floor(k / 2) + 1) * 0.35, L = f.reach * (0.5 + 0.6 * Math.sin((g.theta / 2))) * (1 - 0.18 * k);
        const tip = add(add(crease, mul(dir, L)), mul(g.outer, L * spread)), mid = add(lerp2(crease, tip, 0.5), mul(perp(nrm(sub(tip, crease))), L * 0.12 * (k % 2 ? 1 : -1)));
        emit(k, polyPath([add(crease, mul(perp(dir), f.reach * 0.06)), mid, tip, add(mid, mul(perp(nrm(sub(tip, crease))), L * 0.07)), add(crease, mul(perp(dir), -f.reach * 0.06))])); }
    } else if (f.cls === "quilted_compress") {
      // quilt channels stack perpendicular to the bone and bunch on the compressed side; spacing tightens with bend
      const gap = f.reach * (0.5 - 0.3 * Math.min(1, deg / 90));
      for (let k = -n; k <= n; k++) { if (!k) continue; const dir = k < 0 ? mul(g.d1, -1) : g.d2, c = add(J, mul(dir, Math.abs(k) * gap)), across = perp(dir), w = f.reach * (1.2 - 0.1 * Math.abs(k));
        emit(`q${k}`, polyPath(ribbon([add(c, mul(across, -w)), add(add(c, mul(g.inner, f.reach * 0.08)), mul(across, 0)), add(c, mul(across, w))], () => Math.max(1.5, f.reach * 0.07)))); }
    } else {
      // stiff break: one or two angular break planes across the joint (denim/canvas), not radiating crescents
      for (let k = 0; k < Math.min(2, n); k++) { const c = add(crease, mul(g.d2, k * f.reach * 0.5)), a = add(c, mul(g.outer, f.reach * 0.9)), b = add(c, mul(g.d2, f.reach * 0.35));
        emit(`b${k}`, polyPath([c, add(lerp2(c, a, 0.5), mul(g.d1, f.reach * 0.12)), a, b])); }
    }
  }
  return { method: ["F06", "F66", "F59"], elements: els, joints: W, ports, data: { joints: W } };
}
export const poseFigure = registerProducer("figure.poseFigure", poseFigure__impl);
