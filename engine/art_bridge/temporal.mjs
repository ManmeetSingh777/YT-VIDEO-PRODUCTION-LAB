// Temporal compiler + per-frame evaluator (spec §5.3, §5.4, §5.7, §11.1). One immutable compiled plan; stateAtFrame(compiled, f) is a pure
// function of the integer frame: it never scans or mutates prior frames. History-dependent secondary motion is BAKED at compile time with a
// fixed step from a canonical initial state, then read by index. Every action is routed exactly once by its declared motion class.
//
// Motion plan (direction-owned timing; the manifest owns art/rigs):
// { id, placements: {rigId: {x,y,rot?,scale?}},
//   tracks: {rigId: {root: {x?,y?,rot?,scale?: KEYS}, joints: {jointId: KEYS}}},          KEYS = [[frame, value, ease?], ...]
//   cameras: {trackId: {x?,y?,zoom?,rot?: KEYS}}, parallax: {FAR?,MID?,FOCAL?,NEAR?,FOREGROUND?: factor},
//   cels: {actionId: {distance: KEYS, step_distance_px, start_xy:[x,y], cycle:[{asset_id, anchor, lands?}], band?}},
//   secondary: [{id, rig, joint, driver:{rig, joint}, stiffness, damping, gain, substeps}],
//   procedural: {actionId: {type:"GEAR_TRAIN", driver:{rig,joint}, followers:[{rig,joint,teeth_driver,teeth_follower,phase_deg?}]}
//                        | {type:"FLOW_PATH", symbol_asset, path:[[x,y],...], count: KEYS, speed_px_per_frame, spacing_px, band?}},
//   lighting: {assetId: {mode, owner_part, opacity?: KEYS, view_id?}}, gaze: {rigId: {jointId: {x: KEYS, y: KEYS, surface_asset}}} }
import { err } from "./errors.mjs";
import { I, mul, chain, T, S as Sc, R, apply, applyVec, angleOf, scaleOf, dist, deg, wrap180, finite, inv } from "./math2d.mjs";
import { solveTwoBonePosition } from "./constraints.mjs";
import { validateStateEdge } from "./state_router.mjs";
import { validateChannels, channelEvents, channelStatesAt, resolveBindings } from "./state_channels.mjs";
import { rigPoseTimeline, poseAt } from "./state_timeline.mjs";
import { layerPhrases, compileActing } from "./acting.mjs";
import { compileModelBars } from "../decoder/model_bar.mjs";
import { compilePerformance } from "./performance_commands.mjs";
import { validateDeformBinding, deformAt, validateMorphBinding, morphAt, solveHinge, comX } from "./execution.mjs";
import { balance } from "./contact_solver.mjs";
import { multiSupportWithoutContract, segmentAt, evaluatePropSupport } from "./prop_support.mjs";
import { canonicalContact, validateContactShots } from "./contact_continuity.mjs";

const EASES = {
  linear: (p) => p, none: (p) => p,
  "sine.in": (p) => 1 - Math.cos((p * Math.PI) / 2), "sine.out": (p) => Math.sin((p * Math.PI) / 2), "sine.inOut": (p) => -(Math.cos(Math.PI * p) - 1) / 2,
  "power2.in": (p) => p * p, "power2.out": (p) => 1 - (1 - p) * (1 - p), "power2.inOut": (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  "power3.out": (p) => 1 - Math.pow(1 - p, 3), "power3.inOut": (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
  "back.out": (p) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); },
};
export function checkKeys(keys, where) {
  if (!Array.isArray(keys) || !keys.length) throw err("INVALID_FRAME_RANGE", { record_id: where, reason: "track has no keys" });
  for (let i = 0; i < keys.length; i++) {
    const [f, v, e] = keys[i];
    if (!Number.isInteger(f) || !Number.isFinite(v)) throw err("INVALID_FRAME_RANGE", { record_id: where, reason: `key ${i} must be [integerFrame, finiteValue, ease?]` });
    if (i && f <= keys[i - 1][0]) throw err("INVALID_FRAME_RANGE", { record_id: where, reason: `keys must be strictly increasing in frame (key ${i})` });
    if (e !== undefined && e !== "hold" && !EASES[e]) throw err("UNSUPPORTED_MOTION_CLASS", { record_id: where, reason: `unknown ease ${e}` });
  }
}
/** pure key evaluation at integer frame f (value at a key frame is that key's value) */
export function ev(keys, f) {
  if (f <= keys[0][0]) return keys[0][1];
  for (let n = 1; n < keys.length; n++) {
    const [f1, v1, e] = keys[n];
    if (f < f1) { const [f0, v0] = keys[n - 1]; if (e === "hold") return v0; return v0 + (v1 - v0) * EASES[e || "sine.inOut"]((f - f0) / (f1 - f0)); }
  }
  return keys[keys.length - 1][1];
}

const ROUTED = ["RIGID", "ARTICULATED", "REGISTERED_CELS", "REGISTERED_MORPH", "EXPLICIT_DEFORM", "PROCEDURAL", "CAMERA_WORLD", "TRANSITION"];

