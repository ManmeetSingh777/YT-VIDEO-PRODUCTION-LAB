# HYBRID V2 — FINAL P02 SYSTEM REPAIR, PRODUCTION TRACE, AND EVIDENCE DIRECTIVE

**To: Claude Code working inside `E:\MOTION_NATIVE_STUDIO_V1`.**

**Authority:** This is a targeted mandatory addendum to `HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md` (the existing F001–F072 system directive), not a replacement. Read that directive in full first. Preserve its contracts, all previous test IDs, F01–F80 visual construction instructions, the source-witness rules, the Experience Director, human approvals, and the existing working code. These P02 findings are from the `HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip` source snapshot reported at `4da33a2`. Confirm the state of the **live repository** before assuming that snapshot matches it.

**FINAL VERSION / DO NOT SPLIT INSTRUCTIONS.** This document incorporates the original P02 renderer/lineage instructions **and** the additional cross-stage trace, authority and ChatGPT-art handoff repairs in Sections 9–15. It supersedes the earlier downloaded P02 file of the same original name. Read through Section 16 before editing; do not execute an older P02 in parallel. Keep the 72-class original directive as the governing historical specification. If the live repo has already implemented any item, prove its exact invariant with the prescribed adversarial tests instead of duplicating it.

## 0. Purpose and honesty boundary

Build and prove the reusable chain:

**fact-checked script → approved Experience Director/shot/action plan → exact GPT art requests → genuinely provider-produced and approved image assets → measured registration/rigging → preserved Neutrino runtime → real deterministic 1920×1080 60-fps frame capture → bounded-memory encode → synchronized film with trustworthy QA.**

This run is **authorized to repair software and run diagnostic fixtures**, not to approve a film proposal, fabricate an external reviewer, invent evidence, commission paid/bulk GPT art, record a human voice, or declare production ready. Successful diagnostics can prove software capability, not final art quality or film approval. Any absent external authority remains blocked and visible.

**Universal repair rule:** Fix `predicate → invariant → reusable producer → fail-closed consumer → test → unlike transfer`. Never patch one named laundromat scene, character, hand coordinate, timestamp, shot ID, prompt string, or manually edited receipt. A fixture may depict an old failure, but the new code must apply to any appropriate film and an unrelated holdout.

**Success cannot be promised in advance.** Reproduce the defect first, implement, rerun, independently inspect, and mark any remaining failure OPEN. A test count is not completion.

## 1. Safe baseline; do before editing anything

1. Work only in the existing `E:\MOTION_NATIVE_STUDIO_V1` repo. Record HEAD, branch, dirty/ignored files, active `AGENTS.md` and `CLAUDE.md`, Node/npm, Chromium/Puppeteer and FFmpeg versions, lockfile, `nu.js` SHA-256, runtime/bridge/film files, and current artifacts in `AUDIT_P02/BASELINE.md`. Preserve all uncommitted user modifications. Do not `git reset --hard`, force checkout, delete existing outboxes, or overwrite approved source assets.
2. Re-read the 72-row source directive and the last correction audit; map each prior F001–F072 row to **executed** test, positive evidence, negative evidence, and genuinely unrelated transfer evidence. Append all new software bugs discovered in this directive as **F073 onward** with invariant, precise producer, applicability predicate, changed lines, regression, status. Do not overwrite or renumber F001–F072.
3. Resolve conflicts in `CLAUDE.md`: the audit still says Stage 1 ONLY authorized and Stages 2–4 locked, while newer code claims progressed stages; it also references `reference/neutrino_2m_SOURCE_PACKAGE/`. Establish what is truly implemented and authorized. Reconcile authoritative docs only after verified facts; never silently unlock human-gated states.
4. Locate `G:\claude subscription experiment\neutrino_2m` and `G:\claude subscription experiment\neutrino_2m_SOURCE_PACKAGE.zip` (historically 381 MB), without assuming either still exists. If present, SHA the ZIP, inventory it and unpack a **read-only isolated comparison**. If absent, report `ORIGINAL_SOURCE_NOT_ACCESSIBLE` and the exact file needed; **do not infer its contents** from the smaller `neutrino_2m_FORENSICS.zip` or current `nu.js`.

## 2. Verify what Neutrino actually preserved

The supplied correction-audit ZIP **contains** `engine/runtime/nu.js`, `engine/runtime/mn.js`, `engine/art_bridge/render.mjs`, and `engine/film/segment_render.mjs`. Its `nu.js` hash is `773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be`, equal to the earlier audit snapshot. **Do not report Neutrino itself as missing.** But that SHA alone cannot prove all original motion assets, rig code, HyperFrames capture, dependencies, scene sources, and renderer contracts survived.

Create `AUDIT_P02/NEUTRINO_SOURCE_RECONCILIATION.md` with **file-by-file** mappings:

- original `assets/nu.js` (276 lines in the old forensic description) versus current `engine/runtime/nu.js`: SHA, API exports, timeline controls and actual semantics;
- original HyperFrames/Chrome deterministic seeking, save/export and FFmpeg path versus today's `engine/art_bridge/render.mjs#buildComposition`, `#capture` and `engine/film/segment_render.mjs`;
- original editable character and world/rig assets and original programmatic scene sources versus preserved versions or justified replacements;
- original 120-second 1080p **30-fps** reproduction mode versus new target 120-second 1080p **60-fps** mode: distinct acceptance conditions, never claim the first proves the second;
- all missing files, imports, indirect dependencies and browser environment details.

If the original source package exists, execute a small repeatable original-path smoke capture in isolation and archive screenshots, frame hashes, commands and logs; never alter original source. Then run a current-path smoke capture using `nu.js` and **actual registered image layers** in a clearly marked diagnostic composition; compare supported capabilities. Reconnection must reuse the preserved runtime and its behavior, with narrow wrappers. Do not rewrite or substitute the proven engine merely to make a test pass.

## 3. Repair the missing production renderer **and the entire calling contract**

### F073: The only registered `segment_render.mjs#RENDERERS` entry is `diagnostic_flat`

Source: `engine/film/segment_render.mjs`. That renderer creates 16×9 RGB patterns and scales them with `flags=neighbor` to a metadata-correct 1920×1080 MP4. It **cannot** be treated as real film. `engine/art_bridge/render.mjs#capture` does operate Chrome asynchronously, but is only a separate batch diagnostic path. Both paths must be joined correctly.

Implement **one** production renderer entry named `art_bridge_chrome_frames` with provenance `ART_BRIDGE_CAPTURE` and a clearly defined asynchronous lifecycle, e.g.:

```js
// Interface contract, not permission to bypass existing validation:
const session = await createChromeFrameSession({
  film, filmRevision, approvedManifest, compiledComposition,
  seed, fps: 60, width: 1920, height: 1080
});
try {
  const rgb24 = await session.renderFrame(absoluteFrameIndex);
  // Buffer bytes: exactly 1920 * 1080 * 3, opaque full-resolution RGB.
} finally {
  await session.close();
}
```

Required behavior:

