// Art intake & handoff (independent audit P0-1, P0-2, P0-3, P0-5). The producing functions for the artwork→motion contract:
//   planJobs           motion contract derived from the action/shot graph + real check errors BEFORE a job exists (frames never lost)
//   ingestMaster       delivered master pixels → measured canonical identity frame (reviewed landmarks → similarity → canonical units),
//                      identity.master_sha256 synchronised; status REGISTERED_PENDING_REVIEW (never auto-approved)
//   reviewMaster       explicit reviewer verdict → hash-scoped receipts for the identity and its master asset
//   ingestPart         only after the master's approval verifies; reviewed correspondences → registerPart against the master; typed kind kept
//   reviewPart / approveState / approveStateEdge       explicit receipts for parts, states and edges
//   resumeDependentJobs  dependent jobs become READY with the approved master bytes as the mandatory edit reference; stale masters
//                        invalidate dependents and emit re-manufacture/re-review work
//   submitJob          the ONE production path that invokes a provider (generate for masters, edit with master bytes for dependents)
// Nothing in this module draws, fabricates or approves art.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runCheck } from "../tools/art_bridge_check.mjs";
import { missingArtJobs, completeMotionContext, routeMedium, assertMediumContract, assertMotionContext } from "./art_requests.mjs";
import { stateIntervals } from "./asset_state.mjs";
import { solveTransform, registerPart } from "./registration.mjs";
import { readPNG } from "./png.mjs";
import { writeReceipt, verifyApproval, attestHuman, bundleFor, bundleHash, testTrust, deformBundle } from "./approvals.mjs";
import { cropToCanonical, geometryFields } from "./asset_geometry.mjs";
import { verifyRegistrationReceipt } from "./registration_evidence.mjs";
import { mul, inv } from "./math2d.mjs";
import { discoverProvider } from "./providers/image_provider.mjs";
import { err } from "./errors.mjs";
import { gateForJob, requireApprovedContract, scopeBundle } from "./art_contract.mjs";
import { readCurrent, verifyGeneration } from "./outbox_store.mjs";
import { prepareRequest, recordOutcome, sealResult, loadResult, selectCandidate, loadSelection, capabilityStatus } from "./candidate_store.mjs";
import { dependencyDigest } from "./art_requests.mjs";
import { channelEvents } from "./state_channels.mjs";
import { compileMotionTracks, stateAtFrame } from "./temporal.mjs";
import { rigPoseTimeline } from "./state_timeline.mjs";

const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json", PLAN = "handoff/ART_DEPENDENCY_PLAN.json";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), hsha = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");
const readJ = (f) => JSON.parse(fs.readFileSync(f, "utf8")), writeJ = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 1)); };
const loadDoc = (film) => readJ(path.join(film, MF)), saveDoc = (film, d) => writeJ(path.join(film, MF), d), loadPlan = (film) => readJ(path.join(film, PLAN));
const revision = () => { try { return execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim(); } catch { return null; } };
const merge = (spans) => { const s = spans.filter(Boolean).map((x) => [x[0], x[1]]).sort((a, b) => a[0] - b[0]), o = []; for (const x of s) { const l = o.at(-1); if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else o.push(x); } return o; };
const log = (film, entry) => { const f = path.join(film, "intake", "INTAKE_LOG.jsonl"); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.appendFileSync(f, JSON.stringify({ at: new Date().toISOString(), ...entry }) + "\n"); };

/* ───────────── P0-1: motion requirements from the action/shot graph ───────────── */
export function requirementsFor(doc, plan) {
  const req = new Map(), need = (id) => { if (!req.has(id)) req.set(id, { spans: [], shots: new Set(), modes: new Set(), contacts: [], facings: new Set(), poses: new Set(), cameras: new Set(), sources: [] }); return req.get(id); };
  const shotById = new Map(doc.shots.map((s) => [s.id, s]));
  for (const s of doc.shots) for (const id of s.required_asset_ids) { const r = need(id); r.spans.push([s.start_frame, s.end_frame]); r.shots.add(s.id); if (s.camera_track_id) r.cameras.add(s.camera_track_id); r.sources.push(`shot ${s.id}`); }
  for (const a of doc.actions) for (const id of a.required_assets) { const r = need(id); (r.actionSpans ||= []).push(a.frame_range); r.shots.add(a.shot_id); r.modes.add(a.mode); r.sources.push(`action ${a.id}`); }
  for (const w of doc.worlds) for (const d of w.depth_owners) for (const id of d.asset_ids) for (const s of doc.shots.filter((x) => x.world_id === w.id)) { const r = need(id); r.spans.push([s.start_frame, s.end_frame]); r.shots.add(s.id); if (s.camera_track_id) r.cameras.add(s.camera_track_id); r.world = w; r.sources.push(`world ${w.id} in ${s.id}`); }
  for (const t of doc.transitions) for (const id of [...t.out_asset_ids, ...t.middle_asset_ids, ...t.in_asset_ids, ...t.mask_or_occluder_ids]) { const r = need(id); r.spans.push(t.frame_range); r.shots.add(t.from_shot); r.shots.add(t.to_shot); r.modes.add("TRANSITION"); r.transition = `${t.from_shot}->${t.to_shot}`; r.sources.push(`transition ${t.from_shot}->${t.to_shot}`); }
  const rigs = new Map(doc.rigs.map((r) => [r.id, r]));
  for (const iv of stateIntervals(doc)) {
    const rig = rigs.get(iv.rig);
    for (const p of rig.render_parts) {
      const id = iv.bindings[p.asset_id], r = need(id); r.spans.push(iv.interval); (r.stateSpans ||= []).push(iv.interval); r.shots.add(iv.shot); r.modes.add(iv.mode); r.facings.add(iv.facing); if (iv.pose) r.poses.add(iv.pose); r.joint = p.joint_id; r.rig = iv.rig; r.sources.push(`state ${iv.rig}:${iv.pose}/${iv.view || "-"} ${iv.action}`);
      for (const c of iv.contacts) { const sock = rig.sockets.find((s) => s.id === c.source_socket || s.id === c.target_socket); if (sock && sock.joint_id === p.joint_id) r.contacts.push({ socket: sock.id, role: sock.id === c.source_socket ? "source" : "target", contact_type: c.contact_type, frames: [Math.max(c.start_frame, iv.interval[0]), Math.min(c.end_frame, iv.interval[1])], near_far: c.near_far_relation, allowed_error_px: c.allowed_error_px }); }
    }
  }
  // a canonical master is required wherever any of its identity's states is required
  for (const i of doc.identities) { const m = need(i.canonical_asset_id); for (const p of plan.assets.filter((x) => x.identity_id === i.id && x.asset_id !== i.canonical_asset_id)) { const r = req.get(p.asset_id); if (r) { m.spans.push(...r.spans, ...(r.stateSpans?.length ? [] : r.actionSpans || [])); r.shots.forEach((s) => m.shots.add(s)); r.modes.forEach((x) => m.modes.add(x)); r.facings.forEach((x) => m.facings.add(x)); } } m.identity = i.id; }
  // precision: when the state graph says exactly when an asset is visible, the coarse action-level "required" span is not used for frames
  for (const [, r] of req) { if (!r.stateSpans?.length && r.actionSpans) r.spans.push(...r.actionSpans); r.spans = merge(r.spans); r.contacts = r.contacts.filter((c) => c.frames[0] < c.frames[1]); r.contacts = [...new Map(r.contacts.map((c) => [JSON.stringify(c), c])).values()]; }
  return req;
}

