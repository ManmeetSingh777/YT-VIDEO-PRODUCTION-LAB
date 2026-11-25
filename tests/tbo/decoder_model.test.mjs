// TBO-G15 strategy decoder: model card evaluation (units, provenance, constraints, scenarios) and the MODEL_BAR operator rendered through the
// preserved Neutrino/Chrome path, judged on real pixels. The numbers are the Channel Bible §8.6 TEACHING model (HYPOTHETICAL_PARAMETER), a
// DIAGNOSTIC fixture — not Mia's approved economics, not approved art. The bar drawing is a flat diagnostic symbol, not GPT artwork.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { evaluateModel, validateModelCard, modelDigest, sensitivity, displayLabelAudit, parseUnit, unitString, scenarioClaimAudit } from "../../engine/decoder/model_card.mjs";
import { verifyModelBarFrames } from "../../engine/decoder/decoder_qa.mjs";
import { compileMotionTracks } from "../../engine/art_bridge/temporal.mjs";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
import { loadScene, renderFrames, readPNG, FIX } from "../art_bridge/stage2_lib.mjs";
import { launch } from "../../engine/art_bridge/render.mjs";
import { TEACHING_MODEL } from "./tbo_fixtures.mjs";

const clone = (o) => JSON.parse(JSON.stringify(o));

test("TBO-G15 model: Bible §8.6 arithmetic is recomputed from inputs, with units", () => {
  const net = (s) => evaluateModel(TEACHING_MODEL, s).values.net;
  assert.equal(net("baseline").value, -60); assert.equal(net("discount").value, -420); assert.ok(Math.abs(net("better").value - 168) < 1e-9);
  assert.equal(net("baseline").unit, "USD/day"); assert.equal(net("baseline").provenance, "MODEL_DERIVED");
  assert.deepEqual(net("better").assumption_inputs, ["capacity", "drink_margin", "drinks", "meals", "other_cost", "price", "var_cost"].filter((x) => x !== "capacity"));
  assert.equal(unitString(parseUnit("USD*meal^-1")), "USD/meal");
});
test("P06 decoder: each scenario's stated outcome is recomputed; a counterexample shown as success is refused", () => {
  assert.deepEqual(scenarioClaimAudit(TEACHING_MODEL), [], "baseline/discount LOSS, better GAIN, discount+volume BREAKS_CONSTRAINT all match the model");
  const fake = clone(TEACHING_MODEL); fake.scenarios.find((s) => s.id === "discount").claim.outcome = "GAIN";
  const e = scenarioClaimAudit(fake); assert.equal(e.length, 1); assert.equal(e[0].code, "DECODER_INERT_OR_MISLEADING"); assert.match(e[0].human_readable_reason, /presented as GAIN but the model computes LOSS/);
  const hide = clone(TEACHING_MODEL); hide.scenarios.find((s) => s.id === "discount_more_volume").claim.outcome = "GAIN"; assert.match(scenarioClaimAudit(hide)[0].human_readable_reason, /computes BREAKS_CONSTRAINT/, "hiding the capacity limit behind a 'success' label is refused");
});
test("TBO-G15 model negatives: unit error, capacity overflow, cycle, undocumented 'fact', inert override", () => {
  const units = clone(TEACHING_MODEL); units.formulas[3].expr = "meal_contribution + drink_contribution - price"; // USD/day - USD/meal
  assert.throws(() => evaluateModel(units, "baseline"), (e) => e.code === "DECODER_MODEL_INVALID" && /unit mismatch/.test(e.human_readable_reason || e.message));
  assert.throws(() => evaluateModel(TEACHING_MODEL, "discount_more_volume"), (e) => e.code === "MODEL_CONSTRAINT_VIOLATED" && /kitchen_capacity/.test(e.human_readable_reason || e.message));
  const cyc = clone(TEACHING_MODEL); cyc.formulas[0].expr = "net / meals"; cyc.formulas[0].unit = "USD/meal";
  assert.ok(validateModelCard(cyc).errors.some((e) => e.details?.failed_invariant === "MODEL_ACYCLIC"));
  const doc = clone(TEACHING_MODEL); doc.variables[0].provenance = "REAL_DOCUMENTED";
  assert.ok(validateModelCard(doc).errors.some((e) => e.details?.failed_invariant === "MODEL_DOCUMENTED_HAS_SOURCE"));
  const fact = clone(TEACHING_MODEL); fact.truth_mode = "F";
  assert.ok(validateModelCard(fact).errors.some((e) => e.details?.failed_invariant === "MODEL_TRUTH_MODE"));
  const outp = clone(TEACHING_MODEL); outp.scenarios[1].overrides = { net: 500 };
  assert.ok(validateModelCard(outp).errors.some((e) => e.details?.failed_invariant === "MODEL_OVERRIDE_IS_INPUT"));
  const lab = displayLabelAudit(TEACHING_MODEL, [{ value_ref: "net", shown_provenance: "REAL_DOCUMENTED" }, { value_ref: "price", shown_provenance: "HYPOTHETICAL_PARAMETER" }]);
  assert.equal(lab.length, 1); assert.equal(lab[0].code, "DECODER_INERT_OR_MISLEADING");
  const s = sensitivity(TEACHING_MODEL, "net", "meals", [-20, 0, 20]); assert.deepEqual(s.map((r) => r.ok), [true, true, false]); assert.equal(s[0].output, -60 - 20 * 3);
  assert.notEqual(modelDigest(TEACHING_MODEL), modelDigest({ ...TEACHING_MODEL, variables: TEACHING_MODEL.variables.map((v) => (v.id === "var_cost" ? { ...v, value: 9.1 } : v)) }));
});

