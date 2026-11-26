# THE BETTER ONE — FIRST FILM PRODUCTION MASTER (V1)

**Status:** 2026-11-25 production decision. **Authority:** latest user decisions in the uploaded YouTube Viral Playbook conversation supersede older Money Machines / one-style-only animation plans. This is an approved *direction of work*, not a fabricated approval of a specific script, illustration, model, paid provider call, or film. Every actual creative asset requires its normal real approval.

**Production source baseline:** `repair/p05-creative-packet-integration` at evidence HEAD `711ed0fe715d893a56e1aa8fcbed1c89fd702055`; last actual code `945464697dc680956bea670e543c8e0c7beebf1b`. New implementation work should branch from this source on an isolated production branch. Do not use `main` as code baseline. P05 full regression and final chained proof are NOT complete. Its last code has zero qualified real GPT art or dialogue performance.

**First feature:** *This Restaurant Is Packed. Why Is It Dying?* with Mia, working target 8–12 minutes (story may justify an 8–13-minute final). The duration is chosen by editorial pacing; do not silently stretch to 20 minutes. The final video is the deliverable, not a new universal animation system. Every 8–10-second iteration uses an actual frame interval from this feature and becomes accepted film footage.

> **CURRENT E01 QUALIFICATION UPDATE (2026-11-26):** This V1 master contains historical 8–10s clip examples. The current binding process is PRODUCTION_OPERATING_STANDARD_V1.md and the E01 Episode State; latest V0.4 first-opening candidate is 32.5s and first actual selected qualification is **13s absolute [180,960), local [0,780)**. All new episodes choose an artistically meaningful contiguous extract rather than hard-coding 13 seconds. V0.4 is PROPOSED and lacks final user creative approval and real P06 pre-art proof.

## A. Creative product — what a viewer buys with their attention

**Brand:** The Better One: original character-led strategic rescue/discovery adventures about money, competition, technologies and everyday systems.

**Promise:** Follow a human dilemma, get emotionally invested, enter an exhilarating but effortless decoding of the hidden machine, experience a surprising and intellectually honest "better move", and finish feeling more capable, entertained and eager for the next story. Think sophisticated insight in child-simple language, *never* a compulsory intelligence test.

**Core dramatic engine:** Character + clearly understandable stakes → complication and a failed obvious move → visible evidence → accelerated decoding → model the actual causes/constraints → test strategy and second-order effects → credible better move (or earned honest failure) → real emotional payoff. No fake "probabilities" or miracle financial results. Business simulation assumptions are visibly labelled hypothetical.

**Creative language:** A coherent original F01–F80-informed 2D illustration/acting identity, careful cinematic framing and emotive acting, memorable freeze-frame introductions and flashbacks, recurring original 3D host who physically enters the 2D story, sharply organized original animated 2D/2.5D motion graphics for the decoding, strong voice/acting/audio. 3D is used to improve story and host interaction, not because every object should be modeled. Never reproduce a third-party creator's exact characters/compositions.

**Channel engineering KPI:** Accepted, publishable on-screen seconds with correct art, acting, comprehension and music—not raw tests, AI credits or generated asset count. **Channel editorial KPI:** an informed viewer spontaneously understands why they clicked, can describe the new insight, remembers the character/turn, and wants another Better One story. Actual audience performance must be learned post-release.

## B. One film, three simultaneous but coordinated workstreams

**Track 1 / Creative (GPT + human):** audience promise and packaging; credible source dossier; full Mia narrative; value blueprint; line/dialogue script; recorded scratch dialogue; scene-level Experience Director V1; all major shots, action phases, emotion, contact, continuity, camera, sound, editing and 2D/3D/graphics render routes; exact CREATIVE_PACKET v1.1.0. Engineering cannot invent the story.

**Track 2 / Engineering (Claude + P05):** reconcile stale `CLAUDE.md` and `HANDOFF.md`; inspect P05 last code; run bounded final regression and prove clean on same frozen SHA; real packet importer/preflight; map first-feature action and art demands into supported producers; close only blockers required by real Mia shots; build host pass compositor; preserve Neutrino and current art-first registration.

