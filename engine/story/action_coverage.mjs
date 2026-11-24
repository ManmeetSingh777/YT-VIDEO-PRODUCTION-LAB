// Semantic action-coverage compiler (directive G2; F013, F014, F065, F072). The AUTHORITY is a typed list of semantic actions
// (verb + actor + object + recipient + origin + destination) from the approved direction. Prose is scanned against the same controlled
// ontology only to catch verbs that were never typed. Each typed verb instantiates its physically applicable sub-operations, each of which
// must be backed by executable events (contacts/poses/actions) with frame intervals, sockets and art; possession is conserved; one hand
// cannot hold two unrelated moving props; every executable contact must be claimed by some semantic action (no orphan motion).
import { err } from "../art_bridge/errors.mjs";

// controlled action ontology: verb class → ordered sub-operations, each with the executable evidence it needs
export const ONTOLOGY = {
  SUPPORT: { lex: ["plant", "plants", "stand", "stands", "lean", "leans"], subops: [["SUPPORT", "PLANT"]] },
  REACH: { lex: ["reach", "reaches", "reaching"], subops: [["APPROACH/ATTEND", "POSE_OR_GAZE"], ["REACH", "POSE_OR_CONTACT_APPROACH"]] },
  GRIP: { lex: ["grip", "grips", "grab", "grabs", "hold", "holds"], subops: [["REACH", "POSE_OR_CONTACT_APPROACH"], ["CONTACT", "GRIP"], ["GRIP", "GRIP"], ["RELEASE", "CONTACT_END"]] },
  OPEN_APERTURE: { lex: ["open", "opens", "swing open", "swings open", "swings the door open"], subops: [["GRIP", "GRIP"], ["MOVE/TRANSFORM", "TARGET_STATE_CHANGE"], ["RELEASE", "CONTACT_END"]], effect: { object_state: "OPEN" } },
  LOAD_CONTAINER: { lex: ["load", "loads", "loading", "fill", "fills"], requires: ["carried_object", "container_open"], subops: [["SUPPORT/TRANSFER", "CARRY_OR_SUPPLY"], ["GRIP", "GRIP_ON_CARRIED_OBJECT"], ["MOVE/TRANSFORM", "OBJECT_THROUGH_APERTURE"], ["RELEASE", "CONTACT_END"], ["SETTLE", "CONTAINED_STATE"], ["RETRACT", "POSE_OR_CONTACT_APPROACH"]], effect: { possession: "CONTAINER" } },
  PINCH: { lex: ["pinch", "pinches"], subops: [["CONTACT", "PINCH_OR_FOLLOW"]] },
  INSERT_TOKEN: { lex: ["insert", "inserts", "drop", "drops"], subops: [["GRIP", "PINCH_OR_FOLLOW"], ["MOVE/TRANSFORM", "OBJECT_THROUGH_APERTURE"], ["RELEASE", "CONTACT_END"]], effect: { possession: "CONTAINER" } },
  MECHANISM_START: { lex: ["start", "starts", "spin", "spins", "run", "runs"], subops: [["MOVE/TRANSFORM", "MECHANISM_TRACK"]] },
  ATTEND: { lex: ["look", "looks", "watch", "watches", "turn to", "turns to"], subops: [["APPROACH/ATTEND", "POSE_OR_GAZE"]] },
  CARRY: { lex: ["carry", "carrying", "carries"], subops: [["SUPPORT/TRANSFER", "CARRY_OR_SUPPLY"]], effect: { possession: "ACTOR" } },
};
const LEX = Object.entries(ONTOLOGY).flatMap(([cls, o]) => o.lex.map((w) => [w, cls])).sort((a, b) => b[0].length - a[0].length);
/** registerVerb(name, def) — add an action class through the SAME typed registry (sub-operations must name existing evidence needs) */
export function registerVerb(name, def) { const needs = new Set(Object.values(ONTOLOGY).flatMap((o) => o.subops.map(([, n]) => n)).concat(["RELEASE_EVENT", "PHYSICAL_CONSEQUENCE"])); if (ONTOLOGY[name]) throw new Error(`verb ${name} already registered`); if (!Array.isArray(def?.subops) || !def.subops.length) throw err("UNSUPPORTED_SEMANTIC_ACTION", { record_id: name, reason: "a registered verb needs ordered sub-operations" }); for (const [sub, need] of def.subops) if (!needs.has(need)) throw err("UNSUPPORTED_SEMANTIC_ACTION", { record_id: name, reason: `sub-operation ${sub} needs unknown evidence ${need} (${[...needs].join(", ")})` }); ONTOLOGY[name] = { lex: def.lex || [], subops: def.subops, ...(def.effect ? { effect: def.effect } : {}), ...(def.requires ? { requires: def.requires } : {}) }; return ONTOLOGY[name]; }
/** scanProse(text) → verb classes the prose mentions (a CHECK for missing typed entries, not the authority) */
export function scanProse(text) { const s = ` ${String(text).toLowerCase()} `, found = []; for (const [w, cls] of LEX) if (s.includes(` ${w} `) || s.includes(` ${w},`)) found.push({ word: w, class: cls }); return found.filter((x, i, a) => a.findIndex((y) => y.class === x.class) === i); }

