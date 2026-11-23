# Motion-Native Studio — Stage 1 source-to-code execution specification

**Version:** 1.0 — 21 November 2026  
**Status:** Implementation directive, not a claim of completion.  
**Scope:** Repair and qualify the *method-conversion layer*. **No Stage 2 film production** is authorized by this document.  
**Evidence inspected:** `STAGE1_FOUNDATIONAL_METHOD_QUALITY_AUDIT.zip`, particularly `SOURCE_TO_DRAWING_FINDINGS.md`, `engine/methods/*`, `F_SOURCE.json`, original F01–F80 reference files, `CHARACTER_FAMILY_CONSTRUCTOR.md`, `MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md`, and the build instructions. Existing workspace is `E:\MOTION_NATIVE_STUDIO_V1`; the ZIP is a snapshot, not necessarily its latest live state.

## 0. What is being built, and what is not

The target is a **source-conditioned illustrator and animation-art constructor**. It must be able to invent an original subject *for an unfamiliar script*, decide a visually coherent, specific design using the skill's conditional principles, encode that design in editable geometry and material-owned regions, generate registered poses/views, and expose a verifiable path from each significant decision to rendered pixels. The target is not a library of one universal character, a catalog of stickers, a list of negative validators, or an SVG syntax wrapper.

The source skill is **not an exhaustive literal geometry recipe**. It supplies conditional rules, comparative visual observations, question loops, and construction constraints. It does *not* specify the exact coordinates of a new person's jaw, every fold of an unfamiliar garment, or every component of a novel machine. Such content must come from a **positive subject-specific visual design operation**, explicitly attributed to original design judgment and then made causal in code. It would be false to label invented measurements “directly decoded from F01–F80.”

It is possible to render professional-looking vector illustration with curves, masks, bounded shading, custom material planes, compositing and specialized rigs. **It is not possible to guarantee GPT-image-equivalent artistic sophistication simply by converting 80 prose methods into deterministic functions.** The system must *show* that it meets the desired visual level using independently reviewed, full-resolution artwork. If it cannot, the stage remains unqualified and its missing design decisions are repaired or a registered, segmented image-art route is used. Neither route may be silently passed as success.

### Four distinct responsibilities — never conflate them

1. **Conditional art knowledge:** what a source witness shows, what *contrasting* witness disproves universality, when the rule applies, what it forbids, and what explanatory role the art must serve.
2. **Original visual authorship:** the *specific* intended silhouette, anatomy/part topology, facial design, palette relationships, material planes, environmental construction, camera/readability, and motion requirements of this new subject. This contains real choices. **No untracked improvisation:** record every consequential choice, alternatives rejected, and visual rationale.
3. **Code-native realization:** typed contours, compound paths, parent-owned planes, joints, soft shape states, masks, projection, rigs, and a deterministic frame function. The code must consume the authored design; it must not invent defaults behind its back.
4. **Visual qualification:** native 1080p pixels, correct whole-look, intended causal reading at normal viewing speed, coherence across views/poses, and transfer to unrelated subjects. Passing code unit tests is necessary but not this qualification.

The 80 F labels are **not 80 drawing functions**. Some are routing, evidence, direction, or motion contracts. Classify honestly. A routing method can be technically complete without being an artistic illustration producer; never put both under one ambiguous `IMPLEMENTED` label.

## 1. Non-negotiable source and decisions contract

**Original source authority:** compare directly with all 80 `F_SOURCE.json` entries and their complete linked files, including affirmative **Build** requirements, **wrong output**, **forbidden output**, conditional exceptions, and **Deliver**. Do not collapse the skill to its 10 negative rules or into a list of aesthetic adjectives. Do not copy identifiable characters or paintings from source films. Witnesses are style evidence, not art to trace.

For each F method, maintain a machine-readable record with:

- exact source path, line span, content hash; applicability predicate; method class; positive construction obligations; forbidden substitutions; source witness and *unlike* counter-witness where relevant;
- **what is mechanically derivable** (e.g. geometric projection, valid grip closure, adjacency constraint) and **what needs new original art authorship** (e.g. a unique cheek silhouette);
- typed input and actual consuming producer function, output type, consuming downstream stage, a pixel-visible causal perturbation, negative test, normal-size and thumbnail proof, conditional transfer proof;
- a named `UNRESOLVED` state for every missing decision. **Never replace `UNRESOLVED` with a default ellipse, generic tube, stock palette, “looks right,” a meaningless `usedMethods` array, or a self-declared `gap=[]`.**

### The high-impact questions must produce *data*, not merely prose

For each subject/scene, answer in order:

1. **What observable before → cause → after must viewers understand?** Name actual moving objects/ports and screen regions.
2. **What is the smallest original subject identity required to prove it?** Specify purpose, anatomy/physical truth, characteristic asymmetries, gesture, visible face/view and crop.
3. **Which two unlike source-native witnesses bound the appropriate construction family?** State what carries over and what emphatically does not.
4. **What exact whole silhouette, part connections and negative-space holes must be designed?** Specify individual contours, joint sockets, parent topology, depth ownership, and expected read at one-tenth scale.
5. **Which forms and surfaces are actually visible in this view?** Name near/far parts, garment structure, gaze, grip/contact, projection, materials, shadow planes and exclusions.
6. **Where is the viewer looking first, how does the causal baton travel, and what should remain quiet?** Allocate region-specific visual and motion budgets.
7. **Which transformations will the director require?** Design pose/view/topology variants now, including occluded underpaint, not after art is “finished.”
8. **Which source-derived construction mechanism, if wrong, explains the failure?** Repair that mechanism, rerun a *different* subject as well as the original, and preserve pre/post evidence.

There may be more than eight local questions, but **no unlimited-question essay**. Every answer must alter a named decision field which an instrumented builder consumes and which affects an expected region of pixels. If it does not, it is not an implemented control.

## 2. Exact data-to-pixel architecture

The authority chain is:

`Source method + unlike evidence → Rule applicability → Subject truth + director requirements → Original design plan → Named geometric regions / material planes / state atlas → Deterministic emitter + rig → Native pixels → Visual review + causal transfer → Revised rule/producer`.

### 2.1 Typed contracts (implement these or exact semantically equivalent interfaces)

```ts
type MethodId = `F${string}`; // checked against an immutable F01–F80 registry
type Origin = 'SOURCE_OBSERVATION' | 'SUBJECT_FACT' |
              'DIRECTION_REQUIREMENT' | 'ORIGINAL_DESIGN_HYPOTHESIS';
type MethodClass = 'ART_DESIGN' | 'GEOMETRY' | 'ROUTING' |
                   'MOTION_STATE' | 'EVIDENCE_GATE';

interface SourceRule {
  id: MethodId;
  sourcePath: string;
  sourceSpan: [number, number];
  sha256: string;
  class: MethodClass;
  appliesWhen: PredicateAST;                 // executed, not prose
  positiveObligations: string[];            // all source Build/Deliver obligations
  forbiddenOutputs: string[];
  contrasts: Array<{witnessId: string; unlikeWitnessId: string;
                    observation: string; nonTransfer: string}>;
}

interface DesignDecision<T> {
  id: string;
  methodId: MethodId;
  value: T;
  origin: Origin;
  sourceRuleHashes: string[];
  applicableBecause: string;
  subjectReason: string;
  rejectedAlternatives: string[];
  ownerIds: string[];
  expectedPixelEffect: {regionIds: string[]; type: string};
  status: 'RESOLVED' | 'UNRESOLVED';
}

interface VisualSubjectPlan {
  subjectId: string;
  proof: {before: State; cause: Event; after: State};
  family: string;
  functionAndAnatomy: PhysicalFact[];
  shot: {view: CameraModel; frame: Rect; minFinalSizePx: number};
  silhouette: {landmarks: NamedPoint[]; segments: ShapedSegment[];
               negativeSpaces: Region[]; readStatement: string};
  partGraph: PartNode[];                    // parent, sockets, local axes, near/far order
  facesAndViews: ViewDesign[];              // only where visible
  materials: MaterialOwner[];
  colorRelations: ColorAdjacency[];
  light: {source: LightSource; materialResponses: MaterialResponse[]};
  motion: {states: RegisteredState[]; contacts: Contact[]; revealMasks: Mask[]};
  density: RegionAttentionBudget[];
  decisions: DesignDecision<unknown>[];
  unresolved: string[];
}

interface ShapeRegion {
  id: string; semanticOwner: string; parentId: string | null;
  localGeometry: CompoundPath;             // outer + holes, not just an arbitrary string
  materialId: string; depthClass: string;
  ports: Record<string, Point>;             // real shared endpoints and attachments
  surfacePlanes: Array<{path: CompoundPath; cause: string; ownerId: string}>;
  motionOwnerId: string | null;
  reads: string[];                          // emitted by instrumentation, never typed by author
}

interface ProducerReceipt {
  implementationHash: string;
  actualProducerId: string;
  actualDecisionReads: string[];           // observed dynamic reads during execution
  emittedRegionIds: string[];
  pixelFootprints: Record<string, Rect>;
  sourceMethodsUsed: MethodId[];            // inferred from actual reads
  unresolvedDesignInputs: string[];
}
```

