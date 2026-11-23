// ONE authoritative state timeline per rig over the complete film (P04 §3.1; S1, S2). Pose, view and every declared channel (expression, eyes,
// mouth, hand, clothing, lighting, occlusion) have a single history: the last event ≤ f wins, across actions and shots, with NO reset to defaults
// at an action boundary. A state resets only when the contract says so (action.state_reset === true, or a typed time jump naming the element).
// Consumers — artwork demand, feasibility, the motion compiler, the scene graph, rendered QA, the continuity checker — all read this timeline.
//
// Event priority (explicit, numeric, order-independent): DIRECTOR(100) > ACTING(10) > DEFAULT(0). Two events of EQUAL priority that disagree at
// the same frame on the same channel are a STATE_CONFLICT (never resolved by array order); an identical duplicate is fine.
import { err } from "./errors.mjs";
export const PRIORITY = Object.freeze({ DIRECTOR: 100, ACTING: 10, DEFAULT: 0 });
export const priorityOf = (source) => { const s = String(source ?? ""); return s.startsWith("acting") ? PRIORITY.ACTING : PRIORITY.DIRECTOR; };
/** canonical event order: frame, then priority (high first), then channel, then state, then source — total and independent of input order */
export const eventOrder = (p, q) => p.frame - q.frame || (q.priority ?? priorityOf(q.source)) - (p.priority ?? priorityOf(p.source)) || String(p.channel).localeCompare(String(q.channel)) || String(p.state).localeCompare(String(q.state)) || String(p.source).localeCompare(String(q.source));
/** resolve equal-frame, equal-priority contradictions on the same key: identical → dedup; different → STATE_CONFLICT errors */
export function resolveConflicts(events, keyOf, { rig = null } = {}) {
  const errors = [], out = []; const groups = new Map();
  for (const e of events) { const k = `${keyOf(e)}|${e.frame}|${e.priority ?? priorityOf(e.source)}`; (groups.get(k) || groups.set(k, []).get(k)).push(e); }
  for (const [k, g] of groups) { const states = [...new Set(g.map((e) => e.state))]; if (states.length > 1) errors.push(err("STATE_CONFLICT", { record_id: `${rig ?? ""}${rig ? "." : ""}${k.split("|")[0]}`, frame_range: [g[0].frame, g[0].frame + 1], reason: `equal-priority events disagree at frame ${g[0].frame}: ${g.map((e) => `${e.state} (${e.source})`).join(" vs ")}`, producer: "engine/art_bridge/state_timeline.mjs#resolveConflicts" })); }
  const seen = new Set(); for (const e of [...events].sort(eventOrder)) { const k = `${keyOf(e)}|${e.frame}|${e.state}|${e.priority ?? priorityOf(e.source)}`; if (seen.has(k)) continue; seen.add(k); out.push(e); }
  // a lower-priority event at the same frame as a higher one never takes effect there (the higher wins the frame)
  return { events: out, errors };
}
/** pose/view events of one rig over the whole film (film order), validated against its declared states */
export function rigPoseTimeline(rig, actions) {
  const pose = [], view = [], resets = [], own = new Set([...rig.pose_states, ...rig.view_states].map((s) => s.id)), ids = new Set(rig.pose_states.map((s) => s.id));
  for (const a of actions) if (a.actors?.some((x) => x.rig_id === rig.id)) { if (a.state_reset === true) resets.push(a.frame_range[0]);
    for (const e of a.pose_events || []) if (ids.has(e.state_id)) pose.push({ frame: e.frame, state: e.state_id, channel: "POSE", source: a.id, shot: a.shot_id });
    for (const e of a.view_events || []) if (own.has(e.to_state)) view.push({ frame: e.frame, state: e.to_state, channel: "VIEW", source: a.id, shot: a.shot_id }); }
  const p = resolveConflicts(pose, () => "POSE", { rig: rig.id }), v = resolveConflicts(view, () => "VIEW", { rig: rig.id });
  return { pose: p.events, view: v.events, resets: resets.sort((x, y) => x - y), errors: [...p.errors, ...v.errors] };
}
/** pose and view of a rig at frame f: the last event ≤ f (since the last declared reset); defaults when none yet */
export function poseAt(rig, tl, f) { const lastReset = tl.resets.filter((r) => r <= f).at(-1) ?? -1; let pose = rig.pose_states[0]?.id ?? null, view = null; for (const e of tl.pose) { if (e.frame > f) break; if (e.frame >= lastReset) pose = e.state; } for (const e of tl.view) { if (e.frame > f) break; if (e.frame >= lastReset) view = e.state; } return { pose, view }; }
/** full timeline of a rig (pose, view, channels) — the single history every consumer reads */
export function buildRigTimeline(rig, actions, channelEvents = []) { const pv = rigPoseTimeline(rig, actions), ch = resolveConflicts(channelEvents.map((e) => ({ ...e, priority: e.priority ?? priorityOf(e.source) })), (e) => e.channel, { rig: rig.id }); return { rig: rig.id, pose: pv.pose, view: pv.view, channels: ch.events, resets: pv.resets, errors: [...pv.errors, ...ch.errors] }; }
