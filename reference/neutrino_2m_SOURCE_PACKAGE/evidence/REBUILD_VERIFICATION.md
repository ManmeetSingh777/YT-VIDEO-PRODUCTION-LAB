# Rebuild verification (performed 2026-11-21)

## What was done
1. Copied `source/` from this package into a scratch folder.
2. Recorded SHA-256 of the 17 generated files:
   - `tools/timing.json`, `assets/audio/narration.wav`;
   - `tools/scenes.json`;
   - `assets/audio/music.wav`, `assets/audio/sfx.wav`;
   - `index.html`;
   - all 11 `compositions/*.html`.
3. **Deleted** those 17 files, then regenerated them with:

   ```bash
   python tools/timing.py
   python tools/mkscenes.py
   python tools/audio.py
   node tools/build.mjs
   ```

4. `sha256sum -c`: **all 17 files OK, byte-identical** to the packaged originals, which are the files at commit `2f6a613`.
5. Rendered three 1-second spans from the regenerated project with HyperFrames 0.9.11 at `--crf 20`, the same CRF as the final render:

   ```bash
   npx hyperframes@0.9.11 render --start S --end S+1 --crf 20
   ```

6. Compared each span with the same range cut from `reference_outputs/final.mp4`:

| Span | Frames | PSNR (avg) | SSIM (all) |
|---|---|---|---|
| 5–6 s (kitchen flood) | 30 | 39.78 dB | 0.963 |
| 50–51 s (Earth cutaway) | 30 | 40.77 dB | 0.972 |
| 92–93 s (Cherenkov event) | 30 | 41.99 dB | 0.976 |

## Checks on the spans
- **Alignment:** a +1-frame shift drops PSNR from 40.8 to 26.8 dB, so the comparison is frame-aligned.
- **Pixel difference at 92.5 s:** mean absolute difference 2.0/255; 99th percentile 9; 0.018 % of pixels differ by more than 24.
  - An ×8 difference image shows only uniform encoder noise on edges and grain, with no displaced or missing objects.

## Interpretation
- The source regenerates every derived file exactly.
- The re-rendered pictures match the film to within lossy-encoding noise. They are not bit-identical, because the original was encoded once over 120 s and the spans were encoded separately.

## Not demonstrated
- A full 120-second re-render.
- Re-synthesis of the voice. The per-sentence Kokoro WAVs are packaged as fixed inputs; regenerating them may not produce identical audio.
- `final.mp4`'s audio post-processing (two-pass loudnorm) was not re-run.
