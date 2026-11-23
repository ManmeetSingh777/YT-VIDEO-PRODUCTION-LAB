# P0.1 re-audit corrections + Stage 3 two-way art-to-motion contract — report

Inputs: `inputs/HYBRID_V2_P0_INDEPENDENT_REAUDIT.md` (B1, B2, B3 and hardening items), plus the Stage 3 architectural correction from the chat
instruction (the six Ines conflicts are quoted in `hybrid_v2/evidence/stage3_contract/ROOT_CAUSES_AND_CONTRACT.md`).

**Truth statement.** Every raster here is DIAGNOSTIC: capsule/box test shapes and the borrowed (unapproved) Ines design used only to test the compile path.
Nothing here is target art or evidence of artistic quality. No image provider was called. No design, story or master has a HUMAN approval.
`engine/runtime/nu.js` is byte-identical. No bulk production was started.

## Part 1 — P0.1 re-audit (code `0d9b324`, evidence regenerated at the packaging revision)

| Item | Earliest producer corrected | Failing-first | Real-pixel proof (`hybrid_v2/evidence/p01/P01_EVIDENCE.json`) |
|---|---|---|---|
| B1 canonical rect / affine | `engine/art_bridge/asset_geometry.mjs`: one `crop_to_canonical_matrix`; `canonical_rect` = bbox of the four transformed crop corners. Consumers: intake, emitter (`render.mjs`), camera footprint (`scene_graph.mjs`, exact quad coverage), transitions, loader invariant | `P01_REPRODUCTION_BEFORE.txt` | 640×900 at 0.5× → `[-20,-15,320,450]`. Pixel probes: 12 757/12 757 inside samples match, 0 of 400 outside painted. Footprint flags `[3600,3822]`: 1 262 400 sentinel px wide vs 0 pushed. Transition density 1×/2× mean diff 0.775, 0 sentinel |
| B2 underpaint ownership | plan contract `validatePlanContract` (`surface_underpaint` owner; underpaint must be BELOW its owner), enforced at `ingestPart` | `P01_REPRODUCTION_BEFORE_ADDED_TESTS.txt` | Elbow at 140°: 0 holes with the owned underpaint vs 255 with it hidden. Real Ines plan contract: forearm ↔ `ines_elbow_r_underpaint`; refusal without the link |
| B3 whole-film qualification | `engine/tools/art_bridge_film_qa.mjs`: coverage, manifest_production, registration_evidence, shots_qa, transitions, audio, render, human_film_review gates + a film receipt | `tests/art_bridge/p01_film_qa.test.mjs` | Positive qualification needs every gate. It fails today (no art, no narration, no human review), which is correct |
| Transparency | `art_intake.mjs#checkAlphaContract` (planned alpha vs decoded PNG). The request flag is now contract-owned too (Part 2) | p01 tests | decoded-alpha checks in the round trip |
| Registration evidence | `registration_evidence.mjs`: sidecar file copied next to the receipt, hash/reviewer/values compared, residuals **recomputed** | H2 tests | tampered sidecar / residual → refused |
| Provider idempotency | `submitJob` key = provider, model, endpoint, caps, size, transparency, mode, prompt, reference, witnesses; outputs kept as immutable candidates; one valid candidate promoted | H3 test | stub: two models → two keys; retry then resume |
| Approval history | `approvals.mjs`: append-only `reviews/HISTORY.jsonl`, `wx` receipts, unique ids, pointer cleared on non-approval. `reviewer_kind` HUMAN only via interactive TTY; DIAGNOSTIC otherwise; TEST_TRUSTED only under `ART_BRIDGE_TEST_TRUST=1` | H5 tests | production gates `requireHuman` |

## Part 2 — Stage 3 two-way contract (this revision)

Root causes (source level) and contract changes: `hybrid_v2/evidence/stage3_contract/ROOT_CAUSES_AND_CONTRACT.md`.
Tests: `tests/art_bridge/stage3_contract.test.mjs`. Before: `S3C_REPRODUCTION_BEFORE.txt` and `S3C8_REPRODUCTION_BEFORE.txt` (9/9 failing).
After: `S3C_TESTS_AFTER.txt` (9/9 passing).

