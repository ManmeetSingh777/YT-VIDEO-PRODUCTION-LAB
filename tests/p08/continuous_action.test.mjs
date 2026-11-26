// Continuous action lifetime vs shot visibility (E01 P3.2: A01 [0,960), A03 [0,882), A27 [404,960) run through the f444/f588 cuts).
// Proof through the real loader, motion compiler and runtime. A measured fixture shot is split by a same-world CUT, and its action is declared as a
// continuous parent (shot_span). The runtime state on EVERY frame then equals the unsplit film's state: nothing restarts, resets, releases, re-grips
// or duplicates at the cut. Without the declaration the loader refuses the action, and the old shot gate would drop its cels after the cut.
import test, { after } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { validatePacket } from "../../engine/story/creative_packet.mjs";
import { shotSegments, verifySegments, shotLocalView, validateShotSpan, actionInShot } from "../../engine/story/action_span.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), FIX = path.join(here, "..", "art_bridge", "fixtures"), S2 = path.join(FIX, "stage2");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), made = [];
after(() => { for (const f of made) fs.rmSync(f, { force: true }); });
const CUT = 300;
/** split(k, {span}) → the scene manifest with its one shot cut at CUT into two shots of the SAME world, written beside the fixture */
function split(k, { span = true, world2 = null } = {}) {
  const m = J(path.join(S2, `scene_${k}.manifest.json`)), s = m.shots[0], s1 = { ...s, id: `${s.id}_1`, end_frame: CUT }, s2 = { ...s, id: `${s.id}_2`, start_frame: CUT, ...(world2 ? { world_id: world2 } : {}) };
  m.shots = [s1, s2];
  m.transitions = [{ from_shot: s1.id, to_shot: s2.id, frame_range: [CUT - 1, CUT + 1], mode: "CUT", reason: "diagnostic same-room cut (continuity proof)", continuity_invariant: "same world clock, actor, grip, plant and props; nothing restarts", out_asset_ids: [], middle_asset_ids: [], in_asset_ids: [], shared_landmarks: [], camera_correspondence: null, mask_or_occluder_ids: [], assembly_review_id: null }];
  m.actions = m.actions.map((a) => { const o = { ...a, shot_id: s1.id }; if (span && a.frame_range[1] > CUT) o.shot_span = [s1.id, s2.id]; return o; });
  const rel = `stage2/_span_${k}_${span ? "on" : "off"}${world2 ? "_w" : ""}_${process.pid}.manifest.json`; fs.writeFileSync(path.join(FIX, rel), JSON.stringify(m)); made.push(path.join(FIX, rel)); return rel;
}
// persist: the compiled form of an approved CONTACT_CONTINUITY declaration (engine/art_bridge/performance_commands.mjs writes exactly these fields
// on a grip command's contact): the contact is one physical contact across the cut, VISIBLE in both shots
const compile = async (rel, k, { persist = false } = {}) => { const reg = await createAssetRegistry(FIX, rel); let doc = reg.doc;
  if (persist) doc = { ...doc, actions: doc.actions.map((a) => ({ ...a, contact_events: a.contact_events.map((c) => (c.start_frame < CUT && CUT < c.end_frame ? { ...c, persists_across_shots: true, shot_visibility: Object.fromEntries(doc.shots.map((s) => [s.id, "VISIBLE"])) } : c)) })) };
  return compileMotionTracks(doc.actions, doc.shots, { doc, plan: J(path.join(S2, `scene_${k}.plan.json`)) }); };
const sig = (st) => JSON.stringify({ passes: st.passes, contacts: st.contacts, cels: st.cels, deforms: st.deforms, morphs: st.morphs, failures: (st.failures || []).map((f) => f.code) });

