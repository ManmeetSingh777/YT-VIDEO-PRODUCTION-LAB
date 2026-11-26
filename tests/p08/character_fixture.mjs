// P08 DIAGNOSTIC character fixture — two UNLIKE bipeds with legs, hands and a composed face, built and registered through the SAME real intake as
// P03/P07 (tests/p03/subjects_fixture.mjs). Rasters are flat signed-distance stand-ins (DIAGNOSTIC_FIXTURE, never art); approvals are TEST_TRUST
// inside `.diagnostic_namespace` (production refuses them). Every drawing has a UNIQUE flat colour so pixel tests identify each owner's drawing.
//   "kade": tall biped (long legs, short torso)      "pim": short biped (short legs, long torso, big head) — same semantic roles, different geometry
//   face (both): base head + BROWS (expression channel, families NEUTRAL/SMILE, intermediate states, approved edges, one baked-mouth state)
//                + EYES (open/closed) + MOUTH (2 families × 11 visemes, each state declares {family, viseme, view_id})
//   props: "sheet" (flat page, pinch faces) and "token" (thin coin); world plate from P03. The engine knows none of these names.
import path from "node:path"; import crypto from "node:crypto";
const S = (o) => o, P = (joint, pivot, lms, shape, extra) => [joint, pivot, lms, shape, extra];
const segD = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1]], ap = [p[0] - a[0], p[1] - a[1]], t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]); };
const circ = (c, r) => (p) => Math.hypot(p[0] - c[0], p[1] - c[1]) - r, limb = (a, b, r) => (p) => segD(p, a, b) - r;
const ell = (c, rx, ry) => (p) => (Math.hypot((p[0] - c[0]) / rx, (p[1] - c[1]) / ry) - 1) * Math.min(rx, ry);
const rect = (c, hw, hh) => (p) => { const dx = Math.abs(p[0] - c[0]) - hw, dy = Math.abs(p[1] - c[1]) - hh; return Math.hypot(Math.max(dx, 0), Math.max(dy, 0)) + Math.min(Math.max(dx, dy), 0); };
export const VISEMES = ["REST", "MBP", "FV", "TH", "L", "NARROW", "CHJ", "AA", "EE", "OH", "OO"], FAMILIES = ["NEUTRAL", "SMILE"];
/** expression ladder (D4-like): mock → mock_grin_1 → grin → slip → concern → social; neutral → mock; laugh_bundled carries a baked mouth */
export const EXPR = [["neutral", "NEUTRAL"], ["mock", "NEUTRAL"], ["mock_grin_1", "SMILE"], ["grin", "SMILE"], ["slip", "SMILE"], ["concern", "NEUTRAL"], ["social", "SMILE"], ["surprise", "NEUTRAL"], ["laugh_bundled", "SMILE"]];
export const EXPR_EDGES = [["neutral", "mock"], ["mock", "mock_grin_1"], ["mock_grin_1", "grin"], ["grin", "slip"], ["slip", "concern"], ["concern", "social"], ["neutral", "surprise"], ["surprise", "neutral"], ["grin", "laugh_bundled"], ["laugh_bundled", "grin"]];
/** unique colour per (subject, drawing): deterministic, well separated, never close to a world/other colour */
const used = new Set(); export const COL = {};
const col = (key) => { if (COL[key]) return COL[key]; let h = crypto.createHash("sha256").update(key).digest(), n = 0; for (;;) { const c = [40 + (h[n % 32] % 200), 40 + (h[(n + 7) % 32] % 200), 40 + (h[(n + 13) % 32] % 200)]; const k = c.map((v) => Math.round(v / 6)).join(","); if (!used.has(k)) { used.add(k); return (COL[key] = c); } n++; if (n > 64) { h = crypto.createHash("sha256").update(h).digest(); n = 0; } } };
function biped(sid, d) {
  const cx = 220, { head_r, torso, leg, arm, top } = d, neckY = top + 2 * head_r + 10, chestY = neckY + 40, pelY = neckY + torso, hipY = pelY + 10, kneeY = hipY + leg / 2, ankY = hipY + leg;
  const lm = { head_top: [cx, top], head_c: [cx, top + head_r], neck: [cx, neckY], chest: [cx, chestY], pelvis: [cx, pelY],
    eye_l: [cx - head_r * 0.38, top + head_r * 0.85], eye_r: [cx + head_r * 0.38, top + head_r * 0.85], eye_c: [cx, top + head_r * 0.85], brow_l: [cx - head_r * 0.4, top + head_r * 0.55], brow_r: [cx + head_r * 0.4, top + head_r * 0.55], brow_c: [cx, top + head_r * 0.55],
    mouth_c: [cx, top + head_r * 1.45], mouth_l: [cx - head_r * 0.3, top + head_r * 1.45], mouth_r: [cx + head_r * 0.3, top + head_r * 1.45],
    shoulder_l: [cx - 45, chestY - 15], elbow_l: [cx - 55, chestY - 15 + arm / 2], wrist_l: [cx - 60, chestY - 15 + arm], knuckle_l: [cx - 62, chestY + arm + 18], thumb_l: [cx - 74, chestY + arm + 2],
    shoulder_r: [cx + 45, chestY - 15], elbow_r: [cx + 55, chestY - 15 + arm / 2], wrist_r: [cx + 60, chestY - 15 + arm], knuckle_r: [cx + 62, chestY + arm + 18], thumb_r: [cx + 74, chestY + arm + 2],
    hip_l: [cx - 22, hipY], knee_l: [cx - 24, kneeY], ankle_l: [cx - 25, ankY], toe_l: [cx - 55, ankY + 16], hip_r: [cx + 22, hipY], knee_r: [cx + 24, kneeY], ankle_r: [cx + 25, ankY], toe_r: [cx + 55, ankY + 16] };
  const C = (k) => col(`${sid}:${k}`), H = [lm.head_top, lm.head_c, lm.neck];
  const parts = { torso: P("chest", "chest", ["neck", "chest", "pelvis"], (M) => ({ rgb: C("torso"), sdf: limb(M.neck, M.pelvis, d.torso_w) })),
    head: P("head", "neck", ["head_top", "head_c", "neck"], (M) => ({ rgb: C("head"), sdf: (p) => Math.min(circ(M.head_c, head_r * 2)(p), limb(M.head_c, M.neck, 24)(p)) })),
    brows: P("head", "brow_l", ["brow_l", "brow_r", "head_c"], (M) => ({ rgb: C("expr:neutral"), sdf: (p) => Math.min(limb(M.brow_l, [M.brow_l[0] + 18, M.brow_l[1]], 5)(p), limb(M.brow_r, [M.brow_r[0] - 18, M.brow_r[1]], 5)(p)) }), { state: true }),
    eyes: P("head", "eye_l", ["eye_l", "eye_r", "head_c"], (M) => ({ rgb: C("eyes:open"), sdf: (p) => Math.min(circ(M.eye_l, 9)(p), circ(M.eye_r, 9)(p)) }), { state: true }),
    mouth: P("head", "mouth_c", ["mouth_c", "mouth_l", "head_c"], (M) => ({ rgb: C("mouth:NEUTRAL_REST"), sdf: ell(M.mouth_c, 26, 6) }), { state: true }),
    thigh_l: P("hip_l", "hip_l", ["hip_l", "knee_l", "pelvis"], (M) => ({ rgb: C("thigh_l"), sdf: limb(M.hip_l, M.knee_l, 17) })), shin_l: P("knee_l", "knee_l", ["knee_l", "ankle_l", "hip_l"], (M) => ({ rgb: C("shin_l"), sdf: limb(M.knee_l, M.ankle_l, 14) })), foot_l: P("ankle_l", "ankle_l", ["ankle_l", "toe_l", "knee_l"], (M) => ({ rgb: C("foot_l"), sdf: limb(M.ankle_l, M.toe_l, 10) })),
    thigh_r: P("hip_r", "hip_r", ["hip_r", "knee_r", "pelvis"], (M) => ({ rgb: C("thigh_r"), sdf: limb(M.hip_r, M.knee_r, 17) })), shin_r: P("knee_r", "knee_r", ["knee_r", "ankle_r", "hip_r"], (M) => ({ rgb: C("shin_r"), sdf: limb(M.knee_r, M.ankle_r, 14) })), foot_r: P("ankle_r", "ankle_r", ["ankle_r", "toe_r", "knee_r"], (M) => ({ rgb: C("foot_r"), sdf: limb(M.ankle_r, M.toe_r, 10) })),
    upper_arm_l: P("shoulder_l", "shoulder_l", ["shoulder_l", "elbow_l", "chest"], (M) => ({ rgb: C("ua_l"), sdf: limb(M.shoulder_l, M.elbow_l, 13) })), forearm_l: P("elbow_l", "elbow_l", ["elbow_l", "wrist_l", "shoulder_l"], (M) => ({ rgb: C("fa_l"), sdf: limb(M.elbow_l, M.wrist_l, 11) })),
    hand_l_open: P("wrist_l", "wrist_l", ["wrist_l", "knuckle_l", "thumb_l"], (M) => ({ rgb: C("hand_l:open"), sdf: (p) => Math.min(limb(M.wrist_l, M.knuckle_l, 13)(p), limb(M.wrist_l, M.thumb_l, 6)(p)) }), { state: true }),
    upper_arm_r: P("shoulder_r", "shoulder_r", ["shoulder_r", "elbow_r", "chest"], (M) => ({ rgb: C("ua_r"), sdf: limb(M.shoulder_r, M.elbow_r, 13) })), forearm_r: P("elbow_r", "elbow_r", ["elbow_r", "wrist_r", "shoulder_r"], (M) => ({ rgb: C("fa_r"), sdf: limb(M.elbow_r, M.wrist_r, 11) })),
    hand_r_open: P("wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: C("hand_r:open"), sdf: (p) => Math.min(limb(M.wrist_r, M.knuckle_r, 13)(p), limb(M.wrist_r, M.thumb_r, 6)(p)) }), { state: true }) };
  const states_only = { hand_l_grip: P("wrist_l", "wrist_l", ["wrist_l", "knuckle_l", "thumb_l"], (M) => ({ rgb: C("hand_l:grip"), sdf: circ([(M.wrist_l[0] + M.knuckle_l[0]) / 2, (M.wrist_l[1] + M.knuckle_l[1]) / 2], 40) })),
    hand_r_grip: P("wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: C("hand_r:grip"), sdf: circ([(M.wrist_r[0] + M.knuckle_r[0]) / 2, (M.wrist_r[1] + M.knuckle_r[1]) / 2], 40) })),
    eyes_closed: P("head", "eye_l", ["eye_l", "eye_r", "head_c"], (M) => ({ rgb: C("eyes:closed"), sdf: (p) => Math.min(limb([M.eye_l[0] - 9, M.eye_l[1]], [M.eye_l[0] + 9, M.eye_l[1]], 3)(p), limb([M.eye_r[0] - 9, M.eye_r[1]], [M.eye_r[0] + 9, M.eye_r[1]], 3)(p)) })) };
  EXPR.filter(([e]) => e !== "neutral").forEach(([e], i) => { states_only[`brows_${e}`] = P("head", "brow_l", ["brow_l", "brow_r", "head_c"], (M) => ({ rgb: C(`expr:${e}`), sdf: (p) => Math.min(limb(M.brow_l, [M.brow_l[0] + 18, M.brow_l[1] - 3 + i], 5)(p), limb(M.brow_r, [M.brow_r[0] - 18, M.brow_r[1] - 3 + i], 5)(p)) })); });
  for (const fam of FAMILIES) for (const [i, v] of VISEMES.entries()) { const k = `${fam}_${v}`; if (k === "NEUTRAL_REST") continue; states_only[`mouth_${k}`] = P("head", "mouth_c", ["mouth_c", "mouth_l", "head_c"], (M) => ({ rgb: C(`mouth:${k}`), sdf: ell(M.mouth_c, 18 + (i % 4) * 3 + (fam === "SMILE" ? 5 : 0), 3 + (i % 5) * 2) })); }
  const ch = (id, kind, slot, def, states) => ({ id, kind, slots: [`${sid}_${slot}`], default: def, states });
  const channels = [ch("hand_l", "HAND", "hand_l_open", "open", [{ id: "open", asset_bindings: {} }, { id: "grip", asset_bindings: { [`${sid}_hand_l_open`]: `${sid}_hand_l_grip` } }]),
    ch("hand_r", "HAND", "hand_r_open", "open", [{ id: "open", asset_bindings: {} }, { id: "grip", asset_bindings: { [`${sid}_hand_r_open`]: `${sid}_hand_r_grip` } }]),
    ch("eyes", "EYES", "eyes", "open", [{ id: "open", asset_bindings: {} }, { id: "closed", asset_bindings: { [`${sid}_eyes`]: `${sid}_eyes_closed` } }]),
    { ...ch("expr", "EXPRESSION", "brows", "neutral", EXPR.map(([e, fam]) => ({ id: e, asset_bindings: e === "neutral" ? {} : { [`${sid}_brows`]: `${sid}_brows_${e}` }, face: { family: fam, ...(e === "laugh_bundled" ? { bundled_mouth: true } : {}) } }))), edges: EXPR_EDGES.map(([from, to]) => ({ from, to, approved_review_id: null })) },
    ch("mouth", "MOUTH", "mouth", "NEUTRAL_REST", FAMILIES.flatMap((fam) => VISEMES.map((v) => ({ id: `${fam}_${v}`, asset_bindings: `${fam}_${v}` === "NEUTRAL_REST" ? {} : { [`${sid}_mouth`]: `${sid}_mouth_${fam}_${v}` }, face: { family: fam, viseme: v, view_id: "front" } }))))];
  const semantics = Object.fromEntries(["pelvis", "chest", "head", "shoulder_l", "elbow_l", "wrist_l", "shoulder_r", "elbow_r", "wrist_r", "hip_l", "knee_l", "ankle_l", "hip_r", "knee_r", "ankle_r"].map((j) => [j, `${j.replace("_", " ")} hinge (DIAGNOSTIC)`]));
  return S({ kind: "CHARACTER", family: "ACTING_HUMAN", face: true, canvas: [560, Math.ceil(2 * (ankY + 40) + 60)], root: "pelvis", lm,
    joints: [["pelvis", null, "pelvis", [-30, 30]], ["chest", "pelvis", "chest", [-30, 30]], ["head", "chest", "neck", [-35, 35]], ["shoulder_l", "chest", "shoulder_l", [-170, 170]], ["elbow_l", "shoulder_l", "elbow_l", [-150, 150]], ["wrist_l", "elbow_l", "wrist_l", [-120, 120]],
      ["shoulder_r", "chest", "shoulder_r", [-170, 170]], ["elbow_r", "shoulder_r", "elbow_r", [-150, 150]], ["wrist_r", "elbow_r", "wrist_r", [-120, 120]], ["hip_l", "pelvis", "hip_l", [-100, 100]], ["knee_l", "hip_l", "knee_l", [-5, 140]], ["ankle_l", "knee_l", "ankle_l", [-50, 50]],
      ["hip_r", "pelvis", "hip_r", [-100, 100]], ["knee_r", "hip_r", "knee_r", [-5, 140]], ["ankle_r", "knee_r", "ankle_r", [-50, 50]]],
    parts, states_only, master_order: ["thigh_l", "shin_l", "foot_l", "thigh_r", "shin_r", "foot_r", "torso", "head", "brows", "eyes", "mouth", "upper_arm_l", "forearm_l", "hand_l_open", "upper_arm_r", "forearm_r", "hand_r_open"],
    sockets: [{ id: `${sid}_palm_l`, joint_id: "wrist_l", local_xy: [-2, 20], basis_angle_deg: 0, semantic_role: "left palm centre" }, { id: `${sid}_palm_r`, joint_id: "wrist_r", local_xy: [2, 20], basis_angle_deg: 0, semantic_role: "right palm centre" },
      { id: `${sid}_sole_l`, joint_id: "ankle_l", local_xy: [-12, 18], basis_angle_deg: 0, semantic_role: "left sole" }, { id: `${sid}_sole_r`, joint_id: "ankle_r", local_xy: [12, 18], basis_angle_deg: 0, semantic_role: "right sole" }],
    ik: [["arm_l_ik", ["shoulder_l", "elbow_l", "wrist_l"], 1], ["arm_r_ik", ["shoulder_r", "elbow_r", "wrist_r"], -1], ["leg_l_ik", ["hip_l", "knee_l", "ankle_l"], -1], ["leg_r_ik", ["hip_r", "knee_r", "ankle_r"], -1]],
    channels, pose_states: [["rest", {}]], edges: [], semantics,
    face_composition: { view_id: "front", regions: [{ slot: `${sid}_head`, role: "BASE_HEAD" }, { slot: `${sid}_brows`, role: "BROWS" }, { slot: `${sid}_eyes`, role: "EYES" }, { slot: `${sid}_mouth`, role: "MOUTH" }], expression_channel: "expr", mouth_channel: "mouth", eyes_channel: "eyes" } });
}
export const SUBJECTS = { kade: biped("kade", { head_r: 32, torso: 170, leg: 300, arm: 150, top: 10, torso_w: 34 }), pim: biped("pim", { head_r: 46, torso: 150, leg: 150, arm: 110, top: 10, torso_w: 44 }),
  sheet: S({ kind: "PROP", family: "PROP", face: false, canvas: [360, 260], root: "sheet", lm: { sheet_c: [90, 60], edge_r: [150, 60], edge_l: [30, 60], top: [90, 10] }, joints: [["sheet", null, "sheet_c", [-40, 40]]],
    parts: { page: P("sheet", "sheet_c", ["sheet_c", "edge_r", "top"], (M) => ({ rgb: col("sheet:page"), sdf: rect(M.sheet_c, 110, 90) })) }, states_only: {}, master_order: ["page"],
    sockets: [{ id: "sheet_edge_r_front", joint_id: "sheet", local_xy: [58, 0], basis_angle_deg: 0, semantic_role: "right edge, front face" }, { id: "sheet_edge_l_front", joint_id: "sheet", local_xy: [-58, 0], basis_angle_deg: 0, semantic_role: "left edge, front face" }], ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { sheet: "rigid page (DIAGNOSTIC)" } }),
  token: S({ kind: "PROP", family: "PROP", face: false, canvas: [160, 120], root: "token", lm: { token_c: [30, 20], edge: [42, 20], top: [30, 12] }, joints: [["token", null, "token_c", [-60, 60]]],
    parts: { coin: P("token", "token_c", ["token_c", "edge", "top"], (M) => ({ rgb: col("token:coin"), sdf: ell(M.token_c, 26, 8) })) }, states_only: {}, master_order: ["coin"],
    sockets: [{ id: "token_rim", joint_id: "token", local_xy: [10, 0], basis_angle_deg: 0, semantic_role: "rim (pinch faces top/bottom)" }], ik: [], channels: [], pose_states: [["rest", {}]], edges: [], semantics: { token: "rigid thin coin (DIAGNOSTIC)" } }) };
export const SHOT_IDS = ["p08c_s1"];
export const ACT = { kade: "p08c_kade_acts", pim: "p08c_pim_acts", props: "p08c_props" };
export function scene({ A }) {
  const a = (id, actors, goal) => ({ ...A, id, shot_id: SHOT_IDS[0], frame_range: [0, 600], semantic_goal: goal, proof_conditions: ["owner effect visible"], actors: actors.map(([rig_id, xy]) => ({ rig_id, root_world_xy: xy, root_scale: 1 })), contact_events: [], pose_events: [{ frame: 0, state_id: "rest" }], state_events: [] });
  return { project_id: "p08_characters", total_frames: 600, actions: [a(ACT.kade, [["kade_rig", [560, 470]]], "tall biped acts"), a(ACT.pim, [["pim_rig", [1080, 560]]], "short biped acts"), a(ACT.props, [["sheet_rig", [760, 520]], ["token_rig", [900, 600]]], "props wait")],
    shots: [{ id: SHOT_IDS[0], start_frame: 0, end_frame: 600, world_id: "p03_world_w", entry_state: "idle", events: ["acting"], attention_path: ["faces"], camera_track_id: "cam_1", required_asset_ids: ["p03_world_far"], exit_state: "idle", continuity_to: null, hold_purpose: "diagnostic acting" }] };
}
export const placements = { kade_rig: { x: 560, y: 470, scale: 1 }, pim_rig: { x: 1080, y: 560, scale: 1 }, sheet_rig: { x: 760, y: 520, scale: 1 }, token_rig: { x: 900, y: 600, scale: 1 } };
export const basePlan = () => ({ id: "p08_characters_plan", placements: JSON.parse(JSON.stringify(placements)), tracks: {}, cameras: { cam_1: { x: [[0, 820]], y: [[0, 520]], zoom: [[0, 1.0]] } } });
export const SPEC = { subjects: SUBJECTS, shot_ids: SHOT_IDS, scene, plan: basePlan() };
let cached = null;
export async function film() { if (cached) return cached; const { runSubjects } = await import("../p03/subjects_fixture.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs"); const rt = await runSubjects(isolatedWork("p08_characters"), { spec: SPEC }); cached = { rt }; return cached; }
void path;