// ── the operator through the real renderer ──
function barScene(card = TEACHING_MODEL, { digest = modelDigest(card), pivotBottom = true } = {}) {
  const W = 42, H = 100, px = new Uint8Array(W * H * 4); for (let y = 0; y < H; y++) for (let x = 1; x < W - 1; x++) px.set([40, 200, 90, 255], (y * W + x) * 4); // transparent side columns: a true-alpha symbol
  const f = path.join(FIX, "_tmp", "tbo", "decoder_bar.png"); fs.mkdirSync(path.dirname(f), { recursive: true }); writeRGBA(f, W, H, px);
  const sha256 = crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
  const M = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_E.manifest.json"), "utf8")), sym = clone(M.assets.find((a) => a.id === "flow_symbol"));
  Object.assign(sym, { id: "decoder_bar", file: "_tmp/tbo/decoder_bar.png", sha256, width_px: W, height_px: H, canonical_rect: [0, 0, W, H], source_pixel_crop: [0, 0, W, H], pivot_xy: [W / 2, pivotBottom ? H : H / 2] });
  M.assets.push(sym); M.actions.push({ ...clone(M.actions.find((a) => a.id === "flow_out")), id: "profit_bar", semantic_goal: "net money per day follows the model scenario" });
  const P = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_E.plan.json"), "utf8"));
  P.models = { teach: card };
  P.procedural.profit_bar = { type: "MODEL_BAR", symbol_asset: "decoder_bar", model: "teach", model_digest: digest, output: "net", unit: "USD/day", baseline_xy: [300, 600], px_per_unit: 0.5,
    scenario_keys: [[0, "baseline"], [200, "baseline"], [260, "discount", "sine.inOut"], [400, "discount"], [460, "better", "sine.inOut"]] };
  return { M, P };
}
const compileCodes = (M, P) => { try { compileMotionTracks(M.actions, M.shots, { doc: M, plan: P }); return []; } catch (e) { return (e.errors || [e]).map((x) => x.code); } };

