## F06: consolidation of the P08 engineering line, `main` and the design branch (review; do not auto-merge)

This branch = `production/better-one-first-film-engineering` @ `44412e0` + `origin/main` @ `587bfd8` + `origin/design/gpt-creative-production-contract-v1` @ `0c3096c`.
No branch was deleted; nothing was force-pushed.

### Conflicts and how each one was resolved
| File | Resolution | Why |
|---|---|---|
| `README.md` | **both kept**: the production entrypoint first, `main`'s full 900-line pipeline specification below a marked separator | both sides rewrote the whole file; neither supersedes the other |
| `docs/gpt-creative-control/{CLAUDE_INTEGRATION_DIRECTIVE,NEW_CHAT_CREATIVE_DIRECTOR,README}.md` | **design branch text** | the engineering branch's P05 commit `0576c9a` had prefixed every line with a stray backtick; the text was otherwise identical, so this repairs a corruption (a scan found no other affected file) |
| `docs/gpt-creative-control/validate_creative_packet.py` | **engineering branch** | a strict superset: it adds CLAIM_TRUTH_UNVERIFIED, ART_USAGE_LINK_ASYMMETRIC, HAND_CLOSURE_ART_MISSING and the MISSING_MASTER kind checks |
| `docs/gpt-creative-control/P04_TO_REAL_ART_RELEASE_GATES.md` | added from the design branch | new |

### What this PR carries from the engineering line
- P08 motion closure.
- Executed regression evidence: `ef0a722` gave **365/367**. The two failures are fixed in `5314269` and verified by a targeted re-test only; there has been **no second comprehensive regression**. See `engineering/p08/P08_FINAL_REPORT.md`.
- The E01 P3.2 text sources.

### Not claimed
- Real E01 film seconds accepted: **0**. No real art and no approvals.
- `nu.js` is unchanged.
- The Python validator was not executed here (`jsonschema` is not installed).

🤖 Generated with [Claude Code](https://claude.com/claude-code)
