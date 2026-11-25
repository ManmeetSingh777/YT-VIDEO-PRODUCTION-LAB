// MODEL_BAR — a procedural motion operator of the existing Neutrino/Chrome path (temporal.mjs proceduralAt → scene_graph symbol pass).
// An APPROVED symbol drawing (art kind SYMBOL, e.g. a GPT-painted coin stack or bar) is scaled along +Y from a zero baseline so that its
// on-screen height is exactly |value| × px_per_unit, where value is a formula output or input of the approved MODEL CARD, keyed over film
// frames by scenario (baseline → discount → better move …). Negative values grow DOWN from the baseline (sign is visible, never hidden).
// No number is typed into the plan: change one model input and every frame that shows it changes (TBO-G15). The plan pins the model
// digest it was directed against; a changed card makes the plan STALE instead of silently re-scaling approved footage (TBO-G19).
//
// plan.models = { <modelId>: <model card> }
// plan.procedural[<actionId>] = { type: "MODEL_BAR", symbol_asset, model, model_digest, output, unit, scenario_keys: [[frame, scenarioId, ease?], ...],
//                                 baseline_xy: [x, y], px_per_unit, band?, baseline_value?: 0 }
import { err } from "../art_bridge/errors.mjs";
import { chain, T, S } from "../art_bridge/math2d.mjs";
import { evaluateModel, modelDigest, validateModelCard } from "./model_card.mjs";

const PR = "engine/decoder/model_bar.mjs#compileModelBars";

