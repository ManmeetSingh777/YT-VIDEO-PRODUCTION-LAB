# Actual F57–F80 unfamiliar first-pass transfer — 20 Nov 2026

This report records **what was actually submitted and seen**. It is a source-grounded first-pass illustration qualification attempt, not a film animation or claim of exact studio artistic identity. The images are wholly original new briefs, not reconstructions of the cited film scenes. Earlier Asha/leaf images motivated the failure analysis but are **not** relabeled as successes.

## Execution and provenance

The installed first-pass compiler constructed complete prompts and verified actual original-HD STYLE-ONLY image attachments. The agent read each `IMAGEGEN_REQUEST.json` and called `image_gen.imagegen` with **its exact prompt and `referenced_image_paths`**. Outputs were visually inspected in the conversation, then copied non-destructively to stable skill assets. The `PROVIDER_PRE_SUBMISSION_MANIFEST.json` files intentionally retain `provider_request_submitted=false`: they are **pre-submission records**. Actual submission and observation are evidenced by the tool call plus this separate post-submission record, not a retroactively doctored pre-submission flag.

| Actual new image | Original brief and selected F methods | Actual prompt and source images | Real pixel output |
|---|---|---|---|
| **Fungal mineral exchange** | Rooted fungal tube delivers nutrient to a tree root at physical junction; F57/F59/F61/F71/F74/F77; first-pass `method_bindings` F57/F71/F74 | `assets/unfamiliar_molecular_fungal_art_job.json`; `assets/unfamiliar_molecular_fungal_request/IMAGEGEN_REQUEST.json`; SHA-256 prompt `635c5125e33065df343ef6db59b410ed7b8d07754ff4cf6b2f6983a17e66e147`; 20,358 characters. Attached native witnesses `MEMORIES@62`, `AI@702`, `AI@444`. | `assets/qual_molecular_fungal_first_pass.png`; **1672×941**; SHA-256 `702200228fa328b186f9962740c7442c81f63d83a835c2e55ee5d7eedea2d4dc`; status `FIRST_PASS_OBSERVED` |
| **Seismograph human + mechanism** | New scientist points to and adjusts drum recorder: actual stylus touches paper, trace begins at tip; F57/F59/F60/F61/F64/F65/F66/F68; first-pass `method_bindings` F57/F64/F68 | `assets/unfamiliar_molecular_seismograph_art_job.json`; `assets/unfamiliar_molecular_seismograph_request/IMAGEGEN_REQUEST.json`; SHA-256 prompt `485cd78a783bd61bd6a0e3963ff81b5840b9e7b6a824eb08996246287c7c2213`; 23,564 characters. Attached native witnesses `BRAIN@274`, `AI@285`, `NUCLEAR@145`. | `assets/qual_molecular_seismograph_first_pass.png`; **1672×941**; SHA-256 `e00bd8f22776fa51811c6de02389427f4081fa716c933368b83e5f8c5d8fa6c6`; status `FIRST_PASS_OBSERVED` |

Source witness hashes and native original dimensions 1920×1080 are recorded in each preserved pre-submission manifest. Source image identities and original provenance are independently in `QUESTION_NATIVE_WITNESS_MANIFEST.json`.

## Visual assessment: observed **and** failed details

### Fungal exchange first pass

**Observed:** The unfamiliar biological network is drawn as a physically continuous purple parent tube with actual branching attachments, terminating by insertion under a thick root interface. The right root is one oversized sectioned owner with contiguous bark/cortex/cell color masses. Lime nutrient color is bounded by the existing channel; much of the teal earth background remains quiet. This is a mechanism crop, not a scenic fantasy forest. No borrowed film characters or exact scene arrangement are apparent. This materially supports F59/F61/F71/F74 as usable illustration controls on one unseen biological brief.

