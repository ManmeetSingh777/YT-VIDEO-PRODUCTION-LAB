# F57–F80: conditional molecular visual constructors

**Use with** `VISUAL_CLUSTER_ATLAS_AND_DECODING_LOOP.md`, F01–F56, `FIRST_PASS_VISUAL_CONTROL.md`, and the five-film first-pass compiler. These rules replace **generic image-model defaults**, not the earlier rules. `SOURCE_OBSERVED` means a relevant original-HD witness visibly contains an operation; the imperative algorithm below is an **engineering transfer method**, not a claim we have seen the studio's private layer structure.

For original work, the numbers in a scene specification are its **actual newly chosen coordinates and sizes**. Do **not** copy coordinates or absolute hexes from cited source artwork. Use normalized 0–1 screen coordinates and 1920×1080 reference canvas when practical; for film camera moves also include a 3840×2160 or wider overscanned master footprint where needed. Only use a ratio with a clear subject-specific justification. Every `.mask` has actual image alpha, not a textual promise.

## F57 — Start with a visible causal proof, not a “beautiful scene”

**Evidence contrast:** `NUCLEAR@420s` needs aerial coverage and the aircraft/release relation across a large field; `BRAIN@274s` needs tight gaze/anger cues and gains nothing from showing a street; `AI@702s` needs relation edges connecting several active concepts. These contradict one universal crop or world density.

**Build:** (1) Write the factual statement the *silent* viewer must infer; (2) name the observable `BEFORE`, the one changed physical/link state in `CAUSE`, and the visible `AFTER`; (3) make `source_anchor` and `target_anchor` actual points on physically drawn contours, e.g. a valve port, visible stream tip, tank surface, not words like “growth”; (4) choose `proof_projection` from `face_contact`, `object_process`, `wide_distribution`, `diagram_relation`, `embedded_screen`, `macro_internal`, `world_scale`; (5) reserve primary bbox and one continuation point **before** drawing scenery. Every mark in the eventual frame must be either a physical support, an active path, a causal reaction, or an editorial sign attached to these. If no causal endpoint is visible, repair framing and art—not textures. **Forbidden model prior:** decorative visual metaphor that merely looks science-related.

**Deliver:** `silent_inference`, `before/cause/after`, `proof_projection`, screen-normalized source/target contour points, primary/secondary bbox, supporting masks and `what_can_be_removed`. **Test:** cover all text and pause on the keyframe; the mechanism should still be distinguishable from an unrelated action.

## F58 — Construct the silhouette before interior polish

**Evidence:** `BRAIN@334s` full small actor has few internal marks but a clear complete body and weight; `SOLAR@84s` suit has a large complex outer shell with only several regions; `AI@650s` abstract faces are repeated as distinctive parent shapes. One universal round silhouette fails.

**Build:** Establish a set of closed parent regions: `outer_subject`, `front_mass`, `back_mass`, `cutout_voids`, `support/feet_or_mount`, each with a physical reason. Define their outline as control points/curves and attach child parts at named local coordinates. Preserve the screen-space identity-bearing negative spaces: limb gaps, handle loop, wing/arm junctions, visor hole, plant fork. Detail may not alter the outer silhouette unless it is a specific state change. For distant repetition, derive small forms from the master silhouette and deliberately collapse interior marks; do not simply shrink a fully detailed portrait. **Forbidden:** bloated soft painterly contours with no known connecting anatomy.

**Deliver:** parent silhouette masks, closed holes, view direction, local anchor coordinates, `small_size_read` (simulate reduction to actual rendered screen bbox). **Falsifier:** subject's function/species disappears when filled with one color or resized to intended scale.

## F59 — Parts must join and occlude in a deliberate topology

**Evidence:** `NUCLEAR@145s` people operate attached lab tools; `SOLAR@212s` inhabited pod must contain people behind a shell; `MEMORIES@62s` terminals connect to stalks. In the earlier failed generated worlds, visually impressive parts floated without support.

