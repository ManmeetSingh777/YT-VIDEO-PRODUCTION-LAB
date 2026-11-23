# Compiler: unfamiliar script → production-controlled 2D illustration

**Objective:** make source-observed methods own all important visible decisions. A prompt or schema alone does not prove adherence; inspect the resulting image.

## Compiler input

Receive a novel script, duration/frame count or single-image target, aspect ratio, intended viewer understanding, original subjects, actions, spatial setting, and scene transitions. The script may prescribe **content**; it may not silently override the style family.

## ArtJob — required fields

**2026-11-20 first-pass production extension:** This schema describes the base style-construction `ArtJob`, but **its older compiler by itself does not submit attached source images**. Every real image-generation job must also include the `first_pass_control.version=2` object specified in [FIRST_PASS_VISUAL_CONTROL.md](FIRST_PASS_VISUAL_CONTROL.md), then run `scripts/prepare_first_pass.py` instead of stopping at `scripts/compile_art_job.py`. The companion script checks the presence and resolution of two or more actual native reference image files, resolves their full paths, requires each focal subject's structural constructor and detailed human-family rules, plus **F51–F56 palette/density and `causal_frame_geometry` (named normalized endpoints, connected physical parents, frame edge and allowed symbols)**, and emits a concrete image-generation request. The returned status remains `COMPILED_WITH_IMAGES_NOT_SUBMITTED` until a real image provider call and observed output are recorded. A named source ID in this document is not an attached witness. See [FIRST_PASS_UNFAMILIAR_2026_QUALIFICATION.md](FIRST_PASS_UNFAMILIAR_2026_QUALIFICATION.md) for first-pass failures that led to the endpoint addition.

```json
{
  "job_id": "NEW-SCRIPT-A01",
  "original_content": {
    "script_excerpt": "An original short explanation of a new concept",
    "scene_goal": "Specific visual fact audience must understand",
    "new_subjects": ["species-specific subject", "actual functional apparatus"],
    "noncopy_source_content": true
  },
  "canvas": {"aspect": "16:9", "view": "actual intended view", "scale": "full-body / close / wide"},
  "medium_tree": ["WORLD", "PORTAL_OR_SCREEN", "SCHEMATIC"],
  "medium_route_reason": "The main landscape explains material contact; a bounded screen exposes the hidden process in a different coordinate system",
  "viewport_layers": [
    {"name": "exterior_background", "depth": 0, "mask": null, "coordinate_frame": "world"},
    {"name": "inner_schematic", "depth": 1, "mask": "M_inner", "coordinate_frame": "portal-local"},
    {"name": "near_frame_and_occluders", "depth": 2, "mask": "M_rim", "coordinate_frame": "world"}
  ],
  "temporal_plates": [
    {"name": "fully drawn opening pose", "time_s": 0.0, "state_owners": ["character", "world"]},
    {"name": "new apparatus state and correct gripping fingers", "time_s": 0.8, "state_owners": ["apparatus", "character"]}
  ],
  "method_bindings": [
    {
      "method_id": "F01",
      "conditions": "Novel subject with connected moving parts",
      "source_witnesses": ["BRAIN_BLINDS__human_acting:f023160", "NUCLEAR_FLIES__bio_world:f005040"],
      "invariant_transferred": "complete outer contour, near/far part attachment, colored interior masses",
      "variation_required": "new subject's particular actual anatomy",
      "observable_verification": "no disconnected limbs, wrong inherited species marks or floating features"
    }
  ],
  "subject_graph": [
    {
      "id": "subject1",
      "family": "human/animal/machine/world/diagram/other",
      "purpose": "what the visible subject does",
      "whole_silhouette": "specific path/volume/axis/gesture description, no vague adjectives",
      "view_dependent_parts": [{"part": "name", "shape": "visible geometric form", "parent": "subject1"}],
      "attachment_and_contact": [{"child": "hand", "parent": "scanner_handle", "occlusion": "thumb over near rim; far fingers behind"}],
      "surface_materials": [{"part": "body", "base_color_role": "focal warm fill", "attached_color_patches": ["dark-facing form patch follows concave side"]}],
      "face_and_expression": "all visible eye/mouth/hair subparts, or N/A",
      "state_family": ["neutral", "hand-contact variant", "turn variant"],
      "unseen_high_impact_decisions": []
    }
  ],
  "world": {
    "projection": "specific relationship of camera and visible planes",
    "layers": ["far sky", "distant geometry", "mid world", "subject", "near occluders"],
    "material_family_map": {},
    "focal_contrast_vs_environment": "what stays quieter and what stands apart",
    "environmental_density_condition": "subject/action requires sparse or ecology/world requires dense",
    "ground_and_support": []
  },
  "lighting": {
    "opaque_color_patches": [],
    "optical_reflection_masks": [],
    "emissive_connected_shapes": [],
    "atmospheric_halation_only": []
  },
  "animation": {
    "scene_tracks": [{"owner": "CAMERA/WORLD/SUBJECT_PART/REDRAWN_STATE/MATERIAL_LIGHT_STATE/EFFECT", "time_range": [0, 1], "asset_states": []}],
    "contact_constraints": [],
    "source_style_motion_witnesses": []
  },
  "manufacturing": {
    "route": "REFERENCE_GUIDED_IMAGE / MULTI_STATE_EDIT / CODE / HYBRID",
    "source_reference_roles": ["STYLE_ONLY: characters comparison", "STYLE_ONLY: unlike world comparison"],
    "canonical_asset_inputs": [],
    "masks_and_layer_order": [],
    "seed_and_provider_config": {}
  },
  "observable_negative_tests": ["no thick black universal outlines", "no anime-specific eye/nose grammar", "no hard geometry drift across states"],
  "uncontrolled_high_impact_decisions": [],
  "knowledge_state": "METHOD_CANDIDATE",
  "output_receipt": null,
  "visual_evaluation": null
}
```

