// F60 (projection from the proof; all planes obey it) + F38 (projection grammar enforced down to small parts) + F08 (architecture,
// oblique projection, footprint/circulation first, families) + F70 (plan footprint → extrusion → roof/front/side → openings with
// wall-local u/v axes; side-face shade from the face's own normal) + F40 (size classes, depth-dependent subdetail, street graph) +
// F10 (furniture/fixtures as usable volumes exposing named contact surfaces).
// screen_point = origin + x·axis_u + y·axis_v + z·axis_h (spec §6). Every facet, opening and road uses the SAME basis.
import { need, add, sub, mul, nrm, dot, cross, len, polyPath, lerp2 } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const VIEW_FAMILIES = ["FLAT_ORTHO", "OBLIQUE_TWO_AXES", "FRONTAL_INTERIOR", "AERIAL", "CIRCULAR_NETWORK", "MACRO_CUTAWAY", "OPTICAL_CONTAINED"];
export const ROOFS = ["flat", "recessed_cap", "pitched", "shallow_arch", "parapet"];

/** declareProjection: the world's single coordinate map (F60 deliver: family, vectors, invariants) */
function declareProjection__impl(p) {
  need("F60 projection", p, { family: VIEW_FAMILIES, origin: "vec2", u: "vec2", v: "vec2", h: "vec2", light: "obj" });
  need("F60 light", p.light, { dir: "arr" });
  if (p.family === "OBLIQUE_TWO_AXES" && Math.abs(cross(p.u, p.v)) < 1e-3) throw new Error("F60: u and v must be independent axes");
  if (p.family === "FLAT_ORTHO" && (p.h[0] !== 0 || p.h[1] !== 0)) throw new Error("F60: a frontal/flat plane must not fabricate a height axis (no fake roof)");
  if (p.family !== "FLAT_ORTHO" && Math.hypot(...p.h) < 1e-6) throw new Error(`F60: ${p.family} needs a non-degenerate height axis h`);
  const P = (x, y, z = 0) => add(add(add(p.origin, mul(p.u, x)), mul(p.v, y)), mul(p.h, z));
  return { ...p, method: "F60", P, light3: nrm3(p.light.dir) };
}
const nrm3 = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

