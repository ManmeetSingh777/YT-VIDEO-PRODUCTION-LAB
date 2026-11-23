# Production contract: unfamiliar script → editable artwork → animated film

**2026 direction supplement (additive):** Before executing the narrative-to-art router below for a moving film, read [TRANSFERABLE_MOTION_DIRECTION_GRAMMAR.md](TRANSFERABLE_MOTION_DIRECTION_GRAMMAR.md) fully and create its six upstream artifacts: claim ladder, spectator journey, three moving invention candidates, viewpoint/world atlas, OUT/MIDDLE/IN boards, and frame-indexed 60-fps score. These make each art request a **specific animated performance**, not a generic attractive static world. F37–F50 supply functional world construction but do not imply uniform visible detail. For the user's explicitly separated workflow, the older generic instruction to use SVG/code for artwork is superseded by GPT ownership of all original visible art; Claude Code only composites/moves/render-treats supplied images and asks for any missing art states. This note leaves all existing technical construction and production contracts intact.

**Active image-generation execution:** Use [AUTONOMOUS_VISUAL_PRODUCTION_LOOP.md](AUTONOMOUS_VISUAL_PRODUCTION_LOOP.md) to author a shared canonical identity, real camera/view registration, provider-attempt/repair record, and pre-render OUT/MIDDLE/IN assembly *while generating*. Do not mistake the presence of a planned `registered close-up` in this document for a registered close-up in actual pixels. This process manufactures coherent image families first; the verification gates below are supporting evidence, not a substitute for making the right visual design.

**Scope:** A downstream coding/animation agent should treat this as the execution protocol for F01–F36, not assume a style prompt creates an animation. The observed art language is conditional and may mix large painted/fill shapes, raster effects, vector paths, infographics, 3D-assisted projections and actual photographic/editorial material. The source MP4s alone cannot reveal their exact project files, layer conventions or rig parameters; the pipeline below is an implementable **proposed workflow**, not falsely attributed proprietary practice.

## 0. Input boundary and evidence ownership

Receive script, spoken-word alignment or target voiceover and target runtime/resolution/fps. If not provided, create an explicit timing hypothesis and flag it. Give every scene a `story_truth`: a one-sentence factual claim and the physical entities needed to show it. **Script supplies content; the skill supplies visual construction methods.** Store `source_witness_id` on each applied method and a `counterexample_witness` where sources differ. Read all mandated skill references before image design; none of the reference scenes may be traced or reused as a new scene's script content.

| Record | Required keys | Review question |
| --- | --- | --- |
| `narration_beats.json` | `beat_id`, `start_s`, `end_s`, `spoken_text`, `story_truth`, `visual_fact`, `confidence` | Does the picture answer the narration claim? |
| `shot_plan.json` | `shot_id`, `beat_ids`, `medium_tree`, `source_method_ids`, `transition_invariant`, `scope` | Did F20 route each beat appropriately, rather than imposing a single look? |
| `art_jobs/*.json` | `subject_graph`, `world`, `lighting`, `method_bindings`, `manufacturing`, `uncontrolled_high_impact_decisions` | Is the scene fully specified before generating? |
| `assets/identity/*.json` | canonical view-dependent silhouette, part graph, palette roles, accessories, material boundaries, supported views | Can every new drawing recover one original identity? |
| `assets/shot/*` | layered source art, masks, clean background plate, named object drawings, variants | Can each layer be turned off and rebuilt independently? |
| `animation/*.json` | owner states, track time ranges, contact constraints, rig/alt-drawing references, time offsets | Can a renderer reconstruct actions without inventing pose details? |
| `qa/shot_*` | test frames, thumb/native audits, geometry/contact checks, source-style comparison, failure ledger | Is the result genuinely observed and repairable? |

## 1. Narrative-to-art router

