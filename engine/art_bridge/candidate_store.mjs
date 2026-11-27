// Immutable provider outcomes, candidate selection and capability evidence (P02 directive F079/F084/F086/F092).
// • EXTERNAL_REQUEST_PREPARED is written (exclusive create) BEFORE any network send; the outcome is later COMPLETED / KNOWN_REJECTED /
//   DEFINITELY_NOT_SENT / OUTCOME_UNKNOWN. A prepared request without a terminal outcome blocks any resend (no blind paid retry).
// • Provider result records are content-hashed at creation (RESULT.sha256 sidecar). A stage selection names a CANDIDATE ID inside such a record
//   for the exact (artjob, generation, stage) and is written under a fenced lock: exactly one selection can ever commit; the next stage loads
//   only that selection and re-verifies record hash, membership, validity, provenance, location (no traversal/symlink) and bytes.
// • Capabilities: DECLARED (operator JSON) is not evidence; LIVE_VERIFIED needs a stored canary result whose outputs were checked.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { acquireLock } from "../production/ledger.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
const writeOnce = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s, { flag: "wx" }); };
const inside = (root, p) => { const r = path.resolve(p); if (!r.startsWith(path.resolve(root) + path.sep)) return false; return !fs.lstatSync(r).isSymbolicLink(); };
export const OUTCOMES = ["DEFINITELY_NOT_SENT", "KNOWN_REJECTED", "COMPLETED", "OUTCOME_UNKNOWN"];
/** prepare(subDir, record) — exclusive; returns {state: "NEW"} or the existing request state */
export function prepareRequest(subDir, rec) {
  const f = path.join(subDir, "REQUEST_PREPARED.json"), o = path.join(subDir, "OUTCOME.json");
  if (fs.existsSync(f)) { const outc = fs.existsSync(o) ? JSON.parse(fs.readFileSync(o, "utf8")) : null; return { state: outc ? outc.outcome : "OUTCOME_UNKNOWN", prepared: JSON.parse(fs.readFileSync(f, "utf8")), outcome: outc }; }
  writeOnce(f, JSON.stringify({ ...rec, local_request_id: `REQ-${crypto.randomBytes(6).toString("hex")}`, prepared_utc: new Date().toISOString() }, null, 1)); return { state: "NEW", prepared: JSON.parse(fs.readFileSync(f, "utf8")) };
}
/** record the terminal outcome exactly once; KNOWN_REJECTED / DEFINITELY_NOT_SENT outcomes are archived so a new attempt may be prepared */
export function recordOutcome(subDir, outcome, evidence = {}) {
  if (!OUTCOMES.includes(outcome)) throw new Error(`bad outcome ${outcome}`); const o = path.join(subDir, "OUTCOME.json");
  if (outcome === "KNOWN_REJECTED" || outcome === "DEFINITELY_NOT_SENT") { const arch = path.join(subDir, "attempts", `${Date.now()}`); fs.mkdirSync(arch, { recursive: true }); for (const x of ["REQUEST_PREPARED.json"]) if (fs.existsSync(path.join(subDir, x))) fs.renameSync(path.join(subDir, x), path.join(arch, x)); fs.writeFileSync(path.join(arch, "OUTCOME.json"), JSON.stringify({ outcome, ...evidence, at: new Date().toISOString() }, null, 1)); return; }
  writeOnce(o, JSON.stringify({ outcome, ...evidence, at: new Date().toISOString() }, null, 1));
}
/** operator reconciliation of an UNKNOWN outcome (e.g. after checking the provider dashboard / status API); never automatic */
export function reconcileOutcome(subDir, { outcome, operator, evidence }) { if (!["KNOWN_REJECTED", "DEFINITELY_NOT_SENT", "COMPLETED"].includes(outcome) || !operator || !evidence) throw new Error("reconciliation needs an outcome, an operator and evidence"); recordOutcome(subDir, outcome, { reconciled_by: operator, reconciliation_evidence: evidence }); }
/** seal a provider result record (content hash sidecar written once) */
export function sealResult(subDir, result) { const f = path.join(subDir, "PROVIDER_RESULT.json"), s = JSON.stringify(result, null, 1); writeOnce(f, s); writeOnce(path.join(subDir, "RESULT.sha256"), sha(s)); return sha(s); }
export function loadResult(subDir) { const f = path.join(subDir, "PROVIDER_RESULT.json"), h = path.join(subDir, "RESULT.sha256"); if (!fs.existsSync(f) || !fs.existsSync(h)) throw err("STAGE_PREDECESSOR_MISSING", { reason: `no sealed provider result in ${subDir}` }); const s = fs.readFileSync(f, "utf8"); if (sha(s) !== fs.readFileSync(h, "utf8").trim()) throw err("OUTBOX_IMMUTABLE_VIOLATION", { reason: "provider result record altered after sealing" }); return { record: JSON.parse(s), record_sha256: sha(s) }; }
// one winner per (job, stage, GENERATION): a changed generation never inherits or overwrites another generation's selection. The legacy
// per-(job, stage) file stays valid for the generation it names.
const legacySel = (out, job, stage) => path.join(out, "submissions", job, `STAGE_${String(stage).padStart(2, "0")}_SELECTION.json`);
const selFile = (out, job, stage, generation) => { const l = legacySel(out, job, stage); if (fs.existsSync(l) && JSON.parse(fs.readFileSync(l, "utf8")).generation === generation) return l; return path.join(out, "submissions", job, `STAGE_${String(stage).padStart(2, "0")}__${generation}_SELECTION.json`); };
/** every committed selection of a job (all generations), oldest first */
export function listSelections({ out, job }) { const d = path.join(out, "submissions", job); if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((f) => /^STAGE_\d{2}(__\w+)?_SELECTION\.json$/.test(f)).map((f) => JSON.parse(fs.readFileSync(path.join(d, f), "utf8"))).sort((a, b) => a.selected_utc.localeCompare(b.selected_utc)); }
/** selectCandidate({out, job, stage, generation, candidateId}) — candidateId = "<key16>:<index>"; one winner per (job, stage) */
export function selectCandidate({ out, job, stage, generation, candidateId, selector = "OPERATOR", rebased_from = null }) {
  const [key16, idx] = String(candidateId).split(":"); if (!/^[0-9a-f]{16}$/.test(key16 || "") || !/^\d+$/.test(idx || "")) throw err("STAGE_PREDECESSOR_MISSING", { reason: `malformed candidate id ${candidateId}` });
  const subDir = path.join(out, "submissions", job, key16), { record, record_sha256 } = loadResult(subDir), c = record.candidates?.[+idx];
  if (!c) throw err("STAGE_PREDECESSOR_MISSING", { reason: `candidate ${candidateId} is not a member of the result record` });
  if (record.payload_key?.generation !== generation || record.payload_key?.stage !== stage || record.ancestry?.artjob !== job) throw err("STALE_COMPILED_REQUEST", { reason: `candidate ${candidateId} belongs to job ${record.ancestry?.artjob} generation ${record.payload_key?.generation} stage ${record.payload_key?.stage}, not ${job}/${generation}/${stage}` });
  if (c.valid !== true) throw err("STAGE_PREDECESSOR_MISSING", { reason: `candidate ${candidateId} failed output validation` });
  const store = path.join(out, "inbox", "candidates", job); if (!fs.existsSync(c.file) || !inside(store, c.file)) throw err("ASSET_PATH_INVALID", { reason: `candidate file outside the immutable candidate store: ${c.file}` });
  if (fsha(c.file) !== c.sha256) throw err("ASSET_HASH_MISMATCH", { reason: `candidate ${candidateId} bytes changed after receipt` });
  const lock = acquireLock(out, `select-${job}-${stage}`); try { const f = selFile(out, job, stage, generation); if (fs.existsSync(f)) { const w = JSON.parse(fs.readFileSync(f, "utf8")); throw err("OUTBOX_IMMUTABLE_VIOLATION", { reason: `stage ${stage} of ${job} already selected ${w.candidate_id} (winner kept)`, details: { winner: w } }); }
    lock.check(); writeOnce(f, JSON.stringify({ job, stage, generation, candidate_id: candidateId, result_record_sha256: record_sha256, candidate_sha256: c.sha256, provenance: record.provenance_to_ingest, selector, ...(rebased_from ? { rebased_from } : {}), selected_utc: new Date().toISOString(), lock_generation: lock.token.generation }, null, 1)); }
  finally { lock.release(); }
  return loadSelection({ out, job, stage, generation });
}
/** loadSelection — the ONLY way a next stage obtains its predecessor; everything is re-verified */
export function loadSelection({ out, job, stage, generation }) {
  const f = selFile(out, job, stage, generation); if (!fs.existsSync(f)) throw err("STAGE_PREDECESSOR_MISSING", { reason: `stage ${stage} of ${job} has no committed selection` });
  const s = JSON.parse(fs.readFileSync(f, "utf8")); if (s.generation !== generation) throw err("STALE_COMPILED_REQUEST", { reason: `selection belongs to generation ${s.generation}` });
  const [key16, idx] = s.candidate_id.split(":"), { record, record_sha256 } = loadResult(path.join(out, "submissions", job, key16)), c = record.candidates[+idx];
  if (record_sha256 !== s.result_record_sha256 || c.sha256 !== s.candidate_sha256 || fsha(c.file) !== c.sha256) throw err("ASSET_HASH_MISMATCH", { reason: "selected candidate lineage no longer verifies" });
  return { ...s, file: c.file, record_stage: record.payload_key.stage };
}
/** capability classification (F092): only a stored, checked canary result makes a capability LIVE_VERIFIED */
export function capabilityStatus(root, report, declared) {
  const f = path.join(root, "capabilities", String(report.provider), String(report.model).replace(/[^\w.-]/g, "_"), "CANARY_RESULT.json"), canary = fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
  return Object.fromEntries(Object.keys(declared || {}).filter((k) => typeof declared[k] === "boolean").map((k) => [k, canary?.verified?.[k] === true ? "LIVE_VERIFIED" : canary?.verified?.[k] === false ? "FAILED" : declared[k] ? "DECLARED" : "UNTESTED"]));
}
