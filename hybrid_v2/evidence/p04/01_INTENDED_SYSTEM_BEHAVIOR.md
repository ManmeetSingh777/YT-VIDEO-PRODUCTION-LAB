# P04 — Intended system behavior (authoritative, derived from the directives and the code that implements them)

Source documents read in full for this run: `inputs/EXPERIENCE_DIRECTOR_V1.md`, `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md`, `inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md` (F001-F072), `inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md` (F073-F092), `inputs/STAGE1_F01_F80_SOURCE_TO_CODE_EXECUTION_SPEC.md`, `hybrid_v2/evidence/p02/FINAL_REPORT.md`, `hybrid_v2/evidence/p03/P03_REPORT.md`, `analysis/NEUTRINO_TO_GPT_ART_EXECUTION_CHAIN.md`. Order, stated plainly: the implementation spec, the Stage 1 spec, the P02 report and the execution chain were read in full only after the first repairs were written; that later reading is what exposed F137-F148.

## Stages and the single owner of each decision

| stage | intended behavior | authority (one owner) | producer module | output | gate that fails closed |
|---|---|---|---|---|---|
| S00 idea | a human states the film intent | the human (`story/FILM_INTENT.json`) | — | typed intent | missing fields |
| S01 story | claims, mechanisms and obstacles are typed, sourced and survive counterfactuals | the human (signed story approval) | `story/mechanism.mjs` | validated story contract | unverified claim, inverted mechanism, unresolved obstacle |
| S01 authoring | direction is authored OUTSIDE the engine and returned by a sealed handoff | the external author; the engine never claims authorship | `story/authoring_handoff.mjs` | proposal with lineage, compiled only after direction approval | altered request, wrong script revision, contradictory decision |
| S02 experience | each decision names a viewer purpose, a consuming operation with an interval, and a visible effect | direction (human/ChatGPT under the Director standard) | `story/experience.mjs` | attention beats | decision with no consuming operation/effect, simultaneity not met |
| S03 actions | every verb of the script/direction compiles into typed sub-operations that have executed evidence | typed semantic actions | `story/action_coverage.mjs` | coverage | unsupported verb, missing release, unrelated state change |
| S03 motion plan | exactly one production plan: the film plan with the approved ActionPhrases compiled in | direction (timing) | `story/motion_plan_source.mjs` | one hashed plan | conflicting phrases, missing plan |
| S03 motion compile | intent → phrases → acting → contacts → approved art states → matrices/passes, all frame-addressable | the plan (phrases) + rig topology (from art) | `art_bridge/temporal.mjs` with `acting.mjs`, `state_timeline.mjs`, `state_channels.mjs`, `execution.mjs` | deterministic `stateAtFrame(f)` | STATE_CONFLICT, ACTING_INVALID, PHRASE_UNEXECUTABLE, missing owner, limits |
| S03 feasibility | every action of every identity, contact and non-contact, every frame, through the complete pipeline | the fitted rig | `art_bridge/art_intake.mjs#checkRigFeasibility` | FEASIBLE / INFEASIBLE / NOT_APPLICABLE / NOT_EVALUATED | zero evaluations, any frame exception, missing edge |
| S04 art demand | every visible state, part, view, hand closure and camera surface is demanded with its frames | the action graph | `art_bridge/art_demand.mjs` | ArtJob list | missing state/closure/plate |
| S05 art | genuine GPT images in the manual ChatGPT loop, imported and provenance-labelled | the operator | `art_bridge/gpt_handoff.mjs`, `art_intake.mjs` | candidates, registered parts | foreign/stale bundle, wrong bytes, missing landmarks |
| S06 registration | measured landmarks, alpha, fitted joints, approved states, deformation approvals | measured pixels + reviewer | `registration*.mjs`, `approvals.mjs` | receipts and approvals | residual > tolerance, unapproved channel state, changed deformation |
| S07 render | real registered art through the preserved `nu.js` runtime, absolute-frame seeking, per-owner evidence | compiled motion | `film/chrome_frames.mjs`, `segment_render.mjs` | RGB24 chunks + receipts | missing art, uncovered edge, frozen owner, plan/approval missing |
| S08 QA | every frame covered, every owner's pixels explained by its own motion | measured receipts | `film/coverage_gate.mjs`, `film/semantic_qa.mjs` | coverage gate | inert owner, missing swap/deformation, unmet consequence |
| S09 audio/final | buses on the frame clock → mix → per-stem sync → mux into the verified video → re-verify the published audio | recorded audio (or labelled test signals) | `film/audio_mix.mjs` | `film_final.mp4` + `FINAL_MEDIA_RECEIPT.json` | late/missing cue, wrong bus, changed video essence, no audio stream |

## Added by the second pass (each with one owner)

| stage | behavior | owner | producer | refuses |
|---|---|---|---|---|
| S00 | a proposal becomes production input only under its own receipt | the reviewer | `story/authoring_handoff.mjs#compileAccepted` | asserted approval, edited proposal |
| S03 | every direction decision is performed by its own owner in its interval | direction | `story/direction_consequence.mjs` | static actor, other owner's motion, unknown operation |
| S03 | events stand in the director's relation to measured words; holds are kept | direction + measured audio | `story/narration.mjs#verifyNarrationRelations` | approximate words, broken hold |
| S03 | attended subjects stay in frame and art stays in its scale range | direction + approved art | `art_bridge/framing.mjs` | unexplained crop, over-enlargement |
| S06 | a grip is a painted contact with a decided finger topology | measured pixels | `framing.mjs#verifyContactPatch`, `scene_graph.mjs` | coordinate-only contact |
| S08 | each decision is visible in its own isolated pixels | the render receipts | `film/coverage_gate.mjs` | whole-frame change |
| S09 | the film decision covers the exact published bytes | the reviewer | `film/final_review.mjs` | any changed byte |
| all | human decisions are requested, signed offline and imported | the reviewer's own key | `art_bridge/review_requests.mjs` | unsigned, forged, stale, replayed, foreign, revoked |

## Invariants (what must never happen)
1. The renderer draws nothing that is not an approved drawing: missing art is a typed ArtJob or a refusal.
2. A later layer never erases an earlier one silently: contact IK overrides are recorded (`suppressed_by_contact`), a grip is verified or it fails, an OPEN that reaches 0.1° is not an OPEN.
3. State persists: a held grip, an open door, a worn costume do not reset at an action or shot boundary unless the contract says so (`action.state_reset`).
4. Equal-frame contradictions at equal priority fail; director events beat compiled acting; input order never matters.
5. Zero evaluations never count as a pass; a thrown frame is a failed frame; a stage with obligations must produce tasks or block.
6. Approvals are hash-scoped over geometry and pixels (assets, parts, states incl. channels, edges, deformation maps); any change stales them. Human authority is an external signed envelope.
7. Preflight is read-only. The published MP4's actual audio must carry every cue; per-stem verification prevents matching a cue to another bus.
8. The revision hashes code content, plans and bytes, never timestamps.

## What is implemented as an external boundary (not software)
Real GPT artwork, the human art/story/direction reviews and signatures, recorded narration with forced alignment, real music and sound design, and the final film review are outside this system. The diagnostic chain runs with labelled fixture stand-ins that the production gates refuse.
