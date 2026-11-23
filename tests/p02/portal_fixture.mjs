// DIAGNOSTIC continuous-portal fixture added to a rehearsal film THROUGH THE REAL INTAKE (ingestMaster + reviewMaster): OUT/MIDDLE/IN plates
// (WORLD identities, kind TRANSITION_PLATE) sharing the measured landmark `portal_centre`, plus an authored aperture MASK, and a CONTINUOUS
// transition contract rt_shot→rt_world_shot over [3480,3600). Rasters are labelled diagnostic gradients — never target art.
import fs from "node:fs"; import path from "node:path";
import { writeRGBA } from "../../engine/art_bridge/png.mjs";
const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json", J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), W = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
const D = 2, C = [240, 135], PL = { portal_centre: C, p_tl: [0, 0], p_tr: [480, 0], p_bl: [0, 270] }, ML = { portal_centre: C, m_tl: [175, 70], m_tr: [305, 70], m_bl: [175, 200] };
function raster(file, w, h, fn) { const px = new Uint8Array(w * h * 4); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y * w + x) * 4, [r, g, b, a] = fn(x, y); px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = a; } writeRGBA(file, w, h, px); }
export async function addPortal(film, { review = true } = {}) {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), src = path.join(film, "..", "delivered_portal"); fs.mkdirSync(src, { recursive: true });
  const doc = J(path.join(film, MF)), plan = J(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json")), ids = { out: "portal_out", mid: "portal_mid", in: "portal_in", mask: "portal_aperture" };
  const tint = { out: [200, 120, 60], mid: [60, 160, 120], in: [90, 90, 200] };
  for (const [k, id] of Object.entries(ids)) {
    const isMask = k === "mask", lmC = isMask ? ML : PL, origin = isMask ? [175, 70] : [0, 0], w = (isMask ? 130 : 480) * D, h = (isMask ? 130 : 270) * D, f = path.join(src, `${id}.png`);
    raster(f, w, h, isMask ? (x, y) => { const r = Math.hypot(x - w / 2, y - h / 2); return [255, 255, 255, r < w * 0.45 ? 255 : 0]; } : (x, y) => { const g = (x % 60 < 4 || y % 60 < 4) ? 0.6 : 1, t = tint[k]; return [Math.round(t[0] * g), Math.round(t[1] * g), Math.round((t[2] + (x / w) * 40) * g), 255]; });
    W(path.join(src, `${id}.landmarks.json`), { landmarks: Object.fromEntries(Object.entries(lmC).map(([n, c]) => [n, [(c[0] - origin[0]) * D, (c[1] - origin[1]) * D]])), reviewed_by: "p02-portal-fixture (DIAGNOSTIC)", method: "exact construction coordinates of this DIAGNOSTIC raster" });
    doc.identities.push({ id: `${id}_w`, kind: "WORLD", canonical_asset_id: id, master_sha256: "0".repeat(64), landmarks: lmC, palette_roles: {}, material_owners: [`${id}_w`], source_method_ids: ["F08"], allowed_views: ["front"], required_shot_ids: ["rt_shot"], approved_review_id: null });
    plan.assets.push({ asset_id: id, identity_id: `${id}_w`, kind: isMask ? "MASK" : "TRANSITION_PLATE", manufacturing_order: 1, derived_from: null, view_id: "front", pose_id: null, expression_id: null, alpha_mode: isMask ? "STRAIGHT" : "OPAQUE", joint_id: null, pivot_landmark_id: null, pivot_xy: null, hidden_surfaces: [], surface_underpaint: {}, draw_order: [], shots: ["rt_shot"], why: `DIAGNOSTIC portal ${k}`, depth_band: "FAR", overscan_rect: null });
  }
  doc.transitions = [{ from_shot: "rt_shot", to_shot: "rt_world_shot", frame_range: [3480, 3600], mode: "CONTINUOUS", reason: "DIAGNOSTIC push through the aperture", continuity_invariant: "aperture centre", out_asset_ids: [ids.out], middle_asset_ids: [ids.mid], in_asset_ids: [ids.in], shared_landmarks: ["portal_centre"], camera_correspondence: "anchor-locked push", mask_or_occluder_ids: [ids.mask], assembly_review_id: null }];
  W(path.join(film, MF), doc); W(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json"), plan);
  const out = {}; for (const id of Object.values(ids)) out[id] = await I.ingestMaster({ film, asset: id, file: path.join(src, `${id}.png`), landmarks: path.join(src, `${id}.landmarks.json`), provenance: "DIAGNOSTIC_FIXTURE" });
  if (review) { const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1"; try { for (const id of Object.values(ids)) await I.reviewMaster({ film, identity: `${id}_w`, verdict: "APPROVED", attestation: { method: "TEST_TRUST" }, reviewer: "p02-rehearsal-simulated-reviewer", scope_note: "DIAGNOSTIC portal" }); } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; } }
  return out;
}
