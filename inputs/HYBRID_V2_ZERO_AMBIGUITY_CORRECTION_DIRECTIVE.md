# MOTION-NATIVE HYBRID V2 — PRESCRIPTIVE SYSTEM CORRECTION DIRECTIVE

**To Claude Code. Execute against the live existing `E:\MOTION_NATIVE_STUDIO_V1` repository.**

**Purpose:** Repair the reusable production system that converts an approved, factually correct educational-film idea into an Experience-Director-directed, 1920×1080, 60-fps, genuinely animated, sonically synchronized, original, visually sophisticated 120-second film. Its artistic authority is the installed five-film F01–F80 construction system and native source witnesses; GPT authors/edits artwork; the preserved Neutrino runtime executes approved image-backed art, mechanical graphics, rigs, state changes, cameras and effects. This is a system correction, **not** a request to patch a laundromat scene.

**This document supersedes ambiguous instructions in earlier prompts.** Preserve and satisfy the prior `MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md`, its appendices and acceptance cases, the Experience Director V1, the complete F01–F80 source and skill, and the source-audited P0/P0.1/Stage 3 evidence. Where these disagree, report the exact conflict; this correction governs *safety, fidelity, approval and qualification*. Do not silently choose.

## A. Non-negotiable truth and execution contract

1. **Fix the producing system.** For every defect, provide: `failure_class`, `applicability_predicate`, `invariant`, `producer_function`, `root_mechanism`, `changed_source_lines`, `reproducing_test`, `positive_proof`, `unlike_transfer_proof`, `negative_test`, `regression_ids`. A test of a specific shot may *expose* a bug but must not be the permanent fix. No character-name, shot-ID, laundromat, canvas-coordinate, one-off prompt or one-off timing branch in the generalized repair.
2. **No false green.** Distinguish `NOT_IMPLEMENTED`, `IMPLEMENTED_UNQUALIFIED`, `QUALIFIED_ON_DIAGNOSTICS`, `QUALIFIED_ON_REAL_ART`, `QUALIFIED_FULL_FILM` and `EXTERNAL_APPROVAL_REQUIRED`. A missing proof never becomes `PASS` by a default. Test passes may qualify only what they executed.
3. **Actual production beats labels.** A source-method ID, a populated field, a file, an exported function, a report, a changed hash, a passing unit test, a stub-provider image or 60-fps metadata is not proof of sophisticated art or convincing motion. Positive evidence means actual source-conditioned native pixels/frames and observable intended behavior.
4. **Do not change preserved foundations without cause.** Record baseline HEAD, working-tree status, file hashes, `nu.js` hash, packages, `CLAUDE.md`, `HANDOFF.md`, source art, all active skills and spec revisions. Preserve user edits; no reset/checkout, no unscoped deletion, no new competing studio, no generic replacement renderer. Prefer wrappers around byte-identical `nu.js`.
5. **No visual substitutions.** Claude may generate test fixtures and timed-animatic diagnostic shapes under explicit `DIAGNOSTIC_ONLY` provenance. It may not draw final generic faces, limbs, eyes, tree silhouettes, shadows, diagram illustrations, background fills or replacement subjects to hide missing GPT artwork. Real artwork is created/edited through the designated GPT authority and attached native witnesses.
6. **Engineering is deterministic; art is authored within approved constraints.** Do not force rig coordinates onto the art design. Do not let the artist invent physical feasibility or story truth. Film requirements precede design; approved artistic topology precedes *measured* rig fitting. Extra states are derived from approved art. Original design choices are explicit and reviewed, not misrepresented as one uniquely dictated source rule.
7. **Never claim that every future stochastic output is perfect.** What must be made reliable is the rejection/repair system: bad artwork never enters approved production, an unsupported operation fails closed, every repair updates the relevant producer, and an unfamiliar transfer demonstrates that it learned. If external human approval, live provider art or recorded narration is absent, implement the executable machinery and return a precise external-dependency stop—not a fake production pass.
8. **Do not stop at a test count.** Continue through all authorized code work, actual diagnostics, regression, documentation and a new independently auditable ZIP. Do not commission/bulk submit real art, invent approvals, approve a story or render a faux final film. Request explicit human actions at the real boundary.
9. **Implementation approach:** First write failing regression tests from each observed bug; repair one producer at a time; execute them and unrelated existing suites; then construct positive and unlike transfer fixtures. A defect remains open until all applicable evidence exists. No `skip`, `todo`, test-trust loophole, swallowed error, widened tolerance, deleted assertion or broad `catch` is an acceptable closure.

## B. What the last audit actually shows; preserve these facts

**Archive provenance:** Last audited package `HYBRID_V2_P01_CORRECTION_AUDIT.zip`, archived source snapshot reportedly HEAD `9a2a9ad`, code delta `e4bd309`. Claude reported 75/75 tests and diagnostic Stage-2 browser proofs. An independent extraction reproduced only the local 9/9 `tests/art_bridge/stage3_contract.test.mjs` tests; other browser suites were not independently re-run due to a missing local `puppeteer-core` dependency. No real GPT-generated production art, human-approved master, measured narration or complete film was demonstrated. Treat the ZIP as a *snapshot*, not authority over the live working tree.

**P0 that must never regress:** (1) 74 ArtJobs lost frame-range context; (2) six masters were typed as cutouts; (3) identity/master/parts linkage and canonical registration incomplete; (4) approvals were plain unscoped strings; (5) image provider wasn't wired; (6) QA could falsely pass with missing audio/art review. **P0.1:** (B1) canonical bbox ignored scale/rotation; (B2) underpaint lineage lost; (B3) no whole-film positive qualification path. Their diagnostic repair is valuable but not proof of artistic/film readiness.

**Current directly observed P0.2 defects:**

- `engine/art_bridge/art_contract.mjs::contractContext` returns `null` unless `state_kind === "MASTER"` **and** `identity.kind === "CHARACTER"`. `requiredMethods` returns `[]` for every noncharacter identity. Five of the six master ArtJobs (`washer_master`, `ledger_master`, `laundromat_far`, `drum_in`, `street_far`) therefore have no two-way art/motion gate. Their compiled `BRIDGE_REQUEST_CONTRACT.json` reports `gate.status = "NOT_EVALUATED"`, `method_delivery = null`. `ines_master` is the only gated master.
- `engine/art_bridge/art_requests.mjs::compileArtJob` accepts `contract=null`, creates `NOT_EVALUATED` and calls `assertGate` **only** if `contract` exists. `engine/art_bridge/art_intake.mjs::submitJob` blocks bad contracts **only** with `if (gate && ...)`; `gate=null` means a nongated submission may proceed once the provider is configured. THIS IS A FAIL-OPEN SECURITY/QUALITY BOUNDARY. `art_outbox.mjs::check-design` can also return a null report.
- A compiled washer master request still carries a generic “cabinet box → door ring (circle) → glass disc” design and a molecular placeholder `USE F57–F80 METHOD ROUTING`. An operative method decision or positive design cannot be represented by such placeholders. Do not special-case the washer: eliminate the **entire class** of family-specific bypass and fallback.
- `validateBindings` verifies source hashes, required keys and enumerated values, not that the decision actually instantiates the clause's visual construction. `validateGrounding` checks that witness paths and explanation strings exist, not that the claimed observation is true in the supplied pixels. `packContractRequest` removes `design_grounding`, delivers full source text only for selected methods and others as abbreviated decisions. The Ines request is **31,949/32,000** characters. There is no safe budget for changed art constraints. A hash is not a method's operative instruction.
- `engine/tools/art_outbox.mjs::exportOutbox` infers story approval from `doc.status !== "PLANNED"` and deletes/recreates the entire `out/jobs` and `out/compiled` trees with `fs.rmSync`. The approved source revision, compiler output and provider request must instead be immutable/content-addressed and tied to actual approval receipts. `submitJob` needs a verified story gate.
- `engine/art_bridge/method_trace.mjs::consumerExists` checks a module/function export; `checkMethodUses` also regards such existence as a consumer. This cannot certify the 80 methods' decisions changing requests, actual pixels or rendered motion. `F33/F47/F53/F77` density and `F38/F60` projection consumers are specifically missing/incomplete.
- `engine/art_bridge/constraints.mjs::solveContactGraph` solves a source socket onto a target XY. No orientation-constrained wrist, palm/handle fit, finger closure/layer-order proof, visual contact patch or whole-body counterbalance is solved by zero XY error. `checkRigFeasibility` covers contact frames, not all view/expression/action-state frames. `FIT_RIG` exists for Ines, but the other family masters remain similarity registration only.
- `REGISTERED_MORPH` lacks true homologous topology validation, `EXPLICIT_DEFORM` lacks an approved map, cast-shadow occluder/receiver binding is unimplemented, and full film segmentation and multi-shot sound assembly are unproved. The QA/report path has not been exercised with actual final art. An actual approval, review or provider receipt must never be synthesized by an automation test environment.

**Other known defects from the prior code-art/style/film audits:** primitive generic oval faces and tube limbs, weak character anatomy/hands/heads, wrong eye/mouth scale and expression hierarchy, incorrect 90° IK branch/unreachable targets, hand/star/prop overlaps, arbitrary material-independent crescent shadows, invented/unregistered coordinates, inert style/direction fields, false F-method learning claims, reference/style observations not converted into executable construction, subject-specific art code disguised as a transferable rule, code-only picture-book imagery, static environments, one-at-a-time actions, fake depth/overused whole-world 3D movement, abrupt cuts, unmotivated camera, weak transformations/attention, unclear facts/metaphors, unreconciled obstacles, 134 recorded but inert direction decisions, and repairs that affect old samples but not unlike future first passes. Treat these as failure classes requiring active producers and tests, not as historical complaints to omit.

## C. Work order and gates

**C0. Baseline/failure inventory; C1. universal fail-closed contracts; C2. source-to-art construction; C3. semantic truth/action/experience/continuity; C4. art manufacturing and adaptive registration; C5. complete body/prop/scene motion; C6. audio/render/QA; C7. cross-world repair learning; C8. complete test/evidence export.** Never move an artifact to a downstream *approved* state while an upstream required gate is missing. You may implement future stages while upstream external evidence is pending, but mark the real-art and whole-film status honestly.

All interfaces below are **required behavior**. Preserve compatible public APIs; add typed wrappers or migration adapters rather than breaking existing callers. Identify exact live-repo locations in `FILE_CHANGE_MAP.md`; if a referenced path moved, locate its current equivalent with `rg` and report the mapping. Do not invent a new path and leave the old producer active.

## D. C0 — restore factual baseline and create a real failure ledger

