# SOURCE-GROUNDED ORIGINAL 2D ILLUSTRATION JOB
The witnesses are STYLE-ONLY. Never copy source subjects, original scenes, faces, arrangements, costumes, story beats or props.
The script owns new content; method rules govern illustration construction.
Make complete artworks with connected functional parts and scene-conditional material treatment.
Never silently replace a missing high-impact decision with a generic style adjective.

## NEW BRIEF
{
  "new_subjects": [
    "original cross-sectional underground woodland",
    "two different rooted tree species",
    "branching fungal hyphal network",
    "distinct root and fungal transfer contacts"
  ],
  "noncopy_source_content": true,
  "scene_goal": "Without labels, see two distinct plant root systems bridged by a continuous third fungal network carrying signals along attached filaments.",
  "script_excerpt": "Deep below a mixed forest, threads of underground fungi connect different root systems into a living material-exchange network."
}

## CAMERA / VIEW
{
  "aspect": "16:9",
  "focal_order": [
    "one bright branch of a connected fungal network bridging the roots",
    "correctly attached root exchange points",
    "overlapping earth strata and individual fine roots",
    "the above-ground forest setting"
  ],
  "scale": "landscape-wide ecological explanation, with an emphasized native crop area containing an actual root-fungal connection",
  "view": "highly illustrative planar cross-section, distant above-ground tree crowns occupy top fifth and the underground continuous soil cutaway fills the middle and lower area"
}

## SCENE MEDIUM ROUTE / NESTING
[
  "WORLD",
  "MACRO"
]

## VIEWPORT / MASK ORDER
[]

## ACTUAL SUBJECT CONSTRUCTION
[
  {
    "attachment_and_contact": [
      "tree trunks connect through soil line to rooted tapers",
      "stones embedded in explicit soil volume"
    ],
    "family": "ecological cutaway",
    "id": "soil_world",
    "surface_materials": [
      "deep plum/brown broad soil bands",
      "different medium-dark ochre/violet cutaway strata",
      "green varied attached crown groups"
    ],
    "view_dependent_parts": [
      "above-ground silhouettes",
      "near deep soil strata",
      "mid-soil branching networks",
      "embedded irregular stones"
    ],
    "whole_silhouette": "contiguous undulating dark soil cross-section below a shallow grass/wildflower upper ground contour and two above-ground attached tree canopy silhouettes"
  },
  {
    "attachment_and_contact": [
      "trunk passes through shared upper soil boundary",
      "several small root hairs contact attached fungal threads"
    ],
    "family": "tree root network",
    "id": "root_left",
    "surface_materials": [
      "warm rusty root main fill",
      "bounded sienna facing patches",
      "lighter interior tissue only where cut open"
    ],
    "view_dependent_parts": [
      "outer bark plane",
      "2-5 named major branch stems",
      "many tapered minor roots"
    ],
    "whole_silhouette": "one broad exposed main woody root tapering downward then dividing into unequal branching fine roots with actual subbranch links"
  },
  {
    "attachment_and_contact": [
      "all major branches join an actual root crown",
      "multiple physical fungal exchange contact interfaces at root tip surfaces"
    ],
    "family": "different tree root system",
    "id": "root_right",
    "surface_materials": [
      "cool terracotta bark fill",
      "dark material-local shadow wedges"
    ],
    "view_dependent_parts": [
      "deep bark strip",
      "lateral spreading first branches",
      "filigree fine root tips"
    ],
    "whole_silhouette": "thin tall trunk descends to a broad asymmetrical spreading root system, differing in branch rhythm and thickness from root_left"
  },
  {
    "attachment_and_contact": [
      "hypha path touches root_left",
      "hypha path touches root_right",
      "occludes behind selected thick root planes",
      "runs in front of some soil stratum and behind small stones"
    ],
    "family": "fungal hyphal web",
    "id": "fungal_network",
    "surface_materials": [
      "pale cream-turquoise solid narrow continuous hyphae",
      "tiny locally activated gold-green path segment",
      "low-value unlit fine branches"
    ],
    "view_dependent_parts": [
      "one main cross-screen branch",
      "differing thinner interconnected side hyphae",
      "small attached nodules and ring contacts"
    ],
    "whole_silhouette": "continuous thin meandering branched linked network weaving around embedded stones and plant root branches, attached to both root systems through explicit fine end interfaces"
  }
]

