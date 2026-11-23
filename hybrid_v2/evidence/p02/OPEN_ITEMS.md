# P02: honest list of what is unresolved

## External dependencies (not software defects; correctly blocked)
1. **No real GPT artwork.** No provider is configured and no paid call was made. Every production asset is `WAITING_FOR_GPT_ART`, so the production preflight (`PRODUCTION_PREFLIGHT_hv2_film001.json`) is blocked at S04/S05.
2. **No independent human trust anchors.** `ART_BRIDGE_REVIEWER_KEYS_FILE` is not provisioned. Every HUMAN gate (story, direction, designs, art, states, edges, shot review, unlike transfer, film) is blocked. No approval was fabricated.
3. **No approved story or experience direction** for `films/hv2_film001`. S00/S01/S02 are BLOCKED_HUMAN: there is no FILM_INTENT and no typed story contract, and attention targets lack consuming tracks.
4. **No recorded narration and no forced alignment.** The rehearsal uses a synthetic tone with a labelled fixture aligner, honoured only in the diagnostic namespace.
5. **No live capability canary.** Every real-provider capability is DECLARED/UNTESTED. A bounded paid canary needs Manmeet's signed paid-run manifest.
6. **Unlike-transfer and repair-learning qualification (F078/F083)** stay `IMPLEMENTED_UNQUALIFIED` until real provider pixels and human art reviews exist.

## Residual software limitations (documented, not hidden)
7. **No external anchoring of the ledger.** The event chain, HEAD pointer and store mirror detect tampering. However, someone with full write access could rewrite the whole chain consistently. A signed periodic checkpoint (an external anchor) is not implemented.
8. **Provider idempotency.** The OpenAI images API exposes no idempotency key. After `OUTCOME_UNKNOWN`, a human must check the provider dashboard and record `reconcileOutcome`. The system never retries automatically.
9. **The F075 "disk full / disk error" injection was not simulated.** Crash at chunk start/mid/end, encoder failure, assembly failure and a non-transient renderer crash were all tested (P02-R04, P02-R23).
10. **Chrome RSS measurement** uses `tasklist` sampling of the browser PID, which is Windows-specific. Node RSS is measured in-process.
11. **Lock liveness** uses PID existence. PID reuse could make a dead holder look alive until the TTL expires. The fencing generation still prevents a double commit (P02-R20, P02-R15d).
12. **Attention simultaneity** (`requires_simultaneity`) is implemented in `compileAttention`, but the rehearsal score does not exercise it.
13. **Artistic quality.** Every mechanical green (coverage gate, re-render identity, trace) proves mechanics only. Rhythm, readability, Whole Look, face/hand/weight and explanation truth need independent full-speed human review of real art.

## Stale-evidence rule
- Any later change to `engine/`, `schemas/` or the skill changes the film revision (code scope).
- The rehearsal's render receipt and handoffs then verify as STALE. This is correct, and rehearsal phase C demonstrates it.
- The audit's TAP log and rehearsal G were produced on the exported revision (see `AUDIT/REVISION.txt` and the INTEGRITY manifest).
