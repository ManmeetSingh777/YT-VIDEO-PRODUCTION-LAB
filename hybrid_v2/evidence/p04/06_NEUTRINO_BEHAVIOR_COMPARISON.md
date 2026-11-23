# Original Neutrino acting/motion vs the art-driven equivalent (P04 §5)

Reference: `reference/neutrino_2m_SOURCE_PACKAGE/source/assets/nu.js` (preserved; `engine/runtime/nu.js` byte-identical, sha `773baf91…`). The original is code-drawn vector art; the engine drives **approved raster/vector drawings** through the same `S.at`/`S.set`/`S.done` runtime. Nothing here re-creates the original character or scenes.

| original capability | where in the original | current art-driven consumer | proven by | transfer (unlike subjects) | explicit missing capability |
|---|---|---|---|---|---|
| pose timing on authored keys | actor timeline | `temporal.compileMotionTracks` (keys + eases) | P03 A1/D1, P04 D/IR | creature neck/tail | — |
| lag (head 0, torso .04, hips .05, forearms .11, hands .14 s) | actor lag map | `acting.compileActing` lag from **rig depth** | A1: head +6 f, creature head +12 f (two-segment neck) | yes, from rig topology | no per-joint authored curve per performance style |
| breathing (torso rotation/scale sine) | actor breath | acting breath: **additive rotation only** (no scale on art) | A1 (scale = 1 on every matrix) | creature body breathing | none required |
| head sway / gaze | actor head | acting gaze: bounded additive turn toward a target | E/F gaze tests, feasibility | creature eye toward world target | no eye-dart saccade model |
| blink every ~3.1 s, 0.13 s | actor blink | approved EYES channel swap, priority over acting default | B1, G1 counterfactual | creature single eye | — |
| six mouth shapes toggled by opacity | actor mouth | MOUTH channel states (approved drawings) from measured words | A/P03 speech, P04 persistence | — (no viseme set beyond rest/mid/open) | no phoneme-specific visemes (art needed) |
| curl spring for hair by head velocity | actor curl | `secondary` baked spring, driver joint, fixed step | F5: hair 6.4°, tail 4.7° | creature tail | — |
| finger spread / squash | actor hands | HAND channel closure drawings + grip verification | P04-5.3 | — | finger spread is an approved drawing, not a generic rig (by rule) |
| object counter-rotation | actor props | HINGE_FOLLOW reaction (object follows the pull) | F3 | lever (mechanism) | only hinge-type reactions; linkages/gears not modelled beyond GEAR_TRAIN |
| frame-addressable absolute seek | S.at clock | unchanged (`bridge_rt.js` applies baked rows) | determinism tests | yes | — |
| coordinated performance | scene timeline | phrases (multi-owner) + acting + grips + reactions in one compile | D1/F1–F3 | creature + lever | full crowd/multi-rig performances beyond 3 rigs not exercised |
| no IK | — | TWO_BONE_IK + measured contacts + balance | F1/F2 | — | — |

**Deliberate differences.** The original's smooth vector morph (`mixPath`) was unused in the scenes; here vector morphs require registered homologous paths and are refused otherwise. Image-space scaling of artwork is not used as motion (rotation only), so approved pixels keep their shape.

**Capabilities with no equivalent yet:** viseme sets beyond three mouth shapes; authored per-joint performance curves from a performance library; gears/linkages with more than one driver; camera-space art (all movement is 2D); real GPT faces with separately drawn brows, lids and pupils (the fixture uses one eye drawing and a brow vector).
