# Stage 3 art-to-motion contract — source-level root causes and contract changes

Scope: `engine/art_bridge/art_requests.mjs`, `reference/construct-kurzgesagt-art/scripts/compile_art_job.py`, `…/prepare_first_pass.py`,
`films/hv2_film001/art_designs/ines_master.design.json`, `hybrid_v2/art_outbox/compiled/ARTJOB_MASTER_ines_master_211539ad/IMAGEGEN_REQUEST.json`.
Verified against those files at revision `094a1d0` (outputs quoted are from the compiled job, not paraphrased).

## Root causes (earliest producing operation first)

| # | Observed conflict | Earliest producer | Why nothing stopped it |
|---|---|---|---|
| 1 | F64 bound with `conditions: "hand construction"` | `films/hv2_film001/art_designs/build_designs.mjs` (Claude-authored proposal brief): `bind("F64", "hand construction", …)`. F64's source text is *"Human/mascot/animal identity must be routed by illustration family"* (choose ACTING_FACE / GESTURE_FULL_BODY / …, then a family `canonical_identity`). Hand construction is F06; F05 was labelled "character construction" (source: head/facial-state fabrication); F52 "acting face" (source: number of marks by scale and role). | `compile_art_job.py#validate` only checks that each binding has non-empty `conditions/source_witnesses/invariant_transferred/variation_required/observable_verification`; `compile_job` then appends the method's full text, so a mislabeled binding *looks* source-grounded. The bridge (`art_requests.mjs#compileArtJob`) added no method-fidelity check. |
| 2 | Design dictates "egg oval", "tall rounded-rectangle coat block", "two straight trouser columns", "mitten palm" | Same brief: Claude wrote the silhouette from the provisional rig (joint columns, a palm socket) instead of from source-witness observation. The rig plan's needs (separable limbs, wrist pivot) leaked into artistic shape decisions. | `prepare_first_pass.py#validate_character` checks only that the fields are non-empty strings. Nothing requires each high-impact decision to be grounded in an attached witness observation and an unlike contrast, or prevents a rig convenience from becoming an artistic decision. |
| 3 | `molecular_visual_decisions` absent, job accepted | `prepare_first_pass.py#validate_control` line 93–94: `molecular = job.get(...)`; `if molecular is not None:` — the whole block is optional, and `build()` substitutes `{"status":"USE F57–F80 METHOD ROUTING"}` (a placeholder) into the prompt. | The bridge treated the skill's acceptance as sufficient. |
| 4 | Design view three-quarter right; motion `view_id: front` | `films/hv2_film001/handoff/build_production_graph.mjs`: `P("ines_master", …)` takes the default `view: "front"`, while every Ines rig state is `view_facing: "threeq_r"`. `art_intake.mjs#planJobs` copies the plan's view into `motion_context.view_id`. | No step compared the design's intended view with the motion contract's view; the design states its view only as prose ("three-quarter right full figure"). |
| 5 | `transparent_background: false` while motion requires `STRAIGHT` alpha | `prepare_first_pass.py#build` line 235 hard-codes `"transparent_background": False`. | `compileArtJob` returned the skill's request unchanged; transparency was only decided later in `submitJob` from the motion context, so the compiled request contradicted the contract. |
| 6 | Only F01, F05, F52, F64 (mislabeled) for a full-gesture canonical character; zero repair rules | The brief selected methods by hand. The motion graph demands grip/pinch hands and contact states (F06, F66), a registered expression/pose family (F67), an eye/mouth mode chosen by crop (F65), separable joined parts with underpaint (F59, F79), palette roles and owned edges (F61/F03, F62), silhouette before interior (F58), and a request that truly contains the methods and witnesses (F80). | No applicability routing from the subject family and motion requirements to the required method set. Zero repair rules is the true state of the film's memory (no real repaired image exists); it is reported, never fabricated. |
| 7 | (found while tracing E) Delivered art is forced onto the provisional skeleton | `art_intake.mjs#ingestMaster` fits ALL reviewed landmarks to the *planned* identity landmarks with a 1-px residual limit, so a canonical master whose arm or head proportions differ from the provisional rig is REFUSED. Proportions would have to bend to the rig. | Contract D/E inverted: the rig must be fitted to approved art, not art to a provisional rig. |

## Contract changes (implemented in `engine/art_bridge/art_contract.mjs`, `art_requests.mjs`, `art_intake.mjs`, the plan builder and the Ines design)

