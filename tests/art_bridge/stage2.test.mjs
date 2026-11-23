// Stage 2 fast contracts (no browser): purity, ownership, routing, cels, transitions, lighting, registration math, ArtJobs, state coverage, provider boundary.
// Rendered-pixel proofs live in stage2_proofs.mjs (Chrome). Fixtures are DIAGNOSTIC_FIXTURE only.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame, ev } from "../../engine/art_bridge/temporal.mjs";
import { composeShot } from "../../engine/art_bridge/scene_graph.mjs";
import { solveTransform } from "../../engine/art_bridge/registration.mjs";
import { missingArtJobs, completeMotionContext, MOTION_CONTEXT_FIELDS, routeMedium } from "../../engine/art_bridge/art_requests.mjs";
import { assetStateCoverage } from "../../engine/art_bridge/asset_state.mjs";
import { discoverProvider } from "../../engine/art_bridge/providers/image_provider.mjs";
import { bindRig } from "../../engine/art_bridge/rig_binding.mjs";
import { emitSpritePart } from "../../engine/art_bridge/svg_parts.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), FIX = path.join(here, "fixtures");
const M = (k) => JSON.parse(fs.readFileSync(path.join(FIX, "stage2", `scene_${k}.manifest.json`), "utf8")), PL = (k) => JSON.parse(fs.readFileSync(path.join(FIX, "stage2", `scene_${k}.plan.json`), "utf8"));
const load = async (k, plan = PL(k)) => { const reg = await createAssetRegistry(FIX, `stage2/scene_${k}.manifest.json`); return { reg, C: compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan }) }; };
const codesOf = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => x.code); } };

