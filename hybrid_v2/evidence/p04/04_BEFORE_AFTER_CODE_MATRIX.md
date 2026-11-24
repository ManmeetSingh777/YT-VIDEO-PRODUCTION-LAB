# Before / after code matrix (P04)

Before = `900a6b1` (P03). After = the code commit named in `12_FINAL_ENGINEERING_READINESS.md`. Every row: failure → earliest wrong producer → generalized change → consumer → test. No producing source names a test character, shot, asset or coordinate.

| # | Failure predicate (before) | Changed function | Generalized change (after) | Consumer | Tests |
|---|---|---|---|---|---|
| 1 | a contact that never ended counted as CONTACT_END; another object's state counted as TARGET_STATE_CHANGE; unknown verbs passed | `story/action_coverage.mjs#satisfies`, `compileActionCoverage` | end + release evidence; correct object, requested state, real change; unknown verb = UNSUPPORTED_SEMANTIC_ACTION | S03 `actions_*` | P04-2.3, P02-R23 |
| 2 | presence in a shot satisfied a decision; `DIRECTION_DECISIONS.json` had no reader | `story/direction_consequence.mjs` (new), `story/experience.mjs#compileAttention` | closed operation registry, consequence measured on the decision's own owner and interval | S03 `direction_decisions`, S08 `decision_pixels` | P04-2.2, 2.2a–e |
| 3 | phrases had two authorities | `story/motion_plan_source.mjs` (new), `compile_film_contracts.mjs` | one compilation; conflicts refuse; the contract report shows the rendered phrases | S03, renderer | P04-2.4, 2.4c (Chrome) |
| 4 | editing an approved phrase kept the direction approval | `art_contract.mjs#scopeBundle` | direction approval covers decisions, semantic actions, phrases | S02 `direction_approval` | P04-2.4b |
| 5 | direction could only be validated, not authored and returned; approval was a boolean argument; instructions named a missing CLI | `story/authoring_handoff.mjs`, `authoring_cli.mjs` (new) | sealed export, revision-bound import, acceptance only under a verified receipt, lineage | production inputs | P04-2.1, 2.1b |
| 6 | narration relation, holds and secondary word lists unchecked | `story/narration.mjs#verifyNarrationRelations` | PRECEDES/LANDS_ON/FOLLOWS on measured words, recognition holds, no approximate override | S03 `narration_timeline` | P04-2.5 |
| 7 | state reset at every action; order-dependent events | `state_timeline.mjs` (new), `state_channels.mjs#channelEvents` | one persistent history; numeric priority; equal contradiction = STATE_CONFLICT | temporal, demand, feasibility, scene, QA | P04-3.1, 5.1 |
| 8 | closure inferred from body pose; film plan never reached the demand; camera sampled every 6th frame; no acting/plate/morph/effect demand | `art_demand.mjs#deriveArtDemands`, `stages.mjs` S04 | HAND-channel closure; closure over the production plan and the whole camera path | S04, IR | P04-3.2, 3.3 |
| 9 | handoff bound to an absolute path; motion contract absent | `gpt_handoff.mjs` | project id + generation; bundle carries the motion contract and an import template | `art_outbox.mjs` | P04-3.6, P02-R26 |
| 10 | zero plans = FEASIBLE; exceptions skipped | `art_intake.mjs#checkRigFeasibility` | full pipeline on every frame; physical and paint results separated; S06 re-check must be complete | S03, S06 | P04-4.1/4.2, S3C-8 |
| 11 | zero-period acting hung; NaN became null | `acting.mjs#validateActingParams` | refused before compilation | temporal | P04-5.2 |
| 12 | ungoverned grips; closure from pose; free prop motion; coordinate-only contact; undecided finger layers | `scene_graph.mjs`, `framing.mjs#verifyContactPatch` (new) | contract required; HAND drawing; prop causality; painted overlap on every held frame; layers or a stated reason | S03, S06, S07 | P04-5.3, 5.3b, 5.3c |
| 13 | summed-area mesh coverage; unsigned deformations | `execution.mjs#validateDeformBinding`, `approvals.mjs#verifyDeformApproval` | geometric tiling; hash-scoped receipt | S03, Chrome | P04-5.5 |
| 14 | only background coverage checked; `render_scale_range` read by nobody; rotation-only camera static | `framing.mjs#verifyFraming` (new), `stages.mjs#buildFrameTraceIndex` | crop and enlargement on every frame; `rot` key | S03 `framing`, S08 | P04-5.7, 5.7b |
| 15 | torso-only shadow grounded a character | `scene_graph.mjs` | the planted limb must cast | frame evaluation | F4 |
| 16 | channel states missing from approvals | `approvals.mjs#verifyAllApprovals` | every channel state enumerated | load, S06 | P04-6.1 |
| 17 | no way to sign; a master could not be signed; keys not revocable; envelopes not film-bound | `review_requests.mjs`, `review_sign.mjs`, `reviewer_sign_offline.mjs` (new), `reviewer_auth.mjs`, `art_intake.mjs#reviewMaster` | request → offline signature in an interactive terminal → verified import, 10 scopes | all approval gates | P04-6.2a–c |
| 18 | preflight executed side effects; undefined plan reached the renderer; empty task sets passed; exceptions vanished; list order = execution order | `production_run.mjs`, `stages.mjs` | pure preflight; deterministic plan; obligations; recorded exceptions; dependency order; manifest checked at S03 | S00–S09 | P04-7.1–7.4 |
| 19 | blurred frames had no owners; effect/deform/camera judged on whole frames; rendered frame never compared with its state | `chrome_frames.mjs`, `coverage_gate.mjs`, `segment_render.mjs` | owners for blur, procedural, effect and camera units; frame-equals-state; own-pixel decisions | S07, S08 | P04-7.5, 7.6b, 2.2e; Chrome negatives |
| 20 | pixel difference = correct action | `film/semantic_qa.mjs` (new), `production_ir.mjs` (new) | per-verb measured consequence; strict arrows | S03 | P04-5.4, 1, 1b |
| 21 | mix made after the MP4; cues matched anywhere; mono loudness | `audio_mix.mjs` | stems, one-to-one cues, mux with identical video packets, decoded check of the published file | S09 | P04-7.7 |
| 22 | film review compared with a null bundle | `film/final_review.mjs` (new) | decision over the exact published bytes | S09 `film_review` | P04-7.7b |
| 23 | size+mtime code hash | `film_revision.mjs` | content hash of every production module | every receipt | P04-7.8, P02-R08 |
| 24 | P02-R14 clean build had no world design | `tests/p02/rehearsal_film.mjs` | the fixture producer supplies the design record; `traceFrame` unchanged | S08 trace | P02-R14 |

## Changed historical expectations, with the contradiction

| Test | Change | Why the old expectation contradicts the specification |
|---|---|---|
| semantic_action_coverage T08 | fixture gains a release event | directive 2.3: CONTACT_END needs a release; the fixture never released |
| transition_render M15 | closure demand now names the HAND channel | directive 3.2: closure may not come from body pose |
| p02_injection R23 (S09) | first failing task may be `audio_mix` | directive 7.4/7.7: declared audio with no buses must fail at the mix, before the probe |
| p02_repairs RP2 | ignores the added `from_state` field | directive 2.3 requires the starting state; the asserted fields are unchanged |
| p02_trace R14 | camera sample 3900 → 3850 | the fixture's last camera key is at 3900 and intervals are half-open, so `camera_moving === true` at 3900 is false by construction; frame 3900 itself also traces without blockers (checked separately, see 12) |
| P03 fixtures | HAND channel, deform receipts, grip release edge, limb shadows, single-layer reason | required by the stricter gates above |
