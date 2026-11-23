# 07 — Successful vs failed pipeline (corrected)

## Correction notice

The first version of this report identified `G:\AnimationLabV0` as the failed V3 project ("probable, not confirmed").
- **That was wrong.** The user identified the failed engine as **`E:\THE ANIMATION LAB`, commit `7d4e0c0`**.
- This version is based on that repository, read-only via `git show 7d4e0c0:<path>`; nothing was checked out or modified.
- `G:\AnimationLabV0` is an earlier, separate AnimationLab project (Remotion 4.0.535 keyframe-schema renderer). It is no longer used as the comparison.

## 0. What was examined and what was not

**Identified** [OBS]:
- `7d4e0c012d3aa8d28e33a2f45cc5c3b5e7daf8af`, 2026-11-21 02:47 +05:30.
- Message: "Real-film production bridge: generic GPT-package import into the V3 engine".
- HEAD is one commit later: `5170437` "Motion primitives: per-owner PATH_REVEAL / PATH_FLOW_WINDOW and camera_depth in the live V3 engine". It is **not** part of the 7d4e0c0 comparison.

**Read at 7d4e0c0** [OBS]:
- `package.json`;
- `src/scenes/Film.tsx` (99 lines);
- `src/runtime/types.ts`;
- `src/runtime/evaluate.ts` (259 lines);
- the source tree (233 tracked files);
- the bridge commit's change list.

Also present in the working tree: the Elon/OpenAI material (`ELON_OPENAI_FILM_ART_COMPLETE_PACKAGE_v01.zip`, `ELON_OPENAI_FINAL_VISUAL_SKILL_QUALIFICATION.md`, diagnostic zips) and the F01–F80 skill archive `construct-kurzgesagt-art.zip` (110 files).

**Not examined:**
- any V3 rendered MP4;
- the GPT artwork itself;
- V3 session transcripts;
- the tests.

**So the comparison of mechanisms is direct, but the comparison of visual results is still incomplete.**

## 1. The V3 engine at 7d4e0c0, from source

- **Stack:** Node ≥ 22, TypeScript, **Remotion 4.0.540** (`@remotion/bundler`, `@remotion/renderer`), React 18.3.1, ajv (schema validation), pngjs. The package description reads: "AnimationLab V3 deterministic creative-packet executor (P0-P7). Renders only GPT-approved art".
- **Renderer contract**, from the `src/scenes/Film.tsx` header, verbatim:
  > "Renderer: draws EXACTLY the display list from evaluateFrame(). It has no drawing primitives of its own (only `<image>`, `<g>`, `<mask>` referencing approved raster assets). Anything visible comes from an approved asset file"
- **Animatable properties:** `Prop = 'x' | 'y' | 'rotation' | 'scale' | 'opacity'` (`types.ts`). Camera tracks: `target_x`, `target_y`, `zoom`, `angle`. `value` is for quantities.
- **Assets:** `CompiledAsset` is a PNG (`RGB_PNG`, `RGBA_PNG` or `MASK_PNG`) with hash, size, origin and named anchors.
  - Actor assets are **cels**, each registered with `pose_id`, `view_id`, `visible_contour_id`, `occlusion_state` and `contact_state`.
- **Character motion:**
  - an owner shows one asset at a time; `states: {from, asset_id}[]` switches cels by frame;
  - `STATE_TABLE` quantity bindings switch cels by value;
  - plus **one** optional `Articulation`: a single angle track about a pivot anchor, with a limit envelope and valid views;
  - `CarryAttach` pins a prop's anchor to a hand anchor.
- **Motion evaluation:** `sampleTrack()` interpolates keyframes with an easing spec; `ownerPose()` composes parent matrices; `cameraMatrix()` applies a depth coefficient per world layer (parallax).
- **No path for arbitrary code per frame:**
  - no procedural functions;
  - no vector drawing;
  - no particle fields;
  - no shape morphing;
  - no attribute animation beyond the five properties [CODE].
