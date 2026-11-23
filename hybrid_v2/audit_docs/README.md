# HYBRID V2 audit package — read me first

**This package = the P0.1 re-audit corrections + the Stage 3 two-way art-to-motion contract.** Start with
`hybrid_v2/evidence/P01_AND_STAGE3_CONTRACT_REPORT.md`, then `hybrid_v2/evidence/stage3_contract/` (root causes, failing-before/passing-after logs, Ines gate
reports, request delivery, diagnostic rig-fit receipt) and `hybrid_v2/evidence/p01/` (P0.1 before-runs, `P01_EVIDENCE.json`, transformed-pixel images).
Re-audit input: `inputs/HYBRID_V2_P0_INDEPENDENT_REAUDIT.md`. Diff since the re-audited revision: `AUDIT/DIFF_SINCE_REAUDITED_c0eed40.patch`.

Previous round (P0 correction), kept as evidence: start with `hybrid_v2/evidence/p0/P0_REPAIR_REPORT.md` (P0 table, walkthrough,
remaining blocks), `hybrid_v2/evidence/p0/P0_REPRODUCTION_BEFORE.txt` (9/9 failing before repair), `P0_TESTS_AFTER.txt` (10/10 after),
`ROUNDTRIP_EVIDENCE.json` and `hybrid_v2/evidence/p0/roundtrip/*.png` (real PNG import, registration, receipts, Chrome render, invalidation;
DIAGNOSTIC rasters only). Round-trip working films: `hybrid_v2/work/p0/`. The sections below describe the overall Hybrid V2 state.

Repository: MOTION_NATIVE_STUDIO_V1. Exact revision and diff: `AUDIT/REVISION.txt`, `AUDIT/SOURCE_DIFF.patch`, `AUDIT/SOURCE_DIFF_STAT.txt`.
Every file's sha256 is in `AUDIT/INTEGRITY_MANIFEST.json`. This package contains **actual code and outputs**; the documents only index them.

## Truth statement
- **Not production-qualified.** No film has been rendered. No GPT/provider image exists. No story is approved. No narration is recorded.
- Every rendered frame in this package uses **DIAGNOSTIC_FIXTURE** rasters (flat hatched test shapes with colour markers). They prove mechanics (registration, FK/IK, contacts, occlusion, states, camera, transitions, determinism). They are **not** target art and say nothing about artistic quality.
- `engine/runtime/nu.js` is byte-identical to the baseline (`AUDIT/RUNTIME_PRESERVATION.txt`).

## Stage status (computed from executed evidence)
| Stage | Status | Evidence |
|---|---|---|
| 1 Manifest V2 contracts | MECHANICAL_PASS (45/45 tests; 5 example manifests pass/fail as named) | `hybrid_v2/evidence/STAGE_1_CONTRACT_PROOF.json`, `AUDIT logs: hybrid_v2/work/audit_logs/node_test_tap.txt, stage1_examples.log` |
| 2 Execution capabilities | MECHANICAL_PASS on fixtures for all 10 acceptance proofs + registration + 60-fps witness; criteria naming *real approved art* are ARTISTIC_BLOCKED | `hybrid_v2/evidence/STAGE_2_MOTION_PROOF.json`; frames `hybrid_v2/evidence/stage2/frames/`, raw `hybrid_v2/work/stage2/`; MP4 `hybrid_v2/work/stage2/scene_A_60fps.mp4` |
| 3 GPT art production | BLOCKED (no provider; story approval pending). Mechanical: compile/witness/causal proofs pass | `hybrid_v2/evidence/STAGE_3_ART_PROOF.json`, `hybrid_v2/art_outbox/` |
| 4 Film | BLOCKED (story, art, narration) — proposal + production graph + qualification staging proven without art | `hybrid_v2/evidence/STAGE_4_FILM_PROOF.json`, `films/hv2_film001/` |

## Where to look
- **Numerical measurements:** each proof in `STAGE_2_MOTION_PROOF.json` has `output` (per-frame predicted vs rendered marker centroids, contact errors, pixel diffs, sentinel/blank counts, anchor residuals, ffprobe). Key numbers: rest-pose pixel identity (opaque/alpha exact, partial ≤0.84/255); rotation marker error ≤0.21 px; chain markers ≤0.27 px; grip ≤2.1e-7 px over 390 locked frames; plant ≤5.1e-13 px; cel swaps 0 px numeric / ≤0.53 px rendered; elbow seam 0 vs 119 px without underpaint; face anchors ≤0.33 px with switches exactly at 200/400; camera footprint 0 errors and 0 blank px (negative: frames 212–386, 84 240 blank px); portal anchor 0 numeric / ≤0.58 px rendered; random seek 11/11 byte-identical; gear ratio exact, marker angle ≤0.06°.
- **Negative matrix (§7.5):** `hybrid_v2/evidence/NEGATIVE_PROOF_MATRIX.json` — 13 PASS, 2 PARTIAL, 0 FAIL.
- **F01–F80:** `hybrid_v2/evidence/COVERAGE_F01_F80.json` — 48 IMAGE_AUTHORSHIP methods `PENDING_PROVIDER_PIXELS`; 16 engine methods `CONSUMER_PROVED_MECHANICALLY` (per-method perturbations); 16 explicitly not proved with reasons (no density consumer, no projection enforcement, pending repair, pending art, pending story approval, proof pending).
- **Registration:** `engine/art_bridge/registration.mjs`; proof S2-REG with receipt/overlay/difference under `hybrid_v2/work/stage2/../reg` → copied to `hybrid_v2/evidence/stage2/frames/S2-REG/`.
- **ArtJobs:** `engine/art_bridge/art_requests.mjs`; outbox `hybrid_v2/art_outbox/` (74 jobs, 6 canonical masters compiled by the installed skill with 2 verified native witnesses each; `INSTRUCTIONS_FOR_IMAGE_PRODUCTION.md`).
- **Provider capability + blocker:** `engine/art_bridge/providers/image_provider.mjs`; report in `STAGE_3_ART_PROOF.json → provider_discovery` and `OUTBOX_INDEX.json → provider`.
- **Known gaps / unimplemented:** `AUDIT/KNOWN_GAPS_AND_BLOCKERS.md`, `hybrid_v2/evidence/OPEN_DEPENDENCIES.json`.
- **Reproduce:** `AUDIT/REPRODUCE.md`. Toolchain: `AUDIT/DEPENDENCIES.md`.
- **Architecture map:** `hybrid_v2/evidence/IMPLEMENTATION_DIFF_MAP.md`.
