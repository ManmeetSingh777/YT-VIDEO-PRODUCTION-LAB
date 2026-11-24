# Registration and motion feasibility (P04 §4)

Engine code: `4433dcec2aa301e91832e1d3a122d03627152db5`. Chained film run `DIAG-20261124000806-742e6f` (DIAGNOSTIC fixture rasters; nothing here is target art).

## Feasibility executed on every required frame (S03) and again with delivered art (S06)

| stage | task | status | measured |
|---|---|---|---|
| S03_TIMING_MOTION | feasibility_nova | COMPLETED | FEASIBLE; 240/240 frames evaluated (plans (supplied restaging plan)) |
| S03_TIMING_MOTION | feasibility_lumen | COMPLETED | FEASIBLE; 6960/6960 frames evaluated (plans (supplied restaging plan)) |
| S03_TIMING_MOTION | feasibility_lever | COMPLETED | FEASIBLE; 240/240 frames evaluated (plans (supplied restaging plan)) |
| S06_REGISTRATION_RIG | feasibility_complete_nova | COMPLETED | FEASIBLE complete |
| S06_REGISTRATION_RIG | feasibility_complete_lumen | COMPLETED | FEASIBLE complete |
| S06_REGISTRATION_RIG | feasibility_complete_lever | COMPLETED | FEASIBLE complete |

## Cross-state, contact, support, deformation and reaction checks

