// BEEKEEPER — new original qualification subject (nothing taken from the keeper, engineer or warden).
// A young beekeeper in a baggy pale suit, low wide-brim hat whose veil drapes behind the head, leather gloves, rubber
// boots; she holds a bellows smoker forward. Built through engine/authoring/stages.mjs: the skill's procedures run in
// order (family → silhouette → topology derived FROM the silhouette → head → materials → contacts) and each stage's
// method tests run on these exact contours before the next stage may start.
import { stages, segments } from "../../../engine/authoring/stages.mjs";
import { xform } from "../../../engine/lib/geom.mjs";

// ---- authored silhouette: 34 named cubic segments, clockwise from the hat dome (local, feet-centred, y up = negative) ----
const SEG = [
  ["domeR", [0, -600], [40, -600], [62, -580], [64, -534]], ["brimTopR", [64, -534], [96, -532], [124, -530], [142, -520]],
  ["brimTipR", [142, -520], [150, -514], [140, -506], [122, -504]], ["brimUnderR", [122, -504], [112, -503], [102, -503], [92, -503]],
  ["brow", [92, -503], [96, -496], [100, -488], [100, -478]], ["nose", [100, -478], [111, -474], [113, -462], [102, -458]],
  ["lip", [102, -458], [100, -448], [100, -440], [96, -432]], ["chin", [96, -432], [92, -420], [80, -414], [68, -416]],
  ["neck", [68, -416], [66, -410], [64, -404], [62, -398]], ["chest", [62, -398], [84, -396], [100, -388], [106, -378]],
  ["armTop", [106, -378], [140, -364], [170, -332], [190, -306]], ["gloveTip", [190, -306], [206, -296], [214, -276], [200, -266]],
  ["gloveUnder", [200, -266], [188, -258], [170, -268], [160, -280]], ["armUnder", [160, -280], [146, -294], [130, -306], [116, -314]],
  ["belly", [116, -314], [122, -280], [124, -240], [116, -206]], ["hipF", [116, -206], [128, -180], [136, -140], [138, -100]],
  ["legFout", [138, -100], [140, -76], [138, -56], [134, -44]], ["bootFtop", [134, -44], [150, -38], [172, -30], [180, -16]],
  ["bootFtoe", [180, -16], [186, -8], [182, 0], [170, 0]], ["bootFsole", [170, 0], [140, 0], [110, 0], [96, 0]],
  ["bootFheel", [96, 0], [92, -14], [92, -30], [94, -42]], ["legFin", [94, -42], [86, -90], [70, -140], [46, -166]],
  ["legBin", [46, -166], [30, -130], [22, -80], [18, -42]], ["bootBfront", [18, -42], [26, -34], [32, -20], [30, -8]],
  ["bootBsole", [30, -8], [30, 0], [-20, 0], [-52, 0]], ["bootBback", [-52, 0], [-62, -4], [-62, -24], [-54, -40]],
  ["legBout", [-54, -40], [-64, -90], [-82, -150], [-92, -196]], ["hipB", [-92, -196], [-108, -230], [-118, -280], [-116, -330]],
  ["backTorso", [-116, -330], [-116, -350], [-114, -366], [-110, -378]], ["veilB", [-110, -378], [-128, -410], [-134, -460], [-120, -502]],
  ["brimUnderL", [-120, -502], [-130, -504], [-142, -508], [-142, -516]], ["brimTipL", [-142, -516], [-142, -524], [-128, -530], [-110, -532]],
  ["brimTopL", [-110, -532], [-92, -534], [-76, -534], [-62, -534]], ["domeL", [-62, -534], [-62, -580], [-40, -600], [0, -600]],
];

