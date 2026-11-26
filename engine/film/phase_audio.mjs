// P08 F01 — one integer sample clock for phases. 48 kHz, 800 samples per 60 fps frame; a phase [a,b) owns samples [a·800, b·800). Each cue is a
// byte-verified take placed by integer samples: timeline sample = source sample − file_in_sample + timeline_clip_start_sample (applied once).
// A cue crossing a phase boundary is placed in BOTH phases from its exact source offset, so the concatenation of the phases' PCM is bit-identical
// to the continuous placement (no truncated tail, no duplicated onset). No normalisation or time-stretch happens here (dialogue is never
// stretched to old estimates); gain is a declared constant. Final loudness/mix happens once on the assembled film.
import fs from "node:fs"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
export const SR = 48000, FPS = 60, SPF = SR / FPS;
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
/** readWav(file) → {sr, channels, bits, samples: Float32Array (mono, first channel)} for PCM 16/24-bit and float32 WAV */
export function readWav(file) {
  const b = fs.readFileSync(file); if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 8, 12) !== "WAVE") throw err("PHASE_AUDIO_INVALID", { record_id: file, reason: "not a RIFF/WAVE file", failed_invariant: "WAV" });
  let o = 12, fmt = null, data = null; while (o + 8 <= b.length) { const id = b.toString("ascii", o, o + 4), n = b.readUInt32LE(o + 4); if (id === "fmt ") fmt = { tag: b.readUInt16LE(o + 8), ch: b.readUInt16LE(o + 10), sr: b.readUInt32LE(o + 12), bits: b.readUInt16LE(o + 22) }; if (id === "data") data = b.subarray(o + 8, o + 8 + n); o += 8 + n + (n & 1); }
  if (!fmt || !data) throw err("PHASE_AUDIO_INVALID", { record_id: file, reason: "WAV without fmt/data", failed_invariant: "WAV" });
  const bps = fmt.bits / 8, n = Math.floor(data.length / (bps * fmt.ch)), out = new Float32Array(n);
  for (let i = 0; i < n; i++) { const p = i * bps * fmt.ch; out[i] = fmt.tag === 3 ? data.readFloatLE(p) : fmt.bits === 16 ? data.readInt16LE(p) / 32768 : fmt.bits === 24 ? (data.readIntLE(p, 3)) / 8388608 : NaN; }
  return { sr: fmt.sr, channels: fmt.ch, bits: fmt.bits, samples: out };
}
export function writeWav32f(file, samples) { const h = Buffer.alloc(44), n = samples.length * 4; h.write("RIFF", 0); h.writeUInt32LE(36 + n, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(3, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(32, 34); h.write("data", 36); h.writeUInt32LE(n, 40);
  fs.writeFileSync(file, Buffer.concat([h, Buffer.from(samples.buffer, samples.byteOffset, n)])); return sha(fs.readFileSync(file)); }
/** phaseAudio(cues) — cues: [{cue_id, file, sha256, file_in_sample, file_out_sample_exclusive, timeline_clip_start_sample, gain_db}] (verified once) */
export function phaseAudio(cues) {
  const loaded = cues.map((c) => { if (!fs.existsSync(c.file)) throw err("AUDIO_INPUT_MISSING", { record_id: c.cue_id, reason: `take ${c.file} is missing`, failed_invariant: "TAKE_PRESENT" }); const s = sha(fs.readFileSync(c.file)); if (s !== c.sha256) throw err("AUDIO_SYNC_MISMATCH", { record_id: c.cue_id, reason: `take bytes ${s.slice(0, 12)} ≠ approved ${c.sha256.slice(0, 12)} (wrong take)`, failed_invariant: "TAKE_SHA" });
    for (const k of ["file_in_sample", "file_out_sample_exclusive", "timeline_clip_start_sample"]) if (!Number.isInteger(c[k])) throw err("PHASE_AUDIO_INVALID", { record_id: c.cue_id, reason: `${k} must be an integer sample (no fractional/guessed placement)`, failed_invariant: "INTEGER_SAMPLES" });
    const w = readWav(c.file); if (w.sr !== SR) throw err("PHASE_AUDIO_INVALID", { record_id: c.cue_id, reason: `take is ${w.sr} Hz; the film clock is ${SR} (convert losslessly with a new hash first)`, failed_invariant: "SAMPLE_RATE" });
    if (c.file_out_sample_exclusive > w.samples.length || c.file_in_sample < 0 || c.file_out_sample_exclusive <= c.file_in_sample) throw err("PHASE_AUDIO_INVALID", { record_id: c.cue_id, reason: "trim interval outside the take", failed_invariant: "TRIM_INSIDE_TAKE" });
    return { ...c, pcm: w.samples, gain: Math.pow(10, (c.gain_db ?? 0) / 20), t0: c.timeline_clip_start_sample, t1: c.timeline_clip_start_sample + (c.file_out_sample_exclusive - c.file_in_sample) }; });
  const byId = new Map(loaded.map((c) => [c.cue_id, c]));
  return { spf: SPF, cues: loaded.map(({ pcm, ...c }) => c),
    /** render [s0, s1) of the timeline (mono float32) */
    render(s0, s1) { const out = new Float32Array(s1 - s0); for (const c of loaded) { const a = Math.max(s0, c.t0), b = Math.min(s1, c.t1); for (let t = a; t < b; t++) out[t - s0] += c.gain * c.pcm[t - c.t0 + c.file_in_sample]; } return out; },
    crossingAt(s) { return loaded.filter((c) => c.t0 < s && s < c.t1).map((c) => ({ cue_id: c.cue_id, take_sha256: c.sha256, boundary_sample: s, source_sample_at_boundary: s - c.t0 + c.file_in_sample, remaining_samples: c.t1 - s })); },
    placementOf: (id) => byId.get(id) ? { cue_id: id, t0: byId.get(id).t0, t1: byId.get(id).t1 } : null,
    sourceSampleAt: (id, s) => { const c = byId.get(id); return c ? s - c.t0 + c.file_in_sample : null; } };
}
