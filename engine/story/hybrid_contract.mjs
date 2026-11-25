// HYBRID_CONTRACT v1 — the Better One companion to an approved CREATIVE_PACKET v1.1.0. The packet (unchanged, already being written by
// GPT) has no typed place for: truth-mode claims with sources, model-driven decoder bindings, Blender host shots, or per-character
// dialogue. This contract adds exactly those, bound to the packet by its digest, and hybridPreflight() checks every entry against the
// packet AND against the real producers (model_card / MODEL_BAR, host_pass adapter v1, acting.speech). Same feedback shape as
// creative_preflight: a typed refusal with permitted options; the engine never simplifies the direction.
//
// { version: "1.0.0", film_id, packet_sha256,
//   claims:   [{ id, text, mode: F|R|M|H|X, source: {uri, date, excerpt} | null, shot_ids: [] }],
//   decoders: [{ id, shot_id, action_id, model_card, output, unit, symbol_art_id, scenario_keys: [[frame, scenario, ease?]], baseline_xy, px_per_unit,
//                displays: [{ value_ref, shown_provenance }] }],
//   hosts:    [{ id, shot_id, frames: [a,b), band, host_asset: { status: APPROVED_HOST|PENDING, blend_file, blend_sha256, approval_receipt_id },
//                camera: {type, location, rotation_euler_deg, ortho_scale}, ground: {z}, contact_points: [{id, object}],
//                calibration_landmarks: [{ id, world: [x,y,z], plate_art_id, landmark }], performance: [{ frames, action, intent }] }],
//   dialogue: [{ line_id, speaker, text, frames, audio_file, audio_sha256, alignment_file, mouth_scheme: "REST_MID_OPEN", limited_mouth_approved: bool }] }
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { packetDigest } from "./creative_packet.mjs";
import { feedback } from "./creative_preflight.mjs";
import { validateModelCard, evaluateModel, displayLabelAudit } from "../decoder/model_card.mjs";

const PR = "engine/story/hybrid_contract.mjs#hybridPreflight";
const TRUTH = ["F", "R", "M", "H", "X"];
/** the per-operation producers this contract routes to (for the capability matrix) */
export const HYBRID_PRODUCERS = Object.freeze({
  DECODER: { producer: "engine/decoder/model_bar.mjs#compileModelBars", consumer: "engine/art_bridge/scene_graph.mjs#composeShot (symbol pass)", qa: "engine/decoder/decoder_qa.mjs#verifyModelBarFrames", test: "tests/tbo/decoder_model.test.mjs" },
  HOST: { producer: "engine/host3d/blender_host_passes.py + engine/host3d/host_pass.mjs#compileHostPasses", consumer: "engine/art_bridge/scene_graph.mjs#composeShot (host passes)", qa: "engine/host3d/host_pass.mjs#verifyHostComposite", test: "tests/tbo/host_pass.test.mjs" },
  DIALOGUE: { producer: "measured word alignment (external recording + aligner)", consumer: "engine/art_bridge/acting.mjs#compileActing (speech channel)", qa: "engine/film/audio_mix.mjs#verifyAudioSync", test: "tests/p03 acting/speech tests" },
});

