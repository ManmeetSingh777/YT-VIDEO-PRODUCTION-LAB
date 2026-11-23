# Motion-Native Hybrid V2 — Complete Architecture and Execution Specification

**Specification status:** Binding design for implementing a GPT-authored-art / Neutrino-executed-motion production bridge. **Not evidence that the bridge has been implemented or that any film has passed quality review.**

**Project authority:** Manmeet's existing Motion-Native Studio repository, original Experience Director V1 direction standard, installed five-film F01–F80 `construct-kurzgesagt-art` skill, approved character/world masters, and this execution contract. Any apparent conflict is reported with exact clauses; Claude must not silently relax a visual constraint or substitute a generic drawing.

**Target:** Original educational films including a 120-second, 1920×1080, 60 fps production with continuous, expressive, causally meaningful animation; sophisticated consistent art; correct anatomy/contact; accurate explanatory mechanisms; narration, sound, camera, transitions and editable scene project. The renderer does **not** manufacture arbitrary new illustrated subject art. It transforms, composites, projects and procedurally animates **approved GPT-authored visual content and approved mathematical visual mechanisms**.

## 0. Explicit truth boundary and non-negotiables

1. **Feasibility is YES; deterministic first-generation artistic perfection is NOT a technical guarantee.** The architecture can render complex animations when suitable registered art states exist. A stochastic image model may fail; failures must trigger actual source-level repair rather than acceptance. Never report "100% flawless" from manifests or unit tests.
2. **Existing `nu.js` is preserved byte-for-byte** unless a demonstrated Neutrino defect absolutely requires a separately reviewed compatibility patch; prefer wrappers. It is a time-seekable SVG/GSAP runtime, not an artist and not a complete physics engine.
3. **Never reassign all F01–F80 to Bézier geometry producers.** The F methods are heterogeneous: image authorship, topology, motion/state, world, direction, research, evidence and repair. Classify each method and bind its relevant decisions to the real consumer. A method's name appearing in a ledger does not count.
4. **No visual improvisation by the renderer.** If no approved artwork or permitted vector symbol exists, fail `MISSING_ART_ASSET`, create a precise GPT-owned ArtJob and resume from that dependency. Never draw a placeholder face, limb, tree, label, scene or diagram as a substitute.
5. **Never treat a whole-character PNG as a sufficient articulated asset.** Require a canonical identity and only the view/pose/deformation family actually needed by the film. Keep a whole-character plate as a reference and an optional valid cel.
6. **No one-size-fits-all rig.** Route each movement through one of the exact supported classes: `RIGID`, `ARTICULATED`, `REGISTERED_CELS`, `REGISTERED_MORPH`, `EXPLICIT_DEFORM`, `PROCEDURAL`, `CAMERA_WORLD`, `TRANSITION`. No automatic cross-class fallback.
7. **All animation must be seek-deterministic:** rendering frame `f` in any order must match rendering it after frames `0..f-1`, given the same assets and state. Physics is evaluated analytically or baked to fixed-step tracks before final render. No incremental stateful simulation in `render(t)`.
8. **No single metric can certify art.** Structural tests prevent invalid files; real native-size pixels, the approved canonical identity, unlike native style witnesses, motion playback, and a full-look artistic review decide actual acceptance.
9. **One Claude session may need resumable checkpoints.** Complete all requested stages automatically while capable; preserve committed, reproducible intermediate results. Do not mislabel a partial implementation as completion because a token or time limit was reached.

## 1. Source reconciliation before modification — bounded, not a new creative audit

Inspect the *live* repository, not an old audit ZIP. Record current HEAD, working tree, existing user changes, exact actual filenames, API signatures, copies and hashes of `nu.js`, `mn.js`, `form3d.js` if present, `engine/lib/rig.mjs`, `engine/lib/scene.mjs`, `engine/lib/geom.mjs`, `engine/tools/build.mjs`, renderer/HyperFrames commands, `inputs/`, `CLAUDE.md`, `HANDOFF.md`, all F-source and art package manifests. Preserve unrelated changes. Create a recoverable, scoped checkpoint after inspecting staging contents; do not use destructive git commands. Output `hybrid_v2/evidence/BASELINE.md` with an exact function-to-spec mapping.

Known from exported code (verify against live copy):

- `NU.scene()` / `S.k`, `S.at`, `S.show`, `S.render`, `S.camera`, `S.streaks`, `S.done` provide keyed and procedural time evaluation; `nu.js` has a special old `S.actor` that must **not** be treated as a universal image rig.
- `MN.rig` supports parent-child FK, two-bone IK, sockets, prop attachment, walk, follow-through, morphs and state swaps. Its historical `ik2` clamps an unreachable target; V2 must reject or re-stage, not silently stretch/contact-snap.
- `defineRig` accepts `parts[].svg` as arbitrary SVG content: an `<image>` in a joint group is possible. It does not currently guarantee image crop registration, underpaint, view consistency or art-quality preservation.
- `MN.form` and old `engine/methods/` can project/emit procedural shape geometry, but earlier audits proved that hard-coded faces, tubes, shared crescent shading and hand-entered landmarks did not create acceptable original character art. Preserve useful math, not these default artistic templates.
- `S.camera`/`MN.camera` write transforms directly; object tracks also write transforms. **Never put camera and object transforms on the same SVG node**. Use separate nested wrappers.
- The original Neutrino film rendered at 30 fps. Time-based evaluation is compatible with 60 fps, but actual HyperFrames/FFmpeg capture, performance and exported metadata must be verified at 60 fps.

Do not rewrite the runtime, existing finished film, original assets or F-method research archive. All new bridge code belongs under `engine/art_bridge/` or equivalent exact existing project locations, with test fixtures under a clearly separate `tests/art_bridge/` and versioned schemas under `schemas/`.

## 2. Architecture ownership and source of truth

### 2.1 Creative and technical authority

| Layer | Authoritative producer | Renderer is allowed to do | Renderer is forbidden to do |
|---|---|---|---|
| Story truth and audience experience | Approved script + Experience Director | Schedule approved events, motion/audio | Invent a contradictory cause or missing metaphor |
| F01–F80 visual rules | Installed skill + source witnesses | Verify and consume compiled art/state metadata | Substitute a universal palette, head or silhouette template |
| Canonical characters/worlds/props | GPT-produced approved art | Transform, crop, composite, render | Independently draw replacements for absent subjects |
| Mechanism and diagram styling | GPT-authored symbols, paths, surfaces, type styles and semantics | Evaluate geometry/coordinates mathematically over time | Invent unsupported stylistic detail or false graph relationships |
| Camera, choreography and contact | Approved frame/event contracts + deterministic solvers | Interpolate, solve, bake, render | Alter the story's intended operation to hide a constraint error |
| Art repair | Actual GPT image edit/regeneration + source-grounded compiler changes | Request exact missing states, preserve provenance | Mark reworded critique as a repaired asset |

### 2.2 Shared coordinate and time convention

- Stage: 1920×1080 canonical CSS/SVG pixels, origin top-left, x right, y down.
- Film frame: integer `f`; time `t = f / fps`; required `fps=60`; `f` ∈ `[0,7199]` for 120 s. Intervals are `[start_frame,end_frame)` (end exclusive).
- Every asset declares `pixel_dimensions`, `canonical_rect=[x,y,w,h]` and coordinate space `CHARACTER_LOCAL`, `PROP_LOCAL`, `WORLD_LOCAL` or `SCREEN`. Avoid guessing normalized versus pixel coordinates.
- Every joint declares its parent-local pivot; every sprite declares the corresponding pivot in the asset's canonical coordinate system. Transform composition order is `camera > world owner > rig root > joint > image/cel` with a **single transform owner for each node**.
- All view and contact anchors must be tracked across related states by semantic IDs, not inferred from a cropped bounding box at runtime.
- All colors remain tagged with palette/material ownership and actual asset source; no fallback color family. Render in a consistent color space and preserve straight/premultiplied alpha correctly.

## 3. Motion Asset Manifest V2 — required typed data

Create `schemas/motion_art_manifest_v2.schema.json` using JSON Schema Draft 2020-12, `additionalProperties:false` for defined production objects, exact types/enums and `required` lists. Provide `schemas/examples/valid_human_grip.json`, `valid_world_portal.json`, `invalid_unreachable_contact.json`, `invalid_missing_underpaint.json` and `invalid_illegal_view_morph.json`. The validator must be executable from CLI and programmatic code, not merely an optional report.

### 3.1 Top-level document

Required keys (additional first-class keys may be added only when directly justified by an observed existing field):

