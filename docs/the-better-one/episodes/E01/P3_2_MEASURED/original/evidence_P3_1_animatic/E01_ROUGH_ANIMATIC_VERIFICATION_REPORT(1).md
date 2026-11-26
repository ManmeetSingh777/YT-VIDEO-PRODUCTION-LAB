# E01 Phase 1 rough animatic: verification report

**Status: PREVIS ONLY.** This is temporary diagram drawing and temporary sound. It is **not** approved art, not measured rig geometry, not an approved animatic and not an engine packet. Nothing here has been signed off.

**What was checked:** all numbers below are machine checks, recorded in `verification/geometry_checks.json` and `verification/media_checks.json`. Nobody has yet watched the animatic at normal speed. That human review is the purpose of this deliverable.

## Deliverables (`E:\TBO_PRIVATE\E01_PHASE1_PREVIS\deliver\`)

| File | Measured |
|---|---|
| `E01_PHASE1_ROUGH_ANIMATIC.mp4` | **16.000 s**, 960 frames, 1920×1080, 60 fps, H.264 + AAC 48 kHz mono |
| `E01_QUALIFICATION_ROUGH_ANIMATIC.mp4` | **13.000 s**, 780 frames, phase frames [180, 960), audio samples [144000, 768000) |
| `E01_PHASE1_ANIMATIC_CONTACT_SHEET.png` | Rendered animatic frames at all 39 P3.1 board states (6×7 grid) |
| `*.srt` | Supplied subtitle sidecars, unchanged |
| `SHA256SUMS.txt` | Hashes of the deliverables, audio stems and f959 snapshot |