/** F70/F38-B: visible faces of an extruded footprint. Face visibility by screen winding; shade by world normal · light. */
function constructBlock__impl(proj, design) {
  if (proj.method !== "F60") throw new Error("F70: blocks need a declared F60 projection");
  need("F70 block", design, { id: "str", footprint: "vecs", height: "num+", roof: ROOFS, material: "str", layer: "num", depthClass: ["near", "mid", "far"] });
  const C = assertSolved(design.colors, `F70 block ${design.id}`), fp = design.footprint, Z0 = design.baseZ ?? 0, H = design.height, els = [], faces = []; // baseZ: raised blocks (platforms) on the same basis
  if (fp.length < 3) throw new Error("F70: footprint polygon needs ≥3 plan vertices");
  // plan ring orientation in world (x,y): make it counter-clockwise so outward normals are (dy, -dx)
  const area = fp.reduce((a, p, i) => a + cross(p, fp[(i + 1) % fp.length]), 0); const ring = area > 0 ? fp : [...fp].reverse();
  const L = proj.light3, shadeOf = (n3) => { const k = n3[0] * L[0] + n3[1] * L[1] + n3[2] * L[2]; return k > 0.55 ? C.light : k > 0.05 ? C.base : k > -0.4 ? C.shade : C.deep; };
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i], b = ring[(i + 1) % ring.length], n = nrm([b[1] - a[1], -(b[0] - a[0])]);
    const q = [proj.P(a[0], a[1], Z0), proj.P(b[0], b[1], Z0), proj.P(b[0], b[1], Z0 + H), proj.P(a[0], a[1], Z0 + H)];
    const vis = cross(sub(q[1], q[0]), sub(q[3], q[0])) * Math.sign(cross(proj.u, proj.v)) < 0; // faces turned toward the viewer
    if (!vis) continue;
    const fid = `${design.id}.wall${i}`, d = polyPath(q);
    els.push(emitRegion(["F70", "F60", "F38"], "constructBlock.wall", { id: fid, d, fill: shadeOf([n[0], n[1], 0]), layer: design.layer, owner: design.id }, ["footprint", "height", "projection.u", "projection.v", "projection.h", "light.dir"]));
    faces.push({ id: fid, kind: "wall", a, b, H, normal: n, quad: q, d, layer: design.layer, edge: i });
  }
  // roof: top plane (and roof family construction on it)
  const top = ring.map((p) => proj.P(p[0], p[1], Z0 + H)), topD = polyPath(top);
  els.push(emitRegion(["F70", "F60"], "constructBlock.top", { id: `${design.id}.top`, d: topD, fill: shadeOf([0, 0, 1]), layer: design.layer + 0.01, owner: design.id }, ["roof", "height"]));
  faces.push({ id: `${design.id}.top`, kind: "top", quad: top, d: topD });
  if (design.roof === "recessed_cap" || design.roof === "parapet") {
    need("F70 roof", design, { roofInset: "num+", roofDepth: "num+" });
    const c = ring.reduce((a, p) => add(a, p), [0, 0]).map((v) => v / ring.length), inner = ring.map((p) => add(c, mul(sub(p, c), 1 - design.roofInset)));
    const recessD = polyPath(inner.map((p) => proj.P(p[0], p[1], H - (design.roof === "recessed_cap" ? design.roofDepth : 0))));
    els.push(emitRegion(["F70", "F08"], "constructBlock.roof_recess", { id: `${design.id}.roofRecess`, d: recessD, clip: topD, fill: design.roof === "parapet" ? C.shade : C.base, layer: design.layer + 0.02, owner: design.id }, ["roofInset", "roofDepth"]));
    if (design.roof === "recessed_cap") els.push(emitRegion(["F70", "F04"], "constructBlock.roof_recess_wall", { id: `${design.id}.roofRecessWall`, d: `${recessD} ${polyPath(inner.map((p) => proj.P(p[0], p[1], H)))}`, clip: recessD, fill: C.shade, layer: design.layer + 0.021, owner: design.id }, ["roofDepth"]));
  } else if (design.roof === "pitched" || design.roof === "shallow_arch") {
    need("F08 roof", design, { ridgeAxis: ["x", "y"], rise: "num+" });
    if (ring.length !== 4) throw new Error("F08: pitched/arch roofs are constructed on a 4-sided footprint");
    const [p0, p1, p2, p3] = ring, along = design.ridgeAxis === "x" ? [[p0, p3], [p1, p2]] : [[p0, p1], [p3, p2]];
    const steps = design.roof === "pitched" ? 2 : 8, prof = (t) => (design.roof === "pitched" ? 1 - Math.abs(2 * t - 1) : Math.sin(Math.PI * t)) * design.rise;
    const sideA = [], sideB = []; for (let k = 0; k <= steps; k++) { const t = k / steps; sideA.push(proj.P(...lerp2(along[0][0], along[0][1], t), H + prof(t))); sideB.push(proj.P(...lerp2(along[1][0], along[1][1], t), H + prof(t))); }
    // gable ends: the cross-section polygons at both ends of the ridge, drawn where their supporting wall faces the viewer
    const ends = design.ridgeAxis === "x" ? [[sideA, 3], [sideB, 1]] : [[sideA, 0], [sideB, 2]];
    for (const [side, wallIdx] of ends) {
      const wall = faces.find((f) => f.kind === "wall" && f.edge === wallIdx); if (!wall) continue;
      els.push(emitRegion(["F08", "F70"], "constructBlock.gable", { id: `${design.id}.gable${wallIdx}`, d: polyPath(side), fill: shadeOf([wall.normal[0], wall.normal[1], 0]), layer: design.layer + 0.03, owner: design.id }, ["roof", "rise", "ridgeAxis"]));
    }
    for (let k = 0; k < steps; k++) {
      const q = [sideA[k], sideA[k + 1], sideB[k + 1], sideB[k]], runL = len(sub(along[0][1], along[0][0])) / steps, dirA = nrm(sub(along[0][1], along[0][0]));
      const slope = (prof((k + 1) / steps) - prof(k / steps)) / runL, n3 = nrm3([-slope * dirA[0], -slope * dirA[1], 1]); // surface normal of the slope strip in world space
      els.push(emitRegion(["F08", "F70"], "constructBlock.roof_panel", { id: `${design.id}.roof${k}`, d: polyPath(q), fill: shadeOf(n3), layer: design.layer + 0.02 + k * 0.001, owner: design.id }, ["roof", "rise", "ridgeAxis"]));
    }
  }
  return { method: ["F70", "F60", "F38", "F08"], elements: els, faces, data: { visibleWalls: faces.filter((f) => f.kind === "wall").map((f) => f.id), depthClass: design.depthClass } };
}

