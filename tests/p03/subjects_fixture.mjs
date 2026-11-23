// P03 two-unlike-subject DIAGNOSTIC fixture film, built and registered through the REAL intake API (export → ingest-master → review →
// resume → ingest-part → review-part → approve-state → approve-edge). Rasters are flat-coloured DIAGNOSTIC_FIXTURE stand-ins produced here
// from signed-distance shapes — NOT style images, NOT target art, never presented as art; every approval is a labelled DIAGNOSTIC operator
// verdict (TEST_TRUST, `.diagnostic_namespace`), which production gates refuse.
//   subject 1 "nova"  : CHARACTER biped — torso, head, hair tuft, eye (open/closed channel), mouth (rest/open/mid channel), right arm with
//                       open/grip hand states + elbow underpaint, two legs with feet (plant sockets)
//   subject 2 "lumen" : CHARACTER creature — body blob, two-segment neck chain, head with a single large eye (open/closed channel), two-segment
//                       tail, no limbs, no mouth (an unlike topology: lag/follow/blink/gaze must transfer from rig data, not from a biped template)
//   mechanism "lever" : MACHINE — base + hinged arm with a handle socket; reacts to the biped's pull (HINGE_FOLLOW)
// Nothing in the engine knows these names; tests address them only through the manifest.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const toMaster = (c) => [2 * c[0] + 40, 2 * c[1] + 30];
const segD = (p, a, b) => { const ab = [b[0] - a[0], b[1] - a[1]], ap = [p[0] - a[0], p[1] - a[1]], t = Math.max(0, Math.min(1, (ap[0] * ab[0] + ap[1] * ab[1]) / (ab[0] ** 2 + ab[1] ** 2 || 1))); return Math.hypot(ap[0] - t * ab[0], ap[1] - t * ab[1]); };
const boxD = (p, a0, b0, r, e = 8) => { const L0 = Math.hypot(b0[0] - a0[0], b0[1] - a0[1]), u = [(b0[0] - a0[0]) / L0, (b0[1] - a0[1]) / L0], a = [a0[0] - u[0] * e, a0[1] - u[1] * e], L = L0 + 2 * e, d = [p[0] - a[0], p[1] - a[1]], x = d[0] * u[0] + d[1] * u[1], y = -d[0] * u[1] + d[1] * u[0], qx = Math.abs(x - L / 2) - L / 2, qy = Math.abs(y) - r; return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0); };
const circ = (c, r) => (p) => Math.hypot(p[0] - c[0], p[1] - c[1]) - r;
const ell = (c, rx, ry) => (p) => (Math.hypot((p[0] - c[0]) / rx, (p[1] - c[1]) / ry) - 1) * Math.min(rx, ry);
function raster(file, W, H, shapes, T = [1, 0, 0, 1, 0, 0]) {
  const px = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = [x + 0.5, y + 0.5], p = [T[0] * q[0] + T[2] * q[1] + T[4], T[1] * q[0] + T[3] * q[1] + T[5]];
    for (const s of shapes) { const d = s.sdf(p) / Math.hypot(T[0], T[1]), cov = Math.max(0, Math.min(1, 0.5 - d)); if (cov <= 0) continue; const i = (y * W + x) * 4, hatch = ((x + 2 * y) % 17) < 2 ? 0.85 : 1;
      const A0 = px[i + 3] / 255, A1 = cov, Ao = A1 + A0 * (1 - A1); for (let c = 0; c < 3; c++) px[i + c] = Math.round((s.rgb[c] * hatch * A1 + px[i + c] * A0 * (1 - A1)) / (Ao || 1)); px[i + 3] = Math.round(Ao * 255); }
  }
  fs.mkdirSync(path.dirname(file), { recursive: true }); writeRGBA(file, W, H, px);
}
const inv = (T) => { const d = T[0] * T[3] - T[1] * T[2]; return [T[3] / d, -T[1] / d, -T[2] / d, T[0] / d, (T[2] * T[5] - T[3] * T[4]) / d, (T[1] * T[4] - T[0] * T[5]) / d]; };
const ap = (T, p) => [T[0] * p[0] + T[2] * p[1] + T[4], T[1] * p[0] + T[3] * p[1] + T[5]];
const sim = (s, deg, tx, ty) => { const r = (deg * Math.PI) / 180; return [s * Math.cos(r), s * Math.sin(r), -s * Math.sin(r), s * Math.cos(r), tx, ty]; };

