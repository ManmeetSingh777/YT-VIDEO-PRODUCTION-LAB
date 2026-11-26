// P08 E03 — calibrated PERSPECTIVE host camera through real Blender 5.1 (headless Cycles). The engine's own pinhole K[R|t] projection of the host's
// contact point must agree with the projection Blender reports for the camera it actually used; a contract with a different focal length or pose
// is refused at the calibration gate; a point behind the camera is refused. DIAGNOSTIC capsule host (never the approved host design).
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs";
import { renderHostPasses, compileHostPasses, projectCamera, BLENDER } from "../../engine/host3d/host_pass.mjs";
import { FIX } from "../art_bridge/stage2_lib.mjs"; import path from "node:path";
const { isolatedWork } = await import("../_lib/isolated_work.mjs");
const clone = (o) => JSON.parse(JSON.stringify(o)), RES = [1920, 1080], PERSP = { type: "PERSP", location: [0, -9, 2.4], rotation_euler_deg: [78, 0, 0], lens_mm: 35, sensor_width_mm: 36 };
const contract = (over = {}) => ({ host_id: "diag_host", provenance: "DIAGNOSTIC_FIXTURE", blend_sha256: null, approval_receipt_id: null, shot_id: "shotD1", band: "FOCAL", film_frames: [600, 1200], blender_frame_offset: 599,
  resolution: RES, camera: clone(PERSP), ground: { z: 0 }, host_object: "DIAG_HOST", contact_points: [{ id: "sole", object: "DIAG_FOOT" }],
  calibration_landmarks: [[-2, 0, 0], [2, 0, 0], [0, 2, 0]].map((w, i) => ({ id: `floor_${i}`, world: w, plate_px: projectCamera(PERSP, RES, w).map((v) => +v.toFixed(2)), plate_asset: "room_far" })), ...over });
const haveBlender = fs.existsSync(BLENDER);
test("E03 perspective host: engine K[R|t] projection = Blender's projection of the contact; wrong lens / moved camera refused; behind-camera refused", { skip: haveBlender ? false : `Blender not found at ${BLENDER}` }, () => {
  const passes = isolatedWork("p08_host_persp", { under: path.join(FIX, "_tmp") }); renderHostPasses({ contract: { ...contract(), diagnostic_fixture: true }, frames: [600], outDir: passes, samples: 4 });
  const P = JSON.parse(fs.readFileSync(`${passes}/PASSES.json`, "utf8")); assert.equal(P.camera_used.type, "PERSP"); assert.equal(P.camera_used.lens_mm, 35);
  const H = compileHostPasses({ contract: contract(), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.deepEqual(H.errors.map((e) => e.human_readable_reason || e.message), []); assert.ok(H.report.contacts.every((k) => k.agree_px < 0.05), `engine vs Blender contact projection: ${JSON.stringify(H.report.contacts.map((k) => k.agree_px))}`);
  const outside = isolatedWork("p08_host_persp_outside"); fs.cpSync(passes, outside, { recursive: true }); // OS temp: another directory tree (another drive on the regression host)
  assert.ok(compileHostPasses({ contract: contract(), passesDir: outside, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false }).errors.some((e) => /under the film asset root/.test(e.human_readable_reason || e.message)), "passes outside the asset root are refused, also across drives");
  const wrongLens = compileHostPasses({ contract: contract({ camera: { ...clone(PERSP), lens_mm: 50 } }), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.ok(wrongLens.errors.some((e) => e.code === "HOST_INTEGRATION_INVALID"), "a contract with another focal length than the camera Blender used is refused");
  const moved = compileHostPasses({ contract: contract({ camera: { ...clone(PERSP), location: [0.3, -9, 2.4] } }), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.ok(moved.errors.length > 0, "a moved camera no longer projects the contact where Blender drew it");
  assert.throws(() => projectCamera(PERSP, RES, [0, -12, 2.4]), (e) => e.details?.failed_invariant === "POINT_IN_FRONT_OF_CAMERA"); assert.throws(() => projectCamera({ ...PERSP, lens_mm: 0 }, RES, [0, 0, 0]), (e) => e.details?.failed_invariant === "HOST_CAMERA_INTRINSICS");
});
