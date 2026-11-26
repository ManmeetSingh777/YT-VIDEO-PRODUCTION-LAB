# P08 closure addendum: transition into E01 production (2026-11-26/27)

**Disposition (user):**
- The frozen `ef0a722` regression (365/367) and the targeted 2/2 re-test of the fixes are accepted for controlled production progression.
- This is **not** full release qualification. No second standalone P08 regression was run.
- The user has approved the P3.2 revised animatic's composition, blocking, timing and performance intentions for phase one. Drawings, motion, the
  mix, artwork and the executable packet are not approved by that statement.

## Priority 1: creative-packet compilation handoff (delivered first)
- **ZIP:** `E:\TBO_PRIVATE\E01_CREATIVE_PACKET_COMPILATION_HANDOFF.zip` (private; sha256 `d4d4784405ee05106fe8696bec099d57a755791e0703b69b5b7bd55174c041f3`). Built
  by `tools/tbo/e01_packet_handoff.mjs` from engine `1c7d9c1`.
- **Contents:**
  - schemas, validators and P08 contract sources as byte copies;
  - a field reference and rule-code list generated from the live schema and code;
  - a DIAGNOSTIC example validated by `validatePacket` and `hybridPreflight`;
  - source hashes, the P3.2 and V0.4 sources, and the instructions `engineering/e01_packet/GPT_PACKET_COMPILATION_INSTRUCTIONS.md` and `P08_CONTRACT_ROUTING.md`.
- **Fixed while building it:** the hybrid contract still refused anything but the legacy `REST_MID_OPEN` mouths and only ORTHO hosts.
  - It now routes `mouth_scheme: "VISEME"` to the P08 measured-phone producer and accepts calibrated PERSP hosts.
- **Stated plainly in the handoff:** there is **no automatic packet → P08 MOTION_PLAN compiler**. Claude writes the plan during reconciliation,
  and the A01 ledger checks it.

## Priority 2: the outstanding P08 requirements (implemented, targeted tests on the real runtime)
| Req | Producer → consumer (production path) | Tests |
|---|---|---|
| A01 | `engine/film/obligation_ledger.mjs`: every directed action joined to its bound producers (composition primitives now carry their source action), their per-frame QA and the owner's own rendered pixels. S08 task `obligation_ledger` reads the render receipts (`coverage_gate.renderedOwners`) and writes `OBLIGATION_LEDGER.json`. | `tests/p08/obligation_ledger.test.mjs` 3/3: deleted producer under a moving camera, no-op producer with correct metadata, partial interval, wrong owner, dropped action, unbound primitive, frames-checked shortfall |
| C04 | `integrity_qa.verifyPupilContainment`: every opaque pupil pixel mapped into the registered eye mask (`face_composition.pupil`). Wired through `verifyFaceComposition` / `verifyPerformance` with the film. | `tests/p08/face_pupil.test.mjs`: a corner pupil that a bbox test passes is refused; an escaped pupil is refused; a declared pupil with no art is not skipped |
| C05 | `framing.verifyAttention`: target visible pixels through the camera, frame clip, and occlusion by later-painted drawings and world plates (renderer paint order); readable minimum; empty-interval and unknown-target checks. S03 task `attention_windows` (every PRODUCTION run). | `tests/p08/attention.test.mjs` 2/2: offscreen actor, camera pan, covering prop, short window, gap, unknown target; the P05 cave rock hiding lumen |
| D03 | `art_bridge/native_resolution.mjs`: native source px per screen px at the largest coverage on every frame, at the approved factor (`plan.resolution_policy.native_factor`). `effectiveUpscale` counts an enlarged source at its native size. S06 task `native_resolution`. | `tests/p08/native_resolution.test.mjs`: middle-frame push, too-small art, 2× nearest-upscaled source, missing factor |
| CAPTION_OVERLAY | `engine/film/captions.mjs` compiles the approved SRT/VTT (hash-checked, SRT ≡ VTT) onto the frame clock, with dwell, safe-lane layout, forbidden intervals, collisions with protected/attended content, phase ↔ extract equivalence and frame-exact sidecars. The real compositor is `chrome_frames` → `scene_graph` caption elements switched by `frameState`. S09 task `captions` publishes the sidecars. | `tests/p08/captions.test.mjs` 2/2: approved P3.2 files ("Thanks" = [326,398) = 72 f; extract ≡ phase − 180 f), the historical P3.1 0.48 s refusal, real Chrome burn-in on exactly the cue frames, lane collision |
| E04 | Real Cycles Z pass (compositor File Output → OpenImageIO → gzip float32), verified against the engine's camera depth at every contact. Per-pixel slices are painted among the declared 2D band depths, and `verifyDepthComposite` judges final pixels. | `tests/p08/host_depth.test.mjs` (real Blender 5.1 + Chrome): behind the counter, split per pixel at the crossing, in front after; host-always-in-front, wrong order, halo, missing/stale depth, other units, diagnostic stand-in in PRODUCTION and unordered depths are each refused |

The regressions run alongside these: composition, face/speech, integrity, the TBO-G14 host test, the E03 host test, the hybrid contract and the universal contract all pass.

## Findings (reported, not hidden)
- **Captions:** the approved P3.2 "Too much?" [135,173) is on screen 0.633 s, below the 1.0 s default minimum dwell. Its reading rate is fine (9 characters).
  - The dwell minimum is a creative-policy decision, or the cue is re-timed. It was not changed here.
- **P05 diagnostic direction:** it attends to lumen during [270,450) while the cave's FOREGROUND rock covers it.
  - C05 measures this, so the diagnostic chain enables the attention gate only when its plan declares a policy. Every PRODUCTION run is gated.
- **E04:** each flat 2D layer has one declared depth. Depth that varies within one painted layer is not represented.

## Not done / next
- **Phase-one production** waits for the Creative GPT packet: validate, reconcile, compile the P08 MOTION_PLAN, ledger all 19 actions, then the
  human signatures, then the first master ArtJobs (manual route).
- **The next comprehensive release regression** runs on the consolidated final engineering revision: the integration branch merged with this work.
