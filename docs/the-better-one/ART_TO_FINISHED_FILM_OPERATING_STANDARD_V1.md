# THE BETTER ONE — ART TO FINISHED FILM OPERATING STANDARD V1.0

**STATUS:** Authoritative manual/semi-automatic operating procedure for artwork and animation; NOT proof of actual artistic quality or that every referenced capability works on real art. Complement, do not replace, the Channel Bible, Experience Director V1, Production Operating Standard V1, F01–F80 native skill and current actual engineering code.

**SOURCE TEST ANCHOR:** production/better-one-first-film-engineering, report commit efc49aec656b723559be0f05c9d9148f6a042b7b; tested engine SHA b2c6931a628f68773349dc2565d7aae5530ad41d; 296/296 engineering tests passed; 0 seconds of accepted genuine GPT art. Docs are maintained on production/better-one-mia-first-film until Claude reconciles this with its local engineering checkout safely. A doc change does not invalidate or automatically update frozen engine code.

**FIRST E01 FILM:** proposed 32.5s opening absolute [0,1950), with first 13s extract absolute [180,960), local [0,780), 60fps, 1920×1080. The proposed V0.4-DIR-P1 full director package has seven shots, 25 actions, 24 audio cues, 27 art families. Story/dialogue/performances and actual art still need human approval. The original smile in f0–179 and freeze continuity at f960 are necessary for review.

**Portable artist-operator chat starter:** docs/the-better-one/NEW_F01_F80_ART_OPERATOR_CHAT_V1.md. Only after real art_outbox export-gpt-job creates a job-scoped ZIP. **Source-code enforcement gap register:** docs/the-better-one/ART_TO_FILM_ENFORCEMENT_GAP_AUDIT_V1.md.

## 0. Definition of success, not a hollow test pass

The audience watches an exceptionally entertaining original film with distinct character personalities, convincing expressions and body dynamics, consistent beautiful construction, truthful motion graphics, actual 3D host integration when directed, readable cinematic choices and good sound. Real art and every relevant frame are checked. The user approves moving footage and its exact current source SHA. There is no "engine passed therefore art looks good" shortcut.

Reused across episodes: semantic commands, exact art/rig/scene contracts, source-connected F-methods, model decoding, visual QA and repair learning. Not reused without artistic reason: characters' faces, geometry, comedy, performance identity, original camera choices or individual story.

**Owners:** USER signs creative, look, art, and finished-film review. GPT CREATIVE authors story/direction and critical model. CLAUDE creates/checks schemas, preflight, ArtJobs, executable physical state and actual renders. GPT ART uses the installed current verified F01–F80 skill and image generation to deliver original candidates and source-attached states. No tool may fabricate human approval or replace missing source imagery with generic cartoons.

## 1. The exact full-film-to-artwork dependency chain

    RESEARCH + ECONOMIC MODEL + VALUE BLUEPRINT
      > screenplay written as film, natural performed timing and plot approval
      > 12-part Experience Director for each actual shot
      > typed action/acting/prop/camera/audio continuity graph
      > true CREATIVE_PACKET v1.1.0 and needed HYBRID_CONTRACT
      > actual P06 command/profile and media-route preflight
      > complete source-derived ArtJob/state/view/world dependency DAG
      > verified F01–F80 design construction decisions with native witnesses
      > genuinely generated and user-approved canonical actor/world master
      > source-attached parts, poses, expressions, alternate views, clean underpaint, props
      > measured registration from real reviewed pixels, post-art motion fit
      > Neutrino 2D animation and separately real Blender/decoder where directed
      > exact-frame camera/occlusion/audio compositing and actual MP4
      > user watches moving film with audio, diagnoses and repairs source cause
      > accepted real film seconds, then larger contiguous sequences and full episode

Every arrow must name actual input files and SHA-256, output, consuming function, approval/refusal, exact shot/action IDs and expected visible/audible result. A long source pack is only data, not the executed chain.

## 2. Film FIRST — the only valid origin of ArtJobs

