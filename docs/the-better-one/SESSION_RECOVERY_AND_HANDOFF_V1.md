# THE BETTER ONE — RESTART ANY GPT OR CLAUDE SESSION WITHOUT LOSING PRODUCTION INTENT
**Status:** permanent human + machine handoff procedure; does not override creative approvals.
This file is a short entrypoint. Full technical requirements and acceptance rules stay in PRODUCTION_OPERATING_STANDARD_V1.md and the referenced Channel Bible/Director/quality gate/engine source.

**New F01–F80 art chats:** The mandatory art-specific contract is docs/the-better-one/ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md. DO NOT start from a generic character-generation prompt. Get the actual sealed GPT_ART_HANDOFF_<JOB> ZIP from art_outbox.mjs export-gpt-job after current approved creative/demand preflight; follow the included WHAT_TO_DO_IN_CHATGPT.md and exact skill/witness checks. Return actual image bytes and the hash-correct import manifest for native source-attached candidate review.

## 1. New session: required five facts, in this exact order

1. REPOSITORY: ManmeetSingh777/YT-VIDEO-PRODUCTION-LAB, current film branch production/better-one-mia-first-film **unless the latest verified active branch says otherwise**. Claude also has LOCAL hv2-system-correction and may not have pushed P06 yet. Never replace it or discard work merely to follow the docs branch.
2. EPISODE: E01 or explicit new episode ID. Read docs/the-better-one/episodes/<ID>/EPISODE_STATE.json; no state file = STOP and create one first with truthfully unresolved items.
3. AUTHORITY: read complete Channel Bible, permanent SOP, latest user APPROVED decisions and actual source documents for the requested task. No remembered synopsis substitutes for exact file body. Verify exact SHA/content at the working commit.
4. CURRENT STAGE: determine creative / engineering / artwork / film review. Read the actual stage source, prior decisions and active change-impact manifest. Do not silently jump to image generation from a proposed screenplay.
5. NEXT REQUIRED OPERATION: name ONE executable deliverable, its upstream input hashes, actual owner, pass/fail rule and what must not be changed. Return exact output names and human review requests.

## 2. Session-pack generation is now repeatable, not handwritten

The repository includes a deterministic text-pack builder at:
tools/tbo/build_session_pack.mjs

Existing session source manifests:
docs/the-better-one/session-packs/E01_CREATIVE_RECOVERY.json
docs/the-better-one/session-packs/E01_PREART_ENGINEERING.json

From the repository root (using Node.js and the true working branch), run:

    node tools/tbo/build_session_pack.mjs --manifest docs/the-better-one/session-packs/E01_CREATIVE_RECOVERY.json --out exports/session_packs/E01_CREATIVE_RECOVERY.md

For later engineering source review:

    node tools/tbo/build_session_pack.mjs --manifest docs/the-better-one/session-packs/E01_PREART_ENGINEERING.json --out exports/session_packs/E01_PREART_ENGINEERING.md

The builder fails for missing source files and privacy-dangerous paths. It copies FULL source text and produces an adjacent .sources.json with each SHA-256 and the source Git HEAD. Check that the builder executes successfully on the actual local repo; do not claim it has passed integration until run. A Git HEAD does not prove the worktree is clean: report git status separately.

**E02 and later:** copy the manifest to a new episode-specific name, replace its episode source paths, do not rewrite the builder or create an entire new set of custom GPT instructions. The latest full source files, episode state and current stage requirements are the contents of the portable pack. User provides missing original unpublished sources explicitly.

Do not include: license-restricted F01–F80 visual witnesses in public GitHub, signing private keys, private voice data, personal transcripts or unlicensed film images. The real F01–F80 skill must be accessed through the authorized installed skill in the actual art chat.

## 3. Paste for a NEW GPT CREATIVE / EXPERIENCE DIRECTOR CHAT

I am producing The Better One (episode E01, or the episode ID in the attached state).
Read the attached ENTIRE deterministic source pack including its source index, full Channel Bible, Production Operating Standard V1, latest Episode State, actual current screenplay, Experience Director V1 and quality standard. Confirm which original files you can actually access, and do not claim to have read an unavailable companion model.
Your role is EDITOR/RESEARCHER/EXPERIENCE DIRECTOR, not engine implementer.
Follow mandatory order: source truth and credible value → viewer promise → complete naturally performed entertaining story → user editorial approval → full 12-part shot direction, acting and audio → typed pre-art handoff.
Latest E01 opening V0.4 is PROPOSED: 32.5 seconds; first qualification is [180,960) absolute, 780 frames/13 seconds. Do NOT auto-approve its dialogue or estimate voice timings as measured. Preserve financial model and version lineage; any change must issue changed IDs, reason and downstream invalidation.
Do not generate final artwork, invent approvals, change the economic facts for comedy, flatten difficult acting or impose generic geometry on the artist.
Return the smallest complete actual deliverable for the CURRENT stage, the human decisions needed, and a change-impact ledger. We are making a genuinely excellent film, not creating a new engine demo.

