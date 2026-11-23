# Conditional source investigation: original-HD counterexamples and construction decisions

This is a **style-transfer research record**, not a template library for recreating scenes. Original witnesses come from the five supplied 1920×1080 Kurzgesagt MP4s; their named objects are *examples* to contrast, never images or narrative elements to copy into a new film. See `assets/conditional_native_anchors/`. Every native sample below was individually inspected at source dimensions, in addition to earlier 1-fps chronology and numeric full-frame sweeps. Source JPG hashes are in `CONDITIONAL_NATIVE_ANCHOR_MANIFEST.json`.

## How to run the question loop without overfitting

For each failing original output:

1. **Name one visible error** in the submitted first-pass pixels, e.g. “eyebrow painted in shaded skin,” “high-detail autonomous background,” “distant actor given a realistic coat,” or “neural pattern has no connected stems.” Avoid judgments such as merely “insufficiently rich.”
2. **Turn it into a falsifiable source question:** “When a human is a supporting actor versus the primary acting cue, what visibly changes in face marks and garment surfaces?”
3. **Choose at least two unlike native frames** (different film, subject scale or medium), including a case that would falsify the simple universal rule. Inspect actual resolution, not only the contact sheet. Mark advertisements, source footage and editorial inserts separately; the selection algorithm is not a style classifier.
4. **Extract a conditional producing operation:** parent contour, region-owner, allowed local feature marks, crop, projection, and when the operation is *not* applicable. Record a source-observed fact separately from a proposed generalized rule.
5. **Compile that operation into the FIRST 7,000 prompt characters** and real source-image attachments. Preserve the original creative scene content from the unfamiliar brief. Do not let a 20,000-character method appendix override the practical opening directions.
6. **Generate, see the whole first pass and compare.** If it fails, change the causal construction instructions. A model's cosmetic revision is not evidence that the skill can generate an accurate first pass. Then test the revised operation on another unfamiliar brief of the same conditional class.

## Eight high-impact questions answered by cross-reference

### Q1. Do all characters need the same anatomical detail?

- **Source observed:** `MEMORIES` frame 10,101, at 168.35 s: close actor's head uses a broad violet hair cap, face region and ear/cheek patches, solid white eyes with dark pupils, two attached brow shapes and a small mouth. Hand is a connected solid cluster of finger lobes, not a realistically segmented drawing. The cyan field has little independent furniture. `AI` frame 34,051, at 567.52 s: the person standing on a projected symbolic platform has a **much smaller face**, essentially simple eyes/brows/nose and a few body color masses. `NUCLEAR` frame 12,174, at 202.90 s: a macro insect has considerably more internal biological parts, while its stage remains broad lavender.
- **Counterexample to reject:** A globally fixed human head ratio or universal “three facial details” limit. A scientific organ seen in macro can require many explanatory marks; a person seen tiny cannot support the same marks as a close actor.
- **Transferable decision:** First write `semantic_role` (`ACTING_CUE`, `SCALE_REFERENCE`, `BIOLOGICAL_SUBJECT`, etc.), `final_pixel_bbox`, and `visible_view`. For a small *supporting* human, merge hair into one outer mass plus 0–2 local lobes, keep only marks large enough to register after actual delivery downscale, and treat eyes as bounded dark/color locations rather than rendered eyes. For a close *acting* human, allocate separate opaque sclera, pupil, brow, nose, mouth and relevant cheek/ear region only when the expression demands them. For scientific macro, allocate material-specific anatomy. Construct hands by actual grip/contact topology, not free limb circles.

### Q2. Is “beautiful detail everywhere” the cause of the graphic richness?

- **Source observed:** `MEMORIES` frame 3,825, at 63.75 s: a dense field of tiny bright terminals traces connected branching stalks, with a handful of contiguous highlighted chains amidst low-luminance purple repetition. `AI` frame 39,233, at 653.88 s: one robot/agent silhouette recurs in projected rows, decreasing with depth, while the blue-green marks are parent-owned head/face highlights, not independent confetti. `AI` frame 21,328, at 355.47 s: explanatory array reduces to only blue disks, one glowing column and a nearly empty cyan stage.
- **Counterexample to reject:** Adding a different decorative object for each patch of empty background, or treating source complexity as a global instruction to fill every blank.
- **Transferable decision:** State the *one parent-owned generator* responsible for repeated shapes: path network, perspective grid, array, architectural wall or biological surface. Record its local coordinate transform, parent mask, scale/spacing function, occlusion and causal subset that changes. A field can carry thousands of marks only if they are generated by a few connected structures that can be transformed coherently. An abstract relationship can legitimately be four rows of circles with almost no decor when number/connection is the proof.

### Q3. Is an abstract setting inherently a neon 3D room?

- **Source observed:** `AI` frame 21,328 is an almost-flat high-cyan information array. `AI` frame 34,051 has one flat projected platform, a tiny actor and a large dark-purple field. `AI` frame 39,233 uses converging repeated 2D agent layers and a distant luminous target. The difference comes from **what is represented** (elements, scale/perception, population), not a mandatory neon-room aesthetic.
- **Counterexample to reject:** Generic isometric glowing buildings, floating unrelated squares, or a hand-wavy “future data world” prompt.
- **Transferable decision:** First document what screen position, shape, repetition, brightness and depth *mean* in the new concept. Choose `SIMPLE_RELATIONAL_PLANE`, `SYMBOLIC_ACTOR_STAGE`, `PROJECTED_POPULATION_FIELD`, `CONNECTED_BIOLOGICAL_FIELD`, or another proven medium class according to viewer inference. Specify coordinate map, graph nodes/edges and before/after causal state. Only then assign material planes and effects.

