# Motion-Native Hybrid V2 — independent implementation audit

**Audit date:** 22 November 2026 (India time).  **Scope:** the user-supplied `HYBRID_V2_IMPLEMENTATION_AUDIT.zip`, not the live `E:\MOTION_NATIVE_STUDIO_V1` checkout.  **Audited archive HEAD:** `392b0a98a20cfe8e6762f2284e7b0e26ea34d516`.  **Approach:** independent inspection of implementation modules, the binding 660-line specification, plans, evidence, fixtures and failure paths; local read-only reproduction of tests and targeted counterexamples. No engine or production source was edited.

## Decision in one paragraph

**The mechanical foundation is materially real; the complete GPT-art-to-motion production system is not complete. Do not begin a 74-image production run.** An actual Neutrino/GSAP/Chrome diagnostic composition renders at 1920×1080, 60fps, with mathematical articulation, grip, plant, art-state and camera mechanisms; this is not merely a slideshow generator. But key parts of the **real-art intake, registration, approval, method evidence and qualification handoff** are incomplete or incorrect. This audit found new, reproducible defects in addition to Claude's declared ten gaps. Their resolution is necessary before spending on polished image generation. The proposed laundromat story also lacks user approval, so its art requests are provisional.

## Independent verification and limitations

| Item | Audit finding | Meaning |
| --- | --- | --- |
| ZIP | Opened without archive errors; 1,325 listed source/evidence files verified by SHA-256 and byte count against `AUDIT/INTEGRITY_MANIFEST.json` (0 mismatches); archived revision `392b0a9` | Strong evidence that the uploaded snapshot is internally intact. |
| Automated tests | Ran `node --test tests/art_bridge/*.test.mjs` from extracted audit root: **35/35 passed** | Confirms the current supplied modules pass those *diagnostic* unit/contract tests. |
| Video metadata | Independently probed `hybrid_v2/work/stage2/scene_A_60fps.mp4`: **1920×1080; 60/1 fps; 600 decoded frames** | A genuine 10-second 60fps diagnostic video is present. It is not a finished film or approved art proof. |
| Motion | Examined `temporal.mjs`, `constraints.mjs`, `scene_graph.mjs`, `svg_parts.mjs`, `render.mjs`, and per-frame evidence | A real articulated/composited execution architecture exists. Contact and deterministic seek claims have meaningful fixture evidence. They have not yet been shown with complex GPT-authored sprites. |
| Artwork | `STAGE_3_ART_PROOF.json`, `art_outbox/` and code | **0 provider-generated art files; 0 approved canonical identities; 0 visually qualified cutout families.** Six compiled master *requests*, not six generated images. |
| Film | `STAGE_4_FILM_PROOF.json` and `films/hv2_film001/` | **0/7200 frames of the intended film rendered**; seven shots and 7200-frame planning coverage, not production coverage. Script, voice, alignment and full assembly pending. |
| F01–F80 | Verified `method_trace.mjs`, `write_method_trace.mjs`, the status JSON and compiled requests | All 80 source IDs are indexed. **48 image-authoring methods await provider pixels**, **16 have mechanical proof labels**, **16 have other unresolved statuses**. There is no evidence of completed artistic conversion for all 80. |
| Runtime | `render.mjs` uses the copied `nu.js`/GSAP hook with frame-indexed transforms | The preserved Neutrino path is used, not replaced by an image slideshow. Real movement still depends on properly manufactured and registered parts and states. |

The recorded Chrome pixel proof was run at an earlier code revision (`8939910` in several evidence files); the archive is HEAD `392b0a9`. Archive history says evidence was refreshed, but any *final* pass must be regenerated and bound to the exact tested source hash/HEAD. I reran the Node tests; I did not rerun the entire original Windows Chrome pixel harness in this Linux audit environment.

## P0 findings: prevent Stage 3 success until repaired

### P0-1 — Motion context is lost for **all 74 ArtJobs**

**Intended:** The image request should identify exactly which shots and frame ranges require a part, pose, expression, layer, camera footprint or transition, so GPT receives the same physical construction problem that the motion engine will solve.

**Actual:** Reading every `hybrid_v2/art_outbox/jobs/*.json` gives **74/74 with `motion_context.frame_ranges: []`**, although **69/74** jobs' `triggered_by` arrays contain actual frame ranges. Example `ARTJOB_MASTER_ines_master_8352db7b.json` has trigger `[900,1920]` but empty `frame_ranges`.

