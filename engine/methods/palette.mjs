// F03 + F51 + F61 — conditional colour-role solver.
// Source: STYLE_OPERATIONS F03 (role table: environment base / focal silhouette / body planes / shadow anchor / accent / optical),
// CONDITIONAL_PALETTE F51 (color_role_map, parent-owned base fill + finite material regions, contrast RELATIONSHIP not universal saturation),
// MOLECULAR F61 (slots primary_substrate…optional_emission assigned only after silhouette owners + neighbours; per adjacent pair the
// discrimination channel = luminance | hue | edge; grayscale + 160×90 test; no fixed brand palette).
// Producing operation: authored hue families + situation value structure + neighbour-pair constraints → solved OKLCH values → hex.
// No hex input is accepted for a role (sampled source hexes are witness data, never targets).
import { registerProducer } from "./emit.mjs";
import { need, OPAQUE } from "./core.mjs";

export { hexToRgb, rgbToHex, oklchToRgb, rgbToOklch, lchHex, relLum, contrast, hueDist } from "./color.mjs";
import { hexToRgb, rgbToHex, oklchToRgb, rgbToOklch, lchHex, relLum, contrast, hueDist } from "./color.mjs";
import { RULES } from "./knowledge.mjs";
const RULES_F03 = (m, w) => RULES.F03_hue_family(m, w);
// colours may only enter construction from a solved palette (no literal hex bypass)
const SOLVED = new WeakSet();
export function assertSolved(obj, where) { if (!obj || !SOLVED.has(obj)) throw new Error(`${where}: colours must come from solvePalette() (roles/material planes), not literal hex values`); return obj; }
export const SLOTS = ["primary_substrate", "secondary_support", "main_subject", "active_delta", "material_dark_plane", "material_light_plane", "optional_emission", "shadow_anchor", "accent"];
// F03 situation → value structure of the environment base (the reference SITUATION is chosen, not a swatch)
export const SITUATIONS = {
  quiet_light_field: { substrateL: 0.93, supportL: 0.86, why: "pale quiet acting field (F03 row 1; BRAIN@157 lemon field / AI@444 pale theatre)" },
  layered_mid_landscape: { substrateL: 0.72, supportL: 0.55, why: "layered landscape value strata (F03 row 1; NUCLEAR farm olives)" },
  saturated_interior: { substrateL: 0.68, supportL: 0.6, why: "vivid interior room planes (F03; MEMORIES cyan clinic)" },
  dark_field: { substrateL: 0.16, supportL: 0.24, why: "near-black field (F03; SOLAR space / MEMORIES@62 / AI@874)" },
};

/** solvePalette(design)
 *  design: { situation: key of SITUATIONS,
 *            roles: { <roleId>: { slot, hue (deg, authored for THIS subject), chroma (0..0.37), owners:[silhouette ids], L? (only for main_subject/accent: preferred) } },
 *            pairs: [{ a, b, channel: "luminance"|"hue"|"edge", min, adjust: a|b }],    // F61 contrast pair graph
 *            recede?: [{ role, against, max }],                                          // F03: low-contrast infrastructure recedes
 *            materials?: { <matId>: { role, planeStep (OKLCH ΔL), shadeHueShift (deg toward ambient), ambientHue } } }  // F03 body planes inside a family */
