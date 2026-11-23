// Real consumers for source methods that were previously only names (directive F1.6/F1.7; F029–F031, F049). Each function turns a
// method's conditional decision into data that CHANGES the compiled request or a downstream engine decision; tests perturb each input and
// assert the specific output changes (source_method_causality.test.mjs). None of these draw anything.
import { err } from "./errors.mjs";

/* F19/F20 — route EACH BEAT to a medium (nesting permitted). Input beats carry what must be understood; output is the medium tree. */
const MEDIA = { physical_action: "WORLD", spatial_layout: "WORLD", data_relation: "DIAGRAM", quantity_change: "DIAGRAM", inner_state: "ABSTRACT_STAGE", scale_jump: "MACRO_INSET", screen_content: "EMBEDDED_SCREEN", comparison: "PARALLEL_STATES", world_within_world: "PORTAL" };
export function routeBeatMedia(beats) {
  return beats.map((b) => { const kinds = [].concat(b.content_kind); const media = kinds.map((k) => { if (!MEDIA[k]) throw err("UNSUPPORTED_MOTION_CLASS", { record_id: b.id, reason: `no medium route for content kind ${k}`, producer: "engine/art_bridge/source_method_causality.mjs#routeBeatMedia" }); return MEDIA[k]; });
    return { beat: b.id, frame_range: b.frame_range, primary: media[0], nested: media.slice(1), reason: kinds.map((k, i) => `${k}→${media[i]}`).join("; ") }; });
}

/* F33/F47/F53/F77 — allocate detail/marks by projected size AND semantic role (not adjectives). Returns a per-region budget. */
const ROLE_W = { focal_structural: 1.0, focal_expression: 0.9, causal_path: 0.85, midground_repetition: 0.35, far_environment: 0.15, quiet_support: 0.1, scientific_population: 0.6 };
export function allocateDetail(regions, { canvas = [1920, 1080] } = {}) {
  const area = canvas[0] * canvas[1];
  return regions.map((r) => { const w = ROLE_W[r.role]; if (w === undefined) throw err("SCHEMA_VIOLATION", { record_id: r.id, reason: `unknown detail role ${r.role}` });
    const px = Math.max(1, r.projected_px[0] * r.projected_px[1]), share = px / area, marks = Math.max(r.role === "quiet_support" ? 0 : 1, Math.round(w * Math.sqrt(px) / 24)), owner = w >= 0.85 ? "focal" : w >= 0.35 ? "support" : "quiet";
    return { id: r.id, role: r.role, projected_px: r.projected_px, screen_share: +share.toFixed(4), mark_budget: marks, detail_owner: owner, motion_owner: r.motion_owner || null, rule: `marks = round(role_weight ${w} × √area / 24)` }; });
}

/* F38/F60 — projection grammar chosen from the proof, enforced on every plane */
export function projectionGrammar({ proof_projection, planes = [] }) {
  const grammar = { face_contact: "LAYERED", object_process: "LAYERED", wide_distribution: "OBLIQUE", diagram_relation: "FLAT_DIAGRAM", embedded_screen: "FLAT_DIAGRAM", macro_internal: "LAYERED", world_scale: "OBLIQUE" }[proof_projection];
  if (!grammar) throw err("SCHEMA_VIOLATION", { reason: `unknown proof_projection ${proof_projection}`, producer: "engine/art_bridge/source_method_causality.mjs#projectionGrammar" });
  const violations = [];
  if (grammar === "OBLIQUE") { const ref = planes.find((p) => p.kind === "ground")?.axes_deg; if (!ref) violations.push({ plane: null, reason: "oblique grammar needs a ground plane with two axis directions" });
    else for (const p of planes.filter((x) => x.axes_deg)) for (let i = 0; i < 2; i++) { const d = Math.abs(((p.axes_deg[i] - ref[i] + 540) % 360) - 180); if (d > 3) violations.push({ plane: p.id, reason: `axis ${i} ${p.axes_deg[i]}° deviates ${d.toFixed(1)}° from the ground grammar ${ref[i]}°` }); } }
  if (grammar === "LAYERED") { const ps = planes.filter((p) => p.depth_band !== undefined).sort((a, b) => a.depth_band - b.depth_band); for (let i = 1; i < ps.length; i++) if (!(ps[i].parallax > ps[i - 1].parallax)) violations.push({ plane: ps[i].id, reason: `parallax ${ps[i].parallax} must increase with depth band (prev ${ps[i - 1].parallax})` }); }
  if (grammar === "FLAT_DIAGRAM") for (const p of planes) if (p.vanishing_point) violations.push({ plane: p.id, reason: "a diagram plane cannot carry a vanishing point" });
  return { grammar, violations, ok: violations.length === 0 };
}