2A. GPT CREATIVE receives the whole movie's current decision context, not an isolated 13s test premise. Its 12-part Director describes what an audience must see and feel; the actual motivated actor/body action; anticipation, reaction, hold and recovery; gaze, eye/mouth, face, overlap with other acting; object handovers; camera attention and world order; sound and narration. No generic directions like "animate nicely." No fictional elbow coordinates before the art exists.

2B. A scratch audio and rough animatic must establish realistic timing. Estimated words may guide provisional preflight but production P06 requires actually measured audio. Do NOT generate final art against a continuously changing screenplay. User signs film intent, dialogue/performance and extract scope before sealed production art requests.

2C. Map every action by permanent ID: shot; actual full-film [start,end); actor(s); object and support/ownership; initial/final states, phase edges and contact; visible expected effect; alternative motion mode; exact mouth/face/view/hand/art need; audio cue; camera framing; failure criterion. Multi-actor shared handovers become synchronized independently controlled commands with a single prop-world transform owner. Head, hand, object, shadow and voice must not reset when shots cut.

2D. The first E01 780-frame extract STARTS at absolute film frame 180. Compute all persistent art/rig/prop/expression/world states from preceding frames. The first 3s and f960 transition require contextual inspection. Do not create a new neutral first frame to make technical testing easy.

**Gate A:** screenplay version, user approval scope, complete director, stable source hash and action/event completeness. If unapproved or contradictory, run only PROVISIONAL feasibility and return exact creative question.

## 3. P06 PRE-ART closure: motion chooses required drawings, not artwork geometry

Use actual CLI on the tested checkout (paths and options verified from engineering code):

    node engine/tools/creative_handoff.mjs validate --packet <FOLDER>/CREATIVE_PACKET.json
    node engine/tools/creative_handoff.mjs preflight --packet <FOLDER>/CREATIVE_PACKET.json
    node engine/tools/creative_handoff.mjs hybrid-preflight --packet <FOLDER>/CREATIVE_PACKET.json --hybrid <FOLDER>/HYBRID_CONTRACT.json
    node engine/tools/creative_handoff.mjs performance-closure --film <FILM> --commands <FOLDER>/PERFORMANCE_COMMANDS.json --profiles <FOLDER>/PERFORMANCE_PROFILES.json --run-type PRODUCTION

These are real interface signatures from the engineering branch, but PRODUCTION checks are impossible without the true human-approved packet/profile/rig context. A provisional analysis must NOT pretend it has receipts. If needed, run read-only source inspection and report the formal gate blocked.

**Per action choose motion route before requesting art:**
- Painted rigid part or measured articulated 2D part and IK for moderate gestures;
- Approved raster alternate cel/view for silhouette-changing head or body turns, unusual poses or expression drawings;
- Approved bounded mesh deform/vector morph for genuine soft shape changes;
- Blender mesh, armature, face and camera passes for the actual 3D host;
- Model-linked graphics/labels for decoding, never fantasy "good looking" charts.
Preserve each character's original artwork. No universal tube-like limbs or forcing a rig template onto the artist.

**Derive ALL required ArtJob categories from the full directed scene:**
- Unique canonical identity for each needed character, including expressions and views (Mia, regular, lead, extras only as directed).
- Camera-aware world plates/overscan, parallax bands, far and near occluders, clean previously hidden background, ground shadows and scene lighting.
- Source-attached movable body part layers, true painted hidden underpaint for elbows, wrists, neck, knees, sleeves, hair and other revealed contacts.
- Eye open/closed/half-lid where directed; separate gaze/pupil, brow, mouth/rest/mid/open for supported speech; identity-correct emotional face and relevant combination states.
- Hands: palm socket and aim, open/grip/release/point as required, actual near/far finger drawings wrapped around prop, hand-to-sleeve paint, correct occlusion and shared-grip transitional cels.
- Props: all visible sides or separately revealed inside/back, grip sockets, legal physical states, surface support, shadow, occlusion, report legibility and typography.
- Complete view family, real inbetweens and state transitions for significant turns; no front-face flat PNG rotated into a profile.
- Relevant effects/transitions, freeze/memory plates and camera-extreme footprints; scene-to-scene incoming and outgoing visual states.
- Audio-linked state needs and exact frames; no speaker/lip state silently omitted.