1. Read the entire current `CLAUDE.md`, `HANDOFF.md`, manifest schema, runtime and renderer source, `hybrid_v2/evidence/OPEN_DEPENDENCIES.json`, every P0/P0.1/Stage3 proof, source F01–F80, original source-witness manifest, installed skill and both spec files. Compare hashes against prior ZIPs. The live tree prevails for what currently executes; historical audits prevail for *bugs that must have regression coverage*.
2. Produce `hybrid_v2/evidence/BASELINE_NEXT.md`: HEAD, dirty files, file hashes, installed versions and executable commands; classify every existing test as `UNIT`, `DIAGNOSTIC_IMAGE`, `BROWSER_MOTION`, `PROVIDER_STUB`, `REAL_PROVIDER`, `HUMAN_REVIEW`, `FULL_FILM`. Document exactly what ran now versus only archived.
3. Generate `hybrid_v2/evidence/FAILURE_LEDGER.json` from a checked-in schema, not manually optimistic prose. Each row: stable ID, failed invariant, root producer, evidence input file/line/frames, impacted operations, generalized applicability predicate, specific design/algorithmic repair, required positive tests, unrelated transfer fixtures, evidence status and reviewer. **No row may be marked `QUALIFIED` without links/hashes of all applicable proofs.** The ledger must include every `Txx` case in Section M; append new discoveries, never silently remove.
4. Trace actual CLI/JS entrypoints from `art_outbox export` → compile → submit → candidate selection → intake → approval → rig → frame → FFmpeg → QA. Detect duplicate competing implementations. Establish one source of truth for each stage and instrument every transition with immutable request/asset/approval hashes.
5. Write regression tests **before** changing each module. They must fail for the known defective archived behavior and succeed after repair. Preserve a failure reproduction in evidence. Every test uses temp directories and restores state; do not run export against existing user outboxes until preservation is proved.

## E. C1 — universal typed art/motion/design contract, with no bypass

**Change the actual producers:** `engine/art_bridge/art_contract.mjs`, `art_requests.mjs`, `art_intake.mjs`, `engine/tools/art_outbox.mjs`, `approvals.mjs`, relevant schemas and tests. Do not add a second gate that the production submission path does not call.

### E1. Universal contract construction

- Replace `contractContext(): object|null` with a typed `resolveContractContext({film,doc,job}): {ok:true,context}|{ok:false,error}`. `null`, `undefined`, `NOT_EVALUATED` and an unrecognized family are **hard errors** for *every* production ArtJob. Validate existence of the identity, master lineage, action/frame requirements, stage, movement representation and authoritative source files. A derived state inherits the exact approved master contract and additionally must provide its own state/edge constraints. All of `MASTER`, `PART_OR_STATE`, `UNDERPAINT`, `WORLD_EXTENSION`, `TRANSITION_PLATE`, `EFFECT_STATE`, `SYMBOL`, `TYPE`, mask and clean plate are covered.
- The registry must define typed requirements for at least: `ACTING_HUMAN`, `DISTANT_HUMAN`, `ANIMAL_OR_ORGANISM`, `MACHINE_OR_MECHANISM`, `PROP`, `INTERIOR_WORLD`, `EXTERIOR_WORLD`, `NATURAL_WORLD`, `DIAGRAM_OR_INFO`, `ABSTRACT_OR_MICRO_WORLD`, `EFFECT_OR_MATERIAL`, `TRANSITION_OR_CAMERA_PLATE`, `TYPOGRAPHY_OR_SYMBOL`. A family taxonomy is for picking *construction operations*, not pre-selecting stock silhouettes. Unknown family => `UNSUPPORTED_ART_FAMILY`. No default to `CHARACTER`.
- Required methods derive from exact source F01–F80 applicability predicates **and** subject topology, narrative role, camera/view demands, materials, visibility, world context, motion representation, contacts and transitions. For humans, keep F01/F05/F06/F52/F58/F59/F61/F62/F64/F65/F66/F67/F79/F80 as applicable; for nonhumans include actual F08/F09/F10/F11/F12/F21/F27/F33/F38/F40/F45/F47/F49/F53/F55/F57–F63/F68–F80 according to their *source* Build clauses. Do **not** paste these IDs as a universal set: declare the rule and executable condition for each of all 80, then assert a reason for each required/not-applicable result. A world can never get zero required methods merely because it is not a character.
- Define `RequiredDesignDecision` with `method_id`, `source_clause_sha256`, `source_clause_text`, `applicability_evidence`, `question_from_build_clause`, `specific_decision`, `visible_construction_operation`, `input_dependencies`, `output_art_components`, `falsification_condition`, `source_witness_pixel_regions`, `unlike_witness_contrast`, `consumer_receipt`. A nonempty phrase is insufficient; require an operation and an inspectable visual result. If any field is absent, `ART_DESIGN_UNSPECIFIED`, not a generic fallback.
- Define `ArtMotionAgreement` with `identity_id`, `shot/frame spans`, `view family`, `rest/canonical pose`, `motion representation`, `alpha/color/scale/resolution`, `parts and hidden paint`, `joints and contact semantic anchors`, `draw/occlusion ownership`, `required pose/expression/gaze/material/light states`, `camera footprint/overscan`, `state transition edges`, `art revision` and `direction revision`. Distinguish **artistic shape** (author controls) from **mechanical interface** (requirements only before drawing; measured coordinates only after delivery). Cross-check both directions; art may demand different fit, but engine may not replace art.

### E2. Fail-closed entry points — implement these exact invariants

```js
// Behavioral specification: adapt names only when necessary to fit existing exports.
function requireApprovedContract({film, doc, job, requestHash = null}) {
  const resolved = resolveContractContext({film, doc, job});
  if (!resolved.ok) throw typedError(resolved.error);
  const design = loadVersionedDesign(resolved.context.designRef);
  const gate = preGenerationGate({design, job, ...resolved.context});
  if (gate.pass !== true) throw typedError('ART_CONTRACT_REFUSED', gate.failures);
  if (!verifyHumanReceipt('story', gate.storyBundle).ok) throw typedError('STORY_APPROVAL_REQUIRED');
  if (!verifyHumanReceipt('direction', gate.directionBundle).ok) throw typedError('DIRECTION_APPROVAL_REQUIRED');
  if (!verifyHumanReceipt('design', gate.designBundle).ok) throw typedError('DESIGN_APPROVAL_REQUIRED');
  if (requestHash && gate.compiledRequestSha256 !== requestHash)
    throw typedError('STALE_COMPILED_REQUEST');
  return Object.freeze(gate);
}
```

The exact division of review scopes may follow existing receipt infrastructure, **but none may be inferred from `doc.status`, filenames, environment variables, one `human:true` boolean, or a JSON string**. Only a verified review receipt bound to the content hashes and reviewed scope can enable production. Test-trust may run diagnostic fixtures only. Real provider calls must reject it unconditionally.

1. `compileArtJob(...)` must call the universal resolver itself; never accept `contract=null` in production. Its signature may retain the option for backward compatibility, but missing context returns/throws `ART_CONTRACT_NOT_EVALUATED`; it must never write a provider-ready request. `assertGate` must always execute. In development, `dryRun` may emit a diagnostic report without submitting or claiming production readiness.
2. `submitJob(...)` validates context **before discovering a paid provider or selecting generate/edit**. It reopens actual design, source, script/direction, approved master and compiled manifest from disk; recomputes all digests and proof-required statuses. `gate==null` must throw `ART_CONTRACT_NOT_EVALUATED`. Refuse if `BRIDGE_REQUEST_CONTRACT.json` missing, `gate.pass!==true`, `method_delivery` incomplete, `design approval` unverified, `prompt_sha` changed, `source hashes` stale, `story` unapproved or `testTrust` enabled.
3. Every derived job validates the approved canonical master, exact edit reference bytes/hash, registration ancestry, state/edge coverage, and both the master contract and its own operation. Do **not** require every derived state to redo its art director's identity decision; do require state-specific view, deformation, contact, occlusion, source-attached edit and approval. No flat PNG replacement for a planned articulated action.
4. `review-design` and `check-design` must work for all known families; `null` is a refusal, not success. `approveDesign` must be generalized from character-only masters, and bound to the exact immutable design and gate evidence. Content changes invalidate approval and all dependent requests.
5. Remove `doc.status !== 'PLANNED'` story-approval inference. Introduce a verified story/experience approval bundle over script facts, direction shot score, action/meaning contract, active revisions and supporting sources; requests cannot start before that receipt. The laundromat story is **still a proposal**.

### E3. No destructive or mutable outbox rebuild

- Replace `fs.rmSync(out/jobs, {recursive:true})` and analogous `out/compiled` deletion in `exportOutbox` with content-addressed immutable versions, e.g. `jobs/<jobId>/<dependencyDigest>/job.json` and `compiled/<jobId>/<dependencyDigest>/...`. A small current-pointer index may be atomically updated only after all records are written and verified. Keep prior versions, provider responses, candidates, approvals, receipts and source request bytes. No old request can be overwritten by a newly compiled one with different content.
- Build a dependency digest from actual script/direction/skill/source clause revision, design, motion context, approved master, witnesses, repair memory and provider size/capabilities. A same-digest rerun is idempotent. Changed digest => new immutable generation and stale downstream approvals, **not silent reuse**. A result promoted from provider is only an unapproved candidate until registration and human review.
- Candidates must have validated PNG decoding, dimensions, real alpha where required, correct color space, hash, prompt/source provenance, safe path, explicit selection. No saved stub image may masquerade as GPT art; refusal stays resumable. Expensive calls require verified authorization and idempotency before any network request. Human reviewer identity may never be auto-minted.

### E4. Mandatory regression/transfer tests

`U01`: all six existing masters produce a **non-null** contract status; intentionally incomplete design of each must be `BLOCKED`, never `COMPILED` or `SUBMITTED`.

`U02`: test at least two new unlike families absent from laundromat fixtures (e.g., marine organism with flexible appendages; volcanic cross-section with matter flows); each routes distinct source methods, evidence and motion obligations.

`U03`: absent context, stale source hash, missing story receipt, missing human design receipt, invalid agreement, placeholder molecular block, changed master pixel, missing witness image, unknown family, unsafe provider capability, zero methods and `NOT_EVALUATED` all refuse **before** provider stub spy's call count increments. The spy must assert **zero** calls.

`U04`: compile a valid design, mutate prompt/design/skill/master/repair memory/direction separately; every relevant mutation causes a new dependency digest and stale approval; unchanged rerun yields the original digest and preserved old bytes.

`U05`: exporting an outbox twice leaves original compiled requests, candidates and approval receipts byte-identical and present; no whole-directory deletion.

`U06`: design review intentionally rejected (human or test fixture) cannot be bypassed with `doc.status='ART_READY'`, `human:true`, `ART_BRIDGE_TEST_TRUST=1` or an edited pointer. Test-trust cannot reach live provider.

## F. C2 — turn ALL F01–F80 from source observations into effective artistic operations

