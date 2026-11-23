// Explicit art-state channels (P03 repair B). A rig's visible drawing per render slot is resolved from INDEPENDENT channels, never from the
// pose-state id: POSE (pose_states) and VIEW (view_states) as before, plus declared `state_channels` of kind EXPRESSION, EYES, MOUTH, HAND,
// CLOTHING, LIGHTING, OCCLUSION. Each channel owns a disjoint set of render slots and a list of approved states (each binds those slots to
// exact approved drawings). Channel state changes come from `action.state_events` ({frame, channel, state, rig?}) and from compiled acting
// events (blink, speech). Every change must resolve an approved drawing; a missing drawing is MISSING_ART_ASSET (→ ArtJob), an unknown state
// or channel is UNSUPPORTED_STATE_EDGE, and two channels claiming one slot is STATE_CHANNEL_CONFLICT. Nothing silently reuses a pose.
import { err } from "./errors.mjs";
import { resolveConflicts, priorityOf, rigPoseTimeline, poseAt, buildRigTimeline } from "./state_timeline.mjs";
export { rigPoseTimeline, poseAt, buildRigTimeline };
export const CHANNEL_KINDS = ["EXPRESSION", "EYES", "MOUTH", "HAND", "CLOTHING", "LIGHTING", "OCCLUSION"];
// precedence when building the final slot→drawing map: pose < view < channels (channels own their slots exclusively)
export function validateChannels(rig, { assets = null } = {}) {
  const errs = [], slots = new Set(rig.render_parts.map((p) => p.asset_id)), owner = new Map();
  for (const ch of rig.state_channels || []) {
    if (!CHANNEL_KINDS.includes(ch.kind)) errs.push(err("SCHEMA_VIOLATION", { record_id: `${rig.id}.${ch.id}`, reason: `channel kind ${ch.kind} is not one of ${CHANNEL_KINDS}` }));
    if (!ch.states?.length) errs.push(err("SCHEMA_VIOLATION", { record_id: `${rig.id}.${ch.id}`, reason: "a state channel needs approved states" }));
    if (ch.default && !ch.states?.some((s) => s.id === ch.default)) errs.push(err("UNSUPPORTED_STATE_EDGE", { record_id: `${rig.id}.${ch.id}`, reason: `default state ${ch.default} is not a state of the channel` }));
    for (const s of ch.slots || []) { if (!slots.has(s)) errs.push(err("UNKNOWN_REFERENCE", { record_id: `${rig.id}.${ch.id}`, dependency: s, reason: `channel slot ${s} is not a render part of ${rig.id}` }));
      if (owner.has(s)) errs.push(err("STATE_CHANNEL_CONFLICT", { record_id: `${rig.id}.${s}`, reason: `slot ${s} is owned by channels ${owner.get(s)} and ${ch.id}` })); else owner.set(s, ch.id); }
    for (const st of ch.states || []) for (const [slot, aid] of Object.entries(st.asset_bindings || {})) {
      if (!(ch.slots || []).includes(slot)) errs.push(err("STATE_CHANNEL_CONFLICT", { record_id: `${rig.id}.${ch.id}.${st.id}`, dependency: slot, reason: `state binds slot ${slot}, which channel ${ch.id} does not own` }));
      if (assets && !assets.has(aid)) errs.push(err("MISSING_ART_ASSET", { record_id: aid, dependency: `${rig.id}.${ch.id}.${st.id}`, suggested_producer: "GPT state manufacture (source-attached edit of the approved master)", reason: `channel ${ch.id} state ${st.id} needs drawing ${aid} for slot ${slot}` })); } }
  return errs;
}
/** events of a rig's channels from actions (+ compiled acting events), validated; returns sorted [{frame, channel, state, source}] */
export function channelEvents(rig, actions, extra = []) {
  const chans = new Map((rig.state_channels || []).map((c) => [c.id, c])), out = [], errs = [];
  for (const a of actions) if (a.actors?.some((x) => x.rig_id === rig.id)) for (const e of a.state_events || []) {
    if (e.rig && e.rig !== rig.id) continue; const ch = chans.get(e.channel); if (!ch) { if (!e.rig && a.actors.length > 1) continue; errs.push(err("UNSUPPORTED_STATE_EDGE", { record_id: a.id, frame_range: [e.frame, e.frame + 1], reason: `state event names channel ${e.channel}, which rig ${rig.id} does not declare` })); continue; }
    if (!ch.states.some((s) => s.id === e.state)) { errs.push(err("UNSUPPORTED_STATE_EDGE", { record_id: a.id, frame_range: [e.frame, e.frame + 1], reason: `state ${e.state} is not an approved state of channel ${rig.id}.${e.channel}` })); continue; }
    if (e.frame < a.frame_range[0] || e.frame >= a.frame_range[1]) { errs.push(err("INVALID_FRAME_RANGE", { record_id: a.id, frame_range: [e.frame, e.frame + 1], reason: "state event outside its action" })); continue; }
    out.push({ frame: e.frame, channel: e.channel, state: e.state, source: a.id, shot: a.shot_id }); }
  for (const e of extra) if (e.rig === rig.id) { const ch = chans.get(e.channel); if (!ch || !ch.states.some((s) => s.id === e.state)) errs.push(err("UNSUPPORTED_STATE_EDGE", { record_id: `${rig.id}.${e.channel}`, frame_range: [e.frame, e.frame + 1], reason: `compiled acting event needs state ${e.state} of channel ${e.channel}` })); else out.push({ ...e, source: e.source || "acting" }); }
  // P04 §5.1: explicit numeric priority; equal-priority contradictions fail (STATE_CONFLICT); order of the input never matters
  const prio = out.map((e) => ({ ...e, priority: e.priority ?? priorityOf(e.source) })), r = resolveConflicts(prio, (e) => e.channel, { rig: rig.id });
  errs.push(...r.errors); return { events: r.events.sort((p, q) => p.frame - q.frame || (p.priority ?? 0) - (q.priority ?? 0)), errors: errs }; // evaluation order: last (highest priority) wins a frame
}
/** channel states at frame f — the rig's WHOLE-FILM history (P04 §3.1: a state persists across actions and shots unless a contract resets it);
 *  `shotId` is kept for signature compatibility and no longer filters the history */