1. Use the **existing** `buildComposition`/Neutrino/GSAP/bridge runtime, the existing manifest and measured art registration. Resolve source images by verified SHA-256, not arbitrary new drawn shapes or cached filenames. Reject any unapproved or missing required asset, review, state, view or transition before launching production output. No synthetic/placeholder pixels may acquire real-art provenance.
2. Launch and reuse a controlled browser/session across many frames; pin browser/runtime versions, viewport = 1920×1080, deviceScaleFactor = 1, deterministic seed, fonts, color handling and any device-dependent settings. Wait for every approved image/font to load and decode; throw a precise dependency error for missing resources. If browser capture fails, fail closed.
3. **Absolute seeking**: for every requested integer frame `f`, force Neutrino/GSAP and all camera/rig/state/effect/particle evaluations to deterministic time `f/60` (and known per-shot origin when defined). No accumulating frame-to-frame transforms, wall-clock timers, network fetch races, unmanaged randomness, stale previous frame, animation-frame scheduling or unseeded particles. Render order `0,1,...` and `120,10,120` must hash the same for the same revision/seed; different seed may affect only seeded effects specified by contract.
4. Capture actual completed composition at **native** 1920×1080. Decode PNG/screenshot bytes into packed **RGB24** with exact `width*height*3` length. Do **not** pass PNG bytes directly into a raw RGB FFmpeg pipe. Explicitly validate dimensions and opacity/compositing on approved world layers; detect transparent gaps/missing source. No implicit 16×9 upscaling, browser CSS-only zoom, fallback patterns, black rectangles, or text overlays that conceal missing art.
5. Keep `diagnostic_flat` registered for unit tests only and irrevocably provenance `DIAGNOSTIC_ONLY`; the production QA consumer must reject it regardless of command-line `--source`, `ART_BRIDGE_TEST_TRUST`, amended JSON, or an MP4 with correct metadata.
6. Refactor **all callers**, not only the registry: `renderChunk`, `renderFilm`, `verifyRenderReceipt`, CLI and tests. Current `renderChunk` directly calls synchronous `renderFrame(f)` and `sha(buf)`; `verifyRenderReceipt` also calls `sha(rf(s))`. Returning promises from a new Chrome factory without awaiting these sites is a defective repair. Their contract must use awaited byte buffers, `try/finally` session cleanup and precise failures.

### F074: 1080p frame buffering violates bounded memory

Source: `engine/film/segment_render.mjs#renderFilm` uses `frames=[]` for entire chunk before FFmpeg. `600 * 1920 * 1080 * 3 = 3,732,480,000 bytes` (~3.48 GiB) **per 10-second chunk**, before Chrome, decoder, process and recorder overhead.

**Required implementation:** Change to a **bounded-memory, resumable per-chunk capture/encode pipeline**. Preferred explicit construction:

1. Render one RGB24 frame at a time asynchronously and stream directly to a per-chunk temporary FFmpeg encoder with `.write`/`drain` backpressure. Keep no array of frame Buffers. Decode one frame, validate exact source pixel count, calculate frame hash/semantic-defect evidence, write, release reference, then advance. Only hashes/metadata may be retained in RAM.
2. Encode each 600-frame chunk into a deterministic, independently decodable **lossless FFV1 MKV intermediate** (or document and prove an equivalent lossless independent segment format); after complete encode, use `ffprobe -count_frames` to verify exact frame count, 1920×1080 and 60/1, then atomically write its receipt. Do not label partially written chunks complete. Record each frame SHA and a chunk digest bound to revision, seed, renderer version, input art hashes, frame range, resolution, and encoding settings.
3. On restart/crash, reuse only a verified complete chunk whose frame receipt/revision/segment match. Otherwise discard only that incomplete temporary segment and regenerate that chunk from its **first absolute frame**, checking any retained prior hashes. Never append half a chunk to a live FFmpeg input, silently duplicate frame 0, skip a frame, or mix chunks across revisions. Inject crashes at first, middle, last frame and during FFmpeg completion. Preserve already published previous version if new attempt fails.
4. Deterministically assemble verified chunks in order, encode final MP4 at exact frame cadence, mux **actually supplied** recorded aligned audio (if available), then re-probe *decoded* total frames, duration, dimensions, rate, audio track, and sample frame images. Publish atomically only after all gates. FFmpeg failure, disk-full, SIGINT, browser crash, invalid frame length and audio mismatch must kill child processes and close the browser, leaving no success receipt/partial published file.
5. `verifyRenderReceipt` must be fully async, authenticate the specific engine-produced receipt and actual files, reject a changed renderer implementation, failed defect scan, stale revision or missing segment, and re-render chosen absolute frames on a fresh independent session. Include chunk boundary samples `599/600`, `1199/1200`, final frame `7199` as well as random seeded samples. A sampled re-render cannot itself establish visual quality; preserve that separation.

For production frames, require `width === 1920`, `height === 1080`, `fps === 60` and `buffer.length === 6_220_800` unless the manifest explicitly authorizes a different *separate* production target. Remove or branch off the production `scale=...:flags=neighbor` path. Never silently transcode tiny test frames into purported production resolution.

### F075: Render QA only checks black frames and magenta sentinel

Source: `segment_render.mjs#frameDefects`. Add image-backed QC that checks transparent/unpainted edge holes, promised asset/track visibility, camera overscan, shot continuity, transition state, and **declared moving-action intervals**. Detect frozen/duplicated frame substitution on intervals contractually requiring movement, using frame difference/optical-motion evidence and semantic trackers; allow legitimate held/static beats so the test does not falsely ban purposeful stillness. Check all frames for mechanical invariants and representative native-resolution playback for artistic/readability judgement. A green scan **cannot** replace independent human review. Fail on actual broken motion, not arbitrary minimum pixel activity.

## 4. Connect previously orphaned motion operations to actual rendered pixels

### F076: Motion helper exports have no effective production consumer

The audit identifies `engine/art_bridge/motion_systems.mjs#seededParticles`, `#shutterSamples`, `#validateViewTurn` as tested APIs without a verified real film call path.

- Route `seededParticles` through shot/world/effect contracts and actual per-frame browser drawing; fixed film revision/seed/frame gives identical positions, yet changes in declared emission or wind inputs alter pixels. Do not draw generic decoration where none was art-directed.
- Route `shutterSamples` through camera shutter and compositing for actions marked as requiring motion blur, including actual subframe transforms and approved layers; a field merely named `blur` does not count. Absolute f seeking and out-of-order deterministic samples still hold. Ensure support for high-speed motion without merely painting a duplicated ghost over art.
- Call `validateViewTurn` from `state_router.mjs#validateStateEdge` on every view-changing edge, with the relevant bound asset master and >=3 real shared landmarks and explicit depth/silhouette constraints. Rejection must occur before production rendering if no approved backside/turn family exists. Do not assume an ordinary one-view PNG can rotate convincingly into a second view.

Tests must trace runtime call stacks and compare **actual pixels** with and without each controlled input, on a relevant positive example and an unrelated holdout. An exported function or manual invocation is not consumer proof.

## 5. Fix revision hashing and approval staleness

### F077: The film revision omits crucial executable code and may trust declared asset hashes

Source: `engine/film/film_revision.mjs#buildFilmRevision` hashes top-level `.mjs` under `engine/art_bridge` and `engine/film`, plus `nu.js`, but not all transitive runtime/producer code. Current missing categories include `engine/story/**`, `engine/art_bridge/runtime/bridge_rt.js`, `engine/runtime/mn.js`, `gsap.min.js`, nested modules, `engine/tools/**`, installed F01–F80 methods/source witness spec, renderer dependencies and selected provider/registration code. The `assets` part draws hashes from the manifest without independently verifying actual bytes.

