// Art requests (spec §5.1 missingArtJobs, §6.1–6.4, §11.4). Structured engine errors become exact, resumable, source-conditioned GPT ArtJobs.
// NOTHING here draws: no substitute art is ever produced. compileArtJob merges the motion contract (§6.2 motion_context, every field
// explicit or null+reason) into a skill-conditioned ArtJob and compiles it with the INSTALLED skill's scripts/prepare_first_pass.py
// (fail-closed: ≥2 distinct native STYLE_ONLY witnesses, real paths + hashes, repair memory applied). The compiled request is
// verified here again (files exist, hashes match) — a prompt naming a frame is not an attached image.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { spawnSync } from "node:child_process";
import { err } from "./errors.mjs";
import { preGenerationGate, assertGate, resolveContractContext, gateForJob } from "./art_contract.mjs";
import { planStages } from "./request_stages.mjs";
import { allocateDetail, compileWorldSystem, styleConstructionGraph } from "./source_method_causality.mjs";
import { matchingRulesDigest, selectRules } from "./repair_memory.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const SKILL = path.join(REPO, "reference", "construct-kurzgesagt-art");
const PYTHON = process.env.PYTHON || "python";
const sha = (buf) => crypto.createHash("sha256").update(buf).digest("hex");
const fileSha = (f) => sha(fs.readFileSync(f));

export const MOTION_CONTEXT_FIELDS = ["identity_id", "canonical_parent_asset", "shot_ids", "frame_ranges", "view_id", "pose_id", "expression_id", "required_continuity_landmarks", "required_joint_pivots", "required_sockets", "contact_type", "alpha_requirement", "hidden_surfaces_to_paint", "near_far_order", "camera_footprint", "oversized_paint_rect", "lighting_validity", "target_motion_mode", "predecessor_state_id", "successor_state_id", "why_this_drawing_is_needed"];
/** every §6.2 field present; absent ones become {value:null, reason} — never silently omitted */
export function completeMotionContext(mc, reasons = {}) {
  const out = {}, nulls = {};
  for (const k of MOTION_CONTEXT_FIELDS) { const v = mc[k]; if (v === undefined || v === null || (Array.isArray(v) && !v.length && reasons[k])) { out[k] = Array.isArray(v) ? [] : null; nulls[k] = reasons[k] || "not applicable to this state (no dependent motion uses it)"; } else out[k] = v; }
  return { motion_context: out, null_reasons: nulls };
}

/** routeMedium({kind, state_kind, target_motion_mode}) → the provider medium a state requires. The TYPED asset kind (and MASTER state) is
 *  authoritative (audit P0-2); motion mode only decides when no kind is known. A master is generated once as the canonical identity;
 *  every derived cutout/underpaint/mask/occluder is a transparent registered EDIT of that approved master. */
