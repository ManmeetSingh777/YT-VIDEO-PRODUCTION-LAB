// F14 (state table) + F30 (multi-state character library) + F67 (registered state family) + F22 (registered relight) + F29 (parallel states).
// F14: per change class decide: owns new drawing? must remain registered? additional independent track? Never scale one stock object
// through a change whose internal art topology changes. F30: canonical identity record; view/action keys; each key REDRAWN by its producer.
// F67: register landmarks; interpolate between homologous shapes ONLY if topology and visible part inventory match; else drawn in-between,
// authored occlusion or honest cut. F22: world_layout_master with stable IDs; states change selected emitters locally (≥3 emitter classes);
// an all-layer HSV offset is refused. F29: one comparison coordinate system + a difference ledger; unrequested changes are leaks.
import { need, pathPoly, len, sub } from "./core.mjs";
import { emitRegion, compose, isMinted, registerProducer } from "./emit.mjs";
import { template } from "../lib/geom.mjs";
import { RULES } from "./knowledge.mjs";

export const CHANGE = {
  minor_rigid: { ownsNewDrawing: false, register: "whole-object internal features", track: "prop/camera" },
  expression_hand_contact: { ownsNewDrawing: true, register: "identity, attachment points", track: "face, limb, object" },
  view_pose: { ownsNewDrawing: true, register: "canonical identity, scale/contact", track: "body, hand, hair" },
  soft_swell: { ownsNewDrawing: true, register: "narrative object identity", track: "glow, embedded illustration" },
  material_light: { ownsNewDrawing: false, register: "world/structure geometry", track: "windows/lamps/atmosphere", recolorOnly: true },
  world_transition: { ownsNewDrawing: true, register: "intentional framing continuity only", track: "rays/mask/pan", twoCompleteWorlds: true },
};

/** buildStateFamily(design): { id, producer: (variantDesign)=>{elements, landmarks?}, canonical: design, states:[{id, change, patch:(design)=>design}],
 *                              anchors: [landmark ids that carry identity], tolerance } */
function buildStateFamily__impl(fam) {
  need("F30 state family", fam, { id: "str", states: "arr", anchors: "arr", tolerance: "num+" });
  if (typeof fam.producer !== "function") throw new Error("F30: a construction producer is required — states are redrawn by producers, never transformed cutouts");
  const canon = fam.producer(fam.canonical); const atlas = { canonical: canon }, rows = [];
  const lm = (r) => r.landmarks || {};
  for (const s of fam.states) {
    need(`F14 state ${s.id}`, s, { id: "str", change: Object.keys(CHANGE) });
    const rule = CHANGE[s.change]; if (typeof s.patch !== "function") throw new Error(`F14 state ${s.id}: patch(design) required`);
    const r = fam.producer(s.patch(JSON.parse(JSON.stringify(fam.canonical))));
    // F14: a class that owns a new drawing must actually differ in geometry from the canonical drawing
    const geomChanged = r.elements.some((e) => { const c = canon.elements.find((x) => x.id === e.id); return !c || c.d !== e.d; }) || r.elements.length !== canon.elements.length;
    if (rule.ownsNewDrawing && !geomChanged) throw new Error(`F14 ${fam.id}.${s.id}: change class ${s.change} requires a NEW drawing but the producer returned the canonical geometry`);
    if (rule.recolorOnly && geomChanged) throw new Error(`F14 ${fam.id}.${s.id}: material_light must keep geometry registered (recolour connected surfaces only)`);
    // F30/F67 registration: identity anchors stay within tolerance (rigid-relative: compare pairwise distances)
    const A0 = lm(canon), A1 = lm(r), drift = [];
    for (let i = 0; i < fam.anchors.length; i++) for (let j = i + 1; j < fam.anchors.length; j++) {
      const a = fam.anchors[i], b = fam.anchors[j]; if (!A0[a] || !A0[b] || !A1[a] || !A1[b]) throw new Error(`F67 ${fam.id}.${s.id}: identity anchor ${!A1[a] ? a : b} missing in a state`);
      drift.push(Math.abs(len(sub(A0[a], A0[b])) - len(sub(A1[a], A1[b]))));
    }
    const maxDrift = Math.max(0, ...drift);
    // F67 interpolation permission: same element ids and same path templates (homologous) → INTERPOLATE, else DRAWN_STATE (cut/in-between)
    const ids0 = canon.elements.map((e) => e.id).sort().join("|"), ids1 = r.elements.map((e) => e.id).sort().join("|");
    const homologous = ids0 === ids1 && r.elements.every((e) => { const c = canon.elements.find((x) => x.id === e.id); return c && template(c.d).tpl === template(e.d).tpl; });
    rows.push({ state: s.id, change: s.change, ownsNewDrawing: rule.ownsNewDrawing, register: rule.register, track: rule.track, identityDrift: +maxDrift.toFixed(2), registered: maxDrift <= fam.tolerance, transitionFromCanonical: homologous ? "INTERPOLATE" : "DRAWN_STATE_OR_CUT" });
    atlas[s.id] = r;
  }
  if (fam.viewStates) RULES.F30_view_redraw(atlas, fam.viewStates, `F30 ${fam.id}`);
  if (fam.poseStates) RULES.F06_static_pelvis(atlas, fam.poseStates, `F06 ${fam.id}`);
  return { method: ["F14", "F30", "F67"], atlas, data: { table: rows, pass: rows.every((r) => r.registered) } };
}

