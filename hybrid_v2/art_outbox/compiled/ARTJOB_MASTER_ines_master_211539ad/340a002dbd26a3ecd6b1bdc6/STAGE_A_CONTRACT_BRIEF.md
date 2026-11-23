# CONTRACT DECISION BRIEF — ines_master (ACTING_HUMAN)
Required methods (35) with source applicability:
- F01 [STRUCTURE] subject has a drawn physical silhouette (family ACTING_HUMAN)
- F02 [SURFACE] every illustrated surface is built from owned colour regions (family ACTING_HUMAN)
- F03 [SURFACE] every new image needs conditional colour roles (family ACTING_HUMAN)
- F04 [SURFACE] lit surfaces need a lighting system choice (family ACTING_HUMAN)
- F05 [STRUCTURE] a human face is visible (family ACTING_HUMAN)
- F06 [STRUCTURE] a human body acts, locomotes or contacts (family ACTING_HUMAN)
- F14 [STATE] the subject has alternate states (family ACTING_HUMAN)
- F15 [ENGINE] the subject is owned by motion tracks (family ACTING_HUMAN)
- F16 [ENGINE] a transition involves the subject's shots (family ACTING_HUMAN)
- F17 [REVIEW] every artwork needs whole-look / provider-control proof (family ACTING_HUMAN)
- F18 [REVIEW] every frame is observed, not decoded (family ACTING_HUMAN)
- F19 [ENGINE] medium and timing are routed per subject (family ACTING_HUMAN)
- F20 [ENGINE] each beat is routed to a medium (family ACTING_HUMAN)
- F30 [STATE] a character/organism needs a multi-state library (family ACTING_HUMAN)
- F31 [ENGINE] motion keys are owner-specific (family ACTING_HUMAN)
- F33 [STRUCTURE] density/abstraction is scoped by view depth and task (family ACTING_HUMAN)
- F35 [ENGINE] storyboard transitions carry one conserved invariant (family ACTING_HUMAN)
- F36 [REVIEW] source-to-new-script decisions compile into enforceable artifacts (family ACTING_HUMAN)
- F51 [SURFACE] palette is a system of roles and region ownership (family ACTING_HUMAN)
- F52 [STRUCTURE] scale and role determine facial/structural mark count (family ACTING_HUMAN)
- F53 [STRUCTURE] density is caused by explanatory material (family ACTING_HUMAN)
- F56 [REVIEW] prompts execute as geometry; first pixels are inspected (family ACTING_HUMAN)
- F57 [STRUCTURE] a visible causal proof is required (family ACTING_HUMAN)
- F58 [STRUCTURE] silhouette is constructed before interior polish (family ACTING_HUMAN)
- F59 [STRUCTURE] parts join and occlude in a deliberate topology (family ACTING_HUMAN)
- F61 [SURFACE] conditional palette roles (family ACTING_HUMAN)
- F62 [SURFACE] edges and shadows have owners (family ACTING_HUMAN)
- F64 [STRUCTURE] human/mascot/animal identity routed by illustration family (family ACTING_HUMAN)
- F65 [STRUCTURE] eye/mouth construction depends on role and crop (family ACTING_HUMAN)
- F66 [STRUCTURE] body acting needs weight, garment volumes and contact states (family ACTING_HUMAN)
- F67 [STATE] pose/expression/mechanism states form a registered family (family ACTING_HUMAN)
- F77 [ENGINE] information density is allocated locally and to motion owners (family ACTING_HUMAN)
- F78 [ENGINE] camera/representational transitions obey a correspondence invariant (family ACTING_HUMAN)
- F79 [ENGINE] alpha, underpaint, parallax and offscreen budget are owned (family ACTING_HUMAN)
- F80 [REVIEW] the first provider request contains the methods and unlike native pixels (family ACTING_HUMAN)

### F01 — Silhouette and functional anatomy (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 1a712dabe39e31ab38246f5f078bf9e9d909f9cc43be0999ee558e64b94077f1):
**Input:** subject type, actual anatomical/function role, intended view, motion/contact requirement, nearby supports.

**Procedure:**

1. Draw the complete subject as a silhouette in its particular **view**. It must be recognizable without eyes, markings, decals, textures or glow. Explicitly name what makes this species or object different from another subject of its family.
2. Divide into structural masses only where a real connection exists: skull + hair cap + facial exposure; torso + facing garment planes + arm/leg/hand; animal torso + neck/head + near/far legs + tail; machine housing + screen recess + controls + feet; tree trunk + major branch joints + crown.
3. Arrange masses with overlap order BEFORE details. Reject a missing joint covered by a decorative strip.
4. Draw subpart contours to follow actual direction of the full gesture/object: shirt edges follow bent arms, window grids lie in a single facade plane, scales follow the body surface, leaves emerge from stems.
5. Test silhouette at one-tenth output size and compare against the first intended whole form. If subject identity only works when labels or decorative eyes are visible, return to Step 1.

**Style invariant:** coherent purpose-specific contour + meaningful attachments + selective large internal colored masses. **Not invariant:** roundedness, limb count, body ratio, amount of detail, exact species anatomy, object palette or silhouette.

**Wrong output:** sphere with four identical cylinders for a human; generic circular bird with glued-on beak; pig-shaped "cow" with two flat legs; purple rectangle labeled machine; plants as unrelated floating leaves.

THIS SUBJECT'S DECISION:
Specific decision: Asymmetric bob silhouette, forward-tilted jacket back, near hand held clear of the jacket edge, two wide trouser masses tapering to wedge shoes
Visible construction operation: Fill the whole figure in one flat colour: the head turn, the free near hand and the planted far foot must read; structural masses join only at neck/shoulder/hip/cuff
Inputs it depends on: view threeq_r; action reach-grip-pinch-turn
Output art components: outer silhouette; named masses with parents
Falsified if: At one-tenth size the flat-filled figure does not read as a person reaching
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses | NUCLEAR_0083_farm_humans.jpg [1040,260,360,620] — kneeling farmer: weight on one knee, torso leaning into the contact, rolled sleeve cuff
Unlike witness contrast: the runner reads through a stride; the farmer through a kneel into contact — Ines reads through a standing reach

### F02 — Surface-color construction instead of generic line art (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 b7ac22061b592d41876a686e3f6b1c95f681307321c1b922e72aa03262f4bc05):
**Procedure:** for each material create `base_body` and zero or more `attached_color_form`s. Each form must name its material parent and satisfy one of: (a) view-facing plane, (b) anatomical volume change, (c) raised/recessed functional shape, (d) glass/specular detail, (e) designed local marking. Bound shapes by contiguous intentional filled edges. Most ordinary contours are a boundary between neighboring fills, not automatic thick black strokes. Use narrow colored rims specifically for a glass frame, housing bevel, roof lip, vessel edge, or required accent.

**Exceptions:** line drawing is permissible within its own illustrated media (white paper montage), ordered fine wiring, visible stems, frame rails, certain facial brows and technical detail. Such lines have named function. Never globalize this exception.

**Test:** ask for a flat-color layer view with outlines disabled. If the image becomes unintelligible, the form was constructed by contour lines rather than colored surfaces. A second test checks that secondary patches share the same parent mask/shape boundary rather than floating over a body.

THIS SUBJECT'S DECISION:
Specific decision: Every mass is a flat owned region: jacket mustard, cuffs lighter mustard, trousers teal, skin warm brown, hair plum
Visible construction operation: Paint regions edge-to-edge with no outline; where two regions meet the colour change IS the edge
Inputs it depends on: F61 palette roles
Output art components: surface region map
Falsified if: Any black or dark outline separates two regions of the same owner
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [800,520,560,300] — navy trousers as two flared masses with a darker inner plane, no outline | MEMORIES_0753_clinic_humans.jpg [1240,340,560,740] — seated figure: garment masses, collar, crossed legs, chair support
Unlike witness contrast: runner's trousers are one dark mass; the clinic figure separates collar and sweater by colour only

### F03 — Conditional color-role solver (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 0878db3d7695101e0b2477db5713383c065711ba97701f831a319ee4e670ce83):
**Do not prescribe one palette.** Build a role table for the new scene:

| Role | Required decision | Source-like behavior | Anti-rule |
| --- | --- | --- | --- |
| Environment base | dominant broad hue/value fields conditioned on world | quiet cream-yellow acting field OR layered olive landscape OR cyan room OR dark-violet space | give every scene navy + yellow merely because examples exist |
| Focal silhouette | hue/value separation from immediate backdrop | peach cattle on olives, warm skin against cyan, bright face against hair mass | saturate background and focal subject equally |
| Body planes | light-side/base/shadow-side color *within material family* | colored shirt patches, alternate wall planes, rounded facial cheeks | apply universal airbrush bevel to everything |
| Shadow anchor | specific low-value contact and recessed parts | hair/navy trousers, machine screen, dark plant foreground, far facade | thick black stroke around every shape |
| Accent | a few semantically owned high-chroma details | nose/eye/prop, luminous center, device control, tiny activity | randomized rainbow speckles |
| Optical/emissive | glass, glow or illumination belongs to actual light-carrying object | bounded lens highlights; structural galaxy core; activated branches | blur entire composition to create “magic” |

**Method:** choose the appropriate reference *situation*; establish base/foreground/focal role before assigning the actual subject's original palette. For every new material assign a hue family and its lighter/darker subregions; prohibit random unrelated hues inside one object unless those colors represent named separate materials. Check whole-frame contrast at thumbnail scale and ensure low-contrast infrastructure recedes where source uses it.

