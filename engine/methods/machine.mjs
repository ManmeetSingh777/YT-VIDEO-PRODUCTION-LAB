// F09 + F28 + F45 + F68 — machines by functional topology first.
// F09: explicit mechanical dependency graph (housing→faces→inset display→controls/vents→supports; cylinder→top annulus→side→base;
// ring chamber→bezel→receding walls→radial segments→opening; propulsion→tank→fins→nozzle→flame→exhaust); controls in named recesses;
// wires through connected pathways; screen content masked. F28: design_truth_table (period, principle, chassis, controls, attachment,
// operating contact, view) BEFORE shading. F45: device truth table input→process→output, 2–5 assemblies sized by causal importance,
// different surface family per assembly, no impossible conduit / floating window. F68: controls inside assigned parent facets, rows on
// parent axes, cables terminate on visible sockets, surface_transition_policy per face.
// Producing operation: truth table + assembly graph → flow-path validation → assemblies built as projected blocks/cylinders (F60
// basis) → controls generated in facet-local grids → conduits routed between declared sockets with socket rings drawn at both ends.
import { need, add, sub, mul, nrm, len, polyPath, ribbon, ellipsePts, lerp2 } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { constructBlock, constructOpenings } from "./projection.mjs";

export const ASSEMBLY = ["housing", "cylinder", "working_core", "transport", "control", "support"];
export const POLICY = ["HARD_BOUNDARY", "LOCAL_SOFT_OPTIC", "SUPPORT_FIELD_GRADIENT"];

