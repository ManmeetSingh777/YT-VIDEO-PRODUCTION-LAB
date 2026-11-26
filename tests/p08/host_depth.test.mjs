// P08 E04 — per-pixel host depth/matte compositing with real Blender 5.1 (headless Cycles): Blender's metric Z pass (planar camera depth, world
// units — verified against the engine's camera depth at every contact) splits each host frame into slices painted at their depth among the declared
// 2D band depths. The DIAGNOSTIC capsule walks from BEHIND the painted counter's depth to IN FRONT of it; at a middle frame the same body is split
// per pixel. Judged on final Chrome pixels against the depths. Negatives: host always in front (band-level), wrong declared depth order, missing and
// stale depth passes, a halo/premultiplied slice edge, depth in other units, a diagnostic stand-in in PRODUCTION. DIAGNOSTIC only (not the host).
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import zlib from "node:zlib";
import { renderHostPasses, compileHostPasses, verifyDepthComposite, orthoProject, cameraDepth, readDepth, readPng, BLENDER } from "../../engine/host3d/host_pass.mjs";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
import { loadScene, renderFrames, FIX } from "../art_bridge/stage2_lib.mjs";
import { launch } from "../../engine/art_bridge/render.mjs";
const { isolatedWork } = await import("../_lib/isolated_work.mjs");
const clone = (o) => JSON.parse(JSON.stringify(o)), RES = [1920, 1080], CAMERA = { type: "ORTHO", location: [0, -10, 3.68], rotation_euler_deg: [75, 0, 0], ortho_scale: 6 }, COUNTER = [900, 790, 220, 290];
const W = isolatedWork("p08_e04", { under: path.join(FIX, "_tmp") }), relW = path.relative(FIX, W).split(path.sep).join("/"), D = (y) => +cameraDepth(CAMERA, [0, y, 0.7]).toFixed(4);
const BD = { FAR: D(3), MID: D(2.5), FOCAL: D(2), NEAR: D(0.1), FOREGROUND: D(0) }; // the painted counter stands on the y = 0 plane
const contract = (over = {}) => ({ host_id: "diag_host", provenance: "DIAGNOSTIC_FIXTURE", blend_sha256: null, approval_receipt_id: null, shot_id: "shotD1", band: "FOCAL", film_frames: [600, 1200], blender_frame_offset: 599,
  resolution: RES, camera: clone(CAMERA), ground: { z: 0 }, host_object: "DIAG_HOST", contact_points: [{ id: "sole", object: "DIAG_FOOT" }], diagnostic_path: [[0, 0.6], [0, -1.5]], depth_composite: { band_depths: { ...BD } },
  calibration_landmarks: [[-2, 0, 0], [2, 0, 0], [0, 2, 0]].map((w, i) => ({ id: `floor_${i}`, world: w, plate_px: orthoProject(CAMERA, RES, w).map((v) => +v.toFixed(2)), plate_asset: "room_far" })), ...over });
