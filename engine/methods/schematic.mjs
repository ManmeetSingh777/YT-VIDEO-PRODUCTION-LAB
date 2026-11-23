// F27 + F74 (schematic/abstract information graphs) + F26 (maps: three distinct masks) + F73 (cosmic/scale meaning) + F75 (typography parts).
// F27: machine-readable graph FIRST (typed vertices, typed edges tied to vertices, axes with units, reveal order); layout by relation
// (layers for sequence, tree for branching, coordinates for measurement, rings for cycles); every line ends on node/border/axis; lines under
// node fills; colour only for category/state. F74: semantic legend (node=actor, edge=causal flow, region=state, glyph=measurement,
// glow=active subset, position=order). F26: (1) geography mask, (2) data-membership mask, (3) flow graph; labels bind to geographic nodes;
// spread = mask expansion from a named origin. F73: PHYSICAL_SPACE | LOG_SCALE_MAP | TIMELINE | DISTANCE_COMPARISON | RELATIONAL_STAGE;
// declared scale encoding; false linear geometry marked diagrammatic. F75: text only for identification/quantity/state/emphasis, parent node,
// bbox, contrast, entry/exit; pill fits the text and attaches to its target.
import { need, add, sub, mul, nrm, len, polyPath, ribbon, ellipsePts, pointInPoly } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const LAYOUTS = ["layers", "tree", "ring", "coordinates"];

/** layoutGraph: positions computed from the RELATION type (never free placement) */
export function layoutGraph(g) {
  need("F27 graph", g, { nodes: "arr", edges: "arr", layout: LAYOUTS, box: "arr" });
  const N = Object.fromEntries(g.nodes.map((n) => [need(`F27 node`, n, { id: "str", category: "str" }).id, n]));
  for (const e of g.edges) { need("F27 edge", e, { from: "str", to: "str", type: ["directed", "undirected"] }); if (!N[e.from] || !N[e.to]) throw new Error(`F27: edge ${e.from}→${e.to} must terminate on defined vertices`); }
  const [x, y, w, h] = g.box, pos = {};
  if (g.layout === "layers" || g.layout === "tree") {
    const rank = {}; const indeg = Object.fromEntries(g.nodes.map((n) => [n.id, 0])); g.edges.forEach((e) => indeg[e.to]++);
    const q = g.nodes.filter((n) => !indeg[n.id]).map((n) => n.id); q.forEach((id) => (rank[id] = 0));
    while (q.length) { const n = q.shift(); for (const e of g.edges.filter((e) => e.from === n)) { rank[e.to] = Math.max(rank[e.to] ?? 0, rank[n] + 1); if (--indeg[e.to] === 0) q.push(e.to); } }
    if (Object.keys(rank).length !== g.nodes.length) throw new Error("F27: layered/tree layout requires an acyclic relation (use ring for cycles)");
    const R = Math.max(...Object.values(rank)), byR = {}; for (const n of g.nodes) (byR[rank[n.id]] ||= []).push(n.id);
    for (const [r, ids] of Object.entries(byR)) ids.forEach((id, i) => (pos[id] = [x + (w * (+r + 0.5)) / (R + 1), y + (h * (i + 0.5)) / ids.length]));
  } else if (g.layout === "ring") g.nodes.forEach((n, i) => { const a = (i / g.nodes.length) * Math.PI * 2 - Math.PI / 2; pos[n.id] = [x + w / 2 + (w / 2.4) * Math.cos(a), y + h / 2 + (h / 2.4) * Math.sin(a)]; });
  else { need("F27 axes", g, { axes: "obj" }); need("F27 axes", g.axes, { xUnit: "str", yUnit: "str", xRange: "arr", yRange: "arr" }); g.nodes.forEach((n) => { if (!Array.isArray(n.value)) throw new Error(`F27: coordinate layout needs a measured value for ${n.id}`); pos[n.id] = [x + ((n.value[0] - g.axes.xRange[0]) / (g.axes.xRange[1] - g.axes.xRange[0])) * w, y + h - ((n.value[1] - g.axes.yRange[0]) / (g.axes.yRange[1] - g.axes.yRange[0])) * h]; }); }
  return { pos, N };
}

