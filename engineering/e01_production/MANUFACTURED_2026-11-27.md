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
