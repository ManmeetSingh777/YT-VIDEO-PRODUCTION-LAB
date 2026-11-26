// P08 C02 (explicit expression transitions through approved intermediate cels), C03 (visemes from a phone schedule on the 800-samples/frame clock,
// mouth family conditioned by the visible expression), C04 (facial tuple legality). Real chain: PerformanceCommand + EXPRESSION_TRANSITION + audio
// cue alignment → compilePerformance → compileMotionTracks → stateAtFrame → performance QA → Chrome owner pixels. DIAGNOSTIC fixture: the phone
// schedules below are labelled DIAGNOSTIC_FIXTURE (accepted only in a DIAGNOSTIC run); the real E01 takes are validated by tools/tbo/e01_speech_preflight.mjs.
import test from "node:test"; import assert from "node:assert/strict"; import crypto from "node:crypto"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const PC = await import("../../engine/art_bridge/performance_commands.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), SV = await import("../../engine/art_bridge/speech_visemes.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const DIGEST = crypto.createHash("sha256").update("P08 DIAGNOSTIC face/speech packet revision 1").digest("hex"), DEC = ["dd_p08_face_diag"];
const master = (rid) => doc.identities.find((i) => i.id === doc.rigs.find((r) => r.id === rid).identity_id).master_sha256;
const roles = (sid) => ({ head_joint: "head", gaze_joint: "head", chest_joint: "chest", expression_channel: "expr", mouth_channel: "mouth", mouth_rest_state: "NEUTRAL_REST", mouth_open_state: "NEUTRAL_AA", eyes_channel: "eyes", eyes_open_state: "open", eyes_closed_state: "closed",
  "hand.l.socket": `${sid}_palm_l`, "hand.l.channel": "hand_l", "hand.l.open_state": "open", "hand.l.closed_state": "grip", "hand.r.socket": `${sid}_palm_r`, "hand.r.channel": "hand_r", "hand.r.open_state": "open", "hand.r.closed_state": "grip" });
const CHARS = () => ["kade", "pim"].map((sid) => ({ actor_rig_id: `${sid}_rig`, master_sha: master(`${sid}_rig`), topology_kind: "BIPED", character_profile_id: `${sid}_perf`, approved_state_channels: ["expr", "mouth", "eyes", "hand_l", "hand_r"], approved_motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], role_map: roles(sid) }));
const PROFILES = () => Object.fromEntries(["kade", "pim"].map((sid) => [`${sid}_perf`, { id: `${sid}_perf`, version: "1.0.0", actor_rig_id: `${sid}_rig`, approval: { status: "DIAGNOSTIC_TEST_TRUST", note: "P08 diagnostic profile" }, timing: { acquire_ease: "sine.inOut" }, speech: { route: "VISEME" } }]));
const E = (kind, owner, frames, id, x = {}) => ({ kind, owner_id: owner, frames, test_id: `P08-${id}`, human_quality_check: `native playback: ${kind} on ${owner}`, ...x });
const ST = (cs = {}) => ({ channel_states: cs, possession: {} });
const cmd = (o) => ({ direction_decision_ids: DEC, override_policy: "DIRECTOR_PRIORITY_STRICT", source_digest: DIGEST, required_prestate: ST(), required_poststate: ST(), required_art_refs: [], motion_routes: ["APPROVED_CELS"], ...o });
const K = { actor_rig_id: "kade_rig", character_profile_id: "kade_perf", action_id: CF.ACT.kade }, Pm = { actor_rig_id: "pim_rig", character_profile_id: "pim_perf", action_id: CF.ACT.pim };
const brows = (sid, e) => (e === "neutral" ? `${sid}_brows` : `${sid}_brows_${e}`), mouthA = (sid, s) => (s === "NEUTRAL_REST" ? `${sid}_mouth` : `${sid}_mouth_${s}`);
const expr = (base, id, frames, from, to, art, last) => cmd({ ...base, id, verb: "change_expression", frames, intent: `${from} → ${to}`, phases: [{ id: "change", frames: [frames[0], last], goal: "change", expected_owner_effect: "face changes" }, { id: "hold", frames: [last, frames[1]], goal: "hold", expected_owner_effect: "held" }],
  required_prestate: ST({ expr: from }), required_poststate: ST({ expr: to }), required_art_refs: art, expected_effects: [E("ExpressionStateReached", `${base.actor_rig_id}.expr`, [last, frames[1]], id), E("ExpressionTransitionTraversed", `${base.actor_rig_id}.expr`, frames, `${id}-t`)] });
