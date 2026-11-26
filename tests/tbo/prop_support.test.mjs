// P07 shared prop support: several hands (one actor or two unlike actors) and fixed surfaces support one prop; exactly ONE authoritative driver
// per frame; explicit transfer only when the incoming support is already valid; releases let go of the RELEASER only. Every check runs through the
// real chain (PerformanceCommand → compilePerformance → contact solver → stateAtFrame → performance QA → Chrome pixels).
// DIAGNOSTIC fixture only (tests/tbo/support_fixture.mjs): flat stand-in rasters registered through the real intake, TEST_TRUST approvals.
//   node --test tests/tbo/prop_support.test.mjs
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const F = await import("./support_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const PC = await import("../../engine/art_bridge/performance_commands.mjs"), PS = await import("../../engine/art_bridge/prop_support.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs"), { validate } = await import("../../engine/art_bridge/jsonschema.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs");
const { rt } = await F.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = F.clone;
const plan0 = (o = {}) => F.planWith(doc, o);
const compile = (plan) => compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.details?.failed_invariant ?? x.failed_invariant, rec: x.record_id, reason: x.human_readable_reason })); } };
const has = (list, code, inv) => list.some((x) => x.code === code && (!inv || x.inv === inv));
const pk = (mut) => { const p = F.packet(doc); mut(p); return p; };
const ct = (mut) => { const c = F.supportContract(); mut(c); return c; };
const prop = (c, id) => c.props.find((p) => p.id === id);
const C = compile(plan0()), QA = verifyPerformance(C), contract = (id) => QA.results.find((r) => r.kind === "PropSupportContract" && r.command === id);
/** alter a producer AFTER the approved compile, then measure through the same consumers */
const tamper = (mut) => { const Pc = PC.compilePerformance(doc, plan0()); assert.equal(Pc.errors.length, 0); const p = clone(Pc.plan), d = clone(Pc.doc); mut(p, d); return { C: compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false }), p, d }; };
const sup = (f, id) => stateAtFrame(C, f).prop_support.find((r) => r.prop === id);

test("P07-S1 schema + positive: two unlike rigs, three props, every frame of every contract and every command effect passes", () => {
  assert.deepEqual(validate(PS.SCHEMA, F.supportContract()), []);
  assert.ok(validate(PS.SCHEMA, ct((c) => (c.props[0].authority[0].driver = "nobody"))).length > 0, "a driver must be rig#hand or surface:<id>");
  assert.ok(QA.ok, QA.failures.map((x) => x.human_readable_reason).join("\n"));
  for (const id of ["award_standin", "report_standin", "drum"]) { const r = contract(id), p = C.propSupport.find((x) => x.id === id); assert.ok(r.ok, `${id}: ${r.reason}`); assert.equal(r.frames_checked, p.span[1] - p.span[0], `${id}: every frame of the span is evaluated`); }
  const tr = (id) => contract(id).measurement.transfers;
  assert.deepEqual(tr("report_standin").map((t) => [t.frame, t.from, t.to, t.incoming_valid_before]), [[356, "orsa_rig#a", "tova_rig#r", true]], "creature → biped hand-over at the contract frame, incoming hand valid before");
  assert.deepEqual(tr("award_standin").map((t) => [t.frame, t.from, t.to]), [[276, "tova_rig#r", "surface:bench"]]);
  assert.deepEqual(tr("drum").map((t) => [t.frame, t.from, t.to]), [[690, "orsa_rig#a", "surface:floor"]], "the creature's two claws hand the drum to the floor point");
  assert.ok(contract("report_standin").measurement.max_step_px <= 4 && contract("award_standin").measurement.max_surface_drift_px <= 0.5);
  // the P06 release semantics bug: the giver's release passes while the receiver keeps holding (it used to require global unownership)
  const rel = QA.results.find((r) => r.command === "o_release_card"); assert.ok(rel.ok, rel.reason); assert.ok(rel.measurement.after_px > rel.measurement.at_release_px + 2, "the giver's claw separates from the card");
  for (const id of ["t_grip_l", "t_grip_r", "t_grip_card", "o_grip_card", "o_grip_drum_a", "o_grip_drum_b", "t_release_r", "t_release_l", "o_release_drum_b", "o_release_drum_a", "t_hold_card", "t_reach_card"]) assert.ok(QA.results.find((r) => r.command === id)?.ok, id);
  assert.equal(C.performance.prop_support.length, 3);
});

