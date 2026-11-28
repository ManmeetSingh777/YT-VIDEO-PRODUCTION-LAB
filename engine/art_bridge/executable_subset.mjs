// Executable subset (general): the part of the action graph that can run NOW on measured geometry. Rigs whose geometry is not MEASURED are
// removed together with everything that depends on them (their actor placements, contacts whose source or target is theirs, pose/view/state
// events, plan tracks/gaze/acting/reaches, support contracts that name them). Nothing is faked: the removed set is returned so callers report it.
//   executableSubset(doc, plan) → { doc, plan, removed: {rigs, actors, contacts, events, plan}, kept_rigs }
const clone = (o) => JSON.parse(JSON.stringify(o));
export function executableSubset(doc0, plan0 = {}) {
  const doc = clone(doc0), plan = clone(plan0 || {}), bad = new Set(doc.rigs.filter((r) => r.geometry_status !== "MEASURED").map((r) => r.id)), removed = { rigs: [...bad], actors: [], contacts: [], events: [], plan: [] };
  const rigOfSocket = (s) => (s && s !== "world" ? String(s).split(".")[0] : null), hits = (s) => bad.has(rigOfSocket(s));
  for (const a of doc.actions) {
    a.actors = (a.actors || []).filter((x) => (bad.has(x.rig_id) ? (removed.actors.push(`${a.id}:${x.rig_id}`), false) : true));
    a.contact_events = (a.contact_events || []).filter((c) => (hits(c.source_socket) || hits(c.target_socket) ? (removed.contacts.push(`${a.id}:${c.source_socket}->${c.target_socket}[${c.start_frame},${c.end_frame})`), false) : true));
    for (const k of ["pose_events", "view_events", "state_events"]) a[k] = (a[k] || []).filter((e) => { const r = e.rig_id ?? e.rig; if (r && bad.has(r)) { removed.events.push(`${a.id}:${k}:${r}@${e.frame}`); return false; } return true; });
    if (a.required_assets) a.required_assets = a.required_assets.filter((id) => { const p = doc.rigs.find((r) => r.render_parts?.some((x) => x.asset_id === id)); return !(p && bad.has(p.id)); }); }
  for (const k of ["tracks", "acting", "placements"]) if (plan[k]) for (const r of Object.keys(plan[k])) if (bad.has(r)) { delete plan[k][r]; removed.plan.push(`${k}.${r}`); }
  if (Array.isArray(plan.gaze)) plan.gaze = plan.gaze.filter((g) => { const r = g.rig ?? g.rig_id, t = g.target?.rig ?? g.target_rig; if (bad.has(r) || bad.has(t)) { removed.plan.push(`gaze.${r}->${t ?? "point"}`); return false; } return true; });
  if (plan.reaches) for (const [id, r] of Object.entries(plan.reaches)) if (hits(r.source) || hits(r.target)) { delete plan.reaches[id]; removed.plan.push(`reaches.${id}`); }
  if (plan.prop_support?.props) plan.prop_support.props = plan.prop_support.props.filter((p) => { const names = [p.prop_rig, p.prop_rig_id, ...(p.hands || []).map((h) => h.rig ?? String(h.ref).split("#")[0])]; if (names.some((n) => bad.has(n))) { removed.plan.push(`prop_support.${p.id}`); return false; } return true; });
  if (Array.isArray(plan.ik_branches)) plan.ik_branches = plan.ik_branches.filter((b) => !bad.has(b.rig));
  doc.rigs = doc.rigs.filter((r) => !bad.has(r.id));
  return { doc, plan, removed, kept_rigs: doc.rigs.map((r) => r.id) };
}
