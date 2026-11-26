// P08 A04 — successor phase inheritance. A phase [a,b) of a parent film owes its successor the EXACT state of frame b−1: a content-hashed
// boundary bundle (parent source, revision, producer version, every owner's transform/state/contacts/prop authority, camera, active actions,
// procedural/cel phase, baked secondary values, active time remaps and every audio cue that crosses the boundary with its exact source sample).
// A successor starting at k consumes the verified bundle of k−1: its own evaluation of k−1 must reproduce the bundle owner by owner, the start must
// be exactly predecessor.frame + 1 (no gap, no overlap), the parent source and revision must match, and every crossing cue must continue at its
// exact sample (no truncation, no duplicated onset). Nothing is reconstructed from defaults; history comes from the deterministic absolute-clock
// evaluator (pure stateAtFrame + compile-time bakes), so a resumed phase equals the continuous render.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { stateAtFrame } from "../art_bridge/temporal.mjs";
import { err } from "../art_bridge/errors.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const BOUNDARY_VERSION = "1.0.0";
const sha = (x) => crypto.createHash("sha256").update(typeof x === "string" ? x : JSON.stringify(x)).digest("hex");
const r6 = (v) => (typeof v === "number" ? Math.round(v * 1e6) / 1e6 : Array.isArray(v) ? v.map(r6) : v && typeof v === "object" ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : 1)).map(([k, x]) => [k, r6(x)])) : v);
export const producerVersion = () => sha(["engine/art_bridge/temporal.mjs", "engine/art_bridge/prop_support.mjs", "engine/art_bridge/performance_commands.mjs", "engine/art_bridge/composition.mjs", "engine/art_bridge/speech_visemes.mjs"].map((f) => sha(fs.readFileSync(path.join(REPO, f)))));
/** ownerStates(C, S) → {rig: state} from an evaluated frame: exactly what the renderer would draw for that owner (contacts attributed by socket owner) */
export function ownerStates(C, S) { const out = {};
  for (const [rid, M] of Object.entries(S.matrices)) out[rid] = { matrices: r6(M), art: S.artStates[rid] ? r6({ pose: S.artStates[rid].pose, view: S.artStates[rid].view ?? null, channels: S.artStates[rid].channels }) : null, contacts: [] };
  for (const c of S.contacts) { const rid = C.socketOwner.get(c.socket); if (rid && out[rid]) out[rid].contacts.push(r6({ id: c.contact_id, locked: c.locked, error_px: c.error_px ?? null, target: c.target ?? null })); }
  for (const p of S.prop_support || []) if (out[p.prop_rig]) out[p.prop_rig].prop = r6({ driver: p.driver, driver_kind: p.driver_kind, valid: p.valid_supporters });
  return out; }
