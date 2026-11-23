# Original neutrino_2m — function map

Source: `reference/neutrino_2m_SOURCE_PACKAGE/source/` (byte-identical to the original ZIP; see `ORIGINAL_SOURCE_VERIFICATION.json`). Static inspection of every original code file; the runtime API semantics are documented in `reference/neutrino_2m_SOURCE_PACKAGE/forensics/03_TECHNICAL_ARCHITECTURE.md`.

## `assets/nu.js` (13423 B)

NU runtime: every visible value is a pure function of timeline time.

imports: —

| function | line | scope | note |
|---|---|---|---|
| `ease` | 7 | internal |  |
| `hex` | 13 | internal |  |
| `mixHex` | 18 | internal |  |
| `mixPath` | 23 | internal |  |
| `wig` | 32 | internal | smooth deterministic noise, -1..1 |
| `hash` | 36 | internal |  |
| `scene` | 43 | internal |  |
| `getBase` | 54 | internal |  |
| `k` | 65 | internal | S.k("id", {x:[[t,v,ease?],...], r:[...], o:[...], d:[...], fill:[...], "a:cx":[...]})  |
| `ev` | 71 | internal | evaluate key array at t  |
| `render` | 90 | internal |  |
| `camera` | 125 | internal | camera: layers with parallax depth d. keys on cam: x,y,z,r  |
| `streaks` | 140 | internal | streak field built by lib.streakField(): positions are pure functions of t  |
| `actor` | 183 | internal | Character rig driver. Prefix matches lib character().  |
| `done` | 264 | internal |  |

## `tools/animatic.py` (9201 B)

Rough 120 s editorial animatic: one board per beat, timed from the frozen narration.

imports: —

| function | line | scope | note |
|---|---|---|---|
| `sparks` | 10 | internal |  |
| `person` | 14 | internal |  |
| `globe` | 18 | internal |  |
| `b_room` | 20 | internal |  |
| `b` | 21 | internal |  |

## `tools/art_kitchen.mjs` (17501 B)



imports: `tools/lib.mjs`

| function | line | scope | note |
|---|---|---|---|
| `kitchenDefs` | 3 | export |  |
| `windowOutside` | 30 | export |  |
| `kitchenBack` | 51 | export | The authored room. Everything is here: back plane, then a mid plane for the actor, then a foreground.  |
| `kettle` | 151 | export |  |
| `lamp` | 162 | export |  |
| `kitchenFg` | 173 | export |  |

## `tools/art_space.mjs` (6158 B)



imports: `tools/lib.mjs`

| function | line | scope | note |
|---|---|---|---|
| `stars` | 3 | export |  |
| `nebula` | 12 | export |  |
| `spaceDefs` | 16 | export |  |
| `earth` | 38 | export | Earth globe, r=400 at origin. mode: day \| night  |
| `sunDisc` | 66 | export | Small sun disc with halo and flares  |

## `tools/audio.py` (10687 B)

Original procedural score + SFX (no third-party audio). Writes assets/audio/{music,sfx}.wav

imports: —

| function | line | scope | note |
|---|---|---|---|
| `env` | 10 | internal |  |
| `write` | 14 | internal |  |
| `lp` | 20 | internal |  |
| `hp` | 25 | internal |  |
| `band_noise` | 27 | internal |  |
| `put` | 78 | internal |  |
| `whoosh` | 82 | internal |  |
| `thump` | 91 | internal |  |
| `tick` | 94 | internal |  |
| `glass` | 97 | internal |  |
| `boil` | 100 | internal |  |

## `tools/build.mjs` (2849 B)