const PLATES = ["WORLD_PLANE", "CLEAN_PLATE", "TRANSITION_PLATE"], EDITS = ["PART", "UNDERPAINT", "MASK", "OCCLUDER", "MATERIAL_PLANE", "EFFECT_STATE"];
export function routeMedium(need) {
  const k = need.kind, m = need.target_motion_mode, master = need.state_kind === "MASTER" || k === "MASTER";
  if (master && PLATES.includes(k)) return { medium: "CANONICAL_WORLD_PLATE_WITH_OVERSCAN", why: "canonical world identity painted once with declared overscan; layers and views are edits of it" };
  if (master) return { medium: "RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS", why: "identity is locked from one approved master; derived states are edits of it" };
  if (k === "TYPE") return { medium: "APPROVED_FONT_AND_VECTOR_TYPE", why: "changing digits/labels must stay live text under a verified font" };
  if (k === "VECTOR_PATH") return { medium: "PROVIDER_SVG_IF_SUPPORTED", why: "homologous vector topology is required for a registered morph" };
  if (k === "SYMBOL") return { medium: "TRANSPARENT_RASTER_SYMBOL_OR_PROVIDER_SVG", why: "code animates quantities of an approved symbol; it does not invent the symbol" };
  if (k === "CEL") return { medium: "TRANSPARENT_RASTER_CEL_SEQUENCE", why: "silhouette changes too much for cutout rotation" };
  if (PLATES.includes(k)) return { medium: "OPAQUE_OR_LAYERED_RASTER_PLATE_WITH_OVERSCAN", why: "camera footprint and transition states need painted overscan" };
  if (EDITS.includes(k)) return { medium: "TRANSPARENT_REGISTERED_EDIT_OF_APPROVED_MASTER", why: "registered cutout/layer edited from the approved master (alpha PNG, measured pivot and landmarks)" };
  if (m === "REGISTERED_MORPH") return { medium: "PROVIDER_SVG_IF_SUPPORTED", why: "registered morph needs vector topology" };
  if (m === "REGISTERED_CELS") return { medium: "TRANSPARENT_RASTER_CEL_SEQUENCE", why: "cel action" };
  if (m === "PROCEDURAL") return { medium: "TRANSPARENT_RASTER_SYMBOL_OR_PROVIDER_SVG", why: "procedural quantities of an approved symbol" };
  if (m === "CAMERA_WORLD" || m === "TRANSITION") return { medium: "OPAQUE_OR_LAYERED_RASTER_PLATE_WITH_OVERSCAN", why: "camera/transition plate" };
  throw err("UNSUPPORTED_MOTION_CLASS", { reason: `cannot route a medium without a typed kind or motion mode (${JSON.stringify(need)})` });
}
const MASTER_MEDIA = ["RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS", "CANONICAL_WORLD_PLATE_WITH_OVERSCAN"];
/** assertMediumContract(job) — a (state_kind, medium) pair that contradicts itself is refused before any compile/submit */
export function assertMediumContract(job) {
  const mm = job.medium?.medium, isMaster = job.state_kind === "MASTER";
  if (!mm) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: "job has no routed medium" });
  if (isMaster !== MASTER_MEDIA.includes(mm)) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: `contradictory contract: state_kind ${job.state_kind} with medium ${mm}` });
  if (job.state_kind === "TRANSITION_PLATE" && !["OPAQUE_OR_LAYERED_RASTER_PLATE_WITH_OVERSCAN", "TRANSPARENT_REGISTERED_EDIT_OF_APPROVED_MASTER"].includes(mm)) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: `transition state routed to ${mm}` });
  return true;
}
/** frame-range invariant (audit P0-1): a job whose triggers carry frames must carry those frames in its motion context */
export function assertMotionContext(job) {
  const trig = (job.triggered_by || []).some((t) => t.frame_range), fr = job.motion_context?.frame_ranges || [];
  if (trig && !fr.length) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: "triggers carry frame ranges but motion_context.frame_ranges is empty: the motion contract was lost" });
  return true;
}

