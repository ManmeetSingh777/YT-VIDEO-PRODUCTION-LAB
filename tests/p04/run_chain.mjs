#!/usr/bin/env node
// P04 §9 chained DIAGNOSTIC production run S00→S09 on the four-family film (bounded to 480 frames, chunkSize 120, real Chrome renderer with per-owner
// attribution, real ledger). Records status, every stage's tasks, the trace of a biped frame, the failure reasons of any block, and the verified final
// media receipt.   node tests/p04/run_chain.mjs [--out hybrid_v2/evidence/p04/chain]
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; }, OUT = path.resolve(arg("--out", path.join(REPO, "hybrid_v2", "evidence", "p04", "chain"))), TOTAL = +(arg("--total", "480"));
fs.mkdirSync(OUT, { recursive: true });
const { buildChainedFilm } = await import("./chained_film.mjs"), PR = await import("../../engine/tools/production_run.mjs"), S = await import("../../engine/production/stages.mjs"), L = await import("../../engine/production/ledger.mjs");
const b = await buildChainedFilm(path.join(REPO, "hybrid_v2", "work", "p04", "chain_film"), { total: TOTAL }), FILM = b.film;
const t0 = Date.now(), r = await PR.start(FILM, { diagnostic: true, renderer: "art_bridge_chrome_frames", total: TOTAL, chunkSize: 120, motionPlan: undefined });
const table = PR.statusTable(FILM, r.run_id), verify = PR.verifyRun(FILM, r.run_id), why = (table.failures || []).slice(0, 12).map((f) => { try { return { failure: f.failure_id, ...PR.why(FILM, r.run_id, f.failure_id) }; } catch (e) { return { failure: f.failure_id, error: e.message }; } });
const traceErr = {}; let trace = null; try { trace = S.traceFrame(FILM, r.run_id, 120); } catch (e) { traceErr.error = e.message; }
const fmr = path.join(FILM, "render", "FINAL_MEDIA_RECEIPT.json");
const rep = { film: path.relative(REPO, FILM), run_id: r.run_id, seconds: (Date.now() - t0) / 1000, results: r.results, stages: table.stages, failures: why, ledger_verification: verify, trace_frame_120: trace ? { frame: trace.frame, shot: trace.shot?.id, actions: trace.actions, blockers: trace.blockers } : traceErr, final_media: fs.existsSync(fmr) ? JSON.parse(fs.readFileSync(fmr, "utf8")) : null, generated_at: new Date().toISOString() };
fs.writeFileSync(path.join(OUT, "CHAIN_REPORT.json"), JSON.stringify(rep, null, 1));
for (const f of ["render/FINAL_MEDIA_RECEIPT.json", "render/audio/FILM_MIX.wav.SYNC.json"]) { const x = path.join(FILM, f); if (fs.existsSync(x)) fs.copyFileSync(x, path.join(OUT, path.basename(x))); }
const st = path.join(L.runDir(FILM, r.run_id), "COVERAGE_GATE.json"); if (fs.existsSync(st)) fs.copyFileSync(st, path.join(OUT, "COVERAGE_GATE.json"));
const mp4 = path.join(FILM, "render", "film_final.mp4"); if (fs.existsSync(mp4)) fs.copyFileSync(mp4, path.join(OUT, "chain_film_final.mp4"));
console.log(JSON.stringify(r.results)); console.log(table.stages.map((s) => `${s.stage} ${s.status} ${s.verified}/${s.tasks} failed ${s.failed}`).join("\n")); for (const w of why) console.log("WHY", w.failure, w.observed ?? w.error); console.log("ledger ok:", verify.ok, "final:", rep.final_media?.ok);
