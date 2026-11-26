# P06 — ONE-RUN REUSABLE PERFORMANCE + HYBRID FILM INTEGRATION CONTRACT
> **CURRENT E01 FILM FRAME NOTE:** V0.4 proposal has a 32.5s opening at absolute [0,1950) and selected 13s clip [180,960) absolute, local [0,780). The older [0,780) scene start in this technical specification must be understood only as CLIP-LOCAL time for this newer proposal. Do not use a stale 0–13s V0.3 director package. After scratch/animatic and explicit user approval, compile approved V0.4 Director and ArtJobs, preserving full-film pre-roll/f180 continuity.

**Normative specification and implementation order. Not a declaration of existing software support.**
**Task:** after the two active P05/development regressions complete, make one controlled engineering implementation pass to connect the six quality failures, reusable semantic commands, Blender host, truthful decoder and 13-second **actual first-film** vertical integration. Do not pause for unrelated long demo renders. Do not fabricate human/GPT external assets or approvals.

**Source:** \`production/better-one-mia-first-film\` branch; P05 code baseline \`945464697dc680956bea670e543c8e0c7beebf1b\`, evidence base \`711ed0fe715d893a56e1aa8fcbed1c89fd702055\`. The currently working local branch from the user's screenshot is \`hv2-system-correction\` and has an unpushed local commit \`6c9201e\`. *Treat that number as screenshot information, not independently fetched and verified source.* Never switch/merge/overwrite while the two reported regressions are running. **First retrieve their actual exit statuses and preserve logs, then examine exact local and remote diff before deciding how to integrate.** Working-tree uncommitted files must be saved without destructive reset/clean.

## 0. Architecture is LOCKED at interfaces, not locked to a bad implementation

**Authority:** approved GPT/user film + Channel Bible → typed per-shot action/acting/art requirements → source-grounded actual GPT images → measured art-first rig → Neutrino 2D + Blender 3D host + source-model-linked motion graphics → one 60fps compositor → actual human-reviewed video. All paths use one film clock and exact source hashes. The human approves new creative/metaphorical decisions. Claude implements real operators and may choose internals only when the observable specified result is preserved and tests prove it. If exact missing art/model/approval blocks completion, it returns a concrete file/ID/constraint rather than silently substituting.

**Reusability is about filmmaking functions, not reusing Mia's face.** New fictional characters have unique masters, geometry, view cels, palettes and performance personalities. Host is uniquely recurring. Shared behavior operators include \`look_at\`, \`blink\`, \`turn_head\`, \`speak\`, \`reach\`, \`grip\`, \`release\`, \`walk\`, \`react\`, \`change_expression\`, plus \`idle\`, \`point\`, \`turn_body\`, \`hold\`, \`prop_react\` where actual film demands them. Each command maps to *that character's own* registered parts, legal cels, limits and approved timing style.

**Motion route per operation:** (A) rigid painted part, (B) articulated fitted part/IK, (C) approved alternate cel/view, (D) bounded approved deform/morph, (E) real Blender rig/pass, (F) model-driven 2D graphics/world/camera. More than one route may act on different layers of the same shot. A missing mode cannot be replaced by a visually inferior technique without approved change.

## 1. Non-negotiable engineering invariant and API shape

**Normative machine-readable draft schema:** `docs/the-better-one/PERFORMANCE_COMMAND_SCHEMA_V1.json` (JSON Schema 2020-12, 14 verb types). First run it under an actual validator; its draft correctness is not established by this document. Wire cross-reference, frame-boundary, capability and rendering rules in actual code rather than treating structural JSON validation as proof of performance.

Introduce a *pure*, versioned semantic performance adapter (suggested module \`engine/art_bridge/performance_commands.mjs\`; check existing code before creating). It consumes a **PerformanceCommand[]** attached to the APPROVED direction action and produces the existing plan surfaces; it is NOT a second parallel timeline or new Neutrino runtime.

Canonical command record (fields are required unless named optional):
- \`id\`: globally stable within film, not the character name.
- \`action_id\` and \`direction_decision_ids[]\`: exact approved creative lineage.
- \`actor_rig_id\`: actual unique rig in the manifest, \`character_profile_id\`: approved separate performance profile.
- \`verb\`: one of the explicitly registered supported command names.
- \`frames:[start,end)\`: integer film frames; time and shot continuity known.
- \`target\`: typed target by canonical world point, subject rig+socket, object+socket, or dialogue/audio-cue ID; never ambiguous text lookup.
- \`intent\`: approved semantic emotional/physical purpose, e.g. "hesitant reach", not a generic easing preset.
- \`required_prestate\` / \`required_poststate\`: structured channel/possession/pose/view/support records, not prose alone.
- \`style_profile_ref\`: approved character-specific movement characteristics, bounded by actual rig limits and the Director's timing.
- \`phases\`: ordered \`{id,frames,goal,expected_owner_effect}\` with gap-free coverage or an explicitly explained hold. No two phases own a single transform at the same instant.
- \`motion_route\`: selected supported route and capability evidence; may require multiple qualified producers for one command.
- \`required_art_refs[]\`: complete canonical master/part/cel/occlusion requirements; machine-derived dependency closure before art generation.
- \`expected_effects[]\`: owner-specific measurable consequences, frame interval, technical negative and human visual criterion.
- \`override_policy\`: explicit precedence / intentional interactions with other commands; no implicit last-writer-wins.
- \`source_digest\`: exact approved creative packet revision.

**Reject** unknown verb, invalid target, unknown rig/joint/socket, unsupported anatomy, missing art, missing approved state edge, unsatisfiable contact, conflicting transform owner, overlapping contradictory state, out-of-film frame, stale packet/asset, missing evidence producer. All are typed failures with \`action_id, command_id, owner, frame_range, failed_invariant, earliest_producer, needed_art_or_capability, user_approval_needed\`.

**Actor rig capability profile** must be derived from actual APPROVED artwork/mesh:
- \`rig_id, identity_master_sha, topology_kind, coordinate_spaces, root, measured_joint_chain_ids, legal_angles, sockets/contact_patch/palm_axis/feet, state_channel_ids, approved_view_cels/edges, deform_map_ids, supported_commands[], style_profile_id, approved_art_sha\`.
- Character profile gives semantics, not bones: \`reaction_delay_frames, preferred anticipation_fraction, ease vocabulary, stride/rhythm/energy limits, gaze speed, follow-through gains, emotional expression-state map\`; actual values require Director/character approval and must fit real measured art.
- **Do not hardcode arm_upper/hand/right** as universal for organisms or diagram objects. Use capability roles + explicitly reviewed rig maps, and refuse if a demanded role has no real approved interface.
- Actor-specific parameters may never override director-required frame boundaries, contacts or approved cels.

**Phase/time laws:** all numbers finite; half-open integer frame ranges; phases ordered; position/angle/velocity constraints measured in a declared space/units. Movie clip 13s = **780 actual frames**, 1920×1080 at 60 fps. A 13-minute final is 46,800 frames, a *separate scale milestone*. Do not bake 780 into a reusable schema.

## 2. Existing P05 sources — EXACT integration points, no wholesale rewrite

| Existing source | Existing responsibility and required P06 connection |
|---|---|
| \`engine/story/creative_adapter.mjs\`, \`creative_packet.mjs\`, \`engine/story/authoring_handoff.mjs\` | Ingest sealed, human-approved GPT decision/action records; compile command intent with no missing decision IDs or invented approval |
| \`engine/story/action_coverage.mjs\` | Typed action ontology and event phases; add only named supported semantic verbs with actual executed consequence measures |
| \`engine/art_bridge/motion_systems.mjs#compilePhrase\` | Multi-owner synchronized phrase tracks. **Not every command needs two owner kinds**: a blink can be a valid single-owner channel operation. Preserve causal-multi-owner checks for actions requiring object consequences; route isolated acting commands through acting/state channel with relevant evidence instead of weakening all phrases |
| \`engine/art_bridge/acting.mjs#compileActing\` | Existing lag, anticipation, settle, breath, follow, gaze, blink and rest/mid/open speech; wire typed commands to valid existing plan. Guard non-finite periods, bad keys, state demand and prompt source ownership |
| \`engine/art_bridge/state_channels.mjs\`, \`asset_state.mjs\`, \`state_timeline.mjs\` | One persistent state history for independent EYES/MOUTH/HAND/EXPRESSION/VIEW etc; command compilation must not reconstruct per-action defaults |
| \`engine/art_bridge/art_demand.mjs#deriveArtDemands\` | Closure of ACTUAL needed images: rest/pose/view/intermediate hand/finger/underpaint, speaking mouth states, blink, mask, world. Generate exact ArtJobs BEFORE real art |
| \`engine/art_bridge/art_intake.mjs\`, \`registration.mjs\` | Import true image bytes, reviewed landmarks, alpha/hidden regions, rest recomposition, fitted rigs; plan infeasibility must not return false success on zero checked frames |
| \`engine/art_bridge/temporal.mjs#compileMotionTracks/#stateAtFrame\` | Real exact-frame motion, constrained IK/support/contact, compiled acting, pose/view channels, no hidden fallbacks; the single normalized adapter compiles into existing plan |
| \`engine/art_bridge/scene_graph.mjs#composeShot\` | Actual painted image pass & grip art, near/far occlusion and shadows; collect correct per-frame actual-owner data including blur |
| \`engine/film/semantic_qa.mjs#verifySemanticConsequences\` | Real consequences for the exact named command; reject \`UNVERIFIED\` as pass for demanded action; full grip hold, requested angle/aperture outcome, directed expression, released possession |
| \`engine/production/stages.mjs\`, \`engine/film/chrome_frames.mjs\` | Bind commands and art/Blender/graphics passes into actual production gate/task and deterministic 60fps Chrome/video; no actor motion hidden by camera/background |
| \`engine/film/audio_mix.mjs\` and final mux | Real measured dialogue alignment, speech-cel schedule, sound cues and exact actual final MP4; don't claim true phoneme sync from three syllable-based mouth states |

**First inspect and reuse exact reachable consumers.** Do not create \`semantic_motion_v2\` sidecar JSON that the renderer never reads. The criterion is one approved command → actual Neutrino/Blender/graphics changes → actual owner pixels/audio; delete the producer in a negative control → named visual consequence fails.

## 3. Per-command behavior obligations and negative controls

| Command | Producer/output required | Crucial negative control |
|---|---|---|
| \`look_at\` | Aim correct eye/gaze or approved head joint toward actual world/rig target in film space; obey available eye art and limited angle; visual eye state must correspond | Remove pupil/head movement while rotating camera; FAIL target gaze despite global pixel difference |
| \`blink\` | Approved EYES open→closed→open cels in exact intended interval; identity and visual layer stable; no blink during prohibited sustained squint | Delete closed-eye cel or suppress state edge; FAIL even if torso moves |
| \`turn_head\` | For small allowed motion, legal rig rotation; when view silhouette changes demand actual approved alternate view cels/inbetweens, shared landmarks and near/far paint; user-chosen threshold per design | Fake three-quarter head with flat front PNG rotation; FAIL |
| \`speak\` | Actual audio line/cue ID, measured temporal alignment, approved MOUTH states; good performance with gaze/face/gesture where director demands it; if only rest/mid/open, explicitly label coarse limited-mouth style | Wrong recorded line or mismatched mouth interval while body sways; FAIL; never claim phoneme-accurate lip sync without phoneme/viseme producer |
| \`reach\` | Anticipation → actual chain IK with measured shoulder/elbow/wrist/palm → object target, stable limits/bend branch and painted seam; no contact claimed before touching | Wrist arrives while elbow stretches/tears or body remains unbalanced; FAIL |
| \`grip\` | Contact target + HAND closure cel, palm basis, near/far fingers, proper occlusion, holder ownership and prop reaction for EVERY required held frame | Inject one middle held frame with open hand/no object link; FAIL regardless of camera/background |
| \`release\` | End of locked contact at specified frame, appropriate HAND opening, true separation/prop after-state and no further holder ownership | Contact record ends but prop stays stuck to hand; FAIL |
| \`walk\` | Approved planted foot intervals, weight/hip body shift, alternating supported steps if biped, silhouette/foot contact and correct transition to rest; topology-specific locomotion or refusal for nonbiped | Move root and swing limbs but planted foot slides by illegal amount; FAIL |
| \`react\` | Character-specific intent drives actual face/gaze/pose/anticipation/recovery and timing; should not be generic "rotation 5°" | Swap reaction intent while leaving owner-expression pixels unchanged; FAIL |
| \`change_expression\` | Approved EXPRESSION channel target and identity-consistent painted face cels; preserve director event priority | Missing target cel or silent same-state substitution; FAIL |
| \`point\` | Actual approved pointed-hand art, arm aim and target focus, correct socket/view/hand layer and elbow silhouette | Hand points opposite object while elbow moves; FAIL |
| \`idle\` | Declared purposeful stillness or approved subtle breathing/eye microstate; optional motion only inside physical/visual limits | Breathing dislocates grasp/contact or steals camera focus; FAIL |
| \`turn_body\` | Source-approved body view/pose transition, actual hips/feet and foreground order where applicable | Mirror front image or teleport feet; FAIL |
| \`hold\` | Preserve pose/contact/object ownership or intentional stillness throughout interval with no unapproved state resets | First/last frame correct but middle frame breaks; FAIL |

**Negative tests must use real production consumers**, not only pure lookup routines. Run on at least TWO geometrically different approved diagnostic rigs (e.g. energetic short figure and elongated narrow figure); after true GPT art arrives, rerun on two actually different commissioned designs and mark real-art transfer status separately. You do not need to force \`walk\` onto non-legged organisms; unsupported topologies must refuse correctly.

## 4. Six historical artwork/animation failure classes — release predicates

**C1 mismatched parts:** master/source-attached generation → actual separated parts → approved rest reassembly with alpha edge/paint seam/bbox/identity check. Test alternate view and unlike rig. Registered fit is NOT a human appearance review.

**C2 impossible drawing:** action-route and art-state closure BEFORE generation; post-art actual joint/hand/view/occlusion feasibility across every required frame. Missing inbetween → precise source-attached new drawing with frame/identity/part requirement. Never stretch a static arm or rotate flat face across an unsupported viewpoint.

**C3 lifeless motion:** director acting track controls preparation, speed/easing, gaze, expression, body support, pauses, delayed follow-through and recovery; combine with character profile without overwriting contact. Test real 13s performance + user native-resolution watch. No pixel-hash trick can declare animation beautiful.

**C4 view identity drift:** canonical master profile, linked multi-view family and approved source-attached images; numerical landmark topology PLUS actual visual review at view-cut/intermediate frames. Wrong face/hair/costume fails identity.

**C5 pasted 3D host:** real approved Blender mesh+armature+face+action, camera calibration and original 2D world proxy ground; exact 60fps RGBA/depth/matte/shadow frame outputs, matching scale/color/light direction/foot contact, foreground occlusion across time. Test actual mixed frame; no faux 2.5D substitute.

**C6 expensive repetition:** reuse command interpreter, art-demand planner, motion operators, scene renderers, performance/style profile framework, host model + action library, graphic calculation primitives and failure regression memory. Do not reuse unrelated characters' faces/meshes/costumes. Track real human work time, candidate rerolls, accepted footage seconds, and changes needed for the second unique character.

A motion operator is *not* qualified merely because it exists. It must have an actual output, actual downstream consumer, negative test, unlike-character transfer and applicable visual review.

## 5. Blender and strategy motion graphics are separate real production modules

### 5.1 Blender host adapter contract
Proposed adapter inputs: \`film_sha, shot_id, [frame0,frame1), scene_blend_sha, host_mesh_sha, rig_action_sha, blender_version, fps=60, shot_camera(3D world→screen), ground_plane, lighting_profile, pass_list, foreground_occluder_ids, sound_cue_ids\`.
Outputs: aligned frame-numbered **RGBA** color pass; shadow catcher/contact pass; depth or object-ID/matte where needed; per-frame camera metadata and source hash; native-resolution composite pass with actual 2D art. Reject mismatched count, camera, color alpha/premultiplication, incorrect occluder ordering, missing shadow/ground, changed mesh without re-render.
Integration proof: approved host enter/stop/point/speak with actual foot/hand contacts; 13s first Mia sequence need not cram in host. A separate real host scene can qualify the Blender route.
**Do not generate a final "approved host" placeholder.** A Blender file with demo cube or dummy stick figure is only a technical adapter test.

### 5.2 Strategy decoder contract
Input: source claim/model card; model variable IDs with unit/source/truth mode; formula graph with constraints/capacity; time-dependent parameter changes; directed animation effect owner per model output; 60fps scene layers and cue IDs.
Output: valid, recomputable model time series and frame-addressed SVG/Neutrino visual state linked one-to-one; clear cause→effect, readable labels, no false scales/percentages; cinematic but legible staging.
Negative: change one value but hold result graph static; replace real counterexample with fake success; invert margin sign; wrongly imply hypothetical Mia data is survey fact — FAIL.

### 5.3 Shared compositor
One absolute frame from film clock selects Neutrino layer state, Blender host pass if in shot, decoder state if in shot, camera depth/occluder layering and audio. Each composite pass has source ID/hash and producer; color/alpha/size consistent. Supports independent source selection and deterministic rerender. Final audio WAV/mux must be checked inside actual final MP4 and tied to same code/art/camera/audio revisions.

**No rigid instruction to install Motion Canvas or Remotion now.** Current SVG/DOM/Neutrino may already provide the needed decoder operators. Specialist package only when approved first film shot requires it and current measured producer fails.

## 6. EXACT staged implementation order after the existing two regressions finish

1. **Preserve tests:** capture frozen P05/regression *actual* exit codes, source commits, log paths, warnings/skips; do not re-run successful full suites just to watch them twice.
2. **Safety diff:** \`git status\`, current local branch \`hv2-system-correction\`, unpushed \`6c9201e\` from screenshot, and \`production/better-one-mia-first-film\` remote. Do not assume these match. Make a non-destructive merge plan; isolate a working child branch from the code containing complete repairs, then cherry-pick/port only authority docs without replacing tested engine files. Any new shared engine change requires fresh affected tests.
3. **Code-to-command matrix:** enumerate current exported \`compileActing\`, \`layerPhrases\`, \`compilePhrase\`, \`compileMotionTracks\`, \`stateAtFrame\`, \`channelEvents\`, \`deriveArtDemands\`, \`verifySemanticConsequences\`, \`composeShot\`, \`art_intake\`. For each command: exact producer, art/interface requirement, plan field, runtime consumer and emitted owner proof.
4. **Implement semantic adapter + strict schema** in a new isolated module that converts approved per-shot performance commands to existing plan structures and checks all capabilities; add versioned performance profile registry that refers to actual rig IDs/role maps. No duplicate clock or fallback source.
5. **Implement complete pre-art demand pass** taking commands + planned action/camera/Blender effects: every reached cel/hand/eye/mouth/view/underpaint/occluder/lighting and transition art requirement must create exact ArtJobs before generation. This is a cross-stage DAG obligation; absent art data produces exact request.
6. **Complete post-art runtime wiring**, actual measured rig, precedence of states and exclusive transform ownership. Verify state persistence and every-frame contact/standing/prop/face visual binding.
7. **Close semantic measures:** all 14 supported commands have named owner effects or refuse. A required 60° open can't pass at 7°. One correct grip frame can't pass a 100-frame hold. An isolated blink cannot be rejected because a multi-owner action phrase demands a prop effect. For unsupported commands fail BEFORE art.
8. **Blender compositing adapter** with explicit source/camera/alpha/frame contract and test-only technical frame passes; if host asset not approved, leave creative host status pending and do not forge one.
9. **Math-backed decoder route** to existing SVG/Chrome renderer with actual variable-to-pixel negative. No new graphics framework unless necessary.
10. **Source-level test suite**: schema, capability/refusal, two unlike rigs, command→Neutrino actual pixels, grip/turn/cel/deform/foot/face negatives, Blender pass metadata/camera/matte, model-driven graphics, audio mux, dirty-revision invalidate, async crash/resume.
11. **Short integration proof** on *bounded* DIAGNOSTIC art proves the software. Run only once and label diagnostic. Do not repeat 120 seconds of artless footage.
12. **First REAL E01 13s film sequence** after GPT/user supply approved creative packet, real images, actual sound and approvals. Select a genuinely directed contiguous shot interval of **780 frames**. Render exact real approved art, all required acting/contacts, and actual mix; inspect 1080p60 moving playback plus crucial frames. User is final artistic authority. The 13s actual shot is retained as finished film footage when approved.
13. **Other modality proofs**: distinct original host+decoder shots, likely each 8–13s, using real film absolute frame windows and approved sources. Don't cram 2D character arc, host entrance and full decoder into 13s if it destroys narrative pacing. Build 90–120s contiguous professional hybrid opening, then full 8–12min feature (13min if editorially earned).
14. **Publish proven exact SHA** and an enforceable quality-gate report for all 20 TBO gates. Status per gate: \`VERIFIED_CODE\`, \`VERIFIED_REAL_ART\`, \`NEEDS_EXTERNAL_ART\`, \`NEEDS_HUMAN\`, \`FAILED\`, \`NOT_APPLICABLE_WITH_REASON\`. No green check by asserting a function exists.

**Critical single-run restriction:** Do all engineering changes supported by available source and test evidence without additional chat prompts; produce a complete, actionable external asset request at the real human/GPT boundary. The single engineering pass is NOT permission to fabricate inputs or override creative locks. No test can guarantee all future artistic problems; system must refuse unproven requirements rather than falsely succeed.

## 7. Minimum evidence artifacts (all required)

\`ENGINE_SOURCE_AND_BRANCH_PROVENANCE.md\`: exact frozen SHA of code tested, remote/working branch differences, existing background task outputs.

\`PERFORMANCE_COMMAND_SCHEMA.json\` + test fixture examples: own normalized representation; adapter to actual P05 plan, no unconsumed creative IDs.

\`PERFORMANCE_COMMAND_IMPLEMENTATION_MATRIX.json\`: each command, actual producer/consumer and plan fields, required art/state, real supported/refused status, positive/negative/transfer test IDs.

\`ART_STATE_CLOSURE_AND_FIT.json\`: output of actual demand closure on two unlike rig families and the approved first film; registered actual art when delivered, no silently missing states.

\`BLENDER_HOST_PASS_CONTRACT.json\`: versioned input/output, camera/transforms, frame order, full compositor requirements and negative tests. Distinguish test-only dummy from approved real host.

\`STRATEGY_DECODER_MODEL_CONTRACT.json\`: variables, source modes/units, formulas, computation→graphics causal tests.

\`13_SECOND_E01_ACCEPTANCE_PLAN.md\`: exact source-approved film script/shot and required assets, 780 frames, audible line(s), state/action/visual test, cost/time, actual render proof; until script exists this is an honest *unfilled exact template*, not an invented approved story.

\`FINAL_ENGINEERING_TAP.tap\`, \`SHORT_INTEGRATION_EVIDENCE.json\`, \`SIX_DEFECT_TRANSFER_MATRIX.json\`, \`TBO_20_GATE_RELEASE_REPORT.json\`: actual tests run and real source hashes; no skipped/unknown counted as pass.

\`REAL_FOOTAGE_LEDGER.csv\`: accepted film source, absolute frames, image/blender/audio SHA, review, human minutes and actual cost. Empty until the first real film shot is approved.

## 8. No-improvisation QA contract

**Never:**
- substitute generic vector/tube limbs or a flat unapproved face for approved GPT artwork;
- make a 3D host out of an unmodeled flat illustration;
- use a "success" field, JSON owner record, whole-frame pixel hash or unrelated camera motion to prove a character's intended acting;
- mark gaze/hand/speech correct because any joint/eye pixel changed;
- silently relax approved mouth/hand/view states or motion intensity to get an easy pass;
- hide abnormal hand/elbow/foot anatomy with camera motion, blur, shadow patches or extra particles;
- self-sign human approvals, invent witness media, claim actual source-backed image creation without the files;
- use old main/P02 schemas and hardcoded 7200 frames to render a 780-frame clip;
- create an entirely new animation backend or add paid generation providers without specific benchmark or approval;
- redo full regressions every edit without evidence that the changed producing source affects those cases;
- declare first film finished from diagnostics or a contact sheet.

**Must always:** produce the intended real pixels on actual asset owner, collect full-range owner evidence, use explicit typed failures, preserve user-approved art and direction, repair earliest faulty producer, and inspect continuous film at normal playback speed.

**Stop/hand off only when:** all code-accessible obligations in this implementation run have been implemented and tested, and the next blocker is real script/GPT images/voice/approved host or human review. Then return exact ArtJobs/assets/actions and status; do not pretend these external inputs are available.

**The real goal:** the first genuine 13-second scene of The Better One, then a coherent hybrid 90–120-second sample and an exceptional complete 8–12-minute film. Code and proof are means to making that film, not separate products.
