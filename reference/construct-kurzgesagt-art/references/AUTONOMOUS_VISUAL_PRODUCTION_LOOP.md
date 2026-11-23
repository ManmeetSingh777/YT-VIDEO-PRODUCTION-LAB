# Autonomous visual construction and repair loop — unfamiliar scripts

**Purpose:** Produce original, editable, motion-capable art whose *actual pixels* express the visual system and the intended explanation. This is a **repeatable creative process**, not a promise of exact studio equivalence or a score obtained by writing a longer prompt. Use for still artwork and for every illustrated view/state family that a film will animate. It adds to F01–F50 and the transferable motion grammar; it does not create a separate film-direction skill.

## 1. Positive construction starts before image generation

The task owner must work through the following sequence without waiting for the user to restate it at each stage:

1. **Choose what the audience must witness.** Translate each factual claim into an observable before/action/consequence; state what a silent viewer should infer. For difficult concepts, invent three genuinely different *moving* explanations, compare truth/legibility/attention/animation feasibility, then commit to one. Do not select the concept because its artwork is easy to produce.
2. **Write the complete viewing journey.** For each beat, say what is already known, what question motivates the next view, which on-screen witness moves, where gaze follows, what proof occurs, when recognition is possible, and what next question arises. Identify emotion as a consequence of the visible event; words like “wonder,” “high energy,” or “beautiful” alone do not direct pixels.
3. **Specify the camera and geometry that the audience will actually see.** Record OUT/MIDDLE/IN, physical versus abstract reality levels, projection, facing, movement tangent, screen focus, field of view, viewing-scale stages, camera target and shot handles, with frame-indexed event intentions at the required output fps. Draw/describe **at least** entrance, causal-contact, transition midpoint and exit keyviews. These are pre-generation design boards, not polished scene-specific sketches to copy from source films.
4. **Choose conditional style constructors.** Route by the actual subject and medium; select applicable F01–F50 rules and at least one unlike source witness plus one counter-witness where possible. Write precise silhouette, part topology, material-local color planes, edge/shadow ownership, depth layers, detail density and major functional contacts. All references are **STYLE ONLY**; new script determines people, anatomy, worlds, objects and events. If a critical subject-specific fact is not supported by the style witnesses, obtain legitimate subject/anatomy evidence instead of inventing it.
5. **Author a motion-capable asset family.** Start with one canonical structural identity, then specify what is a continuous camera transform, which contours actually deform, which silhouettes require full alternate redraws, which true-alpha masks/clean underpaints are needed, and what must be painted beyond the view border. Decide this *before* calling image generation.

**Stop pretending design is done when only the script or a shot list exists.** A shot plan with no causal action, connected views, foreground/background ownership or recognisable arrival state is not an ArtJob.

## 2. Shared-view identity: manufacture the transition, not three unrelated pictures

This section is mandatory whenever the camera appears to move between wide, medium and close views of the **same** subject, whether leaf, city facade, character, organism, machine, room or abstract relational world.

Before generating a second view, create a `view_identity` record:

```yaml
view_identity:
  canonical_subject_id: original_object_01
  projection_family: "declared world axes and visible sides"
  canonical_master_id: "asset with actual inspected pixels"
  structural_graph: ["named major forms and attached subforms"]
  immutable_identity_anchors:
    - {id: focal_opening, master_px: [x, y]}
    - {id: branch_junction, master_px: [x, y]}
    - {id: silhouette_corner, master_px: [x, y]}
  view_states:
    - {id: OUT, crop_source_px: [x, y, w, h], output_px: [w, h], target_scale: 1.0}
    - {id: MIDDLE, source_or_edit_parent: OUT, entry_frame: 0, exit_frame: 0}
    - {id: IN, source_or_edit_parent: MIDDLE, new_visible_parts: []}
  crossing:
    invariant: "what a first-time viewer recognises as the same thing"
    shared_landmarks_screen_px: ["actual measured before/after coordinates"]
    camera_out_in: "actual frame-indexed positions, scales and facing"
    occluder_or_drawn_intermediate: "physical asset or consciously motivated cut"
    occlusion_depth: "who must be in front, behind or inside at each frame"
    first_incoming_proof_action: "observable event after the viewpoint change"
```

The values above are a **schema**; fill real identities, measurements, view dimensions and frames for each job. Do not reproduce its placeholders in a final renderer package.

### Positive manufacturing order