const speak = (base, id, frames, cue, art) => cmd({ ...base, id, verb: "speak", frames, target: { kind: "AUDIO_CUE", cue_id: cue }, intent: "speaks", phases: [{ id: "line", frames, goal: "line", expected_owner_effect: "mouth follows the phones" }], required_art_refs: art, expected_effects: [E("VisemeSync", `${base.actor_rig_id}.mouth`, frames, id)] });
/** DIAGNOSTIC phone schedule (labelled; never MFA): phones laid end to end from a lead-in, placed so the clip starts at `frame` */
function diagAlign(cue, rig, frame, seq) { let s = 2400; const phones = [], words = []; for (const [word, ps] of seq) { const w0 = s; for (const [p, n] of ps) { phones.push({ phone: p, file_start_sample: s, file_end_sample: s + n }); s += n; } words.push({ word, file_start_sample: w0, file_end_sample: s }); }
  const sha = crypto.createHash("sha256").update(`DIAGNOSTIC take ${cue}`).digest("hex");
  return { cue: { audio_sha256: sha, alignment_source: "DIAGNOSTIC_FIXTURE", words: words.map((w) => ({ w: w.word, start_s: w.file_start_sample / 48000, end_s: w.file_end_sample / 48000 })), alignment: { schema_version: "1.0.0", cue_id: cue, actor_rig_id: rig, take_id: `DIAG_${cue}`, audio_sha256: sha, sample_rate: 48000, alignment_source: "DIAGNOSTIC_FIXTURE", aligner: { tool: "DIAGNOSTIC_FIXTURE" }, placement: { file_in_sample: 0, timeline_clip_start_sample: frame * 800 }, words, phones } } }; }
// "big smile" (closure B, M; a 300-sample P closure shorter than a frame and off every frame midpoint), "fine then" (FV, TH, NARROW), "oh you" (OH, OO), "lull" (L)
const CUES = () => ({ K1: diagAlign("K1", "kade_rig", 100, [["big", [["B", 2400], ["IH1", 4000], ["G", 2400]]], ["smile", [["S", 3200], ["M", 2400], ["AY1", 6400], ["L", 3200]]], ["up", [["AH1", 3200], ["P", 300]]]]).cue,
  K2: diagAlign("K2", "kade_rig", 240, [["fine", [["F", 3200], ["AY1", 5600], ["N", 2400]]], ["then", [["DH", 2400], ["EH1", 4000], ["N", 2400]]], ["oh", [["OW1", 6400]]], ["you", [["Y", 2400], ["UW1", 5600]]], ["chew", [["CH", 3200], ["UW1", 4000]]]]).cue,
  P1: diagAlign("P1", "pim_rig", 50, [["lull", [["L", 3200], ["AH1", 4000], ["L", 3200]]], ["map", [["M", 2400], ["AE1", 4800], ["P", 2400]]]]).cue });
const TRANS = () => ({ schema_version: "1.0.0", transitions: {
  k_mock_to_grin: { route: "REGISTERED_CELS", anchors: [{ frame: 20, state_id: "neutral" }, { frame: 32, state_id: "mock" }, { frame: 70, state_id: "mock_grin_1" }, { frame: 84, state_id: "grin" }], terminal_hold: true, emotional_context: "mock-regal breaks into a genuine grin" },
  k_grin_to_social: { route: "REGISTERED_CELS", anchors: [{ frame: 230, state_id: "grin" }, { frame: 262, state_id: "slip" }, { frame: 300, state_id: "concern" }, { frame: 330, state_id: "social" }], terminal_hold: true, emotional_context: "smile slips to concern, then a social smile with worried eyes" } } });
