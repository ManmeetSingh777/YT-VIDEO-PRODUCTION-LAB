# E01 phase 1: packet reconciliation and artwork preparation (2026-11-27)

**Input:** `E:\MOTION_NATIVE_STUDIO_V1\inputs\E01_PHASE1_CREATIVE_PACKET_20261127.zip`
- sha256 `e86230b3…dc24db`, 233 files; all 232 manifest hashes verified.
- It is extracted privately to `E:\TBO_PRIVATE\E01_PHASE1_CREATIVE_PACKET_20261127\` (it holds private audio and is never committed).

**Result:**
- The reconciled packet has digest `ceba69013b3b885e39a1f4e25ad4021b630cb0bd8cb9fd1f2e1f5a4895817696` and is `STRUCTURAL_VALID`.
- preflight returns `SUPPORTED_IN_PRINCIPLE`. Its only open item is the human approval of this digest.
- hybrid-preflight returns `SUPPORTED_IN_PRINCIPLE` and feasible. All six dialogue lines use VISEME; there are no decoders or hosts.
- The hybrid contract is bound to the digest.
- The packet is imported into `films/e01` with status `IMPORTED_AWAITING_APPROVAL`. **Nothing is approved, signed, authorized or generated.**

Every number here is produced by `tools/tbo/e01_reconcile_packet.mjs` from the live engine (outputs in this folder).

## What changed in the packet: one representation field (`PACKET_DELTA.json`)
A01 [0,960), A03 [0,882) and A27 [404,960) each run through the f444 and f588 cuts. Each now declares `shot_span: [SH01, SH02, SH03]`.
- Nothing else differs; the script proves this.
- IDs, intervals, owners, phases, events, contacts and timing are unchanged.

## Engine resolutions (general, not E01 patches)
| Blocker | Resolution | Proof |
|---|---|---|
| `INTERVAL_OUTSIDE_OWNER` ×3 | **Continuous parent actions** (`engine/story/action_span.mjs`). One action lives through contiguous, same-world cuts whose transition states a continuity invariant. Per-shot consumers ask `actionInShot`: cels, contacts, placement, scene graph, framing, coverage, registry, intake, acting windows and per-shot score events. Shot-local fragments come from `shotSegments`/`shotLocalView` with parent lineage and absolute frames, and `verifySegments` proves they tile the parent: no gap, no overlap, each event once, no re-grip or release at a cut. Without a span the old rule is unchanged; a span is checked harder (unneeded, non-contiguous, world change, undeclared join, wrong owner, outside the last shot). | `tests/p08/continuous_action.test.mjs`: a gripped crank, a planted foot and gait cels split by a real same-world cut; the loader, motion compiler and runtime give a state equal to the unsplit film on **every frame**, including f299/f300 |
| A contact crossing a cut | Unchanged and strict: it must be declared persistent with VISIBLE/OCCLUDED/OFFSCREEN for each shot (CONTACT_CONTINUITY). A span does not waive this. | SPAN-1 asserts the refusal before declaration |
| `BEND_EXPOSES_HIDDEN_SURFACE` ×56 (face layers) | Brows, eyes, cheeks and mouth ride rigidly on the head joint, whose base drawing already owns the neck-seam underpaint. Each overlay is now a deferred `RIGID_OVERLAY_CONTAINED` obligation: it must lie inside the base drawing on every bound state, checked on registered art. | preflight ledger `deferred` |
| `OBJECT_RESPONSE_DECIDED` ×10 (award, report, phone) | A rigid prop that the postcondition says the hand supports/holds/drives is **CARRIED**. It becomes a `PROP_SUPPORT_DRIVER` obligation: exactly one authoritative driver every frame, enforced by `prop_support.validatePropCoverage`. The A07 lead hold [342,350) continues the identical A06 grip, so it is one coalesced hold, not a re-grip. | preflight `SUPPORTED_IN_PRINCIPLE` |
| Underpaint paint order (37) | An underpaint named by its owner (`owner.underpaint`) is painted BELOW it by definition. The compiler derives the relation; a conflicting declared relation is still refused. | `planJobs` plan contract passes |
| A04 `PROP_AWARD.base` → counter | A support from an unstaged rigid prop is a **prop surface support**. It is routed to `MOTION_OBLIGATIONS.prop_surface_supports` (owed to the motion plan), never into an actor's contacts, never dropped. | `RECONCILIATION.json` |
| Rig id = identity id (11) | A rig may carry its *own* identity's id; any other collision is still refused. | readiness check: 0 `DUPLICATE_ELEMENT_ID` |
| Art shots of spanned actions | Requirement `shots` now include every spanned shot (the torso underpaint is needed in SH02 too). | dependency plan |

**Still unmeasured, by design:** every root position, joint limit, landmark and rig.
- The packet's ±180° limits and root_xy are planning envelopes.
- Motion compiles only after the art is measured (`GEOMETRY_UNMEASURED`). The executable P08 MOTION_PLAN is therefore written after the masters are registered.
- `PREART_OBLIGATION_LEDGER.json` lists, for all 19 actions, the producer, proofs, contacts, states, art and deferred obligations each one is owed.

## Artwork: 304 requirements → one dependency-aware ArtJob DAG (`ARTJOB_DAG_PREVIEW.json`)
This is the real `art_intake#planJobs` on a scratch compile; there is no approval yet.

