# How each P08 contract is reached from the packet (read against the code in `03_VALIDATORS/` and `04_P08_CONTRACTS/`)

The executable creative packet is **v1.1.0** (`02_SCHEMAS/creative_packet_v1_1.schema.json`).

- **Engine plan-level contracts.** Most P08 contracts are plan-level contracts that the engine compiles: `plan.composition`,
  `plan.time_remaps`, `plan.grades`, `plan.camera_ops`, `plan.pinch_contracts`, `prop_support`, `contact_continuity`, `photo_intent` and the
  manifest `face` / `edges` / `face_composition`.
  - **They are NOT packet fields.** The packet has `additionalProperties:false` everywhere.
  - Do not add these keys to the packet. Direct the behaviour in the packet fields named below, and the engine compiles the contract
    during reconciliation.
- **Where no packet field carries a needed fact,** the row says so. The fact is then carried by the hash-bound P3.2 source tables the
  packet attaches in `source.documents`.

**Who compiles what (exact, at this SHA).**
- `creative_handoff.mjs accept` compiles the packet into:
  - the manifest, `SEMANTIC_ACTIONS`, `ACTION_PHRASES`, `SHOT_SCORE`, `MOTION_OBLIGATIONS`;
  - the art dependency plan.
  - Pinch and speech obligations are carried through. See `FIELD_MAP` in `creative_adapter.mjs`.
- **There is no automatic packet → P08-plan compiler.** The P08 plan contracts in `handoff/MOTION_PLAN.json` are written by Claude
  during reconciliation, *from* the accepted packet and these source tables.
- **Then they are checked:**
  - by every P08 validator;
  - by the film-level action/frame obligation ledger (A01, being implemented), which must show that every packet action in [0,960) has
    a compiled producer, the right owner, no overwritten channel, and a rendered effect.
- **What GPT supplies:** complete, exact direction in the packet fields below. Nothing in this table needs a field the schema lacks.