```
schema_version, project_id, production_mode, status,
stage:{width,height,fps,total_frames,coord_system,color_space},
authority:{script,direction,style_skill,visual_bible,source_witness_manifest},
identities[], assets[], rigs[], worlds[], actions[], shots[], transitions[],
audio:{narration_file,word_alignment_file,sfx_events_file},
learning:{repair_memory_file,compiler_receipts[]},
evidence:{asset_review_index,motion_review_index,method_trace_index}
```

Contract values: `schema_version="2.0.0"`, `production_mode="COMPLETE_FILM_ART_PACKAGE"`, stage `width=1920,height=1080,fps=60,total_frames=7200,coord_system="SVG_Y_DOWN_PX"`. Production statuses: `PLANNED`, `PARTIAL_ART`, `ART_READY`, `MOTION_READY`, `QUALIFICATION_PASSED`, `FULL_RENDER_REVIEWED`; status is **computed** from real evidence, never editable self-attestation.

### 3.2 Identity record

Each identity requires `id`, `kind`, `canonical_asset_id`, `master_sha256`, `landmarks` (named canonical points), `palette_roles`, `material_owners`, `source_method_ids`, `allowed_views`, `required_shot_ids`, `approved_review_id`. Master hashes and landmark metadata must correspond to actual files. A master may be still-only; its availability does not imply any pose coverage.

### 3.3 Asset record

Every visible asset requires:

- `id`, `identity_id`, `kind` (`MASTER`, `PART`, `CEL`, `CLEAN_PLATE`, `UNDERPAINT`, `OCCLUDER`, `MASK`, `WORLD_PLANE`, `SYMBOL`, `VECTOR_PATH`, `TYPE`, `MATERIAL_PLANE`, `EFFECT_STATE`, `TRANSITION_PLATE`).
- `file`, `sha256`, `width_px`, `height_px`, `alpha_mode` (`OPAQUE`, `STRAIGHT`, `PREMULTIPLIED`, `BINARY_MASK`), `color_space`, `approved_review_id`, `provider_receipt_id`.
- `canonical_rect`, `coordinate_space`, `parent_part_id` or explicit root, `pivot_xy`, `sockets` by name, `landmarks` by name, `layer_owner`, `draw_order_constraints`, `depth_band`, `render_scale_range`.
- `view_id`, `pose_id`, `expression_id` where applicable, `hidden_surfaces`, `underpaint_asset_ids`, `mask_asset_ids`, `occluder_asset_ids`, `material_plane_ids`, `camera_footprint` and `overscan_rect` where relevant.
- `motion_modes_allowed`, `incompatible_states`, `valid_interpolation_targets`, `required_contact_sockets`, and actual shot/frame usage.

`canonical_rect=[x,y,w,h]` is the rectangle occupied by the full uncropped part in canonical identity units. `pivot_xy` is in that **same** coordinate system; it must not silently switch to crop-relative coordinates. If source imagery uses another coordinate frame, provide an explicit invertible `asset_to_canonical` affine matrix (six finite numbers) and use it during registration.

### 3.4 Rig record

Each rig requires `id`, `identity_id`, `root_part`, `joints[]`, `render_parts[]`, `sockets[]`, `pose_states[]`, `view_states[]`, `constraints[]` and `allowed_state_edges[]`.

- Joint: `{id,parent_id|null,rest_xy,rotation_limits_deg,scale_limits,driven_part_ids[]}`.
- Socket: `{id,joint_id,local_xy,semantic_role}`; contact frames reference socket IDs.
- Render part: `{asset_id,joint_id,local_to_joint_matrix,occlusion_owner_id,material_owner_id}`.
- State: `{id,asset_bindings,landmark_correspondence,contact_set,view_facing,required_underpaint,approved_review_id}`.
- Allowed state edge: `{from,to,mode,max_transition_frames,landmark_ids[],mask_or_occluder_id?,approved_assembly_review_id}`. The permitted `mode` is one of `RIGID_CONTINUOUS`, `CEL_SEQUENCE`, `MATCHED_VECTOR_MORPH`, `REGISTERED_SWAP`, `EXPLICIT_DEFORM`. `REGISTERED_SWAP` requires a real transition strategy; a raw opacity crossfade between mismatched full faces is not automatically valid.
- Rig graph is a DAG: every non-root has exactly one parent; cycles, duplicate IDs and dangling parents hard-fail.

### 3.5 Action record — the missing bridge between frames and pixels

Required `{id,shot_id,frame_range,semantic_goal,mode,actors,targets,contact_events,pose_events,view_events,secondary_owners,causal_effects,visibility_effects,physics_track_id?,required_assets[],proof_conditions[]}`.

Contact event: `{start_frame,end_frame,source_socket,target_socket,contact_type,allowed_error_px,near_far_relation,release_behavior}`. Explicit types: `GRIP`, `PLANT`, `SUPPORT`, `HINGE`, `SLIDE`, `COLLISION`, `FOLLOW`. The solver must obey the interval, not check only endpoints.

Shot record: `{id,start_frame,end_frame,world_id,entry_state,events[],attention_path,camera_track_id,required_asset_ids[],exit_state,continuity_to}`. Shots cover `[0,total_frames)` without accidental gaps or overlaps. Intentional stationary holds are allowed if labeled with the viewer's recognition purpose.

Transition record: `{from_shot,to_shot,frame_range,reason,continuity_invariant,out_asset_ids,middle_asset_ids,in_asset_ids,shared_landmarks[],camera_correspondence,mask_or_occluder_ids,assembly_review_id}`. An intentional hard cut is its own explicit `mode="CUT"` with reason; no fake continuous perspective if matching art is absent.

### 3.6 Required invariant errors

Return structured errors with `code`, `file`, `record_id`, `shot_id?`, `frame_range?`, `dependency`, `suggested_producer` and `human_readable_reason`; an error never triggers visual improvisation.

Error codes at minimum: `MISSING_ART_ASSET`, `MISSING_CANONICAL_MASTER`, `UNAPPROVED_ART`, `IMAGE_DIMENSION_MISMATCH`, `ALPHA_INVALID`, `ART_IDENTITY_DRIFT`, `UNREGISTERED_PIVOT`, `INVALID_RIG_DAG`, `DUPLICATE_ELEMENT_ID`, `INVALID_TRANSFORM_OWNER`, `MISSING_UNDERPAINT`, `OCCLUSION_CONFLICT`, `UNSUPPORTED_VIEW`, `UNSUPPORTED_STATE_EDGE`, `INVALID_MORPH_TOPOLOGY`, `UNREACHABLE_IK`, `CONTACT_DRIFT`, `FOOT_SLIDE`, `OUTSIDE_CAMERA_FOOTPRINT`, `MISSING_TRANSITION_STATE`, `MISSING_WORD_ALIGNMENT`, `UNQUALIFIED_STYLE_ASSET`, `METHOD_NO_REAL_CONSUMER`, `UNDETERMINISTIC_FRAME`, `RENDER_CAPTURE_FAILURE`.

## 4. Stage 1 — exact build and acceptance

### Build order

1. `schemas/motion_art_manifest_v2.schema.json`: type/enum/path/semantic requirements above. Validate paths relative to package root; reject path traversal, absolute escapes and absent files. Validate PNG dimensions and decode alpha, file hashes and linked source receipts.
2. `engine/art_bridge/load_manifest.mjs`: `loadManifest(projectRoot, manifestPath)` parses, validates, checks referential integrity, rejects unspecified defaults and returns immutable normalized objects. Keep it independent of browser/DOM.
3. `engine/art_bridge/graph.mjs`: build art DAG, rig DAG, action dependencies, source-to-state lineage, occlusion precedence graph, camera footprint dependencies. Detect cycles and missing owners before image loading.
4. `engine/art_bridge/coverage.mjs`: compute per-frame asset requirements, shot coverage, contact intervals, state edge requirements and transition inventory; return exact missing frame spans and ArtJob requests.
5. `engine/art_bridge/method_trace.mjs`: one entry per F01–F80 classified `IMAGE_AUTHORSHIP`, `STRUCTURE`, `MOTION`, `DIRECTION`, `EVIDENCE`, `REPAIR` or `CONDITIONAL_NOT_APPLICABLE`. Link exact source clause, applicable condition, live producer/request, actual read or rendered impact, and evidence. `METHOD_IMPLEMENTED` cannot be manually set or inferred from an empty gaps array.
6. CLI `engine/tools/art_bridge_check.mjs`: `check --manifest PATH --root ROOT --json OUT`; deterministic, nonzero exit if any hard error. `--inspect` prints a human-readable dependency list without writing art or touching Neutrino sources.

### Stage 1 acceptance: ALL required

