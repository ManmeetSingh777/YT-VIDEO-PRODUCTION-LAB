// Two-way art-to-motion contract — the gate BEFORE any image request (hybrid_v2/evidence/stage3_contract/ROOT_CAUSES_AND_CONTRACT.md).
// It does not add geometry. It checks that the ARTISTIC decisions are faithful to their source methods and grounded in attached witnesses,
// that the motion contract is delivered as requirements (what must articulate, separate, contact, turn, change expression) instead of
// shapes or coordinates, and that both contracts agree on view, alpha, scale, canonical pose, attachment semantics and motion states.
//   A method fidelity          — each binding carries the decision its own *Build* clause asks for (source hash pinned)
//   B applicability/molecular  — every method the family + motion contract makes applicable is bound; molecular block specific
//   C contract agreement       — view token, alpha, authoring resolution, canonical pose, joints/sockets, required states
//   D no rig-forced design     — high-impact construction decisions are grounded in an attached witness + unlike contrast; no rig coordinates
//   F design approval          — a HUMAN design receipt is required before submission (automation cannot approve)
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { stateIntervals } from "./asset_state.mjs";
import { verifyApproval, bundleHash, writeReceipt, attestHuman, testTrust } from "./approvals.mjs";
import { pregenAuditStatus } from "./pregen_audit.mjs";
import { rulesetVersion } from "./evaluation_identity.mjs";
import { verifyCompiled } from "../story/creative_adapter.mjs";
import { FAMILIES, resolveFamily, subjectFacts } from "./art_families.mjs";
import { applicability, operativeSha, RULES } from "./method_applicability.mjs";
import { validateRegions, witnessPath } from "./witness_regions.mjs";
import { projectionGrammar, cameraSizedArtworkDemand } from "./source_method_causality.mjs";
import { ev } from "./temporal.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const SRC = JSON.parse(fs.readFileSync(path.join(REPO, "engine", "methods", "source", "F_SOURCE.json"), "utf8"));
const f = (code, o = {}) => ({ code, ...o });

// The decisions each method's own *Build* clause requires (source text pinned by hash). Enumerations are the source's own labels.
export const METHOD_CONTRACTS = {
  F01: { asks: "silhouette and functional anatomy", keys: ["silhouette_masses", "functional_parts"] },
  F02: { asks: "surface-colour construction instead of line art", keys: ["surface_owners"] },
  F05: { asks: "human head and facial-state fabrication", keys: ["head_construction", "facial_states"] },
  F06: { asks: "whole gesture/support, task-specific hand art, contact graph, alternate drawings", keys: ["gesture_support", "contact_graph", "hand_states", "alternate_drawings"] },
  F52: { asks: "mark count from scale and semantic role", keys: ["projected_head_height_px", "mark_budget"] },
  F58: { asks: "silhouette before interior polish", keys: ["silhouette_test"] },
  F59: { asks: "parts join and occlude in a deliberate topology", keys: ["part_topology"] },
  F61: { asks: "conditional palette roles", keys: ["palette_roles"] },
  F62: { asks: "edges and shadows have owners", keys: ["edge_owners", "shadow_owners"] },
  F64: { asks: "identity routed by illustration family", keys: ["illustration_family", "canonical_identity"], enums: { illustration_family: ["ACTING_FACE", "GESTURE_FULL_BODY", "REAR_OR_OCCLUDED", "DISTANT_POPULATION", "ORGANISM_MACRO", "MASCOT_SYMBOLIC", "SPECIALIZED_GEAR"] },
    nested: { canonical_identity: ["head_outer_contour", "hair_silhouette", "eyes_visible_from_view", "neck_torso_garment", "near_far_arms", "hands", "legs_feet", "distinguishing_patches"] } },
  F65: { asks: "eye/mouth construction by role and crop", keys: ["face_eye_mode", "mouth_construction"], enums: { face_eye_mode: ["ANATOMICAL_SUBJECT", "WHITE_SCLERA_ACTOR", "DARK_MARK_ACTOR", "CLOSED_LID_ARC", "REDUCED_ICON", "HIDDEN_REAR"] } },
  F66: { asks: "weight, garment volumes and contact states", keys: ["pelvis_and_shoulder_axis", "weight_support", "garment_volumes", "hand_targets"] },
  F67: { asks: "expression and pose animation as a registered state family", keys: ["state_family", "registered_anchors"] },
  F79: { asks: "own the alpha, underpaint, parallax and offscreen budget", keys: ["alpha_mode", "underpaint_plan", "offscreen_extent"] },
  F80: { asks: "the first provider request contains the methods and unlike native pixels", keys: ["methods_in_request", "unlike_witnesses"] },
};
// keys that belong to exactly one method: a binding that answers another method's question is a mismatch, not extra detail
const OWNER = {}; for (const [m, c] of Object.entries(METHOD_CONTRACTS)) for (const k of c.keys) OWNER[k] ??= m;
const FAMILY_TO_F64 = { HUMAN_ACTING_CLOSE: "ACTING_FACE", HUMAN_GESTURE_FULL: "GESTURE_FULL_BODY", HUMAN_REAR_OCCLUDED: "REAR_OR_OCCLUDED", DISTANT_POPULATION: "DISTANT_POPULATION", MASCOT_SIMPLE: "MASCOT_SYMBOLIC", ANIMAL_OR_MACRO_BIO: "ORGANISM_MACRO" };
const FACELESS = new Set(["HUMAN_REAR_OCCLUDED", "DISTANT_POPULATION"]);
const nonEmpty = (v) => (typeof v === "string" ? v.trim().length > 0 : Array.isArray(v) ? v.length > 0 : v && typeof v === "object" ? Object.keys(v).length > 0 : v !== null && v !== undefined);

