#!/usr/bin/env node
// Film contract compilation (directive G — "first-class producers, called by film handoff compilation BEFORE art dependencies").
// Runs the story/experience/action/continuity/demand producers on a film and writes story/FILM_CONTRACT_REPORT.json, which exportOutbox
// reads and reports as blockers. Inputs: story/STORY_CONTRACT.json (typed claims/mechanisms/obstacles), story/SEMANTIC_ACTIONS.json (typed
// actions per shot), direction/SHOT_SCORE_60FPS.json, the manifest and motion plans. Missing typed inputs are reported, never invented.
//   node engine/tools/compile_film_contracts.mjs --film DIR
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { validateStoryContract } from "../story/mechanism.mjs";
import { compileActionCoverage, eventsFromShotScore } from "../story/action_coverage.mjs";
import { checkContinuity } from "../story/continuity.mjs";
import { compileAttention } from "../story/experience.mjs";
import { deriveArtDemands } from "../art_bridge/art_demand.mjs";
import { validateTransformOwnership, compilePhrase, castShadow, validatePortal } from "../art_bridge/motion_systems.mjs";
import { routeBeatMedia } from "../art_bridge/source_method_causality.mjs";
import { gripMorphology, solveContact, balance } from "../art_bridge/contact_solver.mjs";
import { stateIntervals } from "../art_bridge/asset_state.mjs";
import { buildFilmRevision, checkTiling } from "../film/film_revision.mjs";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), opt = (f) => (fs.existsSync(f) ? J(f) : null);
export function compileFilmContracts({ film }) {
  const FILM = path.resolve(film), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan = J(path.join(FILM, "handoff", "ART_DEPENDENCY_PLAN.json"));
  const score = opt(path.join(FILM, "direction", "SHOT_SCORE_60FPS.json")), story = opt(path.join(FILM, "story", "STORY_CONTRACT.json")), typed = opt(path.join(FILM, "story", "SEMANTIC_ACTIONS.json"));
  const motionPlans = {}; for (const f of fs.readdirSync(path.join(FILM, "handoff"))) { const m = f.match(/^MOTION_PLAN_(.+)\.json$/); if (m) motionPlans[m[1]] = J(path.join(FILM, "handoff", f)); }
  const report = { film: path.basename(FILM), revision: buildFilmRevision(FILM).digest, sections: {} }, S = report.sections;
  // story truth
  S.story = story && story.provenance !== "DIAGNOSTIC_FIXTURE" ? validateStoryContract(story) : { status: "NOT_APPROVABLE", failures: [{ code: "FACT_CHECK_REQUIRED", reason: story ? "story contract is a diagnostic stand-in" : "no typed story contract (claims, mechanisms, obstacles): the proposal's facts are unverified" }] };
  // semantic action coverage per shot (typed actions are the authority; prose is the check)
  S.actions = (score?.shots || []).map((sh) => { const acts = typed?.[sh.shot] || [], prose = (sh.events || []).filter((e) => e.goal).map((e, i) => ({ id: `${sh.shot}.goal${i}`, text: e.goal })).concat(sh.entry ? [{ id: `${sh.shot}.entry`, text: sh.entry }] : []);
    const r = compileActionCoverage({ actions: acts, events: eventsFromShotScore(sh, doc), prose, initial_possession: typed?.[`${sh.shot}__possession`] || {} }); return { shot: sh.shot, typed_actions: acts.length, complete: r.complete, errors: r.errors }; });
  // continuity across cuts: element state tracks from the executed pose/view events of each shot
  const tracks = {}; for (const x of stateIntervals(doc)) { const t = (tracks[x.shot] ||= {}); (t[`${x.rig}.pose`] ||= []).push([x.interval[0], x.pose]); if (x.view) (t[`${x.rig}.view`] ||= []).push([x.interval[0], x.view]); }
  S.continuity = checkContinuity(doc.shots.map((s) => ({ id: s.id, frames: [s.start_frame, s.end_frame], tracks: tracks[s.id] || {} })), (doc.transitions || []).map((t) => ({ from: t.from_shot, to: t.to_shot, kind: t.mode, time_jump: t.time_jump })));
  // attention: every attention_path element must have a consuming track (actor socket, target or prop) in its shot
  const owners = doc.actions.flatMap((a) => [...a.actors.map((x) => ({ owner: x.rig_id, element: x.rig_id, kind: "ACTOR", frames: a.frame_range })), ...(a.contact_events || []).flatMap((c) => [c.source_socket, c.target_socket].map((e) => ({ owner: a.id, element: e, kind: "PROP", frames: [c.start_frame, c.end_frame] })))]);
  S.attention = (score?.shots || []).map((sh) => compileAttention((sh.attention_path || []).map((el, i) => ({ id: `${sh.shot}.attention${i}`, frames: sh.frames, primary_focus: el })), owners.map((o) => ({ ...o, element: o.element })))).map((r, i) => ({ shot: score.shots[i].shot, errors: r.errors }));
  // art demand from the action graph, transform ownership of every rig, exact tiling
  S.art_demand = deriveArtDemands({ doc, plan, motionPlans });
  S.transform_ownership = doc.rigs.map((r) => ({ rig: r.id, ...validateTransformOwnership([{ id: `cam`, owner: "camera" }, { id: `${r.id}__root`, owner: "rig_root", parent: "cam" }, ...r.joints.map((j) => ({ id: `${r.id}.${j.id}`, owner: "joint", parent: j.parent_id ? `${r.id}.${j.parent_id}` : `${r.id}__root` }))]) }));
  S.tiling = checkTiling(doc.shots, doc.transitions, doc.stage?.total_frames ?? 7200);
  // typed direction inputs consumed when authored (absent → reported as missing, never invented)
  const phrases = opt(path.join(FILM, "story", "ACTION_PHRASES.json")), beats = opt(path.join(FILM, "story", "BEAT_MEDIA.json"));
  S.action_phrases = phrases ? phrases.map((ph) => ({ id: ph.id, ...compilePhrase(ph) })) : { missing: "story/ACTION_PHRASES.json (ActionPhrase per movement: owners, phases) not authored" };
  S.beat_media = beats ? routeBeatMedia(beats) : { missing: "story/BEAT_MEDIA.json (typed beats with content kinds) not authored" };
  S.cast_shadows = (doc.lighting?.cast_shadows || []).map((c) => { try { return { id: c.id, ...castShadow(c) }; } catch (e) { return { id: c.id, error: e.code, reason: e.human_readable_reason }; } });
  // contacts that declare morphology/support are checked as grips and as supported reaches (closest feasible returned, never clamped)
  S.contact_morphology = doc.actions.flatMap((a) => (a.contact_events || []).filter((c) => c.morphology).map((c) => ({ action: a.id, socket: c.source_socket, ...gripMorphology(c.morphology) })));
  S.supported_reach = doc.actions.filter((a) => a.support?.chain && a.support?.target).map((a) => { const r = solveContact({ root: a.support.root, chain: a.support.chain, target: a.support.target, rootMovable: !!a.support.root.bounds, supportCheck: a.support.segments ? (rt) => balance({ segments: a.support.segments.map((g) => ({ ...g, x: g.x + (rt.x - a.support.root.x) })), support_x: a.support.support_x, family: a.support.family }) : null }); return { action: a.id, ok: r.ok, residual_px: r.residual_px, residual_deg: r.residual_deg, failures: r.failures }; });
  // continuous transitions: OUT/MIDDLE/IN + shared aperture + rim occluder declared in the contract
  S.portals = (doc.transitions || []).filter((t) => t.mode === "CONTINUOUS").map((t) => { const ap = t.mask_or_occluder_ids?.[0]; return { id: `${t.from_shot}->${t.to_shot}`, ...validatePortal({ out_plate: t.out_asset_ids?.[0] && { aperture_id: ap }, middle_plate: t.middle_asset_ids?.[0], in_plate: t.in_asset_ids?.[0] && { aperture_id: ap }, aperture_curve: ap && { id: ap }, rim_occluder: t.mask_or_occluder_ids?.[1] || null }) }; });
  report.blockers = { story: S.story.failures.length, uncompiled_actions: S.actions.reduce((n, a) => n + a.errors.length, 0), continuity: S.continuity.length, inert_attention: S.attention.reduce((n, a) => n + a.errors.length, 0), missing_art_states: S.art_demand.missing.length, transform_ownership: S.transform_ownership.filter((x) => !x.ok).length, tiling: S.tiling.failures.length, action_phrases: Array.isArray(S.action_phrases) ? S.action_phrases.filter((x) => !x.ok).length : 1, beat_media: Array.isArray(S.beat_media) ? 0 : 1, contact_morphology: S.contact_morphology.filter((x) => !x.ok).length, supported_reach: S.supported_reach.filter((x) => !x.ok).length, portals: S.portals.filter((x) => !x.ok).length, cast_shadows: S.cast_shadows.filter((x) => x.error).length };
  fs.mkdirSync(path.join(FILM, "story"), { recursive: true }); fs.writeFileSync(path.join(FILM, "story", "FILM_CONTRACT_REPORT.json"), JSON.stringify(report, null, 1));
  return report;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) { const a = process.argv.slice(2), film = a[a.indexOf("--film") + 1]; const r = compileFilmContracts({ film }); console.log(JSON.stringify(r.blockers)); }
