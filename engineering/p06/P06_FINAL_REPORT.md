# P06 final engineering report (13 s performance system)

**Tested source:** `b2c6931a628f68773349dc2565d7aae5530ad41d` (engine, schemas and tests frozen before the run). nu.js sha256 `773baf91…db793e7be` is unchanged.
**Regression:** ONE comprehensive run on that exact SHA, in a detached worktree. It ran 2026-11-25 21:18Z → 23:42Z; `final_run/RUN.txt` has the run log and its four pre-existing dirty test-output files.
**Cost:** $0. No paid API, GPU or image call was made. **Accepted real film seconds:** 0.

## 1. Results
| Step | Result | Evidence |
|---|---|---|
| Full suite (art_bridge, p02, p03, p04, p05, tbo) | **296/296 pass**, 0 fail/skip/cancel (94 min) | `FINAL_ENGINEERING_TAP.tap` sha256 `3d2ff351…5693e978` |
| P03 Chrome negatives | 7/7 defects detected; 7/7 controls pass | `final_run/p03_chrome_negatives/` |
| P05 render negatives | 7/7 detected; controls pass | `final_run/p05_render_negatives/NEGATIVES.json` |
| P05 short production chain | S00–S08 COMMITTED. S09 BLOCKED **by design**: a DIAGNOSTIC run can never satisfy the human film review. Post-art `POST_ART_MOTION_FEASIBLE` 890 frames; 91 handoffs | `final_run/p05_chain/*.json`. The MP4 (14.7 MB) is not committed; it is listed by sha in `final_run/HASHES.txt` |
| P06 integration (14 commands, 2 unlike rigs) | qa_ok, 14/14 effects, 0 failures | `SHORT_INTEGRATION_EVIDENCE.json`, `PERFORMANCE_COMMAND_EXAMPLE.json` |

The two earlier full regressions (frozen `6d91a60`, dev `7f7ad7c`) were stopped at 182/182 each and stay recorded as **PARTIAL, not passed**
(`engineering/regression_partial_2026-11-25/`).

**Post-freeze change (disclosed):** `engine/tools/p06_evidence.mjs`, an evidence reporter, not engine code. Its test-name matcher missed
`"A1 acting: …"` because of the colon, so C3 showed a false `ok:false`. The fixed matcher accepts `<id>` + space, colon or end of name. The
evidence was regenerated from the same TAP. No engine or test file changed after `b2c6931`.

## 2. Command implementation matrix (`PERFORMANCE_COMMAND_IMPLEMENTATION_MATRIX.json`)
| Verb | Status | Legal routes | Mandatory effect |
|---|---|---|---|
| look_at | VERIFIED_CODE, two unlike rigs | PART_RIG_2D, RIGID_2D | GazeTowardTarget |
| blink | VERIFIED_CODE, two unlike rigs | APPROVED_CELS | EyeStateTransition |
| idle | VERIFIED_CODE, two unlike rigs | PART_RIG_2D, RIGID_2D, APPROVED_CELS | LegalIdleHold |
| turn_head | VERIFIED_CODE, one rig (within the rigid limit; larger turns need view cels) | PART_RIG_2D, RIGID_2D, APPROVED_CELS | ApprovedViewTransition + GazeTowardTarget |
| speak | VERIFIED_CODE, one rig (LIMITED rest/mid/open from measured words; no visemes) | APPROVED_CELS | SpeechAudioVisualSync |
| reach / grip / release / hold | VERIFIED_CODE, one rig | PART_RIG_2D (+cels) | ContactApproach / PaintedGripMaintained / ReleaseAndSeparation / PoseContactHold |
| react / change_expression | VERIFIED_CODE, one rig | PART_RIG_2D, APPROVED_CELS | PurposefulEmotionRendered / ExpressionStateReached |
| point | VERIFIED_CODE, one rig (labelled stand-in drawing) | PART_RIG_2D | ApprovedPointerAligned |
| walk | **REFUSED**: the articulated PART_RIG walk is not built; only an approved gait cel cycle is legal | APPROVED_CELS | PlantedFootStable |
| turn_body | **REFUSED before art**: no approved body view family exists | APPROVED_CELS | ApprovedBodyTurn |