**Implementation detail:** `PredicateAST` is an explicit typed predicate tree (`all/any/not`, `family`, `view`, `pxAtFinalScale`, `material`, `effect`, `causalRole`), not `eval` or an LLM phrase. `CompoundPath` uses movable cubic segments and named control points; holes use a winding rule and IDs. Every contour point that is *identity-defining* is a `DesignDecision` output; geometric compilers may interpolate between them but may not secretly choose head/torso identity. `MaterialOwner` contains a part owner, local surface orientation, illumination regime, plane edges, and adjacency; **no global “crescent shader.”**

### 2.2 Required producers and dependency graph

| Producer | Positive output | Deterministic vs genuinely authored work |
| --- | --- | --- |
| `evidenceResolver` | Applicability + source/contra pair + forbidden transfer | Deterministic source classification; model must actually inspect witness pixels when deciding aesthetics |
| `causalDirector` | BEFORE/CAUSE/AFTER + proof region + motion owner | Director-authored concept followed by mechanical endpoint and visibility tests |
| `subjectDesigner` | Part graph, named masses, silhouette landmark/void map, 3–5 distinct candidate contour plans, selected original identity | **Visual authorship** grounded in function/view/source contrasts; not prefilled universal coordinates |
| `viewStateDesigner` | Per-view external contours, visible feature topology, neck/ear occlusion, expression shapes, pose atlas | New authored geometry for real topology changes; constraints and shared anchors deterministic |
| `paletteDesigner` | Palette roles per subject and actual neighbor graph with edge mechanisms | Artistic hue/value target choice + measured contrast optimization with hard fail if unsolved |
| `surfaceDesigner` | Surface-specific light/shadow/fold/recess planes attached to owners | Forms derived from declared surfaces, folds and light; no outline-translation default |
| `worldDesigner` | Coherent world graph, projection, repeated part owners and spatial scale | Semantic physical/diagram decisions authored; projection/tiling/occlusion deterministic |
| `rigStateCompiler` | Joint hierarchy, constraints, target contacts, registered deform/alternate drawings, masks | Pose-direction decisions authored; IK/geometry interpolation and alpha coverage deterministic |
| `proofRenderer` | 1080p frames/crops + focus-order/thumbnail/motion comparisons | Mechanical measurements *plus independent visual review* |
| `repairLearner` | Rule- and producer-level revision + effect on new first-pass | Patch highest-leverage constructor; do not “fix” a single artifact by hiding its symptom |

For unknown subject types, a producer must request original design inputs and produce a genuinely distinctive answer. The model **is permitted to choose original design**—that is indispensable authorship—but it cannot choose silently and then claim the skill prescribed it. “No improvisation” means **no unsourced, unrecorded fallback disguised as compliance**, not “ban all creative judgment.”

### 2.3 Exact contour-producing sequence

1. Get subject *function* and physical truth. Enumerate canonical masses with named joints, deliberate irregularities and silhouette-changing accessories. Record pose/view, minimum projected size, intended emotion and explanatory emphasis.
2. Determine the relevant source conditional: small symbolic human versus close acting human versus species or machine. Compare two **unlike** native witnesses and write which shapes must **not** transfer.
3. Author a whole-form `SilhouetteDesign`: 4–12 meaningful named landmarks per visible major mass as required, signed contour character per segment (`straight/concave/convex/inflection/corner`), asymmetry and pivot ownership, target voids. Counts are not universal caps; complexity follows screen scale.
4. Generate 3–5 **meaningfully different** candidates for major silhouette identity, differing in actual mass/proportions/negative spaces, not just curve tension. Render flat black silhouettes before details. Choose against subject-specific acceptance statements. Save rejected candidate comparison and decision.
5. For the selected one, design inner masses as **children of the outer topology**: connected neck/head, shoulder sleeves, body/hips, paired limbs and contact/prop. Derive Bézier control handles from chosen corner/tangent/curvature constraints. Emit visible contours only after a coherent whole silhouette exists.
6. At one-tenth display scale, check identity, gesture, separate arm/body gaps and object interaction; inspect whole silhouette pixels. An inconclusive read sends the design plan back to step 3; the system must not “repair” it by adding face details.
7. Add face/garment/material *specific to the selected design* and pose. Each plane, crease and overlap names its parent form, cause and stable state dependencies. Register alternate views/poses before considering master ready.

**Core distinction:** `contour.mjs` is an adequate cubic *compiler* but is **not** the preceding `subjectDesigner`. Implementing a negative rule like `notRound` is not a substitute for steps 1–6.

### 2.4 Exact head/body/material behavior

**Head/face (F05/F52/F65):** Establish actual cranium-to-jaw silhouette, nose/cheek/ear visibility and neck overlap *per view*; share a canonical 2.5D landmark set for coherence but register drawn front, three-quarter, profile and rear contours where the silhouette/occlusion changes. The invisible ellipsoid is a helper for projecting landmarks, **never** the source of universal face shape. For each view, draw named eye/eyelid/brow/nose/mouth regions from the original identity's design plan and selected eye mode. Expressions are *linked action states* modifying lids, brow, pupils, cheek and mouth while preserving identity; no standalone smile wedge pasted on a stationary head. Hide far-side marks when actually occluded. A tiny view uses the actual source-conditioned mark budget, not uniformly scaled close-up features.

**Body/garment/hands (F06/F59/F66):** Build silhouette masses and garment pattern areas from individual body shape, stance, tension, pose and material stiffness. Pose has center of mass, grounded support, shoulder/hip orientation, reachable joint targets and negative spaces. Sleeves attach to arm sockets, fold planes to compression/tension curves, collar/hem to actual garment construction. A hand grips *the specific prop cross-section*, with index/thumb ownership, far-finger back and near-finger front, visible closure and alternate open/release geometry; do not accept ellipse fingertips/parallel strips as the generic solution. At each pose, surface planes and cuffs reproject with parent, and the head/eyes may lead an action while hands trail per motion direction.

**Material/light (F02–F04/F46/F61–F63):** First solve *color roles and actual adjacency* including which edge is distinguished by value, hue or visible border; only then fill. Every material owner supplies local orientation, thickness, recesses, folds, light facing and occluders. Construct highlight/shadow **on physically and illustratively meaningful planes**: a metal rim gets facets/bright rim; a coat gets pose-owned fold/underside; skin gets selected cheek/jaw planes; glass gets transparent reflection geometry contained by its mask; emission gets light propagation and occlusion. No universal translated parent-silhouette crescent. Treat optical glow and atmosphere as *local physical exceptions* with source/occluder controls, not default airbrush on all parts. Check gray-scale and thumbnail pixels.

**Worlds (F08–F13/F37–F45/F68–F74):** Before contours, choose world family and its truth model: physical space, oblique facade, diagram, biological network, machine, macro specimen, cosmic scale, abstract stage. Build a connected **parent graph** (rooms/facets/terrain/organ roots/nodes/components) with actual ports, depth and coordinate basis. Populate with owner-local generators; never sprinkle unowned random blobs/windows/labels. Machine and habitat details arise from function, ecology and legible camera view. Full environment has designed foreground/midground/background and first-to-second read; no arbitrary static decoration masquerading as an animated world.

### 2.5 State/animation compatibility is upstream, not a patch