- **The bridge commit** adds `src/import/profiles/gpt_handoff_v1.ts` (370 lines) to import a GPT art package into this engine.

## 2. Mechanism comparison

| Dimension | Neutrino (successful) | V3 at 7d4e0c0 | Classification |
|---|---|---|---|
| Source of pixels | SVG drawn by the same code that animates it | Only approved raster PNGs from a GPT package; renderer has no drawing primitives | **Proven difference** [CODE]. Effect on quality: probable |
| What can change over time | Any attribute or geometry, via `S.at(fn)` and tracks (paths, colours, points, radii, text, dash offsets) | x, y, rotation, scale, opacity per owner; asset swap; one angle articulation | **Proven difference** [CODE] |
| Character construction | ~20 jointed vector parts, ~25 continuous controls, derived secondary motion (breath, blink, curl spring, lagged poses), 6 mouths | Whole-pose PNG cels by pose and view, swapped by frame or state, plus one articulated part | **Proven difference** [CODE]. Cel swapping reads as "pose slideshow" unless cels are dense: **probable cause** of stiff acting |
| Particles / streams | Deterministic procedural fields, hundreds of instances, density animated | None at 7d4e0c0. Each moving thing must be an owner with tracks or a raster | **Proven difference**; **probable contributor** |
| Explanatory geometry | Wedge masks, sector cutaways, 41° cone, arrival-time colours computed per frame | Must be pre-drawn PNGs or masks moved by five properties | **Proven difference**; **probable contributor** |
| Camera / parallax | Multi-plane `z^depth` camera | Per-layer depth coefficients (`CompiledLayer.depth`); `camera_depth` per owner added later in `5170437` | **Comparable**. Not a cause |
| Art ↔ motion authorship | Same author, same function, same moment | Art made by GPT under the F01–F80 skill, then imported; motion compiled from a packet | **Proven difference** in process. Effect: **probable contributor** (art not designed around its motion) |
| Validation vs judgement | Checks as instruments; judgement on pixels | ajv schemas, QC modules (`qc/video.ts`, `attention/check.ts`, `transitions/check.ts`, `creative/checks.ts`) | **Possible explanation**. Effect on results unmeasured here |
| Determinism and render | HyperFrames seek → Chrome screenshot | Remotion per-frame React render of a display list | **Not a cause**. Both are deterministic frame renderers |
| Complexity | ~2,450 hand lines | 233 tracked files, multi-stage pipeline P0–P7 | **Not supported** as a cause by itself |

## 3. Most defensible causal statement

At 7d4e0c0 the V3 engine **cannot express** most of the motion that made the neutrino film feel animated:
- the character's continuous facial and body acting;
- secondary motion derived from primary motion;
- particle populations;
- geometry that changes shape to explain.

This is shown by its own type definitions and renderer contract, not inferred from its output.

That this restriction **caused** the weak V3 films is **probable but not proven**. The visual results were not inspected, and no controlled test was run.

**Direct test:** take one V3 shot with its GPT art, rebuild the same shot with a `nu.js`-style runtime (same art split into parts plus procedural motion), and compare both under the same review.

## 4. Worth keeping from V3

- Asset provenance and hashing (`CompiledAsset.sha256`, `art/registry.ts`).
- Anchors for contact (`CarryAttach`): a real gap in the neutrino rig, where the palm position had to be computed by hand.
- Cel metadata (`pose_id`, `view_id`, occlusion, contact). This is useful as a *pose library* layered on top of a jointed rig.
- Schema validation of packages, as long as validation stays structural.

## 5. Still incomplete

1. Render-level comparison: sample a V3 final MP4 with `motion.py` and frame sheets.
2. Inspection of the GPT art package to see how finely it is split into parts.
3. A read of the F01–F80 skill (`E:\THE ANIMATION LAB\construct-kurzgesagt-art.zip`) for report 08.
