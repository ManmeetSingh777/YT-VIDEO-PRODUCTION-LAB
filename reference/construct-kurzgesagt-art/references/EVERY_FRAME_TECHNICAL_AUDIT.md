# Five full films: complete encoded-frame technical coverage, not complete native-semantic art comprehension

## Verified completed source inventory

The original five 1920×1080 MP4s have a verified stream inventory totaling **242,095 frame positions** over **4,035.233 seconds** (67 min 15.233 sec). The input SHA-256s are in `FULL_FILM_SOURCE_REGISTRY.json`. The new repeatable technical script `full_film_study/scripts/stream_every_frame.py` fully decoded each video through `ffmpeg`, resized **every consecutive decoded frame** to 160×90, measured 21 numeric features per position, and saved every 3,000-frame block to a resumable compressed checkpoint. All 84 blocks were subsequently read, continuity-checked, and reconciled to the exact expected frame counts by `full_film_study/scripts/report_every_frame.py`; the report snapshot is `EVERY_FRAME_NUMERIC_COVERAGE.json`.

| Film | Encoded positions actually decoded and measured | Completed checkpoint blocks | Mean interframe RGB MAE, 160×90 | 99th-percentile MAE |
| --- | ---: | ---: | ---: | ---: |
| Nuclear Flies | 40,782 | 14 | 2.019 | 18.532 |
| Brain Blinds | 45,188 | 16 | 1.608 | 14.971 |
| Solar System | 45,809 | 16 | 1.598 | 14.681 |
| AI Final Invention | 60,169 | 21 | 1.545 | 13.857 |
| Memories Stored | 50,147 | 17 | 1.481 | 13.695 |
| **Total** | **242,095** | **84** | — | — |

This yields **5,083,995 recorded technical feature values** (242,095×21), and retains original zero-based frame positions for all five files. Per-frame metrics include mean RGB/luminance, luminance percentiles, elementary channel spread/chroma proportion, spatial edge fractions, 64-color-bin entropy, frame-to-frame changed fractions and their approximate centroids, and half-frame brightness. They are appropriate for *finding visual state change, gross density shifts and color changes*, not for detecting whether a thumb grips an object correctly, a specific window faces the right direction or an anatomy connection is accurate.

## What was artistically inspected

1. Earlier: all 4,035 whole seconds as a 1-fps chronological thumbnail atlas, distributed over 43 pages, and 66 new native 1920×1080 temporal witnesses in 22 strips, plus an older 15 selected high-density intervals spanning 3,492 frame positions (58.2 seconds). These are inventoried in `FULL_FILM_EVIDENCE.md` and `NATIVE_WITNESS_MANIFEST.json`.
2. This extension: **85 additional question-driven original-resolution stills** across all five films plus a **separately named sixth supplement**, summarized in eight `assets/abstract_world_witnesses/` contact boards and indexed by `QUESTION_WITNESS_PALETTES.json`. The native stills were visually inspected to distinguish physical, digital, biological and environmental construction; not all ~242,095 full-resolution images were individually shown to the analyst.
3. A source-specific numeric color/edge probe ran on the 85 full-size witnesses after reduction to at most 960×540; its detailed results and interpretation are in `MEASURED_VISUAL_VARIATION.md`. This measures samples **not the source project files**.
4. The frame-complete 160×90 feature sweep identified candidates with unusually high adjacent-frame change and separate low-change stable construction points. `EVERY_FRAME_NUMERIC_COVERAGE.json` gives their exact frame indices and approximate time. A candidate must be **visually read at native resolution** before claiming any style meaning. High-change peaks may be cuts, flashes or rapid camera motion.
5. An additional **60 high-change candidate source frames** (12 per film) were extracted and visually surveyed as five contact boards in `assets/change_nominees/`; unlike the 85 question-driven witness set, this selection is purely numeric and intentionally includes **counterexamples that are not standard illustrated art**. Examples: the Solar high-change candidates frequently land in live-action sponsor advertisement material, the AI candidate around 462.8s shows a structured maze/game plane, Nuclear around 233.6s shows industrial repeated trays, and Memories around 296s shows a brain-centered functional machine. These checks reinforce the need for F20's medium/editorial quarantine rather than a new universal art template. They do not constitute every-frame native inspection either.

## Exact boundary of the claim

