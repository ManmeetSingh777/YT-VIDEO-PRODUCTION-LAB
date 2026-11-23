// F33 + F47 + F53 + F77 — detail/density allocated by semantic role, view depth, task and motion ownership.
// F33: detail_owner per layer (focal_structural, focal_expression, midground_repetition, far_environment, scientific_population); no
// universal 70/20/10; every small mark belongs to a named surface/population/effect. F47: T0 skeleton (3–8 planning masses, 160×90),
// T1 complete modules, T2 parent-bound features, T3 state-dependent marks (never compensating for missing T0–T2); per candidate mark:
// parent_id, material_or_function, distance_class, contrast_budget, state, occlusion, disable_test; distant T2/T3 collapse. F53: viewer_first_point,
// causal_path, second_read_destination before detailing; per-region density. F77: regions MAIN_PROOF/SUPPORT/QUIET/OPTICAL_EXCEPTION/
// TRANSITION_COVER with T1/T2/T3 budgets; moving parts need separate states/underpaint; held supports declared.
// Producing operation: allocate() turns these decisions into per-generator BUDGETS (counts, allowed tiers, contrast caps) that the
// repeat/opening/tree/network producers consume; candidates without parent/function are rejected; tier collapse by distance.
import { registerProducer } from "./emit.mjs";
import { need } from "./core.mjs";

export const OWNERS = ["focal_structural", "focal_expression", "midground_repetition", "far_environment", "scientific_population"];
export const REGIONS = ["MAIN_PROOF", "SUPPORT", "QUIET", "OPTICAL_EXCEPTION", "TRANSITION_COVER"];
const DIST = { near: 1, mid: 0.55, far: 0.2 };
const REGION_T3 = { MAIN_PROOF: 1, SUPPORT: 0.4, QUIET: 0, OPTICAL_EXCEPTION: 0.6, TRANSITION_COVER: 0.3 };
const REGION_CONTRAST = { MAIN_PROOF: 1, SUPPORT: 0.5, QUIET: 0.25, OPTICAL_EXCEPTION: 0.8, TRANSITION_COVER: 0.6 };

/** allocate({attention:{viewer_first_point, causal_path, second_read_destination}, t0:[...], regions:[{id, kind, owner}], candidates:[...]}) */
function allocate__impl(design) {
  // F53 (Gate A): attention decisions are graph node ids and DIRECTLY change budgets. Coefficients are director decisions (recorded), not constants.
  const A = need("F53 attention", design.attention, { viewer_first_point: "str", causal_path: "arr", second_read_destination: "str", coefficients: "obj" });
  const K = need("F53 coefficients", A.coefficients, { firstPointGain: "num", pathGain: "num", secondReadGain: "num", offPathDecay: "num", decisionId: "str" });
  need("F47 T0", design, { t0: "arr", regions: "arr", candidates: "arr", graph: "obj" });
  if (design.t0.length < 3 || design.t0.length > 8) throw new Error(`F47: T0 spatial skeleton needs 3–8 planning masses (got ${design.t0.length})`);
  const G = design.graph; for (const n of [A.viewer_first_point, A.second_read_destination, ...A.causal_path]) if (!G[n]) throw new Error(`F53: attention node "${n}" is not in the attention graph`);
  // hop distance from every node to the causal path (BFS over the declared spatial/relational graph)
  const dist = {}; const q = [...A.causal_path]; for (const n of q) dist[n] = 0;
  while (q.length) { const n = q.shift(); for (const m of G[n] || []) if (dist[m] === undefined) { dist[m] = dist[n] + 1; q.push(m); } }
  const R = {}; for (const g of design.regions) { need("F77 region", g, { id: "str", kind: REGIONS, owner: OWNERS }); R[g.id] = g; }
  const budgets = {}, rejected = [];
  for (const c of design.candidates) {
    need("F47 candidate", c, { id: "str", tier: ["T1", "T2", "T3"], region: "str", distance_class: ["near", "mid", "far"], state: "str", baseCount: "num", node: "str" });
    if (!c.parent_id || !c.material_or_function) { rejected.push({ id: c.id, why: "no parent or explanatory function (F47)" }); continue; }
    const g = R[c.region]; if (!g) throw new Error(`F77: candidate ${c.id} in unknown region ${c.region}`);
    if (!G[c.node]) throw new Error(`F53: candidate ${c.id} node "${c.node}" is not in the attention graph`);
    let k = 1;
    if (c.tier === "T2") k = DIST[c.distance_class] >= 0.5 ? DIST[c.distance_class] : 0; // distant T2 collapses into the parent fill
    if (c.tier === "T3") k = REGION_T3[g.kind] * (c.distance_class === "near" ? 1 : 0) * (c.state === "inactive" ? 0 : 1);
    if (g.owner === "far_environment" && c.tier !== "T1") k = 0;
    if (g.owner === "focal_expression" && c.tier === "T3") k = Math.min(k, 0.3);
    const hops = dist[c.node] ?? 99;
    const emphasis = (c.node === A.viewer_first_point ? 1 + K.firstPointGain : 1) * (hops === 0 ? 1 + K.pathGain : Math.pow(K.offPathDecay, hops)) * (c.node === A.second_read_destination ? 1 + K.secondReadGain : 1);
    const keepT1 = c.tier === "T1" ? Math.max(1, Math.round(c.baseCount * k)) : 0; // T1 is never removed by attention (explanation must survive)
    budgets[c.id] = { node: c.node, hopsToCausalPath: hops, emphasis: +emphasis.toFixed(3), count: Math.max(keepT1, Math.round(c.baseCount * k * Math.min(1, emphasis))), scale: +Math.min(1.6, Math.max(0.6, emphasis)).toFixed(3), contrastCap: +Math.min(1, REGION_CONTRAST[g.kind] * (c.tier === "T1" ? 1 : 0.7) * emphasis).toFixed(3), tier: c.tier, parent: c.parent_id, disable_test: c.disable_test || `${c.id} off → ${c.parent_id} still reads` };
  }
  const t1 = design.candidates.filter((c) => c.tier === "T1" && budgets[c.id]?.count > 0).length;
  if (!t1) throw new Error("F53: T1 (major explanatory body) must always be created");
  return { method: ["F33", "F47", "F53", "F77"], data: { budgets, rejected, coefficientsDecision: K.decisionId } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const allocate = registerProducer("density.allocate", allocate__impl);
