// View-compatibility demand over ALL reachable state cells (general). The renderer flags `<asset>@<view>` only for drawings that already exist;
// this evaluates the same rule for every bound drawing of every rig, existing or not: a drawing planned in view V that a cell shows while the rig
// faces another view W needs a W-compatible drawing — unless the slot is rebound by that view state (head/torso view cels), the drawing is
// view-free (underpaint/mask/occluder/material) or the rig has no views. Face slots follow the head VIEW; limbs follow the view's BODY facing.
import { stateIntervals } from "./asset_state.mjs";
const VIEW_FREE = new Set(["UNDERPAINT", "MASK", "OCCLUDER", "MATERIAL_PLANE"]);
export function viewDemand(doc, planAssets) {
  const P = new Map(planAssets.map((a) => [a.asset_id, a])), rigs = new Map(doc.rigs.map((r) => [r.id, r])), need = new Map();
  for (const c of stateIntervals(doc)) { const r = rigs.get(c.rig); if (!r?.view_states?.length || !c.view) continue; const vs = r.view_states.find((v) => v.id === c.view), rebound = new Set(Object.keys(vs?.asset_bindings || {})), faceSlots = new Set((r.state_channels || []).filter((x) => ["EXPRESSION", "EYES", "MOUTH"].includes(x.kind)).flatMap((x) => x.slots || [])), body = vs?.body_facing || vs?.view_facing || c.view;
    for (const [slot, aid] of Object.entries(c.bindings)) { const pa = P.get(aid); const want = faceSlots.has(slot) ? (vs?.view_facing || c.view) : body; if (!pa || rebound.has(slot) || VIEW_FREE.has(pa.kind) || !pa.view_id || pa.view_id === want) continue;
      const k = `${aid}@${want}`, x = need.get(k) || { rig: c.rig, slot, asset: aid, planned_view: pa.view_id, view: want, kind: faceSlots.has(slot) ? "FACE" : "BODY", frames: 0, actions: new Set() }; x.frames += c.interval[1] - c.interval[0]; x.actions.add(c.action); need.set(k, x); } }
  return [...need.values()].map((x) => ({ ...x, actions: [...x.actions] })).sort((p, q) => p.rig.localeCompare(q.rig) || p.asset.localeCompare(q.asset) || p.view.localeCompare(q.view));
}
