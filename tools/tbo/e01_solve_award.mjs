#!/usr/bin/env node
// E01: physical solve of the award hold → lower → counter transfer → releases (directive items 3–5), on MEASURED geometry only:
//  - Mia's measured rig and directed root (world = frame px), the award's registered sockets (scale 1), the restaurant counter support socket
//    (world placement of amendment 08), the accepted performance timing (MOTION_PLAN.support.award);
//  - hand→socket sides decided by geometry (contactSides), wrist from palm socket offset, elbow from the DRAWN lengths of the bound drawings
//    with the 3D anatomical test (engine physical_motion);
//  - outputs (1) the drawing specification of the foreshortened award-hold forearms (drawn-length range that solves every frame anatomically),
//    (2) the PROP_SUPPORT v1.1 contract for the runtime (one driver per frame, ACTOR_DRIVEN driver path, explicit transfer), (3) a solve report.
// The runtime (temporal.mjs prop support + contact IK) consumes the contract; nothing here renders or replaces the runtime solver.
//   node tools/tbo/e01_solve_award.mjs --film films/e01 [--out <dir>]
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const PM = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/physical_motion.mjs"))), { ev } = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/temporal.mjs"))), { validate } = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/jsonschema.mjs")));
const FILM = path.resolve(REPO, arg("film")), OUT = path.resolve(arg("out") || path.join(FILM, "handoff")), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan = J(path.join(FILM, "handoff", "MOTION_PLAN.json"));
// ---- film data ----
const ACTOR = "CHAR_MIA", PROP = "PROP_AWARD", WORLD = { rig: "WORLD_RESTAURANT", root_xy: [1186, 470], scale: 0.5 }; // amendment 08 placement
const HOLD_CENTER = [1007, 859]; // award centre as painted in Mia's approved master hold (world px under her directed root)
const T = plan.support.award; // accepted timing: base_contact 284, valid 295, transfer 296, right_clear 306, left_clear 320, left_settle 342
const BODY_TURN = 306; // body to_lead from 306 (amendment 07): limbs switch to the to_lead drawings
// ---- measured geometry ----
const rig = doc.rigs.find((r) => r.id === ACTOR), J_ = (id) => rig.joints.find((j) => j.id === id), act = doc.actions.find((a) => a.actors.some((x) => x.rig_id === ACTOR)), place = act.actors.find((x) => x.rig_id === ACTOR);
const rootRest = J_("root").rest_xy, s = place.root_scale ?? 1, W = (p) => [place.root_world_xy[0] + (p[0] - rootRest[0]) * s, place.root_world_xy[1] + (p[1] - rootRest[1]) * s];
const prig = doc.rigs.find((r) => r.id === PROP), psock = (id) => prig.sockets.find((x) => x.id === `${PROP}.${id}`).local_xy, propAt = (c) => (id) => [c[0] + psock(id)[0], c[1] + psock(id)[1]];
const wr = doc.rigs.find((r) => r.id === WORLD.rig), wsock = wr.sockets.find((x) => x.id === `${WORLD.rig}.counter_support`), wroot = wr.joints.find((j) => !j.parent_id).rest_xy;
// support line: the REGISTERED socket when its registration matches the authorized construction; otherwise the authorized construction spec
// (constructed geometry is exact; spec units x construction scale = native px) — reported as pending re-registration, never silently mixed
const spec = J(path.join(FILM, "environment", "ART_ENV01.MASTER.spec.json")), k = spec.scale, toW = ([x, y]) => [WORLD.root_xy[0] + (x * k - spec.landmarks.room_origin[0] * k) * WORLD.scale, WORLD.root_xy[1] + (y * k - spec.landmarks.room_origin[1] * k) * WORLD.scale];
const regY = WORLD.root_xy[1] + wsock.local_xy[1] * WORLD.scale, specY = toW(spec.landmarks.counter_support)[1], counterY = specY, counterSource = Math.abs(regY - specY) < 0.5 ? "REGISTERED" : `CONSTRUCTION_SPEC (registered socket ${regY.toFixed(1)} is the pre-amendment-08 counter; re-registration pending)`;
const L = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]), palm = (h) => rig.sockets.find((x) => x.id === `${ACTOR}.palm_${h}`);
const limb = (h) => { const up = J_(`upper_${h}`), fo = J_(`fore_${h}`), ha = J_(`hand_${h}`); const rest1 = Math.atan2(fo.rest_xy[1] - up.rest_xy[1], fo.rest_xy[0] - up.rest_xy[0]), rest2 = Math.atan2(ha.rest_xy[1] - fo.rest_xy[1], ha.rest_xy[0] - fo.rest_xy[0]);
  return { h, shoulder: W(up.rest_xy), upperTrue: L(up.rest_xy, fo.rest_xy) * s, foreTrue: L(fo.rest_xy, ha.rest_xy) * s, bend: PM.restBend(up.rest_xy, fo.rest_xy, ha.rest_xy), palmLocal: palm(h).local_xy }; };
