# P03: source-verified Neutrino ↔ GPT-art integration correction

- **Branch:** `repair/neutrino-gpt-art-integration`, from baseline `7c924aa3376f02f51058bf175c90eb9459d340dc`.
- **Not merged into main.** Nothing here is a qualification claim.
- **Production status:** no GPT art, human approval, recorded narration or real film exists. **PRODUCTION_READY: NO.**
- **Neutrino runtime:** `engine/runtime/nu.js` is byte-identical (sha256 `773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be`).
- **Fixture art:** every image in this round is a flat-coloured DIAGNOSTIC_FIXTURE raster or vector built by `tests/p03/subjects_fixture.mjs`. It is registered through the real intake API. It is not target art, and production gates refuse it.

## 1. Reproduced failures: before (7c924aa) vs after (this branch)
`node tests/p03/reproduce_defects.mjs <REPO_ROOT> <OUT_JSON>`. The same probe script ran on both checkouts. It uses only functions both versions export.

| probe | defect | 7c924aa | branch |
|---|---|---|---|
| B | expression derived from the pose-state id | reproduced | not reproduced |
| C | feasibility skips non-contact actions | reproduced | not reproduced |
| A | acting intentions have no consumer | reproduced | not reproduced |
| D | `plan.phrases` ignored by compileMotionTracks | reproduced | not reproduced |
| E | approved deform map changes no rendered contour | reproduced | not reproduced |
| F | shadow / grip morphology / balance absent from execution | reproduced | not reproduced |
| G | coverage gate passes a frozen character while particles move | reproduced | not reproduced |
| H | no narration/SFX/music buses, ducking or loudness | reproduced | not reproduced |
| A2 | no explicit art-state channels in the rig contract | reproduced | not reproduced |

Files: `REPRODUCED_BEFORE_REPAIR_7c924aa.json`, `REPRODUCED_AFTER_REPAIR.json`.

Probe D was retargeted to owners without an authored track. The repaired compiler refuses (`INVALID_TRANSFORM_OWNER`) a phrase that would silently fight an authored track. The baseline still ignores the retargeted phrase.

### Code causes
- **B.** `resolveApprovedArtStates` and `asset_state` took `expression` from the pose-state id.
- **C.** `feasibilityFor` filtered to contact actions and frames.
- **A.** Nothing read `plan.acting`. The original nu.js `actor` behaviour had no art-driven counterpart.
- **D.** `compilePhrase` was called only by `tools/compile_film_contracts.mjs`.
- **E.** Deform maps were validated, never rendered. Vector paths had no intake, manifest field or emitter.
- **F.** `gripMorphology`, `balance` and `castShadow` were reachable only from contract compilation.
- **G.** The gate looked at whole-frame hashes only.
- **H.** There was no mixer.

## 2. Capability matrix (measured on the two-subject fixture; `MEASURED_FACTS.json`)

