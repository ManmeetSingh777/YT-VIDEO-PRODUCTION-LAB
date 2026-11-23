# hv2_film001 — render instructions (Hybrid V2)

**Current status: BLOCKED — do not render the film.** Story approval pending, no approved art, no recorded narration, independent audit review pending.

## Order of operations once unblocked
1. Approve or replace `direction/EXPERIENCE_DIRECTOR_PROPOSAL.md`; regenerate the graph: `node films/hv2_film001/handoff/build_production_graph.mjs`.
2. Export / refresh the art outbox: `node engine/tools/art_outbox.mjs export --film films/hv2_film001`.
3. Produce art in dependency order (masters → parts/layers → states → transition plates). Ingest each delivered file:
   `node engine/tools/art_outbox.mjs ingest --film films/hv2_film001 --job <ARTJOB_ID> --file hybrid_v2/art_outbox/inbox/<ARTJOB_ID>.png [--landmarks <sidecar>.json]`
4. Review registration overlays; set `approved_review_id` on assets, states and edges.
5. Manifest gate: `node engine/tools/art_bridge_check.mjs check --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --json films/hv2_film001/qa/manifest_v2_report.json` (must exit 0).
6. Qualification: `node engine/tools/art_bridge_qa.mjs qa --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --scene S02 --plan films/hv2_film001/handoff/MOTION_PLAN_S02.json --out films/hv2_film001/qa/hybrid_v2 --mp4`, then the unlike family (S04) with its own plan. Human review of full-speed and frame strips around every contact/state switch.
7. Only after qualification is approved: per-shot renders of all 7200 frames, A/V sync measured against recorded narration, ffprobe verification (1920×1080, 60/1, 7200 frames).

## Rules
- Never substitute art; `MISSING_ART_ASSET` produces an ArtJob, nothing else.
- `nu.js` stays unmodified; the bridge binds baked frames via `engine/art_bridge/runtime/bridge_rt.js`.
- DIAGNOSTIC_FIXTURE assets are rejected by `--production` and never enter this film.
