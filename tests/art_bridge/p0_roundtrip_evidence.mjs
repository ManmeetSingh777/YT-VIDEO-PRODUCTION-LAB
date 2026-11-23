// P0-3/P0-4 evidence: real-PNG import → registration → explicit review → approved manifest → Chrome render across a state switch, plus
// invalidation by (a) a changed master landmark and (b) one changed master pixel. DIAGNOSTIC_FIXTURE rasters only (see roundtrip_fixture.mjs).
// Writes hybrid_v2/evidence/p0/ROUNDTRIP_EVIDENCE.json and images under hybrid_v2/evidence/p0/roundtrip/.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runRoundTrip } from "./roundtrip_fixture.mjs";
import * as I from "../../engine/art_bridge/art_intake.mjs";
import { runCheck } from "../../engine/tools/art_bridge_check.mjs";
import { verifyAllApprovals } from "../../engine/art_bridge/approvals.mjs";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { composeShot } from "../../engine/art_bridge/scene_graph.mjs";
import { buildComposition, capture } from "../../engine/art_bridge/render.mjs";
import { readPNG, writeRGBA } from "../../engine/art_bridge/png.mjs";
import { apply, mul, T } from "../../engine/art_bridge/math2d.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p0"), EV = path.join(REPO, "hybrid_v2", "evidence", "p0"), OUTI = path.join(EV, "roundtrip");
fs.rmSync(OUTI, { recursive: true, force: true }); fs.mkdirSync(OUTI, { recursive: true });
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), rel = (f) => path.relative(REPO, f).split(path.sep).join("/"), keep = (f, name) => { const t = path.join(OUTI, name || path.basename(f)); fs.copyFileSync(f, t); return { file: rel(t), sha256: sha(t) }; };
const steps = []; const rt = await runRoundTrip(path.join(W, "roundtrip_evidence"), { log: (n, r) => steps.push({ step: n, result: typeof r === "string" ? r : r?.status ?? r?.verdict ?? r }) });
const doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8")), id = doc.identities[0], master = doc.assets.find((a) => a.id === "pilot_master"), reg = JSON.parse(fs.readFileSync(path.join(rt.film, "registration", "pilot_master", "MASTER_REGISTRATION_RECEIPT.json"), "utf8"));

// 1) canonical coordinate grid: delivered master pixels resampled into canonical units, planned (blue) vs measured (red) landmarks
{ const src = readPNG(rt.files.master), Tm = reg.raster_to_canonical, d = Tm[0] * Tm[3] - Tm[1] * Tm[2], Ti = [Tm[3] / d, -Tm[1] / d, -Tm[2] / d, Tm[0] / d, (Tm[2] * Tm[5] - Tm[3] * Tm[4]) / d, (Tm[1] * Tm[4] - Tm[0] * Tm[5]) / d];
  const S = 2, CW = 320 * S, CH = 420 * S, out = new Uint8Array(CW * CH * 4);
  for (let y = 0; y < CH; y++) for (let x = 0; x < CW; x++) { const c = [x / S, y / S], p = apply(Ti, c), i = (y * CW + x) * 4, px = Math.floor(p[0]), py = Math.floor(p[1]); let r = 250, g = 250, b = 250;
    if (px >= 0 && py >= 0 && px < src.width && py < src.height) { const j = (py * src.width + px) * 4, a = src.rgba[j + 3] / 255; r = src.rgba[j] * a + r * (1 - a); g = src.rgba[j + 1] * a + g * (1 - a); b = src.rgba[j + 2] * a + b * (1 - a); }
    if (c[0] % 25 < 0.5 || c[1] % 25 < 0.5) { r *= 0.75; g *= 0.75; b *= 0.8; } out.set([r, g, b, 255], i); }
  const dot = (c, col, rad) => { for (let dy = -rad; dy <= rad; dy++) for (let dx = -rad; dx <= rad; dx++) { if (dx * dx + dy * dy > rad * rad) continue; const x = Math.round(c[0] * S) + dx, y = Math.round(c[1] * S) + dy; if (x < 0 || y < 0 || x >= CW || y >= CH) continue; out.set([...col, 255], (y * CW + x) * 4); } };
  for (const [k, v] of Object.entries(id.landmarks)) dot(v, [30, 60, 230], 6); for (const [k, v] of Object.entries(master.landmarks)) dot(v, [230, 30, 30], 3);
  writeRGBA(path.join(OUTI, "master_in_canonical_grid.png"), CW, CH, out); }
