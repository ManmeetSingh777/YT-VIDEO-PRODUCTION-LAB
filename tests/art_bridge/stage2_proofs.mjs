// Stage 2 acceptance proofs (spec §5 "Stage 2 acceptance" 1–10 + §7.5 negative matrix). Real Chrome frames through the preserved nu.js
// runtime; every proof pairs a succeeding construction with intentional failure injections. Fixtures are DIAGNOSTIC_FIXTURE only, so
// every criterion that the spec phrases as "real approved art" is reported artistically BLOCKED (mechanism demonstrated, art absent).
// Output: hybrid_v2/evidence/STAGE_2_MOTION_PROOF.json, frames under hybrid_v2/evidence/stage2/, raw work under hybrid_v2/work/stage2/.
import fs from "node:fs"; import path from "node:path"; import { execFileSync, spawnSync } from "node:child_process";
import { loadScene, renderFrames, readPNG, centroid, near, countColour, pixel, stateAtFrame, composeShot, FIX, REPO, EVID, WORK, sha, rel } from "./stage2_lib.mjs";
import { launch } from "../../engine/art_bridge/render.mjs";
import { apply, dist, mul, T as Tm } from "../../engine/art_bridge/math2d.mjs";
import { runCheck } from "../../engine/tools/art_bridge_check.mjs";
import { compileMotionTracks } from "../../engine/art_bridge/temporal.mjs";
import { missingArtJobs } from "../../engine/art_bridge/art_requests.mjs";
import { assetStateCoverage } from "../../engine/art_bridge/asset_state.mjs";
import { validateStateEdge, anchorResiduals } from "../../engine/art_bridge/state_router.mjs";
import { registerPart } from "../../engine/art_bridge/registration.mjs";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
import { footSlideReport } from "../../engine/tools/art_bridge_qa.mjs";

const only = process.argv.slice(2), want = (id) => !only.length || only.includes(id);
const clone = (o) => JSON.parse(JSON.stringify(o)), M = (k) => JSON.parse(fs.readFileSync(path.join(FIX, "stage2", `scene_${k}.manifest.json`), "utf8")), PL = (k) => JSON.parse(fs.readFileSync(path.join(FIX, "stage2", `scene_${k}.plan.json`), "utf8"));
fs.mkdirSync(EVID, { recursive: true });
const keep = (proof, files) => { const d = path.join(EVID, "frames", proof); fs.mkdirSync(d, { recursive: true }); return files.map((f) => { const t = path.join(d, path.basename(f)); fs.copyFileSync(f, t); return { file: rel(t), sha256: sha(t) }; }); };
async function checkManifest(doc, tag) { const f = path.join(FIX, "_tmp", `${tag}.json`); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(doc)); const r = await runCheck({ root: FIX, manifest: path.relative(FIX, f) }); return { pass: r.pass, codes: [...new Set(r.errors.map((e) => e.code))], first: r.errors[0] || null, art_jobs: r.art_jobs.map((j) => ({ id: j.artjob_id, state_kind: j.state_kind, root_dependency: j.root_dependency })) }; }
function compileErr(doc, plan) { try { compileMotionTracks(doc.actions, doc.shots, { doc, plan }); return { threw: false, codes: [] }; } catch (e) { return { threw: true, codes: [...new Set((e.errors || [e]).map((x) => x.code))], first: (e.errors || [e])[0]?.toJSON?.() || null }; } }
const neg = (injection, expected, got, extra = {}) => ({ injection, expected, observed: got, pass: Array.isArray(expected) ? expected.some((c) => got.includes?.(c) || got === c) : got === expected || got.includes?.(expected), ...extra });
const PROOFS = [], browser = await launch(), t0 = Date.now();
const rec = (p) => { p.mechanical_status = p.mechanical_ok && p.negatives.every((n) => n.pass) ? "MECHANICAL_PASS" : "MECHANICAL_FAIL"; p.status = p.mechanical_status === "MECHANICAL_PASS" ? (p.artistic_dependency ? "MECHANICAL_PASS__ARTISTIC_BLOCKED" : "MECHANICAL_PASS") : "BLOCKED"; PROOFS.push(p); console.log(p.id, p.status, JSON.stringify(p.summary)); };

