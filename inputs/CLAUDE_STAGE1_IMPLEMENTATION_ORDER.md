# Paste into the existing Claude Code session — Stage 1 corrective execution

**Do not send the previous vague “finish 80 methods” prompt. Use this instead, together with `STAGE1_F01_F80_SOURCE_TO_CODE_EXECUTION_SPEC.md` in your project's `inputs/` folder.**

---

You are implementing the **Stage 1 source-knowledge-to-code-art bridge** for Motion-Native Studio. Stage 1 is NOT complete, and you may NOT advance to Stage 2 or declare conversion complete based on tests that merely pass validators. You must produce and qualify actual original sophisticated art from source-conditioned drawing operations.

## Mandatory initial reading and authority

Working repo: `E:\MOTION_NATIVE_STUDIO_V1` (verify where this repo is mounted in your current environment).

1. Read the entire `inputs/STAGE1_F01_F80_SOURCE_TO_CODE_EXECUTION_SPEC.md` (new binding instruction). If the file was placed elsewhere, ask for its exact path; do not guess or use an older prompt as substitute.
2. Read `CLAUDE.md`, `HANDOFF.md`, `inputs/MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md`, and the audit-driven build instructions, using actual filenames found in the repo. Read the most recent **original** current F01–F80 skill in `inputs/construct-kurzgesagt-art.zip` (and its `SKILL.md`, every F source reference and `CHARACTER_FAMILY_CONSTRUCTOR.md`). The skill is authoritative for its artistic conditions; the new execution spec is binding for the code translation and Stage 1 gates. A source clause that conflicts with the execution spec must be explicitly reported, not silently dropped.
3. Read the actual `engine/methods/` source, registry, proof harness, evidence, and `audit_outbox/STAGE1_FOUNDATIONAL_METHOD_QUALITY_AUDIT.zip`, including `SOURCE_TO_DRAWING_FINDINGS.md`. Compare audit snapshot to current HEAD and working tree. Audit evidence is historical, not assumed live current code.
4. Inspect the source-native visual witnesses yourself. Their style observations are conditional and require unlike counter-examples. They are **not** permission to copy any studio's characters, props, backgrounds or compositions. If witness images cannot be viewed, state the blocker and do not certify artistic conversion based on file hashes alone.

The most important architectural distinction is **positive visual design vs shape compilation vs validation**. The old code was good at rejecting some invalid geometry but not at designing an original face/silhouette/world. Don't repeat the same mistake with new names. You cannot infer missing original subject geometry from 80 rules; you must author the original design explicitly, record reasons, compare candidate contours visually, and have the drawing code consume those actual decisions. No hidden generic defaults or unrecorded shape improvisation.

## Stage 1 scope lock

- Work only on the style-to-code conversion and integrated art qualification. No full episode, full script, marketing report or Stage 2 video.
- Preserve the working neutrino runtime and existing work. Inspect git status before edits. Save a recoverable checkpoint of relevant changes **after inspecting exactly what would be committed**; do not stage caches, source archives, secrets or user-unrelated changes.
- Do not regenerate a giant ZIP. Work in-repo with concrete code, receipts, original images and review evidence. Keep unmodified first-pass frames.
- Do not demand user approval after every minor correction; iterate until source-conditioned artistic qualification. Stop only at a genuine blocker or a major artistic choice the user must make.

## Execute strictly in this order — each gate blocks the next

### Gate A — Fix the false assertions in existing machinery

Implement the specific repairs from §4 of the new execution spec. Required regression cases:

1. Forged `mint('F99', ...)` cannot reach renderer; no unknown or hand-tagged shape can claim a registered artistic producer.
2. Impossible palette contrast cannot reach `assertSolved`/emission as accepted; an `edge` contrast solution actually creates owned visible boundary geometry.
3. A proof with zero genuine causal perturbations cannot pass as a design/geometry proof; a validation read alone never counts as a producing read.
4. F14 tests its own state routing; F49 and F50 have true behavioral/record evidence; F53 changes visible attention allocations when `viewer_first_point` or `causal_path` changes.
5. F80 bindings derive from actual executed producer calls; matching a source witness hash alone cannot be represented as having visually applied the source.
6. Failed child topology, palette, hard contact or underpaint checks cannot fall through into a renderable art receipt.

Report in two columns: **observed failure before** / **verified correction after**, with actual file/function and runnable commands. A passing basic test suite is not an artistic pass.

