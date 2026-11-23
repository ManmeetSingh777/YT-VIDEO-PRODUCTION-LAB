# F37–F50: world-system constructor, abstract visual worlds and environmental partwork

> **Scope:** These are visual-construction methods for entirely new subjects. They do not teach the plots, frame sequences, character identities, props, or editing decisions of the reference films. “Source” refers to pixels observed at named times; a proposed generalization is marked **METHOD_CANDIDATE**. A visual test must establish whether it survives unfamiliar content. The reference frames are copyright-bearing **STYLE-ONLY** witnesses, not assets to trace into new art.

## Evidence and confidence before constructing

The prior guide already has F01–F36, including F20 (visual medium router), F21 (nested viewport), F24 (biological density), F27 (graphs), F33 (density by view), and F34 (different generators). **This document supplies missing geometric producers and environment/world sub-families rather than replacing those rules.** It is grounded in full-duration chronological review of all five films, 85 newly targeted source-native stills, and a separate *How to Make a Kurzgesagt Video in 1200 Hours* opening-study **outside the five-film total**. The five-film every-encoded-frame numerical sweep is a change/density/color survey at 160×90; it does **not** represent human semantic inspection of 242,095 complete 1920×1080 frames. See `EVERY_FRAME_TECHNICAL_AUDIT.md` for measured scope.

Abbreviations: `AI`, `BRAIN`, `MEMORIES`, `NUCLEAR`, `SOLAR` correspond to the five films listed in `FULL_FILM_SOURCE_REGISTRY.json`; `VOLCANO` is the **supplementary** 6m47s production video, not one of the five. `AI@514` means an observed image at approximately 514 seconds into the AI film. All numbers labeled `INITIAL_ART_DIRECTION_RANGE` are *deliberate starting constraints for the stated world class*, **not** measured universal house-style constants; modify when the new content/zoom fails. Pixel-ratio observations are single-image measurements, not false population statistics.

### Source contrasts that force different world generators

| Observed contrast | Visible source-specific fact | Transferable producer; reject this false universal |
| --- | --- | --- |
| `AI@35` versus `AI@874` | Both depict built environments; the city is oblique, sunlit, hundreds of repeated windows and roofs, with buildings covering almost the entire picture. The corridor is axial, near-monochrome dark with blue doorway slabs and a locally lit deep center. | Both use structural parts + projection + occlusion, but **different** projection, repetition, value and detail budgets. Never require every location to be vivid or crowded. |
| `AI@514` versus `AI@444` | One uses a cyan glass-like cuboid with visible corner edges, attached tube sockets and a dark surrounding field; the other has tiny subject surrounded by multiple angled cyan information panes in a nearly white environment. | A contained technological subject need not imply the same exposure, view, shape or opacity. Choose emitter and receiver relationships first. |
| `AI@777` versus `MEMORIES@62` | One has a floor/ceiling perspective grid, luminous organic tendrils and a single central silhouette. The other is almost full-frame branching material with many thousands of multicolored terminals and no ground horizon. | A “complex abstract world” can be **spatial stage** or **topological material field**. A generic neon grid is wrong for biological networks. |
| `AI@856` versus `VOLCANO@15.2` | The former is a complete oblique techno-ecology: central luminous cube on faceted pedestal, projecting bands, aqueduct-like built structures, mounted panels, repeated trees, machines. The latter is an illustrated forest clearing whose near foliage silhouettes frame a small central creature and path. | Both are constructed from a world graph, near/mid/far overlap and role-owned details, but one uses modular machine repetition, the other irregular botanical massing and a strong aperture. |
| `AI@35` versus `NUCLEAR@296` | Building modules follow an oblique block grid; the tropical map-like terrain groups trees, coast contours, aircraft and a continuous shore in a top-down oblique illustration. | Do not replace grounded geography with urban roof-face repetition. Topology changes with substrate. |
| `AI@436`, `AI@444`, `AI@514` | A grid-stage uses convergent floor/ceiling lines and empty volume; an information theatre has curved rows of distinct transparent panes; a cube is a closed six-faced solid with tube penetrations. | “Digital realm” is a family of **different geometry classes**, not one generic ring/hexagon/brain screen. |
| `SOLAR@20,104,560` | Named distant systems are represented by nested luminous markers, arcs, ellipses and an annotated spatial frame; astrophysical space stays structurally unlike terrestrial architecture. | Route astronomical distance/scale as orbit, hierarchy and measurement, not buildings or invented AI circuitry. |

The skill owner must stop using a given source's *content noun* as shorthand for its production rule. Say “perspective-bound modular roof generator” rather than “copy the city”; “layered foliage aperture” rather than “copy the forest”; “separately masked light-emitting enclosed volume” rather than “draw that AI cube.”

## F37 — Construct a *world definition*, not an adjective or a backdrop

**Trigger:** any script requires a place, inner world, simulation, data realm, physical facility, ecology, cosmos, organism interior or other environment. Execute after F20 and **before** generating any pixels.

**Input fields** (each must resolve to a drawable instruction):