function solvePalette__impl(design) {
  need("F03/F61 palette", design, { situation: Object.keys(SITUATIONS), roles: "obj", pairs: "arr" });
  const S = SITUATIONS[design.situation], roles = {};
  for (const [id, r] of Object.entries(design.roles)) {
    need(`F61 role ${id}`, r, { slot: SLOTS, hue: "num", chroma: "num", owners: "arr", L: "?num" });
    if (!r.owners.length) throw new Error(`F61: role "${id}" has no silhouette owners — assign colour only after owners are specified`);
    if (r.chroma < 0 || r.chroma > 0.37) throw new Error(`F61: role ${id} chroma out of range`);
    const base = r.slot === "primary_substrate" ? S.substrateL : r.L ?? (r.slot === "secondary_support" ? S.supportL : S.substrateL > 0.5 ? 0.55 : 0.7); // fix: authored L is consumed for every non-substrate slot (was discarded for support roles)
    roles[id] = { ...r, Lc: [base, r.chroma, r.hue] };
  }
  const hexOf = (id) => lchHex(roles[id].Lc);
  const report = [];
  // iterative constraint satisfaction: move the declared adjustable role's lightness (luminance channel) or hue (hue channel)
  for (let iter = 0; iter < 60; iter++) {
    let ok = true;
    for (const p of design.pairs) {
      need("F61 pair", p, { a: "str", b: "str", channel: ["luminance", "hue", "edge"], min: "num" });
      if (!roles[p.a] || !roles[p.b]) throw new Error(`F61: pair ${p.a}/${p.b} references unknown role`);
      const adj = roles[p.adjust || p.a], other = roles[(p.adjust || p.a) === p.a ? p.b : p.a];
      if (p.channel === "luminance") { if (contrast(hexOf(p.a), hexOf(p.b)) < p.min) { ok = false; adj.Lc[0] = Math.max(0.03, Math.min(0.98, adj.Lc[0] + (adj.Lc[0] >= other.Lc[0] ? 0.02 : -0.02))); } }
      else if (p.channel === "hue") { const d = hueDist(hexOf(p.a), hexOf(p.b)); if (d < p.min) { ok = false; const sgn = ((adj.Lc[2] - other.Lc[2] + 540) % 360) - 180 >= 0 ? 1 : -1; adj.Lc[2] = (adj.Lc[2] + 3 * sgn + 360) % 360; } }
    }
    for (const r of design.recede || []) { const R0 = roles[r.role], A = roles[r.against]; if (contrast(hexOf(r.role), hexOf(r.against)) > r.max) { ok = false; R0.Lc[0] += (A.Lc[0] - R0.Lc[0]) * 0.15; R0.Lc[1] *= 0.9; } }
    if (ok) break;
  }
  const out = {}; for (const id of Object.keys(roles)) out[id] = hexOf(id);
  for (const p of design.pairs) { const v = p.channel === "luminance" ? contrast(out[p.a], out[p.b]) : p.channel === "hue" ? hueDist(out[p.a], out[p.b]) : null; report.push({ pair: `${p.a}/${p.b}`, channel: p.channel, value: v === null ? "edge-owner required" : +v.toFixed(2), min: p.min, pass: v === null ? true : v >= p.min - 1e-6 }); }
  // F03 body planes: lighter/darker sub-regions WITHIN the material family (hue family kept; shade hue drifts toward ambient)
  const materials = {};
  for (const [mid, m] of Object.entries(design.materials || {})) {
    need(`F03 material ${mid}`, m, { role: "str", planeStep: "num", shadeHueShift: "num", ambientHue: "num" });
    const [L, C, H] = roles[m.role].Lc, toward = ((m.ambientHue - H + 540) % 360) - 180;
    materials[mid] = { base: lchHex([L, C, H]), light: lchHex([Math.min(0.98, L + m.planeStep), C * 0.9, H]), shade: lchHex([Math.max(0.03, L - m.planeStep), C * 1.05, H + Math.sign(toward) * Math.min(Math.abs(toward), m.shadeHueShift)]), deep: lchHex([Math.max(0.02, L - 2 * m.planeStep), C, H + Math.sign(toward) * Math.min(Math.abs(toward), 1.6 * m.shadeHueShift)]) };
  }
  for (const [mid, m] of Object.entries(materials)) RULES_F03(m, `F03 material ${mid}`);
  // Gate A: an unsolved relation is a hard failure — nothing downstream may receive these colours.
  const failed = report.filter((r) => !r.pass);
  if (failed.length) { const e = new Error(`F61 PaletteUnsatisfied: ${failed.map((f) => `${f.pair} ${f.channel} ${f.value} < ${f.min}`).join("; ")}`); e.failedRelations = failed; throw e; }
  const edgePairs = (design.pairs || []).filter((p) => p.channel === "edge");
  for (const o of [out, ...Object.values(materials)]) { Object.freeze(o); SOLVED.add(o); OPAQUE.add(o); }
  // "edge" relations are only satisfied once palette.emitEdges() creates owned boundary geometry for them (see emitEdges)
  return { method: ["F03", "F51", "F61"], roles: out, materials, pairs: report, pass: true, edgeObligations: edgePairs.map((p) => ({ a: p.a, b: p.b, owner: p.owner, width: p.width, colorRole: p.colorRole })), situation: S.why };
}