test("SPAN-1 runtime: a gripped crank and a planted foot run through a same-world cut with every frame identical to the unsplit film", async () => {
  const rel = split("A"); await assert.rejects(compile(rel, "A"), (e) => e.errors.filter((x) => x.code === "CONTACT_CONTINUITY_UNMAPPED").length === 2, "a contact crossing the cut is still refused until it is declared persistent with per-shot visibility");
  const base = await compile("stage2/scene_A.manifest.json", "A"), cut = await compile(rel, "A", { persist: true });
  const a = (await createAssetRegistry(FIX, rel)).doc.actions[0]; assert.deepEqual(a.shot_span, ["shotA_1", "shotA_2"]);
  for (let f = 0; f < 600; f++) assert.equal(sig(stateAtFrame(cut, f)), sig(stateAtFrame(base, f)), `frame ${f}: the cut changed the action's state`);
  for (const f of [CUT - 1, CUT]) { const st = stateAtFrame(cut, f); assert.ok(st.contacts.some((c) => c.contact_type === "GRIP" && c.locked), `f${f}: the grip is held across the cut (no release)`); assert.ok(st.contacts.some((c) => c.contact_type === "PLANT"), `f${f}: the foot stays planted`); }
});
test("SPAN-2 runtime: registered gait cels keep their entry index through the cut (celsAt gates on actionInShot, not on the owning shot)", async () => {
  const base = await compile("stage2/scene_B.manifest.json", "B"), cut = await compile(split("B"), "B");
  for (let f = 0; f < 600; f++) assert.equal(sig(stateAtFrame(cut, f)), sig(stateAtFrame(base, f)), `frame ${f}`);
  const [b, c] = [stateAtFrame(cut, CUT - 1).cels[0], stateAtFrame(cut, CUT).cels[0]]; assert.ok(b && c, "a cel is drawn on both sides of the cut"); assert.ok(c.entry_index - b.entry_index <= 1, "the cycle continues (no restart at entry 0)");
  assert.equal(stateAtFrame(base, CUT).cels[0].entry_index, c.entry_index);
});
test("SPAN-3 refusals: an undeclared cross-cut action, a span into another world, an unneeded span, and a span that skips footage", async () => {
  await assert.rejects(createAssetRegistry(FIX, split("A", { span: false })), (e) => e.errors.some((x) => x.code === "INVALID_FRAME_RANGE" && /inside its shot/.test(x.human_readable_reason || x.reason || "")));
  await assert.rejects(createAssetRegistry(FIX, split("A", { world2: "another_world" })), (e) => e.errors.some((x) => /SHOT_SPAN_WORLD_CHANGE/.test(x.human_readable_reason || x.reason || "")));
  const shots = new Map([["s1", { frames: [0, 100], world_id: "w" }], ["s2", { frames: [100, 200], world_id: "w" }], ["s3", { frames: [200, 300], world_id: "w" }]]), T = [{ from_shot: "s1", to_shot: "s2", continuity_invariant: "same room, no restart" }, { from_shot: "s2", to_shot: "s3", continuity_invariant: "same room, no restart" }];
  const codes = (a, t = T) => validateShotSpan(a, { shots, transitions: t }).map((x) => x.code);
  assert.deepEqual(codes({ shot_id: "s1", shot_span: ["s1", "s2"], frames: [10, 150] }), []);
  assert.ok(codes({ shot_id: "s1", shot_span: ["s1", "s2"], frames: [10, 90] }).includes("SHOT_SPAN_UNNEEDED"));
  assert.ok(codes({ shot_id: "s1", shot_span: ["s1", "s3"], frames: [10, 250] }).includes("SHOT_SPAN_NOT_CONTIGUOUS"));
  assert.ok(codes({ shot_id: "s2", shot_span: ["s1", "s2"], frames: [10, 150] }).includes("SHOT_SPAN_INVALID"), "the span starts with the owning shot");
  assert.ok(codes({ shot_id: "s1", shot_span: ["s1", "s2"], frames: [10, 250] }).includes("INTERVAL_OUTSIDE_OWNER"), "the action may not run past its last spanned shot");
  assert.ok(codes({ shot_id: "s1", shot_span: ["s1", "s2"], frames: [10, 150] }, [{ from_shot: "s1", to_shot: "s2", continuity_invariant: "" }]).includes("SHOT_SPAN_JOIN_UNDECLARED"));
});
test("SPAN-4 shot-local transport: fragments carry lineage and absolute frames, tile the parent, and hold every event exactly once; a duplicated or re-started fragment is refused", () => {
  const shots = [{ id: "SH01", frames: [0, 444] }, { id: "SH02", frames: [444, 588] }, { id: "SH03", frames: [588, 960] }];
  const A03 = { id: "A03", shot_id: "SH01", shot_span: ["SH01", "SH02", "SH03"], frames: [0, 882], phases: [{ name: "p1", frames: [0, 271] }, { name: "p2", frames: [271, 591] }, { name: "p3", frames: [591, 882] }],
    pose_events: [{ frame: 100 }, { frame: 443 }, { frame: 444 }, { frame: 700 }], view_events: [{ frame: 587 }], state_events: [{ frame: 588 }], contact_events: [{ frames: [0, 882], release_required: false }] };
  const segs = shotSegments(A03, shots); assert.equal(segs.length, 3); assert.deepEqual(segs.map((s) => s.frames), [[0, 444], [444, 588], [588, 882]]);
  assert.ok(segs.every((s) => s.parent_action_id === "A03" && s.parent_frames.join() === "0,882")); assert.deepEqual(segs.map((s) => s.continues_into), ["A03@SH02", "A03@SH03", null]);
  assert.deepEqual(segs.map((s) => s.events.map((e) => e.frame)), [[100, 443], [444, 587], [700, 588]], "f443 stays before the cut, f444/f587 in SH02, f588 after: each in the shot that shows it");
  assert.equal(verifySegments(A03, segs).ok, true, JSON.stringify(verifySegments(A03, segs).failures));
  assert.equal(segs[1].phases[0].name, "p2"); assert.ok(segs[1].phases[0].continued_from_cut && segs[1].phases[0].continues_past_cut, "the phase spanning both cuts is one phase, continued");
  const dup = segs.map((s) => ({ ...s, events: [...s.events] })); dup[1].events.push({ ...segs[0].events[1] }); assert.ok(verifySegments(A03, dup).failures.some((f) => f.code === "SEGMENT_EVENT_COUNT"));
  const regrip = segs.map((s) => ({ ...s, contacts: s.contacts.map((c) => ({ ...c, begins_here: true })) })); assert.ok(verifySegments(A03, regrip).failures.some((f) => f.code === "SEGMENT_CONTACT_RESTART"));
  const gap = segs.filter((_, i) => i !== 1); assert.ok(verifySegments(A03, gap).failures.some((f) => f.code === "SEGMENT_COVERAGE"));
  const v = shotLocalView(A03, shots[1]); assert.deepEqual(v.frames, [444, 588]); assert.deepEqual(v.pose_events.map((e) => e.frame), [444]); assert.ok(v.contact_events[0].continued_from_cut && v.contact_events[0].continues_past_cut && !v.contact_events[0].release_required);
  assert.ok(actionInShot(A03, "SH02") && !actionInShot({ shot_id: "SH01" }, "SH02"));
});
test("SPAN-5 packet validator: the strict per-shot rule is unchanged without a span; a declared span is validated, not waived", async () => {
  const { buildPacket } = await import("../p05/packet_fixture.mjs"), os = await import("node:os"), dir = fs.mkdtempSync(path.join(os.tmpdir(), "span5-"));
  try { const p = buildPacket(dir), ok = validatePacket(p); assert.equal(ok.status, "STRUCTURAL_VALID", JSON.stringify(ok.errors.slice(0, 3)));
    const long = structuredClone(p), a = long.actions.find((x) => x.id === "a_pull"); a.frames = [50, 300]; a.phases.at(-1).frames[1] = 300; // runs past sh_pull [0,270)
    assert.ok(validatePacket(long).errors.some((e) => e.code === "INTERVAL_OUTSIDE_OWNER" && e.id === "a_pull"), "no span: refused exactly as before");
    a.shot_span = ["sh_pull", "sh_watch"]; assert.ok(validatePacket(long).errors.some((e) => e.code === "SHOT_SPAN_WORLD_CHANGE" && e.id === "a_pull"), "sh_pull (w_room) → sh_watch (w_cave): a span never crosses into another world");
  } finally { fs.rmSync(dir, { recursive: true, force: true }); }
});
