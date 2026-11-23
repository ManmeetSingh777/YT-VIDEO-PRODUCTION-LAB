# TEST_COMMANDS_AND_RESULTS

Revision under test: `4da33a2aafc81a7c52085602b00d587a49548639` (engine code identical to `611c9dd`, where the browser/Stage 3 evidence below ran). node v22.20.0.

| Command | Exit | Result | Log |
|---|---|---|---|
| `node --test --test-concurrency=1 --test-reporter=tap tests/art_bridge/*.test.mjs` | 0 | 131/131 pass, 0 fail (17 suite files) | `hybrid_v2/work/audit_logs/node_test_tap.txt` |
| `node tests/art_bridge/stage2_proofs.mjs` (Chrome, diagnostic rasters) | 0 | ALL MECHANICAL PASS | `stage2_proofs.log` |
| `node tests/art_bridge/c0_reproduce_p02.mjs AFTER` | 0 | 0/12 directive defects reproduce after repair (BEFORE: 12/12 at 9a2a9ad) | `c0_after.log`, `evidence/system_correction/AFTER/P02_REPRODUCTION.json` |
| `node engine/tools/art_outbox.mjs export --film films/hv2_film001` | 0 | 74 jobs; 37 gate-pass (Ines + its derived states); other masters BLOCKED_CONTRACT; story/direction NOT_APPROVED | `outbox_export.log` |
| `node tests/art_bridge/stage3_proofs.mjs` | 0 | mechanical 5/5; stage BLOCKED (no provider, no approvals) | `stage3_proofs.log` |
| `node engine/tools/build_failure_ledger.mjs …node_test_tap.txt` | 0 | F001–F072: 29 QUALIFIED_ON_DIAGNOSTICS, 43 IMPLEMENTED_UNQUALIFIED, 0 FAIL | `ledger.log` |
| `node engine/tools/audit_trace.mjs` | 0 | 3 LIVE pattern hits (explained in ROOT_CAUSE_REPAIR_MATRIX), 3 producers without production caller (OPEN_DEPENDENCIES) | `audit_trace.log` |

## Not run (stated, not passed)
- REAL_PROVIDER submissions: no credentials. HUMAN_REVIEW: none exist. A real 7200-frame render on approved art: no art, no production per-frame Chrome renderer (open defect).

## Per-suite results
- `art_ancestry_and_registration.test.mjs`
- `film_revision_and_qa.test.mjs`
- `full_contact_solver.test.mjs`
- `motion_phrase.test.mjs`
- `p01_film_qa.test.mjs`
- `p01_reaudit.test.mjs`
- `p0_audit.test.mjs`
- `repair_transfer.test.mjs`
- `semantic_action_coverage.test.mjs`
- `shot_continuity.test.mjs`
- `source_method_causality.test.mjs`
- `stage1.test.mjs`
- `stage2.test.mjs`
- `stage3_contract.test.mjs`
- `story_mechanism_truth.test.mjs`
- `transition_render.test.mjs`
- `universal_contract.test.mjs`

