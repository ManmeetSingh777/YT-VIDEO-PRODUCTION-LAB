// Source-attached high-resolution component route (E01: Mia's heads >= 540 px, report page >= 2496 px) and deterministic derivation routes.
// A component whose directed native minimum the approved master cannot carry is manufactured as a source-attached EDIT of an exact crop of the
// approved master's own pixels (never resampled), generated at a full provider canvas, and registered back by its landmarks. Its delivered
// pixels must (a) meet the directed span natively and (b) carry real detail above the master's density — an upscaled crop is refused.
// Deterministic routes (no image generation) are used only where they genuinely produce the artwork: engine vector TYPE, alpha-derived masks.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { readPNG, writeRGBA } from "./png.mjs";
const P = "engine/art_bridge/component_route.mjs", sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const dims = (s) => s.split("x").map(Number), orient = (w, h) => (w > h * 1.1 ? "L" : h > w * 1.1 ? "P" : "S");
/** how each directed measure is taken (landmark span, or the painted alpha extent along an axis) */
export const MEASURES = Object.freeze({ head_height_px: { from: "head_top", to: "chin" }, figure_height_px: { alpha_axis: "y" }, page_width_px: { alpha_axis: "x" } });

const alphaBox = (png, box = [0, 0, png.width, png.height], t = 8) => { let x0 = Infinity, y0 = Infinity, x1 = -1, y1 = -1; const [bx, by, bw, bh] = box;
  for (let y = by; y < by + bh; y++) for (let x = bx; x < bx + bw; x++) if (png.rgba[(y * png.width + x) * 4 + 3] > t) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return x1 < 0 ? null : [x0, y0, x1 - x0 + 1, y1 - y0 + 1]; };
export function measureSpan({ png, landmarks = {}, measure, box = null, from = null, to = null, span = null }) {
  const m0 = MEASURES[measure]; if (!m0) throw err("SCHEMA_VIOLATION", { reason: `unknown measure ${measure}`, producer: P }); const m = from && to ? { from, to, span } : m0;
  if (m.from) { const a = landmarks[m.from], b = landmarks[m.to]; if (!a || !b) throw err("UNREGISTERED_PIVOT", { reason: `${measure} needs landmarks ${m.from} and ${m.to}`, producer: P }); return m.span === "vertical" ? Math.abs(b[1] - a[1]) : Math.hypot(b[0] - a[0], b[1] - a[1]); }
  const ab = alphaBox(png, box || undefined); if (!ab) throw err("ALPHA_INVALID", { reason: "no painted pixels to measure", producer: P }); return m.alpha_axis === "x" ? ab[2] : ab[3];
}

/** componentCropPlan — where to crop the approved master and at which canvas the component edit must be delivered to meet its minimum */
export function componentCropPlan({ masterPng, landmarks, componentLandmarks = [], requirement, canvases, pad = 0.18, margin = 0.04 }) {
  const ends = requirement.from_landmark ? [requirement.from_landmark, requirement.to_landmark] : MEASURES[requirement.measure]?.from ? [MEASURES[requirement.measure].from, MEASURES[requirement.measure].to] : [], pts = [...new Set([...componentLandmarks, ...ends])].map((k) => landmarks[k]).filter(Boolean);
  let box; if (pts.length >= 2) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys), e = pad * Math.max(w, h, 1);
    box = [Math.min(...xs) - e, Math.min(...ys) - e, w + 2 * e, h + 2 * e]; } else box = alphaBox(masterPng);
  if (!box) throw err("UNREGISTERED_PIVOT", { reason: "the component has no measured landmarks or painted pixels in the master", producer: P });
  const x0 = Math.max(0, Math.floor(box[0])), y0 = Math.max(0, Math.floor(box[1])), x1 = Math.min(masterPng.width, Math.ceil(box[0] + box[2])), y1 = Math.min(masterPng.height, Math.ceil(box[1] + box[3])), crop = [x0, y0, x1 - x0, y1 - y0];
  const span = measureSpan({ png: masterPng, landmarks, measure: requirement.measure, box: crop, from: requirement.from_landmark, to: requirement.to_landmark, span: requirement.span });
  const ranked = canvases.map((s) => { const [cw, ch] = dims(s), k = Math.min(cw / crop[2], ch / crop[3]) * (1 - 2 * margin); return { s, k, same: orient(cw, ch) === orient(crop[2], crop[3]) }; }).sort((a, b) => b.k - a.k || b.same - a.same), best = ranked[0];
  const expected = span * best.k, feasible = expected >= requirement.min_native_px;
  return { crop_box: crop, canvas: best.s, scale_from_master: +best.k.toFixed(4), master_span_px: +span.toFixed(1), expected_delivered_span_px: Math.floor(expected), requirement, feasible,
    landmarks_in_crop: Object.fromEntries(Object.entries(landmarks).filter(([, p]) => p[0] >= x0 && p[0] < x1 && p[1] >= y0 && p[1] < y1).map(([k, p]) => [k, [+(((p[0] - x0) / crop[2])).toFixed(4), +(((p[1] - y0) / crop[3])).toFixed(4)]])),
    reason: feasible ? null : `the crop holds ${span.toFixed(0)} px of ${requirement.measure}; the largest canvas gives ${Math.floor(expected)} px < ${requirement.min_native_px} px: the component needs a tighter crop or tiled delivery` };
}

