// Experience Director decisions as control inputs (directive G4; F017, F018, F011). Every direction decision must have a consuming track
// (actor/prop/camera/light/sound) in its frame span — a decision nothing consumes is DIRECTION_DECISION_INERT. Camera movement over a flat
// unlayered world is refused (no fake 3D). Movement phrases with no designed simultaneity are reported where the direction asks for overlap.
import { err } from "../art_bridge/errors.mjs";
/** compileAttention(beats, tracks) → {attention_beats, errors}. beats: [{id, frames, primary_focus, secondary?, intent, reveal?, hold?}];
 *  tracks: [{owner, element, kind: ACTOR|PROP|CAMERA|LIGHT|SOUND|WORLD, frames}] */
export function compileAttention(beats, tracks) {
  const errors = [], out = [], ov = (t, s, e) => t.frames[0] < e && t.frames[1] > s;
  for (const b of beats) {
    const [s, e] = b.frames, owners = {};
    for (const role of ["primary_focus", "secondary", "reveal"]) { const el = b[role]; if (!el) continue; const t = tracks.filter((x) => x.element === el && ov(x, s, e));
      if (!t.length) errors.push({ code: "DIRECTION_DECISION_INERT", record_id: b.id, frame_ranges: [[s, e]], reason: `${role} "${el}" has no consuming track in [${s},${e})`, required_art_or_operation: [`a ${role} track (actor/prop/camera/light/sound) for ${el}`] }); else owners[role] = t.map((x) => `${x.kind}:${x.owner}`); }
    if (b.hold && !(b.hold.frames >= 1 && b.hold.reason)) errors.push({ code: "DIRECTION_DECISION_INERT", record_id: b.id, reason: "recognition hold without duration/reason" });
    const simult = new Set(tracks.filter((x) => ov(x, s, e) && x.kind !== "SOUND").map((x) => x.owner)).size;
    if (b.requires_simultaneity && simult < 2) errors.push({ code: "DIRECTION_DECISION_INERT", record_id: b.id, reason: `beat asks for simultaneous action but only ${simult} motion owner(s) act in [${s},${e})` });
    out.push({ beat: b.id, frames: b.frames, intent: b.intent, owners, simultaneous_owners: simult });
  }
  return { attention_beats: out, errors };
}
/** cameraPurpose(camera, world) — refuse whole-world camera moves on a flat/unlayered plate (fake 3D); every move needs a viewer purpose */
export function cameraPurpose({ camera, world }) {
  const out = [];
  for (const m of camera.moves || []) {
    if (!m.purpose) out.push({ code: "DIRECTION_DECISION_INERT", record_id: m.id, reason: "camera move without a viewer purpose" });
    if (["ORBIT", "DOLLY_3D", "PUSH_PARALLAX"].includes(m.kind) && !((world.depth_planes || []).length >= 2 && world.depth_planes.every((p) => Number.isFinite(p.parallax)))) out.push({ code: "DIRECTION_DECISION_INERT", record_id: m.id, reason: `${m.kind} on a world with ${(world.depth_planes || []).length} authored depth plane(s): fake 3D over a flat plate is refused` });
  }
  return out;
}
/** directionFieldsConsumed(decisions, consumers) — every recorded direction decision id must appear in some consumer's inputs */
export function directionFieldsConsumed(decisions, consumers) { const used = new Set(consumers.flatMap((c) => c.consumes)); return decisions.filter((d) => !used.has(d.id)).map((d) => ({ code: "DIRECTION_DECISION_INERT", record_id: d.id, reason: `direction decision "${d.text || d.id}" is recorded but no producer consumes it` })); }
