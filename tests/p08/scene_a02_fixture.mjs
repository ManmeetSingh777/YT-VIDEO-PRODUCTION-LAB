// P08 A02 DIAGNOSTIC scene (same unlike subjects as P07, built through the SAME real intake): three shots, one physical contact per hand that
// persists across both cuts and is released in the third shot by a command of another action. Shot B frames the creature; the biped and the
// plaque it carries are OFFSCREEN there, but their contacts and the carried prop keep evolving (physics is not per-shot).
//   s_a [0,300)  wide: tova grips the plaque with both hands and lifts it (actor-driven hand path)
//   s_b [300,600) on orsa: tova (offscreen) carries the plaque 40 px to the right and back
//   s_c [600,960) wide: tova lowers it onto the bench, lets go hand by hand (700/712), then the SAME right hand takes the card from orsa (740)
import path from "node:path";
import * as F from "../tbo/support_fixture.mjs";
const { clone } = F, SHOTS = ["p08a_s_a", "p08a_s_b", "p08a_s_c"], ACT = { a: "p08a_lift", b: "p08a_carry_offscreen", c: "p08a_setdown_and_take" };
export const DIGEST = F.DIGEST, DECISIONS = F.DECISIONS;
const act = (A, id, shot, fr, actors, goal) => ({ ...A, id, shot_id: shot, frame_range: fr, semantic_goal: goal, proof_conditions: ["one contact identity across cuts", "no regrip at a cut"], actors: actors.map(([rig_id, xy]) => ({ rig_id, root_world_xy: xy, root_scale: 1 })), contact_events: [], pose_events: [{ frame: fr[0], state_id: "rest" }], state_events: [] });
const ALL = [["tova_rig", [600, 500]], ["orsa_rig", [880, 520]], ["slab_rig", [600, 420]], ["card_rig", [700, 452]], ["bench_rig", [600, 530]]];
export function scene({ A }) {
  const shot = (id, fr, cam, next, att) => ({ id, start_frame: fr[0], end_frame: fr[1], world_id: "p03_world_w", entry_state: "holding", events: ["carry"], attention_path: att, camera_track_id: cam, required_asset_ids: ["p03_world_far"], exit_state: "held", continuity_to: next, hold_purpose: "diagnostic persistent contact" });
  return { project_id: "p08_a02", total_frames: 960, actions: [act(A, ACT.a, SHOTS[0], [0, 300], ALL, "a biped lifts a plaque with both hands"), act(A, ACT.b, SHOTS[1], [300, 600], ALL, "offscreen, the biped carries it while the camera watches the creature"), act(A, ACT.c, SHOTS[2], [600, 960], ALL, "the plaque is set down and released; the same hand takes the card")],
    shots: [shot(SHOTS[0], [0, 300], "cam_a", SHOTS[1], ["hands", "plaque"]), shot(SHOTS[1], [300, 600], "cam_b", SHOTS[2], ["creature"]), shot(SHOTS[2], [600, 960], "cam_c", null, ["hands", "card"])] };
}
export const basePlan = () => ({ id: "p08_a02_plan", placements: clone(F.placements), tracks: { card_rig: { root: {} } }, cameras: { cam_a: { x: [[0, 640]], y: [[0, 470]], zoom: [[0, 1.4]] }, cam_b: { x: [[300, 1180]], y: [[300, 520]], zoom: [[300, 2.2]] }, cam_c: { x: [[600, 660]], y: [[600, 470]], zoom: [[600, 1.4]] } } });
export const SPEC = { subjects: F.SUBJECTS, shot_ids: SHOTS, scene, plan: basePlan() };
const E = (kind, owner, frames, test_id, extra = {}) => ({ kind, owner_id: owner, frames, test_id, human_quality_check: `native playback: ${kind} reads as intended on ${owner}`, ...extra });
const ST = (cs = {}, pos = {}) => ({ channel_states: cs, possession: pos });
const cmd = (o) => ({ direction_decision_ids: DECISIONS, override_policy: "DIRECTOR_PRIORITY_STRICT", source_digest: DIGEST, required_prestate: ST(), required_poststate: ST(), required_art_refs: [], ...o });
const T = (a) => ({ actor_rig_id: "tova_rig", character_profile_id: "tova_perf", action_id: a }), O = (a) => ({ actor_rig_id: "orsa_rig", character_profile_id: "orsa_perf", action_id: a });
const sock = (rig, s) => ({ kind: "RIG_SOCKET", rig_id: rig, socket_id: s });
const grip = (base, id, frames, target, hand, ch, closed, close_to, art) => cmd({ ...base, id, verb: "grip", frames, target, intent: "takes hold", phases: [{ id: "close", frames: [frames[0], close_to], goal: "close", expected_owner_effect: "closed hand on the prop" }, { id: "hold", frames: [close_to, frames[1]], goal: "hold", expected_owner_effect: "held" }], motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_poststate: ST({ [ch]: closed }), required_art_refs: art, expected_effects: [E("PaintedGripMaintained", `${base.actor_rig_id}.${hand}`, frames, `P08-${id}`)] });
const release = (base, id, frames, target, hand, ch, open_to, art) => cmd({ ...base, id, verb: "release", frames, target, intent: "lets go", phases: [{ id: "open", frames: [frames[0], open_to], goal: "open", expected_owner_effect: "open hand" }, { id: "retract", frames: [open_to, frames[1]], goal: "retract", expected_owner_effect: "hand leaves the prop" }], motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_poststate: ST({ [ch]: "open" }), required_art_refs: art, expected_effects: [E("ReleaseAndSeparation", `${base.actor_rig_id}.${hand}`, frames, `P08-${id}`, { minimum: 2, units: "px" })] });
const TL = ["tova_hand_l_grip", "tova_hand_l_open"], TR = ["tova_hand_r_grip", "tova_hand_r_open"], OA = ["orsa_claw_a_closed", "orsa_claw_a_open"];
export function packet(doc) {
  const SL = sock("slab_rig", "slab_grip_l"), SR = sock("slab_rig", "slab_grip_r"), CG = sock("card_rig", "card_edge_giver"), CT = sock("card_rig", "card_edge_taker");
  return { schema_version: "1.0.0", film_id: "p08_a02", fps: 60, total_frames: doc.stage.total_frames, characters: F.CHARACTERS(doc), commands: [
    grip(T(ACT.a), "t_grip_l", [0, 10], SL, "tova_palm_l", "hand_l", "grip", 5, TL), grip(T(ACT.a), "t_grip_r", [0, 10], SR, "tova_palm_r", "hand_r", "grip", 5, TR),
    grip(O(ACT.a), "o_grip_card", [0, 10], CG, "orsa_claw_a", "claw_a", "closed", 5, OA),
    release(T(ACT.c), "t_release_r", [700, 712], SR, "tova_palm_r", "hand_r", 706, ["tova_hand_r_open"]), release(T(ACT.c), "t_release_l", [712, 724], SL, "tova_palm_l", "hand_l", 718, ["tova_hand_l_open"]),
    cmd({ ...T(ACT.c), id: "t_reach_card", verb: "reach", frames: [712, 740], target: CT, intent: "reaches for the offered card", phases: [{ id: "approach", frames: [712, 740], goal: "hand travels to the card edge", expected_owner_effect: "palm arrives at the edge" }], motion_routes: ["PART_RIG_2D"], expected_effects: [E("ContactApproach", "tova_rig.tova_palm_r", [712, 740], "P08-t_reach_card", { minimum: 5, units: "px" })] }),
    grip(T(ACT.c), "t_grip_card", [740, 960], CT, "tova_palm_r", "hand_r", "grip", 748, TR), release(O(ACT.c), "o_release_card", [756, 768], CG, "orsa_claw_a", "claw_a", 762, ["orsa_claw_a_open"]),
  ] };
}
/** the approved continuity: both plaque grips are ONE contact each from s_a to their release in s_c; the creature's card grip likewise */
export const continuity = () => ({ schema_version: "1.0.0", contacts: [
  { contact_id: "c_tova_l_plaque", grip_command: "t_grip_l", release_command: "t_release_l", support_contract_id: "plaque", shot_visibility: { p08a_s_a: { visibility: "VISIBLE" }, p08a_s_b: { visibility: "OFFSCREEN", reason: "camera on the creature" }, p08a_s_c: { visibility: "VISIBLE" } } },
  { contact_id: "c_tova_r_plaque", grip_command: "t_grip_r", release_command: "t_release_r", support_contract_id: "plaque", shot_visibility: { p08a_s_a: { visibility: "VISIBLE" }, p08a_s_b: { visibility: "OFFSCREEN", reason: "camera on the creature" }, p08a_s_c: { visibility: "VISIBLE" } } },
  { contact_id: "c_orsa_card", grip_command: "o_grip_card", release_command: "o_release_card", support_contract_id: "card", shot_visibility: { p08a_s_a: { visibility: "VISIBLE" }, p08a_s_b: { visibility: "VISIBLE" }, p08a_s_c: { visibility: "VISIBLE" } } },
] });
/** support: plaque actor-driven by the right hand along a directed path measured from the held start (h9 = right palm at f9) */
export function support(h9) { const [x, y] = h9;
  const pathR = { x: [[10, x], [300, x], [500, x + 40, "sine.inOut"], [600, x + 40], [640, x, "sine.inOut"]], y: [[10, y], [20, y], [120, y - 30, "sine.inOut"], [640, y - 30], [690, y + 60, "sine.inOut"]] };
  return { schema_version: "1.1.0", props: [
    { id: "plaque", prop_rig_id: "slab_rig", test_id: "P08-A02-PLAQUE", max_step_px: 6, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, hands: [{ ref: "tova_rig#l", prop_socket: "slab_grip_l" }, { ref: "tova_rig#r", prop_socket: "slab_grip_r" }],
      surfaces: [{ id: "bench", prop_socket: "slab_base", target: { rig_id: "bench_rig", socket_id: "bench_top_slab" }, frames: [690, 960] }],
      authority: [{ frames: [0, 10], driver: "tova_rig#r", required_supports: ["tova_rig#l"], mode: "OBJECT_DRIVEN" }, { frames: [10, 690], driver: "tova_rig#r", required_supports: ["tova_rig#l"], mode: "ACTOR_DRIVEN", driver_path: pathR },
        { frames: [690, 700], driver: "tova_rig#r", required_supports: ["tova_rig#l", "surface:bench"], mode: "ACTOR_DRIVEN", driver_path: pathR }, { frames: [700, 960], driver: "surface:bench", required_supports: [], mode: "SURFACE_DRIVEN" }] },
    { id: "card", prop_rig_id: "card_rig", test_id: "P08-A02-CARD", max_step_px: 4, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, hands: [{ ref: "orsa_rig#a", prop_socket: "card_edge_giver" }, { ref: "tova_rig#r", prop_socket: "card_edge_taker" }], surfaces: [],
      authority: [{ frames: [0, 748], driver: "orsa_rig#a", required_supports: [], mode: "OBJECT_DRIVEN" }, { frames: [748, 756], driver: "orsa_rig#a", required_supports: ["tova_rig#r"], mode: "OBJECT_DRIVEN" }, { frames: [756, 960], driver: "tova_rig#r", required_supports: [], mode: "OBJECT_DRIVEN" }] },
  ] }; }
export const planWith = (doc, { pkt = packet(doc), cc = continuity(), sup, plan = basePlan() } = {}) => ({ ...plan, performance: { packet: pkt, profiles: clone(F.PROFILES), audio_cues: {}, ...(sup ? { prop_support: sup } : {}), ...(cc ? { contact_continuity: cc } : {}) } });
let cached = null;
export async function film() { if (cached) return cached; const { runSubjects } = await import("../p03/subjects_fixture.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs"); const rt = await runSubjects(isolatedWork("p08_a02_subjects"), { spec: SPEC }); cached = { rt }; return cached; }
export const SHOT_IDS = SHOTS, ACTIONS = ACT;
void path;
