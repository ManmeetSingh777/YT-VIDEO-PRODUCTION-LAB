// Chrome pixel probes for the P0.1 re-audit (B1/B2): every check compares REAL rendered pixels with what the source pixels + the registered
// crop→canonical affine predict. DIAGNOSTIC rasters only.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { composeShot, cameraMatrix } from "../../engine/art_bridge/scene_graph.mjs";
import { emitPass } from "../../engine/art_bridge/svg_parts.mjs";
import { buildComposition, capture, renderStaticSvg } from "../../engine/art_bridge/render.mjs";
import { cropToCanonical, canonicalBBox, canonicalToCrop } from "../../engine/art_bridge/asset_geometry.mjs";
import { readPNG, writeRGBA } from "../../engine/art_bridge/png.mjs";
import { apply, inv, mul, T as Tm, S as Sm } from "../../engine/art_bridge/math2d.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FIX = path.join(here, "fixtures");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const MAG = (p) => p[0] > 240 && p[1] < 20 && p[2] > 240;
const px = (png, x, y) => { const i = (Math.floor(y) * png.width + Math.floor(x)) * 4; return [...png.rgba.slice(i, i + 4)]; };
function bilinear(png, x, y) { // straight-alpha source sample at continuous pixel coords (premultiplied average, un-premultiplied result)
  const x0 = Math.floor(x - 0.5), y0 = Math.floor(y - 0.5), fx = x - 0.5 - x0, fy = y - 0.5 - y0, o = [0, 0, 0, 0];
  for (const [dx, dy, w] of [[0, 0, (1 - fx) * (1 - fy)], [1, 0, fx * (1 - fy)], [0, 1, (1 - fx) * fy], [1, 1, fx * fy]]) { const xx = Math.min(png.width - 1, Math.max(0, x0 + dx)), yy = Math.min(png.height - 1, Math.max(0, y0 + dy)), i = (yy * png.width + xx) * 4, a = png.rgba[i + 3] / 255; o[0] += png.rgba[i] * a * w; o[1] += png.rgba[i + 1] * a * w; o[2] += png.rgba[i + 2] * a * w; o[3] += a * w; }
  return o[3] > 1e-6 ? [o[0] / o[3], o[1] / o[3], o[2] / o[3], o[3] * 255] : [0, 0, 0, 0];
}