try {
/* 1 — image part under a joint, rest pose pixel identity */
if (want("P1")) {
  const S = await loadScene("P"), R = await renderFrames(S, 0, [5], "p1", { background: false, omitBackground: true, browser });
  const src = readPNG(path.join(FIX, "diag2/probe_arm.png")), out = readPNG(R.files[0]), st = stateAtFrame(S.C, 5), Mx = mul(st.passes[0].matrix, Tm(20, 20)), ox = Math.round(Mx[4] - 20), oy = Math.round(Mx[5] - 20);
  const m = { opaque_channel_diffs: 0, alpha_diff_max: 0, partial_premul_max: 0, pixels: 0, checker_light_max: 0, checker_dark_max: 0 };
  for (let y = 0; y < src.height; y++) for (let x = 0; x < src.width; x++) { const i = (y * src.width + x) * 4, j = ((oy + y) * 1920 + ox + x) * 4, a = src.rgba[i + 3], b = out.rgba[j + 3]; m.pixels++; m.alpha_diff_max = Math.max(m.alpha_diff_max, Math.abs(a - b));
    for (let c = 0; c < 3; c++) { if (a === 255 && src.rgba[i + c] !== out.rgba[j + c]) m.opaque_channel_diffs++; if (a > 0 && a < 255) m.partial_premul_max = Math.max(m.partial_premul_max, Math.abs(src.rgba[i + c] * a - out.rgba[j + c] * b) / 255);
      for (const [bg, k] of [[235, "checker_light_max"], [25, "checker_dark_max"]]) { const ck = ((x >> 3) + (y >> 3)) & 1 ? bg : bg - 20, s1 = (src.rgba[i + c] * a + ck * (255 - a)) / 255, s2 = (out.rgba[j + c] * b + ck * (255 - b)) / 255; m[k] = Math.max(m[k], Math.abs(s1 - s2)); } } }
  const dom = R.cap.domOrder, img = fs.readFileSync(path.join(R.comp.dir, "index.html"), "utf8").includes('<image id="p1-probe--probe_arm--probe_arm-image" href="assets/diag2/probe_arm.png"');
  const wrongPivot = clone(M("P")); wrongPivot.assets.find((a) => a.id === "probe_arm").pivot_xy = [26, 20];
  rec({ id: "S2-1", title: "Approved transparent image part renders in <image> under a moving joint, pixel-identical at rest", spec: "§5 Stage 2 acceptance 1; §5.2",
    source: ["engine/art_bridge/svg_parts.mjs#emitSpritePart", "engine/art_bridge/scene_graph.mjs#composeShot", "engine/art_bridge/render.mjs#capture"], input: "tests/art_bridge/fixtures/stage2/scene_P.manifest.json frame 5 (θ=0), omitBackground", output: m,
    mechanical_ok: R.cap.failures.length === 0 && img && m.opaque_channel_diffs === 0 && m.alpha_diff_max === 0 && m.partial_premul_max <= 1 && m.checker_light_max <= 1 && m.checker_dark_max <= 1,
    summary: { opaque_diff: m.opaque_channel_diffs, alpha_diff: m.alpha_diff_max, partial_premul_max: +m.partial_premul_max.toFixed(3), checker: [+m.checker_light_max.toFixed(3), +m.checker_dark_max.toFixed(3)] },
    tolerance: "opaque RGB and alpha exact; partial-alpha premultiplied ≤1/255 (straight↔premultiplied round trip in the compositor)", dom_paint_order: dom,
    negatives: [neg("pivot moved 6px without moving pixels", "UNREGISTERED_PIVOT", (await checkManifest(wrongPivot, "p1_pivot")).codes)],
    witness: keep("S2-1", R.files), artistic_dependency: "criterion names REAL approved art; only a DIAGNOSTIC_FIXTURE part exists" });
}
/* 2 — parent rotation moves child pixels and sockets; pivots stay registered at every angle */
if (want("P2")) {
  const S = await loadScene("P"), frames = [10, 55, 100, 145, 190, 235, 280, 325], R = await renderFrames(S, 0, frames, "p2", { browser });
  const rows = frames.map((f, k) => { const st = stateAtFrame(S.C, f), Mm = st.matrices.probe.arm, pred = apply(Mm, [20, 140]), c = centroid(readPNG(R.files[k]), near([255, 0, 0], 70)), piv = apply(Mm, [20, 20]); return { frame: f, angle: S.C.jointValue("probe", "arm", f), predicted_marker: pred, rendered_marker: c && [c.x, c.y], error_px: c ? dist(pred, [c.x, c.y]) : null, pivot_world: piv, socket_tip: S.C.socketWorld("probe", st.matrices.probe, "tip") }; });
  // child-of-parent on the real chain (scene A): elbow marker on upper arm, wrist marker on forearm, at several poses
  const A = await loadScene("A"), fa = [0, 60, 200, 400, 560, 585], RA = await renderFrames(A, 0, fa, "p2a", { browser });
  const chainRows = fa.map((f, k) => { const st = stateAtFrame(A.C, f), m = st.matrices.actor2, png = readPNG(RA.files[k]), e = apply(m.shoulder, [180, 178]), w = apply(m.elbow, [180, 262]), ce = centroid(png, near([0, 200, 0], 60), [e[0] - 20, e[1] - 20, e[0] + 20, e[1] + 20]), cw = centroid(png, near([255, 0, 0], 70), [w[0] - 20, w[1] - 20, w[0] + 20, w[1] + 20]);
    return { frame: f, elbow_pred: e, elbow_px: ce && [ce.x, ce.y], elbow_err: ce ? dist(e, [ce.x, ce.y]) : null, wrist_pred: w, wrist_px: cw && [cw.x, cw.y], wrist_err: cw ? dist(w, [cw.x, cw.y]) : null, elbow_n: ce?.n || 0, wrist_n: cw?.n || 0, elbow_joint_world: apply(m.elbow, [180, 230]), joint_gap_px: dist(apply(m.elbow, [180, 230]), apply(m.shoulder, [180, 230])) }; });
  // a marker blob partially hidden by a crossing part biases its centroid: only fully visible blobs are measured
  const fullE = Math.max(...chainRows.map((r) => r.elbow_n || 0)), fullW = Math.max(...chainRows.map((r) => r.wrist_n || 0));
  for (const r of chainRows) { if ((r.elbow_n || 0) < 0.85 * fullE) { r.elbow_occluded = true; r.elbow_err = null; } if ((r.wrist_n || 0) < 0.85 * fullW) { r.wrist_occluded = true; r.wrist_err = null; } }
  const maxE = Math.max(...rows.map((r) => r.error_px ?? 99)), pivMax = Math.max(...rows.map((r) => dist(r.pivot_world, [600, 300]))), chainVis = chainRows.filter((r) => r.elbow_err !== null || r.wrist_err !== null), chainMax = Math.max(...chainVis.flatMap((r) => [r.elbow_err ?? 0, r.wrist_err ?? 0]));
  const dupOwner = PL("A"); dupOwner.secondary.push({ id: "dup", rig: "actor2", joint: "elbow", driver: { rig: "crank2", joint: "wheel" }, stiffness: 1, damping: 1, gain: 0 });
  rec({ id: "S2-2", title: "Parent rotation moves child pixels and sockets together; pivots match registered landmarks at all angles", spec: "§5 Stage 2 acceptance 2", source: ["engine/art_bridge/temporal.mjs#stateAtFrame (fk)", "engine/art_bridge/scene_graph.mjs#composeShot"],
    input: "scene_P 8 angles 0..315°; scene_A shoulder→elbow→wrist chain at 6 poses", output: { probe: rows, chain: chainRows },
    mechanical_ok: R.cap.failures.length === 0 && RA.cap.failures.length === 0 && maxE < 0.5 && pivMax < 1e-9 && chainVis.length >= 4 && chainMax < 0.75 && chainRows.every((r) => r.joint_gap_px < 1e-9),
    summary: { probe_marker_max_err_px: +maxE.toFixed(3), pivot_drift: pivMax, chain_marker_max_err_px: +chainMax.toFixed(3), joint_gap_px: Math.max(...chainRows.map((r) => r.joint_gap_px)) },
    negatives: [neg("camera-free double ownership: same joint written by a track and a secondary track", "INVALID_TRANSFORM_OWNER", compileErr(clone(M("A")), dupOwner).codes)],
    witness: keep("S2-2", [R.files[0], R.files[3], R.files[6], RA.files[2], RA.files[5]]) });
}
/* 3 — hand grip locked through a full prop action; near/far layers cross the prop; impossible reach fails */
if (want("P3")) {
  const S = await loadScene("A"), frames = [20, 60, 89, 90, 91, 150, 210, 270, 330, 390, 450, 479, 480, 481, 520], R = await renderFrames(S, 0, frames, "p3", { browser });
  let maxNum = 0, locked = 0; for (let f = 90; f < 480; f++) { const st = stateAtFrame(S.C, f), c = st.contacts.find((x) => x.socket === "grip2"); maxNum = Math.max(maxNum, c.error_px); locked++; if (st.failures.length) throw new Error(`failure at ${f}`); }
  const rows = frames.map((f, k) => { const st = stateAtFrame(S.C, f), mm = st.matrices, hs = S.C.socketWorld("crank2", mm.crank2, "handle_grip2"), gs = S.C.socketWorld("actor2", mm.actor2, "grip2"), png = readPNG(R.files[k]);
    const cy = centroid(png, near([255, 220, 0], 50), [hs[0] - 25, hs[1] - 25, hs[0] + 25, hs[1] + 25]), along = apply(mm.crank2.wheel, [100, 74]), atSocket = pixel(png, gs[0], gs[1]), onHandle = pixel(png, along[0], along[1]);
    return { frame: f, locked: f >= 90 && f < 480, grip_world: gs, handle_world: hs, numeric_err_px: dist(gs, hs), yellow_handle_marker_px: cy && [cy.x, cy.y], marker_vs_handle_socket_px: cy ? dist([cy.x, cy.y], hs) : null, pixel_at_grip: atSocket, pixel_on_handle_below_grip: onHandle,
      near_fingers_over_handle: atSocket[0] > 200 && atSocket[1] > 150, handle_over_palm_far: onHandle[0] < 120 && onHandle[1] < 120 }; });
  const lockedRows = rows.filter((r) => r.locked), order = R.cap.domOrder.map((x) => x.replace("p3-", "")), idx = (s) => order.findIndex((x) => x.includes(s));
  const layering = { far_below_handle: idx("hand_far2") < idx("crank_handle2"), palm_below_handle: idx("hand_palm2") < idx("crank_handle2"), near_above_handle: idx("hand_near2") > idx("crank_handle2") };
  const unreach = clone(M("A")); unreach.actions[0].actors[1].root_world_xy = [1250, 500];
  const unreachPlan = PL("A"); const ur = (() => { const C = compileMotionTracks(unreach.actions, unreach.shots, { doc: unreach, plan: unreachPlan }); const fails = []; for (let f = 90; f < 480; f++) for (const e of stateAtFrame(C, f).failures) if (e.code === "UNREACHABLE_IK") fails.push({ f, missing: e.details.missingDistance }); return { frames: fails.length, first: fails[0], worst_missing_px: Math.max(...fails.map((x) => x.missing)) }; })();
  const noHand = clone(M("A")); noHand.assets = noHand.assets.filter((a) => a.id !== "hand_near2"); noHand.rigs[0].render_parts = noHand.rigs[0].render_parts.filter((p) => p.asset_id !== "hand_near2"); noHand.assets.forEach((a) => (a.draw_order_constraints = a.draw_order_constraints.filter((d) => d.asset_id !== "hand_near2")));
  const nh = await checkManifest(noHand, "p3_nohand");
  rec({ id: "S2-3", title: "Hand grip stays locked through the full crank action; near/far art layers cross the prop; impossible reach → UNREACHABLE_IK", spec: "§5 Stage 2 acceptance 3; §5.4 Grip; §11.3",
    source: ["engine/art_bridge/temporal.mjs#solveConstraints", "engine/art_bridge/constraints.mjs#solveTwoBonePosition", "engine/art_bridge/scene_graph.mjs#topoOrder"], input: "scene_A: GRIP [90,480) wheel 0→720°, approach 20–90, release 480–540", output: { rows, layering, every_locked_frame_numeric_max_err_px: maxNum, locked_frames_checked: locked },
    mechanical_ok: R.cap.failures.length === 0 && maxNum <= 0.5 && lockedRows.every((r) => r.marker_vs_handle_socket_px === null || r.marker_vs_handle_socket_px < 1.0) && lockedRows.every((r) => r.near_fingers_over_handle && r.handle_over_palm_far) && Object.values(layering).every(Boolean),
    summary: { locked_frames: locked, numeric_max_err_px: maxNum, layering, pixel_layer_checks: lockedRows.filter((r) => r.near_fingers_over_handle && r.handle_over_palm_far).length + "/" + lockedRows.length },
    negatives: [neg("crank moved beyond arm reach", "UNREACHABLE_IK", ur.frames > 0 ? "UNREACHABLE_IK" : "none", { detail: ur }),
      neg("approved near-finger hand asset deleted", ["MISSING_ART_ASSET"], nh.codes, { art_jobs: nh.art_jobs })],
    witness: keep("S2-3", [R.files[1], R.files[3], R.files[6], R.files[9], R.files[12], R.files[14]]), artistic_dependency: "real GPT grip/open/release hand states with palm/near/far subsets are absent" });
}
/* 4 — foot plant during stance; gait cel switch does not jump the contact anchor */
if (want("P4")) {
  const S = await loadScene("A"); let maxSole = 0; const soleT = [715, 905];
  for (let f = 0; f < 600; f++) { const st = stateAtFrame(S.C, f), s = S.C.socketWorld("actor2", st.matrices.actor2, "sole2"); maxSole = Math.max(maxSole, dist(s, soleT)); }
  const Ra = await renderFrames(S, 0, [0, 150, 300, 450, 599], "p4a", { browser }), soleRows = Ra.files.map((f, k) => { const c = centroid(readPNG(f), near([0, 220, 220], 50), [soleT[0] - 30, soleT[1] - 30, soleT[0] + 30, soleT[1] + 30]); return c && [c.x, c.y]; });
  const soleSpread = Math.max(...soleRows.filter(Boolean).map((p) => dist(p, soleRows.find(Boolean))));
  const B = await loadScene("B"), slide = footSlideReport(B.C, "walk_cycle", [0, 600]);
  const swaps = []; let prev = null; for (let f = 0; f < 600; f++) { const c = B.C.celsAt(f)[0]; if (prev && c.entry_index !== prev.entry_index) swaps.push(f); prev = c; }
  const sw = swaps.slice(0, 3).flatMap((f) => [f - 1, f, f + 1]), Rb = await renderFrames(B, 0, sw, "p4b", { browser });
  const swapRows = []; for (let i = 0; i < sw.length; i += 3) { const f = sw[i + 1], before = B.C.celsAt(f - 1)[0], after = B.C.celsAt(f)[0], lm = before.anchor === after.anchor ? before.anchor : (B.C.plan.cels.walk_cycle.cycle[before.entry_index % 4].lands || before.anchor), colour = lm === "left_foot" ? [255, 0, 200] : [120, 0, 255];
    const anchorWorld = (c) => apply(c.matrix, B.reg.get(c.asset_id).asset.landmarks[lm]); const pa = anchorWorld(before), pb = anchorWorld(after);
    const px = [0, 1, 2].map((k) => { const c = centroid(readPNG(Rb.files[i + k]), near(colour, 40), [pa[0] - 20, pa[1] - 20, pa[0] + 20, pa[1] + 20]); return c && [c.x, c.y]; });
    swapRows.push({ swap_frame: f, held_landmark: lm, from: before.asset_id, to: after.asset_id, numeric_jump_px: dist(pa, pb), rendered: px, rendered_spread_px: Math.max(...px.filter(Boolean).map((p) => dist(p, px.find(Boolean)))) }); }
  const badPlan = PL("B"); badPlan.cels.walk_cycle.cycle.forEach((c) => { c.stance = c.anchor; c.anchor = "pelvis"; delete c.lands; }); const B2 = await loadScene("B", { planOverride: badPlan }), badSlide = footSlideReport(B2.C, "walk_cycle", [0, 600]);
  rec({ id: "S2-4", title: "Foot stays planted through the stance; gait cel swaps keep the contact anchor", spec: "§5 Stage 2 acceptance 4; §5.4 Foot plants", source: ["engine/art_bridge/temporal.mjs#solveConstraints (PLANT)", "engine/art_bridge/temporal.mjs#celsAt", "engine/tools/art_bridge_qa.mjs#footSlideReport"],
    input: "scene_A PLANT [0,600) with root bob/sway; scene_B 4 registered cels, distance-indexed", output: { articulated_sole_max_numeric_err_px: maxSole, articulated_sole_rendered: soleRows, articulated_rendered_spread_px: soleSpread, cels: slide, swaps: swapRows },
    mechanical_ok: Ra.cap.failures.length === 0 && Rb.cap.failures.length === 0 && maxSole <= 0.5 && soleSpread < 1 && slide.foot_slide_errors.length === 0 && swapRows.every((r) => r.numeric_jump_px < 1e-9 && r.rendered_spread_px < 1),
    summary: { sole_numeric_max: maxSole, sole_rendered_spread_px: +soleSpread.toFixed(3), cel_swaps_checked: swapRows.length, cel_max_jump_px: Math.max(...swapRows.map((r) => r.numeric_jump_px)), cel_rendered_spread_max: +Math.max(...swapRows.map((r) => r.rendered_spread_px)).toFixed(3), stance_runs: slide.stance_runs.length },
    negatives: [neg("cels placed by pelvis instead of the planted foot (no registered anchor)", "FOOT_SLIDE", badSlide.foot_slide_errors.map((e) => e.code), { worst_slide_px: badSlide.worst_slide_px })],
    witness: keep("S2-4", [Ra.files[0], Ra.files[2], ...Rb.files.slice(0, 3)]), artistic_dependency: "approved GPT gait cel family is absent" });
}
/* 5 — hard elbow bend: underpaint keeps the silhouette whole; beyond the approved range → new cel request */
if (want("P5")) {
  const bendPlan = PL("A"); bendPlan.tracks.actor2.joints.shoulder = [[0, -20], [540, -20], [570, 35, "power2.inOut"], [600, -20, "power2.inOut"]];
  const S = await loadScene("A", { planOverride: bendPlan }), f = 572, st = stateAtFrame(S.C, f), elbow = apply(S.C.fk("actor2", st.matrices ? S.C.solveConstraints(f, S.C.evalPrimary(f, S.C.shotAt(f)), S.C.contactsAt(f)).state.actor2 : null).elbow, [180, 230]);
  const R1 = await renderFrames(S, 0, [f], "p5", { browser }), R0 = await renderFrames(S, 0, [f], "p5", { browser, out: "no_underpaint", perturb: `document.getElementById("p5-actor2--elbow_under2--elbow_under2").setAttribute("visibility","hidden")` });
  const box = [elbow[0] - 22, elbow[1] - 22, elbow[0] + 22, elbow[1] + 22].map(Math.round), bgCount = (file) => { const p = readPNG(file); let n = 0; for (let y = box[1]; y < box[3]; y++) for (let x = box[0]; x < box[2]; x++) { if (Math.hypot(x + 0.5 - elbow[0], y + 0.5 - elbow[1]) > 20) continue; const [r, g, b] = pixel(p, x, y); const arm = r > 95 && r > b + 40 && g > 55 && g < r; if (!arm) n++; } return n; }; // hole = any non-arm pixel inside the r20 joint disc (authored underpaint radius 22px)
  const withU = bgCount(R1.files[0]), without = bgCount(R0.files[0]), bend = S.C.solveConstraints(f, S.C.evalPrimary(f, S.C.shotAt(f)), S.C.contactsAt(f)).state.actor2.theta.elbow;
  const over = PL("A"); over.tracks.actor2.joints.elbow = [[0, -25], [540, -25], [570, -165, "power2.inOut"], [600, -25, "power2.inOut"]]; const C2 = compileMotionTracks(S.reg.doc.actions, S.reg.doc.shots, { doc: S.reg.doc, plan: over });
  const limitErr = []; for (let g = 540; g < 600; g++) limitErr.push(...stateAtFrame(C2, g).failures.filter((e) => e.code === "JOINT_LIMIT_EXCEEDED")); const jobs = missingArtJobs(limitErr, { doc: S.reg.doc });
  const noU = clone(M("A")); noU.assets.find((a) => a.id === "forearm2").underpaint_asset_ids = []; const nu = await checkManifest(noU, "p5_nounder");
  const light = st.passes.find((p) => p.slot === "torso2"), lp = stateAtFrame(S.C, f); // light plane uses the owner's matrix (no separate animation)
  rec({ id: "S2-5", title: "Hard elbow bend: underpaint keeps a coherent silhouette; beyond approved range the renderer requests a new cel", spec: "§5 Stage 2 acceptance 5; §5.5; §11.2(5)", source: ["engine/art_bridge/scene_graph.mjs#composeShot (underpaint pass)", "engine/art_bridge/temporal.mjs#solveConstraints (limits)", "engine/art_bridge/art_requests.mjs#missingArtJobs"],
    input: `scene_A (plan override: shoulder swings clear of the crank 540–600) frame ${f}, elbow ${bend.toFixed(1)}°`, output: { elbow_world: elbow, non_arm_pixels_in_r20_joint_disc: { with_underpaint: withU, underpaint_hidden_diagnostic: without }, over_range_failures: limitErr.length, art_jobs: jobs.jobs.map((j) => ({ id: j.artjob_id, kind: j.state_kind, why: j.motion_context.why_this_drawing_is_needed })) },
    mechanical_ok: R1.cap.failures.length === 0 && withU === 0 && without > 0 && limitErr.length > 0 && jobs.jobs.length === 1 && jobs.jobs[0].state_kind === "POSE_OR_BEND_CEL",
    summary: { holes_with_underpaint: withU, holes_without: without, over_range_frames: limitErr.length, art_jobs: jobs.jobs.length },
    negatives: [neg("underpaint removed from the manifest", "MISSING_UNDERPAINT", nu.codes, { art_jobs: nu.art_jobs }), neg("underpaint pass hidden in-page (diagnostic perturbation)", "SEAM_VISIBLE", without > 0 ? "SEAM_VISIBLE" : "none", { background_pixels: without })],
    witness: keep("S2-5", [R1.files[0], R0.files[0]]), artistic_dependency: "approved GPT sleeve/bend states and authored underpaint are absent" });
}
/* 6 — face view and expression switches keep skull/eye/mouth identity anchors */
if (want("P6")) {
  const S = await loadScene("C"), fr = [199, 200, 201, 399, 400, 401], R = await renderFrames(S, 0, fr, "p6", { browser });
  const anchors = fr.map((f, k) => { const st = stateAtFrame(S.C, f), mn = st.matrices.head.neck, png = readPNG(R.files[k]), top = apply(mn, [150, 20]), chin = apply(mn, [150, 300]); const ct = centroid(png, near([255, 0, 0], 50), [top[0] - 15, top[1] - 15, top[0] + 15, top[1] + 15]), cc = centroid(png, near([0, 0, 255], 50), [chin[0] - 15, chin[1] - 15, chin[0] + 15, chin[1] + 15]);
    return { frame: f, pose: st.artStates.head.pose, view: st.artStates.head.view, bound: st.passes.filter((p) => p.visible).map((p) => p.asset_id), top_pred: top, top_px: ct && [ct.x, ct.y], chin_pred: chin, chin_px: cc && [cc.x, cc.y] }; });
  const err6 = Math.max(...anchors.flatMap((a) => [a.top_px ? dist(a.top_px, a.top_pred) : 9, a.chin_px ? dist(a.chin_px, a.chin_pred) : 9]));
  const switchAt = { smile: anchors.find((a) => a.bound.includes("mouth_smile"))?.frame, threeq: anchors.find((a) => a.bound.includes("skull_threeq"))?.frame };
  const res = [...anchorResiduals("neutral", "smile", S.reg.doc.rigs[0], S.C.assets), ...anchorResiduals("neutral", "threeq", S.reg.doc.rigs[0], S.C.assets)];
  let gazeFails = 0; for (let f = 0; f < 600; f++) gazeFails += stateAtFrame(S.C, f).failures.length;
  const morph = clone(M("C")); morph.rigs[0].allowed_state_edges[1].mode = "MATCHED_VECTOR_MORPH"; const mo = await checkManifest(morph, "p6_morph");
  const noView = clone(M("C")); noView.identities[0].allowed_views = ["front"]; const nv = await checkManifest(noView, "p6_view");
  const frontEyes = clone(M("C")); const vs = frontEyes.rigs[0].view_states[0].asset_bindings; for (const k of ["eye_white_l", "eye_white_r", "pupil_l", "pupil_r", "mouth_neutral", "brow_l"]) delete vs[k]; const fe = assetStateCoverage(frontEyes);
  const gazePlan = PL("C"); gazePlan.tracks.head.joint_offsets.eye_l.x = [[0, 0], [100, 40, "linear"], [600, 0]]; const G = compileMotionTracks(S.reg.doc.actions, S.reg.doc.shots, { doc: S.reg.doc, plan: gazePlan }); let gz = 0; for (let f = 0; f < 200; f++) gz += stateAtFrame(G, f).failures.length;
  rec({ id: "S2-6", title: "Face view and expression switches keep skull/eye/mouth identity anchors (not pupil animation on a sphere)", spec: "§5 Stage 2 acceptance 6; §5.4 Face/gaze; §12.2", source: ["engine/art_bridge/state_router.mjs#validateStateEdge/anchorResiduals", "engine/art_bridge/temporal.mjs#resolveApprovedArtStates", "engine/art_bridge/asset_state.mjs#assetStateCoverage"],
    input: "scene_C: smile REGISTERED_SWAP @200, front→threeq REGISTERED_SWAP @400, gaze offsets", output: { anchors, switch_frames: switchAt, landmark_residuals: res, gaze_failures_all_frames: gazeFails },
    mechanical_ok: R.cap.failures.length === 0 && err6 < 1 && switchAt.smile === 200 && switchAt.threeq === 400 && res.every((r) => r.residual_px === 0) && gazeFails === 0,
    summary: { anchor_max_err_px: +err6.toFixed(3), switch_frames: switchAt, residuals: res.map((r) => r.residual_px) },
    negatives: [neg("view edge declared as MATCHED_VECTOR_MORPH on raster art", "INVALID_MORPH_TOPOLOGY", mo.codes), neg("front-only identity turned to three-quarter", "UNSUPPORTED_VIEW", nv.codes), neg("front-view eyes/mouth reused on the turned skull", "MISSING_ART_ASSET", fe.errors.map((e) => e.code), { missing_cells: fe.errors.length }), neg("pupil pushed outside its owned eye surface", "UNSUPPORTED_STATE_EDGE", gz > 0 ? "UNSUPPORTED_STATE_EDGE" : "none", { frames: gz })],
    witness: keep("S2-6", R.files), artistic_dependency: "registered GPT face views/expressions are absent; identity retention is an artistic judgment that cannot be made on fixtures" });
}
/* 7 — moving camera reveals registered layers, never a blank rectangle; ownership */
if (want("P7")) {
  const S = await loadScene("D"), sc = composeShot(S.reg.doc.shots[0], S.reg, S.C, { prefix: "x-" }), fp = sc.validateFootprint(0, 3420), fr = [0, 100, 200, 300, 400, 500, 599], R = await renderFrames(S, 0, fr, "p7", { browser });
  const blank = R.files.map((f) => countColour(readPNG(f), [255, 0, 255], 4)), mats = fr.map((f) => { const rows = sc.frameState(f).rows; return Object.fromEntries(rows.filter((r) => r[0].includes("cam-")).map((r) => [r[0].replace("x-", ""), r[1]])); });
  const wide = PL("D"); wide.cameras.camD.zoom = [[0, 1], [300, 0.25, "sine.inOut"], [600, 1, "sine.inOut"]]; const W2 = await loadScene("D", { planOverride: wide }), sc2 = composeShot(W2.reg.doc.shots[0], W2.reg, W2.C, { prefix: "w-" }), fp2 = sc2.validateFootprint(0, 600);
  const Rw = await renderFrames(W2, 0, [300], "p7w", { browser }), blankWide = countColour(readPNG(Rw.files[0]), [255, 0, 255], 4);
  const ownerPlan = PL("D"); ownerPlan.tracks = { ghost: { root: { x: [[0, 0]] } } }; const oc = compileErr(clone(M("D")), ownerPlan);
  rec({ id: "S2-7", title: "Moving camera reveals registered background/midground/foreground; no blank camera rectangle; single transform owner", spec: "§5 Stage 2 acceptance 7; §5.6", source: ["engine/art_bridge/scene_graph.mjs#cameraMatrix/validateFootprint", "engine/art_bridge/render.mjs#capture"],
    input: "scene_D camD pan 960→1260→860, zoom 1→1.25→1.05, parallax FAR .35 MID .7 FG 1.45", output: { footprint_errors: fp.map((e) => e.toJSON()), sentinel_pixels_per_frame: blank, camera_band_matrices: mats, camera_owner_ids: sc.cameraIds },
    mechanical_ok: R.cap.failures.length === 0 && fp.length === 0 && blank.every((n) => n === 0) && new Set(Object.values(mats[3])).size === Object.keys(mats[3]).length,
    summary: { footprint_errors: fp.length, sentinel_pixels_max: Math.max(...blank), bands: sc.cameraIds.length },
    negatives: [neg("camera zooms out to 0.25 beyond painted plates", "OUTSIDE_CAMERA_FOOTPRINT", fp2.map((e) => e.code), { spans: fp2.map((e) => e.frame_range), rendered_blank_pixels_at_300: blankWide }), neg("camera-band check agrees with pixels", "BLANK_PIXELS_VISIBLE", blankWide > 0 ? "BLANK_PIXELS_VISIBLE" : "none"), neg("motion track targets a rig that does not exist (unowned node)", "UNKNOWN_REFERENCE", oc.codes)],
    witness: keep("S2-7", [R.files[0], R.files[3], R.files[6], Rw.files[0]]), artistic_dependency: "GPT world planes with real overscan are absent" });
}
/* 8 — OUT/MIDDLE/IN world transition with a shared anchor */
if (want("P8")) {
  const S = await loadScene("D"), sc = composeShot(S.reg.doc.shots[0], S.reg, S.C, { prefix: "x-" }), tr = sc.transitions[0], fr = [3420, 3440, 3460, 3480, 3500, 3520, 3539], R = await renderFrames(S, 0, fr, "p8", { browser, range: [3400, 3540] });
  const rows = fr.map((f, k) => { const t = tr.frameAt(f), png = readPNG(R.files[k]), c = centroid(png, near([255, 0, 0], 40), [t.anchor_screen[0] - 40, t.anchor_screen[1] - 40, t.anchor_screen[0] + 40, t.anchor_screen[1] + 40]); return { frame: f, stage: t.stage, zoom: t.zoom, anchor_screen: t.anchor_screen, anchor_residuals_px: t.anchor_residuals_px, rendered_anchor: c && [c.x, c.y], rendered_err_px: c ? dist([c.x, c.y], t.anchor_screen) : null, blank_px: countColour(png, [255, 0, 255], 4) }; });
  let numMax = 0; for (let f = 3420; f < 3540; f++) numMax = Math.max(numMax, ...tr.frameAt(f).anchor_residuals_px);
  const stages = [...new Set(rows.map((r) => r.stage))], noMid = clone(M("D")); noMid.transitions[0].middle_asset_ids = []; const nm = await checkManifest(noMid, "p8_nomid");
  rec({ id: "S2-8", title: "OUT/MIDDLE/IN transition changes representation while holding the shared anchor", spec: "§5 Stage 2 acceptance 8; §5.6; §5.3 TRANSITION", source: ["engine/art_bridge/transitions.mjs#compileTransition", "engine/art_bridge/scene_graph.mjs (aperture masks)"],
    input: "scene_D transition [3420,3540) portal_out→portal_mid→portal_in through portal_aperture mask", output: { rows, numeric_anchor_max_residual_px: numMax, aperture_ratios: tr.aperture_ratios, total_zoom: tr.total_zoom },
    mechanical_ok: R.cap.failures.length === 0 && numMax < 1e-6 && stages.join() === "OUT,MIDDLE,IN" && rows.every((r) => r.blank_px === 0) && rows.filter((r) => r.rendered_err_px !== null).every((r) => r.rendered_err_px < 1.5),
    summary: { stages, numeric_anchor_max: numMax, rendered_anchor_max_err: +Math.max(...rows.map((r) => r.rendered_err_px ?? 0)).toFixed(3), blank: Math.max(...rows.map((r) => r.blank_px)) },
    negatives: [neg("MIDDLE transition art deleted", "MISSING_TRANSITION_STATE", nm.codes, { art_jobs: nm.art_jobs })], witness: keep("S2-8", R.files), artistic_dependency: "GPT OUT/MIDDLE/IN plates are absent" });
}
/* 9 — order-independent identical pixels; no JS exceptions / missing fetches */
if (want("P9")) {
  const S = await loadScene("A"), lin = [495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505], rnd = [1000, 500, 1000, 503, 497, 505, 495, 600, 499, 501, 496, 498, 502, 504];
  const R1 = await renderFrames(S, 0, lin, "p9", { browser, range: [0, 1001], out: "linear" }), R2 = await renderFrames(S, 0, rnd, "p9", { browser, range: [0, 1001], out: "random" });
  const h = (f) => sha(f), lp = Object.fromEntries(lin.map((f, k) => [f, readPNG(R1.files[k])])), mism = [];
  for (const [k, f] of rnd.entries()) { if (!lp[f]) continue; const a = lp[f].rgba, b = readPNG(R2.files[k]).rgba; let d = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++; if (d) mism.push({ frame: f, differing_bytes: d }); }
  // numeric determinism: stateAtFrame purity
  const a = JSON.stringify(stateAtFrame(S.C, 500).passes), _ = stateAtFrame(S.C, 1000), b = JSON.stringify(stateAtFrame(S.C, 500).passes);
  rec({ id: "S2-9", title: "Random-seek renders are pixel-identical to linear capture; no JS exceptions or missing fetches", spec: "§5 Stage 2 acceptance 9; §7.5 random seek", source: ["engine/art_bridge/runtime/bridge_rt.js#bind", "engine/runtime/nu.js (unmodified)", "engine/art_bridge/temporal.mjs#stateAtFrame"],
    input: "scene_A frames 495–505 linear vs order 1000,500,1000,503,… in a fresh page", output: { compared: rnd.filter((f) => lp[f]).length, mismatches: mism, failures_linear: R1.cap.failures, failures_random: R2.cap.failures, numeric_pure: a === b, lossless_path: "Chrome PNG screenshot (lossless) → RGBA byte compare" },
    mechanical_ok: mism.length === 0 && R1.cap.failures.length === 0 && R2.cap.failures.length === 0 && a === b,
    summary: { compared: rnd.filter((f) => lp[f]).length, mismatches: mism.length, js_or_fetch_failures: R1.cap.failures.length + R2.cap.failures.length },
    negatives: [neg("runtime that skips writing unchanged elements would inherit state (structure check: every runtime element written every frame)", "ALL_WRITTEN", (() => { const rows = composeShot(S.reg.doc.shots[0], S.reg, S.C, { prefix: "q-" }); const n = rows.runtimeIds.length + rows.cameraIds.length; return rows.frameState(10).rows.length === n && rows.frameState(900).rows.length === n ? "ALL_WRITTEN" : "PARTIAL"; })())],
    witness: keep("S2-9", [R1.files[5], R2.files[1]]) });
}
/* 10 — procedural mechanism through supplied symbols */
if (want("P10")) {
  const S = await loadScene("E"), fr = [100, 300, 500], R = await renderFrames(S, 0, fr, "p10", { browser });
  const ang = (png, c, colour, rad) => { const m = centroid(png, near(colour, 60), [c[0] - rad, c[1] - rad, c[0] + rad, c[1] + rad]); return m ? (Math.atan2(m.y - c[1], m.x - c[0]) * 180) / Math.PI : null; };
  const rows = fr.map((f, k) => { const png = readPNG(R.files[k]), a = ang(png, [800, 540], [255, 0, 0], 110), b = ang(png, [960, 540], [0, 0, 255], 70), dA = S.C.jointValue("gearA", "spin", f), dB = S.C.jointValue("gearB", "spin", f), count = S.C.proceduralAt(f).length;
    return { frame: f, driver_deg: dA, follower_deg: dB, ratio: dB / dA, rendered_driver_marker_deg: a, rendered_follower_marker_deg: b, expected_driver_marker_deg: -90 + dA, expected_follower_marker_deg: -90 + dB, symbols: count }; });
  const wrapd = (x) => ((((x + 180) % 360) + 360) % 360) - 180, angErr = Math.max(...rows.flatMap((r) => [Math.abs(wrapd(r.rendered_driver_marker_deg - r.expected_driver_marker_deg)), Math.abs(wrapd(r.rendered_follower_marker_deg - r.expected_follower_marker_deg))]));
  const noMech = PL("E"); delete noMech.procedural.flow_out; const nmc = compileErr(clone(M("E")), noMech);
  rec({ id: "S2-10", title: "Procedural mechanism: driver→follower gear ratio and flow-rate symbols computed from the declared mechanism and supplied symbols", spec: "§5 Stage 2 acceptance 10; §5.3 PROCEDURAL; §5.4 Mechanisms", source: ["engine/art_bridge/temporal.mjs (GEAR_TRAIN, proceduralAt FLOW_PATH)"],
    input: "scene_E 30:18 gear train, flow symbol count track", output: { rows, marker_angle_max_err_deg: angErr },
    mechanical_ok: R.cap.failures.length === 0 && rows.every((r) => Math.abs(r.ratio + 30 / 18) < 1e-9) && angErr < 2 && rows.map((r) => r.symbols).join() === "2,6,7",
    summary: { ratio: rows[0].ratio, angle_err_deg: +angErr.toFixed(3), symbols: rows.map((r) => r.symbols) },
    negatives: [neg("PROCEDURAL action with no declared mechanism", "UNSUPPORTED_MOTION_CLASS", nmc.codes)], witness: keep("S2-10", R.files), artistic_dependency: "approved GPT symbols/diagram art are absent" });
}
/* registration producer (spec §11.2) exercised on a synthetic provider-like raster derived from a fixture (rotated/scaled/offset) */
if (want("REG")) {
  const src = readPNG(path.join(FIX, "diag2/forearm.png")), W = 160, H = 200, ang = (17 * Math.PI) / 180, s = 1.35, ox = 60, oy = 30, raw = new Uint8Array(W * H * 4);
  // raw = canonical part (origin [169,222]) mapped by known similarity; sample inverse (nearest-in-bilinear) — DIAGNOSTIC raster
  const c = Math.cos(ang), sn = Math.sin(ang), fwd = (p) => [s * (c * p[0] - sn * p[1]) + ox, s * (sn * p[0] + c * p[1]) + oy];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const u = x + 0.5 - ox, v = y + 0.5 - oy, px = (c * u + sn * v) / s, py = (-sn * u + c * v) / s, ix = Math.floor(px), iy = Math.floor(py); if (ix < 0 || iy < 0 || ix >= src.width || iy >= src.height) continue; const i = (iy * src.width + ix) * 4, j = (y * W + x) * 4; raw.set(src.rgba.subarray(i, i + 4), j); }
  const rawFile = path.join(WORK, "reg", "raw_forearm_provider_like.png"); fs.mkdirSync(path.dirname(rawFile), { recursive: true }); writeRGBA(rawFile, W, H, raw);
  const canon = { elbow: [180, 230], wrist: [180, 310], mid: [190, 270] }, toRaw = (q) => fwd([q[0] - 169, q[1] - 222]), partLm = Object.fromEntries(Object.entries(canon).map(([k, v]) => [k, toRaw(v)]));
  const master = path.join(FIX, "diag2/actor_master.png");
  const ok = registerPart({ partId: "forearm_reg", master, rawPart: rawFile, canonicalLandmarks: canon, partLandmarks: partLm, pivotId: "elbow", underpaintIds: ["elbow_under2"], hiddenSurfaces: ["elbow_inner"], mode: "SIMILARITY", outDir: path.join(WORK, "reg", "ok") });
  const badLm = { ...partLm, wrist: [partLm.wrist[0] + 9, partLm.wrist[1]] }, bad = registerPart({ partId: "forearm_bad", master, rawPart: rawFile, canonicalLandmarks: canon, partLandmarks: badLm, pivotId: "elbow", mode: "SIMILARITY", outDir: path.join(WORK, "reg", "bad") });
  let collinear; try { registerPart({ partId: "forearm_col", master, rawPart: rawFile, canonicalLandmarks: { a: [0, 0], b: [1, 1], c: [2, 2] }, partLandmarks: { a: [0, 0], b: [1, 1], c: [2, 2] }, pivotId: "a", mode: "AFFINE", outDir: path.join(WORK, "reg", "col") }); collinear = "none"; } catch (e) { collinear = e.code; }
  const noUnder = registerPart({ partId: "forearm_nounder", master, rawPart: rawFile, canonicalLandmarks: canon, partLandmarks: partLm, pivotId: "elbow", hiddenSurfaces: ["elbow_inner"], mode: "SIMILARITY", outDir: path.join(WORK, "reg", "nounder") });
  const recScale = ok.scale, recAng = (Math.atan2(ok.raster_to_canonical[1], ok.raster_to_canonical[0]) * 180) / Math.PI;
  rec({ id: "S2-REG", title: "Registration producer: raster→canonical similarity from reviewed landmarks, lossless crop, residuals, alpha report, overlay+difference, receipt", spec: "§11.2", source: ["engine/art_bridge/registration.mjs#registerPart/solveTransform"],
    input: "DIAGNOSTIC provider-like raster: fixture forearm rotated 17°, scaled 1.35, offset (60,30)", output: { receipt: path.relative(REPO, path.join(WORK, "reg", "ok", "forearm_reg__REGISTRATION_RECEIPT.json")), max_residual_px: ok.max_residual_px, recovered_scale: recScale, recovered_rotation_deg: recAng, alpha_report: ok.alpha_report, rest_overlay: ok.rest_overlay, manifest_fields: ok.manifest_fields },
    mechanical_ok: ok.status === "PENDING_REVIEW" && ok.max_residual_px < 1e-6 && Math.abs(recScale - 1 / s) < 1e-6 && Math.abs(recAng + 17) < 1e-6,
    summary: { residual: ok.max_residual_px, scale: +recScale.toFixed(6), rotation: +recAng.toFixed(6), status: ok.status },
    negatives: [neg("one landmark misplaced by 9px", "UNREGISTERED_PIVOT", bad.failures.map((f) => f.code)), neg("collinear anchors for an affine", "DEGENERATE_IK", collinear), neg("hidden surfaces declared without underpaint", "MISSING_UNDERPAINT", noUnder.missing_art.map((m) => m.code))],
    witness: [ok.rest_overlay.overlay_file, ok.rest_overlay.difference_file].map((f) => { const t = path.join(EVID, "frames", "S2-REG", path.basename(f)); fs.mkdirSync(path.dirname(t), { recursive: true }); fs.copyFileSync(f, t); return { file: rel(t), sha256: sha(t) }; }), artistic_dependency: "registration of REAL GPT pixels requires reviewed landmarks on provider output" });
}
/* 60 fps motion witness + ffprobe */
if (want("MP4")) {
  const S = await loadScene("A"), frames = Array.from({ length: 600 }, (_, i) => i), R = await renderFrames(S, 0, frames, "mp4A", { browser, range: [0, 600] });
  const mp4 = path.join(WORK, "scene_A_60fps.mp4"); execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "60", "-i", path.join(WORK, "mp4A", "mp4A", "f%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16", mp4]);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-count_frames", "-show_entries", "stream=width,height,r_frame_rate,nb_read_frames,duration", "-of", "json", mp4], { encoding: "utf8" })).streams[0];
  rec({ id: "S2-60FPS", title: "Exact 60-fps capture of a 600-frame passage through nu.js; verified with ffprobe", spec: "§5.7", source: ["engine/art_bridge/render.mjs#buildComposition/capture"], input: "scene_A frames 0..599", output: { mp4: rel(mp4), mp4_sha256: sha(mp4), ffprobe: probe, failures: R.cap.failures },
    mechanical_ok: R.cap.failures.length === 0 && probe.width === 1920 && probe.height === 1080 && probe.r_frame_rate === "60/1" && +probe.nb_read_frames === 600, summary: { ffprobe: probe }, negatives: [], witness: keep("S2-60FPS", [R.files[0], R.files[299], R.files[599]]), note: "MP4 kept under hybrid_v2/work (not committed); included in the audit ZIP" });
}
} finally { await browser.close(); }

