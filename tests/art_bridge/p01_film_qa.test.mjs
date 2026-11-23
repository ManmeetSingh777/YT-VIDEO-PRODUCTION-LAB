// Re-audit B3: whole-film qualification has a positive path and fails on every required negative. Runs under ART_BRIDGE_TEST_TRUST=1 (this process
// only): DIAGNOSTIC provenance, TEST_TRUSTED reviews and the DIAGNOSTIC renderer are accepted ONLY here and the verdict is then TEST_PASS
// (directive J3/P08) — never PRODUCTION_PASS. The diagnostic frames/tone are labelled test media, not a film. Renders go through the ONE
// render-completion path (engine/film/segment_render.mjs#renderFilm); a CLI source claim is never render authority (P06).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
import { runRoundTrip } from "./roundtrip_fixture.mjs";
import * as I from "../../engine/art_bridge/art_intake.mjs";
import { runQA } from "../../engine/tools/art_bridge_qa.mjs";
import { qualifyFilm, reviewFilm, recordFilmRender } from "../../engine/tools/art_bridge_film_qa.mjs";
import { renderFilm } from "../../engine/film/segment_render.mjs";
import { buildFilmRevision } from "../../engine/film/film_revision.mjs";
import crypto from "node:crypto";
import { writeReceipt } from "../../engine/art_bridge/approvals.mjs";
import { shotReviewBundle, unlikeBundle } from "../../engine/film/evidence_auth.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const render = (d, o = {}) => renderFilm({ film: d, revision: buildFilmRevision(d), audio: path.join(d, "audio", "narration_TEST_TONE.wav"), ...o });

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p01", "film_qa");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json", T = { method: "TEST_TRUST" }, op = { reviewer: "film-qa-test-operator", scope_note: "TEST_TRUST fixture" };
const ff = (...args) => execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...args]);
const synthMp4 = (file, { fps = 60, frames = 7200, audio }) => ff("-f", "lavfi", "-i", `color=c=gray:s=1920x1080:r=${fps}`, "-i", audio, "-frames:v", String(frames), "-c:v", "libx264", "-preset", "ultrafast", "-crf", "45", "-pix_fmt", "yuv420p", "-c:a", "aac", "-t", "120", file);
let film;
const copy = (tag) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(film, d, { recursive: true }); return d; };

