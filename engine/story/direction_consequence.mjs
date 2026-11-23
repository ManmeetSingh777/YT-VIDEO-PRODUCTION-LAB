// P04 §2.2 — every approved direction decision must EXECUTE. A decision (direction/DIRECTION_DECISIONS.json) names its consuming operation
//   {owner, operation, effect?, joint?, channel?, state?, target?, min_px?, min_deg?, reason?} over [s,e). The operation's own consequence is
// MEASURED on the compiled production motion of THAT owner over THAT interval: presence in the shot, another owner's motion or a background effect
// never satisfies it. Operations form a closed registry; an unknown operation is refused (never downgraded). HOLD is the only static operation: it
// needs a reason and the owner must really be still. Pixel consequences of the same owners are checked after rendering (coverage_gate decisions).
import { err } from "../art_bridge/errors.mjs";
import { stateAtFrame } from "../art_bridge/temporal.mjs";
export const DIRECTION_OPERATIONS = Object.freeze({
  MOVE: "the owner rig's root travels >= min_px (default 4)",
  ARTICULATE: "a joint of the owner rig (or the named joint) rotates >= min_deg (default 3) relative to its parent",
  STATE_CHANGE: "the owner rig's named channel (or pose/view) changes drawing state (and reaches `state` when given)",
  CONTACT: "a contact whose source socket belongs to the owner rig (or equals the owner) is locked within tolerance on `target`",
  REACT: "the owner mechanism's reacting joint turns >= min_deg",
  CAMERA_MOVE: "the owner camera track changes x/y/zoom/rotation",
  EFFECT: "the owner effect is active, or the owner procedural action's evaluated state changes",
  DEFORM: "the owner deformation/morph changes weight",
  TRANSITION: "the owner transition overlaps the interval",
  HOLD: "approved static hold: the owner does not change (needs a reason)",
});
const round = (x) => Math.round(x * 1e4) / 1e4, deg = (m) => (Math.atan2(m[1], m[0]) * 180) / Math.PI, wrap = (d) => ((((d + 180) % 360) + 360) % 360) - 180;
const ok = (m) => ({ ok: true, measured: m }), no = (reason, m = null) => ({ ok: false, reason, measured: m });
const MEASURE = {
  MOVE: ({ rig, S, op }) => {
    const root = rig.joints.find((j) => j.parent_id === null)?.id, p = S.map((s) => [s.matrices[rig.id][root][4], s.matrices[rig.id][root][5]]);
    const far = Math.max(...p.map((q) => Math.hypot(q[0] - p[0][0], q[1] - p[0][1]))), min = op.min_px ?? 4;
    return far >= min ? ok({ travel_px: round(far) }) : no(`${rig.id} travels ${round(far)}px (< ${min}px): a static actor cannot satisfy MOVE`, { travel_px: round(far) });
  },
  ARTICULATE: ({ rig, S, op }) => {
    if (op.joint && !rig.joints.some((j) => j.id === op.joint)) return no(`rig ${rig.id} has no joint ${op.joint}`);
    let best = 0, which = null;
    for (const j of op.joint ? [op.joint] : rig.joints.filter((x) => x.parent_id !== null).map((x) => x.id)) {
      const par = rig.joints.find((x) => x.id === j).parent_id, a = S.map((s) => deg(s.matrices[rig.id][j]) - (par ? deg(s.matrices[rig.id][par]) : 0)), r = Math.max(...a.map((x) => Math.abs(wrap(x - a[0]))));
      if (r > best) { best = r; which = j; }
    }
    const min = op.min_deg ?? 3;
    return best >= min ? ok({ joint: which, rotation_deg: round(best) }) : no(`${op.joint ? `joint ${rig.id}.${op.joint}` : `every joint of ${rig.id}`} rotates at most ${round(best)} deg (< ${min} deg)`, { rotation_deg: round(best) });
  },
  STATE_CHANGE: ({ rig, S, op, d, C }) => {
    const ch = op.channel ?? "pose"; if (!["pose", "view"].includes(ch) && !(rig.state_channels || []).some((c) => c.id === ch)) return no(`rig ${rig.id} has no state channel ${ch}`);
    const at = (s) => { const a = s.artStates[rig.id]; return ch === "pose" ? a?.pose : ch === "view" ? a?.view : a?.channels?.[ch]; }, v = S.map(at), set = [...new Set(v)];
    if (op.state && !v.includes(op.state)) return no(`${rig.id}.${ch} never shows "${op.state}" in the interval (shows ${set.join(", ")})`, { states: set });
    // the change must happen inside the interval or exactly at its first frame
    const before = d.frames[0] > 0 ? at(stateAtFrame(C, d.frames[0] - 1)) : undefined, changes = set.length > 1 || (before !== undefined && before !== v[0]);
    return changes ? ok({ states: set, before: before ?? null }) : no(`${rig.id}.${ch} stays "${set[0]}" (nothing changes in the interval)`, { states: set });
  },
  CONTACT: ({ rig, S, op, C }) => {
    let n = 0; for (const s of S) if (s.contacts.some((c) => { const k = C.contacts.find((x) => x.action.id === c.action && x.c.source_socket === c.socket); return k && c.locked && (k.rig === rig?.id || k.c.source_socket === op.owner) && (!op.target || k.c.target_socket === op.target) && c.error_px <= c.allowed_error_px; })) n++;
    return n ? ok({ locked_frames: n }) : no(`no contact of ${op.owner}${op.target ? ` with ${op.target}` : ""} is locked within tolerance in the interval`);
  },
  REACT: ({ rig, S, op, plan }) => {
    const rx = (plan.reactions || []).filter((x) => x.rig === rig.id); if (!rx.length) return no(`no reaction drives ${rig.id}`);
    let best = 0; for (const x of rx) { const a = S.map((s) => s.reactions.find((y) => y.id === x.id)?.angle).filter((y) => y !== undefined); if (a.length) best = Math.max(best, Math.max(...a) - Math.min(...a)); }
    const min = op.min_deg ?? 3; return best >= min ? ok({ rotation_deg: round(best) }) : no(`mechanism ${rig.id} reacts by ${round(best)} deg (< ${min} deg)`);
  },
  CAMERA_MOVE: ({ S, op }) => {
    const c = S.filter((s) => s.camera.id === op.owner).map((s) => s.camera); if (!c.length) return no(`camera ${op.owner} is not active in the interval`);
    const r = ["x", "y", "zoom", "rot"].map((k) => [k, Math.max(...c.map((x) => x[k])) - Math.min(...c.map((x) => x[k]))]).filter(([, v]) => v > 1e-6);
    return r.length ? ok(Object.fromEntries(r.map(([k, v]) => [k, round(v)]))) : no(`camera ${op.owner} does not move`);
  },
  EFFECT: ({ S, op, d, doc, plan }) => {
    const e = (plan.effects || []).find((x) => x.id === op.owner), act = doc.actions.find((a) => a.id === op.owner && a.mode === "PROCEDURAL"); if (!e && !act) return no(`no effect or procedural action is named ${op.owner}`);
    if (e) return e.frames[0] < d.frames[1] && e.frames[1] > d.frames[0] ? ok({ frames: e.frames }) : no(`effect ${op.owner} is not active in the interval`);
    const sig = new Set(S.map((s) => JSON.stringify(s.procedural.filter((p) => String(p.pass_id).startsWith(op.owner)).map((p) => p.matrix.map(round)))));
    return sig.size > 1 ? ok({ distinct_states: sig.size }) : no(`procedural action ${op.owner} does not change`);
  },
  DEFORM: ({ S, op }) => { const r = new Set(S.map((s) => JSON.stringify(s.deforms.find((x) => x.id === op.owner)?.weight ?? s.morphs.find((x) => x.id === op.owner)?.weight ?? null))); return r.size > 1 ? ok({ distinct_weights: r.size }) : no(`deformation ${op.owner} does not change in the interval`); },
  TRANSITION: ({ op, d, doc }) => { const t = (doc.transitions || []).find((x) => (x.id ?? `${x.from_shot}->${x.to_shot}`) === op.owner); return t && (!t.frame_range || (t.frame_range[0] < d.frames[1] && t.frame_range[1] > d.frames[0])) ? ok({ mode: t.mode ?? null }) : no(`no transition ${op.owner} overlaps the interval`); },
  HOLD: ({ rig, S, op }) => {
    if (!op.reason) return no("an approved static hold needs a reason");
    const k = new Set(S.map((s) => JSON.stringify([Object.values(s.matrices[rig.id]).map((m) => m.map((x) => Math.round(x * 100))), s.artStates[rig.id]])));
    return k.size === 1 ? ok({ still_frames: S.length }) : no(`${rig.id} is not still: ${k.size} distinct states in an approved hold`);
  },
};
const RIG_OPS = new Set(["MOVE", "ARTICULATE", "STATE_CHANGE", "REACT", "HOLD"]);
/** decisionOwners(op, doc) → the rig id whose pixels the decision must change (null for camera/effect/transition owners) */
export const decisionRig = (op, doc) => doc.rigs.find((r) => r.id === op?.owner || r.identity_id === op?.owner) || doc.rigs.find((r) => r.sockets.some((s) => s.id === op?.owner)) || null;
/** verifyDirectionDecisions({decisions, compiled, doc, plan, total}) → {ok, results, failures} */
export function verifyDirectionDecisions({ decisions, compiled, doc, plan = {}, total = null }) {
  const results = [], failures = [], seen = new Set();
  const bad = (d, reason) => { failures.push(err("DIRECTION_DECISION_INERT", { record_id: d?.id ?? "(no id)", frame_range: Array.isArray(d?.frames) ? d.frames : undefined, reason: `decision ${d?.id ?? "?"}: ${reason}` })); results.push({ id: d?.id ?? null, ok: false, reason }); };
  for (const d of decisions) {
    const op = d?.consuming_operation;
    if (!d?.id) { bad(d, "no stable id"); continue; }
    if (seen.has(d.id)) { bad(d, "duplicate decision id"); continue; } seen.add(d.id);
    if (!op?.operation || !op.owner) { bad(d, "names no consuming operation with an owner"); continue; }
    if (!DIRECTION_OPERATIONS[op.operation]) { bad(d, `operation ${op.operation} is not supported (supported: ${Object.keys(DIRECTION_OPERATIONS).join(", ")})`); continue; }
    if (!(Array.isArray(d.frames) && Number.isInteger(d.frames[0]) && Number.isInteger(d.frames[1]) && d.frames[0] >= 0 && d.frames[0] < d.frames[1] && d.frames[1] <= compiled.totalFrames)) { bad(d, `frames ${JSON.stringify(d.frames)} are not an interval inside the film`); continue; }
    if (total !== null && d.frames[0] >= total) { results.push({ id: d.id, ok: null, reason: "outside the bounded diagnostic window" }); continue; }
    const rig = decisionRig(op, doc); if (RIG_OPS.has(op.operation) && !(rig && (rig.id === op.owner || rig.identity_id === op.owner))) { bad(d, `owner ${op.owner} is not a rig of this film`); continue; }
    const S = []; let boom = null;
    for (let f = d.frames[0]; f < (total === null ? d.frames[1] : Math.min(total, d.frames[1])); f++) { try { S.push(stateAtFrame(compiled, f)); } catch (e) { boom = `frame ${f} cannot be evaluated (${e.code || "EXCEPTION"}: ${e.human_readable_reason || e.message})`; break; } }
    if (boom) { bad(d, boom); continue; }
    const m = MEASURE[op.operation]({ rig, S, op, d, doc, plan, C: compiled });
    if (!m.ok) { bad(d, `${op.operation} by "${op.owner}" in [${d.frames}) is not performed: ${m.reason}`); continue; }
    results.push({ id: d.id, ok: true, operation: op.operation, owner: op.owner, frames: d.frames, measured: m.measured });
  }
  return { ok: failures.length === 0, results, failures };
}
