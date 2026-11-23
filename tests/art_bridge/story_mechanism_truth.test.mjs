// Directive G1/G5 — T01 counterfactual mechanism, T04 causally incomplete obstacle, T06 changed script/audio invalidates anchors,
// T08 (mechanisms: unlike infection/exposure and orbital-energy fixtures through the same evaluator), T09 animatic provenance.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "story"), EV = path.join(REPO, "hybrid_v2", "evidence", "system_correction");
const Mx = await import("../../engine/story/mechanism.mjs"), N = await import("../../engine/story/narration.mjs");
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
// activity-dependent income vs time-dependent obligation (the class, not a laundromat constant)
const shop = (rentRate) => ({ mechanism_id: "M_SHOP", linked_claims: ["C1"], mappings: { n: "uses per second", cash: "money stock" }, permitted_simplification: "constant price", stocks: { cash: 0 }, parameters: { price: 2, rent: 1 },
  flows: [{ id: "income", from: null, to: "cash", rate: "price*n" }, { id: "rent", from: "cash", to: null, rate: rentRate }],
  counterfactuals: [{ id: "no_customers", claim: "when activity stops, the time-based rent still accrues", inputs: { n: 0 }, at_t: 10, expect: [{ flow: "income", rel: "==", value: 0 }, { flow: "rent", rel: ">", value: 0 }, { stock: "cash", rel: "<", value: 0 }] }] });

test("T01 a diagram that stops ALL costs when activity stops fails its counterfactual (MECHANISM_CONTRADICTION)", () => {
  assert.deepEqual(Mx.runCounterfactuals(shop("rent")), []);
  const wrong = Mx.runCounterfactuals(shop("rent*min(n,1)")); assert.ok(wrong.length >= 1 && wrong.every((x) => x.code === "MECHANISM_CONTRADICTION"), JSON.stringify(wrong));
});

test("T04 an obstacle declared RESOLVED without mechanism support is OBSTACLE_UNRESOLVED; unverified claims are FACT_CHECK_REQUIRED", () => {
  const m = shop("rent"), sc = { claims: [{ claim_id: "C1", script_span: "one coin buys one turn", citation: "pending", verification_status: "FACT_CHECK_REQUIRED", entities: ["coin"], causal_hypothesis: "price per use", variables: ["n"], predicted_observables: ["cash rises with use"], viewer_should_infer: "small payments add up", mechanism_id: "M_SHOP" }], mechanisms: [m],
    obstacles: [{ id: "O1", initial_condition: "cash negative in quiet hours", intervention: "more customers", status: "RESOLVED", audience_visible_evidence: "counter rises", evidence: { mechanism_id: "M_SHOP", inputs: { n: 0.2 }, at_t: 10, stock: "cash", rel: ">", value: 0 } }] };
  const v = Mx.validateStoryContract(sc); assert.ok(v.failures.some((f) => f.code === "FACT_CHECK_REQUIRED")); assert.ok(v.failures.some((f) => f.code === "OBSTACLE_UNRESOLVED"), JSON.stringify(v.failures)); // 0.2*2=0.4 < rent 1
  sc.obstacles[0].evidence.inputs = { n: 1 }; sc.claims[0].verification_status = "VERIFIED"; assert.equal(Mx.validateStoryContract(sc).status, "APPROVABLE_PENDING_HUMAN_REVIEW");
});