1. Split narration at **changes in visual information**, not fixed word counts. A single sentence may need a world, then a macro aperture and then a diagram; conversely multiple sentences may remain one shot. For each beat define which **one causal relationship** a silent viewer must see.
2. Invoke F20: `WORLD` for physical co-presence/contact, `MACRO` for structure within structure, `SCHEMATIC` for relationships, `MAP_OR_SCALE` for geographic/scale change, `PORTAL_OR_SCREEN` for nested coordinate frames, `CINEMATIC_EFFECT` for bounded compositing, `EDITORIAL_OR_AD` only on explicit new script need. Nested nodes each own masks, projection and detail budget.
3. Decide scene family's valid observed procedures, **including a counterexample** that prevents overgeneralization. Human/creature anatomy and functional machine topology must be established from domain truth before stylistic simplification. Do not use a microscope or source diagram as a substitution for genuine biology/mechanics.
4. Write a `shot_card` with: frame aspect/camera, foreground/subject/background layers, focal read, silhouette graph, camera/view-state requirements, color-role map, locally owned patches/light/optics, transition in/out, source witness comparison and unknowns. Each significant color region or line must have an owner.
5. Stop on `uncontrolled_high_impact_decisions`. A discovered unknown may be solved by checking originals, relevant literature/subject reference, a hand-drawn prototype or model-assisted experiment; document which source actually supplied the answer.

## 2. Build a master identity/design kit instead of scene-by-scene image drift

**Character:** canonical front / 3-quarter / profile / rear and explicitly needed extreme pose/prop-contact drawings. Preserve silhouette identifiers, hair-body overlap, facial landmark coordinate relationships, costume partition and accessory attachment. Define near/far limb visibility **per view**. Rig neck, shoulders and elbows only where deformation does not alter topology; use full redraw for turns, deep perspective changes, grasp extrema and expressive mouth/head changes. Test original character identity outside any scene background.

**World:** base geometry master (horizon, building footprint, rock shapes, river position), separate far-mid-near layers, sprite/plane/facet masks, contact shadows and foreground occluders. For day/night, produce registered complete material-light states: F22. For comparisons, construct both complete outcomes: F29.

**Machine:** purpose-driven part DAG with real mechanical inputs/output, power/flow direction, actuators, visible controls and physical contacts. Do not add unrelated panels. For historical equipment F28 adds a period-correct design-truth table. For biology F25 demands actual emitter/transmitter/receiver and continuous paths; anatomical subject truth remains an independent check.

**Portal/diagram:** draw the interior as a complete separate composition and store `inner_camera`, `viewport_mask`, `rim_back`, `rim_front`, `refractive_color` and occluding objects. F27 diagrams have machine-readable `nodes`, `edges`, `labels`, `reveal_order`. Avoid text that hides a broken diagram.

## 3. Image generation/illustration route with enforced boundaries

Prefer editable SVG/vector/code geometry for simple repeatable diagrams, charts, masks, labels, props and perfectly consistent machinery. Use reference-guided image generation for novel expressive illustration/macro forms/world artwork; provide **unlike source witness strips as STYLE ONLY** and subject/anatomy constraints as CONTENT ONLY. Save actual output and prompt/seed/request record. Image generation is *a renderer candidate*, not guaranteed to obey ArtJob. For repeatable characters, use a canonical original identity image and build separate state drawings via explicit edits; preserve source/reference independence. Composite and redraw edges/masks to achieve exact pose/contact where model output cannot.

**Do not feed one generic prompt to all scenes.** Compile one ArtJob per shot/asset class. Check the generated pixels at 10% and 100%: (1) silhouette/shape, (2) contacts/occlusion, (3) material-local color, (4) anatomical/functional correctness, (5) density, (6) medium-specific edge/light grammar, (7) original identity consistency. If source-style matching conflicts with correct physics/science, correct the mechanism *before* final stylization.

## 4. Separate timing tracks and image states

