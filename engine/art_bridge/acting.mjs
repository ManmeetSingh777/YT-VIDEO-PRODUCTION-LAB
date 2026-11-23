// Acting-track compiler + phrase layering (P03 repairs A and D). Produces deterministic, frame-addressable motion from DIRECTED intentions
// on the REGISTERED rig — the art-driven equivalent of the original neutrino `S.actor` (lagged poses, breathing, blink, mouth shapes,
// follow-through) without its hard-coded character: joints, depths and pivots come from the rig (fitted to approved art), visible changes
// (blink, speech, expressions) are SWAPS between approved drawings of explicit state channels, and nothing scales or stretches artwork.
//
// Layer precedence (the order compileMotionTracks applies them):
//   1 approved direction/action intent (manifest actions, events)   2 primary motion: authored tracks + compiled PHRASES (plan.phrases)
//   3 ACTING modifications (plan.acting)                             4 contact / reach / support constraints (temporal.solveConstraints)
//   5 approved art-state selection (state channels)                  6 render matrices + paint passes (scene_graph)
// A later layer never silently erases an earlier one: joints that contact IK takes over are REPORTED (`suppressed_by_contact`), limit
// violations are failures (ACTING_UNEXECUTABLE), and an unexecutable phrase names the missing owner/capability (PHRASE_UNEXECUTABLE).
//
// plan.acting[rigId] = {
//   lag:         { frames_per_depth, lead_joints?: [jointId] }            successive breaking: deeper joints follow later (topology depth)
//   anticipation:{ frames, ratio, min_delta_deg }                         counter-move before a large key change
//   settle:      { overshoot_ratio, frames, min_delta_deg }               overshoot past the target, then settle
//   breath:      { joint, amplitude_deg, period_frames, phase_frames? }   additive torso/body breathing (rotation only)
//   sway:        [{ joint, amplitude_deg, period_frames, phase_frames? }] additive idle life on any joints
//   follow:      [{ joint, driver_joint, stiffness, damping, gain }]      hair / clothing / accessory follow-through (baked springs)
//   gaze:        { joint, target: {rig, socket} | {world_xy}, gain, max_deg, frames? }   head/eye aim toward a target (additive)
//   blink:       { channel, open, closed, period_frames, duration_frames, phase_frames?, extra_frames?: [f] }
//   speech:      { channel, rest, open, mid?, words: [{start_s, end_s, w}] }   measured narration words → mouth-state swaps
// }
import { err } from "./errors.mjs";
import { compilePhrase } from "./motion_systems.mjs";