**For every ArtJob** require: job_id; unique actor/world master root ID and SHA if derivative; complete shot/action/decision references and absolute frame intervals; art kind and family; visible role; original styling requirements from F methods; required view/pose/part/state; hidden surface/mask/shadow; registration target and actual required landmarks; resolution/alpha/camera range; upstream ArtJobs; intended motion consumer and exact owner effect; expected visual acceptance and human approval required.

**DAG check:** every runtime-required visual state reachable from any approved command has a planned ArtJob; every ArtJob has an actual consumer and source; identical usable states may be reused, but identity-specific views cannot be reused as shortcuts. A closure returning zero requirements for real moving characters must fail.

**Boundary tests:** remove blink/cel, swap master, move camera past plate, rotate hand out of reach, invert near/far fingers, change speech state. Closure/feasibility must name missing job, incompatible art or unsupported producer. Unknown verbs or supports are TYPED refusals, not generic placeholders.

**P06 documented limitations:** 12 usable commands in diagnostic settings; articulated walk and body-turn without approved cels refused. CARRY, PINCH, insertion/load, full visemes, camera orbit/3D dolly and perspective host depth/matte are NOT proven or built. Do not route a directed film action to a missing producer. Propose extra art states or build the actual operator, or request user's explicit creative staging change.

**Gate B:** all 25 actions and shot/audio/art families for E01 V0.4 are accounted for, every action mapped to actual producing+consuming code or precise typed refusal, no silent art simplification, no imaginary real assets.

## 4. F01–F80 original artwork design: source-grounded and art FIRST

The current F01–F80 skill and its native witness assets are required IN THE ACTUAL NEW ART GPT CHAT. This chat/repository's written art guidance is not the full skill. Verify skill version/files/actual images and source hashes as directed by the sealed GPT handoff. If missing, STOP final art production; do not use generic remembered Kurzgesagt styling.

Build the art_designs/<MASTER>.design.json required by the actual engine/design requests, binding every APPLICABLE construction F-method to its verbatim source-clause SHA, precise visual construction operation, relevant witness region and unlike comparison. A method title without an operational construction decision is not compliance. The skill/source applicability algorithm, not an assistant's arbitrary method list, chooses which F methods matter for this subject.

**Ten substantive pre-generation gap-check passes for a new canonical master**, unless the installed skill imposes a stricter pass order:
1. Film/subject goal, viewer attention and shot-scale silhouette;
2. Native source visual grammar, multiple witness contrasts, originality/anti-copy;
3. Original anatomy, head/face/proportions/perspective, non-generic silhouettes;
4. Color families, material, edge/outline grammar, shadow/highlight/texture roles;
5. Face expressions, eyes/mouth/hair/hands, actor identity and view coherence;
6. What truly bends, separates, occludes or needs hand/arm/deform alternate art;
7. Room/floor/world/depth/camera footprint and spatially consistent illumination;
8. Approved expression/view/prop/contact state coverage for real motion routes;
9. Each applicable F method mapped to a controlled visual construction instruction and witness, with exact decisions not improvised by model;
10. Independent emergent high-impact gap finder reopens any earlier failed category; whole-look, identity and style cohesion across parts.

These ten are AUDIT CATEGORIES, not a memorized questionnaire; ask the important unresolved questions specific to each new subject. Do not simulate ten passes by restating a checklist. Record actual answers/remaining choices/decisions in a review artifact before the FIRST image generation.

Run the real engine check:

    node engine/tools/art_outbox.mjs check-design --film <FILM> --asset <MASTER>

Then obtain actual user design review/approval using the repository's review/sign tool. Missing molecular visual decisions, source grounding or applicable methods are blocking. The rig may define functional movement requirements but not dictate a simplistically convenient head/arm shape.

**Gate C:** visually coherent and deeply source-grounded original master design, no obvious generative loopholes, approved design receipt before generation work.

## 5. EXACT manual GPT art-job operator workflow — use existing P06 exporter/importer

