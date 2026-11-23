// REGISTERED_MORPH topology and EXPLICIT_DEFORM maps (directive I3; F054). A morph is legal only between HOMOLOGOUS paths: same subpath count
// and order, same closedness, same command structure, same winding, and no self-intersection in sampled in-betweens. A deformation needs an
// APPROVED mesh (receipt id) whose triangles never flip or collapse at sampled weights. Raster crossfades and generic warps are refused.
import { err } from "./errors.mjs";
/** parsePath(d) → [{closed, cmds:[{c, pts:[[x,y]..]}]}] for absolute M/L/C/Q/Z */
export function parsePath(d) {
  const toks = String(d).match(/[MLCQZmlcqz]|-?\d*\.?\d+(?:e[-+]?\d+)?/g) || [], subs = []; let cur = null, i = 0;
  const arity = { M: 1, L: 1, C: 3, Q: 2 };
  while (i < toks.length) { const c = toks[i++]; if (!/[A-Za-z]/.test(c)) throw err("INVALID_MORPH_TOPOLOGY", { reason: `unexpected token ${c}` }); const C = c.toUpperCase(); if (c !== C) throw err("INVALID_MORPH_TOPOLOGY", { reason: "relative path commands must be normalized to absolute before morphing" });
    if (C === "M") { cur = { closed: false, cmds: [] }; subs.push(cur); } if (C === "Z") { cur.closed = true; continue; }
    const pts = []; for (let k = 0; k < arity[C]; k++) pts.push([+toks[i++], +toks[i++]]); cur.cmds.push({ c: C, pts }); }
  return subs;
}
const area = (pts) => pts.reduce((s, p, i) => { const q = pts[(i + 1) % pts.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0) / 2;
const outline = (sub) => sub.cmds.map((c) => c.pts.at(-1));
function selfIntersects(pts) { const n = pts.length, seg = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0; };
  for (let i = 0; i < n; i++) for (let j = i + 2; j < n; j++) { if (i === 0 && j === n - 1) continue; if (seg(pts[i], pts[(i + 1) % n], pts[j], pts[(j + 1) % n])) return true; } return false; }
/** validateMorph(dA, dB, {samples}) → {ok, failures}; the in-betweens are linear in control points, checked at the sampled t values */
export function validateMorph(dA, dB, { samples = [0.25, 0.5, 0.75] } = {}) {
  const A = parsePath(dA), B = parsePath(dB), f = [];
  if (A.length !== B.length) f.push({ code: "INVALID_MORPH_TOPOLOGY", reason: `subpath count ${A.length} ≠ ${B.length}` });
  A.forEach((a, i) => { const b = B[i]; if (!b) return;
    if (a.closed !== b.closed) f.push({ code: "INVALID_MORPH_TOPOLOGY", reason: `subpath ${i} closedness differs` });
    if (a.cmds.map((c) => c.c).join() !== b.cmds.map((c) => c.c).join()) f.push({ code: "INVALID_MORPH_TOPOLOGY", reason: `subpath ${i} command structure differs (${a.cmds.map((c) => c.c).join("")} vs ${b.cmds.map((c) => c.c).join("")})` });
    else if (a.closed && Math.sign(area(outline(a))) !== Math.sign(area(outline(b)))) f.push({ code: "INVALID_MORPH_TOPOLOGY", reason: `subpath ${i} winding reverses` });
    else for (const t of samples) { const mid = a.cmds.map((c, k) => c.pts.map((p, q) => [p[0] + (b.cmds[k].pts[q][0] - p[0]) * t, p[1] + (b.cmds[k].pts[q][1] - p[1]) * t]).at(-1)); if (a.closed && selfIntersects(mid)) f.push({ code: "INVALID_MORPH_TOPOLOGY", reason: `subpath ${i} self-intersects at t=${t}` }); } });
  return { ok: f.length === 0, failures: f };
}
/** validateDeformMap(map) — map = {approved_receipt, vertices:[[x,y]], triangles:[[i,j,k]], targets:[[x,y]] (same length), samples?} */
export function validateDeformMap(map, { samples = [0.25, 0.5, 0.75, 1] } = {}) {
  const f = []; if (!map?.approved_receipt) f.push({ code: "INVALID_DEFORM_MAP", reason: "EXPLICIT_DEFORM requires an approved deformation map receipt" });
  if (!map?.vertices || map.vertices.length !== map.targets?.length) { f.push({ code: "INVALID_DEFORM_MAP", reason: "vertices/targets mismatch" }); return { ok: false, failures: f }; }
  const tri = (P, [i, j, k]) => ((P[j][0] - P[i][0]) * (P[k][1] - P[i][1]) - (P[k][0] - P[i][0]) * (P[j][1] - P[i][1])) / 2;
  for (const T of map.triangles) { const a0 = tri(map.vertices, T); if (Math.abs(a0) < 1e-9) f.push({ code: "INVALID_DEFORM_MAP", reason: `degenerate triangle ${T}` });
    for (const t of samples) { const P = map.vertices.map((v, q) => [v[0] + (map.targets[q][0] - v[0]) * t, v[1] + (map.targets[q][1] - v[1]) * t]), a = tri(P, T); if (Math.sign(a) !== Math.sign(a0) || Math.abs(a) < Math.abs(a0) * 0.05) { f.push({ code: "INVALID_DEFORM_MAP", reason: `triangle ${T} flips/collapses at t=${t}` }); break; } } }
  return { ok: f.length === 0, failures: f };
}
/** deformPoint — piecewise-affine (barycentric) mapping of an art point under an approved map at weight t */
export function deformPoint(map, p, t) {
  for (const [i, j, k] of map.triangles) { const [a, b, c] = [map.vertices[i], map.vertices[j], map.vertices[k]], d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]), l1 = ((b[1] - c[1]) * (p[0] - c[0]) + (c[0] - b[0]) * (p[1] - c[1])) / d, l2 = ((c[1] - a[1]) * (p[0] - c[0]) + (a[0] - c[0]) * (p[1] - c[1])) / d, l3 = 1 - l1 - l2;
    if (l1 >= -1e-9 && l2 >= -1e-9 && l3 >= -1e-9) { const at = (q) => [map.vertices[q][0] + (map.targets[q][0] - map.vertices[q][0]) * t, map.vertices[q][1] + (map.targets[q][1] - map.vertices[q][1]) * t], [A, B, C] = [at(i), at(j), at(k)]; return [l1 * A[0] + l2 * B[0] + l3 * C[0], l1 * A[1] + l2 * B[1] + l3 * C[1]]; } }
  throw err("INVALID_DEFORM_MAP", { reason: `point ${p} outside the approved mesh` });
}