- Valid mixed human/prop/world fixture loads and has exact source lineage.
- Every invalid example above fails with the appropriate structured error, no fallback placeholder.
- Wrong pivot, invalid parent, missing underpaint, unsupported view switch and circular layer order are rejected.
- A frame-by-frame dependency walk covers `[0,7200)` and names exact missing art; a static reference plate never counts as a registered active rig by itself.
- The F01–F80 registry accounts for **all 80 methods**; applicable methods have an intended *real consumer*; non-drawing methods are not mislabeled as geometry producers. Artistic implementation remains pending until actual provider pixels exist.
- Test suite includes a case where a method merely appears in a self-declared `uses` list but has no executable consumer; this MUST fail.

**Do not begin Stage 2 with unresolved Stage 1 schema/graph defects.**

## 5. Stage 2 — exact animation and compositing implementation

### 5.1 Modules and interfaces

Implement these explicit APIs. Locate compatible existing functions first and wrap/reuse them rather than duplicate names. Test every public API with real decoded assets and DOM-rendered frames.

| New module | Required exported interface | Behavior |
|---|---|---|
| `engine/art_bridge/asset_registry.mjs` | `createAssetRegistry(root,manifest)`; `.get(id)`; `.getState(identity,view,pose)`; `.preloadForShot(shotId)` | Verify all files/hashes/alpha once; map stable asset IDs to URLs and pixels. Never return a placeholder. |
| `engine/art_bridge/svg_parts.mjs` | `emitSpritePart(part,asset)`; `emitRigTree(rig,registry,scenePrefix)` | Emit nested camera/world/rig/joint/image groups with exact local transforms and unique IDs. |
| `engine/art_bridge/rig_binding.mjs` | `bindRig(scene,rigMeta,assetState)`; `solveRigAt(frame)` | Adapt existing `MN.rig`/`defineRig` without changing approved drawing pixels. |
| `engine/art_bridge/constraints.mjs` | `validateReach(chain,target,limits)`; `solveContactGraph(frame,sceneState)` | Enforce reach, joint limits, foot plants, prop sockets and frame intervals; structured failure rather than illegal correction. |
| `engine/art_bridge/state_router.mjs` | `resolveState(owner,frame)`; `validateStateEdge(from,to)` | Choose only explicitly approved view/pose/expression/garment states, preserving registered anchors. |
| `engine/art_bridge/temporal.mjs` | `compileMotionTracks(actions,shots)`; `stateAtFrame(f)` | Compile action graph to deterministic frame-indexed or analytic tracks; do not integrate history-dependent simulation inside the renderer. |
| `engine/art_bridge/scene_graph.mjs` | `composeShot(shot,registry,tracks)` | Build semantic owner tree, camera bands, masks, occluders, effects and attention events. |
| `engine/art_bridge/transitions.mjs` | `compileTransition(from,to,contract)` | Bind OUT/MIDDLE/IN asset and anchor correspondence, lens/rim/occlusion, or explicit motivated cut. |
| `engine/art_bridge/lighting.mjs` | `applyApprovedLighting(owner,state,frame)` | Animate authored material/shadow planes only within approved light/view validity. |
| `engine/art_bridge/art_requests.mjs` | `missingArtJobs(errors,context)` | Produce exact source-conditioned GPT art tasks and resumeable dependencies; no substitute art. |
| `engine/tools/art_bridge_qa.mjs` | `qa --manifest PATH --scene ID --out DIR` | Render a motion witness, inspect metadata/errors/scene coverage/contacts, output machine and visual-review artifacts. |

Names are new *proposed* files, not claims they already exist. Their semantics and test contracts are binding; if the live repo has an equivalent, preserve the existing path and document the correspondence in `BASELINE.md`.

### 5.2 Image part → live SVG joint: exact construction

Use `<image>` in the actual SVG scene under a dedicated joint `<g>`. The image remains the original approved pixels; SVG is only a placement/compositing container. For a part with canonical crop origin `(cx,cy)`, canonical pivot `(px,py)`, crop dimensions `(w,h)`, its **joint-local** image rect is `(cx-px,cy-py,w,h)` in canonical units. Apply the explicit `asset_to_canonical` affine transform first if dimensions or coordinate frames differ. Never auto-center on the alpha bounding box.

Example **reference operation**, with escaped strings and one owner for transforms:

```js
// Reference for engine/art_bridge/svg_parts.mjs; adapt only for actual manifest fields.
const xml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const finite = (value, name) => {
  if (!Number.isFinite(value)) throw new Error(`INVALID_NUMBER ${name}`);
  return value;
};
export function emitSpritePart(p, a, href, prefix) {
  if (!a || !href) throw new Error(`MISSING_ART_ASSET ${p.asset_id}`);
  const [cx, cy, w, h] = a.canonical_rect;
  const [px, py] = a.pivot_xy;
  [cx, cy, w, h, px, py].forEach((v, i) => finite(v, `${a.id}.${i}`));
  if (w <= 0 || h <= 0) throw new Error(`IMAGE_DIMENSION_MISMATCH ${a.id}`);
  return `<g id="${xml(prefix + p.id)}-paint">` +
    `<image id="${xml(prefix + p.id)}-image" href="${xml(href)}" ` +
    `x="${cx-px}" y="${cy-py}" width="${w}" height="${h}" ` +
    `preserveAspectRatio="none"/></g>`;
}
```

Implementation requirements:

- `href` must be a validated package-local URL generated by the registry, never arbitrary markup or unchecked `../` paths. Asset bytes must be available to the same HTTP origin as the rendered compositions, or in a verified embedded data URI if explicitly required. Preload/decode before frame capture; no frame-dependent network fetch.
- The emitter **does not** add a second joint transform. The parent `<g id="...joint">` from the rig owns the transform; its child paint wrapper is static. Non-identity `asset_to_canonical` is applied in a **static nested wrapper**, not by overwriting the joint's runtime transform.
- Use image dimensions/alpha of the actual file, not name-based assumptions. Preserve subpixel placement and antialiased transparent edges. Confirm transparency by compositing over both light and dark temporary checker plates.
- Prefix every DOM ID with film/scene/rig/part namespace; fail duplicate IDs. Never reuse an ID between two simultaneously loaded compositions.
- Rendering asset order is solved from explicit occlusion constraints. If near fingers must appear over a prop while palm is behind, create a **registered artwork proxy attached to the same hand joint**, with only the near-finger approved asset. Never duplicate the entire hand as two independent transforms.
- The camera transforms a dedicated ancestor `<g>`; world and rig transforms live below it. Do not set camera transforms on `S.k`/`MN.rig` targets.

### 5.3 Movement-class compiler — no silent substitutions

Implement a deterministic dispatch on `action.mode`:

1. `RIGID`: approved whole part/prop rotates/translates/scales within declared ranges. No silhouette deformation or out-of-plane turn.
2. `ARTICULATED`: existing nested rig transforms, with real cropped parts, paint overlaps, joint caps/underpaint and range limits. Good for small/mid-range motions with approved visibility. **Never use the old generic `limbPath` as a replacement for GPT's rendered sleeves or legs.**
3. `REGISTERED_CELS`: complete approved drawings at semantic poses (anticipation, contact, action peak, follow-through, recovery). Evaluate a documented state index from root travel and event timing; preserve ground/contact anchors across states. Require added intermediate cels if a swap is visibly discontinuous.
4. `REGISTERED_MORPH`: only homologous source-authored vector path structures with matched topology, point correspondence and registered features. For images without compatible geometry, **do not** call NU's naive numeric `mixPath`. Fall back only to a separately approved `REGISTERED_CELS` action specification, or request new art.
5. `EXPLICIT_DEFORM`: requires a pre-approved deformation map/track and allowed shape range, or a dense sequence of registered deformation artwork. No universal elliptical/mesh warp fabricated by Claude. When the actual state cannot be interpolated without tearing or changing identity, return `MISSING_ART_ASSET` describing the missing deformation state.
6. `PROCEDURAL`: numeric geometry/path/particle *motion* computed from a pre-approved vector symbol and semantic mechanism. The method may adjust quantities, locations, opacity, masks and curves; it must not invent a new artwork family or arbitrary scientific claim.
7. `CAMERA_WORLD`: transform named depth/viewport owners; enforce camera footprint, overscan and true occluder availability, especially for dramatic zooms.
8. `TRANSITION`: execute the approved correspondence and OUT/MIDDLE/IN art, or a declared `CUT`; no unmatched crossfade pretending to be continuous perspective.

Every action is routed exactly once. An unsupported class or missing valid state edge is a build failure linked to the actual shot and frame interval, never silently reduced to `RIGID`/`scale`/`fade`.

### 5.4 Contact-aware rigging and physical behavior

Implement contact ordering as **pose intent → contact graph → constrained solution → artwork state selection → rendered transforms**, not a freehand body pose followed by a decorative touch check.

