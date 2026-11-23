# First-pass source-to-provider controller — all visual families

**Complete-film accumulation rule:** After every demonstrated successful image repair, the next matching *first* provider prompt must inherit its corrective producing decisions through the project memory. Read `REPAIR_LEARNING_TO_FIRST_PASS.md` and use `scripts/repair_learning.py` with `scripts/prepare_first_pass.py --repair-memory PROJECT/learning/REPAIR_MEMORY.json`. For `production_mode=COMPLETE_FILM_ART_PACKAGE`, the compiler now requires initialized memory even before the first repair; declare the actual `learning_context` on each asset. Do not merely write a critique, assume the chat remembers, or add a generic "no more mistakes" sentence. Persist a local identity rule for related views/poses; conditionally reuse a source-grounded family rule in matching unfamiliar contexts. Distinguish actual learned provider inputs from global installed skill updates.

**Problem repaired:** F01–F50 describes excellent *possible* methods, but a new chat can mention the methods and then submit a generic storybook prompt. `compile_art_job.py` historically only emits text; it does not call an image model or ensure reference images reach that call. Previous observed A/B/G1 attempts and the November 20 Asha/ferry test showed painterly/anime-like drift despite a good narrative illustration. Longer post-hoc correction loops cannot substitute for a correctly constructed **first request**.

This is an upstream **manufacturing procedure**, distinct from an image critique. Invoke it **for every new image**, including environments, diagrams, props, biology, machinery, character sheets, abstract worlds and motion transition plates. It is not an additional arbitrary pass gate.

## First-pass invariant

At the instant an image provider is called, five concrete things must be simultaneously available:

1. **Purposeful visual brief:** the new factual/causal claim, what must be seen and how it becomes legible from the intended viewpoint. Novel scene design comes from the script, not from a source witness.
2. **Filled structural specification:** original subjects and actual part attachment/occlusion, view/projection axes, near/mid/far masks, color-region ownership, material-local shading treatment and conditionally scoped detail. Never substitute adjectives for drawable shapes.
3. **Conditional style-family selection:** source evidence from at least two **unlike native witnesses**, selected by *construction problem*, not by matching literal objects. Identify one source counterexample proving that a tempting universal setting is wrong.
4. **Actual provider payload:** source images attached as **images** to the generation tool, not merely their names in text; a concrete compiled prompt with the producing instructions at its beginning and relevant F-method source text; named exclusions and no unresolved major visual choices. Record the exact request and image attachments before making the call.
5. **Film-safe asset ancestry:** for a repeat character or camera move, name the approved master, registered landmarks, clean plates, masks, and derived views. A new independent whole-frame painting does not count as the same subject under a smooth zoom or acting pose.

If reference files cannot be accessed in the current chat, classify the intended source-grounded run `BLOCKED_SOURCE_WITNESSES_UNAVAILABLE`. **Do not silently submit a text-only provider request and pretend it was the planned style-transfer qualification.** A deliberate text-only *ablation* is valid only when labeled and retained as such.

## Construction-family router

| Visual question in the new script | Mandatory positive construction before imagegen | Reference choices | Typical model prior to actively replace |
| --- | --- | --- | --- |
| Human / mascot / creature | Execute `CHARACTER_FAMILY_CONSTRUCTOR.md`: original head/face/hair/body/surface/contact geometry, canonical pose and state plan | Native character anchors by view and drawing scale; unlike human/mascot counterexample | Painted storybook/Pixar face, anime eyes, realistic curl/fabric texture |
| Functional interior | Actual room/furniture shell and usable surfaces, contact coordinates, focus/quiet regions, each prop under its parent | Brain close acting + Memories clinic versus AI tech environment | Cozy painterly detail filling every background area |
| Outdoor landscape or built city | Geometric substrate, projected axes, meaningful streets/terrain/architecture, assigned contour families and depth masks | Nuclear field vs AI oblique city vs Volcano aperture | Miniature toy-town bevels, per-window randomized color |
| Machine / technology | Housing volumes, top/front/side, actual sockets/control recesses, supports, parent-contained display and material edges | AI computer, AI glass machine, Solar devices | Floating neon boxes/meaningless interface decals |
| Biology / macro creature | Correct species structure, connected biological branches/terminations, near/far masking and surface-owned patterns | Memories membrane/forest, Nuclear macro animal | Unattached confetti, cinematic 3D microscope haze |
| Abstract relational world | Define *what represents what*, coordinate frame, relation graph, stage/substrate, actual connected meaning-bearing marks, controlled reveal | AI information theatre versus Memories pathways and Solar cosmic scale | Generic violet neon grid, free-floating glyphs |
| Luminous/material scene | Draw real bounded physical structure first, owner-limited optical/glow regions, allowed and excluded spill masks | Solar cosmos vs Nuclear facet eyes vs AI device glass | Universal bloom, global plastic sheen |
| View/transition family | Canonical source pixels/geometry, shared landmarks, overscan, true-alpha masks, explicitly changed topology, first incoming action | F14–F16 + motion direction witnesses | Abrupt replacement that masquerades as a continuous camera move |

