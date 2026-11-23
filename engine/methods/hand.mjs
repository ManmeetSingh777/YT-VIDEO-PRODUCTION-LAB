// F06 (steps 3–4, test) + F59 (hand holding a prop: near fingers in front, prop midplane, far fingers behind) + F66 (target per hand).
// Source: generate actual TASK-SPECIFIC hand art — reaching (separated open palm/finger mass), pinch, hook grip, broad supported palm,
// holding stick/clipboard, computer input, irregular prop; simplified fingers but readable hand/prop relationship; contact graph
// actor.hand → prop.handle with near/far occlusion, grip closure and exact attachment side; fingers never pass through the object.
// Test: remove the prop — wrist/thumb/finger orientation still indicates the grasp location; replace the prop — a NEW valid contact state.
// Producing operation: hand frame (wrist + forearm direction) + grip type + prop geometry (axis point/direction/radius or surface/target)
// → palm, finger groups and thumb solved against the prop: wrap bands across the handle sized by radius, layered around the prop layer.
import { need, add, sub, mul, nrm, len, perp, dot, polyPath, lerp2, rot, ellipsePts, smoothClosedPath, ribbon } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const GRIPS = ["power", "hook", "pinch", "open_reach", "flat_support", "key_press"];

function constructHand__impl(design) {
  need("F06 hand", design, { id: "str", wrist: "vec2", forearmDir: "vec2", grip: GRIPS, palm: "obj", fingers: "obj", thumb: "obj", propLayer: "num" });
  need("F06 palm", design.palm, { length: "num+", width: "num+" }); need("F06 fingers", design.fingers, { length: "num+", thickness: "num+", groups: [1, 2, 3, 4] }); need("F06 thumb", design.thumb, { length: "num+", thickness: "num+", side: ["near", "far"] });
  const C = assertSolved(design.colors, `F06 hand ${design.id}`), id = design.id, Lp = design.propLayer, els = [], data = { grip: design.grip, contacts: [] };
  const fwd = nrm(design.forearmDir), W = design.wrist, Pm = design.palm, Fg = design.fingers, Th = design.thumb;
  const m = (fn, eid, d, layer, reads, fill = C.skin) => els.push(emitRegion(["F06", "F59"], `constructHand.${fn}`, { id: `${id}.${eid}`, d, fill, layer, owner: id }, reads));
  if (design.grip === "power" || design.grip === "hook") {
    need("F06 prop", design.prop, { id: "str", axisPoint: "vec2", axisDir: "vec2", radius: "num+" });
    const ax = nrm(design.prop.axisDir), r = design.prop.radius;
    // approach direction = component of the forearm direction perpendicular to the handle axis (the hand closes ACROSS the handle)
    let across = sub(fwd, mul(ax, dot(fwd, ax))); if (len(across) < 0.2) throw new Error(`F06 hand ${id}: forearm runs along the handle axis — a power/hook grip needs the hand to approach across the handle`); across = nrm(across);
    // grasp station: point on the axis nearest the wrist projected forward by palm length
    const reachPt = add(W, mul(fwd, Pm.length)), s = dot(sub(reachPt, design.prop.axisPoint), ax), axisAt = add(design.prop.axisPoint, mul(ax, s));
    const knuckleLine = sub(axisAt, mul(across, r + Fg.thickness * 0.5)); // palm's distal edge sits tangent to the handle on the approach side
    const closure = design.grip === "hook" ? Math.min(1, Fg.length / (2 * r)) : Math.min(1, Fg.length / (Math.PI * r));
    if (closure < 0.5) throw new Error(`F06 hand ${id}: grip cannot close (finger length ${Fg.length} vs handle radius ${r}: closure ${closure.toFixed(2)}) — redesign hand scale or prop`);
    const palmD = smoothClosedPath([add(W, mul(perp(fwd), Pm.width * 0.45)), add(knuckleLine, mul(ax, Pm.width * 0.55)), add(knuckleLine, mul(ax, -Pm.width * 0.55)), add(W, mul(perp(fwd), -Pm.width * 0.45))]);
    m("palm", "palm", palmD, Lp - 0.2, ["palm", "prop.axisPoint", "prop.radius"]);
    // finger groups: bands stacked along the axis, crossing the handle (visible on the NEAR face, in front of the prop)
    const g = design.fingers.groups, span = Pm.width * 1.05, bandW = span / g;
    for (let k = 0; k < g; k++) {
      const off = -span / 2 + bandW * (k + 0.5), b0 = add(knuckleLine, mul(ax, off)), crossLen = Math.min(Fg.length, (design.grip === "hook" ? 1 : 2) * r + Fg.thickness * closure);
      const line = [b0, add(b0, mul(across, crossLen * 0.5)), add(b0, mul(across, crossLen))];
      m("finger_near", `finger${k}`, polyPath(ribbon(line, (t) => bandW * (0.92 - 0.12 * t))), Lp + 0.2 + k * 0.001, ["fingers", "prop.radius", "prop.axisDir"]);
    }
    // far fingertips curl BEHIND the handle (drawn below prop layer), only when the wrap exceeds the handle's front half
    if (design.grip === "power" && closure > 0.75) m("finger_far", "fingertipsFar", smoothClosedPath(ellipsePts(add(axisAt, mul(across, r * 0.6)), Fg.thickness * 0.7, span * 0.45, 12, (Math.atan2(across[1], across[0]) * 180) / Math.PI)), Lp - 0.1, ["fingers.length"]);
    // thumb wraps from the opposite side of the fingers; near thumb crosses over the fingers, far thumb hides behind the prop
    if (design.grip === "power") {
      const tb = add(W, mul(perp(fwd), (Th.side === "near" ? 1 : -1) * Pm.width * 0.4)), tTip = add(axisAt, mul(ax, (Th.side === "near" ? 1 : -1) * Pm.width * 0.2));
      const line = [tb, lerp2(tb, tTip, 0.5), add(tTip, mul(across, r * 0.3))].slice(0, 3);
      m("thumb", "thumb", polyPath(ribbon(line, (t) => Th.thickness * (1 - 0.25 * t))), Th.side === "near" ? Lp + 0.3 : Lp - 0.15, ["thumb.side", "thumb.length"]);
    }
    data.contacts.push({ from: `${id}.hand`, to: `${design.prop.id}.handle`, at: axisAt, side: across, closure: +closure.toFixed(2) });
    data.stack = ["palm", design.prop.id, "fingers_near", ...(Th.side === "near" ? ["thumb"] : [])];
    data.graspCenter = axisAt;
  } else if (design.grip === "pinch") {
    need("F06 pinch", design.prop, { id: "str", axisPoint: "vec2", radius: "num+" });
    const pinchPt = design.prop.axisPoint, kn = add(W, mul(fwd, Pm.length)), dist = len(sub(pinchPt, kn));
    if (dist > Fg.length * 1.05) throw new Error(`F06 hand ${id}: pinch point ${dist.toFixed(1)} beyond index length ${Fg.length} (no stretching)`);
    m("palm", "palm", smoothClosedPath([add(W, mul(perp(fwd), Pm.width * 0.45)), add(kn, mul(perp(fwd), Pm.width * 0.5)), add(kn, mul(perp(fwd), -Pm.width * 0.5)), add(W, mul(perp(fwd), -Pm.width * 0.45))]), Lp - 0.2, ["palm"]);
    m("curled_fingers", "curled", smoothClosedPath(ellipsePts(add(kn, mul(fwd, Fg.thickness * 0.6)), Fg.thickness * 0.9, Pm.width * 0.45, 12, (Math.atan2(fwd[1], fwd[0]) * 180) / Math.PI)), Lp - 0.15, ["fingers.thickness"]);
    const idxBase = add(kn, mul(perp(fwd), Pm.width * 0.35)), thBase = add(W, mul(perp(fwd), -Pm.width * 0.5));
    m("index", "index", polyPath(ribbon([idxBase, lerp2(idxBase, pinchPt, 0.55), add(pinchPt, mul(nrm(sub(pinchPt, idxBase)), design.prop.radius * 0.5))], (t) => Fg.thickness * (1 - 0.2 * t))), Lp + 0.2, ["prop.axisPoint", "fingers.length"]);
    m("thumb", "thumb", polyPath(ribbon([thBase, lerp2(thBase, pinchPt, 0.55), add(pinchPt, mul(nrm(sub(pinchPt, thBase)), design.prop.radius * 0.5))], (t) => Th.thickness * (1 - 0.2 * t))), Th.side === "near" ? Lp + 0.25 : Lp - 0.1, ["prop.axisPoint", "thumb.side"]);
    data.contacts.push({ from: `${id}.index+thumb`, to: `${design.prop.id}`, at: pinchPt }); data.graspCenter = pinchPt;
  } else if (design.grip === "open_reach") {
    need("F06 reach", design, { target: "vec2", spread: "num" });
    const kn = add(W, mul(fwd, Pm.length)), toT = nrm(sub(design.target, kn));
    m("palm", "palm", smoothClosedPath([add(W, mul(perp(fwd), Pm.width * 0.45)), add(kn, mul(perp(fwd), Pm.width * 0.55)), add(kn, mul(perp(fwd), -Pm.width * 0.55)), add(W, mul(perp(fwd), -Pm.width * 0.45))]), Lp + 0.1, ["palm"]);
    const g = design.fingers.groups;
    for (let k = 0; k < g; k++) { const a = g === 1 ? 0 : -design.spread / 2 + (design.spread * k) / (g - 1), dir = rot(toT, a), b0 = add(kn, mul(perp(fwd), Pm.width * (0.4 - (0.8 * k) / Math.max(1, g - 1))));
      m("finger_open", `finger${k}`, polyPath(ribbon([b0, add(b0, mul(dir, Fg.length * 0.5)), add(b0, mul(dir, Fg.length))], (t) => Fg.thickness * (1 - 0.3 * t))), Lp + 0.11, ["target", "spread", "fingers.groups"]); }
    const tb = add(W, mul(perp(fwd), -Pm.width * 0.5)), tdir = rot(toT, -(design.spread / 2 + 35));
    m("thumb", "thumb", polyPath(ribbon([tb, add(tb, mul(tdir, Th.length * 0.5)), add(tb, mul(tdir, Th.length))], (t) => Th.thickness * (1 - 0.3 * t))), Lp + 0.12, ["thumb.length", "spread"]);
    data.graspCenter = design.target;
  } else if (design.grip === "flat_support" || design.grip === "key_press") {
    need("F06 support", design, { surfaceY: "num" });
    const kn = add(W, mul(fwd, Pm.length)), fl = [W, kn].map((p) => [p[0], Math.min(p[1], design.surfaceY)]);
    const palmPts = [add(fl[0], [0, -Pm.width * 0.35]), add(fl[1], [0, -Pm.width * 0.3]), [fl[1][0], design.surfaceY], [fl[0][0], design.surfaceY]];
    m("palm", "palm", smoothClosedPath(palmPts), Lp + 0.1, ["surfaceY", "palm"]);
    const dir = design.grip === "key_press" ? nrm([fwd[0], Math.abs(fwd[0]) * 0.8 + 0.3]) : nrm([Math.sign(fwd[0]) || 1, 0]);
    const b0 = [fl[1][0], design.surfaceY - Fg.thickness * 0.5], tip = design.grip === "key_press" ? [b0[0] + dir[0] * Fg.length, design.surfaceY] : add(b0, mul(dir, Fg.length));
    m("finger_support", "fingers", polyPath(ribbon([b0, lerp2(b0, tip, 0.5), tip], (t) => (design.grip === "key_press" ? Fg.thickness : Pm.width * 0.6) * (1 - 0.2 * t))), Lp + 0.11, ["surfaceY", "fingers.length"]);
    data.contacts.push({ from: `${id}.${design.grip === "key_press" ? "index" : "palm"}`, to: "support", at: tip }); data.graspCenter = tip;
  }
  return { method: ["F06", "F59"], elements: els, data };
}

/** F06 test: with the prop removed, the near-finger mass still points at the grasp location (centroid within the handle radius band) */
export function graspIndicatesProp(hand, prop) {
  const fingers = hand.elements.filter((e) => /finger\d/.test(e.id)); if (!fingers.length) return { pass: false, detail: "no finger geometry" };
  const pts = fingers.flatMap((e) => e.d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g).map((s) => s.split(",").map(Number)));
  const c = mul(pts.reduce((a, p) => add(a, p), [0, 0]), 1 / pts.length), ax = nrm(prop.axisDir), rel = sub(c, prop.axisPoint), dist = Math.abs(rel[0] * ax[1] - rel[1] * ax[0]);
  return { pass: dist <= prop.radius * 1.2, distToAxis: +dist.toFixed(1), radius: prop.radius };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructHand = registerProducer("hand.constructHand", constructHand__impl);