**Build:** Create a directed graph `id → parent_id, local_origin, joint_type, insertion_depth, in_front_of, hidden_when, material_id`. Each joint gets an actual overlap/cut mask. Show one side of the joint entering its parent to avoid a sticker appearance. For a hand holding a prop, draw the near fingers in front, prop midplane, far fingers behind; shadows/contact highlights are owned by prop/hand, never added globally. For a biological terminal, the stalk reaches a named terminal border; for architecture, a window only lives on the wall-face polygon. **Forbidden:** disconnected parts “appearing close enough” or ambiguous depth order delegated to a renderer.

**Deliver:** part DAG, topological overlap matrix, contact anchor positions, hidden-part clean underpaint, `which_part_moves_when_parent_moves`. **Falsifier:** translate/rotate one moving parent and discover any unowned floating mark or impossible overlap.

## F60 — Choose projection from the proof and make all planes obey it

**Evidence:** `AI@35s` oblique built world exposes tops and faces; `BRAIN@150s` is an intentionally flat multiregion diagram; `NUCLEAR@420s` is an aerial distribution view; `SOLAR@620s` is an abstract scale diagram with overlays. The source uses **different** projections.

**Build:** Declare `view_family` `FLAT_ORTHO`, `OBLIQUE_TWO_AXES`, `FRONTAL_INTERIOR`, `AERIAL`, `CIRCULAR_NETWORK`, `MACRO_CUTAWAY`, or `OPTICAL_CONTAINED`. If built/oblique, define projected basis vectors `u=(ux,uy)` and `v=(vx,vy)` and height vector `h`; every roof/window/road/side face uses these same vectors and is clipped to its parent face. For a frontal plane do not fabricate a roof merely to seem 3D. For a macro cutaway show enclosing rim, lumen/void and foreground biological occlusion layers. Use near/mid/far only when true representational depth exists. **Forbidden:** drawing a side wall in one coordinate frame and a tabletop/window in another.

**Deliver:** projection family, vectors and plane normals, occlusion ordering, camera footprint and what remains invariant on a viewpoint change. **Test:** extend a visible edge across multiple shapes; their axis and truncation should agree.

## F61 — Invent conditional palette **roles**, never imitate a universal swatch palette

**Evidence:** `AI@444s` pale-aqua/white near-empty stage; `MEMORIES@62s` black/violet biological density; `NUCLEAR@420s` green aerial land with cyan water and white plane; `BRAIN@334s` yellow/light backdrop, cyan clothes, dark trousers. Numeric quantized native-sample support lives in `SOURCE_CONDITIONAL_DOMINANT_COLOR_REGIONS.json` and `REPRESENTATIVE_NATIVE_RGB_AREA_AND_EDGE.json` (research output, if accessible), but it cannot label object semantics by itself.

**Build:** Define palette slots `primary_substrate`, `secondary_support`, `main_subject`, `active_delta`, `material_dark_plane`, `material_light_plane`, `optional_emission`. Assign each slot original RGB/hex **only after** specifying its silhouette owners and local neighbors. For every adjacent important region, record whether discrimination depends primarily on **luminance**, **hue**, or **edge outline**; do not turn the entire scene equally saturated. Use source witness pairs to choose *relationships* (e.g., saturated solid subject on quiet pale field) not sampled copy colors. Preserve repeated actor identity across scenes unless a deliberately recorded lighting/environment state overrides it. **Forbidden:** fixed brand palette, global gradient/cinema grade that consumes local flat planes, same purple shadows on every material.

**Deliver:** new-image swatches by role and physical owner, contrast pair graph, exceptional illumination map, first/second-read hierarchy. **Test:** render in grayscale and in a reduced 160×90 thumbnail; if cause/target merges with surrounding support, modify their local contrast before adding accents.

## F62 — Edges and shadows have owners; universal black outlines and bevels do not

**Evidence:** the empty bright BRAIN field has boundaries drawn by adjacent color planes; `AI@285s` computer housing has dark glass and shell inset edges; `SOLAR@84s` helmet is an actual optical enclosure. Native styles include color-edged organic forms, dark outlined faces and occasional local soft effects, **not one stroke parameter**.

