// P02-R23: an intentional failure injected at EVERY stage S00–S09 of the real controller, each on a fresh copy of the DIAGNOSTIC rehearsal
// film. Each must be the run's FIRST failure, at the right stage/task, correctly classified, with a repair owner, blast radius and a
// `why` answer read back from the verified ledger. Render stages use the diagnostic renderer (mechanics; the Chrome path is the rehearsal).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import * as P from "../../engine/tools/production_run.mjs";
import * as S from "../../engine/production/stages.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "injection");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), Wj = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
let BASE;
before(async () => { const src = path.resolve(REPO, process.env.P02_REHEARSAL_FILM || path.join("hybrid_v2", "work", "p02", "rehearsal_J", "rt", "film")); BASE = path.join(W, "_base");
  if (!fs.existsSync(path.join(src, "REHEARSAL_LABEL.txt"))) { const { buildRehearsalFilm } = await import("./rehearsal_film.mjs"); await buildRehearsalFilm(path.join(W, "_built")); fs.rmSync(BASE, { recursive: true, force: true }); fs.cpSync(path.join(W, "_built", "rt", "film"), BASE, { recursive: true }); }
  else { fs.rmSync(BASE, { recursive: true, force: true }); fs.cpSync(src, BASE, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(src, s)) }); } });