Use F20 routing and F37–F50 world construction where appropriate. Do **not** force dense worlds into a simple acting shot or character-level texture into an explanatory macro world. Detail is an attached producer, never a generic aesthetic target.

## Execute the first production request in this order

**1. Design truth, viewpoint and attention.** Build audience inference and before/action/consequence. Choose the crop in which proof is readable. Set `focal_order`, named motion owner and actual contact.

**2. Resolve each family separately.** For a person use the character controller A–E. For a world use F37–F50 `world_system`; for a machine or diagram use its actual class/part topology. Record exact shape families, palette roles, materials and allowed detail owner surfaces. Select witness images with *unlike* conditions, explicitly distinguish whose rule applies to which object. If a major style decision remains unsupported, investigate source before provider submission.

**3. Fill the ArtJob and first-pass contract.** Do not begin from free-text prompt prose. Use `scripts/prepare_first_pass.py` with a filled ArtJob and its `first_pass_control` block, which checks real native image paths, a two-reference minimum, per-subject geometry/material choices, and a source-only noncopy contract. Store the generated payload and manifest; the compiler cannot itself call the generator.

**4. Submit to the image-generation tool with the actual evidence images.** Use the generated payload as the image generation prompt **in full** when provider limits permit. Attach exactly the `referenced_image_paths` recorded in the manifest. Never claim the tool received these images from a filename being written in prose. If the tool cannot accept those images, stop the claimed source-conditioned attempt. Provider output must be associated with the actual payload, input-image file hashes and output file identity.

**5. Preserve the *first* output.** Inspect actual pixels and score whole-look, silhouette, material, color, contact, meaningful scene density and animation readiness against conditional source witnesses. Save result as `FIRST_PASS_OBSERVED` even if poor. Only then enter the autonomous repair loop, maintaining a separate `REPAIRED_OBSERVED` status. A revised image cannot retroactively fix first-pass reliability.

## Required `first_pass_control` data contract

This block is additional to the existing ArtJob. Fields must be **filled**; the following is the schema shape only.