**Build:** For each parent surface mark edges as `COLOR_ADJACENCY`, `MATERIAL_SEAM`, `CAST_SHADOW`, `INTERNAL_CREASE`, `OPTICAL_RIM`, `EMISSIVE_EDGE`. Draw seam contours on the object that actually contains them. Place a cast shadow on a named **receiving support**, projected from the actual actor/plane; make its shape an object-shadow relationship. Choose light/dark patch geometry by local surface turning/occlusion; not an automatic Photoshop bevel around every visible contour. For dark outline, specify only those edges requiring separation from the neighboring region. **Forbidden:** every region with equal dark stroke, every shape with same drop shadow, identical bright rim on human and machine.

**Deliver:** edge-role table by owner, shadow receiver id and patch mask, allowed glow/softness exceptions. **Falsifier:** remove black outlines globally; if the subject only survives because of arbitrary outlines rather than material/color region design, rebuild the parent planes.

## F63 — Keep reflection, transparency, blur, glow and grain inside physical optics

**Evidence:** `NUCLEAR@137s` magnified lens/fly has soft lens/reflection while sharp insect silhouette is separately readable; `SOLAR@212s` capsule has transparent shell over figures; `MEMORIES@189s` selectively luminous linked terminals; `AI@285s` screen emits against a darker enclosure. A style-wide “soft bloom” destroys the flat illustrated material language.

**Build:** For each optical effect name **emitter/source**, **participating region**, **mask**, **occluding geometry**, **falloff**, and **why the viewer must see it**. Glass: draw rim, transmitted inner content, bounded reflected patch and correctly clipped highlight; optical blur may affect depth-separated background but not the focal causal contour. Emission: only active subgraphs or screen surfaces glow; apply spill to plausible receivers, not whole-frame air. Lens: a crisp visible object can coexist with soft circular bloom; do not blur the informational subject. Grain/noise: if observed, attach it to an explicitly justified textured material/optical medium; no default overlay over skin/shirts/diagrams. **Forbidden:** universally glossy plastic, 3D volumetric fog with no owner.

**Deliver:** per-effect mask identity, source/falloff/occlusion, unaffected layers, before/on/off states. **Test:** switch effect off; causal subject topology should remain intact rather than turning into unrecognizable noise.

## F64 — Human/mascot/animal identity must be routed by *illustration family*

**Evidence:** `BRAIN@274s` front expressive face, `AI@285s` simplified rear operator, `BRAIN@334s` small full-body person, `SOLAR@84s` suited historical figure, `NUCLEAR@145s` clothed scientists and `AI@650s` abstract agent heads. They are not one proportional human template.

**Build:** Before any generator prompt choose `ACTING_FACE`, `GESTURE_FULL_BODY`, `REAR_OR_OCCLUDED`, `DISTANT_POPULATION`, `ORGANISM_MACRO`, `MASCOT_SYMBOLIC`, or `SPECIALIZED_GEAR`. For the chosen family supply a `canonical_identity` with named head outer contour, hair/horns/helmet silhouette, ear/cheek/nose regions, eyes actually visible from that view, neck/torso garment, far/near arms, hands, legs, feet and distinguishing color patches. For small actors, suppress inner eye/fabric detail but preserve characteristic head cap, posture and contrasting body segments. For mascot, build the species/symbol's own silhouette/limb system; do not paste an inherited “cute bird” or universal emoji. For animals/insects, new original species anatomy requires new source-independent correctness research and connected appendages; style witnesses prove color/shape grammar, not the anatomy of an unrelated species. **Forbidden:** painterly novel cover, anime realism, facial pores or hyper-detailed hair curls on a tiny explanatory actor.

**Deliver:** matching `CHARACTER_FAMILY_CONSTRUCTOR.md` A–E contract; original identity card + front/side/rear/potential occlusion only when actually needed. **Falsifier:** visually derived state loses recognizable hair/helmet/feature layout or detached hands, even though it resembles the first image by color.

## F65 — Eye and mouth construction depends on the **role** and crop