| stage | task | status | measured |
|---|---|---|---|
| S02_EXPERIENCE | direction_approval | COMPLETED | APPROVED |
| S03_TIMING_MOTION | motion_layers | COMPLETED | {"phrases":2,"acting":{"nova_rig":{"lagged":2,"anticipations":2,"settles":2,"blinks":2,"speech_swaps":4,"follow":["hair"],"gaze":"head"},"lumen_rig":{"lagged":3,"anticipations":0,"settles":0,"blinks":58,"speech_swaps":0,"follow":["tail2"],"gaze":"head"}},"suppressed_by_contact":0} |
| S03_TIMING_MOTION | deform_lumen_watch | COMPLETED | 237 active frames verified of 6960/6960 evaluated; worst residual 0.0000 |
| S03_TIMING_MOTION | morph_nova_pull_lever | COMPLETED | 240 active frames verified of 240/240 evaluated; worst residual 0.0000 |
| S03_TIMING_MOTION | reaction_lever_follow | COMPLETED | 130 active frames verified of 130/130 evaluated; worst residual 0.0000 |
| S03_TIMING_MOTION | support_nova_rig | COMPLETED | 240 active frames verified of 240/240 evaluated; worst residual 0.0000 |
| S03_TIMING_MOTION | production_ir | COMPLETED | 18 decisions, 4 actions, 30 art requirements, 22 motion entities: all arrows resolve |
| S03_TIMING_MOTION | direction_decisions | COMPLETED | a_reach=ARTICULATE {"joint":"shoulder_r","rotation_deg":109.535}; a_close=STATE_CHANGE {"states":["open","grip"],"before":"open"}; a_hold=CONTACT {"locked_frames":130}; a_release=STATE_CHANGE {"states":["grip","open"],"before":"grip"}; c_lever=REACT {"rotation_deg":7.7292}; b_watch=ARTICULATE {"joint":"neck1","rotation_deg":18}; b_body=DEFORM {"distinct_weights":150}; d_camera=CAMERA_MOVE {"x":39.9983,"y":39.9983,"zo |
| S03_TIMING_MOTION | framing | COMPLETED | p03_shot_a: 240 frames, subjects nova_rig; p03_shot_b: 240 frames, subjects lumen_rig |
| S03_TIMING_MOTION | semantic_consequences | COMPLETED | 4 consequences met |
| S03_TIMING_MOTION | grip_nova_pull_lever_nova_grip | COMPLETED | contract + HAND hand_r:grip |
| S03_TIMING_MOTION | narration_timeline | COMPLETED | 1 anchors; a_hold FOLLOWS pull_word (40f) |
| S06_REGISTRATION_RIG | contact_patch | COMPLETED | nova_pull_lever:nova_grip: 130 held frames, min cover 288px2 |

## Registration (measured art decides geometry; the approved bytes are never altered)

34 of 34 registration tasks completed. The fitting, residual, pivot, alpha and seam rules are proven by the tests below.

## Refusals for impossible or unevaluated motion

- pass: M02 every quadrant, both bend branches: FK of the returned RADIAN angles reproduces the target; reach limits and degeneracy refuse
- pass: M03 orientation-constrained grip follows a ROTATING target within tolerance; a reversed palm FAILS even with zero XY error
- pass: M05 an out-of-arm reach is solved by bounded root/torso shift with feet planted and balance inside support — or refused, never stretched
- pass: M10 feasibility re-solves EVERY action frame and validates state/view edges (not contact snapshots)
- pass: M12 one phrase drives body, prop, face, camera and sound on shared integer frames with overlap; isolated motion is refused
- pass: M13 seeded particle/phase state is a pure function of (seed, frame): random seek equals sequential replay; shutter samples are deterministic
- pass: S3C-1 method fidelity: the audited Ines brief (F64 bound as hand construction, F05/F52 mislabelled) is refused before compile
- pass: S3C-2 rig-forced generic geometry without source grounding is refused
- pass: S3C-3 absent (or placeholder) molecular_visual_decisions cannot pass
- pass: S3C-4 view agreement: the motion contract carries the rig's canonical view, and a design/motion view mismatch is refused
- pass: S3C-5 alpha agreement: a STRAIGHT-alpha master compiles with transparent_background true (contract-owned), and a design alpha mismatch is refused
- pass: S3C-6 applicability: every method the subject family + motion contract makes applicable is bound faithfully (not all 80)
- pass: S3C-7 a faithful design passes every automated gate but cannot be submitted without a HUMAN design approval
- pass: S3C-8 (E) approved art determines the rig: different arm proportions are FITTED, not refused; infeasible action → restaging required; approved restaging → feasible
- pass: S3C-9 (F) a genuinely unsuitable design fails before generation even when every field has text
- pass: M01 disjoint transform ownership: camera → plane → root → joint → art; double owners, wrong nesting and cycles are refused
- pass: M06 a full turn needs registered view cels; rotating the front PNG is refused
- pass: M07 REGISTERED_MORPH needs homologous topology; EXPLICIT_DEFORM needs an approved, non-flipping map
- pass: M09 cast shadows exist only for occluder→receiver relations; treatment differs by receiver material (no universal crescent)
- pass: M11 portal OUT→MIDDLE→IN shares one aperture with a rim occluder and full mask coverage; an opacity zoom-cut is refused
- pass: M15 a missing state is a typed MISSING_ART_ASSET demand with frames — never substituted by other art
- pass: M07b the PRODUCTION state router refuses a non-homologous vector morph and an unapproved deform map on a state edge
- pass: P02-RP1 attention owners include cameras/worlds/effects: reproduce, negative, unlike transfer
- pass: P02-RP2 pose/state owner resolved from the manifest, never from a scene name: reproduce, negative, unlike transfer
- pass: P02-RP3 frame trace index: world plates traced, camera motion is not a static hold, the film's plan is used
- pass: P02-RP4 downstream reviews do not change the revision they review; upstream approvals still do
- pass: P02-RP5 a failed chunk surfaces its typed failure (partial segment removed after the encoder exits)
- pass: P02-RP6 transition art demand comes from the transition CONTRACT (plates + masks), for any transition id: reproduce, negative, unlike transfer
- pass: P02-RP7 perturbed/test film copies exclude top-level outputs (render/, production/, qa/) — a copy never inherits another run's ledger or segments
- pass: P02-RP8 expected-state hash covers VISIBLE state only: hidden rows that keep animating are not expected motion (no false FROZEN_FRAME)
- pass: P02-RP9 handoff outputs resolve from the store OR the named film file with that exact hash; changed/missing outputs are refused
- pass: P02-RP10 sub-frame (shutter) sample times keep their integer frame's shot, camera and actions; continuous motion interpolates
- pass: P02-R14 frames trace back to output hash, shot score, actions, rig state, approved bytes, registration, design decisions with F-source hashes, story/direction and narration — on both families
- pass: E1 raster mesh deformation: start = identity, middle = half, end = targets; the deformed copy replaces the rigid pass in the scene rows
- pass: E2 negatives: inverted triangles, a mesh leaving the approved pixels, and incompatible vector topology are refused
- pass: E3 vector morph: approved homologous paths interpolate (middle = midpoint of control points) and are written as the path d each frame
- pass: F1 grip: position + orientation + closure + near/far are checked on every hold frame; a reversed palm and a lost near/far order fail
- pass: F2 planted feet and weight transfer: soles stay on their targets for every frame; the centre of mass moves before the lever does
- pass: F3 object reaction is causal: the lever follows the pull (zero residual) and is static without the reaction contract
- pass: F4 dynamic cast shadow: emitted from the approved occluder drawing, moves with it, keeps floor contact, material treatment applied
- pass: P04-5.7 framing: every frame of the path — a cropped attended subject, an unexplained crop and over-enlarged art are refused; a declared crop passes
- pass: P04-5.7b a rotation-only camera is a MOVING interval (the trace index read a key that no camera has)
- pass: P04-5.3b contact patch on approved pixels: held frames measured; a hand drawing that does not cover the handle fails although the coordinate matches
- pass: P04-5.3c finger topology: near drawings above the prop, far drawings below; an undeclared WRAP and an inverted finger layer fail
- pass: P04-5.1 event priority is explicit and order-independent; equal-priority contradictions fail
- pass: P04-5.2 acting limits: zero/NaN periods, out-of-film frames and self-driven springs are refused immediately (no hang)
- pass: P04-5.3 grip: no contract = blocking; body GRIP with an OPEN hand fails; a closed hand with a valid contract is evaluated; fingers behind the prop fail; unrelated prop motion fails
- pass: P04-5.5 deformation: duplicate/overlapping triangles and partial coverage refused; a map renders only under a verified approval that binds geometry and pixels
- pass: P04-4.1/4.2 feasibility: zero plans = NOT_EVALUATED; every frame evaluated; a per-frame exception and a failing state are failures; NOT_APPLICABLE is never feasible

## Limits

- Landmarks are supplied by a reviewer (sidecar); there is no automatic landmark detection on real GPT art.
- No genuine GPT artwork has been registered. These results show the mechanism on fixtures only.
