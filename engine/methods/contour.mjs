// F01 + F58 — identity silhouette construction (STYLE_OPERATIONS F01 procedure 1–5; MOLECULAR F58 build/deliver/falsifier).
// The contour is CONSTRUCTED from: named landmarks (structural/anatomical points that make the subject's function readable),
// joint types at each landmark (smooth / corner / tangent-break), and span characters between landmarks (straight, convex,
// concave, s-curve) with amount, taper and bias. Negative spaces (voids inside, gaps between masses) are first-class inputs.
// No path coordinates are accepted directly: every control point is computed from these inputs.
import { need, add, sub, mul, len, nrm, perp, lerp2, cubicPath, pathPoly, signedArea, rot, dot } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import * as R from "../authoring/raster.mjs";

export const SPAN = ["straight", "convex", "concave", "sCurve"];
export const JOINT = ["smooth", "corner", "tangentBreak"];
export const VIEWS = ["front", "three_quarter_left", "three_quarter_right", "profile_left", "profile_right", "rear", "oblique", "top"];

/** constructSilhouette(design) — design:
 *  { landmarks: [{id, p:[x,y], joint}], spans: [{from, to, character, amount, taper?, bias?}] (closed ring in order),
 *    voids?: [{id, landmarks:[...], spans:[...]}], gaps?: [{id, region:[[x,y]...]}], view: enum, identity: [landmark ids that carry identity],
 *    distinguishes: what makes this subject differ from another of its family (F01 step 1; must name identity landmarks) } */
function constructSilhouette__impl(design) {
  need("F01 silhouette", design, { landmarks: "arr", spans: "arr", view: VIEWS, identity: "arr" });
  if (design.landmarks.length < (design.featureContour ? 3 : 4)) throw new Error(`F01 silhouette: at least ${design.featureContour ? 3 : 4} structural landmarks are required (a ${design.featureContour ? "feature contour" : "silhouette is a designed whole, not a primitive"})`);
  if (design.identity.length < 1) throw new Error("F01 silhouette: name at least one identity-bearing landmark (what distinguishes this subject from its family)");
  const L = Object.fromEntries(design.landmarks.map((l) => { need(`F01 landmark ${l.id}`, l, { p: "vec2", joint: JOINT }); return [l.id, l]; }));
  for (const id of design.identity) if (!L[id]) throw new Error(`F01: identity landmark "${id}" does not exist`);
  const ring = buildRing("F01 silhouette", L, design.spans);
  const voids = (design.voids || []).map((v) => ({ id: v.id, path: buildRing(`F58 void ${v.id}`, Object.fromEntries(v.landmarks.map((l) => [l.id, l])), v.spans).d }));
  return { method: ["F01", "F58"], d: ring.d, spans: ring.spans, voids, gaps: design.gaps || [], landmarks: L, view: design.view, identity: design.identity };
}