**Track 3 / Actual assets (GPT/art review + Blender/Claude):** approved Mia and other 2D masters, original F01–F80 construction, actual part/cel/face/mouth/underpaint states, real dialogue, one separately reviewed 3D host mesh/rig and a small reusable performance library, approved restaurant world and decoder visual library. Can begin identity/mood exploration in parallel, but **final generation/registration of dependent assets waits for the approved creative state requirements and pre-art feasibility**.

Avoid serial waiting: GPT develops the real film while engineering proves P05 and prepares clean tooling; Claude must not lock shot-specific assets before actual creative decisions arrive.

## C. Full architecture — one director, one film clock, specialized image/motion routes

~~~mermaid
flowchart TD
 A["YouTube demand + 3 title/thumbnail promises"] --> B["Sources + value blueprint + Mia screenplay"]
 B --> C["Experience Director V1 — every shot and performance"]
 C --> D["CREATIVE_PACKET v1.1 — source hashes, scene/action/art/media references"]
 D --> E{"P05 validation + PRE-ART feasibility"}
 E -- unsupported action / missing state --> C
 E -- approved and feasible in principle --> F["Art DAG: canonical masters, parts, expressive views, masks, worlds"]
 F --> G["GPT authentic illustrated image jobs + human approvals"]
 F --> H["Blender stylized 3D host: mesh, bones, face keys, stage and camera"]
 F --> I["Programmatic decoding: charts, variables, worlds, symbols, matte transitions"]
 G --> J["Registration + rig fitting + exhaustive per-frame physical and paint feasibility"]
 H --> K["Real 3D render with alpha/depth/shadow matte + matching camera"]
 I --> L["Frame-addressed SVG/canvas/motion-graphics renderer"]
 J --> M["Neutrino 2D animation of real approved pieces"]
 K --> N["One master 60fps compositor, shot timeline, audio"]
 L --> N
 M --> N
 N --> O["8-10s real-film segment render and artistic review"]
 O -- defect --> P["Fix earliest art/rig/motion/composite/story producer"]
 P --> O
 O -- approved --> Q["Same approved footage in film ledger; produce next interval"]
 Q --> R["Complete 8-12 min episode, final A/V, human approval, packaging"]
~~~

- **Film time**: integer film frame at 60 fps; 10 s = 600 frames, 8 min = 28,800 frames, 12 min = 43,200 frames. Every clip has exact absolute [start,end) film frames and no ambiguous reset.
- **Scene time**: clip-local frame = absolute frame − clip start; all audio and animated outputs translate through the same mapping. A jump cut is explicit.
- **World space**: 2D canonical pixels in compositor with source-landmark/part-local/rig-local/world/screen transforms. Blender uses a documented 3D world-to-compositor camera matrix, calibrated focus/lens/origin/scale and shared anchor planes. No arbitrary "position until it looks close" transforms.
- **Shader/grade**: palette and material direction shared across original 2D art and host toon/PBR treatment; test host silhouette, value scale and light direction against actual 2D frame. Not a generic color overlay hiding mismatch.
- **Everything rendered**: each shot uses explicit layers/passes ordered in depth, renderer ID, image/version hash, source decision and visual function.
- **Media**: Neutrino/Chrome remains primary 2D renderer. Blender renders real 3D host/objects as RGBA plus appropriate shadow/depth/object-ID matte passes into deterministic numbered sequences (EXR or lossless PNG as appropriate). Animated diagrams run in current SVG/DOM/Neutrino infrastructure; adopt Motion Canvas or similar only if it demonstrably supplies a missing graphics operator. Final compositor includes Blender outputs, registered 2D art/graphics, narration, SFX/music on one timeline. Remotion is optional edit layer only, not a forced replacement. FFmpeg has final mux and verification.
- **Generated video**: Higgsfield/Seedance is an optional shot-specific *flattened performance-video* vendor. It is NOT a source of editable 2D rig joints or semantic 3D mesh. It enters via a separately approved raster-video clip with duration, masks, grade, location, sound and consistency checks. No paid call until price quote and budget approval.

