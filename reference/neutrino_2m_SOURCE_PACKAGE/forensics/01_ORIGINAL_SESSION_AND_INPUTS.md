# 01 — Original session and inputs

> Correction (21 Nov): the failed V3 engine referenced in 07 is `E:\THE ANIMATION LAB` @ `7d4e0c0`, not `G:\AnimationLabV0`.

Evidence labels used in every file of this folder:
**[OBS]** observed directly in a file, log or render · **[CODE]** follows from reading the source · **[MEM]** first-hand recollection of the producing session (this investigation is written by the same Claude Code session that made the film, with its full transcript still in context) · **[SPEC]** inference or speculation.

## 1. Positive identification of the film

| Property asked for | `final.mp4` in this project | Source |
|---|---|---|
| Duration | 120.000000 s | [OBS] ffprobe |
| Resolution | 1920 × 1080 | [OBS] ffprobe |
| Frame rate / frames | 30/1, 3,600 decoded frames (`-count_frames`) | [OBS] ffprobe |
| Video codec | H.264 High, yuv420p, ~10.6 Mb/s | [OBS] ffprobe |
| Audio | AAC LC, stereo, 48 kHz, 120.000 s | [OBS] ffprobe |
| SHA-256 | `765f4b374af49f776e912b25a295d14b27ad2fc785311c2d885fdfd79ce971f0` | [OBS] `sha256sum` |