test("P07-E01 V0.4 frame values on the stand-in rigs: award two-hand setdown and report hand-over at the exact directed instants", () => {
  // award: both hands at f180; base first touches at f264 (not before); counter carries it from f276; right free f286; left free f300; settled after
  const a = (f) => sup(f, "award_standin");
  assert.deepEqual(a(180).valid_supporters.sort(), ["tova_rig#l", "tova_rig#r"], "f180: both hands securely support it");
  assert.ok(!a(263).valid_supporters.includes("surface:bench") && a(264).valid_supporters.includes("surface:bench"), "f264: the base first contacts the counter");
  assert.equal(a(275).driver, "tova_rig#r"); assert.equal(a(276).driver, "surface:bench", "f276: the counter fully supports it");
  const locked = (f, sock) => stateAtFrame(C, f).contacts.some((k) => k.socket === sock && (k.locked || k.w > 0));
  assert.ok(locked(285, "tova_palm_r") && !locked(286, "tova_palm_r"), "f286: right hand free");
  assert.ok(locked(299, "tova_palm_l") && !locked(300, "tova_palm_l"), "f300: left hand free");
  const r276 = a(276).root_xy, r479 = a(479).root_xy; assert.ok(Math.hypot(r479[0] - r276[0], r479[1] - r276[1]) < 1e-6, "the award stays settled after both releases");
  // report: lead before f338; first touch f338; secure f348; both [348,356); authority transfers at f356; lead clear by f368; Mia alone afterward
  const r = (f) => sup(f, "report_standin"), contactOn = (f, sock) => stateAtFrame(C, f).contacts.find((k) => k.socket === sock && k.locked);
  for (const f of [180, 300, 337]) assert.deepEqual(r(f).valid_supporters, ["orsa_rig#a"], `f${f}: only the lead stand-in holds it`);
  assert.ok(!contactOn(337, "tova_palm_r") && contactOn(338, "tova_palm_r"), "f338: first contact");
  assert.ok(r(348).valid_supporters.includes("tova_rig#r"), "f348: secure");
  for (let f = 348; f < 356; f++) assert.deepEqual(r(f).valid_supporters.sort(), ["orsa_rig#a", "tova_rig#r"], `f${f}: both actors support it`);
  assert.equal(r(355).driver, "orsa_rig#a"); assert.equal(r(356).driver, "tova_rig#r", "f356: authority transfers");
  assert.ok(!stateAtFrame(C, 368).contacts.some((k) => k.socket === "orsa_claw_a" && (k.locked || k.w > 0)), "f368: the lead stand-in is clear");
  for (const f of [368, 404, 479]) assert.deepEqual(r(f).valid_supporters, ["tova_rig#r"], `f${f}: Mia stand-in alone`);
});