1. `world_purpose`: one clause naming the viewer's required inference without reference-film nouns; e.g. “many local sensors share the same underground aquifer.”
2. `world_class`: select one primary `SCENIC_NATURAL`, `SCENIC_BUILT`, `SCENIC_INTERIOR`, `COSMIC_SCALE`, `BIOLOGICAL_MICRO`, `SCHEMATIC_NETWORK`, `ABSTRACT_STAGE`, `ABSTRACT_VOLUME`, `NESTED_HABITAT`, `PARALLEL_WORLDS`. A mixed world contains **typed children**, not a made-up hybrid one-size preset.
3. `substrate`: actual ground/volume/plane supporting the scene. Named polygon, circle/ellipsoid, three-dimensional volume, retinal/membrane plane, geographic contour, black/deep field or HUD; no silent default horizon.
4. `projection`: one explicit map from world coordinates to image coordinates: side-on layered 2D, top-down/top-oblique, oblique 2.5D with visible roof and side faces, vanishing-point perspective, screen-space schematic, parent-surface-local, or different maps in masked viewports.
5. `physical_or_relational_topology`: parent-child/connected graph of objects, attachment, route and contact. **Every major object must have an actual edge in the graph**: anchored to substrate, inside vessel, projected from beam source, connected by cable, mounted on wall, or defined as intentionally free-floating.
6. `world_visual_grammar`: background material; 3–6 big spatial masses or regions; focal silhouette and supporting population; near/mid/far occlusion roles; actual material split rules; local lighting emitters; procedural repeat units; intentional vacant paths; detail exclusions.
7. `world_state`: for changes, define stable layout IDs and complete alternate art, not global hue modification.

**Output artifact:** `WORLD_SYSTEM_SPEC` as a data structure with `world_class`, `coord_system`, `parts`, `relationships`, `materials`, `palette_roles`, `layers`, `functional_detail_generators`, `visibility_masks`, `states`, `witnesses` and `failure_tests`.

**Fail if:** a proposed world can be changed to a completely different setting by replacing only nouns in a prompt while keeping the same list of vague “glowing, beautiful, atmospheric, intricate” adjectives. The world constructor must name actual contours, part relationships and layers.

**Countercondition:** `MEMORIES@62` has no realistic horizon and `AI@874` suppresses decoration. Do not enforce scenic landscape grammar on abstract biological material or corridors.

## F38 — Pick a *projection grammar* and enforce it down to small parts

**Trigger:** any scene has depth, multiple scale levels, a field of repeating objects, or a floating plane in 2D/3D-like space.

**A. Layered illustration (front/side mixed, no vanishing point)**

- Draw 4 independently movable depth collections: far color/sky, distant silhouettes, subject-support plane, near occluders. Relative size is chosen from semantic importance, not focal length simulation.
- Each object keeps a local 2D construction plane. Behind / in front is encoded by the **overlap graph**; do not put a light soft shadow behind every part indiscriminately.
- For high-organic environments, silhouette groups at front may cover 20–50% of the screen *when the opening between them is the important action area* (`INITIAL_ART_DIRECTION_RANGE`, compare `VOLCANO@15.2`). If the script needs a wide establishing vista, no mandatory foliage frame.

**B. Oblique 2.5D architectural illustration (`AI@35,856`)**

- Define a global top-plane orientation and two consistent horizontal axis projections. A typical roof is a quadrilateral/parallelogram with **two** adjacent vertical wall planes; vertical building edges remain parallel in the chosen orthographic-like approximation. Small structures use the same axis basis as the tall ones.
- For each new building/column, generate `footprint_polygon`, `top_surface`, `wall_A`, `wall_B`, `roof_cap_or_parapet`, `base/contact`, then windows, doors, vents and trees **only on the appropriate supporting face**.
- Every background building shares the same roof projection family; changing wall height must not tilt a roof differently. Front structures occlude rear bases. Roads or channels are coherent exposed ribbons between actual blocks, never bright pasted lines across wall faces.
- Author distinct *architectural families* and their repeated face grammar rather than copying a singular skyline. In `AI@35` the roofs often contain a recessed top plane or shallow cap, wall faces have different value/hue, and windows obey each wall's face orientation. A random matrix of rectangles without faces fails.

**C. Axial deep-space or interior perspective (`AI@555,874`)**

- Establish vanishing-point or convergent-band target. Draw primary floor/ceiling/wall/door volume first; extrude door slabs and pillars with front, side and inner-recess planes before drawing interface lights.
- Repeat technology racks/arches at receding intervals; farther instances become smaller and nearer together toward convergence. Keep control panels/machines on surfaces with their own projection. Use foreground near-dark walls as framing masses when depth is the subject.
- For `AI@874`, the bright far doorway, cyan side-wall light and reflecting floor occupy distinct local regions while the giant near doors stay almost black. Dark is an authored material region with purposeful silhouettes, **not a globally lowered exposure filter**.

**D. Diagram or biological topology (`MEMORIES@62,542`; `AI@356`)**

- Use a 2D coordinate system whose axes encode the graph or function, not a pseudo camera. Nodes attach to parent branches and edges to actual endpoints. Repeat units according to a density field, not perspective unless explicitly depicting depth.
- For one large biological form, construct outer/anatomical masks and then branch paths *inside* them, with the microscopic subdetail constrained to those masks.

**E. Multi-coordinate window/volume (`AI@250,444,514`; `MEMORIES@465`)**

- Give exterior/inner world their own coordinates. Define visible bounds, mask and border thickness; order the **back surface → inner scene → near rim → specular**.
- A hologram can consist of multiple floating angled planes but may not use the same projection for every panel: panels facing screen are wide, side panels have compressed width and visible top/side border; panels farther back tend to reduce contrast.

**Pass check:** remove all content and annotate structural axes over the final still. An object whose surface axes disagree with substrate is a repair target, not a creative license. In a very stylized world, intentional mixed view must be declared as a *nested* child system.

## F39 — Build *living natural environments* from functional, occluding plant systems

**Trigger:** forest, jungle, park, reef, wetland, underground root field, alien ecosystem, or vegetation inside a built world. Source contrasts: `VOLCANO@15.2,15.9`, `NUCLEAR@296`, `AI@72`, `AI@856`, `MEMORIES@18`.

**Construction algorithm:**

