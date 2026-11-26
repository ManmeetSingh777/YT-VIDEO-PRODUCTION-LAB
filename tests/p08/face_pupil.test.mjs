// P08 C04 — pupil containment on the REGISTERED eye mask, through the real compiled plan and the renderer's own passes (stateAtFrame → passes →
// registered alpha). "corner" keeps the pupil's bounding box inside the eye's bounding box but crosses the round eye outline: a bbox test passes it,
// the mask test must not. "out" leaves the eye. A declared pupil with no film to read the registered art from is never silently skipped.
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyFaceComposition } = await import("../../engine/film/performance_qa.mjs"), { verifyPupilContainment } = await import("../../engine/film/integrity_qa.mjs");
const { rt } = await CF.pupilFilm(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const planWith = (state) => ({ ...JSON.parse(JSON.stringify(CF.PUPIL_SPEC.plan)), composition: { schema_version: "1.0.0", primitives: [{ id: "oda_look", kind: "STATE_SWAP", owner: "oda_rig.gaze", frames: [0, 120], inputs: { from: "centre", events: [{ at: 0, state: "centre" }, ...(state ? [{ at: 40, state }, { at: 80, state: "centre" }] : [])] }, expected_effect: { kind: "STATE_SEQUENCE" } }] } });
const C = (state) => compileMotionTracks(doc.actions, doc.shots, { doc, plan: planWith(state), requireApproval: false }), ALL = [[0, 120]], frames = [...Array(120).keys()];
test("C04 pupil inside the registered eye mask on every frame; a pupil that only a bbox test would accept is refused; an escaped pupil is refused", () => {
  assert.ok(doc.assets.some((a) => a.id === "oda_eye_mask"), "the eye mask is a registered (never drawn) asset");
  const ok = verifyFaceComposition(C(null), "oda_rig", ALL, undefined, { film: rt.film }); assert.equal(ok.ok, true, ok.reason); assert.equal(ok.pupil_containment.max_escaped_px, 0);
  const corner = verifyPupilContainment(C("corner"), rt.film, "oda_rig", frames); assert.equal(corner.ok, false); assert.equal(corner.measurement.bbox_test_would_pass, true, "the corner pupil's box is inside the eye's box"); assert.match(corner.reason, /frame 4\d: \d+ of \d+ opaque pupil pixels .* outside the registered eye mask .*a bbox test would pass/);
  assert.ok(!/frame (\d|[0-3]\d):/.test(corner.reason), "frames before the swap (centred pupil) pass");
  const face = verifyFaceComposition(C("corner"), "oda_rig", ALL, undefined, { film: rt.film }); assert.equal(face.ok, false); assert.match(face.reason, /pupil:/);
  const out = verifyPupilContainment(C("out"), rt.film, "oda_rig", frames); assert.equal(out.ok, false); assert.equal(out.measurement.bbox_test_would_pass, false);
  const noFilm = verifyFaceComposition(C(null), "oda_rig", ALL); assert.equal(noFilm.ok, false); assert.match(noFilm.reason, /pupil containment on the registered art was not evaluated/);
});
