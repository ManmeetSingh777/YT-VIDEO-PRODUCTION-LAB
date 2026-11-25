# Mia 13-second scene: artwork + performance handoff (for the user and the GPT art/writing conversations)

This is what the engine needs to **execute** the real scene. It is derived from the checks in
`engine/art_bridge/performance_commands.mjs` (roles, closure, refusals) and `engine/film/performance_qa.mjs` (effects). Nothing here is
creative direction: the shots, beats, expressions and lines come from the approved E01 script and Experience Director.

## 1. Before any art: settle these direction choices (each is refused today or needs a decision)
| If the scene needs | Engine today | Choose |
|---|---|---|
| Mia **walks** | `walk` exists only on APPROVED_CELS (gait cel cycle). The articulated-walk producer is **not built** (refused `ROUTE_HAS_PRODUCER`). | (a) approve a gait cel cycle (art cost), (b) ask engineering to build articulated walk first, or (c) stage the beat without walking |
| Mia **carries** a plate/ticket while moving | `CARRY` verb is refused (no executed measure) | re-stage, or ask engineering for a carry producer |
| Putting something **into** a container | `LOAD_CONTAINER` / `INSERT_TOKEN` refused | re-stage, or ask for the producer |
| A **head turn** larger than Mia's approved rigid limit | refused/failed unless view cels exist | approve front ↔ ¾ head view cels (and inbetweens if the silhouette changes) |
| A **body turn** | `turn_body` needs approved body view cels + edge | draw the view family, or keep the body in one view |
| **Lip sync** | LIMITED rest/mid/open mouth only (syllable-timed from measured words). Never phoneme-accurate | approve "limited mouth" in Mia's profile, or ask for a viseme producer + phoneme mouths |
| Camera **orbit / 3D dolly** | refused | 2D camera moves only |
| Pinch | PINCH contact refused | direct it as a grip |

## 2. Artwork, in this order (manual ChatGPT with the F01–F80 skill; every item human-reviewed)
1. **Canonical Mia master** for each view the scene uses. Transparent PNG, sRGB, straight alpha, native job size. Add a landmark sidecar:
   `{ "landmarks": { "<name>": [x, y], … }, "reviewed_by": "<user>", "method": "manual pixel review" }`. It needs at least three identity
   landmarks plus every joint/socket landmark below.
2. **World plate(s)** covering the camera footprint with overscan, with reviewed floor landmarks.
3. **Parts** for every moving body part (PART_RIG_2D). Each part is a source-attached edit of the approved master, never an independently
   prompted "same Mia":
   - head (separate from neck/torso if the head turns or looks)
   - neck, torso, pelvis
   - per moving arm: upper arm, forearm, hand
   - per moving leg: thigh, shin, foot (only if the legs move)
   - **hidden-surface underpaint** for every elbow/knee that bends more than 45°
4. **State cels** (exact list = the `performance-closure` output for the real commands). Typically:

