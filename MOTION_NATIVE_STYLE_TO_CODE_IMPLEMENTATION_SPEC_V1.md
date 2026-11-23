# Motion-Native Style-to-Code Construction Specification V1
## A production architecture for original, style-grounded illustrated animation

**Status:** Intended implementation specification, 21 November 2026. Not a claim that the current Claude project already implements it.  
**Primary target:** 1920 × 1080 original 2D explainer artwork, editable native construction, expressive rigged motion and 60-fps deterministic rendering.  
**Authority:** Experience Director V1 for story and viewer experience; current five-film F01–F80 construction skill for conditional visual method; preserved neutrino engine for proven time-based drawing and rendering.  
**Known existing-project fault:** Claude's independent audit reports that the F01–F80 catalog was descriptive, no style-to-geometry constructor existed, and a generic character was drawn before subject-specific design or witness selection. Code-level confirmation awaits the targeted source ZIP.

---

## 0. Executive design decision

Do **not** attempt to make a magic function named drawInStyle() that accepts a script and substitutes a handful of predefined heads, sleeves, boxes and gradients.

The correct mechanism is a **source-grounded illustrated authoring system with executable constraints**:

1. Direction defines what must become visually and emotionally apparent.
2. A high-impact question engine determines which uncertain construction decisions matter most.
3. The model designs an original, subject-specific illustrated object using conditional reference observations.
4. It writes actual contour geometry, parent surfaces, material planes, view states and mechanical/biological relationships.
5. A constrained drawing runtime compiles those authored decisions into vector or locally generated raster operations and records which requirements control which operations.
6. A pose/motion layer deforms or replaces the approved illustration while preserving anatomy, identity, shading ownership, occlusion, contact and perspective.
7. The render is physically inspected, at intended crop, size and speed. The authoring operation—not just a visual score—is changed on failure.
8. A demonstrated local/family correction is bound into the next relevant FIRST construction before art is generated.

The renderer does **not** invent artistic decisions merely because an image is under-specified. Conversely, the drawing author cannot satisfy an artistic requirement by citing its method ID after the drawing has already been created.

The reusable system is the **discipline and its drawing operators**, not a reusable character face or repeated metaphor. Every unfamiliar film retains its own custom illustrated content.

### Non-negotiable distinctions

- **Design meaning is not geometry.** "Flat, warm, expressive" is not a head contour or a brow.
- **Geometry exists only when authored.** A filled character-design record must point to actual curve/region definitions, not empty tags.
- **A code symbol is not proof.** An existing function named surface() or limb() says nothing about its artistic adequacy.
- **Technical geometry verification is not artistic approval.** Parent attachment can pass while the figure remains aesthetically primitive.
- **60 fps is frame sampling.** It does not require 60 unique character paintings per second.
- **Full fidelity of a written skill is not identical to reproduction of every artistic choice in its source films.** Preserve all observed conditional knowledge; do not claim to possess undocumented proprietary methods.
- **Vector-first is not one-material-only.** Code can author crisp vectors, masks, local soft optics and procedural pixel layers; F19 explicitly permits mixed media when a justified material needs it.

## 1. Separation of responsibilities

| Owner | Must decide | May not silently delegate |
| --- | --- | --- |
| GPT / Experience Director | Fact, intended spectator inference, visual metaphor, emotional change, camera/transition reason, critical action and its consequence, attention handoff, narration/audio cue | What the main explanation looks like and what visibly changes |
| Code-native illustrated art director (Claude role) | Original forms, proportions, silhouette, contour landmarks, material region designs, view atlas, parent/child structure, character expression and task-specific grip drawings | Whether the chosen artistic construction is appropriate; cannot substitute defaults without review |
| Construction compiler/runtime | Ownership links, projection maps, path rendering, masks, transform ancestry, construction receipts and structural tests | It must not fabricate missing artistic design |
| Motion director/runtime | Timed poses, dynamic constraints, shape deformations, followthrough, active effects, semantic cuts, registered camera movement | It must not alter the factual mechanism or replace the required creative event |
| Visual reviewer | Whole-look craft, reference-conditioned style, intentional explanation, motion clarity | Cannot certify from metadata alone |

A technically impossible approved event should be returned to the Director with the actual dependency and a proposal. Local path/ease/geometry implementation remains Claude's responsibility.

## 2. The essential missing representation: a drawable construction document

Introduce **Illustration Construction Document (ICD)**. It is a typed, versioned, *subject-specific* description of an image-capable object, not a generic drawing prompt.

An ICD has three coupled layers:

1. **Semantic layer** — Why the object exists, what the spectator must infer, which original subject it depicts, how big it will be on screen.
2. **Artistic construction layer** — Named paths, materials, planar surfaces, contour landmarks, topology, occlusion, color-role relationships, correct views/expressions and relevant source contrasts.
3. **Executable binding layer** — Which source code constructs each path and how it is attached, deformed, tested, inspected and promoted.

### Minimal typed contract

