// Execution systems connected to the render path (P03 repairs E and F). Pure helpers used by temporal.mjs (per-frame state) and
// scene_graph.mjs (paint passes); nothing here draws new art: deformation moves APPROVED pixels with piecewise-affine triangles, vector
// morphs interpolate APPROVED homologous paths, shadows re-use the APPROVED occluder drawing projected onto a declared receiver.
import { err } from "./errors.mjs";
import { validateDeformMap, validateMorph, parsePath } from "./deform.mjs";

/** affine (canonical → canonical) mapping source triangle s[3] onto destination triangle d[3]; SVG matrix order [a,b,c,d,e,f] */
export function triAffine(s, d) {
  const [x0, y0] = s[0], [x1, y1] = s[1], [x2, y2] = s[2], det = (x1 - x0) * (y2 - y0) - (x2 - x0) * (y1 - y0);
  if (Math.abs(det) < 1e-12) throw err("DEFORM_RENDER_FAILURE", { reason: "degenerate source triangle" });
  const ia = (y2 - y0) / det, ib = -(x2 - x0) / det, ic = -(y1 - y0) / det, id = (x1 - x0) / det; // inverse of [[x1-x0, x2-x0],[y1-y0, y2-y0]]
  const ux = d[1][0] - d[0][0], vx = d[2][0] - d[0][0], uy = d[1][1] - d[0][1], vy = d[2][1] - d[0][1];
  const a = ux * ia + vx * ic, c = ux * ib + vx * id, b = uy * ia + vy * ic, dd = uy * ib + vy * id;
  return [a, b, c, dd, d[0][0] - a * x0 - c * y0, d[0][1] - b * x0 - dd * y0];
}
const triArea = (t) => ((t[1][0] - t[0][0]) * (t[2][1] - t[0][1]) - (t[2][0] - t[0][0]) * (t[1][1] - t[0][1])) / 2;
const ccw = (t) => (triArea(t) < 0 ? [t[0], t[2], t[1]] : t);
const polyArea = (p) => Math.abs(p.reduce((s, q, i) => { const r = p[(i + 1) % p.length]; return s + q[0] * r[1] - r[0] * q[1]; }, 0) / 2);
/** Sutherland–Hodgman clip of a convex polygon by a CCW triangle */
function clipConvex(poly, tri) { let out = poly; for (let i = 0; i < 3 && out.length; i++) { const a = tri[i], b = tri[(i + 1) % 3], inside = (p) => (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) >= -1e-9, next = []; for (let k = 0; k < out.length; k++) { const p = out[k], q = out[(k + 1) % out.length], ip = inside(p), iq = inside(q), X = () => { const d1 = (b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]), d2 = (b[0] - a[0]) * (q[1] - a[1]) - (b[1] - a[1]) * (q[0] - a[0]), t = d1 / (d1 - d2); return [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]; }; if (ip) next.push(p); if (ip !== iq) next.push(X()); } out = next; } return out; }
const signedArea = (P, [i, j, k]) => ((P[j][0] - P[i][0]) * (P[k][1] - P[i][1]) - (P[k][0] - P[i][0]) * (P[j][1] - P[i][1])) / 2;
/** validate a deformation map against its asset at compile time (mesh must cover approved pixels only) */
export function validateDeformBinding(id, map, asset) {
  const out = [], v = validateDeformMap(map); for (const x of v.failures) out.push(err(x.code, { record_id: id, reason: x.reason }));
  if (!asset) { out.push(err("MISSING_ART_ASSET", { record_id: id, reason: `deform map names asset ${map.asset}, which is not registered` })); return out; }
  const [rx, ry, rw, rh] = asset.canonical_rect, inside = (p) => p[0] >= rx - 1e-6 && p[1] >= ry - 1e-6 && p[0] <= rx + rw + 1e-6 && p[1] <= ry + rh + 1e-6;
  if (!(map.vertices || []).every(inside)) out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: `mesh vertices leave the approved canonical rect of ${asset.id}: a deformation may only move approved pixels` }));
  // P04 §5.5: geometric coverage of the WHOLE approved drawing — real tiling of the rect by non-overlapping triangles (a duplicate/overlapping
  // triangle whose SUMMED area happens to match is refused), connected as one mesh, every vertex inside the rect
  const tv = (T) => T.map((q) => map.vertices[q]), P = (map.triangles || []).map(tv);
  if (P.length && P.every((t) => t.every(Boolean))) {
    const keyOf = (T) => [...T].sort((x, y) => x - y).join(","), seen = new Set(); for (const T of map.triangles) { const k = keyOf(T); if (seen.has(k)) out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: `duplicate triangle ${T}: a duplicated triangle double-covers pixels and its summed area must never stand in for coverage` })); seen.add(k); }
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) { const ov = polyArea(clipConvex(ccw(P[i]), ccw(P[j]))); if (ov > 1e-3 * Math.abs(triArea(P[i])) + 1e-6) { out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: `triangles ${i} and ${j} overlap by ${ov.toFixed(2)} canonical px²: overlapping triangles paint the same approved pixels twice` })); break; } }
    const cover = P.reduce((s, t) => s + Math.abs(triArea(t)), 0), rectA = rw * rh; if (Math.abs(cover - rectA) > 0.005 * rectA) out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: `triangles cover ${(100 * cover / rectA).toFixed(1)}% of ${asset.id}'s approved canonical rect; approved pixels outside the mesh would be dropped` }));
    // connectivity: one component through shared vertices
    const par = [...map.triangles.keys()], find = (x) => (par[x] === x ? x : (par[x] = find(par[x]))), byV = new Map(); map.triangles.forEach((T, i) => T.forEach((v) => { if (byV.has(v)) par[find(i)] = find(byV.get(v)); else byV.set(v, i); })); if (new Set(par.map((_, i) => find(i))).size > 1) out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: "mesh is not connected (separate pieces would tear the drawing)" }));
  }
  if (!Array.isArray(map.weight) || !map.weight.length) out.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: "deform map needs a weight track (KEYS)" }));
  return out;
}
/** per-frame deformation: vertices at weight w; every triangle's affine; a flip/collapse at THIS frame is a failure (not just at samples) */
export function deformAt(map, w, { frame = null, id = null } = {}) {
  const P = map.vertices.map((v, q) => [v[0] + (map.targets[q][0] - v[0]) * w, v[1] + (map.targets[q][1] - v[1]) * w]), failures = [], affines = [];
  map.triangles.forEach((T, i) => { const a0 = signedArea(map.vertices, T), a = signedArea(P, T);
    if (Math.sign(a) !== Math.sign(a0) || Math.abs(a) < Math.abs(a0) * 0.05) failures.push(err("DEFORM_RENDER_FAILURE", { record_id: id, frame_range: frame === null ? null : [frame, frame + 1], reason: `triangle ${i} [${T}] inverts/collapses at weight ${w.toFixed(3)}: the deformation would fold approved art` }));
    affines.push(triAffine(T.map((q) => map.vertices[q]), T.map((q) => P[q]))); });
  return { weight: w, vertices: P, affines, failures };
}
/** dilated source triangle (canonical) — tiny overlap hides anti-aliasing seams between neighbouring clip triangles */
export function dilate(tri, by) { const c = [(tri[0][0] + tri[1][0] + tri[2][0]) / 3, (tri[0][1] + tri[1][1] + tri[2][1]) / 3]; return tri.map(([x, y]) => { const dx = x - c[0], dy = y - c[1], L = Math.hypot(dx, dy) || 1; return [x + (dx / L) * by, y + (dy / L) * by]; }); }