## D. Which animation technology does which job?

| Asset/shot requirement | First-choice actual producer | Known failure/risk | Mandatory gate |
|---|---|---|---|
| Mia's 2D acting / walking / arm movement | Approved split image/cels → P05 registration and fitted Neutrino rig | Single master image does not contain hidden arms, joints or turn art | Real part pixels and edges under action and moving-frame visual review |
| Face dialogue / blink / eye/gaze / reactions | Approved layered face controls and cel-state families | Sparse rest/mid/open mouth alone insufficient for cinematic dialogue | Match measured dialogue/phoneme or consciously directed limited-mouth scheme; human review |
| Difficult head/torso turns, special acting | Source-attached alternate cels/views, mesh with approved contour limits; extra drawn inbetweens when needed | Flat front face rotated as fake 3D, distorted elbows | Part/cel identity + edge+view trajectory through the entire movement |
| Hand contact, props, weight | Neutrino typed physical action + actual HAND drawings, grip front/back layers, joint constraints | Contact socket mathematically correct but fingers look wrong | Painted palm/handle overlap, contact hold/release, anatomy and prop motion at every held frame |
| Restaurant 2D environment | Genuine layered art, camera planes, shadows, clean plates, occluders | No overscan, wrong scale, unpainted areas, ghost shadows | Full camera path coverage and viewer-native visual checks |
| Cinematic freeze-frame / memory montage | Shot-editor in Neutrino/Chrome + original timed montage art | Generic preset montage does not earn emotion | Purpose, emotional timing, actual held composition, music and match cut |
| Decoding/strategy motion graphics | Verified parameters + animated symbols/text/diagrams with one frame clock | Beautiful numbers imply false causality or fake certainty | Calculated parameter traces and corresponding animated state pixels |
| Recurring 3D host | Real Blender mesh, armature and mouth/face shape controls; retained Blender project | GPT 2D image mistaken for 3D model; bad materials/acting | Walk/talk/point/turn performance in camera with topology and render passes |
| 3D host stepping into 2D scene | Blender film passes + calibrated 2D composite + world proxy contact/shadow + occlusion mattes | Floating/incorrect perspective; shadows/glass/foreground artifacts | Registered camera and foot contact; behind/in-front matte order and actual mixed frame |
| Unique elaborate cinematic insert | First ask if approved cels/Blender can do it; paid model only if needed | Clip identity drift, impossible editability and cost | Quote, approved references, frame inspection, fallback path |
| Soundtrack and dialogue | Real voice/sound buses, measured word alignment, frame-tied SFX, verified mux | Time-shifted cues, silent final, lip mismatch | Final decoded MP4 audiovisual review |

## E. What already exists elsewhere — and what we actually borrow

**Live2D Cubism:** separated PSD parts → ArtMeshes/deformers → key parameters and changing draw order. Especially strong evidence that source-origin layered images can be animated without redrawing every frame. It also proves material separation and manually corrected meshes are essential, not optional. Official docs:
- https://docs.live2d.com/en/cubism-editor-manual/psd-import/
- https://docs.live2d.com/en/cubism-editor-manual/concept-of-artmesh/
- https://docs.live2d.com/en/cubism-editor-manual/draworder/

**Cartoon Animator 5:** official Photoshop/SVG character-part pipeline, freely placed bones, sprite hand/mouth alternatives, facial and body controls, PSD round-tripping:
- https://www.reallusion.com/cartoon-animator/2D-character-creation.html
- https://manual.reallusion.com/cartoon-animator/content/resources/5.1/07-PSD-In/PSD-Importing-Methods.htm

**Spine:** PSD-separated layers, mesh deformation, skeletal rigs, skin attachments:
- https://us.esotericsoftware.com/spine-import-psd
- https://us.esotericsoftware.com/spine-images

**Moho:** Smart Bones, switch layers for mouths and poses:
- https://www.lostmarble.com/moho/manual/switch_layers.html

