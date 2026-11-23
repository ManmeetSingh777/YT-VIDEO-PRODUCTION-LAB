# Conditional illustration construction operations — cross-film synthesis

**Use:** Translate an unfamiliar subject into executable drawing and image-model instructions. The object named in a source witness is *an example of the procedure*, never an object to replicate.

**Evidence types:** `O` = directly observable; `I` = generalized construction interpretation; `T` = limited original-art generation tested. Each `Fxx` rule below is a **candidate** until the manufacturing result passes style and generalization tests. Do not invent numeric universal rules that the evidence does not establish.

**Whole-film continuation:** F01–F19 are the material/anatomy/world foundation, not the entire style. Begin unfamiliar-script design by routing each beat through **F20 scene-medium selection**, then invoke the condition-specific **F21–F36** in [`FULL_FILM_ROUTER_AND_METHODS.md`](FULL_FILM_ROUTER_AND_METHODS.md). Full-five-film timeline evidence and its sampling limits appear in [`FULL_FILM_EVIDENCE.md`](FULL_FILM_EVIDENCE.md). Crosscheck a novel scene with at least two unlike examples before treating a rule as a repeated invariant. Do not transfer sponsor-card styling to story imagery unless the new script calls for an ad.

## 0. The six decisions that dominate the picture

Before requesting a drawing, specify these six things without adjectives:

1. **Complete form grammar** — a named path/shape hierarchy for the entire subject, not disconnected primitive icons.
2. **Surface grammar** — what colored mass belongs to which material/plane/anatomical region, including its edge and neighboring masses.
3. **Part relationship grammar** — structural attachment, near/far occlusion, interpenetration, recess, grip, weight and containment.
4. **Color-role and illumination grammar** — conditional palette relative to environment and focus, with different treatment of opaque, optical, emissive and atmospheric elements.
5. **Complete-world grammar** — perspective, environmental depth, functional objects, local level of detail and subject/environment harmony.
6. **Temporal grammar** — which elements are transformed, redrawn, replaced, independently animated, masked, or re-lit and how simultaneous motion preserves the illustration.

One correct feature cannot compensate for a wrong family. A flat yellow human head with flat shadows is not source-like if eyes, hair, expression, gesture and clothing were generated in another artistic language. Begin with whole picture → then high-salience forms → then attached internals.

## F01 — Silhouette and functional anatomy (O, I)

**Evidence:** runner/sofa/clinic humans (Brain Blinds, Memories), large/small birds (Brain Blinds, Solar), farm animals and macro fly (Nuclear), computer/machine (AI), enclosed world (Memories).

**Input:** subject type, actual anatomical/function role, intended view, motion/contact requirement, nearby supports.

**Procedure:**

1. Draw the complete subject as a silhouette in its particular **view**. It must be recognizable without eyes, markings, decals, textures or glow. Explicitly name what makes this species or object different from another subject of its family.
2. Divide into structural masses only where a real connection exists: skull + hair cap + facial exposure; torso + facing garment planes + arm/leg/hand; animal torso + neck/head + near/far legs + tail; machine housing + screen recess + controls + feet; tree trunk + major branch joints + crown.
3. Arrange masses with overlap order BEFORE details. Reject a missing joint covered by a decorative strip.
4. Draw subpart contours to follow actual direction of the full gesture/object: shirt edges follow bent arms, window grids lie in a single facade plane, scales follow the body surface, leaves emerge from stems.
5. Test silhouette at one-tenth output size and compare against the first intended whole form. If subject identity only works when labels or decorative eyes are visible, return to Step 1.

**Style invariant:** coherent purpose-specific contour + meaningful attachments + selective large internal colored masses. **Not invariant:** roundedness, limb count, body ratio, amount of detail, exact species anatomy, object palette or silhouette.

**Wrong output:** sphere with four identical cylinders for a human; generic circular bird with glued-on beak; pig-shaped "cow" with two flat legs; purple rectangle labeled machine; plants as unrelated floating leaves.

## F02 — Surface-color construction instead of generic line art (O, I)

**Evidence:** source comparison boards; AI city; Nuclear fly and farm; Brain Blinds human faces; Memories clinic; Solar machines. **Counterexample:** AI desk montage contains an actual thin-line pencil-art inset.

