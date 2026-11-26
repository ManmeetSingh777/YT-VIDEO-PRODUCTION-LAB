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
| F03/D01 | `tools/tbo/e01_action_coverage.mjs --rev P3_2` (current) / `--rev P3_1` (history) | (generated P08_ACTION_COVERAGE_P3_2.json, P08_ACTION_COVERAGE.json) |

## 2. Not implemented / remaining gaps (never claimed)
- **E04** per-pixel host depth/matte compositing: `BLOCKED_IMPLEMENTATION`. Band-level host compositing (P06) is the only route.
- **A01** has no single film-level union-of-frames obligation ledger; proof is per primitive/command.
- **C05** has no separate readable-attention-window gate.
- **C04** pupil-in-mask still uses a bbox.
- **D03** the 2× source-resolution policy is reported, not gated.
- **C06** needs the real packet and art (`BLOCKED_EXTERNAL_INPUT`).
- **F06** is a reviewed PR, not a merge.
- **CAPTION_OVERLAY** (raised by P3.2 issue 7): the engine has no caption compositor and no caption-lane QA. Captions exist only as
  SRT/VTT sidecars. This is not in the P08 requirement set; it is recorded, not built.

## 3. Frozen source and the one comprehensive regression
- **Frozen SHA:** `ef0a722e4442e8d7424c9b5e286b5073979745a5`, run in a detached worktree on C: (`run.sh` in `final_run/`).
  - Node v22.20.0.
  - `nu.js` sha256 `773baf91…793e7be` (unchanged).
  - Fresh content-addressed chunk cache for this run only: 14 keys, 20.5 GB, not committed.
- **Run:** 2026-11-26 13:26:02Z → 15:55:03Z.
  - **Suite:** 367 tests, **365 pass, 2 fail** (87.5 min, concurrency 3).
  - **Follow-ons:** Chrome negatives exit 0, render negatives exit 0, production chain exit 0.
  - **Chain:** S07 5/5, S08 3/3. S09 is BLOCKED 4/5 by design, because a DIAGNOSTIC run's film review can never be satisfied (same as P07).
- **Evidence:** `engineering/p08/final_run/` (TAP, RUN.txt, logs, chain JSON, `HASHES.txt`; videos and the cache excluded).
- **P08 is therefore not fully release-qualified at `ef0a722`.** This mirrors the P07 disposition. The rows tied to the two failures are
  `BLOCKED_IMPLEMENTATION` for that SHA:
  - E03 (`host_perspective`);
  - D03 and F05, whose whole-file evidence includes `p05_film`.

## 4. The two failures: cause and correction (`5314269`, after the freeze)
| Test | Cause | Class | Correction |
|---|---|---|---|
| E03 perspective host | `path.relative` across Windows drives returns an **absolute** path, not `..`. The "passes must live under the asset root" check only tested for a `..` prefix. On E: the test's passes (OS temp on C:) were wrongly accepted. On C: the same layout was correctly refused. | **Real engine bug** (a containment bypass) + test placement | Containment now rejects absolute relatives and `../` climbs. The test places its passes under the asset root (`isolatedWork(name, {under})`) and adds a negative with passes on another drive. |
| P05-R1 resume | The test counted every `.mkv` under `render/chunks/`, including the F02 input-keyed store `by_input/` (a verified copy), so one render counted as 2. | Stale test assumption (F02 interaction) | The test counts rendered chunks only. The reuse assertions (mtime, task events, `verifyRun`) are unchanged. |

- **Targeted re-test on E:** 2/2 pass. On E: the new E03 negative is a real cross-drive case.
- **Gap:** no second comprehensive regression has been run on `5314269`. That is Manmeet's decision (see §9).
- **The results generator had its own gap,** now fixed: whole-file evidence (`prefix ""`) counted neither passes nor failures. It now
  matches TAP titles against the titles declared in the file, so P05-R1 correctly marks D03/F05.

## 5. Requirement results (`P08_REQUIREMENT_RESULTS.json`, from the executed TAP at `ef0a722`)
- **38 rows:**
  - 29 `CODE_VERIFIED_AWAITING_REAL_INPUT`
  - 3 `VERIFIED_CODE` (B09, D06, F04)
  - 1 `BLOCKED_EXTERNAL_INPUT` (C06)
  - 4 `BLOCKED_IMPLEMENTATION`: E04 not built; E03, D03 and F05 failed at the frozen SHA and are fixed after it
  - 1 `NEEDS_HUMAN` (F06)
- **Companion files:** `P08_CAPABILITY_MATRIX.json`, `P08_ART_CONTRACT_DELTA.json`, `P08_NEGATIVE_EVIDENCE.json`,
  `BASELINE_AND_PRODUCER_MAP.json`, `E01_SPEECH_PREFLIGHT_SUMMARY.json`.
