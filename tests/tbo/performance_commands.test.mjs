// P06 reusable performance commands: schema, capability, compile into the EXISTING plan consumers, owner-measured effects on two UNLIKE rigs,
// deliberate producer-deletion negatives through the real consumers, refusals before art, art-state closure, production binding, and real
// Chrome pixels. DIAGNOSTIC fixture only (tests/tbo/performance_fixture.mjs): flat stand-in rasters, TEST_TRUST profiles, a tone-burst cue.
//   node --test tests/tbo/performance_commands.test.mjs
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p06", "subjects");
const { runSubjects } = await import("../p03/subjects_fixture.mjs"), F = await import("./performance_fixture.mjs");
const { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const PC = await import("../../engine/art_bridge/performance_commands.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), { validate } = await import("../../engine/art_bridge/jsonschema.mjs");
const { deriveArtDemands } = await import("../../engine/art_bridge/art_demand.mjs"), { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs");
const rt = await runSubjects(W), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = F.augmentDoc(reg.doc), cue = F.speechCue(path.join(W, "audio")), clone = F.clone;
const plan0 = (pkt = F.packet(doc), o = {}) => F.planWith(doc, pkt, o.cue === undefined ? cue : o.cue, o);
const compile = (plan, ctx = {}) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false, ...ctx });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, rec: x.record_id, reason: x.human_readable_reason, d: x.details })); } };
const has = (list, code, inv) => list.some((x) => x.code === code && (!inv || x.inv === inv));
const C = compile(plan0()), QA = verifyPerformance(C), res = (id, kind) => QA.results.find((r) => r.command === id && (!kind || r.kind === kind));
/** delete/alter a producer AFTER the approved compile (the report stays), then measure through the same consumers */
const tamper = (mut) => { const Pc = PC.compilePerformance(doc, plan0()); assert.equal(Pc.errors.length, 0); const p = clone(Pc.plan), d = clone(Pc.doc); mut(p, d); return verifyPerformance(compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false })); };
const pk = (mut) => { const p = F.packet(doc); mut(p); return p; };

