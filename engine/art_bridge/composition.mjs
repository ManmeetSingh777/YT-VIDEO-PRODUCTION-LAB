// P08 A01/A03 + compositional-motion addendum — COMPOSITION_CONTRACT v1.0.0. Unfamiliar directed actions are compiled as SEQUENCES and PARALLEL
// combinations of reusable low-level primitives, each with a declared owner, coordinate space, absolute half-open interval, inputs, interpolation,
// dependencies/synchronisation, end policy, limits, precedence and EXPECTED EFFECT. Primitives compile into the SAME plan surfaces the semantic
// commands use (one clock, one evaluator: temporal.mjs#compileMotionTracks → stateAtFrame → composeShot); there is no second timeline.
//   JOINT_ROTATE   rig.joint  local degrees   → plan.tracks[rig].joints[j]          PRIMARY (absolute, one writer per instant)
//   ROOT_MOVE      rig        world px/deg     → plan.tracks[rig].root.{x,y,rot}     PRIMARY
//   OSCILLATE      rig.joint  local degrees   → plan.__additive[rig.joint]          ADDITIVE (bounded amplitude, windowed)
//   AIM            rig.joint  world target    → plan.__gaze[rig.joint]              ADDITIVE AIM (bounded max_deg, weight ramp)
//   STATE_SWAP     rig.channel approved state → plan.__acting_events                 STATE (approved drawings only)
//   PLANT / REACH  rig.socket world/socket    → actions[].contact_events (+reaches) CONSTRAINT (solved last; owns its IK chain while locked)
//   CAMERA_MOVE    camera track               → plan.cameras[track]                  PRIMARY (camera owner only — never actor evidence)
// The interval-indexed WRITE SET (owner, property, interval, producer, mode) is produced for the WHOLE compiled plan (semantic commands too), and
// verifyComposition measures every primitive's owner effect on every frame of its interval from the evaluated state the renderer draws.
import { err } from "./errors.mjs";
const P = "engine/art_bridge/composition.mjs";
export const COMPOSITION_VERSION = "1.0.0";
/** supported-parameter domain per primitive (what each producer can execute; anything outside is a precise typed refusal) */
export const PRIMITIVE_DOMAIN = Object.freeze({
  JOINT_ROTATE: { owner: "rig.joint", space: "LOCAL_DEG", inputs: ["keys"], modes: ["PRIMARY"], limit: "joint rotation_limits_deg", end: ["HOLD", "RETURN_TO_REST"] },
  ROOT_MOVE: { owner: "rig", space: "WORLD_PX", inputs: ["x?", "y?", "rot?"], modes: ["PRIMARY"], limit: "max_speed_px_per_frame (declared)", end: ["HOLD"] },
  OSCILLATE: { owner: "rig.joint", space: "LOCAL_DEG", inputs: ["amplitude_deg", "period_frames", "phase?"], modes: ["ADDITIVE"], limit: "amplitude ≤ max_amplitude_deg (declared, ≤ 45) and inside joint limits", end: ["RAMP_OUT"] },
  AIM: { owner: "rig.joint", space: "WORLD_TARGET", inputs: ["target", "max_deg", "forward_deg?"], modes: ["AIM"], limit: "max_deg ≤ joint limit span", end: ["RELEASE"] },
  STATE_SWAP: { owner: "rig.channel", space: "APPROVED_STATE", inputs: ["events"], modes: ["STATE"], limit: "approved channel states (and approved edges when the channel declares edges)", end: ["HOLD"] },
  PLANT: { owner: "rig.socket", space: "WORLD_PX", inputs: ["world_xy | at_frame_fk"], modes: ["CONSTRAINT"], limit: "IK reach + joint limits + approved bend branch", end: ["RELEASE"] },
  REACH: { owner: "rig.socket", space: "WORLD_OR_SOCKET", inputs: ["target", "approach_from"], modes: ["CONSTRAINT"], limit: "IK reach + joint limits", end: ["RELEASE"] },
  CAMERA_MOVE: { owner: "camera", space: "WORLD_PX", inputs: ["x?", "y?", "zoom?", "rot?"], modes: ["PRIMARY"], limit: "framing gate (subjects stay visible)", end: ["HOLD"] } });
