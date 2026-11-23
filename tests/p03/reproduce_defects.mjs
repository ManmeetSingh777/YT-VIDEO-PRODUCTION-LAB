#!/usr/bin/env node
// Before/after defect reproducer for the Neutrino ↔ GPT-art integration round (P03). Runs against ANY checkout of this repository
// (the untouched baseline 7c924aa or the repair branch) and reports, per capability, whether the producing defect REPRODUCES.
//   node tests/p03/reproduce_defects.mjs <REPO_ROOT> <OUT_JSON>
// Each probe uses only public functions that exist in BOTH versions, on the round-trip diagnostic film built through the real intake.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const ROOT = path.resolve(process.argv[2] || "."), OUT = path.resolve(process.argv[3] || "reproduce.json"), W = path.join(ROOT, "hybrid_v2", "work", "p03_reproduce");
const imp = (rel) => import(url.pathToFileURL(path.join(ROOT, rel)).href), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";
const res = { repo: ROOT, head: (() => { try { return execFileSync("git", ["rev-parse", "HEAD"], { cwd: ROOT, encoding: "utf8" }).trim(); } catch { return null; } })(), probes: {} };
const probe = async (id, title, fn) => { try { const r = await fn(); res.probes[id] = { title, ...r }; } catch (e) { res.probes[id] = { title, reproduced: null, error: `${e.code || ""} ${String(e.message).slice(0, 300)}` }; } console.log(id.padEnd(4), String(res.probes[id].reproduced).padEnd(5), title); };
const { runRoundTrip } = await imp("tests/art_bridge/roundtrip_fixture.mjs"), rt = await runRoundTrip(path.join(W, "rt")), F = rt.film, doc = J(path.join(F, MF)), plan0 = J(path.join(F, "handoff", "MOTION_PLAN.json"));
const { compileMotionTracks, stateAtFrame } = await imp("engine/art_bridge/temporal.mjs"), AS = await imp("engine/art_bridge/asset_state.mjs");
const compile = (d, p) => compileMotionTracks(d.actions, d.shots, { doc: d, plan: p, requireApproval: false });

await probe("B", "expression is derived from the pose-state id (no independent expression ownership)", () => {
  const cells = AS.assetStateCoverage(doc).cells, c = cells.find((x) => x.pose === "grip"); return { reproduced: c?.expression === "grip", observed: { pose: c?.pose, expression: c?.expression } }; });
await probe("C", "feasibility skips non-contact actions (an invalid pose change in a non-contact action is not detected)", async () => {
  const d2 = path.join(W, "c_film"); fs.rmSync(d2, { recursive: true, force: true }); fs.cpSync(F, d2, { recursive: true }); const m = J(path.join(d2, MF)); m.actions[0].pose_events.push({ frame: 300, state_id: "no_such_state" }); fs.writeFileSync(path.join(d2, MF), JSON.stringify(m, null, 1));
  const { checkRigFeasibility } = await imp("engine/art_bridge/art_intake.mjs"), r = await checkRigFeasibility({ film: d2, identity: "pilot" }); return { reproduced: r.status === "FEASIBLE", observed: { status: r.status, checked: r.checked, failures: r.failures.length } }; });
await probe("A", "acting intentions (breath / blink / successive-breaking lag) have no consumer in the motion compiler", () => {
  const p = { ...plan0, acting: { pilot_rig: { breath: { joint: "pelvis", amplitude_deg: 3, period_frames: 180 }, lag: { frames_per_depth: 4 } } } }, a = stateAtFrame(compile(doc, plan0), 1000), b = stateAtFrame(compile(doc, p), 1000);
  return { reproduced: JSON.stringify(a.matrices) === JSON.stringify(b.matrices), observed: "identical matrices with and without an acting block" }; });
await probe("D", "motion phrases do not reach rendered motion (plan.phrases is ignored by compileMotionTracks)", () => {
  const ph = { id: "ph", start_frame: 700, phases: [{ phase: "ANTICIPATION", frames: 10 }, { phase: "ACTION", frames: 20 }, { phase: "FOLLOW_THROUGH", frames: 20 }], owners: [{ id: "pilot_rig.wrist_r", kind: "ACTOR", values: { ANTICIPATION: 10, ACTION: -40, FOLLOW_THROUGH: -30 } }, { id: "cam_world.rot", kind: "CAMERA", values: { ACTION: 4 } }] }; // owners with NO authored track (the repaired compiler refuses a phrase that would silently fight an authored track)
  const a = stateAtFrame(compile(doc, plan0), 720), b = stateAtFrame(compile(doc, { ...plan0, phrases: [ph] }), 720); return { reproduced: JSON.stringify(a.matrices) === JSON.stringify(b.matrices), observed: "identical matrices with and without the phrase" }; });
