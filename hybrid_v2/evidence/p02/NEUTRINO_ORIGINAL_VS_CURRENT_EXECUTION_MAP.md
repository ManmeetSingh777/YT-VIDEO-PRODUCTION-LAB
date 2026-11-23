# Neutrino original vs current studio: execution map

Original: `G:\claude subscription experiment\neutrino_2m_SOURCE_PACKAGE.zip`
- sha256 `1c9f7ee17dde736b7d3eaaee984949db2391d46af6feb7d18e5f6c72135be100`
- Extracted read-only to `hybrid_v2/work/p02/source_pkg/`.
- Its 191 files are byte-identical to `reference/neutrino_2m_SOURCE_PACKAGE/` (`hybrid_v2/work/p02/SOURCE_PACKAGE_RECONCILIATION.json`).

Current: branch `hv2-system-correction`, working tree as exported in `exports/HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT.zip`.

Method: every classification below cites the function that runs and the run evidence that shows it ran. A matching filename or hash is never treated as proof of connection.

## 0. What has and has not been executed
- **Never executed (no GPT artwork exists yet).** "Approved layered GPT artwork" has never flowed through this path. No provider is configured, no paid call was made, and no human trust anchor exists.
- **Executed with labelled DIAGNOSTIC fixtures.** The path below ran end to end in rehearsal phase K (`hybrid_v2/work/p02/rehearsal_K/…`, run `DIAG-20261122142022-e1cc63`, chain verified, 214 events). The fixtures are rasters registered through the same intake API that GPT art must use, labelled DIAGNOSTIC.
- **Exercised only by tests (loopback stub or synthetic operator bundle).** The GPT-specific steps:
  - provider or ChatGPT handoff → sealed candidate → selection by ID → ingest with provenance lineage.
  - Tests: P02-R10, R19, R20, R26, R27, H3, P0-5.

## 1. Execution path, step by step (as run in phase K)
| # | Step | Function actually executed | Evidence |
|---|---|---|---|
| 1 | Artwork enters | `engine/art_bridge/art_intake.mjs#ingestMaster` / `#ingestPart` (GPT provenance additionally requires `#requireProvenanceLineage` against a sealed `PROVIDER_RESULT.json`) | `rt/film/registration/*/…REGISTRATION_RECEIPT.json`; rehearsal build log |
| 2 | Measured registration | `registration.mjs#solveTransform` / `#registerPart`; `asset_geometry.mjs#geometryFields` (canonical rect = occupied bbox of the transformed raster) | Receipts with residuals; `registration_evidence.mjs#verifyRegistrationReceipt` is re-run in S06 (13/13 verified in K) |
| 3 | Approval | `approvals.mjs#writeReceipt` / `#verifyApproval` (TEST_TRUST in the diagnostic namespace only; production needs signed envelopes) | S05 / S06 task verifications in the K ledger |
| 4 | Rig/state selection | `asset_state.mjs#stateIntervals`; `state_router.mjs#validateStateEdge` (view turns via `motion_systems.mjs#validateViewTurn`); `temporal.mjs#compileMotionTracks` → `#stateAtFrame` (causal order: shot → primary curves → contact graph → constraints → approved art state → paint passes) | Frame-trace `rig_states` (`TRACE_100.json`: pose `grip` from frame 100) |
| 5 | Scene composition | `scene_graph.mjs#composeShot` (bands, camera matrices, paint passes, transition plates with aperture masks via `transitions.mjs#compileTransition`); effects via `film/chrome_frames.mjs#withEffects` → `motion_systems.mjs#seededParticles` | `render/compositions/<key>/<shot>/index.html` (inline SVG of the registered layers) |
| 6 | Bake | `render.mjs#buildComposition`: every runtime-owned element × every frame → `baked` table; determinism checked (`UNDETERMINISTIC_FRAME`) | Same index.html (`<script id="baked">`) |
| 7 | **Neutrino animation** | In Chrome: `NU.scene(id, dur)` → `ARTB.bind(S, baked)` registers **`S.at(fn)`**, which writes **`S.set(id, "a:transform" / "vis" / "o")`** per frame → `S.done()` creates the GSAP timeline in `window.__timelines[id]` | `compositions/…/rt/nu.js` sha256 `773baf91…` (= original `source/assets/nu.js`); `chrome_frames.mjs#renderFrame` **asserts** `window.__artbFrame === f`, which `S.at` sets → a frame the nu.js timeline did not evaluate raises `UNDETERMINISTIC_FRAME` |
| 8 | Seek and capture | `film/chrome_frames.mjs#createChromeFrameSession` (puppeteer-core + Chrome 158): `__timelines[id].seek(f/fps)`, double rAF, screenshot PNG → `png.mjs#decodePNG` → RGB24 6,220,800 bytes; shutter blur = sub-frame `ARTB.applyRows` composites (`motion_systems.mjs#shutterSamples`, `temporal.mjs#stateAtFrame{subframe}`) | K `FRAME_MANIFEST.json`: renderer `art_bridge_chrome_frames`, provenance `ART_BRIDGE_CAPTURE`, browser `Chrome/158.0.8127.36` |
| 9 | Frame QC | `segment_render.mjs#renderChunk` (length check, `frameDefects`, frozen-frame via `chrome_frames.mjs#visibleStateSha`); `coverage_gate.mjs#coverageGate` in S08 | K: 12 chunks, 0 defects; COVERAGE_GATE ok, 7200/7200 frames hashed |
| 10 | Encode | Per chunk FFV1 (`-c:v ffv1 -level 3 -g 1 -slicecrc 1`) → ffprobe → concat → libx264 crf 12 yuv420p + AAC of the supplied audio → atomic publish → `RENDER_COMPLETION_RECEIPT.json` | K `render/film.mp4`: 7200 frames, 1920×1080, 60/1, audio 120 s (S09 `final_media` verified) |
| 11 | Verification | `segment_render.mjs#verifyRenderReceipt`: fresh Chrome session re-renders every chunk boundary, the final frame and seeded frames, and compares hashes | K S08 `render_receipt`: 27 frames resampled, identical |

