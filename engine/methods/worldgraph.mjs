// F37 + F38 + F10 + F45 (+F59 ports, F54/F76 owned repeats, F60/F70 when oblique) — worldDesigner/worldCompiler (spec §4.8).
// The world plan is a CONSUMED graph: every part has a parent (another part or "substrate"), connectors terminate on declared ports,
// the projection family is declared, and each part kind is constructed by geometry from its typed parameters. Distinctive shapes
// (ground bands, rock, room shell) are authored contours (decisions); repetitive structure comes from owned generators.
import { need, add, sub, mul, nrm, len, perp, rot, lerp2, polyPath, ribbon, ellipsePts } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { declareProjection, constructBlock, constructOpenings } from "./projection.mjs";

export const FAMILIES = ["LAYERED_SIDE", "OBLIQUE_INTERIOR", "OBLIQUE_EXTERIOR"];
const KINDS = ["region", "cylinder_upright", "disc", "bar", "connector", "block", "repeat_on_face", "cylinder_oblique"];

function buildWorld__impl(w) {
  need("F37 world plan", w, { id: "str", family: FAMILIES, purpose: "str", parts: "arr", depthOrder: "arr" });
  const C = assertSolved(w.colors, `F37 world ${w.id}`), ports = {}, parts = {}, els = [], built = {};
  const proj = w.family === "LAYERED_SIDE" ? null : declareProjection(w.projection);
  const layerOf = Object.fromEntries(w.depthOrder.map((id, i) => [id, i]));
  for (const p of w.parts) {
    need(`F37 part ${p.id}`, p, { id: "str", kind: KINDS, parent: "str", role: "str", decision: "str" });
    if (p.parent !== "substrate" && !parts[p.parent]) throw new Error(`F37 world ${w.id}: part ${p.id} parent "${p.parent}" undefined (every object needs a graph edge, declared before it)`);
    if (layerOf[p.id] === undefined) throw new Error(`F37 world ${w.id}: part ${p.id} missing from the authored depth order`);
    parts[p.id] = p;
    // layerAbs: a scene-level contact decision (e.g. a grasped handle joins the hand stack)
    const L = p.layerAbs ?? (w.layer ?? 0) + layerOf[p.id], fill = (r) => { if (!C[r]) throw new Error(`F37 part ${p.id}: role ${r} not solved`); return C[r]; };
    const E = (sfx, d, role, extra = {}) => { const e = emitRegion(["F37", "F38", "F10", "F45"], `buildWorld.${p.kind}`, { id: `${w.id}.${p.id}${sfx}`, d, fill: fill(role), layer: L + (extra.dl || 0), owner: p.id, parentId: p.parent, decision: p.decision, ...extra }, []); els.push(e); (built[p.id] ||= []).push(e); return e; };
    if (p.kind === "region") {
      const s = constructSilhouette({ ...p.shape, view: p.shape.view || "front", identity: p.shape.identity || [p.shape.landmarks[0].id] });
      E("", s.d, p.fillRole); for (const l of p.shape.landmarks) ports[`${p.id}.${l.id}`] = l.p;
    } else if (p.kind === "cylinder_upright") {
      // side-on upright cylinder seen from slightly above: body + top ellipse (+ bore) ; ry/rx = view elevation (decided per world)
      need(`F45 cylinder ${p.id}`, p, { base: "vec2", rx: "num+", ry: "num+", height: "num+" });
      const [cx, by] = p.base, ty = by - p.height;
      E(".body", polyPath([...ellipsePts([cx, by], p.rx, p.ry, 24, 0, 0, 180), ...ellipsePts([cx, ty], p.rx, p.ry, 24, 0, 180, 360).reverse().reverse()]), p.fillRole);
      E(".top", polyPath(ellipsePts([cx, ty], p.rx, p.ry, 32)), p.topRole, { dl: 0.01 });
      if (p.boreRatio) E(".bore", polyPath(ellipsePts([cx, ty + p.ry * 0.08], p.rx * p.boreRatio, p.ry * p.boreRatio, 28)), p.boreRole, { dl: 0.02 });
      ports[`${p.id}.top`] = [cx, ty]; ports[`${p.id}.base`] = [cx, by]; ports[`${p.id}.mouth`] = [cx, ty + p.ry * 0.08];
    } else if (p.kind === "disc") {
      need(`F45 disc ${p.id}`, p, { center: "vec2", rx: "num+", ry: "num+", rotDeg: "num" });
      E("", polyPath(ellipsePts(p.center, p.rx, p.ry, 40, p.rotDeg)), p.fillRole);
      if (p.hubRatio) E(".hub", polyPath(ellipsePts(p.center, p.rx * p.hubRatio, p.ry * p.hubRatio, 20, p.rotDeg)), p.hubRole, { dl: 0.01 });
      ports[`${p.id}.center`] = p.center; for (const a of p.portAngles || []) ports[`${p.id}.rim${a}`] = rot([p.center[0] + p.rx * Math.cos((a * Math.PI) / 180), p.center[1] + p.ry * Math.sin((a * Math.PI) / 180)], p.rotDeg, p.center);
    } else if (p.kind === "bar") {
      need(`F45 bar ${p.id}`, p, { from: "str", widths: "arr" }); if (!(typeof p.to === "string" || (Array.isArray(p.to) && p.to.length === 2))) throw new Error(`F45 bar ${p.id}: "to" must be a port id or [x,y]`);
      const a = ports[p.from] || (Array.isArray(p.fromPoint) ? p.fromPoint : null); if (!a) throw new Error(`F59 bar ${p.id}: start port ${p.from} undefined`);
      const b = typeof p.to === "string" ? ports[p.to] : p.to; if (!b) throw new Error(`F59 bar ${p.id}: end ${p.to} undefined`);
      E("", polyPath(ribbon([a, lerp2(a, b, 0.5), b], (t) => p.widths[0] + (p.widths[1] - p.widths[0]) * t)), p.fillRole);
      ports[`${p.id}.a`] = a; ports[`${p.id}.b`] = b; for (const t of p.portsAt || []) ports[`${p.id}.at${t}`] = lerp2(a, b, t);
    } else if (p.kind === "connector") {
      need(`F68 connector ${p.id}`, p, { fromPort: "str", toPort: "str", via: "arr", width: "num+" });
      const a = ports[p.fromPort], b = ports[p.toPort]; if (!a || !b) throw new Error(`F68 connector ${p.id}: must terminate on declared ports (${p.fromPort} → ${p.toPort})`);
      const route = [a, ...p.via.map((v) => (typeof v === "string" ? ports[v] : v)), b]; if (route.some((q) => !q)) throw new Error(`F68 connector ${p.id}: via port undefined`);
      E("", polyPath(ribbon(route, () => p.width)), p.fillRole); ports[`${p.id}.route`] = route;
    } else if (p.kind === "block" || p.kind === "repeat_on_face") {
      if (!proj) throw new Error(`F60 world ${w.id}: ${p.kind} needs an oblique projection family`);
      if (p.kind === "block") { const b = constructBlock(proj, { id: `${w.id}.${p.id}`, footprint: p.footprint, height: p.height, baseZ: p.baseZ, roof: p.roof || "flat", roofInset: p.roofInset, roofDepth: p.roofDepth, ridgeAxis: p.ridgeAxis, rise: p.rise, material: p.material || "wall", layer: L, depthClass: p.depthClass || "mid", colors: w.materialColors[p.material || "wall"] }); els.push(...b.elements); built[p.id] = b.elements; parts[p.id].faces = b.faces; b.faces.forEach((f, i) => (ports[`${p.id}.face${i}`] = f.quad[0])); }
      else { const host = parts[p.parent]; const face = host.faces?.find((f) => f.id.endsWith(p.face)); if (!face) throw new Error(`F70 ${p.id}: face ${p.face} not visible on ${p.parent}`); const o = constructOpenings(proj, face, { ...p.grid, colors: w.materialColors[p.material || "wall"] }); els.push(...o.elements); built[p.id] = o.elements; }
    } else if (p.kind === "cylinder_oblique") {
      if (!proj) throw new Error(`F60 world ${w.id}: cylinder_oblique needs an oblique projection`);
      need(`F45 oblique cylinder ${p.id}`, p, { center: "arr", radius: "num+", height: "num+" });
      const ring = (z) => Array.from({ length: 32 }, (_, i) => { const a = (i / 32) * Math.PI * 2; return proj.P(p.center[0] + p.radius * Math.cos(a), p.center[1] + p.radius * Math.sin(a), z); });
      const bot = ring(p.center[2] ?? 0), top = ring((p.center[2] ?? 0) + p.height);
      const ext = (pts) => { let i0 = 0, i1 = 0; pts.forEach((q, i) => { if (q[0] < pts[i0][0]) i0 = i; if (q[0] > pts[i1][0]) i1 = i; }); return [i0, i1]; };
      const [l, r] = ext(top), sideD = polyPath([top[l], bot[l], ...walk(bot, l, r), bot[r], top[r], ...walk(top, r, l)]);
      E(".side", sideD, p.fillRole); E(".top", polyPath(top), p.topRole, { dl: 0.01 }); ports[`${p.id}.top`] = proj.P(p.center[0], p.center[1], (p.center[2] ?? 0) + p.height); ports[`${p.id}.base`] = proj.P(p.center[0], p.center[1], p.center[2] ?? 0);
    }
  }
  return { method: ["F37", "F38", "F10", "F45"], elements: els, ports, built, projection: proj, data: { parts: w.parts.length, family: w.family, purpose: w.purpose } };
}
const walk = (pts, a, b) => { const out = []; let i = a; const n = pts.length; for (let g = 0; g < n && i !== b; g++) { i = (i + 1) % n; out.push(pts[i]); } return out; };
export const buildWorld = registerProducer("worldgraph.buildWorld", buildWorld__impl);