/** B1-e: each asset alone, placed in canonical space (translate(off)·scale(k)); interior probes vs bilinear source prediction; outside-quad emptiness */
export async function probeAssetPixels(rt, out) {
  fs.mkdirSync(out, { recursive: true });
  const reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json"), master = reg.get("pilot_master").asset;
  // sub-crop variant of the master: source_pixel_crop with a NONZERO origin; its affine = master affine · translate(crop origin)
  const sub = { ...master, id: "pilot_master_subcrop", source_pixel_crop: [100, 200, 300, 400] }; sub.crop_to_canonical_matrix = mul(cropToCanonical(master), Tm(100, 200)); sub.canonical_rect = canonicalBBox(sub);
  const items = [["pilot_master", master, 2, [40, 40]], ["pilot_hand_open", reg.get("pilot_hand_open").asset, 4, [760, 40]], ["pilot_upper_arm", reg.get("pilot_upper_arm").asset, 4, [1040, 40]], ["pilot_forearm", reg.get("pilot_forearm").asset, 4, [1320, 40]], ["pilot_master_subcrop", sub, 2, [760, 520]]];
  const svgParts = items.map(([id, a, k, [ox, oy]]) => { const bb = canonicalBBox(a); return `<g transform="translate(${ox - k * bb[0]} ${oy - k * bb[1]}) scale(${k})"><g transform="translate(${a.pivot_xy[0]} ${a.pivot_xy[1]})">${emitPass(`probe-${id}`, a, `assets/${a.file}`, "pp-")}</g></g>`; });
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">${svgParts.join("")}</svg>`;
  const file = path.join(out, "asset_pixel_probe.png"); await renderStaticSvg(svg, rt.film, file, { omitBackground: true });
  const png = readPNG(file), res = [];
  for (const [id, a, k, [ox, oy]] of items) {
    const src = readPNG(path.join(rt.film, a.file)), C = cropToCanonical(a), Ci = inv(C), bb = canonicalBBox(a), off = [ox - k * bb[0], oy - k * bb[1]], [sx, sy, sw, sh] = a.source_pixel_crop;
    let samples = 0, matches = 0, worst = 0; const pts = [];
    for (let sy_ = Math.floor(oy); sy_ < oy + k * bb[3]; sy_ += 3) for (let sx_ = Math.floor(ox); sx_ < ox + k * bb[2]; sx_ += 3) {
      const c = [(sx_ + 0.5 - off[0]) / k, (sy_ + 0.5 - off[1]) / k], u = apply(Ci, c); if (u[0] < 3 || u[1] < 3 || u[0] > sw - 3 || u[1] > sh - 3) continue;
      // interior only: source fully opaque in a 4-px neighbourhood (rendering is exact there up to resampling)
      let solid = true; for (const [dx, dy] of [[-4, 0], [4, 0], [0, -4], [0, 4], [0, 0]]) if (bilinear(src, sx + u[0] + dx, sy + u[1] + dy)[3] < 250) solid = false; if (!solid) continue;
      const e = bilinear(src, sx + u[0], sy + u[1]), g = px(png, sx_, sy_), d = Math.max(Math.abs(e[0] - g[0]), Math.abs(e[1] - g[1]), Math.abs(e[2] - g[2]));
      samples++; if (d <= 40 && g[3] > 240) matches++; worst = Math.max(worst, d); if (pts.length < 6) pts.push({ screen: [sx_, sy_], canonical: c, crop_px: u, expected: e.map(Math.round), got: g });
    }
    let outside = 0, outsideSamples = 0; for (let t = 0; t < 1; t += 0.01) for (const [cx, cy] of [[bb[0] + t * bb[2], bb[1] - 3], [bb[0] + t * bb[2], bb[1] + bb[3] + 3], [bb[0] - 3, bb[1] + t * bb[3]], [bb[0] + bb[2] + 3, bb[1] + t * bb[3]]]) { const s = [off[0] + k * cx, off[1] + k * cy]; if (s[0] < 0 || s[1] < 0 || s[0] >= 1920 || s[1] >= 1080) continue; outsideSamples++; if (px(png, s[0], s[1])[3] > 8) outside++; }
    res.push({ id, scale_px_per_canonical: Math.sqrt(Math.abs(C[0] * C[3] - C[1] * C[2])), rotation_deg: Math.atan2(C[1], C[0]) * 180 / Math.PI, crop: a.source_pixel_crop, canonical_rect: a.canonical_rect, inside_samples: samples, inside_matches: matches, worst_channel_err: Math.round(worst), outside_samples: outsideSamples, outside_painted: outside, sample_points: pts });
  }
  return { image: file, image_sha256: sha(file), assets: res };
}

/** B1-d: camera footprint on a plate delivered at 2 px / canonical unit, numeric + Chrome sentinel + plate-colour probes */
export async function probeWorldFootprint(rt, out) {
  fs.mkdirSync(out, { recursive: true });
  const reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json"), plan = J(path.join(rt.film, "handoff", "MOTION_PLAN.json")), C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan });
  const shot = reg.doc.shots.find((s) => s.id === "rt_world_shot"), sc = composeShot(shot, reg, C, { prefix: "fw-" }), spans = sc.validateFootprint(3600, 4200).map((e) => e.frame_range);
  const comp = buildComposition(path.join(out, "comp"), { id: "fw", scene: sc, frameRange: [3600, 4000], registry: reg }), cap = await capture(comp, rt.film, [3650, 3950], path.join(out, "frames"), { id: "fw" });
  const wide = readPNG(cap.files[0]), pushed = readPNG(cap.files[1]), count = (p) => { let n = 0; for (let i = 0; i < p.rgba.length; i += 4) if (MAG([p.rgba[i], p.rgba[i + 1], p.rgba[i + 2]])) n++; return n; };
  // plate colour probes at frame 3950: screen → canonical (FAR camera) → plate crop px → source pixel
  const plate = reg.get("rt_world_far").asset, src = readPNG(path.join(rt.film, plate.file)), Ci = inv(cropToCanonical(plate)), cam = C.cameraAt(3950), M = cameraMatrix(cam, "FAR", plan.parallax, reg.doc.stage), Mi = inv(M);
  let worst = 0; const probes = [];
  for (const s of [[200, 150], [960, 540], [1700, 900], [400, 800], [1500, 250]]) { const c = apply(Mi, [s[0] + 0.5, s[1] + 0.5]), u = apply(Ci, c), e = bilinear(src, u[0], u[1]), g = px(pushed, s[0], s[1]), d = Math.max(...[0, 1, 2].map((i) => Math.abs(e[i] - g[i]))); worst = Math.max(worst, d); probes.push({ screen: s, canonical: c, plate_px: u, expected: e.map(Math.round), got: g }); }
  return { flagged_spans: spans, frames: cap.files, failures: cap.failures, sentinel_wide: count(wide), sentinel_pushed: count(pushed), grid_probe_max_err: Math.round(worst), probes, plate_rect: plate.canonical_rect };
}