### Q4. Is every source scene always a close-up?

- **Source observed:** `MEMORIES` frame 10,101 uses a large human close acting crop; `AI` frame 34,051 uses a small actor in broad symbolic negative space; `AI` frame 39,233 uses a wide field because **population/depth** is itself the explanation. `NUCLEAR` frame 12,174 makes the macro organism large to show its anatomy.
- **Counterexample to reject:** A universal close-up camera rule, and equally a universal wide-beautiful-world rule.
- **Transferable decision:** Specify the `critical_inference` and the two things that must fit simultaneously. Enforce large crops for finger action, face acting and biological mechanisms; permit wide fields where network, population, scale or spatial relationship is the factual proof. A wide shot still needs a guided focal path and a parent-based animation capability. Never construct a detailed distant panorama solely for spectacle.

### Q5. Does the character get realistic color mixing to look polished?

- **Source observed:** `MEMORIES` frame 10,101 uses discrete orange face, dark-orange cheek, purple hair with a separate darker attached lobe, blue and violet torso/sleeve planes, and a plain cyan support. `AI` frame 34,051 uses broad purple top and green trouser masses, with little fabric information. `SOLAR` frame 4,897 uses attached helmet and suit panels; their additional detail belongs to spacesuit *construction*, not human hair or skin textures.
- **Counterexample to reject:** Painterly lighting on all skin/clothes, individual hair strands, textured fabric, default outlines and physically-based 3D shading.
- **Transferable decision:** Name the base fill per actual material part and 0–3 attached secondary color islands that communicate part turn, overlap or relevant optical material. All subregions move with their parent. Hide behind views where occluded. Do not ask the model for “rich shading”; supply exact owned regions. Extra marks on a scientific device are allowed when they operate a mechanism; they do not migrate to a casual human's jacket.

### Q6. Is the palette one brand-standard RGB set?

- **Source observed:** `MEMORIES` frame 10,101 is mostly bright cyan/purple/orange. `AI` frame 34,051 mostly dark purple/violet with small bright subject and projected platform. `AI` frame 21,328 is cyan with blue nodes. `MEMORIES` frame 3,825 has very dark purple with colorful high-frequency marks. Earlier native `AI` 444 shows a light cyan information environment; `BRAIN` 157 a lemon-orange room.
- **Counterexample to reject:** One exact list of Kurzgesagt HEX colors applied uniformly to every scene.
- **Transferable decision:** Allocate per-scene color **roles** (`substrate`, `focal body`, `causal active`, `inactive repeat`, `local optic`, `quiet support`). Reuse a character's *material identity* between views, but adapt supporting region's luminosity/contrast when concept changes. Record explicit local source examples only as witnesses of the breadth, never copy their compositions or hardcode the measured colors.

### Q7. What is transferable from highly detailed structures?

- **Source observed:** `MEMORIES` frame 3,825 contains thousands of colorful connection terminals attached to one recurring branching network. `AI` frame 39,233 has near/far scale recession of one repeated agent, with each agent structurally identical. Neither is a set of independent illustrated collectibles.
- **Counterexample to reject:** Generating a giant flattened intricate image and later moving the camera, while pretending the components can act or meaningfully change.
- **Transferable decision:** Define a generator `G(parent_graph, local_coordinates, material_regions, depth_map, state)` and its independently changeable state before producing an image. Render a *master* + clean underlayers + T1 components that must transform + T2 repeating generator mask where scene demands it. If the only planned motion is one pan across a detailed still, question the explanatory idea upstream.

### Q8. Can a 12-frame source pair prove an animation mechanism?

- **Source observed:** the paired selected native witness images 12 frames apart sometimes show a tiny icon/glow update, sometimes an abrupt visual composition change; a static pair cannot identify layer stacking or camera/transition operation reliably. The source videos show multiple different projection and attention conventions, not one continuous-zoom law.
- **Counterexample to reject:** Calling the mere existence of frame-to-frame pixel differences a full recovered After Effects rig, or claiming 60 fps motion from unexamined stills.
- **Transferable decision:** For a *new animation request*, separately specify exact moving semantic entities, visible before/after state, frame-level event timing, continuity of identity, camera footprint/overscan and actual intermediate drawings. A flat illustration skill can establish what to draw; it does not independently certify the finished camera motion or character acting.

## Provider-visible rule priority (first-pass repair)

The top portion of every output image request must prioritize, in order: (1) **new scene truth and necessary viewer proof**, (2) **single frame crop and focal size**, (3) **each subject's connected silhouette and contact**, (4) **color/material plane ownership**, (5) **support/negative-space budget**, (6) **exact attached, dissimilar STYLE-ONLY source-witness roles**, (7) **what is forbidden from the model's generic illustration prior**. The remaining methods support these commitments. Put the condition next to each rule, not in a distant appendix.

Never claim a written prompt is proven by a passing compiler. `COMPILED_WITH_IMAGES_NOT_SUBMITTED`, `FIRST_PASS_OUTPUT_REVIEWED`, `REPAIRED_OUTPUT_REVIEWED`, and `BLIND_FRESH_CHAT_TESTED` are distinct evidence stages.
