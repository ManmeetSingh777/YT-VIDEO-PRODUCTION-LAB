// Generates DIAGNOSTIC_FIXTURE PNGs (rasterised test shapes — NEVER target art, provenance_class DIAGNOSTIC_FIXTURE) and the five required
// example manifests in schemas/examples/ with real hashes/dimensions. Root for every example: tests/art_bridge/fixtures
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), ROOT = path.join(here, "fixtures"), EX = path.join(here, "..", "..", "schemas", "examples");
fs.mkdirSync(path.join(ROOT, "diag"), { recursive: true }); fs.mkdirSync(EX, { recursive: true });

// rounded-rect diagnostic shape with a 1px darker border and a diagonal hatch (so rotation/registration errors are visible in pixels)
function shape(name, W, H, rgb, { opaque = false, binary = false } = {}) {
  const px = new Uint8Array(W * H * 4), r = Math.min(W, H) * 0.25;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = Math.max(0, r - x, x - (W - 1 - r)), dy = Math.max(0, r - y, y - (H - 1 - r)), dist = Math.hypot(dx, dy), inside = opaque || dist <= r;
    const edge = Math.max(0, Math.min(1, r + 0.5 - dist)), i = (y * W + x) * 4, hatch = ((x + y) % 16) < 2;
    const a = opaque ? 255 : binary ? (inside ? 255 : 0) : Math.round(255 * (dist <= r - 1 ? 1 : edge));
    px[i] = hatch ? rgb[0] * 0.7 : rgb[0]; px[i + 1] = hatch ? rgb[1] * 0.7 : rgb[1]; px[i + 2] = hatch ? rgb[2] * 0.7 : rgb[2]; px[i + 3] = a;
  }
  const f = path.join(ROOT, "diag", `${name}.png`); writeRGBA(f, W, H, px);
  return { file: `diag/${name}.png`, sha256: crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), W, H };
}
const S = {
  master: shape("actor_master", 200, 400, [120, 160, 200], { opaque: true }), torso: shape("torso", 80, 140, [90, 120, 170]), upper: shape("upper_arm", 24, 84, [200, 150, 110]),
  fore: shape("forearm", 22, 74, [210, 160, 120]), palm: shape("hand_palm", 26, 24, [230, 180, 140]), near: shape("hand_near_fingers", 22, 16, [240, 190, 150]), far: shape("hand_far_fingers", 22, 16, [190, 140, 110]),
  elbowUnder: shape("elbow_underpaint", 26, 26, [160, 110, 80]), crankMaster: shape("crank_master", 60, 60, [80, 80, 90], { opaque: true }), handle: shape("crank_handle", 14, 40, [60, 60, 70]),
  worldMaster: shape("world_master", 480, 270, [140, 190, 150], { opaque: true }), worldOut: shape("world_out", 480, 270, [150, 180, 140], { opaque: true }), worldMid: shape("world_mid", 480, 270, [160, 170, 150], { opaque: true }), worldIn: shape("world_in", 480, 270, [170, 160, 160], { opaque: true }),
  mask: shape("portal_mask", 120, 120, [255, 255, 255], { binary: true }),
};
const A = (id, identity, kind, s, canonical, pivotName, pivot, extra = {}) => ({ id, identity_id: identity, kind, file: s.file, sha256: s.sha256, width_px: s.W, height_px: s.H, alpha_mode: kind === "MASTER" || kind === "WORLD_PLANE" || kind === "CLEAN_PLATE" || kind === "TRANSITION_PLATE" ? "OPAQUE" : kind === "MASK" ? "BINARY_MASK" : "STRAIGHT", color_space: "sRGB",
  approved_review_id: "diag_review", provider_receipt_id: null, canonical_rect: canonical, source_pixel_crop: [0, 0, s.W, s.H], coordinate_space: identity.startsWith("diag_world") ? "WORLD_LOCAL" : "CHARACTER_LOCAL", parent_part_id: null, pivot_xy: pivot, pivot_landmark_id: pivotName,
  sockets: {}, landmarks: pivotName ? { [pivotName]: pivot } : {}, layer_owner: identity, draw_order_constraints: [], depth_band: "FOCAL", render_scale_range: [0.5, 2], view_id: "front", pose_id: null, expression_id: null, hidden_surfaces: [], underpaint_asset_ids: [], mask_asset_ids: [], occluder_asset_ids: [], material_plane_ids: [],
  camera_footprint: null, overscan_rect: null, motion_modes_allowed: ["ARTICULATED", "RIGID"], incompatible_states: [], valid_interpolation_targets: [], required_contact_sockets: [], shot_usage: [], provenance_class: "DIAGNOSTIC_FIXTURE", ...extra });

