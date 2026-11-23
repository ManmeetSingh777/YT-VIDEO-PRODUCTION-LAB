# 10-second canary contract — hv2_film001 frames [1320, 1920)

Generated read-only by `engine/tools/canary_contract.mjs` from the film's real contracts. No job was exported, no image was generated, nothing was approved.

- Stage: 1920×1080 @ 60 fps, 600 frames (10.0 s). Valid: **true**.
- Shots: S02 [900,1920] camera cam_S02.
- Actions: S02_operate_washer (ARTICULATED); S02_room_life (PROCEDURAL); S02_push_in (CAMERA_WORLD); S02_porthole (TRANSITION).
- Authority: story **NO_RECEIPT**, direction **NO_RECEIPT**.

## Required capabilities

| capability | status | declared in the film | still needed |
|---|---|---|---|
| polished_art | BLOCKED_ON_GPT_ART | 52 planned assets demanded in the window | 52 assets still to be generated via the manual ChatGPT route and approved by a human |
| separate_parts | DECLARED | washer_rig: 6 parts / 5 joints; ines_rig: 22 parts / 15 joints | — |
| acting | MISSING_CONTRACT | no plan.acting block | ines_rig: declare an EYES channel (open/closed) over the eye slot(s) — name hint: ines_face_eyes<br>ines_rig: declare a MOUTH channel (rest/open/mid) over the mouth slot(s) — name hint: ines_face_mouth<br>ines_rig: expression drawings are bound through POSE states (neutral, curious, hand_open, hand_pinch); move them to an EXPRESSION channel (P03 B) |
| grip_pull_release | MISSING_CONTRACT | S02_operate_washer ines_grip_r→washer_handle [1320,1392) | plan.grips: palm/handle basis, closure state, near/far for each GRIP contact (direction + art review) |
| weight_transfer | MISSING_CONTRACT | ines_sole_l [900,1920) | plan.support: feet sockets, mass joints, grip_support (and a second PLANT contact if both feet are visible) |
| mechanism_reaction | MISSING_CONTRACT | washer_rig | plan.reactions for washer_rig: reacting joint + handle socket + driver joint + frames |
| occlusion_deformation | MISSING_CONTRACT | paint_order false; deform_maps false; morphs false | plan.paint_order between the hand/arm and the machine parts it reaches across<br>a deformation map (approved mesh, receipt) or a vector morph (two homologous approved VECTOR_PATH drawings) |
| secondary_motion | MISSING_CONTRACT | none | — |
| purposeful_camera | DECLARED | 3 camera keys in window | — |
| audio_sync | BLOCKED_EXTERNAL | narration none; alignment none; buses false | a RECORDED narration line for the window (a test tone is not acceptable) + its measured forced alignment<br>SFX/music files and plan.audio_buses |

## ArtJob packet (52 planned assets demanded in the window)

