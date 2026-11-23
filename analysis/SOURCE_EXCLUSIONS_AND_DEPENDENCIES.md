# Source exclusions and external dependencies

Every file of the live studio's published scopes is either in this repository (same sha256) or listed in `EXCLUDED_FILES.json` with path, bytes, sha256 and reason. Candidates: 4493; published: 3312; excluded: 1182.

## Excluded by reason

| reason | files | bytes | examples |
|---|---|---|---|
| GENERATED_VIDEO | 9 | 62306965 | `engine/methods/evidence/stage1/MOTION/specimen2_motion_10s.mp4`<br>`films/_foundation_test/qa/after_Q.mp4`<br>`films/_foundation_test/qa/after_Q3.mp4` |
| TOOL_STATE | 9 | 241208 | `films/_foundation_test/.hyperframes/history-id`<br>`films/_foundation_test/.hyperframes/render-outputs.json`<br>`films/_foundation_test/.hyperframes/video-state.json` |
| GENERATED_RENDER | 185 | 83353202 | `films/_foundation_test/qa/after_Q3_sheet.png`<br>`films/_foundation_test/qa/d2/crop_003.000.png`<br>`films/_foundation_test/qa/d2/crop_007.900.png` |
| LARGE_MEDIA | 7 | 106776342 | `films/_verify_neutrino/assets/audio/music.wav`<br>`films/_verify_neutrino/assets/audio/narration.wav`<br>`films/_verify_neutrino/assets/audio/sfx.wav` |
| THIRD_PARTY_COPYRIGHT | 124 | 55896550 | `hybrid_v2/art_outbox/compiled/ARTJOB_MASTER_drum_in_4c40db2c/SOURCE_REFERENCE_CONTACT_SHEET.png`<br>`hybrid_v2/art_outbox/compiled/ARTJOB_MASTER_ines_master_211539ad/SOURCE_REFERENCE_CONTACT_SHEET.png`<br>`hybrid_v2/art_outbox/compiled/ARTJOB_MASTER_laundromat_far_76979fc1/SOURCE_REFERENCE_CONTACT_SHEET.png` |
| DUPLICATE | 817 | 1201954 | `hybrid_v2/evidence/p02/RECOVERED_ORIGINAL_EVIDENCE/phaseA_run/_film_view/production/runs/DIAG-20261122115303-c3d250/HEAD.json`<br>`hybrid_v2/evidence/p02/RECOVERED_ORIGINAL_EVIDENCE/phaseA_run/_film_view/production/runs/DIAG-20261122115303-c3d250/RUN_MANIFEST.json`<br>`hybrid_v2/evidence/p02/RECOVERED_ORIGINAL_EVIDENCE/phaseA_run/_film_view/production/runs/DIAG-20261122115303-c3d250/STATUS.json` |
| GENERATED_VIDEO_SEGMENT | 12 | 765257008 | `hybrid_v2/work/p02/rehearsal_K/rt/film/render/chunks/6fd37bfb063f09e0/chunk_00000_00600.mkv`<br>`hybrid_v2/work/p02/rehearsal_K/rt/film/render/chunks/6fd37bfb063f09e0/chunk_00600_01200.mkv`<br>`hybrid_v2/work/p02/rehearsal_K/rt/film/render/chunks/6fd37bfb063f09e0/chunk_01200_01800.mkv` |
| GENERATED_CACHE | 10 | 3995556 | `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/.KEY`<br>`hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/index.html`<br>`hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/rt/bridge_rt.js` |
| THIRD_PARTY_DERIVED | 1 | 1852439 | `inputs/Exhaustive Frame Analysis.json` |
| DUPLICATE_AND_THIRD_PARTY | 2 | 57753535 | `inputs/MOTION_NATIVE_HYBRID_V2_SPEC_AND_CLAUDE_PROMPT.zip`<br>`inputs/construct-kurzgesagt-art.zip` |
| PERSONAL_RECORD | 2 | 29943773 | `reference/neutrino_2m_SOURCE_PACKAGE/evidence/ALL_USER_MESSAGES.md`<br>`reference/neutrino_2m_SOURCE_PACKAGE/evidence/session_e7588946.jsonl` |
| SIZE_AND_HISTORY | 1 | 105522570 | `reference/neutrino_2m_SOURCE_PACKAGE/evidence/neutrino_2m_full_history.bundle` |
| GENERATED_FILM | 3 | 176231815 | `reference/neutrino_2m_SOURCE_PACKAGE/reference_outputs/animatic_rough_120s.mp4`<br>`reference/neutrino_2m_SOURCE_PACKAGE/reference_outputs/final.mp4`<br>`reference/neutrino_2m_SOURCE_PACKAGE/reference_outputs/proof_12s.mp4` |

## Excluded executable files: 6

- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/rt/bridge_rt.js` — GENERATED_CACHE: baked composition pages (reproducible)
- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/rt/gsap.min.js` — GENERATED_CACHE: baked composition pages (reproducible)
- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_shot/rt/nu.js` — GENERATED_CACHE: baked composition pages (reproducible)
- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_world_shot/rt/bridge_rt.js` — GENERATED_CACHE: baked composition pages (reproducible)
- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_world_shot/rt/gsap.min.js` — GENERATED_CACHE: baked composition pages (reproducible)
- `hybrid_v2/work/p02/rehearsal_K/rt/film/render/compositions/37519c20438504f8/rt_world_shot/rt/nu.js` — GENERATED_CACHE: baked composition pages (reproducible)

Reason notes:
- **THIRD_PARTY_COPYRIGHT** (skill witness stills, the contact sheets built from them, handoff `witnesses/` copies). These are the F01–F80 *source witnesses*. Compiled ArtJobs reference them by path and sha256 (`hybrid_v2/art_outbox/compiled/*/PROVIDER_PRE_SUBMISSION_MANIFEST.json`), and `gpt_handoff.mjs#exportGptJob` attaches them. **An authorized local build must supply them**: the original `reference/construct-kurzgesagt-art/assets/` tree, matched by the sha256 values in `EXCLUDED_FILES.json`.
- **PERSONAL_RECORD**: a session transcript and a verbatim user-message log from the original package.
- **GENERATED_*** / **LARGE_MEDIA**: renders, videos, FFV1 segments and audio stems. They can be regenerated: the original package's `tools/audio.py`, `timing.py` and TTS; the studio's `tests/p02/run_rehearsal.mjs`; the render path.

## Studio areas outside the published scopes (whole directories)

| entry | files | bytes | treatment |
|---|---|---|---|
| `.claude` | 1 | 706 | local settings / tool state / VCS (fresh history here) |
| `.git` | 0 | 0 | local settings / tool state / VCS (fresh history here) |
| `.gitignore` | 1 | 260 | published (subject to the file rules) |
| `.proofws` | 0 | 0 | local settings / tool state / VCS (fresh history here) |
| `audit_outbox` | 24 | 510009446 | audit/export ZIP archives (their contents are this source); not published |
| `CLAUDE.md` | 1 | 5061 | published (subject to the file rules) |
| `engine` | 492 | 12460490 | published (subject to the file rules) |
| `exports` | 3 | 85338311 | audit/export ZIP archives (their contents are this source); not published |
| `films` | 365 | 151914859 | published (subject to the file rules) |
| `HANDOFF.md` | 1 | 17525 | published (subject to the file rules) |
| `hybrid_v2` | 21686 | 94922674938 | published: art_outbox, audit_docs, evidence, work/audit_logs, rehearsal evidence + K film inputs; NOT published: 89 GB of generated work output |
| `inputs` | 13 | 60062171 | published (subject to the file rules) |
| `learning` | 1 | 11788 | published (subject to the file rules) |
| `MOTION_NATIVE_STUDIO_V1_AUDIT_DRIVEN_BUILD_INSTRUCTIONS.md` | 1 | 19388 | published (subject to the file rules) |
| `MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md` | 1 | 46134 | published (subject to the file rules) |
| `reference` | 390 | 471426318 | published (subject to the file rules) |
| `schemas` | 7 | 134111 | published (subject to the file rules) |
| `style` | 2 | 34563 | published (subject to the file rules) |
| `tests` | 161 | 1350959 | published (subject to the file rules) |

## External dependencies (not in the repository)

| dependency | version measured | role | how an authorized local build resolves it |
|---|---|---|---|
| Node.js | v22.20.0 | runs the engine, tests and controller | install; `node` on PATH |
| puppeteer-core | 25.16.0 | drives Chrome for frame capture | `PUPPETEER_CORE_PATH` or the npx cache (`engine/art_bridge/render.mjs#loadPuppeteer`); there is no package.json/lockfile in the studio |
| Google Chrome | 158.0.8127.36 | rasterises the composition pages | install; `CHROME_PATH` |
| FFmpeg / ffprobe | 7.1 | FFV1 segments, H.264/AAC assembly, probes | on PATH |
| Python 3 | 3.14 (run with `-I`) | skill compiler scripts, zip tooling | on PATH or `PYTHON` |
| HyperFrames CLI | 0.9.11 (npx) | the ORIGINAL neutrino film's capture and render (not used by the current studio) | `npx hyperframes@0.9.11` |
| GSAP | 3.15.0 | clock/easing; vendored as `engine/runtime/gsap.min.js` and `reference/.../vendor/gsap@3.15.0` | GreenSock standard no-charge license (header kept) |
| Kokoro TTS (original film only) | kokoro-onnx 0.4.7 | narration of the original film | see the original forensics 03 |

## Coverage check

- Published files whose bytes differ from the live studio: 0
- Excluded files also present in the repository: 0