/** planJobs({film}) — one job per planned art state, motion contract built from the graph, real check errors attached as triggers */
export async function planJobs({ film, manifest = MF }) {
  const FILM = path.resolve(film), doc = readJ(path.join(FILM, manifest)), plan = loadPlan(FILM), planned = new Map(plan.assets.map((p) => [p.asset_id, p]));
  const contract = validatePlanContract(doc, plan); // B2: refuse to plan art whose hidden-surface ownership is unspecified
  if (contract.length) { const e = new Error(`plan contract refused: ${contract.map((x) => `${x.code} ${x.record_id}: ${x.human_readable_reason}`).join("; ")}`); e.errors = contract; throw e; }
  const check = await runCheck({ root: FILM, manifest }), rigIds = new Set(doc.rigs.map((r) => r.id));
  const depOf = (e) => { if (e.code === "MISSING_CANONICAL_MASTER") return doc.identities.find((i) => i.id === e.record_id)?.canonical_asset_id; const d = String(e.dependency || e.record_id || ""); const [h, ...t] = d.split("."); return (t.length && rigIds.has(h) ? t.join(".") : d).split("@")[0]; };
  const req = requirementsFor(doc, plan), ident = (p) => doc.identities.find((i) => i.id === p.identity_id), rigs = new Map(doc.rigs.map((r) => [r.id, r]));
  const jobs = [];
  for (const p of plan.assets) {
    const r = req.get(p.asset_id) || { spans: [], shots: new Set(), modes: new Set(), contacts: [], facings: new Set(), poses: new Set(), cameras: new Set(), sources: [] };
    const isMaster = doc.identities.some((i) => i.canonical_asset_id === p.asset_id), state_kind = isMaster ? "MASTER" : p.kind === "UNDERPAINT" ? "UNDERPAINT" : ["TRANSITION_PLATE", "MASK"].includes(p.kind) && r.transition ? "TRANSITION_PLATE" : "PART_OR_STATE";
    const triggers = check.errors.filter((e) => depOf(e) === p.asset_id || (e.code === "MISSING_TRANSITION_STATE" && r.transition === e.record_id)).map((e) => ({ code: e.code, record_id: e.record_id, frame_range: e.frame_range || null, shot_id: e.shot_id || null }));
    const precise = !!r.stateSpans?.length, frame_ranges = merge([...r.spans, ...(precise ? [] : triggers.map((t) => t.frame_range))]), I = ident(p), rig = r.rig ? rigs.get(r.rig) : null;
    const world = r.world || doc.worlds.find((w) => w.identity_id === p.identity_id && w.depth_owners.some((d) => d.asset_ids.includes(p.asset_id))) || null;
    const dependents = plan.assets.filter((x) => x.derived_from === p.asset_id).map((x) => x.asset_id);
    const { motion_context, null_reasons } = completeMotionContext({
      identity_id: p.identity_id, canonical_parent_asset: I?.canonical_asset_id, shot_ids: [...r.shots].sort(), frame_ranges,
      view_id: p.view_id ?? ([...r.facings][0] || null), pose_id: p.pose_id ?? ([...r.poses].join("|") || null), expression_id: p.expression_id,
      required_continuity_landmarks: isMaster ? Object.keys(I?.landmarks || {}) : [p.pivot_landmark_id].filter(Boolean),
      required_joint_pivots: isMaster ? (doc.rigs.filter((x) => x.identity_id === p.identity_id).flatMap((x) => x.joints.map((j) => ({ rig: x.id, joint: j.id, rest_xy: j.rest_xy })))) : p.joint_id ? [{ rig: r.rig, joint: p.joint_id, rest_xy: rig?.joints.find((j) => j.id === p.joint_id)?.rest_xy ?? p.pivot_xy }] : [],
      required_sockets: isMaster ? doc.rigs.filter((x) => x.identity_id === p.identity_id).flatMap((x) => x.sockets.map((s) => ({ socket: s.id, joint: s.joint_id, local_xy: s.local_xy }))) : r.contacts.map((c) => ({ socket: c.socket, role: c.role, contact_type: c.contact_type, frames: c.frames, allowed_error_px: c.allowed_error_px })),
      contact_type: [...new Set(r.contacts.map((c) => c.contact_type))].join("|") || null, alpha_requirement: p.alpha_mode, hidden_surfaces_to_paint: p.hidden_surfaces,
      near_far_order: p.draw_order?.length ? p.draw_order : r.contacts.map((c) => c.near_far).filter(Boolean),
      camera_footprint: world ? { camera_tracks: [...r.cameras], world_camera_footprint: world.camera_footprint, world_overscan_rect: world.overscan_rect, depth_band: p.depth_band } : null,
      oversized_paint_rect: p.overscan_rect ?? world?.overscan_rect ?? null, lighting_validity: null, target_motion_mode: [...r.modes].sort().join("|") || null,
      predecessor_state_id: p.derived_from, successor_state_id: dependents.length ? dependents : null,
      why_this_drawing_is_needed: `${p.why}. Required by: ${[...new Set(r.sources)].slice(0, 12).join("; ")}`,
    }, { lighting_validity: "no authored material/light planes are bound to this state in the action graph", predecessor_state_id: "canonical master: no predecessor", successor_state_id: "no planned state is derived from this one", contact_type: "no contact in the action graph touches this state's joint", camera_footprint: "not a world/camera-revealed plate", oversized_paint_rect: "no overscan declared for this state", hidden_surfaces_to_paint: "no hidden surface declared", near_far_order: "no occlusion constraint involves this state", required_sockets: "no socket on this state's joint", required_joint_pivots: "not attached to a rig joint", expression_id: "not an expression state", pose_id: "not bound to a pose state" });
    const kind = p.kind, medium = routeMedium({ kind, state_kind, target_motion_mode: [...r.modes][0] });
    const id = `ARTJOB_${state_kind}_${p.asset_id}_${hsha(p.asset_id).slice(0, 8)}`;
    const job = { artjob_id: id, root_dependency: p.asset_id, identity_id: p.identity_id, state_kind, asset_kind: kind, medium, manufacturing_order: p.manufacturing_order, derived_from: p.derived_from, dependents,
      triggered_by: triggers, motion_context, null_reasons, motion_context_sha256: hsha(motion_context),
      registration_contract: { asset_kind: kind, pivot_landmark_id: p.pivot_landmark_id, planned_pivot_xy: p.pivot_xy, joint_id: p.joint_id, alpha_mode: p.alpha_mode, view_id: p.view_id, depth_band: p.depth_band, landmark_frame: isMaster ? "identity canonical landmarks (measured on delivered pixels at ingest-master)" : `registered against approved master ${p.derived_from}` } };
    job.frame_precision = precise ? "STATE_INTERVALS" : "SHOT_ACTION_OR_TRANSITION_SPANS";
    if (!frame_ranges.length) { job.unused_in_action_graph = true; job.null_reasons.frame_ranges = "no shot, action, state interval, world or transition in the graph shows this state: it is not requested (UNUSED_IN_ACTION_GRAPH)"; }
    assertMediumContract(job); if (!job.unused_in_action_graph) assertMotionContext(job);
    jobs.push(job);
  }
  return { check, jobs: jobs.sort((a, b) => a.manufacturing_order - b.manufacturing_order || a.artjob_id.localeCompare(b.artjob_id)), doc, plan };
}

/* ───────────── P0-3: master registration, review, part registration, resumption ───────────── */
const KIND_SPACE = { CHARACTER: "CHARACTER_LOCAL", PROP: "PROP_LOCAL", MACHINE: "PROP_LOCAL", WORLD: "WORLD_LOCAL", DIAGRAM: "WORLD_LOCAL", EFFECT: "WORLD_LOCAL" };
const PROVENANCE = ["GPT_PROVIDER_ART", "GPT_OPERATOR_HANDOFF", "USER_APPROVED_ART", "PROVIDER_SVG", "DIAGNOSTIC_FIXTURE"];
/** F091: a GPT provenance claim is accepted ONLY when the exact bytes are a valid candidate of a SEALED provider-result / operator-handoff record
 *  (outbox = arg or ART_BRIDGE_OUTBOX) whose recorded provenance equals the claim; a typed --provenance flag never establishes origin. */
export function requireProvenanceLineage({ file, provenance, outbox = process.env.ART_BRIDGE_OUTBOX || null, record_id = null }) {
  if (!["GPT_PROVIDER_ART", "GPT_OPERATOR_HANDOFF"].includes(provenance)) return null;
  const h = fsha(file), subs = outbox && path.join(path.resolve(outbox), "submissions");
  if (subs && fs.existsSync(subs)) for (const j of fs.readdirSync(subs)) { const jd = path.join(subs, j); if (!fs.statSync(jd).isDirectory()) continue;
    for (const k of fs.readdirSync(jd)) { const sd = path.join(jd, k); if (!fs.existsSync(path.join(sd, "RESULT.sha256"))) continue; let r; try { r = loadResult(sd); } catch { continue; }
      const c = (r.record.candidates || []).find((x) => x.sha256 === h && x.valid === true); if (c && r.record.provenance_to_ingest === provenance) return { artjob: j, submission: k, candidate_id: c.id, record_sha256: r.record_sha256, origin_verification: r.record.origin_verification || "PROVIDER_API_RESPONSE" }; } }
  throw err("PROVENANCE_COUNTERFEIT", { record_id, reason: `provenance ${provenance} claimed for ${path.basename(file)} but no sealed ${provenance} record in the outbox contains these bytes as a valid candidate`, producer: "engine/art_bridge/art_intake.mjs#requireProvenanceLineage", repair_owner: "ART_OPERATOR", resume_at: "SUBMIT_OR_IMPORT_CANDIDATE" });
}
// shot_usage from the action graph (which shot shows this asset on which frames) — the asset carries its own motion obligation
function shotUsage(doc, p) {
  const plan = { assets: [p] }, r = requirementsFor(doc, plan).get(p.asset_id); if (!r) return [];
  return doc.shots.flatMap((s) => r.spans.filter(([a, b]) => a < s.end_frame && s.start_frame < b).map(([a, b]) => ({ shot_id: s.id, frame_range: [Math.max(a, s.start_frame), Math.min(b, s.end_frame)] })));
}
function assetRecord(doc, p, fields, provenance, receiptRef, lineage = null) {
  const I = doc.identities.find((i) => i.id === p.identity_id);
  return { id: p.asset_id, identity_id: p.identity_id, kind: p.kind, file: fields.file, sha256: fields.sha256, width_px: fields.width_px, height_px: fields.height_px, alpha_mode: p.alpha_mode, color_space: "sRGB",
    approved_review_id: null, provider_receipt_id: receiptRef, canonical_rect: fields.canonical_rect, source_pixel_crop: fields.source_pixel_crop, crop_to_canonical_matrix: fields.crop_to_canonical_matrix,
    coordinate_space: KIND_SPACE[I.kind] || "CHARACTER_LOCAL", parent_part_id: null, pivot_xy: fields.pivot_xy, pivot_landmark_id: fields.pivot_landmark_id, sockets: {}, landmarks: fields.landmarks, layer_owner: p.identity_id,
    draw_order_constraints: p.draw_order || [], depth_band: p.depth_band || "FOCAL", render_scale_range: [0.25, 2], view_id: p.view_id || "front", pose_id: p.pose_id, expression_id: p.expression_id, hidden_surfaces: p.hidden_surfaces || [],
    underpaint_asset_ids: fields.underpaint_asset_ids || [], mask_asset_ids: [], occluder_asset_ids: [], material_plane_ids: [], camera_footprint: null, overscan_rect: p.overscan_rect, motion_modes_allowed: ["RIGID", "ARTICULATED", "CAMERA_WORLD", "TRANSITION", "REGISTERED_CELS", "PROCEDURAL"],
    incompatible_states: [], valid_interpolation_targets: [], required_contact_sockets: [], shot_usage: shotUsage(doc, p), provenance_class: provenance, provider_lineage: lineage };
}
/** reviewed landmark sidecar: values + reviewer + its own hash (bound into the registration receipt, re-audit hardening 2) */
const sidecar = (f) => { const j = readJ(f); if (!j.landmarks || !j.reviewed_by) throw err("UNREGISTERED_PIVOT", { reason: `landmark sidecar ${f} needs {landmarks:{name:[x,y]}, reviewed_by, method}: unreviewed correspondences are not accepted` }); return { ...j, sha256: fsha(f) }; };

/** planned alpha contract (re-audit hardening 1): the DELIVERED pixels must satisfy the plan; the requirement is never rewritten to fit them */
export function checkAlphaContract(asset, planned, png) {
  const { transparent, partial } = png.alpha;
  if (planned === "OPAQUE" && (transparent || partial)) throw err("ALPHA_INVALID", { record_id: asset, reason: `planned OPAQUE but delivered pixels contain ${transparent} transparent and ${partial} partial-alpha pixels` });
  if ((planned === "STRAIGHT" || planned === "PREMULTIPLIED") && (!png.hasAlphaChannel || transparent === 0)) throw err("ALPHA_INVALID", { record_id: asset, reason: `planned ${planned} (true transparency) but delivered pixels have no transparent pixel: an opaque/keyed image is not a cutout` });
  if (planned === "BINARY_MASK" && partial > 0) throw err("ALPHA_INVALID", { record_id: asset, reason: `planned BINARY_MASK but ${partial} pixels have partial alpha` });
}

