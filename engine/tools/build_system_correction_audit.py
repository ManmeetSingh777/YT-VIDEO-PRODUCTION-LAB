#!/usr/bin/env python3
"""Builds audit_outbox/HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip in the directive O1 layout (AUDIT/* + engine/ schemas/ tests/ hybrid_v2/ films/).
No credentials, no private configuration, no large unrelated histories; integrity manifest over every included file."""
import hashlib, json, os, subprocess, zipfile, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "audit_outbox", "HYBRID_V2_SYSTEM_CORRECTION_AUDIT.zip"); BASE = "9a2a9ad"; EV = "hybrid_v2/evidence/system_correction"
def git(*a): return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
DIRS = ["engine/art_bridge", "engine/story", "engine/film", "engine/runtime", "engine/methods/source", "schemas", "tests/art_bridge", "hybrid_v2/evidence", "hybrid_v2/audit_docs", "hybrid_v2/work/audit_logs", "films/hv2_film001"]
FILES = ["engine/tools/art_outbox.mjs", "engine/tools/art_bridge_check.mjs", "engine/tools/art_bridge_qa.mjs", "engine/tools/art_bridge_film_qa.mjs", "engine/tools/build_failure_ledger.mjs", "engine/tools/audit_trace.mjs", "engine/tools/build_system_correction_audit.py",
  "hybrid_v2/art_outbox/OUTBOX_INDEX.json", "hybrid_v2/art_outbox/CURRENT.json", "inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md", "inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md", "inputs/EXPERIENCE_DIRECTOR_V1.md", "CLAUDE.md", "HANDOFF.md", ".gitignore"]
SKIP = ("/render/chunks/", "__pycache__", "/_tmp/", ".mp4")
files = []
for d in DIRS:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in fs:
            r = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
            if not any(s in "/" + r for s in SKIP): files.append(r)
files = sorted(set(files + [f for f in FILES if os.path.exists(os.path.join(ROOT, f))]))
# the skill scripts that compile requests (the full skill is in the prior audit ZIPs and byte-identical to inputs/construct-kurzgesagt-art.zip)
for dp, _, fs in os.walk(os.path.join(ROOT, "reference/construct-kurzgesagt-art/scripts")):
    files += [os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/") for f in fs if f.endswith(".py")]
head = git("rev-parse", "HEAD").strip(); audit = {}
for k, src in [("README.md", "hybrid_v2/audit_docs/SYSTEM_CORRECTION_README.md"), ("BASELINE_AND_PRESERVATION.md", f"{EV}/BASELINE_NEXT.md"), ("FILE_CHANGE_MAP.md", f"{EV}/FILE_CHANGE_MAP.md"), ("FAILURE_LEDGER.json", f"{EV}/FAILURE_LEDGER.json"),
  ("ROOT_CAUSE_REPAIR_MATRIX.md", f"{EV}/ROOT_CAUSE_REPAIR_MATRIX.md"), ("CONTRACT_GATE_MATRIX.json", f"{EV}/CONTRACT_GATE_MATRIX.json"), ("SOURCE_TO_ART_F01_F80.json", f"{EV}/SOURCE_TO_ART_F01_F80.json"), ("SEMANTIC_ACTION_COVERAGE.json", f"{EV}/SEMANTIC_ACTION_COVERAGE.json"),
  ("CAUSAL_MECHANISM_PROOFS.json", f"{EV}/CAUSAL_MECHANISM_PROOFS.json"), ("REAL_ART_AND_HUMAN_STATUS.json", f"{EV}/REAL_ART_AND_HUMAN_STATUS.json"), ("TEST_COMMANDS_AND_RESULTS.md", f"{EV}/TEST_COMMANDS_AND_RESULTS.md"), ("NEGATIVE_PROOF_MATRIX.json", f"{EV}/NEGATIVE_PROOF_MATRIX.json"),
  ("UNLIKE_TRANSFER_MATRIX.json", f"{EV}/UNLIKE_TRANSFER_MATRIX.json"), ("OPEN_DEPENDENCIES.md", f"{EV}/OPEN_DEPENDENCIES.md"), ("INDEPENDENT_TRACE.json", f"{EV}/INDEPENDENT_TRACE.json")]:
    p = os.path.join(ROOT, src); audit["AUDIT/" + k] = open(p, "rb").read() if os.path.exists(p) else f"MISSING: {src} (this proof is FAILED, not omitted)\n".encode()
audit["AUDIT/DIFF.patch"] = git("diff", BASE, "HEAD", "--", "engine", "schemas", "tests", "films/hv2_film001/handoff/build_production_graph.mjs", "films/hv2_film001/art_designs/ines_design.mjs", "CLAUDE.md", "HANDOFF.md").encode()
audit["AUDIT/REVISION.txt"] = f"HEAD {head}\nbaseline {BASE}\nbranch {git('rev-parse','--abbrev-ref','HEAD').strip()}\ncommits since baseline:\n{git('log','--oneline',BASE+'..HEAD')}\nnu.js sha256 {sha(os.path.join(ROOT,'engine/runtime/nu.js'))}\nruntime diff since baseline: {'NONE' if not git('diff','--stat',BASE,'HEAD','--','engine/runtime').strip() else 'CHANGED'}\n".encode()
render_ev = []
for dp, _, fs in os.walk(os.path.join(ROOT, "hybrid_v2/evidence/stage2/frames")):
    render_ev += [os.path.join(dp, f) for f in fs]
integ = {"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "revision": head, "files": {}}
P = "HYBRID_V2_SYSTEM_CORRECTION_AUDIT/"
for r in files: integ["files"][r] = {"sha256": sha(os.path.join(ROOT, r)), "bytes": os.path.getsize(os.path.join(ROOT, r))}
for k, v in audit.items(): integ["files"][k] = {"sha256": hashlib.sha256(v).hexdigest(), "bytes": len(v)}
for f in render_ev: k = "AUDIT/RENDER_EVIDENCE/" + os.path.relpath(f, os.path.join(ROOT, "hybrid_v2/evidence/stage2/frames")).replace(os.sep, "/"); integ["files"][k] = {"sha256": sha(f), "bytes": os.path.getsize(f)}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.chmod(OUT, 0o666); os.remove(OUT)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r in files: z.write(os.path.join(ROOT, r), P + r)
    for k, v in audit.items(): z.writestr(P + k, v)
    for f in render_ev: z.write(f, P + "AUDIT/RENDER_EVIDENCE/" + os.path.relpath(f, os.path.join(ROOT, "hybrid_v2/evidence/stage2/frames")).replace(os.sep, "/"))
    z.writestr(P + "AUDIT/INTEGRITY_MANIFEST.json", json.dumps(integ, indent=1))
print(f"{OUT}\nfiles {len(integ['files']) + 1}  bytes {os.path.getsize(OUT)}  sha256 {sha(OUT)}")