Implement a **recursive, content-addressed, allowlisted dependency closure** for **all production-reachable code and authority documents**, with stable relative paths, file bytes and pinned tool versions, plus hashes for the actually delivered art, registration receipts, active story/shot/action/Experience Director contracts, audio+alignment, source-conditioned design contracts, approvals and current manifests. Do not hash arbitrary mutable logs, outbox history, or the generated receipt itself (avoid hash cycles); document every inclusion/exclusion and why. Never silently treat a missing required file as null-and-green.

Make every downstream QA/render/approval receipt bind to the correct **scoped** revision and current upstream hashes; producer mutation invalidates only outputs whose validity depends on it, while mandatory film revision mutation invalidates film render and certification. Do not accidentally invalidate a canonical art approval because an unrelated diagnostic log changed. Tests should mutate ONE at a time, assert digest change and stale rejection, then restore:

1. `engine/story` compiler function;
2. `engine/runtime/mn.js`;
3. `engine/art_bridge/runtime/bridge_rt.js`;
4. nested art or film producer;
5. actual art PNG bytes **without editing declared manifest SHA**;
6. source F01–F80 skill/approved method revision;
7. audio and measured word alignment;
8. manifest, shot/action/rig/transition contracts.

Also test that changing only a diagnostic log does *not* cause unnecessary production invalidation. Report exact dependency closure in `AUDIT_P02/REVISION_DEPENDENCIES.json` and mutation results.

## 6. Close two adversarial evidence/lineage holes

### F078: Editable `UNLIKE_TRANSFER.json` can falsely grant QA

Source: `engine/tools/art_bridge_film_qa.mjs#gatesFor`: current `unlike_transfer` accepts two `pass:true` passages with `provenance:"GPT_PROVIDER_ART"` from editable JSON. It does not independently validate the two real-art families, the provider/asset/registration/review receipts, current frame evidence, complete coverage or reviewer authority.

Replace this with verification of **two materially unlike, genuinely source-conditioned, image-backed transfer cases** built from immutable signed/hash-scoped evidence chain: provider output → immutable selected candidate → source witness → registered assets → approved human visual review → actual render sample/film revision → quantitative and human-reviewed passage result. Require meaningful family difference (e.g. human acting versus mechanical/world visualization) and no direct copied props, layouts or prompts. A JSON document is an index of file hashes/receipt IDs **only**, never source of authority. Include that evidence in the film revision/gate digest.

Adversarial tests: edit JSON `pass:false` to `true`; write fabricated `GPT_PROVIDER_ART`; reuse a reviewed passage from an old asset revision; submit two passages of the *same* family; set test trust variable in production; point to unreviewed but valid PNG. **Every one must reject qualification.** A genuinely reviewed and revision-matched two-family test should pass only the proper qualification layer, never claim final-film PASS without the remaining human/audio evidence.

### F079: Any arbitrary file can be selected as a stage predecessor

Source: `engine/art_bridge/art_intake.mjs#selectStageCandidate` currently saves `{file, sha256}` for an arbitrary supplied path. `submitJob(... predecessorCandidate)` can override stage selection without proving the object belongs to this generation and preceding provider result.

Make stage selection identify a candidate **by ID within an immutable provider-result record** for the exact `film + artjob + compiled generation digest + stage + provider run`. Load that record from its authenticated content-addressed storage. Verify candidate membership, `valid === true`, provider receipt/provenance, original file location under the immutable candidate store, bytes/hash and ancestry to the approved master/design. Record chosen candidate ID and receipt hash, not a trusted caller path. The next stage must load only this canonical selection; remove or hard-reject caller-provided predecessor overrides except an explicit verified migration path with the same provenance validation. Prevent symlink/path traversal and cross-film or stale-generation references.

Adversarial tests: arbitrary PNG in temp dir; modified selected candidate; same bytes but different job; stale generation; output of stage N passed as predecessor for stage N+2; invalid/failed candidate; synthetic fixture masquerading as GPT; forced `predecessorCandidate` override; forged candidate JSON. All reject before provider invocation. Positive test selects one of the real returned candidates and makes stage N+1 consume that **exact** image and provenance. Test on at least two unrelated asset families.

## 7. Complete semantic and artistic prerequisites without forging approvals

The existing `AUDIT/OPEN_DEPENDENCIES.md` admits unfinished **proposal data**: `story/STORY_CONTRACT.json` absent, **15 named semantic actions** not represented, **22 attention targets** inert, **3 art states** missing, **2 portal transitions** lacking a rim occluder. These are NOT a reason to hardcode one laundromat repair. Run the generalized compilers, itemize each failing typed contract and producing operation, repair the reusable compiler/demand-graph/attention-consumer logic where broken, and provide the requested legitimate art/direction input as **draft needing review**, never as approved facts or invented pixels. A particular proposal may still fail an honest gate until Manmeet approves it; that is correct.

Preserve complete art-family coverage for character, noncharacter machine, diagram, camera world, portal/occluder, underpaint, alternate view, cloth/deformation and registered cel, per F001–F072. Ensure the F01–F80 source method actually modifies a requested provider art decision and its visible effect; do not certify a named method merely because a function exists. The five other master identities must remain unqualified until their source-grounded designs genuinely exist and pass authority reviews. **Do not spend provider calls in this code run.**

## 8. Mandatory tests to write **before repairs**, then pass afterwards

Add `tests/p02/` with stable IDs and a checked-in runner; record red reproduction before implementation (without changing protected user artifacts). At minimum:

| ID | Required proof and rejection |
| --- | --- |
| P02-R01 | Current archival registry cannot render native approved Chrome frames; new registry does, with full 6,220,800-byte RGB24 output; PNG bytes and 16×9 outputs reject. |
| P02-R02 | Browser out-of-order frame capture and separate-session capture yield identical SHA for same revision, seed and frame; source content mutation stales receipts. |
| P02-R03 | **600 consecutive** 1920×1080 60-fps image-backed frames stream into one verified lossless segment, no Buffer array; log peak process RSS/Chrome RSS and show memory does not grow with chunkSize. |
| P02-R04 | Crash injection at chunk start/mid/end, Chrome disconnection, FFmpeg failure and disk error yield no completion receipt or half-published film; retry resumes exact frame coverage and hashes without duplication. |
| P02-R05 | Chunk joins at 599/600 and 1199/1200; final full *diagnostic* film has 7,200 decoded frames, exactly 60/1, 1920×1080 and valid segment receipts; a 16×9 upscaled diagnostic MP4 never counts as real film. |
| P02-R06 | Frame scan rejects uncovered edge, missing required state, actual frozen motion on an action interval and broken transition; it permits an intentionally static hold. |
| P02-R07 | Particles, shutter blur and view validation demonstrably alter or reject **real browser render state** under the correct predicates; tests on two unrelated visual families. |
| P02-R08 | Each missing code/audio/art/style/input category in F077 changes correct revision and stales dependent QA; diagnostic logs do not. |
| P02-R09 | Every forged/old/duplicated unlike-transfer proof in F078 fails closed; genuine source-authenticated, reviewed two-family proof works only at appropriate layer. |
| P02-R10 | Every forged/stale/cross-job candidate path in F079 fails before provider call; real candidate lineage is immutable through all stages. |
| P02-R11 | Full 72 historical classes still map to executed evidence; new F073+ rows map to producer-level tests and unlike transfer; **no unqualified item reclassified green**. |
| P02-R12 | Extract the exact delivered audit ZIP in a fresh isolated folder with documented dependencies; reproduce every advertised test suite and show commands and output. Missing source files must cause export rejection, not silently reduce test count. |

Additional concrete QA:

- The provided `HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip` was not **independently self-reproducing**: `engine/tools/compile_film_contracts.mjs` was referenced by `art_outbox.mjs` but absent; `reference/construct-kurzgesagt-art/SKILL.md` and native witness JPGs needed by some tests were absent. Existing audit claimed 131/131, yet extracted subsets produced `ERR_MODULE_NOT_FOUND`/`ENOENT`. Fix the **export producer**, not the tests. Include code, test fixtures, pinned dependencies/lockfile, source witness files when distributable, and an exhaustive SHA manifest. Otherwise declare and quantify explicit excluded inputs with a reproducible secure-fetch mechanism and label tests blocked; **never call the export self-contained**.
- Do not reveal private provider credentials, API keys or sensitive personal data in the audit. Use a redacted environment contract and local secret references only.
- Run existing stage3, T/U/A/R/M/P/L and full integration suites unchanged; do not weaken assertions, add `skip/todo`, call `process.exit(0)` on failures, broaden errors, change fixtures to fit broken code, or invoke test-trust in production.
- Require **one positive and one failure** on each functional gate, at least two unrelated families and an independently inspectable native-resolution Chrome motion preview. Keep explicit tags `DIAGNOSTIC`, `REAL_ART_PROVIDER`, `HUMAN_APPROVED`, `FINAL_FILM`.

## 9. F080 — One persistent, causal production ledger across **all** stages

**Observed audit weakness:** Existing files use separate log/receipt paths (`engine/art_bridge/art_intake.mjs#log`, `approvals.mjs#HISTORY.jsonl`, `outbox_store.mjs#CURRENT.json`, film QA/render JSONs). The audited export does **not** demonstrate one durable cross-stage run controller with parent-child lineage and replay. These separate records are useful but not sufficient to answer "why did frame 4,723 fail, which original request caused it, and what becomes stale if we fix the cause?" Implement a real producer/consumer pipeline ledger; do **not** only add console logs.

### 9.1 Canonical stage topology and handoff packets

Use these universal stages (names below are normative, internal implementation may use typed sub-stages if reported in `STAGE_MAP.json`):

| Stage | Input authority | Required output handed to next stage | Gate |
| --- | --- | --- | --- |
| `S00_IDEA` | User film idea and scope | Versioned `FILM_INTENT`, objectives, audience, length and constraints | Human-supplied intent; no guessed claims |
| `S01_STORY` | S00, factual sources and approved creative choices | Typed claims/evidence, script, causal mechanisms, counterfactuals, approval | Fact and semantic checks + real story approval |
| `S02_EXPERIENCE` | Approved story, intended feeling/attention and voice plan | Beat/attention/energy trajectory, audience causality and director decisions | Attention decisions have real downstream consumers; human direction review |
| `S03_TIMING_MOTION` | S02 + recorded narration/verified alignment when required | Exactly tiled 60-fps shots, actions, contacts, state/world/camera transitions and synchronized events | No missing action, ambiguous state, unsupported rig or frame ownership |
| `S04_ART_DEMAND` | Shot/action/state graph + visual source methods | Exact image families, masters, parts, views, masks, underpaint, occluders and resolution/alpha/registration demands | Every requested **visible** state has an explicit dependency; design/feasibility reconciled |
| `S05_ART_PRODUCTION` | Approved design, authorized source witnesses, current learning memory, compiled job | Immutable **API provider or explicit ChatGPT-user handoff** request, original candidate bytes, accurate provenance/selection, final art review | No invented pixels, truncated methods, stale source or arbitrary predecessor |
| `S06_REGISTRATION_RIG` | Approved image assets and topology/landmarks | Measured canonical geometry, fit feasibility, scene bindings, physical constraints, approved state/edge receipts | Pixel-confirmed fit, contact/weight/view/occlusion and no unsupported operation |
| `S07_NEUTRINO_RENDER` | Frozen approved S01–S06 revision, Neutrino code and actual art | Deterministic full-res frame evidence, per-chunk hashes, bounded encode receipts | Real source bytes, complete frame coverage, safe restart and reproducible capture |
| `S08_QA_REPAIR` | Rendered frames + story/action/design/rig expectations | Independently executed quantified tests, full-speed visual review and source-level failure classification | Any failure routes to responsible **producer**, not a shot-specific output patch |
| `S09_FILM_AUDIO_FINAL` | Approved render + recorded narration/score/sound and alignment | Exact 7200-frame 1920×1080 60-fps A/V film, final hashes, qualified human review | Real A/V/production evidence and current reviewer authority |

**Timing principle:** narration is recorded/aligned early enough to control S03 event timing, even though audio is finally muxed in S09. Changing the script or alignment invalidates the necessary downstream timing. Every repair loop creates a **new revision and lineage**, never edits an already-approved artifact in place. A stage is not successful merely because its output file exists.

Define a checked-in **versioned schema** for each `STAGE_HANDOFF.json`:

```
schema_version; film_id; run_id; stage_id; stage_attempt_id;
input_artifact_refs[]; input_revision_hash; producer_module_export;
producer_source_sha256; tool_environment_digest;
output_artifact_refs[]; output_revision_hash;
required_checks[] with exact evidence receipts; approval_refs[];
status; blockers[]; time_started_utc; time_completed_utc;
causal_parent_event_ids[]; event_chain_head_sha256.
```

`STAGE_HANDOFF` must be **generated by the actual producer** after verifying all declared inputs and output bytes; not authorable by an arbitrary status command. Consumers load verified artifact references, recompute all applicable hashes, validate schema and producer authority, and **refuse** on absent/stale evidence. A stage packet with `pass:true` but no verifiable execution is INVALID. No implicit "best effort" default, no silent skip or cached success.

### 9.2 Durable event journal and immutable artifact store

Implement and document the **single authoritative run store** within the actual film's workspace, using this layout:

```
<FILM>/production/
  RUN_INDEX.json                     # derived/rebuildable view; never authority
  store/sha256/<first-2-hex>/<hash>   # immutable, verified artifact bytes
  runs/<RUN_ID>/
    RUN_MANIFEST.json                 # film/source/runtime/config revisions
    events/<sequence>.json            # append-only canonical events
    stages/<STAGE_ID>/<ATTEMPT_ID>/STAGE_HANDOFF.json
    evidence/                         # hashes/pointers to checks, rendered frames, reviews
    failures/                         # actionable typed failure records
    FRAME_TRACE_INDEX.json            # frame -> shot/action/rig/asset/receipt chain
    STATUS.json                       # derived view only; can rebuild by replay
    FINAL_RUN_SUMMARY.md
```

Source bytes MAY also remain in existing film folders for compatibility. The ledger's references must point to SHA-verified snapshots or immutable content-addressed bytes, **not mutable filename trust**. Use safe relative-path enforcement (reject `..`, symlinks out of root and cross-film paths), bounded storage/retention, explicit disk-space preflight and redaction of keys, tokens, PII and raw private provider headers.

Each committed event has at minimum:

```
schema_version, event_id, sequence, prev_event_sha256, event_sha256,
film_id, run_id, stage_id, attempt_id, operation_id, event_type,
actor_kind, producer_source_sha256, input_refs[], output_refs[],
status_before, status_after, gate_evidence_refs[], blocked_on[],
failure_id, parent_event_ids[], wall_time_utc, elapsed_ms.
```