/** compileMotionTracks(actions, shots, {doc, plan}) → frozen compiled plan or throws an aggregated BridgeError list (.errors) */
export function compileMotionTracks(actions, shots, ctx) {
  const errors = [];
  // P06: approved PerformanceCommands compile ONCE, here, into the same plan/action surfaces every consumer below reads (no second timeline)
  let perfReport = null; if (ctx.plan?.performance) { const Pc = compilePerformance(ctx.doc, ctx.plan, { runType: ctx.runType ?? "DIAGNOSTIC", decisions: ctx.directionDecisions ?? null, packetDigest: ctx.packetDigest ?? null, fps: ctx.doc.stage?.fps ?? 60 }); errors.push(...Pc.errors); perfReport = Pc.report;
    if (Pc.report) { const byId = new Map(Pc.doc.actions.map((a) => [a.id, a])); actions = actions.map((a) => byId.get(a.id) || a); ctx = { ...ctx, doc: Pc.doc, plan: Pc.plan }; } }
  const { doc } = ctx, total = doc.stage.total_frames;
  { const un = (doc.rigs || []).filter((r) => r.geometry_status === "UNMEASURED" && actions.some((a) => a.actors.some((x) => x.rig_id === r.id))); if (un.length) throw Object.assign(err("GEOMETRY_UNMEASURED", { record_id: un[0].id, reason: `motion cannot be computed before the artwork is measured: ${un.map((r) => r.id).join(", ")}` }), { errors: un.map((r) => err("GEOMETRY_UNMEASURED", { record_id: r.id, reason: "rig geometry is unmeasured" })) }); }
  // layers 2–3 (P03 A+D, see acting.mjs): compiled PHRASES become primary tracks, ACTING modifies them (lag/anticipation/settle) and adds
  // additive life, follow-through springs, gaze aim and channel swap events (blink, speech). Done BEFORE validation, so every compiled key
  // is checked and owned exactly like an authored one; an unexecutable phrase/acting block is a structured error, never dropped.
  const L1 = layerPhrases(doc, ctx.plan || {}), L2 = compileActing(doc, L1.plan, { actions }); errors.push(...L1.errors, ...L2.errors);
  // a deformation map / morph that does not name its rig+slot is resolved from the registered asset's placement (unique or refused) — never skipped
  const placeOf = (aid) => doc.rigs.flatMap((r) => r.render_parts.filter((p) => p.asset_id === aid || [...r.pose_states, ...r.view_states, ...(r.state_channels || []).flatMap((c) => c.states)].some((s) => s.asset_bindings?.[p.asset_id] === aid)).map((p) => ({ rig: r.id, slot: p.asset_id })));
  const resolveSlot = (id, m, aid) => { if (m.rig && m.slot) return m; const c = placeOf(aid); if (c.length !== 1) { errors.push(err("DEFORM_RENDER_FAILURE", { record_id: id, reason: `${aid} is placed in ${c.length} rig slots; the deformation must name its rig and slot` })); return m; } return { ...m, ...c[0] }; };
  const plan = { ...L2.plan, ...(L2.plan.deform_maps ? { deform_maps: Object.fromEntries(Object.entries(L2.plan.deform_maps).map(([id, m]) => [id, resolveSlot(id, m, m.asset)])) } : {}), ...(L2.plan.morphs ? { morphs: Object.fromEntries(Object.entries(L2.plan.morphs).map(([id, m]) => [id, resolveSlot(id, m, m.from)])) } : {}) }, layerReport = { phrases: L1.report, acting: L2.report, suppressed_by_contact: [] };
  const assets = new Map(doc.assets.map((a) => [a.id, a])), rigs = new Map();
  for (const r of doc.rigs) {
    const joints = new Map(r.joints.map((j) => [j.id, j])), order = [], seen = new Set();
    const visit = (j) => { if (seen.has(j.id)) return; if (j.parent_id) visit(joints.get(j.parent_id)); seen.add(j.id); order.push(j.id); };
    r.joints.forEach(visit);
    const socketById = new Map(r.sockets.map((s) => [s.id, s]));
    rigs.set(r.id, { rec: r, joints, order, socketById, root: r.joints.find((j) => j.parent_id === null) });
  }
  const socketOwner = new Map(); for (const [rid, R_] of rigs) for (const s of R_.rec.sockets) { if (socketOwner.has(s.id)) errors.push(err("DUPLICATE_ELEMENT_ID", { record_id: s.id, reason: `socket id used by rigs ${socketOwner.get(s.id)} and ${rid}` })); socketOwner.set(s.id, rid); }
  // track validation + single transform owner per joint
  const owner = new Map(), own = (key, by) => { if (owner.has(key) && owner.get(key) !== by) errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: key, reason: `${key} is written by both ${owner.get(key)} and ${by}` })); else owner.set(key, by); };
  const safe = (fn) => { try { fn(); } catch (e) { if (e.code) errors.push(e); else throw e; } };
  for (const [rid, tr] of Object.entries(plan.tracks || {})) {
    const R_ = rigs.get(rid); if (!R_) { errors.push(err("UNKNOWN_REFERENCE", { record_id: rid, reason: "motion track for unknown rig" })); continue; }
    for (const [p, keys] of Object.entries(tr.root || {})) { if (!["x", "y", "rot", "scale"].includes(p)) errors.push(err("UNKNOWN_REFERENCE", { record_id: `${rid}.root.${p}` , reason: "root track property must be x|y|rot|scale" })); safe(() => checkKeys(keys, `${rid}.root.${p}`)); }
    for (const [j, keys] of Object.entries(tr.joints || {})) { if (!R_.joints.has(j)) { errors.push(err("UNKNOWN_REFERENCE", { record_id: `${rid}.${j}`, reason: "track for unknown joint" })); continue; } own(`${rid}.${j}`, "track"); safe(() => checkKeys(keys, `${rid}.${j}`)); }
  }
  for (const s of plan.secondary || []) { if (!rigs.get(s.rig)?.joints.has(s.joint)) errors.push(err("UNKNOWN_REFERENCE", { record_id: s.id, reason: "secondary joint unknown" })); else own(`${s.rig}.${s.joint}`, `secondary:${s.id}`); }
  for (const [aid, p] of Object.entries(plan.procedural || {})) if (p.type === "GEAR_TRAIN") for (const fo of p.followers) own(`${fo.rig}.${fo.joint}`, `procedural:${aid}`);
  // Better One TBO-G15: MODEL_BAR symbols are driven ONLY by the approved model card (plan.models); validated and evaluated here, once
  const modelBars = compileModelBars(plan, { actions, assets, errors, ev });
  for (const [cid, c] of Object.entries(plan.cameras || {})) for (const [p, keys] of Object.entries(c)) safe(() => checkKeys(keys, `camera ${cid}.${p}`));
  // execution systems (P03 E/F): deformation maps, vector morphs, mechanism reactions, support/balance — validated like tracks
  for (const [id, m] of Object.entries(plan.deform_maps || {})) { errors.push(...validateDeformBinding(id, m, assets.get(m.asset))); if (m.weight) safe(() => checkKeys(m.weight, `deform ${id}.weight`)); }
  for (const [id, m] of Object.entries(plan.morphs || {})) { errors.push(...validateMorphBinding(id, m, assets.get(m.from), assets.get(m.to))); if (m.weight) safe(() => checkKeys(m.weight, `morph ${id}.weight`)); }
  for (const rx of plan.reactions || []) { if (rx.type !== "HINGE_FOLLOW") { errors.push(err("REACTION_UNSATISFIABLE", { record_id: rx.id, reason: `reaction type ${rx.type} has no executor` })); continue; }
    const R1 = rigs.get(rx.rig), R2 = rigs.get(rx.driver?.rig); if (!R1?.joints.has(rx.joint) || !R1.socketById.has(rx.handle_socket) || !R2?.joints.has(rx.driver.joint)) { errors.push(err("UNKNOWN_REFERENCE", { record_id: rx.id, reason: "reaction names an unknown rig/joint/socket" })); continue; } own(`${rx.rig}.${rx.joint}`, `reaction:${rx.id}`); }
  for (const [rid, sp] of Object.entries(plan.support || {})) { const R_ = rigs.get(rid); if (!R_ || !(sp.feet || []).every((s) => R_.socketById.has(s)) || !Object.keys(sp.mass || {}).every((j) => R_.joints.has(j))) errors.push(err("UNKNOWN_REFERENCE", { record_id: `support:${rid}`, reason: "support model names an unknown rig/foot socket/mass joint" })); }
  // P06: several aims may act on one joint only in disjoint windows (an aim without frames owns the whole film)
  for (const [key, g0] of Object.entries(plan.__gaze || {})) { const L = [].concat(g0).map((g) => ({ fr: g.frames || [0, total], src: g.source || "acting:gaze" })); for (let i = 0; i < L.length; i++) for (let k = i + 1; k < L.length; k++) if (L[i].fr[0] < L[k].fr[1] && L[k].fr[0] < L[i].fr[1]) errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: key, frame_range: [Math.max(L[i].fr[0], L[k].fr[0]), Math.min(L[i].fr[1], L[k].fr[1])], reason: `${L[i].src} and ${L[k].src} both aim ${key}` })); }
  for (const key of Object.keys(plan.__additive || {})) { const by = owner.get(key); if (by && by !== "track") errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: key, reason: `additive acting on ${key}, which is owned by ${by} (its value is not an editable track)` })); }

  // route every action exactly once
  const routes = new Map();
  for (const a of actions) {
    if (!ROUTED.includes(a.mode)) { errors.push(err("UNSUPPORTED_MOTION_CLASS", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: `mode ${a.mode} has no handler` })); continue; }
    if (routes.has(a.id)) { errors.push(err("DUPLICATE_ELEMENT_ID", { record_id: a.id, reason: "action routed twice" })); continue; }
    if (a.mode === "RIGID") for (const act of a.actors) { const jt = plan.tracks?.[act.rig_id]?.joints || {}; if (Object.keys(jt).length) errors.push(err("UNSUPPORTED_MOTION_CLASS", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: `RIGID action animates joints ${Object.keys(jt)} of ${act.rig_id}; articulation requires ARTICULATED` })); }
    if (a.mode === "REGISTERED_CELS" && !plan.cels?.[a.id]) errors.push(err("MISSING_ART_ASSET", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, suggested_producer: "GPT registered cel manufacture", reason: "REGISTERED_CELS action has no approved cel cycle" }));
    if (a.mode === "REGISTERED_MORPH") { const vec = a.required_assets.every((id) => ["VECTOR_PATH", "SYMBOL"].includes(assets.get(id)?.kind)); if (!vec) errors.push(err("INVALID_MORPH_TOPOLOGY", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: "REGISTERED_MORPH requires homologous source-authored vector paths; raster images cannot be numerically morphed — supply registered cels or new art" })); }
    if (a.mode === "EXPLICIT_DEFORM" && !plan.deform_maps?.[a.id]) errors.push(err("MISSING_ART_ASSET", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, suggested_producer: "GPT deformation-state sequence", reason: "EXPLICIT_DEFORM has no approved deformation map; no universal warp is fabricated" }));
    if (a.mode === "PROCEDURAL" && !plan.procedural?.[a.id]) errors.push(err("UNSUPPORTED_MOTION_CLASS", { record_id: a.id, reason: "PROCEDURAL action has no declared mechanism" }));
    if (a.mode === "TRANSITION" && !doc.transitions.some((t) => t.frame_range[0] < a.frame_range[1] && a.frame_range[0] < t.frame_range[1])) errors.push(err("MISSING_TRANSITION_STATE", { record_id: a.id, frame_range: a.frame_range, reason: "TRANSITION action has no transition contract" }));
    routes.set(a.id, a.mode);
  }
  // every view switch must travel an approved registered edge (state_router is the consumer, not a duplicate check)
  for (const a of actions) for (const ve of a.view_events) { const owner = a.actors.map((x) => rigs.get(x.rig_id)).find((R_) => R_ && [...R_.rec.pose_states, ...R_.rec.view_states].some((s) => s.id === ve.to_state)); if (!owner) continue;
    safe(() => validateStateEdge(ve.from_state, ve.to_state, owner.rec, assets, doc.identities.find((i) => i.id === owner.rec.identity_id), { requireApproval: ctx.requireApproval ?? true })); }
  // explicit art-state channels (P03 B): validated ownership + every state event (directed or compiled acting) resolved to an approved state
  const chanEvents = new Map(); for (const [rid, R_] of rigs) { for (const e of validateChannels(R_.rec, { assets })) errors.push(e); const ce = channelEvents(R_.rec, doc.actions, plan.__acting_events || []); errors.push(...ce.errors); chanEvents.set(rid, ce.events); }
  // P04 §3.1: one whole-film pose/view history per rig (persistent across actions and shots; STATE_CONFLICT refuses order-dependent contradictions)
  const poseTl = new Map(); for (const [rid, R_] of rigs) { const tl = rigPoseTimeline(R_.rec, doc.actions); errors.push(...tl.errors); poseTl.set(rid, tl); }
  // contacts → constraint jobs
  const contacts = [];
  for (const a of actions) for (const c of a.contact_events) {
    const srcRig = socketOwner.get(c.source_socket), R_ = rigs.get(srcRig);
    if (!R_) { errors.push(err("UNKNOWN_REFERENCE", { record_id: a.id, dependency: c.source_socket, reason: "contact source socket not on any rig" })); continue; }
    const sock = R_.socketById.get(c.source_socket), ikc = R_.rec.constraints.find((k) => k.type === "TWO_BONE_IK" && k.chain[2] === sock.joint_id);
    if (!ikc) { errors.push(err("UNREACHABLE_IK", { record_id: a.id, reason: `no TWO_BONE_IK chain ends at ${sock.joint_id}` })); continue; }
    const tgtRig = socketOwner.get(c.target_socket) || null;
    if (!tgtRig && !c.target_world_xy && !["PLANT", "SUPPORT"].includes(c.contact_type)) { /* P05: a plant with no fixed point holds the place where the sole is when the contact starts (measured, never invented) */ errors.push(err("UNKNOWN_REFERENCE", { record_id: a.id, dependency: c.target_socket, reason: "contact target is neither a rig socket nor a fixed world point" })); continue; }
    contacts.push({ action: a, c, rig: srcRig, socket: sock, chain: ikc.chain, bend: ikc.bend_sign ?? 1, tgtRig, identity: canonicalContact(a, c, { actorRig: srcRig, targetOwner: tgtRig ?? (c.target_world_xy ? "WORLD" : null) }) });
  }
  errors.push(...validateContactShots(contacts, shots)); // P08 A02: one id per contact; crossing a cut only as a declared, fully mapped persistent contact
  const contactDriven = new Set(contacts.map((k) => k.rig));
  // precedence report: contact IK (layer 4) owns its chain joints while a contact is locked; acting on those joints is overridden there, never silently
  for (const k of contacts) for (const j of k.chain) if ((plan.__acting_report?.[k.rig]?.lagged || {})[j] !== undefined || (plan.__additive || {})[`${k.rig}.${j}`]) layerReport.suppressed_by_contact.push({ action: k.action.id, rig: k.rig, joint: j, frames: [k.c.start_frame, k.c.end_frame] });
  // P07: a prop held by several supports needs a contract naming the ONE driver per instant; a surface that drives a prop is its only transform
  // writer, so an authored track that still moves the prop inside a surface-driven interval is a second, conflicting driver
  const propSupport = plan.prop_support?.props || []; errors.push(...multiSupportWithoutContract(contacts, new Set(propSupport.map((p) => p.prop_rig))));
  for (const P_ of propSupport) for (const sg of P_.segments) { if (!(sg.driver_kind === "SURFACE" || sg.mode === "ACTOR_DRIVEN")) continue; const tr = plan.tracks?.[P_.prop_rig], chans = [...Object.entries(tr?.root || {}).map(([k, v]) => [`root.${k}`, v]), ...Object.entries(tr?.joints || {}).map(([k, v]) => [`joint.${k}`, v])];
    for (const [name, keys] of chans) { const v0 = ev(keys, sg.hold_from ?? sg.frames[0]); for (let f = sg.frames[0]; f < sg.frames[1]; f++) if (Math.abs(ev(keys, f) - v0) > 1e-6) { errors.push(err("PROP_DRIVER_CONFLICT", { record_id: P_.prop_rig, frame_range: [f, f + 1], reason: `${P_.id}: the authored ${name} track moves the prop at ${f} while ${sg.driver} drives it (two transform writers)`, failed_invariant: sg.mode === "ACTOR_DRIVEN" ? "ACTOR_IS_SOLE_WRITER" : "SURFACE_IS_SOLE_WRITER", producer: "engine/art_bridge/temporal.mjs#compileMotionTracks" })); break; } } }
  // P08 B01: an ACTOR_DRIVEN span with a directed hand path writes the driver's arm chain; authored joint tracks on that chain must hold still there
  const handOf = (P_, ref) => P_.hands.find((h) => h.ref === ref), chainOf = (rid, sid) => { const R_ = rigs.get(rid), sk = R_?.socketById.get(sid); return R_?.rec.constraints.find((k) => k.type === "TWO_BONE_IK" && k.chain[2] === sk?.joint_id) || null; };
  for (const P_ of propSupport) for (const sg of P_.segments) { if (sg.mode !== "ACTOR_DRIVEN" || !sg.driver_path) continue; const h = handOf(P_, sg.driver), ik = h && chainOf(h.rig, h.socket);
    if (!ik) { errors.push(err("UNREACHABLE_IK", { record_id: P_.id, frame_range: sg.frames, reason: `${sg.driver} has no TWO_BONE_IK chain for its directed path`, producer: "engine/art_bridge/temporal.mjs#compileMotionTracks" })); continue; }
    for (const p of ["x", "y", ...(sg.driver_path.rot ? ["rot"] : [])]) safe(() => checkKeys(sg.driver_path[p], `${P_.id} driver_path.${p}`));
    for (const j of ik.chain) { const keys = plan.tracks?.[h.rig]?.joints?.[j]; if (!keys) continue; const v0 = ev(keys, sg.frames[0]); for (let fr = sg.frames[0]; fr < sg.frames[1]; fr++) if (Math.abs(ev(keys, fr) - v0) > 1e-6) { errors.push(err("INVALID_TRANSFORM_OWNER", { record_id: `${h.rig}.${j}`, frame_range: [fr, fr + 1], reason: `${j} is written by the directed hand path of ${P_.id} and by its own track at ${fr}`, failed_invariant: "ONE_WRITER_PER_JOINT", producer: "engine/art_bridge/temporal.mjs#compileMotionTracks" })); break; } } }
  for (const k of contacts) if (k.tgtRig && contactDriven.has(k.tgtRig)) errors.push(err("UNSUPPORTED_STATE_EDGE", { record_id: k.action.id, reason: `contact target rig ${k.tgtRig} is itself contact-driven (chained contacts are not supported)` }));

  // shots
  const shotAt = new Int32Array(total).fill(-1); shots.forEach((s, i) => { for (let f = Math.max(0, s.start_frame); f < Math.min(total, s.end_frame); f++) if (shotAt[f] < 0) shotAt[f] = i; });
  // P05: before part artwork is delivered the PHYSICAL motion of the measured masters is still evaluated (so no part is paid for an impossible motion). Only
  // errors caused by a drawing that does not exist yet are set aside, by name; every caller that renders or completes a stage compiles without this option.
  const pendingArt = []; if (ctx.allowPendingArt) { const absent = (ids) => ids.filter((id) => id && !assets.has(id)), stateArt = (rid, sid) => { const r = rigs.get(rid)?.rec; return Object.values([...(r?.pose_states || []), ...(r?.view_states || [])].find((s) => s.id === sid)?.asset_bindings || {}); };
    for (let i = errors.length - 1; i >= 0; i--) { const e = errors[i], act = actions.find((a) => a.id === e.record_id), edge = /^(.+?)\.(.+)->(.+)$/.exec(e.record_id || ""), ids = e.code === "MISSING_ART_ASSET" ? (act ? absent(act.required_assets) : absent([e.record_id])) : ["UNSUPPORTED_VIEW", "UNSUPPORTED_STATE_EDGE"].includes(e.code) && edge ? absent([...stateArt(edge[1], edge[2]), ...stateArt(edge[1], edge[3])]) : ["INVALID_MORPH_TOPOLOGY", "INVALID_DEFORM_MAP", "DEFORM_RENDER_FAILURE"].includes(e.code) && act ? absent(act.required_assets) : []; if (ids.length) { pendingArt.push(...ids); errors.splice(i, 1); } } }
  if (errors.length) { const e = new Error(`compileMotionTracks: ${errors.length} error(s)`); e.errors = errors; throw e; }

  const C = { totalFrames: total, doc, plan, rigs, assets, actions, shots, contacts, routes, socketOwner, secondaryBaked: {}, channelEvents: chanEvents, layers: layerReport, poseTimelines: poseTl, pendingArt: [...new Set(pendingArt)], modelTrace: modelBars.trace, performance: perfReport ?? plan.__performance ?? null, propSupport };
  C.shotAt = (f) => shots[shotAt[Math.floor(f)]] || null; // shot ownership is DISCRETE: a sub-frame sample time belongs to its integer frame (P02 repair: fractional t returned no shot → default camera, skipped actions)
  const placement = (rid, shot) => { const p = plan.placements?.[rid]; if (p) return p; const act = actions.find((a) => a.shot_id === shot?.id && a.actors.some((x) => x.rig_id === rid)); const ac = act?.actors.find((x) => x.rig_id === rid); return ac ? { x: ac.root_world_xy[0], y: ac.root_world_xy[1], scale: ac.root_scale ?? 1 } : null; };
  C.placement = placement;
  // root + joint values from tracks (+ gear followers + baked secondary)
  const additive = plan.__additive || {}, addAt = (key, f) => { let s = 0; for (const a of additive[key] || []) { let env = 1; if (a.frames) { if (f < a.frames[0] || f >= a.frames[1]) continue; const r = Math.max(1, Math.min(a.period / 4, (a.frames[1] - a.frames[0]) / 4)); env = Math.min(1, (f - a.frames[0]) / r, (a.frames[1] - f) / r); } s += env * a.amp * Math.sin((2 * Math.PI * (f + a.phase)) / a.period); } return s; }; // P06: a windowed additive (idle breathing) fades in/out inside its command
  const rawJoint = (rid, j, f) => { const k = plan.tracks?.[rid]?.joints?.[j]; return (k ? ev(k, f) : 0) + addAt(`${rid}.${j}`, f); };
  const gearOf = new Map(); for (const p of Object.values(plan.procedural || {})) if (p.type === "GEAR_TRAIN") for (const fo of p.followers) gearOf.set(`${fo.rig}.${fo.joint}`, { driver: p.driver, ratio: -fo.teeth_driver / fo.teeth_follower, phase: fo.phase_deg || 0 });
  C.jointValue = (rid, j, f) => {
    const g = gearOf.get(`${rid}.${j}`); if (g) return rawJoint(g.driver.rig, g.driver.joint, f) * g.ratio + g.phase;
    const b = C.secondaryBaked[`${rid}.${j}`]; if (b) return b[f];
    return rawJoint(rid, j, f);
  };
  const evalBase = (f, shot) => {
    const out = {};
    for (const [rid, R_] of rigs) {
      const pl = placement(rid, shot); if (!pl) continue;
      const tr = plan.tracks?.[rid]?.root || {}, g = (p, d) => (tr[p] ? ev(tr[p], f) : d);
      const root = { x: pl.x + g("x", 0), y: pl.y + g("y", 0), rot: (pl.rot || 0) + g("rot", 0), scale: (pl.scale || 1) * g("scale", 1) };
      const theta = {}, offset = {}; for (const j of R_.order) { theta[j] = C.jointValue(rid, j, f); const o = plan.tracks?.[rid]?.joint_offsets?.[j]; if (o) offset[j] = [o.x ? ev(o.x, f) : 0, o.y ? ev(o.y, f) : 0]; }
      out[rid] = { root, theta, offset };
    }
    return out;
  };
  C.evalPrimary = (f, shot) => {
    const out = evalBase(f, shot);
    // mechanism reactions (P03 F, layer 2 consequence): the reacting joint is SOLVED from the driver's pose, so the object moves because the character pulls
    for (const r of C.reactionsAt(f, shot, out)) if (out[r.rig]) out[r.rig].theta[r.joint] = r.angle;
    // P05: a linked output follows its driver's SOLVED angle (a lever moved by a hand drives its gear; a follower may drive the next one)
    for (let n = 0; n < gearOf.size; n++) { let changed = false; for (const [k, g] of gearOf) { const [rid, j] = [k.slice(0, k.lastIndexOf(".")), k.slice(k.lastIndexOf(".") + 1)], d = out[g.driver.rig]?.theta?.[g.driver.joint]; if (d === undefined || !out[rid]) continue; const v = d * g.ratio + g.phase; if (out[rid].theta[j] !== v) { out[rid].theta[j] = v; changed = true; } } if (!changed) break; }
    // gaze (acting layer): the head/eye joint turns toward its target by a bounded, gain-scaled ADDITIVE rotation (the art is rotated, never warped)
    for (const [key, g0] of Object.entries(plan.__gaze || {})) for (const g of [].concat(g0)) { // P06: one joint may carry several aims in disjoint windows, each with a weight ramp
      const [rid, j] = key.split("."), s = out[rid]; if (!s || (g.frames && (f < g.frames[0] || f >= g.frames[1]))) continue; const wgt = g.weight ? ev(g.weight, f) : 1; if (!(wgt > 0)) continue;
      let tgt = g.target?.world_xy || null; if (g.target?.rig) { const o = out[g.target.rig]; if (!o) continue; tgt = socketWorld(g.target.rig, fk(g.target.rig, o), g.target.socket); }
      if (!tgt) continue; const M = fk(rid, s), p = apply(M[j], rigs.get(rid).joints.get(j).rest_xy), cur = angleOf(M[j]) + (g.forward_deg || 0);
      const d = wrap180(deg(Math.atan2(tgt[1] - p[1], tgt[0] - p[0])) - cur), m = g.max_deg ?? 20; s.theta[j] += wgt * (g.gain ?? 1) * Math.max(-m, Math.min(m, d));
    }
    // P07: while a surface drives a prop, the surface is its transform writer: the prop keeps the pose it had when the surface took over
    for (const P_ of propSupport) { const sg = segmentAt(P_, Math.floor(f)); if (!sg || !out[P_.prop_rig]) continue; const bake = propBake.get(segKey(P_, sg));
      if (sg.mode === "ACTOR_DRIVEN" || (sg.driver_kind === "SURFACE" && sg.moving_surface)) { // the directed hand path is the DRIVER's own intent: it is applied whether or not anything follows it
        const H = sg.mode === "ACTOR_DRIVEN" ? driverFrame(P_, sg, out, f) : surfaceFrame(P_, sg, out); if (H && bake) setRootFromMatrix(P_.prop_rig, out[P_.prop_rig], mul(H, bake.rel)); continue; }
      if (sg.driver_kind !== "SURFACE") continue;
      const held = sg.hold_entry === "BAKED_PREDECESSOR" ? bake?.hold : evalBase(sg.hold_from, C.shotAt(sg.hold_from) || shot)[P_.prop_rig]; if (held) out[P_.prop_rig] = JSON.parse(JSON.stringify(held)); }
    return out;
  };
  // ── P08 B01 transform authority helpers ── socket FRAME = joint matrix · T(rest + local) · R(basis): the hand/surface contact basis in world space
  const segKey = (P_, sg) => `${P_.id}@${sg.frames[0]}`, propBake = new Map();
  const socketFrame = (rid, M, sid) => { const R_ = rigs.get(rid), sk = R_.socketById.get(sid), r = R_.joints.get(sk.joint_id).rest_xy; return chain(M[sk.joint_id], T(r[0] + sk.local_xy[0], r[1] + sk.local_xy[1]), R(sk.basis_angle_deg || 0)); };
  C.socketFrame = socketFrame;
  /** the prop root state whose root-joint matrix equals D (rigid: rotation + uniform scale + translation; a reflection/non-uniform D is refused) */
  const setRootFromMatrix = (rid, st, D) => { const R_ = rigs.get(rid), r0 = R_.root.rest_xy, th = st.theta[R_.root.id] || 0, sx = Math.hypot(D[0], D[1]), sy = Math.hypot(D[2], D[3]);
    if (D[0] * D[3] - D[1] * D[2] <= 0 || Math.abs(sx - sy) > 1e-6 * Math.max(1, sx)) throw err("PROP_DRIVER_INVALID", { record_id: rid, reason: "the driving transform is not a rigid similarity (reflection or non-uniform scale): a rigid prop cannot follow it", failed_invariant: "RIGID_PROP_TRANSFORM" });
    const p = apply(D, r0); st.root = { x: p[0], y: p[1], rot: angleOf(D) - th, scale: sx }; };
  /** driver hand frame at f; with a directed driver_path the driver arm is solved to the path FIRST (two-bone IK, approved bend branch, limits checked later) */
  const driverFrame = (P_, sg, out, f) => { const h = P_.hands.find((x) => x.ref === sg.driver), s = out[h?.rig]; if (!s) return null;
    if (sg.driver_path) { const R_ = rigs.get(h.rig), sk = R_.socketById.get(h.socket), ik = R_.rec.constraints.find((k) => k.type === "TWO_BONE_IK" && k.chain[2] === sk.joint_id), [js, je, jw] = ik.chain;
      const M0 = fk(h.rig, s), rs = R_.joints.get(js).rest_xy, re = R_.joints.get(je).rest_xy, rw = R_.joints.get(jw).rest_xy, sc = scaleOf(M0[js]), A = apply(M0[js], rs);
      const pj = R_.joints.get(js).parent_id, parentM = pj ? M0[pj] : chain(T(s.root.x, s.root.y), R(s.root.rot), Sc(s.root.scale), T(-R_.root.rest_xy[0], -R_.root.rest_xy[1])), pa = angleOf(parentM);
      const phi = sg.driver_path.rot ? ev(sg.driver_path.rot, f) - (sk.basis_angle_deg || 0) : angleOf(M0[jw]), local = applyVec(chain(R(phi), Sc(sc)), sk.local_xy), tgt = [ev(sg.driver_path.x, f), ev(sg.driver_path.y, f)], Wt = [tgt[0] - local[0], tgt[1] - local[1]];
      const sol = solveTwoBonePosition(A, Wt, dist(rs, re) * sc, dist(re, rw) * sc, ik.bend_sign ?? 1), aSE = deg(Math.atan2(re[1] - rs[1], re[0] - rs[0])), aEW = deg(Math.atan2(rw[1] - re[1], rw[0] - re[0]));
      const ts = wrap180(deg(Math.atan2(sol.elbow[1] - A[1], sol.elbow[0] - A[0])) - aSE - pa), te = wrap180(deg(Math.atan2(Wt[1] - sol.elbow[1], Wt[0] - sol.elbow[0])) - aEW - pa - ts); s.theta[js] = ts; s.theta[je] = te; s.theta[jw] = wrap180(phi - pa - ts - te); }
    return socketFrame(h.rig, fk(h.rig, s), h.socket); };
  const surfaceFrame = (P_, sg, out) => { const sf = P_.surfaces.find((x) => x.ref === sg.driver); if (!sf?.target_rig || !out[sf.target_rig]) return null; return socketFrame(sf.target_rig, fk(sf.target_rig, out[sf.target_rig]), sf.target_socket); };
  /** the hands that are the TRANSFORM WRITER of a prop at f: their own grip contact is measured, never IK-solved toward the prop they move (no cycle) */
  C.actorDriversAt = (f) => { const out = new Set(); for (const P_ of propSupport) { const sg = segmentAt(P_, Math.floor(f)); if (sg?.mode !== "ACTOR_DRIVEN") continue; const h = P_.hands.find((x) => x.ref === sg.driver); if (h) out.add(`${h.rig}|${h.socket}|${P_.prop_rig}|${h.prop_socket}`); } return out; };
  C.propBakes = propBake;
  C.__bakePropAuthority = (stateAt) => { // in time order: each span's relative transform is measured on the exact validated frame before it starts
    const jobs = propSupport.flatMap((P_) => P_.segments.filter((sg) => sg.mode === "ACTOR_DRIVEN" || (sg.driver_kind === "SURFACE" && (sg.moving_surface || sg.hold_entry === "BAKED_PREDECESSOR"))).map((sg) => ({ P_, sg }))).sort((a, b) => a.sg.frames[0] - b.sg.frames[0]);
    for (const { P_, sg } of jobs) { if (propBake.has(segKey(P_, sg))) continue; const t0 = sg.frames[0], prevShot = t0 > 0 ? C.shotAt(t0 - 1) : null, tm = prevShot ? t0 - 1 : t0, prim = C.evalPrimary(tm, C.shotAt(tm)), pst = prim[P_.prop_rig];
      if (!pst) throw err("PROP_DRIVER_INVALID", { record_id: P_.id, frame_range: [tm, tm + 1], reason: `${P_.prop_rig} is not placed on the frame its ${sg.mode} span is measured from`, failed_invariant: "TRANSFER_FRAME_EVALUATED" });
      if (sg.driver_kind === "SURFACE" && sg.hold_entry === "BAKED_PREDECESSOR" && !sg.moving_surface) { propBake.set(segKey(P_, sg), { measured_at: tm, hold: JSON.parse(JSON.stringify(pst)), rel: null }); continue; }
      const Pm = fk(P_.prop_rig, pst)[rigs.get(P_.prop_rig).root.id], st = prevShot ? stateAt(tm) : null; // the driver frame at t-1 comes from the SOLVED state (incoming hand already valid there)
      const H = sg.mode === "ACTOR_DRIVEN" ? (() => { const h = P_.hands.find((x) => x.ref === sg.driver); return st ? socketFrame(h.rig, st.matrices[h.rig], h.socket) : driverFrame(P_, sg, prim, tm); })() : (() => { const sf = P_.surfaces.find((x) => x.ref === sg.driver); return socketFrame(sf.target_rig, st ? st.matrices[sf.target_rig] : fk(sf.target_rig, prim[sf.target_rig]), sf.target_socket); })();
      propBake.set(segKey(P_, sg), { measured_at: tm, rel: mul(inv(H), st ? st.matrices[P_.prop_rig][rigs.get(P_.prop_rig).root.id] : Pm), hold: null, from: prevShot ? "VALIDATED_PREVIOUS_FRAME" : "APPROVED_CONTACT_ALIGNMENT_AT_START" }); } };
  /** HINGE_FOLLOW: in [frames) the handle keeps the distance d0 it had to the driver joint at the first frame; afterwards it holds (or returns via its track) */
  C.reactionsAt = (f, shot, base = null) => {
    const out = [];
    for (const rx of plan.reactions || []) { const [a, b] = rx.frames; if (f < a || (f >= b && !rx.hold_after)) continue; const fe = Math.min(f, b - 1), cur = fe === f && base ? base : evalBase(fe, shot), first = evalBase(a, shot);
      if (!cur[rx.rig] || !cur[rx.driver.rig]) continue; const R1 = rigs.get(rx.rig), J = R1.joints.get(rx.joint), lim = J.rotation_limits_deg;
      const at = (st) => { const M = fk(rx.rig, st[rx.rig]), Mp = J.parent_id ? M[J.parent_id] : M[rx.joint]; return { pivot: apply(Mp, J.rest_xy), handle: socketWorld(rx.rig, M, rx.handle_socket), theta: st[rx.rig].theta[rx.joint], driver: apply(fk(rx.driver.rig, st[rx.driver.rig])[rx.driver.joint], rigs.get(rx.driver.rig).joints.get(rx.driver.joint).rest_xy) }; };
      const A0 = at(first), d0 = Math.hypot(A0.handle[0] - A0.driver[0], A0.handle[1] - A0.driver[1]), A1 = at(cur), s = solveHinge({ pivot: A1.pivot, handle: A1.handle, theta: A1.theta, driver: A1.driver, d0, limits: lim });
      out.push({ id: rx.id, rig: rx.rig, joint: rx.joint, angle: s.angle, residual_px: s.residual, ok: s.ok && s.residual <= (rx.allowed_error_px ?? 1), d0, frame_evaluated: fe }); }
    return out;
  };
  C.deformsAt = (f) => { const out = []; for (const [id, m] of Object.entries(plan.deform_maps || {})) { const a = actions.find((x) => x.id === id); if (a && (f < a.frame_range[0] || f >= a.frame_range[1] || C.shotAt(f)?.id !== a.shot_id)) continue; const w = ev(m.weight, f); if (Math.abs(w) < 1e-9) continue; out.push({ id, rig: m.rig, asset_id: m.asset, ...deformAt(m, w, { frame: f, id }) }); } return out; };
  C.morphsAt = (f) => { const out = []; for (const [id, m] of Object.entries(plan.morphs || {})) { const a = actions.find((x) => x.id === id); if (a && (f < a.frame_range[0] || f >= a.frame_range[1] || C.shotAt(f)?.id !== a.shot_id)) continue; const w = Math.max(0, Math.min(1, ev(m.weight, f))); out.push({ id, rig: m.rig, slot: m.slot, from: m.from, to: m.to, weight: w, d: morphAt(assets.get(m.from), assets.get(m.to), w) }); } return out; };
  C.supportAt = (f, M) => { const out = [], failures = []; for (const [rid, sp] of Object.entries(plan.support || {})) { if (!M[rid]) continue; const R_ = rigs.get(rid), held = C.contactsAt(f).filter((k) => k.locked && k.rig === rid && (sp.grip_support || []).includes(k.c.source_socket)).map((k) => k.c.source_socket), feet = [...sp.feet, ...held].map((s) => socketWorld(rid, M[rid], s)[0]), lo = Math.min(...feet) - (sp.margin_px ?? 0), hi = Math.max(...feet) + (sp.margin_px ?? 0), cx = comX(M[rid], R_.rec, sp.mass);
      const b = balance({ segments: [{ mass: 1, x: cx }], support_x: [lo, hi], family: sp.family || "ACTING_HUMAN", style_rationale: sp.style_rationale || null }); out.push({ rig: rid, com_x: cx, support_x: [lo, hi], ok: b.ok, held_support: held });
      if (!b.ok) failures.push(err("BALANCE_FAILED", { record_id: rid, frame_range: [f, f + 1], reason: b.reason, details: { com_x: cx, support_x: [lo, hi] } })); } return { support: out, failures }; };
  /** FK in canonical character coords: M_root = T(x,y)·R(rot)·S(scale)·T(-rest_root); M_j = M_parent · T(r_j)·R(θ_j)·T(-r_j) */
  const fk = (rid, st) => {
    const R_ = rigs.get(rid), r0 = R_.root.rest_xy, M = {};
    for (const j of R_.order) {
      const J = R_.joints.get(j), r = J.rest_xy;
      const parent = J.parent_id ? M[J.parent_id] : chain(T(st.root.x, st.root.y), R(st.root.rot), Sc(st.root.scale), T(-r0[0], -r0[1]));
      const o = st.offset?.[j] || [0, 0];
      M[j] = chain(parent, T(r[0] + o[0], r[1] + o[1]), R(st.theta[j]), T(-r[0], -r[1]));
    }
    return M;
  };
  C.fk = fk;
  const socketWorld = (rid, M, sid) => { const R_ = rigs.get(rid), s = R_.socketById.get(sid), r = R_.joints.get(s.joint_id).rest_xy; return apply(M[s.joint_id], [r[0] + s.local_xy[0], r[1] + s.local_xy[1]]); };
  C.socketWorld = socketWorld;
  // plan.reaches["actionId:socket"] = {approach:[a0,a1=start_frame], release:[r0=end_frame,r1]}: IK target = mix(FK socket, contact target, w)
  const rampOf = (k) => plan.reaches?.[`${k.action.id}:${k.c.source_socket}@${k.c.start_frame}`] || plan.reaches?.[`${k.action.id}:${k.c.source_socket}`] || null;
  const smooth = (p) => p * p * (3 - 2 * p);
  C.contactsAt = (f) => {
    const out = [];
    for (const k of contacts) {
      if (!k.identity.persists && C.shotAt(f)?.id !== k.action.shot_id) continue; // a declared persistent contact is physics across the cut, not per-shot
      if (k.c.start_frame <= f && f < k.c.end_frame) { out.push({ ...k, w: 1, locked: true }); continue; }
      const r = rampOf(k); if (!r) continue;
      if (r.approach && r.approach[0] <= f && f < k.c.start_frame) out.push({ ...k, w: smooth((f - r.approach[0]) / (k.c.start_frame - r.approach[0])), locked: false });
      else if (r.release && k.c.end_frame <= f && f < r.release[1]) out.push({ ...k, w: 1 - smooth((f - k.c.end_frame) / (r.release[1] - k.c.end_frame)), locked: false });
    }
    return out;
  };
  const holds = new Map(), worldHold = (k) => { const id = `${k.action.id}:${k.c.source_socket}:${k.c.start_frame}`; if (!holds.has(id)) { const f0 = k.c.start_frame, prim = C.evalPrimary(f0, C.shotAt(f0)), s0 = prim[k.rig]; holds.set(id, s0 ? socketWorld(k.rig, fk(k.rig, s0), k.c.source_socket) : null); } return holds.get(id); };
  /** pose intent → contact graph → constrained solution. Failures are structured, never clamped. */
  C.solveConstraints = (f, primary, active) => {
    const st = JSON.parse(JSON.stringify(primary)), failures = [], solved = [], M = {}, ikSolved = new Set();
    for (const rid of Object.keys(st)) if (!contactDriven.has(rid)) M[rid] = fk(rid, st[rid]);
    const writers = C.actorDriversAt(f);
    for (const k of active) {
      if (k.locked && writers.has(`${k.rig}|${k.c.source_socket}|${k.tgtRig}|${k.c.target_socket}`) && M[k.tgtRig]) { solved.push({ contact_id: k.identity.contact_id, visibility: k.identity.shot_visibility?.[C.shotAt(f)?.id]?.visibility ?? "VISIBLE", action: k.action.id, socket: k.c.source_socket, target_rig: k.tgtRig, target_socket: k.c.target_socket ?? null, start_frame: k.c.start_frame, target: socketWorld(k.tgtRig, M[k.tgtRig], k.c.target_socket), contact_type: k.c.contact_type, allowed_error_px: k.c.allowed_error_px, locked: true, w: 1, ik_joints: [], transform_writer: true }); continue; }
      const s = st[k.rig]; if (!s) { failures.push(err("UNKNOWN_REFERENCE", { record_id: k.action.id, frame_range: [f, f + 1], reason: `rig ${k.rig} not placed in shot` })); continue; }
      let target = k.tgtRig ? (M[k.tgtRig] ? socketWorld(k.tgtRig, M[k.tgtRig], k.c.target_socket) : null) : k.c.target_world_xy ?? worldHold(k);
      if (!target) { failures.push(err("CONTACT_DRIFT", { record_id: k.action.id, frame_range: [f, f + 1], reason: `target rig ${k.tgtRig} not placed` })); continue; }
      const R_ = rigs.get(k.rig), [js, je, jw] = k.chain, rs = R_.joints.get(js).rest_xy, re = R_.joints.get(je).rest_xy, rw = R_.joints.get(jw).rest_xy;
      const M0 = fk(k.rig, s), sc = scaleOf(M0[js]), phiW = angleOf(M0[jw]), parentM = R_.joints.get(js).parent_id ? M0[R_.joints.get(js).parent_id] : chain(T(s.root.x, s.root.y), R(s.root.rot), Sc(s.root.scale), T(-R_.root.rest_xy[0], -R_.root.rest_xy[1]));
      if (k.w < 1) { const fkS = socketWorld(k.rig, M0, k.c.source_socket); target = [fkS[0] + (target[0] - fkS[0]) * k.w, fkS[1] + (target[1] - fkS[1]) * k.w]; }
      // hand orientation: "WORLD" (default) keeps the unconstrained FK world angle; "RELATIVE" keeps the wrist's own track angle relative to the
      // solved forearm (fixed-point iteration on the small socket offset; converges because |local| << bone lengths)
      const orient = rampOf(k)?.orient || "WORLD", A = apply(M0[js], rs), thW = s.theta[jw];
      const pa = angleOf(parentM), aSE = deg(Math.atan2(re[1] - rs[1], re[0] - rs[0])), aEW = deg(Math.atan2(rw[1] - re[1], rw[0] - re[0]));
      try {
        let phi = phiW, sol, Wt, ts, te, tw;
        for (let it = 0; it < (orient === "RELATIVE" ? 12 : 1); it++) {
          const local = applyVec(chain(R(phi), Sc(sc)), k.socket.local_xy); Wt = [target[0] - local[0], target[1] - local[1]];
          sol = solveTwoBonePosition(A, Wt, dist(rs, re) * sc, dist(re, rw) * sc, k.bend);
          ts = wrap180(deg(Math.atan2(sol.elbow[1] - A[1], sol.elbow[0] - A[0])) - aSE - pa); te = wrap180(deg(Math.atan2(Wt[1] - sol.elbow[1], Wt[0] - sol.elbow[0])) - aEW - pa - ts);
          if (orient === "RELATIVE") { tw = thW; phi = pa + ts + te + tw; } else tw = wrap180(phiW - pa - ts - te);
        }
        if (!k.locked) { // blending from/to FK: the approved bend branch must be the FK pose's branch, otherwise the elbow would flip on the ramp boundary
          const Efk = apply(M0[je], re), Wfk = apply(M0[jw], rw), side = Math.sign((Wfk[0] - A[0]) * (Efk[1] - A[1]) - (Wfk[1] - A[1]) * (Efk[0] - A[0])); // the FK pose's own branch
          if (side && side !== k.bend) failures.push(err("UNAPPROVED_BEND_BRANCH", { record_id: `${k.rig}.${je}`, frame_range: [f, f + 1], dependency: k.action.id, reason: `declared bend_sign ${k.bend} contradicts the approved FK pose (elbow on side ${side}); the limb would flip branch at the reach boundary` }));
        }
        s.theta[js] = ts; s.theta[je] = te; s.theta[jw] = tw;
        for (const [j, v] of [[js, ts], [je, te], [jw, tw]]) { ikSolved.add(`${k.rig}.${j}`); const lim = R_.joints.get(j).rotation_limits_deg; if (v < lim[0] - 1e-6 || v > lim[1] + 1e-6) failures.push(err("JOINT_LIMIT_EXCEEDED", { record_id: `${k.rig}.${j}`, shot_id: k.action.shot_id, frame_range: [f, f + 1], dependency: k.action.id, suggested_producer: "re-stage within approved range or GPT pose cel for this extreme", reason: `${j} needs ${v.toFixed(2)}° outside approved [${lim}]`, details: { joint: j, angle: v, limits: lim } })); }
        solved.push({ contact_id: k.identity.contact_id, visibility: k.identity.shot_visibility?.[C.shotAt(f)?.id]?.visibility ?? "VISIBLE", action: k.action.id, socket: k.c.source_socket, target_rig: k.tgtRig, target_socket: k.c.target_socket ?? null, start_frame: k.c.start_frame, target, contact_type: k.c.contact_type, allowed_error_px: k.c.allowed_error_px, locked: k.locked, w: k.w, ik_joints: [js, je, jw] });
      } catch (e) { if (!e.code) throw e; e.frame_range = [f, f + 1]; e.record_id = k.action.id; e.shot_id = k.action.shot_id; failures.push(e); }
    }
    for (const rid of contactDriven) if (st[rid]) M[rid] = fk(rid, st[rid]);
    for (const [rid, s] of Object.entries(st)) for (const [j, v] of Object.entries(s.theta)) { if (ikSolved.has(`${rid}.${j}`)) continue; const lim = rigs.get(rid).joints.get(j).rotation_limits_deg, w = wrap180(v); if (w < lim[0] - 1e-6 || w > lim[1] + 1e-6) failures.push(err("JOINT_LIMIT_EXCEEDED", { record_id: `${rid}.${j}`, shot_id: C.shotAt(f)?.id, frame_range: [f, f + 1], suggested_producer: "GPT pose/bend cel for this extreme, or re-stage within the approved range", reason: `${j} at ${w.toFixed(2)}° outside approved [${lim}]`, details: { joint: j, angle: w, limits: lim } })); }
    for (const [rid, gz] of Object.entries(plan.gaze || {})) for (const [j, g] of Object.entries(gz)) { const o = st[rid]?.offset?.[j]; if (!o) continue; const pupil = assets.get(g.pupil_asset), surf = assets.get(g.surface_asset), [px, py, pw, ph] = pupil.canonical_rect, [sx, sy, sw, sh] = surf.canonical_rect; if (px + o[0] < sx || py + o[1] < sy || px + o[0] + pw > sx + sw || py + o[1] + ph > sy + sh) failures.push(err("UNSUPPORTED_STATE_EDGE", { record_id: `${rid}.${j}`, frame_range: [f, f + 1], reason: `gaze offset [${o.map((v) => v.toFixed(2))}] leaves owned eye surface ${surf.id}` })); }
    for (const s of solved) { if (!s.locked) continue; const k = contacts.find((x) => x.identity.contact_id === s.contact_id); /* P07: one socket may hold several props in one action at different times */ s.achieved = socketWorld(k.rig, M[k.rig], s.socket); s.error_px = dist(s.achieved, s.target);
      // directive I2/N4: contact = position AND orientation. When the contact declares a target basis angle and the socket a palm/sole basis,
      // the post-FK world angle must match (wrapped) — a reversed palm fails even with zero XY error
      if (Number.isFinite(k.c.target_angle_deg) && Number.isFinite(k.socket.basis_angle_deg)) { const tgtAng = k.c.target_angle_deg + (k.tgtRig && M[k.tgtRig] ? angleOf(M[k.tgtRig][rigs.get(k.tgtRig).socketById.get(k.c.target_socket)?.joint_id] || [1, 0, 0, 1, 0, 0]) : 0); s.angle_residual_deg = Math.abs(wrap180(angleOf(M[k.rig][k.socket.joint_id]) + k.socket.basis_angle_deg - tgtAng)); if (s.angle_residual_deg > (k.c.allowed_angle_deg ?? 12)) failures.push(err("CONTACT_ORIENTATION_UNSATISFIABLE", { record_id: s.action, frame_range: [f, f + 1], dependency: s.socket, reason: `palm/sole basis off by ${s.angle_residual_deg.toFixed(2)}° (allowed ${k.c.allowed_angle_deg ?? 12}°)`, details: { angle_residual_deg: s.angle_residual_deg } })); } if (s.error_px > s.allowed_error_px) failures.push(err("CONTACT_DRIFT", { record_id: s.action, frame_range: [f, f + 1], reason: `contact error ${s.error_px.toFixed(3)}px > ${s.allowed_error_px}` })); }
    return { state: st, matrices: M, solved, failures };
  };
  // approved art states: pure function of the event list (last event ≤ f inside an active action of the shot), never of a previous frame
  C.resolveApprovedArtStates = (f, constrained) => {
    const shot = C.shotAt(f), out = {};
    for (const rid of Object.keys(constrained.state)) {
      const R_ = rigs.get(rid), { pose, view } = poseAt(R_.rec, poseTl.get(rid), f); // the rig's single persistent history (P04 §3.1)
      // expression / eyes / mouth / hand / clothing / lighting / occlusion come from their OWN channels (never from the pose id)
      const r = resolveBindings(R_.rec, pose, view, channelStatesAt(R_.rec, chanEvents.get(rid) || [], f, shot?.id));
      out[rid] = { pose, view, expression: r.expression, eyes: r.eyes, mouth: r.mouth, channels: r.channels, bindings: r.bindings, hidden: new Set() };
    }
    return out;
  };
  /** one transform cache → every paint pass of a joint reads the same matrix (no duplicated animation of near/far passes) */
  C.resolvePaintPasses = (artStates, matrices) => {
    const passes = [];
    for (const [rid, M] of Object.entries(matrices)) {
      const R_ = rigs.get(rid), st = artStates[rid];
      for (const p of R_.rec.render_parts) {
        const assetId = st?.bindings?.[p.asset_id] ?? p.asset_id, a = assets.get(assetId);
        if (!a) throw err("MISSING_ART_ASSET", { record_id: assetId, reason: `state binds ${p.asset_id} → ${assetId} which is not in the manifest` });
        passes.push({ pass_id: `${rid}--${p.asset_id}--${assetId}`, slot: p.asset_id, asset_id: assetId, rig: rid, joint: p.joint_id, matrix: mul(M[p.joint_id], p.local_to_joint_matrix), visible: !st?.hidden?.has(p.asset_id) });
      }
    }
    return passes;
  };
  // baked secondary: fixed-step damped spring on joint angle, driven by the driver joint's angular acceleration (canonical initial state 0,0)
  for (const s of plan.secondary || []) {
    const n = s.substeps || 4, dt = 1 / (60 * n), arr = new Float64Array(total); let x = 0, v = 0, prevW = 0;
    const drv = (f) => rawJoint(s.driver.rig, s.driver.joint, Math.min(total - 1, Math.max(0, f)));
    for (let f = 0; f < total; f++) {
      const w = (drv(f + 1) - drv(f - 1)) / 2 * 60, acc = (w - prevW) * 60; prevW = w;
      for (let i = 0; i < n; i++) { const a = -s.stiffness * x - s.damping * v - s.gain * acc; v += a * dt; x += v * dt; }
      arr[f] = x;
    }
    C.secondaryBaked[`${s.rig}.${s.joint}`] = arr;
  }
  C.evalBakedSecondary = (f) => Object.fromEntries(Object.entries(C.secondaryBaked).map(([k, a]) => [k, a[f]]));
  C.cameraAt = (f) => { const shot = C.shotAt(f), c = plan.cameras?.[shot?.camera_track_id] || {}, g = (p, d) => (c[p] ? ev(c[p], f) : d); return { id: shot?.camera_track_id || null, x: g("x", doc.stage.width / 2), y: g("y", doc.stage.height / 2), zoom: g("zoom", 1), rot: g("rot", 0) }; };
  C.eventsAt = (f) => {
    const ev_ = [];
    for (const a of actions) { for (const e of a.pose_events) if (e.frame === f) ev_.push({ type: "POSE", action: a.id, state: e.state_id }); for (const e of a.view_events) if (e.frame === f) ev_.push({ type: "VIEW", action: a.id, from: e.from_state, state: e.to_state }); for (const c of a.contact_events) { if (c.start_frame === f) ev_.push({ type: "CONTACT_START", action: a.id, socket: c.source_socket }); if (c.end_frame === f) ev_.push({ type: "CONTACT_END", action: a.id, socket: c.source_socket }); } }
    return ev_;
  };
  // registered cels (gait etc.): entry index from the distance track; placement anchors the planted landmark → no foot slide at cel swaps
  C.celsAt = (f) => {
    const out = [];
    for (const [aid, cel] of Object.entries(plan.cels || {})) {
      const a = actions.find((x) => x.id === aid); if (!a || f < a.frame_range[0] || f >= a.frame_range[1] || C.shotAt(f)?.id !== a.shot_id) continue;
      const step = cel.step_distance_px, d = ev(cel.distance, f), idx = Math.max(0, Math.floor(d / step)), n = cel.cycle.length;
      let plant = cel.start_xy.slice(), placeM = null;
      for (let i = 0; i <= idx; i++) {
        const e = cel.cycle[i % n], ca = assets.get(e.asset_id), anc = ca.landmarks[e.anchor];
        placeM = T(plant[0] - anc[0], plant[1] - anc[1]);
        if (i < idx && e.lands) plant = apply(placeM, ca.landmarks[e.lands]);
      }
      const e = cel.cycle[idx % n];
      out.push({ action: aid, entry_index: idx, asset_id: e.asset_id, anchor: e.anchor, plant: apply(placeM, assets.get(e.asset_id).landmarks[e.anchor]), matrix: placeM, band: cel.band || "FOCAL" });
    }
    return out;
  };
  C.proceduralAt = (f) => {
    const out = [];
    for (const [aid, p] of Object.entries(plan.procedural || {})) {
      if (p.type === "MODEL_BAR") { const a = actions.find((x) => x.id === aid); if (!a || f < a.frame_range[0] || f >= a.frame_range[1]) continue; const b = modelBars.at(aid, f); if (b) out.push(b); continue; }
      if (p.type !== "FLOW_PATH") continue; const a = actions.find((x) => x.id === aid); if (!a || f < a.frame_range[0] || f >= a.frame_range[1]) continue;
      const segs = []; let L = 0; for (let i = 1; i < p.path.length; i++) { const l = dist(p.path[i - 1], p.path[i]); segs.push([L, l, p.path[i - 1], p.path[i]]); L += l; }
      const count = Math.max(0, Math.round(ev(p.count, f))), head = (f - a.frame_range[0]) * p.speed_px_per_frame, sym = assets.get(p.symbol_asset), [px, py] = sym.pivot_xy;
      for (let i = 0; i < count; i++) {
        const s = (((head - i * p.spacing_px) % L) + L) % L, seg = segs.find((g) => s >= g[0] && s < g[0] + g[1]) || segs.at(-1), u = (s - seg[0]) / seg[1];
        const pos = [seg[2][0] + (seg[3][0] - seg[2][0]) * u, seg[2][1] + (seg[3][1] - seg[2][1]) * u], ang = deg(Math.atan2(seg[3][1] - seg[2][1], seg[3][0] - seg[2][0]));
        out.push({ pass_id: `${aid}--sym${i}`, asset_id: p.symbol_asset, matrix: chain(T(pos[0], pos[1]), R(ang), T(-px, -py)), band: p.band || "FOCAL", s });
      }
    }
    return out;
  };
  if (propSupport.some((P_) => P_.segments.some((sg) => sg.mode === "ACTOR_DRIVEN" || sg.moving_surface || sg.hold_entry === "BAKED_PREDECESSOR"))) C.__bakePropAuthority((t) => stateAtFrame(C, t));
  return Object.freeze(C);
}

