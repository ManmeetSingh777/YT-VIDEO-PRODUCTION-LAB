
# E01 V0.4 — Independent art-to-motion source audit addendum

STATUS: Source-level audit of commit c1b387ce46ebab5e411069b3ea35f2975abab71d; no new local engine execution, no approval or real images. Tested P06 engine b2c6931a628f68773349dc2565d7aae5530ad41d. Reported 296/296 tests passed on diagnostic fixtures, 0 accepted real-art seconds.

## Audit corrections and newly explicit blockers

**1. Object possession is single-holder, but real acting requires sets of supporters and a unique transform owner.** In engine/film/performance_qa.mjs, possessionAt() overwrites the object holder with the last grip. PaintedGripMaintained and PoseContactHold compare an exact single holder. ReleaseAndSeparation checks whether the object still has *any* possessor, which would reject a correct handover when the receiver remains holding it. Correct the data model and QA together: support_contacts = set of independent actors/hands/surfaces, transform_driver = exactly one authority, transfer at an explicit instant, multi-hand contact patches and orientation verified every frame, release checks the releasing hand only (not global unownership), and preserve previous single-hand behavior. Prove on two unlike rigs and injected failure tests. All engine logic reusable, never hardcode E01 frames in generic producers.

E01 evidence anchors: award both Mia hands f180; counter first touch f264, takes load f276, right hand released f286, left f300. Report lead only before f338, Mia first contact f338, secure f348, shared support [348,356), transfer authority f356, lead clear f368, Mia supports through f959. A prop does not teleport or have contradictory transforms.

**2. Whole-film creative preflight can block a valid earlier production phase.** engine/story/creative_adapter.mjs#acceptPacket refuses TECH feedback for every action in the supplied packet. If the official packet includes full [0,1950) opening, unsupported f960+ freeze, host perspective/depth may block creation of the first [180,960) ArtJobs. Verify whether a schema-valid, human-approved PHASE-1 creative packet can cover original [0,960), containing exact original SH01–SH03 actions, source hashes, relative/absolute clocks and f0–179 pre-roll, with f959 output continuity required by future f960 freeze. Such a scoped packet is not a new story, not full-opening signoff and may not silently reauthor dialogue. If unsupported, name the exact blocker or implement a general validated subset scope before demanding later-film host work.

**3. Ten meaningful F01–F80 pre-generation audits are documented but lack a code enforcer.** art_contract.mjs checks F-method decisions and molecular art fields, not a durable ten-pass artifact. Add a content- and digest-bound audit of ten distinct construction/gap domains, tied to design and source witness SHA. Require useful grounded decisions and independent human review; never treat an empty ten-item list as genuine artistic quality. Add passing, missing, stale, wrong-job and filler negative tests. Do not claim code can objectively approve beauty.

**4. Real manual ChatGPT ArtJob route: do not call submit by mistake.** In engine/tools/art_outbox.mjs#exportOutbox, the approved job gets compiled into a generation. The separate submit CLI calls submitJob (provider/API route). For a no-API GPT chat, the path is art_outbox export → check COMPILED_WAITING_FOR_GPT_ART → export-gpt-job → manual generated images → import-gpt-candidates → select-candidate → ingest-master/ingest-part → real human reviews. The wording in E01_V04_PREFLIGHT_AND_ARTJOB_READINESS.md §8 step 5 ("submit compiles generation") is misleading and must be corrected in subsequent handoffs. Verify exact CLI invocation using actual frozen code.

**5. Creative packet initial rig topology is allowed to be UNMEASURED.** engine/story/creative_adapter.mjs#compilePacket creates geometry_status UNMEASURED with declared topology/joint ids/landmark names but actual positions [0,0] pending approved art. This is an intentional planning placeholder, not the final rig coordinate; only measured art supplies actual pixel geometry. Do not invent elbow lengths, hand shapes or perspective to satisfy schema before visual design.

