#!/usr/bin/env node
// Whole-film qualification (independent re-audit B3). Single-scene QA can never certify a film; this is the ONLY positive production path.
//   record-render --film DIR --mp4 FILE [--source ART_BRIDGE_CAPTURE|TEST_SYNTHETIC] [--frames-manifest JSON]  → render/FILM_RENDER_RECEIPT.json
//   check  --film DIR [--manifest REL]                       → qa/film/FILM_QA_RESULT.json (exit 0 only on production pass)
//   review --film DIR --reviewer NAME --verdict APPROVED|REJECTED [--human]   → hash-scoped FILM receipt (only after every automated gate passes)
// Gates: coverage (all shots tile the film's own [0,total_frames) at 60 fps) · manifest_production (human-attested, non-stale approvals; no diagnostic art) ·
// registration_evidence (every asset's registration receipt verified by content) · shots_qa (per-shot QA results exist, pass their
// mechanical/registration/review gates, and were produced on the CURRENT asset hashes) · transitions (every continuous transition compiles
// with anchor residual < 1e-6 on every frame) · audio (recorded narration + measured word alignment) · render (receipt bound to the
// manifest; MP4 hash, 1920×1080, 60/1 fps, exactly total_frames frames, total_frames/60 s, audio stream present) · human_film_review (FILM receipt over all of
// the above, re-hashed on every run). TEST_TRUST (ART_BRIDGE_TEST_TRUST=1) may waive provenance/attestation/synthetic render for tests only,
// and the verdict then says PRODUCTION_PASS_UNDER_TEST_TRUST — never PRODUCTION_PASS.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runCheck } from "./art_bridge_check.mjs";
import { verifyRegistrationReceipt } from "../art_bridge/registration_evidence.mjs";
import { compileTransition } from "../art_bridge/transitions.mjs";
import { writeReceipt, verifyApproval, attestHuman, bundleHash, testTrust } from "../art_bridge/approvals.mjs";
import { buildFilmRevision, checkTiling } from "../film/film_revision.mjs";
import { verifyRenderReceipt } from "../film/segment_render.mjs";
import { computeLayers } from "../film/qa_layers.mjs";
import { verifyShotQA, verifyUnlikeTransfer } from "../film/evidence_auth.mjs";
import { runQA } from "./art_bridge_qa.mjs";
import { validateNarrationTimeline, assertNotDiagnostic } from "../story/narration.mjs";
const ALIGNERS = new Set(["montreal-forced-aligner", "aeneas", "whisperx", "gentle"]);

const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json", fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), W = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 1)); };
const MEASURED = new Set(["forced_alignment", "measured", "aligned"]);
export function probe(mp4) {
  const v = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-count_frames", "-show_entries", "stream=codec_type,width,height,r_frame_rate,nb_read_frames,duration", "-show_entries", "format=duration", "-of", "json", mp4], { encoding: "utf8" }));
  const vs = v.streams.find((s) => s.codec_type === "video"), as = v.streams.find((s) => s.codec_type === "audio");
  return { width: vs?.width, height: vs?.height, r_frame_rate: vs?.r_frame_rate, frames: +vs?.nb_read_frames, video_duration: +(vs?.duration ?? v.format.duration), audio_duration: as ? +as.duration : null, format_duration: +v.format.duration };
}

/** recordFilmRender — the render pipeline's receipt for the final MP4, bound to the manifest it was rendered from */
export function recordFilmRender({ film, mp4, source = "ART_BRIDGE_CAPTURE", framesManifest = null, manifest = MF }) {
  const FILM = path.resolve(film), p = probe(mp4), rec = { mp4: path.relative(FILM, path.resolve(mp4)).split(path.sep).join("/"), mp4_sha256: fsha(mp4), probe: p, source, manifest_sha256: fsha(path.join(FILM, manifest)), frames_manifest: framesManifest, recorded_at: new Date().toISOString() };
  W(path.join(FILM, "render", "CLAIMED_RENDER_RECEIPT.json"), { ...rec, source_claim_only: true, note: "a CLI --source claim is recorded for audit but is NEVER render authority; only engine/film/segment_render.mjs#renderFilm writes RENDER_COMPLETION_RECEIPT.json" }); return rec;
}