/** F70/F38/F40 face-local openings: rows/cols in the wall's own (along, height) axes, bounded inside the facet; count from a detail budget */
function constructOpenings__impl(proj, face, design) {
  need("F70 openings", design, { rows: "num", cols: "num", margin: "num", gap: "num", sill: "num", kind: ["window", "door", "vent", "panel"], breakAt: "arr" });
  if (face.kind !== "wall") throw new Error("F70: openings live only on a wall facet (no floating windows)");
  const C = assertSolved(design.colors, "F70 openings"), els = [];
  const W = len(sub(face.b, face.a)), dir = nrm(sub(face.b, face.a)), H = face.H;
  const cw = (W - 2 * design.margin - (design.cols - 1) * design.gap) / design.cols, ch = (H - design.sill - design.margin - (design.rows - 1) * design.gap) / design.rows;
  if (design.rows > 0 && design.cols > 0 && (cw <= 1 || ch <= 1)) throw new Error(`F70: ${design.rows}×${design.cols} openings do not fit facet ${face.id}`);
  for (let r = 0; r < design.rows; r++) for (let c = 0; c < design.cols; c++) {
    if (design.breakAt.some(([rr, cc]) => rr === r && cc === c)) continue; // pattern breaks (doors, signs, utilities)
    const s0 = design.margin + c * (cw + design.gap), z0 = design.sill + r * (ch + design.gap);
    const pt = (s, z) => proj.P(...add(face.a, mul(dir, s)), z);
    const q = [pt(s0, z0), pt(s0 + cw, z0), pt(s0 + cw, z0 + ch), pt(s0, z0 + ch)];
    els.push(emitRegion(["F70", "F38", "F54"], "constructOpenings", { id: `${face.id}.${design.kind}${r}_${c}`, d: polyPath(q), clip: face.d, fill: design.lit?.[`${r}_${c}`] ? C.emit : C.deep, layer: (face.layer ?? 0) + 0.05, owner: face.id }, ["rows", "cols", "margin", "gap", "sill", "breakAt"]));
  }
  return { method: ["F70", "F38"], elements: els };
}

/** F08 step 2 / F40: site footprint + circulation graph BEFORE facades — roads as exposed ribbons between blocks, drawn below them */
function constructSite__impl(proj, design) {
  need("F08 site", design, { id: "str", ground: "vecs", roads: "arr" });
  const C = assertSolved(design.colors, "F08 site"), els = [emitRegion(["F08", "F60"], "constructSite.ground", { id: `${design.id}.ground`, d: polyPath(design.ground.map((p) => proj.P(p[0], p[1], 0))), fill: C.ground, layer: -10, owner: design.id }, ["ground"])];
  for (const r of design.roads) {
    need("F08 road", r, { id: "str", path: "vecs", width: "num+" });
    const L = [], Rr = []; r.path.forEach((p, i) => { const a = r.path[Math.max(0, i - 1)], b = r.path[Math.min(r.path.length - 1, i + 1)], n = nrm([-(b[1] - a[1]), b[0] - a[0]]); L.push(add(p, mul(n, r.width / 2))); Rr.push(sub(p, mul(n, r.width / 2))); });
    els.push(emitRegion(["F08", "F40"], "constructSite.road", { id: `${design.id}.${r.id}`, d: polyPath([...L, ...Rr.reverse()].map((p) => proj.P(p[0], p[1], 0))), fill: C.road, layer: -9, owner: design.id }, ["roads"]));
  }
  return { method: ["F08", "F40"], elements: els };
}

