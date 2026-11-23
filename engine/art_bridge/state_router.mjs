// State router (spec §5.1, §5.3, §12.2): only explicitly approved view/pose/expression/garment states, switched on exact event frames through
// approved edges that preserve registered anchors. State is a pure function of the event list at f — no "last state" variable.
import { err } from "./errors.mjs";
import { apply, dist } from "./math2d.mjs";
import { validateMorph, validateDeformMap } from "./deform.mjs";
import { validateViewTurn } from "./motion_systems.mjs";

/** validateStateEdge(from, to, rig, assets) → the approved edge record, or throws UNSUPPORTED_STATE_EDGE / INVALID_MORPH_TOPOLOGY / UNSUPPORTED_VIEW */
export function validateStateEdge(from, to, rig, assets, identity = null, { requireApproval = true } = {}) {
  const states = new Map([...rig.pose_states, ...rig.view_states].map((s) => [s.id, s])), A = states.get(from), B = states.get(to), id = `${rig.id}.${from}->${to}`;
  if (!A || !B) throw err("UNSUPPORTED_STATE_EDGE", { record_id: id, reason: "unknown state" });
  if (identity && !identity.allowed_views.includes(B.view_facing)) throw err("UNSUPPORTED_VIEW", { record_id: id, reason: `view ${B.view_facing} not approved for ${identity.id}` });
  const e = rig.allowed_state_edges.find((x) => x.from === from && x.to === to);
  if (!e) throw err("UNSUPPORTED_STATE_EDGE", { record_id: id, reason: "no approved edge" });
  if (A.view_facing !== B.view_facing && !["REGISTERED_SWAP", "CEL_SEQUENCE"].includes(e.mode)) throw err(e.mode === "MATCHED_VECTOR_MORPH" ? "INVALID_MORPH_TOPOLOGY" : "UNSUPPORTED_STATE_EDGE", { record_id: id, reason: `view change by ${e.mode}` });
  if (e.mode === "MATCHED_VECTOR_MORPH") { const raster = [...Object.values(A.asset_bindings), ...Object.values(B.asset_bindings)].filter((x) => assets.get(x)?.kind !== "VECTOR_PATH"); if (raster.length) throw err("INVALID_MORPH_TOPOLOGY", { record_id: id, dependency: raster.join(","), reason: "vector morph on raster assets" }); }
  // a view-changing edge needs an approved cel of the new view sharing >=3 MEASURED landmarks with the old view (no rotated front PNG)
  if (A.view_facing !== B.view_facing) { const lm = (st) => new Set(Object.values(st.asset_bindings).flatMap((x) => Object.keys(assets.get(x)?.landmarks || {}))), la = lm(A), shared = [...lm(B)].filter((k) => la.has(k));
    const v = validateViewTurn({ from_view: A.view_facing, to_view: B.view_facing, cels: Object.values(B.asset_bindings).some((x) => assets.get(x)) ? [{ view: B.view_facing, landmarks_shared_with: { [A.view_facing]: shared } }] : [], rotation_of_front: e.mode === "ROTATE_FRONT" });
    if (!v.ok) throw err(v.failures[0].code, { record_id: id, reason: v.failures[0].reason, producer: "engine/art_bridge/state_router.mjs#validateStateEdge" }); }
  if (e.mode === "MATCHED_VECTOR_MORPH") for (const [slot, a] of Object.entries(A.asset_bindings)) { const b = B.asset_bindings[slot], pa = assets.get(a)?.path_d, pb = assets.get(b)?.path_d; if (pa && pb) { const v = validateMorph(pa, pb); if (!v.ok) throw err("INVALID_MORPH_TOPOLOGY", { record_id: id, dependency: slot, reason: v.failures.map((x) => x.reason).join("; ") }); } }
  if (e.mode === "EXPLICIT_DEFORM") { const v = validateDeformMap(e.deform_map); if (!v.ok) throw err("INVALID_DEFORM_MAP", { record_id: id, reason: v.failures.map((x) => x.reason).join("; ") }); }
  if (requireApproval && !e.approved_assembly_review_id) throw err("UNAPPROVED_ART", { record_id: id, reason: "state edge assembly not approved" });
  return e;
}

/** registered-anchor check for a swap: each shared landmark must land on the same canonical point in both states' bound assets */
export function anchorResiduals(from, to, rig, assets) {
  const states = new Map([...rig.pose_states, ...rig.view_states].map((s) => [s.id, s])), A = states.get(from), B = states.get(to), e = rig.allowed_state_edges.find((x) => x.from === from && x.to === to);
  const find = (st, lm) => { for (const aid of Object.values(st.asset_bindings)) { const a = assets.get(aid); if (a?.landmarks?.[lm]) return a.landmarks[lm]; } return null; };
  return (e?.landmark_ids || []).map((lm) => { const pa = find(A, lm), pb = find(B, lm); return { landmark: lm, from: pa, to: pb, residual_px: pa && pb ? dist(pa, pb) : null }; });
}

/** resolveState(owner, frame): owner = {compiled, rig_id}. Validates the event chain against approved edges and returns {pose, view, bindings}. */
export function resolveState(owner, frame) {
  const C = owner.compiled, R_ = C.rigs.get(owner.rig_id), shot = C.shotAt(frame);
  const identity = C.doc.identities.find((i) => i.id === R_.rec.identity_id);
  let view = null;
  for (const a of C.actions) if (a.shot_id === shot?.id && a.actors.some((x) => x.rig_id === owner.rig_id)) for (const ve of [...a.view_events].sort((p, q) => p.frame - q.frame)) if (ve.frame <= frame) {
    if (view !== null && ve.from_state !== view) throw err("UNSUPPORTED_STATE_EDGE", { record_id: a.id, frame_range: [ve.frame, ve.frame + 1], reason: `view event from ${ve.from_state} but current view is ${view}` });
    validateStateEdge(ve.from_state, ve.to_state, R_.rec, C.assets, identity); view = ve.to_state;
  }
  const st = C.resolveApprovedArtStates(frame, { state: { [owner.rig_id]: {} } })[owner.rig_id];
  return { ...st, view: view ?? st.view };
}

/** gaze: an eye part may translate only inside its owned eye surface (canonical rect of the surface asset, minus the pupil extent) */
export function validateGazeOffset(pupilAsset, surfaceAsset, offset) {
  const [px, py, pw, ph] = pupilAsset.canonical_rect, [sx, sy, sw, sh] = surfaceAsset.canonical_rect, nx = px + offset[0], ny = py + offset[1];
  if (nx < sx || ny < sy || nx + pw > sx + sw || ny + ph > sy + sh) throw err("UNSUPPORTED_STATE_EDGE", { record_id: pupilAsset.id, reason: `gaze offset [${offset}] moves ${pupilAsset.id} outside its owned eye surface ${surfaceAsset.id}`, details: { offset, surface: surfaceAsset.canonical_rect } });
  return true;
}
export { apply };
