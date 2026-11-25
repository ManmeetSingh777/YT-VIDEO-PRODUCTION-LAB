# ARCHIVED — P02 historical instructions, NOT current session authority

# HANDOFF — Motion-Native Studio V1

## P02 system-repair + production-ledger directive — CURRENT STOP POINT
Input: `inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md`, plus the mid-run "machine-generated executable checklist" requirement. Branch `hv2-system-correction`.
Package: `audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip`. Read `hybrid_v2/evidence/p02/FINAL_REPORT.md` first, then `OPEN_ITEMS.md`, `TEST_RESULTS.md` and `REHEARSAL_REPORT.md`.
- **Production controller.** `engine/tools/production_run.mjs` provides preflight/start/status/watch/trace/why/resume/verify/export-audit.
  - Per-film checklist: S00–S09 tasks are derived from the film's own contracts (`engine/production/stages.mjs`).
  - Ledger: hash-chained, content-addressed, with fenced locks and a HEAD pointer (`engine/production/ledger.mjs`).
  - Legacy history is migrated into a separate IMPORTED_LEGACY_UNVERIFIED stream.
- **Renderer.** Production Chrome renderer `art_bridge_chrome_frames` (`engine/film/chrome_frames.mjs`): native 1920×1080 RGB24 of the registered layers, using the preserved nu.js.
  - Output path: per-chunk FFV1 segments → MP4, plus a completion receipt verified by fresh-session re-render.
  - Coverage gate: `engine/film/coverage_gate.mjs`.
- **Authority.**
  - Signed review envelopes against external trust anchors (`reviewer_auth.mjs`). The diagnostic namespace isolates test trust.
  - Candidate selection is by ID under a lease (`candidate_store.mjs`).
  - Provider outcome states, with no blind retry. Paid-run manifests (`engine/production/run_authorization.mjs`).
  - Capability classes DECLARED/LIVE_VERIFIED/FAILED/UNTESTED.
  - GPT operator handoff: `engine/art_bridge/gpt_handoff.mjs`, CLI `art_outbox.mjs export-gpt-job|import-gpt-candidates|select-candidate`.
  - INERT_CONTROL differential: `engine/production/inert_control.mjs`.
- **Tests.** Suites: `tests/art_bridge/` and `tests/p02/` (P02-R01..R27, RP1..RP6, PORTAL-INTAKE).
  - Rehearsal: `node tests/p02/run_rehearsal.mjs --phase X --build`.
  - Replay: `node tests/p02/replay_audit.mjs`.
  - Ledger: `LEDGER_EXTRA_ROWS=tests/p02/ledger_rows_p02.mjs LEDGER_OUT=hybrid_v2/evidence/p02/FAILURE_LEDGER_P02.json node engine/tools/build_failure_ledger.mjs hybrid_v2/work/audit_logs/p02_tap.txt`.
- **Still missing (correctly blocked).** ZERO real art, human trust anchors, approved story or narration.
  - `films/hv2_film001` production preflight: every stage blocked (`PRODUCTION_PREFLIGHT_hv2_film001.json`).
- **Rehearsal result (phase K, `hybrid_v2/work/p02/rehearsal_K`).**
  - S00–S08 committed; S09 `final_media` verified; `film_review` blocked by design.
  - MP4: 7200 frames, 1920×1080, 60/1, image-backed via Chrome.
  - Limits: K predates the blur fixes F111/F112, and the world plate has no design record (P02-R14 FAIL).
  - Earlier phases A–J and their recovered ledgers are listed in `REHEARSAL_REPORT.md` and `RECOVERED_ORIGINAL_EVIDENCE/`.
