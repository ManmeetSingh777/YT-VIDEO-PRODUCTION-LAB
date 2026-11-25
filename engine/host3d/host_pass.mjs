// Blender HOST PASS adapter, version 1 (Better One TBO-G14; production master §G; quality gates §5).
// Maps exact film frames to Blender frames (one Blender frame per film frame), renders HOST and SHADOW straight-alpha passes with a
// calibrated ORTHOGRAPHIC camera, verifies — from what Blender itself reports — that the camera used is the contracted one, that the 3D
// ground projects onto the painted 2D floor (reviewed calibration landmarks of the world art), and that every pass file is the hashed one.
// compileHostPasses() returns the plan entry consumed by scene_graph (plan.host_passes), so the host is composited INSIDE the single
// Neutrino/Chrome compositor, between depth bands, under painted foreground occluders. verifyHostComposite() judges final pixels with a
// counterfactual (same frame without the host): hidden where an occluder covers it, visible elsewhere, grounded shadow, planted contact.
//
// What this version does NOT do (typed refusals, never silent): perspective cameras, a 2D camera move during a host pass, depth-tested
// interpenetration with 2D props (ordering is by depth band + paint order only), host hand contact with a 2D prop.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { spawnSync } from "node:child_process"; import url from "node:url";
import { err } from "../art_bridge/errors.mjs";
import { decodePNG } from "../art_bridge/png.mjs";

const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
export const BLENDER = process.env.BLENDER_PATH || "C:/Program Files/Blender Foundation/Blender 5.1/blender.exe";
const PR = "engine/host3d/host_pass.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const E = (code, record_id, reason, inv, extra = {}) => err(code, { record_id, reason, producer: `${PR}#${extra.fn || "compileHostPasses"}`, details: { failed_invariant: inv, ...(extra.details || {}) }, frame_range: extra.frame_range ?? null });

/** Blender camera basis from location + XYZ Euler (degrees): R = Rz·Ry·Rx; the camera looks along its local −Z with local +Y up */
export function cameraBasis(cam) {
  const [ax, ay, az] = cam.rotation_euler_deg.map((d) => (d * Math.PI) / 180), [cx, sx, cy, sy, cz, sz] = [Math.cos(ax), Math.sin(ax), Math.cos(ay), Math.sin(ay), Math.cos(az), Math.sin(az)];
  const R = [[cy * cz, sx * sy * cz - cx * sz, cx * sy * cz + sx * sz], [cy * sz, sx * sy * sz + cx * cz, cx * sy * sz - sx * cz], [-sy, sx * cy, cx * cy]];
  return { R, C: cam.location };
}
/** orthoProject(camera, [W,H], worldXYZ) → [px, py] (sensor fit: ortho_scale spans the larger image dimension, as Blender AUTO fit) */
export function orthoProject(cam, [W, H], p) {
  if (cam.type !== "ORTHO") throw E("HOST_INTEGRATION_INVALID", "camera", `camera type ${cam.type} is not supported by host adapter v1 (orthographic only)`, "HOST_CAMERA_ORTHO", { fn: "orthoProject" });
  const { R, C } = cameraBasis(cam), d = [p[0] - C[0], p[1] - C[1], p[2] - C[2]], x = R[0][0] * d[0] + R[1][0] * d[1] + R[2][0] * d[2], y = R[0][1] * d[0] + R[1][1] * d[1] + R[2][1] * d[2], k = Math.max(W, H) / cam.ortho_scale;
  return [W / 2 + x * k, H / 2 - y * k];
}

/** renderHostPasses({contract, frames, outDir}) — runs Blender headless; returns PASSES.json (the engine never trusts it without compileHostPasses) */
export function renderHostPasses({ contract, frames, outDir, blendFile = null, samples = 16 }) {
  fs.mkdirSync(outDir, { recursive: true });
  const req = { film_frames: contract.film_frames, blender_frame_offset: contract.blender_frame_offset, frames, resolution: contract.resolution, camera: contract.camera, host_object: contract.host_object, ground: contract.ground, contact_points: contract.contact_points, diagnostic_fixture: contract.provenance === "DIAGNOSTIC_FIXTURE", samples };
  const rf = path.join(outDir, "RENDER_REQUEST.json"); fs.writeFileSync(rf, JSON.stringify(req, null, 1));
  const args = ["-b", ...(blendFile ? [blendFile] : ["--factory-startup"]), "--python", path.join(REPO, "engine", "host3d", "blender_host_passes.py"), "--", "--request", rf, "--out", outDir];
  const r = spawnSync(BLENDER, args, { encoding: "utf8", maxBuffer: 64 << 20 });
  if (r.status !== 0 || !fs.existsSync(path.join(outDir, "PASSES.json"))) throw E("HOST_INTEGRATION_INVALID", contract.host_id, `Blender failed (${r.status}): ${(r.stderr || r.stdout || "").split("\n").filter((l) => /Error|HOST_|Traceback/.test(l)).slice(-3).join(" | ")}`, "HOST_PASSES_RENDERED", { fn: "renderHostPasses" });
  return JSON.parse(fs.readFileSync(path.join(outDir, "PASSES.json"), "utf8"));
}

