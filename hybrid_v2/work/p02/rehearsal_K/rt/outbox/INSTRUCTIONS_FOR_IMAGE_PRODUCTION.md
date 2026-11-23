# WAITING_FOR_GPT_ART — image production instructions (hybrid_v2/work/p02/rehearsal_K/rt/film)

Status **WAITING_FOR_GPT_ART** · story approval **APPROVED** · provider **NOT AVAILABLE** — IMAGE_PROVIDER is not configured in this environment; no authorized image-generation/edit provider is available to Claude Code
Jobs are generated from the action/shot graph by `engine/art_bridge/art_intake.mjs#planJobs`; every job carries its exact frame ranges, shots, sockets, pivots, near/far order and camera footprint (jobs with triggers but no frames: 0).

## Order — {"1":2,"2":4,"3":2} · status {"APPROVED":1,"BLOCKED_CONTRACT":1,"READY_FOR_SOURCE_ATTACHED_EDIT":6}
1. Story and direction approval first (verified HUMAN receipts: `art_outbox.mjs review-story|review-direction`). Jobs are provisional until then.
2. Canonical masters (medium RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS / CANONICAL_WORLD_PLATE_WITH_OVERSCAN):
   - `ARTJOB_MASTER_pilot_master_a4b23a0d` → pilot_master · RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS · APPROVED
   - `ARTJOB_MASTER_rt_world_far_93da356a` → rt_world_far · CANONICAL_WORLD_PLATE_WITH_OVERSCAN · BLOCKED_CONTRACT
   Submit (only after story, direction and design receipts verify): `node engine/tools/art_outbox.mjs submit --film <film> --job <ID>`. Requests live in `compiled/<ID>/<generation>/STAGE_NN_REQUEST.json` (ordered stages; stage N edits stage N-1's selected output).
3. `ingest-master` with reviewed landmarks → measured canonical frame + identity hash; then an explicit `review-master` verdict (hash-scoped receipt).
4. `resume`: dependents become READY_FOR_SOURCE_ATTACHED_EDIT and compile with the approved master bytes as mandatory edit reference (EDIT_REFERENCE.json).
5. `ingest-part` (registration against the approved master; refuses off-axis/misregistered edits) → `review-part`, `approve-state`, `approve-edge`.
6. Any change to master pixels/landmarks makes dependent receipts STALE; `resume` lists the re-manufacture/re-review work.
