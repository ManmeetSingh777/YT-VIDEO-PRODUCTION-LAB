# P02 diagnostic production rehearsal (generated from evidence by tests/p02/write_p02_reports.mjs)

Film: `hybrid_v2/work/p02/rehearsal/rt/film`. It is a DIAGNOSTIC namespace film built through the real intake API. Its content is fixture rasters, a simulated reviewer that is valid only inside the namespace, and a synthetic tone. The controller used for every phase is `engine/tools/production_run.mjs`.

## Phase A_first_run

- Run `DIAG-20261122115303-c3d250`: 25 events, chain head `c9902c3e6c2be4df…`.
- Tasks verified: 4/6 (66.7%). Failed: 1. Blocked: 1.
- Next operation: resolve attention_rt_world_shot.

| stage | status | verified/tasks | failed | blocked |
|---|---|---|---|---|
| S00_IDEA | COMMITTED | 1/1 | 0 | 0 |
| S01_STORY | COMMITTED | 2/2 | 0 | 0 |
| S02_EXPERIENCE | BLOCKED | 1/3 | 1 | 1 |
| S03_TIMING_MOTION | NOT_STARTED | 0/0 | 0 | 0 |
| S04_ART_DEMAND | NOT_STARTED | 0/0 | 0 | 0 |
| S05_ART_PRODUCTION | NOT_STARTED | 0/0 | 0 | 0 |
| S06_REGISTRATION_RIG | NOT_STARTED | 0/0 | 0 | 0 |
| S07_NEUTRINO_RENDER | NOT_STARTED | 0/0 | 0 | 0 |
| S08_QA_REPAIR | NOT_STARTED | 0/0 | 0 | 0 |
| S09_FILM_AUDIO_FINAL | NOT_STARTED | 0/0 | 0 | 0 |

    [why FAIL-S02_EXPERIENCE-attention_rt_world_shot-7fcc8e] first violated invariant: every attention target has a consuming track
        observed: primary_focus "cam_world" has no consuming track in [3600,7200)
        root producer: engine/story/experience.mjs#compileAttention owner EXPERIENCE_DIRECTOR class DIRECTION_OR_ATTENTION
        blast radius: ["direction_approval","S03_TIMING_MOTION","S04_ART_DEMAND","S05_ART_PRODUCTION","S06_REGISTRATION_RIG","S07_NEUTRINO_RENDER","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S02_EXPERIENCE retry_safe false

- verify: chain ok=true, 25 events; handoffs S00:ok, S01:ok

## Phase B_after_repair

- Run `DIAG-20261122124608-09f44d`: 158 events, chain head `bcff7c880a5acb7d…`.
- Tasks verified: 34/47 (72.3%). Failed: 12. Blocked: 1.
- Next operation: resolve chunk_0_600.

| stage | status | verified/tasks | failed | blocked |
|---|---|---|---|---|
| S00_IDEA | COMMITTED | 1/1 | 0 | 0 |
| S01_STORY | COMMITTED | 2/2 | 0 | 0 |
| S02_EXPERIENCE | COMMITTED | 3/3 | 0 | 0 |
| S03_TIMING_MOTION | COMMITTED | 5/5 | 0 | 0 |
| S04_ART_DEMAND | COMMITTED | 6/6 | 0 | 0 |
| S05_ART_PRODUCTION | COMMITTED | 8/8 | 0 | 0 |
| S06_REGISTRATION_RIG | COMMITTED | 9/9 | 0 | 0 |
| S07_NEUTRINO_RENDER | BLOCKED | 0/13 | 12 | 1 |
| S08_QA_REPAIR | NOT_STARTED | 0/0 | 0 | 0 |
| S09_FILM_AUDIO_FINAL | NOT_STARTED | 0/0 | 0 | 0 |

    [why FAIL-S07_NEUTRINO_RENDER-chunk_0_600-ec9426] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_600_1200-7861bd] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1200_1800-452cdb] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1800_2400-13cf99] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_2400_3000-19b359] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3000_3600-8ff848] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3600_4200-d457f0] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_4200_4800-088015] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_4800_5400-66874b] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_5400_6000-0748d8] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_6000_6600-7520fd] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_6600_7200-4ee41b] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true

- verify: chain ok=true, 158 events; handoffs S00:ok, S01:ok, S02:ok, S03:ok, S04:ok, S05:ok, S06:ok

## Phase C_resume_after_code_change

- Run `DIAG-20261122124608-09f44d`: 160 events, chain head `e5bfb8883e718860…`.
- Tasks verified: 34/47 (72.3%). Failed: 12. Blocked: 1.
- Next operation: resolve chunk_0_600.

| stage | status | verified/tasks | failed | blocked |
|---|---|---|---|---|
| S00_IDEA | COMMITTED | 1/1 | 0 | 0 |
| S01_STORY | COMMITTED | 2/2 | 0 | 0 |
| S02_EXPERIENCE | COMMITTED | 3/3 | 0 | 0 |
| S03_TIMING_MOTION | COMMITTED | 5/5 | 0 | 0 |
| S04_ART_DEMAND | COMMITTED | 6/6 | 0 | 0 |
| S05_ART_PRODUCTION | COMMITTED | 8/8 | 0 | 0 |
| S06_REGISTRATION_RIG | COMMITTED | 9/9 | 0 | 0 |
| S07_NEUTRINO_RENDER | BLOCKED | 0/13 | 12 | 1 |
| S08_QA_REPAIR | NOT_STARTED | 0/0 | 0 | 0 |
| S09_FILM_AUDIO_FINAL | NOT_STARTED | 0/0 | 0 | 0 |

    [why FAIL-S07_NEUTRINO_RENDER-chunk_0_600-ec9426] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_600_1200-7861bd] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1200_1800-452cdb] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1800_2400-13cf99] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_2400_3000-19b359] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3000_3600-8ff848] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3600_4200-d457f0] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_4200_4800-088015] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_4800_5400-66874b] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_5400_6000-0748d8] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_6000_6600-7520fd] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_6600_7200-4ee41b] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: EXCEPTION: t.run is not a function
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true

