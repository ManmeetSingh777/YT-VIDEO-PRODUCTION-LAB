// F02 + F04 + F46 + F62 (+ F68 surface_transition_policy) — material-owned surface construction.
// F02: every material = base_body + attached_color_forms; each form names its parent and ONE cause: view_plane | volume_turn |
//      recess | glass | marking. Contours are fill boundaries; lines exist only with a named function.
// Convention: light.dir points FROM the subject TOWARD the light source (shade = side away from it).
// F04: lighting system decides the operation: opaque_form = hard masked planes (no blur); optical/emissive/atmospheric are routed
//      to their own producers (optic.mjs / effects.mjs) — this module refuses them instead of faking them.
// F46: per-material table (main mask, principal fill, local planes, edge owner, internal marks, emitter, halo, receiving mask) with the
//      digital / organic / hard-material exceptions. F62: edge roles COLOR_ADJACENCY | MATERIAL_SEAM | CAST_SHADOW | INTERNAL_CREASE |
//      OPTICAL_RIM | EMISSIVE_EDGE; cast shadow lands on a NAMED receiver, projected from the actual occluder.
import { need, nrm, mul, add, sub, len, perp, lerp2, pathPoly, polyPath, between, at, shiftPath, smoothOpen, bbox } from "./core.mjs";
import { emitRegion, isMinted, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { constructSilhouette } from "./contour.mjs";
import * as R from "../authoring/raster.mjs";

// F46 material table — which plane causes / edge roles / optics each material family may own (source exceptions encoded)
export const MATERIALS = {
  skin: { causes: ["volume_turn", "view_plane", "marking"], edges: ["COLOR_ADJACENCY", "INTERNAL_CREASE", "CAST_SHADOW"], turnScale: 0.10, note: "bounded face/ear/cheek planes attached to the face" },
  hair: { causes: ["view_plane", "volume_turn"], edges: ["COLOR_ADJACENCY", "INTERNAL_CREASE"], turnScale: 0.14, note: "contiguous lobes; no strand texture" },
  cloth: { causes: ["volume_turn", "view_plane", "recess", "marking"], edges: ["COLOR_ADJACENCY", "MATERIAL_SEAM", "INTERNAL_CREASE", "CAST_SHADOW"], turnScale: 0.16, note: "fold/underside planes determined by garment structure" },
  metal: { causes: ["view_plane", "recess", "volume_turn", "marking"], edges: ["COLOR_ADJACENCY", "MATERIAL_SEAM", "CAST_SHADOW"], turnScale: 0.06, note: "projected faces, sparse hard highlights" },
  plastic: { causes: ["view_plane", "recess", "volume_turn", "marking"], edges: ["COLOR_ADJACENCY", "MATERIAL_SEAM", "CAST_SHADOW"], turnScale: 0.08, note: "housing faces + insets" },
  wall: { causes: ["view_plane", "recess", "marking"], edges: ["COLOR_ADJACENCY", "CAST_SHADOW"], turnScale: 0, note: "hard-material exception: one large planar fill, gradient forbidden" },
  rock: { causes: ["view_plane", "volume_turn", "marking"], edges: ["COLOR_ADJACENCY", "INTERNAL_CREASE", "CAST_SHADOW"], turnScale: 0.12, note: "strata / plane cuts sharing normals" },
  wood: { causes: ["view_plane", "volume_turn", "marking"], edges: ["COLOR_ADJACENCY", "INTERNAL_CREASE", "MATERIAL_SEAM"], turnScale: 0.1, note: "bark marks attached to trunk" },
  foliage: { causes: ["view_plane", "volume_turn"], edges: ["COLOR_ADJACENCY"], turnScale: 0.2, note: "organic exception: solid overlapping lobes with few interior wedges; no glow" },
  biology: { causes: ["volume_turn", "view_plane", "marking", "recess"], edges: ["COLOR_ADJACENCY", "INTERNAL_CREASE"], turnScale: 0.14, note: "membrane → inset colour planes" },
  water: { causes: ["view_plane", "volume_turn"], edges: ["COLOR_ADJACENCY"], turnScale: 0.1, note: "depth-region bodies" },
  glass: { causes: ["glass"], edges: ["OPTICAL_RIM"], turnScale: 0, note: "routed to optic.mjs (F21/F44/F63)" },
  screen: { causes: ["glass", "recess"], edges: ["OPTICAL_RIM", "MATERIAL_SEAM"], turnScale: 0, note: "recess + masked content" },
  energy: { causes: [], edges: ["EMISSIVE_EDGE"], turnScale: 0, note: "routed to effects.mjs surface_emission" },
};
export const LIGHT_SYSTEMS = ["opaque_form", "optical", "emissive", "atmospheric"];
export const TRANSITION_POLICY = ["HARD_BOUNDARY", "LOCAL_SOFT_OPTIC", "SUPPORT_FIELD_GRADIENT"];

const parentD = (p, where) => { if (!isMinted(p)) throw new Error(`${where}: parent must be a minted element produced by a construction method`); return p.d; };

/** constructSurface(design) →{elements, data}
 *  design: { owner, parent: <minted element>, material, colors: <solved material planes>, light:{dir:[x,y], system},
 *            transition_policy, forms:[...], layer } */
function constructSurface__impl(design) {
  need("F02 surface", design, { owner: "str", material: Object.keys(MATERIALS), light: "obj", transition_policy: TRANSITION_POLICY, forms: "arr" });
  need("F04 light", design.light, { dir: "vec2", system: LIGHT_SYSTEMS });
  const where = `F02 surface ${design.owner}`, M = MATERIALS[design.material], dP = parentD(design.parent, where), C = assertSolved(design.colors, where);
  if (design.light.system !== "opaque_form") throw new Error(`${where}: F04 lighting system "${design.light.system}" is not an opaque-form plane operation — construct it with ${design.light.system === "optical" ? "optic.composeOptic" : "effects.constructEffect"}`);
  if (design.material === "wall" && design.transition_policy !== "HARD_BOUNDARY") throw new Error(`${where}: F46 hard-material exception — a wall face is a single planar fill; gradient policy ${design.transition_policy} refused`);
  const L = nrm(design.light.dir), layer = design.parent.layer ?? 0, els = [], data = { owner: design.owner, forms: [] };
  const poly = pathPoly(dP, 16), [x0, y0, x1, y1] = bbox(poly), size = Math.max(x1 - x0, y1 - y0);
  els.push(emitRegion(["F02", "F46"], "constructSurface.base_body", { id: `${design.owner}.base`, d: dP, fill: C.base, layer: layer + 0.01, owner: design.owner }, ["material", "colors.base"]));
  design.forms.forEach((f, i) => {
    need(`${where} form ${i}`, f, { id: "str", cause: ["view_plane", "volume_turn", "recess", "glass", "marking"] });
    if (!M.causes.includes(f.cause)) throw new Error(`${where}: F46 material "${design.material}" cannot own a "${f.cause}" form (${M.note})`);
    const id = `${design.owner}.${f.id}`, lay = layer + 0.02 + i * 0.001;
    if (f.cause === "volume_turn") {
      // F04 opaque form: the turned-away band is the parent minus the parent displaced toward the light by the turn depth
      need(`${where} ${f.id}`, f, { side: ["shade", "light"], depth: "num+" });
      const depth = f.depth * size * (M.turnScale || 0.1) / 0.1 / 10; // depth is authored in tenths of subject size, scaled by material turn character
      const v = mul(L, f.side === "shade" ? depth : -depth);
      els.push(emitRegion(["F02", "F04"], "constructSurface.volume_turn", { id, d: `${dP} ${shiftPath(dP, v)}`, clip: dP, fill: f.side === "shade" ? C.shade : C.light, layer: lay, owner: design.owner }, ["light.dir", "forms.depth", "forms.side"]));
      data.forms.push({ id, cause: f.cause, side: f.side, displacement: v });
    } else if (f.cause === "view_plane") {
      // a facing plane bounded by the parent contour between two arclength stations and a designed cut curve
      need(`${where} ${f.id}`, f, { s0: "num", s1: "num", bulge: "num", tone: ["light", "shade", "deep"] });
      const run = between(poly, f.s0, f.s1, 28), A = run[0], B = run[run.length - 1], mid = lerp2(B, A, 0.5), n = perp(nrm(sub(A, B)));
      const ctl = add(mid, mul(n, f.bulge * len(sub(A, B))));
      const cut = Array.from({ length: 13 }, (_, k) => { const t = k / 12; return lerp2(lerp2(B, ctl, t), lerp2(ctl, A, t), t); });
      const d = polyPath([...run, ...cut.slice(1, -1)]);
      els.push(emitRegion(["F02", "F46"], "constructSurface.view_plane", { id, d, clip: dP, fill: C[f.tone], layer: lay, owner: design.owner }, ["forms.s0", "forms.s1", "forms.bulge", "forms.tone"]));
      data.forms.push({ id, cause: f.cause, A, B, ctl });
    } else if (f.cause === "recess") {
      // raised/recessed functional shape: own contour inside parent; inner wall shadow on the light-facing side of the cavity
      need(`${where} ${f.id}`, f, { shape: "obj", wall: "num+" });
      const sil = constructSilhouette(f.shape); checkInside(sil.d, dP, `${where} recess ${f.id}`);
      els.push(emitRegion(["F02", "F46"], "constructSurface.recess", { id, d: sil.d, clip: dP, fill: C.deep, layer: lay, owner: design.owner }, ["forms.shape"]));
      els.push(emitRegion(["F02", "F04"], "constructSurface.recess_wall", { id: `${id}.wall`, d: `${sil.d} ${shiftPath(sil.d, mul(L, -f.wall))}`, clip: sil.d, fill: C.shade, layer: lay + 0.0005, owner: design.owner }, ["forms.wall", "light.dir"]));
      data.forms.push({ id, cause: f.cause });
    } else if (f.cause === "marking") {
      need(`${where} ${f.id}`, f, { shape: "obj", tone: ["light", "shade", "deep", "base"], meaning: "str" });
      const sil = constructSilhouette(f.shape);
      els.push(emitRegion(["F02"], "constructSurface.marking", { id, d: sil.d, clip: dP, fill: C[f.tone], layer: lay, owner: design.owner }, ["forms.shape", "forms.meaning"]));
      data.forms.push({ id, cause: f.cause, meaning: f.meaning });
    } else if (f.cause === "glass") throw new Error(`${where}: glass forms are constructed by optic.composeOptic (F21/F63), not as an opaque patch`);
  });
  return { method: ["F02", "F04", "F46"], elements: els, data };
}

function checkInside(d, parent, where) {
  const G = R.grid(-200, -200, 2400, 1500, 4), a = R.mask(G, d), b = R.mask(G, parent);
  const f = R.inside(a, b); if (f < 0.97) throw new Error(`${where}: shape is only ${(f * 100).toFixed(0)}% inside its parent surface (F02: forms share the parent mask)`);
}

/** F62 edge owners. COLOR_ADJACENCY emits nothing (boundary = adjoining fills). Lines exist only with a named function. */
function constructEdge__impl(design) {
  need("F62 edge", design, { owner: "str", role: ["COLOR_ADJACENCY", "MATERIAL_SEAM", "INTERNAL_CREASE", "CAST_SHADOW"], material: Object.keys(MATERIALS) });
  const where = `F62 edge ${design.owner}`;
  if (!MATERIALS[design.material].edges.includes(design.role)) throw new Error(`${where}: material ${design.material} does not own ${design.role} edges`);
  if (design.role === "COLOR_ADJACENCY") return { method: ["F62"], elements: [], data: { role: design.role, note: "boundary drawn by adjoining fills; no stroke" } };
  const C = assertSolved(design.colors, where);
  if (design.role === "MATERIAL_SEAM" || design.role === "INTERNAL_CREASE") {
    need(where, design, { s0: "num", s1: "num", width: "num+", function: "str", inset: "num" });
    const dP = parentD(design.parent, where), poly = pathPoly(dP, 16), run = between(poly, design.s0, design.s1, 24);
    // seam runs parallel to the contour, `inset` px inside (sign follows the inward normal at each station)
    const ctr = poly.reduce((a, p) => add(a, p), [0, 0]).map((v) => v / poly.length);
    const line = run.map((p) => add(p, mul(nrm(sub(ctr, p)), design.inset)));
    return { method: ["F62"], elements: [emitRegion(["F62"], `constructEdge.${design.role}`, { id: `${design.owner}.${design.role}.${design.function}`, d: smoothOpen(line), stroke: C.deep, strokeWidth: design.width, clip: dP, layer: (design.parent.layer ?? 0) + 0.05, owner: design.owner }, ["s0", "s1", "inset", "width"])], data: { role: design.role, function: design.function } };
  }
  // CAST_SHADOW: occluder outline projected along the light onto a named receiving plane (ground line + foreshortening), clipped to the receiver
  need(where, design, { light: "vec2", receiver: "obj" }); need(`${where} receiver`, design.receiver, { id: "str", groundY: "num", squash: "num+" });
  const dO = parentD(design.occluder, where), dR = parentD(design.receiver.element, where), Lv = mul(nrm(design.light), -1), gy = design.receiver.groundY;
  if (Lv[1] <= 0.05) throw new Error(`${where}: light must travel downward onto a ground receiver`);
  const proj = pathPoly(dO, 12).map(([x, y]) => { const h = Math.max(0, gy - y); return [x + h * (Lv[0] / Lv[1]), gy + h * design.receiver.squash * 0.25]; });
  return { method: ["F62", "F04"], elements: [emitRegion(["F62", "F04"], "constructEdge.CAST_SHADOW", { id: `${design.owner}.cast_on.${design.receiver.id}`, d: polyPath(proj), clip: dR, fill: C.shade, layer: (design.receiver.element.layer ?? 0) + 0.04, owner: design.receiver.id }, ["light", "receiver.groundY", "receiver.squash"])], data: { role: design.role, receiver: design.receiver.id } };
}

/** F02 falsifier: flat-colour view with strokes disabled must still carry the subject (fill area ≫ stroke area) and every
 *  secondary form must be clipped to its parent mask */
export function flatColorTest(elements) {
  const strokes = elements.filter((e) => e.stroke), fills = elements.filter((e) => !e.stroke);
  const orphan = fills.filter((e) => !/\.base$/.test(e.id) && !e.clip);
  return { method: "F02", fills: fills.length, strokes: strokes.length, orphanForms: orphan.map((e) => e.id), pass: fills.length > 0 && orphan.length === 0 };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructSurface = registerProducer("surface.constructSurface", constructSurface__impl);
export const constructEdge = registerProducer("surface.constructEdge", constructEdge__impl);
