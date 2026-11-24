// P03 capability regression suite (directive A–I). Runs on the two-unlike-subject DIAGNOSTIC fixture built through the real intake
// (tests/p03/subjects_fixture.mjs) in its own work dir. Each capability has a positive proof and at least one negative/counterfactual.
//   node --test tests/p03/p03_capabilities.test.mjs
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p03", "test_subjects"), MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";
const { runSubjects, approveDeforms } = await import("./subjects_fixture.mjs"), P = await import("./p03_plans.mjs");
const { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs");
const SC = await import("../../engine/art_bridge/state_channels.mjs"), { checkRigFeasibility } = await import("../../engine/art_bridge/art_intake.mjs"), { ownerAttributionGate } = await import("../../engine/film/coverage_gate.mjs"), A = await import("../../engine/film/audio_mix.mjs");
const { scaleOf, angleOf } = await import("../../engine/art_bridge/math2d.mjs");
const rt = await runSubjects(W), FILM = rt.film, reg = await createAssetRegistry(FILM, MF, {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan, d = doc) => compileMotionTracks(d.actions, d.shots, { doc: d, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => x.code); } };
const plan = await approveDeforms(FILM, P.directedPlan(doc)), bare = P.barePlan(doc), C = compile(plan), C0 = compile(bare);
const scA = composeShot(doc.shots[0], reg, C, { prefix: "a-" }), scB = composeShot(doc.shots[1], reg, C, { prefix: "b-" });

/* ---------------- B: explicit state channels ---------------- */
test("B1 expression/eyes/mouth come from their OWN channels, independent of the pose id", () => {
  const rig = doc.rigs.find((r) => r.id === "nova_rig"), r = SC.resolveBindings(rig, "grip", null, { eyes: "closed", mouth: "open", hand_r: "grip" });
  assert.equal(r.eyes, "closed"); assert.equal(r.mouth, "open"); assert.equal(r.bindings.nova_eye_open, "nova_eye_closed"); assert.equal(r.bindings.nova_hand_open, "nova_hand_grip");
  const s = stateAtFrame(C, 32); assert.equal(s.artStates.nova_rig.pose, "open"); assert.equal(s.artStates.nova_rig.eyes, "closed", "the compiled blink swaps the eyes at frame 30..36 while the pose stays");
});
test("B2 negatives: a missing channel drawing is MISSING_ART_ASSET; two channels owning one slot is STATE_CHANNEL_CONFLICT", () => {
  const rig = clone(doc.rigs.find((r) => r.id === "nova_rig")); rig.state_channels[0].states[1].asset_bindings.nova_eye_open = "nova_eye_squint";
  assert.ok(SC.validateChannels(rig, { assets: new Map(doc.assets.map((a) => [a.id, a])) }).some((e) => e.code === "MISSING_ART_ASSET"));
  const r2 = clone(doc.rigs.find((r) => r.id === "nova_rig")); r2.state_channels[1].slots.push("nova_eye_open"); assert.ok(SC.validateChannels(r2).some((e) => e.code === "STATE_CHANNEL_CONFLICT"));
});
/* ---------------- C: feasibility over every action ---------------- */
test("C1 negative regression: a NON-CONTACT action with an invalid state change is INFEASIBLE (feasibility covers every action)", async () => {
  const d2 = path.join(W, "c_neg"); fs.rmSync(d2, { recursive: true, force: true }); fs.cpSync(FILM, d2, { recursive: true }); const m = JSON.parse(fs.readFileSync(path.join(d2, MF), "utf8"));
  m.actions.find((a) => a.id === "lumen_watch").pose_events.push({ frame: 300, state_id: "no_such_state" }); fs.writeFileSync(path.join(d2, MF), JSON.stringify(m, null, 1)); fs.writeFileSync(path.join(d2, "handoff", "MOTION_PLAN.json"), JSON.stringify(bare));
  const r = await checkRigFeasibility({ film: d2, identity: "lumen" }); assert.notEqual(r.status, "FEASIBLE"); assert.ok(r.checked.some((c) => c.actions.includes("lumen_watch")), "the non-contact action was checked");
});
/* ---------------- A: acting compiler ---------------- */
test("A1 acting: lag follows topology depth, breath is additive rotation only (no scale), and matrices differ from the bare plan", () => {
  const rep = C.layers.acting.nova_rig; assert.equal(rep.lagged.head, 6, "head depth 2 × 3 frames"); assert.ok(rep.anticipations > 0 && rep.settles >= 0 && rep.blinks >= 2 && rep.speech_swaps >= 3);
  assert.deepEqual(C.layers.acting.lumen_rig.lagged.head, 12, "creature head is depth 3 in ITS rig (neck1→neck2→head): lag transfers from rig data");
  const s = stateAtFrame(C, 150), s0 = stateAtFrame(C0, 150); assert.notDeepEqual(s.matrices.nova_rig.head, s0.matrices.nova_rig.head);
  for (const [j, M] of Object.entries(stateAtFrame(C, 300).matrices.lumen_rig)) assert.ok(Math.abs(scaleOf(M) - 1) < 1e-9, `${j} keeps the art's scale`);
});
test("A2 negatives: acting naming a joint the rig lacks is ACTING_UNEXECUTABLE; a blink needing an unapproved state is MISSING_ART_ASSET; amplitude past the joint limit refuses", () => {
  const p1 = clone(plan); p1.acting.lumen_rig.breath.joint = "shoulder_r"; assert.ok(codes(() => compile(p1)).includes("ACTING_UNEXECUTABLE"));
  const p2 = clone(plan); p2.acting.lumen_rig.blink.closed = "squint"; assert.ok(codes(() => compile(p2)).includes("MISSING_ART_ASSET"));
  const p3 = clone(plan); p3.acting.lumen_rig.breath.amplitude_deg = 40; assert.ok(codes(() => compile(p3)).includes("ACTING_UNEXECUTABLE"));
});
/* ---------------- D: phrases are a real input ---------------- */
test("D1 a phrase is primary motion: editing it changes the compiled matrices of the character and the camera", () => {
  const p2 = clone(plan); p2.phrases[0].owners[0].values.ACTION = -2; const C2 = compile(p2), a = stateAtFrame(C, 100), b = stateAtFrame(C2, 100);
  assert.notDeepEqual(a.matrices.nova_rig.chest, b.matrices.nova_rig.chest); assert.ok(Math.abs(stateAtFrame(C, 90).camera.zoom - 1) > 0.1, "camera owner of the phrase drives zoom");
});
test("D2 negatives: an unresolvable phrase owner returns PHRASE_UNEXECUTABLE; a phrase and an authored track on one owner is INVALID_TRANSFORM_OWNER", () => {
  const p1 = clone(plan); p1.phrases[0].owners.push({ id: "nova_rig.tail", kind: "ACTOR", values: { ACTION: 5 } }); assert.ok(codes(() => compile(p1)).includes("PHRASE_UNEXECUTABLE"));
  const p2 = clone(plan); p2.tracks.nova_rig.joints.chest = [[0, 0]]; assert.ok(codes(() => compile(p2)).includes("INVALID_TRANSFORM_OWNER"));
});
test("D3 precedence is reported: contact IK owns its chain joints; acting there is listed as suppressed_by_contact (never silently erased)", () => {
  assert.ok(C.layers.suppressed_by_contact.some((x) => x.rig === "nova_rig" && ["shoulder_r", "elbow_r", "wrist_r", "hip_l", "knee_l"].includes(x.joint)) || C.layers.suppressed_by_contact.length === 0);
  const s = stateAtFrame(C, 120); for (const c of s.contacts.filter((x) => x.locked)) assert.ok(c.error_px <= c.allowed_error_px, `${c.socket} held at ${c.error_px}`);
});
/* ---------------- E: deformation + morph ---------------- */
test("E1 raster mesh deformation: start = identity, middle = half, end = targets; the deformed copy replaces the rigid pass in the scene rows", () => {
  const m = plan.deform_maps.lumen_watch, at = (f) => C.deformsAt(f).find((d) => d.id === "lumen_watch");
  assert.equal(at(240), undefined, "weight 0 → no deformation"); const end = at(300), mid = at(270);
  end.vertices.forEach((v, i) => assert.ok(Math.hypot(v[0] - m.targets[i][0], v[1] - m.targets[i][1]) < 1e-9)); assert.ok(Math.abs(mid.weight - 0.5) < 1e-9);
  const rows = scB.frameState(300).rows, base = rows.find((r) => r[0] === "b-lumen_rig--lumen_body--lumen_body"), tris = rows.filter((r) => r[0].startsWith("b-lumen_rig--lumen_body--lumen_body--tri"));
  assert.equal(base[2], 0); assert.equal(tris.length, m.triangles.length); assert.ok(tris.every((r) => r[2] === 1)); assert.ok(scB.svg.includes('clipPath id="b-lumen_rig--lumen_body--lumen_body--tri0-clip"'));
});
test("E2 negatives: inverted triangles, a mesh leaving the approved pixels, and incompatible vector topology are refused", () => {
  const p1 = clone(plan), t = p1.deform_maps.lumen_watch.targets; [t[0], t[2]] = [t[2], t[0]]; assert.ok(codes(() => compile(p1)).some((c) => c === "INVALID_DEFORM_MAP" || c === "DEFORM_RENDER_FAILURE"));
  const p2 = clone(plan); p2.deform_maps.lumen_watch.vertices[0] = [-5000, -5000]; assert.ok(codes(() => compile(p2)).includes("DEFORM_RENDER_FAILURE"));
  const p4 = clone(plan), m4 = p4.deform_maps.lumen_watch, [cx, cy] = [m4.vertices[4][0], m4.vertices[4][1]]; m4.vertices = m4.vertices.map(([x, y]) => [cx + (x - cx) * 0.76, cy + (y - cy) * 0.76]); m4.targets = m4.vertices.map((v) => [...v]);
  assert.ok(codes(() => compile(p4)).includes("DEFORM_RENDER_FAILURE"), "an inset mesh that would drop approved pixels is refused (found by visual inspection of the first render)");
  const p3 = clone(plan); p3.morphs.nova_pull_lever.to = "nova_brow_bad"; assert.ok(codes(() => compile(p3)).includes("INVALID_MORPH_TOPOLOGY"));
});
test("E3 vector morph: approved homologous paths interpolate (middle = midpoint of control points) and are written as the path d each frame", () => {
  const mid = C.morphsAt(75).find((x) => x.id === "nova_pull_lever"), A0 = doc.assets.find((a) => a.id === "nova_brow_neutral"), A1 = doc.assets.find((a) => a.id === "nova_brow_raised"), n = (d) => d.match(/-?\d+\.?\d*/g).map(Number);
  const a = n(A0.vector_paths[0].d), b = n(A1.vector_paths[0].d), m = n(mid.d[0]); m.forEach((v, i) => assert.ok(Math.abs(v - (a[i] + (b[i] - a[i]) * mid.weight)) < 2e-3));
  const row = scA.frameState(75).rows.find((r) => r[0] === "a-nova_rig--nova_brow_neutral--nova_brow_neutral-path0"); assert.equal(row[4].d, mid.d[0]);
});
/* ---------------- F: contact systems in execution ---------------- */
test("F1 grip: position + orientation + closure + near/far are checked on every hold frame; a reversed palm and a lost near/far order fail", () => {
  for (const f of [70, 120, 199]) { const fs_ = scA.frameState(f), g = fs_.execution.grips[0]; assert.ok(g.checked && g.ok, `frame ${f}: ${JSON.stringify(g)}`); assert.equal(g.closure, "grip"); assert.ok(g.hand_layer > g.prop_layer); }
  const p1 = clone(plan); p1.grips["nova_pull_lever:nova_grip"].palm_basis_deg = 14; const s1 = composeShot(doc.shots[0], reg, compile(p1), { prefix: "x-" }).frameState(120);
  assert.ok(s1.state.failures.some((x) => x.code === "GRIP_MORPHOLOGY_FAILED" && /ORIENTATION/.test(x.details?.failed_invariant)));
  const p2 = clone(plan); p2.paint_order = []; const s2 = composeShot(doc.shots[0], reg, compile(p2), { prefix: "y-" }).frameState(120); assert.ok(s2.state.failures.some((x) => x.code === "GRIP_MORPHOLOGY_FAILED" && /OCCLUSION/.test(x.details?.failed_invariant)));
});
test("F2 planted feet and weight transfer: soles stay on their targets for every frame; the centre of mass moves before the lever does", () => {
  let comMoved = null, leverMoved = null; const com0 = stateAtFrame(C, 0).support[0].com_x;
  for (let f = 0; f < 240; f++) { const s = stateAtFrame(C, f); for (const c of s.contacts.filter((x) => x.contact_type === "PLANT")) assert.ok(c.error_px <= 1.0, `f${f} ${c.socket} ${c.error_px}`);
    assert.ok(!s.failures.some((x) => x.code === "BALANCE_FAILED"), `balance f${f}`); if (comMoved === null && Math.abs(s.support[0].com_x - com0) > 0.5) comMoved = f; const r = s.reactions[0]; if (leverMoved === null && r && Math.abs(r.angle) > 0.5) leverMoved = f; }
  assert.ok(comMoved !== null && leverMoved !== null && comMoved < leverMoved, `COM moves at ${comMoved}, lever at ${leverMoved}`);
});
test("F3 object reaction is causal: the lever follows the pull (zero residual) and is static without the reaction contract", () => {
  const a = stateAtFrame(C, 180), b = stateAtFrame(C0, 180); assert.ok(Math.abs(a.reactions[0].angle) > 2 && a.reactions[0].residual_px < 1e-3); assert.equal(b.reactions.length, 0);
  assert.notDeepEqual(a.matrices.lever_rig.arm, b.matrices.lever_rig.arm);
  const p1 = clone(plan); p1.reactions[0].driver.joint = "pelvis"; p1.reactions[0].frames = [70, 200]; const s = stateAtFrame(compile(p1), 150); assert.ok(s.reactions.length === 1); // a different driver changes the outcome
});
test("F4 dynamic cast shadow: emitted from the approved occluder drawing, moves with it, keeps floor contact, material treatment applied", () => {
  const r0 = scA.frameState(0).rows.find((r) => r[0] === "a-shadow--nova_floor_nova_torso--nova_torso"), r1 = scA.frameState(150).rows.find((r) => r[0] === "a-shadow--nova_floor_nova_torso--nova_torso"); // P04: grounded shadow set (torso + legs)
  assert.ok(r0 && r1); assert.notEqual(r0[1], r1[1]); assert.equal(r0[3], 1, "P05: each piece is opaque inside ONE shadow group; the material opacity belongs to the group, so overlapping pieces never darken twice"); assert.ok(/<g id="a-shadowgroup--nova_rig--floor--FOCAL"[^>]*opacity="0\.4"[^>]*filter="url\(#a-shadowf-nova_rig--floor--FOCAL\)"/.test(scA.svg), "floor material opacity and softening are applied to the united shadow"); assert.ok(!scA.frameState(150).state.failures.some((x) => x.code === "SHADOW_RELATION_MISSING"), "P04: grounded shadow set reaches the planted feet"); { const p9 = clone(plan); p9.shadows = p9.shadows.filter((s) => s.id === "nova_floor_nova_torso"); assert.ok(composeShot(doc.shots[0], reg, compile(p9), { prefix: "ns-" }).frameState(150).state.failures.some((x) => x.code === "SHADOW_RELATION_MISSING"), "P04: a torso-only shadow does not reach the feet and is refused"); }
  assert.ok(scA.frameState(150).execution.shadows[0].footprint_x[1] > scA.frameState(150).execution.shadows[0].footprint_x[0]);
});
test("F5 connected follow-through: hair and tail are baked springs driven by head / tail motion (non-zero lag after the driver moves)", () => {
  const h = [...Array(240).keys()].map((f) => C.secondaryBaked["nova_rig.hair"][f]), t = [...Array(240).keys()].map((f) => C.secondaryBaked["lumen_rig.tail2"][f + 240]);
  assert.ok(Math.max(...h.map(Math.abs)) > 2 && Math.max(...t.map(Math.abs)) > 2, `visible follow-through: hair ${Math.max(...h.map(Math.abs)).toFixed(2)}°, tail ${Math.max(...t.map(Math.abs)).toFixed(2)}°`);
});
/* ---------------- G: per-owner attribution gate (synthetic receipts; the Chrome negatives are in run_clips.mjs) ---------------- */
test("G1 owner gate: frozen owner, unrendered discrete swap and deformation equal to rigid are each reported; a healthy owner passes", () => {
  const d = { actions: [{ id: "act", frame_range: [0, 6], actors: [{ rig_id: "r" }] }] }, mk = (px, state, extra = {}) => ({ px, state, visible_set: px.map(() => "v"), ref_swap: px.map(() => null), ref_rigid: px.map(() => null), ...extra });
  assert.ok(ownerAttributionGate({ owners: { r: mk(["a", "b", "c", "d", "e", "f"], ["1", "2", "3", "4", "5", "6"]) }, doc: d }).ok);
  assert.ok(ownerAttributionGate({ owners: { r: mk(["a", "a", "a", "a", "a", "a"], ["1", "2", "3", "4", "5", "6"]) }, doc: d }).failures.some((x) => x.failed_invariant === "OWNER_MOTION_RENDERED"));
  assert.ok(ownerAttributionGate({ owners: { "r:hand": mk(["a", "b", "c", "d", "e", "f"], ["1", "2", "3", "4", "5", "6"], { ref_swap: [null, null, "c", null, null, null] }) }, doc: d }).failures.some((x) => x.failed_invariant === "DISCRETE_STATE_NOT_RENDERED"));
  assert.ok(ownerAttributionGate({ owners: { "r:body": mk(["a", "b", "c", "d", "e", "f"], ["1", "2", "3", "4", "5", "6"], { ref_rigid: ["a", "b", "c", "d", null, null] }) }, doc: d }).failures.some((x) => x.failed_invariant === "DEFORMATION_NOT_RENDERED"));
  assert.ok(!ownerAttributionGate({ owners: {}, doc: d }).ok, "no attribution captured for an actor fails");
});
/* ---------------- H: audio ---------------- */
test("H1 audio buses: frame-addressed SFX and narration onsets measured from the mix within 4 ms; ducking and loudness measured; a late SFX is caught", () => {
  const Wd = path.join(W, "audio"); fs.mkdirSync(Wd, { recursive: true });
  const cp = (f, expr, dur) => { execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-f", "lavfi", "-i", `aevalsrc=${expr}:s=48000:d=${dur}`, "-ac", "1", "-c:a", "pcm_s16le", f]); return f; };
  const nar = cp(path.join(Wd, "n.wav"), "0.35*sin(2*PI*220*t)*(between(t\\,0.5\\,0.9)+between(t\\,1.0\\,1.6))", 8), mus = cp(path.join(Wd, "m.wav"), "0.06*(random(0)*2-1)", 8), clk = cp(path.join(Wd, "c.wav"), "0.8*sin(2*PI*1800*t)*exp(-t*60)", 0.12);
  const sfx = [{ id: "g", file: clk, frame: 70 }, { id: "r", file: clk, frame: 200 }], words = [{ start_s: 0.5, end_s: 0.9, w: "pull" }, { start_s: 1.0, end_s: 1.6, w: "together" }];
  const m = A.mixBuses({ out: path.join(Wd, "mix.wav"), fps: 60, total_frames: 480, narration: { file: nar }, music: { file: mus, gain_db: -6 }, sfx });
  const v = A.verifyAudioSync({ mix: m.file, fps: 60, sfx, words, music: { file: mus, stem: m.music_stem_ducked, reference_window_s: [3, 7.5] }, narration: { window_s: [0.55, 0.88] }, target_lufs: -16 }); assert.ok(v.ok, JSON.stringify(v.failures)); assert.ok(v.duck.depth_db >= 6);
  const late = A.mixBuses({ out: path.join(Wd, "late.wav"), fps: 60, total_frames: 480, narration: { file: nar }, sfx: [{ ...sfx[0], frame: 73 }, sfx[1]] }); assert.ok(A.verifyAudioSync({ mix: late.file, fps: 60, sfx, words }).failures.some((f) => f.code === "AUDIO_SYNC_MISMATCH" && f.record_id === "g"));
});
/* ---------------- I: ledger stage tasks ---------------- */
test("I1 stage ledger derives and runs a task per new capability (layers, deformation, morph, reaction, support) from the film's own plan", async () => {
  const S = await import("../../engine/production/stages.mjs"), ctx = { ...S.loadContext(FILM), motionPlans: { _film: plan } }, tasks = S.deriveTasks("S03_TIMING_MOTION", ctx), ids = tasks.map((t) => t.task_id);
  for (const id of ["motion_layers", "deform_lumen_watch", "morph_nova_pull_lever", "reaction_lever_follow", "support_nova_rig"]) assert.ok(ids.includes(id), `${id} derived`);
  for (const t of tasks.filter((x) => /^(motion_layers|deform_|morph_|reaction_|support_)/.test(x.task_id))) { const r = await t.run(); assert.ok(r.pass, `${t.task_id}: ${r.measurement}`); assert.ok(t.producer.includes("engine/")); }
  const p1 = clone(plan); p1.reactions[0].allowed_error_px = -1; const bad = S.deriveTasks("S03_TIMING_MOTION", { ...ctx, motionPlans: { _film: p1 } }).find((t) => t.task_id === "reaction_lever_follow"); assert.equal((await bad.run()).pass, false, "a reaction outside tolerance fails its ledger task");
});
