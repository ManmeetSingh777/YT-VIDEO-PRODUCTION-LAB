// KEEPER — original foundation-test identity (not a reusable template). Faces right, three-quarter head.
// Rig space: hips at (0,0), y down; ground at y = 204 when legs are straight.
import { defineRig } from "../../../engine/lib/rig.mjs";
import { handPath, roles, separate, contrast } from "../../../engine/lib/style.mjs";
import { shape } from "../../../engine/lib/geom.mjs";

export const PAL = roles("keeper", {
  env: "#2c2652", focal: "#3aa391",
  coat: "#3aa391", coatS: "#22646a", coatH: "#62c7ae", collar: "#e7ad3d", collarS: "#b47a22",
  skin: "#eaa47e", skinS: "#c27a5c", blush: "#e46f6a", hair: "#2a1736", hairS: "#1a0d24", hairH: "#4c2c60",
  pants: "#262150", pantsS: "#17133a", boot: "#b8553c", bootS: "#7c3325", sole: "#3a1c22", eye: "#fff6ea", iris: "#22183a", mouth: "#5b2236",
  anchor: "#17133a",
});

export const GROUND = 204;

// hand states share one topology (morph targets): open / grip / point
const hand = (curl, thumbCurl, spread = 0) => handPath({ palmW: 19, palmH: 15, fingers: 4, fLen: 15, fW: 5.4, thumbLen: 11, curl, thumbCurl, spread });
const HAND_OPEN = hand([0, 0, 0, 0], 0, 0.6), HAND_GRIP = hand([0.95, 0.95, 0.95, 0.95], 0.7), HAND_REST = hand([0.35, 0.3, 0.4, 0.5], 0.2);