- **Two-bone IK:** shoulder/hip = `A`, target wrist/ankle = `T`, lengths `L1,L2` from approved rest rig. Feasible distance: `|L1-L2| ≤ ||T-A|| ≤ L1+L2` minus explicit joint-limit margin. Compute two bend branches, choose the approved pole vector, enforce angular limits. An impossible target is `UNREACHABLE_IK` with required displacement, not a clamped accepted solution. Do not silently stretch limbs.
- **Grip:** object defines a local socket; its world transform computes the hand target. Contact interval locks hand socket to prop socket within declared `allowed_error_px` on **every sampled frame**. Hand artwork must include near fingers, palm and far fingers at the correct layer depths. Grip's opening/closed state is a registered asset, not a procedural finger ellipse.
- **Body compensation:** if a hand cannot reach, apply only preapproved root/torso adjustments bounded in the action contract; recompute the solver. If none is permitted, request new staging/pose art.
- **Foot plants:** during stance interval, target foot world position remains fixed while pelvis and body move. A walking action can use distance-indexed registered full-body gait cels (preferred when silhouette changes substantially), with root travel controlled separately. No invisible teleporting of the grounded foot during cel switches.
- **Weight and momentum:** anticipation, contact, impulse, settling and follow-through are separate event states on exact frames. Hair, cloth and loose objects use deterministic functions or baked spring tracks triggered by primary motion, and never lag through invalid occluders.
- **Mechanisms:** hinge, slider, wheel, gear train, belt, cable and connected input/output constraints derive dependent transforms from the declared control. Exact physics relationships are supplied by the explanatory action contract; decoration never substitutes for causal function.
- **Collisions:** for a declared interaction, test contact geometry and event ordering. The system does **not** assume a general-purpose physics engine for all of animation. If a shot needs dynamics, simulate at fixed step from a canonical initial state, bake the trajectory, then render `stateAtFrame(f)` deterministically.
- **Face/gaze:** use registered view-dependent skull/eye/brow/lid/mouth parts and expression states. Eyes may translate **only inside their owned eye surface**; facial acting includes coordinated changes to lids, brows, cheeks and mouth where required. Do not paste front-view eyes onto a rotated head plate.

### 5.5 Lighting and shading preservation

- Never apply the old universal shifted-silhouette crescent shader to finished image art. Approved image material planes retain their authored position/shape. For movement, choose from approved `STATIC_BAKED`, `ATTACHED_LIGHT_PLANE`, `VIEW_LIGHT_STATE` or `PROCEDURAL_EFFECT_MASK` modes.
- `STATIC_BAKED`: preserve exact image pixels; use only where camera/lighting contracts do not invalidate their source direction.
- `ATTACHED_LIGHT_PLANE`: a **separately authored alpha layer per material/region**, bound to its parent joint. Its transform may respond to approved changes but not slide as a whole unrelated global crescent.
- `VIEW_LIGHT_STATE`: select edited shade planes per approved facing/light condition; interpolate only when assets support it.
- `PROCEDURAL_EFFECT_MASK`: animate a GPT-authored emitter/receiving area/occluder mask for a physical glow or illumination event. Falloff and intensity may be numeric; masks and appearance remain authored.
- Shadows cast onto a different surface must use an explicit occluder/receiver pair and world-space relationship, with directional consistency. Missing receivers are not replaced by random oval shadows.

### 5.6 World, camera and transition rules

- Separate background, midground, focal actors and foreground into depth owner groups; all moving set dressing must be its own part/state. A static backdrop may legitimately hold only if the shot's action makes causal sense without moving it.
- Validate the entire camera swept viewport against actual painted overscan at its maximum pan/zoom/rotation; a camera cannot reveal an unpainted back face. Large viewpoint changes require separately authored world views; planar 2.5D parallax is **not** a general 3D reconstruction.
- A nested window/screen/portal needs exterior shell, complete interior world, aperture mask, and an occluding near rim. In/outer camera coordinate transforms and anchoring are explicit.
- Transitions preserve a declared invariant: common object, path, quantity, boundary, direction or attention anchor. Draw OUT/MIDDLE/IN states or choose an honest cut where no physical relationship exists. Never dissolve two unrelated AI plates and claim a continuous zoom.
- Avoid excessive camera movement: shot contract defines what newly visible relation justifies the move, attention handoff and recognition hold. A static camera with rich coordinated object motion is often correct.

### 5.7 Temporal evaluation, render path and audio

- Use frame integer `f` as the source of truth. `stateAtFrame(f)` computes all owner transforms/state IDs and event opacity. The runtime receives `S.render(f/60)` or equivalent time-seeked timeline. No cumulative frame loops inside `S.at`.
- Precompile physics, path arc-length samples and secondary response tracks as files with seeds, fixed step and provenance so random-seek output is identical.
- Asset decoding is preloaded once. No per-frame image generation, file IO or network download. Browser captures are deterministic and assets fully loaded before HyperFrames records a frame.
- Preserve the actual approved SVG/PNG layers; HyperFrames captures at 1920×1080 and 60fps; FFmpeg output must be checked with `ffprobe` to contain `7200` frames and correct duration/size. Adjust renderer config from old 30fps where required; do not double 30fps frames and call it fluid motion.
- Narration must have actual recorded audio and word/phoneme timing; rough sentence averages are not enough for critical impact beats. Audio events bind to frame-indexed actions. A muted scene can pass animation QA but not finished film QA.
- Add continuous velocities across connected shots: carry actor/world motion and camera tangents through a cut only when narrative continuity requires them; use authored easing for actual anticipation/settle, not one generic ease-in-out on every shot.

### Stage 2 acceptance — demonstrate actual motion, not placeholders

1. Real approved transparent image part renders in `<image>` under a moving joint and is pixel-identical in its rest pose (allow only documented color conversion / resampling).
2. Parent rotation moves its child pixels and sockets together; local pivots match registered landmarks at all tested angles.
3. Real hand grip remains locked through a full prop action; near and far art layers correctly cross prop boundaries. An intentionally impossible reach produces `UNREACHABLE_IK`.
4. Foot remains planted during a stance interval; a gait-state switch does not jump the foot/contact anchor.
5. At a hard elbow bend, approved sleeve art and underpaint maintain a coherent silhouette with no holes. If not, the renderer must request a different cel/deformation state.
6. Face view and expression switches retain skull/eye/mouth identity and silhouette correspondence, not merely pupil animation on a sphere.
7. A moving camera reveals registered background/foreground, but no blank camera rectangle or incorrect transform ownership.
8. An OUT/MIDDLE/IN world transition truly changes viewpoint/representation while maintaining its shared anchor.
9. Order-independent renders of the same frame have identical pixels within a documented lossless rendering path. No JS exceptions or missing asset fetches.
10. An approved procedural diagram with physical cause and response works through the supplied art symbols, not default hand-drawn placeholder controls.

**Gate:** All mechanisms needed for the selected 120-second film must be either implemented and demonstrated or explicitly listed as missing before art manufacturing proceeds. No fake green from unit tests on primitive-only fixtures.

## 6. Stage 3 — connect real GPT-owned artistic production

### 6.1 The real source-to-image chain

1. Read the installed current five-film F01–F80 skill, not the legacy version; honor `COMPLETE_FILM_ART_ORCHESTRATION`, `TRANSFERABLE_MOTION_DIRECTION_GRAMMAR`, `VISUAL_CLUSTER_ATLAS_AND_DECODING_LOOP`, `MOLECULAR_CONSTRUCTOR_F57_F80`, `FIRST_PASS_VISUAL_CONTROL`, `CHARACTER_FAMILY_CONSTRUCTOR`, `AUTONOMOUS_VISUAL_PRODUCTION_LOOP` and `REPAIR_LEARNING_TO_FIRST_PASS` as applicable. Read all referenced required files before original art generation.
2. Start from the **actual approved** `script + experience + 60-fps shot/event/frame score`. Derive motion requirements BEFORE asking GPT for art. For every state, write what rotates, contacts, becomes newly visible, bends, needs underpaint, crosses a foreground owner or changes representation.
3. Lock the identity registry: canonical characters, props, machine assemblies, world planes and diagram symbology. The first generated master becomes canonical only after whole-look approval; related views must be source-attached edits/derivations using this approved pixel identity. Never generate unrelated lookalike identities per shot.
4. Route all applicable F-methods by actual family, viewing distance, material, function, viewer proof and scale. Create actual `first_pass_control`, `molecular_visual_decisions`, `palette_roles`, `density_and_focus`, `causal_frame_geometry`, parent topology, mask ownership and exact ArtJob image requirements.
5. Compile using the existing `scripts/prepare_first_pass.py` and the film's `learning/REPAIR_MEMORY.json`; verify the generated `IMAGEGEN_REQUEST.json`. Ensure at least two relevant, *unlike* native STYLE-ONLY source witness images and the canonical identity/edit reference are actually included in the provider call where applicable. Verify real paths and hashes; a prompt mentioning a named source frame is **not** an attached image.
6. Call an actual GPT image-generation/edit provider in the environment where one is available. **Claude Code must not pretend it owns a provider it cannot call.** If no provider is configured, export the exact queued ArtJobs, marked `WAITING_FOR_GPT_ART`, and stop only the dependent art branch; do not fabricate PNGs or register nonexistent files. When GPT outputs arrive, re-run their measured registration and frame-coverage compiler automatically.
7. Preserve actual `request → image file → hash → inspected pixels → repair → approved image` chain. Never count a written prompt as a generated asset; never count the canonical pose as coverage of missing profile/hand/view/camera states.
8. Manufacture art in dependency order: canonical recurring character/prop → required views and contact poses → world clean plates and moving layers → mechanisms/diagram glyphs/type/masks → underpaint and occluders → OUT/MIDDLE/IN transition views → scene-specific acting states. No fixed 7-image inventory cap.

