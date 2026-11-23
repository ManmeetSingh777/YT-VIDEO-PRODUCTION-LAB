// Stage 2 DIAGNOSTIC_FIXTURE scenes (mechanism proofs only — NOT target art; every asset has provenance_class DIAGNOSTIC_FIXTURE and is
// rejected by --production). Shapes carry pure-colour landmark markers so pixel measurements can verify sockets/pivots/contacts.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), ROOT = path.join(here, "fixtures"), DIR = path.join(ROOT, "diag2"), MAN = path.join(ROOT, "stage2");
export const FIXTURE_ROOT = ROOT;
export const MARK = { elbow: [0, 200, 0], wrist: [255, 0, 0], grip: [0, 0, 255], handle: [255, 220, 0], sole: [0, 220, 220], lfoot: [255, 0, 200], rfoot: [120, 0, 255] };

// shape: rect|disc|ring in a WxH canvas; markers [{at:[x,y] canvas px, rgb, r}]
function paint(name, W, H, rgb, { kind = "rect", radius = 0.3, alpha = 1, markers = [], hatch = true, ring = null, outline = true } = {}) {
  const px = new Uint8Array(W * H * 4), rr = Math.min(W, H) * radius;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    let d; const cx = x + 0.5, cy = y + 0.5;
    if (kind === "disc") d = Math.hypot(cx - W / 2, cy - H / 2) - Math.min(W, H) / 2;
    else { const qx = Math.abs(cx - W / 2) - (W / 2 - rr), qy = Math.abs(cy - H / 2) - (H / 2 - rr); d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr; }
    if (ring) d = Math.max(d, -(Math.hypot(cx - W / 2, cy - H / 2) - ring));
    const cov = Math.max(0, Math.min(1, 0.5 - d)), i = (y * W + x) * 4, h = hatch && ((x + y) % 18) < 3, edge = outline && d > -2.5;
    const k = edge ? 0.55 : h ? 0.8 : 1;
    px[i] = rgb[0] * k; px[i + 1] = rgb[1] * k; px[i + 2] = rgb[2] * k; px[i + 3] = Math.round(255 * alpha * cov);
  }
  for (const m of markers) for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { if (Math.hypot(x + 0.5 - m.at[0], y + 0.5 - m.at[1]) <= (m.r || 3)) { const i = (y * W + x) * 4; px[i] = m.rgb[0]; px[i + 1] = m.rgb[1]; px[i + 2] = m.rgb[2]; px[i + 3] = 255; } }
  fs.mkdirSync(DIR, { recursive: true });
  const f = path.join(DIR, `${name}.png`); writeRGBA(f, W, H, px);
  return { file: `diag2/${name}.png`, sha256: crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), W, H };
}
const base = { color_space: "sRGB", approved_review_id: "diag_review", provider_receipt_id: null, parent_part_id: null, sockets: {}, draw_order_constraints: [], depth_band: "FOCAL", render_scale_range: [0.25, 4], view_id: "front", pose_id: null, expression_id: null, hidden_surfaces: [], underpaint_asset_ids: [], mask_asset_ids: [], occluder_asset_ids: [], material_plane_ids: [], camera_footprint: null, overscan_rect: null, motion_modes_allowed: ["ARTICULATED", "RIGID"], incompatible_states: [], valid_interpolation_targets: [], required_contact_sockets: [], shot_usage: [], provenance_class: "DIAGNOSTIC_FIXTURE" };
/** asset at canonical origin [ox,oy] (same size as the png), pivot at canonical point + named landmark */
function asset(id, identity, kind, s, origin, pivot, landmarkName, extra = {}) {
  return { ...base, id, identity_id: identity, kind, file: s.file, sha256: s.sha256, width_px: s.W, height_px: s.H, alpha_mode: ["MASTER", "WORLD_PLANE", "CLEAN_PLATE"].includes(kind) && extra.alpha_mode !== "STRAIGHT" ? "OPAQUE" : kind === "MASK" ? "BINARY_MASK" : "STRAIGHT",
    canonical_rect: [origin[0], origin[1], s.W, s.H], source_pixel_crop: [0, 0, s.W, s.H], coordinate_space: kind === "WORLD_PLANE" || kind === "TRANSITION_PLATE" ? "WORLD_LOCAL" : "CHARACTER_LOCAL", pivot_xy: pivot, pivot_landmark_id: landmarkName, landmarks: landmarkName ? { [landmarkName]: pivot } : {}, layer_owner: identity, ...extra };
}
const ident = (id, kind, master, sha, landmarks, views = ["front"], methods = ["F01"]) => ({ id, kind, canonical_asset_id: master, master_sha256: sha, landmarks, palette_roles: {}, material_owners: [id], source_method_ids: methods, allowed_views: views, required_shot_ids: [], approved_review_id: "diag_review" });
const joint = (id, parent, rest, lim = [-170, 170], parts = []) => ({ id, parent_id: parent, rest_xy: rest, rotation_limits_deg: lim, scale_limits: [1, 1], driven_part_ids: parts });
const rpart = (asset_id, joint_id, owner) => ({ asset_id, joint_id, local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: asset_id, material_owner_id: owner });
const state = (id, view, bind, lm = []) => ({ id, asset_bindings: bind, landmark_correspondence: lm, contact_set: [], view_facing: view, required_underpaint: [], approved_review_id: "diag_review" });
const shell = (project, identities, assets, rigs, actions, shots, worlds = [], transitions = []) => ({ schema_version: "2.0.0", project_id: project, production_mode: "COMPLETE_FILM_ART_PACKAGE", status: "PLANNED",
  stage: { width: 1920, height: 1080, fps: 60, total_frames: 7200, coord_system: "SVG_Y_DOWN_PX", color_space: "sRGB" },
  authority: { script: null, direction: null, style_skill: "skill/SKILL.md", visual_bible: null, source_witness_manifest: "skill/QUESTION_NATIVE_WITNESS_MANIFEST.json" },
  identities, assets, worlds, rigs, actions, shots, transitions, audio: { narration_file: null, word_alignment_file: null, sfx_events_file: null }, learning: { repair_memory_file: null, compiler_receipts: [] }, evidence: { asset_review_index: null, motion_review_index: null, method_trace_index: null } });