1. Lay down a navigable `ground_or_water_mask` with 1–3 broad contour families. Name a continuous path/shore/trench if present; a green blanket with unrelated stickers is not a place.
2. Place 3–7 **macro vegetation masses** across far, mid, near layers according to the composition. Define each mass's screen polygon and which focal object it can occlude; make a **view aperture** if the audience must see a character or mechanism through it.
3. Each tree is a linked part graph: rooted trunk/major limb → 2–5 secondary branch groups → crown sub-masses → terminal leaf lobes. No floating treetop disconnected from its branch. The numbers are starting sketch complexity, not source-universal species anatomy; genuinely distinct species may require entirely different structures.
4. Generate crown silhouettes with grouped overlapping lobes, not independent pixels. Add a small set of *interior large patches* on each crown to imply plane/light variation. Near foliage can contain clipped leaves and broad dark foreground shadows; distant foliage can collapse to fewer lobes and one lower-value fill.
5. Introduce species-like variation across a row: at least three different width/height ratios or leaf groupings for a high-density tree population; avoid exact stamp repetition unless the map has a deliberate symbol system.
6. Add small organisms, fruits, machines or artifacts **only after** the terrain/crown/branch structure works at thumbnail; attach each to a branch, path, ground, nest, water or its own explicit support. `VOLCANO@15.2` achieves density with trees, bird shapes and layered vegetation while the small figure stays in an open central patch.
7. Define **foreground occluder masks** separately from back vegetation so a character can pass behind the leaves or in front of a trunk on different frames. Protect path continuity for a new action.
8. For a canopy repeating across landscape (`NUCLEAR@296`), use **cluster masks**: broad regions of similar foliage silhouettes interrupted by physically motivated water, rocks, open terrain and human infrastructure. The tree population should be spatially correlated to its ecology, not white-noise positions.

**Conditional color treatment:** a forest's near foliage may be 1–3 low-value blue/teal/green masses while its central atmospheric opening is bright cyan (`VOLCANO@15.2`); a topical map forest may be bright, distributed green with a clear light-blue coast (`NUCLEAR@296`). Either choice should follow the world lighting and viewer path; neither is a fixed brand color.

**Submerged/aquatic exception (`MEMORIES@18`, `AI@44`, `NUCLEAR@296` as unlike water/terrain cases):** do not place dry-forest tree symbols below a featureless blue gradient. Build one continuous `water_volume` with distinct far/mid/near depth masks; a solid seabed/ravine substrate and rock contacts; functional plumes/currents as bounded *regions of liquid* with direction/source instead of unowned fog; rooted coral/sponges/sea grass as species-dependent trunks, branching fans or tube clusters; complete swimming organism silhouettes at a size that matches their depth. Near coral masses may occlude cave rock and the edge of a scientific structure, but distant life should reduce to small family-specific groups. If a glass habitat is present, the interior has separate atmosphere/object projection and optical near rim under F44/F48. Hydrothermal or mineral flow must begin at an actual vent/source and only go toward destinations the new script justifies. **Pass:** hide water tint/plumes and verify rock ecology + support geometry; hide coral and see still-continuous seabed; trace any tube from actual source to receiving chamber. Reuse the *parent-bound detail* and material rules, not the user's source film's specific marine organisms.

**Pass checks:** (a) disable small leaf accents: canopy, trunk, route and support hierarchy remain readable; (b) disable foreground foliage: the true unobscured map/character exists under it; (c) trace any showcased branch to a trunk; (d) render at 10% size and verify a meaningful area of controlled negative space survives around subject.

**Reject:** generic circle-tree stamps covering all open space, random leaf noise disconnected from plant structure, a featureless bright-green base covered by miscellaneous decorative mushrooms.

## F40 — Build *dense architectural/ecological worlds* with modular part budgets

**Trigger:** city, industrial complex, science lab, megastructure, server ecology, miniature technological habitat; key contrasts `AI@35`, `AI@555`, `AI@856`, `NUCLEAR@387,440`, `VOLCANO@16.9–17.5`.

**Part generator:** for each module record `functional_role → global footprint → structural mass → upper cap → face-local subparts → external links → contact and shadow → local light`. The function decides the shape: tower, duct, tube, road, observatory, reservoir, bridge, vegetation pod, window or energy conduit. Set actual face orientation; a window on a wall stays planar to that wall.

**For a high-density built vista:**

- Start with at least 3 size classes of dominant buildings/structures: primary silhouette, medium repeat units, small infill; sizes and count follow screen area and scale. Do not use all identically sized boxes.
- Before any windows, place principal silhouettes so foreground overlaps background **while revealing at least one readable roof or top plane** of the middle layer. This gives a recognizable depth ladder even without shading.
- Divide each actual building into 2–4 face-valued fills where the projection justifies it: roof plane, illuminated wall, shadow wall, deeper recess. Not a global bevel of fixed pixels.
- Add interior windows as **face-local patterns**, with their horizontal alignment projected along the face axes. Break the pattern at roof caps, corner turn, doors, sign panels and visible utility attachments. Use variation in window color across buildings; avoid random per-pane rainbow speckle if the world lighting has one source.
- Build a *street/duct/bridge graph* connecting specific modules. Lines belong below the buildings they pass behind; shadows belong to specific receiving ground/roof planes.
- Make the subdetail density depend on depth: nearest structures show attached rails/caps/windows/vents, distant ones often become mass + one highlight, not the same every-window resolution multiplied across the whole canvas.

**For an eco-technological complex (`AI@856`):**

- Draw a central organizing **functional structure** first (for a new brief: e.g. a moisture-processing reservoir, reactor, specimen tree, not the source cube). Position all outer machinery as connected neighborhoods on the substrate.
- Assign each neighborhood a different role: power, habitat, measurement, transport, maintenance, control. Give each a visible interface to central device or other neighborhoods: pipe, aqueduct, bridge, track, conduit, measured field or walkway. One link per functional group is a useful initial minimum, not a requirement for things intentionally independent.
- Author 2–4 repeated module families (e.g. curved glass greenhouse arches, stacked coolant towers, mounted viewing panels, tiny drones). Repetition builds a believable ecosystem. Rotate/scale and face the modules consistently; preserve assembly of each family.
- Behind the functional objects, add continuous ground and plant fields. In front, include larger overlapping machines/trunks/buildings that partially hide the path; never reduce a rich world to icons on a blank background.
- Reserve a contrasting value/color interval for the central functional interaction; subsidiary lights and windows are lower priority. Disable the center emission and the world should still read as a functioning place.

