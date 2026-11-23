// F12 + F24 + F41 + F71 + F25 — designed dense biological networks / populations / exchange mechanisms.
// F12: biological parent connector + finite meaningful terminal morphologies; connected branch trees with forks and zoning; terminals
// stay attached; categories by cluster/band roles; activation = connected subset of the real graph + local halo. F24: population_unit
// as connected geometry; distribution by region masks + seeded points + density bands; unit roles (background_population, cluster_member,
// activated_member, foreground_exemplar) with different size/contrast; containment; activation on the active path only. F41: parent
// surface first, branch-parent graph + density map; colour from cluster membership. F71: rooted paths, branch nodes, terminal tips touching
// parent surfaces; active_path_display ∈ CONTINUOUS_BAND | DISCRETE_PACKETS | SWITCHED_TERMINAL_PATCHES (no fourth category).
// F25: causal topology graph E (emitter), R (receiver), G (gap), carriers P in G, attached mechanisms A on named parents, active flow Q.
// Producing operation: seeded constrained growth inside the parent mask → graph (nodes/edges/tips) → role/cluster colouring →
// activation = BFS over graph edges from a source node → active display geometry per the declared category.
import { need, add, sub, mul, nrm, rot, rng, len, polyPath, ribbon, pointInPoly, lerp2 } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const ACTIVE = ["CONTINUOUS_BAND", "DISCRETE_PACKETS", "SWITCHED_TERMINAL_PATCHES"];

/** growNetwork(design): { id, parent: polygon (tissue/region), roots:n, seed, step, maxDepth, branchProb, turn, clusters:[{id, polygon, terminal}], terminals: {morph: contour design in unit frame}[] } */
function growNetwork__impl(design) {
  need("F41 network", design, { id: "str", parent: "vecs", roots: "num", seed: "num", step: "num+", maxDepth: "num", branchProb: "num", turn: "num", clusters: "arr", terminalMorphs: "obj", stalkWidth: "num+", terminalSize: "num+" });
  const r = rng(design.seed), nodes = [], edges = [], tips = [], P = design.parent, xs = P.map((p) => p[0]), ys = P.map((p) => p[1]);
  if (!Object.keys(design.terminalMorphs).length) throw new Error("F12: a finite set of meaningful terminal morphologies is required");
  for (let i = 0, tries = 0; i < design.roots && tries < 500; tries++) {
    const p = [Math.min(...xs) + r() * (Math.max(...xs) - Math.min(...xs)), Math.max(...ys) - r() * 10]; if (!pointInPoly(p, P)) continue;
    const id = nodes.length; nodes.push({ id, p, depth: 0, root: id }); i++;
    const grow = (nid, dir, depth) => {
      if (depth >= design.maxDepth) { tips.push(nid); return; }
      const nd = rot(dir, (r() - 0.5) * 2 * design.turn), np = add(nodes[nid].p, mul(nd, design.step * (0.7 + 0.6 * r())));
      if (!pointInPoly(np, P)) { tips.push(nid); return; } // containment: growth never leaves the parent anatomy
      const k = nodes.length; nodes.push({ id: k, p: np, depth: depth + 1, root: nodes[nid].root }); edges.push([nid, k]);
      grow(k, nd, depth + 1); if (r() < design.branchProb) grow(k, rot(nd, (r() < 0.5 ? -1 : 1) * (25 + r() * 30)), depth + 1);
    };
    grow(id, [0, -1], 0);
  }
  // terminal morphology + role by cluster membership (not independent random colours)
  const term = tips.map((t) => { const cl = design.clusters.find((c) => pointInPoly(nodes[t].p, c.polygon)); return { node: t, cluster: cl?.id ?? "background_population", morph: cl?.terminal ?? Object.keys(design.terminalMorphs)[0] }; });
  return { method: ["F12", "F24", "F41", "F71"], graph: { nodes, edges, tips: term }, data: { nodes: nodes.length, edges: edges.length, tips: term.length, clusters: [...new Set(term.map((t) => t.cluster))] } };
}

/** activation: connected subset = BFS from a source node over the real edges, limited hops (F12.4 / F24 / F71) */
export function activate(graph, { source, hops }) {
  const adj = {}; for (const [a, b] of graph.edges) { (adj[a] ||= []).push(b); (adj[b] ||= []).push(a); }
  if (!graph.nodes[source]) throw new Error("F71: activation source must be an actual graph node");
  const seen = new Map([[source, 0]]), q = [source]; while (q.length) { const n = q.shift(); if (seen.get(n) >= hops) continue; for (const m of adj[n] || []) if (!seen.has(m)) { seen.set(m, seen.get(n) + 1); q.push(m); } }
  return { nodes: new Set(seen.keys()), edges: graph.edges.filter(([a, b]) => seen.has(a) && seen.has(b)) };
}

