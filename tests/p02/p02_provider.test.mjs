// P02 provider / external-handoff / selection / authorization tests (directive P02-R10, R19, R20, R26, R27; F079, F084, F086, F089, F091, F092).
// Everything runs in a DIAGNOSTIC namespace (round-trip fixture film) against a LOOPBACK test stub: no paid call can be made. Synthetic PNGs
// are labelled synthetic; they prove mechanics, never art. "provider_called" is asserted from the stub's own request log.
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { spawn } from "node:child_process";
import { runRoundTrip, startProviderStub } from "../art_bridge/roundtrip_fixture.mjs";
import { writeRGBA, readPNG } from "../../engine/art_bridge/png.mjs";
import * as I from "../../engine/art_bridge/art_intake.mjs";
import * as G from "../../engine/art_bridge/gpt_handoff.mjs";
import * as CS from "../../engine/art_bridge/candidate_store.mjs";
import * as RA from "../../engine/production/run_authorization.mjs";
import { createDiagnosticReviewer } from "../../engine/art_bridge/reviewer_auth.mjs";
import { acquireLock } from "../../engine/production/ledger.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "provider");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f)), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const CAPS = JSON.stringify({ generate: true, edit: true, transparentRaster: true, multipleReferences: true, svgGeneration: false });
const envFor = (stub, model, extra = {}) => ({ IMAGE_PROVIDER_SIZE: stub.size, IMAGE_PROVIDER: "openai-images", IMAGE_PROVIDER_MODEL: model, OPENAI_API_KEY: "test-key-not-real", OPENAI_BASE_URL: stub.url, IMAGE_PROVIDER_CAPS: CAPS, ...extra });
const synthPNG = (file, w, h, { alpha = true, seed = 1 } = {}) => { const px = Buffer.alloc(w * h * 4); for (let i = 0; i < w * h; i++) { const x = i % w, y = (i / w) | 0, inside = (x - w / 2) ** 2 + (y - h / 2) ** 2 < (Math.min(w, h) / 3) ** 2; px[i * 4] = (x * 3 + seed) & 255; px[i * 4 + 1] = (y * 5 + seed) & 255; px[i * 4 + 2] = 90; px[i * 4 + 3] = alpha ? (inside ? 255 : 0) : 255; } writeRGBA(file, w, h, px); return file; };
let rt, OUT; // OUT: synthetic 1536x1024 RGBA (the exported request size) returned by the loopback stub — labelled test media, not art
before(async () => { fs.rmSync(W, { recursive: true, force: true }); rt = await runRoundTrip(path.join(W, "rt")); OUT = synthPNG(path.join(W, "stub_out_1536x1024.png"), 1536, 1024, { seed: 5 }); });