/** drawGraph: edges end on node boundaries and sit UNDER node fills; colours by category/state only; reveal state subset */
function drawGraph__impl(g, design) {
  need("F74 draw", design, { id: "str", nodeShapes: "obj", nodeSize: "num+", edgeWidth: "num+", revealed: "arr", active: "arr", layer: "num" });
  const C = assertSolved(design.colors, "F27"), { pos, N } = layoutGraph(g), els = [], shown = new Set(design.revealed);
  for (const e of g.edges) { if (!shown.has(e.from) || !shown.has(e.to)) continue;
    const a = pos[e.from], b = pos[e.to], u = nrm(sub(b, a)), A = add(a, mul(u, design.nodeSize * 0.9)), B = sub(b, mul(u, design.nodeSize * 0.9));
    const on = design.active.includes(`${e.from}->${e.to}`);
    els.push(emitRegion(["F27", "F74"], "drawGraph.edge", { id: `${design.id}.e.${e.from}_${e.to}`, d: polyPath(ribbon([A, B], () => design.edgeWidth)), fill: on ? C.active : C.edge, layer: design.layer, owner: design.id }, ["edges", "layout", "active"]));
    if (e.type === "directed") { const n = [-u[1], u[0]], s = design.edgeWidth * 3; els.push(emitRegion(["F27"], "drawGraph.arrowhead", { id: `${design.id}.ah.${e.from}_${e.to}`, d: polyPath([B, add(sub(B, mul(u, s * 1.4)), mul(n, s)), sub(sub(B, mul(u, s * 1.4)), mul(n, s))]), fill: on ? C.active : C.edge, layer: design.layer + 0.001, owner: design.id }, ["edges"])); } }
  for (const n of g.nodes) { if (!shown.has(n.id)) continue; const shp = design.nodeShapes[n.category]; if (!shp) throw new Error(`F74: no node construction for category ${n.category} (category → shape, not decoration)`);
    els.push(emitRegion(["F27", "F74"], "drawGraph.node", { id: `${design.id}.n.${n.id}`, d: constructSilhouette({ ...shp, landmarks: shp.landmarks.map((l) => ({ ...l, p: add(pos[n.id], mul(l.p, design.nodeSize)) })) }).d, fill: C[`cat_${n.category}`], layer: design.layer + 0.01, owner: n.id }, ["nodes", "nodeShapes", "revealed"])); }
  return { method: ["F27", "F74"], elements: els, data: { pos } };
}

/** F26 map: geography mask, data mask (expansion from a named origin, clipped to land), flow graph between named nodes */
function constructMap__impl(design) {
  need("F26 map", design, { id: "str", coast: "obj", origin: "str", nodes: "obj", spreadRadius: "num", flows: "arr", layer: "num" });
  const C = assertSolved(design.colors, "F26"), land = constructSilhouette(design.coast).d, O = design.nodes[design.origin];
  if (!O) throw new Error("F26: spread origin must be a named geographic node");
  const els = [emitRegion(["F26"], "constructMap.geography", { id: `${design.id}.land`, d: land, fill: C.land, layer: design.layer, owner: design.id }, ["coast"])];
  if (design.spreadRadius > 0) els.push(emitRegion(["F26"], "constructMap.data_mask", { id: `${design.id}.data`, d: polyPath(ellipsePts(O, design.spreadRadius, design.spreadRadius * 0.8, 40)), clip: land, fill: C.data, opacity: 0.75, layer: design.layer + 0.01, owner: design.id }, ["spreadRadius", "origin"]));
  for (const f of design.flows) { const a = design.nodes[f.from], b = design.nodes[f.to]; if (!a || !b) throw new Error(`F26: flow ${f.from}→${f.to} must bind to named nodes`);
    const mid = add(mul(add(a, b), 0.5), mul([-(b[1] - a[1]), b[0] - a[0]], 0.15));
    els.push(emitRegion(["F26"], "constructMap.flow", { id: `${design.id}.flow.${f.from}_${f.to}`, d: polyPath(ribbon([a, mid, b], (t) => 4 * (1 - 0.5 * t))), fill: C.flow, layer: design.layer + 0.02, owner: design.id }, ["flows"])); }
  return { method: ["F26"], elements: els, data: { masks: ["geography", "data", "flow"] } };
}