test("P07-N1 compile-time typed refusals: removed support, conflicting drivers, gap, premature release, early transfer, wrong socket, missing painted hand, no contract", () => {
  const noLeft = pk((p) => (p.commands = p.commands.filter((c) => !["t_grip_l", "t_release_l"].includes(c.id))));
  assert.ok(has(codes(() => compile(plan0({ pkt: noLeft }))), "PROP_SUPPORT_MISSING", "REQUIRED_SUPPORT_PRESENT"), "one support removed");
  assert.ok(has(codes(() => compile(plan0({ support: ct((c) => (prop(c, "report_standin").authority[1].frames = [340, 356])) }))), "PROP_DRIVER_CONFLICT", "ONE_DRIVER_PER_INSTANT"), "two drivers at once");
  const pl = F.basePlan(); pl.tracks.slab_rig.root.y.push([320, 70, "sine.inOut"]); assert.ok(has(codes(() => compile(plan0({ plan: pl }))), "PROP_DRIVER_CONFLICT", "SURFACE_IS_SOLE_WRITER"), "the authored track still moves the prop while the counter drives it");
  assert.ok(has(codes(() => compile(plan0({ support: ct((c) => (prop(c, "report_standin").authority[1].frames = [349, 356])) }))), "PROP_UNSUPPORTED_GAP", "SUPPORT_SPAN_GAP_FREE"), "unsupported gap");
  const early = pk((p) => { const r = p.commands.find((c) => c.id === "o_release_card"); r.frames = [350, 362]; r.phases = [{ ...r.phases[0], frames: [350, 356] }, { ...r.phases[1], frames: [356, 362] }]; r.expected_effects[0].frames = [350, 362]; });
  assert.ok(has(codes(() => compile(plan0({ pkt: early }))), "PROP_DRIVER_RELEASED_EARLY", "DRIVER_HOLDS_ITS_INTERVAL"), "premature release by the driver");
  const late = pk((p) => { const a = p.commands.find((c) => c.id === "t_reach_card"); a.frames = [300, 356]; a.phases[0].frames = [300, 356]; a.expected_effects[0].frames = [300, 356]; const g = p.commands.find((c) => c.id === "t_grip_card"); g.frames = [356, 480]; g.phases = [{ ...g.phases[0], frames: [356, 366] }, { ...g.phases[1], frames: [366, 480] }]; g.expected_effects[0].frames = [356, 480]; });
  const lateC = codes(() => compile(plan0({ pkt: late }))); assert.ok(has(lateC, "PROP_TRANSFER_INVALID", "INCOMING_SUPPORT_VALID_BEFORE_TRANSFER"), "support transferred before the new support is physically valid");
  const wrong = pk((p) => (p.commands.find((c) => c.id === "t_grip_card").required_poststate.possession = { card: "tova_rig#r" }));
  assert.ok(has(codes(() => compile(plan0({ pkt: wrong, support: ct((c) => (prop(c, "report_standin").hands[1].prop_socket = "card_edge_giver")) }))), "PROP_CONTACT_TARGET_INCONSISTENT", "HAND_ON_ITS_BOUND_SOCKET"), "inconsistent contact target");
  const noPaint = pk((p) => delete p.characters[0].role_map["hand.r.closed_state"]);
  assert.ok(has(codes(() => compile(plan0({ pkt: noPaint }))), "MISSING_ART_ASSET", "PAINTED_HAND_EXISTS"), "a supporting hand without an approved closed drawing");
  // no contract: hands named the legacy (P06) way so the contacts exist; two holders on one prop then have no single transform owner
  const hinted = pk((p) => { const H = { t_grip_l: ["slab", "tova_rig#l"], t_release_l: ["slab", "tova_rig#l"], t_grip_r: ["slab", "tova_rig#r"], t_release_r: ["slab", "tova_rig#r"], t_reach_card: ["card", "tova_rig#r"], t_grip_card: ["card", "tova_rig#r"], o_grip_drum_a: ["drum", "orsa_rig#a"], o_release_drum_a: ["drum", "orsa_rig#a"], o_grip_drum_b: ["drum", "orsa_rig#b"], o_release_drum_b: ["drum", "orsa_rig#b"], o_grip_card: ["card", "orsa_rig#a"], o_release_card: ["card", "orsa_rig#a"] }; for (const c of p.commands) if (H[c.id]) c.required_prestate.possession = { [H[c.id][0]]: H[c.id][1] }; });
  assert.ok(has(codes(() => compile(plan0({ pkt: hinted, support: null }))), "PROP_SUPPORT_CONTRACT_REQUIRED", "ONE_TRANSFORM_OWNER"), "several holders with no contract: ambiguous transform owner");
});

test("P07-N2 every-frame negatives through the real consumers: open painted hand, palm reversal, teleport, overextension", () => {
  // visibly open painted hand during the secure grip (the closure producer deleted)
  const op = tamper((p) => (p.__acting_events = p.__acting_events.filter((e) => e.source !== "command:t_grip_card"))), qo = verifyPerformance(op.C);
  assert.ok(!qo.ok && /painted hand shows open|GRIP_MORPHOLOGY_FAILED/.test(qo.results.find((r) => r.command === "report_standin").reason ?? ""), "open hand while it supports the card");
  // hand orientation reversal (palm basis flipped by 180°)
  const flip = verifyPerformance(compile(plan0({ support: ct((c) => (prop(c, "report_standin").hands[1].grip_angle_deg = 180)) })));
  const rr = flip.results.find((r) => r.command === "report_standin"); assert.ok(!rr.ok && /palm orientation|CONTACT_ORIENTATION/.test(rr.reason), rr.reason);
  // prop teleport while a hand drives it: the hand follows the jump (zero contact error), only the owner's own path catches it
  const tp = tamper((p) => (p.tracks.card_rig.root.x = [[0, 0], [298, 0], [322, -12, "sine.inOut"], [368, -12], [404, -46, "sine.inOut"], [419, -46], [420, -16]])), qt = verifyPerformance(tp.C);
  assert.ok(/jumps .*teleport/.test(qt.results.find((r) => r.command === "report_standin").reason ?? ""), "prop teleport detected on the prop's own root");
  // joint overextension: the card leaves the arm's reach while the hand must hold it
  const far = tamper((p) => (p.tracks.card_rig.root.x = [[0, 0], [298, 0], [322, -12, "sine.inOut"], [368, -12], [404, -46, "sine.inOut"], [430, -46], [470, -330, "sine.inOut"]])), qf = verifyPerformance(far.C);
  const fc = [...new Set(stateAtFrame(far.C, 469).failures.map((x) => x.code))], rs = qf.results.find((r) => r.command === "report_standin");
  assert.ok(!rs.ok && fc.some((c) => ["UNREACHABLE_IK", "JOINT_LIMIT_EXCEEDED", "CONTACT_DRIFT", "DEGENERATE_IK", "PROP_DRIVER_INVALID"].includes(c)), `the hand cannot follow: typed solver failure, never a stretched arm (${fc})`);
});