/** compileActionCoverage({actions, events, prose, initial_possession}) → {coverage, errors, orphans, possession_timeline}
 *  actions: typed semantic actions [{id, verb_class, actor, object, recipient?, frames:[s,e], sockets:{grip?,pinch?,sole?}, carried_object?}]
 *  events: executable events [{kind: CONTACT|POSE|VIEW|ACTION|STATE, frames|frame, source?, target?, contact_type?, state?, object?}] */
/** typed visual consequence each verb must make measurable in the rendered film (rendered QA evaluates them; see coverage semanticConsequences) */
export const CONSEQUENCES = Object.freeze({ OPEN_APERTURE: { measure: "object_state_reached", target: "object_state" }, GRIP: { measure: "hand_closed_and_in_contact" }, REACH: { measure: "end_effector_approaches" }, INSERT_TOKEN: { measure: "object_contained" }, LOAD_CONTAINER: { measure: "object_contained" }, CARRY: { measure: "possession_with_actor" }, MECHANISM_START: { measure: "mechanism_moves" }, PINCH: { measure: "hand_closed_and_in_contact" }, ATTEND: { measure: "gaze_or_head_turns" }, SUPPORT: { measure: "foot_planted" } });
export function semanticConsequences(actions) { return actions.filter((a) => CONSEQUENCES[a.verb_class]).map((a) => ({ action: a.id, verb_class: a.verb_class, frames: a.frames, object: a.object ?? null, target_state: a.target_state ?? ONTOLOGY[a.verb_class]?.effect?.object_state ?? null, ...CONSEQUENCES[a.verb_class] })); }
export function compileActionCoverage({ actions = [], events = [], prose = [], initial_possession = {}, record_id = null }) {
  const errors = [], coverage = [], claimed = new Set(), hold = new Map(Object.entries(initial_possession)), timeline = [];
  const typed = new Set(actions.map((a) => a.verb_class));
  for (const p of prose) for (const v of scanProse(p.text)) if (!typed.has(v.class)) errors.push({ code: "UNCOMPILED_SEMANTIC_ACTION", record_id: p.id, reason: `prose verb "${v.word}" (${v.class}) has no typed semantic action`, required_art_or_operation: ONTOLOGY[v.class].subops.map(([s, e]) => `${s} via ${e}`) });
  const ev = events.map((e, i) => ({ ...e, i, s: e.frames ? e.frames[0] : e.frame, e: e.frames ? e.frames[1] : e.frame + 1 }));
  const overlap = (a, s, e) => a.s < e && a.e > s;
  for (const a of actions) {
    const o = ONTOLOGY[a.verb_class]; if (!o) { errors.push({ code: "UNSUPPORTED_SEMANTIC_ACTION", record_id: a.id, reason: `verb class ${a.verb_class} is not in the supported-operation registry (${Object.keys(ONTOLOGY).join(", ")}): register it with an executable consumer; it is never silently ignored` }); continue; }
    const [s, e] = a.frames, subs = []; a.__events = ev;
    for (const req of o.requires || []) if (req === "carried_object" && !(a.carried_object && hold.get(a.carried_object) === a.actor)) errors.push({ code: "UNCOMPILED_SEMANTIC_ACTION", record_id: a.id, reason: `${a.verb_class} needs ${a.actor} to be holding ${a.carried_object || "(no carried object named)"} at frame ${s}`, required_art_or_operation: ["carried prop art + carry state", "possession at action start"] });
    for (const [sub, need] of o.subops) {
      const match = ev.filter((x) => overlap(x, s, e) && satisfies(x, need, a));
      if (!match.length) { subs.push({ sub, need, status: "MISSING" }); errors.push({ code: need === "OBJECT_THROUGH_APERTURE" || need === "GRIP_ON_CARRIED_OBJECT" || need === "CONTAINED_STATE" ? "MISSING_ART_ASSET" : "UNCOMPILED_SEMANTIC_ACTION", record_id: a.id, frame_ranges: [[s, e]], reason: `${a.verb_class}.${sub} has no executable ${need} event for ${a.object || a.actor} in [${s},${e})`, dependency_ids: [a.object, a.carried_object].filter(Boolean), required_art_or_operation: [neededArt(need, a)] }); }
      else { for (const m of match) claimed.add(m.i); subs.push({ sub, need, status: "COVERED", events: match.map((m) => ({ kind: m.kind, frames: [m.s, m.e], source: m.source, target: m.target })) }); }
    }
    if (o.effect?.possession) { const obj = a.verb_class === "INSERT_TOKEN" ? a.object : a.carried_object; if (obj) { hold.set(obj, o.effect.possession === "ACTOR" ? a.actor : a.recipient || a.object); timeline.push({ frame: e, object: obj, holder: hold.get(obj), by: a.id }); } }
    delete a.__events; coverage.push({ action: a.id, verb_class: a.verb_class, frames: a.frames, sub_operations: subs, complete: subs.every((x) => x.status === "COVERED") });
  }
  // one socket cannot grip two different targets at overlapping frames
  const grips = ev.filter((x) => x.kind === "CONTACT" && ["GRIP", "FOLLOW", "PINCH"].includes(x.contact_type));
  for (let i = 0; i < grips.length; i++) for (let j = i + 1; j < grips.length; j++) { const A = grips[i], B = grips[j]; if (A.source === B.source && A.target !== B.target && overlap(A, B.s, B.e)) errors.push({ code: "CONTACT_CONFLICT", record_id: A.source, frame_ranges: [[Math.max(A.s, B.s), Math.min(A.e, B.e)]], reason: `${A.source} holds ${A.target} and ${B.target} at the same time` }); }
  // every executable contact is motivated by a semantic action
  const orphans = ev.filter((x) => x.kind === "CONTACT" && !claimed.has(x.i)).map((x) => ({ code: "ORPHAN_ACTION", record_id: `${x.source}->${x.target}`, frame_ranges: [[x.s, x.e]], reason: "executable contact not claimed by any semantic action" }));
  // possession: an object may change holder only through an action; a later reference to it elsewhere is a teleport
  for (const x of ev.filter((y) => y.object && y.holder)) { const h = timeline.filter((t) => t.object === x.object && t.frame <= x.s).at(-1)?.holder ?? initial_possession[x.object]; if (h !== undefined && h !== x.holder) errors.push({ code: "POSSESSION_TELEPORT", record_id: x.object, frame_ranges: [[x.s, x.e]], reason: `${x.object} appears held by ${x.holder} but is held by ${h}` }); }
  return { coverage, errors: [...errors, ...orphans], orphans, possession_timeline: timeline, complete: !errors.length && !orphans.length };
}
const normState = (s) => String(s ?? "").toLowerCase();
function satisfies(x, need, a) {
  const sock = a.sockets || {};
  switch (need) {
    case "PLANT": return x.kind === "CONTACT" && x.contact_type === "PLANT" && (!sock.sole || x.source === sock.sole);
    case "GRIP": return x.kind === "CONTACT" && x.contact_type === "GRIP" && (!sock.grip || x.source === sock.grip) && (!a.object || x.target === a.object);
    case "GRIP_ON_CARRIED_OBJECT": return x.kind === "CONTACT" && x.contact_type === "GRIP" && !!a.carried_object && x.target === a.carried_object;
    case "PINCH_OR_FOLLOW": return x.kind === "CONTACT" && ["FOLLOW", "PINCH"].includes(x.contact_type) && (!a.object || x.target === a.object);
    // P04 §2.3: the contact must actually END inside the action (an interval covering the whole action proves holding, not release) AND a release
    // of the hand must follow it (a hand/pose/state change by the actor, or a typed RELEASE event, at or after the contact end)
    case "CONTACT_END": return x.kind === "CONTACT" && (!a.object || x.target === a.object || x.target === a.carried_object) && x.e > a.frames[0] && x.e < a.frames[1] && a.__events.some((q) => q !== x && q.s >= x.e - 1 && q.s < a.frames[1] && ((q.kind === "RELEASE") || (["POSE", "STATE"].includes(q.kind) && (a.actor_rig ? q.rig === a.actor_rig : true)))) && !a.__events.some((q) => q !== x && q.kind === "CONTACT" && ["GRIP", "PINCH", "FOLLOW"].includes(q.contact_type) && q.source === x.source && q.target === x.target && q.s <= x.e && q.e > x.e);
    case "POSE_OR_GAZE": return ["POSE", "VIEW", "GAZE"].includes(x.kind) && (!a.actor_rig || x.rig === a.actor_rig);
    case "POSE_OR_CONTACT_APPROACH": return x.kind === "POSE" || (x.kind === "CONTACT" && x.contact_type !== "PLANT" && (!a.object || x.target === a.object || x.target === a.carried_object));
    // P04 §2.3: the CORRECT target must reach the REQUESTED resulting state with a visible change (an unrelated STATE event, or a state that was
    // already there, never satisfies it); the requested state comes from the typed action (or the verb's effect), never from the event itself
    case "TARGET_STATE_CHANGE": { const want = a.target_state ?? ONTOLOGY[a.verb_class]?.effect?.object_state ?? null; return x.kind === "STATE" && (a.object_rig ? x.rig === a.object_rig : !!a.object && (x.object === a.object || x.rig === a.object)) && !!want && normState(x.state).includes(normState(want)) && x.from_state !== undefined && x.from_state !== null && normState(x.from_state) !== normState(x.state); }
    case "OBJECT_THROUGH_APERTURE": return x.kind === "TRAJECTORY" && x.object === (a.carried_object || a.object) && !!x.through;
    case "CONTAINED_STATE": return x.kind === "STATE" && x.object === a.carried_object && x.state === "CONTAINED";
    case "CARRY_OR_SUPPLY": return x.kind === "CONTACT" && x.target === a.carried_object;
    case "MECHANISM_TRACK": return x.kind === "ACTION" && /PROCEDURAL|MECHANISM|SPIN/i.test(x.mode || "") && (!a.object || (x.object || "").includes(a.object));
    default: return false;
  }
}
function neededArt(need, a) { return { GRIP_ON_CARRIED_OBJECT: `grip contact + hand art on ${a.carried_object}`, OBJECT_THROUGH_APERTURE: `${a.carried_object || a.object} trajectory through the aperture with near/far occlusion art (rim occluder)`, CONTAINED_STATE: `${a.carried_object} contained-state art inside ${a.recipient || a.object}`, CARRY_OR_SUPPLY: `${a.carried_object} prop art + carry contact`, TARGET_STATE_CHANGE: `${a.object} state change track`, MECHANISM_TRACK: `${a.object} mechanism track` }[need] || `${need} event`; }

