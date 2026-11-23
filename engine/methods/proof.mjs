// Causal proof harness (Gate A, spec §4.11). Class-correct evidence:
//   ART_DESIGN / GEOMETRY — ≥1 perturbation of a design-bearing input must change EMITTED REGIONS (not only data/strings), and the
//       rasterised pixel difference must lie inside the footprints of the regions that changed (pixel-level confinement). Empty
//       perturbation lists FAIL. Reads made inside need() validation do not count as consumption (core.mjs VALIDATING).
//   MOTION_STATE — ≥1 perturbation of the method's OWN selection table/state input must change its own output records.
//   ROUTING — ≥1 perturbation must change which downstream producer is actually EXECUTED (receipt ids), via spec.dispatch(result).
//   EVIDENCE_GATE — ≥1 accepted real record (spec.accept) AND ≥1 refusal; never passes on refusals alone.
import { tracked, pathPoly, bbox } from "./core.mjs";
import { signature, compose } from "./emit.mjs";
import { render } from "./render.mjs";

export const CLASSES = ["ART_DESIGN", "GEOMETRY", "MOTION_STATE", "ROUTING", "EVIDENCE_GATE"];
const clone = (o) => (o === undefined ? o : JSON.parse(JSON.stringify(o)));
function setPath(o, path, v) { const ks = path.split("."); let t = o; for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]]; if (typeof v === "function") t[ks.at(-1)] = v(t[ks.at(-1)]); else t[ks.at(-1)] = v; return o; }
function delPath(o, path) { const ks = path.split("."); let t = o; for (let i = 0; i < ks.length - 1; i++) t = t[ks[i]]; delete t[ks.at(-1)]; return o; }

export function sig(result) {
  const s = result?.elements ? signature(result.elements) : {};
  if (result?.data) for (const [k, v] of Object.entries(result.data)) s[`data:${k}`] = JSON.stringify(v);
  return s;
}
const changed = (a, b) => [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => a[k] !== b[k]);
const elBox = (e) => { const b = bbox(pathPoly(e.d, 8)); const w = (e.strokeWidth || 0) / 2 + 2; return [b[0] - w, b[1] - w, b[2] + w, b[3] + w]; };

/** pixel causality: render both results in one view; every changed pixel must fall inside a changed region's footprint (before ∪ after) */
export function pixelCausality(r0, r1, changedIds) {
  const all = [...r0.elements, ...r1.elements]; if (!all.length) return { pass: false, why: "no regions" };
  const bx = all.map(elBox), x0 = Math.min(...bx.map((b) => b[0])), y0 = Math.min(...bx.map((b) => b[1])), x1 = Math.max(...bx.map((b) => b[2])), y1 = Math.max(...bx.map((b) => b[3]));
  const vw = x1 - x0 + 20, vh = y1 - y0 + 20, W = 420, H = Math.max(40, Math.round((W * vh) / vw)), view = [x0 - 10, y0 - 10, vw, vh];
  const A = render(compose("proof0", r0.elements), { W, H, view, bg: "#808080" }), B = render(compose("proof1", r1.elements), { W, H, view, bg: "#808080" });
  const allowed = [...r0.elements, ...r1.elements].filter((e) => changedIds.includes(e.id)).map(elBox);
  let inside = 0, outside = 0;
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = (j * W + i) * 3; if (Math.abs(A.px[k] - B.px[k]) + Math.abs(A.px[k + 1] - B.px[k + 1]) + Math.abs(A.px[k + 2] - B.px[k + 2]) < 24) continue;
    const X = view[0] + ((i + 0.5) * view[2]) / W, Y = view[1] + ((j + 0.5) * view[3]) / H;
    if (allowed.some((b) => X >= b[0] && X <= b[2] && Y >= b[1] && Y <= b[3])) inside++; else outside++;
  }
  return { pass: inside > 0 && outside === 0, changedPixels: inside + outside, outsideChangedRegions: outside };
}