No fixed HEX swatches have been demonstrated universal across these five films. Record sampled swatches for **witness comparison**, not as compulsory colors for every scene.

THIS SUBJECT'S DECISION:
Specific decision: Identity role = mustard jacket; support role = teal trousers; focal warm = skin; accent = plum hair; background is not part of this cutout
Visible construction operation: Assign each region one role and keep the near hand the warmest small region
Inputs it depends on: story focus: the near hand acts
Output art components: role table per region
Falsified if: The jacket is warmer or more saturated than the near hand
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch | MEMORIES_0753_clinic_humans.jpg [0,0,1920,700] — monochrome blue room: background planes in one hue family at lower contrast than the actors
Unlike witness contrast: the runner sits on a warm field; the clinic actors pop from a cool monochrome room — Ines is a cutout, so contrast is internal

### F04 — Four distinct lighting systems (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 d2de5dd35b62dbe10e16962c52326d3e9dd4e2094d148c6b8978b1cf02755151):
1. **Opaque form:** bounded fill/color patches on skin, cloth, animal bodies, roof faces, shell plates. Preserve crisp silhouette. Use hard masked local surfaces; no unconstrained Gaussian blur.
2. **Optical material:** contained reflection/inner glass color within a lens, visor, eye facet, display, bowl or glass. Define physical lens or glass region first, then clipped reflection and any visible transparency layer. No highlights beyond lens mask.
3. **Emissive physical element:** recolor a real connected branch/filament, lamp, window, hot ribbon area or screen information. Source geometry continues beneath the light. Add halo only after emissive shape exists.
4. **Atmospheric light:** very bright source, galaxy core, whiteout, sunlight, flare, selective depth haze. Preserve hard anatomy and machinery where those have not been occluded/washed out by evidence.

**Test:** temporarily remove glow. Galaxy must retain broken arms/core and points; neural branch must remain connected; screen must retain glass/recess; insect facet must retain eye anatomy. A pure blurry blob fails.

THIS SUBJECT'S DECISION:
Specific decision: Flat-plane lighting: one darker side plane per garment on the far side, no gradient, no specular
Visible construction operation: Paint one darker plane on the far side of jacket and trousers; nothing else changes value
Inputs it depends on: F62 shadow owners
Output art components: far-side planes
Falsified if: A gradient, highlight or soft shading patch appears
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1360,340,540,360] — purple bench: flat fill plus one darker side plane; light comes from flat colour planes | NUCLEAR_0083_farm_humans.jpg [1040,560,240,280] — jeans: one mass with a darker side plane, folded at the knee
Unlike witness contrast: bench and jeans both use one darker side plane; neither uses gradients

### F05 — Human head and facial-state fabrication (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 f0c8ec6daecc20041913eb592eb5df852b83c9be646b6fc483b6633118be0080):
**Input:** novel identity; age-coded original design; head view; gaze; expression; interaction; camera scale.

**Create in order:**

1. **Cranial and hair masses:** construct one coherent skull/head contour, then a deliberately authored hair volume that wraps and conceals appropriate skull regions. Distinguish bangs, cap, bun/tufts/locks by a small number of attached shape groups. Hair can be broad purple, navy or brown; its *mass construction*, not source hairstyle, transfers.
2. **Exposed facial plane:** a contiguous skin region inside the correct front/side contour. Attach near ear and cheek color region, jaw/neck overlap, only view-visible far contour. Facial patches are not stickers on a sphere.
3. **Eye system:** explicitly draw eye opening shape, white sclera if present, black/navy iris/pupil, upper lid or brow, and different near/far sizes/occlusions appropriate to head turn. In a profile, omit the hidden eye instead of symmetrically duplicating.
4. **Expression:** specify distinct brow curvature/vertical relation, eyelid shape, mouth open/closed interior, cheek tension patch and head tilt. Use whole visible facial drawings as needed, not independent eye-spin layers.
5. **Accessory:** glasses bridge, ear-piece, earring, hood/hair tie must contact the correct skin/hair region. Lens reflections clipped to actual glass.
6. **Pose coupling:** neck enters torso at a perspective-appropriate point; entire head/face silhouette changes when tilting, running, reclining or consulting. Do not create an independently floating emoticon head.

**Novel-face test:** same character front/three-quarter/profile, neutral/worried/speaking, but preserve unique hair silhouette, costume identity, face plane treatment and expression vocabulary. Source evidence currently insufficient for exact proprietary turnaround grammar: flag this as a targeted research need, not a license to fabricate an alleged observed rule.

**Failure:** anime-style detailed nose/eyes and decorative hair strands; symmetrical circular eyes pasted onto a profile; generic eyebrow emoji; tiny face on huge unstructured skull; floating glasses.

THIS SUBJECT'S DECISION:
Specific decision: Compact rounded skull, three-quarter face plane cut by the bob, near ear patch; states change brow/lid/mouth contours, never stickers
Visible construction operation: Draw skull, face plane, hair mass and ear patch as separate owned regions; neutral/curious/satisfied redraw brow, lid and mouth contours
Inputs it depends on: F65 eye mode; state family
Output art components: head regions; three facial states
Falsified if: Expressions are produced by swapping a pasted eye/mouth sticker on an unchanged face
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch | MEMORIES_0753_clinic_humans.jpg [1420,400,240,260] — closed-lid arc eyes behind glasses, small smile, bun
Unlike witness contrast: runner: open alarmed mouth; clinic: closed-lid content arcs — different contours, same construction

### F06 — Human body, hands, locomotion and meaningful contacts (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 0ced08890c42a86a3d19cb7b5095eb66c6521b5f40399f14d06a76e796dbf697):
1. Choose a whole gesture and support pose first: standing, running, reclining, kneeling, seated, leaning, working. Sketch center of mass, supported limbs and eye/hand attention as a **whole image**.
2. Construct torso and garment as pose-specific silhouette, including bent sleeves, distinct near/far cuff colors, clothing overlap and pants folds determined by the bend. Not all arms or legs remain same width.
3. Generate actual *task-specific hand art*: reaching hand (separated open palm/finger mass), pinch, hook grip, broad supported palm, holding stick/clipboard, computer input, grasping an irregular prop. The source simplifies fingers but preserves readable hand/prop relationship.
4. For each contact write a graph `actor.hand -> prop.handle`, `actor.foot -> ground`, `actor.hip/back -> seat`, `prop -> support`; draw near/far occlusion, grip closure and exact attachment side. Fingers don't pass through object or disappear.
5. Create alternate drawings for significant change: gait stage, face/head tilt, hand opening/closing, shoulder or sleeve turn, lifted foot, shifted weight. A static pelvis with disjointedly rotating elbow segments fails.
6. Ground with contact-aware little elliptical/fill marks **only where that style treatment applies**; don't force every environment to use them.

**Test:** remove the prop temporarily; wrist/thumb/finger orientation must still indicate an intended grasp location. Replace the prop with a novel shape; generate a new valid contact state rather than reusing source-specific hand illustration. Verify foot support and no stretching.

THIS SUBJECT'S DECISION:
Specific decision: Standing support on the far foot; near hand drawings open, closed grip (fingers in front of the handle, thumb behind) and pinch (thumb-index tips)
Visible construction operation: Draw the canonical open hand clear of the jacket; grip and pinch are separate source-attached hand drawings with explicit near/far finger order
Inputs it depends on: contacts GRIP/PLANT/FOLLOW; handle and coin slot
Output art components: open hand; grip hand; pinch hand; contact graph
Falsified if: Fingers pass through the handle or the thumb is on the wrong side
Source witness regions (STYLE ONLY): MEMORIES_0753_clinic_humans.jpg [1400,720,160,120] — hand holding the clipboard: fingers in front of the edge, thumb behind | NUCLEAR_0083_farm_humans.jpg [1380,510,80,60] — flat palm pressed on the cow's side: contact read by overlap, fingers together | BRAIN_0386_runner_human.jpg [1360,350,120,110] — small mitten hand with a separate thumb, warm skin, no knuckle lines
Unlike witness contrast: clinic grip wraps an edge; farm palm presses flat; runner hand is free — Ines needs all three behaviours

### F14 — Illustrated transformation and alternate state design (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 1c94a6d9413e9c5fbf1c88ecfef3b0306cee2e68ac4fa21ebf18b3322c1676db):
For a changing object define a state table:

| State | Owns new drawing? | Must remain registered? | Additional independent track |
| --- | --- | --- | --- |
| Minor rigid motion | Usually no | whole-object internal features | prop/camera |
| Significant expression/hand/contact | yes, at least affected part and silhouette | identity, attachment points | face, limb, object |
| View/pose silhouette change | yes, complete visible form where needed | canonical identity, scale/contact | body, hand, hair |
| Soft object swelling/spiking | yes, outer contour **and internal art** | narrative object identity | glow, embedded illustration |
| Material-local light change | recolor relevant connected surfaces | world/structure geometry | windows/lamps/atmosphere |
| World transition | two complete coherent world images | intentional framing continuity only | rays/mask/pan |

Avoid scaling one stock object through a state change whose internal art topology visibly changes. Provide a different complete drawing when reference exhibits a new material/contour family.