/** plan contract (re-audit B2): every hidden surface names its owning UNDERPAINT asset of the same identity, painted BELOW the owner */
export function validatePlanContract(doc, plan) {
  const errs = [], byId = new Map(plan.assets.map((a) => [a.asset_id, a]));
  for (const p of plan.assets) {
    const map = p.surface_underpaint || {};
    for (const s of p.hidden_surfaces || []) {
      const u = map[s], up = u && byId.get(u);
      if (!u) { errs.push(err("MISSING_UNDERPAINT", { record_id: p.asset_id, dependency: s, reason: `hidden surface ${s} has no owning underpaint in surface_underpaint` })); continue; }
      if (!up || up.kind !== "UNDERPAINT" || up.identity_id !== p.identity_id) { errs.push(err("MISSING_UNDERPAINT", { record_id: p.asset_id, dependency: u, reason: `surface ${s} maps to ${u}, which is not a planned UNDERPAINT of identity ${p.identity_id}` })); continue; }
      const below = (up.draw_order || []).some((o) => o.relation === "BELOW" && o.asset_id === p.asset_id) || (p.draw_order || []).some((o) => o.relation === "ABOVE" && o.asset_id === u);
      const above = (up.draw_order || []).some((o) => o.relation === "ABOVE" && o.asset_id === p.asset_id) || (p.draw_order || []).some((o) => o.relation === "BELOW" && o.asset_id === u);
      if (!below || above) errs.push(err("OCCLUSION_CONFLICT", { record_id: u, dependency: p.asset_id, reason: `underpaint ${u} must be explicitly painted BELOW its owner ${p.asset_id}` }));
    }
    for (const s of Object.keys(map)) if (!(p.hidden_surfaces || []).includes(s)) errs.push(err("MISSING_UNDERPAINT", { record_id: p.asset_id, dependency: s, reason: `surface_underpaint names ${s}, which is not a declared hidden surface` }));
  }
  return errs;
}

export async function ingestMaster({ film, asset, file, landmarks, provenance, maxResidualPx = 1.0, mode = "SIMILARITY", outbox = undefined }) {
  if (!PROVENANCE.includes(provenance)) throw new Error(`provenance must be one of ${PROVENANCE}`);
  const lineage = requireProvenanceLineage({ file, provenance, outbox, record_id: asset });
  const FILM = path.resolve(film), doc = loadDoc(FILM), plan = loadPlan(FILM), p = plan.assets.find((x) => x.asset_id === asset), I = doc.identities.find((i) => i.canonical_asset_id === asset);
  if (!p || !I) throw new Error(`${asset} is not a planned canonical master`);
  const png = readPNG(file); checkAlphaContract(asset, p.alpha_mode, png);
  const lm = sidecar(landmarks), names = Object.keys(lm.landmarks).filter((k) => k in I.landmarks);
  if (names.length < 3) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `master registration needs ≥3 reviewed landmarks shared with identity ${I.id} (got ${names.length})` });
  // Contract E (FIT_RIG): the APPROVED ART determines the rig. Only the declared frame anchors define the canonical frame; every other landmark
  // is MEASURED from the art and the rig is fitted to it (pixels never move). Without FIT_RIG the legacy mode fits all landmarks to the plan.
  const fitMode = p.registration?.mode === "FIT_RIG", anchors = fitMode ? (p.registration.frame_anchors || []).filter((k) => names.includes(k)) : names;
  if (fitMode && anchors.length < 3) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `FIT_RIG needs >=3 reviewed frame anchors (${(p.registration.frame_anchors || []).join(", ")}); got ${anchors.length}` });
  const T = solveTransform(anchors.map((k) => lm.landmarks[k]), anchors.map((k) => I.landmarks[k]), mode), ap = (q) => [T[0] * q[0] + T[2] * q[1] + T[4], T[1] * q[0] + T[3] * q[1] + T[5]];
  const planned = { ...I.landmarks }, target = (k) => (fitMode && !anchors.includes(k) ? ap(lm.landmarks[k]) : I.landmarks[k]); // measured landmarks are their own target (residual 0 by definition)
  const residuals = names.map((k) => ({ landmark: k, role: anchors.includes(k) ? "FRAME_ANCHOR" : "MEASURED", residual_canonical_px: Math.hypot(ap(lm.landmarks[k])[0] - target(k)[0], ap(lm.landmarks[k])[1] - target(k)[1]) })), maxRes = Math.max(...residuals.map((r) => r.residual_canonical_px));
  const geom = geometryFields(T, [0, 0, png.width, png.height], png.width, png.height); // B1: canonical rect = occupied bbox of the transformed raster
  const regDir = path.join(FILM, "registration", asset); fs.mkdirSync(regDir, { recursive: true });
  const receipt = { asset, identity: I.id, status: maxRes <= maxResidualPx ? "REGISTERED_PENDING_REVIEW" : "REGISTRATION_FAILED", raster_to_canonical: T, scale: Math.sqrt(Math.abs(T[0] * T[3] - T[1] * T[2])), rotation_deg: (Math.atan2(T[1], T[0]) * 180) / Math.PI, residuals, max_residual_px: maxRes, tolerance_px: maxResidualPx,
    registration_mode: fitMode ? "FIT_RIG" : mode, frame_anchors: anchors, provisional_deviation: fitMode ? names.filter((k) => !anchors.includes(k)).map((k) => ({ landmark: k, provisional: planned[k], measured: ap(lm.landmarks[k]), deviation_canonical_px: Math.hypot(ap(lm.landmarks[k])[0] - planned[k][0], ap(lm.landmarks[k])[1] - planned[k][1]) })) : null,
    accepted_geometry: geom, landmark_sidecar: { sha256: lm.sha256, reviewed_by: lm.reviewed_by, method: lm.method || null, landmarks: Object.fromEntries(names.map((k) => [k, lm.landmarks[k]])) }, source: { file: path.basename(file), sha256: fsha(file), width: png.width, height: png.height, alpha: png.alpha }, planned_alpha_mode: p.alpha_mode, provenance };
  const attempt = path.join(regDir, `attempt_${fsha(file).slice(0, 12)}`); writeJ(path.join(attempt, "MASTER_REGISTRATION_RECEIPT.json"), receipt);
  if (receipt.status !== "REGISTERED_PENDING_REVIEW") { log(FILM, { op: "ingest-master", asset, status: receipt.status, max_residual_px: maxRes }); return receipt; }
  writeJ(path.join(regDir, "MASTER_REGISTRATION_RECEIPT.json"), receipt); // only an accepted registration becomes the asset's evidence
  fs.copyFileSync(landmarks, path.join(regDir, "LANDMARK_SIDECAR.json")); // the reviewed correspondences, hash-bound in the receipt
  const dest = path.join(FILM, "assets", "art", `${asset}.png`); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(file, dest);
  const measured = Object.fromEntries(names.map((k) => [k, ap(lm.landmarks[k])]));
  if (fitMode) { const fit = fitRig({ FILM, doc, plan, identity: I, measured, anchors, asset, receipt }); receipt.rig_fit = { receipt: `registration/${asset}/RIG_FIT_RECEIPT.json`, feasibility: fit.feasibility.status };
    writeJ(path.join(regDir, "MASTER_REGISTRATION_RECEIPT.json"), receipt); writeJ(path.join(attempt, "MASTER_REGISTRATION_RECEIPT.json"), receipt); }
  const rootJ = doc.rigs.find((r) => r.identity_id === I.id)?.root_part, pivotId = names.includes(rootJ) ? rootJ : names[0];
  const fields = { file: path.relative(FILM, dest).split(path.sep).join("/"), sha256: fsha(dest), ...geom, pivot_xy: measured[pivotId], pivot_landmark_id: pivotId, landmarks: measured };
  const rec = assetRecord(doc, { ...p, kind: ["WORLD_PLANE", "TRANSITION_PLATE", "MASK"].includes(p.kind) ? p.kind : "MASTER" }, fields, provenance, `masterreg_${asset}`, lineage);
  doc.assets = doc.assets.filter((a) => a.id !== asset).concat(rec); I.master_sha256 = fields.sha256; I.approved_review_id = null; // new pixels always need a new review
  saveDoc(FILM, doc); log(FILM, { op: "ingest-master", asset, sha256: fields.sha256, max_residual_px: maxRes, status: receipt.status, canonical_rect: geom.canonical_rect });
  return receipt;
}

/* ───────────── Contract E: fit the rig to the approved art, then prove the planned action is still feasible ───────────── */
/** fitRig — rig joints, identity landmarks and planned part pivots take the MEASURED art positions (frame anchors stay the frame).
 *  Proportions are the art's: limb lengths change, pixels never do. The planned action is then re-solved (checkRigFeasibility). */
/** fitInterfacesToMeasured(rigs, identity, measured, anchors) — PURE interface fit for ANY family: every rig joint/hinge whose landmark was
 *  measured on the approved art takes the measured position (frame anchors stay the frame); identity landmarks follow. Returns the changes. */