/** F61 test: grayscale + 160×90 discrimination of cause/target vs its support (luminance-only check, the grayscale proxy) */
export function grayscaleRead(pal, focal, support, min = 1.4) { const c = contrast(pal.roles[focal], pal.roles[support]); return { method: "F61", focal, support, contrast: +c.toFixed(2), pass: c >= min }; }

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const solvePalette = registerProducer("palette.solvePalette", solvePalette__impl);

// ---------------- Gate A / spec §4.6: actual adjacency + owned edge geometry ----------------
import { pathPoly, pointInPoly, len, sub, smoothOpen } from "./core.mjs";
import { emitRegion, isMinted } from "./emit.mjs";
import * as RAS from "../authoring/raster.mjs";

/** deriveAdjacency(regions): region pairs whose masks overlap or touch (1-cell dilation). Caller-entered pairs are not the source of truth. */
export function deriveAdjacency(regions, frame = [-200, -200, 2400, 1500], cell = 3) {
  const G = RAS.grid(frame[0], frame[1], frame[2], frame[3], cell), M = regions.map((r) => RAS.mask(G, r.d)), out = [];
  const dil = (A) => { let D = A; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) D = RAS.or(D, RAS.shiftMask(G, A, di, dj)); return D; };
  for (let i = 0; i < regions.length; i++) { const Di = dil(M[i]); for (let j = i + 1; j < regions.length; j++) if (RAS.area(RAS.and(Di, M[j])) > 0) out.push([regions[i].id, regions[j].id]); }
  return out;
}

/** the visible boundary of A against B: runs of A's contour that lie inside B or within tol of B's contour */
export function sharedBoundary(dA, dB, tol = 2.5) {
  const A = pathPoly(dA, 24), B = pathPoly(dB, 24);
  const near = (p) => pointInPoly(p, B) || B.some((q, k) => { const r = B[(k + 1) % B.length], v = sub(r, q), w = sub(p, q), t = Math.max(0, Math.min(1, (w[0] * v[0] + w[1] * v[1]) / ((v[0] ** 2 + v[1] ** 2) || 1))); return len(sub(p, [q[0] + v[0] * t, q[1] + v[1] * t])) <= tol; });
  const flags = A.map(near), runs = [];
  if (flags.every(Boolean)) return [A.concat([A[0]])];
  const start = flags.findIndex((f) => !f);
  let cur = [];
  for (let k = 1; k <= A.length; k++) { const i = (start + k) % A.length; if (flags[i]) cur.push(A[i]); else if (cur.length) { runs.push(cur); cur = []; } }
  if (cur.length) runs.push(cur);
  return runs.filter((r) => r.length >= 3);
}

