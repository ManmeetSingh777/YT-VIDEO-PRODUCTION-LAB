// Which facial/channel drawings the directed performance needs IN WHICH VIEW (general; film inputs: compiled manifest, speech intervals).
// A state is drawn for the head view in which it is performed: channel intervals (action state_events, persisting until the next change) are
// intersected with the rig's view intervals (view_events); speech needs mouth visemes in every view a measured speech interval overlaps; blinks
// need closed eyes in every view held long enough to blink. Each existing drawing keeps the view where it is performed longest (its primary
// view); every other view it is performed in needs a view-qualified drawing `<asset>__<view>` bound through asset_bindings_by_view.
const iv = (events, total, first) => { const out = []; let cur = first, at = 0; for (const e of events) { if (e.frame > at && cur != null) out.push([at, e.frame, cur]); cur = e.state; at = Math.max(at, e.frame); } if (at < total && cur != null) out.push([at, total, cur]); return out; };
const overlap = (a, b) => Math.max(0, Math.min(a[1], b[1]) - Math.max(a[0], b[0]));

export function performanceViews({ doc, rigId, speech = [], blinkMinFrames = 120, visemes = ["open", "mid"], blinkState = "blink_closed", initialView = null }) {
  const total = doc.stage.total_frames, rig = doc.rigs.find((r) => r.id === rigId); if (!rig) throw new Error(`unknown rig ${rigId}`);
  const owns = (a, e) => (e.rig ?? e.rig_id ?? (a.actors?.length === 1 ? a.actors[0].rig_id : null)) === rigId;
  const vev = doc.actions.flatMap((a) => (a.view_events || []).filter((e) => owns(a, e)).map((e) => ({ frame: e.frame, state: e.to_state, from: e.from_state }))).sort((p, q) => p.frame - q.frame);
  const views = iv(vev, total, initialView ?? vev[0]?.from ?? rig.view_states?.[0]?.id ?? null), need = new Map(), add = (ch, st, view, n) => { if (!n) return; const k = `${ch}|${st}|${view}`; need.set(k, (need.get(k) || 0) + n); };
  for (const ch of rig.state_channels || []) { if (!["EYES", "MOUTH", "EXPRESSION"].includes(ch.kind)) continue;
    const ev = doc.actions.flatMap((a) => (a.state_events || []).filter((e) => owns(a, e) && e.channel === ch.id).map((e) => ({ frame: e.frame, state: e.state }))).sort((p, q) => p.frame - q.frame);
    for (const c of iv(ev, total, ch.default)) for (const v of views) add(ch.id, c[2], v[2], overlap(c, v));
    if (ch.kind === "MOUTH") for (const s of speech) for (const v of views) for (const m of visemes) add(ch.id, m, v[2], overlap(s, v));
    if (ch.kind === "EYES" && ch.states.some((x) => x.id === blinkState)) for (const v of views) if (v[1] - v[0] >= blinkMinFrames) add(ch.id, blinkState, v[2], v[1] - v[0]); }
  const rows = [...need].map(([k, n]) => { const [channel, state, view] = k.split("|"); return { channel, state, view, frames: n }; });
  const byState = {}; for (const r of rows) (byState[`${r.channel}|${r.state}`] ||= []).push(r);
  const assign = [], extra = [];
  for (const [k, rs] of Object.entries(byState)) { const [channel, state] = k.split("|"), st = rig.state_channels.find((c) => c.id === channel)?.states.find((s) => s.id === state); if (!st) continue;
    const primary = rs.reduce((a, b) => (b.frames > a.frames ? b : a)).view;
    for (const [slot, asset] of Object.entries(st.asset_bindings || {})) { assign.push({ channel, state, slot, asset, primary_view: primary, views: rs.map((r) => `${r.view}:${r.frames}`) });
      for (const r of rs) if (r.view !== primary) extra.push({ channel, state, slot, view: r.view, frames: r.frames, base_asset: asset, asset: `${asset}__${r.view}` }); } }
  return { rig: rigId, views, assignments: assign, view_qualified: extra };
}
