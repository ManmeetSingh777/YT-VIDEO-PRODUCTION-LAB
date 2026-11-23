// P02-R22 (F088): every effective control input reaches its REAL consumer and changes that consumer's output; an inert choice is refused
// with INERT_CONTROL. Probes run on copies of the DIAGNOSTIC rehearsal film (built through the real intake API).
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { differential } from "../../engine/production/inert_control.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "control");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), edit = (rel, fn) => (F) => { const f = path.join(F, rel), o = J(f); fn(o); fs.writeFileSync(f, JSON.stringify(o, null, 1)); };
let FILM;
before(async () => { const src = path.resolve(REPO, process.env.P02_REHEARSAL_FILM || path.join("hybrid_v2", "work", "p02", "rehearsal_J", "rt", "film")); FILM = path.join(W, "base");
  if (!fs.existsSync(path.join(src, "REHEARSAL_LABEL.txt"))) { const { buildRehearsalFilm } = await import("./rehearsal_film.mjs"); await buildRehearsalFilm(path.join(W, "built")); fs.cpSync(path.join(W, "built", "rt", "film"), FILM, { recursive: true }); }
  else { fs.rmSync(FILM, { recursive: true, force: true }); fs.cpSync(src, FILM, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(src, s)) }); } });
const D = (decision, mutate, consumer, args) => differential({ FILM, workDir: W, decision, mutate, consumer, args });

test("P02-R22 motion decisions reach the browser-applied render state: joint key, effect seed (character family) and camera key (world family)", async () => {
  assert.equal((await D("plan.elbow_r@420", edit("handoff/MOTION_PLAN.json", (p) => { p.tracks.pilot_rig.joints.elbow_r[2][1] = 60; }), "render_state", { frames: [450] })).live, true);
  assert.equal((await D("plan.effects.dust.seed", edit("handoff/MOTION_PLAN.json", (p) => { p.effects[0].seed = 8; }), "render_state", { frames: [1000] })).live, true);
  assert.equal((await D("plan.cam_world.zoom", edit("handoff/MOTION_PLAN.json", (p) => { p.cameras.cam_world.zoom[2][1] = 1.4; }), "render_state", { frames: [3900] })).live, true);
});
test("P02-R22 attention and art-demand decisions reach S02/S04 consumers", async () => {
  assert.equal((await D("score.rt_world_shot.attention", edit("direction/SHOT_SCORE_60FPS.json", (s) => { s.shots[1].attention_path = ["rt_world_far"]; }), "attention")).live, true);
  assert.equal((await D("manifest.pilot_close_hand.grip_frame", edit("handoff/ART_AND_MOTION_MANIFEST_V2.json", (d) => { d.actions[0].pose_events[1].frame = 200; }), "art_demand")).live, true);
});
test("P02-R22 an art-design decision and a matching repair rule change the exact compiled request; a non-matching rule is INERT for that job", async () => {
  assert.equal((await D("design.method_decision[0]", edit("art_designs/pilot_master.design.json", (d) => { d.method_decisions[0].specific_decision += " (perturbed: thicker silhouette contour)"; }), "request_prompt", { asset: "pilot_master" })).live, true);
  const ctxRule = (applies) => edit("learning/REPAIR_MEMORY.json", (m) => { m.rules = [...(m.rules || []), { rule_id: "P02_PROBE_RULE", scope: "CONDITIONAL_FAMILY", status: "REPAIR_DEMONSTRATED", applies_when: applies, root_cause: "DIAGNOSTIC PROBE ONLY (control-reachability test, not a learned repair)", first_request_change: "PROBE: state the palm-centre contact patch explicitly", positive_construction_ops: ["PROBE_OP draw the palm-centre contact patch as one flat shape"], source_contrast: "DIAGNOSTIC probe: no source contrast was observed", observed_improvement: "DIAGNOSTIC probe: no improvement was observed", regression_boundary: "DIAGNOSTIC probe film copy only", before_sha256: "1".repeat(64), after_sha256: "2".repeat(64) }]; });
  const job = J(path.join(FILM, "art_designs", "pilot_master.design.json"));
  const fam = job.learning_context?.family || job.art_family || job.first_pass_control?.subject_specs?.[0]?.family || "UNSPECIFIED";
  const live = await differential({ FILM, workDir: W, decision: "rule.matching", mutate: ctxRule({ family: fam }), consumer: "request_prompt", args: { asset: "pilot_master" }, throwOnInert: false });
  const inert = await differential({ FILM, workDir: W, decision: "rule.nonmatching", mutate: ctxRule({ family: "NO_SUCH_FAMILY" }), consumer: "request_prompt", args: { asset: "pilot_master" }, throwOnInert: false });
  assert.equal(inert.live, false, "a rule whose predicate does not match must not alter this job"); fs.writeFileSync(path.join(W, "RULE_PROBE.json"), JSON.stringify({ family: fam, live, inert }, null, 1));
  assert.equal(live.live, true, `a matching rule must reach the first-pass request (family ${fam})`);
});
test("P02-R22 negative: a field no consumer reads is refused as INERT_CONTROL", async () => {
  await assert.rejects(D("shot.hold_purpose", edit("handoff/ART_AND_MOTION_MANIFEST_V2.json", (d) => { d.shots[0].hold_purpose = "changed words nobody consumes"; }), "render_state", { frames: [0, 450, 3900] }), (e) => e.code === "INERT_CONTROL");
});
