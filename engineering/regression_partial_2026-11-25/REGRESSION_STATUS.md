# Regression status: PARTIAL (both runs stopped on the user's order). NOT a completed qualification.

The user stopped both runs on 2026-11-25 at about 20:41Z ("IMPORTANT PRIORITY CORRECTION"). Machine time now goes to P06.
**Neither suite PASSED.** The passing tests below are partial evidence only.

| Run | Source SHA (detached worktree) | Started (UTC) | Stopped (UTC) | Tests finished | ok | not ok | Last test started |
|---|---|---|---|---|---|---|---|
| Frozen P05 baseline | `6d91a6016438a5570e862562bdb706070d972b7f` (`C:\Users\gmanm\TBO_REGRESSION`) | 18:55:05 | ~20:41 | 182 of ~275 | 182 | 0 | P02-R06 negatives (frozen moving interval …) |
| Engineering dev | `7f7ad7ce8e05ec6743983f9396df2d4ecb5b76b3` (`C:\Users\gmanm\TBO_DEV_REGRESSION`) | 18:57:28 | ~20:41 | 182 of ~279 | 182 | 0 | same |

Command (both runs): `node --test --test-reporter=tap --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs tests/p04/*.test.mjs tests/p05/*.test.mjs` (the dev run adds `tests/tbo/*.test.mjs`).
Node v22.20.0. stderr was empty for both runs.

**Covered:** all of `tests/art_bridge` and the P02 tests up to R06.
**Not run:** the rest of P02 (including the R23 S07–S09 Chrome chain), P03, P04, P05 and, in the dev run, tests/tbo.
The tbo tests did pass earlier when run individually: decoder 4, host 1, hybrid 3, gates 3.

Files kept here:
- `frozen_PARTIAL.tap`, sha256 `bb0159c0990f56cffac8615ef4b2b3c6fe51f360d017f8753f8c8b7856462499`
- `dev_PARTIAL.tap`, sha256 `fbed433a36acd6cff30c82ac8cf5922204bbcc302c9633d0f724de848b7d0dbf`
- `*_run.txt`, `*_stderr.txt`

Both worktrees are kept as they are. Their only modified paths are four tracked outputs that the tests rewrite
(`films/hv2_film001/intake/DEPENDENT_JOB_STATUS.json`, `INTAKE_LOG.jsonl`, `story/FILM_CONTRACT_REPORT.json`, `hybrid_v2/work/p02/injection/INJECTION_SUMMARY.json`).
After the stop, no test node, headless Chrome or ffmpeg process was left running.

The frozen baseline worktree at `6d91a60` stays available for a later targeted comparison. Per the user's instruction, no new full baseline run is planned
unless a specific regression needs diagnosis. The one comprehensive regression will run once, on the stable P06 source SHA.

The earlier E: run (`E:\TBO_FIRST_FILM`, `INCOMPLETE_DISK_FULL_regression.tap`) is also invalid as a qualification: it hit ENOSPC.
