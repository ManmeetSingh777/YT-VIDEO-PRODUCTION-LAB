// P08 A02 — global semantic contact state independent of shots. Real chain: PerformanceCommand + CONTACT_CONTINUITY + PROP_SUPPORT →
// compilePerformance → compileMotionTracks → stateAtFrame → performance QA (contact continuity + prop support). DIAGNOSTIC fixture.
import test from "node:test"; import assert from "node:assert/strict"; import crypto from "node:crypto";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const S = await import("./scene_a02_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), CCm = await import("../../engine/art_bridge/contact_continuity.mjs"), { validate } = await import("../../engine/art_bridge/jsonschema.mjs");
const { rt } = await S.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, rec: x.record_id })); } };
const has = (l, code, inv) => l.some((x) => x.code === code && (!inv || x.inv === inv));
// measured: the right palm on the held plaque at f9 (object-driven start) is where the directed hand path begins
const C0 = compile(S.planWith(doc, { sup: (() => { const s = S.support([0, 0]); s.props[0].authority = [{ frames: [0, 700], driver: "tova_rig#r", required_supports: [], mode: "OBJECT_DRIVEN" }, { frames: [700, 960], driver: "track", required_supports: [], mode: "FREE_AUTHORED" }]; s.props[0].surfaces = []; return s; })() }));
const H9 = C0.socketWorld("tova_rig", stateAtFrame(C0, 9).matrices.tova_rig, "tova_palm_r");
const plan = (o = {}) => S.planWith(doc, { sup: S.support(H9), ...o });
const C = compile(plan()), QA = verifyPerformance(C), cc = (id) => QA.results.find((r) => r.kind === "ContactContinuity" && r.command === id);
const stHash = (f) => { const s = stateAtFrame(C, f); return crypto.createHash("sha256").update(JSON.stringify({ m: s.matrices, c: s.contacts.map(({ contact_id, achieved, error_px, locked }) => ({ contact_id, achieved, error_px, locked })), a: Object.fromEntries(Object.entries(s.artStates).map(([k, v]) => [k, v.channels])), p: s.prop_support })).digest("hex"); };

test("A02-1 one plaque held by both hands across two cuts (offscreen in the middle shot), released in the third shot by another action; QA passes", () => {
  assert.deepEqual(validate(CCm.SCHEMA, S.continuity()), []);
  assert.ok(QA.ok, QA.failures.map((x) => `${x.code} ${x.record_id} ${x.human_readable_reason}`).slice(0, 6).join("\n"));
  for (const id of ["c_tova_l_plaque", "c_tova_r_plaque", "c_orsa_card"]) { const r = cc(id); assert.ok(r?.ok, `${id}: ${r?.reason}`); assert.deepEqual(r.measurement.cuts_crossed, [300, 600], `${id} crosses both cuts`); }
  assert.ok(cc("c_tova_r_plaque").measurement.visibility_frames.OFFSCREEN === 300 && cc("c_tova_r_plaque").measurement.visibility_frames.VISIBLE > 0, "offscreen shot verified against the actual camera");
  const k = C.contacts.find((x) => x.identity.contact_id === "c_tova_r_plaque"); assert.deepEqual(k.identity.source_action_ids, [S.ACTIONS.a, S.ACTIONS.c]); assert.equal(k.c.end_frame, 700, "ends at its release in shot C, not at the action end");
  const a = stateAtFrame(C, 450).prop_support.find((r) => r.prop === "plaque"), p299 = stateAtFrame(C, 299).prop_support[0].root_xy, p450 = a.root_xy;
  assert.ok(a.ok && Math.abs(p450[0] - p299[0] - 40 * (1 - Math.cos(Math.PI * 0.75)) / 2) < 1e-6, `the offscreen carry still moves the plaque (${p299} → ${p450})`);
});

test("A02-2 deterministic random seek: shuffled frame order around both cuts gives byte-identical evaluated state", () => {
  const frames = [...Array(24)].map((_, i) => [292 + i, 592 + i]).flat(), seq = Object.fromEntries(frames.map((f) => [f, stHash(f)]));
  const shuffled = [...frames].sort((a, b) => ((a * 7919) % 97) - ((b * 7919) % 97)); for (const f of shuffled) assert.equal(stHash(f), seq[f], `f${f}`);
});

