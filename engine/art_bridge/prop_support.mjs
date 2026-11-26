// P07 multi-support props. A prop may be supported at the same instant by several hands (of one actor or of several actors) and by fixed
// surfaces; exactly ONE of those supports is the authoritative transform DRIVER in every frame of the prop's supported span, and control moves
// from one driver to the next only at an explicit transfer frame at which the incoming support is ALREADY physically valid.
//   - hand supports are the existing GRIP/PINCH contacts of the actors' hand sockets onto REGISTERED prop sockets (contact solver, layer 4);
//   - surface supports bind a registered prop socket (its base) to a registered surface socket or a fixed world point;
//   - while a hand drives, the prop follows its directed track and the driving hand's contact/closure/orientation must hold on every frame
//     (an arm that cannot follow fails as UNREACHABLE_IK / JOINT_LIMIT_EXCEEDED / CONTACT_DRIFT, never as a stretched limb);
//   - while a surface drives, the surface is the transform writer: the prop is HELD at the pose it had when the surface took over, and an
//     authored track that still moves it is a second, conflicting driver (PROP_DRIVER_CONFLICT).
// Nothing here knows a film, a shot or a frame number: all of that comes from the approved contract (schemas/prop_support_v1.schema.json).
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { err } from "./errors.mjs";
import { validate } from "./jsonschema.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url));
export const PROP_SUPPORT_VERSION = "1.0.0";
export const SCHEMA_FILE = path.resolve(here, "..", "..", "schemas", "prop_support_v1.schema.json");
export const SCHEMA = JSON.parse(fs.readFileSync(SCHEMA_FILE, "utf8"));
const P = "engine/art_bridge/prop_support.mjs";
const HOLDING = ["GRIP", "PINCH"];
const refuse = (code, o) => err(code, { record_id: o.record ?? null, frame_range: o.frame_range ?? null, reason: o.reason, producer: `${P}#${o.fn ?? "compilePropSupport"}`, failed_invariant: o.invariant, required_art_or_operation: o.needed ? [].concat(o.needed) : [],
  details: { prop: o.prop ?? null, supporter: o.supporter ?? null, frame_range: o.frame_range ?? null, failed_invariant: o.invariant, earliest_producer: `${P}#${o.fn ?? "compilePropSupport"}`, needed_art_or_capability: o.needed ?? null } });
const overl = (a, b) => a[0] < b[1] && b[0] < a[1];
/** union of half-open intervals covers [a,b)? */
const covers = (ivs, [a, b]) => { let cur = a; for (const iv of [...ivs].sort((x, y) => x[0] - y[0])) { if (iv[0] > cur) break; cur = Math.max(cur, iv[1]); if (cur >= b) return true; } return cur >= b; };
const firstGap = (ivs, [a, b]) => { let cur = a; for (const iv of [...ivs].sort((x, y) => x[0] - y[0])) { if (iv[0] > cur) return cur; cur = Math.max(cur, iv[1]); if (cur >= b) return null; } return cur < b ? cur : null; };
export const isSurfaceRef = (r) => typeof r === "string" && r.startsWith("surface:");

