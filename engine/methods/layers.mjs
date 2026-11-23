// F79 — own the alpha, underpaint, parallax and offscreen drawing budget.
// Source: for each moving object produce (a) approved composite, (b) true-alpha isolated subject, (c) clean exposed underpaint for EVERY
// pixel it can reveal, (d) matte/occluder with real opaque region, (e) larger master with camera coverage beyond every output footprint,
// (f) registered landmarks; at a full-cover swap prove the occluder's actual alpha coverage is 100% of the needed viewport.
// Producing operation: rasterised coverage measurement over the motion/camera schedule → manifest with measured numbers and verdicts.
import { registerProducer } from "./emit.mjs";
import { need } from "./core.mjs";
import * as R from "../authoring/raster.mjs";
import { mapPath } from "./core.mjs";
import crypto from "node:crypto";

const hash = (dr) => crypto.createHash("sha256").update(dr.elements.map((e) => e.id + e.d + (e.fill || "")).join("|")).digest("hex").slice(0, 16);

/** ownLayers(design): { subject: composed, underpaint: composed, motion:[{t, dx, dy}], cameras:[{t, rect:[x,y,w,h]}], master:[x,y,w,h], swaps?:[{t, occluder: composed, viewport:[x,y,w,h]}] } */
function ownLayers__impl(d) {
  need("F79 layers", d, { motion: "arr", cameras: "arr", master: "arr" });
  if (!d.subject?.elements || !d.underpaint?.elements) throw new Error("F79: subject and underpaint must be composed drawings");
  const [mx, my, mw, mh] = d.master, G = R.grid(mx, my, mw, mh, 4);
  const subj = d.subject.elements.map((e) => e.d), under = R.mask(G, d.underpaint.elements.map((e) => e.d));
  // pixels the subject can reveal = union of its footprints over the motion schedule; underpaint must cover all of them
  let reveal = new Uint8Array(G.W * G.H);
  for (const m of d.motion) reveal = R.or(reveal, R.mask(G, subj.map((p) => mapPath(p, ([x, y]) => [x + m.dx, y + m.dy]))));
  const uncovered = R.area(R.minus(reveal, under));
  // overscan: every camera footprint inside the master
  const over = d.cameras.map((c) => ({ t: c.t, inside: c.rect[0] >= mx && c.rect[1] >= my && c.rect[0] + c.rect[2] <= mx + mw && c.rect[1] + c.rect[3] <= my + mh }));
  const swaps = (d.swaps || []).map((s) => { const vp = R.mask(G, `M${s.viewport[0]},${s.viewport[1]} L${s.viewport[0] + s.viewport[2]},${s.viewport[1]} L${s.viewport[0] + s.viewport[2]},${s.viewport[1] + s.viewport[3]} L${s.viewport[0]},${s.viewport[1] + s.viewport[3]} Z`); const occ = R.mask(G, s.occluder.elements.filter((e) => (e.opacity ?? 1) >= 0.999).map((e) => e.d)); const cov = R.inside(vp, occ); return { t: s.t, opaqueCoverage: +cov.toFixed(4), pass: cov >= 0.9999 }; });
  const manifest = { master: d.master, subjectHash: hash(d.subject), underpaintHash: hash(d.underpaint), revealCells: R.area(reveal), uncoveredRevealCells: uncovered, overscan: over, swaps };
  const pass = uncovered === 0 && over.every((o) => o.inside) && swaps.every((s) => s.pass);
  if (!pass && d.strict !== false) { const e = new Error(`F79: underpaint/overscan/occluder coverage failed (uncovered ${uncovered} cells, overscan ${over.filter((o) => !o.inside).length} out, swaps ${swaps.filter((s) => !s.pass).length} short) — non-renderable`); e.manifest = manifest; throw e; }
  return { method: "F79", data: manifest, pass };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const ownLayers = registerProducer("layers.ownLayers", ownLayers__impl);