- **Tests:** 185 executed (merged TAP logs), 184 pass, and 1 FAIL that is honest (P02-R14).
- **Ledger:** 112 rows: 51 QUALIFIED_ON_DIAGNOSTICS, 59 IMPLEMENTED_UNQUALIFIED, 2 FAIL (F090, F095, both via R14).
- **Disk.** Drive E: filled twice. Regenerable R23/trace test copies were MOVED, byte-verified with manifests, to `C:\MOTION_NATIVE_STUDIO_V1_EVIDENCE_OFFLOAD\`. Nothing was deleted.
- **Deliverables.**
  - `audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip`
  - `exports/HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT.zip`
  - `exports/NEUTRINO_ORIGINAL_VS_CURRENT_EXECUTION_MAP.md`
- **NEXT (per Manmeet, after the audit).** No more full-length diagnostic rehearsals. The next qualification is a REAL-ART 10 s canary: `films/hv2_film001` S02 frames 1320–1920 (`hybrid_v2/evidence/p02/CANARY_PLAN.md`).
  - Approvals and the art route must be decided by Manmeet before any generation.
- **STOP.** Independent audit of the ZIPs comes next. Do NOT submit art, approve anything, create a paid run, or render the real film until Manmeet authorizes a bounded canary.

## System-correction directive (C0–C8) — previous stop point
Input: `inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md`. Branch `hv2-system-correction`. Package: `audit_outbox/HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip`.
Read `hybrid_v2/audit_docs/SYSTEM_CORRECTION_README.md`, `hybrid_v2/evidence/system_correction/ROOT_CAUSE_REPAIR_MATRIX.md`, `FAILURE_LEDGER.json` (computed).
- C1 universal fail-closed contract (all families/state kinds; story/direction/design receipts; requireApprovedContract before provider discovery;
  immutable content-addressed outbox). C2 complete staged method delivery + causal consumers for all 80 methods. C3 `engine/story/` (mechanisms,
  action coverage, continuity, attention, narration). C4/C5 art demand, FIT_RIG for every rigged master, bounded contact/support solver, deform,
  shadows, portal, phrases. C6 `engine/film/` (revision, tiling, segmented render + completion receipt, QA layers → TEST_PASS only under test).
  C7 `repair_memory.mjs`. C8 ledger + independent trace.
- ZERO real art / human reviews / approved story / narration. Open software defect: no production per-frame Chrome renderer registered (OPEN_DEPENDENCIES.md).
**STOP:** independent audit of the ZIP. Do NOT start bulk GPT art, approve anything, or render the 120 s film.

## P0.1 re-audit corrections + Stage 3 two-way art-to-motion contract — previous stop point
Inputs: `inputs/HYBRID_V2_P0_INDEPENDENT_REAUDIT.md` (B1/B2/B3 + hardening) and the chat Stage 3 correction (six Ines conflicts).
Report: `hybrid_v2/evidence/P01_AND_STAGE3_CONTRACT_REPORT.md`. Root causes: `hybrid_v2/evidence/stage3_contract/ROOT_CAUSES_AND_CONTRACT.md`.
- P0.1: one crop→canonical affine (`asset_geometry.mjs`) for intake/emitter/footprint/transitions/loader; plan-owned underpaint; whole-film QA
  (`engine/tools/art_bridge_film_qa.mjs`); registration evidence by content; provider idempotency + immutable candidates; append-only HUMAN/DIAGNOSTIC history.
- Stage 3 contract: `engine/art_bridge/art_contract.mjs#preGenerationGate` (method fidelity with clause hashes, applicability, molecular, view/alpha/scale/pose/
  interface/state agreement, witness grounding) runs before compile and before submit; HUMAN `design` approval required (`art_outbox.mjs check-design|review-design --human`);
  FIT_RIG intake fits the rig to approved art (`RIG_FIT_RECEIPT.json`) and re-solves every contact frame (`checkRigFeasibility`); infeasible → restaging/new pose art, dependents blocked.
- Ines design: `films/hv2_film001/art_designs/ines_design.mjs` (PROPOSAL; gate PASS; `BLOCKED_ON_DESIGN_APPROVAL`). Request 31 949/32 000 chars (51 headroom).
- Tests 75/75 (`stage3_contract.test.mjs` 9/9; before-runs recorded). Stage 2 browser proofs ALL MECHANICAL PASS. Stage 3 proofs mechanical PASS, stage BLOCKED.
**STOP for independent review:** `audit_outbox/HYBRID_V2_P01_CORRECTION_AUDIT.zip`. Do NOT submit the first real canonical-master request, approve the design/story,
start bulk production, or claim art quality/production readiness.

