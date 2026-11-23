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
/** timedAnimatic(beats) — DIAGNOSTIC_ONLY timing proof (shapes stand in for art); its provenance can never pass an art or film gate */
export function timedAnimatic(beats, totalFrames = 7200) {
  const frames = beats.reduce((m, b) => Math.max(m, b.frames[1]), 0), errors = frames > totalFrames ? [{ code: "FRAME_TILING_GAP", reason: `beats need ${frames} frames > ${totalFrames}` }] : [];
  return { provenance: "DIAGNOSTIC_ONLY", watermark: "DIAGNOSTIC ANIMATIC — NOT FILM ART", beats: beats.map((b) => ({ id: b.id, frames: b.frames, shape: "diagnostic box", speech: b.speech || null })), fits: errors.length === 0, errors };
}
export function assertNotDiagnostic(artifact) { if (artifact?.provenance === "DIAGNOSTIC_ONLY") throw err("QA_LAYER_FAILED", { reason: "a DIAGNOSTIC_ONLY artifact (timed animatic / diagnostic shapes) cannot pass an art or film gate", producer: "engine/story/narration.mjs#assertNotDiagnostic" }); return true; }
