// F06 + F66 (CHARACTER_FAMILY_CONSTRUCTOR B.5) — whole gesture, support/weight, pose-specific garment volumes.
// Source: choose gesture + support pose first (centre of mass, supported limbs); torso and garment are pose-SPECIFIC silhouettes —
// bent sleeves, distinct near/far cuff colours, overlap and folds DETERMINED BY THE BEND; not all limbs the same width (F06.2).
// F66: pelvis centre, shoulder axis, near/far feet contacts, ONE weight-support foot per state, target per interacting hand; garment =
// large filled contours with collar/cuffs/hem; joint seams hide under sleeve/hand; distinct views need distinct drawings.
// Spec §8.2: validate reach BEFORE solving IK — never silently clamp; report unreachable.
// Producing operation: skeleton (FK or validated 2-bone IK) → limb outline from the bone chain with an authored width profile, where
// the OUTER side of a bent joint is rounded and the INNER side creases at the offset-line intersection → fold wedges whose count and
// length come from bend angle × fabric stiffness → cuff band at an arclength station → torso contour derived from the skeleton landmarks.
import { need, add, sub, mul, nrm, len, perp, rot, deg, dot, cross, polyPath, lerp2, ellipsePts, smoothClosedPath } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { RULES } from "./knowledge.mjs";

export const GARMENTS = ["sleeve", "trouser", "bare_skin", "hard_shell"];
const ROOTS = ["shoulderNear", "shoulderFar", "hipNear", "hipFar"];

/** 2-bone IK with explicit reach status (no silent clamp) */
export function ik2(root, target, l1, l2, bendSign) {
  const d = len(sub(target, root));
  if (d > l1 + l2 - 1e-6) return { reachable: false, reason: `target ${d.toFixed(1)} beyond reach ${(l1 + l2).toFixed(1)}` };
  if (d < Math.abs(l1 - l2) + 1e-6) return { reachable: false, reason: `target ${d.toFixed(1)} inside minimum reach ${Math.abs(l1 - l2).toFixed(1)}` };
  const a = Math.acos(Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d)))), base = Math.atan2(target[1] - root[1], target[0] - root[0]);
  const ang = base + bendSign * a, joint = add(root, [l1 * Math.cos(ang), l1 * Math.sin(ang)]);
  return { reachable: true, joint, end: target };
}

/** outline of a 2-segment limb from its bone chain and width profile [root, joint, end] */
function limbOutline(A, B, Cc, w) {
  const u1 = nrm(sub(B, A)), u2 = nrm(sub(Cc, B)), n1 = perp(u1), n2 = perp(u2), bend = Math.atan2(cross(u1, u2), dot(u1, u2)); // signed bend
  const s = Math.sign(bend) || 1; // inner side is +n if bend>0 (turning toward +n)
  const inner = (P, n, wd) => add(P, mul(n, (s * wd) / 2)), outer = (P, n, wd) => add(P, mul(n, (-s * wd) / 2));
  // inner crease: intersection of the two inner offset lines (compression point)
  const iA = inner(A, n1, w[0]), iB1 = inner(B, n1, w[1]), iB2 = inner(B, n2, w[1]), iC = inner(Cc, n2, w[2]);
  const den = cross(sub(iB1, iA), sub(iC, iB2)); let crease = lerp2(iB1, iB2, 0.5);
  if (Math.abs(den) > 1e-6) { const t = cross(sub(iB2, iA), sub(iC, iB2)) / den; if (t > 0.2 && t < 1.6) crease = add(iA, mul(sub(iB1, iA), t)); }
  // outer side: rounded arc around the joint (radius = half joint width)
  const oA = outer(A, n1, w[0]), oC = outer(Cc, n2, w[2]), arc = [], a0 = Math.atan2(-s * n1[1], -s * n1[0]), a1 = Math.atan2(-s * n2[1], -s * n2[0]);
  let da = a1 - a0; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
  for (let k = 0; k <= 8; k++) { const t = a0 + (da * k) / 8; arc.push(add(B, [(Math.cos(t) * w[1]) / 2, (Math.sin(t) * w[1]) / 2])); }
  const innerRun = [iA, crease, iC], outerRun = [oA, ...arc, oC];
  return { poly: [...innerRun, ...outerRun.reverse()], bendDeg: (bend * 180) / Math.PI, crease, innerSign: s, u1, u2, n1, n2 };
}