### 6.2 ArtJob fields added for motion compatibility

Extend the existing ArtJob **additively** with:

```
motion_context: {
  identity_id, canonical_parent_asset, shot_ids[], frame_ranges[],
  view_id, pose_id, expression_id, required_continuity_landmarks[],
  required_joint_pivots[], required_sockets[], contact_type,
  alpha_requirement, hidden_surfaces_to_paint[], near_far_order[],
  camera_footprint, oversized_paint_rect, lighting_validity,
  target_motion_mode, predecessor_state_id, successor_state_id,
  why_this_drawing_is_needed
}
```

If any of these are not applicable, encode an explicit `null` plus reason in the detailed job receipt; do not silently omit a required field and hope a downstream model guesses it.

### 6.3 Asset manufacturing, not just image generation

The art producer must actually provide:

- **Master:** one approved whole identity with canonical shape, silhouette and materials.
- **Rigged cutouts:** approved per-joint regions with transparent backgrounds, actual hidden continuation under overlaps and exact canonical mapping. Where cutout reconstruction would compromise contour quality, supply coherent complete pose cels instead.
- **Faces:** authored front/three-quarter/profile/rear where necessary, each with actual face planes/hair masses and registered eye/mouth/expression families at the output scale. Never reuse a frontal face map unchanged on a profile plate.
- **Hands:** grip/open/point/release/contact drawings matching the physical prop and pose, with palm, thumb, fingers, and appropriate near/far subsets. Exact targets/handle radius come from the action contract.
- **Clothing/organic motion:** approved bend, fold, stretch, hair and soft-body states matching shot extrema and intermediate silhouettes. No procedural tube or universal wedge folds as a substitute.
- **Worlds:** correct layered and extended plates; moving elements as separate parts, visible underpaint behind them, foreground occluders, interior/exterior portal artwork, and unique projected views if camera motion reveals genuinely new surfaces.
- **Machines:** named functional parts, sockets, controls and actual input/process/output relationships, material planes, moving states and connected mechanisms.
- **Diagram/effect art:** approved glyphs, vector paths, colors, labels, boundary masks, particle symbols, luminescent material accents and alternate scientific states. Renderer calculates motion from them; it does not invent the visual language.
- **Transitions:** true OUT/MIDDLE/IN artwork, correspondence anchors, camera masks and overscan for each transition whose content cannot be obtained by rigid transforms of existing assets.

For exact text, favor GPT-approved typography/vector/font choices with reproducible font availability; do not rasterize an entire scientific label if it must change digits during playback. Instead supply the approved type family/appearance, text content/position and style vectors, and let code update only the actual characters/values under the verified font.

### 6.4 The positive learning loop (not an afterthought)

On a real mismatch:

`wrong visible pixels or motion state → earliest producing decision → unlike source/native counterexample → exact corrected ArtJob/identity/geometry/rig field → actual changed pixels or motion → next-first-pass compiler update`.

Distinguish:

- `ART_DIRECTION_ERROR`: wrong visual proposition, source method selection or audience proof; fix master/ArtJob before dependent states.
- `PROVIDER_EXECUTION_ERROR`: correctly specified desired art failed to materialize; edit/regenerate against canonical reference, verify actual pixels.
- `REGISTRATION_ERROR`: correct pixels bound to wrong pivot/crop/space; fix metadata/compiler, **do not** regenerate the picture.
- `RIG_OR_CONTACT_ERROR`: wrong IK, locomotion, collision or overlap; fix engine and staging within approved bounds.
- `MISSING_ART_STATE`: the motion requires new pixels; export the exact GPT job and resume after it is produced.
- `TIMING_OR_DIRECTION_ERROR`: actions occur in the wrong causal/attention order; correct event frame score and rerender; don't add random decoration.

After a demonstrated image repair, use `scripts/repair_learning.py record` with actual before/after files, applicability and positive construction operation; compile every subsequent matching ArtJob with `--repair-memory` and verify `applied_repair_rule_ids`. Distinguish identity-local from conditional family learning. Do not claim the installed global skill has changed unless it actually has.

### Stage 3 acceptance

- At least one **approved polished character identity** with its actual cutouts, expression/view/contact states exists and is correctly registered; the output matches the approved master, not a separately invented code cartoon.
- A distinct original environment and mechanism family are generated from relevant style-conditioned requests and have actual part/clean-plate/alpha/camera contracts.
- The producer actually receives native style witnesses and master/edit reference; receipts prove the calls and resulting pixels.
- Each state needed by the qualification scene has real files, alphas, landmarks, pivots, masks/underpaint and derived identity proof.
- Removing a high-impact F-art choice or source attachment in a controlled qualification changes the intended output class; fabricated self-declared provenance does not pass.
- An actual repair changes the **next matching** provider payload and produces a new inspected pixel output; a report-only lesson does not pass.
- No unapproved image or generic code-art substitute enters the render manifest.

## 7. Stage 4 — production qualification and full 120-second execution

### 7.1 Whole-film plan BEFORE final art manufacturing

Use the user's already approved script/direction if present; do not write an unrelated replacement narrative. Preserve Experience Director V1 order:

1. Story-truth and claim ladder: precise facts, uncertainty, wrong interpretations.
2. Spectator journey: BEFORE → question/pressure → moving visual proof → inference/feeling → NEXT question.
3. For each hard concept, compare three **moving** explanatory inventions; choose for causal legibility and audience understanding, not ease of image generation.
4. Identity/world atlas: recurring canonical humans/props/mechanisms, representation types, projection axes, depth and camera validity.
5. Shot/event master: every 60-fps interval with entry, anticipation, causal action, contact, consequence, reaction, secondary behavior, attention path, reading interval and exit.
6. Transitions: explicit OUT/MIDDLE/IN state artwork, semantic invariant or motivated cut.
7. Audio: real narration/silence/word cue timeline; music and causal SFX map.
8. Art dependencies: all canonical plates, state families, masks, occluders, underpaint, camera footprints and responsive symbols.
9. Compiled shot and motion manifest: exact owner actions and constraints; render readiness checks.

No film-level success claim is based on a still-only animatic, beauty shots, seven hero images or a technically valid manifest.

### 7.2 Decisive integrated qualification (not a toy animation)

Select the **actual hardest representative contiguous scene interval** from the planned 120-second film, covering as many critical mechanisms as the film requires. It must contain a source-approved polished character, a multi-joint reach and prop grip, torso/weight/face reaction, approved sleeve/hand/face states, an operating machine or causal field, simultaneous environmental life, perspective or camera movement, occlusion and a real connection to the next representation, with recorded narration and an exact sound event. Do not build a generic scientist-and-circle scene that makes none of these demands.

Also qualify a **different, unfamiliar visual family** (e.g. dense machine/world plus an abstract transition) so success cannot be explained as a single character's bespoke rig. These qualification scenes are **part of the actual film when appropriate**, not unrelated wasted mini-tests.

Render true 1920×1080 60fps frames and their synchronized audio. Inspect: full-speed playback, silent playback, image sequences around contacts, several consecutive frames across each state switch, normal and 1/10 screen scale, camera sweep and transition strips. Compare entire visual language, not only seam counts.

If any major human-action, material, camera or explanatory quality fails: map to the earliest faulty producing stage, fix the shared capability or source asset, rerender both affected and unrelated qualification scenes. Do not accept one shot because 80 registry entries say PASS.

### 7.3 Full two-minute production

