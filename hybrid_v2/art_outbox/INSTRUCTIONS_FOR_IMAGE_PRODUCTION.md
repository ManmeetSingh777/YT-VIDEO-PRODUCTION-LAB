# WAITING_FOR_GPT_ART — image production instructions (films/hv2_film001)

Status **WAITING_FOR_GPT_ART** · story approval **NOT_APPROVED (NO_RECEIPT)** · provider **NOT AVAILABLE** — IMAGE_PROVIDER is not configured in this environment; no authorized image-generation/edit provider is available to Claude Code
Jobs are generated from the action/shot graph by `engine/art_bridge/art_intake.mjs#planJobs`; every job carries its exact frame ranges, shots, sockets, pivots, near/far order and camera footprint (jobs with triggers but no frames: 0).

## Order — {"1":6,"2":38,"3":24,"4":6} · status {"BLOCKED_CONTRACT":37,"WAITING_FOR_APPROVALS_THEN_GPT_ART":1,"WAITING_ON_MASTER_APPROVAL":36}
1. Story and direction approval first (verified HUMAN receipts: `art_outbox.mjs review-story|review-direction`). Jobs are provisional until then.
2. Canonical masters (medium RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS / CANONICAL_WORLD_PLATE_WITH_OVERSCAN):
   - `ARTJOB_MASTER_drum_in_4c40db2c` → drum_in · CANONICAL_WORLD_PLATE_WITH_OVERSCAN · BLOCKED_CONTRACT
   - `ARTJOB_MASTER_ines_master_211539ad` → ines_master · RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS · WAITING_FOR_APPROVALS_THEN_GPT_ART
   - `ARTJOB_MASTER_laundromat_far_76979fc1` → laundromat_far · CANONICAL_WORLD_PLATE_WITH_OVERSCAN · BLOCKED_CONTRACT
   - `ARTJOB_MASTER_ledger_master_105f0939` → ledger_master · RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS · BLOCKED_CONTRACT
   - `ARTJOB_MASTER_street_far_ac5264a9` → street_far · CANONICAL_WORLD_PLATE_WITH_OVERSCAN · BLOCKED_CONTRACT
   - `ARTJOB_MASTER_washer_master_38ddfd06` → washer_master · RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS · BLOCKED_CONTRACT
   Submit (only after story, direction and design receipts verify): `node engine/tools/art_outbox.mjs submit --film <film> --job <ID>`. Requests live in `compiled/<ID>/<generation>/STAGE_NN_REQUEST.json` (ordered stages; stage N edits stage N-1's selected output).
3. `ingest-master` with reviewed landmarks → measured canonical frame + identity hash; then an explicit `review-master` verdict (hash-scoped receipt).
4. `resume`: dependents become READY_FOR_SOURCE_ATTACHED_EDIT and compile with the approved master bytes as mandatory edit reference (EDIT_REFERENCE.json).
5. `ingest-part` (registration against the approved master; refuses off-axis/misregistered edits) → `review-part`, `approve-state`, `approve-edge`.
6. Any change to master pixels/landmarks makes dependent receipts STALE; `resume` lists the re-manufacture/re-review work.