test("A02-3 the same socket holds two different props in succession: distinct immutable ids, each consumer reads its own target", () => {
  const ids = C.contacts.filter((x) => x.c.source_socket === "tova_palm_r").map((x) => [x.identity.contact_id, x.identity.target_owner, x.c.start_frame, x.c.end_frame]);
  assert.equal(ids.length, 2); assert.notEqual(ids[0][0], ids[1][0]); assert.deepEqual(ids.map((x) => x[1]).sort(), ["card_rig", "slab_rig"]);
  const s = stateAtFrame(C, 800), r = s.contacts.find((x) => x.socket === "tova_palm_r" && x.locked); assert.equal(r.target_rig, "card_rig"); assert.equal(r.contact_id, ids.find((x) => x[1] === "card_rig")[0]);
  assert.ok(QA.results.find((x) => x.kind === "PropSupportContract" && x.command === "card").ok);
});

test("A02-4 negatives: continuity removed, shot unmapped, wrong mapping, duplicate id, declared visibility contradicted by the camera, undeclared contact across a cut", () => {
  assert.ok(has(codes(() => compile(plan({ cc: null }))), "CONTACT_CONFLICT", "GRIP_RELEASE_SAME_ACTION"), "no continuity declaration → the cross-action hold is refused, not silently clipped");
  { const c = S.continuity(); delete c.contacts[1].shot_visibility.p08a_s_b; assert.ok(has(codes(() => compile(plan({ cc: c }))), "CONTACT_CONTINUITY_UNMAPPED", "EVERY_SHOT_MAPPED")); }
  { const c = S.continuity(); c.contacts[1].shot_visibility.p08a_ghost = { visibility: "VISIBLE" }; assert.ok(has(codes(() => compile(plan({ cc: c }))), "CONTACT_CONTINUITY_UNMAPPED", "MAPPING_NAMES_OVERLAPPED_SHOTS")); }
  { const c = S.continuity(); c.contacts[1].contact_id = "c_tova_l_plaque"; assert.ok(has(codes(() => compile(plan({ cc: c }))), "DUPLICATE_ELEMENT_ID", "CONTACT_ID_UNIQUE")); }
  { const c = S.continuity(); c.contacts[1].shot_visibility.p08a_s_b = { visibility: "VISIBLE" }; const Q = verifyPerformance(compile(plan({ cc: c }))); assert.ok(Q.failures.some((x) => x.code === "CONTACT_VISIBILITY_MISMATCH" && x.record_id === "c_tova_r_plaque"), "VISIBLE declared where the camera does not see the hand"); }
  { const p = plan(); const Pc = (async () => 0)(); void Pc; const d = clone(doc); d.actions[0].contact_events.push({ source_socket: "orsa_claw_b", target_world_xy: [860, 600], contact_type: "SUPPORT", start_frame: 250, end_frame: 350, allowed_error_px: 1.5 });
    const e = codes(() => compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false })); assert.ok(has(e, "CONTACT_CONTINUITY_UNMAPPED", "NO_SILENT_CUT_TRUNCATION"), JSON.stringify(e.slice(0, 3))); }
  { const c = S.continuity(); c.contacts[1].release_command = "o_release_card"; assert.ok(has(codes(() => compile(plan({ cc: c }))), "CONTACT_CONFLICT", "CONTINUITY_RELEASE_MATCHES"), "a continuity pointing at another hand's release"); }
});

test("A02-5 no reset at the cuts: the hand stays closed, locked and on the plaque on both sides of each cut; reusing the wrong id is caught by every consumer", () => {
  for (const f of [299, 300, 599, 600]) { const s = stateAtFrame(C, f); for (const id of ["c_tova_l_plaque", "c_tova_r_plaque"]) { const r = s.contacts.find((x) => x.contact_id === id); assert.ok(r?.locked && r.error_px <= r.allowed_error_px, `f${f} ${id}`); }
    assert.equal(s.artStates.tova_rig.channels.hand_r, "grip"); assert.equal(s.artStates.tova_rig.channels.hand_l, "grip"); }
  // tamper: the solved contact claims the card id while it holds the plaque → the continuity verifier (consumer by id) fails
  const Cx = compile(plan()), q = verifyPerformance({ ...Cx, contacts: Cx.contacts.map((k) => k.identity.contact_id === "c_tova_r_plaque" ? { ...k, identity: { ...k.identity, contact_id: "c_orsa_card" } } : k) });
  assert.ok(q.failures.some((x) => x.record_id === "c_orsa_card" || x.record_id === "c_tova_r_plaque"), "wrong id reuse is not silently accepted");
});
