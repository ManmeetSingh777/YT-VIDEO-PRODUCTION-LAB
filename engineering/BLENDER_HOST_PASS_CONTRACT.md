# Blender host pass contract — adapter v1 (TBO-G14)

**Status:** mechanism implemented and tested on DIAGNOSTIC fixtures only. **`HOST_3D_ASSET_PENDING`**: there is no approved original host
design and no approved Blender master. Nothing here is the host, and no stand-in is ever composited into the film
(`compileHostPasses` refuses `DIAGNOSTIC_FIXTURE` provenance in a PRODUCTION run).

Code: `engine/host3d/blender_host_passes.py` (runs inside Blender 5.1, headless) · `engine/host3d/host_pass.mjs` · host layers in
`engine/art_bridge/scene_graph.mjs#composeShot` · per-frame pass decode in `engine/art_bridge/render.mjs#capture` and
`engine/film/chrome_frames.mjs#renderFrame`. Test: `node --test tests/tbo/host_pass.test.mjs` (real Blender + real Chrome, ~40 s).

## 1. One clock, one compositor
- Film frame `f` (integer, 60 fps) ↔ Blender frame `f − blender_frame_offset`. There is exactly one Blender frame per film frame and no resampling.
  `compileHostPasses` refuses any pass whose reported Blender frame differs (`HOST_FRAME_MAP_EXACT`). In PRODUCTION, every frame of
  `[film_frames)` must exist (`HOST_FRAMES_COMPLETE`).
- The host is **not** pasted on after encoding. Its SHADOW and HOST passes are `<image>` layers inside a depth band of the same SVG
  scene graph as the 2D art. Painted foreground bands and occluders cover them by normal paint order, and their `href` is written every frame
  from the hashed pass manifest.

## 2. Camera and world calibration
| Item | Contract | Verified by |
|---|---|---|
| Camera | `ORTHO`, `location`, `rotation_euler_deg` (XYZ), `ortho_scale` (spans the larger image side), `resolution` = film stage | Blender reports `matrix_world`, `ortho_scale` and resolution. They must equal the contract within 1e-4 (`HOST_CAMERA_MATCHED`). |
| World↔painting | ≥ 2 `calibration_landmarks`: `{world:[x,y,z], plate_px:[x,y]}`, where `plate_px` is a **reviewed landmark of the approved restaurant WORLD_PLANE** | Engine projection of `world` must land within 2 px of `plate_px` (`HOST_WORLD_CALIBRATED`). |
| Contact | `contact_points` (soles) as named Blender objects/empties | Blender's own projection must agree with the engine's within 0.5 px, and the contact must be within 0.01 units of the ground on every frame (`HOST_CONTACT_ON_GROUND`). |
| 2D camera | must stay at identity while a host pass is visible | `scene_graph#frameState` raises `HOST_INTEGRATION_INVALID` on any band-camera move (no sliding host) |

## 3. Passes (straight alpha PNG, one per film frame)
- `host_NNNNNN.png`: host only (ground hidden).
- `shadow_NNNNNN.png`: ground as a Cycles shadow catcher, with the host invisible to the camera but casting.
- `PASSES.json`: Blender version, `.blend` path, diagnostic flag, the camera used, and per frame `{film_frame, blender_frame, host:{file,sha256}, shadow:{file,sha256}, contacts}`.
  Any byte change is reported as `STALE_DEPENDENCY`.
- Not yet produced: depth / object-ID mattes. Ordering against 2D art uses depth band plus paint order only.

## 4. Pixel verification (`verifyHostComposite`)
This is a counterfactual check against the same frame rendered without the host:
- Host pixels under a painted occluder must be identical to the no-host frame (`HOST_OCCLUDED_BY_FOREGROUND`).
- Unoccluded host pixels must differ (`HOST_VISIBLE`).
- The cast-shadow area must darken the floor (`HOST_SHADOW_COMPOSITED`).
- The lowest opaque host pixel at the contact column must be within 4 px of the projected contact (`HOST_CONTACT_PLANTED`).

Negatives proven in the test: missing occluder, dropped shadow pass, camera shifted 0.1 units, diagnostic host in PRODUCTION,
incomplete frames, tampered pass bytes, and a 2D camera push during the host pass.

## 5. Not supported (typed refusals in `hybrid-preflight`, never silent)
- Perspective camera (`HOST_CAMERA_ORTHO`).
- A 2D camera move during a host pass (`HOST_CAMERA_MATCHED`).
- Host hand contact with a 2D prop.
- Depth-tested interpenetration with 2D objects.
- Host lip-sync / face controls. These live in the Blender master; the adapter only renders what the `.blend` performs.

## 6. What the user and Blender artist must supply (`HOST_3D_ASSET_PENDING`)
1. An approved original host concept: silhouette, face, palette, personality, multi-view sheet (GPT + user; not Claude).
2. A Blender master `.blend` with a usable mesh/UV, materials matched to the 2D palette, an armature (Rigify or equivalent) with weights,
   IK feet/hands, face shape keys (brows, lids, mouth visemes), a `GROUND` object and named sole empties, plus the reusable performances:
   idle/breath, walk-to-stop, gaze shift, point, lean/inspect, speak, startle, exit. Provide its sha256 and a signed approval receipt.
3. For each host shot, a `hosts[]` entry in `HYBRID_CONTRACT.json`: shot, frames, camera, ≥ 2 reviewed floor landmarks on the approved
   restaurant plate, contacts and per-interval performance beats.

Render cost is local: about 1.5 s per pass at 1080p with Cycles at 16 samples for the diagnostic scene. A real host will be slower; measure it on the first shot.
