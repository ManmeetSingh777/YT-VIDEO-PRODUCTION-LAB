// P08 C05 — directed readable-attention windows on the target's ACTUAL visible pixels (registered alpha, shot camera, frame clip, renderer paint
// order), every frame of each window. Negatives: the actor walks offscreen while the background still fills the frame; the camera pans away (camera
// hides the failure); a later-painted prop covers the actor; a window shorter than the readable minimum; an accidental empty attention interval; an
// unknown target. DIAGNOSTIC two-biped fixture; bounded to the first 120 frames.
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs"), { verifyAttention } = await import("../../engine/art_bridge/framing.mjs");
const { rt } = await CF.film(), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, SH = CF.SHOT_IDS[0], T = 120;
const plan = ({ prims = [], cam = null, paint = [] } = {}) => ({ ...CF.basePlan(), ...(cam ? { cameras: { cam_1: cam } } : {}), paint_order: paint, composition: { schema_version: "1.0.0", primitives: prims } });
const score = (att) => ({ shots: [{ shot: SH, attention: att }] }), KADE = [{ frames: [0, T], target: "kade_rig" }];
const run = (p, att = KADE, policy = {}) => verifyAttention({ film: rt.film, compiled: compileMotionTracks(doc.actions, doc.shots, { doc, plan: p, requireApproval: false }), registry: reg, doc, plan: p, score: score(att), total: T, policy });
const codes = (r) => r.failures.map((f) => f.code);
test("C05 attention windows: a readable target passes on every frame; offscreen actor, camera that hides it, covering prop, short window, empty interval and unknown target fail", () => {
  const ok = run(plan()); assert.deepEqual(ok.failures.map((f) => f.human_readable_reason), []); assert.equal(ok.windows[0].frames_checked, T); assert.ok(ok.windows[0].min_fraction > 0.95, `kade fully visible (${ok.windows[0].min_fraction})`);
  // the actor leaves frame while the world background still fills the picture
  const off = run(plan({ prims: [{ id: "kade_leave", kind: "ROOT_MOVE", owner: "kade_rig", frames: [0, T], inputs: { x: [[0, 0], [40, 0], [80, 1700, "sine.inOut"], [119, 1700]] }, expected_effect: { kind: "ROOT_PATH" } }] }));
  const u = off.failures.find((f) => f.code === "ATTENTION_TARGET_UNREADABLE"); assert.ok(u, JSON.stringify(codes(off))); assert.ok(u.frame_range[0] > 40 && u.frame_range[0] < 80, `fails once kade has left (${u.frame_range})`);
  // the camera pans away from the (still) actor — camera motion is no proof
  const pan = run(plan({ cam: { x: [[0, 820], [40, 820], [100, 2600, "sine.inOut"], [119, 2600]], y: [[0, 520]], zoom: [[0, 1.0]] } })); assert.ok(codes(pan).includes("ATTENTION_TARGET_UNREADABLE"));
  // a prop painted ABOVE kade slides over him: covered pixels are not visible pixels
  const cover = run(plan({ paint: [{ above: "box_rig", below: "kade_rig" }], prims: [{ id: "box_cover", kind: "ROOT_MOVE", owner: "box_rig", frames: [0, T], inputs: { x: [[0, 0], [30, -740, "sine.inOut"], [119, -740]], y: [[0, 0], [30, -60, "sine.inOut"], [119, -60]] }, expected_effect: { kind: "ROOT_PATH" } }] }), KADE, { min_visible_fraction: 0.97 });
  assert.ok(codes(cover).includes("ATTENTION_TARGET_UNREADABLE"), `covering prop: ${JSON.stringify(cover.windows[0])}`); assert.ok(cover.windows[0].min_fraction < 0.97 && cover.windows[0].min_fraction > 0, "partly hidden, not offscreen");
  assert.ok(codes(run(plan(), [{ frames: [0, 8], target: "kade_rig" }, { frames: [8, T], target: "pim_rig" }])).includes("ATTENTION_WINDOW_TOO_SHORT"));
  const gap = run(plan(), [{ frames: [0, 50], target: "kade_rig" }, { frames: [70, T], target: "pim_rig" }]); assert.deepEqual(gap.failures.find((f) => f.code === "ATTENTION_GAP")?.frame_range, [50, 70]);
  assert.ok(codes(run(plan(), [{ frames: [0, T], target: "nobody" }])).includes("ATTENTION_TARGET_UNKNOWN"));
});
test("C05 painted world plates occlude: the P05 cave's FOREGROUND rock hides lumen during its attention window (the actor is drawn, the viewer cannot read it)", { timeout: 1800000 }, async () => {
  const { buildPacketFilm } = await import("../p05/packet_film.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs"), fs = await import("node:fs"), path = await import("node:path");
  const b = await buildPacketFilm(isolatedWork("p08_c05_p05")), F = b.film, R = await createAssetRegistry(F, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), d = R.doc, pl = JSON.parse(fs.readFileSync(path.join(F, "handoff", "MOTION_PLAN.json"), "utf8"));
  const C = compileMotionTracks(d.actions, d.shots, { doc: d, plan: pl, requireApproval: false }), r = verifyAttention({ film: F, compiled: C, registry: R, doc: d, plan: pl, score: { shots: [{ shot: "sh_watch", attention: [{ frames: [270, 450], target: "lumen_rig" }] }] } });
  const w = r.windows.find((x) => x.target === "lumen_rig"); assert.equal(w.frames_checked, 180, "lumen is drawn on every frame"); assert.ok(w.min_fraction < 0.5, `the rock covers lumen (${w.min_fraction})`); assert.ok(r.failures.some((f) => f.code === "ATTENTION_TARGET_UNREADABLE" && f.record_id === "lumen_rig"));
  const wo = verifyAttention({ film: F, compiled: C, registry: R, doc: { ...d, worlds: d.worlds.map((x) => ({ ...x, depth_owners: x.depth_owners.filter((o) => o.depth_band !== "FOREGROUND") })) }, plan: pl, score: { shots: [{ shot: "sh_watch", attention: [{ frames: [270, 450], target: "lumen_rig" }] }] } });
  assert.ok(wo.windows[0].min_fraction > w.min_fraction, "without the rock plate lumen is more visible: the plate is what hides it");
});