~~~ts
type MethodStatus =
  | "ROUTED" | "DESIGN_SPECIFIED" | "CODE_BOUND"
  | "STRUCTURALLY_TESTED" | "PIXELS_INSPECTED"
  | "MOTION_PROVED" | "REPAIR_REQUIRED" | "APPROVED";

type CurveSegment =
  | { kind: "M"; p: Vec2 }
  | { kind: "L"; p: Vec2 }
  | { kind: "C"; c1: Vec2; c2: Vec2; p: Vec2 }
  | { kind: "Q"; c: Vec2; p: Vec2 }
  | { kind: "Z" };

type DrawnRegion = {
  id: string;
  parentId: string | null;
  purpose: "SILHOUETTE" | "FACE_PLANE" | "MATERIAL_PATCH" |
    "RECESS" | "HIGHLIGHT" | "CUTOUT" | "EFFECT";
  path: CurveSegment[];                // Real authored geometry, never empty
  localCoordinateFrame: string;
  fillRole: string;                     // Material + palette role
  renderOrder: number;
  clipToParent?: string;
  hidesOrOccludes?: string[];
  drivenBy: string[];                   // Actual construction decisions
  viewStates?: Record<string, string>;  // Alternate authored region IDs
};

type ArticulatedPart = {
  id: string;
  parent: string | null;
  pivotLocal: Vec2;
  attachmentLocal: Vec2;
  transformOwner: string;
  allowedMotion: "RIGID" | "CONTOUR_DEFORM" | "POSE_STATE" | "STATIC";
  geometryRegions: string[];
  materialRegions: string[];
  jointLimits?: { min: number; max: number };
  contactAnchors?: Record<string, Vec2>;
};

type MethodBinding = {
  methodId: string;               // e.g. F59, F65
  applicableBecause: string;      // Actual role, crop and condition
  sourceWitnesses: string[];      // Actual inspected portable evidence
  unlikeCounterWitness: string;
  specificDesignChoice: string;   // Measurable, drawable, not adjective
  actualOwnedRegions: string[];   // IDs that are really rendered
  implementationSymbols: string[];
  visualFalsifier: string;
  proofFiles: string[];
  status: MethodStatus;
};

type IllustrationConstructionDocument = {
  subjectId: string;
  originalSubjectIdentity: string;
  screenRole: string;
  outputBbox: Rect;
  minimumSeenSizePx: number;
  mediumFamily: string;
  requiredInferences: string[];
  subjectViewAtlas: ViewDefinition[];
  canonicalLandmarks: Record<string, Vec2>;
  parts: ArticulatedPart[];
  regions: DrawnRegion[];
  materials: MaterialDefinition[];
  relations: RelationEdge[];
  methodBindings: MethodBinding[];
  requiredPoseStates: PoseDefinition[];
  requiredCameraFootprint: Rect[];
  unresolvedQuestions: QuestionRecord[];
};
~~~

The ICD cannot end in an English outline. The final artwork **must have real drawing functions and curve arrays** for every high-salience region. For a human actor, "head ellipse" is a possible deliberate *distant-symbol* choice, but is an unacceptable automatic fallback when the close-up calls for a specific skull, hairline, jaw, near/far eye and expressive mouth.

### Critical compiler behavior

- Resolve semantic IDs to actual drawable path owners.
- Verify required owners/attachments exist.
- Validate that every region has a material and a meaningful parent or explicitly independent world role.
- Ensure original design data is present before permitting an APPROVED construction receipt.
- Emit the actual SVG/Canvas scene graph, not a second descriptive packet that the runtime ignores.
- Attach method provenance and diagnostics to the emitted draw operations.
- Fail with a concrete missing-construction list when an essential contour, state, contact or perspective is unrepresented.
- Keep a distinct artistic verdict that can fail even when structural construction succeeds.
- Never mark a rule implemented merely because a function name and an HTML element ID exist.

## 3. The actual construction engine: operator families, not generic assets

Build **mechanisms** that help author new designs. Do not build a library of finished character heads, faces, rooms or machines.

### Geometry/structure operators

| Operator | Input | Actual visible output | Structural invariant |
| --- | --- | --- | --- |
| authorContour | Subject-specific cubic points/tangents and holes | Closed custom silhouette/path | No unsupported generic rounded replacement |
| compoundRegion | Multiple contours and named cutouts | Interior/negative-space shape | Holes preserved at all sizes |
| attachRegion | Parent region, local coordinates, overlap rule | Child path in parent's transform frame | No floating, non-owned marks |
| materialPatch | Parent mask, custom patch contour, role | Bounded color/shade plane | Patch moves/deforms with owning surface |
| projectFacet | Local world basis, actual facet polygon | Consistent side/top/front face | Axes agree within that world |
| routeConnector | Start/end ports, route tangents, front/behind portions | Physically connected pipe/cable/path | Every endpoint terminates on named socket |
| repeatedOwnedModule | Author-defined unit, parent map, density field | Windows/trees/branches/racks with variation | Every instance belongs to a substrate |
| composeOptic | Emitter, core, mask, receiver, falloff | Contained light/glass/lens behavior | No global decorative glow |
| defineAlternateView | Original view, new visible sides, registered landmarks | Newly authored profile/rear/macro state | Identity survives viewpoint change |
| deformMatchedContours | Homologous curve/landmark sets | Continuous shape deformation | No topology mismatch or self-intersection |
| maskReveal | Real foreground mask and underneath artwork | Actual cutaway/reveal | Never exposes missing art |

