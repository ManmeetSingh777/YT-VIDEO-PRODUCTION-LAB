// F02 + F04 + F46 + F62 + F63 — surfacePatchByCause (spec §4.7). Every patch has {ownerRegionId, cause, sourceGeometry, localLight}.
// Distinct algorithms per cause; NO default shifted-silhouette crescent:
//   flat_facet        polygon on the owner + 3D facet normal → value from normal·light (opaque form, F04)
//   garment_underside band built along the garment's POSED edge landmarks (ports), thickness profile inward → moves with the pose
//   metal_rim         arc band on the light-facing side of a disc/ellipse rim (centred on the light azimuth) → bright rim / dark lip
//   cavity            recess contour + wall on the light-facing side inside the opening (occluding lip)
//   offset_highlight  ONLY with an explicit scope string naming the selected design reason (spec: "explicitly named scope")
import { need, add, sub, mul, nrm, len, perp, dot, polyPath, ellipsePts, shiftPath, rot } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer, isMinted } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const CAUSES = ["flat_facet", "garment_underside", "metal_rim", "cavity", "offset_highlight"];
const nrm3 = (v) => { const l = Math.hypot(...v) || 1; return v.map((x) => x / l); };

function patchByCause__impl(req) {
  need("F46 patch", req, { id: "str", cause: CAUSES, layerOffset: "num" });
  if (!isMinted(req.owner)) throw new Error(`F46 patch ${req.id}: owner must be a produced region`);
  const C = assertSolved(req.colors, `F46 patch ${req.id}`), own = req.owner, lay = own.layer + req.layerOffset, data = { cause: req.cause, owner: own.id };
  const out = (fill, d, extra = {}) => emitRegion(["F02", "F46", "F04"], `patchByCause.${req.cause}`, { id: `${own.id}.${req.id}`, d, clip: own.d, fill, layer: lay, owner: own.id, cause: req.cause, ...extra }, []);
  if (req.cause === "flat_facet") {
    need("F46 facet", req, { polygon: "vecs", normal3: "arr", light3: "arr", tones: "obj" });
    const k = dot3(nrm3(req.normal3), nrm3(req.light3)), tone = k > 0.55 ? "light" : k > 0.05 ? "base" : k > -0.4 ? "shade" : "deep";
    data.k = +k.toFixed(3); data.tone = tone;
    return { method: ["F46", "F04"], elements: tone === "base" ? [] : [out(C[req.tones[tone]], polyPath(req.polygon))], data };
  }
  if (req.cause === "garment_underside") {
    need("F46 underside", req, { run: "vecs", thickness: "arr", light: "vec2", tone: "str" });
    if (req.run.length < 3 || req.thickness.length !== req.run.length) throw new Error(`F46 underside ${req.id}: run of ≥3 posed edge points with one thickness each`);
    const L = nrm(req.light), inner = req.run.map((p, i) => { const a = req.run[Math.max(0, i - 1)], b = req.run[Math.min(req.run.length - 1, i + 1)], n = perp(nrm(sub(b, a))); const into = req.inward === -1 ? mul(n, -1) : n; return add(p, mul(into, req.thickness[i])); });
    // the underside only exists where the edge faces away from the light (receding side of a fold/limb)
    const edgeN = perp(nrm(sub(req.run.at(-1), req.run[0]))), away = dot(req.inward === -1 ? edgeN : mul(edgeN, -1), L) < 0.2;
    data.facesAway = away;
    return { method: ["F46", "F04", "F66"], elements: away ? [out(C[req.tone], polyPath([...req.run, ...inner.reverse()]))] : [], data };
  }
  if (req.cause === "metal_rim") {
    need("F46 rim", req, { center: "vec2", rx: "num+", ry: "num+", rotDeg: "num", width: "num+", light: "vec2", litTone: "str", lipTone: "str" });
    const az = (Math.atan2(req.light[1], req.light[0]) * 180) / Math.PI, span = req.span ?? 70;
    const arc = (a0, a1, r0, r1) => polyPath([...ellipsePts(req.center, req.rx * r1, req.ry * r1, 18, req.rotDeg, a0, a1), ...ellipsePts(req.center, req.rx * r0, req.ry * r0, 18, req.rotDeg, a1, a0)]);
    const wr = 1 - req.width / Math.max(req.rx, req.ry);
    data.azimuth = +az.toFixed(1);
    return { method: ["F46", "F62"], elements: [out(C[req.litTone], arc(az - span, az + span, wr, 1.0001), { id: `${own.id}.${req.id}.lit` }), out(C[req.lipTone], arc(az + 180 - span * 0.8, az + 180 + span * 0.8, wr, 1.0001), { id: `${own.id}.${req.id}.lip` })], data };
  }
  if (req.cause === "cavity") {
    need("F46 cavity", req, { opening: "obj", wall: "num+", light: "vec2", floorTone: "str", wallTone: "str" });
    const op = constructSilhouette({ ...req.opening, featureContour: true }).d, L = nrm(req.light);
    return { method: ["F46", "F04"], elements: [out(C[req.floorTone], op, { id: `${own.id}.${req.id}.floor` }), emitRegion(["F46", "F04"], "patchByCause.cavity_wall", { id: `${own.id}.${req.id}.wall`, d: `${op} ${shiftPath(op, mul(L, -req.wall))}`, clip: op, fill: C[req.wallTone], layer: lay + 0.001, owner: own.id, cause: "cavity" }, [])], data };
  }
  // offset_highlight: allowed only as an explicitly scoped design selection
  need("F46 offset highlight", req, { scope: "str", offset: "vec2", tone: "str" });
  if (req.scope.length < 20) throw new Error(`F46 ${req.id}: an offset highlight needs an explicit design scope (why THIS owner gets it), not a default`);
  return { method: ["F46"], elements: [out(C[req.tone], `${own.d} ${shiftPath(own.d, req.offset)}`)], data: { ...data, scope: req.scope } };
}
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
export const patchByCause = registerProducer("surfaces.patchByCause", patchByCause__impl);

