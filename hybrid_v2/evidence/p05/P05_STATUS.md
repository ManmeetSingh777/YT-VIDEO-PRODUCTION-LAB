# P05 status — stopped on request before the final proof runs (24 Nov 2026)

**ENGINEERING_READY = NO.** The code below is committed and its targeted tests passed. The full regression, a complete S00–S09 chain and the final set of Chrome negatives have NOT been completed on the last code commit. Nothing here is real GPT artwork, human approval or recorded narration.

- Branch: `repair/p05-creative-packet-integration` (from P04 evidence commit `7722bf1aff152f4fc09c6706fff436f0d79f264a`). `main` was not touched. Nothing was force-pushed.
- Last code commit: `945464697dc680956bea670e543c8e0c7beebf1b`. The commit that adds this file changes only `hybrid_v2/evidence/p05/`.
- `engine/runtime/nu.js` is byte-identical (sha256 `773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be`).

| P05 commit | Content |
|---|---|
| `19f7b9d` | variable film length, packet v1.1 validator/adapter/preflight, art-first stage order, packet authority |
| `0576c9a` | packet integrated into S00–S09, geometry measured from art, linked mechanisms, united shadows, transitions across the cut, obligations, post-art feedback |
| `cdfdff1` | transition nesting and geometry gate, isolated owner capture, viewer visibility, story refusal codes, vector ingest command, separate statuses, operator workflow, README matrix builder |
| `cacf5f5` | the camera is judged on its world, not on transition plates covering its first frame |
| `9454646` | resume continues its own run; reused chunks complete their tasks; a failure names its own chunk |

## P04, as asked

Code `4433dcec2aa301e91832e1d3a122d03627152db5`, evidence `7722bf1aff152f4fc09c6706fff436f0d79f264a`: 248/248 regression; chain S00–S08 committed and S09 4/5; 7/7 Chrome negatives; reproducer 14 of 15 before, 0 of 15 after; ledger 154 rows (93 closed on diagnostics, 60 waiting for real art/human/narration, 1 without an automated proof). Its own answer is also ENGINEERING_READY = NO (`hybrid_v2/evidence/p04/12_FINAL_ENGINEERING_READINESS.md`).

## What was executed in P05, and on which commit

| Run | Commit | Result |
|---|---|---|
| `tests/p05/p05_packet.test.mjs` | tree of `cdfdff1` | 14/14 |
| `tests/p05/p05_film.test.mjs` E1–E10, with `tests/p03/p03_capabilities.test.mjs` | tree just before `cdfdff1` | 29/29 |
| P05-E1, E7, E9, E11, E12 | tree of `cdfdff1` | 5/5 |
| P05-E9, E11, E12 (E12 now also covers the camera fix) | tree of `cacf5f5` | 3/3 |
| P05-R1 (resume) | tree of `9454646` | passes |
| `p02_portal`, `p02_repairs`, `stage1`, `transition_render`, `p04_closure` | tree of `cdfdff1` | 61/61 |
| `p04_closure`, `p04_authority` | before `cdfdff1` | 38/38 |
| `p04_demand_handoff`, `story_mechanism_truth`, `p0_audit`, `p05_packet` | before `cdfdff1` | 35/35 |
| 600-frame chain, 91 handoff exchanges | `0576c9a` | S00–S07 committed. **S08 blocked**: the isolated capture of the creature's body was hidden by a painted near plane (F171). Looking at the frames also showed the portal plates stacked the wrong way (F169). |
| 600-frame chain, 91 handoff exchanges | `cdfdff1` | S00–S07 committed, frames inspected, portal correct. **S08 blocked**: the camera push was judged on transition plates (F173). |
| 600-frame chain | `cacf5f5` | stopped by the computer sleeping (10:16–14:11): typed `RENDER_CAPTURE_FAILURE` at frame 388, 2 verified chunks kept. Resuming it exposed F174 and F175. |
| 600-frame chain | `9454646` | stopped by the computer sleeping again (about 15:02–22:40) at frame 20. S00–S06 committed. The resume was running and was stopped on request. |
| packet Chrome negatives | `0576c9a` | 5 of 7 run, all 5 detected with clean controls; 2 not run; not repeated on later commits |
| full regression | `cdfdff1`, `cacf5f5`, `9454646` | started several times, never finished (stopped for a fix, a sleep, or on request). The three partial logs kept (16 tests each) contain no failing test. **There is no complete result.** |

## Defects found and repaired in P05