| | capability | producer (render path) | positive proof | negative / counterfactual |
|---|---|---|---|---|
| A | acting compiler | `acting.mjs#compileActing` → `temporal.compileMotionTracks` → scene → Chrome | Lag from topology depth: biped head 6 f, creature head 12 f via neck1→neck2. Anticipation/settle keys. Breath is additive rotation only (scale = 1 on every matrix). Blink and speech are channel swaps. Gaze is a bounded additive turn. | `ACTING_UNEXECUTABLE` for an unknown joint or an amplitude past the joint limit. `MISSING_ART_ASSET` for an unapproved blink state. |
| B | state ownership | `state_channels.mjs` (EXPRESSION/EYES/MOUTH/HAND/CLOTHING/LIGHTING/OCCLUSION) + pose/view | Eyes closed while pose = open (frame 32). Channel states are approved through hash-scoped receipts (`approveState rig channel.state`). | `MISSING_ART_ASSET` for a missing drawing. `STATE_CHANNEL_CONFLICT` when two channels own one slot. |
| C | feasibility on every action | `art_intake.mjs#feasibilityFor` | Each checked entry lists its actions and frames. | A non-contact action with an invalid state change → INFEASIBLE (test C1). |
| D | phrases are primary motion | `acting.mjs#layerPhrases` inside `compileMotionTracks` | Editing the phrase changes chest matrices and camera zoom. Acting lag is then applied to the phrase track (chest +3 f). | `PHRASE_UNEXECUTABLE` for an unknown owner. `INVALID_TRANSFORM_OWNER` for phrase vs authored track. |
| E | deformation | `execution.mjs#deformAt` → per-triangle clipped passes. Vector: `ingestVectorPart` → `vector_paths` → per-frame `d`. | Mesh weight 0 / 0.146 / 0.5 / 0.854 / 1 at f240/255/270/285/300; end vertices = targets. Morph middle = midpoint of control points. In Chrome, 237/237 deform frames differ from the rigid counterfactual; brow morph 169/169. | Inverted triangle, mesh outside the approved pixels, and a mesh not covering all pixels → refused. Incompatible vector topology → `INVALID_MORPH_TOPOLOGY`. |
| F | grip / balance / shadow / reaction in execution | temporal `reactionsAt`, `supportAt`; scene `gripMorphology`, `castShadow`, `paint_order` | Grip error ≤ 0.0005 px; 130/130 hold frames pass morphology, palm within 3.9° of facing. Feet planted (max 3e-13 px). COM inside support (min margin 2.9 px). COM moves at f58, before the lever at f73. Lever −4.8°..+1.3°, residual ~1e-13 px (bare plan: static). Shadow from the approved torso drawing, floor material 0.4. Hair 6.4° / tail 4.7° follow-through. | A reversed palm or a lost near/far order → `GRIP_MORPHOLOGY_FAILED`. COM outside support → `BALANCE_FAILED` (seen while staging). Reaction out of tolerance fails its ledger task. |
| G | per-owner attribution | `chrome_frames.attributionUnits`: isolated capture per rig and per state/deform slot, with a fixed reference camera and counterfactual refs. `coverage_gate.ownerAttributionGate` | Directed clip: 9 units pass. All discrete swaps rendered (blink 4, mouth 11, grip 2); deform and morph differ from rigid on every active frame. | Chrome perturbations, each detected with its unperturbed control passing: frozen character while particles move; missing grip transition; missing blink; missing deformation; missing object reaction. |
| H | audio buses + A/V sync | `film/audio_mix.mjs` (`mixBuses`, `verifyAudioSync`, `muxAV`) | 4 onsets detected from the decoded mix: SFX f70 +0.35 ms, f200 +0.02 ms, words f30 +0.13 ms, f60 +0.02 ms. Ducking 15.3 dB measured on the ducked stem. −16.2 LUFS (target −16). Mouth-open swaps on the same frames. Muxed 8.0 s / 8.0 s. | An SFX placed 3 frames late → `AUDIO_SYNC_MISMATCH`. |
| I | ledger tasks | `stages.mjs#capabilityTasks` (S03); `audio_mix` / `av_sync` (S09); owner gate in S08 `coverage_gate` | `LEDGER_TASKS_P03.json`: 7/7 derived tasks pass, each with producer, invariants and measurement. | A broken reaction tolerance fails its task. |

## 3. Changed functions and contracts
**New modules**
- `engine/art_bridge/state_channels.mjs`: `validateChannels`, `channelEvents`, `channelStatesAt`, `resolveBindings`, `bindableAssets`.
- `engine/art_bridge/acting.mjs`: `layerPhrases`, `compileActing`.
- `engine/art_bridge/execution.mjs`: `triAffine`, `validateDeformBinding`, `deformAt`, `dilate`, `validateMorphBinding`, `morphAt`, `shadowAffine`, `solveHinge`, `comX`.
- `engine/film/audio_mix.mjs`: `decodePcm`, `detectOnsets`, `mixBuses`, `verifyAudioSync`, `muxAV`.
- `engine/tools/canary_contract.mjs`: read-only canary contract and packet generator.