const JOB_FOR = {
  MISSING_ART_ASSET: (e) => ({ state_kind: "PART_OR_STATE", why: `required asset ${e.dependency || e.record_id} is absent on ${spanText(e)}` }),
  MISSING_CANONICAL_MASTER: (e) => ({ state_kind: "MASTER", why: `identity ${e.record_id} has no approved canonical master; every dependent state is an edit of it` }),
  MISSING_UNDERPAINT: (e) => ({ state_kind: "UNDERPAINT", why: `${e.record_id} reveals hidden surfaces when it moves; underpaint must be authored, not stretched` }),
  UNSUPPORTED_VIEW: (e) => ({ state_kind: "VIEW_STATE", why: `the action needs a view that has no approved art (${e.dependency || e.record_id})` }),
  MISSING_TRANSITION_STATE: (e) => ({ state_kind: "TRANSITION_PLATE", why: `continuous transition ${e.record_id} lacks OUT/MIDDLE/IN art or a registered shared landmark` }),
  JOINT_LIMIT_EXCEEDED: (e) => ({ state_kind: "POSE_OR_BEND_CEL", why: `${e.details?.joint || e.record_id} must reach ${e.details?.angle?.toFixed?.(1)}° beyond its approved range [${e.details?.limits}] on ${spanText(e)}` }),
  OUTSIDE_CAMERA_FOOTPRINT: (e) => ({ state_kind: "WORLD_EXTENSION", why: `camera reveals unpainted area (${e.record_id}) on ${spanText(e)}` }),
  STATIC_PLATE_NOT_RIG: (e) => ({ state_kind: "CUTOUT_PARTS", why: `${e.record_id} animates a single static plate; registered cutouts or cels are needed` }),
  UNREGISTERED_PIVOT: null, UNAPPROVED_ART: null, UNREACHABLE_IK: null, CONTACT_DRIFT: null, FOOT_SLIDE: null, // not art problems: staging/registration/engine fixes
};
const spanText = (e) => (e.frame_range ? `frames ${e.frame_range[0]}..${e.frame_range[1] - 1}` : "unspecified frames");
export const NON_ART_ROUTES = { UNREGISTERED_PIVOT: "REGISTRATION_ERROR — fix metadata/compiler, do not regenerate pixels", UNAPPROVED_ART: "REVIEW_REQUIRED — a reviewer must approve the art/state/edge; nothing is generated", UNREACHABLE_IK: "RIG_OR_CONTACT_ERROR — re-stage within approved bounds or request new pose art", CONTACT_DRIFT: "RIG_OR_CONTACT_ERROR", FOOT_SLIDE: "RIG_OR_CONTACT_ERROR", INVALID_TRANSFORM_OWNER: "ENGINE_ERROR", UNDETERMINISTIC_FRAME: "ENGINE_ERROR" };

