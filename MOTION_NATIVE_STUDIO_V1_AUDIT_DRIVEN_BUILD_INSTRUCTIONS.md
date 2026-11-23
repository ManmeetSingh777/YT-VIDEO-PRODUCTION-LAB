# Motion-Native Studio V1: audit-driven implementation instruction

**Date:** 21 November 2026  
**Prepared from:** `STYLE_CODE_BRIDGE_AUDIT_v01.zip` (87 entries, source and rendered PNG evidence), `MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md`, current F01–F80 construction skill.  
**Target project:** `E:\MOTION_NATIVE_STUDIO_V1`  
**Authority:** Read the complete implementation specification first. This document supplies concrete file-level corrections and an execution instruction. It does not claim the implementation is complete.

## A. Verified diagnosis

1. The neutrino-derived `engine/runtime/nu.js` exists unchanged, and `engine/runtime/mn.js` adds useful IK, FK, attach, walk, morph, light and camera evaluation. These are genuine runtime capabilities. Do **not** scrap them.
2. `engine/lib/rig.mjs` accepts rich manually designed SVG paths and named parts, but it does not design the parts. It can assemble an authored rig; it cannot invent an original subject's visual identity from F01–F80 rules.
3. `engine/lib/style.mjs` has actual reusable operators, but they are **insufficient as complete material or character construction**: `surf()` makes a single shifted/clipped fill-plane family; `handPath()` makes a generic parametric hand silhouette; `oblique()` projects one class of boxes; `repeat()` places authored elements within a polygon. None is a whole-look style compiler. Preserve them as optional lower-level tools; prohibit them as universal defaults.
4. `engine/lib/geom.mjs` supports explicit SVG path processing and morphing, but `morphable()` geometrically resamples arbitrary outlines rather than preserving named semantic landmarks. Use it only where topology/landmark correspondence is visually demonstrated; otherwise author registered view/pose drawings.
5. `style/build_catalog.mjs` manually assigns `F01`–`F80` to function names. There is **no conditional method selection**; the catalog's mapping does not determine original geometry.
6. `cast/keeper.mjs` contains precise *hand-typed coordinates* for one illustration and assigns its `construction` rule metadata **after** defining the shapes. The rule text was not the producing input. Replacing the coordinates with different fixed generic ratios would repeat the failure.
7. `engine/tools/build.mjs` computes `implemented` when a named exported function exists and an element ID appears in generated HTML. It does not prove call-site causality, artwork quality or method transfer. `production/CONSTRUCTION_LEDGER.json` has **25 entries: 23 `implemented`, 2 `not_applicable`, 0 linked pixel evidence**. This status must be retired or renamed `SYMBOL_AND_ID_PRESENT`.
8. `engine/tools/plan.mjs` and `engine/lib/scene.mjs` enforce that event IDs are referenced, but not that events create the required meaningful pixels. Keep existing timing integration; add semantic action/effect evidence.
9. `engine/tools/loop.mjs` asks genuinely useful high-impact questions and records before/after evidence. Q01–Q03 visibly improved selected defects, but the repair did not change the *initial design architecture*. `learning/REPAIR_MEMORY.json` contains two demonstrated family lessons; `production/receipts/build.json` records `applied_lessons: []` in both scenes. Q03 has no lesson in the supplied studio memory. No subsequent new-identity first pass has consumed a lesson.
10. `qaCSS` provides silhouette/flat/nofx styles, but those modes were not rendered in the ZIP. Normal-speed video and audio were excluded from the audit: do not claim to have independently validated full animation/audio based on these stills.

### Evidence qualifications

- `qa/snap1/` is *faulty shared-element-ID evidence*, not the correct starting visual baseline; use `qa/draft2_sheet.png` and `qa/after_Q3_sheet.png` for visible before/after comparisons.
- Q02's after image still shows only a relatively simple manually designed figure and prop. A mechanically successful repair is not whole-look approval.
- Native reference assets, original F01–F80 archive, narration and MP4s were excluded. Source references must be read locally in Claude's project and output quality must be independently rendered there.

## B. Exact implementation targets

