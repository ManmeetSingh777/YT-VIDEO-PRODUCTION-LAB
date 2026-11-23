# 08 — Visual style compatibility

## 0. Limitation first

**Update after the user's correction:** the F01–F80 skill has now been located as `E:\THE ANIMATION LAB\construct-kurzgesagt-art.zip` [OBS].
- It holds 110 files, including `SKILL.md`, `FIVE_FILM_STYLE_GUIDE_INDEX.md` and source-witness images.
- It is referenced by `ELON_OPENAI_FINAL_VISUAL_SKILL_QUALIFICATION.md` ("Verify F01–F80 … `MOLECULAR_CONSTRUCTOR_F57_F80.md`").
- Its contents have **not yet been read**, so the assessment below is still unverified against its rules.
- Note for whoever reads it: the skill's name and its witness images derive from a specific studio's films. `DIRECTION_V4` asked for original work that does not copy identifiable material from Kurzgesagt, so that tension needs a decision before the skill drives production art.

The original search, before the correction, found nothing [OBS]. It covered:
- `~/.claude/skills` and `~/.claude/plugins`;
- `G:\AnimationLab*` folders;
- `G:\AnimationLab_ExperienceStudio\STYLE_MASTERY_SYSTEM`;
- `.md` files under `G:\`, for the tokens `F80` / `F01…F8x`.

Without reading it, this file **cannot** say whether its rules are compatible. What it does instead:
1. states what this film proves about each asset category, from evidence;
2. gives the construction method that is most defensible for each category;
3. lists the exact questions to check once the skill is located.

Candidate location to check: `G:\AnimationLab_ExperienceStudio\STYLE_MASTERY_SYSTEM\` (has `SKILL.md`, `CHARACTER_AND_RIG_SYSTEM`, `ILLUSTRATION_CONSTRUCTORS`). It is **not verified** to be the F01–F80 skill.

## 1. What the film proves about code-native vector art (evidence)

- Code-native SVG reached a clean, flat-gradient editorial style that reads well at thumbnail and at 1080p.
  - Observed in `hero/` and `proof/qa/final_1.png`.
  - Evidence: multiple light sources, designed shadow planes, rim lights, three depth planes, seeded detail density.
- It did **not** reach painterly texture, line-weight variation, complex anatomy, fabric folds in motion, or detailed hands [OBS + `REVIEW.md`].
- Quality depended on the author imagining coordinates without a reference image. First looks had construction errors in 3 of 5 hero scenes (06).

## 2. Category-by-category assessment

| Category | What the film shows | Most defensible method for higher sophistication | Confidence |
|---|---|---|---|
| Hero characters | Jointed code vector works for acting and consistency; style ceiling is simple | **Image-generated (or hand-drawn) model sheet → editable layered reconstruction**: separate vector parts per joint, pivots at anatomical joints, the same `actor()`-style control set. Paint fidelity comes from the reference; motion from the rig | Medium. Method proven for motion here; reconstruction fidelity unproven |
| Faces / expressions | Feature groups + 6 mouths + continuous brow, lid and look controls stayed on-model | Same: expressions as **parameters over separate feature layers**, plus a small set of drawn mouth/eye shapes. Avoid one full face image per expression | Medium-high |
| Arms / hands | Stroked-tube limbs; 3-finger hands; FK only | Layered limb segments with overlap caps at joints; a hand **shape library** (5–8 drawn poses) swapped at contacts; optional 2-bone IK for reach | Medium. Hands are the known weak point |
| Environments | Code vector, 3 planes, seeded detail | **Layered raster plates are viable** if every element that must move is its own layer. Static depth can be one image per plane, with code overlays for lighting, life and particles | Medium-high. The film moved its environments mostly by parallax, plus a handful of animated props |
| Props / machines | Each moving part was its own group (lamp, lid, umbrella canopy, sensors, strings) | Any art source, **provided parts are separated at the pivots the story needs**. Decide the motion list before drawing | High |
| Particles / effects | Procedural fields + gradient glows | **Code-native.** A style skill should define the particle *look* (shape, tail, glow, palette) as a symbol, not as painted images | High |
| Scientific metaphors | Geometry *was* the explanation (wedge mask, sectors, 41° cone, arrival-time colours) | **Code-native geometry**, styled by the skill's palette and line rules. Static illustrations cannot carry cause → change → consequence | High |
| Transitions | Shared geometry: window hole = frame; Sun surface scale-match; core iris; cloud wipe | Code-controlled. Requires both scenes to share a coordinate system or a matched element. Easier with vector or layered plates than with flattened images | High |

## 3. Highest-confidence method for combining sophisticated character art with this motion system

1. **Design first, as a model sheet.**
   - Front view only at first, since that is all the film needed; ¾ and side views later.
   - Produced under the style skill, by image generation or by hand.
2. **Reconstruct as a part hierarchy** matching `character()`'s joints:
   - root/hips, torso, neck, head, face plane, eyes, pupils, brows, mouth set, hair back/front, curl, upper/fore/hand × 2, thigh/shin/foot × 2, props.
   - Each part is vector paths. Raster parts are also possible as clipped images, if the style needs texture.
3. **Keep the control contract identical:** the same ~25 pose parameters, the same lag table and the same derived-motion functions. Then all choreography code transfers unchanged.
4. **Add only what sophistication demands:**
   - a hand-pose library;
   - mouth shapes for phonemes if lip-sync is wanted;
   - per-view head drawings with crossfade at turn angles.

### What gets harder as the art gets more sophisticated
- More parts mean more seams at joints.
- Shading must survive rotation. Painted-in light breaks when a forearm rotates 90°; light must be rebuilt as separate layers.
- Texture can swim if parts scale.
- Render time rises: filters and large rasters are slower than flat SVG.
- Every new view becomes an art task, not a code task.

**No evidence here guarantees a style match.** The first test should be one character, one 5-second acting beat, compared with the skill's references.

## 4. Questions to answer once F01–F80 is available

1. Do any rules assume a finished single image (lighting baked across the whole figure, painterly edges)? Those conflict with rotating parts.
2. Which rules govern **construction** (shape families, silhouettes, proportions)? Those transfer directly to a part hierarchy.
3. Does the skill define motion or only stills? If only stills, add a "part map and pivots" section to it.
4. Which rules are about image-model prompting rather than geometry? Those apply to the model-sheet step only.