These operators must **consume original authored shapes**. A routine that receives "hand" and returns a circle is not a valid hand construction system; a routine that receives a designed thumb/palm/finger region, contact anchor and occlusion state and preserves them through motion can be.

### Renderer backends

1. **Primary:** native SVG paths, compound fills, vector gradients only where justified, clip paths, masks, paths/filters, local transforms, text and deterministic procedural shape generators. Reuse the proven neutrino browser/HyperFrames evaluator.
2. **Code-generated pixel layer where conditionally justified:** material texture, local haze, emitter bloom, refraction or nuanced optical patches clipped to owned regions. Procedurally rasterized pixels are still code-authored artwork, not an independent image-model generation.
3. **Optional registered illustration input:** only if a specific desired contour/material exceeds demonstrated pure-code authoring quality. Preserve independently movable structure, registration, masks and alternate states. This is a deliberately allowed exception, not a silent substitution and not the default plan.

An arbitrary 2D illustration can be represented in vector paths or pixels. The **representation** is expressive enough. The bottleneck is reliably designing the correct forms and authoring them—no renderer library supplies that aesthetic judgment automatically.

## 4. Translation from F01–F80 to real code

Preserve the full original skill archive. Create typed method adapters by *conditional trigger*, not by blindly compiling every F-number on every scene.

| Source methods | What the authored ICD must contain | What code must actually build |
| --- | --- | --- |
| F01, F58 | Original purpose-specific silhouette, negative spaces, contour landmarks, small-scale identity | Closed custom outer paths, cutouts and size-state variants |
| F02, F03, F04, F51, F61–F63 | Palette roles, each physical material owner, light/shadow plane contours, edge roles, optical exceptions | Parent-masked color regions, material-local patches and selective effects |
| F05, F64, F65 | Identity family, skull/face/hair contours, near/far eye mode, expression changes and view-sensitive marks | Custom head/hair/face subpaths and registered expression state drawings |
| F06, F30, F66, F67 | Whole body gesture, support/weight, garment masses, articulated joint parents, hand/prop contacts | Pose-state silhouettes, constrained rig, task-specific hands and clean occlusion layers |
| F08, F38, F55, F60, F70 | Perspective family, basis vectors, facet geometry, all parent-surface coordinates | World-to-screen mapping and consistent projected parts |
| F09, F44–F46, F68 | Machine input/process/output truth, connected apparatus, ports, insets, shell materials | Functional part graph, projected recesses, connected cables and state-dependent mechanisms |
| F10–F13, F37–F43, F47, F69–F77 | Substrate, world class, semantic density tiers, owned repeated motifs, scene quiet regions | Authored environment masses, local module generators and spatially bound interior detail |
| F14–F16, F31–F36, F78–F79 | Registered before/middle/after states, camera footprint, invariants, overscan, masks | Frame-evaluable scene transformations and physically valid handoffs |
| F17, F56, F80 | Actual construction input and source-conditioned first-pass output proof | Executed drawing code, image evidence, before/after audit and method-to-pixel receipts |

**Provider-specific methods are transformed, not discarded.** F80 formerly required a provider prompt with source-native witnesses; in code-native mode the analogous invariant is: the first drawing job must use the actual selected source observations in its **design contract**, and the corresponding positive construction decisions must appear in the **executed path/material code**, before the first render. Merely including reference-image filenames in a JSON document is not compliance.

The universal style resemblance is **not** a global head ratio, palette, stroke width, outline, glow, 2.5D projection or density. Every one of those choices is conditional in the skill.

## 5. How to author a sophisticated original character

### 5.1 Select the actual illustration family

Determine whether the view is a close expressive actor, full-body gesture, hidden/rear actor, distant population, symbolic mascot or macro organism.

Record final displayed dimensions. The mouth/eye detail of a 500px head differs from that of a 30px distant actor.

For an actual focal original character, author:
- Full-body silhouette, weight placement, negative spaces and costume identity.
- Skull, facial plane, near/far jaw, ears and hair groups with **specific** view contours.
- Eye opening or dark-mark mode chosen because of role and scale; brows/lids/mouth as **coupled geometry**.
- Large garment silhouettes, collar/cuffs/hem, perspective- and bend-owned fabric planes.
- Task-specific hands with palm/thumb/finger volume and actual contact orientation.
- Actual supported alternate pose/view drawings where rigid transform would expose nonexistent geometry.

### 5.2 Generate the art in increasing commitment stages

**A — Whole actor in one flat silhouette.** Only outer shape, internal functional voids, feet/support. Show actual 160×90 and final on-screen size. If it reads generically wrong, rebuild now.