export function channelStatesAt(rig, events, f, _shotId = null) { const st = Object.fromEntries((rig.state_channels || []).map((c) => [c.id, c.default ?? c.states[0].id])); for (const e of events) { if (e.frame > f) break; st[e.channel] = e.state; } return st; }
/** final slot→drawing bindings: pose < view < channels; plus the resolved expression/eyes/mouth state ids (independent of the pose id) */
export function resolveBindings(rig, pose, view, chStates) {
  const all = [...rig.pose_states, ...rig.view_states], ps = all.find((s) => s.id === pose), vs = view ? all.find((s) => s.id === view) : null, b = { ...(ps?.asset_bindings || {}), ...(vs?.asset_bindings || {}) }, byKind = {};
  for (const ch of rig.state_channels || []) { const s = ch.states.find((x) => x.id === (chStates[ch.id] ?? ch.default ?? ch.states[0].id)); for (const slot of ch.slots || []) delete b[slot]; // a channel owns its slots exclusively: a pose/view drawing never leaks into them (absent binding = the slot's own drawing)
    Object.assign(b, s?.asset_bindings || {}); (byKind[ch.kind] ||= {})[ch.id] = s?.id ?? null; }
  const first = (k) => (byKind[k] ? Object.values(byKind[k])[0] : null);
  return { bindings: b, channels: { ...chStates }, expression: first("EXPRESSION"), eyes: first("EYES"), mouth: first("MOUTH"), hand: byKind.HAND || {}, clothing: byKind.CLOTHING || {}, lighting: byKind.LIGHTING || {}, occlusion: byKind.OCCLUSION || {} };
}
/** every drawing a slot may show (pose, view and channel states) — the paint passes the scene must pre-emit */
export function bindableAssets(rig, slot) { const s = new Set([slot]); for (const st of [...rig.pose_states, ...rig.view_states, ...(rig.state_channels || []).flatMap((c) => c.states)]) if (st.asset_bindings?.[slot]) s.add(st.asset_bindings[slot]); return [...s]; }