/** F22 registered relight: master drawing + per-state emitter operations keyed by STABLE element ids. No global grade. */
function relightWorld__impl(design) {
  need("F22 relight", design, { id: "str", state: "str", recolor: "obj", emitters: "arr" });
  if (!design.master || !design.master.elements) throw new Error("F22: world_layout_master (composed drawing) required");
  if (design.recolor["*"] || design.globalHueShift !== undefined) throw new Error("F22: an all-layer colour offset cannot illuminate selected windows, remove a sun or add cones — refused");
  const ids = new Set(design.master.elements.map((e) => e.id));
  for (const k of Object.keys(design.recolor)) if (!ids.has(k)) throw new Error(`F22: recolor targets unknown stable id ${k}`);
  const out = design.master.elements.map((e) => (design.recolor[e.id] ? emitRegion([...e.prov.method, "F22"], "relightWorld.recolor", { ...e, id: e.id, fill: design.recolor[e.id] }, [`recolor.${e.id}`], { from: e }) : e));
  for (const em of design.emitters) { if (!isMinted(em.element)) throw new Error("F22: emitters must be produced (effects/surface methods)"); need("F22 emitter", em, { class: "str" }); out.push(em.element); }
  const classes = new Set(design.emitters.map((e) => e.class).concat(Object.keys(design.recolor).map((k) => design.classOf?.[k]).filter(Boolean)));
  const geomSame = design.master.elements.every((e) => out.find((o) => o.id === e.id).d === e.d);
  if (!geomSame || classes.size < 3) throw new Error(`F22 ${design.id}: relight not registered (anchors ${geomSame ? "ok" : "moved"}, emitter classes ${classes.size} < 3) — non-renderable`);
  return { method: ["F22"], elements: out, data: { state: design.state, emitterClasses: [...classes], anchorsCoincide: geomSame, pass: true } };
}

/** F29 parallel states: actual element differences between two complete drawings vs the declared difference ledger */
function compareStates__impl({ a, b, ledger, sharedAnchors }) {
  need("F29 compare", { ledger, sharedAnchors }, { ledger: "arr", sharedAnchors: "arr" });
  const A = Object.fromEntries(a.elements.map((e) => [e.id, e])), B = Object.fromEntries(b.elements.map((e) => [e.id, e]));
  for (const s of sharedAnchors) if (!A[s] || !B[s] || A[s].d !== B[s].d) throw new Error(`F29: shared anchor ${s} not identical in both states (one comparison coordinate system required)`);
  const diff = [...new Set([...Object.keys(A), ...Object.keys(B)])].filter((k) => !A[k] || !B[k] || A[k].d !== B[k].d || A[k].fill !== B[k].fill);
  const declared = (k) => ledger.some((l) => new RegExp(l).test(k));
  const leaks = diff.filter((k) => !declared(k)), unrealised = ledger.filter((l) => !diff.some((k) => new RegExp(l).test(k)));
  return { method: "F29", changed: diff, leaks, unrealised, pass: !leaks.length && !unrealised.length && a.elements.length > 2 && b.elements.length > 2 };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const buildStateFamily = registerProducer("states.buildStateFamily", buildStateFamily__impl);
export const relightWorld = registerProducer("states.relightWorld", relightWorld__impl);
export const compareStates = registerProducer("states.compareStates", compareStates__impl);
