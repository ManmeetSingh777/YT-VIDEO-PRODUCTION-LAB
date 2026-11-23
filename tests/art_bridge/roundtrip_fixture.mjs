// Import-and-registration ROUND TRIP fixture (independent audit P0-3/P0-4/P0-5). A tiny pilot film whose "delivered" images are REAL PNG
// files rasterised here as DIAGNOSTIC_FIXTURE stand-ins (flat coloured capsules — NOT style images, NOT target art, never presented as art).
// The master is delivered at 2× canonical scale with an offset (as a provider output would be); parts are delivered as provider-like edits
// at their own scale/rotation; one off-axis hand claims landmarks that do not match its pixels. Landmark sidecars record the exact
// construction coordinates and say so (method field). All approvals in this round trip are explicit operator verdicts with scope_note
// DIAGNOSTIC_ONLY; production gates refuse DIAGNOSTIC_FIXTURE provenance regardless of receipts.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import http from "node:http"; import crypto from "node:crypto";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const LM = { head_top: [150, 30], neck: [150, 110], pelvis: [150, 300], shoulder_r: [195, 135], upper_arm_mid: [205, 175], elbow_r: [215, 215], forearm_mid: [220, 255], wrist_r: [225, 295], knuckle_r: [233, 330], thumb_r: [242, 304] };
const toMaster = (c) => [2 * c[0] + 40, 2 * c[1] + 30]; // delivered master pixels = 2×canonical + (40,30)
// flat-ended bone (oriented box) SDF: unlike a capsule it does NOT close the joint by itself, so underpaint ownership is observable
const boxD = (p, a0, b0, r, e = 10) => { const L0 = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]), u = [(b0[0] - a0[0]) / L0, (b0[1] - a0[1]) / L0], a = [a0[0] - u[0] * e, a0[1] - u[1] * e], L = L0 + 2 * e, d = [p[0] - a[0], p[1] - a[1]], x = d[0] * u[0] + d[1] * u[1], y = -d[0] * u[1] + d[1] * u[0], qx = Math.abs(x - L / 2) - L / 2, qy = Math.abs(y) - r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); };
const segD = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1]], ap = [p[0] - a[0], p[1] - a[1]], t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]); };
const M = Object.fromEntries(Object.entries(LM).map(([k, v]) => [k, toMaster(v)]));
export { LM, toMaster };
// shapes as signed distance functions in MASTER pixel space (negative = inside); shapesFor(M) lets a variant figure use other landmarks
export const shapesFor = (M) => ({
  body: { rgb: [70, 110, 170], sdf: (p) => Math.min(segD(p, M.neck, M.pelvis) - 90, Math.hypot(p[0] - 340, p[1] - 170) - 76) },
  upper_arm: { rgb: [200, 140, 100], sdf: (p) => boxD(p, M.shoulder_r, M.elbow_r, 26) },
  forearm: { rgb: [215, 160, 115], sdf: (p) => boxD(p, M.elbow_r, M.wrist_r, 24) },
  underpaint: { rgb: [170, 115, 85], sdf: (p) => Math.hypot(p[0] - M.elbow_r[0], p[1] - M.elbow_r[1]) - 30 },
  hand_open: { rgb: [235, 185, 145], sdf: (p) => Math.min(segD(p, M.wrist_r, M.knuckle_r) - 26, segD(p, M.wrist_r, [M.knuckle_r[0] + 34, M.knuckle_r[1] - 18]) - 10) },
  hand_grip: { rgb: [225, 170, 130], sdf: (p) => Math.hypot(p[0] - (M.wrist_r[0] + M.knuckle_r[0]) / 2, p[1] - (M.wrist_r[1] + M.knuckle_r[1]) / 2) - 40 },
});
const SH = shapesFor(M);
/** variant master figure from an arbitrary canonical landmark map (DIAGNOSTIC raster at 2×canonical + (40,30)) + its reviewed sidecar */
export function drawFigureVariant(file, sidecarFile, lmCanon) {
  const Mv = Object.fromEntries(Object.entries(lmCanon).map(([k, v]) => [k, toMaster(v)])), S = shapesFor(Mv);
  raster(file, 640, 900, [S.body, S.underpaint, S.upper_arm, S.forearm, S.hand_open], [1, 0, 0, 1, 0, 0]);
  fs.writeFileSync(sidecarFile, JSON.stringify({ landmarks: Mv, reviewed_by: "rigfit-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)" }, null, 1));
  return Mv;
}
function raster(file, W, H, shapes, T) { // T: delivered pixel → master pixel (affine [a,b,c,d,e,f])
  const px = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = [x + 0.5, y + 0.5], p = [T[0] * q[0] + T[2] * q[1] + T[4], T[1] * q[0] + T[3] * q[1] + T[5]];
    for (const s of shapes) { const d = s.sdf(p) / Math.hypot(T[0], T[1]), cov = Math.max(0, Math.min(1, 0.5 - d)); if (cov <= 0) continue; const i = (y * W + x) * 4, hatch = ((x + y) % 14) < 2 ? 0.82 : 1, a = cov * 255;
      const A0 = px[i + 3] / 255, A1 = cov, Ao = A1 + A0 * (1 - A1); for (let c = 0; c < 3; c++) px[i + c] = Math.round((s.rgb[c] * hatch * A1 + px[i + c] * A0 * (1 - A1)) / (Ao || 1)); px[i + 3] = Math.round(Ao * 255); }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true }); writeRGBA(file, W, H, px);
}
// opaque world plate: 2 px per canonical unit; plate canonical extent [-100,-60] .. [1100,615] (1200 x 675 units)
export const WORLD = { origin: [-100, -60], size: [1200, 675], density: 2 };
export const WLM = { plate_tl: [-100, -60], plate_tr: [1100, -60], plate_bl: [-100, 615], plate_mid: [500, 277.5] };
function worldRaster(file) {
  const W = WORLD.size[0] * WORLD.density, H = WORLD.size[1] * WORLD.density, px = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, g = (x % 100 < 3 || y % 100 < 3) ? 0.7 : 1; px[i] = Math.round((60 + 150 * x / W) * g); px[i + 1] = Math.round((120 + 100 * y / H) * g); px[i + 2] = Math.round(170 * g); px[i + 3] = 255; }
  fs.mkdirSync(path.dirname(file), { recursive: true }); writeRGBA(file, W, H, px);
}
const inv = (T) => { const d = T[0] * T[3] - T[1] * T[2]; return [T[3] / d, -T[1] / d, -T[2] / d, T[0] / d, (T[2] * T[5] - T[3] * T[4]) / d, (T[1] * T[4] - T[0] * T[5]) / d]; };
const ap = (T, p) => [T[0] * p[0] + T[2] * p[1] + T[4], T[1] * p[0] + T[3] * p[1] + T[5]];
const sim = (s, deg, tx, ty) => { const r = (deg * Math.PI) / 180; return [s * Math.cos(r), s * Math.sin(r), -s * Math.sin(r), s * Math.cos(r), tx, ty]; };
function sidecar(file, names, T, note = "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)", corrupt = null) {
  const Ti = inv(T), landmarks = Object.fromEntries(names.map((k) => [k, ap(Ti, M[k])]));
  if (corrupt) landmarks[corrupt.name] = [landmarks[corrupt.name][0] + corrupt.dx, landmarks[corrupt.name][1] + corrupt.dy];
  fs.writeFileSync(file, JSON.stringify({ landmarks, reviewed_by: "roundtrip-operator (DIAGNOSTIC)", method: note }, null, 1));
}