| order | asset | kind | alpha | joint / pivot | ArtJob | outbox status | blocked on |
|---|---|---|---|---|---|---|---|
| 1 | drum_in | TRANSITION_PLATE | OPAQUE | — / — | ARTJOB_MASTER_drum_in_4c40db2c | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER |
| 1 | ines_master | MASTER | STRAIGHT | — / — | ARTJOB_MASTER_ines_master_211539ad | WAITING_FOR_APPROVALS_THEN_GPT_ART | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER |
| 1 | washer_master | MASTER | STRAIGHT | — / — | ARTJOB_MASTER_washer_master_38ddfd06 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER |
| 2 | ines_arm_l_far | PART | STRAIGHT | shoulder_l / shoulder_l | ARTJOB_PART_OR_STATE_ines_arm_l_far_6c406170 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_brow | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_brow_90370167 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_coat_hem | PART | STRAIGHT | pelvis / pelvis | ARTJOB_PART_OR_STATE_ines_coat_hem_0d4df647 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_elbow_r_underpaint | UNDERPAINT | STRAIGHT | elbow_r / elbow_r | ARTJOB_UNDERPAINT_ines_elbow_r_underpaint_7bc0388f | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_face_eyes | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_eyes_42eedf3d | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_face_mouth | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_mouth_eba1297a | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_foot_l_far | PART | STRAIGHT | ankle_l / ankle_l | ARTJOB_PART_OR_STATE_ines_foot_l_far_0b889bea | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_foot_r | PART | STRAIGHT | ankle_r / ankle_r | ARTJOB_PART_OR_STATE_ines_foot_r_51d5fe63 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_forearm_l_far | PART | STRAIGHT | elbow_l / elbow_l | ARTJOB_PART_OR_STATE_ines_forearm_l_far_cc9e4a93 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_forearm_r | PART | STRAIGHT | elbow_r / elbow_r | ARTJOB_PART_OR_STATE_ines_forearm_r_c2b7425a | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_hair_back | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_hair_back_336e79d6 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_hand_l_far | PART | STRAIGHT | wrist_l / wrist_l | ARTJOB_PART_OR_STATE_ines_hand_l_far_a2f91796 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_hand_r_far_fingers | PART | STRAIGHT | wrist_r / wrist_r | ARTJOB_PART_OR_STATE_ines_hand_r_far_fingers_080552d5 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_hand_r_near_fingers | PART | STRAIGHT | wrist_r / wrist_r | ARTJOB_PART_OR_STATE_ines_hand_r_near_fingers_f9dda600 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_hand_r_palm | PART | STRAIGHT | wrist_r / wrist_r | ARTJOB_PART_OR_STATE_ines_hand_r_palm_f913c5d6 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_head | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_head_54537212 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_leg_l_far | PART | STRAIGHT | hip_l / hip_l | ARTJOB_PART_OR_STATE_ines_leg_l_far_fca949a0 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_leg_r | PART | STRAIGHT | hip_r / hip_r | ARTJOB_PART_OR_STATE_ines_leg_r_0c77ff6c | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_shin_l_far | PART | STRAIGHT | knee_l / knee_l | ARTJOB_PART_OR_STATE_ines_shin_l_far_9049fa68 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_shin_r | PART | STRAIGHT | knee_r / knee_r | ARTJOB_PART_OR_STATE_ines_shin_r_53098108 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_sleeve_r | PART | STRAIGHT | shoulder_r / shoulder_r | ARTJOB_PART_OR_STATE_ines_sleeve_r_034ca407 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | ines_torso | PART | STRAIGHT | pelvis / pelvis | ARTJOB_PART_OR_STATE_ines_torso_1a45acc0 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_cabinet | PART | STRAIGHT | body / base | ARTJOB_PART_OR_STATE_washer_cabinet_5ffba447 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_coin_flap | PART | STRAIGHT | coin_flap / coin_slot | ARTJOB_PART_OR_STATE_washer_coin_flap_be988a70 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_glass | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_glass_ec07d877 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_glass_half | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_glass_half_45ebad5f | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_glass_open | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_glass_open_75da9602 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_ring | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_ring_dba9e80d | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_ring_half | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_ring_half_6fee6a08 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_door_ring_open | PART | STRAIGHT | door / hinge | ARTJOB_PART_OR_STATE_washer_door_ring_open_724eb66c | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_drum_interior | PART | STRAIGHT | drum / hub | ARTJOB_PART_OR_STATE_washer_drum_interior_07cee76b | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_laundry_load | PART | STRAIGHT | drum / hub | ARTJOB_PART_OR_STATE_washer_laundry_load_59d67832 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 2 | washer_laundry_load_tumbling | PART | STRAIGHT | drum / hub | ARTJOB_PART_OR_STATE_washer_laundry_load_tumbling_6b8e4e3b | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_brow_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_brow_profile_9619c7dc | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_brow_raised | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_brow_raised_dc2469a3 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_eyes_curious | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_eyes_curious_5ea80f82 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_eyes_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_eyes_profile_fc7b2bc3 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_eyes_soft_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_eyes_soft_profile_930ab277 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_mouth_open | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_mouth_open_4b7b3c7e | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_mouth_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_mouth_profile_ef46a1ec | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_face_mouth_smile_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_face_mouth_smile_profile_b179b156 | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_hair_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_hair_profile_b251db12 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_hand_r_far_pinch | PART | STRAIGHT | wrist_r / wrist_r | ARTJOB_PART_OR_STATE_ines_hand_r_far_pinch_b2fa8fed | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_hand_r_near_pinch | PART | STRAIGHT | wrist_r / wrist_r | ARTJOB_PART_OR_STATE_ines_hand_r_near_pinch_7a878511 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_head_profile | PART | STRAIGHT | neck / neck | ARTJOB_PART_OR_STATE_ines_head_profile_4d996da5 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 3 | ines_torso_profile | PART | STRAIGHT | pelvis / pelvis | ARTJOB_PART_OR_STATE_ines_torso_profile_b7967157 | WAITING_ON_MASTER_APPROVAL | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 4 | porthole_aperture | MASK | STRAIGHT | — / — | ARTJOB_TRANSITION_PLATE_porthole_aperture_987ddfbc | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 4 | porthole_glass_middle | TRANSITION_PLATE | OPAQUE | — / — | ARTJOB_TRANSITION_PLATE_porthole_glass_middle_613e64fa | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |
| 4 | porthole_out | TRANSITION_PLATE | OPAQUE | — / — | ARTJOB_TRANSITION_PLATE_porthole_out_0e3a99ce | BLOCKED_CONTRACT | STORY_APPROVAL_REQUIRED, DIRECTION_APPROVAL_REQUIRED, ART_CONTRACT_REFUSED, NO_IMAGE_PROVIDER, MASTER_APPROVAL |

