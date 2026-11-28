// Pose-dependent limb geometry in the RUNTIME (temporal.mjs contact IK): plan.ik_branches selects the approved elbow branch for a window, and a
// joint offset (a bound drawing whose child pivot sits elsewhere, e.g. a foreshortened forearm) changes the bone length the IK solves with.
// The contact still lands; nothing else in the solve changes. DIAGNOSTIC fixture (tests/tbo/support_fixture.mjs).
//   node --test tests/tbo/ik_branch_offset.test.mjs
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const F = await import("./support_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { rt } = await F.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }), base = F.planWith(doc);
const C0 = compile(base), at = (C, f) => stateAtFrame(C, f);
// a frame where a hand contact is IK-solved (locked, not the prop's transform writer)
const rigOfChain = (ch) => doc.rigs.find((r) => (r.constraints || []).some((k) => k.type === "TWO_BONE_IK" && k.chain.join() === ch.join()));
const pick = (() => { for (let f = 20; f < 260; f += 7) { const s = at(C0, f), c = s.contacts.find((x) => x.locked && x.ik_joints && /palm_l/.test(x.socket)); if (c) return { f, c, rig: rigOfChain(c.ik_joints).id }; } return null; })(); // the supporting (non-writer) hand: its arm is IK-solved
const elbowOf = (S, rig, je) => { const M = S.matrices[rig][je], r = doc.rigs.find((x) => x.id === rig).joints.find((j) => j.id === je).rest_xy; return [M[0] * r[0] + M[2] * r[1] + M[4], M[1] * r[0] + M[3] * r[1] + M[5]]; };
test("IKB-1 plan.ik_branches flips the elbow branch inside its window only; the hand still reaches its contact", () => {
  assert.ok(pick, "fixture has an IK-solved locked contact"); const { f, c, rig } = pick, R = doc.rigs.find((r) => r.id === rig), k = R.constraints.find((x) => x.type === "TWO_BONE_IK" && x.chain.join() === c.ik_joints.join());
  const plan = { ...base, ik_branches: [{ rig, chain: k.chain, frames: [f, f + 1], bend_sign: -(k.bend_sign ?? 1), evidence: "IKB-1 test" }] }, C1 = compile(plan);
  const e0 = elbowOf(at(C0, f), rig, k.chain[1]), e1 = elbowOf(at(C1, f), rig, k.chain[1]); assert.ok(Math.hypot(e0[0] - e1[0], e0[1] - e1[1]) > 2, `elbow moved to the other branch (${e0} vs ${e1})`);
  const s1 = at(C1, f).contacts.find((x) => x.contact_id === c.contact_id); assert.ok(s1, "contact solved under the overridden branch");
  const out = elbowOf(at(C1, f + 1), rig, k.chain[1]), base1 = elbowOf(at(C0, f + 1), rig, k.chain[1]); assert.ok(Math.hypot(out[0] - base1[0], out[1] - base1[1]) < 1e-6, "outside the window the approved rig branch is used");
  assert.throws(() => compile({ ...base, ik_branches: [{ rig, chain: k.chain, frames: [f, f + 1], bend_sign: -1 }] }), /evidence/, "an override without solve evidence is refused");
});
test("IKB-2 a wrist joint offset (shorter drawn forearm) changes the solved elbow, and the contact still lands", () => {
  const { f, c, rig } = pick, R = doc.rigs.find((r) => r.id === rig), k = R.constraints.find((x) => x.type === "TWO_BONE_IK" && x.chain.join() === c.ik_joints.join());
  const [, je, jw] = k.chain, re = R.joints.find((j) => j.id === je).rest_xy, rw = R.joints.find((j) => j.id === jw).rest_xy, shrink = [(re[0] - rw[0]) * 0.2, (re[1] - rw[1]) * 0.2]; // wrist pivot 20% closer to the elbow
  const tracks = structuredClone(base.tracks || {}); ((tracks[rig] ||= {}).joint_offsets ||= {})[jw] = { x: [[0, shrink[0]]], y: [[0, shrink[1]]] };
  const C1 = compile({ ...base, tracks }), s0 = at(C0, f), s1 = at(C1, f), e0 = elbowOf(s0, rig, je), e1 = elbowOf(s1, rig, je);
  assert.ok(Math.hypot(e0[0] - e1[0], e0[1] - e1[1]) > 0.5, "the elbow re-solves for the shorter forearm");
  const t1 = s1.contacts.find((x) => x.contact_id === c.contact_id); assert.ok(t1, "contact still solved");
  assert.ok(!s1.failures?.some((x) => /UNREACHABLE_IK|CONTACT_DRIFT/.test(x.code) && x.record_id === c.action), "no reach failure for this contact");
});