test("P07-R1 real Chrome pixels: shared hold, transfer and release are visible on each OWNER's own drawing", async () => {
  const browser = await launch(), out = path.join(REPO, "hybrid_v2", "work", "p07", "render");
  try {
    const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const match = (png, c, tol = 4) => { let x = 0, y = 0, n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) { const k = i / 4; x += k % png.width; y += Math.floor(k / png.width); n++; } return { n, c: [x / n, y / n] }; };
    const A = await shoot(C, [200, 280, 300, 350, 354, 355, 356, 357, 358, 372, 400], "p07_pos");
    assert.ok(match(A[200], F.COL.tovaGripL).n > 100 && match(A[200], F.COL.tovaGripR).n > 100, "both closed hands visible while the plaque is carried");
    assert.ok(match(A[300], F.COL.tovaGripL).n < 10 && match(A[300], F.COL.tovaOpenL).n > 100, "left hand visibly open after its release");
    const s280 = match(A[280], F.COL.slab).c, s300 = match(A[300], F.COL.slab).c; assert.ok(Math.hypot(s300[0] - s280[0], s300[1] - s280[1]) < 0.75, `the plaque stays put on the counter (${s280} → ${s300})`);
    for (const f of [350, 354, 355]) assert.ok(match(A[f], F.COL.orsaClosedA).n > 50 && match(A[f], F.COL.tovaGripR).n > 50, `f${f}: both holders' closed drawings visible (shared hold)`);
    const cards = [354, 355, 356, 357, 358].map((f) => match(A[f], F.COL.card).c); for (let i = 1; i < cards.length; i++) assert.ok(Math.hypot(cards[i][0] - cards[i - 1][0], cards[i][1] - cards[i - 1][1]) < 1.5, `no on-screen jump at the transfer (${cards[i - 1]} → ${cards[i]})`);
    { const cl = match(A[372], F.COL.orsaClosedA).n, opn = match(A[372], F.COL.orsaOpenA).n; assert.ok(cl < 10 && opn > 20, `the giver's claw is visibly open after release (closed ${cl}, open ${opn})`); }
    const c372 = match(A[372], F.COL.card).c, c400 = match(A[400], F.COL.card).c; assert.ok(c400[0] < c372[0] - 10 && match(A[400], F.COL.tovaGripR).n > 50, "the receiver draws the card in while its closed hand is visible");
    const op = tamper((p) => (p.__acting_events = p.__acting_events.filter((e) => e.source !== "command:t_grip_card"))), B = await shoot(op.C, [400], "p07_neg_open");
    assert.ok(match(B[400], F.COL.tovaGripR).n < 10, "closure producer deleted → no closed-hand pixels where the card is held");
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, note: "DIAGNOSTIC stand-in rasters; proves shared-support mechanics on owner pixels only", card_centroids_354_358: cards, slab_280_300: [s280, s300], counts: { both_grips_200: [match(A[200], F.COL.tovaGripL).n, match(A[200], F.COL.tovaGripR).n], giver_open_372: match(A[372], F.COL.orsaOpenA).n, neg_grip_400: match(B[400], F.COL.tovaGripR).n } }, null, 1));
  } finally { await browser.close(); }
});