The first design plan lists required operations: bend, reach, turn, hold, breathe, reveal, topology change, camera move, containment, world swap. Each motion owner is drawn as separable region with named parent; rigs have pivot frames, contact constraints and local draw-order/occlusion. Changes in topology, material or viewpoint have **separate registered drawings** with correspondence anchors; do not scale a static PNG or rely on rigid rotation to simulate a soft deforming limb. Camera movement requires overdraw, underpaint and alpha masks sufficient for all exposed pixels. The neutrino runtime is retained as the frame-time execution base; replace the weak style-construction stage without destroying working authored-time motion capabilities.

## 3. Source-to-operation contract for **every F method**

The right column is a **necessary falsifier**, not a complete aesthetic score. “Art” means a positive design/geometry obligation. “Contract”/“Router”/“Evidence” means it governs other producers; **do not falsely claim it draws art**. Source files, predicates, positive clauses and contrasting cases are retained verbatim in the machine registry; this table is the implementation dispatch specification.

### F01–F19: foundational visual construction

| ID / type | Exactly what must cause drawing decisions or other outputs | Independent falsifier |
| --- | --- | --- |
| **F01 Art** | `subjectDesigner`: role, physical identity, view and intended motion → named outer masses, body/prop negative spaces, convex/concave/straight/corner segment decisions, meaningful asymmetry, full-size and 1/10 silhouette candidates. `contour` compiles the *selected* design. | Swap a scientist for a beekeeper: if the designer returns the same generic rounded silhouette with cosmetic changes, fail. |
| **F02 Art** | `paletteDesigner` and `surfaceDesigner`: split each part into named large base, light, shadow and material-colored subregions before microdetail; propagate parents into masks. | Recoloring a parent leaves unrelated loose colored decals, or a source rule selects the same colored stripe for every material. |
| **F03 Art** | `paletteDesigner`: explicitly classify condition (day/bright, interior, nocturnal, emissive, etc.) and produce conditional color-role target relationships per world; never universally transfer a source palette. | Changing light situation only renames token values but leaves final pixel hierarchy identical. |
| **F04 Art** | `lightDesigner`: select the actual light system for this scene; locate source/ambient, direct or rim, emission and occluders; generate local planes appropriate to the chosen regime. | Same uniform overlay/crescent across night-glow, indoor soft and external daylight subjects. |
| **F05 Art** | `viewStateDesigner`: canonical skull/jaw/cheek/ear/hair/neck topology, view-specific visible side and asymmetry; eye/mouth/brow/lid/pupil drawn shapes linked by acting state, not hardcoded one-size coordinates. | Turn from front to profile and only pupils move while skull/jaw/hair silhouette stays the same. |
| **F06 Art** | `bodyDesigner`: ground contacts, support/COM, torso gesture and near/far arm segmentation, garment construction under bend, prop-specific articulated grip, planted feet; emit pose-specific outlines. | A reach is rendered as two tubes rotated around stationary shoulders/hips; hands miss prop or have no grip. |
| **F07 Art** | `familyDesigner`: for actual species/mascot choose species-specific parent anatomy and visible attachment, eye/beak/muzzle/wing/limb logic; emit role-budgeted states. | Different animal families receive the same ball-head-and-tube-limb template. |
| **F08 Art** | `projectionDesigner`: choose measured oblique/orthographic facade basis, coherent footprint/height projection, wall-local openings and roof/edge occlusion. | Windows on independent screen planes or wall lines disagree about the same axis. |
| **F09 Art** | `machineDesigner`: physical function → main housing, moving mechanism, joints, feed/output sockets, openings, accessories and maintenance details; all attached to actual machine faces. | Decorative dials and tubes are scattered without functioning ports or plausible relative scale. |
| **F10 Art** | `worldDesigner`: coherent room/interior context with foreground, grounded floor/walls, focal causal location, secondary occupied/support spaces and camera coverage. | Flat colored backdrop behind a figure is labeled a “complete world.” |
| **F11 Art** | `ecologyDesigner`: actual terrain/substrate, species-form branch/trunk/crown topology, region-owned vegetation density, silhouettes and functional occluders. | Crowns are random blobs at tips regardless of tree type/terrain. |
| **F12 Art** | `networkDesigner`: root region, branches/attachment endpoints, measurable activation or flow paths, clustered cells/organs appropriate to factual anatomy. | Decorative wires/cells float apart from the claimed root network. |
| **F13 Art** | `opticsDesigner`: surface ownership and masks for transparency, reflection, transmission, volume, particulate depth, controlled glows. | One white/blue filter called glass/plasma/ice for all materials. |
| **F14 State contract** | `stateCompiler`: choose own-redraw, registered multi-state or rigid-track by *actual* change class; redraw internal plus outer shapes for swelling, contact or topology changes. | Soft-body state only uniformly scales unchanged outer and interior; causal test changes body module rather than F14 state selection. |
| **F15 Motion contract** | `motionPlanner`: define actor/part owner, trigger, choreography and causal start/end of every moving element, with meaningful changing silhouettes and camera motivation. | Whole environment drifts while the causal object does nothing. |
| **F16 Transition contract** | `transitionPlanner`: source/destination complete plates, registered landmarks, typed occlusion/reveal masks and mid-state, deliberate cut versus continuous transformation. | Any middle frame exposes the edge of a source painting or a bare alpha hole. |
| **F17 Evidence** | `renderWitness`: real full-size source/contra and code-output pixel comparison, visual mark-up, independent assessment and per-output evidence identity. | Only path counts/hex hashes/diagnostic SVG exist while whole-look is marked passed. |
| **F18 Evidence** | `coverageLedger`: separate states for native source observed, original design inspected, construction verified and animation frame checked; only actual files can advance states. | A frame count or renderer run increments artistic-observation coverage. |
| **F19 Router** | `mediumSelector`: choose draw-native, registered-image, diagram or mixed execution from actual art/motion constraints; articulate failure condition and required source attachment. | Same single medium forced on all subjects despite conflicting geometry/texture/rig requirements. |

### F20–F36: direction, specialized information and motion rules

| ID / type | Exactly what must cause drawing decisions or other outputs | Independent falsifier |
| --- | --- | --- |
| **F20 Router** | `beatRouter`: proof type and visual family → nested medium, world and actor producer dispatch; compile *actual calls*, not returned module names. | Selected route is a string with no called producer in execution trace. |
| **F21 Art** | `opticStageDesigner`: panel, portal or framing object has an actual parent, screen-space vs world-space basis, interior image-space, depth rim and reveal/occluder. | A window is a sticker with no correct interior/mask at changed camera angle. |
| **F22 Art/state** | `relightWorld`: same registered subject geometry under time-of-day change; per-material roles, actual lamps/sun/moon/emissions and adjusted shadow planes, preserving identity. | “Night” is only a uniform navy rectangle; windows and cast shadows ignore the declared light. |
| **F23 Art** | `perceptionEffectDesigner`: classify perception mechanism; build physically/illustratively bounded blur, ghosting, occlusion, magnification or attention field on specified region and time. | Global unfocused filter destroys the main causal mark. |
| **F24 Art** | `populationDesigner`: functional population distribution by region, meaningful variation and causal active subset; rule-controlled scale decay/occlusion. | Random evenly distributed dots or identically posed actors obscure the diagram. |
| **F25 Art** | `exchangeNetworkDesigner`: encode E/G/R/P/A/Q roles as a connected system with source/receiver/transfer paths, physical endpoints, order and reaction; map to actual part graph. | Motion traverses paths without arriving at a valid recipient or changing the stated system. |
| **F26 Art** | `geographicDesigner`: actual geography/data topology, local map coordinate transform, boundaries, destinations, masks, anchored flows and legible encoding. | Route travels outside map mask or unlabeled marks imply misleading data. |
| **F27 Art** | `schematicDesigner`: explicit graph entities and ports, meaningful edge paths, flow direction/reveal order, state contrast and stage layout. | Arbitrary line appears without endpoints, labels or a causal change. |
| **F28 Art** | `historicalMachineDesigner`: period-specific functional parts, process sequence and physically meaningful era identifiers; provenance of scientific/historical facts stays separate from art style. | A modern generic console receives “old” color without era-specific mechanism. |
| **F29 State contract** | `comparisonDirector`: two or more states with matched scale, anchor points and visual difference coding, each independently constructed; select correct comparison medium. | One drawing merely faded/tinted while the changed state is not visible. |
| **F30 Art/state** | `canonicalCharacterAtlas`: identity-preserving front/three-quarter/profile/rear as needed, brows/lids/mouth and expression/pose alternatives, exact cross-view anchors and topology changes. | Every state is the same head contour with shifted eyes and a nose wedge. |
| **F31 Motion contract** | `motionPlanner`: event DAG, beat timing, hand targets, IK reachability, contact locks and easing relationships; preserve causal order and support. | Hand reaches after the object moves, IK clamps silently, or scene freezes during narration. |
| **F32 Art/motion** | `effectPlanner`: classify emissions/particles/sweeps/liquids/glows by cause and space, bounded lifetime, density, occlusion and start/end visibility. | Perpetual sparkle sprites with no causal source or destination. |
| **F33 Art** | `detailAllocator`: each feature T0/T1/T2/T3 based on reading size, function, parent depth and viewing priority, with explicit optional omissions. | Microdetails outcompete a tiny causal actor; close-up face detail duplicated in a distant crowd. |
| **F34 Router** | `familyDispatcher`: `family` selects and **executes** the matching physical constructor(s) F01/F08/F09/F11/F12/F13, with genuine family-specific graph inputs. | Router returns `"plants"` while no vegetation producer is called. |
| **F35 Transition** | `invariantPlanner`: identify which object, boundary or symbol persists through each transform and register its shape/landmarks across source, middle, destination. | “Same object” appears a different color/identity on the frame of transformation. |
| **F36 Contract** | `shotCompiler`: compile script beat, facts, focal proof, art role, source contrasts, method triggers, state inventory and deliverables into concrete per-shot ArtJobs. | Long poetic prose cannot be traced to any output shape or shot-time action. |

