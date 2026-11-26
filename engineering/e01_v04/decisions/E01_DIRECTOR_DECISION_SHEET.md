# E01 V0.4-DIR-P1: director decision sheet (for the user; nothing here is approved)

Every item below changes what is drawn or which engine route runs, so it must be decided before the first sealed ArtJob. Claude recommends;
**the user decides**, with GPT Creative if they want. The blocking previews in `previs/` are **PREVIS ONLY**: boxes placed at the positions the
director text states (for example "Mia center ~x.52 face y.40" and "page ~55–65% width"). They are not art and not geometry.

| Preview | Shot |
|---|---|
| `previs/SH01_blocking_previs.svg` | SH01 [0,432): medium-wide, locked |
| `previs/SH02_blocking_previs.svg` | SH02 [432,576): report insert |
| `previs/SH03_blocking_previs.svg` | SH03 [576,960): medium close, static |

## D1: Are the shift lead's legs visible in SH01?
- **Recommended: no.** The counter or staff lane crops the lead's feet. The director allows this ("grounded even if feet cropped").
  - The approach is staged as a root move with directed torso and head acting: weight settle on arrival, discreet gaze.
  - No walk producer is needed. The lead master is drawn waist-up plus hips.
- **Alternative: legs visible.** This needs an approved gait cel cycle (art cost: about 6–8 cels with planted-foot landmarks). Or engineering builds
  articulated PART_RIG walk first (`VERBS.walk.refused_routes.PART_RIG_2D`).
- **Effect on art:** the `LEAD.legs_feet` node is dropped (conditional), and the lead master framing is fixed.

## D2: How is the paper physically held?
- **Recommended: GRIP with WRAP topology.**
  - The thumb is on the front of the sheet (NEAR layer, above the page). The index and middle fingertips are behind it (FAR layer, below the page).
  - The contact patch is at the lower edge: the lead holds the lower-right, Mia the lower-left as seen on the front.
  - Each hand gets painted near and far finger layers. **A closed cartoon fist is never used**, and the profile's `single_layer_reason` must not
    apply to the page.
  - This runs today: P06 grip plus P07 shared support and hand-over, through `plan.grips` `near_far: "WRAP"` and `finger_layers`.
- **Alternative: a true PINCH producer.** It is not built. `compilePacket` now refuses PINCH; it is never dropped and never silently turned into a
  GRIP. Visually it would use the same painted layers; it adds only pinch-specific contact semantics. Building it is engineering work.
- **What the user decides:** approve "GRIP with WRAP near/far fingers" as the directed grasp, or ask for the PINCH producer first.

## D3: Screen sizes (they decide master resolution)
These are recommendations from the stated framing; the user confirms or adjusts.

| Shot | Mia's head height on screen | Other |
|---|---|---|
| SH01 | ≈ 110–130 px | regular and lead ≈ the same scale |
| SH03 | ≈ 230–270 px (≈ 2× SH01) | regular partially in the foreground, larger |
| SH02 | — | page ≈ 1150 px wide (60% of 1920) |

- Masters are drawn at **≥ 2× the largest on-screen size**. For Mia that means head ≥ 520 px in the master and the upper body (behind the counter)
  at native resolution. The same rule applies to the regular and the lead.
- **The SH02 insert** (page plate plus Mia's right hand and thumb) is its **own native drawing**, never an upscale.

## D4: Natural gradual expression
- **Recommended: approved inbetween expression cels**, as source-attached edits of the approved master, swapped on directed frames. This answers
  "not two discrete face swaps".
  - mock-regal → genuine grin: 1–2 inbetweens
  - grin → slipping smile → concerned: 2 inbetweens, asymmetric
  - concerned → social smile with concerned eyes (A13 [861,882)): 2 inbetweens
- **Alternative:** vector brow and mouth paths delivered as homologous VECTOR_PATH drawings, giving a registered morph (`execution.mjs#morphAt`).
  Raster faces cannot morph.

## D5: Mouth performance
- **Recommended for the first qualification: approve LIMITED rest/mid/open mouths** for each speaking character.
  - Mia gets three smile contexts: mock-regal ("Too much?"), smiling ("Thanks."), restrained smile ("Let's get through today.").
  - The lead and the regular get one context each.
  - Timing comes from MEASURED word alignment of the recorded lines; the result is syllable-timed, not phoneme-accurate.
  - Visemes are added only if playback review shows the limited mouth reads wrong.
- **Alternative: build a viseme producer**, plus about 8–10 phoneme mouths per character per smile context.

## D6: Photo framing and privacy
- **Recommended:**
  - The phone screen is never shown, and there is no flash.
  - The lens side faces Mia at A03 [825,882) and A15 [882,960) (a prop orientation state on the phone art).
  - The report is below the phone's implied frame by f807 (A13), and the award sits inside it (on the counter, lower centre in SH03).
  - **No executor can measure an unseen photo frustum,** so this is a human check in review. An optional QA overlay of the phone's frustum can be
    added as a review aid.

## Also needed with these decisions
- Approval of the scoped first production phase **[0,960)** (SH01–SH03, all original IDs, f0–179 pre-roll inside it). The f959 → f960 freeze is an
  outgoing obligation to the next phase; the full [0,1950) stays unapproved. See `E01_PHASE1_PACKET_PLAN.md`.
- The AUD11 split: it runs [861,987) across f960. Phase 1 can carry [861,960) with a "continues into the freeze phase" obligation, or GPT re-times
  it. This is a creative choice.
