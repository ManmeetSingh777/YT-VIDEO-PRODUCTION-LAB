// P08 / S3C-7 correction: the IDENTITY of an immutable evaluation record (outbox job generation) must bind the canonical inputs AND the exact
// checking rules that produced its verdict. Before this, the generation digest covered inputs only; when P07 added the pre-generation audit
// rule, identical inputs produced a different verdict under the same id and the write-once store (correctly) refused. Now:
//   - code identity   = sha256 over the gate's transitive engine import closure (every module whose code can change a verdict), computed
//                       automatically, so changed checking code ⇒ a new evaluation identity (history kept byte-for-byte beside it);
//   - schema identity = sha256 over every schema file (the checked shapes);
//   - policy identity = the policy switches that legitimately change a verdict for the same inputs (diagnostic namespace ⇒ audit optional);
//   - ruleset version = an EXPLICIT, human-bumped version of the rule-defining modules (EVALUATION_RULESET.lock.json). Human design approvals
//                       bind this version (not the raw code hash), so a deliberate rule change requires re-approval, while an edit that does not
//                       touch the rule-defining files does not. The lock test refuses a rule-source change that was not versioned.
// Same inputs + same identity ⇒ the same record bytes (idempotent). A different verdict under an identical identity is NONDETERMINISM and is
// refused (EVALUATION_NONDETERMINISM) — it is never hidden by minting a new id.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const rel = (f) => path.relative(REPO, f).split(path.sep).join("/");
export const LOCK_FILE = path.join(here, "EVALUATION_RULESET.lock.json");
/** the gate entry points whose verdict is recorded in an outbox generation */
export const GATE_ROOTS = Object.freeze(["engine/art_bridge/art_contract.mjs", "engine/art_bridge/art_requests.mjs", "engine/tools/art_outbox.mjs"]);
/** the modules that DEFINE checking rules (a change here is a rule change and must bump the ruleset version) */
export const RULE_SOURCES = Object.freeze(["engine/art_bridge/art_contract.mjs", "engine/art_bridge/pregen_audit.mjs", "engine/art_bridge/method_applicability.mjs", "engine/art_bridge/art_families.mjs", "engine/art_bridge/witness_regions.mjs", "schemas/pregen_audit_v1.schema.json", "engine/methods/source/F_SOURCE.json"]);
const IMPORT_RE = /(?:import|export)\s[^;]*?from\s*["'](\.{1,2}\/[^"']+)["']|import\(\s*["'](\.{1,2}\/[^"']+)["']\s*\)/g;
const memo = new Map();
/** importClosure(roots) → sorted [[repo-relative file, sha256]] over every relative import reachable from the roots (static strings only) */
export function importClosure(roots = GATE_ROOTS) {
  const key = roots.join("|"); if (memo.has(key)) return memo.get(key);
  const seen = new Map(), stack = roots.map((r) => path.join(REPO, r));
  while (stack.length) { const f = stack.pop(); if (seen.has(f) || !fs.existsSync(f)) continue; const src = fs.readFileSync(f); seen.set(f, sha(src));
    if (!/\.m?js$/.test(f)) continue; for (const m of src.toString("utf8").matchAll(IMPORT_RE)) stack.push(path.resolve(path.dirname(f), m[1] || m[2])); }
  const out = [...seen].map(([f, h]) => [rel(f), h]).sort((a, b) => (a[0] < b[0] ? -1 : 1)); memo.set(key, out); return out;
}
export const schemaSet = () => fs.readdirSync(path.join(REPO, "schemas")).filter((f) => f.endsWith(".json")).sort().map((f) => [`schemas/${f}`, sha(fs.readFileSync(path.join(REPO, "schemas", f)))]);
export const ruleSourceSha = () => sha(JSON.stringify(RULE_SOURCES.map((f) => [f, fs.existsSync(path.join(REPO, f)) ? sha(fs.readFileSync(path.join(REPO, f))) : null])));
export function readLock() { return JSON.parse(fs.readFileSync(LOCK_FILE, "utf8")); }
/** rulesetVersion() — the explicit version; throws RULESET_LOCK_STALE when the rule-defining sources differ from the locked version */
export function rulesetVersion(lock = readLock()) {
  const cur = ruleSourceSha(), v = lock.versions.find((x) => x.rule_source_sha256 === cur);
  if (!v || v.version !== lock.current) throw err("RULESET_LOCK_STALE", { file: rel(LOCK_FILE), reason: `the rule-defining sources (${RULE_SOURCES.join(", ")}) changed without a ruleset version bump: run node engine/tools/evaluation_ruleset.mjs bump --version <v> --reason <why>`, producer: "engine/art_bridge/evaluation_identity.mjs#rulesetVersion", failed_invariant: "a checking-rule change is a versioned, reviewable decision", resume_at: "RULESET_BUMP" });
  return v.version;
}
/** evaluationIdentity({film}) → {ruleset_version, code_sha256, schema_sha256, policy, sha256}. No timestamps, paths or host data enter it. */
export function evaluationIdentity({ film = null } = {}) {
  const diag = !!film && fs.existsSync(path.join(path.resolve(film), ".diagnostic_namespace"));
  const policy = { diagnostic_namespace: diag, pregen_audit_required_for_masters: !diag };
  const id = { ruleset_version: rulesetVersion(), code_sha256: sha(JSON.stringify(importClosure())), schema_sha256: sha(JSON.stringify(schemaSet())), policy };
  return { ...id, sha256: sha(JSON.stringify(id)) };
}
/** canonicalize(v) — sorted keys, incidental timestamp keys dropped (identity calculation only; the stored record keeps its own content) */
const TIME_KEY = /(^|_)(utc|created|timestamp|at_utc|written_at|time)$/i;
export function canonicalize(v) { if (Array.isArray(v)) return v.map(canonicalize); if (v && typeof v === "object") return Object.fromEntries(Object.keys(v).filter((k) => !TIME_KEY.test(k)).sort().map((k) => [k, canonicalize(v[k])])); return v; }
/** writeEvaluationOnce(file, text, writeOnce) — idempotent for identical bytes; a different body under the same identity is NONDETERMINISM */
export function writeEvaluationOnce(file, text, writeOnce) {
  if (fs.existsSync(file)) { const old = fs.readFileSync(file, "utf8"); if (old === text) return false;
    let a = null, b = null; try { a = JSON.parse(old); b = JSON.parse(text); } catch {}
    const keys = a && b ? [...new Set([...Object.keys(a), ...Object.keys(b)])].filter((k) => JSON.stringify(a[k]) !== JSON.stringify(b[k])) : ["<unparseable>"];
    throw err("EVALUATION_NONDETERMINISM", { file, reason: `an evaluation with an identical input+rule identity produced a different record (differing: ${keys.join(", ")}); the existing record is kept, nothing is overwritten and no new id is minted — investigate the nondeterministic producer`, producer: "engine/art_bridge/evaluation_identity.mjs#writeEvaluationOnce", failed_invariant: "identical inputs and rules ⇒ identical verdict", details: { differing_keys: keys }, resume_at: "INVESTIGATE_NONDETERMINISM" }); }
  return writeOnce(file, text);
}
