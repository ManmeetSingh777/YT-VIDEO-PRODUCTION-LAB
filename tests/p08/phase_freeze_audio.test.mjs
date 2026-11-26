// P08 E01 (world freeze / time remap), A04 (successor phase inheritance), F01 (one sample clock; split = continuous). Real evaluator, real Chrome
// pixels, real PCM. DIAGNOSTIC character fixture + DIAGNOSTIC synthesized tones (labelled; never dialogue). No E01 frame number appears here.
import test from "node:test"; import assert from "node:assert/strict"; import crypto from "node:crypto"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
const PB = await import("../../engine/film/phase_boundary.mjs"), PA = await import("../../engine/film/phase_audio.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const compile = (plan, d = doc) => compileMotionTracks(d.actions, d.shots, { doc: d, plan, requireApproval: false });
const codes = (fn) => { try { fn(); return []; } catch (e) { return (e.errors || [e]).map((x) => ({ code: x.code, inv: x.failed_invariant ?? x.details?.failed_invariant })); } };
const sha = (x) => crypto.createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex");
// scene: kade keeps waving 360–460 and pim keeps looking 320–500 (live); the background token spins 300–560
const E = (kind) => ({ kind });
const PRIMS = () => [
  { id: "kade_raise", kind: "JOINT_ROTATE", owner: "kade_rig.shoulder_r", frames: [360, 470], inputs: { keys: [[0, 0], [20, -150, "power2.out"], [80, -150], [109, 0, "sine.inOut"]] }, expected_effect: E("J") },
  { id: "kade_wave", kind: "OSCILLATE", owner: "kade_rig.elbow_r", frames: [382, 440], inputs: { amplitude_deg: 25, period_frames: 24 }, expected_effect: E("O") },
  { id: "pim_look", kind: "AIM", owner: "pim_rig.head", frames: [320, 500], inputs: { target: { world_xy: [560, 300] }, forward_deg: 180, max_deg: 35 }, expected_effect: E("A") },
  { id: "pim_nod", kind: "JOINT_ROTATE", owner: "pim_rig.chest", frames: [400, 470], inputs: { keys: [[0, 0], [30, 10, "sine.inOut"], [69, 0, "sine.inOut"]] }, expected_effect: E("J") },
  { id: "bg_token_spin", kind: "ROOT_MOVE", owner: "token_rig", frames: [300, 560], inputs: { rot: [[0, 0], [259, 30, "linear"]] }, expected_effect: E("R") } ];
const FREEZE = (o = {}) => ({ id: "freeze_world", owner_group: { rigs: ["kade_rig", "sheet_rig"] }, frames: [400, 460], source: { mode: "FREEZE", frame: 399 }, camera_policy: "SOURCE", ...o });
const planOf = ({ prims = PRIMS(), remaps = [FREEZE()] } = {}) => ({ ...CF.basePlan(), composition: { schema_version: "1.0.0", primitives: prims }, ...(remaps ? { time_remaps: remaps } : {}) });
const C = compile(planOf()), own = (Cx, f, rid) => sha(PB.ownerStates(Cx, stateAtFrame(Cx, f))[rid]);
const PARENT = sha("DIAGNOSTIC parent source p08 phase test"), REV = "rev-diag-1";

test("E01-1 world freeze: the named group is drawn from the exact source-frame state for the whole interval; other owners stay live", () => {
  for (const f of [400, 410, 437, 459]) { for (const rid of ["kade_rig", "sheet_rig"]) assert.equal(own(C, f, rid), own(C, 399, rid), `f${f} ${rid} equals its f399 source state`); assert.deepEqual(stateAtFrame(C, f).camera, stateAtFrame(C, 399).camera, "camera policy SOURCE"); }
  assert.notEqual(own(C, 450, "pim_rig"), own(C, 410, "pim_rig"), "pim (outside the group) keeps acting on the live clock"); assert.notEqual(own(C, 450, "token_rig"), own(C, 410, "token_rig"), "the background token keeps spinning");
  assert.notEqual(own(C, 420, "kade_rig"), own(compile(planOf({ remaps: [] })), 420, "kade_rig"), "without the freeze kade would have kept waving (the freeze is a real producer)");
  assert.equal(own(C, 460, "kade_rig"), own(compile(planOf({ remaps: [] })), 460, "kade_rig"), "after the freeze the group returns to the live clock exactly");
  assert.deepEqual(stateAtFrame(C, 410).remapped, [{ id: "freeze_world", source_frame: 399, rigs: ["kade_rig", "sheet_rig"], actions: [], camera_policy: "SOURCE" }]);
});

test("E01-2 freeze/remap negatives: source inside its interval, unnamed group (whole-screen freeze), unapproved reverse clock, two remaps on one owner, unknown camera policy", () => {
  assert.ok(codes(() => compile(planOf({ remaps: [FREEZE({ source: { mode: "FREEZE", frame: 420 } })] }))).some((x) => x.inv === "REMAP_SOURCE_OUTSIDE"));
  assert.ok(codes(() => compile(planOf({ remaps: [FREEZE({ owner_group: {} })] }))).some((x) => x.inv === "REMAP_GROUP_NAMED"));
  assert.ok(codes(() => compile(planOf({ remaps: [FREEZE({ source: { mode: "REMAP", keys: [[400, 399], [459, 340]] } })] }))).some((x) => x.inv === "REMAP_MONOTONE"), "a backwards source clock needs an approved reversed:true");
  assert.equal(codes(() => compile(planOf({ remaps: [FREEZE({ source: { mode: "REMAP", keys: [[400, 399], [459, 340]], reversed: true } })] }))).length, 0, "an approved reversed remap compiles");
  assert.ok(codes(() => compile(planOf({ remaps: [FREEZE(), FREEZE({ id: "b", frames: [430, 470], source: { mode: "FREEZE", frame: 300 } })] }))).some((x) => x.inv === "ONE_REMAP_PER_OWNER"));
  assert.ok(codes(() => compile(planOf({ remaps: [FREEZE({ camera_policy: "WHATEVER" })] }))).some((x) => x.inv === "REMAP_CAMERA_POLICY"));
  // a remap whose source is off by one is a DIFFERENT outgoing state: the boundary verifier (A04) catches it against the predecessor bundle
  const off = compile(planOf({ remaps: [FREEZE({ source: { mode: "FREEZE", frame: 398 } })] })); assert.notEqual(own(off, 420, "kade_rig"), own(C, 420, "kade_rig"));
});

test("A04-1 successor phase: the predecessor's sealed f399 bundle is reproduced owner-by-owner by a separately compiled successor; resumed frames equal the continuous ones", () => {
  const bundle = PB.boundaryBundle(C, 399, { parent_source_sha256: PARENT, revision: REV, phase: "phase_A" }), C2 = compile(planOf());
  const v = PB.verifySuccessor({ bundle, C: C2, start: 400, parent_source_sha256: PARENT, revision: REV, expectedSha: bundle.sha256 }); assert.ok(v.ok, v.failures.map((x) => x.human_readable_reason).join("; ")); assert.ok(v.checked_owners >= 4);
  for (const f of [400, 401, 437, 459, 460, 520]) for (const rid of ["kade_rig", "pim_rig", "token_rig", "sheet_rig"]) assert.equal(own(C2, f, rid), own(C, f, rid), `f${f} ${rid}: resumed = continuous`);
});

test("A04-2 successor negatives: tampered bundle, wrong predecessor digest, gap, overlap, other revision, other parent, successor state differs, missing owner", () => {
  const bundle = PB.boundaryBundle(C, 399, { parent_source_sha256: PARENT, revision: REV, phase: "phase_A" }), C2 = compile(planOf()), inv = (o) => PB.verifySuccessor({ bundle, C: C2, start: 400, parent_source_sha256: PARENT, revision: REV, ...o }).failures.map((x) => x.failed_invariant);
  { const t = clone(bundle); t.owners.kade_rig.sha256 = "0".repeat(64); assert.ok(PB.verifySuccessor({ bundle: t, C: C2, start: 400, parent_source_sha256: PARENT, revision: REV }).failures.some((x) => x.failed_invariant === "BUNDLE_INTACT")); }
  assert.ok(inv({ expectedSha: "1".repeat(64) }).includes("PREDECESSOR_DIGEST")); assert.ok(inv({ start: 401 }).includes("NO_GAP")); assert.ok(inv({ start: 399 }).includes("NO_OVERLAP"));
  assert.ok(inv({ revision: "rev-old" }).includes("SAME_REVISION")); assert.ok(inv({ parent_source_sha256: sha("other") }).includes("SAME_PARENT_SOURCE"));
  { const p = PRIMS(); p[0].inputs.keys[1][1] = -140; assert.ok(PB.verifySuccessor({ bundle, C: compile(planOf({ prims: p })), start: 400, parent_source_sha256: PARENT, revision: REV }).failures.some((x) => x.failed_invariant === "OWNER_STATE_EQUAL" && x.details?.owner === "kade_rig"), "a successor that would start from a different pose"); }
  { const pl = planOf(); delete pl.placements.token_rig; const d = clone(doc); d.actions = d.actions.map((a) => ({ ...a, actors: a.actors.filter((x) => x.rig_id !== "token_rig") })); assert.ok(PB.verifySuccessor({ bundle, C: compile(pl, d), start: 400, parent_source_sha256: PARENT, revision: REV }).failures.some((x) => x.failed_invariant === "OWNER_PRESENT"), "an owner of the boundary missing in the successor"); }
  assert.ok(PB.verifySuccessor({ bundle: null, C: C2, start: 400, parent_source_sha256: PARENT, revision: REV }).failures.some((x) => x.failed_invariant === "PREDECESSOR_PRESENT"), "never start from defaults");
});

test("F01 one sample clock: split phase PCM = continuous PCM bit-for-bit, the crossing cue continues at its exact source sample; truncated, duplicated, wrong-take and fractional placements fail", () => {
  const W = isolatedWork("p08_phase_audio"), tone = (file, hz, n, amp) => { const s = new Float32Array(n); for (let i = 0; i < n; i++) s[i] = amp * Math.sin((2 * Math.PI * hz * i) / 48000) * Math.min(1, i / 480, (n - i) / 480); PA.writeWav32f(file, s); return crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex"); };
  const f1 = path.join(W, "DIAG_tone_a.wav"), f2 = path.join(W, "DIAG_tone_b.wav"), s1 = tone(f1, 440, 120000, 0.3), s2 = tone(f2, 660, 60000, 0.2);
  const cues = (o = {}) => [{ cue_id: "cA", file: f1, sha256: s1, file_in_sample: 4000, file_out_sample_exclusive: 110000, timeline_clip_start_sample: 300000, gain_db: -3, ...(o.cA || {}) }, { cue_id: "cB", file: f2, sha256: s2, file_in_sample: 0, file_out_sample_exclusive: 60000, timeline_clip_start_sample: 330000, ...(o.cB || {}) }];
  const A = PA.phaseAudio(cues()), N = 600 * 800, k = 400 * 800, cont = A.render(0, N), a = A.render(0, k), b = A.render(k, N);
  assert.equal(a.length + b.length, cont.length); for (let i = 0; i < cont.length; i++) if (cont[i] !== (i < k ? a[i] : b[i - k])) assert.fail(`sample ${i} differs`);
  const cross = A.crossingAt(k); assert.deepEqual(cross.map((c) => [c.cue_id, c.source_sample_at_boundary, c.remaining_samples]), [["cA", 24000, 86000]], "cA crosses the cut at source sample 24000 (file_in applied once)");
  const bundle = PB.boundaryBundle(C, 399, { parent_source_sha256: PARENT, revision: REV, audio: A }), ok = PB.verifySuccessor({ bundle, C: compile(planOf()), start: 400, parent_source_sha256: PARENT, revision: REV, audio: A }); assert.ok(ok.ok, ok.failures.map((x) => x.human_readable_reason).join("; "));
  const succ = (cs) => PB.verifySuccessor({ bundle, C: compile(planOf()), start: 400, parent_source_sha256: PARENT, revision: REV, audio: PA.phaseAudio(cs) }).failures.map((x) => x.failed_invariant);
  assert.ok(succ([cues()[1]]).includes("CROSSING_CUE_CONTINUES"), "truncated tail: the successor drops the crossing cue");
  assert.ok(succ(cues({ cA: { timeline_clip_start_sample: k } })).includes("CROSSING_CUE_SAMPLE_EXACT"), "duplicated onset: the successor restarts the cue at the cut");
  assert.throws(() => PA.phaseAudio(cues({ cA: { sha256: "a".repeat(64) } })), (e) => e.code === "AUDIO_SYNC_MISMATCH"); assert.throws(() => PA.phaseAudio(cues({ cA: { timeline_clip_start_sample: 300000.5 } })), (e) => e.failed_invariant === "INTEGER_SAMPLES");
  const out = path.join(W, "phase_A.wav"); PA.writeWav32f(out, a); const back = PA.readWav(out); assert.equal(back.samples.length, 400 * 800, "phase WAV holds exactly frames × 800 samples"); assert.equal(back.sr, 48000);
});

test("E01/A04 real Chrome pixels: frozen owner pixels are identical to the source frame across the freeze; the live owner's pixels move; resumed f400 pixels = continuous f400", async () => {
  const browser = await launch(), out = isolatedWork("p08_freeze_render");
  try { const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const ownerHash = (png, keys) => { const want = keys.map((k) => CF.COL[k]), h = crypto.createHash("sha256"); let n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && want.some((c) => Math.abs(png.rgba[i] - c[0]) <= 3 && Math.abs(png.rgba[i + 1] - c[1]) <= 3 && Math.abs(png.rgba[i + 2] - c[2]) <= 3)) { h.update(String(i)); n++; } return { n, h: h.digest("hex") }; };
    const K = Object.keys(CF.COL).filter((k) => k.startsWith("kade:")), Pk = Object.keys(CF.COL).filter((k) => k.startsWith("pim:"));
    const A = await shoot(C, [399, 410, 450], "frz"), k399 = ownerHash(A[399], K), k410 = ownerHash(A[410], K), k450 = ownerHash(A[450], K);
    const bbox = (png, keys) => { const want = keys.map((k) => CF.COL[k]); let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1; for (let q = 0; q < png.rgba.length; q += 4) if (png.rgba[q + 3] > 200 && want.some((c) => Math.abs(png.rgba[q] - c[0]) <= 1 && Math.abs(png.rgba[q + 1] - c[1]) <= 1 && Math.abs(png.rgba[q + 2] - c[2]) <= 1)) { const p = q / 4, x = p % png.width, y = Math.floor(p / png.width); x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); } return [x0 - 3, y0 - 3, x1 + 3, y1 + 3]; };
    const crop = (png, [x0, y0, x1, y1]) => { const out = []; for (let y = y0; y <= y1; y++) out.push(Buffer.from(png.rgba.subarray((y * png.width + x0) * 4, (y * png.width + x1 + 1) * 4))); return Buffer.concat(out); };
    const bb = bbox(A[399], K), diff = (a, b) => { const p = crop(a, bb), q = crop(b, bb); let n = 0; for (let t = 0; t < p.length; t++) if (p[t] !== q[t]) n++; return n; };
    assert.ok(k399.n > 1000, "kade is painted"); assert.equal(diff(A[399], A[410]), 0, `kade region f410 vs f399 (bbox ${bb})`); assert.equal(diff(A[399], A[450]), 0, "kade region f450 vs f399"); void k410; void k450;
    assert.notEqual(ownerHash(A[410], Pk).h, ownerHash(A[450], Pk).h, "pim's pixels change during the freeze (live)");
    const B = await shoot(compile(planOf()), [400], "resume"), Cc = await shoot(C, [400], "cont"); assert.ok(Buffer.compare(Buffer.from(B[400].rgba), Buffer.from(Cc[400].rgba)) === 0, "resumed f400 frame is pixel-identical to the continuous render");
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, frozen_owner_pixels: k399.n, frozen_hash: k399.h }, null, 1));
  } finally { await browser.close(); }
});
