// TBO-G14 host-pass adapter v1: real Blender 5.1 renders (headless, Cycles) composited inside the Neutrino/Chrome compositor between depth
// bands. EVERYTHING here is DIAGNOSTIC: the "host" is a labelled capsule (not a host design), the room plate and counter are flat diagnostic
// paintings. It proves calibration, frame mapping, pass integrity, occlusion, shadow and contact mechanics only — not the approved host.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { renderHostPasses, compileHostPasses, verifyHostComposite, orthoProject, readPng, BLENDER } from "../../engine/host3d/host_pass.mjs";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
import { loadScene, renderFrames, FIX } from "../art_bridge/stage2_lib.mjs";
import { launch } from "../../engine/art_bridge/render.mjs";

const clone = (o) => JSON.parse(JSON.stringify(o)), TMP = path.join(FIX, "_tmp", "tbo"), RES = [1920, 1080];
const CAMERA = { type: "ORTHO", location: [0, -10, 3.68], rotation_euler_deg: [75, 0, 0], ortho_scale: 6 };
const COUNTER = [900, 790, 220, 290]; // x, y, w, h (FOREGROUND occluder rectangle in screen/world px)
const contract = (over = {}) => ({ host_id: "diag_host", provenance: "DIAGNOSTIC_FIXTURE", blend_sha256: null, approval_receipt_id: null, shot_id: "shotD1", band: "FOCAL", film_frames: [600, 1200], blender_frame_offset: 599,
  resolution: RES, camera: clone(CAMERA), ground: { z: 0 }, host_object: "DIAG_HOST", contact_points: [{ id: "sole", object: "DIAG_FOOT" }],
  calibration_landmarks: [[-2, 0, 0], [2, 0, 0], [0, 2, 0]].map((w, i) => ({ id: `floor_${i}`, world: w, plate_px: orthoProject(CAMERA, RES, w).map((v) => +v.toFixed(2)), plate_asset: "room_far" })), ...over });

function png(name, W, H, fill) { const px = new Uint8Array(W * H * 4); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px.set(fill(x, y), (y * W + x) * 4); const f = path.join(TMP, name); fs.mkdirSync(TMP, { recursive: true }); writeRGBA(f, W, H, px); return { file: `_tmp/tbo/${name}`, sha256: crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), W, H }; }
function roomScene({ withCounter = true } = {}) {
  const wallY = orthoProject(CAMERA, RES, [0, 2, 0])[1], marks = contract().calibration_landmarks.map((l) => l.plate_px);
  const far = png("room_far.png", 1920, 1080, (x, y) => marks.some(([mx, my]) => Math.hypot(x - mx, y - my) < 5) ? [30, 30, 40, 255] : y < wallY ? [214, 190, 160, 255] : [150, 120, 95, 255]);
  const ctr = png("counter.png", COUNTER[2] + 2, COUNTER[3], (x) => (x === 0 || x === COUNTER[2] + 1 ? [0, 0, 0, 0] : [70, 90, 140, 255]));
  const M = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_D.manifest.json"), "utf8")), base = M.assets.find((a) => a.id === "vista_far");
  const plate = { ...clone(base), id: "room_far", file: far.file, sha256: far.sha256, width_px: 1920, height_px: 1080, canonical_rect: [0, 0, 1920, 1080], source_pixel_crop: [0, 0, 1920, 1080], pivot_xy: [960, 540] };
  const occ = { ...clone(M.assets.find((a) => a.id === "vista_fg")), id: "counter", file: ctr.file, sha256: ctr.sha256, width_px: ctr.W, height_px: ctr.H, canonical_rect: [COUNTER[0] - 1, COUNTER[1], ctr.W, ctr.H], source_pixel_crop: [0, 0, ctr.W, ctr.H], pivot_xy: [COUNTER[0] + COUNTER[2] / 2, COUNTER[1] + COUNTER[3] / 2] };
  M.assets = [plate, occ]; M.identities[0] = { ...M.identities[0], canonical_asset_id: "room_far", master_sha256: far.sha256 };
  M.worlds = [{ id: "room", identity_id: M.identities[0].id, depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["room_far"] }, ...(withCounter ? [{ id: "fg", depth_band: "FOREGROUND", asset_ids: ["counter"] }] : [])], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [0, 0, 1920, 1080] }];
  M.shots = M.shots.map((s) => ({ ...s, world_id: "room", continuity_to: null })); M.transitions = []; M.actions = M.actions.filter((a) => a.id === "camera_move");
  const P = { id: "planH", placements: {}, tracks: {}, parallax: { FAR: 1, MID: 1, FOCAL: 1, NEAR: 1, FOREGROUND: 1 }, cameras: { camD: {}, camD2: {} } };
  return { M, P };
}
const occluded = (x, y) => x >= COUNTER[0] + 1 && x < COUNTER[0] + COUNTER[2] - 1 && y >= COUNTER[1] + 1;

