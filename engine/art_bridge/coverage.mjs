// Frame coverage (spec §4 step 4, §11.4): walk [0,total) frame-by-frame, find the dominant shot, active actions, required assets, contact
// intervals and state edges; return exact missing frame spans and ArtJob requests. A static master plate never counts as an active rig.
import { err } from "./errors.mjs";
import { actionInShot, actionShots, shotSegments, validateShotSpan } from "../story/action_span.mjs";

export function computeCoverage(doc) {
  const total = doc.stage.total_frames, errors = [], assets = new Map(doc.assets.map((a) => [a.id, a]));
  const shotAt = new Array(total).fill(null), dup = [];
  for (const s of doc.shots) {
    if (!(s.start_frame < s.end_frame) || s.end_frame > total) errors.push(err("INVALID_FRAME_RANGE", { record_id: s.id, frame_range: [s.start_frame, s.end_frame], reason: `shot range must be non-empty and within [0,${total})` }));
    for (let f = Math.max(0, s.start_frame); f < Math.min(total, s.end_frame); f++) { if (shotAt[f] !== null) dup.push(f); else shotAt[f] = s.id; }
  }
  const spans = (frames) => { const out = []; for (const f of frames) { const last = out.at(-1); if (last && last[1] === f) last[1] = f + 1; else out.push([f, f + 1]); } return out; };
  const gaps = spans(shotAt.map((s, f) => (s === null ? f : -1)).filter((f) => f >= 0));
  for (const g of gaps) errors.push(err("SHOT_COVERAGE_GAP", { frame_range: g, reason: `frames ${g[0]}..${g[1] - 1} have no shot` }));
  for (const g of spans(dup)) errors.push(err("SHOT_COVERAGE_GAP", { frame_range: g, reason: `frames ${g[0]}..${g[1] - 1} covered by more than one shot (overlap)` }));
  // per-frame requirements
  const missing = new Map(); // assetId -> frames
  const need = (id, f) => { if (!assets.has(id)) { if (!missing.has(id)) missing.set(id, []); missing.get(id).push(f); } };
  const actionsByShot = new Map(); for (const a of doc.actions) for (const sid of actionShots(a)) { if (!actionsByShot.has(sid)) actionsByShot.set(sid, []); actionsByShot.get(sid).push(a); }
  const shotById = new Map(doc.shots.map((s) => [s.id, s]));
  for (let f = 0; f < total; f++) {
    const s = shotAt[f]; if (!s) continue; const shot = shotById.get(s);
    for (const id of shot.required_asset_ids) need(id, f);
    for (const a of actionsByShot.get(s) || []) if (a.frame_range[0] <= f && f < a.frame_range[1]) for (const id of a.required_assets) need(id, f);
  }
  // static plate posing as a rig
  const rigs = new Map(doc.rigs.map((r) => [r.id, r]));
  for (const a of doc.actions) if (["ARTICULATED", "REGISTERED_CELS", "REGISTERED_MORPH", "EXPLICIT_DEFORM"].includes(a.mode)) for (const actor of a.actors) {
    const r = rigs.get(actor.rig_id); if (!r) continue;
    const kinds = new Set(r.render_parts.map((p) => assets.get(p.asset_id)?.kind)), distinct = new Set(r.render_parts.map((p) => p.asset_id));
    if (distinct.size <= 1 && (kinds.has("MASTER") || kinds.size === 0)) errors.push(err("STATIC_PLATE_NOT_RIG", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, suggested_producer: "GPT cutout/cel manufacture", reason: `${a.mode} action uses rig ${r.id} bound to a single static plate; it is not a registered active rig` }));
  }
  const missingArt = [...missing.entries()].map(([id, frames]) => ({ asset_id: id, frame_spans: spans(frames) }));
  for (const m of missingArt) errors.push(err("MISSING_ART_ASSET", { record_id: m.asset_id, frame_range: m.frame_spans[0], dependency: m.asset_id, suggested_producer: "art_requests.missingArtJobs → GPT provider", reason: `asset required on ${m.frame_spans.reduce((n, s) => n + s[1] - s[0], 0)} frames in ${m.frame_spans.length} span(s) is absent`, details: { frame_spans: m.frame_spans } }));
  return { errors, totalFrames: total, shotSpans: spans(shotAt.map((s, f) => (s ? f : -1)).filter((f) => f >= 0)), missingArt, framesCovered: shotAt.filter(Boolean).length };
}
