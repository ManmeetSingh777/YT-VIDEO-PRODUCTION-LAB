// Whole-film coverage gate (P02 directive F090 + F075). Mechanical, every-frame checks computed from the REAL render receipts (per-frame RGB
// hashes and expected-state hashes recorded while rendering) joined to the frame trace index — never from a screenshot or a sample:
//  • every frame 0..total-1 is owned by a shot, a trace segment and a rendered chunk with a recorded hash;
//  • every promised action, approved art state (rig pose), camera track, effect, blur interval, transition boundary and measured sound cue maps
//    to rendered frames;
//  • MOVING intervals (trace segments that are not a static hold: active rig state, moving camera, effect) must show real pixel change —
//    a frozen/duplicated substitution over a declared moving interval is INERT_ACTION_INTERVAL; a declared static hold MAY repeat pixels;
//  • frames whose expected state changed while the pixels did not are FROZEN_FRAME (from the render scan).
// A pass proves mechanical coverage only; artistic readability, rhythm and style remain an independent human review (never implied here).
import fs from "node:fs"; import path from "node:path";
import { stateIntervals } from "../art_bridge/asset_state.mjs";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
/** P03 G — per-owner / per-unit visual attribution from ISOLATED captures (chrome_frames attributionUnits). For every action and every unit of an
 *  acting rig inside it: (1) a unit whose expected state changes over the action but whose isolated pixels never change is INERT_ACTION_OWNER
 *  (frozen character while other things move); (2) every DISCRETE swap of a unit (its visible drawing set changes: blink, grip closure, mouth)
 *  must differ from the counterfactual "previous drawing set at this frame" (ref_swap), else DISCRETE_STATE_NOT_RENDERED; (3) a unit with an
 *  active deformation/morph must differ from its rigid counterfactual (ref_rigid) on most active frames, else DEFORMATION_NOT_RENDERED.
 *  Mechanical attribution only; it never replaces the artistic review. */
