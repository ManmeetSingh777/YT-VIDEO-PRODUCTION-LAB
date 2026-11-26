# E01: scratch voice + rough animatic handoff (real takes, measured timing; nothing estimated is accepted)

The engine refuses typed or estimated word timing (`audio_cues.mjs` → `MISSING_WORD_ALIGNMENT`; P06 `speak` needs `alignment_source: "MEASURED"`).
This is the workflow that produces timing the engine will accept. It invents no word timings.

## 1. Record
- **Lines in phase 1 [0,960), all estimated today:**
  - AUD03 regular "Hold it up, Mia. Big smile." (pre-roll)
  - AUD12 Mia "Too much?" (pre-roll)
  - AUD20 regular chuckle
  - AUD13 lead "Mia? Yesterday's numbers."
  - AUD02 Mia "Thanks."
  - AUD14 regular "At this rate, you're gonna need a bigger place."
  - AUD09 Mia "Let's get through today."
- **Format:** WAV, **48 kHz**, mono, 24-bit PCM, no processing. One file per take.
  - Name: `E01_<cue>_<character>_T<nn>.wav` (e.g. `E01_AUD09_MIA_T03.wav`).
  - Keep every take; mark the chosen one.
- **Read each line at natural speed first.** Then do one take aimed at the estimate. **Do not time-stretch** to fit the director's frames.
- **Per take, record:** take id, actor, sample rate, sha256 (Claude computes it), and notes (breath, chuckle, overlap).

## 2. Measure (forced alignment, local, free)
- Align each chosen take to its exact text with a forced aligner, for example WhisperX or the Montreal Forced Aligner. Either runs locally; no paid
  API.
- **Output per word:** `{ "w", "start_s", "end_s" }`, measured from the audio.
- **Engine cue record:**
  `{ cue_id, start_frame (absolute film frame where the take is placed), audio_file, audio_sha256, alignment_source: "MEASURED", alignment_method: "<tool + version>", words }`.
- **Sample clock:** 800 samples per frame at 48 kHz/60 fps. Phase 1 is samples [0, 768000). The qualified extract is [144000, 768000).

## 3. Rough animatic (PREVIS ONLY)
- Lay the chosen takes on the absolute timeline at natural timing.
- Use the PREVIS blocking boards (`previs/SH0*_blocking_previs.svg`) or temporary drawings marked PREVIS ONLY. **No final art.**
- Re-time the action table to the real takes. For example: if AUD09 ends at f866 instead of f861, A13/A14 and the A15 shutter move with it. Keep
  every causal order: photo after the reply; report below the crop before the late raise.
- GPT Creative issues a **new packet revision** with the measured frames and lists every changed id (CHANGE_IMPACT).
- Claude revalidates contacts, ownership checkpoints, the f180/f959 boundaries and the speech windows with
  `node tools/tbo/e01_v04_provisional_preflight.mjs`, then with the formal v1.1.0 preflight once the packet exists.

## 4. Review (user)
- Watch the animatic with sound at normal speed.
- Approve DEC-045 (voices and delivery) and the measured timeline **by the exact artifact hashes**.
- Scratch voices are acceptable for the animatic and for the first technical render. Final release needs the final recordings, through the same
  alignment step.