| Module | Instruction | Evidence required |
|---|---|---|
| `engine/runtime/nu.js` | Freeze as the preserved known-good runtime, save fingerprint and regression test. | Original neutrino re-render remains equivalent within encoding difference. |
| `engine/runtime/mn.js` | Preserve existing art motion. Add reachable-target status/maximum deviation, actual contact error reporting, semantic view-state constraints, no impossible IK silent clamps; add new authored contour bindings only when required. | Frame-accurate reachable/unreachable and contact-state proofs. |
| `engine/lib/geom.mjs` | Keep explicit Bézier and parsing functions. Add semantic feature landmarks, safe matching of counterpart paths, topology/view changes, region-level geometry and optional mesh/deformation transforms. No universal smoothing that erases designed corners. | Before/after paths preserve named landmarks at extremes. |
| `engine/lib/style.mjs` | Replace one-size-fits-all material implementation with extensible **material-owner-specific patches**: base plane, face planes, occlusion/recess, edge role, designed shade shapes, localized highlights, bounded optics, glow only when applicable, projected detail generators. Keep original helper exports for compatibility. | Actual PNG material-owner/flat/nofx outputs and whole-look review. |
| `engine/lib/rig.mjs` | Consume a *subject-specific* Illustration Construction Document (ICD) to assemble hierarchies, alternate views, pose cels, contour-deformable regions and painted front occluders. Respect identity across views. | An animated original identity's features stay registered across motions. |
| `engine/lib/scene.mjs` | Pass a typed `ConstructionContext` and recorded upstream authoring decisions to the cast builder; apply matched lessons before calling visual authoring. Preserve narration/event hooks. | Building the same new identity with and without an active lesson changes the proper owned geometry. |
| `style/build_catalog.mjs`, `style/F_METHOD_CATALOG.json` | Keep original F01–F80 source links. Add applicability predicates, unlike-source/counterconditions, precise design outputs, evidence needs, operator bindings and `UNQUALIFIED` labels. A method has no effect unless it controls actual construction. | Generated applicability matrix includes used, rejected, open/unknown and why. |
| **New** `engine/lib/illustration_contract.mjs` (adapt path to actual architecture) | Implement the typed ICD from main specification: per-subject semantic role, silhouette landmarks, parts/joints, regions, materials, depth, views, clip/occlusion, motion requirements, source witness IDs, method→region→function links, falsifiers. | Invalid or descriptive-only ICD cannot report `CODE_BOUND`. |
| **New** `engine/lib/construct.mjs` + optional `engine/lib/materials.mjs`, `engine/lib/views.mjs` | Actually turn **authored design and geometry records** into paths, surfaces, registered views and rig metadata. Preserve original creative path authored for each unfamiliar subject; do not turn the ICD into another fixed prefab. | Generated code/pixels change predictably when an upstream subject-specific design decision changes. |
| `films/*/cast/*.mjs` | Refactor the current keeper to call the new interface as a regression fixture; **do not** use the keeper as the artistic template for the next subject. New film art must follow its own source-grounded ICD and original silhouette. | Two unlike original identities/worlds use distinct original geometry rather than the same defaults. |
| `engine/tools/build.mjs` | Fail closed on missing design, unbound method, absent/unchecked code path, non-applied required lesson or missing proof; emit real provenance from ICD decision to region to executed source symbol to exact render. Do not rewrite old evidence. | Forced removal of an important producing operation changes pixels and correctly invalidates its claim. |
| `engine/tools/loop.mjs` + memory | Preserve 4C+3G+3R+2U question prioritization and witness loop. Upgrade learning to **pre-authoring** lesson retrieval based on applicable conditions. Keep LOCAL vs CONDITIONAL_FAMILY scope, source contrasts and regression boundaries. | A repaired rule *changes the first construction* of a second relevant identity; unrelated identities remain unchanged. |
| `engine/tools/plan.mjs` | Keep narration-led timing. Add executable motion mechanism/state requirements to per-shot packet: cause → visible physical process → consequence, attention handoff, alternate pose/material needs, transition OUT/MIDDLE/IN. | One necessary narrated event cannot be satisfied by `ctx.E()` usage alone or a static hold. |
| **New** visual review runner / studio stages | Render at frame-accurate native crop, 160×90, silhouette, flat, nofx, owner-material, poses, transition strips and normal-speed moving proof, automatically reviewing high-impact failures and triggering repair/rebuild. | Output PNGs and watched MP4 with honest specific review, not metadata-only PASS. |
| **Optional** `engine/lib/raster.mjs` | Add only when justified for a material/detail family requiring it, with layer ownership and motion registration. F19 permits vector, raster and hybrid; code-only is a trial, not an aesthetic mandate. | Quality comparison against vector method, editable source and registered motion. |

