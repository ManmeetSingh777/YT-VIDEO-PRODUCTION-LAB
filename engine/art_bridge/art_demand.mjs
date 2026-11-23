// Visible-state demand (directive H1; F008, F036, F072). Walk every action interval of every shot and derive which DRAWINGS the frames
// need — not a fixed picture count: every bound asset of every active pose/view state, the hand drawings each contact phase needs, the
// transition plates each continuous transition needs, and the world plate coverage each camera path needs. Each demand records WHY, the
// exact frame intervals, the representation that consumes it and whether the plan supplies it; a missing one is MISSING_ART_ASSET with frames.
import { stateIntervals } from "./asset_state.mjs";
import { cameraSizedArtworkDemand } from "./source_method_causality.mjs";
import { ev } from "./temporal.mjs";
const merge = (spans) => { const s = spans.map((x) => [...x]).sort((a, b) => a[0] - b[0]), o = []; for (const x of s) { const l = o.at(-1); if (l && x[0] <= l[1]) l[1] = Math.max(l[1], x[1]); else o.push(x); } return o; };
export function deriveArtDemands({ doc, plan, motionPlans = {} }) {
  const planned = new Set(plan.assets.map((a) => a.asset_id)), dem = new Map(), add = (id, o) => { const d = dem.get(id) || { asset: id, why: new Set(), frames: [], representation: o.representation, consumers: new Set() }; d.why.add(o.why); d.frames.push(o.frames); d.consumers.add(o.consumer); dem.set(id, d); };
  for (const x of stateIntervals(doc)) {
    for (const [slot, asset] of Object.entries(x.bindings)) add(asset, { why: `${x.rig} ${x.pose}${x.view ? "/" + x.view : ""} binds ${slot}`, frames: x.interval, representation: x.mode === "ARTICULATED" ? "ARTICULATED" : x.mode, consumer: `${x.action}@${x.shot}` });
    // a closure contact is supplied only when the state active during it is NOT the rig's rest state and binds planned art (a drawn closure)
    const rig = doc.rigs.find((r) => r.id === x.rig), closureArt = x.pose && x.pose !== rig?.pose_states[0]?.id ? Object.entries(x.bindings).filter(([slot, a]) => a !== slot).map(([, a]) => a) : [];
    for (const c of x.contacts) if (["GRIP", "FOLLOW", "PINCH"].includes(c.contact_type)) add(closureArt.length && closureArt.every((a) => planned.has(a)) ? closureArt[0] : `${c.source_socket}::${c.contact_type}_hand_state`, { why: `${c.contact_type} contact ${c.source_socket}→${c.target_socket} needs a closure drawing`, frames: [Math.max(x.interval[0], c.start_frame), Math.min(x.interval[1], c.end_frame)], representation: "REGISTERED_CELS", consumer: x.action });
  }
  // continuous/portal transitions: the plates (and aperture masks) the CONTRACT names; an unnamed part is demanded under a typed placeholder
  // (P02 repair: the demand previously used fixed placeholder names and read t.kind/t.type, so a contract with planned plates — mode CONTINUOUS — was never satisfied)
  for (const t of doc.transitions || []) if (/CONTINUOUS|PORTAL/i.test(t.mode || t.kind || t.type || "")) for (const [part, ids] of [["OUT", t.out_asset_ids], ["MIDDLE", t.middle_asset_ids], ["IN", t.in_asset_ids], ["MASK", t.mask_or_occluder_ids]]) for (const aid of ids?.length ? ids : part === "MASK" ? [] : [`${t.from_shot}->${t.to_shot}::${part}_plate`]) add(aid, { why: `continuous transition ${t.from_shot}->${t.to_shot} needs its ${part} plate`, frames: t.frame_range || [0, 0], representation: "TRANSITION", consumer: "transitions.mjs#compileTransition" });
  for (const sh of doc.shots.filter((s) => s.world_id && s.camera_track_id)) { const cam = motionPlans[sh.id]?.cameras?.[sh.camera_track_id]; if (!cam) continue; const w = (doc.worlds || []).find((x) => x.id === sh.world_id), frames = []; for (let f = sh.start_frame; f < sh.end_frame; f += 6) frames.push(f);
    const d = cameraSizedArtworkDemand({ camera: (f) => ({ x: ev(cam.x, f), y: ev(cam.y, f), zoom: ev(cam.zoom, f) }), frames }); add(w?.canonical_asset_id || sh.world_id, { why: `camera ${sh.camera_track_id} needs coverage ${JSON.stringify(d.canonical_coverage_rect)} at ≥${d.min_density_px_per_unit} px/unit`, frames: [sh.start_frame, sh.end_frame], representation: "CAMERA_WORLD", consumer: "scene_graph.mjs#composeShot" }); }
  const out = [...dem.values()].map((d) => ({ asset: d.asset, why: [...d.why], frames: merge(d.frames), representation: d.representation, consumers: [...d.consumers], supplied_by_plan: planned.has(d.asset) }));
  return { demands: out, missing: out.filter((d) => !d.supplied_by_plan).map((d) => ({ code: "MISSING_ART_ASSET", record_id: d.asset, frame_ranges: d.frames, reason: d.why.join("; "), required_art_or_operation: [`source-attached ${d.representation} drawing for ${d.asset}`] })) };
}
