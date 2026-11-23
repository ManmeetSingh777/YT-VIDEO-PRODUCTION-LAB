# Hybrid V2 — implementation diff map

Baseline: `a8f5b8a` (BASELINE.md). Preserved byte-for-byte: `engine/runtime/nu.js` (sha256 prefix `773baf915657a2d9`), `mn.js`, `form3d.js`, the skill
(`reference/construct-kurzgesagt-art/`), all Stage 1 (F01–F80 conversion) history, Specimen evidence and the neutrino source package.

| Spec | Module / export | Role in the executed pipeline | Evidence |
|---|---|---|---|
| §3, §4 | `schemas/motion_art_manifest_v2.schema.json`, `engine/art_bridge/jsonschema.mjs#validate` | strict Draft-2020-12 subset validator; unsupported keywords throw | STAGE_1, `tests/art_bridge/stage1.test.mjs` |
| §3.6 | `errors.mjs#err/BridgeError` | every failure is structured (code, record, frames, dependency, producer) | all proofs |
| §4 | `load_manifest.mjs#loadManifest` | schema, ids, paths, hashes, PNG decode/alpha, pivots, underpaint, views, state edges, static reach, transitions, method uses | STAGE_1, S2-1/3/5/6/8 negatives |
| §4 | `graph.mjs#buildGraphs` | rig DAG, occlusion DAG, lineage | stage1 tests (cycles) |
| §11.4 | `coverage.mjs#computeCoverage` | frame-by-frame shot/asset coverage over [0,7200) | stage1 tests |
| §11.4 | `asset_state.mjs#assetStateCoverage` | (shot, actor, interval, view, pose, expression, light, near/far) cells; static master never covers acting states | stage2.test, S2-6 neg 3; wired into `runCheck` |
| §12.1 | `constraints.mjs#solveTwoBonePosition/validateReach/solveContactGraph` | non-clamping IK, reach and limits | stage1 tests |
| §11.1, §5.3–5.4 | `temporal.mjs#compileMotionTracks/stateAtFrame` | single-owner tracks, one-time routing per motion class, contacts (GRIP/PLANT/FOLLOW + approach/release ramps, WORLD/RELATIVE hand orientation), FK/IK, limits, bend-branch check, art-state resolution, cels with plant anchoring, gear trains, flow symbols, baked springs, camera | S2-2…S2-10 |
| §5.1 | `state_router.mjs#validateStateEdge/anchorResiduals/resolveState/validateGazeOffset` | approved edges only; called by `compileMotionTracks` for every view event | S2-6 |
| §5.2 | `svg_parts.mjs#emitSpritePart/emitPass/emitRigTree` | `<image>` at (cx−px, cy−py); crop via nested viewport; static asset_to_canonical wrapper | S2-1, stage2.test |
| §5.1, §5.6, §11.3 | `scene_graph.mjs#composeShot/cameraMatrix` | per-band camera ancestors, explicit occlusion topo order (cycle → OCCLUSION_CONFLICT), light plane bound to owner, aperture-masked transition plates, `frameState(f)` writes every runtime element every frame, `validateFootprint` | S2-1/3/5/7/8/9 |
| §5.3 TRANSITION | `transitions.mjs#compileTransition` | OUT/MIDDLE/IN nested through aperture masks around one invariant anchor | S2-8 |
| §5.5 | `lighting.mjs#applyApprovedLighting` | authored attached light planes only; reads owner matrix | stage2.test (order + matrix) |
| §5.1 | `rig_binding.mjs#bindRig/solveRigAt` | adapter from rig record to the single transform cache (MN.rig/defineRig correspondence documented in-file) | stage2.test |
| §5.1 | `asset_registry.mjs#createAssetRegistry` | verified asset table → package-local URLs; never a placeholder | all renders |
| §5.7 | `render.mjs#buildComposition/serve/capture`, `runtime/bridge_rt.js` | baked frame table → unmodified nu.js `S.at` → GSAP `window.__timelines` seek → Chrome PNG capture at 1920×1080 dpr1; console/request failures recorded | S2-1…S2-10, S2-60FPS (ffprobe 600 frames 60/1) |
| §11.2 | `registration.mjs#registerPart/solveTransform` | similarity/affine from reviewed landmarks, lossless crop, residuals, alpha report, overlay + difference, receipt PENDING_REVIEW | S2-REG |
| §5.1, §6.2 | `art_requests.mjs#missingArtJobs/compileArtJob/routeMedium/applyRepairMemory/completeMotionContext` | errors → grouped ArtJobs with full motion_context (value or null+reason); compile through the installed skill's `prepare_first_pass.py` with verified witnesses + repair memory | STAGE_3, outbox |
| §11.5 | `providers/image_provider.mjs#discoverProvider/NullProvider/OpenAIImagesProvider` | explicit configuration only; pre-request receipts; no fallback | stage2.test (null path); live path NOT_TESTED |
| §5.7, §7.5 | `audio_cues.mjs#resolveCue/resolveEventCues` | measured word timing only; estimated → MISSING_WORD_ALIGNMENT | stage2.test (real _qual_A data refused) |
| §11.6 | `method_trace.mjs#buildMethodTrace/checkMethodUses` | per-method evidence; verdicts computed | COVERAGE_F01_F80.json |
| §7.4 | `engine/tools/art_bridge_check.mjs` (`check`), `engine/tools/art_bridge_qa.mjs` (`qa`, `footSlideReport`, `measureWindow`, art-free motion feasibility), `engine/tools/art_outbox.mjs` (`export/status/ingest`) | required CLIs with nonzero failure exits | film + fixture runs |
| §7.1 | `films/hv2_film001/**` | proposal (STORY_APPROVAL_PENDING), production graph builder, manifest, dependency plan, S02 motion plan, master design briefs, QA results | STAGE_4 |

Engine defects found and fixed during proof work (recorded so they are not reintroduced): light plane painted over later parts (now bound directly above its owner); grip bend-branch flip at reach boundaries (now detected as UNAPPROVED_BEND_BRANCH, compared against the FK pose's own branch); loader treated other actors' states as unknown; loader reach check ignored actor scale; asset-state grip check ran on the prop rig; harness centroid boxes with fractional bounds.
