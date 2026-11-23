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

## 5. STAGE 4 — GPT actually creates and human approves the artwork

**Where work happens:** manually in a **new ChatGPT conversation** with the authentic current installed F01–F80 skill; not inside Claude Code unless a specific explicitly approved image provider is actually available. An ArtJob prompt is **not** an illustration.

### 5.1 Import the complete, sealed art request

Each new ChatGPT art chat must start from the real job package, not recollections:
1. Verify job version, exact approved script/direction revision, art identity, approved master/predecessor, and source skill version/hash. If the instruction package references another project or stale art ancestry, refuse it.
2. Read the applicable construction-method source files, not just a list of F-numbers. Inspect supplied native style-only witness images and unlike visual contrasts.
3. Attach the canonical master or approved predecessor for derivatives. **A text claim such as "keep the same character" without the actual master image is not sufficient evidence of identity control.**
4. Read the exact action, view, material, expression, contact, hidden surface, camera and alpha requirements, including expected rendered state and frame ranges.
5. Verify that the job describes an original subject with the intended whole visual language; source works control **style construction**, not copying the source films' people, environments or compositions.
6. Before generation, check that the requested output can realistically be represented by one image, transparent part, coherent cel sheet, vector path or an ordered image-edit sequence. Do not demand that one static PNG independently provides two contradictory viewpoints.
7. If vital source witnesses, identity images or authoring decisions are absent, stop at **ART_JOB_INPUT_MISSING** with a list of exact files or decisions.

### 5.2 Actual production sequence

1. Generate canonical identity masters or world masters first. Inspect whole look: silhouette, face/anatomy, materials, shading, edge consistency, composition, hierarchy and detail distribution.
2. Approve the canonical master **before** using it as the parent of dependent edits. Reject weak art; do not force a mediocre master to become the entire film's visual identity.
3. Create derived transparent parts, hidden surfaces, masks, occluders, alternate body views, state cels, expressions, gaze/eyelids, hand closure and all other required art using **source-attached edit operations** that preserve the canonical design.
4. For different poses, ensure the illustrated limb and fabric contours are visually acceptable *in that particular pose*. Merely rotating a straight arm PNG must not be called a convincing bent elbow.
5. Preserve front/rear finger ordering around props; close/open hand states need actual painted contact surfaces. Transparent underpaint must cover newly exposed seams.
6. Create backgrounds in sufficient **painted** width/height for every approved camera position and zoom; no blurred enlargement or blank corners when the camera moves.
7. For environment and mechanism parts, maintain physical connectivity and correct material/edge/palette roles; no generic substitute symbols.
8. Where an artwork state is returned by the engine as missing, generate the **specific dependent state** needed; preserve previously approved ancestors rather than restarting all art or introducing a new unrelated identity.
9. Keep the real original generated PNGs unmodified on import, alongside hashes and provenance. Any cropping/resampling in registration creates a new derived artifact with its own provenance.
10. Submit candidates for **visual** review at full target scale and at cropped high-resolution detail; look for anatomy, identity, underpaint, cutout seams, alpha fringing, perspective, readable layering and output correctness.
11. Select/approve only genuine images via authorized review. A model saying "looks good" is not a human production signature.

### 5.3 Image-specific gates

| What to check | Actual failure to detect |
|---|---|
| File existence, PNG decode, width, height, alpha | A prompt/opaque screenshot falsely passed as a transparent part |
| Master identity and ancestry | New face/hair/costume when the same character was requested |
| Silhouette, face, hand anatomy | Good master but malformed profile, rubber hose, oversimplified grip |
| Alpha and hidden regions | White matte, black fringe, hole under a rotating elbow |
| Part separability and masks | Image is one flattened character despite articulation requirements |
| Contact and near/far layers | Fingers cannot wrap around a handle |
| Material, palette, lighting | Edits change the art style or cast incompatible shadows |
| Camera requirements | World becomes empty beyond a move or upscaled at zoom |
| F01–F80 operative fidelity | Required source method was mentioned but not implemented in the image |
| Fit to required action | Parts/states cannot perform the directed action without distorted anatomy |

**Important:** GPT image generation can create beautiful pictures, but may not return perfectly aligned transparent component layers or independent editable artwork on the first attempt. The system must detect this before animation. A composite full-character image never counts as enough for jointed action by itself.

### 5.4 Exact import handoff

Existing code already includes **engine/tools/art_outbox.mjs** commands **export-gpt-job**, **import-gpt-candidates**, **select-candidate**, **ingest-master**, **ingest-part**, **review-master**, **review-part**, and related state approvals. The GPT handoff is implemented in **engine/art_bridge/gpt_handoff.mjs**; Claude must prove the entire actual path works for real images, not only isolated synthetic ones.

Expected path:
- approved design + art-motion contract → exact immutable GPT job export (with witnesses/master/predecessor)
- real GPT generation → unmodified image + operator-attested origin
- verified import and SHA → candidate selection
- independent whole-look review
- registration and full geometry check
- exact hash-scoped human approval for masters, parts, states and transitions.

Origin claims from a manual ChatGPT session are **operator-attested**, not magically cryptographically provider-verified. A valid imported image is not automatically approved, and a valid artistic image is not automatically motion-ready.

**Stage 4 exit:** real approved image files for every required art state, exact lineage, no unknown required drawing and the full technical image intake completed. If any real art is missing, the correct status is **BLOCKED_ON_GPT_ARTWORK** with actionable ArtJobs.

---

## 6. STAGE 5 — Claude fits the animation system to the approved images

**Input:** approved actual image bytes + exact part/state inventory + the approved full directional/physical action graph. Never start from synthetic default skeleton dimensions as if they were the design.

### 6.1 Canonical registration of each part