**`temporal.mjs#compileMotionTracks`**
- Layers run phrases → acting before validation.
- Deform/morph slots resolve from the registered asset; ambiguity is refused.
- Validates deform maps, morphs, reactions and support.
- Additive acting goes into `rawJoint`; gaze and HINGE_FOLLOW reactions go into `evalPrimary`.
- Adds `reactionsAt`, `deformsAt`, `morphsAt`, `supportAt`.
- `resolveApprovedArtStates` uses channels.
- `stateAtFrame` returns `deforms`, `morphs`, `reactions` and `support`, plus their failures. `C.layers` is the precedence report.

**`scene_graph.mjs#composeShot`**
- Emits shadow passes (approved occluder plus material filter), per-triangle clipped deformation passes, and vector morph path rows (5th row element `{d}`).
- `paint_order` adds cross-rig occlusion edges to `topoOrder`.
- `frameState` runs grip morphology and records `execution` (shadows, grips, deforms, morphs).
- Exposes `deformables`.

**Smaller changes**
- `svg_parts.mjs#emitSpritePart`: VECTOR_PATH emission. `emitRigTree`: channel drawings.
- `render.mjs#buildComposition` and `runtime/bridge_rt.js`: optional per-row attribute map (`a:d`). nu.js is unchanged.
- `art_intake.mjs`: `feasibilityFor` covers all actions and pose edges; `approveState` handles channel states; new `ingestVectorPart` and `parseSvgPaths`.
- `approvals.mjs#bundleFor`: channel states are bundled over their own slots.
- `registration_evidence.mjs`: verifies vector receipts.
- `load_manifest.mjs`: `vector_paths` must equal the approved SVG.
- `asset_state.mjs` / `art_demand.mjs`: channel cuts and repertoire demand.
- `errors.mjs`: 10 new codes.

**`chrome_frames.mjs`**
- `attributionUnits` and isolated attribution with a fixed reference camera.
- `diagnosticPerturb` is refused in PRODUCTION.
- The composition cache now keys on every art_bridge module, the plan and the manifest. Two stale-bake bugs were found this round; see §11.

**Render / gate / ledger**
- `segment_render.mjs#renderChunk`: per-owner receipts.
- `coverage_gate.mjs`: `ownerAttributionGate`. `coverageGate(requireOwnerAttribution)` is true for production and Chrome. A diagnostic flat-renderer run reports `owner_attribution_absent` instead of passing silently.
- `stages.mjs`: S03 capability tasks, S08 attribution requirement, S09 `audio_mix` and `av_sync`.

**Schema:** `rig.state_channels`, `action.state_events`, `asset.vector_paths`.

## 4. Chrome / Neutrino footage and pixel evidence
Every frame comes from the production session: registry → compile → composeShot → buildComposition (preserved nu.js) → Chrome seek → RGB24 → production chunk loop.

- `clips/p03_directed.mp4`: 480 frames, 1920×1080 at 60 fps, H.264 of the exact RGB24. **0 renderer defects.**
  - Shot A: the biped pulls the lever.
  - Shot B: the creature watches.
- `clips/p03_bare_before.mp4`: same shots, direction keys only. This is the BEFORE for every capability. Its camera has no phrase zoom, so it sees past the diagnostic plate; the renderer flags uncovered edges (visible magenta).
- `audio/p03_directed_with_audio.mp4`: the directed clip muxed with the measured mix.
- Selected frames: `clips/p03_directed/f*.png` and `clips/p03_bare_before/f*.png`.
- `CONTACT_SHEET_d060_d150_bare150_d420.png`: directed f60, directed f150, bare f150, directed f420.
- Per-frame hashes, state hashes and owner receipts: `clips/*.receipt.json`.