**Procedure:** for each material create `base_body` and zero or more `attached_color_form`s. Each form must name its material parent and satisfy one of: (a) view-facing plane, (b) anatomical volume change, (c) raised/recessed functional shape, (d) glass/specular detail, (e) designed local marking. Bound shapes by contiguous intentional filled edges. Most ordinary contours are a boundary between neighboring fills, not automatic thick black strokes. Use narrow colored rims specifically for a glass frame, housing bevel, roof lip, vessel edge, or required accent.

**Exceptions:** line drawing is permissible within its own illustrated media (white paper montage), ordered fine wiring, visible stems, frame rails, certain facial brows and technical detail. Such lines have named function. Never globalize this exception.

**Test:** ask for a flat-color layer view with outlines disabled. If the image becomes unintelligible, the form was constructed by contour lines rather than colored surfaces. A second test checks that secondary patches share the same parent mask/shape boundary rather than floating over a body.

## F03 — Conditional color-role solver (O, I)

**Evidence contrasts:** pale yellow outdoor acting versus vivid orange/teal interior (Brain Blinds); cyan clinical room versus violet hair/orange faces (Memories); pale-to-near-black olive farm (Nuclear); warm/cool alternating vertical city faces (AI); near-black violet galaxies with distinct warm/cool emitting cores (Solar).

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

## F04 — Four distinct lighting systems (O, I)

1. **Opaque form:** bounded fill/color patches on skin, cloth, animal bodies, roof faces, shell plates. Preserve crisp silhouette. Use hard masked local surfaces; no unconstrained Gaussian blur.
2. **Optical material:** contained reflection/inner glass color within a lens, visor, eye facet, display, bowl or glass. Define physical lens or glass region first, then clipped reflection and any visible transparency layer. No highlights beyond lens mask.
3. **Emissive physical element:** recolor a real connected branch/filament, lamp, window, hot ribbon area or screen information. Source geometry continues beneath the light. Add halo only after emissive shape exists.
4. **Atmospheric light:** very bright source, galaxy core, whiteout, sunlight, flare, selective depth haze. Preserve hard anatomy and machinery where those have not been occluded/washed out by evidence.

**Evidence:** Nuclear fly's specular red eyes vs Solar spiral galaxies vs Memories neural lit groups vs AI dark computer screen vs Solar world-reveal flare.

**Test:** temporarily remove glow. Galaxy must retain broken arms/core and points; neural branch must remain connected; screen must retain glass/recess; insect facet must retain eye anatomy. A pure blurry blob fails.

## F05 — Human head and facial-state fabrication (O, I)

**Evidence:** Brain Blinds runner/couch; Memories clinic pair; AI operator rear view; Nuclear farm characters. These give several views but not a complete front-to-back turnaround of one person.

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

## F06 — Human body, hands, locomotion and meaningful contacts (O, I)

**Evidence contrasts:** Brain Blinds forward-running woman vs sofa recline; Memories consulting/clipboard; Nuclear kneeling/handling cattle; AI operator keyboard.

1. Choose a whole gesture and support pose first: standing, running, reclining, kneeling, seated, leaning, working. Sketch center of mass, supported limbs and eye/hand attention as a **whole image**.
2. Construct torso and garment as pose-specific silhouette, including bent sleeves, distinct near/far cuff colors, clothing overlap and pants folds determined by the bend. Not all arms or legs remain same width.
3. Generate actual *task-specific hand art*: reaching hand (separated open palm/finger mass), pinch, hook grip, broad supported palm, holding stick/clipboard, computer input, grasping an irregular prop. The source simplifies fingers but preserves readable hand/prop relationship.
4. For each contact write a graph `actor.hand -> prop.handle`, `actor.foot -> ground`, `actor.hip/back -> seat`, `prop -> support`; draw near/far occlusion, grip closure and exact attachment side. Fingers don't pass through object or disappear.
5. Create alternate drawings for significant change: gait stage, face/head tilt, hand opening/closing, shoulder or sleeve turn, lifted foot, shifted weight. A static pelvis with disjointedly rotating elbow segments fails.
6. Ground with contact-aware little elliptical/fill marks **only where that style treatment applies**; don't force every environment to use them.

**Test:** remove the prop temporarily; wrist/thumb/finger orientation must still indicate an intended grasp location. Replace the prop with a novel shape; generate a new valid contact state rather than reusing source-specific hand illustration. Verify foot support and no stretching.

