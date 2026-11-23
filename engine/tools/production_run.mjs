#!/usr/bin/env node
// Operator CLI over the ONE authoritative production ledger (engine/production/ledger.mjs) and the real stage engine (stages.mjs).
//   production-run preflight --film DIR                       read-only readiness table (READY / BLOCKED_* / STALE) per stage
//   production-run start --film DIR [--diagnostic] [--until STAGE] [--renderer R] [--plan FILE] [--audio WAV] [--total N]
//   production-run status|watch --film DIR [--run-id ID]      verified task progress (percent from VERIFIED tasks only)
//   production-run trace --film DIR --run-id ID --frame F     frame → shot/action/state/asset/receipt/design/story chain
//   production-run why --film DIR --run-id ID --failure ID    first violated invariant, root producer, blast radius, repair owner
//   production-run resume --film DIR --run-id ID              re-runs from the first non-committed stage (new attempt)
//   production-run verify --film DIR --run-id ID              event chain + every committed handoff re-verified
//   production-run export-audit --film DIR --run-id ID [--out ZIP]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
import * as L from "../production/ledger.mjs";
import * as S from "../production/stages.mjs";
import { createHash } from "node:crypto";
const require_sha = (t) => createHash("sha256").update(t).digest("hex");
const a = process.argv.slice(2), get = (k, d = null) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; }, has = (k) => a.includes(k), json = has("--json");
const out = (o, text) => console.log(json ? JSON.stringify(o, null, 1) : text);
export function latestRun(FILM) { const d = path.join(path.resolve(FILM), "production", "runs"); return fs.existsSync(d) ? fs.readdirSync(d).filter((x) => !x.startsWith("LEGACY-") && fs.existsSync(path.join(d, x, "RUN_MANIFEST.json"))).map((x) => [x, JSON.parse(fs.readFileSync(path.join(d, x, "RUN_MANIFEST.json"), "utf8")).created_utc]).sort((a, b) => (a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : a[0] < b[0] ? -1 : 1)).at(-1)?.[0] ?? null : null; }
export function statusTable(FILM, runId) {
  const st = L.replay(FILM, runId), rows = S.STAGES.map((s) => { const g = st.stages[s], ts = st.task_list.filter((t) => t.stage_id === s); return { stage: s, status: g?.status ?? "NOT_STARTED", tasks: ts.length, verified: ts.filter((t) => t.status === "COMPLETED").length, failed: ts.filter((t) => t.status === "FAILED").length, blocked: ts.filter((t) => t.status === "BLOCKED").length, stale: ts.filter((t) => t.status === "STALE").length }; });
  return { run_id: runId, chain_head: st.chain_head_sha256, events: st.events, tasks: st.tasks, stages: rows, next_operation: st.next_operation, failures: st.failures.map((f) => ({ failure_id: f.failure_id, stage: f.stage_id, task: f.task_id, class: f.failure_class, invariant: f.expected_invariant, observed: f.observed_measurement })) };
}
const fmt = (t) => [`run ${t.run_id}  events ${t.events}  head ${String(t.chain_head).slice(0, 12)}  verified ${t.tasks.completed}/${t.tasks.total} (${t.tasks.percent_verified}%)  failed ${t.tasks.failed}  blocked ${t.tasks.blocked}`,
  ...t.stages.map((r) => `${r.stage.padEnd(22)} ${r.status.padEnd(12)} tasks ${String(r.verified).padStart(4)}/${String(r.tasks).padEnd(4)} failed ${r.failed} blocked ${r.blocked}`), `next: ${t.next_operation}`, ...t.failures.slice(0, 5).map((f) => `FAILURE ${f.failure_id} [${f.class}] ${f.task}: ${String(f.observed).slice(0, 140)}`)].join("\n");