export function fitInterfacesToMeasured(rigs, I, measured, anchors) {
  const joints = [], limb_changes = [];
  for (const [k, v] of Object.entries(measured)) if (!anchors.includes(k)) I.landmarks[k] = v;
  for (const rig of rigs) { const before = Object.fromEntries(rig.joints.map((j) => [j.id, j.rest_xy]));
    for (const j of rig.joints) if (j.id in measured && !anchors.includes(j.id)) { joints.push({ rig: rig.id, joint: j.id, before: j.rest_xy, after: measured[j.id] }); j.rest_xy = measured[j.id]; }
    const after = Object.fromEntries(rig.joints.map((j) => [j.id, j.rest_xy])), Lb = (m, j) => { const P = rig.joints.find((x) => x.id === j)?.parent_id; return P && m[P] && m[j] ? Math.hypot(m[j][0] - m[P][0], m[j][1] - m[P][1]) : null; };
    limb_changes.push(...rig.joints.filter((j) => j.parent_id).map((j) => ({ rig: rig.id, bone: `${j.parent_id}->${j.id}`, provisional_length: Lb(before, j.id), fitted_length: Lb(after, j.id) })).filter((x) => x.provisional_length).map((x) => ({ ...x, ratio: x.fitted_length / x.provisional_length }))); }
  return { joints, limb_changes };
}
function fitRig({ FILM, doc, plan, identity: I, measured, anchors, asset, receipt }) {
  const rig = doc.rigs.find((r) => r.identity_id === I.id), { joints, limb_changes } = fitInterfacesToMeasured(doc.rigs.filter((r) => r.identity_id === I.id), I, measured, anchors);
  const pivots = []; for (const a of plan.assets.filter((x) => x.identity_id === I.id && x.pivot_landmark_id && x.pivot_landmark_id in measured && !anchors.includes(x.pivot_landmark_id))) { pivots.push({ asset: a.asset_id, before: a.pivot_xy, after: measured[a.pivot_landmark_id] }); a.pivot_xy = measured[a.pivot_landmark_id]; }
  writeJ(path.join(FILM, PLAN), plan);
  const feasibility = feasibilityFor(FILM, doc, I.id, null);
  const fit = { asset, identity: I.id, rig: rig?.id || null, pixels_changed: false, master_sha256: receipt.source.sha256, frame_anchors: anchors, joints, limb_changes, planned_pivots_updated: pivots, feasibility,
    rule: "the approved art determines the rig; if the planned action is infeasible the action is RESTAGED (approved) or new pose art is requested; proportions are never distorted", at: new Date().toISOString() };
  writeJ(path.join(FILM, "registration", asset, "RIG_FIT_RECEIPT.json"), fit); log(FILM, { op: "fit-rig", asset, joints: joints.length, feasibility: feasibility.status });
  return fit;
}
const motionPlansFor = (FILM) => { const H = path.join(FILM, "handoff"), out = []; for (const x of fs.readdirSync(H)) { const m = x.match(/^MOTION_PLAN(?:_(.+))?\.json$/); if (m) out.push({ shot: m[1] || null, file: x, plan: readJ(path.join(H, x)) }); } return out; };
// P04 §4.1–4.2: feasibility is EXECUTED, never inferred. Every action of the identity (contact or not) is evaluated through the COMPLETE planned
// pipeline (stateAtFrame: primary tracks, acting, phrases, contacts, channels, deformation, morphs, reactions, support, paint passes) on EVERY
// frame; exceptions are recorded per frame, never skipped. Zero evaluations can never be FEASIBLE: no applicable action -> NOT_APPLICABLE,
// applicable actions without a matching motion plan / no evaluated frame -> FEASIBILITY_NOT_EVALUATED (a failing status).
function feasibilityFor(FILM, doc, identityId, motionPlan) {
  const rigs = new Set(doc.rigs.filter((r) => r.identity_id === identityId).map((r) => r.id)), failures = [], checked = [], notEvaluated = [];
  const acts = doc.actions.filter((a) => a.actors.some((x) => rigs.has(x.rig_id)));
  if (!rigs.size) return { status: "NOT_APPLICABLE", reason: "the identity has no rig", failures: [], checked: [], remedy: null };
  if (!acts.length) return { status: "NOT_APPLICABLE", reason: "no action of the film uses this identity's rig (applicable actions 0; nothing to evaluate)", failures: [], checked: [], remedy: null };
  for (const rid of rigs) { const rr = doc.rigs.find((r) => r.id === rid), tl = rigPoseTimeline(rr, doc.actions); for (const e of tl.errors) failures.push({ code: e.code, record_id: rr.id, shot: null, plan: null, frame_range: e.frame_range, reason: e.human_readable_reason });
    const ids = new Set([...rr.pose_states, ...rr.view_states].map((q) => q.id)), hist = (tl.pose || []).slice().sort((x, y) => x.frame - y.frame); let cur = rr.pose_states[0]?.id ?? null;
    for (const e of hist) { if (e.state !== cur && !rr.allowed_state_edges.some((g) => (g.from === cur && g.to === e.state) || (g.from === e.state && g.to === cur && g.reversible))) failures.push({ code: "UNSUPPORTED_STATE_EDGE", record_id: e.source, shot: e.shot, frame_range: [e.frame, e.frame + 1], reason: `pose change ${cur} -> ${e.state} (film history) has no approved state edge in ${rr.id}` }); cur = e.state; }
    for (const a of acts) if (a.actors.some((x) => x.rig_id === rid)) {
      for (const e of a.pose_events || []) if (!ids.has(e.state_id) && !doc.rigs.some((r2) => r2.id !== rr.id && [...r2.pose_states, ...r2.view_states].some((q) => q.id === e.state_id))) failures.push({ code: "UNSUPPORTED_STATE_EDGE", record_id: a.id, shot: a.shot_id, frame_range: [e.frame, e.frame + 1], reason: `state ${e.state_id} is not in rig ${rr.id}` });
      for (const v of a.view_events || []) { if (!ids.has(v.to_state) && !doc.rigs.some((r2) => r2.id !== rr.id && [...r2.pose_states, ...r2.view_states].some((q) => q.id === v.to_state))) failures.push({ code: "UNSUPPORTED_VIEW", record_id: a.id, shot: a.shot_id, frame_range: [v.frame, v.frame + 1], reason: `view state ${v.to_state} is not in rig ${rr.id}` }); else if (!rr.allowed_state_edges.some((g) => g.from === v.from_state && g.to === v.to_state)) failures.push({ code: "UNSUPPORTED_STATE_EDGE", record_id: a.id, shot: a.shot_id, frame_range: [v.frame, v.frame + 1], reason: `no allowed edge ${v.from_state} -> ${v.to_state}` }); } }
    for (const ce of channelEvents(rr, doc.actions).errors) failures.push({ code: ce.code, record_id: rr.id, shot: null, frame_range: ce.frame_range, reason: ce.human_readable_reason || ce.message }); }
  const rigRev = crypto.createHash("sha256").update(JSON.stringify(doc.rigs.filter((r) => rigs.has(r.id)))).digest("hex");
  for (const sh of doc.shots.filter((s) => acts.some((a) => a.shot_id === s.id))) {
    const plans = motionPlan ? [{ shot: sh.id, file: "(supplied restaging plan)", plan: motionPlan }] : motionPlansFor(FILM).filter((p) => !p.shot || p.shot === sh.id), ids = acts.filter((x) => x.shot_id === sh.id).map((x) => x.id);
    if (!plans.length) { notEvaluated.push({ shot: sh.id, actions: ids, reason: "no motion plan matches this shot: nothing was executed" }); continue; }
    for (const mp of plans) {
      let C; try { C = compileMotionTracks(doc.actions, doc.shots, { doc, plan: mp.plan, requireApproval: false }); } catch (e) { failures.push({ code: "MOTION_COMPILE_FAILED", shot: sh.id, plan: mp.file, reason: String(e.message).slice(0, 300), errors: (e.errors || []).slice(0, 8).map((x) => `${x.code} ${x.record_id}`) }); continue; }
      const wanted = new Set(); for (const a of acts.filter((x) => x.shot_id === sh.id)) for (let f = Math.max(a.frame_range[0], sh.start_frame); f < Math.min(a.frame_range[1], sh.end_frame); f++) wanted.add(f);
      const bad = {}; let ev = 0, paintPending = 0; const contactsChecked = new Set(), pendingArt = new Set();
      for (const f of [...wanted].sort((x, y) => x - y)) { let st; try { st = stateAtFrame(C, f); } catch (e) { if (e.code === "MISSING_ART_ASSET") { // art for this frame is not delivered yet: the PHYSICAL motion is still fully evaluated; paint/occlusion feasibility is recorded as pending on those drawings
          try { const sh2 = C.shotAt(f), prim = C.evalPrimary(f, sh2), contacts = C.contactsAt(f), con = C.solveConstraints(f, prim, contacts); st = { contacts: con.solved, failures: con.failures, physical_only: true }; paintPending++; pendingArt.add(e.record_id || e.dependency || "?"); } catch (e2) { const c2 = e2.code || "EXCEPTION"; (bad[`FRAME_EVALUATION_FAILED|${c2}`] ||= { code: "FRAME_EVALUATION_FAILED", record_id: c2, shot: sh.id, plan: mp.file, frames: [], reason: `${c2}: ${e2.human_readable_reason || e2.message}`.slice(0, 300) }).frames.push(f); continue; } }
        else { const code = e.code || "EXCEPTION"; (bad[`FRAME_EVALUATION_FAILED|${code}`] ||= { code: "FRAME_EVALUATION_FAILED", record_id: code, shot: sh.id, plan: mp.file, frames: [], reason: `${code}: ${e.human_readable_reason || e.message}`.slice(0, 300) }).frames.push(f); continue; } }
        ev++; for (const c of st.contacts) contactsChecked.add(`${c.action}:${c.socket}`); for (const e of st.failures) { const k = `${e.code}|${e.record_id}`; (bad[k] ||= { code: e.code, record_id: e.record_id, shot: sh.id, plan: mp.file, frames: [], reason: e.human_readable_reason || e.message }).frames.push(f); } }
      for (const b of Object.values(bad)) { const { frames: fr, ...rest } = b; failures.push({ ...rest, frame_range: [Math.min(...fr), Math.max(...fr) + 1], frame_count: fr.length }); }
      if (ev !== wanted.size) failures.push({ code: "FRAME_EVALUATION_FAILED", record_id: null, shot: sh.id, plan: mp.file, reason: `${wanted.size - ev} of ${wanted.size} required frames could not be evaluated` });
      checked.push({ shot: sh.id, plan: mp.file, plan_sha256: mp.plan ? crypto.createHash("sha256").update(JSON.stringify(mp.plan)).digest("hex") : null, rig_revision_sha256: rigRev, actions: ids, frames_expected: wanted.size, frames_evaluated: ev, contacts_checked: [...contactsChecked], contact_frames: wanted.size, frames_checked: ev, paint_pending_frames: paintPending, paint_pending_art: [...pendingArt], complete: paintPending === 0 });
    }
  }
  const evaluated = checked.reduce((n, c) => n + c.frames_evaluated, 0), expected = checked.reduce((n, c) => n + c.frames_expected, 0);
  if (notEvaluated.length || !checked.length || !expected || evaluated === 0) return { status: "FEASIBILITY_NOT_EVALUATED", failures: [...failures, ...notEvaluated.map((n) => ({ code: "FEASIBILITY_NOT_EVALUATED", record_id: identityId, shot: n.shot, reason: `${n.reason} (actions ${n.actions})` }))], checked, not_evaluated: notEvaluated, remedy: "supply the motion plan(s) that own these actions; feasibility is a demonstrated result, never an absence of failures" };
  const paintPend = checked.reduce((n, c) => n + c.paint_pending_frames, 0); return { status: failures.length ? "INFEASIBLE_REQUIRES_RESTAGING_OR_NEW_POSE_ART" : "FEASIBLE", complete: !paintPend, paint_pending_frames: paintPend, paint_pending_art: [...new Set(checked.flatMap((c) => c.paint_pending_art))], failures, checked, remedy: failures.length ? "approved restaging of the action (placement/timing/targets) or new pose art; never distort the approved proportions" : null };
}
/** checkRigFeasibility({film, identity, motionPlan?}) — re-solve every contact frame of the identity's actions on the CURRENT (fitted) rig */
export async function checkRigFeasibility({ film, identity, motionPlan = null }) { const FILM = path.resolve(film); return feasibilityFor(FILM, loadDoc(FILM), identity, motionPlan); }