/* ---------- vector morphs (REGISTERED_MORPH between homologous approved paths) ---------- */
export function validateMorphBinding(id, m, A, B) {
  const out = []; if (!A || !B) { out.push(err("MISSING_ART_ASSET", { record_id: id, reason: `morph needs registered vector assets ${m.from} and ${m.to}` })); return out; }
  if (A.kind !== "VECTOR_PATH" || B.kind !== "VECTOR_PATH") out.push(err("INVALID_MORPH_TOPOLOGY", { record_id: id, reason: "a numeric morph needs VECTOR_PATH art on both ends; raster art needs registered cels or a deformation map" }));
  const pa = A.vector_paths || [], pb = B.vector_paths || []; if (pa.length !== pb.length) out.push(err("INVALID_MORPH_TOPOLOGY", { record_id: id, reason: `path count ${pa.length} ≠ ${pb.length}` }));
  pa.forEach((p, i) => { if (!pb[i]) return; const v = validateMorph(p.d, pb[i].d); for (const x of v.failures) out.push(err(x.code, { record_id: `${id}:path${i}`, reason: x.reason })); if (p.fill !== pb[i].fill) out.push(err("INVALID_MORPH_TOPOLOGY", { record_id: `${id}:path${i}`, reason: "fill owner differs between morph ends (colour is not interpolated)" })); });
  if (!Array.isArray(m.weight) || !m.weight.length) out.push(err("INVALID_MORPH_TOPOLOGY", { record_id: id, reason: "morph needs a weight track (KEYS)" }));
  return out;
}
const num = (v) => +v.toFixed(3);
/** interpolated d strings at weight w (control points linear; command structure identical by validation) */
export function morphAt(A, B, w) { return A.vector_paths.map((p, i) => { const a = parsePath(p.d), b = parsePath(B.vector_paths[i].d); return a.map((s, k) => s.cmds.map((c, q) => `${c.c}${c.pts.map((pt, r) => `${num(pt[0] + (b[k].cmds[q].pts[r][0] - pt[0]) * w)} ${num(pt[1] + (b[k].cmds[q].pts[r][1] - pt[1]) * w)}`).join(" ")}`).join(" ") + (s.closed ? " Z" : "")).join(" "); }); }