## F07 — Distinct mascot and animal construction (O, I)

**Evidence:** two unlike birds in Brain Blinds and two unlike Solar birds; cattle and macro fly from Nuclear.

- **Mascot:** preserve one simple immediately recognizable subject silhouette, large attached readable face/eyes, compact purposeful wing/tail/feet parts and minimal material patches. Species and persona determine proportions, not a universal bird grid. Each face state may require separate eye/beak design; only parts that should move independently are layered.
- **Quadruped or animal:** draw species-appropriate torso/head/neck transition, differentiated near/far limbs, ears/horns/eyes/muzzle, tail and weight. Surface pattern is registered to the real body; distinguish body markings from parasites, wounds, attached devices and shadows.
- **Macro creature:** magnified species requires more anatomy-specific local structure. Create near/far eye, compound facets where genuinely appropriate, shell plates, wing venation, segmented/angled limbs and selective clipped lens marks. Increase detail by named biological subparts, never by uniform texture noise.

**Control:** define a species-specific part graph and required view/pose family. Cross-film transfer is the **way parts are drawn and colored**, not borrowed anatomy.

## F08 — Architecture and oblique projection (O, I)

**Evidence:** AI colorful city; Nuclear long factory; AI vintage machine; Solar cylinder/chamber.

1. Choose one coherent camera projection for world/structure; define visible roof/top and side faces, parallel edge families, scale/depth ordering. A distant visible side cannot face a contradictory direction.
2. Construct neighborhood/site footprint and circulation **before** building decorative facades. For a city: parcels, roads, walkways, green gaps; for factory: elongated roof spans, roads, parked vehicles, lights/landscape.
3. Invent functionally different architecture **families** appropriate to original subject: high tower with apertures, glazed planar wall, roof recess, pitched civic volume, curved industrial roof, etc. Do not use one cuboid scaled across every building.
4. For each family define geometry and nested *surface-local* details: window recesses aligned to wall planes, raised bays with real side faces, roof edge strips, doors tied to path, mounted vents and parapets.
5. Reuse projection and scale across whole world; retain explicit occlusion between near/far buildings, roads and trees. Color facades by related face/material variants; avoid one random hue per window.
6. If camera pans, **the same geometry travels as one coherent world**. Do not regenerate facade architecture frame by frame.

**Counterexample:** Nuclear factory has long shallow arch roofs and sparse doors; applying AI city's window grids is a style misunderstanding.

## F09 — Machines and functional apparatus (O, I)

**Evidence:** AI computer and keyboard; Solar rocket, dark circuit column, deep blue chamber.

Build an explicit mechanical dependency graph before drawing:

- `housing` → top/front/side/back volumes → inset display/lens → controls/vents/switches → supports/floor shadow.
- `cylinder` → top annulus → vertical side → base annulus → routing of functional tracks on actual surfaces.
- `ring chamber` → near outer bezel → nested receding circular wall → radial segments → inner opening → separately floating energized loop.
- `propulsion` → tank/booster/main hull → actual attachments/fins → nozzle → bright flame tongues → separately drawn expanded exhaust cloud masses.

Controls live in named recesses or raised plates; wires track through connected pathways; screen content remains masked inside its actual screen; gradients/reflections depend on material and lens. A purple box plus random circuit glyphs fails.

For an unfamiliar machine, begin with its **real intended use and physical assembly**, then apply source-like illustrative surface/plane treatment. Any function invented solely as futuristic decoration must be labeled original design, not observed grammar.

## F10 — Complete spaces and foreground/background integration (O, I)

**Evidence contrasts:** warm couch room (Brain Blinds), cool clinic (Memories), contained POV desk (Brain Blinds), farm, enclosed reef.

1. Establish room/world shell and framing (walls, floor, openings, far/middle/near zones).
2. Build furniture and fixtures as usable volumes with exact seat/top/support/leg edges; cabinet/door has a recess; cup has an elliptical liquid surface/handle/saucer; a plant has pot/rim/stems/leaf clusters.
3. Place actors and props only after all contact surfaces exist; use world coordinate relationships so feet sit on floor, body sits in furniture, hands touch proper parts.
4. Allocate art density according to function: source clinic keeps cabinet/window low contrast versus people; warm room uses many functionally illustrated decorative pieces; desk POV retains actual detailed objects inside an irregular masking boundary.
5. If shown inside a frame (window/bowl/screen/panel/portal), draw the **complete inner scene** and then mask it with an intentional rim; do not replace interior with a colored sticker.