THIS SUBJECT'S DECISION:
Specific decision: Hand open/grip/pinch, face neutral/curious, profile turn and profile satisfied are each drawn states
Visible construction operation: Each alternate state is a separate source-attached drawing registered to the master
Inputs it depends on: state family
Output art components: six state drawings
Falsified if: A state is produced by scaling/rotating the master instead of a drawing
Source witness regions (STYLE ONLY): MEMORIES_0753_clinic_humans.jpg [1420,400,240,260] — closed-lid arc eyes behind glasses, small smile, bun | MEMORIES_0753_clinic_humans.jpg [460,440,320,320] — three-quarter face turned away: white sclera eye, ear patch, large hair mass cutting the face
Unlike witness contrast: the two clinic faces show two views drawn separately, not rotated

### F15 — Motion ownership, simultaneous choreography, camera (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 59788e1bc9128655dcf12a1f9a641380db475131dfbd5cf93ccda35d786ac6bf):
For every animated region label **exactly one primary owner** and necessary secondary owners: `CAMERA`, `WORLD`, `SUBJECT_RIGID`, `SUBJECT_PART`, `REDRAWN_STATE`, `MATERIAL_LIGHT_STATE`, `TRANSITION_MASK`, `EFFECT`, `SCREEN_UI`. A camera pan must not morph architecture; a moving person must not freeze face/hand states; a lit biological network must not be random moving confetti.

Construct a motion timeline as **simultaneous tracks**, not one actor doing one action while all surroundings sleep. Track front/back occlusion, each grip and foot support, independent prop/object trajectory, foreground motion, background loop and screen-space overlays. Only move what is visually supported; source films contain purposeful stillness as well as dynamic changes.

Use explicit state boundaries and recorded durations from exact source frames *for analogous motion classes*, but do not copy specific source durations as universal pacing law. A 60fps visual witness can expose exact observed transitions; it cannot reveal source authoring layers or music alignment by itself.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/temporal.mjs#compileMotionTracks

### F16 — Transitions as complete illustrations plus masks (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 c442317ed0064111361895d572cacf656c4b43698a8e62c7ac9e74ddf4ba1f13):
**Source families:** Solar hard rays → whiteout → individually drawn angled technology panels; AI scrolling illustrated collage; Solar cosmic streak reframe; Brain Blinds nested POV border; Nuclear material state changes.

Select the transition **by the actual communicative change**:

1. Two complete world plates must already exist for a world change.
2. Define whether the transition uses an illustrated ray field, layered whiteout, clipped moving panels, nested boundary, fast camera streak, or coordinated material change.
3. Manufacture the special illustrated effect components (wedge rays, bright core, irregular nested contours, diagonal masks, border plates, motion-streak structures) as actual assets. Specify which plate is revealed/occluded as the component changes.
4. Keep key original subjects from magically morphing into new unrelated objects unless a real drawing-state transformation is explicitly planned.
5. Audit frame by frame around start, midpoint, and finish; watch for flashes, jump cuts, unregistered geometry and incorrect layer order.

No fixed transition should be added to each scene merely because it appears in one source film.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/transitions.mjs#compileTransition

### F17 — Whole-look and provider-control proof (T, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 95bd3e94f045ddd8c05ab2aed60935444671ab5a1aec98f095b528a399c97790):
**Actual tests:** An original asteroid greenhouse with scientist and robot made from text-only construction instructions produced a plausible illustrative scene but retained extra anime/faux-3D stylistic choices. A text-only pangolin/wetlands scene exhibited even more fine-lined/anime/painted detail. A *second* original pangolin/wetlands job with several unlike source-style witness boards and stronger negative constraints produced materially more source-consistent large fills and cartoon proportions, although character/world precision is still not certified. A separate original harbor provided a second material-family transfer, a real compiled greenhouse ArtJob was executed into pixels, and six guided alternate botanist drawings retained recognizable identity within one sheet but did not demonstrate independent multi-request identity consistency or motion. See TRANSFER_TEST_REPORT.

Therefore:

- **Image-model prompt must explicitly govern shapes, subparts, contact, color-region ownership, lighting and environment**, not merely "draw in Kurzgesagt style."
- **Use broad multi-source visual witnesses** when the provider supports them, with STYLE-ONLY instructions preventing source composition copying. Text alone is not shown to consistently control the source-like appearance.
- **Inspect real pixels**. Do not infer from prompt length that the source shape grammar was obeyed.
- **Measure errors at the whole visual level**, then the high-salience part. Record exact feature and producing operation, not vague vibes.
- If reference-conditioned outputs approach the look but contain copied compositions or unsupported geometry, perform new-subject diversity tests and repair method-level controls before qualification.

EXECUTED BY ENGINE CONSUMER: engine/tools/art_bridge_qa.mjs#runQA

### F18 — Every-frame observation without confusing it with decoding
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 ce7ade0be4e7cf479253ebcd933aa4c24a2ce6965e87d2da359c7f8755f1a1fc):
Each selected interval has an immutable original source identity, exact frame number/PTS and a coverage state: `DECODED`, `TIMELINE_VISUALLY_VIEWED`, `NATIVE_ART_INSPECTED`, `CONSTRUCTION_METHOD_MAPPED`, `GENERATED_OUTPUT_TESTED`. These are separate. A 60-up thumbnail page supports gross motion continuity but cannot certify native-resolution contour, face, layer or shading.

For every high-impact change: load exact adjacent native-resolution frames; compare object identities, geometry, part attachment, material changes and contacts; name any frame where the inferred method is contradicted; revisit other actors/worlds for cross-film support. Compress genuinely repetitive intervals only as *equivalent states with explicit frame-range coverage*, not as fictitious individually inspected art.

The archive does not yet prove `NATIVE_ART_INSPECTED` for all 3,492 frames. Do not write `100% art observed` from a frame-file count.

EXECUTED BY ENGINE CONSUMER: engine/tools/art_bridge_qa.mjs#runQA

### F19 — Production medium and timing are conditional, not a universal vector-only preset (O, I)
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 f6e6e631a604cab35bb0c4585b3c326c0b8e65094026b9607f2b6cfa7c77fa60):
**Primary production account:** [Kurzgesagt's process description](https://kurzgesagt.org/what-we-do?visit=videos) explicitly names vector illustration, pixel-based illustration and infographics in its illustration stage, and a combination of traditional 2D flat animation and 3D elements in animation. It says voiceover informs animation timing and music/sound effects are composed for each film. This is a studio-level production statement, **not** evidence that any particular sampled visual was manufactured by a specific program, plug-in or layer rig.

**For each unfamiliar shot, write a renderer-selection record with one primary and optional secondary route:**

| Visual demand | Construct first | Candidate medium | Output must retain |
| --- | --- | --- | --- |
| Human/animal/prop acting | coherent pose-state drawings, separated articulating parts, contact graph | vector / 2D layered plates | fill boundaries, registered subparts, exact visible face/hand states |
| Buildings, machinery, diagrammatic object | connected structural surface graph and its insets | vector / editable paths / planar 2D | common projection and material-local fill boundaries |
| Dense organic optics or illustrated effect | attached underlying structure, contained light masks | raster-assisted or hybrid 2D, if vector alone cannot express it | crisply owned structural parts below haze and glow |
| Numerically meaningful infographic | explicit value-to-mark mapping, labels, visual grouping | code-native diagram/infographic layer | data correctness, typography legibility, aligned data marks |
| Rotating planet or perspective-changing volumetric system | complete intended view family, silhouettes, material design | 3D-assisted render or 2.5D with designed flat overlays | source-like 2D composited color region logic; no generic photoreal 3D shader |
| Composite transition | complete outgoing/incoming plates, ordered reveal geometry | 2D masks, animated plates, optional 3D camera | exact plate registration, intentional mask order, stable identity |

**Audio-time route:** Segment narration into semantic beats without copying the original films' timing. For each beat supply start/end timecodes in the new project's timebase, the exact visible transformation, active subject/object layer, camera action, and which information must be readable before the next clause. Treat music/sound effects as separately authored synchronization cues when available; do not infer them from mute frame witnesses. Render a contact sheet at transition entry/mid/exit and review actual motion continuity and cue timing.

**Failure:** a system that forces every asset into one SVG recipe, one glow/shadow shader or one keyframe preset because that looks superficially recognizable. **Unknown:** the precise proprietary internal authoring settings for any studied frame.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/art_requests.mjs#routeMedium

### F20 — Route *each beat* to a visual medium; permit nesting
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 4b10022f9694d95a7b261d6807c517144ee9162b85319c0b2916e139cf6e32ba):
**Trigger:** any narration chunk before scene design. Do **not** choose a single rendering preset for the whole film. Derive a `medium_tree` whose nodes are one of these modes:

1. `WORLD`: actors and objects physically coexist in one illustrated perspective, with environment contact, near/far layers and coherent lighting.
2. `MACRO`: materially specific object, organism, cell, tool or surface close-up. The frame is constrained by parent form/anatomy and how it would appear at magnified scale; edge parts may extend beyond screen.
3. `SCHEMATIC`: explanation via relations rather than scene realism. Nodes are diagrams; connections, data positions, labels and reveal order are required.
4. `MAP_OR_SCALE`: region geometry and physical scales with landmarks, anchored labels and ordering; the chosen projection is a scene property.
5. `PORTAL_OR_SCREEN`: a display, window, bubble, mental replay or optical cutout **containing another mode**. Specify the two separate visual coordinate frames and clipping/occlusion.
6. `CINEMATIC_EFFECT`: time-bounded extra rendering state (iris, camera blur, exposure flash, chromatic/perception remapping, speed line). It modifies a parent scene and cannot silently erase its identity topology.
7. `EDITORIAL_OR_AD`: sponsor/end card, physical product, real UI or logo/photo insert; quarantined from default story grammar. Only select if the new script explicitly has a comparable editorial need.

