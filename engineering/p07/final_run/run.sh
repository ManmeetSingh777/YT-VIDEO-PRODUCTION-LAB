#!/bin/bash
# ONE comprehensive P07 regression on the frozen source (detached worktree), then the Chrome negatives and the short production chain.
cd /c/Users/gmanm/TBO_DEV_REGRESSION || exit 9
O=/c/Users/gmanm/TBO_P07_FINAL
{ echo "start=$(date -u +%FT%TZ)"; echo "sha=$(git rev-parse HEAD)"; echo "node=$(node --version)"; echo "nu_js_sha256=$(sha256sum engine/runtime/nu.js | cut -d' ' -f1)"; git status --short | sed 's/^/dirty: /'; } > $O/RUN.txt
node --test --test-reporter=tap --test-concurrency=3 tests/art_bridge/*.test.mjs tests/p02/*.test.mjs tests/p03/*.test.mjs tests/p04/*.test.mjs tests/p05/*.test.mjs tests/tbo/*.test.mjs > $O/FINAL_ENGINEERING_TAP.tap 2> $O/suite_stderr.txt
echo "suite_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p03/run_clips.mjs --only negatives --out $O/p03_chrome_negatives > $O/p03_chrome_negatives.log 2>&1; echo "p03_chrome_negatives_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p05/run_packet_negatives.mjs --out $O/p05_render_negatives > $O/p05_render_negatives.log 2>&1; echo "p05_render_negatives_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
node tests/p05/run_packet_chain.mjs --out $O/p05_chain > $O/p05_chain.log 2>&1; echo "p05_chain_exit=$? at=$(date -u +%FT%TZ)" >> $O/RUN.txt
echo "end=$(date -u +%FT%TZ)" >> $O/RUN.txt