### F37–F50: environments, geometry families and qualification

| ID / type | Exactly what must cause drawing decisions or other outputs | Independent falsifier |
| --- | --- | --- |
| **F37 Art/router** | `worldCompiler`: per-world physical/diagram mode, anchor coordinate system, focal mechanism, asset parents, lighting and action space; dispatches complete world graph. | `defineWorld` passes a schema yet no constructor consumes its spatial decisions. |
| **F38 Geometry** | `projectionFamily`: route layered-flat/oblique/axial/diagram/nested, establish one reference basis and actual view geometry per physical owner. | Family labeled `OBLIQUE` but facade/window/roof use incompatible axes. |
| **F39 Art** | `ecologyDesigner`: rooted terrain/substrate, species-specific trunk/branch/crown organization and vegetation zoning; explicitly choose density pockets/occluders. | Branch tips all emit random circles regardless of environment. |
| **F40 Art** | `builtWorldDesigner`: projected block/facade graph, parent-owned windows, ledges, setbacks, roof, paths and occluded structure; vary by architecture function. | Buildings are cutout rectangles or floating window strips on one depth plane. |
| **F41 Art** | `microWorldDesigner`: physically anchored anatomy/network with membranes, cells, tissues/branches and attachment ports; create meaningful close-view scale structure. | Cells/particles sprayed over a generic dark background. |
| **F42 Art** | `abstractStageDesigner`: explicit coordinate stage, support fields, boundaries, position encoding, controlled lightness/quiet space; no fake physical perspective. | Random platforms/gradients without a declared representational meaning. |
| **F43 Art** | `informationTheatreDesigner`: select correct panel/portal/comparison/node-field family and give each real owned mask/space, causal semantics and camera. | Different abstract scenes all rendered as a glowing neon dashboard. |
| **F44 Art** | `luminousVolumeDesigner`: physically localized emitting surface/volume, visible shell or cavity, scattering/falloff when relevant and occlusion/light on adjacent forms. | Light cone ignores foreground blockers or paints over the actor's face. |
| **F45 Art** | `functionalMachineSpaceDesigner`: corridor or machine as connected intake/process/output geometry, support hardware and motion clearances. | Machine looks busy but inlet and exhaust cannot connect or change state. |
| **F46 Art** | `materialPlaneDesigner`: shadow, highlight, underside, recess, fold and seam derived from each material owner and actual geometric cause; edge marks only when required. | The same offset-crescent around skin, glass, cloth and metal. |
| **F47 Art** | `tierReducer`: T0 causal, T1 identity, T2 meaningful subparts, T3 repeat/texture tied to final projected pixel size; emit real alternate simplified art. | T3 details remain after forced “small” tier, or T1 disappears before explanation survives. |
| **F48 Art/state** | `nestedWorldDesigner`: a correctly constructed interior world with aperture, enclosing mask, registered landmarks, medium-sized transitional state and underpaint. | Zoom-to-inside reveals a different unregistered painting at the seam. |
| **F49 Contract** | `compileWorldJob`: schema and semantic validation PLUS executed trace binding: world graph, coordinate system, mechanism, ports, layers, masks, causal purpose, motion inventory. | One of these fields is missing, placeholder, or never actually consumed; zero-perturbation PASS prohibited. |
| **F50 Evidence** | `worldTransferMatrix`: six materially unlike world families evaluated with real outputs and visible whole-look reviewer records, not fixture schemas. | All six are marked QUALIFIED from validators or the same generic world template. |

### F51–F65: semantic palettes, topology and specialized geometry

| ID / type | Exactly what must cause drawing decisions or other outputs | Independent falsifier |
| --- | --- | --- |
| **F51 Art** | `paletteDesigner`: assign specific region role (identity/proof/support/quiet/emission), chosen hue/value family, actual adjacency and lighting condition before obtaining hex values. | Every subject inherits identical arbitrary hues or source witness palette despite different function. |
| **F52 Art** | `faceMarkAllocator`: final-pixel-size and role determine exactly which eye/pupil/lid/brow/mouth marks exist; geometry and contrast reauthored where necessary. | A 20 px head has two mini realistic eyes, lashes and teeth; or a close-up misses acting information. |
| **F53 Art/contract** | `attentionAllocator`: **viewer first point, causal path, second read destination** are actual region/node IDs and directly change contrast, size, density and motion-owner budgets in corresponding regions. | Perturb causal path while keeping tiers constant; if emitted geometry/pixel emphasis stays unchanged, fail. |
| **F54 Geometry** | `repeatGenerator`: child anchors are calculated in parent-local axes/branch graph/face plane using bounding shape, spacing rules and exclusions; variation scoped to role. | Repeated details float when parent rotates, or windows and neurons share a generic dot pattern. |
| **F55 Art/router** | `inferenceFramer`: choose view, projection and crop because of precise viewer-inference requirement; propagate camera and visible face decisions to producers. | Camera changed while the newly relevant mechanism stays occluded or off-screen. |
| **F56 Evidence/repair** | `firstPassReview`: record **actual first pixels**, whole-look verdict, failed method/rule, patch and unrelated transfer case, not just an input manifest. | Pretty rerender accepted with no raw first-pass or no rule-level repair. |
| **F57 Director contract** | `causalProof`: emit machine-checkable BEFORE/CAUSE/AFTER state IDs, actual initiating and receiving geometry ports, active bbox and mark semantic categories; downstream constructor reads it. | String narration says “arrives” but no endpoint shape changes, or its bbox never affects layout. |
| **F58 Art** | `silhouetteDesigner`: parent outer contour/hole system based on actual anatomical function; every significant child merges/interrupts outer read, with tested identity at one-tenth size. | Topology passes but silhouette becomes a featureless blob when face removed. |
| **F59 Geometry** | `topologyCompiler`: parent sockets, near/far overlap DAG, true underpaint, hand/prop and head/neck contact geometry, attachment/inset rules, hard terminal occlusion checks. | A sleeve terminates visibly before elbow or near fingers appear behind the gripped prop. |
| **F60 Geometry** | `projectionCompiler`: a single physically consistent projection basis per owner; compute face corners, normals, facet visibility and local screen mapping from it. | A world has multiple mutually incompatible perspective axes for connected parts. |
| **F61 Art** | `paletteSolver`: actual pixel-neighbor graph selects value/hue/edge mechanism; generate explicit edge geometry if required; fail if contrast cannot solve. | `pass:false` roles remain accepted or `edge` channel claims success with no edge shape. |
| **F62 Art** | `surfacePlaneDesigner`: selected material + actual parent surface and light/contact geometry → local flat planes, seam type, occluder shadows and correctly clipped palette. | Every material turns into a shifted silhouette crescent with different color only. |
| **F63 Art** | `opticalPhysicsDesigner`: rays, falloff, emission, transparency and occlusion from actual source/socket, nearby blockers and distance; bounded glow masks and layer order. | Lamp cone passes through a solid foreground head. |
| **F64 Router/art** | `characterFamilySelector`: human close/full/rear, mascot, actual animal/macro organism, distant population based on role and screen scale; dispatches *different* body/eye/detail recipes. | Beekeeper, pigeon and microscope fly all routed to identical anthropomorphic anatomy. |
| **F65 Art** | `faceModeDesigner`: eye/mouth mode conditional on character type, view, role and projected px; generate new visible region shapes, not merely a renamed mode. | Select a side-view mode, yet two equally sized frontal eyes remain over profile. |

