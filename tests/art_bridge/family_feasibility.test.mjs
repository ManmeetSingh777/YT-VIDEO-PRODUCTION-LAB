// Family-scoped post-art feasibility: a measured family settles its own pose/view/channel history now; coupled requirements stay OPEN with
// prerequisites; a binding-free pose change needs no state edge; events owned by another rig never reach this rig.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { familyFeasibility } from "../../engine/art_bridge/art_intake.mjs";
const F = fs.mkdtempSync(path.join(os.tmpdir(), "ff-")); fs.mkdirSync(path.join(F, "handoff"));
const rig = (id, ident, poses, status = "MEASURED", edges = []) => ({ id, identity_id: ident, geometry_status: status, joints: [{ id: "root", parent_id: null }], sockets: [{ id: `${id}.s`, joint_id: "root" }], render_parts: [], pose_states: poses, view_states: [], state_channels: [], allowed_state_edges: edges, constraints: [] });
const doc = (o = {}) => ({ rigs: [rig("A", "IA", [{ id: "ready", asset_bindings: {} }, { id: "regal", asset_bindings: {} }]), rig("B", "IB", [{ id: "rest", asset_bindings: { b: "b.rest" } }, { id: "wave", asset_bindings: { b: "b.wave" } }], o.bStatus || "MEASURED", o.bEdges || []), rig("C", "IC", [{ id: "rest", asset_bindings: { c: "c.rest" } }], "UNMEASURED")],
  shots: [{ id: "S1", start_frame: 0, end_frame: 100 }], actions: [
    { id: "X1", shot_id: "S1", frame_range: [0, 100], actors: [{ rig_id: "A" }, { rig_id: "B" }], pose_events: [{ frame: 10, state_id: "regal", rig_id: "A" }, { frame: 10, state_id: "wave", rig_id: "B" }, { frame: 10, state_id: "rest", rig_id: o.badOwner ? "B" : "C" }], view_events: [], contact_events: [] },
    { id: "X2", shot_id: "S1", frame_range: [20, 60], actors: [{ rig_id: "A" }], pose_events: [], view_events: [], contact_events: [{ source_socket: "A.s", target_socket: "C.s", contact_type: "GRIP" }] }] });
test("FF-1 a measured family with binding-free poses is FAMILY_FEASIBLE; coupled contact with an unmeasured family stays open with prerequisites", () => {
  const r = familyFeasibility(F, doc(), "IA"); assert.equal(r.status, "FAMILY_FEASIBLE_COUPLED_OPEN", JSON.stringify(r.failures));
  const x2 = r.open_obligations.find((o) => o.action === "X2"); assert.ok(x2.coupling.includes("CROSS_FAMILY_CONTACT_OR_SHARED_PROP")); assert.ok(x2.prerequisites.some((p) => p.startsWith("rig C measured") && !p.includes("(done)")));
  assert.ok(r.open_obligations.every((o) => o.coupling.includes("CAMERA_AND_MOTION_PLAN_PHYSICAL_SOLVE")));
});
test("FF-2 a drawing-swapping pose change needs an approved edge; with the edge it passes; an unmeasured family is not evaluated", () => {
  assert.match(JSON.stringify(familyFeasibility(F, doc(), "IB").failures), /no approved state edge/);
  assert.equal(familyFeasibility(F, doc({ bEdges: [{ from: "rest", to: "wave", reversible: true }] }), "IB").status, "FAMILY_FEASIBLE_COUPLED_OPEN");
  assert.equal(familyFeasibility(F, doc({ bStatus: "UNMEASURED" }), "IB").status, "FEASIBILITY_NOT_EVALUATED");
});
test("FF-3 events owned by another rig never reach this rig: the same frame carrying two rigs' states is not a conflict", () => {
  const ok = familyFeasibility(F, doc({ bEdges: [{ from: "rest", to: "wave", reversible: true }] }), "IB"); assert.equal(ok.failures.length, 0, JSON.stringify(ok.failures));
  const bad = familyFeasibility(F, doc({ bEdges: [{ from: "rest", to: "wave", reversible: true }], badOwner: true }), "IB"); assert.ok(bad.failures.some((f) => f.code === "STATE_CONFLICT"), "two states for the SAME rig at one frame still conflict");
});
