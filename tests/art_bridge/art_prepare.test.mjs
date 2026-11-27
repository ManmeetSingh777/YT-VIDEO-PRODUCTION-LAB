// Deterministic preparation: lossless ops only, re-executable records, provenance inherited only when re-execution reproduces the bytes.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto";
import { applyOps, prepareImage, verifyPreparation } from "../../engine/art_bridge/art_prepare.mjs"; import { readPNG, writeRGBA } from "../../engine/art_bridge/png.mjs";
const T = () => fs.mkdtempSync(path.join(os.tmpdir(), "ap-")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const mk = (f) => { const w = 20, h = 10, px = Buffer.alloc(w * h * 4); for (let i = 0; i < w * h; i++) px.set([i & 255, (i * 3) & 255, 9, i % 3 === 0 ? 254 : i % 3 === 1 ? 253 : 40], i * 4); writeRGBA(f, w, h, px); return f; };
test("AP-1 alpha_ceiling raises only the quantized top values and never touches colour; crop/pad are byte-exact", () => {
  const d = T(), f = mk(path.join(d, "p.png")), src = readPNG(f), out = applyOps(src, [{ op: "alpha_ceiling", from: 253 }]);
  for (let i = 0; i < src.rgba.length; i += 4) { assert.equal(out.rgba[i], src.rgba[i]); assert.equal(out.rgba[i + 3], src.rgba[i + 3] >= 253 ? 255 : src.rgba[i + 3]); }
  const c = applyOps(src, [{ op: "crop", rect: [2, 1, 5, 4] }]); assert.deepEqual([c.width, c.height], [5, 4]); assert.deepEqual([...c.rgba.subarray(0, 4)], [...src.rgba.subarray((1 * 20 + 2) * 4, (1 * 20 + 2) * 4 + 4)]);
  const p = applyOps(src, [{ op: "pad", ltrb: [1, 2, 3, 4] }]); assert.deepEqual([p.width, p.height], [24, 16]); assert.equal(p.rgba[3], 0); assert.deepEqual([...p.rgba.subarray(((2) * 24 + 1) * 4, ((2) * 24 + 1) * 4 + 4)], [...src.rgba.subarray(0, 4)]);
  assert.throws(() => applyOps(src, [{ op: "resize", scale: 2 }]), /only lossless/); assert.throws(() => applyOps(src, [{ op: "alpha_ceiling", from: 100 }]), /quantization only/);
});
test("AP-2 a preparation record re-executes to the same bytes; any changed parent or op fails", () => {
  const d = T(), f = mk(path.join(d, "p.png")), r = prepareImage({ parentFile: f, ops: [{ op: "alpha_ceiling", from: 253 }], outDir: path.join(d, "prep") });
  assert.equal(sha(r.file), r.record.result_sha256); assert.equal(verifyPreparation(r.record, f), true);
  assert.equal(verifyPreparation({ ...r.record, ops: [{ op: "alpha_ceiling", from: 254 }] }, f), false);
  const g = mk(path.join(d, "q.png")); const px = readPNG(g); px.rgba[0] ^= 1; writeRGBA(g, px.width, px.height, px.rgba); assert.equal(verifyPreparation(r.record, g), false);
});
