// Directive I1/I3/I4/I6 — M01 transform ownership, M06 view turns need cels, M07 homologous morph + approved deform map, M09 cast shadows
// with occluder/receiver + material response, M11 portal OUT/MIDDLE/IN, M15 a missing state never falls back to other art.
import test from "node:test"; import assert from "node:assert/strict";
const P = await import("../../engine/art_bridge/motion_systems.mjs"), Dm = await import("../../engine/art_bridge/deform.mjs");

test("M01 disjoint transform ownership: camera → plane → root → joint → art; double owners, wrong nesting and cycles are refused", () => {
  const ok = P.validateTransformOwnership([{ id: "cam", owner: "camera" }, { id: "far", owner: "world_plane", parent: "cam" }, { id: "rig", owner: "rig_root", parent: "far" }, { id: "arm", owner: "joint", parent: "rig" }, { id: "arm_art", owner: "art", parent: "arm" }]); assert.equal(ok.ok, true);
  const bad = P.validateTransformOwnership([{ id: "cam", owner: ["camera", "rig_root"] }, { id: "arm", owner: "joint", parent: "cam" }, { id: "cam2", owner: "camera", parent: "arm" }, { id: "arm", owner: "art" }]);
  for (const c of ["INVALID_TRANSFORM_OWNER", "DUPLICATE_ELEMENT_ID"]) assert.ok(bad.failures.some((x) => x.code === c), c);
  assert.ok(P.validateTransformOwnership([{ id: "a", owner: "joint", parent: "b" }, { id: "b", owner: "joint", parent: "a" }]).failures.some((x) => x.code === "INVALID_RIG_DAG"));
});

test("M06 a full turn needs registered view cels; rotating the front PNG is refused", () => {
  assert.equal(P.validateViewTurn({ from_view: "threeq_r", to_view: "profile_r", cels: [], rotation_of_front: true }).failures[0].code, "UNSUPPORTED_VIEW");
  assert.equal(P.validateViewTurn({ from_view: "threeq_r", to_view: "rear", cels: [{ view: "profile_r" }] }).failures[0].code, "UNSUPPORTED_VIEW");
  assert.equal(P.validateViewTurn({ from_view: "threeq_r", to_view: "profile_r", cels: [{ view: "profile_r", landmarks_shared_with: { threeq_r: ["head_top", "chin"] } }] }).failures[0].code, "UNSUPPORTED_STATE_EDGE");
  assert.equal(P.validateViewTurn({ from_view: "threeq_r", to_view: "profile_r", cels: [{ view: "profile_r", landmarks_shared_with: { threeq_r: ["head_top", "chin", "pelvis"] } }] }).ok, true);
});

test("M07 REGISTERED_MORPH needs homologous topology; EXPLICIT_DEFORM needs an approved, non-flipping map", () => {
  const sq = "M0 0 L100 0 L100 100 L0 100 Z", sq2 = "M10 0 L110 10 L100 110 L-5 95 Z";
  assert.equal(Dm.validateMorph(sq, sq2).ok, true);
  assert.ok(Dm.validateMorph(sq, "M0 0 L100 0 L100 100 Z").failures.some((f) => /command structure/.test(f.reason)));
  assert.ok(Dm.validateMorph(sq, "M0 0 L0 100 L100 100 L100 0 Z").failures.some((f) => /winding/.test(f.reason)));
  assert.ok(Dm.validateMorph(sq, sq + " M200 0 L210 0 L210 10 Z").failures.some((f) => /subpath count/.test(f.reason)));
  assert.ok(Dm.validateMorph(sq, "M0 0 L100 0 L0 100 L100 100 Z").failures.length > 0, "a crossing in-between is refused");
  assert.throws(() => Dm.parsePath("m0 0 l10 0 l0 10 z"), (e) => e.code === "INVALID_MORPH_TOPOLOGY");
  const map = { approved_receipt: "design__sleeve_fold__x", vertices: [[0, 0], [100, 0], [100, 100], [0, 100]], targets: [[0, 0], [110, 10], [105, 100], [0, 95]], triangles: [[0, 1, 2], [0, 2, 3]] };
  assert.equal(Dm.validateDeformMap(map).ok, true); assert.deepEqual(Dm.deformPoint(map, [100, 0], 1).map((v) => +v.toFixed(6)), [110, 10]);
  assert.equal(Dm.validateDeformMap({ ...map, approved_receipt: null }).ok, false); assert.equal(Dm.validateDeformMap({ ...map, targets: [[0, 0], [100, 0], [-50, 100], [0, 100]] }).ok, false, "a flipping triangle is refused");
});

test("M09 cast shadows exist only for occluder→receiver relations; treatment differs by receiver material (no universal crescent)", () => {
  const occ = { id: "hand", polygon: [[100, 50], [130, 50], [130, 80], [100, 80]] }, light = { direction: [0.3, 1], state: "afternoon" };
  const fab = P.castShadow({ light, occluder: occ, receiver: { id: "jacket", plane_y: 200, material: "fabric" } }), met = P.castShadow({ light, occluder: occ, receiver: { id: "door", plane_y: 200, material: "metal" } });
  assert.deepEqual(fab.polygon, met.polygon); assert.notDeepEqual(fab.treatment, met.treatment); assert.equal(fab.polygon[0][1], 200);
  assert.throws(() => P.castShadow({ light, occluder: occ, receiver: { id: "x" } }), (e) => e.code === "SHADOW_RELATION_MISSING");
  assert.throws(() => P.castShadow({ light, occluder: occ, receiver: { id: "x", plane_y: 10, material: "plasma" } }), (e) => e.code === "SHADOW_RELATION_MISSING");
});

