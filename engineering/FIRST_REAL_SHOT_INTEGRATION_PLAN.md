# First real E01 shots: integration plan and exact handoff requests

**No E01 shot or frame interval is chosen yet.** That choice belongs to GPT + the user after script and Experience Director lock (Bible §11.1;
E01 starter §F). This plan says what the engine needs for each of the three modality clips and what the engine does with it.
Accepted real first-film seconds today: **0**.

## The route an approved package takes (all commands exist today)
1. GPT returns a folder: `CREATIVE_PACKET.json` (v1.1.0) + `HYBRID_CONTRACT.json` (v1.0.0, see below) + every named source file.
2. `node engine/tools/creative_handoff.mjs validate --packet <F>/CREATIVE_PACKET.json`
3. `node engine/tools/creative_handoff.mjs preflight --packet <F>/CREATIVE_PACKET.json`: verbs, contacts, camera, states and art demand.
4. `node engine/tools/creative_handoff.mjs hybrid-preflight --packet <F>/CREATIVE_PACKET.json --hybrid <F>/HYBRID_CONTRACT.json --sources <F>`:
   claims, decoder model, host shot, dialogue. Every refusal is typed, with its permitted options. Nothing is simplified.
5. Feedback goes back to GPT (`export-feedback`). The packet is revised until preflight passes, then the human signs its digest
   (`docs/gpt-creative-control/OPERATOR_WORKFLOW.md` steps 5–7).
6. Art: masters → measured rig → post-art feasibility → parts/cels/underpaint → `creative_handoff post-art` (OPERATOR_WORKFLOW steps 8–14).
7. Film: `production_run.mjs preflight/start/status/resume` → human watch → signed final review.

## Clip S-A: Mia acting (480–600 frames, 1920×1080 at 60 fps)
**From GPT + user (creative):**
- The exact shot ids and absolute frames.
- A 12-part shot contract and the action graph with frame-bounded anticipation, reach, contact, hold, release and reaction.
- Gaze/expression events, camera move, audio cues and the dialogue line(s) with speaker.

**Art (manual ChatGPT with the F01–F80 skill, human-reviewed), produced in this order:**
1. **Mia canonical master** (front / ¾ as directed). PNG, sRGB, straight alpha where the packet says STRAIGHT. Native size per the job zip.
   Landmark sidecar `{ "landmarks": {"<name>": [x, y], …}, "reviewed_by": "<you>", "method": "manual pixel review" }` with ≥ 3
   landmarks shared with the identity, plus every joint/socket landmark the rig names (shoulders, elbows, wrists, knuckles, hips, knees,
   ankles, toes, neck, head centre, eye centres, mouth corners).
2. Restaurant WORLD_PLANE(s) covering the whole camera footprint with overscan. Include reviewed floor landmarks if the host appears in this world.
3. **After** the post-art feasibility pass, every derived state the preflight lists. Typically: separately painted upper arm / forearm /
   hand per moving arm with hidden-surface underpaint for bends over 45°; HAND open + closed with near/far finger layers for any grip;
   eyes open/closed (+ pupils); mouth rest/mid/open per speaking view; brows; any head/torso view the direction turns to (a front head is
   never rotated); any held prop as its own drawing with grip landmarks. Each is a source-attached edit of the approved master.
   Do not prompt an independent "same Mia".

**Voice:** recorded line(s) (WAV, 48 kHz) + word alignment (`[{w, start_s, end_s}]`, measured, not estimated).
Without them the stage stops with `AUDIO_INPUT_MISSING`. The mouth scheme is syllable-timed rest/mid/open; approve it per line or ask for a viseme producer.

**Known risk to resolve in the script, before art:**
- If Mia *carries* a plate or ticket while walking, that is verb `CARRY`, refused today (no executed measure).
- Loading/placing into a container is `LOAD_CONTAINER`, also refused.
- A pinch must currently be directed as GRIP (the PINCH contact type is refused).

Either the direction avoids these, or engineering builds that producer first. That decision is the user's; the engine never swaps the verb silently.

**Engine acceptance:**
- post-art every-frame feasibility passes;
- S07 render, S08 owner coverage and semantic QA pass (grip closed through the whole hold; no frozen owner);
- `quality_gates.mjs` shows G07–G13 and G16 with real evidence;
- **human playback review** of the 1080p60 clip with sound, and native-resolution inspection of contact and turn frames.

**Decision point (production master, work package C):** if real-art Mia cannot reach the approved acting quality after focused
root-cause repairs, compare the same art in Live2D / Moho / Cartoon Animator before rebuilding more character animation in-house.

## Clip S-B: host breach
Requirements are in `BLENDER_HOST_PASS_CONTRACT.md` §6. In the packet, the host shot must hold the 2D camera static during the pass and
use an orthographic host camera (adapter v1). Blocked on `HOST_3D_ASSET_PENDING`.

## Clip S-C: strategy decoder
Requirements are in `DECODER_MODEL_CONTRACT.md`. GPT supplies the approved E01 model card with sourced claims, the decoder binding(s) and
approved SYMBOL art (e.g. painted plate/coin stacks with their bottom edge as pivot). Today only `MODEL_BAR` exists. Any other
model-driven graphic in the direction is reported as a missing producer, and engineering builds it for that shot.

## `HYBRID_CONTRACT.json` (new, v1.0.0, companion to the packet; GPT fills it)
```json
{ "version": "1.0.0", "film_id": "<same as packet>", "packet_sha256": "<printed by creative_handoff import / packetDigest>",
  "claims":   [{ "id": "c1", "text": "...", "mode": "F|R|M|H|X", "source": {"uri": "...", "date": "...", "excerpt": "..."}, "shot_ids": ["..."] }],
  "decoders": [{ "id": "...", "shot_id": "...", "action_id": "<PROCEDURAL action>", "model_card": { … }, "output": "net", "unit": "USD/day",
                 "symbol_art_id": "<SYMBOL art requirement>", "scenario_keys": [[frame, "baseline"], [frame, "discount", "sine.inOut"]],
                 "baseline_xy": [x, y], "px_per_unit": 0.5, "displays": [{ "value_ref": "net", "shown_provenance": "MODEL_DERIVED" }] }],
  "hosts":    [{ "id": "...", "shot_id": "...", "frames": [a, b], "band": "FOCAL", "host_asset": { "status": "PENDING" },
                 "camera": { "type": "ORTHO", "location": [..], "rotation_euler_deg": [..], "ortho_scale": .. }, "ground": { "z": 0 },
                 "contact_points": [{ "id": "sole_l", "object": "<Blender empty>" }],
                 "calibration_landmarks": [{ "id": "k1", "world": [x, y, 0], "plate_art_id": "<WORLD_PLANE art>", "landmark": "<landmark it requests>" }],
                 "performance": [{ "frames": [a, b], "action": "step_in", "intent": "..." }] }],
  "dialogue": [{ "line_id": "...", "speaker": "<identity id>", "text": "...", "frames": [a, b], "audio_file": "...", "audio_sha256": "...",
                 "alignment_file": "...", "mouth_scheme": "REST_MID_OPEN", "limited_mouth_approved": true }] }
```
