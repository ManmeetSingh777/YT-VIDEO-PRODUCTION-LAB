// DIRECTION-PURPOSE methods (not drawing functions): F19 (renderer selection per shot), F20 (medium_tree per beat), F34 (generator
// router by physical construction family), F55 (projection + camera-sized artwork from the viewer inference), F57 (visible causal proof).
// These produce ROUTING / RESERVATION records that the construction producers consume (which producer, which projection, which bbox).
// Direction content itself (story, metaphor, events) is GPT-owned (Experience Director V1); these methods never invent it — they
// require it as input and refuse placeholders.
import { need, len, sub, pathPoly } from "./core.mjs";
import { isMinted, registerProducer } from "./emit.mjs";

export const MODES = ["WORLD", "MACRO", "SCHEMATIC", "MAP_OR_SCALE", "PORTAL_OR_SCREEN", "CINEMATIC_EFFECT", "EDITORIAL_OR_AD"];

/** F20: tokens of a narrated beat → medium_tree (nesting allowed; decorative switches rejected) */
function routeMedium__impl(beat) {
  need("F20 beat", beat, { id: "str", entities: "arr", measured_variables: "arr", claimed_causes: "arr", perspective: ["external", "inside_structure", "abstract", "through_device"], events: "arr", spatial_comparison: "bool", editorial_need: "bool" });
  const tree = [];
  if (beat.editorial_need) tree.push("EDITORIAL_OR_AD");
  else if (beat.spatial_comparison) tree.push("MAP_OR_SCALE");
  else if (beat.perspective === "inside_structure") tree.push("MACRO");
  else if (beat.perspective === "abstract" || (!beat.entities.length && beat.claimed_causes.length)) tree.push("SCHEMATIC");
  else tree.push("WORLD"); // contact/action causes the idea
  if (beat.perspective === "through_device") tree.push("PORTAL_OR_SCREEN", beat.measured_variables.length ? "SCHEMATIC" : "WORLD");
  if (beat.events.some((e) => /flash|exposure|blur|iris|perception/.test(e))) tree.push("CINEMATIC_EFFECT");
  return { method: "F20", data: { beat: beat.id, medium_tree: tree, nested: tree.length > 1, quantitative: beat.measured_variables.length > 0 } };
}

/** F19: renderer-selection record per visual demand (primary + optional secondary route, what output must retain) */
const F19 = {
  acting: { construct: "pose-state drawings, separated parts, contact graph", primary: "vector_layered", retain: "fill boundaries, registered subparts, face/hand states" },
  built_machinery: { construct: "connected structural surface graph + insets", primary: "vector_planar", retain: "common projection, material-local fills" },
  organic_optics: { construct: "attached structure, contained light masks", primary: "vector", secondary: "raster_hybrid_if_vector_insufficient", retain: "crisp owned structure below haze/glow" },
  infographic: { construct: "value-to-mark mapping, labels, grouping", primary: "code_native_diagram", retain: "data correctness, legibility" },
  rotating_volume: { construct: "complete view family, silhouettes", primary: "3d_assisted_or_2.5d", retain: "2D colour-region logic, no photoreal shader" },
  composite_transition: { construct: "complete outgoing/incoming plates, ordered reveal", primary: "2d_masks", secondary: "3d_camera_optional", retain: "plate registration, mask order, identity" },
};
function selectRenderer__impl(shot) { need("F19 shot", shot, { id: "str", demand: Object.keys(F19) }); return { method: "F19", data: { shot: shot.id, ...F19[shot.demand] } }; }

/** F34: physical construction family → producer module (router to F01/F08/F09/F11/F12/F13 implementations, never a texture prompt) */
const F34 = { forest_foliage: "plants.constructTree + plants.placeVegetation", rock_terrain: "contour.constructSilhouette + surface.constructSurface(view_plane strata)", architecture: "projection.constructBlock + constructOpenings", metal_glass_machine: "machine.constructMachine + optic.composeOptic", ocean_space: "repeat.generateRepeats(zone, depth falloff) + effects", biological_macro: "network.growNetwork/constructExchange + surface" };
function routeGenerator__impl(f) { need("F34 family", f, { family: Object.keys(F34) }); return { method: "F34", data: { family: f.family, producer: F34[f.family] } }; }

