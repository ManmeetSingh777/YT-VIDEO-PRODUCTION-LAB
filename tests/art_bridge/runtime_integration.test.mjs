// Runtime integration units (directive "Execute Amendment 08 …" items 3–5): executable subset on measured rigs, runtime-plan offsets and
// head-size cameras, the performance-packet compiler (grip adoption + release, pending geometry), geometry-only render refusal, and the
// master-calibrated native-resolution threshold.   node --test tests/art_bridge/runtime_integration.test.mjs
import test from "node:test"; import assert from "node:assert/strict";
const { executableSubset } = await import("../../engine/art_bridge/executable_subset.mjs"), RP = await import("../../engine/story/runtime_plan.mjs"), { compilePerformancePacket } = await import("../../engine/story/performance_packet.mjs");
const CR = await import("../../engine/art_bridge/component_route.mjs"), { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { validate } = await import("../../engine/art_bridge/jsonschema.mjs");
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const rig = (id, measured, extra = {}) => ({ id, identity_id: id, geometry_status: measured ? "MEASURED" : "UNMEASURED", joints: [{ id: "root", parent_id: null, rest_xy: [0, 0] }, { id: "head", parent_id: "root", rest_xy: [0, -50] }], sockets: [], render_parts: [], constraints: [], ...extra });
const DOC = () => ({ project_id: "unit", stage: { width: 1920, height: 1080, fps: 60, total_frames: 120 },
  rigs: [rig("A", true, { sockets: [{ id: "A.palm_r", joint_id: "head", local_xy: [0, 0] }], state_channels: [{ id: "hand_r", kind: "HAND", slots: ["A.hand"], states: [{ id: "open", asset_bindings: { "A.hand": "A.hand_open" } }, { id: "grip", asset_bindings: { "A.hand": "A.hand_grip" } }] }] }),
    rig("B", false, { sockets: [{ id: "B.palm_r", joint_id: "head", local_xy: [0, 0] }], state_channels: [{ id: "hand_r", kind: "HAND", slots: ["B.hand"], states: [{ id: "open" }, { id: "grip" }] }] }), rig("P", true, { sockets: [{ id: "P.grip", joint_id: "root", local_xy: [0, 0] }] })],
  identities: [{ id: "A", canonical_asset_id: "A_M", master_sha256: "a".repeat(64) }, { id: "B", canonical_asset_id: "B_M", master_sha256: "b".repeat(64) }, { id: "P", canonical_asset_id: "P_M", master_sha256: "c".repeat(64) }],
  shots: [{ id: "S1", start_frame: 0, end_frame: 120, camera_track_id: "CAM1" }],
  actions: [{ id: "X1", shot_id: "S1", frame_range: [0, 120], actors: [{ rig_id: "A", root_world_xy: [500, 900], root_scale: 1 }, { rig_id: "B", root_world_xy: [800, 900] }, { rig_id: "P", root_world_xy: [520, 700] }],
    contact_events: [{ start_frame: 10, end_frame: 60, source_socket: "A.palm_r", target_socket: "P.grip", contact_type: "GRIP", release_behavior: "released within the action; the release is shown" }, { start_frame: 0, end_frame: 120, source_socket: "B.palm_r", target_socket: "P.grip", contact_type: "GRIP", release_behavior: "held beyond the action" }],
    pose_events: [{ frame: 5, state_id: "rest", rig_id: "B" }], view_events: [], state_events: [{ frame: 0, channel: "hand_r", state: "open", rig: "B" }] }] });
test("RI-1 executableSubset removes unmeasured rigs and everything that depends on them, and reports it", () => {
  const X = executableSubset(DOC(), { tracks: { A: {}, B: {} }, gaze: [{ rig: "A", target: { rig: "B" } }, { rig: "A" }], ik_branches: [{ rig: "B" }] });
  assert.deepEqual(X.kept_rigs, ["A", "P"]); assert.equal(X.doc.actions[0].contact_events.length, 1); assert.equal(X.doc.actions[0].actors.length, 2);
  assert.deepEqual(X.removed.rigs, ["B"]); assert.equal(X.removed.contacts.length, 1); assert.equal(X.removed.events.length, 2); assert.ok(!X.plan.tracks.B && X.plan.tracks.A); assert.equal(X.plan.gaze.length, 1); assert.equal(X.plan.ik_branches.length, 0);
});
test("RI-2 runtime plan: absolute root keys become offsets from the staged placement; cameras only from a directed solution; head camera math", () => {
  const rt = RP.compileRuntimePlan({ doc: DOC(), plan: { tracks: { A: { root: { x: [[0, 500], [60, 540, "sine.inOut"]], y: [[0, 900]], scale: [[0, 1]] } } } } });
  assert.deepEqual(rt.placements.A, { x: 500, y: 900, scale: 1, from_action: "X1" }); assert.deepEqual(rt.tracks.A.root.x, [[0, 0], [60, 40, "sine.inOut"]]); assert.ok(rt.pending.some((p) => p.kind === "CAMERA" && p.id === "CAM1"));
  const cam = RP.headCamera({ stage: { width: 1920, height: 1080 }, headTopWorld: [1000, 500], chinWorld: [1000, 600], directedHeadPx: 250, frameFraction: [0.5, 1 / 3] });
  const toF = ([x, y]) => [(x - cam.x) * cam.zoom + 960, (y - cam.y) * cam.zoom + 540]; assert.ok(Math.abs(cam.zoom - 2.5) < 1e-12); assert.ok(Math.abs(toF([1000, 600])[1] - toF([1000, 500])[1] - 250) < 1e-9); assert.ok(Math.abs((toF([1000, 500])[1] + toF([1000, 600])[1]) / 2 - 360) < 1e-9);
});
test("RI-3 performance packet: each hand GRIP becomes a grip that adopts it (+ a release where released); unmeasured characters are compiled but held PENDING_GEOMETRY; schema-valid", () => {
  const out = compilePerformancePacket({ doc: DOC(), sourceDigest: "d".repeat(64), decisionIds: ["dd1"], approvedMaster: (id) => id !== "B_M" });
  const S = JSON.parse(fs.readFileSync(path.join(REPO, "schemas", "performance_command_v1_1.schema.json"), "utf8")); assert.deepEqual(validate(S, out.full), []);
  const verbs = out.full.commands.map((c) => `${c.actor_rig_id}:${c.verb}:${c.frames}`); assert.deepEqual(verbs.sort(), ["A:grip:10,60", "A:release:60,68", "B:grip:0,120"]);
  assert.deepEqual(out.executable.commands.map((c) => c.actor_rig_id), ["A", "A"]); assert.ok(out.pending.some((p) => p.kind === "CHARACTER" && p.id === "B"));
  const g = out.full.commands.find((c) => c.verb === "grip" && c.actor_rig_id === "A"); assert.deepEqual(g.required_poststate.possession, { P: "A#r" }); assert.deepEqual(g.required_art_refs.sort(), ["A.hand_grip", "A.hand_open"]);
});
test("RI-4 a GEOMETRY_ONLY compiled plan can never be rendered", () => { assert.throws(() => composeShot({ id: "S1" }, null, { geometry_only: true, deferred_art: [{}] }), /GEOMETRY_ONLY/); });
test("RI-5 native-resolution threshold calibrated on the master: a sharp native drawing passes, its bilinear enlargement fails", () => {
  const W = 120, H = 120, img = (w, h, f) => { const rgba = Buffer.alloc(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, v = f(x, y); rgba[i] = rgba[i + 1] = rgba[i + 2] = v; rgba[i + 3] = 255; } return { width: w, height: h, rgba }; };
  const shape = (s) => (x, y) => ((Math.floor(x / (6 * s)) + Math.floor(y / (9 * s))) % 2 ? 230 : 30), master = img(W, H, shape(1)), native2 = img(2 * W, 2 * H, shape(2)), up2 = CR.enlargeBilinear(master, 2);
  const cal = CR.masterCalibratedThreshold(master, 2); assert.ok(cal.separable, JSON.stringify(cal));
  const req = { measure: Object.keys(CR.MEASURES || {})[0] ?? "head_height_px", from_landmark: "a", to_landmark: "b", span: "vertical", min_native_px: 1 }, lm = { a: [10, 10], b: [10, 200] };
  assert.equal(CR.verifyComponentNative({ deliveredPng: native2, deliveredLandmarks: lm, requirement: req, scaleFromMaster: 2, masterPng: master }).ok, true);
  assert.equal(CR.verifyComponentNative({ deliveredPng: up2, deliveredLandmarks: lm, requirement: req, scaleFromMaster: 2, masterPng: master }).ok, false);
});
const RPj = await import("../../engine/art_bridge/room_projection.mjs"), PM = await import("../../engine/art_bridge/physical_motion.mjs"), K = await import("../../engine/art_bridge/constraints.mjs"), AI = await import("../../engine/art_bridge/art_intake.mjs");
test("RI-6 room projection: horizon from two receding level lines; one ratio for every adult; scale-1 depth inside a floor range or null", () => {
  const H = RPj.horizonFromLines([[0, 100], [100, 90]], [[0, 300], [100, 310]]); assert.ok(Math.abs(H.horizon - 200) < 1e-9);
  const P = RPj.roomProjection({ horizon: 200, reference: { stature_px: 400, floor_y: 1000 } }); assert.ok(Math.abs(P.statureAt(600) - 200) < 1e-9); assert.ok(Math.abs(P.floorForStature(100) - 400) < 1e-9); assert.equal(P.floorForStature(100, [450, 900]), null);
  const st = P.stage({ P0: 50, rel: { floor: [0, 20] }, floor_y: 600, root_x: 300 }); assert.ok(Math.abs(st.scale - 4) < 1e-9); assert.deepEqual(st.root_world_xy, [300, 520]);
});
test("RI-7 the solver's two-bone branch IS the runtime's (constraints.mjs) for both signs — a branch solved offline is the branch rendered", () => {
  for (const bend of [1, -1]) for (const T of [[60, 40], [-30, 70], [10, -80]]) { const a = PM.twoBoneIK([0, 0], 70, 50, T, bend), b = K.solveTwoBonePosition([0, 0], T, 70, 50, bend), e = [70 * Math.cos(a.a1), 70 * Math.sin(a.a1)];
    assert.ok(Math.hypot(e[0] - b.elbow[0], e[1] - b.elbow[1]) < 1e-9, `bend ${bend} target ${T}`); assert.equal(PM.restBend([0, 0], b.elbow, T), bend); }
});
test("RI-8 a socket whose landmark the registration DEFERS to another drawing stays pending and does not block the measured rig", () => {
  const rig = { id: "P", geometry_source: "MEASURED_FROM_ART", geometry_status: "UNMEASURED", joints: [{ id: "root", landmark_id: "center", rest_xy: [0, 0] }], sockets: [{ id: "P.grip", joint_id: "root", landmark_id: "grip", local_xy: [0, 0] }, { id: "P.lens", joint_id: "root", landmark_id: "lens", local_xy: [0, 0] }] }, I = { landmarks: {} };
  AI.fitInterfacesToMeasured([structuredClone(rig)], I, { center: [10, 10], grip: [4, 12] }, []).joints; const r1 = structuredClone(rig); AI.fitInterfacesToMeasured([r1], { landmarks: {} }, { center: [10, 10], grip: [4, 12] }, []); assert.equal(r1.geometry_status, "UNMEASURED", "an undeclared missing landmark still blocks");
  const r2 = structuredClone(rig); AI.fitInterfacesToMeasured([r2], { landmarks: {} }, { center: [10, 10], grip: [4, 12] }, [], { lens: { to_asset: "P.back", face: "back", reason: "rear only" } });
  assert.equal(r2.geometry_status, "MEASURED"); assert.deepEqual(r2.joints[0].rest_xy, [10, 10]); assert.deepEqual(r2.sockets[0].local_xy, [-6, 2]); assert.equal(r2.sockets[1].pending_landmark.deferred_to, "P.back");
});