export function keeper({ P = "k-", x = 0, y = 0, scale = 1, flip = false, ctx, support = "#2a2048" } = {}) {
  // lessons scoped to this identity are read BEFORE drawing (repair-learning → construction)
  // construction context: identity + family + the value class of the support it stands on (drives Q01's operation)
  const cx = { subject_id: "keeper", family: "HUMAN_GESTURE_FULL", world_value: contrast(support, "#000000") < 2.6 ? "dark" : "light" };
  ctx && ctx.lessonsFor(cx);
  const shadeK = ctx ? ctx.param("keeper.shadeK", 9, cx) : 9;
  const C = Object.assign({}, PAL);
  // Q01 repair: on a dark support, garment limbs are raised above the support value (near > far); light support: unchanged
  const limbC = ctx ? ctx.param("style.limbSupportContrast", cx.world_value === "dark" ? 1.9 : 1, cx) : 1;
  C.pantsN = separate(PAL.pants, support, limbC, "#8f86d8"); C.pantsF = separate(PAL.pantsS, support, limbC * 0.78, "#8f86d8");
  C.sleeveF = separate(PAL.coatS, support, limbC * 0.85, "#3aa391");
  const sk = (id, d, base, shade, k = shadeK, extra = {}) => ({ surf: Object.assign({ id, d, base, shade, k }, extra) });
  const spec = {
    place: { x, y, scale, flip },
    joints: [
      { name: "root" }, { name: "hips", parent: "root" },
      { name: "thighB", parent: "hips", at: [-10, 4], z: -3 }, { name: "shinB", parent: "thighB", at: [0, 90] }, { name: "footB", parent: "shinB", at: [0, 88] },
      { name: "thighF", parent: "hips", at: [9, 4], z: 1 }, { name: "shinF", parent: "thighF", at: [0, 90] }, { name: "footF", parent: "shinF", at: [0, 88] },
      { name: "torso", parent: "hips", at: [0, -6], lag: 0.04, z: 2 },
      { name: "upperB", parent: "torso", at: [-24, -134], z: -5, lag: 0.07 }, { name: "foreB", parent: "upperB", at: [0, 72], lag: 0.1 }, { name: "handB", parent: "foreB", at: [0, 64], lag: 0.13 },
      { name: "neck", parent: "torso", at: [6, -148], z: 2 },
      { name: "head", parent: "neck", at: [2, -22] },
      { name: "hairB", parent: "head", at: [-22, -66], z: -2 },
      { name: "face", parent: "head", at: [12, -46], z: 2 },
      { name: "eyeN", parent: "face", at: [15, -4], clipKids: "eyeNw" }, { name: "pupN", parent: "eyeN", at: [1, 1] },
      { name: "eyeF", parent: "face", at: [-14, -3], clipKids: "eyeFw" }, { name: "pupF", parent: "eyeF", at: [1, 1] },
      { name: "browN", parent: "face", at: [15, -20], z: 3 }, { name: "browF", parent: "face", at: [-15, -19], z: 3 },
      { name: "upperF", parent: "torso", at: [16, -136], z: 6, lag: 0.07 }, { name: "foreF", parent: "upperF", at: [0, 72], lag: 0.1 }, { name: "handF", parent: "foreF", at: [0, 64], lag: 0.13 },
    ],
    parts: [
      // F06/F66: boots are the contact owners (sole on ground); drawn at the ankle joint
      { joint: "footB", ...sk("bootB", "M-12,-16 L11,-16 L13,4 C26,6 36,10 37,16 L37,22 L-14,22 Z", C.bootS, C.sole, 6) },
      { joint: "footF", ...sk("bootF", "M-12,-16 L11,-16 L13,4 C26,6 36,10 37,16 L37,22 L-14,22 Z", C.boot, C.bootS, 7, { inner: `<rect x="-16" y="17" width="56" height="6" fill="${C.sole}"/><rect x="-13" y="-10" width="25" height="4" fill="${C.bootS}" opacity=".6"/>` }) },
      // coat skirt on hips: blendshape responds to the solved stride (post hook in the scene)
      { joint: "hips", z: 2, morph: { name: "skirt", id: "skirt", base: "M-40,-14 L36,-12 C44,26 52,66 58,102 C22,110 -26,110 -56,102 C-52,60 -46,22 -40,-14 Z",
        targets: { f: "M-40,-14 L36,-12 C48,24 62,62 74,96 C34,108 -20,110 -50,104 C-48,62 -44,24 -40,-14 Z", b: "M-40,-14 L36,-12 C42,26 46,66 50,104 C14,112 -36,108 -70,96 C-62,58 -50,22 -40,-14 Z" },
        surf: { base: C.coat, shade: C.coatS, k: shadeK + 3, inner: `<path d="M20,-10 C24,30 28,70 30,106" stroke="${C.coatS}" stroke-width="3" fill="none" opacity=".8"/>` } } },
      // upper coat (torso). F02: planes are fills clipped to the parent, no outline; buttons/placket live INSIDE the parent
      { joint: "torso", z: 0, ...sk("coat", "M-38,-146 C-50,-118 -50,-60 -44,-8 L38,-6 C46,-48 48,-108 34,-148 C14,-160 -18,-160 -38,-146 Z", C.coat, C.coatS, shadeK + 2, {
        hi: C.coatH, hk: shadeK + 16,
        inner: `<path d="M22,-144 C26,-100 28,-50 30,-6" stroke="${C.coatS}" stroke-width="3" fill="none"/>${[-120, -92, -64, -36].map((yy) => `<circle cx="${30 + (yy + 140) * 0.03}" cy="${yy}" r="3.4" fill="${C.collar}"/>`).join("")}` }) },
      { joint: "torso", z: 1, svg: `<rect x="-46" y="-16" width="86" height="13" rx="5" fill="${C.anchor}"/><rect x="20" y="-17" width="14" height="15" rx="3" fill="${C.collar}"/>` },
      // stiff collar: back wing behind the neck, front wing in front (F59 explicit occlusion order)
      { joint: "torso", z: 1.5, ...sk("collarB", "M-30,-146 C-40,-170 -30,-190 -12,-192 L2,-156 Z", C.collarS, C.collarS, 0, { lit: false }) },
      { joint: "torso", z: 3, ...sk("collarF", "M6,-150 C16,-166 26,-184 34,-188 C46,-174 44,-158 34,-146 Z", C.collar, C.collarS, 6) },
      { joint: "neck", ...sk("neckS", "M-9,4 L-9,-26 L10,-26 L10,4 Z", C.skinS, C.skinS, 0, { lit: false }) },
      // head: hair back mass on its own spring joint; skull/face plane; front hair cap with asymmetric bob (F05 order)
      { joint: "hairB", ...sk("hairBk", "M6,-50 C-30,-50 -46,-12 -42,30 C-40,50 -26,60 -10,56 L36,44 C46,10 42,-44 6,-50 Z", C.hair, C.hairS, 7) },
      { joint: "head", z: 0, ...sk("skull", "M-40,-60 C-44,-98 -8,-114 16,-110 C46,-106 56,-76 52,-44 C50,-18 38,0 14,4 C-6,6 -30,-6 -38,-28 Z", C.skin, C.skinS, shadeK, {
        inner: `<ellipse cx="34" cy="-30" rx="9" ry="6" fill="${C.blush}" opacity=".45"/>` }) },
      { joint: "head", z: 4, ...sk("hairF", "M-46,-46 C-54,-100 -10,-124 20,-116 C50,-108 62,-80 56,-54 C46,-70 28,-80 10,-80 C2,-66 -14,-60 -26,-62 C-32,-48 -38,-34 -44,-16 Z", C.hair, C.hairS, 7, { hi: C.hairH, hk: 20 }) },
      { joint: "head", z: 5, ...sk("lockN", "M44,-72 C60,-58 60,-30 52,-12 C48,-24 46,-42 40,-54 Z", C.hair, C.hairS, 4) },
      // face: WHITE_SCLERA_ACTOR mode (F65) — gaze must read at medium scale; far eye narrower (3/4 view)
      { joint: "eyeN", morph: { name: "eyeN", id: "eyeNw", base: shape.ellipse(0, 0, 8.5, 10.5), targets: { closed: shape.ellipse(0, 3, 8.5, 1.2) }, n: 28, fill: C.eye } },
      { joint: "eyeF", morph: { name: "eyeF", id: "eyeFw", base: shape.ellipse(0, 0, 6.5, 9.5), targets: { closed: shape.ellipse(0, 3, 6.5, 1.1) }, n: 28, fill: C.eye } },
      { joint: "pupN", svg: `<circle r="5.6" fill="${C.iris}"/><circle cx="1.8" cy="-2.2" r="1.7" fill="#fff"/>` },
      { joint: "pupF", svg: `<circle r="4.9" fill="${C.iris}"/><circle cx="1.6" cy="-2" r="1.4" fill="#fff"/>` },
      { joint: "browN", svg: `<path d="M-9,1 Q0,-5 10,0" stroke="${C.hairS}" stroke-width="4.5" fill="none" stroke-linecap="round"/>` },
      { joint: "browF", svg: `<path d="M-7,1 Q0,-4 7,-1" stroke="${C.hairS}" stroke-width="4" fill="none" stroke-linecap="round"/>` },
      { joint: "face", z: 1, svg: `<path d="M34,2 C42,8 42,16 33,18 Z" fill="${C.skinS}"/>` },
      { joint: "face", z: 1, morph: { name: "mouth", id: "mouth", base: "M8,30 C14,33 22,33 28,30 C22,32 14,32 8,30 Z",
        targets: { smile: "M5,27 C12,41 24,41 31,26 C22,30 12,30 5,27 Z", open: shape.ellipse(18, 33, 6, 8), flat: "M8,32 C14,32.6 22,32.6 28,32 C22,33.4 14,33.4 8,32 Z" }, n: 36, fill: C.mouth } },
      // hands: one topology, three authored states (F06 task-specific hands, F67 registered state family)
      { joint: "handF", z: 1, morph: { name: "handF", id: "handFm", base: HAND_REST, targets: { open: HAND_OPEN, grip: HAND_GRIP }, n: 44, tension: 0.6, surf: { base: C.skin, shade: C.skinS, k: 4 } } },
      { joint: "handB", z: 1, morph: { name: "handB", id: "handBm", base: HAND_REST, targets: { open: HAND_OPEN }, n: 44, tension: 0.6, surf: { base: C.skinS, shade: C.skinS, k: 0, lit: false } } },
      { joint: "handF", z: 2, svg: `<rect x="-11" y="-6" width="22" height="9" rx="4" fill="${C.coatS}"/>` },
      { joint: "handB", z: 2, svg: `<rect x="-11" y="-6" width="22" height="9" rx="4" fill="${C.anchor}"/>` },
    ],
    // limb contours regenerated from joints every frame (bending sleeves / trousers with volume)
    limbs: [
      { id: "legB", chain: ["thighB", "shinB", "footB"], w: [17, 13, 11], z: -3, base: C.pantsF, shade: C.pantsF, k: 0 },
      { id: "legF", chain: ["thighF", "shinF", "footF"], w: [18, 14, 11.5], z: 0.5, base: C.pantsN, shade: C.pantsF, k: 6 },
      { id: "armB", chain: ["upperB", "foreB", "handB"], w: [13, 11.5, 10], z: -5, base: C.sleeveF, shade: C.sleeveF, k: 0, ext: -4 },
      { id: "armF", chain: ["upperF", "foreF", "handF"], w: [14, 12.5, 10.5], z: 5.5, base: C.coat, shade: C.coatS, k: 7, ext: -4 },
    ],
    sockets: { gripF: { joint: "handF", at: [0, 17] }, gripB: { joint: "handB", at: [0, 17] } },
    rest: { upperF: 10, foreF: -14, upperB: -8, foreB: -10, "handF:open": 0 },
    controls: {
      lookX: [["pupN.x", 3.2], ["pupF.x", 2.6], ["face.x", 3]], lookY: [["pupN.y", 3], ["pupF.y", 2.6], ["face.y", 2.5]],
      brow: [["browN.y", -5], ["browF.y", -4.5]], browTilt: [["browN", -10], ["browF", 8]],
      squash: [["root.y", 18], ["torso.sy", -0.06], ["torso.sx", 0.04]],
    },
    expr: {
      neutral: { brow: 0, browTilt: 0, "mouth:smile": 0, "mouth:open": 0, "mouth:flat": 0 },
      curious: { brow: 0.7, browTilt: 0.2, "mouth:open": 0.35, "mouth:smile": 0 },
      effort: { brow: -0.4, browTilt: -0.6, "mouth:flat": 1, "mouth:smile": 0, "mouth:open": 0 },
      delighted: { brow: 1, browTilt: 0.3, "mouth:smile": 1, "mouth:flat": 0, "mouth:open": 0.15, "eyeN:closed": 0.25, "eyeF:closed": 0.25 },
    },
    idle: [["torso.sy", 0.006, 0.3, 0], ["head", 0.7, 0.23, 1.1]],
    blink: { chans: ["eyeN:closed", "eyeF:closed"], every: 3.1, dur: 0.15, seed: 4 },
    follow: [{ joint: "hairB", src: "head", gain: -1.4, tau: 0.22, freq: 2.0 }],
  };
  return defineRig(P, spec);
}