/** constructBody(design) */
function constructBody__impl(design) {
  need("F06 body", design, { id: "str", pose: "obj", limbs: "arr", torsoGarment: "obj", support: "obj", layer: "num" });
  const P = need("F66 pose", design.pose, { pelvis: "vec2", torsoAngle: "num", torsoLen: "num+", shoulderWidth: "num+", hipWidth: "num+", shoulderTilt: "num", hipTilt: "num", state: ["held", "in_motion"] });
  const TG = need("F66 torso garment", design.torsoGarment, { chestBulge: "num", waistTaper: "num", hemDrop: "num", collar: ["round", "v", "stand", "none"], collarDepth: "num" });
  const S = need("F66 support", design.support, { weightFoot: "str", groundY: "num" });
  const C = assertSolved(design.colors, `F06 body ${design.id}`), id = design.id, L0 = design.layer, els = [], data = { limbs: {}, contacts: [] };
  // skeleton
  const up = rot([0, -1], P.torsoAngle), side = rot([1, 0], P.torsoAngle);
  const neck = add(P.pelvis, mul(up, P.torsoLen)), sh = (k) => add(neck, mul(rot(side, P.shoulderTilt), k * P.shoulderWidth / 2)), hp = (k) => add(P.pelvis, mul(rot(side, P.hipTilt), k * P.hipWidth / 2));
  const J = { shoulderNear: sh(-1), shoulderFar: sh(1), hipNear: hp(-1), hipFar: hp(1), neck, pelvis: P.pelvis };
  if (design.pose.nearSide === "right") { [J.shoulderNear, J.shoulderFar] = [J.shoulderFar, J.shoulderNear]; [J.hipNear, J.hipFar] = [J.hipFar, J.hipNear]; }
  // torso: contour constructed from skeleton landmarks; span characters from the garment design
  const waistN = lerp2(J.hipNear, J.shoulderNear, 0.45), waistF = lerp2(J.hipFar, J.shoulderFar, 0.45), hemN = add(J.hipNear, mul(up, -TG.hemDrop)), hemF = add(J.hipFar, mul(up, -TG.hemDrop));
  const torso = constructSilhouette({ view: "front", identity: ["shoulderNear", "shoulderFar"], landmarks: [
    { id: "neckN", p: add(neck, mul(side, -P.shoulderWidth * 0.14)), joint: "corner" }, { id: "neckF", p: add(neck, mul(side, P.shoulderWidth * 0.14)), joint: "corner" },
    { id: "shoulderFar", p: J.shoulderFar, joint: "smooth" }, { id: "waistF", p: waistF, joint: "smooth" }, { id: "hemF", p: hemF, joint: "corner" }, { id: "hemN", p: hemN, joint: "corner" },
    { id: "waistN", p: waistN, joint: "smooth" }, { id: "shoulderNear", p: J.shoulderNear, joint: "smooth" }],
    spans: [{ from: "neckN", to: "neckF", character: "concave", amount: 0.08 }, { from: "neckF", to: "shoulderFar", character: "convex", amount: 0.12 }, { from: "shoulderFar", to: "waistF", character: TG.chestBulge >= 0 ? "convex" : "concave", amount: Math.abs(TG.chestBulge) },
      { from: "waistF", to: "hemF", character: "concave", amount: TG.waistTaper }, { from: "hemF", to: "hemN", character: "convex", amount: 0.04 }, { from: "hemN", to: "waistN", character: "concave", amount: TG.waistTaper },
      { from: "waistN", to: "shoulderNear", character: TG.chestBulge >= 0 ? "convex" : "concave", amount: Math.abs(TG.chestBulge) }, { from: "shoulderNear", to: "neckN", character: "convex", amount: 0.12 }] });
  els.push(emitRegion(["F06", "F66"], "constructBody.torso", { id: `${id}.torso`, d: torso.d, fill: C.torsoCloth, layer: L0, owner: id }, ["pose", "torsoGarment"]));
  if (TG.collar !== "none") {
    const cw = P.shoulderWidth * 0.14, a = add(neck, mul(side, -cw)), b = add(neck, mul(side, cw)), tip = add(neck, mul(up, -TG.collarDepth));
    const pts = TG.collar === "v" ? [a, tip, b] : TG.collar === "round" ? ellipsePts(neck, cw, TG.collarDepth, 12, P.torsoAngle, 0, 180) : [add(a, mul(up, TG.collarDepth * 0.5)), a, b, add(b, mul(up, TG.collarDepth * 0.5))];
    els.push(emitRegion(["F66"], "constructBody.collar", { id: `${id}.collar`, d: polyPath(pts), fill: TG.collar === "stand" ? C.cuffNear : C.skin, clip: torso.d, layer: L0 + 0.05, owner: id }, ["torsoGarment.collar", "torsoGarment.collarDepth"]));
  }
  // limbs (artistic layer: no identical uniform tubes)
  RULES.F06_limb_variety(design.limbs, `F06 body ${design.id}`);
  for (const l of design.limbs) {
    need(`F66 limb ${l.id}`, l, { id: "str", root: ROOTS, lengths: "arr", widths: "arr", garment: GARMENTS, bendSign: "num" });
    if (l.lengths.length !== 2 || l.widths.length !== 3) throw new Error(`F66 limb ${l.id}: lengths [upper, lower] and widths [root, joint, end] required`);
    const A = J[l.root]; let B, E;
    if (l.target) { const s = ik2(A, l.target, l.lengths[0], l.lengths[1], Math.sign(l.bendSign) || 1); if (!s.reachable) throw new Error(`F66 limb ${l.id}: UNREACHABLE — ${s.reason} (move the root/torso or redesign the pose; no silent clamp)`); B = s.joint; E = s.end; }
    else { need(`F66 limb ${l.id}`, l, { angles: "arr" }); const a1 = deg(l.angles[0]), a2 = a1 + deg(l.angles[1]); B = add(A, [l.lengths[0] * Math.cos(a1), l.lengths[0] * Math.sin(a1)]); E = add(B, [l.lengths[1] * Math.cos(a2), l.lengths[1] * Math.sin(a2)]); }
    const far = /Far$/.test(l.root), lay = far ? L0 - 0.5 : L0 + 0.5, fill = l.garment === "sleeve" ? C.sleeveCloth : l.garment === "trouser" ? C.trouserCloth : l.garment === "hard_shell" ? C.shell : C.skin;
    if (!fill) throw new Error(`F66 limb ${l.id}: solved palette lacks the ${l.garment} role`);
    const o = limbOutline(A, B, E, l.widths);
    els.push(emitRegion(["F06", "F66"], "constructBody.limb", { id: `${id}.${l.id}`, d: polyPath(o.poly), fill, layer: lay, owner: id }, ["limbs.lengths", "limbs.widths", "limbs.angles|target", "limbs.bendSign"]));
    const info = { root: A, joint: B, end: E, bendDeg: +o.bendDeg.toFixed(1), dir: o.u2, far };
    // folds DETERMINED BY THE BEND (cloth only): count + length from bend angle and stiffness, wedges on the compressed inner side
    if ((l.garment === "sleeve" || l.garment === "trouser") && Math.abs(o.bendDeg) > 15) {
      need(`F66 garment ${l.id}`, l, { stiffness: "num" });
      const n = Math.max(1, Math.round((Math.abs(o.bendDeg) / 45) * (1 - l.stiffness) * 3)), reach = l.widths[1] * (0.35 + 0.6 * Math.sin(deg(Math.abs(o.bendDeg)) / 2));
      for (let k = 0; k < n; k++) {
        const t = (k + 1) / (n + 1), dirU = k % 2 ? mul(o.u1, -1) : o.u2, base = add(o.crease, mul(dirU, (t * l.lengths[k % 2]) * 0.35));
        const tip = add(base, mul(perp(dirU), -o.innerSign * reach * (1 - t * 0.5))), wv = l.widths[1] * 0.12;
        els.push(emitRegion(["F66", "F02"], "constructBody.fold", { id: `${id}.${l.id}.fold${k}`, d: polyPath([add(base, mul(dirU, -wv)), tip, add(base, mul(dirU, wv))]), fill: C.foldShade, clip: polyPath(o.poly), layer: lay + 0.01, owner: id }, ["limbs.stiffness", "limbs.angles|target"]));
      }
      info.folds = n;
    }
    // cuff/hem band at an arclength station of the lower segment; near/far colours distinct (F06.2)
    if (l.cuff) {
      need(`F66 cuff ${l.id}`, l.cuff, { at: "num", thickness: "num+", flare: "num" });
      const c0 = lerp2(B, E, l.cuff.at), c1 = add(c0, mul(o.u2, l.cuff.thickness)), w0 = (l.widths[1] + (l.widths[2] - l.widths[1]) * l.cuff.at) / 2 + l.cuff.flare, nn = o.n2;
      els.push(emitRegion(["F66"], "constructBody.cuff", { id: `${id}.${l.id}.cuff`, d: polyPath([add(c0, mul(nn, w0)), add(c1, mul(nn, w0)), add(c1, mul(nn, -w0)), add(c0, mul(nn, -w0))]), fill: far ? C.cuffFar : C.cuffNear, layer: lay + 0.02, owner: id }, ["limbs.cuff"]));
      info.cuffEnd = c1;
    }
    data.limbs[l.id] = info;
  }
  // weight: centre of mass vs the declared weight-support foot (F66: one weight-support foot per state)
  const wf = data.limbs[S.weightFoot]; if (!wf) throw new Error(`F66 ${id}: weight foot "${S.weightFoot}" is not a constructed limb`);
  const segs = [[lerp2(J.pelvis, J.neck, 0.5), 0.5], ...Object.values(data.limbs).map((x) => [lerp2(x.root, x.end, 0.5), 0.125])];
  const tot = segs.reduce((a, s) => a + s[1], 0), com = mul(segs.reduce((a, [p, w]) => add(a, mul(p, w)), [0, 0]), 1 / tot);
  const footHalf = design.support.footLength ? design.support.footLength / 2 : 30, balanced = Math.abs(com[0] - wf.end[0]) <= footHalf;
  const grounded = Math.abs(wf.end[1] - S.groundY) <= 4;
  data.weight = { com: com.map((v) => +v.toFixed(1)), supportX: +wf.end[0].toFixed(1), footHalf, balanced, grounded };
  data.contacts.push({ from: `${id}.${S.weightFoot}`, to: "ground", at: wf.end, grounded });
  if (P.state === "held" && (!balanced || !grounded)) throw new Error(`F66 ${id}: held pose not supported (non-renderable): COM x ${com[0].toFixed(1)} vs support ${wf.end[0].toFixed(1)}±${footHalf}, foot ${grounded ? "on" : "off"} ground`);
  return { method: ["F06", "F66"], elements: els, joints: J, data };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructBody = registerProducer("body.constructBody", constructBody__impl);
