# P02 baseline, preserved runtime and original source package

## Live repository at the start of P02
- Branch `hv2-system-correction`, HEAD `b511e9333df61459082cb82ab90c73c400787b5f`: the system-correction evidence commit, which was itself awaiting audit.
- User-owned untracked inputs were preserved untouched: `inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md`, `inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md` and `inputs/Exhaustive Frame Analysis.json`.
- No reset, revert, reinstall or history rewrite was performed.

## Toolchain (measured)
- node v22.20.0, npm 10.9.3.
- ffmpeg 7.1 (gyan.dev essentials build).
- Chrome 158.0.8127.36, driven through `puppeteer-core` from the local npx cache (`engine/art_bridge/render.mjs#loadPuppeteer`).
- Python 3, run with `-I` for the skill scripts and zip tooling.
- There is no root `package.json` or lockfile. The dependency contract is in `AUDIT/DEPENDENCY_CONTRACT.md`.

## Neutrino runtime: preserved byte-identical
- `engine/runtime/nu.js` sha256 `773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be`. It is unchanged across the run, and P02 tests and the audit export re-check it.

## Original neutrino source package
- File: `G:\claude subscription experiment\neutrino_2m_SOURCE_PACKAGE.zip`.
  - Size: 380,874,918 bytes.
  - sha256: `1c9f7ee17dde736b7d3eaaee984949db2391d46af6feb7d18e5f6c72135be100`.
  - 209 zip entries.
- It was extracted read-only to `hybrid_v2/work/p02/source_pkg/`.
- Reconciliation against `reference/neutrino_2m_SOURCE_PACKAGE/` (`hybrid_v2/work/p02/SOURCE_PACKAGE_RECONCILIATION.json`):
  - 191/191 files are byte-identical.
  - 0 files differ.
  - 0 files appear in only one of the two copies.
- Package contents:
  - `hyperframes@0.9.11` scripts and gsap 3.15.0.
  - 11 compositions: ascent, body, doors, end, flash, flight, ice, kitchen, planet, source, sun.
  - Forensics 00–10.
  - `reference_outputs`: animatic, proof_12s, final.
- Its `source/assets/nu.js` is **byte-identical** to `engine/runtime/nu.js`.

## Production renderer relation
- The production renderer `art_bridge_chrome_frames` (`engine/film/chrome_frames.mjs`) loads that same `nu.js`, together with `gsap.min.js` and `engine/art_bridge/runtime/bridge_rt.js`, into a real Chrome page.
- It seeks each shot timeline absolutely (`__timelines[id].seek(f/fps)`) and captures native 1920×1080 RGB24 frames of the registered image layers.
- The neutrino compositions themselves are reference material. P02 did not re-render the neutrino film.