/** A — method fidelity */
export function validateBindings(design) {
  const out = [], views = [...(design.method_bindings || []), ...(design.method_decisions || []).map((d) => ({ method_id: d.method_id, decision: d.structured_decision || {}, conditions: d.applicability_evidence, source_clause_sha256: SRC[d.method_id]?.sha256 }))];
  const seen = new Set();
  for (const b of views) {
    if (seen.has(b.method_id) && !(design.method_bindings || []).length) continue; seen.add(b.method_id);
    const c = METHOD_CONTRACTS[b.method_id]; if (!c) continue; // methods outside this contract set are checked by the skill compiler only
    const d = b.decision || {};
    if (b.source_clause_sha256 !== SRC[b.method_id]?.sha256) out.push(f("METHOD_BINDING_MISMATCH", { method: b.method_id, reason: `binding does not pin the source clause of ${b.method_id} (${c.asks})` }));
    const missing = c.keys.filter((k) => !nonEmpty(d[k])); if (missing.length) out.push(f("METHOD_BINDING_MISMATCH", { method: b.method_id, reason: `${b.method_id} must decide ${missing.join(", ")} (${c.asks}); binding says "${b.conditions}"` }));
    const foreign = Object.keys(d).filter((k) => OWNER[k] && OWNER[k] !== b.method_id && !c.keys.includes(k)); if (foreign.length) out.push(f("METHOD_BINDING_MISMATCH", { method: b.method_id, reason: `${b.method_id} binding answers another method's question (${foreign.map((k) => `${k}→${OWNER[k]}`).join(", ")})` }));
    for (const [k, allowed] of Object.entries(c.enums || {})) if (d[k] !== undefined && !allowed.includes(d[k])) out.push(f("METHOD_BINDING_MISMATCH", { method: b.method_id, reason: `${k} "${d[k]}" is not one of the source's options ${allowed.join("/")}` }));
    for (const [k, keys] of Object.entries(c.nested || {})) { const miss = keys.filter((x) => !nonEmpty(d[k]?.[x])); if (d[k] && miss.length) out.push(f("METHOD_BINDING_MISMATCH", { method: b.method_id, reason: `${k} lacks ${miss.join(", ")}` })); }
  }
  return out;
}

/** motion facts about the identity this master defines (from the action graph, not from shapes) */
export function motionFacts({ job, doc }) {
  const id = job.identity_id, rigs = doc.rigs.filter((r) => r.identity_id === id), rigIds = new Set(rigs.map((r) => r.id)), iv = stateIntervals(doc).filter((x) => rigIds.has(x.rig));
  const states = new Set(), contacts = [], views = new Set();
  for (const x of iv) { if (x.pose) states.add(x.pose); views.add(x.facing); for (const c of x.contacts) if (c.source_rig && rigIds.has(c.source_rig)) contacts.push(c.contact_type); }
  for (const a of doc.actions) for (const ve of a.view_events) if (rigs.some((r) => [...r.view_states].some((s) => s.id === ve.to_state))) states.add(ve.to_state);
  const rest = rigs[0]?.pose_states[0] || null;
  return { identity: doc.identities.find((i) => i.id === id), rigs, states: [...states], views: [...views], contacts: [...new Set(contacts)], joints: rigs.flatMap((r) => r.joints.map((j) => j.id)), sockets: rigs.flatMap((r) => r.sockets.map((s) => s.id)), rest_state: rest?.id ?? null, rest_view: rest?.view_facing ?? null, expression_states: [...states].filter((s) => /curious|satisfied|smile|surprise|sad|angry|expression/i.test(s)) };
}

/** B — applicability (universal): all 80 source rules evaluated over the subject's facts; returns the REQUIRED rows with reasons.
 *  Throws UNSUPPORTED_ART_FAMILY when the design declares no registered family (there is no default). */
export function requiredMethods({ design, job, doc, plan }) { return applicability(subjectFacts({ design, job, doc, plan })).filter((r) => r.required).map((r) => ({ method: r.method, reason: r.reason, role: r.role, phase: r.phase })); }

const PLACEHOLDER = [/USE F57.F80 METHOD ROUTING/i, /whatever the model chooses/i, /\bSAME AS\b/, /which compositional construction would prove this/i, /actual name/i, /id from subject_graph/i, /FLAT_ORTHO\/OBLIQUE\/etc/i, /what unlike source prevents/i, /literal changed shape\/contact visible to viewer/i, /^\s*\[.*\]\s*$/, /TODO|TBD|lorem/i];
/** B — molecular construction decisions are mandatory and specific */
export function validateMolecular(design, job) {
  const m = design.molecular_visual_decisions;
  if (!m) return [f("MOLECULAR_DECISIONS_MISSING", { reason: "molecular_visual_decisions is absent: the highest-impact construction decisions are unspecified" })];
  const keys = ["highest_impact_question", "chosen_methods", "positive_source_contrast", "contradicting_source_case", "primary_proof", "topology_and_projections", "color_and_surface_owners", "density_budget_by_region", "animation_ancestry", "specific_generational_exclusions", "falsification_test"], out = [];
  const miss = keys.filter((k) => !nonEmpty(m[k])); if (miss.length) out.push(f("MOLECULAR_DECISIONS_MISSING", { reason: `missing ${miss.join(", ")}` }));
  const texts = JSON.stringify(m); if (PLACEHOLDER.some((re) => re.test(texts)) || Object.values(m).some((v) => typeof v === "string" && PLACEHOLDER.some((re) => re.test(v)))) out.push(f("MOLECULAR_DECISIONS_PLACEHOLDER", { reason: "molecular block contains schema/placeholder text instead of decisions for this identity" }));
  const bound = new Set([...(design.method_bindings || []), ...(design.method_decisions || [])].map((b) => b.method_id)); const strays = (m.chosen_methods || []).filter((x) => !bound.has(x)); if (strays.length) out.push(f("MOLECULAR_DECISIONS_MISSING", { reason: `chosen_methods ${strays} are not bound` }));
  if (m.animation_ancestry?.canonical_master_id && m.animation_ancestry.canonical_master_id !== job.root_dependency) out.push(f("MOLECULAR_DECISIONS_MISSING", { reason: `animation_ancestry names ${m.animation_ancestry.canonical_master_id}, not ${job.root_dependency}` }));
  return out;
}

