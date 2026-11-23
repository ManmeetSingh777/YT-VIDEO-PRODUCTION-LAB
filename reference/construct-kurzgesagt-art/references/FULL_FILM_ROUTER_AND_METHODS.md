# F20–F36: whole-film scene-medium router and molecular construction subguide

This document is an extension, **not a replacement**, of F01–F19 in `STYLE_OPERATIONS.md` and the original 15-interval `SOURCE_DERIVED_CONSTRUCTION.md`. It uses the whole-duration five-film timeline survey and 22 additional full-HD native temporal strips described in `FULL_FILM_EVIDENCE.md`. The rules below are conditional design procedures to apply to **unfamiliar scripts**, not instructions to copy an original shot. Each has (a) trigger, (b) producing operations in drawing/animation terms, (c) pass checks, (d) countercondition. Dimensions are **per-subject variables**, because the sources disprove one master line width, color or anatomy ratio. Preserve `SOURCE_OBSERVED` and `METHOD_CANDIDATE` separately.

## F20 — Route *each beat* to a visual medium; permit nesting

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

## F21 — A panel, glass shell or memory window is a layered optical *machine*

**Trigger:** any picture-within-picture, visor, holographic panel, transparent vessel, bubble, memory orb, telescope/phone display or cutaway revealing an alternate world.

**Construct in this fixed stack (back to front):**

1. Exterior world or diagram behind the device, uninterrupted beyond the projected footprint.
2. Optional cast/contact shadow or background separation field for the container.
3. **Inner viewport mask** (`M_in`) whose shape is a designed lens/device aperture; draw its actual contained subject as a **complete scene** with its own depth: background/horizon → back props → focal entities → front props → local atmosphere. Reproject entire inner scene under that mask; do not simply paste one floating icon.
4. Rim or near wall material whose thickness/near-far planes extend around `M_in`; its back-facing portion is below inner content, near-facing edge above it.
5. Bounded transparency tint and possible refraction/compression **inside** `M_in`; if the shell is translucent, carry a second alpha/reflectance mask (not global haze).
6. Specular shapes aligned to a plausible shared surface normal, clipped to the shell rather than attached to actor eyes or background.
7. Occluders, hand-held contacts, highlights and foreground actor interaction.

For an animated portal, make `M_in(t)` a path with at least start, middle and end contours. Underlying content either has its own movement/camera or is projected consistently through the changing mask; decide explicitly. A snap-to-picture cut requires actual replacement images on both sides. Never grow the complete contained world by scaling a cutout while forgetting near-rim occlusion. `MEMORIES@464,465,466 N` shows a distorted skull-shell boundary progressively resolving a full multi-actor scene; `AI@250–252 N` shows exploded panel pieces with *separate planes* moving about a central core. These are unlike sources for the same mask/part/occlusion grammar.

**Pass check:** turn off rim and specular layers: an intact composition is still visible in the aperture. Turn off the inner viewport: an intelligible exterior shell and thickness remain. Render a crossing limb; correct near rim must occlude it where appropriate.

## F22 — Rebuild day/night as registered drawings, not a color-grade

**Trigger:** location continuity across time of day/weather/lighting changes. Source `NUCLEAR@384,387,390 N` demonstrates more than hue shift.

**Operation:** keep a `world_layout_master` (roof footprint, wall silhouette, road centerline, window layout, vegetation masses, foreground screen geometry). Create state overlays with distinct roles:

| Component | Day/twilight state | Night state |
| --- | --- | --- |
| Sky/distant relief | separate sky ramp, sun/cloud placement, ambient mountains | deep blue sky bands, night body/moon, darker distance, locally readable silhouette |
| Roof and exposed planes | ambient diffuse top planes; color-local edge accents | high-contrast **cyan roof-edge light** where justified, dark side planes |
| Windows | low-emission wall openings | individually chosen, small warm-yellow lit windows with a local halo; neighboring windows can remain dark |
| Street fixtures | silhouette/light housings | explicit trapezoid/cone masks that begin under lamp head; intensity concentrated near source and path contact |
| Ground and traffic | ground plane lit by ambient; vehicles preserve identity colors | road/background darkened, small car silhouettes/reflectance adapted; glowing lights where actually drawn |
| Foreground | distinct nearer foliage shapes or overlapping roof/road | near foliage may drop toward deep blue/dark, still retaining silhouettes |

