# Real first-pass image qualification: two new scripts and four actual provider outputs

Date: 2026-11-20. This report distinguishes the **unrepaired first provider output** from a *freshly regenerated* output after a transferable method change. It is **not** a blinded new-chat test or finished-animation qualification. Every output below was produced through an actual `image_gen.imagegen` invocation that carried the compiled exact `prompt` **and** two original-HD STYLE-ONLY reference-image paths. The images are preserved unaltered under `assets/`.

## Traceability and honest output status

| New original brief | Actual provider prompt SHA-256 | Original visible image (SHA-256) | What the pixels showed |
| --- | --- | --- | --- |
| New acting engineer “Nila”: one grasped triangular conductor and one needle instrument, first pass before anchor repair | `ba7dd9b57964624189222f7df98de0c200996dcb01f01142d9609b77223672ea` | `qualification_firstpass_human_v1.png` (`49ac8b24a2eea517819117133cf2b10098f233675367bfefc61258c80977d065`) | **Style improved:** large bounded hair/face/cheek/sleeve fills; functional hand grip, stable meter housing, quiet aqua support. **Failed content discipline:** invented white rotation arrow, despite no authorized arrow. Not a full human acting state family. |
| Same brief, **regenerated after method repair**, not another “first pass” | `1e59d61d9b72c71de7e7c3896e70b91e8e1306f68738b03238258a5dd5f62181` | `qualification_revised_human_v2.png` (`eab4fab081f8fb92a6af4c1fde418bcd855e533e266948e51aa8ae169a7a261a`) | The unrequested white arrow is gone. Hand, loop and dial are still actual connected source-like 2D filled silhouettes. **Not proven:** reproducible character identity through multiple poses or proper needle motion. |
| New abstract seismic refraction cross-section: two rock materials, one bent path and surface instrument; first pass | `fbe5fe072fcabec8f8271990c741411e210e42f95dc5f7955707ffd7636b975c` | `qualification_firstpass_seismic_v1.png` (`707415e9c93542d3dd7ba44a926a004d0bf7182aa7d14d78290ef1d1ffb362bb`) | **Style improved:** coherent 2D material-owned rock bands, one causal yellow-orange path, restrained sensor geometry, no photoreal textures or decorative cave. **Failed causality:** the initial source/crack does not appear; the ray enters from the left picture edge. |
| Same brief, **regenerated after method repair** | `7bc7ca8b476c2a5027b6efa7744925a0c73f7adc3836a201b4a991726ce115e1` | `qualification_revised_seismic_v2.png` (`85038f074926592f71b0233c994c0ee7b7f03400e2b758dbd59ea10903bda5ad`) | A jagged source crack appears; the ray now joins that crack, bends at rock boundary and reaches the sensor. **Still imperfect:** crack extends off the lower edge; two pulse-arc marks appear instead of exactly one. This remains partial pass, not authored state-count compliance. |

All four provider images are original raster `1672×941` pixels, not native UHD/4K and not the exact `1920×1080` requested in the ArtJob. The generator chose this near-16:9 output size; **no one may assert delivered 1080p or 4K from the text specification alone**. Supplied source-only native references were full `1920×1080` and sha-verified.

## Conditions changed upstream, not merely cosmetic downstream

The source-driven first-pass controls already enforced filled parent contours, non-painterly material regions, an actionable face feature budget, top-level colored causal contrast and explicit quiet areas. Compared with the failed earlier clean-room Asha images (which showed strand-rendered curls, painterly fabric and realistic lighting), the two new images display more of the actual flat-shape construction on their **first output**. This is an **observed result on these two tasks**, not a guarantee of the same output on any script.

The revealed first-pass weaknesses were semantic, not aesthetic: an unrequested explanatory arrow, and a missing causal source. The shared production controller `prepare_first_pass.py` now requires a `causal_frame_geometry` object: at least two normalized visible screen anchors, their actual parents/marks, connected relationships, a strict edge policy and an exact authorized-symbol list. The producer puts these facts **before** the long source method appendix. The replacement prompts were really regenerated with those instructions; visible output did change in the intended direction. However stochastic generation means one before/after pair is **not** a controlled proof of causal attribution.

## Source only vs new content separation

- Human brief source inputs: actual `BRAIN_0157_couch_human.jpg` and `MEMORIES_0753_clinic_humans.jpg`, as contrasting STYLE-ONLY witnesses. The engineer, instrument, copper loop, pose and environment were authored for the new test, not source-copied.
- Seismic brief source inputs: actual `AI_21328_sparse_relation_diagram.jpg` and `MEMORIES_03825_dense_neural_field.jpg`, contrasting a sparse array with dense graph-owned elements. The refraction section, fault, sensor and ray are invented new script content, not image transfers.
- Both requests preserve a source-rejection instruction. The prompt and image SHA values are recorded above; the full ArtJobs `qualification_unfamiliar_human_and_instrument.json` and `qualification_unfamiliar_seismic_refraction.json` are preserved as construction examples, not as templates to copy.

## Qualification verdict

`FIRST_PASS_STYLE_CONSTRUCTION_OBSERVED_IN_TWO_DISSIMILAR_ORIGINAL_BRIEFS`: yes; broad shape and materially attached colored regions carried through in both.

`CAUSAL_CONTENT_FIRST_PASS_RELIABLE`: **no**; each original first-pass had a high-impact semantic error.

`REPAIR_LOOP_ACTUALLY_RUN`: **yes**, one traceable generalized rule repair and actual model regeneration per brief. The second abstract result remains visibly imperfect.

`ARBITRARY_NEW_SCRIPT_SOURCE_STYLE_EXACT`: **not qualified**; no sufficiently large blinded sample and no human panel comparison to actual source frames, no exact style equivalence metric.

`REGISTERED_VIEWS_CHARACTER_IDENTITY_MOTION_60FPS`: **not tested** here; four stills are not pose consistency, motion, transitions, or a finished film.

The highest-leverage remaining validation is **blind fresh-chat first-pass trials across more art families plus actual registered alternate states**, not endless repairs of this one seismic picture. Preserve its failure as data rather than adding another scene-specific prompt hack.