- **Real E01 film seconds accepted:** 0. **Real art:** none. **Approvals recorded by Claude:** none.

## 6. Regression efficiency (P07 → P08, same machine, same three follow-ons)
| | P07 (`ecd0aa8`) | P08 (`ef0a722`) |
|---|---|---|
| Tests | 305 | 367 (+62) |
| Suite wall | 93.2 min | 87.5 min |
| Follow-ons | 59.3 min | 61.5 min |
| Total | 152.5 min | 149.0 min |
| Slowest test (P02-R03 600-frame stream) | 55.5 min | 41.9 min |
| B3-5 render negatives | 36.7 min | 26.1 min |
| P02-R23 S07 / S08 / S09 | 26.0 / 25.9 / 26.4 min | 19.2 / 18.6 / 21.9 min |

The suite has 20 % more tests and is faster in total. The saving comes from:
- input-keyed chunk reuse;
- a pixel-keyed cache that ignores review and approval fields;
- injected failures always bypassing the cache;
- per-process isolated work directories, so concurrency 3 is safe.

The cache is fresh per run and never shared between runs.

## 7. Creative source: P3.2 (supersedes P3.1 for packet reconciliation and ArtJobs)
- **Source:** `E01_PHASE1_MEASURED_P3_2_CREATIVE_PRODUCTION.zip` (sha256 `ecd05481…a0eeffc`).
  - The text and SVG sources are copied to `docs/the-better-one/episodes/E01/P3_2_MEASURED/original`.
  - Audio, stems, PNG reviews and upstream copies are not committed.
- **Status (from its manifest):** D1–D6 and the selected audio are approved; the revised previs is *proposed*.
  - Not approved: revised storyboard, **revised animatic**, final mix, formal packet, art.
  - Claude recorded no approval.
- **Verified byte-identical to P3.1:**
  - all 6 selected masters, the 3 stems and the dialogue preview;
  - `MEASURED_PHONE_TIMELINE.csv` and `MEASURED_WORD_TIMELINE.csv`.
  - So the C03 speech preflight (86/86 phones) still holds.
- **Action coverage** (`P08_ACTION_COVERAGE_P3_2.json`): 19 actions; 0 missing per-action engine producers; all `NEEDS_REAL_ART`.
  - **New A27 lead withdrawal [404,960)** decomposes provisionally into AIM + JOINT_ROTATE + WALK + ROOT_MOVE. Owed art: cropped-gait
    torso rhythm with planted path-target contacts while the feet are offscreen, and the settled hands-free pose to f959.
  - Phase-level rows: `CAPTION_OVERLAY` has **no engine producer** (P3.2 issue 7). `ALTERNATE_VIEW_FAMILIES` needs real art (issue 4).
- **P3.1 coverage** is kept as history. Its re-run output is byte-identical.
- **Unsigned artwork preparation** (`E01_GPT_ART_DESIGN_PREPARATION_ONLY_V1`) is preserved untouched.
  - Only the design requirements that P3.2 changes are affected: ART_M02–M06, ART_P01–P03, ART_L01/L02, ART_R01/R02, ART_ENV01,
    ART_CAM01, ART_BG01/02.
  - Updating them is creative-side work against `ART_REQUIREMENTS_PHASE1_P3_2.md`; no engine change is implied.

## 8. F06 consolidation (no blind merge)
- **Integration branch:** `integration/p08-f06-consolidation` (pushed, tip `df69bc1`) = `44412e0` + `origin/main` `587bfd8` +
  `origin/design/gpt-creative-production-contract-v1` `0c3096c`. No branch was deleted.
- **Conflict resolutions, each reviewed** (full table in `engineering/p08/F06_PR_BODY.md`):
  - README: both versions kept.
  - The three `docs/gpt-creative-control` docs take the design text. On this branch P05 commit `0576c9a` had corrupted them with a
    leading backtick on every line, and their content was otherwise identical.
  - The validator keeps this branch's strict superset.
  - The release-gates doc is added.
- **The PR is not opened yet:** the GitHub CLI is not installed on this machine. Open it from
  `https://github.com/ManmeetSingh777/YT-VIDEO-PRODUCTION-LAB/pull/new/integration/p08-f06-consolidation` with that body, and leave
  it unmerged pending review.

## 9. Open decisions for Manmeet
1. **Qualify P08:** authorize a second comprehensive regression on `5314269` (or the then-current tip). Alternatively, accept
   "P08 not fully qualified at `ef0a722`; fixes verified by targeted re-test" as was done for P07.
2. **CAPTION_OVERLAY:** build a caption compositor and lane QA (a new requirement), or keep captions as sidecars.
3. **Creative:** the P3.2 revised animatic approval (a separate session); the signed phase-1 packet; the design signatures.
