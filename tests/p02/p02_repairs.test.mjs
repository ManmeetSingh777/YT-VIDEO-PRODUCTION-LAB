// Producer-level repairs made during P02 (each: reproducing test, negative test, unlike-transfer test). No scene name is used by any producer.
//  RP1 engine/production/stages.mjs#attentionTracks — S02 attention owners included only actors/props; a camera/world shot could never be owned.
//  RP2 engine/story/action_coverage.mjs#eventsFromShotScore — hard-coded "door_|drum_" → "washer_rig" (scene-specific patch) replaced by manifest lookup.
//  RP3 engine/production/stages.mjs#buildFrameTraceIndex — world plates untraced, camera motion counted as a static hold, plan ignored without opts.
//  RP4 engine/film/film_revision.mjs#upstreamReviews — downstream review receipts (shot_review/unlike_transfer/film) were hashed into the revision they review.
//  RP5 engine/film/segment_render.mjs#encoder — a failed chunk deleted its partial segment before ffmpeg released it (Windows EBUSY masked the typed failure).
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { compileAttention } from "../../engine/story/experience.mjs";
import { attentionTracks, buildFrameTraceIndex } from "../../engine/production/stages.mjs";
import { eventsFromShotScore } from "../../engine/story/action_coverage.mjs";
import { buildFilmRevision } from "../../engine/film/film_revision.mjs";
import * as SR from "../../engine/film/segment_render.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "repairs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const world = { actions: [], shots: [{ id: "w", start_frame: 0, end_frame: 600, camera_track_id: "cam", world_id: "plate_w" }], worlds: [{ id: "plate_w", depth_owners: [{ depth_band: "FAR", asset_ids: ["plate"] }] }], rigs: [], identities: [] };
const actor = { actions: [{ id: "a", frame_range: [0, 300], actors: [{ rig_id: "hero" }], contact_events: [] }], shots: [{ id: "c", start_frame: 0, end_frame: 600 }], worlds: [], rigs: [], identities: [] };
const machine = { actions: [{ id: "m", frame_range: [0, 600], actors: [{ rig_id: "press_rig" }], contact_events: [] }], shots: [{ id: "p", start_frame: 0, end_frame: 600 }], worlds: [], rigs: [{ id: "press_rig", identity_id: "press", pose_states: [{ id: "lid_up" }, { id: "lid_down" }] }, { id: "hero_rig", identity_id: "hero", pose_states: [{ id: "wave" }] }], identities: [{ id: "press", kind: "MACHINE" }, { id: "hero", kind: "CHARACTER" }] };

test("P02-RP1 attention owners include cameras/worlds/effects: reproduce, negative, unlike transfer", () => {
  const beat = (el) => [{ id: "b", frames: [0, 600], primary_focus: el }];
  // reproduce: the OLD owner rule (actions only) leaves the camera inert
  const old = world.actions.flatMap((a) => a.actors.map((x) => ({ owner: x.rig_id, element: x.rig_id, kind: "ACTOR", frames: a.frame_range })));
  assert.equal(compileAttention(beat("cam"), old).errors[0].code, "DIRECTION_DECISION_INERT");
  const tr = attentionTracks({ doc: world, motionPlans: { _film: { cameras: { cam: { zoom: [[0, 1], [600, 2]] } } } } });
  assert.equal(compileAttention(beat("cam"), tr).errors.length, 0); assert.equal(compileAttention(beat("plate"), tr).errors.length, 0, "the world's depth plate is a consumer");
  // negative: a target with no consumer is still inert; a camera WITHOUT keys in any motion plan is not a consumer
  assert.equal(compileAttention(beat("ghost"), tr).errors[0].code, "DIRECTION_DECISION_INERT");
  assert.equal(compileAttention(beat("cam"), attentionTracks({ doc: world, motionPlans: {} })).errors[0].code, "DIRECTION_DECISION_INERT");
  // unlike transfer: an acting shot is still owned by its actor, an effect by its plan entry; outside an owner's frames it is inert
  const ta = attentionTracks({ doc: actor, motionPlans: { _film: { effects: [{ id: "sparks", frames: [100, 200] }] } } });
  assert.equal(compileAttention(beat("hero"), ta).errors.length, 0); assert.equal(compileAttention([{ id: "s", frames: [150, 160], primary_focus: "sparks" }], ta).errors.length, 0);
  assert.equal(compileAttention([{ id: "late", frames: [400, 600], primary_focus: "sparks" }], ta).errors.length, 1);
});