/** missingArtJobs(errors, {doc, projectId}) → {jobs, routed_elsewhere}. Jobs are grouped by root dependency (§12.4): one job per missing state, all frame spans merged. */
export function missingArtJobs(errors, ctx) {
  const doc = ctx.doc, assets = new Map((doc?.assets || []).map((a) => [a.id, a])), groups = new Map(), elsewhere = [];
  for (const raw of errors) {
    const e = raw.toJSON ? raw.toJSON() : raw, f = JOB_FOR[e.code];
    if (f === null || f === undefined) { if (e.code in NON_ART_ROUTES || f === null) elsewhere.push({ code: e.code, record_id: e.record_id, frame_range: e.frame_range, route: NON_ART_ROUTES[e.code] || "non-art defect" }); continue; }
    const key = `${e.code}|${e.dependency || e.record_id}`;
    if (!groups.has(key)) groups.set(key, { errors: [], spec: f(e) });
    groups.get(key).errors.push(e);
  }
  const jobs = [];
  for (const [key, g] of groups) {
    const e0 = g.errors[0], dep0 = e0.dependency || e0.record_id, master = e0.code === "MISSING_CANONICAL_MASTER" ? doc?.identities.find((i) => i.id === e0.record_id)?.canonical_asset_id : null, dep = master || dep0;
    const planned = ctx.planned?.get(dep) || null, a = assets.get(dep) || assets.get(e0.record_id) || null;
    const shot = doc?.shots.find((s) => s.id === e0.shot_id) || null, actions = (doc?.actions || []).filter((x) => x.required_assets.includes(dep) || x.id === e0.record_id);
    const rig = doc?.rigs.find((r) => r.render_parts.some((p) => p.asset_id === dep)) || null, rp = rig?.render_parts.find((p) => p.asset_id === dep);
    const identity = doc?.identities.find((i) => i.id === (a?.identity_id || planned?.identity_id || rig?.identity_id || (master ? e0.record_id : null))) || null;
    const contact = actions.flatMap((x) => x.contact_events).find((c) => rig?.sockets.some((s) => s.id === c.source_socket)) || null;
    const spans = g.errors.map((x) => x.frame_range || x.details?.frame_spans).flat().filter(Boolean);
    const { motion_context, null_reasons } = completeMotionContext({
      identity_id: identity?.id, canonical_parent_asset: identity?.canonical_asset_id, shot_ids: [...new Set([e0.shot_id, ...actions.map((x) => x.shot_id)].filter(Boolean))],
      frame_ranges: Array.isArray(spans[0]) ? spans : spans.length ? [spans] : [], view_id: a?.view_id ?? planned?.view_id, pose_id: a?.pose_id ?? planned?.pose_id, expression_id: a?.expression_id ?? planned?.expression_id,
      required_continuity_landmarks: Object.keys(a?.landmarks || identity?.landmarks || {}), required_joint_pivots: rp ? [{ joint: rp.joint_id, pivot_xy: a?.pivot_xy ?? rig.joints.find((j) => j.id === rp.joint_id)?.rest_xy }] : [],
      required_sockets: rig ? rig.sockets.filter((s) => s.joint_id === rp?.joint_id).map((s) => s.id) : [], contact_type: contact?.contact_type, alpha_requirement: a ? a.alpha_mode : planned ? planned.alpha_mode : g.spec.state_kind === "WORLD_EXTENSION" ? "OPAQUE" : "STRAIGHT",
      hidden_surfaces_to_paint: a?.hidden_surfaces ?? planned?.hidden_surfaces, near_far_order: (a?.draw_order_constraints ?? planned?.draw_order)?.length ? (a?.draw_order_constraints ?? planned.draw_order) : contact?.near_far_relation, camera_footprint: a?.camera_footprint ?? e0.details?.first_frame_viewport_corners_world, oversized_paint_rect: a?.overscan_rect ?? planned?.overscan_rect,
      lighting_validity: a?.material_plane_ids?.length ? a.material_plane_ids : null, target_motion_mode: actions[0]?.mode, predecessor_state_id: planned?.derived_from ?? null, successor_state_id: null, why_this_drawing_is_needed: planned ? `${g.spec.why}. Plan: ${planned.why}` : g.spec.why,
    }, { lighting_validity: "no authored material planes bound to this state", predecessor_state_id: "first state of its family", successor_state_id: "no successor state declared", contact_type: "state is not part of a contact", camera_footprint: "not a camera-revealed plate", oversized_paint_rect: "no overscan declared" });
    const id = `ARTJOB_${g.spec.state_kind}_${String(dep).replace(/[^A-Za-z0-9_]/g, "_")}_${sha(Buffer.from(key)).slice(0, 8)}`;
    jobs.push({ artjob_id: id, status: "WAITING_FOR_GPT_ART", root_dependency: dep, state_kind: g.spec.state_kind, medium: routeMedium({ kind: a?.kind || planned?.kind || ({ WORLD_EXTENSION: "WORLD_PLANE", TRANSITION_PLATE: "TRANSITION_PLATE", UNDERPAINT: "UNDERPAINT", MASTER: "MASTER" }[g.spec.state_kind] ?? "PART"), state_kind: g.spec.state_kind, target_motion_mode: actions[0]?.mode }),
      triggered_by: g.errors.map((x) => ({ code: x.code, record_id: x.record_id, frame_range: x.frame_range || null })), motion_context, null_reasons,
      manufacturing_order: planned?.manufacturing_order ?? (g.spec.state_kind === "MASTER" ? 1 : 2), derived_from: planned?.derived_from ?? null,
      registration_contract: !a && planned ? { pivot_landmark_id: planned.pivot_landmark_id, pivot_xy: planned.pivot_xy, joint_id: planned.joint_id, alpha_mode: planned.alpha_mode, view_id: planned.view_id, depth_band: planned.depth_band, note: "canonical_rect/landmarks are measured by registration.mjs on the delivered pixels" } : a ? { canonical_rect: a.canonical_rect, pivot_xy: a.pivot_xy, pivot_landmark_id: a.pivot_landmark_id, landmarks: a.landmarks, coordinate_space: a.coordinate_space, alpha_mode: a.alpha_mode } : null,
      resume: { inbox_file: `inbox/${id}.png`, then: "node engine/tools/art_outbox.mjs ingest --job <id> (registration + manifest check rerun automatically)" } });
  }
  jobs.sort((p, q) => p.artjob_id.localeCompare(q.artjob_id));
  return { jobs, routed_elsewhere: elsewhere };
}

