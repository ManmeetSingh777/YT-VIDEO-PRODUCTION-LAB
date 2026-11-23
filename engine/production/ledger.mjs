// Authoritative production ledger (P02 directive F080/F085/F086 + the run-checklist requirement). ONE durable store per film:
//   <FILM>/production/store/sha256/<aa>/<hash>        immutable, verified artifact bytes (content-addressed)
//   <FILM>/production/runs/<RUN>/events/<seq>.json     append-only hash-chained events (single writer, fenced lock, atomic + read-back)
//   <FILM>/production/runs/<RUN>/stages/<S>/<ATT>/STAGE_HANDOFF.json   producer-generated, verified handoff packets
//   <FILM>/production/runs/<RUN>/STATUS.json           DERIVED by replay — never authority
// Events record stage operations AND every checklist task (TASK_STARTED/COMPLETED/FAILED/BLOCKED/STALE) with input/output hashes, producer,
// verification result and causal parents, so a crash/restart/interrupted session replays exactly to the last committed event.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
export const SCHEMA_VERSION = 1;
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
export const canonSha = (o) => sha(JSON.stringify(canon(o)));
export const EVENT_TYPES = ["RUN_CREATED", "STAGE_READY", "STAGE_STARTED", "EXTERNAL_REQUEST_PREPARED", "EXTERNAL_OUTCOME_UNKNOWN", "OUTPUT_PREPARED", "CHECK_PASSED", "CHECK_FAILED", "HUMAN_APPROVAL_REQUIRED", "STAGE_COMMITTED", "STAGE_BLOCKED",
  "REVISION_SUPERSEDED", "REPAIR_PROPOSED", "REPAIR_APPLIED", "RUN_RESUMED", "RUN_FAILED", "RUN_COMPLETED", "LEGACY_STREAM_LINKED", "TASK_PLANNED", "TASK_STARTED", "TASK_COMPLETED", "TASK_FAILED", "TASK_BLOCKED", "TASK_STALE", "IMPORTED_LEGACY_UNVERIFIED"];
const safeRel = (root, p) => { const r = path.resolve(root, p); if (!r.startsWith(path.resolve(root) + path.sep) && r !== path.resolve(root)) throw err("ASSET_PATH_INVALID", { reason: `path ${p} escapes ${root}` }); if (fs.existsSync(r) && fs.lstatSync(r).isSymbolicLink()) throw err("ASSET_PATH_INVALID", { reason: `symlink refused: ${p}` }); return r; };
const writeDurable = (file, data) => { fs.mkdirSync(path.dirname(file), { recursive: true }); const t = `${file}.tmp-${process.pid}-${crypto.randomBytes(3).toString("hex")}`, fd = fs.openSync(t, "wx"); fs.writeSync(fd, data); fs.fsyncSync(fd); fs.closeSync(fd); fs.renameSync(t, file); if (!fs.readFileSync(file).equals(Buffer.isBuffer(data) ? data : Buffer.from(data))) throw err("SCHEMA_VIOLATION", { reason: `read-back mismatch ${file}` }); };

/* ── content-addressed store ── */
export function storeRoot(FILM) { return path.join(path.resolve(FILM), "production", "store", "sha256"); }
export function putBytes(FILM, buf) { const h = sha(buf), f = path.join(storeRoot(FILM), h.slice(0, 2), h); if (!fs.existsSync(f)) writeDurable(f, buf); else if (sha(fs.readFileSync(f)) !== h) throw err("ASSET_HASH_MISMATCH", { reason: `store object ${h} corrupted` }); return { sha256: h, bytes: buf.length }; }
export function putFile(FILM, file) { return { ...putBytes(FILM, fs.readFileSync(file)), source: path.relative(path.resolve(FILM), path.resolve(file)).split(path.sep).join("/") }; }
export const putJSON = (FILM, o) => putBytes(FILM, Buffer.from(JSON.stringify(canon(o), null, 1)));
export function getBytes(FILM, h) { const f = path.join(storeRoot(FILM), h.slice(0, 2), h); if (!fs.existsSync(f)) throw err("MISSING_ART_ASSET", { reason: `store object ${h} missing` }); const b = fs.readFileSync(f); if (sha(b) !== h) throw err("ASSET_HASH_MISMATCH", { reason: `store object ${h} altered` }); return b; }

