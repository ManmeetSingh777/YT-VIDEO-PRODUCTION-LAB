# 04 — Art and character forensics

## 1. Headline findings

- **Every visual asset in the film was written as SVG markup by code during the session** [OBS + CODE].
  - No raster illustration, imported SVG, stock asset or image-generation model was used.
  - No image API was called, and none was available without paying.
- The only raster file is `assets/grain.png`: numpy noise plus a vignette, overlaid on everything.
- The fonts Outfit and Archivo Black come bundled with HyperFrames.
- The hero PNGs in `hero/` are *captures* of the rendered film, not sources.

The art was drawn *in code*: coordinates, Bézier paths, gradients and seeded random placement. That code was written by Claude from:
- the direction's prose descriptions (palette, character traits, the five hero-frame paragraphs);
- general illustration knowledge.

There was no visual reference image.

## 2. Asset provenance matrix

Key:
- **C** = entirely code-generated vector (SVG strings from JS);
- **P** = procedural *during render* (positions, shapes or attributes computed per frame);
- **Parts** = animated as independently moving parts vs one rigid group.

| Asset class | Method | Source (generator → module) | Parts? | Notes |
|---|---|---|---|---|
| Main character | C + P (rig) | `character()` in `tools/lib.mjs`; driven by `S.actor()` in `assets/nu.js` | **~20 independently driven groups** | See §3 |
| Facial expressions | C + P | `face` block inside `character()`: eyes, pupils, brows, 6 mouth groups | yes | Expressions are combinations of continuous controls plus one discrete mouth swap |
| Arms / hands / legs | C + P | `arm()`, `hand()` and leg groups in `lib.mjs` | 3 bones per arm, 3 fingers + thumb per hand, 2 per leg | Limbs are thick stroked lines with round caps, so joints never crack |
| Umbrella | C + P | `umbrella()` in `lib.mjs`, child of right hand | shaft, canopy (sx = open/close) | Counter-rotated every frame to stay upright in world space |
| Clothing (raincoat) | C | coat paths in `character()` | rigid with torso (squash/stretch scale) | Shadow plane, rim light, toggles and pockets are separate paths in one group |
| Kitchen furniture/appliances | C (+P for life) | `tools/art_kitchen.mjs`: `kitchenBack`, `kettle`, `lamp`, `kitchenFg`, `windowOutside` | lamp, kettle + lid, steam ×5, curtains ×2, plant, 6 utensils, mug steam ×3, rain ×36 move | Floor tiles in true perspective toward a vanishing point (960,300) |
| City / apartment block | C | `facade()`, `holeFrame()`, `city()` in `tools/scene_kitchen.mjs`; `house()` in `tools/scene_doors.mjs` | 3 skyline layers parallax; doors' opacity per frame | Seeded rng places ~600 bricks, windows, silhouettes and plants |
| Sun | C + P | `sunDisc()` in `art_space.mjs`; cross-section, granules and core stage in `scene_sun.mjs` | wedge mask path regenerated per frame; ribbons and convection dashes flow | 2,300 granule ellipses (later edit) |
| Moon, Earth, planets | C | `earth()` (6 hand-written continent paths, clouds, night lights, atmosphere gradient), moon/venus/mars groups in `scene_space.mjs` | Earth spin and cloud rotation separate | Same `earth()` reused in 5 scenes |
| Scientific diagrams | C + P | protons/neutrons (`scene_sun.mjs`), atom lattice + myth holes + charged path (`scene_doors.mjs`), Earth cutaway `ringSector()` (`scene_planet.mjs`), event display (`scene_flash.mjs`) | every particle is its own group | Geometry is the explanation: wedge, sectors, cone angle |
| Neutrino particles/trails | C + P | `SPARK` path + `nuDefs()` symbol; `streakField()` instances; `S.streaks()` | each instance independent | One symbol definition, many `<use>` copies |
| Flavour morph | C + P | `star(k)` 40-point polygon in `scene_space.mjs` | morphing path + colour | Same point count, so the path tweens cleanly |
| Antarctic surface | C | station, drill tower, snowcat, crew, aurora in `scene_ice.mjs` | crew, snowcat, aurora, snow ×70 move | |
| Ice detector + optical sensors | C + P | `dom()` and `strings()` in `scene_flash.mjs` (reused by `scene_ice.mjs`) | every sensor has its own glow element driven per frame | 1,900 element ids in `flash.html` |
| Typography/labels | C (+P for counter) | `label()`, `tag()` pills in `lib.mjs` | scale/opacity per tag; counter text rewritten per frame | Font family through CSS classes (fix in round 2) |
| Lighting, shadows, glows | C | linear/radial gradients (`lin()`, `rad()`, `glowStops()`), `mix-blend-mode: screen` lamp cone, floor-pool ellipse, contact-shadow ellipses | lamp cone/pool follow the swing | **No SVG filters** (no blur, no drop-shadow). Glow is all radial gradients, for render speed [MEM] |
| Textures | raster overlay | `assets/grain.png` (numpy) | static | Same grain on every frame |
| Voice | local TTS | Kokoro af_heart | — | |
| Music/SFX | procedural audio | `tools/audio.py` | — | |