export function humanGrip() {
  const assets = [
    A("actor_master", "diag_actor", "MASTER", S.master, [0, 0, 200, 400], null, [100, 250], { motion_modes_allowed: ["RIGID"] }),
    A("torso", "diag_actor", "PART", S.torso, [60, 110, 80, 140], "pelvis", [100, 250]),
    A("upper_arm", "diag_actor", "PART", S.upper, [118, 116, 24, 84], "shoulder", [130, 120], { parent_part_id: "torso", draw_order_constraints: [{ relation: "ABOVE", asset_id: "torso" }] }),
    A("forearm", "diag_actor", "PART", S.fore, [119, 196, 22, 74], "elbow", [130, 200], { parent_part_id: "upper_arm", hidden_surfaces: ["elbow_inner"], underpaint_asset_ids: ["elbow_underpaint"], draw_order_constraints: [{ relation: "ABOVE", asset_id: "upper_arm" }] }),
    A("elbow_underpaint", "diag_actor", "UNDERPAINT", S.elbowUnder, [117, 187, 26, 26], "elbow", [130, 200], { parent_part_id: "upper_arm" }),
    A("hand_far_fingers", "diag_actor", "PART", S.far, [119, 280, 22, 16], "wrist", [130, 270], { parent_part_id: "forearm", draw_order_constraints: [{ relation: "BELOW", asset_id: "crank_handle" }] }),
    A("hand_palm", "diag_actor", "PART", S.palm, [117, 266, 26, 24], "wrist", [130, 270], { parent_part_id: "forearm" }),
    A("hand_near_fingers", "diag_actor", "PART", S.near, [119, 280, 22, 16], "wrist", [130, 270], { parent_part_id: "forearm", draw_order_constraints: [{ relation: "ABOVE", asset_id: "crank_handle" }] }),
    A("crank_master", "diag_crank", "MASTER", S.crankMaster, [0, 0, 60, 60], null, [30, 30], { coordinate_space: "PROP_LOCAL", motion_modes_allowed: ["RIGID"] }),
    A("crank_handle", "diag_crank", "PART", S.handle, [23, 10, 14, 40], "hub", [30, 30], { coordinate_space: "PROP_LOCAL", motion_modes_allowed: ["RIGID"] }),
  ];
  const state = (id, view, bind) => ({ id, asset_bindings: bind, landmark_correspondence: ["shoulder", "elbow", "wrist", "pelvis"], contact_set: [], view_facing: view, required_underpaint: [], approved_review_id: "diag_review" });
  return { schema_version: "2.0.0", project_id: "diag_fixture", production_mode: "COMPLETE_FILM_ART_PACKAGE", status: "PLANNED",
    stage: { width: 1920, height: 1080, fps: 60, total_frames: 7200, coord_system: "SVG_Y_DOWN_PX", color_space: "sRGB" },
    authority: { script: null, direction: null, style_skill: "skill/SKILL.md", visual_bible: null, source_witness_manifest: "skill/QUESTION_NATIVE_WITNESS_MANIFEST.json" },
    identities: [
      { id: "diag_actor", kind: "CHARACTER", canonical_asset_id: "actor_master", master_sha256: S.master.sha256, landmarks: { shoulder: [130, 120], elbow: [130, 200], wrist: [130, 270], pelvis: [100, 250] }, palette_roles: {}, material_owners: ["diag_actor"], source_method_ids: ["F01", "F05", "F06"], allowed_views: ["front"], required_shot_ids: ["shot_all"], approved_review_id: "diag_review" },
      { id: "diag_crank", kind: "PROP", canonical_asset_id: "crank_master", master_sha256: S.crankMaster.sha256, landmarks: { hub: [30, 30] }, palette_roles: {}, material_owners: ["diag_crank"], source_method_ids: ["F09"], allowed_views: ["front"], required_shot_ids: ["shot_all"], approved_review_id: "diag_review" }],
    assets, worlds: [],
    rigs: [{ id: "actor_rig", identity_id: "diag_actor", root_part: "pelvis",
      joints: [{ id: "pelvis", parent_id: null, rest_xy: [100, 250], rotation_limits_deg: [-30, 30], scale_limits: [1, 1], driven_part_ids: ["torso"] }, { id: "shoulder", parent_id: "pelvis", rest_xy: [130, 120], rotation_limits_deg: [-170, 170], scale_limits: [1, 1], driven_part_ids: ["upper_arm"] },
        { id: "elbow", parent_id: "shoulder", rest_xy: [130, 200], rotation_limits_deg: [-150, 5], scale_limits: [1, 1], driven_part_ids: ["forearm", "elbow_underpaint"] }, { id: "wrist", parent_id: "elbow", rest_xy: [130, 270], rotation_limits_deg: [-60, 60], scale_limits: [1, 1], driven_part_ids: ["hand_palm", "hand_near_fingers", "hand_far_fingers"] }],
      render_parts: [["torso", "pelvis"], ["upper_arm", "shoulder"], ["elbow_underpaint", "elbow"], ["forearm", "elbow"], ["hand_far_fingers", "wrist"], ["hand_palm", "wrist"], ["hand_near_fingers", "wrist"]].map(([a, j]) => ({ asset_id: a, joint_id: j, local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: a, material_owner_id: "diag_actor" })),
      sockets: [{ id: "grip", joint_id: "wrist", local_xy: [0, 14], semantic_role: "palm grip centre" }],
      pose_states: [state("rest", "front", { torso: "torso", upper_arm: "upper_arm", forearm: "forearm" })], view_states: [],
      constraints: [{ id: "arm_ik", type: "TWO_BONE_IK", chain: ["shoulder", "elbow", "wrist"], bend_sign: 1 }], allowed_state_edges: [] }],
    actions: [{ id: "grip_crank", shot_id: "shot_all", frame_range: [0, 600], semantic_goal: "hand grips the crank handle and turns it", mode: "ARTICULATED", actors: [{ rig_id: "actor_rig", root_world_xy: [960, 700] }], targets: ["crank_handle"],
      contact_events: [{ start_frame: 60, end_frame: 540, source_socket: "grip", target_socket: "handle_grip", contact_type: "GRIP", allowed_error_px: 0.5, near_far_relation: "near fingers over handle, palm and far fingers behind", release_behavior: "open hand at end", target_world_xy: [1060, 660] }],
      pose_events: [{ frame: 0, state_id: "rest" }], view_events: [], secondary_owners: [], causal_effects: ["crank rotation"], visibility_effects: [], physics_track_id: null, required_assets: ["hand_palm", "hand_near_fingers", "hand_far_fingers", "crank_handle"], proof_conditions: ["grip socket stays on handle socket for every frame in [60,540)"] }],
    shots: [{ id: "shot_all", start_frame: 0, end_frame: 7200, world_id: null, entry_state: "rest", events: ["grip"], attention_path: ["hand"], camera_track_id: null, required_asset_ids: ["actor_master"], exit_state: "rest", continuity_to: null, hold_purpose: "diagnostic fixture hold after the grip action" }],
    transitions: [], audio: { narration_file: null, word_alignment_file: null, sfx_events_file: null }, learning: { repair_memory_file: null, compiler_receipts: [] }, evidence: { asset_review_index: null, motion_review_index: null, method_trace_index: null } };
}
export function worldPortal() {
  const w = (id, s, kind) => A(id, "diag_world", kind, s, [0, 0, 480, 270], null, [240, 135], { motion_modes_allowed: ["CAMERA_WORLD", "TRANSITION"], camera_footprint: [0, 0, 480, 270], overscan_rect: [-40, -20, 560, 310] });
  const m = humanGrip();
  m.project_id = "diag_world_fixture";
  m.identities.push({ id: "diag_world", kind: "WORLD", canonical_asset_id: "world_master", master_sha256: S.worldMaster.sha256, landmarks: { portal_centre: [240, 135] }, palette_roles: {}, material_owners: ["diag_world"], source_method_ids: ["F21", "F48"], allowed_views: ["front"], required_shot_ids: ["shot_a", "shot_b"], approved_review_id: "diag_review" });
  m.assets.push(w("world_master", S.worldMaster, "MASTER"), w("world_out", S.worldOut, "TRANSITION_PLATE"), w("world_mid", S.worldMid, "TRANSITION_PLATE"), w("world_in", S.worldIn, "TRANSITION_PLATE"), { ...A("portal_mask", "diag_world", "MASK", S.mask, [180, 75, 120, 120], null, [240, 135]), motion_modes_allowed: ["TRANSITION"] });
  m.worlds.push({ id: "world_a", identity_id: "diag_world", depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["world_master"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [-160, -90, 2240, 1260] });
  m.shots = [{ id: "shot_a", start_frame: 0, end_frame: 3600, world_id: "world_a", entry_state: "rest", events: ["grip"], attention_path: ["hand"], camera_track_id: null, required_asset_ids: ["actor_master", "world_master"], exit_state: "portal open", continuity_to: "shot_b" },
    { id: "shot_b", start_frame: 3600, end_frame: 7200, world_id: "world_a", entry_state: "inside portal", events: [], attention_path: ["portal centre"], camera_track_id: null, required_asset_ids: ["world_in"], exit_state: "end", continuity_to: null, hold_purpose: "diagnostic interior hold" }];
  m.actions[0].shot_id = "shot_a";
  m.transitions = [{ from_shot: "shot_a", to_shot: "shot_b", frame_range: [3540, 3660], mode: "CONTINUOUS", reason: "enter the portal while keeping its rim as the shared anchor", continuity_invariant: "portal rim", out_asset_ids: ["world_out"], middle_asset_ids: ["world_mid"], in_asset_ids: ["world_in"], shared_landmarks: ["portal_centre"], camera_correspondence: "portal rim scale-matched", mask_or_occluder_ids: ["portal_mask"], assembly_review_id: "diag_review" }];
  return m;
}
const clone = (o) => JSON.parse(JSON.stringify(o));
export function invalidUnreachable() { const m = clone(humanGrip()); m.actions[0].contact_events[0].target_world_xy = [1400, 660]; return m; }
export function invalidMissingUnderpaint() { const m = clone(humanGrip()); const f = m.assets.find((a) => a.id === "forearm"); f.underpaint_asset_ids = []; return m; }
export function invalidIllegalViewMorph() { const m = clone(humanGrip()); m.identities[0].allowed_views = ["front", "profile"]; const r = m.rigs[0];
  r.view_states.push({ id: "profile", asset_bindings: { torso: "torso" }, landmark_correspondence: ["shoulder", "elbow", "wrist", "pelvis"], contact_set: [], view_facing: "profile", required_underpaint: [], approved_review_id: "diag_review" });
  r.allowed_state_edges.push({ from: "rest", to: "profile", mode: "MATCHED_VECTOR_MORPH", max_transition_frames: 12, landmark_ids: ["shoulder"], mask_or_occluder_id: null, approved_assembly_review_id: "diag_review" }); return m; }

if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  for (const [n, f] of [["valid_human_grip", humanGrip], ["valid_world_portal", worldPortal], ["invalid_unreachable_contact", invalidUnreachable], ["invalid_missing_underpaint", invalidMissingUnderpaint], ["invalid_illegal_view_morph", invalidIllegalViewMorph]])
    fs.writeFileSync(path.join(EX, `${n}.json`), JSON.stringify(f(), null, 1));
  // authority files referenced by the fixtures (copies of the installed skill files, for path validation)
  fs.mkdirSync(path.join(ROOT, "skill"), { recursive: true });
  for (const [src, dst] of [["reference/construct-kurzgesagt-art/SKILL.md", "SKILL.md"], ["reference/construct-kurzgesagt-art/references/QUESTION_NATIVE_WITNESS_MANIFEST.json", "QUESTION_NATIVE_WITNESS_MANIFEST.json"]]) fs.copyFileSync(path.join(here, "..", "..", src), path.join(ROOT, "skill", dst));
  console.log("fixtures written");
}
