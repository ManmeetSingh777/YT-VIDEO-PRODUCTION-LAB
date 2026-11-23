# 03 — Technical architecture

## 1. Stack actually on the execution path

| Layer | What | Version | Evidence |
|---|---|---|---|
| Authoring language | JavaScript ES modules run by Node (art + scene generators) | Node 22.20.0 | [OBS] `node -v` |
| Build output | Plain HTML + inline SVG + inline `<script>` per scene | — | [OBS] `compositions/*.html` |
| Animation clock | **One GSAP tween per scene** that drives a custom function-of-time renderer | GSAP 3.15.0 (CDN) | [CODE] `assets/nu.js` `done()` |
| Easing | `gsap.parseEase()`: `power2/3`, `sine`, `back.out`, `bounce.out` | GSAP | [CODE] `ease()` in `nu.js` |
| Composition, seek and capture | HyperFrames CLI: loads `index.html` in headless Chrome, seeks every registered timeline to `frame / 30`, screenshots, pipes frames to FFmpeg, mixes `<audio>` clips | hyperframes **0.9.11** (pinned) | [OBS] `package.json`, render logs |
| Encoder (render) | libx264 via HyperFrames; final pass `--crf 20` | FFmpeg (HyperFrames' own) | [OBS] command |
| Audio post | System FFmpeg 7.1 two-pass `loudnorm=I=-16:TP=-1.5:LRA=9:linear=true`, AAC 192 kb/s, `-c:v copy`, `+faststart` | FFmpeg 7.1 | [OBS] command at 13:58:35 |
| Voice | `npx hyperframes tts -v af_heart` → Kokoro-82M ONNX on CPU | kokoro-onnx 0.4.7, onnxruntime 1.31.1 | [OBS] |
| Music / SFX / grain | Python + numpy (+ PIL for grain and animatic) | Python 3.14.6, numpy 2.5.4, Pillow 12.3.0 | [OBS] |

### Not used
- Remotion, React, Three.js, WebGL, Canvas 2D drawing, Lottie, CSS keyframes, physics engines, image models, imported SVG/PNG art, stock audio.
- GSAP was used **only** as clock and easing library. No GSAP tween animates an art element directly [CODE].
- Canvas appears only implicitly: Chrome rasterises the SVG.

## 2. Project structure

```
neutrino_2m/
  index.html              GENERATED root: 11 scene hosts, grain overlay, 3 audio clips
  compositions/*.html     GENERATED, one per scene (template > style, inline SVG, script)
  assets/nu.js            HAND-WRITTEN runtime (276 lines): the animation engine
  assets/grain.png        procedural RGBA grain + vignette (numpy)
  assets/audio/vo/s1..s33.wav    per-sentence TTS
  assets/audio/narration.wav     sentences placed on the timeline (timing.py)
  assets/audio/music.wav, sfx.wav  procedural stems (audio.py)
  tools/script.json       the 33 narration sentences
  tools/timing.py         places sentences with hand-set gaps → timing.json + narration.wav
  tools/timing.json       {s1:[start,end], … s33} ← the film's clock
  tools/mkscenes.py       scene boundaries from timing.json → scenes.json
  tools/scenes.json       [{id, src, fn, start, dur}] × 11
  tools/build.mjs         imports each scene module, writes compositions + index.html
  tools/lib.mjs           palette, SVG helpers, neutrino motif, streak fields, CHARACTER, scene file wrapper
  tools/art_kitchen.mjs   kitchen drawing functions (reused by the ending)
  tools/art_space.mjs     stars, nebula, Earth, Sun disc
  tools/scene_*.mjs       one module per scene: art markup + choreography script
  tools/audio.py          music bed + SFX synthesis and ducking
  tools/animatic.py       rough boards + VO → proof/animatic_rough_120s.mp4
  tools/motion.py         frame-difference QA (cuts, holds, black frames)
  tools/dupcheck.cjs      duplicate-id detector
  hero/, proof/, REVIEW.md   evidence
```

- The `GENERATED` files must never be hand-edited. `node tools/build.mjs` overwrites them [CODE].
- Entry point for rendering: `index.html` (HyperFrames default).

## 3. Commands that reproduce the film

```bash
# one-time: local voice
python -m venv %USERPROFILE%/.cache/hyperframes/kokoro-venv && <venv>/Scripts/python -m pip install kokoro-onnx soundfile
set HYPERFRAMES_PYTHON=<venv>/Scripts/python.exe
# voice: per sentence (s1–s6 at -s 1.05, rest at 1.0)
npx hyperframes@0.9.11 tts "<sentence>" -v af_heart -o assets/audio/vo/sN.wav
python tools/timing.py          # timing.json + narration.wav
python tools/mkscenes.py        # scenes.json
python tools/audio.py           # music.wav + sfx.wav
node tools/build.mjs            # compositions/*.html + index.html
npx hyperframes@0.9.11 check --json
npx hyperframes@0.9.11 render -o final_raw.mp4 --crf 20
ffmpeg -i final_raw.mp4 -af loudnorm=I=-16:TP=-1.5:LRA=9:print_format=json -f null -    # pass 1
ffmpeg -i final_raw.mp4 -c:v copy -af "loudnorm=…measured…:linear=true,aresample=48000" -c:a aac -b:a 192k -movflags +faststart final.mp4
```

**Reproducibility caveats:**
- `timing.py` reads the WAVs. Kokoro output can differ slightly between versions, which would shift every beat.
- The WAVs are committed in the repo, so the existing film re-renders identically.

## 4. How a scene definition becomes pixels

### 1. Generate
`build.mjs` calls `buildKitchen()` and the other scene builders. Each builder:
- assembles SVG markup strings from `lib.mjs` and `art_*.mjs` (`g()`, `lin()`, `rad()`, `character()`, `streakField()`, …);
- writes a script string of choreography calls;
- passes both to `writeScene(id, dur, {defs, body, script})`.

`sceneFile()` wraps them as:

```html
<template><style>#root{…} #root text{font-family:'Outfit'} .tA{font-family:'Archivo Black'}</style>
 <div id="root" data-composition-id="kitchen" data-duration="15.3"> <svg 1920×1080> defs + body </svg></div>
 <script>(function(){ const S = NU.scene("kitchen", 15.3); …choreography… S.done(); })();</script>
</template>
```

### 2. Mount
`index.html` loads GSAP and `assets/nu.js`, then declares 11 hosts:

```html
<div id="kitchen" class="clip" data-composition-src="compositions/kitchen.html" data-start="0" data-duration="15.3" …>
```

- Hosts are mounted and run by the HyperFrames runtime.
- Each host's local clock starts at its `data-start`.

### 3. Register
`S.done()` creates the scene's single timeline:

```js
const tl = gsap.timeline({ paused: true });
const drv = { _t: 0, t(v) { if (v === undefined) return this._t; this._t = v; S.render(v); return this; } };
tl.to(drv, { t: dur, duration: dur, ease: "none" }, 0);
window.__timelines[id] = tl;
```

- GSAP treats a function-valued property as a setter.
- So whenever HyperFrames seeks the timeline to local time *t*, GSAP calls `drv.t(t)`, which calls `S.render(t)`.
- This fires even with suppressed events, which is why seeking works from any frame.

### 4. Evaluate: `S.render(t)`
Each call:
1. clears per-element state;
2. evaluates every keyframe track (`S.k`) at *t*;
3. runs every procedural function (`S.at`) with *t*;
4. writes changed SVG attributes only, through a `lastAttr` cache.

- Transforms are composed as `translate(base+x, base+y) rotate(r) skewX scale(s·sx, s·sy)`.
- `base` comes from each group's `data-b` attribute, written by `g()`.

### 5. Capture
For frame *f*, HyperFrames seeks the root to *f*/30, and each scene to its local time.
- Chrome lays out and rasterises the SVG.
- The frame is screenshotted and encoded.

### 6. Overlay and audio
- `grain.png` sits at `z-index:40` above all scenes for the full 120 s.
- Three `<audio>` clips are mixed by HyperFrames: `narration` vol 1, `music` vol 0.42, `sfx` vol 0.8.

### Why intermediate frames need no per-frame authoring

Every visible value is either:
- a keyframe interpolation `ev(keys, t)`, or
- a closed-form function of *t*: sines, hashes, `% span` wrap-around, kinematics.

Frame 1,294 and frame 1,295 are two evaluations of the same functions. Nothing stores per-frame state, so render order and parallel workers cannot change the result [CODE].

## 5. The runtime `nu.js`: capability by capability

| API | What it does | Used for |
|---|---|---|
| `S.k(id, {prop: [[t, v, ease?], …]})` | Keyframe track. Numbers lerp; `#hex` colours lerp; **path strings lerp number by number** (`mixPath`), so any two paths with the same command structure morph | Positions, opacity, scale, colour changes, the Sun's wedge path, the flavour morph (40-point star polygon), mouth-free shape changes |
| `S.at(fn)` | Arbitrary per-frame procedural function of *t*; may `set`/`add`/`get` state or write attributes directly | Lamp swing, steam, rain, walk cycle, Cherenkov light timing, river particles, forward kinematics |
| `S.camera(cam, [[layerId, depth], …])` | Multi-plane camera. Keys `x, y, z, r`; each layer gets `scale(z^depth)` and `translate(-(960 + cx·depth))` | All parallax and push-ins |
| `S.streaks(fieldId, opts)` | Deterministic particle field over N `<use>` instances (see 05) | Every neutrino stream |
| `S.actor(prefix, init)` | Character rig driver with lagged poses, breathing, blinking, curl spring, umbrella counter-rotation, 6 mouth shapes (see 04) | All character acting |
| `S.show(id, t0, t1)` | `display` window | Scene-internal cuts (breakfast close-up, city, ground) |
| `wig`, `hash`, `NU.clamp` | Smooth deterministic noise; per-index hash | Organic variation without `Math.random` |

**Supporting machinery:**
- the `data-b` base convention, so rig joints pivot at `(0,0)` of their own group;
- an attribute diff cache;
- `vis` and `text` pseudo-properties;
- the `a:` prefix for raw SVG attributes (`a:r`, `a:stroke-dashoffset`, `a:points`).

## 6. Audio synchronisation

- **Voice is the clock.**
  - `timing.py` concatenates sentence WAVs with explicit gaps (e.g. 1.35 s before "Deep in its core", 1.1 s before "Scientists don't see").
  - It records `[start, end]` per sentence in `timing.json`.
- **Scene boundaries** (`mkscenes.py`) are fixed offsets from sentence starts, e.g. `sun = s9 − 0.2`, `flash = s26 − 0.5`.
- **Inside scenes**, beats are written as `L("s26", 2.65)`: sentence start + seconds, converted to scene-local time.
  - Sub-sentence offsets were **estimated** by Claude from word position and speaking rate, not measured.
  - No word-level alignment was ever run.
  - This is why the first full render had the flash 2.5 s early (see 06).
- **SFX** read the same `timing.json` (`put(thump(…), T["s26"][0] + 2.65)`), so sound and picture share one clock.
- **Music** is ducked by the narration envelope: `duck = 1 − 0.5·clip(env/0.04)`.
  - It also follows an authored macro-envelope: near-silence before the detector flash, swell after it.