## F11 — Landscape, plant and environmental density (O, I)

**Evidence:** layered green Nuclear farm versus nearly empty yellow Brain Blinds acting field; Nuclear industrial horizon.

Create distinct atmosphere/terrain strata: sky or distant field; distant low-contrast hills/crowns; middle world with purpose-specific fence/road/trees; foreground large, darker overlapping plants and ground islands. Each plant is a family of connected trunk/branches and rounded or angular leaf/crown lobes. Repeat related silhouettes with variation in size/overlap, not thousands of independent photo-like leaves.

**Conditional density:** sparse background when gesture is primary; dense multi-depth foliage and scene-specific species when ecology/world is the subject. Do not force a black foreground plant frame into an interior or a minimal yellow desert into a dense rural scene.

For moving landscape distinguish camera pan, foliage deformation, moving actors, light cycle, weather and world transformation. Never random-jitter every leaf for perceived energy.

## F12 — Designed dense biological network (O, I)

**Evidence:** Memories neural forest 91–95s; compare discrete activation changes against persistent branch structure.

1. Specify biological parent connector and a finite set of *meaningful* terminal morphologies.
2. Build many related branch trees as actual connected paths, with forks, overlapping depth and vertical/material zoning; individual terminals stay attached to stem tips.
3. Distribute terminal categories by explicit cluster/band roles rather than uniformly random RGB colors.
4. For activation choose connected subsets of real stem/terminal graph; recolor related geometry and add local halo. Do not create a yellow gradient circle on unrelated particles.
5. Keep informational labels/graphic overlays screen-space separate from the world network.

Graph topology and species-specific terminal family must be invented appropriately for a new biological system, but the **connection, zoning, and luminous-group grammar** is transferable.

## F13 — Structural luminous, optical and complex materials (O, I)

**Evidence:** Solar galaxies; Solar folded gold ribbon; Brain Blinds POV boundary; AI screen glass; Nuclear fly eyes.

Before light effects, draw the underlying **physical or graphic structure**:

- Galaxy: actual core shape, distinct broken elliptical/spiral band surfaces, attached dots/cross-stars following pattern, halo that does not erase drawn spiral arms.
- Glass/lens: near/far rim, inset body, contained colored reflection shapes; selective transparency only inside pane.
- Curved sheet/ribbon: variable-width front surface, visible underside/edge, changing overlap order at curls and actual holes between loops; panel colors follow ribbon shape, not stationary brushstroke.
- Portal/optical opening: multiple nested irregular contour layers, different outer/inner material colors, a bright inner lip plus separate edge fragments; a complete world exists behind the mask.

Do not turn every glowing element into a thick gold ribbon, purple galaxy, or portal. The invariant is **structural illustrated light with material ownership**.

## F14 — Illustrated transformation and alternate state design (O, I)

**Evidence:** Memories thought shell and child illustration; Nuclear environment time states; Solar ribbon state growth.

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

## F15 — Motion ownership, simultaneous choreography, camera (O, I)

For every animated region label **exactly one primary owner** and necessary secondary owners: `CAMERA`, `WORLD`, `SUBJECT_RIGID`, `SUBJECT_PART`, `REDRAWN_STATE`, `MATERIAL_LIGHT_STATE`, `TRANSITION_MASK`, `EFFECT`, `SCREEN_UI`. A camera pan must not morph architecture; a moving person must not freeze face/hand states; a lit biological network must not be random moving confetti.

Construct a motion timeline as **simultaneous tracks**, not one actor doing one action while all surroundings sleep. Track front/back occlusion, each grip and foot support, independent prop/object trajectory, foreground motion, background loop and screen-space overlays. Only move what is visually supported; source films contain purposeful stillness as well as dynamic changes.

Use explicit state boundaries and recorded durations from exact source frames *for analogous motion classes*, but do not copy specific source durations as universal pacing law. A 60fps visual witness can expose exact observed transitions; it cannot reveal source authoring layers or music alignment by itself.

## F16 — Transitions as complete illustrations plus masks (O, I)