**B — Parent topology.** Skull/face/hair, torso, near/far garment arms, hand, hips/legs and prop contact graph. Render distinct parent colors; test physically connected overlaps.

**C — Specific identity and expression.** Custom head/facial paths, close acting states, registration landmarks. No generic oval head/emoji face at a meaningful close crop.

**D — Materials.** Author body/hair/skin/cloth materials independently: base contiguous fills and named attached local planes; choose optical/glow only where physically justified. No shared crescent shader.

**E — Task performance.** Pose extrema, weight transfer, elbow/hand art, contact occlusion and reaction. Test as actual movement; don't declare a still canonical image "rig ready" without its required states.

**F — World integration.** Put the accepted character in a relevant original world while preserving the canonical identity, geometry, shadows and material treatment. Scene construction must not redraw the actor ad hoc.

This is **coarse-to-fine construction with feedback**, not a mandate to use simple shapes forever. Every accepted stage is the foundation for increasingly sophisticated authored contours.

### 5.3 Character art is not its skeleton

The skeleton controls **where geometry goes**. It does not generate appealing contours by itself.

For a sleeve, the geometry may include an original shoulder cap, tapered forearm mass, elbow fold regions, cuff rim and overlapping inner/outer cloth planes. A generic function turning three joint points into a rounded tube is insufficient.

Use:
- Rigid transform for an approved rigid subpart.
- Shape-specific local Bézier deformation for soft bending when the visible topology remains valid.
- Authored alternate contour/view when new faces or folds become visible.
- Explicit in-between drawing or intentional cut/occlusion when topology changes too much for a clean morph.

Do not assume one front-facing image can be rotated into a convincing profile or rear view.

## 6. Geometry and materials: concrete implementation

### Contours

- Use explicit local control points and tangents, with cubic Bézier curves, closed shapes and intentional holes.
- Permit asymmetry and long/short curvature spans. Do not automatically round every corner or use the same shape ratios for unrelated subjects.
- Store important contour landmarks (hair root, jaw turn, collar edge, thumb crotch, socket rim).
- Parent-local geometry makes the whole illustrated object move coherently.
- For deformation, map relevant landmarks then regenerate intermediate curves; do not globally scale a completed outline when a bent elbow needs a different silhouette.
- Validate path closure and invalid/self-crossing geometry, but judge the *quality* by real rendered pixels.

### Materials and light

A material constructor does not emit a generic shader. It consumes actual contours and physical conditions.

- **Skin:** bounded face, ear and cheek planes that remain attached to the face/hand.
- **Hair:** a contiguous authored outer hair mass with internal colored lobes attached to meaningful roots/parting; avoid random strands.
- **Cloth:** folded/underside regions determined by garment structure and pose; no all-purpose bevel.
- **Metal/machine:** projected surfaces, inset control regions, functional recesses, sparse hard highlights.
- **Glass:** real inner scene/rim, clipped highlights, transparent/refraction conditions and near/far face order.
- **Energy/emission:** sharp functioning core, optional bounded halo and local light received by specific neighboring surfaces.
- **Biology/landscape:** connected parent anatomy and substrate-owned detail, not random wallpaper.

Palette is assigned to **roles and neighbor contrasts** before exact color values. Primary subject and causal delta must remain readable against local support; a bright stage and a dark biological field may use entirely different palette structures.

Lighting should have an explicit owner/source, receiving region, local masks and before/on/off states. If the source is removed, geometry and major forms remain coherent.

### Projection

A view declares one of flat/diagrammatic, frontal, oblique, aerial, macro, nested optical or other justified coordinate systems.

For oblique projected worlds, every facet uses the same projection vectors:

~~~text
screen_point = origin + x * axis_u + y * axis_v + z * axis_height
~~~

Windows attach to actual wall planes; roofs to top facets; tree foliage to trunks; mechanical controls to corresponding chassis faces. A new view state defines newly visible topology and appropriate occlusion rather than pretending a flat face was always 3D.

## 7. World and machine construction beyond basic shapes

A **world** starts as a semantically meaningful physical or relational substrate, not "gradient background with decorations."

ICD world data:
- Why this environment makes the audience understand the episode.
- World class and coordinate system.
- Major ground, sky, architectural, ecological or relational masses.
- Navigable/hidden space and camera overscan.
- Named attached objects and their physical/relational edges.
- Parent-owned repeat families with meaningful density falloff and visibility.
- Foreground, support and distant roles; local quiet areas.
- Materials and emitters.
- Alternate world states and transformation landmarks.

Details have tiers:
- **T0:** the legible large spatial composition.
- **T1:** complete recognizable structural modules.
- **T2:** modules' attached functional features.
- **T3:** event-dependent accents and small marks.

These are construction *roles*, not constant counts or a demand for maximum density. If a window is repeated, the building face owns it. If nodes form a biological network, the connected branch owns them. If a diagram shows relations, graph edges terminate on actual defined nodes.

