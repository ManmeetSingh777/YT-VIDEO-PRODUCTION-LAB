// TURBINE HALL — original qualification world + machine (unlike family from the engineer).
// Device truth table (F45/F68): INPUT water through the penstock → VALVE (hand wheel) meters it → RUNNER spins in the
// casing (seen through an inspection window) → SHAFT turns the GENERATOR → CABLE carries power → LAMP lights; a GAUGE
// on the pipe reads flow. Every part is authored 3D geometry projected through ONE oblique basis (F38/F60/F70).
import { author } from "../../../engine/authoring/construct.mjs";

const B = { name: "hall-oblique", o: [0, 1000], u: [1, 0], v: [0.6, -0.4], h: [0, -1] };   // x right, y depth, z up
export const P3 = ([x, y, z]) => [B.o[0] + x * B.u[0] + y * B.v[0] + z * B.h[0], B.o[1] + x * B.u[1] + y * B.v[1] + z * B.h[1]];
const band = (cx, cy, r, z0, z1, a0, a1, n = 12) => [...ring(cx, cy, z0, r, n, a0, a1), ...ring(cx, cy, z1, r, n, a1, a0)].map(P3);
// visible side of a vertical cylinder: between the two outline tangents of the projected circle (F38: derived from the basis)
const TAN = Math.atan2(B.v[0], B.u[0]) * 180 / Math.PI; // 31deg for this basis
const band3 = (cx, cy, r, z0, z1) => [...ring(cx, cy, z0, r, 28, 180 + TAN, 360 + TAN), ...ring(cx, cy, z1, r, 28, 360 + TAN, 180 + TAN)];
const pathOf = (pts) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L") + " Z";
const ring = (cx, cy, z, r, n = 40, a0 = 0, a1 = 360) => Array.from({ length: n + 1 }, (_, i) => { const a = (a0 + (a1 - a0) * i / n) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r, z]; });

