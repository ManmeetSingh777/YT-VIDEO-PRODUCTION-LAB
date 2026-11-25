# CURRENT HANDOFF — THE BETTER ONE / MIA FIRST FILM
**Updated:** 25 November 2026. This replaces the obsolete P02 root handoff, archived at `docs/history/LEGACY_P02_HANDOFF.md`. No automatic production/human approval is implied.

## 0. Engineering session 25–26 Nov 2026: read `engineering/` first
Branch `production/better-one-first-film-engineering` (child of `6d91a60`; the engine there equals P05 code `9454646`). New and tested on DIAGNOSTIC fixtures:
- **TBO-G15 decoder:** `engine/decoder/` (model card with units, provenance and constraints; `MODEL_BAR` operator inside the Neutrino/Chrome path; pixel QA).
- **TBO-G14 Blender host adapter v1:** `engine/host3d/` (headless Blender 5.1 HOST+SHADOW passes; camera and painted-floor calibration; composited between 2D depth bands; counterfactual pixel QA). `HOST_3D_ASSET_PENDING` stands.
- **`HYBRID_CONTRACT.json` v1.0.0**, companion to CREATIVE_PACKET 1.1.0, for claims, decoders, host shots and dialogue. Check it with `creative_handoff.mjs hybrid-preflight`.
- **20-gate enforcer:** `engine/production/quality_gates.mjs` + `engine/tools/quality_gates.mjs`, which computes gate status from TAP; diagnostic evidence never reaches VERIFIED.
- Status, matrix and requests: `engineering/CURRENT_SOURCE_STATUS.md`, `P05_FINAL_TEST_STATUS.md`, `ENGINE_CAPABILITY_AND_ART_DEMAND_MATRIX.json`, `QUALITY_GATES.json`,
  `FIRST_REAL_SHOT_INTEGRATION_PLAN.md`, `BLENDER_HOST_PASS_CONTRACT.md`, `DECODER_MODEL_CONTRACT.md`, `REAL_FOOTAGE_LEDGER.csv`, `NEXT_TASK_FOR_USER_AND_GPT.md`.
- Tests: `node --test tests/tbo/*.test.mjs`. Long regressions must run on a drive with ≥ 15 GB free (E: was full).
- Accepted real E01 seconds: **0**. Waiting for: approved packet + hybrid contract, real F01–F80 art, recorded voice, Blender host.

## 1. One source of truth

Repository: `ManmeetSingh777/YT-VIDEO-PRODUCTION-LAB`
Current film branch: `production/better-one-mia-first-film`.
Code parent: P05 evidence HEAD `711ed0fe715d893a56e1aa8fcbed1c89fd702055`; actual last code fix `945464697dc680956bea670e543c8e0c7beebf1b`.
Current feature branch also includes editorial Bible, first-film architecture, strict art-motion acceptance and this new startup instruction. Refer to actual `git rev-parse HEAD` for the latest documents SHA; do not call documentation commits "engine fixes".
Original Neutrino benchmark: `reference/neutrino_2m_SOURCE_PACKAGE/`. Runtime `engine/runtime/nu.js` remains preserved in P05 source.
The default `main` is NOT the current engine branch.

Read in full:
1. `CLAUDE.md`.
2. `docs/the-better-one/THE_BETTER_ONE_MASTER_CHANNEL_BIBLE_v1.md` — 1394 lines, user-supplied editorial Bible.
3. `docs/the-better-one/FIRST_FILM_PRODUCTION_MASTER.md`.
4. `docs/the-better-one/ART_MOTION_AND_HYBRID_QUALITY_GATES.md`.
4a. `docs/the-better-one/P06_13S_PERFORMANCE_SYSTEM_IMPLEMENTATION_DIRECTIVE.md` — mandatory current one-run execution standard for reusable actor commands and 13s integration.
5. `inputs/EXPERIENCE_DIRECTOR_V1.md`, `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md`.
6. `hybrid_v2/evidence/p05/P05_STATUS.md` and real P05 source/tests.
7. `docs/gpt-creative-control/OPERATOR_WORKFLOW.md`, executable `schemas/creative_packet_v1_1.schema.json`.