/** dependencyDigest — everything that changes what a provider would be asked to make (directive E3). Same digest ⇒ idempotent rerun;
 *  any change ⇒ a new immutable generation and stale downstream approvals. */
export function dependencyDigest({ job, design, repairMemory = null, editReference = null, storyBundle = null, directionBundle = null, size = null, skillRoot = SKILL, doc = null }) {
  const skillFiles = [];
  for (const d of ["scripts", "references"]) { const dir = path.join(skillRoot, d); if (fs.existsSync(dir)) for (const f of fs.readdirSync(dir).sort()) { const p = path.join(dir, f); if (fs.statSync(p).isFile()) skillFiles.push([`${d}/${f}`, fileSha(p)]); } }
  const witnesses = (design?.first_pass_control?.references || []).map((r) => [r.path, fs.existsSync(path.join(SKILL, r.path)) ? fileSha(path.join(SKILL, r.path)) : fs.existsSync(path.join(REPO, r.path)) ? fileSha(path.join(REPO, r.path)) : null]);
  const parts = { motion_context: job.motion_context, null_reasons: job.null_reasons, medium: job.medium, design_sha256: sha(JSON.stringify(design || null)), skill: skillFiles, method_source_sha256: fileSha(path.join(REPO, "engine", "methods", "source", "F_SOURCE.json")),
    // the manifest state the contract gate reads for this identity (landmarks, rigs, joints, sockets, states) — review pointers excluded
    identity_state: doc ? ((i) => ({ identity: i && Object.fromEntries(Object.entries(i).filter(([k]) => !["approved_review_id", "master_sha256"].includes(k))), rigs: doc.rigs.filter((r) => r.identity_id === job.identity_id).map((r) => ({ ...r, pose_states: r.pose_states.map(({ approved_review_id, ...x }) => x), view_states: r.view_states.map(({ approved_review_id, ...x }) => x), allowed_state_edges: r.allowed_state_edges.map(({ approved_assembly_review_id, ...x }) => x) })) }))(doc.identities.find((i) => i.id === job.identity_id)) : null,
    // only the repair rules that MATCH this job's learning context enter its digest (L06: unrelated rule changes leave it stable)
    witnesses, repair_memory_sha256: matchingRulesDigest(repairMemory, learningContextFor(job, design)), edit_reference_sha256: editReference?.sha256 ?? null, story: storyBundle, direction: directionBundle, size };
  return { digest: sha(JSON.stringify(parts)), parts };
}

/** the learning context the skill matches repair rules against (family, view, world class, subject) — the same one compileArtJob passes */
export function learningContextFor(job, design) {
  const spec0 = design?.first_pass_control?.subject_specs?.[0] || {};
  return design?.learning_context || { family: design?.art_family || spec0.family || "UNSPECIFIED", view: job.motion_context?.view_id || "front", world_class: design?.world?.class || design?.world?.world_class || "UNSPECIFIED", subject_id: job.motion_context?.identity_id || job.root_dependency };
}
const toSkillBindings = (design) => (design.method_decisions || []).map((d) => ({ method_id: d.method_id, conditions: d.applicability_evidence, source_witnesses: [...new Set((d.source_witness_pixel_regions || []).map((r) => r.witness))],
  invariant_transferred: d.question_from_build_clause, variation_required: d.specific_decision, observable_verification: d.falsification_condition }));