### Proposed plan amendments (new channel states; NOT in the plan until approved)

- `ines_face_eyes_closed` (PART, from ines_master, joint neck): EYES channel closed state (blink) for slot ines_face_eyes. PROPOSED_PLAN_AMENDMENT (needs direction + art-plan approval).
- `ines_face_mouth_mid` (PART, from ines_master, joint neck): MOUTH channel mid state (speech) for slot ines_face_mouth. PROPOSED_PLAN_AMENDMENT (needs direction + art-plan approval).

### Unplanned demands (blocking)

- `ines_grip_r::GRIP_hand_state`: GRIP contact ines_grip_r→washer_handle needs a closure drawing
- `ines_pinch_r::FOLLOW_hand_state`: FOLLOW contact ines_pinch_r→washer_coin_slot needs a closure drawing
- `w_laundromat`: camera cam_S02 needs coverage [-76.8,-43.2,2073.6,1166.4] at ≥2.145 px/unit

## Manual ChatGPT route (no API spend)

For each job, in manufacturing order (masters first; a derived edit only after its master is approved):

1. Once story, direction and the master's design are approved: `node engine/tools/art_outbox.mjs export-gpt-job --film films/hv2_film001 --job <ArtJob> [--stage K]`.
2. Open the zip and follow `WHAT_TO_DO_IN_CHATGPT.md`. Attach every witness and the master/predecessor it names, paste `REQUEST_PROMPT.txt` exactly, and download the PNG(s) unmodified.
3. `node engine/tools/art_outbox.mjs import-gpt-candidates --film … --bundle <returned dir>`. Import approves nothing.
4. Selection → `art_intake.mjs ingest-master|ingest-part` with a reviewed landmark sidecar → independent HUMAN review → approve states/edges (signed envelopes).

## Stop point

story/direction approvals and GPT art are external human/operator dependencies; this contract stops at the art-delivery boundary. Blocking: polished_art: BLOCKED_ON_GPT_ART; acting: MISSING_CONTRACT; grip_pull_release: MISSING_CONTRACT; weight_transfer: MISSING_CONTRACT; mechanism_reaction: MISSING_CONTRACT; occlusion_deformation: MISSING_CONTRACT; secondary_motion: MISSING_CONTRACT; audio_sync: BLOCKED_EXTERNAL.
