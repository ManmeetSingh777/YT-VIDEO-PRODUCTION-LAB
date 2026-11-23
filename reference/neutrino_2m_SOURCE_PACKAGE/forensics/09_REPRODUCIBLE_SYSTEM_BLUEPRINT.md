# 09 — Reproducible system blueprint (proposal for approval, not built)

## 1. Essential components to preserve

| Component | Source today | Action |
|---|---|---|
| Function-of-time runtime (one GSAP driver tween → `render(t)`) | `assets/nu.js` `scene()`, `ev()`, `render()`, `done()` | **Copy directly** |
| Keyframe tracks with GSAP eases + path/colour morphing | `nu.js` `k`, `ev`, `mixPath`, `mixHex` | Copy |
| Procedural hooks `S.at(fn)` | `nu.js` | Copy. This is the escape hatch that made every invented mechanic possible |
| Multi-plane camera | `nu.js` `camera()` | Copy; add a guard against assigning a camera to a group that also has object tracks |
| Deterministic particle fields | `nu.js` `streaks()`, `lib.mjs` `streakField()` | Copy; **generalise** the symbol, so each film supplies its own particle look |
| Character rig driver | `nu.js` `actor()` | **Generalise**: move the joint list, lag table and derived motions into a rig description object, so a new character keeps the API |
| Character art | `lib.mjs` `character()`, `umbrella()` | **Rewrite per production** to the style skill, keeping the joint names and pivots (see 08) |
| SVG helpers (`g` with `data-b`, `lin`, `rad`, `rng`, `rep`, `tag`, `label`) | `lib.mjs` | Copy |
| Generator → HTML build | `build.mjs`, `sceneFile()`, `writeScene()` | Copy; make the duplicate-id check fail the build instead of printing |
| Voice-first timing | `script.json`, `timing.py`, `mkscenes.py` | Copy; **add word-level alignment** (`npx hyperframes transcribe`) so beats can reference words |
| QA instruments | `motion.py`, `dupcheck.cjs`, snapshot sheets, `ebur128` | Copy |
| HyperFrames contract (`.clip`, `data-composition-src`, `window.__timelines`, determinism) | `CLAUDE.md` + skill | Keep the render path |

## 2. Historical details not needed

- The animatic boards (`animatic.py`): replace with snapshots of real scene drafts.
- One-off `fix*.py` string patches (they lived in `/tmp` and scratchpad).
- Neutrino scene modules, as code. Keep them as **reference examples**, not templates to fill.
- The procedural music bed in `audio.py`. Keep the ducking and SFX placement; the music itself needs a better source.
- CRF 16 first render, Studio preview, `final_pass1`.

## 3. Minimal input contract (smallest complete input)

| Class | Items |
|---|---|
| **Absolutely required** | (1) Final narration text, sourced and fact-checked. (2) Audience question and the single idea the viewer should leave with. (3) Visual identity: palette, protagonist description (or model sheet), the recurring motif for the main abstract thing |
| **Strongly improves** | Hero-frame descriptions for 4–6 key moments; a beat list with a visual *idea* per beat (like `04_SHOT_MAP.csv`); scientific-accuracy notes on what must not be shown; length target |
| **Claude can decide** | Scene boundaries, every camera move, ease and timing within sentences, secondary action, environment detail, transition construction, staging inventions, SFX placement |
| **Human creative control** | Script and facts sign-off; the protagonist's look; approval of hero frames; final cut approval; publishing |
| **System computes** | Sentence/word timing, scene durations, particle positions, rig derived motion, loudness, QA metrics |

## 4. Production sequence

Gates are what actually mattered in this session.

1. **Lock narration → synthesize → freeze timing** (`timing.json`). The picture follows the voice.
2. **Runtime + character exist before any scene.** If the protagonist is new: model sheet → part reconstruction → a 5-second acting test.
3. **Hero frames as real scene drafts.** Each world built as layered, motion-ready groups; snapshot; fix construction errors.
4. **Short real-motion proof** (10–15 s render), inspected as tiled frames + consecutive pairs + `motion.py`. At most 2 corrections.
5. **Remaining scenes** written against the same primitives. Build all, then snapshot every scene at 2–3 times.
6. **Full render** (~6 min / 2 min of film), then:
   - dense sheet;
   - `motion.py` (holds, black, cuts);
   - word-sync check of every "event lands on word" beat against the audio;
   - `check` runtime errors.
7. **Fix and re-render; loudness normalise; deliver** with an honest review.

## 5. Folder structure

```
production/<film>/
  brief/            script.md, facts.md, look.md (palette, motif, protagonist), heroes.md, beats.csv
  audio/            vo/*.wav, narration.wav, music/, sfx/
  timing/           script.json, timing.json, words.json, scenes.json
  art/              <film>-specific drawing functions (kitchen.mjs-style)
  scenes/           scene_*.mjs (art markup + choreography)
  out/              compositions/, index.html (generated)
  review/           snapshots/, sheets/, motion.json, REVIEW.md
engine/             nu.js, lib.mjs (helpers), rigs/<character>.mjs, build.mjs, qa/
```

## 6. Safeguards learned the hard way

- **Unique ids by construction.** Prefix every scene and every role (`G` suffix for groups vs gradient names). Fail the build on duplicates.
- **One transform owner per element:** camera layer, rig joint or object track, never two.
- **Keyframe values are offsets from `data-b`**, not absolute positions.
- **No gradients on zero-width shapes.**
- **Fonts through CSS classes**, not SVG attributes.
- **Every "lands on the word" beat** references word timing, not an estimate.
- **Treat render success and lint PASS as non-evidence.** Look at the pixels.
