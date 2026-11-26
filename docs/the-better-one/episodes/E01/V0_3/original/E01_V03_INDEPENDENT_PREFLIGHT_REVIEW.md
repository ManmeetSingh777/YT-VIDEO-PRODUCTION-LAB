# THE BETTER ONE — E01-S001 V0.3 Independent Preflight Review

**Reviewed:** 26 November 2026. **Input:** `E01_V0_3_DIRECTOR_PACKAGE(1).zip`. This document is an independent text/structure inspection, NOT an engine execution, artistic approval or a recorded scratch-audio test.

## 1. Source integrity and comparison

The ZIP opens without CRC errors and has exactly four text documents:
- `E01_MODEL_AND_EVIDENCE_V0_3.md` (294 lines)
- `E01_VALUE_BLUEPRINT_V0_3.md` (68 lines)
- `E01_S001_DIRECTOR_V0_3.md` (175 lines)
- `E01_CREATIVE_DECISION_REGISTER_V0_3.md` (77 lines)

The V0.3 economic model, beginning at `## 3. M01 — common financial baseline and cost boundary`, is **byte-for-byte equivalent as Unicode lines** to the V0.2 model body available in the current conversation. Only its header/version/companion notes changed. Do not rerun basic financial scenario development for this visual-performance revision.

Sequence invariants parsed from the actual V0.3 source: exactly 15 IDs `E01-S001-A01`–`A15`, 11 `AUD01`–`AUD11` cues, three contiguous editorial shots `[0,390)`, `[390,540)`, `[540,780)`, target 780 frames @60fps. Frame ranges of two intentionally extended actions: A03 `[0,650)`, A04 `[86,206)`. No new actual art, human approvals, asset SHA metadata or verified render were included.

Financial baseline: 70 steak orders at $24 and 90 flatbreads at $17 = $3,210 daily sales; modeled incremental cost $1,330; committed operating cost $2,000; result **−$120/day**. All of this is hypothetical fictional model M01, not a factual restaurant audit. The 1,200 model zone-minutes reflect separate lunch/dinner scheduling hypotheses; new seat-capacity constraint can bind in a favorable-demand scenario. Model explicitly admits a price increase could win. Human ending choice remains open.

## 2. Verified V0.3 creative corrections

1. **Phone / CHAR_REGULAR:** ready/lowered through f611; raise `[612,650)`; thumb acts `[668,686)` with capture at f678; lower `[690,734)`; review `[734,780)`. There is no 9-second sustained photo-height hold.
2. **Plaque / CHAR_MIA:** base contact f136; counter takes load f151; right hand clear f165; left hand clear f181; free left arm settles at side f206. Thus award is not held all scene.
3. **Identity language:** signature steak described as most celebrated, not bestselling; baseline is 70 steak versus 90 flatbread orders.
4. **Audio:** proposed dialogue at f20–86, f102–300, f594–650, photo at f678. Important: these are NOT measured voice/phoneme timings.
5. **Source-side constraints:** dual-contact report handoff first touch f236, secure Mia grip f250, brief both-hold f250–255, lead hand entirely clear f269, Mia retains report through f779. No anonymous prop repositioning.

## 3. Remaining issues to resolve in real pre-art validation (do NOT re-open the entire screenplay)

**I-01 — Shared transform ownership, f104–107.** A02 `[0,108)` states the award stays stable while A04 `[86,206)` lowers the award from f104. Clarify that A02 owns Mia's performance and initial hand-contact state **but does not write an independent award world transform** after f104; A04 exclusively owns the plaque motion while preserving stable hand-to-plaque relative contact. If A02 means the plaque must be world-stationary through f107, there is a four-frame contradiction to revise explicitly.

**I-02 — Multi-actor action decomposition.** The proposed P06 `PERFORMANCE_COMMAND_SCHEMA_V1.json` has one `actor_rig_id` per command; A01 contains background actors, A08 contains Mia + Lead + report shared ownership, and A15 contains Regular + Mia + Lead + props. Claude must compile synchronized *per-owner* command tracks under the SAME immutable editorial action IDs, with group correlation and an explicit exclusive prop-transform owner on each frame. It must not flatten a multi-actor event into one actor, duplicate the prop transform, or silently drop secondary acting.

