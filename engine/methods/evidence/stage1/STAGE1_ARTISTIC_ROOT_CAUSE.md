# Stage 1 — artistic root cause (hydrologist specimen)

**Status: Stage 1 artwork is NOT artistically qualified.** All hydrologist images, both first pass and repairs, are diagnostic evidence only.

Evidence files are in `engine/methods/evidence/stage1/`:
- renders: `FIRST_PASS/`, `AFTER_REPAIR/`;
- measurements: `STYLE_MEASUREMENTS.json`, `CONTOUR_QUALITY.jsonl`;
- per-render producer read traces: `*_trace.json`.

## 1. Verified root causes (earliest systemic failure first)

| # | Stage | Root cause | Class | Evidence |
|---|---|---|---|---|
| R1 | A→B | **The skill gives conditional structure, not a shape or colour vocabulary, and the implementation had no source-measured visual style model.** Every distinctive shape and colour value was a Claude-typed constant, authored blind (coordinates written before any pixels were seen). | PROVEN for colour, LIKELY for shape | Witness pixels: mean chroma 0.085–0.125, 15–40% of area above chroma 0.12, 9–21 colours each over 2% of area. Our first pass: chroma 0.05, **0%** above 0.12, 4 colours. Sparse-world witnesses have a *saturated* substrate (chroma 0.10); ours was 0.035. No code consumed any witness pixel statistic. |
| R2 | C | **The contour compiler injected wobble.** At smooth joints it averaged chord tangents, then *translated* both handles by `amount·length`, so designed convex/concave spans got non-convex control polygons. | PROVEN | 40/122 designed non-S spans (32.8%) had curvature reversals. After the fix: 0/122. The same design re-rendered changes 1,108 silhouette px (`contour_fix_silhouette_diff.png`). |
| R3 | B | **No producer derives *which* material planes a part needs.** `surfaces.patchByCause` builds a plane only when the scene lists it, so most masses stay single flat fills and the figure reads unlit and unbuilt. | PROVEN (code) | The hydrologist render emits 3 garment planes and 2 rims for 20+ masses (`specimen1_render.mjs`). The witnesses show shade planes on every clothed mass. |
| R4 | C | **Features in `faceview` still use fixed formulas:** the 6-point brow polygon and the 5-point mouth up/low polylines are the same topology for every identity. | PROVEN (code) | `faceview.mjs` brow and mouth blocks. Only the skull, hair, planes, eyes and nose are identity-authored. |
| R5 | C/B | **The hand is drawn as same-fill ribbons with no crease or separation planes, over a blob palm.** Closure around the prop is solved correctly, but it is invisible at ~45 px. | PROVEN | Trace of `handN`: layers are correct (palm 59.8 < handle 60 < near fingers 60.2 < thumb 60.25) and every digit has the palm's fill; pixels read as a mitten plus a knob. |
| R6 | B | **Some garment-architecture and prop-attachment errors were authoring mistakes** (sleeve cap above the shoulder line, floating indicator box). These are local design errors, not systemic ones. | PROVEN | First pass vs `AFTER_REPAIR/specimen1_r1/r2`. |
| R7 | D | **The renderer is not the bottleneck** for silhouette, face or hand quality. It reproduces the geometry faithfully: cubic Béziers at 16 segments each, even-odd compound paths, clipping, opacity, 3×3 AA, 1080p. It lacks gradients, blur and soft masks, which limits only the source-permitted bounded optics (glows). | LIKELY | Every visible defect above traces to the input geometry or palette. Changing the compiler or palette changes the pixels exactly as predicted. |

**Dependency order:** R1 (no source style model) → R3 (no plane planner) + R6 (blind authoring) → R2/R4/R5 (compilers) → pixels. R7 is not on the critical path.

## 2. Four traced examples
| Example | Intended (source) | Actual chain | Earliest incorrect stage | Correction | Generalises? |
|---|---|---|---|---|---|
| Body silhouette / limbs | F01 purpose-specific contour; F06/F66 pose-specific garment, folds caused by the bend | `DECISION_PLANS/hydrologist.mjs` bone-local landmarks (typed) → `figure.poseFigure` → `contour.buildRing` → regions | B (blind landmark authoring) **and** C (compiler wobble) | C fixed: tangent-rotation spans with guaranteed convex control polygons. B: candidate loop with pixel review exists; shape statistics from witnesses not yet measured | Yes: compiler shared by all subjects |
| Head / jaw / eyes / hair | F05 per-view skull and hair masses, near/far eyes; F65 mode by role/px; F52 budget | `hydrologist_face.mjs` per-view contours → `faceview.constructFaceView` → regions | C for brow/mouth formulas; B for the authored per-view skull | View registration and eye mode work (pixels). Brow/mouth formulas still open (R4) | Yes |
| Material / colour / light | F03/F51/F61 conditional roles; F46/F62 planes from surface turning and light | typed chroma → `solvePalette` (accepted anything) → flat fills; planes only where scene-listed | A/B: no witness-measured targets (R1); B: no plane planner (R3) | **Fixed:** `palette.designPalette` takes chroma tiers and substrate value from the measured witness (hash-checked); typed chroma is refused. **Fixed:** `assertAdjacencyContrast` derives touching pairs from geometry; it caught the casing/ground merge (L 1.01). Open: plane planner | Yes |
| Hand grip | F06 task-specific hand; F59 near fingers front, far behind; F66 prop-specific closure | `hydrologist_hand.mjs` → `grip.constructGrip` (seated on the handle) → ribbons | C (no crease/separation planes, ribbon digits); B (generic hand proportions) | Seat-on-prop and closure are fixed (prop radius changes the wrap). Open: designed finger silhouettes and planes at gesture scale | Yes |