test("P02-R26 external ChatGPT handoff: exact request/skill/witness/master bytes exported; only a matching operator bundle imports, as OPERATOR-ATTESTED", async () => {
  const job = rt.jobIds.hand_grip, h = await G.exportGptJob({ film: rt.film, out: rt.outbox, job, stage: 1 }), dir = path.join(rt.outbox, "gpt_handoffs", h.handoff_id), m = h.manifest;
  assert.ok(fs.existsSync(h.zip)); assert.match(h.handoff_id, /^GPT_ART_HANDOFF_ARTJOB_/); assert.ok(fs.existsSync(path.join(dir, "WHAT_TO_DO_IN_CHATGPT.md")));
  assert.equal(sha(fs.readFileSync(path.join(dir, "REQUEST_PROMPT.txt"), "utf8")), m.request_sha256, "the exact compiled prompt (no truncation)");
  for (const w of m.witnesses) assert.equal(fsha(path.join(dir, w.file)), w.sha256, `witness ${w.file} carries ACTUAL source bytes`);
  assert.ok(m.witnesses.length >= 1 && m.witnesses.every((w) => w.role && w.width)); assert.equal(m.skill.skill_md_sha256, fsha(path.join(REPO, "reference", "construct-kurzgesagt-art", "SKILL.md")));
  assert.ok(m.master_edit_reference?.sha256, "a derived job carries the APPROVED master as the edit reference"); assert.equal(fsha(path.join(dir, "MASTER_EDIT_REFERENCE.png")), m.master_edit_reference.sha256);
  const [w, hh] = m.size.split("x").map(Number), bundle = (tag, images, extra = {}) => { const b = path.join(W, "bundles", tag); fs.rmSync(b, { recursive: true, force: true }); fs.mkdirSync(b, { recursive: true }); const list = images.map(([name, make]) => { const f = path.join(b, name); make(f); return { file: name, sha256: fsha(f) }; }); fs.writeFileSync(path.join(b, "IMPORT_MANIFEST.json"), JSON.stringify({ handoff_id: h.handoff_id, images: list, origin_claim: { model: "chatgpt (operator-reported)", session: "synthetic-test", operator: "p02-test-operator" }, operator_submission_id: `SUB-${tag}`, ...extra })); return b; };
  // positive: a synthetic (labelled) PNG of the requested size with real alpha
  const ok = G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle("ok", [["cand0.png", (f) => synthPNG(f, w, hh, { seed: 3 })]]) });
  assert.equal(ok.status, "CANDIDATES_RECEIVED_PENDING_SELECTION"); assert.equal(ok.origin_verification, "MODEL_ORIGIN_CLAIM_OPERATOR_ATTESTED"); assert.equal(ok.provenance_to_ingest, "GPT_OPERATOR_HANDOFF");
  assert.ok(!JSON.stringify(ok).includes("CRYPTOGRAPHICALLY_VERIFIED"), "operator-attested origin is never upgraded"); assert.ok(ok.unverified_claims.some((c) => /ChatGPT/.test(c)));
  const lineage = I.requireProvenanceLineage({ file: ok.candidates[0].file, provenance: "GPT_OPERATOR_HANDOFF", outbox: rt.outbox }); assert.equal(lineage.origin_verification, "MODEL_ORIGIN_CLAIM_OPERATOR_ATTESTED");
  assert.throws(() => I.requireProvenanceLineage({ file: ok.candidates[0].file, provenance: "GPT_PROVIDER_ART", outbox: rt.outbox }), (e) => e.code === "PROVENANCE_COUNTERFEIT", "handoff bytes cannot be relabelled as API provider art");
  // negatives
  const bad = (tag, imgs, re, extra) => assert.throws(() => G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle(tag, imgs, extra) }), re, tag);
  bad("dup", [["again.png", (f) => fs.copyFileSync(ok.candidates[0].file, f)]], (e) => e.code === "OUTBOX_IMMUTABLE_VIOLATION");
  bad("master_copy", [["m.png", (f) => fs.copyFileSync(path.join(dir, "MASTER_EDIT_REFERENCE.png"), f)]], (e) => e.code === "UNQUALIFIED_STYLE_ASSET");
  bad("unknown_handoff", [["x.png", (f) => synthPNG(f, w, hh, { seed: 9 })]], (e) => e.code === "STAGE_PREDECESSOR_MISSING", { handoff_id: "GPT_ART_HANDOFF_NOPE_0_1" });
  bad("no_operator", [["x.png", (f) => synthPNG(f, w, hh, { seed: 10 })]], (e) => e.code === "SCHEMA_VIOLATION", { origin_claim: { model: "x" } });
  { const b = bundle("lying_hash", [["x.png", (f) => synthPNG(f, w, hh, { seed: 11 })]]), im = J(path.join(b, "IMPORT_MANIFEST.json")); im.images[0].sha256 = "0".repeat(64); fs.writeFileSync(path.join(b, "IMPORT_MANIFEST.json"), JSON.stringify(im)); assert.throws(() => G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: b }), (e) => e.code === "ASSET_HASH_MISMATCH"); }
  { const b = bundle("traversal", [["x.png", (f) => synthPNG(f, w, hh, { seed: 12 })]]), im = J(path.join(b, "IMPORT_MANIFEST.json")); im.images[0].file = "../ok/cand0.png"; fs.writeFileSync(path.join(b, "IMPORT_MANIFEST.json"), JSON.stringify(im)); assert.throws(() => G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: b }), (e) => e.code === "ASSET_PATH_INVALID"); }
  const opaque = G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle("opaque", [["o.png", (f) => synthPNG(f, w, hh, { alpha: false, seed: 13 })]]) }); assert.equal(opaque.status, "PROVIDER_OUTPUT_REJECTED"); assert.match(opaque.candidates[0].problems.join(), /opaque/);
  const small = G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle("wrong_size", [["s.png", (f) => synthPNG(f, 64, 64, { seed: 14 })]]) }); assert.equal(small.status, "PROVIDER_OUTPUT_REJECTED"); assert.match(small.candidates[0].problems.join(), /size 64x64/);
  assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: m.generation, candidateId: opaque.candidates[0].id }), /failed output validation/, "a rejected import can never be selected");
  assert.throws(() => G.importGptCandidates({ film: path.join(W, "other_project", "film"), out: rt.outbox, bundleDir: bundle("cross", [["c.png", (f) => synthPNG(f, w, hh, { seed: 15 })]]) }), (e) => e.code === "STALE_COMPILED_REQUEST", "cross-project bundle");
  { const hmF = path.join(dir, "HANDOFF_MANIFEST.json"), orig = fs.readFileSync(hmF); const t = J(hmF); t.size = "64x64"; fs.writeFileSync(hmF, JSON.stringify(t, null, 1)); try { assert.throws(() => G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle("edited_receipt", [["e.png", (f) => synthPNG(f, 64, 64, { seed: 16 })]]) }), (e) => e.code === "OUTBOX_IMMUTABLE_VIOLATION"); } finally { fs.writeFileSync(hmF, orig); } }
  // an arbitrary PNG cannot be ingested as GPT art by typing a provenance flag
  const arb = synthPNG(path.join(W, "arbitrary.png"), w, hh, { seed: 21 });
  for (const p of ["GPT_PROVIDER_ART", "GPT_OPERATOR_HANDOFF"]) await assert.rejects(I.ingestPart({ film: rt.film, asset: "pilot_hand_grip", file: arb, landmarks: rt.files.hand_grip_landmarks, provenance: p, outbox: rt.outbox }), (e) => e.code === "PROVENANCE_COUNTERFEIT", p);
  // selection by id → a stage-2 handoff carries exactly the selected bytes as PREDECESSOR
  CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: m.generation, candidateId: ok.candidates[0].id });
  const h2 = await G.exportGptJob({ film: rt.film, out: rt.outbox, job, stage: 2 }); assert.equal(h2.manifest.predecessor_sha256, ok.candidates[0].sha256); assert.equal(fsha(path.join(rt.outbox, "gpt_handoffs", h2.handoff_id, "PREDECESSOR.png")), ok.candidates[0].sha256);
  // wrong stage: a stage-1 image imported against the stage-2 handoff is a duplicate (already received) → refused
  assert.throws(() => G.importGptCandidates({ film: rt.film, out: rt.outbox, bundleDir: bundle("wrong_stage", [["w.png", (f) => fs.copyFileSync(ok.candidates[0].file, f)]], { handoff_id: h2.handoff_id }) }), (e) => ["UNQUALIFIED_STYLE_ASSET", "OUTBOX_IMMUTABLE_VIOLATION"].includes(e.code));
});

