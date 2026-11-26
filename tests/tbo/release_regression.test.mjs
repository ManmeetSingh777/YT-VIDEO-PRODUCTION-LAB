// Storage guard for the release regression (after 1488502 filled drive C: and 41 tests failed with ENOSPC before their assertions ran).
// Covers: preflight refusal from measured history; watchdog stopping the process tree on a storage error or a low-space reading; film copies that
// hard-link only immutable segments; reclaim only when enabled; and chunk-cache hits that link instead of duplicating, with tampering still refused.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { estimatePeak, preflight, runGuarded, STORAGE_ERROR } from "../../tools/tbo/release_regression.mjs";
import { copyFilmTree, reclaim, isImmutableSegment } from "../_lib/work_storage.mjs";
import { isolatedWork } from "../_lib/isolated_work.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), GB = 1024 ** 3;
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

test("REG-S1 preflight: the estimate is the largest MEASURED peak; too little free space refuses the run before anything starts", () => {
  const H = { runs: [{ revision: "aaaaaaa", date: "2026-11-25", scope: "full", peak_bytes: 60 * GB }, { revision: "1488502", date: "2026-11-26", scope: "full", peak_bytes: 91 * GB, lower_bound: true }, { revision: "b", date: "x", scope: "targeted", peak_bytes: 4 * GB }] };
  assert.equal(estimatePeak(H, "full").bytes, 91 * GB); assert.match(estimatePeak(H, "full").basis, /lower bound/);
  assert.equal(estimatePeak(H, "targeted").bytes, 4 * GB); assert.equal(estimatePeak({ runs: [H.runs[0]] }, "targeted").bytes, 60 * GB, "a targeted run with no measurement falls back to the full-suite peak");
  assert.equal(estimatePeak({ runs: [] }, "full").bytes, null);
  const W = isolatedWork("reg_s1"), paths = { worktree: W, out: path.join(W, "out"), cache: path.join(W, "out", "cache"), tmp: path.join(W, "out", "tmp") };
  const low = preflight({ paths, estimateBytes: 91 * GB, margin: 0.25, stopFloorBytes: 8 * GB, freeOf: () => 2 * GB });
  assert.equal(low.ok, false); assert.equal(low.required_bytes, Math.ceil(91 * GB * 1.25 + 8 * GB)); assert.match(low.reasons.join(" "), /2 GB free; needs 121\.8 GB/);
  assert.equal(preflight({ paths, estimateBytes: 91 * GB, freeOf: () => 200 * GB }).ok, true);
  assert.equal(preflight({ paths, estimateBytes: null, freeOf: () => 200 * GB }).ok, false, "no measurement and no override → refused, never guessed");
});