**Verified:** all encoded frames were technically decoded, sampled at 160×90 and measured; all five source original streams and block indices reconciled without gaps. Independently selected stills were rendered at native resolution for artistic analysis. The new F37–F50 methods reflect actual frame contrasts and are designed to transfer across subject types.

**Not verified:** manual semantic examination of **every** one of the 242,095 images at 1920×1080, direct access to the original studio's illustration source layers, reproduction of exact proprietary drawing workflows, uniform success across arbitrary unheard scripts, or character continuity/motion quality in a complete rendered film. Numeric all-frame processing **does not** resolve those limits. The separate direction skill (shot design and transition choreography) remains future work; the visual guide covers constructing transition-ready artwork and visual states only.

This distinction is essential to avoid conflating duration coverage with artistic understanding, even under a user's instruction to “inspect every frame.” The actionable response is to keep target questions tied to unlike sources, inspect native witnesses for exceptions, run unfamiliar-content output tests, and strengthen rules when a repeatable pixel failure is found. Preserve the technical features/checkpoints as reproducible evidence rather than mislabeling them all as hand-reviewed artworks.

## Generalizable answers to audit questions

| Style-level question | Source comparison and answer | Constructive method |
| --- | --- | --- |
| Is a digital world always dark navy and neon? | **No**. `AI@444` is a nearly white cyan information gallery; `AI@514` is violet-dark luminous machine; `AI@874` is predominantly dark architectural recess. | F37 class selection, F43 pane geometry, F46 material-specific roles. |
| Does depth always come from a vanishing point? | **No**. `AI@35,856` use consistent oblique 2.5D faces; `AI@874` is axial tunnel; `MEMORIES@62` is parent-branch topology without scenic horizon. | F38 projection grammar conditional on substrate. |
| Is complexity decorative detail? | **No**. `AI@35` has connected building face/window patterns, `MEMORIES@62` has parent-linked terminals, `VOLCANO@15.2` has structural overlapping plants. | F39–F41 class-specific repeat generators; F47 detail tiers. |
| Is there one overall amount of detail? | **No**. Native witness contrast fraction `AI@35` 0.0980 vs `AI@874` 0.0061; `MEMORIES@62` 0.2695 vs forest `VOLCANO@15.2` 0.0206. These are *descriptive one-frame* numbers. | F47 per-purpose/per-depth budgets; measured values are not target ranges. |
| How does transparent data-space become a believable object? | `AI@250` exploded planes, `AI@444` independently projected panels, `AI@514` bounded glass volume/socketed cables are three different mechanisms. | F43 information theatre and F44 optical solid with masks and connectors; F21 viewport order. |
| How do rich world parts stay causally coherent? | `AI@856` includes real technology/foliage modules and connecting structures; `NUCLEAR@440` working lab props, `AI@555` structural server aisle. | F40/F45 world functional part graphs and projection. |
| Can a picture inside another picture be a flat sticker? | **No**. `MEMORIES@465` has separately layered scene inside another anatomy/container; `SOLAR@210` curved vessel optics differ from flat UI. | F21/F48 inner/outer complete worlds and rim/refraction ordering. |
| Should successful static art be called animation mastery? | **No**. Pose-state design and layer separation are necessary, not sufficient; cuts, timings and output motion have separate proofs. | F30 and visual key plates now; future direction skill and moving render tests later. |

### Reproducibility contract

- Machine checksums and frame totals: `FULL_FILM_SOURCE_REGISTRY.json`.
- Serialized all-frame result and source-indexed change nominees: `EVERY_FRAME_NUMERIC_COVERAGE.json`.
- Full-timeline, native selected evidence and honest original limitations: `FULL_FILM_EVIDENCE.md`.
- Question-driven 85 visual references: eight `assets/abstract_world_witnesses/` boards; 60 extra algorithmically chosen discontinuity witnesses in five `assets/change_nominees/` boards.
- Scene-local contrast/palette measurements: `MEASURED_VISUAL_VARIATION.md` and `QUESTION_WITNESS_PALETTES.json`.
- Actual construction methods: `WORLD_SYSTEM_CONSTRUCTION.md`, F37–F50, in addition to F01–F36.
- Executable rule binding: `scripts/compile_art_job.py`, strict world graph validator, and `scripts/test_world_system_compiler.py`.
