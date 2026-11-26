// P08 B01 — real prop transform authority. The prop's world transform is WRITTEN by exactly one named authority per frame:
//   ACTOR_DRIVEN  (driver hand's world frame · H_to_P measured on the validated frame before the span), OBJECT_DRIVEN (the prop's own directed track;
//   hands follow by IK), SURFACE_DRIVEN (fixed hold or a moving registered surface socket), FREE_AUTHORED (directed flight, no grip).
// Real chain: contract → compilePerformance → compileMotionTracks → stateAtFrame → performance QA → Chrome owner pixels. DIAGNOSTIC P07 fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const F = await import("../tbo/support_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), PS = await import("../../engine/art_bridge/prop_support.mjs"), { validate } = await import("../../engine/art_bridge/jsonschema.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs");
const { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await F.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = F.clone;
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, rec: x.record_id, fr: x.frame_range })); } };
const has = (l, code, inv) => l.some((x) => x.code === code && (!inv || x.inv === inv));
const rootJ = (rid) => doc.rigs.find((r) => r.id === rid).joints.find((j) => !j.parent_id);
const pivot = (C, f, rid) => { const st = stateAtFrame(C, f), j = rootJ(rid); const M = st.matrices[rid][j.id]; return [M[0] * j.rest_xy[0] + M[2] * j.rest_xy[1] + M[4], M[1] * j.rest_xy[0] + M[3] * j.rest_xy[1] + M[5]]; };
const sockAt = (C, f, rid, sid) => C.socketWorld(rid, stateAtFrame(C, f).matrices[rid], sid);
// the P07 compile is the reference for where the hands are before the actor takes over (measured, never typed)
const C07 = compile(F.planWith(doc)), H227 = sockAt(C07, 227, "tova_rig", "tova_palm_r"), H355 = sockAt(C07, 355, "tova_rig", "tova_palm_r");
const path60 = { x: [[228, H227[0]]], y: [[228, H227[1]], [264, H227[1] + 60, "sine.inOut"]] };
const draw = { x: [[356, H355[0]], [368, H355[0]], [404, H355[0] - 34, "sine.inOut"]], y: [[356, H355[1]], [368, H355[1]], [404, H355[1] + 10, "sine.inOut"]] };
/** v1.1.0: the hand LOWERS the plaque (no plaque keys), the bench takes it and then carries it (moving surface); the receiver's hand DRAWS the card in */
function contract11() { const c = F.supportContract(); c.schema_version = "1.1.0";
  const slab = c.props.find((p) => p.id === "award_standin"); slab.authority = [{ frames: [0, 228], driver: "tova_rig#r", required_supports: ["tova_rig#l"], mode: "OBJECT_DRIVEN" }, { frames: [228, 264], driver: "tova_rig#r", required_supports: ["tova_rig#l"], mode: "ACTOR_DRIVEN", driver_path: path60 },
    { frames: [264, 276], driver: "tova_rig#r", required_supports: ["tova_rig#l", "surface:bench"], mode: "ACTOR_DRIVEN", driver_path: path60 }, { frames: [276, 480], driver: "surface:bench", required_supports: [], mode: "SURFACE_DRIVEN" }];
  const card = c.props.find((p) => p.id === "report_standin"); card.authority = [{ frames: [0, 348], driver: "orsa_rig#a", required_supports: [], mode: "OBJECT_DRIVEN" }, { frames: [348, 356], driver: "orsa_rig#a", required_supports: ["tova_rig#r"], mode: "OBJECT_DRIVEN" }, { frames: [356, 480], driver: "tova_rig#r", required_supports: [], mode: "ACTOR_DRIVEN", driver_path: draw }];
  const drum = c.props.find((p) => p.id === "drum"); for (const a of drum.authority) a.mode = a.driver.startsWith("surface:") ? "SURFACE_DRIVEN" : "OBJECT_DRIVEN";
  return c; }
