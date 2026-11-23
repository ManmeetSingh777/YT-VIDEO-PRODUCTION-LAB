# AnimationLab V4: TWO-MINUTE SCIENCE EXPLAINER

**Production:** 120-second, 16:9 1920x1080, 30fps, original science YouTube explainer.
**Title:** 100 Trillion Ghosts Are Passing Through You Right Now.
**Toolchain:** Claude Code (Opus 5.5, Medium) + HyperFrames (GSAP/SVG/HTML) + local FFmpeg.
**Creative objective:** Match the category of illustration polish, pacing, storytelling density, and choreographed animation associated with premium science explainers, while making **completely original** characters, artwork, staging, metaphors, and transitions.

## Why this attempt is structurally different

Previous experiments requested a vague fictional cinematic showpiece, often without narration. V4 locks down an accessible, sourced science explanation, uses voiceover as the timing spine, demands full-size proof of its art design **and a real moving shot** before implementing two minutes, and maintains a visual continuity contract.

The following are separate gates, not synonyms:
1. **Story comprehension** (what the audience should understand and care about)
2. **Actual finished illustration** (not a pretty written art bible)
3. **Animated performance** (not translating a flat image)
4. **Faithful end-to-end production** (not a technically valid but artistically broken render)
5. **Measured cost / finished deliverable** (no invented claims)

## Files
- `01_SCRIPT_AND_FACTS.md`: original timed narration and reliable source facts.
- `02_VISUAL_MOTION_GRAMMAR.md`: style bible and animation/performance rules.
- `03_PRODUCTION_CONTRACT.md`: exact mandatory order of work, hard stops, technical contracts.
- `04_SHOT_MAP.csv`: 30 beat starting plan, directions are **improvable**, not a template to copy blindly.
- `05_REVIEW_GATE.md`: checks and acceptance evidence.
- `06_REFERENCES.md`: technical/creative official sources, specific lessons and limits.
- `RUN_IN_CLAUDE.txt`: short paste-ready launch command.

## Use
1. Create an **independent clean HyperFrames project**, `G:\claude subscription experiment\neutrino_2m` (separate from `film`). Initialize it with the **Blank** example. Use the installed official skills.
2. Copy this V4 folder into the project root as `DIRECTION_V4`.
3. Open the clean project in a **new local Claude Desktop Code session**, Opus 5.5 Medium, and paste `RUN_IN_CLAUDE.txt`.
4. Inspect the five preview frames and first moving proof (Claude should automatically repair obvious failures). Claude should then continue to the full two-minute render without waiting unless blocked.
5. Don't install dozens of random third-party skills. Add only a capability the production demonstrably lacks.

No separate paid API calls. Your Claude subscription has rolling limits: a five-hour usage window is **not a promise that an entire film will fit in one window**.