**Visual inspection of actual frames found and fixed:**
- the plate didn't cover the camera (sentinel edges);
- in the fixture, facial features were off the head;
- an inset deform mesh dropped approved pixels (now refused by the engine);
- the cast shadow fell off the floor band (projection direction is now declared);
- the creature floated.

**Still visible:** only the torso is declared as a shadow occluder, so the shadow does not connect to the feet. The lever swing is small (~6°) because the pull distance comes from a modest lean.

## 5. Negative / counterfactual proofs (Chrome, production session)
`clips/NEGATIVES.json`. Each perturbation changes only the pixels; the expected state stays the true compiled state.

| perturbation | frames | detected as | control (same frames, unperturbed) |
|---|---|---|---|
| frozen character while 12 particles move | 80–119 | `nova_pull_lever:nova_rig` OWNER_MOTION_RENDERED | passes |
| missing grip transition | 64–75 | `…:nova_hand_open` DISCRETE_STATE_NOT_RENDERED | passes |
| missing blink | 26–39 | `…:nova_eye_open` DISCRETE_STATE_NOT_RENDERED | passes |
| missing deformation | 280–309 | `lumen_watch:lumen_rig:lumen_body` DEFORMATION_NOT_RENDERED | passes |
| missing object reaction | 110–149 | `nova_pull_lever:lever_rig` OWNER_MOTION_RENDERED | passes |

The first attempt missed two cases: the camera push moved the isolated owner's pixels. The cause was attribution using the live camera. It now uses the shot's fixed reference camera.

## 6. Unlike-subject transfer
The same compilers run on two topologies; nothing in the engine names a subject.
- **Biped:** 13 joints, two 2-bone legs, an arm, eye/mouth/brow channels, raster parts and a vector morph.
- **Creature:** 6 joints, a neck chain, a two-segment tail, one large eye, no limbs, no mouth.

Lag, breath, blink, follow-through, gaze and deformation transfer from rig data: creature head lag 12 f from its own depth, tail spring 4.7°, single-eye blink swaps rendered, body mesh deformation rendered. The two subjects use different art families in their design gates (ACTING_HUMAN vs ANIMAL_OR_ORGANISM, plus MACHINE_OR_MECHANISM for the lever).

## 7. Audio (actual files, measured from the decoded mix)
`audio/AUDIO_SYNC_REPORT.json`. The signals are DIAGNOSTIC test tones, noise and clicks synthesised with ffmpeg. They are not narration and not sound design.

- **One frame clock.** SFX sit on the GRIP contact start/end frames read from the manifest, sample-exact. Narration words → mouth swaps at `round(start_s·60)`.
- **Onsets** are detected from the mix PCM with a 5 ms window plus sample refinement. They are robust to the noise bed and to overlapping narration.
- **Loudness:** two-pass EBU R128.
- **Ducking:** sidechain, measured on the ducked music stem.

## 8. Ledger
`LEDGER_TASKS_P03.json`. The tasks are derived from the film's own plan. Each records producer, invariants, verification, measurement, pass/fail and failure class:
- **S03:** `motion_layers`, `deform_lumen_watch`, `morph_nova_pull_lever`, `reaction_lever_follow`, `support_nova_rig`;
- **S09:** `audio_mix`, `av_sync`.

All pass; the counterfactual fails. The S08 coverage gate carries per-owner attribution: required in production and Chrome runs, reported when absent in diagnostic flat renders.

These tasks were run directly. A full hash-chained `production_run` of the fixture film through S00–S09 was **not** performed this round.

## 9. Regression
Full suite on a frozen snapshot of the finished branch code: `node --test --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs`. Log: `regression/FULL_REGRESSION_branch_snapshot.tap`.