- Path: `G:\claude subscription experiment\neutrino_2m\final.mp4` (161,636,578 bytes).
- An identical copy exists at `G:\claude subscription experiment\neutrino_2m - Copy\final.mp4`, with the same SHA-256 [OBS].
- `neutrino_2m - Copy.zip` and `ZIP_FILE.zip` were created at 20:44 and 20:48 local time on 4 Nov, after the session [OBS].
- **`final(5).mp4` was not found** on `G:\`, in `Downloads`, `Desktop`, `Videos` or the user profile (searched to depth 6).
  - The name looks like a browser's fifth download of `final.mp4`.
  - To confirm the match, compare hashes: `certutil -hashfile "final(5).mp4" SHA256`. It should equal the value above.
- Every visual beat listed in the brief matches this project's frames and source:
  - kitchen with the raincoat character and umbrella;
  - pullback through the window;
  - Sun and fusion;
  - Moon and hand;
  - Earth cutaway;
  - city street;
  - Antarctic detector;
  - return to the kitchen.

  Frame evidence is in `hero/` and the 64-frame sheet the session saved as `proof/qa/final_1.png` [OBS].
- **One discrepancy in the brief:** it says "neutrinos passing toward the Moon and through a human hand". In the film these are two separate scenes, `flight` (Moon) and `body` (hand) [CODE].

## 2. The session

- Session file: `C:\Users\gmanm\.claude\projects\G--claude-subscription-experiment-neutrino-2m\e7588946-64a5-48e2-948a-cd7a64e4dc1f.jsonl` (29.9 MB) [OBS].
- First user message: 2026-11-04 12:46:33 UTC. Last entry: 14:31:05 UTC [OBS].
  - Local time is UTC+05:45, the offset git used. Some file listings show +05:30 for the same instants; this is a display difference only.
- 174 assistant messages [OBS]. Tool calls [OBS]:

  | Tool | Calls |
  |---|---|
  | Bash | 37 |
  | Read | 34 |
  | Write | 25 |
  | PowerShell | 3 |
  | Edit | 3 |
  | Skill | 2 |
  | update_plan | 4 |
  | wrap_up | 2 |
  | Glob | 1 |
  | Grep | 1 |

- The session was never compacted. The full transcript remained available to the author of this report [MEM].
- No other session produced or modified this project. The project folder holds only this session's log [OBS].

## 3. Exact user instructions (all of them)

There were exactly **four user-typed messages**. The rest were tool results and background notifications [OBS].

| UTC | Message |
|---|---|
| 12:46:33 | The full production prompt (below), pasted, beginning `/hyperframes`. |
| 14:22:48 | Praise ("THIS IS NOTHING SHORT OF A MASTERPIECE …"). Came after `final.mp4` existed, so it had no effect on the film. |
| 14:28:41 | "DON'T WORRY ABOUT UPGRADING THIS VIDEO … OUR GOAL IS TO CREATE THE MACHINE …". After the film. |
| 14:30:57 | "that's why we'll test the numbers … I'm first building the machine talk later". After the film. |

**So the film was produced from one prompt, with zero user corrections, objections or mid-course direction.** User intervention during production was nil [OBS].

The production prompt is identical in content to `DIRECTION_V4/RUN_IN_CLAUDE.txt` [OBS]. Key passages:

> "Read all files in `DIRECTION_V4` completely … Treat `03_PRODUCTION_CONTRACT.md` as authoritative."

> "START PRODUCING ACTUAL ART NOW. First create 5 actual full-resolution polished hero frames (not text). Generate the original timed narration/voice draft and a rough full-length visual animatic. Then produce a 12-second real-motion proof, inspect it at normal speed and repair concrete faults, and CONTINUE to the full 120-second editable HyperFrames composition + `final.mp4`."

> "No repeating initialization checks, no thousands-of-actors simulation, no third-party API charges, no lengthy preproduction essays … no generic slides/static cutouts."

> "You can proceed without requesting approval at each phase; stop only for a genuine blocker or forbidden paid dependency. Keep the art as ambitious as the direction."

**Creative freedom granted** [OBS]:
- "Invent better scenes if possible" (`03_PRODUCTION_CONTRACT.md` §2).
- The shot map "is a suggestion, not a forced shot count" (§3, and `04_SHOT_MAP.csv` header note "improvable, not a template").
- Narration may be revised "only if required for natural delivery/scientific clarity".

**Constraints**: no paid APIs; ≤2 targeted corrections on the proof; deterministic HyperFrames; no copying Kurzgesagt.
- No constraint was relaxed during the session, because the user never spoke during production.

## 4. Supplied inputs and their influence

| Input | Path | Origin | Entered | Used? | Influence on the film |
|---|---|---|---|---|---|
| Production prompt | pasted text | user | 12:46:33 UTC | yes | Fixed the order of work: heroes → voice → animatic → proof → full → final. |
| `00_START_HERE.md` | `DIRECTION_V4/` | user. Identical files sit in `G:\…\AnimationLab_Explainer_V4\DIRECTION_V4`, written 18:06 local (12:21 UTC), 25 min before the session. Authorship not recorded [OBS] | start | read | Context only. |
| `01_SCRIPT_AND_FACTS.md` | same | user | start | **yes, verbatim** | The entire narration text (33 sentences, unchanged wording) and the factual claims and on-screen numbers: 100 trillion, 5,160, 1 km³, Cherenkov from secondary particles, flavour change, "not all pass". |
| `02_VISUAL_MOTION_GRAMMAR.md` | same | user | start | **yes, heavily** | Character identity (coral asymmetric curl, mustard raincoat, umbrella that fails to block the "rain"); palette hexes; neutrino motif as a "3-point sea-glass spark"; the five hero-frame descriptions; anticipation and follow-through and the other animation principles; "neutrinos pass *through* correctly masked layers"; 3 depth planes. |
| `03_PRODUCTION_CONTRACT.md` | same | user | start | yes | Gates and order; "visible art first"; ≤2 proof corrections; inspect frames at 0, 1, 3, 5, 8, 10, 12 s. |
| `04_SHOT_MAP.csv` | same | user | start | **yes, as a beat source** | About 30 beats; many visual ideas were kept (see 05). The doors metaphor, "? made of detector wires", sensors lighting sequentially, data dots, the trace-back to the sky and the river ending all come from here. |
| `05_REVIEW_GATE.md` | same | user | start | yes | 120 ±0.3 s, honesty rules ("NOT YET" allowed). |
| `06_REFERENCES.md` | same | user | start | read | No assets used. Its principle (narration timing first) shaped the voice-first order. |
| `CLAUDE.md` / `AGENTS.md` | project root | HyperFrames `init` template | before session | yes | HyperFrames rules: `.clip`, `window.__timelines`, determinism. |
| HyperFrames blank scaffold | `index.html`, `package.json`, `hyperframes.json`, `meta.json` | `hyperframes init` (Blank), `meta.json createdAt 2026-11-04T12:36:44Z` | before session | `index.html` replaced; `package.json` pins kept | The render stack (see 03). |
| Skills | `~/.claude/skills/hyperframes`, `~/.claude/skills/media-use` | user-installed | 12:46:38, 12:46:51 | yes | Contract, sound defaults, TTS route (`npx hyperframes tts`, Kokoro). |
| Old "city movie" | `G:\…\film\` (ART_BIBLE, SHOT_PLAN, style_frames…) | earlier experiment | pre-existing | **not opened** [MEM] | None. The prompt said it "is NOT the brief". |

**Not supplied:**
- character art, storyboards or visual reference images;
- audio, music or SFX files;
- example animations or reusable components.

### Materials created by Claude during the session
Everything else, listed in 04 and 03:
- the runtime `assets/nu.js`;
- all art generators in `tools/`;
- narration WAVs (local TTS);
- the music and SFX synthesizer;
- the grain overlay;
- the QA scripts.

## 5. Initial environment

| Item | State at start | Evidence |
|---|---|---|
| Project folder | HyperFrames Blank scaffold + `DIRECTION_V4` copy. `index.html` held a placeholder "Title" | [OBS] first `Read` |
| Git | none. Claude ran `git init` and made checkpoint `76b1852` (12:48 UTC) | [OBS] |
| HyperFrames CLI | 0.9.11, pinned in `package.json` scripts, fetched by `npx` | [OBS] |
| GSAP | 3.15.0 from jsDelivr, referenced by the template | [OBS] |
| Node / Python / FFmpeg | Node 22.20.0; Python 3.14.6 with numpy 2.5.4 and Pillow 12.3.0; FFmpeg 7.1 essentials | [OBS] |
| TTS | `hyperframes tts` present, but `kokoro-onnx` was **missing**. Claude created `~/.cache/hyperframes/kokoro-venv` with kokoro-onnx 0.4.7, onnxruntime 1.31.1 and soundfile 0.14.0 | [OBS] error text + pip list |
| Windows SAPI voices | David, Zira present, unused | [OBS] |
| Reusable animation code | **none** | [OBS] folder listing |

### Critical question: prompt vs infrastructure

- **Infrastructure supplied** [CODE]:
  - a headless-browser renderer that seeks a paused GSAP timeline frame by frame;
  - sub-composition hosting;
  - an audio mixer;
  - bundled fonts;
  - snapshot and check tools;
  - a Kokoro TTS wrapper;
  - GSAP's easing library.

  None of these animate anything by themselves.
- **Everything that makes the film move** was written in this session, about 2,450 hand-written lines [OBS `wc -l`]:
  - the rig;
  - the parallax camera;
  - the streak particle system;
  - the morphing;
  - every drawing.
- **The direction** supplied the *what*: script, facts, character identity, motif, hero-frame targets, many beat ideas, quality gates.
- **Claude supplied** the *how*: the engine and the art. It also supplied most moment-to-moment staging (see 05).
- A fair split is:
  - **direction:** story, science and visual targets;
  - **session-built code:** all motion capability;
  - **HyperFrames:** a reliable deterministic recorder.
