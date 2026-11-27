// VB-1: a channel state drawn per head view resolves to that view's drawing while the view is active and to its default otherwise;
// validation sees every view-qualified drawing (missing ones are MISSING_ART_ASSET), and paint passes pre-emit them.
import test from "node:test"; import assert from "node:assert/strict"; import { resolveBindings, validateChannels, bindableAssets } from "../../engine/art_bridge/state_channels.mjs";
const rig = { id: "R", render_parts: [{ asset_id: "eyes" }, { asset_id: "head" }], pose_states: [{ id: "rest", asset_bindings: {} }], view_states: [{ id: "to_a", asset_bindings: {} }, { id: "down", asset_bindings: {} }],
  state_channels: [{ id: "eyes", kind: "EYES", slots: ["eyes"], default: "open", states: [{ id: "open", asset_bindings: { eyes: "eyes_open" }, asset_bindings_by_view: { down: { eyes: "eyes_open__down" } } }, { id: "closed", asset_bindings: { eyes: "eyes_closed" } }] }] };
test("VB-1 view-qualified channel drawings", () => {
  assert.equal(resolveBindings(rig, "rest", "to_a", { eyes: "open" }).bindings.eyes, "eyes_open");
  assert.equal(resolveBindings(rig, "rest", "down", { eyes: "open" }).bindings.eyes, "eyes_open__down");
  assert.equal(resolveBindings(rig, "rest", "down", { eyes: "closed" }).bindings.eyes, "eyes_closed");
  assert.deepEqual(bindableAssets(rig, "eyes").sort(), ["eyes", "eyes_closed", "eyes_open", "eyes_open__down"]);
  const e = validateChannels(rig, { assets: new Set(["eyes_open", "eyes_closed"]) }); assert.equal(e.length, 1); assert.equal(e[0].code, "MISSING_ART_ASSET"); assert.equal(e[0].record_id, "eyes_open__down");
});
