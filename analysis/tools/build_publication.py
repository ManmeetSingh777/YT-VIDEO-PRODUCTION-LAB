#!/usr/bin/env python3
"""Stages the public source snapshot of E:\\MOTION_NATIVE_STUDIO_V1 into this repository (read-only on the studio).
Rules are explicit; every candidate that is NOT published is recorded with path, sha256, size and reason. Before copying, all candidates
are scanned for secrets, personal data and size limits; a hit on a secret ABORTS the staging (nothing is copied).
Usage: python -I analysis/tools/build_publication.py <STUDIO_ROOT> <REPO_ROOT>"""
import hashlib, json, os, re, shutil, sys, fnmatch
STUDIO, REPO = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
# 1. candidate roots (everything else in the studio is listed as excluded-by-scope with its size)
ROOTS = ["CLAUDE.md", "HANDOFF.md", "MOTION_NATIVE_STUDIO_V1_AUDIT_DRIVEN_BUILD_INSTRUCTIONS.md", "MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md", ".gitignore",
         "engine", "schemas", "tests", "learning", "style", "films", "inputs", "reference", "hybrid_v2/art_outbox", "hybrid_v2/audit_docs", "hybrid_v2/evidence",
         "hybrid_v2/work/audit_logs", "hybrid_v2/work/p02/rehearsal/evidence", "hybrid_v2/work/p02/rehearsal_H/evidence", "hybrid_v2/work/p02/rehearsal_I/evidence",
         "hybrid_v2/work/p02/rehearsal_J/evidence", "hybrid_v2/work/p02/rehearsal_K/evidence", "hybrid_v2/work/p02/rehearsal_K/rt", "hybrid_v2/work/p02/SOURCE_PACKAGE_RECONCILIATION.json",
         "hybrid_v2/work/p02/injection/INJECTION_SUMMARY.json", "hybrid_v2/work/p02/injection/MOVED_TO_C.txt", "hybrid_v2/work/p02/injection/INJECTION_OFFLOAD_MANIFEST.json"]