### F66–F80: contact, worlds, cameras and first-pass control

| ID / type | Exactly what must cause drawing decisions or other outputs | Independent falsifier |
| --- | --- | --- |
| **F66 Art** | `garmentContactDesigner`: weight/pose, collar/sleeve/hem architecture, local bend compression, prop-specific palm/thumb/finger geometry and accurate occlusion. | A coat stays static under a bent arm; grip survives prop removal unchanged; cutout tube arm passes. |
| **F67 State contract** | `stateAtlas`: registered outer and interior drawings for each actual pose/view topology, shared anchors/underpaint and frame interpolation policy. | “Profile” state merely translates front-view nose while head contour remains frontal. |
| **F68 Art** | `functionalMachineDesigner`: distinguish machinery housing, face facets, apertures, physical sockets and mechanism-driven movement; attribute each detail to machine function. | Decorative orange dials are unrelated to the scientific operation being taught. |
| **F69 Art** | `landscapeDesigner`: parent terrain/substrate masks, ecology zoning, plant scale/depth, attachment and exclusion rules, vegetation variations by region. | Same trees repeated on sky, sea and floor because random scatter ignores owner masks. |
| **F70 Geometry/art** | `architecturalExtrusion`: chosen footprint and wall material → coherent prism/facets, normal-based plane values, roof/openings projecting on real surfaces. | Top/side light disagreement and windows on an impossible wall face. |
| **F71 Art** | `biologicalGraphDesigner`: species/fact-specific anatomy graph, connected node types, characteristic branch density and activation path with visible response. | Biological nodes are decorative droplets with no actual mapped signal path. |
| **F72 Art** | `macroLensDesigner`: **separate** specimen anatomy, lens/glass aperture, foreground occluder and optical background coordinate systems; species-true surfaces and nested close-up registration. | Magnified specimen is just an eye scaled up over generic bokeh, no masks or matching landmarks. |
| **F73 Art** | `cosmicScaleDesigner`: physical space versus logarithmic map, timeline, distance comparison or abstract relation; accurate size encoding and legible labels, terminators for physical planets. | Misleading linear scale appears physically true; galaxies added as filler to a comparison diagram. |
| **F74 Art** | `semanticGraphDesigner`: exact legend `node/edge/region/glyph/glow/position`, connected ports/paths, meaningful stage and state change, focus baton. | Unrelated floating icons around a decorative pulsing center. |
| **F75 Art** | `typographyPartDesigner`: only causal/measurement labels, exact characters, parent anchor, box fitting, contrast, timing and mask; no unauthorized interface decoration. | A label points at the wrong object, is clipped or adds meaningless “data” decoration. |
| **F76 Geometry** | `parentLocalRepeat`: repeat family has local axes/branch graph, seed anchors, density by region, variation bounded by role and exclusion/owner mask. | Repeat detaches when its supporting facade/branch moves or overpopulates quiet regions. |
| **F77 Art/motion** | `localAttentionMotionBudget`: main proof/support/quiet/optical/transition-cover regions each allocate T1/T2/T3 and active versus held motion owners, with necessary separate art states. | Hide all T3 and explanation fails, or the only motion is background camera drift. |
| **F78 Transition** | `registeredCameraTransition`: declare reason to move, persistent identity, at least 3 source-target landmarks for claimed continuity, camera matrices, midstate, mask/cover, overscan and exact frame score; cuts explicitly allowed. | Continuous zoom reveals unmatched painting or visible seam; “match cut” wrongly claimed physical continuity. |
| **F79 Geometry/transition** | `alphaUnderpaintCompiler`: true alpha isolation, exposed clean underpaint, opaque occluder, overdraw master and registered transforms for every moving asset. | Hole shows when object lifts or occluder alpha covers less than required viewport at swap. |
| **F80 Evidence/art control** | `sourceNativeFirstPassCompiler`: relevant unlike witness **pixels visibly inspected**, content explicitly style-only, highest-impact concrete geometry/causal choices included *before prose*, true executed decision bindings, unedited first output and repair/transfer records. | File hash only, no human/model visual source assessment; fake `{producer,param}` strings pass although code never reads values. |

### Completeness accounting for all eighty

There are **80 distinct source obligations** in the table, but their implementation units overlap. For example F01/F58 share a silhouette designer; F05/F52/F65 share a face designer; F46/F62 share a material-plane designer; F16/F35/F78/F79 compose a transition stack. Sharing a producer is fine if **each method has its own predicate, positive output obligation, traced decision, and appropriately typed evidence**. It is **not** acceptable to manufacture 80 empty wrappers or call 80 negative regexes “artistic methods.” F72 was missing entirely in the audited snapshot and must be implemented; F17/F29 lacked proofs; neither status should be inferred from a different producer's passing test.

## 4. Exact corrections to the code that was audited

These are **necessary source-specific repair instructions** from the included files. Claude must compare the live repository before applying them; do not patch a line number blindly if HEAD or uncommitted content has changed. Preserve existing user edits. Before implementation, save a git checkpoint of the **exact existing work**, after verifying the staged file list (no `git add .` of caches, secrets or giant reference archives).

### 4.1 `engine/methods/emit.mjs` — stop fake provenance

**Audited failure:** `mint('F99','totallyInvented',{id:'blob',d:'M...',fill:'#ff0000'})` can reach `compose()` because `mint` tests a nonempty method string and SVG path prefix, and `compose` checks a WeakSet, not a registered method/function. Thus it is **not true** that arbitrary geometry is blocked.

**Implementation requirements:**

1. Freeze a registry of legitimate method IDs and concrete producer functions plus their source hash and class. Remove the globally accessible `mint(methodString, functionString, el)` pathway from product-facing exports. Give each registered **producing function closure** a non-exported builder capability. Only its live call context can emit a region; artifact compilation verifies producer identity, call ID, source rule, input plan ID, and actual read log. Reject F99 and any forged function name.
2. Separate `ShapeRegion` emission from SVG serialization. SVG `d` is not a proof that a source rule shaped its contents. The design compiler accepts only typed `CompoundPath` constructed from named, resolved design landmarks, with every significant contour span linked to an actual design decision ID.
3. A producer may emit a purely geometric helper region (e.g. underpaint/clip) if it names its parent and derivation. An **identity-defining** region without a genuine design-origin ID is an error; do not permit blanket bypass for helpers.
4. The composer recalculates actual dependency provenance; it never trusts a user-authored `uses:[...]` list. Validate no circular ownership, unknown parent, duplicate IDs or disconnected morph registration.
5. Test the observed F99 forged shape, direct naked SVG path, a legitimate registered contour and a genuine helper mask. Rejection is required for the first two; production output unchanged for the valid two.

Reference algorithm (pseudocode, not an invitation to create placeholder wrappers):

```ts
const PRODUCER_IDS = new WeakMap<Function, RegisteredProducer>();
function registerProducer<T>(id: string, methodIds: MethodId[], build: (i:T,c:BuildCtx)=>ShapeRegion[]) {
  if (!isKnown(id, methodIds) || PRODUCER_IDS.has(build)) throw Error('invalid producer');
  PRODUCER_IDS.set(build, {id, methodIds, implementationHash: hashSource(build)});
  return (input:T, ctx:BuildCtx): EmittedResult => {
    const traced = traceActualReads(input);                 // Proxy or explicit accessor
    const regions = build(traced.input, ctx.withPrivateRegionFactory());
    const actual = traced.finish();
    assertSemanticRegionOwners(regions, actual, ctx.designPlan);
    return {regions, receipt: receiptFromActualExecution(build, actual, regions)};
  };
}
// Do NOT export createCapability / makeMint / a loose tag-based SVG escape hatch.
```

