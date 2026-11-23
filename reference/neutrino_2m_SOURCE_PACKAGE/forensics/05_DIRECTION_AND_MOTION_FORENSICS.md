# 05 — Direction and motion forensics

## 1. Was the direction a formal document?

Yes, and it was complete before the session started.
- `DIRECTION_V4` holds 8 files, written 25 minutes before the prompt [OBS].
- It never changed. There were no conversational revisions [OBS].
- Formal documents also produced *during* production [OBS]:
  - `tools/script.json`: the verbatim script;
  - `tools/timing.json`: frozen timing;
  - the animatic boards in `tools/animatic.py`, whose text notes are effectively a written beat sheet;
  - the choreography inside each `scene_*.mjs`.

No separate written shot list, storyboard or motion spec was produced by Claude [OBS]. The code was the motion spec.

## 2. Prescribed vs invented, sequence by sequence

**Key:**
- **D** = specified in DIRECTION_V4 (script, grammar, hero frames, shot map).
- **C** = Claude's decision during implementation.
- Global time comes from `timing.json` and `scenes.json`.

| Sequence (global s) | Narration | Prescribed (D) | Invented or changed (C) |
|---|---|---|---|
| Hook 0–10 | s1–s5 "Something is passing through you … feel absolutely nothing" | Kitchen, mustard raincoat, coral curl, umbrella failing; streaks pass *through* umbrella, wall and body; x-ray hint; kettle, rain and lamp swing (CSV row 1) | Counting gag: "1" → "1,000" struck out → 14-digit counter written on the wall; streak density tied to those words; anticipation → flinch acting; on-screen caveat "streaks are a drawing aid" |
| Breakfast 10–11.2 | s6 "Right through your breakfast" | Only the line itself | Hard-cut close-up of egg and toast, a spark crossing the yolk, yolk wobble, fork entering |
| Pullback 11.2–15.3 | s7–s8a "They are called neutrinos … leave this room" | "Pull perspective through window; room becomes a tiny cutaway" (CSV); hero 2 wanted the window glint to become the Sun | The room seen *from outside*: it becomes one lit window of a brick apartment block, then the block shrinks into a 3-plane city; "neutrino" tag on the spark. **Changed:** the window→Sun match became window→city→Earth→Sun |
| Ascent 15.3–21.06 | s8b "leave Earth … dive straight into the Sun" | Earth rotates; Sun swells; Earth recedes (CSV) | Foreground cloud-deck wipe as the scene seam; Earth from horizon scale to globe; orbit line; Sun grows from a dot to 4.2× via `power3.in` so its surface *is* the next shot |
| Sun 21.06–31.6 | s9–s10 "nuclei fuse … releases streams" | Layers peel away; fusion schematic; one mint spark escapes and multiplies (CSV); hero 2 | Wedge cut that actually opens as a mask path; labelled zones; circular iris from the core into a full-frame core stage; 4 protons → helium (2p+2n) with anticipation drift, a hit, squash and settle; energy ring + small Earth vignette on "keeps Earth alive"; radial stream; white bloom out |
| Flight 31.6–43.5 | s11–s15 "race outward … Past the Moon … change from one kind into another" | Path past planets; flavour shape morph, not a split (CSV, facts) | A light beam racing beside the spark ("almost the speed of light"); Venus and Mars whip-pass; the Moon as a giant foreground occluder; Earth's limb as the stage of the morph; 3-, 4- and 5-point stars with colour + tags + "does not split" note; a dive that turns into a downward whip |
| Body 43.5–47.3 | s16–s17 "Your skin … Your bones" | Sparks enter skin; cutaway through bones and cells (CSV) | Giant hand entering with overshoot; iris-open circle of cells clipped to the hand; scan ring revealing an x-ray skeleton |
| Planet 47.3–55.5 | s18–s19 "even an entire planet … ground beneath your feet" | Night-side Earth, nearly transparent, city and mountain silhouettes, tiny human, not 100 % transparent (hero 3, facts) | Cutaway quadrant with flowing mantle; one rare interaction flash + tag; camera dives into the tiny character; **ground cross-section with sparks rising from below** (at night solar neutrinos arrive through the Earth: a scientific invention by Claude); boot-lift reaction |
| Doors 55.5–70 | s20–s22 "Not because atoms are empty holes … no electric charge … city where almost every door is invisible" | Doors metaphor; one doorway lights (CSV rows 17–19); "not atoms-are-empty false model" | Myth beat: lattice shown as holes, the tag struck out, holes filled with electron clouds; charged particle shoved and stopped vs neutrino going straight; a single "rare" flash; side-scrolling walk past dashed doors; a knock at the only solid door, whose light fills the frame |
| Ice 70–87.2 | s23–s25 "How do scientists study … build a detector … Deep in Antarctic ice" | "?" made of detector wires (CSV); landscape → deep ice cutaway; vertical tracking past sensor strings | Blueprint stage; cable *writes* the "?" and sensors click onto it; character's chin-hand acting; strings lowered one by one; 1 km bar + dashed cube; endless 3-plane descent that brakes onto one sensor close-up; "5,160" tag |
| Flash 87.2–101.8 | s26–s28 "interacts … sudden flash of blue light … don't see the neutrino … reconstruct" | One rare collision → charged particle → blue cone; nearest sensors light in sequence; data dots reassemble (CSV, facts) | Geometric Cherenkov model (41° cone, per-sensor arrival time); impact on "interacts" and bloom on "sudden flash"; ghost outline + crossed-out eye; world dims to coloured dots by arrival time; fitted arrow pointing back up the track |
| Source 101.8–107.9 | s29 "violent events far beyond our solar system" | Trace direction to far sky; distinct from Sun (CSV) | Zoom from Earth to another galaxy with a jet; travelling jet knots; the spark rides the ray home |
| End 107.9–120 | s30–s33 "moving straight through you … tells us a story" | Kitchen again; umbrella lowered; river glows through; callback; spark exits (CSV, hero 5) | Umbrella closed and used as a cane; river path with Earth, galaxy and Sun riding it; acting beats on each line; sensor-blue glint in the palm (callback to the detector); last spark rises out of frame; fade |