/** review attestation: human=true requires an interactive operator; otherwise the receipt is DIAGNOSTIC (re-audit hardening 5) */
async function attestationFor(doc, FILM, scope, id, { human = false, reviewer, attestation = null }) {
  if (attestation) return attestation;
  if (!human) return null;
  return attestHuman({ reviewer, bundle_sha256: bundleHash(bundleFor(doc, scope, id, FILM)) });
}
const pointer = (verdict, receipt) => (verdict === "APPROVED" ? receipt.receipt_id : null); // any non-approval clears the current pointer

export async function reviewMaster({ film, identity, reviewer, verdict, notes = "", scope_note = "", evidence = [], human = false, attestation = null }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), I = doc.identities.find((i) => i.id === identity); if (!I) throw new Error(`unknown identity ${identity}`);
  const m = doc.assets.find((a) => a.id === I.canonical_asset_id); if (!m) throw new Error(`master ${I.canonical_asset_id} not ingested`);
  if (m.sha256 !== I.master_sha256) throw err("ART_IDENTITY_DRIFT", { record_id: identity, reason: "identity master hash does not match the ingested master" });
  const ev = verifyRegistrationReceipt(FILM, doc, m); if (!ev.ok) throw new Error(`refused: master registration evidence invalid (${ev.reasons.join("; ")})`);
  const set = attestation?.method === "SIGNED_ENVELOPE_SET" ? attestation : null, att = set ? set.asset : await attestationFor(doc, FILM, "asset", m.id, { human, reviewer, attestation }), attI = set ? set.identity : att, evd = [`registration/${m.id}/MASTER_REGISTRATION_RECEIPT.json`, ...evidence], rev = revision();
  const ra = writeReceipt(FILM, doc, { scope: "asset", id: m.id, reviewer, verdict, notes, evidence: evd, scope_note, revision: rev, attestation: att }); m.approved_review_id = pointer(verdict, ra);
  const ri = writeReceipt(FILM, doc, { scope: "identity", id: identity, reviewer, verdict, notes, evidence: evd, scope_note, revision: rev, attestation: attI }); I.approved_review_id = pointer(verdict, ri);
  saveDoc(FILM, doc); log(FILM, { op: "review-master", identity, verdict, reviewer, reviewer_kind: ra.reviewer_kind, receipts: [ra.receipt_id, ri.receipt_id] });
  return { verdict, reviewer_kind: ra.reviewer_kind, receipts: [ra.receipt_id, ri.receipt_id] };
}

function masterApproved(doc, FILM, masterId) {
  const m = doc.assets.find((a) => a.id === masterId), I = doc.identities.find((i) => i.canonical_asset_id === masterId);
  if (!m || !I) return { ok: false, reason: `master ${masterId} not ingested` };
  const va = verifyApproval(doc, FILM, "asset", m.id, m.approved_review_id), vi = verifyApproval(doc, FILM, "identity", I.id, I.approved_review_id);
  return va.ok && vi.ok ? { ok: true, master: m, identity: I } : { ok: false, reason: `master ${masterId} not approved (${va.status}/${vi.status})` };
}

export async function ingestPart({ film, asset, file, landmarks, provenance, maxResidualPx = 1.0, mode = "SIMILARITY", outbox = undefined }) {
  if (!PROVENANCE.includes(provenance)) throw new Error(`provenance must be one of ${PROVENANCE}`);
  const lineage = requireProvenanceLineage({ file, provenance, outbox, record_id: asset });
  const FILM = path.resolve(film), doc = loadDoc(FILM), plan = loadPlan(FILM), p = plan.assets.find((x) => x.asset_id === asset);
  if (!p || !p.derived_from) throw new Error(`${asset} is not a planned derived state`);
  const contract = validatePlanContract(doc, { assets: plan.assets.filter((x) => x.asset_id === asset || Object.values(p.surface_underpaint || {}).includes(x.asset_id)) }).filter((e) => e.record_id === asset || e.dependency === asset);
  if (contract.length) throw err(contract[0].code, { record_id: asset, reason: `refused by plan contract: ${contract.map((e) => e.human_readable_reason).join("; ")}` });
  const ma = masterApproved(doc, FILM, p.derived_from); if (!ma.ok) throw new Error(`refused: ${ma.reason}; derived art is registered only against an approved master`);
  const png = readPNG(file); checkAlphaContract(asset, p.alpha_mode, png);
  const m = ma.master, lm = sidecar(landmarks), M = cropToCanonical(m), Minv = inv(M), ap = (A, q) => [A[0] * q[0] + A[2] * q[1] + A[4], A[1] * q[0] + A[3] * q[1] + A[5]];
  const ident = ma.identity, names = Object.keys(lm.landmarks).filter((k) => k in ident.landmarks);
  // ≥3 correspondences: a 4-DOF similarity fitted to 2 points has zero residual by construction, so a wrong landmark could never be detected
  if (names.length < 3) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `part registration needs ≥3 reviewed landmarks shared with identity ${ident.id} (got ${names.length}); two points cannot reveal a misregistration` });
  if (!names.includes(p.pivot_landmark_id)) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `reviewed landmarks must include the pivot landmark ${p.pivot_landmark_id}` });
  const masterPx = Object.fromEntries(names.map((k) => [k, ap(Minv, m.landmarks[k] ?? ident.landmarks[k])]));
  const underpaintIds = (p.hidden_surfaces || []).map((s) => p.surface_underpaint[s]); // B2: ownership carried from the plan contract
  const masterScale = Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2]));
  const rec = registerPart({ partId: asset, master: path.join(FILM, m.file), rawPart: file, canonicalLandmarks: masterPx, partLandmarks: Object.fromEntries(names.map((k) => [k, lm.landmarks[k]])), pivotId: p.pivot_landmark_id, underpaintIds, hiddenSurfaces: p.hidden_surfaces || [], mode, requirePivotOnArt: p.kind !== "MASK",
    maxResidualPx: maxResidualPx / masterScale, sidecar: { sha256: lm.sha256, reviewed_by: lm.reviewed_by, method: lm.method || null, landmarks: Object.fromEntries(names.map((k) => [k, lm.landmarks[k]])) }, outDir: path.join(FILM, "registration", asset, `attempt_${fsha(file).slice(0, 12)}`) });
  rec.master_asset_id = m.id; rec.master_sha256 = m.sha256; rec.tolerance_px = maxResidualPx / masterScale; rec.planned_alpha_mode = p.alpha_mode;
  writeJ(path.join(path.dirname(rec.approved_part_file), `${asset}__REGISTRATION_RECEIPT.json`), rec);
  if (rec.failures.length) { log(FILM, { op: "ingest-part", asset, status: "REGISTRATION_FAILED", failures: rec.failures, attempt: path.basename(path.dirname(rec.approved_part_file)) }); return { status: "REGISTRATION_FAILED", failures: rec.failures, receipt: rec }; }
  for (const f of [`${asset}__REGISTRATION_RECEIPT.json`, `${asset}__overlay_on_master.png`, `${asset}__difference.png`]) fs.copyFileSync(path.join(path.dirname(rec.approved_part_file), f), path.join(FILM, "registration", asset, f));
  fs.copyFileSync(landmarks, path.join(FILM, "registration", asset, "LANDMARK_SIDECAR.json"));
  // B1: raw part px → master px (receipt) → canonical (master affine); the approved file is the crop, so its affine includes the crop origin
  const Tc = mul(M, rec.raster_to_canonical), geom = geometryFields(Tc, rec.source_pixel_crop_in_raw, rec.manifest_fields.width_px, rec.manifest_fields.height_px);
  const dest = path.join(FILM, "assets", "art", `${asset}.png`); fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(rec.approved_part_file, dest);
  const measured = Object.fromEntries(names.map((k) => [k, ap(Tc, lm.landmarks[k])]));
  const fields = { file: path.relative(FILM, dest).split(path.sep).join("/"), sha256: fsha(dest), width_px: geom.width_px, height_px: geom.height_px, canonical_rect: geom.canonical_rect, source_pixel_crop: [0, 0, geom.width_px, geom.height_px], crop_to_canonical_matrix: geom.crop_to_canonical_matrix, pivot_xy: measured[p.pivot_landmark_id], pivot_landmark_id: p.pivot_landmark_id, landmarks: measured, underpaint_asset_ids: underpaintIds };
  const a = assetRecord(doc, p, fields, provenance, `partreg_${asset}`, lineage);
  doc.assets = doc.assets.filter((x) => x.id !== asset).concat(a); saveDoc(FILM, doc);
  log(FILM, { op: "ingest-part", asset, kind: p.kind, sha256: fields.sha256, master: m.id, max_residual_px: rec.max_residual_px, canonical_rect: geom.canonical_rect, underpaint_asset_ids: underpaintIds });
  return { status: "REGISTERED_PENDING_REVIEW", asset, kind: p.kind, receipt: rec, crop_to_canonical: geom.crop_to_canonical_matrix, canonical_rect: geom.canonical_rect };
}

/** P03 E: ingest an approved VECTOR_PATH drawing (SVG of absolute-command <path> elements, e.g. a provider/GPT vector export). Registration is a
 *  least-squares similarity from ≥3 reviewed landmarks onto the approved master's canonical landmarks (residual-checked, never forced); the
 *  registered paths are written in CANONICAL coordinates to an approved SVG whose bytes are hashed, and recorded on the asset (vector_paths). */
export function parseSvgPaths(text) { const out = []; for (const m of String(text).matchAll(/<path\b([^>]*)\/?>/g)) { const at = (n) => (m[1].match(new RegExp(`\\s${n}="([^"]*)"`)) || [])[1]; const d = at("d"); if (!d) continue; out.push({ d: d.trim(), fill: at("fill") || "none", ...(at("stroke") ? { stroke: at("stroke"), stroke_width: +(at("stroke-width") || 1) } : {}) }); } return out; }
function fitSimilarity(src, dst) { const n = src.length, ms = [0, 1].map((k) => src.reduce((s, p) => s + p[k], 0) / n), md = [0, 1].map((k) => dst.reduce((s, p) => s + p[k], 0) / n); let a = 0, b = 0, ss = 0;
  for (let i = 0; i < n; i++) { const x = src[i][0] - ms[0], y = src[i][1] - ms[1], u = dst[i][0] - md[0], v = dst[i][1] - md[1]; a += x * u + y * v; b += x * v - y * u; ss += x * x + y * y; }
  const c = a / ss, s = b / ss; return [c, s, -s, c, md[0] - c * ms[0] + s * ms[1], md[1] - s * ms[0] - c * ms[1]]; }
