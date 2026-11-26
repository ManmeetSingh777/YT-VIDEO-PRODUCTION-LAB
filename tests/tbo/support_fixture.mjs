// P07 DIAGNOSTIC fixture: shared prop support, one transform driver, explicit transfer. Two UNLIKE actors with two holding limbs each, built and
// registered through the SAME real intake as P03 (tests/p03/subjects_fixture.mjs with a scene spec): rasters are flat signed-distance stand-ins
// (DIAGNOSTIC_FIXTURE, never art), approvals are TEST_TRUST inside `.diagnostic_namespace` (production refuses them).
//   "tova" : CHARACTER biped (ACTING_HUMAN) — torso, head, two arms (shoulder/elbow/wrist IK each) with open/grip HAND channels, elbow underpaint
//   "orsa" : CHARACTER creature (ANIMAL_OR_ORGANISM) — body, two two-segment tentacles ending in claws with open/closed channels (no arms, no face)
//   "slab" : PROP held by two hands, set down on a surface       "card" : PROP handed from one actor to the other
//   "drum" : PROP held by two claws, set down on a world point   "bench": PROP surface with a registered top socket
// Shot A runs on the E01 V0.4 ABSOLUTE frame values (award two-hand setdown f180/264/276/286/300; report hand-over f338/348/356/368) so the
// E01 tests can check those exact instants; the engine code knows none of these names or frames.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const clone = (o) => JSON.parse(JSON.stringify(o));
const segD = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1]], ap = [p[0] - a[0], p[1] - a[1]], t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]); };
const circ = (c, r) => (p) => Math.hypot(p[0] - c[0], p[1] - c[1]) - r;
const ell = (c, rx, ry) => (p) => (Math.hypot((p[0] - c[0]) / rx, (p[1] - c[1]) / ry) - 1) * Math.min(rx, ry);
const rect = (c, hw, hh) => (p) => { const dx = Math.abs(p[0] - c[0]) - hw, dy = Math.abs(p[1] - c[1]) - hh; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
const limb = (a, b, r) => (p) => segD(p, a, b) - r;
/** unique flat colours: the pixel tests find each OWNER's drawing by its colour */
export const COL = { tovaGripL: [200, 90, 200], tovaGripR: [90, 200, 200], tovaOpenL: [240, 200, 170], tovaOpenR: [241, 201, 171], orsaClosedA: [210, 210, 60], orsaClosedB: [60, 120, 230], orsaOpenA: [150, 220, 120], orsaOpenB: [120, 160, 220], slab: [180, 60, 40], card: [245, 245, 235], drum: [90, 60, 140], bench: [120, 90, 60] };
const S = (o) => o, P = (joint, pivot, lms, shape, extra) => [joint, pivot, lms, shape, extra];
export const SUBJECTS = {
  tova: S({ kind: "CHARACTER", family: "ACTING_HUMAN", face: true, canvas: [640, 760], root: "pelvis",
    lm: { head_top: [150, 15], head_c: [150, 65], neck: [150, 115], chest: [150, 160], pelvis: [150, 300], shoulder_l: [105, 145], ua_l: [95, 180], elbow_l: [85, 215], fa_l: [82, 250], wrist_l: [80, 285], knuckle_l: [76, 318], thumb_l: [64, 298],
      shoulder_r: [195, 145], ua_r: [205, 180], elbow_r: [215, 215], fa_r: [218, 250], wrist_r: [220, 285], knuckle_r: [224, 318], thumb_r: [236, 298] },
    joints: [["pelvis", null, "pelvis", [-20, 20]], ["chest", "pelvis", "chest", [-25, 25]], ["head", "chest", "neck", [-30, 30]], ["shoulder_l", "chest", "shoulder_l", [-170, 170]], ["elbow_l", "shoulder_l", "elbow_l", [-150, 150]], ["wrist_l", "elbow_l", "wrist_l", [-120, 120]], ["shoulder_r", "chest", "shoulder_r", [-170, 170]], ["elbow_r", "shoulder_r", "elbow_r", [-150, 150]], ["wrist_r", "elbow_r", "wrist_r", [-120, 120]]],
    parts: { torso: P("chest", "chest", ["neck", "chest", "pelvis"], (M) => ({ rgb: [80, 110, 150], sdf: limb(M.neck, M.pelvis, 70) })), head: P("head", "neck", ["head_top", "head_c", "neck"], (M) => ({ rgb: [230, 185, 150], sdf: (p) => Math.min(circ(M.head_c, 90)(p), limb(M.head_c, M.neck, 30)(p)) })),
      underpaint_l: P("elbow_l", "elbow_l", ["elbow_l", "ua_l", "fa_l"], (M) => ({ rgb: [170, 120, 90], sdf: circ(M.elbow_l, 24) }), { kind: "UNDERPAINT" }), underpaint_r: P("elbow_r", "elbow_r", ["elbow_r", "ua_r", "fa_r"], (M) => ({ rgb: [171, 121, 91], sdf: circ(M.elbow_r, 24) }), { kind: "UNDERPAINT" }),
      upper_arm_l: P("shoulder_l", "shoulder_l", ["shoulder_l", "ua_l", "elbow_l"], (M) => ({ rgb: [200, 145, 110], sdf: limb(M.shoulder_l, M.elbow_l, 20) })), forearm_l: P("elbow_l", "elbow_l", ["elbow_l", "fa_l", "wrist_l"], (M) => ({ rgb: [212, 158, 120], sdf: limb(M.elbow_l, M.wrist_l, 18) })),
      upper_arm_r: P("shoulder_r", "shoulder_r", ["shoulder_r", "ua_r", "elbow_r"], (M) => ({ rgb: [201, 146, 111], sdf: limb(M.shoulder_r, M.elbow_r, 20) })), forearm_r: P("elbow_r", "elbow_r", ["elbow_r", "fa_r", "wrist_r"], (M) => ({ rgb: [213, 159, 121], sdf: limb(M.elbow_r, M.wrist_r, 18) })),
      hand_l_open: P("wrist_l", "wrist_l", ["wrist_l", "knuckle_l", "thumb_l"], (M) => ({ rgb: COL.tovaOpenL, sdf: (p) => Math.min(limb(M.wrist_l, M.knuckle_l, 20)(p), limb(M.wrist_l, M.thumb_l, 8)(p)) }), { state: true }),
      hand_r_open: P("wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: COL.tovaOpenR, sdf: (p) => Math.min(limb(M.wrist_r, M.knuckle_r, 20)(p), limb(M.wrist_r, M.thumb_r, 8)(p)) }), { state: true }) },
    states_only: { hand_l_grip: P("wrist_l", "wrist_l", ["wrist_l", "knuckle_l", "thumb_l"], (M) => ({ rgb: COL.tovaGripL, sdf: circ([(M.wrist_l[0] + M.knuckle_l[0]) / 2, (M.wrist_l[1] + M.knuckle_l[1]) / 2], 40) })),
      hand_r_grip: P("wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: COL.tovaGripR, sdf: circ([(M.wrist_r[0] + M.knuckle_r[0]) / 2, (M.wrist_r[1] + M.knuckle_r[1]) / 2], 40) })) },
    master_order: ["torso", "head", "underpaint_l", "underpaint_r", "upper_arm_l", "forearm_l", "hand_l_open", "upper_arm_r", "forearm_r", "hand_r_open"],
    sockets: [{ id: "tova_palm_l", joint_id: "wrist_l", local_xy: [-2, 24], basis_angle_deg: 0, semantic_role: "left palm centre" }, { id: "tova_palm_r", joint_id: "wrist_r", local_xy: [2, 24], basis_angle_deg: 0, semantic_role: "right palm centre" }],
    ik: [["arm_l_ik", ["shoulder_l", "elbow_l", "wrist_l"], 1], ["arm_r_ik", ["shoulder_r", "elbow_r", "wrist_r"], -1]],
    channels: [{ id: "hand_l", kind: "HAND", slots: ["tova_hand_l_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "grip", asset_bindings: { tova_hand_l_open: "tova_hand_l_grip" } }] },
      { id: "hand_r", kind: "HAND", slots: ["tova_hand_r_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "grip", asset_bindings: { tova_hand_r_open: "tova_hand_r_grip" } }] }],
    pose_states: [["rest", {}]], edges: [], semantics: { pelvis: "figure pivots at the hips", chest: "torso bends at the waist", head: "head turns at the neck", shoulder_l: "sleeve separates under the shoulder", elbow_l: "inner elbow is underpaint", wrist_l: "hand separates at the cuff", shoulder_r: "sleeve separates under the shoulder", elbow_r: "inner elbow is underpaint", wrist_r: "hand separates at the cuff" } }),
  orsa: S({ kind: "CHARACTER", family: "ANIMAL_OR_ORGANISM", face: true, canvas: [620, 560], root: "body",
    lm: { body_c: [200, 300], body_top: [200, 225], body_bot: [200, 370], ta_root: [130, 270], ta_mid: [108, 258], ta_j: [85, 245], ta_m2: [65, 240], claw_a: [45, 235], claw_a_tip: [28, 228], tb_root: [140, 320], tb_mid: [118, 325], tb_j: [95, 330], tb_m2: [75, 337], claw_b: [55, 345], claw_b_tip: [38, 350] },
    joints: [["body", null, "body_c", [-15, 15]], ["ta1", "body", "ta_root", [-160, 160]], ["ta2", "ta1", "ta_j", [-150, 150]], ["claw_a", "ta2", "claw_a", [-160, 160]], ["tb1", "body", "tb_root", [-160, 160]], ["tb2", "tb1", "tb_j", [-150, 150]], ["claw_b", "tb2", "claw_b", [-160, 160]]],
    parts: { body: P("body", "body_c", ["body_c", "body_top", "body_bot"], (M) => ({ rgb: [70, 120, 110], sdf: ell(M.body_c, 150, 130) })),
      ta1: P("ta1", "ta_root", ["ta_root", "ta_mid", "ta_j"], (M) => ({ rgb: [80, 140, 125], sdf: limb(M.ta_root, M.ta_j, 16) })), ta2: P("ta2", "ta_j", ["ta_j", "ta_m2", "claw_a"], (M) => ({ rgb: [85, 150, 130], sdf: limb(M.ta_j, M.claw_a, 13) })),
      tb1: P("tb1", "tb_root", ["tb_root", "tb_mid", "tb_j"], (M) => ({ rgb: [81, 141, 126], sdf: limb(M.tb_root, M.tb_j, 16) })), tb2: P("tb2", "tb_j", ["tb_j", "tb_m2", "claw_b"], (M) => ({ rgb: [86, 151, 131], sdf: limb(M.tb_j, M.claw_b, 13) })),
      claw_a_open: P("claw_a", "claw_a", ["claw_a", "claw_a_tip", "ta_m2"], (M) => ({ rgb: COL.orsaOpenA, sdf: (p) => Math.min(limb(M.claw_a, [M.claw_a_tip[0], M.claw_a_tip[1] - 14], 7)(p), limb(M.claw_a, [M.claw_a_tip[0], M.claw_a_tip[1] + 14], 7)(p)) }), { state: true }),
      claw_b_open: P("claw_b", "claw_b", ["claw_b", "claw_b_tip", "tb_m2"], (M) => ({ rgb: COL.orsaOpenB, sdf: (p) => Math.min(limb(M.claw_b, [M.claw_b_tip[0], M.claw_b_tip[1] - 14], 7)(p), limb(M.claw_b, [M.claw_b_tip[0], M.claw_b_tip[1] + 14], 7)(p)) }), { state: true }) },
    states_only: { claw_a_closed: P("claw_a", "claw_a", ["claw_a", "claw_a_tip", "ta_m2"], (M) => ({ rgb: COL.orsaClosedA, sdf: circ([(M.claw_a[0] + M.claw_a_tip[0]) / 2, (M.claw_a[1] + M.claw_a_tip[1]) / 2], 22) })),
      claw_b_closed: P("claw_b", "claw_b", ["claw_b", "claw_b_tip", "tb_m2"], (M) => ({ rgb: COL.orsaClosedB, sdf: circ([(M.claw_b[0] + M.claw_b_tip[0]) / 2, (M.claw_b[1] + M.claw_b_tip[1]) / 2], 22) })) },
    master_order: ["body", "ta1", "ta2", "claw_a_open", "tb1", "tb2", "claw_b_open"],
    sockets: [{ id: "orsa_claw_a", joint_id: "claw_a", local_xy: [-14, -6], basis_angle_deg: 0, semantic_role: "claw A pincer centre" }, { id: "orsa_claw_b", joint_id: "claw_b", local_xy: [-14, 4], basis_angle_deg: 0, semantic_role: "claw B pincer centre" }],
    ik: [["tent_a_ik", ["ta1", "ta2", "claw_a"], 1], ["tent_b_ik", ["tb1", "tb2", "claw_b"], 1]],
    channels: [{ id: "claw_a", kind: "HAND", slots: ["orsa_claw_a_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "closed", asset_bindings: { orsa_claw_a_open: "orsa_claw_a_closed" } }] },
      { id: "claw_b", kind: "HAND", slots: ["orsa_claw_b_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "closed", asset_bindings: { orsa_claw_b_open: "orsa_claw_b_closed" } }] }],
    pose_states: [["rest", {}]], edges: [], semantics: { body: "creature pivots at its centre", ta1: "tentacle A hinges at the body", ta2: "tentacle A mid hinge", claw_a: "claw A hinges on the tentacle tip", tb1: "tentacle B hinges at the body", tb2: "tentacle B mid hinge", claw_b: "claw B hinges on the tentacle tip" } }),
  slab: S({ kind: "PROP", family: "PROP", face: false, canvas: [340, 200], root: "slab", lm: { slab_c: [100, 55], grip_l: [42, 55], grip_r: [158, 55], base: [100, 85], top: [100, 25] },
    joints: [["slab", null, "slab_c", [-30, 30]]], parts: { body: P("slab", "slab_c", ["slab_c", "grip_l", "base"], (M) => ({ rgb: COL.slab, sdf: rect(M.slab_c, 120, 60) })) }, states_only: {}, master_order: ["body"],
    sockets: [{ id: "slab_grip_l", joint_id: "slab", local_xy: [-58, 0], semantic_role: "left hand hold" }, { id: "slab_grip_r", joint_id: "slab", local_xy: [58, 0], semantic_role: "right hand hold" }, { id: "slab_base", joint_id: "slab", local_xy: [0, 30], semantic_role: "base contact patch" }],
    ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { slab: "rigid plaque" } }),
  card: S({ kind: "PROP", family: "PROP", face: false, canvas: [300, 120], root: "card", lm: { card_c: [80, 30], giver: [128, 30], taker: [32, 30], top: [80, 18] },
    joints: [["card", null, "card_c", [-40, 40]]], parts: { sheet: P("card", "card_c", ["card_c", "giver", "taker"], (M) => ({ rgb: COL.card, sdf: rect(M.card_c, 100, 22) })) }, states_only: {}, master_order: ["sheet"],
    sockets: [{ id: "card_edge_giver", joint_id: "card", local_xy: [48, 0], semantic_role: "giver's edge" }, { id: "card_edge_taker", joint_id: "card", local_xy: [-48, 0], semantic_role: "taker's edge" }],
    ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { card: "rigid sheet" } }),
  drum: S({ kind: "PROP", family: "PROP", face: false, canvas: [220, 240], root: "drum", lm: { drum_c: [60, 60], grip_a: [95, 40], grip_b: [95, 80], base: [60, 98] },
    joints: [["drum", null, "drum_c", [-30, 30]]], parts: { body: P("drum", "drum_c", ["drum_c", "grip_a", "base"], (M) => ({ rgb: COL.drum, sdf: rect(M.drum_c, 70, 76) })) }, states_only: {}, master_order: ["body"],
    sockets: [{ id: "drum_grip_a", joint_id: "drum", local_xy: [35, -20], semantic_role: "upper hold" }, { id: "drum_grip_b", joint_id: "drum", local_xy: [35, 20], semantic_role: "lower hold" }, { id: "drum_base", joint_id: "drum", local_xy: [0, 38], semantic_role: "base contact patch" }],
    ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { drum: "rigid drum" } }),
  bench: S({ kind: "PROP", family: "PROP", face: false, canvas: [520, 140], root: "bench", lm: { bench_c: [120, 45], top: [120, 25], left: [10, 45] },
    joints: [["bench", null, "bench_c", [-1, 1]]], parts: { top: P("bench", "bench_c", ["bench_c", "top", "left"], (M) => ({ rgb: COL.bench, sdf: rect(M.bench_c, 230, 40) })) }, states_only: {}, master_order: ["top"],
    sockets: [{ id: "bench_top_slab", joint_id: "bench", local_xy: [0, -20], semantic_role: "set-down place on the top surface" }], ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { bench: "fixed bench" } }),
};
export const SHOT_IDS = ["p07_shot_a", "p07_shot_b"];
const ACTA = "p07_hold_and_handover", ACTB = "p07_two_claw_setdown";
/** scene: shot A [0,480) on the E01 absolute clock, shot B [480,960) generic two-claw set-down onto a world point */
export function scene({ A }) {
  const actions = [
    { ...A, id: ACTA, shot_id: "p07_shot_a", frame_range: [0, 480], semantic_goal: "a biped holds a plaque with both hands, sets it on a bench and lets go hand by hand; a creature hands it a card", proof_conditions: ["one driver per instant", "release lets go of the releaser only"], actors: [{ rig_id: "tova_rig", root_world_xy: [600, 500], root_scale: 1 }, { rig_id: "orsa_rig", root_world_xy: [880, 520], root_scale: 1 }, { rig_id: "slab_rig", root_world_xy: [600, 420], root_scale: 1 }, { rig_id: "card_rig", root_world_xy: [700, 452], root_scale: 1 }, { rig_id: "bench_rig", root_world_xy: [600, 530], root_scale: 1 }], contact_events: [], pose_events: [{ frame: 0, state_id: "rest" }], state_events: [] },
    { ...A, id: ACTB, shot_id: "p07_shot_b", frame_range: [480, 960], semantic_goal: "the creature holds a drum with both claws and sets it down on the floor point", proof_conditions: ["two claws share the load", "floor takes over"], actors: [{ rig_id: "orsa_rig", root_world_xy: [880, 520], root_scale: 1 }, { rig_id: "drum_rig", root_world_xy: [700, 509], root_scale: 1 }], contact_events: [], pose_events: [{ frame: 480, state_id: "rest" }], state_events: [] },
  ];
  const shots = [{ id: "p07_shot_a", start_frame: 0, end_frame: 480, world_id: "p03_world_w", entry_state: "holding", events: ["setdown", "handover"], attention_path: ["hands", "card"], camera_track_id: "cam_a", required_asset_ids: ["p03_world_far"], exit_state: "card held", continuity_to: "p07_shot_b", hold_purpose: "diagnostic shared support" },
    { id: "p07_shot_b", start_frame: 480, end_frame: 960, world_id: "p03_world_w", entry_state: "holding", events: ["setdown"], attention_path: ["claws"], camera_track_id: "cam_b", required_asset_ids: ["p03_world_far"], exit_state: "drum down", continuity_to: null, hold_purpose: "diagnostic two-claw support" }];
  return { project_id: "p07_support", total_frames: 960, actions, shots };
}
export const placements = { tova_rig: { x: 600, y: 500, scale: 1 }, orsa_rig: { x: 880, y: 520, scale: 1 }, slab_rig: { x: 600, y: 420, scale: 1 }, card_rig: { x: 700, y: 452, scale: 1 }, bench_rig: { x: 600, y: 530, scale: 1 }, drum_rig: { x: 700, y: 509, scale: 1 } };
/** the directed prop paths (props move on their own approved track; hands follow by IK and must stay valid) */
export const tracks = () => ({
  slab_rig: { root: { y: [[0, 0], [228, 0], [264, 60, "sine.inOut"]] } }, // lowered 60 px onto the bench top, still from f264
  card_rig: { root: { x: [[0, 0], [298, 0], [322, -12, "sine.inOut"], [368, -12], [404, -46, "sine.inOut"]], y: [[0, 0], [368, 0], [404, 10, "sine.inOut"]] } }, // presented, then drawn in by the taker
  drum_rig: { root: { y: [[480, 0], [560, 0], [660, 45, "sine.inOut"]] } }, // lowered onto the floor point
});
export const basePlan = () => ({ id: "p07_plan", placements: clone(placements), tracks: tracks(), cameras: { cam_a: { x: [[0, 720]], y: [[0, 470]], zoom: [[0, 1.5]] }, cam_b: { x: [[480, 760]], y: [[480, 520]], zoom: [[480, 1.6]] } } });
export const DIGEST = crypto.createHash("sha256").update("P07 DIAGNOSTIC creative packet revision 1").digest("hex");
export const DECISIONS = ["dd_p07_diag_1"];
export const masterOf = (doc, rigId) => doc.identities.find((i) => i.id === doc.rigs.find((r) => r.id === rigId).identity_id).master_sha256;
const contact = { allowed_error_px: 1.5, near_far: "HAND_IN_FRONT", single_layer_reason: "DIAGNOSTIC closed drawing seen from the back of the hand hides the far fingers", prop_relation: "HELD" };
export const PROFILES = {
  tova_perf: { id: "tova_perf", version: "1.0.0", actor_rig_id: "tova_rig", approval: { status: "DIAGNOSTIC_TEST_TRUST", note: "P07 diagnostic profile" }, timing: { acquire_ease: "sine.inOut", release_ease: "sine.inOut" }, contact },
  orsa_perf: { id: "orsa_perf", version: "1.0.0", actor_rig_id: "orsa_rig", approval: { status: "DIAGNOSTIC_TEST_TRUST", note: "P07 diagnostic profile" }, timing: { acquire_ease: "power2.out", release_ease: "sine.inOut" }, contact },
};
export const CHARACTERS = (doc) => [
  { actor_rig_id: "tova_rig", master_sha: masterOf(doc, "tova_rig"), topology_kind: "BIPED", character_profile_id: "tova_perf", approved_state_channels: ["hand_l", "hand_r"], approved_motion_routes: ["PART_RIG_2D", "APPROVED_CELS"],
    role_map: { chest_joint: "chest", "hand.l.socket": "tova_palm_l", "hand.l.channel": "hand_l", "hand.l.open_state": "open", "hand.l.closed_state": "grip", "hand.r.socket": "tova_palm_r", "hand.r.channel": "hand_r", "hand.r.open_state": "open", "hand.r.closed_state": "grip" } },
  { actor_rig_id: "orsa_rig", master_sha: masterOf(doc, "orsa_rig"), topology_kind: "NONHUMAN", character_profile_id: "orsa_perf", approved_state_channels: ["claw_a", "claw_b"], approved_motion_routes: ["PART_RIG_2D", "APPROVED_CELS"],
    role_map: { body_joint: "body", "hand.a.socket": "orsa_claw_a", "hand.a.channel": "claw_a", "hand.a.open_state": "open", "hand.a.closed_state": "closed", "hand.b.socket": "orsa_claw_b", "hand.b.channel": "claw_b", "hand.b.open_state": "open", "hand.b.closed_state": "closed" } },
];
const E = (kind, owner, frames, test_id, extra = {}) => ({ kind, owner_id: owner, frames, test_id, human_quality_check: `native playback: ${kind} reads as intended on ${owner}`, ...extra });
const ST = (cs = {}, pos = {}) => ({ channel_states: cs, possession: pos });
const cmd = (o) => ({ direction_decision_ids: DECISIONS, override_policy: "DIRECTOR_PRIORITY_STRICT", source_digest: DIGEST, required_prestate: ST(), required_poststate: ST(), required_art_refs: [], ...o });
const T_ = { actor_rig_id: "tova_rig", character_profile_id: "tova_perf", action_id: ACTA }, O_ = { actor_rig_id: "orsa_rig", character_profile_id: "orsa_perf", action_id: ACTA }, OB = { actor_rig_id: "orsa_rig", character_profile_id: "orsa_perf", action_id: ACTB };
const sock = (rig, s) => ({ kind: "RIG_SOCKET", rig_id: rig, socket_id: s });
const grip = (base, id, frames, target, hand, ch, closed, close_to, art) => cmd({ ...base, id, verb: "grip", frames, target, intent: "takes hold", phases: [{ id: "close", frames: [frames[0], close_to], goal: "close", expected_owner_effect: "closed hand on the prop" }, { id: "hold", frames: [close_to, frames[1]], goal: "hold", expected_owner_effect: "held" }], motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_poststate: ST({ [ch]: closed }), required_art_refs: art, expected_effects: [E("PaintedGripMaintained", `${base.actor_rig_id}.${hand}`, frames, `P07-${id}`)] });
const release = (base, id, frames, target, hand, ch, open_to, art) => cmd({ ...base, id, verb: "release", frames, target, intent: "lets go", phases: [{ id: "open", frames: [frames[0], open_to], goal: "open", expected_owner_effect: "open hand" }, { id: "retract", frames: [open_to, frames[1]], goal: "retract", expected_owner_effect: "hand leaves the prop" }], motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_poststate: ST({ [ch]: "open" }), required_art_refs: art, expected_effects: [E("ReleaseAndSeparation", `${base.actor_rig_id}.${hand}`, frames, `P07-${id}`, { minimum: 2, units: "px" })] });
const TL = ["tova_hand_l_grip", "tova_hand_l_open"], TR = ["tova_hand_r_grip", "tova_hand_r_open"], OA = ["orsa_claw_a_closed", "orsa_claw_a_open"], OBc = ["orsa_claw_b_closed", "orsa_claw_b_open"];
/** PerformanceCommand packet v1.0.0 (P06 schema, unchanged): only existing verbs; who drives each prop lives in the support contract */
export function packet(doc) {
  const SL = sock("slab_rig", "slab_grip_l"), SR = sock("slab_rig", "slab_grip_r"), CG = sock("card_rig", "card_edge_giver"), CT = sock("card_rig", "card_edge_taker"), DA = sock("drum_rig", "drum_grip_a"), DB = sock("drum_rig", "drum_grip_b");
  const commands = [
    grip(T_, "t_grip_l", [0, 10], SL, "tova_palm_l", "hand_l", "grip", 5, TL), grip(T_, "t_grip_r", [0, 10], SR, "tova_palm_r", "hand_r", "grip", 5, TR),
    release(T_, "t_release_r", [276, 286], SR, "tova_palm_r", "hand_r", 281, ["tova_hand_r_open"]), release(T_, "t_release_l", [286, 300], SL, "tova_palm_l", "hand_l", 293, ["tova_hand_l_open"]),
    grip(O_, "o_grip_card", [0, 10], CG, "orsa_claw_a", "claw_a", "closed", 5, OA),
    cmd({ ...T_, id: "t_reach_card", verb: "reach", frames: [300, 338], target: CT, intent: "reaches for the offered card", phases: [{ id: "approach", frames: [300, 338], goal: "hand travels to the card edge", expected_owner_effect: "palm arrives at the edge" }], motion_routes: ["PART_RIG_2D"], expected_effects: [E("ContactApproach", "tova_rig.tova_palm_r", [300, 338], "P07-t_reach_card", { minimum: 5, units: "px" })] }),
    grip(T_, "t_grip_card", [338, 480], CT, "tova_palm_r", "hand_r", "grip", 348, TR),
    release(O_, "o_release_card", [356, 368], CG, "orsa_claw_a", "claw_a", 362, ["orsa_claw_a_open"]),
    cmd({ ...T_, id: "t_hold_card", verb: "hold", frames: [368, 480], intent: "keeps the card alone", phases: [{ id: "hold", frames: [368, 480], goal: "hold", expected_owner_effect: "sole holder" }], motion_routes: ["PART_RIG_2D"], required_poststate: ST({ hand_r: "grip" }, { card: "tova_rig#r" }), expected_effects: [E("PoseContactHold", "tova_rig.tova_palm_r", [368, 480], "P07-t_hold_card")] }),
    grip(OB, "o_grip_drum_a", [480, 490], DA, "orsa_claw_a", "claw_a", "closed", 485, OA), grip(OB, "o_grip_drum_b", [480, 490], DB, "orsa_claw_b", "claw_b", "closed", 485, OBc),
    release(OB, "o_release_drum_b", [700, 712], DB, "orsa_claw_b", "claw_b", 706, ["orsa_claw_b_open"]), release(OB, "o_release_drum_a", [720, 735], DA, "orsa_claw_a", "claw_a", 727, ["orsa_claw_a_open"]),
  ];
  return { schema_version: "1.0.0", film_id: "p07_support", fps: 60, total_frames: doc.stage.total_frames, characters: CHARACTERS(doc), commands };
}
/** PROP_SUPPORT v1.0.0 contracts. Shot A uses the E01 V0.4 absolute frame values (award: setdown 264/276, right free 286, left free 300;
 *  report: first touch 338, secure 348, shared [348,356), transfer 356, giver clear 368). */
export function supportContract({ floor_xy = null } = {}) {
  return { schema_version: "1.0.0", props: [
    { id: "award_standin", prop_rig_id: "slab_rig", test_id: "P07-SLAB-SUPPORT", max_step_px: 6, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, human_quality_check: "two hands visibly carry the plaque; the bench takes it; each hand lets go in turn",
      hands: [{ ref: "tova_rig#l", prop_socket: "slab_grip_l" }, { ref: "tova_rig#r", prop_socket: "slab_grip_r" }],
      surfaces: [{ id: "bench", prop_socket: "slab_base", target: { rig_id: "bench_rig", socket_id: "bench_top_slab" }, frames: [264, 480] }],
      authority: [{ frames: [0, 264], driver: "tova_rig#r", required_supports: ["tova_rig#l"] }, { frames: [264, 276], driver: "tova_rig#r", required_supports: ["tova_rig#l", "surface:bench"] }, { frames: [276, 480], driver: "surface:bench", required_supports: [] }] },
    { id: "report_standin", prop_rig_id: "card_rig", test_id: "P07-CARD-HANDOVER", max_step_px: 4, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, human_quality_check: "the card passes from claw to hand with a visible shared hold and no jump",
      hands: [{ ref: "orsa_rig#a", prop_socket: "card_edge_giver", grip_angle_deg: 0 }, { ref: "tova_rig#r", prop_socket: "card_edge_taker", grip_angle_deg: 0 }], surfaces: [],
      authority: [{ frames: [0, 348], driver: "orsa_rig#a", required_supports: [] }, { frames: [348, 356], driver: "orsa_rig#a", required_supports: ["tova_rig#r"] }, { frames: [356, 480], driver: "tova_rig#r", required_supports: [] }] },
    { id: "drum", prop_rig_id: "drum_rig", test_id: "P07-DRUM-SUPPORT", max_step_px: 4, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5,
      hands: [{ ref: "orsa_rig#a", prop_socket: "drum_grip_a" }, { ref: "orsa_rig#b", prop_socket: "drum_grip_b" }],
      surfaces: [{ id: "floor", prop_socket: "drum_base", target: { world_xy: floor_xy ?? [700, 592] }, frames: [660, 960] }],
      authority: [{ frames: [480, 660], driver: "orsa_rig#a", required_supports: ["orsa_rig#b"] }, { frames: [660, 690], driver: "orsa_rig#a", required_supports: ["orsa_rig#b", "surface:floor"] }, { frames: [690, 960], driver: "surface:floor", required_supports: [] }] },
  ] };
}
export const planWith = (doc, { pkt = packet(doc), support = supportContract(), plan = basePlan() } = {}) => ({ ...plan, performance: { packet: pkt, profiles: clone(PROFILES), audio_cues: {}, ...(support ? { prop_support: support } : {}) } });
export const SPEC = { subjects: SUBJECTS, shot_ids: SHOT_IDS, scene, plan: basePlan() };
/** build + register the film through the real intake (cached per process) */
let cached = null;
export async function film() { if (cached) return cached; const { runSubjects } = await import("../p03/subjects_fixture.mjs"); const rt = await runSubjects(path.join(REPO, "hybrid_v2", "work", "p07", "subjects"), { spec: SPEC }); const doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8")); cached = { rt, doc }; return cached; }
