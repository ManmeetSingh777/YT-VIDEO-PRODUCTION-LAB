# OPEN_DEPENDENCIES — genuine external blockers (not hidden software defects)

1. **Story + Experience Director approval (human).** The laundromat film is a PROPOSAL. Its claims are not authored as a typed story contract
   (`story/STORY_CONTRACT.json` absent) → `FACT_CHECK_REQUIRED`; story approval is refused until it exists. Then:
   `node engine/tools/art_outbox.mjs review-story --film films/hv2_film001 --reviewer NAME --verdict APPROVED --human` (interactive terminal) and `review-direction` likewise.
   The S02 action graph must first add the missing operations the compiler names (`SEMANTIC_ACTION_COVERAGE.json`: bag grip, bag trajectory through the door, contained state; coin trajectory; drum-start track).
2. **Art-director design approvals (human).** Ines: gate PASS, needs `review-design --asset ines_master --human`, which also confirms the 23 decisions' witness regions.
   The other five masters are BLOCKED by design (no family / placeholder molecular block): their briefs must be authored by the art director.
3. **Authorized image provider.** `IMAGE_PROVIDER` / credentials unset. `submitJob` returns `WAITING_FOR_GPT_ART` only after every authority above verifies.
4. **Human visual reviews** of real masters, parts, states, edges, motion passages (`recordArtReview`, `review-master`, `review-part`, `approve-state`, `approve-edge`).
5. **Recorded narration + measured forced alignment** with a registered aligner (montreal-forced-aligner / aeneas / whisperx / gentle), narration timeline file in the manifest.
6. **Real 1920×1080 render of approved art** and the human film review (needs items 1–5 and the open software defect below).

## OPEN SOFTWARE DEFECTS (not external; not claimed as done)
- `engine/film/segment_render.mjs#RENDERERS` has no production per-frame Chrome renderer. Next exact change: add `art_bridge_chrome_frames`
  = a factory that launches one puppeteer page on the composition built by `engine/art_bridge/render.mjs#buildComposition`, seeks `nu.js` to
  frame f and returns the raw RGB screenshot buffer (provenance ART_BRIDGE_CAPTURE); test it with P02 determinism on a 600-frame fixture.
- Renderer-level helpers without a production caller (found by `INDEPENDENT_TRACE.json`): `motion_systems.mjs#seededParticles`, `#shutterSamples`
  (consumer = the per-frame renderer above: particles/drum phase and shutter blur must be evaluated per frame inside it) and `#validateViewTurn`
  (next change: call it from `state_router.mjs#validateStateEdge` for view-changing edges with the bound assets' shared landmarks, after checking the
  existing Stage 2 view-switch fixtures still carry >=3 shared landmarks). All three are tested (M06, M13).
- `compile_film_contracts.mjs` reports `portals: 2` on the proposal: both continuous transitions declare no rim occluder (second mask id) — a direction/art
  data fix the compiler now names.

Items 1–6 are external (human / provider / recorded audio); each has a tested consumer that refuses until the evidence exists. The open software defect is listed separately and is NOT claimed as done.