**Conflict precedence:** Latest explicit human-approved film direction > Channel Bible editorial rules > approved v1.1 creative packet > technical architecture / Experience Director implementation > historic tests/specs. If real conflict exists, return it with exact lines and a required approval. Do not invent a compromise.

## 2. What channel and film we are producing

**The Better One** is an original animated strategy-entertainment show: relatable character, impossible-looking contradiction, emotional stake, curious/funny/fallible recurring 3D host, hidden incentives, cinematic explanation and a genuinely earned, transferable better move, told in child-simple language with sophisticated reasoning and beautiful art.

Working FIRST film: **E01, Mia's full restaurant losing money**, proposed title "This Restaurant Is Packed. Why Is It Dying?" The title, factual payoff, exact script, final runtime and art/host designs remain development/approval items. Do not choose final moves from a convenient fictional number alone. Research and carefully label documented facts, dramatization, hypotheses and model scenarios.

Editorial requirements: F/R/M/H/X truth mode, evidence ledger, model card, Value Blueprint (prove ending before full dialogue), complete screenplay/scene cards, 12-field Experience Director shot direction, one absolute 60fps film clock, professional 2D live story + freeze/memory + original Blender 3D host + true math-driven strategy space + full A/V. Relevant historical parallel only when real and mechanism-aligned, never forced.

First pilot goal 8–12 min, can expand ~13 only if editor/story approves. Before full completion, 90–120s contiguous hybrid proof (Bible §12.5), assembled from **REAL episode** 8–10s approved shots.

## 3. Code readiness as of current published P05, not guesses

- `ENGINEERING_READY = NO`. P05 source `9454646` has passing targeted tests, but full frozen-checkout regression, all packet/P03 negatives and final short S00–S09 chain on latest code did not finish.
- P05 has real art-first registration, state channels, constraints, trace/ledger, staged GPT manual artwork outbox, v1.1.0 creative packet adapters, variable film duration and Neutrino/Chrome tests with DIAGNOSTIC drawings. No real Mia/F01–F80 approved artwork has passed actual expressive animation yet.
- P05 known unsupported: interpenetration/collision/slide/pinch/hinge contacts under certain modes; unsupported semantic verbs LOAD_CONTAINER, INSERT_TOKEN, CARRY; camera ORBIT/DOLLY_3D; limited rest/mid/open mouth states; unknown per-method F01–F80 real-image causality. Refer to actual action/route registry; do not guess support.
- All 2D→3D host compositing and real model-driven decoding in the specific proposed first film remain TO BE QUALIFIED, not proven complete because Blender or Three.js exist on disk.
- P05 chain had real interruption failures and local-machine sleep; preserve verified chunks, use OS session power settings and correct run recovery.
- F001–F175 historical defects are recorded with varying evidence; diagnostic PASS is not real-art acceptance. Source `hybrid_v2/evidence/p05/P05_STATUS.md` is authoritative for run provenance.

**Never create fake GPT art, fake human signatures, invented voice or a glossy synthetic film just to make the stage say PASS.**

## 4. Next engineering account — EXACT FIRST ACTIONS

