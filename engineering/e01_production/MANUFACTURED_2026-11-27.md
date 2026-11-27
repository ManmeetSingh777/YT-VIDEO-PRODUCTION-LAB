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