test("TBO-G15 MODEL_BAR compile-time refusals: stale digest, unknown output, truncated baseline", () => {
  const ok = barScene(); assert.deepEqual(compileCodes(ok.M, ok.P), []);
  const stale = barScene(); stale.P.models.teach = { ...TEACHING_MODEL, variables: TEACHING_MODEL.variables.map((v) => (v.id === "var_cost" ? { ...v, value: 9.5 } : v)) };
  assert.ok(compileCodes(stale.M, stale.P).includes("STALE_DEPENDENCY"));
  const out = barScene(); out.P.procedural.profit_bar.output = "profit_margin"; assert.ok(compileCodes(out.M, out.P).includes("DECODER_MODEL_INVALID"));
  const mid = barScene(TEACHING_MODEL, { pivotBottom: false }); assert.ok(compileCodes(mid.M, mid.P).includes("DECODER_INERT_OR_MISLEADING"));
  const trunc = barScene(); trunc.P.procedural.profit_bar.baseline_value = -500; assert.ok(compileCodes(trunc.M, trunc.P).includes("DECODER_INERT_OR_MISLEADING"));
  const unit = barScene(); unit.P.procedural.profit_bar.unit = "USD/meal"; assert.ok(compileCodes(unit.M, unit.P).includes("DECODER_INERT_OR_MISLEADING"));
});

test("TBO-G15 MODEL_BAR in real Chrome frames: pixels follow the model; a changed input moves them; a frozen graph is detected", async () => {
  const browser = await launch();
  try {
    const frames = [100, 230, 300, 500], bar = { action: "profit_bar", baseline_xy: [300, 600], colour: [40, 200, 90] };
    const A = barScene(), S = await loadScene("E", { manifestOverride: A.M, planOverride: A.P }), R = await renderFrames(S, 0, frames, "tbo_decoder_a", { browser });
    const pngA = R.files.map((f) => readPNG(f)), at = (C) => (f) => C.proceduralAt(f).find((x) => x.pass_id === "profit_bar--sym0");
    const V = verifyModelBarFrames({ frames: frames.map((f, i) => ({ frame: f, png: pngA[i] })), placementAt: at(S.C), bar });
    assert.ok(V.ok, JSON.stringify(V.failures.map((x) => x.human_readable_reason || x.message)));
    assert.deepEqual(V.rows.map((r) => r.scenario), ["baseline", "baseline→discount", "discount", "better"]);
    assert.ok(Math.abs(V.rows[0].measured_down_px - 30) <= 3 && V.rows[0].measured_up_px === 0, "baseline −60 USD/day → 30 px below the baseline");
    assert.ok(Math.abs(V.rows[2].measured_down_px - 210) <= 3, "discount −420 USD/day → 210 px down");
    assert.ok(Math.abs(V.rows[3].measured_up_px - 84) <= 3 && V.rows[3].measured_down_px === 0, "better +168 USD/day → 84 px up (sign visibly flips)");
    // change ONE input (variable cost 9 → 9.5) and re-pin: frames change by the model's amount
    const card2 = { ...TEACHING_MODEL, variables: TEACHING_MODEL.variables.map((v) => (v.id === "var_cost" ? { ...v, value: 9.5 } : v)) };
    const B = barScene(card2), S2 = await loadScene("E", { manifestOverride: B.M, planOverride: B.P }), R2 = await renderFrames(S2, 0, frames, "tbo_decoder_b", { browser });
    const pngB = R2.files.map((f) => readPNG(f)), V2 = verifyModelBarFrames({ frames: frames.map((f, i) => ({ frame: f, png: pngB[i] })), placementAt: at(S2.C), bar });
    assert.ok(V2.ok); assert.ok(Math.abs(V2.rows[0].measured_down_px - 75) <= 3, "baseline net −150 USD/day → 75 px");
    // NEGATIVE (registry TBO-G15): input changed but the displayed graph is frozen (old frames) → fails on the pixels
    const frozen = verifyModelBarFrames({ frames: frames.map((f, i) => ({ frame: f, png: pngA[i] })), placementAt: at(S2.C), bar });
    assert.equal(frozen.ok, false); assert.ok(frozen.failures.every((x) => x.code === "DECODER_INERT_OR_MISLEADING"));
    // NEGATIVE: sign reversed in the render (better-move frame shown as a loss) → fails
    const flipped = verifyModelBarFrames({ frames: [{ frame: 500, png: pngA[2] }], placementAt: at(S.C), bar }); assert.equal(flipped.ok, false);
    // NEGATIVE: zero frames checked is not a pass
    assert.equal(verifyModelBarFrames({ frames: [], placementAt: at(S.C), bar }).ok, false);
  } finally { await browser.close(); }
});
