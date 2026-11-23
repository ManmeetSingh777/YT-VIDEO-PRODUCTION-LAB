// P02-R01..R05, R07 on the PRODUCTION Chrome renderer (art_bridge_chrome_frames) with the DIAGNOSTIC rehearsal film's real registered layers.
// Heavy: launches Chrome. Memory evidence (node + Chrome RSS per sampled frame) is written to hybrid_v2/work/p02/render/MEMORY_LOG.json.
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import * as SR from "../../engine/film/segment_render.mjs";
import { createChromeFrameSession, chromeRss } from "../../engine/film/chrome_frames.mjs";
import { buildFilmRevision } from "../../engine/film/film_revision.mjs";
import { validateStateEdge } from "../../engine/art_bridge/state_router.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "render");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let FILM, PLAN;
before(async () => { const src = path.resolve(REPO, process.env.P02_REHEARSAL_FILM || path.join("hybrid_v2", "work", "p02", "rehearsal_J", "rt", "film")); FILM = path.join(W, "film");
  if (!fs.existsSync(path.join(src, "REHEARSAL_LABEL.txt"))) { const { buildRehearsalFilm } = await import("./rehearsal_film.mjs"); await buildRehearsalFilm(path.join(W, "built")); fs.rmSync(FILM, { recursive: true, force: true }); fs.cpSync(path.join(W, "built", "rt", "film"), FILM, { recursive: true }); }
  else { fs.rmSync(FILM, { recursive: true, force: true }); fs.cpSync(src, FILM, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(src, s)) }); }
  PLAN = path.join(FILM, "handoff", "MOTION_PLAN.json"); });
const session = (o = {}) => createChromeFrameSession({ film: FILM, planFile: PLAN, runType: "DIAGNOSTIC", ...o });