/** spec: { method, class, producer, base, inputs, perturb:[{path, value, expect, confine?}], refuse:[...], accept?:[{path,value}], dispatch?:(r)=>string[], falsifier? } */
export function prove(spec) {
  const rec = { method: spec.method, class: spec.class, name: spec.name || spec.method, consumes: [], causal: [], refuses: [], accepts: [], falsifier: null, pass: true, problems: [] };
  if (!CLASSES.includes(spec.class)) { rec.pass = false; rec.problems.push(`proof class required (${CLASSES.join("|")})`); return rec; }
  const log = new Set(); let base;
  try { base = spec.producer(tracked(clone(spec.base), log)); } catch (e) { rec.pass = false; rec.error = `base build failed: ${e.message}`; return rec; }
  const S0 = sig(base); rec.outputs = Object.keys(S0).length;
  for (const p of spec.inputs || []) { const ok = [...log].some((r) => r === p || r.startsWith(p + ".")); rec.consumes.push({ input: p, read: ok }); if (!ok) rec.pass = false; }
  const P = spec.perturb || [];
  if (spec.class !== "EVIDENCE_GATE" && !P.length) { rec.pass = false; rec.problems.push("no causal perturbation — a proof without one cannot pass"); }
  let regionCausal = 0;
  for (const t of P) {
    let r; try { r = spec.producer(clone(setPath(clone(spec.base), t.path, t.value))); } catch (e) { rec.causal.push({ path: t.path, pass: false, error: e.message }); rec.pass = false; continue; }
    const S1 = sig(r), ch = changed(S0, S1), hit = ch.filter((k) => t.expect.test(k)), leak = t.confine ? ch.filter((k) => !t.confine.test(k)) : [];
    const row = { path: t.path, value: typeof t.value === "function" ? "fn" : t.value, changed: ch.length, expectedChanged: hit.length, leaks: leak.slice(0, 6), pass: hit.length > 0 && leak.length === 0 };
    const regionIds = ch.filter((k) => !k.startsWith("data:"));
    if ((spec.class === "ART_DESIGN" || spec.class === "GEOMETRY") && regionIds.length && base.elements && r.elements) {
      const px = pixelCausality(base, r, regionIds); row.pixels = px; if (!px.pass) row.pass = false; else regionCausal++;
    }
    if (spec.class === "ROUTING") { if (typeof spec.dispatch !== "function") { row.pass = false; row.error = "routing proof without observed downstream dispatch"; rec.causal.push(row); rec.pass = false; continue; } const d0 = spec.dispatch(base), d1 = spec.dispatch(r); row.dispatch = [d0, d1]; if (!d0?.length || JSON.stringify(d0) === JSON.stringify(d1)) row.pass = false; }
    rec.causal.push(row); if (!row.pass) rec.pass = false;
  }
  if ((spec.class === "ART_DESIGN" || spec.class === "GEOMETRY") && !regionCausal) { rec.pass = false; rec.problems.push("no perturbation changed emitted regions with confined pixels"); }
  for (const t of spec.refuse || []) {
    const inp = clone(spec.base); t.delete ? delPath(inp, t.path) : setPath(inp, t.path, t.value);
    let refused = false, msg = ""; try { spec.producer(inp); } catch (e) { refused = true; msg = e.message.slice(0, 160); }
    rec.refuses.push({ path: t.path, why: t.why, refused, msg }); if (!refused) rec.pass = false;
  }
  if (spec.class === "EVIDENCE_GATE") {
    for (const t of spec.accept || []) { let ok = true, msg = ""; try { const r = spec.producer(clone(setPath(clone(spec.base), t.path, t.value))); ok = !!r?.data; } catch (e) { ok = false; msg = e.message.slice(0, 160); } rec.accepts.push({ path: t.path, accepted: ok, msg }); if (!ok) rec.pass = false; }
    if (!rec.refuses.length || (!rec.accepts.length && !P.length)) { rec.pass = false; rec.problems.push("evidence gate needs ≥1 accepted real record and ≥1 refusal"); }
  }
  if (spec.falsifier) { try { rec.falsifier = spec.falsifier(base); } catch (e) { rec.falsifier = { pass: false, detail: e.message }; } if (!rec.falsifier.pass) rec.pass = false; }
  rec.base = base;
  return rec;
}
