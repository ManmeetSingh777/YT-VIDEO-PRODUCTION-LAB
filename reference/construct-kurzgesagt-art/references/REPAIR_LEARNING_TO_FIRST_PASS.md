# Repair-to-first-pass learning: operative procedure, not an audit checklist

**Purpose:** Make a successful repair improve the very next relevant **first image-generation request**. Read alongside `FIRST_PASS_VISUAL_CONTROL.md`, `CHARACTER_FAMILY_CONSTRUCTOR.md`, `COMPLETE_FILM_ART_ORCHESTRATION.md`, and `AUTONOMOUS_VISUAL_PRODUCTION_LOOP.md`. This introduces no universal new drawing style and supersedes no F01–F80 rule.

## The failure we are explicitly closing

An image can fail, be edited successfully, and have a brilliant critique written about it—**yet the next prompt can ignore that learning**. This is the difference between a recovery loop and an accumulating production system. From now on, the successful repair must update **an executable producer input**; a note or checklist alone is insufficient.

## The complete learning chain

1. **Observe the actual mismatch at native scale** against the current subject/world identity and unlike original source witnesses. Ask the highest-impact question: *which visible producing decision made the generated image diverge?* Distinguish anatomy, source-conditioned style, material/palette, world/projection, functional contact, identity, camera/direction, and omitted state. Go molecular only within the consequential mismatch; do not enumerate 100 low-impact defects.
2. **Find the first point of failure in the causal chain:** wrong story/experience → invented metaphor/mechanism → world/character master → art dependency sequence → source/method routing → compiled first-pass prompt → provider image → downstream image edit. E.g. a character drifting when placed in a room often originates from generating the room as a whole **before** constructing and attaching the approved canonical figure. The upstream repair is to supply that figure's actual pixels and face/pose anchors to the next scene request, not to write "make the character consistent".
3. **Make one concrete corrected candidate** with an actual provider edit or regeneration. State exact region/attachment/shape/color/pose changes; preserve both genuine output images. A pleasing new picture with different content is not proof that the defect was repaired.
4. **Infer the operational cause by comparing before/after**: which instruction, source witness, canonical attachment, drawing stage, mask, interpolation state, or asset parent changed? What did not change? Reject unsupported claims that changing a vague adjective caused the improvement. If multiple variables changed together, mark the cause **provisional**; retain a discriminating future test.
5. **Write an affirmative next-request rule**: which exact construction step, with actual image-relative geometry and parent ownership, will produce the correct form in the first place? Include the source-class contrast and the case where applying it would be wrong. Prefer "draw one bounded hair silhouette composed of named contiguous lobes attached to the head parent" over "NO photorealistic hair". Negatives are secondary to positive instructions.
6. **Determine scope, not blanket prohibition**:
   - `LOCAL_IDENTITY`: this canonical character/world/prop and its derived poses, crops or scenes. Apply *immediately* to later jobs sharing this identity, without waiting for unrelated experiments.
   - `CONDITIONAL_FAMILY`: a general construction family plus actual view/world conditions where the cause is plausibly transferable. Apply only when those conditions match, never to every film scene. Keep `REPAIR_DEMONSTRATED` separate from `TRANSFER_TESTED` until an unlike case actually succeeds.
7. **Record real evidence** in project `learning/REPAIR_MEMORY.json` via `scripts/repair_learning.py record`. The tool binds to real existing before/after image files, image SHA-256, root-cause statement, positive operation and explicit applicability. A correction without a real repaired image is not a learned pixel operation.
8. **Compile the next first-pass request WITH this memory** using `scripts/prepare_first_pass.py ... --repair-memory PROJECT/learning/REPAIR_MEMORY.json`. Its provider payload contains applicable rules **above** the molecular and general F-method blocks, and its receipt contains `applied_repair_rule_ids`. The actual provider must receive this resulting prompt and source/image inputs. This is the compulsory action, not merely "remember the lesson".
9. **When the new output arrives, observe whether the reused instruction held**. If it failed, question the cause and narrow/replace the operative rule; do not append an ever-growing contradictory pile of bans. If it worked in an unlike context, promote status with real evidence. Specific flaws may reoccur because the image generator is probabilistic; it is dishonest to promise mathematical nonrecurrence.