/**
 * compileHostPasses({contract, passesDir, assetRoot, runType, requireAllFrames}) → {entry (plan.host_passes[host_id]), errors, report}
 * contract = { host_id, provenance: APPROVED_HOST|DIAGNOSTIC_FIXTURE, blend_sha256, approval_receipt_id, shot_id, band, film_frames:[a,b), blender_frame_offset,
 *              resolution:[W,H], camera:{type, location, rotation_euler_deg, ortho_scale}, ground:{z}, host_object, contact_points:[{id, object}],
 *              calibration_landmarks:[{id, world:[x,y,z], plate_px:[x,y], plate_asset}], tolerance_px:{calibration, contact} }
 */
export function compileHostPasses({ contract: c, passesDir, assetRoot, runType = "PRODUCTION", requireAllFrames = runType === "PRODUCTION", doc = null }) {
  const errors = [], push = (...a) => errors.push(E(...a)), tol = { calibration: 2, contact: 4, ...(c.tolerance_px || {}) };
  if (c.provenance !== "APPROVED_HOST" && c.provenance !== "DIAGNOSTIC_FIXTURE") push("HOST_3D_ASSET_PENDING", c.host_id, `host provenance ${c.provenance} is unknown`, "HOST_PROVENANCE_DECLARED");
  if (runType === "PRODUCTION" && c.provenance !== "APPROVED_HOST") push("HOST_3D_ASSET_PENDING", c.host_id, "a PRODUCTION film needs the approved Blender host (.blend master, rig, face controls, signed approval); a diagnostic stand-in is never composited into the film", "HOST_ASSET_APPROVED");
  if (c.provenance === "APPROVED_HOST" && !(c.blend_sha256 && c.approval_receipt_id)) push("HOST_3D_ASSET_PENDING", c.host_id, "an approved host names its .blend sha256 and the approval receipt", "HOST_ASSET_APPROVED");
  const pf = path.join(passesDir, "PASSES.json"); if (!fs.existsSync(pf)) { push("HOST_INTEGRATION_INVALID", c.host_id, `no PASSES.json in ${passesDir}`, "HOST_PASSES_RENDERED"); return { entry: null, errors, report: null }; }
  const P = JSON.parse(fs.readFileSync(pf, "utf8"));
  if (c.provenance === "APPROVED_HOST" && P.diagnostic_fixture) push("HOST_3D_ASSET_PENDING", c.host_id, "the passes were rendered from the diagnostic fixture, not the approved .blend", "HOST_ASSET_APPROVED");
  if (c.provenance === "APPROVED_HOST" && P.blend_file && fs.existsSync(P.blend_file) && fsha(P.blend_file) !== c.blend_sha256) push("STALE_DEPENDENCY", c.host_id, "the .blend that rendered the passes is not the approved master", "HOST_BLEND_CURRENT");
  // P06 §5.1: one 60 fps film clock, straight alpha, and passes rendered from the CURRENT mesh/rig and performance (a changed mesh without a re-render is stale)
  if (P.fps !== 60) push("HOST_INTEGRATION_INVALID", c.host_id, `passes were rendered at ${P.fps ?? "an unrecorded"} fps; the film clock is 60`, "HOST_FPS_60");
  if (P.alpha_mode !== "STRAIGHT") push("HOST_INTEGRATION_INVALID", c.host_id, `pass alpha is ${P.alpha_mode ?? "unrecorded"}; the compositor composites STRAIGHT alpha (premultiplied edges would darken)`, "HOST_ALPHA_STRAIGHT");
  for (const [k, what] of [["host_mesh_sha256", "mesh/rig"], ["rig_action_sha256", "performance"]]) { if (c[k] && P[k] !== c[k]) push("STALE_DEPENDENCY", c.host_id, `the passes were rendered from a different ${what} (${String(P[k]).slice(0, 12)}… ≠ contracted ${c[k].slice(0, 12)}…): re-render required`, "HOST_SOURCE_CURRENT");
    if (c.provenance === "APPROVED_HOST" && !c[k]) push("HOST_3D_ASSET_PENDING", c.host_id, `an approved host contract names its ${k}`, "HOST_ASSET_APPROVED"); }
  const BANDS = ["FAR", "MID", "FOCAL", "NEAR", "FOREGROUND"], hb = BANDS.indexOf(c.band || "FOCAL");
  for (const id of c.foreground_occluder_ids || []) { const a = doc?.assets?.find((x) => x.id === id); if (!doc) { push("HOST_INTEGRATION_INVALID", c.host_id, "occluder order needs the film manifest", "HOST_OCCLUDER_ORDER"); break; } if (!a) push("MISSING_ART_ASSET", id, `foreground occluder ${id} is not an approved asset`, "HOST_OCCLUDER_ORDER"); else if (BANDS.indexOf(a.depth_band) <= hb) push("HOST_INTEGRATION_INVALID", `${c.host_id}.${id}`, `occluder ${id} is in ${a.depth_band}, not in front of the host band ${c.band || "FOCAL"}: it would be drawn behind the host`, "HOST_OCCLUDER_ORDER"); }
  // 1. the camera Blender used is the contracted camera (a shifted/rotated/rescaled camera is caught here)
  const cu = P.camera_used, { R, C } = cameraBasis(c.camera);
  if (cu.type !== c.camera.type || Math.abs(cu.ortho_scale - c.camera.ortho_scale) > 1e-6 || cu.resolution[0] !== c.resolution[0] || cu.resolution[1] !== c.resolution[1]) push("HOST_INTEGRATION_INVALID", c.host_id, `Blender rendered ${cu.type} scale ${cu.ortho_scale} at ${cu.resolution}; the contract is ${c.camera.type} ${c.camera.ortho_scale} at ${c.resolution}`, "HOST_CAMERA_MATCHED");
  const mw = cu.matrix_world, dev = Math.max(...[0, 1, 2].flatMap((i) => [Math.abs(mw[i][0] - R[i][0]), Math.abs(mw[i][1] - R[i][1]), Math.abs(mw[i][2] - R[i][2]), Math.abs(mw[i][3] - C[i])]));
  if (dev > 1e-4) push("HOST_INTEGRATION_INVALID", c.host_id, `Blender's camera matrix deviates from the contracted calibration by ${dev.toExponential(2)}`, "HOST_CAMERA_MATCHED");
  // 2. the 3D ground projects onto the PAINTED floor: reviewed world landmarks of the 2D plate
  const calib = (c.calibration_landmarks || []).map((l) => { const q = orthoProject(c.camera, c.resolution, l.world), e = Math.hypot(q[0] - l.plate_px[0], q[1] - l.plate_px[1]); return { id: l.id, projected_px: q.map((v) => +v.toFixed(3)), plate_px: l.plate_px, error_px: +e.toFixed(3) }; });
  if (calib.length < 2) push("HOST_INTEGRATION_INVALID", c.host_id, "at least two reviewed floor landmarks of the 2D world art are needed to tie the 3D ground to the painting", "HOST_WORLD_CALIBRATED");
  for (const k of calib) if (k.error_px > tol.calibration) push("HOST_INTEGRATION_INVALID", `${c.host_id}.${k.id}`, `world landmark ${k.id} projects to ${k.projected_px} but is painted at ${k.plate_px} (${k.error_px} px > ${tol.calibration}): the 3D camera does not match the 2D world`, "HOST_WORLD_CALIBRATED");
  // 3. frames: exact film→Blender mapping, complete coverage, hashes; Blender's contact projections agree with the engine's
  const frames = {}, want = requireAllFrames ? Array.from({ length: c.film_frames[1] - c.film_frames[0] }, (_, i) => c.film_frames[0] + i) : P.frames.map((r) => r.film_frame), have = new Map(P.frames.map((r) => [r.film_frame, r])), contacts = [];
  for (const f of want) { const r = have.get(f); if (!r) { push("HOST_INTEGRATION_INVALID", c.host_id, `no host pass for film frame ${f}`, "HOST_FRAMES_COMPLETE", { frame_range: [f, f + 1] }); continue; }
    if (f < c.film_frames[0] || f >= c.film_frames[1]) push("HOST_INTEGRATION_INVALID", c.host_id, `pass for film frame ${f} lies outside the host interval`, "HOST_FRAMES_COMPLETE", { frame_range: [f, f + 1] });
    if (r.blender_frame !== f - c.blender_frame_offset) push("HOST_INTEGRATION_INVALID", c.host_id, `film frame ${f} was rendered from Blender frame ${r.blender_frame}, expected ${f - c.blender_frame_offset}`, "HOST_FRAME_MAP_EXACT", { frame_range: [f, f + 1] });
    for (const k of ["host", "shadow"]) { const file = path.join(passesDir, r[k].file); if (!fs.existsSync(file)) push("HOST_INTEGRATION_INVALID", c.host_id, `${k} pass ${r[k].file} missing`, "HOST_PASS_PRESENT", { frame_range: [f, f + 1] }); else if (fsha(file) !== r[k].sha256) push("STALE_DEPENDENCY", c.host_id, `${k} pass ${r[k].file} bytes differ from PASSES.json`, "HOST_PASS_HASH", { frame_range: [f, f + 1] }); }
    for (const q of r.contacts) { const mine = orthoProject(c.camera, c.resolution, q.world), e = Math.hypot(mine[0] - q.px[0], mine[1] - q.px[1]); contacts.push({ frame: f, id: q.id, world: q.world, px: q.px, engine_px: mine, agree_px: +e.toFixed(4), on_ground: Math.abs(q.world[2] - c.ground.z) });
      if (e > 0.5) push("HOST_INTEGRATION_INVALID", c.host_id, `Blender projects contact ${q.id} to ${q.px} but the calibrated camera gives ${mine}`, "HOST_CAMERA_MATCHED", { frame_range: [f, f + 1] });
      if (Math.abs(q.world[2] - c.ground.z) > 0.01) push("HOST_INTEGRATION_INVALID", `${c.host_id}.${q.id}`, `contact ${q.id} is ${(q.world[2] - c.ground.z).toFixed(3)} world units off the ground at film frame ${f} (floating or sunk)`, "HOST_CONTACT_ON_GROUND", { frame_range: [f, f + 1] }); }
    frames[f] = { host: r.host.file, shadow: r.shadow.file }; }
  // P06 §5.1: a pass that carries its own background is a pasted rectangle: sampled host/shadow passes must be transparent around the subject
  const keys = Object.keys(frames).map(Number).sort((a, b) => a - b), sample = [...new Set([keys[0], keys[Math.floor(keys.length / 2)], keys.at(-1)])].filter((x) => x !== undefined);
  for (const f of sample) for (const k of ["host", "shadow"]) { const png = readPng(path.join(passesDir, frames[f][k])); let lo = 255, opaque = 0; for (let i = 3; i < png.rgba.length; i += 4) { lo = Math.min(lo, png.rgba[i]); if (png.rgba[i] > 200) opaque++; }
    if (lo > 0) push("HOST_INTEGRATION_INVALID", c.host_id, `${k} pass of film frame ${f} has no transparent pixel (min alpha ${lo}): the render carries its own background and would paste a rectangle over the 2D world`, "HOST_PASS_TRANSPARENT", { frame_range: [f, f + 1] });
    if (k === "host" && !opaque) push("HOST_INTEGRATION_INVALID", c.host_id, `host pass of film frame ${f} is empty`, "HOST_PASS_PRESENT", { frame_range: [f, f + 1] }); }
  const rel = path.relative(path.resolve(assetRoot), path.resolve(passesDir)).split(path.sep).join("/");
  if (rel.startsWith("..")) push("HOST_INTEGRATION_INVALID", c.host_id, "passes must live under the film asset root", "HOST_PASS_PRESENT");
  const first = frames[want[0]] || { host: P.frames[0]?.host.file, shadow: P.frames[0]?.shadow.file };
  const entry = { shot_id: c.shot_id, band: c.band || "FOCAL", resolution: c.resolution, url_prefix: `assets/${rel}/`, frames, first, passes_sha256: fsha(pf), provenance: c.provenance };
  return { entry, errors, report: { host_id: c.host_id, provenance: c.provenance, adapter_version: P.adapter_version ?? null, blender_version: P.blender_version, fps: P.fps, alpha_mode: P.alpha_mode, host_mesh_sha256: P.host_mesh_sha256, rig_action_sha256: P.rig_action_sha256, camera_deviation: dev, calibration: calib, contacts, frames_checked: Object.keys(frames).length } };
}