## Independent-audit correction round (P0-1..P0-6) — previous stop point
Input: `inputs/INDEPENDENT_HYBRID_V2_AUDIT.md`. Report: `hybrid_v2/evidence/p0/P0_REPAIR_REPORT.md` (failing-before 9/9 → passing-after 10/10; suite 45/45).
New producers: `engine/art_bridge/art_intake.mjs` (planJobs, ingestMaster, reviewMaster, ingestPart, reviewPart, approveState, approveStateEdge,
resumeDependentJobs, submitJob), `engine/art_bridge/approvals.mjs` (hash-scoped receipts in `<film>/reviews/`), typed `routeMedium` + contract checks,
QA gates (`--mechanical-only` for diagnosis). Outbox regenerated by code (74 jobs, 0 empty-frame jobs). Round trip: `node tests/art_bridge/roundtrip_fixture.mjs`,
evidence `node tests/art_bridge/p0_roundtrip_evidence.mjs` → `hybrid_v2/evidence/p0/ROUNDTRIP_EVIDENCE.json` (DIAGNOSTIC rasters only).
**STOP for independent re-audit:** `audit_outbox/HYBRID_V2_P0_CORRECTION_AUDIT.zip`. No bulk GPT production, no story approval, no Stage 4 film.
Still BLOCKED: live provider calls, story approval, narration, human review of real art, audit P1 items (see OPEN_DEPENDENCIES.json).

## Hybrid V2 — current status (authoritative; supersedes the "status checkpoint" at the end)
Binding: `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md`, `inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md`.
(Previous stop point `audit_outbox/HYBRID_V2_IMPLEMENTATION_AUDIT.zip` was independently reviewed; its P0 defects are repaired above.)

| Stage | Status | Proof |
|---|---|---|
| Baseline | done | `hybrid_v2/evidence/BASELINE.md` |
| 1 Manifest V2 contracts | MECHANICAL_PASS | `hybrid_v2/evidence/STAGE_1_CONTRACT_PROOF.json` |
| 2 execution capabilities | MECHANICAL_PASS on DIAGNOSTIC fixtures; artistic criteria BLOCKED (no real art) | `hybrid_v2/evidence/STAGE_2_MOTION_PROOF.json`, frames `hybrid_v2/evidence/stage2/frames/` |
| 3 GPT art production | BLOCKED (no provider, story approval pending); outbox exported; masters compiled | `hybrid_v2/evidence/STAGE_3_ART_PROOF.json`, `hybrid_v2/art_outbox/` |
| 4 film | BLOCKED (story approval, art, narration) | `hybrid_v2/evidence/STAGE_4_FILM_PROOF.json`, `films/hv2_film001/` |
| F01–F80 | 48 PENDING_PROVIDER_PIXELS; 16 CONSUMER_PROVED_MECHANICALLY; 16 explicitly not proved (with reasons) | `hybrid_v2/evidence/COVERAGE_F01_F80.json` |
| §7.5 negatives | 13 PASS, 2 PARTIAL, 0 FAIL | `hybrid_v2/evidence/NEGATIVE_PROOF_MATRIX.json` |

Architecture map: `hybrid_v2/evidence/IMPLEMENTATION_DIFF_MAP.md`. Gaps/blockers: `hybrid_v2/evidence/OPEN_DEPENDENCIES.json`.

Exact commands (repo root):
- `node --test tests/art_bridge/*.test.mjs` (45 tests, incl. `p0_audit.test.mjs`) · `node tests/art_bridge/make_fixtures.mjs` · `node tests/art_bridge/stage2_fixtures.mjs`
- `node tests/art_bridge/stage2_proofs.mjs` (Chrome; ~3 min) · `node tests/art_bridge/stage3_proofs.mjs` · `node tests/art_bridge/write_stage1_proof.mjs` · `node tests/art_bridge/write_method_trace.mjs` · `node tests/art_bridge/write_stage4_and_dependencies.mjs`
- `node engine/tools/art_bridge_check.mjs check --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --json films/hv2_film001/qa/manifest_v2_report.json` (exit 1: art missing — correct)
- `node engine/tools/art_bridge_qa.mjs qa --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json --scene S02 --plan films/hv2_film001/handoff/MOTION_PLAN_S02.json --out films/hv2_film001/qa/hybrid_v2`
- `node engine/tools/art_outbox.mjs export|resume --film films/hv2_film001` · `status` · `submit --film F --job ID` · `ingest-master|ingest-part --film F --asset ID --file PNG --landmarks JSON --provenance P` · `review-master --identity ID` / `review-part --asset ID` / `approve-state --rig R --state S` / `approve-edge --rig R --from S --to S` (+ `--reviewer NAME --verdict V`)
- Rebuild film graph: `node films/hv2_film001/handoff/build_production_graph.mjs` · designs: `node films/hv2_film001/art_designs/build_designs.mjs`

