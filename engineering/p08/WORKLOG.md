# P08 work log (session continuity; facts only)

## Fixed points
- Repo `E:\TBO_DEV`, branch `production/better-one-first-film-engineering`. P07 frozen `ecd0aa8` (304/305, S3C-7), evidence commit `693660c` pushed.
- Do NOT touch `C:\Users\gmanm\TBO_DEV_REGRESSION` (P07 evidence worktree) or `C:\Users\gmanm\TBO_P07_FINAL`.
- P08 package: `engineering/p08/package/` (contract sha `6609d8cf…` = matrix contract_sha256).
- E01 creative source for P08: **P3.1** `E:\TBO_PRIVATE\E01_PHASE1_MEASURED_P3_1_STORYBOARD.zip` (sha `9f2aeca1…`). Supersedes P3. A04 transfer f296 (contact 284, valid 295,
  R clear 306, L clear 320); report contact 350, valid 360, prior 367, driver 368, lead clear 380; cuts 444/588; privacy 807, raise 825, aim 882,
  shutter 900, f959 outgoing. Audio: user-approved selected takes (USER_STATEMENT_RECORD_NOT_ENGINE_SIGNATURE). Storyboard/animatic/digest NOT approved.
  A separate session makes the rough animatic — do not repeat creative prep, never fabricate animatic approval.
- No paid calls; private witnesses/audio/ZIPs never committed; nu.js unchanged; one comprehensive regression on the final frozen P08 SHA only.

## Done
- S3C-7 correction `fb01ca4`: evaluation identity (engine/art_bridge/evaluation_identity.mjs, EVALUATION_RULESET.lock.json, tools evaluation_ruleset.mjs),
  tests/p08/evaluation_identity.test.mjs EID-1..7 pass; affected suites 87/87 + 119/119.
  Rule-source edits (art_contract.mjs, pregen_audit.mjs, method_applicability.mjs, art_families.mjs, witness_regions.mjs, pregen schema, F_SOURCE)
  need `node engine/tools/evaluation_ruleset.mjs bump --version P08.0 --reason ... --amend` (current unfrozen version P08.0).
- BASELINE_AND_PRODUCER_MAP.json (tools/tbo/p08_baseline_map.mjs).

## Plan / status (update as rows land)
See P08_REQUIREMENT_RESULTS.json (generated at the end from executed tests). Order: composition contract (A01/A03 + addendum) → A02 → B01/B02 → B03 →
C02/C03/C04 → E01/E07 → F01/A04 → D01 → B04–B08 → C01/C05 → E02/E05/E06 → E03/E04 → F02–F06; regression-efficiency profiling before freeze.
- B01 `8b6e50a` (tests/p08/prop_authority.test.mjs 7/7, Chrome owner pixels). A02 `5b41357` (tests/p08/contact_continuity.test.mjs 5/5).
  A02 open item: "held object while speech/face turns" combination → covered later by the face-capable P08 character fixture (composition tests).
- C02/C03/C04 `f21dfab`: engine/art_bridge/speech_visemes.mjs (SPEECH_ALIGNMENT v1, EN_ARPABET_VISEME_V1), speak VISEME route, EXPRESSION_TRANSITION v1,
  face_composition + FaceComposition verifier, performance_command schema v1.1.0. Fixture tests/p08/character_fixture.mjs (kade tall / pim short bipeds,
  legs+hands+composed face, 80 s real intake). tests/p08/face_speech.test.mjs 6/6. Real P3.1 phones: 86/86 absolute samples identical (scratch check).
  Fixture lessons: part pivot landmark must lie on painted pixels; grip drawing must cover the wrist pivot (radius in MASTER px = 2× canonical).
- Next: tools/tbo/e01_speech_preflight.mjs (private input, commit summary only) → composition contract A01/A03 + addendum → E01 freeze/A04/F01 → E07 → B02/B03 → B04 …
- A01/A03+addendum `470a676`: engine/art_bridge/composition.mjs (COMPOSITION_CONTRACT v1.0.0, writeSet), engine/film/composition_qa.mjs; tests/p08/composition.test.mjs 6/6
  (combo 4 "mechanism + model graphic" still TODO with E06). E01 speech preflight tool + summary committed (private detail in E:\TBO_PRIVATE\E01_SPEECH_PREFLIGHT).
- E01/A04/F01 `b48699c`: plan.time_remaps in temporal; engine/film/phase_boundary.mjs; engine/film/phase_audio.mjs; tests/p08/phase_freeze_audio.test.mjs 6/6.
  Note: owner pixel identity must be measured as raw bytes over the owner's region (colour-key matching is ambiguous across owners).
- Next: E07 photo polygon → B02 palm-orientation IK → B03 PINCH → B04 walk → B05/B06/B07/B08 → C01/C05/C06 → D01–D06 → E02/E05/E06(+combo4)/E03/E04 → F02–F06 → regression efficiency → freeze.
- E07 `0f9ff33` (engine/film/photo_intent.mjs, tests/p08/photo_intent.test.mjs 2/2); composition refuses overlapping composed primary writers.
- B02 `08b25de` (orientation solved in solveConstraints; CONTACT_BASIS_REQUIRED for PRODUCTION; ONE_OBJECT_PER_SOCKET; tests/p08/contact_orientation.test.mjs 3/3; P07-N2 migrated).
- B03 `e03f414` (engine/art_bridge/pinch.mjs, plan.pinch_contracts, verifyPinch; fixture hands split near thumb / far fingers; tests/p08/pinch.test.mjs 3/3; P07-P1 migrated).
  Regression subset 200/200 at e03f414.
