// Semantic motion-plan compiler (general): the GEOMETRY-INDEPENDENT half of a film's motion plan, compiled from the compiled manifest (actions,
// actors, pose/view/state/contact events, shots) and the approved packet's measured sources (word timeline, performance states, prop support,
// photo intent, continuity). Geometry-dependent quantities (joint angles, contact transforms, camera framing in pixels, support heights) are
// SYMBOLIC bindings with explicit dependencies, bound later from approved, registered art — never invented here.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { channelEvents, channelStatesAt, rigPoseTimeline, poseAt } from "../art_bridge/state_channels.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
export function parseCSV(text) { const rows = [], re = /("([^"]|"")*"|[^,\n\r]*)(,|\r?\n|$)/g; let row = [], m; while ((m = re.exec(text)) && m[0] !== "") { let v = m[1]; if (v.startsWith('"')) v = v.slice(1, -1).replace(/""/g, '"'); row.push(v); if (m[3] !== ",") { rows.push(row); row = []; } } const [h, ...b] = rows.filter((r) => r.length > 1 || r[0]); return b.map((r) => Object.fromEntries(h.map((k, i) => [k, r[i] ?? ""]))); }

/** compileSemanticMotionPlan({doc, sources: {words, performance, reconciliation, shotTimeline, continuity}, packetSha, blink}) → plan */
export function compileSemanticMotionPlan({ doc, sources, packetSha, blinkDefaults = {}, qualification = null }) {
  const total = doc.stage.total_frames, fps = doc.stage.fps, rigs = doc.rigs.filter((r) => doc.actions.some((a) => a.actors.some((x) => x.rig_id === r.id)));
  const plan = { id: `${doc.project_id}_semantic`, status: "SEMANTIC_COMPILED_GEOMETRY_SYMBOLIC", packet_sha256: packetSha, fps, frames: [0, total], qualification, generated_by: "engine/story/semantic_motion_plan.mjs",
    tracks: {}, pose_targets: [], view_targets: [], gaze: [], reaches: {}, support: sources.reconciliation?.prop_support || null, photo_intent: sources.reconciliation?.photo_intent || null, persistent_contacts: sources.reconciliation?.persistent_contacts || [],
    acting: {}, cameras: {}, cuts: [], continuity: sources.continuity || [], outgoing: null, symbolic_bindings: [] };
  const bind = (id, what, depends) => plan.symbolic_bindings.push({ id, what, status: "UNBOUND", depends_on: depends });
  for (const r of rigs) {
    // root placement: directed world positions per action (the packet's actors[].root_world_xy), stepped at action starts
    const keys = doc.actions.flatMap((a) => a.actors.filter((x) => x.rig_id === r.id && x.root_world_xy).map((x) => [a.frame_range[0], x.root_world_xy, x.root_scale ?? 1])).sort((p, q) => p[0] - q[0]), uniq = [];
    for (const k of keys) if (!uniq.length || JSON.stringify(uniq.at(-1).slice(1)) !== JSON.stringify(k.slice(1))) uniq.push(k);
    plan.tracks[r.id] = { root: { x: uniq.map(([f, xy]) => [f, xy[0]]), y: uniq.map(([f, xy]) => [f, xy[1]]), scale: uniq.map(([f, , s]) => [f, s]) }, joints: {} };
    for (const j of r.joints || []) if (j.parent_id) bind(`${r.id}.joint.${j.id}`, "joint rotation keys for the directed poses", [`${r.id} approved registered parts`, `${r.id}.${j.id} measured rest geometry`]);
    for (const a of doc.actions) for (const e of a.pose_events || []) if ((e.rig_id ?? e.rig) === r.id || (!e.rig_id && a.actors.length === 1 && a.actors[0].rig_id === r.id)) plan.pose_targets.push({ rig: r.id, frame: e.frame, pose: e.state_id, action: a.id });
    for (const a of doc.actions) for (const e of a.view_events || []) if ((e.rig_id ?? e.rig) === r.id) plan.view_targets.push({ rig: r.id, frame: e.frame, from: e.from_state, to: e.to_state, action: a.id });
  }
  plan.pose_targets.sort((p, q) => p.frame - q.frame); plan.view_targets.sort((p, q) => p.frame - q.frame);
  // gaze: directed targets per performance interval
  for (const p of sources.performance || []) plan.gaze.push({ rig: p.owner, interval: [+p.absolute_start, +p.absolute_end_exclusive], target: p.gaze_target, view_requirement: p.view_requirement, state: p.state_id });
  // contacts: acquisition/support/transfer/release windows from the action graph (exact frames); transforms are symbolic until sockets are measured
  for (const a of doc.actions) for (const c of a.contact_events || []) { const id = `${a.id}:${c.source_socket}->${c.target_socket}@${c.start_frame}`;
    plan.reaches[id] = { source: c.source_socket, target: c.target_socket, type: c.contact_type, approach: [Math.max(0, c.start_frame - 0), c.start_frame], hold: [c.start_frame, c.end_frame], release: c.release_behavior, allowed_error_px: c.allowed_error_px, orient: "RELATIVE" };
    bind(`contact.${id}`, "contact transform (socket-to-socket)", [`${c.source_socket} measured`, `${c.target_socket} measured`]); }
  // acting: measured speech words per speaker rig; blink cadence (engine default unless directed) with directed exclusions
  const byRig = {}; for (const w of sources.words || []) (byRig[w.actor] ||= []).push({ start_s: +w.absolute_start_s, end_s: +w.absolute_end_s, w: w.label, cue: w.cue_id });
  for (const r of rigs) { const ch = (k) => (r.state_channels || []).find((c) => c.kind === k), mouth = ch("MOUTH"), eyes = ch("EYES"), A = {};
    if (mouth && byRig[r.id]?.length) A.speech = { channel: mouth.id, rest: mouth.default, open: "open", mid: "mid", words: byRig[r.id].sort((p, q) => p.start_s - q.start_s), source: "MEASURED_WORD_TIMELINE.csv" };
    if (eyes?.states.some((s) => s.id === "blink_closed")) { const b = blinkDefaults[r.id] || blinkDefaults["*"]; if (b) A.blink = { channel: eyes.id, open: "blink_open", closed: "blink_closed", ...b }; }
    if (Object.keys(A).length) plan.acting[r.id] = A; }
  // camera: locked shots from the shot timeline; framing in pixels is geometry-dependent
  for (const s of doc.shots) { plan.cameras[s.id] = { frames: [s.start_frame, s.end_frame], mode: /locked/i.test(s.entry_state || "") ? "LOCKED" : "AS_DIRECTED", entry_state: s.entry_state, framing: "SYMBOLIC" };
    if (s.start_frame > 0) plan.cuts.push(s.start_frame); bind(`camera.${s.id}`, "camera rect/zoom from measured on-screen sizes (heads, report width) and world planes", ["ART_ENV01 planes approved", "measured actor head heights"]); }
  // outgoing state at the last frame: every rig's pose, view and channel states (recoverable for the freeze/continuation)
  const last = total - 1; plan.outgoing = { frame: last, rigs: Object.fromEntries(rigs.map((r) => { const pe = rigPoseTimeline(r, doc.actions), { pose, view } = poseAt(r, pe, last), ce = channelEvents(r, doc.actions).events; return [r.id, { pose, view, channels: channelStatesAt(r, ce, last) }]; })) };
  plan.qualification_note = qualification ? `qualification extract [${qualification[0]},${qualification[1]})` : null;
  return plan;
}

/** loadE01StyleSources(packetDir) — reads the measured sources a P3-style packet ships (general file names; absent files are skipped) */
export function loadPacketSources(pdir) { const s = path.join(pdir, "source"), rd = (f) => fs.existsSync(path.join(s, f)) ? fs.readFileSync(path.join(s, f), "utf8") : null, out = {}, used = {};
  const take = (k, f, parse) => { const t = rd(f); if (t != null) { out[k] = parse(t); used[f] = sha(t); } };
  take("words", "MEASURED_WORD_TIMELINE.csv", parseCSV); take("performance", "PERFORMANCE_STATES_P3_2.csv", parseCSV); take("continuity", "E01_CONTINUITY_PHASE1_P3.csv", parseCSV);
  take("reconciliation", "P08_MOTION_RECONCILIATION_SOURCE.json", JSON.parse); return { sources: out, used }; }
