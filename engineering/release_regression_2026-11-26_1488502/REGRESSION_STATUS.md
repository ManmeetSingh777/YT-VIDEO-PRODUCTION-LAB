# Release regression on 1488502 (integration branch), 2026-11-26: NOT A QUALIFYING RESULT

**Run:**
- Worktree: `C:\Users\gmanm\TBO_REL1_REGRESSION`
- Revision: `148850222e8ff02aa93fd299d27cd39abc15b9ee`
- Node: v22.20.0
- nu.js sha256: `773baf91…`
- Time: 18:32Z → 20:49Z
- Runner: `run.sh`

| Part | Result |
|---|---|
| Test suite | **296 / 337 pass, 41 fail** (exit 1) |
| P03 Chrome negatives | exit 0: all 7 detected, every control ok |
| P05 render negatives | exit 0: all 7 detected, every control ok |
| P05 chain | exit 0: S00–S08 COMMITTED. S09 BLOCKED only by the DIAGNOSTIC `film_review`, which is BLOCKED by design. Ledger true, 890 frames, 91 handoffs |

## Why the suite failed: drive C: ran out of space
At the end of the run, C: had **2.0 GB free of 1.7 TB (100%)**. The space was taken by:
- the regression worktree's `hybrid_v2/work`: 71 GB (p01 57 GB, p02 14 GB);
- the chunk cache: 20 GB, 12 keys.

`FAILURE_CLASSIFICATION.json` lists each failure with its evidence:
- **40 are ENVIRONMENT_DISK_FULL.** Each has its own message: `ENOSPC`, "There is not enough space on the disk", or Blender `WinError 112`.
  - P02-R13, R14 and R08 share one before-hook. Its S07 run record (`FAIL-S07_NEUTRINO_RENDER-chunk_0_1200-7f2e89`) shows ENOSPC while copying a chunk.
  - 18 whole p08 test files failed at their fixture build, each with its own ENOSPC stack. They include the new A01, C04, C05, D03 and caption tests,
    so those tests did not run in this regression.
  - E04 `host_depth` failed because Blender hit `WinError 112`.
- **1 is PROBABLE_ENVIRONMENT_DISK_FULL: P02-R04.** Its final render failed with "encoder closed", meaning ffmpeg exited while writing to the full drive.
  - Its output carries no explicit ENOSPC, so this is not proven.
  - The same test passed in the frozen `ef0a722` run.

No failure shows an engine defect. However, **41 tests did not actually exercise their assertions**. This run therefore neither qualifies nor disqualifies `1488502`.

## To get a qualifying result
1. Free space on C:. The regression's own outputs can be regenerated:
   - `TBO_REL1_REGRESSION\hybrid_v2\work`
   - `TBO_REL1_FINAL\chunk_cache`
2. Re-run, either the whole suite or only the 41 failed tests. That choice is the user's.

Evidence copied here excludes media (mkv/mp4/png/wav) and the chunk cache.
