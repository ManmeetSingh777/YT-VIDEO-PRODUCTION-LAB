// P08 A01 — film-level action/frame obligation ledger on the REAL compiled plan (compileMotionTracks → stateAtFrame), the independent per-frame QA
// (verifyComposition) and REAL isolated Chrome captures of each owner (chrome_frames attribution → ownerAttributionGate). Negatives: a deleted
// producer fails even while the camera moves; a no-op producer with correct-looking metadata fails on its own pixels; a partial interval, a producer
// on an owner the action does not direct, a filtered (dropped) action and an unbound primitive are each named. DIAGNOSTIC two-biped fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyComposition } = await import("../../engine/film/composition_qa.mjs"), { obligationLedger } = await import("../../engine/film/obligation_ledger.mjs"), { ownerAttributionGate } = await import("../../engine/film/coverage_gate.mjs");
const { createChromeFrameSession } = await import("../../engine/film/chrome_frames.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), W = isolatedWork("p08_a01"), FILM = path.join(W, "film"); fs.cpSync(rt.film, FILM, { recursive: true, filter: (s) => !/[\\/](render|production|qa)([\\/]|$)/.test(s) });
const reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, E = (kind) => ({ kind });
const C0 = compileMotionTracks(doc.actions, doc.shots, { doc, plan: CF.basePlan(), requireApproval: false }), sole = (sid, s) => C0.socketWorld(`${sid}_rig`, stateAtFrame(C0, 0).matrices[`${sid}_rig`], `${sid}_sole_${s}`);
const KADE = CF.ACT.kade, PIM = CF.ACT.pim, PROPS = CF.ACT.props, HOLDS = { [PROPS]: [[0, 600]] };
const prims = ({ pimRecoil = -14, dropPim = false, pimPlantTo = 600, extra = [] } = {}) => [
  { id: "kade_plant_l", kind: "PLANT", owner: "kade_rig.kade_sole_l", frames: [0, 600], inputs: { target: { world_xy: sole("kade", "l") } }, expected_effect: E("SOCKET_FIXED") },
  { id: "kade_raise", kind: "JOINT_ROTATE", owner: "kade_rig.shoulder_r", frames: [100, 230], inputs: { keys: [[0, 0], [20, -150, "power2.out"], [100, -150], [129, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") },
  ...(dropPim ? [] : [{ id: "pim_plant_l", kind: "PLANT", owner: "pim_rig.pim_sole_l", frames: [0, pimPlantTo], inputs: { target: { world_xy: sole("pim", "l") } }, expected_effect: E("SOCKET_FIXED") },
    { id: "pim_recoil", kind: "JOINT_ROTATE", owner: "pim_rig.chest", frames: [120, 201], inputs: { keys: [[0, 0], [8, pimRecoil, "power2.out"], [40, pimRecoil], [80, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") }]),
  { id: "cam_push", kind: "CAMERA_MOVE", owner: "cam_1", frames: [0, 600], inputs: { zoom: [[0, 1.0], [599, 1.12, "sine.inOut"]] }, expected_effect: E("CAMERA_PATH") }, ...extra];
const planOf = (o) => ({ ...CF.basePlan(), composition: { schema_version: "1.0.0", primitives: prims(o) } });
const SAMPLE = [0, 60, 110, 130, 150, 170, 190, 210, 240, 300, 420, 540, 599];
/** real isolated owner captures at the sampled frames → ownerAttributionGate (the ledger's rendered-effect evidence) */
async function rendered(plan, tag) { const pf = path.join(FILM, "handoff", `MOTION_PLAN_A01_${tag}.json`); fs.writeFileSync(pf, JSON.stringify(plan));
  const s = await createChromeFrameSession({ film: FILM, planFile: pf, runType: "DIAGNOSTIC", workDir: path.join(W, `att_${tag}`), attribution: true }), owners = {};
  try { for (const f of SAMPLE) { const r = await s.renderFrame(f); for (const [u, v] of Object.entries(r.owners || {})) { const o = (owners[u] ||= { px: Array(600).fill(null), state: Array(600).fill(null), seen: Array(600).fill(null), ref_swap: Array(600).fill(null), ref_rigid: Array(600).fill(null) }); for (const k of Object.keys(o)) if (v[k] !== undefined) o[k][f] = v[k]; } } } finally { await s.close(); }
  return ownerAttributionGate({ owners, doc, requireUnits: true }); }
const ledger = (plan, attribution) => { const C = compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }); return obligationLedger({ C, composition: verifyComposition(C), attribution, holds: HOLDS }); };
const codes = (L, aid) => L.failures.filter((f) => !aid || f.record_id === aid || String(f.record_id).startsWith(aid)).map((f) => f.code);

test("A01 ledger: every directed action is covered on every frame by producers bound to it, executed on every frame and visible in the owner's own pixels", { timeout: 1800000 }, async () => {
  const plan = planOf(), L = ledger(plan, await rendered(plan, "ok"));
  assert.deepEqual(L.failures, [], JSON.stringify(L.failures.slice(0, 6))); assert.equal(L.ok, true); assert.equal(L.coverage.uncovered.length, 0); assert.equal(L.coverage.required_frames, 600, "union of directed frames"); assert.equal(L.rows.reduce((t, r) => t + r.per_owner.length, 0), 5);
  assert.equal(L.rows.find((r) => r.action === PROPS).status, "DIRECTED_HOLD"); assert.ok(L.rows.find((r) => r.action === PIM).producers.some((p) => p.id === "pim_recoil"));
  // the same plan without rendered evidence is never ok
  assert.equal(obligationLedger({ C: compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }), composition: null, attribution: null, holds: HOLDS }).ok, false);
});
test("A01 negatives: deleted producer under a moving camera; no-op producer with correct metadata; partial interval; wrong owner; dropped action; unbound primitive", { timeout: 1800000 }, async () => {
  // 1. delete pim's producers: the camera still pushes, the props still hold — pim's obligation fails
  const del = planOf({ dropPim: true }); assert.ok(codes(ledger(del, await rendered(del, "del")), PIM).includes("OBLIGATION_NO_PRODUCER"));
  // 2. no-op producer: pim_recoil keeps its id, kind and expected effect but rotates 0° — QA agrees with its own keys, the pixels do not move
  const noop = planOf({ pimRecoil: 0 }), Ln = ledger(noop, await rendered(noop, "noop")); assert.ok(Ln.failures.some((f) => f.code === "OBLIGATION_EFFECT_NOT_RENDERED" && f.record_id === PIM && /pim_recoil/.test(f.reason)), JSON.stringify(Ln.failures));
  // 3. partial: pim's plant ends at 400 — frames [400,600) of the directed action have no producer and are not a directed hold
  const part = ledger(planOf({ pimPlantTo: 400 }), null), pf = part.failures.find((f) => f.code === "OBLIGATION_PARTIAL" && f.record_id === PIM); assert.deepEqual(pf?.frame_ranges, [[400, 600]]);
  // 4. wrong owner: a primitive bound (declared) to kade's action that writes pim — refused at compile (declared action does not own pim)
  const C = compileMotionTracks(doc.actions, doc.shots, { doc, plan: planOf(), requireApproval: false }); const bad = JSON.parse(JSON.stringify(C.composition)); bad.primitives.find((p) => p.id === "pim_recoil").action = KADE;
  assert.ok(codes(obligationLedger({ C: { ...C, composition: bad }, composition: verifyComposition(C), holds: HOLDS }), KADE).includes("OBLIGATION_WRONG_OWNER"));
  assert.throws(() => compileMotionTracks(doc.actions, doc.shots, { doc, plan: planOf({ extra: [{ id: "x_bad", action: KADE, kind: "JOINT_ROTATE", owner: "pim_rig.chest", frames: [300, 320], inputs: { keys: [[0, 0], [19, 5]] }, expected_effect: E("JOINT_TRAJECTORY") }] }), requireApproval: false }), (e) => (e.errors || [e]).some((x) => x.details?.failed_invariant === "PRIMITIVE_ACTION_BOUND" || /PRIMITIVE_ACTION_BOUND/.test(JSON.stringify(x))));
  // 5. a directed source action the compiled film dropped (filtered / renamed)
  assert.ok(codes(obligationLedger({ C, composition: verifyComposition(C), holds: HOLDS, sources: [...doc.actions.map((a) => ({ id: a.id, frames: a.frame_range, owners: a.actors.map((x) => x.rig_id) })), { id: "E01-S001-A27", frames: [404, 600], owners: ["kade_rig"] }] }), "E01-S001-A27").includes("OBLIGATION_NOT_COMPILED"));
  // 6. an unbound non-camera primitive and an execution failure (QA result mutated to a failing measurement) are named
  const unb = JSON.parse(JSON.stringify(C.composition)); unb.primitives.find((p) => p.id === "kade_raise").action = null; assert.ok(codes(obligationLedger({ C: { ...C, composition: unb }, composition: verifyComposition(C), holds: HOLDS })).includes("OBLIGATION_UNBOUND_PRODUCER"));
  const q = verifyComposition(C); q.results.find((r) => r.primitive === "kade_raise").frames_checked = 3; assert.ok(codes(obligationLedger({ C, composition: q, holds: HOLDS }), KADE).includes("OBLIGATION_NOT_EVALUATED"));
});
test("A01 production path: the S08 ledger evidence is read from the real render receipts (segment_render + chrome attribution) of this revision", { timeout: 1800000 }, async () => {
  const { renderFilm } = await import("../../engine/film/segment_render.mjs"), { buildFilmRevision } = await import("../../engine/film/film_revision.mjs"), { renderedOwners } = await import("../../engine/film/coverage_gate.mjs");
  const plan = planOf({ extra: [{ id: "kade_nod", kind: "JOINT_ROTATE", owner: "kade_rig.head", frames: [10, 50], inputs: { keys: [[0, 0], [20, 12, "sine.inOut"], [39, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") }] }), pf = path.join(FILM, "handoff", "MOTION_PLAN.json"); fs.writeFileSync(pf, JSON.stringify(plan, null, 1));
  await renderFilm({ film: FILM, revision: buildFilmRevision(FILM), renderer: "art_bridge_chrome_frames", rendererArgs: { planFile: pf, runType: "DIAGNOSTIC" }, total: 60, chunkSize: 30, outName: "a01.mp4" });
  const owners = renderedOwners(FILM, 60), C = compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }), bounded = { ...doc, actions: doc.actions.map((a) => ({ ...a, frame_range: [0, 60] })) };
  assert.ok(owners.kade_rig?.px?.filter((x) => x !== null).length === 60, "every rendered frame carries kade's isolated capture");
  const L = obligationLedger({ C, composition: verifyComposition(C), attribution: ownerAttributionGate({ owners, doc: bounded }), holds: HOLDS, scope: [0, 60] });
  assert.deepEqual(L.failures, [], JSON.stringify(L.failures.slice(0, 4))); assert.ok(L.rows.find((r) => r.action === KADE).producers.some((p) => p.id === "kade_nod"));
  assert.ok(!L.rows.find((r) => r.action === KADE).producers.some((p) => p.id === "kade_raise"), "a producer outside the evaluated interval is not judged on it");
});
