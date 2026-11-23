# Manual ChatGPT art handoff (generic process; no API spend; contains no scene-specific artwork)

For any film `<FILM>` in this repository. Every step writes only into the film/outbox; nothing is approved automatically.

## 1. Export (after story, direction and the job's design are approved)
```
node engine/tools/art_outbox.mjs export --film <FILM> --out hybrid_v2/art_outbox        # compiles immutable, content-addressed jobs
node engine/tools/art_outbox.mjs export-gpt-job --film <FILM> --job <ARTJOB_ID> [--stage K]   # zip: the exact prompt, contract brief, design, skill hashes, witness image bytes, master/predecessor, WHAT_TO_DO_IN_CHATGPT.md, HANDOFF_MANIFEST.json (sealed by sha)
```
The bundle contains REQUEST_PROMPT.txt (verbatim), CONTRACT_BRIEF.md, DESIGN.json, `witnesses/*`, `MASTER_EDIT_REFERENCE.png` or `PREDECESSOR.png` if the stage needs one, the skill file hashes, required output size/alpha, the landmark names the sidecar must contain and the manifest of every file hash. Export refuses without the approvals, when the compiled generation changed, or when a witness/predecessor byte differs.

## 2. Generate in ChatGPT
Open a new conversation with the installed F01–F80 construct-kurzgesagt-art skill, verify its `SKILL.md` hash against `HANDOFF_MANIFEST.json → skill.skill_md_sha256`, attach every witness image (style only) plus the predecessor/master the manifest names, paste `REQUEST_PROMPT.txt` exactly, request the stated size and transparency, download the PNG(s) unmodified.

## 3. Return
Create `IMPORT_MANIFEST.json` = `{ "handoff_id": "...", "operator_submission_id": "...", "images": [ { "file": "x.png", "sha256": "..." } ], "origin_claim": { "model": "<model shown by ChatGPT>", "session": "<id/url>", "operator": "<you>" } }` beside the PNG(s), then
```
node engine/tools/art_outbox.mjs import-gpt-candidates --film <FILM> --bundle <folder> --out hybrid_v2/art_outbox
```
Import verifies the seal, the **project id** and the content-bound generation (a relocated copy of the same project imports; a foreign or stale bundle is refused with the exact re-export it needs), decodes each PNG, records `ORIGIN … OPERATOR_ATTESTED`, and approves nothing.

## 4. Measure and register
Select the candidate (`select-candidate`), then `art_intake.mjs ingest-master|ingest-part` with a landmark sidecar (reviewed_by + landmarks in delivered pixels, ≥3 shared with the master), `ingest-vector` for approved SVG paths. Registration residuals, alpha, pivots and underpaint are checked against the approved master.

## 5. Review and approve (human, independent)
`review-master` / `review-part` / `approve-state` / `approve-state <rig> <channel.state>` / `approve-edge` / `approve-deform`. Production approvals are signed envelopes from a reviewer key outside this repository (`ART_BRIDGE_REVIEWER_KEYS_FILE`); test trust exists only inside `.diagnostic_namespace` films.

## Never
Do not edit a bundle after export, drop a witness, change the size or background to make a request succeed, reuse one drawing for two states, or type an approval into a file. The engine refuses these and names the field that changed.