async function gatesFor(FILM, manifest, check, doc) {
  const revision = buildFilmRevision(FILM, { manifest });
  const g = {}, why = {}, trust = testTrust(FILM), TF = doc.stage.total_frames; // the film's own length (variable)
  // 1 coverage
  const cov = check.coverage, gaps = check.errors.filter((e) => e.code === "SHOT_COVERAGE_GAP");
  g.coverage = doc.stage.fps === 60 && Number.isInteger(doc.stage.total_frames) && doc.stage.total_frames > 0 && cov?.framesCovered === doc.stage.total_frames && gaps.length === 0; why.coverage = { fps: doc.stage.fps, total_frames: doc.stage.total_frames, frames_covered: cov?.framesCovered, gaps: gaps.map((e) => e.frame_range) };
  // 2 manifest in production mode (human approvals, no diagnostic art unless TEST_TRUST waives provenance)
  const prodErr = check.errors.filter((e) => !(trust && e.code === "UNQUALIFIED_STYLE_ASSET"));
  g.manifest_production = prodErr.length === 0; why.manifest_production = { errors: prodErr.slice(0, 20).map((e) => `${e.code} ${e.record_id}: ${e.human_readable_reason}`), provenance_waived_under_test_trust: trust && check.errors.some((e) => e.code === "UNQUALIFIED_STYLE_ASSET") };
  // 3 registration evidence by content
  const reg = doc.assets.map((a) => ({ id: a.id, ...verifyRegistrationReceipt(FILM, doc, a) })), badReg = reg.filter((r) => !r.ok);
  g.registration_evidence = doc.assets.length > 0 && badReg.length === 0; why.registration_evidence = badReg.map((r) => `${r.id}: ${r.reasons.join("; ")}`);
  // 4 per-shot QA on current hashes
  // F082: QA files are indices; the registered executor is RE-RUN on the current revision and artistic review is a verified receipt
  const shotRes = []; for (const s of doc.shots) { const v = await verifyShotQA(FILM, doc, s, revision.digest, runQA, manifest), f = path.join(FILM, "qa", "shots", s.id, "QA_RESULT.json"); shotRes.push({ shot: s.id, ok: v.ok, qa_sha256: fs.existsSync(f) ? fsha(f) : null, why: v.ok ? null : v.why }); }
  g.shots_qa = shotRes.every((r) => r.ok); why.shots_qa = shotRes.filter((r) => !r.ok).map((r) => `${r.shot}: ${r.why}`);
  // 5 transitions
  const tr = doc.transitions.map((t) => { if (t.mode === "CUT") return { id: `${t.from_shot}->${t.to_shot}`, ok: true, mode: "CUT" }; try { const c = compileTransition(doc.shots.find((s) => s.id === t.from_shot), doc.shots.find((s) => s.id === t.to_shot), t, { doc }); let mx = 0; for (let f = t.frame_range[0]; f < t.frame_range[1]; f++) mx = Math.max(mx, ...c.frameAt(f).anchor_residuals_px); return { id: c.id, ok: mx < 1e-6, anchor_max: mx }; } catch (e) { return { id: `${t.from_shot}->${t.to_shot}`, ok: false, why: e.message }; } });
  g.transitions = tr.every((x) => x.ok); why.transitions = tr.filter((x) => !x.ok);
  // 6 audio (directive J2/P04): recorded narration + a narration timeline with a MEASURED forced alignment (registered aligner, tool version,
  //   output hash) bound to the script/audio hashes; a JSON field saying "measured" is not evidence
  const ntf = doc.audio?.narration_timeline_file && path.join(FILM, doc.audio.narration_timeline_file), nf = doc.audio?.narration_file && path.join(FILM, doc.audio.narration_file), scriptF = doc.audio?.script_file && path.join(FILM, doc.audio.script_file);
  let nv = null; if (ntf && fs.existsSync(ntf)) { const nt = J(ntf); nv = validateNarrationTimeline(nt, { scriptFile: scriptF, audioFile: nf }); const tool = nt.alignment?.tool, outF = nt.alignment?.output_file && path.join(FILM, nt.alignment.output_file);
    if (!ALIGNERS.has(tool) && !(trust && tool === "fixture-aligner")) nv.errors.push({ code: "NARRATION_NOT_MEASURED", reason: `aligner ${tool} is not a registered forced aligner` });
    if (!outF || !fs.existsSync(outF) || fsha(outF) !== nt.alignment?.output_sha256) nv.errors.push({ code: "NARRATION_NOT_MEASURED", reason: "the aligner output file is missing or does not match its recorded hash" }); }
  g.audio = !!(nf && fs.existsSync(nf) && nv && nv.errors.length === 0); why.audio = { narration: nf && fs.existsSync(nf) ? path.relative(FILM, nf) : null, timeline: ntf && fs.existsSync(ntf) ? path.relative(FILM, ntf) : null, errors: nv ? nv.errors : ["no narration timeline (recorded audio + measured alignment)"] };
  // 7 render (directive J1/J3/P06): ONLY the render-completion receipt written by renderFilm on THIS revision; sampled frames must re-render
  //   identically; the MP4 must be 1920x1080, 60/1 fps, the film's total_frames and duration, with an audio stream
  const vr = await verifyRenderReceipt(FILM, revision), rr = vr.receipt || null, rwhy = [...vr.reasons], rp = rr?.probe || null;
  if (rp) { if (rp.width !== 1920 || rp.height !== 1080) rwhy.push(`size ${rp.width}x${rp.height}`); if (rp.r_frame_rate !== "60/1") rwhy.push(`fps ${rp.r_frame_rate}`); if (rp.frames !== TF) rwhy.push(`frames ${rp.frames} != ${TF}`);
    if (Math.abs(rp.video_duration - TF / 60) > 1 / 60 + 1e-6) rwhy.push(`duration ${rp.video_duration}`); if (rp.audio_duration === null) rwhy.push("no audio stream"); else if (Math.abs(rp.audio_duration - TF / 60) > 0.05) rwhy.push(`audio duration ${rp.audio_duration}`); }
  if (rr && !trust) { try { assertNotDiagnostic({ provenance: rr.renderer_provenance }); } catch (e) { rwhy.push(`renderer provenance ${rr.renderer_provenance} cannot qualify a film (${e.code})`); } if (rr.renderer_provenance !== "ART_BRIDGE_CAPTURE" && rr.renderer_provenance !== "DIAGNOSTIC_ONLY") rwhy.push(`renderer provenance ${rr.renderer_provenance} cannot qualify a film`); }
  const tiling = checkTiling(doc.shots, doc.transitions, TF); if (!tiling.ok) { g.coverage = false; why.coverage = { ...why.coverage, tiling: tiling.failures }; }
  // unlike transfer: at least two passages from different families qualified by the same producers (real provider art unless test trust)
  // F078: the unlike-transfer JSON is an index; each passage must resolve a verified provider→asset→registration→approval→review chain
  const ut = verifyUnlikeTransfer(FILM, doc, revision.digest, process.env.ART_BRIDGE_OUTBOX || null); g.unlike_transfer = ut.ok; why.unlike_transfer = ut.ok ? ut.passages : ut.why;
  if (revision.integrity.length) { rwhy.push(`asset bytes differ from the manifest: ${revision.integrity.map((x) => x.asset).join(", ")}`); }
  g.render = rwhy.length === 0; why.render = { reasons: rwhy, probe: rp, renderer_provenance: rr?.renderer_provenance ?? null, revision: revision.digest };
  return { g, why, shotRes, rr, revision };
}

