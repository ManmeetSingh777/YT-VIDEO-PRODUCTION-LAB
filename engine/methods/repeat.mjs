// F54 + F76 — repeated shapes require a locally defined parent generator.
// F76 build: repeat_parent, local_axes_or_graph, seed_anchors, count_or_density_by_region, size_falloff, orientation_rule, exclusion_masks,
// identity_variation_bounded_by_role, active_subset; snap to wall plane / branch graph / vegetation zone / stage node; test with background
// disabled to expose illegal free-floating units. F54: derive the local frame; specify rotation with parent, count/size vs depth, exclusions;
// a quiet volume may need ZERO repeats.
// Producing operation: parent local frame (face axes, polyline tangent frame, zone polygon, ring) → seeded anchors → unit instances
// transformed into the frame (rotate-with-parent, depth falloff, bounded variation) → exclusion + containment test per instance.
import { need, add, sub, mul, nrm, rot, rng, len, pointInPoly, at as atLen } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const FRAMES = ["polyline", "zone", "ring", "graph_tips"];

function generateRepeats__impl(design) {
  need("F76 repeat", design, { id: "str", parentId: "str", frame: FRAMES, unit: "obj", count: "num", sizeFalloff: "num", orientation: ["with_parent", "upright", "radial"], variation: "num", seed: "num", exclusions: "arr", layer: "num", role: "str" });
  if (design.count === 0) return { method: ["F76", "F54"], elements: [], data: { count: 0, note: "zero repeats (quiet volume)" } };
  if (design.variation < 0 || design.variation > 0.5) throw new Error("F76: identity variation must stay bounded by role (0–0.5)");
  const C = assertSolved(design.colors, "F76"), r = rng(design.seed), els = [], anchors = [];
  const F = design.frameData;
  if (design.frame === "polyline") { need("F76 polyline", F, { line: "vecs", closed: "bool" }); for (let i = 0; i < design.count; i++) { const s = (i + 0.5) / design.count, a = atLen(F.line, s, F.closed); anchors.push({ p: a.p, ang: (Math.atan2(a.t[1], a.t[0]) * 180) / Math.PI, depth: s }); } }
  else if (design.frame === "zone") { need("F76 zone", F, { polygon: "vecs", depthAxis: "vec2" }); const xs = F.polygon.map((p) => p[0]), ys = F.polygon.map((p) => p[1]); for (let k = 0; anchors.length < design.count && k < design.count * 50; k++) { const p = [Math.min(...xs) + r() * (Math.max(...xs) - Math.min(...xs)), Math.min(...ys) + r() * (Math.max(...ys) - Math.min(...ys))]; if (pointInPoly(p, F.polygon)) anchors.push({ p, ang: 0, depth: (p[0] * F.depthAxis[0] + p[1] * F.depthAxis[1] - Math.min(...ys)) / (Math.max(...ys) - Math.min(...ys) + 1) }); } }
  else if (design.frame === "ring") { need("F76 ring", F, { center: "vec2", rx: "num+", ry: "num+" }); for (let i = 0; i < design.count; i++) { const a = (i / design.count) * Math.PI * 2; anchors.push({ p: [F.center[0] + F.rx * Math.cos(a), F.center[1] + F.ry * Math.sin(a)], ang: (a * 180) / Math.PI + 90, depth: (Math.sin(a) + 1) / 2 }); } }
  else if (design.frame === "graph_tips") { need("F76 graph", F, { tips: "vecs" }); F.tips.slice(0, design.count).forEach((p) => anchors.push({ p, ang: 0, depth: 0.5 })); }
  let excluded = 0;
  anchors.forEach((a, i) => {
    if (design.exclusions.some((ex) => pointInPoly(a.p, ex))) { excluded++; return; }
    const k = (1 - design.sizeFalloff * a.depth) * (1 + (r() - 0.5) * 2 * design.variation), ang = design.orientation === "upright" ? 0 : a.ang;
    const d = constructSilhouette({ ...design.unit, landmarks: design.unit.landmarks.map((l) => ({ ...l, p: add(a.p, rot(mul(l.p, k), ang)) })) }).d;
    els.push(emitRegion(["F76", "F54"], "generateRepeats.unit", { id: `${design.id}.u${i}`, d, clip: design.parentClip, fill: C[design.role], layer: design.layer, owner: design.parentId }, ["unit", "count", "sizeFalloff", "orientation", "variation", "exclusions"]));
  });
  return { method: ["F76", "F54"], elements: els, data: { count: els.length, excluded, parent: design.parentId } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const generateRepeats = registerProducer("repeat.generateRepeats", generateRepeats__impl);