- verify: chain ok=true, 160 events; handoffs S00:STALE/producer source changed since the handoff (stale), S01:STALE/producer source changed since the handoff (stale), S02:STALE/producer source changed since the handoff (stale), S03:STALE/producer source changed since the handoff (stale), S04:STALE/producer source changed since the handoff (stale), S05:STALE/producer source changed since the handoff (stale), S06:STALE/producer source changed since the handoff (stale)

## Phase D_full_run

    [why FAIL-S07_NEUTRINO_RENDER-chunk_0_600-7a86ba] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: RENDER_CAPTURE_FAILURE: frame 420: INVALID_FRAME 420.0625
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
## Phase F_full_run_stopped

## Phase G_final_full_run

- Run `DIAG-20261122131103-9255ef`: 195 events, chain head `0f6ced5a59ded662…`.
- Tasks verified: 51/59 (86.4%). Failed: 8. Blocked: 0.
- Next operation: resolve chunk_0_600.

| stage | status | verified/tasks | failed | blocked |
|---|---|---|---|---|
| S00_IDEA | COMMITTED | 1/1 | 0 | 0 |
| S01_STORY | COMMITTED | 2/2 | 0 | 0 |
| S02_EXPERIENCE | COMMITTED | 3/3 | 0 | 0 |
| S03_TIMING_MOTION | COMMITTED | 5/5 | 0 | 0 |
| S04_ART_DEMAND | COMMITTED | 10/10 | 0 | 0 |
| S05_ART_PRODUCTION | COMMITTED | 12/12 | 0 | 0 |
| S06_REGISTRATION_RIG | COMMITTED | 13/13 | 0 | 0 |
| S07_NEUTRINO_RENDER | BLOCKED | 5/13 | 8 | 0 |
| S08_QA_REPAIR | NOT_STARTED | 0/0 | 0 | 0 |
| S09_FILM_AUDIO_FINAL | NOT_STARTED | 0/0 | 0 | 0 |

    [why FAIL-S07_NEUTRINO_RENDER-chunk_0_600-0752f6] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":0,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028448},{"frame":1,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028448},{"frame":2,"kind":"UNCOVERED
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true
    [why FAIL-S07_NEUTRINO_RENDER-chunk_600_1200-9ee2db] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":600,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":601,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":601,"kind":"FRO
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner MOTION_COMPILER class MOTION_OR_CAMERA
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe false
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1200_1800-133a7e] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":1200,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":1200,"kind":"FROZEN_FRAME","reason":"expected scene state changed but the rendered p
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner MOTION_COMPILER class MOTION_OR_CAMERA
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe false
    [why FAIL-S07_NEUTRINO_RENDER-chunk_1800_2400-76fd03] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":1800,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":1800,"kind":"FROZEN_FRAME","reason":"expected scene state changed but the rendered p
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner MOTION_COMPILER class MOTION_OR_CAMERA
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe false
    [why FAIL-S07_NEUTRINO_RENDER-chunk_2400_3000-ef52da] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":2400,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":2400,"kind":"FROZEN_FRAME","reason":"expected scene state changed but the rendered p
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner MOTION_COMPILER class MOTION_OR_CAMERA
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe false
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3000_3600-69576c] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":3000,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":2028602},{"frame":3000,"kind":"FROZEN_FRAME","reason":"expected scene state changed but the rendered p
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner MOTION_COMPILER class MOTION_OR_CAMERA
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe false
    [why FAIL-S07_NEUTRINO_RENDER-chunk_3600_4200-0988a2] first violated invariant: exact frame count, 1920x1080, 60/1; no defect; absolute seeking
        observed: probe {"codec":"ffv1","width":1920,"height":1080,"r_frame_rate":"60/1","frames":600,"video_duration":10,"audio_duration":null} defects [{"frame":3600,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":1262400},{"frame":3601,"kind":"UNCOVERED_EDGE","count":6000,"sentinel":1262400},{"frame":3602,"kind":"
        root producer: engine/film/segment_render.mjs#renderFilm (art_bridge_chrome_frames) owner RENDER_PRODUCER class RENDER_OR_MEMORY
        blast radius: ["assemble","S08_QA_REPAIR","S09_FILM_AUDIO_FINAL"]
        resume from S07_NEUTRINO_RENDER retry_safe true

- verify: chain ok=true, 195 events; handoffs S00:ok, S01:ok, S02:ok, S03:ok, S04:ok, S05:ok, S06:ok

## Intentional failure injected at every stage (P02-R23)

| injection | first failure stage/task | class | repair owner | blast radius |
|---|---|---|---|---|
| s08_mp4 | S08_QA_REPAIR/(handoff gate) | QA_EVIDENCE_INVALID | — | 0 nodes |
| s09_audio | S09_FILM_AUDIO_FINAL/final_media | AUDIO_ALIGNMENT | — | 0 nodes |