A **machine** starts as input → mechanism → output:
- Functional chassis/working core, access/control, support and attachment graph.
- Facets, recesses, glass, ports, pipes and visible output.
- Physically valid moving-part pivots and contact.
- At least the actual states necessary to show its explanatory response.
- Details that explain operation; no meaningless neon button arrays.

Run a diagram-without-labels check: can the viewer follow the physical flow? If not, repair causal construction before adding decorative lighting.

## 8. Motion-native authoring: the scene is a function of time

Retain the successful neutrino time-evaluation structure. The animation of each scene is deterministic under arbitrary frame seeking.

~~~ts
function evaluateFrame(frame: number): FrameOutput {
  const t = frame / fps;
  const authoredActions = motionScore.evaluate(t);
  const pose = solveSupportedPose(authoredActions);
  const contacts = solveAndValidateContacts(pose, authoredActions);
  const contourStates = evaluateAuthoredGeometry(pose, contacts);
  const materialPlanes = updateOwnedSurfaces(contourStates);
  const effects = evaluateOwnedEffects(t, contacts);
  const camera = evaluateNarrativeCamera(t, authoredActions);
  return compositeWorld(contourStates, materialPlanes, effects, camera);
}
~~~

The technical runtime should never blindly infer acting from an unused verb in a narration description.

### 8.1 Event-level motion score

Each action needs:
- Frame interval and actual narration phrase/word cue.
- Previous spectator belief and intended new understanding.
- Named owner/actors and original art-state IDs.
- Anticipation, movement, cause, contact, consequence, followthrough or deliberate exemption.
- Physical state transition or deformation.
- Attention start/lead/landing point.
- Camera reason/path, sound cue, relevant secondary owners and exit relationship.

Interpolation/easing belongs to the actual kind of movement: an organic arm, a mechanical latch and a camera accelerating toward a distant world do not use the same canned ease.

### 8.2 Rigging, IK and contact

Rigging uses canonical body parts and authored deformable surfaces. For each limb:
- Named shoulder/hip and elbow/knee joints, lengths and allowed ranges.
- Consistent rest-frame orientation when converting a solved angle to local transform.
- Preferred elbow/knee bend direction and near/far occlusion.
- End-effector's **actual visible** palm/thumb/grip point rather than an arbitrary wrist pivot.
- Root/torso/weight shift when a target exceeds reach; never stretch limbs beyond supported anatomy.
- Pose-specific garment outline and fold behavior driven by bend and view.
- Valid planted foot/seat/hand support positions.

Before solving IK, validate reach:

~~~text
target_distance <= upper_segment_length + lower_segment_length
and target_distance >= abs(upper_segment_length - lower_segment_length)
~~~

A mathematical reach is only necessary, not sufficient: actual joint-angle limits, shoulder movement, fingertip placement and garment silhouette may still invalidate it.

For grasp/release, contact constraints update the prop or hand in a shared coordinate system; one hand-held state must have correct front-finger/prop/far-finger stacking. A separate pose and occlusion state is required when the grip opens. Motion is invalid if a hand floats, slips, intersects a face or crosses a shaft incorrectly.

### 8.3 Pose and view-state selection

**RIGID:** object's visible topology unchanged. Transform approved geometry.  
**DEFORMABLE:** registered contours with homologous landmarks and supported soft deformation.  
**DRAWN_STATE:** significant facial, hand, garment, organic or perspective change requires new complete path geometry.  
**CUT/MASK:** when no honest continuous correspondence exists, use an intentionally directed cut or legitimate covering geometry.

The method is chosen per acting state, not imposed globally. Explicitly prohibit generic image crossfades as a substitute for authored anatomical motion.

### 8.4 Cameras, transitions and depth

Separate actor world-space motion from camera transform. Preserve velocity across continuing shots when meaningful.

For a 2D scene:
~~~text
screen = screen_center + zoom * (world_point - camera_center)
~~~

For 2.5D depth, apply the approved layer parallax/projection and maintain valid occlusion. Compute camera envelopes before world drawing so moving shots reveal real underpaint instead of empty borders.

For each representational handoff define:
- **OUT** recognizable source object and meaning.
- **MIDDLE** correspondence, actual drawn geometry/mask and same identity landmarks.
- **IN** destination object and first new proof action.
- Stable structural/semantic invariant or explicitly motivated hard cut.
- Actual frame range for recognition and attention transfer.

A registered close-up may require newly authored detail surfaces. Cropping a wide raster image to 300% magnification is not a new designed perspective.

### 8.5 Sound and time

Narration is the synchronization backbone. Generate/use actual voice WAV, align phrase/word cues to the recorded performance rather than word-count approximation, and preserve state through cuts. Sound effects are attached to visible mechanical events and support the intended sensation; music is secondary to intelligible narration.

At 60 fps, render every composited frame with genuine continuous position/camera/effect evaluation, but permit intentionally held drawn character states.

## 9. The high-impact question engine is a producer

Preserve the original F01–F80 source-grounded loop, not its terminology alone.