/** emitEdges(pal, geometry): for every "edge" relation of the solved palette, emit owned trim along the real shared boundary */
function emitEdges__impl(pal, geometry) {
  if (!pal || !Array.isArray(pal.edgeObligations)) throw new Error("F61 emitEdges: needs a solvePalette() result");
  const out = [];
  for (const ob of pal.edgeObligations) {
    const g = geometry[`${ob.a}/${ob.b}`]; if (!g) throw new Error(`F61: edge relation ${ob.a}/${ob.b} has no region geometry bound — an edge contrast cannot be claimed without a drawn boundary`);
    if (!isMinted(g.regionA) || !isMinted(g.regionB)) throw new Error("F61: edge geometry must reference produced regions");
    const width = g.width ?? ob.width, colorRole = g.colorRole ?? ob.colorRole, color = pal.roles[colorRole];
    if (!(width > 0) || !color) throw new Error(`F61: edge ${ob.a}/${ob.b} needs width and a solved colour role (got ${width}, ${colorRole})`);
    const runs = sharedBoundary(g.regionA.d, g.regionB.d);
    if (!runs.length) throw new Error(`F61: regions for ${ob.a}/${ob.b} share no boundary — edge relation unsatisfiable`);
    runs.forEach((run, k) => out.push(emitRegion(["F61", "F62"], "emitEdges", { id: `edge.${g.regionA.id}|${g.regionB.id}.${k}`, d: smoothOpen(run), stroke: color, strokeWidth: width, layer: Math.max(g.regionA.layer, g.regionB.layer) + 0.005, owner: g.owner || g.regionA.id, edgeRole: "COLOR_EDGE" }, [])));
  }
  const missing = pal.edgeObligations.filter((ob) => !out.some((e) => e.id.startsWith(`edge.${geometry[`${ob.a}/${ob.b}`].regionA.id}|`)));
  if (missing.length) throw new Error(`F61: edge relations without emitted geometry: ${missing.map((m) => `${m.a}/${m.b}`).join(", ")}`);
  return { method: ["F61", "F62"], elements: out, data: { edges: out.length } };
}
export const emitEdges = registerProducer("palette.emitEdges", emitEdges__impl);

// ---------------- Gate B root-cause fix: source-conditioned palette design (STAGE1_ARTISTIC_ROOT_CAUSE.md §A/B colour) ----------------
// Chroma level and substrate value are SOURCE_OBSERVATIONS measured from the chosen witness's pixels (STYLE_MEASUREMENTS.json, produced by
// proofs/measure_witnesses.py, hash-checked here). Hues remain ORIGINAL design choices. Authors cannot type chroma: a role declares its
// TIER and the witness statistics decide how saturated it is. The unlike witness must be named (its contrasting condition is recorded).
import fsx from "node:fs"; import pathx from "node:path"; import urlx from "node:url"; import cryptox from "node:crypto";
const STYLE_FILE = pathx.join(pathx.dirname(urlx.fileURLToPath(import.meta.url)), "evidence", "stage1", "STYLE_MEASUREMENTS.json");
export const TIERS = ["substrate", "support", "focal", "accent", "anchor", "plane", "emission"];
function designPalette__impl(d) {
  need("F03 palette design", d, { situation: Object.keys(SITUATIONS), witness: "str", unlikeWitness: "str", roles: "obj", pairs: "arr" });
  const M = JSON.parse(fsx.readFileSync(STYLE_FILE, "utf8")), W = M[d.witness], U = M[d.unlikeWitness];
  if (!W || !U) throw new Error(`F03 designPalette: witnesses ${d.witness}/${d.unlikeWitness} have no pixel measurements (run measure_witnesses.py)`);
  for (const w of [W, U]) if (cryptox.createHash("sha256").update(fsx.readFileSync(w.file)).digest("hex") !== w.sha256) throw new Error(`F03 designPalette: witness file changed since measurement (${w.file})`);
  const chromaFor = { substrate: W.substrate.chroma, support: W.chroma_p50, focal: W.chroma_p75, accent: W.chroma_p90, anchor: W.chroma_p50 * 0.75, plane: W.chroma_p50, emission: W.chroma_p90 };
  const roles = {};
  for (const [id, r] of Object.entries(d.roles)) {
    need(`F03 role ${id}`, r, { slot: SLOTS, tier: TIERS, hue: "num", owners: "arr", L: "?num" });
    if (r.chroma !== undefined) throw new Error(`F03 designPalette: role ${id} types a chroma — chroma is a source-measured decision (tier), not an authored constant`);
    roles[id] = { slot: r.slot, hue: r.hue, owners: r.owners, chroma: +chromaFor[r.tier].toFixed(3), ...(r.L !== undefined ? { L: r.L } : r.tier === "substrate" ? {} : {}) };
  }
  const situationOverride = { ...SITUATIONS[d.situation], substrateL: W.substrate.L };
  const prev = SITUATIONS[d.situation]; SITUATIONS[d.situation] = situationOverride;
  let solved; try { solved = solvePalette({ situation: d.situation, roles, pairs: d.pairs, materials: d.materials, recede: d.recede }); } finally { SITUATIONS[d.situation] = prev; }
  return { ...solved, sourceObservation: { witness: d.witness, sha256: W.sha256.slice(0, 16), chromaByTier: chromaFor, substrateL: W.substrate.L, unlike: { witness: d.unlikeWitness, substrateL: U.substrate.L, note: "substrate VALUE is conditional (unlike witness differs); chroma level is the transferred observation" } } };
}
export const designPalette = registerProducer("palette.designPalette", designPalette__impl);