const ARTK1 = () => [...new Set(["kade_brows", "kade_brows_mock", "kade_brows_mock_grin_1", "kade_brows_grin"])];
function packet({ art = true } = {}) { const mA = (sid, states) => (art ? states.map((s) => mouthA(sid, s)) : []);
  return { schema_version: "1.1.0", film_id: "p08_characters", fps: 60, total_frames: doc.stage.total_frames, characters: CHARS(), commands: [
    expr(K, "k_mock_to_grin", [20, 100], "neutral", "grin", ARTK1(), 84),
    speak(K, "k_speak_1", [100, 200], "K1", mA("kade", ["SMILE_MBP", "SMILE_EE", "SMILE_NARROW", "SMILE_AA", "SMILE_L", "SMILE_REST"])),
    expr(K, "k_grin_to_social", [230, 360], "grin", "social", ["kade_brows_grin", "kade_brows_slip", "kade_brows_concern", "kade_brows_social"], 330),
    speak(K, "k_speak_2", [240, 330], "K2", mA("kade", ["SMILE_REST", "SMILE_FV", "SMILE_AA", "SMILE_NARROW", "SMILE_TH", "SMILE_EE", "SMILE_OH", "NEUTRAL_OH", "NEUTRAL_NARROW", "NEUTRAL_OO", "NEUTRAL_CHJ", "NEUTRAL_REST", "SMILE_OO", "SMILE_CHJ"])),
    speak(Pm, "p_speak_1", [50, 120], "P1", mA("pim", ["NEUTRAL_L", "NEUTRAL_AA", "NEUTRAL_MBP", "NEUTRAL_REST"])) ] }; }
const planWith = ({ pkt = packet(), cues = CUES(), trans = TRANS(), profiles = PROFILES() } = {}) => ({ ...CF.basePlan(), performance: { packet: pkt, profiles, audio_cues: cues, expression_transitions: trans } });
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, reason: x.human_readable_reason })); } };
const has = (l, code, inv) => l.some((x) => x.code === code && (!inv || x.inv === inv));
// the art closure is machine-derived; first compile reports exactly which mouth drawings each speak needs, then the packet lists exactly those
const closureOf = () => { const Pc = PC.compilePerformance(doc, planWith({ pkt: packet({ art: false }) })); return Object.fromEntries(Pc.errors.filter((e) => e.details?.failed_invariant === "ART_REFS_COVER_CLOSURE" || /needs .*, which require/.test(e.human_readable_reason)).map((e) => [e.record_id, e.human_readable_reason])); };
function exactPacket() { const p = packet({ art: false }), Pc = PC.compilePerformance(doc, planWith({ pkt: p })); for (const c of p.commands) { const need = Pc.errors.filter((e) => e.details?.failed_invariant === "ART_REFS_COVER_CLOSURE" && (e.details?.command_id === c.id || e.human_readable_reason.includes(` ${c.id} `))).map((e) => /needs (\S+),/.exec(e.human_readable_reason)?.[1]).filter(Boolean); c.required_art_refs = [...new Set([...c.required_art_refs, ...need])]; } return p; }
const PKT = exactPacket(), C = compile(planWith({ pkt: PKT })), QA = verifyPerformance(C), res = (cmdId, kind) => QA.results.find((r) => r.command === cmdId && r.kind === kind);
void closureOf;