**6. PINCH currently risks silent dropping.** The manifest compiler in engine/story/creative_adapter.mjs filters out contact_events with type PINCH. Ensure unsupported PINCH produces an explicit preflight refusal before acceptance, or add a real producer/QA with drawn fingertip/thumb contact and near/far layers. Do not reinterpret a page pinch as generic fist grip without user authorization; the final visual result decides required art.

**7. Official ArtJobs are not yet the provisional 61-node DAG.** The 61 figure comes from a read-only table generator over CSV and registries. Exact generated ArtJobs and dependency SHA only come from true compiled approved production source and engine/art_bridge/art_intake.mjs#planJobs. Conditional art for lead feet, hands, eyes, mouth, inbetweens, camera scales, underpaint and views must be revisited after human decisions.

**8. The actual E01 private references are unavailable in public GitHub.** The native F01–F80 witness images are local and excluded from the public repository. Any user ChatGPT art job must receive required witness pixels privately within the sealed handoff and verify skill access/version. Do not upload licensed witnesses, internal ZIPs or human signing keys to public repository.


**9. Inconsistent full-opening category totals in Claude report.** Parsing the 25 data rows of engineering/e01_v04/PROVISIONAL_PREFLIGHT_TABLES.md directly gives 6 NEEDS_REAL_ART, 9 NEEDS_CREATIVE_DECISION, 10 NEEDS_ENGINE_PRODUCER = 25. But E01_V04_PREFLIGHT_AND_ARTJOB_READINESS.md §3 states 5/9/11 = 25. The extract numbers 6/7/4 are consistent with 17 actions. Repair the full-opening report tally from the single machine-derived table, add a counting invariant/assertion and do not let hand-written figures disagree with generated rows.

## Mandatory artistic/technical feedback loop

STORY and AUDIO: audition real performances with a scratch animatic; repair weak dialogue/chemistry in script/Director and version all effects before signing.

SOURCE-GROUNDED ORIGINAL ART: verify current F01–F80 skill and native witnesses; 10 substantive pregen passes; approved character/world design; sealed actual GPT ArtJob; generate real original pixels, not generic shapes; check silhouette/anatomy/view/material/face/hand/underpaint against native style grammar and canonical master; identify earliest faulty art method, regenerate only impacted source-attached states; actual human visually reviews and signs image bytes.

ART-FIRST REGISTER AND FIT: preserve source pixel identity, crop→canonical transform measured from actual reviewed landmarks, no tube-arm hack; derive IK and motion states from approved shapes; exact near/far finger layers, hidden paint, expression and mouth cels. If image cannot legally move, add new approved painted state or fix erroneous art/rig producer, re-evaluate all affected frames; do not hide broken limbs with camera edits.

REAL VIDEO: render true directed actions and correct relative/absolute frame context with real voice, SFX, host/decoder only when appropriate; owner-isolated frame checks, contact/weight/camera/occlusion and full human continuous playback. Fix causal source and rerender impacted shots, preserve unaffected approved assets.

Reusable repair learning needs actual before/after images, user review and unlike-subject transfer. No generic repair rule promoted on a synthetic test or one Mia-only patch.

## Immediate work ordering

1. Preserve current code and report SHA; do not rerun unchanged suites.
2. Implement shared two-hand support plus cross-actor transfer and QA on unlike rigs, including release bug; narrow tests during development, full suite once final engine revision freezes.
3. In parallel: get user creative/timing/lead visibility/page grip/viseme decisions, validate full [0,1950) director source and legally scoped first [0,960) production packet if supported; real f180 inheriting pre-roll.
4. Build design proposals for Mia/regular/lead/world via real skill, without user approval or final art claims. Fix ten-pass audit gate.
5. With real approvals, obtain first engine-generated sealed private ArtJob ZIP, then generate original GPT pixels, register/measure, render/inspect [180,960) and iterate until user accepts sounded moving film.
