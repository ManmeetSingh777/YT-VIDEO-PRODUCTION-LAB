#!/usr/bin/env python3
"""Builds audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip (P02 directive §16) — self-reproducing:
  * the complete engine, schemas, tests (art_bridge + p02), skill tree (incl. F-source witness images), the production film's contracts and the
    P02 evidence (rehearsal transcripts, ledgers, matrices, TAP logs);
  * an IMPORT-CLOSURE CHECK: every relative import of every included .mjs/.js must resolve to an included file — a missing source file REJECTS
    the export (it never silently reduces the test count);
  * a redacted environment contract (no credentials, no keys, no private configuration);
  * AUDIT/INTEGRITY_MANIFEST.json over every member. The zip is made read-only after writing.
Usage: python -I engine/tools/build_p02_audit.py"""
import hashlib, json, os, re, stat, subprocess, sys, zipfile, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "audit_outbox", "HYBRID_V2_P02_REPAIR_AUDIT.zip"); BASE = "b511e93"; EV = "hybrid_v2/evidence/p02"; P = "HYBRID_V2_P02_REPAIR_AUDIT/"
def git(*a): return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
DIRS = ["engine", "schemas", "tests/art_bridge", "tests/p02", "reference/construct-kurzgesagt-art", EV, "hybrid_v2/evidence/system_correction", "hybrid_v2/audit_docs",
        "films/hv2_film001", "films/_qual_A", "hybrid_v2/art_outbox",
        "hybrid_v2/work/p02/rehearsal/evidence", "hybrid_v2/work/p02/rehearsal_H/evidence", "hybrid_v2/work/p02/rehearsal_I/evidence", "hybrid_v2/work/p02/rehearsal_J/evidence", "hybrid_v2/work/p02/rehearsal_K/evidence", "hybrid_v2/work/p02/rehearsal_K/rt", "hybrid_v2/work/audit_logs"]
FILES = ["CLAUDE.md", "HANDOFF.md", "inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md", "inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md", "inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md", "inputs/EXPERIENCE_DIRECTOR_V1.md",
         "films/hv2_film001/.gitignore", "hybrid_v2/work/p02/SOURCE_PACKAGE_RECONCILIATION.json", "hybrid_v2/work/p02/injection/INJECTION_SUMMARY.json", "hybrid_v2/work/p02/injection/MOVED_TO_C.txt", "hybrid_v2/work/p02/injection/INJECTION_OFFLOAD_MANIFEST.json", "hybrid_v2/work/p02/trace_PREVIOUS_RUN_MOVED_TO_C.txt", "hybrid_v2/work/p02/control/RULE_PROBE.json", "hybrid_v2/work/p02/render/MEMORY_LOG.json",
         "hybrid_v2/work/p02/provider/race_result.json", "hybrid_v2/work/p02/trace/TRACE_450.json", "hybrid_v2/work/p02/trace/TRACE_3900.json", "hybrid_v2/work/audit_logs/p02_tap.txt", "hybrid_v2/art_outbox/OUTBOX_INDEX.json", "hybrid_v2/art_outbox/CURRENT.json"]
SKIP = ("/render/chunks/", "/render/compositions/", "__pycache__", "/_tmp/", ".mp4", ".mkv", "/node_modules/", ".tmp-", "/_film_view/")
SECRET = re.compile(r"(sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)")
files = []
for d in DIRS:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in fs:
            r = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
            if not any(s in "/" + r for s in SKIP): files.append(r)
files = sorted(set(files + [f for f in FILES if os.path.exists(os.path.join(ROOT, f))]))
# 1. import closure: every relative import resolves inside the archive
inc, missing = set(files), []
IMP = re.compile(r"""(?:import\s+(?:[^'"]*?\sfrom\s+)?|import\(\s*|export\s+[^'"]*?\sfrom\s+)['"](\.{1,2}/[^'"]+)['"]""")
for r in files:
    if not r.endswith((".mjs", ".js")): continue
    src = open(os.path.join(ROOT, r), encoding="utf-8", errors="replace").read()
    for m in IMP.finditer(src):
        t = os.path.normpath(os.path.join(os.path.dirname(r), m.group(1))).replace(os.sep, "/")
        if t not in inc and not os.path.isdir(os.path.join(ROOT, t)): missing.append(f"{r} -> {m.group(1)}")
