# E01 V0.4-DIR-P1 — Independent package intake and production risk review

**Inspection:** The original nine creative files in the supplied ZIP match the exact SHA-256 hashes in `DELTA_MANIFEST.json`. These nine have been preserved byte-for-byte. `DELTA_MANIFEST.json` is the tenth file. The archive contains no source code, audio, images, CREATIVE_PACKET v1.1.0, human sign-off or P06 executable proof.

## Verified document facts
- Opening is [0,1950) absolute at 60fps (32.5s), 1920x1080.
- Shot timeline is seven adjacent half-open intervals [0,432), [432,576), [576,960), [960,1098), [1098,1332), [1332,1485), [1485,1950), without gaps or overlaps.
- Seven separate director sections each have 12 numbered contract fields.
- 25 active action rows (A01–A26 excluding retired A11), 24 audio cues, 27 defined art families.
- Extract [180,960) contains 780 frames. Local [0,780), local f0 == abs f180; 48kHz sample offset at 60fps: [144000,768000).
- `E01_CONTINUITY_CHECKPOINTS_V0_4_P1.csv` contains 17 data rows, not the 18 mentioned in accompanying GPT prose. The JSON manifest correctly says 17. Reconcile reporting, do not manufacture a new checkpoint.
- No final approved creative packet or real P06 engine preflight exists within these documents. All audio times are estimated.

## Required small corrections BEFORE automatic code ingestion
1. **Normalize reference syntax:** The CSV uses art-family shorthands `ART_M01–06`, `ART_M02–06`, `ART_M04–06`, `ART_P01–03`; expand each to explicit canonical art IDs. `shot_ids` and `linked_audio_cues` are space-separated multi-value strings, not typed JSON arrays. Parse consciously and reject unknown IDs, rather than silently discarding values. Convert prose action dependencies to typed constraints with explicit independent actor channels and one transform owner per prop.
2. **Pre-roll and freeze context:** The 780-frame accepted extract excludes the original f0–179 award performance and f960 freeze. This first genuine smile is essential to the later fake-smile payoff, and the freeze is the transition target. Compile deterministic state at f180 from the actual full-film absolute timeline. For artistic proof, play/review at least actual f0–960 with pre-roll+freeze, or a continuous 16s preview when feasible; only [180,960) is scored as the initial 780-frame qualification. No resetting actors to a new neutral state at local f0.
3. **Audio exceptions are explicit:** AUD08 spans [432,579), three frames into SH03 to preserve a speech-free comprehension pause. AUD11 crosses f960 as a transition tail. These are not zero-gap shot-cover errors; preserve intent and implement audibly rather than clipping blindly to shots. Exact timing must change after real scratch takes.
4. **The art families are not concrete ArtJobs:** no canonical Mia PNG or separate transparent part/cel/hidden underpaint is present. Use the actual current P06 schema and implemented art-demand closure, refuse missing final visuals. Do not interpret scene coordinates (x.52 etc.) as confirmed character pixels, rig lengths or approval of geometry.
5. **Economic source continuity:** The ZIP references upstream `E01_MODEL_AND_EVIDENCE_V0_3.md` and `E01_VALUE_BLUEPRINT_V0_3.md` by hash but does not contain their bytes. Get the actual originals before formally signing economic or creative packets. Do not regenerate them from this screenplay.
6. **No false engine certification:** Current published production branch was observed at commit 612b590eddefe89e0d09f068078340a1dfa6ee4d, which is governance; user's running local P06 regression may not be pushed. P06 support, real Blender host, F01–F80 art quality, final sound and approved footage are unverified.

## Exact handoff procedure once local P06 regression reaches stable checkpoint
1. Copy the original user ZIP (or this audited copy) into the live source checkout's `inputs/` folder. Preserve uncommitted files and local P06 history; do not reset/force push.
2. Use SHA-256 validation against `DELTA_MANIFEST.json`. Store all ten ORIGINAL files unchanged in `docs/the-better-one/episodes/E01/V0_4_DIR_P1/` on a safely reconciled creative/design branch. Record source commit, branch, file hashes, source path and PROPOSED status. Nothing counts as human approved.
3. Load the actual repository's newest P06 implemented command schema, composer and output consumers, then build a provisional action-to-producer feasibility matrix for 25 actions. For each action require: actor channels, owner(s), exact film ranges, target prop/contact, view/face/mouth/hand state demands, actual producer and consumer, required art pixels/cels, audio timing, negative control and typed UNSUPPORTED/REQUIRES_ART when needed.
4. Show any directorial conflicts to GPT/user. Do not silently delete/shorten difficult actions, replace canonical artwork with placeholders or redraw Mia to fit a generic rig.
5. After natural scratch performance and user approval of the exact revised 32.5s opening, issue a new hash-locked v1.1.0 engine creative packet, run *formal* pre-art and return the exact first-ArtJobs export and any unsupported commands.
6. Generate original F01–F80 art manually in an authorized GPT art session after verifying the installed skill + native witnesses; human-approve canonical identity before derived images. Register, measure, fit and test actual art on the required 780 frames.
7. Compile actual sound with real frames. Review native moving video for both physical contact and the genuine-smile→forced-smile emotional contrast. Review original 0–3s setup as context and f960 as the next transition. Separate genuine 3D host/decoder qualification uses subsequent actual-film intervals.

**Priority:** These items are specific packaging/gating repairs, not reasons to restart creative research or run another unrelated 7,200-frame diagnostic. The end product is real approved footage, not a green manifest.
