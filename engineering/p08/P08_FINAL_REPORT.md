# P08: permanent motion and hybrid production closure (engineering report)

**Status:** engineering work package executed against the actual P07 source. Real E01 film seconds accepted: **0**. Real artwork: **none**.
No approvals were recorded, no images were generated, no paid call was made, nothing was signed. Every P08 producer below is
`CODE_VERIFIED_AWAITING_REAL_INPUT` on DIAGNOSTIC fixtures unless the row says otherwise (`P08_REQUIREMENT_RESULTS.json`).

## 0. Entry: P07 disposition and the S3C-7 correction
- **P07 was not fully release-qualified.**
  - The frozen source `ecd0aa8` ran 304/305, and the three follow-on steps passed.
  - The evidence is committed unchanged in `engineering/p07/final_run/` (commit `693660c`).
  - P07 was **not** re-run as a standalone baseline; the single P08 comprehensive regression covers the corrected behaviour.
- **S3C-7 cause.** An outbox record's identity covered its inputs but not the checking rules. When the P07 audit rule changed the verdict
  for unchanged inputs, the write-once store refused the overwrite.
- **Fix (`fb01ca4`).** The evaluation identity is now inputs + the gate's import-closure code hash + schemas + policy + an explicit ruleset
  version.
  - Historical records are kept byte-for-byte.
  - Identical identity with a different body is `EVALUATION_NONDETERMINISM`.
  - Design approvals bind the ruleset version.
  - An old generation is `STALE_DEPENDENCY`.
  - The outbox is safe under concurrent exports, and mutable test output is isolated per run.
  - Tests: `tests/p08/evaluation_identity.test.mjs` EID-1..7. EID-1 reproduces the exact P06 record id.

## 1. What was built (commits on `production/better-one-first-film-engineering`)
(see §9 for the frozen SHA and the regression)

| Req | Producer → consumer (real path) | Test file |
|---|---|---|
| A01/A03 + addendum | `composition.mjs` (COMPOSITION_CONTRACT v1: JOINT_ROTATE, ROOT_MOVE, OSCILLATE, AIM, STATE_SWAP, PLANT, REACH, CAMERA_MOVE, WALK, CARRY, LOAD_CONTAINER, INSERT_TOKEN) → same plan surfaces → `stateAtFrame` → `composeShot` → Chrome; `writeSet`; `composition_qa.mjs` | composition, combo_mechanism_model |
| A02 | `contact_continuity.mjs` (one contact id across actions/cuts; per-shot visibility) | contact_continuity |
| A04 | `phase_boundary.mjs` (sealed outgoing bundle; successor verification) | phase_freeze_audio |
| B01 | `temporal.mjs` ACTOR / OBJECT / SURFACE / FREE authority with baked transfer frames | prop_authority |
| B02 | palm basis **solved** by the IK; oriented production contacts | contact_orientation |
| B03 | `pinch.mjs` (FACE_ON near/far layers, EDGE_ON opposed faces) | pinch |
| B04 | WALK primitive + path-target contacts; dynamic support QA | walk |
| B05/B08 | `integrity_qa.mjs` (seams on registered alpha; support intents; collisions) | integrity |
| B07 | CARRY / LOAD_CONTAINER / INSERT_TOKEN on B01 + paint order | carry_load_insert |
| C02/C03/C04 | `speech_visemes.mjs` VISEME route; EXPRESSION_TRANSITION; face_composition | face_speech |
| E01 | `plan.time_remaps` (owner-group freeze / remap) | phase_freeze_audio |
| E02 | `plan.grades` (linear-light Rec.709, per owner) | selective_grade |
| E03 | perspective host camera through real Blender 5.1 | host_perspective |
| E05 | `camera_ops` DOLLY / ORBIT (per-band pinhole) | camera_ops |
| E07 | `photo_intent.mjs` | photo_intent |
| F01 | `phase_audio.mjs` (800 samples/frame; split = continuous) | phase_freeze_audio |
| F02 | input-keyed chunk reuse + pixel-keyed cache | selective_invalidation |
| F03/D01 | `tools/tbo/e01_p31_action_coverage.mjs` | (generated P08_ACTION_COVERAGE.json) |

## 2. Not implemented / remaining gaps (never claimed)
- **E04** per-pixel host depth/matte compositing: `BLOCKED_IMPLEMENTATION`. Band-level host compositing (P06) is the only route.
- **A01** has no single film-level union-of-frames obligation ledger; proof is per primitive/command.
- **C05** has no separate readable-attention-window gate.
- **C04** pupil-in-mask still uses a bbox.
- **D03** the 2× source-resolution policy is reported, not gated.
- **C06** needs the real packet and art (`BLOCKED_EXTERNAL_INPUT`).
- **F06** is a reviewed PR, not a merge.

## 3–9. (filled from the executed regression and the generated matrices)
