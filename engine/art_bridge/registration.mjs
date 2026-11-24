// Image extraction and canonical registration (spec §11.2). A provider image does not arrive pixel-aligned: this producer solves the
// allowed raster→canonical transform from REVIEWED landmark correspondences, keeps the source pixels unchanged (lossless crop only),
// measures per-anchor residuals, reports real alpha, composites the part back over the approved master (overlay + difference image)
// and writes a registration receipt that stays PENDING_REVIEW until a human/visual reviewer approves it. It never fills holes, never
// thresholds a background into alpha and never infers hidden pixels.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { readPNG, writeRGBA } from "./png.mjs";
import { err } from "./errors.mjs";
import { geometryFields } from "./asset_geometry.mjs";

const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

/** least-squares transform from src→dst points. mode SIMILARITY (rotation+uniform scale+translation, ≥2 pts) or AFFINE (≥3 non-collinear). */
export function solveTransform(src, dst, mode = "SIMILARITY") {
  const n = src.length;
  if (n !== dst.length) throw err("INVALID_IK_INPUT", { reason: "landmark lists differ in length" });
  if (mode === "SIMILARITY") {
    if (n < 2) throw err("DEGENERATE_IK", { reason: "similarity registration needs ≥2 anchors" });
    const ms = src.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]), md = dst.reduce((a, p) => [a[0] + p[0] / n, a[1] + p[1] / n], [0, 0]);
    let sxx = 0, sxy = 0, ss = 0;
    for (let i = 0; i < n; i++) { const x = src[i][0] - ms[0], y = src[i][1] - ms[1], u = dst[i][0] - md[0], v = dst[i][1] - md[1]; sxx += x * u + y * v; sxy += x * v - y * u; ss += x * x + y * y; }
    if (ss < 1e-9) throw err("DEGENERATE_IK", { reason: "coincident registration anchors" });
    const a = sxx / ss, b = sxy / ss; // [a -b; b a]
    return [a, b, -b, a, md[0] - (a * ms[0] - b * ms[1]), md[1] - (b * ms[0] + a * ms[1])];
  }
  if (n < 3) throw err("DEGENERATE_IK", { reason: "affine registration needs ≥3 non-collinear anchors" });
  // normal equations for x' = a x + c y + e ; y' = b x + d y + f
  const A = [[0, 0, 0], [0, 0, 0], [0, 0, 0]], bx = [0, 0, 0], by = [0, 0, 0];
  for (let i = 0; i < n; i++) { const r = [src[i][0], src[i][1], 1]; for (let p = 0; p < 3; p++) { for (let q = 0; q < 3; q++) A[p][q] += r[p] * r[q]; bx[p] += r[p] * dst[i][0]; by[p] += r[p] * dst[i][1]; } }
  const det3 = (m) => m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) - m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) + m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0]);
  const D = det3(A); if (Math.abs(D) < 1e-6 * Math.max(1, A[0][0] * A[1][1])) throw err("DEGENERATE_IK", { reason: "collinear registration anchors: affine is undetermined" });
  const solve = (b) => [0, 1, 2].map((k) => det3(A.map((row, i) => row.map((v, j) => (j === k ? b[i] : v)))) / D);
  const [a, c, e] = solve(bx), [b, d, f] = solve(by);
  return [a, b, c, d, e, f];
}
/** P05 (README 6.1): a registration transform may place a drawing, never change it — no mirror image, no stretch or skew beyond 10% */
export function assertDrawingPreserved([a, b, c, d], record_id = null) { const det = a * d - b * c, p1 = a * a + b * b + c * c + d * d, q1 = Math.sqrt(Math.max(0, p1 * p1 - 4 * det * det)), s1 = Math.sqrt((p1 + q1) / 2), s2 = Math.sqrt(Math.max(0, (p1 - q1) / 2)); if (det <= 0) throw err("UNREGISTERED_PIVOT", { record_id, reason: "the landmarks map the drawing onto its mirror image: a mirrored drawing is a different drawing" }); if (!(s2 > 0) || s1 / s2 > 1.1) throw err("UNREGISTERED_PIVOT", { record_id, reason: `the landmarks would stretch or skew the drawing (axis ratio ${(s1 / (s2 || 1e-9)).toFixed(3)} > 1.1): a best fit is not permission to deform the artwork` }); return true; }
const ap = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]];
const inv = (M) => { const d = M[0] * M[3] - M[1] * M[2]; if (Math.abs(d) < 1e-12) throw err("DEGENERATE_IK", { reason: "non-invertible registration" }); return [M[3] / d, -M[1] / d, -M[2] / d, M[0] / d, (M[2] * M[5] - M[3] * M[4]) / d, (M[1] * M[4] - M[0] * M[5]) / d]; };
function sample(png, x, y) { // bilinear, straight alpha → premultiplied average
  const { width: W, height: H, rgba } = png, x0 = Math.floor(x - 0.5), y0 = Math.floor(y - 0.5), fx = x - 0.5 - x0, fy = y - 0.5 - y0, out = [0, 0, 0, 0];
  for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) { const xx = x0 + dx, yy = y0 + dy; if (xx < 0 || yy < 0 || xx >= W || yy >= H) continue; const i = (yy * W + xx) * 4, a = rgba[i + 3] / 255; out[0] += rgba[i] * a * w; out[1] += rgba[i + 1] * a * w; out[2] += rgba[i + 2] * a * w; out[3] += a * w; }
  return out;
}