await probe("E", "an approved EXPLICIT_DEFORM map changes no rendered contour (no deformation consumer in the render path)", async () => {
  const { createAssetRegistry } = await imp("engine/art_bridge/asset_registry.mjs"), { composeShot } = await imp("engine/art_bridge/scene_graph.mjs"), reg = await createAssetRegistry(F, MF, {});
  const a = reg.doc.assets.find((x) => x.id === "pilot_forearm"), [x, y, w, h] = a.canonical_rect, V = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
  const p = { ...plan0, deform_maps: { pilot_close_hand: { asset: "pilot_forearm", approved_receipt: "probe", vertices: V, triangles: [[0, 1, 2], [0, 2, 3]], targets: V.map(([u, v], i) => [u + (i === 2 ? 20 : 0), v]), weight: [[0, 0], [600, 1]] } } };
  const C1 = compile(reg.doc, plan0), C2 = compile(reg.doc, p), s1 = composeShot(reg.doc.shots[0], reg, C1, { prefix: "a-" }), s2 = composeShot(reg.doc.shots[0], reg, C2, { prefix: "a-" });
  const r1 = JSON.stringify(s1.frameState(500).rows), r2 = JSON.stringify(s2.frameState(500).rows); return { reproduced: r1 === r2 && !/--tri/.test(s2.svg), observed: "same rows and no mesh-triangle passes with an approved deform map" }; });
await probe("F", "cast shadows, grip morphology and balance are not consumed by scene execution", async () => {
  const p = { ...plan0, shadows: [{ id: "sh", occluder: { rig: "pilot_rig", slot: "pilot_body" }, receiver: { plane_y: 900, material: "floor" }, light: { direction: [0.3, 1] }, asset: "pilot_underpaint" }] };
  const { createAssetRegistry } = await imp("engine/art_bridge/asset_registry.mjs"), { composeShot } = await imp("engine/art_bridge/scene_graph.mjs"), reg = await createAssetRegistry(F, MF, {}), sc = composeShot(reg.doc.shots[0], reg, compile(reg.doc, p), { prefix: "a-" });
  const src = ["engine/art_bridge/temporal.mjs", "engine/art_bridge/scene_graph.mjs", "engine/film/chrome_frames.mjs"].map((f) => fs.readFileSync(path.join(ROOT, f), "utf8")).join("\n");
  return { reproduced: !/--shadow/.test(sc.svg) && !/gripMorphology\(|balance\(|castShadow\(/.test(src), observed: { shadow_pass_emitted: /--shadow/.test(sc.svg), render_path_calls: ["gripMorphology(", "balance(", "castShadow("].filter((n) => src.includes(n)) } }; });
await probe("G", "the coverage gate passes a frozen character while particles keep the full frame changing", async () => {
  const { coverageGate } = await imp("engine/film/coverage_gate.mjs"), d = path.join(W, "g_film"); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, "render", "chunks", "k"), { recursive: true });
  const total = 120, hashes = [...Array(total)].map((_, i) => `frame${i}`), states = [...Array(total)].map((_, i) => `state${i}`), owner_hashes = { pilot_rig: [...Array(total)].map(() => "frozen") };
  fs.writeFileSync(path.join(d, "render", "chunks", "k", "c.json"), JSON.stringify({ hashes, state_hashes: states, owner_hashes, owner_state_hashes: { pilot_rig: states } })); fs.writeFileSync(path.join(d, "render", "FRAME_MANIFEST.json"), JSON.stringify({ total, chunks: [{ frames: [0, total], mkv: "render/chunks/k/c.mkv", defects: [] }] }));
  const doc2 = { stage: { total_frames: total, fps: 60 }, actions: [{ id: "act", shot_id: "s", frame_range: [0, total], actors: [{ rig_id: "pilot_rig" }], pose_events: [], view_events: [], contact_events: [] }], rigs: [], identities: [], assets: [], transitions: [], audio: {}, shots: [{ id: "s", start_frame: 0, end_frame: total }] };
  const r = coverageGate({ FILM: d, index: { total, segments: [{ frames: [0, total], shot: "s", actions: ["act"], effects: ["dust"], static_hold: false }] }, doc: doc2 }); return { reproduced: r.ok === true, observed: { ok: r.ok, failures: r.failures.map((x) => x.code) } }; });
await probe("H", "no narration/SFX/music buses, ducking or loudness stage (one supplied audio file is muxed)", () => {
  const has = fs.existsSync(path.join(ROOT, "engine", "film", "audio_mix.mjs")); return { reproduced: !has, observed: { audio_mix_module: has } }; });
await probe("A2", "blink / mouth states cannot be expressed (no explicit art-state channels in the rig contract)", () => {
  const s = J(path.join(ROOT, "schemas", "motion_art_manifest_v2.schema.json")), rig = (s.$defs || s.definitions).rig; return { reproduced: !rig.properties.state_channels, observed: { rig_properties: Object.keys(rig.properties) } }; });
fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify(res, null, 1)); console.log(`→ ${OUT}`);
