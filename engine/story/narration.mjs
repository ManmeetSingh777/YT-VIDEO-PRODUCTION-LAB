// Narration timeline (directive G5/J2; F057, F065). One immutable timeline binds the approved script hash, the recorded audio hash and a
// MEASURED forced alignment (tool + version + output hash). Critical cues may only resolve to measured words; estimates are refused.
// Any script/audio change invalidates every word-linked frame anchor. The timed animatic is DIAGNOSTIC_ONLY and can never pass art/film gates.
import fs from "node:fs"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), sha = (s) => crypto.createHash("sha256").update(JSON.stringify(s)).digest("hex");
export const FPS = 60;
/** validateNarrationTimeline(nt, {scriptFile, audioFile}) → {ok, errors, anchors}. Words: [{w, start_s, end_s}]; cues: [{id, word_index, critical}] */
export function validateNarrationTimeline(nt, { scriptFile = null, audioFile = null } = {}) {
  const errors = [], al = nt.alignment || {};
  if (scriptFile && (!fs.existsSync(scriptFile) || fsha(scriptFile) !== nt.script_sha256)) errors.push({ code: "STALE_DEPENDENCY", record_id: "script", reason: "approved script changed (or missing) since alignment: every word-linked anchor is stale" });
  if (audioFile && (!fs.existsSync(audioFile) || fsha(audioFile) !== nt.audio_sha256)) errors.push({ code: "STALE_DEPENDENCY", record_id: "audio", reason: "narration audio changed (or missing) since alignment" });
  const measured = al.method === "FORCED_ALIGNMENT" && al.tool && al.tool_version && al.output_sha256 && Number.isFinite(al.confidence);
  for (const c of nt.cues || []) { const w = (al.words || [])[c.word_index];
    if (!w) { errors.push({ code: "MISSING_WORD_ALIGNMENT", record_id: c.id, reason: `cue word ${c.word_index} absent` }); continue; }
    if (c.critical && !measured) errors.push({ code: "NARRATION_NOT_MEASURED", record_id: c.id, reason: `critical cue on "${w.w}" uses ${al.method || "no"} timing; only a recorded forced alignment (tool, version, output hash, confidence) can anchor it` }); }
  for (let i = 1; i < (al.words || []).length; i++) if (al.words[i].start_s < al.words[i - 1].start_s) errors.push({ code: "SCHEMA_VIOLATION", record_id: `word ${i}`, reason: "word starts are not monotonic" });
  const anchors = (nt.cues || []).filter((c) => al.words?.[c.word_index]).map((c) => ({ cue: c.id, frame: Math.floor(al.words[c.word_index].start_s * FPS + 1e-9), word: al.words[c.word_index].w }));
  return { ok: errors.length === 0, errors, anchors, timeline_sha256: sha({ s: nt.script_sha256, a: nt.audio_sha256, w: al.words, c: nt.cues }) };
}
/** P04 §2.5 — measured narration owns editorial time; the DIRECTOR decides how an event relates to a word (it is never pulled onto the word automatically).
 *  Cue: {id, word_index, critical?, relation: PRECEDES|LANDS_ON|FOLLOWS, event: <direction decision id | action id>, max_frames?, hold_frames?}
 *   • the event's first frame must stand in the declared relation to the measured word onset (LANDS_ON within max_frames, default 3; the others within max_frames, default 60);
 *   • hold_frames = a recognition hold: the shot may not end, and no other decision of the same owner may start, inside it;
 *   • any word list used elsewhere (speech acting, audio buses) must BE the measured words: an approximate list can never override the measurement. */