/** cropExact — the approved master's own pixels in the crop box, byte-exact (no resampling, no filtering) */
export function cropExact(png, [x, y, w, h], outFile) {
  const out = Buffer.alloc(w * h * 4); for (let r = 0; r < h; r++) png.rgba.copy(out, r * w * 4, ((y + r) * png.width + x) * 4, ((y + r) * png.width + x + w) * 4);
  fs.mkdirSync(path.dirname(outFile), { recursive: true }); writeRGBA(outFile, w, h, out); return { file: outFile, sha256: sha(fs.readFileSync(outFile)), size: [w, h] };
}

/** nativeDetailRatio — edge sharpness relative to the master density: mean squared 1-px gradient ÷ mean squared (f-px difference / f).
 *  A native drawing changes within ~1 px at its own density (≈ f); an enlargement of master pixels spreads every edge over ~f px (≈ 1). */
export function nativeDetailRatio(png, factor) {
  const W = png.width, H = png.height, f = Math.max(2, Math.round(factor)), L = (x, y) => { const i = (y * W + x) * 4; return 0.299 * png.rgba[i] + 0.587 * png.rgba[i + 1] + 0.114 * png.rgba[i + 2]; }, A = (x, y) => png.rgba[(y * W + x) * 4 + 3] >= 128;
  let g1 = 0, gf = 0, n = 0;
  for (let y = 0; y + f < H; y++) for (let x = 0; x + f < W; x++) { if (!A(x, y) || !A(x + f, y) || !A(x, y + f)) continue; const v = L(x, y);
    g1 += (L(x + 1, y) - v) ** 2 + (L(x, y + 1) - v) ** 2; gf += ((L(x + f, y) - v) / f) ** 2 + ((L(x, y + f) - v) / f) ** 2; n++; }
  return gf > 0 ? g1 / gf : 0;
}
export const nativeDetailThreshold = (factor) => 1 + 0.5 * (Math.max(2, Math.round(factor)) - 1); // native ≈ f, enlargement ≈ 1–1.7 (measured: flat disc 3.0 vs 1.38, fine detail 7.9 vs 1.71 at f = 3)
/** verifyComponentNative — the delivered component meets its directed span with its OWN pixels and is not an upscaled crop */
/** enlargeBilinear — the master enlarged by `factor` (bilinear, premultiplied-free luminance use only): the reference an upscale would produce */
export function enlargeBilinear(png, factor) { const W = png.width, H = png.height, w = Math.max(1, Math.round(W * factor)), h = Math.max(1, Math.round(H * factor)), out = Buffer.alloc(w * h * 4), s = png.rgba;
  for (let y = 0; y < h; y++) { const fy = Math.min(H - 1, (y + 0.5) / factor - 0.5), y0 = Math.max(0, Math.floor(fy)), y1 = Math.min(H - 1, y0 + 1), ty = Math.max(0, fy - y0);
    for (let x = 0; x < w; x++) { const fx = Math.min(W - 1, (x + 0.5) / factor - 0.5), x0 = Math.max(0, Math.floor(fx)), x1 = Math.min(W - 1, x0 + 1), tx = Math.max(0, fx - x0), o = (y * w + x) * 4;
      for (let c = 0; c < 4; c++) { const a = s[(y0 * W + x0) * 4 + c], b = s[(y0 * W + x1) * 4 + c], d = s[(y1 * W + x0) * 4 + c], e = s[(y1 * W + x1) * 4 + c]; out[o + c] = Math.round((a * (1 - tx) + b * tx) * (1 - ty) + (d * (1 - tx) + e * tx) * ty); } } }
  return { width: w, height: h, rgba: out }; }
/** masterCalibratedThreshold — the provider's OWN native edge profile: midpoint between the master's ratio at f and the ratio of the master
 *  enlarged by the same factor (a fixed formula cannot separate a soft-edged native drawing from an upscale at small f) */