/** the renderer's plan is the canonical production plan (P04 §7.2): deterministic resolution, refusal on conflict/absence — never undefined */
export function resolveRenderPlan(FILM, { motionPlan = null } = {}) { const { compileProductionPlan: cp } = S; const r = cp(FILM, { explicit: motionPlan }); if (r.errors?.length) throw Object.assign(new Error(r.errors.map((e) => `${e.code}: ${e.reason || e.human_readable_reason}`).join("; ")), { code: r.errors[0].code }); return r; }
export async function start(FILM, { diagnostic = false, until = null, runId = null, ...opts } = {}) {
  if ((opts.renderer || "art_bridge_chrome_frames") === "art_bridge_chrome_frames" && !opts.rendererArgs?.planFile) { const rp = resolveRenderPlan(FILM, { motionPlan: opts.motionPlan }); const cf = materializePlan(FILM, rp); opts = { ...opts, motionPlan: opts.motionPlan || rp.file, rendererArgs: { ...(opts.rendererArgs || {}), planFile: cf, runType: diagnostic ? "DIAGNOSTIC" : "PRODUCTION" } }; }
  const id = runId || L.createRun(FILM, { runType: diagnostic ? "DIAGNOSTIC" : "PRODUCTION", manifest: { renderer: opts.renderer || "art_bridge_chrome_frames" } });
  // F085: pre-ledger history is migrated into the separate LEGACY stream and only LINKED (never trusted) from the new run
  const lg = L.importLegacy(FILM), lh = L.verifyChain(FILM, lg.run_id); L.appendEvent(FILM, id, { event_type: "LEGACY_STREAM_LINKED", status_after: "LINKED_UNVERIFIED", input_refs: [{ legacy_run_id: lg.run_id, head_sha256: lh.head_sha256, events: lh.events, imported_now: lg.imported }] });
  return { run_id: id, results: await runFrom(FILM, id, 0, until, opts) };
}
async function runFrom(FILM, id, from, until, opts) { const res = []; for (const s of S.STAGES.slice(from)) { const r = await S.runStage(FILM, id, s, opts); res.push({ stage: s, status: r.status }); if (r.status !== "COMMITTED" || s === until) break; } return res; }
export async function resume(FILM, id, opts = {}) { const st = L.replay(FILM, id); L.appendEvent(FILM, id, { event_type: "RUN_RESUMED", status_after: "RESUMED" }); const from = S.STAGES.findIndex((s) => st.stages[s]?.status !== "COMMITTED"); return from < 0 ? [] : runFrom(FILM, id, from, opts.until || null, opts); }
export function why(FILM, id, failureId) {
  const f = path.join(L.runDir(FILM, id), "failures", `${failureId}.json`); if (!fs.existsSync(f)) throw new Error(`no failure ${failureId}`); const r = JSON.parse(fs.readFileSync(f, "utf8"));
  const st = L.replay(FILM, id), ev = L.readEvents(FILM, id).find((e) => e.failure_id === failureId); if (!ev) throw new Error("failure is not recorded in the verified ledger (forged record refused)");
  return { first_violated_invariant: r.expected_invariant, observed: r.observed_measurement, stage: r.stage_id, task: r.task_id, root_producer: r.root_producer_or_UNKNOWN, failure_class: r.failure_class, repair_owner: r.repair_owner, blast_radius: r.invalidated_downstream_nodes, frames: r.frame_ranges, evidence_event: ev.event_id, resume_from: r.resume_from_stage, retry_safe: r.retry_safe_boolean, external_spend_risk: r.external_spend_risk, next_operation: st.next_operation };
}
export function verifyRun(FILM, id) { const c = L.verifyChain(FILM, id), st = c.ok ? L.replay(FILM, id) : null, handoffs = st ? Object.entries(st.stages).filter(([, v]) => v.status === "COMMITTED").map(([k]) => ({ stage: k, ...S.verifyHandoff(FILM, id, k) })).map(({ handoff, ...x }) => x) : []; return { chain: c, handoffs, ok: c.ok && handoffs.every((h) => h.ok) }; }
/** preflight — pure planning/readiness probes only. Tasks flagged side_effect (audio mix, mux, sync, anything that writes) are NEVER executed here;
 *  the film tree is byte-identical before and after. */