const child = (body) => { const d = isolatedWork("reg_child"), f = path.join(d, "c.mjs"); fs.writeFileSync(f, body); return { d, f }; };
test("REG-S2 watchdog: a storage error in the TAP, or free space under the stop floor, kills the whole process tree; a clean run is untouched", async () => {
  { const { d, f } = child(`import fs from "node:fs"; import { spawn } from "node:child_process";
      const g = spawn(process.execPath, ["-e", "setTimeout(()=>{}, 60000)"], { stdio: "ignore" }); fs.writeFileSync("grandchild.pid", String(g.pid)); // a grandchild, as node --test spawns per-file processes
      console.log("ok 1 - first"); setTimeout(() => console.log("# Error: ENOSPC: no space left on device, write"), 300); setTimeout(() => console.log("ok 2 - must never be reached"), 30000);`);
    const t0 = Date.now(), r = await runGuarded(process.execPath, [f], { cwd: d, env: process.env, stdout: path.join(d, "o.tap"), stderr: path.join(d, "e.txt"), watch: [d], stopFloorBytes: 1, intervalMs: 100 });
    assert.equal(r.storage_stop?.reason, "STORAGE_ERROR_IN_OUTPUT"); assert.ok(Date.now() - t0 < 20000, "stopped promptly"); assert.doesNotMatch(fs.readFileSync(path.join(d, "o.tap"), "utf8"), /must never be reached/);
    const gp = Number(fs.readFileSync(path.join(d, "grandchild.pid"), "utf8")); let alive = true; for (let i = 0; i < 50 && alive; i++) { try { process.kill(gp, 0); await new Promise((r) => setTimeout(r, 100)); } catch { alive = false; } } assert.equal(alive, false, "the grandchild died with the tree"); }
  { const { d, f } = child(`setTimeout(() => {}, 30000);`); let calls = 0;
    const r = await runGuarded(process.execPath, [f], { cwd: d, env: process.env, stdout: path.join(d, "o.tap"), stderr: path.join(d, "e.txt"), watch: [d], stopFloorBytes: 8 * GB, intervalMs: 100, freeOf: () => (++calls > 2 ? 1 * GB : 50 * GB) });
    assert.equal(r.storage_stop?.reason, "FREE_SPACE_BELOW_STOP_FLOOR"); assert.equal(r.min_free_bytes, 1 * GB); }
  { const { d, f } = child(`console.log("ok 1 - fine"); process.exit(0);`);
    const r = await runGuarded(process.execPath, [f], { cwd: d, env: process.env, stdout: path.join(d, "o.tap"), stderr: path.join(d, "e.txt"), watch: [d], stopFloorBytes: 1, intervalMs: 100 });
    assert.equal(r.storage_stop, null); assert.equal(r.exit, 0); }
  for (const s of ["ENOSPC: no space left on device", "There is not enough space on the disk.", "OSError: [WinError 112]"]) assert.match(s, STORAGE_ERROR);
  assert.doesNotMatch("ok 12 - P02-R04 a crash at chunk start/mid/end", STORAGE_ERROR);
});

test("REG-S3 copyFilmTree links ONLY immutable segments; a negative's edit of any other file never reaches the source; reclaim needs TBO_RECLAIM_WORK=1", () => {
  const W = isolatedWork("reg_s3"), src = path.join(W, "src"), seg = path.join(src, "render", "chunks", "k1", "chunk_00000_00600.mkv"), byIn = path.join(src, "render", "chunks", "by_input", "x.mkv");
  for (const [f, b] of [[seg, "segment"], [byIn, "stored"], [path.join(src, "render", "film.mp4"), "mp4"], [path.join(src, "handoff", "M.json"), "{}"], [path.join(src, "render", "chunks", "k1", "chunk_00000_00600.json"), "{}"]]) { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, b); }
  assert.ok(isImmutableSegment("render/chunks/k1/chunk_00000_00600.mkv")); assert.ok(!isImmutableSegment("render/chunks/by_input/chunk_00000_00600.mkv")); assert.ok(!isImmutableSegment("render/film.mp4"));
  const dst = path.join(W, "neg"), n = copyFilmTree(src, dst); assert.deepEqual(n, { linked: 1, copied: 4 });
  const a = fs.statSync(seg), b = fs.statSync(path.join(dst, "render", "chunks", "k1", "chunk_00000_00600.mkv")); assert.equal(a.ino, b.ino, "the segment is the same bytes on disk"); assert.ok(a.nlink >= 2);
  fs.appendFileSync(path.join(dst, "render", "film.mp4"), "X"); fs.appendFileSync(path.join(dst, "render", "chunks", "by_input", "x.mkv"), "X"); fs.writeFileSync(path.join(dst, "handoff", "M.json"), "[]");
  assert.equal(fs.readFileSync(path.join(src, "render", "film.mp4"), "utf8"), "mp4"); assert.equal(fs.readFileSync(byIn, "utf8"), "stored"); assert.equal(fs.readFileSync(path.join(src, "handoff", "M.json"), "utf8"), "{}");
  const filtered = path.join(W, "f"); copyFilmTree(src, filtered, { filter: (s) => !/[\\/]render$/.test(s) }); assert.ok(!fs.existsSync(path.join(filtered, "render")) && fs.existsSync(path.join(filtered, "handoff", "M.json")));
  const prev = process.env.TBO_RECLAIM_WORK; try { delete process.env.TBO_RECLAIM_WORK; assert.equal(reclaim(dst), false); assert.ok(fs.existsSync(dst), "kept without the runner flag");
    process.env.TBO_RECLAIM_WORK = "1"; assert.equal(reclaim(dst), true); assert.ok(!fs.existsSync(dst)); assert.equal(fs.readFileSync(seg, "utf8"), "segment", "removing a linked copy leaves the source segment"); }
  finally { if (prev === undefined) delete process.env.TBO_RECLAIM_WORK; else process.env.TBO_RECLAIM_WORK = prev; }
});