## 2. Capability-by-capability classification
| Original capability (neutrino_2m) | Status | Current implementation (what runs) | Evidence / note |
|---|---|---|---|
| `nu.js` file | **PRESERVED** (byte-identical) | `engine/runtime/nu.js` → copied into every composition | sha256 773baf91…7be in the package, repo and K composition |
| GSAP clock: one paused timeline per scene, `drv.t()` → `S.render(t)` | **PRESERVED** | `S.done()` called by `render.mjs#buildComposition` page; `__timelines[id].seek` | `window.__artbFrame` assertion per frame |
| `S.at(fn)` procedural per-frame hook | **PRESERVED** | `bridge_rt.js#bind` registers the baked-table applier | as above |
| `S.set` with `a:` raw attributes, `vis`, opacity; attribute diff cache | **PRESERVED** | `bridge_rt.js` writes `a:transform`, `vis`, `o` | particle repair F107 proves `vis` is `style.display`-driven |
| `S.k` keyframe tracks (number/hex/path lerp) | **REPLACED** | `temporal.mjs#compileMotionTracks` (`ev` with GSAP-named eases) evaluated in Node, baked | `S.k` is never called in the current path (static grep: no call site outside nu.js) |
| `mixPath` path morphing | **DISCONNECTED** | `deform.mjs#validateMorph` validates morph topology, but the runtime only writes transforms; no `d` attribute is animated | MATCHED_VECTOR_MORPH edges are validated but not rendered as path morphs |
| `S.camera` multi-plane camera (z^depth scale, parallax) | **REPLACED** | `scene_graph.mjs#composeShot` → `cameraMatrix(cam, band, plan.parallax)` per depth band, written as `cam-<band>` rows | K world push-in 3700–3900 (camera_moving segments, coverage camera 2/2) |
| `S.streaks` deterministic particle fields | **REPLACED** | `motion_systems.mjs#seededParticles` via `chrome_frames.mjs#withEffects` (approved sprite assets only) | K dust 600–2400, 600 distinct frames per chunk; P02-R07 pixel diff |
| `S.actor` character rig (lagged poses, breathing, blink, mouth shapes, springs) | **REPLACED / partly MISSING** | Joint tracks + `contact_solver.mjs` / `constraints.mjs` IK + approved state swaps (`state_router.mjs`) | Breathing, blink, lip-sync mouth shapes and secondary springs have **no production consumer** (MISSING) |
| `S.show(id, t0, t1)` display windows | **REPLACED** | Visibility per frame from shot/transition ownership in `frameState` rows (`vis`) | transition plates hidden <3480, shown 3480–3599 (P02-PORTAL-INTAKE) |
| `wig`, `hash` deterministic noise | **REPLACED** | seeded functions in `motion_systems.mjs` | determinism tests M13 |
| Art: hand-written SVG generators (`tools/lib.mjs`, `art_*.mjs`, `character()`) | **REPLACED (by design)** | Approved raster layers registered by measurement; the renderer never draws art (`MISSING_ART_ASSET`) | spec §0 Hybrid V2 |
| HyperFrames CLI composition, seek, screenshot, FFmpeg pipe | **REPLACED** | `chrome_frames.mjs` (puppeteer-core) + `segment_render.mjs` (FFV1 chunks → H.264) | not on the production path; hyperframes is referenced only by legacy V1 tools `engine/tools/plan.mjs`, `control_proof.mjs`, `decision_proof.mjs`, which are NOT reachable from any production entry point (`PRODUCTION_REACHABILITY.json`) |
| HyperFrames `<audio>` mixing (narration/music/sfx volumes) | **REPLACED (narration only) / MISSING (music, SFX mix)** | `renderFilm` muxes ONE supplied audio file | No music/SFX bus or ducking |
| Two-pass `loudnorm` audio post | **MISSING** | none | |
| Kokoro TTS voice, `timing.py` sentence placement | **REPLACED** | Measured narration only: `story/narration.mjs#validateNarrationTimeline` (forced alignment required; estimates refused) | No recording exists, so blocked |
| Scene boundaries from sentence starts (`mkscenes.py`) | **REPLACED** | Shot tiling `film_revision.mjs#checkTiling` + measured word anchors | |
| `motion.py` frame-difference QA | **REPLACED** | `frameDefects` + `coverageGate` (moving intervals vs declared holds) | K coverage gate |
| `dupcheck.cjs` | **REPLACED** | `load_manifest.mjs` DUPLICATE_ELEMENT_ID | portal fixture error during P02 |
| Grain/vignette overlay (`grain.png`, z 40) | **MISSING** | none | not part of the art-bridge contract |
| 30 fps output | **MODIFIED** | 60 fps everywhere (`stage.fps` 60; final probe `60/1`) | |
| 11-scene `index.html` with `data-start` hosts | **MODIFIED** | One composition per shot; absolute frame → shot ownership in `chrome_frames.mjs` | |