The `ArtJob` must be **filled with actual content**, never simply pass along this illustrative JSON with placeholders. Explicit `N/A` is allowed only if a domain truly does not occur. Unknown high-impact choices must be named.

The example above shows a compound `WORLD → PORTAL_OR_SCREEN → SCHEMATIC` scene. A simple world-only still should instead set `medium_tree: ["WORLD"]`, omit `viewport_layers` when no aperture exists, and omit `temporal_plates` when no changed visual state is requested. **F20 is required conceptually** even if the backwards-compatible compiler defaults older ArtJobs to `WORLD`. `EDITORIAL_OR_AD` additionally requires a documented `editorial_reason`; it must not be inferred from advertising footage in the source films. For a viewport, the compiler checks that at least three ordered structural layers exist; the exact masks, projected inner image, rim thickness and occlusion still need pixel review. For animation, named `temporal_plates` must carry actual timecodes and actual states (F22, F30–F32). The compiler only tests structure, not motion plausibility.

### Additional required `world_system` block whenever F37–F50 applies

The original `world` description above is a necessary overview but **not sufficient** for a rich abstract/scenic world. If a job binds any method F37–F50, add `world_system` as a top-level sibling. Its exact data contract and working generic example are in **[WORLD_SYSTEM_CONSTRUCTION.md](WORLD_SYSTEM_CONSTRUCTION.md), F49**. The following must exist in a filled job:

| Key | A strict compiler and artist require |
| --- | --- |
| `world_class`, `world_purpose` | One of 10 supported construction classes; one explicit causal claim the picture conveys. |
| `substrate`, `coord_system` | The actual physical/relational support and projection. “Futuristic” is neither. |
| `regions` | Nonempty actual drawable scene masses/volumes, with depth and material. |
| `parts` | Nonempty unique named object identifiers with silhouette, projection and physical function. |
| `relationships` | Nonempty functional graph whose `from/to` endpoints reference **existing part IDs**. |
| `detail_generators` | Parent-bound repeated units, placement/distribution rule, density/count and deletion condition. |
| `material_ownership` | Named parent material, base fill, edge strategy and local light/no-light status. |
| `effect_ownership` | Named emitter owner, effect type, **allowed region**, visible mark/coverage budget, forbidden spill regions. Prevents all-over plastic gloss and disconnected sparkle. |
| `visibility_masks` | Ordered actual layers/masks, not just “cinematic depth.” |
| `focal_read_test` | The causal figure/connection expected to survive when reduced to 160×90. |
| `native_crop_tests` | Exact surfaces, joints, leaves, windows, sockets and connection ends to inspect at native scale. |
| `source_only_witnesses` | At least **two unlike** original film witnesses, explicitly STYLE-ONLY. |
| `allowed_subject_ids`, `forbidden_extras` | Exactly which declared parts/actors are allowed; explicitly bar incidental genre-default people, stickers and stage props. |
| `content_noncopy_invariants` | Original film items/arrangements expressly excluded from the new artwork. |

The checker validates presence, class, IDs and connection endpoints; it **cannot** prove via JSON alone that a complex contour is correct, geometry coherent, masks rendered or an image provider actually followed the request. The `output_receipt` must contain a real provider call record/output and pixel audit for that stronger claim.

**Provider request-size handling, observed in a real compiler-to-generator trial:** a full world job combined with F37/F41/F46/F47/F49 text initially exceeded the image provider's 32,000-character limit when a long schema example was included. The compiler now removes **only the illustrative fenced F49 JSON example** from the provider-facing method text because the actual validated, filled `world_system` object is already included above. It retains the complete authored rules in the source guide and the actual current job in the payload. For different providers, inspect their documented limits before submitting; omit unrelated rules and duplicated example boilerplate, **never silently truncate the new script, geometry, safety or source noncopy constraints**. The sample `assets/novel_mycelium_world_art_job.json` is compiled under 31,500 characters in a regression test.

