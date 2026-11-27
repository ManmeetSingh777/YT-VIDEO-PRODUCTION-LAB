# Reusable production workflow (E01 Phase 1, recorded 2026-11-27)

All commands run from `E:\TBO_DEV`, with `ART_BRIDGE_REVIEWER_KEYS_FILE` set to the reviewer trust-anchor file, which lives outside every repository. Private material stays outside the repository:
- the outbox (`<OUT>`);
- returns, keys and audio.

## 1. Direction → engine
| Step | Command | Human? |
|---|---|---|
| Validate / preflight a packet | `node engine/tools/creative_handoff.mjs validate|preflight --packet P` | no |
| Import (awaiting approval) | `creative_handoff.mjs import --film F --packet P --sources S` | no |
| Signing request | `node engine/tools/review_sign.mjs request --film F --scope creative_packet --id <digest>` | no |
| Sign every pending request | `powershell -File D:\TBO_REVIEWER_KEYS\sign_e01_pending.ps1` | **yes (signature)** |
| Import signatures | `review_sign.mjs import --film F --signed <file>` | no |
| Activate | `creative_handoff.mjs accept --film F --packet-digest <digest>` | no |

- **Amendments** are produced by deterministic tools that prove their delta (`tools/tbo/e01_amend_*.mjs`).
- **Preview before signing:** compile the amended packet into a scratch copy, then check the design approvals, the story/direction bundles and the in-flight stage prompts.

## 2. Artwork (one loop for every family)
| Step | Command | Human? |
|---|---|---|
| Designs gated and compiled | `art_outbox.mjs check-design --film F --asset A` (PASS = exportable) | design signature |
| Refresh everything; carry verified selections; export one plan of all newly executable stages | `art_outbox.mjs advance --film F --out <OUT> --operator <id>` | no |
| Explicit plan (seeds, holds) | `art_outbox.mjs export-plan --film F --out <OUT> --spec SPEC.json` | no |
| Give to Artwork GPT | `<OUT>/gpt_plans/<plan>.zip` + `<plan>__OPERATOR_ATTACHMENTS/` (flat, named, mapped) | **package transfer** |
| Import one return (lineage, machine choice for intermediate stages, proposed landmarks) | `art_outbox.mjs import-plan --film F --out <OUT> --zip R.zip --operator <id>` | **operator attestation** |
| Consolidated review | `art_outbox.mjs batch-review` / review sheet; `select-batch --selections S.json` | **selection** |
| Master approval | `review_sign.mjs request --scope master --id <identity>` → sign → import | **signature** |

**Rules that make the loop work:**
- **Every stage request is sealed.** A plan carries all remaining stages in order. The protocol authorizes the skill's corrective loop: an EDIT, or REFERENCE_GENERATE when the tool cannot take an edit target; at most 3 repair rounds; every image returned with its lineage.
- **Selections:** intermediate stages may be MACHINE_GPT-selected (never human). Final stages and masters are human.
- **Approved changes and engine changes renew generations.** A byte-identical request, or one differing only in engine-computed sections (canvas, detail budget), carries the human's earlier choices through `rebase-selections` (automatic inside `import-plan`).
- **Resolution contract per job:**
  - only supported canvases (ChatGPT's square 1254×1254 is accepted as delivered);
  - an authored target beyond one image is delegated to components or refused;
  - directed minimums go through the source-attached component crop of the registered master; upscales are refused.
- **Deterministic routes:** engine vector TYPE (the report copy) and alpha-derived masks generate no image.

## 3. Registration → motion → film (starts per family as soon as its master is approved)
1. `art_outbox.mjs ingest-master --film F --asset A --file PNG --landmarks <reviewed sidecar> --provenance GPT_OPERATOR_HANDOFF`. The sidecar is the operator-proposed `*.PROPOSED_LANDMARKS.json`, confirmed by the director.
   - Characters register by the measured `cranium_top`→`chin` span against the SH01 head reference. Other shots reach their directed head size through camera projection.
2. `review-master` (signed) → `advance` releases the master's dependents. Component crops (heads, report page) are planned from the registered landmarks.
3. `ingest-part` / `review-part` / `approve-state` / `approve-edge` → motion plan (P08) → `engine/tools/production_run.mjs` chain → segmented render → 960-frame phase + 780-frame qualification extract → signed final-film review.

## Metrics
`PRODUCTION_METRICS.json` is regenerated from the ledgers. `DEMAND_CLOSURE.json` comes from `node tools/tbo/e01_demand_closure.mjs --film films/e01 --out-box <OUT> --report engineering/e01_production`.