test("P02-R27 declared capabilities are not evidence; fake edit/transparency/multi-reference/size support cannot promote output", async () => {
  const st = CS.capabilityStatus(path.join(W, "caps"), { provider: "openai-images", model: "m1" }, { edit: true, transparentRaster: true, multipleReferences: false });
  assert.deepEqual(st, { edit: "DECLARED", transparentRaster: "DECLARED", multipleReferences: "UNTESTED" });
  const cf = path.join(W, "caps", "capabilities", "openai-images", "m1", "CANARY_RESULT.json"); fs.mkdirSync(path.dirname(cf), { recursive: true }); fs.writeFileSync(cf, JSON.stringify({ verified: { edit: true, transparentRaster: false } }));
  assert.deepEqual(CS.capabilityStatus(path.join(W, "caps"), { provider: "openai-images", model: "m1" }, { edit: true, transparentRaster: true }), { edit: "LIVE_VERIFIED", transparentRaster: "FAILED" });
  // a stub that DECLARES every capability but returns opaque / wrong-size / drops a reference
  const job = rt.jobIds.forearm, opq = path.join(W, "opaque_out.png"), tiny = path.join(W, "tiny_out.png"); synthPNG(opq, 1536, 1024, { alpha: false, seed: 31 }); synthPNG(tiny, 32, 32, { seed: 32 });
  for (const [tag, png, opts, re] of [["opaque", opq, {}, /opaque output/], ["size", tiny, {}, /size 32x32/], ["drop", OUT, { dropReference: true }, /acknowledged \d+ of \d+ reference images/]]) {
    const stub = await startProviderStub(png, opts); try { const env = envFor({ ...stub, size: "1536x1024" }, `cap-${tag}`), r = await I.submitJob({ film: rt.film, out: rt.outbox, job, env });
      assert.equal(r.status, "PROVIDER_OUTPUT_REJECTED", `${tag}: ${r.status}`); assert.match(r.candidates[0].problems.join(" "), re); assert.equal(r.candidates[0].valid, false);
      assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: r.payload_key.generation, candidateId: r.candidates[0].id }), /failed output validation/); } finally { await stub.close(); } }
});