- Next: B04 walk → B05 seams → B06 → B07 carry/load/insert → B08 support/collision → C01/C05/C06 → D01–D06 → E02/E05/E06(+combo4)/E03/E04 → F02–F06 → efficiency → freeze.
- B04 `dcca5aa`: WALK composition primitive (+ contact target_path in temporal), gait QA (dynamic support envelope); composition QA now fails on owner
  solver failures (COMP directions corrected: kade seat drop 100, pim 45). tests/p08/walk.test.mjs 3/3. Subset 194/194.
- Remaining: B05 seams, B06 reach/point/turn/hold, B07 carry/load/insert, B08 support/collision, C01/C05/C06, D01–D06, E02/E05/E06(+combo4)/E03/E04,
  F02–F06, regression efficiency (profile 4 files), freeze + one regression, reports (P08_REQUIREMENT_RESULTS etc.), F06 reconciliation.
- B07 `4d5d462` (CARRY/LOAD_CONTAINER/INSERT_TOKEN composition kinds; fixture box prop), B05/B08 `10f1984` (engine/film/integrity_qa.mjs),
  F03/D01 `3ee4c0a` (P3.1 text sources in docs/.../P3_1_MEASURED/original; tools/tbo/e01_p31_action_coverage.mjs → P08_ACTION_COVERAGE.json: 18 actions,
  0 missing producers), E02 + chunk cache `8d4f289` (plan.grades in scene_graph; TBO_RENDER_CHUNK_CACHE in segment_render).
- Efficiency profile (from P07 TAP): p02_injection S07-frozen/S08/S09 ~26 min each (full 7200-frame diagnostic chain per copy), p02_render R03 55.5 + R04 13.5,
  p02_trace R13 27, p01_film_qa B3-5 36.7 + B3-1 24.1. Cache measurement (S08+S09 with cache) running in background task bs0pxh2xl.
- Remaining: E03/E04 (Blender 5.1 present — perspective + depth), E05 dolly/orbit, E06 + combo4, C01/C05/C06, B06, D02–D06, F02/F04/F05/F06, freeze + regression, reports.
- E05 `3f88faa` (camera_ops DOLLY/ORBIT), combo4 `1c91928` (gear train + MODEL_BAR), F02 `c27d99d` (chunkInputKey selective reuse, by_input store).
- Chunk cache measurement: S08 17.1 min (P07 25.9) and S09 5.6 min but S09 FAILED with raw 'write EOF' — cause: **E: drive 100% full (517 MB free)**;
  p02 injection writes 7200-frame FFV1 chunks under E:\TBO_DEV\hybrid_v2\work. Cache dir C:\Users\gmanm\AppData\Local\Temp\tbo-test-runs\chunk_cache_measure_1 (7.1 GB, mine).
  Final regression must run in the C: worktree (C:\Users\gmanm\TBO_DEV_REGRESSION, 168 GB free) like P07.
- E03 `(this commit)`: projectCamera PERSP + Blender PERSP; tests/p08/host_perspective.test.mjs (real Blender). E04 per-pixel depth/matte compositing NOT implemented (BLOCKED_IMPLEMENTATION).
- Freed 7.3 GB on E: by removing my own measurement scratch (hybrid_v2/work/p02/injection/s08_mp4, s09_audio). E: is still 97% full → final regression on C:.
- Fresh worktrees lack the gitignored F01–F80 witness images (117 files under reference/construct-kurzgesagt-art/assets) → copy them locally
  (git ls-files --others --ignored --exclude-standard reference/) into any regression worktree; never commit them.
- Final regression script: C:\Users\gmanm\TBO_P08_FINAL\run.sh (worktree C:\Users\gmanm\TBO_P08_REGRESSION at the frozen SHA; fresh chunk cache).
- Report tools: tools/tbo/p08_results.mjs --tap <TAP> --sha <sha> → P08_REQUIREMENT_RESULTS / CAPABILITY_MATRIX / ART_CONTRACT_DELTA / NEGATIVE_EVIDENCE.
- F06: our head contains mia-first-film + 3 repair branches; missing only main (README, 3 commits) and design/gpt-creative-production-contract-v1
  (8 doc files under docs/gpt-creative-control) → integration branch + one PR after publication (no merge).

## 2026-11-26 — regression executed, failures corrected, P3.2 intake
- The frozen ef0a722 regression gave 365/367 and all three follow-ons exited 0 (evidence: `final_run/`).
  - E03 failed on a real engine containment bug across drives.
  - P05-R1 failed on a stale chunk count (it counted the F02 store).
  - Both are fixed in 5314269; the targeted re-test is 2/2. No second comprehensive run: that decision is Manmeet's.
- `p08_results.mjs` now attributes whole-file evidence by declared test titles.
- P3.2 is now the creative source (text/SVG in `docs/.../P3_2_MEASURED/original`).
  - Coverage: 19 actions incl. A27, 0 missing per-action producers.
  - CAPTION_OVERLAY has no engine producer (recorded).
  - P3.2 audio and timelines are byte-identical to P3.1. The revised animatic is NOT approved.
