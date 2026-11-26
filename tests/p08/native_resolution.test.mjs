// P08 D03 — native source resolution against the maximum projected coverage on EVERY frame, at the design-approved factor; an upscaled source is
// counted at its native size. Negatives: a camera push that only the MIDDLE frames reach (endpoints pass); art too small for the approved factor;
// the same geometry delivered as a 2× enlargement of a half-size original; no declared factor. DIAGNOSTIC two-biped fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyNativeResolution, effectiveUpscale } = await import("../../engine/art_bridge/native_resolution.mjs"), { readPNG, writeRGBA } = await import("../../engine/art_bridge/png.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, FR = [...Array(61).keys()];
const plan = (zoom = [[0, 1.0]]) => ({ ...CF.basePlan(), cameras: { cam_1: { x: [[0, 820]], y: [[0, 520]], zoom } } });
const run = (p, o = {}) => verifyNativeResolution({ film: o.film ?? rt.film, compiled: compileMotionTracks(doc.actions, doc.shots, { doc, plan: p, requireApproval: false }), doc, plan: p, frames: FR, factor: o.factor ?? 0.8 });
const head = doc.assets.find((a) => a.id === "kade_head");
test("D03 native resolution: every frame at the approved factor; a middle-frame push, too-small art, an upscaled source and a missing factor fail", () => {
  assert.equal(effectiveUpscale(readPNG(path.join(rt.film, head.file)), head.source_pixel_crop).k, 1, "the delivered fixture rasters are native");
  const ok = run(plan()); assert.deepEqual(ok.failures.map((f) => f.human_readable_reason), []); assert.ok(ok.assets.every((a) => a.frames_checked === 61));
  const base = ok.assets.find((a) => a.asset === "kade_head").native_px_per_screen_px, F = base / 1.3; // measured native density at zoom 1; a 1.6× push must drop below base/1.3
  // the camera pushes to 1.6× only around frame 30: endpoints are fine, the middle frames exceed the native detail
  const push = run(plan([[0, 1.0], [30, 1.6, "sine.inOut"], [60, 1.0, "sine.inOut"]]), { factor: F }), f = push.failures.find((x) => x.record_id === "kade_head");
  assert.ok(f, "kade_head under-resolved at the push"); assert.ok(Math.abs(f.frame_range[0] - 30) <= 1, `worst frame is the middle of the push (${f.frame_range})`); assert.ok(!run(plan([[0, 1.0], [60, 1.0]]), { factor: F }).failures.some((x) => x.record_id === "kade_head"), "without the push the head meets the same factor"); assert.ok(push.assets.find((a) => a.asset === "kade_head").frames_checked === 61);
  // too-small art for the approved factor: the needed native size is reported (factor 1.5× the art's own density → 1.5× the pixels needed)
  const two = run(plan(), { factor: base * 1.5 }), h2 = two.failures.find((x) => x.record_id === "kade_head"); assert.ok(h2); const a2 = two.assets.find((a) => a.asset === "kade_head"); assert.ok(Math.abs(a2.needed_source_px[0] / head.source_pixel_crop[2] - 1.5) < 0.02, JSON.stringify(a2));
  // same file size and geometry, but the pixels are a 2× nearest enlargement of a half-size original: counted at half
  const W = isolatedWork("p08_d03"), F2 = path.join(W, "film"); fs.cpSync(rt.film, F2, { recursive: true, filter: (s) => !/[\\/](render|production|qa)([\\/]|$)/.test(s) });
  const src = readPNG(path.join(rt.film, head.file)), out = Buffer.alloc(src.rgba.length); for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) { const sx = (x >> 1) << 1, sy = (y >> 1) << 1; src.rgba.copy(out, (y * src.width + x) * 4, (sy * src.width + sx) * 4, (sy * src.width + sx) * 4 + 4); }
  writeRGBA(path.join(F2, head.file), src.width, src.height, out); assert.equal(effectiveUpscale(readPNG(path.join(F2, head.file)), head.source_pixel_crop).k, 2);
  const upd = run(plan(), { film: F2, factor: base * 0.75 }), u = upd.failures.find((x) => x.record_id === "kade_head"); assert.ok(u, "the enlarged source counts half its pixels: below 0.75 of the native density"); assert.match(u.human_readable_reason, /2× enlargement of a smaller original/);
  const none = verifyNativeResolution({ film: rt.film, compiled: compileMotionTracks(doc.actions, doc.shots, { doc, plan: plan(), requireApproval: false }), doc, plan: plan(), frames: FR }); assert.equal(none.ok, false); assert.equal(none.failures[0].details?.failed_invariant ?? none.failures[0].failed_invariant, "NATIVE_FACTOR_DECLARED");
});
