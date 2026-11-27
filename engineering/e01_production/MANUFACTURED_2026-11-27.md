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