Run `python -m unittest discover -s scripts -p 'test_*.py' -v` from the skill folder to audit F01–F56, complete native-HD feature evidence, mandatory actual source-image paths, causal endpoints, and negative routing/world-graph conditions. Recompile `assets/novel_greenhouse_art_job.json` to detect compatibility breakage. **Passing is insufficient** for `OUTPUT_DEMONSTRATED`, and it cannot substitute for checking generated pixels or animated transition frames.

## Pre-generation interrogation (repeat, not a generic checklist)

Perform up to ten **substantive** problem-driven inspections before expensive generation when required. Each pass must find a real missing construction decision and update an actual producer operation. Do not fabricate ten ceremonial review passes. Prioritize:

1. silhouette/subject identity;
2. part graph and occlusion/contacts;
3. face/hair/limbs/alternate hand states;
4. machine/biological/architectural functional internals;
5. color region *ownership* and local material variation;
6. world depth and functional surroundings;
7. light, optical reflection and emissive geometry separation;
8. pose, alternate drawings, motion owners and concurrency;
9. whole-frame hierarchy and style-native detail density;
10. capability of selected image/renderer route to express the intended method.

Order is determined by the current largest visible or likely production gap, not permanently fixed. A high-stakes silhouette error overrides a minor glass highlight uncertainty.

Each question must include: observed mismatch/witness; exact unknown choice; plausible alternative answers; difference those alternatives make to image operation; evidence source; new decision after answer. If it does not change any producing operation, mark it low leverage.

## Prompt compilation: text + source-style images

Compile from filled `ArtJob` into the following ordered provider request. **Do not begin with "make a vibrant Kurzgesagt-style image."**

```text
ROLE OF REFERENCES
Attached source witness boards are only examples of the studio's illustration construction.
Do not reproduce their characters, objects, scene staging, composition, stories, symbols, or layouts.

ORIGINAL SCENE / VIEW
[Actual new content and whole-shot framing.]

COMPLETE ARTWORK STRUCTURE
[For every subject: silhouette → structural masses → functional anatomy → near/far occlusion → contact → material color planes.]

PERSON / CREATURE CONSTRUCTION
[Exact view-dependent head/face/hair/body/limb/hand/eye/prop constraints, only when relevant.]

MACHINE / WORLD / ENVIRONMENT CONSTRUCTION
[Physical volume/plane and functional-detail graph; perspective; near/mid/far layers, density conditioned by content.]

ILLUSTRATED MATERIAL GRAMMAR
[Opaque patches; optical mask; connected emissive geometry; local atmosphere, assigned per surface with source method IDs.]

COLOR ROLE RELATIONSHIPS
[Base environment hues and values; foreground-to-background contrast; focal warm/cool opponent; dependent form patches; colored rim and recess decisions. No random palette.]

ALTERNATE VIEWS / DRAWING STATES
[Named view, expression, pose, contact, light/material state with canonical character identity and matching geometry.]

NEGATIVE VISUAL CONDITIONS
[Observable anti-rules: no disconnected hands, no generic stock faces, no universal line weight, no arbitrary texture, no copied source composition, no all-over glow, no unmodeled background.]

REQUIRED OUTPUT AND EVIDENCE
[One fully illustrated original image or sequence of clean component/state plates. No text/logo unless in original brief. Return actual output asset for visual audit.]
```

When supported, pass **two or more unlike visual source witnesses**, e.g. character and world board, and explicitly name their style-only roles. Use a single source frame only when the family is rare and also provide an unlike comparison to avoid scene cloning. Prefer native 1920×1080 for facial/edge material rather than 384×216 contact thumbnails.

If provider's guide control is poor: construct a canonical character and individual clean plates; generate separate expression, view and hand-contact drawings conditioned on canonical plate; segment masks for arm/body/face if later animation needs movement. Do not ask a whole-frame image model to produce unrelated images for all frames then hope continuity emerges.

## Deterministic style decisions versus stochastic provider

The same brief, frozen method references, selected conditions and generation config should compile the same request and asset plan. **Pixel identity** may still vary with model sampling; record actual provider version/seed and test results.

## Visual evaluation after each real output

Make four separate judgments:

- **Shape topology:** can you trace each object and part from its physical root to its tip? Are visible hands/feet/props attached correctly?
- **Material surface language:** are form patches actually attached and confined to body/lens/building/glow surfaces? Does a global render/ink look intrude?
- **Whole-look:** at 20% and 100% scale, is the new scene coherent with appropriate *unlike* source frames without copying their staging?
- **Generalization:** can the same method reproduce another novel subject and view without manual scene-specific patches?

For each failure, bind `rule_id → compiled instruction → source evidence → output visible evidence → diagnosis → targeted method update`. A compiler trace without artwork never counts as success. A polished image that copies a source character fails originality and generalization.

## Moving sequence and AV

Use layer, camera and alternate-drawing states specified by the observed motion family. Narration meaning determines what must be visible at a given time, but final timing and sound synchronization cannot be learned from silent contact images. Analyze actual MP4 audio/transcript and exact timecodes separately. Confirm source-to-original transfer with a short contiguous original moving sequence before claiming a reusable audiovisual pipeline.