This fixes the core earlier failure: impressive method names and numerical rig constraints producing ordinary ovals/tubes, an oval face, generic world geometry, tiny facial stickers, universal crescent shadows and superficial palettes.

### F1. Build a source-conditioned, family-aware construction compiler

1. For **each F01–F80** record the canonical source clause hash and full text; distinguish roles `IMAGE_AUTHORSHIP`, `STRUCTURE`, `MOTION`, `DIRECTION`, `EVIDENCE`, `REPAIR`. Parse the method's **Build**, conditional routing, negative examples and actual observable construction requirements. Never let an irrelevant method be automatically ignored: generate a documented source-derived applicability decision.
2. Use the five-film reference corpus as evidence, not as reusable scene templates. Each applicable method receives at least two **unlike** reference observations and specific positive/negative contrast when its source demands it. Show pixel/native screenshot regions, viewing scale, major shapes and surface relationships; keep real image attachments and verify their digests. Reference observations must be confirmed from pixels by an art reviewer; a text string cannot self-certify that a source image shows a given thing.
3. Compile a **subject-specific design mechanism**, not decorative adjectives. Every brief declares: semantic identity/function; original silhouette and functional mass hierarchy; front/back/near/far/topology/hidden surfaces; subject appropriate face or feature grammar; material-specific color/light/edge treatments; distribution of detail by projected scale and attention; pose/turn/expression/contact state ancestry; world projection and parallax; motion and output/alpha/overscan dependencies; what visible evidence would falsify the planned look.
4. *Do not place skeleton coordinates, rectangle dimensions or stock primitives in the artistic construction field.* Only pass view, scale, contact and movement demands as constraints. After artwork arrives, registration measures the real coordinates and rig fitting adapts. The drawing must remain art-led while being motion-compatible.
5. Preserve complete operative decisions to GPT. In `packContractRequest` remove the 32k-limit workaround that replaces Build rules with hash strings or opaque path pointers. Supply each applicable source **operative instruction**, its conditional choice and exact design decision, required pixel witnesses and visual requirements. If a complete request exceeds model/provider limits, partition into **ordered, separately verified, versioned stages**: (a) contract decision brief, (b) canonical creation request, (c) source-attached state edit request; preserve a canonical immutable design payload. Do not silently truncate, replace with `SAME AS path`, drop grounding, remove method clauses, or let the image model invent omitted obligations. Each stage must be content-addressed and explicitly reference its predecessor.
6. A method binding proves **causality** only when changing its decision changes the intended component/request and, when pixels are available, the corresponding output region. For each method implement a real consumer, controlled perturbation and before/after render/asset evidence. `consumerExists` is useful as a smoke test only; it cannot return method `QUALIFIED`. For a method intended to alter only workflow/evidence rather than pixels, demonstrate its actual downstream decision or refusal changing.
7. Specifically implement the missing actual operations: projection grammar F38/F60 with camera/plane/crop correspondence, density and mark budgets F33/F47/F53/F77 by native projected size and semantic attention, F19/F20 medium routing per beat, F29 parallel-state comparison layouts, F34 generator decision logic, F49 world asset compilation, F55 camera-sized artwork/overscan demand, F56 repair memory and F80 source-attached first-pass delivery. All must have causal tests; do not mark these as present merely because `composeShot`, `compileArtJob` or `routeMedium` exists.

### F2. Required engineering data and tests

Persist `STYLE_CONSTRUCTION_DECISION.json` per job with a typed `region_graph`: nodes for silhouettes, functional submasses, features, materials, edge/shadow owners, depth planes, detail regions, source-grounded decisions and expected output layers. Each record has `method_id`, `source_hash`, `consumer`, `subject-specific instruction`, `positive contrast`, `forbidden generic replacement`, `target native region`, `method output digest`. No invalid empty strings, self-referential labels, fake `"F57–F80 METHOD ROUTING"`, `"whatever the model chooses"` or copied characters.

`A01` character: change anatomy/face-design rules and verify the **part hierarchy, rendered head/eyes, limbs, distinctive hands** change while invariant motion sockets remain semantic; no forced tubes or universal eye stickers.

`A02` machine: make a rotating machine with authored front/rim/aperture/inside, material reflections, mechanism-dependent states; reject circles pasted on a generic box when source/role demands specific perspective.

`A03` unlike organism/natural world: branch geometry/topology/material methods from source; show that human garment/head methods do not leak into branches, leaves, limbs or organic texture.

`A04` ledger/data world: distinguish mathematical marks and true labeled relationships from artistic symbols; important values drive visible geometry, and graphical surface style comes from GPT art, not arbitrary renderer shapes.

`A05` per-method positive causal suite: all 80 methods have `source clause -> conditional decision -> actual producer/consumer -> changed meaningful output -> negative unlike check -> evidence` or `EXTERNAL_PROVIDER_BLOCKED`. A blank or unexecuted graph path cannot pass.

`A06` high and low projection scale, different visual regions, palette/material variants and mixed lighting produce appropriate **different** detail, mark count, contour/shadow and world-depth treatment. A single universal texture/shadow template fails.

`A07` positive native-style reviewer compares artwork to unlike source witnesses at intended screen size and in actual motion; outputs art-specific defects with crop/region, construction cause and explicit edited source decision. A GPT image that satisfies schema but looks generic is rejected.

## G. C3 — executable story truth, Experience Director, actions, timing, continuity

**These are first-class producers, not four new QA booleans.** Build/extend `engine/story/` or the existing equivalent, called by film handoff compilation **before** art dependencies. The output must be machine-consumed by the art inventory, motion planner, camera composer, sound cue builder and QA. Any proposal lacking required information remains unapproved. Preserve Experience Director V1 as the authority for what an audience should *feel, understand, notice and anticipate*, separate from F-methods' how-to-draw responsibility.

### G1. Typed story-claim / causal-mechanism contract

- Every significant factual claim has `claim_id`, exact approved script span, source citation/verification status, domain-specific entities/units, causal hypothesis, preconditions, variables, state transitions, predicted observables, counterexamples, uncertainty note where applicable, and `viewer_should_infer`. Every metaphor/diagram has `mechanism_id`, linked claim(s), precise semantic mappings, source variables, equations/logic, permitted simplification and adversarial counterexample. Unverified claims are `FACT_CHECK_REQUIRED` and cannot be silently rendered as truth.
- Implement a deterministic `evaluateMechanism(inputs,time)` used by the animated graphical representation **and** by truth tests. A narrative visualization may be stylized but may not invert causality. Example class (not scene hardcode): for an activity-dependent input `n(t)`, a per-event income/cost term is zero when no events occur; a time-dependent obligation can continue independently. If the diagram wrongly stops *all* costs when activity stops, it must fail a counterfactual test. Include unlike mechanism fixtures (infection/exposure and orbital energy, for example) to prove generality.
- Every multi-obstacle narrative must have explicit initial conditions, each obstacle, attempted intervention, resolved/unresolved status, and audience-visible evidence. A scene cannot declare `resolved` merely because dialogue says so; the mechanism state must support it. An unsupported emotional beat/metaphor/claim may be rejected or revised for human approval, never silently fabricated.
- Factual review, story approval and directional approval are separate hash-bound receipts. Altered facts invalidate graph, art dependencies, narration alignment and downstream approvals. No own-work self-grading by the same generation pass as the only critic.

### G2. Semantic action-coverage compiler

Build `compileActionCoverage(script,direction,shotScore,worldState)`. Its semantic layer must parse/require **every viewer-observable verb/physical state change** in approved direction and narration: actor, object, recipient, origin, destination, physical preconditions, resulting possession/state, action duration, visible contact and evidence. Use a controlled action ontology with typed mechanisms, never depend solely on keyword matching. Allow author-added action classes only through the same typed capability registry and executable consumer tests.

Mandatory action sub-operations for interactions: `APPROACH/ATTEND`, `REACH`, `CONTACT`, `GRIP`, `SUPPORT/TRANSFER`, `MOVE/TRANSFORM`, `RELEASE`, `SETTLE`, `RETRACT`; instantiate only those physically applicable, and require a typed reason for omission. Every sub-operation identifies participating socket/material/contact surface, frame interval, representation, required art, observable motion and expected end state. Ownership/possession and occupancy of props must be conserved through actions and cuts; teleportation is an explicit error.

For example, **any** script instruction “load [container] with [object]” must compile a usable sequence: supply/support → acquire → grip → move through aperture with occlusion/collision → release → contained state → withdraw. If a bag, hand, loaded prop, opening, silhouette, near/far layer or frame span is missing, emit `UNCOMPILED_SEMANTIC_ACTION`/`MISSING_ART_ASSET` with an exact dependency. Never jump from “container open” to “contents inside” and call it motion complete. This is a reusable *verb mechanism*, not a fix for Ines or a washer.

`compileActionCoverage` must return **bijection-like traceability**: each mandatory script/direction action maps to one or more executable action IDs with observed effect, and every executable action maps to an authorized direction/physics effect. Orphan action (unmotivated hand/camera movement) and missing action both fail. Check simultaneous action actors and conflict resolution (one hand cannot grip two unrelated moving props unless allowed by geometry).

### G3. Physical/narrative state continuity graph

- Introduce `ShotBoundaryState`: for every actor/prop/world element record pose, view, identity, location/orientation, carried objects, hands/contacts, door/aperture/open/closed state, mechanism phase, environmental time, light, camera side/screen direction, layering, audio narrative position and approved time jump. Compute shot exit from executed state tracks; validate next shot entry by matching semantic IDs and transforms.
- A deliberate cut may change view/time/scale, but must declare the time jump, perceptual bridge, continuity invariants and reason. A continuous portal/camera transition must match world mapping and optical/occlusion state each frame. Do not “fix” contradictions by arbitrarily making a door open in one shot or adding an unexplained invisible action.
- Regression fixture: outgoing shot expects door `OPEN` yet incoming event graph starts `CLOSED` and only opens later => **must reject**. A valid explicit time-lapse/insert or changed staging can be approved via the direction process. Use a second unlike carry/possession and weather/lighting continuity fixture.

### G4. Audience experience, attention and activity are real control inputs