Rows F155–F175 in `tests/p04/build_failure_ledger.mjs`. The five that only appeared by running and looking: inner transition plates painted on top of the outer one and outside its aperture (F169) with no gate for it (F170); "isolated" owner captures that still contained painted near planes (F171); an owner nobody can see passing because it moved in isolation (F172); the camera judged on transition plates (F173). Found by the two sleeps: a resumed run had no plan and default chunking (F174), and reused chunks completed no task, so a resumed render stage could never commit (F175).

## Not done

1. Full regression on `9454646` (about 90 minutes; keep the computer awake).
2. One complete chain S00–S09 on `9454646`, then a resume of it to S09 (S09 `film_review` stays blocked in a diagnostic run by design).
3. All 7 packet Chrome negatives and the 7 P03 Chrome negatives on `9454646`, and `tests/p04/reproduce_p04.mjs`.
4. `FAILURE_LEDGER.json` and `README_COMPLIANCE.*` from the final TAP: builders are committed, outputs do not exist yet. No README row is claimed as verified here.
5. HANDOFF.md was not updated.

Commands, from a clean checkout of `9454646` with the local source witnesses under `reference/construct-kurzgesagt-art/assets`:

```
node --test --test-reporter=tap --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs tests/p04/*.test.mjs tests/p05/*.test.mjs > FINAL.tap
node tests/p05/run_packet_chain.mjs --out hybrid_v2/evidence/p05/chain
node tests/p05/run_packet_negatives.mjs --out hybrid_v2/evidence/p05/render_negatives
node tests/p03/run_clips.mjs --only negatives --out hybrid_v2/evidence/p05/render_negatives_p03
node tests/p04/reproduce_p04.mjs . hybrid_v2/evidence/p05/REPRODUCED_AFTER_REPAIR.json
node tests/p04/build_failure_ledger.mjs --tap FINAL.tap --out hybrid_v2/evidence/p05/FAILURE_LEDGER.json
node tests/p05/build_readme_matrix.mjs --tap FINAL.tap --out hybrid_v2/evidence/p05
```

## Known limits, whatever those runs say

No interpenetration solver (collision, slide, pinch and hinge contacts are refused before art); LOAD_CONTAINER, INSERT_TOKEN and CARRY refused (no executed visual measure); camera ORBIT and DOLLY_3D refused; mouth drawings are rest/mid/open; per-method F01–F80 causality cannot be shown without real pictures. In the diagnostic film 33 drawings go through the real staged handoff (91 exchanges); 15 drawings (machines, worlds, plates, token) are ingested directly because the borrowed diagnostic designs do not fit them.

External, pending: NEEDS_GPT_CREATIVE_PACKET, NEEDS_GPT_ARTWORK, NEEDS_HUMAN_APPROVAL, NEEDS_RECORDED_VOICE, NEEDS_FINAL_ARTISTIC_REVIEW.

Operator workflow for a new approved 600-frame package: `docs/gpt-creative-control/OPERATOR_WORKFLOW.md`.

## Changed expectations in older tests

`p03_capabilities` F4 (per-piece shadow opacity became one group); `story_mechanism_truth` (animatic needs an explicit length); `p04_demand_handoff` accepts ART_JOB_INPUT_MISSING; `p05_film` E5 expects AUDIO_INPUT_MISSING for an unrecorded voice; the packet fixture's portal mask was moved to the shared anchor (the new gate refuses the old position).

## Evidence in this folder

- `superseded_0576c9a/`, `superseded_cdfdff1/`, `superseded_cacf5f5/`: earlier runs, kept, not proof of the final commit.
- `crash_recovery/`: both interrupted chains and the resume that failed before F174.
- `frames/`: frames inspected. `c0`, `c1`, `c2` are from the `0576c9a` chain (c2 shows the wrong portal); `sheet_cdfdff1.png` is the 12-frame sheet of the `cdfdff1` chain.
- `logs/`: raw run logs, including three incomplete regression logs. `p05_ft.log` is an earlier run in which E5 failed because its expectation predated the AUDIO_INPUT_MISSING code; it was corrected before `cdfdff1`. Files that test runs rewrite under `films/` and `hybrid_v2/work/` in the frozen checkout are in two local git stashes, not pushed.

## Every file changed since P04 (`7722bf1`) by the P05 code commits

