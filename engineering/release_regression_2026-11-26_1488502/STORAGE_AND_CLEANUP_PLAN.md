# Storage after release regression 1488502: inventory, classification, cleanup plan (nothing deleted)

The user is freeing space manually. The size scans were stopped on request, so some sizes below are **not measured** and are marked that way.
Nothing has been deleted.

## Free space (2026-11-27)
| Drive | Free | Used |
|---|---|---|
| C: | 1.8 GB | 1,664.8 GB |
| D: | 58.2 GB | 101.9 GB |
| E: | 7.6 GB | 230.6 GB |
| F: | 12.7 GB | 225.5 GB |
| G: | 18.0 GB | 219.4 GB |

## Inventory
"Regenerable" means the bytes are produced by running tests from committed source. "Evidence" means a committed copy was found by sha256.

| Path | Size | What it is | Still required? | Safe to regenerate / remove? |
|---|---|---|---|---|
| `C:\Users\gmanm\TBO_REL1_REGRESSION\hybrid_v2\work` | **71 GiB** (p01 57, p02 14) | Test outputs of the failed 1488502 run. p01 `film_qa` holds 11 copies of one film, each carrying the same 5.4 GB FFV1 segments; p02 `injection` holds full 7200-frame renders. | No | **Disposable.** The TAP and logs are committed (`engineering/release_regression_2026-11-26_1488502`). The P02-R04 investigation can regenerate what it needs. |
| `C:\Users\gmanm\TBO_REL1_FINAL\chunk_cache` | **20.5 GB** (12 keys) | Content-addressed render cache of that run. It is fresh per run, so the next run never reuses it. | No | **Disposable.** |
| `C:\Users\gmanm\TBO_REL1_FINAL` (rest) | <20 MB | TAP, RUN.txt, logs, stage outputs | Committed copy | Keep until the user decides; the evidence is in the repo. |
| `C:\Users\gmanm\TBO_REL1_REGRESSION` (worktree) | not measured beyond `work` | Detached worktree at `1488502` (pushed on `origin/integration/p08-f06-consolidation`). Only the 4 generated files tests rewrite are modified. | Reusable for the P02-R04 targeted run | Keep the worktree and remove only `hybrid_v2/work`. |
| `C:\Users\gmanm\TBO_P08_REGRESSION` | not measured | Frozen `ef0a722` worktree (the accepted 365/367 run). The commit is on pushed branches. | No (TAP committed: `engineering/p08/final_run`) | Its `hybrid_v2/work` is regenerable. Remove the worktree with `git worktree remove` only if you no longer want the frozen checkout. |
| `C:\Users\gmanm\TBO_REGRESSION`, `TBO_DEV_REGRESSION` | not measured | Older detached worktrees (`6d91a60`, `ecd0aa8`; both pushed) | No (TAPs committed: `engineering/regression_partial_2026-11-25`) | Regenerable. |
| `C:\Users\gmanm\TBO_P06_FINAL`, `TBO_P07_FINAL`, `TBO_P08_FINAL`, `*_OUT` | not measured (TAP/log folders) | Earlier final-run outputs | TAPs committed (`engineering/p06`, `p07/final_run`, `p08/final_run`) | Removable. Small. |
| `C:\Users\gmanm\TBO_P06_AFFECTED`, `TBO_P07_affected*.tap`, `TBO_P08_MEASURE_*.txt` | small | Targeted-run TAPs and measurements | **Not found in the repo** | **Keep** (or commit first). |
| `C:\Users\gmanm\TBO_F06` | not measured | Worktree of the unmerged integration branch `integration/p08-f06-consolidation` (clean, in sync with origin) | **Yes** | **Keep.** |
| `C:\Users\gmanm\TBO_PRIVATE_TOOLS\E01_AUDIO` | not measured | Private E01 audio / native witnesses | **Yes: private, never committed** | **Keep. Do not delete.** |
| `%TEMP%\tbo-test-runs` | not measured (scan stopped) | `isolatedWork` outputs of every earlier test run on C:, never cleaned | No | Disposable. The new runner keeps test temp under its OUT folder and removes it after the suite. |
| `C:\MOTION_NATIVE_STUDIO_V1_EVIDENCE_OFFLOAD` | **28.5 GB** | Offloaded P02-R23 injection copies from the original repo (`build_source_snapshot.py` calls them "regenerated test" copies) | Referenced as offloaded evidence by old audit packages | **Ask before removing.** It is evidence-shaped; check that no audit ZIP relies on it. |
| `E:\MOTION_NATIVE_STUDIO_V1\hybrid_v2\work` | **90.6 GB** | Test and rehearsal work dirs of the ORIGINAL repo (Hybrid V2 / P02 era) | Partly. Committed evidence lives in `hybrid_v2/evidence` and `audit_outbox`, not in `work` | Mostly regenerable. **Review per subfolder:** rehearsal films referenced by tests (`p02/rehearsal_*`) are rebuilt on demand. |
| `E:\TBO_DEV\hybrid_v2\work` | 0.6 GB | Current dev outputs | Includes `p02/rehearsal_K` used by tests | Keep. |
| `E:\TBO_PRIVATE` | 0.24 GB | Private handoff ZIPs (accepted `1f05905f…` ZIP) | **Yes** | **Keep.** |
| `E:\TBO_DEV\films`, `E:\MOTION_NATIVE_STUDIO_V1\films` | 75 MB / 146 MB | Film sources, intake and approvals | **Yes** | **Keep.** |
| `E:\TBO_DEV\E01_PHASE1_MEASURED_P3_2_CREATIVE_PRODUCTION*.zip` | small | Existing creative source packages (not the returned packet) | **Yes** | **Keep.** |

## Safe cleanup plan (for the user, in order)
1. **Remove first; disposable, about 91 GB on C::** `TBO_REL1_REGRESSION\hybrid_v2\work` and `TBO_REL1_FINAL\chunk_cache`. Keep the worktree itself.
2. Remove `%TEMP%\tbo-test-runs`.
3. Optionally remove the `hybrid_v2\work` folders of the older worktrees (`TBO_P08_REGRESSION`, `TBO_REGRESSION`, `TBO_DEV_REGRESSION`). Use `git worktree remove` for a whole worktree.
4. Decide separately: `C:\MOTION_NATIVE_STUDIO_V1_EVIDENCE_OFFLOAD` (28.5 GB) and `E:\MOTION_NATIVE_STUDIO_V1\hybrid_v2\work` (90.6 GB).
5. **Never:** `TBO_F06`, `TBO_PRIVATE_TOOLS`, `E:\TBO_PRIVATE`, `films/`, `audit_outbox/`, `hybrid_v2/evidence`, `engineering/`, the creative source ZIPs, or the P06/P07 targeted TAPs that are not in the repo.

## What the next run needs
`node tools/tbo/release_regression.mjs --worktree W --out O --preflight-only` prints the requirement. Today, on the worktree's volume, it needs about
**121 GB** for a full suite: the 1488502 lower-bound peak of 90.1 GiB × 1.25, plus an 8 GB stop floor.

That estimate predates segment hard-linking and post-assertion reclaim, so the true peak should be lower. The runner records the real peak (`--record-history`), and later estimates use it.

Put the out folder and the cache on the same volume as the worktree. Segments are then hard-linked rather than copied.
