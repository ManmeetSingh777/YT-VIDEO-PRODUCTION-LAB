# E01 artwork manufacturing record (2026-11-27, consolidated execution)

## Salvage (all returns in E:\TBO_PRIVATE\E01_ART_RETURNS)
- **47 distinct returned images catalogued by hash** (E:\TBO_PRIVATE\E01_ART_SALVAGE\CATALOG.json, CONTACT_SHEET.png):
  - 37 genuine generations: 10 originals, 16 round-1 corrections, 3 Mia stage-1/2 candidates and 8 others;
  - 5 re-uploaded copies (not generations);
  - 5 rejected presentation sheets or dashboards;
  - review evidence.
- **The strongest artistic identity per master was chosen from the pixels**, not by recency:
  - Mia: the director-selected original;
  - LEAD and REGULAR: v1 full anatomy, with the v0 face kept as identity reference;
  - restaurant: v1; award, report and phone: v1; diners A and B: v2; table cluster and queue: v2.
- **All 11 are now valid operator-attested candidates in the outbox.** None is selected or approved.

## Deterministic preparation (engine/art_bridge/art_prepare.mjs; records re-executed to verify)
- **All 11 strongest masters:** alpha 253/254 → 255. The provider stored opaque interiors as semi-transparent; colour is untouched, with no resampling, crop or resize.
  Prepared files and .PREPARATION.json records are in `E:\TBO_PRIVATE\E01_ART_OUTBOX\prepared\`; each inherits its parent's lineage only by exact re-execution.
- **Not regenerated, because they are not art defects:**
  - background figures larger than their ~600 px brief: more native pixels, scaled by the engine;
  - the restaurant's 1 px edge and alpha 253: quantization, fixed deterministically.

## Landmarks and registration
- **Proposed landmarks for 7 masters** (award, report, phone, 4 background assets): geometric points exact from alpha bounds, semantic points as visual estimates; overlay in LANDMARK_PROPOSALS_OVERLAY.png. Mia, LEAD, REGULAR and the restaurant: requested from Artwork GPT (no image generation).
- **Registration dry run (scratch film):**
  - award REGISTERED at scale 0.139 (≈165 px on stage, as directed);
  - Diner A REGISTERED at scale 0.090 (≈70 px, as directed);
  - phone REFUSED (UNREGISTERED_PIVOT: the rear-face LENS socket cannot be measured on the front canonical view). This needs a decision.

## Defect found and fixed
- **Handoff imports refused every dotted asset ID** (ART_ENV01.MASTER, the props, the background assets) as an "unknown handoff". The ID check now allows '.', and still refuses '..' and path separators.

## Handoffs
- **E:\TBO_PRIVATE\E01_ARTWORK_COMPLETE_PRODUCTION_HANDOFF.zip:** the whole phase, with orchestration separate from image content.
  - 4 compact image requests (LEAD, REGULAR, table cluster, queue), 1.2–1.7k characters each, artwork only, presentation sheets explicitly prohibited.
  - 7 masters marked review-only, with no generation.
  - All 304 obligations with routes and dependencies; stage specifications as obligations, not generation calls.
  - One return format, imported by `art_outbox.mjs import-handoff`.
- **E:\TBO_PRIVATE\E01_MASTER_REVIEW\MASTER_REVIEW.html + REVIEW_DECISIONS.template.json:** `node tools/tbo/e01_master_review.mjs apply` writes the reviewed landmarks, registers the masters and creates their signed master-review requests.

## Not yet possible
- **Animation and rendering:** no master is approved or registered in the real film yet. The first family that can move is the award, after the director's review → `apply` → signature → `advance` releases its 4 dependents.

## Master registration round (2026-11-27, evening)
- **Checkpoint E01_ARTWORK_PARTIAL_RETURN.zip:** no image generation; image-bound landmark proposals for 7 masters imported (Mia 30/32, restaurant 7/8, props, diners A/B).
- **Constructed anchors (rule-based, reviewed through the signed master receipt):**
  - Mia cranium_top (522,137): eyes-halfway canon, with the hair apex excluded per amendment 02.
  - Mia pelvis (495,889): on the body axis between the legs. The first construction (595,889) was off-axis and corrected before signing.
  - Restaurant staff_station: withdrawn together with the plate.
- **Phone:** the rear-face LENS/lens_axis are deferred to the registered back-view asset ART_P03.alternate_views (ingest-master `deferred_landmarks`, recorded as not measured).
- **Registered in the real film (REGISTERED_PENDING_REVIEW); all scales equal the directed on-screen size:**
  - Mia 0.617 (174 px head);
  - award 0.139 (≈165 px);
  - report 0.114 (≈144 px);
  - phone 0.043 (≈50 px);
  - Diner A 0.090 and Diner B 0.061 (≈70 px).

  Six master-approval requests are created (SIGNING_GUIDE.md). Signing approves the artwork and its registration together: the bundle binds the registration receipt, including the coordinates.
- **Restaurant v1 failed the geography check:**
  - The plate is drawn from the staff side (till and storage shelves face the camera; staff equipment on the left).
  - The directed SH01 is a public-side three-quarter counter view with the staff side on the right (P3.2 storyboard lines 10, 15).
  - Its request was withdrawn unsigned and routed to artistic correction (image request 04). Furniture is compatible with the table cluster.
- **Award and report contact geometry:** award `bottom` = flat plinth contact edge, `base` = plinth mass centre. Report edge_mia lower-left and edge_lead lower-right, as seen from the page front (P3.2).
- **Diners:** seated rest artwork with world-owned seats. Their support points are validated against the world seat geometry when placed.
- **Next blocker:** the post-art feasibility gate is film-wide ("other rigs of the film are still unmeasured"). It holds 114 dependents even after their own master is approved.

## Production round (2026-11-27, night): signatures, amendment 03, released dependents, consolidated handoff
- **Signatures:** the 7 signed receipts were already imported (nonces replayed); six masters APPROVED (HUMAN): Mia, award, report, phone, Diner A, Diner B. Registrations survived amendment 03 (packet 9d8a7ef5).
- **Latest return (a76e9d60…):** 8 attempts imported as candidates; none resolves its obligations.
  - LEAD faces screen-right and holds the report.
  - REGULAR's phone is raised and drawn in, or a giant blank page appears.
  - Occupancy keeps the raised hand and white sclera; one attempt adds an opaque scene.
  - Queue keeps the white sclera.
- **Released dependents (advance):** 108 jobs exported as sealed plan GPT_ART_PLAN_20261127_fcff8788f0a4 (508 stage requests). Every one is a source-attached art edit (parts, hidden-surface underpaints, expression/pose cels); none can be done deterministically.
- **Blocked:**
  - 12 BLOCKED_COMPILE: the prop designs mark no method decision `applies_to_states` (needs a design decision and re-signature).
  - 1 BLOCKED_RESOLUTION: the report page is 942 px against 2,496 px (needs amendment 04, a vector page).
- **One consolidated Artwork GPT handoff:** E01_CONSOLIDATED_20261127_fcff8788f0a4.zip (`tools/tbo/e01_consolidated_handoff.mjs build`).
  - Section A: five localized master corrections (public-side restaurant, LEAD view turn without mirroring, REGULAR right-arm-only grip, occupancy and queue eyes/hand).
  - Section B: all 108 released jobs.
  - One flat ATTACHMENTS folder (852 hash-identical files), one EXECUTION_PROMPT, one RETURN_MANIFEST.
  - `split` turns the return back into the verified import-handoff and import-plan routes (test CH-1).
- **Motion:** no family is renderable yet. Mia's parts and states, the props' derived jobs and the corrected restaurant plate are prerequisites. 0 frames of the 960-frame Phase 1 qualify.

## Component manufacturing round (2026-11-27, late)
- **New deterministic extraction route:**
  - `art_prepare` mask_bitmap op: selection of existing pixels, content-addressed mask, re-executable (AP-3).
  - `tools/tbo/e01_segment_master.py`: watershed on the master's own edges, plus colour refinement for features painted on skin.
  - `tools/tbo/e01_extract_components.mjs`: lineage inherited from the approved master's sealed candidate; landmarks carried by the exact crop offset; normal ingest-part.
  - Facial overlay slots ride the head joint (`overlaySlotOwner`, OS-1).
- **Registered from approved pixels (REGISTERED_PENDING_REVIEW, 0 px residual):**
  - Mia: torso, upper_r, fore_r, upper_l, fore_l, eyes, brows, cheeks, mouth; plus torso_to_regular, hand_l_open_near, eyes_blink_open, mouth_rest.
  - Diner A/B: body and rest.
  - Mia's parts tile her master exactly: 0 overlap, 0 uncovered visible pixels.
- **Background groups:** occupancy and queue masters registered as they stand. The occupancy root/support were re-measured on the pedestal base.
- **Measurements:**
  - Diner seat-contact surfaces measured, distinct from the internal roots (support points lie 29–30 px inside the body).
  - Award recessed-grip feasibility verified.
- **Prop designs:** `applies_to_states` on F01/F59/F62 (+F75, +F13/F63). The audit was rebound with a delta record. Gate PASS; design re-approval requested.
- **Artwork handoff V2:** 51 images (from 508 stages), 16 deduplicated attachments in 3 upload groups. Only genuinely new pixels:
  - feature-free 540 px head;
  - 13 expression faces and 3 speech/blink faces, from which the engine extracts all eye, brow, cheek and mouth states;
  - 3 upper-body views;
  - torso and arm hidden surfaces;
  - 11 hand grips;
  - 4 diner, 4 group and 6 prop-view edits;
  - restaurant, LEAD and REGULAR corrections.
- **Rendering:** 0 legitimate E01 frames. No derived part is approved yet, the restaurant plate is uncorrected, and LEAD and REGULAR are unapproved. Amendment 04 (vector report) has not been executed yet.

## Construction round (2026-11-28)
- **Reusable mechanisms:** moved into the engine with generic names: `engine/tools/segment_master.py`, `engine/art_bridge/component_extract.mjs`, `engine/tools/measure_seat_contact.py`.
  - Every film-specific input (seeds, colour rules, component→asset maps, landmarks) lives under `films/<film>/segmentation`.
  - Test CE-1 runs on a synthetic figure.
- **Native vector construction** (`engine/art_bridge/vector_construct.mjs`, VC-1):
  - Page and layered-environment specs, rasterized through the controlled Chrome path and re-executed byte-identically.
  - Provenance ENGINE_VECTOR_CONSTRUCTION is accepted in master/part intake only when the ACTIVE packet authorizes the exact spec hash.
  - World planes register without a hinge pivot.
- **Constructed (pending amendment 04):**
  - Report page: 2,539 px page width, native detail ratio 2.38.
  - Exact type layer: Bahnschrift.
  - Public-side restaurant (P3.2 SH01 geography, existing palette) as master plus far/mid/counter/counter_occluder planes.
  - Packet amendment 04 (`ecee2867…`) is imported with its signature request; intake refuses all seven until it is signed.
- **View reconciliation:** the Mia master faces screen-right (lead side, F360).
  - torso_to_regular was withdrawn (unsigned) and torso_to_lead registered instead.
  - hand_l_near, ART_P01.body and ART_P03.body were registered from exact pixels.
  - 20 extracted components in total.
- **Artwork handoff V3** (fixes the V2 inspection): 53 images, 13 deduplicated attachments.
  - Per-view featureless heads; every expression bound to its selected directed-view head; far hand layers edit their selected near layer.
  - Explicit plan asset IDs; per-item F01–F80 obligations (METHOD_OBLIGATIONS.md); continuity rules; coverage audit with 0 unaccounted.
  - The restaurant left the GPT handoff (engine-constructed).
- **Rigging, fitting and rendering:** none executed; no derived part is signed yet. 0 legitimate E01 frames.

## Correction and closure round (2026-11-28, later)
- **Direction correction:** measured on the approved pixels, Mia's head and gaze face SCREEN-LEFT, toward the regular. My earlier screen-right reading was wrong.
  - torso_to_lead was withdrawn (unsigned) and torso_to_regular restored.
  - New `engine/art_bridge/view_facing.mjs` (VF-1) validates view labels against film geography (`films/e01/geometry/VIEW_TARGETS.json`).
- **Channel independence:**
  - Blinks and spoken words now end by restoring the directed channel state (acting.mjs, AR-1).
  - View-qualified channel drawings: `asset_bindings_by_view` in engine, adapter and schemas (VB-1).
  - Performance-view analysis (`performance_views.mjs`) on all three rigs.
- **Amendment 05** (41 view-qualified drawings, on top of 04). Packet `5887127c…` carries both and is the single packet signature.
- **Program V4:** 134 items, 13 attachments in 3 upload groups, 102 chained dependencies.
  - Generated by rules from the live inventory.
  - Includes all LEAD (gait legs, 4 views) and REGULAR (thumb states, 4 views) dependents.
  - Near/far grasps edit the selected near layer.
  - Prop-specific contact text (measured award recess, thin page, phone without thumb); open hands without props.
  - Explicit extraction maps for multi-piece images; prop view variants.
  - Full verbatim method texts (METHOD_TEXTS/); WORKFLOW_BY_ITEM separates requirement, instruction, inspection, preparation/registration and motion.
- **Closure ledger** (`CLOSURE_LEDGER.json`): 345 obligations, 0 unresolved, 1 proposed supersession (REGULAR mouth_warm, never performed). 29 manufactured, 0 motion-qualified.
- **Restaurant:** second quality pass (arched pass-through, wainscot, booth tables, light pools, grounding shadows, counter lip); re-bound in amendment 04.
- **Rendering:** 0 legitimate E01 frames (no derived part signed). `tools/tbo/e01_after_signatures.mjs` continues the chain after signing.

## Signatures V4 applied (2026-11-28)
- **Receipts:** 26 signed receipts imported and verified (HUMAN, trust anchor). Packet 5887127c… (amendments 04+05) accepted and ACTIVE. All 28 earlier approvals (8 masters, 20 parts) re-verified after acceptance.
- **After-signature chain:**
  - Registered: report page; occupancy body+gesture and queue body+rest (extraction); restaurant master and report type (after the intake fixes below).
  - Restaurant planes wait for the restaurant master's signature.
- **General intake fixes, each tested:**
  - Full-frame WORLD plates may be opaque under STRAIGHT alpha; cutouts still need transparency (AC-1).
  - Non-hinging TYPE layers and world planes carry a null pivot through intake, registration, loader and schema.
  - New provenance class ENGINE_VECTOR_CONSTRUCTION in the manifest schema.
- **REGULAR.mouth_warm:** verified unused and omitted for E01 (ledger SUPERSEDED_FOR_E01); slot and channel state preserved.
- **Program V4:** compatible with the accepted packet. Every yield is in the plan. Regeneration changes only orchestration metadata (registration landmarks and motion text for 36 amendment-05 items, in REQUESTS_V4.resolved.json); the image requests and attachments are unchanged, so the package is preserved.
- **The real pipeline (art_bridge_qa SH01) now runs and refuses to render:** 369 unique assets absent, all accounted for except two classes it exposed:
  1. View-matched arm drawings: Mia upper/fore r/l + hand_l_near in to_lead, down_report and to_lens (15). Not in the plan inventory, so missing from the 345-row ledger. Needs packet amendment 06 (view states bind arm/hand slots), then V4 items. LEAD/REGULAR will surface theirs once their base parts exist.
  2. The channel "repertoire" rule demands every state of every channel, even unreachable ones (it still demands REGULAR.mouth_warm). It should demand reachable states only (default + directed + acting blink/speech), but that needs the motion plan's acting block.
- **No film-level motion plan:** handoff/MOTION_PLAN.json does not exist. The engine has never compiled E01's choreography (joint keys, acting, contacts, camera); this is the next production step after the artwork.
- **Storage:** drive E: is 100% full (≈320 MB free). Render-based tests failed from truncated chunks (p01_film_qa, p02_injection); this is environmental, not code. No rendering is possible until space is freed.

## Motion compilation and demand closure round (2026-11-28, evening)
- **Storage:** free space verified (E: 126 GB, C: 62, D: 58). New `engine/production/storage_guard.mjs` (SG-1): every render chunk checks real free space with a 5 GB margin before writing; scratch can be routed with TBO_SCRATCH_DIR.
- **Semantic motion plan** (`engine/story/semantic_motion_plan.mjs`, `tools/tbo/e01_compile_motion_plan.mjs`) → films/e01/handoff/MOTION_PLAN.json:
  - directed root positions, 32 pose targets, 14 view changes, 23 gaze intervals, 16 contact windows, prop support/photo intent;
  - measured speech words for all 3 speakers; blinks (engine default pending the director; no blink in Mia's capture window — new acting `exclude_frames`);
  - cuts at 444/588; recoverable f959 outgoing state.
  - 50 symbolic geometry bindings (joints, contact transforms, camera framing) bind when art is measured. The acting compile has 0 errors.
- **Reachable-state demand:** when the motion plan is known, channels demand only reachable states (default + directed + blink/speech) and view-qualified drawings in their view (RS-1). REGULAR.mouth_warm is no longer demanded; nothing was deleted.
- **Body facing separated from head view** (asset_state, view_demand, adapter, schemas; BF-1). Amendment 06 (1a82ca0a…): 40 limb drawings for real body turns, 111 facial view metadata, 0 residual view mismatch.
- **Demand reconciliation** (DEMAND_RECONCILIATION.json): the renderer's 369 missing assets → 129 standalone V5 requests + extraction + native constructions + body-facing compatibility + structural layers + 1 unreachable state. 0 unclassified.
- **Closure ledger:** 385 obligations, 0 unresolved, 34 by deterministic extraction.
- **V4 partial return:** preserved and verified.
  - LEAD A02 round01 imported as a valid candidate, UNRESOLVED (arms) and not promoted.
  - The collages are rejected.
  - Uploads were interface-transformed copies with no verified edit binding (recorded).
- **Program V5:** 156 standalone requests (one image each, own attachments/prompt/construction/acceptance, ORCHESTRATION.md separate).
  - A02 becomes an arms-only repair of the candidate.
  - Four items moved to extraction after master approval; 26 amendment-06 limb items chained to their torso views.
- **Footage:** none yet. No E01 interval has all of its art: Mia's heads/hands, LEAD/REGULAR, the background states and the restaurant are pending art or signature.

## V6 signatures and head/body tracks (2026-11-28, night)
- **Receipts:** 7 of 8 imported as approved. The report type was refused: I had changed its record after export. It was re-requested.
- **Amendment 06** accepted.
- **Defect (mine):** the continuation re-ran intake on already-registered assets, clearing approval pointers.
  - The 4 group parts were restored: their receipts verify against identical bundles.
  - The restaurant master and report page have new registration evidence, so they need re-signing.
  - Intake (constructions + extraction) is now idempotent.
- **Motion plan** recompiled on the accepted packet with the blink cadence director-confirmed.
- **Engine fixes:**
  - A rig's initial view is its first view event's from-state (IV-1). LEAD/Mia had "no view" before their first event, so view-qualified faces never resolved.
  - Only acting-driven channels keep a standing repertoire.
  - Face slots compare to the view facing (view_demand).
- **Amendment 07** (d67f08bf…): explicit head/body tracks from the directed performance. Composite views; torso follows the body; 2 new page-grip hands; prop back/edge variant ids. Residual view mismatch 0; validate and preflight pass.
- **Program V6** (versioned delta of V5): 18 requests superseded (no state cell selects them), 2 added, typed output contracts, component-pack contracts, directed face construction per expression. 140 requests.
- **Ledger:** 393 obligations, 0 unresolved; 30 approved; 29 not generated (unreachable or never-displayed slot defaults) with engine evidence.
- **Demand reconciliation:** 0 null producers; the 36 amendment body drawings are all active.
- **Physical motion producer and rendering:** not executed. No character has a complete approved part set, so there are no measured joints, no rigs and no renderable interval.
