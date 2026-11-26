// P08 E07 — directed photography intent on the evaluated frames: lens axis from the phone's socket basis, reviewed 2D wedge (labelled, not 3D),
// include/exclude owners, settled aim, shutter after its cue with a distinct thumb/hand press, no undirected flash. DIAGNOSTIC character fixture.
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs"), PI = await import("../../engine/film/photo_intent.mjs");
const { rt } = await CF.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const press = (at = 0) => ({ id: "shutter_press", kind: "STATE_SWAP", owner: "kade_rig.hand_r", frames: [500 - at, 503], inputs: { events: [{ at: 0, state: "grip" }, { at: at + 1, state: "open" }] }, expected_effect: { kind: "S" } });
const TILT = { id: "phone_tilt", kind: "ROOT_MOVE", owner: "token_rig", frames: [0, 600], inputs: { rot: [[0, -25]] }, expected_effect: { kind: "R" } }; // the directed hold: lens tilted up toward the subject
const plan = ({ prims = [press(), TILT], placements = {} } = {}) => { const p = CF.basePlan(); Object.assign(p.placements, placements); return { ...p, composition: { schema_version: "1.0.0", primitives: prims } }; };
const C = (o) => compileMotionTracks(doc.actions, doc.shots, { doc, plan: plan(o), requireApproval: false });
const INTENT = (o = {}) => ({ schema_version: "1.0.0", id: "photo_1", lens: { rig: "token_rig", socket: "token_rim" }, capture_frame: 500, not_before_frame: 480, aim_window: [480, 500], aim_tolerance_deg: 1,
  region: { kind: "REVIEWED_2D_WEDGE", half_angle_deg: 25, range_px: 600 }, must_include: [{ rig: "pim_rig", label: "intended subject" }, { rig: "pim_rig", joint: "head", label: "subject's face" }], must_exclude: [{ rig: "sheet_rig", label: "private page" }, { rig: "kade_rig", label: "photographer" }],
  shutter: { rig: "kade_rig", channel: "hand_r", press_state: "grip" }, flash: false, ...o });
const inv = (Cx, it = INTENT()) => PI.verifyPhotoIntent(Cx, it).failures.map((x) => x.failed_invariant);
test("E07-1 the intended photo: subject in, private page and photographer out, settled aim, shutter press exactly at capture after its cue, no flash", () => {
  const r = PI.verifyPhotoIntent(C(), INTENT()); assert.ok(r.ok, r.failures.map((x) => x.human_readable_reason).join("; ")); assert.match(r.label, /not a physical 3D frustum/);
  assert.deepEqual(r.measurement.inside, { "intended subject": true, "subject's face": true }); assert.deepEqual(r.measurement.outside, { "private page": true, photographer: true });
});
test("E07-2 negatives: page enters the photo, phone backwards, early shutter, wrong crop, missing/held thumb press, undirected flash, unsettled aim, unlabelled 3D claim", () => {
  assert.ok(inv(C({ placements: { sheet_rig: { x: 1010, y: 560, scale: 1 } } })).includes("EXCLUDES_PRIVATE_REGION"), "report enters the photo");
  assert.ok(inv(C({ prims: [press(), { id: "turn", kind: "ROOT_MOVE", owner: "token_rig", frames: [0, 600], inputs: { rot: [[0, 155]] }, expected_effect: { kind: "R" } }] })).includes("INCLUDES_INTENDED_SUBJECT"), "phone backwards");
  assert.ok(inv(C(), INTENT({ not_before_frame: 520 })).includes("SHUTTER_AFTER_CUE"), "shutter before the reply ends");
  assert.ok(inv(C(), INTENT({ region: { kind: "REVIEWED_2D_WEDGE", half_angle_deg: 1, range_px: 600 } })).includes("INCLUDES_INTENDED_SUBJECT"), "wrong crop");
  assert.ok(inv(C({ prims: [TILT] })).includes("SHUTTER_ACTION_VISIBLE"), "no thumb action"); assert.ok(inv(C({ prims: [press(5), TILT] })).includes("SHUTTER_IS_AN_EVENT"), "press held before the shutter frame");
  assert.ok(inv(C(), INTENT({ flash: true })).includes("NO_UNDIRECTED_FLASH"));
  assert.ok(inv(C({ prims: [press(), { id: "tilt_wobble", kind: "ROOT_MOVE", owner: "token_rig", frames: [0, 600], inputs: { rot: [[0, -25], [470, -25], [519, -13, "linear"]] }, expected_effect: { kind: "R" } }] })).includes("AIM_SETTLED"), "aim still moving in the settled window");
  assert.throws(() => C({ prims: [press(), TILT, { id: "wobble", kind: "ROOT_MOVE", owner: "token_rig", frames: [470, 520], inputs: { rot: [[0, -25], [49, -13]] }, expected_effect: { kind: "R" } }] }), (e) => e.errors?.some((x) => x.failed_invariant === "ONE_PRIMARY_WRITER"), "two composed writers of the same root rotation");
  assert.ok(inv(C(), INTENT({ region: { kind: "FRUSTUM_3D", half_angle_deg: 25, range_px: 600 } })).includes("REGION_KIND_LABELLED"));
});