export function filmBundle(FILM, manifest, doc, shotRes, rr) {
  return { scope: "film", id: doc.project_id, manifest_sha256: fsha(path.join(FILM, manifest)), asset_hashes: Object.fromEntries(doc.assets.map((a) => [a.id, a.sha256])), shot_qa_sha256: Object.fromEntries(shotRes.map((s) => [s.shot, s.qa_sha256 ?? null])),
    render_receipt_sha256: fs.existsSync(path.join(FILM, "render", "RENDER_COMPLETION_RECEIPT.json")) ? fsha(path.join(FILM, "render", "RENDER_COMPLETION_RECEIPT.json")) : null, film_revision: buildFilmRevision(FILM, { manifest }).digest, mp4_sha256: rr?.mp4_sha256 ?? null,
    audio: Object.fromEntries(["narration_file", "narration_timeline_file"].map((k) => [k, doc.audio?.[k] && fs.existsSync(path.join(FILM, doc.audio[k])) ? fsha(path.join(FILM, doc.audio[k])) : null])) };
}

export async function qualifyFilm({ film, manifest = MF }) {
  const FILM = path.resolve(film), check = await runCheck({ root: FILM, manifest, production: true }), doc = J(path.join(FILM, manifest)), { g, why, shotRes, rr } = await gatesFor(FILM, manifest, check, doc);
  const automated = Object.values(g).every(Boolean), ptrF = path.join(FILM, "qa", "film", "FILM_REVIEW_POINTER.json"), ptr = fs.existsSync(ptrF) ? J(ptrF).receipt_id : null;
  const v = verifyApproval(doc, FILM, "film", doc.project_id, ptr, { requireHuman: true, bundle: filmBundle(FILM, manifest, doc, shotRes, rr) });
  g.human_film_review = automated && v.ok; why.human_film_review = v.ok ? { receipt: ptr, reviewer_kind: v.reviewer_kind } : { status: v.status, reason: v.reason };
  const trust = testTrust(FILM), diag = (why.render?.renderer_provenance && why.render.renderer_provenance !== "ART_BRIDGE_CAPTURE") || why.manifest_production.provenance_waived_under_test_trust || v.reviewer_kind === "TEST_TRUSTED";
  const lay = computeLayers({ schema: g.coverage, mechanical: g.registration_evidence && g.transitions && g.shots_qa, realArt: g.manifest_production && g.shots_qa, unlike: g.unlike_transfer, fullFilm: g.audio && g.render && g.human_film_review, testTrust: trust, diagnosticProvenance: !!diag });
  const pass = Object.values(g).every(Boolean);
  const res = { stage: "WHOLE_FILM_QUALIFICATION", film: doc.project_id, gates: g, details: why, automated_gates_pass: automated, production_pass: pass && lay.verdict === "PRODUCTION_PASS", verdict: pass ? lay.verdict : "FAIL", layers: lay.layers, failing_layers: lay.failing_layers, film_revision: why.render.revision, test_trust: testTrust(), checked_at: new Date().toISOString() };
  res.exit_code = res.verdict === "PRODUCTION_PASS" ? 0 : res.verdict === "TEST_PASS" ? 2 : 1; // TEST_PASS is never a production exit code
  W(path.join(FILM, "qa", "film", "FILM_QA_RESULT.json"), res); return res;
}