function plan11({ c = contract11(), bench = true, keepSlabTrack = false, keepCardDraw = false } = {}) { const p = F.basePlan(); if (!keepSlabTrack) delete p.tracks.slab_rig;
  if (!keepCardDraw) p.tracks.card_rig = { root: { x: [[0, 0], [298, 0], [322, -12, "sine.inOut"]] } }; // presented by the giver's track; drawn in by the receiver's HAND after 356
  if (bench) p.tracks.bench_rig = { root: { x: [[0, 0], [300, 0], [360, 40, "sine.inOut"]] } }; // the bench (a registered surface) is moved after the plaque is down
  return F.planWith(doc, { plan: p, support: c }); }
const C = compile(plan11()), QA = verifyPerformance(C);

test("B01-1 ACTOR_DRIVEN: the hand path lowers the plaque with NO plaque keys; plaque follows the hand rigidly; supporter + bench valid; QA passes", () => {
  assert.deepEqual(validate(PS.SCHEMA, contract11()), []); assert.ok(QA.ok, QA.failures.map((x) => `${x.code} ${x.record_id} ${x.frame_range} ${x.human_readable_reason}`).slice(0, 8).join("\n"));
  const p227 = pivot(C, 227, "slab_rig"), p264 = pivot(C, 264, "slab_rig"); assert.ok(Math.abs(p264[1] - p227[1] - 60) < 0.05 && Math.abs(p264[0] - p227[0]) < 0.05, `plaque lowered 60px by the hand (${p227} → ${p264})`);
  for (let f = 228; f < 276; f++) { const st = stateAtFrame(C, f), w = st.contacts.find((s) => s.transform_writer && s.socket === "tova_palm_r"), l = st.contacts.find((s) => s.socket === "tova_palm_l" && s.locked);
    assert.ok(w && w.error_px < 1e-6, `f${f}: driver hand is exactly on the plaque it moves (${w?.error_px})`); assert.ok(l && l.error_px <= l.allowed_error_px, `f${f}: left supporter solved onto the moved plaque`); assert.deepEqual(w.ik_joints, [], "the writer hand is never IK-solved toward the prop it moves"); }
  const bake = [...C.propBakes.entries()].find(([k]) => k === "award_standin@228")[1]; assert.equal(bake.measured_at, 227); assert.equal(bake.from, "VALIDATED_PREVIOUS_FRAME");
  for (const f of [228, 264, 276]) { const a = pivot(C, f - 1, "slab_rig"), b = pivot(C, f, "slab_rig"); assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1]) < 2.0, `no snap at the authority change ${f}`); }
});

test("B01-2 SURFACE_DRIVEN moving surface + BAKED predecessor: the bench takes the exact pose the hand left; moving the bench carries the plaque", () => {
  const a = pivot(C, 275, "slab_rig"), b = pivot(C, 276, "slab_rig"), c = pivot(C, 299, "slab_rig"); assert.ok(Math.hypot(b[0] - a[0], b[1] - a[1]) < 1e-6 && Math.hypot(c[0] - b[0], c[1] - b[1]) < 1e-6, "held exactly where the actor left it");
  const d = pivot(C, 360, "slab_rig"); assert.ok(Math.abs(d[0] - c[0] - 40) < 0.05 && Math.abs(d[1] - c[1]) < 0.05, `the moving surface carries the plaque (+40px: ${c} → ${d})`);
  for (const f of [300, 330, 360, 420]) { const r = stateAtFrame(C, f).prop_support.find((x) => x.prop === "award_standin"); assert.ok(r.ok && r.supporters.find((s) => s.ref === "surface:bench").valid, `f${f}: bench support valid while it moves`); }
});