**Procedure:** tokenize narration into physical entities, measured variables, claimed causes, viewer perspective and temporal events. Prefer WORLD when contact/action causes the idea; MACRO for mechanism contained inside a real structure; SCHEMATIC when the source of information is an abstract relation; MAP_OR_SCALE when spatial comparison is central; portal only when the viewer must see one context through another. For a compound beat, nest e.g. WORLD → PORTAL_OR_SCREEN → SCHEMATIC or WORLD → MACRO → CINEMATIC_EFFECT; give each node its own projection, palette roles and masks. Reject decorative switches with no explanatory purpose.

**Check:** delete the onscreen words. The remaining hierarchy must reveal what relates to what; for quantitative claims, turn words back on and verify each label points to a specific element. Evidence: unlike modes within `AI@0–199`, `MEMORIES@62–75`, `NUCLEAR@200–299`, `SOLAR@100–199`; sponsor partitions in `FULL_FILM_EVIDENCE.md`.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/source_method_causality.mjs#routeBeatMedia

### F30 — Create a multi-state character library before physical animation
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 54de390cba43d0c2b30a2ddf158ee43764524827d6a3e7b09a3b4d769fcf0090):
**Trigger:** human, animal, creature, mascot or machine that moves, emotes, turns, grips or contacts objects. `BRAIN@205–275,300–390 A`, `MEMORIES@640–675 A`, `AI@842–845 N` show real view/pose changes; earlier detailed F05–F07 remain primary.

**Procedure:** create a canonical model record `identity_id` with unique feature geometry (relative head/torso shape, body partition, facial landmark coordinates, appendage count, costume material regions). Draft view state keys `front`, `3quarter_L`, `profile_L`, `back_3quarter`, then required action states `stand`, `reach`, `grip`, `crouch`, `turn`, `extreme_expression`. For each key, **redraw or reproject the visible silhouette and all occluded planes**, not merely shift pupils. Eyes need view-aware white/iris/pupil masking; hands need actual thumb/finger object wrap; feet/limbs need support-plane contact; cloth seams follow body. Define rigid transforms only for truly rigid art; a turn changes what is revealed/hidden and requires alternative drawings.

**Check:** shuffle poses; all must look like one character when viewed alone. Draw four neutral matching silhouettes with color off and ensure distinctive anatomy survives. An illustrated six-pose sheet is **not an animated shot**; confirm real temporal coherence separately.

THIS SUBJECT'S DECISION:
Specific decision: Library = neutral, hand_open, hand_pinch, curious, profile_turn, profile_satisfied; all share head-top/chin/pelvis anchors
Visible construction operation: Produce the library as registered edits of the approved master before any motion is keyed
Inputs it depends on: F67 registration
Output art components: state library sheet
Falsified if: A state needed by the action graph is missing from the library
Source witness regions (STYLE ONLY): MEMORIES_0753_clinic_humans.jpg [1420,400,240,260] — closed-lid arc eyes behind glasses, small smile, bun | BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch
Unlike witness contrast: a calm and an alarmed face from two films prove states are designed, not implied

### F31 — Motion needs *owner-specific* key states, not global ease-only language
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 d63450aed86550514a34c9ee5acf55a1d4c63c4dbdddd10c062015e13fcf1ac5):
**Trigger:** action, simultaneous animation, character movement, camera, changing diagrams, optical transition. This rule does not invent measured proprietary keyframes.

1. Build scene DAG of time events: `narrative_beat` → `actor action / instrument state / camera / labels / effect` dependencies. Each changing object has its own `state_id`, parent transform, anchor points, visibility and hold range.
2. Mark **contacts** as hard constraints in each key state: grasp point adheres to prop; planted foot to ground; pendulum to pivot; particle path to emitter/receiver; labels to chart. Use forward kinematics only where appropriate. Hand/prop contact cannot be treated as two independent easing curves with drift.
3. For deforming objects, make distinct hand-drawn silhouettes at structural extremes (anticipate/contact/recover or approach/impact/depart). Interpolate only in intervals where topology/view remains valid. If view occlusion flips, switch art or create replacement with cross-layer masks.
4. Split time into foreground action, diagram reveal, camera and accent effects; protect required narration readability with holds. Motion smear/trail is a **secondary layer** derived from actual pose path, never a substitute for drawing inbetween states.
5. Review slow/normal speed and every contact/reveal boundary. Use at least 6–12 fps proof frames for a *test* where 60 fps final is planned; the frame-rate figure is a test sampling policy, **not** an observed source frame production rate.

**Check:** sample at least first/contact/peak/end, plus a subsecond strip across every occlusion swap. Observe whether motion conveys correct mechanism with narration muted. Mark unverified 60-fps easing as open until truly observed at full-rate.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/temporal.mjs#compileMotionTracks

### F33 — Density and abstraction are scoped by *view depth and task*, not adjective
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 412b4d9ae301220bfd489be7d169bf87ffd7437cae30ef460fbb98f958851766):
**Trigger:** every scene after medium routing. Cross-film contradiction: `AI@35–36 A` has dense repeating oblique city blocks, `AI@105–133 A` has a nearly empty classification plinth, `MEMORIES@62–69 A` uses thousands of microcomponents, `BRAIN@1.6 N` has many readable POV objects.

Assign each planned layer a `detail_owner`:

- `focal_structural`: enough discrete parts to explain the target (anatomy, controls, contacts). Use macro inset when necessary.
- `focal_expression`: larger unoccluded facial/gesture masses, fewer secondary marks around eye/mouth/hands.
- `midground_repetition`: identifiable class silhouettes with internal variation in grouping/scale; no high-contrast detail competing with focal actor.
- `far_environment`: connected broad silhouettes, atmospheric/value separation; intentionally fewer features per object.
- `scientific_population`: legitimately massive count/texture under a hierarchy of small-unit, cluster, and active path scales, as F24.

Allocate rendering budget by function: increase a part count only where it conveys mechanism, texture/biological structure, material or scale; decrease to preserve action/diagram read. Do not enforce universal 70/20/10, one stroke width, one highlight count, one corner radius, or one palette. At thumbnail size, inspect structural priorities; at full size, inspect attachment and edge consistency. All small marks must belong to a named surface, population field, or effect.

THIS SUBJECT'S DECISION:
Specific decision: focal_expression for the face; focal_structural for the near hand; garments are support masses with one plane each
Visible construction operation: Spend interior marks only on face and near hand; jacket and trousers keep one side plane and the cuff band
Inputs it depends on: projected head ~1/6 figure height
Output art components: detail-owner map
Falsified if: The trousers or jacket carry more marks than the hand
Source witness regions (STYLE ONLY): NUCLEAR_0083_farm_humans.jpg [1040,260,360,620] — kneeling farmer: weight on one knee, torso leaning into the contact, rolled sleeve cuff | BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses
Unlike witness contrast: farmer at mid distance has few marks; the close runner has more on the face only

### F35 — Make storyboard *transitions* carry one conserved visual invariant
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 8aed13f9c5401c3d7a58bcfcaf8a2246b3012b540067767ca248467466300f8b):
**Trigger:** move between explanatory modes on unfamiliar narration, e.g. person → brain process → planetary comparison; never borrow the reference films' sequence.

**Before drawing:** choose a conserved identity/relationship that survives cut: same subject silhouette, a causal moving node, a spatial direction, a color-role association, a lens outline, or a numeric scale marker. Then choose one transition operation:

- `match_move`: the tracked anchor maintains screen trajectory while world/diagram behind it changes.
- `mask_reveal`: bounded lens/screen/domain mask opens/closes to reveal a complete successor composition.
- `part_to_whole`: a local structural detail moves/zooms into a correctly reprojected parent system; crosscut or redraw when perspective changes.
- `registered_world_relight`: same layout changes environment state as F22.
- `causal_graph_expand`: one highlighted node/path seeds new connected graph reveal.
- `exposure_or_impulse`: sudden full-field effect masks a justified large state jump, then successor art appears.

**Deliverable** for each: transition start/end complete stills, invariant anchor coordinates, layer visibility/mask state, camera path, hold frame/time; if footage source is only 1 Hz, never claim exact source easing. Test by pausing one frame before/after: both pictures must be complete and the invariant recognizable.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/transitions.mjs#compileTransition

### F36 — Source-to-new-script skill must compile into enforceable artifacts
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 117eb342110c7d129a174876f581d1a9fb9c1c1ff525684bd732243c469325ea):
**Trigger:** every new independent script, particularly when delegated to Claude Code or another model.

**Produce this machine-readable contract per shot:**