From the actual tested engineering checkout, after story/direction/design permissions are valid:

    node engine/tools/art_outbox.mjs export --film <FILM> --out <OUTBOX>
    node engine/tools/art_outbox.mjs export-gpt-job --film <FILM> --out <OUTBOX> --job <JOB_ID> --stage <K>

This creates a real GPT_ART_HANDOFF ZIP. Open the actual WHAT_TO_DO_IN_CHATGPT.md. It carries a sealed HANDOFF_MANIFEST, full stage request, source witness bytes, approved design, real input master/predecessor if dependent, edit reference, motion requirements, target image size/alpha and hashes.

**Manual GPT chat iteration for EACH job/stage:**
A. Upload the real handoff ZIP and required approved master/predecessor files. Verify installed F01–F80 skill including native source witness access. Identify exact job ID, generation, stage K and intended scene action; report missing file, never invent it.
B. Apply the pre-generation ten-pass design findings to THIS job; comply with the exact source methods and current skill's stronger construction/repair procedure. Keep approved master identity, original material/shape/palette and the precise requested pose/state. No independent "same character" reinvention.
C. Generate actual image bytes using the image tool, not a mere prompt. For derived assets use source-attached image editing of approved master/predecessor, not separately created lookalikes. A flat sprite-sheet is insufficient when individual alpha layers are required.
D. Download unmodified output PNG or SVG as requested. Preserve actual alpha, dimensions and bytes; fill IMPORT_MANIFEST.json with exact SHA-256 and truthful provider/origin claims. Do NOT fabricate hashes.
E. Give the candidate back to Claude:

    node engine/tools/art_outbox.mjs import-gpt-candidates --film <FILM> --out <OUTBOX> --bundle <CANDIDATE_FOLDER>

F. Inspect actual candidate at intended display size AND full pixel resolution, assembled next to the approved master and the native witness regions. Check face/head view, eyes, mouth, hair, clothing, anatomy, hand silhouettes and fingers, underpaint, shadows, background, illumination, material edges, artistic polish and whole-vibe cohesion. Check rendering under real camera crop. A mathematically good fit can still look bad: reject it.
G. If wrong, record a precise failure: candidate SHA, pixel region, applicable F method/visual construction decision, what actually looks wrong, earliest responsible producer, the specific decision to change, expected new visual result and why this rule transfers. Correct the source or predecessor and regenerate just the affected candidates. Repeated blind rerolls are not a repair method.
H. If the actual candidate meets artistic criteria, select exactly that candidate and obtain user approval:

    node engine/tools/art_outbox.mjs select-candidate --out <OUTBOX> --job <JOB_ID> --stage <K> --candidate <ACTUAL_CANDIDATE_ID>

Selecting or importing a candidate is NOT a human approval. No synthetic signatures. Operator provenance is OPERATOR-ATTESTED, not cryptographically proven model compliance.

**Reusability discipline:** MASTER first; derived parts/cels/poses/views refer to approved SHA of master or last predecessor. Changing the master must invalidate linked derived jobs. A rejected view can trigger new view art without deleting previously approved unrelated designs. Track candidate count, actual cost and time to accepted footage.

## 6. Master and derived artwork ingestion — source pixels preserved

For an approved candidate, use:

    node engine/tools/art_outbox.mjs ingest-master --film <FILM> --out <OUTBOX> --asset <MASTER_ID> --file <ACTUAL_FILE.png> --landmarks <REVIEWED_LANDMARKS.json> --provenance GPT_OPERATOR_HANDOFF

A human checks the canonical character at actual film scale, confirms the identity/master SHA and approves through the actual review tool. Then:

    node engine/tools/art_outbox.mjs resume --film <FILM> --out <OUTBOX>

Now dependent states and parts are compiled against approved source pixels. Generate those with the same sealed export/import loop. Import using:

    node engine/tools/art_outbox.mjs ingest-part --film <FILM> --out <OUTBOX> --asset <PART_ID> --file <ACTUAL_PART.png or svg> --landmarks <REVIEWED_LANDMARKS.json> --provenance GPT_OPERATOR_HANDOFF

Review each part, state, edge and approved deformation using actual existing review-part, approve-state and approve-edge operations.

