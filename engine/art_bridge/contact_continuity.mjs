// P08 A02 — global semantic contact identity independent of shots. Every compiled contact has ONE canonical record
//   {contact_id, actor_rig, source_socket, target_owner, target_socket, kind, start, end, source_action_ids[], support_contract_id, persists, shot_visibility}
// and every consumer (constraint solver, art states, prop support, performance QA, framing, direction consequence, scene graph) reads it by that id.
// A contact declared in the approved CONTACT_CONTINUITY input may be released by another action and may cross cuts: the cut splits its render
// visibility only (VISIBLE / OCCLUDED / OFFSCREEN per shot), never its physics. An undeclared contact that would cross a cut is refused, never truncated.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { err } from "./errors.mjs";
import { validate } from "./jsonschema.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), P = "engine/art_bridge/contact_continuity.mjs";
export const CONTACT_CONTINUITY_VERSION = "1.0.0";
export const SCHEMA = JSON.parse(fs.readFileSync(path.resolve(here, "..", "..", "schemas", "contact_continuity_v1.schema.json"), "utf8"));
const refuse = (code, o) => err(code, { record_id: o.record ?? null, frame_range: o.frame_range ?? null, reason: o.reason, producer: `${P}#${o.fn ?? "normalizeContactContinuity"}`, failed_invariant: o.invariant, details: { contact_id: o.record ?? null, failed_invariant: o.invariant, earliest_producer: `${P}#${o.fn ?? "normalizeContactContinuity"}` } });
/** normalizeContactContinuity(spec) → {byGrip: Map(grip_command → decl), byId, errors} */
export function normalizeContactContinuity(spec) {
  const errors = [], byGrip = new Map(), byId = new Map(); if (!spec) return { byGrip, byId, errors };
  const se = validate(SCHEMA, spec); if (se.length) return { byGrip, byId, errors: se.slice(0, 20).map((x) => refuse("PERFORMANCE_COMMAND_INVALID", { record: x.path, invariant: "CONTACT_CONTINUITY_SCHEMA_V1", reason: `${x.path}: ${x.msg}` })) };
  for (const c of spec.contacts) { if (byId.has(c.contact_id)) errors.push(refuse("DUPLICATE_ELEMENT_ID", { record: c.contact_id, invariant: "CONTACT_ID_UNIQUE", reason: `contact id ${c.contact_id} is declared twice` }));
    if (byGrip.has(c.grip_command)) errors.push(refuse("DUPLICATE_ELEMENT_ID", { record: c.contact_id, invariant: "ONE_CONTINUITY_PER_GRIP", reason: `grip ${c.grip_command} has two continuity declarations` }));
    byId.set(c.contact_id, c); byGrip.set(c.grip_command, c); }
  return { byGrip, byId, errors };
}
/** canonical identity of a compiled contact (explicit id from the continuity input, else a stable id derived from its immutable content) */
export function canonicalContact(a, c, { actorRig, targetOwner }) {
  const id = c.contact_id ?? `${a.id}:${c.source_socket}@${c.start_frame}->${c.target_socket ?? (c.target_world_xy ? `world(${c.target_world_xy.join(",")})` : c.contact_type)}`;
  return { contact_id: id, id_source: c.contact_id ? "DECLARED" : "DERIVED_FROM_CONTENT", actor_rig: actorRig, source_socket: c.source_socket, target_owner: targetOwner, target_socket: c.target_socket ?? null, kind: c.contact_type, start: c.start_frame, end: c.end_frame,
    source_action_ids: c.source_action_ids ?? [a.id], support_contract_id: c.support_contract_id ?? null, persists: !!c.persists_across_shots, shot_visibility: c.shot_visibility ?? null };
}
/** validateContactShots(contacts, shots) → errors: a contact overlapping a shot other than its action's shot must be persistent AND mapped there */
export function validateContactShots(contacts, shots) {
  const errors = [], ids = new Map();
  for (const k of contacts) { const id = k.identity.contact_id; if (ids.has(id)) errors.push(refuse("DUPLICATE_ELEMENT_ID", { record: id, fn: "validateContactShots", invariant: "CONTACT_ID_UNIQUE", reason: `two compiled contacts share id ${id} (${ids.get(id)} and ${k.action.id})` })); ids.set(id, k.action.id);
    const over = shots.filter((s) => s.start_frame < k.c.end_frame && k.c.start_frame < s.end_frame);
    if (!k.identity.persists) { const foreign = over.filter((s) => s.id !== k.action.shot_id); if (foreign.length) errors.push(refuse("CONTACT_CONTINUITY_UNMAPPED", { record: id, fn: "validateContactShots", frame_range: [k.c.start_frame, k.c.end_frame], invariant: "NO_SILENT_CUT_TRUNCATION", reason: `contact ${id} runs into shot(s) ${foreign.map((s) => s.id)} but is not a declared persistent contact: declare it in CONTACT_CONTINUITY (with per-shot visibility) or end it before the cut` })); continue; }
    for (const s of over) if (!k.identity.shot_visibility?.[s.id]) errors.push(refuse("CONTACT_CONTINUITY_UNMAPPED", { record: id, fn: "validateContactShots", frame_range: [Math.max(s.start_frame, k.c.start_frame), Math.min(s.end_frame, k.c.end_frame)], invariant: "EVERY_SHOT_MAPPED", reason: `persistent contact ${id} overlaps shot ${s.id} with no declared visibility (VISIBLE / OCCLUDED / OFFSCREEN); nothing defaults` }));
    for (const sid of Object.keys(k.identity.shot_visibility || {})) if (!over.some((s) => s.id === sid)) errors.push(refuse("CONTACT_CONTINUITY_UNMAPPED", { record: id, fn: "validateContactShots", invariant: "MAPPING_NAMES_OVERLAPPED_SHOTS", reason: `contact ${id} maps shot ${sid}, which its interval [${k.c.start_frame},${k.c.end_frame}) does not overlap (wrong mapping)` })); }
  return errors;
}
