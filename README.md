# YT-VIDEO-PRODUCTION-LAB — complete script-to-film operating specification

> **Contract status — intended design, not a claim that everything is implemented.** This README specifies what the seven-stage Motion Native Studio / Hybrid V2 system **must** do, how every stage hands off to the next, and which tests are required before its claims are trusted. A feature described here is not considered working until the named production consumer and actual evidence prove it. Technical readiness, GPT-art readiness, motion readiness and visual excellence are separate gates.
>
> **Division of authority:** GPT + user own the idea, script, Experience Director V1, visual direction, motion-ready art design, and manually generated F01–F80 artwork (Stages 1–4). Claude Code + Neutrino own engineering, exact artwork-first registration, physical/temporal execution, rendering, audio and evidence (Stages 5–7). Claude may diagnose technical impossibility and propose remedies; it may **not** silently replace the intended storytelling, artwork, acting or metaphor.
>
> **First integrated qualification:** a completely **new 10-second film = 600 frames, 1920×1080 at 60 fps**, using genuine approved ChatGPT-generated artwork. No new story, assets or human approval can be faked for a diagnostic. A 120-second = 7,200-frame test is a separate later scale qualification. The source snapshot has not yet demonstrated the real-art 600-frame success criterion.

## 0. Read this before running anything

### 0.1 One-sentence mission

Turn **any supported, original educational script** into a compelling professionally directed film with consistent GPT-created illustrations, expressive Neutrino-driven animation, synchronized sound, and reliable independently inspectable proof — or return the **exact unsupported action, missing image, failed constraint or unverified approval**, instead of producing a quietly downgraded film.

"Any supported script" does **not** mean any conceivable creature, physics action or perspective is already implemented. Unknown actions must be identified and either supported with a reusable new producer or refused *before the film is declared ready*. No finite test suite can guarantee flawless work on every future subject.

### 0.2 High-level execution map

~~~mermaid
flowchart TD
    H["Human intent: topic, audience, constraints"] --> G1["1. GPT — story truth, script, mechanism, narration"]
    G1 --> V1{"Gate 1: accurate and clear?"}
    V1 -- No --> G1
    V1 -- Yes --> G2["2. GPT — Experience Director V1: complete film and each shot"]
    G2 --> V2{"Gate 2: every intended visual/auditory action explicit?"}
    V2 -- No --> G2
    V2 -- Yes --> G3["3. GPT — motion-capable art inventory and state dependency graph"]
    G3 --> PA["ENGINE PRE-ART PREFLIGHT: supported operations and complete state demand"]
    PA -- Missing operation --> RE["Typed engineering refusal + exact alternatives"]
    RE --> G2
    PA -- Missing visual requirement --> G3
    PA -- Feasible as a plan --> G4["4. GPT + human — F01–F80 masters, edits, states, art reviews"]
    G4 --> AR{"Real images, lineage and artistic approval?"}
    AR -- No --> G4
    AR -- Yes --> G5["5. Claude — measure pixels, register art, fit rigs, solve EVERY action frame"]
    G5 --> PF{"Post-art feasibility and correct state/geometry?"}
    PF -- Needs new painted part/view --> G3
    PF -- Needs authorized staging change --> G2
    PF -- Yes --> G6["6. Neutrino — actual approved layers, articulation, acting, contact, effects and cameras"]
    G6 --> PX{"Actual frame and action/owner consequence verified?"}
    PX -- Engine defect --> FIX["Repair earliest producing mechanism + regression"]
    FIX --> G6
    PX -- Yes --> G7["7. Encode video, mix/mux audio, full-frame QA, independent artistic review"]
    G7 --> OK{"All technical and artistic gates approved?"}
    OK -- No --> FIX
    OK -- Yes --> FILM["Published approved MP4 + exact evidence + reusable project"]
~~~