Construct both key artworks with the **same stable geometry identifiers** before interpolating. The source's transition is effectively relighting and multiple illustration-state substitution; an all-layer HSV offset cannot illuminate only selected windows, remove a sun, add a moon, create cones or change edge emissions. For a sunrise transition, stagger sky → distant terrain → building planes → fixtures → small windows/vehicles rather than crossfading every surface with identical timing. The precise stagger and easing require denser motion witnesses; do not present these as measured source values.

**Pass check:** fixed perspective anchors coincide across states and at least three independent emitter classes (e.g. sky, windows, lamps) change locally. The night variant still reads as the same site in grayscale silhouette.

## F23 — Define *perception effects* as registered compositing passes

**Trigger:** a single depicted arrangement seen through changing mental/sensorial filters; `BRAIN@1.6,3.0,4.4 N` preserves cup, plant, spoon, sleeves and phone positions while first adding many eyes and later a desaturated/film-grain view.

**Operation:** retain clean master art with named entity layers. Add each effect as a separately keyed state, never a permanent style norm:

1. Symbol-attachment state: generate variable icons/eyes **on meaningful surfaces and in space**, with independent masks and believable local overlap. Place them at selected contact geometry; no independent random scatter.
2. Monochrome state: map world colors to luminance (or a deliberately chosen gray transfer) but preserve selected semantic accents as controlled exceptions; apply grain/noise in screen space above filled image, not noise painted into each object.
3. Optical focus state: preserve a sharp region/object defined by view intent; blur screen-space background/foreground with differentiated kernels or depth mask. Do not globally soften every edge.
4. Color-remapping state: use a lookup matrix/role map on stable object masks, so each surface stays identifiable through treatment.

Model event edges as `MASTER → EFFECT_A → MASTER or EFFECT_B`; define whether symbol actors persist, retract or cut. Use explicit `effect_owner` and range; no effect leaks into the next normal scene. **Check:** geometrically corresponding source points remain within tolerance after color changes; remove any effect pass and clean master artwork is still complete.

## F24 — Dense biological fields are procedurally authored, *not random scatter*

**Trigger:** neurons, spores, microbiome, stars, city populations, mesh maps, dots of synthetic data, large-scale repeated organisms. `MEMORIES@62–69,89–99 N/A` uses enormous colored small structures arranged as distinct yellow functional clusters within a multicolored population; `AI@650–655 A` uses repeated symbol characters in perspective; these are structurally different fields.

**Operation:**

- Specify `population_unit` as actual connected geometry: for neurons e.g. soma + 2–6 branched paths + termini (illustrative, not an anatomy law); for stars light-pixel with optional core/halo; for agents icon body/contact plate.
- Define **distribution field** by region masks, deterministic seeded points and density bands. Build cluster fields as masks with high-persistence coherent shapes; do not independently sample every pixel color or make uniformly spaced rows unless source demands a grid.
- Give each unit a role (`background_population`, `cluster_member`, `activated_member`, `foreground_exemplar`), each with different size/opacity/contrast and allowed details.
- Compute containment. Every terminal must connect to its soma/parent; each signal has source, path and destination, even if dozens of members coexist. Use a small library of archetypes with rotation/scale/branch variance; prevent exact clones being obvious along a row.
- Draw network underglow on the **activated path mask**, then sharp bright centerlines and endpoints. Do not halo every background neuron's full body; activation must be causally discriminable.
- Keep focal paths visible through density by lowering contrast of background members and inserting local clear gaps or highlighted clusters (not merely adding a thick dark outline).

**Check:** (1) crop one typical unit and trace connections; (2) blur thumbnail to 20% and verify cluster topology remains; (3) toggle activation and ensure the difference is on an actual connected branch or selected mass; (4) if content requires a true count, count/proportion must be encoded honestly rather than using the number as a decoration.

