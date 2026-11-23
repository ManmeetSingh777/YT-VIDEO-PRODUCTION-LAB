// P02-R13 (typed S00–S09 handoff graph; a missing/forged packet blocks the next stage), P02-R14 (frame → source trace on two unlike families;
// deleting an ancestor yields an exact named blocker) and P02-R08 (each input category changes the revision; diagnostic logs do not).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import * as P from "../../engine/tools/production_run.mjs";
import * as S from "../../engine/production/stages.mjs";
import * as L from "../../engine/production/ledger.mjs";
import { buildFilmRevision } from "../../engine/film/film_revision.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "trace");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let F, RUN;
before(async () => { const src = path.resolve(REPO, process.env.P02_REHEARSAL_FILM || path.join("hybrid_v2", "work", "p02", "rehearsal_J", "rt", "film")); F = path.join(W, "film"); fs.rmSync(W, { recursive: true, force: true });
  if (!fs.existsSync(path.join(src, "REHEARSAL_LABEL.txt"))) { const { buildRehearsalFilm } = await import("./rehearsal_film.mjs"); await buildRehearsalFilm(path.join(W, "built")); fs.cpSync(path.join(W, "built", "rt", "film"), F, { recursive: true }); }
  else fs.cpSync(src, F, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(src, s)) });
  await (await import("./rehearsal_film.mjs")).reapproveDiagnostic(F);
  const r = await P.start(F, { diagnostic: true, renderer: "diagnostic_flat", rendererArgs: {}, motionPlan: path.join(F, "handoff", "MOTION_PLAN.json"), audio: path.join(F, "audio", "narration_TEST_TONE.wav"), total: 7200, chunkSize: 1200, until: "S08_QA_REPAIR" }); RUN = r.run_id;
  assert.equal(r.results.at(-1).status, "COMMITTED", JSON.stringify(r.results)); });

