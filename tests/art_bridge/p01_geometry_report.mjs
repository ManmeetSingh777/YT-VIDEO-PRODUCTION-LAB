// Human-readable geometry report for one asset: crop corners in crop pixels → canonical (via the single contract) and the derived bbox.
import { cropCorners, cropToCanonical, canonicalBBox } from "../../engine/art_bridge/asset_geometry.mjs";
import { apply } from "../../engine/art_bridge/math2d.mjs";
export function cropQuadReport(a) {
  const C = cropToCanonical(a);
  return { crop_corners_px: cropCorners(a), canonical_corners: cropCorners(a).map((p) => apply(C, p).map((v) => +v.toFixed(6))), derived_bbox: canonicalBBox(a).map((v) => +v.toFixed(6)), scale: +Math.sqrt(Math.abs(C[0] * C[3] - C[1] * C[2])).toFixed(6), rotation_deg: +((Math.atan2(C[1], C[0]) * 180) / Math.PI).toFixed(4) };
}