/** largest on-screen height the identity reaches while its actions are on screen (authoring resolution must not be smaller) */
export function requiredFigureHeightPx({ job, doc, motionPlans = {} }) {
  const mf = motionFacts({ job, doc }), L = Object.values(mf.identity?.landmarks || {}); if (!L.length) return null;
  const ys = L.map((p) => p[1]), ref = mf.identity.on_stage_reference, h = mf.identity.geometry_status === "UNMEASURED" ? (ref ? (ref.measure === "figure_height_px" ? ref.px : 0) : mf.identity.on_stage_height_px ?? 0) : (Math.max(...ys) - Math.min(...ys)) * 1.12; let best = 0; // P05: before measurement the directed on-stage height is the requirement
  for (const a of doc.actions) for (const act of a.actors) { if (!mf.rigs.some((r) => r.id === act.rig_id)) continue; const shot = doc.shots.find((s) => s.id === a.shot_id), cam = motionPlans[shot.id]?.cameras?.[shot.camera_track_id]?.zoom, z = cam ? Math.max(...cam.filter((k) => k[0] >= a.frame_range[0] && k[0] < a.frame_range[1] - 120).map((k) => k[1]), cam[0][1]) : 1; best = Math.max(best, h * (act.root_scale ?? 1) * z); }
  return best > 0 ? Math.ceil(best) : null; // a head-height reference states no figure height: unknown until the landmarks are measured
}

/** C — artistic and motion contracts agree */
export function validateAgreement({ design, job, doc, motionPlans }) {
  const out = [], cd = design.first_pass_control?.character_designs?.[0] || {}, mf = motionFacts({ job, doc }), mc = job.motion_context;
  if (cd.view_id !== mc.view_id) out.push(f("CONTRACT_VIEW_MISMATCH", { reason: `design view_id ${cd.view_id ?? "(prose only)"} ≠ motion view_id ${mc.view_id}` }));
  if (mf.rest_view && mc.view_id !== mf.rest_view) out.push(f("CONTRACT_VIEW_MISMATCH", { reason: `motion view ${mc.view_id} ≠ the rig's canonical rest view ${mf.rest_view}` }));
  if (design.output?.alpha_mode !== mc.alpha_requirement) out.push(f("CONTRACT_ALPHA_MISMATCH", { reason: `design output alpha ${design.output?.alpha_mode} ≠ motion alpha ${mc.alpha_requirement}` }));
  const need = requiredFigureHeightPx({ job, doc, motionPlans }); if (need && !(design.output?.figure_height_px >= need)) out.push(f("CONTRACT_SCALE_MISMATCH", { reason: `figure authored at ${design.output?.figure_height_px ?? "?"} px but the action graph shows it up to ${need} px on screen` }));
  if (mf.rest_state && cd.canonical_pose !== mf.rest_state) out.push(f("CONTRACT_POSE_MISMATCH", { reason: `canonical pose ${cd.canonical_pose} ≠ rig rest state ${mf.rest_state}` }));
  const att = design.motion_requirements?.attachment_semantics || {}, mj = mf.joints.filter((j) => !nonEmpty(att[j])); if (mj.length) out.push(f("CONTRACT_INTERFACE_MISSING", { reason: `attachment semantics missing for joints ${mj.join(", ")}` }));
  const ms = mf.sockets.filter((s) => !nonEmpty(design.motion_requirements?.contact_semantics?.[s])); if (ms.length) out.push(f("CONTRACT_INTERFACE_MISSING", { reason: `contact semantics missing for sockets ${ms.join(", ")}` }));
  const sf = new Set(cd.state_family || []), missS = mf.states.filter((s) => !sf.has(s)); if (missS.length) out.push(f("CONTRACT_STATE_MISSING", { reason: `state_family lacks states the action graph shows: ${missS.join(", ")}` }));
  if (FACELESS.has(cd.family) && (mf.expression_states.length || mf.views.some((v) => v !== "rear"))) out.push(f("FAMILY_INCOMPATIBLE_WITH_MOTION", { reason: `${cd.family} cannot carry expression states ${mf.expression_states.join(", ")} / visible-face views the action graph requires` }));
  const f64 = (design.method_bindings || []).find((b) => b.method_id === "F64") || ((d) => d && { decision: d.structured_decision })((design.method_decisions || []).find((d) => d.method_id === "F64")); if (f64?.decision?.illustration_family && FAMILY_TO_F64[cd.family] && f64.decision.illustration_family !== FAMILY_TO_F64[cd.family]) out.push(f("METHOD_BINDING_MISMATCH", { method: "F64", reason: `F64 family ${f64.decision.illustration_family} ≠ character family ${cd.family}` }));
  return out;
}

const GROUNDED_PATHS = [["silhouette", "outline_path"], ["head", "skull_contour"], ["head", "hair_outer_path"], ["face", "eye_regions"], ["body", "garment_masses"], ["body", "hand_construction"]];
const RIG_WORDS = /\b(joint|pivot|rig|socket|rest_xy|skeleton|bone)\b/i;
/** D — artistic decisions grounded in attached witnesses; motion belongs to motion_requirements, never to shape decisions */
export function validateGrounding(design, job, doc) {
  const out = [], cd = design.first_pass_control?.character_designs?.[0] || {}, g = design.design_grounding || {}, refs = new Set((design.first_pass_control?.references || []).map((r) => r.path));
  const lmNums = new Set(Object.values(doc.identities.find((i) => i.id === job.identity_id)?.landmarks || {}).flat().map((v) => String(v)));
  for (const [a, b] of GROUNDED_PATHS) {
    const key = `${a}.${b}`, val = cd[a]?.[b], gr = g[key];
    if (!gr || !refs.has(gr.witness) || !nonEmpty(gr.observation) || !nonEmpty(gr.unlike_contrast) || !nonEmpty(gr.identity_reason)) out.push(f("UNGROUNDED_DESIGN_DECISION", { field: key, reason: `${key} is not grounded in an attached witness observation + unlike contrast + identity reason` }));
    const txt = JSON.stringify(val ?? ""); if (RIG_WORDS.test(txt)) out.push(f("RIG_FORCED_GEOMETRY", { field: key, reason: `${key} mentions rig mechanics; motion needs belong in motion_requirements, not in the artistic shape` }));
    if ((txt.match(/-?\d+(\.\d+)?/g) || []).some((n) => lmNums.has(n) && Math.abs(+n) > 20)) out.push(f("RIG_FORCED_GEOMETRY", { field: key, reason: `${key} contains provisional rig coordinates` }));
  }
  return out;
}

