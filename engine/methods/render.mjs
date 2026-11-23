// Software rasteriser for Stage-1 pixel proofs (no browser): composed drawing → RGBA → PNG.
// Even-odd scanline fill with 3x3 supersampling, clip paths, stroke approximation (polyline buffer), grayscale / flat / silhouette modes.
import fs from "node:fs";
import zlib from "node:zlib";
import { polys } from "../authoring/raster.mjs";

const hex = (c) => { if (!c || c === "none") return null; const h = c.replace("#", ""); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); };

function coverage(W, H, ds, view, ss = 3) {
  // bbox-limited even-odd scanline coverage with ss×ss supersampling; returns {x0,y0,w,h,C} in output pixels
  const [vx, vy, vw, vh] = view, sx = W / vw, sy = H / vh, edges = [];
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  const polysAll = [].concat(ds).map((d) => polys(d, 16));
  for (const P of polysAll) for (const poly of P) for (const a of poly) { const X = (a[0] - vx) * sx, Y = (a[1] - vy) * sy; if (X < minX) minX = X; if (X > maxX) maxX = X; if (Y < minY) minY = Y; if (Y > maxY) maxY = Y; }
  const x0 = Math.max(0, Math.floor(minX)), y0 = Math.max(0, Math.floor(minY)), x1 = Math.min(W, Math.ceil(maxX) + 1), y1 = Math.min(H, Math.ceil(maxY) + 1);
  const w = Math.max(0, x1 - x0), h = Math.max(0, y1 - y0), C = new Float32Array(w * h);
  if (!w || !h) return { x0, y0, w, h, C };
  const Wc = w * ss, Hc = h * ss, M = new Uint8Array(Wc * Hc);
  for (const P of polysAll) {
    const es = [];
    for (const poly of P) for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; const A = [((a[0] - vx) * sx - x0) * ss, ((a[1] - vy) * sy - y0) * ss], B = [((b[0] - vx) * sx - x0) * ss, ((b[1] - vy) * sy - y0) * ss]; if (A[1] !== B[1]) es.push([A, B]); }
    const tmp = new Uint8Array(Wc * Hc);
    for (let j = 0; j < Hc; j++) {
      const y = j + 0.5, xs = [];
      for (const [a, b] of es) if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) { const i0 = Math.max(0, Math.ceil(xs[k] - 0.5)), i1 = Math.min(Wc - 1, Math.floor(xs[k + 1] - 0.5)); for (let i = i0; i <= i1; i++) tmp[j * Wc + i] ^= 1; }
    }
    for (let i = 0; i < M.length; i++) M[i] |= tmp[i];
  }
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { let n = 0; for (let b = 0; b < ss; b++) for (let a = 0; a < ss; a++) n += M[(j * ss + b) * Wc + i * ss + a]; C[j * w + i] = n / (ss * ss); }
  return { x0, y0, w, h, C };
}
/** stroke → filled outline polygon (round-ish joins by per-vertex quads); used only for elements a method declared as strokes */
function strokeOutline(d, w) {
  const out = [];
  for (const poly of polys(d, 16)) for (let i = 0; i + 1 < poly.length; i++) {
    const a = poly[i], b = poly[i + 1], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, nx = (-dy / l) * w / 2, ny = (dx / l) * w / 2;
    out.push(`M${a[0] + nx},${a[1] + ny} L${b[0] + nx},${b[1] + ny} L${b[0] - nx},${b[1] - ny} L${a[0] - nx},${a[1] - ny} Z`);
  }
  return out;
}

