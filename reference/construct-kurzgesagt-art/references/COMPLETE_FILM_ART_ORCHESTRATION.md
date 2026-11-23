# Complete-film visual production controller — direction before pixels

**Applies when the user requests a finished film's artwork, not a fixed-count image qualification.** This is the execution order for the existing F01–F80 visual skill, `TRANSFERABLE_MOTION_DIRECTION_GRAMMAR.md`, `AUTONOMOUS_VISUAL_PRODUCTION_LOOP.md`, and the original `EXPERIENCE_DIRECTOR_V1_ORIGINAL.md` standard. Preserve all their substantive methods. It is not a replacement creative-direction skill, and it does not claim that stills demonstrate finished motion.

## 0. Resolve the actual production mandate

Determine the deliverable **before** any image-generation call:

- `FIRST_PASS_SKILL_TEST`: a specified number of independent, uncorrected first passes. Preserve the actual first outputs; do not expand it into a film without approval.
- `COMPLETE_FILM_ART_PACKAGE`: the **entire** visual inventory required to animate every narrated and silent beat. A prior "seven proof images" limit is **superseded for this mode**. Those image IDs are useful as conceptual proof locations, not an inventory or delivery count.
- `TARGETED_ART_REPAIR`: repair named assets while retaining their evidence and ancestry.

For complete-film mode, bind the supplied script and direction as the creative authority, name their actual files, record precedence conflicts, and preserve exact factual claims, dates and chronology. If direction specifies an impossible visual or ambiguous claim, **re-author the visual mechanism upstream** with a written decision; don't leave Claude to invent a substitute. The user may approve new genuinely material story decisions; this controller permits ordinary source-conditioned construction decisions without repetitive user prompts.

**First output must be design work, not a scene image.** The director packet may already contain strong decisions; reuse and deepen those decisions instead of pretending they do not exist. Do not improvise a wholly new narrative, world, palette or recurring identity merely because a new image provider call starts.

## 1. Author the desired experience and true causal demonstration

Work in the original Direction V1 order. Deliver these *real, filled* documents in `direction/`:

| Order | Required file | Positive decisions that must actually be authored |
|---|---|---|
| D0 | `00_STORY_TRUTH.md` | Claim and uncertainty ledger; facts versus fictional visual metaphors; ending insight; exact source script authority. |
| D1 | `01_EXPERIENCE_MASTER.md` | For each sequence: viewer **BEFORE → PRESSURE → DISCOVERY → FEELING → AFTER → NEXT QUESTION**. A specific audience inference and its emotional cause, not a mood adjective. |
| D2 | `02_VISUAL_EXPERIENCE_DESIGN.md` | Invent and choose real moving explanations: **STATE A → TRIGGER → STATE B → CONSEQUENCE → ACTOR REACTION → HANDOFF**. Compare meaningful alternatives for difficult claims; define what changes physically or semantically, not an ornamental metaphor. |
| D3 | `03_WORLD_AND_ART_DIRECTION.md` | Identity atlas, recurring objects, world projection and geography, color-region roles, source-conditioned constructors, foreground/background ownership, scene continuities and actual camera extent. |
| D4 | `04_SHOT_DIRECTION_MASTER.md`, `04_SHOT_MAP.json`, `04_CHOREOGRAPHY_AND_HANDOFFS.md` | For every beat: precise frame interval, starting visual, causal action, secondary performance, gaze lead, focus/scale/perspective path, contact/occlusion, recognition interval, ending state and bridge to next beat. Draw no final plates yet. |
| D5 | `05_FILM_EXPERIENCE_AND_CONTINUITY.md` | Deliberate energy modulation, tension/release, scale grammar, variety, face/body performance, recognition pauses and repeat-object continuity. No uniform slow zoom or hyperactive motion at every beat. |
| D6 | `06_NARRATION_AND_SOUND_DIRECTION.md`, `VOICE_CUES.json`, `SOUND_EVENT_MAP.json` | Locked script-to-beat mapping; provisional word cues until actual voice recording, planned musical and sound causes, and the audible silence budget. |
| D7 | `08_DIRECTION_QUALITY_REVIEW.md`, `PRODUCTION_AUTHORITY.md` | Intention versus observed later art, exact ownership of all original pixels, missing art requests, facts that must not be visually implied, and no unapproved creative substitutes. |

