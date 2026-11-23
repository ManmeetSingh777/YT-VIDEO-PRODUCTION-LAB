#!/usr/bin/env node
// QA CLI (spec §5.1, §7.4, §11.6): node engine/tools/art_bridge_qa.mjs qa --manifest PATH --scene SHOT_ID --out DIR [--root ROOT] [--plan PLAN.json] [--frames a,b,c] [--mp4]
// Renders a motion witness for one shot through the real pipeline (manifest check → state coverage → compile → composeShot → nu.js capture),
// measures contacts/plants/footprint/failures on EVERY frame of the shot window, saves frames + programmatic result:
// {stage, pass, evidence_paths, missing_capabilities, missing_art, unverified_artistic_decisions, affected_frames, tested_revision,
//  tested_asset_hashes, frame_numbers, exact_cli, exit_code, reference_approval_ids, reviewer_verdict}. Nonzero exit on any hard failure.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runCheck } from "./art_bridge_check.mjs";
import { createAssetRegistry } from "../art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../art_bridge/temporal.mjs";
import { composeShot } from "../art_bridge/scene_graph.mjs";
import { buildComposition, capture } from "../art_bridge/render.mjs";
import { missingArtJobs } from "../art_bridge/art_requests.mjs";
import { err } from "../art_bridge/errors.mjs";
import { apply, dist } from "../art_bridge/math2d.mjs";
import { verifyRegistrationReceipt } from "../art_bridge/registration_evidence.mjs";
import { verifyAllApprovals, testTrust } from "../art_bridge/approvals.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

/** footSlideReport(compiled, actionId, [f0,f1]) — registered cel stance runs: the stance landmark's world position must not move while it is the stance foot */
export function footSlideReport(C, actionId, [f0, f1], tol = 0.5) {
  const cel = C.plan.cels?.[actionId]; if (!cel) return { stance_runs: [], foot_slide_errors: [], worst_slide_px: 0 };
  const runs = [], errors = []; let cur = null;
  for (let f = f0; f < f1; f++) {
    const c = C.celsAt(f)[0]; if (!c) continue;
    const e = cel.cycle[c.entry_index % cel.cycle.length], lm = e.stance || e.anchor, p = apply(c.matrix, C.assets.get(c.asset_id).landmarks[lm]);
    if (!cur || cur.landmark !== lm) { cur = { landmark: lm, frames: [f, f + 1], world: p, max_slide_px: 0 }; runs.push(cur); }
    else { cur.frames[1] = f + 1; cur.max_slide_px = Math.max(cur.max_slide_px, dist(p, cur.world)); }
  }
  for (const r of runs) if (r.max_slide_px > tol) errors.push(err("FOOT_SLIDE", { record_id: actionId, frame_range: r.frames, suggested_producer: "register cel placement on the planted landmark", reason: `${r.landmark} slides ${r.max_slide_px.toFixed(2)}px during its stance`, details: { landmark: r.landmark } }).toJSON());
  return { stance_runs: runs, foot_slide_errors: errors, worst_slide_px: Math.max(0, ...runs.map((r) => r.max_slide_px)) };
}

/** contact/plant/failure measurement over every frame of [f0,f1) */
export function measureWindow(C, shotId, [f0, f1]) {
  const failures = [], contacts = {}, frames = [];
  for (let f = f0; f < f1; f++) { if (C.shotAt(f)?.id !== shotId) continue; frames.push(f); const st = stateAtFrame(C, f);
    for (const e of st.failures) failures.push(e.toJSON ? e.toJSON() : e);
    for (const c of st.contacts) if (c.locked) { const k = `${c.action}:${c.socket}`; contacts[k] ||= { frames: 0, max_error_px: 0, allowed_error_px: c.allowed_error_px, type: c.contact_type }; contacts[k].frames++; contacts[k].max_error_px = Math.max(contacts[k].max_error_px, c.error_px); } }
  for (const aid of Object.keys(C.plan.cels || {})) failures.push(...footSlideReport(C, aid, [f0, f1]).foot_slide_errors);
  return { frames_evaluated: frames.length, failures, contacts };
}

