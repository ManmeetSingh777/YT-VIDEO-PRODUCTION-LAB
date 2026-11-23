# 06 — Visual review and iterations

## 1. Review instruments actually used

| Instrument | What it gives | Used | Genuine visual review? |
|---|---|---|---|
| `hyperframes snapshot --at t1,t2,…` | Full-size PNGs at chosen seconds + contact sheet | 9 rounds before the first full render, 2 after | **Yes.** Claude read the images and named specific defects |
| Partial render `render --start 0 --end 12 -q draft` | Real 12 s MP4 | 2 (proof + corrected proof) | Yes: tiled frames incl. consecutive pairs |
| `ffmpeg … select=…,tile` sheets from MP4s | Dense sheets (every 2–2.5 s), flash-sequence and consecutive-frame strips | after each full render | Yes |
| `tools/motion.py` | Mean frame difference; cuts (spikes), holds ≥ 0.5 s, black frames | proof + both full renders | **Measurement**: it found real dead holds |
| `hyperframes check --json` | Lint, runtime console errors, layout, contrast, audio | 4 runs | Mixed. The **runtime error** caught the frozen flight scene; the craft "dead_stretch" warnings were false positives for this runtime |
| `tools/dupcheck.cjs` | Duplicate SVG ids | after round 6 | Structural |
| `ebur128`, `hyperframes audio --json`, ffprobe | Loudness, peak moment, file facts | after full renders | Measurement only. **Audio never heard** |
| Studio preview | Live scrubbing | opened, **not used by Claude** | No |

**Real-time viewing never happened.** "Normal speed" meant sampling a real-rate render.

## 2. Iteration ledger

Times are UTC. Each row gives the defect, how it was noticed, the cause, the fix and the result.