The private capability protects ordinary use; it does **not** stop an agent with code-write access from modifying the compiler itself. Therefore require separate source-diff inspection, protected producer contracts, exact tests and independent visual approval before promotion. Don't claim a security guarantee from a local WeakMap.

### 4.2 `engine/methods/knowledge.mjs` — replace refusal-only knowledge with positive applicability + design procedure

**Audited failure:** 10 negative rules and a few lookup tables; no generator decides a character's characteristic head, a believable sleeve, or a tree species' architecture.

**Implementation requirements:** build `sourceRules` from original source text, classify each as procedure/conditional/art-design/geometry/motion/evidence. For every positive Build clause, encode one of:

- **Deterministic constructive operation:** function, mathematical inputs, owner, named output, test.
- **Decision requirement:** a required `DesignDecision<T>` with constrained domain, original subject reason, actual input to the builder, expected semantic pixel effect. Cannot be auto-filled with constant fixture.
- **Visual judgment:** mandatory side-by-side actual witness and dissimilar countercase, with an explicit chosen candidate and rejected alternative, then whole-look reviewer acceptance. This is not fake-computable by an “art score.”

The registry must reject a method that defines only negative statements when its source has a positive Build/Deliver obligation. For high-impact F01/F05/F06/F09/F11/F12/F37/F46/F62/F65/F66, `positiveDesignProducer` is mandatory. A method not inherently visual (F18/F49/F50/etc.) is honestly marked contract-only, not forced to invent geometry.

### 4.3 `engine/methods/contour.mjs` — separate **authorship** from Bézier compilation

**Audited failure:** shape-defining `landmarks` and `spans` are typed into fixtures; the source method does not determine them. Fix with `subjectDesigner` described in §2.3, whose output becomes `contour` input.

For every major contour require `wholeSilhouetteName`, `physicalMass`, `function`, `gesture`, `parentSocket`, `visibleFromView`, `identityLandmarks`, `voids`, `segmentCharacter`, `minimumPixelSize`, `chosenCandidateId`, `rejectedCandidateIds`. The generator may use cubic Hermite tangents and C1/C0 continuity to compute handles **from chosen segment classes**; it may *not* choose unconditioned generic landmarks or radii. At contour joins, compute local tangents from both sides and explicitly mark intended corners versus smooth continuity. Nested masks and holes are true geometry, not painted background patches.

**Crucial:** no algorithm can infer an unseen original silhouette's ideal landmarks uniquely from the word “scientist.” The decision producer must actually author and compare candidate drawings, based on art intent and source contrasts. If no candidate passes whole-form inspection, stop as `DESIGN_UNRESOLVED` and redo the *silhouette design*, not decorate the blob.

### 4.4 `engine/methods/face.mjs` — eliminate universal facial geometry

**Audited failure:** same invisible ellipsoid and fixed formulas construct eye openings/lids/brows/nose/mouth for unrelated identities; front skull contour can remain unchanged during yaw while details shift.

Keep an invisible projection frame, but **replace fixed feature templates** with canonical identity-specific view designs:

```ts
interface FaceDesign {
  identity: string;
  skullByView: Record<ViewId, CompoundPath>;
  jawCheekNosePlanes: Record<ViewId, RegionDesign[]>;
  earVisibilityAndSockets: Record<ViewId, VisibilityRule[]>;
  hairByView: Record<ViewId, RegionDesign[]>;
  featureFrames: Record<ViewId, {
    nearEye: LocalContourSpec | null; farEye: LocalContourSpec | null;
    browNear: LocalContourSpec | null; browFar: LocalContourSpec | null;
    nose: LocalContourSpec | null; mouth: LocalContourSpec | null;
  }>;
  expressionStates: Record<StateId, FeatureShapeDeltas>;
  miniature: Record<FinalPxBand, SimplifiedViewDesign>;
}
```

The model authors base view-specific contours (or chooses an approved subject design) and the software binds them to shared canonical landmarks. Define eye placement in **the chosen face's actual named planes**, not a fixed fraction that silently imposes a generic ethnicity or age. Each AU state updates coupled facial shapes and re-occludes far-side features. A front↔profile state switch must change the skull, jaw, ear/hair and feature visibility appropriately; use registered state drawings when 2.5D projection becomes visibly wrong. Render a selected canonical identity at front/three-quarter/profile/rear, 4 facial states, eye direction variants and final-pixel-scale reduction; review full and thumbnail views.

### 4.5 `engine/methods/body.mjs` / `hand.mjs` — geometry specific to the pose and contact

Replace fixed torso waist 0.45/neck 0.14 ratios with *design-selected* landmarks from the same body plan that defines shoulders, garment panels, hips and weight. Formulaic IK remains useful only for joints, not for outer garment art. For each bend, compute compression/tension direction in the local garment pattern, select per-material crease regions and control their fade/scale with bend. Tube centerlines are **internal skeleton**, not the final visible silhouette.

Build a hand from palm wedge/knuckle rows/thumb opposition/near+far digit volumes and selected contact points on the actual prop surface. Fingertips are *designed contours* (not universal ellipses) that close around the handle or release correctly across registered grip states. Occlusion order changes with view and prop orientation. Require tests for prop removed, prop rotated, hand open/closed, and a reach state with visual contact—not merely IK endpoint distance.

### 4.6 `engine/methods/palette.mjs` — make success mean success and implement edge decisions

**Audited failure:** solver can yield `{pass:false}` and still mark roles accepted; `assertSolved` checks only WeakSet. Also an `edge` contrast channel may report success without creating an edge.

**Required algorithm:** derive actual adjacency edges from region/parent masks (not only caller-entered pairs), classify each adjacency's intended channel (`value/hue/explicit_edge`), optimize role colors subject to the declared situation and identity constraints, **throw if any edge or palette invariant is unsolved**. If `explicit_edge`, create a line/trim region anchored along the real shared boundary with specified owner, width and color; remeasure rendered native pixels and verify edge does not become a universal outline.

```ts
const result = solvePalette(design.colorRelations);
if (!result.pass || result.failedRelations.length) throw new PaletteUnsatisfied(result);
const edgeRegions = emitEdgesForActualBoundaries(result, actualGeometry);
assertEveryEdgeChannelHasRegion(result, edgeRegions);
return Object.freeze({roles: result.roles, edgeRegions, verified: true});
```

Regression: force impossible contrast as in audit, assert *emission refuses*, then alter target to a solvable one and prove correct changed pixels **only on intended material owners**. Test grayscale + thumbnail viewing after rasterization.

### 4.7 `engine/methods/surface.mjs` / `optic.mjs` — no generic crescent

`volume_turn` in the snapshot computes `parent − translated(parent)` with material-dependent scale. **Delete it as a default illustration shader**. Keep it only if a specific selected design genuinely calls for an offset highlight with its own semantic cause (and explicitly named scope). Introduce `surfacePatchByCause({owner, surfaceFrame, material, shapeClass, illumination, crease/contact, view})` with distinct algorithms:

- **Flat facet:** intersect a face-local polygon with material owner; value from face normal × directional light and chosen graphic plane palette.
- **Garment underside:** draw actual folded panel between seam/crease anchors along garment direction, deform with pose and stiffness; shadow occupies folded/receding side.
- **Skin cheek/jaw:** select authored face-plane regions from identity; blend no more than the chosen graphic color planes, re-register as head turns.
- **Metal/glass aperture:** front/side thickness, rim, bounded highlight/reflection and transparent/recessed region with proper alpha and mask.
- **Machine cavity:** recess wall depth oriented against local light, interior dark plane and receiving hole/surface.
- **Optical volume:** emission center and falloff, bounded occlusion, depth relationship; only in a declared optical exception.

Every patch has `{ownerRegionId, causeEnum, sourceContourOrPlane, attachmentGeometry, localLightVector}`. A patch changing material must change its construction **when appropriate**, not only its fill color. Opposite light direction moves illuminated side; changing bend moves garment fold; changing owner remaps clipping. Prove with pixels.

### 4.8 `engine/methods/plants.mjs`, `projection.mjs`, `world.mjs`, `machine.mjs`