const SKILL_SPLIT = "Continue with the verified, filled ArtJob";

/** compileArtJob(job, {film|contract, baseJob?, outDir, repairMemory, masterJob?, dryRun?, editReference?}) — the universal gate ALWAYS runs
 *  (resolved here from the film; there is no contract=null path). The output is a staged, complete, content-addressed request set that is
 *  NOT provider-ready by itself: submitJob additionally requires story/direction/design receipts and an unchanged request hash. */
export function compileArtJob(job, { baseJob = null, outDir, repairMemory = null, contract = null, film = null, masterJob = null, dryRun = false, editReference = null, limit = undefined } = {}) {
  const FILM = film || contract?.film || null;
  if (!FILM) throw err("ART_CONTRACT_NOT_EVALUATED", { record_id: job?.artjob_id, reason: "compileArtJob needs the film root to resolve the typed contract (no contract=null path)", producer: "engine/art_bridge/art_requests.mjs#compileArtJob", failed_invariant: "every production request has an evaluated typed design contract", repair_owner: "CALLER", resume_at: "ART_DESIGN_COMPILATION" });
  const rc = resolveContractContext({ film: FILM, doc: contract?.doc || null, job }); if (!rc.ok) throw err(rc.error.code, rc.error);
  const c = rc.context, design = baseJob ?? JSON.parse(fs.readFileSync(c.designRef, "utf8"));
  if (!design?.first_pass_control) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: "no skill-conditioned first_pass_control: the ArtJob cannot be compiled without source-guided construction decisions" });
  assertMediumContract(job); assertMotionContext(job);
  let gate;
  if (c.derived) { if (!masterJob) throw err("ART_CONTRACT_NOT_EVALUATED", { record_id: job.artjob_id, reason: "derived job compiled without its master job contract", producer: "engine/art_bridge/art_requests.mjs#compileArtJob" });
    gate = preGenerationGate({ design, job: masterJob, doc: c.doc, plan: c.plan, motionPlans: c.motionPlans, film: c.film }); const g2 = gateForJob({ film: c.film, doc: c.doc, job, masterJob }); if (!g2.pass) gate = { ...gate, pass: false, failures: [...gate.failures, ...g2.failures.filter((x) => !gate.failures.some((y) => y.code === x.code && y.reason === x.reason))] }; gate.state_contract = c.stateContract; }
  else gate = preGenerationGate({ design, job, doc: c.doc, plan: c.plan, motionPlans: c.motionPlans, film: c.film, pregenAudit: contract?.pregenAudit });
  assertGate(gate);
  if (dryRun) return { gate, status: "DRY_RUN_REPORT_ONLY", provider_ready: false };
  fs.mkdirSync(outDir, { recursive: true });
  const learning_context = learningContextFor(job, design);
  // K2: matching repair rules are selected by predicate; a rule contradicting the approved design/source blocks instead of winning
  if (repairMemory && fs.existsSync(repairMemory)) selectRules({ memory: JSON.parse(fs.readFileSync(repairMemory, "utf8")), context: learning_context, design });
  // the skill job: the installed skill validates first_pass_control, witnesses and repair memory and compiles the complete brief (no limit)
  const skillJob = { ...design, learning_context, job_id: job.artjob_id, method_bindings: toSkillBindings(design) };
  for (const k of ["method_decisions", "construction_topics", "art_motion_agreement", "design_grounding", "motion_requirements", "output", "subject_profile", "art_family", "detail_regions", "projection", "world_construction"]) delete skillJob[k];
  if (/_WORLD$/.test(gate.family || "")) skillJob.world_system = compileWorldSystem(design); // F49: world construction data → the skill's machine-checkable world_system
  const jobFile = path.join(outDir, "ARTJOB.json"); fs.writeFileSync(jobFile, JSON.stringify(skillJob, null, 1));
  const args = [path.join(SKILL, "scripts", "prepare_first_pass.py"), jobFile, "--out-dir", outDir, "--max-prompt-chars", "100000000"]; if (repairMemory) args.push("--repair-memory", repairMemory);
  const r = spawnSync(PYTHON, args, { encoding: "utf8" });
  if (r.status !== 0) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: `skill first-pass compiler refused the job: ${(r.stderr || r.stdout).trim().slice(0, 600)}`, details: { exit_code: r.status } });
  const skillReq = JSON.parse(fs.readFileSync(path.join(outDir, "IMAGEGEN_REQUEST.json"), "utf8")), manifest = JSON.parse(fs.readFileSync(path.join(outDir, "PROVIDER_PRE_SUBMISSION_MANIFEST.json"), "utf8"));
  fs.renameSync(path.join(outDir, "IMAGEGEN_REQUEST.json"), path.join(outDir, "SKILL_COMPLETE_COMPILE.json")); // the skill's complete (unbounded) compile is evidence, not a provider request
  const witnesses = manifest.source_image_inputs.map((w) => { const ok = fs.existsSync(w.path) && fileSha(w.path) === w.sha256 && path.resolve(w.path).startsWith(SKILL); return { ...w, path: path.relative(REPO, w.path).split(path.sep).join("/"), verified: ok }; });
  if (witnesses.filter((w) => w.verified).length < 2 || new Set(witnesses.map((w) => w.sha256)).size < 2) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: "fewer than two distinct verified native STYLE_ONLY witnesses would be attached" });
  const cut = skillReq.prompt.indexOf(SKILL_SPLIT); if (cut < 0) throw err("UNQUALIFIED_STYLE_ASSET", { record_id: job.artjob_id, reason: "skill compile lacks its control block boundary" });
  const header = skillReq.prompt.slice(0, cut).trim(), mr = design.motion_requirements || {};
  // F33/F47/F53/F77: detail budgets computed from PROJECTED on-screen size × semantic role (the projected figure height comes from the action graph)
  const projH = gate.required_figure_height_px || design.output?.authored_height_px || null;
  const detail = design.detail_regions && projH ? allocateDetail(design.detail_regions.map((r) => ({ ...r, projected_px: [Math.round(r.fraction_of_figure[0] * projH), Math.round(r.fraction_of_figure[1] * projH)] }))) : null;
  const footer = [...(detail ? [`## DETAIL BUDGET (computed: figure up to ${projH} px on screen)`, ...detail.map((x) => `${x.id}: ${x.detail_owner}, ≤${x.mark_budget} interior marks at ~${x.projected_px.join("×")} px`)] : []), "## MOTION REQUIREMENTS (what must articulate, separate, contact or change — requirements, never coordinates)", ...Object.entries(mr).map(([k, v]) => `${k}: ${typeof v === "string" ? v : JSON.stringify(v)}`),
    `## OUTPUT: ${JSON.stringify(design.output || {})}`, `## OBSERVABLE FAILURE CONDITIONS: ${JSON.stringify(design.observable_negative_tests || [])}`].join("\n");
  const plan = planStages({ design, gate, header, footer, derived: c.derived, record_id: job.artjob_id, ...(limit ? { limit } : {}) });
  if (!plan.stages.length) throw err("ART_DESIGN_UNSPECIFIED", { record_id: job.artjob_id, reason: c.derived ? "no approved-master method decision governs this derived edit (mark the governing decisions applies_to_states)" : "no authored method produces this master", producer: "engine/art_bridge/request_stages.mjs#planStages", repair_owner: "HUMAN_ART_DIRECTOR", resume_at: "ART_DESIGN_COMPILATION" });
  const transparent = job.motion_context.alpha_requirement !== "OPAQUE", refs = skillReq.referenced_image_paths;
  fs.writeFileSync(path.join(outDir, "STAGE_A_CONTRACT_BRIEF.md"), plan.brief);
  fs.writeFileSync(path.join(outDir, "STYLE_CONSTRUCTION_DECISION.json"), JSON.stringify({ ...styleConstructionGraph({ design, gate, stages: plan.stages, sha: (x) => sha(Buffer.from(x)) }), detail_budget: detail }, null, 1));
  for (const s of plan.stages) fs.writeFileSync(path.join(outDir, `STAGE_${String(s.index).padStart(2, "0")}_REQUEST.json`), JSON.stringify({ prompt: s.prompt, referenced_image_paths: refs, transparent_background: transparent, mode: s.mode, stage: s.index, of: plan.stages.length, predecessor_sha256: s.predecessor_sha256, methods: s.methods }, null, 2) + "\n");
  const reqF = path.join(outDir, "IMAGEGEN_REQUEST.json"); fs.copyFileSync(path.join(outDir, "STAGE_01_REQUEST.json"), reqF);
  const stagesMeta = plan.stages.map(({ prompt, ...s }) => s), dg = dependencyDigest({ job, design, repairMemory, editReference });
  const pre = { ...manifest, status: "COMPILED_NOT_PROVIDER_READY", prompt_sha256: plan.stages[0].prompt_sha256, prompt_characters: plan.stages[0].characters, stages: stagesMeta, contract_brief_sha256: plan.brief_sha256, skill_complete_compile_sha256: manifest.prompt_sha256, provider_request_submitted: false };
  fs.writeFileSync(path.join(outDir, "PROVIDER_PRE_SUBMISSION_MANIFEST.json"), JSON.stringify(pre, null, 1));
  fs.writeFileSync(path.join(outDir, "BRIDGE_MOTION_CONTEXT.json"), JSON.stringify({ artjob_id: job.artjob_id, note: "machine rig/motion contract: kept by the bridge, NOT sent to the artist (the artist receives motion only as requirements)", motion_context: job.motion_context, null_reasons: job.null_reasons, registration_contract: job.registration_contract, medium: job.medium }, null, 1));
  const { applicability_table, ...gateSummary } = gate;
  fs.writeFileSync(path.join(outDir, "BRIDGE_REQUEST_CONTRACT.json"), JSON.stringify({ artjob_id: job.artjob_id, gate: gateSummary, applicability_table, method_delivery: plan.delivery, stages: stagesMeta, contract_brief_sha256: plan.brief_sha256, transparent_background: { value: transparent, source: `motion_context.alpha_requirement=${job.motion_context.alpha_requirement}` },
    dependency_digest: dg.digest, provider_ready: false, provider_ready_requires: ["verified HUMAN story receipt", "verified HUMAN direction receipt", "verified HUMAN design receipt", "unchanged request hash"], request_sha256: fileSha(reqF) }, null, 1));
  return { gate, status: "COMPILED_WAITING_FOR_GPT_ART", provider_ready: false, job_file: path.relative(REPO, jobFile).split(path.sep).join("/"), request_file: path.relative(REPO, reqF).split(path.sep).join("/"), prompt_sha256: pre.prompt_sha256, prompt_characters: pre.prompt_characters, stages: stagesMeta,
    contract_brief_sha256: plan.brief_sha256, method_delivery: plan.delivery, compiled_method_ids: manifest.compiled_method_ids, applied_repair_rule_ids: manifest.applied_repair_rule_ids, repair_memory_applied: manifest.repair_memory_applied, witnesses, dependency_digest: dg.digest, motion_context_sha256: sha(Buffer.from(JSON.stringify(job.motion_context))) };
}

/** applyRepairMemory(job, {baseJob, outDir, repairMemory}) → which repair rules the skill compiler applied to THIS job's first-pass payload */
export function applyRepairMemory(job, opts) { const c = compileArtJob(job, opts); return { applied_repair_rule_ids: c.applied_repair_rule_ids, repair_memory_applied: c.repair_memory_applied, prompt_sha256: c.prompt_sha256 }; }
