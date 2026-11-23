# Dependencies

## In-repository (all included in this package)
- engine/art_bridge/** (bridge), engine/tools/art_bridge_check.mjs, art_bridge_qa.mjs, art_outbox.mjs, build_hybrid_v2_audit.py
- engine/runtime/nu.js, gsap.min.js (preserved runtime + GSAP used by every composition), mn.js, form3d.js (unchanged, for reference)
- engine/methods/source/F_SOURCE.json (verbatim F01–F80 method texts; read by method_trace.mjs)
- reference/construct-kurzgesagt-art/** (installed skill: scripts/prepare_first_pass.py, compile_art_job.py, repair_learning.py; native witness assets)
- schemas/**, tests/art_bridge/** (fixtures, generators, tests, proof runners)
- films/hv2_film001/** (proposal, graph builder, manifest, plans, designs, QA); films/_qual_A word timings (audio negative)
- No npm packages are vendored or required by the bridge source itself (Node built-ins only).

## External toolchain (versions used for the packaged run)
- Node.js v22.20.0 (node:test, fetch, FormData built in)
- puppeteer-core: 25.16.0 (resolved from the npx cache; install equivalently with `npm i puppeteer-core@25.16.0`, set PUPPETEER_CORE_PATH)
- Google Chrome 158.0.8127.36 (CHROME_PATH)
- ffmpeg version 7.1-essentials_build-www.gyan.dev / ffprobe (same build)
- Python 3.14.6 with Pillow 12.3.0 (skill scripts, contact sheets, audit builder)
- OS: Windows 11 (paths in examples use forward slashes; Git Bash or PowerShell)
