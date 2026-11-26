// P08 B07 — CARRY (B01 actor-driven prop + real locomotion), LOAD_CONTAINER (enters through the opening, rests on the inside socket, occluded by
// the container's front layer), INSERT_TOKEN (aligned with the slot axis, monotone depth, inside the slot laterally, stops at depth, hidden by the
// aperture layer). Each is a typed route on the existing producers; every consequence measured per frame + owner pixels. DIAGNOSTIC fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), H = await import("./perf_helpers.mjs"), PC = await import("../../engine/art_bridge/performance_commands.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyComposition } = await import("../../engine/film/composition_qa.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.failed_invariant ?? x.details?.failed_invariant })); } };
const C0 = compile(CF.basePlan()), S0 = stateAtFrame(C0, 0), SLOT = C0.socketWorld("box_rig", S0.matrices.box_rig, "box_slot"), INSIDE = C0.socketWorld("box_rig", S0.matrices.box_rig, "box_inside");
// ── insertion and loading: the coin stands edge-down above the slot (rot 90 puts its rim axis on the slot axis) and moves on its own directed path
const tokenPlan = ({ y = [[0, 0], [59, 70, "sine.inOut"]], x = [[0, 0]], rot = 90, prims = [] } = {}) => { const p = CF.basePlan(); p.placements.token_rig = { x: SLOT[0], y: SLOT[1] - 10 - 40, rot, scale: 1 };
  return { ...p, composition: { schema_version: "1.0.0", primitives: [{ id: "coin_path", kind: "ROOT_MOVE", owner: "token_rig", frames: [100, 160], inputs: { x, y }, expected_effect: { kind: "PATH" } }, ...prims] } }; };