| Channel (kind) | States needed when the commands use… | Notes |
|---|---|---|
| EYES | `open`, `closed` (+ optional pupils/half-lid if directed) | for every `blink`; every view the blink happens in |
| MOUTH | `rest`, `mid`, `open` per speaking view | for every `speak` |
| EXPRESSION | `neutral` + every state the commands reach (`change_expression`, and each `react` intent's mapped state) | identity-consistent face cels |
| HAND (per hand) | `open`, `closed` (grip); `point` if she points | grips: near/far finger layers when the grip wraps (`near_far: WRAP`), else a reviewed single-layer reason |
| VIEW | front, ¾ … as directed | only where a turn exceeds the rigid limit; shared landmarks across the family |

5. **Props** (ticket, plate, …) as separate drawings with a reviewed grip socket landmark and their own approval.

## 3. Rig interface (the reviewed role map the commands use)
Every value names a real element of Mia's measured rig. The engine refuses unknown or unapproved ones.
```json
{ "gaze_joint": "<head or eye joint>", "head_joint": "<head joint>", "chest_joint": "<torso joint used for body beats>",
  "eyes_channel": "<EYES channel>", "eyes_open_state": "open", "eyes_closed_state": "closed",
  "mouth_channel": "<MOUTH channel>", "mouth_rest_state": "rest", "mouth_mid_state": "mid", "mouth_open_state": "open",
  "expression_channel": "<EXPRESSION channel>",
  "hand.r.socket": "<palm socket>", "hand.r.channel": "<HAND channel>", "hand.r.open_state": "open", "hand.r.closed_state": "grip",
  "hand.r.point_state": "<only if she points>", "hand.r.aim_joint": "<shoulder joint, only if she points>",
  "foot.l.socket": "<sole socket>", "foot.r.socket": "<sole socket>" }
```
The sockets and joint limits come from the measured landmarks. Every hand socket must end a two-bone IK chain (shoulder → elbow → wrist).

## 4. PerformanceCommand packet (one record per directed beat; structure only)
```json
{ "schema_version": "1.0.0", "film_id": "<E01 film id>", "fps": 60, "total_frames": <film total>,
  "characters": [{ "actor_rig_id": "<mia rig>", "master_sha": "<approved master sha256>", "topology_kind": "BIPED", "character_profile_id": "<mia profile>",
                   "role_map": { … §3 … }, "approved_state_channels": ["<eyes>", "<mouth>", "<expression>", "<hand>"], "approved_motion_routes": ["PART_RIG_2D", "APPROVED_CELS"] }],
  "commands": [{ "id": "<beat id>", "action_id": "<approved action>", "direction_decision_ids": ["<decision ids>"], "actor_rig_id": "<mia rig>", "character_profile_id": "<mia profile>",
                 "verb": "look_at|blink|turn_head|speak|reach|grip|release|walk|react|change_expression|point|idle|turn_body|hold",
                 "frames": [<f0>, <f1>], "target": { "kind": "WORLD_POINT|RIG_SOCKET|OBJECT|AUDIO_CUE", … }, "intent": "<directed intent, e.g. hesitant reach>",
                 "required_prestate": { "channel_states": {}, "possession": {} }, "required_poststate": { "channel_states": {}, "possession": {} },
                 "phases": [{ "id": "<verb phase>", "frames": [a, b], "goal": "…", "expected_owner_effect": "…" }],
                 "motion_routes": ["PART_RIG_2D"], "required_art_refs": ["<every asset the closure lists>"],
                 "expected_effects": [{ "kind": "<the verb's effect>", "owner_id": "<rig.part>", "frames": [a, b], "test_id": "<id>", "human_quality_check": "<what the user will judge>" }],
                 "override_policy": "DIRECTOR_PRIORITY_STRICT", "source_digest": "<signed packet digest>" }] }
```
- **Phase vocabularies** (ids, in order; bold = required): look_at **acquire**, hold, return · blink **closed**, **reopen** · turn_head **turn**, hold,
  return · speak **line** · reach anticipation, **approach** · grip **close**, hold · release **open**, retract · walk start, **cycle**, stop ·
  react delay, anticipation, **peak**, recover · change_expression **change**, hold · point **raise**, hold, lower · idle **still** · turn_body **turn**, settle · hold **hold**.
- Phases tile the command's frames with no gaps; a pause is a declared `hold` phase. A reach must end where a grip on the same target starts. A
  grip lasts until the matching release. Possession holders are written `"<rig>#<hand>"` (e.g. `"mia_rig#r"`).
- A worked DIAGNOSTIC example (not E01 content) is in `PERFORMANCE_COMMAND_EXAMPLE.json`.

## 5. Mia's performance profile (values need Director/user approval; nothing is defaulted)
```json
{ "id": "<mia profile>", "version": "1.0.0", "actor_rig_id": "<mia rig>", "approval": { "status": "APPROVED", "receipt_sha256": "<signed>" },
  "timing": { "reaction_delay_frames": <n>, "anticipation_fraction": <0..1>, "acquire_ease": "<engine ease>", "release_ease": "<engine ease>" },
  "gaze": { "max_deg": <eye/head aim limit>, "forward_deg": <facing angle of the gaze joint>, "tolerance_deg": <aim tolerance> },
  "head": { "max_rigid_turn_deg": <largest turn allowed without a view cel> },
  "anticipation": { "reach": { "joint_role": "chest_joint", "delta_deg": <counter-move> } },
  "reactions": { "<exact directed intent>": { "expression_state": "<approved cel>", "body_role": "chest_joint", "peak_deg": <n>, "anticipation_deg": <n> } },
  "idle": { "joint_role": "chest_joint", "amplitude_deg": <breath>, "period_frames": <n> },
  "speech": { "limited_mouth_approved": true|false },
  "contact": { "allowed_error_px": <n>, "near_far": "HAND_IN_FRONT|WRAP", "finger_layers": { "r": { "near": [], "far": [] } } } }
```
Each `react` intent in the commands must be a key in `reactions`. The engine never invents an emotional reading.

## 6. Audio
Per line: WAV 48 kHz, sha256, `start_frame` (absolute film frame), and words `[{ "w", "start_s", "end_s" }]` from forced alignment of the recording
(`alignment_source: "MEASURED"`, plus the method). Words must fall inside their `speak` command.

## 7. Approvals the user signs (hash-scoped; the engine never self-approves)
1. Creative packet digest (story + direction).
2. Mia master, each part, each state cel, each view edge (art reviews in `art_intake.mjs`).
3. Mia's performance profile (and the limited-mouth choice).
4. The PerformanceCommand packet (bound to the packet digest through `source_digest`).
5. The final 13 s review: signed after watching the exact MP4 with sound.
