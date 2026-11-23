# Executive report: how the neutrino film was made

Written by the same Claude Code session that produced the film. Its full transcript was still in context. Every claim was checked against files, git and the session log. Details and evidence labels are in files 01–10.

## The five most important findings

1. **One prompt, no user corrections, ~72 minutes.**
   - The film came from a single pasted prompt plus the `DIRECTION_V4` folder.
   - The user said nothing more until the finished file existed (01, 02).
2. **No image model and no imported art.**
   - Every visual — character, rooms, planets, detector, labels — was written as SVG by JavaScript generators during the session.
   - The only raster is a numpy grain overlay (04).
3. **Motion is computed, not listed.**
   - A 276-line runtime (`assets/nu.js`) turns each scene into a function of time, driven by one GSAP tween per scene. It provides:
     - keyframe tracks with real eases and path morphing;
     - free procedural functions;
     - a multi-plane camera;
     - deterministic particle fields;
     - a character rig with derived secondary motion.

     HyperFrames only seeks and records it (03).
4. **Art and motion were authored together.**
   - Each object was drawn as a motion-ready group in the same function that choreographed it.
   - The character is a joint hierarchy controlled by ~25 numbers (04).
5. **A fast look-and-fix loop removed the fatal defects.**
   - 24 defects were found on real pixels or measurements and fixed.
   - At least 4 would have ruined the film: frozen scene, invisible arms, invisible cone, flash out of sync.
   - The ideas were mostly right in the first drafts; the loop fixed execution (06).

## Actual production architecture

`script.json` → local Kokoro TTS per sentence → `timing.py` (freeze the clock) → `mkscenes.py` (scene slots) → `scene_*.mjs` generators (art + choreography using `lib.mjs` and `nu.js`) → `build.mjs` → `compositions/*.html` + `index.html` → `hyperframes render` (headless Chrome seeks each frame) → FFmpeg loudnorm → `final.mp4`.

Review between every step:
- snapshots and frame sheets;
- `motion.py`;
- `hyperframes check`;
- `dupcheck`.

## Why it moved successfully

- **Anything can move, because everything is a function of *t*.** The engine is the reason motion ideas were cheap.
  - Each staging invention cost a few lines rather than an engine change: the counting gag, the window that becomes one cell of a building, the opening Sun wedge, per-sensor light arrival, rising streaks under the boots.
- **Motion-friendly construction from birth.**
  - Separate groups with pivots and depth planes.
  - The same streak seed in front of and behind objects (the "passes through" illusion).
- **Secondary motion is automatic:** breathing, blinking, velocity-driven hair, umbrella counter-rotation, lagged poses. The character never freezes.
- **The voice is the clock.** Beats were written as "sentence N + seconds". Where that estimate was wrong, review caught it.
- **The direction gave strong intent** (script, facts, character, motif, beat ideas). It **left all mechanics to the builder.**

## What the old system did that the new one failed to do

**Corrected:** this compares the film's system with `E:\THE ANIMATION LAB` at commit `7d4e0c0` (07). An earlier draft wrongly used `G:\AnimationLabV0`.

| The film's system | V3 |
|---|---|
| Lets the author run arbitrary code per frame | Draws only approved raster PNGs; animates only x, y, rotation, scale and opacity, plus cel swaps and one articulation per owner (`src/scenes/Film.tsx`, `src/runtime/types.ts`) |
| Draws parts and motion together | Imports GPT art made separately under the F01–F80 skill |
| Treats checks as instruments | Validates packets with schemas and QC modules; their effect on results is unmeasured |

These differences are **proven from source**. That they *caused* V3's weak look is **probable, not proven**: no V3 render was inspected.

## How the visual style skill could fit

**The F01–F80 skill was located** at `E:\THE ANIMATION LAB\construct-kurzgesagt-art.zip` but not yet read, so compatibility is still unassessed (08).

The method with the highest evidence-backed confidence:
1. Make a model sheet under the style skill.
2. Reconstruct it as a part hierarchy with the same joint names and controls as the current rig.
3. Keep particles, diagrams and transitions code-native.
4. Environments may be layered raster plates, as long as every moving element is its own layer.

The weak points will be: hands, lighting that must survive rotating parts, and extra views.

## Preserve

- The function-of-time runtime (`nu.js`), with its rig, camera and particles.
- The generator → HTML build.
- Voice-first timing.
- Motion-ready construction rules.
- The QA instruments.
- The look-and-fix habit.

## Discard

- The ceremonial animatic.
- One-off patch scripts.
- The procedural music.
- Any rule that lets a passing check stand in for looking at frames.

## Confidence

- **High** that the architecture can be reused for a new topic. The runtime, rig API, particles, camera, build and timing are topic-agnostic. About a third of the code (`lib.mjs` helpers, `nu.js`, `build.mjs`, QA) transfers unchanged.
- **Medium** that a second film reaches similar quality without this session's specific author effort. Each scene was still hand-written art code, and only one film exists as evidence.
- **Low to medium** that much more sophisticated art keeps the same motion quality. That needs the one-character acting test described in 08.

## The 20 questions

Short answers; the evidence is in the numbered files.

1. **Most important reason:** a runtime where motion is arbitrary code over time, applied to art built as moving parts by the same author.
2. **Illustrations:** SVG markup generated by JS functions, written from the direction's prose. No images.
3. **Characters:** a joint hierarchy, pose keyframes with lag, derived secondary motion, 6 mouth shapes.
4. **Environments:** 3 depth planes of code-drawn SVG with seeded procedural detail; moving props as their own groups.
5. **Independent objects:** their own tracks or `S.at` functions; particles from hashed closed-form positions.
6. **Transitions:** shared geometry and matched cuts (window hole = frame, Sun surface scale-match, core iris), foreground wipes, hard cuts.
7. **Camera:** a `camera()` keyframe on x, y and zoom, applied per layer as `zoom^depth` for parallax.
8. **Sync to narration:** beats written as sentence start + offset from `timing.json`; one late correction after review.
9. **What the direction specified:** script, facts, character identity, palette, motif, hero frames, most beat ideas, gates.
10. **What Claude invented:** every mechanic, timing, ease and pose; the engine; several key stagings.
11. **User intervention:** none during production.
12. **Review loop:** removed 24 defects; essential for execution quality.
13. **Missing from the recent pipeline (E:\THE ANIMATION LAB @ 7d4e0c0):** procedural motion over time, vector drawing, rigs with derived motion, particle fields, shape morphing, art authored as moving parts. Proven from source.
14. **Worth retaining from recent work:** cost governance, validation for structure (not taste), measurement tools, editable documents.
15. **Reusable for a new topic:** `nu.js`, `lib.mjs` helpers, the character API, `build.mjs`, the timing scripts, the QA tools.
16. **Neutrino-specific:** the scene modules, the art functions, the Cherenkov and flavour mechanics, the character's look.
17. **Same architecture with richer art:** probably, using part-based reconstruction; not yet tested.
18. **Can the visual skill be adapted:** unknown. The skill is located but not yet read.
19. **Remaining limits:**
    - front-only character;
    - estimated word timing;
    - hand-written art per scene;
    - unheard, weak audio;
    - only one film as evidence.
20. **The smallest, highest-leverage change:** make the `nu.js`-style function-of-time runtime the default renderer contract, and require every asset to be delivered as motion-ready parts. Keep any scene document as a *caller* of procedural behaviours, not the limit on them.
