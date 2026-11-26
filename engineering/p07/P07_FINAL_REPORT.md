# P07: E01 pre-art critical path (engineering report)

**Status:** NOT fully release-qualified (304/305; S3C-7, section 9). Reusable engine work + E01 planning artefacts. Accepted real E01 film seconds: **0**. Real artwork: **none**.
No approvals were recorded, no images were generated, no paid call was made and no receipt was forged.

## 1. Code changes (frozen source SHA and regression: section 9)
| Area | Change |
|---|---|
| `engine/art_bridge/prop_support.mjs` (new), `schemas/prop_support_v1.schema.json` (new) | Multi-support props. Supporters (hands of one actor or of several actors, plus fixed surfaces) are bound to REGISTERED sockets. **Exactly one authoritative driver per frame**; explicit transfer only when the incoming support was already valid on the frame before; the surface is the sole transform writer while it drives (prop held). Compile-time validation against the real contacts; per-frame evaluation. |
| `performance_commands.mjs` | Accepts `plan.performance.prop_support` (a separate approved input; the P06 command schema is unchanged). A hand is resolved by the contract binding of the prop socket, not a guess. Bound palm `grip_angle_deg` travels on the contact (orientation checked every locked frame). |
| `temporal.mjs` | `PROP_SUPPORT_CONTRACT_REQUIRED` when several holders share a prop with no contract. `PROP_DRIVER_CONFLICT` when an authored track moves a prop while a surface drives it. Surface-hold producer in `evalPrimary`. Per-frame `prop_support` in `stateAtFrame`. Solved contacts carry target rig/socket/start (fixes contact identity when one socket holds two props in one action). |
| `performance_qa.mjs` | Possession = the driver; `supportsObject` = any valid support. `PaintedGripMaintained` checks this hand's own support. **`ReleaseAndSeparation` checks only the releasing hand** (the P06 bug required global unownership, so it failed every correct hand-over). New film-level `verifyPropSupport` (every frame: driver, required supports, closure drawing visible, orientation, surface distance, teleport step, settle drift, transfer validity). |
| `scene_graph.mjs`, `direction_consequence.mjs` | Same contact-identity fix (match the contact by start frame). |
| `schemas/motion_art_manifest_v2.schema.json` | Sockets may carry `basis_angle_deg`. Without it the existing palm-orientation check could never run on a schema-valid manifest. |
| `creative_adapter.mjs#compilePacket` | **An unsupported contact type (PINCH) is refused** with `UNIMPLEMENTABLE_CREATIVE_REQUIREMENT / CONTACT_NOT_DROPPED`; it used to be silently filtered out. |
| `schemas/creative_packet_v1_1.schema.json`, `creative_packet.mjs#validatePhaseScope`, `creative_adapter.mjs` | Optional **`scope: PRODUCTION_PHASE`**. A packet may be one approved phase of a longer film, starting at the parent's f0, with the parent source attached by hash, qualification frames, the continuity owed at its last frame, and an approval statement naming `[a,b)` and "NOT approved". The scope is in the digest, the import record, the human review bundle and `creative/PHASE_SCOPE.json`. |
| `engine/art_bridge/pregen_audit.mjs` (new), `schemas/pregen_audit_v1.schema.json` (new), `art_contract.mjs`, `art_requests.mjs` | **Ten-pass pre-generation audit enforcer** for new canonical masters, bound to the design revision, the job and the witness manifest. Checks: ten domains in order, substantive and distinct text, concrete decisions, witness grounding in five domains, every design method mapped, a gap finder that reopens or justifies. Production films require it (`PREGEN_AUDIT_MISSING`/`INVALID`); diagnostic namespaces report `NOT_REQUIRED_DIAGNOSTIC_NAMESPACE`. The design-approval bundle includes the audit digest, so the human receipt covers it. |
| `quality_gates.mjs` | P07 tests bound to G03, G04, G05, G11 and G16. |
| `errors.mjs` | 14 new typed codes (PROP_*, PHASE_SCOPE_INVALID, PREGEN_AUDIT_*). |
| `tests/p03/subjects_fixture.mjs` | Optional scene spec (defaults = the P03 film byte-for-byte), so P07 builds a new diagnostic film through the same real intake. |
| `tests/art_bridge/stage3_contract.test.mjs` | S3C-5/S3C-7 now also assert that the real proposal's master is refused without its audit; they pass with a labelled in-memory diagnostic audit. |

