# Five unrelated original-world image tests + one targeted material/detail repair

**Date:** 20 November 2026. **Model route:** the built-in image generator was actually invoked with selected **native film frames as STYLE-ONLY references** and explicit original new scripts. **Five unfamiliar artworks plus one edit** were visually observed and placed in `assets/`. Tests G/H/J/K and G's local repair used authored world-system prompts; **Test I submitted a validated real `compile_art_job.py` output intact to the image generator**. These exercises touch all six **content/mode categories** of the F50 first-pass adversarial matrix (some outputs fulfill multiple categories) but do not constitute an exhaustive independent certification of arbitrary-script generalization. No animations, separated edit layers, canonical character sheets, random-seed repetitions, independent blind rating or cross-provider replication were produced in this round.

## Test G — functional floating rainwater district

**Unseen content:** a floating flood-protection settlement distributes collected rainwater to buildings, planted filters and docks through connected aqueducts. This subject, its objects, geography and arrangement were not drawn from an existing reference film scene.

**Source comparisons used (STYLE ONLY):** `AI@35` (oblique face-local built detail), `AI@856` (whole functioning dense eco-technological environment), `NUCLEAR@296` (vegetation/coastal substrate), `VOLCANO@15.2` (foreground/vegetation depth). Original identities, devices and source shot layouts were prohibited.

**Explicit construction decisions in the actual image request:** oblique 2.5D axes across all structures; continuous river and channels; tiered connected rain collector on one side and a separate reservoir on another; functional pump hall, several inhabited buildings, dock and greenhouse, three projected wall/roof material plane families; reservoir outlet → socketed pipe → supported bridge → branch valves → receiving buildings/filtration beds; three tiers of plant/architectural detail each attached to its parent; restrained local emission on water-route conduits; at least some physically complete objects in every screen quadrant. These are transferable generators, **not** instructions to keep those objects in another script.

### Observed initial output

![Source-guided original floating rainwater settlement](../assets/transfer_g_flood_world_source_guided_first.png)

**Present in pixels:** entire constructed world, coherent elevated oblique view, nested actual reservoir shapes with exposed rim/water, pier supports, architectural wall/roof faces, greenhouse with actual curved structure, repeated roofs/trees/windows and connected glowing water transport; source identity/layout is not visibly reproduced. Object density is structurally supported, not random stickers.

**Visible style mismatch:** many equal-strength white-cyan marks across the network, river ripples and small material highlights; some repeated rounded tree silhouettes and a globally glossy “toy/mini-game” quality rather than the source's more selectively flat painted planes. The error is primarily F46 `edge/emission/material ownership` and F47 `T3 detail concentration`, not the physical world graph.

### Actual targeted repair, same content and framing

Image generator was called again **in edit mode**, targeting the initial generated PNG; it was ordered to preserve the positions, identities, pipe contacts and geometry while removing approximately half the decorative small water/pipe specular marks, flattening unnecessary bevels and using larger face-owned color regions, with source comparison again labeled STYLE ONLY.

![Same novel world after local material/detail repair](../assets/transfer_g_flood_world_source_guided_repaired.png)

**Observed result:** no large-scale content replacement; the tank, architecture, bridge, greenhouse, water and buildings remain in the same relative positions. Fewer tiny bright ripples appear in water and the wall/tank planes are more strongly face-local. Overall numeric high-frequency neighbor-contrast fraction after downsampling to 960×540 fell from **0.1433 to 0.1365** (definition and limitations in `MEASURED_VISUAL_VARIATION.md`). This 4.7% reduction is **not an independent perceptual quality score** and does not prove the target style exactly. Some uniformly rounded tree and glossy detail language remains. **Verdict:** actual original-world content construction and conditional material edit **OUTPUT_DEMONSTRATED**, exact creator-style match **NOT QUALIFIED**.

## Test H — one observation branching into three climate futures

**Unseen content:** one observation from a new weather instrument branches into three coherent physically enclosed possibilities: rainy landscape, dry upland, windy coast. Distinct miniature world topologies are essential; this is not an AI character, source digital chamber, or source space diagram.

**Source comparisons used (STYLE ONLY):** `AI@444` (light-toned spatial information environment and transparent panes), `AI@514` (solid connected optical structures and local light), `MEMORIES@18` (a tiny enclosed ecological habitat with inner environment), `SOLAR@560` (diagrammatic spatial relations on dark field, a contrast for the new bright environment).