test("P02-RP2 pose/state owner resolved from the manifest, never from a scene name: reproduce, negative, unlike transfer", () => {
  const shot = (pose, rig) => ({ events: [{ pose, frame: 10, ...(rig ? { rig } : {}) }] });
  // reproduce: the old adapter typed any "door_*" pose as STATE of a literal washer_rig, even in a film without such a rig
  assert.deepEqual(eventsFromShotScore(shot("door_open"), actor)[0], { kind: "POSE", frame: 10, state: "door_open", rig: null }, "no rig declares door_open here");
  const ev = eventsFromShotScore(shot("lid_down"), machine)[0]; assert.equal(ev.kind, "STATE"); assert.equal(ev.rig, "press_rig", "a MACHINE rig's state → object STATE");
  assert.deepEqual(eventsFromShotScore(shot("wave"), machine)[0], { kind: "POSE", frame: 10, state: "wave", rig: "hero_rig" }, "a CHARACTER pose stays a POSE (unlike family)");
  assert.equal(eventsFromShotScore(shot("anything", "press_rig"), machine)[0].rig, "press_rig", "an explicit rig wins");
  const src = fs.readFileSync(path.join(REPO, "engine", "story", "action_coverage.mjs"), "utf8").split("\n").filter((l) => !l.trim().startsWith("//")).join("\n");
  assert.ok(!/washer_rig|door_\||drum_/.test(src), "no scene-specific identifiers in the producer");
});

test("P02-RP3 frame trace index: world plates traced, camera motion is not a static hold, the film's plan is used", () => {
  const F = path.join(W, "trace_film"); fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(path.join(F, "handoff"), { recursive: true });
  const doc = { stage: { total_frames: 600 }, assets: [{ id: "plate", sha256: "p" }], actions: [], rigs: [], identities: [], shots: [{ id: "w", start_frame: 0, end_frame: 600, camera_track_id: "cam", world_id: "plate_w" }], worlds: world.worlds };
  fs.writeFileSync(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify(doc));
  const ix = buildFrameTraceIndex({ FILM: F, doc, motionPlans: { _film: { cameras: { cam: { zoom: [[0, 1], [100, 1], [300, 2]] } } } }, chunkSize: 600 });
  const at = (f) => ix.segments.find((s) => s.frames[0] <= f && f < s.frames[1]);
  assert.equal(at(50).static_hold, true, "camera holds 0..99 → a legitimate static hold"); assert.equal(at(200).camera_moving, true); assert.equal(at(200).static_hold, false, "a push-in is not a hold");
  assert.ok(at(200).assets.some((a) => a.id === "plate" && a.delivered), "the world plate owns those pixels");
  const ix0 = buildFrameTraceIndex({ FILM: F, doc, motionPlans: {}, chunkSize: 600 }); assert.equal(ix0.segments.every((s) => s.static_hold), true, "without any camera plan the shot is honestly static (negative)");
});

test("P02-RP4 downstream reviews do not change the revision they review; upstream approvals still do", () => {
  const F = path.join(W, "rev_film"); fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(path.join(F, "handoff"), { recursive: true }); fs.mkdirSync(path.join(F, "reviews"), { recursive: true });
  fs.writeFileSync(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify({ assets: [], stage: { width: 1920, height: 1080, fps: 60, total_frames: 7200 }, audio: {} }));
  const r0 = buildFilmRevision(F).digest, put = (scope, id) => { fs.writeFileSync(path.join(F, "reviews", `${scope}__${id}.json`), JSON.stringify({ scope, receipt_id: id })); fs.appendFileSync(path.join(F, "reviews", "HISTORY.jsonl"), JSON.stringify({ scope, receipt_id: id }) + "\n"); };
  put("shot_review", "a"); put("unlike_transfer", "b"); put("film", "c"); assert.equal(buildFilmRevision(F).digest, r0, "reviews OF a revision leave it unchanged (no self-staling cycle)");
  put("asset", "d"); assert.notEqual(buildFilmRevision(F).digest, r0, "an upstream approval is an input and changes the revision (negative)");
});