Supporting files sit beside `deliver\`:

- **`audio\`:** the lossless 48 kHz/24-bit mix (full and qualification), separate dialogue, ambience and SFX stems, and `SOUND_PROVENANCE_AND_PLACEMENT.json`.
- **`sfx\`:** the source downloads and saved license pages.
- **`verification\`:** the check results, plus the f959 outgoing state as `.json`, `.svg` and `.png`.
- **`scripts\`:** the full rebuild pipeline, run with `bash scripts/build_all.sh`.

## How it was made

- **Tools:** only tools already on this machine: the private Python venv (numpy, soundfile, soxr), ffmpeg 7.1, and the installed Chrome running headless to rasterize SVG frames. Nothing new was installed. The animation engine and the P08 worktree were not touched.
- **Boards as states, not cuts:** the 39 P3.1 boards are performance states inside three fixed cameras: SH01 [0,444), SH02 [444,588), SH03 [588,960).
- **In-betweens:** every element is matched board to board and its coordinates are interpolated with a monotone cubic. That means the exact board state lands on the board frame, nothing overshoots, and an element stays still wherever two boards agree.
- **Shape changes:** expression and contact-marker changes crossfade over at most 8 frames and finish on the board that introduces them.
- **Overlays:** board annotations and labels are stripped. A small "PREVIS ONLY" watermark and a shot/frame/time counter sit in the top corners.
- **Background activity:** added from action plan A01, because the boards show the background static apart from diner B:
  - diner A gestures f42–104 and settles by f136
  - one queue weight shift f600–670
  - small, unsynchronized holds for the seated diners
  - all background offsets are 0 at f959
- **Mouth movement:** a rough mouth-open overlay follows the supplied MEASURED MFA phone timeline, sampled at frame centres. For the AUD20 chuckle it follows the measured loudness of the approved REGULAR stem; no phone labels were invented.

## Verified

- **The 39 key boards are reproduced exactly on their frames:** 0 mismatches.
- **Cuts happen only at f444 and f588.** The frame-to-frame change is 49.95 at f444 and 50.02 at f588; the largest change inside a shot is 1.46.
  - There is no cut at f432 or f576, and no board-to-board cutting.
- **Award transfer at f296:**
  - The plaque's last movement is at f284 (base contact).
  - From f296 to f443 the plaque deviates by **0.0 px**, and it is also fixed throughout SH03.
  - It never drags, slides or lifts after f296.
- **Report transfer at f368:**
  - The page holds still from f360 to f368.
  - Mia's draw-in starts at f369, at 0.1 → 0.27 → 0.41 px per frame.
  - There is no teleport or flip. The largest per-frame step anywhere is 7.25 px, for Mia's right arm at f315.
- **The report insert is readable for all 144 frames (f444–587).**
  - The frames are pixel-identical outside the counter strip.
  - The literal values are YESTERDAY · Sales $3,210 · Operating result −$120 · LOSS.
  - Everything is readable by 9.783 s, before the 10 s target.
- **Dialogue placement is unchanged.**
  - The approved `E01_PHASE1_DIALOGUE_PREVIEW.wav` (SHA256 `c3363a1e…8832`, matching the approval record) is used verbatim from sample 0.
  - Mix minus ambience minus SFX equals the dialogue to within 1.2e-7.
  - The qualification preview was confirmed to be the exact PCM suffix [144000, 768000).
  - The encoded AAC sits at **0-sample lag** against the mix (correlation 0.99998), in both files.
- **Subtitles:**
  - Timing comes from `PHASE1_DIALOGUE.srt` at exact millisecond bounds; 496 frames carry a subtitle.
  - None appears during SH02.
  - **No subtitle overlaps** any face, arm or hand, the award, the report or the phone (a bounding-box check on every subtitle frame).
  - Placement: bottom-centre over the counter front in SH01, and left of centre in SH03 so it stays clear of the low report and Mia's right hand.
- **The 13 s extract is the same render's frames 180–959**, at 50.2 dB PSNR or better against the source frames. Its first frame is f180. The chuckle is not retriggered: it continues from the mix.
- **f959 outgoing state:** the last frame equals the F959 board, including the background. It is saved for the future freeze in `verification/F959_OUTGOING_STATE.json`, `.svg` and `.png`. No separate still was drawn.

## Temporary sound (all CC0 from Freesound; each license page saved)

| Cue | Placement (48 kHz samples) | Source |
|---|---|---|
| AUD01 restaurant bed | [0, 768000). About −2 dB gain, roughly 16 dB under dialogue RMS. Ducks −6 dB over f430–462, recovers f588–618, hard-cuts at f960. | #474740 "Restaurant ambience chatter" (mycompasstv), from 10.0 s in |
| AUD04 plaque base contact | Onset at sample 227200 (f284), soft, −10 dB, within [284, 304) | #387929 "Putting a Large Book Down" (rylandbrooks) |
| AUD05 paper transfer | [346, 386); the strongest rustle peak is aligned to the f368 release | #337812 "one a4 paper sheet grab" (shark510) |
| AUD06 page settle | [380, 416) | #466350 "PaperGrab" (Harrisando) |
| AUD10 shutter | **One** click, onset at sample 720000 (f900) | #483382 "Huawei P20 Pro Camera Shutter" (michx123). Only its first transient is used. |

- **Not added:** AUD07 (score is optional in the plan). AUD11 [861,960) is carried by the same bed, so there's no duplicate. The successor's room tail [960,987) is an obligation for later and is not rendered.
- **Mix peak:** −7.6 dBFS.

## Remaining visual and timing issues for review

1. **The award hides Mia's mouth and lower face during "Too much?" (about f110–173).** This comes from boards F119 and F150, which raise the plaque to her lower face. Her amused eyes stay visible but the delivery doesn't. **This needs a composition decision.**
2. **Expressions are hard to read at SH01 scale** (head about 120 px). The genuine grin (f173–189), the loss recognition and the slipping smile (f416–444) show only as small line changes on the diagram faces. Judge whether SH01 can carry those beats or needs larger expression art or a different crop.
3. **Expression changes are crossfades, not animated shapes.** For example, the F180 grin completes over f172–180, whereas the spec has it emerging over [173, 189), so it lands up to 9 frames early. Mouths elsewhere also switch by crossfade.
4. **The lead enters with a horizontal slide** from off-frame right over f132–150, with no gait. Before f132 the lead is not drawn, as on the boards.
5. **Limbs are straight interpolations of the diagram paths.** Arm length varies slightly between key boards. Hand contacts are exact on board frames and wherever consecutive boards agree, but in between (for example the WRAP closure f350–360 and the reach f320–350) they are approximate. None of this is rig-constrained.
6. **Diner B's incline follows the boards** (out over f119→150, back over f180→225), not the plan's [136,184) and [184,216). Diner A's gesture is small and partly behind the table at this scale.
7. **SH02 has no residual settle over [444,456),** because boards F444, F456 and F587 are identical. The insert is fully static, which is the safest choice for readability.
8. **"Thanks." stays on screen only 0.48 s (29 frames).** That's probably too short to read. The exact reference bounds were kept; extending the caption needs separate editorial approval.
9. **The mouth overlay is diagnostic only.** Phones are sampled at frame centres, so a phone shorter than one frame may not show. The uncertain 30 ms phones are not specially treated. This overlay is not a viseme map.
10. **The shutter press reads weakly at f900.** Following the boards, the thumb marker fades in over f892–900 and disappears at f901. The press and release are tiny at SH03 scale. There is no flash and the screen is not shown, as directed.
11. **Photo privacy is only intended, not computed.** The report sits low and outside the intended photo framing per the boards; no lens frustum was calculated.
12. **The temporary sound has limits:**
    - The clips are Freesound's lossy HQ preview MP3s, not lossless originals.
    - The ambience is real crowd walla from a Vietnamese restaurant, so its language and character may not suit the world.
    - Bed and effect levels are a rough balance only.
13. **The MP4 audio is AAC (lossy).** The decoded extract runs 640 padding samples past 624000, although the container duration reads 13.000 s. The lossless, sample-exact mixes are the WAVs in `audio\`.

## Review gates that remain open

Several gates are still open:

- watching the full 16 s, then the exact 13 s extract, at normal speed
- approving the audiovisual placement, composition and blocking
- choosing real room, SFX and score sources and the mix
- the formal phase packet, P08 contracts, art jobs and signatures

Nothing in this report approves recordings, timing, art or the animatic.
