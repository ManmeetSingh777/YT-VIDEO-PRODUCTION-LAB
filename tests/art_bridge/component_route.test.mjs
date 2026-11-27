// High-resolution component route: crop planned from the registered master's landmarks, byte-exact crop, delivered span checked natively, an
// upscaled crop refused; the contract switches to the crop route only once the master is registered; deterministic TYPE/MASK need no image.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto";
import { componentCropPlan, cropExact, nativeDetailRatio, nativeDetailThreshold, verifyComponentNative, derivationRoute, typeArtwork } from "../../engine/art_bridge/component_route.mjs";
import { resolutionContract } from "../../engine/art_bridge/resolution_contract.mjs"; import { readPNG, writeRGBA } from "../../engine/art_bridge/png.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), T = () => fs.mkdtempSync(path.join(os.tmpdir(), "cr-"));
const img = (w, h, f) => { const rgba = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const [r, g, b, a] = f(x, y); rgba.set([r, g, b, a], (y * w + x) * 4); } return { width: w, height: h, rgba }; };
const fine = (x, y) => [((x * 37) ^ (y * 53)) & 255, (x * y) & 255, (x + 3 * y) & 255, 255]; // dense pixel-level detail
const master = img(400, 600, (x, y) => (x > 100 && x < 300 && y > 40 && y < 560 ? fine(x, y) : [0, 0, 0, 0]));
const LM = { head_top: [200, 60], chin: [200, 250], eye_near: [170, 150], mouth_center: [200, 210], neck: [200, 280] };
const req = { component: "M.head", measure: "head_height_px", min_native_px: 540 };

