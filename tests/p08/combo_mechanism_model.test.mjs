// P08 compositional addendum §6 combo 4 + E06: an ARTICULATED MECHANISM moves (gear train: driver track → solved follower by teeth ratio) WHILE a
// MODEL-DRIVEN graphic changes (MODEL_BAR from the approved teaching model card) — one compile, one clock. Removing one producer at a time breaks
// exactly its own consequence. Model endpoints are recomputed independently from the card (never read back from the renderer). DIAGNOSTIC scene E.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { evaluateModel, modelDigest } from "../../engine/decoder/model_card.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
import { angleOf } from "../../engine/art_bridge/math2d.mjs";
import { FIX } from "../art_bridge/stage2_lib.mjs";
import { TEACHING_MODEL } from "../tbo/tbo_fixtures.mjs";
const clone = (o) => JSON.parse(JSON.stringify(o));
function scene(card = TEACHING_MODEL) { // same construction as the TBO-G15 decoder scene (flat diagnostic bar symbol; teaching model, not Mia's economics)
  const W = 42, H = 100, px = new Uint8Array(W * H * 4); for (let y = 0; y < H; y++) for (let x = 1; x < W - 1; x++) px.set([40, 200, 90, 255], (y * W + x) * 4);
  const f = path.join(FIX, "_tmp", "p08", "combo_bar.png"); fs.mkdirSync(path.dirname(f), { recursive: true }); writeRGBA(f, W, H, px); const sha256 = crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
  const M = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_E.manifest.json"), "utf8")), sym = clone(M.assets.find((a) => a.id === "flow_symbol"));
  Object.assign(sym, { id: "decoder_bar", file: "_tmp/p08/combo_bar.png", sha256, width_px: W, height_px: H, canonical_rect: [0, 0, W, H], source_pixel_crop: [0, 0, W, H], pivot_xy: [W / 2, H] }); M.assets.push(sym);
  M.actions.push({ ...clone(M.actions.find((a) => a.id === "flow_out")), id: "profit_bar", semantic_goal: "net money per day follows the model scenario" });
  const P = JSON.parse(fs.readFileSync(path.join(FIX, "stage2", "scene_E.plan.json"), "utf8")); P.models = { teach: card };
  P.procedural.profit_bar = { type: "MODEL_BAR", symbol_asset: "decoder_bar", model: "teach", model_digest: modelDigest(card), output: "net", unit: "USD/day", baseline_xy: [300, 600], px_per_unit: 0.5, scenario_keys: [[0, "baseline"], [200, "baseline"], [260, "discount", "sine.inOut"], [400, "discount"], [460, "better", "sine.inOut"]] };
  return { M, P };
}
const compile = ({ M, P }) => compileMotionTracks(M.actions, M.shots, { doc: M, plan: P, requireApproval: false });
const gearAng = (C, f, rig) => angleOf(stateAtFrame(C, f).matrices[rig].spin), barH = (C, f) => { const b = C.proceduralAt(f).find((x) => x.pass_id === "profit_bar--sym0"); return b ? Math.hypot(b.matrix[2], b.matrix[3]) * Math.sign(b.matrix[3]) : null; };
test("COMBO-4 a gear train turns while the model bar changes: both owners follow their own producers on every sampled frame; each producer removed breaks only its consequence", () => {
  const A = scene(), C = compile(A), net = (s) => evaluateModel(TEACHING_MODEL, s).values.net.value;
  const frames = [0, 100, 230, 300, 430, 500, 599];
  for (const f of frames) { const a = C.jointValue("gearA", "spin", f), b = C.jointValue("gearB", "spin", f); assert.ok(Math.abs(b + a * (30 / 18)) < 1e-6, `f${f}: follower ${b} = −driver ${a} × 30/18`); }
  assert.ok(Math.abs(gearAng(C, 300, "gearA") - gearAng(C, 100, "gearA")) > 5, "the mechanism actually turns while the graphic changes");
  const hb = barH(C, 100), hd = barH(C, 300), hg = barH(C, 500); assert.ok(hb !== null && hd !== null && hg !== null);
  assert.ok(Math.sign(hb) === Math.sign(hd) && Math.abs(hd) > Math.abs(hb) && Math.sign(hg) !== Math.sign(hb), `bar follows the model: baseline ${net("baseline")}, discount ${net("discount")}, better ${net("better")} (sign flips)`);
  const noGear = clone(A); delete noGear.P.tracks.gearA; const Cg = compile(noGear); assert.ok(Math.abs(gearAng(Cg, 300, "gearB") - gearAng(Cg, 100, "gearB")) < 1e-9, "driver removed → the follower no longer turns"); assert.equal(barH(Cg, 300), hd, "… while the graphic is unaffected");
  const noBar = clone(A); delete noBar.P.procedural.profit_bar; assert.throws(() => compile(noBar), (e) => (e.errors || [e]).some((x) => x.code === "UNSUPPORTED_MOTION_CLASS" && x.record_id === "profit_bar"), "model-bar producer removed → the directed graphic is refused, never silently blank");
  const noBarAct = clone(noBar); noBarAct.M.actions = noBarAct.M.actions.filter((x) => x.id !== "profit_bar"); const Cb = compile(noBarAct); assert.equal(barH(Cb, 300), null); assert.equal(Cb.jointValue("gearB", "spin", 300), C.jointValue("gearB", "spin", 300), "… and without the graphic the mechanism is unaffected");
  const wrong = scene({ ...TEACHING_MODEL, variables: TEACHING_MODEL.variables.map((v) => (v.id === "var_cost" ? { ...v, value: v.value + 0.5 } : v)) }); assert.notEqual(barH(compile(wrong), 300), hd, "a changed model input changes the rendered value (no convenient fixed outcome)");
  const stale = scene(); stale.P.procedural.profit_bar.model_digest = "0".repeat(64); assert.throws(() => compile(stale), (e) => (e.errors || [e]).some((x) => /STALE|DIGEST|MODEL/i.test(`${x.code} ${x.human_readable_reason}`)), "a stale model digest is refused");
});