```yaml
beat_id: B07
story_truth: "The novel relationship conveyed by this scene"
status: METHOD_CANDIDATE
medium_tree: [WORLD, PORTAL_OR_SCREEN, SCHEMATIC]
source_methods: [F01, F13, F20, F21, F27, F31]
source_witnesses: ["MEMORIES@464–466", "AI@250–252"]
unlike_counterexample: "NUCLEAR@384–390: world relight, no portal"
subjects:
  - id: novel_subject_A
    purpose: "What this actor explains"
    silhouette_master: "Complete original contour requirements"
    topology: ["parent_part -> child_part", "hand -> handled_prop"]
    material_regions: ["main_fill", "local_shadow", "optic_mask"]
    required_views: ["front", "3quarter", "contact"]
world:
  projection: "camera/ground/screen coordinate frames"
  layout_anchors: ["horizon", "floor_contact", "screen_aperture"]
  layers_back_to_front: ["sky", "far_world", "device_back", "inner_scene", "device_front", "actor"]
change_states:
  - {name: before, time_s: 0.0, mask_state: closed}
  - {name: reveal, time_s: 1.2, mask_state: opening}
  - {name: hold, time_s: 2.0, mask_state: open}
validation:
  - "No source character, creature, composition or story copied"
  - "All mask ownerships and contacts resolve"
  - "Every new source-style choice can be pointed to on rendered pixels"
  - "Actual generated/renderer payload stored for audit"
unverified: ["source exact easing", "independent motion fidelity"]
```

If an input script never calls for portals, **omit F21**. If it never calls for scientific schematics, **omit F27**. A universal prompt that dumps every method into every shot will overdesign and produce visually incoherent results. Run the existing deterministic `scripts/compile_art_job.py` for structural ArtJobs; if its schema cannot express `medium_tree` or a timed mask, add a corresponding explicit postcompiler motion plan rather than pretending it understood it. The job is a specification, not proof that a generative renderer obeyed it.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/art_contract.mjs#preGenerationGate

### F51 — Palette is a system of roles and region ownership, not one studio-wide swatch set
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 05332ba66e09a01c5cee1bc7646eab5ca5918e46d7128c72c772c3bf110f964c):
Eight contrary original-HD frames expose the palette failure in first-pass painterly results. The approximate top colors below are **per-frame 14-color quantization measurements**, not color-code targets for new scripts; JPEG, quantization and framing affect them. See `SOURCE_CONDITIONAL_DOMINANT_COLOR_REGIONS.json` when included with the research extension.

| Unlike source construction | Approximate area dominance observed in one native frame | What it disproves |
| --- | --- | --- |
| `BRAIN_0157_couch_human.jpg` | pale lemon #fcf268 30.5%; warm amber #f4a51e 27.2%; sea-green #10d6a1 19.6% | A brand-standard dark violet background |
| `MEMORIES_0753_clinic_humans.jpg` | cyan #3ccffc 36.6%; light cyan #46e4fb 25.3%; blue #42b1fc 8.6%; deep purple hair #5e0169 7.0% | All characters require warm photographic skin/background light |
| `AI_0234_rear_operator.jpg` | dark teal #0b5e71 30.2%; deep navy #1e1454 14.7%; dark maroon hair #3d0001 10.0% | All machine scenes must glow neon or share bright-blue stage |
| `AI_0444_light_data_theatre.jpg` | almost-white #e6fefd 56.0%; pale aqua #a5fbfa 32.1%; turquoise #5ff7f2 9.3% | Information worlds must be dark, purple, and high contrast everywhere |
| `AI_0035_oblique_city.jpg` | peach/orange #efa163 48.2%; several saturated blue/violet architectural regions each 4–6% | Dense built environments need atmospheric photographic shading |
| `MEMORIES_0062_biological_density.jpg` | near-black violet #120221 56.6%; dark violet #2b0c56 20.1%; deep purple #4b1a6f 5.9% | All educational worlds should use bright continuous backgrounds |
| `AI_0874_axial_corridor.jpg` | very dark blue #000423 43.8%; midnight blue #041556 42.9%; lighter blue #1e5c99 5.6% | Every dark scene needs added small bright details to look 'rich' |
| `NUCLEAR_0296_coastal_field.jpg` | cyan #53e1eb 25.9%; region-owned greens #2ec343/#0e7944/#0e994b 38.2% combined | All landscapes use painterly vegetation color mixing |

### Construction procedure

1. Write a `color_role_map` for the **new** frame: `substrate`, `far support`, `mid support`, `focal subject`, `causal-active state`, `local material inset`, `optional optic light`. The roles are not fixed colors; choose original role-appropriate hues based on the new subject and its scene family.
2. Give every major object one **contiguous parent-owned base fill** and a finite list of separately contoured material regions: e.g. visible front face, side face, underside, inset, rim, or attached organic lobe. Do not describe the object merely as bright/vibrant/colorful.
3. Choose the **visual contrast relationship**, not a universal saturation. Make the viewer's first target more discriminable from immediate surroundings by hue/luma/saturation *as appropriate to that frame*. Quiet supports can be high-luminance aqua (`AI@444`) or almost-black blue (`AI@874`); never apply one global background preset.
4. Constrain gradients, rim light and reflections to an actual material owner, viewing normal, enclosure or optical event. `AI@234` has a localized dark room falloff; its existence does not license a generic cinema-light shader on a human face in a clinic frame.
5. For multi-shot assets, record a palette role **identity**, not forcibly identical absolute RGB. When the viewpoint enters a new world, document which subjects keep their material identities and which background-role palette changes legitimately serve the new concept.

THIS SUBJECT'S DECISION:
Specific decision: Four role colours owned by regions; each role has one lighter and one darker plane at most
Visible construction operation: Paint only these roles; any new colour must name its owner
Inputs it depends on: F03 roles
Output art components: palette table
Falsified if: A colour appears that no region owns
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1360,340,540,360] — purple bench: flat fill plus one darker side plane; light comes from flat colour planes | MEMORIES_0753_clinic_humans.jpg [0,0,1920,700] — monochrome blue room: background planes in one hue family at lower contrast than the actors
Unlike witness contrast: warm park field vs cool clinic room: roles, not a fixed swatch set

### F52 — Scale and semantic role determine the number of facial/structural marks
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 60dafcb332c3cb6fd8961daa59d3503df2724b2bcd783ae54ad766584f611dcd):
Use at least one original-scale character anchor and one unlike view. `MEMORIES@753` uses oversized face and hair *as two or more contiguous illustrated masses* with bounded ear/cheek, glasses/eyes, lids, brows and mouth shapes. `AI@234` has a large **rear** head silhouette with zero invented frontal face features. `BRAIN@157` contains a face assembled from discrete colored parts rather than fine hair strands or film-textured cloth. At other moments `BRAIN` devotes a close frame to extremely detailed **biological iris/eye imagery**—that diagram is not a counterargument for adding photoreal iris reflections to a small acting person.

1. Classify each eye/hand/hair structure by **its narrative screen role**: `ACTING_CUE`, `BIOLOGICAL_SUBJECT`, `SILHOUETTE_IDENTITY`, `MICRO_SYMBOL`, or `SUPPORTING_BACKGROUND`.
2. Draw `ACTING_CUE` eyes as visible bounded sclera/iris/pupil/lid/brow parent regions with the smallest number of marks needed for gaze/expression, matching the intended crop. An eye **as the scientific subject** may have many nested explanatory parts. No universal eye detail count is transferable between these roles.
3. For `SILHOUETTE_IDENTITY`, design the outer hairstyle/hat/ear contour and attached color lobes **before** internal strokes. For a rear view, suppress hidden front-facing features. Avoid individual film-real hair-strand lighting unless the new script explicitly examines strands as the subject.
4. Measure focal dimensions in final output pixels. If an eye or hand will occupy only a few output pixels in a wide shot, collapse its interior to a purposeful contour/color landmark. If it is a focal acting close-up, give the actual named regions enough dimensions to remain discernible; do not solve illegibility with texture.
5. Build `ACTING_CUE` alternate states by changing actual brow/lid/mouth/shoulder/hand topology, preserving original identity contours. A rotating disconnected arm is not an acting state. All side/near-far contacts must be explicit.

THIS SUBJECT'S DECISION:
Specific decision: Two eye openings with pupils, two brows, nose wedge, mouth line, one cheek patch; no lashes, no lip detail
Visible construction operation: Place only these marks on the face; hand marks = thumb separation only
Inputs it depends on: projected head size
Output art components: mark budget
Falsified if: Lashes, nostrils or knuckle lines appear
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch | NUCLEAR_0083_farm_humans.jpg [1540,260,140,140] — mid-distance face: dark-mark eyes, moustache mass, no sclera
Unlike witness contrast: close runner face carries white sclera; the mid-distance farm face drops it

### F53 — Density is caused by explanatory material, not by a desire to impress
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 cdc607991786a835d2caeb616a4e94bc1bd5b657a29aca53fcd2ca397d7f82a7):
`AI@35` is a high-density city: most repeated windows live inside individually projected building faces. `MEMORIES@62` is an even denser biological field: colorful small terminals are **attached to a branching stalk network** with distinct regions. `AI@444` presents many screen panes but a low-contrast, pale supporting environment with a dark focal organism. `AI@874` consists mainly of huge dark structural surfaces with a few local light sources. `BRAIN@157` uses broad flat lemon-orange room planes around the acting subject. These are different drawable mechanisms, not a contradiction to average away.

**First-pass density assignment:**

- Set a `viewer_first_point`, one `causal_path`, and a `second_read_destination` **before** detailing. Draw the large regions that establish these first; supporting spaces must preserve the contrast budget necessary to follow the path.
- `T1` (major explanatory body): complete functional topology and visible supports. Always create it.
- `T2` (necessary owned subparts): sockets, eyes, joints, branch terminals, windows, material planes when they explain the mechanism or species. Construct **inside named T1 parent surfaces**.
- `T3` (surface-repeat detail): generate only for a material whose visual grammar needs it, with explicit local count, scale decay and parent mask. A decorative mark lacking a parent or semantic role is removed, not compensated by more decoration elsewhere.
- Assign **per-region rather than whole-frame** density: a dense city may occupy one part of a scene and an empty sky another; a near-empty information theatre can contain repeated pane glyphs that deliberately sit below the focal contrast.
- If a master would mostly move as one massive painting, reduce the independently irrelevant T3 decoration, then author actual separate `T1/T2` moving states, masks and clean plates. A still filled with detail does not become an explanatory film merely through a zoom.