export function hybridPreflight(packet, H, { sourceDir = null } = {}) {
  const out = [], digest = packetDigest(packet), add = (o) => out.push(feedback({ producer: PR, input_digest: digest, ...o }));
  const ledger = { decoders: [], hosts: [], dialogue: [], claims: [] };
  if (!H || H.version !== "1.0.0") { add({ record_id: "hybrid", failed_invariant: "HYBRID_CONTRACT_VERSION", needed_change_type: "INCOMPLETE_DIRECTION", reason: `hybrid contract version ${H?.version} is not 1.0.0` }); return done(); }
  if (H.packet_sha256 !== digest) add({ record_id: "hybrid", failed_invariant: "HYBRID_BOUND_TO_PACKET", needed_change_type: "INCOMPLETE_DIRECTION", reason: `the hybrid contract was written for packet ${String(H.packet_sha256).slice(0, 12)}…, this packet is ${digest.slice(0, 12)}…` });
  const shots = new Map(packet.shots.map((s) => [s.id, s])), acts = new Map(packet.actions.map((a) => [a.id, a])), arts = new Map(packet.art_requirements.map((a) => [a.id, a])), ids = new Map(packet.identities.map((i) => [i.id, i])), worlds = new Map(packet.worlds.map((w) => [w.id, w]));
  const within = (r, o) => r && o && r[0] >= o[0] && r[1] <= o[1] && r[0] < r[1];
  // claims: truth modes (Bible §8.1–8.2)
  const claims = new Map((H.claims || []).map((c) => [c.id, c]));
  for (const c of H.claims || []) { const row = { id: c.id, mode: c.mode, sourced: !!c.source?.uri, shots: c.shot_ids }; ledger.claims.push(row);
    if (!TRUTH.includes(c.mode)) add({ record_id: c.id, failed_invariant: "CLAIM_TRUTH_MODE", needed_change_type: "INCOMPLETE_DIRECTION", reason: `claim mode ${c.mode} is not one of F/R/M/H/X` });
    if (c.mode === "F" && !(c.source?.uri && c.source?.date && c.source?.excerpt)) add({ record_id: c.id, failed_invariant: "CLAIM_TRUTH_UNVERIFIED", needed_change_type: "INCOMPLETE_DIRECTION", reason: "a documented fact (F) needs its source uri, date and supporting excerpt" });
    for (const s of c.shot_ids || []) if (!shots.has(s)) add({ record_id: c.id, failed_invariant: "CLAIM_SHOT_EXISTS", needed_change_type: "INCOMPLETE_DIRECTION", reason: `claim placed in unknown shot ${s}` }); }
  // decoders: TBO-G15
  for (const d of H.decoders || []) {
    const row = { id: d.id, shot: d.shot_id, action: d.action_id, ...HYBRID_PRODUCERS.DECODER, status: "SUPPORTED_IN_PRINCIPLE" }, bad = (inv, type, reason, extra = {}) => { row.status = type; add({ record_id: d.id, action_id: d.action_id, failed_invariant: inv, needed_change_type: type, reason, ...extra }); };
    const s = shots.get(d.shot_id), a = acts.get(d.action_id), sym = arts.get(d.symbol_art_id);
    if (!s) bad("DECODER_SHOT_EXISTS", "INCOMPLETE_DIRECTION", `unknown shot ${d.shot_id}`);
    else if (!s.content_kinds.some((k) => ["data_relation", "quantity_change", "comparison"].includes(k))) bad("DECODER_SHOT_DIRECTED_AS_DATA", "INCOMPLETE_DIRECTION", `shot ${s.id} shows a model value but is not directed as data_relation/quantity_change/comparison`);
    if (!a || a.mode !== "PROCEDURAL" || a.shot_id !== d.shot_id) bad("DECODER_ACTION_PROCEDURAL", "INCOMPLETE_DIRECTION", `decoder needs a PROCEDURAL action of shot ${d.shot_id}; ${d.action_id} is ${a ? `${a.mode} in ${a.shot_id}` : "missing"}`);
    if (!sym || sym.kind !== "SYMBOL") bad("DECODER_SYMBOL_ART", "MISSING_ART_REQUIREMENT", `decoder ${d.id} needs an approved SYMBOL drawing; ${d.symbol_art_id} is ${sym ? sym.kind : "not requested"}`, { art_requirement_id: d.symbol_art_id });
    else if (a && !sym.required_by.includes(a.id)) bad("DECODER_SYMBOL_ART", "MISSING_ART_REQUIREMENT", `${sym.id} is not required by ${a.id}`, { art_requirement_id: sym.id });
    if (a) for (const k of d.scenario_keys || []) if (!(k[0] >= a.frames[0] && k[0] < a.frames[1])) bad("DECODER_KEY_IN_ACTION", "INCOMPLETE_DIRECTION", `scenario key at frame ${k[0]} lies outside action ${a.id} [${a.frames}]`, { frame_range: [k[0], k[0] + 1] });
    if (!(d.scenario_keys || []).length || new Set(d.scenario_keys.map((k) => k[1])).size < 2) bad("DECODER_SHOWS_A_CHANGE", "INCOMPLETE_DIRECTION", "a decoder beat animates a change between at least two model scenarios (Bible §11.4: show numbers as changes)");
    const V = validateModelCard(d.model_card); if (!V.ok) for (const e of V.errors) bad(e.details?.failed_invariant || "MODEL_CARD_VALID", "INCOMPLETE_DIRECTION", e.human_readable_reason || e.message);
    else { for (const sid of new Set((d.scenario_keys || []).map((k) => k[1]))) { try { const R = evaluateModel(d.model_card, sid), v = R.values[d.output]; if (!v) bad("DECODER_OUTPUT_DEFINED", "INCOMPLETE_DIRECTION", `model has no output ${d.output}`); else if (v.unit !== d.unit) bad("DECODER_UNIT", "INCOMPLETE_DIRECTION", `${d.output} is ${v.unit}, the decoder declares ${d.unit}`); } catch (e) { bad(e.details?.failed_invariant || e.code, "INCOMPLETE_DIRECTION", e.human_readable_reason || e.message); } }
      for (const e of displayLabelAudit(d.model_card, d.displays || [])) bad("DISPLAY_PROVENANCE_HONEST", "INCOMPLETE_DIRECTION", e.human_readable_reason || e.message);
      for (const v of d.model_card.variables.filter((x) => x.provenance === "REAL_DOCUMENTED")) { const c = claims.get(v.claim_id); if (!c || c.mode !== "F") bad("MODEL_DOCUMENTED_HAS_SOURCE", "INCOMPLETE_DIRECTION", `input ${v.id} claims REAL_DOCUMENTED but claim ${v.claim_id} is not a sourced F claim in this contract`); } }
    ledger.decoders.push(row); }
  // hosts: TBO-G14
  for (const h of H.hosts || []) {
    const row = { id: h.id, shot: h.shot_id, frames: h.frames, ...HYBRID_PRODUCERS.HOST, status: "SUPPORTED_IN_PRINCIPLE" }, bad = (inv, type, reason, extra = {}) => { if (row.status === "SUPPORTED_IN_PRINCIPLE" || type !== "AUTHORITY_REQUIRED") row.status = type; add({ record_id: h.id, failed_invariant: inv, needed_change_type: type, reason, frame_range: h.frames, ...extra }); };
    const s = shots.get(h.shot_id);
    if (!s) bad("HOST_SHOT_EXISTS", "INCOMPLETE_DIRECTION", `unknown shot ${h.shot_id}`);
    else { if (!within(h.frames, s.frames)) bad("HOST_FRAMES_IN_SHOT", "INCOMPLETE_DIRECTION", `host frames [${h.frames}] are outside shot ${s.id} [${s.frames}]`);
      for (const m of s.camera.moves) if (m.operation !== "STATIC" && h.frames && m.frames[0] < h.frames[1] && m.frames[1] > h.frames[0]) bad("HOST_CAMERA_MATCHED", "MISSING_ENGINE_PRODUCER", `shot camera ${m.operation} over [${m.frames}] overlaps the host pass: adapter v1 composites a host only under a static 2D camera (a camera-matched Blender move is not implemented)`, { options: ["implement per-frame camera export from the 2D camera track into Blender, then re-run", "the creative author holds the 2D camera static during the host pass (new packet revision)"] });
      const w = worlds.get(s.world_id); for (const l of h.calibration_landmarks || []) { const p = arts.get(l.plate_art_id); if (!p || p.kind !== "WORLD_PLANE" || !w?.planes.some((q) => q.art_id === p.id)) bad("HOST_WORLD_CALIBRATED", "MISSING_ART_REQUIREMENT", `calibration landmark ${l.id} must sit on a WORLD_PLANE of shot ${s.id}'s world`, { art_requirement_id: l.plate_art_id }); else if (!p.landmarks.includes(l.landmark)) bad("HOST_WORLD_CALIBRATED", "MISSING_ART_REQUIREMENT", `world plane ${p.id} does not request landmark ${l.landmark}; the floor calibration point must be a reviewed landmark of the painting`, { art_requirement_id: p.id }); } }
    if ((h.calibration_landmarks || []).length < 2) bad("HOST_WORLD_CALIBRATED", "INCOMPLETE_DIRECTION", "at least two floor calibration landmarks tie the 3D ground to the painted floor");
    if (h.camera?.type !== "ORTHO") bad("HOST_CAMERA_ORTHO", "MISSING_ENGINE_PRODUCER", `host camera ${h.camera?.type} is not supported by adapter v1 (orthographic only)`, { options: ["implement a calibrated perspective camera (focal length, sensor, principal point) in engine/host3d, then re-run", "direct the host shot with an orthographic camera"] });
    if (!(h.contact_points || []).length) bad("HOST_CONTACT_DECLARED", "INCOMPLETE_DIRECTION", "a host on the floor declares its contact points (soles)");
    if (!(h.performance || []).length) bad("HOST_PERFORMANCE_DIRECTED", "INCOMPLETE_DIRECTION", "the host's acting beats (walk, stop, look, point, speak …) are directed per frame interval");
    for (const p of h.performance || []) if (!within(p.frames, h.frames)) bad("HOST_PERFORMANCE_DIRECTED", "INCOMPLETE_DIRECTION", `performance beat ${p.action} [${p.frames}] is outside the host interval`);
    if (h.host_asset?.status !== "APPROVED_HOST") bad("HOST_ASSET_APPROVED", "AUTHORITY_REQUIRED", "HOST_3D_ASSET_PENDING: no approved Blender host master (.blend with mesh, armature, weights, face shape keys) exists yet", { options: ["approve the original host concept, then build and approve the Blender master", "explicitly approve a 2.5D launch compromise (Bible §12.6) as a new packet revision"] });
    else if (!(h.host_asset.blend_sha256 && h.host_asset.approval_receipt_id)) bad("HOST_ASSET_APPROVED", "AUTHORITY_REQUIRED", "the approved host names its .blend sha256 and approval receipt");
    ledger.hosts.push(row); }
  // dialogue: TBO-G17 inputs + speech consumer
  for (const l of H.dialogue || []) {
    const row = { line: l.line_id, speaker: l.speaker, ...HYBRID_PRODUCERS.DIALOGUE, status: "SUPPORTED_IN_PRINCIPLE" }, bad = (inv, type, reason) => { if (row.status === "SUPPORTED_IN_PRINCIPLE" || type !== "AUTHORITY_REQUIRED") row.status = type; add({ record_id: l.line_id, failed_invariant: inv, needed_change_type: type, reason, frame_range: l.frames }); };
    const who = ids.get(l.speaker);
    if (!who) bad("DIALOGUE_SPEAKER_EXISTS", "INCOMPLETE_DIRECTION", `unknown speaker ${l.speaker}`);
    else if (!who.acting?.speech) bad("DIALOGUE_MOUTH_CHANNEL", "MISSING_ART_REQUIREMENT", `${l.speaker} speaks but its acting block declares no speech channel and mouth drawings`);
    if (l.mouth_scheme === "REST_MID_OPEN" && !l.limited_mouth_approved) bad("DIALOGUE_MOUTH_SCHEME_APPROVED", "INCOMPLETE_DIRECTION", "the engine's mouth is a syllable-timed rest/mid/open swap (no phoneme visemes). Approve that limited scheme for this line, or direct phoneme mouths (requires a new viseme producer + mouth drawings)");
    else if (l.mouth_scheme !== "REST_MID_OPEN") bad("DIALOGUE_MOUTH_SCHEME_SUPPORTED", "MISSING_ENGINE_PRODUCER", `mouth scheme ${l.mouth_scheme} has no producer (only REST_MID_OPEN exists)`);
    for (const [f, k] of [[l.audio_file, "recorded line"], [l.alignment_file, "measured word alignment"]]) { const p = f && sourceDir ? path.join(sourceDir, path.basename(f)) : null; if (!p || !fs.existsSync(p)) bad("DIALOGUE_AUDIO_PRESENT", "AUTHORITY_REQUIRED", `NEEDS_RECORDED_VOICE: the ${k} for ${l.line_id} is not supplied (no timing is invented)`); else if (k === "recorded line" && l.audio_sha256 && crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") !== l.audio_sha256) bad("DIALOGUE_AUDIO_PRESENT", "AUTHORITY_REQUIRED", `${f} does not match its declared sha256`); }
    ledger.dialogue.push(row); }
  return done();
  function done() { const tech = out.filter((x) => x.needed_change_type !== "AUTHORITY_REQUIRED"); return { status: tech.length ? "BLOCKED" : "SUPPORTED_IN_PRINCIPLE", hybrid_feasible: !tech.length, authority_pending: out.some((x) => x.needed_change_type === "AUTHORITY_REQUIRED"), packet_sha256: digest, ledger, feedback: out }; }
}