```
 docs/gpt-creative-control/CLAUDE_INTEGRATION_DIRECTIVE.md |  107 +++++
 docs/gpt-creative-control/NEW_CHAT_CREATIVE_DIRECTOR.md   |   87 ++++
 docs/gpt-creative-control/OPERATOR_WORKFLOW.md            |   74 ++++
 docs/gpt-creative-control/README.md                       |   42 ++
 docs/gpt-creative-control/creative_packet.schema.json     |  697 +++++++++++++++++++++++++++++++
 docs/gpt-creative-control/examples/invalid_synthetic.json |  158 +++++++
 docs/gpt-creative-control/examples/valid_synthetic.json   |  158 +++++++
 docs/gpt-creative-control/validate_creative_packet.py     |  123 ++++++
 engine/art_bridge/art_contract.mjs                        |    7 +-
 engine/art_bridge/art_intake.mjs                          |   51 ++-
 engine/art_bridge/errors.mjs                              |    2 +
 engine/art_bridge/framing.mjs                             |   13 +
 engine/art_bridge/gpt_handoff.mjs                         |    7 +-
 engine/art_bridge/registration.mjs                        |    2 +
 engine/art_bridge/review_requests.mjs                     |    2 +
 engine/art_bridge/scene_graph.mjs                         |   15 +-
 engine/art_bridge/temporal.mjs                            |   16 +-
 engine/art_bridge/transitions.mjs                         |   12 +
 engine/film/chrome_frames.mjs                             |   31 +-
 engine/film/coverage_gate.mjs                             |    5 +-
 engine/film/film_revision.mjs                             |    4 +-
 engine/film/segment_render.mjs                            |   14 +-
 engine/film/semantic_qa.mjs                               |    2 +
 engine/production/post_art_feedback.mjs                   |   50 +++
 engine/production/production_ir.mjs                       |    4 +-
 engine/production/stages.mjs                              |   44 +-
 engine/story/action_coverage.mjs                          |    2 +-
 engine/story/creative_adapter.mjs                         |  107 +++++
 engine/story/creative_packet.mjs                          |   87 ++++
 engine/story/creative_preflight.mjs                       |   44 ++
 engine/story/direction_consequence.mjs                    |    4 +-
 engine/story/narration.mjs                                |    3 +-
 engine/tools/art_bridge_film_qa.mjs                       |   16 +-
 engine/tools/art_bridge_qa.mjs                            |    2 +-
 engine/tools/art_outbox.mjs                               |    4 +-
 engine/tools/compile_film_contracts.mjs                   |    2 +-
 engine/tools/creative_handoff.mjs                         |   24 ++
 engine/tools/production_run.mjs                           |   13 +-
 schemas/creative_packet_v1_1.schema.json                  | 2129 +++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
 schemas/motion_art_manifest_v2.schema.json                |   10 +-
 tests/art_bridge/story_mechanism_truth.test.mjs           |    4 +-
 tests/p03/p03_capabilities.test.mjs                       |    2 +-
 tests/p04/build_failure_ledger.mjs                        |   23 +-
 tests/p04/p04_demand_handoff.test.mjs                     |    2 +-
 tests/p05/build_readme_matrix.mjs                         |  106 +++++
 tests/p05/p05_film.test.mjs                               |   71 ++++
 tests/p05/p05_packet.test.mjs                             |   70 ++++
 tests/p05/packet_film.mjs                                 |   61 +++
 tests/p05/packet_fixture.mjs                              |   79 ++++
 tests/p05/run_packet_chain.mjs                            |   13 +
 tests/p05/run_packet_negatives.mjs                        |   11 +
 51 files changed, 4529 insertions(+), 87 deletions(-)

A	docs/gpt-creative-control/CLAUDE_INTEGRATION_DIRECTIVE.md
A	docs/gpt-creative-control/NEW_CHAT_CREATIVE_DIRECTOR.md
A	docs/gpt-creative-control/OPERATOR_WORKFLOW.md
A	docs/gpt-creative-control/README.md
A	docs/gpt-creative-control/creative_packet.schema.json
A	docs/gpt-creative-control/examples/invalid_synthetic.json
A	docs/gpt-creative-control/examples/valid_synthetic.json
A	docs/gpt-creative-control/validate_creative_packet.py
M	engine/art_bridge/art_contract.mjs
M	engine/art_bridge/art_intake.mjs
M	engine/art_bridge/errors.mjs
M	engine/art_bridge/framing.mjs
M	engine/art_bridge/gpt_handoff.mjs
M	engine/art_bridge/registration.mjs
M	engine/art_bridge/review_requests.mjs
M	engine/art_bridge/scene_graph.mjs
M	engine/art_bridge/temporal.mjs
M	engine/art_bridge/transitions.mjs
M	engine/film/chrome_frames.mjs
M	engine/film/coverage_gate.mjs
M	engine/film/film_revision.mjs
M	engine/film/segment_render.mjs
M	engine/film/semantic_qa.mjs
A	engine/production/post_art_feedback.mjs
M	engine/production/production_ir.mjs
M	engine/production/stages.mjs
M	engine/story/action_coverage.mjs
A	engine/story/creative_adapter.mjs
A	engine/story/creative_packet.mjs
A	engine/story/creative_preflight.mjs
M	engine/story/direction_consequence.mjs
M	engine/story/narration.mjs
M	engine/tools/art_bridge_film_qa.mjs
M	engine/tools/art_bridge_qa.mjs
M	engine/tools/art_outbox.mjs
M	engine/tools/compile_film_contracts.mjs
A	engine/tools/creative_handoff.mjs
M	engine/tools/production_run.mjs
A	schemas/creative_packet_v1_1.schema.json
M	schemas/motion_art_manifest_v2.schema.json
M	tests/art_bridge/story_mechanism_truth.test.mjs
M	tests/p03/p03_capabilities.test.mjs
M	tests/p04/build_failure_ledger.mjs
M	tests/p04/p04_demand_handoff.test.mjs
A	tests/p05/build_readme_matrix.mjs
A	tests/p05/p05_film.test.mjs
A	tests/p05/p05_packet.test.mjs
A	tests/p05/packet_film.mjs
A	tests/p05/packet_fixture.mjs
A	tests/p05/run_packet_chain.mjs
A	tests/p05/run_packet_negatives.mjs
```

