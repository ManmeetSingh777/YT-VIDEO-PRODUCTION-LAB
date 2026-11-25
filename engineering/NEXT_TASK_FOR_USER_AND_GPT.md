# Next task for you and GPT (what engineering is waiting for)

Engineering cannot produce one accepted second of the real film until these exist. Claude will not invent them.

## 1. In the GPT writing conversation (start from `docs/the-better-one/NEW_GPT_E01_CREATIVE_START.md`)
Return **one folder** containing:
1. `00_STORY_TRUTH.md`, `VALUE_BLUEPRINT.md`, `CLAIM_LEDGER.csv`, `MODEL_CARD.json` (format: `engineering/DECODER_MODEL_CONTRACT.md` §1), `ENDING_PROOF.md`, `BEAT_OUTLINE.md`, `SCRIPT.md`.
2. `CREATIVE_PACKET.json` **v1.1.0** (`schemas/creative_packet_v1_1.schema.json`), with every named source file and its sha256.
3. `HYBRID_CONTRACT.json` **v1.0.0** (new; format in `engineering/FIRST_REAL_SHOT_INTEGRATION_PLAN.md`), carrying:
   - truth-mode claims;
   - the decoder binding(s) to the model card;
   - the host shot(s);
   - every spoken line with speaker, plus `limited_mouth_approved` or a request for phoneme mouths.
4. The **three chosen real intervals** (shot ids + absolute frames) for S-A Mia acting, S-B host breach and S-C decoder.

Tell GPT about these limits *before* it directs. They are refused today; each needs either different direction or engineering work first:
- `CARRY` (walking while holding a plate/ticket);
- `LOAD_CONTAINER` / `INSERT_TOKEN` (putting things into containers);
- `HINGE` / `SLIDE` / `COLLISION` / `PINCH` contacts (pinch can be directed as GRIP);
- camera `ORBIT` / `DOLLY_3D`;
- a 2D camera move or a perspective camera during a host pass.

If the story needs any of these, say so: engineering will build that producer for the approved shot instead of the direction being simplified.

## 2. Then run (or ask Claude to run)
```
node engine/tools/creative_handoff.mjs validate --packet <FOLDER>/CREATIVE_PACKET.json
node engine/tools/creative_handoff.mjs preflight --packet <FOLDER>/CREATIVE_PACKET.json
node engine/tools/creative_handoff.mjs hybrid-preflight --packet <FOLDER>/CREATIVE_PACKET.json --hybrid <FOLDER>/HYBRID_CONTRACT.json --sources <FOLDER>
```
Feed the typed feedback back to GPT until both preflights report `SUPPORTED_IN_PRINCIPLE`. Then sign the packet digest yourself, with a reviewer key kept outside the repo (OPERATOR_WORKFLOW).

## 3. Art (manual ChatGPT with the F01–F80 skill; **no final derivative art before post-art feasibility**)
Mia master first, with a reviewed landmark sidecar, then the restaurant world plates. Exact formats are in `FIRST_REAL_SHOT_INTEGRATION_PLAN.md`, clip S-A.
Concepts for the look and the host may start now, marked DRAFT.

## 4. External assets nobody has yet
- `HOST_3D_ASSET_PENDING`: approved original host concept, then a Blender master (`BLENDER_HOST_PASS_CONTRACT.md` §6).
  This needs a human Blender modeller/rigger or a budgeted contractor; Claude will not fake it.
- `NEEDS_RECORDED_VOICE`: the recorded lines and measured word alignment for the S-A interval.

## 5. Costs
No paid image/video/GPU/API call was made in this session (cost $0). Local renders only: Blender Cycles, Chrome, FFmpeg.