/** stateAtFrame(compiled, t): the spec §11.1 causal order, pure in t. t is an integer frame, or a SUB-FRAME sample time inside a frame
 *  (shutter blur, P02 repair; opt-in {subframe: true}): continuous motion (primary curves, constraints, camera) is evaluated at t; DISCRETE state — shot ownership,
 *  contact graph, approved art states, cels, procedural phases, baked secondary, events — belongs to the integer frame floor(t). */
export function stateAtFrame(compiled, f, { subframe = false } = {}) {
  if (!(subframe ? Number.isFinite(f) : Number.isInteger(f)) || f < 0 || f >= compiled.totalFrames) throw new RangeError(`INVALID_FRAME ${f}`); // sub-frame times only when the caller is an explicit shutter sampler
  const fi = Math.floor(f), shot = compiled.shotAt(fi);
  if (!shot) throw err("SHOT_COVERAGE_GAP", { frame_range: [fi, fi + 1], reason: `no shot at frame ${fi}` });
  const primary = compiled.evalPrimary(f, shot);
  const contactGraph = compiled.contactsAt(fi);
  const constrained = compiled.solveConstraints(f, primary, contactGraph);
  const artStates = compiled.resolveApprovedArtStates(fi, constrained);
  const matrices = constrained.matrices;
  const passes = compiled.resolvePaintPasses(artStates, matrices);
  const cels = compiled.celsAt(fi), procedural = compiled.proceduralAt(fi);
  const secondary = compiled.evalBakedSecondary(fi);
  const failures = [...constrained.failures];
  // P03 E/F: deformation, vector morph, mechanism reaction residuals and support are part of the frame state (and its failures)
  const deforms = compiled.deformsAt(fi), morphs = compiled.morphsAt(fi), reactions = compiled.reactionsAt(f, shot), support = compiled.supportAt(fi, matrices);
  for (const d of deforms) failures.push(...d.failures); failures.push(...support.failures);
  for (const r of reactions) if (!r.ok) failures.push(err("REACTION_UNSATISFIABLE", { record_id: r.id, frame_range: [fi, fi + 1], reason: `mechanism cannot follow the pull within its approved hinge range (residual ${r.residual_px.toFixed(2)}px)`, details: r }));
  // P07: shared prop support, evaluated from the same solved contacts, matrices and art states the renderer draws
  const pivotOf = (rid, Mr, j) => apply(Mr[j], compiled.rigs.get(rid).joints.get(j).rest_xy);
  const propSupport = (compiled.propSupport || []).map((p) => evaluatePropSupport(p, fi, { solved: constrained.solved, contacts: compiled.contacts, M: matrices, artStates, socketWorld: compiled.socketWorld, pivotOf })).filter(Boolean);
  for (const r of propSupport) failures.push(...r.failures);
  for (const p of passes) if (!finite(p.matrix)) failures.push(err("RENDER_CAPTURE_FAILURE", { record_id: p.pass_id, frame_range: [f, f + 1], reason: "non-finite matrix" }));
  return Object.freeze({ frame: f, shotId: shot.id, artStates, matrices, passes, cels, procedural, secondary, contacts: constrained.solved, failures, camera: compiled.cameraAt(f), events: compiled.eventsAt(fi), deforms, morphs, reactions, support: support.support, prop_support: propSupport });
}
