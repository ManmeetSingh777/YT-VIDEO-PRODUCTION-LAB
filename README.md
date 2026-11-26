# CURRENT PROJECT — THE BETTER ONE, FIRST FILM

**Production branch:** `production/better-one-mia-first-film`. **Status:** source-governance updated for E01 V0.4; newest local P06 code/regression is not yet verified/pushed in this branch; actual GPT-image film is not rendered or human-approved. Do not confuse the status of GitHub documentation with the status of the local Claude checkout.

**NEW MANDATORY ART→FILM PROTOCOL:** [Real GPT artwork, manual F01–F80 operator loop, measured Neutrino motion and film review](docs/the-better-one/ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md). It binds the existing P06 exporter/importer to rigorous visual review; it is a standard, **not** evidence real art has passed. [P06 engineering final report](https://github.com/ManmeetSingh777/YT-VIDEO-PRODUCTION-LAB/blob/production/better-one-first-film-engineering/engineering/p06/P06_FINAL_REPORT.md) records 296/296 diagnostic tests and **zero** accepted real-art seconds.

**PERMANENT STANDARD / START HERE:** [Production Operating Standard V1](docs/the-better-one/PRODUCTION_OPERATING_STANDARD_V1.md) · [Restart any GPT/Claude session](docs/the-better-one/SESSION_RECOVERY_AND_HANDOFF_V1.md) · [E01 current truthful status](docs/the-better-one/episodes/E01/EPISODE_STATE.json) · [E01 V0.4 proposed 32.5s opening](docs/the-better-one/episodes/E01/E01_OPENING_V0_4_PROPOSED.md).

**The first E01 film qualification is a proposed contiguous 13s, 780-frame extract at film-absolute [180,960), local [0,780).** It is NOT a requirement to write 13-second scenes. V0.4 dialogue/direction is PROPOSED pending scratch performance, human approval and new 12-part Director. The full flagship runtime is an editorial decision.

**Repeatable session packs:** node tools/tbo/build_session_pack.mjs --manifest docs/the-better-one/session-packs/E01_CREATIVE_RECOVERY.json --out exports/session_packs/E01_CREATIVE_RECOVERY.md. The manifest files and SHA-256 sidecar replace one-off custom pasted source packages; actual CLI execution must be checked in the local checkout.

**New GPT chat (recommended first):** Download [complete creative source pack](docs/the-better-one/NEW_GPT_CREATIVE_SESSION_COMPLETE_SOURCE_PACK.md) as one Markdown file, upload to a separate GPT story/direction conversation and follow [creative start instructions](docs/the-better-one/NEW_GPT_E01_CREATIVE_START.md). **Later, after story and direction:** use the [P05/P06 creative-packet and pre-art source pack](docs/the-better-one/NEW_GPT_STAGE3_ENGINEERING_INTERFACE_SOURCE_PACK.md). Never generate approved artwork before pre-art motion-state requirements are checked.

**Start here, in this order:**

1. [User-approved channel editorial Bible](docs/the-better-one/THE_BETTER_ONE_MASTER_CHANNEL_BIBLE_v1.md) — identity, audience, formats, Mia concept, truth model, creative/release gates.
2. [First-film production master](docs/the-better-one/FIRST_FILM_PRODUCTION_MASTER.md) — GPT/Claude, Neutrino, Blender 3D host, decoder, 8–10-second actual film iterations.
3. [Art, motion, and hybrid quality gates](docs/the-better-one/ART_MOTION_AND_HYBRID_QUALITY_GATES.md) — six failure classes, all stages, negative proof, human visual standards. [Machine-readable gate registry](docs/the-better-one/PRODUCTION_QUALITY_GATE_REGISTRY.json) lists 20 testable obligations (not yet wired to runtime).
4. [P06 one-run 13-second motion implementation directive](docs/the-better-one/P06_13S_PERFORMANCE_SYSTEM_IMPLEMENTATION_DIRECTIVE.md) — source-level adaptation of reusable commands, expressive acting, image-ready state closure, Blender host and decoder. [Typed performance-command schema](docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json) (draft; must be validated and connected to runtime).
5. [Mia editorial starter](docs/the-better-one/E01_MIA_EDITORIAL_STARTER.md) — original research sources, illustrative economics and responsible drafting requirements.
6. [New GPT E01 script/direction start](docs/the-better-one/NEW_GPT_E01_CREATIVE_START.md) — open a separate GPT research/writing conversation.
7. [New Claude account exact start prompt](docs/the-better-one/NEW_CLAUDE_ACCOUNT_START.md) — paste into a fresh Claude Code session.
8. [Mandatory Claude session instructions](CLAUDE.md) and [current P05 handoff](HANDOFF.md) — **do not follow older P02 startup instructions**.

**Authority:** GPT + the user create and approve story, Experience Director V1, F01–F80 artwork and artistic choices. Claude Code executes registered art, rigging, character acting, actual Blender host, mathematically faithful motion graphics, audio and evidence. **No unapproved simplification, generic placeholder promoted to final art, or false PASS.** The first real qualification is a **13-second contiguous extract from the actual Mia film**, followed by a grounded host clip, a real decoder clip, a contiguous **90–120-second hybrid proof**, and the finished 8–12-minute pilot (longer only if earned). The original production system reference remains below for technical details.

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
