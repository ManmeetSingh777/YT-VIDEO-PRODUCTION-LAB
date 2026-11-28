// BF-1: limbs follow the view's BODY facing, face slots follow the head VIEW. A head-only turn (body_facing = base) demands a new face drawing
// but no new limb drawing; a real body turn demands both.
import test from "node:test"; import assert from "node:assert/strict"; import { viewDemand } from "../../engine/art_bridge/view_demand.mjs";
const rig = { id: "R", joints: [{ id: "root", parent_id: null }], render_parts: [{ asset_id: "limb" }, { asset_id: "eyes" }],
  pose_states: [{ id: "p", asset_bindings: {} }], view_states: [{ id: "A", asset_bindings: {}, view_facing: "A" }, { id: "B", asset_bindings: {}, view_facing: "B", body_facing: "A" }, { id: "C", asset_bindings: {}, view_facing: "C" }],
  state_channels: [{ id: "eyes", kind: "EYES", slots: ["eyes"], default: "e", states: [{ id: "e", asset_bindings: {} }] }] };
const doc = { stage: { total_frames: 30, fps: 60 }, rigs: [rig], shots: [{ id: "S", start_frame: 0, end_frame: 30 }],
  actions: [{ id: "X", shot_id: "S", frame_range: [0, 30], actors: [{ rig_id: "R" }], pose_events: [{ frame: 0, state_id: "p", rig_id: "R" }], view_events: [{ frame: 0, from_state: "A", to_state: "A", rig_id: "R" }, { frame: 10, from_state: "A", to_state: "B", rig_id: "R" }, { frame: 20, from_state: "B", to_state: "C", rig_id: "R" }], state_events: [], contact_events: [] }] };
test("BF-1 body facing vs head view", () => {
  const d = viewDemand(doc, [{ asset_id: "limb", kind: "PART", view_id: "A" }, { asset_id: "eyes", kind: "PART", view_id: "A" }]), keys = d.map((x) => `${x.asset}@${x.view}`).sort();
  assert.deepEqual(keys, ["eyes@B", "eyes@C", "limb@C"]);
});