Next action after review: (1) Manmeet approves/replaces the story proposal; (2) configure an authorized provider or deliver approved art into `hybrid_v2/art_outbox/inbox/`; (3) ingest + review masters, then derived states; (4) qualify S02 and S04 with `--mp4`; (5) only then the 7200-frame film.

**Authorized stage: STAGE 1 ONLY. Stages 2–4 LOCKED.**
**Stage 1 status: INCOMPLETE. No artwork is artistically qualified.**
Binding specs:
- `inputs/STAGE1_F01_F80_SOURCE_TO_CODE_EXECUTION_SPEC.md`
- `inputs/CLAUDE_STAGE1_IMPLEMENTATION_ORDER.md`: Gates A → B → C → D in order.

## Four stages (hard gates)
1. **Stage 1** — F01–F80 → source-conditioned producing methods, plus integrated art qualification (L0–L4).
2. **Stage 2** — method-controlled artwork. LOCKED.
3. **Stage 3** — artistic quality loop and transfer learning. LOCKED.
4. **Stage 4** — full animation on the preserved neutrino runtime (`engine/runtime/nu.js`). LOCKED.

Final artistic approval belongs to Manmeet. Structural or passing tests never substitute for producing operations or visual approval.

## Checkpoints (git)
- `7a4bb84` R3/R4/R5 partial; `f379fed` capsule grip; `39ec60b` Specimen 2 + R8/R9/R10 fixes.
- `96075ca` — the audited snapshot.
- `798a7d4` — Gate A (false assertions closed; 8/8 regression).
- `f4d65bd` — Gate B progress plus artistic root-cause fixes.

Later work is in the working tree until the next commit.

## Gate status
- **Gate A: PASS.** `node engine/methods/proofs/gateA.mjs` → `evidence/stage1/GATE_A.{json,md}`. Covers:
  - frame-gated `emitRegion` plus the frozen `bindings.mjs` catalog;
  - palette fail-closed, plus owned edges;
  - class-correct pixel-causal proofs;
  - F14/F49/F50/F53/F80 behaviour;
  - hard non-renderable failures.
- **Gate B: IN PROGRESS.**
  - Done:
    - `rules.mjs` → `evidence/stage1/SOURCE_RULES.json` (80 rules, 394 positive obligations, PredicateAST);
    - `contracts.mjs` (DesignDecision / UNRESOLVED / hash-bound review);
    - `subject.mjs` (3–5 candidate silhouettes, distinctness, reviewed selection);
    - `figure.mjs` (bone-local authored masses, FK + validated IK, bend-side landmarks, fold classes);
    - `faceview.mjs` (view-registered FaceDesign, F65 mode by px, F52 allocation);
    - `grip.mjs` (hand seated on the prop cross-section, closure);
    - `surfaces.mjs` (`patchByCause`, `planPlanes`);
    - `worldgraph.mjs` (consumed world graph, ports);
    - `palette.designPalette` (witness-measured chroma) and `assertAdjacencyContrast`.
  - Root-cause report: `evidence/stage1/STAGE1_ARTISTIC_ROOT_CAUSE.md`.
