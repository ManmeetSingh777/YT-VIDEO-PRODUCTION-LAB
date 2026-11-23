// Motion systems that were missing producers (directive I1/I3/I4/I5; F009, F011, F018, F020, F021, F055, F056, F066, F069, F072):
// cast-shadow occluder/receiver relations with material response, transform-ownership validation, portal OUT→MIDDLE→IN contracts,
// view-family turns, ActionPhrase scheduling into synchronized owner tracks, seeded per-frame particle state, shutter blur.
import { err } from "./errors.mjs";

/* I3 shadows: a cast shadow exists only for a declared occluder→receiver pair; its shape is the occluder projected along the light onto the
   receiver plane; its treatment depends on the receiver MATERIAL (no universal crescent). */
const MATERIAL = { fabric: { opacity: 0.35, edge: "soft", tint: "cool_darker_same_hue" }, metal: { opacity: 0.5, edge: "hard", tint: "neutral_dark", specular_break: true }, skin: { opacity: 0.25, edge: "soft", tint: "warm_darker" }, hair: { opacity: 0.2, edge: "soft", tint: "same_hue_darker" }, floor: { opacity: 0.4, edge: "contact_hard_then_soft", tint: "ambient_occlusion" }, glass: { opacity: 0.15, edge: "caustic", tint: "transmitted" } };
export function castShadow({ light, occluder, receiver }) {
  if (!occluder?.polygon || !receiver?.plane_y) throw err("SHADOW_RELATION_MISSING", { reason: "a cast shadow needs a declared occluder polygon and receiver plane", producer: "engine/art_bridge/motion_systems.mjs#castShadow" });
  const m = MATERIAL[receiver.material]; if (!m) throw err("SHADOW_RELATION_MISSING", { reason: `receiver material ${receiver.material} has no approved shadow treatment` });
  const [lx, ly] = light.direction; if (ly <= 0) return { polygon: [], reason: "light from below the receiver: no cast shadow" };
  const poly = occluder.polygon.map(([x, y]) => { const t = (receiver.plane_y - y) / ly; return [x + lx * t, receiver.plane_y]; });
  return { polygon: poly, owner: `${occluder.id}->${receiver.id}`, treatment: m, light_state: light.state };
}
/* I1 transform ownership: camera → world depth plane → rig root → joint → art; exactly one owner per node; camera never on an object node */
const ORDER = ["camera", "world_plane", "rig_root", "joint", "art"];
export function validateTransformOwnership(nodes) {
  const f = [], ids = new Map(), byId = new Map(nodes.map((n) => [n.id, n]));
  for (const n of nodes) { if (ids.has(n.id)) f.push({ code: "DUPLICATE_ELEMENT_ID", record_id: n.id }); ids.set(n.id, true);
    const owners = [].concat(n.owner || []); if (owners.length !== 1) f.push({ code: "INVALID_TRANSFORM_OWNER", record_id: n.id, reason: `${owners.length} transform owners (${owners})` });
    const p = n.parent ? byId.get(n.parent) : null; if (p && ORDER.indexOf([].concat(p.owner)[0]) > ORDER.indexOf(owners[0])) f.push({ code: "INVALID_TRANSFORM_OWNER", record_id: n.id, reason: `${owners[0]} under ${[].concat(p.owner)[0]} breaks camera→plane→root→joint→art` }); }
  const seen = new Set(); for (const n of nodes) { let c = n, k = 0; while (c?.parent && k++ < nodes.length + 1) c = byId.get(c.parent); if (k > nodes.length) f.push({ code: "INVALID_RIG_DAG", record_id: n.id, reason: "circular ownership" }); seen.add(n.id); }
  return { ok: f.length === 0, failures: f };
}
/* I4 portal: OUT → MIDDLE → IN with a shared aperture, rim occluder, overscan on both sides and a real middle plate */
export function validatePortal(t) {
  const f = [], need = ["out_plate", "middle_plate", "in_plate", "aperture_curve", "rim_occluder"];
  for (const k of need) if (!t[k]) f.push({ code: "MISSING_TRANSITION_STATE", reason: `portal lacks ${k}` });
  if (t.out_plate && t.in_plate && t.aperture_curve && (t.out_plate.aperture_id !== t.aperture_curve.id || t.in_plate.aperture_id !== t.aperture_curve.id)) f.push({ code: "MISSING_TRANSITION_STATE", reason: "OUT and IN plates do not share the aperture curve" });
  for (const fr of t.frames || []) { if (fr.mask_coverage < 1 - 1e-9) f.push({ code: "OUTSIDE_CAMERA_FOOTPRINT", frame_range: [fr.f, fr.f + 1], reason: `aperture mask covers ${(fr.mask_coverage * 100).toFixed(2)}% of the required region` }); if (fr.opacity_crossfade) f.push({ code: "MISSING_TRANSITION_STATE", frame_range: [fr.f, fr.f + 1], reason: "opacity zoom-cut is not a portal passage" }); }
  return { ok: f.length === 0, failures: f };
}
/* I3 view family: a turn needs registered view cels with correspondences — never a rotated/flipped front PNG */
export function validateViewTurn({ from_view, to_view, cels, rotation_of_front = false }) {
  if (rotation_of_front) return { ok: false, failures: [{ code: "UNSUPPORTED_VIEW", reason: "turning by rotating/flipping the front PNG is refused; an approved view cel is required" }] };
  const c = cels.find((x) => x.view === to_view); if (!c) return { ok: false, failures: [{ code: "UNSUPPORTED_VIEW", reason: `no approved ${to_view} cel (MISSING_ART_ASSET → source-attached view edit)` }] };
  const shared = (c.landmarks_shared_with || {})[from_view] || []; return shared.length >= 3 ? { ok: true } : { ok: false, failures: [{ code: "UNSUPPORTED_STATE_EDGE", reason: `${from_view}→${to_view} shares ${shared.length} registered landmarks (<3)` }] };
}
/* I5 ActionPhrase → synchronized owner tracks. Phases are conditional; each owner gets keys at the phase boundaries with its own offset
   (overlap / follow-through), so arm, prop, face, camera and sound share true integer-frame dependencies. */
