#!/usr/bin/env node
// P03 Chrome/Neutrino diagnostic clips (directive J). Every frame goes through the PRODUCTION renderer session (engine/film/chrome_frames.mjs:
// registry → compileMotionTracks → composeShot → buildComposition with the preserved nu.js → Chrome seek → RGB24) and the PRODUCTION chunk
// loop (segment_render.renderChunk), with per-owner isolated attribution. Outputs (DIAGNOSTIC; fixture rasters, never target art):
//   <out>/<clip>.mp4 (H.264 of the exact RGB24 frames), <out>/<clip>/fNNNN.png (selected frames), <out>/<clip>.receipt.json (hashes, owners)
//   <out>/NEGATIVES.json — five perturbations the owner-attribution gate must reject; <out>/CLIPS_SUMMARY.json
//   node tests/p03/run_clips.mjs [--out DIR] [--only directed,bare,negatives]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { spawn } from "node:child_process";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg("--out", path.join(REPO, "hybrid_v2", "evidence", "p03", "clips"))), ONLY = new Set(arg("--only", "directed,bare,negatives").split(","));
const { runSubjects, approveDeforms } = await import("./subjects_fixture.mjs"), P = await import("./p03_plans.mjs");
const { createChromeFrameSession } = await import("../../engine/film/chrome_frames.mjs"), { renderChunk } = await import("../../engine/film/segment_render.mjs"), { ownerAttributionGate } = await import("../../engine/film/coverage_gate.mjs"), { writeRGBA } = await import("../../engine/art_bridge/png.mjs");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
fs.mkdirSync(OUT, { recursive: true });
const rt = await runSubjects(path.join(REPO, "hybrid_v2", "work", "p03", "subjects")), FILM = rt.film, doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8"));
const planFile = (name, plan) => { const f = path.join(REPO, "hybrid_v2", "work", "p03", "plans", `${name}.json`); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(plan, null, 1)); return f; };
const savePng = (file, rgb, W, H) => { const px = new Uint8Array(W * H * 4); for (let i = 0, j = 0; j < rgb.length; i += 4, j += 3) { px[i] = rgb[j]; px[i + 1] = rgb[j + 1]; px[i + 2] = rgb[j + 2]; px[i + 3] = 255; } fs.mkdirSync(path.dirname(file), { recursive: true }); writeRGBA(file, W, H, px); };
/** render [s,e) ranges of one plan through the production session + chunk loop; optional H.264 footage and frame PNGs */
async function clip(name, plan, ranges, { mp4 = true, pngs = [], attribution = true, perturb = null } = {}) {
  const t0 = Date.now(), pf = planFile(name, plan), session = await createChromeFrameSession({ film: FILM, planFile: pf, runType: "DIAGNOSTIC", workDir: path.join(REPO, "hybrid_v2", "work", "p03", "comp", name), attribution, diagnosticPerturb: perturb });
  let ff = null, done = null; if (mp4) { ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", "1920x1080", "-r", "60", "-i", "pipe:0", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium", "-movflags", "+faststart", path.join(OUT, `${name}.mp4`)], { stdio: ["pipe", "ignore", "pipe"] }); let e = ""; ff.stderr.on("data", (d) => (e += d)); done = new Promise((ok, no) => ff.on("close", (c) => (c === 0 ? ok() : no(new Error(`ffmpeg ${c}: ${e}`))))); }
  const chunks = [];
  try { for (const r of ranges) { const write = async (rgb) => { if (ff) await new Promise((ok, no) => ff.stdin.write(rgb, (x) => (x ? no(x) : ok()))); };
      let f = r[0]; const res = await renderChunk(session, r, { write: async (rgb) => { if (pngs.includes(f)) savePng(path.join(OUT, name, `f${String(f).padStart(4, "0")}.png`), rgb, 1920, 1080); await write(rgb); f++; } }); chunks.push(res); } }
  finally { await session.close(); if (ff) { ff.stdin.end(); await done; } }
  const receipt = { clip: name, plan: path.relative(REPO, pf), plan_sha256: fsha(pf), renderer: session.info, ranges, chunks: chunks.map((c) => ({ frames: c.frames, hashes: c.hashes, state_hashes: c.state_hashes, owners: c.owners, defects: c.defects, chunk_sha256: c.chunk_sha256 })), mp4: mp4 ? path.relative(REPO, path.join(OUT, `${name}.mp4`)) : null, mp4_sha256: mp4 ? fsha(path.join(OUT, `${name}.mp4`)) : null, seconds: (Date.now() - t0) / 1000 };
  fs.writeFileSync(path.join(OUT, `${name}.receipt.json`), JSON.stringify(receipt)); return receipt;
}
const ownersOf = (rc) => { const o = {}; let first = Infinity; for (const c of rc.chunks) first = Math.min(first, c.frames[0]); for (const c of rc.chunks) for (const [u, t] of Object.entries(c.owners || {})) { const d = (o[u] ||= {}); for (const [k, v] of Object.entries(t)) { d[k] ||= []; v.forEach((x, i) => { d[k][c.frames[0] - first + i] = x; }); } } return { owners: o, first }; };
const gateDoc = (rc) => { const [s, e] = [Math.min(...rc.ranges.map((r) => r[0])), Math.max(...rc.ranges.map((r) => r[1]))]; return { ...doc, actions: doc.actions.map((a) => ({ ...a, frame_range: [Math.max(a.frame_range[0], s), Math.min(a.frame_range[1], e)] })).filter((a) => a.frame_range[1] > a.frame_range[0]) }; };
const prevSummary = fs.existsSync(path.join(OUT, "CLIPS_SUMMARY.json")) ? JSON.parse(fs.readFileSync(path.join(OUT, "CLIPS_SUMMARY.json"), "utf8")) : null;
const summary = { film: path.relative(REPO, FILM), started_at: new Date().toISOString(), clips: { ...(prevSummary?.clips || {}) }, negatives: { ...(prevSummary?.negatives || {}) } }; // a partial re-run (--only) keeps the other recorded results
const plan = await approveDeforms(FILM, P.directedPlan(doc)), bare = P.barePlan(doc), PNGS = [0, 30, 33, 60, 70, 100, 150, 199, 215, 240, 262, 300, 330, 380, 420, 479];
if (ONLY.has("directed")) { const rc = await clip("p03_directed", plan, [[0, 240], [240, 480]], { pngs: PNGS }), g = ownerAttributionGate({ ...ownersOf(rc), doc: gateDoc(rc) }); summary.clips.p03_directed = { mp4: rc.mp4, seconds: rc.seconds, defects: rc.chunks.flatMap((c) => c.defects), owner_gate: { ok: g.ok, failures: g.failures, units: g.units } }; fs.writeFileSync(path.join(OUT, "CLIPS_SUMMARY.json"), JSON.stringify(summary, null, 1)); console.log("directed", g.ok, rc.seconds); }
if (ONLY.has("bare")) { const rc = await clip("p03_bare_before", bare, [[0, 240], [240, 480]], { pngs: PNGS, attribution: false }); summary.clips.p03_bare_before = { mp4: rc.mp4, seconds: rc.seconds, note: "direction keys only (no phrases/acting/reaction/support/grip/shadow/morph/deform): the BEFORE of every capability" }; fs.writeFileSync(path.join(OUT, "CLIPS_SUMMARY.json"), JSON.stringify(summary, null, 1)); console.log("bare", rc.seconds); }
if (ONLY.has("negatives")) {
  // DIAGNOSTIC perturbations: the expected state is the true compiled state; only the PIXELS are perturbed, the way a broken renderer would
  const by = (rows, pre, fn) => rows.map((r) => (r[0].startsWith(pre) ? fn(r) : r));
  const freezeAt = (f0, match) => { let snap = null; return (rows, f, prefix) => { const m = `${prefix}${match}`; if (f === f0 || !snap) snap = new Map(rows.filter((r) => r[0].startsWith(m)).map((r) => [r[0], r])); return rows.map((r) => (snap.has(r[0]) ? snap.get(r[0]) : r)); }; };
  const swapHide = (slot, keepAsset) => (rows, f, prefix) => by(rows, `${prefix}${slot}--`, (r) => [r[0], r[1], r[0] === `${prefix}${slot}--${keepAsset}` ? (rows.some((q) => q[0].startsWith(`${prefix}${slot}--`) && q[2] === 1) ? 1 : 0) : 0, r[3], r[4]]);
  const noDeform = (rows, f, prefix) => rows.map((r) => (r[0].includes("--tri") ? [r[0], r[1], 0, r[3], r[4]] : r[0] === `${prefix}lumen_rig--lumen_body--lumen_body` ? [r[0], r[1], rows.some((q) => q[0].includes("lumen_body--lumen_body--tri") && q[2] === 1) ? 1 : r[2], r[3], r[4]] : r));
  const fx = { ...plan, effects: [{ id: "dust", shot: "p03_shot_a", asset_id: "nova_eye_open", count: 12, frames: [80, 140], seed: 7, wind: [40, -30], size: [24, 24] }] };
  const N = [
    ["frozen_character_particles_move", fx, [[80, 120]], freezeAt(80, "nova_rig--"), "nova_pull_lever:nova_rig", "OWNER_MOTION_RENDERED"],
    ["missing_grip_transition", plan, [[64, 76]], swapHide("nova_rig--nova_hand_open", "nova_hand_open"), "nova_pull_lever:nova_rig:nova_hand_open", "DISCRETE_STATE_NOT_RENDERED"],
    ["missing_blink", plan, [[26, 40]], swapHide("nova_rig--nova_eye_open", "nova_eye_open"), "nova_pull_lever:nova_rig:nova_eye_open", "DISCRETE_STATE_NOT_RENDERED"],
    ["missing_deformation", plan, [[280, 310]], noDeform, "lumen_watch:lumen_rig:lumen_body", "DEFORMATION_NOT_RENDERED"],
    ["missing_object_reaction", plan, [[110, 150]], freezeAt(110, "lever_rig--"), "nova_pull_lever:lever_rig", "OWNER_MOTION_RENDERED"],
  ];
  for (const [name, pl, ranges, perturb, expectRecord, expectInv] of N) {
    const rcN = await clip(`neg_${name}`, pl, ranges, { mp4: false, perturb }), gN = ownerAttributionGate({ ...ownersOf(rcN), doc: gateDoc(rcN) });
    const rcC = await clip(`ctl_${name}`, pl, ranges, { mp4: false }), gC = ownerAttributionGate({ ...ownersOf(rcC), doc: gateDoc(rcC) }); // counterfactual control: same frames, unperturbed
    const hit = gN.failures.filter((x) => x.record_id === expectRecord && x.failed_invariant === expectInv);
    summary.negatives[name] = { frames: ranges, perturbed_gate_ok: gN.ok, expected: { record_id: expectRecord, failed_invariant: expectInv }, detected: hit.length > 0, perturbed_failures: gN.failures.slice(0, 12), control_gate_ok: gC.ok, control_failures: gC.failures.slice(0, 6) };
    fs.writeFileSync(path.join(OUT, "NEGATIVES.json"), JSON.stringify(summary.negatives, null, 1)); console.log("negative", name, "detected:", hit.length > 0, "control ok:", gC.ok);
  }
}
summary.finished_at = new Date().toISOString(); fs.writeFileSync(path.join(OUT, "CLIPS_SUMMARY.json"), JSON.stringify(summary, null, 1)); console.log("→", OUT);
