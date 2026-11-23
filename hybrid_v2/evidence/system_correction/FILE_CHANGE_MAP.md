# FILE_CHANGE_MAP — producers changed or added (baseline `9a2a9ad` → this branch)

| File | Old producer / role | New / changed producer | Failure IDs |
|---|---|---|---|
| `engine/art_bridge/errors.mjs` | BridgeError | N2 structured refusal fields on every error | all |
| `engine/art_bridge/art_families.mjs` (new) | — | `FAMILIES` (13), `resolveFamily`, `subjectFacts` | F045, F064 |
| `engine/art_bridge/method_applicability.mjs` (new) | — | `RULES` (80 executable predicates + phase), `applicability`, `operativeText` | F024, F025, F031 |
| `engine/art_bridge/art_contract.mjs` | `contractContext` (char-only, null), `requiredMethods` (char-only) | `resolveContractContext`, `validateMethodDecisions`, `validateTopics`, `validateAgreementUniversal`, `isGenericPrimitive`, `preGenerationGate` (universal), `gateForJob` (never null), `approveScope`, `scopeApprovalStatus`, `approveDesign` (any family), `requireApprovedContract` | F023–F027, F039, F045–F047 |
| `engine/art_bridge/witness_regions.mjs` (new) | — | `validateRegions`, `cropRegions`, `imageSize`, `witnessPath` | F027 |
| `engine/art_bridge/request_stages.mjs` (new) | `art_requests.mjs#packContractRequest` (removed) | `planStages`, `ENGINE_CONSUMERS` | F028, F050 |
| `engine/art_bridge/art_requests.mjs` | `compileArtJob` (contract optional), packing | `compileArtJob` (universal gate always, staged requests, STYLE_CONSTRUCTION_DECISION, detail budget, world_system), `dependencyDigest`, `learningContextFor` | F026, F028, F046, F048 |
| `engine/art_bridge/outbox_store.mjs` (new) | — | `materialize`, `writeOnce`, `writeCurrent`, `readCurrent`, `verifyGeneration` | F048 |
| `engine/tools/art_outbox.mjs` | `exportOutbox` (rmSync, doc.status) | content-addressed `exportOutbox`; CLI `review-story`, `review-direction`, universal `check-design`/`review-design` | F047, F048 |
| `engine/art_bridge/art_intake.mjs` | `submitJob` (`if (gate && …)`), FIT_RIG Ines, contact-frame feasibility | `submitJob` (authority first, staged chaining, TEST_STUB provenance), `fitInterfacesToMeasured`, all-frame feasibility + edge legality, `selectStageCandidate` | F007, F040, F046, F053 |
| `engine/art_bridge/source_method_causality.mjs` (new) | names only | `routeBeatMedia`, `allocateDetail`, `projectionGrammar`, `cameraSizedArtworkDemand`, `compileWorldSystem`, `unfamiliarTransferPlan`, `parallelStateLayout`, `generatorDecision`, `styleConstructionGraph` | F029–F031, F068 |
| `engine/art_bridge/art_review.mjs` (new) | — | `buildReviewPacket`, `recordArtReview` | F027, F033, F061 |
| `engine/art_bridge/repair_memory.mjs` (new) | — | `recordFailure`, `selectRules`, `matchingRulesDigest`, `ruleQualification`, `promoteToSkillRule` | F032, F034, F035, F064 |
| `engine/art_bridge/art_demand.mjs` (new) | fixed job list | `deriveArtDemands` | F008, F062 |
| `engine/art_bridge/contact_solver.mjs` (new) | `constraints.mjs` XY only | `solveContact`, `gripMorphology`, `balance` | F003–F005, F051, F052 |
| `engine/art_bridge/temporal.mjs` | position residual only | + post-FK orientation residual | F051 |
| `engine/art_bridge/deform.mjs` (new) | refusal only | `validateMorph`, `validateDeformMap`, `deformPoint` | F054 |
| `engine/art_bridge/motion_systems.mjs` (new) | — | `castShadow`, `validateTransformOwnership`, `validatePortal`, `validateViewTurn`, `compilePhrase`, `seededParticles`, `shutterSamples` | F009, F011, F018, F020, F021, F055, F056, F069 |
| `engine/art_bridge/method_trace.mjs` | verdict from export existence | evidence levels from the causal matrix | F049 |
| `engine/story/*.mjs` (new) | — | `mechanism`, `action_coverage`, `continuity`, `experience`, `narration` | F012–F017, F057, F065 |
| `engine/film/*.mjs` (new) | — | `film_revision` (revision + tiling), `segment_render` (chunks, receipt, defects), `qa_layers` | F041, F044, F058–F060, F066, F071, F072 |
| `engine/tools/art_bridge_film_qa.mjs` | CLI source authority, measured flag, PRODUCTION_PASS_UNDER_TEST_TRUST | render receipt verification, narration timeline, revision-bound shot QA, QA layers, TEST_PASS | F041, F044, F057, F059 |
| `engine/tools/art_bridge_qa.mjs` | — | shot QA records `film_revision` | F060 |
| `engine/tools/compile_film_contracts.mjs` (new) | — | film contracts compiled BEFORE art (called by `exportOutbox`): story, action coverage, continuity, attention, art demand, transform ownership, tiling, phrases, beat media, shadows, contact morphology/support, portals → `story/FILM_CONTRACT_REPORT.json` | F013–F018, F020, F062, F065 |
| `engine/art_bridge/state_router.mjs` | raster-only morph refusal | + homologous morph and deform-map validation on production state edges | F054 |
| `engine/art_bridge/constraints.mjs` | `solveContactGraph` XY only | + orientation residual / CONTACT_ORIENTATION_UNSATISFIABLE | F051 |
| `engine/tools/art_outbox.mjs` | — | + `review-art` (packet + verdict + repair records) | F027, F033, F034 |
| `engine/tools/build_failure_ledger.mjs`, `audit_trace.mjs` (new) | — | computed ledger; independent trace | D.3, O.9 |
| `schemas/failure_ledger.schema.json` (new), `schemas/motion_art_manifest_v2.schema.json` | — | ledger schema; audio narration timeline + script fields | D.3, F057 |
| `films/hv2_film001/handoff/build_production_graph.mjs` | FIT_RIG Ines only | FIT_RIG every rigged master from declared anchors | F007 |
| `films/hv2_film001/art_designs/ines_design.mjs` | bindings | 23 RequiredDesignDecisions with real witness regions, topics, detail regions (PROPOSAL) | F024–F027 |
| `engine/runtime/nu.js` | — | **unchanged** (sha256 773baf91…) | — |
