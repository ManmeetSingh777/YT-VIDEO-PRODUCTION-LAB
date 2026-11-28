// IV-1: before its first view event a rig holds that event's from-state (not "no view"), so view-qualified drawings resolve from frame 0.
import test from "node:test"; import assert from "node:assert/strict"; import { rigPoseTimeline, poseAt } from "../../engine/art_bridge/state_timeline.mjs";
const rig = { id: "R", pose_states: [{ id: "p" }], view_states: [{ id: "a" }, { id: "b" }] };
test("IV-1 initial view", () => { const tl = rigPoseTimeline(rig, [{ id: "X", shot_id: "S", frame_range: [0, 100], actors: [{ rig_id: "R" }], pose_events: [], view_events: [{ frame: 50, from_state: "a", to_state: "b", rig_id: "R" }] }]);
  assert.equal(poseAt(rig, tl, 10).view, "a"); assert.equal(poseAt(rig, tl, 60).view, "b"); assert.equal(poseAt(rig, rigPoseTimeline(rig, []), 5).view, null); });