**Earliest defect:** `engine/tools/art_outbox.mjs#exportOutbox` generates *synthetic* missing-asset errors without frame ranges, calls `missingArtJobs()` to freeze the motion context, then copies actual diagnostic errors into `j.triggered_by` **after** context creation. Context is never recomputed. Other context fields also default to null/generic wording when real action data was available.

**Fix:** Derive requirements directly from the approved action/shot graph and actual `runCheck` errors **before** constructing jobs. Group by `(root_dependency, view, pose, expression, contact/occlusion topology)` where those distinctions require different pixels. Merge all frame intervals, preserve shot IDs, required sockets, approved joint locations and camera footprint. Declare a field `not applicable` only after proving no dependent action needs it. Refuse compiling an ArtJob whose triggers have frames but `motion_context.frame_ranges` is empty.

**Proof:** For the Ines master and every dependent hand/view/cel state, show exact nonempty intervals and compare the compiled request JSON to the source shot/event list. Perturb S02 grip/view timing, regenerate the outbox, prove **only dependent** ArtJob context and prompt hashes change. Repeat for a world-camera footprint.

### P0-2 — Six canonical masters are routed to the **wrong image medium**

**Intended:** A `MASTER` must be generated as a canonical identity against relevant style references and then used as the source image for all derived edits.

**Actual, independently reproduced:** The Ines job says `state_kind: MASTER`, but `medium.medium: TRANSPARENT_RASTER_CUTOUT_PART`. `routeMedium({kind:'MASTER'})` correctly returns `RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS`. **6/6 master jobs** have the wrong route.

**Earliest defect:** In `missingArtJobs`, when the asset is not in `doc.assets` yet, media routing falls back to kind `PART`, even for `g.spec.state_kind === 'MASTER'`.

**Fix:** Make planned state kind authoritative: MASTER → `RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS`; WORLD/CLEAN plate → opaque or layered overscan plate; CUTOUT/STATE → transparent registered edit of approved master; cel and vector assets follow their explicit motion mode. Compile must reject contradictory `(state_kind, medium)` contracts.

**Proof:** Assert every one of the six master requests has the correct master route; separately test PART, UNDERPAINT, WORLD_PLANE, CEL, TRANSITION_PLATE, VECTOR_PATH and TYPE.

### P0-3 — The ingest path does not complete identity registration and cannot close the review loop

**Intended:** Import a real GPT master once, establish a **measured** canonical identity frame and landmarks, visually approve it, then create registered child parts/poses/views that inherit the exact identity, socket coordinates, alpha and underpaint relationships. A reproducible approval receipt binds the accepted pixels and graph to hashes. Only then should the renderer accept it.

**Actual code:** `engine/tools/art_outbox.mjs#ingest` copies a MASTER PNG, gives it the arbitrary canonical box `[0,0,W,H]`, center pivot and `landmarks: {}`. It updates `doc.assets` but **does not update** the corresponding `identities[].master_sha256` (initially all-zero in the planned production manifest), identity landmarks or approval fields. `load_manifest.mjs` will then report `ART_IDENTITY_DRIFT` or `UNAPPROVED_ART`. For derived files, ingestion calls `registerPart` with the fixed identity landmarks, even though the canonical master was never fitted against those landmarks. It does not gate registration on an **approved** master. It collapses every non-master image to `kind: 'PART'`, even the **six transition plates** and **one underpaint job**, contradicting the explicit `TRANSITION_PLATE` and `UNDERPAINT` contracts. No review/approval command in `art_outbox.mjs` records the whole-look verdict and promotes asset, state, edge or identity review status; it simply says to set `approved_review_id` later. Subsequent exports have no complete resumption protocol for the newly approved master.

**Root problem:** The most important coordinate contract—the mapping **from GPT master pixels into the identity's planned landmark system**—has no complete producer. This is precisely the sort of mismatch that can turn generated components into disconnected puppet parts.

**Fix:** Add explicit `ingest-master`, `review-master`, `ingest-part`, `review-part`, `approve-state-edge`, `resume-dependent-jobs` operations. The canonical master review must select/measure named landmarks on delivered pixels and solve/store the permitted transform into canonical units; bind it to the master SHA-256 and identity record. The part import must use actual reviewed correspondences and report its transform, alpha, residuals, overlay and underpaint. **Preserve each source ArtJob's actual typed asset kind** (MASTER, PART, CEL, UNDERPAINT, MASK, TRANSITION_PLATE, WORLD_PLANE) instead of coercing everything to PART. When a review is accepted, atomically update identity hash, asset/state/edge review *receipt references* and dependency state; re-run manifest+motion feasibility. If any source pixels/landmarks/rig layout change, invalidate dependent approvals. Never auto-approve. Never allow derived generation before master approval.

