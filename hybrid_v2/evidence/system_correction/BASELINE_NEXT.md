# BASELINE_NEXT — system-correction run

- Baseline HEAD before this directive: `9a2a9ad` (branch master); work branch `hv2-system-correction` at `4da33a2aafc81a7c52085602b00d587a49548639`
- Dirty files at baseline: only the two new inputs (directive + Exhaustive Frame Analysis.json), untracked; preserved.
- node v22.20.0; ffmpeg ffmpeg version 7.1-essentials_build-www.gyan.dev Copyright (c) 2000-2024 the FFmpeg developers; python Python 3.14.6

## File hashes
- `engine/runtime/nu.js` 773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be
- `CLAUDE.md` fc553784d6a0012626ea0f0a3a31b11810f4f7af5017230da808816970a706cd
- `HANDOFF.md` f2adaa80ec2f43e69aa9dc2ba766a8ddc59ff97216cf7a541c8243f498d0753a
- `engine/methods/source/F_SOURCE.json` 1e37eaedaaade1b10c8450a0a0a916b79154de3e0ed75a2279c0f4ca804f0179
- `inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md` d193ebda1186363fd529be3a5e894237f12d48628ae6adc9edd01e8f298d5905
- `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md` a2d705ecc3ca1cd3e615e3ae388867872e80d1aae101d874901c43709eacdf41
- `inputs/EXPERIENCE_DIRECTOR_V1.md` c8c6652f5337f517f814d35c8b54360cea5fcc9f258c4607a4f8361dd70ad68d
- `reference/construct-kurzgesagt-art/scripts/prepare_first_pass.py` e33cd1f8dfbc61135b1cd25269c11e5ebb04a5b63120ac7b5b5afc21c54eb990
- `reference/construct-kurzgesagt-art/scripts/compile_art_job.py` 83be834da72efc02a82ac5c072305e699fc14de964b9284fe17dee97f82eddef

## Test classification (directive D.2)
- `art_ancestry_and_registration.test.mjs`: UNIT
- `film_revision_and_qa.test.mjs`: FULL_FILM (synthetic diagnostic) + UNIT
- `full_contact_solver.test.mjs`: UNIT
- `motion_phrase.test.mjs`: UNIT
- `p01_film_qa.test.mjs`: FULL_FILM (synthetic diagnostic) + UNIT
- `p01_reaudit.test.mjs`: UNIT + DIAGNOSTIC_IMAGE + BROWSER_MOTION + PROVIDER_STUB
- `p0_audit.test.mjs`: UNIT + DIAGNOSTIC_IMAGE + BROWSER_MOTION + PROVIDER_STUB
- `repair_transfer.test.mjs`: UNIT
- `semantic_action_coverage.test.mjs`: UNIT
- `shot_continuity.test.mjs`: UNIT
- `source_method_causality.test.mjs`: UNIT
- `stage1.test.mjs`: UNIT
- `stage2.test.mjs`: UNIT + DIAGNOSTIC_IMAGE
- `stage3_contract.test.mjs`: UNIT + PROVIDER_STUB
- `story_mechanism_truth.test.mjs`: UNIT
- `transition_render.test.mjs`: UNIT
- `universal_contract.test.mjs`: UNIT + PROVIDER_STUB
- `stage2_proofs.mjs`: BROWSER_MOTION (Chrome, diagnostic rasters)
- REAL_PROVIDER: none run (no credentials). HUMAN_REVIEW: none exist.

## Executed now vs archived
- TAP log: `hybrid_v2/work/audit_logs/node_test_tap.txt` (131 test results, 0 failing).
- C0 live reproduction (before any repair): `hybrid_v2/evidence/system_correction/BEFORE/P02_REPRODUCTION.json` (12/12 reproduced at 9a2a9ad).
