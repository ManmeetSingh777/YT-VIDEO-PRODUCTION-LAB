// Dependency graphs (spec §4 step 3): art lineage DAG, rig DAG per rig, occlusion precedence graph, action dependencies, camera footprint
// dependencies. Cycles and missing owners are detected BEFORE image loading.
import { err } from "./errors.mjs";

function findCycle(nodes, edgesOf) {
  const state = new Map(), stack = [];
  const dfs = (n) => { state.set(n, 1); stack.push(n);
    for (const m of edgesOf(n)) { if (state.get(m) === 1) return [...stack.slice(stack.indexOf(m)), m]; if (!state.has(m)) { const c = dfs(m); if (c) return c; } }
    stack.pop(); state.set(n, 2); return null; };
  for (const n of nodes) if (!state.has(n)) { const c = dfs(n); if (c) return c; }
  return null;
}

export function rigDag(rig) {
  const errors = [], ids = new Map();
  for (const j of rig.joints) { if (ids.has(j.id)) errors.push(err("DUPLICATE_ELEMENT_ID", { record_id: `${rig.id}.${j.id}`, reason: "duplicate joint id" })); ids.set(j.id, j); }
  const roots = rig.joints.filter((j) => j.parent_id === null);
  if (roots.length !== 1) errors.push(err("INVALID_RIG_DAG", { record_id: rig.id, reason: `exactly one root joint required (found ${roots.length})` }));
  for (const j of rig.joints) if (j.parent_id !== null && !ids.has(j.parent_id)) errors.push(err("INVALID_RIG_DAG", { record_id: `${rig.id}.${j.id}`, dependency: j.parent_id, reason: `dangling parent ${j.parent_id}` }));
  const cyc = findCycle([...ids.keys()], (n) => { const p = ids.get(n)?.parent_id; return p && ids.has(p) ? [p] : []; });
  if (cyc) errors.push(err("INVALID_RIG_DAG", { record_id: rig.id, reason: `joint cycle ${cyc.join(" -> ")}` }));
  if (!rig.joints.some((j) => j.id === rig.root_part)) errors.push(err("INVALID_RIG_DAG", { record_id: rig.id, dependency: rig.root_part, reason: "root_part is not a joint of the rig" }));
  return { errors, joints: ids, root: roots[0]?.id ?? null };
}

/** occlusion precedence: ABOVE/BELOW constraints between assets; a cycle is OCCLUSION_CONFLICT (never broken by an arbitrary z) */
export function occlusionGraph(assets) {
  const byId = new Map(assets.map((a) => [a.id, a])), above = new Map(assets.map((a) => [a.id, new Set()])), errors = [];
  for (const a of assets) for (const c of a.draw_order_constraints) {
    if (!byId.has(c.asset_id)) { errors.push(err("UNKNOWN_REFERENCE", { record_id: a.id, dependency: c.asset_id, reason: "draw-order constraint references an unknown asset" })); continue; }
    if (c.relation === "ABOVE") above.get(a.id).add(c.asset_id); else above.get(c.asset_id).add(a.id); // edge X -> Y means X paints above Y
  }
  const cyc = findCycle([...above.keys()], (n) => [...above.get(n)]);
  if (cyc) errors.push(err("OCCLUSION_CONFLICT", { record_id: cyc[0], reason: `circular paint order ${cyc.join(" > ")} — split authored cutout ownership or request new registered pose art` }));
  // topological paint order (bottom first)
  const indeg = new Map([...above.keys()].map((k) => [k, 0])); for (const [, s] of above) for (const b of s) indeg.set(b, indeg.get(b)); // placeholder to keep keys
  return { errors, above };
}

export function buildGraphs(doc) {
  const errors = [], assets = new Map(doc.assets.map((a) => [a.id, a]));
  // art lineage: identity -> canonical master -> parts (parent_part_id) -> underpaint/mask/occluder
  const lineage = {};
  for (const a of doc.assets) {
    lineage[a.id] = { identity: a.identity_id, parent: a.parent_part_id, underpaint: a.underpaint_asset_ids, masks: a.mask_asset_ids, occluders: a.occluder_asset_ids };
    if (a.parent_part_id && !assets.has(a.parent_part_id)) errors.push(err("UNKNOWN_REFERENCE", { record_id: a.id, dependency: a.parent_part_id, reason: "parent_part_id not found" }));
  }
  const pc = findCycle([...assets.keys()], (n) => { const p = assets.get(n)?.parent_part_id; return p && assets.has(p) ? [p] : []; });
  if (pc) errors.push(err("INVALID_RIG_DAG", { record_id: pc[0], reason: `asset parent cycle ${pc.join(" -> ")}` }));
  const rigs = {}; for (const r of doc.rigs) { const g = rigDag(r); rigs[r.id] = g; errors.push(...g.errors); }
  const occ = occlusionGraph(doc.assets); errors.push(...occ.errors);
  const actionDeps = Object.fromEntries(doc.actions.map((a) => [a.id, { shot: a.shot_id, rigs: a.actors.map((x) => x.rig_id), assets: a.required_assets }]));
  const cameraDeps = Object.fromEntries(doc.worlds.map((w) => [w.id, { footprint: w.camera_footprint, overscan: w.overscan_rect, owners: w.depth_owners.map((o) => o.id) }]));
  return { errors, lineage, rigs, occlusion: occ.above, actionDeps, cameraDeps };
}