**Proof:** Use one *real* approved master with named head, shoulder, elbow, wrist, pelvis and prop sockets; do a generated/edited hand and pose. Show the source pixels, canonical coordinate grid, overlay and difference, and a 3-frame state switch. Round-trip import → approval → manifest validation without manual JSON editing. Alter one master pixel or landmark: dependent approvals fail and re-manufacturing jobs are emitted. Run a deliberately off-axis hand edit: registration refuses until corrected.

### P0-4 — Production approval is only a nullable string; it is not checked against an actual review receipt

**Intended:** Prevent unapproved or stale art from getting into final renders.

**Actual:** `load_manifest.mjs` checks whether `approved_review_id === null`, not whether a real review document exists, is approved, has the right canonical identity, SHA-256, art-state/edge scope, valid overlays, reviewer and tested revision. The fixtures use the arbitrary string `diag_review`. A changed image with a freshly updated asset hash but the *same* old review string can pass this field check. Stage3 evidence calls this a boundary but does not prove a real approval workflow.

**Fix:** Separate `manifest_valid`, `mechanically_qualified`, `artistically_approved` and `production_ready`. Require on-disk approval receipts tied to immutable hash bundles for source master, part, mask, rig, approved viewpoint and residual image evidence. For production, reject unknown/stale approvals, diagnostic provenance and manually fabricated verdicts. Keep the reviewer decision explicit.

**Proof:** Negative test that (a) a random string, (b) a receipt bound to another asset, (c) a replaced PNG, (d) a modified pivot, (e) a changed pose edge each refuses to render for production. Positive control: legitimate reviewed asset renders.

### P0-5 — Provider adapter exists but **no production call path invokes it**

**Intended:** Either an authenticated provider runs the approved ArtJob and stores source/reference receipts and pixels, or an offline human submits the same exact request and ingests the response.

**Actual:** `engine/art_bridge/providers/image_provider.mjs` implements `.generate()` and `.edit()`. An independent source search found **no invocation** of those methods in production modules; only `NullProvider.generate()` is tested in a unit test. `art_outbox.mjs` supports `export`, `status`, `ingest` and checks provider capabilities, but has no `submit`/`generate`/`edit`/`poll` path. Configuring `IMAGE_PROVIDER*` alone cannot make the current outbox run images. The manual prompt/export route remains possible but not exercised end-to-end.

**Fix:** Add one explicit `art_outbox submit --job` path using the exact compiled request and verified references, both generated receipts and real provider output. Keep an equally robust manual-import route. Ensure image edit mode uses the *reviewed parent/master bytes* as a mandatory actual reference, not just a prompt mentioning its filename. Define and test provider capability failure, output format/alpha, idempotency/retries and receipt verification. Do **not** infer provider support from model name or claim its pixels exist before a real response.

**Proof:** With an authorized configured provider, submit one approved master request and one derived source-attached edit; verify actual request receipts, image hash, decoded alpha and source ancestry. Without provider, assert exact resumable WAITING status and no fabricated file. If live provider access is unavailable, mark this task BLOCKED rather than IMPLEMENTED.

### P0-6 — QA currently reports a green `pass` while required audio and artistic review are absent

**Actual, independently observed:** `hybrid_v2/work/qa_fixture_sceneA/QA_RESULT.json` has `pass: true`, `exit_code: 0`, **`MISSING_WORD_ALIGNMENT` in `missing_capabilities`**, diagnostic fixture assets and `reviewer_verdict: PENDING_HUMAN_VISUAL_REVIEW`. `engine/tools/art_bridge_qa.mjs#runQA` sets `result.pass` from motion/render errors and missing art only; it ignores those two named categories. Such a report is acceptable only when clearly labeled **MECHANICAL_FIXTURE_PASS**, never as production qualification.

**Fix:** Return explicitly separate `mechanical_fixture_pass`, `art_registration_pass`, `artistic_review_pass`, `audio_alignment_pass`, `whole_film_pass`, and a final `production_pass` requiring all applicable gates. Production CLI exits nonzero unless all are true, unless the operator explicitly requests mechanical-only diagnosis. QA must not unconditionally insert the generic “whole-look review has not been given” text once a real reviewed receipt exists; it must actually read the receipt.

