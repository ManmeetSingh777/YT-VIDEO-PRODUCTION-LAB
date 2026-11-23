# 02 — Production chronology

All times are UTC on 2026-11-04 and come from the session log [OBS]. Git commits use local +05:45.
- Total wall time from prompt to `final.mp4`: **≈ 72 minutes** (12:46 → 13:58).
- Report and hero export finished by 14:02.

**Necessity key:**
- **E** = essential mechanism to preserve.
- **U** = useful but replaceable.
- **I** = incidental to this film.

| # | UTC | Goal | What happened | Outcome / why it moved on | Nec. |
|---|---|---|---|---|---|
| 1 | 12:46:33–12:46:55 | Orient | Loaded `hyperframes` then `media-use` skills; read all 8 direction files, `index.html`, `format.md`, `types/explainer.md`, `sound.md`; listed folder; checked ffmpeg, python, node, `hyperframes tts --help`, SAPI voices | Learned the render contract and that TTS is local Kokoro | E (contract), U (rest) |
| 2 | 12:48:48 | Checkpoint + script | `git init`, `.gitignore`, commit `76b1852`. Wrote `tools/script.json`: the 33 narration sentences, verbatim from 01_SCRIPT | First TTS attempt failed: `kokoro-onnx` missing | U |
| 3 | 12:49:00 | Make TTS work | Created venv `~/.cache/hyperframes/kokoro-venv`, `pip install kokoro-onnx soundfile`; synthesized s1 (1.96 s) | Worked, so continued | E (some voice) |
| 4 | 12:50:43 | All narration | Sentence-by-sentence `hyperframes tts -v af_heart`; measured each WAV. Total speech ≈ 103.4 s, leaving ≈ 16 s for pauses inside 120 s | Narration length fits; timing spine possible | **E** |
| 5 | 12:58:34–12:59:42 | **Engine + character** | Wrote `assets/nu.js` (runtime: tracks, `at()` functions, camera, streaks, `actor()` rig) and `tools/lib.mjs` (palette, SVG helpers, spark motif, `character()`, `umbrella()`, `sceneFile()`) | The core of the film's motion; written before any scene | **E** |
| 6 | 12:59:53 | Freeze timing | Re-synthesized s1–s6 at speed 1.05 to keep the hook under 12 s. `tools/timing.py` places sentences with hand-chosen gaps → `tools/timing.json` + `assets/audio/narration.wav` (120 s). Also made `assets/grain.png` with numpy | All later timing is derived from `timing.json` | **E** |
| 7 | 13:02:49–13:04:30 | First world | `tools/art_kitchen.mjs` (room, window, lamp, kettle, table, fern, chair), `tools/scene_kitchen.mjs` (facade, city, breakfast close-up, type, acting, streaks, pullback), `tools/build.mjs`, `tools/scenes.json` | | E |
| 8 | 13:04:32 | **First look** | `node tools/build.mjs` + `hyperframes snapshot` at 8 times; read frames | Defects: serif font fallback, upper arms invisible, head too low, lamp cone across the face, empty facade, faint streaks, kitchen vanishing at 14 s (see 06) | **E (loop)** |
| 9 | 13:06:51–13:08:59 | Fix + Sun | Font via CSS classes, arm colours, head offset, lamp moved, facade masonry, radial streak mode. Wrote `tools/art_space.mjs`, `tools/scene_sun.mjs`. Snapshot 9 frames | Sun core reads well; surface needs black space; ribbons look like bars | E |
| 10 | 13:11:10–13:13:49 | Remaining heroes | Fixes to Sun and kitchen; wrote `scene_planet.mjs`, `scene_flash.mjs`, `scene_end.mjs`; built 5 scenes; snapshot | IceCube sensors not drawing; Cherenkov cone invisible; ending river chunky | E |
| 11 | 13:15:30–13:16:46 | Debug heroes | Found: wrong `<use href>` prefix; camera transform overwriting object transforms (fixed with wrapper groups); gradient/group **duplicate ids** (`cone`, `canopy`, `kettle`, `yolk`, `table`, `hit`); added a dup-id check to the build; deepened the ice; exported 5 hero PNGs | **Hero-frame gate passed** (5 × 1920×1080) | E |
| 12 | 13:18:04–13:18:27 | Animatic | `tools/animatic.py`: 34 rough PIL boards timed from `timing.json` + narration → `proof/animatic_rough_120s.mp4`. Concat duration bug fixed to 120.0 s | Timing gate satisfied **formally**. It did not change any later decision [MEM] | U (as practiced) |
| 13 | 13:18:43 | **12 s proof** | `hyperframes render --start 0 --end 12 -q draft` (≈2 m 42 s); 12-frame sheet incl. consecutive pairs 15/16, 300/301 | Faults: flood too thin, toast shape, "1" over the umbrella, a console error | **E** |
| 14 | 13:21:57–13:21:58 | Proof correction 1 | Streak count 150→240, density curve, toast redrawn, "1" moved, radius clamp; re-render in background | Accepted after inspection at 13:29 (1 of 2 allowed corrections used) | E |
| 15 | 13:23:08–13:26:10 | Rest of film | Wrote `scene_space.mjs` (ascent + flight), `scene_body.mjs`, `scene_doors.mjs`, `scene_ice.mjs`, `scene_source.mjs` | Written in ~3 minutes while the proof rendered | E |
| 16 | 13:27:19–13:27:24 | Sound | `tools/audio.py`: procedural music (Am–F–C–G pads, bass, arpeggio, echo, duck under voice) + SFX placed from `timing.json`. `tools/mkscenes.py` derives the 11 scene start/duration values from sentence times | | U (music quality), E (timing derivation) |
| 17 | 13:29:19 | Integrate + QA | `tools/motion.py` (frame-difference cuts/holds/black); audio tracks into `index.html`; built all 11 scenes; 28-frame snapshot sheet | Found flight scene **frozen** for 12 s | E |
| 18 | 13:31:17 | Full check | `hyperframes check --json` → runtime error `flight TypeError … setAttribute` (duplicate id `h-beam`). Craft check reported 11 "dead_stretch" warnings, judged false positives | Check output pinpointed the frozen scene | E |
| 19 | 13:34:16–13:38:27 | Fix wave | Renamed colliding ids (`beam`, `venus`, `mars`, `moon`); `tools/dupcheck.cjs`; clouds, solar flares, carpal bones, "?" blueprint stage, cell clipping, ice section framing, aurora edges; re-check clean; Studio preview opened; commit `a5b3780` | | E |
| 20 | 13:40:39 → 13:47:12 | Full render 1 | `hyperframes render -o final_pass1.mp4` (CRF 16) ≈ 6.5 min | Valid file. Review found: flash 2.5 s before its words, dead holds at 71/94/96/99/101/104 s, palm glint off the hand, bubbly Sun, loudness −18.9 LUFS | **E** |
| 21 | 13:49:28–13:52:10 | Sync + polish | Flash retimed to the words (impact on "interacts", bloom on "sudden flash"), muon speed 1000→330 px/s, ghost + crossed-eye beat, slow camera drifts, jet knots, forward-kinematics palm glint; audio re-synthesized to match; commit `1ef8b88` | | **E** |
| 22 | 13:52:24 → 13:58:20 | Final render | `hyperframes render -o final_raw.mp4 --crf 20` (~6 min) | | E |
| 23 | 13:58:35 | Deliver | Two-pass `loudnorm` to −16 LUFS / −1.5 dBTP, video stream copied → `final.mp4`; ffprobe; `motion.py` (0 holds, 0 black); 64-frame sheet; hero PNGs re-extracted from `final.mp4` | Measured | E |
| 24 | 13:59–14:02 | Report | `snapshot --review`; `REVIEW.md`; commit `2f6a613`; intermediates deleted (`final_pass1.mp4`, `final_raw.mp4`) | | U |

## Observations about the process

- **Engine before art; art before scenes; scenes before timing polish.**
  - The rig, camera and particle system existed (step 5) before a single scene was drawn.
  - Every scene was authored *into* that motion vocabulary.
- **Narration was frozen first** (steps 4–6). Scene boundaries (`mkscenes.py`) and every beat time are expressions of `timing.json`.
- **Nine look-and-fix rounds before the first full render**, plus two proof renders and two full renders.
  - Each round fixed specific, observed defects (see 06).
- **The animatic was mostly ceremonial.**
  - It was produced to satisfy the contract, after the hero scenes already existed. No later decision cites it [MEM].
  - The real "animatic" was snapshotting the actual scenes.
- **Speed.** Scenes 4–9 (`scene_space`, `body`, `doors`, `ice`, `source`) were each written in one pass of about 1 minute.
  - Most of their quality came from re-using `nu.js` primitives and from the fix waves.
  - Single-pass authorship was rarely clean: 3 of those 6 scenes had a fatal or visible bug on first view.
- **Render time** was not the bottleneck: ≈ 6–6.5 min per full 120 s render.
  - The 15–20 min estimate given in an earlier reply was wrong.
