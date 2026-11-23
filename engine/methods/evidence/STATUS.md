# Stage 1 method status (computed 2026-11-21)

**Stage 1 complete: NO** — 9/80 IMPLEMENTED (both levels, no gaps); mechanical PROVED 77/80; mechanical MISSING 1; open source-knowledge gaps 107.

| F | purpose | mechanical | artistic | status | open gaps |
|---|---|---|---|---|---|
| F01 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | step 4 'subpart contours follow the gesture' is enforced only for limbs (body.mjs); not for facade/scale/leaf subparts; 1/10-size comparison against the FIRST intended whole form is not automated (F58 read tests voids/gaps only) |
| F02 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | line-art exception inside an illustrated medium (paper montage) has no producer; glass cause routed to optic but not cross-validated |
| F03 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | thumbnail whole-frame contrast check not computed on a rendered frame; situation table covers 4 of the source's reference situations |
| F04 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | atmospheric light (whiteout/flare preserving anatomy) only as global_exposure; no depth-haze producer |
| F05 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | accessory contact (glasses/ear-piece/hood) has no producer; pose coupling: neck-to-torso entry point not constructed; view-dependent skull/jaw contours must be authored per view; no source-derived reprojection (source itself flags turnaround grammar as RESEARCH_REQUIRED); nose/cheek forms are view-independent wedges/authored patches; jaw/cheek PLANE construction (material planes on the face) not driven by head turn |
| F06 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | clipboard/irregular-prop grips and computer-input variants beyond key_press; contact-aware ground marks (step 6); foot construction (only leg end + contact point) |
| F07 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | mascot face-state design rules; macro compound-eye facet / wing venation producers; anatomy correctness requires subject research (cannot be encoded generically) |
| F08 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | parcel/walkway/green-gap layout generator; doors tied to paths |
| F09 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | ring_chamber (nested receding walls, radial segments) producer; propulsion chain (nozzle, flame tongues, exhaust masses) producer; screen inset with masked content |
| F10 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | room shell/zones producer; framed complete inner scene via optic is available but not tied into room construction; art-density by function in rooms |
| F11 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | sky/far-hill strata producer; fence/road mid-world props |
| F12 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | screen-space label separation (F75 exists but not bound); local halo on activated geometry |
| F13 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | galaxy (core + broken arms + attached dots) producer; portal nested irregular contours |
| F14 | CONSTRUCTION | PROVED | ENCODED | IMPLEMENTED | — |
| F15 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | occlusion tracking across tracks; binding to engine/runtime/nu.js tracks (Stage 4 integration point, not yet wired) |
| F16 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | wedge-ray/whiteout/clipped-panel transition asset producers beyond effects.volumetric_source/global_exposure |
| F17 | EVIDENCE | UNPROVED | PURPOSE_PARTIAL | INCOMPLETE | no proof run (requires real renders — Stage 2+) |
| F18 | EVIDENCE | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F19 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | audio-time route (beat timecodes) — owned by GPT direction + existing plan.mjs; not re-implemented here |
| F20 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | label-deletion check of the hierarchy |
| F21 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | non-elliptical designed apertures; translucent second alpha mask; refraction/compression inside M_in |
| F22 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | staggered sunrise schedule; lamp cone producer (trapezoid under lamp head) |
| F23 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | symbol-attachment pass; optical focus pass (depth blur); screen-space grain |
| F24 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | unit role size/contrast table (background vs foreground exemplar); honest count encoding check |
| F25 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | carrier trajectories over time (animated E→R paths) |
| F26 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | river (continuous banked path) producer; forest cluster contours by terrain |
| F27 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | axes rendering with units |
| F28 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | period-specific silhouette knowledge is subject research, not encoded |
| F29 | CONSTRUCTION | UNPROVED | NOT_ENCODED | INCOMPLETE | no proof run yet; ghost-state tinting for time paths |
| F30 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | view keys require authored per-view designs (no automatic reprojection) |
| F31 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | smear/trail derived from pose path; binding to nu.js runtime |
| F32 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | particle classes with origin/trajectory/dissipation; colour bounce onto receivers |
| F33 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | budgets not yet consumed automatically by tree/opening generators (manual pass-through) |
| F34 | DIRECTION | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F35 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | causal_graph_expand op specifics |
| F36 | PROVIDER | PROVED | PURPOSE_PARTIAL | INCOMPLETE | router that computes the applicable set from beats (uses caller-supplied list) |
| F37 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | spec → producer dispatch (world builder) |
| F38 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | layered-illustration (A) depth collections; axial vanishing-point interior (C) producer |
| F39 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | ground/water mask + shore path; foreground occluder masks; aquatic exception producers |
| F40 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | eco-tech neighbourhood/link producer; depth-dependent subdetail wired to density budgets |
| F41 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | scale hierarchy (tissue/cell/mechanism/molecule) selector |
| F42 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | platform cells attached to plane |
| F43 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | EXPLODED_INTERFACE, BUILT_DATA_CORRIDOR, DASHBOARD_OVER_WORLD producers |
| F44 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | interior object between far/near faces; tube entry with crossing mask |
| F45 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | gate/corridor depth construction (step 5); server rack repeats with floor reflection |
| F46 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | receiving-mask (light received by neighbours) |
| F47 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | tier-erase pass test on rendered frames |
| F48 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | curved-bulb deformation of the interior after depth |
| F49 | PROVIDER | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F50 | EVIDENCE | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F51 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | per-shot role identity across multiple shots |
| F52 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | hand/hair role classification (only eye structures classified) |
| F53 | DIRECTION | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F54 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | — |
| F55 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | canonical coordinate identity across a camera transform (see F78) |
| F56 | PROVIDER | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F57 | DIRECTION | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
| F58 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | distant-repetition derivation from master silhouette (collapse interior marks) |
| F59 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | hidden-part clean underpaint (F79 handles at layer level) |
| F60 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | MACRO_CUTAWAY / OPTICAL_CONTAINED specific producers |
| F61 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | 160×90 rendered-thumbnail test |
| F62 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | OPTICAL_RIM/EMISSIVE_EDGE via optic/effects only |
| F63 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | depth-separated optical blur; grain attached to a justified material |
| F64 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | budgets are returned but not yet enforced inside body/hand producers (face enforces via eye role) |
| F65 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | expression sheets (canonical state family for faces) not yet built over constructHead |
| F66 | CONSTRUCTION | PROVED | PARTIAL | INCOMPLETE | hard-shell gear regions overlapping costume; seated support |
| F67 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | alpha gap check per state; 60fps compositor score |
| F68 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | state transitions of housing/controls |
| F69 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | substrate polygons (land/water/sky) producer |
| F70 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | — |
| F71 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | flood-fill connectedness test for CONTINUOUS_BAND on rendered pixels |
| F72 | CONSTRUCTION | MISSING | NOT_ENCODED | INCOMPLETE | NO PRODUCER: specimen/lens/occluder/background-field coordinate systems |
| F73 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | celestial body/terminator producer |
| F74 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | focus baton between worlds |
| F75 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | glyph rendering (text assets are GPT-supplied per source) |
| F76 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | active_subset |
| F77 | DIRECTION | PROVED | PURPOSE_PARTIAL | INCOMPLETE | moving-part underpaint requirement link to F79 |
| F78 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | overscan computation; seam test on rendered middle frame |
| F79 | CONSTRUCTION | PROVED | NOT_ENCODED | INCOMPLETE | — |
| F80 | PROVIDER | PROVED | PURPOSE_ENCODED | IMPLEMENTED | — |
