// P07 pre-generation visual audit (ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1 §4): before the FIRST image of a new canonical master is generated,
// the art operator records ten substantive gap-finding passes for THIS subject, bound to the exact design revision and the native witness manifest.
// The code checks presence, binding, coverage and that each pass carries real, subject-specific decisions (not ten checklist echoes). It does NOT
// and cannot judge beauty: the human art-director's design approval covers the audit bytes (designBundle includes the audit digest).
// File: <film>/art_designs/<job_id>.pregen_audit.json (schemas/pregen_audit_v1.schema.json).
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { validate } from "./jsonschema.mjs";
import { bundleHash } from "./approvals.mjs";
import { witnessPath } from "./witness_regions.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const SCHEMA_FILE = path.join(REPO, "schemas", "pregen_audit_v1.schema.json");
export const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
/** the ten audit domains, in order (the standard's categories; the QUESTIONS inside each are subject-specific) */
export const DOMAINS = Object.freeze(["film_goal_attention_silhouette", "native_grammar_witnesses_originality", "anatomy_proportion_perspective", "color_material_edge_light", "face_expression_hands_identity_views", "articulation_occlusion_alternate_art", "world_depth_camera_light", "state_coverage_for_motion", "method_to_construction_mapping", "emergent_gap_finder"]);
const WITNESS_DOMAINS = new Set(["native_grammar_witnesses_originality", "anatomy_proportion_perspective", "color_material_edge_light", "face_expression_hands_identity_views", "world_depth_camera_light"]);
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const FILLER = /^(n\/?a|na|tbd|todo|none|ok|okay|fine|good|looks good|pass|passed|yes|no|done|same|see above|as above|-+|\.+)\.?$/i;
const norm = (t) => String(t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const auditFile = (film, jobId) => path.join(path.resolve(film), "art_designs", `${jobId}.pregen_audit.json`);
export function witnessManifestSha(film) { const f = [path.join(path.resolve(film), "skill", "QUESTION_NATIVE_WITNESS_MANIFEST.json"), path.join(REPO, "reference", "construct-kurzgesagt-art", "references", "QUESTION_NATIVE_WITNESS_MANIFEST.json")].find((p) => fs.existsSync(p)); return f ? sha(fs.readFileSync(f)) : null; }
/** validatePregenAudit({audit, design, film}) → {ok, failures:[BridgeError], sha256}. Pure over its inputs + the witness files on disk. */
export function validatePregenAudit({ audit, design, film }) {
  const F = [], no = (code, inv, reason) => F.push(err(code, { record_id: design?.job_id ?? "(design)", reason, failed_invariant: inv, producer: "engine/art_bridge/pregen_audit.mjs#validatePregenAudit", repair_owner: "GPT_ART_OPERATOR", resume_at: "PREGEN_AUDIT" }));
  if (!audit) { no("PREGEN_AUDIT_MISSING", "AUDIT_PRESENT", `no pre-generation audit for ${design?.job_id}: ten subject-specific gap-finding passes must be recorded before the first image`); return { ok: false, failures: F, sha256: null }; }
  for (const x of validate(SCHEMA, audit)) no("PREGEN_AUDIT_INVALID", "SCHEMA_V1", `${x.path}: ${x.msg}`); if (F.length) return { ok: false, failures: F, sha256: null };
  if (audit.job_id !== design.job_id) no("PREGEN_AUDIT_INVALID", "AUDIT_FOR_THIS_JOB", `audit is for ${audit.job_id}, the design is ${design.job_id}`);
  if (audit.design_sha256 !== bundleHash(design)) no("PREGEN_AUDIT_INVALID", "AUDIT_BOUND_TO_DESIGN_REVISION", "the design changed after the audit (stale audit): re-run the passes on the current design");
  const wm = witnessManifestSha(film); if (!wm || audit.witness_manifest_sha256 !== wm) no("PREGEN_AUDIT_INVALID", "AUDIT_BOUND_TO_WITNESSES", "the audit is not bound to the native witness manifest in use");
  const doms = audit.passes.map((p) => p.domain); if (JSON.stringify(doms) !== JSON.stringify(DOMAINS)) no("PREGEN_AUDIT_INVALID", "TEN_DISTINCT_DOMAINS_IN_ORDER", `passes must be exactly the ten domains in order (${DOMAINS.join(", ")}); got ${doms.join(", ")}`);
  const seenQ = new Map(), seenF = new Map(), methods = new Set((design.method_decisions || []).map((m) => m.method_id));
  for (const p of audit.passes) {
    for (const [k, v, min] of [["question", p.question, 30], ["findings", p.findings, 60]]) { if (FILLER.test(String(v).trim()) || String(v).trim().length < min) no("PREGEN_AUDIT_INVALID", "PASS_IS_SUBSTANTIVE", `${p.domain}.${k} is filler or too thin to be a real audit (${String(v).trim().length} chars)`);
      const n = norm(v), m = k === "question" ? seenQ : seenF; if (m.has(n)) no("PREGEN_AUDIT_INVALID", "PASSES_ARE_DISTINCT", `${p.domain}.${k} repeats ${m.get(n)}.${k}`); else m.set(n, p.domain); if (n === norm(p.domain)) no("PREGEN_AUDIT_INVALID", "PASS_IS_SUBSTANTIVE", `${p.domain}.${k} only restates the domain name`); }
    if (!p.decisions.length) no("PREGEN_AUDIT_INVALID", "PASS_DECIDES_SOMETHING", `${p.domain} records no construction decision`);
    for (const d of p.decisions) { if (String(d.decision).trim().length < 25 || FILLER.test(String(d.decision).trim())) no("PREGEN_AUDIT_INVALID", "DECISION_IS_CONCRETE", `${p.domain}: decision "${d.decision}" is not a concrete construction decision`);
      for (const m of d.method_ids || []) if (!methods.has(m)) no("PREGEN_AUDIT_INVALID", "METHOD_IN_DESIGN", `${p.domain}: method ${m} is not a decided method of this design`);
      if (d.witness) { if (!witnessPath(d.witness.file)) no("PREGEN_AUDIT_INVALID", "WITNESS_EXISTS", `${p.domain}: witness ${d.witness.file} is not an available native witness`); if (String(d.witness.observation ?? "").trim().length < 25) no("PREGEN_AUDIT_INVALID", "WITNESS_OBSERVED", `${p.domain}: witness ${d.witness.file} has no specific observation`); } }
    if (WITNESS_DOMAINS.has(p.domain) && !p.decisions.some((d) => d.witness)) no("PREGEN_AUDIT_INVALID", "GROUNDED_IN_WITNESS", `${p.domain} must ground at least one decision in a native witness observation`);
  }
  const map = audit.passes.find((p) => p.domain === "method_to_construction_mapping"); if (map) { const covered = new Set(map.decisions.flatMap((d) => d.method_ids || [])); for (const m of methods) if (!covered.has(m)) no("PREGEN_AUDIT_INVALID", "EVERY_METHOD_MAPPED", `method ${m} of the design has no construction decision in the mapping pass`); }
  const gap = audit.passes.find((p) => p.domain === "emergent_gap_finder"); if (gap && !(gap.reopens || []).length && String(gap.no_reopen_reason ?? "").trim().length < 40) no("PREGEN_AUDIT_INVALID", "GAP_FINDER_REOPENS_OR_JUSTIFIES", "the emergent gap finder must reopen at least one earlier domain or justify, specifically, why none needs reopening");
  for (const r of gap?.reopens || []) if (!DOMAINS.includes(r) || r === "emergent_gap_finder") no("PREGEN_AUDIT_INVALID", "REOPEN_KNOWN_DOMAIN", `reopened domain ${r} is not one of the first nine`);
  return { ok: !F.length, failures: F, sha256: bundleHash(audit) };
}
/** loadAndValidate(film, design) — the gate entry point. Diagnostic namespaces may omit the audit (reported, never silent); production may not. */
export function pregenAuditStatus({ film, design, isMaster, audit: given = undefined }) {
  if (!isMaster) return { status: "NOT_APPLICABLE_DERIVED_STATE", failures: [] };
  const F = film ? path.resolve(film) : null, f = F ? auditFile(F, design.job_id) : null, diag = !!F && fs.existsSync(path.join(F, ".diagnostic_namespace"));
  if (given !== undefined) { const v = validatePregenAudit({ audit: given, design, film: F }); return { status: v.ok ? "AUDIT_RECORDED" : given ? "AUDIT_INVALID" : "AUDIT_MISSING", failures: v.failures, sha256: v.sha256, file: null, supplied_in_memory: true }; }
  const present = !!f && fs.existsSync(f);
  if (!present && diag) return { status: "NOT_REQUIRED_DIAGNOSTIC_NAMESPACE", failures: [] };
  const audit = present ? JSON.parse(fs.readFileSync(f, "utf8")) : null, v = validatePregenAudit({ audit, design, film: F });
  return { status: v.ok ? "AUDIT_RECORDED" : present ? "AUDIT_INVALID" : "AUDIT_MISSING", failures: v.failures, sha256: v.sha256, file: f };
}