node tools/build.mjs [--only id,id]   writes compositions/*.html and index.html from the art source in tools/.

imports: —

## `tools/dupcheck.cjs` (400 B)



imports: —

## `tools/lib.mjs` (14420 B)

Shared SVG art helpers for the neutrino film. All art is generated as static markup.

imports: —

| function | line | scope | note |
|---|---|---|---|
| `C` | 3 | export |  |
| `rng` | 8 | export |  |
| `rep` | 12 | export |  |
| `f1` | 13 | export |  |
| `g` | 14 | export |  |
| `grp` | 17 | export |  |
| `lin` | 18 | export |  |
| `rad` | 21 | export |  |
| `glowStops` | 24 | export |  |
| `SPARK` | 27 | export | Three-point curved spark path: the film's neutrino motif (never a dot, never a circle).  |
| `SPARK_B` | 29 | export | Flavour morph targets share structure with SPARK so they tween.  |
| `nuDefs` | 30 | export |  |
| `streakField` | 41 | export |  |
| `heroNu` | 45 | export | A single hero neutrino with a morphable spark head and identity ring  |
| `label` | 53 | export |  |
| `tag` | 58 | export | pill tag with leader dot  |
| `sceneFile` | 64 | export |  |
| `writeScene` | 88 | export |  |
| `charDefs` | 94 | export | Character: mustard raincoat, asymmetric coral curl, teal boots. Hips at origin; ~560 tall.  |
| `hand` | 102 | internal |  |
| `arm` | 109 | internal |  |
| `umbrella` | 121 | export |  |
| `character` | 137 | export |  |

## `tools/mkscenes.py` (903 B)



imports: —

## `tools/motion.py` (954 B)

Frame-difference QA at real playback rate: cuts (spikes), holds (near-zero runs), black frames.

imports: —

## `tools/scene_body.mjs` (7135 B)

Large hand silhouette; all four views (skin, cross-section, bones) share it for masking.

imports: `tools/lib.mjs`

| function | line | scope | note |
|---|---|---|---|
| `bones` | 7 | internal |  |
| `cells` | 21 | internal |  |
| `buildBody` | 29 | export |  |

## `tools/scene_doors.mjs` (11856 B)



imports: `tools/lib.mjs`

| function | line | scope | note |
|---|---|---|---|
| `atom` | 5 | internal |  |
| `house` | 9 | internal |  |
| `buildDoors` | 28 | export |  |

## `tools/scene_end.mjs` (8861 B)



imports: `tools/lib.mjs`, `tools/art_kitchen.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `buildEnd` | 9 | export |  |

## `tools/scene_flash.mjs` (14094 B)

strings: {x,z}: all sensors listed so the wavefront can light them from their true place 

imports: `tools/lib.mjs`

| function | line | scope | note |
|---|---|---|---|
| `dom` | 5 | export |  |
| `strings` | 17 | export | strings: {x,z}: all sensors listed so the wavefront can light them from their true place  |
| `iceDefs` | 34 | export |  |
| `iceBack` | 48 | export |  |
| `buildFlash` | 56 | export |  |

## `tools/scene_ice.mjs` (13380 B)

'?' bent from one instrument string: cable path with sensors on it

imports: `tools/lib.mjs`, `tools/scene_flash.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `buildIce` | 7 | export |  |

## `tools/scene_kitchen.mjs` (18118 B)

Apartment block that wraps the kitchen: the room is the camera-side window.

imports: `tools/lib.mjs`, `tools/art_kitchen.mjs`

| function | line | scope | note |
|---|---|---|---|
| `T` | 4 | export |  |
| `facade` | 7 | internal | Apartment block that wraps the kitchen: the room is the camera-side window. |
| `holeFrame` | 37 | internal |  |
| `city` | 47 | internal |  |
| `buildKitchen` | 61 | export |  |

## `tools/scene_planet.mjs` (9785 B)

limb decoration: mountains + city blocks standing radially on the globe's top arc 

imports: `tools/lib.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `ringSector` | 6 | internal |  |
| `limbWorld` | 12 | internal | limb decoration: mountains + city blocks standing radially on the globe's top arc  |
| `groundArt` | 23 | internal | Ground cross-section: the close-up that answers "the ground beneath your feet".  |
| `buildPlanet` | 44 | export |  |

## `tools/scene_source.mjs` (4946 B)



imports: `tools/lib.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `spiral` | 6 | internal |  |
| `buildSource` | 15 | export |  |

## `tools/scene_space.mjs` (13637 B)

stacked cloud deck, screen-filling wipe 

imports: `tools/lib.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `clouds` | 7 | internal | stacked cloud deck, screen-filling wipe  |
| `buildAscent` | 13 | export | 15.3 → sun: city under cloud → curved horizon → globe recedes → Sun swells to fill the frame  |
| `star` | 62 | internal | flavour star: same 40 point polygon so a real morph interpolates between type shapes  |
| `buildFlight` | 74 | export | s11-s15. Spark leaves Sun, overtakes planets, Moon whip, into atmosphere, flavour morphs  |

## `tools/scene_sun.mjs` (14625 B)



imports: `tools/lib.mjs`, `tools/art_space.mjs`

| function | line | scope | note |
|---|---|---|---|
| `proton` | 6 | internal |  |
| `neutron` | 9 | internal |  |
| `buildSun` | 13 | export |  |

## `tools/timing.py` (1036 B)

Freezes narration: places each sentence wav, writes tools/timing.json and assets/audio/narration.wav

imports: —

