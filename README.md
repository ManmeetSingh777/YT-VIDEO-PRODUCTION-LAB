# CURRENT PROJECT — THE BETTER ONE, FIRST FILM

**Production branch:** `production/better-one-mia-first-film`. **Status:** P05 engineering qualification incomplete; first genuine GPT-artwork film not yet rendered/approved. This is not a finished product claim.

**Start here, in this order:**

1. [User-approved channel editorial Bible](docs/the-better-one/THE_BETTER_ONE_MASTER_CHANNEL_BIBLE_v1.md) — identity, audience, formats, Mia concept, truth model, creative/release gates.
2. [First-film production master](docs/the-better-one/FIRST_FILM_PRODUCTION_MASTER.md) — GPT/Claude, Neutrino, Blender 3D host, decoder, 8–10-second actual film iterations.
3. [Art, motion, and hybrid quality gates](docs/the-better-one/ART_MOTION_AND_HYBRID_QUALITY_GATES.md) — six failure classes, all stages, negative proof, human visual standards. [Machine-readable gate registry](docs/the-better-one/PRODUCTION_QUALITY_GATE_REGISTRY.json) lists 20 testable obligations (not yet wired to runtime).
4. [P06 one-run 13-second motion implementation directive](docs/the-better-one/P06_13S_PERFORMANCE_SYSTEM_IMPLEMENTATION_DIRECTIVE.md) — source-level adaptation of reusable commands, expressive acting, image-ready state closure, Blender host and decoder. [Typed performance-command schema](docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json) (draft; must be validated and connected to runtime).
5. [Mia editorial starter](docs/the-better-one/E01_MIA_EDITORIAL_STARTER.md) — original research sources, illustrative economics and responsible drafting requirements.
5. [New GPT E01 script/direction start](docs/the-better-one/NEW_GPT_E01_CREATIVE_START.md) — open a separate GPT research/writing conversation.
6. [New Claude account exact start prompt](docs/the-better-one/NEW_CLAUDE_ACCOUNT_START.md) — paste into a fresh Claude Code session.
7. [Mandatory Claude session instructions](CLAUDE.md) and [current P05 handoff](HANDOFF.md) — **do not follow older P02 startup instructions**.

**Authority:** GPT + the user create and approve story, Experience Director V1, F01–F80 artwork and artistic choices. Claude Code executes registered art, rigging, character acting, actual Blender host, mathematically faithful motion graphics, audio and evidence. **No unapproved simplification, generic placeholder promoted to final art, or false PASS.** The first real qualification is an **8–10-second shot of the actual Mia film**, followed by a grounded host clip, a real decoder clip, a contiguous **90–120-second hybrid proof**, and the finished 8–12-minute pilot (longer only if earned). The original production system reference remains below for technical details.

---

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