test("P02-R01 the production registry renders native 1920x1080 RGB24 frames from real layers; PNG bytes and 16x9 outputs are refused", async () => {
  assert.equal(SR.RENDERERS.art_bridge_chrome_frames.provenance, "ART_BRIDGE_CAPTURE"); assert.equal(SR.RENDERERS.diagnostic_flat.provenance, "DIAGNOSTIC_ONLY");
  const s = await session(); try { const fr = await s.renderFrame(450); assert.equal(fr.rgb.length, 6220800); assert.equal(SR.frameDefects(fr.rgb, s), null, "no black/sentinel/edge defect"); } finally { await s.close(); }
  const png = { width: 1920, height: 1080, renderFrame: async () => ({ rgb: fs.readFileSync(path.join(FILM, "assets", "art", "pilot_master.png")), state_sha: "x" }) };
  await assert.rejects(SR.renderChunk(png, [0, 1]), (e) => e.code === "IMAGE_DIMENSION_MISMATCH", "PNG bytes are not a frame");
  const tiny = { width: 1920, height: 1080, renderFrame: async () => ({ rgb: Buffer.alloc(16 * 9 * 3, 7), state_sha: "x" }) }; await assert.rejects(SR.renderChunk(tiny, [0, 1]), (e) => e.code === "IMAGE_DIMENSION_MISMATCH", "16x9 frames are refused");
});
test("P02-R02 out-of-order and separate-session capture give identical hashes; changed source art refuses the session", async () => {
  const frames = [3900, 120, 450, 7199, 120], a = await session(), got = []; try { for (const f of frames) got.push(sha((await a.renderFrame(f)).rgb)); } finally { await a.close(); }
  assert.equal(got[1], got[4], "same frame, same session, out of order"); const b = await session(); try { for (const [i, f] of frames.entries()) assert.equal(sha((await b.renderFrame(f)).rgb), got[i], `frame ${f} fresh session`); } finally { await b.close(); }
  const d = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), f = path.join(FILM, d.assets.find((x) => x.id === "pilot_forearm").file), orig = fs.readFileSync(f);
  fs.appendFileSync(f, Buffer.from([0])); try { await assert.rejects(session(), (e) => e.code === "ASSET_HASH_MISMATCH"); } finally { fs.writeFileSync(f, orig); }
});
test("P02-R03 600 consecutive image-backed frames stream into one verified lossless segment; memory does not grow with chunk size", async () => {
  const log = []; for (const chunkSize of [600, 200]) { const F = path.join(W, `mem_${chunkSize}`); fs.rmSync(F, { recursive: true, force: true }); fs.cpSync(FILM, F, { recursive: true }); let peakNode = 0, peakChrome = 0, s0 = null;
    const tick = setInterval(() => { peakNode = Math.max(peakNode, process.memoryUsage().rss); }, 200);
    const rc = await SR.renderFilm({ film: F, revision: buildFilmRevision(F), renderer: "art_bridge_chrome_frames", rendererArgs: { planFile: path.join(F, "handoff", "MOTION_PLAN.json"), runType: "DIAGNOSTIC" }, total: 600, chunkSize, outName: "mem.mp4", onChunk: (c) => { log.push({ chunkSize, chunk: c.frames, node_rss_mb: +(c.rss_bytes / 2 ** 20).toFixed(1) }); } });
    clearInterval(tick); const m = J(path.join(F, "render", "FRAME_MANIFEST.json")), pid = m.session_info?.browser_pid; void s0; void pid;
    for (const c of m.chunks) { const p = SR.probeMp4(path.join(F, c.mkv)); assert.equal(p.frames, c.frames[1] - c.frames[0]); assert.equal(p.width, 1920); assert.equal(p.r_frame_rate, "60/1"); }
    assert.equal(rc.probe.frames, 600); log.push({ chunkSize, peak_node_rss_mb: +(peakNode / 2 ** 20).toFixed(1), peak_chrome_rss_mb: peakChrome || null, chunks: m.chunks.length }); }
  // Chrome RSS: sample a live session over 600 frames
  const s = await session(), pid = s.info.browser_pid, samples = []; try { for (let f = 0; f < 600; f++) { await s.renderFrame(f); if (f % 100 === 0 || f === 599) samples.push({ frame: f, node_rss_mb: +(process.memoryUsage().rss / 2 ** 20).toFixed(1), chrome_rss_mb: pid ? +((chromeRss(pid) || 0) / 2 ** 20).toFixed(1) : null }); } } finally { await s.close(); }
  log.push({ live_session_600_frames: samples }); fs.writeFileSync(path.join(W, "MEMORY_LOG.json"), JSON.stringify(log, null, 1));
  const peaks = log.filter((x) => x.peak_node_rss_mb), ratio = peaks[0].peak_node_rss_mb / peaks[1].peak_node_rss_mb; assert.ok(ratio < 1.5, `peak RSS with 600-frame chunks ${peaks[0].peak_node_rss_mb} MB vs 200-frame chunks ${peaks[1].peak_node_rss_mb} MB`);
  const first = samples[1]?.node_rss_mb, last = samples.at(-1).node_rss_mb; assert.ok(last < first * 1.5 + 200, `node RSS ${first} → ${last} MB over 600 frames (no Buffer accumulation)`);
});
test("P02-R04 a crash at chunk start/mid/end or an encoder failure publishes nothing; the retry resumes exact coverage with reused verified chunks", async () => {
  const F = path.join(W, "crash"); fs.rmSync(F, { recursive: true, force: true }); fs.cpSync(FILM, F, { recursive: true }); const rev = buildFilmRevision(F), args = { renderer: "art_bridge_chrome_frames", rendererArgs: { planFile: path.join(F, "handoff", "MOTION_PLAN.json"), runType: "DIAGNOSTIC" }, total: 240, chunkSize: 120, outName: "c.mp4", film: F, revision: rev };
  for (const frame of [120, 180, 239]) { await assert.rejects(SR.renderFilm({ ...args, inject: { crashAt: { frame, attempts: 9, transient: false } } }), (e) => e.code === "RENDER_CAPTURE_FAILURE"); assert.ok(!fs.existsSync(path.join(F, "render", "RENDER_COMPLETION_RECEIPT.json")), `crash at ${frame}: no receipt`); assert.ok(!fs.existsSync(path.join(F, "render", "c.mp4"))); }
  await assert.rejects(SR.renderFilm({ ...args, inject: { failEncodeChunk: 120 } }), (e) => e.code === "RENDER_CAPTURE_FAILURE"); await assert.rejects(SR.renderFilm({ ...args, inject: { failAssemble: true } }), (e) => /final assembly failed/.test(e.message)); assert.ok(!fs.existsSync(path.join(F, "render", "c.mp4")), "no half-published film");
  const ok = await SR.renderFilm(args), m = J(path.join(F, "render", "FRAME_MANIFEST.json")); assert.equal(ok.probe.frames, 240); assert.ok(m.chunks[0].reused, "the verified first chunk was reused, not re-rendered"); assert.deepEqual(m.chunks.map((c) => c.frames), [[0, 120], [120, 240]]);
  const v = await SR.verifyRenderReceipt(F, rev, {}); assert.equal(v.ok, true, v.reasons.join("; ")); assert.ok(v.resampled.includes(119) && v.resampled.includes(120), "chunk join re-rendered on a fresh session");
});
test("P02-R05 chunk joins 599/600 and 1199/1200 re-render identically on a fresh session (diagnostic film evidence for 7200 frames is the rehearsal)", async () => {
  const s = await session(), h = {}; try { for (const f of [599, 600, 1199, 1200]) h[f] = sha((await s.renderFrame(f)).rgb); } finally { await s.close(); }
  const t = await session(); try { for (const f of [1200, 599, 1199, 600]) assert.equal(sha((await t.renderFrame(f)).rgb), h[f], `join frame ${f}`); } finally { await t.close(); }
});
test("P02-R07 particles and shutter blur change REAL browser pixels only under their predicates (character + world families); a view turn without landmarks is refused", async () => {
  const variant = (tag, fn) => { const p = J(PLAN); fn(p); const f = path.join(FILM, "handoff", `MOTION_PLAN_VARIANT_${tag}.json`); fs.writeFileSync(f, JSON.stringify(p)); return f; };
  const noFx = variant("nofx", (p) => { p.effects = []; }), noBlur = variant("noblur", (p) => { p.motion_blur = []; }), worldBlur = variant("worldblur", (p) => { p.motion_blur = [...p.motion_blur, { frames: [3800, 3810], shutter: 0.5, samples: 4 }]; });
  const px = async (planFile, f) => { const s = await createChromeFrameSession({ film: FILM, planFile, runType: "DIAGNOSTIC" }); try { return sha((await s.renderFrame(f)).rgb); } finally { await s.close(); } };
  assert.notEqual(await px(PLAN, 1000), await px(noFx, 1000), "dust particles (1000 in [600,2400)) change pixels");
  assert.equal(await px(PLAN, 3000), await px(noFx, 3000), "outside the effect interval the effect has no pixels");
  const blurMoving = variant("blurmoving", (p) => { p.motion_blur = [{ frames: [350, 360], shutter: 0.5, samples: 4 }]; }), blurHeld = variant("blurheld", (p) => { p.motion_blur = [{ frames: [2500, 2510], shutter: 0.5, samples: 4 }]; });
  assert.notEqual(await px(blurMoving, 355), await px(noBlur, 355), "shutter blur on the MOVING elbow (300→420 key) changes pixels");
  assert.equal(await px(blurHeld, 2505), await px(noBlur, 2505), "blur over a fully STATIC interval (joints at rest after 600, no particles, static camera) changes nothing (no ghost layer)");
  assert.notEqual(await px(worldBlur, 3805), await px(PLAN, 3805), "blur on the world push-in (unlike family) changes pixels");
  assert.equal(await px(worldBlur, 3600), await px(PLAN, 3600), "outside its interval, no blur");
  const st = (id, view, bind) => ({ id, view_facing: view, asset_bindings: bind }), rig = (mode) => ({ id: "r", pose_states: [st("a", "front", { h: "hand_front" }), st("b", "left", { h: "hand_left" })], view_states: [], allowed_state_edges: [{ from: "a", to: "b", mode, approved_assembly_review_id: "x" }] });
  const assets = (lmB) => new Map([["hand_front", { landmarks: { w: [0, 0], k: [1, 0], t: [0, 1] } }], ["hand_left", { landmarks: lmB }]]);
  assert.throws(() => validateStateEdge("a", "b", rig("ROTATE_FRONT"), assets({ w: [0, 0], k: [1, 0], t: [0, 1] })), (e) => !!e.code, "a rotated front image is never a side view");
  assert.throws(() => validateStateEdge("a", "b", rig("REGISTERED_SWAP"), assets({ q: [0, 0] })), (e) => !!e.code, "a side cel sharing < 3 measured landmarks is refused");
  assert.equal(validateStateEdge("a", "b", rig("REGISTERED_SWAP"), assets({ w: [0, 0], k: [1, 0], t: [0, 1] })).mode, "REGISTERED_SWAP", "an approved side cel sharing 3 measured landmarks passes");
});
