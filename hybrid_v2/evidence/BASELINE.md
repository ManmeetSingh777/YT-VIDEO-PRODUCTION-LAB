# Hybrid V2 — baseline (spec §1)

- **Repo:** `E:/MOTION_NATIVE_STUDIO_V1` (verified with `git rev-parse --show-toplevel`).
- **HEAD:** `3e3a1a1c8f4788f6640657acf6ca0510d4e0605c`, branch `master`.
- **Working tree:** untracked `inputs/MOTION_NATIVE_HYBRID_V2_*`, plus 240 local motion frame PNGs (`engine/methods/evidence/stage1/MOTION/specimen2_frames/`), kept out of commits.
- **Prompt file:** `inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md` existed only inside `inputs/MOTION_NATIVE_HYBRID_V2_SPEC_AND_CLAUDE_PROMPT.zip`. It was copied out (sha256 `570ee4c2…`). The ZIP's spec copy is byte-identical to the loose spec (`a2d705ec…`).

## Baseline hashes (first 16 hex chars of sha256)
| file | sha256 |
|---|---|
| `engine/runtime/nu.js` | `773baf915657a2d9` |
| `engine/runtime/mn.js` | `e2a06518f3c06677` |
| `engine/runtime/form3d.js` | `5721728cb518094a` |
| `engine/lib/rig.mjs` | `1d9a5fa2395f5acc` |
| `engine/lib/scene.mjs` | `680dad65abc3d622` |
| `engine/lib/geom.mjs` | `753bd7371f40839f` |
| `engine/tools/build.mjs` | `89e10f8426893c1d` |
| `CLAUDE.md` | `f4a805895fb489bc` |
| `HANDOFF.md` | `f6853dbbdaf96504` |
| `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md` | `a2d705ecc3ca1cd3` |
| `inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md` | `570ee4c290945960` |
| `inputs/EXPERIENCE_DIRECTOR_V1.md` | `c8c6652f5337f517` |
| `inputs/construct-kurzgesagt-art.zip` | `32b42df87a8e3ebb` |
| `engine/methods/source/F_SOURCE.json` | `1e37eaedaaade1b1` |
| `reference/construct-kurzgesagt-art/references/QUESTION_NATIVE_WITNESS_MANIFEST.json` | `6b0c43f59aa15202` |
| `reference/construct-kurzgesagt-art/scripts/prepare_first_pass.py` | `e33cd1f8dfbc6113` |
| `reference/construct-kurzgesagt-art/scripts/repair_learning.py` | `115a1e923e047eb2` |

## Live API → spec mapping
| Spec item | Live implementation | Use in V2 |
|---|---|---|
| Time-seekable runtime | `engine/runtime/nu.js`: `NU.scene()` → `S.k`, `S.at`, `S.show`, `S.render`, `S.camera`, `S.done`; helpers `ease`, `mixPath`, `hash` | **Preserved byte-for-byte.** The art bridge applies baked per-frame matrices through `S.at` hooks, in a separate browser runtime file. |
| Rig FK/IK | `engine/runtime/mn.js rig()`: `pose`, `key`, `drive`, `reach`, `attach`, `walk`, `socket`, `world`; `fk()`, `ik2()` | `ik2` **clamps** an unreachable target (`mn.js:167`). V2 does not route contacts through it: `engine/art_bridge/constraints.mjs` implements the spec §12.1 non-clamping solver and raises `UNREACHABLE_IK`. |
| Camera | `mn.js camera()`, `S.camera` write transforms directly | V2 gives the camera its own ancestor `<g>`. A node written by two owners raises `INVALID_TRANSFORM_OWNER`. |
| Image-part rig | `engine/lib/rig.mjs defineRig(P, spec)` takes `parts[].svg` as raw SVG | The V2 emitter (`svg_parts.mjs`) builds joint `<g>` → static paint `<g>` → `<image>` with registered canonical rects. Raw SVG strings are not accepted. |
| Scene file | `engine/lib/scene.mjs sceneFile()` | Reused only as a reference. The V2 composition writer is separate. |
| Render | HyperFrames 0.9.11 (npx cache) + puppeteer-core 25.16.0 + Chrome; FFmpeg/ffprobe 7.1 | The V2 QA renderer drives Chrome directly for deterministic 60 fps frame capture; `ffprobe` verifies frame count, rate and size. |
| First-pass compiler | `reference/construct-kurzgesagt-art/scripts/prepare_first_pass.py`, `repair_learning.py` | Stage 3 calls these (ArtJob → IMAGEGEN_REQUEST). |
| Old procedural art (`engine/methods/*`, `MN.form`) | Stage-1 V1 producers | **Not used as target art.** Only the math is reused, and diagnostic fixtures are labelled as such. |

## Deviations from the spec / external blockers known at baseline
1. **No image provider configured.** `OPENAI_API_KEY`, `OPENAI_BASE_URL`, `AZURE_OPENAI_*` and `IMAGE_PROVIDER` are all unset. Stage 3 exports `WAITING_FOR_GPT_ART` jobs (spec §11.5). No images are fabricated.
2. **No approved 120 s film script/direction exists.** `films/_qual_A` is a qualification fixture ("NOT Film 001"); neutrino is a finished prior film. Stage 4 therefore produces an Experience Director V1 *proposal* marked `STORY_APPROVAL_REQUIRED`.
3. **No approved GPT-authored character/world assets exist.** Stage 2 mechanical proofs use clearly labelled `DIAGNOSTIC_FIXTURE` PNGs. These are rasterised test shapes, never target art, and never enter a film manifest.
4. **No JSON Schema library is installed.** The schema is Draft 2020-12; a local validator implements the keywords actually used by the schema (`type`, `enum`, `const`, `required`, `properties`, `additionalProperties`, `items`, `minItems`, `maxItems`, `minimum`, `pattern`, `$ref`, `$defs`). Any other keyword raises an error rather than being silently ignored.
