// P02-R16 / R21 (F081, F087): human authority = a signed envelope verified against trust anchors provisioned OUTSIDE the repo, bound to scope,
// record, bundle and a single-use nonce. A typed TTY confirmation, a hand-written receipt, a replayed/wrong-scope/stale/expired envelope, a
// revoked approval and any diagnostic key all fail production. Test trust is structurally confined to the diagnostic namespace.
import test, { after } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import os from "node:os"; import crypto from "node:crypto";
import { writeReceipt, verifyApproval, testTrust } from "../../engine/art_bridge/approvals.mjs";
import { createDiagnosticReviewer, verifyEnvelope } from "../../engine/art_bridge/reviewer_auth.mjs";
import * as L from "../../engine/production/ledger.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "auth");
const mk = (tag, ns = false) => { const d = path.join(W, tag); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(d, { recursive: true }); if (ns) fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "p02 auth\n"); return d; };
const doc = { assets: [], identities: [], rigs: [] }, B = (v) => ({ scope: "shot_review", id: "S1", evidence: { v } }), H = (b) => crypto.createHash("sha256").update(JSON.stringify(canon(b))).digest("hex");
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const envOf = (bundle, extra = {}) => ({ scope: "shot_review", record_id: "S1", bundle_sha256: H(bundle), verdict: "APPROVED", nonce: crypto.randomBytes(8).toString("hex"), expires_utc: new Date(Date.now() + 3600e3).toISOString(), ...extra });
// a PRODUCTION trust anchor provisioned outside the repository (temp dir) — the positive control for HUMAN authority
const keyDir = fs.mkdtempSync(path.join(os.tmpdir(), "p02-anchors-")), { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519");
fs.writeFileSync(path.join(keyDir, "REVIEWERS.json"), JSON.stringify({ reviewers: [{ id: "independent-reviewer", public_key_pem: publicKey.export({ type: "spki", format: "pem" }) }] }));
const prodSign = (e) => { const x = { ...e, reviewer_id: "independent-reviewer" }; const bytes = Buffer.from(JSON.stringify(canon({ ...x, signature: undefined }))); return { ...x, signature: crypto.sign(null, bytes, privateKey).toString("base64") }; };
const prevKeys = process.env.ART_BRIDGE_REVIEWER_KEYS_FILE; process.env.ART_BRIDGE_REVIEWER_KEYS_FILE = path.join(keyDir, "REVIEWERS.json");
after(() => { if (prevKeys === undefined) delete process.env.ART_BRIDGE_REVIEWER_KEYS_FILE; else process.env.ART_BRIDGE_REVIEWER_KEYS_FILE = prevKeys; fs.rmSync(keyDir, { recursive: true, force: true }); });

test("P02-R16 positive control: an envelope signed by an external trust anchor mints a HUMAN receipt that verifies", () => {
  const F = mk("human"), b = B(1), r = writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "independent-reviewer", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b)) } });
  assert.equal(r.reviewer_kind, "HUMAN"); const v = verifyApproval(doc, F, "shot_review", "S1", r.receipt_id, { requireHuman: true, bundle: b }); assert.equal(v.ok, true, v.reason); assert.equal(v.reviewer_kind, "HUMAN");
});

