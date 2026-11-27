// VF-1: screen facing is measured from the drawing's own cues (near eye, ear, nose, pupils) and checked against the film's view geography;
// a mislabelled view or disagreeing cues are refused. E01's Mia master (measured cues) faces SCREEN_LEFT = to_regular.
import test from "node:test"; import assert from "node:assert/strict"; import { headFacing, validateViewTargets } from "../../engine/art_bridge/view_facing.mjs";
test("VF-1 head facing and target projection", () => {
  const mia = headFacing({ eye_near: [542, 293], eye_far: [429, 264], ear: [679, 338], nose: [484.2, 307.7], pupils: [{ pupil: [435.8, 255.3], sclera: [454, 269.6] }, { pupil: [560.4, 283], sclera: [577.3, 297.2] }] });
  assert.equal(mia.facing, "SCREEN_LEFT"); assert.equal(mia.gaze, "SCREEN_LEFT");
  assert.equal(headFacing({ eye_near: [400, 300], eye_far: [520, 290], ear: [330, 320], nose: [520, 310] }).facing, "SCREEN_RIGHT");
  assert.equal(headFacing({ eye_near: [542, 293], eye_far: [429, 264], nose: [560, 300] }).facing, "AMBIGUOUS"); // nose contradicts the near-eye cue
  const targets = { to_regular: { target: "REGULAR", screen_side: "SCREEN_LEFT", gaze_accept: ["SCREEN_LEFT"] }, to_lead: { target: "LEAD", screen_side: "SCREEN_RIGHT" } };
  assert.deepEqual(validateViewTargets({ targets, measured: { torso_master: { view_key: "to_regular", ...mia } } }), []);
  assert.equal(validateViewTargets({ targets, measured: { torso_master: { view_key: "to_lead", ...mia } } })[0].code, "VIEW_TARGET_MISMATCH");
  assert.equal(validateViewTargets({ targets, measured: { x: { view_key: "to_moon", facing: "FRONT" } } })[0].code, "VIEW_KEY_UNDECLARED");
});