1. Decode source PNG/SVG using approved parsing; reject missing bytes, bad dimensions, non-finite or invalid geometry and fake alpha.
2. Record real raw-pixel bounding box, partial-alpha edges and required crop. Preserve the original file and hash; cropped/registered derivatives get new hashes.
3. Gather **reviewed** source-image landmark coordinates and matching canonical-master landmark coordinates, with coordinate-space identifiers. Never guess a joint from only the part name.
4. Choose an allowed **similarity** or **affine** source→canonical transform. Similarity needs at least two noncoincident correspondences; affine needs at least three non-collinear correspondences.
5. Reject degenerate, numerically unstable, mirrored, unexpectedly skewed or disallowed scale transforms. An affine best fit is not permission to deform the artwork's identity.
6. Compute per-landmark residuals and actual transform inverse; fail when above specified acceptance limits.
7. Compute the crop-local origin/transform and pivot. Confirm the intended painted joint area, attachment zone and acceptable seam coverage.
8. Recompose each registered part over the canonical approved master at rest. Save **rest overlay + difference** and inspect edges, colors, holes, underpaint and double-painted components.
9. Verify mask/occluder ownership, parent-child draw order, local-to-world transform and inherited opacity; parent rotation must carry the correct child pixels and sockets.
10. Validate hidden surfaces across the motion's exposed area, not only at the canonical rest pose.

Existing producer: **engine/art_bridge/registration.mjs**; it already has landmark transform and overlay mechanisms. Those are necessary but not sufficient proof of animated anatomical quality.

### 6.2 Fit a real art-first rig

- The approved art establishes root, body segments, joint pivots, visual attachment contours and hand/foot contact patches. Do not retrofit a generic 2D stick person into every silhouette.
- Fit each limb chain using its actual measured interfaces and validate lengths, possible bend branches, approved degrees of freedom and state-specific pivot movement.
- Keep rotation/deformation limits justified by actual image behavior. A painted three-quarter hand is not freely rotatable through all viewpoints.
- Distinguish a **rig joint** from a **painted contour**: valid joint coordinates do not prove a realistic elbow or hand silhouette.
- Map rendered part IDs, state-channel binding and near/far paint passes. A pose ID must not automatically determine eyelid/mouth/hand state.
- For physically linked props, define both the **actor socket** and the **prop socket**, their 2D bases/orientation and which world owner drives the object. Never animate them as unrelated authored curves during an intended physical contact.
- For cels, record exact shared anchors and allowed transitions; for deformations, approved mesh/path topology and target contours; for worlds, authored depth planes and camera-safe coverage.

### 6.3 Check **every required frame** after fitting

For EACH action and frame in its actual film interval, evaluate the **complete** planned state:

1. Primary directed keys / motion phrases; correct interpolation/velocity.
2. Acting/secondary additions, precedence and joint limits.
3. Pose, view, expression, eyes, mouth, HAND, lighting and occlusion states.
4. Art-state transitions and valid predecessor/successor drawing.
5. FK/IK, correct bend branch, joint lengths, active contact target/orientation and residual.
6. Support/plant, COM or appropriate stylized support, balance and foot-ground relation.
7. Actual grip art state, palm position/orientation, finger/handle overlap and near/far painted order.
8. Prop reaction, force-trigger connection, hinge geometry, allowed mechanism state.
9. Deformation/morphology topology, alpha, seams, no collapse or inverted mesh triangle.
10. World/camera coverage and transition state availability; source density at zoom.
11. Active visual owner and expected observable motion consequence.
12. Any exceptions or missing plan/asset. **One exception is a failed frame, never a frame silently omitted from a measurement.**

Evaluate the entire sequence with boundaries and frame-subframe transitions where motion blur changes sampling. Verify the scene's *visual shape* across extreme frames, not just a list of residual numbers.

**Important bug-class guard:** zero matching motion plans or zero evaluated required frames can never return FEASIBLE. A "no errors because nothing ran" report is an invalid pass.

### 6.4 Resolving impossible motion

Apply this order, preserving creative authority:

- **Engine defect:** fix general math, coordinate ownership, state routing or solver first; protect with adversarial regression and unrelated-subject proof.
- **Bad measurement/part:** ask for a correctly registered existing image or reviewed landmark correction; do not regenerate artwork without cause.
- **Missing art state:** generate the exact additional approved view/pose/hand/underpaint or cel through the Stage 4 GPT route.
- **Actually impossible planned geometry:** give GPT a typed constraint and bounded staging/timing alternatives, explain how they change audience impact, obtain approval and recompile.
- **Unsupported class:** no generic downgrade; report precise missing producer and block.
- Invalidate changed dependent hashes/receipts; keep unrelated approved assets and previous evidence.

### 6.5 Stage 5 exit

**POSTART_MOTION_FEASIBLE** requires all applicable frames evaluated, explicit all-action coverage, supported art-state transitions, approved geometry/deform authority, no unsatisfied contacts, correct camera footprint and independently inspectable geometric/visual overlays. The status does **not** yet prove dynamic beauty or a final rendered film.

---

## 7. STAGE 6 — Neutrino performs actual expressive motion on approved pixels

### 7.1 Functional benchmark