test("P02-R10 forged / stale / cross-job predecessor paths fail BEFORE any provider call; lineage is immutable", async () => {
  const stub = await startProviderStub(OUT, { outputs: 2 }), job = rt.jobIds.upper_arm;
  try { const env = envFor(stub, "lineage"), a = await I.submitJob({ film: rt.film, out: rt.outbox, job, env }); assert.equal(a.status, "CANDIDATES_RECEIVED_PENDING_SELECTION"); const n0 = stub.requests().length;
    const forged = await I.submitJob({ film: rt.film, out: rt.outbox, job, env, stage: 2, predecessorCandidate: { path: rt.files.upper_arm, sha256: fsha(rt.files.upper_arm) } }); assert.equal(forged.status, "REFUSED"); assert.equal(forged.code, "STAGE_PREDECESSOR_MISSING");
    const unselected = await I.submitJob({ film: rt.film, out: rt.outbox, job, env, stage: 2 }); assert.equal(unselected.status, "REFUSED"); assert.match(unselected.error.human_readable_reason, /no committed selection/);
    assert.equal(stub.requests().length, n0, "no provider call for a forged/missing predecessor");
    assert.throws(() => I.selectStageCandidate({ out: rt.outbox, job, stage: 1, file: rt.files.upper_arm }), /selection by file path is refused/);
    assert.throws(() => CS.selectCandidate({ out: rt.outbox, job: rt.jobIds.forearm, stage: 1, generation: a.payload_key.generation, candidateId: a.candidates[0].id }), /STAGE_PREDECESSOR_MISSING|no sealed provider result|belongs to job/, "cross-job candidate id");
    assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: "0".repeat(24), candidateId: a.candidates[0].id }), (e) => e.code === "STALE_COMPILED_REQUEST");
    assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: a.payload_key.generation, candidateId: "zz:0" }), /malformed candidate id/);
    const rf = path.join(rt.outbox, "submissions", job, a.payload_key_sha256.slice(0, 16), "PROVIDER_RESULT.json"), orig = fs.readFileSync(rf); const t = J(rf); t.candidates[1].valid = true; t.candidates[1].sha256 = "f".repeat(64); fs.writeFileSync(rf, JSON.stringify(t, null, 1));
    try { assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: a.payload_key.generation, candidateId: a.candidates[1].id }), (e) => e.code === "OUTBOX_IMMUTABLE_VIOLATION"); } finally { fs.writeFileSync(rf, orig); }
    const cf = a.candidates[0].file, cb = fs.readFileSync(cf); fs.appendFileSync(cf, Buffer.from([0])); try { assert.throws(() => CS.selectCandidate({ out: rt.outbox, job, stage: 1, generation: a.payload_key.generation, candidateId: a.candidates[0].id }), (e) => e.code === "ASSET_HASH_MISMATCH"); } finally { fs.writeFileSync(cf, cb); }
  } finally { await stub.close(); }
});

