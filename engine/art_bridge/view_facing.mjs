// View-direction metadata and target-projection validation (general; film geography is film data).
// Screen direction is measured from the drawing itself, never inferred from anatomical rig labels (a character's right hand is on SCREEN-LEFT
// when the character faces the camera). Head facing: in a three-quarter view the NEAR eye and the visible ear lie on the side turned toward the
// camera, so the face points to the opposite screen side; the nose sits toward the facing side of the eye midpoint; pupils sit toward the gaze side
// of their sclera. Every cue must agree, otherwise the view is AMBIGUOUS and must be reviewed.
import { err } from "./errors.mjs";
const P = "engine/art_bridge/view_facing.mjs", side = (dx, tol) => (dx < -tol ? "SCREEN_LEFT" : dx > tol ? "SCREEN_RIGHT" : "FRONT");

/** headFacing({eye_near, eye_far, ear?, nose?, pupils?: [{pupil:[x,y], sclera:[x,y]}...]}, {tol}) → {facing, gaze, cues} */
export function headFacing(m, { tol = 3 } = {}) {
  if (!m?.eye_near || !m?.eye_far) throw err("SCHEMA_VIOLATION", { reason: "head facing needs eye_near and eye_far", producer: P });
  const mid = [(m.eye_near[0] + m.eye_far[0]) / 2, (m.eye_near[1] + m.eye_far[1]) / 2], cues = {};
  cues.near_eye = side(m.eye_far[0] - m.eye_near[0], tol);                     // near eye on the right → faces left
  if (m.ear) cues.ear = side(mid[0] - m.ear[0], tol);                          // visible ear on the right → faces left
  const em = m.pupils?.length === 2 ? (m.pupils[0].sclera[0] + m.pupils[1].sclera[0]) / 2 : mid[0]; // eye-white midpoint when measured (landmarks sit near the pupils)
  if (m.nose) cues.nose = side(m.nose[0] - em, tol);                           // nose left of the eye midpoint → faces left
  const facingVotes = Object.values(cues), facing = facingVotes.every((v) => v === facingVotes[0]) ? facingVotes[0] : "AMBIGUOUS";
  let gaze = null; if (m.pupils?.length) { const g = m.pupils.map((p) => side(p.pupil[0] - p.sclera[0], 1)); gaze = g.every((v) => v === g[0]) ? g[0] : "AMBIGUOUS"; cues.gaze = gaze; }
  return { facing, gaze, cues };
}

/** validateViewTargets({targets: {view_key: {screen_side|accept:[...], target}}, measured: {asset: {view_key, facing, gaze}}}) → failures[] */
export function validateViewTargets({ targets, measured }) {
  const out = [];
  for (const [asset, m] of Object.entries(measured)) { const t = targets[m.view_key];
    if (!t) { out.push({ code: "VIEW_KEY_UNDECLARED", record_id: asset, reason: `view key ${m.view_key} has no declared target in the film's view geography` }); continue; }
    const ok = new Set(t.accept || [t.screen_side]);
    if (m.facing === "AMBIGUOUS" || !ok.has(m.facing)) out.push({ code: "VIEW_TARGET_MISMATCH", record_id: asset, reason: `${asset} is labelled ${m.view_key} (target ${t.target}, expected ${[...ok].join("|")}) but its drawing faces ${m.facing}` });
    if (m.gaze && t.gaze_accept && !t.gaze_accept.includes(m.gaze)) out.push({ code: "VIEW_GAZE_MISMATCH", record_id: asset, reason: `${asset} gaze ${m.gaze} does not reach ${t.target} (${t.gaze_accept.join("|")})` }); }
  return out;
}
