// The 20-gate enforcer computes statuses; it never passes a gate implicitly, never promotes diagnostic evidence, and never lets a
// human-review gate self-certify.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs";
import { evaluateQualityGates, GATE_BINDINGS, REGISTRY_FILE } from "../../engine/production/quality_gates.mjs";

const reg = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
const rec = (o = {}) => ({ gate_id: "TBO-G15", provenance: "PRODUCTION", fixed_source_sha: "abc", producer_function: "engine/decoder/model_bar.mjs#compileModelBars", consumer_function: "engine/decoder/decoder_qa.mjs#verifyModelBarFrames", input_hashes: ["h1"], artifact_hashes: ["h2"], frame_range_or_film_scope: [1200, 1800], test_id: "E01-SC-decoder", negative_test_result: "DETECTED", ...o });
const tapOk = "ok 1 - TBO-G15 model: x\nok 2 - TBO-G14 host pass: y\n";

test("every registry gate is bound to real producer files (or declares none), and nothing passes implicitly", () => {
  assert.deepEqual(Object.keys(GATE_BINDINGS).sort(), reg.gates.map((g) => g.id).sort());
  for (const [id, b] of Object.entries(GATE_BINDINGS)) for (const p of [...b.producers, ...b.consumers]) { const f = p.split(/[# ]/)[0]; assert.ok(fs.existsSync(new URL(`../../${f}`, import.meta.url)), `${id}: ${f} does not exist`); }
  const r = evaluateQualityGates({ tapText: "" });
  assert.ok(r.gates.every((g) => g.status === "NOT_TESTED")); assert.equal(r.implicit_pass, false);
});
test("diagnostic mechanism tests leave a gate BLOCKED_EXTERNAL; a failing bound test is FAILED", () => {
  const r = evaluateQualityGates({ tapText: tapOk }), g15 = r.gates.find((g) => g.id === "TBO-G15");
  assert.equal(g15.status, "BLOCKED_EXTERNAL"); assert.equal(g15.diagnostic_only, true);
  assert.equal(evaluateQualityGates({ tapText: "not ok 1 - TBO-G15 model: x\n" }).gates.find((g) => g.id === "TBO-G15").status, "FAILED");
  assert.equal(r.gates.find((g) => g.id === "TBO-G20").status, "NOT_TESTED");
});
test("VERIFIED only from complete PRODUCTION evidence; diagnostic, incomplete, stale-SHA, undetected-negative and unsigned-human records are refused", () => {
  const ok = evaluateQualityGates({ tapText: tapOk, sourceSha: "abc", productionEvidence: [rec()] }).gates.find((g) => g.id === "TBO-G15");
  assert.equal(ok.status, "VERIFIED_WITH_EVIDENCE");
  for (const [bad, why] of [[rec({ provenance: "DIAGNOSTIC" }), /not PRODUCTION/], [rec({ artifact_hashes: [] }), /lacks artifact_hashes/], [rec({ fixed_source_sha: "old" }), /not abc/], [rec({ negative_test_result: "NOT_RUN" }), /not detected/]]) {
    const g = evaluateQualityGates({ tapText: tapOk, sourceSha: "abc", productionEvidence: [bad] }).gates.find((x) => x.id === "TBO-G15");
    assert.equal(g.status, "BLOCKED_EXTERNAL"); assert.ok(g.reasons.some((x) => why.test(x)), g.reasons.join(";")); }
  const h = evaluateQualityGates({ tapText: tapOk, sourceSha: "abc", productionEvidence: [rec({ gate_id: "TBO-G14" })] }).gates.find((x) => x.id === "TBO-G14");
  assert.equal(h.status, "BLOCKED_EXTERNAL"); assert.ok(h.reasons.some((x) => /cannot self-certify/.test(x)));
  // registry negative for G20: a diagnostic MP4 counted as a finished Mia scene is never VERIFIED
  const g20 = evaluateQualityGates({ tapText: tapOk, sourceSha: "abc", productionEvidence: [rec({ gate_id: "TBO-G20", provenance: "DIAGNOSTIC", test_id: "diagnostic_600f.mp4" })] }).gates.find((x) => x.id === "TBO-G20");
  assert.notEqual(g20.status, "VERIFIED_WITH_EVIDENCE");
});
