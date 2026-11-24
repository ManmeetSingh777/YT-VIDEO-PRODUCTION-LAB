// Transition compiler (spec §5.3 TRANSITION, §5.6). CONTINUOUS: the approved OUT/MIDDLE/IN plates are nested through their authored aperture
// masks and pushed through around ONE shared anchor landmark, so the anchor's screen position is invariant for every frame. CUT: an
// explicit motivated cut frame. An unmatched crossfade is never produced.
import { err } from "./errors.mjs";
import { chain, T, S, apply } from "./math2d.mjs";
import { canonicalBBox } from "./asset_geometry.mjs";

const ease = (p) => -(Math.cos(Math.PI * p) - 1) / 2;

/** compileTransition(fromShot, toShot, contract, {doc}) */
export function compileTransition(from, to, contract, { doc }) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), [f0, f1] = contract.frame_range, id = `${contract.from_shot}->${contract.to_shot}`;
  if (contract.from_shot !== from.id || contract.to_shot !== to.id) throw err("UNKNOWN_REFERENCE", { record_id: id, reason: "contract shots do not match" });
  if (!(f0 < f1)) throw err("INVALID_FRAME_RANGE", { record_id: id, frame_range: contract.frame_range, reason: "empty transition range" });
  if (contract.mode === "CUT") return Object.freeze({ id, mode: "CUT", frame_range: [f0, f1], cut_frame: to.start_frame, frameAt: () => null });
  const plates = [contract.out_asset_ids[0], contract.middle_asset_ids[0], contract.in_asset_ids[0]].map((x) => assets.get(x));
  if (plates.some((p) => !p)) throw err("MISSING_TRANSITION_STATE", { record_id: id, frame_range: [f0, f1], reason: "OUT/MIDDLE/IN art incomplete" });
  const lm = contract.shared_landmarks[0];
  for (const p of plates) if (!p.landmarks?.[lm]) throw err("MISSING_TRANSITION_STATE", { record_id: id, dependency: `${p.id}.${lm}`, reason: `plate ${p.id} has no registered shared landmark ${lm}` });
  const masks = contract.mask_or_occluder_ids.map((x) => assets.get(x));
  if (masks.length < 1 || masks.some((m) => !m)) throw err("MISSING_TRANSITION_STATE", { record_id: id, reason: "continuous portal needs an authored aperture mask" });
  // occupied canonical extents come from the single geometry contract (re-audit B1), never from raster pixel sizes
  const bb = (a) => canonicalBBox(a), B0 = bb(plates[0]), W = doc.stage.width, H = doc.stage.height, base = Math.max(W / B0[2], H / B0[3]);
  const lm0 = plates[0].landmarks[lm], P = [(lm0[0] - B0[0]) * base, (lm0[1] - B0[1]) * base];
  // aperture ratio: inner plate scaled to cover the aperture of the plate that contains it
  const ratio = [0, 1].map((k) => { const m = masks[k] || masks[0], inner = plates[k + 1]; const Bm = bb(m), Bi = bb(inner); return Math.max(Bm[2] / Bi[2], Bm[3] / Bi[3]); });
  // P05: the nest must really be a nest. Seen from the shared anchor, each inner plate (at its own scale) covers the whole aperture that shows it, and the
  // last plate covers the screen when the push ends; otherwise the aperture would show whatever lies behind the transition.
  const around = (b, q, s = 1) => [(b[0] - q[0]) * s, (b[1] - q[1]) * s, (b[0] + b[2] - q[0]) * s, (b[1] + b[3] - q[1]) * s], covers = (o, i) => o[0] <= i[0] + 1 && o[1] <= i[1] + 1 && o[2] >= i[2] - 1 && o[3] >= i[3] - 1;
  [0, 1].forEach((k) => { const m = masks[k] || masks[0], ap = around(bb(m), plates[k].landmarks[lm]), inner = around(bb(plates[k + 1]), plates[k + 1].landmarks[lm], ratio[k]); if (!covers(inner, ap)) throw err("TRANSITION_GEOMETRY_INVALID", { record_id: id, frame_range: [f0, f1], dependency: m.id, reason: `the aperture ${m.id} [${ap.map(Math.round)}] around ${lm} is not covered by ${plates[k + 1].id} [${inner.map(Math.round)}]: what lies behind the transition would show through`, required_art_or_operation: [`redraw or re-register ${m.id} so its aperture is centred on ${lm}, or deliver a ${plates[k + 1].id} that covers it`] }); });
  { const last = around(bb(plates[2]), plates[2].landmarks[lm], base), scr = [-P[0], -P[1], W - P[0], H - P[1]]; if (!covers(last, scr)) throw err("TRANSITION_GEOMETRY_INVALID", { record_id: id, frame_range: [f0, f1], dependency: plates[2].id, reason: `the final plate ${plates[2].id} does not cover the screen when the push ends` }); }
  const K = 1 / (ratio[0] * ratio[1]);
  const frameAt = (f) => {
    if (f < f0 || f >= f1) return null;
    const p = ease((f - f0) / (f1 - f0 - 1 || 1)), z = Math.pow(K, p), scales = [base * z, base * z * ratio[0], base * z * ratio[0] * ratio[1]];
    const layers = plates.map((pl, k) => ({ asset_id: pl.id, matrix: chain(T(P[0], P[1]), S(scales[k]), T(-pl.landmarks[lm][0], -pl.landmarks[lm][1])) }));
    layers.forEach((L, k) => { if (k < 2) L.hole_mask = { asset_id: (masks[k] || masks[0]).id, matrix: L.matrix }; });
    const anchors = layers.map((L, k) => apply(L.matrix, plates[k].landmarks[lm]));
    const stage = p < 1 / 3 ? "OUT" : p < 2 / 3 ? "MIDDLE" : "IN";
    return { p, stage, zoom: z, layers: layers.reverse(), anchor_screen: P, anchor_residuals_px: anchors.map((a) => Math.hypot(a[0] - P[0], a[1] - P[1])) };
  };
  return Object.freeze({ id, mode: "CONTINUOUS", frame_range: [f0, f1], invariant: contract.continuity_invariant, shared_landmark: lm, aperture_ratios: ratio, total_zoom: K, frameAt });
}