// ---- construction contract (rule → code → pixels). components are real element ids in the built HTML ----
export const construction = {
  id: "keeper", family: "HUMAN_GESTURE_FULL", kind: "character",
  decisions: [
    { method: "F64", applies: "full-body actor whose stride, reach and grip carry the scene's cause", visible: "family = HUMAN_GESTURE_FULL: whole body reads; face kept to a small mark budget", ops: ["defineRig"], components: ["k-rig"] },
    { method: "F58", applies: "identity must read before interior detail", visible: "bob + stiff collar + long coat hem readable as a black silhouette at 1/10 size", ops: ["defineRig", "surf"], components: ["k-hairF", "k-collarF", "k-skirt"] },
    { method: "F59", applies: "parts join and occlude deliberately", visible: "far arm/leg behind torso, collar back wing behind neck, front wing in front; hair back mass behind skull", ops: ["defineRig"], components: ["k-upperB", "k-collarB", "k-collarF", "k-hairB"] },
    { method: "F02", applies: "opaque cloth and skin", visible: "forms are filled planes; contours are fill boundaries; no outline stroke on body", ops: ["surf"], components: ["k-coat", "k-skull", "k-skirt"] },
    { method: "F62", applies: "edges and shadows have owners", visible: "core-shadow crescents are clipped inside each parent and aimed away from the light", ops: ["surf", "MN.rig"], components: ["k-coat-L", "k-skull-L", "k-armF-L"] },
    { method: "F04", applies: "opaque form lighting", visible: "hard bounded light/shade planes, no blur on the body", ops: ["surf", "MN.setLight"], components: ["k-coat-L"] },
    { method: "F05", applies: "three-quarter head with gaze acting", visible: "skull→hair cap→face plane order; near eye larger, far eye narrower; nose on the near contour", ops: ["defineRig", "surf"], components: ["k-skull", "k-eyeNw", "k-eyeFw"] },
    { method: "F65", applies: "gaze direction is part of the action (looks at lantern)", visible: "WHITE_SCLERA_ACTOR: pupil clipped inside a morphing eye white; lid closes by geometry", ops: ["defineRig", "R.pose"], components: ["k-pupN", "k-eyeNw"] },
    { method: "F67", applies: "expression changes during the scene", visible: "neutral→effort→delighted are blendshape states of one mouth/eye topology", ops: ["morphable", "R.pose"], components: ["k-mouth"] },
    { method: "F06", applies: "walk, reach and grip are the scene's physical contacts", visible: "feet planted during stance; hand closes ON the handle; lantern follows the grip socket", ops: ["R.walk", "R.reach", "R.attach", "handPath"], components: ["k-handFm", "k-bootF"] },
    { method: "F66", applies: "body acting with garment response", visible: "skirt blendshape flares with the solved stride; sleeves bend as continuous contours", ops: ["R.post", "MN.rig"], components: ["k-skirt", "k-armF"] },
    { method: "F30", applies: "multi-state character library before animation", visible: "expr presets + hand states exist as data, used by the scene", ops: ["defineRig", "R.pose"], components: ["k-handFm"] },
  ],
  not_applicable: [
    { method: "F07", why: "not a mascot/animal" }, { method: "F52", why: "single scale band in this test (wide/medium); no extreme close-up" },
  ],
};