export function hallWorld({ ctx, prefix = "hw-" } = {}) {
  const W = author("hall", { kind: "world", subject_id: "hall", world_class: "SCENIC_INTERIOR", projection: "OBLIQUE", hasRepeats: true, moves: false, changesState: false, hasOptics: false, hasEmission: false, flowPath: false, prefix, transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false }, ctx);
  W.witness(["F37", "F38", "F70"], "question_native_witnesses/AI_0285_machine_actor_interior.jpg", "molecular_native_anchors/AI_0874_axial_corridor.jpg",
    "interior: wall + work surface as large quiet planes in one projection; detail only where function is; corridor (unlike): near walls remain dark structural masses, light only at sources.");
  W.witness(["F47", "F53"], "question_native_witnesses/NUCLEAR_0271_mechanism_scale_world.jpg", "molecular_native_anchors/AI_0035_oblique_city.jpg",
    "quiet support planes with a few owned seams vs dense owned facade repeats: density follows the explanatory role.");
  W.decide("world.purpose", "a machine room where the engineer's hand action visibly drives a water-to-light chain", { by: ["F37"] });
  W.decide("world.class", "SCENIC_INTERIOR", { by: ["F37"] });
  W.decide("world.substrate", "concrete floor plane + back wall plane", { by: ["F37"] });
  W.decide("world.topology", "machine on plinth on floor; pipe through back-left; lamp on wall; engineer standing on floor in front", { by: ["F37", "F10"] });
  W.decide("world.zones", { near: "engineer + wheel", mid: "turbine", far: "wall", quiet: "upper wall" }, { by: ["F10", "F77"] });
  W.decide("world.supports", ["floor", "wall"], { by: ["F10"] });
  W.decide("projection.basis", B, { by: ["F38", "F60", "F08"] });
  W.decide("architecture.planes", { wall: "single quiet face with panel seams on wall-local axes", floor: "plane with seam lines along u" }, { by: ["F70"] });
  W.decide("mediumTree", ["WORLD"], { by: ["F20"] });
  W.decide("view.inference", "hand on wheel -> water -> light: medium-wide so cause and effect share the frame", { by: ["F55"] });
  W.decide("regions.map", { MAIN_PROOF: "wheel->window->lamp diagonal", SUPPORT: "wall/floor", QUIET: "upper-left wall" }, { by: ["F77"] });
  W.decide("generator.family", "architecture (quiet interior)", { by: ["F34"] });
  W.decide("repeats.parent", { seams: "wall face", floor: "floor plane" }, { by: ["F54", "F76"] });
  W.decide("materials", ["concrete"], { by: ["F02", "F46"] });
  W.decide("palette.roles", { wall: "#2c5560", wallL: "#3a6b75", wallS: "#21434c", floor: "#1d3a42", floorL: "#28505a", anchor: "#162d38" }, { by: ["F03", "F51", "F61"] });
  W.decide("palette.focalPair", "world stays cool and low-contrast so the warm subjects lead", { by: ["F03"] });
  W.decide("palette.pairs", [["wall", "floor", "luma"]], { by: ["F61"] });
  W.decide("lighting.system", "OPAQUE_FORM: quiet planes; top band of wall lighter (high source)", { by: ["F04"] });
  W.decide("edges", { seams: "INTERNAL_CREASE" }, { by: ["F62"] });
  W.decide("detail.owner", "far_environment", { by: ["F33"] });
  W.decide("detail.tiers", { T0: "wall + floor", T2: "seams" }, { by: ["F47", "F53"] });
  W.decide("medium", "vector", { by: ["F19"] });
  W.decide("silhouette.outer", "horizon line where wall meets floor, diagonal along u", { by: ["F01", "F58"] });
  W.decide("silhouette.view", "oblique", { by: ["F01"] });
  W.decide("silhouette.identityFeatures", ["wall/floor corner"], { by: ["F01"] });
  W.decide("silhouette.voids", ["none: closed room"], { by: ["F58"] });
  W.decide("silhouette.smallRead", "two value bands", { by: ["F58"] });
  W.decide("proof.silent", "the room is support only", { by: ["F57"] });
  W.decide("proof.anchors", "none (support)", { by: ["F57"] });
  W.decide("parts", "wall and floor are independent world planes", { by: ["F59"] });
  W.learn();
  const C = W.get("palette.roles");
  W.palette([["wall", "floor", 1.15, "luma"]], { by: ["F03", "F51", "F61"], uses: ["palette.roles"] });
  const wallY = 340;
  W.facet("wall", B, [[-400, wallY, 0], [2400, wallY, 0], [2400, wallY, 1400], [-400, wallY, 1400]], { fill: C.wall, by: ["F37", "F10", "F70", "F02", "F08", "F01", "F34", "F38", "F58"], uses: ["projection.basis", "palette.roles", "world.substrate"] });
  W.facet("floor", B, [[-400, -200, 0], [2400, -200, 0], [2400, wallY, 0], [-400, wallY, 0]], { fill: C.floor, by: ["F37", "F10", "F70", "F01", "F58"], uses: ["world.substrate", "projection.basis"] });
  W.attach("plinthShadow", "floor", { fill: "#142c33", by: ["F62", "F59"], uses: ["world.topology"], path: pathOf([[1060, -80, 0], [1560, -80, 0], [1580, 320, 0], [1080, 320, 0]].map(P3)) });
  W.patch("floorLit", "floor", { fill: C.floorL, by: ["F04", "F46", "F62"], uses: ["lighting.system"], path: pathOf([[1350, -200, 0], [2400, -200, 0], [2400, wallY, 0], [1700, wallY, 0]].map(P3)) });
  W.repeat("wallSeams", "wall", [-200, 200, 600, 1000, 1400, 1800, 2200], (x) => { const a = P3([x, wallY, 0]), b = P3([x, wallY, 1400]); return `<path d="M${a} L${b}" stroke="${C.wallS}" stroke-width="5"/>`; }, { by: ["F54", "F76", "F70", "F62"], uses: ["repeats.parent", "edges"] });
  W.patch("wallBand", "wall", { fill: C.wallL, op: 0.45, by: ["F46", "F04"], uses: ["lighting.system"], path: pathOf([[-400, wallY, 520], [2400, wallY, 520], [2400, wallY, 1400], [-400, wallY, 1400]].map(P3)) });
  W.repeat("floorSeams", "floor", [-120, -40, 40, 120, 200, 280], (y) => { const a = P3([-400, y, 0]), b = P3([2400, y, 0]); return `<path d="M${a} L${b}" stroke="${C.anchor}" stroke-width="3" opacity=".6"/>`; }, { by: ["F54", "F76"], uses: ["repeats.parent"] });
  return W.compile();
}

