// Directive G2/G4 — T02 missing semantic verb, T03 conflicting hands, T07 inert direction, T08 (action side: unlike fixtures through the
// same compiler) and the REAL S02 proposal analysis (the historical "loads" gap, F013) — no scene-specific code.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), EV = path.join(REPO, "hybrid_v2", "evidence", "system_correction");
const A = await import("../../engine/story/action_coverage.mjs"), X = await import("../../engine/story/experience.mjs");
const codes = (r) => r.errors.map((e) => e.code);

test("T02 a verb in the prose with no typed action, or a LOAD with no bag/trajectory/contained state, is UNCOMPILED / MISSING_ART (never 'motion complete')", () => {
  const events = [{ kind: "CONTACT", contact_type: "GRIP", frames: [100, 200], source: "hand", target: "lid" }, { kind: "STATE", frame: 150, state: "OPEN", rig: "box_rig" }, { kind: "CONTACT", contact_type: "GRIP", frames: [100, 200], source: "hand", target: "lid" }];
  const r = A.compileActionCoverage({ actions: [{ id: "a1", verb_class: "OPEN_APERTURE", actor: "kim", object: "lid", object_rig: "box_rig", frames: [100, 200], sockets: { grip: "hand" } }], events, prose: [{ id: "p1", text: "Kim opens the box and loads the sample." }], initial_possession: { sample: "kim" } });
  assert.ok(r.errors.some((e) => e.code === "UNCOMPILED_SEMANTIC_ACTION" && /LOAD_CONTAINER/.test(e.reason)), JSON.stringify(codes(r)));
  const r2 = A.compileActionCoverage({ actions: [{ id: "load", verb_class: "LOAD_CONTAINER", actor: "kim", object: "box", recipient: "box", carried_object: "sample", frames: [200, 300], sockets: { grip: "hand" } }], events: [], initial_possession: { sample: "kim" } });
  for (const need of ["GRIP_ON_CARRIED_OBJECT", "OBJECT_THROUGH_APERTURE", "CONTAINED_STATE"]) assert.ok(r2.errors.some((e) => e.reason.includes(need)), need);
  assert.equal(r2.complete, false);
  // positive: the same verb with every executable sub-operation is complete and transfers possession
  const ok = A.compileActionCoverage({ actions: [{ id: "load", verb_class: "LOAD_CONTAINER", actor: "kim", recipient: "box", carried_object: "sample", frames: [200, 300] }], initial_possession: { sample: "kim" },
    events: [{ kind: "CONTACT", contact_type: "GRIP", frames: [200, 260], source: "hand", target: "sample" }, { kind: "TRAJECTORY", frames: [220, 260], object: "sample", through: "box_aperture" }, { kind: "STATE", frame: 262, object: "sample", state: "CONTAINED" }, { kind: "POSE", frame: 280 }] });
  assert.equal(ok.complete, true, JSON.stringify(ok.errors)); assert.equal(ok.possession_timeline.at(-1).holder, "box");
});

test("T03 one hand cannot grip two unrelated props at once; an unclaimed contact is an ORPHAN action; possession cannot teleport", () => {
  const r = A.compileActionCoverage({ actions: [{ id: "g", verb_class: "GRIP", actor: "a", object: "cup", frames: [0, 100], sockets: { grip: "hand_r" } }], events: [{ kind: "CONTACT", contact_type: "GRIP", frames: [0, 100], source: "hand_r", target: "cup" }, { kind: "CONTACT", contact_type: "GRIP", frames: [50, 120], source: "hand_r", target: "book" }, { kind: "POSE", frame: 0 }, { kind: "OTHER", object: "cup", holder: "b", frame: 110 }], initial_possession: { cup: "a" } });
  assert.ok(codes(r).includes("CONTACT_CONFLICT")); assert.ok(codes(r).includes("ORPHAN_ACTION")); assert.ok(codes(r).includes("POSSESSION_TELEPORT"));
});