/* F55 — camera-sized artwork: the authored extent a world plate needs = union of inverse camera footprints over the shot (+ margin) */
export function cameraSizedArtworkDemand({ camera, frames, canvas = [1920, 1080], parallax = 1, margin = 0.04 }) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity, zmax = 0;
  for (const f of frames) { const c = camera(f), z = c.zoom, w = canvas[0] / z / parallax, h = canvas[1] / z / parallax, cx = c.x * parallax, cy = c.y * parallax;
    x0 = Math.min(x0, cx - w / 2); y0 = Math.min(y0, cy - h / 2); x1 = Math.max(x1, cx + w / 2); y1 = Math.max(y1, cy + h / 2); zmax = Math.max(zmax, z); }
  const mx = (x1 - x0) * margin, my = (y1 - y0) * margin, rect = [x0 - mx, y0 - my, x1 - x0 + 2 * mx, y1 - y0 + 2 * my];
  return { canonical_coverage_rect: rect.map((v) => +v.toFixed(2)), min_density_px_per_unit: +(zmax * parallax).toFixed(3), authored_px: [Math.ceil(rect[2] * zmax * parallax), Math.ceil(rect[3] * zmax * parallax)] };
}

/* F49 — world construction data compiles into the skill's machine-checkable world_system (refuses when the design lacks it) */
export function compileWorldSystem(design) {
  const w = design.world_construction; if (!w) throw err("ART_DESIGN_UNSPECIFIED", { record_id: design.job_id, reason: "world family without world_construction (parts, relationships, projection, witnesses)", producer: "engine/art_bridge/source_method_causality.mjs#compileWorldSystem" });
  const ids = new Set((w.parts || []).map((p) => p.id)); const bad = (w.relationships || []).filter((r) => !ids.has(r.from) || !ids.has(r.to));
  if (!w.parts?.length || bad.length) throw err("ART_DESIGN_UNSPECIFIED", { record_id: design.job_id, reason: `world parts/relationships invalid (${bad.length} dangling)` });
  return { world_class: w.world_class, purpose: w.purpose, projection: w.projection, depth_layers: w.depth_layers, parts: w.parts, relationships: w.relationships, material_owners: w.material_owners, source_only_witnesses: w.source_only_witnesses, effect_ownership: w.effect_ownership || [], allowed_subject_ids: w.allowed_subject_ids || [] };
}
/* F50 — unfamiliar-world transfer plan: the holdout checks a world design must survive (not resemblance to one frame) */
export function unfamiliarTransferPlan(worldSystem) { return (worldSystem.parts || []).map((p) => ({ part: p.id, holdout: `re-stage ${p.id} under a different projection and scale; its function "${p.function}" must still read`, fails_if: "the part only reads in its original crop" })); }

/* F29 — parallel-state comparison layout: N futures share registration, camera and timing; only the compared variable differs */
export function parallelStateLayout({ states, canvas = [1920, 1080], gutter = 40 }) {
  const n = states.length; if (n < 2) throw err("SCHEMA_VIOLATION", { reason: "a comparison needs ≥2 states" });
  const w = (canvas[0] - gutter * (n + 1)) / n, base = states[0].invariants;
  const drift = states.filter((s) => JSON.stringify(s.invariants) !== JSON.stringify(base)).map((s) => s.id);
  return { panels: states.map((s, i) => ({ state: s.id, rect: [gutter + i * (w + gutter), gutter, w, canvas[1] - 2 * gutter], varies: s.variable })), shared_invariants: base, invariant_drift: drift, ok: drift.length === 0 };
}

/* F34 — generator choice per element class */
export function generatorDecision(elements) {
  return elements.map((e) => ({ id: e.id, generator: { geography: "AUTHORED_SILHOUETTE_LAYERS", repeated_module: "PARENT_OWNED_GENERATOR", texture: "MATERIAL_OWNER_PATTERN", population: "PROCEDURAL_FIELD_WITH_CLUSTERS", unique_subject: "GPT_SOURCE_ATTACHED_ART" }[e.class] || (() => { throw err("SCHEMA_VIOLATION", { record_id: e.id, reason: `no generator for class ${e.class}` }); })(), reason: e.class }));
}

/** STYLE_CONSTRUCTION_DECISION region graph (directive F2): one node per decided construction component, with its method, source hash,
 *  consumer stage, subject-specific instruction, positive contrast, forbidden generic replacement and the output digest of its method block */
export function styleConstructionGraph({ design, gate, stages, sha }) {
  const byM = new Map((design.method_decisions || []).map((d) => [d.method_id, d])), stageOf = (m) => stages.find((s) => s.methods.includes(m));
  const nodes = [];
  for (const r of gate.required_methods) { const d = byM.get(r.method); if (!d) continue;
    for (const comp of [].concat(d.output_art_components)) nodes.push({ id: `${r.method}:${comp}`, kind: r.phase, method_id: r.method, source_hash: d.source_clause_sha256, consumer: stageOf(r.method) ? `provider stage ${stageOf(r.method).index}` : "state-edit stages", instruction: d.visible_construction_operation, positive_contrast: d.unlike_witness_contrast, forbidden_generic_replacement: d.falsification_condition, target_native_region: (d.source_witness_pixel_regions || []).map((x) => `${x.witness.split("/").pop()}[${x.region_px}]`), method_output_digest: sha(JSON.stringify(d)) }); }
  const topics = Object.entries(design.construction_topics || {}).map(([k, v]) => ({ id: `topic:${k}`, kind: "TOPIC", operation: v.operation, visible_result: v.visible_result, grounded_by: v.methods }));
  const edges = topics.flatMap((t) => t.grounded_by.flatMap((m) => nodes.filter((n) => n.method_id === m).map((n) => ({ from: t.id, to: n.id }))));
  return { job: gate.job, family: gate.family, nodes, topics, edges };
}
