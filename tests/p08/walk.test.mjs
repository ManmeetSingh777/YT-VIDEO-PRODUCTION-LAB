// P08 B04 — articulated locomotion from an approved step schedule: stance feet world-anchored (PLANT), swing feet on a clearance arc (PATH contact),
// pelvis advancing with bounded sway, knees from the approved IK branch, measured every frame (engine/film/composition_qa.mjs WALK) and on owner
// pixels. Two unlike bipeds (tall kade, short pim, opposite directions); a non-biped topology is refused. DIAGNOSTIC character fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs"), { verifyComposition } = await import("../../engine/film/composition_qa.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan, d = doc) => compileMotionTracks(d.actions, d.shots, { doc: d, plan, requireApproval: false });
const C0 = compile(CF.basePlan()), sole = (sid, s) => C0.socketWorld(`${sid}_rig`, stateAtFrame(C0, 0).matrices[`${sid}_rig`], `${sid}_sole_${s}`);
const sched = (first, n, t0, step, gap) => [...Array(n)].map((_, i) => ({ foot: i % 2 === 0 ? first : first === "r" ? "l" : "r", lift: t0 + i * (step + gap), land: t0 + i * (step + gap) + step }));
const WALK = (o = {}) => ({ id: "kade_walk", kind: "WALK", owner: "kade_rig", frames: [20, 260], inputs: { ground_y: sole("kade", "l")[1], from_x: 560, to_x: 760, feet: { l: { socket: "kade_sole_l" }, r: { socket: "kade_sole_r" } }, steps: sched("r", 6, 10, 28, 4), sway_px: 4, pelvis_drop_px: 10, clearance_px: 16 }, limits: { max_stride_px: 120, support_margin_px: 45 }, expected_effect: { kind: "GAIT" }, ...o });
const WALKP = (o = {}) => ({ id: "pim_walk", kind: "WALK", owner: "pim_rig", frames: [40, 300], inputs: { ground_y: sole("pim", "l")[1], from_x: 1080, to_x: 980, feet: { l: { socket: "pim_sole_l" }, r: { socket: "pim_sole_r" } }, steps: sched("l", 8, 10, 22, 6), sway_px: 2, pelvis_drop_px: 6, clearance_px: 10 }, limits: { max_stride_px: 60, support_margin_px: 40 }, expected_effect: { kind: "GAIT" }, ...o });
const planOf = (prims) => ({ ...CF.basePlan(), composition: { schema_version: "1.0.0", primitives: prims } });
const C = compile(planOf([WALK(), WALKP()])), Q = verifyComposition(C), W = (id) => Q.results.find((r) => r.primitive === id);
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.failed_invariant ?? x.details?.failed_invariant })); } };
test("B04-1 two unlike bipeds walk from approved step schedules: planted stance, clearance arcs, no flight, pelvis over support, monotone progress", () => {
  assert.ok(Q.ok, Q.failures.map((x) => `${x.code} ${x.record_id} ${x.human_readable_reason}`).slice(0, 4).join("\n"));
  for (const id of ["kade_walk", "pim_walk"]) { const r = W(id); assert.ok(r.frames_checked >= 240, id); assert.ok(r.measurement.max_stance_drift_px <= 1.5 && r.measurement.max_penetration_px <= 0.5 && r.measurement.min_mid_swing_clearance_px >= 2, `${id}: ${JSON.stringify(r.measurement)}`); }
  const pelvis = (Cx, rid, f) => { const s = stateAtFrame(Cx, f), j = Cx.rigs.get(rid).root; return s.matrices[rid][j.id][4]; };
  assert.ok(pelvis(C, "kade_rig", 259) > pelvis(C, "kade_rig", 20) + 150 && pelvis(C, "pim_rig", 299) < pelvis(C, "pim_rig", 40) - 80, "both actually travel (kade right, pim left)");
  const knee = (f, who) => { const s = stateAtFrame(C, f), M = s.matrices[`${who}_rig`]; return Math.atan2(M.knee_l[1], M.knee_l[0]) - Math.atan2(M.hip_l[1], M.hip_l[0]); }; assert.notEqual(knee(60, "kade").toFixed(3), knee(60, "pim").toFixed(3), "each biped's own leg geometry");
});
test("B04-2 negatives: no step schedule, impossible stride (too few steps), flight without running, feet stepping twice, non-biped topology, stance anchor slid, swapped knee branch", () => {
  assert.ok(codes(() => compile(planOf([WALK({ inputs: { ...WALK().inputs, steps: [] } })]))).some((x) => x.inv === "STEP_SCHEDULE_APPROVED"), "a root glide with no steps is refused");
  assert.ok(codes(() => compile(planOf([WALK({ inputs: { ...WALK().inputs, steps: sched("r", 2, 10, 60, 10) } })]))).some((x) => x.inv === "STRIDE_WITHIN_APPROVED"), "impossible stride: refused, never stretched");
  assert.ok(codes(() => compile(planOf([WALK({ inputs: { ...WALK().inputs, steps: sched("r", 6, 10, 30, -6) } })]))).some((x) => x.inv === "NO_FLIGHT_UNLESS_RUNNING"));
  assert.ok(codes(() => compile(planOf([WALK({ inputs: { ...WALK().inputs, steps: [{ foot: "r", lift: 10, land: 30 }, { foot: "r", lift: 40, land: 60 }] } })]))).some((x) => x.inv === "FEET_ALTERNATE"));
  assert.ok(codes(() => compile(planOf([{ ...WALK(), id: "token_walk", owner: "token_rig", inputs: { ...WALK().inputs, feet: { l: { socket: "token_rim" }, r: { socket: "token_rim_face" } } } }]))).some((x) => x.code === "LOCOMOTION_TOPOLOGY_UNSUPPORTED"), "a coin has no legged role map");
  { const Cs = compile(planOf([WALK()])), d = clone(Cs.doc), act = d.actions.find((a) => a.id === CF.ACT.kade), plant = act.contact_events.find((c) => c.contact_type === "PLANT" && c.start_frame > 60 && c.source_socket === "kade_sole_l"); plant.target_world_xy = [plant.target_world_xy[0] + 8, plant.target_world_xy[1]];
    const Ct = compileMotionTracks(d.actions, d.shots, { doc: d, plan: Cs.plan, requireApproval: false }), q = verifyComposition({ ...Ct, composition: Cs.composition }); assert.ok(q.failures.some((x) => x.record_id === "kade_walk" && /slides/.test(x.human_readable_reason)), "a stance foot that moves is a slide"); }
  { const d = clone(doc); d.rigs.find((r) => r.id === "kade_rig").constraints.find((k) => k.id === "leg_l_ik").bend_sign = 1; const q = verifyComposition(compile(planOf([WALK()]), d)); assert.ok(q.failures.some((x) => x.record_id === "kade_walk" && /JOINT_LIMIT_EXCEEDED|UNAPPROVED_BEND_BRANCH|knee/.test(x.human_readable_reason)), "a swapped knee branch is refused by the approved limits"); }
});
test("B04-3 real Chrome owner pixels: a stance foot's own pixels stay put while the torso's pixels advance", async () => {
  const browser = await launch(), out = isolatedWork("p08_walk_render");
  try { const seg = C.composition.primitives.find((p) => p.id === "kade_walk").feet.l.segments.find((g) => g.kind === "PLANT" && g.frames[1] - g.frames[0] > 20), [a, b] = [seg.frames[0] + 2, seg.frames[1] - 2];
    const scene = composeShot(doc.shots[0], reg, C, { prefix: "walk-" }), comp = buildComposition(path.join(out, "comp"), { id: "walk", scene, frameRange: [a, b + 1], registry: reg }), cap = await capture(comp, FILM, [a, b], path.join(out, "frames"), { id: "walk", browser }), A = readPNG(cap.files[0]), B = readPNG(cap.files[1]);
    const c = (png, col) => { let x = 0, y = 0, n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - col[0]) <= 3 && Math.abs(png.rgba[i + 1] - col[1]) <= 3 && Math.abs(png.rgba[i + 2] - col[2]) <= 3) { const k = i / 4; x += k % png.width; y += Math.floor(k / png.width); n++; } return { n, c: [x / n, y / n] }; };
    const fa = c(A, CF.COL["kade:foot_l"]), fb = c(B, CF.COL["kade:foot_l"]), ta = c(A, CF.COL["kade:torso"]), tb = c(B, CF.COL["kade:torso"]), ev = { frames: [a, b], foot_shift: Math.hypot(fb.c[0] - fa.c[0], fb.c[1] - fa.c[1]), torso_advance: tb.c[0] - ta.c[0] };
    assert.ok(fa.n > 50 && ev.foot_shift < 1.5, `stance foot pixels stay put (${ev.foot_shift.toFixed(2)}px)`); assert.ok(ev.torso_advance > 10, `the torso advances (${ev.torso_advance.toFixed(1)}px)`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, ...ev }, null, 1));
  } finally { await browser.close(); }
});