/** normalizePropSupport(spec, {doc, roleOf}) → {props, errors}. roleOf(rigId, key) resolves the REVIEWED role map (hand.<h>.socket/.channel/.closed_state). */
export function normalizePropSupport(spec, { doc, roleOf }) {
  const errors = []; if (!spec) return { props: [], errors };
  const se = validate(SCHEMA, spec); if (se.length) return { props: [], errors: se.slice(0, 20).map((x) => refuse("PROP_SUPPORT_INVALID", { record: x.path, invariant: "SCHEMA_V1", reason: `${x.path}: ${x.msg}` })) };
  const rigs = new Map((doc.rigs || []).map((r) => [r.id, r])), props = [], seenRig = new Set();
  for (const p of spec.props) {
    const no = (code, o) => errors.push(refuse(code, { record: p.id, prop: p.id, ...o })), R = rigs.get(p.prop_rig_id);
    if (!R) { no("UNKNOWN_REFERENCE", { invariant: "PROP_RIG_EXISTS", reason: `prop rig ${p.prop_rig_id} is not in the manifest` }); continue; }
    if (seenRig.has(R.id)) no("DUPLICATE_ELEMENT_ID", { invariant: "ONE_CONTRACT_PER_PROP", reason: `prop rig ${R.id} has two support contracts` }); seenRig.add(R.id);
    const sockOf = (sid) => R.sockets.find((s) => s.id === sid);
    const hands = new Map();
    for (const h of p.hands) { const [rig, name] = h.ref.split("#"), AR = rigs.get(rig);
      if (!AR) { no("UNKNOWN_REFERENCE", { supporter: h.ref, invariant: "SUPPORTER_RIG_EXISTS", reason: `supporter ${h.ref}: rig ${rig} is not in the manifest` }); continue; }
      const socket = roleOf(rig, `hand.${name}.socket`), channel = roleOf(rig, `hand.${name}.channel`), closed = roleOf(rig, `hand.${name}.closed_state`);
      if (!socket) { no("PERFORMANCE_CAPABILITY_MISSING", { supporter: h.ref, invariant: "HAND_ROLE_RESOLVES", reason: `${h.ref}: the reviewed role map has no hand.${name}.socket`, needed: `role hand.${name}.socket on ${rig}` }); continue; }
      if (!channel || !closed) { no("MISSING_ART_ASSET", { supporter: h.ref, invariant: "PAINTED_HAND_EXISTS", reason: `${h.ref}: a supporting hand needs its HAND channel and an approved closed drawing (hand.${name}.channel / hand.${name}.closed_state)`, needed: `approved closed-hand drawing for ${h.ref}` }); continue; }
      if (!sockOf(h.prop_socket)) { no("PROP_CONTACT_TARGET_INCONSISTENT", { supporter: h.ref, invariant: "PROP_SOCKET_EXISTS", reason: `${h.ref} is bound to ${h.prop_socket}, which is not a registered socket of ${R.id}` }); continue; }
      if (!(AR.constraints || []).some((k) => k.type === "TWO_BONE_IK" && k.chain[2] === AR.sockets.find((s) => s.id === socket)?.joint_id)) { no("UNREACHABLE_IK", { supporter: h.ref, invariant: "HAND_HAS_IK", reason: `${h.ref}: no TWO_BONE_IK chain ends at its hand socket ${socket}` }); continue; }
      if (hands.has(h.ref)) no("DUPLICATE_ELEMENT_ID", { supporter: h.ref, invariant: "ONE_BINDING_PER_HAND", reason: `${h.ref} is bound twice on ${p.id}` });
      hands.set(h.ref, { ref: h.ref, kind: "HAND", rig, hand: name, socket, channel, closed, prop_socket: h.prop_socket, grip_angle_deg: h.grip_angle_deg ?? null, allowed_angle_deg: h.allowed_angle_deg ?? null }); }
    const surfaces = new Map();
    for (const s of p.surfaces) { const t = s.target || {}; if (!sockOf(s.prop_socket)) { no("PROP_CONTACT_TARGET_INCONSISTENT", { supporter: `surface:${s.id}`, invariant: "PROP_SOCKET_EXISTS", reason: `surface ${s.id} binds ${s.prop_socket}, not a registered socket of ${R.id}` }); continue; }
      const byRig = t.rig_id && t.socket_id, byWorld = Array.isArray(t.world_xy); if (byRig === byWorld) { no("PROP_SUPPORT_INVALID", { supporter: `surface:${s.id}`, invariant: "SURFACE_TARGET_UNIQUE", reason: `surface ${s.id} needs exactly one target: a registered surface socket OR a fixed world point` }); continue; }
      if (byRig && !rigs.get(t.rig_id)?.sockets.some((x) => x.id === t.socket_id)) { no("UNKNOWN_REFERENCE", { supporter: `surface:${s.id}`, invariant: "SURFACE_SOCKET_EXISTS", reason: `surface ${s.id}: ${t.rig_id}.${t.socket_id} is not a registered socket` }); continue; }
      if (!(s.frames[1] > s.frames[0])) { no("INVALID_FRAME_RANGE", { supporter: `surface:${s.id}`, invariant: "SURFACE_FRAMES", reason: `surface ${s.id} frames [${s.frames}) are empty` }); continue; }
      surfaces.set(`surface:${s.id}`, { ref: `surface:${s.id}`, kind: "SURFACE", id: s.id, prop_socket: s.prop_socket, target_rig: t.rig_id ?? null, target_socket: t.socket_id ?? null, target_world_xy: t.world_xy ?? null, frames: s.frames }); }
    // authority tiling: exactly one driver per instant, no unsupported gap inside the span
    const segs = [...p.authority].map((a) => ({ frames: a.frames, driver: a.driver, required: [...new Set([a.driver, ...a.required_supports])] })).sort((a, b) => a.frames[0] - b.frames[0]);
    for (const s of segs) { if (!(s.frames[1] > s.frames[0])) no("INVALID_FRAME_RANGE", { invariant: "AUTHORITY_FRAMES", frame_range: s.frames, reason: `authority [${s.frames}) is empty` });
      for (const r of s.required) if (!hands.has(r) && !surfaces.has(r)) no("UNKNOWN_REFERENCE", { supporter: r, invariant: "SUPPORT_DECLARED", frame_range: s.frames, reason: `authority [${s.frames}) names ${r}, which is not a declared hand or surface of ${p.id}` }); }
    for (let i = 1; i < segs.length; i++) { const a = segs[i - 1], b = segs[i];
      if (b.frames[0] < a.frames[1]) no("PROP_DRIVER_CONFLICT", { invariant: "ONE_DRIVER_PER_INSTANT", frame_range: [b.frames[0], a.frames[1]], reason: `${a.driver} and ${b.driver} both drive ${p.id} in [${b.frames[0]},${a.frames[1]})` });
      else if (b.frames[0] > a.frames[1]) no("PROP_UNSUPPORTED_GAP", { invariant: "SUPPORT_SPAN_GAP_FREE", frame_range: [a.frames[1], b.frames[0]], reason: `nothing drives ${p.id} in [${a.frames[1]},${b.frames[0]}): an unsupported prop would float or fall` }); }
    // a surface-driven run holds the pose it had when that surface took over
    for (let i = 0; i < segs.length; i++) { const s = segs[i]; s.driver_kind = isSurfaceRef(s.driver) ? "SURFACE" : "HAND"; s.hold_from = s.driver_kind === "SURFACE" ? (i > 0 && segs[i - 1].driver === s.driver ? segs[i - 1].hold_from : s.frames[0]) : null; }
    props.push({ id: p.id, prop_rig: R.id, object: R.identity_id ?? R.id, test_id: p.test_id, human_quality_check: p.human_quality_check ?? null, max_step_px: p.max_step_px, surface_tolerance_px: p.surface_tolerance_px, settle_tolerance_px: p.settle_tolerance_px,
      root_joint: (R.joints.find((j) => !j.parent_id) || R.joints[0]).id, prop_sockets: R.sockets.map((x) => x.id), hands: [...hands.values()], surfaces: [...surfaces.values()], segments: segs, span: segs.length ? [segs[0].frames[0], segs.at(-1).frames[1]] : null });
  }
  return { props, errors };
}
/** the hand bound to a prop socket for an actor rig (command hand resolution: the registered socket decides the hand, not a guess) */
export function handBoundTo(props, rigId, propRig, propSocket) { for (const p of props) if (p.prop_rig === propRig) for (const h of p.hands) if (h.rig === rigId && h.prop_socket === propSocket) return h; return null; }