/** registerPart({master, rawPart, regionMask?, canonicalLandmarks, partLandmarks, pivotId, underpaintIds, hiddenSurfaces, mode, maxResidualPx, outDir, partId}) */
export function registerPart(o) {
  const mode = o.mode || "SIMILARITY", tol = o.maxResidualPx ?? 1.0, out = o.outDir; fs.mkdirSync(out, { recursive: true });
  let master, raw;
  try { master = readPNG(o.master); raw = readPNG(o.rawPart); } catch (e) { throw err("ALPHA_INVALID", { record_id: o.partId, reason: `registration needs lossless PNG sources with real alpha (${e.message}); do not threshold a JPEG background into alpha` }); }
  if (!raw.hasAlphaChannel) throw err("ALPHA_INVALID", { record_id: o.partId, reason: "raw part has no alpha channel; a background colour is never converted to alpha by threshold" });
  let rgba = raw.rgba;
  if (o.regionMask) { const m = readPNG(o.regionMask); if (m.width !== raw.width || m.height !== raw.height) throw err("IMAGE_DIMENSION_MISMATCH", { record_id: o.partId, reason: "region mask size differs from raw part" }); rgba = Uint8Array.from(rgba); for (let i = 3; i < rgba.length; i += 4) rgba[i] = Math.round((rgba[i] * m.rgba[i]) / 255); }
  const ids = Object.keys(o.partLandmarks).filter((k) => k in o.canonicalLandmarks);
  if (!(o.pivotId in o.canonicalLandmarks)) throw err("UNREGISTERED_PIVOT", { record_id: o.partId, reason: `pivot landmark ${o.pivotId} is not a canonical landmark` });
  const T = solveTransform(ids.map((k) => o.partLandmarks[k]), ids.map((k) => o.canonicalLandmarks[k]), mode);
  const residuals = ids.map((k) => { const p = ap(T, o.partLandmarks[k]), q = o.canonicalLandmarks[k]; return { landmark: k, residual_px: Math.hypot(p[0] - q[0], p[1] - q[1]) }; });
  const maxRes = Math.max(...residuals.map((r) => r.residual_px)), scale = Math.sqrt(Math.abs(T[0] * T[3] - T[1] * T[2]));
  // lossless crop to the alpha bounding box (source pixels unchanged)
  let x0 = raw.width, y0 = raw.height, x1 = -1, y1 = -1, transparent = 0, partial = 0, opaque = 0;
  for (let y = 0; y < raw.height; y++) for (let x = 0; x < raw.width; x++) { const a = rgba[(y * raw.width + x) * 4 + 3]; if (a === 0) { transparent++; continue; } a === 255 ? opaque++ : partial++; if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  if (x1 < 0) throw err("ALPHA_INVALID", { record_id: o.partId, reason: "raw part is fully transparent" });
  const cw = x1 - x0 + 1, ch = y1 - y0 + 1, crop = new Uint8Array(cw * ch * 4);
  for (let y = 0; y < ch; y++) crop.set(rgba.subarray(((y + y0) * raw.width + x0) * 4, ((y + y0) * raw.width + x0 + cw) * 4), y * cw * 4);
  const partFile = path.join(out, `${o.partId}.png`); writeRGBA(partFile, cw, ch, crop);
  const origin = ap(T, [x0, y0]), L = [T[0], T[1], T[2], T[3], 0, 0];
  const identityL = Math.abs(T[0] - 1) < 1e-9 && Math.abs(T[3] - 1) < 1e-9 && Math.abs(T[1]) < 1e-9 && Math.abs(T[2]) < 1e-9;
  // composite back over the master at rest: overlay + difference inside the part's footprint
  const Ti = inv(T), W = master.width, H = master.height, overlay = Uint8Array.from(master.rgba), diff = new Uint8Array(W * H * 4); let sum = 0, cnt = 0, maxd = 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const [u, v] = ap(Ti, [x + 0.5, y + 0.5]), s = sample({ width: raw.width, height: raw.height, rgba }, u, v), i = (y * W + x) * 4; if (s[3] < 1e-3) { diff[i + 3] = 0; continue; }
    const a = s[3]; for (let c = 0; c < 3; c++) overlay[i + c] = Math.round(s[c] + master.rgba[i + c] * (1 - a)); overlay[i + 3] = 255;
    if (a > 0.99) { const d = (Math.abs(s[0] / a - master.rgba[i]) + Math.abs(s[1] / a - master.rgba[i + 1]) + Math.abs(s[2] / a - master.rgba[i + 2])) / 3; sum += d; cnt++; maxd = Math.max(maxd, d); diff[i] = diff[i + 1] = diff[i + 2] = Math.min(255, d * 4); diff[i + 3] = 255; }
  }
  const overlayFile = path.join(out, `${o.partId}__overlay_on_master.png`), diffFile = path.join(out, `${o.partId}__difference.png`); writeRGBA(overlayFile, W, H, overlay); writeRGBA(diffFile, W, H, diff);
  const missing = [];
  if ((o.hiddenSurfaces || []).length && !(o.underpaintIds || []).length) missing.push({ code: "MISSING_UNDERPAINT", record_id: o.partId, reason: "part reveals hidden surfaces when it moves; request source-attached GPT underpaint edit" });
  const failures = [];
  // the pivot must sit on painted pixels of the delivered part (a joint cannot hinge on empty canvas: truncated/misplaced art)
  if (o.requirePivotOnArt !== false && o.partLandmarks[o.pivotId]) { const [ux, uy] = o.partLandmarks[o.pivotId], ix = Math.floor(ux), iy = Math.floor(uy), inside = ix >= 0 && iy >= 0 && ix < raw.width && iy < raw.height, alpha = inside ? rgba[(iy * raw.width + ix) * 4 + 3] : 0;
    if (alpha < 128) failures.push({ code: "UNREGISTERED_PIVOT", record_id: o.partId, human_readable_reason: `pivot landmark ${o.pivotId} at [${ux.toFixed(1)}, ${uy.toFixed(1)}] lies on ${inside ? "transparent" : "out-of-image"} pixels: the delivered part is truncated or misplaced`, details: { alpha, inside } }); }
  if (maxRes > tol) failures.push({ code: "UNREGISTERED_PIVOT", record_id: o.partId, human_readable_reason: `landmark residual ${maxRes.toFixed(3)}px > ${tol}px: correspondences or transform class are wrong`, details: { residuals } });
  if (o.allowedScale && (scale < o.allowedScale[0] || scale > o.allowedScale[1])) failures.push({ code: "IMAGE_DIMENSION_MISMATCH", record_id: o.partId, human_readable_reason: `registration scale ${scale.toFixed(3)} outside allowed ${o.allowedScale}` });
  const receipt = {
    part_id: o.partId, status: failures.length ? "REGISTRATION_FAILED" : "PENDING_REVIEW", transform_mode: mode, raster_to_canonical: T, scale,
    source: { master: o.master, master_sha256: fsha(o.master), raw_part: o.rawPart, raw_sha256: fsha(o.rawPart), region_mask: o.regionMask || null },
    approved_part_file: partFile, approved_part_sha256: fsha(partFile), source_pixel_crop_in_raw: [x0, y0, cw, ch],
    // geometry contract (re-audit B1): the approved file IS the crop, so crop→canonical = T · translate(crop origin in the raw raster)
    manifest_fields: { ...geometryFields(T, [x0, y0, cw, ch], cw, ch), source_pixel_crop: [0, 0, cw, ch], pivot_xy: o.canonicalLandmarks[o.pivotId], pivot_landmark_id: o.pivotId, landmarks: Object.fromEntries(ids.map((k) => [k, o.canonicalLandmarks[k]])), alpha_mode: partial ? "STRAIGHT" : "BINARY_MASK", underpaint_asset_ids: o.underpaintIds || [], hidden_surfaces: o.hiddenSurfaces || [] },
    landmark_sidecar: o.sidecar || null, // the reviewed correspondences actually used (hash + reviewer + values) — bound into approvals
    landmark_residuals: residuals, max_residual_px: maxRes, alpha_report: { transparent, partial, opaque },
    rest_overlay: { overlay_file: overlayFile, difference_file: diffFile, mean_abs_diff_opaque: cnt ? sum / cnt : null, max_abs_diff_opaque: maxd, pixels_compared: cnt },
    failures, missing_art: missing, reviewer_verdict: null, review_required: "visual check of overlay on transparent, contrasting and master backgrounds at full resolution (contour drift, seams, fringes)",
  };
  fs.writeFileSync(path.join(out, `${o.partId}__REGISTRATION_RECEIPT.json`), JSON.stringify(receipt, null, 1));
  return receipt;
}