## 2. New contact/support semantics and effects
- **Support set vs driver.** Every frame of a contract's span has one driver (a hand ref or `surface:<id>`) plus required supports. Any hand
  locked on its bound socket, error ≤ allowed, palm orientation within limits, and with its HAND channel showing the approved closed drawing is a
  valid supporter. A surface is valid when the prop base socket is within tolerance of the registered surface socket or world point.
- **Transfer.** The driver changes only between consecutive authority segments, and the incoming support must already be valid at t-1. The new
  effect `PropSupportContract` records each transfer, including incoming/outgoing validity before it.
- **Release.** Only the releasing hand must let go (contact unlocked, open drawing, separating). A receiver may keep holding.
- **Legacy behaviour is unchanged:** a single-hand grip with no contract keeps the single-holder reading (P06 suites pass).

## 3. Tests executed (targeted, during development)
**P07 (new, all pass):**
- **`tests/tbo/prop_support.test.mjs` (5 tests):**
  - **positive:** two unlike rigs (biped *tova*, tentacled *orsa*), three props, every frame of every contract;
  - **E01 V0.4 exact frames:** award f180/264/276/286/300; report f338/348/[348,356)/356/368;
  - **nine compile refusals:** one support removed; two drivers; surface vs track writer; gap; premature release; transfer before the new support
    is valid; wrong socket; missing painted hand; no contract;
  - **every-frame negatives:** open painted hand, palm reversal, teleport, overextension;
  - **real Chrome owner pixels:** both closed hands visible; plaque stays put; shared hold; no on-screen jump at the transfer; giver's claw open
    after release; producer deleted → no closed-hand pixels.
- **`tests/tbo/p07_creative.test.mjs` (4 tests):**
  - PINCH refused at preflight and at compile;
  - phase packet: positive plus six refusals;
  - pre-generation audit: positive plus twelve negatives (missing, stale, wrong job, filler, duplicated, order, nine passes, no witness, unmapped
    method, gap finder, fake witness, gate status);
  - the real gate and design bundle carry the audit.

**Affected existing suites:** 69/69 and 87/87 after the QA change, plus stage3 9/9 (section 9 gives the final full run).

## 4. Remaining unsupported operations (typed refusals, never substituted)
- Articulated PART_RIG walk.
- PINCH producer (refused; decision D2 recommends GRIP with WRAP near/far finger layers).
- Visemes.
- World freeze / time-remap; selective desaturation.
- Perspective host camera and depth/matte pass.
- CARRY, LOAD_CONTAINER, INSERT_TOKEN; camera orbit and 3D dolly.
- Phases that start after the parent's f0 (they would need predecessor-state inheritance).

## 5. E01 status after P07 (machine tally, `engineering/e01_v04/PROVISIONAL_PREFLIGHT.json`)
- **Full opening (25 actions):** 7 NEEDS_REAL_ART, 11 NEEDS_CREATIVE_DECISION, 7 NEEDS_ENGINE_PRODUCER, 0 UNSUPPORTED.
  - The pre-P07 table was 6/9/10; the report's hand-typed 5/9/11 was wrong and is corrected.
  - The tally is now asserted to sum to the rows.
- **780-frame extract (17 actions):** 7 NEEDS_REAL_ART, 9 NEEDS_CREATIVE_DECISION, 1 NEEDS_ENGINE_PRODUCER.
  - The one is A06's walk, and only if the user chooses visible legs (D1).
  - The A02/A04 two-hand plaque and the A08 hand-over are now executable in principle.

## 6. First-extract production packet
- **Legitimate route:** a v1.1.0 `PRODUCTION_PHASE` packet for the original [0,960) (`engineering/e01_v04/E01_PHASE1_PACKET_PLAN.md`). It does
  not require the host or the freeze compositor.
- **Status: NOT YET AUTHORED.** It needs GPT Creative to compile it after the user's decisions and the measured scratch timing. It is not signed.

## 7. Private art design-bootstrap ZIP
`E:\TBO_PRIVATE\E01_GPT_ART_DESIGN_PREPARATION_ONLY_V1.zip`
- 57,817,100 bytes; sha256 `c43b129a367b33afc6822882c6ad9bb58f74c756be87561dcf19cc17ee6f5dba`.
- 218 files, including 117 native witness images.
- Outside every git work tree; the builder refuses an in-repo destination. Never committed or published.
- **DESIGN PREPARATION ONLY. Not a sealed ArtJob.**

