// Asset geometry contract (independent re-audit B1; spec §3.3, §5.2, §11.2). ONE definition used by every producer and consumer:
//   source image        : width_px × height_px intrinsic raster pixels
//   source_pixel_crop   : [sx, sy, sw, sh] — which raster pixels are displayed (crop-local pixel u ∈ [0,sw]×[0,sh] ↔ raster sx+u)
//   crop_to_canonical_matrix (C): full affine (incl. translation) crop-local pixel → canonical identity units
//   canonical_rect      : the OCCUPIED canonical area = axis-aligned bbox of the four transformed crop corners (derived, never a pixel size)
// Assets without a matrix (hand-authored fixtures) mean C = translate(rect origin) · scale(rect size / crop size).
// `asset_to_canonical` (linear, about the rect origin) is a legacy field: it is read only for old records and never written by intake.
import { mul, T, S, apply, inv } from "./math2d.mjs";

export function cropToCanonical(a) {
  if (a.crop_to_canonical_matrix) return a.crop_to_canonical_matrix.slice();
  const [cx, cy, cw, ch] = a.canonical_rect, [, , sw, sh] = a.source_pixel_crop;
  if (a.asset_to_canonical) return mul(T(cx, cy), [...a.asset_to_canonical.slice(0, 4), 0, 0]); // legacy: image placed at the rect origin, linear part only
  return mul(T(cx, cy), S(cw / sw, ch / sh));
}
export const cropCorners = (a) => { const [, , sw, sh] = a.source_pixel_crop; return [[0, 0], [sw, 0], [sw, sh], [0, sh]]; };
export const canonicalQuad = (a) => { const C = cropToCanonical(a); return cropCorners(a).map((p) => apply(C, p)); };
export function bboxOf(pts) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys); return [x0, y0, Math.max(...xs) - x0, Math.max(...ys) - y0]; }
export const canonicalBBox = (a) => bboxOf(canonicalQuad(a));
/** raster pixel (full image coordinates) → canonical */
export const rasterToCanonical = (a, p) => apply(cropToCanonical(a), [p[0] - a.source_pixel_crop[0], p[1] - a.source_pixel_crop[1]]);
/** canonical → crop-local pixel */
export const canonicalToCrop = (a, c) => apply(inv(cropToCanonical(a)), c);
/** does the asset's displayed crop cover canonical point c? (exact quad test, valid for rotation/shear) */
export function coversCanonical(a, c, eps = 1e-6) { const u = canonicalToCrop(a, c), [, , sw, sh] = a.source_pixel_crop; return u[0] >= -eps && u[1] >= -eps && u[0] <= sw + eps && u[1] <= sh + eps; }
/** invariant check: stored canonical_rect must equal the derived occupied bbox */
export function rectMismatch(a, eps = 1e-6) { const b = canonicalBBox(a); return a.canonical_rect.some((v, i) => Math.abs(v - b[i]) > eps * Math.max(1, Math.abs(b[i]))) ? b : null; }
/** build the manifest geometry fields from a raster→canonical affine and the accepted crop (all producers call this) */
export function geometryFields(rasterToCanon, crop, width_px, height_px) {
  const C = mul(rasterToCanon, T(crop[0], crop[1])), a = { source_pixel_crop: crop, crop_to_canonical_matrix: C };
  return { width_px, height_px, source_pixel_crop: crop, crop_to_canonical_matrix: C, canonical_rect: bboxOf(cropCorners(a).map((p) => apply(C, p))) };
}
