// Geometric rasterizer for construction tests (Node, no browser): SVG path → even-odd mask on a grid.
// Used by the staged constructor to EXECUTE method tests (containment, coverage, small-size read, plane side).
import { parsePath } from "../lib/geom.mjs";

/** flatten every subpath of an SVG path into polygons */
export function polys(d, per = 12) {
  const segs = parsePath(d), out = []; let cur = null, poly = null;
  const cub = (p0, a, t) => { const u = 1 - t; return [u * u * u * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * a[2] + t * t * t * a[4], u * u * u * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * a[3] + t * t * t * a[5]]; };
  for (const s of segs) {
    if (s.c === "M") { if (poly && poly.length > 2) out.push(poly); poly = [s.p]; cur = s.p; }
    else if (s.c === "L") { poly.push(s.p); cur = s.p; }
    else if (s.c === "C") { for (let k = 1; k <= per; k++) poly.push(cub(cur, s.p, k / per)); cur = [s.p[4], s.p[5]]; }
    else if (s.c === "Z") { if (poly && poly.length > 2) out.push(poly); poly = null; cur = s.p; }
  }
  if (poly && poly.length > 2) out.push(poly);
  return out;
}
/** grid covering a frame; cell = px per cell */
export function grid(x0, y0, w, h, cell = 2) { return { x0, y0, cell, W: Math.ceil(w / cell), H: Math.ceil(h / cell) }; }
export function mask(G, ds, rule = "evenodd") {
  const M = new Uint8Array(G.W * G.H);
  for (const d of [].concat(ds)) {
    const P = polys(d), edges = [];
    for (const poly of P) for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; if (a[1] !== b[1]) edges.push([a, b]); }
    const tmp = new Uint8Array(G.W * G.H);
    for (let j = 0; j < G.H; j++) {
      const y = G.y0 + (j + 0.5) * G.cell, xs = [];
      for (const [a, b] of edges) if ((a[1] <= y) !== (b[1] <= y)) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      xs.sort((p, q) => p - q);
      for (let k = 0; k + 1 < xs.length; k += 2) {
        const i0 = Math.max(0, Math.ceil((xs[k] - G.x0) / G.cell - 0.5)), i1 = Math.min(G.W - 1, Math.floor((xs[k + 1] - G.x0) / G.cell - 0.5));
        for (let i = i0; i <= i1; i++) tmp[j * G.W + i] ^= 1;
      }
    }
    for (let i = 0; i < M.length; i++) M[i] |= tmp[i]; // union of separate paths; even-odd inside each path (holes)
  }
  return M;
}
export const area = (M) => { let n = 0; for (const v of M) n += v; return n; };
export const and = (A, B) => { const C = new Uint8Array(A.length); for (let i = 0; i < A.length; i++) C[i] = A[i] & B[i]; return C; };
export const or = (A, B) => { const C = new Uint8Array(A.length); for (let i = 0; i < A.length; i++) C[i] = A[i] | B[i]; return C; };
export const minus = (A, B) => { const C = new Uint8Array(A.length); for (let i = 0; i < A.length; i++) C[i] = A[i] & !B[i]; return C; };
export const iou = (A, B) => area(and(A, B)) / Math.max(1, area(or(A, B)));
export const inside = (A, B) => area(and(A, B)) / Math.max(1, area(A)); // fraction of A inside B
export function centroid(G, M) { let sx = 0, sy = 0, n = 0; for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) if (M[j * G.W + i]) { sx += i; sy += j; n++; } return n ? [G.x0 + (sx / n + 0.5) * G.cell, G.y0 + (sy / n + 0.5) * G.cell] : null; }
/** downsample by factor f (any-coverage → 1 only if majority covered) to test reads at a reduced size */
export function shrink(G, M, f) {
  const W = Math.floor(G.W / f), H = Math.floor(G.H / f), out = new Uint8Array(W * H);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { let n = 0; for (let b = 0; b < f; b++) for (let a = 0; a < f; a++) n += M[(j * f + b) * G.W + i * f + a]; out[j * W + i] = n * 2 >= f * f ? 1 : 0; }
  return { G: { x0: G.x0, y0: G.y0, cell: G.cell * f, W, H }, M: out };
}

/** shift a mask by (di, dj) cells (used for adjacency tests) */
export function shiftMask(G, M, di, dj) { const O = new Uint8Array(M.length); for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) { const a = i - di, b = j - dj; if (a >= 0 && b >= 0 && a < G.W && b < G.H) O[j * G.W + i] = M[b * G.W + a]; } return O; }