**Evidence:** `BRAIN@51s` studies an eye itself with nested sclera, iris and reflections; `BRAIN@274s` uses angular oversized brows and a small emotional mouth; `NUCLEAR@145s` uses small dark filled acting eyes on warm-toned faces without compulsory white sclera; `BRAIN@334s` has closed, curved eyelid marks on a full-body figure; `AI@285s` rear operator mostly shows no full eye. These are incompatible with a universal large-white-eye face recipe. A scientific anatomical eye is not a model for every actor.

**Build:** Select `face_eye_mode` *after the final projected head size and emotional function are known*: `ANATOMICAL_SUBJECT` = nested sclera/iris/pupil/cornea and optical highlights because the eye **is** the demonstrated object (`BRAIN@51`); `WHITE_SCLERA_ACTOR` = bounded scleral plane plus pupil and lid when close-up direction requires tracked gaze (`BRAIN@274` class); `DARK_MARK_ACTOR` = one dark dot/wedge with an adjacent lid/brow relationship **without** white sclera (`NUCLEAR@145`); `CLOSED_LID_ARC` = continuous bent line or closed colored lid patch, no visible globe (`BRAIN@334`); `REDUCED_ICON` = one/two contrast marks only when the final projected head cannot resolve a scleral hierarchy; `HIDDEN_REAR` = no face marks, preserve distinct hair/head outer contour (`AI@285`). Never switch modes simply to make a character prettier. For all *visible* modes anchor features to named local face coordinates: skull oval, median line, paired eye-line, nose/cheek wedge and brows; clip white, iris and mouth to their parents. Determine feature count from the **final on-screen pixel footprint**, not the generation resolution. The scleral fill is **optional** even for mid-size actors. Expression is a linked action unit with ordered `brow_tilt`, `lid_arc`, `gaze_offset`, `cheek_shape` and `mouth_topology` (`closed`, `small_open`, `wide_open`, `smile`, `frown`). Draw each mouth using actual open/closed contours and occlusion, not a scaled oval. Gaze and brow orientation must rotate with the face coordinate frame, and the original hairline/ear/face contour must remain registered across expression states.

**Deliver:** declared `face_eye_mode` with cross-reference witness and reason, local face coordinate system, final projected head bbox in pixels, parent masks for lid/brow/mouth, canonical expression sheets showing actual topology. **Test:** each pose must read when seen at the final actor screen size and inside the real background contrast; erase white sclera from a `DARK_MARK_ACTOR` and confirm that the expression still reads from eyebrow/eye marks rather than relying on portrait shading.

## F66 — Body acting needs weight, garment volumes and contact states

**Evidence:** `BRAIN@334s` walking/standing person reads through torso/leg arrangement and ground contact; `NUCLEAR@145s` lab actors read through coat/sleeve/hand-to-prop relations; `SOLAR@84s` suits use big rigid joints and visor/shoulder panels.

**Build:** Declare pelvis center, shoulder axis, both near/far feet ground contacts (or seated contact), one weight-support foot per state, and target for each interacting hand. Arms have parent segments whose connection seam hides under sleeve/hand shapes; mitten hands may suffice unless the grasp itself is the proof. Outfit draws as large filled garment contours with attached collar, cuffs, hem and only readable seam marks. For special gear define actual hard-shell regions that overlap flexible costume. Distinct camera views need distinct approved drawings or proven consistent rig geometry, **not** rotation of a hand cutout that was never authored in that perspective. **Forbidden:** limb “relationship” implemented as disconnected little PNGs orbiting a static torso.

**Deliver:** body pose graph, feet/contact/shadow locations, far/near limb overlap, full alternate drawings for unsupported topology changes. **Test:** silhouettes of adjacent poses must preserve joint connectivity and weight, not merely tween detached circles.

## F67 — Expression and pose animation is a *registered state family*

**Evidence:** 60fps source motion contains holds with active peripheral marks (`BRAIN@303–306s`) and large topology changes (`SOLAR@212–215s`). Framerate is not the number of independently created poses nor a guarantee that linear warping between poses works.