## 3. Implementation changes made (all generic, none specific to the hydrologist)
- `contour.mjs buildRing`: span character → rotated end tangents; G1 smooth joints clamped to the admissible side; convex-polygon guarantee; handle-ordering guarantee.
- `palette.mjs designPalette`: source-measured chroma by tier and witness substrate value; unlike witness recorded; typed chroma refused.
- `palette.mjs assertAdjacencyContrast`: actual touching-pair discrimination (value / hue / owned edge); exemptions need a recorded reason.
- `proofs/measure_witnesses.py` → `STYLE_MEASUREMENTS.json`: witness pixel statistics as SOURCE_OBSERVATION.
- `proofs/contour_quality.mjs` → `CONTOUR_QUALITY.jsonl`: unintended-inflection metric.
- Earlier this gate: `grip` seats the hand on the prop cross-section; the face is view-registered; per-view planes are toned by normal against the light.

## 4. Remaining architectural limitations
1. **Authoring bottleneck (major).** Original contours are still authored by Claude as coordinates. The compiler no longer degrades them, but their quality depends on an iterative visual design loop per mass (render → inspect → revise), not on the 80 rules. Shape statistics from the witnesses (corner frequency, taper ratios, head:body ratio by family) are not yet measured, because that needs segmenting the witness silhouettes.
2. **No plane planner (R3).** Material planes must be derived per owner from its geometry and the light; that is not yet implemented.
3. **Brow/mouth templates (R4) and hand rendering (R5)** are still generic.
4. **Renderer** has no gradients or blur. This matters only for the permitted bounded optics.
5. If pure-code authoring cannot reach the approved whole look after items 1–3, the alternative is the spec §6 **hybrid image-master route** (registered, segmented original art). That is a proposal only and has **not** been started.

## 5. Honest artistic-qualification status
- **Not qualified.**
- The latest render (`AFTER_REPAIR/specimen1_r4_after.png`) still has a weak silhouette finish, a flat unbuilt figure, a mitten hand, a crude mouth/brow, an empty composition and a helmet-like hair mass.
- Gates C/L3 and L4 have not passed.

## 6. Progress after the report (same session)
- **R3 FIXED (producer level).** `surfaces.planPlanes` derives each owner's shade plane from its own contour: runs whose outward normals face away from the light, with depth equal to a material fraction of the local thickness measured by ray casting. Pixels: `AFTER_REPAIR/planner_before_after.png` (vest, sleeve, trousers and casing gain turn planes; same design).
- **R4 FIXED.** The brow and the mouth (per topology) are now identity-authored shapes, required by `faceview` (DESIGN_UNRESOLVED otherwise), and expressions deform them. Pixels: `AFTER_REPAIR/face_states_r4_crop.png`.
- **R5 capability FIXED (r7).** `grip` gains a SIDE-ON `power_capsule` mode, and the reel is re-staged in three-quarter view (F55). Pixels: `AFTER_REPAIR/specimen1_r7_crop_face_hand.png`, where the fingers visibly wrap the handle. Remaining weakness: palm/forearm proportions (stage-B hand design). The earlier state is kept below:
- **R5 PARTIAL (r6).**
  - Done: the authored knuckle-crease plane and owned digit creases are emitted.
  - **Still a missing capability:** `grip.mjs` only models an END-ON cylinder grip, so the crank handle's end-cap shows inside the fist and the grasp reads as a knob (`AFTER_REPAIR/specimen1_r6_crop_face_hand.png`). Needed: (1) a side-on capsule grip mode (bands across the handle, near over / palm behind); (2) a staging decision for the reel/handle orientation (F55).
- **Palette tier refinement needed.** A cool support hue at the witness median chroma (the casing) reads too saturated against the warm field; tiers need hue-dependent chroma limits.

## 7. Specimen 2 (tide-mill world): additional verified causes and fixes
| # | Stage | Finding | Class | Fix | Evidence |
|---|---|---|---|---|---|
| R8 | C (system) | No check that the parts proving the causal claim are visible after the painter's order (F57/F59). First pass: wallower 0%, shaft 0%, hopper 42% in frame. | PROVEN | `direction.assertCausalVisibility` (generic, fail-closed), plus the redesign: open hurst frame, two beams flanking the shaft, longer axle, re-framed projection | `FIRST_PASS/specimen2_after.png` vs `AFTER_REPAIR/specimen2_r3_after.png`; visibility report in the run log |
| R9 | C (producer) | `solvePalette` **discarded the authored L of every support-slot role** and used one situation value instead, collapsing floor/platform/stone/hopper/sack/chute onto one value. This was a major cause of flat, merging colour in BOTH specimens. | PROVEN (changing L left the contrast at 1.13 exactly; reading the code confirmed it) | Authored L is consumed for every non-substrate slot | `AFTER_REPAIR/specimen2_r3_after.png`: the floor separates from the walls and the timber |
| R10 | C (producer) | The paddle wheel reused the gear-tooth outline, so it read as a gear | PROVEN (pixels) | `gears.gearTrain` `paddle_wheel` style: rim + radial paddles + spokes | r1 vs first pass |

**Mechanism truth is derived, not placed.** `gears.gearTrain` computes the pitch radius (module × teeth / 2), the meshing centres and the rotation phases, including the crown-to-horizontal pit wheel → wallower. The shafts are bars between the producer's derived gear centres. The motion passage changes only the driver angle; every other rotation follows.

**Remaining weaknesses (Specimen 2):**
- large empty floor and a missing left-wall face (composition and density planning not driven by F47/F53 budgets);
- crude wedge light rays (no occlusion by beams);
- conflicting hue decisions (the solver pushed the water to green to separate it from a blue floor);
- flat finish with no material texture.

Not artistically qualified.
