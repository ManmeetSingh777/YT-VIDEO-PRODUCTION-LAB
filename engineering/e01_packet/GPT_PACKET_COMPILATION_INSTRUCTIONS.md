# E01 phase 1: compile the approved P3.2 direction into an executable CREATIVE_PACKET (instructions for Creative Production GPT)

## 0. What you produce, and what you must not do
Return one ZIP named `E01_PHASE1_CREATIVE_PACKET_<yyyymmdd>.zip` containing:

| File | What it is |
|---|---|
| `CREATIVE_PACKET.json` | version `"1.1.0"`. It must validate against `02_SCHEMAS/creative_packet_v1_1.schema.json`, and the field list is `01_READ_FIRST/FIELD_REFERENCE_v1_1.md`. |
| `HYBRID_CONTRACT.json` | version `"1.0.0"`. It carries the Better One dialogue routing (see §5), and `packet_sha256` is left as `"PENDING_CLAUDE_DIGEST"`. Claude computes the canonical digest. |
| `COMPILATION_NOTES.md` | Every place where you had to choose, each pointing to the P3.2 row that justifies it, plus every open question. |

**Do not:**
- add any key that is not in the schema (every object is `additionalProperties:false`);
- copy obsolete examples: the v1.0.0 draft in `docs/gpt-creative-control` cannot be imported;
- re-author approved direction;
- invent timings, phones, hashes, landmarks positions or approvals;
- write `"CREATIVE_APPROVED"`.

Set `approval: {"status": "CREATIVE_REVIEW_REQUIRED", "receipt": null}`. The human signs the packet digest afterwards with
`review_sign.mjs`. A receipt typed into JSON is never accepted.

## 1. Authority and the approval scope (exact)
**Approved by the user** (statement of 2026-11-26):
- D1–D6;
- the selected audio identities, performances and chuckle (`AUDIO_APPROVAL_RECORD_P3_1.json`, unchanged in P3.2);
- the **revised P3.2 animatic's creative composition, blocking, timing and performance intentions for phase-one production**.

**Not approved:**
- temporary drawings, temporary motion, the final mix, production artwork, the executable packet itself, phases after f960, and the ending.

Write the approval scope into `decisions[]` and `COMPILATION_NOTES.md` as exactly that, and nothing wider.

## 2. Fixed values (do not change)
```json
"stage": { "width": 1920, "height": 1080, "fps": 60, "total_frames": 960 },
"scope": {
  "kind": "PRODUCTION_PHASE", "phase_id": "E01_S001_PHASE1",
  "parent_frames": [0, 1950], "frames": [0, 960], "qualification_frames": [180, 960],
  "parent_source_sha256": "b8933e6c5c013659db65493168fc1e049fd0e646166b576113e233a87160217d",
  "excluded_shot_ids": ["E01-S001-SH04", "E01-S001-SH05", "E01-S001-SH06", "E01-S001-SH07"],
  "outgoing_continuity": [{ "frame": 959, "owners": ["<every live owner id at f959>"],
    "obligation": "every live owner's exact f959 pose, contact, possession, gaze and expression is the frozen state of f960; AUD01 room bed and AUD11 tail continue into the freeze",
    "consumer": "E01 phase 2 (SH04 freeze) — not yet approved" }],
  "approval_statement": "Approves ONLY E01 frames [0,960) (SH01–SH03) of the 32.5 s opening; frames [960,1950) are NOT approved by this digest."
}
```

**Source hashes.** Use exactly the hashes in `01_READ_FIRST/SOURCE_HASHES.json`:
- **`source.direction_spec`** = `inputs/EXPERIENCE_DIRECTOR_V1.md`, with its sha256.
- **`source.art_skill`** = `"construct-kurzgesagt-art"`, with the `SKILL.md` sha256.
- **`source.script_file`** = the parent screenplay `E01_OPENING_SCREENPLAY_V0_4_P1.md`, with its sha256.
- **`source.documents[]` must include**, each `{role, file, sha256}`:
  - role `parent_director`: `E01_EXPERIENCE_DIRECTOR_V0_4_P1.md`. Its hash **is** `scope.parent_source_sha256`, and the validator checks this.
  - role `phase_director`: `E01_EXPERIENCE_DIRECTOR_PHASE1_P3.md`.
  - roles `action_plan`, `shot_timeline`, `audio_cue_plan`, `continuity`, `performance_states`, `art_requirements`, `storyboard`,
    `storyboard_index`, `delta_manifest`, `take_selections` and `audio_approval`: one per matching P3.2 file.
  - role `captions`: `PHASE1_DIALOGUE.srt`, `PHASE1_DIALOGUE.vtt`, `PHASE1_SDH.srt` and `PHASE1_SDH.vtt`.

`source.source_witness_manifest`: name the F01–F80 witness manifest the art chat uses, or `null` if none is declared yet (say so in the notes).

**Clock.** Frames are half-open `[a,b)` on the 60 fps absolute clock from f0. The shots are exactly the P3.2 timeline:
- SH01 `[0,444)`
- SH02 `[444,588)`
- SH03 `[588,960)`

The P07 plan's 432/576 boundaries are obsolete.