/** verifyTransitions({doc}) — every continuous transition on its registered plates: nest geometry, all three plates on every frame, anchor fixed to 0.5 px */
export function verifyTransitions({ doc }) {
  const failures = [], results = [], shot = (id) => doc.shots.find((s) => s.id === id);
  for (const c of doc.transitions.filter((t) => t.mode === "CONTINUOUS")) { const id = `${c.from_shot}->${c.to_shot}`; try { const t = compileTransition(shot(c.from_shot), shot(c.to_shot), c, { doc }); let worst = 0, n = 0; for (let f = c.frame_range[0]; f < c.frame_range[1]; f++) { const s = t.frameAt(f); n++; worst = Math.max(worst, ...s.anchor_residuals_px); if (s.layers.length !== 3) failures.push({ code: "MISSING_TRANSITION_STATE", record_id: id, frame_range: [f, f + 1], reason: "a plate is missing" }); } if (worst > 0.5) failures.push({ code: "TRANSITION_GEOMETRY_INVALID", record_id: id, frame_range: c.frame_range, reason: `the shared anchor drifts ${worst.toFixed(2)} px` }); results.push({ transition: id, frames: n, anchor_drift_px: worst, aperture_ratios: t.aperture_ratios }); } catch (e) { failures.push({ code: e.code ?? "EXCEPTION", record_id: id, frame_range: c.frame_range, dependency: e.dependency ?? null, reason: e.human_readable_reason ?? e.message }); } }
  return { ok: !failures.length, failures, results };
}
