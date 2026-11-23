# Complete source-resolution numeric frame pass and question-driven visual decoding

**Study completed:** 20 November 2026. **Source originals:** all five verified MP4s. **Scope honesty:** every consecutive original 1920×1080 image was **fully raster-decoded and numerically analyzed**; this is not a claim that a human or language model artistically inspected every one of the 242,095 frames at full size. The second, separate task of *understanding* the transferable artwork used native-resolution source examples selected through falsifiable questions and different film/medium contexts. Neither evidence category substitutes for the other.

## Full frame tally (exact original-HD raster scan, no resizing)

| Film code | Frames individually decoded and processed | Median per-frame luma `YAVG` (8-bit YUV) | Median per-frame saturation `SATAVG` | Frames with very low whole-image luma difference, `YDIF≤0.25` | Frames with relatively high luma difference, `YDIF≥3` |
| --- | ---: | ---: | ---: | ---: | ---: |
| `NUCLEAR` | 40,782 | 119.417 | 39.942 | 23.91% | 19.13% |
| `BRAIN` | 45,188 | 76.736 | 41.605 | 28.18% | 11.93% |
| `SOLAR` | 45,809 | 56.664 | 30.708 | 25.87% | 13.63% |
| `AI` | 60,169 | 80.426 | 41.401 | 28.65% | 13.33% |
| `MEMORIES` | 50,147 | 66.573 | 32.422 | 27.32% | 10.67% |
| **TOTAL** | **242,095** | — | — | — | — |

All features and quantiles come from `NATIVE_1080P_FRAME_STUDY_SUMMARY.json`, not hand-estimated from image grids. The study was run as five separate resumable film checkpoints. Each `references/native_scan_verifications/{film}.json` contains the original SHA-256, 1920×1080 dimensions, exact decoded count, native metadata SHA-256 and checkpoint status. The original pixel-domain per-frame `YAVG`, `YLOW`, `YHIGH`, `UAVG`, `VAVG`, `SATAVG`, `HUEAVG`, `YDIF`, `UDIF`, `VDIF`, `scd.score`, and `scd.mafd` arrays are preserved under `assets/native_frame_feature_evidence/{film}_features.npz` as consecutive frame-indexed rows. The raw per-frame metadata is much larger and not embedded in this portable skill; the features can be reproduced when the original MP4s are provided again.

**Interpretation boundaries:** The luma and saturation units are ffmpeg signalstats values, not authored HEX palettes. A low whole-frame pixel difference does **not** prove a frozen artwork, or that no object moved; an active small figure can coexist with an unchanging background. A high change score does **not** prove a cut rather than a sudden effect. These quantities help locate and contrast evidence; they cannot alone reconstruct separate layers, hand animation, material assets or narrative attention.

## Native-semantic study route after all-frame measurement

1. Resolve a question from a failed unfamiliar drawing to one causal layer of construction: e.g. face/distant actor budget, material-owned light, graph-attached complexity, information-stage projection, real camera footprint, or state/identity registration.
2. Use per-film frame-indexed numeric candidates to find **unlike** examples (change peak, quiet low-motion interval, high saturation, dense contour, sparse contour) and compare them with the chronological film survey. Numeric selection is not an art classifier.
3. **Check source type before learning any rule.** Advertising (QR codes, live-action sponsorship, sponsored interface demos, branded news mockups) appears in portions of the source MP4s and can dominate random high-contrast/change selections. Keep those samples in the source index for completeness, but label `SPONSOR`, `EDITORIAL`, `LIVE_ACTION`, or `UNKNOWN`; exclude from conclusions about ordinary animated educational artwork.
4. Inspect the selected original-resolution frame at 1920×1080 and a nearby time sample; inspect at least one unlike film or medium at native size. Record the visible positive and counterexample, and separate observed facts from extrapolated engineering rules.
5. Rewrite **conditional** instructions with parent/child attachment, contrast owners, shape/geometry and viewer proof; do not extract source-specific characters or literal visual metaphors.
6. Actually generate on a new original brief with original-HD STYLE-ONLY reference images attached, preserve the **first** output before corrections, diagnose its pixels, repair the generalizing rule, and rerun. Check both causality and style. This is not certified in advance by the presence of a large guide.