## 3. Ids (preserve every one; no renumbering)
- **Actions (19):** A01–A10, A12–A19 and **A27**, with the exact P3.2 intervals. A11 does not exist, so do not create it.
- **Audio cues:** AUD01–AUD14 and AUD20, with the exact frames and samples from `E01_AUDIO_CUE_PLAN_PHASE1_P3.csv`.
- **Identities:** CHAR_MIA, CHAR_REGULAR, CHAR_LEAD; PROP_AWARD, PROP_REPORT, PROP_PHONE; WORLD_RESTAURANT.
  - The background owners are written `BG_DINER_A/B` in P3.2. **Split that into two ids, `BG_DINER_A` and `BG_DINER_B`** (`/` is not a
    valid id character), and record the split in the notes.
  - BG_OCCUPANCY and BG_QUEUE are kept.
- **Art families:** keep ART_M01–M06, ART_R01/R02, ART_L01/L02, ART_P01–P03, ART_ENV01, ART_CAM01, ART_BG01/02, … as the `art_requirements[].id`
  prefixes. A MASTER per identity comes first, and every derived item names its `master_id`.

## 4. Mapping P3.2 → packet fields
| P3.2 source | Packet field(s) |
|---|---|
| Shot timeline + director §shots | `shots[]`: `frames`, `world_id`, `opening_state`/`ending_state`, `content_kinds`, `attention[] {frames, target}` (the directed readable windows, which the engine now gates: give real targets and durations), `camera {track_id, moves[] {frames, operation, purpose}}` (SH01: locked 1.45× crop = `STATIC` with that purpose; SH02 insert as directed), `entry_states`/`exit_states`, `hold_purpose`, and `contract` (all 12 Experience Director fields, none empty) |
| Director decisions (D1–D6, DEC-04x) | `decisions[]`: `consumer_ids` must name the actions/cues that consume each decision, and each of those actions lists it back in `direction_ids` (both directions are checked) |
| Action plan rows | `actions[]`: see below |
| PERFORMANCE_STATES_P3_2.csv | The `actions[].state_events` / `view_events` / `pose_events` of the owning action (`rig`, `channel`, `state`, `frame`, `transition`). A grin/social-smile crossing that the board says is multi-component uses `transition.policy: "INTERMEDIATE"` with the named intermediate states; never a single SWAP. |
| Contacts (award 284/295/296/306/320/342; report 350/360/367/368/380/416; phone grip; thumb 891–912) | `actions[].contact_events[]` (`$defs.contact`): `type` (GRIP / PINCH / SUPPORT / PLANT / …), `source_socket`, `target_socket`, `frames`, `release_required`, `topology` (WRAP for the two-hand award and report grips: give `finger_layers {near, far}`), `closure_channel`/`closure_state`, `palm_landmarks`, `handle_landmarks`. A hand-off is two overlapping contacts on the same `target_socket`, never a jump. |
| ART_REQUIREMENTS_PHASE1_P3_2.md + existing unsigned art preparation | `art_requirements[]`: change only the P3.2-affected items (M02–M06, P01–P03, L01/L02, R01/R02, ENV01, CAM01, BG01/02). For every derived part: `state {view, pose, expression, eyes, mouth, hand, lighting, occlusion}`, `landmarks` (names only, no positions), `hidden_surfaces`, `underpaint` or `no_underpaint_reason`, `draw_order`, `depth_band`, `alpha_mode`, `joint`/`pivot_landmark`. **Do not enumerate viseme mouths:** the engine derives the needed (view, family, viseme) tuples from the measured phones and lists them back as ArtJobs. |
| Audio cue plan | `audio_cues[]`: each spoken line is a `story.narration[]` entry (`id`, `text`, `frames`, `claim_ids`) with a `kind: "NARRATION"` cue naming it in `narration_line`; the room bed, score and SFX are `SFX`/`MUSIC`. Give `source_file` (basename) and `gain_db` per the take selection. Set `relation`/`event`/`word_index` only where P3.2 ties a cue to an action or word. |
| Story (V0.4 + value blueprint) | `story.audience_question`, `central_insight`, `mechanisms[]` (with `epistemic_status`; any SOURCED claim needs `source_refs`; an UNVERIFIED claim cannot be shown as settled), `contract {claims, mechanisms, obstacles}` |
| Identities | `identities[]`: `master_art`, `views`, `method_ids` (F01–F80 ids from the skill), `palette_roles`, `on_stage_height_px` (SH01 Mia nominal 174 px, target 160–190, per P3.2 issue 2), and `rig` (`joints` with landmark *names* and `limits_deg`, `parts`, `sockets` including the phone LENS and the thumb/finger/pinch sockets, `ik`, `channels`, `poses`, `views`, `edges`). The `acting` block: `speech {channel, rest, open, mid}` for every speaker, `blink`, and `gaze`. |

**Actions in detail.** Each row of `E01_ACTION_PLAN_PHASE1_P3.csv` becomes one `actions[]` entry with the same id.
- **`owner`:** the first owner the row names. Every other owner of the row appears in `staging[]` and is addressed by the `rig` field of its
  own events, for example A08/A09 (Mia + Lead), A15 (Regular + Mia) and A01 (world + background).