/** drawNetwork: stalks (background role, low contrast) + terminals (cluster colours) + active display in exactly one declared category */
function drawNetwork__impl(net, design) {
  need("F71 draw", design, { active_path_display: ACTIVE, source: "num", hops: "num", t: "num", layer: "num" });
  const C = assertSolved(design.colors, "F71 draw"), G = net.graph, els = [], act = activate(G, { source: design.source, hops: design.hops });
  G.edges.forEach(([a, b], i) => els.push(emitRegion(["F71", "F41"], "drawNetwork.stalk", { id: `${design.id}.e${i}`, d: polyPath(ribbon([G.nodes[a].p, G.nodes[b].p], () => design.stalkWidth)), fill: C.stalk, layer: design.layer, owner: design.id }, ["growth"])));
  G.tips.forEach((t, i) => { const m = design.terminalMorphs[t.morph], c = G.nodes[t.node].p, s = design.terminalSize;
    const d = constructSilhouette({ ...m, landmarks: m.landmarks.map((l) => ({ ...l, p: add(c, mul(l.p, s)) })) }).d;
    const on = design.active_path_display === "SWITCHED_TERMINAL_PATCHES" && act.nodes.has(t.node);
    els.push(emitRegion(["F12", "F71"], "drawNetwork.terminal", { id: `${design.id}.t${i}`, d, fill: on ? C.active : C[`cluster_${t.cluster}`] || C.terminal, layer: design.layer + 0.01, owner: design.id }, ["terminalMorphs", "clusters"])); });
  if (design.active_path_display === "CONTINUOUS_BAND") act.edges.forEach(([a, b], i) => els.push(emitRegion(["F71", "F12"], "drawNetwork.active_band", { id: `${design.id}.active${i}`, d: polyPath(ribbon([G.nodes[a].p, G.nodes[b].p], () => design.stalkWidth * 1.6)), fill: C.active, layer: design.layer + 0.02, owner: design.id }, ["source", "hops"])));
  if (design.active_path_display === "DISCRETE_PACKETS") act.edges.forEach(([a, b], i) => { const p = lerp2(G.nodes[a].p, G.nodes[b].p, ((design.t * 1.5 + i * 0.37) % 1)), s = design.stalkWidth * 1.4;
    els.push(emitRegion(["F71"], "drawNetwork.packet", { id: `${design.id}.pk${i}`, d: polyPath([[p[0], p[1] - s], [p[0] + s, p[1]], [p[0], p[1] + s], [p[0] - s, p[1]]]), fill: C.active, layer: design.layer + 0.03, owner: design.id }, ["t", "source"])); });
  return { method: ["F71", "F12", "F24"], elements: els, data: { activeNodes: act.nodes.size, activeEdges: act.edges.length, display: design.active_path_display } };
}

/** F25 exchange mechanism: E/R surfaces, gap G, carriers along E→R paths crossing G, mechanisms attached to R's surface, Q lit only when active */
function constructExchange__impl(design) {
  need("F25 exchange", design, { id: "str", E: "obj", R: "obj", carriers: "num", mechanisms: "num", active: "bool", seed: "num", carrierShape: "obj", mechanismShape: "obj", layer: "num" });
  const C = assertSolved(design.colors, "F25"), r = rng(design.seed), els = [];
  const Es = constructSilhouette(design.E), Rs = constructSilhouette(design.R);
  els.push(emitRegion(["F25"], "constructExchange.emitter", { id: `${design.id}.E`, d: Es.d, fill: C.emitter, layer: design.layer, owner: design.id }, ["E"]), emitRegion(["F25"], "constructExchange.receiver", { id: `${design.id}.R`, d: Rs.d, fill: C.receiver, layer: design.layer, owner: design.id }, ["R"]));
  const eFace = design.E.landmarks.find((l) => l.id === design.E.face).p, rFace = design.R.landmarks.find((l) => l.id === design.R.face).p, axis = nrm(sub(rFace, eFace)), side = [-axis[1], axis[0]], gapLen = len(sub(rFace, eFace));
  for (let i = 0; i < design.mechanisms; i++) { const at = add(rFace, mul(side, (i - (design.mechanisms - 1) / 2) * (gapLen * 0.35))), m = design.mechanismShape;
    els.push(emitRegion(["F25"], "constructExchange.mechanism", { id: `${design.id}.A${i}`, d: constructSilhouette({ ...m, landmarks: m.landmarks.map((l) => ({ ...l, p: add(at, rot(mul(l.p, gapLen * 0.12), (Math.atan2(-axis[1], -axis[0]) * 180) / Math.PI - 90)) })) }).d, fill: C.mechanism, layer: design.layer + 0.01, owner: `${design.id}.R` }, ["mechanisms", "mechanismShape"])); }
  for (let i = 0; i < design.carriers; i++) { const t = 0.15 + 0.7 * r(), at = add(lerp2(eFace, rFace, t), mul(side, (r() - 0.5) * gapLen * 0.8)), m = design.carrierShape;
    els.push(emitRegion(["F25", "F24"], "constructExchange.carrier", { id: `${design.id}.P${i}`, d: constructSilhouette({ ...m, landmarks: m.landmarks.map((l) => ({ ...l, p: add(at, mul(l.p, gapLen * 0.05)) })) }).d, fill: C.carrier, layer: design.layer + 0.02, owner: `${design.id}.G` }, ["carriers", "carrierShape"])); }
  if (design.active) els.push(emitRegion(["F25"], "constructExchange.active_flow", { id: `${design.id}.Q`, d: polyPath(ribbon([eFace, lerp2(eFace, rFace, 0.5), rFace], () => gapLen * 0.04)), fill: C.active, opacity: 0.85, layer: design.layer + 0.015, owner: design.id }, ["active"]));
  return { method: ["F25"], elements: els, data: { gap: +gapLen.toFixed(1), carriersInGap: design.carriers, active: design.active } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const growNetwork = registerProducer("network.growNetwork", growNetwork__impl);
export const drawNetwork = registerProducer("network.drawNetwork", drawNetwork__impl);
export const constructExchange = registerProducer("network.constructExchange", constructExchange__impl);
