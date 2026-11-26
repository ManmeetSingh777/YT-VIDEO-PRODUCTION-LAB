// P08 A01 — film-level action/frame obligation ledger. One row per DIRECTED source action (the accepted packet's actions, else the manifest's), joined
// to the producers the compiled plan actually holds (composition primitives bound by `action`, performance command records by `action_id`), the
// per-frame execution measured by the independent QA (composition_qa / performance_qa results on every frame of the producer), and — when rendered
// isolated captures are supplied — the owner's own rendered pixels (coverage_gate.ownerAttributionGate). Nothing here trusts a report label: a row
// passes only when every required frame of every directed owner is (a) written by a producer bound to THIS action, (b) executed with frames_checked
// equal to the interval, and (c) visibly changed in its own isolated pixels. A camera writer never counts as actor proof.
//
// Typed failures (OBLIGATION_*): NOT_COMPILED (source action absent from the compiled film), NO_PRODUCER, OWNER_UNDRIVEN (a directed owner nobody
// writes), PARTIAL (uncovered frames outside a directed hold), WRONG_OWNER (a producer of this action writes an owner the action does not direct),
// CHANNEL_OVERWRITTEN (two absolute writers of one owner/property inside the action), EXECUTION_FAILED / NOT_EVALUATED (QA result missing, failing
// or with fewer checked frames than the interval), EFFECT_NOT_RENDERED (rendered attribution failed, or no rendered sample of the owner),
// UNBOUND_PRODUCER / UNKNOWN_ACTION (a producer bound to no directed action, or to an id that is not one).
import { writeSet } from "../art_bridge/composition.mjs";
export const LEDGER_VERSION = "1.0.0";
const overl = (a, b) => a[0] < b[1] && b[0] < a[1], rigOf = (owner) => String(owner).split(/[.:]/)[0];
const MOVING = new Set(["JOINT_ROTATE", "ROOT_MOVE", "OSCILLATE", "AIM", "STATE_SWAP", "REACH", "WALK", "CARRY", "LOAD_CONTAINER", "INSERT_TOKEN", "look_at", "turn_head", "reach", "grip", "release", "speak", "blink", "change_expression", "point", "react", "walk"]);
const HOLD = /\bhold|settle[sd]?\b|\bremain|\bstill\b|\bpause/i;
/** merge [a,b) intervals */
const union = (ivs) => { const s = ivs.filter((x) => x[1] > x[0]).sort((a, b) => a[0] - b[0]), out = []; for (const iv of s) { const l = out.at(-1); if (l && iv[0] <= l[1]) l[1] = Math.max(l[1], iv[1]); else out.push([...iv]); } return out; };
const minus = (iv, cov) => { const out = []; let a = iv[0]; for (const [c0, c1] of union(cov)) { if (c1 <= a) continue; if (c0 >= iv[1]) break; if (c0 > a) out.push([a, Math.min(c0, iv[1])]); a = Math.max(a, c1); } if (a < iv[1]) out.push([a, iv[1]]); return out; };
const len = (ivs) => ivs.reduce((t, [a, b]) => t + (b - a), 0);

/**
 * obligationLedger({C, sources?, holds?, composition?, performance?, attribution?, scope?})
 *  C            compiled film (temporal.compileMotionTracks): C.doc.actions, C.composition, C.performance
 *  sources      [{id, frames:[a,b), owners:[rig ids]}] the directed actions (default: C.doc.actions)
 *  holds        {actionId: [[a,b), …]} purposeful directed holds (default: the action phases whose name/state reads as a hold)
 *  composition  verifyComposition(C) result     performance  verifyPerformance(C) result
 *  attribution  ownerAttributionGate(...) result (rendered isolated captures) — null means rendered effects were NOT evaluated (ledger not ok)
 *  scope        [a,b) the evaluated interval (default the whole film)
 * → {version, ok, rows[], failures[], coverage{required_frames, covered_frames, uncovered:[[a,b)]}, rendered_evaluated}
 */