const refuse = (code, prim, o) => err(code, { record_id: prim?.id ?? o.record ?? null, frame_range: o.frame_range ?? prim?.frames ?? null, reason: o.reason, producer: `${P}#${o.fn ?? "compileComposition"}`, failed_invariant: o.invariant, required_art_or_operation: o.needed ? [].concat(o.needed) : [], details: { primitive: prim?.id ?? null, kind: prim?.kind ?? null, owner: prim?.owner ?? null, failed_invariant: o.invariant, needed_art_or_capability: o.needed ?? null } });
const overl = (a, b) => a[0] < b[1] && b[0] < a[1];
/** resolve sequence/parallel synchronisation to absolute frames, deterministically (topological; a cycle is refused) */
export function resolveSchedule(prims) {
  const errors = [], byId = new Map(prims.map((p) => [p.id, p])), out = new Map(), state = new Map();
  const visit = (p) => { if (out.has(p.id)) return out.get(p.id); if (state.get(p.id) === "visiting") { errors.push(refuse("COMPOSITION_INVALID", p, { invariant: "SYNC_ACYCLIC", reason: `synchronisation cycle through ${p.id}` })); return null; } state.set(p.id, "visiting");
    let fr = p.frames ? [...p.frames] : null; const s = p.sync;
    if (s) { const ref = byId.get(s.ref); if (!ref) { errors.push(refuse("COMPOSITION_INVALID", p, { invariant: "SYNC_REF_EXISTS", reason: `${p.id} synchronises to unknown primitive ${s.ref}` })); return null; } const rf = visit(ref); if (!rf) return null;
      const base = s.relation === "AFTER_END" ? rf[1] : s.relation === "WITH_START" ? rf[0] : s.relation === "BEFORE_END" ? rf[1] : null; if (base === null || !Number.isInteger(p.duration)) { errors.push(refuse("COMPOSITION_INVALID", p, { invariant: "SYNC_RELATION", reason: `${p.id}: sync needs relation AFTER_END | WITH_START | BEFORE_END and an integer duration` })); return null; }
      const start = s.relation === "BEFORE_END" ? base - p.duration - (s.offset ?? 0) : base + (s.offset ?? 0); fr = [start, start + p.duration]; }
    if (!fr || !(fr[1] > fr[0]) || fr[0] < 0) { errors.push(refuse("INVALID_FRAME_RANGE", p, { invariant: "PRIMITIVE_INTERVAL", reason: `${p.id} needs a non-empty absolute interval (frames or sync+duration)` })); return null; }
    state.set(p.id, "done"); out.set(p.id, fr); return fr; };
  for (const p of prims) visit(p);
  return { frames: out, errors };
}
const shiftKeys = (keys, f0) => keys.map(([f, v, e]) => [f0 + f, v, ...(e ? [e] : [])]); // primitive keys are RELATIVE to the primitive's start
/** compileComposition(doc, plan) → {plan, doc, report, errors}: primitives → existing plan surfaces, with domain checks */
export function compileComposition(doc, plan) {
  const spec = plan?.composition; if (!spec) return { plan, doc, report: null, errors: [] };
  const errors = [], out = JSON.parse(JSON.stringify({ ...plan, composition: undefined })), D = JSON.parse(JSON.stringify(doc)); delete out.composition;
  if (spec.schema_version !== COMPOSITION_VERSION) return { plan, doc, report: null, errors: [refuse("COMPOSITION_INVALID", null, { record: "composition", invariant: "COMPOSITION_V1", reason: `composition schema_version ${spec.schema_version} (1.0.0 required)` })] };
  const prims = spec.primitives || [], ids = new Set(); for (const p of prims) { if (ids.has(p.id)) errors.push(refuse("DUPLICATE_ELEMENT_ID", p, { invariant: "PRIMITIVE_ID_UNIQUE", reason: `primitive id ${p.id} used twice` })); ids.add(p.id); }
  const sched = resolveSchedule(prims); errors.push(...sched.errors); if (errors.length) return { plan, doc, report: null, errors };
  const rigs = new Map(D.rigs.map((r) => [r.id, r])), recs = [], total = D.stage.total_frames;
  const actionFor = (rid, fr) => D.actions.find((a) => a.actors.some((x) => x.rig_id === rid) && a.frame_range[0] <= fr[0] && fr[1] <= a.frame_range[1]);
  for (const p of prims) {
    const fr = sched.frames.get(p.id), dom = PRIMITIVE_DOMAIN[p.kind], no = (code, o) => errors.push(refuse(code, p, { frame_range: fr, ...o }));
    if (!dom) { no("PERFORMANCE_CAPABILITY_MISSING", { invariant: "PRIMITIVE_HAS_PRODUCER", reason: `primitive kind ${p.kind} has no producer (known: ${Object.keys(PRIMITIVE_DOMAIN).join(", ")})`, needed: `a producer for ${p.kind}` }); continue; }
    if (!p.expected_effect?.kind) { no("COMPOSITION_INVALID", { invariant: "PRIMITIVE_DECLARES_EFFECT", reason: `${p.id} must declare its expected owner effect (its consumer proof)` }); continue; }
    if (fr[1] > total) { no("INVALID_FRAME_RANGE", { invariant: "INSIDE_FILM", reason: `${p.id} [${fr}) leaves the film [0,${total})` }); continue; }
    const [rid, sub] = String(p.owner).split("."), rig = rigs.get(rid), rec = { id: p.id, kind: p.kind, owner: p.owner, frames: fr, mode: dom.modes[0], space: dom.space, effect: p.expected_effect, inputs: p.inputs, end: p.end ?? dom.end[0], depends_on: [...(p.depends_on || []), ...(p.sync ? [p.sync.ref] : [])], required_art: p.required_art || [] };
    if (p.kind !== "CAMERA_MOVE" && !rig) { no("UNKNOWN_REFERENCE", { invariant: "OWNER_EXISTS", reason: `${p.id}: owner rig ${rid} is not in the manifest` }); continue; }
    const J = (j) => rig.joints.find((x) => x.id === j);
    switch (p.kind) {
      case "JOINT_ROTATE": { const j = J(sub); if (!j) { no("UNKNOWN_REFERENCE", { invariant: "JOINT_EXISTS", reason: `${p.owner} is not a joint` }); break; } const ks = p.inputs?.keys; if (!Array.isArray(ks) || !ks.length || ks[0][0] !== 0 || ks.at(-1)[0] > fr[1] - fr[0]) { no("COMPOSITION_INVALID", { invariant: "KEYS_RELATIVE_INSIDE", reason: `${p.id}: keys are relative frames starting at 0 and ending ≤ ${fr[1] - fr[0]}` }); break; }
        for (const [, v] of ks) if (v < j.rotation_limits_deg[0] - 1e-6 || v > j.rotation_limits_deg[1] + 1e-6) no("JOINT_LIMIT_EXCEEDED", { invariant: "PRIMITIVE_IN_DOMAIN", reason: `${p.owner} key ${v}° outside approved [${j.rotation_limits_deg}] (needs an approved bend cel or restaging)`, needed: `approved ${p.owner} pose beyond ${j.rotation_limits_deg}` });
        const abs = shiftKeys(ks, fr[0]); if (rec.end === "RETURN_TO_REST" && abs.at(-1)[1] !== 0) abs.push([fr[1] - 1, 0, "sine.inOut"]);
        const T = (((out.tracks ||= {})[rid] ||= {}).joints ||= {}), prev = T[sub]; if (prev && !(prev.__composed)) { no("INVALID_TRANSFORM_OWNER", { invariant: "ONE_PRIMARY_WRITER", reason: `${p.owner} already has an authored track; a composed rotation would be a second absolute writer` }); break; }
        const merged = [...(prev || []).filter((k) => Array.isArray(k)), ...abs].sort((a, b) => a[0] - b[0]); for (let i = 1; i < merged.length; i++) if (merged[i][0] === merged[i - 1][0] && merged[i][1] !== merged[i - 1][1]) no("INVALID_TRANSFORM_OWNER", { invariant: "ONE_PRIMARY_WRITER", frame_range: [merged[i][0], merged[i][0] + 1], reason: `two composed rotations key ${p.owner} at ${merged[i][0]}` });
        T[sub] = merged.filter((k, i, a) => !i || k[0] !== a[i - 1][0]); Object.defineProperty(T[sub], "__composed", { value: true, enumerable: false }); rec.abs_keys = abs; break; }
      case "ROOT_MOVE": { const R0 = (((out.tracks ||= {})[rid] ||= {}).root ||= {}); rec.abs = {};
        for (const k of ["x", "y", "rot"]) { const ks = p.inputs?.[k]; if (!ks) continue; if (ks[0][0] !== 0 || ks.at(-1)[0] > fr[1] - fr[0]) { no("COMPOSITION_INVALID", { invariant: "KEYS_RELATIVE_INSIDE", reason: `${p.id}.${k}: relative keys inside [0,${fr[1] - fr[0]}]` }); continue; }
          const abs = shiftKeys(ks, fr[0]), mx = p.limits?.max_speed_px_per_frame; if (k !== "rot" && mx !== undefined) for (let i = 1; i < abs.length; i++) { const v = Math.abs(abs[i][1] - abs[i - 1][1]) / Math.max(1, abs[i][0] - abs[i - 1][0]); if (v > mx * 1.6) no("PERFORMANCE_PROFILE_INVALID", { invariant: "PRIMITIVE_IN_DOMAIN", reason: `${p.id}.${k}: mean speed ${v.toFixed(2)} px/f between keys exceeds the declared ${mx}` }); }
          if (R0[k] && !R0[k].__composed) { no("INVALID_TRANSFORM_OWNER", { invariant: "ONE_PRIMARY_WRITER", reason: `${rid}.root.${k} already has an authored track` }); continue; } const merged = [...(R0[k] || []), ...abs].sort((a, b) => a[0] - b[0]); R0[k] = merged; Object.defineProperty(R0[k], "__composed", { value: true, enumerable: false }); rec.abs[k] = abs; } break; }
      case "OSCILLATE": { const j = J(sub); if (!j) { no("UNKNOWN_REFERENCE", { invariant: "JOINT_EXISTS", reason: `${p.owner} is not a joint` }); break; } const A = p.inputs?.amplitude_deg, T_ = p.inputs?.period_frames, cap = Math.min(45, p.limits?.max_amplitude_deg ?? 45);
        if (!(A > 0) || !(A <= cap)) { no("PERFORMANCE_PROFILE_INVALID", { invariant: "PRIMITIVE_IN_DOMAIN", reason: `${p.id}: amplitude ${A}° outside (0, ${cap}]` }); break; } if (!(T_ >= 4)) { no("PERFORMANCE_PROFILE_INVALID", { invariant: "PRIMITIVE_IN_DOMAIN", reason: `${p.id}: period ${T_} frames (≥ 4)` }); break; }
        ((out.__additive ||= {})[p.owner] ||= []).push({ amp: A, period: T_, phase: p.inputs.phase ?? 0, frames: fr, source: `composition:${p.id}` }); rec.amp = A; rec.period = T_; rec.phase = p.inputs.phase ?? 0; break; }
      case "AIM": { const j = J(sub); if (!j) { no("UNKNOWN_REFERENCE", { invariant: "JOINT_EXISTS", reason: `${p.owner} is not a joint` }); break; } const span = Math.max(Math.abs(j.rotation_limits_deg[0]), Math.abs(j.rotation_limits_deg[1])), m = p.inputs?.max_deg ?? span;
        if (m > span + 1e-6) { no("PERFORMANCE_PROFILE_INVALID", { invariant: "PRIMITIVE_IN_DOMAIN", reason: `${p.id}: max_deg ${m} exceeds the joint's approved span ${span}` }); break; } const ramp = Math.max(1, Math.min(12, Math.floor((fr[1] - fr[0]) / 4)));
        const g = { joint: sub, target: p.inputs.target, gain: 1, max_deg: m, forward_deg: p.inputs.forward_deg ?? 0, frames: fr, weight: [[fr[0], 0], [fr[0] + ramp, 1, "sine.inOut"], [fr[1] - ramp, 1], [fr[1] - 1, 0, "sine.inOut"]], source: `composition:${p.id}` };
        const k = `${rid}.${sub}`; (out.__gaze ||= {})[k] = [].concat(out.__gaze[k] || [], g); rec.hold = [fr[0] + ramp, fr[1] - ramp]; break; }
      case "STATE_SWAP": { const ch = (rig.state_channels || []).find((c) => c.id === sub); if (!ch) { no("UNKNOWN_REFERENCE", { invariant: "CHANNEL_EXISTS", reason: `${p.owner} is not a state channel` }); break; } const evs = p.inputs?.events || [];
        let prev = p.inputs?.from ?? null; for (const e of evs) { const st = ch.states.find((s) => s.id === e.state); if (!st) { no("MISSING_ART_ASSET", { invariant: "STATE_DRAWING_APPROVED", reason: `${p.owner} has no approved state ${e.state}`, needed: `approved ${sub}.${e.state} drawing` }); continue; }
          if (ch.edges?.length && prev && !ch.edges.some((x) => x.from === prev && x.to === e.state)) no("UNSUPPORTED_STATE_EDGE", { invariant: "EXPRESSION_EDGE_APPROVED", reason: `${prev} → ${e.state} is not an approved ${sub} edge` }); prev = e.state;
          if (e.at < 0 || e.at >= fr[1] - fr[0]) no("INVALID_FRAME_RANGE", { invariant: "EVENT_INSIDE_PRIMITIVE", reason: `${p.id}: event at relative ${e.at} outside [0,${fr[1] - fr[0]})` });
          (out.__acting_events ||= []).push({ frame: fr[0] + e.at, rig: rid, channel: sub, state: e.state, shot: actionFor(rid, fr)?.shot_id ?? null, source: `composition:${p.id}`, priority: 100 }); } rec.events = evs.map((e) => [fr[0] + e.at, e.state]); break; }
      case "PLANT": case "REACH": { const sk = rig.sockets.find((s) => s.id === sub); if (!sk) { no("UNKNOWN_REFERENCE", { invariant: "SOCKET_EXISTS", reason: `${p.owner} is not a socket` }); break; } const act = actionFor(rid, fr); if (!act) { no("UNKNOWN_REFERENCE", { invariant: "OWNER_IN_ACTION", reason: `no action of ${rid} covers [${fr}) (a constraint must belong to a directed action)` }); break; }
        const tgt = p.inputs?.target ?? {}, ev = { source_socket: sub, contact_type: p.kind === "PLANT" ? "PLANT" : "FOLLOW", start_frame: fr[0], end_frame: fr[1], allowed_error_px: p.limits?.allowed_error_px ?? 1.5, ...(tgt.world_xy ? { target_world_xy: tgt.world_xy } : tgt.socket ? { target_socket: tgt.socket } : {}), source_command: `composition:${p.id}` };
        if (p.kind === "REACH" && !tgt.world_xy && !tgt.socket) { no("COMPOSITION_INVALID", { invariant: "REACH_TARGET", reason: `${p.id}: reach needs a world or socket target` }); break; } act.contact_events.push(ev);
        if (p.inputs?.approach_from !== undefined) (out.reaches ||= {})[`${act.id}:${sub}@${fr[0]}`] = { approach: [fr[0] - p.inputs.approach_from, fr[0]], orient: "WORLD" }; rec.contact = ev; rec.action = act.id; break; }
      case "CAMERA_MOVE": { const C0 = ((out.cameras ||= {})[sub] ||= {}); rec.abs = {}; for (const k of ["x", "y", "zoom", "rot"]) { const ks = p.inputs?.[k]; if (!ks) continue; const abs = shiftKeys(ks, fr[0]); C0[k] = [...(C0[k] || []), ...abs].sort((a, b) => a[0] - b[0]); rec.abs[k] = abs; } break; }
    }
    recs.push(rec);
  }
  // precedence: a PRIMARY rotation on a joint that a CONSTRAINT owns while locked is SUPPRESSED; if that rotation is a mandatory effect, it is a failure
  for (const r of recs.filter((x) => x.kind === "JOINT_ROTATE" || x.kind === "OSCILLATE")) { const [rid, j] = r.owner.split("."), rig = rigs.get(rid);
    for (const c of recs.filter((x) => (x.kind === "PLANT" || x.kind === "REACH") && x.owner.startsWith(`${rid}.`))) { const sk = rig.sockets.find((s) => s.id === c.owner.split(".")[1]), ik = rig.constraints.find((k) => k.type === "TWO_BONE_IK" && k.chain[2] === sk?.joint_id);
      if (ik?.chain.includes(j) && overl(r.frames, c.frames) && r.effect?.mandatory !== false) errors.push(refuse("MANDATORY_EFFECT_SUPPRESSED", r, { invariant: "CONSTRAINT_PRECEDENCE_REPORTED", frame_range: [Math.max(r.frames[0], c.frames[0]), Math.min(r.frames[1], c.frames[1])], reason: `${r.id} rotates ${r.owner}, which constraint ${c.id} owns while locked (constraints solve last): the directed rotation would be lost — mark it mandatory:false (intent only) or re-direct` })); } }
  return { plan: out, doc: D, report: { version: COMPOSITION_VERSION, primitives: recs }, errors };
}
/** writeSet(C) — interval-indexed (owner, property, interval, producer, mode) for EVERY writer in the compiled plan (composed or semantic) */
export function writeSet(C) {
  const W = [], plan = C.plan, iv = (ks) => [ks[0][0], ks.at(-1)[0] + 1], src = (x) => x?.source ?? "authored";
  for (const [rid, tr] of Object.entries(plan.tracks || {})) { for (const [p, ks] of Object.entries(tr.root || {})) W.push({ owner: rid, property: `root.${p}`, interval: iv(ks), producer: "track", mode: "PRIMARY" }); for (const [j, ks] of Object.entries(tr.joints || {})) W.push({ owner: `${rid}.${j}`, property: "rotation", interval: iv(ks), producer: "track", mode: "PRIMARY" }); }
  for (const [k, list] of Object.entries(plan.__additive || {})) for (const a of [].concat(list)) W.push({ owner: k, property: "rotation", interval: a.frames ?? [0, C.totalFrames], producer: src(a), mode: "ADDITIVE", amplitude_deg: a.amp ?? null });
  for (const [k, list] of Object.entries(plan.__gaze || {})) for (const g of [].concat(list)) W.push({ owner: k, property: "rotation", interval: g.frames ?? [0, C.totalFrames], producer: g.source ?? "acting:gaze", mode: "AIM", max_deg: g.max_deg });
  for (const k of C.contacts) { const R_ = C.rigs.get(k.rig); for (const j of k.chain) W.push({ owner: `${k.rig}.${j}`, property: "rotation", interval: [k.c.start_frame, k.c.end_frame], producer: k.c.source_command ?? `contact:${k.identity.contact_id}`, mode: "CONSTRAINT", contact_id: k.identity.contact_id }); void R_; }
  for (const P_ of C.propSupport || []) for (const sg of P_.segments) W.push({ owner: P_.prop_rig, property: "root.transform", interval: sg.frames, producer: `prop_support:${P_.id}:${sg.driver}`, mode: sg.mode === "ACTOR_DRIVEN" ? "ACTOR_DRIVEN" : sg.mode === "SURFACE_DRIVEN" ? "SURFACE_DRIVEN" : sg.mode === "FREE_AUTHORED" ? "PRIMARY" : "PRIMARY_TRACK_FOLLOWED" });
  for (const e of plan.__acting_events || []) W.push({ owner: `${e.rig}.${e.channel}`, property: "state", interval: [e.frame, e.frame + 1], producer: e.source ?? "acting", mode: "STATE", state: e.state });
  for (const [cid, c] of Object.entries(plan.cameras || {})) for (const [p, ks] of Object.entries(c)) if (Array.isArray(ks) && ks.length) W.push({ owner: `camera:${cid}`, property: p, interval: iv(ks), producer: "camera", mode: "PRIMARY" });
  // conflicts: two PRIMARY writers of one owner/property at one instant (tracks are single by construction; composed merges are checked at compile)
  const conflicts = []; const prim = W.filter((w) => w.mode === "PRIMARY"); for (let i = 0; i < prim.length; i++) for (let k = i + 1; k < prim.length; k++) { const a = prim[i], b = prim[k]; if (a.owner === b.owner && a.property === b.property && a.producer !== b.producer && overl(a.interval, b.interval)) conflicts.push({ owner: a.owner, property: a.property, producers: [a.producer, b.producer], interval: [Math.max(a.interval[0], b.interval[0]), Math.min(a.interval[1], b.interval[1])] }); }
  return { entries: W, conflicts, evaluation_order: ["PRIMARY (absolute tracks, approved state swaps)", "ADDITIVE (bounded acting offsets)", "AIM (bounded, weighted)", "CONSTRAINT (contacts/plants/prop authority, solved last)", "STATE (art-state selection)", "RENDER (paint order/occlusion)"] };
}