/** span construction: control points from the span character (this is where contour design becomes geometry) */
export function buildRing(where, L, spans) {
  if (!spans.length) throw new Error(`${where}: spans required`);
  for (let i = 0; i < spans.length; i++) {
    const s = spans[i]; need(`${where} span ${i}`, s, { character: SPAN, amount: "num", taper: "?num", bias: "?num" });
    if (!L[s.from] || !L[s.to]) throw new Error(`${where}: span ${s.from}→${s.to} references unknown landmarks`);
    if (i && spans[i - 1].to !== s.from) throw new Error(`${where}: span ${i} does not continue from ${spans[i - 1].to}`);
  }
  if (spans[spans.length - 1].to !== spans[0].from) throw new Error(`${where}: spans must close the ring`);
  // ring orientation decides which normal is OUTWARD so "convex" always bulges out of the mass
  const orient = signedArea(spans.map((s) => L[s.from].p)) > 0 ? -1 : 1;
  const n = spans.length, out = [];
  const chord = (s) => sub(L[s.to].p, L[s.from].p);
  // Gate B root-cause fix (STAGE1_ARTISTIC_ROOT_CAUSE.md §C): the span CHARACTER decides on which side of the chord the handles lie, by
  // ROTATING the end tangents (not translating handles), so a designed convex/concave span has a convex control polygon and can never
  // inflect; smooth joints share one tangent (G1) clamped to each span's admissible side; corners keep independent tangents.
  const want = spans.map((s) => { const u = nrm(chord(s)), outN = mul(perp(u), orient), th = Math.atan(Math.abs(s.amount) * 4);
    const sgn = s.character === "convex" ? 1 : s.character === "concave" ? -1 : 0;
    const start = s.character === "sCurve" ? add(mul(u, Math.cos(th)), mul(outN, Math.sin(th))) : add(mul(u, Math.cos(th * Math.abs(sgn))), mul(outN, sgn * Math.sin(th)));
    const end = s.character === "sCurve" ? add(mul(u, Math.cos(th)), mul(outN, Math.sin(th))) : add(mul(u, Math.cos(th * Math.abs(sgn))), mul(outN, -sgn * Math.sin(th)));
    return { u, outN, sgn, start: nrm(start), end: nrm(end) }; });
  const clampSide = (dir, w, atStart) => { // keep the tangent on the span's admissible side of its chord (or on the chord for straight)
    if (w.sgn === 0) return w.u; const side = dot(dir, w.outN) * (atStart ? 1 : -1) * w.sgn; if (dot(dir, w.u) <= 0.05) return atStart ? w.start : w.end; return side > 0.02 ? nrm(dir) : atStart ? w.start : w.end; }; // never fall back to the chord (that re-creates an inflection)
  for (let i = 0; i < n; i++) {
    const s = spans[i], a = L[s.from], b = L[s.to], l = len(chord(s)), w = want[i], prev = want[(i - 1 + n) % n], next = want[(i + 1) % n];
    let t0 = w.start, t1 = w.end;
    if (a.joint === "smooth" && spans[(i - 1 + n) % n].character !== "straight" && s.character !== "straight") t0 = clampSide(nrm(add(prev.end, w.start)), w, true);
    if (b.joint === "smooth" && spans[(i + 1) % n].character !== "straight" && s.character !== "straight") t1 = clampSide(nrm(add(w.end, next.start)), w, false);
    const bias = s.bias ?? 0.5, taper = s.taper ?? 0, h0 = l * 0.36 * (1 + taper) * (bias * 2), h1 = l * 0.36 * (1 - taper) * ((1 - bias) * 2);
    let c1 = add(a.p, mul(t0, Math.min(h0, l * 0.62))), c2 = sub(b.p, mul(t1, Math.min(h1, l * 0.62)));
    // convexity guarantee: a non-sCurve span's control polygon must turn one way only; otherwise use the span's own symmetric tangents
    const convexPoly = (q1, q2) => { const v1 = sub(q1, a.p), v2 = sub(q2, q1), v3 = sub(b.p, q2), k1 = v1[0] * v2[1] - v1[1] * v2[0], k2 = v2[0] * v3[1] - v2[1] * v3[0]; return k1 * k2 >= -1e-6; };
    if (s.character !== "sCurve" && s.character !== "straight" && !convexPoly(c1, c2)) { c1 = add(a.p, mul(w.start, l * 0.36)); c2 = sub(b.p, mul(w.end, l * 0.36)); }
    // ordering guarantee: handle projections along the chord must not cross (crossing handles re-create an inflection)
    const pr = (q) => dot(sub(q, a.p), w.u); let guard = 0;
    while (s.character !== "sCurve" && pr(c1) > pr(c2) - l * 0.05 && guard++ < 8) { c1 = lerp2(a.p, c1, 0.8); c2 = lerp2(b.p, c2, 0.8); }
    if (s.character === "straight") { c1 = lerp2(a.p, b.p, 1 / 3); c2 = lerp2(a.p, b.p, 2 / 3); }
    if (b.joint === "tangentBreak") c2 = lerp2(c2, b.p, 0.6);
    if (a.joint === "tangentBreak") c1 = lerp2(c1, a.p, 0.6);
    out.push({ id: `${s.from}→${s.to}`, character: s.character, amount: s.amount, p0: a.p, c1, c2, p1: b.p });
  }
  return { d: cubicPath(out), spans: out };
}

/** placement of a contour design (F59 uses it to seat a part at its parent's socket): rotate about pivot, then translate */
export function placeDesign(design, { translate = [0, 0], rotate = 0, pivot = [0, 0] }) {
  const mv = (p) => add(rot(p, rotate, pivot), translate);
  const lm = (ls) => ls.map((l) => ({ ...l, p: mv(l.p) }));
  return { ...design, landmarks: lm(design.landmarks), voids: (design.voids || []).map((v) => ({ ...v, landmarks: lm(v.landmarks) })), gaps: (design.gaps || []).map((g) => ({ ...g, region: g.region.map(mv) })) };
}

/** minted silhouette element (fill comes from a palette/material producer, never a literal) */
function silhouetteElement__impl(id, sil, fill, layer = 0) {
  const d = sil.voids.length ? `${sil.d} ${sil.voids.map((v) => v.path).join(" ")}` : sil.d;
  return emitRegion(["F01", "F58"], "constructSilhouette", { id, d, fill, layer, owner: id });
}

/** F58 small-size read: identity gaps must stay open and voids visible at the subject's display size / 10 */
export function silhouetteRead(sil, { displayH, frame = [0, 0, 1920, 1080] }) {
  need("F58 read", { displayH }, { displayH: "num+" });
  const G = R.grid(frame[0], frame[1], frame[2], frame[3], 2);
  let S = R.mask(G, sil.d); for (const v of sil.voids) S = R.minus(S, R.mask(G, v.path));
  const pts = pathPoly(sil.d), ys = pts.map((p) => p[1]), h = Math.max(...ys) - Math.min(...ys);
  const fct = Math.max(1, Math.round(h / (displayH / 10) / G.cell));
  const small = R.shrink(G, S, Math.min(fct, 24)), res = [];
  for (const g of sil.gaps) { const gm = R.mask(G, `M${g.region.map((p) => p.join(",")).join(" L")} Z`); const sg = R.shrink(G, gm, Math.min(fct, 24)); const open = R.area(R.and(sg.M, small.M.map((x) => 1 - x))); res.push({ id: g.id, openCellsAtTenth: open, pass: open >= 1, outside: R.inside(gm, S) < 0.15 }); }
  for (const v of sil.voids) { const vm = R.and(R.mask(G, v.path), R.mask(G, sil.d)); const sv = R.shrink(G, vm, Math.min(fct, 24)); const open = R.area(R.and(sv.M, small.M.map((x) => 1 - x))); res.push({ id: v.id, openCellsAtTenth: open, pass: open >= 1 }); }
  return { method: "F58", factor: fct, results: res, pass: res.every((r) => r.pass) };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructSilhouette = registerProducer("contour.constructSilhouette", constructSilhouette__impl);
export const silhouetteElement = registerProducer("contour.silhouetteElement", silhouetteElement__impl);