- **Result:** 204 tests, **203 pass, 1 fail**. `p02_injection` completed.
- **The one failure is pre-existing: `P02-R14`.** When the rehearsal film is built fresh (no stored `rehearsal_J`), frame 3900 reports `asset rt_world_far: no design for master rt_world_far`. The untouched baseline `7c924aa` fails identically (`regression/BASELINE_7c924aa_p02_trace.tap`: 2 pass, 1 fail, same message). The fresh rehearsal builder makes no world-plate design. This round did not cause it and did not fix it.
- **P03 suite:** `tests/p03/p03_capabilities.test.mjs`, 19/19 pass (`regression/P03_CAPABILITIES.tap`).
- **Test changes this round:**
  - `p02_scan` R06 now passes `requireOwnerAttribution: false` for its `diagnostic_flat` receipts. It also asserts that the gate reports the absence, and fails when attribution is required.
  - `p02_trace` R13/R08 pass again after the S08 attribution policy.
- **An earlier run timed out.** Its partial `INJECTION_SUMMARY.json` is preserved under `test_side_effects/`; the tracked file was restored.

## 10. 10-second canary contract and GPT ArtJob packet
`canary/CANARY_CONTRACT_10S.json` and `.md`, generated read-only by `engine/tools/canary_contract.mjs --film films/hv2_film001 --from 1320`.

- **Window:** frames [1320, 1920), 1920×1080 at 60 fps, valid stage. Shot S02, actions S02_operate_washer, room_life, push_in and porthole.
- **Capabilities:**
  - polished art: **BLOCKED_ON_GPT_ART** (0/52 delivered);
  - separate parts: DECLARED;
  - acting, grip morphology, weight transfer, mechanism reaction, occlusion/deformation, secondary motion: **MISSING_CONTRACT** (the film's plans do not yet declare the P03 blocks; a direction template with NULL values is included for the direction owner);
  - purposeful camera: DECLARED;
  - audio: **BLOCKED_EXTERNAL** (needs recorded narration and forced alignment).
- **ArtJob packet:** 52 planned assets with ArtJob ids and blockers (33 WAITING_ON_MASTER_APPROVAL, 18 BLOCKED_CONTRACT, 1 WAITING_FOR_APPROVALS_THEN_GPT_ART). Also:
  - 2 proposed plan amendments: `ines_face_eyes_closed` (blink) and `ines_face_mouth_mid` (speech), NOT added to the plan;
  - 3 unplanned blocking demands, as before: grip and pinch closure drawings, and laundromat world coverage.
- **Authority:** story NO_RECEIPT, direction NO_RECEIPT, so every export is refused by design.
- **Route:** manual ChatGPT export-gpt-job / import-gpt-candidates (no API spend). The procedure is in the `.md`.
- **Stop:** this round stops at the art-delivery boundary. No job was exported, no image generated, nothing approved.

## 11. External dependencies and what is NOT done
- **Needs a human, not code:**
  - human story and direction approvals (signed envelopes);
  - per-master design approvals;
  - GPT artwork via your ChatGPT subscription;
  - human art review;
  - a recorded narration with forced alignment;
  - real SFX and music;
  - the direction values for the canary's P03 blocks;
  - independent human film review.
- **Deformation maps** carry an `approved_receipt` string that is **not yet verified** against a hash-scoped approval receipt. Before production, a `deform` approval scope is needed.
- **Grip morphology and shadows** are verified per rendered frame and in tests. They have no separate S03 ledger task.
- **Stale-bake bugs found and fixed this round:** the composition cache key omitted the new modules and the motion plan. Earlier P02 diagnostic renders that used a fixed `workDir` could have reused stale bakes after plan edits. Production calls use a plan-hashed directory, and the key now includes both regardless.
- **Remaining fixture-staging limitations:**
  - the bare "before" clip shows uncovered edges;
  - only the torso is a shadow occluder;
  - the lever swing is modest.
- Automated checks never replace artistic review. Nothing here is qualified.
