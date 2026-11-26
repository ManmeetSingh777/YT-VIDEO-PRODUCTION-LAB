// Continuous action lifetime vs shot visibility (E01 P3.2 packet: A01 [0,960), A03 [0,882), A27 [404,960) run through the f444 and f588 cuts).
//
// An action normally lives inside the one shot that owns it (action.shot_id). A CONTINUOUS PARENT ACTION declares `shot_span`: the contiguous,
// time-ordered shots it lives through. shot_span[0] is its owning shot_id, where it starts. Its id, absolute interval, phases, events, contacts,
// owners and motion curves are those of ONE action. A cut changes what the camera shows, never the action: nothing restarts, resets, releases,
// re-grips or duplicates at the cut, because every producer evaluates the action on the film's absolute frame clock.
//
// Consumers that work per shot (scene graph, framing, coverage, asset registry, per-shot direction events) ask actionInShot(a, shot) instead of
// comparing a.shot_id. Consumers that need shot-local records use shotSegments(): deterministic transport fragments that carry the parent's lineage
// and absolute frames, and that verifySegments() proves tile the parent exactly (no gap, no overlap, every event exactly once, no contact
// re-started or released at a cut).
//
// The strict per-shot rule is unchanged for every action that does not declare a span. A declared span is checked harder (validateShotSpan): it
// must be needed, contiguous, start in the owning shot, end in the last listed shot, stay in one world, and cross only joins whose transition states
// a continuity invariant.
export const actionShots = (a) => (Array.isArray(a?.shot_span) && a.shot_span.length ? a.shot_span : [a?.shot_id]);
export const actionInShot = (a, shotId) => actionShots(a).includes(shotId);
const rangeOf = (x) => x.frames || x.frame_range || (Number.isFinite(x.start_frame) ? [x.start_frame, x.end_frame] : null);

/** validateShotSpan(action, {shots: Map id→{frames, world_id}, transitions: [{from_shot,to_shot,continuity_invariant}]}) → [{code, reason}] */
export function validateShotSpan(a, { shots, transitions = [] }) {
  const out = [], no = (code, reason) => out.push({ code, reason }), span = a.shot_span, fr = rangeOf(a);
  if (!Array.isArray(span) || span.length < 2) { no("SHOT_SPAN_INVALID", "a shot_span lists at least two shots (one shot is the ordinary owner)"); return out; }
  if (new Set(span).size !== span.length) no("SHOT_SPAN_INVALID", "a shot appears twice in shot_span");
  if (span[0] !== a.shot_id) no("SHOT_SPAN_INVALID", `shot_span must start with the owning shot ${a.shot_id}, not ${span[0]}`);
  const S = span.map((id) => [id, shots.get(id)]); for (const [id, s] of S) if (!s) no("UNKNOWN_SHOT", `shot_span names unknown shot ${id}`);
  if (out.length) return out;
  const R = (s) => rangeOf(s);
  for (let i = 1; i < S.length; i++) { const [pid, p] = S[i - 1], [id, s] = S[i];
    if (R(p)[1] !== R(s)[0]) no("SHOT_SPAN_NOT_CONTIGUOUS", `${pid} ends at ${R(p)[1]} but ${id} starts at ${R(s)[0]}: a continuous action cannot skip footage`);
    if ((p.world_id ?? null) !== (s.world_id ?? null)) no("SHOT_SPAN_WORLD_CHANGE", `${pid} (${p.world_id}) → ${id} (${s.world_id}): one action cannot continue into another world`);
    const t = transitions.find((x) => x.from_shot === pid && x.to_shot === id);
    if (!t) no("SHOT_SPAN_JOIN_UNDECLARED", `no transition joins ${pid} → ${id}`);
    else if (typeof t.continuity_invariant !== "string" || t.continuity_invariant.trim().length < 8) no("SHOT_SPAN_JOIN_UNDECLARED", `the ${pid} → ${id} transition states no continuity invariant, so nothing says the action survives the join`); }
  const first = R(S[0][1]), last = R(S.at(-1)[1]);
  if (!(first[0] <= fr[0] && fr[0] < first[1])) no("INTERVAL_OUTSIDE_OWNER", `[${fr}] does not start inside its owning shot ${span[0]} [${first}]`);
  if (!(last[0] < fr[1] && fr[1] <= last[1])) no("INTERVAL_OUTSIDE_OWNER", `[${fr}] does not end inside the last spanned shot ${span.at(-1)} [${last}]`);
  if (fr[1] <= first[1]) no("SHOT_SPAN_UNNEEDED", `[${fr}] fits inside ${span[0]}: declare no shot_span`);
  return out;
}