**Rig fitting rules** (never invented before art):
- Exact crop→canonical transform based on real reviewed pixel landmarks, with residual/scale/rotation checks and no arbitrary shear/warping.
- Real head, face, shoulder, elbow, wrist, palm, hip/foot and target contact landmarks only for applicable topology. Every grip socket must be associated with real geometry, not a hypothetical generic hand.
- True painted hidden surfaces for all arm/head/hand movements exposing previously occluded regions; no cropping a flattened master into disconnected tubes.
- Hand wrap needs source-approved near/far finger layers and contact patch; support, shared possession, release and occlusion validated over the whole interval.
- View cel families/face expressions retain same character identity, complexion, costume, material and silhouette. Do not turn a frontal flat painting into an unsupported profile by just rotating it.
- Rest recomposition, camera crop and adjacent pose transitions get independent human visual checks. Low registration error does NOT guarantee compelling visuals.

**Gate D:** approved real artwork with actual hashes, legal source-attached ancestry, measured landmarks, clean alpha and recomposition, precise consumed cels/parts/occluders and human review receipts.

## 7. Post-art executable movement, every-frame validation and owner proof

Claude builds handoff/MOTION_PLAN.json against MOTION_OBLIGATIONS.json and actual art geometry. The P06 semantic performance adapter binds commands to this specific actor's rig and approved profile: gaze/blink/speak/reach/grip/release/hold/point/react, plus legal supported turns and idle.

Actor-specific performance = anticipation, gaze focus, distinct facial emotional shifts, body/support weight, timing/ease, pauses/holds, delayed secondary motion and reactive recovery. The same commands for unlike characters must produce different naturally appropriate performances; no shared hardcoded puppet geometry.

Compute true constraints and painted outcomes for EACH needed frame:
- Independent actor transform ownership, shared prop support/possession and release;
- Joint limits and IK, contact patch normal/distance/orientation and near/far finger ordering;
- Body weight and sole plant stability when locomotion required;
- Mouth/eye/expression channel combinations with no accidental resets;
- Legal deformation/cel/view edges without face-identity drift;
- Real world camera footprint/occlusion/shadows and approved after-state.
- Owner-specific pixels (a camera moving does not prove that Mia blinked or reached).
- Incoming f180 and outgoing f960 story/pose continuity.
A zero-frame test result is NOT a successful feasibility result.

Actual postart command:

    node engine/tools/creative_handoff.mjs post-art --film <FILM>
    node engine/tools/creative_handoff.mjs status --film <FILM>

If refusal, name exact action/frame/art/producer, whether one more drawing, measurement correction, source-motion fix or approved restage is needed. Do NOT silently simplify.

**Gate E:** POSTART_MOTION_FEASIBLE against approved REAL art, plus visual review of actual moving acting. Source-qualified diagnostic tests are not enough.

## 8. Actual final compositor, soundtrack and first real film review

Use one absolute 60fps film clock for Neutrino 2D actor layers, real Blender host shots, model-driven strategy graphics, camera/occlusion and recorded audio. The first [180,960) extract inherits state from complete opening frames [0,180) and retains context at f960. Renderer must not reset the characters at the local clip boundary.

Blender only passes when original approved .blend, armature/face, lighting, floor contact/shadow, camera and required alpha/depth/occlusion surfaces are actually delivered. The adapter's diagnostic capsule is no substitute. Decoder graphics only pass when model inputs/claims recompute the visual result and adversarial false scenarios fail.

Sound: actual WAV lines 48kHz with measured word timing, room ambience, music, sound effects and intentional silence; confirm actual final MP4 includes decoded synchronized audio. Scratch voices may be used for an animatic but are not final audio.

Production commands (verify exact current revision):

    node engine/tools/production_run.mjs preflight --film <FILM>
    node engine/tools/production_run.mjs start --film <FILM>
    node engine/tools/production_run.mjs status --film <FILM>
    node engine/tools/production_run.mjs why --film <FILM> --failure <ID>
    node engine/tools/production_run.mjs resume --film <FILM>