Every effect has an executor that checks every frame; unknown kinds and zero frames checked both fail. On lumen (non-human), hand verbs are
refused as `PERFORMANCE_CAPABILITY_MISSING` (anatomy), never as a missing-art request.

## 3. Six failure classes (`SIX_DEFECT_TRANSFER_MATRIX.json`): every bound test passes
| Class | Status |
|---|---|
| C1 mismatched parts | VERIFIED_CODE (diagnostic). Real-art fit needs Mia art and a human appearance review |
| C2 impossible drawing | VERIFIED_CODE: closure demanded before art; post-art feasibility on every frame; a missing state is an exact ArtJob |
| C3 lifeless motion | Mechanism VERIFIED_CODE. Whether it reads as alive is **NEEDS_HUMAN** on the real 13 s scene |
| C4 view identity drift | Refusal VERIFIED_CODE. Positive view-cel turns need approved view art |
| C5 pasted 3D host | Adapter VERIFIED_CODE (fps 60, straight alpha, mesh/action hash freshness, occluder bands, transparency). HOST_3D_ASSET_PENDING |
| C6 expensive repetition | One interpreter, closure planner and profile set reused across both unlike rigs |

## 4. Twenty gates (`TBO_20_GATE_RELEASE_REPORT.json`)
- **P06 primary status:** 19 VERIFIED_CODE, 1 NEEDS_HUMAN (G20), 0 FAILED, **0 VERIFIED_REAL_ART**.
- **Release blockers remain on 19 of 20 gates.** NEEDS_EXTERNAL_ART on G01–G18 and G20; NEEDS_HUMAN also on G02, G05, G06, G14, G18 and G20.
  G19 (source revision/stale evidence) has no blocker.
- **Production status (strict registry):** 18 BLOCKED_EXTERNAL, 2 NOT_TESTED, 0 FAILED, 0 VERIFIED_WITH_EVIDENCE.
- **Nothing is release-ready:** no gate holds real-art production evidence.

## 5. Routes
- **A. 2D Neutrino acting:** implemented (section 2). This is the route for the 13 s scene.
- **B. Blender host:** `BLENDER_HOST_PASS_CONTRACT.json` v1.1.0. The adapter has been run on real Blender 5.1.2 with a diagnostic capsule.
  An approved `.blend` asset does not exist yet.
- **C. Truthful decoder:** `STRATEGY_DECODER_MODEL_CONTRACT.json` v1.1.0. A scenario whose claimed outcome contradicts the model is refused
  (`SCENARIO_CLAIM_MATCHES_MODEL`). Real model content needs sourced claims from GPT and the user.

## 6. Not built (typed refusals, never substituted)
- articulated PART_RIG walk
- CARRY, LOAD_CONTAINER and INSERT_TOKEN
- visemes
- PINCH
- camera orbit and 3D dolly
- perspective host camera
- depth/matte pass

## 7. Remaining user/GPT inputs, and the 13 s contract
These are spelled out in `13_SECOND_E01_ACCEPTANCE_PLAN.md` and `MIA_13S_ART_AND_PERFORMANCE_HANDOFF.md`:
1. Signed E01 creative packet and hybrid contract.
2. Choice of a 780-frame interval at 60 fps.
3. Direction choices for walk, carry, turns and lip-sync.
4. Mia master, landmarks, parts and the state cels the `performance-closure` output lists.
5. Approved Mia performance profile.
6. PerformanceCommand packet bound to the signed digest.
7. Recorded 48 kHz lines with MEASURED word alignment.
8. The user's signed final review of the exact MP4.

## 8. Next engineering task
After the user and GPT supply the real E01 packet and commands:
1. Run `creative_handoff.mjs performance-closure --run-type PRODUCTION` on them.
2. Fix every typed refusal at its earliest producer.
3. If the direction needs walking, build the articulated PART_RIG walk producer (alternating-plant IK, swing arcs, hip weight shift) with
   `PlantedFootStable` on two unlike rigs.