/** boundaryBundle(C, frame, {parent_source_sha256, revision, audio}) — the outgoing obligation of a phase whose last frame is `frame` */
export function boundaryBundle(C, frame, { parent_source_sha256, revision, audio = null, phase = null } = {}) {
  if (!/^[a-f0-9]{64}$/.test(parent_source_sha256 || "")) throw err("PHASE_BOUNDARY_INVALID", { record_id: phase ?? "(phase)", reason: "a boundary bundle names the parent source by its sha256", failed_invariant: "PARENT_SOURCE_BOUND" });
  const S = stateAtFrame(C, frame), owners = ownerStates(C, S);
  const body = { schema_version: BOUNDARY_VERSION, kind: "PHASE_OUTGOING_BOUNDARY", phase, frame, parent_source_sha256, revision, producer_version: producerVersion(), shot_id: S.shotId,
    owners: Object.fromEntries(Object.entries(owners).map(([k, v]) => [k, { sha256: sha(v), state: v }])), camera: r6(S.camera), active_actions: C.actions.filter((a) => a.frame_range[0] <= frame && frame < a.frame_range[1]).map((a) => a.id).sort(),
    cels: r6(S.cels.map((c) => ({ action: c.action, entry: c.entry_index, asset: c.asset_id }))), procedural: r6(S.procedural.map((p) => ({ id: p.pass_id, s: p.s ?? null }))), secondary: r6(S.secondary), remapped: S.remapped ?? null,
    audio_crossing: audio ? audio.crossingAt((frame + 1) * audio.spf) : [] };
  return { ...body, sha256: sha(body) };
}
/** verifySuccessor({bundle, C, start, parent_source_sha256, revision, audio}) → {ok, failures, checked_owners} — the successor's own k−1 must equal the bundle */
export function verifySuccessor({ bundle, C, start, parent_source_sha256, revision, audio = null, expectedSha = null }) {
  const F = [], no = (inv, reason, extra = {}) => F.push(err("PHASE_BOUNDARY_INVALID", { record_id: bundle?.phase ?? "(successor)", frame_range: [start - 1, start + 1], reason, failed_invariant: inv, producer: "engine/film/phase_boundary.mjs#verifySuccessor", ...extra }));
  if (!bundle) { no("PREDECESSOR_PRESENT", "no predecessor boundary bundle: a successor never starts from defaults"); return { ok: false, failures: F }; }
  const { sha256, ...body } = bundle; if (sha(body) !== sha256) no("BUNDLE_INTACT", "the boundary bundle was altered after it was sealed");
  if (expectedSha && sha256 !== expectedSha) no("PREDECESSOR_DIGEST", `the successor was approved against predecessor ${expectedSha.slice(0, 12)}, this bundle is ${sha256.slice(0, 12)}`);
  if (start !== bundle.frame + 1) no(start <= bundle.frame ? "NO_OVERLAP" : "NO_GAP", `successor starts at ${start}; the predecessor's last frame is ${bundle.frame} (${start <= bundle.frame ? "overlapping" : "gapped"} phases)`);
  if (parent_source_sha256 !== bundle.parent_source_sha256) no("SAME_PARENT_SOURCE", "successor and predecessor are phases of different parent sources");
  if (revision !== bundle.revision) no("SAME_REVISION", `successor revision ${revision} ≠ predecessor revision ${bundle.revision} (an old revision cannot continue a new one)`);
  if (!F.some((x) => x.failed_invariant === "NO_GAP" || x.failed_invariant === "NO_OVERLAP")) {
    const mine = ownerStates(C, stateAtFrame(C, bundle.frame)); let checked = 0;
    for (const [rid, o] of Object.entries(bundle.owners)) { if (!mine[rid]) { no("OWNER_PRESENT", `owner ${rid} of the predecessor boundary is missing in the successor`); continue; } checked++; if (sha(mine[rid]) !== o.sha256) no("OWNER_STATE_EQUAL", `owner ${rid}: the successor's evaluation of frame ${bundle.frame} differs from the predecessor's outgoing state`, { details: { owner: rid } }); }
    for (const rid of Object.keys(mine)) if (!bundle.owners[rid]) no("NO_NEW_OWNER_AT_BOUNDARY", `owner ${rid} appears in the successor's frame ${bundle.frame} but not in the predecessor's boundary`);
    if (audio) { const need = bundle.audio_crossing || []; for (const c of need) { const mineC = audio.placementOf(c.cue_id); if (!mineC) { no("CROSSING_CUE_CONTINUES", `cue ${c.cue_id} crosses the boundary (source sample ${c.source_sample_at_boundary}) but the successor does not continue it (truncated tail)`); continue; }
      const at = audio.sourceSampleAt(c.cue_id, (bundle.frame + 1) * audio.spf); if (at !== c.source_sample_at_boundary) no("CROSSING_CUE_SAMPLE_EXACT", `cue ${c.cue_id} continues at source sample ${at}, the predecessor left it at ${c.source_sample_at_boundary}${at < c.source_sample_at_boundary ? " (duplicated onset)" : " (skipped samples)"}`); } }
    return { ok: !F.length, failures: F, checked_owners: checked }; }
  return { ok: false, failures: F, checked_owners: 0 };
}