## 4. Paste for a NEW GPT F01–F80 ART PRODUCTION CHAT (ONLY AFTER REAL ARTJOBS)

I am creating genuine original animation-ready artwork for The Better One. Read the complete approved shot/ArtJob requirements and latest Episode State, the approved character identity/design and visual quality gates.
FIRST verify the installed current F01–F80 construct-kurzgesagt-art skill/version and required source-native visual witnesses and construction/repair references are actually accessible. If critical skill files/witnesses are unavailable, stop and report the precise missing input; never substitute generic remembered art rules.
Use approved canonical character master → source-attached derivative state family → painted separated parts/hidden underpaint/hand near-far/cel/mouth/eye/view expression/scene-plane images as the actual ArtJobs require.
Use the actual image generation interface, inspect resulting pixels and repair the earliest generating cause; do not declare a written prompt equivalent to an image.
For every output, supply real file bytes and measured dimensions/alpha, original master identity, source lineage, art_job_id, relevant motion/action IDs, stage/cel state, landmark requirements, masks/occlusion and approved/rejected state. Human approval is required before final ingestion or render use.
Do not recreate protected film frames or edit an existing canonical master without a revised human decision. New story characters are original; only the recurring host retains a reusable identity.

## 5. Paste for a NEW CLAUDE CODE ENGINEERING / PRODUCTION CHAT

Check current folder, git root/status/remotes/branches, HEAD and uncommitted evidence before any checkout or change. Preserve local work, especially any finished but not yet pushed P06 implementation.
Read root CLAUDE.md and HANDOFF.md, then Production Operating Standard V1, current EPISODE_STATE.json, P06/current runtime code and actual creative packet. Verify uploaded source file hashes; V0.4 proposed opening supersedes V0.3 creative text, NOT its financial model or approved past assets.
Do not independently write the story or generate substitute art. Compile the approved 12-part Director into exact v1.1.0 creative packet and real command consumers; perform true pre-art demand and capability closure, then real-art registered motion/Blender/model-linked graphics, A/V, 20 quality gates, negative tests and visual review.
The first E01 actual clip is proposed film frames [180,960) not [0,780) absolute. Its local interval is [0,780). The f180 opening state must be inherited from the full film, not re-authored just for an isolated test. Do not cram host/decoder into a 13s clip to claim all modules passed.
Report exact producer-to-render-consumer status, actual compiled artifacts, code SHA, image/source/media hashes, true tests and external blockers. Do not run expensive full historical regressions twice; perform targeted fixes and one frozen-final-source suite.

## 6. When a session or account crashes/compacts
- Save/commit stage outputs and exact SOURCE_SHA, INPUT_SHA, APPROVAL_SCOPE and status to EPISODE_STATE.json and HANDOFF.md; link actual artifact paths. Never update status to PASS without real evidence.
- A new agent runs the five-fact startup, reads files and continues only the next pending operation. Do not re-create previous character masters, accepted footage, research or model from vague recollection.
- When a creative choice changes, emit CHANGE_IMPACT.json with changed IDs, preserved IDs, output artifact invalidation and necessary engineering reruns. Same file hash means unaffected dependencies may be reused.
- Record complete/partial/canceled test attempts distinctly, with source code SHA and logs. Never promise delivery after disconnection unless a real scheduled automation is used.
- On conflict between the current user's actual choice and an old spec, surface the conflict and require explicit approval; DO NOT let Claude silently resolve it by coding a different visual.

## 7. Fail-safe art and human review boundary
All complete storyboard/spec source packs are **information**. Real ArtJobs are generated only after approved director and real preflight. Real artwork and original host are approved by the user. A smooth 780-frame diagnostic does NOT demonstrate perfect F01–F80 character animation. A clean P06 regression is necessary but not sufficient. The user must watch actual real-art footage with actual sound and judge identity, expressive acting, beauty, comedy and clarity. Only that footage goes into the accepted film ledger.
