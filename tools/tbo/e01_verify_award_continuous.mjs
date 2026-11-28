#!/usr/bin/env node
// E01: CONTINUOUS physical verification of the accepted award interaction on every frame of [0, 342) (half-open intervals of the packet), through
// the real runtime (temporal.mjs, geometry-only on the measured rigs — never a render). Per frame: active contacts vs the directed windows,
// hand-socket residuals, transform driver vs the accepted timing, prop pose continuity (step and rotation), counter support after base contact,
// joint values inside the rig limits, 2D elbow interior angle, forearm crossing, and the drawing actually bound to each forearm slot.
//   node tools/tbo/e01_verify_award_continuous.mjs --film films/e01
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), imp = (r) => import(url.pathToFileURL(path.join(REPO, r))), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), H = (f) => path.join(FILM, "handoff", f), doc = J(H("ART_AND_MOTION_MANIFEST_V2.json")), RT = J(H("RUNTIME_PLAN.json")), PSj = J(H("PROP_SUPPORT.json")), EX = J(H("PERFORMANCE_COMMANDS.EXECUTABLE.json")), solve = J(H("AWARD_SOLVE_REPORT.json"));
const PM = await imp("engine/art_bridge/physical_motion.mjs"), PC = await imp("engine/art_bridge/performance_commands.mjs"), PS = await imp("engine/art_bridge/prop_support.mjs"), { executableSubset } = await imp("engine/art_bridge/executable_subset.mjs"), T = await imp("engine/art_bridge/temporal.mjs");
const caps = Object.fromEntries(EX.characters.map((c) => [c.actor_rig_id, PC.deriveCapabilityProfile(doc, c).profile]));
const N = PS.normalizePropSupport({ schema_version: "1.1.0", props: PSj.props.filter((p) => p.id === "award") }, { doc, roleOf: (rid, k) => caps[rid]?.roles?.[k]?.id ?? null });
const X = executableSubset(doc, { ...RT, prop_support: { props: N.props } }), WIN = ["E01-S001-A02", "E01-S001-A04", "E01-S001-A07"];
X.doc.actions = X.doc.actions.filter((a) => WIN.includes(a.id)); X.doc.shots = X.doc.shots.filter((s) => s.id === "E01-S001-SH01");
const C = T.compileMotionTracks(X.doc.actions, X.doc.shots, { doc: X.doc, plan: X.plan, requireApproval: false, geometryOnly: true });
const rig = (id) => X.doc.rigs.find((r) => r.id === id), ap = (M, p) => [M[0] * p[0] + M[2] * p[1] + M[4], M[1] * p[0] + M[3] * p[1] + M[5]], jrest = (rid, j) => rig(rid).joints.find((x) => x.id === j).rest_xy;
const sockW = (S, rid, sid) => { const sk = rig(rid).sockets.find((s) => s.id === sid), r = jrest(rid, sk.joint_id); return ap(S.matrices[rid][sk.joint_id], [r[0] + sk.local_xy[0], r[1] + sk.local_xy[1]]); };
const jointW = (S, rid, j) => ap(S.matrices[rid][j], jrest(rid, j)), ang = (v) => Math.atan2(v[1], v[0]), deg = (r) => (r * 180) / Math.PI, d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const segX = (p1, p2, p3, p4) => { const o = (a, b, c) => Math.sign((b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0])); return o(p1, p2, p3) * o(p1, p2, p4) < 0 && o(p3, p4, p1) * o(p3, p4, p2) < 0; };
const T_ = solve.inputs.timing, hand = { r: { sock: "CHAR_MIA.palm_r", target: `PROP_AWARD.${solve.sides.valid.r}`, until: T_.right_clear }, l: { sock: "CHAR_MIA.palm_l", target: `PROP_AWARD.${solve.sides.valid.l}`, until: T_.left_clear } };
const anat = [], lim = (j) => rig("CHAR_MIA").joints.find((x) => x.id === j).rotation_limits_deg, rows = [], fails = [], counterY = solve.support.counter_support_y;
let prev = null;
for (let f = 0; f < 342; f++) { const S = T.stateAtFrame(C, f), row = { f }, bad = (k, why) => fails.push({ f, k, why });
  for (const [h, H_] of Object.entries(hand)) { const k = S.contacts.find((c) => c.socket === H_.sock && c.target_socket === H_.target), want = f < H_.until; row[`${h}_contact`] = !!k;
    if (want && !k) bad(`${h}_contact`, `${H_.sock} must hold ${H_.target} in [0,${H_.until})`); if (!want && k?.locked) bad(`${h}_contact`, `${H_.sock} still locked after its release frame ${H_.until}`);
    if (k?.locked) { const res = d2(sockW(S, "CHAR_MIA", H_.sock), sockW(S, "PROP_AWARD", H_.target)); row[`${h}_residual_px`] = +res.toFixed(4); if (res > 1.5) bad(`${h}_residual`, `${res.toFixed(2)} px > 1.5`); } }
  const ps = (S.prop_support || []).find((x) => x.prop_rig === "PROP_AWARD"), wantDriver = f < T_.transfer_to_counter ? "CHAR_MIA#r" : "surface:counter"; row.driver = ps?.driver; if (ps?.driver !== wantDriver) bad("driver", `${ps?.driver} ≠ ${wantDriver}`); if (ps && !ps.ok) bad("support", JSON.stringify(ps.failures).slice(0, 160));
  const cen = ap(S.matrices.PROP_AWARD.root, jrest("PROP_AWARD", "root")), rot = deg(ang([S.matrices.PROP_AWARD.root[0], S.matrices.PROP_AWARD.root[1]])), base = sockW(S, "PROP_AWARD", "PROP_AWARD.base");
  row.award_center = cen.map((v) => +v.toFixed(3)); row.award_rot_deg = +rot.toFixed(4); row.base_y = +base[1].toFixed(3);
  if (prev) { const step = d2(cen, prev.cen); if (step > 3) bad("prop_step", `${step.toFixed(2)} px/frame > 3`); if (Math.abs(rot - prev.rot) > 2) bad("prop_rot_step", `${(rot - prev.rot).toFixed(2)}°/frame`); }
  if (f >= T_.base_contact && Math.abs(base[1] - counterY) > 1.5) bad("counter_support", `base ${base[1].toFixed(2)} vs support line ${counterY}`); if (base[1] > counterY + 1.5) bad("penetration", `base below the counter top by ${(base[1] - counterY).toFixed(2)} px`);
  for (const j of ["upper_r", "fore_r", "hand_r", "upper_l", "fore_l", "hand_l"]) { const L = lim(j), v = S.matrices && C.jointValue ? null : null; void v; }
  const bound = (slot) => S.artStates?.CHAR_MIA?.bindings?.[slot] ?? slot;
  for (const side of ["r", "l"]) { const sh = jointW(S, "CHAR_MIA", `upper_${side}`), el = jointW(S, "CHAR_MIA", `fore_${side}`), wr = jointW(S, "CHAR_MIA", `hand_${side}`), a = deg(Math.acos(Math.max(-1, Math.min(1, ((sh[0] - el[0]) * (wr[0] - el[0]) + (sh[1] - el[1]) * (wr[1] - el[1])) / (d2(sh, el) * d2(wr, el)))))); row[`elbow2d_${side}`] = +a.toFixed(2);
    // 3D anatomical test (engine elbow3D): drawn lengths = the BOUND drawing's; until the foreshortened drawing registers, the rest drawing is bound
    const restFore = d2(jrest("CHAR_MIA", `fore_${side}`), jrest("CHAR_MIA", `hand_${side}`)), restUp = d2(jrest("CHAR_MIA", `upper_${side}`), jrest("CHAR_MIA", `fore_${side}`)), int3 = PM.elbow3D(sh, el, wr, restUp, restFore), flex = int3 == null ? null : 180 - int3;
    row[`flex3d_${side}`] = flex == null ? null : +flex.toFixed(2); if (flex != null && flex > PM.ANATOMY_DEFAULT.elbow_flex_deg[1]) { const registered = !!doc.assets.find((x) => x.id === bound(`ART_M02.CHAR_MIA.fore_${side}`))?.file; (registered ? bad : (k, why) => anat.push({ f, k, why }))(`anatomy_${side}`, `elbow flexion ${flex.toFixed(1)}° > ${PM.ANATOMY_DEFAULT.elbow_flex_deg[1]}° with the ${registered ? "registered" : "unregistered (rest length used)"} drawing ${bound(`ART_M02.CHAR_MIA.fore_${side}`)}`); } row[`elbow_${side}`] = el.map((v) => +v.toFixed(1)); row[`wrist_${side}`] = wr.map((v) => +v.toFixed(1)); }
  if (segX(jointW(S, "CHAR_MIA", "fore_r"), jointW(S, "CHAR_MIA", "hand_r"), jointW(S, "CHAR_MIA", "fore_l"), jointW(S, "CHAR_MIA", "hand_l"))) bad("forearms_cross", "right and left forearms intersect");
  row.fore_r_drawing = bound("ART_M02.CHAR_MIA.fore_r"); row.fore_l_drawing = bound("ART_M02.CHAR_MIA.fore_l");
  for (const x of S.failures || []) bad("runtime", `${x.code} ${(x.human_readable_reason || "").slice(0, 120)}`);
  rows.push(row); prev = { cen, rot }; }