test("C03-1 visemes: every frame shows the (view, family, viseme) drawing of the phone under its midpoint; sub-frame closure forced visible and reported", () => {
  assert.ok(QA.ok, QA.failures.map((x) => `${x.code} ${x.record_id} ${x.human_readable_reason}`).slice(0, 6).join("\n"));
  for (const id of ["k_speak_1", "k_speak_2", "p_speak_1"]) { const r = res(id, "VisemeSync"); assert.ok(r?.ok && r.frames_checked > 30, `${id}: ${r?.reason} (${r?.frames_checked})`); }
  const M1 = C.performance.commands.find((r) => r.id === "k_speak_1").owners.mouth; assert.equal(M1.route, "VISEME"); assert.equal(M1.inventory.id, SV.VISEME_INVENTORY.id);
  assert.ok(M1.ambiguities.some((a) => a.phone === "P" && a.kind === "CLOSURE_SHORTER_THAN_A_FRAME_FORCED_VISIBLE"), "the 300-sample P closure is forced onto one frame and reported");
  // independent expectation: midpoint sample of frame f → phone (computed here from the schedule, not from the compiler's output)
  const al = CUES().K1.alignment, mid = (f) => f * 800 + 400, ph = (f) => al.phones.find((p) => p.file_start_sample - 0 + 100 * 800 <= mid(f) && mid(f) < p.file_end_sample + 100 * 800);
  for (const f of [104, 106, 110, 116, 125, 133, 140]) { const p = ph(f), want = `SMILE_${p ? SV.visemeOf(p.phone) : "REST"}`; assert.equal(stateAtFrame(C, f).artStates.kade_rig.channels.mouth, want, `f${f} phone ${p?.phone}`); }
});

test("C03-2 the mouth family follows the visible expression mid-line: SMILE while slipping, NEUTRAL on the concerned face, SMILE again on the social smile", () => {
  const M2 = C.performance.commands.find((r) => r.id === "k_speak_2").owners.mouth, famAt = (f) => stateAtFrame(C, f).artStates.kade_rig.channels.mouth.split("_")[0], exAt = (f) => stateAtFrame(C, f).artStates.kade_rig.channels.expr;
  for (const f of [250, 270, 299, 305, 320]) assert.equal(famAt(f), CF.EXPR.find(([e]) => e === exAt(f))[1], `f${f}: ${exAt(f)} face shows ${famAt(f)} mouth`);
  assert.ok(M2.tuples_used.some((t) => t.includes("|NEUTRAL|")) && M2.tuples_used.some((t) => t.includes("|SMILE|")), "both families used (only the used tuples are demanded)");
  assert.ok(!M2.tuples_used.includes("front|NEUTRAL|MBP") && !M2.tuples_used.includes("front|SMILE|L"), "no Cartesian demand: unused tuples are not requested");
});

test("C03-3 negatives: wrong take digest, wrong character cue, OOV phone, word-only aligner, diagnostic schedule in PRODUCTION, LIMITED mouth substituted, shifted/deleted mouth events", () => {
  { const c = CUES(); c.K1.audio_sha256 = "f".repeat(64); assert.ok(has(codes(() => compile(planWith({ pkt: PKT, cues: c }))), "AUDIO_SYNC_MISMATCH", "ALIGNMENT_OF_THIS_TAKE")); }
  { const c = CUES(); c.K1.alignment.actor_rig_id = "pim_rig"; assert.ok(has(codes(() => compile(planWith({ pkt: PKT, cues: c }))), "AUDIO_SYNC_MISMATCH", "CUE_OF_THIS_ACTOR")); }
  { const c = CUES(); c.K1.alignment.phones[1].phone = "XX1"; assert.ok(has(codes(() => compile(planWith({ pkt: PKT, cues: c }))), "MISSING_WORD_ALIGNMENT", "PHONE_IN_INVENTORY")); }
  { const c = CUES(); Object.assign(c.K1.alignment, { alignment_source: "MEASURED", aligner: { tool: "WhisperX", version: "3", acoustic_model: "large-v3", dictionary: "-" } }); assert.ok(has(codes(() => compile(planWith({ pkt: PKT, cues: c }))), "MISSING_WORD_ALIGNMENT", "PHONE_LEVEL_ALIGNER")); }
  { const Pc = PC.compilePerformance(doc, planWith({ pkt: PKT }), { runType: "PRODUCTION" }); assert.ok(Pc.errors.some((e) => e.details?.failed_invariant === "NO_DIAGNOSTIC_ALIGNMENT_IN_PRODUCTION"), "a diagnostic phone schedule can never drive a production mouth"); }
  { const pr = PROFILES(); pr.kade_perf.speech = { route: "LIMITED_LEGACY", limited_mouth_approved: true }; assert.ok(has(codes(() => compile(planWith({ pkt: PKT, profiles: pr }))), "PERFORMANCE_COMMAND_INVALID", "EFFECT_DECLARED"), "a LIMITED rest/mid/open mouth cannot stand in for the measured-viseme line (it can never claim VisemeSync)"); }
  const tamper = (mut) => { const Pc = PC.compilePerformance(doc, planWith({ pkt: PKT })); assert.equal(Pc.errors.length, 0, Pc.errors.map((e) => e.human_readable_reason).join("; ")); const p = clone(Pc.plan), d = clone(Pc.doc); mut(p); const Cx = compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false }); return verifyPerformance({ ...Cx, performance: C.performance }); };
  { const q = tamper((p) => { for (const e of p.__acting_events) if (e.channel === "mouth" && e.rig === "kade_rig" && e.frame >= 100 && e.frame < 200) e.frame += 3; }); assert.ok(q.failures.some((x) => x.record_id === "k_speak_1"), "mouth shifted 3 frames against the phones"); }
  { const q = tamper((p) => { p.__acting_events = p.__acting_events.filter((e) => !(e.channel === "mouth" && /MBP/.test(e.state) && e.rig === "kade_rig")); }); assert.ok(q.failures.some((x) => x.record_id === "k_speak_1"), "closures deleted"); }
});