const outFile = path.join(REPO, "hybrid_v2", "evidence", "STAGE_2_MOTION_PROOF.json"), prev = fs.existsSync(outFile) ? JSON.parse(fs.readFileSync(outFile, "utf8")) : { proofs: [] };
const merged = [...prev.proofs.filter((p) => !PROOFS.some((q) => q.id === p.id)), ...PROOFS].sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
const rev = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), dirty = execFileSync("git", ["status", "--porcelain", "engine", "tests", "schemas"], { cwd: REPO, encoding: "utf8" }).trim().length > 0;
const allMech = merged.length >= 12 && merged.every((p) => p.mechanical_status === "MECHANICAL_PASS");
fs.writeFileSync(outFile, JSON.stringify({ stage: "STAGE_2_MOTION", generated_by: "tests/art_bridge/stage2_proofs.mjs", exact_cli: "node tests/art_bridge/stage2_proofs.mjs", tested_revision: rev, working_tree_dirty_at_test: dirty, generated_at: new Date().toISOString(),
  status: allMech ? "MECHANICAL_PASS__ARTISTIC_BLOCKED_PENDING_GPT_ART" : "BLOCKED", gate_note: "All mechanisms are demonstrated on DIAGNOSTIC_FIXTURE rasters only. Criteria 1,3,4,5,6,7,8,10 name real approved art: they remain artistically BLOCKED until GPT assets exist. Not production-qualified.",
  fixtures_are_target_art: false, tested_asset_hashes: Object.fromEntries(fs.readdirSync(path.join(FIX, "diag2")).map((f) => [`diag2/${f}`, sha(path.join(FIX, "diag2", f))])), proofs: merged }, null, 1));
console.log("wrote", rel(outFile), allMech ? "ALL MECHANICAL PASS" : "NOT ALL PASS", ((Date.now() - t0) / 1000).toFixed(1) + "s");