/** F57: visible causal proof — anchors must be points ON drawn contours (produced elements), bbox reserved before scenery */
function causalProof__impl(p) {
  need("F57 proof", p, { silent_inference: "str", before: "str", cause: "str", after: "str", proof_projection: ["face_contact", "object_process", "wide_distribution", "diagram_relation", "embedded_screen", "macro_internal", "world_scale"], primary_bbox: "arr", continuation_point: "vec2", what_can_be_removed: "arr" });
  for (const k of ["source", "target"]) { const a = p[`${k}_anchor`]; if (!a || !isMinted(a.element) || !Array.isArray(a.point)) throw new Error(`F57: ${k}_anchor must be a point on a produced contour (element + point), not a word`);
    const d = Math.min(...pathPoly(a.element.d, 16).map((q) => len(sub(q, a.point)))); if (d > (p.tolerance ?? 6)) throw new Error(`F57: ${k}_anchor is ${d.toFixed(1)}px off the ${a.element.id} contour`); }
  const [x, y, w, h] = p.primary_bbox; const inBox = (q) => q[0] >= x && q[0] <= x + w && q[1] >= y && q[1] <= y + h;
  if (!inBox(p.source_anchor.point) || !inBox(p.target_anchor.point)) throw new Error("F57: causal endpoints must lie inside the reserved primary bbox");
  return { method: "F57", data: { reserved_bbox: p.primary_bbox, anchors: [p.source_anchor.point, p.target_anchor.point], projection: p.proof_projection } };
}

/** F55: projection + crop chosen from the viewer inference; wide only when the complete network/scale IS the proof */
function chooseProjection__impl(c) {
  need("F55 choice", c, { viewer_inference: "str", relation: ["contact", "expression", "mechanism", "network_extent", "scale_comparison", "data_relation", "distribution"] });
  const t = { contact: ["close", "FRONTAL_INTERIOR"], expression: ["close", "FLAT_ORTHO"], mechanism: ["close", "MACRO_CUTAWAY"], network_extent: ["wide", "CIRCULAR_NETWORK"], scale_comparison: ["wide", "FLAT_ORTHO"], data_relation: ["medium", "FLAT_ORTHO"], distribution: ["wide", "AERIAL"] }[c.relation];
  return { method: "F55", data: { crop: t[0], view_family: t[1], why: `${c.relation} must be unmistakable for: ${c.viewer_inference}` } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const routeMedium = registerProducer("direction.routeMedium", routeMedium__impl);
export const selectRenderer = registerProducer("direction.selectRenderer", selectRenderer__impl);
export const routeGenerator = registerProducer("direction.routeGenerator", routeGenerator__impl);
export const causalProof = registerProducer("direction.causalProof", causalProof__impl);
export const chooseProjection = registerProducer("direction.chooseProjection", chooseProjection__impl);

// F57/F59 (generic): after the painter's order, every declared causal part must keep a minimum VISIBLE fraction of its own area and lie
// inside the frame; otherwise the proof is occluded/cropped and the composition is non-renderable. Measured on the actual drawing.
import * as RAS from "../authoring/raster.mjs";
export function assertCausalVisibility(drawing, parts, { frame = [0, 0, 1920, 1080], cell = 4, min = 0.45, strict = true } = {}) {
  const G = RAS.grid(frame[0], frame[1], frame[2], frame[3], cell), els = drawing.elements, report = [];
  for (const p of parts) {
    const idx = els.map((e, i) => (p.match.test(e.id) ? i : -1)).filter((i) => i >= 0); if (!idx.length) { report.push({ part: p.id, visible: 0, why: "no regions" }); continue; }
    const own = RAS.mask(G, idx.map((i) => els[i].d)), ownArea = RAS.area(own);
    const above = els.slice(Math.min(...idx) + 1).filter((e, k) => !idx.includes(Math.min(...idx) + 1 + k) && !e.stroke && (e.opacity ?? 1) > 0.6 && !p.match.test(e.id) && !(p.ignoreOccluders || []).some((r) => r.test(e.id)));
    const occ = above.length ? RAS.mask(G, above.map((e) => e.d)) : new Uint8Array(own.length);
    const vis = RAS.area(RAS.minus(own, occ)), polysN = idx.flatMap((i) => els[i].d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || []).map((s2) => s2.split(",").map(Number));
    const inFrame = polysN.filter(([x, y]) => x >= frame[0] && y >= frame[1] && x <= frame[2] && y <= frame[3]).length / Math.max(1, polysN.length);
    report.push({ part: p.id, visible: +(vis / Math.max(1, ownArea)).toFixed(3), inFrame: +inFrame.toFixed(3), pass: vis / Math.max(1, ownArea) >= (p.min ?? min) && inFrame >= 0.9 });
  }
  const bad = report.filter((r) => !r.pass);
  if (bad.length && strict) { const e = new Error(`F57 causal visibility: ${bad.map((b) => `${b.part} visible ${b.visible} inFrame ${b.inFrame}`).join("; ")} — re-stage the design (occluded or cropped proof)`); e.report = report; throw e; }
  return { method: "F57", report };
}