- Assemble all 120 seconds only when their dependency graph has actual art and motion states. Generate no fixed artificial number of images; manufacture each needed asset family once, with variants as demanded by action complexity.
- Render every frame from the deterministic action graph. `fps=60`, `total_frames=7200`, source dimensions 1920×1080, correct alpha and no unexplained black intervals.
- Preserve motion continuity and purposeful active behavior. Deliberate holds are valid when the focus rests; repetitive slideshow-like panel pans are not a substitute for operating events.
- Audio is locked to the actual voice track; critical impact and label events use measured word cues, not guessed speech durations.
- Run mechanical and artistic reviews, then repair causal upstream defects in any failed span before completing the package. Retest any shared method's earlier passed use after a global change.
- Deliver `MP4`, editable scene/motion files, frame score, complete art/rig/state manifest, asset ancestry and hashes, final render receipts, failures addressed, learning records, audio timing, and honest `PRODUCTION_STATUS.md`.

### 7.4 Concrete acceptance commands to implement

These commands are **required CLI interfaces**; create them if missing, wire to real tests and preserve their nonzero failure behavior:

```bash
node engine/tools/art_bridge_check.mjs check --root films/PROJECT_ID --manifest films/PROJECT_ID/handoff/ART_AND_MOTION_MANIFEST_V2.json --json films/PROJECT_ID/qa/manifest_v2_report.json
node --test tests/art_bridge/*.test.mjs
node engine/tools/art_bridge_qa.mjs qa --manifest films/PROJECT_ID/handoff/ART_AND_MOTION_MANIFEST_V2.json --scene QUALIFICATION_SCENE_ID --out films/PROJECT_ID/qa/hybrid_v2
```

Use actual project/scene IDs in executed commands; `PROJECT_ID` and `QUALIFICATION_SCENE_ID` above are interface examples only, never filenames to fabricate. Verify render output with an actual media probe, not a guessed CLI success message. Provide a programmatic result file with `stage`, `pass`, `evidence_paths`, `missing_capabilities`, `missing_art`, `unverified_artistic_decisions` and exact affected frames.

### 7.5 Negative and causal proof matrix

Every proof fixture has both an intentionally failing and succeeding construction. A proof with zero real perturbations is INVALID (historical F49/F50 error). Reading a field solely for validation does not count as a drawing consumer (historical F53 error).

| Failure injection | Required outcome |
|---|---|
| Delete one approved hand asset | `MISSING_ART_ASSET`, exact ArtJob; no procedural hand |
| Move wrist pivot without moving pixels | Detected landmark mismatch; fail before scene acceptance |
| Ask a hand to reach beyond approved limb lengths | `UNREACHABLE_IK`; no silent clamp |
| Remove elbow underpaint in a deep bend | `MISSING_UNDERPAINT` or visible seam refusal |
| Turn a front-only character to profile | `UNSUPPORTED_VIEW`; request matching view art |
| Morph two unrelated SVG command topologies | `INVALID_MORPH_TOPOLOGY`; no numeric path nonsense |
| Remove an approved source witness from an art request | Provider payload/evidence failure; no fake source attachment |
| Register method as "used" without code/provider consumption | `METHOD_NO_REAL_CONSUMER` |
| Put camera and rig tracks on same SVG node | `INVALID_TRANSFORM_OWNER` |
| Delete transition middle art | `MISSING_TRANSITION_STATE`; no arbitrary dissolve |
| Pan camera beyond painted art | `OUTSIDE_CAMERA_FOOTPRINT` |
| Random-seek to frame 500 after frame 1000 | Identical result to direct seek / linear frame capture |
| Remove light receiver/underpaint | Actual compositing failure; not arbitrary oval shadow |
| Break a word cue | `MISSING_WORD_ALIGNMENT`; critical event cannot be certified |
| Introduce one static master for every acting state | State coverage remains missing; not automatically passing |

### 7.6 Quality review: real aesthetic standards, no false automated promises

Two separate signoffs are mandatory:

1. **Mechanics:** continuous tracks, contact, pivots, masks, footage metadata, audio, asset lineage and determinism are verified by code and rendered evidence.
2. **Whole-look artistry:** native-resolution render is reviewed for original source-conditioned contour character, material-specific palettes, facial design, identity coherence, silhouettes, clean overlaps, lighting, spatial rhythm, camera/attention meaning and animation quality. This is an *observed artistic judgment*, not a formal theorem. The reviewer may reject despite mechanical PASS. Correct the originating art or action, not an isolated cosmetic symptom.

The final status can be `QUALIFICATION_PASSED` and `FULL_RENDER_REVIEWED` only after genuine outputs exist. If a model cannot generate an essential art state in available resources, state the exact blocker and persist the partial files; never declare readiness or replace it with a primitive drawing.

## 8. File deliverables and continuous handoff

The finished implementation (not just these design notes) must produce at least:

```
hybrid_v2/evidence/BASELINE.md
hybrid_v2/evidence/IMPLEMENTATION_DIFF_MAP.md
hybrid_v2/evidence/STAGE_1_CONTRACT_PROOF.json
hybrid_v2/evidence/STAGE_2_MOTION_PROOF.json
hybrid_v2/evidence/STAGE_3_ART_PROOF.json
hybrid_v2/evidence/STAGE_4_FILM_PROOF.json
hybrid_v2/evidence/COVERAGE_F01_F80.json
hybrid_v2/evidence/OPEN_DEPENDENCIES.json
schemas/motion_art_manifest_v2.schema.json
engine/art_bridge/*.mjs
engine/tools/art_bridge_check.mjs
engine/tools/art_bridge_qa.mjs
tests/art_bridge/*.test.mjs
films/PROJECT_ID/handoff/ART_AND_MOTION_MANIFEST_V2.json
films/PROJECT_ID/handoff/CLAUDE_RENDER_INSTRUCTIONS.md
films/PROJECT_ID/learning/REPAIR_MEMORY.json
films/PROJECT_ID/qa/hybrid_v2/
HANDOFF.md
CLAUDE.md
```

Replace `PROJECT_ID` with the actual production ID. Do not overwrite the original film, user content or installed skill research. `HANDOFF.md` and `CLAUDE.md` must record the full architecture, exact commands, implemented functions, current stage, real passing and missing evidence, next action and any unresolved authorization/provider blocker. Commit user-authorized staged progress in recoverable checkpoints with concise messages; avoid bringing caches, secrets, MP4s or archives into a source commit.

## 9. Exact execution order and stop conditions

1. Reconcile current source and checkpoint; write baseline map.
2. Implement, test and green **Stage 1** contracts and graph.
3. Implement, test and visually qualify **Stage 2** runtime/asset binding and contact/view/camera machinery.
4. Establish real **Stage 3** GPT ArtJob compiler → provider → pixels → registration → learning chain. If actual GPT imagery cannot be generated from Claude's environment, export `WAITING_FOR_GPT_ART` queue with precise file/image requirements and continue all independent code work. This is a real external dependency, not permission to fake the art stage.
5. Build actual 120-second direction and asset dependency graph or reuse approved existing one; qualify the hardest integrated contiguous motion sequence and a unlike family (**Stage 4 qualification**). Repair producing causes.
6. Produce complete 120-second film, 7200-frame export, audio and editable package after all required real art exists; run whole-look review.
7. Update status documents and handoff. No stage may be marked complete by a ledger string, an empty proof list, a static still, a test fixture or an unrendered promise.

If a phase is truly blocked by missing provider access, permission, actual approved art or unavailable live files, state `BLOCKED` with exact dependency and stop only affected branches. Do not restart from scratch, wait indefinitely, expand scope silently or claim that a fresh session has inherited unrecorded knowledge. If the Claude session ends, next session must read `CLAUDE.md`, `HANDOFF.md` and this spec and resume the earliest unresolved task.

## 10. What the team must **not** claim

- A single PNG plus `S.k` is a sophisticated character rig.
- A beautiful master automatically contains unseen back faces, elbow underpaint, every hand pose or every facial turn.
- Passing 80 mechanical method records proves style quality.
- A universal procedural contour or crescent shader replaces the actual source-conditioned artistic design.
- A 60-fps video file proves fluid, meaningful animation.
- A code success message proves the user received the intended full-look art.
- Claude can obtain GPT-authored production pixels without a real available image-generation/edit provider or user-provided approved files.
- One execution session guarantees completion irrespective of available resources and provider limits.

The objective is a dependable production bridge that can **finish the task with correct art and motion** or point to one precise missing dependency, never silently lower the visual standard.

## 11. Implementation appendix — missing low-level decisions are not delegated to artistic guesswork

These requirements close specific historical failure paths. An implementer may select library internals compatible with the live repo, but may not change the externally observable behavior or replace missing art with improvised artwork.

### 11.1 Concrete per-frame state-evaluation algorithm