/* ── fenced cross-process lock (mkdir is atomic; stale owners are recovered with a NEW fencing generation) ── */
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
export function acquireLock(dir, name, { ttlMs = 10 * 60 * 1000, waitMs = 15000 } = {}) {
  const l = path.join(dir, "locks", `${name}.lock`), gen = path.join(dir, "locks", `${name}.generation`); fs.mkdirSync(path.dirname(l), { recursive: true }); const t0 = Date.now();
  for (;;) { try { fs.mkdirSync(l); const g = (fs.existsSync(gen) ? +fs.readFileSync(gen, "utf8") : 0) + 1; fs.writeFileSync(gen, String(g)); const token = { pid: process.pid, generation: g, at: Date.now() }; fs.writeFileSync(path.join(l, "owner.json"), JSON.stringify(token)); return { token, release: () => { try { const o = JSON.parse(fs.readFileSync(path.join(l, "owner.json"), "utf8")); if (o.generation === g) fs.rmSync(l, { recursive: true, force: true }); } catch {} }, check: () => { let o; try { o = JSON.parse(fs.readFileSync(path.join(l, "owner.json"), "utf8")); } catch { throw err("LEASE_LOST", { reason: `lock ${name} generation ${g} no longer held` }); } if (o.generation !== g) throw err("LEASE_LOST", { reason: `lock ${name} fencing generation ${g} superseded by ${o.generation}` }); } }; }
    catch (e) { if (e.code !== "EEXIST") throw e; let o = null; try { o = JSON.parse(fs.readFileSync(path.join(l, "owner.json"), "utf8")); } catch {}
      let age = 0; try { age = Date.now() - fs.statSync(l).mtimeMs; } catch { continue; }
      if ((o ? !alive(o.pid) || Date.now() - o.at > ttlMs : age > 2000)) { fs.rmSync(l, { recursive: true, force: true }); continue; } // stale lock recovery (a lock whose owner record is still being written is NOT stale); fencing generation guards a mistaken steal
      if (Date.now() - t0 > waitMs) throw err("SCHEMA_VIOLATION", { reason: `lock ${name} held by pid ${o.pid} (generation ${o.generation})`, failed_invariant: "single writer" });
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25); } }
}

/* ── runs and events ── */
export const runDir = (FILM, runId) => safeRel(path.join(path.resolve(FILM), "production", "runs"), runId);
export function createRun(FILM, { runType, runId = null, manifest = {} }) {
  const F = path.resolve(FILM), marker = fs.existsSync(path.join(F, ".diagnostic_namespace"));
  if (runType === "DIAGNOSTIC" && !marker) throw err("TEST_TRUST_FORBIDDEN", { reason: "a DIAGNOSTIC run needs a film inside the diagnostic namespace (.diagnostic_namespace marker); production films cannot host diagnostic runs", producer: "engine/production/ledger.mjs#createRun" });
  if (runType === "PRODUCTION" && marker) throw err("TEST_TRUST_FORBIDDEN", { reason: "a diagnostic-namespace film can never host a PRODUCTION run", producer: "engine/production/ledger.mjs#createRun" });
  const id = runId || `${runType === "DIAGNOSTIC" ? "DIAG" : "PROD"}-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}-${crypto.randomBytes(3).toString("hex")}`, d = runDir(F, id);
  if (fs.existsSync(path.join(d, "RUN_MANIFEST.json"))) throw err("SCHEMA_VIOLATION", { reason: `run ${id} exists` });
  writeDurable(path.join(d, "RUN_MANIFEST.json"), JSON.stringify({ schema_version: SCHEMA_VERSION, run_id: id, film_id: path.basename(F), run_type: runType, created_utc: new Date().toISOString(), ...manifest }, null, 1));
  appendEvent(F, id, { event_type: "RUN_CREATED", stage_id: null, status_after: "CREATED", actor_kind: "ENGINE" });
  return id;
}
export function readEvents(FILM, runId) { const d = path.join(runDir(FILM, runId), "events"); return fs.existsSync(d) ? fs.readdirSync(d).filter((f) => /^\d{8}\.json$/.test(f)).sort().map((f) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))) : []; }
export function appendEvent(FILM, runId, ev) {
  if (!EVENT_TYPES.includes(ev.event_type)) throw err("SCHEMA_VIOLATION", { reason: `unknown event type ${ev.event_type}` });
  const d = runDir(FILM, runId), lock = acquireLock(path.join(path.resolve(FILM), "production"), `events-${runId}`);
  try { const evs = readEvents(FILM, runId), last = evs.at(-1), seq = (last?.sequence ?? 0) + 1;
    const body = { schema_version: SCHEMA_VERSION, event_id: `${runId}:${seq}`, sequence: seq, prev_event_sha256: last?.event_sha256 ?? null, film_id: path.basename(path.resolve(FILM)), run_id: runId, stage_id: null, attempt_id: null, operation_id: null, task_id: null,
      actor_kind: "ENGINE", producer_source_sha256: null, input_refs: [], output_refs: [], status_before: null, status_after: null, gate_evidence_refs: [], blocked_on: [], failure_id: null, parent_event_ids: last ? [last.event_id] : [], wall_time_utc: new Date().toISOString(), elapsed_ms: null, ...ev, lock_generation: lock.token.generation };
    const full = { ...body, event_sha256: canonSha(body) }; lock.check(); const txt = JSON.stringify(full, null, 1); writeDurable(path.join(d, "events", `${String(seq).padStart(8, "0")}.json`), txt); putBytes(FILM, Buffer.from(txt));
    writeDurable(path.join(d, "HEAD.json"), JSON.stringify({ sequence: seq, event_sha256: full.event_sha256, lock_generation: lock.token.generation })); return full; }
  finally { lock.release(); }
}
/** verifyChain — detects deleted, reordered, altered, duplicated and cross-linked events (snapshot integrity, not reviewer identity) */
export function verifyChain(FILM, runId) {
  const evs = readEvents(FILM, runId), problems = []; let prev = null;
  evs.forEach((e, i) => { const { event_sha256, ...body } = e; if (canonSha(body) !== event_sha256) problems.push(`event ${e.sequence}: content altered`); if (e.sequence !== i + 1) problems.push(`event file ${i + 1}: sequence ${e.sequence} (deleted/reordered/duplicated)`);
    if (e.prev_event_sha256 !== (prev?.event_sha256 ?? null)) problems.push(`event ${e.sequence}: chain link broken`); if (e.run_id !== runId) problems.push(`event ${e.sequence}: cross-linked from run ${e.run_id}`); prev = e; });
  // truncation / rollback: the HEAD pointer (written after every durable append) must name the last event; every event is mirrored in the content store
  const hf = path.join(runDir(FILM, runId), "HEAD.json"); if (evs.length) { if (!fs.existsSync(hf)) problems.push("HEAD pointer missing (truncated or unverifiable stream)"); else { const h = JSON.parse(fs.readFileSync(hf, "utf8")); if (h.sequence !== evs.length || h.event_sha256 !== prev?.event_sha256) problems.push(`HEAD names event ${h.sequence} ${String(h.event_sha256).slice(0, 12)} but the stream ends at ${evs.length} (events deleted or rolled back)`); } }
  return { ok: problems.length === 0, events: evs.length, head_sha256: prev?.event_sha256 ?? null, problems };
}
/** a completion counts only when its recorded verification passed AND every output it names still resolves to the same bytes
 *  (content store object, or the named film file with that hash) — "a file was written" or "an event says done" is not completion */
