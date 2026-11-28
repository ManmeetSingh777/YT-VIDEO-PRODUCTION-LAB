// RS-1: with a known motion plan, a channel demands only reachable states (default, directed events, acting blink/speech); without one, null
// (callers keep the conservative full repertoire). An unreachable state (e.g. a mouth state no event or acting path selects) is not demanded.
import test from "node:test"; import assert from "node:assert/strict"; import { reachableStates } from "../../engine/art_bridge/asset_state.mjs";
const rig = { id: "R", state_channels: [{ id: "mouth", kind: "MOUTH", slots: [], default: "rest", states: ["rest", "open", "mid", "warm", "chuckle"].map((id) => ({ id, asset_bindings: {} })) },
  { id: "eyes", kind: "EYES", slots: [], default: "warm", states: ["warm", "blink_open", "blink_closed", "aiming"].map((id) => ({ id, asset_bindings: {} })) }] };
const actions = [{ id: "A", frame_range: [0, 100], actors: [{ rig_id: "R" }], state_events: [{ frame: 50, channel: "mouth", state: "chuckle", rig: "R" }] }];
test("RS-1 reachable states", () => {
  assert.equal(reachableStates(rig, actions, null), null);
  const r = reachableStates(rig, actions, { R: { speech: { channel: "mouth", rest: "rest", open: "open", mid: "mid" }, blink: { channel: "eyes", open: "blink_open", closed: "blink_closed" } } });
  assert.deepEqual([...r.get("mouth")].sort(), ["chuckle", "mid", "open", "rest"]); assert.ok(!r.get("mouth").has("warm"));
  assert.deepEqual([...r.get("eyes")].sort(), ["blink_closed", "blink_open", "warm"]); assert.ok(!r.get("eyes").has("aiming"));
});
