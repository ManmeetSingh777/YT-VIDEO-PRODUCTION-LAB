// CE-1: the general segmentation + mask_bitmap extraction works on ANY figure from film-supplied seeds only: components partition the opaque
// pixels exactly (no overlap, nothing lost) and each extracted part holds the source's exact RGBA. No film/character data is involved.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
import { writeRGBA, readPNG } from "../../engine/art_bridge/png.mjs"; import { applyOps } from "../../engine/art_bridge/art_prepare.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
test("CE-1 seeded segmentation partitions a synthetic figure; extraction is exact", () => {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "ce1-")), W = 80, H = 50, px = Buffer.alloc(W * H * 4);
  for (let y = 10; y < 40; y++) for (let x = 10; x < 70; x++) px.set(x < 40 ? [220, 60, 50, 255] : [30, 70, 200, 255], (y * W + x) * 4); // two touching flat regions
  for (let x = 12; x < 20; x++) px.set([20, 20, 20, 255], (20 * W + x) * 4); // a dark feature painted on the red region
  const f = path.join(d, "m.png"); writeRGBA(f, W, H, px);
  fs.writeFileSync(path.join(d, "seeds.json"), JSON.stringify({ labels: { red: [[20, 30, 30, 30]], blue: [[50, 30, 60, 30]], mark: [[14, 20, 16, 20]] }, groups: { left: ["red"], right: ["blue"], mark: ["mark"] }, colour_refine: { mark: { against: "red", min_dist: 60 } } }));
  const out = path.join(d, "seg"); execFileSync(process.env.PYTHON || "python", ["-I", path.join(REPO, "engine", "tools", "segment_master.py"), f, path.join(d, "seeds.json"), out]);
  const S = JSON.parse(fs.readFileSync(path.join(out, "SEGMENTATION.json"), "utf8")), src = readPNG(f); assert.equal(S.opaque_unlabelled_px, 0);
  const cover = new Uint8Array(W * H);
  for (const [k, c] of Object.entries(S.components)) { const part = applyOps(src, [{ op: "mask_bitmap", mask_sha256: c.mask_sha256 }], { maskDir: out });
    for (let i = 0; i < W * H; i++) if (part.rgba[i * 4 + 3]) { cover[i]++; assert.deepEqual([...part.rgba.subarray(i * 4, i * 4 + 4)], [...src.rgba.subarray(i * 4, i * 4 + 4)], `${k} pixel ${i}`); } }
  for (let i = 0; i < W * H; i++) assert.equal(cover[i], src.rgba[i * 4 + 3] ? 1 : 0, `pixel ${i} covered ${cover[i]}x`);
  assert.ok(S.components.mark.pixels >= 8 && S.components.mark.pixels <= 24, `feature selected by colour (${S.components.mark.pixels} px)`);
});