**Countercondition (`AI@874`):** an architectural world can be intentionally *almost empty* if the viewer needs depth and anticipation. Do not force crowding or bright roof/window repetition into a corridor.

**Pass:** isolate a 256×256 pixel crop from every quadrant of the 1920×1080 image; in a high-density vista, each should contain actual joined parts at the appropriate depth, not confetti or floating symbols. The image must also survive as a low-resolution 160×90 layout with a dominant spatial route.

## F41 — Create biological *micro-worlds* from parent anatomy and networks

**Trigger:** molecular interior, tissue, neurons, receptors, cell population, genetic pathways, distributed micro-organisms. See `MEMORIES@62,75,91,140,160,222,542`, `NUCLEAR@200`; extend F24–F25.

**Do not choose “neon circuit.”** A tissue field is a hierarchy of physical/anatomical constraints. First draw parent surface/volume and its boundary. Within it specify anatomical strata or branch sources. Build each unit according to the actual entity (e.g. neuron soma and neurites, synaptic vesicles bound inside terminal, membrane receptors bound to receiver, bacterial cell with wall and organelles); study the new topic's biology separately. Simplification may remove anatomy, but cannot invent incorrect causal direction.

**Population generator:** define an explicit **branch-parent graph** and a **density map**. Each unit is `root_location + parent_id + path(s) + terminal_shapes + state`. Sample root sites within the permitted region, then grow paths with limited direction and branch constraints. Node/terminal colors come from *cluster membership or physical layer*, not independent random colors. `MEMORIES@62` has approximately horizontal chromatic zones across a repeated field while purple branching stalks remain continuous behind terminal colors; this **does not** mean neurons require horizontal stripes. For a new phenomenon choose masks that encode its structure (e.g. infection boundary, concentration front, activated cluster) and let color vary with **that**.

**Scale hierarchy:**

- `tissue overview`: many units; show a few archetypal branches, population bands and an intentional highlighted region.
- `cell overview`: one complete membrane and enough internal topology to explain object identity; smaller molecules shrink into groups.
- `mechanism macro`: two or more correctly opposed surfaces, attach mechanisms on the correct parent and place active carriers in their real gap; reduce background complexity and protect the action gap (`MEMORIES@75`).
- `single-molecule icon`: bounded geometry with chemically defensible attachments; if truly schematic, treat as a relation diagram rather than pretend atomic molecular accuracy.

**Shading/edge:** most minor termini are solid small shapes with no black keyline; source-highlighted active paths can have warm light around the connected branch and bright sharp core. In the dark population field, the dark background acts as a separator, so a uniform glowing stroke around all members would destroy locality. `MEMORIES@542` instead uses cream/yellow continuous paths and pastel organisms, with connected intersections: same topology principle, **different** colors/material value.

**Verify at two scales:** inspect each unit in a native crop for actual connections, and examine the whole image at thumbnail to confirm correct regional clustering. Count/label anything numerical. Non-luminous population should remain legible when all emission passes are removed.

## F42 — Construct an *abstract stage* from legible spatial coordinates

**Trigger:** script depicts an agent/test/process with no natural geographic place but requires spatial relationships: simulation room, thought experiment, experiment platform, symbolic skill test, invisible algorithmic world. Witnesses `AI@334,416,423,436,650,777,821`; reject copying the AI mascot's particular face.

**Two stage alternatives, not one preset:**

1. **Open dark coordinate stage (`AI@436,777`).** Draw 1 deep background gradient/field, an optional horizon, a floor grid as projected lines converging appropriately, an optional ceiling grid if explicitly inside a virtual volume, and a focus patch or low-value drop shadow under an actual actor. Decorative falling vertical streaks belong to the *background volume* and must not be mistaken for hanging wires attached to actors. Position a complete agent silhouette or mechanism **in front of** the grid; clip its lower form if it emerges through the grid plane and specify whether the projection is a physical surface or pure reference coordinate.
2. **Task platform (`AI@334,416`).** Draw a complete bounded tabletop/game field or graph plane with correct quadrilateral projection and thickness. Treat its cells/links/objects as attached to that plane and depict active state with a local surface mask. The subject floats or stands relative to this platform with a declared contact/height. If there is a label, bind it to the actual platform/agent, not to screen space by accident.

**Backdrop restraint:** in a dark stage, the unused 30–70% of screen can remain mostly low-detail (`INITIAL_ART_DIRECTION_RANGE` for a clear central demonstration). Complexity moves into the interaction's boundaries, trajectory and glow, not arbitrary distant technology.

**Glow hierarchy:** the focal agent or active route may use one luminous identity and connected highlight; grid and secondary background rays must be lower luminance/contrast. In `AI@777` the tendril tips and eye are luminous while grid is legible but subordinate. Draw tendrils as long tapering connected shapes with light stripe on a **surface-local path**, not free-floating disconnected beams.

**Pass:** hide grid, rays and particles: the agent and process relationship should still be readable. Hide agent: the stage still has coherent floor/ceiling orientation, not an accidental texture.

## F43 — Construct an *information theatre* rather than flat UI wallpaper

**Trigger:** an entity traverses data, explores many options, manipulates screens/instances, receives model outputs, or exists surrounded by transparent records. Evidence `AI@250,372,423,444,514`.

**Classes:**