// ---------------- R3 fix: plane PLANNER (STAGE1_ARTISTIC_ROOT_CAUSE.md) ----------------
// For each owner, derive the shade plane from the owner's OWN contour: contour runs whose outward normal faces away from the light
// (F62 "light/dark patch geometry by local surface turning"), inner edge at a material-specific fraction of the LOCAL thickness of the
// mass (ray cast across the mass), smoothed. Different masses get different bands because their contours and thicknesses differ.
import { pathPoly as pathPolyX, normals as normalsX, pointInPoly as pipX } from "./core.mjs";
export const PLANE_MATERIALS = { canvas: { depth: 0.16, minRun: 5 }, cloth: { depth: 0.3, minRun: 5 }, quilted: { depth: 0.34, minRun: 5 }, leather: { depth: 0.38, minRun: 4 }, skin: { depth: 0.16, minRun: 6 }, hair: { depth: 0.26, minRun: 6 }, hard: { depth: 0.2, minRun: 4 } };
function localThickness(poly, i, n) { // distance across the mass along the inward normal
  const p = poly[i], d = mul(n, -1); let t = 1;
  for (; t < 400; t += 2) if (!pipX(add(p, mul(d, t)), poly)) break;
  return t;
}
function planPlanes__impl(req) {
  need("F62 plane planner", req, { owners: "arr", light: "vec2" });
  const C = assertSolved(req.colors, "F62 planner"), L = nrm(req.light), els = [], data = {};
  for (const o of req.owners) {
    need("F62 owner", o, { material: Object.keys(PLANE_MATERIALS), shadeRole: "str" });
    if (!isMinted(o.element)) throw new Error("F62 planner: owner must be a produced region");
    const M = PLANE_MATERIALS[o.material], poly = pathPolyX(o.element.d, 10), N = normalsX(poly);
    const away = N.map((n) => dot(n, L) < -0.18), runs = []; let cur = [];
    const start = away.findIndex((x) => !x); if (start < 0) continue; // fully shadowed shape: owner itself should be the shade value
    for (let k = 1; k <= poly.length; k++) { const i = (start + k) % poly.length; if (away[i]) cur.push(i); else if (cur.length) { runs.push(cur); cur = []; } }
    if (cur.length) runs.push(cur);
    let r = 0;
    for (const run of runs.filter((x) => x.length >= M.minRun)) {
      const th = run.map((i) => localThickness(poly, i, N[i]) * M.depth), sm = th.map((_, k) => { const a = th.slice(Math.max(0, k - 2), k + 3); return a.reduce((x, y) => x + y, 0) / a.length; });
      const taper = (k) => Math.sin(Math.PI * Math.min(1, (k + 0.5) / run.length)); // band thins toward its ends (plane meets the light side)
      const outer = run.map((i) => poly[i]), inner = run.map((i, k) => add(poly[i], mul(N[i], -sm[k] * (0.35 + 0.65 * taper(k)))));
      els.push(emitRegion(["F62", "F46", "F04", "F02"], "planPlanes.turn_band", { id: `${o.element.id}.plane${r++}`, d: polyPath([...outer, ...inner.reverse()]), clip: o.element.d, fill: C[o.shadeRole], layer: o.element.layer + 0.015, owner: o.element.id, cause: "surface_turning_away_from_light" }, []));
    }
    data[o.element.id] = { runs: runs.length, bands: r, material: o.material };
  }
  return { method: ["F62", "F46"], elements: els, data };
}
export const planPlanes = registerProducer("surfaces.planPlanes", planPlanes__impl);