export function buildRoundTrip(dir) {
  fs.rmSync(dir, { recursive: true, force: true }); const film = path.join(dir, "film"), src = path.join(dir, "delivered"); fs.mkdirSync(path.join(film, "handoff"), { recursive: true }); fs.mkdirSync(src, { recursive: true });
  // delivered PNGs: master (identity transform in master px) and provider-like edits (part px → master px)
  const files = {}, sc = (name, W, H, shapes, T, names, corrupt = null) => { files[`${name}_T`] = T; files[name] = path.join(src, `${name}.png`); raster(files[name], W, H, shapes, T); files[`${name}_landmarks`] = path.join(src, `${name}.landmarks.json`); sidecar(files[`${name}_landmarks`], names, T, undefined, corrupt); };
  sc("master", 640, 900, [SH.body, SH.underpaint, SH.upper_arm, SH.forearm, SH.hand_open], [1, 0, 0, 1, 0, 0], Object.keys(LM));
  sc("body", 260, 720, [SH.body], [1, 0, 0, 1, 210, 60], ["head_top", "neck", "pelvis"]);
  sc("body_truncated", 260, 420, [SH.body], [1, 0, 0, 1, 210, 60], ["head_top", "neck", "pelvis"]); // delivered art cut off above the pelvis pivot
  sc("upper_arm", 140, 260, [SH.upper_arm], sim(1 / 0.9, 8, 360, 230), ["shoulder_r", "upper_arm_mid", "elbow_r"]);
  sc("forearm", 140, 260, [SH.forearm], sim(1, -6, 400, 390), ["elbow_r", "forearm_mid", "wrist_r"]);
  sc("underpaint", 90, 90, [SH.underpaint], [1, 0, 0, 1, 425, 415], ["elbow_r", "upper_arm_mid", "forearm_mid"]);
  sc("hand_open", 200, 200, [SH.hand_open], sim(1 / 1.25, -10, 420, 560), ["wrist_r", "knuckle_r", "thumb_r"]);
  sc("hand_grip", 170, 170, [SH.hand_grip], sim(1, 0, 400, 580), ["wrist_r", "knuckle_r", "thumb_r"]);
  files.world = path.join(src, "world_plate.png"); worldRaster(files.world); files.world_landmarks = path.join(src, "world_plate.landmarks.json");
  fs.writeFileSync(files.world_landmarks, JSON.stringify({ landmarks: Object.fromEntries(Object.entries(WLM).map(([k, c]) => [k, [(c[0] - WORLD.origin[0]) * WORLD.density, (c[1] - WORLD.origin[1]) * WORLD.density]])), reviewed_by: "roundtrip-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)" }, null, 1));
  sc("hand_offaxis", 200, 200, [SH.hand_open], sim(1 / 1.25, 15, 420, 560), ["wrist_r", "knuckle_r", "thumb_r"], { name: "knuckle_r", dx: 14, dy: -11 }); // claimed landmarks disagree with pixels
  // planned film: identity, rig, states, edge, one articulated action with an open→grip switch at frame 100
  const J = (id, parent, rest, lim = [-170, 170]) => ({ id, parent_id: parent, rest_xy: rest, rotation_limits_deg: lim, scale_limits: [1, 1], driven_part_ids: [] });
  const rp = (a, j) => ({ asset_id: a, joint_id: j, local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: a, material_owner_id: "pilot" });
  const st = (id, bind) => ({ id, asset_bindings: bind, landmark_correspondence: ["wrist_r", "knuckle_r"], contact_set: [], view_facing: "front", required_underpaint: [], approved_review_id: null });
  const doc = { schema_version: "2.0.0", project_id: "rt_pilot", production_mode: "COMPLETE_FILM_ART_PACKAGE", status: "PLANNED", stage: { width: 1920, height: 1080, fps: 60, total_frames: 7200, coord_system: "SVG_Y_DOWN_PX", color_space: "sRGB" },
    authority: { script: null, direction: null, style_skill: "skill/SKILL.md", visual_bible: null, source_witness_manifest: "skill/QUESTION_NATIVE_WITNESS_MANIFEST.json" },
    identities: [{ id: "pilot", kind: "CHARACTER", canonical_asset_id: "pilot_master", master_sha256: "0".repeat(64), landmarks: LM, palette_roles: {}, material_owners: ["pilot"], source_method_ids: ["F01", "F05", "F64"], allowed_views: ["front"], required_shot_ids: ["rt_shot"], approved_review_id: null },
      { id: "rt_world", kind: "WORLD", canonical_asset_id: "rt_world_far", master_sha256: "0".repeat(64), landmarks: WLM, palette_roles: {}, material_owners: ["rt_world"], source_method_ids: ["F08"], allowed_views: ["front"], required_shot_ids: ["rt_world_shot"], approved_review_id: null }],
    assets: [], worlds: [{ id: "rt_world_w", identity_id: "rt_world", depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["rt_world_far"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [-100, -60, 1200, 675] }],
    rigs: [{ id: "pilot_rig", identity_id: "pilot", root_part: "pelvis", joints: [J("pelvis", null, LM.pelvis, [-20, 20]), J("shoulder_r", "pelvis", LM.shoulder_r), J("elbow_r", "shoulder_r", LM.elbow_r, [-150, 150]), J("wrist_r", "elbow_r", LM.wrist_r, [-70, 70])],
      render_parts: [rp("pilot_body", "pelvis"), rp("pilot_underpaint", "elbow_r"), rp("pilot_upper_arm", "shoulder_r"), rp("pilot_forearm", "elbow_r"), rp("pilot_hand_open", "wrist_r")],
      sockets: [{ id: "pilot_grip", joint_id: "wrist_r", local_xy: [6, 30], semantic_role: "palm grip centre" }], pose_states: [st("open", {}), st("grip", { pilot_hand_open: "pilot_hand_grip" })], view_states: [], constraints: [],
      allowed_state_edges: [{ from: "open", to: "grip", mode: "REGISTERED_SWAP", max_transition_frames: 0, landmark_ids: ["wrist_r"], mask_or_occluder_id: null, approved_assembly_review_id: null }] }],
    actions: [{ id: "pilot_close_hand", shot_id: "rt_shot", frame_range: [0, 600], semantic_goal: "arm swings; hand closes on frame 100", mode: "ARTICULATED", actors: [{ rig_id: "pilot_rig", root_world_xy: [900, 560], root_scale: 1.2 }], targets: [], contact_events: [], pose_events: [{ frame: 0, state_id: "open" }, { frame: 100, state_id: "grip" }], view_events: [], secondary_owners: [], causal_effects: [], visibility_effects: [], physics_track_id: null, required_assets: [], proof_conditions: ["state switch at exactly frame 100 keeps wrist registered"] }],
    shots: [{ id: "rt_shot", start_frame: 0, end_frame: 3600, world_id: null, entry_state: "open", events: ["close"], attention_path: ["hand"], camera_track_id: null, required_asset_ids: [], exit_state: "grip", continuity_to: "rt_world_shot", hold_purpose: "round-trip fixture" },
      { id: "rt_world_shot", start_frame: 3600, end_frame: 7200, world_id: "rt_world_w", entry_state: "wide", events: ["push_in"], attention_path: ["plate"], camera_track_id: "cam_world", required_asset_ids: ["rt_world_far"], exit_state: "close", continuity_to: null, hold_purpose: "camera-footprint fixture" }],
    transitions: [], audio: { narration_file: null, word_alignment_file: null, sfx_events_file: null }, learning: { repair_memory_file: null, compiler_receipts: [] }, evidence: { asset_review_index: null, motion_review_index: null, method_trace_index: null } };
  fs.writeFileSync(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify(doc, null, 1));
  const P = (asset_id, kind, order, o) => ({ asset_id, identity_id: o.identity || "pilot", kind, manufacturing_order: order, derived_from: order === 1 ? null : "pilot_master", view_id: "front", pose_id: o.pose ?? null, expression_id: null, alpha_mode: o.alpha || "STRAIGHT", joint_id: o.joint ?? null, pivot_landmark_id: o.pivot ?? null, pivot_xy: o.pivot ? LM[o.pivot] : null, hidden_surfaces: o.hidden || [], surface_underpaint: o.surface_underpaint || {}, draw_order: o.order || [], shots: o.shots || ["rt_shot"], why: o.why, depth_band: o.band || "FOCAL", overscan_rect: null });
  fs.writeFileSync(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json"), JSON.stringify({ status: "DIAGNOSTIC_ROUND_TRIP", assets: [
    P("pilot_master", "MASTER", 1, { why: "canonical identity" }),
    P("rt_world_far", "WORLD_PLANE", 1, { identity: "rt_world", alpha: "OPAQUE", band: "FAR", shots: ["rt_world_shot"], why: "canonical world plate (delivered at 2 px per canonical unit)" }),
    P("pilot_body", "PART", 2, { joint: "pelvis", pivot: "pelvis", why: "torso+head cutout" }),
    P("pilot_upper_arm", "PART", 2, { joint: "shoulder_r", pivot: "shoulder_r", order: [{ relation: "ABOVE", asset_id: "pilot_body" }], why: "upper arm cutout" }),
    P("pilot_forearm", "PART", 2, { joint: "elbow_r", pivot: "elbow_r", hidden: ["elbow_inner"], surface_underpaint: { elbow_inner: "pilot_underpaint" }, order: [{ relation: "ABOVE", asset_id: "pilot_upper_arm" }], why: "forearm cutout; bending reveals the inner elbow, owned by pilot_underpaint" }),
    P("pilot_underpaint", "UNDERPAINT", 2, { joint: "elbow_r", pivot: "elbow_r", order: [{ relation: "BELOW", asset_id: "pilot_upper_arm" }, { relation: "BELOW", asset_id: "pilot_forearm" }, { relation: "ABOVE", asset_id: "pilot_body" }], why: "elbow underpaint" }),
    P("pilot_hand_open", "PART", 3, { joint: "wrist_r", pivot: "wrist_r", pose: "open", order: [{ relation: "ABOVE", asset_id: "pilot_forearm" }], why: "open hand state" }),
    P("pilot_hand_grip", "PART", 3, { joint: "wrist_r", pivot: "wrist_r", pose: "grip", order: [{ relation: "ABOVE", asset_id: "pilot_forearm" }], why: "closed grip state" }) ] }, null, 1));
  // elbow: gentle swing, then a hard 140° bend at 420–480 (underpaint proof); camera: wide (exceeds the plate) then pushed in (inside the plate)
  fs.writeFileSync(path.join(film, "handoff", "MOTION_PLAN.json"), JSON.stringify({ id: "rt_plan", tracks: { pilot_rig: { joints: { shoulder_r: [[0, 0], [300, -25, "sine.inOut"], [600, 0, "sine.inOut"]], elbow_r: [[0, 10], [300, 45, "sine.inOut"], [420, 140, "sine.inOut"], [480, 140], [600, 10, "sine.inOut"]] } } },
    cameras: { cam_world: { x: [[3600, 500]], y: [[3600, 277.5]], zoom: [[3600, 1], [3700, 1], [3900, 1.9, "sine.inOut"]] } } }, null, 1));
  fs.mkdirSync(path.join(film, "skill"), { recursive: true }); for (const f of ["SKILL.md", "references/QUESTION_NATIVE_WITNESS_MANIFEST.json"]) fs.copyFileSync(path.join(REPO, "reference", "construct-kurzgesagt-art", f), path.join(film, "skill", path.basename(f)));
  fs.mkdirSync(path.join(film, "learning"), { recursive: true }); fs.writeFileSync(path.join(film, "learning", "REPAIR_MEMORY.json"), fs.readFileSync(path.join(REPO, "films", "hv2_film001", "learning", "REPAIR_MEMORY.json")));
  // compile-path testing only: the pilot borrows the (unapproved) Ines master design brief so derived jobs can be compiled and submitted to a stub
  fs.writeFileSync(path.join(film, ".diagnostic_namespace"), "DIAGNOSTIC round-trip fixture film: test-trusted receipts are valid only here (F087)\n");
  fs.mkdirSync(path.join(film, "art_designs"), { recursive: true }); const d = JSON.parse(fs.readFileSync(path.join(REPO, "films", "hv2_film001", "art_designs", "ines_master.design.json"), "utf8")); d.job_id = "pilot_master"; d.borrowed_for_compile_path_testing_only = true;
  // DIAGNOSTIC adaptation of the borrowed brief to the PILOT's own motion contract (front view, open/grip states, 4 joints, 1 socket) so the
  // universal gate can be exercised on the fixture; the pilot is a diagnostic capsule figure, never target art
  const cd = d.first_pass_control.character_designs[0]; cd.view_id = "front"; cd.canonical_pose = "open"; cd.state_family = ["open", "grip"]; d.output.figure_height_px = 4000;
  d.motion_requirements = { attachment_semantics: { pelvis: "whole figure pivots at the hips", shoulder_r: "near sleeve separates under the shoulder line", elbow_r: "sleeve bends at the elbow; inner sleeve is underpaint", wrist_r: "hand separates at the cuff edge" }, contact_semantics: { pilot_grip: "palm centre closes on the held object" }, note: "requirements only" };
  d.molecular_visual_decisions.animation_ancestry.canonical_master_id = "pilot_master"; d.molecular_visual_decisions.animation_ancestry.intermediate_states = ["open", "grip"];
  fs.writeFileSync(path.join(film, "art_designs", "pilot_master.design.json"), JSON.stringify(d, null, 1));
  fs.mkdirSync(path.join(film, "story"), { recursive: true }); fs.writeFileSync(path.join(film, "story", "STORY_CONTRACT.json"), JSON.stringify({ provenance: "DIAGNOSTIC_FIXTURE", note: "round-trip fixture story stand-in; approval machinery only", claims: [] }, null, 1));
  return { dir, film, src, files, manifest: path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), outbox: path.join(dir, "outbox") };
}

