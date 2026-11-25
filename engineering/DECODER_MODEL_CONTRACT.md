# Strategy decoder model contract (TBO-G15)

**Status:** the model evaluator and one model-driven graphic operator (`MODEL_BAR`) are implemented in the existing Neutrino/Chrome path
and tested on real rendered frames with the **Channel Bible §8.6 teaching numbers** (HYPOTHETICAL, diagnostic). No approved E01 model
card or decoder artwork exists yet.

Code: `engine/decoder/model_card.mjs` · `engine/decoder/model_bar.mjs` (wired into `engine/art_bridge/temporal.mjs#proceduralAt` and
`scene_graph.mjs`) · `engine/decoder/decoder_qa.mjs` · cross-check against the packet in `engine/story/hybrid_contract.mjs`.
Test: `node --test tests/tbo/decoder_model.test.mjs tests/tbo/hybrid_contract.test.mjs`.

## 1. Model card (written by GPT + user, approved; the engine authors no economics)
```json
{ "id": "mia_unit_economics", "version": "1.0.0", "truth_mode": "M", "outcome_classification": "DEMONSTRATED_IN_MODEL",
  "objective": "...", "variables": [{ "id": "price", "label": "...", "value": 12, "unit": "USD/meal",
  "provenance": "FICTIONAL_WORLD|HYPOTHETICAL_PARAMETER|REAL_DOCUMENTED", "claim_id": "required if REAL_DOCUMENTED", "source": "...", "range": [0, 100] }],
  "formulas": [{ "id": "net", "label": "...", "expr": "meal_contribution + drink_contribution - other_cost", "unit": "USD/day" }],
  "constraints": [{ "id": "kitchen_capacity", "expr": "meals <= capacity", "reason": "..." }],
  "scenarios": [{ "id": "baseline", "label": "...", "overrides": {}, "status": "DEMONSTRATED_IN_MODEL" }, { "id": "discount", "overrides": { "price": 10 }, "status": "..." }],
  "assumptions": ["..."], "counterexamples": ["..."] }
```
- The expression language allows `+ − × ÷`, parentheses, `min`, `max` and `abs`; constraints may also compare. There is no `eval`.
  Units are checked dimensionally (`USD/meal × meal/day = USD/day`), and a mismatch is refused.
- Provenance: outputs are always `MODEL_DERIVED` and carry the list of assumption inputs they depend on. A `REAL_DOCUMENTED` input must name a
  claim that `HYBRID_CONTRACT.claims` holds as a sourced **F** claim.
- Constraints are **never clamped**. A scenario that breaks capacity is `MODEL_CONSTRAINT_VIOLATED`, and the creative author must model the limit.
- `sensitivity()` gives the input→output curve, refusing points that break constraints. `modelDigest()` pins the exact card.

## 2. Decoder binding (`HYBRID_CONTRACT.decoders[]`)
`{ id, shot_id, action_id (PROCEDURAL), model_card, output, unit, symbol_art_id (approved SYMBOL), scenario_keys: [[frame, scenario, ease?]], baseline_xy, px_per_unit, displays: [{value_ref, shown_provenance}] }`
- The shot must be directed as `data_relation`, `quantity_change` or `comparison`. At least two scenarios must be keyed (show the change).
- At render time, `plan.models[id]` holds the card and `plan.procedural[action] = {type: "MODEL_BAR", model_digest, ...}`.
  The bar height is exactly `|value| × px_per_unit` from a zero baseline, and negative values grow downward.
  A changed card makes the plan `STALE_DEPENDENCY` until the decoder shot is re-approved.

## 3. Proof on pixels
`verifyModelBarFrames` measures the rendered bar in real frames against the model for each frame.

Diagnostic result: baseline −60 USD/day → 30 px down; discount −420 → 210 px down; better move +168 → 84 px up. Changing the variable
cost from 9 to 9.5 moves the baseline bar to 75 px.

Negatives detected: a frozen graph after an input change, a reversed sign, zero checked frames, a truncated baseline, a pivot off the
baseline, a wrong unit, a stale digest, a model value labelled as documented fact, and a documented input without a sourced claim.

## 4. Missing producers (build only for an approved decoder shot)
- Animated numerals/labels (need approved TYPE/glyph art and a counter operator).
- Flow counts driven by the model (`FLOW_PATH.count` is still authored keys).
- Axis/scale furniture.
- Multi-bar comparison layout rules.
- A physical-metaphor consequence (e.g. grill overload) driven by a model output.

Each of these is a small extension of the same `MODEL_*` pattern and needs its own pixel QA.