Event types **must** include `RUN_CREATED`, `STAGE_READY`, `STAGE_STARTED`, `EXTERNAL_REQUEST_PREPARED`, `EXTERNAL_OUTCOME_UNKNOWN`, `OUTPUT_PREPARED`, `CHECK_PASSED`, `CHECK_FAILED`, `HUMAN_APPROVAL_REQUIRED`, `STAGE_COMMITTED`, `STAGE_BLOCKED`, `REVISION_SUPERSEDED`, `REPAIR_PROPOSED`, `REPAIR_APPLIED`, `RUN_RESUMED`, `RUN_FAILED`, `RUN_COMPLETED`. Keep event hash chain independently verifiable and anchor its final digest in the audit manifest/outside the mutable run folder. Hash chains detect changes to a recorded snapshot, **not** proof of a human's identity; do not conflate them.

Implement a **single-writer, crash-safe commit protocol**. Allocate event sequence numbers under an exclusive cross-process lock with a fencing generation and stale-lock recovery; write temp + flush/sync + atomic publication + verified read-back. A successful `STAGE_COMMITTED` must never precede verifying committed content-addressed output receipts. Crash at any boundary must replay to exactly the last fully committed event; ignore/quarantine incomplete preparations. On simultaneous producers, only one valid attempt can commit each `(film, revision, stage, generation)`; loser gets `CONCURRENT_STAGE_CONFLICT`, never clobbers files. Existing `CURRENT.json` and report indexes become derived pointers and are safe to rebuild; neither is a source of approval or provider provenance.

Do **not** produce one huge in-memory array of frame images or one event per pixel. Save a per-frame/shot **index** of frame hashes and semantic trace refs; the small event ledger records stage operations and evidence digests. `FRAME_TRACE_INDEX.json` must cover 0–7199 and identify for each frame its owning shot/actions/attention targets, approved art versions, rig/state/camera/transition/effect owners and render chunk, including explicit intentionally static holds.

### 9.3 The mandatory trace and recovery commands

Expose one supported operator CLI (suggested `engine/tools/production_run.mjs`; wire to the **real** producers, do not create a second fake implementation):

```
production-run preflight --film <dir>
production-run start --film <dir> --diagnostic
production-run status --film <dir> [--run-id <id>]
production-run trace --film <dir> --run-id <id> --frame <0..7199>
production-run why --film <dir> --run-id <id> --failure <id>
production-run resume --film <dir> --run-id <id>
production-run verify --film <dir> --run-id <id>
production-run export-audit --film <dir> --run-id <id>
```

`status` prints a truthful compact stage table: requested/received/verified/committed/current-stale/blocker; `trace` walks **backwards** from a frame, action or artifact through every producer and origin (including source F-method and exact GPT request or external import); `why` shows first failing invariant, evidence, likely root mechanism, valid repair owner, blast radius and downstream stale outputs; `resume` deterministically resumes only eligible stages. Commands must refuse a corrupted ledger or forged handoff rather than trusting JSON display labels. Provide machine-readable JSON output and human-readable summaries. Test `trace` on a missing grip, portal occluder, stale master, unexpected camera crop and absent narration cue. Those are **test subjects only**; implementation is generic.

## 10. F081–F083 — Real authority, real QA execution, real repair learning

### F081: Human attestation can be fabricated through a public function parameter

**Actual source:** `engine/art_bridge/approvals.mjs#writeReceipt` chooses `reviewer_kind="HUMAN"` whenever caller supplies `attestation?.method==="INTERACTIVE_TTY"`; it does not verify that `attestHuman` actually ran or that Manmeet reviewed the actual art. `attestHuman` only asks a terminal operator to type 8 characters *shown by the program*. The direct `writeReceipt` API (and `reviewFilm({attestation})`) can therefore mint a misleading HUMAN receipt. An agent controlling a pseudo-TTY can also mechanically type the displayed characters. This is not trustworthy independent human approval.

**Required repair:** Distinguish `LOCAL_OPERATOR_CONFIRMATION` (informational) from cryptographically/authentically **independent user-authorized approval**. Human-scope production authority must originate **outside the Claude-controlled execution context** from a controlled reviewer channel with an identity/credential that the implementation agent cannot mint or read. A signed canonical review envelope must bind `(reviewer identity, verdict, scope, film id, exact evidence bundle SHA, design/image/frame hash, approved revisions, timestamp, unique nonce, expiry/revocation sequence)`. The pipeline verifies signature/public key, exact scope and fresh current bundle, plus a hash of the actual presented review packet. Never generate or store signing private keys or reviewer session tokens in the repo, agent environment, audit ZIP or source tree. Where an independent reviewer system is unavailable, status must be `AWAITING_INDEPENDENT_HUMAN_APPROVAL`, **not HUMAN_APPROVED**. Leave a secure operator handoff design and make tests use an isolated throwaway test signing key whose provenance is always `DIAGNOSTIC_ONLY`. Ensure revocation and later REJECTED verdict invalidate descendants.

Add tests calling `writeReceipt` and `reviewFilm` directly with a forged `{method:"INTERACTIVE_TTY"}`, a fake TTY, edited history, copied signatures from other assets, stale review bundle, wrong reviewer, replayed nonce, later revocation and `ART_BRIDGE_TEST_TRUST=1`. Every fraudulent path must fail production. A genuine independent signature on a current packet passes exactly the scoped review gate—not the entire film.

### F082: Editable shot QA flags are treated as proof of artistic review

**Actual source:** `engine/tools/art_bridge_film_qa.mjs#gatesFor` reads `qa/shots/<shot>/QA_RESULT.json` and accepts fields `mechanical_fixture_pass`, `art_registration_pass`, `artistic_review_pass` when a caller can supply matching `film_revision` and `scene`. This data is mutable/self-asserted; it does not authenticate a test process, actual frame range, reviewed evidence or independent reviewer. It can lead to a misleading `shots_qa` gate.

**Required repair:** A shot QA file becomes an **index** into verified raw frame evidence and receipts from registered test executors. Recompute results from actual metric outputs, immutable source assets, declared action/rig/camera contracts, frame samples and independently authorized artistic review; bind each metric to producer source hash, original input revisions, exact frame interval, evaluator version and evidence output hash. Never accept editable booleans as authority. Avoid letting a test process set its own independent human-review bit. User-adjusted thresholds must be approved, versioned and audited; no changing a tolerance just to green a sample. Include negative tests forging all true values, borrowing another shot's evidence, deleting sampled pixels, changing code after a QA run, and changing the approved art without updating the manifest.

### F083: Reusable repair-memory qualification can be self-asserted

**Actual source:** `engine/art_bridge/repair_memory.mjs#ruleQualification` regards a caller's `evidence_provenance==="GPT_PROVIDER_ART"`, two arbitrary differing SHA strings, `transfer_test.result==="PASS"` and truthy `unlike_subject` as enough for `QUALIFIED_REAL_PRODUCTION`. No verified file bytes, provider receipt, independent review or real unlike case are required by this function.

**Required repair:** Compute qualification only by resolving a signed/provenance-bound chain of **actual accessible before/after image bytes**, original request and source witness, provider output and authorized review, exact changed first-pass producer, registered test geometry, independent unlike-case result and negative boundary. A SHA field without matching bytes and a self-described PASS is never evidence. The learned rule must attach to the actual compiled **first future art request** when its applicability predicate matches and must alter a specified visible construction operation without contradicting source art or art design. Reject a rule that merely rewrites a caption, applies to one character name, or makes old samples better while unrelated first passes remain unchanged. No `QUALIFIED_REAL_PRODUCTION` before real provider and independent human evidence. Test forged hashes, duplicated images, fake provenance, fake `transfer_test`, wrong family, absence of actual first-pass change, and a contradiction with a source witness. Record the new rule revision and invalidate only affected downstream requests.

