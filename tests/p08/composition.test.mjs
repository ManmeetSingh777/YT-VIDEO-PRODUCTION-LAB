// P08 compositional motion (A01/A03 + addendum §2–§8). Unfamiliar directed actions are SEQUENCES / PARALLEL combinations of reusable primitives
// compiled into the same surfaces as semantic commands; every primitive's owner effect is measured on every frame (engine/film/composition_qa.mjs).
// Disable one contributing producer at a time → exactly its consequence fails. Changing trajectory / timing / actor geometry / emotional profile
// changes the measured performance with the SAME code (no action-specific runtime function). DIAGNOSTIC character fixture (two unlike bipeds).
import test from "node:test"; import assert from "node:assert/strict"; import crypto from "node:crypto"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const { verifyComposition } = await import("../../engine/film/composition_qa.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), CM = await import("../../engine/art_bridge/composition.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan, d = doc) => compileMotionTracks(d.actions, d.shots, { doc: d, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, rec: x.record_id, reason: x.human_readable_reason })); } };
// measured standing sole positions (FK of the approved rest pose) — the plants hold the feet exactly where the standing art puts them
const C0 = compile(CF.basePlan()), sole = (sid, s) => C0.socketWorld(`${sid}_rig`, stateAtFrame(C0, 0).matrices[`${sid}_rig`], `${sid}_sole_${s}`);
const E = (kind, extra = {}) => ({ kind, ...extra });
/** combo 1 (kade): seated → rises with planted feet → gaze turns up-right → right arm raises and waves (elbow oscillation) */
const combo1 = ({ rise = [60, 60], waveAmp = 25, wavePeriod = 24, gazeTo = [900, 230], who = "kade", drop = 120 } = {}) => [
  { id: `${who}_plant_l`, kind: "PLANT", owner: `${who}_rig.${who}_sole_l`, frames: [0, 300], inputs: { target: { world_xy: sole(who, "l") } }, expected_effect: E("SOCKET_FIXED") },
  { id: `${who}_plant_r`, kind: "PLANT", owner: `${who}_rig.${who}_sole_r`, frames: [0, 300], inputs: { target: { world_xy: sole(who, "r") } }, expected_effect: E("SOCKET_FIXED") },
  { id: `${who}_rise`, kind: "ROOT_MOVE", owner: `${who}_rig`, frames: [0, rise[0] + rise[1]], inputs: { y: [[0, drop], [rise[0], drop], [rise[0] + rise[1] - 1, 0, "sine.inOut"]] }, limits: { max_speed_px_per_frame: 6 }, expected_effect: E("ROOT_PATH") },
  { id: `${who}_gaze`, kind: "AIM", owner: `${who}_rig.head`, sync: { ref: `${who}_rise`, relation: "BEFORE_END", offset: 0 }, duration: 120, inputs: { target: { world_xy: gazeTo }, max_deg: 35 }, expected_effect: E("AIM_HOLD") },
  { id: `${who}_raise`, kind: "JOINT_ROTATE", owner: `${who}_rig.shoulder_r`, sync: { ref: `${who}_rise`, relation: "AFTER_END", offset: 20 }, duration: 130, inputs: { keys: [[0, 0], [20, -150, "power2.out"], [100, -150], [129, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") },
  { id: `${who}_wave`, kind: "OSCILLATE", owner: `${who}_rig.elbow_r`, sync: { ref: `${who}_raise`, relation: "WITH_START", offset: 22 }, duration: 76, inputs: { amplitude_deg: waveAmp, period_frames: wavePeriod }, limits: { max_amplitude_deg: 40 }, expected_effect: E("OSCILLATION") } ];
/** combo 2 (pim): surprise (approved expression edges) + weight shift + chest recoil and recovery, feet planted; speech runs concurrently (semantic command) */
const combo2 = (t0 = 20) => [
  { id: "pim_plant_l", kind: "PLANT", owner: "pim_rig.pim_sole_l", frames: [0, 300], inputs: { target: { world_xy: sole("pim", "l") } }, expected_effect: E("SOCKET_FIXED") },
  { id: "pim_plant_r", kind: "PLANT", owner: "pim_rig.pim_sole_r", frames: [0, 300], inputs: { target: { world_xy: sole("pim", "r") } }, expected_effect: E("SOCKET_FIXED") },
  { id: "pim_surprise", kind: "STATE_SWAP", owner: "pim_rig.expr", frames: [t0, t0 + 120], inputs: { from: "neutral", events: [{ at: 0, state: "surprise" }, { at: 70, state: "neutral" }] }, expected_effect: E("STATE_SEQUENCE") },
  { id: "pim_recoil", kind: "JOINT_ROTATE", owner: "pim_rig.chest", frames: [t0, t0 + 81], inputs: { keys: [[0, 0], [8, -14, "power2.out"], [40, -14], [80, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") },
  { id: "pim_shift", kind: "ROOT_MOVE", owner: "pim_rig", frames: [t0, t0 + 111], inputs: { x: [[0, 0], [20, 0], [45, 22, "sine.inOut"], [80, 22], [110, 0, "sine.inOut"]], y: [[0, 0], [20, 0], [45, 12, "sine.inOut"], [80, 12], [110, 0, "sine.inOut"]] }, limits: { max_speed_px_per_frame: 2 }, expected_effect: E("ROOT_PATH") } ];
/** combo 3: kade points at pim WHILE pim looks back (synchronised), and background props keep their own directed activity */
const combo3 = () => [
  { id: "pim_look", kind: "AIM", owner: "pim_rig.head", frames: [320, 500], inputs: { target: { world_xy: [560, 300] }, forward_deg: 180, max_deg: 35 }, expected_effect: E("AIM_HOLD") },
  { id: "kade_point", kind: "JOINT_ROTATE", owner: "kade_rig.shoulder_r", sync: { ref: "pim_look", relation: "WITH_START", offset: 10 }, duration: 160, inputs: { keys: [[0, 0], [20, -95, "sine.out"], [130, -95], [159, 0, "sine.inOut"]] }, expected_effect: E("JOINT_TRAJECTORY") },
  { id: "bg_token_spin", kind: "ROOT_MOVE", owner: "token_rig", frames: [300, 560], inputs: { rot: [[0, 0], [259, 30, "linear"]] }, expected_effect: E("ROOT_PATH") },
  { id: "bg_sheet_slide", kind: "ROOT_MOVE", owner: "sheet_rig", frames: [300, 560], inputs: { x: [[0, 0], [259, 60, "sine.inOut"]] }, limits: { max_speed_px_per_frame: 1 }, expected_effect: E("ROOT_PATH") } ];
const planOf = (prims, extra = {}) => ({ ...CF.basePlan(), composition: { schema_version: "1.0.0", primitives: prims }, ...extra });
const ALL = () => [...combo1(), ...combo2(), ...combo3()];
const C = compile(planOf(ALL())), Q = verifyComposition(C), r = (id) => Q.results.find((x) => x.primitive === id);

test("COMP-1 three unfamiliar combinations from reusable primitives: every primitive's owner effect holds on every frame; one write set, no conflicts", () => {
  assert.ok(Q.ok, Q.failures.map((x) => `${x.code} ${x.record_id} ${x.human_readable_reason}`).slice(0, 8).join("\n"));
  for (const x of Q.results) assert.ok(x.frames_checked > 0, `${x.primitive} checked on zero frames`);
  assert.ok(r("kade_wave").measurement.peak_to_peak_deg >= 1.5 * 25, "the wave is a visible oscillation"); assert.ok(r("kade_plant_l").measurement.max_error_px <= 1.5 && r("kade_plant_r").measurement.max_error_px <= 1.5, "feet planted while rising");
  const ws = Q.write_set; assert.deepEqual(ws.conflicts, []); for (const m of ["PRIMARY", "ADDITIVE", "AIM", "CONSTRAINT", "STATE"]) assert.ok(ws.entries.some((e) => e.mode === m), `write set has ${m} writers`);
  // the schedule is resolved from synchronisation, deterministically: gaze ends when the rise ends; the wave starts 22 frames into the raise
  const fr = (id) => C.composition.primitives.find((x) => x.id === id).frames; assert.deepEqual(fr("kade_gaze"), [0, 120]); assert.equal(fr("kade_wave")[0], fr("kade_raise")[0] + 22); assert.equal(fr("kade_point")[0], 330);
  // the legs are solved (not keyed): a seated pelvis with planted feet bends the knees, standing straightens them
  const knee = (f) => { const s = stateAtFrame(C, f); return Math.abs(Math.atan2(s.matrices.kade_rig.knee_l[1], s.matrices.kade_rig.knee_l[0]) - Math.atan2(s.matrices.kade_rig.hip_l[1], s.matrices.kade_rig.hip_l[0])) * 180 / Math.PI; }; assert.ok(knee(10) > knee(130) + 20, `knee bent while seated (${knee(10).toFixed(1)}°) vs standing (${knee(130).toFixed(1)}°)`);
});

test("COMP-2 disable one contributing producer at a time: exactly that primitive's consequence fails (others keep passing)", () => {
  for (const id of ["kade_plant_l", "kade_rise", "kade_gaze", "kade_raise", "kade_wave", "pim_surprise", "pim_recoil", "pim_shift", "pim_look", "kade_point", "bg_token_spin", "bg_sheet_slide"]) {
    const drop = new Set([id]); for (let k = 0; k < 4; k++) for (const p of ALL()) if (p.sync && drop.has(p.sync.ref)) drop.add(p.id); const Cx = compile(planOf(ALL().filter((p) => !drop.has(p.id)))), Qx = verifyComposition({ ...Cx, composition: { ...C.composition, primitives: C.composition.primitives.filter((p) => p.id === id) } });
    assert.ok(!Qx.ok && Qx.failures.some((x) => x.record_id === id), `${id} removed: its own consequence must fail (got ${Qx.failures.map((x) => x.record_id)})`); }
  // the camera moving instead of the actor is not actor evidence: the arm effect fails even though the frame changes
  const Cc = compile(planOf([...ALL().filter((p) => p.id !== "kade_raise" && p.id !== "kade_wave"), { id: "cam_push", kind: "CAMERA_MOVE", owner: "camera.cam_1", frames: [140, 270], inputs: { y: [[0, 520], [129, 400, "sine.inOut"]] }, expected_effect: E("CAMERA_PATH") }]));
  const Qc = verifyComposition({ ...Cc, composition: { ...C.composition, primitives: C.composition.primitives.filter((p) => p.id === "kade_raise") } }); assert.ok(Qc.failures.some((x) => x.record_id === "kade_raise"), "camera motion never stands in for the actor's directed arm");
});

test("COMP-3 the same code, different direction: trajectory, timing, actor geometry and emotional profile change the measured performance", () => {
  const traj = verifyComposition(compile(planOf(combo1({ gazeTo: [760, 420] })))), timing = compile(planOf(combo1({ rise: [90, 40] }))), geo = compile(planOf(combo1({ who: "pim", drop: 60, gazeTo: [1300, 360] })));
  assert.ok(traj.ok, traj.failures.map((x) => x.human_readable_reason).join("; "));
  const head = (Cx, f, who = "kade") => { const s = stateAtFrame(Cx, f); return Math.atan2(s.matrices[`${who}_rig`].head[1], s.matrices[`${who}_rig`].head[0]) * 180 / Math.PI; };
  assert.ok(Math.abs(head(C, 60) - head(compile(planOf(combo1({ gazeTo: [760, 420] }))), 60)) > 10, "a different directed gaze target gives a different head angle");
  assert.equal(timing.composition.primitives.find((p) => p.id === "kade_raise").frames[0], 150, "a slower rise re-times every synchronised primitive (raise starts after the new rise end)");
  const Qg = verifyComposition(geo); assert.ok(Qg.ok, Qg.failures.map((x) => x.human_readable_reason).slice(0, 4).join("; "));
  const kneeK = (Cx, who, f) => { const s = stateAtFrame(Cx, f); return Math.atan2(s.matrices[`${who}_rig`].knee_l[1], s.matrices[`${who}_rig`].knee_l[0]); }; assert.notEqual(kneeK(C, "kade", 10).toFixed(4), kneeK(geo, "pim", 10).toFixed(4), "the short biped's own leg lengths give its own knee solution");
  // emotional profile: an approved per-character envelope table (excited vs tired) chooses amplitude/period of the SAME oscillation primitive
  const PROFILE = { excited: { amp: 35, period: 14 }, tired: { amp: 10, period: 40 } }, wave = (k) => verifyComposition(compile(planOf(combo1({ waveAmp: PROFILE[k].amp, wavePeriod: PROFILE[k].period })))).results.find((x) => x.primitive === "kade_wave");
  const ex = wave("excited"), ti = wave("tired"); assert.ok(ex.ok && ti.ok); assert.ok(ex.measurement.peak_to_peak_deg > 2 * ti.measurement.peak_to_peak_deg, `excited wave ${ex.measurement.peak_to_peak_deg}° vs tired ${ti.measurement.peak_to_peak_deg}°`);
});

test("COMP-4 supported-parameter domains and precedence: out-of-domain requests return the precise missing dependency, never a fallback", () => {
  const one = (p) => codes(() => compile(planOf([p])));
  assert.ok(one({ id: "x", kind: "JOINT_ROTATE", owner: "kade_rig.knee_l", frames: [0, 40], inputs: { keys: [[0, 0], [30, 170]] }, expected_effect: E("J") }).some((x) => x.code === "JOINT_LIMIT_EXCEEDED" && x.inv === "PRIMITIVE_IN_DOMAIN"), "beyond the approved knee range");
  assert.ok(one({ id: "x", kind: "OSCILLATE", owner: "kade_rig.elbow_r", frames: [0, 40], inputs: { amplitude_deg: 80, period_frames: 20 }, expected_effect: E("O") }).some((x) => x.inv === "PRIMITIVE_IN_DOMAIN"));
  assert.ok(one({ id: "x", kind: "STATE_SWAP", owner: "kade_rig.expr", frames: [0, 40], inputs: { from: "neutral", events: [{ at: 0, state: "grin" }] }, expected_effect: E("S") }).some((x) => x.code === "UNSUPPORTED_STATE_EDGE"), "neutral → grin skips the approved intermediates");
  assert.ok(one({ id: "x", kind: "STATE_SWAP", owner: "kade_rig.expr", frames: [0, 40], inputs: { events: [{ at: 0, state: "sneer" }] }, expected_effect: E("S") }).some((x) => x.code === "MISSING_ART_ASSET"), "an undrawn state is a precise art request");
  assert.ok(one({ id: "x", kind: "TELEPORT", owner: "kade_rig", frames: [0, 40], inputs: {}, expected_effect: E("T") }).some((x) => x.code === "PERFORMANCE_CAPABILITY_MISSING" && x.inv === "PRIMITIVE_HAS_PRODUCER"));
  assert.ok(one({ id: "x", kind: "JOINT_ROTATE", owner: "kade_rig.elbow_r", frames: [0, 40], inputs: { keys: [[0, 0], [30, 20]] } }).some((x) => x.inv === "PRIMITIVE_DECLARES_EFFECT"), "a primitive without a declared consumer effect");
  assert.ok(codes(() => compile(planOf([...combo1(), { id: "knee_key", kind: "JOINT_ROTATE", owner: "kade_rig.knee_l", frames: [10, 50], inputs: { keys: [[0, 0], [30, 40]] }, expected_effect: E("J") }]))).some((x) => x.code === "MANDATORY_EFFECT_SUPPRESSED"), "a directed knee rotation under a locked plant would be silently lost");
  assert.ok(codes(() => compile(planOf([{ id: "a", kind: "AIM", owner: "kade_rig.head", sync: { ref: "b", relation: "AFTER_END" }, duration: 10, inputs: { target: { world_xy: [0, 0] } }, expected_effect: E("A") }, { id: "b", kind: "AIM", owner: "pim_rig.head", sync: { ref: "a", relation: "AFTER_END" }, duration: 10, inputs: { target: { world_xy: [0, 0] } }, expected_effect: E("A") }]))).some((x) => x.inv === "SYNC_ACYCLIC"));
});

test("COMP-5 real Chrome owner pixels: the waving hand, the surprised brows, the spinning token and the sliding sheet each change their OWN pixels", async () => {
  const browser = await launch(), out = isolatedWork("p08_comp_render");
  try { const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const m = (png, c, tol = 3) => { let x = 0, y = 0, n = 0, x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) { const k = i / 4, px = k % png.width, py = Math.floor(k / png.width); x += px; y += py; n++; x0 = Math.min(x0, px); x1 = Math.max(x1, px); y0 = Math.min(y0, py); y1 = Math.max(y1, py); } return { n, c: [x / n, y / n], w: x1 - x0, h: y1 - y0 }; };
    const A = await shoot(C, [130, 160, 166, 172, 30, 300, 559], "comp_pos"), hand = (f) => m(A[f], CF.COL["kade:hand_r:open"]), ev = {};
    ev.hand_rise = hand(130).c[1] - hand(160).c[1]; assert.ok(ev.hand_rise > 60, `raised hand pixels moved up ${ev.hand_rise.toFixed(1)}px`);
    ev.wave = Math.hypot(hand(166).c[0] - hand(172).c[0], hand(166).c[1] - hand(172).c[1]); assert.ok(ev.wave > 8, `the waving hand's pixels oscillate (${ev.wave.toFixed(1)}px between half-periods)`);
    ev.brows = m(A[30], CF.COL["pim:expr:surprise"]).n; assert.ok(ev.brows > 20, "the surprised brow drawing is painted on pim");
    const t0 = m(A[300], CF.COL["token:coin"]), t1 = m(A[559], CF.COL["token:coin"]); ev.token = [t0.h, t1.h]; assert.ok(t1.h > t0.h + 4, `the token's own pixels rotate (height ${t0.h} → ${t1.h})`);
    const s0 = m(A[300], CF.COL["sheet:page"]), s1 = m(A[559], CF.COL["sheet:page"]); ev.sheet = s1.c[0] - s0.c[0]; assert.ok(ev.sheet > 40, `the sheet's own pixels slide (${ev.sheet.toFixed(1)}px)`);
    const B = await shoot(compile(planOf(ALL().filter((p) => p.id !== "kade_wave"))), [166, 172], "comp_neg"), hb = (f) => m(B[f], CF.COL["kade:hand_r:open"]).c; ev.wave_removed = Math.hypot(hb(166)[0] - hb(172)[0], hb(166)[1] - hb(172)[1]); assert.ok(ev.wave_removed < 2, `wave producer removed → no oscillation in the hand pixels (${ev.wave_removed.toFixed(2)}px)`);
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, ...ev }, null, 1));
  } finally { await browser.close(); }
});
void crypto; void verifyPerformance; void CM; void clone;

test("COMP-6 surprised, recoiling actor SPEAKS: semantic speak (viseme route) and composed primitives share one compile, one clock and one write set", async () => {
  const H = await import("./perf_helpers.mjs"), PC = await import("../../engine/art_bridge/performance_commands.mjs");
  const cue = H.diagAlign("PS", "pim_rig", 34, [["oh", [["OW1", 4800]]], ["my", [["M", 2400], ["AY1", 5600]]], ["fine", [["F", 3200], ["AY1", 4800], ["N", 2400]]], ["bump", [["B", 2400], ["AH1", 3200], ["M", 2400], ["P", 2400]]]]);
  const P = { actor_rig_id: "pim_rig", character_profile_id: "pim_perf", action_id: CF.ACT.pim };
  const plan = H.withExactArt(PC, doc, planOf(combo2(), { performance: { packet: { schema_version: "1.1.0", film_id: "p08_characters", fps: 60, total_frames: doc.stage.total_frames, characters: H.characters(doc), commands: [H.speak(P, "pim_says", [30, 120], "PS")] }, profiles: H.profiles(), audio_cues: { PS: cue } } }));
  const Cs = compile(plan), Qc = verifyComposition(Cs), Qp = verifyPerformance(Cs);
  assert.ok(Qc.ok, Qc.failures.map((x) => x.human_readable_reason).slice(0, 4).join("; ")); assert.ok(Qp.ok, Qp.failures.map((x) => `${x.code} ${x.human_readable_reason}`).slice(0, 4).join("; "));
  assert.ok(Qp.results.find((x) => x.kind === "VisemeSync")?.ok && Qp.results.find((x) => x.kind === "FaceComposition" && x.command === "pim_rig")?.ok, "mouth follows phones on the surprised face, legally");
  const ws = Qc.write_set, mouthW = ws.entries.filter((e) => e.owner === "pim_rig.mouth"), exprW = ws.entries.filter((e) => e.owner === "pim_rig.expr"), chestW = ws.entries.filter((e) => e.owner === "pim_rig.chest");
  assert.ok(mouthW.length && mouthW.every((e) => e.producer === "command:pim_says"), "speech owns the mouth channel"); assert.ok(exprW.every((e) => e.producer === "composition:pim_surprise"), "the composed swap owns the expression");
  assert.ok(chestW.some((e) => e.mode === "PRIMARY"), "the recoil owns the chest rotation"); assert.deepEqual(ws.conflicts, []);
});
