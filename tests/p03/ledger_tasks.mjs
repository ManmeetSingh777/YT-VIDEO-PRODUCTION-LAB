#!/usr/bin/env node
// P03 I evidence: derive the stage-ledger tasks for the new capabilities from the fixture film's OWN plan (S03) and audio buses (S09), run each
// task's producer + verifier, and record task id, producer, invariants, measurement, pass/fail and failure class. A counterfactual run with a
// broken reaction tolerance must fail its task. Writes hybrid_v2/evidence/p03/LEDGER_TASKS_P03.json.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FILM = path.join(REPO, "hybrid_v2", "work", "p03", "subjects", "film");
const S = await import("../../engine/production/stages.mjs"), P = await import("./p03_plans.mjs"), doc = JSON.parse(fs.readFileSync(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), "utf8"));
const A = path.join(REPO, "hybrid_v2", "work", "p03", "audio"), plan = { ...P.directedPlan(doc), audio_buses: { narration: { file: path.join(A, "narration_TEST_TONES.wav"), window_s: [0.55, 0.88] }, music: { file: path.join(A, "music_TEST_BED.wav"), gain_db: -6, reference_window_s: [3, 7.5] }, sfx: [{ id: "grip_clunk", file: path.join(A, "sfx_TEST_CLICK.wav"), frame: 70 }, { id: "release_click", file: path.join(A, "sfx_TEST_CLICK.wav"), frame: 200, gain_db: -3 }], words: P.directedPlan(doc).acting.nova_rig.speech.words, loudness: { target_lufs: -16, true_peak: -1.5, lra: 11 }, tolerance_ms: 4 } };
const docShort = { ...doc, stage: { ...doc.stage, total_frames: 480 } }; // the audio proof covers the 480 rendered diagnostic frames
const run = async (stage, ctx) => { const out = []; for (const t of S.deriveTasks(stage, ctx).filter((x) => /^(motion_layers|deform_|morph_|reaction_|support_|audio_mix|av_sync)/.test(x.task_id))) { const t0 = Date.now(); let r; try { r = await t.run(); } catch (e) { r = { pass: false, measurement: `${e.code || ""} ${e.message}` }; }
  out.push({ stage, task_id: t.task_id, producer: t.producer, invariants: t.invariants, verification: t.verification, deps: t.deps, pass: r.pass, failure_class: r.pass ? null : r.category || t.category || null, measurement: r.measurement, files: (r.files || []).map((f) => path.relative(REPO, f)), ms: Date.now() - t0 }); } return out; };
const ctx = { ...S.loadContext(FILM), motionPlans: { _film: plan } }, rows = [...await run("S03_TIMING_MOTION", ctx), ...await run("S09_FILM_AUDIO_FINAL", { ...ctx, doc: docShort })];
const bad = { ...plan, reactions: plan.reactions.map((r) => ({ ...r, allowed_error_px: -1 })) }, cf = (await run("S03_TIMING_MOTION", { ...ctx, motionPlans: { _film: bad } })).filter((r) => r.task_id.startsWith("reaction_"));
const out = { film: path.relative(REPO, FILM), note: "tasks derived from the film's own contracts; DIAGNOSTIC fixture", tasks: rows, counterfactual_reaction_tolerance: cf, all_pass: rows.every((r) => r.pass), counterfactual_fails: cf.every((r) => !r.pass) };
fs.writeFileSync(path.join(REPO, "hybrid_v2", "evidence", "p03", "LEDGER_TASKS_P03.json"), JSON.stringify(out, null, 1));
for (const r of rows) console.log(r.pass ? "PASS" : "FAIL", r.stage.padEnd(22), r.task_id.padEnd(26), String(r.measurement).slice(0, 140)); console.log("counterfactual fails:", out.counterfactual_fails);