| P08 contract (engine) | Packet input that directs it | Engine producer | State at this SHA |
|---|---|---|---|
| COMPOSITION_CONTRACT v1 (A01/A03): JOINT_ROTATE, ROOT_MOVE, OSCILLATE, AIM, STATE_SWAP, PLANT, REACH, CAMERA_MOVE, WALK, CARRY, LOAD_CONTAINER, INSERT_TOKEN | `actions[]` (`mode`, `verb_class`, `phases[]`, `staging[]`, `pose_events`, `view_events`, `state_events`, `contact_events`, `min_angle_deg`, `target_state`, `visible_result`) | `composition.mjs#compileComposition` → `temporal.stateAtFrame` | CODE_VERIFIED on diagnostic fixtures |
| CONTACT_CONTINUITY 1.0.0 (A02) | `actions[].contact_events[]` (`$defs.contact`: same `source_socket`/`target_socket` across actions = one contact) + `scope.outgoing_continuity` | `contact_continuity.mjs` | CODE_VERIFIED |
| PROP_SUPPORT 1.1.0 (B01): ACTOR / OBJECT / SURFACE / FREE authority + transfers | `contact_events` (GRIP / SUPPORT / PLANT with frames; transfers = an overlapping hand-off of two contacts) | `prop_support.mjs` + `temporal.mjs` | CODE_VERIFIED |
| Oriented contacts (B02) | `contact_events[].palm_landmarks`, `handle_landmarks` | IK palm basis | CODE_VERIFIED (production contacts need a basis) |
| PINCH_CONTRACT 1.0.0 (B03) | `contact_events[].type: "PINCH"`, `topology`, `finger_layers {near, far}`, `closure_channel` / `closure_state` | `pinch.mjs` | CODE_VERIFIED |
| WALK + path targets (B04) | an `actions[]` row with `mode: ARTICULATED`, `phases` naming the step(s), `contact_events` of `type: PLANT` per sole | composition WALK | CODE_VERIFIED. **A27 is cropped:** it needs sole sockets even when the feet are offscreen, or an approved gait cel cycle |
| CARRY / LOAD_CONTAINER / INSERT_TOKEN (B07) | `contact_events` + `art_requirements[].draw_order` (front/aperture layers) | composition + prop_support | CODE_VERIFIED |
| EXPRESSION_TRANSITION 1.0.0 (C02) | `state_events[]` with `transition: {policy: "INTERMEDIATE", intermediate_states: [...]}` (`$defs.policy`) | performance_commands `change_expression` | CODE_VERIFIED |
| SPEECH_ALIGNMENT 1.0.0 + VISEME route (C03) | a `story.narration[]` line + an `audio_cues[]` `kind: "NARRATION"` cue naming it. The speaker and mouth route go in **HYBRID_CONTRACT.dialogue** (`mouth_scheme: "VISEME"`, `alignment_file` = the measured MFA timing, `audio_sha256`). The speaker identity's `acting.speech` names the mouth channel. | `speech_visemes.mjs` (EN_ARPABET_VISEME_V1, 800 samples/frame) | CODE_VERIFIED. Real E01 phones are reproduced 86/86 (`E01_SPEECH_PREFLIGHT_SUMMARY.json`) |
| face_composition (C04) | `identities[].rig.channels`, `art_requirements[].state.{eyes,mouth,expression,view}`, `required_parts` | manifest `rig.face_composition` (compiled) | CODE_VERIFIED. Pupil containment still uses a bbox (being closed) |
| Attention windows (C05) | `shots[].attention[] {frames, target}` | coverage / attention gates | windows exist; the readable-window gate is being closed |
| time_remaps (E01): owner-group freeze | `scope.outgoing_continuity` (f959 freeze) and the action `phases` text | `temporal.mjs` `plan.time_remaps` | CODE_VERIFIED. The freeze itself is phase 2, outside [0,960) |
| grades (E02) | **no packet field.** Direct it in `decisions[].intent` / `shots[].contract` text | `plan.grades` | CODE_VERIFIED. Not needed in [0,960) |
| camera_ops DOLLY / ORBIT (E05) | `shots[].camera.moves[].operation` (`STATIC` … `ORBIT`, `DOLLY_3D`) | `plan.camera_ops` | CODE_VERIFIED |
| Host perspective camera (E03) | HYBRID_CONTRACT `hosts[].camera {type: "PERSP", lens_mm, sensor_width_mm, …}` | `host3d/host_pass.mjs#projectCamera` | CODE_VERIFIED. Not used in [0,960) |
| Per-pixel host depth/matte (E04) | HYBRID_CONTRACT `hosts[]` | **not implemented yet** | BLOCKED_IMPLEMENTATION. **Does not block phase 1** (no host in [0,960)) |
| PHOTO_INTENT 1.0.0 (E07): lens aim, subject, privacy | **no packet field.** Direct it in the photo action's `phases[]`, `target`, `visible_result`, plus a `decisions[]` row (A13/A15). The phone's LENS socket is an art landmark (`art_requirements[].landmarks`). | `photo_intent.mjs` | CODE_VERIFIED. The engine compiles the intent; no privacy is assumed beyond what is directed |
| PHASE_OUTGOING_BOUNDARY 1.0.0 (A04) | `scope.outgoing_continuity[]` (frame 959) | `phase_boundary.mjs` | CODE_VERIFIED |
| Phase audio (F01) | `audio_cues[].frames` on the phase clock. AUD11 crosses f960: carry it as [861,960) + an outgoing continuity line | `phase_audio.mjs` | CODE_VERIFIED |
| CAPTION_OVERLAY (P3.2 issue 7) | **no packet field.** The approved SRT/VTT files are attached by hash in `source.documents` (role `captions`) | being implemented (frame-clock compositor + lane QA) | NEEDS_ENGINE_PRODUCER. Does not block the master ArtJobs |
| Native resolution (D03) | `identities[].on_stage_height_px`, `art_requirements[].overscan_required/overscan_rect` | registration MEASURE_FRAME | gate being closed |