**Blender:** conventional Rigify armature setup, animation actions, face shape keys, glTF exports, RGBA pass rendering:
- https://docs.blender.org/manual/en/latest/addons/rigify/basics.html
- https://docs.blender.org/manual/en/5.2/addons/scene_gltf2.html
- https://docs.blender.org/manual/en/5.0/render/eevee/render_settings/film.html

**Motion Canvas / Remotion:** code-driven 2D information graphics and audiovisual timeline assembly, not substitutes for real advanced character rigging:
- https://motioncanvas.io/docs/quickstart/
- https://www.remotion.dev/docs/video-and-audio

**Higgsfield:** separate video-generation APIs, and an independent source-available code-based filmmaking engine `higgsfield-ai/higgsfield-video-engineer`; don't confuse this with a free programmable Seedance. Its internal film render path may supply ideas for GPU chunks/material previews but is not a drop-in replacement for P05 or the Blender host.
- https://github.com/higgsfield-ai/higgsfield-video-engineer
- https://open.higgsfield.ai/models/bytedance/seedance-2.5/image-to-video

**Decision:** borrow the verified part/mesh/cel/animation **principles and transferable algorithms**, not a second proprietary editor dependency by default. If the actual Mia actor reveals unacceptably expensive pose labor, run one focused feasibility comparison on a real approved Mia drawing against a professional rigging tool. Do not rebuild Moho, Live2D and Spine from scratch, and do not introduce four competing character runtimes.

## F. Hard 2D artwork → actual motion contract

### F1. Before image generation
For each directed shot and action, GPT emits:
- Stable identity and canonical master design requirements;
- Exact body and independent part hierarchy **semantically** (without imposing generic visual limb geometry);
- action-phase graph with pre/post conditions, contact/weight, gaze, expressions, voice and camera;
- every needed **pose, view, HAND, EYES, MOUTH, expression, material, light, occlusion and paint/hidden-surface state**;
- movement route (rigid, articulated, cel, approved deform, 3D, programmed diagram, optional specialized generated clip);
- pre-art capability refusal for unsupported motion operations;
- exact source/style construction methods and intended onscreen result.

### F2. Source-identity artwork
For each character: approve one canonical master/turnaround; derive each additional state as a source-attached generation/edit; never independently prompt dozens of unrelated "same person" variants. Preserve the original images plus sha256. Use a layer decomposition review board: silhouette, torso, near/far upper and lower limbs, hands front/back, eyes/lids/pupils, brows, mouth states, hair, clothing, underpaint, masks and occluders. Actual demand depends on the directed performance—no blanket 80 layers per actor.

**Critical hidden-paint problem:** segmenting a finished flattened PNG is insufficient for independent articulations because pixels behind its arm/neck/leg were never drawn. Require GPT to paint the actual hidden surface / source-attached sibling cel, and verify during turn/reach. Auto-masks can help find visible edges but cannot invent approved hidden anatomy.

### F3. Registration from real pixels
Human-reviewed landmarks and sources, measured pivots, crop/source-to-canonical transforms, rig topology derived from actual art proportions, image alpha, near/far draw order, seam/paint overlap, contact patches, source-to-source identity checks, actual channel/edge approvals. Keep all coordinates in explicit spaces. Joint solver may fit and reject; it may not stretch or redraw arbitrary art. Any impossible inbetween generates a concrete new-art-job or a director-approved restaging request.

### F4. Motion and review
Directed performance curves, anticipation/hold/recovery, weighted support, gait/contact, gaze reaction, lips tied to measured dialogue, secondary follow-through; actual Neutrino renders of approved pixels. **Every actual required action frame** is checked for physics/paint feasibility. Key held states get human inspection at native resolution. A correctly moving outline can still be ugly—such an outcome fails artistic approval.

### F5. The repair rule
Find the earliest wrong producer: art/cel deficiency vs landmark misregistration vs rig geometry vs state timeline vs Neutrino motion vs camera/occlusion vs audio vs story direction. Change the correct producer; preserve approved unaffected assets and requalify downstream. Do not add a scene-specific visual patch to hide the same failure class.

## G. The 3D host is a dedicated reusable *character*, not a generic effect

