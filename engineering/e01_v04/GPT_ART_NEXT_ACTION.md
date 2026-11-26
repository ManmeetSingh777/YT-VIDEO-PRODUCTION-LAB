# GPT ART: next action for E01 (DESIGN PREPARATION ONLY; this is not a sealed ArtJob)

**No sealed ArtJob ZIP exists yet.** The engine exports one only after story → direction → design approvals (`requireApprovedContract`), and a new
canonical master also needs its ten-pass pre-generation audit (P07, `art_contract.mjs#preGenerationGate`).
- Do not generate final art.
- Do not treat any image as a master.
- Do not sign anything.

## Do now, in a new ChatGPT art chat (proposal work only)
1. **Verify skill access.**
   - Attach the private design-preparation ZIP. It contains the installed `construct-kurzgesagt-art` F01–F80 skill with its `references/` and
     native witness images, for private use only.
   - Confirm the chat can open `SKILL.md`, the reference files and the witness images in `assets/`. If any is missing, stop and report which.
2. **Draft four master design proposals:** `MIA_MASTER`, `REGULAR_MASTER`, `LEAD_MASTER` and `ENV_RESTAURANT_SH01`. Use the engine's design shape
   (`design_schema/EXAMPLE_ines_master.design.json` shows the fields; it is an unapproved diagnostic example, not a style to copy):
   - `job_id`, `art_family` (ACTING_HUMAN for people, INTERIOR_WORLD for the room), `original_content`
   - `canvas`: drawn at ≥ 2× the largest on-screen size; see decision D3
   - `subject_graph`
   - `method_decisions[]`: `{method_id, source_clause_sha256, applicability_evidence, specific_decision, visible_construction_operation, …}` for
     the methods the skill finds applicable
   - `construction_topics{}`: `{operation, visible_result, methods}`
   - `design_grounding{}`: witness file plus observation
   - `molecular_visual_decisions`, `detail_regions`, `observable_negative_tests`
   - `output` `{alpha_mode: "STRAIGHT", figure_height_px, background: "transparent"}`
   - `motion_requirements`
   - `proposal_status: "STORY_AND_DESIGN_APPROVAL_PENDING"`
3. **Record the ten pre-generation passes** for each master as `<job_id>.pregen_audit.json` (`design_schema/pregen_audit_v1.schema.json`).
   - **Domains, in order:**
     1. `film_goal_attention_silhouette`
     2. `native_grammar_witnesses_originality`
     3. `anatomy_proportion_perspective`
     4. `color_material_edge_light`
     5. `face_expression_hands_identity_views`
     6. `articulation_occlusion_alternate_art`
     7. `world_depth_camera_light`
     8. `state_coverage_for_motion`
     9. `method_to_construction_mapping`
     10. `emergent_gap_finder`
   - **Each pass needs:**
     - the real unresolved question for THIS subject;
     - substantive findings;
     - concrete construction decisions;
     - witness observations in domains 2, 3, 4, 5 and 7;
     - in domain 9, a decision for every method of the design;
     - in domain 10, a reopened domain or a specific reason none needs reopening.
   - **The code refuses** filler, repeated text, the wrong order, a stale design hash and an unmapped method. It cannot judge beauty; the user does.
4. **Design for the motion the extract needs** (`motion_needs/PROVISIONAL_PREFLIGHT_TABLES.md`):
   - **Mia:** separable head, neck, torso, both arms and hands; hidden underpaint at the shoulders and elbows.
     - Hands for a two-hand plaque hold, with near/far fingers on the plaque.
     - The page grasp per decision D2 (recommended: thumb in front as the NEAR layer, fingertips behind the page as the FAR layer).
     - Expressions from mock-regal to social smile with concerned eyes, plus inbetweens (D4); limited mouths in three smile contexts (D5).
   - **Regular:** a near-hand phone grip with near/far fingers, and a separate thumb that can press. The phone lens faces Mia; the screen is
     never shown.
   - **Shift lead:** a right-hand page grip with near/far fingers. The legs are probably hidden by the counter (D1).
   - **Restaurant (SH01 camera):** layered planes (window with the queue, tables, counter top, foreground counter occluder) and a clean plate
     behind every actor, with overscan for the SH01/SH03 crops.

## Hand back to Claude
- Return the four `.design.json` and four `.pregen_audit.json` files, unsigned.
- Claude places them in the E01 film once the phase-1 packet is approved and accepted, then runs
  `node engine/tools/art_outbox.mjs check-design --film films/e01 --asset <MASTER>`.
- The user signs the design (`review_sign --scope design`). Then `art_outbox export` compiles the generation and `export-gpt-job` writes the
  **sealed** ZIP. Only that ZIP starts real image generation (`NEW_F01_F80_ART_OPERATOR_CHAT_V1.md`).

## Never
- Invent hashes, approvals or landmark coordinates.
- Crop a flat illustration into parts.
- Rotate a front face into a profile.
- Recreate protected frames.
- Publish the witness images.
- Make the host a 2D drawing: the host is a Blender asset.