## WORLD / PERSPECTIVE / DETAIL DEPTH
{
  "environmental_density_condition": "tissue-like high-density middle soil; broad quiet regions between major roots, no confetti texture",
  "focal_contrast_vs_environment": "one highlighted actual hyphal route crossing a quieter dark soil field",
  "ground_and_support": [
    "rooted trunks intersect upper soil surface correctly",
    "hyphae attach to both root classes",
    "embedded stones hide sections of web rather than float"
  ],
  "layers": [
    "sky and far canopy",
    "ground/soil back bands",
    "embedded stones",
    "root masses",
    "fungal web woven with roots",
    "near dirt and selected root occluders",
    "two small connection emitter strips"
  ],
  "material_family_map": {
    "canopy": "grouped lobed organic leaves",
    "fungus": "fine continuous attached network",
    "rock": "bounded angular solid planes",
    "root": "root species-specific branch surfaces",
    "soil": "three continuous broad irregular strata"
  },
  "projection": "flattened cutaway with slightly offset illustrative foreground/below-ground overlap; no digital perspective grid"
}

## WORLD SYSTEM: PROJECTION / PART GRAPH / MATERIAL OWNERS
{
  "allowed_subject_ids": [
    "root_left",
    "root_right",
    "fungal_network"
  ],
  "content_noncopy_invariants": [
    "no native neuron forest copied",
    "no source jungle characters",
    "no source microscope scene layout"
  ],
  "coord_system": "2D section coordinates, botanical parent-branch topology; independent screen-depth overlap of foreground soil and roots",
  "detail_generators": [
    {
      "count_or_density": "3 principal forks plus 8-16 thin tips",
      "disabled_when": "branch behind near soil occluder",
      "distribution": "fork only from actual root parent",
      "parent": "root_left",
      "unit": "tapered attached secondary root"
    },
    {
      "count_or_density": "2 long horizontal laterals plus multiple fine tips",
      "disabled_when": "too far to read",
      "distribution": "connected irregularly from main root",
      "parent": "root_right",
      "unit": "long thin lateral root with branching tips"
    },
    {
      "count_or_density": "dense central region, a few broad dark breathing gaps, no isolated free-floating ends except actual unseen continuation",
      "disabled_when": "hidden behind stone or thick root",
      "distribution": "connected growing network within soil mask, weighted toward roots and suitable soil stratum",
      "parent": "fungal_network",
      "unit": "narrow continuous splitting filament"
    }
  ],
  "effect_ownership": [
    {
      "allowed_region": "the one highlighted fully attached fungus strand between root contacts",
      "count_or_coverage_limit": "one slender continuous path plus at most a few terminal pinlights",
      "forbidden_regions": "background soil, tree crowns, unconnected fungus threads and all rocks",
      "kind": "activated connected path highlight",
      "owner": "fungal_network"
    }
  ],
  "focal_read_test": "at 160x90 two different tree roots are clearly linked by one bright continuous non-circuit biological web",
  "forbidden_extras": [
    "unrequested human scientist",
    "anthropomorphic eye or neural mascot",
    "digital grid, microchip or data screen",
    "unattached sparkles",
    "source-film branching neuron"
  ],
  "material_ownership": [
    {
      "edge": "darker adjacent soil or local root shadow",
      "fill": "warm rusty continuous main root plane",
      "light": "none",
      "part": "root_left"
    },
    {
      "edge": "adjacent soil contrast",
      "fill": "terracotta thin main root",
      "light": "none",
      "part": "root_right"
    },
    {
      "edge": "sharp path fill",
      "fill": "pale cream/turquoise connected paths",
      "light": "only a selected route from contact to contact",
      "part": "fungal_network"
    }
  ],
  "native_crop_tests": [
    "left hypha-to-root contact",
    "right hypha-to-root contact",
    "network junction behind stone",
    "soil/fungal contrast and plant branch taper"
  ],
  "parts": [
    {
      "function": "first root partner",
      "id": "root_left",
      "parent": "soil",
      "projection": "cutaway",
      "silhouette": "thick taper from a short broad-leaved trunk, 3 forked main roots, many finer terminal hairs"
    },
    {
      "function": "second distinct root partner",
      "id": "root_right",
      "parent": "soil",
      "projection": "cutaway",
      "silhouette": "thin tall conifer trunk joining widely spread thin lateral roots"
    },
    {
      "function": "exchange link between two rooted systems",
      "id": "fungal_network",
      "parent": "soil",
      "projection": "cutaway",
      "silhouette": "many joined cream-colored fine threads around soil stones with two thick highlighted route branches"
    }
  ],
  "regions": [
    {
      "depth": "far",
      "id": "surface",
      "material": "leaf and sky",
      "shape": "narrow illustrated grass and tree canopy region"
    },
    {
      "depth": "mid",
      "id": "soil",
      "material": "soil",
      "shape": "one large connected underground cutaway with 3 irregular earth layers"
    },
    {
      "depth": "mid-near",
      "id": "exchange",
      "material": "fungal tissue",
      "shape": "mid-height meandering web region spanning distinct roots"
    }
  ],
  "relationships": [
    {
      "from": "fungal_network",
      "path": "continuous fungal strand terminates at multiple left root hair points",
      "to": "root_left",
      "type": "root-tip physical exchange contact"
    },
    {
      "from": "fungal_network",
      "path": "same joined network reaches multiple right root hairs",
      "to": "root_right",
      "type": "root-tip physical exchange contact"
    }
  ],
  "source_only_witnesses": [
    "MEMORIES@62",
    "NUCLEAR@296",
    "VOLCANO@15.2"
  ],
  "substrate": "whole illustration is an ecological horizontal soil cross-section with continuous upper land contour",
  "visibility_masks": [
    "sky",
    "upper terrain and earth",
    "stones",
    "far roots",
    "far fungal branches",
    "near fungal route",
    "near root shadows",
    "local active path halo"
  ],
  "world_class": "BIOLOGICAL_MICRO",
  "world_purpose": "Show a continuous fungal network bridging two physically different tree root systems beneath one woodland habitat"
}

