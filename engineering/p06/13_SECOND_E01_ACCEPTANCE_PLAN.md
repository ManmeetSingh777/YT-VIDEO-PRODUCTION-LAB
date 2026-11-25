# 13-second E01 acceptance plan (P06 §7): exact template, NOT yet filled

**Status: UNFILLED.** No E01 script, no Experience Director shot list, no approved GPT art and no recorded voice exist yet, so no shot interval has
been chosen. This file says exactly what the real 13 s scene needs, and how the engine will accept or refuse it. Every `<…>` is filled by GPT + the
user. Claude does not fill them. Accepted real film seconds today: **0**.

## 1. The interval
| Field | Value |
|---|---|
| Film / episode | E01 "The Better One" (Mia) |
| Shot ids | `<from the locked Experience Director shot list>` |
| Absolute film frames | `[<f0>, <f0 + 780>)` = **780 frames** at 60 fps, 1920×1080 |
| Audible line(s) | `<line ids from HYBRID_CONTRACT.dialogue>` (recorded, not synthesised) |
| Modality | 2D Neutrino character acting (route A). Do not cram the host or the decoder into this 13 s unless the edit earns it (P06 §6.13). |
| Why this interval | `<the directed beat: what changes for Mia, and what the audience must understand>` |

## 2. Inputs, in the order the engine needs them
1. `CREATIVE_PACKET.json` v1.1.0 + `HYBRID_CONTRACT.json` v1.0.0. Both preflights report `SUPPORTED_IN_PRINCIPLE`. The user signs the packet digest.
2. `PERFORMANCE_COMMANDS.json`: PerformanceCommand packet v1.0.0 (`schemas/performance_command_v1.schema.json`). One command per directed action
   beat, each with `direction_decision_ids` from the approved direction and `source_digest` = the signed packet digest. The template is in
   `MIA_13S_ART_AND_PERFORMANCE_HANDOFF.md` §4.
3. `PERFORMANCE_PROFILES.json`: Mia's performance profile (template §5), **approved by the Director/user** (status `APPROVED` + receipt).
4. Run `node engine/tools/creative_handoff.mjs performance-closure --film <F> --commands PERFORMANCE_COMMANDS.json --profiles PERFORMANCE_PROFILES.json --run-type PRODUCTION`.
   It prints every drawing the commands reach (the art closure) and every typed refusal. Fix the direction or request engineering **before** any art is made.
5. Art in this order: Mia master + landmarks → world plate(s) → post-art feasibility → every state in the closure (handoff §2–3).
6. Voice: WAV 48 kHz per line + MEASURED word alignment (`alignment_source: "MEASURED"`). Typed or estimated timing is refused (`MISSING_WORD_ALIGNMENT`).

## 3. Engine acceptance (all executed by existing code; none can be waived)
| Check | Producer / consumer | Fails when |
|---|---|---|
| Schema + capability + closure | `performance_commands.mjs#compilePerformance` | unknown verb/target/role, missing cel, unapproved route/profile/decision, stale digest, overlapping owners, art refs that omit the closure |
| Every-frame effects | `performance_qa.mjs#verifyPerformance` (stage task `performance_effects`) | gaze off target, eye/mouth/hand/expression drawing not shown, grip broken on any frame, prop stuck after release, foot slide, idle drift, hold broken, prestate/poststate wrong, an effect kind with no executor, zero frames checked |
| Post-art feasibility | `post_art_feedback.mjs#postArtFeasibility` | joint limits, IK, view edges or contacts impossible with the delivered art |
| Owner coverage + render | `coverage_gate.mjs`, `chrome_frames.mjs` (S07/S08) | a frozen owner, or an owner whose motion is not visible in the composite |
| Audio | `audio_mix.mjs` (S09) | line missing, sync measured off, mix/mux failure |
| Quality gates | `quality_gates.mjs` → `TBO_20_GATE_RELEASE_REPORT.json` | any bound test fails; G07–G13, G16 and G17 need PRODUCTION evidence with real art |

## 4. Human acceptance (the user is the final artistic authority)
- Watch the 1080p60 clip with sound at normal speed, **at least twice**, plus native-resolution stills of every contact, turn and expression change.
- Every `human_quality_check` string in the commands is answered pass/fail in a signed review (`engine/film/final_review.mjs`).
- If the acting reads as robotic after focused repairs to the earliest faulty producer, take the production-master decision point: compare the same
  art in Live2D, Moho or Cartoon Animator.

## 5. Cost and time (estimates, to confirm before spending)
- Engine renders are local: Chrome, Blender and FFmpeg cost $0. A 780-frame 1080p60 render plus QA takes roughly 20–60 min on this machine.
- Art: manual ChatGPT image work by the user (time, plus any subscription they already have). No paid API call is made by the engine.
- Human time is logged in `REAL_FOOTAGE_LEDGER.csv` (manual minutes, rerolls, accepted seconds).

## 6. Result record
When accepted, add one row to `engineering/REAL_FOOTAGE_LEDGER.csv`. It holds the shot, absolute frames, approved art sha, rig master sha, sound,
code sha, render device and time, retries, manual minutes, cost, editor review and pass/fail. Only then do accepted seconds exceed 0.
