# hv2_film001 — Experience Director V1 proposal

> **STATUS: STORY_APPROVAL_PENDING.** No approved script or direction existed in the repository (`films/_qual_A` is a 2-sentence motion test,
> neutrino is a finished prior film). This is a **proposal** prepared so the motion/art dependency graph can be built and audited. Topic,
> narration, and every factual claim require Manmeet's approval and research before any image generation. Claims marked **[VERIFY]** are
> not researched facts; no number in this document is asserted as true. Direction ownership remains with the approved director (GPT /
> Experience Director V1); this proposal can be replaced wholesale without changing any engine code.

Working title: **"The Quarters That Never Sleep"** — why a laundromat is a machine for selling *turns*, and why its real enemy is the empty hour.
Format: 120 s, 1920×1080, 60 fps (7200 frames). Machine-readable versions: `direction/SHOT_SCORE_60FPS.json`, `handoff/ART_AND_MOTION_MANIFEST_V2.json`.

## 1. Story truth and claim ladder (Stage One → `00_STORY_TRUTH`)
- **Audience question:** How does a business that charges small amounts per wash pay for an entire shop?
- **Ordinary belief:** a laundromat is a sleepy, low-effort shop that "makes money while you sleep".
- **Incomplete part:** the shop is paid per **turn** (cycle) of each machine; fixed costs run every hour, so revenue depends on **utilisation** — how many hours each machine is actually turning.
- **Causal model:** decision (machines, price, hours, services) → operating mechanism (turns per machine per day) → financial effect (turn revenue − water/energy/heat per turn − fixed rent/labour/maintenance) → constraint (idle hours, peak crowding, machine downtime) → competitive response (nearby shops, home machines) → outcome (profit is a utilisation story).
- **Claims to research [VERIFY]:** typical price per wash/dry; utility cost per cycle; typical utilisation curve by hour; rent share of costs; effect of card readers / wash-and-fold on utilisation. **Uncertain/hypothetical:** the S06 "levers" are *modelled possibilities*, shown as alternatives, never as guaranteed outcomes.
- **Final insight:** the laundromat isn't selling washing; it is selling machine-hours, and the empty hour is its real cost.

## 2. Spectator journey (Stage Two → `01_EXPERIENCE_MASTER`)
| # | Interval | BEFORE | PRESSURE | DISCOVERY | FEELING | NEXT QUESTION |
|---|---|---|---|---|---|---|
| T1 | 0–15 s | a sock tumbling is just laundry | the camera keeps pulling back: dozens of identical drums | every drum is a meter | curiosity | what is each turn worth? |
| T2 | 15–32 s | paying is trivial | Ines' coin is one small price | the door, the coin and the spin are one paid *turn* | recognition | how do small turns pay for a shop? |
| T3 | 32–50 s | the drum is a container | inside, every revolution ticks a counter | revenue is counted in turns | fascination | what does each turn cost? |
| T4 | 50–68 s | revenue = profit | three pipes drain the wheel (water, power, heat) | a turn leaves a thin remainder | surprise | what happens when turns stop? |
| T5 | 68–86 s | the shop "makes money while you sleep" | at 3 a.m. most drums sit dark | the empty hour still costs rent | tension | can the owner fill the dark hours? |
| T6 | 86–104 s | more machines = more money | three levers compared on one utilisation meter | only levers that fill idle hours move the meter (modelled) | earned skepticism | — |
| T7 | 104–120 s | the opening sock | the counter now ticks on every turn | the opening image reads as a counted turn | satisfaction | (close) |

## 3. Visual inventions (Stage Three): three moving candidates per hard concept
- **"Revenue is per turn"** — (a) coins dropping into each drum per revolution; (b) **a turn counter riding the drum rim** (chosen: causal, attached to the real machine, survives the porthole transition); (c) a price tag flipping per cycle (rejected: label-reading, no mechanism).
- **"Costs per turn"** — (a) bar chart (rejected: static); (b) **the drum rim becomes a ledger wheel: one inflow pipe, three outflow pipes whose flow scales with turn rate** (chosen: the same rotation drives revenue and costs); (c) a draining tank (rejected: loses the per-turn coupling).
- **"Utilisation"** — (a) a clock-face heat map; (b) **the night street: machines dim one by one as the clock sweeps** (chosen: physical, legible at 1/10 scale); (c) a percentage dial alone (kept only as the S06 meter).

## 4. Identity / world atlas
| Identity | Kind | Canonical master | Views / states required by the action graph |
|---|---|---|---|
| Ines | CHARACTER | `ines_master` | three-quarter right; profile turn (registered swap); hand open / grip / pinch; curious, satisfied |
| Washer | MACHINE | `washer_master` | door closed/half/open (registered states, door opens in depth); drum spin; coin flap; laundry load + tumbling |
| Laundromat | WORLD | `laundromat_far` | far / mid machines / foreground counter with overscan for the S01 pull-back and S02 push |
| Drum interior | WORLD | `drum_in` | IN plate of the porthole push; paddles |
| Ledger glyphs | DIAGRAM | `ledger_master` | coin, water, power, gas symbols; live type values; lever symbols |
| Night street | WORLD | `street_far` | shops mid layer, lamp foreground, lit window interior |

