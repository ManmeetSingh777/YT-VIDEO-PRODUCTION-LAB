// P02-R15 + F085: the production ledger is append-only, hash-chained, crash-safe and multi-process-safe; tampering is detected; a status/index
// rebuild cannot change authority; legacy history is MIGRATED into a separate IMPORTED_LEGACY_UNVERIFIED stream and never promoted.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { spawn } from "node:child_process";
import * as L from "../../engine/production/ledger.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "ledger");
const film = (tag) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "p02 ledger test namespace\n"); return d; };
const evDir = (F, id) => path.join(L.runDir(F, id), "events"), evF = (F, id, n) => path.join(evDir(F, id), `${String(n).padStart(8, "0")}.json`);
const seed = (F, n = 6) => { const id = L.createRun(F, { runType: "DIAGNOSTIC" }); for (let i = 0; i < n; i++) L.appendEvent(F, id, { event_type: "CHECK_PASSED", stage_id: "S00", status_after: `c${i}` }); return id; };

test("P02-R15a tamper detection: altered, deleted, reordered, duplicated, cross-linked and truncated events all fail verify; replay refuses", () => {
  const cases = {
    altered: (F, id) => { const f = evF(F, id, 3), e = JSON.parse(fs.readFileSync(f, "utf8")); e.status_after = "forged"; fs.writeFileSync(f, JSON.stringify(e)); },
    deleted_middle: (F, id) => fs.rmSync(evF(F, id, 4)),
    reordered: (F, id) => { const a = fs.readFileSync(evF(F, id, 2)), b = fs.readFileSync(evF(F, id, 5)); fs.writeFileSync(evF(F, id, 2), b); fs.writeFileSync(evF(F, id, 5), a); },
    duplicated: (F, id) => fs.copyFileSync(evF(F, id, 7), evF(F, id, 8)),
    truncated_tail: (F, id) => fs.rmSync(evF(F, id, 7)),
    cross_linked: (F, id) => { const other = seed(F, 1), e = JSON.parse(fs.readFileSync(evF(F, other, 2), "utf8")); fs.writeFileSync(evF(F, id, 8), JSON.stringify({ ...e, sequence: 8 })); fs.writeFileSync(path.join(L.runDir(F, id), "HEAD.json"), JSON.stringify({ sequence: 8, event_sha256: e.event_sha256 })); },
  };
  for (const [k, mutate] of Object.entries(cases)) { const F = film(`tamper_${k}`), id = seed(F); assert.equal(L.verifyChain(F, id).ok, true); mutate(F, id); const v = L.verifyChain(F, id);
    assert.equal(v.ok, false, `${k} must be detected`); assert.ok(v.problems.length, k); assert.throws(() => L.replay(F, id), /ledger corrupted/, `${k}: replay refuses`); }
});

test("P02-R15b crash leftovers (torn temp file) are ignored; a STATUS index edit or deletion never changes replayed authority", () => {
  const F = film("crash"), id = seed(F, 3); fs.writeFileSync(path.join(evDir(F, id), "00000005.json.tmp-999-abc"), "{\"torn\": tru"); assert.equal(L.verifyChain(F, id).ok, true);
  const e = L.appendEvent(F, id, { event_type: "CHECK_PASSED", status_after: "after-crash" }); assert.equal(e.sequence, 5); assert.equal(L.verifyChain(F, id).ok, true);
  const s1 = L.replay(F, id), sf = path.join(L.runDir(F, id), "STATUS.json"), forged = JSON.parse(fs.readFileSync(sf, "utf8")); forged.tasks.completed = 999; forged.tasks.percent_verified = 100; fs.writeFileSync(sf, JSON.stringify(forged));
  const s2 = L.replay(F, id); assert.equal(s2.tasks.completed, s1.tasks.completed); fs.rmSync(sf); assert.deepEqual(L.replay(F, id).tasks, s1.tasks, "index rebuild from the chain");
});