test("P02-RP5 a failed chunk surfaces its typed failure (partial segment removed after the encoder exits)", async () => {
  const F = path.join(W, "enc_film"); fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true });
  await assert.rejects(SR.renderFilm({ film: F, revision: { digest: "r" }, width: 160, height: 90, total: 240, chunkSize: 120, outName: "x.mp4", inject: { crashAt: { frame: 130, attempts: 9, transient: false } } }), (e) => e.code === "RENDER_CAPTURE_FAILURE" && /frame 130/.test(e.message));
  const dir = fs.readdirSync(path.join(F, "render", "chunks"))[0], left = fs.readdirSync(path.join(F, "render", "chunks", dir)); assert.ok(!left.some((f) => f.includes(".tmp-")), `no partial segment left: ${left}`);
  assert.ok(!fs.existsSync(path.join(F, "render", "RENDER_COMPLETION_RECEIPT.json")), "no completion receipt after a failure");
});

test("P02-RP6 transition art demand comes from the transition CONTRACT (plates + masks), for any transition id: reproduce, negative, unlike transfer", async () => {
  const { deriveArtDemands } = await import("../../engine/art_bridge/art_demand.mjs");
  const base = { actions: [], rigs: [], identities: [], worlds: [], shots: [{ id: "x", start_frame: 0, end_frame: 100 }, { id: "y", start_frame: 100, end_frame: 200 }] };
  const tr = (o) => ({ ...base, transitions: [{ from_shot: "x", to_shot: "y", frame_range: [80, 100], mode: "CONTINUOUS", ...o }] });
  // reproduce: a contract naming planned plates (mode CONTINUOUS, no `kind`) — previously never demanded/satisfied
  const d = deriveArtDemands({ doc: tr({ out_asset_ids: ["po"], middle_asset_ids: ["pm"], in_asset_ids: ["pi"], mask_or_occluder_ids: ["pa"] }), plan: { assets: ["po", "pm", "pi", "pa"].map((asset_id) => ({ asset_id })) } });
  assert.deepEqual(d.demands.map((x) => x.asset).sort(), ["pa", "pi", "pm", "po"]); assert.equal(d.missing.length, 0, "planned plates and mask satisfy the portal");
  // negative: an unplanned plate is MISSING_ART_ASSET with its frames; an unnamed part is demanded under a typed placeholder
  const n = deriveArtDemands({ doc: tr({ out_asset_ids: ["po"], middle_asset_ids: [], in_asset_ids: ["pi"], mask_or_occluder_ids: ["pa"] }), plan: { assets: [{ asset_id: "po" }, { asset_id: "pa" }] } });
  assert.deepEqual(n.missing.map((x) => x.record_id).sort(), ["pi", "x->y::MIDDLE_plate"]); assert.deepEqual(n.missing[0].frame_ranges, [[80, 100]]);
  // unlike transfer: a CUT transition demands no plates; a legacy `kind: PORTAL` contract still demands its parts
  assert.equal(deriveArtDemands({ doc: tr({ mode: "CUT" }), plan: { assets: [] } }).demands.length, 0);
  assert.equal(deriveArtDemands({ doc: { ...base, transitions: [{ from_shot: "x", to_shot: "y", kind: "PORTAL", frame_range: [90, 100] }] }, plan: { assets: [] } }).missing.length, 3);
});

test("P02-RP7 perturbed/test film copies exclude top-level outputs (render/, production/, qa/) — a copy never inherits another run's ledger or segments", async () => {
  const { perturbedCopy } = await import("../../engine/production/inert_control.mjs");
  const src = path.join(W, "copy_src"); fs.rmSync(src, { recursive: true, force: true }); for (const d of ["production/runs/X", "render/chunks", "qa/shots", "handoff", "art/render_notes"]) fs.mkdirSync(path.join(src, d), { recursive: true });
  for (const f of ["production/runs/X/a.json", "render/chunks/c.mkv", "qa/shots/q.json", "handoff/M.json", "art/render_notes/keep.txt"]) fs.writeFileSync(path.join(src, f), "x");
  const dst = perturbedCopy(src, path.join(W, "copy_dst"), () => {});
  assert.ok(!fs.existsSync(path.join(dst, "production")) && !fs.existsSync(path.join(dst, "render")) && !fs.existsSync(path.join(dst, "qa")), "top-level outputs are not copied (reproduces the leaked-ledger defect)");
  assert.ok(fs.existsSync(path.join(dst, "handoff", "M.json")) && fs.existsSync(path.join(dst, "art", "render_notes", "keep.txt")), "inputs and nested folders that merely contain the word are kept (negative)");
});

