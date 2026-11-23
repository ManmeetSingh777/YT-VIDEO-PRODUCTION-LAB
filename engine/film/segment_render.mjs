// Segmented, bounded-memory, resumable film rendering (P02 directive F073/F074/F075; F058/F059/F066/F071/F072).
// Renderers are ASYNC SESSIONS: createSession(args) → {renderFrame(f) → Promise<{rgb, state_sha}>, close(), width, height, info}.
// Each frame is rendered, validated (exact width*height*3 RGB24), hashed, defect-scanned, written to the chunk's lossless FFV1 encoder with
// back-pressure and RELEASED — only hashes stay in memory. A chunk becomes complete only after ffprobe proves its exact frame count, size and
// rate; then its receipt is written atomically. A restart reuses only verified complete chunks of the same revision/renderer/seed and
// regenerates any other chunk from its first absolute frame. The final MP4 is assembled from the verified chunks, probed, and published
// atomically; only then RENDER_COMPLETION_RECEIPT.json is written — by this path and no other. Any failure kills child processes, closes the
// session and leaves no success receipt and no half-published film.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { spawn, execFileSync } from "node:child_process";
import { err } from "../art_bridge/errors.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
/** registered renderers. DIAGNOSTIC renderers can NEVER yield a production pass, whatever labels say. */
export const RENDERERS = {
  diagnostic_flat: { module: "engine/film/segment_render.mjs", export: "diagnosticFlatSession", provenance: "DIAGNOSTIC_ONLY" },
  art_bridge_chrome_frames: { module: "engine/film/chrome_frames.mjs", export: "createChromeFrameSession", provenance: "ART_BRIDGE_CAPTURE" },
};
export const rendererSourceSha = (id) => fsha(path.join(REPO, RENDERERS[id].module));
/** diagnosticFlatSession — NATIVE-resolution labelled diagnostic pattern (frame index + seed); no scaling path exists */
export async function diagnosticFlatSession({ width = 1920, height = 1080, seed = 1, blackAt = null, frozenFrom = null, holdState = false } = {}) { // holdState: a DECLARED hold (expected state also holds) vs frozenFrom alone (frozen substitution)
  const row = Buffer.allocUnsafe(width * 3);
  return { width, height, info: { renderer: "diagnostic_flat", provenance: "DIAGNOSTIC_ONLY" }, async close() {},
    async renderFrame(f) { const g = frozenFrom !== null && f >= frozenFrom ? frozenFrom : f, b = Buffer.allocUnsafe(width * height * 3);
      if (blackAt === f) { b.fill(0); return { rgb: b, state_sha: sha(`flat:${seed}:${f}`) }; }
      for (let x = 0; x < width; x++) { row[x * 3] = (g * 7 + seed) & 255; row[x * 3 + 1] = (x * 13 + seed) & 255; row[x * 3 + 2] = ((g >> 3) + (x >> 4)) & 255; }
      for (let y = 0; y < height; y++) row.copy(b, y * width * 3); return { rgb: b, state_sha: sha(`flat:${seed}:${holdState ? g : f}`) }; } };
}
export async function openSession(renderer, args) { const R = RENDERERS[renderer]; if (!R) throw err("RENDER_RECEIPT_INVALID", { reason: `renderer ${renderer} is not registered` }); const m = await import(url.pathToFileURL(path.join(REPO, R.module))); return m[R.export](args); }
export const planChunks = (total, size) => { const out = []; for (let s = 0; s < total; s += size) out.push([s, Math.min(total, s + size)]); return out; };
/** frameDefects(rgb, {width,height}) — black frame, magenta sentinel (missing art / uncovered camera footprint), uncovered EDGE (sentinel on the border rows/cols) */
export function frameDefects(b, { width = null, height = null } = {}) {
  let black = true, sentinel = 0; for (let i = 0; i + 2 < b.length; i += 3) { if (b[i] || b[i + 1] || b[i + 2]) black = false; if (b[i] === 255 && b[i + 1] === 0 && b[i + 2] === 255) sentinel++; }
  if (black) return { kind: "BLACK_FRAME" };
  if (sentinel && width && height) { let edge = 0; const px = (x, y) => { const i = (y * width + x) * 3; return b[i] === 255 && b[i + 1] === 0 && b[i + 2] === 255; }; for (let x = 0; x < width; x++) { if (px(x, 0)) edge++; if (px(x, height - 1)) edge++; } for (let y = 0; y < height; y++) { if (px(0, y)) edge++; if (px(width - 1, y)) edge++; } if (edge) return { kind: "UNCOVERED_EDGE", count: edge, sentinel }; }
  return sentinel ? { kind: "SENTINEL_PIXELS", count: sentinel } : null;
}
/** renderChunk(session, [s,e], {write, onFrame, retries, crashAt}) — async, one frame in memory at a time; frozen-motion detection:
 *  if the scene's expected state changed (state_sha differs) but the pixels did not, the renderer dropped motion (FROZEN_FRAME). */