export function ownerAttributionGate({ owners, first = 0, doc, requireUnits = true }) {
  const failures = [], report = [], at = (u, k, f) => owners[u]?.[k]?.[f - first] ?? null;
  for (const a of doc.actions) for (const act of a.actors) { const units = Object.keys(owners).filter((u) => u === act.rig_id || u.startsWith(`${act.rig_id}:`));
    if (!units.length) { if (requireUnits) failures.push({ code: "INERT_ACTION_OWNER", record_id: `${a.id}:${act.rig_id}`, reason: `no isolated attribution captured for actor ${act.rig_id}` }); continue; }
    const [s, e] = a.frame_range;
    for (const u of units) { const fr = []; for (let f = s; f < e; f++) if (at(u, "px", f) !== null) fr.push(f); if (fr.length === 0) { failures.push({ code: "INERT_ACTION_OWNER", record_id: `${a.id}:${u}`, reason: `owner ${u} acts in ${a.id} but was never captured in a rendered frame of it`, failed_invariant: "OWNER_SAMPLES_RECORDED" }); continue; } if (fr.length < 2) { report.push({ action: a.id, unit: u, frames: [fr[0], fr.at(-1) + 1], distinct_states: 1, distinct_pixels: 1, discrete_swaps: 0, swaps_not_rendered: [], deform_frames: 0, deform_frames_equal_to_rigid: 0, note: "single captured frame" }); continue; }
      const px = new Set(fr.map((f) => at(u, "px", f))), st = new Set(fr.map((f) => at(u, "state", f))), swaps = fr.filter((f) => at(u, "ref_swap", f) !== null), missed = swaps.filter((f) => at(u, "px", f) === at(u, "ref_swap", f));
      const def = fr.filter((f) => at(u, "ref_rigid", f) !== null), rigid = def.filter((f) => at(u, "px", f) === at(u, "ref_rigid", f));
      report.push({ action: a.id, unit: u, frames: [fr[0], fr.at(-1) + 1], distinct_states: st.size, distinct_pixels: px.size, discrete_swaps: swaps.length, swaps_not_rendered: missed, deform_frames: def.length, deform_frames_equal_to_rigid: rigid.length });
      if (def.length && rigid.length / def.length > 0.5) failures.push({ code: "INERT_ACTION_OWNER", record_id: `${a.id}:${u}`, frame_ranges: [[def[0], def.at(-1) + 1]], reason: `${u}: ${rigid.length}/${def.length} frames with an active deformation/morph render identical to the rigid drawing`, failed_invariant: "DEFORMATION_NOT_RENDERED" });
      if (st.size > 1 && px.size === 1) failures.push({ code: "INERT_ACTION_OWNER", record_id: `${a.id}:${u}`, frame_ranges: [[fr[0], fr.at(-1) + 1]], reason: `${u} changes expected state ${st.size}× in ${a.id} but its isolated pixels never change (frozen owner)`, failed_invariant: "OWNER_MOTION_RENDERED" });
      for (const f of missed) failures.push({ code: "INERT_ACTION_OWNER", record_id: `${a.id}:${u}`, frame_ranges: [[f, f + 1]], reason: `${u} swaps its approved drawing at frame ${f} but its isolated pixels are unchanged`, failed_invariant: "DISCRETE_STATE_NOT_RENDERED" }); } }
  return { ok: failures.length === 0, failures, units: report };
}
/** coverageGate({FILM, index, doc, plan, narration}) → {ok, failures[], coverage{}} */
export function coverageGate({ FILM, index, doc, plan = null, narration = null, requireOwnerAttribution = true, total: totalOverride = null, diagnosticBounded = false }) {
  const F = path.resolve(FILM), mf = J(path.join(F, "render", "FRAME_MANIFEST.json")), total = totalOverride && diagnosticBounded ? totalOverride : doc.stage.total_frames, failures = [], hashes = new Array(total).fill(null), states = new Array(total).fill(null);
  const owners = {};
  for (const c of mf.chunks) { const rc = J(path.join(F, c.mkv.replace(/\.mkv$/, ".json"))); rc.hashes.forEach((h, i) => { hashes[c.frames[0] + i] = h; }); for (const [u, o] of Object.entries(rc.owners || {})) { const t = (owners[u] ||= {}); for (const k of Object.keys(o)) { t[k] ||= new Array(total).fill(null); (o[k] || []).forEach((v, i) => { t[k][c.frames[0] + i] = v; }); } } (rc.state_hashes || []).forEach((h, i) => { states[c.frames[0] + i] = h; }); for (const d of c.defects || []) failures.push({ code: d.kind === "FROZEN_FRAME" ? "FROZEN_FRAME" : "RENDER_CAPTURE_FAILURE", frame_ranges: [[d.frame, d.frame + 1]], reason: `${d.kind}${d.reason ? ": " + d.reason : ""}` }); }
  const missing = hashes.map((h, f) => (h ? -1 : f)).filter((f) => f >= 0); if (missing.length || mf.total !== total) failures.push({ code: "COVERAGE_GAP", frame_ranges: [[missing[0] ?? mf.total, total]], reason: `${missing.length} of ${total} frames have no rendered hash (render total ${mf.total})` });
  const owned = (f) => index.segments.find((s) => s.frames[0] <= f && f < s.frames[1]);
  let unowned = 0; for (let f = 0; f < total; f++) if (!owned(f)?.shot) unowned++; if (unowned) failures.push({ code: "COVERAGE_GAP", reason: `${unowned} frames not owned by any shot segment` });
  const rendered = (s, e) => { if (!(Number.isInteger(s) && Number.isInteger(e)) || s < 0 || e > total || e <= s) return false; for (let f = s; f < e; f++) if (!hashes[f]) return false; return true; };
  const items = [...doc.actions.map((a) => ["action", a.id, a.frame_range]), ...stateIntervals(doc).map((x) => ["art_state", `${x.rig}:${x.pose}`, x.interval]), ...doc.shots.filter((s) => s.camera_track_id).map((s) => ["camera", s.camera_track_id, [s.start_frame, s.end_frame]]),
    ...(plan?.effects || []).map((e) => ["effect", e.id, e.frames]), ...(plan?.motion_blur || []).map((b, i) => ["blur", `blur${i}`, b.frames]), ...(doc.transitions || []).map((t) => ["transition", `${t.from_shot}->${t.to_shot}`, t.frame_range || [doc.shots.find((s) => s.id === t.to_shot)?.start_frame - 1, doc.shots.find((s) => s.id === t.to_shot)?.start_frame + 1]]),
    ...doc.shots.slice(1).map((s) => ["shot_boundary", s.id, [s.start_frame - 1, s.start_frame + 1]]), ...((narration?.cues || []).map((c) => { const w = narration.alignment?.words?.[c.word_index]; const fr = w ? Math.round(w.start_s * doc.stage.fps) : null; return ["sound_cue", c.id, fr === null ? [0, 0] : [fr, fr + 1]]; }))];
  const bounded = !!(totalOverride && diagnosticBounded), live = bounded ? items.filter(([, , fr]) => fr[0] < total).map(([k, i, fr]) => [k, i, [fr[0], Math.min(fr[1], total)]]) : items;
  const cov = {}; for (const [kind, id, fr] of live) { const ok = rendered(fr[0], fr[1]); (cov[kind] ||= []).push({ id, frames: fr, rendered: ok }); if (!ok) failures.push({ code: "COVERAGE_GAP", record_id: id, frame_ranges: [fr], reason: `${kind} ${id} maps to no rendered frames` }); }
  // moving intervals must change pixels; static holds may repeat
  const moving = []; for (const s of index.segments) { const [a, b] = s.frames; if (b - a < 2) continue; const distinct = new Set(hashes.slice(a, b)).size, stateDistinct = new Set(states.slice(a, b)).size;
    if (s.static_hold) continue; moving.push({ frames: s.frames, distinct_pixel_frames: distinct, distinct_states: stateDistinct });
    if (stateDistinct > 1 && distinct === 1) failures.push({ code: "INERT_ACTION_INTERVAL", frame_ranges: [s.frames], reason: `segment ${a}..${b - 1} (${s.actions.join(",") || s.camera_track || s.effects.join(",")}) changes expected state ${stateDistinct}× but renders ONE identical image (frozen substitution)` }); }
  // P03 G: per-owner attribution is part of the gate whenever the renderer recorded it; a renderer that did not is reported, not assumed
  const attr = Object.keys(owners).length ? ownerAttributionGate({ owners, doc: bounded ? { ...doc, actions: doc.actions.filter((a) => a.frame_range[0] < total).map((a) => ({ ...a, frame_range: [a.frame_range[0], Math.min(a.frame_range[1], total)] })) } : doc }) : { ok: false, failures: [], units: [], absent: true }; failures.push(...attr.failures);
  if (attr.absent && requireOwnerAttribution) failures.push({ code: "INERT_ACTION_OWNER", reason: "render receipts carry no per-owner attribution (renderer did not capture isolated owners); a frozen owner could hide behind other motion", failed_invariant: "OWNER_ATTRIBUTION_RECORDED" });
  return { ok: failures.length === 0, failures, coverage: cov, owner_attribution: attr.units, owner_attribution_absent: !!attr.absent, owner_attribution_required: requireOwnerAttribution, total_expected: total, bounded_diagnostic: !!(totalOverride && diagnosticBounded && totalOverride !== doc.stage.total_frames), frames_hashed: total - missing.length, moving_intervals: moving.length, static_holds: index.segments.filter((s) => s.static_hold).length, note: "mechanical coverage only; artistic review stays an independent human gate" };
}