Render/source evidence: exact 780 film frames, 1920×1080 at 60fps, checksums of source art, engine, director, audio, video, true source-frame trace, relevant per-frame owner proof and typed failures. A full regression is rerun only after actual ENGINE changes and on one frozen final SHA, not every art candidate.

USER watches continuous video WITH sound and with pre/post-context. Review true scene humor, emotion, intelligibility, art whole look, identity across views, facial acting, hand/grip/deform/weight, camera pacing, edit, shadows, foreground and background, sound. Signed human final-film review is required. No still contact sheet is enough.

## 9. Four explicit iterative loops and repair learning

**LOOP 1 — CREATIVE/ACTING**, before art: perform the dialogue; assess chemistry, rhythm, laughter, character intention and cause-and-effect. Modify source screenplay/direction with versioned action/audio/asset impact. Repeat rough performance, THEN approve. Cannot fix unfunny dialogue by adding blinking.

**LOOP 2 — F01–F80 ART**, before ingestion: compare candidate's actual native pixels with locked master and source witness method operations; classify generic look, inadequate silhouette, anatomy, face/view inconsistency, incorrect painted parts, materials/edges/lighting, background wrong. Correct named design or image-generation producer and regenerate only affected candidates; human re-reviews.

**LOOP 3 — RIG/ANIMATION**, after ingestion: good artwork cannot reach target, hand grip broken, seam revealed, weight slides, face morph ugly, camera uncovered or occlusion wrong. Repair earliest cause: missing alternate drawing, wrong source landmark, wrong part decomposition, motion producer, actual composition layer or creative staging decision. Do not patch single frames.

**LOOP 4 — CINEMATIC FILM EXPERIENCE**, after MP4: even if code passes, scene can feel stiff, boring, visually incoherent or confusing. Watch complete actual footage at real speed with audio, identify the highest-impact flaw and its producer; repair and rerender only affected shots with neighbor continuity. New approved art or director SHA invalidates dependent clips, not unrelated completed work.

For EVERY repair record: job/shot/action/frame, old SHA, visible/audible defect with pixel/frame evidence, intended result, earliest root cause, responsible producer/method, exact corrective change, impacted DAG nodes, before/after test, unlike-subject transfer when applicable, status and user approval.

PROMOTE reusable art lessons only with verified before/after actual image pixels and human approval plus genuinely unlike-subject transfer; scene-specific hacks never become universal F-method rules. Existing repair_memory.mjs supports these mechanics; qualification requires real images and reviews.

Failure-routing examples:
- Correct coordinates but ugly hand → painted state/art decision, NOT a new IK trick.
- Beautiful hand but wrong prop possession → contact/ownership motion producer.
- Perfect registered frontal head but ugly ¾ turn → commission source-attached alternate view family.
- Face identical but wrong performance → acting/Director or channel timing.
- Camera moves while character frozen → owner-isolated QA.
- Wrong report number → model/data source and typography, not cinematography.
- Bad 3D shadow/ground → Blender camera/light/host matte contract.
- Lost laughter or emotional callback → edit/acting timing and original pre-roll story.
- One obsolete dialogue revision → invalidation of only linked audio/mouth/actions/assets.

**Loop completion:** technical real-source gates PASS, genuine visual material is approved, relevant video is watched and approved. No claim of "flawless automation" before real unexpected scenes have passed the same process.

## 10. Adversarial release checks (must be actual executed tests or HUMAN_ONLY)