/** B1-f: the Stage-2 portal transition with OUT/MIDDLE/IN plates + aperture delivered at 2× density must render like the 1× plates */
export async function probeTransitionDensity(out) {
  fs.rmSync(out, { recursive: true, force: true }); const root = path.join(out, "root"); fs.mkdirSync(root, { recursive: true });
  for (const d of ["diag2", "stage2", "skill"]) fs.cpSync(path.join(FIX, d), path.join(root, d), { recursive: true });
  const m1 = J(path.join(root, "stage2", "scene_D.manifest.json")), m2 = structuredClone(m1); fs.mkdirSync(path.join(root, "diag2x"), { recursive: true });
  for (const a of m2.assets.filter((x) => ["portal_out", "portal_mid", "portal_in", "portal_aperture"].includes(x.id))) {
    const s = readPNG(path.join(root, a.file)), W2 = s.width * 2, H2 = s.height * 2, o = new Uint8Array(W2 * H2 * 4);
    for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) o.set(s.rgba.subarray(((y >> 1) * s.width + (x >> 1)) * 4, ((y >> 1) * s.width + (x >> 1)) * 4 + 4), (y * W2 + x) * 4);
    const f = path.join(root, "diag2x", path.basename(a.file)); writeRGBA(f, W2, H2, o);
    Object.assign(a, { file: `diag2x/${path.basename(a.file)}`, sha256: sha(f), width_px: W2, height_px: H2, source_pixel_crop: [0, 0, W2, H2], crop_to_canonical_matrix: [0.5, 0, 0, 0.5, a.canonical_rect[0], a.canonical_rect[1]] });
  }
  fs.writeFileSync(path.join(root, "stage2", "scene_D2x.manifest.json"), JSON.stringify(m2, null, 1));
  const plan = J(path.join(root, "stage2", "scene_D.plan.json")), frames = {};
  for (const [tag, mf] of [["1x", "stage2/scene_D.manifest.json"], ["2x", "stage2/scene_D2x.manifest.json"]]) {
    const reg = await createAssetRegistry(root, mf), C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan }), sc = composeShot(reg.doc.shots[0], reg, C, { prefix: `t${tag}-` });
    const comp = buildComposition(path.join(out, tag, "comp"), { id: `t${tag}`, scene: sc, frameRange: [3460, 3500], registry: reg }), cap = await capture(comp, root, [3480], path.join(out, tag, "frames"), { id: `t${tag}` });
    frames[tag] = { file: cap.files[0], failures: cap.failures };
  }
  const a = readPNG(frames["1x"].file), b = readPNG(frames["2x"].file); let sum = 0, n = 0, mag = 0;
  for (let i = 0; i < a.rgba.length; i += 4) { sum += Math.abs(a.rgba[i] - b.rgba[i]) + Math.abs(a.rgba[i + 1] - b.rgba[i + 1]) + Math.abs(a.rgba[i + 2] - b.rgba[i + 2]); n += 3; if (MAG([b.rgba[i], b.rgba[i + 1], b.rgba[i + 2]])) mag++; }
  return { frame: 3480, mean_abs_diff: sum / n, sentinel_2x: mag, frames };
}