**Proof:** A valid mechanical-only fixture passes *only* the mechanical gate; missing narration or a pending reviewer keeps production failed. An approved art scene with real measured cues and signed/scoped reviews is the positive control.

## P1 findings: do not call the remaining pipeline production-complete

1. **No orientation-constrained grip:** positional socket lock is proven, but grip orientation relative to the prop socket is not fully solved. Add both position **and angle** closure (plus reach, wrist limits and near/far layers) for a rotating handle, and prove it with actual painted fingers. Owner: `temporal.mjs` + rig/socket contract; currently listed in `KNOWN_GAPS_AND_BLOCKERS.md`.
2. **No automatic torso/root counter-balance:** a reach can be numerically accurate while the character appears to float or lean unnaturally. Design approved weight-shift/plant state tracks and contact solve in one family; compare a long reach and a lateral mass shift in actual art. Do not silently distort proportions.
3. **No actual vector morph topology comparator** and **no cast-shadow occluder/receiver compositor**; two of 15 negatives are explicitly PARTIAL. Refuse unsupported techniques or implement and prove their honest alternatives, no fake PASS.
4. **Art-state inventory is incomplete as a motion-to-pixel obligation:** `asset_state.mjs` does walk pose/view cuts and grip near/far dependencies, which is good; it currently labels `expression: ps?.id` (pose state) and takes `light: []` as a list of material IDs rather than a tested light-state contract. Define explicit expression, gaze, fold/garment, material-light and occlusion topology state keys, and verify actual pixel assets satisfy them at every required action interval. This avoids passing a front head with a pasted expression and unresolved occlusion.
5. **Method status evidence is not fully causal:** `checkMethodUses()` checks **export existence**, not actual decision-to-pixel dependence. A deliberately invented `F01` use naming the registered `compileArtJob` consumer was **accepted with zero errors**, independently reproduced. `write_method_trace.mjs` also constructs some `changed: true` records in its own proof mapping rather than computing a per-method semantic output diff; several method IDs share scene-level perturbations. That does **not** mean the 16 mechanical measurements are fake: it means the **method-by-method evidence attribution is weaker than the phrasing implies**. Require per-method source condition → read → output delta or provable provider prompt delta → actual image delta and reviewer decision, with negative controls. Image methods remain pending until real art.
6. **No successful real-art learning loop:** `repair_memory_applied: true` currently means an empty/zero-rule repair memory was loaded; `applied_repair_rule_ids: []`. Show a specific source image defect, corrected image, recorded broadly applicable condition, and a **different new subject** whose first-pass payload and pixels improve.
7. **Pending engine coverage:** F33/F47/F53/F77 information-density ownership and F38/F60 projection grammar lack real engine consumers; F19/F20 routing and F29/F49 variants lack scoped exercised proof. Treat these as conditional gaps; don't force every F-method to draw geometry, but do not declare style conversion complete.
8. **No full-film 7200-frame execution or memory/audio delivery:** scene-level 600-frame 60fps evidence is genuine; per-shot memory/unload/reproducible segment join, 7200 frames, scene continuity and measured narration/audio sync are not implemented or demonstrated. Qualify after real art.
9. **Unapproved story and S02 background-life action:** `films/hv2_film001/direction/EXPERIENCE_DIRECTOR_PROPOSAL.md` is a hypothetical laundromat economy concept with claims marked `[VERIFY]`. `S02_room_life` is an unsupported procedural action. Do not mint costly final art on a story Manmeet has not approved. Keep Experience Director V1 responsible for script → truth/claim ladder → spectator/shot experience → visual invention → timing.
10. **Method-request completeness:** the compiled Ines master uses F01, F05, F52, F64 and two distinct real style images, which is a meaningful *request construction* result. It is **not** proof that all applicable F-rules were used or that the resulting artwork would look correct. Review method applicability per asset and prove the source-conditioned output on actual images before scaling to all six families.

## The correct production pipeline and stop gates