test("B01-3 hand-over to an ACTOR driver: the receiver's hand path draws the card in (no card keys after 356); no jump at the transfer; giver released", () => {
  const c355 = pivot(C, 355, "card_rig"), c356 = pivot(C, 356, "card_rig"), c368 = pivot(C, 368, "card_rig"), c404 = pivot(C, 404, "card_rig");
  assert.ok(Math.hypot(c356[0] - c355[0], c356[1] - c355[1]) < 1e-3, `transfer preserves the pose (${c355} → ${c356})`); assert.ok(Math.abs(c404[0] - c368[0] + 34) < 0.05 && Math.abs(c404[1] - c368[1] - 10) < 0.05, "the card follows the receiver's hand path");
  const tr = QA.results.find((r) => r.kind === "PropSupportContract" && r.command === "report_standin"); assert.ok(tr.ok, tr.reason);
});

test("B01-4 OBJECT_DRIVEN (reverse case): the prop's track moves the prop and the supporting hand follows; the hand is a supporter, not a transform writer", () => {
  const p = plan11({ keepCardDraw: true }); const cc = contract11(); cc.props.find((x) => x.id === "report_standin").authority[2] = { frames: [356, 480], driver: "tova_rig#r", required_supports: [], mode: "OBJECT_DRIVEN" }; p.performance.prop_support = cc;
  p.tracks.card_rig = { root: { x: [[0, 0], [298, 0], [322, -12, "sine.inOut"], [368, -12], [404, -46, "sine.inOut"]], y: [[0, 0], [368, 0], [404, 10, "sine.inOut"]] } };
  const Co = compile(p), h368 = sockAt(Co, 368, "tova_rig", "tova_palm_r"), h404 = sockAt(Co, 404, "tova_rig", "tova_palm_r");
  assert.ok(Math.abs(h404[0] - h368[0] + 34) < 0.6 && Math.abs(h404[1] - h368[1] - 10) < 0.6, `the hand follows the card's track (${h368} → ${h404})`);
  assert.ok(!stateAtFrame(Co, 380).contacts.some((s) => s.transform_writer), "no hand is reported as transform writer in an OBJECT_DRIVEN span");
});

test("B01-5 negatives: driver consumer deleted, conflicting writers, undeclared mode, mode/driver mismatch, path vs arm track, invalid transfer, free flight with grip", () => {
  // (a) delete the actor-drive consumer, keep all supporter metadata: the plaque no longer follows → the real verifier fails on the driver/supporter
  { const Cx = compile(plan11()); Cx.propBakes.clear(); const st = stateAtFrame(Cx, 250), r = st.prop_support.find((x) => x.prop === "award_standin"); assert.equal(r.ok, false, "driver consumer removed must fail"); assert.ok(st.failures.some((e) => /PROP_DRIVER_INVALID|CONTACT_DRIFT|PROP_SUPPORT_MISSING/.test(e.code)), st.failures.map((e) => e.code)); }
  assert.ok(has(codes(() => compile(plan11({ keepSlabTrack: true }))), "PROP_DRIVER_CONFLICT", "ACTOR_IS_SOLE_WRITER"), "the plaque's own track still moving inside the actor span = two writers");
  { const c = contract11(); delete c.props[0].authority[1].mode; assert.ok(has(codes(() => compile(plan11({ c }))), "PROP_SUPPORT_INVALID", "AUTHORITY_MODE_DECLARED")); }
  { const c = contract11(); c.props[0].authority[0].mode = "SURFACE_DRIVEN"; assert.ok(has(codes(() => compile(plan11({ c }))), "PROP_SUPPORT_INVALID", "MODE_MATCHES_DRIVER")); }
  { const c = contract11(); c.props[0].authority[0].driver_path = path60; assert.ok(has(codes(() => compile(plan11({ c }))), "PROP_SUPPORT_INVALID", "DRIVER_PATH_ONLY_FOR_ACTOR_DRIVEN")); }
  { const p = plan11(); p.tracks.tova_rig = { joints: { elbow_r: [[0, 0], [240, 20], [260, 0]] } }; assert.ok(has(codes(() => compile(p)), "INVALID_TRANSFORM_OWNER", "ONE_WRITER_PER_JOINT"), "directed hand path and an arm track both write the elbow"); }
  { const c = contract11(); c.props[1].authority = [{ frames: [0, 338], driver: "orsa_rig#a", required_supports: [], mode: "OBJECT_DRIVEN" }, { frames: [338, 480], driver: "tova_rig#r", required_supports: [], mode: "ACTOR_DRIVEN", driver_path: draw }];
    assert.ok(has(codes(() => compile(plan11({ c }))), "PROP_TRANSFER_INVALID"), "the receiver takes control at 338, the first frame of its grip: it was not supporting the card at 337"); }
  { const c = contract11(); c.props[2].authority[2] = { frames: [690, 960], driver: "track", required_supports: ["orsa_rig#a"], mode: "FREE_AUTHORED" }; assert.ok(has(codes(() => compile(plan11({ c }))), "PROP_SUPPORT_INVALID", "FREE_FLIGHT_HAS_NO_GRIP")); }
});