test("stateAtFrame is pure: random-order evaluation equals linear evaluation", async () => {
  const { C } = await load("A"), lin = Array.from({ length: 40 }, (_, i) => JSON.stringify(stateAtFrame(C, 80 + i * 3).passes));
  for (const k of [39, 0, 17, 5, 39, 22]) assert.equal(JSON.stringify(stateAtFrame(C, 80 + k * 3).passes), lin[k]);
  assert.throws(() => stateAtFrame(C, 7200), RangeError); assert.throws(() => stateAtFrame(C, 1.5), RangeError);
});
test("grip and plant hold on every locked frame; no failures over the action", async () => {
  const { C } = await load("A"); let maxG = 0, maxP = 0;
  for (let f = 0; f < 600; f++) { const s = stateAtFrame(C, f); assert.equal(s.failures.length, 0, `frame ${f}: ${s.failures.map((e) => e.code)}`); for (const c of s.contacts) if (c.locked) (c.contact_type === "GRIP" ? (maxG = Math.max(maxG, c.error_px)) : (maxP = Math.max(maxP, c.error_px))); }
  assert.ok(maxG < 1e-5 && maxP < 1e-5);
});
test("bend branch contradicting the FK pose is reported, not flipped silently", async () => {
  const m = M("A"); m.rigs[0].constraints[0].bend_sign = -1; const reg = await createAssetRegistry(FIX, `stage2/scene_A.manifest.json`);
  const C = compileMotionTracks(m.actions, m.shots, { doc: { ...reg.doc, rigs: m.rigs }, plan: PL("A") });
  const codes = new Set(); for (let f = 20; f < 90; f += 5) stateAtFrame(C, f).failures.forEach((e) => codes.add(e.code)); assert.ok(codes.has("UNAPPROVED_BEND_BRANCH"));
});
test("transform ownership, routing and morph topology are enforced at compile time", async () => {
  const { reg } = await load("A"), doc = reg.doc, p = PL("A");
  p.secondary.push({ id: "x", rig: "actor2", joint: "elbow", driver: { rig: "crank2", joint: "wheel" }, stiffness: 1, damping: 1, gain: 1 });
  assert.ok(codesOf(() => compileMotionTracks(doc.actions, doc.shots, { doc, plan: p })).includes("INVALID_TRANSFORM_OWNER"));
  const bad = JSON.parse(JSON.stringify(doc.actions)); bad[0].mode = "WOBBLE"; assert.ok(codesOf(() => compileMotionTracks(bad, doc.shots, { doc, plan: PL("A") })).includes("UNSUPPORTED_MOTION_CLASS"));
  const morph = JSON.parse(JSON.stringify(doc.actions)); morph[0].mode = "REGISTERED_MORPH"; assert.ok(codesOf(() => compileMotionTracks(morph, doc.shots, { doc, plan: PL("A") })).includes("INVALID_MORPH_TOPOLOGY"));
  const def = JSON.parse(JSON.stringify(doc.actions)); def[0].mode = "EXPLICIT_DEFORM"; assert.ok(codesOf(() => compileMotionTracks(def, doc.shots, { doc, plan: PL("A") })).includes("MISSING_ART_ASSET"));
  const rigid = PL("A"); const rg = JSON.parse(JSON.stringify(doc.actions)); rg[0].mode = "RIGID"; assert.ok(codesOf(() => compileMotionTracks(rg, doc.shots, { doc, plan: rigid })).includes("UNSUPPORTED_MOTION_CLASS"));
});
test("light plane is painted on its owner and under everything above the owner; reads the owner's matrix", async () => {
  const { reg, C } = await load("A"), sc = composeShot(reg.doc.shots[0], reg, C, { prefix: "t-" }), o = sc.order.FOCAL, i = (s) => o.findIndex((x) => x.includes(s));
  assert.ok(i("torso2--torso2--light") > i("torso2--torso2") && i("torso2--torso2--light") < i("upper_arm2"));
  const rows = sc.frameState(300).rows, own = rows.find((r) => r[0] === "t-actor2--torso2--torso2")[1], lt = rows.find((r) => r[0].includes("light-torso2_shade"))[1]; assert.equal(own, lt);
});
test("every runtime element is written on every frame (seek-safe DOM state)", async () => {
  const { reg, C } = await load("D"), sc = composeShot(reg.doc.shots[0], reg, C, { prefix: "d-" }), n = sc.runtimeIds.length + sc.cameraIds.length;
  for (const f of [0, 1000, 3430, 3539, 5000]) assert.equal(sc.frameState(f).rows.length, n);
});
test("transition anchor is invariant; stages OUT→MIDDLE→IN", async () => {
  const { reg, C } = await load("D"), tr = composeShot(reg.doc.shots[0], reg, C, { prefix: "d-" }).transitions[0], st = [];
  for (let f = 3420; f < 3540; f++) { const t = tr.frameAt(f); assert.ok(Math.max(...t.anchor_residuals_px) < 1e-6); if (st.at(-1) !== t.stage) st.push(t.stage); }
  assert.deepEqual(st, ["OUT", "MIDDLE", "IN"]);
});
test("camera footprint flags exact spans when the camera outruns painted plates", async () => {
  const p = PL("D"); p.cameras.camD.zoom = [[0, 1], [300, 0.25, "sine.inOut"], [600, 1, "sine.inOut"]];
  const { reg, C } = await load("D", p), spans = composeShot(reg.doc.shots[0], reg, C, { prefix: "d-" }).validateFootprint(0, 600);
  assert.ok(spans.length && spans.every((e) => e.code === "OUTSIDE_CAMERA_FOOTPRINT" && e.frame_range[0] > 0 && e.frame_range[1] < 600));
  const ok = await load("D"); assert.equal(composeShot(ok.reg.doc.shots[0], ok.reg, ok.C, { prefix: "d-" }).validateFootprint(0, 3420).length, 0);
});
test("gear ratio and flow symbols follow the declared mechanism", async () => {
  const { C } = await load("E"); for (const f of [50, 250, 550]) assert.ok(Math.abs(C.jointValue("gearB", "spin", f) / C.jointValue("gearA", "spin", f) + 30 / 18) < 1e-12);
  assert.equal(C.proceduralAt(150).length, 3);
});
test("registration solver recovers similarity and affine exactly; collinear affine refused", () => {
  const T = [0.8, 0.3, -0.3, 0.8, 12, -7], ap = (p) => [T[0] * p[0] + T[2] * p[1] + T[4], T[1] * p[0] + T[3] * p[1] + T[5]], src = [[0, 0], [50, 10], [20, 70], [90, 90]];
  const S_ = solveTransform(src, src.map(ap), "SIMILARITY"); S_.forEach((v, i) => assert.ok(Math.abs(v - T[i]) < 1e-9));
  const A = [1.2, 0.1, 0.3, 0.9, 5, 6], apA = (p) => [A[0] * p[0] + A[2] * p[1] + A[4], A[1] * p[0] + A[3] * p[1] + A[5]], R = solveTransform(src, src.map(apA), "AFFINE"); R.forEach((v, i) => assert.ok(Math.abs(v - A[i]) < 1e-9));
  assert.throws(() => solveTransform([[0, 0], [1, 1], [2, 2]], [[0, 0], [1, 1], [2, 2]], "AFFINE"), (e) => e.code === "DEGENERATE_IK");
});
test("ArtJobs: every §6.2 motion_context field present (value or null+reason); non-art defects are routed elsewhere", () => {
  const doc = M("A"), { jobs, routed_elsewhere } = missingArtJobs([{ code: "MISSING_ART_ASSET", record_id: "hand_near2", dependency: "hand_near2", frame_range: [90, 480], shot_id: "shotA" }, { code: "MISSING_ART_ASSET", record_id: "hand_near2", dependency: "hand_near2", frame_range: [500, 520], shot_id: "shotA" }, { code: "UNREACHABLE_IK", record_id: "operate_crank", frame_range: [1, 2] }], { doc });
  assert.equal(jobs.length, 1); assert.deepEqual(Object.keys(jobs[0].motion_context), MOTION_CONTEXT_FIELDS);
  for (const k of MOTION_CONTEXT_FIELDS) { const v = jobs[0].motion_context[k]; assert.ok((v !== null && !(Array.isArray(v) && !v.length)) || jobs[0].null_reasons[k] || Array.isArray(v), k); }
  assert.equal(jobs[0].triggered_by.length, 2); assert.equal(routed_elsewhere[0].code, "UNREACHABLE_IK");
  assert.equal(routeMedium({ kind: "TYPE" }).medium, "APPROVED_FONT_AND_VECTOR_TYPE");
  assert.ok(Object.keys(completeMotionContext({}).null_reasons).length === MOTION_CONTEXT_FIELDS.length);
});
test("state coverage: one static master for acting states never passes; front features on a turned head are missing", () => {
  const c = M("C"); const vs = c.rigs[0].view_states[0].asset_bindings; for (const k of Object.keys(vs)) if (k !== "skull_front") delete vs[k]; assert.ok(assetStateCoverage(c).errors.length > 0);
  const a = M("A"); a.rigs[0].render_parts = [{ asset_id: "actor2_master", joint_id: "pelvis", local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: "x", material_owner_id: "x" }]; assert.ok(assetStateCoverage(a).errors.some((e) => /static master/.test(e.human_readable_reason)));
  assert.equal(assetStateCoverage(M("A")).errors.length, 0); assert.equal(assetStateCoverage(M("C")).errors.length, 0);
});
test("provider boundary: no configuration → NullProvider with an exact blocker; never fabricates", async () => {
  const p = discoverProvider({}), caps = await p.capabilities(); assert.equal(caps.available, false); assert.match(caps.blocker, /not configured/);
  await assert.rejects(() => p.generate({ artjob_id: "x" }), (e) => e.code === "WAITING_FOR_GPT_ART");
  assert.match((await discoverProvider({ IMAGE_PROVIDER: "openai-images", OPENAI_API_KEY: "k" }).capabilities()).blocker, /IMAGE_PROVIDER_MODEL/);
  assert.match((await discoverProvider({ IMAGE_PROVIDER: "other" }).capabilities()).blocker, /no tested adapter/);
});
test("sprite emitter: image at (cx-px, cy-py), crop via nested viewport, static asset_to_canonical wrapper; missing asset refused", async () => {
  const a = { id: "q", canonical_rect: [10, 20, 30, 40], pivot_xy: [15, 25], source_pixel_crop: [0, 0, 30, 40], width_px: 30, height_px: 40 };
  // single geometry contract (re-audit B1): paint transform = translate(−pivot)·crop_to_canonical; crop drawn at native crop-pixel size
  assert.match(emitSpritePart({ id: "p" }, a, "assets/q.png", "s-"), /-paint" transform="matrix\(1 0 0 1 -5 -5\)"><image [^>]*x="0" y="0" width="30" height="40"/);
  assert.match(emitSpritePart({ id: "p" }, { ...a, source_pixel_crop: [4, 4, 20, 20], canonical_rect: [10, 20, 20, 20] }, "assets/q.png", "s-"), /viewBox="4 4 20 20"/);
  assert.match(emitSpritePart({ id: "p" }, { ...a, crop_to_canonical_matrix: [0.5, 0, 0, 0.5, -20, -15], canonical_rect: [-20, -15, 15, 20] }, "assets/q.png", "s-"), /-paint" transform="matrix\(0\.5 0 0 0\.5 -35 -40\)"/);
  assert.throws(() => emitSpritePart({ id: "p", asset_id: "q" }, null, null, "s-"), (e) => e.code === "MISSING_ART_ASSET");
  const { reg, C } = await load("A"), sc = composeShot(reg.doc.shots[0], reg, C, { prefix: "b-" }), b = bindRig(sc, reg.doc.rigs[0], C), s = b.solveRigAt(300);
  assert.ok(Math.hypot(s.sockets.grip2[0] - C.socketWorld("crank2", stateAtFrame(C, 300).matrices.crank2, "handle_grip2")[0], s.sockets.grip2[1] - C.socketWorld("crank2", stateAtFrame(C, 300).matrices.crank2, "handle_grip2")[1]) < 1e-5);
});
import { resolveCue, resolveEventCues } from "../../engine/art_bridge/audio_cues.mjs";
test("word cues: measured timing resolves exact frames; estimated timing or a broken cue → MISSING_WORD_ALIGNMENT", () => {
  const measured = { s1: [{ w: "One", start: 0.65, end: 0.97, method: "forced_alignment" }, { w: "squeeze", start: 0.97, end: 1.4, method: "forced_alignment" }] };
  assert.equal(resolveCue('s1:"squeeze"', measured).frame, 58); assert.equal(resolveCue('s1:"squeeze"-0.7', measured).frame, 16);
  assert.throws(() => resolveCue('s1:"bellows"', measured), (e) => e.code === "MISSING_WORD_ALIGNMENT");
  // real repository data: films/_qual_A word timings are ESTIMATED → cannot certify the critical "squeeze" event
  const qual = JSON.parse(fs.readFileSync(path.join(here, "..", "..", "films", "_qual_A", "production", "words.json"), "utf8"));
  const ep = JSON.parse(fs.readFileSync(path.join(here, "..", "..", "films", "_qual_A", "direction", "EPISODE.json"), "utf8"));
  const r = resolveEventCues(ep.scenes[0].events.filter((e) => e.at.includes(":")), qual); assert.ok(r.errors.length > 0 && r.errors.every((e) => e.code === "MISSING_WORD_ALIGNMENT"));
  assert.ok(resolveCue('s1:"squeeze"', qual, { critical: false }).frame > 0);
});