/** B2-c: hard elbow bend with registered parts; the owned underpaint closes the joint, hiding it opens a seam */
export async function probeElbowBend(rt, out) {
  fs.mkdirSync(out, { recursive: true });
  const reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json"), plan = J(path.join(rt.film, "handoff", "MOTION_PLAN.json")), C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan });
  const shot = reg.doc.shots.find((s) => s.id === "rt_shot"), sc = composeShot(shot, reg, C, { prefix: "eb-" }), f = 450, st = stateAtFrame(C, f);
  const elbow = apply(st.matrices.pilot_rig.elbow_r, reg.doc.identities[0].landmarks.elbow_r), comp = buildComposition(path.join(out, "comp"), { id: "eb", scene: sc, frameRange: [440, 460], registry: reg });
  const c1 = await capture(comp, rt.film, [f], path.join(out, "with"), { id: "eb" }), c0 = await capture(comp, rt.film, [f], path.join(out, "without"), { id: "eb", perturb: `document.getElementById("eb-pilot_rig--pilot_underpaint--pilot_underpaint").setAttribute("visibility","hidden")` });
  const holes = (file) => { const p = readPNG(file); let n = 0; for (let y = Math.round(elbow[1] - 18); y <= Math.round(elbow[1] + 18); y++) for (let x = Math.round(elbow[0] - 18); x <= Math.round(elbow[0] + 18); x++) if (Math.hypot(x + 0.5 - elbow[0], y + 0.5 - elbow[1]) <= 17 && MAG(px(p, x, y))) n++; return n; }; // r17 < owned underpaint radius (15 units × 1.2 = 18 px)
  const order = sc.order.FOCAL, iu = order.findIndex((x) => x.includes("pilot_underpaint")), ifo = order.findIndex((x) => x.includes("--pilot_forearm--"));
  return { frame: f, elbow_angle: st.matrices ? C.solveConstraints(f, C.evalPrimary(f, shot), C.contactsAt(f)).state.pilot_rig.theta.elbow_r : null, elbow_screen: elbow, holes_with_underpaint: holes(c1.files[0]), holes_without: holes(c0.files[0]), underpaint_below_forearm: iu >= 0 && ifo >= 0 && iu < ifo, frames: [c1.files[0], c0.files[0]], failures: [...c1.failures, ...c0.failures] };
}

/** B2 on the REAL Ines contract: hv2_film001 plan entries ines_forearm_r (hidden surface elbow_inner_sleeve) + ines_elbow_r_underpaint, delivered as
 *  DIAGNOSTIC rasters built at the Ines identity landmarks (master px = canonical + 20). Returns intake results and loader findings. */