test("P02-R20 two REAL OS processes race to select different candidates: exactly one commits, the loser sees the winner; crash-held and stale locks recover", async () => {
  const stub = await startProviderStub(OUT, { outputs: 2 }), job = rt.jobIds.underpaint;
  let a; try { a = await I.submitJob({ film: rt.film, out: rt.outbox, job, env: envFor(stub, "race") }); } finally { await stub.close(); }
  assert.equal(a.status, "CANDIDATES_RECEIVED_PENDING_SELECTION"); const gen = a.payload_key.generation, go = Date.now() + 1500, script = path.join(W, "race_select.mjs");
  fs.writeFileSync(script, `import { selectCandidate } from ${JSON.stringify(url.pathToFileURL(path.join(REPO, "engine", "art_bridge", "candidate_store.mjs")).href)};\nconst [out, job, gen, id, go] = process.argv.slice(2); while (Date.now() < +go) {}\ntry { const s = selectCandidate({ out, job, stage: 1, generation: gen, candidateId: id }); console.log(JSON.stringify({ ok: true, winner: s.candidate_id, pid: process.pid })); } catch (e) { console.log(JSON.stringify({ ok: false, code: e.code, reason: e.message, winner: e.details?.winner?.candidate_id ?? null, pid: process.pid })); }\n`);
  const run = (id) => new Promise((ok) => { const p = spawn(process.execPath, [script, rt.outbox, job, gen, id, String(go)]); let o = ""; p.stdout.on("data", (d) => (o += d)); p.on("close", () => ok(JSON.parse(o.trim().split("\n").pop()))); });
  const res = await Promise.all([run(a.candidates[0].id), run(a.candidates[1].id)]), winners = res.filter((r) => r.ok), losers = res.filter((r) => !r.ok);
  assert.equal(winners.length, 1, JSON.stringify(res)); assert.equal(losers.length, 1); assert.equal(losers[0].code, "OUTBOX_IMMUTABLE_VIOLATION"); assert.equal(losers[0].winner, winners[0].winner, "the loser is told the committed winner");
  assert.equal(CS.loadSelection({ out: rt.outbox, job, stage: 1, generation: gen }).candidate_id, winners[0].winner);
  fs.writeFileSync(path.join(W, "race_result.json"), JSON.stringify({ processes: res, committed: winners[0].winner }, null, 1));
  // crash while holding the lock: the holder exits without releasing; a later acquirer recovers (dead pid) with a NEW fencing generation
  const crash = path.join(W, "crash_lock.mjs"); fs.writeFileSync(crash, `import { acquireLock } from ${JSON.stringify(url.pathToFileURL(path.join(REPO, "engine", "production", "ledger.mjs")).href)};\nconst l = acquireLock(process.argv[2], "crashy"); console.log(l.token.generation); process.exit(0);\n`);
  const g1 = await new Promise((ok) => { const p = spawn(process.execPath, [crash, W]); let o = ""; p.stdout.on("data", (d) => (o += d)); p.on("close", () => ok(+o.trim())); });
  assert.ok(fs.existsSync(path.join(W, "locks", "crashy.lock")), "the crashed holder left its lock behind"); const l2 = acquireLock(W, "crashy", { waitMs: 3000 }); assert.equal(l2.token.generation, g1 + 1); l2.check(); l2.release();
  // a fenced holder whose lock was stolen cannot commit
  const l3 = acquireLock(W, "fence"); fs.rmSync(path.join(W, "locks", "fence.lock"), { recursive: true, force: true }); const l4 = acquireLock(W, "fence"); assert.throws(() => l3.check(), (e) => e.code === "LEASE_LOST"); l4.check(); l4.release();
});