## Producer interface

Initialize **once per film**, before its first ArtJob:

```bash
python scripts/repair_learning.py init /path/to/film_project
```

For every film ArtJob, add `production_mode` and the actual `learning_context`:

```json
{
  "production_mode": "COMPLETE_FILM_ART_PACKAGE",
  "learning_context": {
    "family": "HUMAN_ACTING_CLOSE",
    "view": "three_quarter",
    "world_class": "FUNCTIONAL_INTERIOR",
    "subject_id": "ACTUAL_APPROVED_CHARACTER_ID"
  }
}
```

Then compile the existing, fully filled ArtJob through:

```bash
python scripts/prepare_first_pass.py /path/to/artjob.json \
  --out-dir /path/to/film_project/art/requests/ASSET_ID \
  --repair-memory /path/to/film_project/learning/REPAIR_MEMORY.json
```

These are *additional fields*; all existing `first_pass_control`, character, world and molecular blocks remain mandatory. For an original scene with no established character identity, use a real new ID as context; it simply has no local identity lessons yet.

After an actual successful repair, write a **project-local** JSON lesson like this field schema (all explanatory strings must be replaced with specific observed decisions):

```json
{
  "rule_id": "VERSIONED_UNIQUE_REPAIR_ID",
  "scope": "LOCAL_IDENTITY",
  "status": "REPAIR_DEMONSTRATED",
  "applies_when": {
    "family": "HUMAN_ACTING_CLOSE",
    "view": "three_quarter",
    "world_class": "FUNCTIONAL_INTERIOR",
    "subject_id": "ACTUAL_APPROVED_CHARACTER_ID"
  },
  "root_cause": "Precisely what the previous request failed to construct or attach",
  "first_request_change": "Exact producing instruction/asset attachment now needed before the provider call",
  "positive_construction_ops": [
    "Concrete drawing operation with parent geometry, proportion and overlap rules"
  ],
  "source_contrast": "Actual unlike source witnesses and the conditional method observed",
  "observed_improvement": "Concrete before/after pixel difference and causal viewer consequence",
  "regression_boundary": "Cases where this repair must NOT be extrapolated or reused",
  "before_path": "art/actual_first_pass.png",
  "after_path": "art/actual_successful_repair.png"
}
```

For a `CONDITIONAL_FAMILY` rule, **omit** `subject_id` from `applies_when`; do not hard-code a human/scene identity into a universal method. Supply relevant family, view and world class. Exact results, not this sample, must be used.

```bash
python scripts/repair_learning.py record /path/to/film_project /path/to/lesson.json
```

**Operational invariant:** The next relevant first-pass output receipt must list the applied `rule_id`, and the generated prompt must actually contain its positive construction operations. If it does not, the system **did not learn operationally**, however good the critique sounds. For a new chat or another session, load and carry the project's saved `REPAIR_MEMORY.json`; memory that exists only in dialogue is not durable.

## Global skill learning versus project learning

The per-film learning file **works immediately for subsequent matching assets in that film**. The installed global skill is a separate persistent artifact: a chat with no writable skill access cannot mutate it by saying "I learned". For a genuinely transferable discovery, preserve a proposed concise conditional skill revision, before/after evidence and an unlike use case in the handoff. Apply a global skill update through the installed skill-update workflow when authorized and possible; preserve all pre-existing rules and evidence labels. Only repeatable source-grounded mechanisms belong globally.

The goal is to **produce better art in the next request**, not to maximize audit files. This procedure records just enough evidence to prevent repeating the reasoning, and spends its creative effort on geometry, visual explanation, identity and how the viewer experiences the result.