## F25 — Scientific close-ups must encode physical interaction *direction*

**Trigger:** membranes, interfaces, cellular transport, insect wings, skin anatomy, sensory organs, mechanical joints, electromagnetic field crossings, linked computer modules. Source `MEMORIES@74,75,76 N` shows two opposed nested membrane silhouettes, green vesicles entirely contained in the near tip, many emitted small warm particles located in the gap, short receptor structures attached to the far membrane, and a bright signal routed along the parent body.

**Operation:** draw a **causal topology graph** before shapes. For a generic two-part exchange mechanism, define emitter surface `E`, receiver surface `R`, interstitial region `G`, carriers `P_i`, attached mechanisms `A_j`, and active flow path `Q`. Draw outer E/R shapes first, their material-local inset planes second, attach A to named parent surfaces, then P in G. Choose spacing and count according to the actual new process; don't copy the synapse's green circles or orange trilobed transmitters into unrelated topics. Illuminate `Q` only while state `active`; animate emitted particles from E toward R along paths that actually cross G. The new script may instead require mechanical contact, diffusion, flow, reaction, pressure, or data packets: replace the causal model but retain topology, meaningful attachments and state change.

**Pass check:** each small mark answers one of `what surface is it part of`, `what is being transferred`, `where does it originate`, `what is its destination`. If the answer is none, remove it. Emit only region-attached glow; use an empty gap to preserve transfer legibility.

## F26 — Maps and spatial diagrams need *three distinct masks*

**Trigger:** epidemiology spread, species migration, territory/country transitions, population movement, future land use, trade routes; `NUCLEAR@296–298 N`, other map sequences in NUCLEAR, AI geography/habitat in early film.

**Operation:** separate (1) land/terrain outline and coastline mask, (2) data-membership or threat intensity mask and (3) travel/flow graph. Coast/terrain stays geographically or illustratively coherent while data fills/labels/nodes change. Draw any river as a separate continuous path with inside/outside bank relationships, not disconnected blue strokes; forests as clustered contours whose density follows terrain/zoom. Anchored labels must bind to geographic node, not screen coordinate, unless explicitly specified as a HUD. For spread, animate boundary/fill mask expansion with defined origin and direction, then layer precise significant routes. For containment/intervention, reduce *data* intensity without erasing the underlying map.

**Check:** hide data mask: geography still intelligible. Hide geography: flow graph still points from named origin to destination. Never use a virus icon or arbitrary dots to make an unrelated map "Kurzgesagt-like".

## F27 — Schematic graphs are authored *systems with reveal states*

**Trigger:** neural network, timeline, comparator, flowchart, program, circuit, machine diagnostics, growth curve, ability scale, distributed decision. See `AI@356–365 N/A`, `AI@258–278 A`, `SOLAR@450–455 A`, `MEMORIES@140–145 A`.

**Operation:** first create a machine-readable graph: vertices with category, spatial order and label; typed directed/undirected edges; edge endpoints tied to vertices; axes with units and meaningful origin; reveal/event ordering. Only then choose shapes and colors for categories. Lay out graph according to relation: layers for sequence, tree for branching, coordinates for measurement, rings for cycles. Make a complete static terminal-state diagram, then identify successive editable states (add node, light one path, collapse/expand subgraph, move callout). Color change must refer to a changed category or state, never random visual variation. Every line should terminate on a node, border, axis or an explicit offscreen continuation; connect lines under node fills if occluded.

**Check:** ask what each cyan/orange/violet segment means. If no precise answer in script, remove or neutralize it. Graph must be legible as a topology even with ornamental background hidden; do not convert a computer-chip or cell into an all-purpose circle-with-tentacles mascot.

## F28 — Historical or technical recreations have *era-specific mechanical topology*

**Trigger:** unfamiliar historical setting, old computer, equipment evolution, instruments, aircraft, factory, city technology. `AI@140–156 A`, `AI@222–247 A`, `AI@275–320 A` demonstrates alternate eras of machinery.