**Plants:** replace random crown-lobe scatter as an all-species mechanism. Build a species-conditioned branch/trunk topology plus individual terminal leaf/crown silhouette families and vegetation zones. Randomness may vary **within** this chosen species/region grammar, seeded deterministically. Subject design chooses species architecture; procedural repetition follows it.

**Projection:** keep single-basis math as a successful low-level tool. Require every face/window/cap/opening to derive from the same parent basis. Reject degenerate axes, impossible depth and unsupported wall faces. Geometry first, final art planes second; no “perspective label” substituted for a constructed space.

**World:** `defineWorld` must return a *consumed* design graph. Enforce actual dispatch into the chosen F37/F38/F39/F40/F41/F42/F43/F45 constructor, with full room/ecology/diagram topology. Validate functional ports against emitted regions. Include sparse, medium, and dense variants using the *same* original world identity to prove attention-driven detail scaling.

**Machines:** no arbitrary machinery rectangles. Require physical input/process/output path, component role, body planes, socket normals and accessible moving parts. Novel machine identity choices are written as original physical design decisions; checker verifies the visual output shows them.

### 4.9 `engine/methods/density.mjs` — attention must actually move pixels

**Audited failure:** `viewer_first_point`, `causal_path`, `second_read_destination` checked for presence then echoed, while budget uses only region and tier.

Implement `regionForNode`, `distanceToCausalPath`, `semanticRoleWeight`, `screenScalePenalty` in the budget function. Compute main-proof minimum T1/contrast and secondary T2, quiet-region maximum T3, optical exceptions and motion owner priority; adjust real drawing generators and color edge decisions. Use a simple explicit energy budget *whose coefficients are director-selected and stored as decisions*, not a fake universal artistic constant. Require one counterfactual: swap the causal path from A to B, re-render and observe emphasis move from A to B while identity and unrelated geometry remain stable.

### 4.10 `engine/methods/provider.mjs` and `direction.mjs` — actual control, not self-declared strings

`firstPassControl` currently verifies native witness hashes but does not require the **observed visual source content** to inform the plan; `{producer,param}` are strings and can describe nonexistent calls. Upgrade it to consume (a) visual observation reports and source+unlike attachments actually seen, (b) actual `ProducerReceipt`s, and (c) per-decision pixel effects after the first native render. If witness images cannot be inspected in the running environment, mark `EVIDENCE_NOT_VIEWED` and stop artistic certification; don't pretend hash verification is art comprehension.

`causalProof` must use machine-observable state IDs, real geometry ports/anchors, and a focal bounding box actually consumed by layout/density. BEFORE/CAUSE/AFTER prose alone does not prove causality. `routeGenerator` must invoke real constructor functions selected by routing; testing only the returned name is inadequate.

### 4.11 `engine/methods/proof.mjs` / `status.mjs` — eliminate false-green status

**Audited failures:** F49/F50 zero perturbations pass, F14 perturbation does not test the method's own table, F53 validates but does not consume attention, and the list `gaps=[]` written in `registry.mjs` determines labels. Replace with an evidence-based status reducer.

```ts
type MethodVerdict = {
  id: MethodId; class: MethodClass;
  sourceMatched: boolean;
  executableContract: boolean;
  positiveObligationsSatisfied: string[];   // linked to actual code/pixels
  obligationsStillOpen: string[];          // computed from source and proofs, not typed as []
  tracedDesignReads: string[];
  causalPixelEvidence: EvidenceRef[];
  nativeVisualEvidence: EvidenceRef[];
  unrelatedTransferEvidence: EvidenceRef[];
  result: 'UNMAPPED' | 'MECHANICAL_ONLY' | 'DESIGN_CONTROLLED' |
          'VISUALLY_QUALIFIED' | 'CONTRACT_VERIFIED';
};
```

- A **design/geometry** producer's positive obligations must cause emitted shape/material changes. Reading a field in `need()`, logging it, serializing it in a receipt, or affecting only a string is **not** a causal read. For each design-bearing input, do one parameter perturbation, map **expected** changed region IDs, compare actual native raster pixels and verify unrelated owner regions remain stable. A test with empty `perturb[]` must reject, not PASS. Complex conditional rules also need a contrasting condition that selects a different art construction, not only different value.
- **Routing** methods prove actual downstream function dispatch on both applicable/inapplicable cases. **Evidence/contract** methods use positive and negative real-record tests. They may be `CONTRACT_VERIFIED`, **not** “artistic implemented.” **State/motion** tests target their own selection tables and rendered states.
- `nativeVisualEvidence` is a human/independent visual approval of actual full-size scene and cropped evidence; a method cannot self-assert “beautiful.” Record reviewer, source/counter, original output hash, defect classification and approval/rejection.
- Source clauses are enumerated as obligations and marked satisfied only from bound proof records. `registry.gaps=[]` is informational and **never** drives computed status.
- At top-level, a failed child/invalid palette/unsolved contract throws or returns a hard non-renderable verdict. “Returns `{pass:false}` but other code keeps rendering” is not enforcement.

## 5. What actually demonstrates artistic quality — no more green counters

The Stage 1 **quality specimen** is not a toy SVG smoke test. Construct a coherent complete art image and its necessary acting states. Use **two unrelated design families** chosen for their ability to expose fundamentally different methods:

1. **An original, expressive character doing a real task in a designed physical environment:** distinct face/jaw/hair/garment silhouette; believable sleeve, hand-object grip and contact; at least front/three-quarter/profile and an expressive state; material-specific planes; near/far occlusion. Subject must not be a traced studio character nor a template from the previous unsuccessful bald scientist/beekeeper.
2. **An original complex non-human physical or informational world:** select a different construction family such as machine + coherent room, rooted ecological landscape, or biological network + optics. Its projection, functionality, scale and localized information density must be visibly genuine. A random scattering of rounded patches is disallowed.

These are **integrated first-pass artistic proofs**, not a demand for dozens of tiny test clips or an early full film. Do not choose easy fixtures to hide the deficiencies. They must use the **same public producer API** intended for unfamiliar scripts, the real source evidence loop, and the production renderer at 1920×1080. Emit unedited *first* results and repaired variants separately. For each specimen capture:

- full 1920×1080 master; native focal/face/grip/material crops; flat silhouette (no details); one-tenth-size identity sheet; view/expression/pose atlas; palette adjacency and value-only proof; depth/parent/sockets overlay; high-impact question answers and actual producer read trace;
- source-native style witnesses and unlike counter-witnesses shown *visually* beside the output with “transfer / do-not-transfer” annotations; no exact character imitation;
- at least one **8–12 second motion passage** at normal playback speed when relevant to prove rig/underpaint/shape handling, not merely independent frozen poses. Full-film Stage 2 remains forbidden;
- honest whole-look ratings for **silhouette specificity, proportion, expression construction, hand/contact, material plane accuracy, palette harmony, lighting, compositional attention, style consistency, and rig coherence**. Each verdict cites concrete pixel regions and expected visual behavior; do not accept an average hiding a critical defect.

An artistic reviewer may require rebuilding the design plan. **If facial identity, anatomy, silhouette or whole world construction is badly wrong, do not spend three hours shifting pupils or tweaking colors.** Return to the earliest faulty subject design decision and generate new contours from the original brief. If art design is good but projection/rig is wrong, patch the geometry compiler instead. The loop must classify defects by stage and correct the first bad producer, not decorate the symptom.

### Strict promotion criteria

| Level | What it proves | What cannot qualify it |
| --- | --- | --- |
| **L0 — Source classified** | Every applicable F rule has full positive/negative clauses and conditional source contrasts; no uninspected witness claimed. | Extracted headings or hashes alone. |
| **L1 — Producing mechanism** | Correct method branch calls typed producer; no unknown mint, hidden constant, fabricated reads or out-of-graph region. All high-salience source decisions are actually consumed. | `pass=true`, wrapper existence, manually populated `uses`. |
| **L2 — Real design control** | Input/art-decision perturbation changes the *intended geometry/material/attention pixels* and no unrelated region; contrasting source condition yields a **different valid construction**. | Validation-only reads, empty tests, only hex changes for a shape method. |
| **L3 — Artistic whole-look** | Actual integrated 1080p output passes human/independent comparison for distinctive first-pass form, coherent palette, material design and clear causal story; no critical defect. | Diagnostic head sheet, low-resolution bitmap, automated status table, author self-congratulation. |
| **L4 — Unfamiliar transfer** | A second unrelated subject/world generated through the unchanged public producer and rule machinery passes L2+L3; previously learned lesson affects **new first-pass geometry** where condition applies. | Manually repairing only the original example or copying source/reference art. |