export function beekeeper({ ctx, prefix = "bk-", place = [760, 1000], displayH = 640, light = -50, support = "#7fae6a", worldValue = "light" } = {}) {
  const cx = { kind: "character", family: "HUMAN_GESTURE_FULL", subject_id: "beekeeper", view: "three_quarter_right", projection: "FLAT", world_class: "NONE", headPx: 104,
    faceVisible: true, hasContact: true, moves: true, changesState: true, hasOptics: false, facialHair: false, support_value: worldValue === "dark" ? "dark" : "mid", world_value: worldValue, prefix,
    transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, hasRepeats: true, flowPath: false, hasEmission: false };
  const T = (d) => xform(d, { x: place[0], y: place[1] });
  const K = stages("beekeeper", cx, ctx), A = K.A;
  A.witness(["F01", "F58", "F64", "F66"], "character_native_anchors/BRAIN_0386_runner_human.jpg", "question_native_witnesses/SOLAR_0084_suited_human.jpg",
    "runner: whole-body gesture from torso/leg masses + contrasting shoes; suited figure (unlike): a big outer suit silhouette carries identity with only a few internal regions.");
  A.witness(["F05", "F65", "F52"], "question_native_witnesses/NUCLEAR_0145_lab_procedural_people.jpg", "character_native_anchors/MEMORIES_0753_clinic_humans.jpg",
    "medium actors: dark-mark eyes + brow/mouth marks; larger acting heads (unlike): white sclera with a lid cut — scale and role decide.");
  A.witness(["F02", "F46", "F62", "F04"], "character_native_anchors/BRAIN_0157_couch_human.jpg", "question_native_witnesses/AI_0285_machine_actor_interior.jpg",
    "opaque flat fills meeting by colour adjacency, few large planes; unlike dark interior: planes darker on the side away from the light, bounded cone + pool only where a source exists.");

  // 1 ── family → derived budget (F64/F65/F52)
  const fam = K.family({ family: "HUMAN_GESTURE_FULL", headPx: cx.headPx, gaze: true });
  // 2 ── silhouette FIRST (F01/F58)
  const sg = segments(SEG, T);
  K.silhouette({ outer: sg.outer, displayH, identity: ["low dome + wide brim", "veil drape behind the head", "baggy suit + wide stance", "forward smoker arm"],
    gaps: [{ name: "between the legs", path: T("M46,-150 C60,-112 72,-76 80,-40 L84,-6 L34,-6 C30,-40 34,-100 46,-150 Z") },
           { name: "under the forward arm", path: T("M122,-300 C134,-292 146,-284 152,-276 L124,-268 Z"), minCells: 0 }] });
  // 3 ── parent masses assembled FROM the silhouette segments (F59): no part is redrawn
  const p = sg.part, P = {
    dome: p(["domeR", { to: [-62, -534], c1: [30, -522], c2: [-30, -522] }, "domeL"]),
    brim: p(["brimTopR", "brimTipR", "brimUnderR", { to: [-120, -502], c1: [40, -500], c2: [-60, -500] }, "brimUnderL", "brimTipL", "brimTopL", { to: [64, -534], c1: [-20, -538], c2: [30, -538] }]),
    head: p(["brow", "nose", "lip", "chin", "neck", { to: [-40, -404], c1: [30, -384], c2: [-10, -386] }, { to: [-60, -500], c1: [-60, -430], c2: [-66, -470] }, { to: [92, -503], c1: [-10, -506], c2: [50, -506] }]),
    veil: p(["veilB", { to: [-50, -502], c1: [-100, -504], c2: [-70, -504] }, { to: [-44, -404], c1: [-62, -470], c2: [-56, -430] }, { to: [-110, -378], c1: [-70, -396], c2: [-96, -384] }]),
    torso: p(["chest", { to: [116, -314], c1: [96, -350], c2: [104, -330] }, "belly", { to: [-92, -196], c1: [60, -196], c2: [-30, -192] }, "hipB", "backTorso", { to: [62, -398], c1: [-60, -410], c2: [20, -412] }]),
    armF: p(["armTop", { to: [160, -280], c1: [182, -296], c2: [170, -284] }, "armUnder", { to: [106, -378], c1: [78, -332], c2: [76, -366] }]),
    gloveF: p(["gloveTip", "gloveUnder", { to: [190, -306], c1: [160, -302], c2: [172, -320] }]),
    legF: p(["hipF", "legFout", { to: [94, -42], c1: [120, -46], c2: [104, -44] }, "legFin", { to: [116, -206], c1: [60, -236], c2: [100, -232] }]),
    bootF: p(["bootFtop", "bootFtoe", "bootFsole", "bootFheel", { to: [134, -44], c1: [100, -62], c2: [128, -64] }]),
    legB: p(["legBin", { to: [-54, -40], c1: [0, -46], c2: [-30, -46] }, "legBout", { to: [46, -166], c1: [-40, -232], c2: [20, -226] }]),
    bootB: p(["bootBfront", "bootBsole", "bootBback", { to: [18, -42], c1: [-30, -62], c2: [0, -62] }]),
  };
  const parts = [
    { id: "torso", parent: null, z: 5, path: P.torso }, { id: "legB", parent: "torso", z: 2, path: P.legB }, { id: "bootB", parent: "legB", z: 3, path: P.bootB },
    { id: "legF", parent: "torso", z: 4, path: P.legF }, { id: "bootF", parent: "legF", z: 4.5, path: P.bootF },
    { id: "veil", parent: "torso", z: 5.5, path: P.veil }, { id: "head", parent: "torso", z: 6, path: P.head },
    { id: "brim", parent: "head", z: 8, path: P.brim }, { id: "dome", parent: "brim", z: 7.5, path: P.dome },
    { id: "armF", parent: "torso", z: 9, path: P.armF }, { id: "gloveF", parent: "armF", z: 10, path: P.gloveF },
  ];
  K.topology(parts, { coverage: 0.97 });

  // 4 ── head in F05 order; eye construction must match the DERIVED mode (fam.mode)
  const mk = (cx0, cy0, rx, ry) => T(`M${cx0 - rx},${cy0} C${cx0 - rx},${cy0 - ry * 0.55} ${cx0 - rx * 0.55},${cy0 - ry} ${cx0},${cy0 - ry} C${cx0 + rx * 0.55},${cy0 - ry} ${cx0 + rx},${cy0 - ry * 0.55} ${cx0 + rx},${cy0} C${cx0 + rx},${cy0 + ry * 0.55} ${cx0 + rx * 0.55},${cy0 + ry} ${cx0},${cy0 + ry} C${cx0 - rx * 0.55},${cy0 + ry} ${cx0 - rx},${cy0 + ry * 0.55} ${cx0 - rx},${cy0} Z`);
  const eyes = fam.mode === "WHITE_SCLERA_ACTOR"
    ? { near: { sclera: { path: mk(66, -470, 8, 9) }, pupil: { path: mk(68, -470, 4.5, 5.5) }, lid: { path: T("M56,-482 L78,-482 L78,-474 C70,-477 62,-477 56,-474 Z") } }, far: { sclera: { path: mk(32, -468, 6, 8.5) }, pupil: { path: mk(34, -468, 3.6, 5) }, lid: { path: T("M24,-480 L40,-480 L40,-472 C34,-474 28,-474 24,-472 Z") } } }
    : { near: { mark: { path: mk(68, -468, 5, 7) } }, far: { mark: { path: mk(33, -466, 4, 6.5) } } };
  const H = {
    headPart: "head", facePlane: { path: P.head },
    hair: [{ id: "bangs", path: T("M-52,-500 C-20,-501 50,-502 88,-501 C80,-489 66,-484 54,-488 C40,-480 22,-481 10,-488 C-8,-481 -30,-484 -44,-492 C-48,-488 -50,-492 -52,-500 Z") },
           { id: "lock", path: T("M-58,-498 C-70,-470 -68,-438 -52,-414 C-42,-436 -40,-466 -42,-496 Z") }],
    eyes,
    brows: [{ id: "browN", path: T("M58,-484 C64,-490 74,-490 80,-485 C74,-487 64,-486 58,-482 Z") }, { id: "browF", path: T("M24,-481 C29,-487 37,-487 41,-482 C36,-484 30,-484 25,-479 Z") }],
    mouth: [{ id: "mouth", path: T("M74,-438 C80,-434 88,-434 94,-438 C88,-430 80,-430 74,-438 Z") }],
    cheeks: [{ id: "cheek", path: mk(56, -448, 10, 6.5) }, { id: "ear", path: T("M-20,-466 C-34,-468 -38,-446 -28,-436 C-22,-432 -14,-436 -12,-442 C-18,-448 -18,-458 -20,-466 Z") }],
  };
  K.head(H);
  // 5 ── materials: owned planes; side of every shade/light plane tested against the light; brim casts on the face
  const C = { suit: "#eef0e8", suitS: "#c6cfd8", suitL: "#ffffff", hat: "#f3e9cf", hatS: "#cdbf9c", veil: "#dfe6e2", veilS: "#b8c4c2", skin: "#c98a5e", skinS: "#a5683f", hair: "#3a2416",
    glove: "#c8954e", gloveS: "#9a6a2c", boot: "#2f4a3c", bootS: "#1f3329", bootL: "#4e7360", mouth: "#6a2a26", cheek: "#e0745f", mark: "#26170f" };
  const L = (d) => T(d);
  A.decide("palette.support", support, { by: ["F03"] });
  A.decide("palette.garment.bootF", C.boot, { by: ["F03"], why: "rubber boots" }); A.decide("palette.garment.bootB", C.bootS, { by: ["F03"] }); A.decide("palette.garment.bootB.far", true, { by: ["F03"] });
  A.decide("palette.garmentLift", "#6f9a86", { by: ["F61"] });
  A.learn(); // matching lessons rewrite garment decisions here, before any material is emitted
  C.boot = A.get("palette.garment.bootF"); C.bootS = A.get("palette.garment.bootB");
  K.materials(light, {
    dome: { base: C.hat, planes: [{ role: "shade", path: L("M-70,-610 L-20,-610 C-34,-580 -40,-556 -40,-530 L-70,-530 Z") }, { role: "light", path: L("M20,-606 C46,-600 60,-584 64,-556 C54,-566 40,-578 20,-584 Z") }], edges: [{ role: "INTERNAL_CREASE", path: L("M-62,-540 C-20,-548 30,-548 64,-540") }] },
    brim: { base: C.hat, planes: [{ role: "shade", path: L("M-150,-514 C-60,-504 60,-502 150,-514 L150,-496 L-150,-496 Z") }] },
    veil: { base: C.veil, planes: [{ role: "shade", path: L("M-140,-500 L-112,-500 C-118,-460 -116,-420 -100,-380 L-140,-380 Z") }], edges: [{ role: "INTERNAL_CREASE", path: L("M-90,-496 C-96,-460 -94,-424 -84,-392") }, { role: "INTERNAL_CREASE", path: L("M-70,-498 C-74,-462 -72,-428 -64,-398") }] },
    head: { base: C.skin, planes: [{ role: "cast", from: "brim", path: L("M-60,-504 L100,-504 L100,-490 C70,-486 30,-488 -10,-486 C-30,-488 -50,-490 -60,-494 Z") }, { role: "shade", path: L("M-70,-500 L-10,-500 C-22,-470 -22,-430 -6,-400 L-70,-400 Z") }] },
    torso: { base: C.suit, planes: [{ role: "shade", path: L("M-130,-400 L-60,-400 C-74,-340 -76,-270 -60,-190 L-130,-190 Z") }, { role: "light", path: L("M70,-396 C96,-388 112,-370 116,-330 C104,-350 90,-370 70,-380 Z") }],
      edges: [{ role: "MATERIAL_SEAM", path: L("M54,-396 C60,-330 66,-260 70,-200") }, { role: "INTERNAL_CREASE", path: L("M-40,-260 C-20,-250 10,-250 30,-262") }] },
    armF: { base: C.suit, planes: [{ role: "shade", path: L("M110,-330 C130,-312 150,-296 168,-282 L170,-270 L110,-300 Z") }] },
    gloveF: { base: C.glove, planes: [{ role: "shade", path: L("M156,-282 C172,-270 190,-262 204,-266 L204,-250 L150,-262 Z") }] },
    legF: { base: C.suit, planes: [{ role: "shade", path: L("M44,-176 C72,-136 88,-92 96,-40 L114,-40 C108,-90 94,-136 70,-184 Z") }], edges: [{ role: "INTERNAL_CREASE", path: L("M104,-140 C112,-120 116,-96 116,-70") }] },
    legB: { base: C.suitS, planes: [{ role: "shade", path: L("M-100,-200 L-70,-200 C-62,-150 -52,-100 -48,-44 L-100,-44 Z") }] },
    bootF: { base: C.boot, planes: [{ role: "light", path: L("M134,-44 C150,-40 168,-32 178,-20 L170,-26 C156,-34 142,-38 132,-40 Z") }] },
    bootB: { base: C.bootS, planes: [] },
  });
  A.decide("palette.roles", C, { by: ["F03", "F51", "F61"] });
  A.decide("palette.focalPair", "pale suit + warm gloves/face vs mid-green meadow", { by: ["F03"] });
  A.decide("palette.pairs", [["suit", "support"], ["skin", "hat"], ["glove", "suit"]], { by: ["F61"] });
  A.palette([["suit", support, 2.0, "luma"], ["glove", "suit", 1.8, "luma"], ["boot", support, 2.0, "luma"], ["skin", "hat", 1.4, "luma"]], { by: ["F03", "F51", "F61"] });

  // 6 ── contact: smoker bellows gripped; fingers in front of the board, palm behind (F06/F59)
  const SM = {
    body: T("M196,-388 L238,-388 L240,-318 C234,-310 202,-310 196,-318 Z"), lid: T("M192,-392 L242,-392 C238,-404 228,-410 218,-412 C206,-410 196,-404 192,-392 Z"),
    spout: T("M210,-410 C214,-424 222,-436 236,-444 L244,-434 C232,-428 226,-418 224,-408 Z"),
    bellowsTop: T("M188,-318 L246,-318 L240,-304 L190,-304 Z"), bellowsLeather: T("M190,-304 L240,-304 C236,-292 226,-286 214,-286 C202,-286 194,-292 190,-304 Z"), board: T("M184,-286 L236,-286 L232,-276 L186,-276 Z"),
  };
  const fingers = T("M178,-292 C188,-294 200,-292 208,-284 C212,-276 206,-270 196,-270 C188,-270 180,-274 176,-280 C174,-286 174,-290 178,-292 Z");
  K.contacts([{ id: "glove→bellows board", propPath: SM.board, front: [{ path: fingers }], frontZ: 11, propZ: 10.5, backZ: 10 }]);
  K.done();
  A.decide("contacts.geometry", { fingers, board: SM.board }, { by: ["F06"] });

  // remaining routed decisions recorded as actually executed by the stages above
  for (const [k, by] of [["identity.canonical", ["F64", "F30"]], ["body.gesture", ["F06"]], ["body.support", ["F06", "F66"]], ["body.garments", ["F66"]], ["states", ["F14", "F30"]], ["landmarks", ["F67"]], ["motion.owners", ["F15"]], ["motion.keys", ["F31"]], ["layers.underpaint", ["F79"]], ["repeats.parent", ["F54", "F76"]], ["detail.owner", ["F33"]], ["detail.tiers", ["F47", "F53"]], ["medium", ["F19"]], ["identity.views", ["F30"]], ["optics", []]])
    if (!(k in A.decisions)) A.decide(k, "see stage receipt", { by });
  // ── EMISSION: stage-validated geometry → regions on rig joints (pivots; paths made joint-local) ──
  const piv = { torso: [0, -300], head: [60, -400], armF: [106, -370], gloveF: [178, -294], legF: [90, -190], legB: [-20, -190] };
  const W = (k) => [place[0] + piv[k][0], place[1] + piv[k][1]];
  const rel = (d, k) => xform(d, { x: -W(k)[0], y: -W(k)[1] });
  A.part("root", { at: place }).part("torso", { parent: "root", at: piv.torso, z: 5 }).part("legB", { parent: "root", at: piv.legB, z: 2 }).part("legF", { parent: "root", at: piv.legF, z: 4 })
    .part("head", { parent: "torso", at: [piv.head[0] - piv.torso[0], piv.head[1] - piv.torso[1]], z: 6, lag: 0.03 })
    .part("armF", { parent: "torso", at: [piv.armF[0] - piv.torso[0], piv.armF[1] - piv.torso[1]], z: 9, lag: 0.06 })
    .part("gloveF", { parent: "armF", at: [piv.gloveF[0] - piv.armF[0], piv.gloveF[1] - piv.armF[1]], z: 1, lag: 0.09 });
  const owner = { torso: "torso", veil: "head", head: "head", brim: "head", dome: "head", armF: "armF", gloveF: "gloveF", legF: "legF", bootF: "legF", legB: "legB", bootB: "legB" };
  const zOf = { torso: 0, veil: -2, head: 0, dome: 1, brim: 2, armF: 0, gloveF: 0, legF: 0, bootF: 1, legB: 0, bootB: 1 };
  for (const pt of parts) {
    const j = owner[pt.id], m = K.mat[pt.id];
    const rid = pt.id + "_f"; // region ids never collide with joint ids
    A.region(rid, { part: j, z: zOf[pt.id], fill: m.base, path: rel(pt.path, j), by: ["F01", "F58", "F59", "F02", "F64"] });
    (m.planes || []).forEach((pl, i) => A.patch(`${pt.id}_${pl.role}${i}`, rid, { fill: pl.role === "light" ? ({ dome: "#fff8e6", torso: C.suitL, bootF: C.bootL })[pt.id] || "#ffffff" : ({ dome: C.hatS, brim: C.hatS, veil: C.veilS, head: C.skinS, torso: C.suitS, armF: C.suitS, gloveF: C.gloveS, legF: C.suitS, legB: "#a9b4be" })[pt.id] || "#000", path: rel(pl.path, j), by: pl.role === "cast" ? ["F62", "F04"] : ["F04", "F46", "F62", "F02"] }));
    (m.edges || []).forEach((e, i) => A.edge(`${pt.id}_e${i}`, rid, { role: e.role, color: e.role === "MATERIAL_SEAM" ? C.suitS : ({ veil: C.veilS, dome: C.hatS })[pt.id] || C.suitS, w: 3, path: rel(e.path, j), by: ["F62"] }));
  }
  for (const hr of H.hair) A.attach(hr.id, "head_f", { part: "head", z: 3, fill: C.hair, path: rel(hr.path, "head"), by: ["F05", "F52"] });
  for (const [side, e] of Object.entries(H.eyes)) for (const [k, r] of Object.entries(e)) A.region(`eye_${side}_${k}`, { part: "head", z: 4, fill: k === "sclera" ? "#fff7ec" : k === "lid" ? C.skinS : C.mark, path: rel(r.path, "head"), by: ["F05", "F65", "F52"] });
  for (const b of H.brows) A.region(b.id, { part: "head", z: 4, fill: C.hair, path: rel(b.path, "head"), by: ["F05", "F65"] });
  A.region("mouth", { part: "head", z: 4, fill: C.mouth, path: rel(H.mouth[0].path, "head"), by: ["F05", "F65", "F67"] });
  A.region("cheek", { part: "head", z: 3.5, fill: C.cheek, attrs: 'opacity=".5"', path: rel(H.cheeks[0].path, "head"), by: ["F05", "F02"] });
  A.region("ear", { part: "head", z: 3.6, fill: C.skinS, path: rel(H.cheeks[1].path, "head"), by: ["F05"] });
  // the smoker is a separate MACHINE subject (subjects/smoker.mjs) attached to this grip socket at runtime
  A.socket("grip", "gloveF", [192 - piv.gloveF[0], -280 - piv.gloveF[1]]);
  const rs = (d) => rel(d, "gloveF");
  A.region("fingers", { part: "gloveF", z: 2, layer: "front", fill: C.glove, path: rs(fingers), by: ["F06", "F59"] });
  A.patch("fingersS", "fingers", { fill: C.gloveS, path: rs(T("M176,-282 C186,-276 198,-272 208,-276 L208,-266 L176,-268 Z")), by: ["F04"] });
  A.contact("grip", { by: ["F06", "F59"], front: ["fingers"], back: ["gloveF_f"], prop: "smoker.board" });
  // veil mesh: repeated owned module of the veil (F54/F76) — lines live only inside the veil and follow its drape
  A.repeat("veilMesh", "veil_f", [-128, -116, -104, -92, -80, -68, -56], (x) => `<path d="${rel(L(`M${x},-500 C${x - 6},-460 ${x - 4},-420 ${x + 10},-380`), "head")}" stroke="${C.veilS}" stroke-width="2" fill="none" opacity=".7"/>`, { by: ["F54", "F76", "F62"] });
  A.rigBind({ by: ["F15", "F30", "F31", "F66", "F79", "F14"], channels: ["torso", "head", "armF", "gloveF"] });
  A.states("pump", ["pumpOpen"], { by: ["F14", "F30", "F67"] });
  return { K, A, T, P, fam, C, out: () => A.compile({ rig: { place: { x: 0, y: 0 } }, allowIncomplete: process.env.MN_STAGE_PREVIEW === "1" }) };
}
