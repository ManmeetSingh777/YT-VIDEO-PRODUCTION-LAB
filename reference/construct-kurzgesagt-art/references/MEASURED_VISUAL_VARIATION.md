# Native-witness color/edge measurements and constraints against false universals

**Measurement is descriptive, not an illustration preset.** For 85 targeted native source frames from five films and the supplementary volcano video, a script rescaled each source to at most 960×540 and quantized it into 12 median-cut RGB color clusters. It measured pixel channel spread and adjacent-pixel contrast. See `QUESTION_WITNESS_PALETTES.json` for each witness, source dimensions, source timestamp, and the 9 most occupied quantized colors. Resizing, JPEG compression, glow and temporal sampling affect all measurements. **No output has been calibrated to the artist's original editable SVG, illustration file or After Effects master.** Do not treat source MP4 RGB triplets as the studio's original design tokens.

## Exactly defined probes

- `fraction_spread_gt_70`: fraction of measured pixels where `max(R,G,B)−min(R,G,B) > 70` in 8-bit RGB. This is an elementary channel-spread proxy, not perceptual colorfulness or exact saturation.
- `fraction_horizontal_neighbor_rgb_mae_gt_20`: fraction of horizontal neighboring pixel pairs for which the *mean of absolute differences over the three RGB channels* exceeds 20. This measures an aspect of screen-local contrast frequency after downsampling, not number of objects, line thickness, or quality. A bright halo can lower apparent edge concentration despite a richly designed shape.
- `top_median_cut_colors`: the color/area pairs from one source-native witness after median-cut clustering. They demonstrate *scene-local* palette role, not a fixed creator hex table.

## Dissimilar scenes expose the limits of global style adjectives

| Film witness | Horizontal neighbor contrast fraction (definition above) | Pixels with channel spread >70 | How to interpret construction |
| --- | ---: | ---: | --- |
| `AI@35` oblique high-rise world | 0.0980 | 0.9181 | Repeating actual architecture, windows and roof/wall boundaries produce substantial local color discontinuity. High local detail comes from structure-bearing modules, not overlaid texture. |
| `AI@874` dark gate/corridor | 0.0061 | 0.5036 | Nearly sixteen times less high-contrast adjacency than `AI@35` despite a complete world. Control of large near-dark planes, tunnel recession and a small lit center is the art. |
| `AI@444` information theatre | 0.0108 | 0.3760 | Light, translucent, mostly cyan/white panels create a quiet high-exposure environment. A dark violet background is not mandatory for digital subjects. |
| `AI@514` glass volume with connected tubes | 0.0188 | 0.8341 | High chromatic segmentation plus a few very strong connected object boundaries; not the same micro-pattern density as a city. |
| `AI@856` technology ecology | 0.0713 | 0.7930 | Complete architecture, machine, foliage and energy families generate fairly dense edges without becoming the city of `AI@35`. |
| `MEMORIES@62` repeated biological forest | 0.2695 | 0.4073 | Many small terminal contacts/branches create very high local edge frequency; a superficial “low-detail flat vector” rule would fail dramatically. |
| `VOLCANO@15.2` forest clearing | 0.0206 | 0.8043 | Large overlapping leaves and trunks have much lower high-frequency edge count than microscopic terminals, while still making a dense illustrated landscape. |

These are *one-frame measurements* and only answer comparative questions. `AI@35` compared to `AI@874` has ~16.1× the measured high-contrast adjacency; `MEMORIES@62` compared to `VOLCANO@15.2` has ~13.1×. They **do not** establish a range an unfamiliar artwork must meet, because anatomy, zoom, compression and framing differ. Their actual design impact is to forbid a global texture/detail setting.

Across deliberately heterogeneous 85 queried frames, the **group medians** were:

| Curated witness category | n | Median local-contrast fraction | Median high-channel-spread fraction |
| --- | ---: | ---: | ---: |
| AI: abstract-agent media | 18 | 0.0141 | 0.8581 |
| AI: whole-world variation | 20 | 0.0228 | 0.9031 |
| AI: mechanisms/actions | 9 | 0.0167 | 0.7998 |
| Memories: biology/inner worlds | 10 | 0.0255 | 0.4343 |
| Nuclear: physical/data worlds | 7 | 0.0147 | 0.8095 |
| Brain: perception/character worlds | 6 | 0.0156 | 0.8319 |
| Solar: cosmos/scale | 7 | 0.0212 | 0.3869 |
| Volcano supplement: world bridges | 8 | 0.0190 | 0.8301 |

**Selection caveat:** these are *question-driven artistic witnesses*, not random representative footage. A curated group median must not be mistaken for an unbiased film-wide average. The all-frame numerical summary, a separate 160×90 probe, provides film-wide technical context when completed.

## Style instructions that actually follow from these comparisons

1. **Select a geometry and detail generator before choosing colors** (F37–F47). The same producer can be re-parameterized for novel subjects; an extracted RGB code cannot.
2. **Allocate contrast to the important structural boundary.** Urban roofs and windows need many repeated boundaries; a dark corridor needs a few sharp apertures with broad low-value surfaces; microscopic biology needs hundreds/thousands of attached small termini; a forest clearing needs larger overlapping foliage clumps and controlled open space.
3. **Treat local color palettes as functions.** Assign background, exposed top plane, wall face, recessed part, near occluder, living material, effect source, reflected material and label roles. Color choices must preserve readable adjacency and source-consistent material handling, not copy a single film frame's most common colors.
4. **Keep optical effects material-owned.** In a bright screen gallery, the pane rim/content may be higher contrast than its mostly translucent fill. In a luminous container, bright face edge + localized halo may coexist with relatively transparent interior surfaces. In foliage, color patch and overlap often suffice without any emissive glow.
5. **Prove what a quantitative rule controls.** A “more edge dense” instruction is incomplete; specify *which* parent-bound modules, branches, windows or surfaces are being added, then compare native crop and thumbnail. The edge statistic is only a secondary diagnostic.
6. **Reject a fixed universal texture, line weight, edge color, color hex list, glow radius, number of shades or level of detail.** Such constants are inconsistent with the witnessed source contrasts. Use per-material/per-view relative values and inspect final pixels.

## Reproduce or challenge the probe

The audit script `full_film_study/scripts/measure_source_witnesses.py` measured original sourced 85 JPEG witnesses; the full result snapshot is included as `QUESTION_WITNESS_PALETTES.json`. Re-extracting at a different timestamp, using another resize filter or measuring original illustration assets will alter values. Differences that persist under these perturbations are more credible than exact isolated decimals. Use one frame as evidence of **what is possible in the creator's visual language**, and unlike cross-references to support *where* that operation transfers.