/** the compiled plan (approved phrases merged) is written ONCE, content-addressed, under the film's production store — never into handoff/ */
export function materializePlan(FILM, rp) { const F = path.resolve(FILM), txt = JSON.stringify(rp.plan), sha = L.sha256 ? L.sha256(txt) : require_sha(txt); const dir = path.join(F, "production", "compiled_plans"); fs.mkdirSync(dir, { recursive: true }); const f = path.join(dir, `MOTION_PLAN_${sha.slice(0, 16)}.json`); if (!fs.existsSync(f)) fs.writeFileSync(f, txt); return f; }
export async function preflight(FILM) {
  const ctx = S.loadContext(FILM), rows = [];
  for (const s of S.STAGES) { if (s === "S07_NEUTRINO_RENDER") { // the renderer needs a resolvable plan before it may start
      const planErr = ctx.planSource?.errors?.length ? ctx.planSource.errors.map((e) => `${e.code}: ${e.reason || e.human_readable_reason}`).join("; ") : null;
      if (planErr) { rows.push({ stage: s, status: "BLOCKED_SOFTWARE", tasks: 0, failing: [{ task: "motion_plan", measurement: planErr }] }); continue; } }
    if (s === "S07_NEUTRINO_RENDER" || s === "S08_QA_REPAIR") { rows.push({ stage: s, status: rows.some((r) => r.status !== "READY") ? "BLOCKED_UPSTREAM" : "READY", tasks: S.deriveTasks(s, { ...ctx, runId: "PREFLIGHT" }).length }); continue; }
    const tasks = S.deriveTasks(s, { ...ctx, runId: "PREFLIGHT" }), res = []; for (const t of tasks) { if (t.group === "render") continue; if (t.side_effect) { res.push({ task: t.task_id, pass: true, not_executed: true, category: t.category, measurement: "NOT EXECUTED IN PREFLIGHT (side-effecting task)" }); continue; } let r; try { r = await t.run(); } catch (e) { r = { pass: false, measurement: e.message }; } res.push({ task: t.task_id, pass: r.pass === true, category: r.category || t.category, measurement: r.measurement }); }
    const unmet = S.stageObligations(s, ctx).filter((o) => !tasks.some((t) => o.task.test(t.task_id))); if (unmet.length) res.push({ task: "stage_obligations", pass: false, category: "UNKNOWN_ROOT_CAUSE", measurement: `EMPTY_STAGE_OBLIGATION: ${unmet.map((u) => u.id).join(", ")}` });
    const bad = res.filter((r) => !r.pass), cat = bad.map((b) => b.category || "SOFTWARE"); rows.push({ stage: s, status: !bad.length ? "READY" : cat.includes("EXTERNAL_HUMAN_REQUIRED") || cat.includes("MISSING_AUTHORITY") || cat.includes("DIRECTION_OR_ATTENTION") ? "BLOCKED_HUMAN" : cat.includes("AUDIO_ALIGNMENT") ? "BLOCKED_AUDIO" : cat.some((c) => /ART/.test(c || "")) ? "BLOCKED_ART" : cat.includes("STORY_FACT_OR_MECHANISM") ? "BLOCKED_CLAIM" : "BLOCKED_SOFTWARE", tasks: tasks.length, failing: bad.slice(0, 8) }); }
  return { film: path.basename(path.resolve(FILM)), run_type: ctx.runType, ready_for_production: rows.every((r) => r.status === "READY") && ctx.runType === "PRODUCTION", rows };
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const cmd = a[0], FILM = get("--film"), id = get("--run-id") || (FILM && latestRun(FILM)), opts = { renderer: get("--renderer") || undefined, motionPlan: get("--plan") || undefined, rendererArgs: get("--plan") ? { planFile: path.resolve(get("--plan")), runType: has("--diagnostic") ? "DIAGNOSTIC" : "PRODUCTION" } : undefined, audio: get("--audio") || undefined, total: get("--total") ? +get("--total") : undefined };
  try {
    if (cmd === "preflight") { const p = await preflight(FILM); out(p, [`PREFLIGHT ${p.film} (${p.run_type}) ready_for_production=${p.ready_for_production}`, ...p.rows.map((r) => `${r.stage.padEnd(22)} ${r.status.padEnd(18)} tasks ${r.tasks}${r.failing?.length ? `  e.g. ${r.failing[0].task}: ${String(r.failing[0].measurement).slice(0, 100)}` : ""}`)].join("\n")); }
    else if (cmd === "start") { const r = await start(FILM, { diagnostic: has("--diagnostic"), until: get("--until"), ...opts }); out(r, `${r.run_id}\n${fmt(statusTable(FILM, r.run_id))}`); }
    else if (cmd === "status") { const t = statusTable(FILM, id); out(t, fmt(t)); }
    else if (cmd === "watch") { for (let i = 0; i < +(get("--ticks", "1000")); i++) { const t = statusTable(FILM, id); console.clear?.(); console.log(fmt(t)); if (t.stages.every((r) => ["COMMITTED", "BLOCKED"].includes(r.status) || r.status === "NOT_STARTED") && i > 0) break; await new Promise((r) => setTimeout(r, +(get("--interval-ms", "2000")))); } }
    else if (cmd === "trace") { const t = S.traceFrame(FILM, id, +get("--frame")); out(t, JSON.stringify(t, null, 1)); }
    else if (cmd === "why") { const w = why(FILM, id, get("--failure")); out(w, JSON.stringify(w, null, 1)); }
    else if (cmd === "resume") { const r = await resume(FILM, id, opts); out(r, fmt(statusTable(FILM, id))); }
    else if (cmd === "verify") { const v = verifyRun(FILM, id); out(v, JSON.stringify(v, null, 1)); process.exit(v.ok ? 0 : 1); }
    else if (cmd === "export-audit") { const z = path.resolve(get("--out", path.join(L.runDir(FILM, id), `RUN_AUDIT_${id}.zip`))); execFileSync(process.env.PYTHON || "python", ["-I", "-c", "import sys,os,zipfile\nr=sys.argv[1]\nwith zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:\n  for d,_,fs in os.walk(r):\n    for f in fs:\n      p=os.path.join(d,f)\n      if not p.endswith('.zip'): z.write(p,os.path.relpath(p,os.path.dirname(r)))", L.runDir(FILM, id), z]); out({ zip: z }, z); }
    else { console.error("usage: production_run.mjs preflight|start|status|watch|trace|why|resume|verify|export-audit --film DIR [--run-id ID] ..."); process.exit(2); }
  } catch (e) { console.error(`REFUSED: ${e.human_readable_reason || e.message}`); process.exit(1); }
}