const LIMB = { r: limb("r"), l: limb("l") };
// ---- (a) sides from geometry ----
const sides = PM.contactSides({ shoulders: { r: LIMB.r.shoulder, l: LIMB.l.shoulder }, sockets: { grip_r: propAt(HOLD_CENTER)("grip_r"), grip_l: propAt(HOLD_CENTER)("grip_l") }, declared: { r: "grip_r", l: "grip_l" } });
// ---- (b) award centre path: hold, lower so the base meets the support line at base_contact, then surface-held ----
const baseOff = psock("base")[1], contactCenterY = counterY - baseOff, centre = { x: [[0, HOLD_CENTER[0]]], y: [[0, HOLD_CENTER[1]], [225, HOLD_CENTER[1], "hold"], [T.base_contact, contactCenterY, "sine.inOut"]] };
const C = (f) => [ev(centre.x, f), ev(centre.y, f)];
// ---- (c) per-frame limb solve while each hand holds (body to_regular only: the award_hold drawings) ----
const holdEnd = { r: Math.min(T.right_clear, BODY_TURN), l: Math.min(T.left_clear, BODY_TURN) }, targets = { r: [], l: [] };
for (const h of ["r", "l"]) for (let f = 0; f < holdEnd[h]; f++) { const P = propAt(C(f))(sides.valid[h]), wrist = PM.wristFromPalm(P, 0, LIMB[h].palmLocal, s); targets[h].push({ frame: f, shoulder: LIMB[h].shoulder, wrist, palm: P }); }
const req = {}, restCheck = {};
// outward = from the OTHER shoulder toward this one (geometry); a hanging elbow may sit at most ELBOW_INWARD_PX inside its shoulder line
const ELBOW_INWARD_PX = 12, outward = (h) => { const o = h === "r" ? "l" : "r", v = [LIMB[h].shoulder[0] - LIMB[o].shoulder[0], LIMB[h].shoulder[1] - LIMB[o].shoulder[1]], n = Math.hypot(...v); return [v[0] / n, v[1] / n]; };
for (const h of ["r", "l"]) { const Lb = LIMB[h], lat = { outward: outward(h), maxInwardPx: ELBOW_INWARD_PX };
  const tries = [Lb.bend, -Lb.bend].map((bend) => ({ bend, r: PM.projectionRequirement({ targets: targets[h], upperDrawn: Lb.upperTrue, upperTrue: Lb.upperTrue, foreTrue: Lb.foreTrue, bend, ...lat }) }));
  const pick = tries.find((t) => t.r.feasible) || tries[0], base = { upperDrawn: Lb.upperTrue, upperTrue: Lb.upperTrue, foreTrue: Lb.foreTrue, bend: pick.bend, ...lat };
  req[h] = { ...pick.r, bend: pick.bend, rest_pose_bend: Lb.bend, other_side: tries.find((t) => t !== pick).r.feasible ? "also feasible" : "infeasible", elbow_lateral: `outer side of the shoulder, ≤ ${ELBOW_INWARD_PX} px inside` };
  const sample = (p) => targets[h].map((t) => ({ f: t.frame, r: PM.solveProjectedLimb({ shoulder: t.shoulder, wrist: t.wrist, foreDrawn: p, ...base, elbowBelowShoulder: true }) }));
  const restFail = sample(Lb.foreTrue).filter((x) => !x.r.ok); restCheck[h] = { rest_drawing_fails_frames: restFail.length, of: targets[h].length, first_reason: restFail[0]?.r.reasons.join("; ") ?? null };
  if (req[h].feasible) { const sol = sample(req[h].recommended_px); req[h].at_recommended = { elbow_flex_deg: [Math.min(...sol.map((x) => x.r.elbow_flex_deg)), Math.max(...sol.map((x) => x.r.elbow_flex_deg))].map((v) => +v.toFixed(1)), elbow_world_f0: sol[0].r.elbow.map((v) => +v.toFixed(1)), elbow_world_last: sol.at(-1).r.elbow.map((v) => +v.toFixed(1)), wrist_world_f0: targets[h][0].wrist.map((v) => +v.toFixed(1)), forearm_dir_deg_f0: +((Math.atan2(targets[h][0].wrist[1] - sol[0].r.elbow[1], targets[h][0].wrist[0] - sol[0].r.elbow[0]) * 180) / Math.PI).toFixed(1) }; } }