function png(name, Wd, Hd, fill) { const px = new Uint8Array(Wd * Hd * 4); for (let y = 0; y < Hd; y++) for (let x = 0; x < Wd; x++) px.set(fill(x, y), (y * Wd + x) * 4); const f = path.join(W, name); writeRGBA(f, Wd, Hd, px); return { file: `${relW}/${name}`, sha256: crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), W: Wd, H: Hd }; }
function roomScene() { const wallY = orthoProject(CAMERA, RES, [0, 2, 0])[1], marks = contract().calibration_landmarks.map((l) => l.plate_px);
  const far = png("room_far.png", 1920, 1080, (x, y) => marks.some(([mx, my]) => Math.hypot(x - mx, y - my) < 5) ? [30, 30, 40, 255] : y < wallY ? [214, 190, 160, 255] : [150, 120, 95, 255]), ctr = png("counter.png", COUNTER[2] + 2, COUNTER[3], (x) => (x === 0 || x === COUNTER[2] + 1 ? [0, 0, 0, 0] : [70, 90, 140, 255]));
  const M = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_D.manifest.json"), "utf8")), base = M.assets.find((a) => a.id === "vista_far");
  const plate = { ...clone(base), id: "room_far", file: far.file, sha256: far.sha256, width_px: 1920, height_px: 1080, canonical_rect: [0, 0, 1920, 1080], source_pixel_crop: [0, 0, 1920, 1080], pivot_xy: [960, 540] };
  const occ = { ...clone(M.assets.find((a) => a.id === "vista_fg")), id: "counter", file: ctr.file, sha256: ctr.sha256, width_px: ctr.W, height_px: ctr.H, canonical_rect: [COUNTER[0] - 1, COUNTER[1], ctr.W, ctr.H], source_pixel_crop: [0, 0, ctr.W, ctr.H], pivot_xy: [COUNTER[0] + COUNTER[2] / 2, COUNTER[1] + COUNTER[3] / 2] };
  M.assets = [plate, occ]; M.identities[0] = { ...M.identities[0], canonical_asset_id: "room_far", master_sha256: far.sha256 };
  M.worlds = [{ id: "room", identity_id: M.identities[0].id, depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["room_far"] }, { id: "fg", depth_band: "FOREGROUND", asset_ids: ["counter"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [0, 0, 1920, 1080] }];
  M.shots = M.shots.map((s) => ({ ...s, world_id: "room", continuity_to: null })); M.transitions = []; M.actions = M.actions.filter((a) => a.id === "camera_move");
  return { M, P: { id: "planE04", placements: {}, tracks: {}, parallax: { FAR: 1, MID: 1, FOCAL: 1, NEAR: 1, FOREGROUND: 1 }, cameras: { camD: {}, camD2: {} } } }; }
const inCounter = (x, y) => x >= COUNTER[0] + 1 && x < COUNTER[0] + COUNTER[2] - 1 && y >= COUNTER[1] + 1, LAYERS = [{ id: "counter", depth: BD.FOREGROUND, covers: inCounter }, { id: "room_far", depth: BD.FAR, covers: () => true }];
const haveBlender = fs.existsSync(BLENDER), FR = [600, 771, 1199];
test("E04 per-pixel host depth: behind the painted counter, split at the crossing, in front after; every negative fails on pixels or at compile", { skip: haveBlender ? false : `Blender not found at ${BLENDER}`, timeout: 1800000 }, async () => {
  const passes = path.join(W, "host_passes"); renderHostPasses({ contract: contract(), frames: FR, outDir: passes, samples: 8 });
  const H = compileHostPasses({ contract: contract(), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.deepEqual(H.errors.map((e) => e.human_readable_reason || e.message), []); assert.ok(H.report.depth.contacts.every((k) => Math.abs(k.blender_depth - k.engine_depth) < 0.05), JSON.stringify(H.report.depth.contacts));
  // (the camera looks down 15°: higher points of the same body are nearer the camera, so one frame may span several positions — judged per pixel below)
  assert.ok(!H.entry.frames[600].slices.AFTER_FOREGROUND, "nothing in front of the counter's depth at 600"); assert.deepEqual(Object.keys(H.entry.frames[1199].slices), ["AFTER_FOREGROUND"], "fully in front at 1199");
  assert.ok(H.entry.frames[771].slices.AFTER_FOREGROUND && Object.keys(H.entry.frames[771].slices).some((p) => p !== "AFTER_FOREGROUND"), "the crossing frame is split PER PIXEL across the counter's depth");
  const pass = (f) => readPng(path.join(passes, `host_${String(f).padStart(6, "0")}.png`)), Z = (f) => readDepth(path.join(passes, `depth_${String(f).padStart(6, "0")}.f32.gz`));
  const browser = await launch(); let A, N, Fwd, Bad, Halo;
  try { const shoot = async (tag, entry) => { const S0 = roomScene(), P = clone(S0.P); if (entry) P.host_passes = { diag_host: entry }; const S = await loadScene("D", { manifestOverride: S0.M, planOverride: P }); return (await renderFrames(S, 0, FR, tag, { browser })).files.map(readPng); };
    A = await shoot("e04_depth", H.entry); N = await shoot("e04_none", null);
    // NEGATIVE: band-level "host always in front" (every pixel in the front slice)
    const front = clone(H.entry); front.depth_composite.positions = ["AFTER_FOREGROUND"]; for (const f of FR) front.frames[f].slices = { AFTER_FOREGROUND: front.frames[f].host }; Fwd = await shoot("e04_front", front);
    // NEGATIVE: the declared depths put the counter BEHIND the host (wrong depth order): compiled consistently, refused against the true depths
    const wrong = compileHostPasses({ contract: contract({ depth_composite: { band_depths: { FAR: BD.FAR + 2, MID: BD.FAR + 1.5, FOCAL: BD.FAR + 1, NEAR: BD.FAR + 0.5, FOREGROUND: BD.FAR } } }), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false }); Bad = await shoot("e04_wrong", wrong.entry);
    // NEGATIVE: a slice written with half alpha (a premultiplied / haloed edge)
    const hf = path.join(passes, H.entry.frames[1199].slices.AFTER_FOREGROUND), hp = readPng(hf), hr = Buffer.from(hp.rgba); for (let i = 3; i < hr.length; i += 4) if (hr[i]) hr[i] = 128; const hfile = "slice_halo_001199.png"; writeRGBA(path.join(passes, hfile), hp.width, hp.height, hr);
    const halo = clone(H.entry); halo.frames[1199].slices.AFTER_FOREGROUND = hfile; Halo = await shoot("e04_halo", halo);
  } finally { await browser.close(); }
  const V = FR.map((f, i) => verifyDepthComposite({ frame: f, final: A[i], noHost: N[i], hostPass: pass(f), depth: Z(f), layers: LAYERS }));
  for (const v of V) assert.ok(v.ok, JSON.stringify({ frame: v.frame, f: v.failures.map((x) => x.human_readable_reason), v: [v.visible_px, v.visible_ok, v.hidden_px, v.hidden_ok, v.halo_px] }));
  assert.ok(V[0].hidden_px > 300 && V[2].hidden_px === 0 && V[2].visible_px > 300, "behind the counter at 600 (hidden pixels), nothing hidden in front at 1199"); assert.ok(V[1].hidden_px > 50 && V[1].visible_px > 50, "both at the crossing");
  const inv = (v) => v.failures.map((x) => x.details?.failed_invariant);
  assert.ok(inv(verifyDepthComposite({ frame: 600, final: Fwd[0], noHost: N[0], hostPass: pass(600), depth: Z(600), layers: LAYERS })).includes("HOST_DEPTH_BEHIND_HIDDEN"), "host always in front is refused");
  assert.ok(inv(verifyDepthComposite({ frame: 600, final: Bad[0], noHost: N[0], hostPass: pass(600), depth: Z(600), layers: LAYERS })).includes("HOST_DEPTH_BEHIND_HIDDEN"), "wrong declared depth order is refused on pixels");
  assert.ok(verifyDepthComposite({ frame: 1199, final: Halo[2], noHost: N[2], hostPass: pass(1199), depth: Z(1199), layers: LAYERS }).failures.length > 0, "a half-alpha slice edge (halo) is refused");
  // compile-time negatives: missing depth, stale depth bytes, depth in other units, a diagnostic stand-in in PRODUCTION, band depths not ordered
  const P0 = fs.readFileSync(path.join(passes, "PASSES.json"), "utf8"), withP = (mut, c = contract(), rt = "DIAGNOSTIC") => { const q = JSON.parse(P0); mut(q); fs.writeFileSync(path.join(passes, "PASSES.json"), JSON.stringify(q)); try { return compileHostPasses({ contract: c, passesDir: passes, assetRoot: FIX, runType: rt, requireAllFrames: false }).errors.map((e) => e.details?.failed_invariant ?? e.code); } finally { fs.writeFileSync(path.join(passes, "PASSES.json"), P0); } };
  assert.ok(withP((q) => { delete q.frames[0].depth; }).includes("HOST_DEPTH_PRESENT"));
  const df = path.join(passes, "depth_000600.f32.gz"), d0 = fs.readFileSync(df); fs.writeFileSync(df, Buffer.concat([d0, Buffer.from([0])])); assert.ok(withP(() => {}).includes("HOST_PASS_HASH"), "stale depth bytes"); fs.writeFileSync(df, d0);
  const z2 = Buffer.from(readDepth(df).map((v) => (v < 1e9 ? v * 2 : v)).buffer), f2 = "depth_x2_000600.f32.gz"; fs.writeFileSync(path.join(passes, f2), zlib.gzipSync(z2));
  assert.ok(withP((q) => { q.frames[0].depth = { ...q.frames[0].depth, file: f2, sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(passes, f2))).digest("hex") }; }).includes("HOST_DEPTH_UNITS"), "depth in other units");
  assert.ok(withP(() => {}, contract(), "PRODUCTION").includes("HOST_ASSET_APPROVED"), "a diagnostic stand-in never composites into PRODUCTION");
  assert.ok(withP(() => {}, contract({ depth_composite: { band_depths: { ...BD, NEAR: BD.FOCAL + 1 } } })).includes("HOST_BAND_DEPTHS"));
});