const copy = async (tag) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(BASE, d, { recursive: true }); await (await import("./rehearsal_film.mjs")).reapproveDiagnostic(d); return d; }; // a copy is a different film: its own (simulated, namespace-only) approvals
const opts = (F, o = {}) => ({ renderer: "diagnostic_flat", rendererArgs: {}, motionPlan: path.join(F, "handoff", "MOTION_PLAN.json"), audio: path.join(F, "audio", "narration_TEST_TONE.wav"), total: 7200, chunkSize: 1200, ...o });
const summary = [];
async function expectFirst(tag, mutate, { stage, task, cls, owner }, o = {}) {
  const F = await copy(tag); await mutate(F); const r = await P.start(F, { diagnostic: true, ...opts(F, o) }), st = P.statusTable(F, r.run_id), f0 = st.failures[0];
  assert.ok(f0, `${tag}: expected a failure; stages ${JSON.stringify(r.results)}`); const w = P.why(F, r.run_id, f0.failure_id);
  summary.push({ injection: tag, first_failure: f0, why: { invariant: w.first_violated_invariant, observed: String(w.observed).slice(0, 240), producer: w.root_producer, owner: w.repair_owner, blast_radius: w.blast_radius, resume_from: w.resume_from } });
  fs.writeFileSync(path.join(W, "INJECTION_SUMMARY.json"), JSON.stringify(summary, null, 1));
  assert.equal(f0.stage, stage, `${tag}: first failure stage ${f0.stage} (${f0.observed})`); assert.match(f0.task, task, tag); assert.equal(f0.class, cls, `${tag}: class (${f0.observed})`);
  assert.match(String(w.repair_owner), owner, tag); assert.ok(w.blast_radius.length >= 1, `${tag}: blast radius`); assert.equal(P.verifyRun(F, r.run_id).chain.ok, true); return { F, run: r.run_id, w };
}
test("P02-R23 S00 missing film intent", () => expectFirst("s00_no_intent", (F) => fs.rmSync(path.join(F, "story", "FILM_INTENT.json")), { stage: "S00_IDEA", task: /film_intent/, cls: "MISSING_AUTHORITY", owner: /HUMAN/ }));
test("P02-R23 S01 story approval withdrawn", () => expectFirst("s01_no_story_approval", (F) => fs.rmSync(path.join(F, "approvals", "STORY.POINTER.json")), { stage: "S01_STORY", task: /story_approval/, cls: "EXTERNAL_HUMAN_REQUIRED", owner: /HUMAN/ }));
test("P02-R23 S02 attention on an element nothing animates", () => expectFirst("s02_inert_attention", (F) => { const f = path.join(F, "direction", "SHOT_SCORE_60FPS.json"), s = J(f); s.shots[0].attention_path = ["nobody"]; Wj(f, s); }, { stage: "S02_EXPERIENCE", task: /attention_rt_shot/, cls: "DIRECTION_OR_ATTENTION", owner: /EXPERIENCE/ }));
test("P02-R23 S03 missing measured narration", () => expectFirst("s03_no_narration", (F) => fs.rmSync(path.join(F, "audio", "narration_timeline_TEST.json")), { stage: "S03_TIMING_MOTION", task: /narration_timeline/, cls: "AUDIO_ALIGNMENT", owner: /AUDIO|NARRAT/ }));
test("P02-R23 S04 absent art (a bound state has no planned drawing)", () => expectFirst("s04_absent_art", (F) => { const f = path.join(F, "handoff", "ART_DEPENDENCY_PLAN.json"), p = J(f); p.assets = p.assets.filter((a) => a.asset_id !== "pilot_hand_grip"); Wj(f, p); }, { stage: "S04_ART_DEMAND", task: /demand_pilot_hand_grip/, cls: "MISSING_ART_STATE", owner: /ART/ }));
test("P02-R23 S05 delivered art bytes changed after approval", () => expectFirst("s05_bytes", (F) => { const d = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), a = d.assets.find((x) => x.id === "pilot_forearm"); fs.appendFileSync(path.join(F, a.file), Buffer.from([0])); }, { stage: "S05_ART_PRODUCTION", task: /asset_pilot_forearm/, cls: "ART_STYLE_OR_DESIGN", owner: /ART_DIRECTOR/ }));
test("P02-R23 S06 invalid canonical registration (first observed at S05, where the asset approval bound to it goes stale; attributed to registration)", () => expectFirst("s06_registration", (F) => { const rf = path.join(F, "registration", "pilot_forearm", "pilot_forearm__REGISTRATION_RECEIPT.json"), r = J(rf); r.max_residual_px = 0.0001; Wj(rf, r); }, { stage: "S05_ART_PRODUCTION", task: /asset_pilot_forearm/, cls: "REGISTRATION_OR_RIG", owner: /REGISTRATION/ }));
test("P02-R23 S06 a state edge approval revoked", () => expectFirst("s06_edge_revoked", async (F) => { const I = await import("../../engine/art_bridge/art_intake.mjs"); await I.approveStateEdge({ film: F, rig: "pilot_rig", from: "open", to: "grip", verdict: "REJECTED", attestation: { method: "TEST_TRUST" }, reviewer: "p02-rehearsal-simulated-reviewer", scope_note: "injection" }); }, { stage: "S06_REGISTRATION_RIG", task: /states_edges/, cls: "EXTERNAL_HUMAN_REQUIRED", owner: /HUMAN/ }));
test("P02-R23 S07 renderer crash mid-chunk (non-transient)", () => expectFirst("s07_crash", () => {}, { stage: "S07_NEUTRINO_RENDER", task: /chunk_0_1200/, cls: "RENDER_OR_MEMORY", owner: /RENDER/ }, { inject: { crashAt: { frame: 700, attempts: 9, transient: false } } }));
test("P02-R23 S07 frozen required action (pixels stop while the expected state moves)", () => expectFirst("s07_frozen", () => {}, { stage: "S07_NEUTRINO_RENDER", task: /chunk_0_1200/, cls: "MOTION_OR_CAMERA", owner: /MOTION/ }, { rendererArgs: { frozenFrom: 300 } }));
test("P02-R23 S08 final MP4 replaced after the render", async () => {
  const F = await copy("s08_mp4"), r = await P.start(F, { diagnostic: true, ...opts(F), until: "S07_NEUTRINO_RENDER" }); assert.equal(r.results.at(-1).status, "COMMITTED", JSON.stringify(r.results));
  const rc = J(path.join(F, "render", "RENDER_COMPLETION_RECEIPT.json")); fs.appendFileSync(path.join(F, rc.mp4), Buffer.from([0]));
  // since the F110 handoff repair, the replaced MP4 is caught at the S07→S08 HANDOFF gate (the S07 packet names render/film.mp4 by hash), before
  // any S08 task can run; the S08 render_receipt verifier is the second line (covered by film_revision P05 / B3-4)
  await P.resume(F, r.run_id, opts(F)); const st = P.statusTable(F, r.run_id), s8 = st.stages.find((x) => x.stage === "S08_QA_REPAIR"); assert.equal(s8.status, "BLOCKED");
  const L = await import("../../engine/production/ledger.mjs"), blk = L.readEvents(F, r.run_id).filter((e) => e.event_type === "STAGE_BLOCKED" && e.stage_id === "S08_QA_REPAIR").at(-1);
  assert.match(blk.blocked_on.join(" "), /film\.mp4: named file bytes differ from the recorded hash/); assert.equal(st.stages.find((x) => x.stage === "S09_FILM_AUDIO_FINAL").status, "NOT_STARTED", "nothing downstream ran");
  summary.push({ injection: "s08_mp4", first_failure: { stage: "S08_QA_REPAIR", task: "(handoff gate)", class: "QA_EVIDENCE_INVALID", observed: blk.blocked_on.join("; ") } }); fs.writeFileSync(path.join(W, "INJECTION_SUMMARY.json"), JSON.stringify(summary, null, 1));
});
test("P02-R23 S09 final film without its audio stream; and the DIAGNOSTIC film review can never be satisfied", async () => {
  const F = await copy("s09_audio"), r = await P.start(F, { diagnostic: true, ...opts(F, { audio: null }) }), st = P.statusTable(F, r.run_id);
  const f0 = st.failures[0]; assert.equal(f0.stage, "S09_FILM_AUDIO_FINAL", JSON.stringify(st.failures)); assert.equal(f0.task, "final_media"); assert.equal(f0.class, "AUDIO_ALIGNMENT"); assert.match(f0.observed, /no audio stream/);
  const rv = st.failures.find((f) => f.task === "film_review") || null; const s9 = st.stages.find((s) => s.stage === "S09_FILM_AUDIO_FINAL"); assert.notEqual(s9.status, "COMMITTED");
  summary.push({ injection: "s09_audio", first_failure: f0, film_review: rv }); fs.writeFileSync(path.join(W, "INJECTION_SUMMARY.json"), JSON.stringify(summary, null, 1));
});