**The two-way rule:** Before art, we define **what** must happen, when and which parts/states it requires. After approved art, we measure the real image geometry and determine **how** to animate it. **Do not dictate generic figure geometry to the art model; do not invent image anatomy after the art is approved.**

### 0.3 Ownership: who may decide what?

| Decision or operation | Responsible authority | May Claude change it independently? |
|---|---|---|
| Business/educational meaning, claims, story angle | GPT proposal + source verification + user | No |
| Script, emotional curve, visual metaphors, audience effect | GPT / Experience Director V1 + user | No |
| Shot geography, action order, acting intention, camera and sound design | GPT / Experience Director + user | No |
| Needed views, pose states, hand states, separable drawings, overscan, masks | GPT design + deterministic demand compiler | May report missing requirements, not omit them |
| Shape language, faces, silhouette, palette, material, whole look | F01–F80 art skill + actual GPT artwork + user | No |
| Real image cutouts, measured transforms, joint parameters, IK and deformation | Claude + verified code working from approved pixels | Yes, if faithful and physically valid |
| Render mechanics, caching, streaming, tests and source maps | Claude + code | Yes, without changing approved intent |
| Technical feasibility decision | Deterministic code + actual measurements | It may block, not reinterpret intent |
| Human story, design, image, restaging and final-film approval | Authorized human | Never impersonate or self-sign |
| Visual quality judgment | Critical GPT/user visual review *and* actual output inspection | Cannot infer from logs alone |

### 0.4 Mandatory status names and honest truth boundary

- **CREATIVE_DRAFT:** GPT has proposed a story/direction; nothing is approved.
- **CREATIVE_STRUCTURALLY_VALID:** IDs, intervals, dependencies and references pass a *real* validator. This says nothing about taste or beauty.
- **CREATIVE_APPROVED:** authorized human approved the exact versioned story and director packet.
- **PREART_FEASIBLE:** software supports each specified motion/visual mechanism **in principle**, and every required image/state is enumerated; real limb geometry is still unknown.
- **ART_CANDIDATES_DELIVERED:** actual PNG/SVG bytes and provenance arrived; prompts alone do not count.
- **ART_APPROVED:** real images have completed independent design/visual and technical image checks with valid receipts.
- **POSTART_MOTION_FEASIBLE:** the actual approved part geometry supports *every required* action frame; zero checked frames cannot pass.
- **MOTION_EXECUTION_QUALIFIED:** real artwork drives actual Neutrino/Chrome pixels with action-specific proof and no undeclared substitution.
- **FINAL_FILM_REVIEWED:** exact final MP4 and audio were decoded and visually/audibly reviewed, all required gates verified and human authority recorded.
- **BLOCKED / UNVERIFIED:** honest state for any missing source witness, decision, image, external voice, approval, capability, execution evidence or test.

No stage may promote its own output to a status owned by a later stage.

### 0.5 Immutable references and exact version