/** validatePropCoverage(props, actions) → errors. Run AFTER every command emitted its contacts: the contract must be carried by real contacts. */
export function validatePropCoverage(props, actions) {
  const errors = [], all = actions.flatMap((a) => a.contact_events.map((c) => ({ ...c, action: a.id })));
  for (const p of props) {
    const no = (code, o) => errors.push(refuse(code, { record: p.id, prop: p.id, fn: "validatePropCoverage", ...o }));
    const byHand = new Map(p.hands.map((h) => [h.ref, all.filter((c) => c.source_socket === h.socket && HOLDING.includes(c.contact_type))]));
    const propSockets = new Set(p.prop_sockets); // every REGISTERED socket of the prop rig, not only the contract-bound ones
    for (const h of p.hands) for (const c of byHand.get(h.ref)) {
      const onThisProp = c.target_socket && (c.target_socket === h.prop_socket || propSockets.has(c.target_socket));
      if (onThisProp && c.target_socket !== h.prop_socket) no("PROP_CONTACT_TARGET_INCONSISTENT", { supporter: h.ref, invariant: "HAND_ON_ITS_BOUND_SOCKET", frame_range: [c.start_frame, c.end_frame], reason: `${h.ref} grips ${c.target_socket} but the contract binds it to ${h.prop_socket}` }); }
    // two hands on one prop socket at once is physically impossible
    for (let i = 0; i < p.hands.length; i++) for (let j = i + 1; j < p.hands.length; j++) { const A = p.hands[i], B = p.hands[j]; if (A.prop_socket !== B.prop_socket) continue;
      for (const a of byHand.get(A.ref).filter((c) => c.target_socket === A.prop_socket)) for (const b of byHand.get(B.ref).filter((c) => c.target_socket === B.prop_socket)) if (overl([a.start_frame, a.end_frame], [b.start_frame, b.end_frame])) no("PROP_SOCKET_OCCUPIED", { supporter: `${A.ref}+${B.ref}`, invariant: "ONE_HAND_PER_PROP_SOCKET", frame_range: [Math.max(a.start_frame, b.start_frame), Math.min(a.end_frame, b.end_frame)], reason: `${A.ref} and ${B.ref} both hold socket ${A.prop_socket} at once` }); }
    const ivOf = (ref) => { if (isSurfaceRef(ref)) { const s = p.surfaces.find((x) => x.ref === ref); return s ? [s.frames] : []; } const h = p.hands.find((x) => x.ref === ref); return h ? byHand.get(ref).filter((c) => c.target_socket === h.prop_socket).map((c) => [c.start_frame, c.end_frame]) : []; };
    p.segments.forEach((s, i) => {
      for (const r of s.required) { const iv = ivOf(r); if (covers(iv, s.frames)) continue; const gap = firstGap(iv, s.frames), started = iv.some((x) => x[0] <= s.frames[0] && x[1] > s.frames[0]);
        if (r === s.driver && started) no("PROP_DRIVER_RELEASED_EARLY", { supporter: r, invariant: "DRIVER_HOLDS_ITS_INTERVAL", frame_range: [gap, s.frames[1]], reason: `driver ${r} lets go of ${p.id} at ${gap}, before its authority ends at ${s.frames[1]} (premature release)` });
        else if (r === s.driver && i > 0) no("PROP_TRANSFER_INVALID", { supporter: r, invariant: "INCOMING_SUPPORT_VALID_AT_TRANSFER", frame_range: [s.frames[0], s.frames[0] + 1], reason: `control of ${p.id} passes to ${r} at ${s.frames[0]} but ${r} is not supporting it then` });
        else no("PROP_SUPPORT_MISSING", { supporter: r, invariant: "REQUIRED_SUPPORT_PRESENT", frame_range: [gap ?? s.frames[0], s.frames[1]], reason: `${r} is a required support of ${p.id} in [${s.frames}) but holds nothing from ${gap ?? s.frames[0]}` }); }
      // transfer: the incoming driver must already be valid on the frame BEFORE it takes control (a dual-support instant), never become valid at the hand-off itself
      if (i > 0 && p.segments[i - 1].driver !== s.driver && p.segments[i - 1].frames[1] === s.frames[0]) { const t = s.frames[0], iv = ivOf(s.driver);
        if (!iv.some((x) => x[0] <= t - 1 && x[1] > t - 1)) no("PROP_TRANSFER_INVALID", { supporter: s.driver, invariant: "INCOMING_SUPPORT_VALID_BEFORE_TRANSFER", frame_range: [t - 1, t + 1], reason: `${s.driver} takes control of ${p.id} at ${t} but was not supporting it at ${t - 1}: support transferred before the new support is physically valid` }); }
    });
  }
  return errors;
}