1. **Story & Experience Director:** user-approved topic/script, researched truth, narrative pressure, exact actions/physical causality, 60fps shot score and measured narration cues. **STOP** if story not approved.
2. **Art/motion contract:** actor anatomy and machine/socket identity, rig, pose/view/expression/lighting state inventory, camera footprint, contact constraints and dependency spans. **STOP** if the engine cannot support demanded shot motion.
3. **Canonical GPT masters:** compile relevant F-knowledge and source witnesses, generate *actual* master images, review sophisticated art at native resolution, measure canonical landmarks, approve immutable master. **STOP** on wrong silhouette/art quality or missing identity data; no child edits yet.
4. **Derived manufacturing:** each hand/arm/expression, alternate view, interaction, mask, underpaint and transition artwork is a source-attached edit of that **approved** master. Import with alpha and measured landmarks, solve transforms, compare rest overlay and motion state, review. **STOP** if the first complete character fails quality; don't create 74 jobs blindly.
5. **Live assembly:** registry loads verified pixels; scene graph binds registered parts to Neutrino-rendered joint/state transforms; solve position+orientation contact; camera, effects and transition owners are independent. Render a contiguous, demanding *real* qualification interval and a contrasting world/mechanism interval.
6. **Questions/repair memory:** on visible mismatch, classify root stage, fix its producer/master/state (not scattered coordinates), record the rule, demonstrate transfer to an unrelated subject and rerun dependent shots. All rule effects need source-backed before/after pixels.
7. **Full film:** render exact 7200 frames, 1920×1080 at 60fps, match narration timing and SFX; verify contact/quality across entire film, segment joining, memory, audio sync; export MP4 + editable assets/manifests/receipts.

### Highest-leverage next step

**Do not send six masters or 74 requests to GPT yet.** Repair P0-1 through P0-6 and run an **honest one-identity bridge pilot**: one polished character master, one foreground hand/prop mechanism, a profile view, one expression, one hard grip, one release, a brief camera move. Use actual provider art only after story and the design contract have been approved. This pilot must be original and source-conditioned, not a generic cartoon. Qualify by observing pixels, motion, joint ownership, stable identity, and 1/10-scale silhouette before scaling. A successful pilot demonstrates the *connection* between GPT art and code motion; it does not prove perfection of all future subjects.

## Exact corrective instruction to paste into the existing Claude Code session

> **HYBRID V2 INDEPENDENT AUDIT — CORRECTIVE STOP GATE.** Work against the **live** `E:\MOTION_NATIVE_STUDIO_V1` repo, not a copied ZIP. Do not proceed to costly provider generation, claim Stage 3 success, approve the unapproved laundromat story, or start a 120-second render. Read `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md`, `HANDOFF.md`, and the attached independent audit report `INDEPENDENT_HYBRID_V2_AUDIT.md` in full. Take a scoped recoverable checkpoint after inspecting the worktree. Source code is authoritative; diagnostic green tests are only mechanical evidence.
>
> First reproduce **six P0 failures** from the audit with focused failing tests using actual code interfaces: (1) all ArtJobs have empty motion frame ranges despite real triggers; (2) all six masters route to CUTOUT_PART, not canonical MASTER; (3) ingest-master neither registers canonical landmarks nor synchronizes identity.master_sha256 and there is no complete review/resume flow; (4) approval IDs are non-null strings without hash-scoped review receipts; (5) provider generate/edit exists but no production command invokes it; (6) QA says PASS despite missing word alignment, unreviewed art and diagnostic provenance. Keep negative tests in the repository.
>
> Implement P0 fixes **at the earliest producer**, with explicit APIs and invariants exactly as specified in audit sections P0-1..P0-6. Do not repair by manually editing 74 JSON files, retyping art coordinates, flipping PASS flags, relaxing reach/alpha constraints, or inserting generic artwork. Preserve `engine/runtime/nu.js`. Complete master pixel→canonical registration, approval receipt bound to exact hashes, dependent invalidation, proper medium routing and frame-range construction **before** any derived ArtJob is considered ready. Wire a real provider `submit` path or explicitly keep it BLOCKED; test offline manual ingest with real PNG and reviewed landmark inputs. Recompute the manifest and method evidence using executed perturbations, not declared consumers.
>
> Report a concise **P0 repair table** with failing test before, changed files/functions, passing test after, exact positive and negative results, and a one-master/one-hand/one-pose view-state import walkthrough. Then stop and export a new *read-only audit ZIP* containing those changed modules, tests, actual receipts and no fabricated style images. Do not move to 74-job production or Stage 4 before the independent re-audit. Preserve existing unrelated work.

## Audit epistemic boundary

This report is a concrete independent **source and evidence audit of the supplied ZIP**. The current Windows checkout may have changed since its export. I have not observed a real GPT asset completing generation→approved master→registered moving rig→qualified production; that is the remaining decisive proof. No one can honestly certify a polished two-minute Kurzgesagt-level result from diagnostic circles and a successful JSON schema alone. Conversely, the verified Neutrino compositing, constraints and 60fps capture are substantive progress; deleting that architecture and starting over would discard proven work.
