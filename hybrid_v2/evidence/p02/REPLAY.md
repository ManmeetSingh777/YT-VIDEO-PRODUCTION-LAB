# Replaying the P02 audit from a fresh extraction

## Commands
```
node tests/p02/replay_audit.mjs audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip <EMPTY_DEST_DIR>
```

## What the replay does
1. Extracts the ZIP into the empty destination.
2. Verifies every member against `AUDIT/INTEGRITY_MANIFEST.json`.
3. Checks that `engine/runtime/nu.js` is byte-identical.
4. Runs every advertised suite *inside the extraction*: `tests/art_bridge/*.test.mjs` and `tests/p02/*.test.mjs`. Tests that need the rehearsal film rebuild it through the real intake API.
5. Compares each test name and outcome with the shipped TAP log, `hybrid_v2/work/audit_logs/p02_tap.txt`.
6. Exits non-zero if any of these hold:
   - a member is missing or altered;
   - a shipped test is missing from the replay;
   - any outcome changed;
   - nu.js changed.

The result goes to `<DEST>/REPLAY_RESULT.json` and `<DEST>/REPLAY_TAP.txt`.

## Rehearsal (separately)
```
node tests/p02/run_rehearsal.mjs --phase X --build
```
This rebuilds the diagnostic film and runs S00–S09 through `engine/tools/production_run.mjs`, with the Chrome renderer over 7200 frames.

## Dependencies
See `AUDIT/DEPENDENCY_CONTRACT.md`. The replay needs node, ffmpeg, python and Chrome with puppeteer-core. It needs no credentials.