The original Direction V1 also calls for `07_HERO_ART/`, an animatic, a motion proof and eventually a final director package. In this GPT-art / Claude-motion arrangement, **GPT must first author all pixels and may create a still/keyview assembly preview**; it must NOT claim an actual moving proof or full animatic MP4 was rendered until there is one. Claude produces later motion proofs at the agreed frame rate using the complete handoff. Preserve the requested file names and truthful statuses.

### Each shot must contain an *action contract*, not just a picture brief

For every planned shot or sub-beat, fill:

1. **Attention:** precise starting focal point, next focal target, gaze-transfer mechanism and time available to understand it.
2. **Energy and feeling:** initial tension, change, why the viewer experiences it, intended settle or acceleration, and a visible action producing that result.
3. **Metaphor mechanics:** named actors/objects, source/target, state A, actual trigger and contact, causal propagation, state B, consequences and what a silent viewer infers. Separate *symbolic illustration* from asserted historical fact.
4. **Perspective and camera:** physical or abstract scene plane, projection/facing, camera coordinate/path/target, camera velocity intent, depth parallax, zoom resolution and painted overscan. OUT→MIDDLE→IN registration when the viewpoint changes.
5. **Animation choreography:** anticipation, move, action/contact, follow-through, reaction, read/hold and exit. State which shapes can be continuously transformed and which require **separate original drawings**.
6. **Continuity:** exact incoming and outgoing anchors, persistent characters/objects and their states, occlusion order, any deliberately motivated cut, next shot's starting state.
7. **Art dependencies:** *all* different pixels needed in each instant: background/clean plate, foreground occluder, master-derived close crop, true-alpha figure, facial/hand poses, machine transformations, diagram paths, typography, UI, optical effects, masks and material-specific interior.

For `fps=60`, use exact integer frame intervals **start inclusive, end exclusive**; a 120-second film has `[0, 7200)`. Plan handoff/recognition and temporal state changes at frame resolution, but **do not invent 60 unique drawings per second** where interpolation of approved assets is the physically valid operation. A 60-fps export alone is not evidence of smooth meaningful action.

## 2. Lock the visual identity system *before* independent shots

Create `art/00_VISUAL_BIBLE.md`, `art/01_IDENTITY_REGISTRY.json`, and `art/02_ASSET_DEPENDENCY_GRAPH.json`. Use F01–F80 conditionally; do not collapse distinct film environments into one palette, projection or density. These documents set *specific geometry and palette roles* per world and object and bind the native 1920×1080 source witnesses **as STYLE ONLY**, including unlike counterexamples.

Produce in this manufacturing order, preserving actual pixel outputs and named ancestry:

1. **Characters:** select family per use (`HUMAN_ACTING_CLOSE`, `HUMAN_GESTURE_FULL`, `DISTANT_POPULATION`, etc.), create an original canonical full/appropriate view with only essential contact props, then approve its *actual* silhouette, hair, face planes, eye/brow geometry, clothes, scale, color ownership, and identity landmarks. Derive profile, 3/4, rear, expression and hand-contact variations from that approved image instead of generating independent new lookalikes. Distinguish a symbolic founder scene from a historical photo reenactment. No final whole-scene prompt before its focal acting identities are constructed.
2. **Recurring props and mechanics:** canonical physical/diagrammatic structure, named attached parts and sockets, actual functional contacts, continuity landmarks, relevant stable material fills; derive each state from its original identity, not from unrelated image descriptions.
3. **Worlds:** original world shell and registered clean plates with foreground/background separation, depth/projection axes, architecture, substrate and camera overscan. Derive additional views from the same source pixels/anchors. Detail only where it supports the audience demonstration or camera arrival.
4. **Nested/abstract visual systems:** diagram/data/interface assets with typed endpoints, physically or logically accurate paths, meaningful parent-contained surfaces and separate alpha states; no random decorative stickers or misleading invented UI.
5. **Acting and transition families:** per-shot pose/expression/hand silhouettes, mechanism open/closed/half/affected states, true alpha cutouts, matching underpaints, occluders, perspective intermediate drawings, pre/after-change plates and corresponding camera anchors. The bridge is its own manufactured asset family, not an afterthought.

Write persistent *identity constraints*, not copied reference characters: `subject_id`, canonical image path/hash, actual body/object landmarks, face/projection axes, allowed expression/state variations, material-palette roles, related source-only style witnesses, and all downstream shots. For newly invented poses or views, attach the **approved original canonical image as an identity/edit target** in addition to applicable style references where supported. If the model cannot preserve the identity, derive by crop/edit/controlled redraw with anchor correspondence; do not waive continuity.

