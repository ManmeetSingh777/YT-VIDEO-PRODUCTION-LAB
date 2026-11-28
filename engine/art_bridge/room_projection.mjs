// Room projection (general): one pinhole camera over a level floor. A floor point at depth Z projects to y = horizon + f·Hc/Z, so an upright figure
// of real height H standing on floor line y projects to  P = (H / Hc) · (y − horizon)  — the same ratio k = H/Hc for every adult of that height.
//  - horizonFromLines: the horizon is the height where two images of parallel, level, receding lines meet (their vanishing point);
//  - statureAt(y): projected standing height of a reference adult on floor line y;
//  - floorForStature(P): the floor line where a figure of projected height P is correct at scale 1 (null if not inside the given floor range);
//  - stage(...): uniform scale + root placement that puts a measured figure's floor contact on floor line y. Nothing here knows a film.
const meet = ([a, b], [c, d]) => { const r = [b[0] - a[0], b[1] - a[1]], s = [d[0] - c[0], d[1] - c[1]], den = r[0] * s[1] - r[1] * s[0]; if (Math.abs(den) < 1e-12) return null; const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den; return [a[0] + t * r[0], a[1] + t * r[1]]; };
export function horizonFromLines(l1, l2) { const vp = meet(l1, l2); if (!vp) throw new Error("the two lines are parallel in the image: no vanishing point"); return { horizon: vp[1], vanishing_point: vp }; }
export function roomProjection({ horizon, reference }) { // reference: { stature_px, floor_y } of a measured upright adult (e.g. a directed lead character)
  const k = reference.stature_px / (reference.floor_y - horizon); if (!(k > 0)) throw new Error("reference figure must stand below the horizon");
  const statureAt = (y) => k * (y - horizon), floorForStature = (P, [ymin, ymax] = [-Infinity, Infinity]) => { const y = horizon + P / k; return y >= ymin && y <= ymax ? y : null; };
  /** stage a measured figure: rel = offsets from its rig root at scale 1 {floor:[dx,dy]} and its measured projected stature P0 at scale 1 */
  const stage = ({ P0, rel, floor_y, root_x }) => { const s = statureAt(floor_y) / P0; return { scale: s, root_world_xy: [root_x, floor_y - rel.floor[1] * s], floor_y, stature_px: statureAt(floor_y) }; };
  return { horizon, k, statureAt, floorForStature, stage };
}