/** shotSegments(action, shots[]) → deterministic shot-local transport fragments of one parent action (sorted by frame) */
export function shotSegments(a, shots) {
  const fr = rangeOf(a), ids = actionShots(a), list = ids.map((id) => shots.find((s) => s.id === id)).filter(Boolean).map((s) => ({ id: s.id, r: rangeOf(s) })).sort((x, y) => x.r[0] - y.r[0]);
  const segs = [];
  for (const s of list) { const lo = Math.max(fr[0], s.r[0]), hi = Math.min(fr[1], s.r[1]); if (lo >= hi) continue;
    const inside = (f) => lo <= f && f < hi, clip = (r) => [Math.max(r[0], lo), Math.min(r[1], hi)];
    segs.push({ segment_id: `${a.id}@${s.id}`, parent_action_id: a.id, shot_id: s.id, frames: [lo, hi], parent_frames: fr.slice(), segment_index: segs.length,
      starts_parent: lo === fr[0], ends_parent: hi === fr[1], continues_from: null, continues_into: null,
      phases: (a.phases || []).filter((p) => p.frames[0] < hi && lo < p.frames[1]).map((p) => ({ name: p.name, frames: clip(p.frames), phase_frames: p.frames.slice(), continued_from_cut: p.frames[0] < lo, continues_past_cut: p.frames[1] > hi })),
      events: ["pose_events", "view_events", "state_events"].flatMap((k) => (a[k] || []).filter((e) => inside(e.frame)).map((e) => ({ list: k, index: a[k].indexOf(e), frame: e.frame }))),
      contacts: (a.contact_events || []).map((c, index) => ({ c, index, r: rangeOf(c) })).filter(({ r }) => r[0] < hi && lo < r[1]).map(({ c, index, r }) => ({ index, frames: clip(r), contact_frames: r.slice(), begins_here: r[0] >= lo, ends_here: r[1] <= hi, release_here: !!c.release_required && r[1] <= hi })) }); }
  for (let i = 0; i < segs.length; i++) { segs[i].segment_count = segs.length; if (i) segs[i].continues_from = segs[i - 1].segment_id; if (i < segs.length - 1) segs[i].continues_into = segs[i + 1].segment_id; }
  return segs;
}

/** verifySegments(action, segments) → {ok, failures[]}: the fragments ARE the parent action, cut into camera spans and nothing else */
export function verifySegments(a, segs) {
  const fr = rangeOf(a), f = [], no = (code, reason) => f.push({ code, reason });
  if (!segs.length) no("SEGMENT_COVERAGE", `${a.id}: no shot-local fragment`);
  let at = fr[0]; for (const s of segs) { if (s.parent_action_id !== a.id) no("SEGMENT_LINEAGE", `${s.segment_id} names parent ${s.parent_action_id}`); if (s.frames[0] !== at) no("SEGMENT_COVERAGE", `${s.segment_id} starts at ${s.frames[0]}, expected ${at} (gap or overlap)`); at = s.frames[1]; }
  if (at !== fr[1]) no("SEGMENT_COVERAGE", `fragments end at ${at}, the parent ends at ${fr[1]}`);
  for (const k of ["pose_events", "view_events", "state_events"]) (a[k] || []).forEach((e, i) => { const n = segs.flatMap((s) => s.events).filter((x) => x.list === k && x.index === i).length; if (n !== 1) no("SEGMENT_EVENT_COUNT", `${a.id} ${k}[${i}] at ${e.frame} appears in ${n} fragments (exactly 1 required: an event never repeats at a cut)`); });
  (a.contact_events || []).forEach((c, i) => { const parts = segs.flatMap((s) => s.contacts.filter((x) => x.index === i)), r = rangeOf(c);
    if (parts.filter((x) => x.begins_here).length !== 1) no("SEGMENT_CONTACT_RESTART", `${a.id} contact[${i}] begins ${parts.filter((x) => x.begins_here).length} times (a cut never re-grips)`);
    if (parts.filter((x) => x.release_here).length !== (c.release_required ? 1 : 0)) no("SEGMENT_CONTACT_RELEASE", `${a.id} contact[${i}] is released ${parts.filter((x) => x.release_here).length} times (a cut never releases)`);
    let p = r[0]; for (const x of parts) { if (x.frames[0] !== p) no("SEGMENT_CONTACT_GAP", `${a.id} contact[${i}] has a hole at ${p}`); p = x.frames[1]; } if (p !== r[1]) no("SEGMENT_CONTACT_GAP", `${a.id} contact[${i}] stops at ${p} instead of ${r[1]}`); });
  for (const ph of a.phases || []) { let p = ph.frames[0]; for (const x of segs.flatMap((s) => s.phases.filter((q) => q.name === ph.name))) { if (x.frames[0] !== p) no("SEGMENT_PHASE_GAP", `${a.id} phase ${ph.name} hole at ${p}`); p = x.frames[1]; } if (p !== ph.frames[1]) no("SEGMENT_PHASE_GAP", `${a.id} phase ${ph.name} stops at ${p}`); }
  return { ok: f.length === 0, failures: f };
}

/** shotLocalView(action, shot) → the action as one shot sees it: an unspanned action unchanged; a continuous parent action with its frames,
 *  events and contacts clipped to that shot, its absolute frames kept, and its lineage (parent_action_id, parent_frames) attached. Events
 *  outside the shot are omitted here and appear in the shot that contains them: each event exactly once (verifySegments). */
export function shotLocalView(a, shot) {
  if (!a.shot_span) return a; const fr = rangeOf(a), sr = rangeOf(shot), lo = Math.max(fr[0], sr[0]), hi = Math.min(fr[1], sr[1]), inside = (f) => lo <= f && f < hi;
  return { ...a, frames: [lo, hi], parent_action_id: a.id, parent_frames: fr.slice(), segment_id: `${a.id}@${shot.id}`,
    pose_events: (a.pose_events || []).filter((e) => inside(e.frame)), view_events: (a.view_events || []).filter((e) => inside(e.frame)), state_events: (a.state_events || []).filter((e) => inside(e.frame)),
    contact_events: (a.contact_events || []).filter((c) => rangeOf(c)[0] < hi && lo < rangeOf(c)[1]).map((c) => ({ ...c, frames: [Math.max(rangeOf(c)[0], lo), Math.min(rangeOf(c)[1], hi)], contact_frames: rangeOf(c).slice(), continued_from_cut: rangeOf(c)[0] < lo, continues_past_cut: rangeOf(c)[1] > hi, release_required: !!c.release_required && rangeOf(c)[1] <= hi })) };
}
