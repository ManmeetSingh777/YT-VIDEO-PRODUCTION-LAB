// F59 (+ F01 steps 2–3) — parts join and occlude in a deliberate topology.
// Build (source): directed graph id → parent_id, local_origin, joint_type, insertion_depth, in_front_of, hidden_when, material_id;
// each joint gets an actual overlap; one side of the joint ENTERS its parent (no sticker); depth order is never delegated to a renderer.
// Deliver: part DAG, topological overlap matrix, contact anchor positions, which_part_moves_when_parent_moves.
// Producing operation: each child contour (authored in its own local frame) is SEATED by computation: its socket landmark is placed
// insertion_depth inside the parent's contour along the parent's inward normal at the named anchor landmark, then rotated by the joint
// angle about the socket. Descendants inherit the transform chain. Layers are solved from the in-front-of graph.
import { need, add, sub, mul, nrm, len, normals, pathPoly } from "./core.mjs";
import { constructSilhouette, placeDesign } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import * as R from "../authoring/raster.mjs";
import { RULES } from "./knowledge.mjs";

export const JOINTS = ["inserted", "hinged", "mounted", "contained", "rooted", "wrapped"];

/** assemble(design) design: { id, parts:[{id, parent|null, design, socket?, anchor?, joint_type, insertion_depth, angle, front: bool, fillRole}],
 *                            order?: [[aId, "over", bId]], colors: <solved roles> } */
function assemble__impl(design) {
  need("F59 assembly", design, { id: "str", parts: "arr" });
  const C = assertSolved(design.colors, `F59 ${design.id}`);
  const byId = {}, kids = {};
  for (const p of design.parts) {
    need(`F59 part ${p.id}`, p, { id: "str", design: "obj", joint_type: JOINTS, fillRole: "str" });
    if (p.parent != null) need(`F59 part ${p.id}`, p, { parent: "str", socket: "str", anchor: "str", insertion_depth: "num", angle: "num", front: "bool" });
    if (byId[p.id]) throw new Error(`F59: duplicate part ${p.id}`);
    if (!C[p.fillRole]) throw new Error(`F59: part ${p.id} fill role "${p.fillRole}" is not in the solved palette`);
    byId[p.id] = p; (kids[p.parent ?? "∅"] ||= []).push(p.id);
  }
  const roots = kids["∅"] || []; if (roots.length !== 1) throw new Error(`F59 ${design.id}: exactly one root mass required (got ${roots.length})`);
  RULES.F01_distinguishes(design, `F59 ${design.id}`); RULES.F01_generic_round(byId[roots[0]].design, `F59 ${design.id} root ${roots[0]}`); // artistic layer: identity + no default round mass
  const placed = {}, anchors = {}, moves = {};
  const place = (id, chain) => {
    const p = byId[id];
    if (p.parent == null) placed[id] = constructSilhouette(p.design);
    else {
      const par = placed[p.parent]; if (!par) throw new Error(`F59: parent ${p.parent} of ${id} not constructed first`);
      const a = par.landmarks[p.anchor]; if (!a) throw new Error(`F59: anchor "${p.anchor}" is not a landmark of ${p.parent}`);
      const sock = p.design.landmarks.find((l) => l.id === p.socket); if (!sock) throw new Error(`F59: socket "${p.socket}" is not a landmark of ${id}`);
      // inward normal of the parent contour at the anchor (nearest dense contour vertex)
      const poly = pathPoly(par.d, 16), N = normals(poly); let k = 0, best = 1e9; poly.forEach((q, i) => { const dd = len(sub(q, a.p)); if (dd < best) { best = dd; k = i; } });
      const inward = mul(N[k], -1), target = p.joint_type === "contained" ? a.p : add(a.p, mul(inward, p.insertion_depth));
      placed[id] = constructSilhouette(placeDesign(p.design, { translate: sub(target, sock.p), rotate: p.angle, pivot: sock.p }));
      anchors[id] = { parent: p.parent, anchor: p.anchor, at: target, inward };
    }
    moves[id] = [...chain];
    for (const c of kids[id] || []) place(c, [...chain, id]);
  };
  place(roots[0], []);
  // layer solve: child relative to parent (front/back) + explicit "over" constraints → topological order (Kahn)
  const over = []; // [a, b] meaning a drawn over b
  for (const p of design.parts) if (p.parent != null) over.push(p.front ? [p.id, p.parent] : [p.parent, p.id]);
  for (const o of design.order || []) { if (o[1] !== "over" || !byId[o[0]] || !byId[o[2]]) throw new Error(`F59 order constraint malformed: ${JSON.stringify(o)}`); over.push([o[0], o[2]]); }
  const indeg = Object.fromEntries(Object.keys(byId).map((k) => [k, 0])), adj = {};
  for (const [a, b] of over) { (adj[b] ||= []).push(a); indeg[a]++; }
  const q = Object.keys(indeg).filter((k) => !indeg[k]).sort(), order = [];
  while (q.length) { const n = q.shift(); order.push(n); for (const m of adj[n] || []) if (--indeg[m] === 0) q.push(m); }
  if (order.length !== Object.keys(byId).length) throw new Error(`F59 ${design.id}: occlusion order is cyclic — depth order must be decided, not delegated`);
  const layer = Object.fromEntries(order.map((id, i) => [id, i]));
  // overlap matrix + joint falsifier (every non-root part must actually overlap its parent: one side enters it)
  const G = R.grid(-400, -400, 2800, 1900, 3), masks = Object.fromEntries(Object.entries(placed).map(([k, s]) => [k, R.mask(G, s.d)]));
  const joints = [];
  for (const p of design.parts) if (p.parent != null) {
    const ov = R.area(R.and(masks[p.id], masks[p.parent])), frac = ov / Math.max(1, R.area(masks[p.id]));
    const ok = p.joint_type === "contained" ? frac > 0.95 : frac > 0.01 && frac < 0.98;
    joints.push({ part: p.id, parent: p.parent, joint: p.joint_type, overlapFrac: +frac.toFixed(3), pass: ok });
  }
  const badJ = joints.filter((j) => !j.pass); if (badJ.length) throw new Error(`F59 ${design.id}: joint topology failed (${badJ.map((j) => `${j.part}→${j.parent} overlap ${j.overlapFrac}`).join("; ")}) — non-renderable`);
  const elements = order.map((id) => emitRegion(["F59", "F01"], "assemble", { id: `${design.id}.${id}`, d: placed[id].d + (placed[id].voids.length ? " " + placed[id].voids.map((v) => v.path).join(" ") : ""), fill: C[byId[id].fillRole], layer: layer[id], owner: id }, ["parts.design", "parts.anchor", "parts.insertion_depth", "parts.angle", "parts.front"]));
  return { method: ["F59", "F01"], elements, parts: placed, data: { order, layer, anchors, which_part_moves_when_parent_moves: moves, joints }, pass: joints.every((j) => j.pass) };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const assemble = registerProducer("topology.assemble", assemble__impl);