Use one immutable compiled animation plan. `compileMotionTracks` rejects conflicting owner assignments, unknown sockets, invalid frame ranges and unsupported state transitions. It outputs sorted, half-open intervals indexed by shot/action/owner; evaluation does **not** scan or mutate prior frames. The evaluator performs the following steps in this exact causal order:

1. Map integer `f` to active shot and overlapping transition; assert exactly one dominant shot (intentional transition can composite two with explicit weights).
2. Evaluate approved world/camera/prop input tracks and all primary character root trajectories at frame `f`.
3. Compute target contact sockets and active constraint graph from interval membership (`start <= f < end`).
4. Solve approved root compensation, FK/IK branches and joint limits. If no feasible solution exists, emit a failure with exact frame, target displacement and the responsible action.
5. Resolve registered view/pose/expression/garment/cel states and approved state-edge timing. State changes are functions of track/event values, never of a previous frame's mutable last-state variable.
6. Resolve world transforms for every named joint and socket; derive **all** render-pass matrices, including far/near finger paint passes, from this one transform cache. Do not animate a duplicated near-finger pass independently.
7. Evaluate baked cloth/particle/secondary tracks and authored lighting/occlusion/effect masks.
8. Apply distinct group transforms and visibility to actual DOM nodes. A transform owner is written exactly once for this `f`.
9. Verify required assets ready, finite matrices and declared contact errors; report failures to QA and keep frame inspection available.

Reference dispatch shape:

```js
export function stateAtFrame(compiled, f) {
  if (!Number.isInteger(f) || f < 0 || f >= compiled.totalFrames) {
    throw new RangeError(`INVALID_FRAME ${f}`);
  }
  const shot = compiled.shotAt(f);
  const primary = compiled.evalPrimary(f, shot);
  const contactGraph = compiled.contactsAt(f, primary);
  const constrained = compiled.solveConstraints(f, primary, contactGraph);
  const artStates = compiled.resolveApprovedArtStates(f, constrained);
  const matrices = compiled.forwardKinematics(constrained);
  const passes = compiled.resolvePaintPasses(artStates, matrices);
  const secondary = compiled.evalBakedSecondary(f, constrained);
  return Object.freeze({ frame: f, shotId: shot.id,
    artStates, matrices, passes, secondary,
    camera: compiled.cameraAt(f), events: compiled.eventsAt(f) });
}
```

The method names above are required *semantic* operations; the exact live implementation may combine them only if each behavior retains independently testable inputs/outputs and structured error reporting. Do not duplicate an entire scene at two opacity levels to imitate a state transition.

### 11.2 Image extraction and canonical registration — a first-class producer

An image generated against a reference **does not automatically have pixel-aligned joints or alpha**. Build `engine/art_bridge/registration.mjs` with:

`registerPart({master,rawPart,regionMask,canonicalLandmarks,cropRect,pivotId,underpaintIds}) -> {approvedPartFile,asset_to_canonical,landmarkResiduals,alphaReport,overlayFile,registrationReceipt}`.

Mandatory algorithm:

1. Read real source image dimensions, alpha and orientation. Standardize all source pixels to a declared sRGB interpretation; do not silently turn JPEG backgrounds into alpha by a naive color threshold.
2. Establish canonical landmarks on the approved master, including fixed anchors for joint sockets and moving border crossings. Source points may come from a human-reviewed overlay or a visual landmark proposer, but must be approved against actual pixels.
3. Make masks by explicit region ownership. A segmentation proposal is **not** accepted as truth until a reviewer checks the source plate at full resolution and every moving boundary. Do not infer hidden backside pixels from a flat crop.
4. Solve the allowed affine `asset_to_canonical` from corresponding landmarks (three noncollinear anchors when a full affine is required; similarity transform if only rotation/scale/translation is permitted). Reject degenerate anchors and out-of-bounds warps. Record per-anchor residuals in canonical pixels.
5. If a part moves away from an occluder or bends and reveals missing content, create an **explicit source-attached GPT edit/outpaint job** for underpaint. Do not fill the hole by stretching neighboring pixels or painting flat skin-color geometry.
6. Composite the part back over the approved master in rest pose, using correct masks and paint order. Record a before/after overlay and a difference image. Reject drifting contour, color seams, dislocated features or edge fringes as an artistic registration failure even if coordinate errors are small.
7. Export a lossless PNG (or validated source-authored SVG) with actual alpha and a permanent registration receipt. Bind the hash and approved overlay receipt to the asset manifest; any pixel or landmark edit invalidates dependent reviews.

The part-local image rectangle, cropped PNG source pixels, `asset_to_canonical` and pivot coordinates must be unambiguously related. A crop rectangle describes **which source pixels** to display; a canonical rectangle describes **where they belong**. They are distinct fields, not two names for the same value. Add `source_pixel_crop` and, where needed, `crop_to_canonical_matrix` to the schema, and test each using unequal crop sizes and nonzero origins. Validate overlay on a transparent checker, a contrasting color checker, and the original master.

### 11.3 Occlusion compositor and visibility state algorithm

- Build a paint-pass DAG per shot: background → far arm/fingers → prop behind hand → palm/near arm as designed → near fingers → foreground occluders. Real stacking can differ by shot/view; resolve explicitly with state-dependent order constraints. If a cycle appears, **split authored cutout ownership** into separate approved visible subparts or request new registered pose art. Do not break a cycle arbitrarily by changing `z`.
- Compute a unique matrix per semantic joint in `stateAtFrame`; if that joint paints in both rear and front strata, each paint instance reads the same matrix and same asset-state ID. The matrix is not animated twice.
- Draw-order state switches require an approved transition frame or complete cel where visible surfaces change. Detect hand passing in front of/behind a prop as an actual topological visibility change.
- For any 2D occlusion, test a sequence of frames immediately before, during and after the crossing at full size. Detect opaque fringing, ghosted previous cels, holes and falsely visible hidden surfaces.
- The renderer must not try to reveal the rear of a flat asset by rotating a 2D picture past its approved facing range.

### 11.4 Motion state inventory and regeneration trigger

Do **not** generate a fixed canonical 8-direction turntable for every entity: it wastes time, can damage identity and still misses required poses. Derive inventory from the actual action graph:

| Motion event | Required real artwork/state | What code computes |
|---|---|---|
| Reach and grasp | Open, approach, contact, closed grip, release; visible palm/far/near finger layers and sleeve bends | Wrist target, IK, grasp interval, attachment, interpolation between approved states |
| Walk/run | Approved family of support, pass, contact and recoil silhouettes or a cutout rig proven clean for that magnitude | Root distance, gait phase, stance anchor, secondary timing |
| Rotate toward camera | Approved view family and face/ear/hair visibility transitions | State selection, registered shared landmark anchoring |
| Express emotion | Coherent eyebrow/lid/eye/cheek/mouth/head states in target view | Exact acting-event timing, gaze target and permissible feature offsets |
| Bend/stretch garment | Required creases, overlap continuation, underpaint, material lighting states | Joint transforms and explicit approved deformation/pose selection |
| Machine operation | Individual painted moving parts, sockets, masks, active/inactive states | Gearing, linkages, causal input/output and synchronized event timings |
| World zoom/portal | Background extensions, foreground rims, clean plates and newly visible interior/views | Camera, parallax and opacity/occlusion from approved state graph |
| Diagram transform | Approved symbols, lines, labels and representation transitions | Quantity mapping, path/time interpolation and data-driven label updates |

For each action compile an `assetStateCoverage` matrix with dimensions `(shot, actor, interval, view, pose, expression, material light, near/far topology, camera footprint)`. Missing cells automatically export ArtJobs with the exact reason and desired surrounding frames. The system may reuse state assets only when the contract proves that the missing dimension is irrelevant. **No statistical model can know all future motion from one still illustration.**

### 11.5 Real provider adapter and provider-access boundary

Implement `engine/art_bridge/providers/image_provider.mjs` with a configuration-agnostic interface:

```ts
interface ImageProvider {
  capabilities(): Promise<{
    generate: boolean; edit: boolean; transparentRaster: boolean;
    svgGeneration: boolean; multipleReferences: boolean;
    maxOutputSize?: [number, number];
  }>;
  generate(job: ArtJob, attachments: VerifiedInputImage[]): Promise<ProviderResult>;
  edit(job: ArtJob, reference: VerifiedInputImage,
       attachments: VerifiedInputImage[]): Promise<ProviderResult>;
}
```

The adapter discovers actually configured model/API abilities; it does **not** hardcode a model name, fabricate credentials, capture a ChatGPT browser login, or silently call an unrelated image service. Before an actual image request, record `provider`, `model`, `mode`, requested dimensions/quality/transparency, `reference_hashes`, `style_witness_hashes`, payload hash, date and expected output type. For transparent raster parts, request supported transparent PNG (or WebP where lossless alpha is guaranteed), not JPEG. For editable diagram glyphs, a provider-generated SVG may be used **if the configured model genuinely supports it** and the rendered SVG meets source quality; sanitize it (no script, external references, foreign objects or non-packaged fonts) and preserve a hash of the original provider output. Never claim SVG can always be edited and regenerated like a PNG; actual API modes differ.