| # | When | Defect | Noticed via | Actual cause | Fix | Result |
|---|---|---|---|---|---|---|
| 1 | 13:04 | Labels in serif font | snapshot | SVG `font-family` attribute not resolved by the HyperFrames font pipeline | CSS rules `#root text{font-family:'Outfit'}`, `.tA` class | Fixed, kept |
| 2 | 13:04 | Upper arms invisible | snapshot | `stroke="url(#coat)"` on a perfectly vertical line: objectBoundingBox gradient on a zero-width box renders nothing | Solid stroke colours | Fixed, kept |
| 3 | 13:04 | Head sits on the coat, no neck | snapshot | head offset −14 | offset −66, longer neck | Fixed |
| 4 | 13:04 | Lamp cone slices across the face; later overlaps the counter | snapshot | lamp drawn in front of the actor | Lamp moved behind the actor, x 1060→1150→700 | Fixed |
| 5 | 13:04 | Facade empty around the window | snapshot | hole-frame rectangle covered the neighbouring windows | Smaller hole frame, 620 bricks, drainpipes | Fixed |
| 6 | 13:04 | Streaks too faint for "100 trillion" | snapshot | n=76, small scale | n 150 → **240** per layer, scale 1.5, room dim overlay | Fixed (2 rounds) |
| 7 | 13:04 | Kitchen vanished mid-pullback | snapshot | `S.show` windows ended at 14 s | Windows removed | Fixed |
| 8 | 13:04 | Fork never appears | snapshot | track values absolute instead of offsets from `data-b` base | Delta values | Fixed |
| 9 | 13:08 | Sun surrounded by flat orange; granules like bubbles | snapshot | background colour; granule size | Dark space, stars, corona, flares; finer granules (3 rounds, last at 13:52) | Improved; still stylised |
| 10 | 13:08 | Flowerbox over the table at scale 1 | snapshot | box drawn in front with no time gate | opacity gated at 11.25 s | Fixed |
| 11 | 13:13 | IceCube sensors not drawn | snapshot | `<use href>` built with a scene-and-subprefix, so wrong id | `strings(P, list, tag)` keeps the symbol prefix | Fixed |
| 12 | 13:13 | Cherenkov cone and ending objects missing | snapshot + reasoning | camera wrote `transform` on groups that also had object transforms | Wrapper groups per role (`evL`, `heroL`, `topL`, `cargoL`, `lampL`) | Fixed; **design rule** |
| 13 | 13:16 | Cone still invisible; umbrella not closing; kettle not wobbling | reasoning about ids | **Duplicate ids**: gradient and group shared names (`cone`, `canopy`, `kettle`, `yolk`, `table`, `hit`); `getElementById` returned the gradient | Renamed groups; added a dup-id check | Fixed; **design rule** |
| 14 | 13:16 | City lights in the oceans | snapshot | uniform scatter | Clustered around continent centres | Fixed |
| 15 | 13:18 | Animatic 111 s | ffprobe | concat + `-shortest` | `-fps_mode cfr` | Fixed |
| 16 | 13:21 | Proof: flood thin, toast odd, "1" overlapping the umbrella | proof frame sheet | counts/shapes/layout | n 240, new density curve, toast redrawn, label moved | **Proof correction 1 of 2**; accepted at 13:29 |
| 17 | 13:21 | Console: negative circle radius | render log | dot radius formula before its start time | clamp | Fixed |
| 18 | 13:29 | **Flight scene frozen 31.6–43.5 s** | 28-frame snapshot sheet (identical frames) | `TypeError` from duplicate id `h-beam`, plus `venus/mars/moon` | Renamed; reliable `dupcheck.cjs` | Fixed. Found again by `check` runtime |
| 19 | 13:29 | Stripy clouds, petal-like flares, blocky wrist, bare "?" stage, cells outside the hand | snapshot | first-pass drawing choices | Puff clusters, thin flares, 11 carpal circles, blueprint grid + sketches, nested clip | Fixed |
| 20 | 13:35 | Ice section edges visible; aurora with hard sides | snapshot | rectangles too narrow after camera shift; aurora polygon shape | Wider rects, tapered aurora | Fixed |
| 21 | 13:47 | **Blue flash 2.5 s before "sudden flash of blue light"** | full-render dense sheet + the audio peak at 90.78 s compared with the script | sub-sentence beat offset was estimated (`s26 + 3.05`) | impact at `s26 + 2.65`, bloom at `s26 + 5.7`, muon 1000→330 px/s, audio re-synthesised to the same times | Fixed; synced |
| 22 | 13:47 | Dead holds 71.1–72.7, 93.6–94.8, 96.5–97.1, 99.5–100.1, 101.1–101.8, 103.9–104.8 s | `motion.py` | nothing changing after one-shot reveals | slow camera pushes, a pulsing cable, jet knots, a dot shimmer, the ghost + eye beat | **0 holds** in the final film |
| 23 | 13:47 | Palm glint not on the hand | sheet | hard-coded position | forward kinematics of the pose | Fixed |
| 24 | 13:47 | Loudness −18.9 LUFS | ebur128 | stem levels | two-pass loudnorm → −16.0 LUFS, −1.4 dBFS | Fixed in post (outside HyperFrames) |

## 3. Was the feedback loop a major cause of quality?

**Yes, as a defect remover; less clearly as a quality creator.**

- **Strong evidence** [OBS]:
  - 24 concrete defects found by looking at real pixels or measurements.
  - At least 4 would have been fatal to the film: frozen flight scene, invisible arms, invisible cone and sensors, flash out of sync.
  - None of them appear in the first-draft code as obviously wrong; they only showed up rendered.
- **Weaker:**
  - The big creative ideas (counting gag, window-as-one-cell pullback, wedge, ground cross-section, charged-vs-neutral contrast) were in the *first* draft of each scene.
  - Review rarely changed the idea; it fixed execution.
- **Speed of the loop mattered:**
  - a 9-frame snapshot cost about 1–2 min;
  - a full render about 6 min;
  - a fix was a small text replacement in a generator and a rebuild of about 1 s.

  Because the cycle was fast, it was run often.

### Which checks were *not* genuine visual review
- `check` lint and layout (passed while the film had a frozen scene);
- craft `dead_stretch` (false alarms);
- the rough animatic (made for the gate, informed nothing);
- the "contrast ok" result (0 samples checked).
