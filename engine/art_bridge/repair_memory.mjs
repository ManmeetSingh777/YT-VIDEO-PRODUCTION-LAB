// Reusable repair learning (directive K / C7; F032, F034, F035, F064). Every failure becomes an immutable record naming its producer and
// root mechanism; a repair rule becomes applicable to a NEW job only when its machine-readable predicate matches that job, never by
// scene name; a rule contradicting the F-source, approved direction or a qualified counterexample blocks (REPAIR_RULE_CONFLICT) instead of
// silently winning. Rules are delivered to first-pass requests through the installed skill's repair memory (learning/REPAIR_MEMORY.json);
// a rule is QUALIFIED only with real provider before/after pixels — diagnostic evidence can never mark artistic learning qualified.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
const sha = (s) => crypto.createHash("sha256").update(typeof s === "string" ? s : JSON.stringify(s)).digest("hex");
export const STATUSES = ["UNRESOLVED", "IMPLEMENTED_UNQUALIFIED", "TRANSFER_PROVED", "QUALIFIED_REAL_PRODUCTION"];
const REQUIRED = ["failure_id", "failure_class", "applicability", "invariant", "producer", "root_mechanism", "before", "status"];

/** recordFailure(root, rec) — immutable (exclusive create) K1 record under <root>/learning/FAILURES/<failure_id>.json */
export function recordFailure(root, rec) {
  const miss = REQUIRED.filter((k) => rec[k] === undefined || rec[k] === ""); if (miss.length) throw err("SCHEMA_VIOLATION", { record_id: rec.failure_id, reason: `failure record lacks ${miss}`, producer: "engine/art_bridge/repair_memory.mjs#recordFailure" });
  if (!STATUSES.includes(rec.status)) throw err("SCHEMA_VIOLATION", { record_id: rec.failure_id, reason: `status ${rec.status}` });
  if (/(^|[^a-z])(ines|washer|laundromat|ledger|drum|s0\d)([^a-z]|$)/i.test(rec.failure_class)) throw err("SCHEMA_VIOLATION", { record_id: rec.failure_id, reason: "failure_class must be a general type, not a scene/character name" });
  const f = path.join(root, "learning", "FAILURES", `${rec.failure_id}.json`); fs.mkdirSync(path.dirname(f), { recursive: true });
  fs.writeFileSync(f, JSON.stringify({ ...rec, recorded_at: new Date().toISOString(), record_sha256: sha(rec) }, null, 1), { flag: "wx" }); return f;
}
/** predicate over a job's learning context + facts: every key in `applies_when` must match exactly (arrays = any-of); nothing else matches */
export function predicateMatches(applies, ctx) {
  if (!applies || typeof applies !== "object" || !Object.keys(applies).length) return false;
  return Object.entries(applies).every(([k, v]) => (Array.isArray(v) ? v.includes(ctx[k]) : ctx[k] === v));
}
/** selectRules({memory, context, design}) → {rules, rule_ids, conflicts}; throws REPAIR_RULE_CONFLICT when a matching rule contradicts the design/source */
export function selectRules({ memory, context, design = null }) {
  const rules = (memory?.rules || []).filter((r) => predicateMatches(r.applies_when, context)), conflicts = [];
  const decided = new Map((design?.method_decisions || []).map((d) => [d.method_id, d]));
  for (const r of rules) for (const c of r.contradicts || []) { const d = decided.get(c.method_id); if (d && c.forbidden_decision_pattern && new RegExp(c.forbidden_decision_pattern, "i").test(`${d.specific_decision} ${d.visible_construction_operation}`)) conflicts.push({ rule_id: r.rule_id, method_id: c.method_id, reason: c.reason }); }
  for (let i = 0; i < rules.length; i++) for (let j = i + 1; j < rules.length; j++) { const a = rules[i], b = rules[j]; if ((a.excludes || []).includes(b.rule_id) || (b.excludes || []).includes(a.rule_id)) conflicts.push({ rule_id: `${a.rule_id}×${b.rule_id}`, reason: "mutually exclusive rules both match" }); }
  if (conflicts.length) throw err("REPAIR_RULE_CONFLICT", { record_id: context?.subject_id, reason: conflicts.map((c) => `${c.rule_id}: ${c.reason}`).join("; "), producer: "engine/art_bridge/repair_memory.mjs#selectRules", repair_owner: "HUMAN_ART_DIRECTOR", resume_at: "REPAIR_RULE_REVIEW", details: { conflicts } });
  return { rules, rule_ids: rules.map((r) => r.rule_id), conflicts };
}
/** digest of the rules that MATCH this job — so an unrelated memory change leaves other jobs' generations (and approvals) stable */
export function matchingRulesDigest(memoryPath, context) {
  if (!memoryPath || !fs.existsSync(memoryPath)) return null;
  const m = JSON.parse(fs.readFileSync(memoryPath, "utf8")); return sha({ version: m.version, rules: (m.rules || []).filter((r) => predicateMatches(r.applies_when, context)) });
}
/** ruleQualification(rule, {root}) — F083: computed ONLY from a resolvable evidence chain, never from self-described fields:
 *  actual before/after image BYTES under root (hashes recomputed, distinct), a SEALED provider result record containing the after bytes (not a
 *  stub), a verified HUMAN art-review receipt over the after candidate, a recorded first-pass change on an UNLIKE job (two different compiled
 *  request hashes whose diff contains the rule's operation) and an unlike-family transfer result file. Missing any → IMPLEMENTED_UNQUALIFIED. */
