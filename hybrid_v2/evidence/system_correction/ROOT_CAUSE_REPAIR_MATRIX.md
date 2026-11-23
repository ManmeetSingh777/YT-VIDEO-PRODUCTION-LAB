# ROOT_CAUSE_REPAIR_MATRIX — system-correction directive (C0–C8)

Each row: original reproduction → producer root cause → generalized repair (source) → proof → unlike transfer. Before-evidence for the
P0.2 defects: `BEFORE/P02_REPRODUCTION.json` (12/12 reproduced on the live tree at `9a2a9ad`). Status per row is COMPUTED in
`FAILURE_LEDGER.json` from the executed TAP log — this document explains, it does not grade.

| Defect (directive B) | Reproduction (live, before) | Root producer & mechanism | Generalized repair | Proof | Unlike transfer |
|---|---|---|---|---|---|
| Contract only for character masters (F045) | P02-1/P02-2: 5/6 masters `null` context, 0 required methods | `art_contract.mjs#contractContext` returned `null` unless MASTER+CHARACTER; `requiredMethods` returned `[]` | `resolveContractContext` typed for all 10 state kinds; 13-family registry (`art_families.mjs`); 80 executable applicability rules (`method_applicability.mjs`) | U01, U03 | U02 (marine organism, volcanic world) |
| Fail-open compile/submit (F046, F063) | P02-3 request written with `NOT_EVALUATED`; P02-6 washer reached the provider stub (1 call) | `compileArtJob` accepted `contract=null`; `submitJob` gated only `if (gate && …)` | `compileArtJob` always resolves + asserts; `requireApprovedContract` (N3 precedence) runs in `submitJob` BEFORE provider discovery; stale generation / dependency refusals | U03 (spy = 0 calls for 10 refusals; positive control = 1 call), U06 | U01 (all six masters) |
| Generic placeholder requests (F026) | P02-5 washer request carried `USE F57–F80 METHOD ROUTING` + box/circle | skill builder substituted placeholder; no generic-primitive check | placeholder patterns refused; `isGenericPrimitive` (stock-primitive chains without functional construction) | U03, A02, A01 | A02/A03 |
| Story approval from `doc.status` (F047) | P02-7 `status:"ART_READY"` ⇒ "APPROVED" | `exportOutbox` inferred approval | story/direction receipts over file content (`approveScope`, `scopeApprovalStatus`); story approval needs a compiled story contract | U06, U03 | — |
| Destructive outbox (F048) | P02-4 prior compiled request deleted | `fs.rmSync(out/jobs|compiled)` | `outbox_store.mjs`: content-addressed generations, temp+rename, `.COMPLETE` hashes, atomic CURRENT; immutable record content only | U05, U04 | — |
| 32k packing, SAME AS pointers (F028, F050) | P02-8 31 949/32 000 chars, 14 pointers, no grounding | `packContractRequest` replaced method text by hashes/pointers | `request_stages.mjs#planStages`: full operative text + full decision per method, partitioned into ordered content-addressed stages (structure → surface → state edits), each naming its predecessor; Stage A brief = complete payload | A05, A01 | A05 (all 80) |
| Export existence as method proof (F049) | P02-9 `typeof m[exp]==="function"` decided status | `method_trace.mjs#consumerExists` | causal matrix (`SOURCE_TO_ART_F01_F80.json`) drives the level; export existence labelled smoke only; real fidelity EXTERNAL | A05 | — |
| Contact = XY only (F051, F003) | P02-10 `error_px 0` with reversed palm | `solveContactGraph` / temporal measured position only | temporal post-FK orientation residual (`CONTACT_ORIENTATION_UNSATISFIABLE`); `contact_solver.mjs` bounded DLS solver with oriented-wrist init, limits, root bounds, support; `gripMorphology` | M03, M02, M05 | M03 rotating target |
| Feasibility on contact frames only; FIT_RIG Ines-only (F053, F007) | P02-11 | `feasibilityFor` iterated contact intervals; plan set FIT_RIG for one asset | every action frame + state/view edge legality; FIT_RIG for every rigged master from declared frame anchors; `fitInterfacesToMeasured` family-generic | M10, R07, S3C-8 | R07 (machine hinge, organism arm) |
| Film QA trusts CLI source (F059) | P02-12 | `recordFilmRender` accepted `--source` | only `engine/film/segment_render.mjs#renderFilm` writes `RENDER_COMPLETION_RECEIPT.json` (frame manifest, revision, renderer, sampled re-render); claims recorded as `CLAIMED_RENDER_RECEIPT.json` and refused | P06, B3-4 | P02 |
| Missing semantic actions (F013, F014, F065) | REAL S02: "loads" + carried bag had no bag grip, trajectory or contained state | no semantic action layer | `engine/story/action_coverage.mjs` (typed ontology, sub-operations, possession, conflicts, orphans) | T02, T03, REAL S02 | T08 (scientist, octopus) |
| Inverted causality possible (F012, F016) | — (no mechanism evaluator existed) | no executable mechanism | `engine/story/mechanism.mjs` evaluator + counterfactuals + obstacle evidence | T01, T04 | T08 (SIR, orbital energy) |
| Continuity contradictions (F015) | — | no boundary state | `engine/story/continuity.mjs` computed exit/entry states + approved time jumps | T05 | unlike continuity |
| Inert direction / fake 3D (F011, F017, F018) | — | direction fields stored, not consumed | `engine/story/experience.mjs`, `motion_systems.mjs#compilePhrase` | T07, M12 | M12 underwater phrase |
| Narration estimates (F057) | — | `method:"measured"` field accepted | `engine/story/narration.mjs` + film QA: registered aligner, output file hash, script/audio hash binding | T06, P04 | — |
| Repair learning was words only (F032, F034, F035) | memory had 0 rules, no predicate | no engine-side learning | `repair_memory.mjs` (immutable records, predicate selection, conflicts, matching-rule digest, qualification needs real pixels) | L01–L06 | L03 |

## Conflicts found and how they were resolved (directive §0: report, do not silently choose)
1. **F46/F47 applicability vs the installed skill.** My first rule applied F46/F47 to every subject; the skill compiles F37–F50 only with a
   `world_system` object, and both methods' own triggers are scene/environment-scoped. Resolution: F46/F47 are environment-scoped; characters
   receive material/edge ownership from F02/F62 and detail from F33/F52.
2. **Provider prompt limit vs complete method delivery.** Resolved by ordered staged requests (no truncation). If a single method block plus the
   identity header cannot fit, the compiler refuses with `REQUEST_BUDGET_EXCEEDED` (art-director decision), never truncates.
3. **Witness observations cannot self-certify.** Regions are verified to exist on the real frames and are bound into the design-approval
   bundle; whether they show the claim is the human art director's decision (no HUMAN receipt exists).

## LIVE patterns reported by `INDEPENDENT_TRACE.json` and why they are not fail-open
- `art_requests.mjs` `contract = null` parameter: kept for API compatibility; with neither `film` nor `contract` the function THROWS `ART_CONTRACT_NOT_EVALUATED` (U03).
- `method_trace.mjs` `typeof m[exp] === "function"`: the smoke check, now labelled `EXPORT_EXISTS_ONLY_SMOKE`; it never sets a qualified level.