export function masterCalibratedThreshold(masterPng, factor) { const nat = nativeDetailRatio(masterPng, factor), up = nativeDetailRatio(enlargeBilinear(masterPng, factor), factor); return { native_ref: nat, upscale_ref: up, threshold: (nat + up) / 2, separable: nat - up > 0.15 }; }
export function verifyComponentNative({ deliveredPng, deliveredLandmarks, requirement, scaleFromMaster, masterPng = null }) {
  const span = measureSpan({ png: deliveredPng, landmarks: deliveredLandmarks, measure: requirement.measure, from: requirement.from_landmark, to: requirement.to_landmark, span: requirement.span }), ratio = scaleFromMaster > 1.05 ? nativeDetailRatio(deliveredPng, scaleFromMaster) : null;
  const cal = ratio !== null && masterPng ? masterCalibratedThreshold(masterPng, scaleFromMaster) : null, thr = cal?.separable ? cal.threshold : nativeDetailThreshold(scaleFromMaster);
  const problems = [...(span >= requirement.min_native_px ? [] : [`${requirement.measure} ${span.toFixed(0)} px < ${requirement.min_native_px} px native`]), ...(ratio !== null && ratio < thr ? [`edge sharpness ${ratio.toFixed(3)} < ${thr.toFixed(2)} at ${scaleFromMaster.toFixed(2)}x the master density${cal?.separable ? ` (master-calibrated: native ${cal.native_ref.toFixed(3)}, enlarged ${cal.upscale_ref.toFixed(3)})` : ""}: the component is an upscale, not a native redraw`] : [])];
  return { ok: problems.length === 0, measured_span_px: +span.toFixed(1), native_detail_ratio: ratio === null ? null : +ratio.toFixed(5), threshold: +thr.toFixed(4), calibration: cal && { ...cal, native_ref: +cal.native_ref.toFixed(4), upscale_ref: +cal.upscale_ref.toFixed(4), threshold: +cal.threshold.toFixed(4) }, problems };
}

/** derivationRoute — which dependent jobs need NO new image (deterministic) and which require a source-attached edit */
export function derivationRoute(job) {
  const k = job.asset_kind, m = job.medium?.medium || job.medium;
  if (k === "TYPE" || m === "APPROVED_FONT_AND_VECTOR_TYPE") return { route: "DETERMINISTIC_ENGINE_TYPE", generates_image: false, why: "exact copy set as live vector text in a verified engine font, registered to the page landmarks" };
  if (k === "MASK") return { route: "DETERMINISTIC_FROM_REGISTERED_ALPHA", generates_image: false, why: "occlusion/contact masks are computed from the approved, registered parts' alpha (no painted guess)" };
  if (k === "WORLD_PLANE" || k === "CLEAN_PLATE") return { route: "SOURCE_ATTACHED_LAYER_SEPARATION_EDIT", generates_image: true, why: "a plane cut from the approved world needs the surfaces behind removed layers painted (inpaint edit of the approved master)" };
  if (k === "UNDERPAINT") return { route: "SOURCE_ATTACHED_HIDDEN_SURFACE_EDIT", generates_image: true, why: "hidden surfaces exposed by bending do not exist in the master pixels" };
  if (k === "CEL") return { route: "SOURCE_ATTACHED_STATE_EDIT", generates_image: true, why: "a new pose/expression/view state is a redraw registered to the master" };
  return { route: "SOURCE_ATTACHED_PART_EDIT", generates_image: true, why: "a separable part with its occluded portions completed from the approved master" };
}

/** typeArtwork — deterministic vector TYPE asset: the exact approved copy as live SVG text (no raster glyphs), boxed for registration */
export function typeArtwork({ lines, font = "Outfit", weight = 600, box = [0, 0, 1000, 600], color = "#2b2b33", lineHeight = 1.25, outFile }) {
  if (!Array.isArray(lines) || !lines.length || lines.some((l) => typeof l !== "string" || !l.trim())) throw err("SCHEMA_VIOLATION", { reason: "type artwork needs the exact non-empty copy lines", producer: P });
  const [x, y, w, h] = box, fs0 = Math.floor(h / (lines.length * lineHeight)), esc = (s) => s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}"><g font-family="${esc(font)}" font-weight="${weight}" fill="${color}">${lines.map((l, i) => `<text x="${x}" y="${y + Math.round(fs0 * lineHeight * i + fs0)}" font-size="${fs0}">${esc(l)}</text>`).join("")}</g></svg>`;
  if (outFile) { fs.mkdirSync(path.dirname(outFile), { recursive: true }); fs.writeFileSync(outFile, svg); }
  return { svg, sha256: sha(svg), font, lines, font_px: fs0, landmarks: { type_top: [x + w / 2, y], type_bottom: [x + w / 2, y + h], center: [x + w / 2, y + h / 2] } };
}