### Questions with actually viewed original-HD counterexample anchors

**Character scale:** `MEMORIES` frame 10,101 uses a large close actor assembled from hair cap, face, eyes and hand lobes. `AI` frame 34,051 uses a small symbolic actor with minimal facial marks on a large abstract stage. `NUCLEAR` frame 12,174 is a biological macro subject allowed far more internal anatomy. A universal eye, hair and garment-detail count fails; scale plus *semantic role* decide. See `CONDITIONAL_NATIVE_QUESTION_LOOP.md` Q1, Q4 and Q5.

**Dense world vs quiet causal idea:** `MEMORIES` frame 3,825 is filled with tiny colorful terminals attached to a limited set of branching parent networks; `AI` frame 39,233 builds a field of repeating agents along receding screen-space lanes; `AI` frame 21,328 uses only a handful of disks on a cyan substrate to express a relation. In each case, complexity follows the *explanatory entity generator*, not a global demand for colorful microscopic decoration. See Q2, Q3 and Q7.

**Color-system variation:** The source-wide luma medians differ substantially and native case comparisons span pale cyan, lemon-orange, deep near-black blue and indigo/violet regimes. Color must be assigned by local function and material ownership, not an allegedly “exact Kurzgesagt palette” copied uniformly across new scripts. See F51 and `SOURCE_CONDITIONAL_DOMINANT_COLOR_REGIONS.json`.

**Future editable worlds:** Dense source 2D systems can contain many visible repeated entities, but a single screenshot does not reveal whether the studio generated them procedurally, assembled them in 2D, or used 3D. The *reconstructable* instruction is to author a repeat generator with exact parent frame and transform rules, plus separate causal state layers—not to invent a proprietary renderer history. See F54, and treat renderer identity claims as `UNKNOWN_SOURCE_PRODUCTION_TOOL`.

## Reproduction commands when source originals are available

Use a separate output directory. Requires Python 3, NumPy and ffmpeg on PATH. Each film is checkpointed atomically; rerunning skips verified films and never promotes an incomplete `.partial` into a success.

```bash
python scripts/replay_native_full_hd_scan.py --source-root path/to/parent-of-source_originals --out-dir path/to/native_scan_out --workers 3
python scripts/summarize_native_full_hd_scan.py --scan-dir path/to/native_scan_out --summary-out path/to/NATIVE_FRAME_STUDY_SUMMARY.json
```

The source filenames and original SHA-256 are specified in `FULL_FILM_SOURCE_REGISTRY.json`; **film source files themselves are not part of this skill**. The portable native witness anchors are limited STYLE-ONLY excerpts for studying methods, not media assets for the new story.

## Evidence labels

- `COMPLETE_NATIVE_PIXEL_PASS`: **verified** for all 242,095 full-HD frames, with preserved per-frame features and receipts.
- `QUESTION_LED_NATIVE_VISUAL_INSPECTION`: **performed** on representative native-resolution examples from all five films with unlike scene/medium contrasts.
- `COMPLETE_NATIVE_ARTIST_SEMANTIC_REVIEW_EACH_FRAME`: **not established**; numeric measurements and several hundred hand-viewed witnesses do not constitute 242,095 independently interpreted artworks.
- `SOURCE_VISUAL_METHOD_CONSTRUCTED`: F01–F56 and conditional observations, not source-project or authored software recovery.
- `ORIGINAL_FIRST_PASS_PIXELS_TESTED`: two unrelated new briefs, four actual provider images; see `FIRST_PASS_UNFAMILIAR_2026_QUALIFICATION.md` for exact successes/failures.
- `BLIND_EXACT_STYLE_OR_COMPLETED_MOTION_QUALIFIED`: **not established**.