const action = (id, shot, range, mode, actors, extra = {}) => ({ id, shot_id: shot, frame_range: range, semantic_goal: extra.goal || id, mode, actors, targets: [], contact_events: [], pose_events: [], view_events: [], secondary_owners: [], causal_effects: [], visibility_effects: [], physics_track_id: null, required_assets: [], proof_conditions: ["sampled-frame QA in tests/art_bridge/stage2_proofs.mjs"], ...extra, goal: undefined });
const shot = (id, s, e, extra = {}) => ({ id, start_frame: s, end_frame: e, world_id: null, entry_state: "start", events: [], attention_path: ["focus"], camera_track_id: null, required_asset_ids: [], exit_state: "end", continuity_to: null, hold_purpose: "diagnostic hold", ...extra });
const clean = (o) => JSON.parse(JSON.stringify(o));

/* ───────────── Scene A: articulated actor + crank (grip, plant, underpaint, lighting, secondary) ───────────── */
export function sceneA() {
  const cA = "diag_actor2", cP = "diag_crank2";
  const S_ = {
    master: paint("actor_master", 300, 500, [120, 150, 190], { radius: 0 }),
    torso: paint("torso", 90, 200, [86, 118, 170]), shade: paint("torso_shade", 40, 200, [20, 30, 60], { alpha: 0.45, hatch: false, outline: false }),
    upper: paint("upper_arm", 24, 112, [205, 150, 110], { radius: 0.12, markers: [{ at: [12, 50], rgb: MARK.elbow }] }),
    fore: paint("forearm", 22, 96, [215, 165, 120], { radius: 0.12, markers: [{ at: [11, 40], rgb: MARK.wrist }] }),
    under: paint("elbow_underpaint", 30, 30, [180, 125, 90], { kind: "disc", hatch: false }),
    palm: paint("hand_palm", 26, 28, [232, 182, 140], { radius: 0.4, markers: [{ at: [13, 22], rgb: MARK.grip }] }),
    near: paint("hand_near_fingers", 22, 12, [250, 200, 160], { radius: 0.5 }), far: paint("hand_far_fingers", 22, 12, [170, 120, 90], { radius: 0.5 }),
    thigh: paint("thigh", 22, 104, [70, 80, 110], { radius: 0.5 }), shin: paint("shin", 20, 96, [80, 90, 120], { radius: 0.5 }),
    foot: paint("foot", 46, 18, [50, 50, 60], { radius: 0.45, markers: [{ at: [33, 14], rgb: MARK.sole }] }),
    cmaster: paint("crank_master", 200, 220, [90, 90, 100], { radius: 0 }), cbase: paint("crank_base", 60, 120, [100, 100, 112]),
    wheel: paint("crank_wheel", 120, 120, [140, 140, 155], { kind: "disc", ring: 18 }), handle: paint("crank_handle", 16, 44, [70, 70, 80], { radius: 0.5, markers: [{ at: [8, 10], rgb: MARK.handle }] }),
    tag: paint("crank_tag", 14, 44, [200, 80, 60], { radius: 0.5 }),
    world: paint("room_far", 2400, 1350, [230, 226, 214], { radius: 0, hatch: true, outline: false }),
  };
  const lmA = { pelvis: [150, 300], shoulder: [180, 140], elbow: [180, 230], wrist: [180, 310], hip: [150, 310], knee: [150, 400], ankle: [150, 480] };
  const A = [
    asset("actor2_master", cA, "MASTER", S_.master, [0, 0], [150, 300], null, { motion_modes_allowed: ["RIGID"] }),
    asset("torso2", cA, "PART", S_.torso, [105, 120], lmA.pelvis, "pelvis", { material_plane_ids: ["torso2_shade"] }),
    asset("torso2_shade", cA, "MATERIAL_PLANE", S_.shade, [155, 120], lmA.pelvis, "pelvis", { parent_part_id: "torso2" }),
    asset("upper_arm2", cA, "PART", S_.upper, [168, 128], lmA.shoulder, "shoulder", { parent_part_id: "torso2", draw_order_constraints: [{ relation: "ABOVE", asset_id: "torso2" }] }),
    asset("elbow_under2", cA, "UNDERPAINT", S_.under, [165, 215], lmA.elbow, "elbow", { parent_part_id: "upper_arm2", draw_order_constraints: [{ relation: "BELOW", asset_id: "upper_arm2" }, { relation: "BELOW", asset_id: "forearm2" }, { relation: "ABOVE", asset_id: "torso2" }] }),
    asset("forearm2", cA, "PART", S_.fore, [169, 222], lmA.elbow, "elbow", { parent_part_id: "upper_arm2", hidden_surfaces: ["elbow_inner"], underpaint_asset_ids: ["elbow_under2"], draw_order_constraints: [{ relation: "ABOVE", asset_id: "upper_arm2" }] }),
    asset("hand_far2", cA, "PART", S_.far, [169, 322], lmA.wrist, "wrist", { parent_part_id: "forearm2", draw_order_constraints: [{ relation: "BELOW", asset_id: "crank_handle2" }] }),
    asset("hand_palm2", cA, "PART", S_.palm, [167, 302], lmA.wrist, "wrist", { parent_part_id: "forearm2", draw_order_constraints: [{ relation: "BELOW", asset_id: "crank_handle2" }, { relation: "ABOVE", asset_id: "hand_far2" }, { relation: "ABOVE", asset_id: "forearm2" }] }),
    asset("hand_near2", cA, "PART", S_.near, [169, 318], lmA.wrist, "wrist", { parent_part_id: "forearm2", draw_order_constraints: [{ relation: "ABOVE", asset_id: "crank_handle2" }, { relation: "ABOVE", asset_id: "hand_palm2" }] }),
    asset("thigh2", cA, "PART", S_.thigh, [139, 300], lmA.hip, "hip", { parent_part_id: "torso2", draw_order_constraints: [{ relation: "BELOW", asset_id: "torso2" }] }),
    asset("shin2", cA, "PART", S_.shin, [140, 392], lmA.knee, "knee", { parent_part_id: "thigh2", draw_order_constraints: [{ relation: "BELOW", asset_id: "thigh2" }] }),
    asset("foot2", cA, "PART", S_.foot, [127, 472], lmA.ankle, "ankle", { parent_part_id: "shin2", draw_order_constraints: [{ relation: "ABOVE", asset_id: "shin2" }] }),
    asset("crank2_master", cP, "MASTER", S_.cmaster, [0, 0], [100, 100], null, { coordinate_space: "PROP_LOCAL", motion_modes_allowed: ["RIGID"] }),
    asset("crank_base2", cP, "PART", S_.cbase, [70, 100], [100, 100], "hub", { coordinate_space: "PROP_LOCAL" }),
    asset("crank_wheel2", cP, "PART", S_.wheel, [40, 40], [100, 100], "hub", { coordinate_space: "PROP_LOCAL", draw_order_constraints: [{ relation: "ABOVE", asset_id: "crank_base2" }] }),
    asset("crank_handle2", cP, "PART", S_.handle, [92, 44], [100, 100], "hub", { coordinate_space: "PROP_LOCAL", draw_order_constraints: [{ relation: "ABOVE", asset_id: "crank_wheel2" }] }),
    asset("crank_tag2", cP, "PART", S_.tag, [93, 196], [100, 200], "tag_pin", { coordinate_space: "PROP_LOCAL", draw_order_constraints: [{ relation: "BELOW", asset_id: "crank_base2" }] }),
    asset("room_far", "diag_room", "WORLD_PLANE", S_.world, [-240, -135], [960, 540], null, { depth_band: "FAR", motion_modes_allowed: ["CAMERA_WORLD"] }),
  ];
  const rigA = { id: "actor2", identity_id: cA, root_part: "pelvis",
    joints: [joint("pelvis", null, lmA.pelvis, [-20, 20]), joint("shoulder", "pelvis", lmA.shoulder), joint("elbow", "shoulder", lmA.elbow, [-150, 150]), joint("wrist", "elbow", lmA.wrist, [-80, 80]), joint("hip", "pelvis", lmA.hip, [-90, 90]), joint("knee", "hip", lmA.knee, [-150, 150]), joint("ankle", "knee", lmA.ankle, [-60, 60])],
    render_parts: [["torso2", "pelvis"], ["thigh2", "hip"], ["shin2", "knee"], ["foot2", "ankle"], ["upper_arm2", "shoulder"], ["elbow_under2", "elbow"], ["forearm2", "elbow"], ["hand_far2", "wrist"], ["hand_palm2", "wrist"], ["hand_near2", "wrist"]].map(([a, j]) => rpart(a, j, cA)),
    sockets: [{ id: "grip2", joint_id: "wrist", local_xy: [0, 14], semantic_role: "palm grip centre" }, { id: "sole2", joint_id: "ankle", local_xy: [10, 6], semantic_role: "sole contact" }],
    pose_states: [state("rest", "front", { torso2: "torso2", upper_arm2: "upper_arm2", forearm2: "forearm2" }, ["shoulder", "elbow", "wrist"])], view_states: [],
    constraints: [{ id: "arm_ik", type: "TWO_BONE_IK", chain: ["shoulder", "elbow", "wrist"], bend_sign: 1 }, { id: "leg_ik", type: "TWO_BONE_IK", chain: ["hip", "knee", "ankle"], bend_sign: 1 }], allowed_state_edges: [] };
  const rigP = { id: "crank2", identity_id: cP, root_part: "hub", joints: [joint("hub", null, [100, 100], [-5, 5]), joint("wheel", "hub", [100, 100], [-100000, 100000]), joint("tag", "hub", [100, 200], [-60, 60])],
    render_parts: [rpart("crank_tag2", "tag", cP), rpart("crank_base2", "hub", cP), rpart("crank_wheel2", "wheel", cP), rpart("crank_handle2", "wheel", cP)],
    sockets: [{ id: "handle_grip2", joint_id: "wheel", local_xy: [0, -46], semantic_role: "handle grip axis" }], pose_states: [state("idle", "front", {})], view_states: [], constraints: [], allowed_state_edges: [] };
  const act = action("operate_crank", "shotA", [0, 600], "ARTICULATED", [{ rig_id: "actor2", root_world_xy: [700, 640], root_scale: 1.5 }, { rig_id: "crank2", root_world_xy: [880, 500], root_scale: 1.5 }], {
    goal: "the hand grips the crank handle and turns the wheel two full revolutions while the planted foot holds",
    contact_events: [{ start_frame: 90, end_frame: 480, source_socket: "grip2", target_socket: "handle_grip2", contact_type: "GRIP", allowed_error_px: 0.5, near_far_relation: "near fingers over handle; palm and far fingers behind", release_behavior: "release ramp 480-540" },
      { start_frame: 0, end_frame: 600, source_socket: "sole2", target_socket: "ground_mark", contact_type: "PLANT", allowed_error_px: 0.5, near_far_relation: "foot over floor", release_behavior: "none", target_world_xy: [715, 905] }],
    required_assets: ["hand_palm2", "hand_near2", "hand_far2", "crank_handle2"], causal_effects: ["wheel rotation", "tag swing"], proof_conditions: ["grip socket on handle socket every locked frame", "sole fixed every frame"] });
  const m = shell("diag_stage2_A", [ident(cA, "CHARACTER", "actor2_master", S_.master.sha256, lmA), ident(cP, "PROP", "crank2_master", S_.cmaster.sha256, { hub: [100, 100], tag_pin: [100, 200] }), ident("diag_room", "WORLD", "room_far", S_.world.sha256, {})],
    A, [rigA, rigP], [act], [shot("shotA", 0, 7200, { world_id: "roomA", required_asset_ids: ["room_far"] })], [{ id: "roomA", identity_id: "diag_room", depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["room_far"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [-240, -135, 2400, 1350] }]);
  const k = (...a) => a;
  const plan = { id: "planA",
    tracks: {
      actor2: { root: { x: [k(0, 0), k(120, 6, "sine.inOut"), k(300, -8, "sine.inOut"), k(480, 6, "sine.inOut"), k(600, 0, "sine.inOut")], y: [k(0, 0), k(150, 14, "sine.inOut"), k(300, 4, "sine.inOut"), k(450, 16, "sine.inOut"), k(600, 0, "sine.inOut")], rot: [k(0, 0), k(240, 4, "sine.inOut"), k(600, 0, "sine.inOut")] },
        joints: { shoulder: [k(0, -20), k(600, -20)], elbow: [k(0, -25), k(540, -25), k(570, -138, "power2.inOut"), k(600, -25, "power2.inOut")], wrist: [k(0, 0), k(600, 0)], hip: [k(0, 0)], knee: [k(0, 0)], ankle: [k(0, 0)] } },
      crank2: { joints: { wheel: [k(0, 0), k(90, 0), k(480, 720, "sine.inOut"), k(600, 720)] } },
    },
    reaches: { "operate_crank:grip2": { approach: [20, 90], release: [480, 540], orient: "RELATIVE" } },
    secondary: [{ id: "tag_swing", rig: "crank2", joint: "tag", driver: { rig: "crank2", joint: "wheel" }, stiffness: 60, damping: 3.5, gain: 1.6, substeps: 8 }],
    lighting: { torso2_shade: { mode: "ATTACHED_LIGHT_PLANE", owner_part: "torso2", opacity: [k(0, 1), k(600, 1)] } },
  };
  return { manifest: clean(m), plan };
}

/* ───────────── Scene B: registered gait cels (foot anchor across swaps) ───────────── */
export function sceneB() {
  const id = "diag_walker", cels = [];
  // 4 cels 140x220: contact(right back, left front), passing(left stance), contact(left back, right front), passing(right stance)
  const feet = [[[30, 210], [110, 210]], [[70, 210], [80, 170]], [[30, 210], [110, 210]], [[80, 170], [70, 210]]];
  const lmSets = [{ right_foot: feet[0][0], left_foot: feet[0][1] }, { left_foot: feet[1][0], right_foot: feet[1][1] }, { left_foot: feet[2][0], right_foot: feet[2][1] }, { right_foot: feet[3][1], left_foot: feet[3][0] }];
  for (let i = 0; i < 4; i++) { const l = lmSets[i]; cels.push(paint(`walker_cel${i}`, 140, 220, [150 + i * 20, 110, 160 - i * 20], { radius: 0.2, markers: [{ at: l.left_foot, rgb: MARK.lfoot, r: 4 }, { at: l.right_foot, rgb: MARK.rfoot, r: 4 }] })); }
  const master = paint("walker_master", 140, 220, [150, 110, 160], { radius: 0.2 });
  const A = [asset("walker_master", id, "MASTER", master, [0, 0], [70, 110], null, { motion_modes_allowed: ["RIGID"], alpha_mode: "STRAIGHT" }), ...cels.map((c, i) => ({ ...asset(`walker_cel${i}`, id, "CEL", c, [0, 0], [70, 110], "pelvis", { motion_modes_allowed: ["REGISTERED_CELS"] }), landmarks: { pelvis: [70, 110], ...lmSets[i] } }))];
  const rig = { id: "walker", identity_id: id, root_part: "root", joints: [joint("root", null, [70, 110])], render_parts: [rpart("walker_master", "root", id)], sockets: [], pose_states: [state("walk", "front", {})], view_states: [], constraints: [], allowed_state_edges: [] };
  const act = action("walk_cycle", "shotB", [0, 600], "REGISTERED_CELS", [], { goal: "walk left→right on distance-indexed registered cels", required_assets: cels.map((_, i) => `walker_cel${i}`) });
  const m = shell("diag_stage2_B", [ident(id, "CHARACTER", "walker_master", master.sha256, {})], A, [rig], [act], [shot("shotB", 0, 7200)]);
  const plan = { id: "planB", placements: {}, tracks: {}, cels: { walk_cycle: { distance: [[0, 0], [600, 1400, "linear"]], step_distance_px: 50, start_xy: [300, 800], band: "FOCAL",
    cycle: [{ asset_id: "walker_cel0", anchor: "right_foot", lands: "left_foot" }, { asset_id: "walker_cel1", anchor: "left_foot" }, { asset_id: "walker_cel2", anchor: "left_foot", lands: "right_foot" }, { asset_id: "walker_cel3", anchor: "right_foot" }] } } };
  return { manifest: clean(m), plan, scale: 1 };
}

/* ───────────── Scene C: face view + expression states, gaze inside owned eye surface ───────────── */
export function sceneC() {
  const id = "diag_head", lm = { skull_top: [150, 20], chin: [150, 300], neck: [150, 320], eye_l: [110, 140], eye_r: [190, 140], sock_l: [110, 140], sock_r: [190, 140], mouth: [150, 240], brow_l: [111, 110] };
  const S_ = { skullF: paint("skull_front", 240, 300, [220, 190, 160], { radius: 0.45, markers: [{ at: [120, 2], rgb: [255, 0, 0], r: 2 }, { at: [120, 282], rgb: [0, 0, 255], r: 2 }] }),
    skull3: paint("skull_threeq", 240, 300, [214, 182, 150], { radius: 0.42, markers: [{ at: [120, 2], rgb: [255, 0, 0], r: 2 }, { at: [120, 282], rgb: [0, 0, 255], r: 2 }] }),
    eyeW: paint("eye_white", 44, 30, [250, 250, 250], { kind: "disc" }), pupil: paint("pupil", 12, 12, [30, 30, 40], { kind: "disc", hatch: false }),
    mouthN: paint("mouth_neutral", 60, 10, [150, 60, 60], { radius: 0.5 }), mouthS: paint("mouth_smile", 70, 22, [170, 50, 60], { radius: 0.5 }), brow: paint("brow", 50, 10, [90, 60, 40], { radius: 0.5 }), browU: paint("brow_raised", 50, 10, [90, 60, 40], { radius: 0.5 }) };
  const sk = (aid, s, view) => ({ ...asset(aid, id, "PART", s, [30, 18], lm.neck, "neck", { view_id: view }), landmarks: { neck: lm.neck, skull_top: lm.skull_top, chin: lm.chin } });
  const A = [{ ...asset("head_master", id, "MASTER", S_.skullF, [30, 18], lm.neck, null, { motion_modes_allowed: ["RIGID"], alpha_mode: "STRAIGHT" }) },
    sk("skull_front", S_.skullF, "front"), sk("skull_threeq", S_.skull3, "threeq"),
    asset("eye_white_l", id, "PART", S_.eyeW, [88, 125], lm.sock_l, "sock_l", { draw_order_constraints: [{ relation: "ABOVE", asset_id: "skull_front" }] }),
    asset("eye_white_r", id, "PART", S_.eyeW, [168, 125], lm.sock_r, "sock_r", { draw_order_constraints: [{ relation: "ABOVE", asset_id: "skull_front" }] }),
    asset("pupil_l", id, "PART", S_.pupil, [104, 134], lm.eye_l, "eye_l", { draw_order_constraints: [{ relation: "ABOVE", asset_id: "eye_white_l" }] }),
    asset("pupil_r", id, "PART", S_.pupil, [184, 134], lm.eye_r, "eye_r", { draw_order_constraints: [{ relation: "ABOVE", asset_id: "eye_white_r" }] }),
    asset("mouth_neutral", id, "PART", S_.mouthN, [120, 235], lm.mouth, "mouth", { expression_id: "neutral", draw_order_constraints: [{ relation: "ABOVE", asset_id: "skull_front" }] }),
    asset("mouth_smile", id, "PART", S_.mouthS, [115, 229], lm.mouth, "mouth", { expression_id: "smile" }),
    asset("brow_l", id, "PART", S_.brow, [86, 105], lm.brow_l, "brow_l", { draw_order_constraints: [{ relation: "ABOVE", asset_id: "skull_front" }] }),
    asset("brow_l_raised", id, "PART", S_.browU, [86, 95], lm.brow_l, "brow_l", { expression_id: "smile" })];
  // registered three-quarter feature states (front features must never be pasted onto the turned skull)
  const S3 = { eyeW: paint("eye_white_3q", 38, 30, [246, 246, 246], { kind: "disc" }), pupil: paint("pupil_3q", 11, 12, [30, 30, 40], { kind: "disc", hatch: false }), mouth: paint("mouth_3q", 52, 12, [150, 60, 60], { radius: 0.5 }), brow: paint("brow_3q", 44, 10, [90, 60, 40], { radius: 0.5 }) };
  const v3 = (aid, s, o, pv, lmName) => asset(aid, id, "PART", s, o, pv, lmName, { view_id: "threeq" });
  A.push(v3("eye_white_l_3q", S3.eyeW, [79, 125], lm.sock_l, "sock_l"), v3("eye_white_r_3q", S3.eyeW, [159, 125], lm.sock_r, "sock_r"), v3("pupil_l_3q", S3.pupil, [93, 134], lm.eye_l, "eye_l"), v3("pupil_r_3q", S3.pupil, [173, 134], lm.eye_r, "eye_r"), v3("mouth_3q", S3.mouth, [124, 234], lm.mouth, "mouth"), v3("brow_l_3q", S3.brow, [80, 105], lm.brow_l, "brow_l"));
  for (const a of A) if (a.id === "skull_threeq") a.view_id = "threeq";
  const rig = { id: "head", identity_id: id, root_part: "neck", joints: [joint("neck", null, lm.neck, [-25, 25]), joint("sock_l", "neck", lm.sock_l, [-1, 1]), joint("sock_r", "neck", lm.sock_r, [-1, 1]), joint("eye_l", "sock_l", lm.eye_l, [-1, 1]), joint("eye_r", "sock_r", lm.eye_r, [-1, 1]), joint("mouth", "neck", lm.mouth, [-10, 10]), joint("brow_l", "neck", lm.brow_l, [-15, 15])],
    render_parts: [rpart("skull_front", "neck", id), rpart("eye_white_l", "sock_l", id), rpart("eye_white_r", "sock_r", id), rpart("pupil_l", "eye_l", id), rpart("pupil_r", "eye_r", id), rpart("mouth_neutral", "mouth", id), rpart("brow_l", "brow_l", id)],
    sockets: [], pose_states: [state("neutral", "front", { skull_front: "skull_front", mouth_neutral: "mouth_neutral" }, ["skull_top", "chin"]), state("smile", "front", { skull_front: "skull_front", mouth_neutral: "mouth_smile", brow_l: "brow_l_raised" }, ["skull_top", "chin"])],
    view_states: [state("threeq", "threeq", { skull_front: "skull_threeq", eye_white_l: "eye_white_l_3q", eye_white_r: "eye_white_r_3q", pupil_l: "pupil_l_3q", pupil_r: "pupil_r_3q", mouth_neutral: "mouth_3q", brow_l: "brow_l_3q" }, ["skull_top", "chin"])], constraints: [],
    allowed_state_edges: [{ from: "neutral", to: "smile", mode: "REGISTERED_SWAP", max_transition_frames: 0, landmark_ids: ["skull_top", "chin"], mask_or_occluder_id: null, approved_assembly_review_id: "diag_review" },
      { from: "neutral", to: "threeq", mode: "REGISTERED_SWAP", max_transition_frames: 0, landmark_ids: ["skull_top", "chin"], mask_or_occluder_id: null, approved_assembly_review_id: "diag_review" }] };
  const act = action("face_acting", "shotC", [0, 600], "ARTICULATED", [{ rig_id: "head", root_world_xy: [960, 800] }], { goal: "glance, smile on beat, turn to three-quarter", pose_events: [{ frame: 0, state_id: "neutral" }, { frame: 200, state_id: "smile" }], view_events: [{ frame: 400, from_state: "neutral", to_state: "threeq" }] });
  const m = shell("diag_stage2_C", [ident(id, "CHARACTER", "head_master", S_.skullF.sha256, lm, ["front", "threeq"])], A, [rig], [act], [shot("shotC", 0, 7200)]);
  const plan = { id: "planC", placements: { head: { x: 960, y: 860, scale: 2 } }, tracks: { head: { root: { rot: [[0, 0], [380, -6, "sine.inOut"], [600, 0, "sine.inOut"]] }, joints: {},
    joint_offsets: { eye_l: { x: [[0, 0], [100, 12, "sine.inOut"], [300, -12, "sine.inOut"], [600, 0, "sine.inOut"]], y: [[0, 0], [300, 4, "sine.inOut"], [600, 0]] }, eye_r: { x: [[0, 0], [100, 12, "sine.inOut"], [300, -12, "sine.inOut"], [600, 0, "sine.inOut"]], y: [[0, 0], [300, 4, "sine.inOut"], [600, 0]] } } } },
    gaze: { head: { eye_l: { pupil_asset: "pupil_l", surface_asset: "eye_white_l" }, eye_r: { pupil_asset: "pupil_r", surface_asset: "eye_white_r" } } } };
  return { manifest: clean(m), plan };
}

/* ───────────── Scene D: layered world + camera footprint + OUT/MIDDLE/IN portal transition ───────────── */
export function sceneD() {
  const S_ = { far: paint("vista_far", 2600, 1500, [150, 190, 220], { radius: 0, outline: false }), mid: paint("vista_mid", 2600, 700, [90, 140, 100], { radius: 0.05, alpha: 1 }), fg: paint("vista_fg", 2600, 300, [40, 60, 50], { radius: 0.05 }),
    out: paint("portal_out", 480, 270, [200, 150, 120], { radius: 0, outline: false, markers: [{ at: [240, 135], rgb: [255, 0, 0], r: 3 }] }), mid2: paint("portal_mid", 480, 270, [120, 170, 200], { radius: 0, outline: false, markers: [{ at: [240, 135], rgb: [255, 0, 0], r: 3 }] }),
    in_: paint("portal_in", 480, 270, [160, 120, 200], { radius: 0, outline: false, markers: [{ at: [240, 135], rgb: [255, 0, 0], r: 3 }] }), mask: paint("portal_aperture", 130, 130, [255, 255, 255], { kind: "disc", hatch: false, outline: false }) };
  const w = "diag_vista", lmP = { portal_centre: [240, 135] };
  const A = [asset("vista_far", w, "WORLD_PLANE", S_.far, [-340, -210], [960, 540], null, { depth_band: "FAR", motion_modes_allowed: ["CAMERA_WORLD"] }),
    asset("vista_mid", w, "WORLD_PLANE", S_.mid, [-340, 600], [960, 950], null, { depth_band: "MID", alpha_mode: "STRAIGHT", motion_modes_allowed: ["CAMERA_WORLD"] }),
    asset("vista_fg", w, "OCCLUDER", S_.fg, [-340, 900], [960, 1050], null, { depth_band: "FOREGROUND", motion_modes_allowed: ["CAMERA_WORLD"] }),
    ...[["portal_out", S_.out], ["portal_mid", S_.mid2], ["portal_in", S_.in_]].map(([id, s]) => ({ ...asset(id, w, "TRANSITION_PLATE", s, [0, 0], [240, 135], null, { motion_modes_allowed: ["TRANSITION"], alpha_mode: "OPAQUE" }), landmarks: lmP })),
    { ...asset("portal_aperture", w, "MASK", S_.mask, [175, 70], [240, 135], null, { motion_modes_allowed: ["TRANSITION"], alpha_mode: "STRAIGHT" }) }];
  const m = shell("diag_stage2_D", [ident(w, "WORLD", "vista_far", S_.far.sha256, lmP)], A, [], [action("camera_move", "shotD1", [0, 3540], "CAMERA_WORLD", []), action("portal_push", "shotD1", [3420, 3540], "TRANSITION", [])],
    [shot("shotD1", 0, 3540, { world_id: "vista", camera_track_id: "camD", continuity_to: "shotD2" }), shot("shotD2", 3540, 7200, { world_id: "vista", camera_track_id: "camD2" })],
    [{ id: "vista", identity_id: w, depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["vista_far"] }, { id: "mid", depth_band: "MID", asset_ids: ["vista_mid"] }, { id: "fg", depth_band: "FOREGROUND", asset_ids: ["vista_fg"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [-340, -210, 2600, 1500] }],
    [{ from_shot: "shotD1", to_shot: "shotD2", frame_range: [3420, 3540], mode: "CONTINUOUS", reason: "push through the aperture; the aperture centre is the shared anchor", continuity_invariant: "aperture centre", out_asset_ids: ["portal_out"], middle_asset_ids: ["portal_mid"], in_asset_ids: ["portal_in"], shared_landmarks: ["portal_centre"], camera_correspondence: "anchor-locked push", mask_or_occluder_ids: ["portal_aperture"], assembly_review_id: "diag_review" }]);
  const plan = { id: "planD", placements: {}, tracks: {}, parallax: { FAR: 0.35, MID: 0.7, FOCAL: 1, NEAR: 1.2, FOREGROUND: 1.45 },
    cameras: { camD: { x: [[0, 960], [300, 1260, "sine.inOut"], [600, 860, "sine.inOut"]], y: [[0, 540], [300, 520, "sine.inOut"], [600, 560, "sine.inOut"]], zoom: [[0, 1], [300, 1.25, "sine.inOut"], [600, 1.05, "sine.inOut"]] }, camD2: {} } };
  return { manifest: clean(m), plan };
}

/* ───────────── Scene E: procedural mechanism (gear train + flow symbols from supplied symbols) ───────────── */
export function sceneE() {
  const S_ = { g1: paint("gear_drive", 200, 200, [180, 140, 60], { kind: "disc", ring: 22, markers: [{ at: [100, 12], rgb: [255, 0, 0], r: 6 }] }), g2: paint("gear_follow", 120, 120, [120, 150, 180], { kind: "disc", ring: 14, markers: [{ at: [60, 8], rgb: [0, 0, 255], r: 5 }] }),
    sym: paint("flow_symbol", 28, 16, [240, 240, 120], { radius: 0.5, hatch: false }) };
  const d = "diag_mech", A = [asset("mech_master", d, "MASTER", S_.g1, [0, 0], [100, 100], null, { alpha_mode: "STRAIGHT", motion_modes_allowed: ["RIGID"] }), asset("gear_drive", d, "PART", S_.g1, [0, 0], [100, 100], "axle"), asset("gear_follow", d, "PART", S_.g2, [0, 0], [60, 60], "axle2"), { ...asset("flow_symbol", d, "SYMBOL", S_.sym, [0, 0], [14, 8], null, { motion_modes_allowed: ["PROCEDURAL"] }) }];
  A[1].landmarks = { axle: [100, 100] }; A[2].landmarks = { axle2: [60, 60] };
  const rig = (id, aid, c) => ({ id, identity_id: d, root_part: "r", joints: [joint("r", null, c, [-1, 1]), joint("spin", "r", c, [-100000, 100000])], render_parts: [rpart(aid, "spin", d)], sockets: [], pose_states: [state("s", "front", {})], view_states: [], constraints: [], allowed_state_edges: [] });
  const m = shell("diag_stage2_E", [{ ...ident(d, "MACHINE", "mech_master", S_.g1.sha256, { axle: [100, 100] }), source_method_ids: ["F09", "F45"] }], A, [rig("gearA", "gear_drive", [100, 100]), rig("gearB", "gear_follow", [60, 60])],
    [action("gear_drive_act", "shotE", [0, 600], "PROCEDURAL", [{ rig_id: "gearA", root_world_xy: [800, 540] }, { rig_id: "gearB", root_world_xy: [800 + 160, 540] }], { goal: "driver turns follower; output flow rate follows the driver speed" }), action("flow_out", "shotE", [0, 600], "PROCEDURAL", [], { goal: "flow symbols along output path" })], [shot("shotE", 0, 7200)]);
  const plan = { id: "planE", placements: { gearA: { x: 800, y: 540 }, gearB: { x: 960, y: 540 } }, tracks: { gearA: { joints: { spin: [[0, 0], [600, 540, "power2.inOut"]] } } },
    procedural: { gear_drive_act: { type: "GEAR_TRAIN", driver: { rig: "gearA", joint: "spin" }, followers: [{ rig: "gearB", joint: "spin", teeth_driver: 30, teeth_follower: 18, phase_deg: 0 }] },
      flow_out: { type: "FLOW_PATH", symbol_asset: "flow_symbol", path: [[1040, 540], [1300, 540], [1300, 760], [1700, 760]], count: [[0, 0], [150, 3, "linear"], [450, 9, "linear"], [600, 4, "linear"]], speed_px_per_frame: 3, spacing_px: 60 } } };
  return { manifest: clean(m), plan };
}

/* ───────────── Scene P: single-part pixel-identity + rotation marker scene ───────────── */
export function sceneP() {
  const s = paint("probe_arm", 40, 160, [210, 150, 100], { radius: 0.5, markers: [{ at: [20, 140], rgb: MARK.wrist, r: 4 }] }), id = "diag_probe";
  const A = [asset("probe_master", id, "MASTER", s, [0, 0], [20, 20], null, { motion_modes_allowed: ["RIGID"], alpha_mode: "STRAIGHT" }), asset("probe_arm", id, "PART", s, [0, 0], [20, 20], "pivot")];
  const rig = { id: "probe", identity_id: id, root_part: "base", joints: [joint("base", null, [20, 20], [-1, 1]), joint("arm", "base", [20, 20], [-180, 180])], render_parts: [rpart("probe_arm", "arm", id)], sockets: [{ id: "tip", joint_id: "arm", local_xy: [0, 120], semantic_role: "marker" }], pose_states: [state("s", "front", {})], view_states: [], constraints: [], allowed_state_edges: [] };
  const m = shell("diag_stage2_P", [ident(id, "PROP", "probe_master", s.sha256, { pivot: [20, 20] })], A, [rig], [action("probe_turn", "shotP", [0, 600], "ARTICULATED", [{ rig_id: "probe", root_world_xy: [600, 300] }])], [shot("shotP", 0, 7200)]);
  const plan = { id: "planP", placements: { probe: { x: 600, y: 300 } }, tracks: { probe: { joints: { arm: [[0, 0], [10, 0], [370, 360, "linear"]] } } } };
  return { manifest: clean(m), plan, png: s };
}

export const SCENES = { A: sceneA, B: sceneB, C: sceneC, D: sceneD, E: sceneE, P: sceneP };
export function writeAll() {
  fs.mkdirSync(MAN, { recursive: true }); const out = {};
  for (const [k, fn] of Object.entries(SCENES)) { const s = fn(); fs.writeFileSync(path.join(MAN, `scene_${k}.manifest.json`), JSON.stringify(s.manifest, null, 1)); fs.writeFileSync(path.join(MAN, `scene_${k}.plan.json`), JSON.stringify(s.plan, null, 1)); out[k] = { manifest: `stage2/scene_${k}.manifest.json`, plan: `stage2/scene_${k}.plan.json` }; }
  return out;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) console.log(writeAll());