const images = { delivered_master: keep(rt.files.master, "delivered_master.png"), canonical_grid: { file: rel(path.join(OUTI, "master_in_canonical_grid.png")), legend: "delivered master resampled into canonical units; grid 25 units; blue = planned identity landmarks, red = measured landmarks" } };
for (const k of ["pilot_hand_open", "pilot_hand_grip", "pilot_upper_arm"]) { images[`${k}_overlay`] = keep(path.join(rt.film, "registration", k, `${k}__overlay_on_master.png`), `${k}__overlay_on_master.png`); images[`${k}_difference`] = keep(path.join(rt.film, "registration", k, `${k}__difference.png`), `${k}__difference.png`); images[`${k}_delivered`] = keep(rt.files[k.replace("pilot_", "")], `${k}__delivered.png`); }

// 2) approvals and gates on the approved manifest
const chk = await runCheck({ root: rt.film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json" }), prod = await runCheck({ root: rt.film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json", production: true });

// 3) Chrome render of frames 99/100/101 across the open→grip switch (approved, registered assets; Neutrino runtime)
const regy = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json"), plan = JSON.parse(fs.readFileSync(path.join(rt.film, "handoff", "MOTION_PLAN.json"), "utf8"));
const C = compileMotionTracks(regy.doc.actions, regy.doc.shots, { doc: regy.doc, plan }), sc = composeShot(regy.doc.shots[0], regy, C, { prefix: "rt-" });
const comp = buildComposition(path.join(W, "roundtrip_render", "comp"), { id: "rt_switch", scene: sc, frameRange: [90, 110], registry: regy }), cap = await capture(comp, rt.film, [99, 100, 101], path.join(W, "roundtrip_render", "frames"), { id: "rt_switch" });
const sw = [99, 100, 101].map((f) => { const st = stateAtFrame(C, f), hand = st.passes.find((p) => p.slot === "pilot_hand_open" && p.visible), a = regy.get(hand.asset_id).asset, wristCanon = a.landmarks.wrist_r, wristWorld = apply(hand.matrix, wristCanon); return { frame: f, pose: st.artStates.pilot_rig.pose, visible_hand_asset: hand.asset_id, wrist_world: wristWorld, joint_wrist_world: apply(st.matrices.pilot_rig.wrist_r, regy.doc.identities[0].landmarks.wrist_r) }; });
// pixel probe: every rig landmark, mapped through its joint, must land on painted (non-sentinel) art in the rendered frame
const probe = [99, 100, 101].map((f, k) => { const st = stateAtFrame(C, f), png = readPNG(cap.files[k]), L = regy.doc.identities[0].landmarks, J = { neck: "pelvis", pelvis: "pelvis", upper_arm_mid: "shoulder_r", elbow_r: "elbow_r", forearm_mid: "elbow_r", wrist_r: "wrist_r" };
  return { frame: f, points: Object.entries(J).map(([lm, j]) => { const w = apply(st.matrices.pilot_rig[j], L[lm]), i = (Math.floor(w[1]) * png.width + Math.floor(w[0])) * 4, px = [...png.rgba.slice(i, i + 3)]; return { landmark: lm, world: w, pixel: px, on_art: !(px[0] > 240 && px[1] < 20 && px[2] > 240) }; }) }; });
const probeOk = probe.every((r) => r.points.every((p) => p.on_art));
const swapWristErr = Math.max(...sw.map((r) => Math.hypot(r.wrist_world[0] - r.joint_wrist_world[0], r.wrist_world[1] - r.joint_wrist_world[1])));
images.switch_frames = cap.files.map((f, k) => keep(f, `switch_f${[99, 100, 101][k]}.png`));
{ const strip = path.join(OUTI, "switch_strip_99_100_101.png"), py = ["import sys", "from PIL import Image", "ims=[Image.open(p).crop((700,250,1300,850)) for p in sys.argv[2:]]", "c=Image.new('RGB',(1820,600),(255,255,255))", "for i,im in enumerate(ims): c.paste(im.convert('RGB'),(i*610,0))", "c.save(sys.argv[1])"].join("\n");
  execFileSync(process.env.PYTHON || "python", ["-c", py, strip, ...cap.files]); images.switch_strip = { file: rel(strip), sha256: sha(strip) }; }

