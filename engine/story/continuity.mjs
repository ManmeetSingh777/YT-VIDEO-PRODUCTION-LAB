// Shot boundary state continuity (directive G3; F015). Exit state of shot k is COMPUTED from its executed state tracks; the entry of shot
// k+1 must match for every shared element unless the cut declares an approved time jump / perceptual bridge naming exactly the changed
// elements. Nothing is "fixed" by editing one shot: a contradiction is a refusal that names both sides.
/** stateAt(tracks, element, frame) → value of the last key <= frame (tracks: {element: [[frame, value], ...]}) */
export function stateAt(tracks, element, frame) { const k = (tracks[element] || []).filter(([f]) => f <= frame).at(-1); return k ? k[1] : undefined; }
/** boundaryState(shot) → {element: value} at the shot's last frame (exit) or first frame (entry) */
export function boundaryState(shot, which) { const f = which === "exit" ? shot.frames[1] - 1 : shot.frames[0], out = {}; for (const el of Object.keys(shot.tracks || {})) { const v = which === "entry" ? (shot.tracks[el].find(([fr]) => fr <= f && fr >= shot.frames[0]) ?? shot.tracks[el].filter(([fr]) => fr <= f).at(-1) ?? shot.tracks[el][0])?.[1] : stateAt(shot.tracks, el, f); if (v !== undefined) out[el] = v; } return out; }
/** checkContinuity(shots, transitions) → errors; shots: [{id, frames:[s,e], tracks:{element:[[f,v]]}}]; transitions: [{from,to,kind,time_jump?:{elements:[], reason, approved_receipt?}}] */
export function checkContinuity(shots, transitions = []) {
  const errors = [], by = new Map(shots.map((s) => [s.id, s]));
  for (let i = 0; i + 1 < shots.length; i++) {
    const a = shots[i], b = shots[i + 1], t = transitions.find((x) => x.from === a.id && x.to === b.id) || { kind: "CUT" }, exit = boundaryState(a, "exit"), entry = boundaryState(b, "entry"), jump = new Set(t.time_jump?.elements || []);
    if (a.frames[1] !== b.frames[0]) errors.push({ code: "FRAME_TILING_GAP", record_id: `${a.id}->${b.id}`, reason: `shot ${a.id} ends at ${a.frames[1]} but ${b.id} starts at ${b.frames[0]}` });
    for (const el of Object.keys(exit)) if (el in entry && JSON.stringify(exit[el]) !== JSON.stringify(entry[el])) {
      if (jump.has(el) && t.time_jump?.reason && t.time_jump?.approved_receipt) continue;
      errors.push({ code: "CONTINUITY_BREAK", record_id: `${a.id}->${b.id}`, frame_ranges: [[a.frames[1] - 1, b.frames[0] + 1]], reason: `${el}: exits ${a.id} as ${JSON.stringify(exit[el])} but enters ${b.id} as ${JSON.stringify(entry[el])}${jump.has(el) ? " (time jump declared but not approved/reasoned)" : ""}`, dependency_ids: [el], required_art_or_operation: ["restage one side within approved direction, or declare + approve a time jump / insert"] });
    }
  }
  return errors;
}
