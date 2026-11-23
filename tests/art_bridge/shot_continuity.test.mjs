// Directive G3 — T05 shot boundary contradiction, unlike carry + weather/lighting continuity fixtures, approved time jump.
import test from "node:test"; import assert from "node:assert/strict";
const K = await import("../../engine/story/continuity.mjs");

test("T05 outgoing door OPEN but incoming CLOSED (opening only later) is refused; an approved, reasoned time jump is accepted", () => {
  const shots = [{ id: "A", frames: [0, 100], tracks: { door: [[0, "CLOSED"], [60, "OPEN"]] } }, { id: "B", frames: [100, 200], tracks: { door: [[100, "CLOSED"], [150, "OPEN"]] } }];
  const e = K.checkContinuity(shots); assert.equal(e.length, 1); assert.equal(e[0].code, "CONTINUITY_BREAK"); assert.match(e[0].reason, /door/);
  assert.equal(K.checkContinuity(shots, [{ from: "A", to: "B", kind: "CUT", time_jump: { elements: ["door"], reason: "later that evening" } }]).length, 1, "a time jump needs an approval receipt");
  assert.equal(K.checkContinuity(shots, [{ from: "A", to: "B", kind: "CUT", time_jump: { elements: ["door"], reason: "later that evening", approved_receipt: "direction__x" } }]).length, 0);
});

test("unlike continuity: carried object and weather/lighting state across cuts; frame gaps are refused", () => {
  const carry = [{ id: "S1", frames: [0, 60], tracks: { "vial.holder": [[0, "scientist"]], light: [[0, "DAY"]] } }, { id: "S2", frames: [60, 120], tracks: { "vial.holder": [[60, "bench"]], light: [[60, "DAY"]] } }];
  assert.ok(K.checkContinuity(carry).some((e) => /vial.holder/.test(e.reason)));
  const weather = [{ id: "W1", frames: [0, 60], tracks: { sky: [[0, "CLEAR"], [40, "STORM"]] } }, { id: "W2", frames: [61, 120], tracks: { sky: [[61, "STORM"]] } }];
  const e = K.checkContinuity(weather); assert.ok(e.some((x) => x.code === "FRAME_TILING_GAP")); assert.ok(!e.some((x) => x.code === "CONTINUITY_BREAK"));
});