// 4) invalidation (a): one master landmark moved in the identity → identity + dependents stale; resume lists re-review work
const copyFilm = (tag) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(rt.film, d, { recursive: true }); return d; };
const fa = copyFilm("rt_invalid_landmark"), da = JSON.parse(fs.readFileSync(path.join(fa, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), "utf8")); da.identities[0].landmarks.elbow_r = [da.identities[0].landmarks.elbow_r[0] + 2, da.identities[0].landmarks.elbow_r[1]]; fs.writeFileSync(path.join(fa, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify(da, null, 1));
const va = verifyAllApprovals(da, fa), ra = await I.resumeDependentJobs({ film: fa });
// invalidation (b): one master pixel changed in the delivered file, re-ingested → new identity hash, master unapproved, every dependent invalidated
const fb = copyFilm("rt_invalid_pixel"), mp = readPNG(rt.files.master); mp.rgba[(450 * mp.width + 300) * 4] ^= 0x40; const changed = path.join(W, "rt_invalid_pixel", "master_one_pixel_changed.png"); writeRGBA(changed, mp.width, mp.height, mp.rgba);
const rb = await I.ingestMaster({ film: fb, asset: "pilot_master", file: changed, landmarks: rt.files.master_landmarks, provenance: "DIAGNOSTIC_FIXTURE" }), db = JSON.parse(fs.readFileSync(path.join(fb, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), "utf8")), vb = verifyAllApprovals(db, fb), rsb = await I.resumeDependentJobs({ film: fb }), pb = await runCheck({ root: fb, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json", production: true });
const count = (xs) => xs.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});
const ev = { generated_by: "tests/art_bridge/p0_roundtrip_evidence.mjs", tested_revision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), generated_at: new Date().toISOString(),
  truth: "DIAGNOSTIC_FIXTURE rasters (flat capsules) with exact construction landmarks; proves the intake/registration/approval/render mechanics only. No style image was fabricated; nothing here is target art.",
  steps, master_registration: { transform: reg.raster_to_canonical, scale: reg.scale, rotation_deg: reg.rotation_deg, max_residual_px: reg.max_residual_px, identity_master_sha256_synchronised: id.master_sha256 === master.sha256, canonical_rect: master.canonical_rect },
  part_registrations: Object.fromEntries(["pilot_body", "pilot_upper_arm", "pilot_forearm", "pilot_underpaint", "pilot_hand_open", "pilot_hand_grip"].map((k) => { const r = JSON.parse(fs.readFileSync(path.join(rt.film, "registration", k, `${k}__REGISTRATION_RECEIPT.json`), "utf8")), a = doc.assets.find((x) => x.id === k); return [k, { kind: a.kind, max_residual_master_px: r.max_residual_px, scale_to_master: r.scale, alpha: r.alpha_report, asset_to_canonical: a.asset_to_canonical, canonical_rect: a.canonical_rect, approved_review_id: a.approved_review_id, shot_usage: a.shot_usage }]; })),
  off_axis_hand: steps.find((s) => s.step.startsWith("ingest-part off-axis")),
  approval_gates_mechanical: chk.gates, approvals_verified_count: chk.approvals_verified_count, production_check: { gates: prod.gates, error_codes: [...new Set(prod.errors.map((e) => e.code))], note: "production refuses: DIAGNOSTIC_FIXTURE provenance (correct)" },
  state_switch_render: { frames: sw, render_failures: cap.failures, wrist_registration_max_px: swapWristErr, landmark_pixel_probe: probe, all_landmarks_on_painted_art: probeOk, dom_order: cap.domOrder },
  invalidation_landmark: { change: "identity elbow_r moved +2 canonical px", failures: va.failures.map((f) => `${f.scope}:${f.record_id} ${f.status}`), resume: count(ra) },
  invalidation_pixel: { change: "one master pixel's red channel XOR 0x40, re-ingested", ingest_status: rb.status, new_master_sha256: db.identities[0].master_sha256, old_master_sha256: id.master_sha256, failures: vb.failures.map((f) => `${f.scope}:${f.record_id} ${f.status}`), unreviewed: vb.unreviewed.map((u) => `${u.scope}:${u.record_id}`), resume: count(rsb), production_error_codes: [...new Set(pb.errors.map((e) => e.code))] },
  images };
fs.writeFileSync(path.join(EV, "ROUNDTRIP_EVIDENCE.json"), JSON.stringify(ev, null, 1));
console.log("landmark probe on art:", probeOk, "gates", JSON.stringify(chk.gates), "verified", chk.approvals_verified_count, "| switch wrist err", swapWristErr.toExponential(2), "render failures", cap.failures.length);
console.log("landmark change →", ev.invalidation_landmark.failures.length, "stale;", JSON.stringify(ev.invalidation_landmark.resume));
console.log("pixel change →", ev.invalidation_pixel.failures.length, "stale,", ev.invalidation_pixel.unreviewed.length, "unreviewed;", JSON.stringify(ev.invalidation_pixel.resume));
