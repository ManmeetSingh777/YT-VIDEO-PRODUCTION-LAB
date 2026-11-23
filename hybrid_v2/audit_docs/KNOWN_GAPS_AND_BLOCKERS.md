# Known gaps, unimplemented operations and external blockers

Machine-readable: `hybrid_v2/evidence/OPEN_DEPENDENCIES.json`.

## External blockers (cannot be resolved by code)
1. **No authorized image provider** in this environment (`IMAGE_PROVIDER` unset; no credentials). Stage 3 acceptance, all 48 IMAGE_AUTHORSHIP methods and Stage 4 depend on real GPT pixels. `submitJob` is the production call path and was exercised only against a local TEST STUB server: live execution is **BLOCKED**.
2. **Story approval pending.** `films/hv2_film001` is Claude's *proposal* (laundromat economics), prepared only because no approved script existed. All factual claims are marked [VERIFY]; all 74 ArtJobs are invalid if the story changes.
3. **No recorded narration / measured word alignment.** The only word timings in the repo (`films/_qual_A`) are estimated and are refused for critical cues.
4. **No human whole-look review** of any asset, state or edge (`approved_review_id` null throughout the film manifest).

## Implementation gaps (honest list)
- REGISTERED_MORPH: no homologous SVG command/winding/subpath comparator; all non-vector morphs refused (negative matrix row PARTIAL).
- Cast shadows: occluder/receiver pairs not implemented; only authored attached light planes (negative matrix row PARTIAL).
- EXPLICIT_DEFORM: refused until an approved deformation map/sequence exists (by design).
- No engine consumer for density/detail allocation or projection-grammar enforcement (F33, F47, F53, F77, F38, F60).
- Per-beat medium routing (F19/F20), parallel-state comparison scenes (F29), world_system ArtJob compile (F49), generator routing (F34), camera-sized artwork decision (F55): consumer present, no executed perturbation.
- Repair learning (F56): repair memory initialized and applied at compile time, but zero rules — no real repaired provider image exists.
- S02_room_life (background machines) has no declared mechanism (direction gap; refused by the compiler).
- HyperFrames CLI not run on a bridge composition (capture uses the same nu.js/GSAP timeline in Chrome via puppeteer-core).
- Full-film memory plan (segment unloading, §11.7) and multi-shot A/V assembly not implemented; single 600-frame 60-fps passage verified with ffprobe.
- Hand orientation during grips is either the FK world angle or the wrist's own track (RELATIVE); no prop-socket orientation constraint.
- Body compensation is direction-authored (root/torso tracks), not solved automatically within bounds.

## Stage 3 contract — open items
- No HUMAN design approval exists. The Ines design is a Claude proposal whose witness observations an art director must confirm (`review-design --human`).
- The Ines request is 31 949 of 32 000 characters. Added design prose will be refused by the skill compiler (no truncation); trimming or re-routing decisions is an art-direction call.
- FIT_RIG is declared only for `ines_master`. Washer/ledger/world masters keep SIMILARITY registration.
- Rig feasibility re-solves contact frames only. View-switch and expression timing against fitted landmarks are not yet re-checked.
- Repair memory has 0 rules (no real repaired image exists).

## Things that look done but are not
- "MECHANICAL_PASS" on Stage 2 = mechanics on diagnostic rasters only. It does not qualify art, faces, sleeves, hands or worlds.
- 6 compiled master requests ≠ generated art. `provider_request_submitted: false` in every pre-submission manifest.
- The S02 qualification staging is feasible *without art*; when real art arrives, pivots/landmarks are re-measured by registration and the plan may need re-timing.

## Independent audit P1 items still open
P1-1 orientation-constrained grip; P1-2 automatic counter-balance; P1-4 explicit expression/gaze/fold/light/occlusion state keys (pose/view now rig-scoped);
P1-5 declared `method_uses` are export-existence checks (per-method evidence is in COVERAGE_F01_F80.json); P1-6 real-art repair loop;
P1-3 vector morph comparator / cast shadows (negative matrix rows PARTIAL); P1-7..9 density/projection consumers, full film, story approval.