export async function renderChunk(session, [s, e], { write = null, retries = 1, crashAt = null, prev = null } = {}) {
  const hashes = [], defects = [], stateHashes = []; let lastRgb = prev?.rgb_sha ?? null, lastState = prev?.state_sha ?? null;
  for (let f = s; f < e; f++) {
    let out = null;
    for (let a = 0; a <= retries; a++) { try { if (crashAt && crashAt.frame === f && crashAt.attempts-- > 0) throw Object.assign(new Error(`injected crash at frame ${f}`), { transient: !!crashAt.transient }); out = await session.renderFrame(f); break; }
      catch (x) { if (!x.transient || a === retries) throw x.code ? x : err("RENDER_CAPTURE_FAILURE", { frame_range: [f, f + 1], reason: `frame ${f}: ${x.message}`, producer: "engine/film/segment_render.mjs#renderChunk", resume_at: `CHUNK_${s}` }); } }
    if (!Buffer.isBuffer(out?.rgb) || out.rgb.length !== session.width * session.height * 3) throw err("IMAGE_DIMENSION_MISMATCH", { frame_range: [f, f + 1], reason: `frame ${f} buffer ${out?.rgb?.length} ≠ ${session.width}x${session.height}x3 RGB24 (PNG bytes or tiny frames are refused)`, producer: "engine/film/segment_render.mjs#renderChunk" });
    const h = sha(out.rgb), d = frameDefects(out.rgb, session); if (d) defects.push({ frame: f, ...d });
    if (lastState !== null && out.state_sha !== lastState && h === lastRgb) defects.push({ frame: f, kind: "FROZEN_FRAME", reason: "expected scene state changed but the rendered pixels are identical to the previous frame" });
    hashes.push(h); stateHashes.push(out.state_sha); lastRgb = h; lastState = out.state_sha;
    if (write) await write(out.rgb); // the buffer reference is dropped after this iteration
  }
  return { frames: [s, e], hashes, state_hashes: stateHashes, chunk_sha256: sha(hashes.join("")), defects, last: { rgb_sha: lastRgb, state_sha: lastState } };
}
/** remove a partial segment after its writer exited (Windows may hold the handle briefly; a lingering partial must never mask the typed failure) */
function rmRetry(f) { for (let i = 0; i < 20; i++) { try { fs.rmSync(f, { force: true }); return; } catch (x) { if (x.code !== "EBUSY" && x.code !== "EPERM") throw x; Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 50); } } }
function encoder(tmp, { width, height, fps }) {
  const ff = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", `${width}x${height}`, "-r", String(fps), "-i", "pipe:0", "-c:v", "ffv1", "-level", "3", "-g", "1", "-slicecrc", "1", "-f", "matroska", tmp], { stdio: ["pipe", "ignore", "pipe"] });
  let e = ""; ff.stderr.on("data", (d) => (e += d)); const done = new Promise((ok, no) => ff.on("close", (c) => (c === 0 ? ok() : no(new Error(`ffmpeg ${c}: ${e.slice(0, 300)}`))))); done.catch(() => {});
  return { ff, done, write: (buf) => new Promise((ok, no) => { if (ff.stdin.destroyed) return no(new Error("encoder closed")); ff.stdin.write(buf, (x) => (x ? no(x) : ok())); }), kill: () => { try { ff.stdin.destroy(); } catch {} ff.kill("SIGKILL"); }, exited: new Promise((ok) => (ff.exitCode !== null || ff.signalCode !== null ? ok() : ff.once("close", ok))) };
}
export function probeMp4(file) {
  const v = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,duration", "-show_entries", "format=duration", "-of", "json", file], { encoding: "utf8" }));
  const vs = v.streams.find((s) => s.codec_type === "video"), as = v.streams.find((s) => s.codec_type === "audio");
  return { codec: vs?.codec_name, width: vs?.width, height: vs?.height, r_frame_rate: vs?.r_frame_rate, frames: +vs?.nb_read_frames, video_duration: +(vs?.duration ?? v.format.duration), audio_duration: as ? +(as.duration ?? v.format.duration) : null };
}
const writeAtomic = (f, data) => { const t = `${f}.tmp-${process.pid}-${crypto.randomBytes(3).toString("hex")}`; fs.writeFileSync(t, data); fs.renameSync(t, f); };
/** renderFilm — chunked capture → verified FFV1 segments → final MP4 → completion receipt. inject: {crashAt:{frame,attempts,transient}, failEncodeChunk, failAssemble} for crash tests */
export async function renderFilm({ film, revision, renderer = "diagnostic_flat", rendererArgs = {}, total = 7200, fps = 60, chunkSize = 600, width = 1920, height = 1080, audio = null, outName = "film.mp4", seed = 1, inject = {}, onChunk = null }) {
  const FILM = path.resolve(film), R = RENDERERS[renderer]; if (!R) throw err("RENDER_RECEIPT_INVALID", { reason: `renderer ${renderer} is not registered` });
  const dir = path.join(FILM, "render"), key = { revision: revision.digest, renderer, renderer_source_sha256: rendererSourceSha(renderer), seed, width, height, fps, renderer_args: rendererArgs }, keySha = sha(JSON.stringify(key)), chunksDir = path.join(dir, "chunks", keySha.slice(0, 16));
  fs.mkdirSync(chunksDir, { recursive: true });
  const session = await openSession(renderer, { ...rendererArgs, film: FILM, seed, fps, width, height });
  if (session.width !== width || session.height !== height) { await session.close(); throw err("IMAGE_DIMENSION_MISMATCH", { reason: `renderer session ${session.width}x${session.height} ≠ film ${width}x${height}` }); }
  const receipts = [], mem = [], live = new Set(); let prev = null;
  try {
    for (const ch of planChunks(total, chunkSize)) {
      const base = path.join(chunksDir, `chunk_${String(ch[0]).padStart(5, "0")}_${String(ch[1]).padStart(5, "0")}`), rcF = `${base}.json`, mkv = `${base}.mkv`;
      if (fs.existsSync(rcF) && fs.existsSync(mkv)) { const rc = JSON.parse(fs.readFileSync(rcF, "utf8")); if (rc.key_sha256 === keySha && rc.mkv_sha256 === fsha(mkv)) { receipts.push({ ...rc, reused: true }); prev = rc.last; continue; } }
      for (const x of [mkv, rcF]) fs.rmSync(x, { force: true }); // an unverified or stale chunk is discarded and regenerated from its FIRST frame
      const tmp = `${base}.tmp-${process.pid}.mkv`, enc = encoder(tmp, { width, height, fps }); live.add(enc);
      let r; try { r = await renderChunk(session, ch, { write: (b) => { if (inject.failEncodeChunk === ch[0]) { enc.kill(); inject.failEncodeChunk = null; } return enc.write(b); }, crashAt: inject.crashAt, prev }); enc.ff.stdin.end(); await enc.done; }
      catch (e) { enc.kill(); await enc.exited; rmRetry(tmp); throw e.code ? e : err("RENDER_CAPTURE_FAILURE", { frame_range: ch, reason: e.message, producer: "engine/film/segment_render.mjs#renderFilm", resume_at: `CHUNK_${ch[0]}` }); } finally { live.delete(enc); }
      const p = probeMp4(tmp); if (p.frames !== ch[1] - ch[0] || p.width !== width || p.height !== height || p.r_frame_rate !== `${fps}/1`) { fs.rmSync(tmp, { force: true }); throw err("RENDER_CAPTURE_FAILURE", { frame_range: ch, reason: `segment probe ${JSON.stringify(p)} does not match ${ch[1] - ch[0]} frames ${width}x${height}@${fps}` }); }
      fs.renameSync(tmp, mkv); const rc = { key_sha256: keySha, key, frames: ch, hashes: r.hashes, state_hashes: r.state_hashes, chunk_sha256: r.chunk_sha256, defects: r.defects, mkv: path.relative(FILM, mkv).split(path.sep).join("/"), mkv_sha256: fsha(mkv), probe: p, last: r.last, rss_bytes: process.memoryUsage().rss };
      writeAtomic(rcF, JSON.stringify(rc, null, 1)); receipts.push(rc); prev = r.last; mem.push({ chunk: ch, node_rss: process.memoryUsage().rss, heap: process.memoryUsage().heapUsed }); onChunk?.(rc);
    }
  } finally { for (const e of live) e.kill(); await session.close(); }
  // assemble: verified chunks in order → final MP4 (exact cadence) + supplied audio → probe → atomic publish
  const list = path.join(chunksDir, "concat.txt"); fs.writeFileSync(list, receipts.map((r) => `file '${path.join(FILM, r.mkv).replace(/\\/g, "/")}'`).join("\n"));
  const tmp = path.join(dir, `.${outName}.tmp-${process.pid}.mp4`), final = path.join(dir, outName);
  try { if (inject.failAssemble) throw new Error("injected assembly failure");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", list, ...(audio ? ["-i", audio] : []), "-map", "0:v:0", ...(audio ? ["-map", "1:a:0", "-c:a", "aac", "-shortest"] : []), "-c:v", "libx264", "-preset", "ultrafast", "-crf", "12", "-pix_fmt", "yuv420p", "-r", String(fps), "-frames:v", String(total), tmp]); }
  catch (e) { fs.rmSync(tmp, { force: true }); throw err("RENDER_CAPTURE_FAILURE", { reason: `final assembly failed: ${e.message.slice(0, 200)}`, producer: "engine/film/segment_render.mjs#renderFilm", resume_at: "ASSEMBLE" }); }
  const probe = probeMp4(tmp); fs.renameSync(tmp, final);
  const manifest = { revision: revision.digest, key_sha256: keySha, renderer, renderer_provenance: R.provenance, renderer_module: R.module, renderer_source_sha256: key.renderer_source_sha256, renderer_args: rendererArgs, session_info: session.info, seed, total, fps, width, height, chunk_size: chunkSize,
    chunks: receipts.map((r) => ({ frames: r.frames, chunk_sha256: r.chunk_sha256, mkv: r.mkv, mkv_sha256: r.mkv_sha256, defects: r.defects, reused: !!r.reused })), memory: mem };
  const mf = path.join(dir, "FRAME_MANIFEST.json"); writeAtomic(mf, JSON.stringify(manifest, null, 1));
  const receipt = { produced_by: "engine/film/segment_render.mjs#renderFilm", revision: revision.digest, frame_manifest: "render/FRAME_MANIFEST.json", frame_manifest_sha256: fsha(mf), mp4: path.relative(FILM, final).split(path.sep).join("/"), mp4_sha256: fsha(final), probe, renderer, renderer_provenance: R.provenance, renderer_source_sha256: key.renderer_source_sha256, audio_sha256: audio ? fsha(audio) : null, completed_at: new Date().toISOString() };
  writeAtomic(path.join(dir, "RENDER_COMPLETION_RECEIPT.json"), JSON.stringify(receipt, null, 1));
  return receipt;
}
/** verifyRenderReceipt(FILM, revision, {samples, seededSamples}) — async; authenticates the engine receipt and files, rejects a changed renderer
 *  implementation / failed defect scan / stale revision / missing segment, and RE-RENDERS chunk-boundary + final + seeded random frames on a
 *  FRESH session. Matching hashes prove reproducibility, never visual quality. */
export async function verifyRenderReceipt(FILM, revision, { samples = null, seededSamples = 3, rendererArgs = null } = {}) {
  const f = path.join(FILM, "render", "RENDER_COMPLETION_RECEIPT.json"), why = [];
  if (!fs.existsSync(f)) return { ok: false, reasons: ["no render-completion receipt (a CLI source claim is not a render)"] };
  const r = JSON.parse(fs.readFileSync(f, "utf8"));
  if (r.produced_by !== "engine/film/segment_render.mjs#renderFilm") why.push("receipt not produced by the render completion path");
  if (r.revision !== revision.digest) why.push("receipt was rendered from a different film revision (stale)");
  const mf = path.join(FILM, r.frame_manifest || ""), mp4 = path.join(FILM, r.mp4 || "");
  if (!fs.existsSync(mf) || fsha(mf) !== r.frame_manifest_sha256) why.push("frame manifest missing or changed");
  if (!fs.existsSync(mp4) || fsha(mp4) !== r.mp4_sha256) why.push("MP4 missing or changed after the render");
  if (!RENDERERS[r.renderer]) why.push(`renderer ${r.renderer} not registered`); else if (rendererSourceSha(r.renderer) !== r.renderer_source_sha256) why.push("renderer implementation changed since the render");
  if (why.length) return { ok: false, reasons: why, receipt: r };
  const m = JSON.parse(fs.readFileSync(mf, "utf8"));
  for (const c of m.chunks) { const seg = path.join(FILM, c.mkv); if (!fs.existsSync(seg) || fsha(seg) !== c.mkv_sha256) why.push(`segment ${c.mkv} missing or changed`); for (const d of c.defects || []) why.push(`frame ${d.frame}: ${d.kind}`); }
  if (why.length) return { ok: false, reasons: why, receipt: r };
  const bounds = []; for (const c of m.chunks) { if (c.frames[0] > 0) bounds.push(c.frames[0] - 1, c.frames[0]); } bounds.push(0, m.total - 1);
  let rnd = (m.seed * 2654435761) >>> 0; for (let i = 0; i < seededSamples; i++) { rnd = (Math.imul(rnd, 1103515245) + 12345) >>> 0; bounds.push(rnd % m.total); }
  const pick = [...new Set(samples ?? bounds)].filter((x) => x >= 0 && x < m.total).sort((a, b) => a - b);
  const session = await openSession(m.renderer, { ...(rendererArgs || m.renderer_args), film: FILM, seed: m.seed, fps: m.fps, width: m.width, height: m.height });
  try { for (const s of pick) { const c = m.chunks.find((x) => x.frames[0] <= s && s < x.frames[1]), cr = JSON.parse(fs.readFileSync(path.join(FILM, c.mkv.replace(/\.mkv$/, ".json")), "utf8")), got = sha((await session.renderFrame(s)).rgb); if (cr.hashes[s - c.frames[0]] !== got) why.push(`frame ${s} does not re-render identically on a fresh session`); } }
  finally { await session.close(); }
  return { ok: why.length === 0, reasons: why, receipt: r, resampled: pick };
}