test("C02 expression transitions: anchored intermediates visible in order; negatives for missing cel, skipped/wrong-order edge, endpoint-only, unordered anchors, morph route, swap producer removed", () => {
  for (const id of ["k_mock_to_grin", "k_grin_to_social"]) { const r = res(id, "ExpressionTransitionTraversed"); assert.ok(r?.ok && r.frames_checked > 50, `${id}: ${r?.reason}`); }
  for (const [f, e] of [[25, "neutral"], [40, "mock"], [75, "mock_grin_1"], [90, "grin"], [270, "slip"], [310, "concern"], [340, "social"]]) assert.equal(stateAtFrame(C, f).artStates.kade_rig.channels.expr, e, `f${f}`);
  const T = (mut) => { const t = TRANS(); mut(t.transitions.k_mock_to_grin); return codes(() => compile(planWith({ pkt: PKT, trans: t }))); };
  assert.ok(has(T((x) => (x.anchors[2].state_id = "mock_grin_X")), "MISSING_ART_ASSET", "INTERMEDIATE_CEL_APPROVED"), "missing middle cel");
  assert.ok(has(T((x) => { const a = x.anchors; [a[1].state_id, a[2].state_id] = [a[2].state_id, a[1].state_id]; }), "UNSUPPORTED_STATE_EDGE", "EXPRESSION_EDGE_APPROVED"), "wrong order");
  assert.ok(has(T((x) => (x.anchors = [x.anchors[0], x.anchors[3]])), "UNSUPPORTED_STATE_EDGE", "EXPRESSION_EDGE_APPROVED"), "endpoint-only jump");
  assert.ok(has(T((x) => (x.anchors[2].frame = 30)), "EXPRESSION_TRANSITION_INVALID", "ANCHORS_ORDERED"));
  assert.ok(has(T((x) => (x.route = "REGISTERED_MORPH")), "PERFORMANCE_CAPABILITY_MISSING", "EXPRESSION_ROUTE_SUPPORTED"), "raster faces cannot morph");
  { const Pc = PC.compilePerformance(doc, planWith({ pkt: PKT })), p = clone(Pc.plan), d = clone(Pc.doc); p.__acting_events = p.__acting_events.filter((e) => !(e.channel === "expr" && e.state === "mock_grin_1"));
    const q = verifyPerformance({ ...compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false }), performance: C.performance }); assert.ok(q.failures.some((x) => x.record_id === "k_mock_to_grin"), "the intermediate swap producer removed → the transition fails on the drawn state"); }
});