export async function ingestVectorPart({ film, asset, file, landmarks, provenance, maxResidualPx = 1.0, outbox = undefined }) {
  if (!PROVENANCE.includes(provenance)) throw new Error(`provenance must be one of ${PROVENANCE}`);
  const lineage = requireProvenanceLineage({ file, provenance, outbox, record_id: asset });
  const FILM = path.resolve(film), doc = loadDoc(FILM), plan = loadPlan(FILM), p = plan.assets.find((x) => x.asset_id === asset);
  if (!p || !p.derived_from || p.kind !== "VECTOR_PATH") throw new Error(`${asset} is not a planned derived VECTOR_PATH state`);
  const ma = masterApproved(doc, FILM, p.derived_from); if (!ma.ok) throw new Error(`refused: ${ma.reason}; derived art is registered only against an approved master`);
  const { parsePath } = await import("./deform.mjs"), paths = parseSvgPaths(fs.readFileSync(file, "utf8")); if (!paths.length) throw err("MISSING_ART_ASSET", { record_id: asset, reason: "delivered SVG contains no <path d> elements" });
  for (const q of paths) parsePath(q.d); // absolute M/L/C/Q/Z only (relative commands are refused, not guessed)
  const lm = sidecar(landmarks), ident = ma.identity, names = Object.keys(lm.landmarks).filter((k) => k in ident.landmarks);
  if (names.length < 3) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `vector registration needs ≥3 reviewed landmarks shared with identity ${ident.id} (got ${names.length})` });
  if (!names.includes(p.pivot_landmark_id)) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `reviewed landmarks must include the pivot landmark ${p.pivot_landmark_id}` });
  const Tm = fitSimilarity(names.map((k) => lm.landmarks[k]), names.map((k) => ident.landmarks[k])), ap = (q) => [Tm[0] * q[0] + Tm[2] * q[1] + Tm[4], Tm[1] * q[0] + Tm[3] * q[1] + Tm[5]];
  const residual = Math.max(...names.map((k) => { const q = ap(lm.landmarks[k]); return Math.hypot(q[0] - ident.landmarks[k][0], q[1] - ident.landmarks[k][1]); }));
  if (residual > maxResidualPx) { log(FILM, { op: "ingest-vector", asset, status: "REGISTRATION_FAILED", max_residual: residual }); return { status: "REGISTRATION_FAILED", failures: [{ code: "REGISTRATION_RESIDUAL", reason: `landmark residual ${residual.toFixed(3)} > ${maxResidualPx}` }] }; }
  const num = (v) => +v.toFixed(3), canon = paths.map((q) => ({ ...q, d: parsePath(q.d).map((s) => s.cmds.map((c) => `${c.c}${c.pts.map((pt) => ap(pt).map(num).join(" ")).join(" ")}`).join(" ") + (s.closed ? " Z" : "")).join(" ") }));
  const pts = canon.flatMap((q) => parsePath(q.d).flatMap((s) => s.cmds.flatMap((c) => c.pts))), x0 = Math.min(...pts.map((q) => q[0])), y0 = Math.min(...pts.map((q) => q[1])), x1 = Math.max(...pts.map((q) => q[0])), y1 = Math.max(...pts.map((q) => q[1]));
  const pivot = ident.landmarks[p.pivot_landmark_id]; if (pivot[0] < x0 || pivot[0] > x1 || pivot[1] < y0 || pivot[1] > y1) throw err("UNREGISTERED_PIVOT", { record_id: asset, reason: `pivot ${p.pivot_landmark_id} lies outside the delivered vector drawing` });
  const W = Math.max(1, Math.ceil(x1 - x0)), H = Math.max(1, Math.ceil(y1 - y0)), dest = path.join(FILM, "assets", "art", `${asset}.svg`); fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `<svg xmlns="http://www.w3.org/2000/svg" data-registered="canonical" viewBox="${num(x0)} ${num(y0)} ${W} ${H}">${canon.map((q) => `<path d="${q.d}" fill="${q.fill}"${q.stroke ? ` stroke="${q.stroke}" stroke-width="${q.stroke_width}"` : ""}/>`).join("")}</svg>\n`);
  fs.mkdirSync(path.join(FILM, "registration", asset), { recursive: true }); fs.copyFileSync(landmarks, path.join(FILM, "registration", asset, "LANDMARK_SIDECAR.json"));
  const sideFile = path.join(FILM, "registration", asset, "LANDMARK_SIDECAR.json"), rec = { asset, status: "PENDING_REVIEW", method: "VECTOR_LANDMARK_SIMILARITY", source_sha256: fsha(file), approved_sha256: fsha(dest), source_to_canonical: Tm, max_residual_px: residual, tolerance_px: maxResidualPx, landmark_sidecar: { reviewed_by: lm.reviewed_by, sha256: fsha(sideFile), landmarks: Object.fromEntries(names.map((k) => [k, lm.landmarks[k]])) }, failures: [], at: new Date().toISOString() }; writeJ(path.join(FILM, "registration", asset, `${asset}__REGISTRATION_RECEIPT.json`), rec);
  const measured = Object.fromEntries(names.map((k) => [k, ap(lm.landmarks[k])])), fields = { file: path.relative(FILM, dest).split(path.sep).join("/"), sha256: fsha(dest), width_px: W, height_px: H, canonical_rect: [num(x0), num(y0), W, H], source_pixel_crop: [0, 0, W, H], crop_to_canonical_matrix: [1, 0, 0, 1, num(x0), num(y0)], pivot_xy: pivot, pivot_landmark_id: p.pivot_landmark_id, landmarks: measured };
  const a = assetRecord(doc, p, fields, provenance, `vecreg_${asset}`, lineage); a.vector_paths = canon; a.motion_modes_allowed = [...new Set([...a.motion_modes_allowed, "REGISTERED_MORPH"])];
  doc.assets = doc.assets.filter((x) => x.id !== asset).concat(a); saveDoc(FILM, doc); log(FILM, { op: "ingest-vector", asset, sha256: fields.sha256, max_residual: residual, paths: canon.length });
  return { status: "REGISTERED_PENDING_REVIEW", asset, kind: "VECTOR_PATH", receipt: rec };
}
export async function reviewPart({ film, asset, reviewer, verdict, notes = "", scope_note = "", human = false, attestation = null }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), a = doc.assets.find((x) => x.id === asset); if (!a) throw new Error(`asset ${asset} not ingested`);
  const p = loadPlan(FILM).assets.find((x) => x.asset_id === asset); if (p?.derived_from) { const ma = masterApproved(doc, FILM, p.derived_from); if (!ma.ok) throw new Error(`refused: ${ma.reason}`); }
  const ev = verifyRegistrationReceipt(FILM, doc, a); if (!ev.ok) throw new Error(`refused: registration evidence invalid (${ev.reasons.join("; ")})`);
  const att = await attestationFor(doc, FILM, "asset", asset, { human, reviewer, attestation });
  const r = writeReceipt(FILM, doc, { scope: "asset", id: asset, reviewer, verdict, notes, scope_note, evidence: [`registration/${asset}/${asset}__REGISTRATION_RECEIPT.json`, `registration/${asset}/${asset}__overlay_on_master.png`], revision: revision(), attestation: att });
  a.approved_review_id = pointer(verdict, r); saveDoc(FILM, doc); log(FILM, { op: "review-part", asset, verdict, reviewer, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id });
  return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}
export async function approveState({ film, rig, state, reviewer, verdict, notes = "", scope_note = "", human = false, attestation = null }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), R = doc.rigs.find((x) => x.id === rig), s0 = R && [...R.pose_states, ...R.view_states].find((x) => x.id === state);
  // P03 B: a channel state is addressed "<channel>.<state>"; it is approved against exactly the drawings it shows in its OWN slots
  const [chId, chSt] = state.includes(".") ? state.split(".") : [null, null], ch = !s0 && chId ? (R?.state_channels || []).find((c) => c.id === chId) : null, s = s0 || ch?.states.find((x) => x.id === chSt);
  if (!s) throw new Error(`unknown state ${rig}.${state}`);
  const visible = ch ? [...new Set(ch.slots.map((slot) => s.asset_bindings[slot] ?? slot))] : [...new Set(R.render_parts.map((p) => s.asset_bindings[p.asset_id] ?? p.asset_id))]; // every asset this state shows, defaults included
  for (const aid of visible) { const a = doc.assets.find((x) => x.id === aid); const v = a && verifyApproval(doc, FILM, "asset", aid, a.approved_review_id); if (!v?.ok) throw new Error(`refused: bound asset ${aid} is not approved (${v?.status || "absent"})`); }
  const att = await attestationFor(doc, FILM, "state", `${rig}::${state}`, { human, reviewer, attestation });
  const r = writeReceipt(FILM, doc, { scope: "state", id: `${rig}::${state}`, reviewer, verdict, notes, scope_note, revision: revision(), attestation: att }); s.approved_review_id = pointer(verdict, r); saveDoc(FILM, doc);
  log(FILM, { op: "approve-state", rig, state, verdict, reviewer, reviewer_kind: r.reviewer_kind }); return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}
/** P04 §5.5: approve a deformation map (hash-scoped over geometry + targets + the exact approved asset bytes). Returns the receipt id the plan must carry. */
export async function approveDeform({ film, id, map, reviewer, verdict, notes = "", scope_note = "", attestation = null, human = false }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), bundle = deformBundle(doc, id, map); if (!bundle.asset_sha256) throw new Error(`deform ${id} names asset ${map.asset}, which is not registered`);
  const att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null), r = writeReceipt(FILM, doc, { scope: "deform", id, reviewer, verdict, notes, scope_note, attestation: att, bundle });
  log(FILM, { op: "approve-deform", id, asset: map.asset, verdict, reviewer, reviewer_kind: r.reviewer_kind }); return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}
export async function approveStateEdge({ film, rig, from, to, reviewer, verdict, notes = "", scope_note = "", evidence = [], human = false, attestation = null }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), R = doc.rigs.find((x) => x.id === rig), e = R?.allowed_state_edges.find((x) => x.from === from && x.to === to); if (!e) throw new Error(`unknown edge ${rig} ${from}->${to}`);
  for (const sid of [from, to]) { const s = [...R.pose_states, ...R.view_states].find((x) => x.id === sid); const v = verifyApproval(doc, FILM, "state", `${rig}::${sid}`, s.approved_review_id); if (!v.ok) throw new Error(`refused: state ${sid} not approved (${v.status})`); }
  const att = await attestationFor(doc, FILM, "edge", `${rig}::${from}::${to}`, { human, reviewer, attestation });
  const r = writeReceipt(FILM, doc, { scope: "edge", id: `${rig}::${from}::${to}`, reviewer, verdict, notes, scope_note, evidence, revision: revision(), attestation: att }); e.approved_assembly_review_id = pointer(verdict, r); saveDoc(FILM, doc);
  log(FILM, { op: "approve-edge", rig, from, to, verdict, reviewer, reviewer_kind: r.reviewer_kind }); return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}

