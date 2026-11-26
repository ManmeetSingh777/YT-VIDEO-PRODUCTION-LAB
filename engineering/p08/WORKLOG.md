# P08 work log (session continuity; facts only)

## Fixed points
- Repo `E:\TBO_DEV`, branch `production/better-one-first-film-engineering`. P07 frozen `ecd0aa8` (304/305, S3C-7), evidence commit `693660c` pushed.
- Do NOT touch `C:\Users\gmanm\TBO_DEV_REGRESSION` (P07 evidence worktree) or `C:\Users\gmanm\TBO_P07_FINAL`.
- P08 package: `engineering/p08/package/` (contract sha `6609d8cf…` = matrix contract_sha256).
- E01 creative source for P08: **P3.1** `E:\TBO_PRIVATE\E01_PHASE1_MEASURED_P3_1_STORYBOARD.zip` (sha `9f2aeca1…`). Supersedes P3. A04 transfer f296 (contact 284, valid 295,
  R clear 306, L clear 320); report contact 350, valid 360, prior 367, driver 368, lead clear 380; cuts 444/588; privacy 807, raise 825, aim 882,
  shutter 900, f959 outgoing. Audio: user-approved selected takes (USER_STATEMENT_RECORD_NOT_ENGINE_SIGNATURE). Storyboard/animatic/digest NOT approved.
  A separate session makes the rough animatic — do not repeat creative prep, never fabricate animatic approval.
- No paid calls; private witnesses/audio/ZIPs never committed; nu.js unchanged; one comprehensive regression on the final frozen P08 SHA only.

## Done
- S3C-7 correction `fb01ca4`: evaluation identity (engine/art_bridge/evaluation_identity.mjs, EVALUATION_RULESET.lock.json, tools evaluation_ruleset.mjs),
  tests/p08/evaluation_identity.test.mjs EID-1..7 pass; affected suites 87/87 + 119/119.
  Rule-source edits (art_contract.mjs, pregen_audit.mjs, method_applicability.mjs, art_families.mjs, witness_regions.mjs, pregen schema, F_SOURCE)
  need `node engine/tools/evaluation_ruleset.mjs bump --version P08.0 --reason ... --amend` (current unfrozen version P08.0).
- BASELINE_AND_PRODUCER_MAP.json (tools/tbo/p08_baseline_map.mjs).

## Plan / status (update as rows land)
See P08_REQUIREMENT_RESULTS.json (generated at the end from executed tests). Order: composition contract (A01/A03 + addendum) → A02 → B01/B02 → B03 →
C02/C03/C04 → E01/E07 → F01/A04 → D01 → B04–B08 → C01/C05 → E02/E05/E06 → E03/E04 → F02–F06; regression-efficiency profiling before freeze.