export function turbineHall({ ctx, prefix = "th-" } = {}) {
  const cxM = { kind: "machine", subject_id: "turbine", projection: "OBLIQUE", world_class: "NONE", hasViewport: true, hasOptics: true, hasEmission: true, hasRepeats: true, changesState: true, moves: true, flowPath: true, prefix, transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, historical: false };
  const A = author("turbine", cxM, ctx);
  A.witness(["F38", "F60", "F68", "F70"], "question_native_witnesses/NUCLEAR_0271_mechanism_scale_world.jpg", "question_native_witnesses/AI_0285_machine_actor_interior.jpg",
    "oblique vehicles: ONE projection; top/front/side are three values of one hue; dark coloured (not black) chassis anchor; glass with clipped diagonal streak. AI@285 (unlike: frontal interior device): recessed bezel with inset frame, bounded light cone + lit pool on the receiving desk.");
  A.witness(["F63", "F13"], "molecular_native_anchors/AI_0514_socketed_glass_machine.jpg", "molecular_native_anchors/AI_0874_axial_corridor.jpg",
    "socketed glass volume: cables end in circular ports, crisp core + bounded halo; corridor (unlike): dark structural planes stay dark, light only at real sources.");
  A.decide("machine.truthTable", { input: "penstock water", control: "hand wheel valve", process: "runner in casing", output: "generator → cable → lamp", operator: "engineer at wheel", power: "falling water" }, { by: ["F45", "F68", "F09"] });
  A.decide("machine.partGraph", "penstock→valve(wheel,gauge)→casing(window,runner)→shaft→generator→cable→lamp; supports: casing on plinth, pipe on saddles", { by: ["F09"] });
  A.decide("machine.assemblies", ["penstock+valve", "casing+runner window", "generator", "lamp circuit"], { by: ["F45"] });
  A.decide("machine.surfacePolicy", { painted_metal: "HARD_BOUNDARY", glass: "LOCAL_SOFT_OPTIC", lamp: "LOCAL_SOFT_OPTIC", concrete: "HARD_BOUNDARY" }, { by: ["F68"] });
  A.decide("machine.sockets", ["valveOut", "casingIn", "genTop", "lampIn"], { by: ["F68"] });
  A.decide("projection.basis", B, { by: ["F38", "F60", "F08"] });
  A.decide("materials", ["painted steel (teal)", "painted steel (signal orange)", "concrete", "glass", "copper cable", "brass"], { by: ["F46", "F02"] });
  A.decide("palette.roles", { wall: "#2c5560", wallL: "#3a6b75", wallS: "#21434c", floor: "#1d3a42", floorL: "#28505a", steel: "#e0763a", steelT: "#f4a066", steelS: "#a94e24", pipe: "#3f9aa0", pipeT: "#6cc4c4", pipeS: "#2a6c72", anchor: "#162d38", brass: "#e8c15a", glass: "#9fe3f0", water: "#5fd1ff", lampCore: "#fff3c0", lampHalo: "#ffd36a" }, { by: ["F03", "F51", "F61"] });
  A.decide("palette.focalPair", "signal-orange casing + warm lamp vs cool teal concrete", { by: ["F03"] });
  A.decide("palette.pairs", [["casing", "wall", "hue"], ["pipe", "wall", "luma"], ["lamp", "wall", "luma"]], { by: ["F61"] });
  A.decide("palette.roles.check", "the teal pipe is close in hue to the wall: separation must come from its lighter top band and dark underside", { by: ["F61"] });
  A.decide("lighting.system", "OPAQUE_FORM faces by normal: key from a high source upper-RIGHT (tops lightest, right faces lit, left faces shaded); EMISSIVE lamp core + bounded halo + floor pool; OPTICAL window glass", { by: ["F04"] });
  A.decide("edges", { metal: "COLOR_ADJACENCY between faces", window: "OPTICAL_RIM bezel", floorSeams: "INTERNAL_CREASE" }, { by: ["F62"] });
  A.decide("optics", "inspection window: bezel rim, transmitted runner, clipped streak; lamp: core, cage, bounded halo, light cone, floor pool", { by: ["F13", "F63"] });
  A.decide("effects.class", "surface_emission (lamp) + flow band in glass sight-tube", { by: ["F32"] });
  A.decide("flow.display", "CONTINUOUS_BAND in the sight tube; DISCRETE runner blades visible through window", { by: ["F71"] });
  A.decide("repeats.parent", { wallSeams: "back wall face", floorSeams: "floor plane", fins: "generator side band", bolts: "flange ring" }, { by: ["F54", "F76"] });
  A.decide("states", { valve: ["closed", "open"], runner: "rotation", lamp: ["off", "on"], gauge: "needle angle" }, { by: ["F14"] });
  A.decide("silhouette.outer", "tall drum + box window + cylinder generator on plinth, pipe entering from left", { by: ["F01", "F58"] });
  A.decide("silhouette.view", "oblique from front-left, slightly above", { by: ["F01"] });
  A.decide("silhouette.identityFeatures", ["hand wheel", "round window with blades", "finned generator", "caged lamp"], { by: ["F01"] });
  A.decide("silhouette.voids", ["wheel spokes", "lamp cage bars", "gap between plinth and wall"], { by: ["F58"] });
  A.decide("silhouette.smallRead", "at 160×90: orange drum + teal pipe + bright lamp", { by: ["F58"] });
  A.decide("parts", "valve on pipe; wheel on valve stem; window in casing face; runner behind glass; generator on casing top; lamp on wall bracket; cable from genTop to lampIn", { by: ["F59"] });
  A.decide("detail.owner", "focal_structural (valve, window, lamp)", { by: ["F33"] });
  A.decide("detail.tiers", { T0: "wall/floor/drum", T1: "pipe, casing, generator, lamp", T2: "bolts, fins, window, gauge, seams", T3: "glints, flow band" }, { by: ["F47", "F53"] });
  A.decide("medium", "vector", { by: ["F19"] });
  A.decide("motion.owners", { runner: "SUBJECT_PART rotation", wheel: "SUBJECT_PART rotation", lamp: "MATERIAL_LIGHT_STATE", flow: "EFFECT band" }, { by: ["F15"] });
  A.decide("motion.keys", ["valve opens", "flow starts", "runner spins up", "lamp on"], { by: ["F31"] });
  A.decide("layers.underpaint", "runner group lives inside the window clip; wheel is a separate part over the valve", { by: ["F79"] });
  A.decide("generator.family", "metal/glass machine", { by: ["F34"] });
  A.decide("portal.innerWorld", "the runner chamber: hub + 9 blades + water band, complete behind the glass", { by: ["F21"] });
  A.decide("portal.rim", "bolted bezel over the glass; streak clipped to glass", { by: ["F21"] });
  A.decide("proof.silent", "turning the wheel lets water through, the runner spins, the lamp lights", { by: ["F57"] });
  A.decide("proof.anchors", { source: "wheel rim", path: "sight tube band -> window blades", target: "lamp core" }, { by: ["F57"] });
  A.learn();
  const C = A.get("palette.roles");
  A.palette([["steel", "#2c5560", 2.0, "hue+luma"], ["pipeT", "#2c5560", 2.0, "luma"], ["lampCore", "#2c5560", 6, "luma"]], { by: ["F03", "F51", "F61"], uses: ["palette.roles", "palette.pairs"] });

  const WA = 300 * Math.PI / 180, WC = P3([1300 + 150 * Math.cos(WA), 150 + 150 * Math.sin(WA), 200]);
  A.part("root").part("wheel", { parent: "root", at: P3([840, -70, 420]), z: 50 }).part("window", { parent: "root", at: WC, z: 15, clipKids: "glass", by: ["F21", "F79"], uses: ["optics", "layers.underpaint"] }).part("runner", { parent: "window", at: [0, 0], z: 1 }).part("gauge", { parent: "root", at: P3([1010, 60, 380 + 52 + 40 + 36]), z: 60 }).part("needle", { parent: "gauge", at: [0, 0], z: 2 });
  // ---------- penstock + valve (pipe = cylinder along x: top/front/under bands) ----------
  const pz = 380, pr = 52, py = 60, x0 = -300, x1 = 1180;
  const pipeBand = (z0, z1) => [[x0, py, z0], [x1, py, z0], [x1, py, z1], [x0, py, z1]];
  A.facet("pipe", B, pipeBand(pz - pr, pz + pr), { part: "root", z: 10, fill: C.pipe, by: ["F09", "F45", "F68", "F02", "F08", "F34", "F01"], uses: ["machine.partGraph", "palette.roles"] });
  A.patch("pipeTop", "pipe", { fill: C.pipeT, by: ["F04", "F02"], uses: ["lighting.system"], path: `M${P3([x0, py, pz + 18])} L${P3([x1, py, pz + 18])} L${P3([x1, py, pz + pr + 4])} L${P3([x0, py, pz + pr + 4])} Z` });
  A.patch("pipeUnder", "pipe", { fill: C.pipeS, by: ["F04", "F02", "F62"], uses: ["lighting.system"], path: `M${P3([x0, py, pz - pr - 4])} L${P3([x1, py, pz - pr - 4])} L${P3([x1, py, pz - 24])} L${P3([x0, py, pz - 24])} Z` });
  A.repeat("flanges", "pipe", [200, 620, 1060], (x) => { const a = P3([x - 10, py, pz - pr]), b = P3([x + 10, py, pz + pr]); return `<rect x="${a[0]}" y="${b[1]}" width="20" height="${a[1] - b[1]}" fill="${C.pipeS}"/><rect x="${a[0] + 4}" y="${b[1]}" width="5" height="${a[1] - b[1]}" fill="${C.pipeT}" opacity=".7"/>`; }, { by: ["F54", "F68"], uses: ["repeats.parent"] });
  // valve body: vertical bonnet cylinder wrapping the pipe, flange rings either side (F59: part enters its parent)
  const vx = 840, vr = 66;
  A.facet("valveBody", B, band3(vx, py, vr, 300, 470), { part: "root", z: 11, fill: C.steel, by: ["F68", "F45", "F38", "F59"], uses: ["machine.partGraph", "projection.basis"] });
  A.patch("valveShade", "valveBody", { fill: C.steelS, by: ["F04", "F62"], uses: ["lighting.system"], path: pathOf(band(vx, py, vr + 2, 290, 472, 180 + TAN, 250)) });
  A.patch("valveLight", "valveBody", { fill: C.steelT, op: 0.7, by: ["F04"], uses: ["lighting.system"], path: pathOf(band(vx, py, vr + 2, 290, 472, 335, 360 + TAN)) });
  A.facet("valveTop", B, ring(vx, py, 470, vr, 40), { part: "root", z: 11.1, fill: C.steelT, by: ["F68", "F38"], uses: ["projection.basis"] });
  A.facet("bonnet", B, band3(vx, py, 26, 470, 520), { part: "root", z: 11.2, fill: C.steelS, by: ["F68", "F59"], uses: ["machine.partGraph"] });
  A.facet("bonnetTop", B, ring(vx, py, 520, 26, 24), { part: "root", z: 11.3, fill: C.steel, by: ["F68"], uses: ["projection.basis"] });
  A.socket("valveOut", "root", P3([920, 60, 380])).socket("casingIn", "root", P3([1150, 60, 380]));
  A.connector("sightTube", "valveOut", "casingIn", { part: "root", z: 10.5, fill: "#0e2a33", core: C.water, coreW: 7, w: 16, coreAttrs: 'opacity="0"', light: "#cfefff", via: [], by: ["F71", "F68", "F63"], uses: ["flow.display", "machine.sockets"] });
  // gauge on a stem above the valve (glass dial, needle part)
  A.attach("gaugeStem", "pipe", { part: "root", z: 12, fill: C.anchor, by: ["F68"], uses: ["machine.partGraph"], path: `M${P3([1004, py, pz + pr - 4])} L${P3([1016, py, pz + pr - 4])} L${P3([1016, py, pz + pr + 40])} L${P3([1004, py, pz + pr + 40])} Z` });
  A.attach("gaugeBody", "gaugeStem", { part: "gauge", z: 0, fill: C.brass, by: ["F68", "F13"], uses: ["optics"], path: "M-40,0 C-40,-24 -22,-40 0,-40 C22,-40 40,-24 40,0 C40,24 22,40 0,40 C-22,40 -40,24 -40,0 Z" });
  A.patch("gaugeFace", "gaugeBody", { fill: "#fff8e6", by: ["F63", "F13"], uses: ["optics"], path: "M-32,0 C-32,-18 -18,-32 0,-32 C18,-32 32,-18 32,0 C32,18 18,32 0,32 C-18,32 -32,18 -32,0 Z" });
  A.patch("gaugeRed", "gaugeBody", { fill: "#e0503a", by: ["F68"], uses: ["machine.partGraph"], path: "M22,-16 C30,-8 32,0 32,6 L20,4 C20,-2 18,-6 14,-10 Z" });
  A.patch("gaugeGlint", "gaugeBody", { fill: "#ffffff", op: 0.6, by: ["F63"], uses: ["optics"], path: "M-24,-22 C-14,-30 -2,-32 6,-30 L-10,-16 C-14,-18 -20,-18 -24,-22 Z" });
  A.region("needleArm", { part: "needle", z: 0, fill: "#2a1f2a", by: ["F68"], uses: ["machine.partGraph"], path: "M-3,0 C-3,-4 3,-4 3,0 L1,-28 L-1,-28 Z" });
  // ---------- casing (vertical drum) on plinth, with box-face inspection window ----------
  const cxC = 1300, cyC = 150, rC = 150, zC = 380;
  A.facet("plinth", B, [[1080, -60, 0], [1520, -60, 0], [1520, -60, 40], [1080, -60, 40]], { part: "root", z: 13, fill: C.anchor, by: ["F59", "F68"], uses: ["machine.partGraph"] });
  A.facet("plinthTop", B, [[1080, -60, 40], [1520, -60, 40], [1520, 300, 40], [1080, 300, 40]], { part: "root", z: 12.9, fill: "#24414c", by: ["F59", "F38"], uses: ["projection.basis"] });
  const front = [...ring(cxC, cyC, 40, rC, 24, 90, 270).map(([x, y]) => [x, y, 40]), ...ring(cxC, cyC, zC, rC, 24, 270, 90).map(([x, y]) => [x, y, zC])];
  // front half of the drum side wall (angles chosen so the visible half faces the camera in this basis)
  const side = band3(cxC, cyC, rC, 40, zC);
  A.facet("drumSide", B, side, { part: "root", z: 14, fill: C.steel, by: ["F68", "F38", "F58"], uses: ["projection.basis", "silhouette.outer"] });
  A.patch("drumShade", "drumSide", { fill: C.steelS, by: ["F04", "F46", "F62"], uses: ["lighting.system"], path: pathOf(band(cxC, cyC, rC + 2, 30, zC + 2, 180 + TAN, 250)) });
  A.patch("drumLight", "drumSide", { fill: C.steelT, op: 0.6, by: ["F04"], uses: ["lighting.system"], path: pathOf(band(cxC, cyC, rC + 2, 30, zC + 2, 330, 360 + TAN)) });
  A.facet("drumTop", B, ring(cxC, cyC, zC, rC, 48), { part: "root", z: 14.2, fill: C.steelT, by: ["F68", "F38"], uses: ["projection.basis"] });
  A.repeat("drumBolts", "drumTop", Array.from({ length: 16 }, (_, i) => i * 22.5), (a) => { const p = P3([cxC + Math.cos(a * Math.PI / 180) * (rC - 14), cyC + Math.sin(a * Math.PI / 180) * (rC - 14), zC]); return `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="5" fill="${C.steelS}"/>`; }, { by: ["F54", "F76", "F68"], uses: ["repeats.parent"] });
  // window: a flat bezel plate mounted on the drum front, recess + glass + runner (F21 stack)
  const wc = [0, 0];
  A.region("bezel", { part: "window", z: 0, fill: C.anchor, by: ["F68", "F21"], uses: ["optics"], path: `M${wc[0] - 92},${wc[1]} C${wc[0] - 92},${wc[1] - 52} ${wc[0] - 50},${wc[1] - 94} ${wc[0]},${wc[1] - 94} C${wc[0] + 50},${wc[1] - 94} ${wc[0] + 92},${wc[1] - 52} ${wc[0] + 92},${wc[1]} C${wc[0] + 92},${wc[1] + 52} ${wc[0] + 50},${wc[1] + 94} ${wc[0]},${wc[1] + 94} C${wc[0] - 50},${wc[1] + 94} ${wc[0] - 92},${wc[1] + 52} ${wc[0] - 92},${wc[1]} Z` });
  A.repeat("bezelBolts", "bezel", Array.from({ length: 12 }, (_, i) => i * 30), (a) => `<circle cx="${(wc[0] + Math.cos(a * Math.PI / 180) * 82).toFixed(1)}" cy="${(wc[1] + Math.sin(a * Math.PI / 180) * 82).toFixed(1)}" r="4.5" fill="${C.brass}"/>`, { by: ["F54", "F76"], uses: ["repeats.parent"] });
  A.region("glass", { part: "window", z: 0.5, fill: "#0d2633", by: ["F21", "F63"], uses: ["optics", "layers.underpaint"], path: `M${wc[0] - 70},${wc[1]} C${wc[0] - 70},${wc[1] - 40} ${wc[0] - 38},${wc[1] - 72} ${wc[0]},${wc[1] - 72} C${wc[0] + 38},${wc[1] - 72} ${wc[0] + 70},${wc[1] - 40} ${wc[0] + 70},${wc[1]} C${wc[0] + 70},${wc[1] + 40} ${wc[0] + 38},${wc[1] + 72} ${wc[0]},${wc[1] + 72} C${wc[0] - 38},${wc[1] + 72} ${wc[0] - 70},${wc[1] + 40} ${wc[0] - 70},${wc[1]} Z` });
  // runner: authored blade module repeated round its hub, in its own part (rotates), clipped by the glass
  const blade = "M0,-8 C14,-20 34,-30 58,-28 C46,-18 30,-8 12,6 Z";
  A.region("runnerHub", { part: "runner", z: 0, fill: "#b9c6c9", by: ["F68"], uses: ["machine.partGraph"], path: "M-14,0 C-14,-8 -8,-14 0,-14 C8,-14 14,-8 14,0 C14,8 8,14 0,14 C-8,14 -14,8 -14,0 Z" });
  A.repeat("blades", "runnerHub", Array.from({ length: 9 }, (_, i) => i * 40), (a) => `<path d="${blade}" transform="rotate(${a})" fill="#8fd6e6"/><path d="M0,-8 C14,-20 34,-30 58,-28 C40,-24 24,-16 10,-4 Z" transform="rotate(${a})" fill="#d4f6fb"/>`, { by: ["F54", "F76", "F68"], uses: ["repeats.parent"], dz: -0.01, clip: false });
  A.patch("glassWater", "glass", { dz: 1.5, fill: C.water, by: ["F71", "F63"], uses: ["flow.display"], op: 0, path: `M${wc[0] - 70},${wc[1] + 20} C${wc[0] - 40},${wc[1] + 8} ${wc[0] + 30},${wc[1] + 28} ${wc[0] + 70},${wc[1] + 14} L${wc[0] + 70},${wc[1] + 80} L${wc[0] - 70},${wc[1] + 80} Z` });
  A.patch("glassStreak", "glass", { dz: 2.5, fill: "#ffffff", by: ["F63", "F13"], uses: ["optics"], op: 0.22, path: `M${wc[0] + 8},${wc[1] - 72} L${wc[0] + 40},${wc[1] - 64} L${wc[0] - 30},${wc[1] + 66} L${wc[0] - 58},${wc[1] + 44} Z` });
  // ---------- generator on top of the drum (vertical cylinder with fin repeats) ----------
  const gz0 = zC, gz1 = zC + 180, gr = 96;
  const gside = band3(cxC, cyC, gr, gz0, gz1);
  A.region("shaft", { part: "root", z: 14.5, fill: "#9aa7ad", by: ["F68"], uses: ["machine.partGraph"], path: `M${P3([cxC - 14, cyC, zC])} L${P3([cxC + 14, cyC, zC])} L${P3([cxC + 14, cyC, zC + 30])} L${P3([cxC - 14, cyC, zC + 30])} Z` });
  A.facet("genSide", B, gside, { part: "root", z: 17, fill: C.pipe, by: ["F68", "F38", "F58"], uses: ["projection.basis"] });
  A.repeat("fins", "genSide", Array.from({ length: 13 }, (_, i) => 180 + TAN + 8 + i * 13), (a) => { const r = a * Math.PI / 180, p0 = P3([cxC + Math.cos(r) * gr, cyC + Math.sin(r) * gr, gz0 + 20]), p1 = P3([cxC + Math.cos(r) * gr, cyC + Math.sin(r) * gr, gz1 - 20]); return `<path d="M${p0} L${p1}" stroke="${C.pipeS}" stroke-width="7" stroke-linecap="round"/>`; }, { by: ["F54", "F76", "F68"], uses: ["repeats.parent"] });
  A.patch("genShade", "genSide", { fill: C.pipeS, op: 0.8, by: ["F04"], uses: ["lighting.system"], path: pathOf(band(cxC, cyC, gr + 2, gz0, gz1 + 2, 180 + TAN, 248)) });
  A.facet("genTop", B, ring(cxC, cyC, gz1, gr, 40), { part: "root", z: 17.2, fill: C.pipeT, by: ["F68", "F38"], uses: ["projection.basis"] });
  A.socket("genTop", "root", P3([cxC + 40, cyC - 20, gz1])).socket("lampIn", "root", [1712, 236]);
  // ---------- cable + lamp (emitter with cage; halo/cone/pool bounded) ----------
  const gt = P3([cxC + 40, cyC - 20, gz1]);
  A.connector("cable", "genTop", "lampIn", { part: "root", z: 18, fill: "#4a2a1c", core: "#c9773a", w: 9, coreW: 3, via: [[gt[0], gt[1] - 60], [1560, gt[1] - 60], [1600, 180], [1712, 180]], by: ["F68", "F45"], uses: ["machine.sockets"] });
  A.region("lampBracket", { part: "root", z: 18.5, fill: C.anchor, by: ["F68", "F59"], uses: ["machine.partGraph"], path: "M1690,170 L1760,170 L1760,186 L1734,186 L1734,236 L1716,236 L1716,186 L1690,186 Z" });
  A.attach("lampShade", "lampBracket", { part: "root", z: 19, fill: C.steel, by: ["F68"], uses: ["machine.partGraph"], path: "M1690,236 L1760,236 C1776,256 1782,272 1784,284 L1666,284 C1668,272 1674,256 1690,236 Z" });
  A.patch("lampShadeS", "lampShade", { fill: C.steelS, by: ["F04"], uses: ["lighting.system"], path: "M1740,230 L1800,230 L1800,290 L1752,290 Z" });
  A.attach("lampBulb", "lampShade", { part: "root", z: 18.8, state: "lampOff", fill: "#6d7380", by: ["F04", "F13"], uses: ["optics"], path: "M1700,284 C1700,312 1716,326 1725,326 C1734,326 1750,312 1750,284 Z" });
  A.attach("lampBulbOn", "lampShade", { part: "root", z: 18.8, state: "lampOn", fill: C.lampCore, by: ["F04", "F13"], uses: ["optics"], path: "M1700,284 C1700,312 1716,326 1725,326 C1734,326 1750,312 1750,284 Z" });
  A.patch("filament", "lampBulbOn", { fill: "#ffb347", by: ["F13"], uses: ["optics"], path: "M1714,292 C1718,306 1732,306 1736,292 L1732,292 C1730,300 1720,300 1718,292 Z" });
  A.states("lamp", ["lampOff", "lampOn"], { by: ["F14", "F32"], uses: ["states"] });
  A.region("lampCage", { part: "root", z: 19.2, fill: "none", by: ["F58"], uses: ["silhouette.voids"], attrs: `stroke="${C.anchor}" stroke-width="4"`, path: "M1696,284 C1694,318 1712,336 1725,336 C1738,336 1756,318 1754,284 M1725,284 L1725,336 M1708,284 C1706,310 1714,330 1725,336 M1742,284 C1744,310 1736,330 1725,336" });
  A.optic("lampHalo", { part: "root", z: 18.7, state: "lampOn", kind: "surface_emission", color: C.lampHalo, at: [1725, 300], r: 190, op: 0.75, by: ["F04", "F13", "F32", "F63"], uses: ["optics", "effects.class"] });
  A.region("lampCone", { part: "root", z: 9, fill: C.lampHalo, by: ["F04", "F63", "F32"], uses: ["optics"], attrs: 'opacity="0" data-fx="cone"', path: `M1668,284 L1782,284 L${P3([2050, 40, 0])} L${P3([1480, -40, 0])} Z` });
  A.region("lampPool", { part: "root", z: 9.1, fill: C.lampHalo, by: ["F04", "F62"], uses: ["lighting.system"], attrs: 'opacity="0" data-fx="pool"', path: `M${P3([1520, -60, 0])} C${P3([1700, -120, 0])} ${P3([2050, -60, 0])} ${P3([2060, 30, 0])} C${P3([1960, 90, 0])} ${P3([1600, 60, 0])} ${P3([1520, -60, 0])} Z` });
  // ---------- hand wheel: rim, spokes (voids), hub, stem — separate part so it can turn ----------
  const rim = (r) => `M${-r},0 C${-r},${-r * 0.552} ${-r * 0.552},${-r} 0,${-r} C${r * 0.552},${-r} ${r},${-r * 0.552} ${r},0 C${r},${r * 0.552} ${r * 0.552},${r} 0,${r} C${-r * 0.552},${r} ${-r},${r * 0.552} ${-r},0 Z`;
  A.attach("wheelStem", "valveBody", { part: "root", z: 49, fill: C.anchor, by: ["F68", "F59"], uses: ["machine.partGraph"], path: `M${P3([vx - 12, py - vr, 420])} L${P3([vx + 12, py - vr, 420])} L${P3([vx + 12, -70, 420])} L${P3([vx - 12, -70, 420])} Z` });
  A.region("wheelRim", { part: "wheel", z: 0, layer: "front", fill: "#c43a2e", holes: [rim(78)], by: ["F68", "F58", "F59"], uses: ["silhouette.voids", "silhouette.identityFeatures"], path: rim(96) });
  A.patch("wheelRimLight", "wheelRim", { fill: "#ef6a4e", by: ["F04"], uses: ["lighting.system"], path: "M-120,-120 L120,-120 L120,-40 C40,-70 -40,-70 -120,-40 Z" });
  A.repeat("spokes", "wheelRim", [0, 60, 120, 180, 240, 300], (a) => `<path d="M0,-6 L82,-5 L82,5 L0,6 Z" transform="rotate(${a})" fill="#9c2a22"/>`, { by: ["F54", "F68"], uses: ["silhouette.voids"], dz: -0.5, clip: false });
  A.region("wheelHub", { part: "wheel", z: 1, layer: "front", fill: C.brass, by: ["F68"], uses: ["machine.partGraph"], path: "M-18,0 C-18,-10 -10,-18 0,-18 C10,-18 18,-10 18,0 C18,10 10,18 0,18 C-10,18 -18,10 -18,0 Z" });
  A.rigBind({ by: ["F15", "F31", "F79", "F14"], uses: ["motion.owners", "motion.keys", "layers.underpaint"], channels: ["wheel", "runner", "needle", "lamp"] });
  return A.compile({ rig: { place: { x: 0, y: 0 } } });
}
