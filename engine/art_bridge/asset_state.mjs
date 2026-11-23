// Motion state inventory (spec §11.4): assetStateCoverage derives required art states from the ACTION GRAPH, not a fixed turntable.
// Cells: (shot, actor, interval, view, pose, expression, material light, near/far topology, camera footprint). A cell is covered only by
// registered art whose own view/pose matches the cell; a static master reused for every acting state never counts. Missing cells →
// errors that art_requests.missingArtJobs turns into exact ArtJobs.
import { err } from "./errors.mjs";
import { channelEvents, channelStatesAt, resolveBindings } from "./state_channels.mjs";

export function assetStateCoverage(doc) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), rigs = new Map(doc.rigs.map((r) => [r.id, r])), cells = [], errors = [];
  for (const a of doc.actions) for (const actor of a.actors) {
    const r = rigs.get(actor.rig_id); if (!r) continue;
    const states = new Map([...r.pose_states, ...r.view_states].map((s) => [s.id, s]));
    const chEv = channelEvents(r, [a]).events; // explicit channel events of THIS action for THIS rig (P03 B)
    const cuts = [...new Set([a.frame_range[0], ...a.pose_events.map((e) => e.frame), ...a.view_events.map((e) => e.frame), ...a.contact_events.flatMap((c) => [c.start_frame, c.end_frame]), ...chEv.map((e) => e.frame), a.frame_range[1]])].filter((f) => f >= a.frame_range[0] && f <= a.frame_range[1]).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const f = cuts[i], g = cuts[i + 1]; if (f === g) continue;
      const own = (sid) => states.has(sid); // an action can carry several actors' events: only this rig's states apply to this rig
      let pose = r.pose_states[0]?.id ?? null, view = null; for (const e of a.pose_events) if (e.frame <= f && own(e.state_id)) pose = e.state_id; for (const e of a.view_events) if (e.frame <= f && own(e.to_state)) view = e.to_state;
      const ps = states.get(pose), vs = view ? states.get(view) : null, facing = vs?.view_facing || ps?.view_facing || "front";
      const rb = resolveBindings(r, pose, view, channelStatesAt(r, chEv, f)), bind = rb.bindings, contacts = a.contact_events.filter((c) => c.start_frame <= f && f < c.end_frame);
      const cell = { shot: a.shot_id, action: a.id, actor: r.id, interval: [f, g], view: facing, pose, expression: rb.expression, eyes: rb.eyes, mouth: rb.mouth, channels: rb.channels, light: [], near_far: [], camera_footprint: doc.shots.find((s) => s.id === a.shot_id)?.camera_track_id ? "VALIDATED_BY_SCENE_GRAPH" : "STATIC", parts: {}, missing: [] };
      for (const p of r.render_parts) {
        const aid = bind[p.asset_id] ?? p.asset_id, art = assets.get(aid);
        if (!art) { cell.missing.push({ slot: p.asset_id, need: aid, why: "bound asset absent" }); continue; }
        if (art.kind === "MASTER" && ["ARTICULATED", "REGISTERED_CELS", "REGISTERED_MORPH", "EXPLICIT_DEFORM"].includes(a.mode)) cell.missing.push({ slot: p.asset_id, need: `${p.asset_id}@${facing}/${pose}`, why: "static master stands in for an acting state" });
        else if (art.view_id && art.view_id !== facing && !["UNDERPAINT", "MATERIAL_PLANE", "MASK", "OCCLUDER"].includes(art.kind)) cell.missing.push({ slot: p.asset_id, need: `${p.asset_id}@${facing}`, why: `asset ${aid} is ${art.view_id}-view art used in a ${facing} state` });
        cell.parts[p.asset_id] = aid; for (const m of art.material_plane_ids || []) cell.light.push(m);
      }
      // every approved state of every declared channel is part of the rig's acting repertoire here (blink/speech can occur on any frame)
      for (const ch of r.state_channels || []) for (const st of ch.states) for (const [slot, aid] of Object.entries(st.asset_bindings || {})) if (!assets.get(aid)) cell.missing.push({ slot, need: aid, why: `channel ${ch.id} state ${st.id} has no approved drawing` });
      for (const c of contacts) if (c.contact_type === "GRIP" && r.sockets.some((s) => s.id === c.source_socket)) {
        const sock = r.sockets.find((s) => s.id === c.source_socket), handParts = r.render_parts.filter((p) => p.joint_id === sock?.joint_id).map((p) => assets.get(bind[p.asset_id] ?? p.asset_id)).filter(Boolean);
        const above = handParts.some((h) => h.draw_order_constraints.some((d) => d.relation === "ABOVE" && !handParts.some((x) => x.id === d.asset_id))), below = handParts.some((h) => h.draw_order_constraints.some((d) => d.relation === "BELOW" && !handParts.some((x) => x.id === d.asset_id)));
        cell.near_far.push({ contact: c.source_socket, near_layer: above, far_layer: below });
        if (!above || !below) cell.missing.push({ slot: `${c.source_socket}:near_far`, need: `${r.id}.${sock?.joint_id}.near_far_hand_layers`, why: "grip needs authored near-finger and far-finger/palm layers on opposite sides of the prop" });
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
    const chEv = channelEvents(r, [a]).events;
    const cuts = [...new Set([a.frame_range[0], ...a.pose_events.filter((e) => own(e.state_id)).map((e) => e.frame), ...a.view_events.filter((e) => own(e.to_state)).map((e) => e.frame), ...chEv.map((e) => e.frame), a.frame_range[1]])].filter((f) => f >= a.frame_range[0] && f <= a.frame_range[1]).sort((p, q) => p - q);
    for (let i = 0; i + 1 < cuts.length; i++) {
      const f = cuts[i], g = cuts[i + 1]; if (f === g) continue;
      let pose = r.pose_states[0]?.id ?? null, view = null; for (const e of a.pose_events) if (e.frame <= f && own(e.state_id)) pose = e.state_id; for (const e of a.view_events) if (e.frame <= f && own(e.to_state)) view = e.to_state;
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
