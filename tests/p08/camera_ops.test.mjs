// P08 E05 — typed camera DOLLY / ORBIT on the shared clock: each depth band gets its own pinhole scale f/(depth − z) (fixed lens), so bands at
// different depths move/scale differently (parallax from depth, not a 2D zoom); an orbit of a 2D world executes only inside approved flat-azimuth
// coverage, otherwise the exact view/depth art is requested. Renderer rows + real Chrome owner pixels. DIAGNOSTIC character fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs"), { cameraMatrix } = await import("../../engine/art_bridge/scene_graph.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const DEPTHS = { FAR: 12, MID: 11, FOCAL: 10, NEAR: 9, FOREGROUND: 8.5 };
const DOLLY = (o = {}) => ({ id: "push_in", kind: "DOLLY", camera_track: "cam_1", frames: [100, 200], x: [[100, 820]], y: [[100, 520]], z: [[100, 0], [199, 4, "sine.inOut"]], focal_px: 10, depths: DEPTHS, ...o });
const compile = (ops, extra = {}) => compileMotionTracks(doc.actions, doc.shots, { doc, plan: { ...CF.basePlan(), camera_ops: ops, ...extra }, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.failed_invariant })); } };
const scaleOf = (M) => Math.hypot(M[0], M[1]);
test("E05-1 DOLLY: renderer camera rows = independent pinhole projection per band; near and far bands scale differently (not a flat zoom); a 2D zoom track is detected as flat", () => {
  const C = compile([DOLLY()]), stage = doc.stage;
  for (const f of [100, 150, 199]) { const cam = stateAtFrame(C, f).camera, z = cam.persp.z; for (const b of ["FAR", "FOCAL"]) { const M = cameraMatrix(cam, b, {}, stage), want = 10 / (DEPTHS[b] - z); assert.ok(Math.abs(scaleOf(M) - want) < 1e-9, `f${f} ${b}: band scale ${scaleOf(M)} = f/(d−z) ${want}`); } }
  const r = (f) => { const cam = stateAtFrame(C, f).camera; return scaleOf(cameraMatrix(cam, "FOCAL", {}, stage)) / scaleOf(cameraMatrix(cam, "FAR", {}, stage)); };
  assert.ok(Math.abs(r(199) / r(100) - 1) > 0.05, `relative FOCAL/FAR scale changes over the dolly (${r(100).toFixed(3)} → ${r(199).toFixed(3)}): depth parallax`);
  const Z = compileMotionTracks(doc.actions, doc.shots, { doc, plan: { ...CF.basePlan(), cameras: { cam_1: { x: [[0, 820]], y: [[0, 520]], zoom: [[100, 1], [199, 1.67, "sine.inOut"]] } }, parallax: {} }, requireApproval: false });
  const rz = (f) => { const cam = stateAtFrame(Z, f).camera; return scaleOf(cameraMatrix(cam, "FOCAL", {}, stage)) / scaleOf(cameraMatrix(cam, "FAR", {}, stage)); }; assert.ok(Math.abs(rz(199) / rz(100) - 1) < 1e-9, "a 2D zoom scales every band equally: it can never stand in for a dolly");
});
test("E05-2 refusals: undeclared depths, missing lens, camera through a band, orbit beyond approved flat coverage (exact art request); approved small orbit executes with parallax", () => {
  assert.ok(codes(() => compile([DOLLY({ depths: {} })])).some((x) => x.inv === "DEPTHS_DECLARED")); assert.ok(codes(() => compile([DOLLY({ focal_px: 0 })])).some((x) => x.inv === "LENS_FIXED"));
  assert.ok(codes(() => compile([DOLLY({ z: [[100, 0], [199, 11]] })])).some((x) => x.inv === "CAMERA_IN_FRONT_OF_BANDS"));
  const ORBIT = (o = {}) => ({ id: "orbit", kind: "ORBIT", camera_track: "cam_1", frames: [100, 200], pivot: [820, 520], pivot_depth: 10, radius: 10, azimuth: [[100, -4], [199, 4, "sine.inOut"]], focal_px: 10, depths: DEPTHS, ...o });
  assert.ok(codes(() => compile([ORBIT()])).some((x) => x.code === "MISSING_ART_ASSET" && x.inv === "ORBIT_VIEW_ART"), "a 2D world orbit without approved view coverage requests the exact art");
  assert.ok(codes(() => compile([ORBIT({ view_art_coverage: { max_flat_azimuth_deg: 2 } })])).some((x) => x.inv === "ORBIT_VIEW_ART"), "coverage smaller than the orbit");
  const C = compile([ORBIT({ view_art_coverage: { max_flat_azimuth_deg: 5, approval: "diagnostic flat billboards" } })]), cx = (f) => stateAtFrame(C, f).camera.x; assert.ok(cx(199) - cx(100) > 1, "the camera moves on its orbit");
  const sh = (f, b) => { const cam = stateAtFrame(C, f).camera, M = cameraMatrix(cam, b, {}, doc.stage); return M[0] * 820 + M[2] * 520 + M[4]; }; assert.notEqual((sh(199, "FAR") - sh(100, "FAR")).toFixed(3), (sh(199, "FOCAL") - sh(100, "FOCAL")).toFixed(3), "bands at different depths shift differently (parallax)");
});
test("E05-3 real Chrome owner pixels: the focal-band actor grows by exactly its band's pinhole factor over the dolly", async () => {
  const browser = await launch(), out = isolatedWork("p08_dolly_render");
  try { const C = compile([DOLLY()]), scene = composeShot(doc.shots[0], reg, C, { prefix: "dolly-" }), comp = buildComposition(path.join(out, "comp"), { id: "dolly", scene, frameRange: [100, 200], registry: reg }), cap = await capture(comp, FILM, [100, 199], path.join(out, "frames"), { id: "dolly", browser }), [A, B] = cap.files.map(readPNG);
    const box = (png, c) => { let x0 = 1e9, x1 = -1; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= 3 && Math.abs(png.rgba[i + 1] - c[1]) <= 3 && Math.abs(png.rgba[i + 2] - c[2]) <= 3) { const x = (i / 4) % png.width; x0 = Math.min(x0, x); x1 = Math.max(x1, x); } return x1 - x0; };
    const w0 = box(A, CF.COL["kade:torso"]), w1 = box(B, CF.COL["kade:torso"]), want = (10 / (10 - 4)) / (10 / 10), got = w1 / w0;
    assert.ok(w0 > 20 && Math.abs(got - want) < 0.06, `torso pixel width grows ×${got.toFixed(3)} (pinhole FOCAL factor ×${want.toFixed(3)})`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, torso_width_px: [w0, w1], measured_factor: got, expected_factor: want }, null, 1));
  } finally { await browser.close(); }
});
