# 10 — Evidence ledger and open questions

## Claims and evidence

| # | Claim | Evidence | Strength |
|---|---|---|---|
| 1 | `final.mp4` in `neutrino_2m` is the film described: 120.000 s, 1920×1080, 30 fps, 3,600 frames, H.264 + AAC | ffprobe incl. `-count_frames`; frames in `hero/`, `proof/qa/final_1.png` | OBS |
| 2 | SHA-256 `765f4b37…ce971f0`; the `- Copy` folder holds an identical file | `sha256sum` | OBS |
| 3 | `final(5).mp4` itself was not located | find over `G:\` and profile folders | OBS (absence) |
| 4 | One user prompt produced the film; no user input until after `final.mp4` | session jsonl user-message list (4 messages) | OBS |
| 5 | Prompt → final in ~72 min; full render ~6–6.5 min | jsonl timestamps 12:46:33 → 13:58:20; render start/end | OBS |
| 6 | All art is code-generated SVG; no image model, no imported art | absence of any image API call or imported image in jsonl and `assets/`; source of `lib.mjs`, `art_*.mjs`, `scene_*.mjs` | OBS + CODE |
| 7 | Motion is a pure function of time via one GSAP driver tween per scene | `assets/nu.js` `done()`, `render()` | CODE |
| 8 | Character = joint hierarchy with ~25 pose parameters, derived motion, 6 mouth shapes | `lib.mjs` `character()`, `nu.js` `actor()` | CODE |
| 9 | Timing derives from per-sentence TTS lengths with hand-set gaps; sub-sentence beats estimated | `timing.py`, `timing.json`, `L("sN", offset)` usage; flash-sync defect | CODE + OBS |
| 10 | Direction supplied script, facts, character identity, motif and most beat ideas (24/30 shot-map rows clearly, 6 partially) | `DIRECTION_V4` vs scene code | CODE (manual comparison) |
| 11 | Claude invented all motion mechanics and several key stagings | scene code vs `DIRECTION_V4` (no mechanics specified there) | CODE |
| 12 | 24 concrete defects found and fixed through visual review and measurement | session log + diffs (06) | OBS + MEM |
| 13 | Craft `dead_stretch` warnings were false positives | `motion.py` shows 0 holds in final, constant motion | OBS |
| 14 | Source unchanged since commit `2f6a613`, except uncommitted wording edits to `REVIEW.md` | `git status`, `git diff --stat` | OBS |
| 15 | **Corrected:** the failed V3 engine is `E:\THE ANIMATION LAB` @ `7d4e0c0` (Remotion 4.0.540), not `G:\AnimationLabV0` | user correction + `git show 7d4e0c0` | OBS |
| 16 | At 7d4e0c0 V3 renders only approved raster PNGs and animates only x/y/rotation/scale/opacity, cel swaps and one articulation per owner | `src/scenes/Film.tsx` header, `src/runtime/types.ts`, `src/runtime/evaluate.ts` | CODE |
| 17 | The expressivity gap caused V3's weak results | no controlled test | **SPEC / probable** |
| 18 | Earlier estimate "15–20 min per full render" was wrong | session timestamps | OBS |
| 19 | Audio quality is unknown to Claude | never listened | OBS (limitation) |
| 20 | From the packaged source, deleting and regenerating all 17 generated files (`timing.json`, `narration.wav`, `scenes.json`, `music.wav`, `sfx.wav`, `index.html`, 11 compositions) reproduces them **byte-identically** | `evidence/REBUILD_VERIFICATION.md` in the source package | OBS |
| 21 | Re-rendering 1-second spans at 5 s, 50 s and 92 s from the rebuilt source matches `final.mp4`: PSNR 39.8 / 40.8 / 42.0 dB, SSIM 0.963 / 0.972 / 0.976, frame-aligned; 0.018 % of pixels differ by more than 24/255 | same file | OBS. **A full 120 s rebuild was not performed** |

## Unresolved questions and how to resolve them

1. **Is `final(5).mp4` byte-identical?** Run `certutil -hashfile "final(5).mp4" SHA256` and compare to claim 2.
2. **Resolved:** the V3 project is `E:\THE ANIMATION LAB` @ `7d4e0c0`. Still open: a render-level comparison of its films, which were not inspected.
3. **Located:** the F01–F80 skill is `E:\THE ANIMATION LAB\construct-kurzgesagt-art.zip`. Still open: read it and complete 08 §4.
4. **The user's "already made improvements to the system"** are not in this project: no changes since the last commit. Where are they?
5. **Causation.** Run one ablation to test it: take one V3 shot, rebuild it with the `nu.js` runtime and its art split into parts, and compare under the same review.
6. **Repeatability.** Unknown whether a second, different topic reaches similar quality with the same process. One data point is not a system. Run the 5-minute idea-only test proposed earlier.
7. **Word timing.** Run `npx hyperframes transcribe` on `narration.wav` to measure how far the other estimated beats drift. Only the flash beat was checked.