**Source families:** Solar hard rays → whiteout → individually drawn angled technology panels; AI scrolling illustrated collage; Solar cosmic streak reframe; Brain Blinds nested POV border; Nuclear material state changes.

Select the transition **by the actual communicative change**:

1. Two complete world plates must already exist for a world change.
2. Define whether the transition uses an illustrated ray field, layered whiteout, clipped moving panels, nested boundary, fast camera streak, or coordinated material change.
3. Manufacture the special illustrated effect components (wedge rays, bright core, irregular nested contours, diagonal masks, border plates, motion-streak structures) as actual assets. Specify which plate is revealed/occluded as the component changes.
4. Keep key original subjects from magically morphing into new unrelated objects unless a real drawing-state transformation is explicitly planned.
5. Audit frame by frame around start, midpoint, and finish; watch for flashes, jump cuts, unregistered geometry and incorrect layer order.

No fixed transition should be added to each scene merely because it appears in one source film.

## F17 — Whole-look and provider-control proof (T, I)

**Actual tests:** An original asteroid greenhouse with scientist and robot made from text-only construction instructions produced a plausible illustrative scene but retained extra anime/faux-3D stylistic choices. A text-only pangolin/wetlands scene exhibited even more fine-lined/anime/painted detail. A *second* original pangolin/wetlands job with several unlike source-style witness boards and stronger negative constraints produced materially more source-consistent large fills and cartoon proportions, although character/world precision is still not certified. A separate original harbor provided a second material-family transfer, a real compiled greenhouse ArtJob was executed into pixels, and six guided alternate botanist drawings retained recognizable identity within one sheet but did not demonstrate independent multi-request identity consistency or motion. See TRANSFER_TEST_REPORT.

Therefore:

- **Image-model prompt must explicitly govern shapes, subparts, contact, color-region ownership, lighting and environment**, not merely "draw in Kurzgesagt style."
- **Use broad multi-source visual witnesses** when the provider supports them, with STYLE-ONLY instructions preventing source composition copying. Text alone is not shown to consistently control the source-like appearance.
- **Inspect real pixels**. Do not infer from prompt length that the source shape grammar was obeyed.
- **Measure errors at the whole visual level**, then the high-salience part. Record exact feature and producing operation, not vague vibes.
- If reference-conditioned outputs approach the look but contain copied compositions or unsupported geometry, perform new-subject diversity tests and repair method-level controls before qualification.

## F18 — Every-frame observation without confusing it with decoding

Each selected interval has an immutable original source identity, exact frame number/PTS and a coverage state: `DECODED`, `TIMELINE_VISUALLY_VIEWED`, `NATIVE_ART_INSPECTED`, `CONSTRUCTION_METHOD_MAPPED`, `GENERATED_OUTPUT_TESTED`. These are separate. A 60-up thumbnail page supports gross motion continuity but cannot certify native-resolution contour, face, layer or shading.

For every high-impact change: load exact adjacent native-resolution frames; compare object identities, geometry, part attachment, material changes and contacts; name any frame where the inferred method is contradicted; revisit other actors/worlds for cross-film support. Compress genuinely repetitive intervals only as *equivalent states with explicit frame-range coverage*, not as fictitious individually inspected art.

The archive does not yet prove `NATIVE_ART_INSPECTED` for all 3,492 frames. Do not write `100% art observed` from a frame-file count.

## F19 — Production medium and timing are conditional, not a universal vector-only preset (O, I)

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

## 20. Final instruction compiler gate

Before image generation, confirm the job has at least:

- Named full silhouette and view for every focal subject;
- Complete part/attachment graph and support/occlusion;
- Material/plane-local color patches for primary focal surfaces;
- Head/face/hands and required distinct pose states when humans appear;
- Physical construction of major equipment/interior/environment objects;
- Related palette roles, not only hue adjectives;
- Explicit allowed/forbidden lighting operations by material;
- Conditions for density/complexity and foreground/middle/background;
- Correct motion ownership and alternate states for anything changing;
- Multi-source witness selection and originality/non-copying constraints;
- A real route that can express the method (reference-guided raster, segmented edit, code, hybrid);
- A concrete generated-image audit and honest confidence state.

If any high-impact field is unknown, produce a **gap record with the exact missing choice**, retrieve relevant source evidence and refine before claiming the guide sufficient.
