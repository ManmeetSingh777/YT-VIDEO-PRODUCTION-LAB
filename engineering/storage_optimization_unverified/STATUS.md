# Test storage optimization: UNVERIFIED, not in production

The edits are in `tests/art_bridge/p01_film_qa.test.mjs` and `tests/p02/p02_injection.test.mjs`. They hard-link the immutable FFV1 segments of each negative copy and
reclaim each copy after its assertions pass (only under `TBO_RECLAIM_WORK=1`).

| File | Result |
|---|---|
| p01_film_qa | **8/8 pass**, peak 8.8 GB (was 57 GB), `COMPLETE_PASS` |
| p02_injection | **10 of 12 passed**. The user stopped the run before S08 and S09 finished (`STOPPED.json`); those two tests are **not passed** |

Until p02 S08/S09 pass, this branch is not merged and is not used by production runs. The engine-side cache hard-linking and the guarded runner are already
on the production branch (3f8e325), covered by `tests/tbo/release_regression.test.mjs`.