/** contacts on one prop rig that overlap in time, with no contract for that rig → the transform owner would be ambiguous */
export function multiSupportWithoutContract(contacts, contractRigs) {
  const out = [], by = new Map(); for (const k of contacts) if (k.tgtRig && HOLDING.concat(["FOLLOW"]).includes(k.c.contact_type)) (by.get(k.tgtRig) || by.set(k.tgtRig, []).get(k.tgtRig)).push(k);
  for (const [rig, list] of by) { if (contractRigs.has(rig)) continue; for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) { const a = list[i], b = list[j]; if (a.c.source_socket === b.c.source_socket) continue; if (overl([a.c.start_frame, a.c.end_frame], [b.c.start_frame, b.c.end_frame]))
    out.push(refuse("PROP_SUPPORT_CONTRACT_REQUIRED", { record: rig, prop: rig, fn: "multiSupportWithoutContract", invariant: "ONE_TRANSFORM_OWNER", frame_range: [Math.max(a.c.start_frame, b.c.start_frame), Math.min(a.c.end_frame, b.c.end_frame)], reason: `${a.c.source_socket} and ${b.c.source_socket} hold ${rig} at once with no prop support contract naming which one drives it`, needed: "a prop_support contract (driver per frame, explicit transfer)" })); } }
  return out;
}