1. Build the **canonical master**, with all important attached anatomy/topology and marked native pixel anchors. Its source identity persists even if the external appearance is stylistically redrawn later.
2. Extract/crop the next view **from the exact master pixels** wherever the camera would initially see the same surfaces. For insufficient local resolution, make a controlled *detail-edit or outpaint* of that crop: preserve anchored outline, branching, position and material ownership, adding only new legitimately revealed structure. A second free-form prompt with a textual description of the “same” subject is not a registered variant.
3. If the geometry needs a genuine change of projection or topology, **draw the intermediate state** and correspondence map. Enumerate newly visible faces or interiors; do not ask 2D camera scaling to expose nonexistent back surfaces.
4. Derive masks/foreground cutouts from **the same approved pixels**. When moving an object out of its master image, generate a clean inpainted plate behind it. A broad detached wipe cannot magically repair an inaccurate underlying object or cause-and-effect journey.
5. Test OUT→MIDDLE→IN at the actual expected camera pose before commissioning all secondary art. Show the same invariant before and after. Confirm that the first new scene action answers the question that caused the view change.

**Allowed transition alternatives:** authentic tracked shared landmarks; source-registered expansion; full-state redraw with aligned anchors; meaningful near-surface occlusion; motivated explanatory cut; abstract model correspondence. A hard cut can be *more honest* than an implausible continuous flight. The original films do not demand a universal no-cut or full-screen-occluder policy.

**Occlusion is physical and ordered.** A foreground surface is permitted only if it plausibly enters through the authored camera or object movement, has sufficient actual alpha coverage over the swap interval, agrees with the new composition on exit, and preserves the correct front/inside/behind placement of every tracked witness. Never let a symbolic molecule hover over an allegedly foreground physical wall merely because z-index is convenient.

### Overscan and scale contract

- Compute every camera view envelope from the actual image size and source-pixel coordinate transform. Supply paint for every world point revealed by the entire path. A renderer must not clamp a camera unexpectedly because the original artist only painted the starting view.
- State exactly when a digital zoom is still supported by source resolution and when an authored macro state takes over. A digital zoom that magnifies blur is not an authored perspective change.
- Author the *attention transfer*, not merely a camera target: move gaze from witness to destination while both remain readable. If the icon hides the destination, change its visual role, scale or path *as part of the demonstration*, not as a late technical offset.
- Do not fix an underspecified perspective journey by overbuilding the background. Only draw detail that supports proof, identity, contact, depth or a real transition.

## 3. Two automatic creative feedback loops

### A. Source → method loop (learning)

For each important style uncertainty: record the visible question, inspect actual full-resolution source and unlike counterexample, write a concrete conditional construction operation, find a contradiction or missing branch, refine the operation, then return to source until the *high-impact* decision is supported. This is **question-driven**, not a mandatory numerical pass count. Keep claims labelled `SOURCE_OBSERVED` or `METHOD_CANDIDATE` until output and transfer evidence exist.

### B. Prompt → pixels → repair loop (production)

Apply this loop on each **whole master** and all high-risk view/pose transitions, without asking the user to request every correction:

1. Compile and save the exact `ArtJob`, source-only witnesses, actual image-provider payload, response file/receipt and image hash. Confirm the image provider was really called. A prompt in a document is not a generation.
2. Inspect the actual image at full composition, a reduced screen/phone view, and the important native-size crop. Ask which **three decisions, if changed, would most improve the intended viewer experience**. Differentiate art drift from wrong scientific structure and from camera/direction errors. Do not add generic detail as a repair.
3. For each visible mismatch, write `observed_pixels → source or subject evidence → corrected operative instruction → changed image/edit → observed improvement or remaining defect`. Fix coherent shape and relation first, color/material ownership second, then relevant detail. If the entire visual direction is wrong, return to the causal design rather than polishing the wrong image.
4. Run a real image edit or regeneration, using the canonical master and identity anchors as inputs when applicable. Inspect and compare *actual* before/after output. If the edit improves one area while breaking another, do not silently promote it. Preserve the previous version and try another controlled approach.
5. Repeat until the major unresolved **visible** choice is genuinely resolved or a specific tooling/evidence limit blocks progress. Do not manufacture an arbitrary ten-pass record or declare a pass without a new observed candidate. If blocked, record the exact source/asset dependency and stop that branch rather than certifying a finished style.
6. Promote only the reviewed successful candidate into the motion-asset manifest, with a version that points to its actual source and dependencies. Reuse successful transferable decisions in later unfamiliar art jobs; keep scene-specific repairs in that production's ledger, **not** as universal style rules.

**Active work order:** Whenever an image-generator result returns, resume at Step 2 automatically in the same task while tools remain available. Before exporting a batch, revisit its most consequential view/pose relationships. Do not switch to Claude rendering merely because all expected file names exist.

**Learning is only operative when it changes the NEXT relevant first pass:** For a full film, execute `REPAIR_LEARNING_TO_FIRST_PASS.md`. After successful pixel repair, record its observed causal mechanism and *positive drawing instructions* in the project `learning/REPAIR_MEMORY.json` using `scripts/repair_learning.py record`. Every subsequent complete-film `scripts/prepare_first_pass.py` run must include `--repair-memory` and an explicit `learning_context`; the actual `IMAGEGEN_REQUEST.json` must contain applicable repaired operations and list their IDs in its pre-submission receipt. A Markdown diagnosis alone is not learning. Prefer tight identity-local rules for recurring characters/objects and conditional family operations for similar unseen art; do not universalize a one-scene fix or promise a stochastic image model will never err again.