/** resumeDependentJobs({film}) → readiness of every derived job; stale masters invalidate dependents (re-manufacture / re-review) */
export async function resumeDependentJobs({ film }) {
  const FILM = path.resolve(film), doc = loadDoc(FILM), plan = loadPlan(FILM), out = [], feasCache = {};
  for (const p of plan.assets) {
    if (!p.derived_from) { const a = doc.assets.find((x) => x.id === p.asset_id), I = doc.identities.find((i) => i.canonical_asset_id === p.asset_id), v = masterApproved(doc, FILM, p.asset_id);
      out.push({ asset: p.asset_id, role: "MASTER", status: !a ? "WAITING_FOR_GPT_ART" : v.ok ? "APPROVED" : I && a.sha256 !== I.master_sha256 ? "STALE_REINGEST_REQUIRED" : "PENDING_REVIEW" }); continue; }
    const ma = masterApproved(doc, FILM, p.derived_from), a = doc.assets.find((x) => x.id === p.asset_id), va = a ? verifyApproval(doc, FILM, "asset", a.id, a.approved_review_id) : null;
    // contract THEN: a fitted rig must make the planned action feasible before any dependent is manufactured (re-solved live, never cached across calls)
    const fitF = path.join(FILM, "registration", p.derived_from, "RIG_FIT_RECEIPT.json"), fitFeas = fs.existsSync(fitF) ? (feasCache[p.derived_from] ||= feasibilityFor(FILM, doc, readJ(fitF).identity, null)) : null;
    if (fitFeas && !["FEASIBLE", "NOT_APPLICABLE"].includes(fitFeas.status)) { out.push({ asset: p.asset_id, role: "DERIVED", derived_from: p.derived_from, status: fitFeas.status === "FEASIBILITY_NOT_EVALUATED" ? "BLOCKED_FEASIBILITY_NOT_EVALUATED" : "BLOCKED_RIG_FIT_INFEASIBLE", reason: fitFeas.remedy, failures: fitFeas.failures.map((x) => `${x.code} ${x.record_id} [${x.frame_range}]`), edit_reference: null }); continue; }
    const status = !ma.ok ? (a ? "INVALIDATED_MASTER_NOT_APPROVED" : "WAITING_ON_MASTER_APPROVAL") : !a ? "READY_FOR_SOURCE_ATTACHED_EDIT" : va.ok ? "APPROVED" : va.status === "STALE_RECEIPT" ? "STALE_REMANUFACTURE_OR_REREVIEW" : "REGISTERED_PENDING_REVIEW";
    out.push({ asset: p.asset_id, role: "DERIVED", derived_from: p.derived_from, status, edit_reference: ma.ok ? { file: ma.master.file, sha256: ma.master.sha256, approval_receipt: ma.master.approved_review_id } : null });
  }
  writeJ(path.join(FILM, "intake", "DEPENDENT_JOB_STATUS.json"), { generated_at: new Date().toISOString(), jobs: out }); log(FILM, { op: "resume-dependent-jobs", counts: out.reduce((m, x) => ((m[x.status] = (m[x.status] || 0) + 1), m), {}) });
  return out;
}

