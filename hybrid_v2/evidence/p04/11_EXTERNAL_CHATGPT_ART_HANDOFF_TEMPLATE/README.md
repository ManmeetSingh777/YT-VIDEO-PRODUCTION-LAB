# Manual ChatGPT art handoff (generic process; no API spend; contains no scene-specific artwork)

For any film `<FILM>` in this repository. Every step writes only into the film/outbox; nothing is approved automatically.

## 1. Export (after story, direction and the job's design are approved)
```
node engine/tools/art_outbox.mjs export --film <FILM> --out hybrid_v2/art_outbox        # compiles immutable, content-addressed jobs
node engine/tools/art_outbox.mjs export-gpt-job --film <FILM> --job <ARTJOB_ID> [--stage K]   # zip: the exact prompt, contract brief, design, skill hashes, witness image bytes, master/predecessor, WHAT_TO_DO_IN_CHATGPT.md, HANDOFF_MANIFEST.json (sealed by sha)
```
The bundle contains REQUEST_PROMPT.txt (verbatim), ART_MOTION_CONSTRAINTS.json (poses, landmarks, contacts, hidden surfaces, coverage the drawing must support), IMPORT_MANIFEST.template.json, CONTRACT_BRIEF.md, DESIGN.json, `witnesses/*`, `MASTER_EDIT_REFERENCE.png` or `PREDECESSOR.png` if the stage needs one, the skill file hashes, required output size/alpha, the landmark names the sidecar must contain and the manifest of every file hash. Export refuses without the approvals, when the compiled generation changed, or when a witness/predecessor byte differs.

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
For each master, part, state, channel state, edge, deformation, design, story, direction, proposal and the final film:
```
node engine/tools/review_sign.mjs request --film <FILM> --scope part --id <ASSET_ID>      # unsigned request + files to look at
node engine/tools/reviewer_sign_offline.mjs --request <folder>/REVIEW_REQUEST.json --key <your private key, outside this repository> --reviewer <you> --verdict APPROVED --out SIGNED_REVIEW.json
node engine/tools/review_sign.mjs import --film <FILM> --signed SIGNED_REVIEW.json        # verifies, then records
```
The second command runs on the reviewer's machine in an interactive terminal. Test trust exists only inside `.diagnostic_namespace` films.

## Never
Do not edit a bundle after export, drop a witness, change the size or background to make a request succeed, reuse one drawing for two states, or type an approval into a file. The engine refuses these and names the field that changed.
