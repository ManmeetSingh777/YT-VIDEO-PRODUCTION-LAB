// Renders the hydrologist face atlas through faceview.constructFaceView: 4 views × close-acting scale (sclera mode) + 4 expression
// states + gesture-scale (dark-mark mode, as used in the full-body shot) + one-tenth reduction. Output: FIRST_PASS/specimen1_face_atlas.png
import path from "node:path"; import url from "node:url";
import { solvePalette } from "../palette.mjs";
import { constructFaceView } from "../faceview.mjs";
import { compose } from "../emit.mjs";
import { render, sheet, stack, writePNG } from "../render.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "..", "evidence", "stage1");
const { FACE } = await import(url.pathToFileURL(path.join(EV, "DECISION_PLANS", "hydrologist_face.mjs")));
export const FACE_ROLES = { skin: { slot: "main_subject", hue: 48, chroma: 0.085, owners: ["face"], L: 0.8 }, skinShade: { slot: "material_dark_plane", hue: 38, chroma: 0.095, owners: ["face"], L: 0.7 }, skinDeep: { slot: "material_dark_plane", hue: 30, chroma: 0.09, owners: ["face"], L: 0.6 },
  hair: { slot: "secondary_support", hue: 250, chroma: 0.02, owners: ["hair"], L: 0.86 }, hairShade: { slot: "material_dark_plane", hue: 260, chroma: 0.03, owners: ["hair"], L: 0.7 }, brow: { slot: "shadow_anchor", hue: 260, chroma: 0.03, owners: ["brows"], L: 0.45 },
  eyeDark: { slot: "shadow_anchor", hue: 270, chroma: 0.06, owners: ["eyes"], L: 0.22 }, sclera: { slot: "material_light_plane", hue: 90, chroma: 0.01, owners: ["eyes"], L: 0.97 }, mouth: { slot: "shadow_anchor", hue: 20, chroma: 0.1, owners: ["mouth"], L: 0.38 }, cheek: { slot: "accent", hue: 25, chroma: 0.11, owners: ["face"], L: 0.72 },
  field: { slot: "primary_substrate", hue: 95, chroma: 0.05, owners: ["bg"] } };
const pal = solvePalette({ situation: "quiet_light_field", roles: FACE_ROLES, pairs: [{ a: "hair", b: "skin", channel: "hue", min: 40, adjust: "hair" }, { a: "eyeDark", b: "skin", channel: "luminance", min: 4.5, adjust: "eyeDark" }] });
const fd = { ...FACE, colors: pal.roles };
const tile = (view, state, px, role, gaze = true) => { const r = constructFaceView(fd, { view, state, finalHeadPx: px, role, gazeRequired: gaze, center: [0, 0], light: [-0.6, -0.8], layer: 0 }); const s = px * 0.75;
  return { img: render(compose(`${view}.${state}`, r.elements), { W: Math.round(px * 1.5), H: Math.round(px * 1.5), view: [-s, -s, 2 * s, 2 * s], bg: pal.roles.field }), data: r.data }; };
const views = ["front", "three_quarter_left", "profile_left", "rear"].map((v) => tile(v, "concentrating", 220, "ACTING_CUE"));
const states = ["concentrating", "surprised", "relieved", "worried"].map((s) => tile("three_quarter_left", s, 220, "ACTING_CUE"));
const gesture = ["concentrating", "surprised", "relieved"].map((s) => tile("three_quarter_left", s, 100, "ACTING_CUE"));
const tenth = tile("three_quarter_left", "surprised", 22, "ACTING_CUE");
writePNG(path.join(EV, process.argv[2] || "AFTER_REPAIR", "specimen1_face_atlas_latest.png"), stack([sheet(views.map((t) => t.img), 8), sheet(states.map((t) => t.img), 8), sheet([...gesture.map((t) => t.img), tenth.img], 8)], 10));
console.log("modes:", views.map((t) => t.data.eyeMode).join(","), "|", gesture.map((t) => t.data.eyeMode).join(","), "|", tenth.data.eyeMode, "| marks", views.map((t) => t.data.markCount).join(","));