/* ───────────── provider submission (the only production call site of generate/edit) ───────────── */
// Directive E2/N3 precedence, enforced BEFORE any provider is discovered: contract context → story receipt → direction receipt → universal
// gate → design receipt → immutable compiled generation (hashes + dependency digest unchanged) → stage predecessor → master lineage →
// provider authorization/capabilities. Test-trust is honoured only for a loopback TEST STUB endpoint and its output is forced to TEST_STUB
// provenance (never approvable for production). Idempotency key = everything that changes what the provider is asked to do; outputs are
// immutable candidates; a single valid candidate is promoted; nothing is ingested automatically.
const isLoopbackStub = (env) => /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:\d+)?(\/|$)/.test(env.OPENAI_BASE_URL || env.IMAGE_PROVIDER_BASE_URL || "");
const refusal = (job, e) => ({ status: "REFUSED", code: e.code || "UNKNOWN", job, error: e.toJSON ? e.toJSON() : { message: e.message }, provider_called: false });
export async function submitJob({ film, out, job, env = process.env, provenanceOverride = null, maxRetries = 2, stage = null, predecessorCandidate = null }) {
  const FILM = path.resolve(film), cur = readCurrent(out, job);
  if (!cur) return refusal(job, err("ART_CONTRACT_NOT_EVALUATED", { record_id: job, reason: "job not in the outbox CURRENT index (export first)", producer: "engine/art_bridge/art_intake.mjs#submitJob" }));
  const J = cur.job, stub = isLoopbackStub(env), doc = loadDoc(FILM);
  let gate;
  try {
    assertMediumContract(J); assertMotionContext(J);
    const masterJob = J.derived_from ? (await planJobs({ film: FILM })).jobs.find((x) => x.root_dependency === J.derived_from) : null;
    gate = requireApprovedContract({ film: FILM, doc, job: J, masterJob, allowTestTrust: stub });
    if (!cur.compiledDir) throw err("ART_CONTRACT_NOT_EVALUATED", { record_id: job, reason: "no complete compiled generation for this job", producer: "engine/art_bridge/art_intake.mjs#submitJob", resume_at: "EXPORT" });
    const v = verifyGeneration(cur.compiledDir); if (!v.ok) throw err("STALE_COMPILED_REQUEST", { record_id: job, reason: `compiled generation files changed after compilation: ${v.changed}`, producer: "engine/art_bridge/art_intake.mjs#submitJob" });
    const brc = readJ(path.join(cur.compiledDir, "BRIDGE_REQUEST_CONTRACT.json"));
    if (brc.gate?.pass !== true) throw err("ART_CONTRACT_REFUSED", { record_id: job, reason: "compiled contract did not pass" });
    const req = new Set(gate.required_methods.map((m) => m.method)), delivered = new Set((brc.method_delivery || []).map((d) => d.method_id)), missing = [...req].filter((m) => !delivered.has(m));
    if (missing.length) throw err("STALE_COMPILED_REQUEST", { record_id: job, reason: `method delivery incomplete for ${missing}`, producer: "engine/art_bridge/art_intake.mjs#submitJob" });
    if (brc.gate.design_sha256 !== gate.design_sha256) throw err("STALE_COMPILED_REQUEST", { record_id: job, reason: "the approved design differs from the design this request was compiled from", producer: "engine/art_bridge/art_intake.mjs#submitJob", resume_at: "EXPORT" });
    const rd = (await resumeDependentJobs({ film: FILM })).find((r) => r.asset === J.root_dependency), design = readJ(path.join(FILM, "art_designs", `${J.derived_from || J.root_dependency}.design.json`));
    const dg = dependencyDigest({ job: J, design, repairMemory: path.join(FILM, "learning", "REPAIR_MEMORY.json"), editReference: rd?.edit_reference || null, storyBundle: scopeBundle(FILM, "story"), directionBundle: scopeBundle(FILM, "direction"), size: env.IMAGE_PROVIDER_SIZE || "1536x1024", doc });
    if (dg.digest.slice(0, 24) !== cur.digest) throw err("STALE_DEPENDENCY", { record_id: job, reason: "an upstream dependency (design, skill, witnesses, repair memory, master, story/direction, size) changed since this generation; re-export", producer: "engine/art_bridge/art_intake.mjs#submitJob", resume_at: "EXPORT" });
    gate = { ...gate, brc };
  } catch (e) { if (!e.code) throw e; log(FILM, { op: "submit-refused", job, code: e.code }); return refusal(job, e); }
  const brc = gate.brc, stages = brc.stages, k = stage ?? 1, st = stages.find((s) => s.index === k);
  if (!st) return refusal(job, err("ART_CONTRACT_NOT_EVALUATED", { record_id: job, reason: `no stage ${k}` }));
  const request = readJ(path.join(cur.compiledDir, `STAGE_${String(k).padStart(2, "0")}_REQUEST.json`)), manifest = readJ(path.join(cur.compiledDir, "PROVIDER_PRE_SUBMISSION_MANIFEST.json")), witnesses = manifest.source_image_inputs.map((w) => ({ path: w.path, sha256: w.sha256 }));
  for (const w of witnesses) if (!fs.existsSync(w.path) || fsha(w.path) !== w.sha256) return refusal(job, err("UNQUALIFIED_STYLE_ASSET", { record_id: job, reason: `witness mismatch ${w.path}` }));
  let reference = null;
  if (predecessorCandidate) return refusal(job, err("STAGE_PREDECESSOR_MISSING", { record_id: job, reason: "caller-supplied predecessor overrides are refused; select a candidate by ID (selectStageCandidate)", producer: "engine/art_bridge/art_intake.mjs#submitJob" }));
  let masterRef = null;
  if (J.derived_from) { const ma = masterApproved(doc, FILM, J.derived_from); if (!ma.ok) return refusal(job, err("UNAPPROVED_ART", { record_id: job, reason: ma.reason })); masterRef = { path: path.join(FILM, ma.master.file), sha256: ma.master.sha256 }; if (fsha(masterRef.path) !== masterRef.sha256) return refusal(job, err("ASSET_HASH_MISMATCH", { record_id: job, reason: "approved master bytes changed" })); }
  if (k === 1) reference = masterRef; // stage 1 of a derived job edits the APPROVED master
  if (k > 1) { // stage k edits the SELECTED candidate of stage k-1: loaded ONLY from the committed, re-verified selection (no caller path)
    try { const sel = loadSelection({ out, job, stage: k - 1, generation: cur.digest }); if (sel.record_stage !== k - 1) throw err("STAGE_PREDECESSOR_MISSING", { reason: "selection is not from the immediately preceding stage" }); reference = { path: sel.file, sha256: sel.candidate_sha256, candidate_id: sel.candidate_id }; }
    catch (e) { return refusal(job, e.code ? e : err("STAGE_PREDECESSOR_MISSING", { record_id: job, reason: e.message })); } }
  if (k > 1 && masterRef) witnesses.unshift({ ...masterRef, role: "IDENTITY_REFERENCE: approved master (stage k edits the stage k-1 selection; identity stays bound to the master)" });
  // ONLY NOW: provider discovery (after every authority verified)
  const provider = discoverProvider(env), caps = await provider.capabilities();
  if (!caps.available) return { status: "WAITING_FOR_GPT_ART", job, blocker: caps.blocker, file_written: false, provider_called: false };
  if (!stub && (testTrust() || gate.design_approval?.reviewer_kind === "TEST_TRUSTED")) return refusal(job, err("TEST_TRUST_FORBIDDEN", { record_id: job, reason: "test-trusted authority can never reach a real provider" }));
  const transparent = J.motion_context.alpha_requirement !== "OPAQUE", required = { generate: !reference, edit: !!reference, transparentRaster: transparent, multipleReferences: witnesses.length > 1 };
  // F092: a REAL provider needs every required capability LIVE_VERIFIED by a stored canary result; declared JSON is not evidence
  const capStatus = capabilityStatus(path.resolve(out), provider.report, { ...required, ...Object.fromEntries(Object.keys(required).map((k2) => [k2, true])) });
  if (!stub) { const missing = Object.entries(required).filter(([k2, need]) => need && capStatus[k2] !== "LIVE_VERIFIED").map(([k2]) => `${k2}:${capStatus[k2] || "UNTESTED"}`); if (missing.length) return refusal(job, err("PROVIDER_NOT_AUTHORIZED", { record_id: job, reason: `required provider capabilities are not live-verified: ${missing.join(", ")} (bounded canary authorization required)`, producer: "engine/art_bridge/art_intake.mjs#submitJob", resume_at: "CAPABILITY_CANARY" })); }
  const size = env.IMAGE_PROVIDER_SIZE || "1536x1024";
  const payload = { provider: provider.report.provider, model: provider.report.model, endpoint: provider.report.base || null, capabilities: caps, capability_status: capStatus, size, prompt_sha256: hsha(request.prompt), stage: k, mode: reference ? "edit" : "generate", reference: reference?.sha256 || null, witnesses: witnesses.map((w) => w.sha256), transparent, generation: cur.digest, film: path.basename(FILM) };
  const key = hsha(payload), subDir = path.join(out, "submissions", job, key.slice(0, 16));
  if (fs.existsSync(path.join(subDir, "PROVIDER_RESULT.json"))) { const p = loadResult(subDir).record; return { ...p, status: "ALREADY_SUBMITTED_SAME_PAYLOAD", previous_status: p.status, provider_called: false }; }
  // F084: EXTERNAL_REQUEST_PREPARED before any send; an earlier prepared request without a terminal outcome blocks a (possibly paid) resend
  const prep = prepareRequest(subDir, { job, stage: k, payload_key_sha256: key, payload, attachments: witnesses.map((w) => w.sha256), reference: reference?.sha256 || null, budget_authorization: env.ART_BRIDGE_BUDGET_AUTHORIZATION || null, charge_policy: stub ? "TEST_STUB_NO_CHARGE" : "PROVIDER_CHARGES_PER_CALL", provider_idempotency: "NONE_DOCUMENTED" });
  if (prep.state !== "NEW") return { status: prep.state === "OUTCOME_UNKNOWN" ? "EXTERNAL_OUTCOME_UNKNOWN" : `ALREADY_${prep.state}`, job, provider_called: false, local_request_id: prep.prepared.local_request_id, reason: prep.state === "OUTCOME_UNKNOWN" ? "a prior request may have been sent without a recorded outcome: reconcile (candidate_store.mjs#reconcileOutcome) before any resend; no automatic paid retry" : `prior outcome ${prep.state}` };
  // F089: a chargeable call must consume a signed paid-run authorization naming this exact job/generation/stage within its ceiling
  if (!stub) { try { const RA = await import("../production/run_authorization.mjs"); RA.consumeRunAuthorization(env.ART_BRIDGE_BUDGET_AUTHORIZATION, { root: FILM, ledgerDir: path.join(path.resolve(out), "authorizations"), artjob: job, generation: cur.digest, stage: k, payload_key_sha256: key }); }
    catch (e) { recordOutcome(subDir, "DEFINITELY_NOT_SENT", { error: e.message, refused_before_send: true }); return refusal(job, e.code ? e : err("RUN_NOT_AUTHORIZED", { record_id: job, reason: e.message })); } }
  const opts = { prompt: request.prompt, outDir: path.join(subDir, "provider_raw"), transparent, size, timeoutMs: +(env.IMAGE_PROVIDER_TIMEOUT_MS || 300000) };
  let res; const attempts = [];
  for (let attempt = 0; ; attempt++) { try { res = reference ? await provider.edit(J, reference, witnesses, opts) : await provider.generate(J, witnesses, opts); attempts.push({ attempt: attempt + 1, ok: true }); recordOutcome(subDir, "COMPLETED", { provider_response: res.response_meta || null }); break; }
    catch (e) { const httpStatus = +(String(e.message).match(/HTTP (\d{3})/)?.[1] || 0), notSent = /ECONNREFUSED|ENOTFOUND|EAI_AGAIN/.test(String(e.cause?.code || e.message)), rejected = httpStatus === 429 || (httpStatus >= 400 && httpStatus < 500);
      attempts.push({ attempt: attempt + 1, ok: false, error: e.message, http_status: httpStatus || null });
      if (notSent || rejected) { recordOutcome(subDir, notSent ? "DEFINITELY_NOT_SENT" : "KNOWN_REJECTED", { error: e.message, http_status: httpStatus || null }); if (httpStatus === 429 && attempt < maxRetries) { if (!stub) { try { const RA = await import("../production/run_authorization.mjs"); RA.consumeRunAuthorization(env.ART_BRIDGE_BUDGET_AUTHORIZATION, { root: FILM, ledgerDir: path.join(path.resolve(out), "authorizations"), artjob: job, generation: cur.digest, stage: k, payload_key_sha256: key, retry: true }); } catch (x) { return refusal(job, x); } } prepareRequest(subDir, { job, stage: k, payload_key_sha256: key, payload, retry_of_rejected: true }); continue; } return { status: "PROVIDER_FAILED", job, outcome: notSent ? "DEFINITELY_NOT_SENT" : "KNOWN_REJECTED", payload_key_sha256: key, attempts, error: e.message, code: e.code || null, resumable: true, provider_called: !notSent }; }
      log(FILM, { op: "submit-outcome-unknown", job, stage: k, error: e.message }); return { status: "EXTERNAL_OUTCOME_UNKNOWN", job, payload_key_sha256: key, attempts, error: e.message, provider_called: true, reason: "the provider may have completed (5xx/timeout/lost response): reconcile before any resend" }; } }
  const candDir = path.join(out, "inbox", "candidates", job); fs.mkdirSync(candDir, { recursive: true });
  const [rw, rh] = size.split("x").map(Number);
  // F092: every required reference must have been SENT, and if the provider reports what it consumed, all of them consumed (no silent witness drop)
  const needRefs = witnesses.length + (reference ? 1 : 0), ack = res.response_meta?.acknowledged_input_images, refProblems = [...(res.attachments_sent !== undefined && res.attachments_sent !== needRefs ? [`adapter sent ${res.attachments_sent} of ${needRefs} required reference images`] : []), ...(ack !== null && ack !== undefined && ack !== needRefs ? [`provider acknowledged ${ack} of ${needRefs} reference images (a dropped source witness/predecessor)`] : [])];
  const candidates = res.outputs.map((o, i) => { const png = readPNG(o.file), target = path.join(candDir, `${key.slice(0, 16)}__${i}.png`);
    if (fs.existsSync(target)) { if (fsha(target) !== o.sha256) throw new Error(`immutable candidate ${target} would be overwritten by different bytes`); } else fs.copyFileSync(o.file, target, fs.constants.COPYFILE_EXCL);
    const alpha_present = png.hasAlphaChannel && png.alpha.transparent + png.alpha.partial > 0, size_ok = png.width === rw && png.height === rh, problems = [...(transparent && !alpha_present ? ["opaque output for a transparent request"] : []), ...(!size_ok ? [`size ${png.width}x${png.height} ≠ requested ${size}`] : []), ...refProblems];
    return { id: `${key.slice(0, 16)}:${i}`, index: i, file: target, sha256: o.sha256, width: png.width, height: png.height, alpha_present, size_ok, problems, valid: problems.length === 0 }; });
  const valid = candidates.filter((c) => c.valid), provenance = stub ? "TEST_STUB" : "GPT_PROVIDER_ART"; // provenanceOverride can never upgrade or rename origin
  const status = !valid.length ? "PROVIDER_OUTPUT_REJECTED" : valid.length === 1 ? "PIXELS_RECEIVED_PENDING_REGISTRATION_AND_REVIEW" : "CANDIDATES_RECEIVED_PENDING_SELECTION";
  const result = { ...res, outputs: candidates, candidates, mode: payload.mode, stage: k, of: stages.length, final_stage: k === stages.length, reference_hashes: reference ? [reference.sha256] : [], style_witness_hashes: witnesses.map((w) => w.sha256), payload_key: payload, payload_key_sha256: key, attempts: attempts.length, attempt_log: attempts, ancestry: { artjob: job, generation: cur.digest, derived_from: J.derived_from, predecessor: reference }, provenance_to_ingest: provenance, provenance_override_ignored: provenanceOverride && provenanceOverride !== provenance ? provenanceOverride : null, status, provider_called: true };
  const recordSha = sealResult(subDir, result); let promoted = null;
  if (valid.length === 1) { promoted = path.join(out, "inbox", `${job}__${key.slice(0, 16)}.png`); if (!fs.existsSync(promoted)) fs.copyFileSync(valid[0].file, promoted, fs.constants.COPYFILE_EXCL); if (k < stages.length) selectCandidate({ out, job, stage: k, generation: cur.digest, candidateId: valid[0].id, selector: "SINGLE_VALID_CANDIDATE" }); }
  log(FILM, { op: "submit", job, stage: k, mode: payload.mode, model: payload.model, candidates: candidates.map((c) => c.sha256), status, provenance, record_sha256: recordSha });
  return { ...result, promoted, record_sha256: recordSha };
}
/** selectStageCandidate — explicit operator selection by CANDIDATE ID within the sealed provider result (never a file path) */
export function selectStageCandidate({ out, job, stage, candidateId, generation = null, file = undefined }) {
  if (file !== undefined) throw err("STAGE_PREDECESSOR_MISSING", { record_id: job, reason: "selection by file path is refused; select a candidate ID from the sealed provider result", producer: "engine/art_bridge/art_intake.mjs#selectStageCandidate" });
  const gen = generation || readCurrent(out, job)?.digest; return selectCandidate({ out, job, stage, generation: gen, candidateId, selector: "OPERATOR" });
}

export { registrationReceiptFile, verifyRegistrationReceipt } from "./registration_evidence.mjs";
