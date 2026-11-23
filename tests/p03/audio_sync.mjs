#!/usr/bin/env node
// P03 audio proof (directive H) on ACTUAL audio files. The files are DIAGNOSTIC test signals synthesised here with ffmpeg (tone bursts for the
// narration words, short noise transients for SFX, a sustained chord bed for music) — not narration, not sound design. Proves: one frame clock
// (speech → mouth swaps and SFX → frames), sample-exact placement, sidechain ducking depth, two-pass loudness, and sync MEASURED from the
// decoded mix; plus a negative (an SFX file placed 3 frames late must be reported AUDIO_SYNC_MISMATCH).
//   node tests/p03/audio_sync.mjs [--video hybrid_v2/evidence/p03/clips/p03_directed.mp4]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), OUT = path.join(REPO, "hybrid_v2", "evidence", "p03", "audio"), W = path.join(REPO, "hybrid_v2", "work", "p03", "audio");
const A = await import("../../engine/film/audio_mix.mjs"), { compileActing } = await import("../../engine/art_bridge/acting.mjs"), P = await import("./p03_plans.mjs");
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(W, { recursive: true });
const gen = (file, expr, dur) => { execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", `aevalsrc=${expr}:s=48000:d=${dur}`, "-ac", "1", "-c:a", "pcm_s16le", file]); return file; };
const fps = 60, total = 480, FILM = path.join(REPO, "hybrid_v2", "work", "p03", "subjects", "film"), doc = JSON.parse(fs.readFileSync(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), "utf8")), plan = P.directedPlan(doc);
const words = plan.acting.nova_rig.speech.words, between = (a, b) => `between(t\\,${a}\\,${b})`;
const narration = gen(path.join(W, "narration_TEST_TONES.wav"), `0.35*sin(2*PI*220*t)*(${words.map((w) => between(Math.round(w.start_s * fps) / fps, w.end_s)).join("+")})`, total / fps);
const music = gen(path.join(W, "music_TEST_BED.wav"), "0.06*(random(0)*2-1)", total / fps);
const sfxFile = gen(path.join(W, "sfx_TEST_CLICK.wav"), "0.8*sin(2*PI*1800*t)*exp(-t*60)", 0.12);
// SFX cues = the frames where the motion compiler puts the physical events (grip contact start / end of the pull action) — read from the manifest, not retyped
const act = doc.actions.find((a) => a.id === "nova_pull_lever"), grip = act.contact_events.find((c) => c.contact_type === "GRIP"), sfx = [{ id: "grip_clunk", file: sfxFile, frame: grip.start_frame, gain_db: 0 }, { id: "release_click", file: sfxFile, frame: grip.end_frame, gain_db: -3 }];
const target = -16, mixed = A.mixBuses({ out: path.join(OUT, "p03_mix.wav"), fps, total_frames: total, narration: { file: narration, gain_db: 0 }, music: { file: music, gain_db: -6 }, sfx, loudness: { target_lufs: target, true_peak: -1.5, lra: 11 } });
const words_window = [Math.round(words[0].start_s * fps) / fps, words.at(-1).end_s];
const v = A.verifyAudioSync({ mix: mixed.file, fps, sfx, words, music: { file: music, stem: mixed.music_stem_ducked, reference_window_s: [3.0, 7.5] }, narration: { window_s: [words_window[0] + 0.05, words[0].end_s - 0.02] }, target_lufs: target, tolerance_ms: 4 });
// one timing system: the mouth OPEN swaps compiled from the SAME words land on the frames whose audio onsets were just measured
const acting = compileActing(doc, plan, { fps }), mouthOpen = acting.events.filter((e) => e.rig === "nova_rig" && e.channel === "mouth" && e.state === "open").map((e) => e.frame);
const wordFrames = words.map((w) => Math.round(w.start_s * fps)), measuredWordFrames = v.cues.filter((c) => c.kind === "WORD").map((c) => Math.round(c.measured_s * fps));
const mouthSync = wordFrames.map((wf, i) => ({ word: words[i].w, word_frame: wf, measured_audio_frame: measuredWordFrames[i], first_mouth_open_frame: mouthOpen.find((f) => f >= wf) ?? null, ok: mouthOpen.includes(wf) && measuredWordFrames[i] === wf }));
// negative: the SAME cue list, but one SFX file actually placed 3 frames late — the measured onset must disagree with the cue frame
const late = A.mixBuses({ out: path.join(W, "p03_mix_NEG_late_sfx.wav"), fps, total_frames: total, narration: { file: narration }, music: { file: music, gain_db: -6 }, sfx: sfx.map((c) => (c.id === "grip_clunk" ? { ...c, frame: c.frame + 3 } : c)) });
const vNeg = A.verifyAudioSync({ mix: late.file, fps, sfx, words, tolerance_ms: 4 });
let av = null; const video = process.argv.includes("--video") ? path.resolve(REPO, process.argv[process.argv.indexOf("--video") + 1]) : path.join(REPO, "hybrid_v2", "evidence", "p03", "clips", "p03_directed.mp4");
if (fs.existsSync(video)) av = A.muxAV(video, mixed.file, path.join(OUT, "p03_directed_with_audio.mp4"));
const report = { note: "DIAGNOSTIC test signals (synthesised); proves timing/mix mechanics only, not sound design", fps, total_frames: total, mix: { ...mixed, file: path.relative(REPO, mixed.file), music_stem_ducked: path.relative(REPO, mixed.music_stem_ducked) }, verify: v, mouth_sync: mouthSync, negative_late_sfx: { detected: vNeg.failures.some((f) => f.code === "AUDIO_SYNC_MISMATCH" && f.record_id === "grip_clunk"), failures: vNeg.failures, cues: vNeg.cues }, av_mux: av ? { ...av, file: path.relative(REPO, av.file) } : "video clip not rendered yet" };
fs.writeFileSync(path.join(OUT, "AUDIO_SYNC_REPORT.json"), JSON.stringify(report, null, 1));
console.log("sync ok:", v.ok, "LUFS:", v.integrated_lufs, "duck:", JSON.stringify(v.duck), "mouth sync:", mouthSync.every((m) => m.ok), "negative detected:", report.negative_late_sfx.detected, "av:", av ? `${av.video_s}/${av.audio_s}` : "-");
for (const c of v.cues) console.log(" ", c.id.padEnd(16), c.frame, c.offset_ms, c.ok);
