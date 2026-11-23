// Approved lighting (spec §5.5). Only authored material/shadow planes are animated, bound to their owner's joint matrix; there is no global
// crescent shader. Modes: STATIC_BAKED | ATTACHED_LIGHT_PLANE | VIEW_LIGHT_STATE | PROCEDURAL_EFFECT_MASK.
import { err } from "./errors.mjs";
import { ev } from "./temporal.mjs";

const MODES = ["STATIC_BAKED", "ATTACHED_LIGHT_PLANE", "VIEW_LIGHT_STATE", "PROCEDURAL_EFFECT_MASK"];
/** applyApprovedLighting(ownerPass, artState, frame, {assets, lighting}) → extra paint passes (same matrix as the owner, never animated separately) */
export function applyApprovedLighting(owner, state, frame, { assets, lighting = {} }) {
  const out = [], ownerAsset = assets.get(owner.asset_id);
  for (const [planeId, L] of Object.entries(lighting)) {
    if (L.owner_part !== owner.slot) continue;
    if (!MODES.includes(L.mode)) throw err("UNSUPPORTED_MOTION_CLASS", { record_id: planeId, reason: `lighting mode ${L.mode} is not approved` });
    const plane = assets.get(planeId);
    if (!plane) throw err("MISSING_ART_ASSET", { record_id: planeId, reason: "authored light plane absent" });
    if (!["MATERIAL_PLANE", "EFFECT_STATE"].includes(plane.kind)) throw err("UNAPPROVED_ART", { record_id: planeId, reason: `light plane must be an authored MATERIAL_PLANE/EFFECT_STATE (got ${plane.kind})` });
    if (!ownerAsset.material_plane_ids.includes(planeId)) throw err("UNAPPROVED_ART", { record_id: planeId, reason: `${planeId} is not an approved material plane of ${ownerAsset.id}` });
    if (L.mode === "STATIC_BAKED") continue;
    if (L.mode === "VIEW_LIGHT_STATE" && state?.view !== L.view_id && state?.pose !== L.view_id) continue;
    out.push({ pass_id: `${owner.pass_id}--light-${planeId}`, slot: `${owner.slot}:light`, asset_id: planeId, rig: owner.rig, joint: owner.joint, matrix: owner.matrix, visible: owner.visible, opacity: L.opacity ? Math.min(1, Math.max(0, ev(L.opacity, frame))) : 1, mode: L.mode, mask_asset_id: L.mode === "PROCEDURAL_EFFECT_MASK" ? plane.mask_asset_ids[0] ?? null : null });
  }
  return out;
}
