// P08 / S3C-7: evaluation identity of immutable outbox records = canonical inputs + checking rules + schemas + policy.
// Positive and negative controls run the REAL exportOutbox / submitJob / approval verifier; nothing is mocked.
process.env.ART_BRIDGE_TEST_TRUST = "1"; // only for the labelled diagnostic receipts in the temp films below
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { isolatedWork } from "../_lib/isolated_work.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FILM = path.join(REPO, "films", "hv2_film001");
const O = await import("../../engine/tools/art_outbox.mjs"), E = await import("../../engine/art_bridge/evaluation_identity.mjs"), S = await import("../../engine/art_bridge/outbox_store.mjs");
const R = await import("../../engine/art_bridge/art_requests.mjs"), C = await import("../../engine/art_bridge/art_contract.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
const { tempFilm, approveAll, stubEnv, STUB_PNG, TT } = await import("../art_bridge/universal_fixture.mjs"), { startProviderStub } = await import("../art_bridge/roundtrip_fixture.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const P06_JOB = "ARTJOB_MASTER_ines_master_211539ad", P06_GEN = "c26272cf59ff4fbebe415a6c", P06_FIX = path.join(here, "fixtures", "s3c7_p06_record", "job.json");
const listFiles = (d) => fs.existsSync(d) ? fs.readdirSync(d, { recursive: true }).map(String).filter((f) => fs.statSync(path.join(d, f)).isFile()).sort() : [];
const snapshot = (d) => Object.fromEntries(listFiles(d).filter((f) => !/CURRENT\.json$|OUTBOX_INDEX\.json$|INSTRUCTIONS_FOR_IMAGE_PRODUCTION\.md$|contact_sheets/.test(f)).map((f) => [f, fsha(path.join(d, f))]));

test("EID-1 exact S3C-7: a P06-rules record at the old id is kept byte-for-byte; the P07+ evaluation gets a NEW identity instead of colliding", async () => {
  const size0 = process.env.IMAGE_PROVIDER_SIZE; delete process.env.IMAGE_PROVIDER_SIZE; // the P06/P07 runs exported at the default size (the universal fixture sets a stub size)
  try {
  const out = isolatedWork("eid1"), old = path.join(out, "jobs", P06_JOB, P06_GEN, "job.json"); fs.mkdirSync(path.dirname(old), { recursive: true }); fs.copyFileSync(P06_FIX, old);
  // reproduction proof: the pre-correction digest formula (inputs only, no evaluation identity) yields exactly the P06 record id for today's inputs
  const { jobs, doc } = await I.planJobs({ film: FILM }), j = jobs.find((x) => x.root_dependency === "ines_master"), design = J(path.join(FILM, "art_designs", "ines_master.design.json"));
  const dg = R.dependencyDigest({ job: j, design, repairMemory: path.join(FILM, "learning", "REPAIR_MEMORY.json"), storyBundle: C.scopeBundle(FILM, "story"), directionBundle: C.scopeBundle(FILM, "direction"), size: process.env.IMAGE_PROVIDER_SIZE || "1536x1024", doc, film: FILM });
  const { evaluation, ...inputsOnly } = dg.parts, legacy = crypto.createHash("sha256").update(JSON.stringify(inputsOnly)).digest("hex").slice(0, 24);
  assert.equal(legacy, P06_GEN, "the pre-correction identity of today's inputs is the P06 record id (this is the exact S3C-7 collision)");
  assert.equal(J(old).gate.pass, true, "the P06 record carries the P06 verdict"); assert.ok(!("evaluation_identity" in J(old)));
  const s = await O.exportOutbox({ film: FILM, out }), r = s.index.find((x) => x.asset === "ines_master");
  assert.notEqual(r.generation, P06_GEN, "new rules ⇒ new evaluation identity"); assert.equal(fsha(old), fsha(P06_FIX), "historical record preserved byte-for-byte");
  const now = J(path.join(out, "jobs", P06_JOB, r.generation, "job.json"));
  assert.equal(now.gate.pass, false); assert.ok(now.gate.failures.some((f) => f.code === "PREGEN_AUDIT_MISSING"), "the new rule's verdict is recorded under the new identity");
  assert.equal(now.evaluation_identity.ruleset_version, E.rulesetVersion()); assert.equal(now.evaluation_identity.policy.pregen_audit_required_for_masters, true);
  assert.equal(J(path.join(out, "CURRENT.json"))[P06_JOB].digest, r.generation, "CURRENT points at the current evaluation, not the old passing one");
  } finally { if (size0 !== undefined) process.env.IMAGE_PROVIDER_SIZE = size0; }
});

test("EID-2 P06→P07 rule change: the locked rule-source lineage matches git, differs between P06 and P07, and the current lock is consistent", () => {
  const lock = E.readLock(), v = (n) => lock.versions.find((x) => x.version === n);
  for (const n of ["P06", "P07"]) { const rev = v(n).source.replace(/^git:/, ""), h = crypto.createHash("sha256").update(JSON.stringify(E.RULE_SOURCES.map((f) => { try { return [f, crypto.createHash("sha256").update(execFileSync("git", ["-C", REPO, "show", `${rev}:${f}`], { stdio: ["ignore", "pipe", "ignore"] })).digest("hex")]; } catch { return [f, null]; } }))).digest("hex");
    assert.equal(h, v(n).rule_source_sha256, `${n} lineage recomputed from git`); }
  assert.notEqual(v("P06").rule_source_sha256, v("P07").rule_source_sha256, "the pre-generation audit is a rule change between P06 and P07");
  assert.equal(E.rulesetVersion(), lock.current, "current rule sources are versioned");
  // negative: rule sources that do not match the current version are refused (a silent rule edit cannot keep an old version / approvals)
  assert.throws(() => E.rulesetVersion({ ...lock, versions: lock.versions.map((x) => x.version === lock.current ? { ...x, rule_source_sha256: "0".repeat(64) } : x) }), (e) => e.code === "RULESET_LOCK_STALE");
  assert.throws(() => E.rulesetVersion({ ...lock, current: "P07" }), (e) => e.code === "RULESET_LOCK_STALE", "an older version label cannot be claimed for today's rules");
});

test("EID-3 policy is part of identity: same inputs under production vs diagnostic policy ⇒ distinct generations, different verdicts, both kept", async () => {
  const film = tempFilm("eid3"), out = isolatedWork("eid3"), marker = path.join(film, ".diagnostic_namespace"), keep = fs.readFileSync(marker);
  const a = (await O.exportOutbox({ film, out })).index.find((x) => x.asset === "ines_master"), ga = J(path.join(out, "jobs", a.artjob_id, a.generation, "job.json"));
  fs.rmSync(marker); const b = (await O.exportOutbox({ film, out })).index.find((x) => x.asset === "ines_master"); fs.writeFileSync(marker, keep);
  const gb = J(path.join(out, "jobs", b.artjob_id, b.generation, "job.json"));
  assert.notEqual(a.generation, b.generation); assert.equal(ga.evaluation_identity.policy.diagnostic_namespace, true); assert.equal(gb.evaluation_identity.policy.diagnostic_namespace, false);
  assert.ok(gb.gate.failures.some((f) => f.code === "PREGEN_AUDIT_MISSING") && !ga.gate.failures.some((f) => f.code === "PREGEN_AUDIT_MISSING"), "the verdict follows the policy");
  assert.ok(fs.existsSync(path.join(out, "jobs", a.artjob_id, a.generation, "job.json")), "the earlier evaluation is kept");
});

test("EID-4 repeated export is idempotent and deterministic: identical identity, byte-identical records, no new generation", async () => {
  const film = tempFilm("eid4"), out = isolatedWork("eid4");
  const s1 = await O.exportOutbox({ film, out }), snap1 = snapshot(out); const s2 = await O.exportOutbox({ film, out }), snap2 = snapshot(out);
  assert.deepEqual(s2.index.map((r) => [r.artjob_id, r.generation]), s1.index.map((r) => [r.artjob_id, r.generation])); assert.deepEqual(snap2, snap1, "no record added or changed");
  const e1 = E.evaluationIdentity({ film }), e2 = E.evaluationIdentity({ film }); assert.equal(e1.sha256, e2.sha256);
  assert.ok(!JSON.stringify(e1).match(/\d{4}-\d\d-\d\dT/), "no timestamp enters the identity");
  assert.deepEqual(E.canonicalize({ b: 1, created_utc: "x", a: { at_utc: 1, v: 2 } }), { a: { v: 2 }, b: 1 });
});

test("EID-5 concurrent export into one outbox: both succeed, one generation per job, sealed records identical, pointers valid JSON", async () => {
  const film = tempFilm("eid5"), out = isolatedWork("eid5");
  const [a, b] = await Promise.all([O.exportOutbox({ film, out }), O.exportOutbox({ film, out })]);
  assert.deepEqual(a.index.map((r) => r.generation), b.index.map((r) => r.generation));
  for (const r of a.index) { const gens = fs.readdirSync(path.join(out, "jobs", r.artjob_id)).filter((d) => !d.includes(".tmp-")); assert.deepEqual(gens, [r.generation], `${r.artjob_id}: exactly one generation`);
    const cd = path.join(out, "compiled", r.artjob_id, r.generation); if (fs.existsSync(cd)) assert.equal(S.verifyGeneration(cd).ok, true); }
  J(path.join(out, "CURRENT.json")); J(path.join(out, "OUTBOX_INDEX.json"));
  assert.deepEqual(fs.readdirSync(out).filter((f) => f.includes(".tmp-")), [], "no temp pointer left behind");
});

test("EID-6 attempted conflicting overwrite under an identical identity is refused as NONDETERMINISM; the record is unchanged", async () => {
  const film = tempFilm("eid6"), out = isolatedWork("eid6"), s = await O.exportOutbox({ film, out }), r = s.index.find((x) => x.asset === "ines_master");
  const f = path.join(out, "jobs", r.artjob_id, r.generation, "job.json"), before = fsha(f), rec = J(f);
  assert.throws(() => E.writeEvaluationOnce(f, JSON.stringify({ ...rec, gate: { ...rec.gate, pass: !rec.gate.pass } }, null, 1), S.writeOnce), (e) => e.code === "EVALUATION_NONDETERMINISM" && e.details.differing_keys.includes("gate"));
  assert.throws(() => S.writeOnce(f, "different bytes"), (e) => e.code === "OUTBOX_IMMUTABLE_VIOLATION", "the store's own immutability check is unchanged");
  assert.equal(E.writeEvaluationOnce(f, fs.readFileSync(f, "utf8"), S.writeOnce), false, "identical bytes are idempotent"); assert.equal(fsha(f), before);
  // a tampered record makes the next real export refuse (not overwrite, not mint a new id)
  fs.writeFileSync(f, JSON.stringify({ ...rec, gate: { ...rec.gate, pass: !rec.gate.pass } }, null, 1)); const tampered = fsha(f);
  await assert.rejects(O.exportOutbox({ film, out }), (e) => e.code === "EVALUATION_NONDETERMINISM"); assert.equal(fsha(f), tampered, "kept as evidence");
});

test("EID-7 stale approval: a design receipt bound to an older ruleset version does not authorize; an old generation after a rule/policy change is STALE", async () => {
  const film = tempFilm("eid7"), jobs = await approveAll(film, ["ines_master"]), out = isolatedWork("eid7"), doc = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
  const job = jobs.find((j) => j.root_dependency === "ines_master"), design = J(path.join(film, "art_designs", "ines_master.design.json")), report = C.gateForJob({ film, doc, job });
  assert.equal(report.design_approval.status, "DESIGN_APPROVED", "positive control: current-ruleset approval verifies");
  assert.equal(C.designBundle(design, report).ruleset_version, E.rulesetVersion());
  // the same human decision recorded against the P07 bundle (no ruleset binding / older version) must not authorize under the current rules
  const { approveDesign } = C; const ap = await import("../../engine/art_bridge/approvals.mjs");
  const oldBundle = { ...C.designBundle(design, report), ruleset_version: "P07" };
  const rr = ap.writeReceipt(film, doc, { scope: "design", id: design.job_id, reviewer: "fixture-art-director", verdict: "APPROVED", notes: "", scope_note: "", attestation: TT, bundle: oldBundle, evidence: [] });
  fs.writeFileSync(path.join(film, "art_designs", `${design.job_id}.APPROVAL_POINTER.json`), JSON.stringify({ receipt_id: rr.receipt_id, reviewer_kind: rr.reviewer_kind }, null, 1));
  assert.notEqual(C.gateForJob({ film, doc, job }).design_approval.status, "DESIGN_APPROVED", "an approval of the older-ruleset bundle is stale");
  await approveDesign({ film, doc, job, reviewer: "fixture-art-director", verdict: "APPROVED", attestation: TT }); // re-approve under the current ruleset
  const s = await O.exportOutbox({ film, out }), r = s.index.find((x) => x.asset === "ines_master"), stub = await startProviderStub(STUB_PNG);
  try {
    // an OLD PASSING generation (same inputs, exported under an older evaluation identity) made current: it must not authorize anything
    const g = r.generation, old = "0ld" + g.slice(3), cur = J(path.join(out, "CURRENT.json"));
    fs.cpSync(path.join(out, "jobs", r.artjob_id, g), path.join(out, "jobs", r.artjob_id, old), { recursive: true }); fs.cpSync(path.join(out, "compiled", r.artjob_id, g), path.join(out, "compiled", r.artjob_id, old), { recursive: true });
    const oj = path.join(out, "jobs", r.artjob_id, old, "job.json"), rec = J(oj); fs.writeFileSync(oj, JSON.stringify({ ...rec, evaluation_identity: { ...rec.evaluation_identity, ruleset_version: "P07" } }, null, 1));
    fs.writeFileSync(path.join(out, "CURRENT.json"), JSON.stringify({ ...cur, [r.artjob_id]: { ...cur[r.artjob_id], digest: old } }, null, 1));
    const res = await I.submitJob({ film, out, job: r.artjob_id, env: stubEnv(stub.url) });
    assert.equal(res.status, "REFUSED"); assert.equal(res.code, "STALE_DEPENDENCY", JSON.stringify(res.error).slice(0, 300)); assert.equal(stub.requests().length, 0, "no provider call");
    const { exportGptJob } = await import("../../engine/art_bridge/gpt_handoff.mjs");
    await assert.rejects(exportGptJob({ film, out, job: r.artjob_id }), (e) => e.code === "STALE_DEPENDENCY", "the manual GPT route is bound to the current evaluation too");
  } finally { await stub.close(); }
});