- `PANE_RING`: viewer centered on a subject with several staggered rows of **individual** screens orbiting or surrounding it (`AI@444`). Create a ring/ellipse/cylindrical coordinate map. Give each pane a position and surface normal; near panes appear wider/more contrasted and may occlude farther panes; side-facing panes narrow. The center remains a readable 1–2 subject focal zone, not hidden by the information panes. Local pane content consists of aligned code/data bars clipped to its rectangle. Make data bars 2–3 consistent lengths in small groups and align them with pane axes, not arbitrary text confetti.
- `EXPLODED_INTERFACE`: start with one closed device or information object and derive actual face panels, layers and mounts that can separate; draw each panel complete and at a coherent projection (`AI@250`). The viewer must see that the panels belonged to one object. Keep source and destination and connector attachment explicit.
- `BUILT_DATA_CORRIDOR`: use axial or oblique placement of stacked volumes and screen-bearing walls (`AI@423`), foreground occlusion, receding panel scale and a clear navigable corridor. This is a *world* made of interface architecture, not a transparent overlay on a generic gradient.
- `DASHBOARD_OVER_WORLD`: a schematic/code label sits **in front of** a physical or digital environment; choose whether its coordinates follow the world or camera. Give it a distinct panel/background contrast and anchor to a real object/measurement.

**If the new script needs a mental realm:** create novel information objects from what is being explained (seeds, shipping ledgers, energy budgets, biochemical alternatives, acoustic paths), not the source's original code strings or AI eyes. Each pane has a **reason for existing**; a blank stack of UI rectangles is not a complete world.

**Construction masks:** `panel_back`, `panel_contents`, `panel_rim`, `panel_specular_or_emission`, `subject`, `screen_space_labels`; order per depth. If pane transparency is used, only its fill should blend with things behind; pane border, control glyph and active content retain their intended opacity. For `AI@444` the nearly white bright environment is a deliberate counterexample to the default dark-neon tech rule.

**Pass:** freeze one pane in a full-size crop. Its edges, contents, thickness, alignment and transparency must withstand inspection independently. Mask off 80% of panes: a relational arrangement (ring, corridor, exploded unit, dashboard) should still be visible. Any pane that is just an unrelated luminous sticker should be removed.

## F44 — A luminous *volume* requires faces, apertures, sockets and optical layers

**Trigger:** data/energy is inside a glasslike container, volumetric machine, crystal chamber, projector or enclosed laboratory. Sources `AI@514,580,663,686,740,810,856`, `SOLAR@210`.

**Face construction:** define a 3D-like solid as a mesh of projected surfaces (`top`, `left`, `right`, optional `front`, `back`) and an edge graph. Faces each get separate fill, opacity and internal pattern. The visible near edges may be a brighter hue than the faces. A cylinder or sphere needs corresponding tangent surfaces/ellipse/rims instead of pretending everything is a cube. The new subject must determine volume silhouette (vessel, torus, beam chamber, unusual polygon), not source's repeated cuboid.

**Inside:** create an actual interior subject/art object with a clear scale and supported position. Place interior before the **near** transparent face, after the **far** face; add enough local occlusion for it to feel enclosed. Add inner circuitry only on the surfaces/planes it belongs to; draw voxel glyphs, blocks, or waves with clear relation to the subject.

**External connections:** every tube/cable entering a volume has `route`, `front/back depth`, `entry_point`, `socket_ring`, `crossing_mask`, `tube_body`, `inner_flow_path` and `exit/continuation` when visible. At `AI@514` the cyan hoses terminate in discrete circular ports on the cube, with lighter dashed interior markings and strong opaque contours. A cable must not simply fade through a transparent wall or appear from nowhere. The port occludes the entering tube at the near rim; tube can overlap behind the box and turn to screen foreground elsewhere.

**Four illumination layers:** (1) base flat face, (2) thinner luminous edge/core whose path tracks structural edges or flow, (3) bounded soft halo on a separate mask, (4) material receiving light locally. The emission mask may be clipped to the volume and rim; a global blur on the whole image is forbidden. The bubble/visor at `SOLAR@210` uses broader directional speculars and transparency, whereas `AI@514` favors crisp cyan orthogonal edge graph—do not transfer the edge style between different materials.

**Quantitative illustration from one native witness, not a rule:** at `AI@514`, the visible box spans roughly x=570–1350 of a 1920px image (41% width), with the interior figure around one-sixth to one-fifth of the picture width; the box is consequently still dominant without filling the frame. These are **single-frame descriptive estimates**. An unfamiliar brief must choose sizes from its explanatory hierarchy; the ratios may change substantially.

**Pass:** isolate `base_faces` without glow; one coherent volume remains. Isolate `tube_routes` without box; every external route has a terminal. Turn `halo` off; geometry, core light and subject remain sharp. Inspect sockets/near-face occlusion at native zoom.

## F45 — Construct machines and futuristic corridors by *functional topology first*

**Trigger:** server, robot infrastructure, complex science apparatus, factory, technological facility, future transport, alien laboratory, physical device. Contrast `AI@555,740,856,874`, `NUCLEAR@387,440`, `VOLCANO@16.9–17.5`. Builds on F11 and F28.

**Procedure:**