/** render(drawing, {W,H,view,bg,mode}) mode: "color" | "gray" | "silhouette" (every element one ink) */
export function render(drawing, { W = 960, H = 540, view = [0, 0, 1920, 1080], bg = "#ffffff", mode = "color", only = null } = {}) {
  const img = new Float32Array(W * H * 3), B = hex(bg);
  for (let i = 0; i < W * H; i++) img.set(B, i * 3);
  for (const e of drawing.elements) {
    if (only && !only(e)) continue;
    const cov = e.stroke ? coverage(W, H, strokeOutline(e.d, e.strokeWidth || 2), view) : coverage(W, H, e.d, view);
    if (!cov.w || !cov.h) continue;
    let K = null; if (e.clip) K = coverage(W, H, e.clip, view);
    let col = hex(e.stroke || e.fill); if (!col) continue;
    if (mode === "silhouette") col = [30, 30, 40];
    const a = e.opacity ?? 1;
    for (let j = 0; j < cov.h; j++) for (let i = 0; i < cov.w; i++) {
      let c = cov.C[j * cov.w + i] * a; if (!c) continue;
      const X = cov.x0 + i, Y = cov.y0 + j;
      if (K) { const ki = X - K.x0, kj = Y - K.y0; c *= ki >= 0 && kj >= 0 && ki < K.w && kj < K.h ? K.C[kj * K.w + ki] : 0; if (!c) continue; }
      const p = (Y * W + X) * 3; for (let k = 0; k < 3; k++) img[p + k] = img[p + k] * (1 - c) + col[k] * c;
    }
  }
  if (mode === "gray") for (let i = 0; i < W * H; i++) { const y = 0.2126 * img[i * 3] + 0.7152 * img[i * 3 + 1] + 0.0722 * img[i * 3 + 2]; img[i * 3] = img[i * 3 + 1] = img[i * 3 + 2] = y; }
  return { W, H, px: img };
}

/** side-by-side sheet of several renders with equal height */
export function sheet(images, gap = 8, bg = [235, 235, 238]) {
  const H = Math.max(...images.map((i) => i.H)), W = images.reduce((a, i) => a + i.W, 0) + gap * (images.length - 1);
  const px = new Float32Array(W * H * 3); for (let i = 0; i < W * H; i++) px.set(bg, i * 3);
  let x0 = 0; for (const im of images) { for (let j = 0; j < im.H; j++) for (let i = 0; i < im.W; i++) for (let k = 0; k < 3; k++) px[((j) * W + x0 + i) * 3 + k] = im.px[(j * im.W + i) * 3 + k]; x0 += im.W + gap; }
  return { W, H, px };
}
export function stack(images, gap = 8, bg = [235, 235, 238]) {
  const W = Math.max(...images.map((i) => i.W)), H = images.reduce((a, i) => a + i.H, 0) + gap * (images.length - 1);
  const px = new Float32Array(W * H * 3); for (let i = 0; i < W * H; i++) px.set(bg, i * 3);
  let y0 = 0; for (const im of images) { for (let j = 0; j < im.H; j++) for (let i = 0; i < im.W; i++) for (let k = 0; k < 3; k++) px[((y0 + j) * W + i) * 3 + k] = im.px[(j * im.W + i) * 3 + k]; y0 += im.H + gap; }
  return { W, H, px };
}
/** pixel difference count between two renders of equal size (> tol in any channel) */
export function pixelDiff(a, b, tol = 8) { let n = 0; for (let i = 0; i < a.W * a.H; i++) for (let k = 0; k < 3; k++) if (Math.abs(a.px[i * 3 + k] - b.px[i * 3 + k]) > tol) { n++; break; } return n; }

function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
export function writePNG(file, { W, H, px }) {
  const raw = Buffer.alloc((W * 3 + 1) * H);
  for (let j = 0; j < H; j++) { raw[j * (W * 3 + 1)] = 0; for (let i = 0; i < W * 3; i++) raw[j * (W * 3 + 1) + 1 + i] = Math.max(0, Math.min(255, Math.round(px[j * W * 3 + i]))); }
  const chunk = (t, d) => { const len = Buffer.alloc(4); len.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, c]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4); ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  fs.writeFileSync(file, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]));
}
