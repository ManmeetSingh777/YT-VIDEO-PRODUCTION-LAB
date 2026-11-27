// E01 caption correction: a cue clipped by an extract boundary is judged on its parent phase cue; a bracketed sound-event caption shows for its
// MEASURED event interval. Both are opt-in and proven; every other cue keeps the 1.0 s minimum. Synthetic sidecars (the E01 files are private).
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import os from "node:os"; import crypto from "node:crypto";
import { compileCaptions } from "../../engine/film/captions.mjs";
const W = fs.mkdtempSync(path.join(os.tmpdir(), "capcont-")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(W, f))).digest("hex");
const t = (s) => { const ms = Math.round(s * 1000), h = String(Math.floor(ms / 3600000)).padStart(2, "0"), m = String(Math.floor(ms / 60000) % 60).padStart(2, "0"), x = String(Math.floor(ms / 1000) % 60).padStart(2, "0"), r = String(ms % 1000).padStart(3, "0"); return [`${h}:${m}:${x},${r}`, `${h}:${m}:${x}.${r}`]; };
const write = (base, cues) => { fs.writeFileSync(path.join(W, `${base}.srt`), cues.map(([a, b, x], i) => `${i + 1}\n${t(a)[0]} --> ${t(b)[0]}\n${x}\n`).join("\n")); fs.writeFileSync(path.join(W, `${base}.vtt`), "WEBVTT\n\n" + cues.map(([a, b, x]) => `${t(a)[1]} --> ${t(b)[1]}\n${x}\n`).join("\n")); };
const C = (base, total, o = {}) => compileCaptions({ srt: `${base}.srt`, vtt: `${base}.vtt`, srt_sha256: sha(`${base}.srt`), vtt_sha256: sha(`${base}.vtt`), ...o }, { film: W, fps: 60, total });
write("PH", [[2.25, 3.25, "Too much?"], [2.95, 3.6667, "[chuckles]"], [5, 7, "A later line."]]);
write("EX", [[0, 0.25, "Too much?"], [0, 0.6667, "[chuckles]"], [2, 4, "A later line."]]); // extract = phase − 3.0 s
test("CAPCONT-1 a clipped continuation passes only through a readable parent; a measured sound event passes only on its measured frames", () => {
  const ev = [{ text: "[chuckles]", frames: [177, 220], audio_cue_id: "AUD20" }], ph = C("PH", 960, { event_cues: ev });
  assert.deepEqual(ph.errors, []); assert.equal(C("PH", 960).errors.length, 1, "without the declaration the 0.72 s sound cue is refused by the 1.0 s minimum");
  const clip = { cues: ph.cues, offset_frames: 180, length_frames: 780 }, ex = C("EX", 780, { clip_parent: clip, event_cues: [{ ...ev[0], frames: [0, 40] }] });
  assert.deepEqual(ex.errors, []); assert.deepEqual(ex.cues[0].continuation_of, [135, 195]);
  assert.ok(C("EX", 780, { event_cues: [{ ...ev[0], frames: [0, 40] }] }).errors.some((e) => /Too much/.test(e.human_readable_reason || e.reason)), "no parent: the clipped 0.25 s cue is refused");
  const shortParent = { ...clip, cues: ph.cues.map((c) => (c.text_lines.join(" ") === "Too much?" ? { ...c, frames: [135, 165] } : c)) };
  assert.ok(C("EX", 780, { clip_parent: shortParent, event_cues: [{ ...ev[0], frames: [0, 40] }] }).errors.length >= 1, "a parent that was itself unreadable does not lend its dwell");
  assert.ok(C("PH", 960, { event_cues: [{ ...ev[0], frames: [100, 140] }] }).errors.some((e) => e.failed_invariant === "EVENT_CUE_MEASURED" || /measured event/.test(e.human_readable_reason || e.reason)), "an event caption off its measured frames is refused");
  assert.ok(C("PH", 960, { event_cues: [{ text: "Too much?", frames: [135, 195], audio_cue_id: "X" }] }).errors.length >= 1, "a dialogue line cannot be declared a sound event");
});