1. Creative director approves original host concept, silhouette, face/material palette, expression and recurring personality, and how the host enters/recedes from the 2D world.
2. Make a **genuine complete 3D mesh** with usable front/side/back topology, costume/shoes/hands, separate facial controls and normal/weight maps. A generated 2D image cannot by itself become this.
3. Fit Blender armature (Rigify or qualified alternative), weights, IK feet/hands and blend shapes/shape keys for emotion and lip sync. Record a clean .blend master and optional GLB.
4. Build reusable **performance assets**: neutral breath/idle, walk-to-stop, gaze shift, point, lean/inspect, speak, startled reaction, hold and exit. Per-episode acting remains unique.
5. Align orthographic or deliberately matched perspective camera, 3D ground proxy, host scale and gaze targets with 2D film camera. Prefer controlled orthographic/stylized view for the first crossing to reduce calibration and lighting risk.
6. Render first approved 8–10-second host performance with RGBA alpha, matte IDs, depth proxy and grounded contact/cast shadows. Use one Blender frame for each film frame; verify repeated frame seek determinism.
7. Composite host passes between appropriate 2D world/foreground occlusion layers, with coherent palette, shadow falloff and perspective. Test foot planted, hand reaching into a 2D object proxy, foreground item crossing in front of host, head and frame crop.
8. An edit to the host script must be expressible as new pose/facial/audio keys without re-generating the mesh from scratch.
9. Evaluate optional Three.js live GLB rendering only after Blender-pass route works; the latter is easier to debug in existing Neutrino/Chrome compositor and still retains full editable 3D source.
10. If no professional-looking mesh/performance can be produced with available tools and time, report that **3D_HOST_ASSET_BLOCKED** rather than replacing him with an unapproved flat PNG.

## H. The strategy decoder uses *real calculations*, not fancy fake charts

Every reveal has:
- Input variables and units (table turnover, covers, average ticket, food cost, labor scheduling, rent, wastage, contribution margin, debt if used).
- Data provenance: **REAL_DOCUMENTED**, **FICTIONAL_MIA**, **HYPOTHETICAL_PARAMETER**, or **MODEL_DERIVED**.
- Exact formula or simulation dependency and model version. Update one input → dependent quantities recalculate and the rendered chart/bar/counter/world consequence changes in corresponding frames.
- Explicit assumptions and scenario ranges; no invented success odds or exact "we fixed it" financial promise.
- Strong visual staging: a physical clue becomes a dynamic diagram; causal explanation remains child-simple; a strategic mistake visibly hurts; a genuinely better move triggers a different result.
- 2D/2.5D motion uses verified SVG/canvas/art primitives in current renderer or a bounded specialist; synchronize narration, sound, label legibility, camera and attention.
- Negative controls: change cost input but leave chart inert → fail; reverse correct arrow/cash sign → fail; misleading scale → fail; unsupported comparison → reject until researched.

Early source avenues for the Mia film: National Restaurant Association labor and food ratios, full-service operating-cost pressure, restaurant operations data abstract, then source-specific regional cost/lease context. Do **not** convert general industry ratios into claims about a fictional Mia without a labelled modeling assumption.

## I. Whole film and first sequence: concrete development order

### Step 1 — Package and narrative (immediately, no artwork spend)
- 3 title/thumbnail concepts, one primary click promise and audience desire rationale.
- Short *value blueprint*: what the viewer will **feel**, which hidden mechanism they will **understand**, which concrete thinking tool they retain, what the twist disproves and why they want the next Better One video.
- Credible research and economic model, carefully separated from fictional narrative.
- 8–12-minute full film act/scene sequence: Mia's life/restaurant, tangible crisis, past emotional stakes, host entrance, first failed move, decoding, real strategic trade-off, reversal, credible earned payoff.
- First-pass screenplay/dialogue with actual voice intent and timed scratch read. Then Experience Director's 12-part shot contracts and full art/motion/3D/audio requirements.
- Three alternatives for opening hook evaluated against story promise and emotional attachment; human selects the story and major directing decisions.
- `CREATIVE_PACKET.json` v1.1.0 with all named external files and hashes. Validate and preflight on actual P05 interface. No synthetic prompt is treated as source evidence.