/** reviewFilm — the film receipt; refused unless every automated gate passes on the current hashes */
export async function reviewFilm({ film, manifest = MF, reviewer, verdict, notes = "", human = false, attestation = null }) {
  const FILM = path.resolve(film), check = await runCheck({ root: FILM, manifest, production: true }), doc = J(path.join(FILM, manifest)), { g, why, shotRes, rr } = await gatesFor(FILM, manifest, check, doc);
  if (!Object.values(g).every(Boolean)) throw new Error(`refused: automated film gates fail (${Object.entries(g).filter(([, v]) => !v).map(([k]) => k).join(", ")})`);
  const bundle = filmBundle(FILM, manifest, doc, shotRes, rr), att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null);
  const r = writeReceipt(FILM, doc, { scope: "film", id: doc.project_id, reviewer, verdict, notes, bundle, attestation: att, evidence: ["qa/film/FILM_QA_RESULT.json", "render/FILM_RENDER_RECEIPT.json"] });
  W(path.join(FILM, "qa", "film", "FILM_REVIEW_POINTER.json"), { receipt_id: verdict === "APPROVED" ? r.receipt_id : null, last_decision: r.receipt_id, verdict, at: r.reviewed_at });
  return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}

if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  try {
    if (a[0] === "record-render") { console.log(JSON.stringify(recordFilmRender({ film: get("--film"), mp4: get("--mp4"), source: get("--source") || "ART_BRIDGE_CAPTURE", framesManifest: get("--frames-manifest") }), null, 1)); process.exit(0); }
    if (a[0] === "check") { const r = await qualifyFilm({ film: get("--film"), manifest: get("--manifest") || MF }); console.log(`${r.verdict} gates=${JSON.stringify(r.gates)}`); process.exit(r.exit_code); }
    if (a[0] === "review") { console.log(JSON.stringify(await reviewFilm({ film: get("--film"), reviewer: get("--reviewer"), verdict: get("--verdict"), notes: get("--notes") || "", human: a.includes("--human") }), null, 1)); process.exit(0); }
  } catch (e) { console.error(`REFUSED: ${e.message}`); process.exit(1); }
  console.error("usage: art_bridge_film_qa.mjs record-render --film DIR --mp4 FILE [--source S] | check --film DIR | review --film DIR --reviewer NAME --verdict V [--human]"); process.exit(2);
}
