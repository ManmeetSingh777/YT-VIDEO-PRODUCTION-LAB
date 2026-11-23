# HYBRID_V2 P02 — final report (headings as required by the directive)

Every statement points to a file. "DIAGNOSTIC" means fixture rasters, a namespace-only simulated reviewer and a synthetic tone. None of it is art, approval or narration.

## LIVE_REPO_HEAD
- Branch `hv2-system-correction`, HEAD `b511e9333df61459082cb82ab90c73c400787b5f`, plus the uncommitted P02 working tree.
- The exact diff is in `AUDIT/DIFF.patch` and `SNAPSHOT/UNCOMMITTED_CHANGES_vs_HEAD.patch`.
- Nothing has been committed yet; the commit is offered at the end of the run.

## SOURCE_PACKAGE_STATUS
- `neutrino_2m_SOURCE_PACKAGE.zip` (sha256 `1c9f7ee1…5be100`) was extracted read-only.
- 191/191 files are byte-identical to `reference/neutrino_2m_SOURCE_PACKAGE/` (`BASELINE_AND_SOURCE_RECONCILIATION.md`).

## NEUTRINO_RUNTIME_STATUS
- `engine/runtime/nu.js` is preserved byte-identical (sha256 `773baf91…7be`, equal to the package's `source/assets/nu.js`).
- The production path uses nu.js for `NU.scene`/`S.at`/`S.set`/`S.done` (the GSAP clock). Every rendered frame asserts `window.__artbFrame === f`.
- nu.js's `S.k`, `S.camera`, `S.streaks`, `S.actor`, `S.show` and `mixPath` are REPLACED or DISCONNECTED (`NEUTRINO_ORIGINAL_VS_CURRENT_EXECUTION_MAP.md`).

## PRODUCTION_CHROME_RENDERER_STATUS
- `art_bridge_chrome_frames` (`engine/film/chrome_frames.mjs`) is registered and used. It produces native 1920×1080 RGB24 frames of registered layers through puppeteer-core 25.16.0 and Chrome 158.
- Four renderer/runtime defects were found **by the rehearsals and tests in this run** and repaired at the producer. Each has a reproducer.

| Row | Defect | Proof test |
|---|---|---|
| F099 | sub-frame blur times | P02-R07, RP10 |
| F107 | particles never painted | P02-R07 |
| F109 | false frozen frames from hidden rows | RP8 |
| F111 | shutter-blur rows never reached the DOM | P02-R07 |
| F112 | sub-frame times lost their shot/camera | RP10, P02-R01 |

## BOUNDED_MEMORY_600_FRAME_STATUS
- P02-R03 streams 600 consecutive Chrome frames into FFV1 segments, comparing 600-frame vs 200-frame chunks. The memory log is `hybrid_v2/work/p02/render/MEMORY_LOG.json` (see TEST_RESULTS for the final pass/fail).
- Rehearsal K: node RSS was 122–234 MB across 12 chunks of 600 frames.

## FULL_7200_DIAGNOSTIC_FILM_STATUS
- **Rehearsal K completed the full S00–S09 sequence** (`hybrid_v2/work/p02/rehearsal_K/…`, run `DIAG-20261122142022-e1cc63`, chain verified, 214 events).
  - S00–S08 committed, with all 9 handoffs re-verified.
  - S09: `final_media` verified; `film_review` is BLOCKED by design.
- `render/film.mp4` (sha256 `ed1b87eb…7f7d`):
  - H.264, 1920×1080, exactly 60/1, 7200 decoded frames, AAC 120 s.
  - 12 FFV1 segments, 0 frame defects.
  - The coverage gate passed on all 7200 hashed frames.
  - A fresh-session re-render of 27 boundary and seeded frames was identical.
- **Limits, stated plainly:**
  - (a) K was rendered before F111/F112. Its blur interval [420,480) therefore rendered **without** real shutter samples, and it sits on a held elbow (the shoulder still moves). Blur correctness is proven only by P02-R07/RP10 on Chrome pixels.
  - (b) K's receipts are bound to the code revision of that run. Under today's code they verify STALE (correct behaviour).
  - (c) Every frame of K traces to its sources **except one named gap**: the diagnostic world plate `rt_world_far` has no art-design record (`TRACE_*.json` blocker).
  - (d) K is diagnostic: fixture rasters, not art. Phases A–J are the earlier failing runs. Their recovered and verified ledgers are listed in `REHEARSAL_REPORT.md` and `RECOVERED_ORIGINAL_EVIDENCE/`.

## REAL_GPT_ARTWORK_STATUS
- **NONE.** No provider is configured, no paid call was made, and no ChatGPT image was imported. The canary plan is in `CANARY_PLAN_S02_1320_1920.json` / `CANARY_PLAN.md`.

## HUMAN_STORY_DIRECTION_ART_APPROVAL_STATUS
- **NONE.** No trust anchor is provisioned and no human approval exists.
- The production preflight for `films/hv2_film001` is fail-closed at every stage (`PRODUCTION_PREFLIGHT_hv2_film001.json`).

## MEASURED_NARRATION_STATUS
- **NONE.** There is no recording and no forced alignment. The rehearsals use a labelled synthetic tone.

## F001_F072_CLOSURE
- Computed from the executed TAP logs in `FAILURE_LEDGER_P02.json` / `TEST_RESULTS.md`.
- Rows that need real art, human review or narration stay `IMPLEMENTED_UNQUALIFIED`. No row is reclassified green by hand.

## NEW_FAILURE_CLASSES_F073_PLUS
- F073–F092 are the directive's classes.
- F093–F112 were **discovered and repaired during this run**. Each has a reproducer, a negative test and, where meaningful, an unlike-transfer test (`tests/p02/ledger_rows_p02.mjs`).
- F105 (portal plates through intake) is repaired. See the ledger for status.

## P02_TESTS
- Final results are in `TEST_RESULTS.md`, generated from these logs in order:
  1. `p02_tap.txt` (the full regression);
  2. `p02_tap_rerun_failed.txt`;
  3. `p02_tap_final_code.txt` (every suite affected by the last fixes, rerun on the final code).
- A later log's outcome for the same test supersedes an earlier one, and every supersession is listed in the ledger.
- Partial logs of stopped runs are kept as `*_STOPPED_*`.

## INDEPENDENT_ZIP_REPLAY
- See `REPLAY.md`. The result of `tests/p02/replay_audit.mjs` on the exported ZIP is written to `REPLAY_RESULT.json` when run. For the result of this run's verification, see the closing message.

## PRODUCTION_LEDGER_STATUS
- Hash-chained, HEAD-anchored, store-mirrored, fenced, with legacy history in a separate unverified stream.
- Tamper and concurrency tests: P02-R15a–d and F085.
- Replay counts a task as complete only when its outputs resolve.

## FRAME_TO_SOURCE_TRACE_STATUS
- `traceFrame` covers: output frame hash → shot score → semantic actions → rig state → asset bytes, provenance, approval and registration → design decisions with F-source hashes → story, direction, narration and handoffs. A missing ancestor yields an exact named blocker.
- Gap: the world plate has no design record (diagnostic fixture).

## HUMAN_APPROVAL_AUTHENTICATION_STATUS
- Signed envelopes against external anchors. Typed TTY approvals, forgeries, replays, wrong scope, stale, expired, revoked approvals and in-repo keys all fail (P02-R16).
- No real anchor exists.

## QA_AND_LEARNING_EVIDENCE_AUTHENTICATION_STATUS
- Shot QA is re-executed, and shot reviews and unlike transfer require receipts over the re-executed evidence (B3-7).
- Rule qualification requires an evidence chain (L05).
- Both stay unqualified without real art.

## PAID_PROVIDER_IDEMPOTENCY_AND_BUDGET_STATUS
- Requests are prepared before send. OUTCOME_UNKNOWN halts. Duplicate workers send once. A signed paid-run manifest bounds jobs, ceiling and retries (P02-R19, P02-F089).
- No paid call was made.

## P02_ADDITIONAL_TESTS_R13_R27
- See `TEST_RESULTS.md` (computed).

## EXTERNAL_GPT_ART_HANDOFF_STATUS
- `export-gpt-job` / `import-gpt-candidates` / `select-candidate` are implemented. Provenance is OPERATOR-ATTESTED and is never upgraded. Counterfeit `--provenance` is refused (P02-R26).
- No real ChatGPT image has been imported.

## REAL_PROVIDER_CAPABILITY_STATUS
- Every capability is DECLARED or UNTESTED. No canary was run, because a canary would be paid (P02-R27).

## PRODUCTION_READY
**NO.**

## AUDIT_ZIP_PATH
`E:\MOTION_NATIVE_STUDIO_V1\audit_outbox\HYBRID_V2_P02_REPAIR_AUDIT.zip`

Source snapshot: `E:\MOTION_NATIVE_STUDIO_V1\exports\HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT.zip`

## NEXT_HUMAN_ACTION
1. Independent audit of both ZIPs.
2. Provision reviewer trust anchors **outside** the repository.
3. Approve, or revise, the story and experience direction of `films/hv2_film001`.
4. Choose the art route for the 10-second canary (S02 frames 1320–1920, 52 assets; `CANARY_PLAN.md`):
   - ChatGPT operator handoff: no API spend.
   - API: sign a bounded paid-run manifest after replacing the assumed per-image price with the provider's published one.
5. Resolve the three unplanned art demands that block the canary: the grip-closure hand, the pinch-closure hand, and the laundromat world plate.
