// Stage-1 method core: typed inputs (no placeholders), read tracking (consumption proof), Bézier/polygon geometry.
import { polys } from "../authoring/raster.mjs";

/** Typed input check. spec: { key: "num" | "num+" | "vec2" | "bool" | ["enum", ...] | "vecs" | "obj" | "arr" | "?num" ... } */
// Gate A (spec §4.11): reads made while VALIDATING are not producing reads. need() suspends read logging.
let VALIDATING = 0;
/** objects that must pass through tracing untouched (solved palettes, emitted regions, composed drawings): identity checks rely on them */
export const OPAQUE = new WeakSet();
export function need(where, obj, spec) { VALIDATING++; try { return needImpl(where, obj, spec); } finally { VALIDATING--; } }
function needImpl(where, obj, spec) {
  if (!obj || typeof obj !== "object") throw new Error(`${where}: structured input object required`);
  for (const [k, t0] of Object.entries(spec)) {
    const opt = typeof t0 === "string" && t0.startsWith("?"), t = opt ? t0.slice(1) : t0, v = obj[k];
    if (v === undefined) { if (opt) continue; throw new Error(`${where}: missing required input "${k}" (${Array.isArray(t) ? t.join("|") : t})`); }
    const bad = (why) => { throw new Error(`${where}: input "${k}" ${why} (got ${JSON.stringify(v)?.slice(0, 60)})`); };
    if (typeof v === "string" && !Array.isArray(t) && /see |authored|receipt|todo|tbd|placeholder/i.test(v)) bad("is a descriptive placeholder, not construction data");
    if (Array.isArray(t)) { if (!t.includes(v)) bad(`must be one of ${t.join("|")}`); }
    else if (t === "num") { if (typeof v !== "number" || !isFinite(v)) bad("must be a number"); }
    else if (t === "num+") { if (typeof v !== "number" || !(v > 0)) bad("must be a positive number"); }
    else if (t === "vec2") { if (!Array.isArray(v) || v.length !== 2 || !v.every((x) => typeof x === "number")) bad("must be [x,y]"); }
    else if (t === "vecs") { if (!Array.isArray(v) || !v.every((p) => Array.isArray(p) && p.length >= 2)) bad("must be [[x,y],...]"); }
    else if (t === "str") { if (typeof v !== "string" || !v.trim()) bad("must be a non-empty identifier string"); }
    else if (t === "bool") { if (typeof v !== "boolean") bad("must be boolean"); }
    else if (t === "arr") { if (!Array.isArray(v)) bad("must be an array"); }
    else if (t === "obj") { if (typeof v !== "object" || Array.isArray(v)) bad("must be an object"); }
  }
  return obj;
}
/** Wrap a design so every READ is recorded (path list). Producing functions receive tracked designs; proofs inspect reads. */
export function tracked(obj, log = new Set(), prefix = "") {
  if (obj === null || typeof obj !== "object" || OPAQUE.has(obj)) return obj;
  return new Proxy(obj, { get(t, k) { if (typeof k === "symbol") return t[k]; const p = prefix ? `${prefix}.${String(k)}` : String(k); const v = t[k]; if (typeof v !== "function" && !VALIDATING) log.add(p); const dsc = Object.getOwnPropertyDescriptor(t, k); if (dsc && !dsc.configurable && !dsc.writable) return v; return tracked(v, log, p); } });
}

// ---------------- geometry ----------------
export const add = (a, b) => [a[0] + b[0], a[1] + b[1]], sub = (a, b) => [a[0] - b[0], a[1] - b[1]], mul = (a, k) => [a[0] * k, a[1] * k];
export const len = (a) => Math.hypot(a[0], a[1]), nrm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; }, perp = (a) => [-a[1], a[0]];
export const lerp2 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
export const rot = (p, deg, c = [0, 0]) => { const r = (deg * Math.PI) / 180, s = Math.sin(r), k = Math.cos(r), d = sub(p, c); return [c[0] + d[0] * k - d[1] * s, c[1] + d[0] * s + d[1] * k]; };
export const f = (v) => +(+v).toFixed(2);
export const P = (p) => `${f(p[0])},${f(p[1])}`;
/** cubic segments [{p0,c1,c2,p1}] → closed path */
export function cubicPath(segs, close = true) { return `M${P(segs[0].p0)} ` + segs.map((s) => `C${P(s.c1)} ${P(s.c2)} ${P(s.p1)}`).join(" ") + (close ? " Z" : ""); }
/** polygon (CCW/CW either) → path */
export const polyPath = (pts, close = true) => "M" + pts.map(P).join(" L") + (close ? " Z" : "");
export function signedArea(pts) { let a = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; a += p[0] * q[1] - q[0] * p[1]; } return a / 2; }
/** dense polygon of a path's first subpath */
export function pathPoly(d, per = 12) { return polys(d, per)[0] || []; }
/** outward vertex normals of a closed polygon */
export function normals(pts) {
  const s = signedArea(pts) > 0 ? 1 : -1; // y-down screen: positive area = clockwise visually
  return pts.map((p, i) => { const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length]; const t = nrm(sub(b, a)); return mul([t[1], -t[0]], s); });
}
export function bbox(pts) { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; }
export function centroid(pts) { return mul(pts.reduce((a, p) => add(a, p), [0, 0]), 1 / pts.length); }

