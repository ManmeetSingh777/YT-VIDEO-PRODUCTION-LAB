#!/bin/bash
# ONE comprehensive RELEASE regression (consolidated integration revision) on the frozen source (detached worktree on C:), then the Chrome negatives and the short production chain.
# The content-addressed chunk cache is FRESH for this run (never reused across runs); injected failures always bypass it.
W=/c/Users/gmanm/TBO_REL1_REGRESSION; O=/c/Users/gmanm/TBO_REL1_FINAL; cd $W || exit 9
export TBO_RENDER_CHUNK_CACHE=$O/chunk_cache; rm -rf "$TBO_RENDER_CHUNK_CACHE"
{ echo "start=$(date -u +%FT%TZ)"; echo "sha=$(git rev-parse HEAD)"; echo "node=$(node --version)"; echo "nu_js_sha256=$(sha256sum engine/runtime/nu.js | cut -d' ' -f1)"; echo "chunk_cache=$TBO_RENDER_CHUNK_CACHE"; git status --short | sed 's/^/dirty: /'; } > $O/RUN.txt
node --test --test-reporter=tap --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs tests/p04/*.test.mjs tests/p05/*.test.mjs tests/tbo/*.test.mjs tests/p08/*.test.mjs > $O/FINAL_ENGINEERING_TAP.tap 2> $O/suite_stderr.txt
echo "suite_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p03/run_clips.mjs --only negatives --out $O/p03_chrome_negatives > $O/p03_chrome_negatives.log 2>&1; echo "p03_chrome_negatives_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p05/run_packet_negatives.mjs --out $O/p05_render_negatives > $O/p05_render_negatives.log 2>&1; echo "p05_render_negatives_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p05/run_packet_chain.mjs --out $O/p05_chain > $O/p05_chain.log 2>&1; echo "p05_chain_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
echo "cache_bytes=$(du -sb $TBO_RENDER_CHUNK_CACHE 2>/dev/null | cut -f1) cache_keys=$(ls $TBO_RENDER_CHUNK_CACHE 2>/dev/null | wc -l)" >> $O/RUN.txt
echo "end=$(date -u +%FT%TZ)" >> $O/RUN.txt