## MATERIAL-OWNED LIGHTING
{
  "atmospheric_halation_only": [
    "tight glow close to the one activated hyphal path"
  ],
  "emissive_connected_shapes": [
    "one network route between the roots"
  ],
  "opaque_color_patches": [
    "earth layers",
    "root structural planes",
    "stone structural planes"
  ],
  "optical_reflection_masks": []
}

## MOTION / ALTERNATE DRAWINGS
{
  "still_image": true
}

## TIMED KEY-PLATE STATES
[]

## EXECUTION ROUTE / REFERENCE ROLES
{
  "canonical_asset_inputs": [],
  "masks_and_layer_order": [
    "sky",
    "rear soil",
    "root systems",
    "far fungal branches",
    "near fungal path",
    "near dirt occluders",
    "route light"
  ],
  "route": "REFERENCE_GUIDED_IMAGE",
  "seed_and_provider_config": {
    "actual_provider_seed": "record if supplied"
  },
  "source_reference_roles": [
    "STYLE_ONLY MEMORIES@62 attached dense biology",
    "STYLE_ONLY NUCLEAR@296 terrain ecology",
    "STYLE_ONLY VOLCANO@15.2 parent vegetation masses"
  ]
}

## METHOD BINDINGS AND WITNESSES
[
  {
    "conditions": "A complete ecological world is required to understand the material network under ordinary soil.",
    "invariant_transferred": "build explicit environment substrate, whole regional silhouettes and connected part topology before small details",
    "method_id": "F37",
    "observable_verification": "the source and receiving roots are spatially identifiable and linked by one attached fungus path",
    "source_witnesses": [
      "VOLCANO@15.2",
      "MEMORIES@62",
      "NUCLEAR@296"
    ],
    "variation_required": "original underground rooted trees and fungal material, unlike any reference scene"
  },
  {
    "conditions": "Fine biological filaments and small attachment structures fill a meaningful soil region, not an arbitrary grid.",
    "invariant_transferred": "hierarchically branched parent graph with terminal contacts and region-conditioned biological density",
    "method_id": "F41",
    "observable_verification": "every bright terminal touches a visible fungus/plant root; filament can be traced to main network",
    "source_witnesses": [
      "MEMORIES@62",
      "MEMORIES@75",
      "NUCLEAR@200"
    ],
    "variation_required": "branch forms must be new plausible fungal mycelium/plant roots, never copied synapse or neurons"
  },
  {
    "conditions": "Soil, root bark, fungus filaments, rock and tiny active transfer points are different materials.",
    "invariant_transferred": "solid filled local color patches for organic masses; small limited emission only on connected active paths",
    "method_id": "F46",
    "observable_verification": "delete glow: coherent soil, roots and continuous fungal filaments remain; no universal outline",
    "source_witnesses": [
      "VOLCANO@15.2",
      "MEMORIES@62",
      "AI@514"
    ],
    "variation_required": "fungal palette is tied to new soil lighting rather than a neon computer or source neuron color"
  },
  {
    "conditions": "This is a high-density habitat with identifiable trunks, root branches, hyphae, organic debris and soft soil layers.",
    "invariant_transferred": "T0 environment skeleton, T1 complete parent-linked units, T2 attached local details and restrained T3 effects",
    "method_id": "F47",
    "observable_verification": "at 160x90 the connected fungal path remains readable and at native 100 percent every complex crop has real attached anatomy",
    "source_witnesses": [
      "AI@35",
      "MEMORIES@62",
      "VOLCANO@15.2"
    ],
    "variation_required": "new tree/root/fungus units replace any source building, synapse or cartoon animal"
  },
  {
    "conditions": "Prompt submission needs a strict new content part graph, projection, no extra characters and owner-limited effects.",
    "invariant_transferred": "compile typed substrate, functional root/fungal endpoints, material and effect masks into a drawable prompt",
    "method_id": "F49",
    "observable_verification": "every source-to-target connection is actually illustrated; there are no faces, drones, UI, labels or unrelated glowing dots",
    "source_witnesses": [
      "VOLCANO@15.2",
      "MEMORIES@62",
      "NUCLEAR@296"
    ],
    "variation_required": "new subterranean soil exchange architecture, not a source character or film plot"
  }
]