/** F40: painter's order + size classes + depth-dependent subdetail (near: openings/caps; far: mass + one highlight) */
function orderBlocks__impl(proj, blocks) {
  const key = (b) => { const c = b.footprint.reduce((a, p) => add(a, p), [0, 0]).map((v) => v / b.footprint.length); return dot(proj.P(c[0], c[1], 0), [0, 1]); };
  const sorted = [...blocks].sort((a, b) => key(a) - key(b));
  const hs = blocks.map((b) => b.height).sort((a, b) => a - b), cls = (h) => (h >= hs[Math.floor(hs.length * 0.75)] ? "primary" : h >= hs[Math.floor(hs.length * 0.35)] ? "medium" : "infill");
  const classes = new Set(blocks.map((b) => cls(b.height)));
  return { order: sorted.map((b) => b.id), sizeClasses: Object.fromEntries(blocks.map((b) => [b.id, cls(b.height)])), threeClasses: classes.size >= 3 };
}

/** F38/F60 pass check: extend every wall edge — all vertical edges must be parallel to h, horizontal ones to u or v */
export function axisAgreement(proj, faces, tol = 0.02) {
  const bad = [];
  for (const f of faces.filter((f) => f.kind === "wall")) { const [q0, q1, , q3] = f.quad, vert = nrm(sub(q3, q0)), hor = nrm(sub(q1, q0)); if (Math.abs(cross(vert, nrm(proj.h))) > tol) bad.push(`${f.id}: vertical edge off h`); const okH = Math.abs(cross(hor, nrm(proj.u))) < tol || Math.abs(cross(hor, nrm(proj.v))) < tol; if (!okH && !f.freeAngle) bad.push(`${f.id}: base edge on neither u nor v (declare a rotated footprint family)`); }
  return { method: "F38", bad, pass: bad.length === 0 };
}

/** F10: furniture / fixture as a usable volume that EXPOSES named contact surfaces (actors are placed against these, never free) */
function constructFixture__impl(proj, design) {
  need("F10 fixture", design, { id: "str", kind: ["seat", "table", "cabinet", "shelf", "bench"], footprint: "vecs", height: "num+", contacts: "arr" });
  const blk = constructBlock(proj, { ...design, roof: "flat", depthClass: design.depthClass || "mid", material: design.material || "wood", layer: design.layer ?? 0 });
  const top = blk.faces.find((f) => f.kind === "top"), contacts = {};
  for (const c of design.contacts) { need("F10 contact", c, { id: "str", on: ["top", "front"], at: "vec2" }); contacts[c.id] = c.on === "top" ? proj.P(c.at[0], c.at[1], design.height) : proj.P(c.at[0], c.at[1], design.height * 0.5); }
  if (!top) throw new Error("F10: fixture has no usable top surface");
  return { ...blk, method: ["F10", "F70"], data: { ...blk.data, contactSurfaces: contacts } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const declareProjection = registerProducer("projection.declareProjection", declareProjection__impl);
export const constructBlock = registerProducer("projection.constructBlock", constructBlock__impl);
export const constructOpenings = registerProducer("projection.constructOpenings", constructOpenings__impl);
export const constructSite = registerProducer("projection.constructSite", constructSite__impl);
export const constructFixture = registerProducer("projection.constructFixture", constructFixture__impl);
export const orderBlocks = registerProducer("projection.orderBlocks", orderBlocks__impl);