const INSERT = (o = {}) => ({ id: "insert_coin", kind: "INSERT_TOKEN", owner: "token_rig", frames: [100, 200], inputs: { container_rig: "box_rig", slot_socket: "box_slot", token_socket: "token_rim", depth_px: 30, stop_at: 59, lateral_tolerance_px: 2, angle_tolerance_deg: 3, aperture_slot: "box_body", ...o }, expected_effect: { kind: "INSERTED" } });
const LOAD = (o = {}) => ({ id: "load_coin", kind: "LOAD_CONTAINER", owner: "token_rig", frames: [100, 200], inputs: { container_rig: "box_rig", inside_socket: "box_inside", prop_base_socket: "token_rim", rim_socket: "box_slot", opening_half_width_px: 4, rest_from: 60, front_slot: "box_front", ...o }, expected_effect: { kind: "CONTAINED" } });
const loadPlan = (o = {}) => tokenPlan({ y: [[0, 0], [59, INSIDE[1] - SLOT[1] + 40, "sine.inOut"]], prims: [LOAD(o.load || {})], ...(o.path || {}) });
test("B07-1 INSERT_TOKEN: aligned, monotone, inside the slot, stops at the directed depth; negatives: wall, orientation, overshoot, withdrawal, missing aperture layer", () => {
  const ok = verifyComposition(compile(tokenPlan({ prims: [INSERT()] }))); assert.ok(ok.ok, ok.failures.map((x) => x.human_readable_reason).slice(0, 3).join("; ")); assert.equal(ok.results.find((r) => r.primitive === "insert_coin").measurement.max_depth_px, 30);
  const fail = (o, re) => { const q = verifyComposition(compile(tokenPlan({ prims: [INSERT()], ...o }))); assert.match(q.failures.filter((x) => x.record_id === "insert_coin").map((x) => x.human_readable_reason).join(" "), re); };
  fail({ x: [[0, 0], [30, 0], [59, 20]] }, /solid wall/); fail({ rot: 60 }, /wrong orientation/); fail({ y: [[0, 0], [59, 90, "sine.inOut"]] }, /past the directed depth/); fail({ y: [[0, 0], [40, 70, "sine.inOut"], [59, 50]] }, /monotone/);
  assert.ok(codes(() => compile(tokenPlan({ prims: [INSERT({ aperture_slot: "box_lid" })] }))).some((x) => x.inv === "OCCLUDING_LAYER_PAINTED"));
});
test("B07-2 LOAD_CONTAINER: through the opening to the inside socket, occluded by the front layer; negatives: through the wall, teleport, short of the floor", () => {
  const ok = verifyComposition(compile(loadPlan())); assert.ok(ok.ok, ok.failures.map((x) => x.human_readable_reason).slice(0, 3).join("; "));
  const fail = (o, re) => { const q = verifyComposition(compile(loadPlan(o))); assert.match(q.failures.filter((x) => x.record_id === "load_coin").map((x) => x.human_readable_reason).join(" "), re); };
  fail({ path: { x: [[0, 0], [20, 0], [59, 30]] } }, /container wall/); fail({ path: { y: [[0, 0], [30, 0], [31, INSIDE[1] - SLOT[1] + 40]] } }, /teleport/); fail({ path: { y: [[0, 0], [59, INSIDE[1] - SLOT[1] + 20]] } }, /inside socket/);
});
test("B07-3 CARRY: the page's transform is written by the walking carrier's hand (B01) the whole way; negative: a page with its own (static) owner while the actor walks", () => {
  const C00 = compile(CF.basePlan()), palm = C00.socketWorld("kade_rig", stateAtFrame(C00, 0).matrices.kade_rig, "kade_palm_r"), ground = C00.socketWorld("kade_rig", stateAtFrame(C00, 0).matrices.kade_rig, "kade_sole_l")[1];
  const K = { actor_rig_id: "kade_rig", character_profile_id: "kade_perf", action_id: CF.ACT.kade }, sched = [...Array(6)].map((_, i) => ({ foot: i % 2 ? "l" : "r", lift: 10 + i * 32, land: 10 + i * 32 + 28 }));
  const carryPlan = (mode) => { const p = CF.basePlan(); p.placements.sheet_rig = { x: palm[0] - 58, y: palm[1], scale: 1 };
    const sup = { schema_version: "1.1.0", props: [{ id: "page", prop_rig_id: "sheet_rig", test_id: "P08-CARRY", max_step_px: 8, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, hands: [{ ref: "kade_rig#r", prop_socket: "sheet_edge_r_front" }], surfaces: [], authority: [{ frames: [0, 10], driver: "kade_rig#r", required_supports: [], mode: "OBJECT_DRIVEN" }, { frames: [10, 300], driver: "kade_rig#r", required_supports: [], mode }] }] };
    return H.withExactArt(PC, doc, { ...p, composition: { schema_version: "1.0.0", primitives: [{ id: "kade_walk", kind: "WALK", owner: "kade_rig", frames: [20, 260], inputs: { ground_y: ground, from_x: 560, to_x: 760, feet: { l: { socket: "kade_sole_l" }, r: { socket: "kade_sole_r" } }, steps: sched, sway_px: 4, pelvis_drop_px: 10, clearance_px: 16 }, limits: { max_stride_px: 120, support_margin_px: 45 }, expected_effect: { kind: "GAIT" } },
      { id: "carry_page", kind: "CARRY", owner: "sheet_rig", frames: [20, 260], inputs: { carrier_rig: "kade_rig", hand_socket: "kade_palm_r", min_travel_px: 150 }, expected_effect: { kind: "CARRIED" } }] },
      performance: { packet: { schema_version: "1.1.0", film_id: "p08_characters", fps: 60, total_frames: doc.stage.total_frames, characters: H.characters(doc), commands: [H.grip(K, "kade_holds_page", [0, 300], { kind: "RIG_SOCKET", rig_id: "sheet_rig", socket_id: "sheet_edge_r_front" }, "r", 5)] }, profiles: H.profiles(), audio_cues: {}, prop_support: sup } }); };
  const C = compile(carryPlan("ACTOR_DRIVEN")), Q = verifyComposition(C), P = verifyPerformance(C);
  assert.ok(Q.ok, Q.failures.map((x) => x.human_readable_reason).slice(0, 3).join("; ")); assert.ok(P.results.find((r) => r.kind === "PropSupportContract")?.ok, P.failures.map((x) => x.human_readable_reason).slice(0, 2).join("; "));
  assert.ok(Q.results.find((r) => r.primitive === "carry_page").measurement.travel_px > 150);
  const N = compile(carryPlan("OBJECT_DRIVEN")), qn = verifyComposition(N), pn = verifyPerformance(N);
  assert.ok(qn.failures.some((x) => x.record_id === "carry_page" && /not written by/.test(x.human_readable_reason)), "an unowned/separately owned prop is not a carry"); assert.ok(!pn.results.find((r) => r.kind === "PropSupportContract").ok, "and the hand loses the page as the body walks");
});
test("B07-4 real Chrome owner pixels: the inserted coin is hidden by the aperture layer; without the layer order it shows through", async () => {
  const browser = await launch(), out = isolatedWork("p08_insert_render");
  try { const shoot = async (Cx, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [100, 181], registry: reg }); const cap = await capture(comp, FILM, [100, 180], path.join(out, name, "frames"), { id: name, browser }); return cap.files.map(readPNG); };
    const n = (png) => { const c = CF.COL["token:coin"]; let k = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= 3 && Math.abs(png.rgba[i + 1] - c[1]) <= 3 && Math.abs(png.rgba[i + 2] - c[2]) <= 3) k++; return k; };
    const C = compile(tokenPlan({ prims: [INSERT()] })), [a, b] = await shoot(C, "ins"), [, bn] = await shoot({ ...C, plan: { ...C.plan, paint_order: (C.plan.paint_order || []).filter((x) => x.source !== "composition:insert_coin").concat([{ above: "token_rig", below: "box_body" }]) } }, "ins_neg");
    const ev = { before: n(a), inserted: n(b), inserted_without_aperture: n(bn) }; assert.ok(ev.before > 50 && ev.inserted < ev.before * 0.5, `the inserted part of the coin is hidden (${JSON.stringify(ev)})`); assert.ok(ev.inserted_without_aperture > ev.inserted + 20, `without the aperture order the coin shows through the box (${JSON.stringify(ev)})`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, ...ev }, null, 1));
  } finally { await browser.close(); }
});
