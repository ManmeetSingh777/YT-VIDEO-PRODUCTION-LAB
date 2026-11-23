// Specimen 1 integrated first pass through the PUBLIC producers. Writes <out>/<tag>_{before,after}.png (1920×1080), _silhouette.png,
// _thumb160.png, _crop_face_hand.png, _trace.json (producer receipts with actual reads). Usage: node specimen1_render.mjs [outDir] [tag]
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { designPalette, assertAdjacencyContrast } from "../palette.mjs";
import { buildWorld } from "../worldgraph.mjs";
import { poseFigure } from "../figure.mjs";
import { constructGrip } from "../grip.mjs";
import { constructFaceView } from "../faceview.mjs";
import { patchByCause, planPlanes } from "../surfaces.mjs";
import { constructEdge } from "../surface.mjs";
import { constructEffect } from "../effects.mjs";
import { compose, receipts } from "../emit.mjs";
import { render, writePNG } from "../render.mjs";
import { sub, nrm } from "../core.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "..", "evidence", "stage1"), DP = path.join(EV, "DECISION_PLANS");
const S = await import(url.pathToFileURL(path.join(DP, "hydrologist_scene.mjs"))), H = await import(url.pathToFileURL(path.join(DP, "hydrologist.mjs")));
const { FACE } = await import(url.pathToFileURL(path.join(DP, "hydrologist_face.mjs"))), { HAND } = await import(url.pathToFileURL(path.join(DP, "hydrologist_hand.mjs")));
export const P = designPalette(S.PALETTE);
const LIGHT = [-0.55, -0.83];