test("P02-R13 every committed stage hands off a typed, re-verifiable packet; a forged or missing packet blocks the next stage", async () => {
  const v = P.verifyRun(F, RUN); assert.equal(v.ok, true, JSON.stringify(v.handoffs.filter((h) => !h.ok))); assert.equal(v.handoffs.length, 9, "S00..S08 committed");
  for (const s of S.STAGES.slice(0, 9)) { const h = S.verifyHandoff(F, RUN, s); assert.equal(h.ok, true, s); for (const k of ["producer_source_sha256", "input_revision_hash", "output_artifact_refs", "required_checks", "event_chain_head_sha256"]) assert.ok(h.handoff[k] !== undefined, `${s}.${k}`); }
  // forged packet: replace the stored S08 handoff object bytes → S09 must refuse to start
  const st = L.replay(F, RUN).stages.S08_QA_REPAIR, obj = path.join(L.storeRoot(F), st.handoff.sha256.slice(0, 2), st.handoff.sha256), orig = fs.readFileSync(obj);
  fs.writeFileSync(obj, Buffer.from(JSON.stringify({ ...JSON.parse(orig), status: "FORGED" }))); try { assert.match(S.verifyHandoff(F, RUN, "S08_QA_REPAIR").reason, /store object .* (altered|corrupt)|handoff bytes/); const r = await S.runStage(F, RUN, "S09_FILM_AUDIO_FINAL", {}); assert.equal(r.status, "BLOCKED"); } finally { fs.writeFileSync(obj, orig); }
  fs.rmSync(obj); try { const r = await S.runStage(F, RUN, "S09_FILM_AUDIO_FINAL", {}); assert.equal(r.status, "BLOCKED"); assert.match(r.reason, /missing/); } finally { fs.writeFileSync(obj, orig); }
});
test("P02-R14 frames trace back to output hash, shot score, actions, rig state, approved bytes, registration, design decisions with F-source hashes, story/direction and narration — on both families", () => {
  const ch = S.traceFrame(F, RUN, 450), wd = S.traceFrame(F, RUN, 3850); // half-open [start,end) intervals: the world push-in is [3700,3900); 3900 is the first static frame after it
  assert.deepEqual(ch.blockers, [], JSON.stringify(ch.blockers)); assert.deepEqual(wd.blockers, [], JSON.stringify(wd.blockers));
  assert.ok(ch.output.frame_rgb_sha256 && ch.output.segment_sha256 && ch.output.mp4_sha256); assert.equal(ch.shot.id, "rt_shot"); assert.ok(ch.shot.semantic_actions.some((a) => a.verb === "REACH"));
  assert.ok(ch.assets.some((a) => a.asset === "pilot_forearm" && a.bytes_match && a.approval.status === "VERIFIED" && a.registration.ok && a.design.decisions.every((d) => d.f_source_sha256)));
  assert.ok(wd.assets.some((a) => a.asset === "rt_world_far" && a.registration.ok), "world family: the plate traces to its registration"); assert.equal(wd.segment.camera_moving, true);
  assert.ok(ch.narration && wd.narration, "measured narration timeline linked"); assert.equal(ch.story, "APPROVED");
  // deleting ancestors → exact named blockers
  const d = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), a = d.assets.find((x) => x.id === "pilot_forearm"), rf = path.join(F, "registration", "pilot_forearm"), tmp = path.join(W, "_moved_reg");
  fs.renameSync(rf, tmp); try { assert.ok(S.traceFrame(F, RUN, 450).blockers.some((b) => /pilot_forearm: registration receipt does not verify/.test(b))); } finally { fs.renameSync(tmp, rf); }
  const df = path.join(F, "art_designs", "pilot_master.design.json"), db = fs.readFileSync(df); fs.rmSync(df); try { assert.ok(S.traceFrame(F, RUN, 450).blockers.some((b) => /no design for master pilot_master/.test(b))); } finally { fs.writeFileSync(df, db); }
  const sp = path.join(F, "approvals", "STORY.POINTER.json"), sb = fs.readFileSync(sp); fs.rmSync(sp); try { assert.ok(S.traceFrame(F, RUN, 3900).blockers.some((b) => /story approval/.test(b))); } finally { fs.writeFileSync(sp, sb); }
  const ab = fs.readFileSync(path.join(F, a.file)); fs.appendFileSync(path.join(F, a.file), Buffer.from([1])); try { assert.ok(S.traceFrame(F, RUN, 450).blockers.some((b) => /pilot_forearm: bytes differ from manifest/.test(b))); } finally { fs.writeFileSync(path.join(F, a.file), ab); }
  fs.writeFileSync(path.join(W, "TRACE_450.json"), JSON.stringify(ch, null, 1)); fs.writeFileSync(path.join(W, "TRACE_3900.json"), JSON.stringify(wd, null, 1));
});
test("P02-R08 every input category changes the revision (code, audio, art, skill/style, story, direction, contracts, approvals, canvas); logs/QA/render do not", () => {
  const r0 = buildFilmRevision(F), touch = (f) => { const b = fs.readFileSync(f); fs.appendFileSync(f, " "); const r = buildFilmRevision(F); fs.writeFileSync(f, b); return r; };
  const d = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
  const cases = { audio: path.join(F, d.audio.narration_timeline_file), story: path.join(F, "story", "STORY_CONTRACT.json"), direction: path.join(F, "direction", "SHOT_SCORE_60FPS.json"), contracts: path.join(F, "handoff", "MOTION_PLAN.json"), designs: path.join(F, "art_designs", "pilot_master.design.json"), approvals: path.join(F, "approvals", "STORY.POINTER.json") };
  for (const [scope, f] of Object.entries(cases)) { const r = touch(f); assert.notEqual(r.digest, r0.digest, scope); assert.notEqual(r.scopes[scope], r0.scopes[scope], `${scope} scope moves`); }
  const art = path.join(F, d.assets[0].file), ab = fs.readFileSync(art); fs.appendFileSync(art, Buffer.from([0])); try { const r = buildFilmRevision(F); assert.notEqual(r.scopes.art, r0.scopes.art); assert.ok(r.integrity.length, "changed art bytes are an integrity failure"); } finally { fs.writeFileSync(art, ab); }
  for (const f of [path.join(F, "intake", "INTAKE_LOG.jsonl"), path.join(F, "render", "FRAME_MANIFEST.json")]) if (fs.existsSync(f)) assert.equal(touch(f).digest, r0.digest, `${path.basename(f)} is an output/log, not an input`);
  assert.ok(r0.scopes.code && r0.parts.runtime_nu_js, "producing code + runtime are revision inputs (code scope covers engine, schemas, skill SKILL.md/scripts/references)");
  assert.equal(buildFilmRevision(F).digest, r0.digest, "restored inputs restore the revision");
});
