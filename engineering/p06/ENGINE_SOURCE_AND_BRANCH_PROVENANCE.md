# Engine source and branch provenance (P06 §7)

## Branches and SHAs
| What | SHA | Notes |
|---|---|---|
| Spec branch `origin/production/better-one-mia-first-film` | `53c7d39` | Adds the P06 directive + `PERFORMANCE_COMMAND_SCHEMA_V1.json` to `6d91a60`. Docs only: `git diff 6d91a60 53c7d39 -- engine schemas tests` is empty. |
| P05 code baseline | `945464697dc680956bea670e543c8e0c7beebf1b` | Byte-identical engine to `6d91a60`. |
| Engineering branch `production/better-one-first-film-engineering` | child of `6d91a60` | Holds the pre-P06 decoder/host/hybrid/gates work (`6a0e1de`…`6c9201e`) and the partial-regression record (`e1dcfc4`). `23b56e2` is a clean `--no-ff` merge of `53c7d39` (no conflicts; no engine file replaced). |
| **P06 frozen engineering source** | **`b2c6931a628f68773349dc2565d7aae5530ad41d`** | The code the one comprehensive regression ran on (`FINAL_ENGINEERING_TAP.tap`). |
| `engine/runtime/nu.js` | sha256 `773baf91…db793e7be` | Unchanged on every branch. |

About "`hv2-system-correction` / `6c9201e`" in the P06 text: `hv2-system-correction` is the branch of the older local repo
`E:\MOTION_NATIVE_STUDIO_V1` (no remote, untouched). `6c9201e` is a commit of the engineering branch above, made in worktree `E:\TBO_DEV`. Both
were inspected; nothing was reset, cleaned or force-pushed, and `main` was not used.

## The two earlier full regressions: PARTIAL, not passed
On the user's instruction, both were stopped at about 20:41Z on 2026-11-25, after 182/182 ok each (frozen `6d91a60`; dev `7f7ad7c`). Neither is a
qualification. Logs, hashes and counts are in `engineering/regression_partial_2026-11-25/REGRESSION_STATUS.md`. No test process was left running.

## Directly affected checks during P06 (before the freeze)
- New P06/TBO tests: 21/21 pass, including real Blender 5.1.2 (Cycles) and real Chrome.
- Existing suites that exercise the changed consumers (acting, temporal aim/additive, schema validator, art demand, stages):
  `art_ancestry_and_registration`, `motion_phrase`, `repair_transfer`, `transition_render`, `p02_portal`, `p02_repairs`, `p03_capabilities`,
  `p04_closure`, `p04_demand_handoff`, `p05_packet`, `tbo/*`. The first run was **111/112**: P03 B1 (blink) failed, caused by an edit of mine to
  `acting.mjs`, where a `//` comment swallowed two statements. Diagnosis: the same test passed on pre-P06 `7f7ad7c`. It was fixed at the source,
  and the rerun was **113/113**.

## Environment
Node v22.20.0 · Chrome via puppeteer-core · FFmpeg · Blender 5.1.2. Long runs on drive C: (E: has ~8.6 GB free). Cost: $0 (no paid API/GPU/image call).
