# Transferable explanatory film direction, camera, character motion and pacing

**Status:** creative production method inferred from cross-film observation, **not** a transcription of the studio's private process or proof of exact equivalence. Use for unfamiliar scripts; never copy a source film's subjects, timing, sequence, metaphors or compositions. These rules supplement—not replace—F01–F50 artwork construction. Read this reference in full before inventing camera, transitions, timed storyboard or animation states.

## Navigation

1. [Separate evidence from decisions](#1-separate-evidence-from-decisions)
2. [Invent an explanation that moves](#2-invent-an-explanation-that-moves)
3. [Design what the viewer sees, thinks and feels](#3-design-what-the-viewer-sees-thinks-and-feels)
4. [Choose representations and camera operations](#4-choose-representations-and-camera-operations)
5. [Invent transitions as continuity problems](#5-invent-transitions-as-continuity-problems)
6. [Author pacing and energy](#6-author-pacing-and-energy)
7. [Direct character performance without broken limbs](#7-direct-character-performance-without-broken-limbs)
8. [Design backgrounds for moving explanations](#8-design-backgrounds-for-moving-explanations)
9. [Make 60-fps output genuinely continuous](#9-make-60-fps-output-genuinely-continuous)
10. [Author a renderer-complete execution packet](#10-author-a-renderer-complete-execution-packet)
11. [Transfer test on unfamiliar subject matter](#11-transfer-test-on-unfamiliar-subject-matter)

## 1. Separate evidence from decisions

### Cross-film observations, not a universal preset

The five supplied 1080p films have approximately 242,095 encoded frames and 60-fps video streams. Qualitative transition comparisons include unlike explanatory content: AI ~377–379s and ~700–708s, brain-blindness ~302–310s and ~150–158s, nuclear-flies ~271–278s and ~420–428s, memories ~190–198s, solar-system ~212–214s and ~370–378s. Frame intervals were inspected at 0.5 seconds and selected change intervals at 0.1 seconds; sampled full seconds showed 60/60 distinct composited frames. **Do not conclude that every character was redrawn at 60 distinct cels per second, that every camera path is known, or that the studio uses one fixed easing function.** The sources are examples of visible effects, not project-file disclosure.

Recurring cross-subject principles:

- A **recognizable actor, moving item, gaze, or light/route relation** often remains an attention anchor when the film shifts scale, viewpoint or representation.
- A wide view is frequently **earned by a question about population, distance, consequence or larger context**. It is not the default background for a close human or local causal claim.
- A transition can change the *kind of information*: lived action → model, individual → population, interior → outside observer, process → geographic coverage, simple intuition → corrected mechanism. Its task is to keep a meaningful correspondence across that change.
- Independent changes enter in **comprehension order**: moving process first, then causal consequence, then comparative quantity or label where needed.
- Detailed worlds are selective. The surroundings can be quiet while moving subjects perform the explanation; a moving camera is not mandated by a high frame rate.
- The source films use **cuts as well as tracked reveals, changes of scale, portals and object-state changes**. Reject an absolute “no cuts” rule.

All timing numbers, camera paths, color-attention budgets, interpolation and sprite-state counts specified below are **our explicit authoring defaults or engineering hypotheses**, not measurements of a source director's settings. Adjust after viewing a real animatic. Tag a transfer as `SOURCE_OBSERVED`, `CROSS_FILM_INFERENCE`, `PROJECT_CHOICE`, `PRODUCED_AND_VIEWED`, or `STILL_UNVERIFIED`.

## 2. Invent an explanation that moves

### Begin with the spectator's knowledge, not a picture

For each **logical claim**, write:

```text
CLAIM: The precise thing the film must prove, with truth boundary.
KNOWN: What the viewer already has witnessed, not what narration merely said.
MISCONCEPTION: The tempting wrong interpretation the next visual could invite.
QUESTION: The natural next question that will cause a change in view.
WITNESS: One original object/actor/quantity whose behavior can prove the claim.
ACTION: What changes on screen; what causes that change; what resists it.
COMPARISON: The before/after or counterfactual that makes the causal effect legible.
INFERENCE: What a silent first-time viewer should be able to deduce afterward.
NEXT: The newly provoked question carried into the next visual territory.
```

The image is not a literal caption of the voiceover. Design a **visible experiment**. The actor chooses, the mechanism responds, the consequence is observed. **One understandable action before one new label** is a useful starting discipline, not a limit to all compositions.

### Build a representation ladder

For an unfamiliar phenomenon, choose among these functional levels; do not mechanically include all five:

| Level | Answer it gives | What must visibly operate |
|---|---|---|
| Embodied/concrete | “Who cares or acts?” | An original character/object and a grounded choice or action. |
| Mechanism/contact | “What physically changes?” | The particular route, surface, interface, force, input/output or decision point. |
| Local model | “Which rule governs this example?” | A simplified system that preserves the real causal dependency. |
| Collective/system | “What happens when many units interact?” | Repetition/feedback/congestion/propagation expressed as evolving behavior. |
| Comparison/counterfactual | “Why is the conclusion surprising or true?” | Registered baseline and changed outcome on one meaningful measure. |

**Core invention move:** ask which *new relation* the viewer is trying to see; then find a view in which that relation can take action. A camera move without a newly knowable relation is a decorative move; a beautiful world that hides the relation is an incorrect choice.

### Invent three candidate *moving* explanations before choosing

Create three genuinely distinct journeys for a hard concept, varying both *point of view* and *proof operation*, not merely palette. Each candidate must contain (1) a familiar observable start, (2) a difficult concept witnessed through action, (3) at least one representation change, (4) a causal consequence, (5) an attention bridge and (6) a visible risk of misleading the viewer. Evaluate in this order: **causal truth → immediate legibility → potential for meaningful motion → identity continuity → ability to art-direct with independent layers → beauty**. Choose or combine mechanisms; explain why losing alternatives would harm comprehension.

Do not choose an illustration just because it would be easy to generate. A rectangle-only technical graph can be a useful intermediate abstraction, but it cannot substitute for inventing the audience's visual journey.

## 3. Design what the viewer sees, thinks and feels

### The attention baton

Give each interval **one primary attention owner** (character, active joint, moving line, highlighted comparator, relevant number). Specify an ordered handoff between owners rather than “everything is interesting.” Record:

```yaml
attention_beat:
  viewer_question: "..."
  entering_focus: "object/region ID"
  entering_screen_xy_norm: [0.40, 0.52]
  eye_lead: "motion, gaze, edge, sound or reveal that points toward it"
  competing_motion: "which competitors are held or reduced and why"
  proof_action: "first motion whose result proves the point"
  change_of_expectation: "what surprise or realization occurs"
  exit_focus: "next object/region ID"
  handoff_cue: "where the eye naturally goes next"
```

Determine visual hierarchy with **action first**, then size/contrast/saturation/edge separation and finally text. For small screens, the important proof needs a recognizable silhouette or path. If a moving focal point occupies approximately 10% of a 1920×1080 frame, test it at phone-size; this is a proposed readability test, not a source-character scale rule. Exact contrast ratios depend on palette and scene; do not impose a universal color or outline.

### Separate three tracks

For each beat, write three parallel tracks:

1. **Knowledge track:** question → demonstration → inference.
2. **Attention track:** current focal owner → lead cue → new focal owner → reading pause.
3. **Experience track:** curiosity, confidence, uncertainty, surprise, relief, dread or wonder, with the *cause in the visual action*.

A direction like “increase tension” is not executable. Translate it into a visible operation, for example: maintain the same objective while the number of actors choosing a tempting action grows; let a familiar moving witness travel a progressively shorter screen distance per narrated interval; allow a consequence to register before the next reveal. The renderer receives exact changes, not emotions as adjectives.

### Spectator information budget

- A shot can contain many illustrated parts, but the **newly introduced facts** should be sequenced. Stage distinct facts by arrival rather than make all labels, motion, icons and background details appear on the same frame.
- Give each unit a *read interval* after its operation. A background can hold absolutely still during the interval; this is frequently the correct direction.
- Motion distractors are measured relative to the main operation. Continue secondary motion only when it depicts the same cause (flow, passing time, travel) or provides needed living context. A bustling world should have a purposeful **active corridor**.
- A wide shot is justified when density itself is the answer. Switch inward when a specific individual's action becomes the unanswered question.

## 4. Choose representations and camera operations

For every shot, identify **what the camera will teach** before picking an angle:

| Function | Choose this when | Specific owner movement | Required art | Reject when |
|---|---|---|---|---|
| Follow witness | One actor/path carries the causal thread | Move subject in world coordinates; camera targets it with authored lag/offset | Subject view cels, overscanned local geography, occluding bands | No witness or meaningful destination exists |
| Inspect contact | The mechanism lives at a small interface | Move target toward interface; adjust scale until actual contact reads | Macro/cutaway/contact-state illustrations | The close-up does not answer a new question |
| Reveal container | Viewer needs to learn where the scene sits | Pull outward while keeping inner content registered; outer rim/world enters | Inner, rim, outer set, near/far occlusion | Only enlarges/reduces a poster |
| Expand to collective | Viewer's question is one-versus-many | Preserve an identified unit while new units enter a wider coordinate frame | Registered individual and population representations; optional lens | Individual identity jumps to an unrelated item |
| Follow causal edge | Viewer asks “where does this lead?” | Animate actual flow/witness on an authored edge; move camera target along edge | Route geometry, endpoint states, foreground reveal | The camera flies while connection remains static |
| Reframe comparison | Viewer needs difference across two states | Translate stage or camera to a shared measuring axis; reveal B *after* A | A/B states sharing scale and anchors | Changes size or axis, falsely implying a difference |
| Change epistemic model | Original metaphor is now inadequate | Keep one anchor, replace misleading mechanism with better one | Alternate complete model states, correspondence points | Transition implies old metaphor was literally true |
| Cut to example | Physical continuity would be a fiction | Cut after outgoing question/action into immediate answering event | Fully authored incoming frame and acting state | Cut merely escapes unfinished scene design |

**Perspective is constrained by artwork.** A 2D three-quarter plate does not contain drawable back faces or unseen depth. An eye-level street, overhead route view, cross-section and inside-object view each require approved drawings with their own projection, not a rotating image plane. For spatial changes, write `world_axes`, `camera_projection`, `near/far_layers`, `facing_A`, `facing_B`, `shared_anchor` and `newly_visible_parts` before images.

### Camera math is a rendering contract

For a world point `X(f)`, camera center `C(f)`, scale `z(f)`, and screen center `O`, use:

```text
screen(f) = O + z(f) * [X(f) - C(f)]
If the hero must stay at screen anchor A:
  C(f) = X_hero(f) - (A - O)/z(f)
```

Design **actor motion separately from camera motion**. A camera follows a continuously moving traveler without necessarily stopping every few seconds. Export 60-fps frame-indexed camera and owner trajectories, not vague “pan slowly.” Declare active viewport, overscan and art under revealed boundaries. Compose with foreground occlusion and legitimate depth planes when they help the viewer understand distance, not to add meaningless 3D tilt.

## 5. Invent transitions as continuity problems

### Out → middle → in, before any painting

The transition **is an explanatory event** and must have three authored key views:

1. `OUT`: What action and question are still alive at the end of the outgoing view?
2. `MIDDLE`: What *physically, causally or perceptually* carries attention? State object, contour, edge/path, gaze, sound cue, lens, occluder or intentional cut.
3. `IN`: What does the entering view now make possible to understand? Show its first real action, not an establishing poster held for ambience.

Write a continuity map:

```yaml
transition:
  outgoing_representation: "world/view IDs"
  incoming_representation: "world/view IDs"
  reason_for_switch: "specific newly answerable question"
  conserved_invariant: "object identity / route / direction / silhouette / quantity"
  old_anchor_px: [x, y]
  new_anchor_px: [x, y]
  old_camera_and_facing: "..."
  new_camera_and_facing: "..."
  physical_middle: "lens / enclosing frame / tracked path / foreground wipe / cut"
  alpha_occlusion_owner: "asset that legitimately conceals view-state swap"
  drawn_states: ["OUT view image", "MIDDLE state", "IN view image"]
  first_new_action: "what the incoming visual *does*"
  frame_range_60fps: [start, end]
```

Never hand off two independent AI-generated worlds and hope a dissolve makes their objects align. When a subject changes topology, **draw the middle view**, preserve anchor geometry, and hide only the approved swap behind genuine occlusion or a perceptually convincing bridge. An object may turn out of frame or pass behind a nearer object while switching cels; it must not acquire impossible hands/wheels/back faces by perspective scaling.

### Functional transition families, not source-shot templates

Choose a family because of the **knowledge relation**, then invent entirely new visuals:

| Viewer needs to learn | Candidate bridge | Critical continuity |
|---|---|---|
| One case is part of a population | Registered exemplar inside changing lens or scale frame | Same exemplar remains identifiable |
| A hidden outer context exists | Outward camera reveal through enclosing boundary | Known inner subject persists |
| A process leads to another process | Travel along causal edge, fluid or object movement | Direction and actual connection persist |
| Physical geography becomes measured coverage | Traveler crosses into registered route/map view | Path and destination preserve meaning |
| Interior operation becomes whole-system behavior | Shell/outer surface appears as interior recedes | Object identity and external facing |
| Earlier and later states differ | Time-separated approved drawings share an anchor | Same actor/action, clear time ordering |
| A friendly analogy must be corrected | Part correspondence preserves boundary while mechanics replace | Viewer knows what was analogy |
| An abstract statement needs a human consequence | Motivated cut on question/action | Next shot answers immediately |

**Cuts are legitimate.** If two concepts have no true spatial relation, an elaborate continuous camera move may misinform. Select cut-on-motion, cut-on-question, color/shape rhyme or sound bridge; explain why an uninterrupted movement would falsely imply literal adjacency. The source style is *conceptual continuity*, not continuous-camera footage.

## 6. Author pacing and energy

### Beat by proof, not by seconds-per-sentence

The moving explanation follows this event chain:

```text
orient → anticipate → act → reveal consequence → allow recognition → redirect
```

Different beats can omit or collapse phases, but **recognition must be paid for**. Before a surprising reversal, let the viewer form an expectation. Let the action contradict it. Pause enough for comparison to register; *then* deliver the explanatory phrase. If narration states the answer before the visible experiment, the film becomes illustrated lecture rather than visual discovery.

**Proposed timing calibration (at 60fps; not creator measurements):**

| Situation | Initial authoring range | Real controlling variable |
|---|---|---|
| Eye cue/gaze/leading pointer | 6–18 frames (0.1–0.3s) | Can viewer discover next focus before it moves? |
| Single icon/state arrival | 12–36 frames (0.2–0.6s) | Does the new state read without colliding with another entrance? |
| Meaningful camera move | 30–150 frames (0.5–2.5s), sometimes far longer | Spatial distance, amount of new concept, object velocity |
| Comparison held after a change | 36–120 frames (0.6–2.0s), extend when numerical | Can the viewer actually compare A and B? |
| Character anticipation/reaction | 12–60 frames (0.2–1.0s) per distinct action | Contact, expression and narrative emotion |

Ranges are **starter handles**, not universal values or source-film statistics. Perform a first-person “silent viewing” pass and retime. Never force the script into equal 10-second bins. Don't add movement to meet a pixel-change quota. The output may have a stationary painted wall while a subject or one causal tracer moves through all 60 frame slots.

### Energy score

Author the following per section, explicitly in production terms:

- **Question/tension source:** a decision pending, a mechanism hidden, a limit approaching, or an observed mismatch.
- **Spatial energy:** near/far, small/large, amount of field revealed, and camera acceleration if justified.
- **Motion energy:** count of independent purposeful motion owners, velocity changes, repeated behavior and contact events.
- **Information rate:** new causal facts and symbols per interval; not merely the number of colorful objects.
- **Emotional release:** reaction, answered question, settled comparison or quiet hold.

Avoid a monotonous crescendo. A dense reveal often needs a quiet close-up afterward; an emotional realization may require the camera to stop. Different films and topics require different rhythms. A “high energy” direction must specify *which* owners accelerate or multiply and *why* the audience's understanding depends on that action.

### Voice/sound relationship

Time changes to the recording once actual voiceover exists. Write narration phrases as **beat conditions**, not guessed speech timestamps; pin key action triggers to a measured phoneme/word/event time with frame tolerance after recording. Reserve actual quiet moments and cause-effect sound cues. Motion may lead narration (viewer discovers), coincide with it (mechanism reinforced), or trail it (conclusion lands); record the choice per beat. Audio is not allowed to hide a confusing visual mechanism.

## 7. Direct character performance without broken limbs

### A character is an acting identity, not a bag of rotating cutouts

For each character, make an **identity and view atlas** containing canonical silhouette, characteristic facial landmarks, costume panels, attachments, handedness, foot heights, face landmarks and actual camera-facing views required by the shot. Pre-author **complete full-body key drawings** for action extrema: anticipation, weight shift, reach, contact, action peak, settle, reaction. Include mouth/eyes only if needed and if stable reference states can be made. Rig simple translation/scale only when anatomical topology is unchanged.

**Acting sequence:** intention appears in gaze and torso → weight shifts toward action → hand/foot reaches contact → contact occurs on a specific frame → held prop moves with its grip/constraint → reaction changes face and posture → settle or travel continues. If the scene's information is in the action, the viewer must see the **contact moment**, not an isolated pose pop.

### Use the right motion implementation

| Action | Preferred construction | Do not substitute |
|---|---|---|
| Entire body walking across screen in constant facing | Registered full-body drawn gait cels + continuous position; cycles tied to ground distance | Rotated separate thigh/shin PNGs with dislocated joints |
| Small head nod, body bob, prop vibration | Transform an approved coherent cel or locally approved rig | Independently moving head off its neck |
| Turning from profile to front/three-quarter | Draw approved facing-transition or intermediate full-body states; optionally use a reviewed deform | Rotate the profile PNG in-plane and claim 3D facing |
| Hand grasps / points to a specific object | Complete pose states plus named hand–object anchor/contact, clean occlusion | Floating detached arm, moving object with no grip |
| Expressive face / dialogue | Registered face variants, intermediate expression drawings and deliberately timed swaps/blinks | Crossfade full bodies with misaligned silhouette/eyes |
| Object/animal shape materially transforms | Multiple complete drawings with aligned landmarks and approved inbetweens, or masked replacement | Affine-scaling one still into new topology |

**Contact state contract:** `contact_begin_frame`, `contact_end_frame`, `hand_anchor_on_character`, `prop_anchor`, `near/far limb ordering`, `foot_ground_anchor`, `look_at_target`, `state IDs`. A hand locked to a lever follows one joint space; the prop follows the same transform until release. A rooted foot stays screen-grounded during a planted phase; do not let a generic walk loop skate against background.

### Smoothness is not a cel-count promise

At 60fps, evaluate actor position, camera, effects and constraints every frame. A full-body cel may remain held across several output frames for deliberate stylization; it is **not** proof of poor frame rate. Conversely 60fps export with four badly aligned poses is not smooth acting. If image-to-image key poses do not interpolate cleanly, request additional registered drawings at the actual failure interval; prioritize silhouette, ground contact, facing, facial landmarks and prop relationship. Review at native playback speed and one-frame contact strips. Don't promise general-purpose AI pose warping before a real test has passed.

## 8. Design backgrounds for moving explanations

### World completeness is not visual clutter

The existing F37–F50 world-part graph remains valuable as a **construction map**. It does not require exposing every branch, window or microorganism at once. For each shot, define:

1. **Explanation corridor:** region through which the active process moves; fully illustrate functional contacts and upcoming offscreen space.
2. **Supporting context:** a small number of identifiable surfaces/landmarks that establish location and scale and can be reused under camera travel.
3. **Quiet field:** low-frequency large shapes, restrained motion and spare color contrast so the active subject can be read.

Specify for each illustrated part `semantic_role`, `visibility_interval`, `motion_owner`, `needed_for_causal_proof`, `occlusion_parent`. A visually complete world may have many hidden or distant elements yet a sparse single frame. Before drawing a new detail, ask **what proof, identity, depth or transition it serves**. If none, remove it from the shot brief without deleting its reusable world-class construction method.

Plan paint as layers: farther/nearer depth bands, clean plate behind moving actors, foreground occluders, animated subjects and alternate states. Camera overscan must be painted for exactly the anticipated motion envelope, not an oversized mural. Avoid baking moving vehicles, moving shadows, labels and active effects into a huge still. A far skyline may hold; a foreground tree may move relative to camera; both choices must be motivated.

### Different reality levels need different drawing tasks

Do not keep a photographically implied 3D angle while showing a fully flat relational graph. Label each art state `STREET_EYE`, `LOCAL_MECHANISM`, `SIDE_SECTION`, `MAP_OR_SCALE`, `ABSTRACT_RELATION`, or a new justified view. A transformation between them demands a correspondence map and an actual illustrative middle. A stylized 2.5D view is valid only where its visible planes help the viewer understand a spatial relation, not as a substitute for depth through camera movement.

## 9. Make 60-fps output genuinely continuous

**Delivery target when requested:** 1920×1080 at 60fps. A 120-second film contains **7,200 composited video frames**; a 13-minute film contains **46,800** at exactly 60fps. These counts do **not** imply hand drawing each frame. Claude/Remotion must calculate camera and owner transforms, interpolation, placement, alpha and effects at every target frame. The actual approved art supplies the shape states; the renderer supplies temporal evaluation.

- Give every active owner a frame-indexed track: `position`, `scale`, `rotation_or_view_state`, `opacity`, `mask`, `pivot`, `z_order`, `constraint` and `interpolation`.
- Ensure velocity/acceleration compatibility across continuing actions. A moving traveler should not stop at a cut merely because every shot uses ease-in-out from zero. Explicitly transfer world velocity and actor state where screen continuity matters.
- Use a smoothstep/quintic ease **only for true start/settle events** and label it `PROJECT_CHOICE`; don't claim it is a measured studio curve. For a propelled object or flowing route, continuous arc-length parameterization and motion tangent may be more appropriate.
- Preserve consistent near/far order; never animate a raster plate into exposing missing surfaces. Distinguish digital zoom that reveals already painted detail from a *new illustrated scale state* that is required when scale changes radically.
- A render must be reviewed both silently and with narration at real-time speed. Contact strips are essential but not equivalent to seeing the actual performance. Renderer tests check geometry and technical validity; artistic clarity/attention require viewing.

## 10. Author a renderer-complete execution packet

The right output *before image generation* is a production-ready **thinking artifact**, not a vague mood board:

1. `CLAIM_AND_TRUTH_LADDER`: precise scientific/social mechanism, misconceptions, observable counterfactual, what is metaphor.
2. `SPECTATOR_JOURNEY`: beat-by-beat `KNOWN → QUESTION → WATCH → INFERENCE → NEXT` with emotion and attention paths.
3. `INVENTION_COMPARISON`: three moving visual explanations per hard concept, chosen for causal legibility, not illustration detail.
4. `VIEW_WORLD_ATLAS`: every world/view, projection, content map, near/far visibility, how identity transfers; screen and world anchors.
5. `OUT_MIDDLE_IN_BOARDS`: authored transitions, preserved invariant, attention transfer, facing drawings and occluding middle state.
6. `SHOT_FRAME_SCORE_60`: frame-indexed **shot** and **within-shot event** timing, voiceover dependency, camera/subject trajectory, foreground/background behavior, anticipation/impact/recognition, attention and desired feeling.
7. `ART_MANUFACTURING_LIST`: image owner, exact crop, overscan, world/view version, transparency, clean plate, masks, alternate poses, middle-transition drawings, identity refs and naming. Perform art generation only after items 1–6 are coherent.
8. `RENDERER_HANDOFF`: approved files + registration/manifest + immutable artwork constraints + every 60fps motion owner and audio event. Claude executes camera, pose swaps, layering and timing; it **does not invent artwork, missing limbs, visual metaphors, scenery or unexplained shot changes** for this project's GPT-owned-art workflow.

Example `shot_event`:

```yaml
shot_event:
  shot: "S07"
  frames: [1430, 1490]             # absolute 60fps film frames
  viewer_knows: "..."
  question: "..."
  world_and_view: "WORLD_B / macro-side"
  focus_owner: "acting entity or specific mechanical junction"
  screen_anchor_norm: [0.61, 0.48]
  proof: "cause first; visible effect second"
  performance: "anticipate → contact → outcome → register"
  camera: "target path and zoom samples with velocity boundary conditions"
  secondary_world: "named layers held or parallaxed; explain why"
  sound: "narration onset/word anchor or explicit intentional silence"
  next_question: "..."
  art_needed: ["key pose A", "contact drawing", "clean underpaint", "occluder"]
  reality_level: "physical / abstract / comparison"
  evidence_class: "PROJECT_CHOICE"
```

In production use concrete names, pixel positions, exact frame values and asset IDs, not the ellipses in this **schema illustration**. The owner of motion **does not** decide explanation content. If art or pose is missing, return a precise production dependency to GPT; don't substitute generic rectangles or create SVG characters. This is a role separation for this production, not a claim about how the source studio allocates its departments.

## 11. Transfer test on unfamiliar subject matter

Prove transfer with **new scripts whose physics/characters/worlds do not appear in the sources**. At minimum choose unlike mechanisms, e.g. a counterintuitive collective outcome, a tiny physical interface causing a large-scale change, and a biological feedback system. The subjects are test domains, **not encoded reusable scene ideas**.

For each, independently produce: (a) claim ladder, (b) three distinct journeys, (c) two connected levels of perspective, (d) OUT/MIDDLE/IN mechanism, (e) attention handoffs, (f) paced silent proof, (g) registered character/object view states, and (h) missing artwork list. Then test whether a fresh model could reconstruct the visible outcome from these **without seeing the source films or earlier pilot artwork**. A detailed storyboard by itself is not visual proof; qualify only after art pixels, motion playback and audience comprehension tests.

The **fundamental transfer question** is: "What knowledge must the viewer gain next, through which observable change, from which viewpoint, while tracking what persistent thing?" Solve that before choosing a picture. Apply this to every new subject; don't preserve any film's literal order of scenes.