export function verifyNarrationRelations({ timeline, decisions = [], doc, plan = null, strict = false }) {
  const errors = [], words = timeline.alignment?.words || [], out = [], at = (w) => Math.round(w.start_s * FPS), add = (code, id, reason) => errors.push({ code, record_id: id, reason });
  const lists = [...Object.entries(plan?.acting || {}).filter(([, a]) => a.speech?.words?.length).map(([r, a]) => [`acting.${r}.speech`, a.speech.words]), ...(plan?.audio_buses?.words?.length ? [["audio_buses.words", plan.audio_buses.words]] : [])];
  for (const [id, l] of lists) { let k = 0; for (const x of l) { while (k < words.length && words[k].w !== x.w) k++; const m = words[k]; if (!m) { add("NARRATION_NOT_MEASURED", id, `word "${x.w}" is not in the measured alignment (in order)`); break; } if (Math.abs(m.start_s - x.start_s) > 1 / FPS || Math.abs(m.end_s - x.end_s) > 1 / FPS) add("NARRATION_NOT_MEASURED", id, `word "${x.w}" uses ${x.start_s}-${x.end_s}s but is measured at ${m.start_s}-${m.end_s}s: approximate timing cannot override the measurement`); k++; } }
  for (const c of timeline.cues || []) { const w = words[c.word_index]; if (!w) continue; if (!c.relation) { if (strict && c.critical) add("NARRATION_NOT_MEASURED", c.id, `critical cue "${w.w}" declares no relation to a visual event (PRECEDES, LANDS_ON or FOLLOWS is the director's decision)`); continue; }
    if (!["PRECEDES", "LANDS_ON", "FOLLOWS"].includes(c.relation)) { add("SCHEMA_VIOLATION", c.id, `unknown relation ${c.relation}`); continue; }
    const d = decisions.find((x) => x.id === c.event), a = doc.actions.find((x) => x.id === c.event), fr = d?.frames || a?.frame_range; if (!fr) { add("DIRECTION_DECISION_INERT", c.id, `cue names event ${c.event ?? "(none)"}, which is neither a direction decision nor an action`); continue; }
    const delta = fr[0] - at(w), max = c.max_frames ?? (c.relation === "LANDS_ON" ? 3 : 60), ok = c.relation === "LANDS_ON" ? Math.abs(delta) <= max : c.relation === "PRECEDES" ? delta < 0 && -delta <= max : delta > 0 && delta <= max;
    if (!ok) add("AUDIO_SYNC_MISMATCH", c.id, `event ${c.event} starts at frame ${fr[0]}, ${delta >= 0 ? `${delta} frames after` : `${-delta} frames before`} "${w.w}" (frame ${at(w)}); the direction says ${c.relation} within ${max} frames`);
    if (c.hold_frames) { const sh = doc.shots.find((s) => s.start_frame <= fr[0] && fr[0] < s.end_frame), end = fr[0] + c.hold_frames; if (!sh || sh.end_frame < end) add("CONTINUITY_BREAK", c.id, `recognition hold of ${c.hold_frames} frames is cut by the end of shot ${sh?.id} at ${sh?.end_frame}`); const own = d?.consuming_operation?.owner, clash = own && decisions.find((x) => x.id !== d.id && x.consuming_operation?.owner === own && x.consuming_operation?.operation !== "HOLD" && x.frames[0] > fr[0] && x.frames[0] < end); if (clash) add("CONTINUITY_BREAK", c.id, `decision ${clash.id} starts at ${clash.frames[0]} inside the ${c.hold_frames}-frame recognition hold`); }
    out.push({ cue: c.id, event: c.event, relation: c.relation, delta_frames: delta, ok }); }
  return { ok: errors.length === 0, errors, relations: out };
}
/** timedAnimatic(beats) — DIAGNOSTIC_ONLY timing proof (shapes stand in for art); its provenance can never pass an art or film gate */
export function timedAnimatic(beats, totalFrames = 7200) {
  const frames = beats.reduce((m, b) => Math.max(m, b.frames[1]), 0), errors = frames > totalFrames ? [{ code: "FRAME_TILING_GAP", reason: `beats need ${frames} frames > ${totalFrames}` }] : [];
  return { provenance: "DIAGNOSTIC_ONLY", watermark: "DIAGNOSTIC ANIMATIC — NOT FILM ART", beats: beats.map((b) => ({ id: b.id, frames: b.frames, shape: "diagnostic box", speech: b.speech || null })), fits: errors.length === 0, errors };
}
export function assertNotDiagnostic(artifact) { if (artifact?.provenance === "DIAGNOSTIC_ONLY") throw err("QA_LAYER_FAILED", { reason: "a DIAGNOSTIC_ONLY artifact (timed animatic / diagnostic shapes) cannot pass an art or film gate", producer: "engine/story/narration.mjs#assertNotDiagnostic" }); return true; }
