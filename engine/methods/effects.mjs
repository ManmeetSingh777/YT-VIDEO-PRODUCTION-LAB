// F32 (effects are time-bounded images with owned colour/geometry) + F23 (perception effects as registered compositing passes) + F04 (3/4).
// F32 classes: surface_emission (core clipped inside owner, radius-limited glow, optional bounce), volumetric_source (luminous mass +
// DIRECTED rays respecting occluders), global_exposure (explicit field with ramp in/out + reaction state), camera_perception (non-diegetic,
// constrained to an optical layer). Particles need origin/trajectory/size hierarchy + timed dissipation. Disable effect → base world complete.
// F23: MASTER → EFFECT → MASTER/EFFECT_B; symbol-attachment on meaningful surfaces; monochrome with semantic accent exceptions; colour
// remap via a role map on stable masks; geometry must stay registered.
// Producing operation: owner geometry → emission core (owner-clipped) + halo rings bounded to an allowed mask; rays generated from the
// source within an angular range and cut by occluders; passes re-mint MASTER elements with transformed paint only.
import { need, add, mul, rot, polyPath, shiftPath, ribbon, rng } from "./core.mjs";
import { emitRegion, isMinted, compose, registerProducer } from "./emit.mjs";
import { assertSolved, hexToRgb, rgbToHex, relLum } from "./palette.mjs";

export const CLASSES = ["surface_emission", "volumetric_source", "global_exposure", "camera_perception"];

function constructEffect__impl(design) {
  need("F32 effect", design, { id: "str", class: CLASSES, owner: "str", window: "obj", reason: "str", layer: "num" });
  need("F32 window", design.window, { start: "num", end: "num" });
  if (design.window.end <= design.window.start) throw new Error("F32: effects are time-bounded");
  const C = assertSolved(design.colors, `F32 ${design.id}`), els = [];
  if (design.class === "surface_emission") {
    if (!isMinted(design.ownerElement)) throw new Error("F32/F04: emission needs a produced owner shape (emitter first, halo after)");
    need("F32 emission", design, { coreInset: "num", haloRings: "num", haloStep: "num+", allowed: "str" });
    const d = design.ownerElement.d;
    els.push(emitRegion(["F32", "F04", "F46"], "constructEffect.core", { id: `${design.id}.core`, d, clip: d, fill: C.core, layer: design.layer + 0.02, owner: design.owner }, ["ownerElement"]));
    for (let k = 1; k <= design.haloRings; k++) for (const v of [[1, 0], [-1, 0], [0, 1], [0, -1]]) els.push(emitRegion(["F32", "F63"], "constructEffect.halo", { id: `${design.id}.halo${k}_${v.join("")}`, d: shiftPath(d, mul(v, k * design.haloStep)), clip: design.allowed, fill: C.halo, opacity: 0.18 / k, layer: design.layer, owner: design.owner }, ["haloRings", "haloStep", "allowed"]));
  } else if (design.class === "volumetric_source") {
    need("F32 rays", design, { source: "vec2", rays: "num", spread: "arr", length: "num+", seed: "num", occluders: "arr" });
    const r = rng(design.seed);
    for (let i = 0; i < design.rays; i++) { const a = design.spread[0] + ((design.spread[1] - design.spread[0]) * (i + 0.5)) / design.rays, L = design.length * (0.6 + 0.4 * r()), tip = add(design.source, mul(rot([1, 0], a), L)), w = L * 0.05;
      const wedge = [design.source, add(tip, mul(rot([0, 1], a), w)), add(tip, mul(rot([0, -1], a), w))];
      const clip = design.occluders.length ? `M-5000,-5000 L7000,-5000 L7000,7000 L-5000,7000 Z ${design.occluders.map((o) => o.d).join(" ")}` : undefined; // even-odd: outside occluders
      els.push(emitRegion(["F32"], "constructEffect.ray", { id: `${design.id}.ray${i}`, d: polyPath(wedge), clip, fill: C.ray, opacity: 0.7, layer: design.layer, owner: design.owner }, ["rays", "spread", "length", "occluders"])); }
  } else if (design.class === "global_exposure") {
    need("F32 exposure", design, { viewport: "arr", rampIn: "num+", rampOut: "num+", reactionState: "str" });
    const [x, y, w, h] = design.viewport;
    els.push(emitRegion(["F32"], "constructEffect.exposure", { id: `${design.id}.exposure`, d: polyPath([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), fill: C.exposure, layer: design.layer, owner: design.owner }, ["viewport"]));
  } else { need("F32 perception", design, { opticalLayer: "str" }); }
  const opacityAt = (t) => { const { start, end } = design.window, ri = design.rampIn ?? 0.001, ro = design.rampOut ?? 0.001; return t < start || t > end ? 0 : Math.min(1, (t - start) / ri, (end - t) / ro); };
  return { method: ["F32"], elements: els, data: { class: design.class, window: design.window, reason: design.reason, reactionState: design.reactionState ?? null }, opacityAt };
}

/** F23 perception pass over a MASTER: geometry kept, paint transformed by a role map / monochrome with accent exceptions */
function perceptionPass__impl(master, design) {
  need("F23 pass", design, { id: "str", kind: ["monochrome", "role_remap"], effect_owner: "str", range: "obj", exceptions: "arr" });
  if (!master?.elements) throw new Error("F23: needs a composed clean master");
  const remap = (e) => {
    if (design.exceptions.some((x) => new RegExp(x).test(e.id)) || !e.fill) return e.fill;
    if (design.kind === "monochrome") { const y = Math.round(Math.pow(relLum(e.fill), 1 / 2.2) * 255); return rgbToHex([y, y, y].map((v) => v / 255)); }
    const m = design.map[e.fill]; if (!m) throw new Error(`F23 role_remap: no mapping for ${e.fill} on ${e.id} (stable-mask role map required)`); return m;
  };
  const els = master.elements.map((e) => emitRegion([...e.prov.method, "F23"], "perceptionPass", { ...e, id: e.id, fill: remap(e) }, ["kind", "exceptions"], { from: e }));
  const registered = els.every((e, i) => e.d === master.elements[i].d);
  return { method: ["F23"], elements: els, data: { kind: design.kind, effect_owner: design.effect_owner, range: design.range, registered } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructEffect = registerProducer("effects.constructEffect", constructEffect__impl);
export const perceptionPass = registerProducer("effects.perceptionPass", perceptionPass__impl);