/** F61 (spec §4.6): every pair of TOUCHING top-level regions from different owners must be discriminated by luminance, hue or an owned
 *  edge region. Derived from actual geometry, not caller-listed pairs. Child planes clipped to an owner are excluded (they are meant to be
 *  low-contrast material planes). Returns violations; strict mode throws (non-renderable). */
import { bbox as bboxX } from "./core.mjs";
export function assertAdjacencyContrast(drawing, { minLum = 1.22, minHue = 28, strict = true, ignore = [], allow = [] } = {}) {
  for (const a of allow) if (!(a.a instanceof RegExp && a.b instanceof RegExp && typeof a.why === "string" && a.why.length > 15)) throw new Error("F61 adjacency allow-list entries need {a, b, why} with a recorded reason");
  const tops = drawing.elements.filter((e) => !e.stroke && !e.clip && (e.opacity ?? 1) >= 0.99 && !ignore.some((re) => re.test(e.id)));
  const boxes = tops.map((e) => bboxX(pathPoly(e.d, 6))), edges = drawing.elements.filter((e) => e.stroke);
  const bad = [];
  for (let i = 0; i < tops.length; i++) for (let j = i + 1; j < tops.length; j++) {
    const A = tops[i], B = tops[j], a = boxes[i], b = boxes[j];
    if (A.fill === B.fill) continue; // one continuous material (same fill) — joins are not colour boundaries
    if (allow.some((x) => (x.a.test(A.id) && x.b.test(B.id)) || (x.a.test(B.id) && x.b.test(A.id)))) continue;
    if ((A.owner && A.owner === B.owner) || a[2] < b[0] || b[2] < a[0] || a[3] < b[1] || b[3] < a[1]) continue;
    const x0 = Math.max(a[0], b[0]) - 3, y0 = Math.max(a[1], b[1]) - 3, x1 = Math.min(a[2], b[2]) + 3, y1 = Math.min(a[3], b[3]) + 3;
    const G = RAS.grid(x0, y0, Math.max(3, x1 - x0), Math.max(3, y1 - y0), 3), MA = RAS.mask(G, A.d), MB = RAS.mask(G, B.d);
    let D = MA; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) D = RAS.or(D, RAS.shiftMask(G, MA, di, dj));
    if (!RAS.area(RAS.and(D, MB))) continue;
    const lum = contrast(A.fill, B.fill), hue = hueDist(A.fill, B.fill), edged = edges.some((e) => e.id.includes(A.id) && e.id.includes(B.id));
    if (lum < minLum && hue < minHue && !edged) bad.push({ a: A.id, b: B.id, luminance: +lum.toFixed(2), hue: +hue.toFixed(1) });
  }
  if (bad.length && strict) { const e = new Error(`F61 adjacency: ${bad.length} touching region pair(s) not discriminated by value/hue/edge, e.g. ${bad.slice(0, 3).map((x) => `${x.a}|${x.b} (L ${x.luminance}, hue ${x.hue})`).join("; ")}`); e.violations = bad; throw e; }
  return { method: "F61", pairsViolating: bad };
}
