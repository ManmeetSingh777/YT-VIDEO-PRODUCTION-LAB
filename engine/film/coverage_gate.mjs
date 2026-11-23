// Whole-film coverage gate (P02 directive F090 + F075). Mechanical, every-frame checks computed from the REAL render receipts (per-frame RGB
// hashes and expected-state hashes recorded while rendering) joined to the frame trace index — never from a screenshot or a sample:
//  • every frame 0..total-1 is owned by a shot, a trace segment and a rendered chunk with a recorded hash;
//  • every promised action, approved art state (rig pose), camera track, effect, blur interval, transition boundary and measured sound cue maps
//    to rendered frames;
//  • MOVING intervals (trace segments that are not a static hold: active rig state, moving camera, effect) must show real pixel change —
//    a frozen/duplicated substitution over a declared moving interval is INERT_ACTION_INTERVAL; a declared static hold MAY repeat pixels;
//  • frames whose expected state changed while the pixels did not are FROZEN_FRAME (from the render scan).
// A pass proves mechanical coverage only; artistic readability, rhythm and style remain an independent human review (never implied here).
import fs from "node:fs"; import path from "node:path";
import { stateIntervals } from "../art_bridge/asset_state.mjs";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
/** coverageGate({FILM, index, doc, plan, narration}) → {ok, failures[], coverage{}} */
export function coverageGate({ FILM, index, doc, plan = null, narration = null }) {
  const F = path.resolve(FILM), mf = J(path.join(F, "render", "FRAME_MANIFEST.json")), total = doc.stage.total_frames, failures = [], hashes = new Array(total).fill(null), states = new Array(total).fill(null);
  for (const c of mf.chunks) { const rc = J(path.join(F, c.mkv.replace(/\.mkv$/, ".json"))); rc.hashes.forEach((h, i) => { hashes[c.frames[0] + i] = h; }); (rc.state_hashes || []).forEach((h, i) => { states[c.frames[0] + i] = h; }); for (const d of c.defects || []) failures.push({ code: d.kind === "FROZEN_FRAME" ? "FROZEN_FRAME" : "RENDER_CAPTURE_FAILURE", frame_ranges: [[d.frame, d.frame + 1]], reason: `${d.kind}${d.reason ? ": " + d.reason : ""}` }); }
  const missing = hashes.map((h, f) => (h ? -1 : f)).filter((f) => f >= 0); if (missing.length || mf.total !== total) failures.push({ code: "COVERAGE_GAP", frame_ranges: [[missing[0] ?? mf.total, total]], reason: `${missing.length} of ${total} frames have no rendered hash (render total ${mf.total})` });
  const owned = (f) => index.segments.find((s) => s.frames[0] <= f && f < s.frames[1]);
  let unowned = 0; for (let f = 0; f < total; f++) if (!owned(f)?.shot) unowned++; if (unowned) failures.push({ code: "COVERAGE_GAP", reason: `${unowned} frames not owned by any shot segment` });
  const rendered = (s, e) => { if (!(Number.isInteger(s) && Number.isInteger(e)) || s < 0 || e > total || e <= s) return false; for (let f = s; f < e; f++) if (!hashes[f]) return false; return true; };
  const items = [...doc.actions.map((a) => ["action", a.id, a.frame_range]), ...stateIntervals(doc).map((x) => ["art_state", `${x.rig}:${x.pose}`, x.interval]), ...doc.shots.filter((s) => s.camera_track_id).map((s) => ["camera", s.camera_track_id, [s.start_frame, s.end_frame]]),
    ...(plan?.effects || []).map((e) => ["effect", e.id, e.frames]), ...(plan?.motion_blur || []).map((b, i) => ["blur", `blur${i}`, b.frames]), ...(doc.transitions || []).map((t) => ["transition", `${t.from_shot}->${t.to_shot}`, t.frame_range || [doc.shots.find((s) => s.id === t.to_shot)?.start_frame - 1, doc.shots.find((s) => s.id === t.to_shot)?.start_frame + 1]]),
    ...doc.shots.slice(1).map((s) => ["shot_boundary", s.id, [s.start_frame - 1, s.start_frame + 1]]), ...((narration?.cues || []).map((c) => { const w = narration.alignment?.words?.[c.word_index]; const fr = w ? Math.round(w.start_s * doc.stage.fps) : null; return ["sound_cue", c.id, fr === null ? [0, 0] : [fr, fr + 1]]; }))];
  const cov = {}; for (const [kind, id, fr] of items) { const ok = rendered(fr[0], fr[1]); (cov[kind] ||= []).push({ id, frames: fr, rendered: ok }); if (!ok) failures.push({ code: "COVERAGE_GAP", record_id: id, frame_ranges: [fr], reason: `${kind} ${id} maps to no rendered frames` }); }
  // moving intervals must change pixels; static holds may repeat
  const moving = []; for (const s of index.segments) { const [a, b] = s.frames; if (b - a < 2) continue; const distinct = new Set(hashes.slice(a, b)).size, stateDistinct = new Set(states.slice(a, b)).size;
    if (s.static_hold) continue; moving.push({ frames: s.frames, distinct_pixel_frames: distinct, distinct_states: stateDistinct });
    if (stateDistinct > 1 && distinct === 1) failures.push({ code: "INERT_ACTION_INTERVAL", frame_ranges: [s.frames], reason: `segment ${a}..${b - 1} (${s.actions.join(",") || s.camera_track || s.effects.join(",")}) changes expected state ${stateDistinct}× but renders ONE identical image (frozen substitution)` }); }
  return { ok: failures.length === 0, failures, coverage: cov, frames_hashed: total - missing.length, moving_intervals: moving.length, static_holds: index.segments.filter((s) => s.static_hold).length, note: "mechanical coverage only; artistic review stays an independent human gate" };
}
