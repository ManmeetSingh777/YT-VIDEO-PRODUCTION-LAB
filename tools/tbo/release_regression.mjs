#!/usr/bin/env node
// Release regression runner with a storage guard. It replaces the ad-hoc run.sh after release regression 1488502 (2026-11-26) filled drive C:
// mid-suite: 41 tests failed with ENOSPC before their assertions ran, and the run then carried on through every later stage.
//
//   node tools/tbo/release_regression.mjs --worktree W --out O [--cache C] [--concurrency 3] [--files a.test.mjs,b.test.mjs]
//        [--test-name-pattern RE] [--stages suite,p03_neg,p05_neg,p05_chain] [--estimate-gb N] [--margin 0.25] [--stop-floor-gb 8]
//        [--preflight-only] [--record-history]
//
// PREFLIGHT measures free space on every volume the run writes to: worktree, out, chunk cache and test temp. The estimate is the peak usage
// actually measured on earlier runs (tools/tbo/REGRESSION_STORAGE_HISTORY.json; concurrent test outputs are included because the peak is
// measured as a drop in free space). The run starts only if free space ≥ estimate × (1 + margin) + stop floor. Otherwise it is REFUSED and
// nothing runs. --estimate-gb is an operator override and is recorded as one.
// WATCHDOG samples free space every few seconds and tails the TAP. If free space falls below the stop floor, or the TAP shows a storage error
// (ENOSPC / "not enough space on the disk" / WinError 112), the whole process tree is killed and the run is marked INCOMPLETE_STORAGE. No
// later stage starts, so one shortage cannot become dozens of misleading failures.
// RECLAIM: tests run with TBO_RECLAIM_WORK=1 (tests/_lib/work_storage.mjs reclaims rendered segments and negative copies only after their
// assertions passed). The test temp directory (isolatedWork) lives under OUT/tmp on the measured volume and is removed once the suite's TAP is
// saved. REUSE: the content-addressed chunk cache hard-links segments (engine/film/segment_render.mjs#placeImmutable). Keep the cache on the
// worktree's volume; a cache on another volume works but copies the segments.
// Nothing here weakens an assertion: the same test files and stage scripts run; only where bytes live and when disposable ones are removed change.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { spawn, execFileSync } from "node:child_process"; import crypto from "node:crypto";
const HERE = path.dirname(url.fileURLToPath(import.meta.url)), HISTORY = path.join(HERE, "REGRESSION_STORAGE_HISTORY.json");
const GB = 1024 ** 3, gb = (b) => Math.round((b / GB) * 10) / 10, now = () => new Date().toISOString();
export const DEFAULT_SUITE = ["tests/art_bridge/*.test.mjs", "tests/p02/*.test.mjs", "tests/p03/*.test.mjs", "tests/p04/*.test.mjs", "tests/p05/*.test.mjs", "tests/tbo/*.test.mjs", "tests/p08/*.test.mjs"];
export const STAGES = {
  p03_neg: (O) => ["tests/p03/run_clips.mjs", "--only", "negatives", "--out", path.join(O, "p03_chrome_negatives")],
  p05_neg: (O) => ["tests/p05/run_packet_negatives.mjs", "--out", path.join(O, "p05_render_negatives")],
  p05_chain: (O) => ["tests/p05/run_packet_chain.mjs", "--out", path.join(O, "p05_chain")],
};
export const STORAGE_ERROR = /ENOSPC|not enough space on the disk|WinError 112|No space left on device/i;
export const freeBytes = (p) => { let d = path.resolve(p); while (!fs.existsSync(d)) d = path.dirname(d); const s = fs.statfsSync(d); return Number(s.bavail) * Number(s.bsize); };
export const volumeOf = (p) => (process.platform === "win32" ? path.parse(path.resolve(p)).root.toUpperCase() : (() => { let d = path.resolve(p); while (!fs.existsSync(d)) d = path.dirname(d); return String(fs.statSync(d).dev); })());
export const readHistory = (file = HISTORY) => (fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf8")) : { runs: [] });

/** estimate(history, scope) → {bytes, basis}: the largest measured peak for this scope ("full" or "targeted"); a targeted run with no
 *  measurement of its own falls back to the largest full-suite peak (conservative). A lower-bound sample counts at its measured value. */
export function estimatePeak(history, scope) {
  const runs = history.runs.filter((r) => Number.isFinite(r.peak_bytes));
  const own = runs.filter((r) => r.scope === scope), pool = own.length ? own : runs.filter((r) => r.scope === "full");
  if (!pool.length) return { bytes: null, basis: "no measured run" };
  const top = pool.reduce((a, b) => (b.peak_bytes > a.peak_bytes ? b : a));
  return { bytes: top.peak_bytes, basis: `${own.length ? scope : "full-suite fallback"} peak of run ${top.revision?.slice(0, 7)} on ${top.date}${top.lower_bound ? " (lower bound: that run exhausted its disk)" : ""}` };
}
/** preflight({paths, estimateBytes, margin, stopFloorBytes}) → {ok, volumes, required_bytes, reasons} (pure apart from statfs) */
export function preflight({ paths, estimateBytes, margin = 0.25, stopFloorBytes = 8 * GB, freeOf = freeBytes }) {
  const reasons = [], vols = new Map();
  for (const [role, p] of Object.entries(paths)) { const v = volumeOf(p); if (!vols.has(v)) vols.set(v, { volume: v, roles: [], free_bytes: freeOf(p) }); vols.get(v).roles.push(role); }
  if (!Number.isFinite(estimateBytes) || estimateBytes <= 0) reasons.push("no storage estimate: no earlier run is measured and no --estimate-gb override was given");
  const required = Number.isFinite(estimateBytes) ? Math.ceil(estimateBytes * (1 + margin) + stopFloorBytes) : null;
  // the whole estimate is charged to the worktree's volume (test outputs live there); other volumes must keep at least the stop floor
  const wv = volumeOf(paths.worktree);
  for (const v of vols.values()) { const need = v.volume === wv ? required : stopFloorBytes; v.required_bytes = need; if (need !== null && v.free_bytes < need) reasons.push(`volume ${v.volume} (${v.roles.join(", ")}) has ${gb(v.free_bytes)} GB free; needs ${gb(need)} GB`); }
  const warnings = paths.cache && volumeOf(paths.cache) !== wv ? ["the chunk cache is on another volume than the worktree: cache hits will COPY segments instead of hard-linking them"] : [];
  return { ok: reasons.length === 0, required_bytes: required, volumes: [...vols.values()], reasons, warnings };
}

const killTree = (pid) => { try { if (process.platform === "win32") execFileSync("taskkill", ["/PID", String(pid), "/T", "/F"], { stdio: "ignore" }); else process.kill(-pid, "SIGKILL"); } catch { /* already gone */ } };
/** runGuarded(cmd, args, {cwd, env, stdout, stderr, watch, stopFloorBytes, intervalMs, tapFile}) → {exit, storage_stop, min_free_bytes} */
export function runGuarded(cmd, args, { cwd, env, stdout, stderr, watch, stopFloorBytes, intervalMs = 5000, tapFile = stdout, freeOf = freeBytes }) {
  return new Promise((resolve) => {
    const out = fs.openSync(stdout, "w"), err = fs.openSync(stderr, "w");
    const child = spawn(cmd, args, { cwd, env, stdio: ["ignore", out, err], detached: process.platform !== "win32", windowsHide: true });
    let stop = null, min = Infinity, tapPos = 0;
    const check = () => {
      for (const p of watch) { const f = freeOf(p); min = Math.min(min, f); if (!stop && f < stopFloorBytes) stop = { reason: "FREE_SPACE_BELOW_STOP_FLOOR", path: p, free_bytes: f, at: now() }; }
      if (!stop && tapFile && fs.existsSync(tapFile)) { const size = fs.statSync(tapFile).size; if (size > tapPos) { const fd = fs.openSync(tapFile, "r"), b = Buffer.alloc(Math.min(size - tapPos, 4 << 20)); fs.readSync(fd, b, 0, b.length, tapPos); fs.closeSync(fd); tapPos += b.length; const m = STORAGE_ERROR.exec(b.toString("utf8")); if (m) stop = { reason: "STORAGE_ERROR_IN_OUTPUT", match: m[0], at: now() }; } }
      if (stop && !child.killed) { killTree(child.pid); child.killed = true; }
    };
    const timer = setInterval(check, intervalMs); check();
    child.on("exit", (code) => { clearInterval(timer); check(); fs.closeSync(out); fs.closeSync(err); resolve({ exit: code, storage_stop: stop, min_free_bytes: min }); });
  });
}

function args(argv) { const o = {}; for (let i = 0; i < argv.length; i++) { const a = argv[i]; if (!a.startsWith("--")) continue; const k = a.slice(2), v = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[++i] : true; o[k] = v; } return o; }
async function main() {
  const A = args(process.argv.slice(2)); if (!A.worktree || !A.out) { console.error("usage: --worktree W --out O [...]"); process.exit(2); }
  const W = path.resolve(A.worktree), O = path.resolve(A.out), C = path.resolve(A.cache || path.join(O, "chunk_cache")), TMP = path.join(O, "tmp");
  const files = A.files ? String(A.files).split(",") : DEFAULT_SUITE, scope = A.files || A["test-name-pattern"] ? "targeted" : "full";
  const stages = String(A.stages || (scope === "full" ? "suite,p03_neg,p05_neg,p05_chain" : "suite")).split(",");
  const margin = Number(A.margin ?? 0.25), stopFloor = Number(A["stop-floor-gb"] ?? 8) * GB, hist = readHistory();
  const est = A["estimate-gb"] ? { bytes: Number(A["estimate-gb"]) * GB, basis: `OPERATOR OVERRIDE --estimate-gb ${A["estimate-gb"]}` } : estimatePeak(hist, scope);
  fs.mkdirSync(O, { recursive: true });
  const pre = preflight({ paths: { worktree: W, out: O, cache: C, tmp: TMP }, estimateBytes: est.bytes, margin, stopFloorBytes: stopFloor });
  const run = { runner: "tools/tbo/release_regression.mjs", started: now(), worktree: W, revision: execFileSync("git", ["-C", W, "rev-parse", "HEAD"], { encoding: "utf8" }).trim(), dirty: execFileSync("git", ["-C", W, "status", "--short"], { encoding: "utf8" }).split("\n").filter(Boolean),
    node: process.version, nu_js_sha256: crypto.createHash("sha256").update(fs.readFileSync(path.join(W, "engine", "runtime", "nu.js"))).digest("hex"), scope, files, test_name_pattern: A["test-name-pattern"] || null, stages,
    storage: { estimate_bytes: est.bytes, estimate_basis: est.basis, margin, stop_floor_bytes: stopFloor, preflight: pre }, results: [] };
  const save = () => fs.writeFileSync(path.join(O, "RUN.json"), JSON.stringify(run, null, 1));
  console.log(`preflight: ${pre.ok ? "OK" : "REFUSED"}; estimate ${gb(est.bytes ?? NaN)} GB (${est.basis}); ${pre.volumes.map((v) => `${v.volume} free ${gb(v.free_bytes)} GB / needs ${gb(v.required_bytes ?? NaN)} GB`).join("; ")}`);
  for (const w of pre.warnings) console.log(`warning: ${w}`); for (const r of pre.reasons) console.log(`refused: ${r}`);
  if (!pre.ok) { run.outcome = "REFUSED_PREFLIGHT"; run.ended = now(); save(); process.exit(3); }
  if (A["preflight-only"]) { run.outcome = "PREFLIGHT_ONLY"; run.ended = now(); save(); return; }
  fs.rmSync(C, { recursive: true, force: true }); fs.mkdirSync(TMP, { recursive: true }); // the cache is FRESH per run; injected failures bypass it
  const env = { ...process.env, TBO_RENDER_CHUNK_CACHE: C, TBO_RECLAIM_WORK: "1", TMP, TEMP: TMP, TMPDIR: TMP };
  const watch = [...new Set([W, O, C, TMP].map(volumeOf))].map((v) => [W, O, C, TMP].find((p) => volumeOf(p) === v));
  const startFree = freeBytes(W); let minFree = startFree; run.storage.start_free_bytes = startFree; save();
  for (const st of stages) {
    const t0 = now(), isSuite = st === "suite";
    const [cmd, argv, stdout] = isSuite ? [process.execPath, ["--test", "--test-reporter=tap", `--test-concurrency=${A.concurrency || 3}`, ...(A["test-name-pattern"] ? [`--test-name-pattern=${A["test-name-pattern"]}`] : []), ...files], path.join(O, "FINAL_ENGINEERING_TAP.tap")]
      : [process.execPath, STAGES[st](O), path.join(O, `${st}.log`)];
    if (!isSuite && !STAGES[st]) throw new Error(`unknown stage ${st}`);
    const r = await runGuarded(cmd, argv, { cwd: W, env, stdout, stderr: isSuite ? path.join(O, "suite_stderr.txt") : `${stdout}.stderr`, watch, stopFloorBytes: stopFloor, tapFile: stdout });
    minFree = Math.min(minFree, r.min_free_bytes);
    const rec = { stage: st, started: t0, ended: now(), exit: r.exit, storage_stop: r.storage_stop, min_free_bytes: r.min_free_bytes };
    if (isSuite && fs.existsSync(stdout)) { const tap = fs.readFileSync(stdout, "utf8"), n = (re) => Number((re.exec(tap) || [])[1] ?? NaN); rec.tap = { tests: n(/^# tests (\d+)/m), pass: n(/^# pass (\d+)/m), fail: n(/^# fail (\d+)/m), cancelled: n(/^# cancelled (\d+)/m) }; }
    run.results.push(rec); save();
    if (isSuite) fs.rmSync(TMP, { recursive: true, force: true, maxRetries: 5, retryDelay: 500 }); // TAP saved → isolatedWork outputs are disposable
    console.log(`${st}: exit ${r.exit}${r.storage_stop ? ` STORAGE STOP (${r.storage_stop.reason})` : ""}; min free ${gb(r.min_free_bytes)} GB`);
    if (r.storage_stop) { run.outcome = "INCOMPLETE_STORAGE"; break; }
  }
  run.storage.min_free_bytes = minFree; run.storage.peak_bytes = startFree - minFree; run.storage.cache_bytes = (() => { let s = 0; const walk = (d) => { if (!fs.existsSync(d)) return; for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else s += fs.statSync(p).size; } }; walk(C); return s; })();
  run.outcome ||= run.results.every((x) => x.exit === 0) ? "COMPLETE_PASS" : "COMPLETE_WITH_FAILURES"; run.ended = now(); save();
  const sample = { revision: run.revision, date: run.started.slice(0, 10), scope, files: scope === "targeted" ? files : undefined, peak_bytes: run.storage.peak_bytes, lower_bound: run.outcome === "INCOMPLETE_STORAGE", outcome: run.outcome, source: path.join(O, "RUN.json") };
  fs.writeFileSync(path.join(O, "STORAGE_SAMPLE.json"), JSON.stringify(sample, null, 1));
  if (A["record-history"]) { hist.runs.push(sample); fs.writeFileSync(HISTORY, JSON.stringify(hist, null, 1)); }
  console.log(`outcome ${run.outcome}; peak ${gb(run.storage.peak_bytes)} GB`); process.exit(run.outcome === "COMPLETE_PASS" ? 0 : run.outcome === "INCOMPLETE_STORAGE" ? 75 : 1);
}
if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)) main();
