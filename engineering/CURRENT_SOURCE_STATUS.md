# Current source status (25–26 Nov 2026 engineering session)

## Repositories and folders
| Location | What it is | Action taken |
|---|---|---|
| `E:\MOTION_NATIVE_STUDIO_V1` | Older studio repo, branch `hv2-system-correction` at `b511e93`, **no git remote**, 55 uncommitted/untracked P02 paths. `b511e93` is not in GitHub history. | **Untouched** (not a compatible checkout of the GitHub repo). |
| `E:\TBO_FIRST_FILM` | Fresh clone of `production/better-one-mia-first-film` at `6d91a6016438a5570e862562bdb706070d972b7f`, tracking origin | Frozen reference checkout. First regression attempt ran here and hit disk-full. |
| `E:\TBO_DEV` | Worktree, branch `production/better-one-first-film-engineering` (child of `6d91a60`) | All new engineering commits. |
| `C:\Users\gmanm\TBO_REGRESSION` | Detached worktree at `6d91a60` | Frozen P05 regression (C: has space). |
| `C:\Users\gmanm\TBO_DEV_REGRESSION` | Detached worktree at the engineering commit under test | Full regression of the new code. |

`main` was not used or modified. Nothing was force-pushed, reset or cleaned.

## P05 baseline vs production branch
`git diff 945464697dc6 6d91a60 -- engine schemas tests` is **empty**: the production branch's engine is byte-identical to P05 code
`9454646`. Its extra commits are documentation and P05 evidence only. `engine/runtime/nu.js` sha256 = `773baf91…db793e7be` (unchanged on every branch).

## Local, non-published F01–F80 witnesses
All 117 witness files under `reference/construct-kurzgesagt-art/assets` were found in `E:\MOTION_NATIVE_STUDIO_V1`. Each one matches its sha256 in
`analysis/EXCLUDED_FILES.json` (117/117, 0 missing, 0 mismatched). They and the other THIRD_PARTY/LARGE_MEDIA entries (134 files) were copied
into each checkout for local tests. They are git-ignored or listed in `.git/info/exclude`, and are **never committed or pushed**.

## Environment
Node v22.20.0 · Chrome (`C:/Program Files/Google/Chrome/Application/chrome.exe`) via puppeteer-core from the npx cache · FFmpeg (chocolatey) ·
**Blender 5.1.2** (`C:/Program Files/Blender Foundation/Blender 5.1/blender.exe`) · drive E: was 100 % full (79 MB free) during the first
regression and has 8.6 GB free after removing that run's own generated output. Long runs go to C:.

## Incidents (recorded, not hidden)
1. While the first frozen regression ran in `E:\TBO_FIRST_FILM`, `engine/art_bridge/errors.mjs` was edited in place for under 2 minutes
   (additive codes) and then reverted. Details: `hybrid_v2/evidence/p05_final/logs/SOURCE_INTEGRITY_INCIDENT.md` in that checkout.
   Development moved to a separate worktree, and the regression was rerun from a clean detached checkout.
2. That first run then failed on drive E: being full (`ENOSPC` / `write EOF` from ffmpeg pipes) in B3-1…B3-7, P06 and P02-R23 S07–S09.
   These are environment failures, not code verdicts. The partial log is kept as `INCOMPLETE_DISK_FULL_regression.tap`.