**Build:** Author a canonical character coordinate space and register head/neck/shoulder/wrist/hip/foot landmarks. List `state_0`, `anticipation`, `contact`, `peak`, `recovery`, `hold` as applicable, each with a full approved pose or proved rigidly movable segments and true-alpha clean underpaint. Use a change in **visible contact and facial geometry** to mark acting, not only x-position. Set keyframe times from desired audience inference; plan slow reading holds when needed. Interpolate between homologous shapes **only if topology and visible part inventory match**; else draw in-between cels, conceal using an authored occlusion, or cut honestly. Do not promise procedural warp quality from still images alone.

**Deliver:** state atlas and landmark-distance QA, occlusion order at each contact, alpha gap check, 60fps compositor score. **Falsifier:** a joint detaches, arm crosses the wrong side of torso, eyes slide off face, or a pose pops at the transition frame.

## F68 — Machines are part-defined functional volumes, not neon rectangles

**Evidence:** `AI@285s` monitor/lab apparatus has actual housing and near operator; `NUCLEAR@145s` tool/bench contact; `SOLAR@84s` mechanical suits and equipment. Some sources are genuinely abstract, but real machines still have meaningful part topologies.

**Build:** Define energy/material/info input, processing body, output, control or coupling, supports/feet and physical access path. Give housing a front/side/top face only for declared perspective. Place buttons, screens, pipes and slots **inside assigned parent facets**; project rows along parent axes. Recesses need inset region and parent rim; glass needs its own transparent and highlighted masks; cable/pipe ends must terminate on visible socket coordinates. State transitions need before/after housing/control animations and output response, not generic blinking decoration. **Forbidden:** arbitrary bars/buttons as a replacement for real mechanism.

**First-pass visual evidence refinement:** The original seismograph provider trial produced sound stylus→paper contact and a useful flat actor but also gentle machine/background color fades. Each machine ArtJob must now explicitly declare a `surface_transition_policy` per parent face: `HARD_BOUNDARY` (normal opaque face/side/top), `LOCAL_SOFT_OPTIC` (only a real lens or emission), or `SUPPORT_FIELD_GRADIENT` (only a stage-color transition, never inherited by all materials). Name which surfaces receive zero global gradient. This is an engineering rendering contract derived from an observed generation ambiguity, not a claimed proprietary studio setting.

**Deliver:** functional connection graph + housing face map + `surface_transition_policy` + in/out states + field-of-view and mask/registration contracts.

## F69 — Landscapes are *coverage substrates* with selective living detail

**Evidence:** `NUCLEAR@420–423s` aerial bright forest, winding river, clusters of trees and moving plane prove regional coverage. `BRAIN@334s` outdoor stage intentionally contains much less environmental visual information. Both use controlled regional color and simplified parts.

**Build:** First establish land/water/sky region boundaries, terrain slope/river course and horizon **only if present in the chosen view**. Keep vegetation as species/terrain-owned canopy-parent groups (large canopy mass → medium leaf lobe → occasional small patches) with placement driven by ecological zones and camera scale. For aerial routes, distribute groups according to topography and mask them behind aircraft, with correct source/target coverage path. For acting, let background collapse to two or three broad support regions and put active motion in the subject. A highly detailed river canopy is not automatically appropriate to a small dialogue shot. **Forbidden:** random trees and confetti uniformly scattered to simulate richness.

**Deliver:** substrate polygons, vegetation parent masks/group distribution, focal quiet corridor, near/far occlusion, parallax/camera footprint and layer owner count. **Falsifier:** disabling all T3 foliage should preserve the explanation; if it does not, the geometry lacks the primary causal relation.

## F70 — Built worlds use coherent projection and semantic architectural repetition

**Evidence:** `AI@35s` oblique structures have roof and multiple side planes; window and shadow groups attach to the particular building face. Contrast `BRAIN@150s` flat field and `AI@444s` transparent information panes, neither of which is a physical city.

