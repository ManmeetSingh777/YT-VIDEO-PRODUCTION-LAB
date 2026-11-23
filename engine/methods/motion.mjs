// F15 (motion ownership, simultaneous tracks, camera) + F31 (owner-specific key states, contact constraints, proof sampling).
// F15: every animated region has EXACTLY ONE primary owner (CAMERA, WORLD, SUBJECT_RIGID, SUBJECT_PART, REDRAWN_STATE,
// MATERIAL_LIGHT_STATE, TRANSITION_MASK, EFFECT, SCREEN_UI); a camera pan must not morph architecture; simultaneous tracks, purposeful stillness.
// F31: scene DAG narrative_beat → actions; contacts are HARD constraints (grasp adheres to prop; planted foot; particle path emitter→receiver);
// interpolate only where topology/view stays valid; trails derive from the real pose path; sample first/contact/peak/end + strips at swaps.
// Producing operation: ownership table → track set; event DAG → topologically ordered schedule; contact solver evaluates the constrained
// member FROM its constraint (hand = handle(t)) so drift is structurally zero; proof-frame sampler from event/occlusion boundaries.
import { registerProducer } from "./emit.mjs";
import { need, lerp2, len, sub } from "./core.mjs";

export const OWNERS = ["CAMERA", "WORLD", "SUBJECT_RIGID", "SUBJECT_PART", "REDRAWN_STATE", "MATERIAL_LIGHT_STATE", "TRANSITION_MASK", "EFFECT", "SCREEN_UI"];
const ALLOWED = { CAMERA: ["transform"], WORLD: ["transform", "state_swap"], SUBJECT_RIGID: ["transform"], SUBJECT_PART: ["transform", "deform"], REDRAWN_STATE: ["state_swap", "deform"], MATERIAL_LIGHT_STATE: ["recolor"], TRANSITION_MASK: ["mask"], EFFECT: ["opacity", "deform", "transform"], SCREEN_UI: ["transform", "opacity"] };

/** assignOwnership(regions): [{id, primary, secondary?:[], channels:[transform|deform|state_swap|recolor|mask|opacity]}] */
function assignOwnership__impl(regions) {
  need("F15 ownership", { regions }, { regions: "arr" });
  const tracks = {}, seen = new Set();
  for (const r of regions) {
    need(`F15 region ${r.id}`, r, { id: "str", primary: OWNERS, channels: "arr" });
    if (seen.has(r.id)) throw new Error(`F15: region ${r.id} has more than one primary owner`); seen.add(r.id);
    for (const c of r.channels) if (!ALLOWED[r.primary].includes(c)) throw new Error(`F15: owner ${r.primary} cannot drive "${c}" on ${r.id} (e.g. a camera pan must not morph architecture)`);
    (tracks[r.primary] ||= []).push(r.id);
  }
  return { method: "F15", tracks, simultaneous: Object.keys(tracks).length };
}

/** scheduleEvents(events): [{id, after?:[ids], offset, duration, owner, state_from, state_to, beat}] → ordered schedule with absolute times */
function scheduleEvents__impl(events) {
  need("F31 events", { events }, { events: "arr" });
  const by = Object.fromEntries(events.map((e) => [e.id, e])), T = {}, order = [];
  for (const e of events) need(`F31 event ${e.id}`, e, { id: "str", offset: "num", duration: "num+", owner: OWNERS, beat: "str", state_to: "str" });
  const visit = (id, stack = []) => {
    if (T[id] !== undefined) return T[id]; if (stack.includes(id)) throw new Error(`F31: cyclic event dependency ${[...stack, id].join(" → ")}`);
    const e = by[id]; if (!e) throw new Error(`F31: unknown event ${id}`);
    const start = Math.max(0, ...(e.after || []).map((a) => visit(a, [...stack, id]) + by[a].duration)) + e.offset;
    T[id] = start; order.push(id); return start;
  };
  events.forEach((e) => visit(e.id));
  return { method: "F31", schedule: order.map((id) => ({ id, start: +T[id].toFixed(3), end: +(T[id] + by[id].duration).toFixed(3), owner: by[id].owner, beat: by[id].beat, state_to: by[id].state_to })).sort((a, b) => a.start - b.start) };
}

/** keyed track evaluation with per-owner easing (organic / mechanical / camera do not share one canned ease) */
const EASE = { organic: (t) => t * t * (3 - 2 * t), mechanical: (t) => (t < 0.15 ? 0 : t > 0.85 ? 1 : (t - 0.15) / 0.7), camera: (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2), linear: (t) => t };
export function evalTrack(keys, t, ease = "organic") {
  if (!EASE[ease]) throw new Error(`F31: unknown ease class ${ease}`);
  if (t <= keys[0].t) return keys[0].v; if (t >= keys.at(-1).t) return keys.at(-1).v;
  const i = keys.findIndex((k) => k.t > t), a = keys[i - 1], b = keys[i], u = EASE[ease]((t - a.t) / (b.t - a.t));
  return Array.isArray(a.v) ? lerp2(a.v, b.v, u) : a.v + (b.v - a.v) * u;
}

/** solveContacts: constrained members are EVALUATED FROM their constraint while a contact is active (hard constraint, no drift) */
function solveContacts__impl({ tracks, contacts, times, reach }) {
  need("F31 contacts", { contacts, times }, { contacts: "arr", times: "arr" });
  const out = times.map((t) => {
    const pos = Object.fromEntries(Object.entries(tracks).map(([k, tr]) => [k, evalTrack(tr.keys, t, tr.ease)]));
    const active = [];
    for (const c of contacts) {
      need("F31 contact", c, { member: "str", target: "str", from: "num", to: "num", kind: ["grasp", "planted_foot", "pivot", "emitter_receiver", "label_anchor"] });
      if (t >= c.from && t <= c.to) { pos[c.member] = pos[c.target]; active.push(c.kind); }
    }
    let reachOk = true; if (reach) for (const r of reach) { const d = len(sub(pos[r.end], pos[r.root])); if (d > r.max) reachOk = false; }
    return { t, pos, active, reachOk };
  });
  const drift = Math.max(0, ...out.flatMap((f) => contacts.filter((c) => f.t >= c.from && f.t <= c.to).map((c) => len(sub(f.pos[c.member], f.pos[c.target])))));
  return { method: "F31", frames: out, maxContactDrift: drift, reachViolations: out.filter((f) => !f.reachOk).map((f) => f.t) };
}

/** F31 proof sampling: first / contact / peak / end + sub-second strips around every occlusion swap */
function proofSamples__impl({ events, contacts = [], swaps = [], fps = 60, strip = 0.5, stripFps = 12 }) {
  const s = new Set();
  for (const e of events) { s.add(e.start); s.add(e.end); s.add(+((e.start + e.end) / 2).toFixed(3)); }
  for (const c of contacts) s.add(c.from);
  for (const w of swaps) for (let k = -strip / 2; k <= strip / 2 + 1e-9; k += 1 / stripFps) s.add(+(w + k).toFixed(3));
  return { method: "F31", times: [...s].filter((t) => t >= 0).sort((a, b) => a - b), frames: [...s].filter((t) => t >= 0).sort((a, b) => a - b).map((t) => Math.round(t * fps)) };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const assignOwnership = registerProducer("motion.assignOwnership", assignOwnership__impl);
export const scheduleEvents = registerProducer("motion.scheduleEvents", scheduleEvents__impl);
export const solveContacts = registerProducer("motion.solveContacts", solveContacts__impl);
export const proofSamples = registerProducer("motion.proofSamples", proofSamples__impl);
