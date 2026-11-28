#!/usr/bin/env node
// E01: semantic MOTION_PLAN → runtime plan (engine/story/runtime_plan.mjs) with the directed framings solved on registered geometry.
// Film data: SH01 is LOCKED at world scale (Mia head 174 px = her registered cranium_top→chin at scale 1; amendment 02); SH03 directs Mia's head
// at 250 px (range 230–270), "Mia center"; SH02's page insert needs the report page's world pose in Mia's reading hold (PENDING until solved).
//   node tools/tbo/e01_runtime_plan.mjs --film films/e01
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), H = (f) => path.join(FILM, "handoff", f), doc = J(H("ART_AND_MOTION_MANIFEST_V2.json")), plan = J(H("MOTION_PLAN.json")), solve = J(H("AWARD_SOLVE_REPORT.json"));
const { compileRuntimePlan, headCamera } = await import(url.pathToFileURL(path.join(REPO, "engine/story/runtime_plan.mjs")));
const mia = doc.identities.find((i) => i.id === "CHAR_MIA"), rig = doc.rigs.find((r) => r.id === "CHAR_MIA"), rest = rig.joints.find((j) => !j.parent_id).rest_xy, act = doc.actions.find((a) => a.actors.some((x) => x.rig_id === "CHAR_MIA")), pl = act.actors.find((x) => x.rig_id === "CHAR_MIA");
const W = (p) => [pl.root_world_xy[0] + (p[0] - rest[0]) * (pl.root_scale ?? 1), pl.root_world_xy[1] + (p[1] - rest[1]) * (pl.root_scale ?? 1)], crown = W(mia.landmarks.cranium_top), chin = W(mia.landmarks.chin), ref = mia.on_stage_reference;
const sh01Head = Math.abs(chin[1] - crown[1]);
const cams = {
  CAM_SH01: { x: doc.stage.width / 2, y: doc.stage.height / 2, zoom: 1, rot: 0, derivation: { rule: "LOCKED world-scale camera: Mia's registered cranium_top→chin at her staged scale is the directed SH01 head", measured_head_px: +sh01Head.toFixed(2), directed_px: ref.px, range_px: ref.range_px, in_range: sh01Head >= ref.range_px[0] && sh01Head <= ref.range_px[1] } },
  CAM_SH03: headCamera({ stage: doc.stage, headTopWorld: crown, chinWorld: chin, directedHeadPx: ref.projections.find((p) => p.shot === "E01-S001-SH03").px, frameFraction: [0.5, 1 / 3], derivation: { rule: "SH03 directed head 250 px (amendment 02 projection), 'Mia center' horizontally, head centre on the upper third" } }) };
const awardCenter = solve.inputs.hold_center;
const rt = compileRuntimePlan({ doc, plan, cameraSolutions: cams, propPlacements: { PROP_AWARD: { x: awardCenter[0], y: awardCenter[1], scale: 1, from: "AWARD_SOLVE_REPORT hold centre (support contract drives it from f0)" } } });
// visibility of the directed subjects in SH03 (frame coordinates of the measured world points under the solved camera)
const c3 = cams.CAM_SH03, toF = ([x, y]) => [(x - c3.x) * c3.zoom + doc.stage.width / 2, (y - c3.y) * c3.zoom + doc.stage.height / 2];
rt.camera_checks = { SH03: { mia_head_frame: [toF(crown), toF(chin)].map((p) => p.map((v) => +v.toFixed(1))), regular_root_frame: toF([375, 1020]).map((v) => +v.toFixed(1)), award_counter_base_frame: toF([1007, solve.support.counter_support_y]).map((v) => +v.toFixed(1)) } };
fs.writeFileSync(H("RUNTIME_PLAN.json"), JSON.stringify(rt, null, 1)); console.log(JSON.stringify({ cameras: Object.keys(rt.cameras), camera_derivations: rt.camera_derivations, camera_checks: rt.camera_checks, placements: Object.keys(rt.placements), pending: rt.pending }, null, 1));