export const segmentAt = (p, f) => p.segments.find((s) => s.frames[0] <= f && f < s.frames[1]) || null;
/** evaluatePropSupport(p, f, ctx) — the frame's support record, from the SAME solved contacts, matrices and art states the renderer draws */
export function evaluatePropSupport(p, f, { solved, contacts, M, artStates, socketWorld, pivotOf }) {
  const seg = segmentAt(p, f); if (!seg || !M[p.prop_rig]) return null;
  const refs = new Set([...p.hands.map((h) => h.ref), ...p.surfaces.filter((s) => s.frames[0] <= f && f < s.frames[1]).map((s) => s.ref), ...seg.required]), supporters = [];
  for (const ref of refs) {
    if (isSurfaceRef(ref)) { const s = p.surfaces.find((x) => x.ref === ref); if (!s) continue; const active = s.frames[0] <= f && f < s.frames[1]; let d = null, why = null;
      if (!active) why = "surface not in contact in this frame"; else { const base = socketWorld(p.prop_rig, M[p.prop_rig], s.prop_socket), tgt = s.target_rig ? (M[s.target_rig] ? socketWorld(s.target_rig, M[s.target_rig], s.target_socket) : null) : s.target_world_xy;
        if (!tgt) why = `surface ${s.target_rig} not placed`; else { d = Math.hypot(base[0] - tgt[0], base[1] - tgt[1]); if (d > p.surface_tolerance_px) why = `prop base ${s.prop_socket} is ${d.toFixed(2)}px from the surface (allowed ${p.surface_tolerance_px})`; } }
      supporters.push({ ref, kind: "SURFACE", required: seg.required.includes(ref), valid: !why, why, distance_px: d === null ? null : +d.toFixed(3) }); continue; }
    const h = p.hands.find((x) => x.ref === ref); if (!h) continue;
    const s = solved.find((x) => x.socket === h.socket && x.target_rig === p.prop_rig && x.target_socket === h.prop_socket); void contacts;
    let why = null; const closure = artStates?.[h.rig]?.channels?.[h.channel] ?? null;
    if (!s) why = "no contact on the bound prop socket"; else if (!s.locked) why = "contact not locked (approaching or releasing)"; else if (s.error_px > s.allowed_error_px) why = `contact error ${s.error_px.toFixed(2)}px > ${s.allowed_error_px}`;
    else if (Number.isFinite(s.angle_residual_deg) && h.grip_angle_deg !== null && s.angle_residual_deg > (h.allowed_angle_deg ?? 12)) why = `palm orientation off by ${s.angle_residual_deg.toFixed(1)}°`;
    else if (closure !== h.closed) why = `painted hand shows ${closure ?? "no state"}, not the closed ${h.closed} drawing`;
    supporters.push({ ref, kind: "HAND", required: seg.required.includes(ref), valid: !why, why, locked: !!s?.locked, error_px: s?.error_px ?? null, closure });
  }
  const failures = [], drv = supporters.find((x) => x.ref === seg.driver);
  if (!drv?.valid) failures.push(refuse(drv?.why?.startsWith("painted hand") ? "GRIP_MORPHOLOGY_FAILED" : "PROP_DRIVER_INVALID", { record: p.prop_rig, prop: p.id, supporter: seg.driver, fn: "evaluatePropSupport", frame_range: [f, f + 1], invariant: "DRIVER_SUPPORT_VALID", reason: `driver ${seg.driver} of ${p.id}: ${drv?.why ?? "absent"}` }));
  for (const x of supporters) if (x.required && x.ref !== seg.driver && !x.valid) failures.push(refuse(x.kind === "SURFACE" ? "PROP_SURFACE_CONTACT_INVALID" : x.why?.startsWith("painted hand") ? "GRIP_MORPHOLOGY_FAILED" : "PROP_SUPPORT_MISSING", { record: p.prop_rig, prop: p.id, supporter: x.ref, fn: "evaluatePropSupport", frame_range: [f, f + 1], invariant: "REQUIRED_SUPPORT_VALID", reason: `${x.ref} must support ${p.id} here: ${x.why}` }));
  return { prop: p.id, prop_rig: p.prop_rig, object: p.object, frame: f, driver: seg.driver, driver_kind: seg.driver_kind, required: seg.required, supporters, valid_supporters: supporters.filter((x) => x.valid).map((x) => x.ref), root_xy: pivotOf(p.prop_rig, M[p.prop_rig], p.root_joint), ok: !failures.length, failures };
}