### Timing: given vs chosen
- **Given by the direction:**
  - target windows per section, e.g. "0:23–0:36";
  - "120 s ±0.3".
- **Chosen in implementation:**
  - exact sentence gaps (`timing.py`);
  - the hook spoken at 1.05× speed;
  - every beat offset within sentences.
- The actual section starts drifted from the script's windows. "Deep in its core" was planned for 0:23 and landed at 21.26 s. Picture followed the voice, not the plan.

### Did success come from prescription or freedom?

**Evidence supports "both, in different layers".**

- **What and why came from the direction.** Most *visual ideas* were prescribed. Of the 30 CSV rows, 24 appear clearly in the film and 6 only partially [manual row-by-row comparison of the CSV with the scene code]. The partial rows are:
  - row 2: the x-ray mask in the kitchen;
  - row 4: the character climbing onto the neutrino track;
  - row 5: city pins on Earth;
  - row 12: the snap to the person;
  - row 19: scientists digging;
  - row 27: the link back to the tiny character.
- **How the motion happens came from Claude.** The direction prescribed almost no motion mechanics:
  - no timings below section level;
  - no eases;
  - no camera values.
  Every camera curve, ease, rig pose, anticipation, density curve and transition construction was decided by Claude while writing the code.
- **Where Claude deviated, it was to make a better shot.** Three examples:
  - window→city instead of glint→Sun;
  - ground cross-section;
  - charged-vs-neutral contrast.

**Conclusion:** precise *intent* plus freedom over *mechanics* in an architecture where any mechanic is one function away. Neither factor alone is proven sufficient: no ablation was run.

## 3. Motion dissection: how the in-between frames are computed

Every moving thing is one of these six kinds [CODE]:
1. **Keyframe track:** `S.k(id, {prop: [[t, v, ease]]})`, evaluated by `S.ev` with GSAP eases.
2. **Closed-form function of t:** inside `S.at`, e.g. sines, `%` wrap-around loops, hashes.
3. **Rig function:** `actor()`: derived values such as breathing, curl velocity and umbrella counter-rotation.
4. **Particle field:** `streaks()`.
5. **Camera:** a per-layer transform from `z^depth` and `cx·depth`.
6. **Geometry recomputed per frame:** the Sun wedge, the Cherenkov cone polygon, the charged-particle path position, the ice "?" sensor positions, river particle positions from a path lookup table.

### Camera motion vs object motion
- `S.camera` writes only on *layer* groups.
- Objects inside a layer move by their own tracks.
- A bug in round 3 showed why the two must be separate: assigning a camera layer to an element that also had its own transform made the camera overwrite it (cone invisible). The fix was a wrapper `<g>` per role.

## 4. Case studies (code-level)

Frames = seconds × 30.

### Case A: Kitchen opening, 0–10 s (frames 0–300), `tools/scene_kitchen.mjs`