/** eventsFromShotScore(shot) — adapter from the film's SHOT_SCORE format to typed executable events */
// The owning rig of a pose/state event is the event's explicit rig, else the UNIQUE rig whose pose_states declare that state id (from the film
// manifest); a non-character owner makes it an object STATE. No scene or rig name is hard-coded (P02 repair: the adapter previously mapped
// "door_*/drum_*" to a literal "washer_rig", a scene-specific patch inside a reusable producer).
export function eventsFromShotScore(shot, doc = null) {
  const owner = (state, explicit) => { if (explicit) return doc?.rigs?.find((r) => r.id === explicit) || { id: explicit }; const rs = (doc?.rigs || []).filter((r) => (r.pose_states || []).some((p) => p.id === state)); return rs.length === 1 ? rs[0] : null; };
  const kindOf = (r) => { const idk = r && doc?.identities?.find((i) => i.id === r.identity_id)?.kind; return idk && idk !== "CHARACTER" ? "STATE" : "POSE"; };
  const lastState = {};
  return (shot.events || []).map((e) => e.contact ? { kind: "CONTACT", contact_type: e.contact, frames: e.frames, source: e.source, target: e.target } : e.pose ? (() => { const r = owner(e.pose, e.rig); const from = r ? lastState[r.id] ?? (r.pose_states || [])[0]?.id ?? null : null; if (r) lastState[r.id] = e.pose; return { kind: kindOf(r), frame: e.frame, state: e.pose, rig: r?.id ?? null, from_state: from }; })()
    : e.gaze ? { kind: "GAZE", frames: e.frames, rig: e.gaze, state: "gaze" } : e.view ? { kind: "VIEW", frame: e.frame, state: e.view } : e.action ? { kind: "ACTION", frames: e.frames, mode: e.mode, object: e.action, goal: e.goal } : { kind: "OTHER", ...e });
}