# 2. exclusion rules: (glob on the studio-relative path, reason)
RULES = [
 ("reference/construct-kurzgesagt-art/assets/*.jpg", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("reference/construct-kurzgesagt-art/assets/*.jpeg", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("reference/construct-kurzgesagt-art/assets/*.png", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("reference/construct-kurzgesagt-art/assets/*.webp", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("reference/construct-kurzgesagt-art/assets/*.JPG", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("reference/construct-kurzgesagt-art/assets/*.PNG", "THIRD_PARTY_COPYRIGHT: still frames/crops from third-party films used as STYLE witnesses (not ours to republish)"),
 ("*/SOURCE_REFERENCE_CONTACT_SHEET.png", "THIRD_PARTY_COPYRIGHT: contact sheet composed of the third-party witness stills"),
 ("hybrid_v2/art_outbox/contact_sheets/*", "THIRD_PARTY_COPYRIGHT: contact sheet composed of the third-party witness stills"),
 ("*/witnesses/*", "THIRD_PARTY_COPYRIGHT: copies of the third-party witness stills inside handoff bundles"),
 ("inputs/*.zip", "DUPLICATE_AND_THIRD_PARTY: archive copies of the skill (contain the copyrighted witness stills); the extracted skill text/scripts are published"),
 ("inputs/Exhaustive Frame Analysis.json", "THIRD_PARTY_DERIVED: frame-by-frame description of a third-party film; not referenced by any code"),
 ("reference/neutrino_2m_SOURCE_PACKAGE/evidence/session_*.jsonl", "PERSONAL_RECORD: full assistant session transcript"),
 ("reference/neutrino_2m_SOURCE_PACKAGE/evidence/ALL_USER_MESSAGES.md", "PERSONAL_RECORD: verbatim user conversation messages"),
 ("reference/neutrino_2m_SOURCE_PACKAGE/evidence/*.bundle", "SIZE_AND_HISTORY: 105 MB git bundle (> GitHub 100 MB limit; private history)"),
 ("reference/neutrino_2m_SOURCE_PACKAGE/reference_outputs/*", "GENERATED_FILM: rendered reference videos (161 MB final.mp4, proof, animatic)"),
 ("*/snapshot_sheets/*", "GENERATED_RENDER: contact sheets of rendered frames"),
 ("*/hero/*.png", "GENERATED_RENDER: hero frame renders"), ("*/proof/*.png", "GENERATED_RENDER: QA proof renders"), ("*/proof/*.jpg", "GENERATED_RENDER: QA proof renders"), ("*/qa/*.png", "GENERATED_RENDER: QA frame renders"),
 ("*.mp4", "GENERATED_VIDEO"), ("*.mkv", "GENERATED_VIDEO_SEGMENT"), ("*.webm", "GENERATED_VIDEO"), ("*.zip", "ARCHIVE"), ("*.bundle", "GIT_BUNDLE"),
 ("*/render/chunks/*.mkv", "GENERATED_VIDEO_SEGMENT"), ("*/render/compositions/*", "GENERATED_CACHE: baked composition pages (reproducible)"),
 ("*/node_modules/*", "DEPENDENCY_INSTALL"), ("*/__pycache__/*", "CACHE"), ("*/.hyperframes/*", "TOOL_STATE: HyperFrames local render state"),
 ("*/_film_view/*", "DUPLICATE: verification view of recovered ledgers"), ("*.tmp-*", "PARTIAL_WRITE"), ("*/.claude/*", "LOCAL_SETTINGS"),
]
MAX_BYTES, WAV_MAX = 25 * 1024 * 1024, 5 * 1024 * 1024
SECRET = [("openai_key", re.compile(rb"sk-(?:proj-)?[A-Za-z0-9_-]{20,}")), ("github_token", re.compile(rb"gh[pousr]_[A-Za-z0-9]{30,}")), ("aws_key", re.compile(rb"AKIA[0-9A-Z]{16}")),
          ("private_key", re.compile(rb"-----BEGIN (?:RSA |EC |OPENSSH |DSA |)PRIVATE KEY-----")), ("bearer", re.compile(rb"[Bb]earer [A-Za-z0-9._-]{25,}")),
          ("assigned_secret", re.compile(rb"(?i)(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*['\"][^'\"\s]{12,}['\"]")), ("conn_string", re.compile(rb"(?i)(mongodb|postgres|mysql|redis)://[^\s'\"]+:[^\s'\"]+@"))]
PII = [("email", re.compile(rb"[A-Za-z0-9._%+-]+@(?:gmail|outlook|hotmail|yahoo|icloud|proton)\.[a-z]{2,}")), ("local_user_path", re.compile(rb"(?i)C:[\\/]+Users[\\/]+[A-Za-z0-9._-]+"))]
TEXT = (".mjs", ".js", ".json", ".md", ".txt", ".py", ".jsonl", ".html", ".css", ".csv", ".yml", ".yaml", ".sh", ".ps1", ".svg", ".patch", ".diff", "")
cands = []
for r in ROOTS:
    p = os.path.join(STUDIO, r)
    if os.path.isfile(p): cands.append(r)
    elif os.path.isdir(p):
        for d, dirs, fs in os.walk(p):
            dirs[:] = [x for x in dirs if x not in (".git",)]
            for f in fs: cands.append(os.path.relpath(os.path.join(d, f), STUDIO).replace(os.sep, "/"))
cands = sorted(set(cands)); keep, excl = [], []
for r in cands:
    full = os.path.join(STUDIO, r); size = os.path.getsize(full); why = next((reason for g, reason in RULES if fnmatch.fnmatch(r, g) or fnmatch.fnmatch("/" + r, "*/" + g.lstrip("*/")) or fnmatch.fnmatch("/" + r, g)), None)
    if not why and r.endswith(".wav") and size > WAV_MAX: why = "LARGE_MEDIA: audio stem > 5 MB (regenerable from the package's tools/audio.py / timing.py + TTS)"
    if not why and size > MAX_BYTES: why = f"SIZE: {size} bytes > 25 MB publication limit"
    (excl if why else keep).append((r, size, why))
# 3. scans over the files to be published (abort on secrets; report PII categories with counts only, never values)
secrets, pii = [], {}
for r, size, _ in keep:
    if not r.lower().endswith(TEXT) or size > MAX_BYTES: continue
    b = open(os.path.join(STUDIO, r), "rb").read()
    for name, rx in SECRET:
        for m in rx.finditer(b):
            s = m.group(0)
            if name == "assigned_secret" and re.search(rb"(?i)(not[-_ ]real|test|placeholder|redacted|example|dummy|fixture|xxxx)", s): continue
            secrets.append({"file": r, "kind": name})
    for name, rx in PII:
        n = len(rx.findall(b))
        if n: pii.setdefault(name, {})[r] = n
dupe_secret = {(s["file"], s["kind"]) for s in secrets}
report = {"studio": STUDIO, "candidates": len(cands), "publish": len(keep), "publish_bytes": sum(s for _, s, _ in keep), "excluded": len(excl), "excluded_bytes": sum(s for _, s, _ in excl),
          "secret_hits": sorted([{"file": f, "kind": k} for f, k in dupe_secret], key=lambda x: x["file"]), "pii_categories": {k: {"files": len(v), "occurrences": sum(v.values()), "examples": sorted(v)[:15]} for k, v in pii.items()},
          "largest_published": sorted([(s, r) for r, s, _ in keep], reverse=True)[:12]}
os.makedirs(os.path.join(REPO, "analysis"), exist_ok=True)
json.dump(report, open(os.path.join(REPO, "analysis", "PUBLICATION_SCAN.json"), "w"), indent=1)
json.dump([{"path": r, "bytes": s, "sha256": sha(os.path.join(STUDIO, r)), "reason": w} for r, s, w in excl], open(os.path.join(REPO, "analysis", "EXCLUDED_FILES.json"), "w"), indent=1)
if secrets: print(json.dumps(report["secret_hits"], indent=1)); sys.exit("ABORTED: secret-like material found; nothing copied")
if "--dry" in sys.argv: print(json.dumps({k: report[k] for k in ("candidates", "publish", "publish_bytes", "excluded", "excluded_bytes", "pii_categories")}, indent=1)); sys.exit(0)
for r, _, _ in keep:
    dst = os.path.join(REPO, r); os.makedirs(os.path.dirname(dst), exist_ok=True); shutil.copy2(os.path.join(STUDIO, r), dst)
print(json.dumps({k: report[k] for k in ("candidates", "publish", "publish_bytes", "excluded", "excluded_bytes")}, indent=1))
