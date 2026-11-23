// Directive J — P01 exact tiling, P02 chunk restart determinism + crash/resume, P03 revision invalidation, P04 measured narration anchors,
// P05 render negatives (no audio, wrong fps, black frame, sentinel edge, gap), P08 layered verdicts (test → TEST_PASS only), P07/P09 stay
// external without real art + human review. Diagnostic renderer only (labelled); nothing here is film art.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "film_qa_new");
const FR = await import("../../engine/film/film_revision.mjs"), SR = await import("../../engine/film/segment_render.mjs"), QL = await import("../../engine/film/qa_layers.mjs"), N = await import("../../engine/story/narration.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const tempFilm = (tag) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(path.join(REPO, "films", "hv2_film001"), d, { recursive: true, filter: (s) => !s.includes(`${path.sep}qa${path.sep}`) && !s.includes(`${path.sep}render${path.sep}`) }); fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "DIAGNOSTIC fixture film\n"); return d; };

test("P01 the film's shots tile [0,7200) exactly; gaps, double ownership and off-boundary transitions are refused", () => {
  const doc = J(path.join(REPO, "films", "hv2_film001", "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), ok = FR.checkTiling(doc.shots, doc.transitions, 7200); assert.equal(ok.ok, true, JSON.stringify(ok.failures));
  const gap = doc.shots.map((s) => ({ ...s })); gap[2].start_frame += 1; assert.ok(FR.checkTiling(gap, [], 7200).failures.some((f) => /owned by no shot/.test(f.reason)));
  const dup = doc.shots.map((s) => ({ ...s })); dup[2].start_frame -= 1; assert.ok(FR.checkTiling(dup, [], 7200).failures.some((f) => /owned twice/.test(f.reason)));
  assert.ok(FR.checkTiling(doc.shots, [{ from_shot: "S01", to_shot: "S03" }], 7200).failures.some((f) => /shared boundary/.test(f.reason)));
});

test("P02 chunk renders are deterministic: seek == sequential, a transient crash is retried to identical bytes, a nondeterministic renderer fails re-render verification", async () => {
  const d = tempFilm("p02"), rev = FR.buildFilmRevision(d), W = { width: 160, height: 90 }, s1 = await SR.diagnosticFlatSession({ ...W, seed: 7 });
  const seq = await SR.renderChunk(s1, [0, 600]), s2 = await SR.diagnosticFlatSession({ ...W, seed: 7 }), seek = []; for (const f of [599, 5, 300, 299]) seek.push(crypto.createHash("sha256").update((await s2.renderFrame(f)).rgb).digest("hex"));
  assert.deepEqual(seek, [599, 5, 300, 299].map((f) => seq.hashes[f]), "absolute seek (out of order, fresh session) equals sequential rendering");
  const a = await SR.renderFilm({ film: d, revision: rev, ...W, total: 600, chunkSize: 120, seed: 7, outName: "a.mp4" }), ma = J(path.join(d, "render", "FRAME_MANIFEST.json"));
  fs.rmSync(path.join(d, "render", "chunks"), { recursive: true, force: true });
  const b = await SR.renderFilm({ film: d, revision: rev, ...W, total: 600, chunkSize: 120, seed: 7, outName: "b.mp4", inject: { crashAt: { frame: 250, attempts: 1, transient: true } } }), mb = J(path.join(d, "render", "FRAME_MANIFEST.json"));
  assert.equal(mb.chunks.map((c) => c.chunk_sha256).join(), ma.chunks.map((c) => c.chunk_sha256).join(), "a retried transient crash cannot change content");
  const exp = []; for (const [s, e] of SR.planChunks(600, 120)) exp.push((await SR.renderChunk(await SR.diagnosticFlatSession({ ...W, seed: 7 }), [s, e])).chunk_sha256); assert.equal(mb.chunks.map((c) => c.chunk_sha256).join(), exp.join());
  await assert.rejects(SR.renderFilm({ film: d, revision: rev, ...W, total: 600, chunkSize: 120, seed: 9, outName: "x.mp4", inject: { crashAt: { frame: 130, attempts: 5, transient: false } } }), (e) => e.code === "RENDER_CAPTURE_FAILURE" && /frame 130/.test(e.message), "a non-transient crash fails the chunk with its frame range");
  const after = await SR.verifyRenderReceipt(d, rev, {}); assert.equal(after.ok, true, `a failed render must not replace or corrupt the last verified receipt: ${after.reasons}`); assert.equal(after.receipt.mp4, "render/b.mp4");
  const d3 = tempFilm("p02n"); SR.RENDERERS.fixture_nondeterministic = { module: "tests/art_bridge/fixtures_black_frame_renderer.mjs", export: "nondeterministic", provenance: "DIAGNOSTIC_ONLY" };
  await SR.renderFilm({ film: d3, revision: FR.buildFilmRevision(d3), renderer: "fixture_nondeterministic", ...W, total: 120, chunkSize: 60 }); const v = await SR.verifyRenderReceipt(d3, FR.buildFilmRevision(d3), { samples: [0, 59, 60, 119] });
  assert.equal(v.ok, false); assert.ok(v.reasons.some((x) => /does not re-render identically/.test(x)), JSON.stringify(v.reasons));
  assert.equal(a.probe.frames, 600); assert.equal(b.probe.frames, 600);
});

test("P03 any upstream change (manifest, story, direction, motion plan, design, audio) changes the film revision and stales QA/render", async () => {
  const d = tempFilm("p03"), r0 = FR.buildFilmRevision(d).digest, touch = (rel) => { const f = path.join(d, rel), b = fs.readFileSync(f); fs.appendFileSync(f, " "); const r = FR.buildFilmRevision(d).digest; fs.writeFileSync(f, b); return r; };
  for (const rel of ["handoff/ART_AND_MOTION_MANIFEST_V2.json", "direction/EXPERIENCE_DIRECTOR_PROPOSAL.md", "direction/SHOT_SCORE_60FPS.json", "handoff/MOTION_PLAN_S02.json", "art_designs/ines_master.design.json"]) assert.notEqual(touch(rel), r0, rel);
  assert.equal(FR.buildFilmRevision(d).digest, r0, "restored inputs restore the revision");
  assert.equal(FR.buildFilmRevision(d).parts.runtime_nu_js, crypto.createHash("sha256").update(fs.readFileSync(path.join(REPO, "engine", "runtime", "nu.js"))).digest("hex"), "the runtime hash is part of the revision");
  await SR.renderFilm({ film: d, revision: FR.buildFilmRevision(d), width: 160, height: 90, total: 120, chunkSize: 60 });
  fs.appendFileSync(path.join(d, "direction", "SHOT_SCORE_60FPS.json"), " "); const v = await SR.verifyRenderReceipt(d, FR.buildFilmRevision(d)); assert.equal(v.ok, false); assert.ok(v.reasons.some((x) => /different film revision/.test(x)));
});

test("P04 measured narration places critical events; a changed word time moves the event frame; estimated timing blocks", () => {
  const words = [{ w: "one", start_s: 2.0, end_s: 2.2 }, { w: "turn", start_s: 2.5, end_s: 2.9 }], base = { script_sha256: "s", audio_sha256: "a", alignment: { method: "FORCED_ALIGNMENT", tool: "x", tool_version: "1", output_sha256: "o", confidence: 0.9, words }, cues: [{ id: "drum_spin", word_index: 1, critical: true }] };
  assert.equal(N.validateNarrationTimeline(base).anchors[0].frame, 150);
  const moved = JSON.parse(JSON.stringify(base)); moved.alignment.words[1].start_s = 2.75; assert.equal(N.validateNarrationTimeline(moved).anchors[0].frame, 165);
  assert.ok(N.validateNarrationTimeline({ ...base, alignment: { ...base.alignment, method: "ESTIMATED" } }).errors.some((e) => e.code === "NARRATION_NOT_MEASURED"));
});

test("P05 render negatives: no audio stream, wrong fps, black frame, sentinel (uncovered) pixels each fail verification", async () => {
  const d = tempFilm("p05"), rev = FR.buildFilmRevision(d), na = await SR.renderFilm({ film: d, revision: rev, width: 160, height: 90, total: 120, chunkSize: 60, outName: "na.mp4" }); assert.equal(na.probe.audio_duration, null);
  const f30 = await SR.renderFilm({ film: d, revision: rev, width: 160, height: 90, total: 60, chunkSize: 60, fps: 30, outName: "f30.mp4" }); assert.equal(f30.probe.r_frame_rate, "30/1");
  assert.deepEqual(SR.frameDefects(Buffer.alloc(30)), { kind: "BLACK_FRAME" }); assert.equal(SR.frameDefects(Buffer.from([255, 0, 255, 10, 10, 10])).kind, "SENTINEL_PIXELS"); assert.equal(SR.frameDefects(Buffer.from([1, 2, 3])), null);
  const d2 = tempFilm("p05b"); SR.RENDERERS.diagnostic_black_at_30 = { module: "tests/art_bridge/fixtures_black_frame_renderer.mjs", export: "blackAt30", provenance: "DIAGNOSTIC_ONLY" };
  await SR.renderFilm({ film: d2, revision: FR.buildFilmRevision(d2), renderer: "diagnostic_black_at_30", width: 160, height: 90, total: 60, chunkSize: 60 }); const v = await SR.verifyRenderReceipt(d2, FR.buildFilmRevision(d2), { samples: [0] }); assert.ok(v.reasons.some((x) => /frame 30: BLACK_FRAME/.test(x)), JSON.stringify(v.reasons));
});

test("P08 layered verdicts: every layer on test/diagnostic evidence → TEST_PASS only; any missing layer → FAIL; P07/P09 stay unproven without real art", () => {
  const all = { schema: true, mechanical: true, realArt: true, unlike: true, fullFilm: true };
  assert.equal(QL.computeLayers({ ...all, testTrust: true }).verdict, "TEST_PASS"); assert.equal(QL.computeLayers({ ...all, diagnosticProvenance: true }).verdict, "TEST_PASS"); assert.equal(QL.computeLayers(all).verdict, "PRODUCTION_PASS");
  const real = QL.computeLayers({ schema: true, mechanical: true }); assert.equal(real.verdict, "FAIL"); assert.deepEqual(real.failing_layers, ["REAL_ART_MOTION_PASS", "UNLIKE_TRANSFER_PASS", "FULL_FILM_REVIEWED"]); assert.equal(real.layers.REAL_ART_MOTION_PASS, "NOT_EVALUATED");
});