/** compileModelBars(plan, {actions, assets, errors, ev}) → { at(actionId, f) → symbol placement | null, trace } — errors are pushed, never thrown */
export function compileModelBars(plan, { actions, assets, errors, ev }) {
  const bars = new Map(), trace = [];
  for (const [aid, p] of Object.entries(plan.procedural || {})) {
    if (p.type !== "MODEL_BAR") continue;
    const E = (code, reason, inv, extra = {}) => errors.push(err(code, { record_id: aid, reason, producer: PR, details: { failed_invariant: inv }, ...extra }));
    const a = actions.find((x) => x.id === aid); if (!a) { E("UNKNOWN_REFERENCE", "MODEL_BAR names no action", "MODEL_BAR_HAS_ACTION"); continue; }
    if (a.mode !== "PROCEDURAL") E("UNSUPPORTED_MOTION_CLASS", `MODEL_BAR drives a ${a.mode} action; it is a PROCEDURAL operator`, "MODEL_BAR_IS_PROCEDURAL");
    const card = plan.models?.[p.model]; if (!card) { E("DECODER_MODEL_INVALID", `MODEL_BAR uses model ${p.model}, which is not in plan.models`, "MODEL_BAR_MODEL_PRESENT"); continue; }
    const V = validateModelCard(card); if (!V.ok) { errors.push(...V.errors); continue; }
    const digest = modelDigest(card);
    if (p.model_digest !== digest) { E("STALE_DEPENDENCY", `MODEL_BAR was directed against model digest ${String(p.model_digest).slice(0, 12)}… but the current card is ${digest.slice(0, 12)}…: re-approve the decoder shot against the changed model`, "MODEL_BAR_DIGEST_CURRENT"); continue; }
    const sym = assets.get(p.symbol_asset); if (!sym) { E("MISSING_ART_ASSET", `MODEL_BAR symbol ${p.symbol_asset} is not a registered asset`, "MODEL_BAR_SYMBOL_REGISTERED", { suggested_producer: "GPT approved SYMBOL artwork" }); continue; }
    if (sym.kind !== "SYMBOL") E("SCHEMA_VIOLATION", `MODEL_BAR symbol ${sym.id} is a ${sym.kind}; a model bar scales an approved SYMBOL drawing`, "MODEL_BAR_SYMBOL_KIND");
    const [, ry, , rh] = sym.canonical_rect, [px, py] = sym.pivot_xy;
    if (Math.abs(py - (ry + rh)) > 0.5) E("DECODER_INERT_OR_MISLEADING", `symbol ${sym.id} pivot y=${py} is not on its bottom edge (${ry + rh}): the bar would not grow from the zero baseline`, "MODEL_BAR_ZERO_BASELINE");
    if (p.baseline_value !== undefined && p.baseline_value !== 0) E("DECODER_INERT_OR_MISLEADING", `a bar baseline must be the value 0 (got ${p.baseline_value}): a truncated axis exaggerates differences`, "MODEL_BAR_ZERO_BASELINE");
    if (!(p.px_per_unit > 0)) E("DECODER_INERT_OR_MISLEADING", "px_per_unit must be a positive constant: one scale per bar for the whole shot", "MODEL_BAR_LINEAR_SCALE");
    if (!Array.isArray(p.baseline_xy) || p.baseline_xy.length !== 2) E("SCHEMA_VIOLATION", "baseline_xy [x, y] is required", "MODEL_BAR_PLACED");
    const keys = p.scenario_keys || []; if (!keys.length) { E("DIRECTION_DECISION_INERT", "MODEL_BAR has no scenario keys: nothing would ever change", "MODEL_BAR_KEYED"); continue; }
    let bad = false; const values = {}, provenance = {};
    for (let i = 0; i < keys.length; i++) { const [f, sid] = keys[i]; if (i && f <= keys[i - 1][0]) { E("INVALID_FRAME_RANGE", "scenario keys must be strictly increasing in frame", "MODEL_BAR_KEYS_ORDERED"); bad = true; break; }
      if (values[sid] !== undefined) continue;
      try { const R = evaluateModel(card, sid), v = R.values[p.output]; if (!v) { E("DECODER_MODEL_INVALID", `model ${card.id} has no output ${p.output}`, "MODEL_BAR_OUTPUT_DEFINED"); bad = true; break; }
        if (v.unit !== p.unit) { E("DECODER_INERT_OR_MISLEADING", `bar declares unit ${p.unit} but ${p.output} is ${v.unit}`, "MODEL_BAR_UNIT_MATCHES"); bad = true; break; }
        values[sid] = v.value; provenance[sid] = { provenance: v.provenance, assumption_inputs: v.assumption_inputs, scenario_status: R.scenario_status };
      } catch (e) { errors.push(e); bad = true; break; } }
    if (bad) continue;
    const K = keys.map(([f, sid, e]) => (e === undefined ? [f, values[sid]] : [f, values[sid], e]));
    const scenarioAt = (f) => { for (let i = keys.length - 1; i >= 0; i--) if (f >= keys[i][0]) { const nx = keys[i + 1]; return nx && f > keys[i][0] && nx[1] !== keys[i][1] && nx[2] !== "hold" ? `${keys[i][1]}→${nx[1]}` : keys[i][1]; } return keys[0][1]; };
    bars.set(aid, { p, K, h: rh, px, py, sym, digest, card, scenarioAt });
    trace.push({ action: aid, model: card.id, model_digest: digest, output: p.output, unit: p.unit, px_per_unit: p.px_per_unit, scenario_values: values, scenario_provenance: provenance, symbol_asset: sym.id, keys: K });
  }
  return {
    trace,
    at(aid, f) {
      const b = bars.get(aid); if (!b) return null;
      const v = ev(b.K, f), k = (Math.abs(v) * b.p.px_per_unit) / b.h, sgn = v < 0 ? -1 : 1, [bx, by] = b.p.baseline_xy;
      return { pass_id: `${aid}--sym0`, asset_id: b.sym.id, matrix: chain(T(bx, by), S(1, sgn * k), T(-b.px, -b.py)), band: b.p.band || "FOCAL",
        model: { model: b.card.id, model_digest: b.digest, output: b.p.output, unit: b.p.unit, value: v, height_px: Math.abs(v) * b.p.px_per_unit, sign: sgn, scenario: b.scenarioAt(f) } };
    },
  };
}
