# HYBRID_V2_SYSTEM_CORRECTION_AUDIT — read me first

Scope: execution of `inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md` (C0–C8) on the live repository. Exact revision: `AUDIT/REVISION.txt`.

**Truth statement.** ZERO real GPT images, ZERO human art/motion/story/film reviews, NO approved story, NO recorded narration, NO real film.
Every image/frame in this package is DIAGNOSTIC (fixture rasters, a flat diagnostic renderer, provider TEST STUB). TEST_TRUSTED receipts
exist only in temporary diagnostic fixtures and are refused by production gates. `engine/runtime/nu.js` is byte-identical to the baseline.
The studio is NOT qualified. Rows needing real art stay `IMPLEMENTED_UNQUALIFIED` in `AUDIT/FAILURE_LEDGER.json` (status computed from the TAP log).

## Start here
1. `AUDIT/ROOT_CAUSE_REPAIR_MATRIX.md` — reproduction → root producer → generalized repair → proof → unlike transfer; conflicts found.
2. `AUDIT/FAILURE_LEDGER.json` — F001–F072, computed status, producers (with production call sites), proof/transfer tests.
3. `AUDIT/TEST_COMMANDS_AND_RESULTS.md` — every suite, command, exit code, counts; raw TAP in `hybrid_v2/work/audit_logs/`.
4. `hybrid_v2/evidence/system_correction/BEFORE/P02_REPRODUCTION.json` — the 12 directive defects reproduced on the live code BEFORE repair.
5. `AUDIT/INDEPENDENT_TRACE.json` — fail-open scan, provider-submission module closure, receipt writers.
6. `AUDIT/OPEN_DEPENDENCIES.md` — external blockers and the one open software defect.

## Reproduce (repo root)
```
node --test tests/art_bridge/*.test.mjs                       # all suites (film suites encode diagnostic MP4s: ~20 min)
node tests/art_bridge/c0_reproduce_p02.mjs AFTER              # the same 12 probes on the repaired code
node tests/art_bridge/stage2_proofs.mjs                       # Chrome browser proofs (diagnostic rasters)
node engine/tools/build_failure_ledger.mjs hybrid_v2/work/audit_logs/node_test_tap.txt
node engine/tools/audit_trace.mjs
node tests/art_bridge/system_correction_evidence.mjs
node engine/tools/art_outbox.mjs check-design --film films/hv2_film001 --asset ines_master
python engine/tools/build_system_correction_audit.py
```

## Stop condition
Stops at the human/provider boundary. Next action: author the typed story contract and add the missing S02 operations, then a human story +
direction review (`art_outbox.mjs review-story|review-direction --human`). No bulk art; no 120-s production before a real-art + unlike transfer gate passes.