1. Inspect Git state, current branch, P05 baseline and any unstaged/stashed local changes. Do not reset or force-push.
2. Read all current source-of-truth docs and inspect executable P05 contracts, actions, state channels, art outbox and video renderer. Report the genuine current capability matrix with source/functions, test and missing real-art proof.
3. Finish the frozen P05 regression/Chrome negatives and short chained diagnostic on the code SHA that will actually be used; prioritize targeted tests. See exact reproducible commands in `hybrid_v2/evidence/p05/P05_STATUS.md`. Do not run another arbitrary 7200-frame diagnostic rehearsal.
4. In parallel the GPT writer/user finish Mia's credible research, Value Blueprint, full screenplay/dialogue, scratch audio and Experience Director v1.1 packet. The engineer is NOT the showrunner.
5. Before any paid/full-image batch, import approved creative packet into existing `creative_handoff` and compile every art/movement/audio/3D/graphics obligation; emit exact typed refusal/missing-art jobs. Don't silently drop unsupported action or change the scene.
6. Generate and approve actual F01–F80 Mia master then REAL derivatives in ChatGPT; pass authentic PNG/part/cel/hand/face/underpaint and reviewed landmark sidecars back to `art_outbox`; run full post-art feasibility.
7. Render the FIRST real episode 8–10s performance scene on actual images and recorded/scratch approved audio, with actual Neutrino rendering and native-resolution human playback. Fix any reusable producing defect, not a screenshot-specific coordinate.
8. Repeat for 3D-host entrance and model-driven decoder at their ACTUAL timeline locations; integrate into shared frame/camera/depth and verify mixed audio.
9. Build 90–120s contiguous hybrid proof; editorial/user review; produce remaining film in accepted 8–10s segments and continuously assembled watchable cut. Finish 8–12min and public packaging only after independent production and editorial gate.

## 5. First three real-art acceptance shots

**S-A Mia acting (480–600 film frames):** expressive approved 2D Mia, required actual gesture, closed/open hand with contact and release if directed, proper body weight, eye/mouth expression, background life, camera and audio. Inspect native-resolution frames across actual motion including hidden seams and occlusion. Reuse in real E01 film.

**S-B host crossing:** genuine Blender host mesh/rig/face, stylized full-body animation, correct alpha/depth/shadow/foreground occlusion and matching camera in Mia's restaurant. No flat cutout presented as real 3D. Reuse in real film.

**S-C strategy decoding:** living narrative clue transforms into causal graphic with actual computed economics; any shown variables trace to claim/model card with constraints and scenario statuses. User can understand without reading spreadsheet; real chart values respond when inputs change.

The 90–120s contiguous hybrid sequence must combine these into an emotionally and intellectually coherent performance rather than an unrelated montage.

## 6. Five concurrent work packages (do not duplicate)

**A. Source recovery:** Claude confirms frozen P05 proof status, fixes genuine blockers on producing code. Output: readiness/negative evidence and actual branch SHA.
**B. Film value/story:** GPT/user research Mia, model and ending proof, test packaging, make full script/shot direction. Output: true `CREATIVE_PACKET 1.1.0` + story artifacts and approved audio-first animatic.
**C. Art look and assets:** GPT/user choose original 2D whole look and 3D host concept; final dependent images follow approved state demands. Output: real approved image/mesh files and lineage.
**D. First 8–10s actual film:** fit and animate real art with Neutrino, composited host as needed, recorded sound, actual QA/human review. Output: accepted film seconds and reproducible scene.
**E. Expand and deliver:** 3 modality clips → 90–120s film proof → full pilot → honest title/thumbnail/payoff, rights/source/audio QA, cost ledger. Output: finished watchable episode.

B can start immediately, concurrently with A. C concepts may start; C **final states** wait for completed art requirements/pre-art check. D waits for actual approved images, not for unrelated long tests. E waits for accepted core modalities.

## 7. Rules for updates, resources and external inputs

- The real user manually generates art in new ChatGPT with **current installed F01–F80 skill and native witnesses**. Local reference material may not be published to public repo; verify local authorized witness hashes.
- External GPT-authored story/direction requires real imported files and verifiable external story/direction approval. GPT can draft, never self-approve on behalf of human.
- No paid Higgsfield/Seedance/GPU call or copyrighted visual asset publication without explicit request-specific authorization, licensing and price.
- If a requirement is infeasible, report exact `action_id/shot_id/frame/art_state/missing_producer`, approved alternatives, and who must decide. No general generic downgrades.
- Checkpoints report committed code SHA, actual accepted film frames/seconds, applicable tests, missing art/approval/voice, costs and next operation.
- Preserve original artwork/master identity and all proofs; do not restart accepted film sections when unrelated code changes.

**Release objective:** One truly excellent finished Better One film and the reusable production mechanisms actually validated while making it. The studio exists to deliver the film, not vice versa.