test("C04 facial tuple legality: wrong-family mouth, double (baked) mouth, wrong region owner, mouth of another view — all fail on the evaluated frames", () => {
  assert.ok(QA.results.find((r) => r.kind === "FaceComposition" && r.command === "kade_rig")?.ok);
  const tamper = (mutP, mutD = () => {}) => { const Pc = PC.compilePerformance(doc, planWith({ pkt: PKT })), p = clone(Pc.plan), d = clone(Pc.doc); mutP(p, d); mutD(d); return verifyPerformance({ ...compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false }), performance: C.performance }); };
  assert.ok(tamper((p) => p.__acting_events.push({ frame: 310, rig: "kade_rig", channel: "mouth", state: "SMILE_REST", shot: CF.SHOT_IDS[0], source: "tamper", priority: 200 })).failures.some((x) => x.code === "FACE_TUPLE_INVALID" && /requires the NEUTRAL/.test(x.human_readable_reason)), "smile mouth on the concerned face");
  assert.ok(tamper((p) => p.__acting_events.push({ frame: 150, rig: "kade_rig", channel: "expr", state: "laugh_bundled", shot: CF.SHOT_IDS[0], source: "tamper", priority: 200 })).failures.some((x) => x.code === "FACE_TUPLE_INVALID" && /double mouth/.test(x.human_readable_reason)), "baked-mouth expression with a separate mouth");
  assert.ok(tamper(() => {}, (d) => { d.rigs.find((r) => r.id === "kade_rig").face_composition.regions.find((r) => r.role === "MOUTH").slot = "kade_brows"; }).failures.some((x) => x.code === "FACE_TUPLE_INVALID" && /ownership map/.test(x.human_readable_reason)), "region owned by the wrong channel");
  assert.ok(tamper(() => {}, (d) => { d.rigs.find((r) => r.id === "kade_rig").state_channels.find((c) => c.id === "mouth").states.find((s) => s.id === "SMILE_AA").face.view_id = "three_quarter"; }).failures.some((x) => x.code === "FACE_TUPLE_INVALID" && /drawn for view/.test(x.human_readable_reason)), "stale-view mouth");
});

test("C02/C03 real Chrome owner pixels: the bound brow and mouth drawings are the painted ones at measured frames; removing a mouth event changes the mouth pixels", async () => {
  const browser = await launch(), out = isolatedWork("p08_face_render");
  try { const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const count = (png, c, tol = 3) => { let n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) n++; return n; };
    const frames = [40, 75, 106, 125, 310], A = await shoot(C, frames, "face_pos"), ev = {};
    for (const f of frames) { const s = stateAtFrame(C, f).artStates.kade_rig.channels, cm = CF.COL[`kade:mouth:${s.mouth}`], cb = CF.COL[`kade:expr:${s.expr}`]; ev[f] = { mouth: s.mouth, expr: s.expr, mouth_px: count(A[f], cm), brow_px: count(A[f], cb) };
      assert.ok(ev[f].mouth_px > 20, `f${f}: the ${s.mouth} mouth drawing is painted (${ev[f].mouth_px}px)`); assert.ok(ev[f].brow_px > 20, `f${f}: the ${s.expr} brow drawing is painted (${ev[f].brow_px}px)`); }
    const Pc = PC.compilePerformance(doc, planWith({ pkt: PKT })), p = clone(Pc.plan), d = clone(Pc.doc), want = stateAtFrame(C, 125).artStates.kade_rig.channels.mouth; p.__acting_events = p.__acting_events.filter((e) => !(e.channel === "mouth" && e.rig === "kade_rig" && e.state === want));
    const B = await shoot(compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false }), [125], "face_neg"); assert.ok(count(B[125], CF.COL[`kade:mouth:${want}`]) < 5, "the deleted viseme's drawing is gone from the frame");
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, frames: ev }, null, 1));
  } finally { await browser.close(); }
});