test("REG-S4 chunk cache: a hit HARD-LINKS the verified segment (no duplicate bytes); a tampered cache entry is never reused", async () => {
  const { renderFilm, verifyRenderReceipt } = await import("../../engine/film/segment_render.mjs"), { buildFilmRevision } = await import("../../engine/film/film_revision.mjs");
  const cand = ["rehearsal_J", "rehearsal_K"].map((r) => path.join(REPO, "hybrid_v2", "work", "p02", r, "rt", "film")).find((f) => fs.existsSync(path.join(f, "REHEARSAL_LABEL.txt")));
  let src = cand; if (!src) { const { buildRehearsalFilm } = await import("../p02/rehearsal_film.mjs"), b = isolatedWork("reg_s4_built"); await buildRehearsalFilm(b); src = path.join(b, "rt", "film"); }
  const W = isolatedWork("reg_s4"), cache = path.join(W, "cache"), mk = (tag) => { const d = path.join(W, tag); fs.cpSync(src, d, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(src, s)) }); return d; };
  const prev = process.env.TBO_RENDER_CHUNK_CACHE; process.env.TBO_RENDER_CHUNK_CACHE = cache;
  try {
    const args = (F) => ({ film: F, revision: buildFilmRevision(F), renderer: "diagnostic_flat", total: 120, chunkSize: 60, width: 320, height: 180, outName: "c.mp4" });
    const A = mk("A"); await renderFilm(args(A)); const B = mk("B"); await renderFilm(args(B));
    const mf = JSON.parse(fs.readFileSync(path.join(B, "render", "FRAME_MANIFEST.json"), "utf8")), keyDir = fs.readdirSync(cache)[0];
    assert.equal(mf.chunks.length, 2);
    for (const c of mf.chunks) { const rc = JSON.parse(fs.readFileSync(path.join(B, c.mkv.replace(/\.mkv$/, ".json")), "utf8")); assert.ok(rc.reused_from_cache, `${c.mkv} came from the cache`);
      const cached = path.join(cache, keyDir, `${c.frames[0]}_${c.frames[1]}.mkv`); assert.equal(fs.statSync(path.join(B, c.mkv)).ino, fs.statSync(cached).ino, "linked, not duplicated"); assert.equal(sha(path.join(B, c.mkv)), rc.mkv_sha256); }
    assert.equal((await verifyRenderReceipt(B, buildFilmRevision(B), {})).ok, true, "a linked render verifies like a rendered one");
    // tamper with a cache entry IN PLACE: it is never reused (sha256 on every read) and the next film renders its own bytes
    const victim = path.join(cache, keyDir, "0_60.mkv"); fs.rmSync(path.join(B, "render"), { recursive: true, force: true }); fs.rmSync(path.join(A, "render"), { recursive: true, force: true }); fs.appendFileSync(victim, Buffer.from([0]));
    const C = mk("C"); await renderFilm(args(C)); const rc0 = JSON.parse(fs.readFileSync(path.join(C, "render", JSON.parse(fs.readFileSync(path.join(C, "render", "FRAME_MANIFEST.json"), "utf8")).chunks[0].mkv.replace(/^render\//, "").replace(/\.mkv$/, ".json")), "utf8"));
    assert.ok(!rc0.reused_from_cache, "a cache entry whose bytes no longer match its receipt is never reused");
    assert.equal((await verifyRenderReceipt(C, buildFilmRevision(C), {})).ok, true);
  } finally { if (prev === undefined) delete process.env.TBO_RENDER_CHUNK_CACHE; else process.env.TBO_RENDER_CHUNK_CACHE = prev; }
});
