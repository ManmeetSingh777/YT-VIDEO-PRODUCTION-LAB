# Gate A — false assertions in existing machinery: PASS (8/8 regression cases)

Run: `node engine/methods/proofs/gateA.mjs` → `engine/methods/evidence/stage1/GATE_A.json`.
Baseline: checkpoint `96075ca`, byte-identical to the audit snapshot.

| # | Observed failure before (audit snapshot) | Verified correction after (live code) |
|---|---|---|
| 1 | `mint('F99','totallyInvented',{d})` reached `compose()`. `mint` only checked for a non-empty method string and a path starting with `M`. | `emit.mjs`: regions can be emitted only inside a live call of a producer registered from the frozen `bindings.mjs CATALOG`, and only for the F-ids that producer is catalogued for. `F99` emit → refused (no live producer call). Naked object → `compose` refused. Unknown producer id → `registerProducer` refused. A registered contour still composes. Receipts record traced reads, region ids and the implementation hash. |
| 2 | `solvePalette` returned `pass:false` but its roles were still accepted by `assertSolved`. An `edge` channel claimed success with no geometry. | `palette.mjs`: an unsolved relation throws `PaletteUnsatisfied`, so nothing is registered as solved. `emitEdges` creates owned trim along the real shared boundary (`sharedBoundary`); a missing binding or missing boundary throws. `deriveAdjacency` derives pairs from region masks. Test: contrast 25 refused; edge trim emitted (1 region, 639 px changed). |
| 3 | F49/F50 passed with `perturb=[]`. Reads inside `need()` counted as "consumed". | `proof.mjs`: every proof is classed. ART/GEOMETRY proofs need ≥1 region-changing perturbation whose **raster pixel diff** lies inside the changed regions' footprints. Empty perturbation lists fail. Evidence gates need an accepted record **and** a refusal. `core.mjs` excludes reads made during validation (`VALIDATING`). |
| 4a | F14's only causal test changed the body producer, not F14's `CHANGE` table. | The gateA case perturbs the change class itself: `soft_swell` → owns a new drawing; `minor_rigid` → does not. `material_light` with a geometry change is refused; `soft_swell` without a redraw is refused. |
| 4b | F49/F50 PASS rested on refusals only. | A real valid job compiles and a broken endpoint is refused. F50: VISIBLE_PASS without a file is refused; a real file without an independent look test → `qualified=false`. |
| 4c | F53's `viewer_first_point`/`causal_path` were validated, then echoed; budgets ignored them. | `density.allocate`: attention node ids, hop distance to the causal path over the declared attention graph, and director-recorded coefficients (`decisionId`) set count, scale and contrast. Swapping the path A→B moves emphasis: rowA 10/2 → 2/10, 64 rendered px changed, T1 kept. |
| 5 | F80 `{producer, param}` strings passed with no executed call. A witness hash was treated as the applied source. | `provider.firstPassControl` binds each decision to an **executed receipt** whose traced reads include the parameter; fabricated bindings throw. Without viewed-pixel observations the status is `EVIDENCE_NOT_VIEWED` and `artisticCertification:false`. |
| 6 | `assemble` returned `pass:false`, `weightFailure` was a note, and `ownLayers` returned `pass:false`; rendering continued. | These now throw (non-renderable): F59 joint failure, F66 unsupported held pose, F79 coverage failure (unless the caller explicitly requests a non-strict measurement), F22 unregistered relight, unsolved palette. |

## Hidden failures the corrected machinery exposed in the old proof fixtures
These were previously reported as PASS:
- **F07** diagnostic creature: the neck part does not overlap the torso (a detached joint).
- **F14** fixture: the "reach" state is an unsupported held pose.
- **Routing proofs (F19/F20/F34/F37/F55/F57/F64)** return names and dispatch no producer. They now fail as `ROUTING` until real dispatch exists (Gate D).
- **Palette (F03/F61), vegetation placement (F69) and scale (F73)** change data but not pixels. They now fail as ART proofs until their decisions reach rendered regions (Gate B).

A passing basic suite is not an artistic pass. No art quality is claimed by Gate A.