**Explicit construction decisions:** one self-contained pale cyan/cream observatory substrate with tiered arced decks; one new V-branched measurement mast whose output reaches a shared actual junction; three separate colored routes each terminating on a visible socket of an arched lens; *three complete miniature scenic systems*, not label stickers—each with its own horizon, near/mid/far terrain, small buildings/trees, weather and atmosphere; near transparent rims mask inner scenes and carry bounded highlights; the visual cause/path/output stays legible without text. Minimal supporting effects, no source AI mascot or glass cube.

### Observed output

![Three original nested weather outcomes in an invented observatory](../assets/transfer_h_weather_futures_source_guided.png)

**Present in pixels:** three clearly different whole landscapes within their own attached lens shells; supports and near rims; rain, desert sun and windy ocean outcomes distinguishable even without captions; a center V-shaped instrument and one branching colored connection; a navigable deck environment with floor seams, rails and recessed panels. The light exposed world is an informative counterexample to a universal deep-purple digital realm. No source original character or famous source scene reproduced.

**Visible weaknesses:** the generator included a foreground human scientist where an instrument-only environmental test would have sufficed. That addition does not corrupt the visible causal relationship but it is **uncontrolled content expansion** and illustrates why an `ArtJob` must explicitly list allowed actors. Glass rims and some structures have uniform glossy effects that drift toward rounded 3D clip-art rather than every reference's more variable material treatment. The light atmosphere and paths are successful; precision of motion-state asset extraction and source creator equivalence remain untested. **Verdict:** nested original-world construction **OUTPUT_DEMONSTRATED**, high-exposure information setting **OUTPUT_DEMONSTRATED**, exact style and arbitrary-world reliability **NOT QUALIFIED**.

## Test I — actual validated compiler → image provider: fungus/root exchange world

**Unseen content:** an underground mixed woodland in a cutaway. Two distinctly built tree root systems are joined by the continuous external hyphal material of a third organism. The highlighted route is only a subset of the actual network. This tests source-to-original world assembly while avoiding the biological source's original neurons, synapses, layout and characters.

**Exact retained job:** `assets/novel_mycelium_world_art_job.json` contains original script, canvas, subject anatomy graph, `BIOLOGICAL_MICRO` class, soil substrate, 3 regional layer masks, 3 named actual root/fungus parts, 2 physical connection endpoints, species-dependent root generators, material-plane rules, owner-constrained single luminous path, source-only witness IDs, forbidden extras, visual crop tests and 5 real methods F37/F41/F46/F47/F49. The native witnesses were `MEMORIES@62,75`, `NUCLEAR@296` and `VOLCANO@15.2`, **STYLE ONLY**. The output scene was not in those frames.

**Actual bridge:** `scripts/compile_art_job.py` validated the job, then built `assets/transfer_i_mycelium_compiled_prompt.md` (**30,211 characters**) with all selected operative rules and the new script intact. `assets/transfer_i_mycelium_compiler_trace.json` records the pre-request compiler state and payload hash. The **actual built-in image generator received the full compiled payload**, with a short framing instruction and the four style-only witness images. A first attempt was caught by the provider's 32,000-character input limit because F49's *illustrative* sample JSON had been redundantly included; the compiler was then repaired to remove **only that unused example** from provider text, keeping the real current `world_system` and all operative method rules. A new regression test keeps this fixture below the provider threshold. The successful submitted payload was under that threshold. The archived compiler trace is intentionally still `COMPILED_NOT_DEMONSTRATED` because it was generated before the provider call; this observed output is the independent receipt that advances the claim.

![Original newly constructed underground fungal exchange world from the actual compiled prompt](../assets/transfer_i_mycelium_compiler_to_provider.png)

**Observed pixel result:** two individually different whole tree/root anatomies with visible attached stems above ground; near/far rocky soil layers, embedded stones and vegetation; a fine pale-green mycelial network meandering across the substrate and physically reaching both roots; one sharply highlighted yellow-green signal path with terminal contact rings at actual roots, bounded light that does not contaminate the entire soil; small fungal forms attached to the web. No human narrator, fake glowing data grid, copied source neuron cell body or source mascot is visible. The new subject remains readable at thumbnail. This is **strong original biological-world content transfer** from generic style construction methods.

**Remaining limits:** native crops can show some hyphal continuations hidden behind rocks/roots but do not provide mathematically provable full graph continuity without editable source vectors. A still makes no claim about nutrient physiology direction, actual real-world microscopic density, future character consistency or animation states. At 960×540, the output's horizontal-neighbor contrast fraction was **0.0883**, between the source forest `VOLCANO@15.2` (0.0206) and dense microscope field `MEMORIES@62` (0.2695); this is **not a target score** because the view's scale and materials differ. **Verdict:** actual compiled rule-to-provider picture and whole original biological environment **OUTPUT_DEMONSTRATED**, exact creator identity/any-script mastery still **NOT QUALIFIED**.