| Tier | Jobs | What it is |
|---|---|---|
| 1 | **11 masters** | The only generations: MIA, REGULAR, LEAD, ENV01, award, report, phone, and 4 background people |
| 2 | 133 | Parts and underpaints, **source-attached registered edits of the approved master** |
| 3 | 160 | State cels (views, expressions, visemes, hands), edits of approved parts |

Derived jobs compile only after their master's approval receipt verifies, with the approved master bytes as the mandatory edit reference.

## Unsigned designs reconciled against the packet (`DESIGN_GATE_PREVIEW.json`)
The live design gate (`art_outbox check-design`) was run on the four V0.4 drafts in a scratch film. **All are REFUSED.** These are the exact changes the art GPT must make:
- **MIA / REGULAR / LEAD (8 each):**
  - Formal `view_id`: `to_regular`, `to_mia` and `to_mia` respectively.
  - Authored size against the largest on-screen figure: 174 px for Mia and the lead, 265 px for the regular, at the 2× native factor.
  - Rest pose: `ready`, `phone_low` and `approach` respectively.
  - Attachment semantics for every joint and contact semantics for every socket.
  - The full state family the action graph shows.
  - The pre-generation audit must be re-bound to the native witness manifest in use, with distinct findings per pass.
- **ENV01 (10):** re-key from `ENV_RESTAURANT_SH01` to `ART_ENV01.MASTER`, plus the motion representation, the `room` view, the `base` state, the counter-support contact semantics, the authored size, `canonical_coverage_rect` over the overscan, proof projection/planes and its own pre-generation audit.
- **No draft exists** for the award, report, phone or the four background masters.

## Approval sequence (each step is a genuine human action; nothing here can perform it)
1. **Packet:** inspect `films/e01/reviews/requests/creative_packet__ceba6901…__ff12eaabd594/look_at/`, sign offline with your own key (`HOW_TO_SIGN.md`), then:
   `node engine/tools/review_sign.mjs import --film films/e01 --signed SIGNED_REVIEW.json`.
   Then compile the production inputs:
   `node engine/tools/creative_handoff.mjs accept --film films/e01 --packet-digest ceba69013b3b885e39a1f4e25ad4021b630cb0bd8cb9fd1f2e1f5a4895817696`.
2. **Story and direction receipts:** `review_sign.mjs request --film films/e01 --scope story`, then `--scope direction`; sign and import each.
3. **Designs:** the art GPT revises the four drafts and authors the seven missing master designs. `check-design` must PASS. Then `review_sign.mjs request --scope design --id <MASTER JOB>`; sign and import.
4. **Masters (manual GPT route):** `art_outbox.mjs export --film films/e01`, then `art_outbox.mjs export-gpt-job --film films/e01 --job ARTJOB_MASTER_MIA_MASTER_cf7e5c4c`.
   Then `import-gpt-candidates`, `select-candidate`, `ingest-master` and a human `review-master`. Derived jobs unlock per approved master.