/* ---------------- subject specifications (canonical units; master pixels = 2×canonical + (40,30)) ---------------- */
export const SUBJECTS = {
  nova: { kind: "CHARACTER", family: "ACTING_HUMAN", face: true, canvas: [700, 1000], root: "pelvis",
    lm: { head_top: [150, 18], head_c: [150, 72], eye_c: [168, 66], eye_l: [158, 66], mouth_c: [164, 100], mouth_l: [154, 100], brow_c: [166, 46], brow_l: [152, 50], brow_r: [180, 50], hair_root: [128, 30], hair_mid: [112, 20], hair_tip: [96, 14], neck: [150, 125], chest: [150, 160], pelvis: [150, 290],
      shoulder_r: [190, 150], upper_arm_mid: [200, 185], elbow_r: [210, 220], forearm_mid: [216, 255], wrist_r: [222, 290], knuckle_r: [230, 325], thumb_r: [240, 300],
      hip_l: [132, 300], thigh_l_mid: [130, 335], knee_l: [128, 370], ankle_l: [126, 438], toe_l: [150, 446], hip_r: [168, 300], thigh_r_mid: [171, 335], knee_r: [174, 370], ankle_r: [176, 438], toe_r: [200, 446] },
    joints: [["pelvis", null, "pelvis", [-25, 25]], ["chest", "pelvis", "chest", [-25, 25]], ["head", "chest", "neck", [-35, 35]], ["hair", "head", "hair_root", [-45, 45]], ["shoulder_r", "chest", "shoulder_r", [-170, 170]], ["elbow_r", "shoulder_r", "elbow_r", [-150, 150]], ["wrist_r", "elbow_r", "wrist_r", [-70, 70]],
      ["hip_l", "pelvis", "hip_l", [-80, 80]], ["knee_l", "hip_l", "knee_l", [-130, 130]], ["ankle_l", "knee_l", "ankle_l", [-50, 50]], ["hip_r", "pelvis", "hip_r", [-80, 80]], ["knee_r", "hip_r", "knee_r", [-130, 130]], ["ankle_r", "knee_r", "ankle_r", [-50, 50]]],
    parts: { // name: [joint, pivot landmark, 3 landmarks, shape(M) , in master?, kind]
      torso: ["chest", "chest", ["neck", "chest", "pelvis"], (M) => ({ rgb: [70, 110, 170], sdf: (p) => segD(p, M.neck, M.pelvis) - 80 })],
      thigh_l: ["hip_l", "hip_l", ["hip_l", "thigh_l_mid", "knee_l"], (M) => ({ rgb: [60, 70, 110], sdf: (p) => boxD(p, M.hip_l, M.knee_l, 24) })],
      shin_l: ["knee_l", "knee_l", ["knee_l", "ankle_l", "toe_l"], (M) => ({ rgb: [80, 90, 130], sdf: (p) => Math.min(boxD(p, M.knee_l, M.ankle_l, 20), segD(p, M.ankle_l, M.toe_l) - 14) })],
      thigh_r: ["hip_r", "hip_r", ["hip_r", "thigh_r_mid", "knee_r"], (M) => ({ rgb: [60, 70, 110], sdf: (p) => boxD(p, M.hip_r, M.knee_r, 24) })],
      shin_r: ["knee_r", "knee_r", ["knee_r", "ankle_r", "toe_r"], (M) => ({ rgb: [80, 90, 130], sdf: (p) => Math.min(boxD(p, M.knee_r, M.ankle_r, 20), segD(p, M.ankle_r, M.toe_r) - 14) })],
      head: ["head", "neck", ["head_top", "head_c", "neck"], (M) => ({ rgb: [235, 190, 150], sdf: (p) => Math.min(circ(M.head_c, 108)(p), segD(p, M.head_c, M.neck) - 34) })],
      hair: ["hair", "hair_root", ["hair_root", "hair_mid", "hair_tip"], (M) => ({ rgb: [120, 60, 50], sdf: (p) => segD(p, M.hair_root, M.hair_tip) - 12 })],
      eye_open: ["head", "eye_c", ["eye_c", "eye_l", "head_c"], (M) => ({ rgb: [250, 250, 245], sdf: circ(M.eye_c, 13) }), { state: true }],
      mouth_rest: ["head", "mouth_c", ["mouth_c", "mouth_l", "head_c"], (M) => ({ rgb: [150, 70, 70], sdf: (p) => boxD(p, M.mouth_l, M.mouth_c, 3, 2) }), { state: true }],
      underpaint: ["elbow_r", "elbow_r", ["elbow_r", "upper_arm_mid", "forearm_mid"], (M) => ({ rgb: [170, 115, 85], sdf: circ(M.elbow_r, 28) }), { kind: "UNDERPAINT" }],
      upper_arm: ["shoulder_r", "shoulder_r", ["shoulder_r", "upper_arm_mid", "elbow_r"], (M) => ({ rgb: [200, 140, 100], sdf: (p) => boxD(p, M.shoulder_r, M.elbow_r, 24) })],
      forearm: ["elbow_r", "elbow_r", ["elbow_r", "forearm_mid", "wrist_r"], (M) => ({ rgb: [215, 160, 115], sdf: (p) => boxD(p, M.elbow_r, M.wrist_r, 22) })],
      hand_open: ["wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: [235, 185, 145], sdf: (p) => Math.min(segD(p, M.wrist_r, M.knuckle_r) - 24, segD(p, M.wrist_r, [M.knuckle_r[0] + 30, M.knuckle_r[1] - 16]) - 9) }), { state: true }],
    },
    states_only: { // drawings that exist only as STATE edits of the master (never in the master pixels)
      eye_closed: ["head", "eye_c", ["eye_c", "eye_l", "head_c"], (M) => ({ rgb: [200, 140, 110], sdf: (p) => boxD(p, [M.eye_c[0] - 22, M.eye_c[1]], [M.eye_c[0] + 22, M.eye_c[1]], 3, 2) })],
      mouth_open: ["head", "mouth_c", ["mouth_c", "mouth_l", "head_c"], (M) => ({ rgb: [120, 40, 50], sdf: ell([(M.mouth_c[0] + M.mouth_l[0]) / 2, M.mouth_c[1] + 4], 16, 12) })],
      mouth_mid: ["head", "mouth_c", ["mouth_c", "mouth_l", "head_c"], (M) => ({ rgb: [130, 50, 55], sdf: ell([(M.mouth_c[0] + M.mouth_l[0]) / 2, M.mouth_c[1] + 2], 14, 6) })],
      hand_grip: ["wrist_r", "wrist_r", ["wrist_r", "knuckle_r", "thumb_r"], (M) => ({ rgb: [225, 170, 130], sdf: circ([(M.wrist_r[0] + M.knuckle_r[0]) / 2, (M.wrist_r[1] + M.knuckle_r[1]) / 2], 38) })],
    },
    // approved VECTOR drawings (delivered as SVG in their own frame, registered by landmarks): brow neutral ↔ raised are HOMOLOGOUS; brow_bad is not
    vectors: { brow_neutral: { joint: "head", pivot: "brow_c", lms: ["brow_c", "brow_l", "brow_r"], slot: true, fill: "#5a3028", d: "M152 50 C158 46 174 46 180 50 L180 53 C174 50 158 50 152 53 Z" },
      brow_raised: { joint: "head", pivot: "brow_c", lms: ["brow_c", "brow_l", "brow_r"], fill: "#5a3028", d: "M152 44 C158 38 174 38 180 44 L180 47 C174 42 158 42 152 47 Z" },
      brow_bad: { joint: "head", pivot: "brow_c", lms: ["brow_c", "brow_l", "brow_r"], fill: "#5a3028", d: "M152 46 L180 46 L180 53 Z" } },
    master_order: ["thigh_l", "shin_l", "torso", "thigh_r", "shin_r", "hair", "head", "eye_open", "mouth_rest", "underpaint", "upper_arm", "forearm", "hand_open"],
    sockets: [{ id: "nova_grip", joint_id: "wrist_r", local_xy: [4, 28], semantic_role: "palm grip centre" }, { id: "nova_sole_l", joint_id: "ankle_l", local_xy: [10, 8], semantic_role: "left sole plant" }, { id: "nova_sole_r", joint_id: "ankle_r", local_xy: [10, 8], semantic_role: "right sole plant" }],
    ik: [["arm_r_ik", ["shoulder_r", "elbow_r", "wrist_r"], -1], ["leg_l_ik", ["hip_l", "knee_l", "ankle_l"], -1], ["leg_r_ik", ["hip_r", "knee_r", "ankle_r"], -1]],
    channels: [{ id: "eyes", kind: "EYES", slots: ["nova_eye_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "closed", asset_bindings: { nova_eye_open: "nova_eye_closed" } }] },
      { id: "mouth", kind: "MOUTH", slots: ["nova_mouth_rest"], default: "rest", states: [{ id: "rest", asset_bindings: {} }, { id: "open", asset_bindings: { nova_mouth_rest: "nova_mouth_open" } }, { id: "mid", asset_bindings: { nova_mouth_rest: "nova_mouth_mid" } }] }],
    pose_states: [["open", {}], ["grip", { nova_hand_open: "nova_hand_grip" }]], edges: [["open", "grip"]],
    semantics: { pelvis: "whole figure pivots at the hips", chest: "torso bends at the waist", head: "head turns at the neck", hair: "tuft hinges at its root", shoulder_r: "sleeve separates under the shoulder line", elbow_r: "inner elbow is underpaint", wrist_r: "hand separates at the cuff", hip_l: "leg hinges at the hip", knee_l: "knee bends", ankle_l: "foot hinges", hip_r: "leg hinges at the hip", knee_r: "knee bends", ankle_r: "foot hinges" } },
  lumen: { kind: "CHARACTER", family: "ANIMAL_OR_ORGANISM", face: true, canvas: [760, 820], root: "body",
    lm: { body_c: [200, 300], body_top: [200, 245], body_bot: [200, 352], neck_base: [238, 262], neck_mid: [262, 230], neck_joint: [280, 200], neck2_mid: [292, 170], head_base: [300, 140], head_c: [306, 118], eye_c: [318, 112], eye_l: [306, 112], tail_base: [132, 318], tail_mid: [106, 312], tail_joint: [80, 300], tail2_mid: [60, 282], tail_tip: [42, 262] },
    joints: [["body", null, "body_c", [-20, 20]], ["neck1", "body", "neck_base", [-60, 60]], ["neck2", "neck1", "neck_joint", [-60, 60]], ["head", "neck2", "head_base", [-50, 50]], ["tail1", "body", "tail_base", [-60, 60]], ["tail2", "tail1", "tail_joint", [-70, 70]]],
    parts: {
      tail2: ["tail2", "tail_joint", ["tail_joint", "tail2_mid", "tail_tip"], (M) => ({ rgb: [90, 150, 120], sdf: (p) => segD(p, M.tail_joint, M.tail_tip) - 12 })],
      tail1: ["tail1", "tail_base", ["tail_base", "tail_mid", "tail_joint"], (M) => ({ rgb: [80, 140, 110], sdf: (p) => segD(p, M.tail_base, M.tail_joint) - 17 })],
      body: ["body", "body_c", ["body_c", "body_top", "body_bot"], (M) => ({ rgb: [70, 130, 100], sdf: ell(M.body_c, 150, 104) })],
      neck1: ["neck1", "neck_base", ["neck_base", "neck_mid", "neck_joint"], (M) => ({ rgb: [85, 145, 115], sdf: (p) => boxD(p, M.neck_base, M.neck_joint, 20) })],
      neck2: ["neck2", "neck_joint", ["neck_joint", "neck2_mid", "head_base"], (M) => ({ rgb: [95, 155, 125], sdf: (p) => boxD(p, M.neck_joint, M.head_base, 17) })],
      head: ["head", "head_base", ["head_base", "head_c", "eye_l"], (M) => ({ rgb: [110, 170, 135], sdf: circ(M.head_c, 62) })],
      eye_open: ["head", "eye_c", ["eye_c", "eye_l", "head_c"], (M) => ({ rgb: [245, 235, 120], sdf: circ(M.eye_c, 17) }), { state: true }],
    },
    states_only: { eye_closed: ["head", "eye_c", ["eye_c", "eye_l", "head_c"], (M) => ({ rgb: [80, 130, 100], sdf: (p) => boxD(p, [M.eye_c[0] - 32, M.eye_c[1]], [M.eye_c[0] + 32, M.eye_c[1]], 4, 2) })] },
    master_order: ["tail2", "tail1", "body", "neck1", "neck2", "head", "eye_open"],
    sockets: [{ id: "lumen_eye", joint_id: "head", local_xy: [18, -28], semantic_role: "eye centre (gaze origin)" }], ik: [],
    channels: [{ id: "eye", kind: "EYES", slots: ["lumen_eye_open"], default: "open", states: [{ id: "open", asset_bindings: {} }, { id: "closed", asset_bindings: { lumen_eye_open: "lumen_eye_closed" } }] }],
    pose_states: [["idle", {}]], edges: [],
    semantics: { body: "whole creature pivots at its centre of mass", neck1: "neck hinges at the body", neck2: "upper neck hinges", head: "head hinges on the neck", tail1: "tail hinges at the body", tail2: "tail tip hinges" } },
  lever: { kind: "MACHINE", family: "MACHINE_OR_MECHANISM", face: false, canvas: [300, 560], root: "base",
    lm: { base_c: [70, 222], base_l: [44, 236], pivot: [70, 210], arm_mid: [70, 135], handle: [70, 60] },
    joints: [["base", null, "base_c", [-1, 1]], ["arm", "base", "pivot", [-75, 75]]],
    parts: { base: ["base", "base_c", ["base_c", "base_l", "pivot"], (M) => ({ rgb: [110, 110, 120], sdf: (p) => boxD(p, [M.base_c[0] - 40, M.base_c[1]], [M.base_c[0] + 40, M.base_c[1]], 24, 0) })],
      arm: ["arm", "pivot", ["pivot", "arm_mid", "handle"], (M) => ({ rgb: [200, 80, 60], sdf: (p) => Math.min(segD(p, M.pivot, M.handle) - 9, circ(M.handle, 20)(p)) })] },
    states_only: {}, master_order: ["arm", "base"],
    sockets: [{ id: "lever_handle", joint_id: "arm", local_xy: [0, -150], semantic_role: "handle grip point" }], ik: [], channels: [], pose_states: [["rest", {}]], edges: [],
    semantics: { base: "fixed base", arm: "arm rotates about the hinge pin" } },
};
export const WORLD = { origin: [-500, -300], size: [2000, 1300], density: 1 }; // covers both shot cameras (zoom 1.4 / 1.6) with overscan
export const WLM = { plate_tl: [-500, -300], plate_tr: [1500, -300], plate_bl: [-500, 1000], plate_mid: [500, 350] };
function worldRaster(file) {
  const W = WORLD.size[0] * WORLD.density, H = WORLD.size[1] * WORLD.density, px = new Uint8Array(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, floor = y > 0.757 * H, g = (x % 80 < 2 || y % 80 < 2) ? 0.85 : 1; px[i] = Math.round((floor ? 150 : 60 + 90 * x / W) * g); px[i + 1] = Math.round((floor ? 130 : 110 + 80 * y / H) * g); px[i + 2] = Math.round((floor ? 110 : 170) * g); px[i + 3] = 255; }
  fs.mkdirSync(path.dirname(file), { recursive: true }); writeRGBA(file, W, H, px);
}
/* ---------------- film build ---------------- */
export function buildSubjects(dir) {
  fs.rmSync(dir, { recursive: true, force: true }); const film = path.join(dir, "film"), src = path.join(dir, "delivered"); fs.mkdirSync(path.join(film, "handoff"), { recursive: true }); fs.mkdirSync(src, { recursive: true });
  const files = {}, assets = [], rigs = [], identities = [], plan = [];
  const P = (asset_id, identity, kind, order, o) => ({ asset_id, identity_id: identity, kind, manufacturing_order: order, derived_from: order === 1 ? null : `${identity}_master`, view_id: "front", pose_id: o.pose ?? null, expression_id: null, alpha_mode: o.alpha || "STRAIGHT", joint_id: o.joint ?? null, pivot_landmark_id: o.pivot ?? null, pivot_xy: o.pivot_xy ?? null, hidden_surfaces: [], surface_underpaint: {}, draw_order: o.order || [], shots: o.shots || ["p03_shot_a", "p03_shot_b"], why: o.why, depth_band: o.band || "FOCAL", overscan_rect: null });
  for (const [sid, S] of Object.entries(SUBJECTS)) {
    const M = Object.fromEntries(Object.entries(S.lm).map(([k, v]) => [k, toMaster(v)])), shape = (spec) => spec[3](M);
    files[`${sid}_master`] = path.join(src, `${sid}_master.png`); raster(files[`${sid}_master`], S.canvas[0], S.canvas[1], S.master_order.map((n) => shape(S.parts[n])));
    files[`${sid}_master_landmarks`] = path.join(src, `${sid}_master.landmarks.json`); fs.writeFileSync(files[`${sid}_master_landmarks`], JSON.stringify({ landmarks: M, reviewed_by: "p03-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)" }, null, 1));
    plan.push(P(`${sid}_master`, sid, "MASTER", 1, { why: `canonical ${sid} identity` }));
    for (const [name, v] of Object.entries(S.vectors || {})) { const aid = `${sid}_${name}`, T = sim(1.6, 12, 30, -40), Ti = inv(T), fx = (q) => ap(Ti, q).map((c) => +c.toFixed(3)); // delivered frame: canonical = T · delivered
      const d = v.d.replace(/(-?\d+\.?\d*) (-?\d+\.?\d*)/g, (_, x, y) => fx([+x, +y]).join(" "));
      files[aid] = path.join(src, `${aid}.svg`); fs.writeFileSync(files[aid], `<svg xmlns="http://www.w3.org/2000/svg"><path d="${d}" fill="${v.fill}"/></svg>\n`);
      files[`${aid}_landmarks`] = path.join(src, `${aid}.landmarks.json`); fs.writeFileSync(files[`${aid}_landmarks`], JSON.stringify({ landmarks: Object.fromEntries(v.lms.map((n) => [n, fx(S.lm[n])])), reviewed_by: "p03-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC vector (operator-confirmed)" }, null, 1));
      plan.push(P(aid, sid, "VECTOR_PATH", v.slot ? 2 : 3, { joint: v.joint, pivot: v.pivot, why: `${sid} ${name} (approved vector drawing)` })); }
    // parts delivered as provider-like edits at their own scale/rotation (pixel → master transform T)
    let k = 0; const all = { ...S.parts, ...S.states_only };
    for (const [name, spec] of Object.entries(all)) {
      const [joint, pivot, lms] = spec, aid = `${sid}_${name}`, T = sim(1 / (0.9 + 0.05 * (k % 4)), [6, -8, 0, 10][k % 4], 0, 0); k++;
      // fit the canvas to the transformed shape bbox (sampled): pixel = inv(T)·master
      const pts = Object.values(M), Ti = inv(T), q = pts.map((p) => ap(Ti, p)); const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
      const x0 = Math.min(...xs) - 120, y0 = Math.min(...ys) - 120, W = Math.ceil(Math.max(...xs) - x0 + 120), H = Math.ceil(Math.max(...ys) - y0 + 120), T2 = [T[0], T[1], T[2], T[3], T[0] * x0 + T[2] * y0 + T[4], T[1] * x0 + T[3] * y0 + T[5]];
      // crop to the actual shape bounding box (+margin) so parts are part-sized
      const sh = shape(spec), T2i = inv(T2); let bx0 = 1e9, by0 = 1e9, bx1 = -1e9, by1 = -1e9; for (let y = 0; y < H; y += 3) for (let x = 0; x < W; x += 3) { const p = ap(T2, [x, y]); if (sh.sdf(p) < 6) { bx0 = Math.min(bx0, x); by0 = Math.min(by0, y); bx1 = Math.max(bx1, x); by1 = Math.max(by1, y); } }
      const cx0 = Math.max(0, bx0 - 24), cy0 = Math.max(0, by0 - 24), T3 = [T2[0], T2[1], T2[2], T2[3], T2[0] * cx0 + T2[2] * cy0 + T2[4], T2[1] * cx0 + T2[3] * cy0 + T2[5]];
      files[aid] = path.join(src, `${aid}.png`); raster(files[aid], Math.ceil(bx1 - cx0 + 24), Math.ceil(by1 - cy0 + 24), [sh], T3);
      files[`${aid}_landmarks`] = path.join(src, `${aid}.landmarks.json`); fs.writeFileSync(files[`${aid}_landmarks`], JSON.stringify({ landmarks: Object.fromEntries(lms.map((n) => [n, ap(inv(T3), M[n])])), reviewed_by: "p03-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)" }, null, 1));
      const isState = !S.parts[name] || spec[4]?.state, pose = S.pose_states.find(([, b]) => Object.values(b).includes(aid))?.[0] ?? null;
      plan.push(P(aid, sid, spec[4]?.kind || "PART", S.states_only[name] ? 3 : 2, { joint, pivot, pose, why: `${sid} ${name}${S.states_only[name] ? " (state edit of the approved master)" : ""}` }));
    }
    const J = S.joints.map(([id, parent, lm, lim]) => ({ id, parent_id: parent, rest_xy: S.lm[lm], rotation_limits_deg: lim, scale_limits: [1, 1], driven_part_ids: [] }));
    const rp = [...Object.keys(S.parts), ...Object.entries(S.vectors || {}).filter(([, v]) => v.slot).map(([n]) => n)].map((n) => ({ asset_id: `${sid}_${n}`, joint_id: S.parts[n]?.[0] ?? S.vectors[n].joint, local_to_joint_matrix: [1, 0, 0, 1, 0, 0], occlusion_owner_id: `${sid}_${n}`, material_owner_id: sid }));
    const st = (id, bind) => ({ id, asset_bindings: bind, landmark_correspondence: S.lm.wrist_r ? ["wrist_r", "knuckle_r"] : Object.keys(S.lm).slice(0, 2), contact_set: [], view_facing: "front", required_underpaint: [], approved_review_id: null });
    rigs.push({ id: `${sid}_rig`, identity_id: sid, root_part: S.root, joints: J, render_parts: rp, sockets: S.sockets, pose_states: S.pose_states.map(([i, b]) => st(i, b)), view_states: [], constraints: S.ik.map(([id, chain, b]) => ({ id, type: "TWO_BONE_IK", chain, bend_sign: b })),
      state_channels: S.channels, allowed_state_edges: S.edges.map(([from, to]) => ({ from, to, mode: "REGISTERED_SWAP", max_transition_frames: 0, landmark_ids: [S.lm.wrist_r ? "wrist_r" : Object.keys(S.lm)[0]], mask_or_occluder_id: null, approved_assembly_review_id: null })) });
    identities.push({ id: sid, kind: S.kind, canonical_asset_id: `${sid}_master`, master_sha256: "0".repeat(64), landmarks: S.lm, palette_roles: {}, material_owners: [sid], source_method_ids: ["F01", "F05", "F64"], allowed_views: ["front"], required_shot_ids: ["p03_shot_a", "p03_shot_b"], approved_review_id: null });
  }
  files.world = path.join(src, "world_plate.png"); worldRaster(files.world); files.world_landmarks = path.join(src, "world_plate.landmarks.json");
  fs.writeFileSync(files.world_landmarks, JSON.stringify({ landmarks: Object.fromEntries(Object.entries(WLM).map(([k, c]) => [k, [(c[0] - WORLD.origin[0]) * WORLD.density, (c[1] - WORLD.origin[1]) * WORLD.density]])), reviewed_by: "p03-operator (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster (operator-confirmed)" }, null, 1));
  identities.push({ id: "p03_world", kind: "WORLD", canonical_asset_id: "p03_world_far", master_sha256: "0".repeat(64), landmarks: WLM, palette_roles: {}, material_owners: ["p03_world"], source_method_ids: ["F08"], allowed_views: ["front"], required_shot_ids: ["p03_shot_a", "p03_shot_b"], approved_review_id: null });
  plan.push(P("p03_world_far", "p03_world", "WORLD_PLANE", 1, { alpha: "OPAQUE", band: "FAR", why: "diagnostic room plate" }));
  // two short shots: A = biped grips the lever handle and pulls (weight transfer, planted feet, lever reaction, blink, speech, follow-through)
  //                  B = creature idles and looks at the biped's position (lag through the neck chain, tail follow, single-eye blink, gaze)
  const A = { mode: "ARTICULATED", targets: [], view_events: [], secondary_owners: [], causal_effects: [], visibility_effects: [], physics_track_id: null, required_assets: [] };
  const actions = [
    { ...A, id: "nova_pull_lever", shot_id: "p03_shot_a", frame_range: [0, 240], semantic_goal: "biped reaches, grips the lever handle, leans back and pulls it, releases", proof_conditions: ["hand stays on the handle while the lever follows the lean-back", "feet stay planted"], actors: [{ rig_id: "nova_rig", root_world_xy: [560, 520], root_scale: 1 }, { rig_id: "lever_rig", root_world_xy: [700, 600], root_scale: 1 }],
      contact_events: [{ source_socket: "nova_grip", target_socket: "lever_handle", contact_type: "GRIP", start_frame: 70, end_frame: 200, allowed_error_px: 1.5, near_far_relation: "hand in front of the lever arm", release_behavior: "hand opens and returns to its own pose" }, { source_socket: "nova_sole_l", target_socket: "floor", target_world_xy: [0, 0], contact_type: "PLANT", start_frame: 0, end_frame: 240, allowed_error_px: 1.0, near_far_relation: "sole on the floor plane", release_behavior: "stays planted" }, { source_socket: "nova_sole_r", target_socket: "floor", target_world_xy: [0, 0], contact_type: "PLANT", start_frame: 0, end_frame: 240, allowed_error_px: 1.0, near_far_relation: "sole on the floor plane", release_behavior: "stays planted" }],
      pose_events: [{ frame: 0, state_id: "open" }, { frame: 70, state_id: "grip" }, { frame: 200, state_id: "open" }], state_events: [{ frame: 40, channel: "mouth", state: "rest", rig: "nova_rig" }] },
    { ...A, id: "lumen_watch", shot_id: "p03_shot_b", frame_range: [240, 7200], proof_conditions: ["neck chain lags the body; tail follows; eye blinks by state swap"], semantic_goal: "creature idles, notices the lever and turns its head toward it", actors: [{ rig_id: "lumen_rig", root_world_xy: [520, 632], root_scale: 1 }], contact_events: [], pose_events: [{ frame: 240, state_id: "idle" }] },
  ];
  // PLANT targets = the FK sole position at rest placement (a planted foot stays where the approved standing pose puts it)
  const nv = SUBJECTS.nova, plantAt = (lm, local) => [560 + (nv.lm[lm][0] - nv.lm.pelvis[0]) + local[0], 520 + (nv.lm[lm][1] - nv.lm.pelvis[1]) + local[1]];
  actions[0].contact_events[1].target_world_xy = plantAt("ankle_l", [10, 8]); actions[0].contact_events[2].target_world_xy = plantAt("ankle_r", [10, 8]);
  const shots = [{ id: "p03_shot_a", start_frame: 0, end_frame: 240, world_id: "p03_world_w", entry_state: "reach", events: ["grip", "pull", "release"], attention_path: ["hand", "lever"], camera_track_id: "cam_a", required_asset_ids: ["p03_world_far"], exit_state: "released", continuity_to: "p03_shot_b", hold_purpose: "diagnostic pull" },
    { id: "p03_shot_b", start_frame: 240, end_frame: 7200, world_id: "p03_world_w", entry_state: "idle", events: ["notice"], attention_path: ["eye"], camera_track_id: "cam_b", required_asset_ids: ["p03_world_far"], exit_state: "looking", continuity_to: null, hold_purpose: "diagnostic creature acting" }];
  const doc = { schema_version: "2.0.0", project_id: "p03_subjects", production_mode: "COMPLETE_FILM_ART_PACKAGE", status: "PLANNED", stage: { width: 1920, height: 1080, fps: 60, total_frames: 7200, coord_system: "SVG_Y_DOWN_PX", color_space: "sRGB" },
    authority: { script: null, direction: null, style_skill: "skill/SKILL.md", visual_bible: null, source_witness_manifest: "skill/QUESTION_NATIVE_WITNESS_MANIFEST.json" },
    identities, assets, worlds: [{ id: "p03_world_w", identity_id: "p03_world", depth_owners: [{ id: "far", depth_band: "FAR", asset_ids: ["p03_world_far"] }], camera_footprint: [0, 0, 1920, 1080], overscan_rect: [-500, -300, 2000, 1300] }],
    rigs, actions, shots, transitions: [], audio: { narration_file: null, word_alignment_file: null, sfx_events_file: null }, learning: { repair_memory_file: null, compiler_receipts: [] }, evidence: { asset_review_index: null, motion_review_index: null, method_trace_index: null } };
  fs.writeFileSync(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), JSON.stringify(doc, null, 1));
  fs.writeFileSync(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json"), JSON.stringify({ status: "DIAGNOSTIC_P03_SUBJECTS", assets: plan }, null, 1));
  fs.writeFileSync(path.join(film, "handoff", "MOTION_PLAN.json"), JSON.stringify(basePlan(), null, 1));
  fs.mkdirSync(path.join(film, "skill"), { recursive: true }); for (const f of ["SKILL.md", "references/QUESTION_NATIVE_WITNESS_MANIFEST.json"]) fs.copyFileSync(path.join(REPO, "reference", "construct-kurzgesagt-art", f), path.join(film, "skill", path.basename(f)));
  fs.mkdirSync(path.join(film, "learning"), { recursive: true }); fs.writeFileSync(path.join(film, "learning", "REPAIR_MEMORY.json"), fs.readFileSync(path.join(REPO, "films", "hv2_film001", "learning", "REPAIR_MEMORY.json")));
  fs.writeFileSync(path.join(film, ".diagnostic_namespace"), "DIAGNOSTIC P03 two-subject fixture film: test-trusted receipts are valid only here (F087)\n");
  // compile-path testing only: each master borrows the (unapproved) Ines master brief, adapted to that subject's OWN motion contract
  fs.mkdirSync(path.join(film, "art_designs"), { recursive: true });
  for (const [sid, S] of Object.entries(SUBJECTS)) { const d = JSON.parse(fs.readFileSync(path.join(REPO, "films", "hv2_film001", "art_designs", "ines_master.design.json"), "utf8")); d.job_id = `${sid}_master`; d.borrowed_for_compile_path_testing_only = true;
    const cd = d.first_pass_control.character_designs[0]; cd.view_id = "front"; cd.canonical_pose = S.pose_states[0][0]; cd.state_family = S.pose_states.map(([i]) => i); d.output.figure_height_px = 4000;
    d.motion_requirements = { attachment_semantics: S.semantics, contact_semantics: Object.fromEntries(S.sockets.map((s) => [s.id, s.semantic_role])), note: "requirements only" };
    d.molecular_visual_decisions.animation_ancestry.canonical_master_id = `${sid}_master`; d.molecular_visual_decisions.animation_ancestry.intermediate_states = S.pose_states.map(([i]) => i);
    fs.writeFileSync(path.join(film, "art_designs", `${sid}_master.design.json`), JSON.stringify(d, null, 1)); }
  fs.mkdirSync(path.join(film, "story"), { recursive: true }); fs.writeFileSync(path.join(film, "story", "STORY_CONTRACT.json"), JSON.stringify({ provenance: "DIAGNOSTIC_FIXTURE", note: "P03 fixture story stand-in; approval machinery only", claims: [] }, null, 1));
  return { dir, film, src, files, manifest: path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), outbox: path.join(dir, "outbox") };
}
/** DIAGNOSTIC adaptation of the borrowed brief to a subject's OWN family and motion contract: only methods whose source predicate holds for
 *  this subject are kept; a required authored method the donor brief lacks gets a DIAGNOSTIC decision that says so in its own text (these
 *  briefs exist to exercise compile/approval mechanics on fixture rasters; they are never art direction). */
const SRCF = JSON.parse(fs.readFileSync(path.join(REPO, "engine", "methods", "source", "F_SOURCE.json"), "utf8"));
export async function adaptDesign(d, { sid, job, doc, plan }) {
  const C = await import("../../engine/art_bridge/art_contract.mjs"), A = await import("../../engine/art_bridge/art_families.mjs"), S = SUBJECTS[sid];
  d.art_family = S.family; d.subject_profile = { face_visible: !!S.face, ...(S.family === "MACHINE_OR_MECHANISM" ? { mechanism: true } : {}) };
  const req = C.requiredMethods({ design: d, job, doc, plan }), reqIds = new Set(req.map((r) => r.method)), donor = d.method_decisions[0], parts = Object.keys(S.parts).join(", ");
  const have = new Map(d.method_decisions.filter((x) => reqIds.has(x.method_id)).map((x) => [x.method_id, x]));
  for (const r of req) if (!have.has(r.method) && !["ENGINE", "REVIEW"].includes(r.phase)) have.set(r.method, { ...JSON.parse(JSON.stringify(donor)), method_id: r.method, source_clause_sha256: SRCF[r.method]?.sha256,
    applicability_evidence: `DIAGNOSTIC fixture ${sid} (${S.family}): ${r.reason}`, specific_decision: `DIAGNOSTIC ${sid}: ${r.method} decided on the fixture parts ${parts}; each part joins its parent at a named hinge/root landmark`,
    visible_construction_operation: `Draw each ${sid} part (${parts}) as a separate owned plane that overlaps its parent at the join landmark, so the silhouette reads at the hinge/root and the parent owns the hidden overlap`, output_art_components: Object.keys(S.parts) });
  d.method_decisions = [...have.values()];
  const firstStruct = req.find((r) => r.phase === "STRUCTURE")?.method, firstState = req.find((r) => r.phase === "STATE")?.method;
  const walk = (o) => { if (Array.isArray(o)) return o.forEach(walk); if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) { if (k === "chosen_methods" && Array.isArray(v)) { o[k] = v.filter((m) => reqIds.has(m)); if (!o[k].length && firstStruct) o[k] = [firstStruct]; } else walk(v); } }; walk(d.molecular_visual_decisions);
  const topics = {}; for (const t of A.FAMILIES[S.family].topics) { const v = d.construction_topics?.[t], m = (v?.methods || []).filter((x) => reqIds.has(x));
    topics[t] = m.length ? { ...v, methods: m } : { operation: `DIAGNOSTIC ${sid} ${t}: separate owned planes ${parts} joined at their hinge/root landmarks`, visible_result: `each ${sid} part pivots at its own landmark without exposing an unpainted join`, methods: [t === "state_ancestry" && firstState ? firstState : firstStruct] }; }
  d.construction_topics = topics;
  const mc = job.motion_context || {}; d.art_motion_agreement = { ...(d.art_motion_agreement || {}), view_id: mc.view_id ?? "front", motion_representation: "ARTICULATED", state_family: S.pose_states.map(([i]) => i) };
  d.output = { ...d.output, alpha_mode: mc.alpha_requirement ?? d.output.alpha_mode, authored_width_px: S.canvas[0], authored_height_px: S.canvas[1] };
  return d;
}
/** direction-owned motion: deliberately SPARSE primary keys; acting, phrases, constraints and reactions are layered by the engine */
export function basePlan() {
  return { id: "p03_plan",
    placements: { nova_rig: { x: 560, y: 520, scale: 1 }, lever_rig: { x: 760, y: 600, scale: 1 }, lumen_rig: { x: 520, y: 470, scale: 1 } },
    tracks: { nova_rig: { root: { x: [[0, 0], [60, 0], [90, -6, "sine.inOut"], [150, -26, "sine.inOut"], [200, -26], [235, -4, "sine.inOut"]] }, joints: { chest: [[0, 0], [60, 6, "sine.inOut"], [100, -4, "sine.inOut"], [160, -12, "sine.inOut"], [210, 0, "sine.inOut"]], head: [[0, 0], [120, -4, "sine.inOut"], [220, 0, "sine.inOut"]] } },
      lumen_rig: { joints: { neck1: [[240, 0], [330, 18, "sine.inOut"], [420, 12, "sine.inOut"]], head: [[240, 0], [330, -10, "sine.inOut"], [460, -6, "sine.inOut"]], tail1: [[240, 0], [300, 14, "sine.inOut"], [360, -10, "sine.inOut"], [420, 8, "sine.inOut"], [479, 0, "sine.inOut"]] } } },
    reaches: { "nova_pull_lever:nova_grip": { approach: [30, 70], release: [200, 232] } },
    cameras: { cam_a: { x: [[0, 660]], y: [[0, 420]], zoom: [[0, 1.4], [240, 1.5, "sine.inOut"]] }, cam_b: { x: [[240, 560]], y: [[240, 380]], zoom: [[240, 1.6]] } } };
}
/** full registration through the real intake API */
export async function runSubjects(dir, { log = () => {} } = {}) {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), { exportOutbox } = await import("../../engine/tools/art_outbox.mjs"), C = await import("../../engine/art_bridge/art_contract.mjs");
  const rt = buildSubjects(dir), steps = [], step = (name, r) => { steps.push({ step: name, result: r }); log(name, r); return r; }, prov = "DIAGNOSTIC_FIXTURE", op = { reviewer: "p03-operator", scope_note: "DIAGNOSTIC_ONLY: fixture rasters, not target art" };
  const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1"; const TT = { method: "TEST_TRUST", note: "P03 DIAGNOSTIC fixture" };
  try {
    const doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8")), dplan = JSON.parse(fs.readFileSync(path.join(rt.film, "handoff", "ART_DEPENDENCY_PLAN.json"), "utf8")), { jobs } = await I.planJobs({ film: rt.film });
    for (const scope of ["story", "direction"]) step(`approve ${scope} (TEST_TRUST)`, await C.approveScope({ film: rt.film, scope, reviewer: "p03-operator", verdict: "APPROVED", attestation: TT }));
    for (const sid of Object.keys(SUBJECTS)) { const df = path.join(rt.film, "art_designs", `${sid}_master.design.json`), d = JSON.parse(fs.readFileSync(df, "utf8")), mj = jobs.find((j) => j.root_dependency === `${sid}_master`);
      await adaptDesign(d, { sid, job: mj, doc, plan: dplan }); fs.writeFileSync(df, JSON.stringify(d, null, 1));
      step(`approve ${sid} design (TEST_TRUST)`, await C.approveDesign({ film: rt.film, doc, job: mj, reviewer: "p03-operator", verdict: "APPROVED", attestation: TT })); }
    step("export (masters only)", (await exportOutbox({ film: rt.film, out: rt.outbox })).by_status);
    for (const sid of Object.keys(SUBJECTS)) { step(`ingest-master ${sid}`, await I.ingestMaster({ film: rt.film, asset: `${sid}_master`, file: rt.files[`${sid}_master`], landmarks: rt.files[`${sid}_master_landmarks`], provenance: prov })); step(`review-master ${sid}`, await I.reviewMaster({ film: rt.film, identity: sid, verdict: "APPROVED", notes: "landmark overlay checked", ...op })); }
    step("ingest-master world", await I.ingestMaster({ film: rt.film, asset: "p03_world_far", file: rt.files.world, landmarks: rt.files.world_landmarks, provenance: prov })); step("review-master world", await I.reviewMaster({ film: rt.film, identity: "p03_world", verdict: "APPROVED", notes: "plate corners checked", ...op }));
    step("resume/export dependents", (await exportOutbox({ film: rt.film, out: rt.outbox })).by_status);
    for (const [sid, S] of Object.entries(SUBJECTS)) for (const name of [...Object.keys(S.parts), ...Object.keys(S.states_only)]) { const aid = `${sid}_${name}`; step(`ingest-part ${aid}`, (await I.ingestPart({ film: rt.film, asset: aid, file: rt.files[aid], landmarks: rt.files[`${aid}_landmarks`], provenance: prov })).status); step(`review-part ${aid}`, (await I.reviewPart({ film: rt.film, asset: aid, verdict: "APPROVED", ...op })).verdict); }
    for (const [sid, S] of Object.entries(SUBJECTS)) for (const name of Object.keys(S.vectors || {})) { const aid = `${sid}_${name}`; step(`ingest-vector ${aid}`, (await I.ingestVectorPart({ film: rt.film, asset: aid, file: rt.files[aid], landmarks: rt.files[`${aid}_landmarks`], provenance: prov })).status); step(`review-part ${aid}`, (await I.reviewPart({ film: rt.film, asset: aid, verdict: "APPROVED", ...op })).verdict); }
    for (const [sid, S] of Object.entries(SUBJECTS)) { for (const [st] of S.pose_states) step(`approve-state ${sid}.${st}`, (await I.approveState({ film: rt.film, rig: `${sid}_rig`, state: st, verdict: "APPROVED", ...op })).verdict);
      for (const ch of S.channels) for (const st of ch.states) step(`approve-state ${sid}.${ch.id}.${st.id}`, (await I.approveState({ film: rt.film, rig: `${sid}_rig`, state: `${ch.id}.${st.id}`, verdict: "APPROVED", ...op })).verdict);
      for (const [a, b] of S.edges) step(`approve-edge ${sid} ${a}->${b}`, (await I.approveStateEdge({ film: rt.film, rig: `${sid}_rig`, from: a, to: b, verdict: "APPROVED", ...op })).verdict); }
  } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; }
  rt.steps = steps; return rt;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const rt = await runSubjects(path.join(REPO, "hybrid_v2", "work", "p03", "subjects"), { log: (n, r) => console.log(n.padEnd(52), JSON.stringify(r?.status ?? r).slice(0, 140)) });
  console.log("film:", path.relative(REPO, rt.film));
}