export function buildFrame({ crankDeg, lampOn, state, rootShift = [0, 0] }) {
  const HAND_STACK = 60; // contact decision: the near hand + grasped handle form one stack in front of the forearm (F59)
  const world = buildWorld({ ...S.worldPlan(crankDeg, lampOn, HAND_STACK), colors: P.roles, layer: 0 });
  const plan = H.plan("A", P.roles, { withHead: false }); plan.layer = 20;
  const handle = world.ports["handle.a"], handleTip = world.ports["handle.b"], handleLayer = world.elements.find((e) => e.id === "field.handle").layer;
  const FIG = { ...S.FIGURE, rootAt: [S.FIGURE.rootAt[0] + rootShift[0], S.FIGURE.rootAt[1] + rootShift[1]] };
  let wrist = [handle[0] + 40, handle[1] + 20], forearm = [-1, -0.2], fig, grip;
  for (let it = 0; it < 3; it++) { // grip seat ↔ IK: the hand is seated on the handle, the arm reaches the seated wrist
    grip = constructGrip({ ...HAND, colors: P.roles }, { id: "handN", state: "power_capsule", wrist, forearmDir: forearm, scale: 1.45, propLayer: handleLayer, side: 1, prop: { id: "crankHandle", a: handle, b: handleTip, radius: 6, approach: [1, 0.15] } });
    wrist = grip.data.wrist;
    fig = poseFigure(plan, { ...FIG, ik: { wristN: { root: "shoulderN", mid: "elbowN", target: wrist, bendSign: -1 }, wristF: { root: "shoulderF", mid: "elbowF", target: FIG.farHandTarget, bendSign: 1 } } });
    forearm = nrm(sub(fig.joints.wristN, fig.joints.elbowN));
  }
  const J = fig.joints, figLayer = (id) => fig.elements.find((e) => e.id === `hydroA.${id}`).layer;
  const farHand = constructGrip({ ...HAND, colors: P.roles }, { id: "handF", state: "open_release", wrist: J.wristF, forearmDir: nrm(sub(J.wristF, J.elbowF)), scale: 1.35, propLayer: figLayer("vest") + 0.3, side: -1 });
  const face = constructFaceView({ ...FACE, colors: P.roles }, { view: "three_quarter_left", state, finalHeadPx: 118, role: "ACTING_CUE", gazeRequired: true, center: J.head, roll: -8, light: LIGHT, layer: figLayer("neck") + 0.5 });
  const own = (id) => fig.elements.find((e) => e.id === `hydroA.${id}`), wEl = (id) => world.elements.find((e) => e.id === `field.${id}`), port = (m, l) => fig.ports[`${m}.${l}`];
  const patches = [
    patchByCause({ id: "hemUnder", cause: "garment_underside", owner: own("vest"), run: [port("vest", "hemN"), port("vest", "hemMid"), port("vest", "hemF")], thickness: [9, 11, 9], inward: -1, light: LIGHT, tone: "vestShade", layerOffset: 0.02, colors: P.roles }),
    patchByCause({ id: "rim", cause: "metal_rim", owner: wEl("reel"), center: world.ports["reel.center"], rx: 20, ry: 46, rotDeg: 0, width: 7, light: LIGHT, litTone: "reelLight", lipTone: "reelDark", layerOffset: 0.03, colors: P.roles }),
    patchByCause({ id: "lip", cause: "metal_rim", owner: wEl("casing.top"), center: [760, 810], rx: 46, ry: 13, rotDeg: 0, width: 4, light: LIGHT, litTone: "casingTop", lipTone: "casing", layerOffset: 0.03, colors: P.roles }),
  ].flatMap((r) => r.elements);
  // R3: material planes derived per owner from its own contour, local thickness and the light (no per-scene listing)
  const MAT = { legN: ["cloth", "trouserShade"], legF: ["cloth", "trouserShade"], vest: ["quilted", "vestShade"], torsoMass: ["cloth", "shirtShade"], sleeveN: ["cloth", "shirtShade"], sleeveF: ["cloth", "shirtShade"], forearmN: ["skin", "skinShade"], neck: ["skin", "skinDeep"], bootN: ["leather", "bootFar"], vestYokeN: ["quilted", "vestShade"] };
  const planes = planPlanes({ owners: [...Object.entries(MAT).map(([id, [material, shadeRole]]) => ({ element: own(id), material, shadeRole })),
    { element: wEl("casing.body"), material: "hard", shadeRole: "casingShade" }, { element: wEl("legL"), material: "hard", shadeRole: "tripodShade" }, { element: wEl("legR"), material: "hard", shadeRole: "tripodShade" }], light: LIGHT, colors: P.roles }).elements;
  patches.push(...planes);
  const shadows = ["legN", "legF", "bootN", "bootF"].flatMap((m) => constructEdge({ owner: `hydroA.${m}`, role: "CAST_SHADOW", material: "cloth", occluder: own(m), light: LIGHT, receiver: { id: "ground", element: wEl("ground"), groundY: 930, squash: 0.55 }, colors: P.materials.ground }).elements);
  const lamp = lampOn ? constructEffect({ id: "lampGlow", class: "surface_emission", owner: "lamp", ownerElement: wEl("lamp"), window: { start: 0, end: 1 }, reason: "probe contact closes the indicator circuit", layer: wEl("lamp").layer + 0.05, coreInset: 0, haloRings: 3, haloStep: 4, allowed: "M800,612 L860,612 L860,668 L800,668 Z", colors: P.roles }).elements : [];
  const dr = compose(`specimen1.${state}.${crankDeg}`, [world.elements, fig.elements, grip.elements, farHand.elements, face.elements, patches, shadows, lamp]);
  assertAdjacencyContrast(dr, { strict: process.env.ADJ_STRICT !== "0", allow: S.ADJACENCY_ALLOW });
  return dr;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  const OUT = path.resolve(process.argv[2] || path.join(EV, "FIRST_PASS")), TAG = process.argv[3] || "specimen1"; fs.mkdirSync(OUT, { recursive: true });
  const before = buildFrame({ crankDeg: 200, lampOn: false, state: "concentrating" }), after = buildFrame({ crankDeg: 290, lampOn: true, state: "surprised" });
  writePNG(path.join(OUT, `${TAG}_before.png`), render(before, { W: 1920, H: 1080, bg: P.roles.sky }));
  writePNG(path.join(OUT, `${TAG}_after.png`), render(after, { W: 1920, H: 1080, bg: P.roles.sky }));
  writePNG(path.join(OUT, `${TAG}_silhouette.png`), render(after, { W: 960, H: 540, bg: "#f2efe6", mode: "silhouette", only: (e) => /^hydroA|^handN|^handF|^hydrologist/.test(e.id) }));
  writePNG(path.join(OUT, `${TAG}_thumb160.png`), render(after, { W: 160, H: 90, bg: P.roles.sky }));
  writePNG(path.join(OUT, `${TAG}_crop_face_hand.png`), render(after, { W: 960, H: 600, view: [700, 330, 480, 300], bg: P.roles.sky }));
  fs.writeFileSync(path.join(OUT, `${TAG}_trace.json`), JSON.stringify(receipts().map((r) => ({ producer: r.actualProducerId, call: r.callId, reads: r.actualDecisionReads.length, regions: r.emittedRegionIds.length, methods: r.sourceMethodsUsed })), null, 1));
  console.log("regions", after.elements.length, "methods", Object.keys(after.methods).sort().join(","));
}