### Step 2 — Define the first *real* 8–10-second acceptance clip
After the screenplay/director lock, take one contiguous actual film interval (ideally opening characters/physical contact/dialogue) and define its finished-frame appearance and audible script. DO NOT invent an unrelated test story to simplify the engine.

Suggested performance objective (illustrative until GPT chooses the actual words): busy original restaurant with Mia juggling a real prop and reacting emotionally to the contradiction "packed dining room, losing money"; multiple purposeful background activities; facial expression, real mouth and hand, camera reveal, timing and contextual sound. One real approved interval, not an 8-second static title card.

**Required outputs:** 8–10 seconds = 480–600 original 1080p 60fps frames; real approved F01–F80 artwork source; approved parts/cels and hidden surfaces; measured registration; nontrivial articulated act and independent hand/face state; ambient/voice/sfx mix; frame/owner/action proof; human playback assessment; exact cost and manual edit ledger.

### Step 3 — Second and third sequential 8–10-second real-film clips
- **Host crossing clip:** actual 3D mesh walk/talk/point/camera alignment, occlusion and floor contact integrated in Mia's world; test sound and expressive interaction.
- **Decoder clip:** physical story → original graphical transformation; visible changing financial variables; a genuine causal discovery/surprise and correct sound/attention rhythm.

If the film chronology places these later, work on their **real absolute frame windows**, preserve cut/continuity states and reassemble at their intended position. No force-fitting all technologies into one congested eight-second shot.

### Step 4 — Prove complete opening (e.g. first 45–75 seconds as the approved script dictates)
Once the three major visual routes are technically and artistically qualified on their genuine 8–10-second scenes, produce contiguous opening sequence segments. Reuse already accepted assets, rigs, host and marks. The complete opening should have real narration, score, emotional/comprehension progression, character consistency, and one earned decoding reveal.

### Step 5 — Finish the same film
Keep a full episode shot registry with dependencies and progress. Produce in reviewable 8–10-second segments, grouped by shared world/character state to minimize regeneration, and continuously assemble a current full-length watchable cut. Perform stage-specific technical review, editorial watch and feedback after accepted segments; don't wait until 40,000 frames to discover the story doesn't work. Only full finished movie is final success.

## J. Source implementation priorities / immediate P05 work

1. Checkout correct feature branch and HEAD; confirm all local uncommitted work/stashes; preserve snapshots, no force/reset/merge and no deleting evidence.
2. `HANDOFF.md`, `CLAUDE.md` are stale P02 documentation. **Update them on a new isolated feature branch**, with exact P05 last source SHA, current external dependencies and this first film's creative priorities.
3. Run final P05 tests on **frozen 9454646** code. The published P05 summary lists the exact regression/chain/negative commands. A local laptop sleeping invalidates the completion proof; set OS prevent sleep, maintain process log and resume verified chunks only. Don't use current new creative file drafts as an excuse to restart unrelated 7200-frame films.
4. Inspect actual 1.1.0 schema and operator CLI, not the older v1 draft. Ensure the GPT authoring packet and its File/Source hashes compile all required creative consumers.
5. Verify import with actual image bytes that passed outbox → registration → animation, and enforce not-just-diagnostic origin and no magical approval. Production real-art test comes with user-supplied images; do not fake it with fixtures.
6. For real Mia shot demands: machine-generate capability matrix `shot/action/required_state/needed_part/operation/current_producer/real proof/current status/owner`. Read the actual semantic verb registry before claiming arbitrary movement supported. P05 has explicitly unsupported `LOAD_CONTAINER`, `INSERT_TOKEN`, `CARRY`, `ORBIT`, `DOLLY_3D`, and certain contacts; implement only operations needed for actual directed story, or refuse and request creative approval. Don't silently reword or drop action requirements.
7. Fix any P05 regression failure with original failing reproduction, corrected consumer, negative and unrelated-fixture regression. Don't spend entire new account running a never-ending 90-minute pipeline if the failed cause is already isolated.
8. Build a versioned Blender-host adapter: `3d_host_scene + performance/action keys + world_to_camera calibration + render_pass_manifest + rgba/mattes + frame hashes` → Neutrino/Chrome composite. Validate depth and contact, not just appearance of two layers.
9. Install no second full art-to-motion engine unless a real first film requirement demands it. Consider Moho/Cartoon Animator/Live2D/Spine as design references and possible professional fallback, not automatic baseline migration.
10. Maintain separate technical gate and artistic gate. An engineering-ready diagnostic does not make the real film beautiful.