if missing: sys.exit("EXPORT REJECTED: missing source files in the audit closure:\n  " + "\n  ".join(sorted(set(missing))))
# 2. no credentials
leaks = [r for r in files if r.endswith((".mjs", ".js", ".json", ".md", ".txt", ".py", ".jsonl")) and SECRET.search(open(os.path.join(ROOT, r), encoding="utf-8", errors="replace").read())]
if leaks: sys.exit("EXPORT REJECTED: credential-like material in: " + ", ".join(leaks))
head = git("rev-parse", "HEAD").strip(); audit = {}
DOCS = {"README.md": f"{EV}/README.md", "FINAL_REPORT.md": f"{EV}/FINAL_REPORT.md", "BASELINE_AND_SOURCE_RECONCILIATION.md": f"{EV}/BASELINE_AND_SOURCE_RECONCILIATION.md", "THREAT_MODEL.md": f"{EV}/THREAT_MODEL.md",
        "FAILURE_LEDGER_P02.json": f"{EV}/FAILURE_LEDGER_P02.json", "TEST_RESULTS.md": f"{EV}/TEST_RESULTS.md", "REHEARSAL_REPORT.md": f"{EV}/REHEARSAL_REPORT.md", "PRODUCTION_PREFLIGHT_hv2_film001.json": f"{EV}/PRODUCTION_PREFLIGHT_hv2_film001.json",
        "REVISION_DEPENDENCIES.json": f"{EV}/REVISION_DEPENDENCIES.json", "OPEN_ITEMS.md": f"{EV}/OPEN_ITEMS.md", "DEPENDENCY_CONTRACT.md": f"{EV}/DEPENDENCY_CONTRACT.md", "REPLAY.md": f"{EV}/REPLAY.md", "NEUTRINO_ORIGINAL_VS_CURRENT_EXECUTION_MAP.md": f"{EV}/NEUTRINO_ORIGINAL_VS_CURRENT_EXECUTION_MAP.md", "PRODUCTION_REACHABILITY.json": f"{EV}/PRODUCTION_REACHABILITY.json", "CANARY_PLAN.md": f"{EV}/CANARY_PLAN.md", "CANARY_PLAN_S02_1320_1920.json": f"{EV}/CANARY_PLAN_S02_1320_1920.json"}
for k, src in DOCS.items():
    p = os.path.join(ROOT, src); audit["AUDIT/" + k] = open(p, "rb").read() if os.path.exists(p) else f"MISSING: {src} (this proof is FAILED, not omitted)\n".encode()
audit["AUDIT/FILE_CHANGE_MAP.txt"] = (git("diff", "--stat", BASE, "--", "engine", "schemas", "tests") + "\nuntracked (new) files:\n" + git("ls-files", "--others", "--exclude-standard", "engine", "schemas", "tests")).encode()
audit["AUDIT/DIFF.patch"] = git("diff", BASE, "--", "engine", "schemas", "tests", "CLAUDE.md", "HANDOFF.md").encode()
audit["AUDIT/REVISION.txt"] = f"HEAD {head}\nbaseline {BASE}\nbranch {git('rev-parse', '--abbrev-ref', 'HEAD').strip()}\nworking tree vs HEAD: see DIFF.patch\nnu.js sha256 {sha(os.path.join(ROOT, 'engine/runtime/nu.js'))}\nexported {datetime.datetime.now(datetime.timezone.utc).isoformat()}\n".encode()
env = {"node": subprocess.run(["node", "--version"], capture_output=True, text=True).stdout.strip(), "ffmpeg": (subprocess.run(["ffmpeg", "-version"], capture_output=True, text=True).stdout.splitlines() or [""])[0], "python": sys.version.split()[0],
       "env_contract": {k: ("SET (value redacted)" if os.environ.get(k) else "unset") for k in ["IMAGE_PROVIDER", "IMAGE_PROVIDER_MODEL", "OPENAI_API_KEY", "OPENAI_BASE_URL", "IMAGE_PROVIDER_CAPS", "ART_BRIDGE_REVIEWER_KEYS_FILE", "ART_BRIDGE_BUDGET_AUTHORIZATION", "ART_BRIDGE_TEST_TRUST"]}}
audit["AUDIT/ENVIRONMENT_REDACTED.json"] = json.dumps(env, indent=1).encode()
integ = {"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "revision": head, "import_closure": "complete (export would be rejected otherwise)", "files": {}}
for r in files: integ["files"][r] = {"sha256": sha(os.path.join(ROOT, r)), "bytes": os.path.getsize(os.path.join(ROOT, r))}
for k, v in audit.items(): integ["files"][k] = {"sha256": hashlib.sha256(v).hexdigest(), "bytes": len(v)}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.chmod(OUT, stat.S_IWRITE | stat.S_IREAD); os.remove(OUT)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r in files: z.write(os.path.join(ROOT, r), P + r)
    for k, v in audit.items(): z.writestr(P + k, v)
    z.writestr(P + "AUDIT/INTEGRITY_MANIFEST.json", json.dumps(integ, indent=1))
os.chmod(OUT, stat.S_IREAD)
print(f"{OUT}\nmembers {len(integ['files']) + 1}  bytes {os.path.getsize(OUT)}  sha256 {sha(OUT)}")