test("T07 a direction decision no track consumes is DIRECTION_DECISION_INERT; fake 3D camera over a flat plate is refused", () => {
  const r = X.compileAttention([{ id: "beat1", frames: [0, 120], primary_focus: "coin", reveal: "counter", requires_simultaneity: true }], [{ owner: "hand", element: "coin", kind: "ACTOR", frames: [0, 60] }]);
  assert.ok(r.errors.some((e) => e.code === "DIRECTION_DECISION_INERT" && /reveal/.test(e.reason))); assert.ok(r.errors.some((e) => /simultaneous/.test(e.reason)));
  assert.ok(X.cameraPurpose({ camera: { moves: [{ id: "orbit1", kind: "ORBIT", purpose: "show depth" }] }, world: { depth_planes: [] } }).length === 1);
  assert.equal(X.cameraPurpose({ camera: { moves: [{ id: "push1", kind: "PUSH_PARALLAX", purpose: "enter the porthole" }] }, world: { depth_planes: [{ parallax: 0.2 }, { parallax: 1 }] } }).length, 0);
  assert.equal(X.directionFieldsConsumed([{ id: "d1", text: "the coin glints" }, { id: "d2" }], [{ consumes: ["d2"] }]).length, 1);
});

test("T08 (actions) unlike scenarios — a scientist transferring a sample and an octopus releasing a shell — run through the SAME compiler", () => {
  const sci = A.compileActionCoverage({ actions: [{ id: "t", verb_class: "LOAD_CONTAINER", actor: "sci", recipient: "vessel", carried_object: "vial", frames: [0, 90] }], initial_possession: { vial: "sci" }, events: [{ kind: "CONTACT", contact_type: "GRIP", frames: [0, 50], source: "tweezers", target: "vial" }, { kind: "TRAJECTORY", frames: [10, 50], object: "vial", through: "vessel_neck" }, { kind: "STATE", frame: 52, object: "vial", state: "CONTAINED" }, { kind: "POSE", frame: 70 }] });
  assert.equal(sci.complete, true, JSON.stringify(sci.errors));
  const oct = A.compileActionCoverage({ actions: [{ id: "r", verb_class: "GRIP", actor: "octo", object: "shell", frames: [0, 80], sockets: { grip: "arm1_tip" } }], events: [{ kind: "CONTACT", contact_type: "GRIP", frames: [0, 60], source: "arm1_tip", target: "shell" }, { kind: "POSE", frame: 0 }, { kind: "POSE", frame: 62 }] }); // P04 §2.3: the contact must END (60 < 80) AND a release follows it; the previous fixture had no release evidence
  assert.equal(oct.complete, true, JSON.stringify(oct.errors));
});

test("REAL proposal S02: the 'loads' verb and the carried bag compile to exact missing operations (reproduces F013 without a scene patch)", () => {
  const score = JSON.parse(fs.readFileSync(path.join(REPO, "films", "hv2_film001", "direction", "SHOT_SCORE_60FPS.json"), "utf8")), s02 = score.shots.find((s) => s.shot === "S02"), goal = s02.events.find((e) => e.action === "S02_operate_washer").goal;
  // draft typing of the proposal's prose (for review) — the compiler, not this list, decides coverage
  const actions = [
    { id: "s02_plant", verb_class: "SUPPORT", actor: "ines", frames: [900, 1920], sockets: { sole: "ines_sole_l" } },
    { id: "s02_grip_handle", verb_class: "GRIP", actor: "ines", object: "washer_handle", frames: [1050, 1260], sockets: { grip: "ines_grip_r" } },
    { id: "s02_open_door", verb_class: "OPEN_APERTURE", actor: "ines", object: "washer_handle", object_rig: "washer_rig", frames: [1050, 1260], sockets: { grip: "ines_grip_r" } },
    { id: "s02_load", verb_class: "LOAD_CONTAINER", actor: "ines", recipient: "washer_drum", carried_object: "laundry_bag", frames: [1260, 1410] },
    { id: "s02_pinch_insert", verb_class: "INSERT_TOKEN", actor: "ines", object: "washer_coin_slot", frames: [1410, 1590] },
    { id: "s02_start", verb_class: "MECHANISM_START", actor: "washer", object: "drum", frames: [1560, 1920] } ];
  const r = A.compileActionCoverage({ actions, events: A.eventsFromShotScore(s02), prose: [{ id: "S02.goal", text: goal }, { id: "S02.entry", text: s02.entry }], initial_possession: { laundry_bag: "ines" }, record_id: "S02" });
  const load = r.coverage.find((c) => c.action === "s02_load"); assert.equal(load.complete, false); assert.ok(r.errors.some((e) => e.record_id === "s02_load" && e.code === "MISSING_ART_ASSET"));
  fs.mkdirSync(EV, { recursive: true }); fs.writeFileSync(path.join(EV, "SEMANTIC_ACTION_COVERAGE.json"), JSON.stringify({ generated_by: "tests/art_bridge/semantic_action_coverage.test.mjs", shot: "S02", status: "PROPOSAL (unapproved); draft typing of the prose for review", prose: goal, ...r }, null, 1));
});
