# E01 first production phase [0,960): how a legitimate, human-approved packet is built (P07)

## Answer to Priority 3
**Yes, with the P07 scope operation.**
- A v1.1.0 packet whose clock is the ORIGINAL film [0,960) can contain the complete SH01–SH03 exactly as directed:
  - shots [0,432), [432,576) and [576,960);
  - every original action id (A01–A10, A12–A19), audio cue and art family;
  - the whole f0–179 pre-roll.
- The incoming state at f180 is therefore computed from the film's own history; nothing is re-authored at local f0.

**What was missing before P07** (exact contract failures):
1. Nothing marked such a packet as a *part*. Its digest approval would have read as approval of "the film".
2. There was no place for the f959 → f960 freeze continuity it owes the next phase.
3. Nothing bound the complete 32.5 s parent source to it.

**What P07 added** (general, tested; `tests/tbo/p07_creative.test.mjs` P07-P2):
- **`scope`** on the v1.1.0 schema: `kind: PRODUCTION_PHASE`, `phase_id`, `parent_frames`, `frames`, `qualification_frames`,
  `parent_source_sha256`, `excluded_shot_ids`, `outgoing_continuity[]`, `approval_statement`.
- **`validatePhaseScope` refuses** (`PHASE_SCOPE_INVALID`):
  - a phase not starting at the parent's f0. A later phase needs the predecessor's exact outgoing state, which is **not implemented**.
  - a phase equal to the parent;
  - a qualification window outside the phase;
  - a parent source not attached by hash;
  - continuity owed at a frame other than the last;
  - an approval statement that does not name `[a,b)` and say the rest is NOT approved.
- **Downstream wiring:** the scope enters the packet digest, so the human signs it. It is in `IMPORT_RECORD.scope`, in the `creative_packet`
  review bundle (`production_phase`), in `creative/PHASE_SCOPE.json` (`NOT_APPROVED_parent_frames`, `outgoing_continuity_status:
  OWED_TO_SUCCESSOR_PHASE`) and in `creative/CURRENT.json`.
- **Preflight** runs on the phase's own actions only, so the later freeze, desaturation and host gaps no longer block the first ArtJobs.

## E01 values (proposed; GPT Creative authors the packet, the user approves it)
```json
"stage": { "width": 1920, "height": 1080, "fps": 60, "total_frames": 960 },
"scope": { "kind": "PRODUCTION_PHASE", "phase_id": "E01_S001_PHASE1", "parent_frames": [0, 1950], "frames": [0, 960], "qualification_frames": [180, 960],
  "parent_source_sha256": "b8933e6c5c013659db65493168fc1e049fd0e646166b576113e233a87160217d",
  "excluded_shot_ids": ["E01-S001-SH04", "E01-S001-SH05", "E01-S001-SH06", "E01-S001-SH07"],
  "outgoing_continuity": [{ "frame": 959, "owners": ["CHAR_MIA", "CHAR_REGULAR", "CHAR_LEAD", "BG_DINER_A", "BG_DINER_B", "BG_OCCUPANCY", "BG_QUEUE", "PROP_AWARD", "PROP_REPORT", "PROP_PHONE"],
    "obligation": "every live owner's exact f959 pose, contact, possession and expression is the frozen state of f960 (A20); the room bed stops at 960 with a 6-frame tail",
    "consumer": "E01 phase 2 (SH04 freeze) — not yet approved" }],
  "approval_statement": "Approves ONLY E01 frames [0,960) (SH01–SH03) of the 32.5 s opening; frames [960,1950) are NOT approved by this digest." }
```
- `parent_source_sha256` is the sha256 of `E01_EXPERIENCE_DIRECTOR_V0_4_P1.md`, which must be attached in `source.documents`.
- **AUD11 [861,987) crosses f960.** GPT either carries it as [861,960) plus an outgoing-continuity line ("tail continues into the freeze"), or
  re-times it. It is never clipped silently.

## The human-owned inputs the packet needs (none exist yet)
- Measured scratch timing (`E01_SCRATCH_VOICE_AND_ANIMATIC_HANDOFF.md`) and the decisions in `decisions/E01_DIRECTOR_DECISION_SHEET.md`.
- **Identities with rig topology:** joint ids, limits and the landmark *names* a joint pivots on. Positions stay `UNMEASURED` until approved art
  exists (`creative_adapter.mjs#compilePacket` writes `geometry_status: UNMEASURED`, positions [0,0]). These are director and art decisions, not
  Claude's.
- `on_stage_height_px` per identity (decision D3).
- `source` hashes: script, director, skill `SKILL.md`, witness manifest.

## The exact command sequence (from the frozen code; no provider `submit` call for the manual route)
1. Check the packet:
   ```
   node engine/tools/creative_handoff.mjs validate  --packet <P>/CREATIVE_PACKET.json
   node engine/tools/creative_handoff.mjs preflight --packet <P>/CREATIVE_PACKET.json
   ```
2. Import it:
   ```
   node engine/tools/creative_handoff.mjs import --film films/e01 --packet <P>/CREATIVE_PACKET.json --sources <P>
   ```
3. The user signs the packet; Claude imports the signed answer:
   ```
   node engine/tools/review_sign.mjs request --film films/e01 --scope creative_packet --id <digest>
   node engine/tools/review_sign.mjs import --film films/e01 --signed <SIGNED_REVIEW.json>
   ```
4. Accept it:
   ```
   node engine/tools/creative_handoff.mjs accept --film films/e01 --packet-digest <digest>
   ```
5. The user signs the story and direction scopes with `review_sign request --scope story` and `--scope direction`.
6. Write `art_designs/<MASTER>.design.json` and `art_designs/<MASTER>.pregen_audit.json` (GPT ART + user), then:
   ```
   node engine/tools/art_outbox.mjs check-design --film films/e01 --asset <MASTER>
   ```
7. The user signs the design scope with `review_sign request --scope design --id <job>`.
8. Compile and export the sealed ZIP:
   ```
   node engine/tools/art_outbox.mjs export --film films/e01 --out <OUTBOX>
   node engine/tools/art_outbox.mjs export-gpt-job --film films/e01 --out <OUTBOX> --job <JOB_ID> --stage 1
   ```
   - `export` compiles the generation to `COMPILED_WAITING_FOR_GPT_ART`. `export-gpt-job` writes the sealed `GPT_ART_HANDOFF_<job>_<generation>_1.zip`.
   - Correction to the earlier readiness report: it is `export` that compiles. `submit` is the separate provider/API route and is **not** used for
     manual ChatGPT.
9. After the images are generated: `import-gpt-candidates`, `select-candidate`, `ingest-master`, then the human `review-master` (and so on, per the
   standard §5–6).