Projection: eye-level planar layers; the only perspective changes are authored transition plates (no 2D plate rotated past its facing).

## 5. Shot / event master (60 fps)
See `direction/SHOT_SCORE_60FPS.json` (every interval with entry, events, contacts, poses, views, attention path, exit, reading holds). Summary:
- **S01 0–900** sock tumble → pull back to the row. **S02 900–1920** (qualification scene, fully specified below). **S03 1920–3000** inside the drum: turns tick. **S04 3000–4080** ledger wheel. **S05 4080–5160** night street. **S06 5160–6240** levers vs utilisation meter (modelled). **S07 6240–7200** return to the sock; closing recognition hold.

**S02 action contract (`handoff/MOTION_PLAN_S02.json`):** Ines stands with the left foot planted (PLANT 900–1920); reach-in 990–1050; GRIP handle 1050–1260 while the door goes closed→half (1170)→open (1230), the handle following the registered handle landmark, Ines shifting her weight (root lean, foot planted); release 1260–1296; GRIP 1320–1392 to push the door closed (half 1356, closed 1392); hand_pinch state 1410; coin FOLLOW into the slot 1470–1560 with the coin flap reacting; drum starts 1590 ("running"); curious 1590, profile turn 1620 (registered swap: head_top/chin/pelvis), satisfied 1740; camera push 1680–1920 into the porthole; continuous transition 1800–1920 (porthole_out → porthole_glass_middle → drum_in, anchor `porthole_centre`).

**Measured before art exists** (`qa/hybrid_v2/QA_RESULT.json → motion_feasibility`): all 1020 frames solve; locked grip error ≤ 4.2e-6 px, pinch ≤ 1.5e-4 px, plant ≤ 5.1e-13 px; no unreachable, joint-limit or bend-branch failures. Re-staging that this check forced (recorded so it is not repeated): washer scale 0.9→0.75 on a pedestal; handle and coin panel moved to the side nearest Ines; the door made a registered depth state instead of an in-plane swing; arm bend sign corrected to the FK pose's branch; entry glide removed (no walk cels exist); weight shift added for the open-door reach. Remaining direction gap: **S02_room_life** has no declared mechanism (background machine life needs its own rigs/parts).

## 6. Transitions
S01→S02 motivated cut on the opening door; **S02→S03 continuous porthole push** (OUT/MIDDLE/IN + aperture mask, anchor porthole centre); **S03→S04 continuous** drum rim → ledger rim; S04→S05 honest cut to scale; S05→S06 cut on the utilisation meter; S06→S07 return to the opening framing.

## 7. Audio
Narration is **not written for approval yet and not recorded**. Draft beats (to be rewritten by the approved director): "Every one of these drums is a meter." / "One coin buys one turn." / "Inside, each turn is counted…" / "…and each turn costs water, power and heat." / "At three in the morning, most drums sit still — and the rent doesn't." / "The owner isn't selling washing. They're selling hours." Critical events (door click, coin drop, first spin, counter tick) must bind to **measured** word timing; `engine/art_bridge/audio_cues.mjs` refuses estimated timing (`MISSING_WORD_ALIGNMENT`), as it does for `films/_qual_A` whose timings are estimated. SFX: door latch, coin drop, drum start, counter tick, pipe flow.

## 8. Art dependencies
`handoff/ART_DEPENDENCY_PLAN.json` (74 states derived from the action graph: 6 canonical masters → registered parts/layers → contact/expression/view/door/symbol states → transition plates). Exported as `hybrid_v2/art_outbox/` (WAITING_FOR_GPT_ART). Canonical-master construction briefs: `art_designs/*.design.json` (proposed; compiled by the installed skill with two verified native witnesses each).

## 9. Compiled shot and motion manifest; readiness
`handoff/ART_AND_MOTION_MANIFEST_V2.json` (status PLANNED, assets: [] — no approved art). Readiness: `node engine/tools/art_bridge_check.mjs check --root films/hv2_film001 --manifest handoff/ART_AND_MOTION_MANIFEST_V2.json` fails with exact missing-art frame spans, as it must; QA exits 1 with `missing_art`, `missing_capabilities` (word alignment) and per-frame affected ranges.

## Approval checklist (Manmeet)
- [ ] topic and insight approved (or replaced by an approved script)
- [ ] narration written/approved, then recorded with measured word alignment
- [ ] identity atlas and master briefs approved (or edited) before any image request
- [ ] S02 as the qualification scene; S04 ledger as the unlike visual family
