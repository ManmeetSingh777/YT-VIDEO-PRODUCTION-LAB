// F16 (transitions = complete illustrations + masks) + F35 (one conserved visual invariant) + F78 (correspondence invariant).
// F16: select by the communicative change; two complete world plates must exist for a world change; manufacture effect components as
// assets; key subjects never magically morph; audit start/mid/finish. F35: conserved identity + one op (match_move | mask_reveal |
// part_to_whole | registered_world_relight | causal_graph_expand | exposure_or_impulse); deliver start/end stills, anchor coordinates,
// layer/mask state, camera path, hold. F78: reason for entering the new world; continuous transforms need ≥3 shared landmarks, viewport
// matrices, overscan, fully drawn intermediate state; a semantic hard cut must NOT claim registered continuity.
// Producing operation: least-squares similarity transform between OUT and IN landmark sets → interpolated camera matrices for OUT/MID/IN;
// mask_reveal → mask contours at start/mid/end; exposure → full-field cover schedule; per-frame layer visibility score.
import { registerProducer } from "./emit.mjs";
import { need, add, sub, mul, len, lerp2 } from "./core.mjs";

export const OPS = ["match_move", "mask_reveal", "part_to_whole", "registered_world_relight", "causal_graph_expand", "exposure_or_impulse", "semantic_cut"];
export const REASONS = ["reveal_hidden_mechanism", "reveal_containment_context", "expose_categories", "establish_scale", "change_vehicle_state", "switch_analogy"];

/** similarity transform (scale·rotation + translation) mapping src points to dst points (least squares, Umeyama 2D) */
export function similarity(src, dst) {
  const n = src.length, ms = mul(src.reduce((a, p) => add(a, p), [0, 0]), 1 / n), md = mul(dst.reduce((a, p) => add(a, p), [0, 0]), 1 / n);
  let a = 0, b = 0, ss = 0; for (let i = 0; i < n; i++) { const s = sub(src[i], ms), d = sub(dst[i], md); a += s[0] * d[0] + s[1] * d[1]; b += s[0] * d[1] - s[1] * d[0]; ss += s[0] * s[0] + s[1] * s[1]; }
  const k = Math.hypot(a, b) / ss, th = Math.atan2(b, a), c = Math.cos(th) * k, sn = Math.sin(th) * k;
  const apply = (p) => add([c * (p[0] - ms[0]) - sn * (p[1] - ms[1]), sn * (p[0] - ms[0]) + c * (p[1] - ms[1])], md);
  const resid = Math.max(...src.map((p, i) => len(sub(apply(p), dst[i]))));
  return { scale: k, rotDeg: (th * 180) / Math.PI, apply, residual: resid, ms, md };
}

/** planTransition(design) */
function planTransition__impl(design) {
  need("F35 transition", design, { id: "str", op: OPS, reason: REASONS, invariant: "obj", frames: "obj" });
  need("F78 frames", design.frames, { start: "num", mid: "num", end: "num" });
  for (const [k, pl] of [["out", design.out], ["in", design.in]]) if (!pl || !pl.elements || pl.elements.length < 3) throw new Error(`F16 ${design.id}: ${k.toUpperCase()} plate must be a complete composed illustration (got ${pl?.elements?.length ?? 0} elements)`);
  const fr = design.frames, data = { op: design.op, reason: design.reason, states: {} };
  if (design.op === "semantic_cut") {
    need("F78 cut", design.invariant, { semantic_match: "str" });
    if (design.invariant.anchorsOut) throw new Error("F78: a semantic hard cut must not claim registered physical continuity (remove anchors)");
    data.states = { OUT: { t: fr.start, visible: "out" }, IN: { t: fr.start, visible: "in" } }; data.continuity = "SEMANTIC_ONLY"; data.semantic_match = design.invariant.semantic_match;
    return { method: ["F16", "F35", "F78"], data };
  }
  need("F35 invariant", design.invariant, { identity: "str", anchorsOut: "vecs", anchorsIn: "vecs" });
  const A = design.invariant.anchorsOut, B = design.invariant.anchorsIn;
  if (["match_move", "part_to_whole", "mask_reveal"].includes(design.op) && (A.length < 3 || B.length !== A.length)) throw new Error(`F78 ${design.id}: continuous ${design.op} needs ≥3 shared visible landmarks with correspondences (got ${A.length}/${B.length})`);
  const S = similarity(A, B);
  if (S.residual > (design.invariant.tolerance ?? 6)) throw new Error(`F78 ${design.id}: landmarks are not related by one camera transform (residual ${S.residual.toFixed(1)}px) — author an intermediate drawn state or cut honestly`);
  // camera states: OUT camera = identity; IN camera = inverse of the landmark mapping so the invariant keeps its screen identity
  const cam = (u) => ({ scale: 1 + (S.scale - 1) * u, rotDeg: S.rotDeg * u, pivot: lerp2(S.ms, S.md, u) });
  data.states = { OUT: { t: fr.start, camera: cam(0), visible: ["out"] }, MIDDLE: { t: fr.mid, camera: cam(0.5), visible: ["out", "in"], requires: "fully drawn intermediate state at native resolution" }, IN: { t: fr.end, camera: cam(1), visible: ["in"] } };
  data.landmarkResidualPx = +S.residual.toFixed(2); data.scale = +S.scale.toFixed(4); data.rotDeg = +S.rotDeg.toFixed(2);
  if (design.op === "mask_reveal") {
    need("F21 mask", design, { maskStates: "arr" }); if (design.maskStates.length < 3) throw new Error("F21/F35: an animated mask needs start, middle and end contours");
    data.mask = design.maskStates.map((m, i) => ({ t: [fr.start, fr.mid, fr.end][i] ?? fr.end, d: m.d, minted: !!m.prov }));
    if (design.maskStates.some((m) => !m.prov)) throw new Error("F35: mask contours must be produced (minted) geometry");
  }
  if (design.op === "exposure_or_impulse") data.cover = { full_field: true, rampIn: [fr.start, fr.mid], rampOut: [fr.mid, fr.end], reactionStateRequired: true };
  return { method: ["F16", "F35", "F78"], data };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const planTransition = registerProducer("transition.planTransition", planTransition__impl);
