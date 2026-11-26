# Operator workflow: from a new GPT creative package to a finished film

**E01 V0.4 CURRENT EXTRACT NOTE:** Historical references below to 600 frames/10 seconds are examples only. The actual first selected E01 clip is absolute [180,960), local [0,780), 780 frames, from the proposed 32.5s opening. Read PRODUCTION_OPERATING_STANDARD_V1.md and ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md for binding artistic quality/manual GPT repair requirements. P06 can use this CLI on its tested engineering source; no real-art release is qualified yet. Do not rewrite registered real source images to fit simplified geometry.

This is the executable workflow. Everything in `<angle brackets>` is yours. The engine authors no story, direction or art, and approves nothing. Every step that cannot continue prints a typed reason and the next permitted operation.

The packet version that can be executed is **1.1.0** (`schemas/creative_packet_v1_1.schema.json`). A 1.0.0 draft packet can be validated, but it cannot be imported: it has no typed place for verbs, measurable operations, the 12-part shot contract, rig topology, states, transitions or layering. `preflight` lists exactly what is missing and nothing is guessed.

## Once, before the first film

1. Reviewer key, on the reviewer's own machine, outside every repository:
   `openssl genpkey -algorithm ed25519 -out reviewer_private.pem` and `openssl pkey -in reviewer_private.pem -pubout -out reviewer_public.pem`
2. `REVIEWERS.json`, also outside the repository: `{"reviewers":[{"id":"<you>","public_key_pem":"<contents of reviewer_public.pem>"}]}`. Set `ART_BRIDGE_REVIEWER_KEYS_FILE` to its path. Add `"revoked_utc"` to an entry to revoke that key.
3. The F01–F80 source witnesses must be present under `reference/construct-kurzgesagt-art/assets` (they are not published).
4. Decide the length. 10 seconds = `total_frames: 600`. Any length from 1 to 216000 frames is accepted.

Signing any request: `node engine/tools/reviewer_sign_offline.mjs --request <folder>/REVIEW_REQUEST.json --key <private key> --reviewer <you> --verdict APPROVED --out SIGNED_REVIEW.json` (interactive terminal only), then `node engine/tools/review_sign.mjs import --film <FILM> --signed SIGNED_REVIEW.json`.

## Stage 1–3: the creative package (ChatGPT + you)

1. New ChatGPT conversation with `NEW_CHAT_CREATIVE_DIRECTOR.md`, the complete `inputs/EXPERIENCE_DIRECTOR_V1.md`, the F01–F80 skill and `schemas/creative_packet_v1_1.schema.json`.
2. Return one folder: `CREATIVE_PACKET.json` (v1.1.0) plus the files it names (`01_SCRIPT.md`, documents), with their SHA-256 in `source`.
3. `node engine/tools/creative_handoff.mjs validate --packet <FOLDER>/CREATIVE_PACKET.json`
4. `node engine/tools/creative_handoff.mjs preflight --packet <FOLDER>/CREATIVE_PACKET.json` → the capability ledger and typed feedback.
   If it is not supported: `node engine/tools/creative_handoff.mjs export-feedback --film <FILM> --packet <FOLDER>/CREATIVE_PACKET.json --out FEEDBACK.json`, give that file to ChatGPT, get a new packet revision, repeat. The engine never simplifies the direction.

What the preflight refuses today (it must be directed differently or implemented first): verbs without an executed visual measure (LOAD_CONTAINER, INSERT_TOKEN, CARRY and anything not in the registry); contacts HINGE, SLIDE, COLLISION, PINCH (mechanism hinges are executed as REACT decisions); camera ORBIT and DOLLY_3D; a view with no drawings of its own.

## Stage 3 approval

5. `node engine/tools/creative_handoff.mjs import --film <FILM> --packet <FOLDER>/CREATIVE_PACKET.json` (immutable, hashes checked; prints the digest).
6. `node engine/tools/review_sign.mjs request --film <FILM> --scope creative_packet --id <DIGEST>` → inspect → sign → import.
7. `node engine/tools/creative_handoff.mjs accept --film <FILM> --packet-digest <DIGEST>` compiles the story, direction, semantic actions, shot score, manifest draft, art plan and motion obligations. That one signature covers story and direction only while every compiled file still equals the approved packet.

## Stage 4: artwork (manual ChatGPT, no API)

8. Per master: write `art_designs/<MASTER>.design.json` with the F01–F80 skill (`art_designs/DESIGN_REQUESTS.json` lists what it must decide), check it with `node engine/tools/art_outbox.mjs check-design --film <FILM> --asset <MASTER>` and approve it (`review_sign.mjs request --film <FILM> --scope design --id <MASTER>` → sign → import).
9. `node engine/tools/art_outbox.mjs export --film <FILM> --out <OUTBOX>`; a job that cannot be exported says why (`blocked_reason` in `OUTBOX_INDEX.json`).
10. For every job and every stage K (one drawing can need several ordered stages):
    - `node engine/tools/art_outbox.mjs export-gpt-job --film <FILM> --out <OUTBOX> --job <JOB> --stage <K>` writes one zip.
    - New ChatGPT conversation, exactly as `WHAT_TO_DO_IN_CHATGPT.md` inside the zip says. Put the unmodified PNG (SVG for a VECTOR drawing) and the filled `IMPORT_MANIFEST.json` in one folder.
    - `node engine/tools/art_outbox.mjs import-gpt-candidates --film <FILM> --out <OUTBOX> --bundle <FOLDER>`
    - `node engine/tools/art_outbox.mjs select-candidate --out <OUTBOX> --job <JOB> --stage <K> --candidate <CANDIDATE>`