- **Narration → intent:**
  - s1 (0.12 s) "Something is passing through you": surprise.
  - s2/s3 count up: comic escalation.
  - s4 (4.37 s) "a hundred trillion": overwhelm.
  - s5 (8.29 s) "feel absolutely nothing": deadpan.
- **Construction:**
  - three planes `lBack`, `lMid` and `lFg` with depths 0.82 / 1 / 1.32;
  - streak fields `fB` (behind the actor, alpha 1) and `fF` (in front, alpha 0.5).
- **Camera:**

  ```
  S.camera({ x:[[0,-10],[4.3,20,'sine.inOut'],[8.2,-40,'sine.inOut'],[10,-90]],
             y:[[0,10],[4.3,-6],[8.2,40],[10,70]],
             z:[[0,1.0],[4.3,1.03,'sine.inOut'],[8.1,1.05],[9.7,1.26,'power2.inOut'],[10,1.3],…] }, …)
  ```

  It drifts slowly while the count builds, then pushes in during "nothing". Foreground parallax is 1.32× the actor's.
- **Particles:**

  ```
  fo = {angle:62, speed:1250, seed:3, density:den}; fB n=240 alpha 1; fF n=240 alpha .5
  den(t) = [[0,.012],[3.1,.012],[3.4,.09],[4.3,.11],[5.3,1,'power2.in']]
  ```

  The density keys *are* the counting gag: about 3 sparks, then about 22, then all 240 on "hundred trillion".
- **"Through" illusion:**
  - Both fields use the same seed, so each streak exists in both, at the same position.
  - Behind the actor it is fully bright, hidden where her body occludes.
  - In front it is half-bright.
  - Read: bright in open air, ghostly inside her body.
- **The first image:** `hero1` travels (620,−60) → (1120,1000) in 0.9 s, through canopy and chest.
- **Acting, in order:**

  | t (s) | Beat | Ease |
  |---|---|---|
  | 0.38 | anticipation: `squash .45`, eyes narrowing | `power2.in` |
  | 0.52 | flinch: `squash −.25`, head up, mouth "o" | `power3.out` |
  | 0.9 | settle | |
  | 2.2 | left palm raised, `back.out(1.6)` overshoot, on "Not one thing" | |
  | 3.2 / 3.62 | head darts right then left, 0.14 s each, on "Not a thousand" | `power3.out` |
  | 4.4 | cringe under the umbrella, both arms up, frown | |
  | 8.3 | deadpan shrug: flat mouth, lids 0.72, then a 0.14 s squash pop at 8.92 | |

- **Environment:**
  - lamp `r = 5.2·sin(1.55t)`, with the light pool following;
  - curtains skew;
  - plant sway;
  - 6 utensils at different phases;
  - kettle lid rattle `max(0, sin(23t) − .4)`;
  - looping steam paths;
  - 36 rain drops wrapping inside the window.
- **Type:**
  - "1" lands on s2 with `back.out(2)`;
  - "1,000" struck through by a dash-offset line;
  - 14-digit counter grows one digit group at a time over 1.45 s via `S.set(…'text')`.
- **Viewer-facing effect:** cause and reaction; something always moving at three depths; numbers land on their words.

### Case B: Kitchen to the wider world, 11.2–21.06 s (frames 336–632)

- **Spatial construction:**
  - The kitchen sits inside `k-world`, a group *inside* a giant facade.
  - The facade's window hole is exactly the frame: a path with an evenodd hole of 2012×1172.
  - At scale 1 the facade lies outside the frame; scaling down reveals it as the 4th wall.
- **Keys:**

  ```
  S.k("k-world",{ s:[[11.2,1],[12.15,.34,'power3.inOut'],[14.3,.235,'sine.inOut'],[15.3,.045,'power3.in']] })
  ```

  | Frame | Event |
  |---|---|
  | 336 → 364 | fast reveal of the window frame |
  | 364 → 429 | hold-drift while "neutrino" is tagged |
  | 429 → 459 | accelerating retreat into the city |

  City layers scale `z^0.25`, `z^0.42` and `z^0.62`, so they recede *slower*: true parallax.
  - Streak fields `fFar`/`fNear` take over at city scale so the motif persists.
