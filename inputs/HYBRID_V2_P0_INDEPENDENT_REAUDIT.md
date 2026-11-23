# Hybrid V2 — independent P0 re-audit

**Verdict: meaningful P0 progress, but NOT approved for bulk Stage 3 art production or production qualification.**

Evidence examined: user-provided `HYBRID_V2_P0_CORRECTION_AUDIT.zip` (archived HEAD `8888c75bddba280158585562fd789cd6c5e992a6`, proof code revision `c0eed4068a0cd9074160db46e3068ded3cc9214a`), source, proof harness, sample manifest and dependency plan, outbox, rendered registration/switch-strip witnesses, and original Hybrid V2 implementation spec. The archive opens cleanly; 1,674 integrity-listed files matched SHA-256 and byte count. This was a read-only code audit; no project source was edited.

## What is genuinely improved

| Original P0 | Independent verdict | Evidence / limitation |
| --- | --- | --- |
| P0-1 lost frame ranges | **PASS for stated regression** | 74 generated ArtJobs; no trigger-bearing job has an empty `motion_context.frame_ranges`. Perturbing hand timing and one world's overscan updates the correct contexts. |
| P0-2 canonical masters routed as cutout parts | **PASS** | All six masters use canonical-master media routes; impossible kind/medium combinations are refused. |
| P0-3 master/part intake absent | **PARTIAL, NOT COMPLETE** | Master registration, reviewer action, dependent readiness, and registered parts exist and pass the diagnostic round trip. Canonical-bounds and ownership defects below remain. |
| P0-4 approvals as arbitrary strings | **PASS for hash-scoped refusal cases; additional audit hardening needed** | Random IDs, foreign receipts, changed pixels, pivots, and edges are rejected. Registration receipt *contents* are not themselves bound into the approval and reviewer identity is operator-supplied text. |
| P0-5 no provider call path | **PASS for stub integration only** | `submitJob` invokes a local fake provider, decodes alpha, attaches the master for edits, and uses an idempotency key. There is no live GPT-image end-to-end proof. Request identity bugs remain. |
| P0-6 false production PASS | **PASS as a fail-closed diagnostic gate; production qualification missing** | `pass` is false unless production gates succeed; `--mechanical-only` is labelled separately. However `whole_film_pass` is always false, so no positive production qualification is implemented yet. |

Independent local regression run: **44/44 tests passed** when the browser-only P0-6 was excluded. P0 subset: **9/9 non-browser tests passed**. P0-6 itself could not be re-executed locally because this extracted environment lacks `puppeteer-core`; its archived Windows log reports a passing browser run. A first accidental parallel test run interfered with a shared fixture; all subsequent runs were sequential and clean. The archive's three-frame Chrome strip is a diagnostic capsule rig, not artistic proof; its open-to-grip state visibly changes in one frame, with stable wrist registration but no independently proven perceptual continuity.

## Blocking defects missed by the tests

### B1 — registration stores the wrong canonical rectangle for scaled/rotated art

**Source:** `engine/art_bridge/art_intake.mjs#ingestMaster` and `#ingestPart`; consumers `engine/art_bridge/svg_parts.mjs`, `scene_graph.mjs`, `transitions.mjs`; binding spec `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md` lines around 92, 167–194, 521–533.

The canonical rectangle is specified as the real area occupied in **canonical identity units**. `ingestMaster` saves `[T.translation_x,T.translation_y,png.width,png.height]`, ignoring T's scale/rotation on the width, height, and extreme corners. `ingestPart` does the same for a cropped image. The archived roundtrip has a 640×900 PNG with scale **0.5** and registration `T = [0.5,0,0,0.5,-20,-15]`. The real canonical rectangle is `[-20,-15,320,450]`, but the manifest stores `[-20,-15,640,900]`. Rotated crops additionally need the min/max of all four transformed corners.

This is not just metadata: `scene_graph.mjs` uses that rectangle to decide camera coverage, and `transitions.mjs` uses it for mask/plate scaling. `svg_parts.mjs` applies `asset_to_canonical` on top of width/height derived from the same misleading canonical rectangle. The current fixture's joint-landmark coincidence does not prove the entire paint extent agrees with the recorded canonical extent.