For each unresolved high-impact art requirement evaluate:
- C: possible failure to convey the intended causal fact/meaning.
- G: area or importance of subject/image affected.
- R: recurrence across unrelated future subjects.
- U: contradiction/uncertainty in current source evidence.

Use the skill's engineering heuristic **4C + 3G + 3R + 2U** to prioritize the next investigation, with wrong causal meaning taking precedence over local cosmetic polish.

### One complete question operation

1. Record actual new-subject failure or essential missing shape operation.
2. Ask a discriminating **drawable** question, e.g. "When the actor's head is at this screen scale and three-quarter facing, which eye construction modes preserve expression without portrait realism?"
3. Inspect original native relevant source witness and genuinely unlike counterexample (classified explainer, not promo).
4. Extract conditional operation: visible contours, connected parents, palette/material roles, projected coordinates, feature budgets and counterconditions.
5. Encode it in the subject's ICD plus actual authored paths and part/material functions, not just a note.
6. Render the new construction and its important motion states; inspect full frame, reduced view and actual native crops.
7. Resolve, narrow or ask the next emerging question. Preserve SOURCE_OBSERVED / METHOD_CANDIDATE / OUTPUT_DEMONSTRATED / TRANSFER_TESTED separately.

This must happen **before first illustration** for known high-impact unknowns, and again after actual failure. The loop does not require a fixed number of ceremonial questions.

### Example of correct vs incorrect transfer

Incorrect: "Our source has beautiful blue rim light → automatically add blue glow to every character."

Correct: "The current device has a transmissive front surface and named emitter; the source contrast supports a rim plus sharp core and bounded optical halo in this material role; create actual parent-local rim/halo geometry only on the device, clip to physical boundary, validate with the halo disabled."

The skill's research evidence is an input to a new decision—not license to copy the source's literal content or numeric palette.

## 10. Automatic visual feedback: renderer as the sketchpad

The code-generating model must repeatedly **see real pixels**. A path source file cannot be approved because its intended appearance sounds good.

### Required rendering modes

- Full 1920×1080 composition at intended framing.
- Silhouette-only, actual display size and about 160×90 preview.
- Flat parent-region view (materials/effects off).
- Material-owner map and per-material no-glow view.
- Depth/occlusion/anchor overlay.
- Poses at anticipation, contact, peak and reaction.
- Before/middle/after transition frames and adjacent-frame pair strips.
- Normal-speed video for important action and sound.

The inspection pass asks, independently:
1. **Silent proof:** Does the actual visual change communicate the concept?
2. **Whole-look:** Is the original actor/world coherent, distinctive, beautifully constructed and appropriate to the reference-derived visual methods at this crop?
3. **Technical anatomy/topology:** Does every moving form connect, support weight and preserve contact?
4. **Materials/optics:** Do planes, marks, highlights and edges belong to correct surfaces?
5. **Motion:** Does the action show intention, cause, consequence and meaningful attention; does it feel good at normal speed?

A numerically correct SVG with ugly contours fails artistic inspection.

### Repair-or-rebuild decision

**Rebuild master/authoring design**, not local cosmetics, when:
- Outer silhouette and identity are wrong at the intended scale.
- Face, hands, limbs and material system are simultaneously generic.
- Required visible surfaces or major view states never existed.
- Parent topology/projection was wrong before detail was added.
- A visual metaphor cannot communicate its factual consequence even when perfectly animated.

**Repair locally** when:
- Identity and overall art are correct but a mask/z-order is wrong.
- An IK target is unreachable or a joint conversion has a correctable bug.
- One material patch drifts, one contact fails, one camera cover exposes a gap.
- Audio/temporal event is offset without changing the visual idea.

When entire art direction is wrong, return to GPT; do not polish a mistaken metaphor. When the drawing plan is good but its code primitive is poor, return to the ICD/path authoring stage.

### Autonomous repair-to-next-first-pass

Preserve actual before and after renders. Identify *the earliest producing defect* and its demonstrated correction. Store a lesson with:
- local identity or conditional family scope,
- relevant construction family/view/crop,
- original question and contrary source,
- wrong and correct drawing operations,
- affected code symbol/region,
- evidence paths and hashes,
- regression boundaries and cases where it is not applicable,
- status: REPAIR_DEMONSTRATED or later TRANSFER_TESTED.

**Mandatory operative behavior:** the next relevant ICD build receives applicable accepted lessons *before initial geometry is authored*. Its build receipt names applied IDs and the resulting source/region changes. A lesson that only alters parameters, or is mentioned in a report but not consumed by the next constructor, is not active learning.

Run targeted pixel/motion regression on identities that share the corrected method. Do not universalize a single repaired pose, nor promise stochastic artistic errors mathematically cannot recur.

## 11. No false implementation claims

A method ledger is valid only if it can show:

~~~text
method_id
  -> evidence and condition
  -> actual subject-specific design decision
  -> authored geometry/material/state
  -> executable source symbol
  -> constructed region ID
  -> observed proof image/film interval
  -> visual acceptance status
~~~

A function name match or a key in JSON does not establish execution.