## Test J — sparse abstract-physical countercondition

**Unseen content:** a buried single-particle detector is shielded from interference in a massive silent underground cave. Allowed focal contents are only one scientific instrument, one receiver, continuous cable, cave/rock/support and localized illumination. The attached sources were `AI@874` (very sparse dark axial architecture), `AI@777` (dark abstract floor field), `VOLCANO@14.5` (dark large rock masses) and `NUCLEAR@387` (selective night light), all labeled **STYLE ONLY**. The request expressly barred recreating the AI corridor or volcano.

**Part and visual construction controls:** large continuous irregular cave vault and overlapping strata, small material-valid suspended detector with round near glass wall and separate side panel, bolted rings and three grounded support feet, one bounded light-yellow central test core, one cable leaving a real socket on apparatus and ending in a wall-mounted actual receiver, tiny local cyan bounce, otherwise dark/empty. No pseudo-technology grid, star particles, faces, labels or “extra detail because style.”

![Deliberately sparse original dark cave detector artwork](../assets/transfer_j_sparse_detector_dark_cave.png)

**Observed pixels:** strong continuous cave top/side surfaces and overlapping cutaway shadows, correct giant-to-small scale relationship, supported detector, mounted receiver and single actual cable, sharply local cylinder light and substantial negative space. The original source's AI gate/door is not copied; the new rock world remains functionally intelligible. At 960×540, the output local high-contrast neighbor fraction was **0.0071**, near—but not prescribed by—the separate source witness `AI@874`'s 0.0061. **Verdict:** sparse scene grammar and owner-limited effects **OUTPUT_DEMONSTRATED**, no new source scene copying visible.

## Test K — materially rich submerged functional ecosystem

**Unseen content:** a deep-ocean hydrothermal vent observatory samples mineral-rich plumes. This is an original seafloor world with its own ravine, rock chimneys, plume material, coral/tube fauna and a pressure-safe laboratory linked through a physical collection network. Style-only witnesses were `AI@856`, `MEMORIES@18`, `NUCLEAR@296` and `VOLCANO@15.2`; no original source object or frame arrangement was requested.

**World graph and surface controls:** continuous projected angled ravine and rock substrate; three source vent chimneys with attached bounded plumes; near/mid/far coral/ecosystem population with 3+ different branch/tube families; one original large horizontal sea-glass cabin mounted on grounded rock struts with orange structural truss and separate inner laboratory scene; actual sampling tube emerging from vent sockets, joining a ringed processor and entering the lab pump; face-local metal/housing colors, glass near rim, several internal specimen tubes, attached articulated arms and a control display; a few fish-like organisms with actual fins at more than one depth; all detail tied to functional rock, plant, machine or anatomy parents.

![Full original functional hydrothermal observatory and seafloor ecology](../assets/transfer_k_underwater_observatory_world.png)

**Observed pixels:** densely inhabited complete marine world, distinct rock/plant/mechanical parents in all corners, plumes originating at vents, physically connected sample tubes, glass pressure cabin with visible internal mechanism, intentional primary lab-to-vent path and multiple layers of depth. It uses much brighter local emissions and more repeated fine parts than Test J; the same family can deliberately support both density extremes. At 960×540 the high-contrast neighbor fraction was **0.1145** versus Test J's **0.0071**, about a **16.1-fold difference** arising from *different source-appropriate world structures*, not a fixed detail amount. The bright turquoise lab hardware and some tube/shell highlights retain a slightly glossy digital-clip-art bias compared with more planar witnesses; if artistic identity matters over technical diagram clarity, target **F46 material-face simplification** without removing underlying vent/lab contacts. **Verdict:** rich original underwater world, attached biological detail and functional machinery **OUTPUT_DEMONSTRATED**, exact creator equivalence still **NOT QUALIFIED**.

## F50 first-pass adversarial class coverage

