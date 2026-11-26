// P08 B02 — contact = position AND orientation, SOLVED by the IK (the wrist takes the world angle that puts the reviewed socket basis on the target
// basis; blended over the approach), refused by the approved joint limits when impossible; production holding contacts must declare both bases;
// one socket holds one object at a time. Real chain on the P07 DIAGNOSTIC fixture.
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const F = await import("../tbo/support_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), { angleOf, wrap180 } = await import("../../engine/art_bridge/math2d.mjs");
const { rt } = await F.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan, o = {}) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false, ...o });
const withAngle = (deg) => { const c = F.supportContract(); c.props.find((p) => p.id === "report_standin").hands[1].grip_angle_deg = deg; return F.planWith(doc, { support: c }); };
const palmWorld = (Cx, f) => { const s = stateAtFrame(Cx, f); return angleOf(s.matrices.tova_rig.wrist_r); }, cardAng = (Cx, f) => angleOf(stateAtFrame(Cx, f).matrices.card_rig.card);
const lockedFrames = [360, 380, 400, 440, 470], PCmod = await import("../../engine/art_bridge/performance_commands.mjs");
test("B02-1 the palm orientation is SOLVED on every locked frame (residual ~0), for a basis the FK pose would not have had", () => {
  const C30 = compile(withAngle(30)), C0 = compile(withAngle(0)), Q = verifyPerformance(C30);
  assert.ok(Q.results.find((r) => r.command === "report_standin").ok, Q.failures.map((x) => x.human_readable_reason).slice(0, 3).join("; "));
  for (const f of lockedFrames) { const res = stateAtFrame(C30, f).contacts.find((x) => x.socket === "tova_palm_r" && x.locked && x.target_rig === "card_rig"); assert.ok(res && res.angle_residual_deg < 1e-6, `f${f} residual ${res?.angle_residual_deg}`);
    assert.ok(Math.abs(wrap180(palmWorld(C30, f) - cardAng(C30, f) - 30)) < 1e-6, `f${f}: palm basis on the card basis + 30°`); assert.ok(Math.abs(wrap180(palmWorld(C30, f) - palmWorld(C0, f))) > 25, `f${f}: a different directed basis gives a different wrist (not the FK angle)`); }
});
test("B02-2 the approach blends the orientation in: residual shrinks over the reach and is zero when the grip locks", () => {
  const C = compile(withAngle(30)); const res = [300, 315, 330, 337].map((f) => { const s = stateAtFrame(C, f), w = angleOf(s.matrices.tova_rig.wrist_r), t = cardAng(C, f) + 30; return Math.abs(wrap180(w - t)); });
  for (let i = 1; i < res.length; i++) assert.ok(res[i] <= res[i - 1] + 1e-6, `residual decreases over the approach (${res.map((x) => x.toFixed(2))})`);
});
test("B02-3 negatives: reversed palm refused by the solver/limits, production contact without a basis, one socket holding two objects at once", () => {
  const fl = stateAtFrame(compile(withAngle(180)), 400).failures.map((x) => x.code); assert.ok(fl.some((c) => ["UNREACHABLE_IK", "JOINT_LIMIT_EXCEEDED", "CONTACT_ORIENTATION_UNSATISFIABLE"].includes(c)), `reversed palm: ${fl}`);
  let e = []; try { compile(F.planWith(doc), { runType: "PRODUCTION" }); } catch (x) { e = x.errors || [x]; } assert.ok(e.some((x) => x.code === "CONTACT_BASIS_REQUIRED"), "the plaque grips declare no palm basis: refused for production");
  const pre = PCmod.compilePerformance(doc, F.planWith(doc)), dd = clone(pre.doc); dd.actions[0].contact_events.push({ source_socket: "tova_palm_l", target_world_xy: [500, 500], contact_type: "FOLLOW", start_frame: 100, end_frame: 140, allowed_error_px: 1.5 });
  let e2 = []; try { compileMotionTracks(dd.actions, dd.shots, { doc: dd, plan: pre.plan, requireApproval: false }); } catch (x) { e2 = x.errors || [x]; }
  assert.ok(e2.some((x) => x.failed_invariant === "ONE_OBJECT_PER_SOCKET"), `left palm on the plaque and on a world point at once: ${e2.map((x) => x.code)}`);
});
