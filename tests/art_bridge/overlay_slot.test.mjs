// OS-1: only overlay slots riding a joint that a distinct `.joint` PART owns are exempt from pivot-on-art; hinge parts and masks are not.
import test from "node:test"; import assert from "node:assert/strict"; import { overlaySlotOwner } from "../../engine/art_bridge/art_intake.mjs";
test("OS-1 overlay slot owner", () => {
  const A = (id, kind, joint, pivot) => ({ asset_id: id, kind, joint_id: joint, pivot_landmark_id: pivot }), plan = { assets: [A("X.head", "PART", "head", "neck"), A("X.eyes", "PART", "head", "neck"), A("X.mouth_open", "CEL", "head", "neck"), A("X.hand_r_near", "PART", "hand_r", "wrist_r"), A("X.hand_r_far", "PART", "hand_r", "wrist_r"), A("X.m", "MASK", "head", "neck")] };
  assert.equal(overlaySlotOwner(plan, plan.assets[1]), "X.head"); assert.equal(overlaySlotOwner(plan, plan.assets[2]), "X.head");
  assert.equal(overlaySlotOwner(plan, plan.assets[0]), null); assert.equal(overlaySlotOwner(plan, plan.assets[3]), null); assert.equal(overlaySlotOwner(plan, plan.assets[5]), null);
  assert.equal(overlaySlotOwner(plan, A("Y.eyes", "PART", "head", "chin")), null);
});
