// Specimen 2 (tide-mill machine room) through the PUBLIC producers: designPalette → buildWorld (oblique interior) → gearTrain (derived
// mechanism) → axles/shaft as world bars between derived gear ports → planPlanes → window light (volumetric_source) → adjacency check.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { designPalette, assertAdjacencyContrast } from "../palette.mjs";
import { buildWorld } from "../worldgraph.mjs";
import { gearTrain } from "../gears.mjs";
import { planPlanes } from "../surfaces.mjs";
import { constructEffect } from "../effects.mjs";
import { compose, receipts } from "../emit.mjs";
import { assertCausalVisibility } from "../direction.mjs";
import { render, writePNG } from "../render.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "..", "evidence", "stage1");
const S = await import(url.pathToFileURL(path.join(EV, "DECISION_PLANS", "mill_scene.mjs")));
export const P = designPalette(S.PALETTE);

export function buildFrame({ angleDeg, flowing }) {
  const world = buildWorld({ ...S.worldPlan(), colors: P.roles, materialColors: P.materials });
  const drive = gearTrain(world.projection, { ...S.gearPlan(angleDeg), colors: P.roles });
  const own = (id) => world.elements.find((e) => e.id === id);
  const planes = planPlanes({ owners: [{ element: own("mill.sack"), material: "canvas", shadeRole: "sackShade" }], light: [-0.45, -0.85], colors: P.roles }).elements;
  const win = S.P(140, -340, 385);
  const light = constructEffect({ id: "windowRays", class: "volumetric_source", owner: "window", window: { start: 0, end: 1 }, reason: "daylight through the back window falls on the stone floor", layer: 3.9, source: win, rays: 5, spread: [96, 128], length: 520, seed: 3, occluders: [], colors: P.roles }).elements.map((e) => e);
  const parts = world.elements.filter((e) => flowing || !/flourStream/.test(e.id));
  const dr = compose(`specimen2.${angleDeg}.${flowing}`, [parts, drive.elements, axleBars(world, drive), planes, light]);
  // F57: the parts that prove the claim must be visible in the composed frame
  const vis = assertCausalVisibility(dr, S.CAUSAL_PARTS, { strict: process.env.VIS_STRICT !== "0" });
  if (process.env.VIS_STRICT === "0") console.log(JSON.stringify(vis.report));
  assertAdjacencyContrast(dr, { strict: process.env.ADJ_STRICT !== "0", allow: S.ADJACENCY_ALLOW || [] });
  return dr;
}
// shafts emitted through worldgraph bars whose endpoints are the gear producer's derived centres
function axleBars(world, drive) {
  const g = drive.ports, Pw = world.projection.P, c3 = (id) => g[`${id}.center3`];
  const wpl = buildWorld({ id: "shaft", family: "OBLIQUE_INTERIOR", projection: S.PROJ, purpose: "transmission shafts between derived gear centres", colors: P.roles, materialColors: P.materials, layer: 10.6, depthOrder: ["anchorA", "axle", "anchorB", "spindle"], parts: [
    { id: "anchorA", kind: "region", parent: "substrate", role: "axle start port (water wheel centre)", decision: "mill.drive", fillRole: "iron", shape: disc(Pw(...c3("waterWheel")), 9) },
    { id: "axle", kind: "bar", parent: "anchorA", role: "horizontal axle (water wheel → pit wheel)", decision: "mill.drive", from: "anchorA.c", to: Pw(...c3("pitWheel")), widths: [14, 14], fillRole: "iron" },
    { id: "anchorB", kind: "region", parent: "substrate", role: "shaft start port (wallower centre)", decision: "mill.drive", fillRole: "iron", shape: disc(Pw(...c3("wallower")), 8) },
    { id: "spindle", kind: "bar", parent: "anchorB", role: "vertical shaft (wallower → runner stone)", decision: "mill.drive", from: "anchorB.c", to: Pw(c3("wallower")[0], c3("wallower")[1], 396), widths: [12, 12], fillRole: "iron" }] });
  return wpl.elements;
}
const disc = (c, r) => ({ identity: ["c"], featureContour: true, roundJustification: "a shaft end is physically round", landmarks: [["c", c[0], c[1] - r], ["e", c[0] + r, c[1]], ["s", c[0], c[1] + r], ["w", c[0] - r, c[1]]].map(([id, x, y]) => ({ id, p: [x, y], joint: "smooth" })), spans: ["c", "e", "s", "w"].map((id, i, a) => ({ from: id, to: a[(i + 1) % 4], character: "convex", amount: 0.2 })) });

if (process.argv[1] && import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  const OUT = path.resolve(process.argv[2] || path.join(EV, "FIRST_PASS")), TAG = process.argv[3] || "specimen2"; fs.mkdirSync(OUT, { recursive: true });
  const before = buildFrame({ angleDeg: 0, flowing: false }), after = buildFrame({ angleDeg: 37, flowing: true });
  writePNG(path.join(OUT, `${TAG}_before.png`), render(before, { W: 1920, H: 1080, bg: P.roles.wallStone }));
  writePNG(path.join(OUT, `${TAG}_after.png`), render(after, { W: 1920, H: 1080, bg: P.roles.wallStone }));
  writePNG(path.join(OUT, `${TAG}_thumb160.png`), render(after, { W: 160, H: 90, bg: P.roles.wallStone }));
  writePNG(path.join(OUT, `${TAG}_gray.png`), render(after, { W: 960, H: 540, bg: P.roles.wallStone, mode: "gray" }));
  fs.writeFileSync(path.join(OUT, `${TAG}_trace.json`), JSON.stringify(receipts().map((r) => ({ producer: r.actualProducerId, call: r.callId, reads: r.actualDecisionReads.length, regions: r.emittedRegionIds.length, methods: r.sourceMethodsUsed })), null, 1));
  console.log("regions", after.elements.length, "methods", Object.keys(after.methods).sort().join(","));
}