**Operation:** write a short `design_truth_table`: `device_period`, `working principle`, `chassis/body silhouette`, `number and placement of controls/actuators`, `functional attachment`, `human operating contact`, `projection/view`. Draw the correct period-specific outer shape before applying source-derived fill/shading geometry. A new 1880s printing press cannot look like a neon microchip; an antique radio cannot use today's touchscreen. Use high-value physical identifiers: cable, hinge, feeder, belt, propeller, knob/slot where appropriate. Only then simplify into authored large color masses and 1–3 localized functional shadow families. If device cannot be understood without random labels, reconstruct silhouette and mechanism.

**Check:** remove text/period caption; can a viewer identify machine's era/type from actual silhouettes and control attachment? If not, render accuracy fail regardless of palette.

## F29 — Compare futures/options as complete *parallel states*

**Trigger:** outcome comparison, before/after, possible decisions, threat vs hopeful case. `AI@495–506 A` contrasts whole urban systems with consistent split division; `BRAIN@300–390 A` tracks alternative physical body trajectories.

**Operation:** establish one comparison coordinate system: same base world geometry or declared intentional difference, same camera horizon/scale, separation path/mask, and a `difference ledger` saying exactly what changes (actors, structures, emissions, crop, ground, text, light). Compose **both** sides as complete environments, not a left side of good icons and right side of bad icons. If the comparison is alternative time paths, make full pose drawings on separate layers with support points preserved; tint ghost states according to temporal role and leave focal current state full contrast. Transition ownership follows narration beat and can reveal one world beside the other, restore shared anchors or change separator geometry. No absolute moral color coding: specific scenes choose local value/contrast roles.

**Check:** cover the divider and subtitles; each side must still contain enough geometry to be a believable whole result. When compared, changes must match the scripted variable; unrequested changes are leaks.

## F30 — Create a multi-state character library before physical animation

**Trigger:** human, animal, creature, mascot or machine that moves, emotes, turns, grips or contacts objects. `BRAIN@205–275,300–390 A`, `MEMORIES@640–675 A`, `AI@842–845 N` show real view/pose changes; earlier detailed F05–F07 remain primary.

**Procedure:** create a canonical model record `identity_id` with unique feature geometry (relative head/torso shape, body partition, facial landmark coordinates, appendage count, costume material regions). Draft view state keys `front`, `3quarter_L`, `profile_L`, `back_3quarter`, then required action states `stand`, `reach`, `grip`, `crouch`, `turn`, `extreme_expression`. For each key, **redraw or reproject the visible silhouette and all occluded planes**, not merely shift pupils. Eyes need view-aware white/iris/pupil masking; hands need actual thumb/finger object wrap; feet/limbs need support-plane contact; cloth seams follow body. Define rigid transforms only for truly rigid art; a turn changes what is revealed/hidden and requires alternative drawings.

**Check:** shuffle poses; all must look like one character when viewed alone. Draw four neutral matching silhouettes with color off and ensure distinctive anatomy survives. An illustrated six-pose sheet is **not an animated shot**; confirm real temporal coherence separately.

## F31 — Motion needs *owner-specific* key states, not global ease-only language

**Trigger:** action, simultaneous animation, character movement, camera, changing diagrams, optical transition. This rule does not invent measured proprietary keyframes.

1. Build scene DAG of time events: `narrative_beat` → `actor action / instrument state / camera / labels / effect` dependencies. Each changing object has its own `state_id`, parent transform, anchor points, visibility and hold range.
2. Mark **contacts** as hard constraints in each key state: grasp point adheres to prop; planted foot to ground; pendulum to pivot; particle path to emitter/receiver; labels to chart. Use forward kinematics only where appropriate. Hand/prop contact cannot be treated as two independent easing curves with drift.
3. For deforming objects, make distinct hand-drawn silhouettes at structural extremes (anticipate/contact/recover or approach/impact/depart). Interpolate only in intervals where topology/view remains valid. If view occlusion flips, switch art or create replacement with cross-layer masks.
4. Split time into foreground action, diagram reveal, camera and accent effects; protect required narration readability with holds. Motion smear/trail is a **secondary layer** derived from actual pose path, never a substitute for drawing inbetween states.
5. Review slow/normal speed and every contact/reveal boundary. Use at least 6–12 fps proof frames for a *test* where 60 fps final is planned; the frame-rate figure is a test sampling policy, **not** an observed source frame production rate.