## FULL APPLICABLE LEARNED CONSTRUCTION METHODS
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

## F49 — Compile *world construction data* into an enforceable ArtJob

**Trigger:** unfamiliar script is about to become an image-generation prompt, layer order, vector/raster asset spec or image/edit request. The compiler should fail when a chosen world-class method is described only with adjectives.

For any `ArtJob` with F37–F48 add `world_system` with the **machine-checkable minimum**:

[See the validated WORLD SYSTEM block above for the actual geometry and part graph.]

The JSON above is an **illustrative schema example** using generic roles; it is intentionally *not* a complete artwork specification and an actual job must replace every placeholder with geometry linked to the new script. Every `relationships[].from/to` must reference an actual `parts[].id` before strict compilation. For a graphic with no physical substrate set `substrate` explicitly to `RELATIONAL_PLANE` and explain its coordinate semantics. A constructed world needs both large-space and local-surface representations.

**Prompt compilation:** prioritize world topology and named layer/mask order over a paragraph of style labels. Supply at least two unlike source witnesses as **style-only**, bind each to an explicit operation and countercondition, and state the new subject and forbidden source content. **After observing uncontrolled material gloss and an extra narrator character in two real new-world tests, explicitly fill `effect_ownership`, `allowed_subject_ids` and `forbidden_extras`: every light/sparkle has a parent and coverage budget, every permitted new actor has a named ID, and the model is expressly told not to add genre-default characters/props.** For image-only output, request a **separate visual layer/asset manifest**; a single flat PNG cannot certify editability. For a multi-view moving character, demand state sheets and register canonical contacts under F30; do not assume still image success predicts consistent identity in motion.

**Native output tests:**

1. Blur/downscale to 160×90: causal actor, environment class and one important connection must be distinguishable.
2. View 1:1 crops at center, corners, hardest material boundary, most complex contact and most repeated module. Are objects complete and structurally attached, or fabricated stickers?
3. Toggle sharp geometry only (if layer access); volume, branch, building and overlap stay logical.
4. Toggle glow/highlights; emission is optional, not the substance of the design.
5. Change new-script noun while keeping learned *conditional* construction rules: the next generated world should not keep the prior source's arrangement, characters or props.

**Check:** compiler rejects missing `coord_system`, region/part graphs, relationship endpoint, material ownership and native crop tests for world-system jobs. Source evidence does not become OUTPUT_DEMONSTRATED merely because a prompt includes the fields.

## OBSERVABLE FAILURE CONDITIONS
[
  "no neural cell body copied",
  "no floating unattached bright dots",
  "every fungal thread linked to an actual parent",
  "no universal heavy black outline",
  "no generic blue data grid",
  "no extra human or AI character"
]

## DELIVERY
Return the actual original illustrated output with enough fidelity to check every structural and material condition. State any limitation plainly.
