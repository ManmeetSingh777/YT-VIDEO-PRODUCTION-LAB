// Motion state inventory (spec §11.4): assetStateCoverage derives required art states from the ACTION GRAPH, not a fixed turntable.
// Cells: (shot, actor, interval, view, pose, expression, material light, near/far topology, camera footprint). A cell is covered only by
// registered art whose own view/pose matches the cell; a static master reused for every acting state never counts. Missing cells →
// errors that art_requests.missingArtJobs turns into exact ArtJobs.
import { err } from "./errors.mjs";
import { channelEvents, channelStatesAt, resolveBindings } from "./state_channels.mjs";
import { rigPoseTimeline, poseAt } from "./state_timeline.mjs"; // P04 §3.1: ONE persistent history per rig (no per-action resets)

/** reachableStates(rig, actions, acting) — channel id → Set of states the performance can select: default ∪ directed action state events ∪ the
 *  acting layer's blink/speech states. null when no motion plan is known (callers then keep the conservative full repertoire). */
export function reachableStates(r, actions, acting) {
  if (acting === null || acting === undefined) return null; const A = acting[r.id] || {}, ev = channelEvents(r, actions).events, out = new Map();
  for (const ch of r.state_channels || []) { const set = new Set([ch.default ?? ch.states[0]?.id]); for (const e of ev) if (e.channel === ch.id) set.add(e.state);
    if (A.blink?.channel === ch.id) { set.add(A.blink.open); set.add(A.blink.closed); } if (A.speech?.channel === ch.id) { set.add(A.speech.open); if (A.speech.mid) set.add(A.speech.mid); set.add(A.speech.rest); }
    out.set(ch.id, set); }
  return out;
}
export function assetStateCoverage(doc, { plan = null } = {}) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), rigs = new Map(doc.rigs.map((r) => [r.id, r])), cells = [], errors = [];
  for (const a of doc.actions) for (const actor of a.actors) {
    const r = rigs.get(actor.rig_id); if (!r) continue;
    const states = new Map([...r.pose_states, ...r.view_states].map((s) => [s.id, s]));
    const chEv = channelEvents(r, doc.actions).events, ptl = rigPoseTimeline(r, doc.actions); // the rig's WHOLE-FILM channel and pose/view history (persistent)
    const reach = reachableStates(r, doc.actions, plan ? (plan.acting || {}) : null);
    const cuts = [...new Set([a.frame_range[0], ...a.pose_events.map((e) => e.frame), ...a.view_events.map((e) => e.frame), ...a.contact_events.flatMap((c) => [c.start_frame, c.end_frame]), ...chEv.map((e) => e.frame), a.frame_range[1]])].filter((f) => f >= a.frame_range[0] && f <= a.frame_range[1]).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const f = cuts[i], g = cuts[i + 1]; if (f === g) continue;
      const own = (sid) => states.has(sid); // an action can carry several actors' events: only this rig's states apply to this rig
      const { pose, view } = poseAt(r, ptl, f); // persists from earlier actions; resets only on an explicit contract reset
      const ps = states.get(pose), vs = view ? states.get(view) : null, facing = vs?.view_facing || ps?.view_facing || "front";
      // head/face slots (rebound by the view state, or owned by facial channels) follow the VIEW; limbs follow the declared BODY facing of that view
      const faceSlots = new Set([...Object.keys(vs?.asset_bindings || {}), ...(r.state_channels || []).filter((c) => ["EXPRESSION", "EYES", "MOUTH"].includes(c.kind)).flatMap((c) => c.slots || [])]);
      const slotFacing = (slot) => (faceSlots.has(slot) ? facing : vs?.body_facing || ps?.body_facing || facing);
      const rb = resolveBindings(r, pose, view, channelStatesAt(r, chEv, f)), bind = rb.bindings, contacts = a.contact_events.filter((c) => c.start_frame <= f && f < c.end_frame);
      const cell = { shot: a.shot_id, action: a.id, actor: r.id, interval: [f, g], view: facing, pose, expression: rb.expression, eyes: rb.eyes, mouth: rb.mouth, channels: rb.channels, light: [], near_far: [], camera_footprint: doc.shots.find((s) => s.id === a.shot_id)?.camera_track_id ? "VALIDATED_BY_SCENE_GRAPH" : "STATIC", parts: {}, missing: [] };
      for (const p of r.render_parts) {
        const aid = bind[p.asset_id] ?? p.asset_id, art = assets.get(aid);
        if (!art) { cell.missing.push({ slot: p.asset_id, need: aid, why: "bound asset absent" }); continue; }
        if (art.kind === "MASTER" && ["ARTICULATED", "REGISTERED_CELS", "REGISTERED_MORPH", "EXPLICIT_DEFORM"].includes(a.mode)) cell.missing.push({ slot: p.asset_id, need: `${p.asset_id}@${facing}/${pose}`, why: "static master stands in for an acting state" });
        else if (art.view_id && art.view_id !== slotFacing(p.asset_id) && !["UNDERPAINT", "MATERIAL_PLANE", "MASK", "OCCLUDER"].includes(art.kind)) cell.missing.push({ slot: p.asset_id, need: `${p.asset_id}@${slotFacing(p.asset_id)}`, why: `asset ${aid} is ${art.view_id}-view art used in a ${facing} state` });
        cell.parts[p.asset_id] = aid; for (const m of art.material_plane_ids || []) cell.light.push(m);
      }
      // every approved state of every declared channel is part of the rig's acting repertoire here (blink/speech can occur on any frame)
      for (const ch of r.state_channels || []) for (const st of ch.states) { if (reach && !reach.get(ch.id)?.has(st.id)) continue; for (const [slot, aid] of Object.entries({ ...(st.asset_bindings || {}), ...((view && st.asset_bindings_by_view?.[view]) || {}) })) if (!assets.get(aid)) cell.missing.push({ slot, need: aid, why: `channel ${ch.id} state ${st.id} has no approved drawing` }); } // reachable states only when the motion plan is known
      for (const c of contacts) if (c.contact_type === "GRIP" && r.sockets.some((s) => s.id === c.source_socket)) {
        const sock = r.sockets.find((s) => s.id === c.source_socket), handParts = r.render_parts.filter((p) => p.joint_id === sock?.joint_id).map((p) => assets.get(bind[p.asset_id] ?? p.asset_id)).filter(Boolean);
        const above = handParts.some((h) => h.draw_order_constraints.some((d) => d.relation === "ABOVE" && !handParts.some((x) => x.id === d.asset_id))), below = handParts.some((h) => h.draw_order_constraints.some((d) => d.relation === "BELOW" && !handParts.some((x) => x.id === d.asset_id)));
        cell.near_far.push({ contact: c.source_socket, near_layer: above, far_layer: below });
        // P04 §5.3: the grip contract decides the topology; a declared single layer carries its reason, declared finger layers are checked by slot
        const gc = plan?.grips?.[`${a.id}:${c.source_socket}`] || plan?.grips?.[a.id], slots = new Set(r.render_parts.map((p) => p.asset_id)), layered = gc?.finger_layers && gc.finger_layers.near?.length && gc.finger_layers.far?.length && [...gc.finger_layers.near, ...gc.finger_layers.far].every((s) => slots.has(s)), single = gc && !gc.finger_layers && gc.near_far !== "WRAP" && gc.single_layer_reason; if (single) cell.near_far.at(-1).single_layer_reason = gc.single_layer_reason; if (layered) cell.near_far.at(-1).finger_layers = gc.finger_layers;
        if (!layered && !single && (!above || !below)) cell.missing.push({ slot: `${c.source_socket}:near_far`, need: `${r.id}.${sock?.joint_id}.near_far_hand_layers`, why: "grip needs authored near-finger and far-finger/palm layers on opposite sides of the prop" });
      }
      cells.push(cell);
      for (const m of cell.missing) errors.push(err("MISSING_ART_ASSET", { record_id: m.need, dependency: m.need, shot_id: a.shot_id, frame_range: [f, g], suggested_producer: "GPT state manufacture (source-attached edit of the canonical master)", reason: `state cell ${a.id}/${r.id} [${f},${g}) ${m.why}`, details: { cell: { view: facing, pose, slot: m.slot } } }));
    }
  }
  return { cells, errors, covered: cells.filter((c) => !c.missing.length).length, total: cells.length };
}

