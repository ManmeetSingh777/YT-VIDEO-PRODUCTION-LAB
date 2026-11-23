// subjectDesigner loop (spec §2.3 steps 3–6; F01/F58). Claude AUTHORS 3–5 meaningfully different whole-silhouette candidates; this module
// renders them as flat silhouettes at full display size and at one-tenth, measures that they genuinely differ (normalised mask IoU) and
// refuses a selection unless (a) a review of the ACTUAL rendered sheet exists with a matching hash, (b) the chosen candidate's acceptance
// statements and every rejected candidate's reason are recorded. The selected plan is returned as a DesignDecision-backed choice.
import fs from "node:fs";
import { need } from "./core.mjs";
import { compose, registerProducer } from "./emit.mjs";
import { render, sheet, stack, writePNG } from "./render.mjs";
import { fileHash } from "./contracts.mjs";
import * as R from "../authoring/raster.mjs";

/** normalised 48×48 mask of a set of region paths (bbox-fit) for shape-identity comparison */
function normMask(elements) {
  const pts = elements.flatMap((e) => (e.d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || []).map((s) => s.split(",").map(Number)));
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, s = Math.max(w, h);
  const G = R.grid(x0 - (s - w) / 2, y0 - (s - h) / 2, s, s, s / 48);
  return { G, M: R.mask(G, elements.filter((e) => !e.stroke).map((e) => e.d)), aspect: w / h };
}

/** renderCandidates({subjectId, displayH, candidates:[{id, build:()=>elements, intent}]}, outFile) */
function renderCandidates__impl(spec, outFile) {
  need("F01 candidates", spec, { subjectId: "str", displayH: "num+", candidates: "arr" });
  if (spec.candidates.length < 3 || spec.candidates.length > 5) throw new Error(`F01 subjectDesigner: 3–5 candidate silhouettes required (got ${spec.candidates.length})`);
  const built = spec.candidates.map((c) => { need(`F01 candidate ${c.id}`, c, { id: "str", intent: "str" }); const els = c.build(); return { id: c.id, intent: c.intent, els, nm: normMask(els) }; });
  // distinctness: identity must differ in mass/proportion/negative space, not curve tension
  const pairs = [];
  for (let i = 0; i < built.length; i++) for (let j = i + 1; j < built.length; j++) { const iou = R.iou(built[i].nm.M, built[j].nm.M); pairs.push({ a: built[i].id, b: built[j].id, iou: +iou.toFixed(3) }); }
  const tooSimilar = pairs.filter((p) => p.iou > 0.88);
  if (tooSimilar.length) throw new Error(`F01 subjectDesigner: candidates not meaningfully different (${tooSimilar.map((p) => `${p.a}/${p.b} IoU ${p.iou}`).join(", ")})`);
  // flat silhouettes: full display height, and one-tenth (upscaled ×4 nearest for viewing)
  const tiles = built.map((b) => {
    const pts = b.els.flatMap((e) => (e.d.match(/-?\d+(\.\d+)?,-?\d+(\.\d+)?/g) || []).map((s) => s.split(",").map(Number))), xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const x0 = Math.min(...xs), y0 = Math.min(...ys), w = Math.max(...xs) - x0, h = Math.max(...ys) - y0, pad = h * 0.06, view = [x0 - pad, y0 - pad, Math.max(w, h * 0.6) + 2 * pad, h + 2 * pad];
    const H = spec.displayH, Wd = Math.round((H * view[2]) / view[3]), dr = compose(`cand.${b.id}`, b.els);
    const full = render(dr, { W: Wd, H, view, bg: "#f2efe6", mode: "silhouette" });
    const small = render(dr, { W: Math.max(4, Math.round(Wd / 10)), H: Math.round(H / 10), view, bg: "#f2efe6", mode: "silhouette" });
    const up = { W: small.W * 4, H: small.H * 4, px: new Float32Array(small.W * 16 * small.H * 3) };
    for (let j = 0; j < up.H; j++) for (let i = 0; i < up.W; i++) for (let k = 0; k < 3; k++) up.px[(j * up.W + i) * 3 + k] = small.px[((j >> 2) * small.W + (i >> 2)) * 3 + k];
    return stack([full, up], 6);
  });
  writePNG(outFile, sheet(tiles, 14));
  return { method: ["F01", "F58"], data: { subjectId: spec.subjectId, order: built.map((b) => b.id), intents: Object.fromEntries(built.map((b) => [b.id, b.intent])), aspect: Object.fromEntries(built.map((b) => [b.id, +b.nm.aspect.toFixed(3)])), distinctness: pairs, sheet: outFile, sheetSha256: fileHash(outFile) } };
}
export const renderCandidates = registerProducer("subject.renderCandidates", renderCandidates__impl);

/** selectCandidate(rendered, selection) — selection = {chosen, acceptance:[...], rejected:{id: reason}, review:{file, sha256, verdict, reviewer, observations}} */
function selectCandidate__impl(rendered, sel) {
  need("F01 selection", sel, { chosen: "str", acceptance: "arr", rejected: "obj", review: "obj" });
  const order = rendered.data.order;
  if (!order.includes(sel.chosen)) throw new Error(`F01 selection: chosen ${sel.chosen} was not a rendered candidate`);
  for (const id of order) if (id !== sel.chosen && !(typeof sel.rejected[id] === "string" && sel.rejected[id].length > 15)) throw new Error(`F01 selection: rejected candidate ${id} needs a recorded visual reason`);
  if (sel.review.file !== rendered.data.sheet || !fs.existsSync(sel.review.file) || fileHash(sel.review.file) !== rendered.data.sheetSha256 || sel.review.sha256 !== rendered.data.sheetSha256) throw new Error("F01 selection: review must reference the exact rendered candidate sheet (hash mismatch)");
  if (sel.review.verdict !== "ACCEPT" && sel.review.verdict !== "ACCEPT_WITH_DEFECTS") throw new Error(`F01 selection: candidate sheet review verdict ${sel.review.verdict} — return to silhouette design`);
  if (sel.acceptance.length < 2) throw new Error("F01 selection: at least two subject-specific acceptance statements (identity at full size and at one-tenth)");
  return { method: ["F01", "F58"], data: { chosen: sel.chosen, rejected: sel.rejected, acceptance: sel.acceptance, review: { file: sel.review.file, sha256: sel.review.sha256, verdict: sel.review.verdict, reviewer: sel.review.reviewer, observations: sel.review.observations } } };
}
export const selectCandidate = registerProducer("subject.selectCandidate", selectCandidate__impl);
