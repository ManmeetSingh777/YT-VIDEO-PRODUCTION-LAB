// planStages fills stages to the 30,000-char packing target, keeps a block that only fits between target and the 32,000 provider maximum in a
// stage of its own, and refuses (never truncates) a block that cannot fit the maximum.
import { test } from "node:test"; import assert from "node:assert/strict";
import { planStages, methodBlock, STAGE_PACKING_TARGET, PROVIDER_PROMPT_LIMIT } from "../../engine/art_bridge/request_stages.mjs";
const dec = (id, n) => ({ method_id: id, specific_decision: "d".repeat(n), visible_construction_operation: "operation with an inspectable visible result", input_dependencies: ["x"], output_art_components: ["c"], falsification_condition: "f", source_witness_pixel_regions: [], unlike_witness_contrast: "u" });
const run = (sizes, header = 12000, footer = 3000) => { const ids = ["F01", "F05", "F06", "F33", "F52"].slice(0, sizes.length), design = { job_id: "T", method_decisions: ids.map((m, i) => dec(m, sizes[i])) };
  return { ids, design, r: planStages({ design, gate: { family: "ACTING_HUMAN", required_methods: ids.map((m) => ({ method: m, phase: "STRUCTURE", reason: "t" })) }, header: "h".repeat(header), footer: "f".repeat(footer), record_id: "T" }) }; };
test("PK-1 every stage stays within the 30k packing target when blocks allow; content is complete", () => {
  assert.equal(STAGE_PACKING_TARGET, 30000); assert.equal(PROVIDER_PROMPT_LIMIT, 32000);
  const { design, r } = run([5000, 5000, 5000, 5000]);
  for (const s of r.stages) assert.ok(s.characters <= 30000, `stage ${s.index} ${s.characters}`);
  for (const d of design.method_decisions) assert.ok(r.stages.some((s) => s.prompt.includes(methodBlock(d.method_id, d))), `${d.method_id} delivered whole`);
  assert.ok(r.stages.length >= 2, "a 32k fill would have used fewer stages; 30k splits");
});
test("PK-2 a block that only fits between 30k and 32k gets a stage of its own; above 32k it is refused", () => {
  const { r } = run([3000, 13500, 3000]); const big = r.stages.find((s) => s.methods.includes("F05"));
  assert.deepEqual(big.methods, ["F05"]); assert.ok(big.characters > 30000 && big.characters <= 32000, String(big.characters));
  assert.throws(() => run([3000, 17500]), (e) => e.code === "REQUEST_BUDGET_EXCEEDED");
});
test("PK-3 the 30k target is used only where it adds no sequential edit; otherwise stages fill to the 32k maximum", () => {
  let sawTarget = false, sawMax = false;
  for (let n = 4000; n <= 9000; n += 250) { const { design, r } = run([n, n, n]);
    assert.equal(r.stages.length, Math.min(r.packing.stages_at_target, r.packing.stages_at_maximum));
    for (const s of r.stages) assert.ok(s.characters <= (r.packing.used === 30000 ? 30000 : 32000), `${s.characters} > ${r.packing.used}`);
    for (const d of design.method_decisions) assert.ok(r.stages.some((s) => s.prompt.includes(methodBlock(d.method_id, d))));
    if (r.packing.used === 30000) sawTarget = true; else { sawMax = true; assert.ok(r.packing.stages_at_target > r.packing.stages_at_maximum); } }
  assert.ok(sawTarget && sawMax, "both branches exercised");
});