## 8. First formal ArtJobs
**None are exportable yet.**
- **Conditional job ids** (valid if the approved packet uses these asset ids; `planJobs` derives them from the asset id alone):

  | Asset | Conditional job id |
  |---|---|
  | MIA_MASTER | `ARTJOB_MASTER_MIA_MASTER_cf7e5c4c` |
  | REGULAR_MASTER | `ARTJOB_MASTER_REGULAR_MASTER_6907d6f6` |
  | LEAD_MASTER | `ARTJOB_MASTER_LEAD_MASTER_63a6b44a` |
  | ENV_RESTAURANT_SH01 | `ARTJOB_MASTER_ENV_RESTAURANT_SH01_9855d2f0` |
  | PROP_AWARD | `ARTJOB_MASTER_PROP_AWARD_e8fad9e2` |
  | PROP_REPORT | `ARTJOB_MASTER_PROP_REPORT_71b2ddee` |
  | PROP_PHONE | `ARTJOB_MASTER_PROP_PHONE_a2925388` |

- **Still missing, in order:**
  1. The user's decisions D1–D6.
  2. Measured scratch takes.
  3. The phase-1 packet (GPT).
  4. The user's signature on the packet digest; then story and direction signatures.
  5. Design JSON plus ten-pass audit per master (GPT ART); `check-design` PASS; the user's design signature.
  6. `art_outbox export`, then `export-gpt-job`.

## 9. Frozen source and full regression — P07 did NOT achieve full release qualification
- **Frozen source:** `ecd0aa82a9bfa8d8d67d2916aa08e5f60e2aace0`. Detached worktree `C:\Users\gmanm\TBO_DEV_REGRESSION`; node v22.20.0; `nu.js`
  sha256 `773baf91…e7be` (unchanged).
- **Run:** 2026-11-26 03:29:13Z → 06:01:45Z (2 h 32 m). Evidence: `engineering/p07/final_run/` (TAP sha256 `bb7471eb…d2f3`; the 14.7 MB chain
  MP4 is hashed in `HASHES.txt` and kept outside git).

| Step | Result |
|---|---|
| Full suite, 40 files | **304 / 305 pass, 1 FAIL** (93.2 min, `suite_exit=1`) |
| p03 Chrome negatives | exit 0; every negative detected, every control ok |
| p05 render negatives | exit 0; every negative detected, every control ok |
| p05 production chain | exit 0; S01–S08 committed, S09 BLOCKED on the film review a diagnostic run can never satisfy (same as P06) |

**The failure: S3C-7, `OUTBOX_IMMUTABLE_VIOLATION`** (`tests/art_bridge/stage3_contract.test.mjs:56`).
- **What happened:** the regression worktree still held the outbox record `outbox7/jobs/ARTJOB_MASTER_ines_master_211539ad/c26272cf…/job.json`,
  written by the P06 run under the P06 rules (`gate.pass: true`). Under P07 the same inputs give `PREGEN_AUDIT_MISSING`, the new rule working as
  intended. The record id was derived from the job inputs only, not from the checking rules, so the same id was due to receive a different body,
  and the write-once store correctly refused.
- **Classification:** a real production defect (evaluation identity did not include the rule version), exposed by a test that shares a persistent
  mutable output directory. The development checkout had already rewritten its record under P07, so it passed there.
- **Disposition (user decision, 2026-11-26):** an engine + test fix lands at the start of P08. The fix is verified by targeted tests here and
  covered by the single P08 comprehensive regression. P07 is NOT re-run as a standalone baseline, because P08 supersedes this source.
  This run's evidence is preserved unchanged, and the 304/305 result stands as P07's record.

**Slowest files (cumulative test time):**

| File | Time |
|---|---|
| `p02_injection` | 82.0 min |
| `p02_render` | 70.8 min |
| `p01_film_qa` | 65.6 min |
| `p02_trace` | 27.2 min |
| `p05_film` | 6.6 min |
| All other files | ~1 min or less |

The four slowest files account for about 97% of the time; the P08 efficiency addendum addresses them.

## 10. The single next action
The user decides D1–D6 (`engineering/e01_v04/decisions/E01_DIRECTOR_DECISION_SHEET.md`) and records the natural scratch takes (handoff in the
same folder). GPT Creative then compiles the signed phase-1 [0,960) packet. That is the input every later step (designs, sealed ZIPs, real
pixels, the 780-frame render with sound) waits on.