test("B01-6 FREE_AUTHORED: after both claws let go the drum flies its directed track with no grip support and no conflict", () => {
  const c = contract11(); c.props[2].authority[2] = { frames: [690, 960], driver: "track", required_supports: [], mode: "FREE_AUTHORED" };
  const p = plan11({ c }); p.tracks.drum_rig = { root: { y: [[480, 0], [560, 0], [660, 45, "sine.inOut"], [740, 45], [800, -30, "sine.out"]], x: [[740, 0], [800, 80, "linear"]] } };
  const Cf = compile(p), a = pivot(Cf, 740, "drum_rig"), b = pivot(Cf, 800, "drum_rig"); assert.ok(Math.abs(b[0] - a[0] - 80) < 0.05 && Math.abs(b[1] - a[1] + 75) < 0.05, "directed flight");
  const r = stateAtFrame(Cf, 770).prop_support.find((x) => x.prop === "drum"); assert.equal(r.driver_kind, "TRACK"); assert.ok(r.ok, JSON.stringify(r.failures.map((x) => x.code)));
});

test("B01-7 real Chrome owner pixels: the plaque's own pixels move with the hand path; deleting the actor-drive consumer leaves them behind", async () => {
  const browser = await launch(), out = isolatedWork("p08_b01_render");
  try {
    const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const match = (png, c, tol = 4) => { let x = 0, y = 0, n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) { const k = i / 4; x += k % png.width; y += Math.floor(k / png.width); n++; } return { n, c: [x / n, y / n] }; };
    const A = await shoot(C, [227, 264], "b01_pos"), s0 = match(A[227], F.COL.slab), s1 = match(A[264], F.COL.slab), g0 = match(A[227], F.COL.tovaGripR), g1 = match(A[264], F.COL.tovaGripR);
    const dy = s1.c[1] - s0.c[1], dh = g1.c[1] - g0.c[1]; assert.ok(s0.n > 500 && dy > 40, `plaque pixels moved down with the hand (Δy ${dy.toFixed(1)} screen px)`); assert.ok(Math.abs(dy - dh) < 2, `plaque and closed hand move together on screen (plaque ${dy.toFixed(2)}, hand ${dh.toFixed(2)})`);
    const Cx = compile(plan11()); Cx.propBakes.clear(); const B = await shoot(Cx, [264], "b01_neg"), sb = match(B[264], F.COL.slab);
    const nb = sb.c[1] - s0.c[1], hb = match(B[264], F.COL.tovaGripR).c[1] - g0.c[1]; assert.ok(Math.abs(nb) < 10 && hb > 40, `consumer deleted: the hand still lowers (Δy ${hb.toFixed(1)}) but the plaque pixels stay behind (Δy ${nb.toFixed(1)}; with the consumer ${dy.toFixed(1)})`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, slab_dy_screen: dy, hand_dy_screen: dh, negative_slab_dy: sb.c[1] - s0.c[1] }, null, 1));
  } finally { await browser.close(); }
});