/** full round trip through the real intake API (no manual JSON editing) */
export async function runRoundTrip(dir, { log = () => {} } = {}) {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), { exportOutbox } = await import("../../engine/tools/art_outbox.mjs");
  const rt = buildRoundTrip(dir), steps = [], step = (name, r) => { steps.push({ step: name, result: r }); log(name, r); return r; }, prov = "DIAGNOSTIC_FIXTURE", op = { reviewer: "roundtrip-operator", scope_note: "DIAGNOSTIC_ONLY: fixture rasters, not target art" };
  // the pilot design keeps only the decisions whose source predicates hold for the pilot (a leak would be refused as METHOD_NOT_APPLICABLE)
  { const C = await import("../../engine/art_bridge/art_contract.mjs"), df = path.join(rt.film, "art_designs", "pilot_master.design.json"), d = JSON.parse(fs.readFileSync(df, "utf8")), doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8"));
    const { jobs } = await I.planJobs({ film: rt.film }), mj = jobs.find((j) => j.root_dependency === "pilot_master"), req = new Set(C.requiredMethods({ design: d, job: mj, doc, plan: JSON.parse(fs.readFileSync(path.join(rt.film, "handoff", "ART_DEPENDENCY_PLAN.json"), "utf8")) }).map((r) => r.method));
    d.method_decisions = d.method_decisions.filter((x) => req.has(x.method_id)); for (const t of Object.values(d.construction_topics)) t.methods = t.methods.filter((m) => req.has(m)); fs.writeFileSync(df, JSON.stringify(d, null, 1));
    // DIAGNOSTIC approvals (TEST_TRUST, labelled) so derived-edit and provider-stub mechanics can run; production can never use them
    const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1"; const TT = { method: "TEST_TRUST", note: "round-trip DIAGNOSTIC fixture" };
    try { for (const scope of ["story", "direction"]) step(`approve ${scope} (TEST_TRUST)`, await C.approveScope({ film: rt.film, scope, reviewer: "roundtrip-operator", verdict: "APPROVED", attestation: TT }));
      step("approve pilot design (TEST_TRUST)", await C.approveDesign({ film: rt.film, doc, job: mj, reviewer: "roundtrip-operator", verdict: "APPROVED", attestation: TT })); } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; } }
  step("export (masters only)", (await exportOutbox({ film: rt.film, out: rt.outbox })).by_status);
  step("ingest-part BEFORE master approval", await I.ingestPart({ film: rt.film, asset: "pilot_hand_open", file: rt.files.hand_open, landmarks: rt.files.hand_open_landmarks, provenance: prov }).then(() => "ACCEPTED (BUG)", (e) => `REFUSED: ${e.message}`));
  step("ingest-master", await I.ingestMaster({ film: rt.film, asset: "pilot_master", file: rt.files.master, landmarks: rt.files.master_landmarks, provenance: prov }));
  step("review-master", await I.reviewMaster({ film: rt.film, identity: "pilot", verdict: "APPROVED", notes: "landmark overlay checked at full resolution", ...op }));
  step("ingest-master world plate (2 px per canonical unit)", await I.ingestMaster({ film: rt.film, asset: "rt_world_far", file: rt.files.world, landmarks: rt.files.world_landmarks, provenance: prov }));
  step("review-master world", await I.reviewMaster({ film: rt.film, identity: "rt_world", verdict: "APPROVED", notes: "plate corners checked", ...op }));
  const ex = step("resume/export (dependents become ready + compiled with master edit reference)", await exportOutbox({ film: rt.film, out: rt.outbox }));
  rt.jobIds = Object.fromEntries(ex.index.map((r) => [r.asset.replace("pilot_", ""), r.artjob_id]));
  step("ingest-part truncated body (pivot on empty canvas)", await I.ingestPart({ film: rt.film, asset: "pilot_body", file: rt.files.body_truncated, landmarks: rt.files.body_truncated_landmarks, provenance: prov }).then((r) => r.status));
  for (const k of ["body", "upper_arm", "forearm", "underpaint", "hand_open", "hand_grip"]) { step(`ingest-part ${k}`, await I.ingestPart({ film: rt.film, asset: `pilot_${k}`, file: rt.files[k], landmarks: rt.files[`${k}_landmarks`], provenance: prov })); step(`review-part ${k}`, await I.reviewPart({ film: rt.film, asset: `pilot_${k}`, verdict: "APPROVED", ...op })); }
  step("ingest-part off-axis hand (claimed landmarks disagree with pixels)", await I.ingestPart({ film: rt.film, asset: "pilot_hand_open", file: rt.files.hand_offaxis, landmarks: rt.files.hand_offaxis_landmarks, provenance: prov }).then((r) => r.status));
  step("approve-state open", await I.approveState({ film: rt.film, rig: "pilot_rig", state: "open", verdict: "APPROVED", ...op }));
  step("approve-state grip", await I.approveState({ film: rt.film, rig: "pilot_rig", state: "grip", verdict: "APPROVED", ...op }));
  step("approve-edge open->grip", await I.approveStateEdge({ film: rt.film, rig: "pilot_rig", from: "open", to: "grip", verdict: "APPROVED", ...op }));
  rt.steps = steps; rt.masterSha = JSON.parse(fs.readFileSync(rt.manifest, "utf8")).identities[0].master_sha256;
  return rt;
}

