// Runtime plan compiler (general): the SEMANTIC motion plan (engine/story/semantic_motion_plan.mjs: absolute root keys, symbolic cameras) → the
// plan shape temporal.mjs executes. Nothing here knows a film.
//  - placements: each rig's first staged world placement (actions[].actors); root tracks become OFFSETS from it (temporal adds them);
//  - cameras: keyed by the shots' camera_track_id; a camera is solved only from a DIRECTED framing solution passed in
//    {track_id: {x, y, zoom, rot?, derivation}} — a shot without one stays PENDING (no invented framing);
//  - props driven only by support contracts get an initial placement from the physical solve (their pose is then written by the driver);
//  - everything executable passes through (acting, ik_branches, physical, prop_support, reaches); semantic-only records are kept under .semantic.
export function compileRuntimePlan({ doc, plan, cameraSolutions = {}, propPlacements = {} }) {
  const out = { id: `${plan.id || "plan"}__runtime`, fps: plan.fps ?? doc.stage.fps, placements: {}, tracks: {}, cameras: {}, semantic: { cameras: plan.cameras, support: plan.support, gaze: plan.gaze, pose_targets: plan.pose_targets, view_targets: plan.view_targets }, pending: [] };
  for (const k of ["acting", "ik_branches", "physical", "reaches", "prop_support", "cuts", "outgoing", "continuity"]) if (plan[k] !== undefined) out[k] = plan[k];
  const first = new Map(); for (const a of [...doc.actions].sort((x, y) => x.frame_range[0] - y.frame_range[0])) for (const x of a.actors || []) if (!first.has(x.rig_id)) first.set(x.rig_id, { x: x.root_world_xy[0], y: x.root_world_xy[1], scale: x.root_scale ?? 1, from_action: a.id });
  for (const [rid, p] of first) out.placements[rid] = p;
  for (const [rid, p] of Object.entries(propPlacements)) if (!out.placements[rid]) out.placements[rid] = { ...p };
  for (const [rid, t] of Object.entries(plan.tracks || {})) { const pl = out.placements[rid]; if (!pl) { out.pending.push({ kind: "TRACK", id: rid, reason: "rig is never staged: no placement to offset its root from" }); continue; }
    const off = (keys, base) => (keys || []).map(([f, v, e]) => (e ? [f, v - base, e] : [f, v - base])), mul = (keys, base) => (keys || []).map(([f, v, e]) => (e ? [f, v / base, e] : [f, v / base]));
    out.tracks[rid] = { root: { ...(t.root?.x ? { x: off(t.root.x, pl.x) } : {}), ...(t.root?.y ? { y: off(t.root.y, pl.y) } : {}), ...(t.root?.scale ? { scale: mul(t.root.scale, pl.scale) } : {}), ...(t.root?.rot ? { rot: t.root.rot } : {}) }, joints: { ...(t.joints || {}) }, ...(t.joint_offsets ? { joint_offsets: t.joint_offsets } : {}) }; }
  for (const s of doc.shots) { const id = s.camera_track_id, sol = cameraSolutions[id]; if (!id) continue;
    if (!sol) { out.pending.push({ kind: "CAMERA", id, shot: s.id, reason: "no solved framing (symbolic): needs the directed subject's registered geometry" }); continue; }
    out.cameras[id] = { x: [[s.start_frame, sol.x]], y: [[s.start_frame, sol.y]], zoom: [[s.start_frame, sol.zoom]], rot: [[s.start_frame, sol.rot ?? 0]] }; (out.camera_derivations ||= {})[id] = sol.derivation; }
  return out;
}
/** headCamera — framing solution from a directed on-screen head size: zoom = directed_px / world head px; the head centre is placed at the
 *  directed fraction of the frame. All inputs are measured world quantities (registered landmarks under the actor placement). */
export function headCamera({ stage, headTopWorld, chinWorld, directedHeadPx, frameFraction = [0.5, 1 / 3], derivation }) {
  const worldHead = Math.abs(chinWorld[1] - headTopWorld[1]), zoom = directedHeadPx / worldHead, hc = [(headTopWorld[0] + chinWorld[0]) / 2, (headTopWorld[1] + chinWorld[1]) / 2];
  const x = hc[0] + (stage.width / 2 - frameFraction[0] * stage.width) / zoom, y = hc[1] + (stage.height / 2 - frameFraction[1] * stage.height) / zoom;
  return { x, y, zoom, rot: 0, derivation: { ...derivation, world_head_px: +worldHead.toFixed(2), directed_head_px: directedHeadPx, head_centre_world: hc.map((v) => +v.toFixed(2)), frame_fraction: frameFraction, zoom: +zoom.toFixed(5) } };
}