export async function runQA({ root, manifest, scene, out, plan: planPath = null, frames: frameList = null, mp4 = false, mechanicalOnly = false, argv = process.argv }) {
  const t0 = Date.now(), result = { stage: "HYBRID_V2_QA", scene, pass: false, evidence_paths: [], missing_capabilities: [], missing_art: [], unverified_artistic_decisions: [], affected_frames: [], exact_cli: `node ${path.relative(REPO, argv[1] || "engine/tools/art_bridge_qa.mjs")} ${argv.slice(2).join(" ")}`, reference_approval_ids: [], reviewer_verdict: "PENDING_HUMAN_VISUAL_REVIEW" };
  result.inputs = { plan: planPath ? path.relative(root, path.resolve(planPath)).split(path.sep).join("/") : null, frames: frameList, scene, manifest }; // F082: recorded so film QA can RE-EXECUTE this run
  try { result.film_revision = (await import("../film/film_revision.mjs")).buildFilmRevision(root, { manifest }).digest; } catch { result.film_revision = null; } // directive J3: shot QA is bound to the film revision it ran on
  try { result.tested_revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(); } catch { result.tested_revision = null; }
  fs.mkdirSync(out, { recursive: true });
  const check = await runCheck({ root, manifest });
  fs.writeFileSync(path.join(out, "manifest_check.json"), JSON.stringify(check, null, 1)); result.evidence_paths.push(path.join(out, "manifest_check.json"));
  result.missing_art = check.art_jobs.map((j) => ({ artjob_id: j.artjob_id, state_kind: j.state_kind, root_dependency: j.root_dependency, frame_ranges: j.motion_context.frame_ranges }));
  // audio: critical events need measured word timing (spec §5.7); absence is reported, never guessed
  { const d0 = JSON.parse(fs.readFileSync(path.join(root, manifest), "utf8")), sh = d0.shots.find((s) => s.id === scene);
    if (!d0.audio?.word_alignment_file) { result.missing_capabilities.push("MISSING_WORD_ALIGNMENT: no recorded narration with measured word timing; critical narration-bound events cannot be certified"); if (sh) result.affected_frames.push({ code: "MISSING_WORD_ALIGNMENT", frames: [sh.start_frame, sh.end_frame] }); } }
  if (!check.pass) { result.affected_frames.push(...check.errors.filter((e) => e.frame_range).map((e) => ({ code: e.code, frames: e.frame_range }))); result.blocking_errors = check.errors;
    // art is missing, but rig/contact staging can still be proven: solve the constraint graph on every frame of the shot (no rendering, no art)
    if (planPath) { const d0 = JSON.parse(fs.readFileSync(path.join(root, manifest), "utf8")), sh = d0.shots.find((x) => x.id === scene);
      const plan0 = JSON.parse(fs.readFileSync(planPath, "utf8")); let acts = d0.actions.filter((a) => a.shot_id === scene), gaps = [];
      try { compileMotionTracks(acts, d0.shots, { doc: d0, plan: plan0, requireApproval: false }); } catch (e) { const bad = new Set((e.errors || []).filter((x) => x.code === "UNSUPPORTED_MOTION_CLASS" || x.code === "MISSING_TRANSITION_STATE").map((x) => x.record_id)); gaps = (e.errors || []).filter((x) => bad.has(x.record_id)).map((x) => x.toJSON()); acts = acts.filter((a) => !bad.has(a.id)); }
      try { const C0 = compileMotionTracks(acts, d0.shots, { doc: d0, plan: plan0, requireApproval: false }), fails = {}, contacts = {};
        for (let f = sh.start_frame; f < sh.end_frame; f++) { const r = C0.solveConstraints(f, C0.evalPrimary(f, sh), C0.contactsAt(f)); for (const e of r.failures) { const k = `${e.code}:${e.record_id}`; (fails[k] ||= []).push(f); } for (const c of r.solved) if (c.locked) { const k = `${c.action}:${c.socket}`; contacts[k] = Math.max(contacts[k] || 0, c.error_px); } }
        result.motion_feasibility = { note: "art-free staging check; state-edge approval deliberately not required here (reported by the manifest check)", status: Object.keys(fails).length ? "STAGING_FAILURES" : gaps.length ? "FEASIBLE_EXCEPT_DIRECTION_GAPS" : "FEASIBLE_WITHOUT_ART", direction_gaps: gaps, actions_solved: acts.map((a) => a.id), frames_evaluated: sh.end_frame - sh.start_frame, failures: Object.fromEntries(Object.entries(fails).map(([k, v]) => [k, { frames: v.length, first: v[0], last: v.at(-1) }])), locked_contact_max_error_px: contacts };
      } catch (e) { result.motion_feasibility = { note: "art-free staging check; state-edge approval deliberately not required here (reported by the manifest check)", status: "COMPILE_FAILED", errors: (e.errors || [e]).map((x) => (x.toJSON ? x.toJSON() : String(x))) }; } }
    result.gates = { mechanical_fixture_pass: false, art_registration_pass: false, artistic_review_pass: false, audio_alignment_pass: false, whole_film_pass: false, production_pass: false }; result.verdict_label = "FAIL";
    return finish(result, out, t0); }
  const reg = await createAssetRegistry(root, manifest), doc = reg.doc, shot = doc.shots.find((s) => s.id === scene);
  if (!shot) { result.blocking_errors = [{ code: "UNKNOWN_REFERENCE", human_readable_reason: `scene ${scene} is not a shot` }]; return finish(result, out, t0); }
  const plan = planPath ? JSON.parse(fs.readFileSync(planPath, "utf8")) : {};
  if (!planPath) result.missing_capabilities.push("NO_MOTION_PLAN: shot has no direction-owned motion plan; only static placement can be evaluated");
  let C; try { C = compileMotionTracks(doc.actions, doc.shots, { doc, plan }); } catch (e) { result.blocking_errors = (e.errors || [e]).map((x) => (x.toJSON ? x.toJSON() : { code: x.code, human_readable_reason: x.message })); return finish(result, out, t0); }
  const sc = composeShot(shot, reg, C, { prefix: `${scene}-` }), meas = measureWindow(C, shot.id, [shot.start_frame, shot.end_frame]), foot = sc.validateFootprint(shot.start_frame, shot.end_frame).map((e) => e.toJSON());
  const allFail = [...meas.failures, ...foot]; result.measurements = { ...meas, footprint_errors: foot }; result.affected_frames = allFail.filter((e) => e.frame_range).map((e) => ({ code: e.code, frames: e.frame_range, record_id: e.record_id }));
  const artFromMotion = missingArtJobs(allFail, { doc }); result.missing_art.push(...artFromMotion.jobs.map((j) => ({ artjob_id: j.artjob_id, state_kind: j.state_kind, root_dependency: j.root_dependency, frame_ranges: j.motion_context.frame_ranges })));
  // witness frames: shot start/end, every event frame ±1, contact boundaries
  const ev = new Set([shot.start_frame, shot.end_frame - 1]); for (const a of doc.actions) if (a.shot_id === shot.id) { for (const e of [...a.pose_events, ...a.view_events]) [e.frame - 1, e.frame, e.frame + 1].forEach((f) => ev.add(f)); for (const c of a.contact_events) [c.start_frame - 1, c.start_frame, c.start_frame + 1, Math.floor((c.start_frame + c.end_frame) / 2), c.end_frame - 1, c.end_frame].forEach((f) => ev.add(f)); }
  const frames = (frameList || [...ev]).filter((f) => f >= shot.start_frame && f < shot.end_frame).sort((p, q) => p - q), win = mp4 ? [shot.start_frame, Math.min(shot.end_frame, shot.start_frame + 7200)] : [Math.min(...frames), Math.max(...frames) + 1];
  const comp = buildComposition(path.join(out, "composition"), { id: `qa_${scene}`, scene: sc, frameRange: win, registry: reg });
  const cap = await capture(comp, root, mp4 ? Array.from({ length: win[1] - win[0] }, (_, i) => win[0] + i) : frames, path.join(out, "frames"), { id: `qa_${scene}` });
  result.render_failures = cap.failures; result.frame_numbers = mp4 ? win : frames; result.evidence_paths.push(...cap.files.filter((_, i) => !mp4 || i % 60 === 0));
  if (mp4) { const f = path.join(out, `${scene}.mp4`); execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "60", "-start_number", String(win[0]), "-i", path.join(out, "frames", "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", f]); result.ffprobe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames", "-of", "json", f], { encoding: "utf8" })).streams[0]; result.evidence_paths.push(f); }
  result.tested_asset_hashes = Object.fromEntries(reg.all().map((r) => [r.asset.id, r.asset.sha256]));
  result.reference_approval_ids = [...new Set(doc.assets.map((a) => a.approved_review_id).filter(Boolean))];
  const diag = doc.assets.filter((a) => a.provenance_class === "DIAGNOSTIC_FIXTURE").map((a) => a.id);
  if (diag.length) result.unverified_artistic_decisions.push(`${diag.length} DIAGNOSTIC_FIXTURE assets: whole-look artistry cannot be reviewed on fixtures`);
  // gates (audit P0-6): each read from real evidence; production requires all of them
  const sceneAssets = new Set(reg.preloadForShot(scene).map((r) => r.asset.id)), regOk = doc.assets.filter((a) => sceneAssets.has(a.id)).every((a) => (a.provenance_class !== "DIAGNOSTIC_FIXTURE" || testTrust(root)) && verifyRegistrationReceipt(root, doc, a).ok); // receipt CONTENT, not path existence
  const humanAp = verifyAllApprovals(doc, path.resolve(root), { requireHuman: true }); // artistic sign-off = HUMAN-attested receipts only (TEST_TRUSTED under test trust)
  const pending = [...humanAp.failures.map((f) => `${f.scope}:${f.record_id} ${f.status}`), ...humanAp.unreviewed.map((u) => `${u.scope}:${u.record_id} UNREVIEWED`)];
  if (pending.length) result.unverified_artistic_decisions.push(`${pending.length} art/state/edge approvals not verified by receipts: ${pending.slice(0, 8).join(", ")}${pending.length > 8 ? " …" : ""}`);
  const align = doc.audio?.word_alignment_file ? (() => { try { const w = JSON.parse(fs.readFileSync(path.join(root, doc.audio.word_alignment_file), "utf8")); return Object.values(w).flat().every((x) => ["forced_alignment", "measured", "aligned"].includes(x.method)); } catch { return false; } })() : false;
  result.gates = { mechanical_fixture_pass: allFail.length === 0 && cap.failures.length === 0 && result.missing_art.length === 0, art_registration_pass: regOk, artistic_review_pass: humanAp.failures.length === 0 && humanAp.unreviewed.length === 0 && (diag.length === 0 || testTrust(root)), audio_alignment_pass: align, whole_film_pass: false };
  result.gates.production_pass = Object.values(result.gates).every(Boolean); // whole_film_pass is always false here: only art_bridge_film_qa.mjs can certify a film
  result.test_trust = testTrust(root);
  result.gate_notes = { whole_film_pass: "single-scene QA never certifies the whole film", artistic_review_pass: "reads hash-scoped review receipts (approvals.mjs); a pending/absent/stale receipt keeps it false", audio_alignment_pass: "requires a word alignment file whose words are measured/forced-aligned" };
  result.mechanical_only = mechanicalOnly;
  result.pass = mechanicalOnly ? result.gates.mechanical_fixture_pass : result.gates.production_pass;
  result.verdict_label = result.gates.production_pass ? "PRODUCTION_PASS" : mechanicalOnly && result.gates.mechanical_fixture_pass ? (diag.length ? "MECHANICAL_FIXTURE_PASS" : "MECHANICAL_PASS") : "FAIL";
  return finish(result, out, t0);
}
function finish(r, out, t0) { r.gates ||= { mechanical_fixture_pass: false, art_registration_pass: false, artistic_review_pass: false, audio_alignment_pass: false, whole_film_pass: false, production_pass: false }; r.verdict_label ||= r.pass ? "PASS" : "FAIL"; r.exit_code = r.pass ? 0 : 1; r.elapsed_s = (Date.now() - t0) / 1000; r.evidence_paths = r.evidence_paths.map((p) => path.relative(REPO, path.resolve(p)).split(path.sep).join("/")); fs.writeFileSync(path.join(out, "QA_RESULT.json"), JSON.stringify(r, null, 1)); return r; }

if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  if (a[0] !== "qa" || !get("--manifest") || !get("--scene") || !get("--out")) { console.error("usage: art_bridge_qa.mjs qa --manifest PATH --scene SHOT_ID --out DIR [--root ROOT] [--plan PLAN.json] [--frames a,b] [--mp4] [--mechanical-only]"); process.exit(2); }
  const root = get("--root") || path.dirname(get("--manifest")), manifest = get("--root") ? get("--manifest") : path.basename(get("--manifest"));
  const r = await runQA({ root, manifest, scene: get("--scene"), out: get("--out"), plan: get("--plan"), frames: get("--frames") ? get("--frames").split(",").map(Number) : null, mp4: a.includes("--mp4"), mechanicalOnly: a.includes("--mechanical-only") });
  console.log(`${r.verdict_label || (r.pass ? "PASS" : "FAIL")} gates=${JSON.stringify(r.gates || {})} scene=${r.scene} frames=${JSON.stringify(r.frame_numbers || [])} failures=${(r.measurements?.failures || []).length + (r.render_failures || []).length} missing_art=${r.missing_art.length} → ${path.join(get("--out"), "QA_RESULT.json")}`);
  process.exit(r.exit_code);
}
