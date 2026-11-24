`# CLAUDE CODE — INTEGRATE GPT CREATIVE PRODUCTION CONTRACT V1
`
`**This is a reusable system change, NOT a request to generate a new story, art, or film.**
`Source: branch \`design/gpt-creative-production-contract-v1\`, docs/gpt-creative-control.
`Read the entire original \`inputs/EXPERIENCE_DIRECTOR_V1.md\` (all 849 lines), \`inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md\`, F001–F092 directives, current GPT handoff, film compiler, manifest schema and production stages BEFORE editing.
`
`## Authoritative ownership
`- GPT + the user author the script, research synthesis, Experience Director, creative motion requirements, art jobs, and real artwork via installed F01–F80 skill.
`- Claude implements adapters, validators, registration, rigging, motion, Neutrino execution and A/V production. It can reject unsupported creative requirements and return precise factual constraints. It must NOT replace approved metaphors/acting/visual identities with easier choices.
`- Human approvals are separately signed. \`CREATIVE_APPROVED\` in an imported JSON is a CLAIM; do not trust it without a cryptographically verified external receipt on the exact bundle.
`
`## Implement the following in dependency order
`
`### A. Create a single accountable creative interface
`Use \`docs/gpt-creative-control/creative_packet.schema.json\` and \`validate_creative_packet.py\` as a proposed interface, not as proof they are error-free. Run the validator against both synthetic fixtures first, add Python unit tests, and fix any bugs found. Integrate JSON Schema validation into a new import CLI. If an incompatible field exists in the current production manifest, do not silently drop it. Add an explicit compatibility adapter and schema/version migration with tests.
`
`Add a command similar to:
`\`node engine/tools/creative_handoff.mjs validate|import|preflight|export-feedback --film DIR --packet FILE\`.
`
`The importer must:
`1. Check JSON Schema and cross-reference validation; fail for missing action/part/director consumer or invalid timelines.
`2. Check external source script file hashes, actual file sizes and paths (not merely declared SHA).
`3. Require proper story and direction approval receipts tied to the canonical digest.
`4. Preserve the original creative packet and its hash in an immutable import record.
`5. Produce the existing \`STORY_CONTRACT.json\`, \`SEMANTIC_ACTIONS.json\`, \`SHOT_SCORE_60FPS.json\`, \`ACTION_PHRASES.json\`, \`BEAT_MEDIA.json\`, manifest draft, dependency plan and motion-plan obligations, **without fabricating missing creative fields**.
`6. Emit a structured \`UNIMPLEMENTABLE_CREATIVE_REQUIREMENT\` if an action or mode has no supported producer.
`
`Every generated field must retain \`origin: (creative_packet_sha, source_id, author)\`; the validator must reject unconsumed direction decisions and orphaned motion tracks. The new interface should not create a competing source of truth: maintain exact upstream-to-runtime mappings.
`
`### B. Separate two kinds of preflight
`\`CREATIVE_PREFLIGHT\` (BEFORE GPT art generation) checks story/direction completeness, state demand, supported movement classes, allowable camera concepts, assets/cels/occluders/underpaint list, approximate geometric ranges, style-witness availability, artwork-source authority, and unsupported operations. It does NOT assume final joint positions or certify reachability of ungenerated images.
`
`\`POST_ART_FEASIBILITY\` (AFTER reviewed GPT artwork) uses actual approved images and registered landmarks, and checks on EVERY required action frame: joint ranges, FK/IK, contact position+orientation+painted palm state, support and planted feet, occlusion, hidden-surfaces, view/face state transitions, deformation mesh validity, world/camera coverage and expected effects.
`
`Both produce machine-readable feedback with \`producer\`, \`input_digest\`, \`action_id\`, \`art_requirement_id\`, \`frame_range\`, \`failed_invariant\`, \`needed_change_type\`, \`permitted_revision_options\` and \`reapproval_required\`. Never mark zero checked frames \`PASS\`.
`
`### C. No creative coercion
`When a requested action cannot be animated:
`- Technical repair first if the engine incorrectly refused a feasible action.
`- If a genuinely missing painting is required: request an exact source-grounded artwork state/part under the canonical master and preserve previous approved art.
`- If physical geometry makes the action impossible: return bounded restaging alternatives to GPT for creative review.
`- If neither is acceptable: block that action and production. Do NOT replace it with a fade, slide, static card, generic tube limb, fake SVG character or unapproved compromise.
`
`Approved changes must cause an explicit new packet revision and invalidate only affected downstream proofs. Re-run both validators after revisions.
`
`### D. De-risk motion before paying for artwork
`Given an approved creative packet, generate a motion-capability ledger:
`- each action and mode;
`- part owner(s) and state requirements;
`- physical constraints;
`- supported engine producer;
`- required approval;
`- observable visual consequence;
`- exact QA proof;
`- state/witness/asset demand.
`Reject unrepresented moving parts, missing reach/release, unowned camera moves, unexplained simultaneous action, missing audio effect and unsupported semantic verbs.
`Every selected creative requirement must survive into the executable runtime or produce a typed refusal.
`
`### E. Complete GPT F01–F80 handoff
`The existing \`export-gpt-job\` / \`import-gpt-candidates\` route remains the image boundary. Ensure an ArtJob exported from the imported packet includes all applicable F01–F80 source-witness image bytes/locations, complete construction methods and original art decision, referenced approved master, required states, alpha/overscan/hidden surfaces, semantic landmarks and motion obligations.
`No generic art generation by Claude. GPT image production is manual in a new ChatGPT chat; attest only what can actually be verified.
`Build an ordered art job DAG (master → derived states → parts → masks/underpaint → world/transition planes), with hash-scoped dependencies and resumable imports.
`
`### F. Strengthen technical runtime gates
`The P03 branch still has known issues. Do not pass them through merely because creative packet validates:
`- global approvals must cover each state channel;
`- missing grip contract must fail;
`- HAND channel, not body pose, owns painted closure;
`- release and object reaction must be visually checked;
`- real state timeline must persist between actions;
`- post-art feasibility must actually check the full frame and fail when no plans are evaluated;
`- deformation must be genuinely executed and prove non-overlapping mesh coverage;
`- frame exceptions must be recorded as failures, never swallowed;
`- per-owner QA must include motion blur and fail if expected owner evidence is missing;
`- preflight must be side-effect-free;
`- audio mix must be muxed into final MP4, and the final stream checked;
`- content hashes must not be cached solely by mtime and file size.
`
`These are NOT canary-specific. Reuse the approved original Neutrino behavior and prove that the registered artwork—not generic old SVG figures—is what moves in real Chrome frames.
`
`### G. Duration and timing
`\`schemas/motion_art_manifest_v2.schema.json\` currently hard-codes 7200 frames. Change the total_frames constraint to a positive integer with an explicit sane upper bound, keeping 1920×1080 and 60fps. Refactor consumers that assume 120 seconds, including stage tiling, audio timing, camera, render chunks, QA and frame-source trace. Test a 600-frame film and a 7200-frame film *in schema/logic tests only*: do not render the entire 7200-frame film again.
`Use half-open [start,end) frame windows consistently.
`
`### H. Tests before declaring ready
`- Valid, invalid and mutated creative packet tests: absent director link, missing state, wrong shot, overlapping/missing frames, unsupported verb, art master absent, invalid witness, false approval, contradictory action, absent hand closure, missing release and missing consequence.
`- Positive and negative adapter outputs: exact semantic event → consuming motion producer; changing one director input changes the intended owner rendering (not unrelated background).
`- Unrelated human, organism, mechanism and environment diagram diagnostic fixtures.
`- Functional image-backed Neutrino render with independent articulated parts; alpha and crop; partial occlusion; no generic art substitution.
`- Genuine signed review and missing-signature refusal, using test-only keys isolated from production.
`- Full short diagnostic chain from author packet → registration → render → mixed A/V → actual final file with provenance.
`- Historical regressions F001–F092 and P03, on a fresh commit checkout.
`- Actual GPT-art qualification remains explicitly PENDING until approved real images are supplied. Do not invent them.
`
`All proofs must be reproducible from the committed SHA; report tests actually run, failures and gaps. A code-only or fixture-only proof cannot assert exceptional artistic quality.
`
`## Deliverable
`Commit to a separate branch based on P03, with:
`- operator README and commands for GPT new-chat -> creative packet -> preart feedback -> GPT artwork -> image intake -> engine;
`- versioned schema, adapter, validators, typed feedback and negative tests;
`- function-level producer/consumer coverage and source hashes;
`- exact artifact schemas and stage transition receipts;
`- short diagnostic render evidence;
`- historical regression results;
`- separate statuses \`STRUCTURAL_VALID\`, \`CREATIVE_HUMAN_APPROVED\`, \`PREART_FEASIBLE\`, \`Genuine_ART_APPROVED\`, \`POST_ART_MOTION_FEASIBLE\`, \`ENGINEERING_QUALIFIED\`, \`FINAL_FILM_REVIEWED\`.
`
`Never report the engine ready solely because the new creative packet imports.