/** TEST STUB provider HTTP server (local only): answers the model check and image endpoints with a fixture PNG. Proves adapter mechanics; produces no art. */
export function startProviderStub(pngFile, { outputs = 1, failFirst = 0, failStatus = 500, dropReference = false, hang = false } = {}) {
  const pngHead = fs.readFileSync(pngFile), stubSize = `${pngHead.readUInt32BE(16)}x${pngHead.readUInt32BE(20)}`; // the stub returns this exact image, so requests must ask for its real size
  const reqs = [], b64 = fs.readFileSync(pngFile).toString("base64"); let fails = failFirst;
  const srv = http.createServer((req, res) => {
    if (req.method === "GET" && req.url.startsWith("/models/")) { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ id: decodeURIComponent(req.url.slice(8)), object: "model" })); return; }
    if (req.method === "POST" && (req.url === "/images/edits" || req.url === "/images/generations")) { let n = 0; let body = ""; req.on("data", (c) => { n += c.length; if (body.length < 4e7) body += c.toString("latin1"); }); req.on("end", () => { const images = (body.match(/name="image\[\]"/g) || []).length; if (hang) { reqs.push({ url: req.url, bytes: n, hung: true }); return; } reqs.push({ url: req.url, bytes: n, auth: req.headers.authorization === "Bearer test-key-not-real" }); if (fails > 0) { fails--; res.writeHead(failStatus, { "content-type": "application/json" }); res.end(JSON.stringify({ error: "stub transient failure" })); return; }
      res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ created: 1, usage: { input_images: dropReference ? Math.max(0, images - 1) : images }, data: Array.from({ length: outputs }, () => ({ b64_json: b64 })) })); }); return; }
    res.writeHead(404); res.end();
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok({ url: `http://127.0.0.1:${srv.address().port}`, size: stubSize, requests: () => reqs, close: () => new Promise((d) => { srv.closeAllConnections?.(); srv.close(d); }) })));
}

if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const rt = await runRoundTrip(path.join(REPO, "hybrid_v2", "work", "p0", "roundtrip_demo"), { log: (n, r) => console.log(n.padEnd(70), typeof r === "string" ? r : JSON.stringify(r?.status ?? r).slice(0, 140)) });
  console.log("film:", path.relative(REPO, rt.film));
}