**Check:** sample at least first/contact/peak/end, plus a subsecond strip across every occlusion swap. Observe whether motion conveys correct mechanism with narration muted. Mark unverified 60-fps easing as open until truly observed at full-rate.

## F32 — Effects are time-bounded images with their own color/geometry ownership

**Trigger:** explosion, whiteout, electrical/brain activation, plasma glow, motion streak, optical blurring, radial shock, portal opening. Distinct sources `SOLAR@401–408 N/A` (screen-filling white exposure followed by staged reaction), `BRAIN@1.6–4.4 N` (perception passes), `MEMORIES@75 N` (locally attached active signal), `AI@744–748 A` (orange high-energy machine).

**Operation:** choose one of four effect classes instead of piling generic glows:

- `surface_emission`: bright core path/shape clipped inside owner; radius-limited glow outside it; optional nearby color bounce on facing objects.
- `volumetric_source`: centered luminous mass plus *directed* rays/particles following lens/source geometry; masks must respect occluders.
- `global_exposure`: explicit white/colored exposure field over camera with ramp-in/out, protects silhouette readability only when scene-specific meaning calls for it. Create proper reaction/return state art after, not just the pre-event image.
- `camera_perception`: non-diegetic blur, grain, chromatic shift or scanline constrained to an optical layer/viewport.

Only add particle classes with origin/trajectory/size hierarchy and timed dissipation. Reject evenly scattered background stars as "explosion". Distinguish temporary screen exposure from permanent palette change, particularly after camera reveal.

**Check:** disable effect layer: base world remains complete; re-enable and check effect's physical or symbolic source is visible or consciously offscreen. No unintended glow on distant unrelated surfaces.

## F33 — Density and abstraction are scoped by *view depth and task*, not adjective

**Trigger:** every scene after medium routing. Cross-film contradiction: `AI@35–36 A` has dense repeating oblique city blocks, `AI@105–133 A` has a nearly empty classification plinth, `MEMORIES@62–69 A` uses thousands of microcomponents, `BRAIN@1.6 N` has many readable POV objects.

Assign each planned layer a `detail_owner`:

- `focal_structural`: enough discrete parts to explain the target (anatomy, controls, contacts). Use macro inset when necessary.
- `focal_expression`: larger unoccluded facial/gesture masses, fewer secondary marks around eye/mouth/hands.
- `midground_repetition`: identifiable class silhouettes with internal variation in grouping/scale; no high-contrast detail competing with focal actor.
- `far_environment`: connected broad silhouettes, atmospheric/value separation; intentionally fewer features per object.
- `scientific_population`: legitimately massive count/texture under a hierarchy of small-unit, cluster, and active path scales, as F24.

Allocate rendering budget by function: increase a part count only where it conveys mechanism, texture/biological structure, material or scale; decrease to preserve action/diagram read. Do not enforce universal 70/20/10, one stroke width, one highlight count, one corner radius, or one palette. At thumbnail size, inspect structural priorities; at full size, inspect attachment and edge consistency. All small marks must belong to a named surface, population field, or effect.

## F34 — Physical geography, procedural patterns and materials use different generators

**Trigger:** forest, coral, rock, ocean, buildings, glass, metal, electronics, starfield, plume. Decide generator from **physical construction family**, not a generic texture prompt.

| Family | Generate geometry from | Preserve |
| --- | --- | --- |
| Forest/foliage | trunk or base branch hierarchy; two or more silhouette depth bands; leaves as mass-clumps nested under branches | rooted/stem connection, foreground occlusion, horizon separation |
| Rock/terrain | master profile, strata/plane cuts, attached material-local color facets and boulders supported by ground | shared normals and believable terrain contact |
| Architecture | ground footprint, perspective axes, structural slabs, glazing/recesses, doors/windows on coherent planes | all openings attached to the same facade/projective frame |
| Metal/glass machine | functional chassis → joint/support → recessed panels/controls → local reflectance and emission | actuator topology, exactly bounded reflective surfaces |
| Ocean/space | region/substrate + depth-scaled coherent bodies, waves/cloud/star layers grouped in depth and purpose | luminosity/depth region hierarchy, no uniform random confetti |
| Biological macro | body shell/membrane → inset color planes → anatomical structures → functional particles/fluids | parent masks, correct attachment, causal direction |