1. Write a device truth table: what input enters, what process occurs, what output leaves, where an operator interacts, where energy/power originates. If invented fiction, name its fictional principle so shapes form a coherent system rather than arbitrary “futurism.”
2. Draw 2–5 visually distinct structural assemblies sized by causal importance (main chassis, working core, transport path, controls, support). Their joints/hinges/bolts/covers must attach to something.
3. For each assembly, expose a different surface family: outer shell, recess, translucent window, active emitter, cable, ground/base, side shadow. Use flat fills or contained gradients according to that material and source analog; do not apply identical bevel/glow to each part.
4. Place interior machines according to structural circulation: accessible aisle, wall-mounted components, overhead conduit, floor support. Repeated servers show parallel aligned doors, rack openings and the correct perspective; reflections belong on the actual receiving floor plane (`AI@555`).
5. To depict depth through a gate (`AI@874`), construct **near door slabs**, inner wall/tunnel, far lit opening, floor and reflective/light cast layers separately. The near gate can occupy >50% frame as low-value material while a much smaller central lit passage communicates traversal; these are scene-conditional illustration choices, not a global dark-technology requirement.
6. Small warning lights, gauges and labels are allowed only if they indicate actual functions; a control console may have unreadable tiny code as surface texture *when actual explanatory text is not required*. Literal claims need separately rendered legible labels.

**Pass:** one can follow the operational flow from input to output by lines, path or structure even with words removed. There is no impossible conduit crossing or floating window on a supportless wall. Alternate views require redrawn rear surfaces and valid contacts.

## F46 — Use *material-owning* edges, fills and luminance: no universal glow or outline

**Trigger:** any project tries to impose a global stroke/gradient/glow/color preset. Source counterexamples: `AI@35` face-to-face dark edges with minimal black line, `AI@514` bright translucent edge graph and local halo, `MEMORIES@62` many tiny flat colored terminal shapes against near-black, `VOLCANO@15.2` solid foliage silhouettes, `AI@874` shadowed architectural planes and locally luminous corridor, `SOLAR@20` bright orbit and galaxy effects.

**For each material, fill in this table** (a different row for wood/bark, skin, glass, cloth, metal, rock, water, energy, biology, screen, sky):

| Required field | How to build it |
| --- | --- |
| `main_silhouette_mask` | Exact continuous region enclosing the parent object, clipped and parented; no soft global antialias making shape indecisive. |
| `principal_fill` | One contiguous value/hue plane chosen for role; a flat fill may be correct. |
| `local_planes` | Explicit lighter/darker polygons and bands nested inside the parent, selected from its facing/material; they must track top/bottom/side/inside or anatomy. |
| `edge_owner` | Decide if the boundary is separated by adjoining hues, narrow colored keyline, dark seam, refractive boundary, light-emitting rim, occlusion or nothing. No universal black stroke. |
| `internal_marks` | Actual morphological details (veins, bolts, pores, bark marks, glass streak, window grids) attached to named subpart. |
| `emitter_mask` | For emitted light only: exact emission source and crisp core. The mask may be empty for almost every object. |
| `halo_mask` | Bounded glow blurred from that source with intensity falloff; clip/mask off wrong materials and edge spill. |
| `contact/receiving_mask` | Specific floor, hand, nearby wall, liquid or organism surface that receives light/shadow; no global haze. |

**Digital/energy exception:** emissive tubes can have a sharp saturated core, an adjacent lighter run and soft outer halo; their connected centerline must remain visible after halo is disabled. **Organic exception:** tropical leaves can be solid overlapping lobes with few interior wedges; they do not require glow. **Hard material exception:** a room wall or cube face can be a single large uninterrupted planar fill with a small authored corner highlight; a gradient on every face harms readability.

**Contrast discipline:** thumbnails should keep high value separation on the actual focal cause. Background may be dark purple/cyan for one digital realm but light turquoise for another (`AI@444`). Build `palette_roles` afresh per scene and derive values from relationships; *never* define a single five-color official Kurzgesagt palette. Do not copy extracted hexes from reference footage as a universal style identity.

**Pass:** compare the clean unlit art with the composited result. The structure must be intact. Turn off every effect mask; the right objects still have correct local material planes, contacts and silhouette.

## F47 — Spend *detail* according to semantic role and visual distance

**Trigger:** any “detailed” environment, especially a world that looks cheap when rendered as a few symbolic icons.

**Three-tier detail system, instantiated by parts:**

- **T0 spatial skeleton:** 3–8 major area shapes or clusters establish substrate, horizon/volume, traversable paths, dominant form, large occlusion and focal negative space. Test at 160×90. This is **not** a rule that 8 is the maximum number of visible components; it is the number of initial planning masses.
- **T1 repeated complete modules:** objects that can be individually named and whose construction survives a crop: tree with trunk/crown, building with roof/walls/windows, cylinder with rim and contents, server with doors and connections, organism with complete outer shape, UI pane with real borders, graphical cluster with endpoints. Multiple different T1 families fill the world.
- **T2 parent-bound functional features:** window rows on buildings, leaves on crowns, endpoint dots on branches, light strips on tube surfaces, button panels on consoles, water ribbons inside river or vessel, reflective patches on glass.
- **T3 state-dependent marks:** localized sparkle, signal impulse, condensation, small emissive point, controlled highlight, measurement label. Generate these only where appropriate; never use T3 to compensate for missing T0–T2.

**Detail-selection algorithm:** for every candidate mark answer `parent_id`, `material_or_function`, `distance_class`, `contrast_budget`, `state`, `occlusion`, `disable_test`. A mark without parent or explanatory function is rejected. With zoom change, T2/T3 for distant units collapse to a fill or disappear; T1 silhouettes survive. `AI@35` has many windows that belong to architectural faces; `MEMORIES@62` has many colored termini attached to underlying branches. Both are dense but their detail generators are incommensurable.

**Negative-space and attention:** designate 1–2 active objects/path regions. Preserve enough adjacent free space around critical silhouette/causal link to read at 160×90; high-density background is allowed but its luminance/contrast should recede locally. In a world overview, the eye can intentionally roam across multiple regions rather than being forced to a face in center. State the chosen hierarchy, don't apply a universal rule-of-thirds grid.

**Pass:** erase each tier in reverse order. If T3 removal ruins object identity, the parts are missing; if T1 removal leaves only random speckle, the world generator failed; if T0 removal does not affect layout, the view probably has no designed space.

