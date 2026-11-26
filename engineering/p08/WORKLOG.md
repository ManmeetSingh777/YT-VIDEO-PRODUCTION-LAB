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
- B01 `8b6e50a` (tests/p08/prop_authority.test.mjs 7/7, Chrome owner pixels). A02 `5b41357` (tests/p08/contact_continuity.test.mjs 5/5).
  A02 open item: "held object while speech/face turns" combination → covered later by the face-capable P08 character fixture (composition tests).
- C02/C03/C04 `f21dfab`: engine/art_bridge/speech_visemes.mjs (SPEECH_ALIGNMENT v1, EN_ARPABET_VISEME_V1), speak VISEME route, EXPRESSION_TRANSITION v1,
  face_composition + FaceComposition verifier, performance_command schema v1.1.0. Fixture tests/p08/character_fixture.mjs (kade tall / pim short bipeds,
  legs+hands+composed face, 80 s real intake). tests/p08/face_speech.test.mjs 6/6. Real P3.1 phones: 86/86 absolute samples identical (scratch check).
  Fixture lessons: part pivot landmark must lie on painted pixels; grip drawing must cover the wrist pivot (radius in MASTER px = 2× canonical).
- Next: tools/tbo/e01_speech_preflight.mjs (private input, commit summary only) → composition contract A01/A03 + addendum → E01 freeze/A04/F01 → E07 → B02/B03 → B04 …
- A01/A03+addendum `470a676`: engine/art_bridge/composition.mjs (COMPOSITION_CONTRACT v1.0.0, writeSet), engine/film/composition_qa.mjs; tests/p08/composition.test.mjs 6/6
  (combo 4 "mechanism + model graphic" still TODO with E06). E01 speech preflight tool + summary committed (private detail in E:\TBO_PRIVATE\E01_SPEECH_PREFLIGHT).
- E01/A04/F01 `b48699c`: plan.time_remaps in temporal; engine/film/phase_boundary.mjs; engine/film/phase_audio.mjs; tests/p08/phase_freeze_audio.test.mjs 6/6.
  Note: owner pixel identity must be measured as raw bytes over the owner's region (colour-key matching is ambiguous across owners).
- Next: E07 photo polygon → B02 palm-orientation IK → B03 PINCH → B04 walk → B05/B06/B07/B08 → C01/C05/C06 → D01–D06 → E02/E05/E06(+combo4)/E03/E04 → F02–F06 → regression efficiency → freeze.
