// Build-time geometry for code-native artwork (Node).
// - parsePath / pathPoints: read any SVG path (M L H V C S Q T Z, abs + rel; arcs approximated by line samples)
// - resample(d, n): rewrite any closed outline as n smooth cubic segments (common topology for morphing)
// - morphable([d...], n): resample several unlike outlines AND align their start point/orientation,
//   so NU's number-by-number path interpolation produces a real shape transformation
// - blend template helpers used by rig blendshapes
// No DOM. Deterministic.

const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;
const f2 = (v) => +v.toFixed(2);

export function parsePath(d) {
  const toks = d.match(/[a-zA-Z]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  const segs = []; // absolute: {c:'M'|'L'|'C'|'Z', p:[...]}
  let i = 0, cmd = null, x = 0, y = 0, sx = 0, sy = 0, lc = null, lq = null;
  const num = () => parseFloat(toks[i++]);
  while (i < toks.length) {
    if (/[a-zA-Z]/.test(toks[i])) cmd = toks[i++];
    const rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase();
    const ox = rel ? x : 0, oy = rel ? y : 0;
    if (C === "M") { x = ox + num(); y = oy + num(); sx = x; sy = y; segs.push({ c: "M", p: [x, y] }); cmd = rel ? "l" : "L"; lc = lq = null; }
    else if (C === "L") { x = ox + num(); y = oy + num(); segs.push({ c: "L", p: [x, y] }); lc = lq = null; }
    else if (C === "H") { x = (rel ? x : 0) + num(); segs.push({ c: "L", p: [x, y] }); lc = lq = null; }
    else if (C === "V") { y = (rel ? y : 0) + num(); segs.push({ c: "L", p: [x, y] }); lc = lq = null; }
    else if (C === "C") { const a = [ox + num(), oy + num(), ox + num(), oy + num(), ox + num(), oy + num()]; segs.push({ c: "C", p: a, from: [x, y] }); x = a[4]; y = a[5]; lc = [a[2], a[3]]; lq = null; }
    else if (C === "S") { const r = lc ? [2 * x - lc[0], 2 * y - lc[1]] : [x, y]; const a = [r[0], r[1], ox + num(), oy + num(), ox + num(), oy + num()]; segs.push({ c: "C", p: a, from: [x, y] }); x = a[4]; y = a[5]; lc = [a[2], a[3]]; lq = null; }
    else if (C === "Q" || C === "T") {
      let q;
      if (C === "Q") q = [ox + num(), oy + num()]; else q = lq ? [2 * x - lq[0], 2 * y - lq[1]] : [x, y];
      const e = [ox + num(), oy + num()];
      segs.push({ c: "C", p: [x + (2 / 3) * (q[0] - x), y + (2 / 3) * (q[1] - y), e[0] + (2 / 3) * (q[0] - e[0]), e[1] + (2 / 3) * (q[1] - e[1]), e[0], e[1]], from: [x, y] });
      x = e[0]; y = e[1]; lq = q; lc = null;
    } else if (C === "A") {
      // approximate arc endpoints with a straight segment sampled later (keeps parser total)
      num(); num(); num(); num(); num(); x = ox + num(); y = oy + num(); segs.push({ c: "L", p: [x, y] }); lc = lq = null;
    } else if (C === "Z") { segs.push({ c: "Z", p: [sx, sy] }); x = sx; y = sy; lc = lq = null; }
    else throw new Error("path command not supported: " + cmd);
  }
  return segs;
}

function cub(p0, a, t) {
  const u = 1 - t;
  return [u * u * u * p0[0] + 3 * u * u * t * a[0] + 3 * u * t * t * a[2] + t * t * t * a[4], u * u * u * p0[1] + 3 * u * u * t * a[1] + 3 * u * t * t * a[3] + t * t * t * a[5]];
}

/** Dense polyline of the first subpath. */
export function pathPoints(d, per = 24) {
  const segs = parsePath(d);
  const pts = [];
  let cur = null;
  for (const s of segs) {
    if (s.c === "M") { if (pts.length) break; cur = s.p; pts.push(cur); }
    else if (s.c === "L" || s.c === "Z") { const n = Math.max(2, Math.round(per / 2)); for (let k = 1; k <= n; k++) pts.push([cur[0] + (s.p[0] - cur[0]) * k / n, cur[1] + (s.p[1] - cur[1]) * k / n]); cur = s.p; if (s.c === "Z") break; }
    else if (s.c === "C") { for (let k = 1; k <= per; k++) pts.push(cub(cur, s.p, k / per)); cur = [s.p[4], s.p[5]]; }
  }
  return pts;
}

function evenly(pts, n) {
  const L = [0];
  for (let i = 1; i < pts.length; i++) L.push(L[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const tot = L[L.length - 1], out = [];
  let j = 1;
  for (let k = 0; k < n; k++) {
    const s = (k / n) * tot;
    while (j < L.length - 1 && L[j] < s) j++;
    const a = pts[j - 1], b = pts[j], u = (s - L[j - 1]) / (L[j] - L[j - 1] || 1);
    out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u]);
  }
  return out;
}
const area = (P) => P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;

/** Closed Catmull-Rom through points → cubic path with exactly n C segments. tension 0..1 (1 = round). */
export function smoothClosed(P, tension = 1) {
  const n = P.length, k = tension / 6;
  let d = `M${f2(P[0][0])},${f2(P[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    d += ` C${f2(p1[0] + (p2[0] - p0[0]) * k)},${f2(p1[1] + (p2[1] - p0[1]) * k)} ${f2(p2[0] - (p3[0] - p1[0]) * k)},${f2(p2[1] - (p3[1] - p1[1]) * k)} ${f2(p2[0])},${f2(p2[1])}`;
  }
  return d + "Z";
}

/** Resample one closed outline into n points (counter-clockwise). */
export function samplePts(d, n = 48) {
  let P = evenly(pathPoints(d, 40), n);
  if (area(P) < 0) P = P.reverse();
  return P;
}
export function resample(d, n = 48, tension = 1) { return smoothClosed(samplePts(d, n), tension); }

/** Resample unlike outlines to one topology and align each to the first (min squared distance). */
export function morphable(paths, n = 48, tension = 1) {
  const sets = paths.map((d) => samplePts(d, n));
  const ref = sets[0];
  const cx = (P) => [P.reduce((s, p) => s + p[0], 0) / P.length, P.reduce((s, p) => s + p[1], 0) / P.length];
  const c0 = cx(ref);
  const out = [smoothClosed(ref, tension)];
  for (let s = 1; s < sets.length; s++) {
    const P = sets[s], c1 = cx(P);
    let best = 0, bv = Infinity;
    for (let o = 0; o < n; o++) {
      let v = 0;
      for (let i = 0; i < n; i++) { const a = ref[i], b = P[(i + o) % n]; v += (a[0] - c0[0] - (b[0] - c1[0])) ** 2 + (a[1] - c0[1] - (b[1] - c1[1])) ** 2; }
      if (v < bv) { bv = v; best = o; }
    }
    out.push(smoothClosed(P.map((_, i) => P[(i + best) % n]), tension));
  }
  return out;
}

/** Split a path into a template ("%" for every number) and its numbers: used for runtime blendshapes. */
export function template(d) {
  const nums = (d.match(NUM) || []).map(Number);
  return { tpl: d.replace(NUM, "%"), nums };
}
export function sameTopology(a, b) { return template(a).tpl === template(b).tpl; }

/** Translate / scale a path's absolute numbers (only valid for absolute-coordinate paths from this module). */
export function xform(d, { x = 0, y = 0, s = 1, sx = s, sy = s } = {}) {
  let i = 0;
  return d.replace(NUM, (m) => { const v = parseFloat(m); const r = (i++ % 2 === 0) ? v * sx + x : v * sy + y; return String(f2(r)); });
}

/** Simple closed shape builders that return paths compatible with resample/morphable. */
export const shape = {
  ellipse: (cx, cy, rx, ry) => `M${cx + rx},${cy} C${cx + rx},${cy + ry * 0.552} ${cx + rx * 0.552},${cy + ry} ${cx},${cy + ry} C${cx - rx * 0.552},${cy + ry} ${cx - rx},${cy + ry * 0.552} ${cx - rx},${cy} C${cx - rx},${cy - ry * 0.552} ${cx - rx * 0.552},${cy - ry} ${cx},${cy - ry} C${cx + rx * 0.552},${cy - ry} ${cx + rx},${cy - ry * 0.552} ${cx + rx},${cy}Z`,
  rrect: (x, y, w, h, r) => `M${x + r},${y} L${x + w - r},${y} Q${x + w},${y} ${x + w},${y + r} L${x + w},${y + h - r} Q${x + w},${y + h} ${x + w - r},${y + h} L${x + r},${y + h} Q${x},${y + h} ${x},${y + h - r} L${x},${y + r} Q${x},${y} ${x + r},${y}Z`,
  poly: (pts) => "M" + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(" L") + "Z",
  star: (cx, cy, r1, r2, k = 5, rot = -90) => shape.poly(Array.from({ length: k * 2 }, (_, i) => { const a = (rot + i * 180 / k) * Math.PI / 180, r = i % 2 ? r2 : r1; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; })),
};
