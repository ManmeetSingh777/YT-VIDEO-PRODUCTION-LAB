// Independent reviewer authentication (P02 directive F081/F087). HUMAN production authority = a canonical review ENVELOPE signed (ed25519) by a
// reviewer key whose PUBLIC key is provisioned in a trust-anchor file OUTSIDE this repository (ART_BRIDGE_REVIEWER_KEYS_FILE). The agent never
// generates, stores or reads a production signing key; a key file inside the repo, or no file, means AWAITING_INDEPENDENT_HUMAN_APPROVAL.
// The envelope binds reviewer, verdict, scope, film, record, exact bundle SHA, presented packet SHA, revisions, time, nonce, expiry and sequence.
// Diagnostic keys exist only inside a diagnostic-namespace film (.diagnostic_namespace) and can only ever yield DIAGNOSTIC_SIGNED.
// A hash chain/signature proves which key signed which bytes — not who held the key; that separation is stated, not conflated.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
export const envelopeBytes = (e) => Buffer.from(JSON.stringify(canon({ ...e, signature: undefined })));
export const isDiagnosticNamespace = (root) => !!root && fs.existsSync(path.join(path.resolve(root), ".diagnostic_namespace"));
/** trust anchors: production file must live OUTSIDE the repo; diagnostic anchors only inside a diagnostic-namespace film */
export function loadAnchors(root) {
  const out = { production: [], diagnostic: [], production_source: null };
  const f = process.env.ART_BRIDGE_REVIEWER_KEYS_FILE; if (f && fs.existsSync(f)) { const abs = path.resolve(f); if (!abs.startsWith(REPO + path.sep)) { out.production = JSON.parse(fs.readFileSync(abs, "utf8")).reviewers || []; out.production_source = abs; } }
  if (isDiagnosticNamespace(root)) { const d = path.join(path.resolve(root), "diagnostic_keys", "ANCHORS.json"); if (fs.existsSync(d)) out.diagnostic = JSON.parse(fs.readFileSync(d, "utf8")).reviewers || []; }
  return out;
}
/** diagnostic signer (tests only): key pair lives in the diagnostic namespace and is labelled DIAGNOSTIC_ONLY */
export function createDiagnosticReviewer(root, reviewerId) {
  if (!isDiagnosticNamespace(root)) throw new Error("diagnostic reviewer keys can only be created inside a diagnostic-namespace film");
  const { publicKey, privateKey } = crypto.generateKeyPairSync("ed25519"), d = path.join(path.resolve(root), "diagnostic_keys"), af = path.join(d, "ANCHORS.json"); fs.mkdirSync(d, { recursive: true });
  const a = fs.existsSync(af) ? JSON.parse(fs.readFileSync(af, "utf8")) : { provenance: "DIAGNOSTIC_ONLY", reviewers: [] }; a.reviewers.push({ id: reviewerId, public_key_pem: publicKey.export({ type: "spki", format: "pem" }), provenance: "DIAGNOSTIC_ONLY" }); fs.writeFileSync(af, JSON.stringify(a, null, 1));
  return { id: reviewerId, sign: (env) => ({ ...env, reviewer_id: reviewerId, signature: crypto.sign(null, envelopeBytes({ ...env, reviewer_id: reviewerId }), privateKey).toString("base64") }) };
}
/** verifyEnvelope(env, {root, scope, recordId, bundleSha, filmId}) → {ok, kind: HUMAN|DIAGNOSTIC_SIGNED, reason} */
export function verifyEnvelope(env, { root, scope, recordId, bundleSha, filmId = null, now = Date.now() }) {
  if (!env?.signature || !env.reviewer_id) return { ok: false, reason: "unsigned envelope" };
  const A = loadAnchors(root), prod = A.production.find((k) => k.id === env.reviewer_id), diag = A.diagnostic.find((k) => k.id === env.reviewer_id), key = prod || diag;
  if (!key) return { ok: false, reason: A.production_source ? `reviewer ${env.reviewer_id} is not a trust anchor` : "AWAITING_INDEPENDENT_HUMAN_APPROVAL: no reviewer trust anchors provisioned outside the repository" };
  if (key.revoked_utc) return { ok: false, reason: `reviewer key ${env.reviewer_id} was revoked (${key.revoked_utc})` };
  let sigOk = false; try { sigOk = crypto.verify(null, envelopeBytes(env), crypto.createPublicKey(key.public_key_pem), Buffer.from(env.signature, "base64")); } catch { sigOk = false; }
  if (!sigOk) return { ok: false, reason: "signature does not verify for the claimed reviewer" };
  if (env.scope !== scope || env.record_id !== recordId) return { ok: false, reason: `envelope scope ${env.scope}/${env.record_id} ≠ ${scope}/${recordId}` };
  if (env.bundle_sha256 !== bundleSha) return { ok: false, reason: "envelope signs a different (stale) review bundle" };
  if (env.film_id && root && env.film_id !== path.basename(path.resolve(root))) return { ok: false, reason: `envelope belongs to film ${env.film_id}, not ${path.basename(path.resolve(root))}` };
  if (filmId && env.film_id !== filmId) return { ok: false, reason: "envelope belongs to another film" };
  if (!env.nonce || !env.expires_utc || Date.parse(env.expires_utc) < now) return { ok: false, reason: "envelope expired or lacks nonce/expiry" };
  return { ok: true, kind: prod ? "HUMAN" : "DIAGNOSTIC_SIGNED", reviewer: env.reviewer_id };
}
/** nonce registry: a signed envelope can mint exactly ONE receipt (replay refused) */
export function consumeNonce(root, env) { const f = path.join(path.resolve(root), "reviews", "NONCES.jsonl"); fs.mkdirSync(path.dirname(f), { recursive: true }); const used = fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).nonce) : [];
  if (used.includes(env.nonce)) throw new Error(`replayed review envelope nonce ${env.nonce}`); fs.appendFileSync(f, JSON.stringify({ nonce: env.nonce, reviewer: env.reviewer_id, at: new Date().toISOString() }) + "\n"); }
