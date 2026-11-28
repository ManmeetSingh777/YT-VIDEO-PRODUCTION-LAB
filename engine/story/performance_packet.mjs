// Performance-command packet compiler (general): the accepted action graph → the executable PerformanceCommand packet (schema v1.1) the runtime
// already consumes (performance_commands.mjs#compilePerformance → temporal.mjs). Nothing here knows a film.
//  - characters: every rig with HAND/face channels; role maps derived from the MEASURED rig (hand sockets, channels, open/closed states, head joint);
//    a character whose rig is not measured or whose master is not approved is compiled but held PENDING_GEOMETRY (never executed on zero geometry);
//  - commands: every hand GRIP contact of the action graph → a grip command that ADOPTS that contact (no second producer) with its directed
//    closure state, and a release command at the contact's end where the action graph releases it; required drawings are named per command;
//  - coverage: every directed event of the action graph and motion plan is mapped to the producer that executes it (command, action-graph state
//    router, acting compiler, gaze layer, contact solver, prop support, camera) with EXECUTABLE / PENDING_GEOMETRY / PENDING_ART status.
// Support contracts (who drives a prop) and character profiles are film/director data passed in; they are validated here, never invented.
const handOf = (sock) => (/\.palm_([a-z0-9]+)$/.exec(sock) || [])[1] || null;
export function compilePerformancePacket({ doc, packet = null, plan = null, sourceDigest, decisionIds, profiles = {}, supportContracts = [], fps = 60, approvedMaster = () => false }) {
  const total = doc.stage.total_frames, rigs = new Map(doc.rigs.map((r) => [r.id, r])), pending = [], coverage = [], commands = [], characters = [];
  const pkContact = (a, c) => (packet?.actions || []).find((x) => x.id === a.id)?.contact_events?.find((k) => k.source_socket === c.source_socket && k.frames[0] === c.start_frame && k.target_socket === c.target_socket) || null;
  // characters + role maps
  for (const r of doc.rigs) { const ident = doc.identities.find((i) => i.id === r.identity_id), hands = (r.state_channels || []).filter((c) => c.kind === "HAND" && /^hand_[a-z0-9]+$/.test(c.id));
    const face = (r.state_channels || []).filter((c) => ["EXPRESSION", "EYES", "MOUTH"].includes(c.kind)); if (!hands.length && !face.length) continue;
    const role_map = {}; for (const hc of hands) { const h = hc.id.slice(5), sock = r.sockets.find((s) => s.id === `${r.id}.palm_${h}`); if (!sock) continue; const open = hc.states.find((s) => s.id === "open"), closed = hc.states.find((s) => s.id !== "open");
      role_map[`hand.${h}.socket`] = sock.id; role_map[`hand.${h}.channel`] = hc.id; if (open) role_map[`hand.${h}.open_state`] = open.id; if (closed) role_map[`hand.${h}.closed_state`] = closed.id; }
    if (r.joints.some((j) => j.id === "head")) { role_map.head_joint = "head"; role_map.gaze_joint = "head"; }
    const ex = face.find((c) => c.kind === "EXPRESSION"); if (ex) role_map.expression_channel = ex.id;
    const measured = r.geometry_status === "MEASURED", approved = !!(ident && approvedMaster(ident.canonical_asset_id)), executable = measured && approved;
    const ch = { actor_rig_id: r.id, master_sha: ident?.master_sha256 || "0".repeat(64), topology_kind: "BIPED", character_profile_id: `${r.id}.performance`, role_map, approved_state_channels: (r.state_channels || []).map((c) => c.id), approved_motion_routes: ["PART_RIG_2D", "APPROVED_CELS", "RIGID_2D"] };
    characters.push({ ...ch, executable, ...(executable ? {} : { pending: !measured ? "PENDING_GEOMETRY: rig not measured (master not registered)" : "PENDING_APPROVAL: master not approved" }) });
    if (!executable) pending.push({ kind: "CHARACTER", id: r.id, reason: characters.at(-1).pending }); }
  const charOf = new Map(characters.map((c) => [c.actor_rig_id, c]));
  const stateArt = (r, ch, st) => { const s = (r.state_channels || []).find((c) => c.id === ch)?.states.find((x) => x.id === st); return [...new Set([...Object.values(s?.asset_bindings || {}), ...Object.values(s?.asset_bindings_by_view || {}).flatMap((m) => Object.values(m))])]; };
  // commands: hand contacts
  for (const a of doc.actions) for (const c of a.contact_events || []) {
    const rid = c.source_socket.split(".")[0], r = rigs.get(rid), h = handOf(c.source_socket), C = charOf.get(rid);
    if (c.contact_type !== "GRIP" || !h || !C || !c.target_socket || c.target_socket === "world") { coverage.push({ kind: "CONTACT", id: `${a.id}:${c.source_socket}->${c.target_socket}@${c.start_frame}`, frames: [c.start_frame, c.end_frame], executor: "action-graph contact (temporal.mjs contact solver)", status: rigs.get(rid)?.geometry_status === "MEASURED" ? "EXECUTABLE" : "PENDING_GEOMETRY" }); continue; }
    const pc = pkContact(a, c), channel = `hand_${h}`, closure = pc?.closure_state || C.role_map[`hand.${h}.closed_state`], prop = c.target_socket.split(".")[0], f0 = c.start_frame, f1 = c.end_frame, close = Math.min(f1, f0 + 6);
    const base = { action_id: a.id, direction_decision_ids: decisionIds, actor_rig_id: rid, character_profile_id: C.character_profile_id, override_policy: "DIRECTOR_PRIORITY_STRICT", source_digest: sourceDigest, target: { kind: "RIG_SOCKET", rig_id: prop, socket_id: c.target_socket } };
    const art = [...new Set([...stateArt(r, channel, closure), ...stateArt(r, channel, "open")])], released = /released/.test(c.release_behavior || "");
    const grip = { ...base, id: `${a.id}:grip:${rid}.${h}-f${f0}`, verb: "grip", frames: [f0, Math.max(f0 + 1, f1)], intent: `${rid} ${h} hand holds ${c.target_socket}`, required_prestate: { channel_states: {}, possession: {} }, required_poststate: { channel_states: { [channel]: closure }, possession: { [prop]: `${rid}#${h}` } },
      phases: [{ id: "close", frames: [f0, Math.max(f0 + 1, close)], goal: `close ${channel} as ${closure}`, expected_owner_effect: "closed hand on the prop socket" }, ...(close < f1 ? [{ id: "hold", frames: [close, f1], goal: "hold", expected_owner_effect: "contact held; painted grip maintained" }] : [])],
      motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_art_refs: art, expected_effects: [{ kind: "PaintedGripMaintained", owner_id: c.source_socket, frames: [f0, Math.max(f0 + 1, f1)], test_id: `GRIP-${a.id}-${h}-${f0}`, human_quality_check: `native playback: ${rid}'s ${h} hand stays closed on ${c.target_socket}` }] };
    commands.push({ ...grip, executable: C.executable });
    coverage.push({ kind: "CONTACT", id: `${a.id}:${c.source_socket}->${c.target_socket}@${f0}`, frames: [f0, f1], executor: `command ${grip.id} (adopts the action-graph contact)`, closure, status: C.executable ? (art.length ? "EXECUTABLE" : "PENDING_ART") : C.pending.split(":")[0] });
    if (released) { const end = Math.min(a.frame_range[1], f1 + 8), open = Math.min(end, f1 + 3);
      const rel = { ...base, id: `${a.id}:release:${rid}.${h}-f${f1}`, verb: "release", frames: [f1, end], intent: `${rid} ${h} hand lets go of ${c.target_socket}`, required_prestate: { channel_states: { [channel]: closure }, possession: {} }, required_poststate: { channel_states: { [channel]: "open" }, possession: { [prop]: null } },
        phases: [{ id: "open", frames: [f1, Math.max(f1 + 1, open)], goal: `open ${channel}`, expected_owner_effect: "hand opens" }, ...(open < end ? [{ id: "retract", frames: [open, end], goal: "retract", expected_owner_effect: "hand leaves the prop" }] : [])],
        motion_routes: ["PART_RIG_2D", "APPROVED_CELS"], required_art_refs: stateArt(r, channel, "open"), expected_effects: [{ kind: "ReleaseAndSeparation", owner_id: c.source_socket, frames: [f1, end], test_id: `RELEASE-${a.id}-${h}-${f1}`, human_quality_check: `native playback: ${rid}'s ${h} hand opens and separates from ${c.target_socket}`, minimum: 2, units: "px" }] };
      commands.push({ ...rel, executable: C.executable }); } }
  // coverage of the rest of the directed performance (each executed by its existing producer)
  const st = (rid) => (rigs.get(rid)?.geometry_status === "MEASURED" ? "EXECUTABLE" : "PENDING_GEOMETRY");
  for (const a of doc.actions) { for (const e of a.view_events || []) coverage.push({ kind: "VIEW", id: `${a.id}:${e.rig_id}@${e.frame}`, frames: [e.frame, e.frame + 1], from: e.from_state, to: e.to_state, executor: "action-graph view event (state_router.mjs / resolveBindings)", status: st(e.rig_id) });
    for (const e of a.pose_events || []) coverage.push({ kind: "POSE", id: `${a.id}:${e.rig_id}@${e.frame}`, frames: [e.frame, e.frame + 1], state: e.state_id, executor: "action-graph pose event + plan tracks/IK branches", status: st(e.rig_id) });
    for (const e of a.state_events || []) { const rid = e.rig ?? e.rig_id; coverage.push({ kind: "STATE", id: `${a.id}:${rid}.${e.channel}@${e.frame}`, frames: [e.frame, e.frame + 1], state: e.state, executor: "action-graph channel event (state_channels.mjs#channelEvents)", status: st(rid) }); }
    for (const x of a.actors || []) coverage.push({ kind: "ROOT", id: `${a.id}:${x.rig_id}`, frames: a.frame_range, world_xy: x.root_world_xy, scale: x.root_scale ?? 1, executor: "action actors placement + plan.tracks root", status: st(x.rig_id) }); }
  for (const [rid, A] of Object.entries(plan?.acting || {})) for (const [k, v] of Object.entries(A)) coverage.push({ kind: `ACTING_${k.toUpperCase()}`, id: `${rid}.${k}`, executor: "plan.acting (acting.mjs#compileActing: measured words / blink cadence)", detail: v.channel ?? null, status: st(rid) });
  for (const g of plan?.gaze || []) coverage.push({ kind: "GAZE", id: `${g.rig ?? g.rig_id}:${g.frames ?? g.frame}`, executor: "plan gaze aim layer (temporal.mjs#evalPrimary)", status: st(g.rig ?? g.rig_id) });
  for (const [id, cam] of Object.entries(plan?.cameras || {})) coverage.push({ kind: "CAMERA", id, executor: "plan.cameras (temporal.mjs#cameraAt)", framing: cam?.framing ?? null, status: cam?.framing === "SYMBOLIC" ? "PENDING_GEOMETRY" : "EXECUTABLE", ...(cam?.framing === "SYMBOLIC" ? { pending: "camera framing is a symbolic binding: transforms are solved from registered subject geometry (directed head size, subject boxes)" } : {}) });
  // support contracts: hands must be characters' hand roles, sockets must be the prop's
  const support = []; for (const sc of supportContracts) { const prob = []; for (const hnd of sc.hands) { const [rid, h] = hnd.ref.split("#"), C = charOf.get(rid); if (!C) prob.push(`${hnd.ref}: no character`); else if (!C.role_map[`hand.${h}.socket`]) prob.push(`${hnd.ref}: no hand role`); else if (!C.executable) prob.push(`${hnd.ref}: ${C.pending}`); }
    if (!rigs.get(sc.prop_rig_id) || rigs.get(sc.prop_rig_id).geometry_status !== "MEASURED") prob.push(`${sc.prop_rig_id}: prop rig not measured`);
    support.push({ ...sc, executable: !prob.length }); if (prob.length) pending.push({ kind: "SUPPORT_CONTRACT", id: sc.id, reason: prob.join("; ") });
    coverage.push({ kind: "PROP_SUPPORT", id: sc.id, frames: [Math.min(...sc.authority.map((x) => x.frames[0])), Math.max(...sc.authority.map((x) => x.frames[1]))], executor: "prop support contract (temporal.mjs prop drivers)", status: prob.length ? "PENDING_GEOMETRY" : "EXECUTABLE", pending: prob }); }
  for (const c of commands.filter((x) => !x.executable)) pending.push({ kind: "COMMAND", id: c.id, reason: charOf.get(c.actor_rig_id).pending });
  const strip = (o) => { const { executable, pending: _p, ...rest } = o; return rest; };
  const full = { schema_version: "1.1.0", film_id: doc.project_id, fps, total_frames: total, characters: characters.map(strip), commands: commands.map(strip) };
  const exeChars = characters.filter((c) => c.executable), exeIds = new Set(exeChars.map((c) => c.actor_rig_id));
  const executable = { schema_version: "1.1.0", film_id: doc.project_id, fps, total_frames: total, characters: exeChars.map(strip), commands: commands.filter((c) => exeIds.has(c.actor_rig_id)).map(strip) };
  const exeSupport = { schema_version: "1.1.0", props: support.filter((s) => s.executable).map(strip) };
  return { full, executable, prop_support: { schema_version: "1.1.0", props: support.map(strip) }, executable_prop_support: exeSupport.props.length ? exeSupport : null, coverage, pending,
    profiles_required: characters.map((c) => ({ id: c.character_profile_id, actor_rig_id: c.actor_rig_id, provided: !!profiles[c.character_profile_id], status: profiles[c.character_profile_id]?.approval?.status ?? "MISSING" })) };
}