F01/F08/F09/F11/F12/F13 contain more family-specific construction; use them. The table is a router to those methods, not permission to substitute arbitrary shape stamps for unknown anatomy.

## F35 — Make storyboard *transitions* carry one conserved visual invariant

**Trigger:** move between explanatory modes on unfamiliar narration, e.g. person → brain process → planetary comparison; never borrow the reference films' sequence.

**Before drawing:** choose a conserved identity/relationship that survives cut: same subject silhouette, a causal moving node, a spatial direction, a color-role association, a lens outline, or a numeric scale marker. Then choose one transition operation:

- `match_move`: the tracked anchor maintains screen trajectory while world/diagram behind it changes.
- `mask_reveal`: bounded lens/screen/domain mask opens/closes to reveal a complete successor composition.
- `part_to_whole`: a local structural detail moves/zooms into a correctly reprojected parent system; crosscut or redraw when perspective changes.
- `registered_world_relight`: same layout changes environment state as F22.
- `causal_graph_expand`: one highlighted node/path seeds new connected graph reveal.
- `exposure_or_impulse`: sudden full-field effect masks a justified large state jump, then successor art appears.

**Deliverable** for each: transition start/end complete stills, invariant anchor coordinates, layer visibility/mask state, camera path, hold frame/time; if footage source is only 1 Hz, never claim exact source easing. Test by pausing one frame before/after: both pictures must be complete and the invariant recognizable.

## F36 — Source-to-new-script skill must compile into enforceable artifacts

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

## Hard failure matrix for whole-film transfer

| Observed error in novel output | Broken construction decision | Repair operation |
| --- | --- | --- |
| Every scene neon blue/purple | F20/F33 scene/medium routing absent | classify beat; remap only local material/light roles; compare NUCLEAR farm vs AI circuitry vs MEMORIES brain |
| Abstract dots over all backgrounds | F24/F34 distribution without parent | define domain mask, unit archetype, contact and role; redraw with different near/far densities |
| Phone/window has a pasted floating scene | F21 inner scene/rim plane absent | build viewport+front/back shell, separate inner camera; validate rim occlusion |
| Night is simply darker day | F22 world state layers missing | redraw sky/lights/windows/road/vehicles as registered local states |
| Macro microscope mechanism is confetti | F25 transfer topology unknown | name emitter/receiver/carrier/attachment/path; remove unassigned marks |
| Graph looks pretty but explains nothing | F27 node/edge/label data absent | derive graph from claims before rendering, then reveal typed states |
| Historical machine looks futuristic | F28 era truth table absent | build accurate period-specific chassis/controls first |
| Character changes face across views | F30 canonical identity/alternate drawings missing | rebuild model sheet and all view-specific occlusions |
| Animated arm detaches from object | F31 joint/contact dependency missing | parent prop/hand on common contact anchor across key states |
| Bright flash used for every cut | F32/F35 effect purpose absent | choose transition invariant, remove generic exposure for unrelated beats |
| Output copies recognizable reference actor/shot | Content-style separation failed | retain only style methods, replace original identity/composition, retest unfamiliar brief |
| Source-looking still, but no proof motion works | Static-to-video proof gap | produce original timed clip + source-correct contact/mask states + blind audit |

## Qualification boundary

These detailed procedures increase reconstruction control and guide image prompts, visual asset decomposition, animation key-state plans and an external coding agent. They are still **methods derived from samples**. A complete one-second full-film survey with targeted 1080p witnesses is not equivalent to the animator's source files. Before saying "exact creator style for arbitrary scripts", demand independently generated original multi-shot moving sequences, a held-out script, identity and anatomy continuity tests, real renderer artifacts/receipts, and blinded critique. If those tests are not run, label the method candidacy and the untested behaviors explicitly.