const PHASES = ["ATTENTION", "ANTICIPATION", "PREPARATION", "CONTACT", "ACTION", "CONSEQUENCE", "FOLLOW_THROUGH", "SETTLE", "NEXT_INTENT"];
export function compilePhrase(ph) {
  const f = [], order = ph.phases.map((p) => PHASES.indexOf(p.phase)); if (order.some((x) => x < 0) || order.some((x, i) => i && x <= order[i - 1])) f.push({ code: "SCHEMA_VIOLATION", reason: `phases out of order: ${ph.phases.map((p) => p.phase)}` });
  let t = ph.start_frame; const bounds = ph.phases.map((p) => { const b = { phase: p.phase, frames: [t, t + p.frames] }; t += p.frames; return b; });
  const tracks = {};
  for (const o of ph.owners) { const keys = []; for (const b of bounds) { const v = o.values[b.phase]; if (v === undefined) continue; keys.push([b.frames[0] + (o.offset_frames || 0), v, o.ease || "sine.inOut"]); } if (keys.length) tracks[o.id] = { kind: o.kind, keys }; }
  if (ph.phases.some((p) => p.phase === "CONSEQUENCE") && !ph.owners.some((o) => o.kind !== "ACTOR" && o.values.CONSEQUENCE !== undefined)) f.push({ code: "DIRECTION_DECISION_INERT", reason: "CONSEQUENCE phase with no prop/world/sound owner reacting" });
  const kinds = new Set(Object.values(tracks).map((x) => x.kind)), overlapping = bounds.filter((b) => Object.values(tracks).filter((tr) => tr.keys.some(([k]) => k >= b.frames[0] && k < b.frames[1])).length >= 2).length;
  if (kinds.size < 2) f.push({ code: "DIRECTION_DECISION_INERT", reason: "phrase drives a single owner kind: isolated motion, no designed simultaneity" });
  return { ok: f.length === 0, failures: f, phase_bounds: bounds, tracks, simultaneity: { owner_kinds: [...kinds], phases_with_overlap: overlapping }, end_frame: t };
}
/* determinism: particle/drum phase state is a PURE function of (seed, frame) — random seek equals sequential replay */
export function seededParticles(seed, frame, count = 8) { const out = []; for (let i = 0; i < count; i++) { let h = (seed ^ (i * 0x9e3779b1)) >>> 0; h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0; h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0; const phase = (h % 1000) / 1000, x = (phase * 1920 + frame * (1 + (h % 7))) % 1920; out.push([+x.toFixed(4), (h % 1080)]); } return out; }
/* shutter blur (F069): N sub-frame samples over the shutter interval of the SAME pure motion function (a compositor consumer, not a smear) */
export function shutterSamples(motion, frame, { shutter = 0.5, samples = 8 } = {}) { const out = []; for (let i = 0; i < samples; i++) out.push(motion(frame + (shutter * (i + 0.5)) / samples)); return out; }