| Required dissimilar mode | Actual new evidence | First-pass verdict |
| --- | --- | --- |
| Abstract physical facility/world | K: complete hydrothermal sensor/laboratory habitat; J: the opposite minimalist cave facility | visible structural pass for both density extremes |
| Abstract relational multi-outcome | H: sensor-to-three independently inhabited climate futures | visible source/branch/3-outcomes pass |
| Dense organism/environment | I: original underground rooted trees and distinct fungal web | visible parent-branch and habitat pass |
| Dense functional built world | G: actual multi-building floating water district, one local repair | visible world graph pass; material shine needed repair |
| Nested contained independent scene | H: three small worlds with independent climate/topology and curved rims; K: glass cabin | visible inner/outer aperture pass |
| Counterexample deliberately restrained | J: very dark massive cave with only one sensor and one cable; no filler | visible sparse pass |

**Coverage is not certification:** each category has only one or a few images, not multiple blind prompt variants with rigorous style adjudication; editable layers, identity continuity, physically correct animated source-to-target routes and multi-minute video remain untested.

## Rule-to-pixel results

| Rule/claim | Actual outcome | Status |
| --- | --- | --- |
| F37: a new script compiles to a *different* concrete world class | Five images show unrelated original content rather than restaging source subjects. | `OUTPUT_DEMONSTRATED` for five particular briefs |
| F38: projection governs part orientation | Built world roof/wall/bridge relationship is mostly coherent; nested environment uses arc/deck space, with separate interior projections. | `OUTPUT_DEMONSTRATED` with occasional local inconsistencies to audit |
| F39–F40: environment richness comes from part systems | G built/wetland, I rooting/network habitat, K seafloor/machinery demonstrate three unlike parent-bound families. | `OUTPUT_DEMONSTRATED` across multiple sampled world classes |
| F43: every information theatre type can be reconstructed | Weather result shows multiple spatial climate outcomes but no adversarial pane-ring/exploded-interface test. | `PROMPT_ONLY` for those untested subtypes |
| F44/F48: transparent contained world is a complete inner environment | Three individually drawn terrain/atmosphere families have their own shell rims and connection points. | `OUTPUT_DEMONSTRATED` for multi-habitat lenses |
| F46: local material planes and emission | First flood output overused white gloss; source-specific instruction reduced it in a same-scene edit. | `OUTPUT_DEMONSTRATED` targeted adjustment, no full rule qualification |
| F47: density tied to parent structure | G/K/I have many real parent-bound modules; J intentionally stays sparse at 0.0071 neighbor edge fraction versus K 0.1145. Excess T3 marks appeared in G initial and some glass highlights in K. | `VISIBLE_PASS` for class-conditional density, `VISIBLE_BUT_WEAK` for universal T3 restraint |
| F49: world graph strict compiler | Separate world fixtures compile; disconnected pipe, missing coordinates, uncontrolled effects and single-witness fixtures rejected; **third novel biology test used the actual compiled payload and received a visible image**, not merely a unit-test transcript. | `OUTPUT_DEMONSTRATED` for one compiler-to-pixel novel world, not provider-universal |
| F50: arbitrary unfamiliar script mastery | Five original new-world stills plus one edit cover all six broad first-pass class categories, but not blinded independent judges, repeated seeds/providers, character-state/motion consistency. | `FIRST_PASS_CLASS_COVERAGE`, *not* `QUALIFIED` |

## The most valuable transferable corrections preserved from these tests

1. **Author the connection graph *before* drawing water/data tubes.** The very visible outlet, bend, branch, socket and receiver survive complex scenery and independently communicate the new claim. Keep the `relationships` IDs in `world_system` and check each at native scale.
2. **A small habitat can be nested only after it is a complete scene.** Draw actual geography/clouds/inhabitation under an aperture mask; near shell/rim and speculars form another layer. This makes three independently authored futures possible without copying any of the source's contained scenes.
3. **An image generator can follow structure and still overdo a style-surface habit.** Explicitly separate T1/T2 modules from T3 effects and give the correction *to the same image with locked geometry*, not a fresh vague “make it cleaner” prompt.
4. **Content ownership is a separate gate.** Add `allowed_subject_ids` and `forbidden_extras` in live briefs; do not assume a model infers that a visual weather explanation should have no narrator character unless this has been made explicit.
5. **Complexity is not a certification number.** Source-native contrast fractions differ by over an order of magnitude across modes. The flood render may look strong while its 960px edge fraction exceeds sampled unlike city witnesses; what matters is whether every mark belongs to a functional structural parent.

The generated PNGs preserve the observed test output, including the *before* and *after* material repair. Test I preserves its actual real ArtJob and exact compiled output request. They are real raster stills, **not editable separated SVG/PNG assets, animations, or proof that a future model will get identical pixels**. Future production must rerun these tests across different providers, characters and blind prompts, trace request receipts, inspect masks and full-motion exports before using the stronger label `QUALIFIED`.