const verifiedCache = new Map();
export function completionVerifies(FILM, e) {
  if (e.verification?.pass !== true) return false;
  const hashOf = (f) => { if (!fs.existsSync(f) || !fs.statSync(f).isFile()) return null; const st = fs.statSync(f), k = `${f}:${st.size}:${st.mtimeMs}`; if (!verifiedCache.has(k)) verifiedCache.set(k, sha(fs.readFileSync(f))); return verifiedCache.get(k); }; // cache keyed by size+mtime: a changed/deleted file is re-hashed
  return (e.output_refs || []).every((r) => { if (!r?.sha256) return false;
    const so = path.join(storeRoot(FILM), r.sha256.slice(0, 2), r.sha256), nf = r.name && !String(r.name).includes("..") ? path.join(path.resolve(FILM), r.name) : null;
    return hashOf(so) === r.sha256 || (!!nf && hashOf(nf) === r.sha256); });
}
/** replay → derived status (stages, tasks, failures); STATUS.json is written as a rebuildable view only */
export function replay(FILM, runId) {
  const v = verifyChain(FILM, runId); if (!v.ok) throw err("SCHEMA_VIOLATION", { reason: `ledger corrupted: ${v.problems.slice(0, 5).join("; ")}`, failed_invariant: "the event chain verifies", repair_owner: "LEDGER_OR_PROVENANCE_TAMPER" });
  const evs = readEvents(FILM, runId), stages = {}, tasks = {}, failures = [];
  for (const e of evs) {
    if (e.stage_id) { const s = (stages[e.stage_id] ||= { stage_id: e.stage_id, status: "NOT_STARTED", attempts: [] }); if (e.attempt_id && !s.attempts.includes(e.attempt_id)) s.attempts.push(e.attempt_id); if (["STAGE_READY", "STAGE_STARTED", "STAGE_COMMITTED", "STAGE_BLOCKED", "RUN_FAILED"].includes(e.event_type) && e.status_after) s.status = e.status_after; if (e.event_type === "STAGE_COMMITTED") s.handoff = e.output_refs[0]; }
    if (e.task_id) { const t = (tasks[e.task_id] ||= { task_id: e.task_id, stage_id: e.stage_id }); if (e.event_type === "TASK_PLANNED") Object.assign(t, { spec: e.task, status: "PLANNED" }); else t.status = e.event_type === "TASK_COMPLETED" && !completionVerifies(FILM, e) ? "UNVERIFIED_COMPLETION_CLAIM" : { TASK_STARTED: "STARTED", TASK_COMPLETED: "COMPLETED", TASK_FAILED: "FAILED", TASK_BLOCKED: "BLOCKED", TASK_STALE: "STALE" }[e.event_type] || t.status;
      if (e.event_type !== "TASK_PLANNED") Object.assign(t, { last_event: e.event_id, verification: e.verification ?? t.verification, input_refs: e.input_refs, output_refs: e.output_refs, failure_id: e.failure_id, at: e.wall_time_utc, blocked_on: e.blocked_on }); }
    if (e.failure_id && e.failure) failures.push(e.failure);
  }
  const all = Object.values(tasks), done = all.filter((t) => t.status === "COMPLETED").length;
  const status = { run_id: runId, chain_head_sha256: v.head_sha256, events: v.events, stages, tasks: { total: all.length, completed: done, failed: all.filter((t) => t.status === "FAILED").length, blocked: all.filter((t) => t.status === "BLOCKED").length, stale: all.filter((t) => t.status === "STALE").length, remaining: all.filter((t) => !["COMPLETED"].includes(t.status)).length, percent_verified: all.length ? +((100 * done) / all.length).toFixed(1) : 0 }, task_list: all, failures,
    next_operation: (() => { const t = all.find((x) => ["PLANNED", "STARTED", "STALE"].includes(x.status)); return t ? `${t.stage_id}/${t.task_id}: ${t.spec?.producer}` : all.find((x) => ["FAILED", "BLOCKED"].includes(x.status)) ? `resolve ${all.find((x) => ["FAILED", "BLOCKED"].includes(x.status)).task_id}` : "none" })() };
  writeDurable(path.join(runDir(FILM, runId), "STATUS.json"), JSON.stringify(status, null, 1));
  return status;
}
/** importLegacy(FILM, files) — F085: old logs/receipts/status pointers are MIGRATED into a SEPARATE run stream (run_type LEGACY) of
 *  IMPORTED_LEGACY_UNVERIFIED events: original path, byte hash (content stored), honest provenance. They are never promoted to authenticated
 *  approval or task completion; production runs may cite them only as unverified context. Re-import of identical bytes is a no-op. */