/** stateIntervals(doc) — per action/actor/interval: resolved pose/view and the asset bound to every render slot (whether or not the art exists yet),
 *  plus the contacts active in that interval. Used to derive ArtJob motion contracts from the action graph (audit P0-1). */
export function stateIntervals(doc) {
  const rigs = new Map(doc.rigs.map((r) => [r.id, r])), out = [];
  for (const a of doc.actions) for (const actor of a.actors) {
    const r = rigs.get(actor.rig_id); if (!r) continue;
    const states = new Map([...r.pose_states, ...r.view_states].map((s) => [s.id, s])), own = (sid) => states.has(sid);
    const chEv = channelEvents(r, doc.actions).events, ptl = rigPoseTimeline(r, doc.actions);
    const cuts = [...new Set([a.frame_range[0], ...a.pose_events.filter((e) => own(e.state_id)).map((e) => e.frame), ...a.view_events.filter((e) => own(e.to_state)).map((e) => e.frame), ...chEv.map((e) => e.frame), a.frame_range[1]])].filter((f) => f >= a.frame_range[0] && f <= a.frame_range[1]).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const f = cuts[i], g = cuts[i + 1]; if (f === g) continue;
      const { pose, view } = poseAt(r, ptl, f); // persists from earlier actions; resets only on an explicit contract reset
      const ps = states.get(pose), vs = view ? states.get(view) : null, rb = resolveBindings(r, pose, view, channelStatesAt(r, chEv, f)), bind = rb.bindings;
      const bindings = Object.fromEntries(r.render_parts.map((p) => [p.asset_id, bind[p.asset_id] ?? p.asset_id]));
      const contacts = a.contact_events.filter((c) => c.start_frame < g && f < c.end_frame).map((c) => ({ ...c, source_rig: r.sockets.some((s) => s.id === c.source_socket) ? r.id : null, target_rig: r.sockets.some((s) => s.id === c.target_socket) ? r.id : null }));
      // channel repertoire drawings (blink/speech/expression states) are demanded with this interval's frames too
      const repertoire = {}; for (const ch of r.state_channels || []) for (const st of ch.states) for (const [slot, aid] of Object.entries(st.asset_bindings || {})) if (bindings[slot] !== aid) repertoire[`${slot}@${ch.id}:${st.id}`] = aid;
      out.push({ action: a.id, shot: a.shot_id, mode: a.mode, rig: r.id, interval: [f, g], pose, view, expression: rb.expression, eyes: rb.eyes, mouth: rb.mouth, channels: rb.channels, facing: vs?.view_facing || ps?.view_facing || "front", bindings, repertoire, contacts });
    }
  }
  return out;
}