/** method provenance for a produced output: which method(s) produced it and which design paths it read */
export function out(method, fields) { return Object.assign({ method }, fields); }

// ---------------- construction helpers shared by producers ----------------
export const deg = (d) => (d * Math.PI) / 180;
export const dot = (a, b) => a[0] * b[0] + a[1] * b[1];
export const cross = (a, b) => a[0] * b[1] - a[1] * b[0];
/** ellipse polygon (n vertices) centred c, radii rx/ry, rotation rotDeg, from angle a0..a1 (deg) */
export function ellipsePts(c, rx, ry, n = 32, rotDeg = 0, a0 = 0, a1 = 360) {
  const out = [], closed = Math.abs(a1 - a0) >= 360, m = closed ? n : n + 1;
  for (let i = 0; i < m; i++) { const t = deg(a0 + ((a1 - a0) * i) / n); out.push(rot([c[0] + rx * Math.cos(t), c[1] + ry * Math.sin(t)], rotDeg, c)); }
  return out;
}
/** polyline length + point/tangent at arclength fraction s∈[0,1] (closed if closed=true) */
export function arcLen(pts, closed = true) { let L = 0; const n = closed ? pts.length : pts.length - 1; for (let i = 0; i < n; i++) L += len(sub(pts[(i + 1) % pts.length], pts[i])); return L; }
export function at(pts, s, closed = true) {
  const L = arcLen(pts, closed), n = closed ? pts.length : pts.length - 1; let target = ((s % 1) + 1) % 1 * L; if (!closed) target = Math.max(0, Math.min(1, s)) * L;
  for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % pts.length], l = len(sub(b, a)); if (target <= l || i === n - 1) { const t = l ? Math.min(1, target / l) : 0; return { p: lerp2(a, b, t), t: nrm(sub(b, a)), i, u: t }; } target -= l; }
  return { p: pts[0], t: [1, 0], i: 0, u: 0 };
}
/** sub-polyline of a closed polygon between arclength fractions s0→s1 (forward) */
export function between(pts, s0, s1, steps = 24) { const out = []; let span = s1 - s0; if (span <= 0) span += 1; for (let i = 0; i <= steps; i++) out.push(at(pts, s0 + (span * i) / steps).p); return out; }
/** miter offset of a closed polygon by distance dist (positive = outward) with miter limit */
export function offsetPoly(pts, dist) {
  const N = normals(pts);
  return pts.map((p, i) => { const a = N[(i - 1 + pts.length) % pts.length], b = N[i], m = nrm(add(a, b)); const k = Math.max(0.35, dot(m, b)); return add(p, mul(m, dist / k)); });
}
/** offset an open polyline (both sides) → closed ribbon polygon with variable width w(s) */
export function ribbon(line, widthAt) {
  const L = [], Rr = [];
  for (let i = 0; i < line.length; i++) {
    const a = line[Math.max(0, i - 1)], b = line[Math.min(line.length - 1, i + 1)], t = nrm(sub(b, a)), n = perp(t), w = widthAt(i / (line.length - 1)) / 2;
    L.push(add(line[i], mul(n, w))); Rr.push(sub(line[i], mul(n, w)));
  }
  return [...L, ...Rr.reverse()];
}
export const translate = (pts, v) => pts.map((p) => add(p, v));
export const scaleAbout = (pts, k, c) => pts.map((p) => add(c, mul(sub(p, c), k)));
export const rotAbout = (pts, d, c) => pts.map((p) => rot(p, d, c));
/** quadratic-like smooth open curve through points (Catmull-Rom → cubic) */
export function smoothOpen(pts) { if (pts.length < 3) return polyPath(pts, false); let d = `M${P(pts[0])}`; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; d += ` C${P(add(p1, mul(sub(p2, p0), 1 / 6)))} ${P(sub(p2, mul(sub(p3, p1), 1 / 6)))} ${P(p2)}`; } return d; }
export function smoothClosedPath(pts) { const n = pts.length; let d = `M${P(pts[0])}`; for (let i = 0; i < n; i++) { const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n]; d += ` C${P(add(p1, mul(sub(p2, p0), 1 / 6)))} ${P(sub(p2, mul(sub(p3, p1), 1 / 6)))} ${P(p2)}`; } return d + " Z"; }
/** deterministic PRNG (mulberry32) — generators must be seeded, never Math.random */
export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
export function pointInPoly(p, poly) { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const a = poly[i], b = poly[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
/** XOR trick: path A plus path B, filled even-odd and clipped to A, renders exactly A − B (used for plane cuts / exposed regions) */
export const minusPath = (dA, dB) => ({ d: `${dA} ${dB}`, clip: dA });
/** map every absolute "x,y" coordinate pair of a producer-generated path (M/L/C/Z absolute, as emitted by P()) */
export function mapPath(d, fn) { return d.replace(/(-?\d+(?:\.\d+)?(?:e-?\d+)?),(-?\d+(?:\.\d+)?(?:e-?\d+)?)/g, (_, x, y) => P(fn([+x, +y]))); }
export const shiftPath = (d, v) => mapPath(d, (p) => add(p, v));
