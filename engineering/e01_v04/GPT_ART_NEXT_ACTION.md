# GPT ART: next action for E01 (concise)

**There is no sealed ArtJob ZIP yet.** The engine refuses to export one until the story, direction and design approvals exist
(`art_contract.mjs#requireApprovedContract`). Do not generate final art, and do not treat any image as a master.

## What GPT ART can do now (proposal work only, nothing final)
1. **Verify skill access in the art chat.** Open a new chat with the installed `construct-kurzgesagt-art` F01–F80 skill. Confirm it can read
   `SKILL.md`, the `references/` files and the native witness images (`assets/character_source_witnesses.jpg`,
   `assets/environment_source_witnesses.jpg`, `assets/character_native_anchors/…`). If any are missing, stop and report which.
2. **Draft four master design proposals** in the engine's design shape, so `check-design` can run on them later. Use the existing
   `films/hv2_film001/art_designs/ines_master.design.json` as the field reference. The four masters are `MIA_MASTER`, `REGULAR_MASTER`,
   `LEAD_MASTER` and `ENV_RESTAURANT_SH01`. The required fields are:
   - `job_id`, `art_family`, `original_content`
   - `canvas`: view and scale. Draw at **SH03 medium close-up scale**, the largest each actor appears.
   - `subject_graph`
   - `method_decisions[]`: each `{method_id, source_clause_sha256, applicability_evidence, …}` for the methods the skill finds applicable
   - `construction_topics{}`: `{operation, visible_result, methods}` per topic
   - `design_grounding{}`: the witness file plus the observation
   - `molecular_visual_decisions`, `detail_regions`, `observable_negative_tests`
   - `output`: `{alpha_mode: "STRAIGHT", figure_height_px, background: "transparent"}`
   - `motion_requirements`
   - `proposal_status: "STORY_AND_DESIGN_APPROVAL_PENDING"`

   Record the pre-generation gap passes (the 10 audit categories in `ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md` §4) as a review artifact
   next to each design.
3. **Design for the motion the extract needs** (from `PROVISIONAL_PREFLIGHT_TABLES.md`):
   - **Mia:** separable head, neck, torso, both arms and hands. Hidden underpaint at the shoulders and elbows. Hands built for a two-hand plaque
     grip and a right-hand page-edge grip with near/far finger layers. Expressions from mock-regal through social smile with concerned eyes.
     Mouths in three smile contexts.
   - **Regular:** a near-hand phone grip, plus a separate thumb that can press.
   - **Lead:** a right-hand page grip. Whether the legs show is pending the user's walk decision.
   - **Room:** layered planes with a foreground counter occluder and a clean plate behind the actors.

## Hand back to Claude
- Return the design JSON files, unsigned, plus the gap-pass review artifact.
- Claude places them in `art_designs/` once the E01 film directory exists, then runs
  `node engine/tools/art_outbox.mjs check-design --film <F> --asset <MASTER>`.
- The user signs `review-design` only after `check-design` passes.
- The first sealed ZIP comes from `export-gpt-job`. Only that ZIP starts real generation (`NEW_F01_F80_ART_OPERATOR_CHAT_V1.md`).

## Never
- Invent hashes, approvals or landmarks.
- Crop a flat illustration into parts.
- Rotate a front face into a profile.
- Recreate protected frames.
- Make the host a 2D image: the host is a Blender asset.