/* ───────────── universal contract (system-correction directive E1/E2/N3) ───────────── */
const P = "engine/art_bridge/art_contract.mjs";
const DECISION_FIELDS = ["applicability_evidence", "question_from_build_clause", "specific_decision", "visible_construction_operation", "input_dependencies", "output_art_components", "falsification_condition", "unlike_witness_contrast"];
// phases whose operation shapes provider pixels: the art director must author a complete RequiredDesignDecision with witness regions.
// ENGINE/REVIEW-phase methods are executed by registered engine consumers (source_method_causality.mjs) and evidenced by consumer receipts.
const AUTHORED_PHASES = new Set(["STRUCTURE", "SURFACE", "STATE"]);
const hasPlaceholder = (v) => PLACEHOLDER.some((re) => re.test(typeof v === "string" ? v : JSON.stringify(v)));
export const STATE_KINDS = ["MASTER", "PART_OR_STATE", "UNDERPAINT", "WORLD_EXTENSION", "TRANSITION_PLATE", "EFFECT_STATE", "SYMBOL", "TYPE", "MASK", "CLEAN_PLATE"];
export const REPRESENTATIONS = ["RIGID", "ARTICULATED", "REGISTERED_CELS", "REGISTERED_MORPH", "EXPLICIT_DEFORM", "PROCEDURAL", "CAMERA_WORLD", "TRANSITION"];

// a decision built only from stock primitives (the class behind "cabinet box → door ring (circle) → glass disc", oval heads, tube limbs)
const PRIMS = /\b(box|boxes|circle|circles|disc|disk|oval|ovals|tube|tubes|capsule|capsules|rectangle|rectangles|cylinder|sphere|ring|egg)\b/gi;
const FUNCTION_WORDS = /\b(hinge|axis|axle|seal|gasket|bezel|aperture|recess|plate|port|handle|latch|cuff|sleeve|thumb|palm|skull|jaw|brow|lid|pupil|garment|fold|overlap|parent|join|plane|projection|root|branch|trunk|valve|flow|label|unit|owner|silhouette|weight|support|contact|witness)\b/i;
export function isGenericPrimitive(text) { const prims = (String(text).match(PRIMS) || []).length; return prims >= 2 && !FUNCTION_WORDS.test(String(text)); }

/** RequiredDesignDecision validation: every applicable authored method has a complete, specific, source-pinned decision with witness regions */
export function validateMethodDecisions(design, req) {
  const out = [], by = new Map((design.method_decisions || []).map((d) => [d.method_id, d])), refs = design.first_pass_control?.references || [], reqIds = new Set(req.map((r) => r.method));
  for (const r of req.filter((x) => AUTHORED_PHASES.has(x.phase))) {
    const d = by.get(r.method);
    if (!d) { out.push(f("MISSING_APPLICABLE_METHOD", { method: r.method, reason: `${r.reason}: no RequiredDesignDecision` })); continue; }
    if (d.source_clause_sha256 !== SRC[r.method].sha256) out.push(f("METHOD_BINDING_MISMATCH", { method: r.method, reason: "decision does not pin the verbatim source clause hash" }));
    const miss = DECISION_FIELDS.filter((k) => !nonEmpty(d[k])); if (miss.length) out.push(f("ART_DESIGN_UNSPECIFIED", { method: r.method, reason: `RequiredDesignDecision lacks ${miss.join(", ")}` }));
    if (hasPlaceholder(d)) out.push(f("ART_DESIGN_UNSPECIFIED", { method: r.method, reason: "decision contains placeholder / pointer text instead of an operation" }));
    if (typeof d.visible_construction_operation === "string" && d.visible_construction_operation.trim().length < 24) out.push(f("ART_DESIGN_UNSPECIFIED", { method: r.method, reason: "visible_construction_operation is a phrase, not an operation with an inspectable result" }));
    if (d.consumer_receipt !== undefined) out.push(f("ART_DESIGN_UNSPECIFIED", { method: r.method, reason: "consumer_receipt is produced by the engine, never authored" }));
    if (isGenericPrimitive(`${d.specific_decision} ${d.visible_construction_operation}`)) out.push(f("GENERIC_PRIMITIVE_DESIGN", { method: r.method, reason: "decision is a chain of stock primitives (box/circle/oval/tube…) with no functional, material or source-grounded construction" }));
    out.push(...validateRegions(d, refs, REPO).map((x) => f(x.code, x)));
  }
  // a decision for a method whose predicate does not hold is a leak (e.g. a garment/face rule bound to a machine or a leaf)
  for (const d of design.method_decisions || []) if (!reqIds.has(d.method_id)) out.push(f("METHOD_NOT_APPLICABLE", { method: d.method_id, reason: `decision supplied for ${d.method_id}, whose source condition does not hold for this subject` }));
  return out;
}
/** family construction topics: each answered with an operation + visible result, grounded by required methods */
export function validateTopics(design, facts, req) {
  const out = [], t = design.construction_topics || {}, reqIds = new Set(req.map((r) => r.method));
  for (const k of facts.topics) { const v = t[k];
    if (!v || !nonEmpty(v.operation) || !nonEmpty(v.visible_result) || !Array.isArray(v.methods) || !v.methods.length) { out.push(f("ART_DESIGN_UNSPECIFIED", { field: `construction_topics.${k}`, reason: `${facts.family} topic ${k} needs {operation, visible_result, methods}` })); continue; }
    if (hasPlaceholder(v)) out.push(f("ART_DESIGN_UNSPECIFIED", { field: `construction_topics.${k}`, reason: "placeholder text" }));
    const stray = v.methods.filter((m) => !reqIds.has(m)); if (stray.length) out.push(f("METHOD_NOT_APPLICABLE", { field: `construction_topics.${k}`, reason: `topic grounded by non-applicable methods ${stray}` })); }
  return out;
}
/** fixedFrameRig: a rig with no degree of freedom (one root joint locked at 0° and scale 1, a single pose, no views, channels or state edges).
 *  It only carries sockets/landmarks in its identity's frame; it is not an articulated subject. Any freedom at all makes it articulated. */