test("TBO-G14 host pass: Blender passes composited between 2D bands, verified on pixels; negatives caught", { skip: !fs.existsSync(BLENDER) && "Blender not installed" }, async () => {
  const passes = path.join(TMP, "host_passes"); fs.rmSync(passes, { recursive: true, force: true });
  const frames = [600, 900]; renderHostPasses({ contract: contract(), frames, outDir: passes, samples: 8 });
  const H = compileHostPasses({ contract: contract(), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.deepEqual(H.errors.map((e) => e.human_readable_reason || e.message), []);
  assert.ok(H.report.calibration.every((k) => k.error_px <= 0.01) && H.report.contacts.every((k) => k.agree_px < 0.01 && k.on_ground < 1e-6), JSON.stringify(H.report));
  const browser = await launch();
  try {
    const shoot = async (tag, { withCounter = true, entry = H.entry } = {}) => { const S0 = roomScene({ withCounter }), P = clone(S0.P); if (entry) P.host_passes = { diag_host: entry };
      const S = await loadScene("D", { manifestOverride: S0.M, planOverride: P }); return { S, files: (await renderFrames(S, 0, frames, tag, { browser })).files.map(readPng) }; };
    const A = await shoot("tbo_host_a"), N = await shoot("tbo_host_none", { entry: null });
    const pass = (f, k) => readPng(path.join(passes, `${k}_${String(f).padStart(6, "0")}.png`)), contactAt = (f) => H.report.contacts.find((c) => c.frame === f).px;
    const V = frames.map((f, i) => verifyHostComposite({ frame: f, final: A.files[i], noHost: N.files[i], hostPass: pass(f, "host"), shadowPass: pass(f, "shadow"), occluded, contactPx: contactAt(f) }));
    for (const v of V) assert.ok(v.ok, JSON.stringify({ frame: v.frame, f: v.failures.map((x) => x.human_readable_reason || x.message), v: [v.visible_px, v.visible_ok, v.hidden_px, v.hidden_ok, v.shadow_px, v.shadow_dark, v.lowest_host_px, v.contact_px] }));
    assert.ok(V[1].hidden_px > 500, "at frame 900 the host walks behind the counter: its lower body must be occluded");
    // NEGATIVE: the foreground occluder is missing → host pixels appear where the counter should hide them
    const noCtr = await shoot("tbo_host_noctr", { withCounter: false }), nc = verifyHostComposite({ frame: 900, final: noCtr.files[1], noHost: N.files[1], hostPass: pass(900, "host"), shadowPass: pass(900, "shadow"), occluded, contactPx: contactAt(900) });
    assert.ok(nc.failures.some((x) => x.details?.failed_invariant === "HOST_OCCLUDED_BY_FOREGROUND"));
    // NEGATIVE: the shadow pass is dropped from the composite → ungrounded host
    const blank = png("blank_shadow.png", 1920, 1080, () => [0, 0, 0, 0]); fs.copyFileSync(path.join(FIX, blank.file), path.join(passes, "blank_shadow.png"));
    const noSh = clone(H.entry); for (const k of Object.keys(noSh.frames)) noSh.frames[k].shadow = "blank_shadow.png";
    const ns = await shoot("tbo_host_noshadow", { entry: noSh }), nsv = verifyHostComposite({ frame: 600, final: ns.files[0], noHost: N.files[0], hostPass: pass(600, "host"), shadowPass: pass(600, "shadow"), occluded, contactPx: contactAt(600) });
    assert.ok(nsv.failures.some((x) => x.details?.failed_invariant === "HOST_SHADOW_COMPOSITED"));
  } finally { await browser.close(); }
  // NEGATIVE: contract camera shifted 0.1 world units (32 px) → Blender's camera and the painted floor landmarks no longer match
  const shifted = contract({ camera: { ...clone(CAMERA), location: [0.1, -10, 3.68] } }), sh = compileHostPasses({ contract: shifted, passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false });
  assert.ok(sh.errors.some((e) => e.details?.failed_invariant === "HOST_CAMERA_MATCHED")); assert.ok(sh.errors.some((e) => e.details?.failed_invariant === "HOST_WORLD_CALIBRATED"));
  // NEGATIVE: a diagnostic stand-in in a PRODUCTION film → HOST_3D_ASSET_PENDING; incomplete frame coverage is refused
  const prod = compileHostPasses({ contract: contract(), passesDir: passes, assetRoot: FIX, runType: "PRODUCTION" });
  assert.ok(prod.errors.some((e) => e.code === "HOST_3D_ASSET_PENDING")); assert.ok(prod.errors.some((e) => e.details?.failed_invariant === "HOST_FRAMES_COMPLETE"));
  // NEGATIVE: pass bytes changed after rendering → stale
  const f600 = path.join(passes, "host_000600.png"), keep = fs.readFileSync(f600); fs.appendFileSync(f600, Buffer.from([0]));
  try { assert.ok(compileHostPasses({ contract: contract(), passesDir: passes, assetRoot: FIX, runType: "DIAGNOSTIC", requireAllFrames: false }).errors.some((e) => e.code === "STALE_DEPENDENCY")); } finally { fs.writeFileSync(f600, keep); }
  // NEGATIVE: the 2D camera pushes in while the host pass is visible → typed failure in the frame state (no sliding host)
  const S0 = roomScene(), P = clone(S0.P); P.host_passes = { diag_host: H.entry }; P.cameras.camD = { zoom: [[0, 1], [1200, 1.3]] };
  const S = await loadScene("D", { manifestOverride: S0.M, planOverride: P }), { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs");
  const sc = composeShot(S.reg.doc.shots[0], S.reg, S.C, { prefix: "q-" });
  assert.ok(sc.frameState(900).state.failures.some((e) => e.code === "HOST_INTEGRATION_INVALID"));
});
