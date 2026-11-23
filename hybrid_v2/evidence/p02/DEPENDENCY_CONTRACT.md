# Dependency contract (fresh-extraction replay)

## What the audit ZIP contains
- `engine/`, `schemas/`, `tests/art_bridge/`, `tests/p02/`
- The full installed skill `reference/construct-kurzgesagt-art/`: SKILL.md, scripts, references, and the witness images that compiled requests attach.
- The production film's contracts (`films/hv2_film001/{handoff,story,direction,art_designs,learning,skill,approvals}`).
- The evidence: rehearsal transcripts, ledgers, TAP logs.

The exporter (`engine/tools/build_p02_audit.py`) **rejects** the export if any statically imported source file is missing, or if credential-like material is found.

## What it does NOT contain, and the replay host must provide
| Dependency | Version measured | How it is found | If absent |
|---|---|---|---|
| Node.js | v22.20.0 | `node` on PATH | Nothing runs. |
| ffmpeg / ffprobe | 7.1 (gyan essentials) | on PATH | Render tests fail with an explicit error. |
| Python 3 | 3.x, run with `-I` | `python` on PATH (or `PYTHON`) | Skill compile and zip steps fail. |
| Chrome + puppeteer-core | Chrome 158.0.8127.36; puppeteer-core from the npx cache | `engine/art_bridge/render.mjs#loadPuppeteer` / `CHROME` | Chrome render tests (`tests/p02/p02_render.test.mjs`, the rehearsal) fail with an explicit error. They are not skipped. |
| Original neutrino package | sha256 `1c9f7ee1…5be100` | outside the repo (`G:\…`) | Not needed for the tests. Reconciliation evidence is included. |

## Environment variables (redacted contract; see `AUDIT/ENVIRONMENT_REDACTED.json`)
- No credential is needed, and none is included.
- `IMAGE_PROVIDER`, `OPENAI_API_KEY` and the related provider variables stay **unset**. All provider tests use a loopback stub.
- `ART_BRIDGE_REVIEWER_KEYS_FILE` is unset, so no production trust anchor exists and HUMAN gates block (correct).
- `ART_BRIDGE_TEST_TRUST=1` is set only *inside* test processes. It takes effect only in films that carry `.diagnostic_namespace`.