export function fixedFrameRig(r) {
  const j = r.joints || [], locked = (x) => !x || (Array.isArray(x) && x.length === 2 && x[0] === x[1]);
  return j.length === 1 && j[0].parent_id == null && locked(j[0].rotation_limits_deg) && (j[0].rotation_limits_deg?.[0] ?? 0) === 0 && locked(j[0].scale_limits) && (j[0].scale_limits?.[0] ?? 1) === 1
    && (r.pose_states || []).length <= 1 && !(r.view_states || []).length && !(r.state_channels || []).length && !(r.allowed_state_edges || []).length && !(r.constraints || []).length;
}
/** ArtMotionAgreement for non-human families (humans use the character layout in validateAgreement) */
export function validateAgreementUniversal({ design, job, doc, facts, motionPlans }) {
  if (facts.human) return validateAgreement({ design, job, doc, motionPlans });
  const out = [], mc = job.motion_context || {}, ag = design.art_motion_agreement || {}, mr = design.motion_requirements || {};
  if (mc.view_id && ag.view_id !== mc.view_id) out.push(f("CONTRACT_VIEW_MISMATCH", { reason: `design view ${ag.view_id ?? "(undeclared)"} ≠ motion view ${mc.view_id}` }));
  if (design.output?.alpha_mode !== mc.alpha_requirement) out.push(f("CONTRACT_ALPHA_MISMATCH", { reason: `design alpha ${design.output?.alpha_mode} ≠ motion alpha ${mc.alpha_requirement}` }));
  if (!REPRESENTATIONS.includes(ag.motion_representation)) out.push(f("CONTRACT_REPRESENTATION_MISSING", { reason: `motion_representation must be one of ${REPRESENTATIONS.join("/")}` }));
  else { const moving = (doc.rigs || []).filter((r) => facts.rigs.includes(r.id) && !fixedFrameRig(r)).map((r) => r.id); // a zero-freedom rig is only a socket frame (e.g. a world's support surface)
    if (moving.length && !["ARTICULATED", "REGISTERED_CELS", "EXPLICIT_DEFORM"].includes(ag.motion_representation)) out.push(f("CONTRACT_REPRESENTATION_MISSING", { reason: `rigged identity (${moving}) cannot be ${ag.motion_representation}` })); }
  const mj = facts.joints.filter((j) => !nonEmpty(mr.attachment_semantics?.[j])); if (mj.length) out.push(f("CONTRACT_INTERFACE_MISSING", { reason: `attachment semantics missing for ${mj.join(", ")}` }));
  const ms = facts.sockets.filter((s) => !nonEmpty(mr.contact_semantics?.[s])); if (ms.length) out.push(f("CONTRACT_INTERFACE_MISSING", { reason: `contact semantics missing for ${ms.join(", ")}` }));
  const sf = new Set(ag.state_family || []), missS = facts.states.filter((s) => !sf.has(s)); if (missS.length) out.push(f("CONTRACT_STATE_MISSING", { reason: `state_family lacks ${missS.join(", ")}` }));
  const w = (doc.worlds || []).find((x) => x.canonical_asset_id === job.root_dependency || x.identity_id === job.identity_id), ov = w?.overscan_rect;
  if (ov && !(design.output?.canonical_coverage_rect && design.output.canonical_coverage_rect[2] >= ov[2] && design.output.canonical_coverage_rect[3] >= ov[3])) out.push(f("CONTRACT_SCALE_MISMATCH", { reason: `world overscan ${ov} not covered by authored canonical_coverage_rect ${design.output?.canonical_coverage_rect}` }));
  if (!(design.output?.authored_width_px > 0 && design.output?.authored_height_px > 0)) out.push(f("CONTRACT_SCALE_MISMATCH", { reason: "authored pixel size undeclared" }));
  if (facts.world) {
    // F38/F60: the declared projection grammar is enforced on every plane
    if (!design.projection?.proof_projection) out.push(f("ART_DESIGN_UNSPECIFIED", { method: "F38", reason: "world design declares no proof_projection/planes" }));
    else { const pg = projectionGrammar(design.projection); for (const v of pg.violations) out.push(f("PROJECTION_GRAMMAR_VIOLATION", { method: "F60", reason: `${v.plane ?? "(world)"}: ${v.reason}` })); }
    // F55: the authored plate covers every inverse camera footprint of the shots that show it (cameras from the motion plans)
    for (const sh of doc.shots.filter((s) => s.world_id && (w ? s.world_id === w.id : false) && s.camera_track_id)) { const cam = motionPlans?.[sh.id]?.cameras?.[sh.camera_track_id]; if (!cam) continue;
      const frames = []; for (let fr = sh.start_frame; fr < sh.end_frame; fr += 6) frames.push(fr);
      const dem = cameraSizedArtworkDemand({ camera: (fr) => ({ x: ev(cam.x, fr), y: ev(cam.y, fr), zoom: ev(cam.zoom, fr) }), frames }), cov = design.output?.canonical_coverage_rect, ok = cov && cov[0] <= dem.canonical_coverage_rect[0] && cov[1] <= dem.canonical_coverage_rect[1] && cov[0] + cov[2] >= dem.canonical_coverage_rect[0] + dem.canonical_coverage_rect[2] && cov[1] + cov[3] >= dem.canonical_coverage_rect[1] + dem.canonical_coverage_rect[3];
      if (!ok) out.push(f("CONTRACT_SCALE_MISMATCH", { method: "F55", reason: `shot ${sh.id} camera needs ${JSON.stringify(dem.canonical_coverage_rect)} at ≥${dem.min_density_px_per_unit} px/unit; design covers ${JSON.stringify(cov)}` })); }
  }
  return out;
}