### Gate B — Build positive source-conditioned design producers

Implement the typed `SourceRule`, `DesignDecision`, `VisualSubjectPlan`, `ShapeRegion` and actual `ProducerReceipt` contracts in the new spec. Every F01–F80 source clause is classified as positive design, deterministic geometry, direction/routing, state/motion or evidence, and has a condition-specific obligation. **Do not implement 80 vacuous wrappers.**

The missing upstream operation is `subjectDesigner`: from new subject's causal role, true anatomy/functional constraints, view, size, material and two unlike source-native observations, create *specific* candidate silhouette designs with named contour geometry, part topology and rejected alternatives. Let `contour.mjs` compile chosen contours, not invent them. Do the equivalent for head/face atlas, pose/garment/grip, material-owned light planes and world layout.

Mandatory replacement of generic shortcuts: fixed face formulas, identical tube limbs, garment-fold wedges used universally, ellipse fingers, globally shifted-silhouette crescent, random crown blobs, decor-only machinery and world templates with unsupported viewpoint. It is acceptable to retain a mathematical ellipse **as an invisible placement frame** where appropriate, not as the identity silhouette. Every distinctive original contour must have a design-specific reason and be independently reviewed as pixels.

Document what comes directly from source evidence and what is original artwork authorship. Don't cite the source for invented numerical proportions. If a necessary design decision is unresolved, set `DESIGN_UNRESOLVED` and fix that stage; never hide the void behind a generic default. A new original identity requires creative judgment, but it must be *recorded, compared and then bound to code*.

### Gate C — Qualify actual integrated art, not tests or head fixtures

Use the new spec's §5 two demanding unrelated specimen families: one original expressive task-acting human within a coherent space; one complex non-human world with its proper structure/function. Draw through the **actual reusable producers**, not one-off hand-coded bypasses. Save unedited 1920×1080 first results, contour-only master, identity thumbnail, view/pose atlas, contact crops, material/lighting crops, actual source/contra contrasts and a short real time-native motion passage. Inspect at actual screen size and at one-tenth size.

On a failed original silhouette, anatomy, face, material plane or world conception, return to the *earliest wrong design producer*. Don't spend hours tuning eyebrows while the head design is wrong. Repair the source-to-decision-to-region operation. Show actual changed geometry and pixels, not self-entered `uses`. Run a different subject through the same corrected operation to see whether it improves the **new first pass**. Do not accept another weak, flat, rubber-like design with green logs.

Only an independent/manual whole-look review of the generated pixels can approve artistic quality. Explicitly record what visual elements remain weak; no false promises of GPT-image equivalence.

### Gate D — Complete classified F01–F80 obligation and transfer coverage

Once the high-impact producers demonstrate real quality, implement remaining applicable positive obligations as §3 specifies, including F72's absent macro-lens producer and F17/F29's missing proofs. For router and evidence methods, use class-correct tests and actual dispatched calls. Compute status from source obligations plus executed trace/pixel evidence, **never a hand-written empty `gaps` array**.

Publish `SOURCE_RULES.json`, `CODE_BINDINGS.json`, design candidate and read traces, first-pass/repair/transfer evidence, full-resolution art comparisons and `STAGE1_STATUS.md`. Do not claim **80/80 ARTISTICALLY IMPLEMENTED** when some methods are routing-only or visually unproven. Stage 1 remains **INCOMPLETE** until the new spec's L0–L4 criteria are met and the produced art is actually approved. Do not move to Stage 2 automatically.

## How to work and report

- Keep moving from code to full-sized visible output to root-cause repair; don't write extended speculative essays or merely announce “I found 107 gaps.” Close the highest-impact gap first.
- After each gate, state `PASS`, `FAIL` or `BLOCKED`, with exact evidence: source clause, actual producing function, design decision, trace, native pixel, counterexample and outstanding defects. Tests do not certify visual sophistication.
- Explicitly say when a thing is an original design hypothesis, not a decoded source law. Preserve source diversity; no universal head/eye/palette/shading recipe.
- If one method produces genuinely excellent results only on its hand-built fixture, **do not scale it yet**. The unfamiliar-subject transfer failure is the next highest-leverage problem.
- If code-native art is genuinely not meeting the approved whole-look after proper producer repair, report exact failures and an alternative image-master/segmented-rig route as a separate **proposal**, not an unapproved switch.

**Start now with Gate A and the complete source-to-code implementation spec. Keep the Stage 1 lock.**
