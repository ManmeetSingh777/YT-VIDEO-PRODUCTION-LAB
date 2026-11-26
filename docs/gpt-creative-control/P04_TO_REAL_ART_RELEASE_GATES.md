# P04 → real-GPT-art production release gate (source-inspected)

**Review basis:** P04 pushed SHA \`7722bf1aff152f4fc09c6706fff436f0d79f264a\`, underlying source SHA \`4433dcec2aa301e91832e1d3a122d03627152db5\`, compared with P03 \`900a6b14e2dfeeb2d59ec87a0e84e71ce45e1835\`. Original Neutrino reference preserved. This report is an inspection of published sources and evidence, **not a rerun of tests on the reviewer's machine**. It is separate from Claude's concurrently ongoing integration run.

## Firm conclusion

P04 provides meaningful verified-by-its-own-tests infrastructure (248/248 tests reported passing; 7 Chrome negative-control pairs; 480-frame diagnostic Neutrino/Chrome + mixed-audio chain), but **ENGINEERING_READY=NO; real-art qualified=NO**. The published diagnostic chain finishes S00–S08 and blocks S09 on genuine human film approval. A diagnostic cannot receive a production approval and shouldn't.

Do not demand another long 7,200-frame rehearsal. Close the following general boundaries and then undertake the real 600-frame, 10-second test with GPT images.

## Priority 0 — verified source/contract failures

### G01 — full film duration is hard-coded to 7,200

P04 \`schemas/motion_art_manifest_v2.schema.json\`: \`stage.total_frames: {"const":7200}\`. A real 10-second film requires \`600\`. Replace with bounded integer requirement; inspect all dependent shot/transition/state/QA/audio/trace code for implicit 7200. Tests: accept 600, 7200 in schema-only tests; reject zero, negative, noninteger, excess; fully run one short 600-frame diagnostic chain, not a 7,200 render. A future 10-minute production would be 36,000 frames and should be a separate scaling qualification.

### G02 — approved GPT creative packet cannot yet enter real S00–S09 as a verified complete producer

The new design branch has \`docs/gpt-creative-control/creative_packet.schema.json\`, \`validate_creative_packet.py\`, \`NEW_CHAT_CREATIVE_DIRECTOR.md\`, \`CLAUDE_INTEGRATION_DIRECTIVE.md\`; they are unexecuted proposal code, **not connected to P04 by the published SHA**. P04 \`engine/story/authoring_handoff.mjs\` exports and imports a DIFFERENT proposal format with \`DIRECTION_DECISIONS.json\`, \`SHOT_SCORE_60FPS.json\`, \`SEMANTIC_ACTIONS.json\`, \`ACTION_PHRASES.json\`, etc. Build one lossless, versioned adapter with human/story/direction receipt validation; every GPT creative ID must map to the real consumer or fail. Do not fork another mutable source of truth. Prove on unfamiliar diagnostic scripts and adversarial missing/contradictory contracts.

### G03 — pre-art image-state demand is still incomplete

P04 readiness §criterion 2 admits failure to generate intermediate reach→grip artwork, the view-specific variants needed for new head/body turns, and lighting/material states absent from authored declarations. This means a motion requirement might reach art generation with insufficient alternative drawings; forcing a single beautiful PNG through it causes identity drift, tearing, pose pops or wrong hand art. Derive the complete reachable channel/state/transition closure *before* image generation: pose, view, hand, face/eye/mouth, contact, intermediate cel, deform, hidden underpaint, near/far layer, lighting/material, camera reveal, world overscan. Every requirement must have a consumed exact ArtJob or a typed missing-art refusal. Test consecutive actions with held prop, arm bend, head turn, a WRAP grip and a lighting change.

### G04 — semantic OPEN can pass below its explicitly requested minimum opening

P04 source \`engine/film/semantic_qa.mjs\`, \`object_state_reached\` branch:
\`return abs(delta) >= (a.min_angle_deg ?? minAngleDeg) || abs(delta) >= (a.min_open_angle_deg ?? Infinity)\`.
If the action requires \`min_open_angle_deg=60\` but has no \`min_angle_deg\`, a 6-degree turn satisfies the left side (default 5). This violates the more specific required aperture amount. Define a single coherent authoritative goal: requested target state and/or required quantitative opening, with explicit AND/OR semantics in the approved action. If \`min_open_angle_deg\` is set, it must not be bypassed by the generic threshold. Negative: open 7° against a 60° requirement MUST FAIL. Positive: actual approved minimum satisfied MUST PASS. Repeat on an unrelated mechanism.

### G05 — semantic grip closure can pass on only one held frame

Same file, \`hand_closed_and_in_contact\` branch: \`closed\` becomes true if the required hand state appears on ANY successful held frame; the final result uses \`closed\` and \`reached\` booleans, without requiring all contracted held frames to show the correct state or the correct contact. A one-frame correct grip in a 100-frame hold could pass this semantic check. Bind expected hold interval from the approved contact/action phase and require the correct HAND drawing, registration/socket lock, painted contact patch and near/far ownership on EVERY required held frame, subject to explicit permitted transition windows. Negative: open hand or missing contact at the middle frame FAIL. Also validate release over its required interval. Other upstream validators do not excuse this weak action-specific proof.

### G06 — required physical-collision/aperture state is not evaluated over every relevant frame

P04 readiness explicitly marks collision/aperture crossing incomplete; drawing a compelling "object passes through hole" or hand crossing a border cannot rely on only socket residual/paint coverage. Need valid 2D collision/mask predicates, support, no illegal depth/occlusion switches and measurable state consequences at each frame. Test crossing a portal, object disappearing behind near occluder, and a hand passing an aperture on unfamiliar fixtures. Refuse unsupported perspective/hidden-surface behavior before artwork.

## Priority 1 — unproven cross-stage generalization

### G07 — one short *integrated* heterogeneous chain should demonstrate the missing motion families

P04 chain omitted: 3/4 view change with approved art, gear-linked output beyond the lever, occluded reveal, continuous transition, and actual handoff-imported art bytes. Individual tests exist, but integration isn't demonstrated. Don't build a 120-second diagnostic: use short bounded subclips or one short film with unrelated sequences; preserve actual production call path and per-owner pixels; negative controls for absent view cel, frozen linked output, missing mask/out-middle-in plate, and different imported image SHA.

### G08 — art registration and motion have not operated on genuine GPT illustration

This is an external boundary. Test actual human-approved canonical images, derived limbs, hands, face states, underpaint, alpha, masks, viewpoint cels, and every-frame rig feasibility. The static P04 fixture shows square shoulder edges and disconnected shadow treatment; that is evidence that technical contact checks do not guarantee a polished moving silhouette. Do not rewrite tests to pass ugly fixtures. Add silhouette/seam/shadow checks where machine-verifiable; require native-resolution human visual judgment for artistic quality.

### G09 — source-grounded F01–F80 method→image causality is unproven

The code can compile method-bound requests, but a prompt mentioning an F-method is not proof the model executed the intended construction. The local native witnesses are excluded from public GitHub. GPT must verify actual installed skill and source witnesses in the manual chat; artwork review must compare observed geometry, edge, color, shading, shapes and whole look against approved construction decisions. Leave real-image methods externally pending until evidence exists.

### G10 — final production authority and recorded voice are not present

Review/export/sign/import mechanism has diagnostic tests; a real authorized reviewer key, real creative/art approvals, recorded narration and any required music/SFX are still external. Verify final approved media exactly, not diagnostic human impersonation. The 480-frame diagnostic S09 block on review is *correct*; never weaken this to claim ready.

### G11 — remaining known evidence and quality shortcomings

P04 report records: torso and leg shadows visually disconnected; fixture shoulder has squared seam; lever only ~10° so insufficient transfer proof for larger mechanism output; no full phoneme-specific viseme repertoire; no broader real crowd acting. F154 (evidence-builder output-path guard) has no automated regression. Create targeted test for \`tests/p04/build_dependency_graph.mjs\` default output path and no writes outside the authorized output folder. Diagnose significant shadow/limb seam failures with actual painted art; do not build generic shadows to make a diagnostic beautiful.

## Release sequence

1. Preserve P04 and main, do **not** merge/overwrite Claude's in-progress branch.
2. Integrate the creative interface and duration fix; run schema/unit/negative tests.
3. Repair G03, G04, G05, G06 at reusable producers; demonstrate negatives and unlike-subject transfer.
4. Demonstrate short integrated G07 chain including a true image import (diagnostic images correctly labeled).
5. Verify all P0/P01/P02/P03/P04 suites and old failures; frozen-checkout proofs.
6. Publish one **ENGINEERING_READY** report clearly separating externally pending real art/voice/approval.
7. Start a new 10-second creative package in GPT, then use exact F01–F80 ArtJobs and genuine approved images in manual new chat. Pass registration, every-frame feasibility, Neutrino acting and full 600-frame A/V/motion review.
8. If this is the first test, prioritize **10 seconds**, not 10 minutes. Scaling to 10 minutes is a separate capacity and artistic-throughput milestone, not the minimum proof that image→animation works.

**A successful diagnostic or passing test suite cannot establish creative quality, real-image production quality, or broad generalization by itself.**
