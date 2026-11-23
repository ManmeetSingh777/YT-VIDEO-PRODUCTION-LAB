#!/usr/bin/env python3
"""Builds exports/HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT.zip — the complete, independently inspectable working studio:
  engine/ (ALL files; each .mjs/.js labelled production-reachable or not via tests/p02/production_closure.mjs), schemas/, tests/ (art_bridge + p02 +
  fixtures), the installed F01–F80 skill (incl. source-witness images), the production film's contracts, the latest rendering test's film
  (rehearsal K: inputs, registration, approvals, ledger, chunk receipts, frame manifest — NOT the video binaries), directives, HANDOFF/CLAUDE,
  P02 evidence docs, git HEAD + uncommitted diff + untracked list, a reproduction package.json and instructions, and SNAPSHOT/SHA256_MANIFEST.json.
Rejects the export when (a) any relative import of any included module is missing, or (b) credential-like material is found.
Usage: python -I engine/tools/build_source_snapshot.py"""
import hashlib, json, os, re, stat, subprocess, sys, zipfile, datetime
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
OUT = os.path.join(ROOT, "exports", "HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT.zip"); P = "HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT/"
REH = "hybrid_v2/work/p02/rehearsal_K"
def git(*a): return subprocess.run(["git", *a], cwd=ROOT, capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for b in iter(lambda: f.read(1 << 20), b""): h.update(b)
    return h.hexdigest()
DIRS = ["engine", "schemas", "tests/art_bridge", "tests/p02", "reference/construct-kurzgesagt-art", "films/hv2_film001", "films/_qual_A", "hybrid_v2/art_outbox", "hybrid_v2/evidence/p02", "hybrid_v2/audit_docs", f"{REH}/rt", f"{REH}/evidence"]
FILES = ["CLAUDE.md", "HANDOFF.md", "inputs/HYBRID_V2_P02_SYSTEM_REPAIR_AND_PROOF_DIRECTIVE.md", "inputs/HYBRID_V2_ZERO_AMBIGUITY_CORRECTION_DIRECTIVE.md", "inputs/MOTION_NATIVE_HYBRID_V2_COMPLETE_IMPLEMENTATION_SPEC.md",
         "inputs/EXPERIENCE_DIRECTOR_V1.md", "inputs/CLAUDE_CODE_ONE_RUN_EXECUTION_PROMPT.md", "MOTION_NATIVE_STYLE_TO_CODE_IMPLEMENTATION_SPEC_V1.md", "hybrid_v2/work/p02/SOURCE_PACKAGE_RECONCILIATION.json"]
SKIP = ("/render/chunks/", "/render/compositions/", "__pycache__", "/_tmp/", ".mp4", ".mkv", "/node_modules/", ".tmp-", "/RECOVERED_ORIGINAL_EVIDENCE/")
SECRET = re.compile(r"(sk-[A-Za-z0-9]{20,}|OPENAI_API_KEY\s*=\s*['\"]?[A-Za-z0-9_-]{16,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----)")
files = []
for d in DIRS:
    for dp, _, fs in os.walk(os.path.join(ROOT, d)):
        for f in fs:
            r = os.path.relpath(os.path.join(dp, f), ROOT).replace(os.sep, "/")
            if not any(s in "/" + r for s in SKIP): files.append(r)
files = sorted(set(files + [f for f in FILES if os.path.exists(os.path.join(ROOT, f))]))
inc, missing = set(files), []
IMP = re.compile(r"""(?:import\s+(?:[^'"]*?\sfrom\s+)?|import\(\s*|export\s+[^'"]*?\sfrom\s+)['"](\.{1,2}/[^'"]+)['"]""")
for r in files:
    if not r.endswith((".mjs", ".js")): continue
    for m in IMP.finditer(open(os.path.join(ROOT, r), encoding="utf-8", errors="replace").read()):
        t = os.path.normpath(os.path.join(os.path.dirname(r), m.group(1))).replace(os.sep, "/")
        if t not in inc and not os.path.isdir(os.path.join(ROOT, t)): missing.append(f"{r} -> {m.group(1)}")
if missing: sys.exit("SNAPSHOT REJECTED: missing imported source files:\n  " + "\n  ".join(sorted(set(missing))))
leaks = [r for r in files if r.endswith((".mjs", ".js", ".json", ".md", ".txt", ".py", ".jsonl")) and SECRET.search(open(os.path.join(ROOT, r), encoding="utf-8", errors="replace").read())]
if leaks: sys.exit("SNAPSHOT REJECTED: credential-like material in: " + ", ".join(leaks))
reach = json.loads(subprocess.run(["node", "tests/p02/production_closure.mjs"], cwd=ROOT, capture_output=True, text=True).stdout)
head = git("rev-parse", "HEAD").strip(); snap = {}
snap["SNAPSHOT/GIT_HEAD.txt"] = f"HEAD {head}\nbranch {git('rev-parse', '--abbrev-ref', 'HEAD').strip()}\n\n{git('log', '--oneline', '-15')}".encode()
snap["SNAPSHOT/GIT_STATUS.txt"] = git("status", "--porcelain=v1", "-uall").encode()
snap["SNAPSHOT/UNCOMMITTED_CHANGES_vs_HEAD.patch"] = git("diff", "HEAD").encode()
snap["SNAPSHOT/PRODUCTION_REACHABILITY.json"] = json.dumps(reach, indent=1).encode()
snap["SNAPSHOT/REPRODUCE/package.json"] = json.dumps({"name": "motion-native-studio-v1-reproduction", "private": True, "description": "Reproduction manifest written by the snapshot builder. The repository itself has no package.json: the only npm dependency is puppeteer-core, loaded from PUPPETEER_CORE_PATH or the npx cache by engine/art_bridge/render.mjs#loadPuppeteer.",
    "engines": {"node": ">=22.20.0"}, "dependencies": {"puppeteer-core": "25.16.0"}}, indent=1).encode()
snap["SNAPSHOT/EXCLUDED_DEPENDENCIES.md"] = ("# Excluded from the snapshot (needed for reproduction)\n\n"
 "| Dependency | Version measured | Why excluded | How to provide |\n|---|---|---|---|\n"
 "| Node.js | v22.20.0 | runtime | install; `node` on PATH |\n| puppeteer-core | 25.16.0 | npm package (no lockfile in repo) | `npm i` in `SNAPSHOT/REPRODUCE`, then set `PUPPETEER_CORE_PATH=<that>/node_modules/puppeteer-core` |\n"
 "| Google Chrome | 158.0.8127.36 | binary | install; or set `CHROME_PATH` |\n| FFmpeg/ffprobe | 7.1 (gyan essentials) | binary | on PATH |\n| Python 3 | 3.x (run with -I) | runtime (skill scripts, zip tools) | on PATH or `PYTHON` |\n"
 "| Original neutrino package | `neutrino_2m_SOURCE_PACKAGE.zip`, sha256 1c9f7ee1…5be100, 380,874,918 B | 380 MB; reference only (its nu.js is byte-identical to `engine/runtime/nu.js`, included) | from `G:\\claude subscription experiment\\` |\n"
 "| `inputs/construct-kurzgesagt-art.zip`, `inputs/MOTION_NATIVE_HYBRID_V2_SPEC_AND_CLAUDE_PROMPT.zip` | — | duplicates: the extracted skill tree `reference/construct-kurzgesagt-art/` IS included | repo `inputs/` |\n"
 "| Rendered video and FFV1 segments (`render/chunks`, `*.mp4`, `*.mkv`, `render/compositions`) | — | large, reproducible outputs; their hashes are in the included FRAME_MANIFEST / chunk receipts / ledger | re-run `node tests/p02/run_rehearsal.mjs --dir <NEW_DIR> --phase X --build` |\n"
 "| Earlier-round work dirs (`hybrid_v2/work/p01`, 79 GB) and the offloaded R23 copies (`C:\\MOTION_NATIVE_STUDIO_V1_EVIDENCE_OFFLOAD`) | — | regenerated test outputs | re-run the tests |\n"
 "| Credentials | — | never included | `IMAGE_PROVIDER`, `OPENAI_API_KEY`, `ART_BRIDGE_REVIEWER_KEYS_FILE`, `ART_BRIDGE_BUDGET_AUTHORIZATION` are NOT set or shipped |\n").encode()
snap["SNAPSHOT/README_REPRODUCE.md"] = ("# HYBRID_V2_COMPLETE_SOURCE_SNAPSHOT\n\n"
 f"- Captured from git HEAD `{head}` **plus the uncommitted working tree**. Every file is shipped as it is on disk. `UNCOMMITTED_CHANGES_vs_HEAD.patch` and `GIT_STATUS.txt` show what is not yet committed.\n"
 "- `SNAPSHOT/PRODUCTION_REACHABILITY.json` labels every engine module.\n"
 "  - **Production-reachable**: the static import closure of the CLIs, plus the renderer registry modules and the three page-runtime files.\n"
 "  - **NOT reachable**: preserved V1 history, for example `engine/methods/*`, `engine/runtime/mn.js`, the legacy tools. These are not active code.\n"
 "- The latest rendering test is rehearsal K (`hybrid_v2/work/p02/rehearsal_K/`). Its film inputs, registrations, approvals (DIAGNOSTIC namespace), hash-chained ledger and chunk receipts are included. The film is rebuilt by `tests/p02/rehearsal_film.mjs` (+ `roundtrip_fixture.mjs`, `portal_fixture.mjs`).\n\n"
 "## Reproduce\n"
 "1. Install the dependencies in `EXCLUDED_DEPENDENCIES.md`.\n"
 "2. `node --test tests/art_bridge/*.test.mjs tests/p02/*.test.mjs`. Chrome tests need puppeteer-core + Chrome.\n"
 "3. `node tests/p02/run_rehearsal.mjs --dir hybrid_v2/work/p02/rehearsal_NEW --phase X --build`. This is a full 7200-frame Chrome render, about 30 min.\n"
 "4. `node engine/tools/production_run.mjs preflight --film films/hv2_film001`. This is the real production preflight; it is fail-closed.\n").encode()
man = {"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat(), "git_head": head, "files": {}}
for r in files: man["files"][r] = {"sha256": sha(os.path.join(ROOT, r)), "bytes": os.path.getsize(os.path.join(ROOT, r)), "production_reachable": (r in reach["production_reachable"]) if r.startswith("engine/") and r.endswith((".mjs", ".js")) else None}
for k, v in snap.items(): man["files"][k] = {"sha256": hashlib.sha256(v).hexdigest(), "bytes": len(v)}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
if os.path.exists(OUT): os.chmod(OUT, stat.S_IWRITE | stat.S_IREAD); os.remove(OUT)
with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED, compresslevel=6) as z:
    for r in files: z.write(os.path.join(ROOT, r), P + r)
    for k, v in snap.items(): z.writestr(P + k, v)
    z.writestr(P + "SNAPSHOT/SHA256_MANIFEST.json", json.dumps(man, indent=1))
os.chmod(OUT, stat.S_IREAD)
print(f"{OUT}\nfiles {len(man['files']) + 1}  bytes {os.path.getsize(OUT)}  sha256 {sha(OUT)}")