Use the following statuses in the actual project:
- NOT_APPLICABLE (reason recorded)
- RESEARCH_REQUIRED
- DESIGN_SPECIFIED
- CODE_EMITTED
- STRUCTURALLY_CHECKED
- PIXELS_INSPECTED
- MOTION_PROVED
- APPROVED
- FAILED

For rule-critical samples, ablate/remove the selected active operation and render again: did its supposed visual effect actually change? If not, investigate the unused or disconnected rule. Ablation shows operative influence, not whether the output is beautiful; holistic visual review remains necessary.

Freeze accepted art code and registered identities. Later repair should invalidate only descendants that depend on the edited source, not force a reset of unrelated scenes.

## 12. Correct implementation order in the existing Claude project

**Do not authorize another keeper-arm patch as the next task.** The previous audit shows the main first-pass visual authoring stage was missing. Preserve working code and evidence.

### Phase 0 — Reconcile the actual project

After receiving the targeted SOURCE ZIP:
- Inspect true source files and path/ownership.
- Preserve original neutrino runtime and proven scene behavior.
- Remove misleading "implemented" verdicts from acceptance logic; keep their history for evidence.
- Determine smallest additive modifications and avoid rebuilding HyperFrames.

**Required result:** map of existing working runtime, missing style-to-authoring compiler, and precise patch points.

### Phase 1 — Implement the ICD and constrained scene-graph binding

- Typed subject-specific authored surfaces and path code.
- Actual parent-local transforms, holes, masks, z and material ownership.
- Conditional method routing with actual native source witness/contrast references.
- Real source-to-region receipt and a checker that refuses missing high-salience geometry.
- No automatic ellipse/head, tube/sleeve, generic box/machine or universal crescent shader fallback.

**Required result:** code can construct an original subject from an explicit path/region design and prove the method-to-render trace. Not merely validate a schema.

### Phase 2 — Create actual film-relevant original art using the method

For the first GPT-directed film:
- Select its most important acting character (if any), one complex environment and one changing explanatory mechanism.
- Use native source/counter-witness study to make actual novel design records.
- Author geometry for the real hero images from the same scene code, not standalone posters.
- Render full-size, thumbnail, material/structure debug views and necessary alternate states.
- Rebuild defective master designs at once instead of spending an hour repairing a primitive placeholder.

**Required result:** actual sophisticated artwork evidence for dissimilar families, not another demonstration made from generic shapes. If the code-authored character fails but world/machine succeeds, report a family-specific problem rather than condemning or certifying the whole system.

### Phase 3 — Connect art to meaningful motion

- Registered character views/poses; task-specific hands.
- IK/contact/weight with reach and joint limits.
- Subject-specific garment and face shape states.
- Dynamic world/camera/occlusion/meaningful secondary action.
- 10–15 seconds of connected actual narrated explanation from the upcoming film; normal-speed review.

**Required result:** moving art retains whole-look construction and illustrates a cause and consequence. Not a slideshow of approved hero stills.

### Phase 4 — Complete the first film and verify transfer

- Build all remaining scenes in connected narrated groups.
- Preserve accepted identities and learning.
- Export 1920×1080 at 60 fps and inspect actual audio and visual motion.
- Choose a genuinely different future film to test transfer after the first film is finished.
- Do not call the system universally qualified after one appealing character or one technical proof.

### Milestones should produce files, not essays

- ICD and actual drawing code
- Rendered source-linked canonical art
- Two or more different visual family examples from Film 001
- Registered pose/motion atlas
- Connected moving proof
- Accepted repair trace that changes the next first pass
- Editable film and final MP4

## 13. Expected project modules (adapt names after source inspection)

~~~text
engine/
  runtime/          preserved neutrino clock and compositor
  geometry/         curves, clipping, projection, deformable path operations
  authoring/        ICD parser/types and subject-specific region compilation
  materials/        owner-bound flat planes, optics and procedural pixels
  rig/              constrained skeleton + contour deformations + pose states
  motion/           frame score, contacts, camera, transitions, secondary life
  evidence/         operative method tracing, render modes, visual compare
style/
  source_archive/   unchanged F01–F80 references/witnesses
  router/           conditional family and method selection
  questions/        priority, source contrasts and status
  learning/         local/family repair methods consumed on first pass
films/
  FILM_001/
    direction/      GPT-owned episode creative packet
    art/            actual subject-specific construction documents and curves
    scenes/         scene functions using those assets/rigs
    proof/          five hero frames and connected motion evidence
    render/         final movie and QC
~~~

These are responsibilities, **not** permission to write hundreds of speculative framework files. Reuse existing source paths where practical. Only build a module when a real film need proves it necessary.

## 14. What would prove success at each level?