- Compile Experience Director's viewer experience into `attention_beats` (primary focus, secondary simultaneous action, emotional/cognitive beat, intended reveal, recognition hold, attention switch, payoff) and assign actor/object/camera/lighting/sound owners and frame spans. Each event must consume its intent, not just store it in metadata. Scene world life is authored as meaningful foreground/midground/background activity with separate motion owners; no stock endless bobbing/particles used to claim lively staging.
- Ensure change of **meaning** drives visual invention (a physical metaphor's shape/transform/relationship expresses a claim), not just decorative coins/arrows/labels. Compare intended implication with viewers' likely visual reading. A direction field with no consuming track triggers `DIRECTION_DECISION_INERT`.
- Implement pacing tools for scene energy, overlap, contrast, anticipation, hold and transitions. The rule is not “always move everything”; purposeful stillness for viewer comprehension can be correct. But sequences cannot pass if they devolve into separate isolated motions with no designed simultaneous relationships or movement phrases.
- Explicitly forbid fake 3D orbit/push of a flat unlayered world merely to add movement. Camera movement must have a viewer purpose, layer-depth contract, sufficient authored pixels, correct optical/visual method and screen readability.

### G5. Actual narration and timed animatic dependencies

- Define one immutable `NarrationTimeline`: approved script hash, narrated audio file hash, measured forced word alignment (`start/end` seconds and frames, method, confidence), linked claim/beat IDs, critical reveal events, SFX/music cue markers, recognition holds and latest allowable edit points. No estimated times on critical cues. Revise audio/script => invalidate every dependent shot timing and approval.
- Compile a *diagnostic timed animatic* from semantic action/attention contracts before real art expenditure. Diagnostic shapes may prove timing only, with visible `DIAGNOSTIC_ONLY` status. Play it with real/temporary narration only as labeled; test that speech, interaction, reveal and comprehension beats fit 120 s. Do not substitute these shapes in the final film.
- `T01`: contradictory/counterfactual mechanisms fail; `T02`: missing semantic verb fails; `T03`: simultaneous conflicting hands fail; `T04`: causally incomplete obstacle fails; `T05`: shot boundary contradiction fails; `T06`: changed script/audio invalidates word-linked frame anchors; `T07`: inert direction field fails; `T08`: unlike factual mechanism and action fixtures use the same compiler; `T09`: timed animatic clearly retains diagnosis-only provenance and cannot pass art/film gates.

## H. C4 — artwork demand, manufacturing, lineage, and art-driven registration

### H1. Demand every necessary *visible state*, not a fixed count of pictures

- Walk all 7,200 planned frames, all sub-operations, camera paths, view faces, expression/gaze/light states, depth bands, effects, occlusion and render scales. Derive a dependency graph: canonical identity masters → registered parts/hidden paint → poses/expression/grip/view/deformation states → transition plates/masks/overscan → assembled scene. Each demanded state records **why**, frame intervals, related object, required source image and which motion representation consumes it. No arbitrary “7 images maximum” and no assumption that the current 74 requests are sufficient.
- Determine representation per operation before artwork: `RIGID`, `ARTICULATED`, `REGISTERED_CELS`, `REGISTERED_MORPH`, `EXPLICIT_DEFORM`, `PROCEDURAL`, `CAMERA_WORLD`, `TRANSITION`. If motion asks for physically unavailable back surfaces, fingers, cloth folds, profile or machine geometry, manufacture it through a source-attached GPT edit or choose a genuinely supported representation with **direction reapproval**. No invented 2D backside from a front PNG; no generic generated-in-code patch.
- Canonical characters, animals, machines, worlds, props, symbols, diagrams and transitions each have their own *appropriate* layered manufacturing graph. A world may be built from overlapping planes, not an artificial skeleton. A noncharacter mechanism can still need hinges/contact sockets and FIT_RIG. Render-size/overscan and alpha/mask obligations apply to every family.

### H2. Exact master/derived-state submission protocol

1. Compile **approved** story/experience/motion requirements, then a full source-conditioned original master brief that specifies functional silhouette, native view, visual construction, scale, material/lighting/edge ownership, required articulation interfaces and no arbitrary pivot coordinates.
2. Have the authorized GPT image generator create canonical master pixels with native source witnesses attached. Record request, model/capabilities, prompt and image hashes, candidate set and output receipts. Never invent API availability; if absent, status `WAITING_FOR_REAL_GPT_ART` with exact user action.
3. Verify pixel dimensions, alpha, color and actual visible art quality in an **independent art-director review** at intended size. Compare identity/shape, materials, depth, detail distribution and vibe with unlike sources; reject visually generic/stylistically inconsistent images even if schema compliant. No AI-generated review receipt disguised as user approval.
4. Register canonical master by measured landmarks **on delivered pixels** (semantic labels); retain source dimensions and an invertible affine `raster_to_canonical`. Calculate transformed corners/quad, canonical bbox, foot/head center, material planes and silhouette masks from that transform. No provisional rig geometry controls the artwork.
5. Fit rigs/hinges/camera planes to those pixels. Run complete action-state feasibility (see I); if infeasible, return a typed required-state/part request to GPT with approved master bytes attached. Never shrink, stretch, slide or substitute art to hide mechanical failure.
6. Manufacture every derived part/view/pose/underpaint/mask/deformation state via exact approved-master pixels as editable attachment; require preserved canonical identity and registered shared landmarks. Each output must include lineage hash, on-master overlay, difference preview, source-attached edit prompt, registration residuals and native-size QA strip. View/pose drawing cannot be re-created freehand from a text description without master source.
7. Human review master → part → state → edge → scene assembly as appropriate; content-hash scope. Altering an ancestor invalidates all dependent approvals and composite/camera/whole-film receipts. Preserve immutable before/after.

### H3. Coordinate/registration invariants and exact tests

- All coordinates explicitly tagged `RASTER_PX`, `ASSET_LOCAL`, `CANONICAL_IDENTITY_PX`, `WORLD_PX`, `SCREEN_PX`; source crop `[x,y,w,h]` and matrices are versioned. Each point/rect transformation is performed by the shared affine math library. For a rectangle, transform its **four actual corners**, then derive a bbox. For a rotated rectangle, never multiply only width/height by a nominal scale.
- For a 640×900 image at 0.5 uniform scale and no rotation, `canonical_rect` must be 320×450 (after origin shift), not 640×900. At nonzero rotation, bbox is computed from all four transformed corners; vertex projection/inverse round-trip must meet numeric tolerance. Use nonuniform scale, negative origin and cropped source too.
- Distinguish bitmap alpha bounding box, painted region silhouette mask and planned camera footprint. Rect coverage alone cannot certify that the visible art actually fills a needed camera pixel. At every frame compute inverse camera footprints for each depth plane, compare with the painted alpha/overscan region, and produce mask/crop evidence.
- `underpaint_asset_ids` and hidden-surface links from the original plan persist through ArtJob → provider request → intake → manifest → state routing → renderer. At extreme bend/view, background holes must be filled by **approved** underpaint (or natural real body surface), not by arbitrary polygons.
- Preserve distinct near/far layer and color-space ownership. Never treat straight alpha as premultiplied, use a color key as alpha, share depth-band IDs ambiguously, or attach camera and object transforms to one node.
- `R01`: source→canonical→source inverse round-trip, translation/scale/rotation/crop; `R02`: B1 640×900→320×450 and rotated bbox; `R03`: B2 hidden underpaint survives every stage; `R04`: master changed => dependent edit/reference/approvals stale; `R05`: derived view/pose family retains measured landmarks and canonical identity; `R06`: camera mask footprint covers all rendered frames including transitions; `R07`: two unlike world/machine/organism families fit their own interfaces, not the Ines rig; `R08`: negative missing/back-face/hidden-paint/depth owner/alpha/colorspace cases correctly refuse.

## I. C5 — animate APPROVED artwork with real body/prop/world mechanics

**Extend the actual engine consumers:** `constraints.mjs`, `rig_binding.mjs`, `state_router.mjs`, `temporal.mjs`, `asset_state.mjs`, `scene_graph.mjs`, `svg_parts.mjs`, `transitions.mjs`, `lighting.mjs`, `audio_cues.mjs`, `art_bridge_qa.mjs` and relevant schema/scene compiler. Preserve `nu.js`; do not place synthetic final art in these modules.

### I1. Correct transform evaluation and ownership

For each frame `f`, compute in a pure deterministic pass:

1. Resolve immutable film/script/direction/asset revisions and shot/transition timeline; reject missing assets and illegal state paths.
2. Evaluate analytic/baked physical world tracks and pose roots (all keyed to integer frame, not previous render invocation).
3. Evaluate joint local transforms; fit art attachment matrices measured on approved pixels; transform semantic anchors through parent rig/world/camera matrices.
4. Resolve contacts **in world space**, then solve constrained chain/body pose and derive palm/finger closure and prop attachment/near-far layers. Recompute forward kinematics and report residuals after constraints (do not report the target coordinate as a pretend solved error).
5. Resolve gaze/expression/garment/lighting/deformation/state/underpaint and occlusion; validate legal pose/view/state edges and alpha/image ancestry.
6. Resolve camera on an independent parent wrapper, then material planes, world-depth parallax and masks; compose actual approved raster/vector assets.
7. Apply intended transition correspondence, event/sound frame anchors and final output color conversion.
8. Emit structured per-frame metrics and rendered pixels. Frame `f` must equal direct random-seek evaluation of `f` and sequential replay to `f` within exact pixel/approved codec tolerance; version and random seed are inputs.

**Do not** write camera transforms to the same SVG node as object transforms. Assign `camera → world depth plane → rig root → joint → art image/cel` with exactly one transform owner per node. A whole-character master is reference art and may appear as a legitimate whole-body cel only in a state explicitly approved for that representation; it cannot satisfy articulated arms/fingers merely by having a file.

### I2. Contact = position + orientation + support + morphology + visibility

- Define `ContactConstraint`: source semantic socket and **contact patch** (palm/finger/thumb or foot sole, etc.), target surface/axis/normal/size, target world pose, frame interval `[start,end)`, expected relative orientation, rotation limits, normal/tangent, grip/release phase, penetration allowance, closure state family, near/far occlusion, support/load, prop attachment mode and residual tolerances. Replace any production meaning of contact as XY equality only.
- Implement a **bounded articulated pose solver** (analytical two-bone initialization followed by constrained optimization or an equivalent proven solver). Optimization variables include permitted shoulder/elbow/wrist/root/torso/pelvis/leg rotations/translations; hard constraints include joint limits, limb-length invariance, designated planted-foot pose, ground support, approved contact surface position/orientation, no unintended penetration, no unapproved image deformation. Soft terms include pose proximity, smoothness, performance/direction and body balance. Return `UNREACHABLE_IK`, `CONTACT_ORIENTATION_UNSATISFIABLE`, `FOOT_SUPPORT_UNSATISFIABLE` or `ART_STATE_REQUIRED` with closest feasible bounds rather than clamping or adding tubes.
- The historical 90° IK branch error must have a regression with multiple quadrants, both bend branches, zero-length/degenerate/reach limits, joint-limit violation, orientation-bound tests and forward-kinematic re-projection. `solveTwoBonePosition` returns radians today; consuming code must correctly convert, never interpret radians as degrees.
- Represent **physical grip** with staged finger/hand art: approach, open hand, patch contact, progressively wrapped fingers, supported hold, release and withdrawal. Distinguish thumb side/handle axis, near/far fingers and hand/prop layering. A 0-pixel socket residual must still **FAIL** if the palm is reversed, fingers miss the handle, object clips into the hand or the sleeve detaches.
- Body balance: compute center of mass/support projection or a stylistically approved support proxy. Movement of torso/pelvis/feet/shoulders must follow the character's reach/push/pull/lift impulse. Approved motion may exaggerate physics for style, but it must have an authored support rationale; no planted feet sliding, dislocated neck or frozen torso. Do not incorrectly apply humanoid balance to machines or organisms; their own contact/support model governs.
- Prop constraints must define ownership/transfer and attachment/release frame; moving handle/door rotates the target socket; the hand follows through articulated solve, not independent keyframe drift. For collisions, validate intended overlap/order and **visual contact masks** on actual rendered pixels in addition to geometric penetration.
- Solve at *every affected frame*, especially the entire contact interval and frames just before/after start/release. Re-solving only contact snapshots is insufficient. Also validate states needed by face/view/gaze/fold/light changes and the whole movement phrase.

### I3. Real deformation, folds, turns, expressions and state transitions

- `RIGID`: only when rigid transfer does not break approved art silhouette/joins. `ARTICULATED`: source-approved parts plus hidden underpaint; joints must preserve material continuity. `REGISTERED_CELS`: source-attached pose/view/hand drawings, registered landmarks and legally connected frames. `REGISTERED_MORPH`: **actual homologous path topology** (identical subpath count/order/closedness, command structure or validated reparameterization, winding orientation, correspondence and self-intersection behavior); visually inspect intermediate frames. Disallow raster crossfade pretending to be path morph. `EXPLICIT_DEFORM`: requires approved mesh/control points/UV or equivalent deformation map, constraints, source art and intermediate topology/alpha proof; no generic warping.
- A turn to rear/side is never generated by rotating a front PNG as if it were a 3D model. Require approved view family/cels with correct revealed surfaces, identity and correspondence. Animal limb folds, cloth twist, hair uncovering neck and hand topology changes have their own source-attached states. Missing state => `UNSUPPORTED_VIEW`, `UNSUPPORTED_STATE_EDGE` or `MISSING_ART_ASSET`, triggering an exact new ArtJob and requalification.
- Expressions/gaze require registered `expression`, `eyelid`, `pupil`/mark, brow, mouth, silhouette and visibility states appropriate to **the subject's original face mode**. No fixed smiley-face overlay or generic big white eyes. The system must enforce eye/face bounds and visual consistency through changes, not just switch files.
- Sleeves, skirts and forearms: derive deformable/pivot states from approved cut edges and material shape; when a bend creates a gap or overlap that a rigid piece cannot cover artistically, request an approved elbow fold/underpaint/whole-pose cel. No code-created capsule filler.
- Shadows and illumination: implement occluder/receiver relationships, depth ownership, surface-dependent material response, actual light direction/state and optionally masks/painted light variants; no same crescent applied to coat, metal, hair and environment. If an effect is unsupported, declare requirement and demand approved art/effect representation.
- Evaluate legal state edges through full transition frame strips: shared landmarks, shape continuity, visual identity, alpha/occlusion and motion. “Approved start/end PNGs” do **not** certify the in-between. If topology changes, require a specific cel/deformation sequence or explicit readable cut.

### I4. Noncharacter machines, diagrams and worlds are first-class moving subjects

- A machine has mechanical parts, hinge axes and true/approved state changes (door, aperture, drum, loading, spinning mechanism). The moving part's surface/occlusion and variable depth are actually rendered. Motion is not a generic circle rolling on an unrelated static plate.
- A diagram has true variables and equations from G1, published units/axis roles and GPT-designed visual symbols/material. The renderer can procedurally place labels, lines and marks *as approved diagram primitives* but cannot invent misleading relationships or graphical style unrelated to source.
- A world has authored depth planes, parallax scales, optical projection, screen-space/background/foreground activity, occluders, lighting and camera footprints. Moving the whole backdrop does not equal a lively scene. World elements and camera are independent, and scale/depth changes cannot expose missing art.
- Effects/water/smoke/cloth may use approved sprites, cel-state cycles, source-authored vector/particle design or controlled deformation. Color, density and animation are linked to relevant F-methods and the desired scene mechanism. Random particle presence alone does not qualify as meaningful action.
- A “move through the portal” must use `OUT → MIDDLE → IN` with a shared aperture curve/mask, rim occluder, real parallax/depth correspondence, enough overscan, coherent object motion across the transition and actual transition-state assets when perspective changes. A zoom-cut disguised by opacity is not allowed.

### I5. Whole-action choreography, not a bag of independent keyframes

- Introduce `ActionPhrase` with semantic intent, primary/secondary motion owners, anchor/target, force/response, viewer focus, approved style intensity and phases `ATTENTION → ANTICIPATION → PREPARATION → CONTACT → ACTION/FORCE → CONSEQUENCE → FOLLOW_THROUGH → SETTLE → NEXT_INTENT`. Phases are conditional, not all obligatorily of equal duration. `ActionPhrase` **produces** synchronized tracks for body, hands, face/gaze, prop, camera, secondary cloth/hair, sound and environment. Cues share integer frames and true dependencies.
- Apply physically and artistically appropriate easing/spacing, arcs, overlap and squash/stretch **only with compatible approved art**. Required acceleration/impulse changes propagate through contact graph; do not move arm, then door, then face with arbitrary pauses unless direction demands it. Include intentional holds where thought/readability requires them.
- Build active background/world choreography and transitional flow guided by Experience Director; avoid repetitive one-action-per-shot slideshow, empty static environments and arbitrary wandering virtual 3D camera. Camera framing preserves readable eye-line, gesture, silhouette and key metaphor at the exact spoken beat.
- Every movement phrase has actual pixel/video proof at full playback speed, not just still frames and socket metrics. An independent reviewer can reject awkward, ugly, boring or illegible motion, and the failure must trace to reusable phrase scheduling/fit/art-state producers.

### I6. Concrete acceptance tests, not only “scene passes”

`M01` disjoint transform ownership; positive world/camera/object compositing and negative double transform. `M02` multi-quadrant IK/90° regression, unreachable/limits, both elbow branches, FK reconstruction. `M03` orientation-constrained grip while a target rotates; wrong palm/reversed fingers **fail despite zero XY error**. `M04` near/far prop/finger and underpaint ownership, native alpha crop proof. `M05` support-shifting, planted feet, torso compensation and no foot skating. `M06` full-view turn requiring registered views: forbidden single-PNG shortcut. `M07` legal cel/morph/deform path plus all invalid topology/absence cases. `M08` nonhuman machine hinge and wheel motion with source-approved surfaces; organism with nonrigid limbs. `M09` cast-shadow occluder/receiver and material-specific light changes. `M10` all-frame (not snapshot) contact/state feasibility. `M11` portal OUT/MIDDLE/IN with alpha seam/overscan, pre/during/post strips. `M12` coherent action phrase and unlike action sequence in a different world. `M13` deterministic random-seek pixel equality and correct initial state with seeded particles. `M14` deliberately altered source image/landmark/view/state invalidates old rig/preview approvals. `M15` no final art fallback ever appears when one state is absent.

## J. C6 — real timed production, audio, rendering and honest qualification

### J1. Production compilation and segmented rendering

1. One `FilmRevision` binds approved script/Experience Director/direction, F skill/source witnesses, art/design/identity/state approvals, motion/physical plans, audio sources, compiler/runtime and film canvas. Use a Merkle-like digest or explicit SHA-256 graph; all outputs list every upstream digest that influenced them. Nothing inherits a stale “approved” flag after any dependency changes.
2. Film shot and transition intervals **tile exactly** integer frames `[0,7200)` at 60 fps, with no duplicate ownership or missing frames. The global timeline is the authority; frame `f` is `[f/60,(f+1)/60)`. Audio cue frames derive from measured word offsets; no floating rounding disagreements or estimated critical speech timings.
3. Implement bounded-memory segments/chunks with clean resource unloading. Preserve analytical world state, baked physics, particle seeds and time state across boundaries. Rendering frame `5400` alone equals rendering it after `0..5399`; restarting a segment cannot reset a prop/drum/particle phase. Record chunk start/end, capture code, stage dimensions, art hashes, runtime hash, seeds, source/repro command, frame hashes and completion result.
4. Render actual approved 1920×1080 images at 60 fps using current Neutrino/Chrome/HyperFrames-compatible path; record visual sentinels, blank/black/duplicate frames and intershot alpha edges. Deterministic compositing and color/alpha are mandatory. Do not render a synthetic diagnostic world and label it film production.
5. Encode with FFmpeg using exact frame input, correct timebase/codec, measured mixed narration/SFX/music; generate a temporary video, `ffprobe` it, then atomically publish the final MP4 only if all checks pass. Require 7,200 frames, 120 s nominal duration, 1920×1080, exactly 60 fps, correct sound stream and decoded audio/sample timing. Human art review is additional, never replaced by `ffprobe`.

### J2. Sound and frame attention

- Narration recording is **real approved audio**. Alignment produces a word-level timeline with source/audio hashes and method/confidence. Resolve every critical cue/reveal to the approved words; voice edit forces dependent recompile. Optional captions use measured words and a verified font. Sound effects arise from physical events and have exact event frame and spatial/loudness ownership.
- Compare when spoken meaning arrives, when the explanatory mechanism actually changes, when the camera draws attention and how long the viewer has to recognize it. Reject merely technically synchronized yet misleading or illegible beats. Audio levels/clipping, effects timing, cut ambience and segment joins need real waveform and playback review.
- Time stretching to force audio to fit is not silently permitted; adjust the authorized edit or seek approved narration revision. No “no audio stream but QA pass” and no silent estimated alignment.

### J3. QA proof layers (all separately named)

`SCHEMA_PASS`: typed links, hashes, graph, approval checks. `MECHANICAL_DIAGNOSTIC_PASS`: numeric rig/transition/contact/60fps on labeled diagnostic art. `REAL_ART_MOTION_PASS`: *approved* provider pixels animated across a difficult action with visual review. `UNLIKE_TRANSFER_PASS`: same producers pass on unrelated subject/world. `FULL_FILM_REVIEWED`: all 7,200 frames, audio, joins, continuity, claims and whole-look human review. Only then `PRODUCTION_PASS`; report the exact failing layers otherwise.

**Harden `art_bridge_film_qa.mjs`**:

- Film render receipt must be emitted **by the actual render completion path**, not accepted solely from a user-supplied `--source ART_BRIDGE_CAPTURE` string. Associate frame manifest (all frame hashes, chunk receipts, owner revisions), actual MP4 and audio hashes and independent ffprobe. An arbitrary MP4 cannot be rebranded as approved output by recording it.
- Shot QA must include current-script/direction/motion/audio/source/asset digests, not merely `tested_asset_hashes` and a `gates` object. QA produced on a different direction/pose/camera/audio revision becomes stale.
- Continuous transition must verify actual rendered optical/mask/asset-frame evidence as well as anchor residual. Reprojection residual near zero does not imply no blank pixels or perspective pop.
- Audio QA must verify hashes, exact cue/word association, sample duration/offset and sound playback. “Measured” is a declaration requiring evidence from a real alignment process; simply setting `method:'measured'` on JSON is not proof.
- Human artistic, motion, story and final-film reviewers must attest the **actual viewed evidence**, bind to current revisions and cannot be substituted by automation's own `human:true`. A failed review remains a production failure. Test-trust fixture can only say `TEST_PASS`, never `PRODUCTION_PASS` and must not activate provider calls.
- Film art scan must detect assets still tagged `DIAGNOSTIC_ONLY`, missing approved state edges, unsupported effects, proxy artwork and stale registration. Require at least one real-art production authorization to escape diagnostic status, and a full non-stub source chain to qualify final film.

`P01` 7,200 frames exact and all shot/transition interval joins; `P02` chunk restart determinism/seed/state, forced crash/resume; `P03` changing asset/script/direction/audio/runtime invalidates old QA/render; `P04` real narration measured alignment, changed word timing repositions event or blocks; `P05` no audio, wrong fps, black frame, blank camera edge, stale assets, frame gap, invalid alpha all fail; `P06` synthetic/stub video cannot become production via CLI source flag; `P07` commentary/emotion/claim and actual visual timing review on native 60-fps playback; `P08` positive whole-film certification path with complete synthetic **test** fixture only yields `TEST_PASS`; production pass requires genuine external evidence and human review. `P09` unlike explanatory mechanism and human acting passage both qualify at source resolution and full speed.

## K. C7 — true reusable repair learning, not scene-specific correction or cosmetic memory

The repair engine is part of the production loop from **the first artwork job**. It must not begin at zero merely because no one has completed an edit yet: initialize source-derived rules separately from empirically qualified repair rules. A new rule becomes globally applicable only after positive/negative transfer evidence.

### K1. Exact repair record and producer mutation

Every failure, regardless of source (script, skill, provider art, registration, motion, transition, audio, QA), creates an immutable record:

```json
{
  "failure_id": "stable id",
  "failure_class": "general type, not a scene name",
  "applicability": "machine-readable predicate over new jobs",
  "invariant": "observable condition that must hold",
  "producer": "actual module#function and source revision",
  "root_mechanism": "specific incorrect logic/data/representation choice",
  "before": {"input_hash": "...", "frames_or_pixels": ["..."]},
  "repair": {"changed_operation": "...", "source_diff_hash": "..."},
  "after": {"output_hash": "...", "frames_or_pixels": ["..."]},
  "counterfactual": {"unlike_subject": "...", "test_id": "...", "result": "..."},
  "regressions": ["..."],
  "status": "UNRESOLVED | IMPLEMENTED_UNQUALIFIED | TRANSFER_PROVED | QUALIFIED_REAL_PRODUCTION"
}
```

Actual function: `diagnose -> identify earliest producer -> patch typed operation -> rerun original -> run unlike positive -> run adversarial negative -> record hashes -> update applicable first-pass compiler -> verify novel first pass`. If artwork is wrong, do not merely ask GPT to “make it better”; identify which source-to-construction decision, subject family, planned state or reference contrast was defective and **change that reusable control**. A local image edit can repair a deliverable, but does not by itself qualify a general rule.

### K2. Repair-memory applicability and contradiction handling

- Each rule stores verified condition keys, scope, evidence quality, exceptions, priority and source provenance. Select a rule for a new ArtJob only if its predicate matches. Do not apply a human-face/garment rule to a machine or leaf; do not infer universal material shading from one sleeve.
- If a rule conflicts with F-source, approved direction, identity or a qualified counterexample, stop and report `REPAIR_RULE_CONFLICT` for review; do not silently choose a convenient default.
- A new first-pass request must include applicable proven rules *before generation*, and its compiler receipt lists rule IDs, exact changed request/region semantics and hashes. Demonstrate two untouched unlike fixtures with and without memory, showing correct **first-pass** improvement when actual provider art is available.
- The system must learn *methods*, not copy a previous film's characters, color palette, camera path, metaphors, scene layout or particular coordinates. Every rule must be explicitly conditional and falsifiable.
- Fix historical false “learning”: a text summary, changed prompt, five named methods, 134 direction fields, 8/8 pack-change renders or a ledger claiming `IMPLEMENTED` cannot be counted as improved source-conditioned artistic competence unless actual novel pixels and operating behavior exhibit the effect.

`L01`: record a failure, repair producer, reproduce original positive and unrelated case. `L02`: a second first pass **without** local scene patch consumes matching rule and visibly changes expected output. `L03`: nonmatching subject receives no rule. `L04`: contradictory rule blocks instead of choosing. `L05`: no missing/zero real-art evidence can mark artistic learning qualified. `L06`: repair memory/source update invalidates affected compiled requests/approvals; unaffected cases remain stable.

## L. C8 — test harness, cross-subject proof and no-game evidence

### L1. Fixture diversity and holdouts

Tests must not be written only against the laundromat script or one character. Construct at least these **unrelated semantic fixtures**, with separate design/motion/visual requirements:

1. **Character-and-object physical acting:** a scientist handles a hinged containment vessel, transfers a sample, shifts weight, changes expression and turns profile. Tests human silhouette/face, finger/prop orientation, sleeve states, identity, view change, gaze and audio.
2. **Nonhuman organism:** an octopus-like animal grips and releases an irregular object while its soft limbs deform; unique nonhuman topology, materials, visible backside and underpaint. Tests no humanoid default and correct deformation/cel representation.
3. **World/machine transition:** a weather observatory with a moving mechanical shutter, atmospheric depth, daylight change and camera passage through an aperture. Tests architectural art, projection grammar, lighting, masks, overscan, source-grounded environment and world-life.
4. **Mathematical/causal explanation:** a compartmental population/energy-flow diagram with units, changing values, fixed/variable flows and time-based obligations. Tests truth-to-pixels causal logic, diagram style, simultaneous events, attention and labels.

These are **test descriptions**, not new master art or scene-specific production patches. Create authored *diagnostic fixtures* to prove code mechanics; actual qualified style art must come from the authorized GPT source process. Include at least two additional counterfactual/negative fixtures per class. Use seeded randomized valid layouts/coordinates so a hidden Ines/washer literal cannot pass.

### L2. Adversarial mutation suite

Each test is a separate failure-injection case; assert the expected structured error and zero unauthorized side effects:

- Delete the design, story receipt, source method, witness, canonical master, derived underpaint, face profile, hand grip frame, portal middle, camera overscan and narration one at a time.
- Change one upstream script claim, direction beat, word duration, image byte, image size, pivot, alpha, output size, projection, render scale, rig joint/limit, contact orientation, light material owner, source hash, repair rule and compiled prompt at a time; each must invalidate **only appropriate descendants**, not unrelated assets.
- Corrupt mask, rotate crop, reverse alpha, switch near/far, duplicate SVG ID, put camera and actor transform on same element, introduce circular rig ownership, wrong IK bend branch, unreachable target, different topology, unapproved face swap, unmeasured word alignment and a one-frame segment seam.
- Force a provider rate-limit/error, duplicate retry, two candidate outputs, wrong output alpha, unknown provider capabilities, no credentials, forged approved status, test-trust on, stale receipt, missing file. No paid call before authorization and no destroyed previous candidates.
- Force render interruption, nondeterministic particle/random state, stale cached frames, wrong frame count, drifted audio, no sound stream, illegal codec and altered MP4 after certification. Each must fail honestly and resume reproducibly.

### L3. Positive proof cannot be a diagnostic short circuit

For each defect class, require evidence sequence:

1. **Before:** deterministic reproduction of failure with input, producing function and native visual effect (when applicable).
2. **After:** same fixture now works because a generalized producer changed; source diff and expected consumer path shown.
3. **Transfer:** unlike family/story/world/scale/camera/material with no scene-specific patch, same invariant holds; negative counterexample still correctly rejects.
4. **Production:** actual GPT/source-attached art and full-speed animation where artistic quality is claimed; independent human approval for visual quality. Without provider/approval, status stays `IMPLEMENTED_UNQUALIFIED` and the **engineering work still needs completion**.

Mechanical proofs must include numeric metrics **and** representative full-resolution rendered strips/video. Use consistent camera, layer and alpha settings when comparing. Tolerance values must be declared from actual coordinate domains/visual risk and frozen **before** looking at outputs. Never widen them or replace an endpoint frame with a better one to make a suite green.

### L4. Exact test execution policy

- Preserve every existing Stage-1/2/3/P0/P0.1 test and fixture. Add suites `universal_contract.test.mjs`, `source_method_causality.test.mjs`, `semantic_action_coverage.test.mjs`, `story_mechanism_truth.test.mjs`, `shot_continuity.test.mjs`, `art_ancestry_and_registration.test.mjs`, `full_contact_solver.test.mjs`, `motion_phrase.test.mjs`, `transition_render.test.mjs`, `film_revision_and_qa.test.mjs`, `repair_transfer.test.mjs` in the existing test layout. These names are required deliverables unless the exact existing equivalent already tests the entire specified behavior; map such reuse in report.
- Use the repo's lockfile/environment and Chromium/Puppeteer setup. Run `node --test tests/art_bridge/stage3_contract.test.mjs` plus *all* prior nonbrowser tests, then fresh new suites and the real Chrome browser suites. Capture stdout/stderr/exit, installed versions and seeds. Do not omit failing tests or claim 75/75 means the full system passed.
- Build rendered frame strips and MP4 diagnostics. Every negative needs a failure log. Every positive needs actual consumer output/proof. A per-method trace must distinguish `export exists` from `decision changed execution` and from `real artistic fidelity seen`.
- Do not leave `TODO`, `NOT_EVALUATED`, `PASS_PENDING`, hardcoded `false`, placeholder molecular, no-op consumers or benign default fallbacks on a production reachability path. Use `rg` to enumerate such paths and add them to the ledger with status; test-only placeholders are allowed only in isolated diagnostics and named as such.

## M. Consolidated historical failure-class closure matrix

Every row below is mandatory, including failures that were **reported fixed** in P0/P0.1. The proof IDs reference earlier sections. Implement a machine-readable matrix with a `FAIL/PASS/EXTERNAL_DEPENDENCY` status and paths to source/tests/evidence; no self-claimed green rows. The example film names and image parts are regression inputs, **not special-case repair targets**.

| ID | Failure class and required systemic invariant | Owner / minimum evidence |
| --- | --- | --- |
| F001 | Prior code-art generic faces/oval heads and sticker eyes; original identity-specific face topology and scale-dependent feature hierarchy | F; A01/A07, unlike character real-art review |
| F002 | Tubular limbs, poor neck/torso/garment, disconnected hands and elbow gaps; art-driven parts/cels/underpaint preserve designed silhouette | H/I; R03/M04/M06, full-speed native render |
| F003 | Weak hands/grip/palm/near-far prop, including old star/hand overlap; contact patch, orientation, finger closure and order | I; M03/M04 visual proof |
| F004 | 90° IK branch, unreachable/limit clamping, incorrect frame of reference; constrained FK/IK refuses wrong solve | I; M02 quantitative/visual proof |
| F005 | Rigid puppet with frozen torso, foot slide, no weight or anticipation; support solver and movement phrases | I; M05/M12 |
| F006 | Unregistered hand-entered pivots/coords and whole-PNG assumption; measured canonical geometry and complete art family | H; R01/R05/R07 |
| F007 | Ines-specific FIT_RIG and other masters only SIMILARITY; every family fits semantic interfaces to actual pixels | H/I; R07/M08 |
| F008 | Missing art views/backside/deforming cloth/hand/facial states; per-frame coverage demands approved states | H/I; M06/M07 |
| F009 | Generic crescent shadows/same material treatment; material owner and cast-shadow relation | F/I; A06/M09 |
| F010 | Flat, empty/static backgrounds; world depth, activity, material/projection and attention | F/G/I; A03/M08/M12 |
| F011 | Excessive fake 3D / moving whole world, camera conflicts; per-layer camera optical purpose and ownership | G/I; M01/M11 |
| F012 | Shallow or inappropriate story metaphor, false economic flow; causal graph with counterfactuals | G; T01/T08 |
| F013 | Script describes a visible action absent from events (e.g., loading), no prop state; semantic action compiler | G; T02/T03/T08 |
| F014 | Missing transfer/holding/releasing/collision operations; complete sub-action and ownership transitions | G/I; T02/M03 |
| F015 | Outgoing open/incoming closed door mismatch and other continuity errors; computed boundary state | G; T05/T08 |
| F016 | Multi-obstacle story leaves obstacles unresolved; claim/obstacle state and visible resolution | G; T04 |
| F017 | 134 Experience-Director decisions inert or weak attention/energy; actual consumers and perturbations | G/F; T07/A05 |
| F018 | Motion is slow, sparse, one action at a time, poor simultaneity; multi-owner phrase scheduling | G/I; T07/M12 |
| F019 | Static world and no transformations/payoffs; action/mechanism consequence observed on pixels | G/I; T01/M12 |
| F020 | Slideshow-like cuts, pose jumps, camera aperture pop; approved continuous transition representation | H/I; M11/R06 |
| F021 | Single view falsely treated as 3D turn; view-family ancestry and state edge checks | H/I; M06 |
| F022 | Character proportions/palette drift across different GPT poses/views; immutable master lineage/native comparison | H; R04/R05/A07 |
| F023 | Wrong view (“three-quarter right” versus `front`), inconsistent pose/alpha/resolution; two-way art/motion agreement | E/H; U03/R08 |
| F024 | Style method F64 misbound to hand, other mismapped clauses; source-verified per-method actual Build decisions | F; A05 |
| F025 | Character source conditional methods declared but supplied as hollow names/fields; detailed F01–F80 decisions actually affect work | F; A01–A07 |
| F026 | “Molecular” missing/placeholder and generic box/ring request; no default placeholder/fail-closed every family | E/F; U01/U03/A02 |
| F027 | Real witness pixels not confirmed; invented observations accepted; independent source/region verification | F; A07 |
| F028 | Prompt over 32k causes cutting source decisions or omits grounding; versioned complete method delivery | F; U04/A05 |
| F029 | F33/F47/F53/F77 detail density inert; target screen-scale detail owner/attention consumer | F; A06 |
| F030 | F38/F60 projection/world method inert; actual camera, visual plane, media projections | F/I; A06/M08 |
| F031 | F19/20/29/34/49/55 routes/consumer names without causal proof; full consumer perturbation | F; A05 |
| F032 | 8/8 pack edits changed old render but no learned style; source→decision→actual novel pixels proof | F/K; A05/L02 |
| F033 | Same author/critic validates fake style/facts/feelings, rubric self-passes; independent observation, factual and human review | F/G/J; A07/T01/P07 |
| F034 | Repair memory only words/zero rules, no future first-pass improvement; conditional transfer learning | K; L01–L06 |
| F035 | Scene-specific coordinate/timing/model patch used as generalized “fix”; predicate/producer/transfer required | K; L01/L03 |
| F036 | P0 all 74 frame ranges empty; every trigger retains exact usage intervals | E/H; U04/R05 |
| F037 | P0 six master identities misrouted as cutouts; medium classification follows master semantics | E/H; U01/R07 |
| F038 | P0 master/part/intake/identity missing links; immutable registration/lineage/approval | H; R03/R04 |
| F039 | P0 unscoped approval token, stale approval reuse; all approvals content/hash scoped | E/J; U03/U04/U06/P03 |
| F040 | P0 image provider adapter unconnected or stub treated real; integrated authorized adapter, honest blocking | E/H; U03 and provider stub/real distinction |
| F041 | P0 QA accepted missing sound/art; layered fail-closed positive/negative gates | J; P04/P05/P08 |
| F042 | P0.1 B1 scaled/rotated canonical bbox wrong; transform full quad, inverse tests | H; R01/R02 |
| F043 | P0.1 B2 underpaint owner dropped; dependency propagates through source and render | H/I; R03/M04 |
| F044 | P0.1 B3 whole-film path hardcoded false; tested, honest positive path with real evidence gate | J; P08 |
| F045 | Stage3 contract only character masters; all noncharacter types bypassed | E; U01/U02/U03 |
| F046 | `compileArtJob` null context and `submitJob` `if(gate && ...)` fail open | E; U03 provider spy zero calls |
| F047 | Outbox status implies unapproved story is approved | E/G; U06/T01 |
| F048 | Outbox deletion/recompile destroys old evidence, stale compiled request may submit | E; U04/U05 |
| F049 | Function existence `consumerExists` misreported as real F-method implementation | F/L; A05 |
| F050 | Context 31,949/32k, missing real source and ambiguous dedupe pointers | F; A05/U04 |
| F051 | Numeric contact zero yet reversed hand/visually invalid; orientation/patch/pixel test | I; M03 |
| F052 | Body compensation direction-keyed, not support solved | I; M05 |
| F053 | View/expression feasibility not checked after rig fit | H/I; M10 |
| F054 | REGISTERED_MORPH lacks topology proof, EXPLICIT_DEFORM missing | I; M07 |
| F055 | Cast shadow receiver/occluder missing; physically/artistically owned light relationship | I; M09 |
| F056 | Portal OUT/MIDDLE/IN and masks/overscan not qualified on actual pixels | H/I; M11 |
| F057 | Narration absent / estimates called alignment; recorded audio drives frame events | G/J; T06/P04 |
| F058 | Shot passes but whole A/V film, segmentation/restart/determinism fail | J; P01/P02/P05 |
| F059 | MP4 metadata/reviewer claimed evidence without source-chain or real artwork | J; P06/P08 |
| F060 | Script/text/world/paint assets change but QA/approvals remain green | E/J; U04/P03 |
| F061 | Native-style, Whole Look/Vibe and readable full-speed choreography not independently qualified | F/I/J; A07/M12/P07 |
| F062 | Renderer silently draws or changes artwork to make unsupported animation possible | A/H/I; M15/A07 |
| F063 | Unsupported/no provider/human review represented as completion | A/E/J; U03/P08 |
| F064 | Across-film source/style learning degenerates into copied characters/metaphors/stock camera | F/K; A03/L03 |
| F065 | A nominal 120s film covers all frames but critical action/claim/attention absent | G/J; T02/T07/P07 |
| F066 | Historically late corridor/cycle animation skipped or mistimed within a planned frame window; state track must cover and alter every declared interval | G/I/J; T02/M13/P01 |
| F067 | Historical camera pull-back left important objects grossly wrong in size/position; camera/object ownership and scale/canonical fit must preserve projected anchors | H/I; R01/R06/M01 |
| F068 | Historical billboard/plane tilt was wrong; projection/rotation and world-space normal must be computed from approved camera/plane contracts | F/I; A06/M01/M08 |
| F069 | Historical fast pan lacked intended motion blur; shutter integration or approved blur state must be an actual compositor consumer where the direction requires it | I/J; M13/P07 |
| F070 | Historical local visual edit damaged neighboring unchanged pixels; edited region/mask ownership and pixel-exact preservation outside authorized edit area are mandatory | H/K; R04/L01 |
| F071 | Historical Chrome/browser renderer was flaky and nondeterministic; versioned capture with retries that do not alter frame content and reproducible hashes | J; P02/P05 |
| F072 | Historical frozen-frame and duplicated-image substitutes concealed missing motion; optical motion/declared-action coverage plus original editable assets remain required | G/I/J; T02/M12/P07 |

For every `F001–F072` link to a **real test/result**, not a pointer to this table. New defects discovered during execution become new rows `F073+` and are repaired at the same generic-producer level. Historic scene names, frame intervals and pixel deviations are **reproduction evidence only**; they must not become system constants.

## N. Required concrete interfaces, error precedence and artifact states

### N1. Central state machine

Use one persisted computed state per revision, not editable flags:

```text
PROPOSAL
  --verified story + Experience Director receipts--> STORY_DIRECTION_APPROVED
  --complete semantic/causal/action/film timing contracts--> MOTION_ART_DEMANDS_LOCKED
  --universal source-conditioned design + verified human design receipt--> DESIGN_APPROVED
  --authorized GPT request + immutable received pixels--> ART_CANDIDATES_RECEIVED
  --registered master + human art review--> MASTER_APPROVED
  --derived states, underpaint, edges, rigs, visual motion approvals--> ASSETS_MOTION_READY
  --unlike positive real-art performance + sound--> QUALIFIED_PASSAGES
  --7200 correct frames, real sound, actual complete review--> FILM_APPROVED
```

Each arrow has an explicit content-hash-bound receipt and validity predicate. A failed/missing gate returns the earliest failing state, exact missing dependency and next producer/human action; no downstream transition is permitted. Distinct projects can have partial/multiple branches (character A approved, world B blocked), but global status is the **minimum mandatory dependency closure**. The test harness is marked `DIAGNOSTIC_ONLY` and cannot cross into the real approval state machine.

### N2. Required reject/repair result

All refusal paths must return or throw the same structured shape:

```json
{
  "code": "ART_CONTRACT_NOT_EVALUATED",
  "severity": "BLOCKING",
  "producer": "engine/art_bridge/art_contract.mjs#resolveContractContext",
  "record_id": "ARTJOB_...",
  "frame_ranges": [[0, 60]],
  "failed_invariant": "every production request has an evaluated typed design contract",
  "dependency_ids": ["approved direction", "design revision"],
  "required_art_or_operation": ["missing family-specific method decision"],
  "repair_owner": "SOURCE_TO_ART_COMPILER",
  "resume_at": "ART_DESIGN_COMPILATION",
  "input_revision_hashes": {},
  "diagnostic_evidence": []
}
```

`frame_ranges` is a concrete example of type, **not** a permitted hard-coded global span. Every refusal is versioned; losing a reference or swallowing a typed error is a failing test. A UI/CLI may display friendly text, but machine consumers must receive the same fields.

### N3. Proof-first exact error precedence

Use this sequence on a production call, refusing at the first missing authority:

`ROOT/REVISION` → `STORY FACTS + HUMAN APPROVAL` → `EXPERIENCE DIRECTION + ACTION COVERAGE + HUMAN APPROVAL` → `MOTION/ART DEMAND COVERAGE` → `F01–F80 SOURCE/CONTRACT/APPLICABILITY` → `HUMAN ART DESIGN APPROVAL` → `SOURCE-ATTACHED COMPILED REQUEST HASH` → `PROVIDER AUTHORIZATION/CAPABILITIES` → `RETURNED IMAGE/BINARY VALIDITY` → `PIXEL REGISTRATION + LINEAGE` → `HUMAN VISUAL APPROVAL` → `ARTICULATION/STATE/CONTACT/TRANSITION FEASIBILITY` → `NARRATION ALIGNMENT` → `REAL MOTION QA` → `WHOLE FILM QA/HUMAN REVIEW`.

If any earlier item fails, later items cannot manufacture default values to continue. This ordering prevents expensive/premature calls and keeps the first failure cause actionable.

### N4. Exact coordinate/contact mathematical constraints

All 2D affine transforms use `[a,b,c,d,e,f]` with `x'=ax+cy+e`, `y'=bx+dy+f`; compose in the existing `math2d.mjs` order and reject determinant close to zero. For source crop coordinates `(u,v)`, subtract crop origin before applying stored crop→canonical transform. Canonical bbox is `min/max` of all four transformed crop corners; do not treat the old raw PNG dimensions as canonical after fitting. Contact target has a 2D position **and** a basis angle/normal: compute target attachment frame `M_target_world * M_target_contact_local`, compute source hand/foot contact frame from current FK, then constrain **both translation and wrapped orientation**. Report post-FK position and angle residual, plus rendered patch-mask overlap; do not report zero by overwriting source position with target before measuring.

For two-bone reach, verify `abs(L1-L2) <= d <= L1+L2` before solving and enforce joint limits after solving. For a support system, all active loads and contacts create explicit constraints; report unsatisfiable with a typed requirement for restaging or additional art, never “nearest reachable = contact achieved.” For any transition render `f` across `[start,end)`, evaluate `f-1,f,f+1` for event-edge continuity where available, and produce a contact/alpha/occlusion heatmap with current asset pixels.

### N5. No vague engineering escape clauses

The words “support”, “account for”, “integrate”, “handle”, “validate”, “fit”, “learn”, “properly”, “works” or “implement” in a progress note do **not** prove completion. For each capability, name its input fields, algorithm/state transition, exact module/export, consumer caller, output fields, failing-before/positive/negative/unlike tests, visual evidence and authority gate. Do not replace a missing producer with stricter rejection only; both the **capability** and the refusal behavior are required. A result that only blocks every complex movement is safe but not the desired studio.

## O. Required run sequence — carry out, verify, archive, then stop at the legitimate authority boundary

1. **Baseline:** record HEAD, all differences, preserved runtime hash, existing test/evidence corpus; open the code. Make a fresh scoped working branch/checkpoint that does not lose unrelated changes. State all unresolved inputs by exact file/receipt.
2. **Failing reproductions:** commit/add tests reproducing U01–U06 on noncharacters and loss of approval; add R/T/M/P/L cases. Save `BEFORE` evidence. Do not edit the proposed laundromat art job to make those tests pass.
3. **Implement C1:** eliminate null bypass at **every** compiler, design-review and submit path. Implement typed family contract, actual source/applicability, hash-bound provenance and non-destructive outbox. Run U tests after each producer change.
4. **Implement C2:** source-grounded 80-method decision matrix; actual causal consumers; full method delivery with explicit budget/partition strategy; visual decision graphs. Record unavailable real-provider proofs honestly.
5. **Implement C3:** semantic story truth, complete action graph, action phrases, viewer attention, timing dependencies, shot continuity and approval gate. Show failures of known script/action/cut contradictions **without** fixing them through scene-specific code. A proposed film remains proposal until Manmeet approves story/direction.
6. **Implement C4/C5:** derive universal art state demands and integrate measured registration/rig fit, constrained grip/support, real deformation/state/view/masks, camera/world/machine/diagram and whole action phrase runtime. Prove diagnostic rendering on diverse fixtures. Do **not** generate replacement final art in code.
7. **Implement C6/C7:** sound/timeline/chunked 60fps film production code, honest multi-layer QA, revision invalidation and evidence-producing reusable repair memory. Stress random-seek, restart and negative failures. Use a synthetic full-film fixture only to prove **mechanical** B3 positive path, clearly watermarked diagnostic.
8. **Execute every suite** sequentially or isolated in parallel without shared fixture races. Run browser/Chrome proofs; capture exact commands, stdout/stderr, hashes, frame strips and video checks. Any test that cannot run is `NOT_RUN`, not `PASS`. Do not fabricate missing browser or provider environment.
9. **Audit the result from outside the happy path:** write and run an independent source review script that traces each F001–F072 row through producer, actual call site, candidate circumvention paths, injected failure, positive unlike test and evidence. Another function existing with the right name is not proof. Include an audit of all code reachable by real provider submission and all approvals.
10. **Deliver fresh `HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip`** containing only a reproducible scoped export—not credentials, private environment configuration or giant unrelated histories. Include file list/hashes and a README with commands. Do not report “implementation done” if unresolved software producers remain.
11. **Stop at the actual user/provider boundary.** If authorization, real GPT art, story/direction approval, human visual reviews or recorded narration is absent, report exactly which requests/receipts to obtain and which next command consumes them. **No bulk art spending, no fake images, no fake approval, no statement that the film is already qualified.** A fully coded but unqualified producer stays `IMPLEMENTED_UNQUALIFIED`.

### O1. Archive manifest: all items required

```text
HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip
  AUDIT/README.md                        # current HEAD, scope, exact rerun commands, stop conditions
  AUDIT/BASELINE_AND_PRESERVATION.md     # hashes, preserved nu.js, user changes, dependencies
  AUDIT/FILE_CHANGE_MAP.md              # old/new producer functions + exact role
  AUDIT/FAILURE_LEDGER.json             # every F001–F072 with status and proof file paths
  AUDIT/ROOT_CAUSE_REPAIR_MATRIX.md      # original reproduction → cause → source diff → transfer
  AUDIT/CONTRACT_GATE_MATRIX.json        # family/state/job x required methods/approvals x verdict
  AUDIT/SOURCE_TO_ART_F01_F80.json       # each method's Build clause, applicability, consumer, proof
  AUDIT/SEMANTIC_ACTION_COVERAGE.json    # every approved/proposal action ↔ executable operations
  AUDIT/CAUSAL_MECHANISM_PROOFS.json     # factual/counterfactual tests
  AUDIT/REAL_ART_AND_HUMAN_STATUS.json   # provider status, zero manufactured approvals
  AUDIT/TEST_COMMANDS_AND_RESULTS.md     # all tests, environment, stdout/stderr/exit
  AUDIT/NEGATIVE_PROOF_MATRIX.json       # injected failures, exact rejected code
  AUDIT/UNLIKE_TRANSFER_MATRIX.json      # no scene-specific branches
  AUDIT/RENDER_EVIDENCE/                # before/after/strip/heatmap/MP4 and metrics
  AUDIT/DIFF.patch                      # source changes against baseline
  AUDIT/INTEGRITY_MANIFEST.json          # SHA-256 over every included file
  AUDIT/OPEN_DEPENDENCIES.md            # exact blocking external/user actions, not hidden defects
  engine/                               # actual relevant source/runtime snapshots
  schemas/                              # actual schemas/examples
  tests/                                # full relevant runnable suites and fixture source
  hybrid_v2/                            # evidence and versioned outbox index (no secrets)
  films/<qualification-fixtures>/       # manifests/action plans/legitimate diagnostic proof only
```

The directory names above are a **deliverable contract**; adapt only the `films/` fixture names to preexisting valid names. Include all files needed to reproduce asserted behavior; if a required fixture is missing from ZIP, fail its proof and list it. Preserve production artifacts and original art in the actual workspace; do not needlessly duplicate gigabytes.

### O2. Final response format: no marketing language

Return exactly these headings and data:

1. `LIVE_BASELINE` — HEAD, dirty changes, runtime hash, source/spec revisions, commands.
2. `CHANGED_PRODUCERS` — module/export, failure IDs, semantic algorithm change, source diff.
3. `F001–F072_LEDGER_SUMMARY` — every ID and state; no omitted row; link supporting evidence.
4. `TEST_RESULTS` — old and new, browser, provider stub, negative, unlike tests, not-run and actual errors.
5. `ARTISTIC_AND_REAL_ART_STATUS` — how many original approved GPT images, native art reviews, motion reviews actually exist. If zero, write **ZERO**.
6. `FULL_FILM_STATUS` — approved story/audio, 7,200 frames, playback review, MP4 SHA, explicit missing items.
7. `OPEN_SOFTWARE_DEFECTS` — if any, with function and next exact code change. “Known gap”, “future” or vague “external” is invalid for software you were asked to implement.
8. `TRUE_EXTERNAL_BLOCKERS` — exact human/provider actions only, separated from unfinished engineering.
9. `AUDIT_ZIP_PATH_AND_SHA256` — exact fresh path, hash and independent reproduction instructions.
10. `NEXT_USER_ACTION` — one concrete instruction if an external approval is required. Never instruct bulk art or 120s production before a real-art + unlike transfer gate passes.

**End criterion:** All buildable system producers from F001–F072 must be implemented and mechanically proved across original and unlike fixtures; no production gate bypass; real-art and whole-film statuses remain honest until real approved evidence exists. Do **not** replace the user's desired ability with a collection of refusals. If the run reaches a hard external dependency, complete every independent authorized software task first, record the precise blocker and hand off the working resumable state. No “all fixed forever” declaration without an observed production demonstration and regression coverage.