/** the BEFORE gate — universal over all families. Never returns NOT_EVALUATED: a context/family failure is a failure row. */
export function preGenerationGate({ design, job, doc, plan, motionPlans = {}, film = null, pregenAudit = undefined }) { // pregenAudit: an in-memory audit evaluated INSTEAD of the film file (same validation; nothing is waived)
  const failures = []; let facts = null, table = [], req = [];
  try { facts = subjectFacts({ design, job, doc, plan }); table = applicability(facts); req = table.filter((r) => r.required).map((r) => ({ method: r.method, reason: r.reason, role: r.role, phase: r.phase })); }
  catch (e) { failures.push(f(e.code || "UNSUPPORTED_ART_FAMILY", { reason: e.human_readable_reason || e.message })); }
  if (facts && !req.length) failures.push(f("ZERO_REQUIRED_METHODS", { reason: "no source method applies: the subject is unspecified" }));
  failures.push(...validateBindings(design), ...validateMolecular(design, job));
  if (facts) {
    failures.push(...validateMethodDecisions(design, req), ...validateTopics(design, facts, req), ...validateAgreementUniversal({ design, job, doc, facts, motionPlans }));
    if (facts.family === "ACTING_HUMAN") failures.push(...validateGrounding(design, job, doc));
  }
  // P07: a new canonical master needs its ten bound, substantive pre-generation passes before the first image (diagnostic namespaces: reported, not required)
  const pregen = pregenAuditStatus({ film, design, isMaster: !job.derived_from, audit: pregenAudit }); failures.push(...pregen.failures.map((e) => f(e.code, { reason: e.human_readable_reason, field: e.failed_invariant })));
  const report = { job: job.artjob_id, design: design.job_id ?? null, family: facts?.family ?? null, pass: failures.length === 0, status: failures.length ? "REFUSED" : "PASS", failures, required_methods: req, applicability_table: table,
    required_figure_height_px: facts?.human ? requiredFigureHeightPx({ job, doc, motionPlans }) : null, design_sha256: bundleHash(design), pregen_audit: { status: pregen.status, sha256: pregen.sha256 ?? null }, checked_at: new Date().toISOString() };
  report.design_approval = report.pass ? designApprovalStatus({ film, doc, design, report }) : { status: "NOT_ELIGIBLE", reason: "automated gate failed" };
  return report;
}
export function assertGate(report) { if (!report || report.pass !== true) throw err("ART_CONTRACT_REFUSED", { record_id: report?.job, reason: `pre-generation contract refused: ${(report?.failures || [{ code: "NO_REPORT" }]).map((x) => `${x.code}${x.method ? ":" + x.method : ""}`).join(", ")}`, details: { failures: report?.failures || [] }, producer: `${P}#preGenerationGate`, failed_invariant: "every applicable source method is decided specifically and the art/motion contracts agree", repair_owner: "SOURCE_TO_ART_COMPILER", resume_at: "ART_DESIGN_COMPILATION" }); return true; }

/** F — design approval: HUMAN receipt over the exact design + gate result + witness regions (the reviewer attests the regions show the claims) */
export function designBundle(design, report) {
  const regions = (design.method_decisions || []).flatMap((d) => (d.source_witness_pixel_regions || []).map((r) => ({ method: d.method_id, witness: r.witness, region_px: r.region_px, witness_sha256: witnessPath(r.witness) ? crypto.createHash("sha256").update(fs.readFileSync(witnessPath(r.witness))).digest("hex") : null, observation: r.observation })));
  return { scope: "design", id: design.job_id, design_sha256: bundleHash(design), ...(report.pregen_audit?.sha256 ? { pregen_audit_sha256: report.pregen_audit.sha256 } : {}), family: report.family ?? null, gate: { pass: report.pass, failures: report.failures.length, required_methods: report.required_methods.map((x) => x.method) }, ruleset_version: rulesetVersion(), witness_regions: regions };
}
export function designApprovalStatus({ film, doc, design, report }) {
  const ptrF = film && path.join(film, "art_designs", `${design.job_id}.APPROVAL_POINTER.json`), ptr = ptrF && fs.existsSync(ptrF) ? JSON.parse(fs.readFileSync(ptrF, "utf8")).receipt_id : null;
  const v = verifyApproval(doc, film, "design", design.job_id, ptr, { requireHuman: true, bundle: designBundle(design, report) });
  return v.ok ? { status: "DESIGN_APPROVED", receipt: ptr, reviewer_kind: v.reviewer_kind } : { status: "BLOCKED_ON_DESIGN_APPROVAL", reason: ptr ? v.reason : "no human design approval receipt" };
}

const designFile = (FILM, id) => path.join(FILM, "art_designs", `${id}.design.json`);
const readJ = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
function loadMotionPlans(FILM) { const H = path.join(FILM, "handoff"), out = {}; for (const x of fs.readdirSync(H)) { const m = x.match(/^MOTION_PLAN_(.+)\.json$/); if (m) out[m[1]] = readJ(path.join(H, x)); } return out; }

