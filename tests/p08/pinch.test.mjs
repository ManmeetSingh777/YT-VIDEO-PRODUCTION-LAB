// P08 B03 — genuine PINCH on two unlike objects through the real chain (manifest contact PINCH + approved PINCH_CONTRACT → compileMotionTracks
// (IK + solved orientation) → stateAtFrame → verifyPinch → Chrome owner pixels with near/far paint order). DIAGNOSTIC character fixture.
//   FACE_ON: kade pinches the page edge (thumb layer in front of the page, finger layer behind it)
//   EDGE_ON: pim pinches the coin rim (thumb and finger patches on opposite faces, separated by thickness + 2·clearance)
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyPinch } = await import("../../engine/film/performance_qa.mjs"), { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc0 = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const C0 = compileMotionTracks(doc0.actions, doc0.shots, { doc: doc0, plan: CF.basePlan(), requireApproval: false }), rest = (rid, s) => C0.socketWorld(rid, stateAtFrame(C0, 0).matrices[rid], s);
// stage the objects where each hand can reach them (measured from the rest pose; never typed)
const PK = rest("kade_rig", "kade_pinch_r"), PP = rest("pim_rig", "pim_pinch_r"), SHEET_EDGE = [PK[0] + 18, PK[1] - 26], RIM = [PP[0] + 14, PP[1] - 18];
const contract = (o = {}) => [{ schema_version: "1.0.0", id: "pinch_page", source_socket: "kade_pinch_r", start_frame: 100, target_socket: "sheet_edge_r_front", view: "FACE_ON", thumb_socket: "kade_thumb_tip_r", finger_socket: "kade_finger_tip_r", thickness_px: 0, clearance_px: 0, tolerance_px: 3, near_slot: "kade_hand_r_thumb", far_slot: "kade_hand_r_open", closure: { channel: "hand_r", state: "pinch" }, ...(o.page || {}) },
  { schema_version: "1.0.0", id: "pinch_coin", source_socket: "pim_pinch_r", start_frame: 120, target_socket: "token_rim_face", view: "EDGE_ON", thumb_socket: "pim_thumb_tip_r", finger_socket: "pim_finger_tip_r", thickness_px: 16, clearance_px: 2, tolerance_px: 1.5, near_slot: "pim_hand_r_thumb", far_slot: "pim_hand_r_open", closure: { channel: "hand_r", state: "pinch" }, ...(o.coin || {}) }];
function build({ pinchState = "pinch", coinAngle = 90, contracts = contract() } = {}) {
  const doc = clone(doc0), A = (id) => doc.actions.find((a) => a.id === id);
  A(CF.ACT.kade).contact_events.push({ source_socket: "kade_pinch_r", target_socket: "sheet_edge_r_front", contact_type: "PINCH", start_frame: 100, end_frame: 300, allowed_error_px: 1.5, near_far_relation: "thumb in front of the page, fingers behind" });
  A(CF.ACT.pim).contact_events.push({ source_socket: "pim_pinch_r", target_socket: "token_rim_face", contact_type: "PINCH", start_frame: 120, end_frame: 320, allowed_error_px: 1.5, target_angle_deg: coinAngle, near_far_relation: "edge-on: thumb above, finger below the rim" });
  A(CF.ACT.kade).state_events.push({ frame: 100, channel: "hand_r", state: pinchState, rig: "kade_rig" }, { frame: 300, channel: "hand_r", state: "open", rig: "kade_rig" });
  A(CF.ACT.pim).state_events.push({ frame: 120, channel: "hand_r", state: pinchState, rig: "pim_rig" }, { frame: 320, channel: "hand_r", state: "open", rig: "pim_rig" });
  const plan = CF.basePlan(); plan.placements.sheet_rig = { x: SHEET_EDGE[0] - 58, y: SHEET_EDGE[1], scale: 1 }; plan.placements.token_rig = { x: RIM[0], y: RIM[1] + 18, rot: -90, scale: 1 }; // the coin is presented upright: its rim face normal lies along the hand patch axis
  plan.reaches = { [`${CF.ACT.kade}:kade_pinch_r@100`]: { approach: [60, 100] }, [`${CF.ACT.pim}:pim_pinch_r@120`]: { approach: [80, 120] } }; plan.pinch_contracts = contracts;
  return { doc, plan, C: () => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }) };
}
const kOf = (C, sock) => C.contacts.find((x) => x.c.source_socket === sock), vp = (C, sock) => verifyPinch(C, kOf(C, sock), C.pinch.get(kOf(C, sock).identity.contact_id));
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.failed_invariant ?? x.details?.failed_invariant })); } };
const B = build(), C = B.C();
test("B03-1 PINCH on two unlike objects: page (FACE_ON, near/far layers) and coin (EDGE_ON, opposed faces at thickness + clearance), every locked frame", () => {
  const page = vp(C, "kade_pinch_r"), coin = vp(C, "pim_pinch_r"); assert.ok(page.ok, page.reason); assert.ok(coin.ok, coin.reason); assert.ok(page.frames_checked >= 199 && coin.frames_checked >= 199);
  const m = coin.measurement.last; assert.ok(Math.sign(m.dt) !== Math.sign(m.df) && Math.abs(Math.abs(m.dt - m.df) - 20) < 1.5, `thumb and finger straddle the rim (${m.dt.toFixed(2)}, ${m.df.toFixed(2)})`);
  const po = C.plan.paint_order; assert.ok(po.some((x) => x.above === "kade_hand_r_thumb" && x.below === "sheet_rig") && po.some((x) => x.above === "sheet_rig" && x.below === "kade_hand_r_open"), "near/far layering emitted into the scene graph's paint order");
});
test("B03-2 negatives: no contract (never dropped / never a fist), missing closure art, missing layer, same-side fingers, hovering fingers, fingers through the coin, a fist drawing", () => {
  assert.ok(codes(() => build({ contracts: [] }).C()).some((x) => x.code === "PINCH_CONTRACT_REQUIRED" && x.inv === "PINCH_HAS_CONTRACT"));
  assert.ok(codes(() => build({ contracts: contract({ page: { closure: { channel: "hand_r", state: "pinch_missing" } } }) }).C()).some((x) => x.inv === "PINCH_CLOSURE_DRAWN"));
  assert.ok(codes(() => build({ contracts: contract({ page: { near_slot: "kade_hand_r_nothumb" } }) }).C()).some((x) => x.inv === "PINCH_LAYERS_PAINTED"));
  assert.match(vp(build({ contracts: contract({ coin: { finger_socket: "pim_thumb_tip_r" } }) }).C(), "pim_pinch_r").reason || "", /SAME side/, "both patches on the same face of the rim");
  assert.match(vp(build({ contracts: contract({ coin: { thickness_px: 30 } }) }).C(), "pim_pinch_r").reason || "", /intersect/, "a thicker object than the patch gap: fingers would cut into it");
  assert.match(vp(build({ contracts: contract({ coin: { thickness_px: 8 } }) }).C(), "pim_pinch_r").reason || "", /fingers hover/, "a thinner object than the patch gap: fingers hover off its faces");
  assert.match(vp(build({ pinchState: "grip" }).C(), "kade_pinch_r").reason || "", /not the approved pinch/, "a fist (grip drawing) is not a pinch");
});
test("B03-3 real Chrome owner pixels (FACE_ON): the thumb layer paints over the page, the finger layer is hidden behind it", async () => {
  const browser = await launch(), out = isolatedWork("p08_pinch_render");
  try { const shoot = async (Cx, name) => { const scene = composeShot(B.doc.shots[0], { ...reg, doc: B.doc }, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [200, 201], registry: { ...reg, doc: B.doc } }), cap = await capture(comp, FILM, [200], path.join(out, name, "frames"), { id: name, browser }); return readPNG(cap.files[0]); };
    const measure = (png) => { const mask = (c, tol = 3) => { const s = new Set(); for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) s.add(i / 4); return s; };
      const page = mask(CF.COL["sheet:page"]), thumb = mask(CF.COL["kade:hand_r_thumb:pinch"]), far = mask(CF.COL["kade:hand_r:pinch_far"]); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (const k of page) { const x = k % png.width, y = Math.floor(k / png.width); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const inPage = (set) => [...set].filter((k) => { const x = k % png.width, y = Math.floor(k / png.width); return x > x0 + 1 && x < x1 - 1 && y > y0 + 1 && y < y1 - 1; }).length; return { page_px: page.size, thumb_inside_page: inPage(thumb), far_inside_page: inPage(far), thumb_px: thumb.size, far_px: far.size }; };
    // negatives on the SAME frame: the far layer ordered ABOVE the page, and the near-thumb order removed (the default order paints the page over the hand)
    const po = C.plan.paint_order, ok = measure(await shoot(C, "pin_ok"));
    const neg = measure(await shoot({ ...C, plan: { ...C.plan, paint_order: [...po.filter((x) => !(x.above === "sheet_rig" && x.below === "kade_hand_r_open")), { above: "kade_hand_r_open", below: "sheet_rig" }] } }, "pin_far_up"));
    const negNear = measure(await shoot({ ...C, plan: { ...C.plan, paint_order: po.filter((x) => !(x.above === "kade_hand_r_thumb")) } }, "pin_near_off"));
    assert.equal(negNear.thumb_inside_page, 0, `without the near order the thumb is hidden by the page (${JSON.stringify(negNear)})`);
    assert.ok(ok.page_px > 1000 && ok.thumb_inside_page > 15, `the near thumb layer paints over the page (${JSON.stringify(ok)})`);
    assert.equal(ok.far_inside_page, 0, `the far finger layer is hidden behind the page (${JSON.stringify(ok)})`);
    assert.ok(neg.far_inside_page > 15, `without the far-below-page order the finger layer shows through the page (${JSON.stringify(neg)}): the layering is the declared order, not geometry`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, correct: ok, far_order_removed: neg }, null, 1));
  } finally { await browser.close(); }
});
