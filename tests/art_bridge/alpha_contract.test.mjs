// AC-1: a STRAIGHT-alpha cutout must contain transparency; a full-frame WORLD plate may be fully opaque; OPAQUE/BINARY rules unchanged.
import test from "node:test"; import assert from "node:assert/strict"; import { checkAlphaContract } from "../../engine/art_bridge/art_intake.mjs";
const png = (transparent, partial = 0) => ({ hasAlphaChannel: true, alpha: { transparent, partial } });
test("AC-1 alpha contract", () => {
  assert.throws(() => checkAlphaContract("part", "STRAIGHT", png(0)), /no transparent pixel/);
  assert.doesNotThrow(() => checkAlphaContract("world", "STRAIGHT", png(0), { fullFrameWorld: true }));
  assert.doesNotThrow(() => checkAlphaContract("part", "STRAIGHT", png(5)));
  assert.throws(() => checkAlphaContract("p", "OPAQUE", png(3)), /planned OPAQUE/); assert.throws(() => checkAlphaContract("m", "BINARY_MASK", png(1, 2)), /BINARY_MASK/);
  assert.throws(() => checkAlphaContract("world", "STRAIGHT", { hasAlphaChannel: false, alpha: { transparent: 0, partial: 0 } }, { fullFrameWorld: true }), /no transparent pixel/);
});