before(async () => {
  const rt = await runRoundTrip(path.join(W, "rt")); film = rt.film;
  // re-review under labelled test trust (the round trip's own reviews are DIAGNOSTIC and are refused by production gates)
  await I.reviewMaster({ film, identity: "pilot", verdict: "APPROVED", attestation: T, ...op }); await I.reviewMaster({ film, identity: "rt_world", verdict: "APPROVED", attestation: T, ...op });
  for (const k of ["body", "upper_arm", "forearm", "underpaint", "hand_open", "hand_grip"]) await I.reviewPart({ film, asset: `pilot_${k}`, verdict: "APPROVED", attestation: T, ...op });
  for (const s of ["open", "grip"]) await I.approveState({ film, rig: "pilot_rig", state: s, verdict: "APPROVED", attestation: T, ...op });
  await I.approveStateEdge({ film, rig: "pilot_rig", from: "open", to: "grip", verdict: "APPROVED", attestation: T, ...op });
  // audio: synthetic tone + measured-alignment TEST fixture
  fs.mkdirSync(path.join(film, "audio"), { recursive: true }); ff("-f", "lavfi", "-i", "sine=frequency=220:duration=120", path.join(film, "audio", "narration_TEST_TONE.wav"));
  // narration timeline fixture: the "fixture-aligner" is honoured ONLY under test trust (registered aligners are required in production)
  fs.writeFileSync(path.join(film, "audio", "script_TEST.txt"), "test"); fs.writeFileSync(path.join(film, "audio", "alignment_output_TEST.json"), JSON.stringify([{ w: "test", start_s: 1.0, end_s: 1.4 }]));
  fs.writeFileSync(path.join(film, "audio", "narration_timeline_TEST.json"), JSON.stringify({ provenance: "TEST_FIXTURE", script_sha256: fsha(path.join(film, "audio", "script_TEST.txt")), audio_sha256: fsha(path.join(film, "audio", "narration_TEST_TONE.wav")), alignment: { method: "FORCED_ALIGNMENT", tool: "fixture-aligner", tool_version: "0", confidence: 1, output_file: "audio/alignment_output_TEST.json", output_sha256: fsha(path.join(film, "audio", "alignment_output_TEST.json")), words: [{ w: "test", start_s: 1.0, end_s: 1.4 }] }, cues: [{ id: "c1", word_index: 0, critical: true }] }));
  const d = J(path.join(film, MF)); d.audio.narration_file = "audio/narration_TEST_TONE.wav"; d.audio.narration_timeline_file = "audio/narration_timeline_TEST.json"; d.audio.script_file = "audio/script_TEST.txt"; fs.writeFileSync(path.join(film, MF), JSON.stringify(d, null, 1));
  // per-shot QA on a camera plan that stays inside the painted plate
  const plan = J(path.join(film, "handoff", "MOTION_PLAN.json")); plan.cameras.cam_world.zoom = [[3600, 1.9]]; fs.writeFileSync(path.join(film, "handoff", "MOTION_PLAN_FILMQA.json"), JSON.stringify(plan));
  for (const [s, fr] of [["rt_shot", [0, 99, 100, 101, 450, 3599]], ["rt_world_shot", [3600, 3900, 7199]]]) await runQA({ root: film, manifest: MF, scene: s, out: path.join(film, "qa", "shots", s), plan: path.join(film, "handoff", "MOTION_PLAN_FILMQA.json"), frames: fr, argv: ["node", "art_bridge_qa.mjs"] });
  // F078/F082: shot QA is re-executed by film QA; artistic review is a receipt over the re-executed evidence (TEST_TRUST only in this namespace)
  const doc = J(path.join(film, MF));
  for (const s of ["rt_shot", "rt_world_shot"]) { const qa = J(path.join(film, "qa", "shots", s, "QA_RESULT.json")), rc = writeReceipt(film, doc, { scope: "shot_review", id: s, verdict: "APPROVED", attestation: T, bundle: shotReviewBundle(s, qa), ...op }); fs.writeFileSync(path.join(film, "qa", "shots", s, "SHOT_REVIEW_POINTER.json"), JSON.stringify({ receipt_id: rc.receipt_id })); }
  // unlike transfer: an INDEX of passages; each resolves asset bytes → registration → approval → a review receipt over the passage on this revision
  const rev = buildFilmRevision(film).digest, passages = [{ id: "acting_reach", family: "ACTING_HUMAN", asset_ids: ["pilot_body", "pilot_forearm", "pilot_hand_grip"], frame_samples: [99, 100, 101] }, { id: "world_plate", family: "ENVIRONMENT_PLATE", asset_ids: ["rt_world_far"], frame_samples: [3600, 7199] }];
  for (const p of passages) p.review_receipt_id = writeReceipt(film, doc, { scope: "unlike_transfer", id: p.id, verdict: "APPROVED", attestation: T, bundle: unlikeBundle(p, rev, doc), ...op }).receipt_id;
  fs.mkdirSync(path.join(film, "qa", "film"), { recursive: true }); fs.writeFileSync(path.join(film, "qa", "film", "UNLIKE_TRANSFER.json"), JSON.stringify({ provenance: "DIAGNOSTIC_FIXTURE", passages }, null, 1));
  await render(film);
});