export function legacySources(FILM) {
  const F = path.resolve(FILM), out = [], add = (rel) => { const f = path.join(F, rel); if (fs.existsSync(f) && fs.statSync(f).isFile()) out.push(f); };
  for (const r of ["reviews/HISTORY.jsonl", "intake/INTAKE_LOG.jsonl", "intake/DEPENDENT_JOB_STATUS.json", "story/FILM_CONTRACT_REPORT.json", "render/RENDER_COMPLETION_RECEIPT.json", "render/FRAME_MANIFEST.json", "qa/film/FILM_QA_RESULT.json"]) add(r);
  for (const d of ["reviews", "approvals"]) { const dd = path.join(F, d); if (fs.existsSync(dd)) for (const f of fs.readdirSync(dd).sort()) if (f.endsWith(".json")) add(`${d}/${f}`); }
  const qs = path.join(F, "qa", "shots"); if (fs.existsSync(qs)) for (const s of fs.readdirSync(qs).sort()) add(`qa/shots/${s}/QA_RESULT.json`);
  return out;
}
export function importLegacy(FILM, files = null, { outboxFiles = [] } = {}) {
  const F = path.resolve(FILM), runsD = path.join(F, "production", "runs"), existing = fs.existsSync(runsD) ? fs.readdirSync(runsD).filter((r) => r.startsWith("LEGACY-")).sort() : [];
  const id = existing[0] || createRun(F, { runType: "LEGACY", runId: `LEGACY-${new Date().toISOString().replace(/[-:.TZ]/g, "").slice(0, 14)}`, manifest: { note: "IMPORTED_LEGACY_UNVERIFIED stream: pre-ledger history, hashed as found; never authenticated" } });
  const seen = new Set(readEvents(F, id).flatMap((e) => (e.output_refs || []).map((o) => `${o.source}:${o.sha256}`))); let n = 0;
  for (const f of [...(files || legacySources(F)), ...outboxFiles].filter((x) => fs.existsSync(x))) { const buf = fs.readFileSync(f), h = sha(buf), src = path.relative(F, path.resolve(f)).split(path.sep).join("/"); if (seen.has(`${src}:${h}`)) continue;
    const o = { ...putBytes(F, buf), source: src }; appendEvent(F, id, { event_type: "IMPORTED_LEGACY_UNVERIFIED", output_refs: [o], status_after: "LEGACY_UNVERIFIED", actor_kind: "LEGACY_IMPORT", gate_evidence_refs: [], blocked_on: [], provenance: "UNAUTHENTICATED_PRE_LEDGER_RECORD" }); seen.add(`${src}:${h}`); n++; }
  return { run_id: id, imported: n };
}
