// VC-1: the vector page builder is pure (same spec → same SVG), keeps the exact copy (escaped, Unicode minus intact), and a construction record
// whose spec was altered never verifies (no rasterization needed to refuse).
import test from "node:test"; import assert from "node:assert/strict"; import os from "node:os"; import { pageSVG, verifyConstruction, VECTOR_VERSION } from "../../engine/art_bridge/vector_construct.mjs";
import crypto from "node:crypto";
const spec = { canvas: [100, 140], scale: 2, page: { rect: [5, 5, 90, 130], radius: 4, fill: "#FBF2E1", edge: { fill: "#E2CFB6", bottom: 3, right: 1, rim: { width: 1, fill: "#B7A086" } } }, shapes: [{ type: "roundrect", rect: [8, 120, 20, 6], radius: 3, fill: "#F2DEBD" }],
  text: { font: { family: "X" }, lines: [{ text: "Operating result −$120 & <b>", x: 10, y: 40, size: 8, weight: 600, fill: "#222" }] } };
test("VC-1 pure page SVG, exact copy, tamper refusal", async () => {
  const a = pageSVG(spec), b = pageSVG(structuredClone(spec)); assert.equal(a, b); assert.match(a, /width="200" height="280"/);
  assert.ok(a.includes("Operating result −$120 &amp; &lt;b&gt;")); assert.equal(pageSVG({ canvas: [10, 10], scale: 1, text: spec.text }).includes("<rect"), false);
  const rec = { tool: VECTOR_VERSION, spec, svg_sha256: crypto.createHash("sha256").update(a).digest("hex"), result_sha256: "0".repeat(64) }, t = structuredClone(rec); t.spec.text.lines[0].text = "Operating result −$12";
  assert.equal(await verifyConstruction(t, os.tmpdir()), false); assert.throws(() => pageSVG({ canvas: [1, 1], scale: 1 }), /page or text/);
});