## 4. Evidence, receipts and handoff are tied to actual production

Preserve the following in a task-local `production_ledger` (JSON or Markdown with explicit filenames):

| Artifact | Contains | Why it is needed |
|---|---|---|
| `VIEWER_PROOF_AND_ATTENTION` | Claim/question, what changes, first-time inference, eye lead/handoff and read interval | Prevents beautiful but explanatory-empty imagery |
| `STYLE_METHOD_BINDINGS` | Relevant F-methods, source witnesses, counterexamples, material/shape operations, uncontrolled decisions | Prevents generic style-adjective prompting |
| `CANONICAL_IDENTITY` | Master hash, named parts, topology, palette roles, relevant landmarks, source/art ancestry | Prevents independent same-subject drift |
| `VIEW_AND_TRANSITION_REGISTRY` | Exact view transforms, source/target anchors, OUT/MIDDLE/IN images, occluder and z-order, overscan envelope | Prevents a disconnected wide/macro handoff |
| `PROVIDER_ATTEMPTS` | Actual prompt, reference files, candidate image hashes, inspected crops, correction and final acceptance reason | Proves that the output was generated and iterated |
| `ASSEMBLY_WITNESS` | Multi-view pre-render strip using actual layers and masks at transition boundary; valid and invalid states | Exposes geometry gaps *before* Claude receives assets |
| `RENDERER_CONTRACT` | Named pixels/layers/cels, frame-indexed operations, compositing, audio source status, no-art-invention boundary | Lets the executor follow the designed intent |

The minimal status vocabulary is `DESIGNED`, `GENERATED`, `INSPECTED`, `REPAIRED_AND_REVIEWED`, `MOTION_ASSEMBLY_PROVED`, `RENDERED_AND_VIEWED`, `UNVERIFIED`. File hashes establish integrity, **not artistic fidelity**. The status `MOTION_ASSEMBLY_PROVED` requires observed paired composite states and a complete authored transition inventory, not merely text asserting that it can work.

## 5. Interpret the first real render as a learning experiment

After Claude returns a moving proof, view it **at native playback speed**, then inspect the frames near failures. Classify each mismatch into `ART_PIXEL`, `VIEW_REGISTRATION`, `VIEWER_PROOF`, `CAMERA_AND_PACE`, `PERFORMANCE`, `RENDERER`, `AUDIO` or `UNKNOWN`. Make the actual affected artwork or direction correction on the owning side; do not allow a clever fallback to hide the failure. For this GPT-art/Claude-render project, GPT owns all original visible art and art repairs; Claude owns approved transforms, compositing, sound synchronization, technical rendering and reports missing artwork.

At minimum report these **independent** outcomes:

1. **Visual identity:** Do the moving frames retain the constructed style, subject truth, and canonical identity?
2. **Explanatory experience:** Can an unfamiliar viewer follow the causal proof and attention baton before narration explains it?
3. **Motion quality:** Do contacts, camera velocities, scale changes and occlusions feel intentional at real-time speed? Does 60fps evaluation reflect genuine continuous movement, without claiming every body is drawn in 60 poses/s?

If the film fails artistically but passes codec/QC tests, it has **failed the artistic test**. Improve the production method that caused it. A repeated failure across unlike subjects is evidence for a *transferable* skill update; a one-off fix is not a universal style discovery.

## 6. Honest generalization and stopping rule

Separate **calibration** from **qualification**:

- **Calibration pilot:** Use an existing failed unfamiliar-script sequence to repair the generator, asset manufacturing and camera-interface procedure. Keep the old bad images, prompts, seam screenshots and real motion proof as counterevidence. That repaired pilot shows learning but is not a clean-room transfer test.
- **Clean-room qualification:** Freeze the revised skill. In a genuinely new chat and fresh Claude project, provide only the final script, direction and skill—no prior image prompts, repaired scene geometry, past assistant reasoning or visual answer key. Produce a different unfamiliar 2-minute concept with the same procedure; compare style, causal legibility, consistent original characters, macro/world transfers and actual 60fps footage. A fresh session is necessary but not sufficient: require independent visual evaluation of produced pixels and motion.

**Success is not** a large checklist, longer prose, image count, passing hash ledger or pleasing first still. **Success is** purpose-built source-consistent art repeatedly reaching the intended visual and explanatory experience in moving shots, with actual attempt/repair evidence and a held-out transfer run. Until then label the skill `METHOD_CANDIDATE`, even when its directions are precise.