test("T08 (mechanisms) unlike infection/exposure and orbital-energy mechanisms run through the SAME evaluator and counterfactual check", () => {
  const sir = { mechanism_id: "M_SIR", linked_claims: ["C"], mappings: { S: "susceptible", I: "infected" }, permitted_simplification: "well mixed", stocks: { S: 990, I: 10, R: 0 }, parameters: { beta: 0.3, gamma: 0.1, N: 1000 }, dt: 0.05,
    flows: [{ id: "infection", from: "S", to: "I", rate: "beta*S*I/N*contact" }, { id: "recovery", from: "I", to: "R", rate: "gamma*I" }],
    counterfactuals: [{ id: "no_contact", inputs: { contact: 0 }, at_t: 20, expect: [{ flow: "infection", rel: "==", value: 0 }, { flow: "recovery", rel: ">", value: 0 }] }, { id: "contact", inputs: { contact: 1 }, at_t: 5, expect: [{ stock: "I", rel: ">", value: 10 }] }] };
  assert.deepEqual(Mx.runCounterfactuals(sir), []);
  const orbit = { mechanism_id: "M_ORBIT", linked_claims: ["C"], mappings: { K: "kinetic", U: "potential" }, permitted_simplification: "energy exchange only", stocks: { K: 50, U: 50 }, parameters: { k: 0.5 }, flows: [{ id: "fall", from: "U", to: "K", rate: "k*U*descending" }, { id: "rise", from: "K", to: "U", rate: "k*K*(1-descending)" }],
    counterfactuals: [{ id: "conserved", inputs: { descending: 1 }, at_t: 2, expect: [{ stock: "K", rel: ">", value: 50 }] }] };
  assert.deepEqual(Mx.runCounterfactuals(orbit), []); const s = Mx.evaluateMechanism(orbit, () => ({ descending: 1 }), 2); assert.ok(Math.abs(s.stocks.K + s.stocks.U - 100) < 1e-9, "energy conserved by construction");
});

test("T06 changed script or audio invalidates word-linked frame anchors; estimated timing cannot anchor a critical cue", () => {
  fs.mkdirSync(W, { recursive: true }); const script = path.join(W, "script.txt"), audio = path.join(W, "narration.wav"); fs.writeFileSync(script, "One coin buys one turn."); fs.writeFileSync(audio, Buffer.alloc(4800));
  const words = [{ w: "One", start_s: 0.5, end_s: 0.7 }, { w: "coin", start_s: 0.72, end_s: 1.0 }, { w: "buys", start_s: 1.02, end_s: 1.3 }];
  const nt = { script_sha256: fsha(script), audio_sha256: fsha(audio), alignment: { method: "FORCED_ALIGNMENT", tool: "fixture-aligner", tool_version: "0", output_sha256: "f".repeat(64), confidence: 0.9, words }, cues: [{ id: "coin_drop", word_index: 1, critical: true }] };
  const ok = N.validateNarrationTimeline(nt, { scriptFile: script, audioFile: audio }); assert.equal(ok.ok, true); assert.equal(ok.anchors[0].frame, Math.floor(0.72 * 60));
  fs.writeFileSync(script, "One coin buys two turns."); assert.ok(N.validateNarrationTimeline(nt, { scriptFile: script, audioFile: audio }).errors.some((e) => e.code === "STALE_DEPENDENCY"));
  const est = { ...nt, script_sha256: fsha(script), alignment: { method: "ESTIMATED", words } }; assert.ok(N.validateNarrationTimeline(est, { scriptFile: script, audioFile: audio }).errors.some((e) => e.code === "NARRATION_NOT_MEASURED"));
});

test("T09 the timed animatic retains DIAGNOSTIC_ONLY provenance and cannot pass an art or film gate", () => {
  const a = N.timedAnimatic([{ id: "b1", frames: [0, 900] }, { id: "b2", frames: [900, 7200] }]); assert.equal(a.provenance, "DIAGNOSTIC_ONLY"); assert.equal(a.fits, true);
  assert.throws(() => N.assertNotDiagnostic(a), (e) => e.code === "QA_LAYER_FAILED"); assert.equal(N.timedAnimatic([{ id: "x", frames: [0, 7300] }]).fits, false);
  fs.mkdirSync(EV, { recursive: true }); fs.writeFileSync(path.join(EV, "CAUSAL_MECHANISM_PROOFS.json"), JSON.stringify({ generated_by: "tests/art_bridge/story_mechanism_truth.test.mjs", proofs: { T01_correct: Mx.runCounterfactuals(shop("rent")), T01_inverted: Mx.runCounterfactuals(shop("rent*min(n,1)")) }, note: "fixtures prove the evaluator; the film's own claims are not authored/verified (FACT_CHECK_REQUIRED)" }, null, 1));
});