- **`mode`:** RIGID, ARTICULATED, REGISTERED_CELS, REGISTERED_MORPH, EXPLICIT_DEFORM, PROCEDURAL, CAMERA_WORLD or TRANSITION, as the row's
  motion actually needs:
  - A12 = CAMERA_WORLD;
  - walking/turning bodies = ARTICULATED;
  - expression or mouth state changes on the same body = REGISTERED_CELS.
- **`phases[]`:** must tile the action's frames exactly, with no gap or overlap. Use the bracketed sub-intervals the row already gives,
  e.g. A27: [404,416) gaze/weight turn, [416,444) quiet step, [444,520) continues offscreen, [520,960) settled hands-free.
- **`visible_result`:** must state the observable consequence; it may not be empty.
- **`precondition` / `postcondition`:** state what must already be true when the action starts and what is true after it ends.
- **`target_state`:** the state the action must reach, or `null`.
- **`min_angle_deg`:** a number where a joint must reach an angle, otherwise `null`.
- **`art_ids`:** the art families the row lists. Every one of them must list this action back in `required_by`.
- **`contact_events`, `pose_events`, `view_events`, `state_events`:** as described in the mapping table above.
- **`secondary_purpose`:** state it where the row has one.
- **A contact that must be released** needs frames left inside its action after the release. Otherwise use the related release action.

**Things the schema has no field for.** Write them in the direction text and the notes, never as new keys. Claude compiles them into the
engine contracts (see `P08_CONTRACT_ROUTING.md`):
- **Photo intent** (A13/A15): lens aims at Mia + award; the report goes behind the counter by f807; one shutter at f900; no flash or screen
  content; no privacy property that is not directed.
- **Captions:** the "Thanks" display is 5.433–6.633 s (extract 2.433–3.633). The safe lane must stay clear of the grip, and no caption may
  cover the report insert.
- **Background stagger:** the background owners' staggered gestures.

## 5. HYBRID_CONTRACT.json (dialogue only for phase 1)
```json
{ "version": "1.0.0", "film_id": "<same as the packet>", "packet_sha256": "PENDING_CLAUDE_DIGEST",
  "claims": [], "decoders": [], "hosts": [],
  "dialogue": [ { "line_id": "<the story.narration id of the line>", "speaker": "CHAR_MIA", "text": "<exact approved words>", "frames": [a, b],
                  "audio_file": "<selected master basename>", "audio_sha256": "<from source_audio/SHA256SUMS.txt>",
                  "alignment_file": "<the matching source_audio/alignment/timing/*.timing.json basename>",
                  "mouth_scheme": "VISEME", "limited_mouth_approved": false } ] }
```
- **One entry per spoken line** (AUD02, AUD03, AUD09, AUD12, AUD13, AUD14). The chuckle AUD20 is non-verbal: it is a SFX cue, not a dialogue line.
- **Mouth scheme:** use `mouth_scheme: "VISEME"`, which is the P08 measured-phone viseme route. `REST_MID_OPEN` is the limited legacy swap,
  and P3.2 requires the crude mouths gone.
- **Claims:** if any claim of the phase is factual, add it to `claims[]` with mode F/R/M/H/X and a real source. Otherwise leave it empty.
- **Hosts:** no host or decoder is used in [0,960), so `hosts` and `decoders` stay empty.

## 6. Validation (Claude runs these on the returned ZIP; you cannot run node)
```
node engine/tools/creative_handoff.mjs validate  --packet CREATIVE_PACKET.json
node engine/tools/creative_handoff.mjs preflight --packet CREATIVE_PACKET.json
node engine/tools/creative_handoff.mjs hybrid-preflight --packet CREATIVE_PACKET.json --hybrid HYBRID_CONTRACT.json --sources <private sources dir>
```
- Any error comes back to you as typed feedback (`code`, `id`, `reason`, `failed_invariant`, `needed_change_type`). Fix the packet, never the
  rule. The rule codes are listed in `01_READ_FIRST/VALIDATOR_RULE_CODES.md`.
- `09_DIAGNOSTIC_EXAMPLE/` shows a complete packet that passes this validator, with its actual `VALIDATION_RESULT.json`.
  - It is a **DIAGNOSTIC fixture** (a lever-pulling test film, 600 frames, scope [0,600) of 1200), **not E01 content and not a template for
    E01 direction**.
  - Copy only its *shape*.

## 7. After the packet returns (for orientation; not your job)
1. Claude: validate, preflight and hybrid-preflight, then import.
2. The user signs `--scope creative_packet` on the digest. Claude then runs `accept`, followed by the story/direction signatures.
3. Claude reconciles the P08 motion obligations for all 19 actions over [0,960). The film-level obligation ledger must then show complete,
   correct coverage.
4. The design JSON and pre-generation audit are updated only for the P3.2-affected items. Then `check-design`, the human design signature,
   `art_outbox export`, and `export-gpt-job` (the manual route; nothing is ever submitted to a provider).
5. Master ArtJobs for phase 1 proceed without waiting for later-phase or host assets.