**Build:** Design blocks with `plan footprint → height extrusion → roof/front/side polygons → structural openings`. Derive side-face shade patch from the face's own normal, not a random gradient. Draw window/door rows using wall-local u/v axes, each cutout bounded inside the facet with explicit clipping. Control depth by road widths, overlap order and occlusion; don't have every background object equally sharp/bright. Interior scenes likewise need furniture contact to floor/walls and consistent horizon/sill axes. For a new script about a mechanism inside a building, choose one functional wall, foreground machine and quiet support; do not require the entire skyline. **Forbidden:** toy-town miniaturization and photoreal window-by-window rendering where a diagram would show cause better.

**Deliver:** architectural plane graph, projected axes, opening masks, interior/exterior ownership, registered camera/crop master.

## F71 — Dense microscopic biology is a connected graph, not a particle wallpaper

**Evidence:** `MEMORIES@62s`, `@108s`, `@189s` have local branching networks, multiple interacting length scales and active vs inactive terminals. `AI@650s` repeats discrete head-like panels instead of branching, showing different repetition topology.

**Build:** Define actual cell/neurite/vascular/membrane **parent anatomy**; identify rooted paths, branch nodes, terminal tips and enclosing tissue. Generate a graph with endpoints physically touching source/target parent surfaces. Assign diameter and hue/brightness by parent branch class, near/far plane and active state. Place particles only where transported or attached to known terminal/surface, with explicit sources/destinations. Use T1 root network, T2 branch/terminal structures and T3 bounded micro-lobes; make some areas sparse to keep the active path readable. Biological optics can locally glow during activation but should not replace the network edges. **Forbidden:** free-floating colored dots across uniform purple fog.

**First-pass visual evidence refinement:** The unfamiliar fungus output had a physically continuous tube but generated a series of disconnected lime oval **insets** rather than one solid lime-highlight band. Before asking for a transport illustration, choose `active_path_display` as exactly one of `CONTINUOUS_BAND`, `DISCRETE_PACKETS`, or `SWITCHED_TERMINAL_PATCHES`. `CONTINUOUS_BAND` must have one topologically connected colored fill along the parent inner tube (no gaps); `DISCRETE_PACKETS` may use separate lumen-owned marks but needs time-ordered positions and a recognizable directional travel; `SWITCHED_TERMINAL_PATCHES` changes only bounded active targets while the underlying physical graph remains. Do not let the provider invent a fourth rendering category.

**Deliver:** edge list/endpoints, rooted branch hierarchy, `active_path_display`, material id per branch, highlight activation subset, underpaint and topology-preserving path variants. **Test:** all visible terminals either connect or are intentionally free molecules; every bright “active” component has a valid propagated source. For `CONTINUOUS_BAND` use a mask flood-fill of the active colored region to confirm connectedness, not only a visual impression of continuity.

## F72 — Macro organisms and lenses are distinct coordinate systems

**Evidence:** `NUCLEAR@137s` fly is relatively crisp inside blurred magnifying optics; `BRAIN@51s` enlarged eye-as-subject has nested anatomical volumes. A focal scientist's face elsewhere should not inherit that anatomy/light.

**Build:** Separate `specimen_anatomy`, `enclosure_or_lens`, `foreground_occluder`, `background_optical_field`. Construct specimen from actual species anatomy (body segments, appendage attachment, eye plane, wing or cilia parent surfaces). Draw reflections only inside the glass/lens mask and keep the specimen's active physical contour readable. A view entering the specimen must have real matching anatomical landmarks and a new transparent rim/cover/underpaint inventory; scaling one illustrated eye image until pixelated is not enough. **Forbidden:** a self-contained “3D scientific creature” dropped over a generic bokeh texture.

**Deliver:** specimen shape topology, lens ellipse/polygon, lens alpha/reflection masks, depth and focus policy, adjacent view registration.

## F73 — Cosmic/scale worlds depend on physical and diagrammatic meaning

**Evidence:** `SOLAR@620s` stars/orbits/time labels anchor a comparison diagram; `SOLAR@674s` planet and vehicle sit as recognizable astronomical forms with local reflections; `AI@444s` abstract panes and `MEMORIES@62s` dark biological field cannot share one neon-cosmos recipe.