| Level | Evidence required | Failure that cannot pass |
| --- | --- | --- |
| Semantic | Silent before/cause/after visually conveys intended fact | Attractive decorative scene |
| Artwork first pass | Actual full-HD subject has correct unique silhouette, proportions, material and reference-conditioned craft | Generic circle/tube/rectangle drawing with post-hoc style tags |
| Code binding | Active F-method condition changes real path/material/state code and corresponding pixels | Ledger name match or non-executing JSON |
| Identity/motion | Actor maintains registered contours, expressive features, correct grip/support through continuous animation | Limb drift or broken face |
| World construction | Original substrate, projection, connected functional density and meaningful quiet areas | Gradient + pasted random icons |
| Continuous sequence | Causal mechanism, camera and transition work at normal speed | Slideshow or continuous flat pan |
| Learning | Real repair is applied to next relevant original first pass and influences its code/pixels | Repair note never read by constructor |
| Artistic quality | Native/thumbnail whole-look visual review and comparison against relevant unlike source behavior | Technical pass presented as professional style equivalence |

**The first film can qualify the *specific resulting production*.** Transfer of a general system requires at least another meaningfully different script and independent inspection. A one-shot model self-approval is not a professional blind review.

## 15. Feasibility verdict and decision policy

**What the cited underlying technologies can express:** arbitrary intricate vector path geometry, compound silhouettes, parent-local colored planes, masks, optical effects, nested layers, procedural raster touches, skeletal/mesh deformation, constraints, IK and deterministic 60-fps motion. This is sufficient in principle to represent much of the observed 2D illustration and animation language. See the SVG 2 Paths/Rendering specs and Rive's public descriptions of rigging/mesh/constraints as technical evidence; Rive is a capability reference, not a mandatory engine replacement.

**What the current failure actually demonstrates:** Claude did not author a reference-conditioned original illustration before drawing. It bypassed a critical creative producer stage and certified code symbol presence as style compliance. That failure does not establish the aesthetic ceiling of code drawing.

**What no honest design can promise:** a general LLM generating arbitrary unfamiliar high-end original contours at professional quality in a single unreviewed first pass, or exact matching of unknown proprietary artistic decisions from a finite observed skill. Code has expressive capacity; authoring intelligence and visual revision remain the hard problem.

**Our implementation choice:** commit to the working code-native engine and the ICD/visual feedback process. Attempt pure-code subject-specific contours and material operations first. Evaluate at production scale early. If a specific family cannot reach the target, permit a documented registered hybrid **for that family** while preserving motion-native geometry, rather than accepting primitive art or scrapping a proven animation runtime.

The system is credible because it makes its failure modes *located, editable and observable*. It is not credible if it claims an abstract compiler can automatically manufacture good art from method labels.

## 16. Questions to ask before authorizing Claude implementation

Answer these from the targeted source ZIP, then bind this specification to exact functions and modules:

1. Which pieces of the original neutrino scene evaluator and deformable rig are actually preserved and working?
2. Where are the current generic ellipse/tube/box fallbacks invoked?
3. Can the code emit arbitrary cubic paths with named parts/masks and animated transform ancestry today?
4. Which material operations currently act on real parent regions, and which are one universal effect?
5. Where does the method catalog stop—in labels, authoring data or executed geometry?
6. How does the current tool expose native render PNGs to a visual model for honest inspection?
7. Can the rig preserve visible hand/contact and body weight across pose states? Which constraints remain absent?
8. Does the question-learning store change future constructor code or only some numbers?
9. Are the first-pass style witnesses actually accessed before drawing? Are contrary cases deliberately considered?
10. Which missing art state prevents the actual next script event, and must be authored rather than hacked through a transform?

No implementation task should claim "complete style transfer" without naming those answers and proving an end-to-end actual source-method-to-new-pixel example.

---

## Source basis and limitations

- Current five-film F01–F80 skill: STYLE_OPERATIONS, WORLD_SYSTEM_CONSTRUCTION, CHARACTER_FAMILY_CONSTRUCTOR, FIRST_PASS_VISUAL_CONTROL, VISUAL_CLUSTER_ATLAS_AND_DECODING_LOOP, MOLECULAR_CONSTRUCTOR_F57_F80, TRANSFERABLE_MOTION_DIRECTION_GRAMMAR, COMPLETE_FILM_ART_ORCHESTRATION, AUTONOMOUS_VISUAL_PRODUCTION_LOOP, REPAIR_LEARNING_TO_FIRST_PASS, FULL_FILM_ROUTER_AND_METHODS, CONDITIONAL_PALETTE_SCALE_AND_ABSTRACTION.
- EXPERIENCE DIRECTOR V1 and successful neutrino DIRECTION_V4 uploaded in this conversation.
- Claude's 21 November source-status audit, supplied by Manmeet. This status is **not yet independently code-audited**.
- SVG 2 specification: https://www.w3.org/TR/SVG2/paths.html and https://www.w3.org/TR/SVG2/render.html
- Rigging/mesh capabilities (technical comparison, not a dependency mandate): https://rive.app/features

**Next practical action:** wait for the already-requested targeted code ZIP, independently inspect actual bridge and rig source, update this spec with exact module mappings, then give Claude one implementation prompt tied to the inspected project. Do not resume manual repairs of the current primitive keeper.