test("P02-R16 forgeries fail production: typed TTY, hand-written HUMAN receipt, replay, wrong scope, stale packet, expiry, revocation, in-repo key", () => {
  const F = mk("forge"), b = B(2);
  const tty = writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "me", verdict: "APPROVED", bundle: b, attestation: { method: "INTERACTIVE_TTY", typed: "I approve S1" } });
  assert.equal(tty.reviewer_kind, "LOCAL_OPERATOR_CONFIRMATION"); assert.equal(verifyApproval(doc, F, "shot_review", "S1", tty.receipt_id, { requireHuman: true, bundle: b }).status, "LOCAL_OPERATOR_ONLY");
  // hand-written receipt claiming HUMAN (correct history line, no valid signature)
  const id = "shot_review__S1__forged"; fs.writeFileSync(path.join(F, "reviews", `${id}.json`), JSON.stringify({ receipt_id: id, scope: "shot_review", record_id: "S1", verdict: "APPROVED", reviewer: "x", reviewer_kind: "HUMAN", bundle: b, bundle_sha256: H(b), attestation: { method: "SIGNED_ENVELOPE", envelope: { ...envOf(b), reviewer_id: "independent-reviewer", signature: "AAAA" } } }));
  fs.appendFileSync(path.join(F, "reviews", "HISTORY.jsonl"), JSON.stringify({ receipt_id: id, scope: "shot_review", record_id: "S1", verdict: "APPROVED" }) + "\n");
  assert.equal(verifyApproval(doc, F, "shot_review", "S1", id, { requireHuman: true, bundle: b }).status, "NOT_HUMAN");
  // replayed envelope (single-use nonce)
  const env = prodSign(envOf(b)); writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: env } });
  assert.throws(() => writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: env } }), /replayed review envelope nonce/);
  // wrong scope / wrong record / stale bundle / expired / tampered verdict
  assert.throws(() => writeReceipt(F, doc, { scope: "shot_review", id: "S2", reviewer: "r", verdict: "APPROVED", bundle: { ...b, id: "S2" }, attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b)) } }), /envelope scope/);
  assert.throws(() => writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "APPROVED", bundle: B(3), attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b)) } }), /different \(stale\) review bundle/);
  assert.throws(() => writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b, { expires_utc: new Date(Date.now() - 1000).toISOString() })) } }), /expired/);
  { const e = prodSign(envOf(b)); e.verdict = "REJECTED"; assert.throws(() => writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "REJECTED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: e } }), /signature does not verify/); }
  // approved content changes after review → STALE; later revocation → REVOKED
  const ok = writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b)) } });
  assert.equal(verifyApproval(doc, F, "shot_review", "S1", ok.receipt_id, { requireHuman: true, bundle: B(99) }).status, "STALE_RECEIPT");
  writeReceipt(F, doc, { scope: "shot_review", id: "S1", reviewer: "r", verdict: "REVOKED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: prodSign(envOf(b, { verdict: "REVOKED" })) } });
  assert.equal(verifyApproval(doc, F, "shot_review", "S1", ok.receipt_id, { requireHuman: true, bundle: b }).status, "REVOKED");
  // a key file INSIDE the repository is not a trust anchor
  const inRepo = path.join(W, "REVIEWERS_IN_REPO.json"); fs.copyFileSync(path.join(keyDir, "REVIEWERS.json"), inRepo); process.env.ART_BRIDGE_REVIEWER_KEYS_FILE = inRepo;
  try { assert.match(verifyEnvelope(prodSign(envOf(b)), { root: F, scope: "shot_review", recordId: "S1", bundleSha: H(b) }).reason, /no reviewer trust anchors provisioned outside/); } finally { process.env.ART_BRIDGE_REVIEWER_KEYS_FILE = path.join(keyDir, "REVIEWERS.json"); }
});

test("P02-R16/R21 a diagnostic key never qualifies outside its namespace; copying diagnostic receipts + anchors into a production film fails", () => {
  const D = mk("diag_ns", true), P = mk("prod_film"), b = B(5), signer = createDiagnosticReviewer(D, "diag-reviewer");
  const r = writeReceipt(D, doc, { scope: "shot_review", id: "S1", reviewer: "diag-reviewer", verdict: "APPROVED", bundle: b, attestation: { method: "SIGNED_ENVELOPE", envelope: signer.sign(envOf(b)) } }); assert.equal(r.reviewer_kind, "DIAGNOSTIC_SIGNED");
  assert.equal(verifyApproval(doc, D, "shot_review", "S1", r.receipt_id, { requireHuman: true, bundle: b }).ok, false, "even in its namespace a diagnostic signature needs explicit test trust");
  const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1";
  try { assert.equal(verifyApproval(doc, D, "shot_review", "S1", r.receipt_id, { requireHuman: true, bundle: b }).ok, true, "diagnostic namespace + test trust → diagnostic layer only");
    fs.cpSync(path.join(D, "reviews"), path.join(P, "reviews"), { recursive: true }); fs.cpSync(path.join(D, "diagnostic_keys"), path.join(P, "diagnostic_keys"), { recursive: true });
    assert.equal(verifyApproval(doc, P, "shot_review", "S1", r.receipt_id, { requireHuman: true, bundle: b }).status, "NOT_HUMAN", "copied diagnostic authority is refused in a production film");
    assert.equal(testTrust(P), false); assert.equal(testTrust(D), true);
    assert.throws(() => writeReceipt(P, doc, { scope: "shot_review", id: "S1", reviewer: "x", verdict: "APPROVED", bundle: b, attestation: { method: "TEST_TRUST" } }), /TEST_TRUST attestation is refused outside a diagnostic-namespace film/);
    assert.throws(() => createDiagnosticReviewer(P, "x"), /only be created inside a diagnostic-namespace film/);
    assert.throws(() => L.createRun(P, { runType: "DIAGNOSTIC" }), (e) => e.code === "TEST_TRUST_FORBIDDEN"); assert.throws(() => L.createRun(D, { runType: "PRODUCTION" }), (e) => e.code === "TEST_TRUST_FORBIDDEN");
  } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; }
});
