// F06 (task-specific hand art) + F59 (near fingers in front, prop midplane, far fingers behind) + F66 (prop-specific palm/thumb/finger
// geometry). Spec §4.5: hand = palm wedge + knuckle row + thumb opposition + near/far digit volumes; fingertips are DESIGNED contours;
// digits close around the SPECIFIC prop cross-section; open/release is a redrawn state of the same digits.
// Producing operation: wrist frame (position + forearm direction) places the authored palm; each finger chain starts at its knuckle and
// its joints are solved so every phalanx end lies on the wrap circle (prop radius + half finger thickness) — closure depends on the prop.
import { need, add, sub, mul, nrm, len, perp, rot, dot, polyPath, ribbon, lerp2 } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { DesignUnresolved } from "./contracts.mjs";

const STATES = ["power_cylinder", "power_capsule", "hook_cylinder", "open_release", "pinch_point", "flat_press"];

function constructGrip__impl(hd, req) {
  need("F06 hand design", hd, { identity: "str", palm: "obj", knuckles: "arr", fingers: "arr", thumb: "obj", fingertip: "obj", decision: "str" });
  need("F06 grip request", req, { id: "str", state: STATES, wrist: "vec2", forearmDir: "vec2", scale: "num+", propLayer: "num", side: [1, -1] });
  const C = assertSolved(hd.colors, `F06 hand ${hd.identity}`), k = req.scale, fx = nrm(req.forearmDir), fy = mul(perp(fx), req.side); // hand frame: x along forearm, y toward thumb side
  let wrist = req.wrist;
  // contact solving (F66): for a cylinder grip the WRIST is derived from the prop — slide along the forearm until the knuckle-row centre
  // sits just outside the cross-section (radius + 0.6 finger width), on the approach side. The figure's IK then targets this wrist.
  if ((req.state === "power_cylinder" || req.state === "hook_cylinder") && req.seat !== false) {
    need("F66 prop cross-section", req.prop, { id: "str", center: "vec2", radius: "num+", axisScreen: "vec2" });
    const kl = mul(hd.knuckles.reduce((a, q) => add(a, q), [0, 0]), 1 / hd.knuckles.length), kOff = add(mul(fx, kl[0] * k), mul(fy, kl[1] * k));
    wrist = sub(sub(req.prop.center, kOff), mul(fx, req.prop.radius + hd.fingers[0].width * k * 0.6));
  }
  if (req.state === "power_capsule") return capsuleGrip(hd, req, C, k);
  const T = (p) => add(wrist, add(mul(fx, p[0] * k), mul(fy, p[1] * k)));
  const els = [], data = { state: req.state, contacts: [], wrist };
  const local = (d) => constructSilhouette({ ...d, featureContour: true, view: "front", identity: d.identity || [d.landmarks[0].id], landmarks: d.landmarks.map((l) => ({ ...l, p: T(l.p) })) });
  const palm = local(hd.palm);
  const knuck = hd.knuckles.map((q) => T(q));
  let wrapC = null, wrapR = 0, axisScreen = [0, 0];
  if (req.state === "power_cylinder" || req.state === "hook_cylinder") {
    need("F66 prop cross-section", req.prop, { id: "str", center: "vec2", radius: "num+", axisScreen: "vec2" });
    wrapC = req.prop.center; axisScreen = nrm(req.prop.axisScreen); wrapR = req.prop.radius;
    // palm placement validity: knuckle row must be within reach of the wrap circle (fingers cannot stretch)
    const kc = mul(knuck.reduce((a, p) => add(a, p), [0, 0]), 1 / knuck.length), gap = len(sub(kc, wrapC)) - wrapR;
    if (gap < 0) throw new Error(`F66 grip ${req.id}: knuckle row is inside the ${req.prop.id} cross-section (fingers would pass through the object)`);
    if (gap > hd.fingers[0].segments[0] * k * 1.2) throw new Error(`F66 grip ${req.id}: knuckles ${gap.toFixed(1)}px from the ${req.prop.id} surface — hand does not reach the prop (re-pose the wrist)`);
  }
  const palmEl = emitRegion(["F06", "F66"], "constructGrip.palm", { id: `${req.id}.palm`, d: palm.d, fill: C.skin, layer: req.propLayer + (req.state === "power_cylinder" ? -0.2 : 0.1), owner: hd.identity }, []);
  els.push(palmEl);
  // R5 fix: authored knuckle-crease plane on the palm (anatomical volume change, F02 b) — required design, no fallback
  if (!hd.knuckleCrease) throw new DesignUnresolved([`${hd.identity}.knuckleCrease`]);
  els.push(emitRegion(["F06", "F02"], "constructGrip.knuckle_plane", { id: `${req.id}.knucklePlane`, d: local(hd.knuckleCrease).d, clip: palm.d, fill: C.skinShade, layer: palmEl.layer + 0.01, owner: hd.identity }, []));
  const nearChains = [];
  // fingers: near groups drawn over the prop, far groups under it; each chain solved against the cross-section
  hd.fingers.forEach((fdes, i) => {
    need(`F66 finger ${i}`, fdes, { knuckle: "num", segments: "arr", width: "num+", depth: ["near", "far"] });
    const w = fdes.width * k, segs = fdes.segments.map((s) => s * k), base = add(knuck[fdes.knuckle], mul(axisScreen, (fdes.depth === "far" ? -1 : 1) * w * 0.35));
    const pts = [base]; let dir = fx;
    for (let s = 0; s < segs.length; s++) {
      const P = pts.at(-1);
      if (wrapC && req.state !== "open_release") {
        // closure: choose the next joint ON the wrap circle (radius r) at chord length segs[s], continuing around the prop
        const r = wrapR + w * 0.5, d = len(sub(P, wrapC));
        if (d > r + segs[s]) { dir = nrm(sub(wrapC, P)); pts.push(add(P, mul(dir, segs[s]))); continue; }   // approach phase
        const a0 = Math.atan2(P[1] - wrapC[1], P[0] - wrapC[0]), dPhi = 2 * Math.asin(Math.min(1, segs[s] / (2 * r)));
        const sgn = Math.sign(dot(perp(sub(P, wrapC)), fx)) || 1, a1 = a0 + sgn * dPhi * (req.state === "hook_cylinder" ? 0.8 : 1);
        const Q = [wrapC[0] + r * Math.cos(a1), wrapC[1] + r * Math.sin(a1)]; dir = nrm(sub(Q, P)); pts.push(Q);
      } else {
        const curl = (req.state === "open_release" ? fdes.openCurl ?? 8 : 25) * (s + 1);
        dir = rot(fx, curl * req.side); pts.push(add(P, mul(dir, segs[s])));
      }
    }
    const tipDir = nrm(sub(pts.at(-1), pts.at(-2)));
    const tip = constructSilhouette({ ...hd.fingertip, featureContour: true, view: "front", identity: [hd.fingertip.landmarks[0].id], landmarks: hd.fingertip.landmarks.map((l) => ({ ...l, p: add(pts.at(-1), add(mul(tipDir, l.p[0] * w * 0.5), mul(perp(tipDir), l.p[1] * w * 0.5))) })) });
    const lay = req.propLayer + (fdes.depth === "near" ? 0.2 + i * 0.01 : -0.15 - i * 0.01);
    if (fdes.depth === "near") nearChains.push({ pts, w, lay });
    els.push(emitRegion(["F06", "F59", "F66"], `constructGrip.finger_${fdes.depth}`, { id: `${req.id}.finger${i}`, d: `${polyPath(ribbon(pts, (t) => w * (1 - 0.18 * t)))}`, fill: fdes.depth === "near" ? C.skin : C.skinShade, layer: lay, owner: hd.identity }, []));
    els.push(emitRegion(["F06", "F66"], "constructGrip.fingertip", { id: `${req.id}.tip${i}`, d: tip.d, fill: fdes.depth === "near" ? C.skin : C.skinShade, layer: lay + 0.001, owner: hd.identity }, []));
    data.contacts.push({ finger: i, end: pts.at(-1), onProp: wrapC ? Math.abs(len(sub(pts.at(-1), wrapC)) - (wrapR + w * 0.5)) < 1.5 : false });
  });
  // separation creases between adjacent near digits: drawn along the side of the later chain that faces the earlier one (owned crease)
  for (let c = 1; c < nearChains.length; c++) { const A = nearChains[c], side = A.pts.map((p, k) => { const a = A.pts[Math.max(0, k - 1)], b = A.pts[Math.min(A.pts.length - 1, k + 1)], nn = perp(nrm(sub(b, a))); return add(p, mul(nn, A.w * 0.45 * (1 - 0.18 * (k / (A.pts.length - 1))))); });
    els.push(emitRegion(["F06", "F02"], "constructGrip.digit_crease", { id: `${req.id}.crease${c}`, d: polyPath(ribbon(side, () => Math.max(1.2, A.w * 0.16))), fill: C.skinShade, layer: A.lay + 0.002, owner: hd.identity }, [])); }
  // thumb: opposition chain from its authored base; wraps the opposite way over the near fingers (power) or meets index (pinch)
  const th = hd.thumb; need("F66 thumb", th, { base: "vec2", segments: "arr", width: "num+" });
  const tb = T(th.base), tw = th.width * k; let tpts = [tb];
  if (wrapC && req.state === "power_cylinder") { const r = wrapR + tw * 0.6, a0 = Math.atan2(tb[1] - wrapC[1], tb[0] - wrapC[0]); let a = a0; for (const s of th.segments) { a -= (s * k) / r; tpts.push([wrapC[0] + r * Math.cos(a), wrapC[1] + r * Math.sin(a)]); } }
  else if (req.state === "pinch_point") { need("F06 pinch", req, { pinch: "vec2" }); tpts = [tb, lerp2(tb, req.pinch, 0.55), req.pinch]; }
  else { let d = rot(fx, -35 * req.side); for (const s of th.segments) { tpts.push(add(tpts.at(-1), mul(d, s * k))); d = rot(d, 12 * req.side); } }
  els.push(emitRegion(["F06", "F66"], "constructGrip.thumb", { id: `${req.id}.thumb`, d: polyPath(ribbon(tpts, (t) => tw * (1 - 0.2 * t))), fill: C.skin, layer: req.propLayer + 0.25, owner: hd.identity }, []));
  if (wrapC) { const ends = data.contacts.map((c) => c.end), cen = mul(ends.reduce((a, p) => add(a, p), [0, 0]), 1 / ends.length); data.graspCenter = cen; data.closure = data.contacts.filter((c) => c.onProp).length / data.contacts.length; }
  return { method: ["F06", "F59", "F66"], elements: els, data };
}
// R5 capability: SIDE-ON handle (capsule a→b). The knuckle row lies parallel to the handle on the approach side; each near finger is a band
// crossing the handle at its own axis station and ending in the authored fingertip just past the far edge; palm behind the handle; the
// thumb wraps over the index band. Wrist is derived (seated) from the handle — the arm IK targets it.
function capsuleGrip(hd, req, C, k) {
  need("F66 capsule", req.prop, { id: "str", a: "vec2", b: "vec2", radius: "num+", approach: "vec2" });
  const ax = nrm(sub(req.prop.b, req.prop.a)), app = nrm(sub(req.prop.approach, mul(ax, dot(req.prop.approach, ax)))), r = req.prop.radius, Lh = len(sub(req.prop.b, req.prop.a));
  const near = hd.fingers.filter((f) => f.depth === "near"), all = hd.fingers, w0 = all[0].width * k, span = all.reduce((t, f) => t + f.width * k * 0.92, 0);
  if (span > Lh * 1.15) throw new Error(`F66 grip ${req.id}: hand (${span.toFixed(0)}px of fingers) does not fit the ${req.prop.id} handle length ${Lh.toFixed(0)}px`);
  const mid = lerp2(req.prop.a, req.prop.b, 0.5), knuckleLine = add(mid, mul(app, r + w0 * 0.35)), wrist = add(knuckleLine, mul(app, (hd.palm.landmarks.reduce((m, l) => Math.max(m, l.p[0]), 0)) * k));
  const fx = mul(app, -1), fy = mul(perp(fx), req.side), T = (p) => add(wrist, add(mul(fx, p[0] * k), mul(fy, p[1] * k)));
  const local = (d) => constructSilhouette({ ...d, featureContour: true, view: "front", identity: d.identity || [d.landmarks[0].id], landmarks: d.landmarks.map((l) => ({ ...l, p: T(l.p) })) });
  const els = [], data = { state: "power_capsule", wrist, contacts: [] }, L0 = req.propLayer;
  const palm = local(hd.palm); els.push(emitRegion(["F06", "F66"], "constructGrip.palm", { id: `${req.id}.palm`, d: palm.d, fill: C.skin, layer: L0 - 0.2, owner: hd.identity }, []));
  let s0 = -span / 2;
  all.forEach((f, i) => {
    const w = f.width * k, st = add(mid, mul(ax, s0 + w * 0.46)); s0 += w * 0.92;
    const base = add(st, mul(app, r + w * 0.35)), over = add(st, mul(app, r * 0.15)), end = add(st, mul(app, -(r * 0.9)));
    const pts = [base, lerp2(base, over, 0.5), over, end], lay = L0 + (f.depth === "near" ? 0.2 + i * 0.01 : -0.15 - i * 0.01), fill = f.depth === "near" ? C.skin : C.skinShade;
    els.push(emitRegion(["F06", "F59", "F66"], `constructGrip.capsule_finger_${f.depth}`, { id: `${req.id}.finger${i}`, d: polyPath(ribbon(pts, (t) => w * (1 - 0.12 * t))), fill, layer: lay, owner: hd.identity }, []));
    const td = nrm(sub(end, over)), tip = constructSilhouette({ ...hd.fingertip, featureContour: true, view: "front", identity: [hd.fingertip.landmarks[0].id], landmarks: hd.fingertip.landmarks.map((l) => ({ ...l, p: add(end, add(mul(td, l.p[0] * w * 0.5), mul(perp(td), l.p[1] * w * 0.5))) })) });
    els.push(emitRegion(["F06", "F66"], "constructGrip.fingertip", { id: `${req.id}.tip${i}`, d: tip.d, fill, layer: lay + 0.001, owner: hd.identity }, []));
    if (i > 0 && f.depth === "near") els.push(emitRegion(["F06", "F02"], "constructGrip.digit_crease", { id: `${req.id}.crease${i}`, d: polyPath(ribbon([add(base, mul(ax, -w * 0.46)), add(over, mul(ax, -w * 0.46)), add(end, mul(ax, -w * 0.4))], () => Math.max(1.2, w * 0.14))), fill: C.skinShade, layer: lay + 0.002, owner: hd.identity }, []));
    data.contacts.push({ finger: i, station: +s0.toFixed(1), crossesHandle: true });
  });
  if (hd.knuckleCrease) els.push(emitRegion(["F06", "F02"], "constructGrip.knuckle_plane", { id: `${req.id}.knucklePlane`, d: local(hd.knuckleCrease).d, clip: palm.d, fill: C.skinShade, layer: L0 - 0.19, owner: hd.identity }, []));
  const th = hd.thumb, tb = T(th.base), tTip = add(add(mid, mul(ax, -span / 2 + all[0].width * k * 0.4)), mul(app, r * 0.2));
  els.push(emitRegion(["F06", "F66"], "constructGrip.thumb", { id: `${req.id}.thumb`, d: polyPath(ribbon([tb, lerp2(tb, tTip, 0.55), tTip], (t) => th.width * k * (1 - 0.2 * t))), fill: C.skin, layer: L0 + 0.3, owner: hd.identity }, []));
  data.graspCenter = mid; data.closure = 1;
  return { method: ["F06", "F59", "F66"], elements: els, data };
}
export const constructGrip = registerProducer("grip.constructGrip", constructGrip__impl);
