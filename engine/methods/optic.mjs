// F21 + F48 + F44 + F13 + F63 — optical containers, worlds within worlds, luminous volumes and structural light.
// F21 fixed stack: exterior → container shadow → inner viewport M_in with a COMPLETE inner scene → rim (back part below inner, near part
// above) → bounded tint inside M_in → specular aligned to one surface normal, clipped to shell → occluders/contacts. Pass: rim+spec off
// → intact inner; inner off → shell with thickness; crossing limb occluded by near rim. F48: interior has its own sky/substrate/near-mid-far.
// F44: volume = projected faces with separate fills + edge graph; interior between far and near face; tubes enter at socket rings; four
// illumination layers (base, edge core, bounded halo, receiving). F13: structure before light (galaxy core+broken arms; ribbon front/underside).
// F63: every optical effect names emitter, region, mask, occluder, falloff, reason.
// Producing operation: inner elements re-minted with M_in clip; rim split by the view-tilt line into back/near arcs with thickness;
// specular band = M_in ∩ shifted M_in along the declared normal; volume faces from the F60 basis.
import { need, add, sub, mul, nrm, perp, ellipsePts, polyPath, ribbon, lerp2, shiftPath, rot } from "./core.mjs";
import { emitRegion, isMinted, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

/** composeOptic(design): ellipse/shaped aperture container around a complete inner drawing */
function composeOptic__impl(design) {
  need("F21 optic", design, { id: "str", aperture: "obj", rimThickness: "num+", tilt: "num", tint: "num", specular: "obj", layer: "num", reason: "str" });
  need("F21 aperture", design.aperture, { center: "vec2", rx: "num+", ry: "num+", rot: "num" });
  need("F63 specular", design.specular, { normal: "vec2", width: "num+", strength: "num" });
  const C = assertSolved(design.colors, `F21 ${design.id}`), A = design.aperture, L = design.layer;
  if (!design.inner?.elements || design.inner.elements.length < 3) throw new Error(`F21/F48 ${design.id}: the aperture must contain a COMPLETE inner scene (≥3 produced elements: far/substrate/subject), not one floating icon`);
  const Min = polyPath(ellipsePts(A.center, A.rx, A.ry, 48, A.rot));
  const outer = polyPath(ellipsePts(A.center, A.rx + design.rimThickness, A.ry + design.rimThickness, 48, A.rot));
  const els = [];
  // back rim (full ring below inner content)
  els.push(emitRegion(["F21", "F48"], "composeOptic.rim_back", { id: `${design.id}.rimBack`, d: `${outer} ${Min}`, fill: C.rimDark, layer: L, owner: design.id }, ["rimThickness", "aperture"]));
  // inner scene re-minted under M_in (projected into the aperture; inner coordinate frame preserved)
  design.inner.elements.forEach((e) => els.push(emitRegion([...e.prov.method, "F21", "F48"], "composeOptic.inner", { ...e, id: `${design.id}.in.${e.id}`, clip: Min, layer: L + 0.1 + e.layer * 1e-3 }, ["inner"], { from: e })));
  if (design.tint > 0) els.push(emitRegion(["F21", "F63"], "composeOptic.tint", { id: `${design.id}.tint`, d: Min, fill: C.glass, opacity: design.tint, layer: L + 0.2, owner: design.id }, ["tint"]));
  // near rim: the half of the rim ring facing the viewer (split by the tilt line through the centre), drawn ABOVE inner content
  const half = polyPath([...ellipsePts(A.center, A.rx + design.rimThickness, A.ry + design.rimThickness, 24, A.rot + design.tilt, 0, 180), ...ellipsePts(A.center, A.rx, A.ry, 24, A.rot + design.tilt, 180, 0)]);
  els.push(emitRegion(["F21", "F44"], "composeOptic.rim_near", { id: `${design.id}.rimNear`, d: half, clip: `${outer} ${Min}`, fill: C.rimLight, layer: L + 0.3, owner: design.id }, ["tilt", "rimThickness"]));
  // specular band aligned to the shared surface normal, clipped to the shell
  const n = nrm(design.specular.normal);
  els.push(emitRegion(["F21", "F63"], "composeOptic.specular", { id: `${design.id}.spec`, d: `${Min} ${shiftPath(Min, mul(n, -design.specular.width))}`, clip: Min, fill: C.specular, opacity: design.specular.strength, layer: L + 0.4, owner: design.id }, ["specular.normal", "specular.width"]));
  return { method: ["F21", "F48", "F63"], elements: els, data: { Min, stack: ["rimBack", "inner", "tint", "rimNear", "spec"], reason: design.reason } };
}

/** F44 luminous volume: projected faces + edge core + bounded halo + tube sockets */
function constructVolume__impl(proj, design) {
  need("F44 volume", design, { id: "str", footprint: "vecs", height: "num+", faceOpacity: "num", edgeWidth: "num+", haloWidth: "num", layer: "num" });
  const C = assertSolved(design.colors, `F44 ${design.id}`), fp = design.footprint, H = design.height, els = [];
  const bot = fp.map((p) => proj.P(p[0], p[1], 0)), top = fp.map((p) => proj.P(p[0], p[1], H));
  fp.forEach((_, i) => { const j = (i + 1) % fp.length; els.push(emitRegion(["F44"], "constructVolume.face", { id: `${design.id}.face${i}`, d: polyPath([bot[i], bot[j], top[j], top[i]]), fill: C.face, opacity: design.faceOpacity, layer: design.layer + (i % 2) * 0.001, owner: design.id }, ["footprint", "height", "faceOpacity"])); });
  els.push(emitRegion(["F44"], "constructVolume.top", { id: `${design.id}.top`, d: polyPath(top), fill: C.face, opacity: design.faceOpacity, layer: design.layer + 0.01, owner: design.id }, ["height"]));
  const edges = []; fp.forEach((_, i) => { const j = (i + 1) % fp.length; edges.push([top[i], top[j]], [bot[i], top[i]]); });
  edges.forEach(([a, b], k) => {
    if (design.haloWidth > 0) els.push(emitRegion(["F44", "F63"], "constructVolume.halo", { id: `${design.id}.halo${k}`, d: polyPath(ribbon([a, b], () => design.haloWidth)), fill: C.halo, opacity: 0.3, layer: design.layer + 0.02, owner: design.id }, ["haloWidth"]));
    els.push(emitRegion(["F44", "F46"], "constructVolume.edge_core", { id: `${design.id}.edge${k}`, d: polyPath(ribbon([a, b], () => design.edgeWidth)), fill: C.core, layer: design.layer + 0.03, owner: design.id }, ["edgeWidth"]));
  });
  return { method: ["F44", "F46", "F63"], elements: els, data: { faces: fp.length + 1, edges: edges.length } };
}

/** F13 structural ribbon: variable-width front surface; underside shown where the centreline twists (width sign flips) */
function constructRibbon__impl(design) {
  need("F13 ribbon", design, { id: "str", centre: "vecs", width: "arr", layer: "num" });
  if (design.width.length !== design.centre.length) throw new Error("F13: one signed width per centreline sample (sign = which face is visible)");
  const C = assertSolved(design.colors, `F13 ${design.id}`), els = []; let seg = [0];
  for (let i = 1; i < design.centre.length; i++) if (Math.sign(design.width[i]) !== Math.sign(design.width[i - 1]) || i === design.centre.length - 1) { seg.push(i); }
  for (let s = 0; s + 1 < seg.length; s++) { const a = seg[s], b = seg[s + 1], pts = design.centre.slice(a, b + 1), ws = design.width.slice(a, b + 1).map(Math.abs);
    const front = design.width[Math.min(b, a + 1)] > 0;
    els.push(emitRegion(["F13"], "constructRibbon.panel", { id: `${design.id}.panel${s}`, d: polyPath(ribbon(pts, (t) => ws[Math.round(t * (ws.length - 1))] + 0.5)), fill: front ? C.front : C.under, layer: design.layer + (front ? 0.01 : 0) + s * 1e-4, owner: design.id }, ["centre", "width"])); }
  return { method: ["F13"], elements: els, data: { panels: els.length, twists: seg.length - 2 } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const composeOptic = registerProducer("optic.composeOptic", composeOptic__impl);
export const constructVolume = registerProducer("optic.constructVolume", constructVolume__impl);
export const constructRibbon = registerProducer("optic.constructRibbon", constructRibbon__impl);