Output one `animation_plan.json` per shot. Every state has a named `owner_id`, `start_s`, `end_s`, rendering `layer_id`, `state_id` or `drawing_variant`, transform/curve, and optional `constraint_id`; camera and effects are separate owners. Stable anchors include hand-to-prop `contact_point`, planted foot, machine pivot, graph node endpoint, lens rim/mask and map label-to-feature. If an object changes orientation enough to change its visible parts, swap to its drawn alternate rather than rotating a static face image. Build the complete **before** and **after** art before transition interpolation. Any transition's conserved invariant is recorded under F35 (a registered silhouette, scale point, directed motion, projected part or data relation).

**Native editable frame contract:** use sRGB RGBA layers with alpha at production resolution, named masks, an edit-friendly renderer source (SVG/JSON/After Effects/Blender/Canvas as justified) and an interchange video of the animated composite. Keep layers at 16:9 1920×1080 or another *declared* production size; never upscale a small thumbnail as proof of fine-quality production. Run render at 60 fps if delivery asks for 60 fps, but generate QA sampling at 6–12 fps plus all key/contact/occlusion boundaries. A sampled proof must not be called equivalent to all 60 fps frames.

**Example action, original unlike any reference narrative:** a desert hydrologist turns an illustrated sluice handle as the water-flow diagram activates. Hand grip/finger surface and handle pivot form one contact group; water surface follows a continuous pipe/channel path and moves only after the sluice-opening state. The side schematic can remain in its viewport while the foreground handle rotates. This is a sample use of F20/F21/F25/F27/F31, **not an instruction to recreate the generated desert scene**, and no actual shot was animated or certified here.

## 5. Assembly and editorial checks

Build shots with defined head/tail handles to support transitions. Place voiceover and music/sound layers only when actual source audio or supplied production assets exist. Use audio cues for beat alignment; do not invent studio-specific sound design from silent frame witnesses. Export complete output plus editable art, shot cards, prompts, motion plan, rendered preview and QA report. A cut is valid only when both adjacent shots are complete scenes and the conserved visual identity/state is still legible. Narrative timing is measured against supplied audio, not guessed from a source-film transition unrelated to the new script.

## 6. Gates: two independent correctness axes, then style and motion

| Gate | Reject if | Evidence to retain |
| --- | --- | --- |
| `CONTENT_TRUTH` | anatomy/mechanics/cause or diagram labels are invented, as with a creature resembling a larva when the script names a springtail | domain-truth diagram, annotated output, explicit fact-check |
| `SOURCE_STYLE` | generic anime eyes, soft airbrush bevels, random fine texture, universal line widths, overused neon or copied source composition replace conditional methods | unlike source witnesses, before/after frame, method-to-pixel trace |
| `ASSET_INTEGRITY` | single flattened image falsely treated as layered, source rig/identity missing, duplicate poses with shifted anatomy | actual layer files, masks, state sheet, shape/occlusion tests |
| `ANIMATION` | contact drift, impossible joints, unsupported topology interpolation, accidental simultaneous camera/object jerks, mislabeled slideshow | temporal contact strips and actual rendered sequence reviewed at real time |
| `DELIVERY` | absent project files, missing provider receipts, missing audio sync or unsupported “exact style” claim | manifest, checksums, output receipt, QA signoff |

Qualification requires held-out unfamiliar multi-shot animation with material variety, independent frame review, source-style comparator, identity continuity and causal ablations. A beautiful still and a passing compiler unit test are useful **but not those gates**.

## 7. Minimal command-line handoff

From the skill root:

```bash
python scripts/test_full_film_router.py
python scripts/audit_full_film_study.py
python scripts/compile_art_job.py path/to/filled_art_job.json \
  --out path/to/shot_prompt.txt --trace path/to/shot_trace.json
```

Only after successful compile should the illustration provider receive that prompt and the actual style-only witness images. The provider returns image assets; the animation agent then turns these into explicit layers/drawing states and separately evaluates pixel and motion gates. Do not confuse `COMPILED_NOT_DEMONSTRATED` in the trace with output delivery. Keep the final report's `UNVERIFIED` list even when the art looks strong.