All important artifacts have stable IDs, exact hashes, parent revision, source producer, consumer and changed-since-last-approval status. An approval is valid only for the exact content/hash it reviewed. Preserve original Neutrino under **reference/neutrino_2m_SOURCE_PACKAGE/** as a comparison source, never silently patch that reference. Preserve **engine/runtime/nu.js** where equivalent existing functionality is working; source identity by itself is *not* execution proof.

The specific baseline of the independently read code discussed here is **P03 commit 900a6b14e2dfeeb2d59ec87a0e84e71ce45e1835**. Later Claude engineering commits may improve or invalidate the gap list in §10: re-audit each item against that newer SHA before treating it as current.

---

## 1. Shared contracts: one clock, one creative truth, one art identity

### 1.1 Canonical time

- Resolution **1920×1080**, 60 frames/second for the present pipeline; **film length is variable**. Ten seconds = frames 0–599 and an exclusive end at 600. Two minutes = 0–7199 with an exclusive end at 7200.
- Every interval is **[start_frame, end_frame)** using integer frames in the same film clock; no mixed seconds/index offsets without an explicit conversion.
- Shots exactly tile [0,total_frames) once each. Transitions describe ownership on boundaries, not extra missing or duplicate frames.
- Subframe evaluation for motion blur is allowed; visible final frames, narration and cue anchors remain tied to the single authoritative frame clock.
- A shot transition carries ending pose, held prop, camera position, viewer focus, sound continuity and world state into the next shot, unless an explicit time/space jump is approved.
- Source audio is aligned to **recorded audio**, not word-count estimates. Distinguish intended edit timing from measured voice performance and declare discrepancies.

### 1.2 Canonical space and image math

- Record **source PNG pixel coordinates**, **cropped-part local coordinates**, **canonical master/world coordinates**, **rig-local coordinates**, **camera coordinates**, and **final screen pixel coordinates** explicitly.
- A source/part landmark must have a declared coordinate space; every transform must state direction **source→canonical** or **canonical→source**, invertibility and units.
- A rig joint/pivot belongs to a measured approved part. Parent/child transform ownership must be unique; camera motion is never baked independently into each character limb.
- Preserve actual alpha and premultiplication handling, world color space and approved edge treatment. Transparent does not mean "white background removed by threshold".
- Every source image has a hash, master/parent identity, approved view/pose/state and a concrete file path; the renderer may not substitute another file merely because its name or size matches.
- State ownership is separate: **body pose ≠ viewpoint ≠ expression ≠ eyes/gaze ≠ mouth ≠ HAND ≠ clothing/material ≠ lighting ≠ occlusion**. A change in one does not implicitly modify another.

### 1.3 Minimum shared records

Every approved package must contain (or compile without loss to) these typed, referenced records:

| Record | Minimum information that cannot be omitted |
|---|---|
| **FilmIntent** | Topic, audience, purpose, film length, quality bar, constraints, source/citation policy, authorized decision maker |
| **StoryTruth** | Claim ID, evidence/source status, explanation mechanism, misconception, uncertainty, intended viewer understanding |
| **NarrationLine** | Exact spoken text, source claim IDs, pacing intention, later measured voice/word timing |
| **DirectionDecision** | ID, shot/time, intent, audience emotion/attention, target subject, action and audiovisual consequences, consumer IDs |
| **ShotContract** | Entry and exit frame, opening/ending image state, geography, primary/secondary activity, camera, focus, audio, continuity |
| **SemanticAction** | Actor, target, starting state, ordered phases, timing, contact/support/forces, consequence, ending state, measurable evidence |
| **MotionCapabilityDemand** | Required movement route, body/object topology, states, constraints, required sound and observable technical effect |
| **ArtRequirement / ArtJob** | Canonical master, family/F-methods, part/view/channel/alpha/underpaint/mask demands, state range, consumer and review tests |
| **RegisteredArt** | Original approved bytes, landmarks, transform, pivot, crop, alpha, part owner, underpaint, rig fit, human approval |
| **ExecutableMotion** | Direction/action ID, rig owner, keys/phrases, acting, constraints, object reactions, state changes, camera/audio anchors |
| **RenderedFrameProof** | Actual frame, Neutrino/runtime and code revision, art hashes, selected states, owner passes, visual action consequence, errors |
| **FinalMediaReceipt** | Verified video essence, actual mixed audio stem hashes, exact muxed final MP4, duration/frame/audio probes, approval |

**Cross-reference laws:** every visible action has a director reason; every director instruction has an actual consumer; every required art state has a frame/action user; every moving render pass has a real approved source; every alleged observed effect is tied to actual rendered pixels or verified audio. Orphans and unknown references are failures, not warnings.

### 1.4 Two separate validations before images

1. **GPT creative review:** Is the story meaningful, surprising, accurate, visually clear, paced well and original? Does every shot genuinely contribute? Human and critical outside comparisons matter here.
2. **Deterministic creative/pre-art compilation:** Are every declared action, state, interval and dependency complete and *technically supported in principle*? Does any required operation have no real engine consumer? Is the art list complete without guessing the actual anatomy?

Passing one does not imply passing the other. After images, **post-art measured feasibility** must run again.

---

## 2. STAGE 1 — GPT understands the idea and builds the story

**Input:** user topic or researched idea; intended audience; desired duration; visual-channel style; factual sources if needed. If research is needed, verify actual sources and dates; distinguish verified facts, hypotheses and metaphors.

**Creative target:** the viewer starts with a specific question or misconception and finishes with a correct, memorable causal understanding. Script must be interesting to watch, not merely informative to read.

### 2.1 Molecular production operations

1. Define the **single central question** and what the audience currently expects.
2. Map the **claim ladder**: each factual claim has a scope, source, certainty and required caveat. Never present a visual metaphor as literal scientific/business evidence.
3. Map the **causal ladder**: initiating event → mechanism → visible consequence → inference. Flag any logical jump where the explanation relies on "and then magic happens".
4. Decide the **emotional journey**: curiosity, complication, insight, relief, surprise or intended alternative; make it specific to the actual subject.
5. Decide what needs **visual proof** rather than narration alone. Each difficult mechanism gets an explicit candidate moving explanation.
6. Write exact spoken narration and track claim IDs; remove unnecessary repetition and unsupported precision.
7. Check the narration can fit the running time with genuine comprehension pauses. A draft word estimate is **provisional**, never final audio alignment.
8. Run an adversarial truth check: strongest skeptical objection, confused viewer, misleading analogy, contradictory claim, missing assumption.
9. Create a clear ending that resolves the opening question, retains continuity and does not undermine earlier claims.
10. Review with the human authority; preserve revised approved script and hash. An LLM cannot generate its own valid human approval.

### 2.2 Deliverables

- **FILM_INTENT.json** with audience, objectives, duration and provenance.
- **SCRIPT.md** and **STORY_TRUTH.md**; claim IDs, evidence and uncertainties.
- **STORY_CONTRACT.json** with claims, mechanisms, obstacles, resolution and viewer promises.
- **NARRATION_LINES.json** with exact spoken lines, their claims and provisional beats.
- Human-reviewed **STORY approval** for the immutable script/contract digest.
- The GPT creative packet may be authored in a fresh ChatGPT conversation; the engine must have a validated import adapter rather than expecting GPT to edit project source files.

### 2.3 Blocking checks

- No proof for a factual quantitative claim → **CLAIM_SOURCE_REQUIRED**.
- Ambiguous target audience or contradictory intended conclusion → **STORY_CONTRACT_INCOMPLETE**.
- No causal mechanism for a key promise → **MECHANISM_UNEXPLAINED**.
- Unverified factual assertion presented as settled → **CLAIM_TRUTH_UNVERIFIED**.
- Missing viewer question or no coherent resolution → **CREATIVE_REVIEW_REQUIRED**.
- Technical JSON passes but story is boring or incoherent → not artistically approved.

**Important:** Story writing is GPT's job. A source schema validator is not an artificial-intelligence author of an exceptional story.

---

## 3. STAGE 2 — GPT directs the COMPLETE movie

Read **inputs/EXPERIENCE_DIRECTOR_V1.md** in full. Its stage definitions and 12-part shot contract are authority, not optional inspiration. The script and Experience Director decision packet are approved *before* motion/image production. Claude must not replace distinctive moving explanatory events with a generic slide or diagram.

### 3.1 Film-scale direction before shots

1. Design the full audience-experience curve: question, tension, visible causal proof, inference, payoff.
2. Compare materially different moving explanations for difficult concepts (not three paraphrases of the same static shot).
3. Choose the visual representation of each subject: world scene, character acting, mechanism, diagram, transformation, close-up or nested world.
4. Design each world's geography, depth, materials, object inventory, cameraable angles, interacting surfaces and continuity relationships.
5. Define recurring character/object identities and what changes vs what must remain visually identical.
6. Specify transitions with meaningful information/continuity, not automatic crossfades.
7. Define the movement rhythm: foreground actions, background liveliness, simultaneous causally relevant activities, stillness/reading holds, fast-to-slow contrast.
8. Map audio/narration as a shared film performance: what sound anticipates, confirms or follows a visible event; where silence is useful.
9. Design opening and ending as an intentional relationship, not unrelated bookends.
10. Critically evaluate originality, clarity, surprise, action intelligibility, effort-to-payoff and visual variety. Reject weak creative ideas before art expenditure.

### 3.2 The full per-shot contract (never omit a field)

For **every shot** GPT must describe all 12 Experience Director V1 questions with concrete, film-specific answers:

1. **Narrative purpose:** exact claim, insight, tension or question this shot advances.
2. **Viewer experience:** intended feeling and understanding before/during/after.
3. **Starting image:** exact subjects, positions in meaningful spatial terms, pose/view, world condition, focal hierarchy, prop state.
4. **Main action:** every physical step with actor, target, contact/transform, start, middle, causal effect and finish; not "character interacts".
5. **Secondary choreography:** other simultaneous moving subjects, their purpose and separation from the main focus.
6. **Character acting:** gaze, facial intention, anticipation, weight transfer, breathing/reaction, posture, gesture, follow-through and recovery where appropriate.
7. **Camera choreography:** framing, movement path, purpose, depth/plane relationship, zoom/crop constraints and when camera **doesn't** move.
8. **Transformation choreography:** which object/state changes, how geometry/art representation transitions, required intermediate state, causal trigger.
9. **Attention path:** exact primary focus at each interval, competing motion, readability/recognition holds.
10. **Narration and sound:** exact line or sound intention, whether cue is before/on/after action and required audio source.
11. **Exit and handoff:** final visual, physical, camera and audio state inherited by the next shot.
12. **Failure conditions:** specific ways the shot would be unclear, visually weak, anatomically wrong or technically impossible.

For each shot create an **ordered frame-bounded event graph**, not prose only. Example abstract action chain: ATTEND → PREPARE → REACH → APPROACH → CONTACT → CLOSE_HAND → APPLY_FORCE → OBJECT_REACTS → RELEASE → RECOVER → VISUAL_CONFIRMATION. Different action classes get their own phases. Do **not** require grip phases when the subject is a diagram with no hand.

### 3.3 Timeline and direction-owner rules

- All shot frame ranges tile the film. Event intervals are within shots or explicitly span shots with continuity ownership.
- Every meaningful action has **precondition, required state, event, physical consequences, final state and visual evidence requirement**.
- One hand may not hold unrelated props simultaneously unless an explicit authored mechanism permits it; possession cannot teleport.
- Eye state, mouth state, hand closure, view turn, lighting and body pose are independent channels.
- Contacts carry exact source/target socket identities, approach, lock, transfer and release. The final grip geometry is *not* invented before art.
- Secondary movements have an audience purpose; unnecessary motion is not "more professional".
- Pauses are authored as holds with duration/reason, not lost time.
- Camera moves require a reveal or attention purpose; flat raster worlds do not silently become 3D.
- No unapproved pose reset at a cut. Handheld objects, support feet, gaze targets and partial occlusions have explicit continuity.
- Every director decision has a consumer: action, camera track, art state, transition, effect or audio cue. A code-level "owner exists" record does not prove it moved.

### 3.4 Deliverables and creative gates

Store **EXPERIENCE_MASTER**, **VISUAL_EXPERIENCE_DESIGN**, **WORLD_AND_ART_DIRECTION**, **SHOT_DIRECTION_MASTER**, **SHOT_MAP**, **CHOREOGRAPHY_AND_HANDOFFS**, **CONTINUITY**, **NARRATION_AND_SOUND_DIRECTION**, **VOICE_CUES**, **SOUND_EVENT_MAP**. These names match the conceptual package in Experience Director V1 §12; use a validated mapping when existing engine filenames differ.

The executor-facing typed outputs must include **SHOT_SCORE_60FPS.json**, **SEMANTIC_ACTIONS.json**, **ACTION_PHRASES.json**, **BEAT_MEDIA.json**, **audio cues**, and a canonical direction-decision-to-consumer map. Where an action route does not exist, produce **UNSUPPORTED_ACTION** before artwork.

Before approval, audit every shot for: first/last frames, causality, intermediate art states, expression, camera coverage, overlap, sound, legibility, continuity, valid semantics, and lack of silent simplification. Make an animatic/hero-frame proof where available; don't claim an uncreated animatic exists.

**Stage 2 ends only with a human-approved exact direction revision and explicit supported-vs-pending technical decisions.**

---

## 4. STAGE 3 — GPT plans ALL motion-ready artwork

Art is authored for **the already directed film**, not as isolated beautiful pictures. Do not assume generic rig pieces dictate the art style. The F01–F80 skill owns the design language; semantic movement obligations define separable parts and alternate states.

### 4.1 Determine motion classes before drawing

For every physical/directing event, choose a justified execution route, based on required appearance and movement:

- **RIGID:** translated/rotated/scaled unchanged painted object.
- **ARTICULATED:** painted independent connected parts, bones/pivots and constrained motion, with approved cels for nonrigid joints.
- **REGISTERED_CELS:** drawings for silhouette-changing, body-angle/view/expression/hand states, preserving the canonical visual identity.
- **REGISTERED_MORPH:** homologous approved paths with verifiable topology.
- **EXPLICIT_DEFORM:** approved raster mesh and bounded distortion only where visually valid.
- **PROCEDURAL:** geometry/quantity changes of approved graphical symbols or explicitly authorized abstract mechanisms; never invent decorative subject artwork.
- **CAMERA_WORLD:** moving camera over fully painted sufficient-resolution worlds and depth planes.
- **TRANSITION:** motivated cuts or properly authored OUT/MIDDLE/IN views, masks/occluders and shared spatial anchors.

**No automatic downgrade:** inability to deform an arm ≠ permission to rotate a static PNG; unavailable three-quarter head ≠ permission to rotate a frontal skull; missing world ≠ permission to expose blank pixels; impossible grasp ≠ permission to move the prop independently and call it contact.

### 4.2 Exhaustive art demand across time

For each shot, action and possible executed state, derive and record:

1. **Canonical identities:** recurring characters, creatures, mechanisms, objects, symbols, environments, typography and master lineage.
2. **All moving parts:** independently moving limbs/segments, mouth/eye elements if appropriate, props, handles, hinges, doors, mechanisms, world layers, environmental effects.
3. **All pose and view states:** front/three-quarter/profile/rear or topic-specific projections; reach, hold, bend, turn, recoil and other required cels.
4. **Face/acting:** approved expression family, eye-open/closed, brows, gaze surfaces, mouth/viseme repertoire where a speaking character is needed.
5. **Hands/contacts:** open hand, approach, grip/pinch states, actual palm/finger orientation and near-/far-finger art, attachment to object, painted hand/prop occlusion.
6. **Hidden surfaces:** sleeve inner edges, body behind arm, scalp/hair under face, prop back, world clean plates, surfaces exposed by rotation, deletion or movement.
7. **Mechanical/diagram components:** changing quantities, real moving linkages, state labels, token/symbol sources, arrows and interaction masks.
8. **Materials and lighting:** source-approved color/shading passes; near/far materials; moving occluders and receivers; optional dynamic shadows only when justified.
9. **Camera/world:** exact range of camera poses and zoom; world overscan and artwork density at closest view; safe framing of moving subjects.
10. **Transitions:** all independent OUT, MIDDLE, IN and mask/occluder plates, or intentional cuts with specified end/start states.
11. **Alpha and crop:** truly transparent parts, pre-multiplied edge handling, no invented pixel surfaces, size/density requirement.
12. **State identity and continuity:** which original master every derivative must preserve, allowed transformation edge, expected art-state transition.
13. **Interaction exposure:** which new painted pixels become visible at every contact/turn/deform; choose edit/additional cel when needed.
14. **Output/QA ownership:** exact ArtJob, consumer action, frame interval, required image name/hash and visual reviewer tests.

Build a **state coverage matrix** indexed by film/shot/frame interval/identity/body pose/view/expression/EYES/MOUTH/HAND/material/occlusion. A state can be "not applicable" only with a grounded reason; unknown does not mean pass.

### 4.3 Before-art feasibility — bounded claim only

The engineering preflight can check whether the engine has a producer for each **movement class**, required part, state switch, contact, deformation, camera technique and sound operation. It cannot know the actual approved limb lengths, pixel pivots, elbow silhouettes or painted occlusion before art exists.

Output one of: **SUPPORTED_IN_PRINCIPLE**, **MISSING_ART_REQUIREMENT**, **MISSING_ENGINE_PRODUCER**, **INCOMPLETE_DIRECTION**, **AUTHORITY_REQUIRED**. No false claims of physical proof.

If a necessary movement route is missing, either implement and qualify its general producer first or ask GPT for an **authorized** creative alternative. The engineer must not simplify without approval.

### 4.4 Construct the F01–F80 production plan

- Verify installed current skill **construct-kurzgesagt-art** actually includes F01–F80 and its required source references, source-native visual witnesses and first-pass compiler. An old F01–F50 skill is insufficient.
- Apply only relevant methods by subject family, viewing scale, physical function, projection, material, environment and visual attention, with exact source-grounded decisions. Do not blindly inject 80 method names.
- Tie each applicable F method to a real construction operation (geometry language, character face, palette roles, shading, texture, depth, detail allocation, interactions) and a review criterion.
- For every high-impact decision provide the actual source observation/witness region, unlike-source contrast and specific choice for this unfamiliar subject. Style references are STYLE ONLY: do not copy source film compositions or content.
- Do not let a request become merely "cute vector cartoon, oval head, tube arms, bright colors." Those vague instructions fail the artistic goal.
- Define canonical approved master first; derived views/states are **source-attached edits** with exact visual identity preservation and consistent line/edge/palette system.
- When a full instruction exceeds provider limits, partition into ordered nontruncated stages; carry immutable identity control and predecessor attachment forward. A prompt stage that drops a required F method must fail.
- Repair memory from previously qualified failures must influence the next first generation where applicable, not only explain a bad output afterward.

### 4.5 ArtJob dependency graph and approval points

Create dependency order:

**(a)** master identity concepts → **(b)** approved master image → **(c)** part cutouts + underpaint + masks → **(d)** view/pose/expression/hand cels and state edits → **(e)** environment/prop/diagram masters and moving planes → **(f)** transition/lighting/effects art → **(g)** integrated art/rig requirement completeness.

The graph is **dependency-driven**, not a fixed inventory of 7, 28, 52 or any other number of pictures. Independent world masters can be created in parallel; dependent edits cannot precede their approved parent.

For each job, include: master lineage, target role, connected actions/frame spans, F methods and native witnesses, request-stage order, alpha/resolution, specific landmarks and hidden surfaces, precise user instructions, provider/import source, review and rejection tests, and a typed missing-art reason.

**Stage 3 passes when all expected artwork needs are enumerated and the technically supported pre-art plan has been approved. It does not imply the actual images already exist.**


---

## Appendix A — original published source snapshot information (preserved)

### YT-VIDEO-PRODUCTION-LAB: source snapshot for independent audit

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
