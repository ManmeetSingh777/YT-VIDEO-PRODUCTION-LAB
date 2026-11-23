// APIARY world (layered natural, F37/F38-A/F39/F11/F47) + HIVE object (functional box, F09/F45/F68).
import { author } from "../../../engine/authoring/construct.mjs";

const NEG = { transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, historical: false, hasViewport: false };
const f1 = (v) => +v.toFixed(1);
const blob = (cx, cy, rx, ry) => `M${cx - rx},${cy} C${cx - rx},${cy - ry * 0.6} ${cx - rx * 0.5},${cy - ry} ${cx},${cy - ry} C${cx + rx * 0.5},${cy - ry} ${cx + rx},${cy - ry * 0.6} ${cx + rx},${cy} C${cx + rx},${cy + ry * 0.4} ${cx - rx},${cy + ry * 0.4} ${cx - rx},${cy} Z`;

export function apiary({ ctx, prefix = "ap-" } = {}) {
  const A = author("apiary", Object.assign({ kind: "world", subject_id: "apiary", world_class: "SCENIC_NATURAL", projection: "LAYERED", hasRepeats: true, moves: true, changesState: false, hasOptics: false, hasEmission: false, flowPath: false, prefix }, NEG), ctx);
  A.witness(["F39", "F11", "F69", "F37"], "question_native_witnesses/NUCLEAR_0022_functional_landscape.jpg", "question_native_witnesses/BRAIN_0334_full_actor_sparse_world.jpg",
    "functional landscape: strata of hills, rooted tree crowns in grouped lobes, regional greens; sparse acting field (unlike): background collapses to 2–3 support regions when the actor is the proof.");
  A.witness(["F47", "F53", "F77"], "character_native_anchors/NUCLEAR_0083_farm_humans.jpg", "molecular_native_anchors/VOLCANO_0015_forest.jpg", "near/mid/far foliage values; quiet opening kept around the actors.");
  for (const [k, v, by] of [["world.purpose", "a meadow apiary where one hive and one keeper make the smoke→bees relation readable", ["F37"]], ["world.class", "SCENIC_NATURAL", ["F37"]], ["world.substrate", "meadow ground plane + sky", ["F37"]],
    ["world.topology", "hive stand on ground; trees rooted on the far hill; flowers rooted in the front meadow", ["F37"]], ["projection.basis", "layered illustration (F38-A): four depth collections, overlap encodes depth", ["F38", "F60"]],
    ["vegetation.masses", ["far hill line", "tree group", "front flower band"], ["F39"]], ["world.strata", ["sky", "far hills", "tree line", "meadow", "front flowers"], ["F11"]], ["substrate.polygons", "ground + hills", ["F69"]],
    ["mediumTree", ["WORLD"], ["F20"]], ["view.inference", "keeper and hive share the frame so smoke travel is visible", ["F55"]], ["regions.map", { MAIN_PROOF: "smoker→hive diagonal", QUIET: "sky", SUPPORT: "meadow" }, ["F77"]],
    ["proof.silent", "support only", ["F57"]], ["proof.anchors", "hive entrance (target)", ["F57"]], ["generator.family", "foliage (trunk→crown lobes)", ["F34"]], ["repeats.parent", { trees: "far hill", flowers: "front meadow band" }, ["F54", "F76"]],
    ["materials", ["sky", "grass", "foliage"], ["F02", "F46"]], ["palette.roles", { sky: "#bfe3dc", far: "#94bf98", hill: "#86b47c", tree: "#5f9467", treeL: "#79ad73", ground: "#7fae6a", groundS: "#6d9c5b", flower: "#f2d15c", flower2: "#f08a6c" }, ["F03", "F51", "F61"]],
    ["palette.focalPair", "quiet cool-green world so the pale keeper and warm hive lead", ["F03"]], ["palette.pairs", [["ground", "sky"]], ["F61"]], ["lighting.system", "soft daylight from upper right; crowns carry a lit lobe", ["F04"]],
    ["edges", { all: "COLOR_ADJACENCY" }, ["F62"]], ["detail.owner", "far_environment", ["F33"]], ["detail.tiers", { T0: "sky/hills/ground", T1: "trees", T2: "flowers" }, ["F47", "F53"]], ["medium", "vector", ["F19"]],
    ["silhouette.outer", "hill line + tree crowns against sky", ["F01", "F58"]], ["silhouette.view", "frontal layered", ["F01"]], ["silhouette.identityFeatures", ["tree crowns"], ["F01"]], ["silhouette.voids", ["sky gaps between crowns"], ["F58"]], ["silhouette.smallRead", "three value bands", ["F58"]],
    ["parts", "strata are independent layers", ["F59"]], ["world.zones", { far: "hills", mid: "trees", near: "meadow" }, ["F10"]], ["world.supports", ["ground"], ["F10"]], 
    ["motion.owners", { grass: "WORLD sway", trees: "held" }, ["F15"]], ["motion.keys", ["held support"], ["F31"]], ["layers.underpaint", "full-width strata, no holes", ["F79"]]])
    A.decide(k, v, { by });
  const C = A.get("palette.roles");
  A.palette([["ground", "sky", 1.25], ["tree", "sky", 1.6]], { by: ["F03", "F51", "F61"] });
  A.part("root").part("grass", { parent: "root", z: 5 });
  A.region("sky", { part: "root", z: 0, fill: C.sky, path: "M-200,-200 L2120,-200 L2120,800 L-200,800 Z", by: ["F37", "F11", "F38", "F01", "F02", "F58", "F46", "F34", "F60"] });
  A.region("farHill", { part: "root", z: 1, fill: C.far, path: "M-200,640 C200,560 520,600 860,580 C1200,560 1560,600 2120,560 L2120,900 L-200,900 Z", by: ["F11", "F39", "F69", "F38", "F37", "F10"] });
  A.attach("hill", "farHill", { part: "root", z: 2, fill: C.hill, path: "M-200,700 C300,660 700,690 1100,676 C1500,662 1800,690 2120,672 L2120,900 L-200,900 Z", by: ["F11", "F39", "F69", "F59"] });
  A.repeat("trees", "farHill", [[120, 610], [260, 596], [1560, 594], [1700, 584], [1830, 592]], ([x, y], i) => {
    const s = 0.8 + (i % 3) * 0.18;
    return `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-6" y="-10" width="12" height="40" fill="#5b4632"/><path d="${blob(0, -40, 52, 46)}" fill="${C.tree}"/><path d="${blob(-26, -54, 30, 30)}" fill="${C.tree}"/><path d="${blob(20, -64, 30, 28)}" fill="${C.treeL}"/></g>`;
  }, { by: ["F39", "F54", "F76", "F11", "F34", "F69"], clip: false });
  A.attach("ground", "hill", { part: "root", z: 3, fill: C.ground, path: "M-200,760 C400,740 900,750 1400,744 C1700,740 1900,752 2120,746 L2120,1300 L-200,1300 Z", by: ["F37", "F11", "F69", "F02", "F10", "F59"] });
  A.patch("groundShade", "ground", { fill: C.groundS, path: "M-200,940 C500,920 1200,930 2120,920 L2120,1300 L-200,1300 Z", by: ["F04", "F46", "F62"] });
  A.repeat("flowers", "ground", Array.from({ length: 26 }, (_, i) => [40 + i * 74 + (i % 3) * 13, 1010 + (i % 4) * 16]), ([x, y], i) =>
    `<g id="${prefix}fl${i}" data-b="${x},${y}" transform="translate(${x} ${y})"><path d="M0,0 C-2,-14 2,-26 0,-38" stroke="#4f7d48" stroke-width="3" fill="none"/><circle cy="-40" r="7" fill="${i % 3 ? C.flower : C.flower2}"/><circle cy="-40" r="2.6" fill="#6b4a1e"/></g>`, { by: ["F39", "F54", "F76", "F47", "F11"], clip: false });
  A.rigBind({ by: ["F15", "F31", "F79"] });
  return A.compile({ rig: { place: { x: 0, y: 0 } } });
}

