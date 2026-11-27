// Batched manual GPT route on the diagnostic round-trip film: one export zip for every eligible job/stage (individual seals kept, witnesses stored
// once with exact per-request bindings), one return zip routed back per entry with partial success, safe resume and exact failures, grouped review,
// explicit selection gating the next stage, and carry-forward of an image generated from an earlier request that differs only in its size contract.
process.env.ART_BRIDGE_TEST_TRUST = "1"; // diagnostic fixture film only (test-trusted approvals never reach production or a provider)
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), { isolatedWork } = await import("../_lib/isolated_work.mjs"), W = isolatedWork("gpt_batch");
const { runRoundTrip } = await import("./roundtrip_fixture.mjs"), B = await import("../../engine/art_bridge/gpt_batch.mjs"), G = await import("../../engine/art_bridge/gpt_handoff.mjs"), { writeRGBA } = await import("../../engine/art_bridge/png.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
const png = (f, size, seed) => { const [w, h] = size.split("x").map(Number), px = Buffer.alloc(w * h * 4); for (let i = 0; i < w * h; i++) { const x = i % w, y = (i / w) | 0; px[i * 4] = (x * 7 + seed) & 255; px[i * 4 + 1] = (y + seed * 13) & 255; px[i * 4 + 3] = (x - w / 2) ** 2 + (y - h / 2) ** 2 < (h / 3) ** 2 ? 255 : 0; } fs.mkdirSync(path.dirname(f), { recursive: true }); writeRGBA(f, w, h, px); };
const zip = (dir, z) => execFileSync("python", ["-I", "-c", "import sys,os,zipfile\nwith zipfile.ZipFile(sys.argv[2],'w') as z:\n  for d,_,fs in os.walk(sys.argv[1]):\n    for f in fs: p=os.path.join(d,f); z.write(p,os.path.relpath(p,sys.argv[1]))", dir, z]);
const rt = await runRoundTrip(path.join(W, "rt"));

test("GB-1 export-batch: every eligible job in one zip; each keeps its own sealed handoff; witness bytes stored once with exact bindings", async () => {
  const r = await B.exportBatch({ film: rt.film, out: rt.outbox }); assert.ok(r.batch_id && r.entries.length >= 2, JSON.stringify(r.skipped)); const dir = path.join(rt.outbox, "gpt_batches", r.batch_id), bm = J(path.join(dir, "BATCH_MANIFEST.json"));
  assert.equal(fsha(path.join(dir, "BATCH_MANIFEST.json")), fs.readFileSync(path.join(rt.outbox, "gpt_batches", `${r.batch_id}.sha256`), "utf8").trim());
  for (const e of bm.entries) { const hm = J(path.join(dir, e.folder, "HANDOFF_MANIFEST.json")); assert.equal(sha(fs.readFileSync(path.join(dir, e.folder, "HANDOFF_MANIFEST.json"), "utf8")), e.handoff_seal); assert.equal(hm.handoff_id, e.handoff_id);
    assert.equal(sha(fs.readFileSync(path.join(dir, e.prompt_file), "utf8")), e.request_sha256); assert.equal(e.requested_canvas, hm.size);
    assert.deepEqual(e.witnesses.map((w) => w.sha256).sort(), hm.witnesses.map((w) => w.sha256).sort()); for (const w of e.witnesses) assert.equal(fsha(path.join(dir, w.file)), w.sha256); }
  const stored = fs.readdirSync(path.join(dir, "witnesses")), uniq = new Set(bm.entries.flatMap((e) => e.witnesses.map((w) => w.sha256))); assert.equal(stored.length, uniq.size, "one copy per distinct witness");
  assert.ok(bm.entries.flatMap((e) => e.witnesses).length > uniq.size, "the fixture shares witnesses across entries (de-duplication exercised)");
  assert.match(fs.readFileSync(path.join(dir, "ARTWORK_GPT_BATCH_INSTRUCTIONS.md"), "utf8"), /verbatim/); assert.ok(fs.existsSync(`${dir}.zip`));
  const again = await B.exportBatch({ film: rt.film, out: rt.outbox }); assert.equal(again.batch_id, r.batch_id, "nothing changed: the same batch"); GB.batch = r.batch_id; GB.entries = bm.entries;
});
const GB = {};
test("GB-2 import-batch: routed per entry; partial success, wrong size reported, missing entry reported; resume never imports twice; operator required", async () => {
  const ret = path.join(W, "return1"), es = GB.entries; fs.rmSync(ret, { recursive: true, force: true });
  png(path.join(ret, es[0].return_folder, "candidate_1.png"), es[0].requested_canvas, 1); png(path.join(ret, es[1].return_folder, "candidate_1.png"), "1024x1024" === es[1].requested_canvas ? "1536x1024" : "1024x1024", 2);
  fs.writeFileSync(path.join(ret, "RETURN_MANIFEST.json"), JSON.stringify({ batch_id: GB.batch, entries: [es[0], es[1]].map((e, i) => ({ handoff_id: e.handoff_id, return_folder: e.return_folder, images: ["candidate_1.png"], model: "synthetic", generation_ids: [`g${i}`], visual_evaluation: { identity_preserved: true } })) }));
  const z = path.join(W, "return1.zip"); zip(ret, z);
  await assert.rejects(B.importBatch({ film: rt.film, out: rt.outbox, zip: z, operator: "" }), /operator/);
  const r = await B.importBatch({ film: rt.film, out: rt.outbox, zip: z, operator: "gb-test" }), by = Object.fromEntries(r.results.map((x) => [x.handoff_id, x]));
  assert.equal(by[es[0].handoff_id].outcome, "IMPORTED"); assert.equal(by[es[1].handoff_id].outcome, "IMPORTED_ALL_INVALID"); assert.match(by[es[1].handoff_id].images[0].problems.join(), /size/);
  for (const e of es.slice(2)) assert.equal(by[e.handoff_id].outcome, "NOT_RETURNED");
  const subs = (job) => fs.readdirSync(path.join(rt.outbox, "submissions", job)).filter((k) => fs.existsSync(path.join(rt.outbox, "submissions", job, k, "PROVIDER_RESULT.json"))).length, n0 = subs(es[0].artjob);
  const r2 = await B.importBatch({ film: rt.film, out: rt.outbox, zip: z, operator: "gb-test" }); assert.equal(r2.results.find((x) => x.handoff_id === es[0].handoff_id).outcome, "ALREADY_IMPORTED"); assert.equal(subs(es[0].artjob), n0, "resume imported nothing twice");
  const rec = fs.readdirSync(path.join(rt.outbox, "submissions", es[0].artjob)).map((k) => path.join(rt.outbox, "submissions", es[0].artjob, k, "PROVIDER_RESULT.json")).filter(fs.existsSync).map(J).find((x) => x.handoff_id === es[0].handoff_id);
  assert.equal(rec.origin_claim.operator, "gb-test"); assert.equal(rec.origin_verification, "MODEL_ORIGIN_CLAIM_OPERATOR_ATTESTED");
  // a return that lists a file it does not contain fails for that entry only
  const ret2 = path.join(W, "return2"); fs.rmSync(ret2, { recursive: true, force: true }); png(path.join(ret2, es[2].return_folder, "candidate_1.png"), es[2].requested_canvas, 3); fs.mkdirSync(ret2, { recursive: true });
  fs.writeFileSync(path.join(ret2, "RETURN_MANIFEST.json"), JSON.stringify({ batch_id: GB.batch, entries: [{ handoff_id: es[2].handoff_id, return_folder: es[2].return_folder, images: ["candidate_1.png"] }, { handoff_id: es[3]?.handoff_id ?? es[1].handoff_id, return_folder: "returns/nowhere", images: ["candidate_1.png"] }] }));
  const z2 = path.join(W, "return2.zip"); zip(ret2, z2); const r3 = await B.importBatch({ film: rt.film, out: rt.outbox, zip: z2, operator: "gb-test" });
  assert.equal(r3.results.find((x) => x.handoff_id === es[2].handoff_id).outcome, "IMPORTED"); assert.ok(r3.results.some((x) => x.outcome === "FAILED" && /missing from the return zip/.test(x.reason)));
});
test("GB-3 unsafe return zips are refused before anything is imported", async () => {
  const z = path.join(W, "evil.zip"); execFileSync("python", ["-I", "-c", "import zipfile,sys\nwith zipfile.ZipFile(sys.argv[1],'w') as z: z.writestr('../escape.txt','x'); z.writestr('RETURN_MANIFEST.json','{}')", z]);
  await assert.rejects(B.importBatch({ film: rt.film, out: rt.outbox, zip: z, operator: "gb-test" }), /unsafe entry/); assert.ok(!fs.existsSync(path.join(rt.outbox, "batch_returns", "escape.txt")));
});
test("GB-4 grouped review + explicit selection: nothing is selected until a human chooses; a later stage opens only after its predecessor is selected", async () => {
  const rv = B.reviewSheet({ out: rt.outbox, batch: GB.batch }); assert.ok(fs.existsSync(rv.sheet)); const tpl = J(rv.selections_template); assert.ok(tpl.selections.every((s) => s.choose === null));
  const e0 = GB.entries[0], s0 = tpl.selections.find((s) => s.artjob === e0.artjob); assert.equal(B.nextStage({ out: rt.outbox, job: e0.artjob }).eligible, false, "candidates imported, awaiting selection");
  const skipped = (await B.exportBatch({ film: rt.film, out: rt.outbox })).skipped; assert.ok(skipped.some((x) => x.job === e0.artjob && /awaiting selection/.test(x.reason)));
  const none = B.selectBatch({ out: rt.outbox, file: rv.selections_template }); assert.ok(none.results.every((x) => x.outcome === "NOT_CHOSEN"));
  s0.choose = s0.candidates.find((c) => c.valid).candidate_id; const f = path.join(W, "SELECTIONS.json"); fs.writeFileSync(f, JSON.stringify(tpl));
  assert.equal(B.selectBatch({ out: rt.outbox, file: f }).results.find((x) => x.artjob === e0.artjob).outcome, "SELECTED");
  const ns = B.nextStage({ out: rt.outbox, job: e0.artjob }); if (e0.of > 1) { assert.equal(ns.eligible, true); assert.equal(ns.stage, 2); } else assert.match(ns.reason, /all 1 stages selected/);
});
test("GB-5 carry-forward: accepted only for an earlier sealed request identical except its GENERATION CANVAS section; any other difference refuses", () => {
  const e = GB.entries.find((x) => x.stage === 1 && B.nextStage({ out: rt.outbox, job: x.artjob }).stage === 1 && B.nextStage({ out: rt.outbox, job: x.artjob }).eligible) || GB.entries[2];
  const src = path.join(rt.outbox, "gpt_handoffs", e.handoff_id), hm = J(path.join(src, "HANDOFF_MANIFEST.json"));
  const fake = (tag, edit) => { const id = `GPT_ART_HANDOFF_${e.artjob}_old${tag}_1`, d = path.join(rt.outbox, "gpt_handoffs", id); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(src, d, { recursive: true });
    const p = edit(fs.readFileSync(path.join(d, "REQUEST_PROMPT.txt"), "utf8")); fs.writeFileSync(path.join(d, "REQUEST_PROMPT.txt"), p); const m = { ...hm, handoff_id: id, size: "1536x1024", request_sha256: sha(p) }, t = JSON.stringify(m, null, 1);
    fs.writeFileSync(path.join(d, "HANDOFF_MANIFEST.json"), t); fs.writeFileSync(path.join(rt.outbox, "gpt_handoffs", `${id}.sha256`), sha(t)); return id; };
  const noCanvas = (t) => t.split(/\n(?=## )/).filter((s) => !s.startsWith("## GENERATION CANVAS (engine resolution contract")).join("\n");
  const va = G.verifyCarryForward({ out: rt.outbox, from: fake("a", noCanvas), to: hm }); assert.ok(va.verified.length >= 5); assert.deepEqual(va.delta.map((d) => d.section), ["GENERATION CANVAS"]);
  const db = (t) => noCanvas(t).split(/\n(?=## )/).filter((s) => !s.startsWith("## DETAIL BUDGET (")).join("\n") + "\n## DETAIL BUDGET (computed: figure up to 999 px on screen)\nx: focal, at most 1 interior mark";
  const vd = G.verifyCarryForward({ out: rt.outbox, from: fake("d", db), to: hm }); assert.ok(vd.delta.some((d) => d.section === "DETAIL BUDGET" && /999/.test(d.before)), "an engine-computed detail-budget change is allowed and recorded");
  assert.throws(() => G.verifyCarryForward({ out: rt.outbox, from: fake("b", (t) => noCanvas(t).replace("Specific decision:", "Specific  decision:")), to: hm }), /differ beyond the engine-computed GENERATION CANVAS \/ DETAIL BUDGET/);
  const idc = fake("c", noCanvas), t = fs.readFileSync(path.join(rt.outbox, "gpt_handoffs", `${idc}.sha256`), "utf8"); fs.writeFileSync(path.join(rt.outbox, "gpt_handoffs", `${idc}.sha256`), t.replace(/^./, (c) => (c === "0" ? "1" : "0")));
  assert.throws(() => G.verifyCarryForward({ out: rt.outbox, from: idc, to: hm }), /seal does not verify/);
});
