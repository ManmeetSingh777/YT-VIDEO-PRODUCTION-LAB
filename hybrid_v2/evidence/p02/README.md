# HYBRID_V2_P02_REPAIR_AUDIT — how to read this package

1. `AUDIT/FINAL_REPORT.md` gives the directive's final headings, each with its measured status.
2. `AUDIT/OPEN_ITEMS.md` lists everything unresolved: the external blocks and the residual software limits.
3. `AUDIT/TEST_RESULTS.md` is generated from the executed TAP log (`hybrid_v2/work/audit_logs/p02_tap.txt`). It contains the computed F001–F106 ledger (`AUDIT/FAILURE_LEDGER_P02.json`).
4. `AUDIT/REHEARSAL_REPORT.md` is generated from the rehearsal phase transcripts under `hybrid_v2/work/p02/rehearsal/evidence/`:
   - A: the first natural failure, plus `why`.
   - B: after the generic repair.
   - C: resume refused on a changed producer (stale handoffs).
   - D: the sub-frame blur failure.
   - F: a stopped run.
   - G: the final full run.
   It also includes the intentional failure injected at every stage.
5. Supporting documents:
   - `AUDIT/THREAT_MODEL.md`
   - `AUDIT/BASELINE_AND_SOURCE_RECONCILIATION.md`
   - `AUDIT/DEPENDENCY_CONTRACT.md`
   - `AUDIT/REPLAY.md`
   - `AUDIT/REVISION_DEPENDENCIES.json`
   - `AUDIT/PRODUCTION_PREFLIGHT_hv2_film001.json` (the real, read-only preflight)
   - `AUDIT/FILE_CHANGE_MAP.txt`
   - `AUDIT/DIFF.patch`
   - `AUDIT/INTEGRITY_MANIFEST.json`

Everything labelled DIAGNOSTIC (the rehearsal film, fixture rasters, the simulated reviewer, the synthetic tone) proves mechanics only. **PRODUCTION_READY: NO.**