/** F73 scale encoding: object sizes computed from values under a DECLARED mapping; non-physical encodings flagged diagrammatic */
function scaleEncode__impl(design) {
  need("F73 scale", design, { mode: ["PHYSICAL_SPACE", "LOG_SCALE_MAP", "TIMELINE", "DISTANCE_COMPARISON", "RELATIONAL_STAGE"], encoding: ["linear", "log10", "sqrt_area"], items: "arr", pxPerUnit: "num+" });
  const f = { linear: (v) => v, log10: (v) => Math.log10(v), sqrt_area: (v) => Math.sqrt(v) }[design.encoding];
  const sizes = design.items.map((it) => { need("F73 item", it, { id: "str", value: "num+" }); return { id: it.id, px: +(f(it.value) * design.pxPerUnit).toFixed(2) }; });
  const diagrammatic = design.mode !== "PHYSICAL_SPACE" || design.encoding !== "linear";
  return { method: "F73", data: { sizes, diagrammatic, encodingLabelRequired: diagrammatic } };
}

/** F75 label pill: content + role + parent node; pill sized from glyph metrics; leader attaches to the target */
function constructLabel__impl(design) {
  need("F75 label", design, { id: "str", text: "str", role: ["identification", "quantity", "state", "emphasis"], anchor: "vec2", fontPx: "num+", offset: "vec2", enter: "num", exit: "num" });
  if (design.exit <= design.enter) throw new Error("F75: label needs an entry and an exit time");
  const C = assertSolved(design.colors, "F75"), w = design.text.length * design.fontPx * 0.56 + design.fontPx, h = design.fontPx * 1.5, c = add(design.anchor, design.offset);
  const pill = constructSilhouette({ view: "front", identity: ["l"], landmarks: [["l", c[0] - w / 2, c[1]], ["t", c[0], c[1] - h / 2], ["r", c[0] + w / 2, c[1]], ["b", c[0], c[1] + h / 2]].map(([id, x, y]) => ({ id, p: [x, y], joint: "smooth" })), spans: ["l", "t", "r", "b"].map((id, i, a) => ({ from: id, to: a[(i + 1) % 4], character: id === "l" || id === "r" ? "convex" : "straight", amount: id === "l" || id === "r" ? 0 : 0 })) });
  return { method: ["F75"], elements: [emitRegion(["F75"], "constructLabel.leader", { id: `${design.id}.leader`, d: polyPath(ribbon([design.anchor, c], () => 2)), fill: C.labelBg, layer: 50, owner: design.id }, ["anchor", "offset"]), emitRegion(["F75"], "constructLabel.pill", { id: `${design.id}.pill`, d: pill.d, fill: C.labelBg, layer: 50.1, owner: design.id }, ["text", "fontPx"])], data: { text: design.text, bbox: [c[0] - w / 2, c[1] - h / 2, w, h], role: design.role, enter: design.enter, exit: design.exit } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const drawGraph = registerProducer("schematic.drawGraph", drawGraph__impl);
export const constructMap = registerProducer("schematic.constructMap", constructMap__impl);
export const scaleEncode = registerProducer("schematic.scaleEncode", scaleEncode__impl);
export const constructLabel = registerProducer("schematic.constructLabel", constructLabel__impl);
