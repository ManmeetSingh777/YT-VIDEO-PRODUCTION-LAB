// (E) rig-fit case: the approved master's arm is 25% shorter than the PROVISIONAL rig. The art is the truth: the rig must be fitted to it,
// the planned grip at frames 200–300 then becomes unreachable (restaging required), and an approved restaged plan becomes feasible.
// DIAGNOSTIC raster only.
import fs from "node:fs"; import path from "node:path";
import { buildRoundTrip, drawFigureVariant, LM } from "./roundtrip_fixture.mjs";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), W = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
export async function buildRigFitCase(dir) {
  const rt = buildRoundTrip(dir), k = 0.75, lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const lm = { ...LM }; lm.elbow_r = lerp(LM.shoulder_r, LM.elbow_r, k); lm.upper_arm_mid = lerp(LM.shoulder_r, lm.elbow_r, 0.5);
  const d = [LM.wrist_r[0] - LM.elbow_r[0], LM.wrist_r[1] - LM.elbow_r[1]]; lm.wrist_r = [lm.elbow_r[0] + d[0] * k, lm.elbow_r[1] + d[1] * k]; lm.forearm_mid = lerp(lm.elbow_r, lm.wrist_r, 0.5);
  for (const n of ["knuckle_r", "thumb_r"]) lm[n] = [lm.wrist_r[0] + (LM[n][0] - LM.wrist_r[0]), lm.wrist_r[1] + (LM[n][1] - LM.wrist_r[1])];
  const master = path.join(rt.src, "master_short_arm.png"), landmarks = path.join(rt.src, "master_short_arm.landmarks.json"); drawFigureVariant(master, landmarks, lm);
  // plan: canonical frame from three body anchors only; every other landmark is measured from the approved art
  const pf = path.join(rt.film, "handoff", "ART_DEPENDENCY_PLAN.json"), plan = J(pf); plan.assets.find((a) => a.asset_id === "pilot_master").registration = { mode: "FIT_RIG", frame_anchors: ["head_top", "neck", "pelvis"] }; W(pf, plan);
  // action: an IK grip toward a fixed world point reachable by the provisional arm (180 px) but not by the 25% shorter art arm (~147 px)
  const mf = rt.manifest, doc = J(mf); doc.rigs[0].constraints = [{ id: "arm_ik", type: "TWO_BONE_IK", chain: ["shoulder_r", "elbow_r", "wrist_r"], bend_sign: 1 }];
  doc.actions[0].contact_events = [{ start_frame: 200, end_frame: 300, source_socket: "pilot_grip", target_socket: "rail_point", contact_type: "GRIP", allowed_error_px: 0.5, near_far_relation: "hand over rail", release_behavior: "none", target_world_xy: [960, 580] }];
  W(mf, doc);
  const restagedPlan = { ...J(path.join(rt.film, "handoff", "MOTION_PLAN.json")), placements: { pilot_rig: { x: 905, y: 610, scale: 1.2 } }, restaging_note: "actor moved 50 px closer to the rail (approved restaging, proportions untouched)" };
  return { ...rt, master, landmarks, measured: Object.fromEntries(Object.entries(lm).map(([n, v]) => [n, v])), restagedPlan };
}