| Injected bad behavior | Required failure |
| --- | --- |
| A different-looking Mia image is delivered for a new view | Identity/style visual review + master ancestry FAIL |
| A grip finger layer goes behind the report incorrectly | Near/far contact/painted grip FAIL |
| Open hand stays during 60-frame secure hold | Every-frame hand/prop state FAIL |
| Elbow bends but hidden underpaint missing | Art-demand / rest-comp seam/visual FAIL |
| Front face rotates into extreme profile | Approved view-edge/head-limit FAIL |
| An alternate art state isn't generated | Specific missing ArtJob, not generic placeholder |
| Mia's owner pixels are frozen but camera pans | Per-owner motion proof FAIL |
| f180 resets character expression or object ownership | Prior-frame continuity FAIL |
| Report claims a number contradictory to source model | Source-model/decoder truth FAIL |
| 3D host demo capsule substituted for approved actor | Host asset approval FAIL |
| Final clip has no audio or untimed mouth | Actual audio/mouth validation FAIL |
| Human signature or art-job PNG hash is invented | File/receipt/approval validation FAIL |
| F01–F80 methods listed by name without source-bound decisions | Art design fidelity FAIL |
| New rejected art is promoted as approved master | Human design/master review FAIL |
| One character's rig geometry applied to unlike anatomy | Role/capability + art-first fit FAIL |
| New story beat added solely to satisfy engine route | Human artistic direction gate FAIL |

A written requirement is NOT proof that engine code executes it. Mark each automated control IMPLEMENTED_AND_EXECUTED, IMPLEMENTED_NOT_RUN, MISSING_ENFORCER or HUMAN_ONLY. P06 had 19 code-verified gate classes but zero real-art evidence. Do not convert those to release approvals.

## 11. Mandatory operator handoff outputs and status ledger

**Claude to GPT ART per ArtJob:**
job/generation SHA and stage K; exact handoff ZIP+WHAT_TO_DO; complete script/action source IDs; master/predecessor SHA; applicable F-method witness+decisions; canvas/alpha/projection; specific image state/body part/hidden surfaces; expected contact/view/frame effect; return file requirements; current approval status and refusal if any.

**GPT ART back to Claude per candidate:**
actual generated source file + pixel dimensions, SHA-256/import manifest, model origin claim (truthful operator-attested); exact approved predecessor; whole-look and identity check; visual state and construction evidence; reviewer verdict/repair root cause; required landmark sidecar. No uploaded PNG title alone as proof of exact bytes.

**Claude to USER per rendered clip:**
absolute film frames and previous/next continuity context; actual source+code+art+sound SHA; frame count/fps/pixel size; action owner evidence and negative results; MP4 and audio; which G01–G20 requirements were actually executed on real material; remaining blockers; requested human review exact source digest.

**On interruption:** update EPISODE_STATE.json and HANDOFF.md with verified current stage, source branch/SHA, approved and candidate assets, latest ArtJob and its generation, real image/video hashes and next concrete action. GPT chat memory is not authoritative; use the actual GitHub/source pack and artifact bytes.

## 12. E01 immediate implementation and critical path

1. Keep the completed P06 test evidence (296/296 frozen engine SHA); no new full regression for a docs update.
2. Safely reconcile published engineering branch with SOP and V0.4 proposed director files; preserve actual V0.3 model/Value Blueprint and complete version history.
3. Run provisional read-only V0.4-DIR-P1 mapping (7 shots, 25 actions, 24 audio cues, 27 art families), especially full opening f0–1950 and f180 incoming state. Report exact missing producers, undefined IDs, asset demands and unsupported carry/walk/viseme/turn requirements.
4. Have user approve actual opening screenplay/performance using realistic scratch or final voice; create exact twelve-part Director, creative packet 1.1.0 and actor/profile contracts with genuine current file hashes.
5. Run official creative + hybrid + P06 production preflight; produce canonical real ArtJobs. Export sealed job ZIP(s) for FIRST character/world masters.
6. Open actual F01–F80 art GPT chat WITH the exported ZIP and actual verified installed skill. Ten pregen audits, original canonical artwork, human whole-look review; then source-attached cels/parts/views/underpaint/props in dependency order.
7. Register all approved images; fit acting to measured anatomy and physical contacts; post-art frame scan. Render first genuine 780-frame clip with sound; watch and repair source-level defects until user approves.
8. Then qualify real 3D host, real decoder, contiguous 90–120s hybrid footage; repeat the exact system for full 8–13-minute (or editorially earned longer) film.

**NO GENERIC FALLBACK:** if no human-approved story/direction, no actual preflight/ArtJob, unavailable F01–F80 source witnesses, unapproved master, or missing real art operation, STOP at that precise boundary with complete missing inputs and correction options. Do not pretend the source system is already qualified.