| Conflict | Test | Result after |
|---|---|---|
| 1 F64 misbound (and F05/F52 mislabelled) | S3C-1 | `METHOD_BINDING_MISMATCH:F64/F05/F52`. Each binding carries the decision its own *Build* clause requires, with the source clause sha256 pinned |
| 2 rig-dictated generic geometry | S3C-2 | `UNGROUNDED_DESIGN_DECISION`. Six high-impact shape decisions each need an attached witness, an observation, an unlike contrast and an identity reason. Rig words and landmark numbers in shape fields are refused |
| 3 molecular block absent/placeholder | S3C-3 | `MOLECULAR_DECISIONS_MISSING` / `MOLECULAR_DECISIONS_PLACEHOLDER` (the F80 schema example text is refused) |
| 4 view mismatch | S3C-4 | the plan now carries the rig's `threeq_r` canonical view. A `front` design → `CONTRACT_VIEW_MISMATCH` |
| 5 alpha mismatch | S3C-5 | `transparent_background: true` is set by the bridge from the motion contract (override recorded in `BRIDGE_REQUEST_CONTRACT.json`). Design `OPAQUE` → `CONTRACT_ALPHA_MISMATCH` |
| 6 too few methods / no repair lessons | S3C-6 | applicability derived from family + motion contract: F01 F05 F06 F52 F58 F59 F61 F62 F64 F65 F66 F67 F79 F80 required; F68/F69/F71/F73 not. Repair memory: still 0 rules, reported, never fabricated |
| F design approval | S3C-7 | the gate passes, but `submitJob` → `BLOCKED_ON_DESIGN_APPROVAL` with 0 provider requests until a HUMAN `design` receipt exists |
| E art determines rig | S3C-8 | FIT_RIG: arm 25% shorter is **fitted** (limb ratio 0.75, `pixels_changed:false`). Planned grip → `UNREACHABLE_IK` frames 200–300 (181.8 px vs 146.8 px reach) → `INFEASIBLE_REQUIRES_RESTAGING_OR_NEW_POSE_ART`; dependents `BLOCKED_RIG_FIT_INFEASIBLE`. An approved restaged plan → `FEASIBLE` |
| unsuitable design with full text | S3C-9 | rear/occluded family for a gripping, turning actor → `FAMILY_INCOMPATIBLE_WITH_MOTION`; missing `profile_turn` → `CONTRACT_STATE_MISSING` |

Evidence: `stage3_contract/INES_GATE_REPORT.json` (revised design: PASS, `BLOCKED_ON_DESIGN_APPROVAL`, required figure height 882 px, design authored at 1040 px);
`INES_AUDITED_DESIGN_GATE_REPORT.json` (the audited design: 32 failures); `INES_REQUEST_DELIVERY.json`; `RIG_FIT_RECEIPT_DIAGNOSTIC.json`.

### A finding made while implementing (#8): provider prompt budget
With all 14 applicable methods bound, the skill compiler (`prepare_first_pass.py`, limit 32 000 characters, no truncation allowed) refused the faithful
Ines design at 62 937 characters. The full method texts alone come to 27.5k. The old bridge also pasted the machine rig contract (`hybrid_v2_motion_context`, 4.2k)
into the artist prompt, which is the rig-into-art leak this correction forbids. Resolution, in `art_requests.mjs#packContractRequest`, applies only to contract-authored designs:
- full source method text for the design's molecular `chosen_methods` (master: F01 F06 F64 F65 F66). For derived state edits: F06 F65 F66 F67 (identity is carried by the attached approved master pixels).
- every other bound method is still delivered, as its decision, with the clause hash recorded in `BRIDGE_REQUEST_CONTRACT.json → method_delivery`.
- decision values that appear verbatim elsewhere in the prompt are replaced by `SAME AS <path>`, and nested decisions are compact JSON.
- motion reaches the artist only as `motion_requirements`. The machine contract stays in `BRIDGE_MOTION_CONTEXT.json`.
Result: 31 949 / 32 000 characters. **The headroom is only 51 characters**, so any added prose in the Ines design will be refused by the skill compiler rather than truncated. This is a real constraint for the art director, not a defect to hide.

### Not done / not claimed
- No design approval, no story approval, no provider call, no real art, no repair rule. The first real canonical-master request is **not submitted**.
- The Ines design is Claude's proposal. Its grounding observations come from viewing the three native witness frames; an art director must confirm or replace them (`review-design --human`).
- FIT_RIG is applied to `ines_master` in the plan. The other masters (washer, ledger, worlds) keep their existing registration mode.
- Feasibility re-solves every contact frame. It does not yet check view-switch or expression-state timing against fitted landmarks.