**Build:** Choose `PHYSICAL_SPACE`, `LOG_SCALE_MAP`, `TIMELINE`, `DISTANCE_COMPARISON`, or `RELATIONAL_STAGE`. For physical space, define main bodies, surfaces, light occlusion/shadow terminator if needed and optical/emission masks. For scale map, make labels/numeric range and relative object sizes visible with a declared encoding; a false linear geometry must be explicitly diagrammatic instead of pretending physical distance. Stars/particles originate in a bounded far field and cannot overtake an active foreground diagram. **Forbidden:** saturated galaxies as generic filler or numerically misleading object sizes without indicating schematic scale.

**Deliver:** spatial vs representational mode, scale mapping, celestial/diagram part graph, label attachment, camera state and physical/diagram truth distinction.

## F74 — Abstract information worlds need a visible representational grammar

**Evidence:** `AI@650s` repeats agent faces; `AI@702s` locates distinct acting nodes on stages linked by paths; `AI@444s` uses extremely pale pane fields; `BRAIN@150s` composes diagonal comparison fields rather than an implied physical room.

**Build:** Define entity type and what each visible mark encodes: `node=actor/system`, `edge=causal flow`, `region=state/group`, `glyph=measurement`, `glow=active subset`, `position=ordered relationship`. Create an actual graph: node IDs, screen/world coordinates, ports and edge paths; label only relationships that cannot be inferred from geometry. Build stages/portals/panels as **parent world objects** with their own coordinate/mask systems, not stickers. If the diagram changes worlds, specify which entity persists, what gets re-encoded and what visually connects the old proof to the new proof. **Forbidden:** free-floating unrelated icons with a center node doing nothing but pulsing.

**Deliver:** semantic legend, graph with endpoint coordinates, activation ordering, readable inactive state, first-to-next focus baton, origin/target masks.

## F75 — Typography and diagram glyphs are specific illustration parts

**Evidence:** `SOLAR@620s` uses color-coded label pills anchored to astronomical diagram elements; `BRAIN@150s` holds a title as comparative color fields enter. Source promo screenshots may use different UI fonts and are not general art rules.

**Build:** Add text only for an exact explanatory role: identification, quantity, before/after state or intentional emphasis. Define content, parent node, screen bbox, contrast region and when it enters/exits. A pill must fit legible text and attach to the actual target. If GPT owns visual asset generation in the production workflow, GPT supplies the approved typography image/alpha and exact glyphs; the compositor may animate and place, not rewrite into arbitrary UI. For physical labels, keep orientation coherent with the diagram, not necessarily perspective-tilted unless it is literally printed on a machine. **Forbidden:** adding headings, HUD marks or educational arrows as decorative filler.

**Deliver:** label inventory, character-exact text assets, anchor points, safe text bbox, timing/occlusion and permission status.

## F76 — Repeats should come from a locally defined parent generator

**Evidence:** `AI@35s` windows on projected facades, `MEMORIES@62s` branch terminals, `AI@650s` repeated heads on abstract screens and `NUCLEAR@420s` trees within terrain are fundamentally different repeated forms.

**Build:** Create `repeat_parent`, `local_axes_or_graph`, `seed_anchors`, `count_or_density_by_region`, `size_falloff`, `orientation_rule`, `exclusion_masks`, `identity_variation_bounded_by_role`, `active_subset`. Snap window repeats to wall plane, biological tips to branch graph, tree crowns to vegetation zone, face panels to stage nodes. Repeated units must belong to the mechanism or texture of their parent. For extra density, enlarge parent complexity or functional population, not random free dots. **Forbidden:** identical spacing patterns across unrelated materials or equal probability of tiny details everywhere.

**Deliver:** local generator spec and owner mask; test generation with background disabled to expose any illegal free-floating units.

## F77 — Information density must be allocated *locally* and to motion owners

**Evidence:** `MEMORIES@62s` has dense connected biological partwork; `AI@444s` pale quiet stage; `NUCLEAR@420s` many environment units but only aircraft/particles need significant continuous motion; `BRAIN@303s` concentrates action at a portal edge. “More detail equals better animation” is false.