**I-03 — Voice and hold timing still hypothetical.** Windows `[20,86)`, `[102,300)` and `[594,650)` must be measured with an actual spoken scratch recording; also observe whether the report insert `[390,540)` gives unfamiliar viewers sufficient reading time, and whether customer phone motivation is legible in final shot framing. If timing fails, revise only the affected intervals and revalidate dependent overlaps.

**I-04 — Renderer-specific art demands unqualified.** Need exact hand and finger front/back cels, hand near/far occlusion at report handoff and phone thumb press, plaque underpaint/release, 2D face/view states, reading gaze, counter surface, clean plate, world/camera coverage, printed report text at correct perspective and frame-visible mouth acting. P06 must return exact art-state DAG and producer/consumer/status; no source art exists yet.

**I-05 — Avoid incorrect status promotion.** This ZIP contains human-readable creative direction, not actual `CREATIVE_PACKET.json` v1.1 and not audio or F01–F80 final art. Passing document checks, baseline regression or synthetic-fixture render does NOT certify this real film. The Blender host and strategy decoder are not in this 13s interval and require independent real-film proofs later.

**I-06 — Marketing/ending separate from first-clip approval.** The final episode title, cash-resolution strategy and longer-film screenplay remain open, but the opening's fictional baseline and intended contradiction can be provisionally reviewed without fixing the entire ending. Keep the title and final financial outcome as proposed.

## 4. Requested next handoff to Claude AFTER P06 final regression

1. Retrieve exact P06 engineering full SHA, branch, final regression log, negative tests and real status; do not accept last source SHA based only on documentation.
2. Read extracted four V0.3 files (not V0.2). Read this independent review alongside them. Confirm source files' actual SHA-256 and never invent approval signatures.
3. Run **provisional** action-to-real-producer and art-demand preflight for A01–A15 and AUD01–AUD11. Address I-01 and I-02 without changing approved creativity. For each actor and action list exact engine producer, consumer, capability status, required painted state/view/underpaint, timeline and typed refusal if unsupported.
4. Build a valid `CREATIVE_PACKET.json` v1.1 or report required schema conversion rules; include real relative referenced file paths/hashes and version. No fake images, audio or human signatures. Human approval status remains `PROPOSED`.
5. Return **precise first art commission**: canonical master jobs for Mia, Lead, Regular, Restaurant, Award, Report, Phone; dependent hand/face/pose cels/masks and camera crops; any missing native functionality. Where constraints are met, request human creative approval and actual image production.
6. Once real approved artwork and scratch/production audio are supplied: fit actual art pixels, render actual 780 frames at 1080p60, inspect real acting and exact final mixed MP4, keep a stable source/asset/audio/approval record, and request actual human artistic playback acceptance.

## 5. User's highest-leverage next actions

- Keep the single final P06 regression running; don't start another exhaustive suite.
- Preserve V0.3 package and stop using V0.2 as the active scene source. If old V0.2 ZIP is in Claude's project folder, **identify V0.3 by exact filename** and do not infer that replacing or downloading in ChatGPT automatically updates Claude's local files.
- Record a rough 13-second voice timing test with Mia/Regular/Mia lines at the proposed windows and listen with 6.5–9s silent reading gap. This is an editing test, not final voice casting.
- Review and approve *this opening only*, conditionally on honest audio/playback and engine preflight; do not mark overall story/ending approved.
- Supply V0.3 ZIP + this review to Claude after its final P06 report; require a concrete producer/ArtJob return, then open a separate F01–F80 art-production session with verified installed skill/witnesses.

**Bottom line:** V0.3 is ready for measured audio and provisional engine feasibility. It is NOT ready for unconditional final image generation or for technical/artistic PASS. Correct local operator-ownership ambiguity; do not restart the story development.