## Every file in this evidence folder

```
./P05_STATUS.md
./crash_recovery/RESUME_REPORT_BEFORE_F174.json
./crash_recovery/chain_interrupted_by_sleep/CHAIN_REPORT.json
./crash_recovery/chain_interrupted_by_sleep/HANDOFF_EXCHANGES.json
./crash_recovery/chain_interrupted_by_sleep/POST_ART_FEASIBILITY.json
./crash_recovery/chain_interrupted_by_sleep/STATUS_BOARD.json
./crash_recovery/chain_interrupted_by_sleep_2/CHAIN_REPORT.json
./crash_recovery/chain_interrupted_by_sleep_2/HANDOFF_EXCHANGES.json
./crash_recovery/chain_interrupted_by_sleep_2/POST_ART_FEASIBILITY.json
./crash_recovery/chain_interrupted_by_sleep_2/STATUS_BOARD.json
./frames/c0.png
./frames/c1.png
./frames/c2.png
./frames/sheet_cdfdff1.png
./logs/INCOMPLETE_regression.tap.txt
./logs/INCOMPLETE_regression4.tap.txt
./logs/INCOMPLETE_regression5.tap.txt
./logs/p05_chain.log
./logs/p05_chain2.log
./logs/p05_chain3.log
./logs/p05_chain4.log
./logs/p05_ft.log
./logs/p05_neg3.log
./logs/p05_q.log
./logs/p05_q2.log
./logs/p05_q3.log
./logs/p05_q4.log
./logs/p05_q5.log
./logs/p05_resume.log
./logs/p05_resume2.log
./superseded_0576c9a/chain/CHAIN_REPORT.json
./superseded_0576c9a/chain/COVERAGE_GATE.json
./superseded_0576c9a/chain/HANDOFF_EXCHANGES.json
./superseded_0576c9a/chain/POST_ART_FEASIBILITY.json
./superseded_0576c9a/chain/STATUS_BOARD.json
./superseded_0576c9a/render_negatives/NEGATIVES.json
./superseded_cacf5f5/chain_stopped/HANDOFF_EXCHANGES.json
./superseded_cacf5f5/chain_stopped/POST_ART_FEASIBILITY.json
./superseded_cacf5f5/chain_stopped/STATUS_BOARD.json
./superseded_cdfdff1/chain/CHAIN_REPORT.json
./superseded_cdfdff1/chain/COVERAGE_GATE.json
./superseded_cdfdff1/chain/HANDOFF_EXCHANGES.json
./superseded_cdfdff1/chain/POST_ART_FEASIBILITY.json
./superseded_cdfdff1/chain/STATUS_BOARD.json
./P05_STATUS.md
```