## All test results
- PASS — R01/R02 raster→canonical→raster round trips; canonical rect = bbox of the 4 transformed corners for scale/rotation/nonuniform/crop/negative origin
- PASS — R07 unlike families fit THEIR OWN interfaces: a machine hinge and an organism appendage move to measured art; frame anchors stay
- PASS — R08 negatives: missing hidden paint, wrong underpaint order, unknown alpha refuse before any pixels are trusted
- PASS — H1 demands are derived from the real action graph (every bound state, contact closure, camera coverage) with frames — no fixed image count
- PASS — P01 the film's shots tile [0,7200) exactly; gaps, double ownership and off-boundary transitions are refused
- PASS — P02 chunk renders are deterministic: seek == sequential, a transient crash is retried to identical bytes, a re-render must match its chunk receipt
- PASS — P03 any upstream change (manifest, story, direction, motion plan, design, audio) changes the film revision and stales QA/render
- PASS — P04 measured narration places critical events; a changed word time moves the event frame; estimated timing blocks
- PASS — P05 render negatives: no audio stream, wrong fps, black frame, sentinel (uncovered) pixels each fail verification
- PASS — P08 layered verdicts: every layer on test/diagnostic evidence → TEST_PASS only; any missing layer → FAIL; P07/P09 stay unproven without real art
- PASS — M02 every quadrant, both bend branches: FK of the returned RADIAN angles reproduces the target; reach limits and degeneracy refuse
- PASS — M03 orientation-constrained grip follows a ROTATING target within tolerance; a reversed palm FAILS even with zero XY error
- PASS — M05 an out-of-arm reach is solved by bounded root/torso shift with feet planted and balance inside support — or refused, never stretched
- PASS — M10 feasibility re-solves EVERY action frame and validates state/view edges (not contact snapshots)
- PASS — M12 one phrase drives body, prop, face, camera and sound on shared integer frames with overlap; isolated motion is refused
- PASS — M13 seeded particle/phase state is a pure function of (seed, frame): random seek equals sequential replay; shutter samples are deterministic
- PASS — B3-1 single-scene QA never certifies a film (whole_film_pass false)
- PASS — B3-2 automated gates pass; without a film review the verdict is FAIL
- PASS — B3-3 positive path: film receipt after all gates → TEST_PASS (never PRODUCTION_PASS under test trust or diagnostic rendering)
- PASS — B3-4 rerun re-hashes: a replaced MP4 fails render and stales the film receipt
- PASS — B3-5 negatives: missing shot, missing audio, stale art, 30-fps file, missing frame
- PASS — B3-6 without test trust the same package is refused (diagnostic art, non-human reviews, synthetic render)
- PASS — P06 a stub/synthetic MP4 recorded through the CLI source flag can never become the render
- PASS — B1-a 640×900 master registered at 0.5×: canonical rect [-20,-15,320,450] and one full crop→canonical affine
- PASS — B1-b every registered part: canonical rect = bbox of its four transformed crop corners (independent ground truth from the delivery transform)
- PASS — B1-c the loader refuses a canonical rect that disagrees with its crop→canonical matrix
- PASS — B1-d world plate at 2 px/unit: rect [-100,-60,1200,675]; footprint flags the wide view and passes the push-in; Chrome pixels agree
- PASS — B1-e emitter applies scale/rotation/crop exactly once: interior source pixels land where crop→canonical predicts (0.5×, 1.25×+rot, 0.9×+rot, rot, sub-crop)
- PASS — B1-f transition plates delivered at 2× density render like 1× plates (mask aperture, anchor and scale applied once)
- PASS — B2-a the real Ines plan declares surface→underpaint ownership; plan validation refuses unmapped / non-underpaint / wrongly ordered owners
- PASS — B2-b intake carries the ownership: forearm links pilot_underpaint, loader finds no MISSING_UNDERPAINT, unmapped plan refuses
- PASS — B2-c hard elbow bend in Chrome: owned underpaint closes the joint; hiding it opens a seam
- PASS — H1 planned alpha contract is enforced at intake (no silent rewrite)
- PASS — H2 registration receipt content is verified and bound into the approval
- PASS — H3 provider: model/size/config in the idempotency key; multiple outputs kept as immutable candidates; retry then resume
- PASS — H4 review history is immutable; a rejection clears the current pointer; every decision survives
- PASS — H5 API reviews are DIAGNOSTIC; production refuses non-human approvals; human attestation cannot be minted without an interactive operator
- PASS — B2-d REAL Ines contract: forearm + elbow underpaint ingest with linked ownership and BELOW order; removing the link is refused
- PASS — P0-1a every exported ArtJob whose triggers carry frames has non-empty motion_context.frame_ranges
- PASS — P0-1b Ines master context covers the S02 interval and the master's shots
- PASS — P0-1c perturbing S02 grip timing changes only dependent job contexts
- PASS — P0-2a all six canonical-master jobs route to the canonical master medium
- PASS — P0-2b routeMedium per typed kind; contradictory (state_kind, medium) refused
- PASS — P0-3 intake API exists: ingest-master registers landmarks + identity hash; derived art refused before approval; kinds preserved
- PASS — P0-4 production refuses random strings, foreign receipts, replaced PNGs, moved pivots, changed edges
- PASS — P0-5 submit path: no provider → exact WAITING status and no file; stub server → receipts, decoded alpha, ancestry, idempotent
- PASS — P0-6 fixture QA passes only the mechanical gate; production gate fails without audio and review
- PASS — P0-1d world-camera footprint perturbation changes only that world's jobs; compiled master prompt hash follows
- PASS — L01 a failure is recorded against its producer (general class, predicate, invariant); scene-named classes are refused
- PASS — L02 a NEW first pass (no local patch) consumes the matching rule: the compiled request carries its positive operations
- PASS — L03 a non-matching subject receives no rule
- PASS — L04 a rule contradicting the approved design/source blocks (REPAIR_RULE_CONFLICT) instead of being chosen
- PASS — L05 diagnostic or missing pixels can never mark artistic learning qualified
- PASS — L06 a memory change invalidates only the jobs whose predicate it matches
- PASS — T02 a verb in the prose with no typed action, or a LOAD with no bag/trajectory/contained state, is UNCOMPILED / MISSING_ART (never 'motion complete')
- PASS — T03 one hand cannot grip two unrelated props at once; an unclaimed contact is an ORPHAN action; possession cannot teleport
- PASS — T07 a direction decision no track consumes is DIRECTION_DECISION_INERT; fake 3D camera over a flat plate is refused
- PASS — T08 (actions) unlike scenarios — a scientist transferring a sample and an octopus releasing a shell — run through the SAME compiler
- PASS — REAL proposal S02: the 'loads' verb and the carried bag compile to exact missing operations (reproduces F013 without a scene patch)
- PASS — T05 outgoing door OPEN but incoming CLOSED (opening only later) is refused; an approved, reasoned time jump is accepted
- PASS — unlike continuity: carried object and weather/lighting state across cuts; frame gaps are refused
- PASS — A05 every F01–F80 method: source clause → applicability rule → consumer → changed output (decision changed execution), pixels EXTERNAL_PROVIDER_BLOCKED
- PASS — A01 character: changing face/anatomy decisions changes the head/eye components and their stage; motion interfaces stay semantic
- PASS — A02 machine: functional topology methods are required; a box-plus-circles decision is refused, a functional one is delivered
- PASS — A03 organism / natural world: human garment/head rules never leak into branches, leaves or limbs
- PASS — A04 diagram/data world: grammar, glyph and value→geometry methods are required; artistic symbols cannot stand in for values
- PASS — A06 projection scale, roles and planes produce DIFFERENT detail/projection treatment (no universal template)
- PASS — A07 native-size review packet; automation cannot approve; a rejection must trace region + method + cause + edited decision
- PASS — valid examples pass
- PASS — checked-in example files match the generator and pass/fail as named
- PASS — unreachable contact reports exact missing distance
- PASS — missing underpaint
- PASS — illegal view morph
- PASS — wrong pivot → UNREGISTERED_PIVOT
- PASS — invalid parent → error naming the asset
- PASS — rig with cyclic joints fails
- PASS — unsupported view state → UNSUPPORTED_VIEW
- PASS — circular layer order → OCCLUSION_CONFLICT
- PASS — hash mismatch / missing file / path escape
- PASS — production mode rejects diagnostic fixtures
- PASS — continuous transition without middle art → MISSING_TRANSITION_STATE
- PASS — schema rejects unknown top-level keys and wrong stage
- PASS — coverage walks every frame of [0,7200); gaps, overlaps and missing art spans are exact
- PASS — static plate bound as an articulated rig → STATIC_PLATE_NOT_RIG
- PASS — two-bone IK: exact, non-clamping, bend-branch and degenerate
- PASS — contact graph solves only active contacts
- PASS — F01–F80 registry: exactly 80 rows, every verdict computed, no hand-set completion
- PASS — declared method use without a real consumer → METHOD_NO_REAL_CONSUMER
- PASS — stateAtFrame is pure: random-order evaluation equals linear evaluation
- PASS — grip and plant hold on every locked frame; no failures over the action
- PASS — bend branch contradicting the FK pose is reported, not flipped silently
- PASS — transform ownership, routing and morph topology are enforced at compile time
- PASS — light plane is painted on its owner and under everything above the owner; reads the owner's matrix
- PASS — every runtime element is written on every frame (seek-safe DOM state)
- PASS — transition anchor is invariant; stages OUT→MIDDLE→IN
- PASS — camera footprint flags exact spans when the camera outruns painted plates
- PASS — gear ratio and flow symbols follow the declared mechanism
- PASS — registration solver recovers similarity and affine exactly; collinear affine refused
- PASS — ArtJobs: every §6.2 motion_context field present (value or null+reason); non-art defects are routed elsewhere
- PASS — state coverage: one static master for acting states never passes; front features on a turned head are missing
- PASS — provider boundary: no configuration → NullProvider with an exact blocker; never fabricates
- PASS — sprite emitter: image at (cx-px, cy-py), crop via nested viewport, static asset_to_canonical wrapper; missing asset refused
- PASS — word cues: measured timing resolves exact frames; estimated timing or a broken cue → MISSING_WORD_ALIGNMENT
- PASS — S3C-1 method fidelity: the audited Ines brief (F64 bound as hand construction, F05/F52 mislabelled) is refused before compile
- PASS — S3C-2 rig-forced generic geometry without source grounding is refused
- PASS — S3C-3 absent (or placeholder) molecular_visual_decisions cannot pass
- PASS — S3C-4 view agreement: the motion contract carries the rig's canonical view, and a design/motion view mismatch is refused
- PASS — S3C-5 alpha agreement: a STRAIGHT-alpha master compiles with transparent_background true (contract-owned), and a design alpha mismatch is refused
- PASS — S3C-6 applicability: every method the subject family + motion contract makes applicable is bound faithfully (not all 80)
- PASS — S3C-7 a faithful design passes every automated gate but cannot be submitted without a HUMAN design approval
- PASS — S3C-8 (E) approved art determines the rig: different arm proportions are FITTED, not refused; infeasible action → restaging required; approved restaging → feasible
- PASS — S3C-9 (F) a genuinely unsuitable design fails before generation even when every field has text
- PASS — T01 a diagram that stops ALL costs when activity stops fails its counterfactual (MECHANISM_CONTRADICTION)
- PASS — T04 an obstacle declared RESOLVED without mechanism support is OBSTACLE_UNRESOLVED; unverified claims are FACT_CHECK_REQUIRED
- PASS — T08 (mechanisms) unlike infection/exposure and orbital-energy mechanisms run through the SAME evaluator and counterfactual check
- PASS — T06 changed script or audio invalidates word-linked frame anchors; estimated timing cannot anchor a critical cue
- PASS — T09 the timed animatic retains DIAGNOSTIC_ONLY provenance and cannot pass an art or film gate
- PASS — M01 disjoint transform ownership: camera → plane → root → joint → art; double owners, wrong nesting and cycles are refused
- PASS — M06 a full turn needs registered view cels; rotating the front PNG is refused
- PASS — M07 REGISTERED_MORPH needs homologous topology; EXPLICIT_DEFORM needs an approved, non-flipping map
- PASS — M09 cast shadows exist only for occluder→receiver relations; treatment differs by receiver material (no universal crescent)
- PASS — M11 portal OUT→MIDDLE→IN shares one aperture with a rim occluder and full mask coverage; an opacity zoom-cut is refused
- PASS — M15 a missing state is a typed MISSING_ART_ASSET demand with frames — never substituted by other art
- PASS — M07b the PRODUCTION state router refuses a non-homologous vector morph and an unapproved deform map on a state edge
- PASS — G-wiring the film-contracts compiler (run by exportOutbox before art) reports the real proposal's blockers from its own producers
- PASS — U01 all six masters produce a NON-NULL contract status; each incomplete design is BLOCKED (never COMPILED/SUBMITTED)
- PASS — U02 two unlike families absent from the laundromat fixtures route distinct source methods and motion obligations
- PASS — U03 every missing authority refuses BEFORE the provider spy's call count moves (positive control proves the spy)
- PASS — U04 each upstream mutation yields a new dependency digest and stale approval; an unchanged rerun keeps the digest and the old bytes
- PASS — U05 exporting twice keeps every earlier compiled request, candidate and receipt byte-identical; no whole-directory deletion
- PASS — U06 a rejected design cannot be bypassed by doc.status, human:true, test-trust or an edited pointer; test-trust never reaches a real provider