## 11. F084–F087 — Fail-safe execution across money, crashes and concurrency

### F084: Provider retries can duplicate paid work or lose its outcome

**Actual source:** `engine/art_bridge/art_intake.mjs#submitJob` calls `provider.generate/edit` in an immediate retry loop for 429/5xx responses, with `PROVIDER_REQUEST_RECEIPT.json` and `PROVIDER_RESULT.json` written separately. If the external service completed but the response timed out/crashed, the repo may have no result and can call again. A local payload hash is **not** a provider-guaranteed exactly-once transaction.

**Required repair:** Persist a unique immutable `EXTERNAL_REQUEST_PREPARED` record **before** network send, with local request ID, provider/model/endpoint, payload and attachments hash, authorization/budget cap, charge policy, stage lineage and any officially supported provider idempotency key. On return persist provider request ID/status and original response proof before allowing candidate selection. Distinguish `DEFINITELY_NOT_SENT`, `KNOWN_REJECTED`, `COMPLETED`, and `OUTCOME_UNKNOWN`. If a response is lost after a possible send, stop in `EXTERNAL_OUTCOME_UNKNOWN`; use supported provider reconciliation/status API or ask operator before spending on a possible duplicate. **Never blindly retry an uncertain paid operation**, even on 5xx/timeout, unless provider documents true request-level idempotency. Test crash before send, after send before response, after provider success before local commit, 429/5xx, process restart, duplicate start from two clients, and reused payload under another film. Use mock provider only; no chargeable calls.

### F085: Separate mutable logs and status pointers do not establish durable history

Existing `reviews/HISTORY.jsonl`, `OUTBOX_INDEX.json`, `CURRENT.json`, and per-shot QA are not a shared provenance graph. Implement Section 9's append-only, verified journal; do not discard existing history. **Migrate** old records into a separate `IMPORTED_LEGACY_UNVERIFIED` event stream with original file hashes, honest provenance and no automatic promotion to authenticated production approval. `verify` must detect deleted, reordered, altered, duplicated and cross-linked events; `resume` must stop rather than synthesize missing past decisions. A standalone index refresh cannot change qualified status.

### F086: Check-then-write paths have no demonstrated cross-process transaction control

`selectStageCandidate` checks `existsSync` then writes selection; `writeStageSelection` checks for a file before writing; `writeCurrent` uses a PID-temporary path. These are not sufficient to prevent two simultaneous Claude sessions from racing on the same job/generation. Implement stage-scoped leases/fencing tokens, transactional selection, exclusive artifact publication and generation checks. Verify two processes racing to select **different** candidates: exactly one selection is committed; loser sees the current winner and cannot silently overwrite. Verify crashes after acquiring a lock, stale-lock recovery and concurrent revision changes. The controller must never confuse "a file was written" with "a stage committed".

### F087: Test authority must be structurally isolated from production authority

`approvals.mjs#testTrust` reads only `ART_BRIDGE_TEST_TRUST=1`; QA may waive some checks under that environment variable. Preserve diagnostic fixtures, but require a **different explicit run type** and sandbox data namespace for all test-trusted operations. The production gate must reject any diagnostic/test-derived lineage even if a human or environment changes the labels later. A real provider call, real approval receipt, or FINAL_FILM certification must not be reachable from test trust, overridden model capability flags, `provenanceOverride`, falsified CLI `--source`, or copied diagnostic output. Negatively test calling every public entrypoint with production film paths while setting these flags; assert zero paid calls and zero production certification.

## 12. F088–F090 — Source-to-pixel trace, readiness and bounded external effects

### F088: A clean trace must prove rules/control inputs **actually reach consumers**

Extend the Section 9 lineage links down to every evaluated visual choice:

`source film/region → F01–F80 method observation → applicability predicate → concrete design decision → exact compiled prompt/attachment → returned candidate → human-reviewed pixels → measured art coordinate system → rig/state/camera/scene graph → evaluated absolute Neutrino frame → compressed output → whole-film evidence`.

For each active method or Experience Director decision, record its consuming **function and observed changed output**. Run differential tests on contract revisions: perturb a specific requirement and verify an appropriate request field, asset demand, state behavior or rendered pixel actually changes, or fail `INERT_CONTROL`. Merely logging a rule, recording a method name or generating an extra JSON field is not enough. Preserve the prior "no pre-imposed tubular anatomy" rule: design-specific visual topology is **art-directed first**; only then does measured fitting bind pivots, views, elbows, joints and contact patches. If approved art cannot perform a needed motion, return a typed design/feasibility requirement upstream rather than forcing deforming ugliness or silently deleting an action.

### F089: No end-to-end preflight or production authorization checkpoint was demonstrated

Build a **fail-closed production preflight** that uses real hashes and receipts, not prior chat assurances. The preflight outputs a table for all stages with `READY / BLOCKED_SOFTWARE / BLOCKED_ART / BLOCKED_HUMAN / BLOCKED_AUDIO / BLOCKED_PROVIDER / BLOCKED_CLAIM / STALE`. Do not claim `READY_FOR_PRODUCTION` until the machine verifies all required categories. Before any **paid** provider or long real-film render, require an explicit user-authorized run manifest with job count, intended provider/model, spending ceiling, expected outputs, input digest, checkpoints and rollback/restart behavior. Ensure that an authorization for one batch cannot silently extend to new images or retry spending. Build the mechanism now, but do not create a chargeable run or approve it on Manmeet's behalf.

### F090: One screenshot or diagnostic film cannot qualify whole-film artistic quality

The final capability gate must sample intelligently **and** verify coverage of all 7200 frames, every promised state/action/claim/visual mechanic, every changing region, every transition and every sound cue. Record traceable quantitative checks (e.g. contact, camera bounds, state graph, image consistency, coverage) and separate full-speed human perceptual review for rhythm, readability, style/Whole Look, face/hand/weight, emotional progression and explanation truth. A frozen frame may be correct during a declared pause; an inert action interval is not. For each failure, link observed frame ranges and actual input hashes to **the producer owning the violated invariant**, then make a producer-level repair and validate on unrelated material. No scene-specific hardcoded output correction qualifies a reusable class.

## 13. F091–F092 — Do not confuse GPT-in-ChatGPT with an API adapter

### F091: The configured API is not the entire intended user-operated GPT art path

**Actual source:** `engine/art_bridge/providers/image_provider.mjs#discoverProvider` recognizes only `IMAGE_PROVIDER=openai-images` with a configured model and API key. The original user workflow also permits **the user to take exact compiled ArtJobs into ChatGPT, use the installed current F01–F80 artwork skill, generate or edit artwork there, and return real image files to Claude for registration**. This is a genuine separate production route, not an automatically authorized API call. An arbitrary `ingest-master --file PNG --provenance GPT_PROVIDER_ART` must **not** be allowed to counterfeit provenance.

Implement an explicit `EXTERNAL_GPT_OPERATOR_HANDOFF` branch, with the **same universal art, design, source-witness and approval contracts** as the API path:

1. `export-gpt-job` prepares one immutable, self-contained `GPT_ART_HANDOFF_<ARTJOB>_<generation>_<stage>.zip` containing the exact molecular request text, current installed skill version/hash and applicable instructions, F-source witness **actual source image bytes** and crop/region directions, design decisions, intended medium, parent approved master/predecessor hashes, subject/style/mechanical constraints, needed alpha/masks/views and registration landmarks, image-size constraints, and a SHA manifest. No truncated prompt, invented witness, unknown required field or missing approved design is accepted.
2. Provide the human a plain `WHAT_TO_DO_IN_CHATGPT.md`: attach this exact job and images, load/verify the named current F01–F80 skill and required references, generate the requested original master/derived-state candidate, retain exact unmodified PNG(s), and record the model/session details if available. If ChatGPT cannot supply a cryptographically verifiable provider receipt, say `MODEL_ORIGIN_CLAIM_OPERATOR_ATTESTED`, not `PROVIDER_CRYPTOGRAPHICALLY_VERIFIED`.
3. `import-gpt-candidates` consumes only a user-supplied bundle tied to the exact `(film, ArtJob, generation, stage, source witnesses, predecessor)` with image byte hashes, real decoded dimensions/alpha, origin claim/evidence and an independently recorded operator submission. Import **does not** itself approve artwork. Store candidate bytes immutably; use F079 selection and F081 external human art review; then register/rig as usual. Do not silently accept another image, new drawing, hand-coded substitute, previous job's PNG, wrong stage, or user-edited receipt. If source origin cannot be independently authenticated, preserve the honest `ORIGIN_UNVERIFIED_OR_OPERATOR_ATTESTED` layer and require explicit manual review before any production use. Record exactly which provenance claims are verified and which are not.
4. Support real API generation as a separate optional path **only when configured and expressly authorized**; both paths meet at the same candidate validation and art/rig gate. Never demand that Manmeet buy API access merely to use the intended ChatGPT handoff. Never automate login/session scraping or claim the installed skill was used merely because a prompt mentions its name.

Test the complete offline handoff with a clearly labelled synthetic input and forged/missing/old/wrong-stage/cross-project PNGs; verify accurate provenance classification, pixel decoding, lineage and rejected bypass. During this code run **do not use real paid ChatGPT images as diagnostic substitutes**.

### F092: Self-declared image-model capabilities cannot establish actual capability

**Actual source:** `image_provider.mjs#OpenAIImagesProvider.capabilities` checks whether a configured model endpoint exists and then accepts the operator's `IMAGE_PROVIDER_CAPS` JSON **verbatim**. This proves model lookup, not necessarily reference limits, real editing, alpha output, requested size, source preservation or actual quality. A declared `multipleReferences:true` is not executable proof.

Classify each capability as `DECLARED`, `LIVE_VERIFIED`, `FAILED`, or `UNTESTED`. Production `submitJob` refuses any **required but unverified** capability, or requests explicit bounded canary authorization and checks a real output before promoting the API route. Never silently discard source witnesses or alter prompts, aspect ratio, resolution, background mode, number of references, or model choice to make a call succeed. Tests simulate a provider that claims edit+transparency+multi-reference but returns opaque/wrong-size files, and a provider that drops one reference, and assert the output cannot pass registration/production. Log capability provenance and version in the Stage 5 handoff. No paid capability probes in the current authorized code-only run.

## 14. Required state machine, failure classification and stable diagnostics

All stage transitions must be typed, logged and enforced:

```
NOT_STARTED -> READY -> RUNNING -> OUTPUT_PREPARED -> VERIFIED -> COMMITTED
                       |                          |
                       v                          v
                     FAILED                     REJECTED
BLOCKED_EXTERNAL / WAITING_HUMAN / OUTCOME_UNKNOWN / STALE / CANCELLED
```

`COMMITTED` means **mechanically verified handoff**, not artistically approved. Store `qualification_layer` separately: `DIAGNOSTIC`, `SOFTWARE_PROVED`, `REAL_ART_UNREVIEWED`, `REAL_ART_HUMAN_APPROVED`, `WHOLE_FILM_HUMAN_APPROVED`. No transition from test provenance to real provenance by editing a status string.

Every typed failure includes:

```
failure_id, run_id, stage_id, attempt_id, frame_ranges[], artifact_refs[],
first_observed_bad_output, expected_invariant, observed_measurement,
applicability_predicate, failure_class, root_producer_or_UNKNOWN,
suspected_mechanism, causal_evidence_refs[], rejected_bypass_paths[],
invalidated_downstream_nodes[], repair_owner, resume_from_stage,
retry_safe_boolean, external_spend_risk, reproduction_command.
```

Failure code categories distinguish `MISSING_AUTHORITY`, `STORY_FACT_OR_MECHANISM`, `DIRECTION_OR_ATTENTION`, `MISSING_ART_STATE`, `ART_STYLE_OR_DESIGN`, `PROVIDER_OUTCOME_UNKNOWN`, `REGISTRATION_OR_RIG`, `MOTION_OR_CAMERA`, `RENDER_OR_MEMORY`, `AUDIO_ALIGNMENT`, `QA_EVIDENCE_INVALID`, `LEDGER_OR_PROVENANCE_TAMPER`, `DEPENDENCY_STALE`, `EXTERNAL_HUMAN_REQUIRED`, and `UNKNOWN_ROOT_CAUSE`. A missing dependency must not be falsely relabelled a low-level render bug. On uncertainty, report `UNKNOWN_ROOT_CAUSE` and block further promotion; gather more evidence, never invent a repair explanation.

Enforce idempotent `resume` with an invalidation graph: if any upstream producer/art/design/script/audio/reviewer packet changes, identify exact affected descendants, mark them stale, preserve historical run evidence, and start new attempts with new digests. Previously good unrelated assets remain eligible only when their dependency closure truly does not change. Separate technical retry of transient idempotent work from genuine source-level repair and from missing human authority.

Use deterministic/logged seeds, UTC timestamps, pinned tool versions, source hashes and environment fingerprints. Prevent overwriting prior artifacts with mutable symlink/relative paths. Inspect disk, memory, process count, open browsers, encoding throughput and provider budget; stop safely before destructive resource exhaustion. Report measured performance instead of promising fixed resource budgets without test evidence.

## 15. Additional adversarial tests and the **actual production rehearsal**

Add the following IDs without replacing the existing 72 classes or P02-R01..R12:

| ID | Exact acceptance condition |
| --- | --- |
| P02-R13 | A complete typed S00–S09 diagnostic handoff graph is built; every handoff validates producer, input/output SHA, revision, schema and current dependency status; a missing/forged stage packet blocks the next stage. |
| P02-R14 | Frame `f` traces backwards through shot, action, attention, rig, state, approved asset, candidate, GPT request/source F-method, current script and actual originating receipts; deleting one ancestor yields an exact named blocker. Test on unrelated acting and machine/world families. |
| P02-R15 | Crash between write/flush/verify/commit, torn/altered/reordered event, stale lock, two concurrent writers and reboot replay cannot promote a partial artifact or invent approvals. Event chain detects tampering; index rebuild does not alter authority. |
| P02-R16 | Forged `INTERACTIVE_TTY` `attestation`, fake TTY, copied/replayed/wrong-scope signature, stale packet and approval revocation fail production. A diagnostic test key never qualifies real art. |
| P02-R17 | Editing shot QA JSON booleans to true, inventing test results, crossing a revision, and swapping frame files all fail film QA. Authenticated metrics and human review pass only their actual layers. |
| P02-R18 | Fake `ruleQualification` SHA strings, provider-provenance field and unlike PASS do not qualify learning; changed producer affects first-pass requests on unlike material and must not contradict source methods. |
| P02-R19 | Provider timeout after possible send halts at `OUTCOME_UNKNOWN`; no automatic second paid call. Mock provider crash points, duplicate workers, request-id reconciliation and spending cap all pass. |
| P02-R20 | Competing stage selections cannot both commit; immutable winner and complete generation/lineage must be proved under two real OS processes. |
| P02-R21 | Test-trust, stub, arbitrary provenance override, manual CLI `--source` and a 16×9-upscaled MP4 cannot cross the production preflight or review gate. |
| P02-R22 | Changing any effective rule, relevant story/attention decision or art design causes real downstream **request, motion-state or frame evidence** changes; an inert choice rejects with `INERT_CONTROL`. |
| P02-R23 | Simulated absent art, invalid canonical registration, unsupported turn, missing narration, uncovered edge, frozen required action and mismatched final audio cause correctly classified first failures with exact repair owner and blast radius. |
| P02-R24 | A replayed diagnostic two-minute rehearsal produces 7200-frame coverage, valid JSON event chain, continuous image-backed renderer output, expected QA stops, and an actionable operator `status/trace/why/resume` without manual log hunting. |
| P02-R25 | Archive extraction on a fresh checkout reproduces *every* claimed test and run trace; archive includes the production ledger schemas, migrations, runner, CLI, fixture data, exact source dependencies, logs and verified SHA manifest. |
| P02-R26 | External ChatGPT ArtJob export/import preserves complete F01–F80 source/skill witness bytes and stage lineage; wrong/stale/missing/opaque/arbitrary imported PNG fails; operator-attested provenance is never falsely upgraded to cryptographic provider proof. |
| P02-R27 | Declared API capabilities without executed positive evidence cannot pass the live-capability requirement. Fake edit, transparent, multi-reference and requested-size support refuse output promotion. |

**Rehearsal specifics:** Run S00–S09 with at least **two unrelated motion families** (character with grip/cloth/weight acting, and noncharacter mechanism/world/metaphor with camera/portal), combined in a two-minute **fully labelled diagnostic** film with real browser image layers, not primitive substitute final art. Include simultaneous actions, a portal, camera changes, scene handoffs, timed audio diagnostic fixture and an intentional failure in each major stage. Show that `why` reports the first causal failing producer; repair the **generic** producer and re-run, proving unlike transfer. A system-only rehearsal may use simulated human/provider evidence **strictly in a segregated diagnostic namespace**. Real-art and human-review gates must remain blocked in the real production preflight.

**No premature paid production:** Following diagnostics, produce a *read-only* production readiness preflight. Do not generate original paid artwork, approve the user story, or do a full paid/live render until Manmeet has independently reviewed this run's ZIP and explicitly authorized the first bounded production canary. A canary must use a small genuine GPT art family and measured live evidence before scaling all jobs; canary failure returns to producer repair, never broad art spending.

## 16. Proof packaging, source trace and stop condition

Produce `HYBRID_V2_P02_REPAIR_AUDIT.zip` from the live fixed tree with:

1. `AUDIT_P02/BASELINE.md`, `NEUTRINO_SOURCE_RECONCILIATION.md`, `FILE_CHANGE_MAP.md` (old→new producer, exact lines), `REVISION_DEPENDENCIES.json` and before/after source hashes;
2. Full F001–F072 + **F073–F092 and any later discoveries** failure ledger (no missing/no optimistic green) and a **per-row actual call-path trace**, upstream predicates, negative, positive and unrelated transfer evidence;
3. all changed source files, original test files, new tests, locked dependencies, test fixtures, browser/FFmpeg versions, source-witness provenance, actual executed stdout/stderr/exit codes, file-level SHA-256 manifest and independent extraction test log;
4. real browser frame samples and film segments from **diagnostic-approved fixtures**, with provenance visibly labelled; per-frame hashes, 600-frame memory/performance log, crash/restart logs, exact frame count and FFprobe metadata; no pictures substituted for required real GPT art;
5. `AUDIT_P02/OPEN_ITEMS.md`, split into **SOFTWARE_DEFECT** (must be explicitly unresolved/fail), **MISSING_EXPORT_EVIDENCE**, **EXTERNAL_PROVIDER**, **HUMAN_REVIEW**, **RECORDED_AUDIO**, **UNAPPROVED_FILM_DATA**. For each, name owning producer, current block and exactly one next required action;
6. full commands to reproduce in a fresh checkout/extract; no truncated output or test count without test list;
7. `production/runs/<RUN_ID>` sample ledger, canonical stage-handoff packets, event schema/hash-chain verifier, immutable-artifact manifest, staged failure records, frame-trace index, `status/trace/why/resume` transcripts, crash/replay/concurrency tests and resource/spending safety evidence;
8. authentication threat model for human approvals, shot QA, unlike transfer and learning memory; independent test-key proof explicitly separated from real reviewer authority.

Before handing off, run an **independent adversarial audit from the publicly reachable entry points**: outbox export → compile → provider submit → candidate selection → intake → master/part/state/edge approval → rig evaluation → Neutrino browser frame → chunk render → final encode → film QA. Trace all alternate paths, direct APIs, environment variables and mutable receipt files; a registry name or function presence is not proof. Demonstrate attempts to bypass every gate fail closed.

**Stop and hand back evidence for an independent audit.** Do not start paid art production, assign human approval, choose a story on Manmeet's behalf, or announce “ready for production” on diagnostic evidence. At handoff write the following exact section headings, with truthful values:

```text
LIVE_REPO_HEAD:
SOURCE_PACKAGE_STATUS: FOUND_AND_COMPARED | NOT_FOUND
NEUTRINO_RUNTIME_STATUS:
PRODUCTION_CHROME_RENDERER_STATUS:
BOUNDED_MEMORY_600_FRAME_STATUS:
FULL_7200_DIAGNOSTIC_FILM_STATUS:
REAL_GPT_ARTWORK_STATUS:
HUMAN_STORY_DIRECTION_ART_APPROVAL_STATUS:
MEASURED_NARRATION_STATUS:
F001_F072_CLOSURE: <count by evidence layer, with links>
NEW_FAILURE_CLASSES_F073_PLUS: <IDs and status>
P02_TESTS: <pass/fail/blocked with exact commands>
INDEPENDENT_ZIP_REPLAY: <pass/fail/blocked>
PRODUCTION_LEDGER_STATUS: <persistent, replayable, tamper-evident yes/no>
FRAME_TO_SOURCE_TRACE_STATUS: <tested on two unrelated families yes/no>
HUMAN_APPROVAL_AUTHENTICATION_STATUS: <real authorized mechanism/blocked>
QA_AND_LEARNING_EVIDENCE_AUTHENTICATION_STATUS:
PAID_PROVIDER_IDEMPOTENCY_AND_BUDGET_STATUS:
P02_ADDITIONAL_TESTS_R13_R27: <pass/fail/blocked>
EXTERNAL_GPT_ART_HANDOFF_STATUS: <export/import and provenance tests>
REAL_PROVIDER_CAPABILITY_STATUS: <declared vs tested, no unapproved paid calls>
PRODUCTION_READY: NO unless every required production gate demonstrably passes
AUDIT_ZIP_PATH:
NEXT_HUMAN_ACTION:
```

**Interpretation:** `SOFTWARE_REPAIR_VERIFIED` is possible this run if its proofs really pass. `REAL_ART_QUALIFIED` and `QUALIFIED_FULL_FILM` are **not** possible until authorized provider output, factual/story and design approval, actual recorded narration/alignment, full live pixels and human full-speed final-film review exist. Do not call this an excuse: they are intentionally non-fabricable authority boundaries.