test("CR-1 the crop is planned from the registered landmarks; the best canvas carries the minimum; an impossible minimum is refused with its numbers", () => {
  const p = componentCropPlan({ masterPng: master, landmarks: LM, componentLandmarks: ["eye_near", "mouth_center"], requirement: req, canvases: ["1024x1024", "1254x1254", "1024x1536", "1536x1024"] });
  assert.equal(p.master_span_px, 190); assert.ok(p.feasible, p.reason); assert.ok(p.expected_delivered_span_px >= 540); assert.ok(p.crop_box[2] < 400 && p.crop_box[3] < 600, "a crop, not the whole master");
  assert.ok(p.landmarks_in_crop.head_top && p.landmarks_in_crop.chin);
  const no = componentCropPlan({ masterPng: master, landmarks: LM, componentLandmarks: ["neck"], requirement: { ...req, min_native_px: 5000 }, canvases: ["1024x1024"] }); assert.equal(no.feasible, false); assert.match(no.reason, /< 5000 px/);
});
test("CR-2 the crop is the master's own bytes: no resampling", () => {
  const d = T(), c = cropExact(master, [120, 50, 100, 80], path.join(d, "c.png")), back = readPNG(c.file);
  assert.deepEqual(c.size, [100, 80]); for (let y = 0; y < 80; y++) for (let x = 0; x < 100; x++) for (let k = 0; k < 4; k++) assert.equal(back.rgba[(y * 100 + x) * 4 + k], master.rgba[((50 + y) * 400 + 120 + x) * 4 + k]);
});
test("CR-3 a native redraw passes; a smooth enlargement of the crop is refused; a short span is refused", () => {
  const f = 3, src = img(120, 120, fine), up = img(360, 360, (x, y) => { const sx = Math.min(119, x / f), sy = Math.min(119, y / f), x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(119, x0 + 1), y1 = Math.min(119, y0 + 1), ax = sx - x0, ay = sy - y0, P = (xx, yy, k) => src.rgba[(yy * 120 + xx) * 4 + k];
    return [0, 1, 2].map((k) => Math.round((1 - ay) * ((1 - ax) * P(x0, y0, k) + ax * P(x1, y0, k)) + ay * ((1 - ax) * P(x0, y1, k) + ax * P(x1, y1, k)))).concat(255); });
  const native = img(360, 360, fine), th = nativeDetailThreshold(f); assert.ok(nativeDetailRatio(native, f) > th, String(nativeDetailRatio(native, f))); assert.ok(nativeDetailRatio(up, f) < th, String(nativeDetailRatio(up, f)));
  // flat vector-style art: a disc drawn natively vs the same disc drawn at master density and enlarged
  const disc = (W, r) => img(W, W, (x, y) => ((x - W / 2) ** 2 + (y - W / 2) ** 2 < r * r ? [230, 120, 60, 255] : [40, 60, 90, 255])), small = disc(120, 40);
  const enl = img(360, 360, (x, y) => { const sx = Math.min(119, x / f), sy = Math.min(119, y / f), x0 = Math.floor(sx), y0 = Math.floor(sy), x1 = Math.min(119, x0 + 1), y1 = Math.min(119, y0 + 1), ax = sx - x0, ay = sy - y0, P = (xx, yy, k) => small.rgba[(yy * 120 + xx) * 4 + k]; return [0, 1, 2].map((k) => Math.round((1 - ay) * ((1 - ax) * P(x0, y0, k) + ax * P(x1, y0, k)) + ay * ((1 - ax) * P(x0, y1, k) + ax * P(x1, y1, k)))).concat(255); });
  assert.ok(nativeDetailRatio(disc(360, 120), f) > th, "a native flat shape"); assert.ok(nativeDetailRatio(enl, f) < th, "an enlarged flat shape");
  const lm = { head_top: [180, 10], chin: [180, 600] }, big = img(360, 640, fine);
  assert.equal(verifyComponentNative({ deliveredPng: big, deliveredLandmarks: lm, requirement: req, scaleFromMaster: f }).ok, true);
  const u = verifyComponentNative({ deliveredPng: up, deliveredLandmarks: { head_top: [180, 0], chin: [180, 359] }, requirement: { ...req, min_native_px: 300 }, scaleFromMaster: f }); assert.equal(u.ok, false); assert.match(u.problems.join(), /upscale/);
  const s = verifyComponentNative({ deliveredPng: big, deliveredLandmarks: { head_top: [180, 10], chin: [180, 300] }, requirement: req, scaleFromMaster: f }); assert.match(s.problems.join(), /290 px < 540 px/);
});
test("CR-4 the contract refuses a component until its master is registered, then routes it to the exact crop of the approved bytes", () => {
  const F = T(); fs.mkdirSync(path.join(F, "handoff")); fs.mkdirSync(path.join(F, "resolution")); fs.mkdirSync(path.join(F, "art"), { recursive: true });
  const mf = path.join(F, "art", "M.png"); writeRGBA(mf, master.width, master.height, master.rgba); const ms = sha(fs.readFileSync(mf));
  fs.writeFileSync(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify({ assets: [{ id: "M", file: "art/M.png", sha256: ms }] }));
  fs.writeFileSync(path.join(F, "SRC.md"), "head >= 540"); fs.writeFileSync(path.join(F, "resolution", "NATIVE_RESOLUTION_REQUIREMENTS.json"), JSON.stringify({ requirements: [{ identity_asset: "M", ...req, basis: "t", source: { file: "SRC.md", sha256: sha(fs.readFileSync(path.join(F, "SRC.md"))) } }] }));
  const job = { artjob_id: "J_HEAD", root_dependency: "M.head", derived_from: "M", motion_context: { required_continuity_landmarks: ["eye_near", "mouth_center"] } }, design = { output: { authored_width_px: 2048, authored_height_px: 2048, figure_height_px: 1600 } }, jobs = [{ root_dependency: "M" }, { root_dependency: "M.head", derived_from: "M" }];
  assert.throws(() => resolutionContract({ job, design, film: F, jobs, env: {} }), (e) => e.code === "COMPONENT_NATIVE_RESOLUTION_UNVERIFIED" && /not registered yet/.test(e.human_readable_reason));
  fs.mkdirSync(path.join(F, "registration", "M"), { recursive: true }); fs.writeFileSync(path.join(F, "registration", "M", "MASTER_REGISTRATION_RECEIPT.json"), JSON.stringify({ source: { sha256: ms }, landmark_sidecar: { landmarks: LM } }));
  const c = resolutionContract({ job, design, film: F, jobs, env: {} }); assert.equal(c.route, "SOURCE_ATTACHED_COMPONENT_CROP"); assert.equal(c.component_crop.master_sha256, ms); assert.ok(c.component_crop.expected_delivered_span_px >= 540);
  fs.writeFileSync(path.join(F, "registration", "M", "MASTER_REGISTRATION_RECEIPT.json"), JSON.stringify({ source: { sha256: "0".repeat(64) }, landmark_sidecar: { landmarks: LM } }));
  assert.throws(() => resolutionContract({ job, design, film: F, jobs, env: {} }), /does not measure the current master bytes/);
});
test("CR-5 deterministic routes: TYPE is live vector text with the exact copy; MASK derives from registered alpha; painted states still need an edit", () => {
  const t = typeArtwork({ lines: ["YESTERDAY", "Sales $3,210", "Operating result −$120", "LOSS"], box: [0, 0, 1200, 800] });
  for (const l of ["YESTERDAY", "Sales $3,210", "Operating result −$120", "LOSS"]) assert.ok(t.svg.includes(`>${l}</text>`)); assert.ok(!/<image/.test(t.svg), "no raster glyphs"); assert.ok(t.landmarks.type_top && t.landmarks.center);
  assert.throws(() => typeArtwork({ lines: [] }));
  assert.equal(derivationRoute({ asset_kind: "TYPE" }).generates_image, false); assert.equal(derivationRoute({ asset_kind: "MASK" }).generates_image, false);
  for (const k of ["CEL", "UNDERPAINT", "WORLD_PLANE", "PART"]) assert.equal(derivationRoute({ asset_kind: k }).generates_image, true);
});
test("CR-6 a requirement may name its own landmarks and a vertical span (cranium_top → chin, upright pose)", async () => {
  const { measureSpan } = await import("../../engine/art_bridge/component_route.mjs"), lm = { cranium_top: [100, 40], chin: [160, 240] };
  assert.equal(measureSpan({ png: master, landmarks: lm, measure: "head_height_px", from: "cranium_top", to: "chin", span: "vertical" }), 200);
  assert.ok(Math.abs(measureSpan({ png: master, landmarks: lm, measure: "head_height_px", from: "cranium_top", to: "chin" }) - Math.hypot(60, 200)) < 1e-9);
  const p = componentCropPlan({ masterPng: master, landmarks: { ...LM, ...lm }, componentLandmarks: [], requirement: { ...req, from_landmark: "cranium_top", to_landmark: "chin", span: "vertical" }, canvases: ["1024x1536"] }); assert.equal(p.master_span_px, 200);
});