test("P02-R15c an event that merely CLAIMS completion (failed verification or unresolvable output) is never counted as verified", () => {
  const F = film("claims"), id = L.createRun(F, { runType: "DIAGNOSTIC" }), out = path.join(F, "out.bin"); fs.writeFileSync(out, "real output");
  const ref = { name: "out.bin", ...L.putFile(F, out) };
  L.appendEvent(F, id, { event_type: "TASK_PLANNED", stage_id: "S00", task_id: "good", task: { producer: "x" } }); L.appendEvent(F, id, { event_type: "TASK_COMPLETED", stage_id: "S00", task_id: "good", output_refs: [ref], verification: { pass: true } });
  L.appendEvent(F, id, { event_type: "TASK_PLANNED", stage_id: "S00", task_id: "nover", task: { producer: "x" } }); L.appendEvent(F, id, { event_type: "TASK_COMPLETED", stage_id: "S00", task_id: "nover", output_refs: [ref], verification: { pass: false } });
  L.appendEvent(F, id, { event_type: "TASK_PLANNED", stage_id: "S00", task_id: "ghost", task: { producer: "x" } }); L.appendEvent(F, id, { event_type: "TASK_COMPLETED", stage_id: "S00", task_id: "ghost", output_refs: [{ name: "nope.bin", sha256: "a".repeat(64) }], verification: { pass: true } });
  const st = L.replay(F, id), by = Object.fromEntries(st.task_list.map((t) => [t.task_id, t.status])); assert.deepEqual(by, { good: "COMPLETED", nover: "UNVERIFIED_COMPLETION_CLAIM", ghost: "UNVERIFIED_COMPLETION_CLAIM" }); assert.equal(st.tasks.completed, 1);
});

test("P02-R15d two concurrent OS processes appending to one run produce one gap-free verified chain (fenced lock)", async () => {
  const F = film("concurrent"), id = L.createRun(F, { runType: "DIAGNOSTIC" }), script = path.join(W, "append_worker.mjs");
  fs.writeFileSync(script, `import * as L from ${JSON.stringify(url.pathToFileURL(path.join(REPO, "engine", "production", "ledger.mjs")).href)};\nconst [F, id, tag, go] = process.argv.slice(2); while (Date.now() < +go) {}\nfor (let i = 0; i < 40; i++) L.appendEvent(F, id, { event_type: "CHECK_PASSED", status_after: tag + i });\n`);
  const go = Date.now() + 1200, run = (tag) => new Promise((ok, no) => { const p = spawn(process.execPath, [script, F, id, tag, String(go)], { stdio: ["ignore", "ignore", "pipe"] }); let e = ""; p.stderr.on("data", (d) => (e += d)); p.on("close", (c) => (c === 0 ? ok() : no(new Error(e)))); });
  await Promise.all([run("a"), run("b")]); const v = L.verifyChain(F, id); assert.equal(v.ok, true, v.problems.join("; ")); assert.equal(v.events, 81);
  const tags = L.readEvents(F, id).map((e) => e.status_after); assert.equal(new Set(tags).size, 81, "no event lost or duplicated");
});

test("P02-F085 legacy migration: pre-ledger history becomes a SEPARATE IMPORTED_LEGACY_UNVERIFIED stream; idempotent; never authority", () => {
  const F = film("legacy"); fs.mkdirSync(path.join(F, "reviews"), { recursive: true }); fs.mkdirSync(path.join(F, "qa", "shots", "s1"), { recursive: true });
  fs.writeFileSync(path.join(F, "reviews", "HISTORY.jsonl"), JSON.stringify({ receipt_id: "r1", verdict: "APPROVED", reviewer_kind: "HUMAN" }) + "\n"); fs.writeFileSync(path.join(F, "reviews", "r1.json"), JSON.stringify({ receipt_id: "r1", verdict: "APPROVED", reviewer_kind: "HUMAN" }));
  fs.writeFileSync(path.join(F, "qa", "shots", "s1", "QA_RESULT.json"), JSON.stringify({ gates: { mechanical_fixture_pass: true } }));
  const a = L.importLegacy(F); assert.match(a.run_id, /^LEGACY-/); assert.equal(a.imported, 3); assert.equal(L.importLegacy(F).imported, 0, "identical bytes are not re-imported");
  const evs = L.readEvents(F, a.run_id).slice(1); assert.ok(evs.every((e) => e.event_type === "IMPORTED_LEGACY_UNVERIFIED" && e.provenance === "UNAUTHENTICATED_PRE_LEDGER_RECORD" && e.status_after === "LEGACY_UNVERIFIED"));
  for (const e of evs) assert.equal(fs.readFileSync(path.join(F, e.output_refs[0].source), "utf8").length > 0, true);
  const st = L.replay(F, a.run_id); assert.equal(st.tasks.completed, 0); assert.ok(!L.readEvents(F, a.run_id).some((e) => /APPROVAL|TASK_COMPLETED|STAGE_COMMITTED/.test(e.event_type)), "migration never mints approvals or completions");
  fs.appendFileSync(path.join(F, "reviews", "HISTORY.jsonl"), JSON.stringify({ receipt_id: "r2", verdict: "REVOKED" }) + "\n"); assert.equal(L.importLegacy(F).imported, 1, "a changed legacy file is recorded as a NEW observation (history kept)");
  assert.equal(L.verifyChain(F, a.run_id).ok, true);
  assert.throws(() => L.createRun(F, { runType: "PRODUCTION" }), (e) => e.code === "TEST_TRUST_FORBIDDEN", "a diagnostic namespace never hosts a production run");
});