## 3. The character: how she was built

### Specification
The design came only from the direction text:
- "small human with distinctive asymmetric coral hair curl, mustard raincoat, expressive low-detail face … original proportions … head, hands and torso preserve identity".
- The palette hexes `#E9B23B` (mustard) and `#F46E67` (coral).
- The umbrella "unexpectedly fails to block neutrino 'rain'".

No character sheet was drawn first. The code *is* the character sheet: `character(p)` in `tools/lib.mjs` [CODE].

### Construction: a shape hierarchy with pivots at joints

Every joint is a `<g>` whose origin *is the pivot*. `g(id, x, y)` writes `transform="translate(x y)"` and `data-b="x,y"`; the runtime later re-applies `translate(base + offset) rotate(r)`. Child parts are drawn relative to that origin, so rotating the group swings everything below it.

```
{p}char
 └ {p}root (0,0) = hips            ← X, Y, squash offset
    ├ {p}hips
    │   ├ {p}legL (-26,34) ─ {p}shinL (0,92) ─ boot paths
    │   └ {p}legR ( 26,34) ─ {p}shinR (0,92) ─ boot paths
    └ {p}torso (0,0)               ← rotation + breathing + squash/stretch scale
        ├ {p}armL (-60,-176) ─ {p}foreL (0,92) ─ {p}handL (0,92) ─ fingers {p}handL1..3 + thumb
        ├ coat (A-line path, shadow plane, rim light, toggles, pockets, hood collar)
        ├ {p}neck (0,-206)
        │   └ {p}head (0,-66)
        │       ├ {p}hairb (back hair: slides opposite to the face)
        │       ├ ears, skin path, jaw shadow
        │       ├ {p}face  ← slides in x/y: the "head turn"
        │       │   ├ {p}eyeL/R (scaleY = blink/lid) ─ {p}pupL/R (look)
        │       │   ├ {p}browL/R (raise + tilt)
        │       │   ├ nose, cheeks
        │       │   └ {p}mouth-m | -o | -smile | -grin | -frown | -flat (6 shapes, one visible)
        │       ├ front hair
        │       └ {p}curl (-18,-92) spiral stroke ← spring follow-through
        └ {p}armR (60,-176) ─ {p}foreR ─ {p}handR ─ fingers + {p}umb ─ {p}canopyG
```

- The prefix `p` (`k-`, `p-`, `d-`, `i-`, `e-`, `q-`) lets the same function stamp independent copies in different scenes without id collisions [CODE].
- Proportions stay consistent because each copy is literally the same geometry. Only a uniform wrapper scale differs:

  | Scene | Scale | Notes |
  |---|---|---|
  | kitchen | 1 | |
  | ground close-up | 0.8 | |
  | city | 0.72 | umbrella off: `withUmbrella:false` |
  | ice "?" | 0.74 | |
  | ending | 1 | |
  | planet tiny | 0.2 | static |

### How poses change
`A.pose(t, {joint: value, …}, dur, ease)` appends keyframes to per-joint tracks. Two details create the "animator" quality [CODE]:

1. **Successive breaking via a lag table.**
   - The head starts at `t`, torso +0.04 s, upper arms +0.07 s, forearms +0.11 s, hands +0.14 s, legs +0.03/0.05 s.
   - One call therefore produces overlapping action without hand-authoring each offset.