/* ---------- cast shadows (motion_systems.castShadow is the relation/material authority) ---------- */
/** oblique projection of a world point onto the receiver floor plane: points ON the plane stay put (the contact is preserved) */
// receiver.depth_direction: +1 = the receiving floor is seen BELOW the contact line (shadow falls toward the viewer), -1 = above it (away)
export function shadowAffine(light, receiver) { const [lx, ly] = light.direction, s = (receiver.depth_direction ?? 1) >= 0 ? -1 : 1, fs = (receiver.foreshorten ?? 0.3) * s, a = (lx / ly) * Math.abs(fs), py = receiver.plane_y; return [1, 0, -a, fs, a * py, (1 - fs) * py]; }

/* ---------- mechanism reaction (HINGE_FOLLOW): the handle keeps its grip distance to the driver joint, so a lean-back PULLS the lever ---------- */
const rot = (p, c, deg) => { const r = (deg * Math.PI) / 180, dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(r) - dy * Math.sin(r), c[1] + dx * Math.sin(r) + dy * Math.cos(r)]; };
export function solveHinge({ pivot, handle, theta, driver, d0, limits, step = 0.1 }) {
  const g = (t) => Math.hypot(...[0, 1].map((k) => rot(handle, pivot, t - theta)[k] - driver[k])) - d0;
  // nearest root of g on the limit interval, scanning outward from the current angle (deterministic, no history)
  let best = null; const g0 = g(theta); if (Math.abs(g0) < 1e-6) return { ok: true, angle: theta, residual: Math.abs(g0) };
  for (let k = 1; k * step <= limits[1] - limits[0] + step; k++) for (const s of [1, -1]) { const t1 = theta + s * (k - 1) * step, t2 = theta + s * k * step; if (t2 < limits[0] - 1e-9 || t2 > limits[1] + 1e-9) continue; const a = g(t1), b = g(t2);
      if (a === 0 || Math.sign(a) !== Math.sign(b)) { let lo = t1, hi = t2; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (Math.sign(g(m)) === Math.sign(g(lo))) lo = m; else hi = m; } best = (lo + hi) / 2; break; } if (best !== null) break; }
  if (best === null) { const tt = []; for (let t = limits[0]; t <= limits[1]; t += step) tt.push([Math.abs(g(t)), t]); tt.sort((p, q) => p[0] - q[0]); return { ok: false, angle: tt[0][1], residual: tt[0][0] }; }
  return { ok: true, angle: best, residual: Math.abs(g(best)) };
}
/** centre of mass (x) of a rig from weighted joint world positions */
export function comX(M, rig, mass) { let s = 0, m = 0; for (const [j, w] of Object.entries(mass)) { const J = rig.joints.find((x) => x.id === j); if (!J || !M[j]) continue; const p = [M[j][0] * J.rest_xy[0] + M[j][2] * J.rest_xy[1] + M[j][4]]; s += w * p[0]; m += w; } return m ? s / m : null; }