// ---- set-down point: the counter is a SURFACE. Its registered support socket fixes the support LINE (y); the set-down x is where the solved
// lowering meets that line (Mia's hold centre). The point must lie on the counter top of the authorized construction (its gCtr polygon at y). ----
const cspec = J(path.join(FILM, "environment", "ART_ENV01.counter.spec.json")), topPoly = JSON.stringify(cspec.layers).includes("gCtr") ? (function find(o) { if (Array.isArray(o)) { for (const x of o) { const r = find(x); if (r) return r; } return null; } if (o && typeof o === "object") { if (o.t === "poly" && /gCtr/.test(o.fill || "")) return o.pts; for (const v of Object.values(o)) { const r = find(v); if (r) return r; } } return null; })(cspec.layers) : null;
const spanAt = (pts, y) => { const xs = []; for (let i = 0; i < pts.length; i++) { const a = pts[i], b = pts[(i + 1) % pts.length]; if ((a[1] - y) * (b[1] - y) <= 0 && a[1] !== b[1]) xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1])); } return xs.length >= 2 ? [Math.min(...xs), Math.max(...xs)] : null; };
const specToWorld = (v) => v; // the counter spec's units are world px under the amendment-08 placement (verified: counter_support (1150,945) = registered socket)
const counterSpan = topPoly ? spanAt(topPoly.map(specToWorld), counterY) : null, setDown = [+C(T.base_contact)[0].toFixed(3), counterY];
if (!counterSpan || setDown[0] < counterSpan[0] || setDown[0] > counterSpan[1]) throw new Error(`set-down x ${setDown[0]} is not on the counter top ${JSON.stringify(counterSpan)}`);
// ---- (d) PROP_SUPPORT v1.1 contract for the runtime ----
const drv = sides.valid.r === "grip_l" ? "r" : "l", sup = drv === "r" ? "l" : "r", path_ = (k) => [...new Map([...Array(T.base_contact + 1).keys()].filter((f) => f === 0 || f % 4 === 0 || f === T.base_contact).map((f) => [f, +propAt(C(f))(sides.valid[drv])[k].toFixed(3)])).entries()];
const contract = { schema_version: "1.1.0", props: [{ id: "award", prop_rig_id: PROP, test_id: "E01-AWARD-SUPPORT", max_step_px: 3, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5,
  human_quality_check: "both hands carry the plaque without crossing; it lowers onto the counter; the counter takes it; right then left let go",
  hands: [{ ref: `${ACTOR}#${drv}`, prop_socket: `${PROP}.${sides.valid[drv]}` }, { ref: `${ACTOR}#${sup}`, prop_socket: `${PROP}.${sides.valid[sup]}` }],
  surfaces: [{ id: "counter", prop_socket: `${PROP}.base`, target: { world_xy: setDown }, frames: [T.base_contact, doc.stage.total_frames] }],
  authority: [{ frames: [0, T.base_contact], driver: `${ACTOR}#${drv}`, required_supports: [`${ACTOR}#${sup}`], mode: "ACTOR_DRIVEN", driver_path: { x: path_(0), y: path_(1) } },
    { frames: [T.base_contact, T.transfer_to_counter], driver: `${ACTOR}#${drv}`, required_supports: [`${ACTOR}#${sup}`, "surface:counter"], mode: "ACTOR_DRIVEN", driver_path: { x: [[T.base_contact, path_(0).at(-1)[1]]], y: [[T.base_contact, path_(1).at(-1)[1]]] } },
    { frames: [T.transfer_to_counter, doc.stage.total_frames], driver: "surface:counter", required_supports: [], mode: "SURFACE_DRIVEN" }] }] };