2. **Pose segments carry their own GSAP ease.**
   - `power3.out` for flinches, `back.out(1.6)` for overshooting gestures, `sine.inOut` for settles.
   - Anticipation is authored as a separate short pose before the action, e.g. kitchen at 0.38 s: `squash: 0.45`, eyes narrowing, `power2.in`. At 0.52 s comes the pop: `squash: -0.25`, head up, mouth "o", `power3.out`.

### Automatic life, computed from the pose tracks every frame (`actor()` in `nu.js`)

- **Breathing:** `sin(t·2.1)` drives torso rotation ±0.35° and scaleY ±0.6%.
- **Head idle:** sway `sin(t·1.3)·0.5°`; the neck takes 35 % of the head turn.
- **Squash/stretch:** root drops 26 px per unit; torso scales `1 − 0.10·sq` vertically and `1 + 0.07·sq` horizontally.
- **Hair-curl follow-through:**

  ```
  curl.r = −1.5·Δhead + 40·Δsquash + 2.2·sin(2.4t)
  Δx = value(t) − value(t − 0.09 s)
  ```

  The curl reacts to the *velocity* of the head and the body. It is a cheap spring with no state, so it is seek-safe.
- **Blinks:** deterministic every 3.13 s (0.13 s long), combined with a scripted `lid` value (squint < 1, wide > 1).
- **Eyes:** pupils move ±5 px (`lookX/Y`); brows move up to 9 px and tilt ±14°.
- **3/4 head turn without redrawing:** `faceX/faceY` slide the face features across the head while the back hair slides −45 % the other way.
- **Fingers:** `spread` fans fingers 1 and 3 by ±22° each.
- **Umbrella:** `umb.r = −(armR + foreR + handR + torso) + tilt` keeps it upright in world space whatever the arm does. `canopyG.sx` 1 → 0.17 closes it in the ending.
- **Walk cycle** (`scene_doors.mjs`, an `S.at` overriding the rig):

  ```
  leg = ±30°·sin(6.1t)
  shin bend = max(0, ∓cos)·36°
  contact bob = −|sin|·11 px
  arms counter-swing at 0.7× the legs
  ```

  It eases in over 0.35 s and out before the door.

### What was *not* done

- **No image swaps.** The only discrete swap is the mouth (6 shapes cross-switched by opacity); everything else is continuous.
- **No alternative views.** There are no side, rear or true 3/4 drawings; every shot shows the same front-facing construction. This directly misses the direction's request for "rear, side, 3/4".
- **No lip-sync.** The mouth changes only on emotional beats.
- **No IK.** Arm poses are angles chosen by hand. The palm-glint position in the ending had to be computed by hand-written forward kinematics in the scene (`scene_end.mjs`).

### Most important answer
**Yes: the character's motion was possible because her construction was inherently editable.**
- She is a hierarchy of primitive shapes with pivots at anatomical joints.
- Her pose is described by about 25 numbers.
- Expression and life come from functions of those numbers.

### Limitations of this construction method
- The style ceiling is "clean flat vector with gradients".
  - Stroked-line limbs look tubular.
  - The hands are a 3-finger simplification.
  - There is no line weight variation or painterly texture.
- Every new view, outfit or body type is new code.
- Detailed anatomy would need many more joints and constraints (elbow limits, hand poses).
- Without a visual reference loop, faces are only as good as the coordinates the author imagines. Here, two of the first three looks had visible construction errors: arms missing and head too low.

## 4. Environments: how they were constructed

- Every environment is a function that returns SVG for **separate depth planes**.
  - Kitchen: `lBack` (walls, window, cabinets, floor), `lMid` (actor), `lFg` (table, chair, fern), plus two streak fields between them.
- Static detail is **seeded procedural placement**, not hand placement:

  | Detail | Count |
  |---|---|
  | wallpaper sprigs | 7 × 30 |
  | tiles | ~150 |
  | skyline windows | hundreds |
  | bricks | 620 |
  | stars | 70–260 per layer |
  | solar granules | 760 → 1,500 → 2,300 |

  The function `rng(seed)` (mulberry32) makes them identical on every build.
- Objects that need to act are created as **their own groups at birth**, because the scene author knew they would move: lamp, kettle lid, steam, curtains, yolk, fork, doors, sensors, strings, planets.
- **This is the decisive structural fact:** illustration and motion were authored together, in the same function, by the same author.