/** HIVE: stand + bottom board with entrance recess + two boxes + lid; bee flight emits from the entrance socket */
export function hive({ ctx, prefix = "hv-", at = [1480, 900] } = {}) {
  const A = author("hive", Object.assign({ kind: "machine", subject_id: "hive", projection: "OBLIQUE", world_class: "NONE", hasRepeats: true, moves: true, changesState: true, hasOptics: false, hasEmission: false, flowPath: false, prefix }, NEG), ctx);
  A.witness(["F68", "F09", "F45", "F38"], "question_native_witnesses/NUCLEAR_0271_mechanism_scale_world.jpg", "question_native_witnesses/AI_0285_machine_actor_interior.jpg", "one oblique basis: top lightest, front mid, side darkest of one hue; functional opening as a dark recess with rim.");
  A.witness(["F02", "F04"], "character_native_anchors/BRAIN_0157_couch_human.jpg", "question_native_witnesses/AI_0035_oblique_built_space.jpg", "hard flat faces; wall-local details on their own face.");
  const B = { o: at, u: [1, 0], v: [0.5, -0.32], h: [0, -1] };
  for (const [k, v, by] of [["machine.truthTable", { input: "bees", process: "colony inside the boxes", output: "bees through the entrance", operator: "keeper (smoke)" }, ["F45", "F68", "F09"]], ["machine.partGraph", "stand→bottom board(entrance)→brood box→super→lid", ["F09"]],
    ["machine.assemblies", ["stand", "boxes", "lid"], ["F45"]], ["machine.surfacePolicy", { wood: "HARD_BOUNDARY" }, ["F68"]], ["machine.sockets", ["entrance"], ["F68"]], ["projection.basis", B, ["F38", "F60", "F08"]],
    ["proof.silent", "bees leave/return through the entrance", ["F57"]], ["proof.anchors", { target: "entrance slot" }, ["F57"]], ["repeats.parent", { boards: "box front face" }, ["F54", "F76"]],
    ["silhouette.outer", "stacked boxes on legs, overhanging lid", ["F01", "F58"]], ["silhouette.view", "oblique", ["F01"]], ["silhouette.identityFeatures", ["stacked boxes", "lid overhang", "legs"], ["F01"]], ["silhouette.voids", ["gap between stand legs"], ["F58"]], ["silhouette.smallRead", "warm block on legs", ["F58"]],
    ["parts", "lid on super on brood box on bottom board on stand", ["F59"]], ["materials", ["painted wood"], ["F02", "F46"]], ["lighting.system", "top light, front mid, side shade", ["F04"]], ["edges", { boxJoints: "MATERIAL_SEAM" }, ["F62"]],
    ["palette.roles", { front: "#e6a24a", side: "#b87a2e", top: "#f6c977", super: "#d98f3c", lid: "#f1efe6", lidS: "#c8c5b8", stand: "#6b4a2e", dark: "#3a2414" }, ["F03", "F51", "F61"]], ["palette.focalPair", "warm hive vs cool meadow", ["F03"]], ["palette.pairs", [["front", "ground"]], ["F61"]],
    ["detail.owner", "focal_structural (entrance)", ["F33"]], ["detail.tiers", { T1: "boxes", T2: "handholds, seams, entrance" }, ["F47", "F53"]], ["medium", "vector", ["F19"]], ["generator.family", "built object", ["F34"]],
    ["states", { entrance: "bees in/out" }, ["F14"]], ["motion.owners", { bees: "EFFECT flight paths from entrance" }, ["F15"]], ["motion.keys", ["busy", "settle"], ["F31"]], ["layers.underpaint", "solid boxes", ["F79"]]])
    A.decide(k, v, { by });
  const C = A.get("palette.roles");
  A.palette([["front", "#7fae6a", 60, "hue"], ["dark", "front", 3]], { by: ["F03", "F51", "F61"] });
  A.part("root");
  const P3 = ([x, y, z]) => [B.o[0] + x + y * B.v[0], B.o[1] + y * B.v[1] - z];
  const box = (id, x0, z0, w, h, d, col) => {
    A.facet(id + "Side", B, [[x0 + w, 0, z0], [x0 + w, d, z0], [x0 + w, d, z0 + h], [x0 + w, 0, z0 + h]], { part: "root", z: 2, fill: C.side, by: ["F68", "F38", "F04"] });
    A.facet(id + "Top", B, [[x0, 0, z0 + h], [x0 + w, 0, z0 + h], [x0 + w, d, z0 + h], [x0, d, z0 + h]], { part: "root", z: 2.1, fill: C.top, by: ["F68", "F38", "F04"] });
    A.facet(id, B, [[x0, 0, z0], [x0 + w, 0, z0], [x0 + w, 0, z0 + h], [x0, 0, z0 + h]], { part: "root", z: 2.2, fill: col, by: ["F68", "F01", "F58", "F09", "F45", "F02", "F34", "F08", "F38"] });
  };
  for (const lx of [-70, 50, 74]) A.facet("leg" + lx, B, [[lx, 10, 0], [lx + 16, 10, 0], [lx + 16, 10, 90], [lx, 10, 90]], { part: "root", z: 1, fill: C.stand, by: ["F59", "F68"] });
  A.facet("standTop", B, [[-90, 0, 90], [110, 0, 90], [110, 0, 104], [-90, 0, 104]], { part: "root", z: 1.5, fill: C.stand, by: ["F59", "F68"] });
  A.edge("boxJoint", "standTop", { role: "MATERIAL_SEAM", color: "#4a3220", w: 2, clip: false, path: `M${P3([-90, 0, 104])} L${P3([110, 0, 104])}`, by: ["F62"] });
  box("brood", -80, 104, 180, 120, 120, C.front); box("super", -80, 226, 180, 70, 120, C.super);
  A.attach("superSeat", "brood", { part: "root", z: 2.25, fill: "#c98a36", path: `M${P3([-80, 0, 222])} L${P3([100, 0, 222])} L${P3([100, 0, 228])} L${P3([-80, 0, 228])} Z`, by: ["F59", "F62"] });
  A.facet("lid", B, [[-92, -8, 296], [112, -8, 296], [112, -8, 316], [-92, -8, 316]], { part: "root", z: 3, fill: C.lid, by: ["F68", "F59"] });
  { const lidShadow = [P3([-80, 0, 296]), P3([100, 0, 296]), P3([100, 0, 282]), P3([-80, 0, 282])];
    A.patch("lidCast", "super", { fill: "#b06f2a", path: `M${lidShadow.map((p) => p.map(f1).join(",")).join(" L")} Z`, by: ["F62", "F04", "F46"] }); // CAST_SHADOW of the lid on the super
    const lit = [P3([-80, 0, 214]), P3([-56, 0, 214]), P3([-56, 0, 110]), P3([-80, 0, 110])];
    A.patch("broodLit", "brood", { fill: "#f0b862", path: `M${lit.map((p) => p.map(f1).join(",")).join(" L")} Z`, by: ["F04", "F46"] }); }
  A.facet("lidTop", B, [[-92, -8, 316], [112, -8, 316], [112, 128, 316], [-92, 128, 316]], { part: "root", z: 2.9, fill: C.lidS, by: ["F68", "F38"] });
  const ent = [P3([-40, 0, 112]), P3([60, 0, 112]), P3([60, 0, 124]), P3([-40, 0, 124])];
  A.recess("entrance", "brood", { fill: C.dark, path: `M${ent.map((p) => p.map(f1).join(",")).join(" L")} Z`, by: ["F68", "F09", "F45"] });
  const hh = [P3([0, 0, 180]), P3([40, 0, 180]), P3([40, 0, 192]), P3([0, 0, 192])];
  A.recess("handhold", "brood", { fill: "#a86a24", path: `M${hh.map((p) => p.map(f1).join(",")).join(" L")} Z`, by: ["F68"] });
  A.repeat("seams", "brood", [-36, 8, 52], (x) => { const a = P3([x, 0, 106]), b = P3([x, 0, 222]); return `<path d="M${a} L${b}" stroke="#c98a36" stroke-width="2" opacity=".6"/>`; }, { by: ["F54", "F76", "F62"] });
  A.socket("entrance", "root", P3([10, 0, 118]));
  A.states("activity", ["busy", "calm"], { by: ["F14"] });
  A.rigBind({ by: ["F15", "F31", "F79"] });
  const out = A.compile({ rig: { place: { x: 0, y: 0 } } });
  out.entrance = P3([10, 0, 118]);
  return out;
}
