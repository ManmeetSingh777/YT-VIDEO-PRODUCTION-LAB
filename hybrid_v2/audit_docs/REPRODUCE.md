# Reproduce (from the extracted package root or the repository root)

Toolchain: see `DEPENDENCIES.md`. All commands run from the repository root; nothing needs network access.

```bash
# 0. fixtures (deterministic; regenerates identical PNG hashes)
node tests/art_bridge/make_fixtures.mjs
node tests/art_bridge/stage2_fixtures.mjs

# 1. unit/contract tests (expect: 75 pass, 0 fail) — includes P0 (p0_audit), P0.1 (p01_reaudit, p01_film_qa) and Stage 3 contract (stage3_contract) tests
node --test tests/art_bridge/*.test.mjs

# 2. Stage 1 example manifests (expect: 2 PASS exit 0; 3 FAIL exit 1 with UNREACHABLE_IK / MISSING_UNDERPAINT / INVALID_MORPH_TOPOLOGY)
node engine/tools/art_bridge_check.mjs check --root tests/art_bridge/fixtures --manifest ../../../schemas/examples/valid_human_grip.json --inspect
node engine/tools/art_bridge_check.mjs check --root tests/art_bridge/fixtures --manifest ../../../schemas/examples/invalid_unreachable_contact.json --inspect

# 3. Stage 2 rendered proofs (Chrome; ~2–3 min; writes STAGE_2_MOTION_PROOF.json, frames, MP4)
node tests/art_bridge/stage2_proofs.mjs            # or a subset: P1 P2 ... P10 REG MP4

# 4. Stage 1 proof file, Stage 3 proofs, film check/QA, fixture QA, F01–F80, Stage 4 + matrix (this order)
node tests/art_bridge/write_stage1_proof.mjs
node engine/tools/art_outbox.mjs export --film films/hv2_film001
node tests/art_bridge/stage3_proofs.mjs
node engine/tools/art_bridge_check.mjs check --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --json films/hv2_film001/qa/manifest_v2_report.json   # exit 1 (art missing)
node engine/tools/art_bridge_qa.mjs qa --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --scene S02 --plan films/hv2_film001/handoff/MOTION_PLAN_S02.json --out films/hv2_film001/qa/hybrid_v2   # exit 1; motion_feasibility FEASIBLE_EXCEPT_DIRECTION_GAPS
node engine/tools/art_bridge_qa.mjs qa --root tests/art_bridge/fixtures --manifest stage2/scene_A.manifest.json --scene shotA --plan tests/art_bridge/fixtures/stage2/scene_A.plan.json --out hybrid_v2/work/qa_fixture_sceneA_production   # exit 1: production gates fail on fixtures (mechanical gate true)
node tests/art_bridge/write_method_trace.mjs
node tests/art_bridge/write_stage4_and_dependencies.mjs

# 4b. P0 round trip + evidence (real PNG import, registration, receipts, render, invalidation; DIAGNOSTIC rasters)
node tests/art_bridge/p0_roundtrip_evidence.mjs
# QA gates: production gate (exit 1 on fixtures) vs explicit mechanical diagnosis (exit 0)
node engine/tools/art_bridge_qa.mjs qa --root tests/art_bridge/fixtures --manifest stage2/scene_A.manifest.json --scene shotA --plan tests/art_bridge/fixtures/stage2/scene_A.plan.json --out hybrid_v2/work/qa_fixture_sceneA --mechanical-only

# 4c. P0.1 transformed-pixel evidence and Stage 3 contract evidence
node tests/art_bridge/p01_evidence.mjs
node tests/art_bridge/stage3_contract_evidence.mjs
node engine/tools/art_outbox.mjs check-design --film films/hv2_film001 --asset ines_master   # gate PASS, design_approval BLOCKED_ON_DESIGN_APPROVAL

# 5. rebuild the proposed film graph / designs (deterministic)
node films/hv2_film001/handoff/build_production_graph.mjs
node films/hv2_film001/art_designs/build_designs.mjs

# 6. rebuild this package
python engine/tools/build_hybrid_v2_audit.py   # AUDIT_NAME=HYBRID_V2_P01_CORRECTION_AUDIT writes audit_outbox/HYBRID_V2_P01_CORRECTION_AUDIT.zip
```

Environment variables (optional): `CHROME_PATH` (default `C:/Program Files/Google/Chrome/Application/chrome.exe`), `PUPPETEER_CORE_PATH` (else the npx cache is searched), `PYTHON`.
Expected-variance notes: frame PNG bytes are deterministic for one Chrome build; timestamps in proof JSON differ per run; `tested_revision` records the git HEAD at run time.
Raw logs from the packaged run: `hybrid_v2/work/audit_logs/*.log`, `node_test_tap.txt`, `REVISION_AT_TEST.txt`.