THIS SUBJECT'S DECISION:
Specific decision: Density only where the action explains itself: the near hand and the face reading the machine
Visible construction operation: Keep the torso and legs quiet so the hand and the glance carry the explanation
Inputs it depends on: story beat: she loads the machine and watches
Output art components: quiet support masses
Falsified if: Pattern or texture appears on the jacket
Source witness regions (STYLE ONLY): MEMORIES_0753_clinic_humans.jpg [1240,340,560,740] — seated figure: garment masses, collar, crossed legs, chair support | NUCLEAR_0083_farm_humans.jpg [1040,260,360,620] — kneeling farmer: weight on one knee, torso leaning into the contact, rolled sleeve cuff
Unlike witness contrast: the clinic sweater and farm shirt are plain; the action points carry the detail

### F56 — Execute source-grounded prompts as geometry, then inspect first pixels
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 611eb168e72f42a10bd72fa3ba45a25e6d0b8ee1e935d76a8982ed3b69c143f4):
The new `first_pass_control.version=2` job must include concrete `subject_specs`, the assigned `color_role_map` and family-based `character_design` where needed; actual image-provider attachments must include unlike source-only native frames. Put the canonical **shape and meaning** instructions ahead of decorative style adjectives. For a human close acting shot, first construct and approve the canonical actor before allowing a detailed background to contaminate the model’s character prior. For a world without actors, still specify substrate, bounded depth masks, role-owned material graph and T3 budget.

The first output is evaluated separately from repairs. A failure such as photoreal/painterly anatomy, global bevel shading, extra props, wrong scene crop, detached branch terminals, no real relation graph, or dense unanimated background should trigger a **specific upstream rule repair** and another original unfamiliar script test. Never convert a one-off object correction into a universal source-style law.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/repair_memory.mjs#selectRules

### F57 — Start with a visible causal proof, not a “beautiful scene”
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 e3934727bb801d39198d27edf6c9bae2ba52048be37b6ccf155b503ee0374533):
**Build:** (1) Write the factual statement the *silent* viewer must infer; (2) name the observable `BEFORE`, the one changed physical/link state in `CAUSE`, and the visible `AFTER`; (3) make `source_anchor` and `target_anchor` actual points on physically drawn contours, e.g. a valve port, visible stream tip, tank surface, not words like “growth”; (4) choose `proof_projection` from `face_contact`, `object_process`, `wide_distribution`, `diagram_relation`, `embedded_screen`, `macro_internal`, `world_scale`; (5) reserve primary bbox and one continuation point **before** drawing scenery. Every mark in the eventual frame must be either a physical support, an active path, a causal reaction, or an editorial sign attached to these. If no causal endpoint is visible, repair framing and art—not textures. **Forbidden model prior:** decorative visual metaphor that merely looks science-related.

**Deliver:** `silent_inference`, `before/cause/after`, `proof_projection`, screen-normalized source/target contour points, primary/secondary bbox, supporting masks and `what_can_be_removed`. **Test:** cover all text and pause on the keyframe; the mechanism should still be distinguishable from an unrelated action.

THIS SUBJECT'S DECISION:
Specific decision: The near hand must be able to touch the handle and the coin slot visibly; the face must be able to look at the drum
Visible construction operation: Keep hand and face unoccluded in the canonical view so the later contact and gaze states read
Inputs it depends on: S02 action graph
Output art components: unoccluded hand and face
Falsified if: In the canonical pose the hand or face is hidden by another mass
Source witness regions (STYLE ONLY): NUCLEAR_0083_farm_humans.jpg [1380,510,80,60] — flat palm pressed on the cow's side: contact read by overlap, fingers together | MEMORIES_0753_clinic_humans.jpg [1400,720,160,120] — hand holding the clipboard: fingers in front of the edge, thumb behind
Unlike witness contrast: both witnesses show the contact point unoccluded

### F58 — Construct the silhouette before interior polish
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 561ff30920ead79996964bdec12c2dc4b922500925c116f8b42bf806401bd826):
**Build:** Establish a set of closed parent regions: `outer_subject`, `front_mass`, `back_mass`, `cutout_voids`, `support/feet_or_mount`, each with a physical reason. Define their outline as control points/curves and attach child parts at named local coordinates. Preserve the screen-space identity-bearing negative spaces: limb gaps, handle loop, wing/arm junctions, visor hole, plant fork. Detail may not alter the outer silhouette unless it is a specific state change. For distant repetition, derive small forms from the master silhouette and deliberately collapse interior marks; do not simply shrink a fully detailed portrait. **Forbidden:** bloated soft painterly contours with no known connecting anatomy.

**Deliver:** parent silhouette masks, closed holes, view direction, local anchor coordinates, `small_size_read` (simulate reduction to actual rendered screen bbox). **Falsifier:** subject's function/species disappears when filled with one color or resized to intended scale.

THIS SUBJECT'S DECISION:
Specific decision: Silhouette first: flat-fill test at one-tenth size before any interior mark
Visible construction operation: Deliver the flat-filled silhouette test with the master
Inputs it depends on: F01
Output art components: silhouette test image
Falsified if: The silhouette test fails while interior detail exists
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses | MEMORIES_0753_clinic_humans.jpg [1240,340,560,740] — seated figure: garment masses, collar, crossed legs, chair support
Unlike witness contrast: both figures read as flat silhouettes

### F59 — Parts must join and occlude in a deliberate topology
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 fc942d1b772bd50eae7201881e7f6cadc0f8803ec028937e207dfd49d8bc6701):
**Build:** Create a directed graph `id → parent_id, local_origin, joint_type, insertion_depth, in_front_of, hidden_when, material_id`. Each joint gets an actual overlap/cut mask. Show one side of the joint entering its parent to avoid a sticker appearance. For a hand holding a prop, draw the near fingers in front, prop midplane, far fingers behind; shadows/contact highlights are owned by prop/hand, never added globally. For a biological terminal, the stalk reaches a named terminal border; for architecture, a window only lives on the wall-face polygon. **Forbidden:** disconnected parts “appearing close enough” or ambiguous depth order delegated to a renderer.

**Deliver:** part DAG, topological overlap matrix, contact anchor positions, hidden-part clean underpaint, `which_part_moves_when_parent_moves`. **Falsifier:** translate/rotate one moving parent and discover any unowned floating mark or impossible overlap.

THIS SUBJECT'S DECISION:
Specific decision: Sleeve top under the shoulder line; cuff over the wrist; far arm behind the jacket; trousers under the hem
Visible construction operation: Paint the joins as overlaps so cut parts carry hidden surface under each overlap
Inputs it depends on: registered parts plan
Output art components: overlap map; hidden surfaces for underpaint
Falsified if: A join is a hard seam with no overlap
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses | NUCLEAR_0083_farm_humans.jpg [1040,260,360,620] — kneeling farmer: weight on one knee, torso leaning into the contact, rolled sleeve cuff
Unlike witness contrast: runner sleeve over torso and farmer cuff over wrist are overlaps

### F61 — Invent conditional palette **roles**, never imitate a universal swatch palette
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 7538ee3efebff29d033aed810a0639f1b54413ed0a1e71c2fc1cff34474ff9ab):
**Build:** Define palette slots `primary_substrate`, `secondary_support`, `main_subject`, `active_delta`, `material_dark_plane`, `material_light_plane`, `optional_emission`. Assign each slot original RGB/hex **only after** specifying its silhouette owners and local neighbors. For every adjacent important region, record whether discrimination depends primarily on **luminance**, **hue**, or **edge outline**; do not turn the entire scene equally saturated. Use source witness pairs to choose *relationships* (e.g., saturated solid subject on quiet pale field) not sampled copy colors. Preserve repeated actor identity across scenes unless a deliberately recorded lighting/environment state overrides it. **Forbidden:** fixed brand palette, global gradient/cinema grade that consumes local flat planes, same purple shadows on every material.

**Deliver:** new-image swatches by role and physical owner, contrast pair graph, exceptional illumination map, first/second-read hierarchy. **Test:** render in grayscale and in a reduced 160×90 thumbnail; if cause/target merges with surrounding support, modify their local contrast before adding accents.

THIS SUBJECT'S DECISION:
Specific decision: identity mustard / support teal / focal warm skin / accent plum
Visible construction operation: Role colours are invented for Ines; no witness swatch is sampled
Inputs it depends on: F03
Output art components: role swatches
Falsified if: A witness colour is reused as Ines's identity colour
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [800,520,560,300] — navy trousers as two flared masses with a darker inner plane, no outline | NUCLEAR_0083_farm_humans.jpg [1040,560,240,280] — jeans: one mass with a darker side plane, folded at the knee
Unlike witness contrast: both use navy/blue trousers — Ines deliberately uses teal to stay original