function constructMachine__impl(proj, design) {
  need("F45 machine", design, { id: "str", truth: "obj", assemblies: "arr", conduits: "arr", controls: "arr" });
  need("F45/F28 truth table", design.truth, { input: "str", process: "str", output: "str", operator: "str", energy: "str", period: "str", principle: "str" });
  const C = assertSolved(design.colors, `F68 ${design.id}`), A = {}, els = [], faces = {};
  if (design.assemblies.length < 2 || design.assemblies.length > 5) throw new Error(`F45 ${design.id}: 2–5 distinct structural assemblies sized by causal importance (got ${design.assemblies.length})`);
  for (const a of design.assemblies) {
    need(`F45 assembly ${a.id}`, a, { id: "str", kind: ASSEMBLY, role: ["input", "process", "output", "control", "support"], policy: POLICY, layer: "num" });
    if (a.kind === "cylinder") {
      need(`F09 cylinder ${a.id}`, a, { center: "vec2", radius: "num+", height: "num+" });
      const top = ellipsePts(proj.P(a.center[0], a.center[1], a.height), a.radius * 1.0, a.radius * 0.45, 32), base = ellipsePts(proj.P(a.center[0], a.center[1], 0), a.radius, a.radius * 0.45, 32, 0, 0, 180);
      const side = [...base, ...ellipsePts(proj.P(a.center[0], a.center[1], a.height), a.radius, a.radius * 0.45, 32, 0, 180, 0).reverse().reverse()];
      els.push(emitRegion(["F09", "F68"], "constructMachine.cylinder_side", { id: `${design.id}.${a.id}.side`, d: polyPath([...base, ...ellipsePts(proj.P(a.center[0], a.center[1], a.height), a.radius, a.radius * 0.45, 32, 0, 180, 0)]), fill: C.shade, layer: a.layer, owner: a.id }, ["assemblies.radius", "assemblies.height"]));
      els.push(emitRegion(["F09", "F68"], "constructMachine.cylinder_top_annulus", { id: `${design.id}.${a.id}.top`, d: polyPath(top), fill: C.light, layer: a.layer + 0.01, owner: a.id }, ["assemblies.radius"]));
      A[a.id] = { ...a, socketAt: (s) => proj.P(a.center[0] + a.radius * Math.cos(s), a.center[1] + a.radius * Math.sin(s), a.height * 0.5) };
    } else {
      need(`F45 block ${a.id}`, a, { footprint: "vecs", height: "num+" });
      const b = constructBlock(proj, { id: `${design.id}.${a.id}`, footprint: a.footprint, height: a.height, roof: "flat", material: "metal", layer: a.layer, depthClass: "near", colors: C });
      els.push(...b.elements); faces[a.id] = b.faces;
      const c = a.footprint.reduce((s, p) => add(s, p), [0, 0]).map((v) => v / a.footprint.length);
      A[a.id] = { ...a, socketAt: () => proj.P(c[0], c[1], a.height * 0.5) };
    }
  }
  // F45 pass: operational flow input → … → output through connected assemblies (conduits), no floating parts
  const adj = {}; for (const c of design.conduits) { need("F68 conduit", c, { from: "str", to: "str", width: "num+", via: "vecs" }); if (!A[c.from] || !A[c.to]) throw new Error(`F68: conduit ${c.from}→${c.to} must terminate on declared assemblies (visible sockets)`); (adj[c.from] ||= []).push(c.to); }
  const ins = design.assemblies.filter((a) => a.role === "input").map((a) => a.id), outs = new Set(design.assemblies.filter((a) => a.role === "output").map((a) => a.id));
  const seen = new Set(ins), q = [...ins]; while (q.length) { const n = q.shift(); for (const m of adj[n] || []) if (!seen.has(m)) { seen.add(m); q.push(m); } }
  if (!ins.length || ![...outs].some((o) => seen.has(o))) throw new Error(`F45 ${design.id}: no continuous flow from input to output (${design.truth.input} → ${design.truth.output})`);
  const floating = design.assemblies.filter((a) => a.role !== "support" && !seen.has(a.id) && !design.conduits.some((c) => c.to === a.id || c.from === a.id)).map((a) => a.id);
  if (floating.length) throw new Error(`F45 ${design.id}: assemblies ${floating.join(",")} are not attached to the operational flow`);
  for (const c of design.conduits) {
    const p0 = A[c.from].socketAt(c.fromAngle ?? 0), p1 = A[c.to].socketAt(c.toAngle ?? Math.PI), line = [p0, ...c.via.map((v) => proj.P(v[0], v[1], v[2] ?? 0)), p1];
    els.push(emitRegion(["F68", "F09"], "constructMachine.conduit", { id: `${design.id}.conduit.${c.from}_${c.to}`, d: polyPath(ribbon(line, () => c.width)), fill: C.base, layer: Math.min(A[c.from].layer, A[c.to].layer) - 0.05, owner: design.id }, ["conduits"]));
    for (const [p, tag] of [[p0, "a"], [p1, "b"]]) els.push(emitRegion(["F68", "F44"], "constructMachine.socket_ring", { id: `${design.id}.socket.${c.from}_${c.to}.${tag}`, d: polyPath(ellipsePts(p, c.width * 0.9, c.width * 0.9, 16)), fill: C.deep, layer: Math.max(A[c.from].layer, A[c.to].layer) + 0.1, owner: design.id }, ["conduits.width"]));
  }
  // F68: controls inside assigned parent facets, projected along the facet axes
  for (const k of design.controls) {
    need("F68 control", k, { assembly: "str", face: "num", function: "str", rows: "num", cols: "num" });
    const f = (faces[k.assembly] || []).filter((x) => x.kind === "wall")[k.face]; if (!f) throw new Error(`F68: control "${k.function}" has no visible facet ${k.face} on ${k.assembly}`);
    els.push(...constructOpenings(proj, f, { rows: k.rows, cols: k.cols, margin: k.margin ?? 10, gap: k.gap ?? 6, sill: k.sill ?? 10, kind: "panel", breakAt: [], colors: C }).elements);
  }
  return { method: ["F09", "F28", "F45", "F68"], elements: els, data: { truth: design.truth, flowReachable: [...seen], policies: Object.fromEntries(design.assemblies.map((a) => [a.id, a.policy])) } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructMachine = registerProducer("machine.constructMachine", constructMachine__impl);