export function ruleQualification(rule, { root = null, verifyApproval = null, doc = null } = {}) {
  const ev = rule.evidence || {}, why = [], fileOk = (p) => root && p && fs.existsSync(path.resolve(root, p)) && path.resolve(root, p).startsWith(path.resolve(root) + path.sep);
  const fsha = (p) => crypto.createHash("sha256").update(fs.readFileSync(path.resolve(root, p))).digest("hex");
  if (!fileOk(ev.before_file) || !fileOk(ev.after_file)) why.push("before/after image bytes are not accessible (a SHA field is not evidence)");
  else { const b = fsha(ev.before_file), a = fsha(ev.after_file); if (b === a) why.push("before and after images are identical"); if (rule.before_sha256 && b !== rule.before_sha256) why.push("before bytes differ from the claimed hash"); if (rule.after_sha256 && a !== rule.after_sha256) why.push("after bytes differ from the claimed hash");
    if (!fileOk(ev.provider_result) || !fileOk(ev.provider_result_sha)) why.push("no sealed provider result record"); else { const rec = fs.readFileSync(path.resolve(root, ev.provider_result), "utf8"); if (crypto.createHash("sha256").update(rec).digest("hex") !== fs.readFileSync(path.resolve(root, ev.provider_result_sha), "utf8").trim()) why.push("provider result record altered"); else { const r = JSON.parse(rec); if (r.provenance_to_ingest !== "GPT_PROVIDER_ART") why.push(`provider provenance ${r.provenance_to_ingest}`); if (!(r.candidates || []).some((c) => c.sha256 === a && c.valid)) why.push("the after image is not a valid candidate of that provider result"); } } }
  if (!ev.review_receipt_id || !verifyApproval || !doc) why.push("no verifiable human art-review receipt"); else { const v = verifyApproval(doc, root, "art_review", rule.after_sha256, ev.review_receipt_id, { requireHuman: true }); if (!v.ok || v.reviewer_kind !== "HUMAN") why.push(`art review ${v.status}${v.reviewer_kind ? " " + v.reviewer_kind : ""}`); }
  const fp = ev.first_pass_change; if (!fp || !fp.unlike_job || !fp.request_before_sha256 || !fp.request_after_sha256 || fp.request_before_sha256 === fp.request_after_sha256 || !fileOk(fp.request_after_file) || !fs.readFileSync(path.resolve(root, fp.request_after_file), "utf8").includes((rule.positive_construction_ops || [])[0] || "\u0000")) why.push("no observed first-pass request change on an unlike job carrying the rule's operation");
  const tt = ev.transfer_result_file && fileOk(ev.transfer_result_file) ? JSON.parse(fs.readFileSync(path.resolve(root, ev.transfer_result_file), "utf8")) : null; if (!tt || tt.result !== "PASS" || !tt.unlike_family || tt.unlike_family === rule.applies_when?.family) why.push("no unlike-family transfer result");
  return why.length ? { status: "IMPLEMENTED_UNQUALIFIED", reasons: why } : { status: "QUALIFIED_REAL_PRODUCTION", reasons: [] };
}
/** promoteToSkillRule(rec, rule) — skill-format rule (learning/REPAIR_MEMORY.json) built from a K1 record; refuses scene-specific scope */
export function promoteToSkillRule(rec, rule) {
  if (rule.scope === "CONDITIONAL_FAMILY" && rule.applies_when?.subject_id) throw err("SCHEMA_VIOLATION", { record_id: rule.rule_id, reason: "a family rule cannot hard-code one identity" });
  return { rule_id: rule.rule_id, scope: rule.scope, status: rule.status, applies_when: rule.applies_when, root_cause: rec.root_mechanism, first_request_change: rule.first_request_change, positive_construction_ops: rule.positive_construction_ops, source_contrast: rule.source_contrast, observed_improvement: rule.observed_improvement, regression_boundary: rule.regression_boundary, before_sha256: rule.before_sha256, after_sha256: rule.after_sha256, evidence_provenance: rule.evidence_provenance, failure_id: rec.failure_id, contradicts: rule.contradicts || [], excludes: rule.excludes || [] };
}