## F48 — Represent a *world within a world* as two complete constructions

**Trigger:** globe with microhabitat, thought bubble, glass specimen, room window onto science, eye reflection, enclosed memory scene, connected simulation, digital nested display (`MEMORIES@18,465,657`, `AI@250,514,856`, `SOLAR@210`). Extends F21.

1. Build exterior as a coherent place/figure/object. Draw its cavity boundary or aperture as a complete independent geometry with near and far material rims.
2. Build an **entire new interior environment** with its own sky/far fill, ground/substrate, near/mid/far objects, local color roles, lighting, small population and actor support. Clip this interior to the aperture; never cut and paste one object on a blue oval.
3. Apply projection from interior coordinates to aperture geometry. If curved or distorted, deform the interior **after** it has logical depth. Some curved bulbs use broad surface highlights while an open window uses near-wall thickness and contact occlusion.
4. Keep the exterior near rim and reflected streaks over the inner image, but do not place them over a foreground limb that should cross toward the viewer unless its depth ordering demands it.
5. If a portal changes visual states, produce actual self-contained key plates for each inner version; layout contact IDs survive. This is a *visual art-state* operation; timing and choreography belong to the future direction skill.

**Check:** switch off inner scene; shell still has complete materials and thickness. Switch off shell; inner scene still has believable topology. Render one object crossing aperture, inspect near-rim occlusion and the exact clipping edge.

## F49 — Compile *world construction data* into an enforceable ArtJob

**Trigger:** unfamiliar script is about to become an image-generation prompt, layer order, vector/raster asset spec or image/edit request. The compiler should fail when a chosen world-class method is described only with adjectives.

For any `ArtJob` with F37–F48 add `world_system` with the **machine-checkable minimum**:

```json
{
  "world_class": "ABSTRACT_VOLUME",
  "world_purpose": "one causal claim the viewer should infer",
  "substrate": "named support surface, volume or explicitly none",
  "coord_system": "projected solid faces with named depth ordering",
  "regions": [
    {"id": "space", "shape": "large enclosing silhouette/volume", "depth": "far", "material": "unlit background"},
    {"id": "focus", "shape": "complete new shape that communicates the claim", "depth": "mid", "material": "solid/local-plane"}
  ],
  "parts": [
    {"id": "source", "parent": "focus", "silhouette": "specific novel geometry", "projection": "mid", "function": "emits a measurable result"},
    {"id": "destination", "parent": "focus", "silhouette": "different bounded receiving assembly", "projection": "mid", "function": "receives the emitted result"}
  ],
  "relationships": [
    {"from": "source", "to": "destination", "type": "connected route", "path": "continuous centerline with ordered overlap"}
  ],
  "detail_generators": [
    {"parent": "source", "unit": "bounded on-parent repeated subpart", "distribution": "conditioned on parent surface", "count_or_density": "explicit value/region", "disabled_when": "source out of view"}
  ],
  "material_ownership": [
    {"part": "focus", "fill": "base plane", "edge": "material-specific edge", "light": "named local emitter or none"}
  ],
  "effect_ownership": [
    {"owner": "source", "kind": "connected signal core", "allowed_region": "only path inside source-to-destination conduit", "count_or_coverage_limit": "one uninterrupted primary path plus two endpoint glints", "forbidden_regions": "other architecture and empty background"}
  ],
  "visibility_masks": ["far volume", "inner object", "near wall/rim", "emission", "near occluder"],
  "focal_read_test": "what survives at 160x90 with labels hidden",
  "native_crop_tests": ["which contacts and surfaces to inspect at 100 percent"],
  "source_only_witnesses": ["AI@514", "AI@444"],
  "allowed_subject_ids": ["source", "destination"],
  "forbidden_extras": ["unrequested human narrator", "extra agent avatar", "unattached decorative UI"],
  "content_noncopy_invariants": ["No source agent identity", "No reference scene layout"]
}
```

The JSON above is an **illustrative schema example** using generic roles; it is intentionally *not* a complete artwork specification and an actual job must replace every placeholder with geometry linked to the new script. Every `relationships[].from/to` must reference an actual `parts[].id` before strict compilation. For a graphic with no physical substrate set `substrate` explicitly to `RELATIONAL_PLANE` and explain its coordinate semantics. A constructed world needs both large-space and local-surface representations.

**Prompt compilation:** prioritize world topology and named layer/mask order over a paragraph of style labels. Supply at least two unlike source witnesses as **style-only**, bind each to an explicit operation and countercondition, and state the new subject and forbidden source content. **After observing uncontrolled material gloss and an extra narrator character in two real new-world tests, explicitly fill `effect_ownership`, `allowed_subject_ids` and `forbidden_extras`: every light/sparkle has a parent and coverage budget, every permitted new actor has a named ID, and the model is expressly told not to add genre-default characters/props.** For image-only output, request a **separate visual layer/asset manifest**; a single flat PNG cannot certify editability. For a multi-view moving character, demand state sheets and register canonical contacts under F30; do not assume still image success predicts consistent identity in motion.

**Native output tests:**

1. Blur/downscale to 160×90: causal actor, environment class and one important connection must be distinguishable.
2. View 1:1 crops at center, corners, hardest material boundary, most complex contact and most repeated module. Are objects complete and structurally attached, or fabricated stickers?
3. Toggle sharp geometry only (if layer access); volume, branch, building and overlap stay logical.
4. Toggle glow/highlights; emission is optional, not the substance of the design.
5. Change new-script noun while keeping learned *conditional* construction rules: the next generated world should not keep the prior source's arrangement, characters or props.

**Check:** compiler rejects missing `coord_system`, region/part graphs, relationship endpoint, material ownership and native crop tests for world-system jobs. Source evidence does not become OUTPUT_DEMONSTRATED merely because a prompt includes the fields.

