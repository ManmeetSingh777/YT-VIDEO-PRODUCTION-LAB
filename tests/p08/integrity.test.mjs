// P08 B05 (seam/silhouette integrity on real alpha, every frame of a bend) and B08 (declared support intent + collision policy). DIAGNOSTIC fixtures.
import test from "node:test"; import assert from "node:assert/strict";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const F = await import("../tbo/support_fixture.mjs"), CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks, stateAtFrame } = await import("../../engine/art_bridge/temporal.mjs"), IQ = await import("../../engine/film/integrity_qa.mjs");
const P07 = await F.film(), reg7 = await createAssetRegistry(P07.rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc7 = reg7.doc, clone = (o) => JSON.parse(JSON.stringify(o));
const CH = await CF.film(), regC = await createAssetRegistry(CH.rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), docC = regC.doc;
// B05 runs on the P01 round-trip film: flat-ended bones (a capsule would close the joint by itself) with an owned elbow underpaint, and that film's
// own directed elbow bend; the seam ring sits inside the bone width, so only a bend can open it
const { runRoundTrip } = await import("../art_bridge/roundtrip_fixture.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs"), fsx = await import("node:fs"), pathx = await import("node:path");
const RT = await runRoundTrip(isolatedWork("p08_b05_rt")), regR = await createAssetRegistry(RT.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), docR = regR.doc, planR = JSON.parse(fsx.readFileSync(pathx.join(RT.film, "handoff", "MOTION_PLAN.json"), "utf8"));
const CR = compileMotionTracks(docR.actions, docR.shots, { doc: docR, plan: planR, requireApproval: false }), elbowAt = (Cx, f) => { const M = stateAtFrame(Cx, f).matrices.pilot_rig; return Math.abs(((Math.atan2(M.elbow_r[1], M.elbow_r[0]) - Math.atan2(M.shoulder_r[1], M.shoulder_r[0])) * 180 / Math.PI + 540) % 360 - 180); };
const FR = [...Array(CR.totalFrames)].map((_, i) => i).filter((f) => CR.shotAt(f)?.id === "rt_shot"), SEAM = { id: "pilot_elbow_r", rig: "pilot_rig", joint: "elbow_r", radius_px: 10, parts: ["pilot_upper_arm", "pilot_forearm", "pilot_underpaint"], samples: 32 };
test("B05 seam integrity on the registered alpha: covered on every frame with the owned underpaint; without it the bend opens a hole on middle frames only; straight frames need none", () => {
  const ok = IQ.verifySeams(CR, RT.film, [SEAM], FR); assert.ok(ok.ok, ok.results[0].reason); assert.equal(ok.results[0].frames_checked, FR.length);
  const no = IQ.verifySeams(CR, RT.film, [{ ...SEAM, parts: ["pilot_upper_arm", "pilot_forearm"] }], FR); assert.ok(!no.ok && no.results[0].holes > 0 && /unpainted hole/.test(no.results[0].reason), "without the hidden-surface paint the bent elbow opens a hole");
  const holeFrames = FR.filter((f) => !IQ.verifySeams(CR, RT.film, [{ ...SEAM, parts: ["pilot_upper_arm", "pilot_forearm"] }], [f]).ok), straight = FR.filter((f) => elbowAt(CR, f) < 20);
  assert.ok(holeFrames.length > 0 && holeFrames.every((f) => elbowAt(CR, f) > 20), `holes only where the elbow is bent (${holeFrames.length} frames, min bend ${Math.min(...holeFrames.map((f) => elbowAt(CR, f))).toFixed(1)}°)`); assert.ok(straight.length > 0 && straight.every((f) => !holeFrames.includes(f)), "straight frames need no underpaint");
  const d = clone(docR); d.rigs.find((r) => r.id === "pilot_rig").render_parts.find((p) => p.asset_id === "pilot_forearm").local_to_joint_matrix = [1.15, 0, 0, 1.15, 0, 0];
  const Cs = compileMotionTracks(d.actions, d.shots, { doc: d, plan: { ...planR, tracks: { ...planR.tracks, pilot_rig: { ...(planR.tracks?.pilot_rig || {}), root: { ...(planR.tracks?.pilot_rig?.root || {}), scale: [[0, 1], [FR.at(-1), 1.2]] } } } }, requireApproval: false });
  assert.match(IQ.verifySeams(Cs, RT.film, [SEAM], FR).results[0].reason ?? "", /scale changes/, "a part whose drawn scale changes over the shot is a stretched limb");
});
test("B08 support intents and collision policy: grounded feet, held prop, offstage owner; floating, sinking, unheld, same-depth interpenetration fail; occlusion at different depths is not a collision", () => {
  const compC = (prims, extra = {}) => compileMotionTracks(docC.actions, docC.shots, { doc: docC, plan: { ...CF.basePlan(), ...extra, composition: { schema_version: "1.0.0", primitives: prims } }, requireApproval: false });
  const C0 = compC([]), ground = C0.socketWorld("kade_rig", stateAtFrame(C0, 0).matrices.kade_rig, "kade_sole_l")[1], G = (o = {}) => ({ owner: "kade_rig", intent: "GROUNDED", frames: [0, 120], sockets: ["kade_sole_l", "kade_sole_r"], ground_y: ground, ...o });
  assert.ok(IQ.verifySupportIntents(C0, [G()]).ok);
  const up = compC([{ id: "hop", kind: "ROOT_MOVE", owner: "kade_rig", frames: [20, 80], inputs: { y: [[0, 0], [30, -30, "sine.out"], [59, 0, "sine.in"]] }, expected_effect: { kind: "R" } }]); assert.match(IQ.verifySupportIntents(up, [G()]).results[0].reason, /floats/, "a GROUNDED actor that leaves the ground");
  const down = compC([{ id: "sink", kind: "ROOT_MOVE", owner: "kade_rig", frames: [20, 80], inputs: { y: [[0, 0], [30, 12]] }, expected_effect: { kind: "R" } }]); assert.match(IQ.verifySupportIntents(down, [G()]).results[0].reason, /sinks/);
  assert.match(IQ.verifySupportIntents(C0, [{ owner: "sheet_rig", intent: "HELD", frames: [0, 10] }]).results[0].reason, /no valid driver/, "a prop declared HELD with nobody holding it");
  const away = { ...CF.basePlan() }; away.placements.token_rig = { x: 5000, y: 600, scale: 1 }; const Co = compileMotionTracks(docC.actions, docC.shots, { doc: docC, plan: away, requireApproval: false });
  assert.ok(IQ.verifySupportIntents(Co, [{ owner: "token_rig", intent: "OFFSTAGE", frames: [0, 10] }]).ok); assert.ok(!IQ.verifySupportIntents(C0, [{ owner: "token_rig", intent: "OFFSTAGE", frames: [0, 10] }]).ok, "declared offstage but in frame");
  const meet = compC([{ id: "pim_into_kade", kind: "ROOT_MOVE", owner: "pim_rig", frames: [0, 100], inputs: { x: [[0, 0], [99, -470, "linear"]] }, expected_effect: { kind: "R" } }]), pair = { a: "kade_rig", b: "pim_rig", frames: [0, 100], allowance_px: 4 };
  assert.ok(IQ.verifyCollisions(C0, [pair]).ok, "apart: no collision"); const col = IQ.verifyCollisions(meet, [pair]); assert.ok(!col.ok && col.results[0].max_penetration_px > 4, `same-depth interpenetration (${col.results[0].max_penetration_px}px)`);
  assert.equal(IQ.verifyCollisions(meet, [{ ...pair, same_depth: false }]).results[0].skipped, "OCCLUSION_NOT_COLLISION (declared different depths)", "layered art at different depths is an occlusion, not a 2D collision");
});
