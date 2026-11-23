# Original-character construction controller — source-specific rules, unfamiliar identities

**Status:** an upstream production repair. It was built after comparing five original film MP4s and the failed Asha/ferry clean-room first passes. The film observations below are source observations; numeric bounds in a novel `character_design` are **new, per-character design choices**, never claimed to be universal ratios of the studio. No source character may be traced or copied.

## A. Select a construction family before inventing the person

Choose the family because of the figure's role and visibility in the *new* demonstration, not because one reference picture is attractive.

| Family | Observable use / drawing problem | Source STYLE-ONLY native witness and unlike comparison | What cannot transfer |
| --- | --- | --- | --- |
| `HUMAN_ACTING_CLOSE` | Facial thought, glance, expression, head turn, speaking or prop manipulation is readable | `BRAIN_0157_couch_human.jpg`, `MEMORIES_0753_clinic_humans.jpg`, **new unlike** `MEMORIES_10101_close_human.jpg`; contrast `AI_34051_small_human_abstract_stage.jpg` | The original facial identity, hairstyle, clothing, scene pose, or one fixed eye/head ratio |
| `HUMAN_GESTURE_FULL` | Full-body cause, stride, reach, weight, support, or urgent act | `BRAIN_0386_runner_human.jpg`, `NUCLEAR_0083_farm_humans.jpg`; contrast `MEMORIES_0753_clinic_humans.jpg` | Copied movement sequence or universal rubber limb shapes |
| `HUMAN_REAR_OCCLUDED` | Back-of-head silhouette, shoulder/arm/hand-to-tool contact, no visible frontal face | `AI_0234_rear_operator.jpg`; contrast `BRAIN_0386_runner_human.jpg` | Invented eyes on a hidden face or copied computer and hair |
| `MASCOT_SIMPLE` | Symbolic character with species-specific readable body and face | `SOLAR_0178_mascot.jpg`; contrast Brain birds in `BRAIN_0157_couch_human.jpg` | Same round body, eye or beak for all new species |
| `ANIMAL_OR_MACRO_BIO` | Actual species anatomy, hooves/wings/muzzle/eye facets and meaningful articulation | `NUCLEAR_12174_macro_biological_subject.jpg`; separately inspect the fly-native witness in character board; contrast `MEMORIES_10101_close_human.jpg` | Cow/fly parts used to represent unrelated animals |
| `DISTANT_POPULATION` | Whole actor at very small scale within a designed environment | `AI_34051_small_human_abstract_stage.jpg`, `NUCLEAR_0083_farm_humans.jpg` and `BRAIN_0060_busy_street.jpg`; contrast `MEMORIES_10101_close_human.jpg` | Close-up eye/hair microstructure multiplied into every tiny actor |

The original source images live under `assets/character_native_anchors/`; the **newer conditional anchors** live under `assets/conditional_native_anchors/`, and the `BRAIN_0060` witness lives under `assets/molecular_native_anchors/`. Every image is STYLE ONLY. See `CONDITIONAL_NATIVE_QUESTION_LOOP.md` for the Q1 contrast: close acting, distant symbolic human and macro biological anatomy require **different feature budgets**. Use two unlike sources whenever possible; the new script alone supplies character identity, occupation, ethnicity, dress, and gesture.

## B. Construct the *novel* canonical figure as drawable geometry

Do this **before** an office, harbor, laboratory or landscape is commissioned. A rich full-scene prompt often causes an image model to choose a generic painted-film character dialect while fulfilling the story.

1. **Screen role and viewing scale.** Record the viewer's first observation, the focal figure's screen-space bounding box in fractions of the intended output (left/top/right/bottom in 0–1), actual projection/facing, and smallest planned display scale. Distinguish close acting, full gesture and distant population. All numeric proportions are authored for this specific unfamiliar identity and view; never import one source actor's exact dimensions as a studio law.
2. **Whole silhouette.** Provide a contour construction path in words plus at least four individually named masses with explicit overlap: skull/hair; face/neck; torso/garment; near/far arm/hand; hips/near/far legs/feet as applicable. Each mass has screen-side, attachment anchor and parent. Test at one-tenth size **before adding eyes or clothing markings**.
3. **Cranium and hair.** Draw a single purposeful outer hair silhouette with a finite list of contiguous overlapping colored lobes and specified root, lock, parting and occlusion order. Do not replace this with hundreds of realistic curl strands, volumetric sheen, hair follicles or a painterly hair-light shader. An original curly, cropped, braided, long, bald or covered hairstyle needs its own appropriate outline; do not make all hairstyles a fixed three-lobe cap.
4. **Face plane and expression.** Define exact visible side(s), ear/jaw/neck overlap, eye shapes as actual colored regions, brow region placement and mouth opening/closure. For three-quarter view explicitly identify near and far eye shape and visibility. For rear view explicitly suppress hidden face features. The nose/cheek are bounded colored forms on the face, not realistic nasal modeling, lashes, skin pores or soft beauty lighting. The expression is a geometry relationship among brow, lids, pupils, mouth and head angle, not an adjective like “curious.”
5. **Gestural body and support.** Give torso facing, shoulder axes, near/far bent sleeves, hip/leg mass relation, contact support, hand topology and grip occlusion. At a full-body distance, make hands readable *as task-specific silhouettes*; do not generate photographic fingers and cloth wrinkles only to imply craftsmanship.
6. **Surface language.** For each parent material, specify base fill, zero or more attached lighter/darker regions, border shape, allowed local light and prohibited rendering operations. No global airbrush bevel, skin gradients, simulated cloth microtexture, ambient occlusion or intricate wood/cloth grain unless a *conditional named material* and relevant film witness justify it. A world may support detailed machinery or biology while keeping actors much simpler.
7. **Facial-state drawing plan.** Specify neutral, speaking/concerned or chosen action states through changed *whole visible contours*: brows, lids, mouth, hair overlap, neck and body. Preserve permanent identity anchors and actual contact relationships; use redrawn states when topology changes.