**Required fix:** define an unambiguous raw-pixel→canonical affine transform (including crop origin), calculate canonical bounding box from the transformed four source-crop corners, and separate the source image's intrinsic width/height from its canonical occupied rectangle. Update SVG emission and footprint/transition consumers together so scale is applied once, not twice. Prove at 0.5×, 1.25×, nonzero crop, rotation, and combined transform with pixel probes at corners, pivots and landmarks; prove the camera-footprint test rejects a view that exceeds actual pixels.

### B2 — hidden-surface underpaint ownership disappears during intake

**Source:** `engine/art_bridge/art_intake.mjs#assetRecord` initializes `underpaint_asset_ids: []`; `#ingestPart` supplies `underpaintIds: []` and `hiddenSurfaces: []` to registration. In the actual 74-asset plan, `ines_forearm_r` explicitly has `hidden_surfaces: ["elbow_inner_sleeve"]` and `ines_elbow_r_underpaint` is planned. The ingested forearm keeps the hidden-surface declaration but has no underpaint asset link. `load_manifest.mjs` correctly reports `MISSING_UNDERPAINT` for that state.

**Required fix:** extend the planned art contract with explicit surface→underpaint ownership and layer ordering, validate referenced underpaint IDs exist, and propagate these relationships into registration and every ingested asset. Do not silently attach any arbitrary nearby asset; reject unspecified mappings. Regression: ingest the **real Ines forearm + elbow underpaint design contract** and show it passes underpaint linkage/occlusion checks, then remove the link and show a targeted refusal.

### B3 — final film production verdict has no positive path

**Source:** `engine/tools/art_bridge_qa.mjs#runQA` sets `whole_film_pass: false` unconditionally and computes `production_pass = Object.values(gates).every(Boolean)`. There is no whole-film aggregation implementation in the inspected code. Therefore even a perfectly approved, audio-aligned, fully rendered film cannot receive `PRODUCTION_PASS` through this path. A fail-closed placeholder is honest, but **not a completed production qualification system**.

**Required fix:** keep single-scene QA incapable of certifying a film; implement a separate whole-film qualification command that verifies all shots, frames 0–7199 at 60 fps, state/edge and artwork review receipts, per-shot mechanical QA, shot transitions, registered artwork coverage, real narration/word alignment, audio render, final MP4 duration/fps/dimensions, review of rendered pixels and final explicit human approval. Issue a hash-scoped *film* review receipt only on success; recheck hashes on rerun. Include negative tests for a missing shot, missing audio, stale art, a 30-fps file and a missing frame.

## Significant pre-production hardening

1. **Enforce intended alpha/kind in intake.** `ingestMaster` sets `alpha_mode` from observed pixels, rather than refusing when the delivered PNG violates the planned OPAQUE/STRAIGHT/BINARY_MASK contract. The part path likewise takes observed alpha from registration. Reject a transparent world plate planned OPAQUE and any opaque cutout planned with true transparency; never silently rewrite the requirement to make an image pass.
2. **Bind registration evidence, not just its existence.** `art_bridge_qa.mjs` uses `registrationReceiptFile` as a pathname-exists check. Hash and validate the receipt's image hash, accepted/failed status, transform, residual tolerance, sidecar reviewer and landmark content against the active manifest. Place the receipt digest in the asset/identity approval scope so a replacement evidence file makes approval stale.
3. **Fix provider idempotency and output handling before real API spending.** `art_intake.mjs#submitJob` hashes prompt, reference, witness hashes and transparency, but leaves out provider/model, output size and capability/config revision. An operator changing model or size can receive `ALREADY_SUBMITTED_SAME_PAYLOAD` for the old model. If a provider returns multiple outputs, every one is copied to the same `<job>.png` inbox filename, overwriting earlier candidates; validate all outputs before any promotion and preserve distinct immutable candidate paths. Test retries and failure/resume with the fake provider; then separately perform one authorized *real* provider smoke test and keep its receipt.
4. **Keep review history immutable.** `approvals.mjs#writeReceipt` creates a receipt filename solely from scope/id/content-hash, so reviewing the same content again overwrites the prior verdict's receipt. It correctly fails closed when an approval is replaced by a rejection (verified in an isolated scratch fixture), but the historical record is lost. Use unique immutable review IDs and an explicit current-review pointer/revocation, preserving every prior decision.
5. **Reject fabricated human authorization.** The `reviewer` is currently nonempty free text. Distinguish human approvals from diagnostic/test sign-off with a trusted reviewer identity or an explicit operator-owned process; do not let an automated job mint final artistic or film approval by writing `reviewer:"human"`.
6. **State-switch smoothness needs visual proof.** The capsule strip at frames 99/100/101 shows a registered but abrupt open→grip swap. Requiring a stable anchor is necessary, not sufficient; use approved transition cels/morphs or an explicitly intentional cut, and inspect native 60-fps continuity.