## 3. Compile every asset request with its parent and frame purpose

Use the existing `scripts/prepare_first_pass.py` + `first_pass_control` + `molecular_visual_decisions` for source-grounded creation. Before submission, derive a *filled* ArtJob from its direction contract and identity registry. Its actual provider prompt must put the causal visual proof, silhouette/parent-part geometry, palette and material owners, view/scale, limb/prop contacts, canonical ancestry and forbidden generic rendering choices **before** any vague style adjectives. At least two unlike native STYLE-ONLY witness images must actually reach the provider; cite exact paths and hashes. For an edit, also provide the valid target/identity image via the provider's edit mechanism; the reference images are not permission to copy original source content.

**Image requests are ordered by dependency, never by script order alone:** canonical actor → canonical recurring objects → world parent plate → derived view and acting state → compositing/transition assets → contextual shot assembly. Batch only independent jobs that already share locked identities and declared geometry. Do not rush to seven "hero" illustrations before the character master exists.

Each asset should have `asset_id`, owner subject/world, one real file path, frame/shot uses, dimensions, alpha requirement, master/parent ID, named source identity anchors, provider request/attached-source receipt, first-pass hash, latest repaired hash, observed style/causality review and downstream layer order. Generated text specs or invented filenames are **not pixels**. Any asset required for a view that remains just `DESIGNED` stays missing.

## 4. Automatic high-impact, molecular, *transferable* correction

**Operational companion:** read and execute `REPAIR_LEARNING_TO_FIRST_PASS.md`. Initialize `learning/REPAIR_MEMORY.json` at project start. For every full-film ArtJob fill `production_mode=COMPLETE_FILM_ART_PACKAGE` and its actual `learning_context`, and compile with `scripts/prepare_first_pass.py --repair-memory PROJECT/learning/REPAIR_MEMORY.json`. The project compiler now refuses a full-film first pass when learning memory was not supplied, even before any repair has occurred. After a successful observed repair use `scripts/repair_learning.py record` to bind the evidence-backed positive operations to applicable future requests; a plain Markdown lesson does not change the provider payload. Preserve the distinction between LOCAL_IDENTITY rules and conditionally applicable family rules; never call a single corrected image a universal guarantee.

After **every** actual image-generation/edit result, without waiting for another user message:

1. **Compare the whole output** against *unlike original film witnesses* and the locked visual bible at native and thumbnail scale. Ask: "What specifically makes this different from the intended source-conditioned visual language, and what effect does that have on the viewer's understanding?" Examine parent silhouette/proportion, face/gesture, palette-region adjacency, material planes, density, world projection, contact topology, identity and screen hierarchy. Do **not** only check anatomy or count details.
2. Choose the **few highest-impact causes**, then go molecular **inside** each: e.g., not "character off-style," but `hair outer path → contour breaks → lobe overlaps → face-plane inset → eye/mouth spacing → garment shade ownership`, grounded in actual witnesses. Ask what other major family was missed before declaring a diagnosis.
3. Trace `observed incorrect pixels → producing instruction/attachment/sequence error → source witness + unlike counterexample → specific corrected construction instructions → exact changed provider payload → actual edited output → observed difference`. If whole visual invention is weak, go back to the moving metaphor/direction contract, not to more microtexture.
4. Preserve the first pass **untouched**, and produce genuine repaired output. Loop on consequential defects while art tools are available, conserving prior versions. Review semantic changes and new pose/identity drift after each repair. An improvement in style that breaks a real action/contact is not final art.
5. **Close the learning loop upstream:** update the appropriate family-specific method/prompt compiler, canonical identity contract, or production stage. Record the actual successful repair and its conditions in `learning/REPAIR_MEMORY.json` using `scripts/repair_learning.py record`; then the next matching first-pass compiler payload **must include** that repair's concrete positive construction instructions. Separately record a reusable *conditional* `failure_trigger`, wrong model prior or skipped stage, repaired operation, source contrast, actual before/after evidence and an adversarial unfamiliar use case in `learning/TRANSFERABLE_REPAIRS.md`. An isolated actor's hairline or exact scene coordinate remains **local**, not a universal style law. Increment evidence status only after fresh independent test—not merely because an edit looks better. If the current Chat cannot persistently edit the installed skill, preserve a concrete proposed skill diff and evidence **in the project package**; do not claim the global installed skill learned it automatically.
6. Continue using the improved rule for subsequent assets. For a repeated drift, adjust the **first provider request** and locked identity reference rather than depending on indefinite edits. Never silently promote a repaired picture into an "uncorrected first-pass" test.