## K. Cost/throughput and stop/go rules

- Source code and ordinary local rendering first; manual GPT images approved under human image-generation budget. No paid model/GPU call without one request-specific quote and explicit authorization.
- Per film shot/segment, record `sequence_id, absolute_frames, modality, approved_art_sha, rig_master_sha, source_sound, code_sha, render_device, render_seconds, retries, manual_minutes, provider_cost, pass/fail, visual_reviewer_notes, accepted_seconds`.
- Render diagnostic preview/proof at the narrowest *real shot* interval; use final native 1080p 60fps when publishing/qualifying quality. Reuse chunks only when code/art/plan/audio hashes match.
- Compare GPU rental only if **verified local render time** and accepted-frame volume imply net savings after setup, file transfer, provider price and failures. Renting a GPU doesn't change paid Claude model limits or magically supply Seedance credits.
- A special generated-video insert only after failed qualified animation route and approved price; reject it if identity, storytelling or art integration is weaker.
- Two excellent videos/week is a future operational objective, not the first sprint's constraint.
- Do not over-engineer universal crowd or fully general physical simulation to avoid a specific Mia shot. Make a truthful targeted producer and generalize its reusable failure class.

## L. Final first-film acceptance

**Publishable film** requires:
1. The promised emotional/cognitive outcome actually occurs (human editorial review).
2. Every factual assertion/referent distinguished from Mia's fictional economics; real math recomputable.
3. Beautiful consistent approved original characters/environments/motion graphics/host matching one show identity.
4. Believable acting, anatomy, correct hidden surface/hand contact/face state/alternate-view transitions and camera.
5. 3D host looks grounded (camera, scale, shadows, occlusion, staging and expressive dialogue) in the 2D world.
6. Decoding has easy-to-follow cause→effect and genuine strategy, not unsupported magic numbers.
7. Full exact 60fps frame sequence, video source, correct final muxed recording and SFX/music, no holes/black plates.
8. Independently inspected finished movie in real time; technical proof and artistic review are both present.
9. All source/project/assets/hashes/approval receipts and recovery commands allow reproducibility.
10. Actual production-cost record and a thumbnail/title package ready for release. After publishing: A/B packaging where available, analyse CTR/retention/returning viewers and update the *story* as well as the animation library.

## M. Next Claude account: immediate first actions

1. `git fetch --all` and examine clean current branch `repair/p05-creative-packet-integration` SHA `711ed0fe...`; compare against `9454646` source (evidence-only one commit).
2. Create/use the isolated `production/better-one-mia-first-film` branch. Read this file, uploaded first-film directive, actual P05 status, older P04/P05 reports, schema v1.1 and actual source; reconcile older `HANDOFF.md` and `CLAUDE.md`.
3. In parallel: run/finish P05 frozen-sha code verification and begin the honest engineering capability/cost matrix against the NEW full Mia script as soon as GPT returns it.
4. Inspect and verify art job/creative adapter stages; explicitly list how the manual real GPT art route will pass through the same P05 code.
5. Build general compositing support needed for a real Blender host only once its actual shot requirements are approved; no unaudited speculative rewrite.
6. Request exact art and approvals from GPT/user, never mark a missing image as generated.
7. Produce first real 8–10-second film segment, then host and decoder segments, then entire episode, with versioned human/technical review.
8. Report completed accepted footage seconds, next film shot, actual blockers, and cost. Test reports alone are not progress toward a publishable first film.

**End state:** One extraordinary complete first film and the production system that actually made it. The system is the reusable residue of making the film, not the objective in isolation.