## C. Required end-to-end construction order

1. **Immutable creative inputs:** GPT-owned script, facts, narrated experience, shot causes, moving metaphors, camera and transition intentions. For the current foundation smoke fixture, use its existing direction; for the next real film, wait for the new GPT-authored episode. Do not silently invent direction.
2. **Reference-conditioned routing:** choose applicable F-method families from F01–F80 with source-native confirming and unlike/counterexample witnesses, based on subject, viewer proof, crop and medium; prioritize high-impact unknowns. Verify source files exist. No universal studio palette or head shape.
3. **Visual authorship before code:** write each original subject's actual silhouette design, contour landmarks, plane hierarchy, geometry regions, materials, projection and alternate views as an ICD. The model authors original paths in code-friendly form. An adjective or function name is not a drawing.
4. **Artistic preview:** produce original full-size designed hero frame(s) and compare at normal and thumbnail display sizes **before** finalizing rigs. If the master is ugly, rebuild the master rather than polishing rig/animation bugs.
5. **Construction and rig:** compile approved regions to actual SVG path/render operations, build parent-owned shading, authored hands/faces/alternate views, connections, constraints, masks, environment parts and contact sockets. Bind to preserved neutrino/MN motion.
6. **Motion design:** for each event create observable source action, process and consequence; scene function of time; expressive rig state changes, camera attention and physically meaningful transitions. Sound synced to actual events when available.
7. **View actual pixels and movement:** after each meaningful construction, render native/thumbnail/silhouette/material/view/pose proofs and normal-speed motion. Repair producing operation or rebuild master; preserve causally useful lessons.
8. **Transfer:** new relevant first-pass construction *applies* demonstrated conditional lessons before its original geometry is made. Run comparison on a genuinely unlike second subject; do not certify from the original repaired keeper.
9. **Promote only observed success:** keep PROPOSED, CODE_BOUND, PIXELS_INSPECTED, MOTION_PROVED, ARTISTICALLY_APPROVED and TRANSFER_TESTED distinct. A bad illustration may technically pass frame tests yet remain unapproved.

## D. Implementation sequence and stopping rules

**Implement continuously in a branch/worktree**, retaining the original project, scenes and evidence. No giant speculative rewrite and no ongoing repair of keeper's current primitive art as if it were final production.

**Phase 1 — Honest evidence and new authoring input:** implement typed ICD, conditional method routing, provenance and structural refusals. Deliver real example ICD with nonempty authored paths and method binding; forced ablation fails properly.

**Phase 2 — Illustrated art construction:** author at least one *original subject relevant to a future explainer* and one unlike world/object; compile purpose-designed silhouette, material owners, projected parts, view states, and native/thumbnail proof. This is production-grade artwork creation, not a checker-only demo. Reject templates that simply substitute the keeper's ratios.

**Phase 3 — Real motion:** bind the approved designs to preserved rig/runtime. Demonstrate a continuous motivated change of state, contact/hand interaction when relevant, camera/transition and audio timing; render normal-speed preview. Do not claim art completion until actual pixels satisfy the target look.

**Phase 4 — First complete real film:** only after the GPT-owned new script and direction exist, execute the proven neutrino sequence: five genuine full-resolution hero frames → full narrated animatic → moving proof from actual film → whole 120-second editable 60-fps production → repair and export. Reuse the runtime, not the neutrino topic, actors or motion clichés.

**Blockers:** No native source witnesses, approved intended experience, needed artwork/view, narration or render capability means produce an exact missing dependency. Do not fabricate satisfaction, replace with a slide show, or declare full film done.

## E. Copy-ready instruction to Claude Code