const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));
/** phrases → primary tracks. Owner ids: "<rig>.<joint>", "<rig>.root.<x|y|rot|scale>", "<camera>.<x|y|zoom|rot>". */
export function layerPhrases(doc, plan) {
  if (!plan.phrases?.length) return { plan, errors: [], report: [] };
  const out = clone(plan), errors = [], report = [];
  for (const ph of plan.phrases || []) {
    const r = compilePhrase(ph); if (!r.ok) { errors.push(err("PHRASE_UNEXECUTABLE", { record_id: ph.id, reason: r.failures.map((x) => `${x.code}: ${x.reason}`).join("; "), producer: "engine/art_bridge/acting.mjs#layerPhrases" })); continue; }
    for (const [owner, tr] of Object.entries(r.tracks)) {
      const parts = owner.split("."), rig = doc.rigs.find((x) => x.id === parts[0]), cam = (plan.cameras || {})[parts[0]] !== undefined || doc.shots.some((s) => s.camera_track_id === parts[0]);
      const put = (container, key) => { if (container[key]) { errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: `${ph.id}:${owner}`, reason: `phrase ${ph.id} and an authored track both own ${owner}` })); return; } container[key] = tr.keys.map((k) => [...k]); report.push({ phrase: ph.id, owner, keys: tr.keys.length }); };
      if (rig && parts[1] === "root" && ["x", "y", "rot", "scale"].includes(parts[2])) { const t = ((out.tracks ||= {})[rig.id] ||= {}); put((t.root ||= {}), parts[2]); }
      else if (rig && rig.joints.some((j) => j.id === parts[1]) && parts.length === 2) { const t = ((out.tracks ||= {})[rig.id] ||= {}); put((t.joints ||= {}), parts[1]); }
      else if (cam && ["x", "y", "zoom", "rot"].includes(parts[1])) { put(((out.cameras ||= {})[parts[0]] ||= {}), parts[1]); }
      else errors.push(err("PHRASE_UNEXECUTABLE", { record_id: `${ph.id}:${owner}`, reason: `phrase owner ${owner} names no rig joint, rig root property or camera property: missing capability (declare the owner or request the art/rig that provides it)`, producer: "engine/art_bridge/acting.mjs#layerPhrases" }));
    }
  }
  return { plan: out, errors, report };
}
const depthOf = (rig) => { const byId = new Map(rig.joints.map((j) => [j.id, j])), d = {}; for (const j of rig.joints) { let n = 0, p = j.parent_id; while (p) { n++; p = byId.get(p)?.parent_id; } d[j.id] = n; } return d; };
const syllables = (w) => Math.max(1, (String(w).toLowerCase().match(/[aeiouy]+/g) || []).length);
/** compileActing(doc, plan, {fps}) → { plan (with acting applied), events (channel swaps), additive, report, errors } */
export function compileActing(doc, plan, { fps = doc.stage?.fps || 60, actions = doc.actions } = {}) {
  if (!plan.acting || !Object.keys(plan.acting).length) return { plan, events: [], additive: {}, report: {}, errors: [] };
  const out = clone(plan), errors = [], events = [], additive = {}, report = {}, total = doc.stage.total_frames;
  for (const [rid, A] of Object.entries(plan.acting || {})) {
    const rig = doc.rigs.find((r) => r.id === rid); if (!rig) { errors.push(err("ACTING_UNEXECUTABLE", { record_id: rid, reason: "acting block for an unknown rig" })); continue; }
    const J = new Map(rig.joints.map((j) => [j.id, j])), depth = depthOf(rig), rep = (report[rid] = { lagged: {}, anticipations: 0, settles: 0, additive: [], follow: [], blinks: 0, speech_swaps: 0, gaze: null }), tr = ((out.tracks ||= {})[rid] ||= {}), joints = (tr.joints ||= {});
    const needJoint = (j, what) => { if (!J.has(j)) { errors.push(err("ACTING_UNEXECUTABLE", { record_id: `${rid}.${j}`, reason: `${what} names joint ${j}, which rig ${rid} does not have (the approved art/rig must provide it)` })); return false; } return true; };
    for (const [j, keys] of Object.entries(joints)) {
      let k = keys.map((x) => [...x]);
      if (A.anticipation) { const { frames: a, ratio, min_delta_deg = 10 } = A.anticipation, n = []; for (let i = 0; i < k.length; i++) { if (i) { const [f0, v0] = k[i - 1], [f1, v1] = k[i], d = v1 - v0; if (Math.abs(d) >= min_delta_deg && f1 - f0 > a + 2) { n.push([f0 + a, v0 - ratio * d, "sine.out"]); rep.anticipations++; } } n.push(k[i]); } k = n; }
      if (A.settle) { const { overshoot_ratio: o, frames: s, min_delta_deg = 10 } = A.settle, n = []; for (let i = 0; i < k.length; i++) { const [f1, v1, e] = k[i]; if (i && Math.abs(v1 - k[i - 1][1]) >= min_delta_deg && (i === k.length - 1 || k[i + 1][0] - f1 > s + 2)) { n.push([f1, v1 + o * (v1 - k[i - 1][1]), e]); n.push([f1 + s, v1, "sine.inOut"]); rep.settles++; } else n.push(k[i]); } k = n; }
      if (A.lag && !(A.lag.lead_joints || []).includes(j)) { const L = Math.round((A.lag.frames_per_depth || 0) * (depth[j] || 0)); if (L) { k = k.map(([f, v, e], i) => [i === 0 ? f : Math.min(total - 1, f + L), v, e]); rep.lagged[j] = L; } }
      for (let i = 1; i < k.length; i++) if (k[i][0] <= k[i - 1][0]) k[i][0] = k[i - 1][0] + 1; // keep strictly increasing after insertions
      const lim = J.get(j)?.rotation_limits_deg; if (lim) for (const [f, v] of k) if (v < lim[0] - 1e-6 || v > lim[1] + 1e-6) errors.push(err("ACTING_UNEXECUTABLE", { record_id: `${rid}.${j}`, frame_range: [f, f + 1], reason: `acting key ${v.toFixed(1)}° outside the approved joint limit [${lim}] (anticipation/settle would stretch past the rig fitted to the art)` }));
      joints[j] = k; }
    for (const b of [A.breath, ...(A.sway || [])].filter(Boolean)) { if (!needJoint(b.joint, "breath/sway")) continue; const lim = J.get(b.joint).rotation_limits_deg;
      if (lim && (b.amplitude_deg > Math.min(Math.abs(lim[0]), Math.abs(lim[1])))) errors.push(err("ACTING_UNEXECUTABLE", { record_id: `${rid}.${b.joint}`, reason: `breath/sway amplitude ${b.amplitude_deg}° exceeds the joint limit` }));
      (additive[`${rid}.${b.joint}`] ||= []).push({ type: "sine", amp: b.amplitude_deg, period: b.period_frames, phase: b.phase_frames || 0 }); rep.additive.push({ joint: b.joint, amp: b.amplitude_deg, period: b.period_frames }); }
    for (const fo of A.follow || []) { if (!needJoint(fo.joint, "follow") || !needJoint(fo.driver_joint, "follow driver")) continue; if (joints[fo.joint]) { errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: `${rid}.${fo.joint}`, reason: "follow-through joint already has an authored track" })); continue; }
      (out.secondary ||= []).push({ id: `acting:${rid}.${fo.joint}`, rig: rid, joint: fo.joint, driver: { rig: rid, joint: fo.driver_joint }, stiffness: fo.stiffness, damping: fo.damping, gain: fo.gain, substeps: fo.substeps || 4 }); rep.follow.push(fo.joint); }
    if (A.gaze) { if (needJoint(A.gaze.joint, "gaze")) { (out.__gaze ||= {})[`${rid}.${A.gaze.joint}`] = A.gaze; rep.gaze = A.gaze.joint; } }
    const chan = (id) => (rig.state_channels || []).find((c) => c.id === id), needState = (c, s, what) => { if (!c?.states.some((x) => x.id === s)) { errors.push(err("MISSING_ART_ASSET", { record_id: `${rid}.${c?.id ?? "?"}.${s}`, suggested_producer: "GPT state manufacture (source-attached edit of the approved master)", reason: `${what} needs approved state ${s} in channel ${c?.id ?? "(undeclared)"}` })); return false; } return true; };
    // acting windows: frames where this rig is on screen in an action (blinks/speech never happen off-screen or outside its shots)
    const windows = actions.filter((a) => a.actors.some((x) => x.rig_id === rid)).map((a) => [a.frame_range[0], a.frame_range[1], a.shot_id]);
    const inWin = (f) => windows.find(([s, e]) => f >= s && f < e);
    if (A.blink) { const B = A.blink, c = chan(B.channel); if (needState(c, B.open, "blink") && needState(c, B.closed, "blink")) { const fs_ = new Set(B.extra_frames || []); for (let f = B.phase_frames || 0; f < total; f += B.period_frames) fs_.add(f);
      for (const f of [...fs_].sort((p, q) => p - q)) { const w = inWin(f); if (!w || f + B.duration_frames >= w[1]) continue; events.push({ frame: f, rig: rid, channel: B.channel, state: B.closed, shot: w[2], source: "acting:blink" }, { frame: f + B.duration_frames, rig: rid, channel: B.channel, state: B.open, shot: w[2], source: "acting:blink" }); rep.blinks++; } } }
    if (A.speech) { const Sp = A.speech, c = chan(Sp.channel); if (needState(c, Sp.rest, "speech") && needState(c, Sp.open, "speech") && (!Sp.mid || needState(c, Sp.mid, "speech"))) {
      for (const w of Sp.words || []) { const f0 = Math.round(w.start_s * fps), f1 = Math.max(f0 + 1, Math.round(w.end_s * fps)), win = inWin(f0); if (!win) continue; const n = syllables(w.w), len = (f1 - f0) / n;
        for (let i = 0; i < n; i++) { const a = Math.round(f0 + i * len), m = Math.round(a + len * 0.6); events.push({ frame: a, rig: rid, channel: Sp.channel, state: Sp.open, shot: win[2], source: `acting:speech:${w.w}` }); if (Sp.mid && m > a && m < f1) events.push({ frame: m, rig: rid, channel: Sp.channel, state: Sp.mid, shot: win[2], source: `acting:speech:${w.w}` }); rep.speech_swaps++; }
        events.push({ frame: f1, rig: rid, channel: Sp.channel, state: Sp.rest, shot: win[2], source: `acting:speech:${w.w}` }); } } }
  }
  out.__additive = additive; out.__acting_events = [...(plan.__acting_events || []), ...events].sort((p, q) => p.frame - q.frame); out.__acting_report = report;
  return { plan: out, events, additive, report, errors };
}