The loop is **a real operation subject to available tools**, not self-certification. If image edits cannot run or source witnesses cannot be attached in the current mode, stop that asset branch, record `BLOCKED_*` with its exact dependency and resume when possible. Do not assert that no human critique is needed or that stochastic generators are perfectly controllable.

## 5. Assemble the 60-fps render contract, not a ZIP of seven paintings

Create these **production** files, not promises to create them:

- `art/ASSET_MANIFEST.json`, `art/ART_REQUEST_AND_REPAIR_LEDGER.md`, `art/REGISTERED_VIEW_ATLAS.md`: all generated art, provenance, actual plate dimensions, alpha/crop/registration anchors, repaired candidate lineage and usage.
- `learning/REPAIR_MEMORY.json`: actual project-specific successful pixel repair lessons in the operative first-pass compiler format; empty but initialized until the first demonstrated correction.
- `motion/SHOT_FRAME_SCORE_60.json`, `motion/CAMERA_AND_ATTENTION_PATHS.md`, `motion/TRANSITION_ASSEMBLY_STRIPS/`: start/contact/consequence/exit assets, actual camera path including speed/settles, near/far z-order, event timings and matched incoming/outgoing views.
- `motion/MOTION_ASSET_REQUESTS.md`: only truly missing art/transition states as exact GPT-owned tasks with dimensions, masks, pose/animation purpose and affected frames; return to generating them **before** approval.
- `handoff/ART_AND_MOTION_MANIFEST.json` (validated by `scripts/validate_film_art_package.py`): script and direction links, asset references, shot/frame contracts, transition correspondence, real request/inspection receipts and ownership.
- `handoff/CLAUDE_RENDER_INSTRUCTIONS.md`: use **only** the supplied pixel assets for all visible illustration, follow approved camera/motion/facing/attention/transition/timing and audio direction; do not draw silhouettes, labels, worlds, effects, or hide missing art through substitutions. Report missing states via a GPT art request.
- `handoff/PRODUCTION_STATUS.md`: honest inventory of `DESIGNED`, `GENERATED`, `REPAIRED_AND_REVIEWED`, `ASSEMBLY_PROVED`, or `BLOCKED`; include which frame spans are truly covered. Supply a browsable keyframe/assembly contact sheet from actual assets.

Motion implementation may transform/compose the supplied layers and animate positions, scales, vector interpolation of authored geometry when explicitly approved, text placement from approved typographic assets, opacity and lighting effect parameters as specified. It may **not author new illustrated scene content** as a fallback. If the direction needs hundreds of incremental event drawings, generate or author an interpolation-capable rig/shape family first; 60fps frame count is not itself the number of PNGs.

Use `scripts/validate_film_art_package.py` as a **secondary technical witness**: it rejects absent files, incomplete frame coverage, dangling asset IDs, missing image pixels and unsupported 60-fps claims. Passing the script alone is **not visual approval**. Then inspect actual registration at the risky handoffs and hand/body contact pixels. Only label `READY_FOR_CLAUDE_RENDER` when these are actually seen and all declared assets exist. Otherwise label `PARTIAL_ART_PACKAGE`, publish what exists with exact missing work, and continue generating rather than implying Claude can invent the difference.

### Renderer manifest contract (version 1)

The JSON file `handoff/ART_AND_MOTION_MANIFEST.json` has these filled fields (all paths are **relative to the project package root**, and cannot escape it):