## Remaining deliberate blockers

- No real GPT-authored, art-director-approved canonical master or dependent view/pose art has been ingested; the visual witnesses are diagnostic only.
- No approved two-minute story/script or recorded narration with measured word alignment; the laundromat scenario is a proposal, not an approved film.
- No live image provider is configured/tested in the submitted archive. A local fake HTTP server proves plumbing only.
- Open P1 design/motion issues noted in `OPEN_DEPENDENCIES.json` remain: grip orientation, whole-body balance, expression and lighting state ownership, method-use proof, repair-to-next-first-pass learning.

## Decision and execution order

1. **Stop bulk Stage 3 requests and do not claim a finished P0 audit.** Preserve the audited revision as checkpoint.
2. Fix B1 (coordinate model/emitter/footprint) and B2 (underpaint contract) together at the earliest producing stage. Add independent pixel/camera/occlusion proofs that fail on the audited old code and pass on the repaired code.
3. Fix B3 as a distinct film qualification consumer; keep the current single-scene test fail-closed. Address provider idempotency, alpha requirements and evidence verification before first paid image calls.
4. Produce a fresh P0.1 audit ZIP with exact before/after tests, source diffs, input hash manifest, recorded browser frames and machine-readable gates, then **pause for independent re-audit**.
5. After independent approval, get explicit story/director approval. Produce **one** original, fully specified GPT canonical-master pilot, inspect its art quality, register it, approve it, make a small number of source-attached animated part/state assets, and render a short 60-fps moving shot. Prove no slideshow, no drift, acceptable contours and transitions, and exact correspondence with the action plan before spending on the rest of the 74 jobs.

## Exact message to paste into the ongoing Claude Code session

> I have independently re-audited `HYBRID_V2_P0_CORRECTION_AUDIT.zip`. This is not a rejection of your progress: 44/44 non-browser tests and all 9 non-browser P0 tests passed in an isolated rerun. But **P0 is not closed**. Read `HYBRID_V2_P0_INDEPENDENT_REAUDIT.md` in full (I will place it in `inputs/`). Do not start Stage 3 paid art requests, build the full film, or declare production-ready. Fix the report's B1 canonical-space rectangle/affine contradiction, B2 dropped hidden-surface underpaint owner, and B3 missing whole-film positive qualification path at their earliest source, with precise source-to-pixel regression proofs. Also enforce planned alpha mode, validate registration receipt content, correct provider idempotency/unique output paths, preserve immutable review history, and explicitly separate any diagnostic approvals from final human decisions. Preserve the existing Neutrino runtime. Your first reply should list each source file and behavior to be changed, tests that will fail on the current code, and the expected transformed canonical coordinates for the 640×900 at 0.5× fixture. Then implement, run the full tests and real browser proof on your Windows environment, re-export a **read-only `HYBRID_V2_P01_CORRECTION_AUDIT.zip`**, and **stop**. No artistic success claims from capsule fixtures. Do not advance to the 74 production ArtJobs until I approve that independent audit.