const px = (png, x, y) => { const i = (y * png.width + x) * 4; return png.rgba.subarray(i, i + 4); };
/**
 * verifyHostComposite({frame, final, noHost, hostPass, shadowPass, occluded:(x,y)→bool, contactPx}) — pixel judgement of ONE composited frame:
 *  - where the host pass is opaque and an occluder covers it, the final frame equals the no-host frame (host hidden);
 *  - where it is opaque and nothing covers it, the final frame differs (host visible);
 *  - the shadow darkens the floor near the contact; the host's lowest opaque pixel at the contact column sits on the contact (planted).
 */
export function verifyHostComposite({ frame, final, noHost, hostPass, shadowPass, occluded, contactPx, tol = { contact: 4, visible_ratio: 0.97, hidden_ratio: 0.99 } }) {
  const failures = [], W = final.width, H = final.height; let vis = 0, visOk = 0, hid = 0, hidOk = 0, shadowDark = 0, shadowPx = 0;
  const diff = (a, b) => Math.max(Math.abs(a[0] - b[0]), Math.abs(a[1] - b[1]), Math.abs(a[2] - b[2]));
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const ha = px(hostPass, x, y)[3]; const d = diff(px(final, x, y), px(noHost, x, y));
    if (ha > 250) { if (occluded(x, y)) { hid++; if (d <= 2) hidOk++; } else { vis++; if (d > 8) visOk++; } }
    else if (ha === 0 && px(shadowPass, x, y)[3] > 96 && !occluded(x, y)) { shadowPx++; const a = px(final, x, y), b = px(noHost, x, y); if (a[0] + a[1] + a[2] < b[0] + b[1] + b[2] - 12) shadowDark++; }
  }
  const F = (inv, reason) => failures.push(err("HOST_INTEGRATION_INVALID", { record_id: `frame ${frame}`, frame_range: [frame, frame + 1], reason, producer: `${PR}#verifyHostComposite`, details: { failed_invariant: inv } }));
  if (!vis) F("HOST_VISIBLE", "no unoccluded host pixel: the host is not on screen");
  else if (visOk / vis < tol.visible_ratio) F("HOST_VISIBLE", `only ${((100 * visOk) / vis).toFixed(1)}% of the unoccluded host pixels reached the frame`);
  if (hid && hidOk / hid < tol.hidden_ratio) F("HOST_OCCLUDED_BY_FOREGROUND", `${(100 - (100 * hidOk) / hid).toFixed(1)}% of host pixels behind the foreground occluder are visible: wrong paint order or missing occluder`);
  if (shadowPx && shadowDark / shadowPx < 0.9) F("HOST_SHADOW_COMPOSITED", `only ${((100 * shadowDark) / shadowPx).toFixed(1)}% of the cast-shadow area darkens the floor`);
  if (!shadowPx) F("HOST_SHADOW_COMPOSITED", "the shadow pass casts nothing visible near the host: an ungrounded host");
  let low = -1; const cx = Math.round(contactPx[0]); for (let y = H - 1; y >= 0 && low < 0; y--) for (let dx = -3; dx <= 3; dx++) if (px(hostPass, Math.min(W - 1, Math.max(0, cx + dx)), y)[3] > 128) { low = y; break; }
  const contact_err = low < 0 ? null : Math.abs(low - contactPx[1]);
  if (contact_err === null || contact_err > tol.contact) F("HOST_CONTACT_PLANTED", `the host's lowest pixel at the contact column is ${low < 0 ? "missing" : `${contact_err.toFixed(1)} px from the projected contact`}`);
  return { ok: !failures.length, failures, frame, visible_px: vis, visible_ok: visOk, hidden_px: hid, hidden_ok: hidOk, shadow_px: shadowPx, shadow_dark: shadowDark, lowest_host_px: low, contact_px: contactPx };
}
export const readPng = (f) => decodePNG(fs.readFileSync(f));
