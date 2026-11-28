# E01 performance integration and activation: 2026-11-28

## Activated state

- **Packet amendment 08** (`ad5e3967…`) is active, with a HUMAN signature verified against the trust anchor. Mia's amended design is approved (HUMAN).
- **Restaurant master** is re-registered from the corrected construction. The four planes register only against an approved master; the engine enforces this.
- **Amendment 09** (`1aa53c35…`) is imported and awaiting signature:
  - restaurant table settings rebuilt from the measured diners;
  - the performance packet, prop support contracts and profiles, carried verbatim.

## Continuation (`tools/tbo/e01_after_signatures.mjs`)

Each operation records its input sha256, the predecessors it requires, its result and outputs, and whether dependents are eligible. The possible results are OK, FAILED, SKIPPED_DEPENDENCY and AWAITING_APPROVAL. The record is written to `films/e01/handoff/CONTINUATION_RECORD.json`.

The first run on 08 proved the gating: plane registration was refused, so the physical solve and the motion plan were skipped rather than run on the stale counter.

## Engine changes (reusable; no film knowledge)

| Change | What it does |
|---|---|
| `performance_commands.mjs` | A grip command adopts the identical action-graph contact (same hand, socket and window) instead of conflicting with it. Its release is the one at that contact's end. A grip may name a prop-specific closure state for its hand channel. |
| `story/performance_packet.mjs` | Action graph → PerformanceCommand v1.1 packet: characters and role maps from the measured rigs, grip/release per hand contact, support-contract validation. Coverage maps every directed event (contact, view, pose, state, root, acting, gaze, camera, support) to its executing producer, with EXECUTABLE, PENDING_GEOMETRY or PENDING_ART. |
| `story/runtime_plan.mjs` | Semantic plan → runtime plan: placements plus root offsets (temporal adds tracks to placements), and cameras solved only from directed framing. `headCamera` derives zoom from the directed head px over the measured world head. |
| `art_bridge/executable_subset.mjs` | Removes unmeasured rigs and everything that depends on them, and reports what was removed. |
| `temporal.mjs` `geometryOnly` | Verifies joints, contacts, IK and prop drivers without drawings. Missing-art refusals are recorded as `deferred_art`, and `composeShot` refuses such a plan. |
| `acting.mjs` | Contiguous words: the next word's opening owns the boundary frame. This fixed the E01 mouth STATE_CONFLICT at f146 ("too" / "much"). |
| `art_intake.mjs` family feasibility | A pose change needs an edge only if the VISIBLE drawing set changes (pose bindings overlaid by the active view). This unblocked 134 Mia derived jobs; f320 lower→reach is overridden by the to_lead view. |
| `component_route.mjs` | Native-resolution threshold calibrated on the master: the midpoint between the master's own edge ratio and its enlargement's. The fixed f=2 floor of 1.50 rejected the approved master itself (1.440); enlargements score 1.09–1.12. |
| `engine/tools/palette_landmarks.py` | Landmarks as measured properties of flat-colour regions (lowest, centroid, …). |

## E01 results

| Area | Result |
|---|---|
| `compilePerformance` | Accepts the executable packet with one error class: `PROFILE_APPROVAL` (awaits the amendment 09 signature). |
| Award runtime | Geometry-only check of A02, A04 and A07 on SH01, at 18 checked frames from 0 to 341, with **0 failures**. Hands grip by geometry: right hand on `grip_l`, left on `grip_r`. Mia's right hand drives until 296; the counter drives from 296 at set-down (1007, 945), which lies on the counter top (span 416–1920 at the support line). Both hand contacts persist past 296. The right releases at 306; the left holds across Mia's body turn at 306 and releases at 320. |
| Cameras | CAM_SH01 is a locked world-scale camera (Mia's head 174 px, inside 160–190). CAM_SH03 has zoom 1.437 for the directed 250 px head, with Mia centred and her head on the upper third. CAM_SH02 is pending the page pose. |
| Mia head (V6 return) | Registered pending review. Crown-to-chin is 586 native px. The existing mouth fits; the eyes, brows and cheeks do not. |

## Not yet executable

| Item | Reason |
|---|---|
| LEAD, REGULAR, PROP_PHONE | Rigs unmeasured (masters not registered). |
| Report and phone contracts | Compiled; pending those rigs. |
| Speech actions | Routed REGISTERED_CELS without cel cycles. |
| A01 | PROCEDURAL with no mechanism. |
| SH02 camera | Needs the page pose. |
| Footage | None: no interval yet has every drawing approved. |