- **Seam to `ascent`:** a cloud deck is opaque at t=0 (15.3 s) and falls away (`y → +800`, `power2.in`). It acts as a foreground wipe.
- **Ascent** (local times; global = +15.3):

  | Element | Keys |
  |---|---|
  | Earth scale | 7.2 → 5.2 → 0.96 (`power3.out`) → 0.7 → 0.12 (`power2.in`) |
  | Sun scale | 0.1 → 0.14 → **4.2** (`power3.in`) over the last ~4 s |

  The final frame of `ascent` is Sun surface; `sun` opens at camera scale 3.2 on the same granular surface (a scale-matched cut).
- **Sun wedge:**
  - mask path from `M0,0 L…` arcs, generated each frame from `a = ev([[wIn,0],[wIn+.95,118,'power3.inOut']])`;
  - `wIn` = 21.263 s, on "Deep";
  - the camera pulls to see the layers, then dives (scale → 3.6) as a clip circle grows from the core (r 1 → 1,250), revealing the full-frame core stage.
- **Effect:** each world physically contains the next. The viewer never loses the spark's direction.

### Case C: Earth and matter, 47.25–55.46 s (frames 1418–1664), `tools/scene_planet.mjs`

- **Intent:** "most pass, some don't"; "even beneath your feet".
- **Particles:**

  ```
  fo={angle:6, speed:1150, area:[-1250,-760,2500,1520], seed:4, span:2900}
  fB n=80 behind the globe, alpha 1; fF n=80 in front, alpha .68
  ```

  The same seed again makes streaks enter at the limb and continue across the disc.
- **The rare interaction:**
  - `hitG` at local 3.6 s (global 50.85 s, frame 1526);
  - opacity spikes in 0.05 s, `back.out(2)` scale, fades 0.8 s;
  - tag "a very rare few interact".
- **World motion:** `e-spin r = 3t − 12`, clouds `5t`, mantle convection dash offset `−60t`.
- **Camera dive:**

  ```
  cam s: 0.86 → 1.0 → 9 ('power3.in'), y → 4100
  ```

  It lands at the top of the globe on the tiny character at local 5.585 s (global 52.84 s, frame 1585), on "Including the ground".
- **Ground section:** a new layer shown at `g0 − 0.08`.
  - streak `angle −78` (rising) with front/back fields;
  - character poses: looks down, lifts a boot (`legL −24`, `shinL 42`), eyes follow a streak up.
- **Science communicated by motion:** direction (left→right through the planet), rarity (one flash among about 160 streaks), and night-side arrival (rising from below).

### Case D: Detector and return, 87.2–120 s (frames 2616–3600), `tools/scene_flash.mjs`, `tools/scene_end.mjs`

**Geometry:**
- vertex `(880,440)`, track angle 152°;
- muon speed `v = 330 px/s`, stylised (originally 1,000; slowed to match the words);
- Cherenkov half-angle 41° (ice).

**Per sensor, every frame:**

```
along = projection on track; perp = distance from track
reach = max(0,along) + perp/tan(41°)·0.55
hit   = t0 + reach / v
a     = close · attack(0.08 s) · exp(−0.26·(t−hit))   [+ flash term after tf]
```

- `t0` = s26 + 2.65 = global 90.35 s (frame 2711), the word "interacts";
- `tf` = s26 + 5.7 = global 93.40 s (frame 2802), the words "sudden flash": a bloom plus every lit sensor re-peaking.

**Cone:** a polygon recomputed per frame from the muon position:
`points = d,0  d−620,−w  d−620,w` with `w = 620·tan 41°`.

**Data view** (`dr` = s28 + 0.2 = 98.95 s):
- the world dims;
- each hit sensor becomes a dot at `dotT = dr + .05 + reach/1500·.65`, coloured by arrival bucket (red → blue);
- the fit arrow grows over 1.45 s (`power2.inOut`) back up the track.

**Return** (`scene_end.mjs`, from 107.88 s):
- same `kitchenBack`/`kitchenFg` art regenerated with prefix `e-`;
- the river is one Bézier path sampled into a 400-point lookup table;
- 150 motes and 26 sparks ride it at hashed speeds, with lateral offsets;
- Earth, galaxy and Sun "cargo" float along it.

**Acting:**
- looks down at her chest on s31;
- palm opens on s33;
- palm glint at forward-kinematics position (722,662), on "once in a while" + 0.42 s;
- last spark from the palm to (2200,−180) by 119.5 s;
- fade.

**Viewer-facing effect:** the flash is staged as one *event* with cause (impact) → propagation (sensor-by-sensor) → climax (bloom on the words) → meaning (dots and arrow). The ending reuses the opening's set, character and umbrella, with the motif transformed from a threat into a river.