**Build:** Split image into regions `MAIN_PROOF`, `SUPPORT`, `QUIET`, `OPTICAL_EXCEPTION`, `TRANSITION_COVER`. Give each explicit T1 essential body, T2 owned functional subparts and T3 optional repeat budget. For an asset intended to move, every part that will visibly change shape, position or depth must have a separate clean underpaint/true-alpha state or be entirely inside its parent moving plate. A large decorative static T3 world is acceptable only if it is deliberately a **held support**, not if the director needs meaningful transformations through it. **Forbidden:** tiny high-frequency details competing with a 40-pixel causal actor or a still picture pretending to be interactive merely through camera drift.

**Deliver:** region map, owner graph, active/held status and explicit removable repeat families. **Test:** play with all supporting T3 hidden; explanation must survive and the intended moving element must be conspicuous.

## F78 — Camera and representational transitions must obey a correspondence invariant

**Evidence:** `AI@377–380s` moves from an interior visual to that same content enclosed in a monitor; `NUCLEAR@271–274s` preserves an exemplar while revealing a repeated process; `SOLAR@212–215s` changes a populated shell toward a travel body; `MEMORIES@190–193s` uses a legitimate cut. No universal “always zoom” or “never cut.”

**Build:** First write the reason for entering the new explanatory world: zoom `to reveal previously hidden mechanism`, pullback `to reveal containment/context`, comparison field `to expose categories`, exemplar replication `to establish scale`, shell transformation `to change vehicle state`, cut `to switch analogies without false spatial continuity`. For continuous transforms, specify `identity that persists`, 3+ shared visible landmarks, source/target viewport matrices, camera center trajectory, extrema/overscan, transition foreground masks, fully drawn intermediate state and the exact frame each element becomes visible. For a semantic hard cut, match meaning/color rhythm and establish the new proof immediately; do **not** claim registered physical continuity. **Forbidden:** freshly generated mismatching painting popping exactly as a “zoom” ends.

**Deliver:** `OUT/MIDDLE/IN` art states, exact landmark table, master registration transforms, occluders and 60fps frame event score. **Test:** composite the middle at native resolution and alternate source/target through the swap; a visible rectangle seam or identity break invalidates the continuous move.

## F79 — Own the alpha, underpaint, parallax and offscreen drawing budget

**Evidence:** `AI@377–380s` uses a visible containing screen rim, `SOLAR@212s` capsule shell occludes inhabitants, and source full-film motion features large translated surfaces. Previous repaired leaf proof visibly failed because unrelated close paintings differed at their edges and lacked a full-cover registered occluder; this was a *process failure*, not a source-style feature.

**Build:** For each moving object produce `(a) approved composite, (b) true-alpha isolated foreground/subject with 0 outside, (c) clean exposed underpaint for every pixel it can reveal, (d) matte/occluder with real opaque region, (e) a larger master with camera-coverage beyond every output footprint, (f) registered landmarks before/after movement`. Pixel-coherent layers should be derived from an approved master by segmentation/inpainting/controlled edit when possible; independently regenerating a background and actor often causes shape/color mismatches. For full-cover swap, prove the occluder at the swap frames has **actual alpha coverage 100% of the needed viewport**, not merely a verbal instruction. **Forbidden:** painting a “transition plate” that has a transparent hole and hoping it hides everything.

**Deliver:** manifest of dimensions, alpha extrema, unique image hash, source master id, mask ownership, transform fit, camera footprint and seam test results.

## F80 — The first provider request must actually contain the methods and unlike native pixels

**Evidence of failure:** an unrelated earlier unfamiliar script yielded detailed painterly humans and built interiors despite a claimed visual-style skill; the first provider call had not reliably enforced source-conditioned construction. Source images named in prose do not count as image attachments, and a second polished result is not retroactive first-pass success.

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

**Data-vs-observation boundary:** this method body is not source-native numerical ground truth. It is a falsifiable procedure derived from visible cross-film contrasts. The supplied MP4s cannot prove which layer names, curve parameters or software packages the real studio used; preserve that distinction while creating precise art instructions.