OpenAI's official image API documentation currently describes transparent PNG/WebP outputs and SVG generation on supported GPT-image models, but SVG edits and specific input modes have different support. Query the installed provider's actual capabilities at implementation time and use one tested code path per capability; do not infer support from a product name. For a missing provider, create `hybrid_v2/art_outbox/jobs/ARTJOB_ID.json`, source-reference contact sheets, and `hybrid_v2/art_outbox/INSTRUCTIONS_FOR_IMAGE_PRODUCTION.md`; retain exact dependency states to resume after images are placed in the corresponding `inbox/` files.

### 11.6 Data provenance and acceptance receipts — non-gamable

- Every F-method trace has `source_clause_id`, `condition_evaluated`, `decision_id`, `producer_or_request_id`, `consumer_id`, `real_asset_hash_or_track_hash`, `observed_render_frame_paths`, `causal_perturbation_fixture_id`, `verdict`. An absent applicable producer is not `IMPLEMENTED`.
- Every test record has **at least one actual perturbation** of a meaningful decision input and a changed consumer output, plus a negative invalid input. Requiring a field solely in the schema is not evidence of consumption. For image-authoring methods, evidence includes the actual provider request attachments, generated pixels and observed art difference; a code-only proof cannot close these methods.
- A QA gate must save `tested_revision`, `tested_asset_hashes`, `frame_numbers`, `exact_cli`, `exit_code`, `reference_approval_ids` and `reviewer_verdict`. A code or asset change invalidates the old verdict automatically.
- The art reviewer is asked to evaluate original style, proportions, face construction, contour quality, color/material/lighting and coherent full-body identity, **not** just whether a named failure was rejected. The review can give `APPROVED`, `REVISE_AT_ART_SOURCE`, or `REVISE_AT_RIG_SOURCE`, with attached affected frame IDs and the earliest proposed causal change.

### 11.7 Real deployment and scale constraints

For a 120-second 60-fps render, preloading hundreds of uncompressed RGBA 4K plates can exhaust memory. Design an explicit asset plan per shot: deduplicate identical bytes, atlas compatible small sprites without changing source pixels, unload only after capture segments no longer need the art, and verify that segment boundaries seek/render identically. Do not use per-frame image decode, request or DOM recreation. Render to individual frames or verified contiguous segments, then assemble with stable timestamps and a measured A/V sync check. Report frame export failures by exact frame/asset instead of silently dropping frames. Color-check alpha edges against the expected compositor background and retain a lossless intermediate for QA. If a high-zoom close-up magnifies source pixels beyond its declared scale range, request a higher-resolution source edit; never hide blur with sharpen-and-upscale pretending it is new detail.

## 12. Reference algorithms and exact proof fixtures

This section fixes numerical and contract semantics that must not be guessed from screenshots. Copy these pure algorithms where compatible, then adapt names/bindings to the live Neutrino API. Their tests must pass *before* adding a full film scene.

### 12.1 Non-clamping planar two-bone reach solver

The pose solver must reject an unreachable contact **before** the art state or rendered joint is selected. The bend sign is a deliberate input (`+1` or `-1`), driven by a view/pose contract. Position axes are in a shared 2D y-down coordinate space. This reference computes the candidate elbow; joint-limit enforcement and socket frame transforms remain additional required checks.

```js
export function solveTwoBonePosition(A, T, L1, L2, bendSign, epsilon = 1e-7) {
  const validPoint = p => Array.isArray(p) && p.length === 2 && p.every(Number.isFinite);
  if (!validPoint(A) || !validPoint(T) || ![L1,L2].every(v => Number.isFinite(v) && v > 0)) {
    throw Object.assign(new Error('Invalid IK operands'), {code: 'INVALID_IK_INPUT'});
  }
  if (bendSign !== -1 && bendSign !== 1) {
    throw Object.assign(new Error('Bend side must be approved'), {code: 'UNAPPROVED_BEND_BRANCH'});
  }
  const dx = T[0] - A[0], dy = T[1] - A[1];
  const d = Math.hypot(dx, dy);
  const lo = Math.abs(L1 - L2), hi = L1 + L2;
  if (d > hi + epsilon || d < lo - epsilon) {
    throw Object.assign(new Error('Unreachable contact'), {
      code: 'UNREACHABLE_IK', requestedDistance: d,
      minimumReach: lo, maximumReach: hi,
      missingDistance: d > hi ? d - hi : lo - d
    });
  }
  if (d < epsilon) {
    throw Object.assign(new Error('Ambiguous coincident anchors'), {code: 'DEGENERATE_IK'});
  }
  const a = (L1*L1 - L2*L2 + d*d) / (2*d);
  const h2 = L1*L1 - a*a;
  if (h2 < -epsilon) throw Object.assign(new Error('Invalid IK geometry'), {code:'UNREACHABLE_IK'});
  const h = Math.sqrt(Math.max(0, h2));
  const ux = dx/d, uy = dy/d;
  const elbow = [A[0] + a*ux - bendSign*h*uy,
                 A[1] + a*uy + bendSign*h*ux];
  return {elbow, wrist: T, shoulder: A,
    shoulderAngle: Math.atan2(elbow[1]-A[1], elbow[0]-A[0]),
    forearmAngle: Math.atan2(T[1]-elbow[1], T[0]-elbow[0])};
}
```

Fixtures required: reachable front-facing hand with both bend branches, unreachable too-far and too-close targets, an exact maximum-reach target, a degenerate coincident target, a near singularity, and a contact target inside a whole body placement that exceeds an authored shoulder limit. Test true source socket error in world pixels, not just the elbow numbers.

### 12.2 State transition proof of exact art ownership

For two registered states `A,B`, each state declares immutable `asset_hashes`, `view`, `pose`, `contact_anchors`, `occlusion_order` and `required_underpaint`. Before any edge is activated:

1. Compare source identity/master IDs, approved view transition and art hashes.
2. Verify the intersection of `landmark_correspondence` includes every pinned socket, active contact, semantic head/face anchor and environment alignment anchor.
3. If `REGISTERED_SWAP`, compute the affine anchor correction from the declared matching landmarks and apply only the approved correction limits. If the silhouette changes visibly mid-action, require approved intermediate cel(s) or explicit concealment by an occluder; a bare switch at 50% must fail.
4. If `MATCHED_VECTOR_MORPH`, verify matching closed/open contour semantics, equal command topology, hole orientation, winding, subpath counts, material owners and stable semantic landmarks. Similar point count alone is insufficient.
5. If `EXPLICIT_DEFORM`, validate that each output pixel/mesh sample maps from the approved source within authored displacement/Jacobian bounds and does not expose nonexistent hidden surfaces.
6. At edge frames `f-1`, `f`, `f+1`, compare contact anchors, visual identity and layer ordering. Code checks hard constraints; the visual reviewer judges pose drawing quality.

### 12.3 Full-resolution style transfer and art-process proof

The bridge's central artistic test cannot be satisfied by a beautiful but unrelated sample generated once. Require three unlike outputs using one consistent skill-conditioned workflow:

1. A canonical expressive human with hair/skin/garment layering and a genuine contact hand, in the required intended style.
2. A world or machine with connected functional parts, perspective/lighting and meaningful layer ownership.
3. A relational or explanatory illustration family with typography/symbols/material contrast, which cannot hide behind a character template.

For each, retain the exact source-conditioned ArtJob, two unlike *attached* native witnesses, canonical input master where relevant, resulting first-pass pixels, frame-level quality review and any source-level repair. On another novel unseen subject, show that the same compiled method policy changes the *initial* provider request and that its resulting artwork adopts the intended construction decisions. The whole-look pass is necessarily perceptual; no numerical assertion such as `80/80` alone closes this gate.

### 12.4 Frame-ranged error recovery

Errors must be grouped by root dependency so the autonomous loop does not spend hours repairing one pixel at a time. Example: if frames `1840–1910` show hand clipping, foot sliding and wrong near/far painting, first inspect the action target/pose identity and the asset layer graph; if both errors share one invalid contact pose asset, generate **one corrected pose family** rather than separate per-frame bandages. The repair planner emits an ordered issue DAG, estimated affected scene range and one upstream fix proposal, then reruns all dependent witnesses. It should avoid regenerating correct original artwork when only registration or motion binding is wrong. If an issue lacks a reliable producing cause, persist a focused diagnostic request; do not make up a cause.