/** resolveContractContext({film, doc, job}) → {ok:true, context} | {ok:false, error}. Every state kind of every family resolves or fails typed. */
export function resolveContractContext({ film, doc = null, job }) {
  const E = (reason, extra = {}) => ({ ok: false, error: { code: "ART_CONTRACT_NOT_EVALUATED", record_id: job?.artjob_id ?? null, reason, producer: `${P}#resolveContractContext`, failed_invariant: "every production request has an evaluated typed design contract", repair_owner: "SOURCE_TO_ART_COMPILER", resume_at: "ART_DESIGN_COMPILATION", frame_ranges: job?.motion_context?.frame_ranges || [], ...extra } });
  if (!film || !fs.existsSync(film)) return E("no film root to evaluate the contract against");
  const FILM = path.resolve(film); doc ||= readJ(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
  if (!job?.artjob_id || !job.state_kind) return E("job lacks artjob_id/state_kind");
  if (!STATE_KINDS.includes(job.state_kind)) return E(`unsupported state_kind ${job.state_kind}`);
  const identity = doc.identities.find((i) => i.id === (job.identity_id || job.motion_context?.identity_id)); if (!identity) return E(`identity ${job.identity_id} not in the manifest`, { dependency_ids: [job.identity_id] });
  if (!job.motion_context) return E("job has no motion context");
  if ((job.triggered_by || []).some((t) => t.frame_range) && !(job.motion_context.frame_ranges || []).length) return E("motion context lost the frame ranges its triggers name");
  if (!job.medium?.medium) return E("job has no movement representation / medium route");
  const masterId = identity.canonical_asset_id, designRef = designFile(FILM, masterId);
  if (!fs.existsSync(designRef)) return E(`no design for master ${masterId}`, { required_art_or_operation: [`author art_designs/${masterId}.design.json`] });
  const plan = readJ(path.join(FILM, "handoff", "ART_DEPENDENCY_PLAN.json")), derived = job.state_kind !== "MASTER" || job.root_dependency !== masterId;
  let stateContract = null;
  if (derived) { const p = plan.assets.find((a) => a.asset_id === job.root_dependency);
    if (!p) return E(`derived job ${job.root_dependency} has no plan entry`);
    if (p.derived_from !== masterId) return E(`derived job ${job.root_dependency} lineage ${p.derived_from} ≠ approved master ${masterId}`);
    const miss = ["view_id", "alpha_mode"].filter((k) => !p[k]); if (miss.length) return E(`derived state contract lacks ${miss}`);
    stateContract = { asset_id: p.asset_id, kind: p.kind, view_id: p.view_id, pose_id: p.pose_id, expression_id: p.expression_id, joint_id: p.joint_id, alpha_mode: p.alpha_mode, hidden_surfaces: p.hidden_surfaces || [], surface_underpaint: p.surface_underpaint || {}, derived_from: p.derived_from }; }
  return { ok: true, context: { film: FILM, doc, plan, motionPlans: loadMotionPlans(FILM), designRef, masterId, derived, stateContract } };
}
/** deprecated name kept for callers: returns the context or THROWS (never null) */
export function contractContext(FILM, doc, j) { const r = resolveContractContext({ film: FILM, doc, job: j }); if (!r.ok) throw err(r.error.code, r.error); const { designRef, masterId, derived, stateContract, ...ctx } = r.context; return ctx; }

/** gateForJob({film, doc, job, masterJob}) → always a report (never null). Derived jobs are gated by the master design (with the master job's
 *  motion context) PLUS their own state contract and master lineage. */
export function gateForJob({ film, doc = null, job, masterJob = null }) {
  const r = resolveContractContext({ film, doc, job });
  if (!r.ok) return { job: job?.artjob_id ?? null, pass: false, status: "REFUSED", failures: [f(r.error.code, { reason: r.error.reason })], required_methods: [], design_approval: { status: "NOT_ELIGIBLE", reason: r.error.reason } };
  const c = r.context, design = readJ(c.designRef), gateJob = c.derived ? masterJob : job;
  if (c.derived && !gateJob) return { job: job.artjob_id, pass: false, status: "REFUSED", failures: [f("ART_CONTRACT_NOT_EVALUATED", { reason: "derived job gated without its master job" })], required_methods: [], design_approval: { status: "NOT_ELIGIBLE" } };
  const g = preGenerationGate({ design, job: gateJob, doc: c.doc, plan: c.plan, motionPlans: c.motionPlans, film: c.film });
  if (c.derived) { const sf = new Set(design.art_motion_agreement?.state_family || design.first_pass_control?.character_designs?.[0]?.state_family || []), sc = c.stateContract, need = [sc.pose_id, sc.expression_id].filter(Boolean).filter((s) => !sf.has(s));
    if (need.length) { g.failures.push(f("CONTRACT_STATE_MISSING", { reason: `derived state ${sc.asset_id} needs ${need} absent from the approved master's state family` })); g.pass = false; g.status = "REFUSED"; }
    g.state_contract = sc; g.job = job.artjob_id; g.master_job = gateJob.artjob_id; }
  return g;
}

/* story / direction approvals — bound to the CONTENT of the story and direction files; never inferred from doc.status, filenames, env or flags */
const FILES = { story: ["direction/EXPERIENCE_DIRECTOR_PROPOSAL.md", "story/STORY_CONTRACT.json"], direction: ["direction/SHOT_SCORE_60FPS.json", "story/ACTION_COVERAGE.json", "story/EXPERIENCE_CONTRACT.json", "direction/DIRECTION_DECISIONS.json", "story/SEMANTIC_ACTIONS.json", "story/ACTION_PHRASES.json", "handoff/ART_AND_MOTION_MANIFEST_V2.json#actions,shots,transitions"] };
export function scopeBundle(FILM, scope) {
  const files = {};
  for (const spec of FILES[scope]) { const [rel, keys] = spec.split("#"), fp = path.join(FILM, rel); if (!fs.existsSync(fp)) { files[rel] = null; continue; }
    if (keys) { const j = readJ(fp); files[spec] = bundleHash(Object.fromEntries(keys.split(",").map((k) => [k, j[k]]))); } else files[rel] = crypto.createHash("sha256").update(fs.readFileSync(fp)).digest("hex"); }
  return { scope, id: path.basename(FILM), files };
}
/** P05: one human decision over the exact creative packet covers the story and direction it compiles to — only while every compiled input still equals it */
const packetAuthority = (FILM) => (fs.existsSync(path.join(FILM, "creative", "CURRENT.json")) ? verifyCompiled(FILM) : null);
const ptrFile = (FILM, scope) => path.join(FILM, "approvals", `${scope.toUpperCase()}.POINTER.json`);
export function scopeApprovalStatus(FILM, doc, scope) { const cv = packetAuthority(FILM); if (cv?.ok) return { ok: true, status: "APPROVED", reason: null, reviewer_kind: cv.reviewer_kind, receipt: cv.receipt, via: `creative_packet ${cv.packet_sha256.slice(0, 16)}` }; const pf = ptrFile(FILM, scope), ptr = fs.existsSync(pf) ? readJ(pf).receipt_id : null; const v = verifyApproval(doc, FILM, scope, path.basename(FILM), ptr, { requireHuman: true, bundle: scopeBundle(FILM, scope) }); return { ok: v.ok, status: v.ok ? "APPROVED" : ptr ? v.status : "NO_RECEIPT", reason: v.ok ? null : ptr ? v.reason : `no human ${scope} approval receipt`, reviewer_kind: v.reviewer_kind || null, receipt: ptr }; }
/** approveScope({film, scope:"story"|"direction", ...}) — a human decision over the exact story/direction content (TTY attestation for HUMAN) */
export async function approveScope({ film, scope, reviewer, verdict, notes = "", human = false, attestation = null }) {
  if (!FILES[scope]) throw new Error(`unknown approval scope ${scope}`);
  const FILM = path.resolve(film), doc = readJ(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), bundle = scopeBundle(FILM, scope);
  if (verdict === "APPROVED" && scope === "story" && !bundle.files["story/STORY_CONTRACT.json"]) throw err("FACT_CHECK_REQUIRED", { record_id: bundle.id, reason: "a story cannot be approved without a compiled story contract (claims, mechanisms, obstacles)", producer: `${P}#approveScope`, resume_at: "STORY_CONTRACT_COMPILATION" });
  const att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null);
  const r = writeReceipt(FILM, doc, { scope, id: bundle.id, reviewer, verdict, notes, attestation: att, bundle, evidence: Object.keys(bundle.files) });
  fs.mkdirSync(path.join(FILM, "approvals"), { recursive: true }); const pf = ptrFile(FILM, scope);
  if (verdict === "APPROVED") fs.writeFileSync(pf, JSON.stringify({ receipt_id: r.receipt_id }, null, 1)); else fs.rmSync(pf, { force: true });
  return { scope, verdict, receipt_id: r.receipt_id, reviewer_kind: r.reviewer_kind, status: scopeApprovalStatus(FILM, doc, scope) };
}