- **Gate C: NOT PASSED.** Specimen 2 (tide mill) exists: `proofs/specimen2_render.mjs`, `DECISION_PLANS/mill_scene.mjs`, `gears.mjs`, causal-visibility check; renders `FIRST_PASS/specimen2_*`, `AFTER_REPAIR/specimen2_r1..r3`; motion `MOTION/specimen2_motion_10s.mp4` (`proofs/specimen2_motion.mjs`).
  - Specimen 1 (hydrologist) renders: `FIRST_PASS/`, `AFTER_REPAIR/specimen1_r1…r5`.
  - Diagnostic quality only; Manmeet judged it unacceptable.
  - Specimen 2 (complex non-human world, planned: tide-mill machine room) is not built.
  - No motion passage or transfer subject yet.
- **Gate D: NOT STARTED.** Still to do:
  - the status reducer from obligations plus evidence (the old `status.mjs` is obsolete — never use `gaps`);
  - F72 producer;
  - F17/F29 proofs;
  - routing proofs with real dispatch (F19/F20/F34/F37/F55/F57/F64 currently FAIL as ROUTING).

## Next actions (in order)
1. Close the open root causes:
   - **R4:** brow/mouth formulas in `faceview.mjs` → identity-authored brow/mouth shapes per expression.
   - **R5:** grip digits → designed finger silhouettes plus crease planes.
   - Shape statistics from witnesses (head:body ratio, taper, corner frequency) as `STYLE_MEASUREMENTS`.
   - Palette tier refinement (cool support hues oversaturated).
2. Re-render Specimen 1 through the same producers. Review the full frame plus `crop_face_hand` and the thumbnail.
3. Specimen 2 (tide mill): `worldgraph` oblique-interior family, plus a gear-train producer (`gears.gearTrain`, catalogued but not implemented).
4. Run an unrelated transfer subject through the unchanged producers (L4).
5. Produce an 8–12 s motion passage. Use `nu.js` or a frame-render loop; check registered states and underpaint.
6. Gate D coverage, `STAGE1_STATUS.{json,md}`, `CODE_BINDINGS.json`, `ART_REVIEW.md`.

If pure-code art still fails the whole-look review after these, report a **hybrid image-master proposal**. Do not switch to it without authorization.

## Key commands
- `node engine/methods/proofs/gateA.mjs`
- `node engine/methods/proofs/run.mjs`: legacy method proofs under the class-correct harness.
- `node engine/methods/proofs/contour_quality.mjs <label>`
- `python -I engine/methods/proofs/measure_witnesses.py`
- `node engine/methods/proofs/specimen1_candidates.mjs` / `specimen1_select.mjs` / `specimen1_face_atlas.mjs` / `specimen1_render.mjs <outDir> <tag>`

## Hybrid V2 — status checkpoint (2026-11-22)
- Stage 1 MECHANICAL_PASS (commit 19100b2): `hybrid_v2/evidence/STAGE_1_CONTRACT_PROOF.json`, `COVERAGE_F01_F80.json`; `node --test tests/art_bridge/*.test.mjs` 20/20.
- Stage 2 IN PROGRESS (not yet proven). Modules written: `engine/art_bridge/{math2d,temporal,state_router,transitions,lighting,asset_registry,svg_parts,scene_graph,rig_binding,render}.mjs`, `runtime/bridge_rt.js` (binds baked frames to unmodified nu.js via S.at). Fixture scenes A–E,P: `tests/art_bridge/stage2_fixtures.mjs` (DIAGNOSTIC_FIXTURE only — never target art).
- Verified so far: all 6 scenes load; numeric dry run (`node tests/art_bridge/_dry.mjs A B C D E P`) has no failures; grip/plant contact error ≤2e-7 px; reach ramps smooth (bend-branch mismatch now raises UNAPPROVED_BEND_BRANCH); Chrome render via nu.js works (`tests/art_bridge/_p.mjs`): rotation marker within 0.13 px of prediction, rest-pose pixels identical for opaque/alpha, ≤0.84/255 premultiplied for partial alpha.
- Next: write `tests/art_bridge/stage2_proofs.mjs` for spec §5 acceptance 1–10 → `STAGE_2_MOTION_PROOF.json` (criteria 1, 5, 6, 10 need real GPT art → BLOCKED for art), `art_requests.mjs`, `registration.mjs`, `engine/tools/art_bridge_qa.mjs`; then Stage 3 outbox (no provider configured) and Stage 4 proposal.