test("B3-1 single-scene QA never certifies a film (whole_film_pass false)", () => {
  for (const s of ["rt_shot", "rt_world_shot"]) { const r = J(path.join(film, "qa", "shots", s, "QA_RESULT.json")); assert.equal(r.gates.whole_film_pass, false); assert.equal(r.gates.mechanical_fixture_pass, true, `${s} ${JSON.stringify(r.gates)}`); assert.equal(r.gates.artistic_review_pass, true); }
});
test("B3-2 automated gates pass; without a film review the verdict is FAIL", async () => {
  const r = await qualifyFilm({ film }); assert.equal(r.automated_gates_pass, true, JSON.stringify(r.details, null, 1).slice(0, 1500)); assert.equal(r.gates.human_film_review, false); assert.equal(r.verdict, "FAIL");
});
test("B3-3 positive path: film receipt after all gates → TEST_PASS (never PRODUCTION_PASS under test trust or diagnostic rendering)", async () => {
  const rv = await reviewFilm({ film, reviewer: "film-qa-test-operator", verdict: "APPROVED", attestation: T }); assert.equal(rv.reviewer_kind, "TEST_TRUSTED");
  const r = await qualifyFilm({ film }); assert.equal(r.verdict, "TEST_PASS", JSON.stringify(r.layers)); assert.equal(r.production_pass, false); assert.ok(Object.values(r.gates).every(Boolean));
});
test("B3-4 rerun re-hashes: a replaced MP4 fails render and stales the film receipt", async () => {
  const d = copy("neg_mp4_replaced"); fs.appendFileSync(path.join(d, "render", "film.mp4"), Buffer.from([0]));
  const r = await qualifyFilm({ film: d }); assert.equal(r.verdict, "FAIL"); assert.equal(r.gates.render, false); assert.equal(r.gates.human_film_review, false);
});
test("B3-5 negatives: missing shot, missing audio, stale art, 30-fps file, missing frame", async () => {
  { const d = copy("neg_missing_shot"), m = J(path.join(d, MF)); m.shots = m.shots.filter((s) => s.id !== "rt_world_shot"); m.shots[0].continuity_to = null; fs.writeFileSync(path.join(d, MF), JSON.stringify(m, null, 1)); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.coverage, false); assert.equal(r.verdict, "FAIL"); }
  { const d = copy("neg_missing_audio"); fs.rmSync(path.join(d, "audio", "narration_TEST_TONE.wav")); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.audio, false); assert.equal(r.verdict, "FAIL"); }
  { const d = copy("neg_stale_art"), m = J(path.join(d, MF)), a = m.assets.find((x) => x.id === "pilot_hand_grip"); fs.appendFileSync(path.join(d, a.file), Buffer.from([0])); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.manifest_production, false); assert.equal(r.verdict, "FAIL"); }
  { const d = copy("neg_30fps"); await render(d, { fps: 30, total: 3600 }); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.render, false); assert.match(r.details.render.reasons.join(" "), /fps 30\/1/); }
  { const d = copy("neg_missing_frame"); await render(d, { total: 7199 }); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.render, false); assert.match(r.details.render.reasons.join(" "), /frames 7199/); }
});
test("B3-6 without test trust the same package is refused (diagnostic art, non-human reviews, synthetic render)", async () => {
  delete process.env.ART_BRIDGE_TEST_TRUST;
  try { const r = await qualifyFilm({ film: copy("prod_mode") }); assert.equal(r.verdict, "FAIL"); assert.equal(r.gates.manifest_production, false); assert.equal(r.gates.render, false); assert.match(r.details.render.reasons.join(" "), /DIAGNOSTIC_ONLY/); }
  finally { process.env.ART_BRIDGE_TEST_TRUST = "1"; }
});

test("B3-7 F078/F082 negatives: an edited QA boolean, a missing shot review, a forged unlike PASS, one family only, or a revision change each fail", async () => {
  { const d = copy("neg_qa_bool"), f = path.join(d, "qa", "shots", "rt_shot", "QA_RESULT.json"), q = J(f); q.gates.art_registration_pass = !q.gates.art_registration_pass; fs.writeFileSync(f, JSON.stringify(q)); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.shots_qa, false); assert.equal(r.verdict, "FAIL"); }
  { const d = copy("neg_no_shot_review"); fs.rmSync(path.join(d, "qa", "shots", "rt_world_shot", "SHOT_REVIEW_POINTER.json")); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.shots_qa, false); }
  { const d = copy("neg_forged_unlike"), f = path.join(d, "qa", "film", "UNLIKE_TRANSFER.json"); fs.writeFileSync(f, JSON.stringify({ passages: [{ family: "ACTING_HUMAN", pass: true }, { family: "MACHINE_OR_MECHANISM", pass: true }] })); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.unlike_transfer, false); }
  { const d = copy("neg_one_family"), f = path.join(d, "qa", "film", "UNLIKE_TRANSFER.json"), u = J(f); u.passages = u.passages.slice(0, 1); fs.writeFileSync(f, JSON.stringify(u)); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.unlike_transfer, false); assert.match(JSON.stringify(r.details.unlike_transfer), /two materially unlike families/); }
  { const d = copy("neg_revision"); fs.appendFileSync(path.join(d, "handoff", "MOTION_PLAN.json"), " "); const r = await qualifyFilm({ film: d }); assert.equal(r.gates.shots_qa, false); assert.equal(r.verdict, "FAIL"); }
});

test("P06 a stub/synthetic MP4 recorded through the CLI source flag can never become the render", async () => {
  const d = copy("p06_claim"); fs.rmSync(path.join(d, "render", "RENDER_COMPLETION_RECEIPT.json")); const mp4 = path.join(d, "render", "film.mp4");
  recordFilmRender({ film: d, mp4, source: "ART_BRIDGE_CAPTURE" }); const r = await qualifyFilm({ film: d });
  assert.equal(r.gates.render, false); assert.match(r.details.render.reasons.join(" "), /no render-completion receipt/); assert.ok(fs.existsSync(path.join(d, "render", "CLAIMED_RENDER_RECEIPT.json")));
});
