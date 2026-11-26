// P08 E07 — directed in-world photography intent. A phone (any registered prop or hand socket) declares its LENS socket; the lens axis is the
// socket's world basis (rest + local + basis_angle_deg), evaluated on the SAME frames the renderer draws. For a stylised 2D implied image the
// capture region is a REVIEWED 2D WEDGE from the lens along that axis (half-angle, range) — explicitly labelled REVIEWED_2D_IMPLIED_IMAGE, never
// claimed as a physical 3D frustum (a 3D route uses the host camera projection, E03). At the capture frame every must-include owner point lies
// inside, every must-exclude point (e.g. the private report) outside; the aim is settled over its window; the shutter (a directed thumb/hand state)
// happens exactly at the capture frame and only after its cue; a flash is refused unless directed.
import { stateAtFrame } from "../art_bridge/temporal.mjs";
import { apply, angleOf, wrap180 } from "../art_bridge/math2d.mjs";
import { err } from "../art_bridge/errors.mjs";
const deg = (r) => (r * 180) / Math.PI;
export const PHOTO_INTENT_VERSION = "1.0.0";
function pointOf(C, S, ref) { if (ref.world_xy) return ref.world_xy; const R_ = C.rigs.get(ref.rig); if (!R_ || !S.matrices[ref.rig]) return null; if (ref.socket) return C.socketWorld(ref.rig, S.matrices[ref.rig], ref.socket); const j = ref.joint ?? R_.root.id; return apply(S.matrices[ref.rig][j], R_.joints.get(j).rest_xy); }
/** lens(C, S, intent) → {origin, axis_deg} from the lens socket's evaluated world frame */
export function lens(C, S, it) { const F = C.socketFrame(it.lens.rig, S.matrices[it.lens.rig], it.lens.socket); return { origin: [F[4], F[5]], axis_deg: angleOf(F) + (it.lens.forward_offset_deg ?? 0) }; }
export const inWedge = (L, p, half, range) => { const dx = p[0] - L.origin[0], dy = p[1] - L.origin[1], d = Math.hypot(dx, dy); return d <= range && Math.abs(wrap180(deg(Math.atan2(dy, dx)) - L.axis_deg)) <= half; };
/** verifyPhotoIntent(C, intent) → {ok, failures, measurement} */
export function verifyPhotoIntent(C, it, st = (f) => stateAtFrame(C, f)) {
  const F = [], no = (inv, reason, fr) => F.push(err("PHOTO_INTENT_VIOLATED", { record_id: it.id, frame_range: fr ?? [it.capture_frame, it.capture_frame + 1], reason, failed_invariant: inv, producer: "engine/film/photo_intent.mjs#verifyPhotoIntent" }));
  if (it.schema_version !== PHOTO_INTENT_VERSION) no("PHOTO_INTENT_V1", `photo intent ${it.id}: schema_version ${it.schema_version} (1.0.0 required)`);
  if (it.region?.kind !== "REVIEWED_2D_WEDGE") no("REGION_KIND_LABELLED", `photo intent ${it.id}: the region must be a REVIEWED_2D_WEDGE (a 2D implied image is never presented as a 3D frustum)`);
  if (it.flash === true && !it.flash_directed) no("NO_UNDIRECTED_FLASH", `photo intent ${it.id}: a flash is not directed`);
  if (F.length) return { ok: false, failures: F, measurement: null };
  const S = st(it.capture_frame), L = lens(C, S, it), half = it.region.half_angle_deg, range = it.region.range_px, m = { lens: L, inside: {}, outside: {}, aim_drift_deg: 0 };
  for (const r of it.must_include || []) { const p = pointOf(C, S, r); const ok = !!p && inWedge(L, p, half, range); m.inside[r.label ?? r.rig] = ok; if (!ok) no("INCLUDES_INTENDED_SUBJECT", `${r.label ?? r.rig} is not inside the intended photo at the shutter (lens axis ${L.axis_deg.toFixed(1)}°)`); }
  for (const r of it.must_exclude || []) { const p = pointOf(C, S, r); const out = !!p && !inWedge(L, p, half, range); m.outside[r.label ?? r.rig] = out; if (!out) no("EXCLUDES_PRIVATE_REGION", `${r.label ?? r.rig} would be in the photo (privacy)`); }
  if (it.aim_window) { for (let f = it.aim_window[0]; f <= it.capture_frame; f++) { const d = Math.abs(wrap180(lens(C, st(f), it).axis_deg - L.axis_deg)); m.aim_drift_deg = Math.max(m.aim_drift_deg, d); } if (m.aim_drift_deg > (it.aim_tolerance_deg ?? 2)) no("AIM_SETTLED", `the lens axis still moves ${m.aim_drift_deg.toFixed(2)}° inside the settled aim window`, [it.aim_window[0], it.capture_frame + 1]); }
  if (Number.isInteger(it.not_before_frame) && it.capture_frame < it.not_before_frame) no("SHUTTER_AFTER_CUE", `shutter at ${it.capture_frame} precedes its cue end ${it.not_before_frame} (early shutter)`);
  const sh = it.shutter; if (sh) { const chAt = (f) => st(f).artStates?.[sh.rig]?.channels?.[sh.channel];
    if (chAt(it.capture_frame) !== sh.press_state) no("SHUTTER_ACTION_VISIBLE", `no ${sh.press_state} ${sh.channel} drawing on ${sh.rig} at the shutter (missing thumb action)`);
    if (it.capture_frame > 0 && chAt(it.capture_frame - 1) === sh.press_state) no("SHUTTER_IS_AN_EVENT", "the press drawing was already shown on the frame before the shutter (no distinct press)"); }
  return { ok: !F.length, failures: F, measurement: m, label: "REVIEWED_2D_IMPLIED_IMAGE (not a physical 3D frustum)" };
}