### Actual producer-ready character record

This is a **schema**, not a reusable character design or a source-scene template. Fill every bracket from the unfamiliar script and relevant witness observations.

```yaml
character_design:
  subject_id: "matches subject_graph id"
  family: "HUMAN_ACTING_CLOSE | HUMAN_GESTURE_FULL | ..."
  unique_original_identity: "original traits and reason they matter"
  intended_view: "facing, near/far side and viewer eye target"
  screen_bbox_norm: [0.10, 0.08, 0.75, 0.92]
  minimum_screen_height_px: 350
  silhouette:
    outline_path: "specific contour and changed directions, not 'cartoon person'"
    named_masses: ["parent: shape, attachment, occlusion", "..."]
    near_far_order: ["hair in front of ear", "hand over near prop rim", "..."]
  head:
    skull_contour: "new identity-specific path"
    face_plane: "visible skin shape, near/far jaw/ear"
    hair_outer_path: "new identity-specific path"
    hair_lobes: ["contiguous lobe and root", "..."]
  face:
    visibility: "front | three_quarter | profile | rear_hidden"
    eye_regions: ["near opening/sclera/pupil and position", "far visible counterpart or omission"]
    brow_regions: ["actual arc/block and relation to eyes"]
    nose_region: "visible bounded silhouette or omission"
    mouth_region: "actual closed/open contour and fill"
    expression_geometry: "how brow/lid/pupil/mouth/head angle jointly change"
  body:
    garment_masses: ["major colored torso/sleeve/leg group with parent and support"]
    hand_construction: ["finger/palm/thumb grouping and actual contact"]
    support_and_weight: ["feet, seat or other support anchors"]
  color_surfaces:
    - {owner: "skin", base_fill: "assigned hue role", patches: ["exact bounded cheek/ear surface"]}
    - {owner: "clothing", base_fill: "assigned hue role", patches: ["elbow underside follows garment bend"]}
  rendering_exclusions: ["no continuous painterly face shading", "no microtexture on clothing", "no anime eye reflections"]
  state_family: ["canonical neutral pose", "actual differing gesture/expression state"]
  original_content_noncopy: "no copied source face, pose, costume, scene or identity"
```

The example numbers only explain the 0–1 coordinate format, **not** mandatory target proportions. Output a *filled record* for every focal original actor before a generation request. A surface name is not enough: attach an actual shape, location, parent, color role and overlap to each decision.

## C. Make the first image a construction confirmation, not a full painting gamble

**First provider request:** a canonical character drawing at the intended gesture and view with only the minimal support/contact objects required to verify the actual pose. Use the source-witness images as `referenced_image_paths` (or platform-equivalent image attachments). Instruct that they demonstrate STYLE ONLY, not faces/identities/poses to copy. Include the filled record above and the F01/F02/F03/F05/F06 source methods. Explicitly require flat opaque fill-region geometry and bounded parent-owned color patches rather than realistic painterly lighting.

**Second stage:** use the approved canonical image itself as the *identity/edit target* for expressions and camera views. Any genuine topology change gets a new whole drawing, not a 2D rotation of a severed limb or an unrelated redraw. Define immutable silhouette/feature landmarks and actual overlap anchors. For a screen-sized sequence, record the asset states and clean underpaint/masks before claiming animation-readiness.

**Third stage:** compose character into the complete purposeful environment from its own validated world/medium specification. Avoid a full-detail office/habitat as the initial style-defining image. Environment density, palette and projections serve the visual explanation; they must not arbitrarily re-render the character.

**Fourth stage:** compare the first *whole-looking* generated candidate against 2–3 unlike source witness mechanisms and the current specific `character_design`. Repair a mismatch only after naming which producing operation was absent or ignored; preserve old image and actual new provider request. Iteration is a secondary recovery instrument; a correction cannot be retrospectively counted as first-pass accuracy.

## D. Source observations vs unsupported universal assumptions

- **Observed across unlike humans:** large contiguous color masses; hair and garment contour ownership; brows, pupils and mouths drawn as bounded functional shapes; gesture-dependent sleeve/hand design; varied expressive head contours; selective material patches instead of global dark ink/photographic light.
- **Not established universally:** one head/body ratio, fixed eye/face coordinates, exact number of locks, one palette, a global stroke weight, one degree of facial simplification, one movement timing, exact source tool/brush settings.
- **Known failure evidence:** the first clean-room Asha image had fine individual hair/cloth rendering, realistic environmental illumination and a painterly face; a later edited version flattened portions but retained an alternate face dialect. The ferry actor retained realistic hair curls/coat modeling. Those are `FIRST_PASS_STYLE_DRIFT`, not proof that a correction-loop skill fully transferred.

## E. Redesign when contradiction arises

If a new original subject requires a feature not seen in the sources, choose an anatomy-true original geometry and apply only verified cross-family fill/attachment methods. If its class has no proper comparison anchor, acquire targeted source evidence before certifying. Keep a record `source evidence → method → actual prompt text + image inputs → observed pixels → corrected transferable rule`. Never repair one character by hard-coding that character's face into the global skill.