test("P02-RP8 expected-state hash covers VISIBLE state only: hidden rows that keep animating are not expected motion (no false FROZEN_FRAME)", async () => {
  const { visibleStateSha } = await import("../../engine/film/chrome_frames.mjs");
  const vis = [["a", "matrix(1 0 0 1 0 0)", 1, 1]], hid = (x) => [...vis, ["fx0", `matrix(1 0 0 1 ${x} 0)`, 0, 1]], shown = (x) => [...vis, ["fx0", `matrix(1 0 0 1 ${x} 0)`, 1, 1]];
  assert.equal(visibleStateSha(hid(10)), visibleStateSha(hid(20)), "hidden element moving → same expected visible state (reproduces the rehearsal-I false positive)");
  assert.notEqual(visibleStateSha(shown(10)), visibleStateSha(shown(20)), "a VISIBLE element moving is expected motion (negative)");
  assert.notEqual(visibleStateSha(hid(10)), visibleStateSha(shown(10)), "appearing/disappearing is a state change");
});

test("P02-RP9 handoff outputs resolve from the store OR the named film file with that exact hash; changed/missing outputs are refused", async () => {
  const S = await import("../../engine/production/stages.mjs"), L = await import("../../engine/production/ledger.mjs"), crypto = await import("node:crypto");
  const F = path.join(W, "handoff_refs"); fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(path.join(F, "render", "chunks"), { recursive: true });
  const seg = path.join(F, "render", "chunks", "seg.mkv"); fs.writeFileSync(seg, "segment bytes"); const h = crypto.createHash("sha256").update(fs.readFileSync(seg)).digest("hex");
  assert.equal(S.refUnresolvable(F, { name: "render/chunks/seg.mkv", sha256: h }), null, "a large segment referenced in place resolves (reproduces the rehearsal-J S07→S08 block)");
  const stored = L.putBytes(F, Buffer.from("stored")); assert.equal(S.refUnresolvable(F, { name: "nowhere", sha256: stored.sha256 }), null, "a store object resolves");
  fs.appendFileSync(seg, "x"); assert.match(S.refUnresolvable(F, { name: "render/chunks/seg.mkv", sha256: h }), /differ/, "a changed segment is refused (negative)");
  assert.match(S.refUnresolvable(F, { name: "render/chunks/none.mkv", sha256: h }), /neither the content store/); assert.match(S.refUnresolvable(F, { name: "../escape", sha256: h }), /neither/, "no path escape");
});

test("P02-RP10 sub-frame (shutter) sample times keep their integer frame's shot, camera and actions; continuous motion interpolates", async () => {
  const { runRoundTrip } = await import("../art_bridge/roundtrip_fixture.mjs"), rt = await runRoundTrip(path.join(W, "rp10")); // builds its own film through the real intake (no vacuous skip)
  const { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs");
  const reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), plan = JSON.parse(fs.readFileSync(path.join(rt.film, "handoff", "MOTION_PLAN.json"), "utf8")), C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan });
  const w0 = stateAtFrame(C, 3800), w5 = stateAtFrame(C, 3800.5, { subframe: true }), w1 = stateAtFrame(C, 3801);
  assert.equal(w5.shotId, "rt_world_shot"); assert.equal(w5.camera.id, "cam_world", "the sub-frame keeps its shot's camera track (reproduces the default-camera defect)");
  assert.ok(w5.camera.zoom > Math.min(w0.camera.zoom, w1.camera.zoom) - 1e-9 && w5.camera.zoom < Math.max(w0.camera.zoom, w1.camera.zoom) + 1e-9 && w0.camera.zoom !== w1.camera.zoom, "camera zoom interpolates between the integer frames");
  const m = (s) => JSON.stringify(s.matrices), c0 = stateAtFrame(C, 355), c5 = stateAtFrame(C, 355.5, { subframe: true }), c1 = stateAtFrame(C, 356);
  assert.equal(c5.shotId, "rt_shot"); assert.notEqual(m(c5), m(c0)); assert.notEqual(m(c5), m(c1), "the acting rig is driven (action not skipped) and lands between the integer frames");
  assert.throws(() => stateAtFrame(C, 355.5), RangeError, "without the explicit sub-frame opt-in a fractional frame is still refused (negative)");
});