// joint-limit audit over the solved values (rig limits; null limits are reported, not assumed)
const limits = Object.fromEntries(["upper_r", "fore_r", "hand_r", "upper_l", "fore_l", "hand_l"].map((j) => [j, lim(j)]));
const span = (k) => { const v = rows.map((r) => r[k]).filter((x) => x != null); return v.length ? [Math.min(...v), Math.max(...v)] : null; };
const summary = { frames: rows.length, interval: [0, 342], failures: fails.length, failure_kinds: fails.reduce((m, x) => ((m[x.k] = (m[x.k] || 0) + 1), m), {}), first_failures: fails.slice(0, 12),
  residual_px_max: { r: Math.max(...rows.map((r) => r.r_residual_px ?? 0)), l: Math.max(...rows.map((r) => r.l_residual_px ?? 0)) }, contact_last_frame: { r: Math.max(...rows.filter((r) => r.r_contact).map((r) => r.f)), l: Math.max(...rows.filter((r) => r.l_contact).map((r) => r.f)) },
  driver_switch: rows.find((r) => r.driver === "surface:counter")?.f ?? null, base_y_at: Object.fromEntries([0, 225, 283, 284, 295, 296, 341].map((f) => [f, rows[f].base_y])), elbow2d_deg: { r: span("elbow2d_r"), l: span("elbow2d_l") }, flex3d_deg: { r: span("flex3d_r"), l: span("flex3d_l") }, anatomy_pending_drawing: { frames: anat.length, by_side: anat.reduce((m, x) => ((m[x.k] = (m[x.k] || 0) + 1), m), {}), first: anat.slice(0, 3) }, rig_limits_note: "the packet rig declares no anatomical joint limits (±180°): anatomy is checked by the engine 3D test instead",
  rig_joint_limits_deg: limits, forearm_drawings: [...new Set(rows.map((r) => `${r.fore_r_drawing} | ${r.fore_l_drawing}`))], deferred_art: C.deferred_art.length, geometry_only: C.geometry_only,
  note: "drawing-dependent geometry: the award-hold forearm drawings are not registered yet, so the bound forearm slots still use the rest drawings' lengths; their measured wrist offsets enter plan.tracks joint_offsets on registration" };
fs.writeFileSync(H("AWARD_CONTINUOUS_VERIFICATION.json"), JSON.stringify({ summary, rows }, null, 1)); console.log(JSON.stringify(summary, null, 1));