test("P06-S1 schema: the P06 draft validates under the strict validator; if/then, items:false and unknown verbs are enforced", () => {
  assert.equal(fs.readFileSync(PC.SCHEMA_FILE, "utf8"), fs.readFileSync(path.join(REPO, "docs", "the-better-one", "PERFORMANCE_COMMAND_SCHEMA_V1.json"), "utf8"), "engine schema is a byte copy of the P06 draft");
  assert.deepEqual(validate(PC.SCHEMA, F.packet(doc)), []);
  const noTarget = pk((p) => delete p.commands.find((c) => c.verb === "look_at").target); assert.ok(validate(PC.SCHEMA, noTarget).some((e) => /missing required "target"/.test(e.msg)), "allOf/if/then: look_at requires a target");
  const badSpeak = pk((p) => (p.commands.find((c) => c.verb === "speak").target = { kind: "WORLD_POINT", xy: [0, 0], space: "WORLD_CSS_PX" })); assert.ok(validate(PC.SCHEMA, badSpeak).length > 0, "speak target must be an AUDIO_CUE");
  const verb = pk((p) => (p.commands[0].verb = "dance")); assert.ok(validate(PC.SCHEMA, verb).length > 0);
  assert.ok(validate({ prefixItems: [{ type: "integer" }], items: false }, [1, 2]).length === 1, "items:false forbids extra items (was silently ignored before P06)");
  assert.ok(has(codes(() => compile(plan0(verb))), "PERFORMANCE_COMMAND_INVALID", "SCHEMA_V1"), "the compile path refuses a schema-invalid packet");
});
test("P06-S2 capability profiles come from the measured rigs: an unlike biped and creature get different, reasoned command sets", () => {
  const n = C.performance.capability_profiles.nova_rig, l = C.performance.capability_profiles.lumen_rig;
  assert.equal(n.topology_kind, "BIPED"); assert.equal(l.topology_kind, "NONHUMAN"); assert.deepEqual(n.hands, ["r"]); assert.deepEqual(l.hands, []);
  for (const v of ["look_at", "blink", "speak", "reach", "grip", "release", "react", "point", "idle", "hold"]) assert.ok(n.supported_commands.includes(v), `nova supports ${v}`);
  for (const v of ["look_at", "blink", "turn_head", "idle", "hold"]) assert.ok(l.supported_commands.includes(v), `lumen supports ${v}`);
  for (const v of ["speak", "reach", "grip", "release", "point", "walk", "react"]) assert.ok(l.refused_commands[v]?.length, `lumen refuses ${v} with a reason`);
  assert.ok(n.refused_commands.turn_body.some((m) => /view cels/.test(m)), "no approved body view cels → turn_body refused before art");
  assert.ok(/topology NONHUMAN/.test(l.refused_commands.walk.join(" ")));
  assert.deepEqual(n.legal_angles.head, [-35, 35], "limits are the rig's measured limits");
});
test("P06-C1 the same verbs compile onto each rig's OWN parts, states and profile, into the existing plan surfaces (no second timeline)", () => {
  const plan = C.plan; assert.ok(Array.isArray(plan.__gaze["nova_rig.head"]) && Array.isArray(plan.__gaze["lumen_rig.head"]) && Array.isArray(plan.__gaze["lumen_rig.neck2"]));
  assert.equal(plan.__gaze["nova_rig.head"][0].max_deg, 20); assert.equal(plan.__gaze["lumen_rig.head"][0].max_deg, 30); assert.equal(plan.__gaze["lumen_rig.neck2"][0].max_deg, 25, "turn_head uses the profile's rigid-turn limit");
  const evs = plan.__acting_events.filter((e) => e.source.startsWith("command:")); assert.ok(evs.some((e) => e.rig === "nova_rig" && e.channel === "eyes" && e.state === "closed" && e.frame === 40)); assert.ok(evs.some((e) => e.rig === "lumen_rig" && e.channel === "eye" && e.state === "closed" && e.frame === 330), "the same blink verb drives lumen's single eye channel");
  const grip = C.actions.find((a) => a.id === "nova_pull_lever").contact_events.find((k) => k.source_command === "n_grip"); assert.deepEqual([grip.start_frame, grip.end_frame], [70, 190], "the grip contact lasts until the matching release command");
  assert.deepEqual(plan.reaches["nova_pull_lever:nova_grip@70"], { approach: [40, 70], orient: "WORLD", release: [190, 220] });
  assert.ok(plan.tracks.nova_rig.joints.chest.length >= 6, "reach anticipation + reaction beat own the chest in disjoint windows"); assert.ok(plan.__additive["nova_rig.chest"][0].frames && plan.__additive["lumen_rig.body"][0].frames, "idle breathing is windowed");
  assert.equal(C.channelEvents.get("nova_rig").filter((e) => String(e.source).startsWith("command:")).length, evs.filter((e) => e.rig === "nova_rig").length, "the existing channel consumer received every command swap");
  assert.ok(C.performance.packet_sha256 && C.performance.schema_sha256 && C.performance.commands.length === 14);
  const again = PC.compilePerformance(doc, plan0()); assert.deepEqual(again.plan, PC.compilePerformance(doc, plan0()).plan, "deterministic"); assert.ok(!doc.actions.find((a) => a.id === "nova_pull_lever").contact_events.some((k) => k.source_command), "pure: the input doc is not mutated");
});
test("P06-Q1 every declared effect is met on its owner, on every frame, on both unlike rigs (positives)", () => {
  assert.ok(QA.ok, QA.failures.map((f) => f.human_readable_reason).join("\n")); assert.equal(QA.results.length, 14);
  for (const r of QA.results) assert.ok(r.frames_checked > 0, `${r.test_id} checked frames`);
  assert.equal(res("n_grip").measurement.held_frames, 20); assert.ok(res("n_reach").measurement.start_px > 100 && res("n_reach").measurement.contact_px < 1.5);
  assert.ok(res("n_release").measurement.after_px > 50); assert.ok(res("n_react").measurement.body_beat_deg < -4); assert.equal(res("n_speak").measurement.phoneme_accurate, false, "limited mouth is labelled, never claimed as phoneme sync");
  assert.ok(QA.human_review_pending.length === 14, "every effect leaves a human playback check pending: QA never declares acting good");
  const lumenBlink = res("l_blink"), novaBlink = res("n_blink"); assert.ok(lumenBlink.ok && novaBlink.ok, "an isolated single-owner blink is valid (no multi-owner phrase rule applies)");
});
test("P06-N1 negatives: deleting or corrupting each producer after compile fails the named owner effect", () => {
  const gaze = tamper((p) => { delete p.__gaze["nova_rig.head"]; p.cameras.cam_a.rot = [[0, 0], [60, 6]]; }); assert.ok(gaze.results.find((r) => r.command === "n_look" && !r.ok && /aim error/.test(r.reason)), "camera rotation without head motion fails the gaze");
  const blink = tamper((p) => { p.__acting_events = p.__acting_events.filter((e) => !(e.source === "command:n_blink" && e.state === "closed")); }); assert.ok(!blink.results.find((r) => r.command === "n_blink").ok);
  const grip = tamper((p) => { p.__acting_events.push({ frame: 85, rig: "nova_rig", channel: "hand_r", state: "open", shot: "p03_shot_a", source: "command:injected", priority: 100 }, { frame: 86, rig: "nova_rig", channel: "hand_r", state: "grip", shot: "p03_shot_a", source: "command:injected", priority: 100 }, { frame: 130, rig: "nova_rig", channel: "hand_r", state: "open", shot: "p03_shot_a", source: "command:injected", priority: 100 }, { frame: 131, rig: "nova_rig", channel: "hand_r", state: "grip", shot: "p03_shot_a", source: "command:injected", priority: 100 }); });
  assert.ok(grip.results.find((r) => r.command === "n_grip" && !r.ok && /frame 85: HAND/.test(r.reason)), "one open-hand frame inside the grip fails it"); assert.ok(grip.results.find((r) => r.command === "n_hold" && !r.ok && /frame 130: hand_r=open breaks the hold/.test(r.reason)), "first and last frames right but a middle frame broken fails the hold");
  const breath = tamper((p) => { p.__additive["nova_rig.chest"][0].amp = 12; }); assert.ok(breath.results.find((r) => r.command === "n_idle" && !r.ok), "breathing beyond the approved amplitude fails declared stillness");
  const stuck = tamper((p, d) => { d.actions.find((a) => a.id === "nova_pull_lever").contact_events.find((k) => k.source_command === "n_grip").end_frame = 222; }); assert.ok(stuck.results.find((r) => r.command === "n_release" && !r.ok && /still locked/.test(r.reason)), "prop stuck to the hand fails the release");
  const late = tamper((p) => { for (const e of p.__acting_events) if (e.source === "command:n_speak") e.frame += 25; }); assert.ok(!late.results.find((r) => r.command === "n_speak").ok, "mouth schedule from a misplaced line fails speech sync");
  const Pa = PC.compilePerformance(doc, plan0()), Pb = PC.compilePerformance(doc, plan0(pk((p) => { const c = p.commands.find((x) => x.id === "n_react"); c.intent = "quietly pleased"; c.required_art_refs = ["nova_brow_neutral"]; })));
  const swapped = clone(Pa.plan); swapped.__performance = Pb.report; const sw = verifyPerformance(compileMotionTracks(Pa.doc.actions, Pa.doc.shots, { doc: Pa.doc, plan: swapped, requireApproval: false }));
  assert.ok(sw.results.find((r) => r.command === "n_react" && !r.ok && /quietly pleased/.test(r.reason)), "a swapped reaction intent with unchanged expression pixels fails");
  const flip = tamper((p) => { for (const g of p.__gaze["lumen_rig.neck2"]) g.forward_deg += 40; }); assert.ok(!flip.results.find((r) => r.command === "l_turn").ok, "the creature's turn is measured on its own neck, not on a biped template");
});
test("P06-N2 refusals BEFORE art: missing producers, cels, approvals, profiles and conflicts are typed with the P06 fields", () => {
  const walk = codes(() => compile(plan0(pk((p) => p.commands.push(F.cmd({ actor_rig_id: "nova_rig", character_profile_id: "nova_perf", action_id: "nova_pull_lever", id: "n_walk", verb: "walk", frames: [230, 240], target: { kind: "WORLD_POINT", xy: [700, 520], space: "WORLD_CSS_PX" }, intent: "steps", phases: [{ id: "cycle", frames: [230, 240], goal: "walk", expected_owner_effect: "steps" }], motion_routes: ["PART_RIG_2D"], expected_effects: [{ kind: "PlantedFootStable", owner_id: "nova_rig", frames: [230, 240], test_id: "W", human_quality_check: "feet" }] }))))));
  assert.ok(has(walk, "PERFORMANCE_CAPABILITY_MISSING", "ROUTE_HAS_PRODUCER")); const w = walk.find((x) => x.inv === "ROUTE_HAS_PRODUCER").d; for (const k of ["action_id", "command_id", "owner", "frame_range", "failed_invariant", "earliest_producer", "needed_art_or_capability", "user_approval_needed"]) assert.ok(k in w, `refusal carries ${k}`);
  const view = codes(() => compile(plan0(pk((p) => { const c = p.commands.find((x) => x.id === "l_turn"); c.required_prestate.view_id = "side"; c.required_poststate.view_id = "front"; })))); assert.ok(has(view, "PERFORMANCE_CAPABILITY_MISSING", "VIEW_CHANGE_NEEDS_CEL"), "a view change on a rigid route would rotate a flat drawing: refused");
  const lumenGrip = codes(() => compile(plan0(pk((p) => p.commands.push({ ...clone(p.commands.find((c) => c.id === "n_grip")), id: "l_grip", actor_rig_id: "lumen_rig", character_profile_id: "lumen_perf", action_id: "lumen_watch", frames: [430, 450], phases: [{ id: "close", frames: [430, 450], goal: "grab", expected_owner_effect: "n/a" }], expected_effects: [{ kind: "PaintedGripMaintained", owner_id: "lumen_rig", frames: [430, 450], test_id: "LG", human_quality_check: "n/a" }], required_poststate: { channel_states: {}, possession: {} }, motion_routes: ["PART_RIG_2D"] })))));
  assert.ok(has(lumenGrip, "PERFORMANCE_CAPABILITY_MISSING", "RIG_SUPPORTS_VERB"), "a limbless creature cannot grip");
  const noIntent = codes(() => compile(plan0(pk((p) => (p.commands.find((c) => c.id === "n_react").intent = "furious"))))); assert.ok(has(noIntent, "PERFORMANCE_PROFILE_INVALID", "INTENT_IN_PROFILE") && noIntent.find((x) => x.inv === "INTENT_IN_PROFILE").d.user_approval_needed);
  const noMouth = clone(F.PROFILES); noMouth.nova_perf.speech.limited_mouth_approved = false; assert.ok(has(codes(() => compile(plan0(undefined, { profiles: noMouth }))), "PERFORMANCE_PROFILE_INVALID", "LIMITED_MOUTH_APPROVED"));
  const est = { ...cue, alignment_source: "ESTIMATED" }; assert.ok(has(codes(() => compile(plan0(undefined, { cue: est }))), "MISSING_WORD_ALIGNMENT")); assert.ok(has(codes(() => compile(plan0(undefined, { cue: null }))), "AUDIO_INPUT_MISSING"));
  const twoLooks = codes(() => compile(plan0(pk((p) => p.commands.push({ ...clone(p.commands.find((c) => c.id === "n_look")), id: "n_look2", frames: [55, 70], phases: [{ id: "acquire", frames: [55, 70], goal: "n/a", expected_owner_effect: "n/a" }], expected_effects: [{ kind: "GazeTowardTarget", owner_id: "nova_rig.head", frames: [55, 70], test_id: "L2", human_quality_check: "n/a" }] })))));
  assert.ok(has(twoLooks, "INVALID_TRANSFORM_OWNER", "ONE_AIM_PER_INSTANT"), "no last-writer-wins on an aim");
  const authored = plan0(); authored.tracks = { nova_rig: { joints: { chest: [[0, 0], [100, 4]] } } }; assert.ok(has(codes(() => compile(authored)), "INVALID_TRANSFORM_OWNER", "COMMAND_OWNS_JOINT"));
  assert.ok(has(codes(() => compile(plan0(), { packetDigest: "0".repeat(64) })), "STALE_DEPENDENCY", "SOURCE_DIGEST_CURRENT"));
  assert.ok(has(codes(() => compile(plan0(pk((p) => (p.characters[0].master_sha = "1".repeat(64)))))), "STALE_DEPENDENCY", "MASTER_SHA_MATCHES"));
  assert.ok(has(codes(() => compile(plan0(pk((p) => (p.commands.find((c) => c.id === "n_look").phases[1].frames = [26, 50]))))), "PERFORMANCE_COMMAND_INVALID", "PHASES_TILE_COMMAND"));
  assert.ok(has(codes(() => compile(plan0(pk((p) => (p.commands.find((c) => c.id === "n_blink").required_art_refs = []))))), "MISSING_ART_ASSET", "ART_REFS_COVER_CLOSURE"), "the packet must list the machine-derived art closure");
  const angry = codes(() => compile(plan0(pk((p) => p.commands.push(F.cmd({ actor_rig_id: "nova_rig", character_profile_id: "nova_perf", action_id: "nova_pull_lever", id: "n_angry", verb: "change_expression", frames: [238, 240], intent: "frowns", phases: [{ id: "change", frames: [238, 240], goal: "frown", expected_owner_effect: "brows down" }], motion_routes: ["APPROVED_CELS"], required_poststate: { channel_states: { brows: "angry" }, possession: {} }, expected_effects: [{ kind: "ExpressionStateReached", owner_id: "nova_rig.brows", frames: [238, 240], test_id: "EX", human_quality_check: "n/a" }] }))))));
  assert.ok(has(angry, "MISSING_ART_ASSET", "EXPRESSION_CEL_APPROVED"));
  const prod = codes(() => compile(plan0(), { runType: "PRODUCTION" })); assert.ok(has(prod, "PERFORMANCE_PROFILE_INVALID", "PROFILE_APPROVAL") && has(prod, "STALE_DEPENDENCY", "SOURCE_DIGEST_BOUND") && has(prod, "DIRECTION_APPROVAL_REQUIRED", "DECISIONS_BOUND"), "production refuses TEST_TRUST profiles and unbound commands");
  const reachFar = pk((p) => { for (const id of ["n_reach", "n_grip", "n_release"]) p.commands.find((c) => c.id === id).target = { kind: "WORLD_POINT", xy: [905, 180], space: "WORLD_CSS_PX" }; p.commands.find((c) => c.id === "n_grip").required_poststate.possession = {}; p.commands = p.commands.filter((c) => c.id !== "n_hold"); p.commands.find((c) => c.id === "n_release").required_prestate.possession = {}; p.commands.find((c) => c.id === "n_release").required_poststate.possession = {}; });
  const rf = verifyPerformance(compile(plan0(reachFar))); assert.ok(rf.results.find((r) => r.command === "n_reach" && !r.ok), "a target the measured arm cannot reach fails the reach (no stretched limb)"); assert.ok(rf.results.find((r) => r.command === "n_grip" && !r.ok), "and the grip is never claimed");
  const far = codes(() => compile(plan0(pk((p) => (p.commands.find((c) => c.id === "l_turn").target.xy = [620, 200]))))); assert.equal(far.length, 0); const farQA = verifyPerformance(compile(plan0(pk((p) => (p.commands.find((c) => c.id === "l_turn").target.xy = [620, 200])))));
  assert.ok(farQA.results.find((r) => r.command === "l_turn" && !r.ok && /bounded by max 25/.test(r.reason)), "a turn beyond the approved rigid limit fails and names the view-cel remedy");
});
test("P06-A1 pre-art closure: the command demands reach the production art-demand pass with their consumers", () => {
  const d = deriveArtDemands({ doc, plan: { assets: doc.assets.map((a) => ({ asset_id: a.id })) }, motionPlans: { _film: plan0() } }), by = (id) => d.demands.find((x) => x.asset === id);
  for (const id of ["nova_eye_closed", "nova_mouth_open", "nova_hand_grip", "nova_brow_raised", "lumen_eye_closed"]) assert.ok(by(id)?.why.some((w) => /^(blink|speak|grip|react) /.test(w)), `${id} demanded by a command`);
  const turn = PC.performanceArtClosure(doc, plan0(pk((p) => p.commands.push(F.cmd({ actor_rig_id: "nova_rig", character_profile_id: "nova_perf", action_id: "nova_pull_lever", id: "n_turnbody", verb: "turn_body", frames: [230, 240], intent: "turns to camera", phases: [{ id: "turn", frames: [230, 240], goal: "turn", expected_owner_effect: "3/4 view" }], motion_routes: ["APPROVED_CELS"], required_prestate: { channel_states: {}, possession: {}, view_id: "front" }, required_poststate: { channel_states: {}, possession: {}, view_id: "three_quarter" }, expected_effects: [{ kind: "ApprovedBodyTurn", owner_id: "nova_rig", frames: [230, 240], test_id: "TB", human_quality_check: "n/a" }] })))));
  assert.ok(turn.errors.some((e) => e.details?.failed_invariant === "VIEW_EDGE_APPROVED") && turn.missing.some((m) => m.asset === "nova_rig::view.three_quarter"), "a missing view cel becomes an exact ArtJob request, not a mirrored drawing");
});
test("P06-P1 point (stand-in pose cel) aims the arm at its target; a reversed aim fails", () => {
  const pkt = F.packet(doc); pkt.commands = pkt.commands.filter((c) => c.actor_rig_id === "lumen_rig" || c.id === "n_idle");
  pkt.commands.push(F.cmd({ actor_rig_id: "nova_rig", character_profile_id: "nova_perf", action_id: "nova_pull_lever", id: "n_point", verb: "point", frames: [100, 160], target: { kind: "WORLD_POINT", xy: [780, 300], space: "WORLD_CSS_PX" }, intent: "points out the window", phases: [{ id: "raise", frames: [100, 115], goal: "raise arm", expected_owner_effect: "arm aims" }, { id: "hold", frames: [115, 150], goal: "hold", expected_owner_effect: "held" }, { id: "lower", frames: [150, 160], goal: "lower", expected_owner_effect: "returns" }], motion_routes: ["PART_RIG_2D"], required_art_refs: ["nova_hand_grip", "nova_hand_open"], expected_effects: [{ kind: "ApprovedPointerAligned", owner_id: "nova_rig.shoulder_r", frames: [115, 150], test_id: "P06-N-POINT", human_quality_check: "stand-in fist: mechanics only" }] }));
  const Cp = compile(plan0(pkt)), q = verifyPerformance(Cp); assert.ok(q.results.find((r) => r.command === "n_point").ok, q.failures.map((f) => f.human_readable_reason).join("\n"));
  const Pc = PC.compilePerformance(doc, plan0(pkt)), p2 = clone(Pc.plan); for (const g of p2.__gaze["nova_rig.shoulder_r"]) g.forward_deg += 180; const q2 = verifyPerformance(compileMotionTracks(Pc.doc.actions, Pc.doc.shots, { doc: Pc.doc, plan: p2, requireApproval: false }));
  assert.ok(q2.results.find((r) => r.command === "n_point" && !r.ok && /arm points/.test(r.reason)));
});
test("P06-R1 real Chrome pixels: each command changes its OWN drawing on screen; deleting the producer removes it", async () => {
  const browser = await launch(), out = path.join(REPO, "hybrid_v2", "work", "p06", "render");
  try {
    const shoot = async (Cx, shot, frames, name) => { const scene = composeShot(doc.shots[shot], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const count = (png, c, tol = 4) => { let n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) n++; return n; };
    const centroid = (png, c, tol = 4) => { let x = 0, y = 0, n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) { const k = i / 4; x += k % png.width; y += Math.floor(k / png.width); n++; } return [x / n, y / n, n]; };
    const COL = { eyeClosed: [200, 140, 110], eyeOpen: [250, 250, 245], mouthOpen: [120, 40, 50], grip: [225, 170, 130], head: [235, 190, 150], lumenClosed: [80, 130, 100], lumenOpen: [245, 235, 120] };
    const A = await shoot(C, 0, [5, 44, 50, 85, 130, 110], "p06_pos_a");
    assert.ok(count(A[44], COL.eyeClosed) > 20 && count(A[44], COL.eyeOpen) < 10, "blink frame shows the closed-eye drawing"); assert.ok(count(A[50], COL.eyeOpen) > 50, "eyes reopen");
    assert.ok(count(A[85], COL.grip) > 200 && count(A[130], COL.grip) > 200, "closed-hand drawing visible inside the grip and the hold"); assert.ok(count(A[5], COL.grip) < 10, "and absent before the grip (anti-aliased edge pixels only)");
    assert.ok(count(A[110], COL.mouthOpen) > 20 && count(A[5], COL.mouthOpen) < 10, "measured word frame shows the open mouth");
    const Pc = PC.compilePerformance(doc, plan0()), pN = clone(Pc.plan); pN.__acting_events = pN.__acting_events.filter((e) => !["command:n_blink", "command:n_grip"].includes(e.source)); delete pN.__gaze["nova_rig.head"];
    const CN = compileMotionTracks(Pc.doc.actions, Pc.doc.shots, { doc: Pc.doc, plan: pN, requireApproval: false }), B = await shoot(CN, 0, [44, 85, 40], "p06_neg_a");
    assert.ok(count(B[44], COL.eyeClosed) < 10, "producer deleted → no closed eye on screen"); assert.ok(count(B[85], COL.grip) < 10, "producer deleted → open hand while 'held'");
    const A40 = (await shoot(C, 0, [40], "p06_pos_a40"))[40], hp = centroid(A40, COL.head), hn = centroid(B[40], COL.head); assert.ok(Math.hypot(hp[0] - hn[0], hp[1] - hn[1]) > 1.5, `the gaze moves the head drawing on screen (${hp.map((v) => v.toFixed(1))} vs ${hn.map((v) => v.toFixed(1))})`);
    const L = await shoot(C, 1, [334, 345], "p06_pos_b"); assert.ok(count(L[334], COL.lumenClosed) > 20 && count(L[334], COL.lumenOpen) < 10 && count(L[345], COL.lumenOpen) > 50, "the creature's own eye drawing blinks");
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, note: "DIAGNOSTIC fixture rasters; proves command→owner pixels mechanics only", head_centroid: { with_gaze: hp, gaze_deleted: hn }, counts: { blink44: count(A[44], COL.eyeClosed), grip85: count(A[85], COL.grip), grip130: count(A[130], COL.grip), mouth110: count(A[110], COL.mouthOpen), neg_blink44: count(B[44], COL.eyeClosed), neg_grip85: count(B[85], COL.grip), lumen334: count(L[334], COL.lumenClosed) } }, null, 1));
  } finally { await browser.close(); }
});