### F62 — Edges and shadows have owners; universal black outlines and bevels do not
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 6655b1f047461fe4321153f571895868e7b9bae17f64f729280b30954115f724):
**Build:** For each parent surface mark edges as `COLOR_ADJACENCY`, `MATERIAL_SEAM`, `CAST_SHADOW`, `INTERNAL_CREASE`, `OPTICAL_RIM`, `EMISSIVE_EDGE`. Draw seam contours on the object that actually contains them. Place a cast shadow on a named **receiving support**, projected from the actual actor/plane; make its shape an object-shadow relationship. Choose light/dark patch geometry by local surface turning/occlusion; not an automatic Photoshop bevel around every visible contour. For dark outline, specify only those edges requiring separation from the neighboring region. **Forbidden:** every region with equal dark stroke, every shape with same drop shadow, identical bright rim on human and machine.

**Deliver:** edge-role table by owner, shadow receiver id and patch mask, allowed glow/softness exceptions. **Falsifier:** remove black outlines globally; if the subject only survives because of arbitrary outlines rather than material/color region design, rebuild the parent planes.

THIS SUBJECT'S DECISION:
Specific decision: Edges owned by colour boundaries; shadows owned by the far-side garment planes; the ground shadow belongs to the world, not the cutout
Visible construction operation: Paint no cast shadow inside the cutout; far-side planes only
Inputs it depends on: F04
Output art components: edge/shadow owners
Falsified if: A crescent shadow is painted on every part
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [900,860,420,90] — soft pink ground shadow ellipse owned by the ground plane, not by the figure | BRAIN_0386_runner_human.jpg [1360,340,540,360] — purple bench: flat fill plus one darker side plane; light comes from flat colour planes
Unlike witness contrast: the runner's ground shadow is a world shape; the bench owns its own darker plane

### F64 — Human/mascot/animal identity must be routed by *illustration family*
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 7630a41387f2d9739a27c39b7ed62aefaa284096f29e3271d869c98fa9745dac):
**Build:** Before any generator prompt choose `ACTING_FACE`, `GESTURE_FULL_BODY`, `REAR_OR_OCCLUDED`, `DISTANT_POPULATION`, `ORGANISM_MACRO`, `MASCOT_SYMBOLIC`, or `SPECIALIZED_GEAR`. For the chosen family supply a `canonical_identity` with named head outer contour, hair/horns/helmet silhouette, ear/cheek/nose regions, eyes actually visible from that view, neck/torso garment, far/near arms, hands, legs, feet and distinguishing color patches. For small actors, suppress inner eye/fabric detail but preserve characteristic head cap, posture and contrasting body segments. For mascot, build the species/symbol's own silhouette/limb system; do not paste an inherited “cute bird” or universal emoji. For animals/insects, new original species anatomy requires new source-independent correctness research and connected appendages; style witnesses prove color/shape grammar, not the anatomy of an unrelated species. **Forbidden:** painterly novel cover, anime realism, facial pores or hyper-detailed hair curls on a tiny explanatory actor.

**Deliver:** matching `CHARACTER_FAMILY_CONSTRUCTOR.md` A–E contract; original identity card + front/side/rear/potential occlusion only when actually needed. **Falsifier:** visually derived state loses recognizable hair/helmet/feature layout or detached hands, even though it resembles the first image by color.

THIS SUBJECT'S DECISION:
Specific decision: GESTURE_FULL_BODY: full body, hands and posture carry the acting
Visible construction operation: Construct the canonical identity parts listed in canonical_identity for the full figure
Inputs it depends on: F01; F05; F06
Output art components: canonical identity parts
Falsified if: A close acting-face construction is used for a full-figure actor
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses | MEMORIES_0753_clinic_humans.jpg [460,440,320,320] — three-quarter face turned away: white sclera eye, ear patch, large hair mass cutting the face
Unlike witness contrast: full-body runner vs close turned face — Ines is full-body

### F65 — Eye and mouth construction depends on the **role** and crop
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 b61caf59d2c2faed1ba4d8de4122f16cb0603693eefb7b55db8693fdb5fb6c78):
**Build:** Select `face_eye_mode` *after the final projected head size and emotional function are known*: `ANATOMICAL_SUBJECT` = nested sclera/iris/pupil/cornea and optical highlights because the eye **is** the demonstrated object (`BRAIN@51`); `WHITE_SCLERA_ACTOR` = bounded scleral plane plus pupil and lid when close-up direction requires tracked gaze (`BRAIN@274` class); `DARK_MARK_ACTOR` = one dark dot/wedge with an adjacent lid/brow relationship **without** white sclera (`NUCLEAR@145`); `CLOSED_LID_ARC` = continuous bent line or closed colored lid patch, no visible globe (`BRAIN@334`); `REDUCED_ICON` = one/two contrast marks only when the final projected head cannot resolve a scleral hierarchy; `HIDDEN_REAR` = no face marks, preserve distinct hair/head outer contour (`AI@285`). Never switch modes simply to make a character prettier. For all *visible* modes anchor features to named local face coordinates: skull oval, median line, paired eye-line, nose/cheek wedge and brows; clip white, iris and mouth to their parents. Determine feature count from the **final on-screen pixel footprint**, not the generation resolution. The scleral fill is **optional** even for mid-size actors. Expression is a linked action unit with ordered `brow_tilt`, `lid_arc`, `gaze_offset`, `cheek_shape` and `mouth_topology` (`closed`, `small_open`, `wide_open`, `smile`, `frown`). Draw each mouth using actual open/closed contours and occlusion, not a scaled oval. Gaze and brow orientation must rotate with the face coordinate frame, and the original hairline/ear/face contour must remain registered across expression states.

**Deliver:** declared `face_eye_mode` with cross-reference witness and reason, local face coordinate system, final projected head bbox in pixels, parent masks for lid/brow/mouth, canonical expression sheets showing actual topology. **Test:** each pose must read when seen at the final actor screen size and inside the real background contrast; erase white sclera from a `DARK_MARK_ACTOR` and confirm that the expression still reads from eyebrow/eye marks rather than relying on portrait shading.

THIS SUBJECT'S DECISION:
Specific decision: WHITE_SCLERA_ACTOR: projected head is large enough and the curious glance must read; mouth = line / small oval / upturned line
Visible construction operation: Draw white almond openings with dark pupils; the far eye narrowed by the nose wedge
Inputs it depends on: projected head size; gaze beat
Output art components: eye construction; mouth states
Falsified if: Dark-mark eyes are used at the large head size where the glance must read
Source witness regions (STYLE ONLY): BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch | NUCLEAR_0083_farm_humans.jpg [1540,260,140,140] — mid-distance face: dark-mark eyes, moustache mass, no sclera
Unlike witness contrast: runner (close) uses sclera; farmer (mid) uses dark marks

### F66 — Body acting needs weight, garment volumes and contact states
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 d494e65f4c05dc81def9f969dd56d75b08a6677eb939ae109212535ba7dcdc79):
**Build:** Declare pelvis center, shoulder axis, both near/far feet ground contacts (or seated contact), one weight-support foot per state, and target for each interacting hand. Arms have parent segments whose connection seam hides under sleeve/hand shapes; mitten hands may suffice unless the grasp itself is the proof. Outfit draws as large filled garment contours with attached collar, cuffs, hem and only readable seam marks. For special gear define actual hard-shell regions that overlap flexible costume. Distinct camera views need distinct approved drawings or proven consistent rig geometry, **not** rotation of a hand cutout that was never authored in that perspective. **Forbidden:** limb “relationship” implemented as disconnected little PNGs orbiting a static torso.

**Deliver:** body pose graph, feet/contact/shadow locations, far/near limb overlap, full alternate drawings for unsupported topology changes. **Test:** silhouettes of adjacent poses must preserve joint connectivity and weight, not merely tween detached circles.

THIS SUBJECT'S DECISION:
Specific decision: Weight on the far foot, pelvis level, shoulder axis tilted toward the reach; garments are two volumes
Visible construction operation: Draw the canonical pose with the support visible; grip and pinch poses keep the far foot planted
Inputs it depends on: contacts; F06
Output art components: support pose; garment volumes
Falsified if: The planted foot moves or the torso stays upright during the reach
Source witness regions (STYLE ONLY): NUCLEAR_0083_farm_humans.jpg [1040,260,360,620] — kneeling farmer: weight on one knee, torso leaning into the contact, rolled sleeve cuff | BRAIN_0386_runner_human.jpg [740,140,740,700] — running woman: one continuous silhouette — tilted torso, free hands, two tapering trouser masses
Unlike witness contrast: kneeling contact vs running stride: different supports, both explicit

### F67 — Expression and pose animation is a *registered state family*
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 e736f95e1510466090a07882ab67c5b26a3838390fa32beba2e6ad9eccc2d647):
**Build:** Author a canonical character coordinate space and register head/neck/shoulder/wrist/hip/foot landmarks. List `state_0`, `anticipation`, `contact`, `peak`, `recovery`, `hold` as applicable, each with a full approved pose or proved rigidly movable segments and true-alpha clean underpaint. Use a change in **visible contact and facial geometry** to mark acting, not only x-position. Set keyframe times from desired audience inference; plan slow reading holds when needed. Interpolate between homologous shapes **only if topology and visible part inventory match**; else draw in-between cels, conceal using an authored occlusion, or cut honestly. Do not promise procedural warp quality from still images alone.

**Deliver:** state atlas and landmark-distance QA, occlusion order at each contact, alpha gap check, 60fps compositor score. **Falsifier:** a joint detaches, arm crosses the wrong side of torso, eyes slide off face, or a pose pops at the transition frame.