**Stage 1 is complete only when:** F01–F80 source obligations are individually classified and the applicable ones have evidence appropriate to their method class; the bypass/fail-open bugs are closed; all **applicable artistic producing families** have L1–L2 proofs; core cross-family integrated art achieves L3; an unrelated transfer achieves L4; registered states do not destroy art identity; no severe unresolved source/design gap remains; and the independent reviewer approves native pixels. The complete skill cannot be marked “converted” merely because 80 labels, 80 functions and 46 tests exist. Not all 80 need to be active in every scene; applicability rules determine use.

**Do not replace the actual approval with arbitrary target scores.** The style source does not contain a universal PSNR, contour point count, RGB value, or artistic quality threshold. Geometry, functional connection, causality, mask completeness, owner confinement and pixel perturbations *are* measurable; beauty and style consistency require judgment against the reference evidence and intended new film art. This is a precise qualification protocol, not an escape clause.

## 6. First-pass question, repair and transfer loop — mandatory and automatic

At each integrated art job:

1. Build `SOURCE_CONTRAST` with actual native source and unlike witness; write five *consequential* subject-specific answers (identity/silhouette, causal role, view/pose/contact, materials/light, attention/detail). Ask further micro-questions only when they resolve a concrete geometry fork.
2. Freeze a `DesignPlan` with candidate comparisons, chosen silhouette, canonical topology, view state, palettes, surfaces and active ownership. Every hard identity-defining geometry token is a recorded decision. Fail on unresolved required fields.
3. Compile and render the **first-pass art** without author-selected hidden patches. Save it with immutable hash and full-resolution face/hand/whole-look crops. Never overwrite first-pass evidence.
4. Compare to both style witnesses, the *unlike* countercase and the actual scene brief. Classify each defect as source routing, original authorship, geometric compiler, material/palette, rig/occlusion, attention, or runtime/pixels. Ask: **what is the earliest incorrect producer?**
5. If source routing wrong, fix predicate; if design wrong, regenerate candidate contours/design decisions; if compiler wrong, repair code; if motion wrong, update registered states/contact; if artistic whole-look wrong, name what the image should have looked like before touching code. Change the **cause**.
6. Rerender original and **unrelated transfer** under the same updated rule/producers. Check the transfer first pass: did it improve without subject-specific patches? Preserve before/after/transfer evidence and method decision traces.
7. Continue until the quality gate passes or a real blocking design limitation is documented. **Do not stop after one pass to announce defects and seek generic permission to repair.** Stop for missing authority, unavailable necessary native references, or a meaningful artistic choice the user must decide.

If repeated pure-code design does not approach approved style despite actual causal control, present the precise visual gap and propose a conditional **hybrid art-native path**: produce original image-based master art, segment by owner with alpha and clean underpaint, vectorize/redraw only deforming regions where needed, register states and animate through the same runtime. This is **not** the old frozen-image slideshow: it requires pose-state authoring, limb/face variants, deformation and real transition correspondence. Do not implement the fallback automatically or claim it is visually equivalent without approval.

## 7. Ordered implementation milestones and protected scope

Claude must work in this order. At each checkpoint show **artifacts and actual causal evidence**, then move on if and only if passing. It may commit recoverable checkpoints, but must never “promote” Stage 1 merely to keep moving.

1. **Snapshot the live repo and reconcile audit.** Read `CLAUDE.md`, `HANDOFF.md`, the two prior implementation files, **all original 80 method sources**, the native contrast references and audit ZIP. Compare live HEAD/working tree to audit snapshot. Record differences; do not erase uncommitted work. No film building.
2. **Fix counterfeit enforcement first** in `emit`, `palette`, `proof`, `status`, `provider`, including observed regressions F99 fake mint, impossible palette accepted, zero-perturbation PASS, F53 attention ignored, fake producer binding, `{pass:false}` falling through.
3. **Implement the positive decision layer** with typed plan, conditional source applicability, subject identity/topology, source/contra visual evidence and named actual reads. Demonstrate that no generic fallback fills an unresolved art requirement. Author/director choices must be explicit and locked as data.
4. **Qualify the highest-leverage art producer families** in this sequence: F01/F58/F59/F60 whole silhouette/topology/projection; F05/F30/F52/F65 head and face; F06/F66 hand/garment/contact; F02/F03/F04/F46/F51/F61/F62/F63 palette/material; F09/F11/F12/F37/F38/F39/F40/F41/F43/F68–F72 worlds. For each: positive decision, actual geometry, conditional countercase, native pixels. No bulk number-based claim.
5. **Integrate attention and motion as actual art ownership**: F14/F15/F16/F29/F31/F35/F53/F67/F77–F79, with registered view states and time-dependent behavior, no broken camera/alpha seams.
6. **Finish routing/evidence/art-contract coverage**: all applicable F01–F80 obligations; F17/F29 proofs, F72 missing producer; F18/F49/F50/F56/F80 must have real records and class-correct evidence.
7. **Show demanding whole-look results and transfer** per §5. If any visual flaw persists, loop §6. Do **not** start a full episode until independent artistic acceptance of Stage 1 output and separate authorization to enter Stage 2.
8. **Finalize receipts and a concise honesty report**: what is source-derived, what is original authored, what is algorithmic, what is visually demonstrated, which exact methods remain incomplete. Readability matters more than a massive celebratory ZIP.

### Never again

- Never treat manual landmarks as proof that the skill *generated* the silhouette.
- Never count the same diagnostic passing test as independent artistic evidence.
- Never treat exclusion-only methods as equivalent to positive design generation.
- Never let Claude tune a weak art fixture into a green test while the target still looks generic.
- Never hardcode a universal “beautiful character” template based on one past film.
- Never invent exact style principles not actually in the five-film source data.
- Never change working neutrino-style time-native animation into a PNG-only compositor.
- Never report “all 80 implemented” while design or whole-look evidence is missing.
- Never allow a routed family to declare success without calling its actual producing function.
- Never accept “I'll fix it later” for eyes, grips, silhouette, lighting, composition, underpaint or causal path in a claimed visual master.

## 8. Handoff deliverables for independent inspection

Deliver to `engine/methods/evidence/stage1/` or a dedicated repository evidence directory:

1. `SOURCE_RULES.json` — all 80 exact source hashes, classes, conditional predicates, positive Build/Deliver obligations, forbidden cases, unlike native witnesses and no-copy boundary.
2. `CODE_BINDINGS.json` — actual registered producer import/call graph, source rule triggers, mandatory decision fields, emitted region owners and method-specific exact tests.
3. `DECISION_PLANS/` — new original subjects' chosen and rejected visual decisions and named contour land­marks, not just “tone: cinematic.”
4. `EXECUTED_TRACES/` — observed decision reads, source-to-function-to-shape IDs, region footprints and actual pixel causal perturbations with confinement.
5. `FIRST_PASS/`, `AFTER_REPAIR/`, `TRANSFER/` — full-resolution frames, contour-only sheets, focal crops, source/unlike comparisons, multi-view/pose atlas, 160-px thumbnail evidence, and normal-speed motion proof.
6. `ART_REVIEW.md` — subject-by-subject *human-readable* verdict for every major artistic component and the earliest faulty producer on failure; unresolved decisions left visible.
7. `STAGE1_STATUS.json` and `STAGE1_STATUS.md` — reducer-computed class-specific status, no manual “gaps=[]” promotion, exact source/implementation commit hashes, no misleading success language.
8. Updated `CLAUDE.md`/`HANDOFF.md` preserving the Stage 1 lock and clear next actions. Git checkpoint with explicit staged inventory and commit identity, if permitted by repository workflow.

**Important scope boundary:** This file describes the intended implementation and evidence criteria. It does **not** imply that Stage 1 is already completed, that the provided audit includes all files in the user's live E: drive, or that a reviewed screenshot proves the exact code cause. Inspect current files before changing them. The audit-proven counterexamples in §4 are firm for the inspected snapshot; subsequent live repository revisions may have addressed some of them.