test("M11 portal OUT→MIDDLE→IN shares one aperture with a rim occluder and full mask coverage; an opacity zoom-cut is refused", () => {
  const base = { out_plate: { aperture_id: "porthole" }, middle_plate: {}, in_plate: { aperture_id: "porthole" }, aperture_curve: { id: "porthole" }, rim_occluder: {}, frames: [{ f: 1900, mask_coverage: 1 }, { f: 1901, mask_coverage: 1 }] };
  assert.equal(P.validatePortal(base).ok, true);
  assert.ok(P.validatePortal({ ...base, middle_plate: null }).failures.some((f) => /middle_plate/.test(f.reason)));
  assert.ok(P.validatePortal({ ...base, frames: [{ f: 1900, mask_coverage: 0.97 }] }).failures.some((f) => f.code === "OUTSIDE_CAMERA_FOOTPRINT"));
  assert.ok(P.validatePortal({ ...base, frames: [{ f: 1900, mask_coverage: 1, opacity_crossfade: true }] }).failures.some((f) => /zoom-cut/.test(f.reason)));
});

test("M15 a missing state is a typed MISSING_ART_ASSET demand with frames — never substituted by other art", async () => {
  const { deriveArtDemands } = await import("../../engine/art_bridge/art_demand.mjs");
  const doc = { identities: [{ id: "x", kind: "CHARACTER" }], rigs: [{ id: "rx", identity_id: "x", joints: [], sockets: [{ id: "grip_r", joint_id: "w" }], render_parts: [{ asset_id: "x_hand" }], pose_states: [{ id: "open", asset_bindings: {}, view_facing: "front" }, { id: "grip", asset_bindings: { x_hand: "x_hand_grip" }, view_facing: "front" }], view_states: [], allowed_state_edges: [] }],
    actions: [{ id: "a", shot_id: "s", mode: "ARTICULATED", frame_range: [0, 100], actors: [{ rig_id: "rx" }], pose_events: [{ frame: 0, state_id: "open" }, { frame: 40, state_id: "grip" }], view_events: [], contact_events: [{ start_frame: 40, end_frame: 80, source_socket: "grip_r", target_socket: "cup", contact_type: "GRIP" }] }], shots: [{ id: "s", start_frame: 0, end_frame: 100 }], transitions: [], worlds: [] };
  const r = deriveArtDemands({ doc, plan: { assets: [{ asset_id: "x_hand" }] } });
  const grip = r.missing.find((m) => m.record_id === "x_hand_grip"); assert.ok(grip, JSON.stringify(r.missing)); assert.deepEqual(grip.frame_ranges, [[40, 100]]);
  assert.ok(r.missing.some((m) => /GRIP_hand_state/.test(m.record_id) && m.frame_ranges[0][0] === 40));
});

test("M07b the PRODUCTION state router refuses a non-homologous vector morph and an unapproved deform map on a state edge", async () => {
  const { validateStateEdge } = await import("../../engine/art_bridge/state_router.mjs");
  const rig = { id: "r", pose_states: [{ id: "a", view_facing: "front", asset_bindings: { s: "pa" } }, { id: "b", view_facing: "front", asset_bindings: { s: "pb" } }], view_states: [], allowed_state_edges: [{ from: "a", to: "b", mode: "MATCHED_VECTOR_MORPH", approved_assembly_review_id: "x" }, { from: "b", to: "a", mode: "EXPLICIT_DEFORM", deform_map: { vertices: [[0, 0], [1, 0], [0, 1]], targets: [[0, 0], [1, 0], [0, 1]], triangles: [[0, 1, 2]] }, approved_assembly_review_id: "x" }] };
  const assets = new Map([["pa", { kind: "VECTOR_PATH", path_d: "M0 0 L100 0 L100 100 L0 100 Z" }], ["pb", { kind: "VECTOR_PATH", path_d: "M0 0 L100 0 L100 100 Z" }]]);
  assert.throws(() => validateStateEdge("a", "b", rig, assets), (e) => e.code === "INVALID_MORPH_TOPOLOGY");
  assert.throws(() => validateStateEdge("b", "a", rig, assets), (e) => e.code === "INVALID_DEFORM_MAP");
  assets.set("pb", { kind: "VECTOR_PATH", path_d: "M5 0 L105 5 L100 100 L0 95 Z" }); assert.equal(validateStateEdge("a", "b", rig, assets).mode, "MATCHED_VECTOR_MORPH");
});

test("G-wiring the film-contracts compiler (run by exportOutbox before art) reports the real proposal's blockers from its own producers", async () => {
  const { compileFilmContracts } = await import("../../engine/tools/compile_film_contracts.mjs"), fs = await import("node:fs"), path = await import("node:path"), url = await import("node:url");
  const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), d = path.join(REPO, "hybrid_v2", "work", "g_wiring"); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(path.join(REPO, "films", "hv2_film001"), d, { recursive: true });
  const r = compileFilmContracts({ film: d });
  assert.ok(r.blockers.story >= 1, "unverified story must block"); assert.ok(r.blockers.uncompiled_actions >= 1, "S02 'loads' must be uncompiled"); assert.equal(r.blockers.tiling, 0); assert.ok(r.sections.actions.find((a) => a.shot === "S02").errors.some((e) => /LOAD_CONTAINER/.test(e.reason)));
  assert.ok(fs.existsSync(path.join(d, "story", "FILM_CONTRACT_REPORT.json")));
});
