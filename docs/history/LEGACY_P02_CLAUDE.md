# ARCHIVED — P02 historical instructions, NOT current session authority

# MOTION_NATIVE_STUDIO_V1 — mandatory session start

Before any work, read `HANDOFF.md` in full. It is the authoritative continuity record (architecture, stage gates, current status, next actions).

## CURRENT BINDING ORDER: Motion-Native Hybrid V2 (supersedes the V1 stage list below for new work)

Binding files: `inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md` (§0–12) and `inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md`.
Architecture: GPT authors every visible art state; the engine (`engine/art_bridge/`) owns registration, compositing, constraints and motion;
the renderer never improvises art (`MISSING_ART_ASSET` → ArtJob). `engine/runtime/nu.js` stays byte-identical.

**Status (see HANDOFF.md "Hybrid V2 — current status"):** Stage 1 MECHANICAL_PASS; Stage 2 MECHANICAL_PASS on diagnostic fixtures (art BLOCKED);
Stage 3 BLOCKED (no image provider; outbox exported); Stage 4 BLOCKED (story approval pending, no art, no narration).
**STOP POINT:** P02 system-repair directive (`inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md`) executed on branch `hv2-system-correction`;
`audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip` awaits independent audit (read `hybrid_v2/evidence/p02/FINAL_REPORT.md`). Production runs go only through
`engine/tools/production_run.mjs` (preflight/start/status/watch/trace/why/resume/verify/export-audit) on the hash-chained ledger; HUMAN authority = signed envelopes
verified against trust anchors OUTSIDE the repo (`ART_BRIDGE_REVIEWER_KEYS_FILE`); test trust only inside `.diagnostic_namespace` films. Every chargeable provider
call needs a signed paid-run manifest (`engine/production/run_authorization.mjs`) and LIVE_VERIFIED capabilities. Do NOT submit art, approve anything,
create a paid run, start bulk production or render the real film until Manmeet authorizes a bounded canary after the audit.
**Authorization reconciliation:** the V1 "Stage 1 is the ONLY authorized stage" list below is historical. Hybrid V2 work is authorized directive-by-directive by Manmeet
(latest: P02, software repair + diagnostic rehearsal only). No directive so far authorizes paid art, real approvals or the real film render.
Art intake goes only through `engine/art_bridge/art_intake.mjs` (export/submit/ingest-master/review-master/ingest-part/review-part/approve-*);
approvals are hash-scoped receipts (`approvals.mjs`), never strings typed into JSON.

Commands: `node --test tests/art_bridge/*.test.mjs tests/p02/*.test.mjs` · `node tests/p02/run_rehearsal.mjs --phase X` · `node tests/p02/replay_audit.mjs` · `node tests/art_bridge/stage2_proofs.mjs` · `node engine/tools/art_bridge_check.mjs check ...` ·
`node engine/tools/art_bridge_qa.mjs qa ...` · `node engine/tools/art_outbox.mjs export|status|ingest ...` (exact forms in HANDOFF.md).
Diagnostic fixtures (`tests/art_bridge/fixtures`, provenance DIAGNOSTIC_FIXTURE) prove mechanics only and are never target art.

## Previous V1 stage gates (historical; Stage 1 F01–F80 work remains preserved evidence)

## Hard stage gates (never skip)

1. **Stage 1 — complete F01–F80 skill-to-method conversion** (current, the ONLY authorized stage).
2. Stage 2 — method-controlled artwork construction (LOCKED until Stage 1 is independently approved by Manmeet).
3. Stage 3 — artistic quality + transferable learning loop (LOCKED until Stage 2 producing control is demonstrated).
4. Stage 4 — complete animation production on the preserved neutrino runtime (LOCKED until art + motion-state construction meet the approved standard).

Passing structural checks never substitutes for a missing producing operation. A method label, catalog entry, validator or generic helper is not an implementation. Missing capabilities must be implemented from the source method; never substituted with generic rounded silhouettes, tube limbs, generic face placement, arbitrary Bézier paths, default shading patches or cartoon templates.

## Authoritative inputs (read their requirements, do not reconstruct from memory)

- `MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md` (identical copy in `inputs/`)
- `MOTION_NATIVE_STUDIO_V1_AUDIT_DRIVEN_BUILD_INSTRUCTIONS.md`
- `reference/construct-kurzgesagt-art/` — current F01–F80 skill (byte-identical to `inputs/construct-kurzgesagt-art.zip`); verbatim method texts extracted to `engine/methods/source/F_SOURCE.json`
- `inputs/EXPERIENCE_DIRECTOR_V1.md` — GPT-owned direction standard (story/experience/shots; Claude does not invent film direction)
- `reference/neutrino_2m_SOURCE_PACKAGE/` — preserved neutrino film source + forensics (read-only)
- `audit_outbox/` — audit packages (evidence; never rewrite)

## Rules

- Preserve existing code, assets, receipts, experiments and the neutrino runtime (`engine/runtime/nu.js`). No resets, reverts or reinstalls.
- Stop and request Manmeet's authorization before entering any locked stage.
- Use absolute paths in shell commands (a `cd` into a subfolder changes the session working directory).