## 2b. Production reachability (static import closure, `tests/p02/production_closure.mjs` → `PRODUCTION_REACHABILITY.json`)
- **Production-reachable: 65 files.** The closure starts from the CLIs, the `RENDERERS` registry modules and the three page-runtime files (nu.js, gsap.min.js, bridge_rt.js).
- **Not reachable: 81 engine `.mjs/.js` files.** They include:
  - the V1 Stage-1 method modules (`engine/methods/*`, `engine/authoring/*`, `engine/lib/*`);
  - the V1 runtime `engine/runtime/mn.js` and `form3d.js`. mn.js has its own `a:d` path writer and limb paths, but **none of it runs in the art-bridge path**;
  - the legacy V1 tools;
  - `engine/production/inert_control.mjs`, a test/probe tool.
- These files are kept as preserved history, and the snapshot labels them as NOT production-reachable.

## 3. Honest gaps relevant to the 10-second GPT canary
1. Secondary character acting (breathing, blinks, mouth shapes, follow-through springs) existed in `S.actor`, but the current path has no consumer for it. A canary that needs "convincing character acting" needs an approved-art-driven implementation (state cels and deform maps), or it will look stiff.
2. Path morphing is validated but not rendered.
3. There is no music/SFX bus, ducking or loudness normalisation.
4. The canary must be the first run in which the layers are real GPT art. Every claim above about step 1 for GPT provenance is test-level only.