export async function inesUnderpaintContract(dir) {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), { runCheck } = await import("../../engine/tools/art_bridge_check.mjs");
  fs.rmSync(dir, { recursive: true, force: true }); const film = path.join(dir, "film"), src = path.join(dir, "delivered"); fs.cpSync(path.join(REPO, "films", "hv2_film001"), film, { recursive: true, filter: (s) => !s.includes(`${path.sep}qa${path.sep}`) }); fs.mkdirSync(src, { recursive: true });
  const doc0 = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), L = doc0.identities.find((i) => i.id === "ines").landmarks, O = 20, m = (k) => [L[k][0] + O, L[k][1] + O];
  const box = (p, a0, b0, r, e = 10) => { const L0 = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]), u = [(b0[0] - a0[0]) / L0, (b0[1] - a0[1]) / L0], a = [a0[0] - u[0] * e, a0[1] - u[1] * e], LL = L0 + 2 * e, d = [p[0] - a[0], p[1] - a[1]], x = d[0] * u[0] + d[1] * u[1], y = -d[0] * u[1] + d[1] * u[0], qx = Math.abs(x - LL / 2) - LL / 2, qy = Math.abs(y) - r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); };
  const shapes = { torso: { rgb: [190, 150, 60], sdf: (p) => box(p, m("neck"), m("pelvis"), 70) }, head: { rgb: [170, 120, 90], sdf: (p) => Math.hypot(p[0] - m("head_top")[0], p[1] - (m("head_top")[1] + 90)) - 85 }, upper: { rgb: [190, 150, 60], sdf: (p) => box(p, m("shoulder_r"), m("elbow_r"), 22) }, fore: { rgb: [200, 160, 70], sdf: (p) => box(p, m("elbow_r"), m("wrist_r"), 20) }, under: { rgb: [150, 110, 40], sdf: (p) => Math.hypot(p[0] - m("elbow_r")[0], p[1] - m("elbow_r")[1]) - 28 } };
  const draw = (file, W, H, list, off) => { const px = new Uint8Array(W * H * 4); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) for (const s of list) { const cov = Math.max(0, Math.min(1, 0.5 - s.sdf([x + 0.5 + off[0], y + 0.5 + off[1]]))); if (!cov) continue; const i = (y * W + x) * 4, A0 = px[i + 3] / 255, Ao = cov + A0 * (1 - cov); for (let c = 0; c < 3; c++) px[i + c] = Math.round((s.rgb[c] * cov + px[i + c] * A0 * (1 - cov)) / (Ao || 1)); px[i + 3] = Math.round(Ao * 255); } writeRGBA(file, W, H, px); };
  const side = (file, names, off) => fs.writeFileSync(file, JSON.stringify({ landmarks: Object.fromEntries(names.map((k) => [k, [m(k)[0] - off[0], m(k)[1] - off[1]]])), reviewed_by: "contract-test-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster" }, null, 1));
  draw(path.join(src, "ines_master.png"), 640, 1040, [shapes.torso, shapes.head, shapes.under, shapes.upper, shapes.fore], [0, 0]); side(path.join(src, "ines_master.json"), ["head_top", "neck", "chest", "pelvis", "shoulder_r", "elbow_r", "wrist_r"], [0, 0]);
  const uo = [m("elbow_r")[0] - 40, m("elbow_r")[1] - 40]; draw(path.join(src, "under.png"), 80, 80, [shapes.under], uo); side(path.join(src, "under.json"), ["elbow_r", "shoulder_r", "wrist_r"], uo);
  const fo = [m("elbow_r")[0] - 50, m("elbow_r")[1] - 40]; draw(path.join(src, "fore.png"), 110, 170, [shapes.fore], fo); side(path.join(src, "fore.json"), ["elbow_r", "wrist_r", "shoulder_r"], fo);
  const prov = "DIAGNOSTIC_FIXTURE", op = { reviewer: "contract-test-operator", scope_note: "DIAGNOSTIC_ONLY" }, steps = {};
  steps.master = (await I.ingestMaster({ film, asset: "ines_master", file: path.join(src, "ines_master.png"), landmarks: path.join(src, "ines_master.json"), provenance: prov })).status;
  steps.review = (await I.reviewMaster({ film, identity: "ines", verdict: "APPROVED", ...op })).verdict;
  steps.underpaint = (await I.ingestPart({ film, asset: "ines_elbow_r_underpaint", file: path.join(src, "under.png"), landmarks: path.join(src, "under.json"), provenance: prov })).status;
  steps.forearm = (await I.ingestPart({ film, asset: "ines_forearm_r", file: path.join(src, "fore.png"), landmarks: path.join(src, "fore.json"), provenance: prov })).status;
  const doc = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), fa = doc.assets.find((a) => a.id === "ines_forearm_r"), up = doc.assets.find((a) => a.id === "ines_elbow_r_underpaint");
  const chk = await runCheck({ root: film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json" }), forearmUnderpaintErrors = chk.errors.filter((e) => e.code === "MISSING_UNDERPAINT" && e.record_id === "ines_forearm_r");
  // targeted refusal: remove the ownership link from the plan and re-ingest
  const planF = path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json"), plan = J(planF); plan.assets.find((a) => a.asset_id === "ines_forearm_r").surface_underpaint = {}; fs.writeFileSync(planF, JSON.stringify(plan, null, 1));
  const refusal = await I.ingestPart({ film, asset: "ines_forearm_r", file: path.join(src, "fore.png"), landmarks: path.join(src, "fore.json"), provenance: prov }).then((r) => `ACCEPTED ${r.status}`, (e) => `${e.code || ""} ${e.message}`);
  return { steps, forearm: { hidden_surfaces: fa?.hidden_surfaces, underpaint_asset_ids: fa?.underpaint_asset_ids, canonical_rect: fa?.canonical_rect }, underpaint: { kind: up?.kind, draw_order: up?.draw_order_constraints }, forearm_missing_underpaint_errors: forearmUnderpaintErrors.length, refusal_without_link: refusal };
}
