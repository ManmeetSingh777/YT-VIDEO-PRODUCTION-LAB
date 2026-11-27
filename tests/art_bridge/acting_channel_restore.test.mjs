// AR-1: blink and speech are channel-local excursions: when they end, the channel returns to the state the action timeline directs at that
// frame (concern / warm), not to a neutral drawing.
import test from "node:test"; import assert from "node:assert/strict"; import { compileActing } from "../../engine/art_bridge/acting.mjs";
const rig = { id: "R", joints: [{ id: "root", parent_id: null }], render_parts: [], state_channels: [
  { id: "eyes", kind: "EYES", slots: [], default: "warm", states: ["warm", "concern", "blink_open", "blink_closed"].map((id) => ({ id, asset_bindings: {} })) },
  { id: "mouth", kind: "MOUTH", slots: [], default: "rest", states: ["rest", "open", "mid", "warm"].map((id) => ({ id, asset_bindings: {} })) }] };
const doc = { stage: { fps: 60, total_frames: 400 }, rigs: [rig], shots: [{ id: "S", start_frame: 0, end_frame: 400 }],
  actions: [{ id: "A", shot_id: "S", frame_range: [0, 400], actors: [{ rig_id: "R" }], state_events: [{ frame: 0, channel: "mouth", state: "warm", rig: "R" }, { frame: 100, channel: "eyes", state: "concern", rig: "R" }] }] };
test("AR-1 blink and speech restore the directed channel state", () => {
  const r = compileActing(doc, { acting: { R: { blink: { channel: "eyes", open: "blink_open", closed: "blink_closed", period_frames: 150, duration_frames: 6, phase_frames: 30 }, speech: { channel: "mouth", rest: "rest", open: "open", mid: "mid", words: [{ start_s: 2, end_s: 2.5, w: "thanks" }] } } } });
  assert.deepEqual(r.errors, []); const ev = (ch) => r.events.filter((e) => e.channel === ch);
  const after = (ch, f) => ev(ch).filter((e) => e.frame === f).map((e) => e.state);
  assert.deepEqual(after("eyes", 36), ["warm"]); assert.deepEqual(after("eyes", 186), ["concern"]); assert.ok(!ev("eyes").some((e) => e.state === "blink_open"));
  assert.ok(ev("mouth").some((e) => e.state === "open")); assert.equal(ev("mouth").at(-1).state, "warm");
});
