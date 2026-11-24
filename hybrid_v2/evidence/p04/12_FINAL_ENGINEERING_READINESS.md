# P04 — final engineering readiness

**ENGINEERING_READY = NO.** REAL_ART_QUALIFIED = NO. FULL_FILM_QUALIFIED = NO.

All executed tests pass, but the simulation required by directive section 9 is not complete and several required behaviors are not proven (see "Why NO"). Passing tests do not cover what they never execute.

Code under test: `4433dcec2aa301e91832e1d3a122d03627152db5` on `repair/p04-universal-pipeline-closure` (from P03 `900a6b1`). The commit that adds this evidence changes no file under `engine/` or `schemas/` (check: `git diff 4433dce -- engine schemas`). `engine/runtime/nu.js` is byte-identical (sha256 `773baf91…7be`). `main` was not touched and nothing was force-pushed.

## What was executed on that commit

| Run | Command | Result |
|---|---|---|
| full regression on a separate frozen checkout (git worktree of the commit + the local, unpublished source witnesses) | `node --test --test-reporter=tap --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs tests/p04/*.test.mjs` | 248 tests, 248 pass, 0 fail, 0 cancelled, 0 skipped, 0 todo (`10_REGRESSION_RESULTS.tap`) |
| chained four-family film, 480 frames, real Chrome | `node tests/p04/run_chain.mjs` | S00–S08 committed; S09 4/5: only `film_review` blocked, because a diagnostic run can never satisfy it. 141 task outcomes in the ledger, chain verified, traced frame 120 has no blocker. 1256 s |
| published file | `ffprobe` | 480 frames, 1920x1080, 60/1, AAC; sha256 `aeb14fb5…1d93` (the MP4 is not committed: the repository ignores `*.mp4`; `chain/CHAIN_CONTACT_SHEET.png` and the receipts are) |
| Chrome render negatives | `node tests/p03/run_clips.mjs --only negatives` | 7 of 7 detected, all 7 controls pass |
| defect reproducer | `node tests/p04/reproduce_p04.mjs` | before (`900a6b1`): 14 of 15 reproduced, 1 (C3) was already refused; after: 0 of 15 |
| failure ledger | `node tests/p04/build_failure_ledger.mjs` | 154 rows: 93 CLOSED_ON_DIAGNOSTICS, 60 SOFTWARE_PROVEN_EXTERNAL_PENDING (need real art, a human or narration; not closed), 1 without an automated proof (F154) |
| P02-R14 | in the regression | passes on the clean checkout; `traceFrame` was not weakened. Frame 3900 (the old sample) also traces with no blocker; its `camera_moving` is false because the last camera key is at 3900, so the test samples 3850 for that one assertion. The fixture's world design record is borrowed from `films/hv2_film001` and labelled as such |

The evidence counts of the earlier run on `377797c` (245/245) are kept in `superseded/`. It was superseded because reading it exposed F152 and F153.

## Frames inspected (nine frames of the published film)

Reach, hand closure, hold, lever follow, release, blink, mouth and brow change, creature motion, token flow and camera motion are visible. Defects seen:

1. The torso's cast shadow is a separate patch that does not join the leg shadows. The gate only requires that the planted limb casts a shadow. Shadow continuity is not verified.
2. The lever turns only about 10 degrees. This is weak evidence for a large mechanism response.
3. The shoulder of the fixture arm shows a square cut edge. The fixture art causes it, but no automatic edge-continuity test caught it.

## Why NO — the 16 release criteria

| # | Criterion | Status | Reason |
|---|---|---|---|
| 1 | direction decision → consumer or refusal | MET on diagnostics | measured on the owner, then on its own pixels. Free-text parts of a decision (purpose, experience) are not verified by software |
| 2 | planner derives every required state | PARTIAL | covers pose/view/channel bindings, hand closure, blink, speech, morphs, deformations, symbols, effects, light planes, plates and the whole camera path. It does **not** derive intermediate reach→grip drawings, per-view variants of a newly required turn, or lighting/material states that nobody declared |
| 3 | ChatGPT handoff | MET on diagnostics | self-contained, portable, refuses without a witness. No real ChatGPT image has been imported |
| 4 | registration fits delivered art | MET on fixtures | landmarks come from a reviewer's sidecar |
| 5 | feasibility on every frame | MET | zero evaluation and exceptions fail; re-run with delivered art at S06 |
| 6 | Neutrino runtime, deterministic seek | MET | |
| 7 | acting, grip, IK, contact, support, deformation, response, camera, secondary | PARTIAL | reactions are hinge-follow only inside the chain; GEAR_TRAIN exists but is not in it. Collision/aperture crossing is not evaluated on every frame. The only shadow rule is the limb rule |
| 8 | visible actions have attributed evidence | MET for the chain | an artistic reading is not implied |
| 9 | no silent replacement | MET | |
| 10 | human authority | MET mechanically | signed requests verified with a test key only; no real reviewer key exists |
| 11 | orchestration, cache, audio, mux, receipts | MET | |
| 12 | preflight changes nothing | MET | |
| 13 | historical failures protected | MET for 153 of 154 | F154 is an evidence-builder fault, repaired, with no automated test |
| 14 | suites pass on a clean checkout | MET | the source witnesses are local files and must be present |
| 15 | one short chain S00–S09 | PARTIAL | all production tasks ran; S09 cannot commit in a diagnostic run by design |
| 16 | generates the needed art and review tasks for new input | PARTIAL | the tools are generic, but no unfamiliar script has gone through export → external authoring → acceptance → demand in one run |

**Section 9 simulation, what the chain does not contain:** a human view change; a mechanism with a linked output; a world reveal with occlusion; a continuous transition (the chain has one hard cut); diagnostic art arriving through the GPT handoff inside the chain (fixtures go through the intake API directly; the handoff is proven separately). View swaps, portals, gears and the handoff have their own tests. That is not the same as one chained proof.

**Also not proven:** section 3.5 for each F01–F80 method (image-authorship methods cannot be causally proven without generated pixels); rendered edge/contact tests for a head turn and for a partly hidden limb being revealed (4.4); a viseme set beyond rest/mid/open; audio with real narration or music.

## Process facts an auditor should know

- The implementation spec, the Stage 1 spec, the P02 report and the execution chain were read in full only after the first repairs. Reading them, and then the evidence, exposed F137–F153.
- F151 was introduced by this run and caught by the P02 suite before the final runs.
- F154: an evidence builder run without `--out` tried to write to the Node executable. The operating system refused, so nothing was changed. The builder is fixed.
- Test expectations that changed, each with the contradiction it had, are listed in `04_BEFORE_AFTER_CODE_MATRIX.md`.
- The chain and the regression ran at the same time on one machine, so the times are not performance figures.
- No paid call, no GPT artwork, no production approval and no story selection was made. Key pairs used in tests are generated in a temporary folder and deleted.

## New issues

`03_COMPLETE_HISTORICAL_FAILURE_LEDGER.json` → `NEW_ISSUES` (F113–F154). Still open and not yet rows with a repair: shadow continuity; intermediate transition drawings; collision/aperture on every frame; the missing chain elements above.

## Precise next operation

Extend the bounded chained fixture with a view change, a gear-linked output, an occluded reveal and a continuous transition, and route its diagnostic art through the GPT handoff import. Then repair whatever that exposes, add shadow-continuity and intermediate-state demand, and rerun this same evidence set. Only then re-evaluate ENGINEERING_READY.