/** approveDesign — explicit art-director decision on a design that PASSED the automated gate, for ANY family (HUMAN only via TTY attestation) */
export async function approveDesign({ film, doc, job, masterJob = null, reviewer, verdict, notes = "", scope_note = "", human = false, attestation = null }) {
  const FILM = path.resolve(film), report = gateForJob({ film: FILM, doc, job, masterJob });
  const r0 = resolveContractContext({ film: FILM, doc, job }); if (!r0.ok) throw err(r0.error.code, r0.error);
  if (r0.context.derived) throw new Error(`${job.artjob_id} is a derived state: design approval covers its master ${r0.context.masterId}`);
  const design = readJ(r0.context.designRef);
  if (verdict === "APPROVED" && !report.pass) throw err("ART_CONTRACT_REFUSED", { record_id: design.job_id, reason: "a design that fails the automated contract cannot be approved", details: { failures: report.failures }, producer: `${P}#approveDesign` });
  const bundle = designBundle(design, report), att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null);
  const rr = writeReceipt(FILM, doc, { scope: "design", id: design.job_id, reviewer, verdict, notes, scope_note, attestation: att, bundle, evidence: [`art_designs/${design.job_id}.design.json`] });
  const ptr = path.join(FILM, "art_designs", `${design.job_id}.APPROVAL_POINTER.json`);
  if (verdict === "APPROVED") fs.writeFileSync(ptr, JSON.stringify({ receipt_id: rr.receipt_id, reviewer_kind: rr.reviewer_kind }, null, 1)); else fs.rmSync(ptr, { force: true });
  return { verdict, receipt_id: rr.receipt_id, reviewer_kind: rr.reviewer_kind, design_approval: designApprovalStatus({ film: FILM, doc, design, report }) };
}

/** requireApprovedContract — the ONE production authority check (directive E2 / N3 precedence). Throws the FIRST missing authority.
 *  allowTestTrust: only the loopback TEST_STUB path may pass test-trusted receipts; it can never reach a real provider. */
export function requireApprovedContract({ film, doc = null, job, masterJob = null, requestHash = null, allowTestTrust = false }) {
  const T = (code, reason, extra = {}) => { throw err(code, { record_id: job?.artjob_id, reason, producer: `${P}#requireApprovedContract`, frame_ranges: job?.motion_context?.frame_ranges || [], ...extra }); };
  if (testTrust() && !allowTestTrust) T("TEST_TRUST_FORBIDDEN", "ART_BRIDGE_TEST_TRUST is set: test-trusted receipts can never authorize a real provider call", { failed_invariant: "production authority is human, not a test switch", resume_at: "UNSET_TEST_TRUST" });
  const r = resolveContractContext({ film, doc, job }); if (!r.ok) throw err(r.error.code, r.error);
  const c = r.context;
  const st = scopeApprovalStatus(c.film, c.doc, "story"); if (!st.ok) T("STORY_APPROVAL_REQUIRED", st.reason, { dependency_ids: Object.keys(scopeBundle(c.film, "story").files), failed_invariant: "story facts carry a verified human receipt", repair_owner: "HUMAN_STORY_REVIEWER", resume_at: "STORY_APPROVAL" });
  const dr = scopeApprovalStatus(c.film, c.doc, "direction"); if (!dr.ok) T("DIRECTION_APPROVAL_REQUIRED", dr.reason, { dependency_ids: Object.keys(scopeBundle(c.film, "direction").files), failed_invariant: "experience direction + action coverage carry a verified human receipt", repair_owner: "HUMAN_DIRECTION_REVIEWER", resume_at: "DIRECTION_APPROVAL" });
  const gate = gateForJob({ film: c.film, doc: c.doc, job, masterJob });
  if (gate.pass !== true) throw err("ART_CONTRACT_REFUSED", { record_id: job.artjob_id, reason: gate.failures.map((x) => `${x.code}${x.method ? ":" + x.method : ""}`).join(", "), details: { failures: gate.failures }, producer: `${P}#preGenerationGate`, repair_owner: "SOURCE_TO_ART_COMPILER", resume_at: "ART_DESIGN_COMPILATION" });
  if (gate.design_approval.status !== "DESIGN_APPROVED") T("DESIGN_APPROVAL_REQUIRED", gate.design_approval.reason, { failed_invariant: "the exact design carries a verified human art-director receipt", repair_owner: "HUMAN_ART_DIRECTOR", resume_at: "DESIGN_APPROVAL" });
  if (requestHash !== null && gate.compiled_request_sha256 !== undefined && gate.compiled_request_sha256 !== requestHash) T("STALE_COMPILED_REQUEST", "compiled request hash changed");
  return Object.freeze({ ...gate, story: st, direction: dr, context: { film: c.film, masterId: c.masterId, derived: c.derived, stateContract: c.stateContract } });
}