## F50 — Run adversarial *unfamiliar-world* transfer tests; do not certify by resemblance to one film frame

**Trigger:** before claiming the guide can create the desired creator's style “for any script,” or after a new world class is added.

**Required cross-class tests** (all content **unseen** in source):

1. **Abstract-physical:** e.g. a buoyancy-neutral *underwater communication observatory* with interconnected tuning chambers, water-layer material and inhabitable space. No AI mascot, no original film interface layout. Tests F38,F40,F44,F45,F46.
2. **Abstract-relational:** e.g. a *planetary weather-prediction uncertainty archive*: novel cause → branching alternatives → bounded and selected output in a fully spatial data environment. Tests F37,F42,F43,F47 and F27.
3. **Dense organism/environment:** e.g. a microscopic *soil fungal nutrient-trading forest* with physically connected filaments and transport endpoints, not the source's neurons. Tests F39,F41,F47 and real science validation.
4. **Built world:** e.g. a cross-sectional *floating flood-protection district* with structurally joined pumps, reservoirs, homes, aqueducts and three perspective depth planes. Tests F38,F40,F45,F47.
5. **Contained world:** e.g. a seed-sized *closed biosphere in a transparent shell* with separate interior atmosphere, visible shell thickness and foreground crossings. Tests F44,F48.
6. **Counterexample:** one low-detail scene (dark futuristic corridor or tiny isolated experiment) must **not** be filled with decorative symbols merely to achieve “high detail.” Tests F37,F47 and the rule's rejection conditions.

For each, compile a real job, generate an output, inspect it at native size, and log each method as `PROMPT_ONLY`, `VISIBLE_BUT_WEAK`, `VISIBLE_PASS`, or `NOT_APPLICABLE`. Make a source-based revision if a failure recurs in *two unlike new briefs*, then rerun both. These are an **acceptance matrix**, not a claim that all six examples were already produced. No prompt text, test code, or style guide can guarantee identical pixels or a moving-film result from a stochastic model; do not mark `QUALIFIED` without actual output and independent look tests. High transfer quality is an empirical claim to earn, not a descriptive adjective.

## End-to-end world-to-art constructor: a minimum usable recipe

### Visual-world replacement and transformation plates: draw the endpoints before choosing a transition

The separately labeled `VOLCANO@13.9–19.3` supplement demonstrates several physically **different complete worlds** and their large-shape continuity through a short passage. It is a bad transfer to memorize “volcano → jungle → future city → logo”; the transferable visual art is the ability to construct separate detailed environments, register a suitable **conserved graphic invariant** for a bridge and manufacture drawable intermediate states. The five main films supply unlike counterexamples: `MEMORIES@465` changes an inner habitat through a surrounding boundary; `AI@250` separates and repositions interface face panels; `NUCLEAR@384–390` substitutes many registered relit surfaces while retaining architecture; `SOLAR` scale passages replace cosmic object hierarchy while preserving diagrammatic paths.

For an **unfamiliar** pair of worlds A/B, choose *one defensible invariant* based on the new content: actual camera-space aperture path, shared terrain silhouette, part ID, material boundary, selected graph edge, color-role light source, or explicit empty space. Design separately:

1. `WORLD_A_COMPLETE`: full A underpainting, substrate, foreground, backdrop, object topology, materials and light, with its own independent asset mask graph. It must read without any transition effect.
2. `WORLD_B_COMPLETE`: independent complete B with **correct new coordinate system**. If B is a micro organism, do not keep A's roof perspective; if B is a graph, stop pretending it is an interior room. It too must read without effects.
3. `COMMON_INVARIANT`: a traced graphic shape/path or registered stable anchor, with named start/end projections into each world. It may be a foreground rim, connecting conduit, silhouette contour or region of light. Do not preserve reference plot objects.
4. `PLATE_A_EXIT`: actual redraw of A as its relevant contours occlude or expose the invariant. This may need deformation or clipped fills; scaling an entire screenshot is not a sufficient replacement drawing.
5. `PLATE_B_ENTRY`: actual redraw of B behind or inside the invariant; draw proper occluder ordering and mask clipping, then prove the emerging world is complete when its temporary bridge masks vanish.
6. `VFX_SEPARATE`: any flash, streak, dust or exposure flare has an independent emission/rim mask. Never substitute whiteout for the missing B environment. If the script's abstract meaning has no conserved physical form, use clear editorial cut as intentional **non-morph**—style does not require transformation in every case.

**Art-state acceptance test:** verify the A and B worlds on their own; overlay just the invariant and confirm a stable meaningful path; inspect A-exit and B-entry at native size for exposed blank holes, broken object backs, bad rim occlusion and stretched character faces. These four images and their masks are an *art construction package* for the future direction skill, not proof of what frame durations, easing, camera motion, sound cues or transition orders the reference studio actually used. This skill does **not** prescribe transition choreography.

For each unfamiliar paragraph, apply the following sequence with *typed outputs*:

`script claim → F20 visual medium tree → F37 world class + purpose → F38 coordinate system → F39/F40/F41/F42/F43/F44/F45 class-specific part generator → F46 material/local light ownership → F47 detail budgets → F21/F48 nested aperture if present → F30 state drawings if needed → F49 machine-checkable ArtJob → source-only image witnesses and provider request → 160×90/natural-size evaluation → F50 adversarial transfer ledger`.

**When diagnosing:** “The scene isn't rich enough” is not a diagnosis. Ask: What `substrate` is absent? Which depth layer has no T1 units? Is there a supportless pipe? Does a far machine have as many high-contrast marks as the hero? Which exact missing parent is a detail meant to attach to? Which aperture rim should cover the inner world? Which mask owns the glow? Which focal path disappears at 160×90? Each answer implies a **specific drawing edit** and a **specific source witness**, not another adjective.
