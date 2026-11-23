#!/usr/bin/env node
// P02 rehearsal runner (checked in; reproduces the audit's rehearsal transcripts). Uses ONLY the production controller
// (engine/tools/production_run.mjs: start/status/why/trace/resume/verify) on the DIAGNOSTIC rehearsal film.
//   node tests/p02/run_rehearsal.mjs --phase NAME [--build] [--total N] [--chunk N] [--until STAGE] [--resume RUN_ID] [--inject JSON]
// Writes hybrid_v2/work/p02/rehearsal/evidence/<phase>/{TRANSCRIPT.txt, STATUS.json, WHY_*.json, TRACE_*.json, VERIFY.json}.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1"; // honoured only inside the diagnostic namespace (structural isolation, F087)
const a = process.argv.slice(2), get = (k, d = null) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : d; }, has = (k) => a.includes(k);
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), DIR = path.resolve(REPO, get("--dir", path.join("hybrid_v2", "work", "p02", "rehearsal")));
const phase = get("--phase", "run"), EV = path.join(DIR, "evidence", phase); fs.mkdirSync(EV, { recursive: true });
const log = []; const say = (s) => { log.push(s); console.log(s); fs.writeFileSync(path.join(EV, "TRANSCRIPT.txt"), log.join("\n") + "\n"); };
const P = await import("../../engine/tools/production_run.mjs"), L = await import("../../engine/production/ledger.mjs");
if (has("--build") && fs.existsSync(path.join(DIR, "rt", "film", "production"))) { console.error(`REFUSED: ${DIR} already holds a rehearsal film with run history; build into a NEW --dir (evidence is never deleted)`); process.exit(2); }
if (has("--build") || !fs.existsSync(path.join(DIR, "rt", "film", "REHEARSAL_LABEL.txt"))) { const { buildRehearsalFilm } = await import("./rehearsal_film.mjs"); say(`[build] rehearsal film via the real intake API → ${path.relative(REPO, (await buildRehearsalFilm(DIR)).film)}`); }
const FILM = path.join(DIR, "rt", "film"), plan = path.join(FILM, "handoff", "MOTION_PLAN.json"), audio = path.join(FILM, "audio", "narration_TEST_TONE.wav");
const opts = { renderer: get("--renderer", "art_bridge_chrome_frames"), rendererArgs: { planFile: plan, runType: "DIAGNOSTIC" }, motionPlan: plan, audio, total: +get("--total", "7200"), chunkSize: +get("--chunk", "600"), inject: get("--inject") ? JSON.parse(get("--inject")) : {}, until: get("--until") };
const t0 = Date.now(), fmtT = (t) => [`run ${t.run_id} events ${t.events} verified ${t.tasks.completed}/${t.tasks.total} (${t.tasks.percent_verified}%) failed ${t.tasks.failed} blocked ${t.tasks.blocked}`, ...t.stages.map((r) => `  ${r.stage.padEnd(22)} ${r.status.padEnd(12)} ${r.verified}/${r.tasks} failed ${r.failed} blocked ${r.blocked}`), `  next: ${t.next_operation}`].join("\n");
say(`[preflight] ${JSON.stringify((await P.preflight(FILM)).rows.map((r) => [r.stage, r.status]))}`);
let id; if (get("--resume")) { id = get("--resume"); say(`[resume] ${id}`); await P.resume(FILM, id, opts); } else { const r = await P.start(FILM, { diagnostic: true, ...opts }); id = r.run_id; say(`[start] ${id} → ${JSON.stringify(r.results)}`); }
const st = P.statusTable(FILM, id); fs.writeFileSync(path.join(EV, "STATUS.json"), JSON.stringify(st, null, 1)); say(`[status]\n${fmtT(st)}`);
for (const f of st.failures) { const w = P.why(FILM, id, f.failure_id); fs.writeFileSync(path.join(EV, `WHY_${f.failure_id}.json`), JSON.stringify(w, null, 1)); say(`[why ${f.failure_id}] first violated invariant: ${w.first_violated_invariant}\n    observed: ${String(w.observed).slice(0, 300)}\n    root producer: ${w.root_producer} owner ${w.repair_owner} class ${w.failure_class}\n    blast radius: ${JSON.stringify(w.blast_radius).slice(0, 300)}\n    resume from ${w.resume_from} retry_safe ${w.retry_safe}`); }
const total = opts.total; for (const fr of [0, 100, 450, 3599, 3600, 3900, total - 1].filter((f) => f < total)) { try { const t = (await import("../../engine/production/stages.mjs")).traceFrame(FILM, id, fr); fs.writeFileSync(path.join(EV, `TRACE_${fr}.json`), JSON.stringify(t, null, 1)); say(`[trace ${fr}] ${JSON.stringify(t).slice(0, 400)}`); } catch (e) { say(`[trace ${fr}] ${e.code || ""} ${e.message}`); } }
const v = P.verifyRun(FILM, id); fs.writeFileSync(path.join(EV, "VERIFY.json"), JSON.stringify(v, null, 1)); say(`[verify] chain ok=${v.chain.ok} events=${v.chain.events} head=${v.chain.head_sha256} handoffs=${v.handoffs.map((h) => `${h.stage}:${h.ok}`).join(",")}`);
fs.writeFileSync(path.join(EV, "RUN_ID.txt"), id); say(`[done] ${phase} in ${((Date.now() - t0) / 1000).toFixed(0)} s; run ${id}`);
