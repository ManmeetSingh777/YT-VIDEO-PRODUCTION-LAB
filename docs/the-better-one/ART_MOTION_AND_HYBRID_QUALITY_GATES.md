# The Better One — Enforceable Artwork, Motion and Hybrid Film Quality Contract
**V1.0 | 25 November 2026 | Binding production requirements, NOT a claim of current implementation.**

## Source authority and the main insight

- **Creative source:** \`THE_BETTER_ONE_MASTER_CHANNEL_BIBLE_v1.md\` (the complete user-supplied editorial Bible committed beside this document); later human-approved per-film decisions supersede earlier proposals. For the first film, Mia is the leading pilot candidate, not yet a research-validated viral winner or final approved title.
- **Production blueprint:** \`FIRST_FILM_PRODUCTION_MASTER.md\`. **Real implementation:** P05 code inherited from commit \`945464697dc680956bea670e543c8e0c7beebf1b\`, not old P02 instructions or default main.
- **Director:** ChatGPT + human create idea, claim/model dossier, 12-part Experience Director V1 shot plan, actual action graph, art requirements and real F01–F80 images. Claude executes technically. It may return exact impossibility reports; never delete a creative action, simplify artwork, change the business model or self-approve.
- **The most important truth:** REGISTRATION = mapping where approved pieces go. Registration does not produce attractive bent elbows, missing underpaint, believable gripping fingers, expression, acting, consistent multi-view faces, satisfying arcs or 3D grounding. We require **complete art-state construction → measured rig → actual motion/interaction → frame-visible consequence → human full-motion quality approval**.

## Production topology (one absolute film clock)

~~~mermaid
flowchart TD
 B["Channel Bible + research + truthful economics"] --> C["GPT screenplay and Experience Director V1"]
 C --> D["CREATIVE_PACKET 1.1.0 + actual action/motion/art demands"]
 D --> P{"Engine PRE-ART capability + art-state completeness"}
 P -- Missing engine operation --> R["Precise refusal/approved creative revision or reusable repair"]
 R --> C
 P -- Missing drawing requirement --> D
 P -- Supported in principle --> G["Real GPT F01–F80 masters → derivative parts/cels/views/hidden paint"]
 G --> A["Human visual approval + exact image hashes and identity"]
 A --> F["Fit rigs FROM actual pixels; full-action-frame feasibility"]
 F -- Extra art required --> G
 F -- Geometry cannot work --> R
 F -- Feasible --> T["Neutrino 2D + Blender 3D host + math-backed decoding"]
 T --> X["Single 60fps compositor, sound, masks, camera, final media"]
 X --> Q{"Native-resolution acting, art, narrative + technical QA"}
 Q -- Wrong pixels or weak acting --> E["Repair earliest incorrect producer, rerun affected shot"]
 E --> F
 Q -- Approved --> V["Accepted real 8–10s film footage → 90–120s hybrid proof → 8–12m episode"]
~~~

**Single time base:** film frames are integers in [0,total_frames) at 60fps. 8s=480 frames; 10s=600; 12min=43200. The FIRST film runtime is editorially decided, not constrained to 7200 frames. Shots tile entire timeline; local frames derive from absolute start; sound and Blender are aligned to this same clock.

## 1. Exactly six previous failure classes and their GENERAL remedies

| ID | Failure the viewer sees | Earliest producer to fix | Required independent proof |
|---|---|---|---|
| C1 | Beautiful master, but cut arms/face/hand do not look like that character | Approved master → source-attached derivation + hidden-painted parts → rest recomposition | Across pose/view changes, real approved identity, consistent color, contour/shading; no holes or overlapping parts |
| C2 | Correct pivots but an elbow/head/hand turn is visually impossible | Motion-route demand BEFORE art, approved cels/views/underpaint and actual post-art feasibility | Real intermediate frames look anatomically correct; missing state causes typed ArtJob, never generic tube/flat face rotation |
| C3 | Technical arm movement but lifeless puppet acting | Director acting track → anticipation, gaze, expression, weight, purposeful hold, follow-through, settling | Watch continuous 8–10s actual motion and compare to directed beats; owner pixels alone do not certify beauty |
| C4 | Three-quarter character looks like a different person | Canonical identity, source-attached alternate view families, approved shared facial/proportion/material landmarks | Consistent head construction through view switch; don't label a rotated front PNG as three-quarter head |
| C5 | 3D host seems pasted on 2D background | Real Blender mesh and face rig + camera/floor calibration, shadow/light, masks, occlusion | Real mixed frames, foot planted, proper under/over table, matching angle/scale/light and expressive acting |
| C6 | A different shot requires rebuilding everything by hand | Source-grounded art demand DAG, reusable acting primitives and rigorously tested capability classes | Another unfamiliar prop/character uses same producing mechanisms; manual work measured; no special case in engine |

**No promise of zero manual illustration work.** The professional solution is to make dependencies and failure causes explicit, reuse qualified controls/rig behavior, and create new character-specific artwork as the direction actually requires.

## 2. The four motion routes that must not be confused

1. **Articulated rigid painted parts** for suitable arms, torsos, gaze controls, prop motion. Requires independent PNG layers, hidden underpaint, correct pivots and occlusion.
2. **Approved cel/view states** for big head/profile turns, complex bends, hands/fingers and expression/pose changes. Requires canonical identity and registered anchor/transition checks.
3. **Approved mesh/path deformation** for bounded hair/cloth/soft shape changes, with real topology, alpha, shading preservation and no triangle folding/holes.
4. **Specialized performance**: Blender character mesh/rig for real 3D host or an explicitly approved generated-video insert when programmable methods cannot reach the artistic standard.

The route is selected per *operation* using required visual appearance and editability, not a single universal rule for all characters. Neutrino is the 2D execution backbone, not a substitute for Blender's actual 3D rig. Use official professional rigging principles from Live2D, Moho, Spine and Cartoon Animator where helpful. Only introduce a second runtime after proving its actual cost/quality advantage on one real Mia asset.

**Never claim:** one flat image = articulated character; rigid rotation = head view turn; affine registration = good contact; a crossfade = a natural moving silhouette; PNG foreground/background overlap = correct occlusion; tiny lever rotation = mechanically meaningful outcome.

## 3. Exact art-before-motion requirements (GPT stages 1–4)

### 3.1 Direction before image generation
Each selected actual Mia shot has:
- \`shot_id, [start,end), story_claim_ids, audience_purpose, truth_mode (F/R/M/H/X), emotional_entry_exit, opening/closing image, action_owner\`.
- Separate events for main/secondary choreography, frame-bounded anticipation/reach/contact/hold/release/reaction, gaze/expression, camera purpose and sound.
- Actual mechanical object target and end state, not "animate something". If a character must hold a prop, identify the hand, prop, grip surface, release timing and what happens to possession afterward.
- Each direction decision links to an engine operation, art state, camera, effect or audible cue. If the intended operation does not exist, typed refusal BEFORE creating expensive derivative artwork.
- Camera footprint and required painted world; one approved art identity and coherent material/lighting/edge language.

### 3.2 Complete art-demand closure
The engine must calculate **all potentially used states** over the approved action timeline *before* image generation:
- Canonical master and any unique character/prop identity.
- Part hierarchy appropriate to the character's anatomy (not hardcoded stick-human shapes); separate painted shoulder/upper arm/elbow/forearm/hand when directed.
- View/pose/expressions/EYES/MOUTH/HAND/material/lighting/occlusion each independent; linked state transitions and necessary inbetweens.
- Front/back fingers, palm contact patch and exact hand state for hold/release; underpaint behind bending arm/neck/hair/prop.
- Masks, occluders, cutout repair, world clean plates, transitions, alpha/overscan, at-max-camera-zoom density.
- Actual narrative world objects and one-to-one sources for graphics, text and animated numbers.
- F01–F80 applicable construction methods WITH actual skill references/witnesses; no hollow "F01–F80 applied" string.

No fixed number of assets. A requirements graph, not 52 arbitrary images. The compiler must report any missing reachable state as \`MISSING_ART_REQUIREMENT\` before images.

### 3.3 Real image production
- Verify the actual current installed \`construct-kurzgesagt-art\` skill, source witnesses and design methods exist in the new ChatGPT art conversation. GitHub's skill text is not proof that native witness images are in the session.
- First approve the best original master art (whole look: silhouette, face, hands, paint edges/shading, sophisticated palettes, details and world coherence).
- Create parts and derived state views through source-attached edits referencing approved masters. Do not generate independent "same Mia" pictures and hope they'll match.
- Import real PNG/SVG bytes with alpha where needed, operator-attested provenance, exact file SHA/lineage, mask and landmark sidecars; reject fake transparency or missing hidden surfaces.
- Human visual review is separate from filename and schema checks. Technical metadata cannot self-approve beauty.
- Keep the previously approved ancestor when regenerating one missing state; invalidate only affected downstream proof.

## 4. Registration and TRUE artwork-driven motion (Claude stages 5–6)

### 4.1 Registration checklist (technical)
1. Decode source pixels/alpha; store unaltered file hash and crop. 
2. Review real image landmarks; mark coordinate space (source pixel, crop-local, canonical master, rig-local, world, screen).
3. Fit transform from nondegenerate correspondences; reject unintended mirroring, bad skew, unstable inverse and excessive residual.
4. Register parent/child topology, state ownership, palms/foot contacts, front/behind paint order and hidden surfaces.
5. Recompose approved master at rest: inspect pixel seams, edge fringing, overpaint, anatomical proportion and shading continuity.
6. Fit pivots/IK limits to approved real painted geometry, never distort the art to a preselected generic stick figure.
7. Keep exact master derivative/transform review receipts, hashes and source method/ArtJob lineage.

### 4.2 Every-frame feasibility (NOT an empty-plan PASS)
For EACH required action frame, evaluate the actual complete event:
1. Canonical shot/character state and film clock; carried possession and end state from preceding action/shot.
2. Primary directed motion; selected pose/view/EYES/MOUTH/HAND/expression/artwork IDs.
3. Acting overlays with supported limits, gaze, torso/hips/feet support, and real facial states.
4. FK/IK joints, reach, bend branch, hand position AND orientation and prop socket, balance and floor/foot contact.
5. Actual hand closure/painted fingers and correct near/far occlusion throughout entire hold.
6. Applied-force or graphic-model response; visual resulting object state truly reached.
7. Cels and deformation (no inverted mesh, wrong alpha/hidden surface or impossible perspective).
8. Camera/world footprint, exposure, transition and sound relationships.
9. Final rendered artwork owner existence and expected visible effect.
10. Every thrown frame and missing state recorded. 0 checked frames = \`NOT_EVALUATED\`, NEVER \`FEASIBLE\`.

**Failure response hierarchy:** engine bug → repair general producer; incorrect landmark → reviewed correction; missing cel/view/underpaint → exact GPT ArtJob; physically impossible plan → bounded approved creative restaging; unsupported operation → block. Never invent generic art or quietly remove action.

### 4.3 Motion style and artistic acceptance (not optional)
The engine must create a film performance with **anticipation, motivated pose changes, acting rhythms, readable silhouette, gaze/expression, appropriate weight, motion arcs, contact, secondary follow-through, realistic stylized shadow/grounding, and purposeful timing**. A high sample count of moving frame hashes cannot prove that.

Review actual 60fps watchable footage at full screen plus hard-contact/turn frames at native resolution. Reject: robot-like constant velocity; static face; sleeve/arm gaps; detached shoulder; overlong limb; wrong hand side; tube elbow; rotating flat head; teleporting prop; foot skate; cropped head; frozen environment where action demands motion; overactive random particles; pointless camera zoom; unearned FX. If flaw is fundamental art-state deficiency, solve it **at the image source** instead of hiding it with code.

### 4.4 Negative tests that must detect false success
- Middle grip frame has an open hand while camera/particles move: FAIL.
- Target asks aperture ≥60°, rendered hinge opens 7°: FAIL.
- Body view remains front but request says real three-quarter turn: FAIL.
- Wrong master face appears briefly after a cel transition: FAIL.
- Owner is frozen while background/blur moves: FAIL.
- Morph triangles overlap/collapse but total area matches: FAIL.
- Held object moves without socket/force driver: FAIL.
- Owner evidence missing for one required frame: FAIL.
- Imported art hash changes but cached render/approval still claims current: FAIL.
- Sound stem correct but published MP4 uses older mix: FAIL.
Every negative identifies exact producer, film action/frame and repair class. No scene-name condition in the reusable engine.

## 5. The 3D host must be genuinely rigged and grounded
- Create approved ORIGINAL 3D-host concept and multi-view design. A 2D GPT illustration is not a Blender mesh.
- Real Blender mesh topology/UV, materials, armature, weights, IK feet/hands, head/face shape keys and actual reusable gestures/idle/walk/turn/point/speak/reaction.
- Calibrate 3D world/camera to 2D shot camera (projection, scale, world origin, floor plane, gaze targets, depth/mask and shadows). Record precise world→screen transform.
- Render frame-numbered RGBA plus required depth/object-ID and floor-contact/shadow mattes. Compositor uses these with actual painted foreground/near planes.
- Test a real host walking, pausing, talking and interacting in the restaurant at 60fps; feet may not float, shadows and occlusion must fit, colors/edge language must be aesthetically cohesive.
- Missing 3D asset → \`HOST_3D_ASSET_PENDING\`, never a secretly flattened stand-in. Optional 2.5D launch compromise only with explicit user approval.

## 6. Decoder must be a REAL model-driven animated system
- Every displayed value carries unit, provenance \`DOCUMENTED / HYPOTHETICAL / MODEL_DERIVED\`, formula and scope.
- Recompute when input levers change; update corresponding chart, bar, physical metaphor and actual scenario consequence.
- Show constraint and counterexample. For Mia: revenue ≠ contribution ≠ profit; kitchen capacity limits output, overhead remains, price or waste changes can alter customer demand, quality and service.
- Labels/counters not fake probabilities; no "93% chance" without calibrated credible method.
- Convert already-planted clues (tickets, grill, price, time, queue) into a vivid strategy model that reveals a hidden rule rather than boring dashboard.
- Negative: change variable but freeze visual; reverse sign; remove capacity; imply fictional simulation is real observation. All fail semantic/model review.

## 7. Full film, sound, visual QA and cost
- One immutable frame timeline, [start,end); 8 seconds 480 frames, 10 seconds 600, 90–120 seconds 5400–7200, 12 minutes 43200.
- Composite Neutrino 2D and actual Blender RGBA/masks in a shared calibrated camera; host is not pasted on after encoding.
- Real spoken dialogue, measured narration/voice timing, frame-tied SFX and mood music with correct artistic function; final audio mix must be present in verified final MP4, not in separate unused WAV.
- Render in bounded chunks, recover from interruption, track frame/source hashes and owner/art-state attribution. No frame exception or empty evidence counted as passing.
- Film reviewer must independently inspect native-resolution moving shots, emotional comprehension, humor, visual consistency, dynamics and entire final edit.
- Log \`shot_id, absolute_frames, art_sha, rig_sha, code_sha, producer, renderer, real runtime, attempts, operator minutes, provider cost, accepted_seconds, review_notes\`.
- Never report an accepted clip because it is a clean technical MP4. Acceptance requires **human artistic approval** over exact final mixed video.

## 8. Actual first-film production and release milestones
- **Milestone A — P05 recovered:** correct source SHA, outdated root session files fixed, clean regression and bounded P05 integration proof; remaining software blockers explicitly listed. Do not render 7200 artless frames again just to increase test counts.
- **Milestone B — editorially compelling E01:** three title/thumb promises, research and model card, honest ending proof, Value Blueprint, beat/story/script with dialogue and scratch performance, 12-part Experience Director V1 shot contracts, CREATIVE_PACKET 1.1.0; user approves film direction before expensive art.
- **Milestone C — real-film clip 1 (480–600f):** original Mia acting, eye/mouth/hand/prop/weight, actual sound; genuine F01–F80 master+derived images, measured rig and full-frame visual review. This is the decisive Neutrino/GPT proof.
- **Milestone D — real-film clip 2 (480–600f):** approved Blender host entrance, personality, camera, occlusion/ground shadow, real dialogue.
- **Milestone E — real-film clip 3 (480–600f):** physical clue→strategy space, real model-backed motion graphics and causal transformation.
- **Milestone F — 90–120s contiguous hybrid proof** using actual first-film scenes (Bible §12.5), including acted dialogue, stakes/gag, freeze/memory, 3D host and strategy model. No unrelated demo montage.
- **Milestone G — complete E01 episode** as 8–12 min initially (extend to ~13 when genuinely earned); continuously assemble approved intervals; final editorial G1–G8 + production QA separately.
- **Milestone H — publish and learn**: packaging, licensing/disclosure, source note, Shorts, costs and audience feedback. Views/virality cannot be guaranteed.

**Production priorities:** the two first proof clips are NOT throwaway tests. They become finished footage. Existing P05 tests are necessary technical protection, not a gate to writing the script. Begin the E01 story/research immediately in GPT while Claude verifies P05 and builds only required missing producers. Do not generate the entire episode's final art until beat/story/shot demands are approved.