THIS SUBJECT'S DECISION:
Specific decision: Six states registered at head_top, chin and pelvis
Visible construction operation: Every state edit keeps the three anchors on the master's measured positions
Inputs it depends on: F30 library
Output art components: registered state family
Falsified if: A state swap moves the head top, chin or pelvis
Source witness regions (STYLE ONLY): MEMORIES_0753_clinic_humans.jpg [1420,400,240,260] — closed-lid arc eyes behind glasses, small smile, bun | BRAIN_0386_runner_human.jpg [1200,140,200,250] — head: rounded skull, dark hair bun, white-sclera eyes with dark pupils, open mouth, cheek patch
Unlike witness contrast: both heads keep skull/chin positions while features change

### F77 — Information density must be allocated *locally* and to motion owners
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 a6785fdb7b454048106dc6f5ee2c98f2153149f37813c3889e7eab9e5b6dd261):
**Build:** Split image into regions `MAIN_PROOF`, `SUPPORT`, `QUIET`, `OPTICAL_EXCEPTION`, `TRANSITION_COVER`. Give each explicit T1 essential body, T2 owned functional subparts and T3 optional repeat budget. For an asset intended to move, every part that will visibly change shape, position or depth must have a separate clean underpaint/true-alpha state or be entirely inside its parent moving plate. A large decorative static T3 world is acceptable only if it is deliberately a **held support**, not if the director needs meaningful transformations through it. **Forbidden:** tiny high-frequency details competing with a 40-pixel causal actor or a still picture pretending to be interactive merely through camera drift.

**Deliver:** region map, owner graph, active/held status and explicit removable repeat families. **Test:** play with all supporting T3 hidden; explanation must survive and the intended moving element must be conspicuous.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/source_method_causality.mjs#allocateDetail

### F78 — Camera and representational transitions must obey a correspondence invariant
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 1660056b04278cdaedd8234764df4784a73411c29cb7605cb0358fb3c7cdfdb0):
**Build:** First write the reason for entering the new explanatory world: zoom `to reveal previously hidden mechanism`, pullback `to reveal containment/context`, comparison field `to expose categories`, exemplar replication `to establish scale`, shell transformation `to change vehicle state`, cut `to switch analogies without false spatial continuity`. For continuous transforms, specify `identity that persists`, 3+ shared visible landmarks, source/target viewport matrices, camera center trajectory, extrema/overscan, transition foreground masks, fully drawn intermediate state and the exact frame each element becomes visible. For a semantic hard cut, match meaning/color rhythm and establish the new proof immediately; do **not** claim registered physical continuity. **Forbidden:** freshly generated mismatching painting popping exactly as a “zoom” ends.

**Deliver:** `OUT/MIDDLE/IN` art states, exact landmark table, master registration transforms, occluders and 60fps frame event score. **Test:** composite the middle at native resolution and alternate source/target through the swap; a visible rectangle seam or identity break invalidates the continuous move.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/transitions.mjs#compileTransition

### F79 — Own the alpha, underpaint, parallax and offscreen drawing budget
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 b1f931967f867273a1e9a2249e619f9a9a93b082311464a4516049dfdb02ce73):
**Build:** For each moving object produce `(a) approved composite, (b) true-alpha isolated foreground/subject with 0 outside, (c) clean exposed underpaint for every pixel it can reveal, (d) matte/occluder with real opaque region, (e) a larger master with camera-coverage beyond every output footprint, (f) registered landmarks before/after movement`. Pixel-coherent layers should be derived from an approved master by segmentation/inpainting/controlled edit when possible; independently regenerating a background and actor often causes shape/color mismatches. For full-cover swap, prove the occluder at the swap frames has **actual alpha coverage 100% of the needed viewport**, not merely a verbal instruction. **Forbidden:** painting a “transition plate” that has a transparent hole and hoping it hides everything.

**Deliver:** manifest of dimensions, alpha extrema, unique image hash, source master id, mask ownership, transform fit, camera footprint and seam test results.

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/art_intake.mjs#validatePlanContract

### F80 — The first provider request must actually contain the methods and unlike native pixels
SOURCE OPERATIVE INSTRUCTION (verbatim, sha256 68f4aa97b6e4953778a602458046ed65d64f1a631f486ee7e8f33cb379bb6ed1):
**Build:** Fill `first_pass_control.version=2` and `causal_frame_geometry`. Add the optional `molecular_visual_decisions` block (see below). Route the highest-impact F57–F79 decisions **before** full prose: causal proof → chosen family/projection/actual bbox → physical silhouette and part graph → parent-owned color and optical exceptions → quiet region and T1/T2/T3 → exact connection anchors and forbidden overproduction → camera/state asset ancestry. Select at least **two unlike original native witnesses** by relevant construction family and explicit contrasting conditions, attach them to the actual provider request as `referenced_image_paths`, tell provider `STYLE ONLY, DO NOT COPY CONTENT`, use `prepare_first_pass.py` to validate, and inspect the first output at intended screen scale. Repair **the failed construction law** in the request/job, not just one character by asking for prettier styling. Keep an output record for first-pass and after repair separately.

**Deliver:** compiled request with image hashes, provider output identity, first-pass whole-look assessment, causal correctness, rule-level repair, before/after compare and an unrelated transfer test.

### Additional ArtJob block: `molecular_visual_decisions`

This block is additive and is incorporated early in the first-pass compiler's source-conditioned prompt. It must be filled with original-scene specifics—this schema is **not** a valid production job as written.

```json
{
  "molecular_visual_decisions": {
    "highest_impact_question": "Which compositional construction would prove THIS new causal claim?",
    "chosen_methods": ["F57", "F59", "F61", "F69", "F78"],
    "positive_source_contrast": "AI@444 pale abstract support is unlike MEMORIES@62 dark attached biology; select condition explicitly",
    "contradicting_source_case": "What unlike source prevents chosen setting from becoming a universal law",
    "primary_proof": {"subject_parent_id": "id from subject_graph", "bbox_norm": [0.1,0.12,0.83,0.9], "observable_before_after": "literal changed shape/contact visible to viewer"},
    "topology_and_projections": {"view_family": "FLAT_ORTHO/OBLIQUE/etc", "parts": [], "ports": [], "occlusion_order": []},
    "color_and_surface_owners": {"palette_slots": {}, "specific_material_patches": [], "allowed_optical_masks": []},
    "density_budget_by_region": {"main_proof": [], "support": [], "quiet": [], "repetition_parent_masks": []},
    "animation_ancestry": {"canonical_master_id": "actual name", "registered_anchors": [], "intermediate_states": [], "alpha_underpaint_overscan": []},
    "specific_generational_exclusions": ["No added unauthored arrows", "No photographic face lighting", "No props not included in original subject graph"],
    "falsification_test": "Specific visible failure that would cause method revision"
  }
}
```

EXECUTED BY ENGINE CONSUMER: engine/art_bridge/art_requests.mjs#compileArtJob

## Construction topics
{
 "silhouette_and_gesture": {
  "operation": "flat-fill silhouette test of the standing reach before any interior mark",
  "visible_result": "free near hand and planted far foot read at one-tenth size",
  "methods": [
   "F01",
   "F58",
   "F66"
  ]
 },
 "head_and_face_grammar": {
  "operation": "owned skull/face-plane/hair/ear regions; white-sclera eyes; states redraw contours",
  "visible_result": "three facial states with the same skull",
  "methods": [
   "F05",
   "F52",
   "F65"
  ]
 },
 "hands_and_contact_shapes": {
  "operation": "separate open, grip and pinch hand drawings with explicit finger/thumb order",
  "visible_result": "fingers in front of the handle, thumb behind; pinch tips meet",
  "methods": [
   "F06",
   "F59"
  ]
 },
 "garment_masses": {
  "operation": "mustard jacket and teal trousers as two volumes with one far-side plane each",
  "visible_result": "quiet support masses that never out-detail the hand",
  "methods": [
   "F02",
   "F33",
   "F62"
  ]
 },
 "state_ancestry": {
  "operation": "six registered state edits of the approved master",
  "visible_result": "anchors coincide across states",
  "methods": [
   "F14",
   "F30",
   "F67"
  ]
 }
}
## Art/motion agreement
{}
## Motion requirements (requirements, never coordinates)
{
 "attachment_semantics": {
  "pelvis": "whole figure rotates/translates about the hips",
  "chest": "upper body leans with the jacket as one mass",
  "neck": "head turns/tilts at the collar band",
  "shoulder_r": "near sleeve separates under the jacket shoulder line",
  "elbow_r": "near sleeve bends at the elbow; inner sleeve exposed in deep bends (underpaint edit)",
  "wrist_r": "hand separates at the cuff edge",
  "shoulder_l": "far sleeve separates behind the jacket",
  "elbow_l": "far sleeve bend (rarely visible)",
  "wrist_l": "far hand at the far cuff",
  "hip_r": "near trouser mass at the hem line",
  "knee_r": "near knee bend inside the trouser mass",
  "ankle_r": "near shoe at the hem",
  "hip_l": "far trouser mass behind the near one",
  "knee_l": "far knee bend",
  "ankle_l": "far shoe — the planted support"
 },
 "contact_semantics": {
  "ines_grip_r": "palm centre of the near hand closes on the washer door handle",
  "ines_pinch_r": "thumb–index tips hold a coin and follow it into the slot",
  "ines_sole_r": "near shoe sole on the ground line",
  "ines_sole_l": "far shoe sole — planted during S02"
 },
 "note": "requirements only: the approved art determines the fitted rig geometry; no limb proportion or coordinate is prescribed to the artist"
}