export function obligationLedger({ C, sources = null, holds = null, composition = null, performance = null, attribution = null, scope = null }) {
  const doc = C.doc, S = scope || [0, C.totalFrames], failures = [], rows = [], byId = new Map(doc.actions.map((a) => [a.id, a]));
  const fail = (code, action, reason, o = {}) => failures.push({ code: `OBLIGATION_${code}`, record_id: action, reason, ...o });
  const src = (sources || doc.actions.map((a) => ({ id: a.id, frames: a.frame_range, owners: a.actors.map((x) => x.rig_id) }))).filter((s) => overl(s.frames, S));
  const prims = C.composition?.primitives || [], cmds = C.performance?.commands || [], ws = writeSet(C);
  const compRes = new Map((composition?.results || []).map((r) => [r.primitive, r])), perfRes = new Map(); for (const r of performance?.results || []) if (r.command) (perfRes.get(r.command) || perfRes.set(r.command, []).get(r.command)).push(r);
  // producers of each action: [{id, kind, owner_rig, frames, qa:[results]}]
  const P = new Map(), add = (aid, p) => (P.get(aid) || P.set(aid, []).get(aid)).push(p), known = new Set(src.map((s) => s.id).concat(doc.actions.map((a) => a.id)));
  for (const r of prims) { if (!r.action && r.kind === "CAMERA_MOVE") continue; /* a shot camera move directed by the shot, not an action: never actor proof */ if (!r.action) { fail("UNBOUND_PRODUCER", r.id, `composition primitive ${r.id} (${r.kind} on ${r.owner}) is bound to no directed action`); continue; } if (!known.has(r.action)) { fail("UNKNOWN_ACTION", r.id, `primitive ${r.id} names action ${r.action}, which is not directed`); continue; }
    add(r.action, { id: r.id, kind: r.kind, family: "composition", owner_rig: r.kind === "CAMERA_MOVE" ? `camera:${r.owner}` : rigOf(r.owner), owner: r.owner, frames: r.frames, qa: compRes.has(r.id) ? [compRes.get(r.id)] : [] }); }
  for (const r of cmds) { if (!known.has(r.action_id)) { fail("UNKNOWN_ACTION", r.id, `performance command ${r.id} names action ${r.action_id}, which is not directed`); continue; }
    add(r.action_id, { id: r.id, kind: r.verb, family: "performance", owner_rig: r.rig, owner: r.rig, frames: r.frames, qa: perfRes.get(r.id) || [] }); }
  const phaseHolds = (a) => (a?.phases || a?.semantic_phases || []).filter((p) => HOLD.test(`${p.name ?? ""} ${p.state ?? ""}`)).map((p) => p.frames).filter(Array.isArray);
  const attrFail = new Map(); for (const f of attribution?.failures || []) { const aid = String(f.record_id).split(":")[0]; (attrFail.get(aid) || attrFail.set(aid, []).get(aid)).push(f); }
  const attrUnits = new Map(); for (const u of attribution?.units || []) (attrUnits.get(u.action) || attrUnits.set(u.action, []).get(u.action)).push(u);
  let required = [], covered = [];
  for (const s of src) {
    const iv = [Math.max(s.frames[0], S[0]), Math.min(s.frames[1], S[1])], A = byId.get(s.id), prods = (P.get(s.id) || []).filter((p) => overl(p.frames, iv)) /* only producers active inside the evaluated interval */, row = { action: s.id, frames: iv, owners: s.owners, producers: prods.map((p) => ({ id: p.id, family: p.family, kind: p.kind, owner: p.owner, frames: p.frames })), per_owner: [], status: "OK" };
    const before = failures.length, F = (code, reason, o) => fail(code, s.id, reason, o);
    const holdIv = union(holds?.[s.id] || phaseHolds(A)).map(([a, b]) => [Math.max(a, iv[0]), Math.min(b, iv[1])]).filter(([a, b]) => b > a), allHeld = !minus(iv, holdIv).length;
    if (!A) { F("NOT_COMPILED", `directed action ${s.id} is not in the compiled film (filtered, renamed or dropped)`); }
    else if (!prods.length && !allHeld) F("NO_PRODUCER", `directed action ${s.id} [${iv}) has no compiled producer bound to it (a moving camera or another action does not count)`);
    for (const p of prods) if (!p.owner_rig.startsWith("camera:") && !s.owners.includes(p.owner_rig) && !(A?.targets || []).some((t) => (t.rig_id ?? t) === p.owner_rig)) F("WRONG_OWNER", `${p.id} (${p.kind}) of ${s.id} writes ${p.owner}, which ${s.id} does not direct (owners ${s.owners.join(", ")})`, { producer: p.id });
    for (const o of s.owners) {
      const mine = prods.filter((p) => p.owner_rig === o), cov = union(mine.map((p) => [Math.max(p.frames[0], iv[0]), Math.min(p.frames[1], iv[1])])), gaps = minus(iv, [...cov, ...holdIv]);
      row.per_owner.push({ owner: o, producers: mine.map((p) => p.id), covered: cov, holds: holdIv, uncovered: gaps });
      required.push(iv); covered.push(...cov, ...holdIv);
      if (A && !allHeld && !mine.length && !String(o).startsWith("camera")) F("OWNER_UNDRIVEN", `${o} is directed in ${s.id} [${iv}) but no producer of ${s.id} writes it`, { owner: o });
      else if (mine.length && gaps.length) F("PARTIAL", `${o} in ${s.id}: ${len(gaps)} directed frame(s) have no producer and are not a directed hold: ${gaps.map((g) => `[${g}]`).join(" ")}`, { owner: o, frame_ranges: gaps });
    }
    for (const c of ws.conflicts) if (s.owners.includes(rigOf(c.owner)) && overl(c.interval, iv)) F("CHANNEL_OVERWRITTEN", `${c.owner}.${c.property} has two absolute writers ${c.producers.join(" + ")} in [${c.interval}) inside ${s.id}`, { frame_ranges: [c.interval] });
    for (const p of prods) { const need = Math.max(0, Math.min(p.frames[1], iv[1]) - Math.max(p.frames[0], iv[0]));
      if (!p.qa.length) { F("NOT_EVALUATED", `${p.id} (${p.kind}) of ${s.id} has no per-frame QA result: its owner effect was never measured`, { producer: p.id }); continue; }
      for (const q of p.qa) { if (!q.ok) F("EXECUTION_FAILED", `${p.id} (${q.kind ?? p.kind}): ${q.reason ?? "failed"}`, { producer: p.id }); else if (p.family === "composition" && q.frames_checked < need) F("NOT_EVALUATED", `${p.id}: ${q.frames_checked} of ${need} frames checked`, { producer: p.id }); else if (!q.frames_checked) F("NOT_EVALUATED", `${p.id}: zero frames checked`, { producer: p.id }); } }
    if (attribution) { for (const o of s.owners) { const movers = prods.filter((p) => p.owner_rig === o && MOVING.has(p.kind)), u = (attrUnits.get(s.id) || []).find((x) => x.unit === o); if (movers.length && u && u.distinct_pixels <= 1) F("EFFECT_NOT_RENDERED", `${o} in ${s.id}: ${movers.map((p) => p.id).join(", ")} direct motion but the owner's isolated pixels never change over ${u.frames} (no-op producer or replaced owner state)`, { owner: o, frame_ranges: [u.frames] }); }
      for (const f of attrFail.get(s.id) || []) F("EFFECT_NOT_RENDERED", `${f.failed_invariant ?? f.code}: ${f.reason}`, { frame_ranges: f.frame_ranges }); const actors = s.owners.filter((o) => !String(o).startsWith("camera")); for (const o of actors) if (!(attrUnits.get(s.id) || []).some((u) => u.unit === o || u.unit.startsWith(`${o}:`))) if (!(attrFail.get(s.id) || []).length) F("EFFECT_NOT_RENDERED", `${o} in ${s.id}: no rendered isolated sample of the owner (its effect was never seen in pixels)`, { owner: o }); }
    row.status = failures.length > before ? "FAIL" : allHeld && !prods.length ? "DIRECTED_HOLD" : attribution ? "OK" : "OK_RENDER_NOT_EVALUATED"; row.failures = failures.slice(before).map((x) => x.code); rows.push(row); }
  const req = union(required), cov = union(covered), unc = req.flatMap((iv) => minus(iv, cov));
  return { version: LEDGER_VERSION, scope: S, ok: failures.length === 0 && !!attribution, rendered_evaluated: !!attribution, rows, failures, coverage: { required_frames: len(req), covered_frames: len(req) - len(unc), uncovered: unc }, write_set_conflicts: ws.conflicts.length };
}
