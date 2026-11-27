process.env.ART_BRIDGE_TEST_TRUST = "1"; // diagnostic fixture film only
// Consolidated ordered plan: one export carries every remaining stage plus a repair seed with its compiled source-attached repair edit; one return
// is imported stage by stage with lineage verification, MACHINE_GPT selection only for intermediate PASS stages, the last stage left for a human,
// and the chain stopping at an unresolved stage or a lineage violation.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const { isolatedWork } = await import("../_lib/isolated_work.mjs"), W = isolatedWork("gpt_plan");
const { runRoundTrip } = await import("./roundtrip_fixture.mjs"), PL = await import("../../engine/art_bridge/gpt_plan.mjs"), B = await import("../../engine/art_bridge/gpt_batch.mjs"), { writeRGBA } = await import("../../engine/art_bridge/png.mjs"), { listSelections } = await import("../../engine/art_bridge/candidate_store.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
const png = (f, size, seed) => { const [w, h] = size.split("x").map(Number), px = Buffer.alloc(w * h * 4); for (let i = 0; i < w * h; i++) { const x = i % w, y = (i / w) | 0; px[i * 4] = (x * 3 + seed * 17) & 255; px[i * 4 + 1] = (y * 5 + seed) & 255; px[i * 4 + 2] = seed & 255; px[i * 4 + 3] = (x - w / 2) ** 2 + (y - h / 2) ** 2 < (h / 3) ** 2 ? 255 : 0; } fs.mkdirSync(path.dirname(f), { recursive: true }); writeRGBA(f, w, h, px); return fsha(f); };
const zip = (dir, z) => execFileSync("python", ["-I", "-c", "import sys,os,zipfile\nwith zipfile.ZipFile(sys.argv[2],'w') as z:\n  for d,_,fs in os.walk(sys.argv[1]):\n    for f in fs: p=os.path.join(d,f); z.write(p,os.path.relpath(p,sys.argv[1]))", dir, z]);
const rt = await runRoundTrip(path.join(W, "rt")), cur = J(path.join(rt.outbox, "CURRENT.json")), jobs = Object.keys(cur).filter((j) => B.nextStage({ out: rt.outbox, job: j }).eligible && B.nextStage({ out: rt.outbox, job: j }).stages >= 3).slice(0, 2);
const S = {};
test("GP-1 export-plan: all remaining stages in order, the seed and its compiled repair edit, witnesses once, one execution protocol", async () => {
  assert.ok(jobs.length >= 2, "two 3-stage jobs available"); const size0 = J(path.join(rt.outbox, "gpt_handoffs", (await (await import("../../engine/art_bridge/gpt_handoff.mjs")).exportGptJob({ film: rt.film, out: rt.outbox, job: jobs[0], stage: 1 })).handoff_id, "HANDOFF_MANIFEST.json")).size;
  const seedF = path.join(W, "seed.png"), seedSha = png(seedF, size0, 9); S.size = size0; S.seedSha = seedSha;
  const audit = { current_stage: { preserve: "keep the face and palette", method_findings: "F01: legs cut by the canvas edge", repair_instruction: "extend the legs inside a transparent margin", falsification_retest: "whole silhouette at 1/10 scale" }, unresolved_blockers: ["figure touches the bottom edge"] };
  const r = await PL.exportPlan({ film: rt.film, out: rt.outbox, jobs, maxStage: { [jobs[1]]: 1 }, seeds: { [jobs[0]]: [{ file: seedF, sha256: seedSha, audit, directive: "make the legs complete" }] } }); S.r = r; const dir = path.join(rt.outbox, "gpt_plans", r.plan_id);
  const e0 = r.manifest.entries.find((e) => e.artjob === jobs[0]), e1 = r.manifest.entries.find((e) => e.artjob === jobs[1]);
  assert.deepEqual(e0.stages.map((s) => s.stage), [1, 2, 3]); assert.deepEqual(e1.stages.map((s) => s.stage), [1]); assert.equal(e1.final_stage_is_job_final, false);
  for (const s of e0.stages) assert.equal(sha(fs.readFileSync(path.join(dir, s.prompt_file), "utf8")), s.request_sha256); assert.equal(e0.stages[1].edit_input, "THE_IMAGE_YOU_CHOSE_AT_THE_PREVIOUS_STAGE");
  const rp = fs.readFileSync(path.join(dir, e0.repair_seeds[0].repair_edit_prompt), "utf8"); for (const t of ["keep the face and palette", "legs cut by the canvas edge", "extend the legs", "make the legs complete", "figure touches the bottom edge", seedSha]) assert.ok(rp.includes(t), t);
  assert.equal(fsha(path.join(dir, e0.repair_seeds[0].seed)), seedSha); const pr = fs.readFileSync(path.join(dir, "ARTWORK_GPT_EXECUTION_PROTOCOL.md"), "utf8"); assert.match(pr, /AUTHORIZES/); assert.match(pr, /NOT a repair/); assert.match(pr, /at most 3 repair rounds/);
  assert.equal(fs.readdirSync(path.join(dir, "witnesses")).length, new Set(r.manifest.entries.flatMap((e) => e.witnesses.map((w) => w.sha256))).size);
  assert.equal(fsha(path.join(dir, "PLAN_MANIFEST.json")), fs.readFileSync(path.join(rt.outbox, "gpt_plans", `${r.plan_id}.sha256`), "utf8").trim());
});
test("GP-2 import-plan: repair lineage verified, intermediate PASS machine-selected (not human), chain continues, last stage left for the human; a held job stays unselected", async () => {
  const e0 = S.r.manifest.entries.find((e) => e.artjob === jobs[0]), e1 = S.r.manifest.entries.find((e) => e.artjob === jobs[1]), R = path.join(W, "ret"), rd = (e, k) => path.join(R, "returns", path.basename(e.folder), `stage${String(k).padStart(2, "0")}`);
  const a = png(path.join(rd(e0, 1), "r1.png"), S.size, 21), b = png(path.join(rd(e0, 1), "r2.png"), S.size, 22), c = png(path.join(rd(e0, 2), "s2.png"), S.size, 23), d = png(path.join(rd(e0, 3), "s3.png"), S.size, 24), g = png(path.join(rd(e1, 1), "g.png"), S.size, 25);
  const stage = (k, status, choice, images) => ({ stage: k, status, machine_choice: choice, images, unresolved_blockers: [] });
  fs.writeFileSync(path.join(R, "RETURN_MANIFEST.json"), JSON.stringify({ plan_id: S.r.plan_id, entries: [
    { artjob: jobs[0], stages: [stage(1, "PASS", "r2.png", [{ file: "r1.png", operation: "REPAIR_EDIT", parent_sha256: S.seedSha, round: 1 }, { file: "r2.png", operation: "REPAIR_EDIT", parent_sha256: a, round: 2 }]), stage(2, "PASS", "s2.png", [{ file: "s2.png", operation: "EDIT", parent_sha256: b, round: 1 }]), stage(3, "PASS", "s3.png", [{ file: "s3.png", operation: "EDIT", parent_sha256: c, round: 1 }])] },
    { artjob: jobs[1], stages: [stage(1, "PASS", "g.png", [{ file: "g.png", operation: "EDIT", parent_sha256: J(path.join(rt.outbox, "gpt_handoffs", e1.open_stage_handoff, "HANDOFF_MANIFEST.json")).predecessor_sha256, round: 1 }])] }] }));
  const z = path.join(W, "ret.zip"); zip(R, z);
  await assert.rejects(PL.importPlan({ film: rt.film, out: rt.outbox, zip: z, operator: "" }), /operator/);
  const r = await PL.importPlan({ film: rt.film, out: rt.outbox, zip: z, operator: "gp-test" }), of = (j, k) => r.results.find((x) => x.artjob === j && x.stage === k);
  assert.equal(of(jobs[0], 1).outcome, "IMPORTED", JSON.stringify(r.results)); assert.ok(of(jobs[0], 1).machine_selected); assert.ok(of(jobs[0], 2).machine_selected); assert.equal(of(jobs[0], 3).selection, "AWAITING_HUMAN_SELECTION (last stage of this plan)");
  assert.equal(of(jobs[1], 1).selection, "AWAITING_HUMAN_SELECTION (last stage of this plan)");
  const sel = listSelections({ out: rt.outbox, job: jobs[0] }).filter((s) => s.generation === cur[jobs[0]].digest); assert.deepEqual(sel.map((s) => [s.stage, s.selector]), [[1, "MACHINE_GPT"], [2, "MACHINE_GPT"]], "machine selections are labelled and never human");
  const rec = fs.readdirSync(path.join(rt.outbox, "submissions", jobs[0])).map((k) => path.join(rt.outbox, "submissions", jobs[0], k, "PROVIDER_RESULT.json")).filter(fs.existsSync).map(J).flatMap((x) => x.candidates).find((x) => x.sha256 === b);
  assert.deepEqual([rec.lineage.operation, rec.lineage.parent_sha256, rec.lineage.round], ["REPAIR_EDIT", a, 2], "lineage recorded on the candidate");
  const again = await PL.importPlan({ film: rt.film, out: rt.outbox, zip: z, operator: "gp-test" }); assert.ok(again.results.filter((x) => x.artjob === jobs[0] && x.stage < 3).every((x) => x.outcome === "ALREADY_SELECTED"), "resume repeats nothing");
});
test("GP-3 a parent that is not the seed, predecessor or an earlier image of the stage is refused and stops that job's chain", async () => {
  const r0 = await PL.exportPlan({ film: rt.film, out: rt.outbox, jobs: [jobs[1]] }); if (!r0.plan_id) return; const e = r0.manifest.entries[0];
  const R = path.join(W, "ret3"), f = path.join(R, "returns", path.basename(e.folder), "stage01", "x.png"); png(f, S.size, 31);
  fs.writeFileSync(path.join(R, "RETURN_MANIFEST.json"), JSON.stringify({ plan_id: r0.plan_id, entries: [{ artjob: jobs[1], stages: [{ stage: 1, status: "PASS", machine_choice: "x.png", images: [{ file: "x.png", operation: "EDIT", parent_sha256: "f".repeat(64) }] }] }] }));
  const z = path.join(W, "ret3.zip"); zip(R, z); const r = await PL.importPlan({ film: rt.film, out: rt.outbox, zip: z, operator: "gp-test" });
  assert.ok(r.results.some((x) => x.outcome === "FAILED" && /parent/.test(x.reason)) || r.results.some((x) => x.outcome === "ALREADY_SELECTED"));
});