test("P02-R19 timeout after a possible send halts at OUTCOME_UNKNOWN; no automatic second call; duplicate workers send once; reconciliation is explicit", async () => {
  const hang = await startProviderStub(OUT, { hang: true }), job = rt.jobIds.body;
  try { const env = envFor(hang, "timeout", { IMAGE_PROVIDER_TIMEOUT_MS: "400" }), r1 = await I.submitJob({ film: rt.film, out: rt.outbox, job, env }); assert.equal(r1.status, "EXTERNAL_OUTCOME_UNKNOWN"); const n = hang.requests().length; assert.equal(n, 1);
    const r2 = await I.submitJob({ film: rt.film, out: rt.outbox, job, env }); assert.equal(r2.status, "EXTERNAL_OUTCOME_UNKNOWN"); assert.equal(r2.provider_called, false); assert.equal(hang.requests().length, n, "no automatic resend of a possibly-charged request");
    const sub = path.join(rt.outbox, "submissions", job, r1.payload_key_sha256.slice(0, 16)); assert.throws(() => CS.reconcileOutcome(sub, { outcome: "KNOWN_REJECTED" }), /needs an outcome, an operator and evidence/);
    CS.reconcileOutcome(sub, { outcome: "KNOWN_REJECTED", operator: "p02-test-operator", evidence: "stub request log shows the hung request was never answered (diagnostic)" });
  } finally { await hang.close(); }
  // 5xx is NOT retry-safe (may have completed): OUTCOME_UNKNOWN, one request only
  const s5 = await startProviderStub(OUT, { failFirst: 5, failStatus: 503 }); try { const r = await I.submitJob({ film: rt.film, out: rt.outbox, job, env: envFor(s5, "five-hundred") }); assert.equal(r.status, "EXTERNAL_OUTCOME_UNKNOWN"); assert.equal(s5.requests().length, 1); } finally { await s5.close(); }
  // duplicate workers on the same payload: exactly one network send
  const dup = await startProviderStub(OUT); try { const env = envFor(dup, "dup-workers"), rs = await Promise.all([I.submitJob({ film: rt.film, out: rt.outbox, job, env }), I.submitJob({ film: rt.film, out: rt.outbox, job, env })]); assert.equal(dup.requests().length, 1, JSON.stringify(rs.map((r) => r.status))); } finally { await dup.close(); }
});

test("P02-F089 paid-run authorization: signed manifest bounds jobs, ceiling and retries; never extends to new images; unsigned/edited manifests refuse", () => {
  const signer = createDiagnosticReviewer(rt.film, "p02-diagnostic-producer"), m = RA.buildRunManifest({ film: "rt", jobs: [{ artjob: "J1", generation: "g1", stage: 1 }, { artjob: "J2", generation: "g2", stage: 1 }], provider: "openai-images", model: "m", spending_ceiling_usd: 1.0, per_call_estimate_usd: 0.3, expected_outputs: 2, input_digest: "d", checkpoints: ["after each stage"], rollback: "stop; no resend without reconciliation", retry_budget: 1 });
  assert.throws(() => RA.buildRunManifest({ ...m, jobs: [1, 2, 3, 4].map((i) => ({ artjob: `J${i}`, generation: "g", stage: 1 })) }), (e) => e.code === "REQUEST_BUDGET_EXCEEDED");
  const f = path.join(W, "AUTH.json"), led = path.join(W, "auth_ledger"); fs.rmSync(led, { recursive: true, force: true });
  fs.writeFileSync(f, JSON.stringify({ manifest: m, envelope: signer.sign({ scope: "paid_run", record_id: m.manifest_id, bundle_sha256: m.manifest_sha256, verdict: "APPROVED", nonce: crypto.randomBytes(8).toString("hex"), expires_utc: new Date(Date.now() + 3600e3).toISOString() }) }));
  const ok = RA.verifyRunAuthorization(f, { root: rt.film }); assert.equal(ok.ok, true); assert.equal(ok.kind, "DIAGNOSTIC_SIGNED");
  assert.equal(RA.verifyRunAuthorization(f, { root: path.join(W, "not_a_namespace") }).ok, false, "a diagnostic key never authorizes outside its namespace");
  const c = (artjob, stage = 1, retry = false) => RA.consumeRunAuthorization(f, { root: rt.film, ledgerDir: led, artjob, generation: artjob === "J1" ? "g1" : "g2", stage, payload_key_sha256: "k", retry });
  assert.equal(c("J1").call, 1); assert.throws(() => c("J1"), (e) => e.code === "RUN_NOT_AUTHORIZED", "same job twice"); assert.throws(() => c("J3"), (e) => e.code === "RUN_NOT_AUTHORIZED", "new image");
  assert.equal(c("J2").call, 2); assert.equal(c("J1", 1, true).call, 3); assert.throws(() => c("J2", 1, true), (e) => e.code === "REQUEST_BUDGET_EXCEEDED", "retry budget / ceiling");
  const t = J(f); t.manifest.spending_ceiling_usd = 100; fs.writeFileSync(f, JSON.stringify(t)); assert.match(RA.verifyRunAuthorization(f, { root: rt.film }).reason, /altered/);
  assert.match(RA.verifyRunAuthorization(path.join(W, "missing.json"), { root: rt.film }).reason, /no run authorization/);
});
