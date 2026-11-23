// Audio buses (P03 repair H). ONE timing system: everything is addressed in FILM FRAMES at doc.stage.fps (sample time = frame / fps), the same
// integers the motion compiler, the acting compiler (speech → mouth swaps) and the renderer use. Buses:
//   narration  — one file placed at frame 0 (or `at_frame`), gain;   music — one file, gain, sidechain-ducked under narration;
//   sfx        — [{id, file, frame, gain_db}] each placed at its exact frame (adelay in samples, not rounded ms).
// The mix is two-pass loudness normalised (EBU R128 loudnorm, measured then applied linearly) and padded/trimmed to exactly total_frames/fps.
// Sync is then PROVEN from the decoded output PCM: onsets are detected from the signal (never read back from the cue list) and compared with
// the frame of every SFX cue and every narration word; ducking depth and integrated loudness are MEASURED. Failures: AUDIO_SYNC_MISMATCH /
// AUDIO_MIX_FAILED. Nothing here judges sound design quality.
import fs from "node:fs"; import crypto from "node:crypto"; import { execFileSync, spawnSync } from "node:child_process";
import { err } from "../art_bridge/errors.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
function require_spawn(args) { const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args], { encoding: "utf8", maxBuffer: 1 << 26 }); if (r.status !== 0) throw err("AUDIO_MIX_FAILED", { reason: `ffmpeg ${r.status}: ${String(r.stderr).slice(-600)}`, producer: "engine/film/audio_mix.mjs" }); return r.stderr; }
/** decode any audio file to mono float32 PCM at `rate` */
export function decodePcm(file, rate = 48000) { const r = spawnSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-ac", "1", "-ar", String(rate), "-f", "f32le", "pipe:1"], { maxBuffer: 1 << 30 }); if (r.status !== 0) throw err("AUDIO_MIX_FAILED", { reason: `decode ${file}: ${String(r.stderr).slice(0, 300)}` }); const b = r.stdout; return new Float32Array(b.buffer, b.byteOffset, b.length / 4); }
/** onsets from the signal (robust to a stationary bed and to overlapping sources): 5 ms RMS window at 1 ms hop; a candidate is the first hop whose
 *  window RMS exceeds ratio × the mean window RMS of the preceding [base_ms) and rises by ≥ min_rise (refractory window between onsets); the
 *  onset is then REFINED to the first sample whose |x| exceeds peak_ratio × the peak |x| of the preceding 30 ms (sub-millisecond, no lag) */
export function detectOnsets(pcm, rate = 48000, { ratio = 1.5, min_rise = 0.02, base_ms = [60, 10], refractory_ms = 60, win_ms = 5, peak_ratio = 1.3 } = {}) {
  const hop = Math.round(rate / 1000), win = win_ms * hop, env = []; for (let i = 0; i + win <= pcm.length; i += hop) { let s = 0; for (let k = 0; k < win; k++) s += pcm[i + k] * pcm[i + k]; env.push(Math.sqrt(s / win)); }
  const out = []; let last = -1e9;
  for (let m = base_ms[0]; m < env.length; m++) { let b = 0; for (let q = m - base_ms[0]; q < m - base_ms[1]; q++) b += env[q]; b /= base_ms[0] - base_ms[1];
    if (env[m] >= ratio * b && env[m] - b >= min_rise && m - last >= refractory_ms) { const s0 = m * hop, p0 = Math.max(0, s0 - 30 * hop); let pk = 0; for (let k = p0; k < s0; k++) pk = Math.max(pk, Math.abs(pcm[k]));
      let t = s0; for (let k = s0; k < s0 + win && k < pcm.length; k++) if (Math.abs(pcm[k]) > peak_ratio * pk) { t = k; break; } out.push(t / rate); last = m + win_ms; } }
  return out;
}
const rms = (pcm, rate, a, b) => { let s = 0, n = 0; for (let i = Math.max(0, Math.floor(a * rate)); i < Math.min(pcm.length, Math.floor(b * rate)); i++) { s += pcm[i] * pcm[i]; n++; } return n ? Math.sqrt(s / n) : 0; };
const db = (x) => 20 * Math.log10(Math.max(x, 1e-9));
/** mixBuses → {file, receipt}. All placement in frames. */
export function mixBuses({ out, fps, total_frames, narration = null, music = null, sfx = [], loudness = { target_lufs: -16, true_peak: -1.5, lra: 11 }, rate = 48000, duck = { threshold: 0.03, ratio: 8, attack: 5, release: 250 } }) {
  if (!Number.isInteger(total_frames) || total_frames <= 0) throw err("AUDIO_MIX_FAILED", { reason: "total_frames must be a positive integer" });
  const dur = total_frames / fps, inputs = [], parts = [], labels = []; let n = 0;
  const add = (file) => { if (!fs.existsSync(file)) throw err("MISSING_ART_ASSET", { record_id: file, reason: "audio bus file missing", producer: "engine/film/audio_mix.mjs#mixBuses" }); inputs.push("-i", file); return n++; };
  const samp = (frame) => Math.round((frame / fps) * rate); // sample-exact placement from the frame clock
  if (narration) { const i = add(narration.file); parts.push(`[${i}:a]aresample=${rate},aformat=channel_layouts=stereo,adelay=${samp(narration.at_frame || 0)}S|${samp(narration.at_frame || 0)}S,volume=${narration.gain_db ?? 0}dB,asplit=2[nar][key]`); labels.push("[nar]"); }
  if (music) { const i = add(music.file); parts.push(`[${i}:a]aresample=${rate},aformat=channel_layouts=stereo,volume=${music.gain_db ?? 0}dB[mus0]`);
    if (narration) { parts.push(`[mus0][key]sidechaincompress=threshold=${duck.threshold}:ratio=${duck.ratio}:attack=${duck.attack}:release=${duck.release},asplit=2[mus][musstem]`); } else parts.push(`[mus0]asplit=2[mus][musstem]`); labels.push("[mus]"); }
  else if (narration) parts.push(`[key]anullsink`);
  sfx.forEach((c, k) => { const i = add(c.file); parts.push(`[${i}:a]aresample=${rate},aformat=channel_layouts=stereo,adelay=${samp(c.frame)}S|${samp(c.frame)}S,volume=${c.gain_db ?? 0}dB[sfx${k}]`); labels.push(`[sfx${k}]`); });
  if (!labels.length) throw err("AUDIO_MIX_FAILED", { reason: "no audio bus supplied" });
  const graph = `${parts.join(";")};${labels.join("")}amix=inputs=${labels.length}:normalize=0:dropout_transition=0,apad,atrim=0:${dur.toFixed(6)}[mix]`;
  // pass 1: measure loudness of the raw mix
  const pre = `${out}.premix.wav`, stem = music ? out.replace(/\.wav$/i, "") + ".music_stem_ducked.wav" : null, stemGraph = music ? `${graph};[musstem]apad,atrim=0:${dur.toFixed(6)}[stem]` : graph;
  require_spawn(["-y", ...inputs, "-filter_complex", stemGraph, "-map", "[mix]", "-ar", String(rate), "-c:a", "pcm_s24le", pre, ...(stem ? ["-map", "[stem]", "-ar", String(rate), "-c:a", "pcm_s24le", stem] : [])]);
  const meas = require_spawn(["-i", pre, "-af", `loudnorm=I=${loudness.target_lufs}:TP=${loudness.true_peak}:LRA=${loudness.lra}:print_format=json`, "-f", "null", "-"]), mj = JSON.parse(meas.slice(meas.lastIndexOf("{"), meas.lastIndexOf("}") + 1));
  // pass 2: linear normalisation with the measured values, exact duration
  require_spawn(["-y", "-i", pre, "-af", `loudnorm=I=${loudness.target_lufs}:TP=${loudness.true_peak}:LRA=${loudness.lra}:measured_I=${mj.input_i}:measured_TP=${mj.input_tp}:measured_LRA=${mj.input_lra}:measured_thresh=${mj.input_thresh}:offset=${mj.target_offset}:linear=true,aresample=${rate},atrim=0:${dur.toFixed(6)}`, "-ar", String(rate), "-c:a", "pcm_s24le", out]);
  fs.rmSync(pre, { force: true });
  return { file: out, sha256: fsha(out), music_stem_ducked: stem, duration_s: dur, rate, buses: { narration: narration ? { file: narration.file, sha256: fsha(narration.file), gain_db: narration.gain_db ?? 0, at_frame: narration.at_frame || 0 } : null, music: music ? { file: music.file, sha256: fsha(music.file), gain_db: music.gain_db ?? 0, ducked_by: narration ? "narration" : null, duck } : null, sfx: sfx.map((c) => ({ id: c.id, frame: c.frame, file: c.file, sha256: fsha(c.file), gain_db: c.gain_db ?? 0 })) }, loudness_pass1: mj, loudness_target: loudness };
}
/** verifyAudioSync — measured from the decoded MIX: SFX + narration word onsets vs their frames; ducking depth; integrated loudness */
export function verifyAudioSync({ mix, fps, sfx = [], words = [], music = null, narration = null, tolerance_ms = 4, target_lufs = null, lufs_tolerance = 1, min_duck_db = 6, onset = {} }) {
  const rate = 48000, pcm = decodePcm(mix, rate), failures = [], expect = [...sfx.map((c) => ({ id: c.id, kind: "SFX", t: c.frame / fps, frame: c.frame })), ...words.map((w, i) => ({ id: `word${i}:${w.w}`, kind: "WORD", t: Math.round(w.start_s * fps) / fps, frame: Math.round(w.start_s * fps) }))];
  const on = detectOnsets(pcm, rate, onset), rows = expect.map((x) => { const near = on.reduce((b, t) => (Math.abs(t - x.t) < Math.abs(b - x.t) ? t : b), Infinity), off = (near - x.t) * 1000; const ok = Math.abs(off) <= tolerance_ms; if (!ok) failures.push(err("AUDIO_SYNC_MISMATCH", { record_id: x.id, frame_range: [x.frame, x.frame + 1], reason: `measured onset ${(near * 1000).toFixed(2)} ms vs frame ${x.frame} (${(x.t * 1000).toFixed(2)} ms): ${off.toFixed(2)} ms > ${tolerance_ms} ms`, producer: "engine/film/audio_mix.mjs#verifyAudioSync" })); return { ...x, measured_s: Number.isFinite(near) ? +near.toFixed(6) : null, offset_ms: Number.isFinite(off) ? +off.toFixed(3) : null, ok }; });
  const lo = require_spawn(["-i", mix, "-af", "ebur128=framelog=quiet", "-f", "null", "-"]), mI = lo.match(/I:\s+(-?[\d.]+) LUFS/g), integrated = mI ? +mI.at(-1).match(/-?[\d.]+/)[0] : null;
  // ducking: MEASURED on the ducked music stem the mixer actually summed (narration window vs a music-only reference window)
  let duck = null;
  if (music?.stem && narration) { const sp = decodePcm(music.stem, rate), [n0, n1] = narration.window_s, [r0, r1] = music.reference_window_s, during = db(rms(sp, rate, n0, n1)), ref = db(rms(sp, rate, r0, r1)); duck = { stem_rms_db_under_narration: +during.toFixed(2), stem_rms_db_reference: +ref.toFixed(2), depth_db: +(ref - during).toFixed(2) };
    if (!(ref - during >= min_duck_db)) failures.push(err("AUDIO_MIX_FAILED", { record_id: "music_duck", reason: `music ducks ${(ref - during).toFixed(2)} dB under narration (< ${min_duck_db} dB)` })); }
  if (integrated !== null && Number.isFinite(target_lufs) && Math.abs(integrated - target_lufs) > lufs_tolerance) failures.push(err("AUDIO_MIX_FAILED", { record_id: "loudness", reason: `integrated ${integrated} LUFS vs target ${target_lufs}` }));
  return { ok: failures.length === 0, failures, onsets_detected: on.length, cues: rows, integrated_lufs: integrated, duck, mix_sha256: fsha(mix), method: "onsets detected from decoded mix PCM (1 ms RMS envelope + sample refinement); EBU R128 integrated loudness via ffmpeg ebur128" };
}
/** muxAV(video, audio, out): stream-copy video + AAC audio; durations probed */
export function muxAV(video, audio, out) { require_spawn(["-y", "-i", video, "-i", audio, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", out]); const pr = (f, s) => +execFileSync("ffprobe", ["-v", "error", "-select_streams", s, "-show_entries", "stream=duration", "-of", "csv=p=0", f], { encoding: "utf8" }).trim(); return { file: out, sha256: fsha(out), video_s: pr(out, "v:0"), audio_s: pr(out, "a:0") }; }