```json
{
  "schema_version": 1,
  "project_id": "ORIGINAL_FILM_ID",
  "mode": "COMPLETE_FILM_ART_PACKAGE",
  "status": "PARTIAL_ART_PACKAGE",
  "fps": 60,
  "total_frames": 7200,
  "stage_files": {
    "story_truth": "direction/00_STORY_TRUTH.md",
    "experience": "direction/01_EXPERIENCE_MASTER.md",
    "visual_inventions": "direction/02_VISUAL_EXPERIENCE_DESIGN.md",
    "world_direction": "direction/03_WORLD_AND_ART_DIRECTION.md",
    "shots": "direction/04_SHOT_DIRECTION_MASTER.md",
    "shot_map": "direction/04_SHOT_MAP.json",
    "handoffs": "direction/04_CHOREOGRAPHY_AND_HANDOFFS.md",
    "continuity": "direction/05_FILM_EXPERIENCE_AND_CONTINUITY.md",
    "narration": "direction/06_NARRATION_AND_SOUND_DIRECTION.md",
    "voice_cues": "direction/VOICE_CUES.json",
    "sound_events": "direction/SOUND_EVENT_MAP.json",
    "visual_bible": "art/00_VISUAL_BIBLE.md",
    "identities": "art/01_IDENTITY_REGISTRY.json",
    "asset_dependencies": "art/02_ASSET_DEPENDENCY_GRAPH.json",
    "art_ledger": "art/ART_REQUEST_AND_REPAIR_LEDGER.md",
    "registered_views": "art/REGISTERED_VIEW_ATLAS.md",
    "frame_score": "motion/SHOT_FRAME_SCORE_60.json",
    "camera_attention": "motion/CAMERA_AND_ATTENTION_PATHS.md",
    "render_instructions": "handoff/CLAUDE_RENDER_INSTRUCTIONS.md",
    "production_status": "handoff/PRODUCTION_STATUS.md",
    "direction_review": "direction/08_DIRECTION_QUALITY_REVIEW.md",
    "authority": "direction/PRODUCTION_AUTHORITY.md",
    "learning": "learning/TRANSFERABLE_REPAIRS.md"
  },
  "assets": [{
    "id": "ORIGINAL_MASTER_01",
    "file": "art/images/ORIGINAL_MASTER_01.png",
    "kind": "character_master",
    "status": "REPAIRED_AND_REVIEWED",
    "sha256": "ACTUAL_FILE_SHA256",
    "source_job": "art/jobs/ORIGINAL_MASTER_01.json",
    "inspection": "art/reviews/ORIGINAL_MASTER_01.md",
    "parent_id": null,
    "alpha_required": false,
    "uses": ["S01"]
  }],
  "identity_masters": [{"subject_id": "H_ORIGINAL", "asset_id": "ORIGINAL_MASTER_01"}],
  "shots": [{
    "id": "S01", "start": 0, "end": 180,
    "viewer_before": "specific mental state", "viewer_after": "specific learned fact",
    "trigger": "specific event", "causal_action": "drawable change",
    "attention_path": "eye position and handoff", "camera_path": "registered coordinates and velocity",
    "experience": "visible cause of change in feeling",
    "outgoing_handoff": "destination and bridge",
    "required_assets": ["ORIGINAL_MASTER_01"],
    "states": {"entry": ["ORIGINAL_MASTER_01"], "action": ["ORIGINAL_MASTER_01"], "contact": ["ORIGINAL_MASTER_01"], "consequence": ["ORIGINAL_MASTER_01"], "exit": ["ORIGINAL_MASTER_01"]},
    "track_file": "motion/tracks/S01.json"
  }],
  "transitions": []
}
```

The sample values are **schema illustrations only**; actual production requires real scene-specific filenames, hashes, drawings, state-by-state decisions and full frame coverage. Each subsequent shot needs its own contract and a transition record for every adjacent shot pair. A transition record has `from`, `to`, `out`, `middle`, `in`, `shared_anchor`, `handoff_mechanism`, `required_assets`, `assembly_proof` (actual inspected image). The named camera/track files must describe real authored transform curves; zero-change reuse of the same static art across all states needs an explicit visible explanation and is not automatically creative success. `kind` may be `character_master`, `pose`, `world_plate`, `clean_underpaint`, `prop`, `diagram`, `ui`, `type`, `occluder`, `alpha_mask`, `effect`, `transition_state` or `keyview`. Use `alpha_required=true` for genuine alpha masks/cutouts. Copy portable art/request evidence into the handoff; hashes are integrity receipts, not style scores.

## 6. Checkpoint and return policy for a long Chat run

An entire 120-second package may exceed a single Chat turn's image-generation, context or file capacity. **Do not silently truncate the ambition to the first seven pictures.** Save generated files and receipts in a recoverable project location in logical batches; after each shot family write manifest and state progress. Resume by reading the existing on-disk manifest and source evidence, **not** by asking the image model to rediscover character identity. If a platform limit blocks continuation, report the exact remaining asset count/dependencies and give the next-step resume prompt. A successful handoff is one whose artwork is visibly constructed, editable, registered and causally directed; no claim of completion is allowed solely because the documents are long.