> You are in `E:\MOTION_NATIVE_STUDIO_V1`. The independent source audit has been reviewed. Resume implementation now.
>
> Read the COMPLETE `MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md` and `MOTION_NATIVE_STUDIO_V1_AUDIT_DRIVEN_BUILD_INSTRUCTIONS.md` from this project (locate them by filename). Follow the current installed F01–F80 source materials under `inputs/` or `reference/` and the approved Experience Director V1. Do not treat the short method catalog as its source of truth.
>
> The audit established: `engine/runtime/nu.js` is the preserved successful motion foundation; `engine/runtime/mn.js` and `engine/lib/rig.mjs` have usable motion and rig mechanisms; `engine/lib/style.mjs` is a limited helper library, not a style author; `cast/keeper.mjs` manually specifies generic subject shapes then retrospectively cites F-methods; `style/build_catalog.mjs` has no applicability router; `engine/tools/build.mjs` labels mere symbol+ID presence as `implemented`; `engine/tools/loop.mjs` preserves questions but its lessons have never altered a subsequent first-pass construction. `qa/snap1/` is a faulty shared-ID snapshot; use `qa/draft2_sheet.png` and `qa/after_Q3_sheet.png` for true comparisons.
>
> **Implement the missing visual-authorship → drawable geometric construction → execution bridge.** Preserve the existing neutrino and MN animation runtime. Make a typed, subject-specific Illustration Construction Document containing original silhouette/landmark paths, parts/parents/joints, material-owned regions and shading operations, views, camera/rig registration, applicable source-witnessed F-methods, counterconditions and exact producing-code bindings. Build conditional method routing; select methods from what a novel subject actually needs, not the existence of functions. Each source-grounded method must actively influence authored region geometry/material/view/pose code BEFORE rendering, with demonstrable causal pixel impact. Do not create a generic prefab character system that disguises the same few heads, sleeves, expressions or palettes. Real authored Bézier paths, compound clipped regions, painted material planes, registered drawings and conditional code-generated pixel effects are allowed. Use raster/hybrid only where F19's material choice justifies it.
>
> Fix the current ledger so function-name/element-ID matches cannot be reported as artistic implementation. Implement actual method→design→region→executed-symbol→pixel provenance and meaningful invalidation/ablation. Make repair learning operative BEFORE the next first-pass design; prove a conditional lesson affects a second applicable identity and avoids unrelated contexts. Keep high-impact question emergence, 4C+3G+3R+2U prioritization, native confirmation and genuinely unlike counterexamples; ask discriminating geometric questions whose answers change drawing operations.
>
> Integrate new construction with `engine/lib/geom.mjs`, `engine/lib/rig.mjs`, `engine/runtime/mn.js`, `engine/lib/scene.mjs`, `engine/tools/build.mjs`, `engine/tools/plan.mjs` and `engine/tools/loop.mjs`. Detect physically unreachable joints/contacts rather than silently clamping them and calling motion correct. Preserve valid scene timing, camera and transition motion; ensure main narrated events produce visible causal changes, not static images or opacity-only substitutes. Render native hero art, thumbnail and material checks, actual motion states and normal-speed proof; fix the producing design/code when wrong. Do not count acceptance tests as art quality.
>
> Work in staged, verifiable source edits with a recoverable git checkpoint; do not modify the original preserved neutrino source package or rewrite existing audit evidence. Implement Phases 1–3 of the addendum now and proceed continuously unless genuinely blocked. The foundation keeper is a regression test, not the production art benchmark. Demonstrate the new approach on two genuinely different original subject/world families, with artistically intentional full-resolution hero frames and moving material. Do not call it a reusable qualified system until a second unfamiliar case works. Give me the actual outputs, code, pixel proofs, normal-speed MP4, before/after construction evidence, applied-lessons trace and a concise honest status—not only documents, test counts or a complaint about the current art.
>
> Do not invent the next film's script/direction. Its narration, visual metaphors and experience direction are GPT-owned. When the new pipeline is demonstrated and ready for that creative input, state exactly what schema/files GPT must supply. Do not spend more work on a full two-minute foundation-test movie. Preserve the working animation engine and build the system we can use for the next complete original film.

## F. User action

1. Download this addendum into `E:\MOTION_NATIVE_STUDIO_V1` alongside the already saved main implementation spec; keep the current ZIP audit there unchanged.
2. In the **existing paused Claude Code session**, paste the instruction in Section E (or tell Claude to read Section E verbatim) and send once.
3. Let Claude work through staged implementation and real pixel/motion evidence. Its first result worth assessing is the **original hero artwork and rigged normal-speed action**, not another green test summary.

**No new folder, no new skill download, no reinstall of HyperFrames and no further export are needed before this implementation begins.**