```json
{
  "version": 2,
  "viewer_proof": {
    "what_changes": "observable action and consequence",
    "recognition_test": "what a silent unfamiliar viewer can infer",
    "focal_order": ["actual focal subject", "next destination"],
    "camera_view": "actual projection/scale/face"
  },
  "references": [
    {"path": "assets/character_native_anchors/BRAIN_0386_runner_human.jpg", "role": "STYLE_ONLY, full-gesture human contour and color masses", "noncopy": "no source identity, costume, pose, layout or story"},
    {"path": "assets/character_native_anchors/MEMORIES_0753_clinic_humans.jpg", "role": "STYLE_ONLY counterexample, different face/detail/background case", "noncopy": "no source identity, costume, pose, layout or story"}
  ],
  "source_contrast": "what visible difference prevents a universal flatness/palette/face ratio prescription",
  "subject_specs": [
    {"subject_id": "real matching subject_graph id", "family": "HUMAN_ACTING_CLOSE", "shape_topology": "whole outer contour and named attached parts", "material_mapping": "parent-bound region shapes and light operations", "focal_scale_and_view": "numeric bbox, camera-facing and visible parts", "specific_negative_rendering": ["disallowed generic model operation"]}
  ],
  "character_designs": [],
  "palette_roles": {
    "substrate": "actual large backdrop/support fill geometry and chosen original hue role",
    "focal_subject": "which parent silhouettes own highest attention contrast",
    "causal_active": "actual changed part/surface, not decorative symbol scatter",
    "supporting_shapes": "quiet adjacent parent regions with assigned color roles",
    "material_plane_rules": "exact bounded face/underside/inset fills",
    "optical_exceptions": "which material is allowed local glow/reflection and where it cannot spill"
  },
  "density_and_focus": {
    "t1_major": "complete major explanatory topology and supports",
    "t2_owned_partwork": "necessary parent-attached marks or objects",
    "t3_repeats_or_none": "exact allowed repeated microdetails and masks, or NONE",
    "primary_read_region": "where first viewer understanding originates",
    "quiet_support_region": "screen region that must not acquire distracting microdetail"
  },
  "causal_frame_geometry": {
    "named_visible_anchors": [
      {"name": "first named physical origin", "screen_position_norm": [0.18, 0.62], "drawable_parent": "real parent ID", "visible_mark": "specific physical contour at screen position"},
      {"name": "actual endpoint", "screen_position_norm": [0.72, 0.31], "drawable_parent": "real parent ID", "visible_mark": "real connected target region"}
    ],
    "essential_connections": "what actual source→path→target continuum viewer must see",
    "frame_edge_policy": "which named anchor may and may not leave the image border",
    "authorized_overlay_symbols": "NONE unless a specific named educational symbol is deliberately authored and needed"
  },
  "asset_state_plan": {
    "canonical_master": "one actual planned identity source",
    "derivation_path": "what remains same across views/poses or N/A if still",
    "motion_interfaces": ["actual handles and alpha/underpaint states or N/A if still"]
  },
  "forbidden_extras": ["source characters and copied stage", "unasked actors, symbols, or effect gloss"]
}
```

Any human/mascot family requires a matching detailed entry in `character_designs` according to `CHARACTER_FAMILY_CONSTRUCTOR.md`. Nonhuman scenes still require complete `subject_specs` and the underlying world graph. A literal placeholder is a defect. The scripted validator verifies *presence/shape/identity reference feasibility*, not semantic correctness, perceptual style or compliance by a stochastic image model.

**Evidence-driven causal geometry repair:** Two first-pass November 2026 unfamiliar images followed flat color/subject-style rules much better than the earlier painterly examples, yet demonstrated different invented spatial failures: the human/instrument image inserted an unauthorized floating white arrow, and the geological refraction cutaway began its ray outside the frame instead of drawing the specified crack source. These are upstream semantic-endpoint and provider-prior failures, not reasons to add more decorative detail. Every new first-pass job must now name at least two *visible actual endpoint anchors*, their normalized image positions, connected parent owners, a no-clipped-cause frame policy and any deliberately authorized diagram glyphs. **Do not retroactively relabel the first two images as successes on those criteria.** The `causal_frame_geometry` block is fail-closed at compile time; semantic execution still needs pixel review.

## Non-negotiable execution and evidence separation

- `DESIGNED` — the new scene and actual surface geometry specified.
- `COMPILED_WITH_IMAGES` — required files exist and actual payload + image hash manifest is produced.
- `SUBMITTED` — the image-generator call was actually issued with the declared `referenced_image_paths`.
- `FIRST_PASS_OBSERVED` — actual output seen and critically compared.
- `REPAIRED_OBSERVED` — a distinct edit/regeneration performed and compared; cannot become first-pass success.
- `GENERALIZATION_TESTED` — unrelated unfamiliar subjects pass in a fresh chat without leaked scene fixes.

Make the tool call and its images available for audit. A successfully compiled prompt never proves `SUBMITTED`. An image without its request/witness ancestry never proves source-grounded transfer. A correct image doesn't establish consistency across many new chats. This repair aims to materially improve the *first* source-guided result, while retaining the second loop as exception handling.