The original Neutrino project in **reference/neutrino_2m_SOURCE_PACKAGE/** contains real acting routines: authored poses, joint lag, breath, blink, facial/mouth changes, hair/prop follow-through and camera-controlled scenes. Its working character geometry was code-generated and visually limited. **Reuse the behavioral principles, not the original drawing or subject-specific bone labels.**

Current pipeline components include **engine/runtime/nu.js**, **engine/art_bridge/temporal.mjs**, **engine/art_bridge/acting.mjs**, **engine/art_bridge/state_channels.mjs**, **engine/art_bridge/execution.mjs**, **engine/art_bridge/scene_graph.mjs**, **engine/art_bridge/render.mjs**, **engine/art_bridge/runtime/bridge_rt.js**. Their presence is not proof each actually affects painted production frames. Prove the path from approved art bytes through browser pixels.

### 7.2 Per-frame evaluation order, once and deterministically

For a requested frame **f** (or valid shutter subframe), the production engine must:

1. Verify film/shot/action, revision, source artwork and approvals.
2. Determine exactly one active shot/world/camera and all required actors/props/effects.
3. Resolve canonical state timeline and action phases at f; never reset a held state merely because a new action starts.
4. Evaluate primary directed keys and compiled movement phrases; confirm they actually drive the intended owner.
5. Add conditional acting: anticipation, breathing, gaze, delayed joints, relevant expressions, settling, secondary accessories; do not overwrite a more important directed gesture.
6. Resolve contacts, active grip and releases; apply IK/physical limits and support to the **same underlying local joint transforms**.
7. Propagate physically connected object reactions using the intended driver, hinge/constraint and actual state. Handle mechanism-specific motion through a qualified reusable operation.
8. Resolve painted state cels (pose, view, face, hand, etc.), transformations, masks, deformation/morph and lighting/shadow passes.
9. Calculate world/rigger hierarchy and camera once, preserving transform ownership. Validate all needed world art is present.
10. Build the actual SVG/DOM/image render passes from the **approved raster/vector source art**. Never inject generic circles, tubes or stock facial geometry to fill missing production art.
11. Apply the Neutrino timeline/row state at f in a live Chrome composition; wait for image decode. Render in a deterministic order regardless of requested frame seek order.
12. Collect actual frame RGB24 and independent per-owner evidence (including blur when used). Fail if render mismatches, owner disappears, image is swapped, unexpected pixels appear or the intended visual action never happens.

**Precedence rule:** Director-approved primary motion is highest creative intent; optional acting may enrich it; physical constraints must preserve legal contact/support and must either satisfy the intent or produce a typed unsatisfiable failure. Never silently erase required acting.

### 7.3 What "expressive animation" specifically requires

| Discipline | Required observable behavior |
|---|---|
| Timing | Intentional preparation, anticipation, acceleration, hold, overshoot/recovery when applicable; not arbitrary linear movement |
| Pose | Clear readable silhouette and acting; approved alternate view for large turns |
| Anatomy | No impossible elbow/knee bend, shoulder disconnect, limb extension or wrong-side grip |
| Weight | Feet/ground remain coherent; hips/torso/support move before consequential force |
| Contact | Painted palm and fingers meet/hold/release the prop; hand and prop move together only during the intended interval |
| Mechanism | Linked parts move because of their designated driver; final mechanical state visibly reached |
| Face | Eyelid, gaze, brows and mouth use approved artwork states, preserving head identity |
| Follow-through | Hair, sleeve, tail and loose props lag/settle in a manner justified by the subject and design |
| Deformation | Actual painted contour deforms legally; approved cels replace states unsuited to mesh bending |
| Staging | Concurrent motion doesn't hide primary visual information; controlled recognition holds |
| Camera | Purposeful framing; no unsupported pseudo-3D projection, crop, head cutoff or empty uncovered plate |
| Sound-ready timing | Actions and audio cues share exact frame clock; enough time to see a reveal or read text |
| Continuity | No pose/prop/face/world teleport at cut or state boundary without an explicit transition |

### 7.4 Specific hard cases and required failures

**GRIP / RELEASE**
- A locked GRIP must have a real contact contract; absence is an error.
- Resolve the **HAND state**, not the body pose, for an approved painted closure drawing.
- Verify the actual palm basis, target socket, contact patch, finger overlap and near/far prop order.
- Approach → contact → grip → applied motion → release → separation must have logically distinct phases.
- If body pose says GRIP but hand stays open, the real visual check must fail.
- A release requires end of possession plus the correct hand and object behavior, not simply that the contact interval ends.

**JOINT, SUPPORT AND FORCE**
- Contact target residual includes position and orientation; source/target basis must be from real measured art.
- Joint limits/length/bend branch cannot be violated, even by acting additions.
- Ground/foot support cannot teleport during reach; body weight must transfer where the animation claims force.
- A prop must visibly respond according to the commanded action; nonzero tiny movement is not sufficient for an OPEN/PULL event.
- A mechanism's linkage has a typed driver and end-state test, not independent animation that coincidentally appears synchronized.

**FACIAL AND CHANNEL STATES**
- Body pose/view/expression/EYES/MOUTH/HAND/CLOTHING/LIGHTING/OCCLUSION remain independent.
- Directed state change outranks optional generated blink/acting; equal-priority contradictions fail.
- Eye/viseme imagery is required to physically exist and be approved.
- Speech events use actual sound/phoneme timing where available; a text-vowel approximation is not evidence of precise lip sync.
- All state transitions preserve head/face identity and correct exposure across cuts.

**MORPH AND DEFORMATION**
- Vector morphs have homologous approved paths and actual per-frame path-attribute updates.
- Raster deformations have nonoverlapping topology covering actual painted regions; summed triangle area alone is insufficient.
- No flipped triangle, inverted seam, uncontrolled elastic stretch, alpha tear or paint loss at intermediate frames.
- Mesh or path approval binds exact source art, vertices/paths, target, limits and geometry revision.

**CAMERA, EFFECTS, SHADOW, TRANSITIONS**
- Camera's purpose and accessible world representation are approved before movement.
- Source planes are truly available at required scale/overscan; unseen world is not manufactured by the camera.
- Particle effects actually change rendered pixels and remain visible despite CSS/inline display ownership.
- Character shadow/grounding agrees with approved materials and feet when required.
- Every transition has complete OUT/MIDDLE/IN art and consistent shared anchors, or is an explicitly motivated cut.

### 7.5 Real rendering path and proof

Required path: approved art hash → imported registered part → compiled motion → calculated transforms and state bindings → **actual nu.js seek / row application** → Chrome composition → decoded frame → approved visible pixels → action-specific QA. A transform table with no consumer is not animation.

Required negative controls:
- freeze actor but leave particles moving;
- freeze prop but move character;
- switch hand closed→open during a grip;
- remove actual blink cel or view art;
- invert deformation/omit an alpha region;
- change camera to expose unpainted world;
- alter motion phrase without changing rendered owner.

Each must be caught by the **appropriate** action-specific verifier. Whole-frame hashes alone fail this requirement.

### 7.6 Stage 6 exit

**MOTION_EXECUTION_QUALIFIED** on the actual approved artwork requires a real continuous rendered segment with correct registered art, validated movement, state continuity, action consequences, contacts, composition and per-owner evidence. A simple synthetic diagnostic shows renderer mechanics only; it cannot certify the target art's beauty or the actual GPT-art-to-motion connection.

---

## 8. STAGE 7 — produce, inspect and approve the exact finished film

### 8.1 Production rendering and reproducibility

1. Validate correct creative/engine approvals and all stage dependencies before any expensive render.
2. Freeze revision across all code, script, director, art/design, real image bytes, rig, motion plans, masks, transitions, fonts, witnesses, audio and approvals.
3. Pin Node, browser/Chrome, FFmpeg versions, capture viewport, color settings, seed and deterministic rendering conditions.
4. Render actual frames 0..N−1 in the authoritative clock with *no gaps, duplicates or mixed source versions*. Use 1080p RGB24 and correct image decoding; PNG bytes are not raw RGB bytes.
5. Stream frames to encoder with backpressure; never hold the full 600/7200 uncompressed RGB frames in RAM. A 1920×1080 8-bit RGB frame is **6,220,800 bytes** before additional surfaces/overhead.
6. Produce independently verifiable lossless FFV1 segments or equally evidenced deterministic intermediates. Every complete segment has range, revision, frame hashes and probe receipt.
7. On crash/restart, reuse only *verified fully complete* matching segments. Partial segments are not success and cannot be appended as if complete.
8. Assemble video essence from the correct segments. Probe actual dimensions, 60/1 frame rate, decoded frame count and duration.
9. The renderer's own success receipt cannot be used to bypass frame- or owner-specific motion QA.
10. Ensure every recorded output actually corresponds to the frozen source revision; a changed file/approval invalidates downstream evidence.

### 8.2 Audio is not simply "attach narration.wav"

- Create/obtain genuine narration recording and its measured word/phoneme alignment. If the needed voice recording is missing, report **AUDIO_INPUT_MISSING** rather than inventing timings.
- Compile independent narration, SFX and music buses using the approved direction; include intentional silence and transitions.
- Verify each causal SFX actually belongs to the required action, not just that some unrelated sound appeared nearby.
- Align narration words and visual proof/reveal frames; preserve timing on shot boundaries.
- Set meaningful gain envelopes, ducking and loudness according to the approved target; reject clipping, wrong track or silent required cues.
- Produce final mixed audio and bind its SHA to the source narration/SFX/music stems and exact timeline.
- **Mux the VERIFIED final mix with the VERIFIED video essence.** Do not publish an old silent or earlier-mix MP4 if S09 audio is created after S07 video.
- Decode the final MP4 audio stream, inspect timing after AAC/container offset and verify narration intelligibility, cue identity, loudness, sync and film duration.
- Human listens to the actual final MP4, not only the separate WAV file.

### 8.3 Three layers of final review

**A. Automatic technical review**
- Frame count, dimensions, rate, gaps/duplicates, source hashes, alpha/art owner presence, camera coverage, pixel corruption, allowed transforms, sound stream and loudness.
- Every required state transition and every action's expected visible result must be attributed to its actual subject.
- Render error, thrown exception, missing owner sample, untested frame and failed QA are failures.

**B. Critical artistic/motion review**
- Native-resolution film and difficult frame sequences inspected for genuinely professional illustration, clear explanatory mechanisms, emotional pacing, expressive acting, anatomical believability, silhouette, clean transitions, stylized lighting, lack of generic filler, legibility and coherent sound.
- A robot can measure an image change; that does not establish the art is beautiful. The reviewer may reject a technically clean but weak film.

**C. Authorized final approval**
- Review the exact mixed, muxed final MP4 and its revision.
- A hash-scoped HUMAN receipt points at that precise output and may be invalidated if anything changes.
- Never approve from a synthetic diagnostic flag, arbitrary JSON "PASS" or self-signed machine receipt.

### 8.4 Final deliverables

- **FINAL_APPROVED_VIDEO.mp4** (only if all final gates pass);
- exact project source/manifest, direction and approved artwork dependencies;
- source/renders/audio hashes, frame-source map, action-to-pixel evidence;
- approved output and signed review; failures and deferred defects;
- reproducible commands and recovery state.

If review fails, preserve previous evidence and re-enter at the **earliest incorrect producer** (story, direction, art, registration, motion, sound or QA). Re-run only logically affected stages plus all dependent evidence. Do not camouflage defects with overlays or unsupported camera movements.



---

## 9. Invariants across EVERY stage — what cannot fail silently

These rules apply whether a future film is 10 seconds or 20 minutes, whether it depicts a human, organism, machine, educational diagram, nested world or mixed scene.

### 9.1 Fail closed when the system doesn't know

- **Unknown is not false and not pass.** Unknown creative source, unknown rig landmark, missing approved image, missing state, unknown semantic verb, untested contact, missing camera coverage or absent evidence must produce an explicit blocker.
- **No creative substitution without authority.** Claude may optimize internals but cannot replace a hard moving visual metaphor with a static slide, replace a difficult pose with generic geometry, delete required secondary action, or weaken a camera move to make the renderer pass.
- **No fabricated work.** A generated prompt is not generated pixels. A review packet is not a reviewed image. An audio cue file is not actual narration. A complete frame log is not a beautiful film. A signed diagnostic receipt is not production human approval.
- **No test/diagnostic to production contamination.** Separate namespaces, keys, assets, render paths and signed trust anchors. Production rejects diagnostic art and fixture authority even if an MP4 looks valid.
- **No unexplained "not applicable".** Every excluded art state, F-method, motion class, QA requirement or review task has a verified applicability predicate and reason.
- **No fixed counts in reusable producers.** Do not hard-code exact picture count, 28 shots, human skeleton count, one particular lever/door/washer, or 7,200 frames into universal logic.
- **No hidden work.** The ledger must identify actual executed tasks and outcomes, not statuses claimed by narrative summaries.

### 9.2 Read-only readiness vs mutating work

A user querying **preflight** must not cause generation, video rendering, audio mixing, approval changes, cache promotion, report overwrite, or manifest edits. Preflight may inspect hashes, schema, file existence and proposed tasks. Executable work only begins in an authorized run, with checkpoint, provenance and appropriate billing authorization.

### 9.3 Source identity, security and authorization

- All production-reachable source code, dependencies and relevant generated artifacts must be traceable to a Git commit or exact content digest. Beware modified uncommitted code.
- Same-size or same-mtime code changes must still invalidate content-addressed proofs; mtime alone is insufficient.
- Manual external ChatGPT sessions should be represented with operator-attested provenance and exact output-image bytes. Don't claim automatic cross-app authentication where it doesn't exist.
- External reviewer keys stay outside repo and outside Claude. Human decisions are verified on the exact bundle/scope, not on an arbitrary review string.
- A changed source art image, rig, creative intent, motion plan, audio file or human review invalidates only affected downstream proofs according to the declared DAG.
- Expired/revoked/replayed approvals, two simultaneous conflicting writers, crash mid-write, stale chunk and wrong version after resume must all be refused.
- Public GitHub excludes secrets, local private keys, non-republishable film stills and copyrighted source-witness files. Locally authorized assets are resolved by hashes, not posted publicly.

### 9.4 The earliest-wrong-producer rule

When a final animation looks wrong, locate the first wrong stage, instead of applying a late cosmetic patch:

| Symptom seen in final output | Earliest likely producer to inspect | The wrong shortcut |
|---|---|---|
| Viewer cannot understand the mechanism | Story truth or direction | Add decorative arrows after rendering |
| Scene feels boring/static | Experience Director and choreography | Add random particles/camera motion |
| Character style changes | Art canonical master/derived edit | Add color filter to hide mismatch |
| Elbow becomes a tube/tears | Missing pose cel, wrong underpaint or rig/deform contract | Stretch image or redraw generic limb in code |
| Grip misses/prop floats | Socket measurement, contact, HAND state or object reaction | Move prop by hand until screenshot looks aligned |
| Face looks wrong in 3/4 | Missing approved view art | Rotate flat front face |
| Camera sees empty plate | Pre-art world coverage or stage camera plan | Black rectangle, fake blur or arbitrary zoom |
| Shot continuity pops | Shared state timeline/transition contract | Reset actor on cut and crossfade |
| Audio cue is late | Actual audio alignment and mux | Edit metadata so timing appears correct |
| Render freezes while background moves | Owner-specific motion compiler or render QA | Test only whole-frame hashes |
| Verification passes missing behavior | Stage task, applicability, consumer or QA evidence | Add a success flag to JSON |

A defect is repaired only when the correct producer changes, its real consumer changes the pixels/audio as intended, negative reproduction is caught, and unrelated subjects do not regress.

### 9.5 Required failure record

Each failure needs:
- **Failure ID and affected action/shot/frame interval**.
- **What was expected**, in viewer-visible and machine-checkable terms.
- **What actually happened** and where the evidence is.
- **Exact source producer and consumed inputs**, hashes, code revision.
- **First violated invariant** (not only a last-stage MP4 symptom).
- **Repair route:** story/direction, missing art, registration, rig/physics, visual runtime, sound, human review, environment or unsupported operation.
- **Blast radius:** what existing art, approvals, compiled tracks, render chunks and review receipts become stale.
- **Next permitted operation and owner**, including whether GPT/user approval is needed.
- **Original failing reproduction**, corrected positive, negative/counterfactual and unlike-subject transfer.
- **Honest status:** BLOCKED, FAILED, IN_PROGRESS, CORRECTED_UNVERIFIED or VERIFIED_CLOSED.

### 9.6 Runtime/ledger handoff invariants

The S00–S09 stage engine described by **engine/production/stages.mjs** and **engine/tools/production_run.mjs** must preserve:
- S00 idea/intent and provenance;
- S01 sourced story and actual approval;
- S02 complete Experience Director;
- S03 typed action/motion plan and camera/physical feasibility;
- S04 artwork demands, source-grounded visual design and GPT ArtJobs;
- S05 real pixel intake/registration and post-art fitting;
- S06 authority/approval and exact art-state closure;
- S07 verified Neutrino/Chrome video essence;
- S08 rendered owner/action/camera QA and visual review obligations;
- S09 real audio mix, verified mux and final publication.

**Stage names are implementation labels**; this README's seven conceptual stages are responsibility boundaries. There must be a documented map from each conceptual gate to executable S00–S09 tasks, with **no unowned obligation**. Reconcile actual stage ordering where approval, final audio mux or independent final review require different dependencies.

**Task integrity:** if a required obligation exists but produces no task, that is a failed task-generation invariant, not automatic success. If a frame throws an exception, record it as failed, not skipped. If zero required frames were evaluated, the result cannot say "feasible." If an owner is expected but attribution is absent, fail rather than skip.

---

## 10. Known integration risks requiring source and test closure

**Snapshot basis:** these are source-level risks and defects identified in/around P03 SHA **900a6b14e2dfeeb2d59ec87a0e84e71ce45e1835**, together with the still-binding historical F001–F092 failure categories. They are **not** claims about a newer, uninspected local Claude working tree. A later repair must reproduce each issue on the old SHA and prove corrected behavior on its new SHA.

| Priority | Component / function area | Risk and exact invariant to prove |
|---|---|---|
| P0 | GPT creative packet → existing film | The new **docs/gpt-creative-control/** creative schema/validator is a draft on a separate branch. No verified producer currently imports its packet and compiles all S00–S09 authority inputs. Implement a tested lossless adapter; unsupported creative decisions fail, not get dropped. |
| P0 | **schemas/motion_art_manifest_v2.schema.json** | The P03 schema constrains **total_frames = 7200**. Parameterize positive duration/frame total and all dependent consumers. Prove 600 and 7200 *schema/logic* compatibility without another 7200-frame render. |
| P0 | **engine/story/action_coverage.mjs** | A limited known-word scan cannot prove semantic completeness of arbitrary GPT scripts. Unknown actions must become typed requirements/refusals; CONTACT_END must prove real release, not merely any contact event. |
| P0 | **engine/tools/compile_film_contracts.mjs** | Direction and ACTION_PHRASES can be separately validated while runtime reads **plan.phrases**; require direct source-to-render consumption and causal mutation proof. |
| P0 | **engine/story/experience.mjs** | "Attention owner has some overlapping track" is weaker than "specified intended action visibly happened"; require director-decision-specific consumer and observable consequence. |
| P0 | **engine/art_bridge/asset_state.mjs** | State intervals starting from defaults for each separate action can lose carried pose/view/HAND/possession continuity; maintain one canonical state history across actions/cuts. |
| P0 | **engine/art_bridge/art_demand.mjs** | Grip artwork demand partly relies on body pose rather than independent HAND channel; requirement closure must include real grip/eye/mouth/view states and transitions from acting + direction. |
| P0 | **engine/art_bridge/art_intake.mjs#feasibilityFor** | Zero matching motion plans/zero evaluated required action frames can falsely return FEASIBLE; check complete actual state and count failures including thrown frames. |
| P0 | **engine/art_bridge/state_channels.mjs** | Directed vs generated event precedence and same-frame conflicts require stable explicit priorities; don't let optional blink/mouth event erase directed art state. |
| P0 | **engine/art_bridge/scene_graph.mjs** | Locked GRIP with no actual grip contract cannot continue unchecked. Validation must read approved HAND-channel closure and painted palm/finger ordering. |
| P0 | **engine/art_bridge/execution.mjs** | Raster deformation mesh coverage cannot be proven by summed triangle areas (overlap can hide a hole); require actual union/topology/alpha validity and signed approved deformation. |
| P0 | **engine/film/chrome_frames.mjs** | Motion-blur rendering must supply owner-specific attribution corresponding to the actual composited shutter result; unblurred or missing owner evidence is not proof. |
| P0 | **engine/film/coverage_gate.mjs** | Missing owner data or <2 samples cannot be silently skipped. Background motion cannot mask a frozen actor, absent blink, wrong grip or inert object response. |
| P0 | **engine/production/stages.mjs** | Frame-evaluation exceptions must never be caught and silently ignored; stage tasks and actual frame counts must cover every required operation. |
| P0 | **engine/tools/production_run.mjs#preflight** | A "read-only" preflight currently calls ordinary task run functions in P03, some of which may have side effects. Separate inspections from actual generation/render/mix and prove tree hashes unchanged. |
| P0 | **engine/production/stages.mjs S07/S09** | Video may be rendered/assembled before final audio mix, and later mix may not be muxed into **the published MP4**. Bind actual muxed audio stream to final video receipt. |
| P1 | **engine/film/film_revision.mjs** | Code closure uses a cache keyed on file stat metadata (size/mtime); strong content changes must never accidentally reuse a stale digest. |
| P1 | **engine/film/segment_render.mjs / CLI** | User-facing optional motion-plan args must resolve a unique authoritative plan or fail before render; never read an undefined path or render a stale plan. |
| P1 | **engine/art_bridge/approvals.mjs** | The global approval sweep must include all reachable independent state-channel drawings/edges, deformations, masks and affected review scopes. |
| P1 | **engine/art_bridge/acting.mjs** | Blink/breathing/speech timing must validate finite positive parameters, film/cut boundaries, joint limits and conflicts; fake text-vowel lip-sync isn't measured phoneme alignment. |
| P1 | **engine/art_bridge/contact_solver.mjs / constraints.mjs** | Geometric reach/balance alone cannot prove painted contact or believable applied force; connect hand/foot artwork and actual mechanism response with visual qualification. |
| P1 | **engine/art_bridge/source_method_causality.mjs** | Camera/world coverage sampled sparsely can miss an extreme between samples. Full camera-path maxima/continuous safe bounds or frame-by-frame check required for final film. |
| P1 | Legacy P02 regression **P02-R14** | Diagnostic world plate **rt_world_far** had no design trace record in the reported fresh-checkout test. Repair fixture producer while preserving required trace gate. |
| Release | **F001–F092 original two repair directives** | Historical failures include artwork completeness, source method control, state coverage, visual QA, render memory, proof provenance, review authority, resume/concurrency and actual ChatGPT art handoff. Every row requires a verified disposition. The code's own "PASS" report cannot substitute for original reproduction and negative test evidence. |

**Do not address this table by hardcoding a test story or weakening constraints.** Each row is a reusable producer/consumer invariant; every repair needs its own precise regression and cross-subject proof.

### 10.1 Readiness matrix — what is actually demonstrated vs not yet demonstrated

| Capability | Source-level support in P03 | Required proof before declaring ready |
|---|---|---|
| Original Neutrino runtime and actual raster transforms | Present; diagnostic Chrome proof reported | Real approved GPT part pixels traced to output |
| State-channel acting / breathing / blink / morph | Implemented diagnostic behavior, with remaining bypass risks | Correct artwork/state approval, actual visible expression and whole-film continuity |
| Contact/grip/support and object reaction | Diagnostic tests exist | Real painted hand/grip/weight/prop video across every required contact frame |
| Artistic F01–F80 image generation | Art contract and manual handoff code exist | Correct installed skill, witnesses, actual beautiful master and complete derived states |
| GPT screenplay/Experience Director import | Existing typed validators; new creative packet is separate draft | Complete lossless adapter and approved creative package |
| Pixel registration and rig fitting | Real algorithms and diagnostic input | Real GPT image part fitting and appearance preservation |
| Renderer/FFv1 chunk pipeline | Long diagnostics and short P03 fixture tests reported | Fresh committed real-art 600-frame run and independent frame QA |
| Final soundtrack and approved MP4 | Mixer code and fixture audio test exist | Actual recorded narration, SFX, final mix, muxed output and synchronized listening review |
| Generalization | Multiple synthetic subject types tested | New script + unfamiliar genuine artwork + no scene-specific fixes |

Engineering and aesthetic readiness are **independent**. A developer can finish technical repair while the future film still requires manual GPT image creation and human visual approval.

---

## 11. Molecular system-level simulation — from arbitrary new idea to final MP4

This is an **adversarial dry-run of the intended contracts**, not a claim that a film was executed. The future real canary must use a user/GPT-approved NEW script rather than hardcoded test content.

### 11.1 Start with an unfamiliar idea

Assume the user asks a short educational film about how a living structure mechanically changes the surrounding world. The exact subject is deliberately not baked into the engine.

- **Stage 1:** GPT identifies the accurate scientific/mechanical claim, misconception and visually showable causal sequence. **Risk:** invented facts or false analogy. **Protection:** sourced claim ladder, question-first script and human truth review.
- **Stage 2:** GPT directs the visible cause/effect, acting and camera, its explanatory hierarchy and sound; every visible operation gets a typed action. **Risk:** lovely prose that never becomes motion. **Protection:** per-shot 12-field director contract and action→consumer→effect trace.
- **Stage 3:** The story may require the subject to bend, touch, transfer force, reveal a hidden surface, change view and transform an object. **Risk:** static masters without the necessary states. **Protection:** full state/art requirement closure BEFORE GPT image generation and engine-supported-class preflight.
- **Stage 4:** GPT generates an original beautiful master, then true dependent parts/views/occluders from that master. **Risk:** character identity drift, fake transparency, poor anatomy, missing underpaint. **Protection:** actual image review and approved alpha/lineage requirements.
- **Stage 5:** Claude measures part interfaces, fits approved geometry, then solves each required frame including state/paint continuity. **Risk:** impossible reach, bad pivots, anatomical seams, zero evaluated frames. **Protection:** real-art frame feasibility, rest overlays, impossible-motion typed refusal.
- **Stage 6:** Neutrino actually moves the approved layers; reactions follow contact, face/view shifts use approved drawings, camera reveals authored worlds. **Risk:** animation code changes but actor pixels don't, frozen art hidden by particles, stiff or wrong grip. **Protection:** direct owner/cel/morph/contact/camera proof and subjective full-motion review.
- **Stage 7:** FFmpeg produces verified video, audio buses yield the genuine mix, system muxes exact streams and verifies the final film. **Risk:** wrong audio/file despite a PASS report. **Protection:** final media stream identity, independent decode and human review.

At no point can Claude "solve" a missing view by generating its own generic face, nor can GPT declare joint feasibility before actual art exists.

### 11.2 Failure-injection walk: the critical boundaries

| Injected defect | Where it MUST be caught | Correct response |
|---|---|---|
| Script contains an unsupported factual claim | Stage 1 story-truth review | Request evidence/revision; don't animate misleading certainty |
| Director asks a camera orbit of one flat front plate | Stage 2/3 pre-art feasibility | Demand real alternate planes/views, or request approved restaging |
| Action requires a hand to grip but no HAND state | Stage 3 art-state closure | Create exact hand+near/far finger ArtJobs |
| GPT provides one lovely flattened character PNG | Stage 4 image/part inventory gate | Approve only as master, demand true parts and cels before articulated animation |
| Shoulder/palm landmarks are mislabeled | Stage 5 registration | Fail residual/overlay/painted contact, request reviewed corrections |
| No motion-plan entry matches the character action | Stage 5 feasibility | Fail NOT_EVALUATED; never return FEASIBLE |
| Two equal-priority expression events disagree | Stage 6 channel resolver | Fail explicit state conflict, preserve director authority |
| Hand reaches handle but stays visually open | Stage 6 grip/render QA | Fail HAND state and painted contact consequence |
| Contact ends but prop remains glued to palm | Stage 6 semantic release QA | Fail possession/separation and actual rendered release |
| Mechanism track moves unrelated piece | Stage 6 source/action consequence QA | Fail owner/driver mechanical relationship |
| Wrong head view appears for one frame | Stage 6 art-state and native visual QA | Fail view/canonical identity/transition |
| World plate disappears at maximum zoom | Stage 3/5 camera art and Stage 6 render | Demand larger correctly painted plate or approved camera change |
| Blur path omits owner trace | Stage 6/7 per-owner QA | Fail missing evidence; don't infer movement from background pixels |
| Render task catches a thrown frame and keeps going | Stage 7 task bookkeeping | Record failure, block stage; never silently count as inspected |
| Narration SFX WAV correct but final MP4 contains old audio | Stage 7 mux validation | Fail source hash and audio stream proof |
| Source/asset bytes changed but mtimes similar | Stage 7 revision validation | Invalidate all affected cached evidence |
| GPT manually approves nothing, Claude claims HUMAN_APPROVED | Every authority gate | Reject unauthorized receipt |
| Output looks flat/ugly despite technical success | Independent artistic review | Reject finished film, repair creative/art/motion cause |

### 11.3 Unfamiliar transfer coverage

Do not overfit solely to humans with a hand and a lever. The reusable engine requires meaningful diagnostic transfer across:

1. **Human/character performance:** face, gaze, grasp, support, weight, release and emotional acting.
2. **Nonhuman organism:** topology not matching human bones, squash/deform/cel need, secondary motion and natural mass.
3. **Mechanical apparatus:** linkage, driven constraints, distinct material parts, visible state changes.
4. **Educational diagram / environment:** approved symbols, quantities, world planes, masks, transitions, camera/attention without imaginary character rigs.

For each type, run **positive, deliberate negative and source-independent transfer** using the same general producer code and a short bounded render. These diagnostic fixtures qualify engine operations only. **The ultimate test remains an entirely new script and real GPT-generated art.**

### 11.4 What a genuine first 10-second test proves

Only after P04 engineering is verified and GPT creative packet import works:

- New idea and original script (not cloned from existing tests).
- Fully directed 600-frame film with actual user-approved creative decisions.
- Complete art state inventory created before image generation.
- GPT manually creates approved source-grounded artwork including its moving parts/states.
- Artwork actually ingested and measured, with tested feasibility.
- All 600 frames rendered by the same actual Neutrino production path with source hashes.
- At least one nontrivial articulated/secondary movement and meaningful physical or graphic cause-effect, whichever the approved story genuinely requires; no forced test-template subject.
- Genuine spoken audio and effects when directed; correct final MP4 mix.
- Complete technical checks, source/action traces, and visual inspection of difficult frames and motion.
- Actual independent human film review.

**A successful 600-frame canary proves THIS integration for the selected script/art/action set. It does not universally qualify every imaginable future action; the action registry and refusal gates must remain active.**

---

## 12. Release gates and exact operator workflow

### 12.1 Before anybody says "engineering ready"

Required successful evidence:
1. Every production-required decision has a real consuming producer or a typed refusal.
2. Every specified movement class has a reachable runtime implementation, with a causal perturbation test.
3. Art-state closure covers pose/view/face/HAND/occlusion, camera planes and transitions consistently across consecutive actions.
4. Creative authoring import is actually connected to the existing manifest/motion plan, not a parallel unusable schema.
5. Manual GPT ArtJob export/import works with actual files, hashes, native witnesses and dependency-aware resumes.
6. Registration and post-art feasibility are correctly implemented; no empty-plan false successes.
7. Contact, acting, deformation, mechanism, camera and audio proof uses real consumers.
8. Every demanded owner/action has actual evidence, including blurred frames.
9. All negative tests and historical F001–F092 dispositions are reproducible and current; no silently ignored failures.
10. Preflight is side-effect free. Revision invalidation/approval trust and crash recovery work on current committed code.
11. Exact final audio mix reaches actual final MP4 and is independently verified.
12. At least one **short end-to-end DIAGNOSTIC** execution exercises real Neutrino/Chrome code without masquerading as GPT artwork.
13. A fresh frozen checkout runs the expected complete regression suite, with evidence hashes and precise remaining blockers.
14. The final readiness report differentiates engineering readiness, GPT-art pending, real-art motion qualification and final film approval.

If any mandatory condition fails: **ENGINEERING_READY = NO**, with exact missing invariant, source file, test, owner and next operation.

### 12.2 Operating sequence for the FIRST real 10-second film

**Do not start with Claude choosing an engineering-friendly test story.** GPT and the user choose a genuinely worthwhile original micro-story.

1. Create one NEW GPT creative conversation; pin Experience Director V1, all required script/reference context and the current F01–F80 skill version.
2. Produce idea, actual script/claim evidence, complete Experience Director direction, 600-frame shot/action score and pre-art motion-ready artwork inventory (Stages 1–3).
3. Export a versioned **CREATIVE_PACKET.json** and all narrative/direction documents with stable IDs and hashes. The draft new-chat framework is at **docs/gpt-creative-control/NEW_CHAT_CREATIVE_DIRECTOR.md**, currently on **design/gpt-creative-production-contract-v1** pending production integration.
4. Run the deterministic creative packet validator plus engine pre-art support check. Return exact missing motion/visual requirements to GPT; resolve and obtain human creative approval.
5. Generate artwork **manually in another ChatGPT conversation** using the actual installed F01–F80 skill and exported approved ArtJobs; produce and approve canonical masters and all required derivative images.
6. Import actual image files; verify provenance, visual quality, registration, actual pivots and required states; obtain human art approvals. Stop with exact missing drawing on failure.
7. Run post-art physical/visual feasibility for every action frame. If impossible, request a specific art edit or authorized staging change; never silently stretch/rotate anatomy to fake success.
8. Freeze approved contracts, execute Neutrino 600-frame render, inspect source-specific animation and art identity.
9. Mix narration/music/SFX, mux final verified audio, decode actual finished film and conduct full-frame visual/technical review.
10. Approve exact final MP4 with a human receipt. Preserve every artifact, state, source hash, failure/repair and repeatable production recipe.

### 12.3 What Claude should do RIGHT NOW while engineering P04 is still running

**Do not interrupt or restart the active P04 task simply to install another authoring instruction.** Existing diagnostics at S03/manifest gates are reasonable if they are bounded code tests and fixture proofs, not substitutes for real artwork.

When the current run completes:

1. Return its actual Git branch, full commit SHA, regression status, execution evidence and blockers.
2. Read this root README (current main) **and** the creative-authoring package on the named design branch.
3. Integrate the draft GPT packet schema/validator into the actual production S00–S09 interface with real adapters, tests and version/approval ownership. Do not silently merge unrelated code or rewrite approved creativity.
4. Correct any new verified source-level defects it discovers; retain the P04 repair branch and trace every change.
5. Run short targeted diagnostic tests and a short chained engineering test, not another 120-second artless rehearsal by default.
6. Report **ENGINEERING_READY** only with evidence. Explicitly separate remaining **NEEDS_GPT_CREATIVE_PACKET**, **NEEDS_GPT_ARTWORK**, **NEEDS_HUMAN_APPROVAL**, **NEEDS_RECORDED_VOICE** and **NEEDS_FINAL_ARTISTIC_REVIEW**.
7. Only then begin the real 10-second creative session. Do not assume the existence of a staged ArtJob is the existence of a generated image.

### 12.4 Proof coverage tracker for ongoing independent audits

Maintain one live table per commit:

| Field | Meaning |
|---|---|
| SOURCE_VERSION | Exact Git SHA and outstanding working-tree changes |
| PRODUCER | Real module/function responsible |
| INPUT | Actual required exact artifact and source ID |
| OUTPUT | Exact schema/artifact/hash |
| CONSUMER | Real next function and call reachability |
| PROOF | Concrete test, actual pixels/audio, recorded event and human review where applicable |
| NEGATIVE | Deliberate failure whose expected invariant was caught |
| TRANSFER | Test on genuinely unlike subject |
| STATUS | VERIFIED, FAILED, BLOCKED_EXTERNAL, NOT_TESTED, OBSOLETE_WITH_PROOF |
| NEXT_ACTION | Exact operation needed and owner |

A file inventory can show that a file was **indexed**. It does not show that every relevant implementation was **deeply inspected**. A long passed test report does not show an artistic master was approved. The audit must keep all these statuses distinct.

### 12.5 Pinned authority documents

- **inputs/EXPERIENCE_DIRECTOR_V1.md** — full creative standard; read whole text.
- **inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md** — the approved art-and-motion architecture.
- **inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md** — historical F001–F072 defect inventory.
- **inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md** — historical F073–F092 and production evidence/authority standards.
- **reference/neutrino_2m_SOURCE_PACKAGE/** — original functioning engine/acting benchmark.
- **reference/construct-kurzgesagt-art/** — locally available source-grounded skill; some native witness imagery is deliberately not public and must be available separately for art production.
- **docs/gpt-creative-control/** on branch **design/gpt-creative-production-contract-v1** — provisional new-chat prompt, creative-packet schema, structural validator, and Claude adapter integration instruction; these are NOT yet proven production integrations.
- **engine/art_bridge/**, **engine/film/**, **engine/story/**, **engine/production/** — real executable implementations; inspect actual versioned source.
- **hybrid_v2/evidence/** — diagnostic/review proof bundles; treat evidence status and hashes critically.

**Root acceptance principle:** the only real success is a film whose **approved meaning, artistic decisions and genuine artwork** survive every technical handoff and appear correctly in the **actual moving, sounding final video**. Anything less must carry an honest incomplete status.

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
