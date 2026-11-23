# YT-VIDEO-PRODUCTION-LAB: source snapshot for independent audit

This repository holds two complete, browsable code bases:

| Code base | Location | What it is |
|---|---|---|
| **Current studio (Motion-Native Hybrid V2)** | repository root (`engine/`, `schemas/`, `tests/`, `films/`, `hybrid_v2/`, `reference/construct-kurzgesagt-art/`, …) | The working tree of the live studio `E:\MOTION_NATIVE_STUDIO_V1` (branch `hv2-system-correction`): git HEAD `b511e933…` **plus uncommitted changes**. HEAD alone is **not** this version; see `analysis/SNAPSHOT_PROVENANCE.json`, `analysis/STUDIO_UNCOMMITTED_vs_HEAD.patch` and `analysis/STUDIO_GIT_STATUS.txt`. |
| **Original working neutrino film** | `reference/neutrino_2m_SOURCE_PACKAGE/` | An unmodified reference. Its 191 files are byte-identical to `neutrino_2m_SOURCE_PACKAGE.zip` (sha256 `1c9f7ee1…5be100`), hashed member by member in `analysis/ORIGINAL_SOURCE_VERIFICATION.json`. The 381 MB ZIP itself is not published. |

## Start here
1. `analysis/NEUTRINO_TO_GPT_ART_EXECUTION_CHAIN.md` traces the actual chain from script to video, handoff by handoff, and compares it with the original neutrino capabilities.
2. Function maps:
   - `analysis/CURRENT_HYBRID_FUNCTION_MAP.md`: production-reachable modules.
   - `analysis/ORIGINAL_NEUTRINO_FUNCTION_MAP.md`: the original source.
3. Reachability and inventory:
   - `analysis/PRODUCTION_REACHABILITY.json`: which executable files are actually reachable from production.
   - `analysis/SOURCE_INVENTORY.csv`: every published file, with bytes, sha256, language, responsibility, imports, consumers, reachability, origin and classification.
4. `analysis/SOURCE_EXCLUSIONS_AND_DEPENDENCIES.md` and `analysis/EXCLUDED_FILES.json` list everything **not** published, each with path, sha256, size and reason, plus the external dependencies.
5. The audit record of the latest repair round is in `hybrid_v2/evidence/p02/`, including `FINAL_REPORT.md` and `NEUTRINO_ORIGINAL_VS_CURRENT_EXECUTION_MAP.md`. The executed test logs are in `hybrid_v2/work/audit_logs/`.

## Not included
- **Third-party film stills.** These are the F01–F80 source witnesses under `reference/construct-kurzgesagt-art/assets/`, plus the contact sheets built from them.
- **Personal session transcripts.**
- **Generated videos, FFV1 segments, renders and large audio stems.**
- **89 GB of generated work output.**

Everything excluded is listed with its hash. An authorized local build supplies the witness images by those hashes.

## Ignore rules
The `.gitignore` files are the studio's own, published byte-identical. The root one ignores `reference/` and `hybrid_v2/work/` for the live studio. Files in those paths were added here with `git add -f`; use `-f` for them on later branches too.

## Branch policy
- `main` is the stable snapshot under independent audit. Do not modify it while the audit is in progress.
- Repairs happen on named branches, for example `repair/neutrino-gpt-art-integration`. Commit in meaningful units, with reproducible tests and exact commit hashes.

## Status
- No GPT artwork, human approval, recorded narration or real film exists yet.
- The production preflight is fail-closed: `hybrid_v2/evidence/p02/PRODUCTION_PREFLIGHT_hv2_film001.json`.
- **PRODUCTION_READY: NO.**