11. Masters first: `node engine/tools/art_outbox.mjs ingest-master --film <FILM> --out <OUTBOX> --asset <ID> --file <selected candidate> --landmarks <sidecar.json> --provenance GPT_OPERATOR_HANDOFF`, then `review_sign.mjs request --film <FILM> --scope master --id <IDENTITY>` → sign → import. The sidecar contains the reviewed pixel position of every landmark the packet names. The rig is measured from these pixels; no provisional geometry exists.

## Stage 5–6: motion

12. Engineering writes `handoff/MOTION_PLAN.json` against `handoff/MOTION_OBLIGATIONS.json`. Before any part artwork is released, the measured masters must be physically able to perform every action (parts stay `BLOCKED_FEASIBILITY_NOT_EVALUATED` or `BLOCKED_RIG_FIT_INFEASIBLE` until then).
13. Step 9 again, then step 10 for parts, cels, underpaint, planes and vectors, then `node engine/tools/art_outbox.mjs ingest-part --film <FILM> --out <OUTBOX> --asset <ID> --file <selected candidate> --landmarks <sidecar.json> --provenance GPT_OPERATOR_HANDOFF` (a `.svg` file is registered as a vector), then `review_sign.mjs` for parts, states (`RIG::STATE`, `RIG::CHANNEL.STATE`), edges and deformations.
14. `node engine/tools/creative_handoff.mjs post-art --film <FILM>`: every required frame, on the approved art. Every failure names who changes what: MISSING_ART_STATE, BAD_MEASUREMENT_OR_ART, RESTAGING (needs your approval), MOTION_PLAN (engineering) or ENGINE_DEFECT. `export-feedback` writes it for ChatGPT.

## Stage 7: film

15. Recorded narration with a measured forced alignment, SFX and music go into `audio/` and the plan's `audio_buses`. Without them the stage stops with AUDIO_INPUT_MISSING and no timing is invented.
16. `node engine/tools/production_run.mjs preflight --film <FILM>` (read-only), then `start --film <FILM>`, `status --film <FILM>`, `why --film <FILM> --failure <ID>`, `resume --film <FILM>`.
17. Watch `render/film_final.mp4` with sound, then `review_sign.mjs request --film <FILM> --scope final_film` → sign → import → `resume`. Any changed byte makes the decision stale.

`node engine/tools/creative_handoff.mjs status --film <FILM>` shows the computed status of every gate and the next operation at any time.

## Revising an approved package

Import the new packet, approve its digest, accept it. The result lists exactly what became stale. Delivered drawings whose own requirement did not change are kept; nothing is deleted.

## How the seven stages map to the production stages

| Contract stage | Gate | Executable tasks |
|---|---|---|
| 1 story | CREATIVE_STRUCTURALLY_VALID, CREATIVE_APPROVED | `creative_handoff validate`; S00 `film_intent`; S01 `creative_packet`, `story_contract`, `story_approval` |
| 2 direction | CREATIVE_APPROVED | S02 `attention_*`, `direction_approval`; S03 `tiling`, `actions_*`, `manifest_integrity`, `narration_timeline` |
| 3 art plan | PREART_FEASIBLE | `creative_handoff preflight`; S03 `creative_preflight`; S04 `demand_*`, `creative_art_complete` |
| 4 artwork | ART_CANDIDATES_DELIVERED, ART_APPROVED | `art_outbox` export/import/select; S05 `asset_*`; S06 `registration_*`, `states_edges` |
| 5 fit | POSTART_MOTION_FEASIBLE | `creative_handoff post-art`; S06 `geometry_measured`, `motion_plan_source`, `motion_obligations`, `feasibility_*`, `feasibility_complete_*`, `support_*`, `reaction_*`, `grip_*`, `deform_*`, `morph_*`, `semantic_consequences`, `direction_decisions`, `framing`, `contact_patch`, `shadow_continuity`, `production_ir` |
| 6 motion | MOTION_EXECUTION_QUALIFIED | S07 `chunk_*`, `assemble`; S08 `render_receipt`, `frame_trace_index`, `coverage_gate` (own-pixel decisions) |
| 7 film | FINAL_FILM_REVIEWED | S09 `audio_mix`, `av_sync`, `final_mux`, `final_media`, `film_review` |

In a film whose rigs are measured from artwork, every measured motion task belongs to S06, because nothing geometric can be known at S03.
