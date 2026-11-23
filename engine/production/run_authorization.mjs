// Paid-run / long-render authorization (P02 directive F089). Before any CHARGEABLE provider call (or a long real-film render) a run manifest
// states: job list (artjob, generation, stage), provider/model, spending ceiling, per-call estimate, expected outputs, input digest, checkpoints,
// rollback/restart behaviour and retry budget. It becomes an authorization ONLY through a signed envelope (scope "paid_run", record = manifest
// id, bundle = manifest hash) from a trust anchor provisioned outside the repo (HUMAN). Consumption is append-only under a fenced lock: each
// call must name a listed job/stage, the call count and estimated spend may never exceed the manifest, and a KNOWN_REJECTED retry consumes the
// retry budget. New images, other jobs or extra retries are refused (RUN_NOT_AUTHORIZED). Nothing here creates or approves a chargeable run.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
import { verifyEnvelope, isDiagnosticNamespace } from "../art_bridge/reviewer_auth.mjs";
import { acquireLock } from "./ledger.mjs";
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
const sha = (v) => crypto.createHash("sha256").update(typeof v === "string" ? v : JSON.stringify(canon(v))).digest("hex");
const REQUIRED = ["film", "jobs", "provider", "model", "spending_ceiling_usd", "per_call_estimate_usd", "expected_outputs", "input_digest", "checkpoints", "rollback", "retry_budget"];
/** buildRunManifest(fields) → manifest (unsigned; an operator must sign it with an external key) */
export function buildRunManifest(fields) {
  const miss = REQUIRED.filter((k) => fields[k] === undefined || fields[k] === null || (Array.isArray(fields[k]) && !fields[k].length)); if (miss.length) throw err("SCHEMA_VIOLATION", { reason: `run manifest lacks ${miss.join(", ")}`, producer: "engine/production/run_authorization.mjs#buildRunManifest" });
  if (fields.jobs.length * fields.per_call_estimate_usd > fields.spending_ceiling_usd) throw err("REQUEST_BUDGET_EXCEEDED", { reason: `${fields.jobs.length} calls × $${fields.per_call_estimate_usd} exceeds the ceiling $${fields.spending_ceiling_usd}` });
  const body = { kind: "PAID_RUN_MANIFEST", ...fields, jobs: fields.jobs.map((j) => ({ artjob: j.artjob, generation: j.generation, stage: j.stage })), created_utc: fields.created_utc || new Date().toISOString() };
  return { ...body, manifest_id: `RUN-${sha(body).slice(0, 16)}`, manifest_sha256: sha(body) };
}
const bodyOf = (m) => { const { manifest_id, manifest_sha256, ...b } = m; return b; };
/** verifyRunAuthorization(file, {root}) → {ok, kind, manifest, reason} — HUMAN for production; DIAGNOSTIC_SIGNED only inside a diagnostic namespace */
export function verifyRunAuthorization(file, { root }) {
  if (!file || !fs.existsSync(file)) return { ok: false, reason: "no run authorization file (ART_BRIDGE_BUDGET_AUTHORIZATION)" };
  let a; try { a = JSON.parse(fs.readFileSync(file, "utf8")); } catch { return { ok: false, reason: "authorization unreadable" }; }
  const m = a.manifest; if (!m || sha(bodyOf(m)) !== m.manifest_sha256 || `RUN-${m.manifest_sha256.slice(0, 16)}` !== m.manifest_id) return { ok: false, reason: "manifest altered after hashing" };
  const v = verifyEnvelope(a.envelope, { root, scope: "paid_run", recordId: m.manifest_id, bundleSha: m.manifest_sha256 }); if (!v.ok) return { ok: false, reason: `authorization envelope: ${v.reason}` };
  if (a.envelope.verdict !== "APPROVED") return { ok: false, reason: `authorization verdict ${a.envelope.verdict}` };
  if (v.kind !== "HUMAN" && !isDiagnosticNamespace(root)) return { ok: false, reason: `${v.kind} authorization is not valid outside a diagnostic namespace` };
  return { ok: true, kind: v.kind, manifest: m };
}
/** consume(file, {root, ledgerDir, artjob, generation, stage, payload_key_sha256, retry}) — append-only, fenced; throws RUN_NOT_AUTHORIZED */
export function consumeRunAuthorization(file, { root, ledgerDir, artjob, generation, stage, payload_key_sha256, retry = false }) {
  const v = verifyRunAuthorization(file, { root }); if (!v.ok) throw err("RUN_NOT_AUTHORIZED", { record_id: artjob, reason: v.reason, producer: "engine/production/run_authorization.mjs#consumeRunAuthorization", repair_owner: "HUMAN_PRODUCER", resume_at: "RUN_AUTHORIZATION" });
  const m = v.manifest, j = m.jobs.find((x) => x.artjob === artjob && x.generation === generation && x.stage === stage);
  if (!j) throw err("RUN_NOT_AUTHORIZED", { record_id: artjob, reason: `${artjob}/${generation}/stage ${stage} is not in authorized run ${m.manifest_id} (an authorization never extends to new images)`, resume_at: "RUN_AUTHORIZATION" });
  const f = path.join(ledgerDir, `${m.manifest_id}.CONSUMPTION.jsonl`), lock = acquireLock(ledgerDir, `auth-${m.manifest_id}`);
  try { const used = fs.existsSync(f) ? fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)) : [];
    const calls = used.length, retries = used.filter((u) => u.retry).length, same = used.filter((u) => u.artjob === artjob && u.stage === stage && !u.retry).length;
    if (!retry && same) throw err("RUN_NOT_AUTHORIZED", { record_id: artjob, reason: `${artjob} stage ${stage} already consumed its authorized call`, resume_at: "RUN_AUTHORIZATION" });
    if (retry && retries >= m.retry_budget) throw err("REQUEST_BUDGET_EXCEEDED", { record_id: artjob, reason: `retry budget ${m.retry_budget} exhausted`, resume_at: "RUN_AUTHORIZATION" });
    if ((calls + 1) * m.per_call_estimate_usd > m.spending_ceiling_usd) throw err("REQUEST_BUDGET_EXCEEDED", { record_id: artjob, reason: `call ${calls + 1} would exceed ceiling $${m.spending_ceiling_usd}`, resume_at: "RUN_AUTHORIZATION" });
    lock.check(); fs.appendFileSync(f, JSON.stringify({ artjob, generation, stage, payload_key_sha256, retry, at: new Date().toISOString(), lock_generation: lock.token.generation }) + "\n");
    return { manifest_id: m.manifest_id, call: calls + 1, estimated_spend_usd: (calls + 1) * m.per_call_estimate_usd, kind: v.kind };
  } finally { lock.release(); }
}