**BEFORE artwork — `preGenerationGate(job, design, ctx)` must pass before any request is compiled or submitted:**
- **A. Method fidelity.** Every binding carries `decision` fields required by that method's own *Build* clause (e.g. F64 → `illustration_family` from the source enumeration + `canonical_identity` parts; F65 → `face_eye_mode` from the source enumeration; F06 → contact graph + task-specific hand states). The source clause hash must match `engine/methods/source/F_SOURCE.json`. A binding whose decision belongs to another method fails.
- **B. Applicability and molecular completeness.** `requiredMethods()` derives the applicable set from the subject family and the motion contract (contacts, states, view switches, cutout manufacturing, alpha). Each must be bound, or excluded with a reason that names an unmet condition. `molecular_visual_decisions` is mandatory, with every field specific; schema placeholders are refused.
- **C. Contract agreement.** View token, alpha/transparency, scale (authored resolution ≥ largest planned on-screen size), canonical pose = the rig's rest state, attachment semantics (every rig joint and socket and every state appear as *motion interfaces*), and motion states (every pose/view/expression/contact state the action graph needs appears in `state_family`).
- **D. No rig-forced design.** High-impact construction decisions need `design_grounding` (attached witness + observation + unlike contrast + why for this identity). A shape decision that is only a generic primitive and is ungrounded is refused. The motion contract is delivered to the artist as *requirements* (what must articulate, separate, contact or turn), never as joint coordinates or limb proportions.
- **F. Human design approval.** A hash-scoped HUMAN `design` receipt is required before submission. Automation can never approve a design.

**GENERATE.** The compiled request's transparency comes from the motion contract (an override recorded in `BRIDGE_REQUEST_CONTRACT.json`), and the gate report travels with the request.

**AFTER approval — `ingestMaster` with plan `registration.mode = "FIT_RIG"`:**
- **E.** Only declared `frame_anchors` define the canonical frame. All other landmarks are *measured* from the approved art. `fitRig()` moves the rig's joints and sockets to the measured landmarks, never moving pixels, and writes `RIG_FIT_RECEIPT.json` (before/after joints, limb-length changes).
- `motionFeasibility()` then re-solves every contact frame. If it fails → `INFEASIBLE_REQUIRES_RESTAGING_OR_NEW_POSE_ART` with exact frames; dependent jobs stay blocked; proportions are never changed.

**THEN.** Dependents compile only after master approval *and* a feasible fit, with the approved master bytes as the edit reference. Continuity is verified by the existing registration and state-edge receipts.

## Implementation result (see `hybrid_v2/evidence/P01_AND_STAGE3_CONTRACT_REPORT.md`)

| Contract item | Where it is enforced | Proof |
|---|---|---|
| A, B, C, D | `engine/art_bridge/art_contract.mjs#preGenerationGate`, run inside `compileArtJob` (refusal before the skill compiler) and again inside `submitJob` from the design on disk | S3C-1..6, S3C-9 |
| F | `art_contract.mjs#approveDesign` / `designApprovalStatus` (scope `design`, hash-bound to design + gate); `submitJob` → `BLOCKED_ON_DESIGN_APPROVAL`; CLI `art_outbox.mjs check-design|review-design` | S3C-7 |
| GENERATE | `art_requests.mjs`: transparency override + `BRIDGE_REQUEST_CONTRACT.json`; `packContractRequest` (finding #8 below) | S3C-5 |
| E | `art_intake.mjs#ingestMaster` (plan `registration.mode = FIT_RIG`), `fitRig`, `checkRigFeasibility`; `RIG_FIT_RECEIPT.json` | S3C-8 |
| THEN | `resumeDependentJobs` → `BLOCKED_RIG_FIT_INFEASIBLE` until the fitted rig makes every contact frame solvable | S3C-8 |

| # | Finding while implementing | Producer | Resolution |
|---|---|---|---|
| 8 | A faithful design (14 applicable methods, grounding, molecular block) exceeds the skill's 32 000-character provider limit (62 937). The old bridge also pasted the machine rig contract into the artist prompt | `art_requests.mjs#compileArtJob` (merged `hybrid_v2_motion_context` into `manufacturing`); `compile_art_job.py` appends every bound method's full text | F80 routing: full text for the molecular `chosen_methods`; other bound methods travel as hash-pinned decisions; verbatim duplicates become `SAME AS <path>`; the machine contract moves to `BRIDGE_MOTION_CONTEXT.json`. 31 949 characters (51 headroom). The skill itself is unchanged (byte-identical reference) |