**Limits:** The active lime route appears as a succession of separated interior oval marks inside the continuous purple tube, rather than an unbroken single-color band. This may be a useful nutrient-packet representation but it **diverges from the request for one continuous flat highlighted inner channel**. The root has many repeated cortex cells; they are parent-attached but some may be superfluous at thumbnail size. It is one single static first-pass image; the actual transport, entry and temporal activation sequence are not animated. Do not assume these cells or capsule branches are an automatically preserved identity across new angles.

**Upstream method consequence:** F71 should distinguish `continuous active filled channel` from `discrete moving nutrient packets` as separate types, and a first-pass job must select **exactly one**. If packets are selected, each packet is located inside a physical tube and the moving process remains visible; if continuous band is selected, prohibit separated highlight islands. Do not make the source style universally luminous or particle-like.

### Seismograph human and machine first pass

**Observed:** A large graphic acting human uses a single attached dark haircap, small number of bounded eye/cheek/brow/mouth shapes, one broad teal garment with material-specific dark planes and a strong orange scarf. The near hand actually wraps a brass control knob. The machine has supported frame, a mounted cream cylinder, a spring-linked stylus and a visible ink squiggle emerging from the actual pen tip. The camera is genuinely **close** on the mechanism, while the backdrop is mostly quiet flat peach color and a simple tabletop. The image does **not** resemble a photographic 3D storybook, painted studio portrait or random neon machine, which were the previous observed failures. This supports F57/F64/F65/F66/F68 on one genuinely unlike new brief.

**Limits:** The second hand points near the stylus but is not touching it—this is allowed by the authored brief, but hand/machine relationships need a separate acting pose family for animation. Some soft color transitions remain, especially across the backdrop and machine surfaces, rather than all hard-edged planes. The trace's physical mechanics are visually suggested; a single image cannot prove the cylinder rotation, seismological accuracy or 60fps hand/line correspondence. No verified alternate drawing states, true-alpha layers, camera overscan, named motion variants or rendered film exist for this sample.

**Upstream method consequence:** For a new machine-action request, F68 requires explicit `input→process→output` and exact contact coordinates at **first pass**, plus a `surface_transition_policy` distinguishing deliberate soft optical/local material effects from prohibited diffuse portrait/modeling gradients. F67 and F79 must be performed before treating this first still as motion-ready.

## Four separate tests of the generation controller

1. **Code route:** F57–F80 are recognized by `compile_art_job.py`, the source fragments are included when methods are bound and the selected `molecular_visual_decisions` block appears *before* the old verbose method text. The entire current local test suite passed **33 tests** on this update.
2. **Source reality:** Each image-generation submission contained at least three unlike 1920×1080 actual original-film images, not filenames masquerading as references.
3. **Causal whole-pixel review:** For both outputs, manually located source/target physical contacts, main silhouette, face/part ownership, region contrast and background density. Not all requirements passed exactly; defects are named above.
4. **Unlike transfer:** One biological/abstract graph and one human/mechanism acting image differ strongly in anatomy, crop, palette and semantic purpose. Improvements appear in both. This is **two examples**, still far short of arbitrary-script guarantees.

## Qualification labels / what is still not demonstrated

- `SOURCE_OBSERVED`: the source-side cross-film counterexamples and temporal operators with exact witnesses.
- `COMPILED`: both ArtJobs and source-native attachment manifests.
- `SUBMITTED`: two actual tool calls with the compiled prompt and original images.
- `FIRST_PASS_OBSERVED`: two actual generated PNGs above, not rewritten after inspection.
- `RULE_REPAIR_DOCUMENTED`: continuous-band vs packet clarity and material softness handling noted in F71/F80. These are **not** separate visual re-generation runs.
- `TRANSFER_TESTED_LIMITED`: two dissimilar subjects from one session only.
- **Not `QUALIFIED`:** no independent clean-room chat, native exact-studio similarity metric, unknown-species anatomy evaluation, source-rights/brand clearance, registered 60fps acting tests, new film output or independent director review.

Do not upgrade this result just because the images look attractive. A model answering a new unrelated script should still use the **whole question loop**, conditional native source images and the full upstream ArtJob before the first generation.
