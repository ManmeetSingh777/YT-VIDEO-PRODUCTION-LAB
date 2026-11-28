# E01 physical motion producer: first solve on approved geometry (2026-11-28)

Producer: `engine/art_bridge/physical_motion.mjs`, test PM-1.
- Measured joint tree and FK.
- Two-bone IK. It keeps the anatomical bend direction of the rest pose and reports reach beyond the bone lengths instead of stretching.
- Prop pose from socket pairs.

## Mia's opening award hold [0,225): directed "both grips at sternum, plaque below chin"
- **Inputs (approved, measured only):**
  - Mia's registered rig (pelvis, chest, shoulders, elbows, wrists, palm and chin landmarks).
  - The award master's landmarks (grip span 109.5 stage px, top, base).
  - The packet's directed root placement for Mia (998,1020).
- **Directed composition holds:** chest at world (1007,810); award centred under it, grips at y=810. The plaque top lands at y=736, 6 px below the chin (y=730).
- **Defect 1, award grip naming is mirrored.** The contact events pair CHAR_MIA.palm_r with PROP_AWARD.grip_r, but the award master's grip_r is its screen-RIGHT handle. Mia faces the camera with her anatomical right hand on screen-left, so that pairing makes the forearms CROSS (solver: crossed = true). The screen-consistent pairing does not cross. Fix: re-register the award master with grip/handle_axis labels swapped (same pixels and landmark coordinates); this needs your re-signature of the award master.
- **Defect 2, the hold needs dedicated arm drawings.** Both handles sit ~45 px below the shoulders, so the solved elbow flexion is 168–169°: the forearm folds back over the upper arm in 2D. Rotating the master's extended arm drawings that far overlaps them, which the directive forbids ("no rubber stretching / implausible joint bending"). The award-holding poses need pose-matched (foreshortened) arm drawings. This is an established missing physical requirement; it is not covered by any V6 request.
- **Not solved yet:**
  - The lowering and counter transfer [225,320): the restaurant and actor world frames are not reconciled. The restaurant is registered in its 2x raster frame with its root landmark at world (0,0), while actors stand at stage coordinates, so the counter's world position cannot be derived without a placement transform. Recorded as an unresolved binding; no transform is guessed.
  - LEAD, REGULAR, gait, the phone, the report exchange and the camera: no approved geometry for those families yet.
