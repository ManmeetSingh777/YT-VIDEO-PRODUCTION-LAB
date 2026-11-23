#!/usr/bin/env python3
"""Builds audit_outbox/HYBRID_V2_IMPLEMENTATION_AUDIT.zip: full source + dependencies, git revision and diff, schemas/manifests/fixtures,
raw test/proof logs, Chrome-rendered frames + 60fps witness, numeric measurements, Stage 1-4 evidence, F01-F80 status, registration and
ArtJob implementation, provider/blocker report, known gaps, reproduction steps and an integrity manifest (sha256 of every file)."""
import hashlib, json, os, subprocess, sys, zipfile, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "audit_outbox", os.environ.get("AUDIT_NAME", "HYBRID_V2_P01_CORRECTION_AUDIT") + ".zip")
BASE = "a8f5b8a"
def git(*a): return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
INCLUDE_DIRS = ["engine/art_bridge", "engine/runtime", "engine/methods/source", "schemas", "tests/art_bridge", "hybrid_v2/evidence", "hybrid_v2/art_outbox",
  "hybrid_v2/work/stage2", "hybrid_v2/work/qa_fixture_sceneA", "hybrid_v2/work/qa_fixture_sceneA_production", "hybrid_v2/work/stage3", "hybrid_v2/work/audit_logs", "hybrid_v2/work/p0/roundtrip_evidence", "hybrid_v2/work/p0/rt_invalid_landmark", "hybrid_v2/work/p0/rt_invalid_pixel", "hybrid_v2/work/p0/roundtrip_render", "hybrid_v2/work/p01/evidence", "hybrid_v2/work/p01/bend", "hybrid_v2/work/p01/footprint", "hybrid_v2/work/p01/pixels", "hybrid_v2/work/p01/transition", "hybrid_v2/work/p01/ines_contract", "hybrid_v2/work/stage3_contract", "hybrid_v2/audit_docs", "films/hv2_film001", "reference/construct-kurzgesagt-art"]
INCLUDE_FILES = ["engine/tools/art_bridge_check.mjs", "engine/tools/art_bridge_qa.mjs", "engine/tools/art_outbox.mjs", "engine/tools/build_hybrid_v2_audit.py",
  "inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md", "inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md", "inputs/EXPERIENCE_DIRECTOR_V1.md",
  "films/_qual_A/production/words.json", "inputs/INDEPENDENT_HYBRID_V2_AUDIT.md", "inputs/HYBRID_V2_P0_INDEPENDENT_REAUDIT.md", "engine/tools/art_bridge_film_qa.mjs", "films/_qual_A/direction/EPISODE.json", "CLAUDE.md", "HANDOFF.md", ".gitignore"]
SKIP = ("/_tmp/", "__pycache__", "/composition/rt/")
files = []
for d in INCLUDE_DIRS:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in fs:
            p = os.path.join(dp, f); r = os.path.relpath(p, ROOT).replace(os.sep, "/")
            if any(s in "/" + r for s in SKIP): continue
            files.append(r)
files += [f for f in INCLUDE_FILES if os.path.exists(os.path.join(ROOT, f))]
files = sorted(set(files))
head = git("rev-parse", "HEAD").strip(); status = git("status", "--porcelain", "--", "engine", "schemas", "tests", "films/hv2_film001", "hybrid_v2/evidence", "hybrid_v2/art_outbox")
meta = {
  "AUDIT/REVISION.txt": f"HEAD {head}\nbaseline {BASE} ({git('log','-1','--format=%s',BASE).strip()})\nbranch {git('rev-parse','--abbrev-ref','HEAD').strip()}\nworking tree changes in audited paths at packaging time:\n{status or '(none)'}\n\nHybrid V2 commits since baseline:\n{git('log','--oneline',BASE+'..HEAD')}",
  "AUDIT/SOURCE_DIFF_STAT.txt": git("diff", "--stat", BASE, "HEAD", "--", "engine", "schemas", "tests", "films/hv2_film001", "hybrid_v2", "CLAUDE.md", "HANDOFF.md", ".gitignore"),
  "AUDIT/SOURCE_DIFF.patch": git("diff", BASE, "HEAD", "--", "engine", "schemas", "tests/art_bridge/*.mjs", "films/hv2_film001/handoff/build_production_graph.mjs", "films/hv2_film001/art_designs/build_designs.mjs", "CLAUDE.md", "HANDOFF.md", ".gitignore"),
  "AUDIT/DIFF_SINCE_AUDITED_392b0a9.patch": git("diff", "392b0a9", "HEAD", "--", "engine", "schemas", "tests/art_bridge/*.mjs", "films/hv2_film001/handoff/build_production_graph.mjs", "films/hv2_film001/art_designs/build_designs.mjs", "CLAUDE.md", "HANDOFF.md"),
  "AUDIT/DIFF_SINCE_AUDITED_392b0a9_STAT.txt": git("diff", "--stat", "392b0a9", "HEAD", "--", "engine", "schemas", "tests", "films/hv2_film001", "hybrid_v2", "CLAUDE.md", "HANDOFF.md", "inputs"),
  "AUDIT/DIFF_SINCE_REAUDITED_c0eed40.patch": git("diff", "c0eed40", "HEAD", "--", "engine", "schemas", "tests/art_bridge/*.mjs", "films/hv2_film001/handoff/build_production_graph.mjs", "films/hv2_film001/art_designs/build_designs.mjs", "films/hv2_film001/art_designs/ines_design.mjs", "CLAUDE.md", "HANDOFF.md"),
  "AUDIT/DIFF_SINCE_REAUDITED_c0eed40_STAT.txt": git("diff", "--stat", "c0eed40", "HEAD", "--", "engine", "schemas", "tests", "films/hv2_film001", "hybrid_v2", "CLAUDE.md", "HANDOFF.md", "inputs"),
  "AUDIT/RUNTIME_PRESERVATION.txt": "engine/runtime/nu.js sha256 %s (baseline prefix 773baf915657a2d9)\ngit diff %s HEAD -- engine/runtime: %s\n" % (sha(os.path.join(ROOT, "engine/runtime/nu.js")), BASE, "NO CHANGES" if not git("diff", "--stat", BASE, "HEAD", "--", "engine/runtime").strip() else git("diff", "--stat", BASE, "HEAD", "--", "engine/runtime")),
}
for k in ["README.md", "REPRODUCE.md", "KNOWN_GAPS_AND_BLOCKERS.md", "DEPENDENCIES.md"]:
    meta["AUDIT/" + k] = open(os.path.join(ROOT, "hybrid_v2", "audit_docs", k), encoding="utf-8").read()
integrity = {"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "revision": head, "files": {}}
for r in files: integrity["files"][r] = {"sha256": sha(os.path.join(ROOT, r)), "bytes": os.path.getsize(os.path.join(ROOT, r))}
for k, v in meta.items(): integrity["files"][k] = {"sha256": hashlib.sha256(v.encode("utf-8")).hexdigest(), "bytes": len(v.encode("utf-8"))}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r in files: z.write(os.path.join(ROOT, r), "HYBRID_V2_IMPLEMENTATION_AUDIT/" + r)
    for k, v in meta.items(): z.writestr("HYBRID_V2_IMPLEMENTATION_AUDIT/" + k, v)
    z.writestr("HYBRID_V2_IMPLEMENTATION_AUDIT/AUDIT/INTEGRITY_MANIFEST.json", json.dumps(integrity, indent=1))
print(f"{OUT}\nfiles {len(files) + len(meta) + 1}  bytes {os.path.getsize(OUT)}  sha256 {sha(OUT)}")
