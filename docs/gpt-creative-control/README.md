# GPT Creative Control v1 — operator guide

This package formalizes creative stages 1–4 of Motion Native Studio. It does NOT replace the original Experience Director V1 or the installed F01–F80 visual skill, and it does NOT by itself make the current Neutrino production engine ready.

## Intended division
1. **GPT:** narrative and script; source-grounded story; complete experience direction; motion-capable artwork requirements; actual GPT images generated manually in another ChatGPT chat using F01–F80.
2. **Deterministic validator:** verify packet structure, refs, frame tiling, action phases, asset obligations, declared consequences. This is not an artistic judge.
3. **Claude Code / engine:** adapt the approved packet to the existing schema; pre-art support/feasibility; post-art measured registration and complete frame feasibility; Neutrino/Chrome motion; A/V render; owner/visual QA.
4. **User:** decide artistic and direction approvals, resolve creative-versus-technical tradeoffs. Human review status cannot be forged by an LLM.

## Files
- [NEW_CHAT_CREATIVE_DIRECTOR.md](NEW_CHAT_CREATIVE_DIRECTOR.md): paste into the NEW ChatGPT production chat, together with Experience Director V1 and current F01–F80 references.
- [creative_packet.schema.json](creative_packet.schema.json): typed creative packet v1 schema. Duration is variable; always 1920×1080, 60fps in this version.
- [validate_creative_packet.py](validate_creative_packet.py): strict schema and cross-reference validator; emits JSON error report, nonzero exit on failure.
- [examples/valid_synthetic.json](examples/valid_synthetic.json): synthetic structure fixture (not real creative direction or art).
- [examples/invalid_synthetic.json](examples/invalid_synthetic.json): intentionally wrong shot tiling and missing artwork reference.
- [CLAUDE_INTEGRATION_DIRECTIVE.md](CLAUDE_INTEGRATION_DIRECTIVE.md): exact instructions to build, test and wire the adapter/preflights into Hybrid V2 without creative improvisation.

## Proposed commands
Install on the development workstation:

\`python -m pip install "jsonschema>=4.18"\`

Validate:

\`python docs/gpt-creative-control/validate_creative_packet.py path/to/CREATIVE_PACKET.json --output path/to/CREATIVE_VALIDATION.json\`

Minimal example validation:
\`python docs/gpt-creative-control/validate_creative_packet.py docs/gpt-creative-control/examples/valid_synthetic.json\`
expected exit 0.
\`python docs/gpt-creative-control/validate_creative_packet.py docs/gpt-creative-control/examples/invalid_synthetic.json\`
expected nonzero exit.

**Execution note:** The source files were authored and retrieved through the connected GitHub tool, and the schema/example top-level structure was statically cross-checked. They have NOT yet been exercised under Python in a CI/runtime environment. Claude's first integration step MUST execute and test them, then fix any discovered bug.

## Explicit authority handoffs
Creative proposal -> \`CREATIVE_PACKET.json\` -> structural validator -> real human creative approval -> pre-art engineering feedback -> F01–F80 image creation -> verified image import -> human art review -> registration -> post-art feasibility -> Neutrino animation -> final video and audio -> human final visual review.

If engineering requires more artwork, GPT receives a typed \`MISSING_ART_STATE\` packet and must produce the correct derivative from the approved master. If a physical action is impossible, the engineer reports precise constraints and feasible options; only GPT and user can approve the artistic change. All related revisions invalidate stale proof.

## Important limitations
A schema cannot guarantee a good script, perfect image anatomy, compelling motion or audience emotion. Also, a structurally complete packet can still describe unsupported physical motion. ENGINE PREFLIGHT and actual post-art animation tests are independent mandatory checks. The GPT package does not claim that the existing \`engine/tools/compile_film_contracts.mjs\` already imports its JSON: building that actual adapter is required before first real film.