const S = J(path.join(REPO, "schemas", "prop_support_v1.schema.json")), schemaErr = validate(S, contract);
const support = { set_down_world: setDown, counter_top_span_at_support: counterSpan, counter_source: counterSource, base_world_y_at_contact: +(C(T.base_contact)[1] + baseOff).toFixed(2), counter_support_y: counterY, residual_px: +Math.abs(C(T.base_contact)[1] + baseOff - counterY).toFixed(3), lowering_px: +(contactCenterY - HOLD_CENTER[1]).toFixed(2) };
const report = { generated_by: "tools/tbo/e01_solve_award.mjs", inputs: { manifest_rig: ACTOR, root_world: place.root_world_xy, root_scale: s, hold_center: HOLD_CENTER, timing: T, counter_socket: wsock.id, world_placement: WORLD },
  sides, limbs: Object.fromEntries(Object.entries(LIMB).map(([h, b]) => [h, { shoulder_world: b.shoulder.map((v) => +v.toFixed(1)), upper_true_px: +b.upperTrue.toFixed(2), fore_true_px_elbow_to_wrist: +b.foreTrue.toFixed(2), bend: b.bend }])),
  rest_forearm_drawing: restCheck, foreshortened_forearm_requirement: req, support, contract_schema_errors: schemaErr.map((e) => `${e.path}: ${e.msg}`),
  runtime_binding: "PROP_SUPPORT contract → plan.performance.prop_support (compilePerformance → temporal prop support + contact IK); the hold window solves only with the fore_*__award_hold drawings bound (their MEASURED drawn length replaces the requirement once registered)" };
// runtime inputs: the approved IK branch of each holding arm over its hold window (from the solve above), and what is still pending
const chainOf = (h) => doc.rigs.find((r) => r.id === ACTOR).constraints.find((c) => c.type === "TWO_BONE_IK" && c.chain[0] === `upper_${h}`);
const ik_branches = ["r", "l"].filter((h) => req[h].feasible && req[h].bend !== chainOf(h).bend_sign).map((h) => ({ rig: ACTOR, chain: chainOf(h).chain, frames: [0, holdEnd[h]], bend_sign: req[h].bend,
  evidence: `tools/tbo/e01_solve_award.mjs: rest-pose branch ${chainOf(h).bend_sign} puts the elbow inside the shoulder or hyperflexes for the award hold; branch ${req[h].bend} solves every frame with the elbow outside (flexion ${req[h].at_recommended.elbow_flex_deg.join("–")}°)` }));
const physical = { generated_by: report.generated_by, ik_branches, prop_support_contract: contract, pending: [
  "fore_r__award_hold / fore_l__award_hold: drawn elbow→wrist length must lie in the required range; once registered their MEASURED wrist offset becomes plan.tracks.CHAR_MIA.joint_offsets.hand_* while bound",
  "plan.performance (PerformanceCommand packet with reviewed hand role maps) to activate the prop support contract in the runtime",
  ...(support.counter_source === "REGISTERED" ? [] : ["restaurant re-registration (counter support socket)"])] };
fs.mkdirSync(OUT, { recursive: true }); fs.writeFileSync(path.join(OUT, "PROP_SUPPORT_AWARD.json"), JSON.stringify(contract, null, 1)); fs.writeFileSync(path.join(OUT, "PHYSICAL_SOLVE.json"), JSON.stringify(physical, null, 1)); fs.writeFileSync(path.join(OUT, "AWARD_SOLVE_REPORT.json"), JSON.stringify(report, null, 1));
console.log(JSON.stringify({ ...report, inputs: undefined }, null, 1)); if (schemaErr.length) process.exit(1);
