// WARDEN — the engineer identity REBUILT as a form construction (v5). v4 (engineer.mjs) is kept as diagnostic evidence.
// Every drawn contour is COMPUTED from designed volumes + one decided view; the design decisions below are the
// actual inputs the construction reads (traced), not annotations.
import { author } from "../../../engine/authoring/construct.mjs";

const lens = (w, h) => [[-w, 0], [-w * 0.55, -h * 0.85], [0, -h], [w * 0.55, -h * 0.85], [w, 0], [w * 0.55, h * 0.75], [0, h * 0.85], [-w * 0.55, h * 0.75]];
const circle = (r, n = 10, dx = 0, dy = 0) => Array.from({ length: n }, (_, i) => [dx + Math.cos((i / n) * 2 * Math.PI) * r, dy + Math.sin((i / n) * 2 * Math.PI) * r]);

export function warden({ ctx, id = "warden", prefix, place = [600, 860], view = { yaw: 38, pitch: -3 }, support = "#2c5560", headPx = 210, pose = {}, hands = "grip" } = {}) {
  const cx = { kind: "character", family: "HUMAN_ACTING_CLOSE", subject_id: "warden", view: "form", projection: "FORM_VIEW", world_class: "NONE", headPx, faceVisible: true,
    hasContact: true, moves: true, changesState: true, hasOptics: true, facialHair: true, support_value: "dark", world_value: "dark", prefix: prefix || id + "-",
    transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, hasRepeats: true, flowPath: false, hasEmission: false };
  const A = author(id, cx, ctx);
  A.witness(["F05", "F52", "F64", "F65"], "character_native_anchors/MEMORIES_0753_clinic_humans.jpg", "question_native_witnesses/AI_0285_machine_actor_interior.jpg",
    "clinic 3/4 heads: one skull volume, face plane turning with the head, near eye larger / far eye foreshortened, ear on the far contour, glasses as rims over the eye regions. AI@285 (unlike) small rear actor: no sclera.");
  A.witness(["F05", "F65"], "character_native_anchors/NUCLEAR_0083_farm_humans.jpg", "conditional_native_anchors/MEMORIES_10101_close_human.jpg",
    "moustache = darkest face mass with mouth below; close human: lid-cut sclera, large dark pupil, hair as 2–3 contiguous lobes, two-tone mitten hands.");
  A.witness(["F06", "F59", "F66", "F30"], "character_native_anchors/BRAIN_0386_runner_human.jpg", "question_native_witnesses/NUCLEAR_0145_lab_procedural_people.jpg",
    "limbs as large tapered masses continuous with their garments; sleeves overlap the next segment; hands sized large; lab coats raised above a dark support.");

  // ---------------- DESIGN (structured; read by the construction) ----------------
  A.decide("view", view, { by: ["F30", "F60", "F64"], why: "three-quarter toward the wheel so the face and both hands read" });
  A.decide("projection.basis", "one orthographic view rotation for every mass and surface feature", { by: ["F60"] });
  A.decide("identity.family", "HUMAN_ACTING_CLOSE", { by: ["F64"] });
  A.decide("identity.canonical", { traits: ["bald dome + curled grey fringe low round the back", "brush moustache", "round copper spectacles", "rounded back hump + belly", "mustard knit vest, rolled teal sleeves"] }, { by: ["F64", "F30"] });
  A.decide("form.head", { cranium: [88, 94, 86], jaw: [72, 56, 66], jawAt: [0, -40, 16], nose: [20, 18, 21], noseAt: [0, -70, 84], ear: [12, 24, 15], earAt: [86, -68, -8] }, { by: ["F05", "F58", "F64"] });
  A.decide("form.body", { torso: [104, 142, 80], torsoAt: [0, -158, 2], torsoTaper: [0.2, 0.34], hump: [80, 58, 56], humpAt: [0, -246, -34], shoulderX: 86, shoulderY: -262, pelvis: [104, 58, 78], vestE: [0.62, 0.78] }, { by: ["F58", "F66", "F64"] });
  A.decide("form.arm", { upper: 118, fore: 108, sleeve: [33, 64, 33], cuff: [30, 15, 30], forearm: [23, 56, 23], palm: [30, 28, 16], finger: [8, 19, 8], shoulder: [36, 32, 36] }, { by: ["F66", "F06"] });
  A.decide("form.hair", { lobe: [30, 27, 26], ring: [[-6, 96], [-22, 118], [4, 136], [-14, 158], [-6, 180], [-14, 202], [4, 224], [-22, 242], [-6, 264]] }, { by: ["F05", "F52"], why: "fringe lobes on the cranium surface from ear to ear round the back; crown bald" });
  A.decide("form.headContour", [
    [0, [[0, -176, 1], [52, -168, 1], [84, -132, 1], [92, -88, 1], [96, -48, 1], [80, -8, 1], [42, 14, 1], [0, 22, 1], [-42, 14, 1], [-80, -8, 1], [-96, -48, 1], [-92, -88, 1], [-84, -132, 1], [-52, -168, 1]]],
    [40, [[8, -176, 1], [66, -160, 1], [94, -114, 1], [94, -92, 0.7], [102, -54, 1], [90, -10, 1], [54, 14, 1], [12, 22, 1], [-34, 14, 1], [-66, -6, 1], [-88, -40, 1], [-100, -88, 1], [-88, -136, 1], [-50, -168, 1]]],
    [85, [[-6, -176, 1], [54, -162, 1], [88, -118, 1], [84, -96, 0.5], [92, -60, 1], [84, -16, 1], [62, 12, 1], [28, 22, 1], [-16, 14, 1], [-52, -4, 1], [-86, -34, 1], [-104, -84, 1], [-92, -134, 1], [-52, -168, 1]]],
  ], { by: ["F01", "F05", "F58", "F64", "F30"], why: "broad jowly lower face, dome flatter behind, brow ridge + socket dip in profile, tucked chin — designed per view, landmarks homologous (index 2 brow, 4 cheek, 6 chin, 10 nape)" });
  A.decide("face.headPx", headPx, { by: ["F65", "F52"] });
  A.decide("face.eyeMode", headPx >= 150 ? "WHITE_SCLERA_ACTOR" : headPx >= 60 ? "DARK_MARK_ACTOR" : "REDUCED_ICON", { by: ["F65", "F52"] });
  A.decide("face.roleBySize", headPx >= 150 ? "ACTING_CUE" : "SILHOUETTE_IDENTITY", { by: ["F52"] });
  A.decide("face.frame", { eyes: [2, 29], brows: [18, 29], mouth: [-14, 0], glassesLift: 10 }, { by: ["F65", "F05"], why: "(lat, lon) anchors on the cranium/jaw surfaces" });
  A.decide("face.facialHair", { kind: "brush moustache", masses: 2 }, { by: ["F05"] });
  A.decide("palette.skin", "#d98a5c", { by: ["F03"] });
  A.decide("palette.facialHair", "#cfcad8", { by: ["F03"], why: "starts from the grey hair identity; the Q04 lesson rule separates it by value" });
  A.decide("palette.support", support, { by: ["F03", "F61"] });
  A.decide("palette.garment.trousers", "#272b4a", { by: ["F03"] });
  A.decide("palette.garmentLift", "#7a84c4", { by: ["F61"] });
  A.decide("palette.roles", { skinS: "#b5683f", skinL: "#eaa77a", hair: "#d5d0dc", hairS: "#aaa3b6", knit: "#e3a63a", knitS: "#b77a1f", knitL: "#f3c75e", shirt: "#3f80b6", shirtS: "#2c5d8c", shirtL: "#6aa5d6", rim: "#7a3326", eye: "#fff6ea", pupil: "#2a1830", mouth: "#6a2430", cheek: "#e0705a" }, { by: ["F03", "F51", "F61"] });
  A.decide("palette.focalPair", "mustard vest + warm head vs cool teal room", { by: ["F03"] });
  A.decide("palette.pairs", [["knit", "support"], ["skin", "hair"], ["shirt", "knit"]], { by: ["F61"] });
  A.decide("lighting.system", "OPAQUE_FORM: each material group = flat shade fill + lit copy offset toward the scene light (k per material) + optional light plane; no gradients", { by: ["F04"] });
  A.decide("materials", ["skin", "hair", "knit", "cotton", "denim-ish trousers", "glass rims"], { by: ["F02", "F46"] });
  A.decide("edges", { all: "COLOR_ADJACENCY between material groups", glasses: "OPTICAL_RIM stroke", ribs: "INTERNAL_CREASE" }, { by: ["F62"] });
  A.decide("optics", "spectacle rims lifted off the face surface; hidden when that eye turns away", { by: ["F13", "F63"] });
  A.decide("silhouette.view", "computed from view", { by: ["F01"] });
  A.decide("silhouette.outer", "dome → nose bulb → moustache → belly curve; hump of the back; arms reaching forward", { by: ["F01", "F58"] });
  A.decide("silhouette.identityFeatures", ["bald dome vs fringe ring", "moustache", "rims", "belly/hump"], { by: ["F01"] });
  A.decide("silhouette.voids", ["between forearms and belly", "under the chin"], { by: ["F58"] });
  A.decide("silhouette.smallRead", "dome + belly + reaching arms at 160×90", { by: ["F58"] });
  A.decide("head.skull", "cranium + jaw volumes, jaw tucked toward the collar", { by: ["F05"] });
  A.decide("head.hairMass", "9 lobes on the cranium surface ring", { by: ["F05"] });
  A.decide("head.facePlane", "face is the cranium/jaw front; features live on those surfaces", { by: ["F05"] });
  A.decide("head.eyeSystem", "sclera lens + clipped pupil + lid on the cranium surface at ±27° lon", { by: ["F05", "F65"] });
  A.decide("head.expressionStates", ["neutral", "effort", "pleased"], { by: ["F05", "F67"] });
  A.decide("body.gesture", "weight forward into the wheel", { by: ["F06", "F66"] });
  A.decide("body.support", "standing; pelvis is the root", { by: ["F06", "F66"] });
  A.decide("body.garments", ["vest = belly+chest+hump union with ribs and buttons", "shirt = shoulder caps + sleeves + collar", "rolled cuffs overlap the forearm"], { by: ["F66"] });
  A.decide("contacts", [{ hand: "R", prop: "wheel rim", front: "finger band", back: "palm" }, { hand: "L", prop: "wheel rim", front: "finger band", back: "palm" }], { by: ["F06", "F59"] });
  A.decide("parts", "root→torso→(neck→head), torso→shoulders→elbows→wrists→hands; pelvis→legs", { by: ["F59"] });
  A.decide("states", { hands: ["open", "grip"], face: ["neutral", "effort", "pleased"] }, { by: ["F14", "F30", "F67"] });
  A.decide("landmarks", ["eye anchors", "mouth anchor", "shoulder joints", "wrists"], { by: ["F67"] });
  A.decide("identity.views", "any yaw from the same construction (verified by multi-view sheet)", { by: ["F30"] });
  A.decide("motion.owners", { body: "form joints", arms: "3D IK", face: "surface feature states" }, { by: ["F15"] });
  A.decide("motion.keys", ["reach", "grip", "turn", "react"], { by: ["F31"] });
  A.decide("layers.underpaint", "every visible region is a whole volume; nothing is a cut-out with a hole", { by: ["F79"] });
  A.decide("repeats.parent", { ribs: "vest surface meridians", buttons: "belly front" }, { by: ["F54", "F76"] });
  A.decide("detail.owner", "focal_expression + focal_structural hands", { by: ["F33"] });
  A.decide("detail.tiers", { T0: "volumes", T1: "garment groups", T2: "face features, ribs, buttons, rims" }, { by: ["F47", "F53"] });
  A.decide("medium", "vector flat fills computed from form", { by: ["F19"] });
  A.learn();   // lessons rewrite matching decisions BEFORE any volume is built
  const C = new Proxy({}, { get: (_, k) => A.get("palette.roles")[k] }); // every C.x read is traced at its use site
  const SK = () => A.get("palette.skin"), FHc = () => A.get("palette.facialHair"), TRc = () => A.get("palette.garment.trousers");
  A.palette([["knit", A.get("palette.support"), 2.2], [SK(), "hair", 1.25], ["shirt", "knit", 1.4], [FHc(), SK(), 2.2]], { by: ["F03", "F51", "F61"], roles: Object.assign({ skin: SK() }, A.get("palette.roles")) });

  // ---------------- CONSTRUCTION (all contours computed) ----------------
  const H = A.get("form.head"), Bd = A.get("form.body"), Ar = A.get("form.arm"), Hr = A.get("form.hair"), Ff = A.get("face.frame"), eyeMode = A.get("face.eyeMode");
  A.formView("view", { by: ["F60", "F30"] });
  A.fjoint("root").fjoint("torso", { parent: "root", at: [0, -10, 0], lag: 0.04 }).fjoint("neck", { parent: "torso", at: [4, -300, 8] }).fjoint("head", { parent: "neck", at: [0, -30, 6] })
    .fjoint("legs", { parent: "root" });
  for (const [s, sx] of [["R", -1], ["L", 1]]) A.fjoint("sh" + s, { parent: "torso", at: [sx * Bd.shoulderX, Bd.shoulderY, -2], rest: [0, 0, sx * -8], lag: 0.07 }).fjoint("el" + s, { parent: "sh" + s, at: [0, Ar.upper, 0], rest: [0, 18, 0], lag: 0.1 }).fjoint("wr" + s, { parent: "el" + s, at: [0, Ar.fore, 0], lag: 0.12 });

  A.group("trousers", { fill: TRc(), shade: TRc(), k: 0, by: ["F02", "F03", "F46"], uses: ["palette.garment.trousers"] });
  A.mass("pelvis", { joint: "root", group: "trousers", at: [0, 8, 4], r: Bd.pelvis, e: [0.8, 0.9], by: ["F58", "F66"] });
  for (const sx of [-1, 1]) A.mass("thigh" + sx, { joint: "legs", group: "trousers", at: [sx * 42, 150, 0], r: [48, 130, 48], e: [0.9, 1], by: ["F58", "F66"] });

  A.group("vest", { fill: C.knit, shade: C.knitS, light: C.knitL, kf: 0.24, hkf: 1.25, by: ["F02", "F04", "F46", "F62"] });
  // ONE designed torso volume: taper widens + deepens it toward the bottom = the belly (no stacked pillows)
  A.mass("belly", { joint: "torso", group: "vest", at: Bd.torsoAt, r: Bd.torso, e: Bd.vestE, taper: Bd.torsoTaper, nLat: 14, nLon: 24, by: ["F58", "F01", "F64", "F66"] });
  A.mass("hump", { joint: "torso", group: "vest", at: Bd.humpAt, r: Bd.hump, by: ["F58", "F64"] });
  A.group("shirt", { fill: C.shirt, shade: C.shirtS, k: 8, zb: -4, by: ["F02", "F46"] });
  A.mass("collar", { joint: "torso", group: "shirt", at: [4, -292, 4], r: [36, 12, 30], e: [0.5, 1], zb: -60, by: ["F66", "F59"] });
  A.feature("vneck", { mass: "belly", at: [50, 0], shape: [[-34, -18], [34, -18], [0, 46]], fill: C.shirt, by: ["F66", "F59"], lift: 1 });
  for (let i = 0; i < 9; i++) A.feature("rib" + i, { mass: "belly", at: [0, -72 + i * 18], open: true, shape: [[0, -70], [0, -20], [0, 30], [0, 70]], stroke: C.knitS, sw: 3, op: 0.5, minFacing: 0.2, by: ["F54", "F76", "F62"] });
  for (let i = 0; i < 4; i++) A.feature("button" + i, { mass: "belly", at: [34 - i * 20, 10], shape: circle(5.5, 8), fill: "#7a4a1a", by: ["F54", "F76"], lift: 2 });

  A.group("neck", { fill: SK(), shade: C.skinS, k: 0, zb: -2, by: ["F02"] });
  A.mass("neckM", { joint: "neck", group: "neck", at: [0, -6, 0], r: [30, 26, 28], by: ["F59", "F05"] });
  A.group("head", { fill: SK(), shade: C.skinS, light: C.skinL, kf: 0.2, hkf: 1.1, by: ["F02", "F04", "F46", "F62"] });
  // substrate volumes: carry the eye/brow/rim/mouth surface coordinates; NOT the visible silhouette
  A.mass("cranium", { joint: "head", group: "head", at: [0, -78, 0], r: H.cranium, e: [0.92, 0.95], substrate: true, by: ["F05", "F60"] });
  A.mass("jaw", { joint: "head", group: "head", at: H.jawAt, r: H.jaw, e: [0.9, 1], taper: [-0.18, -0.1], substrate: true, by: ["F05", "F60"] });
  // AUTHORED head silhouette with homologous view keys (front / three-quarter / profile), designed for THIS man
  A.contour("headC", { joint: "head", group: "head", views: A.get("form.headContour"), by: ["F01", "F05", "F58", "F64", "F30"] });
  A.group("nose", { fill: SK(), shade: C.skinS, k: 5, zb: 2, by: ["F02", "F04"] });
  A.mass("noseM", { joint: "head", group: "nose", at: H.noseAt, r: H.nose, by: ["F05", "F58", "F64"] });
  for (const [s, sx] of [["R", -1], ["L", 1]]) { A.group("ear" + s, { fill: C.skinS, shade: "#9c5534", k: 3, by: ["F02"] }); A.mass("earM" + s, { joint: "head", group: "ear" + s, at: [sx * H.earAt[0], H.earAt[1], H.earAt[2]], r: H.ear, by: ["F05", "F59"] }); }
  // hair ring: lobe centres placed ON the cranium surface (read from the cranium design), crown left bald
  const cr = { r: H.cranium, e: [0.92, 0.95] };
  Hr.ring.forEach(([lat, lon], i) => {
    const v = -lat * Math.PI / 180, u = (90 - lon) * Math.PI / 180, spw = (w, e) => Math.sign(w) * Math.abs(w) ** e;
    const p = [cr.r[0] * spw(Math.cos(v), cr.e[0]) * spw(Math.cos(u), cr.e[1]), -78 + cr.r[1] * spw(Math.sin(v), cr.e[0]), cr.r[2] * spw(Math.cos(v), cr.e[0]) * spw(Math.sin(u), cr.e[1])];
    A.group("hair" + i, { fill: i % 2 ? C.hair : "#c8c2d0", shade: C.hairS, k: 5, by: ["F02", "F05"] });
    A.mass("hairM" + i, { joint: "head", group: "hair" + i, at: p, r: Hr.lobe, e: [0.9, 0.9], by: ["F05", "F52", "F58"] });
  });
  A.group("moustache", { fill: FHc(), shade: FHc(), k: 0, zb: 3, by: ["F02", "F03", "F65"], uses: ["palette.facialHair"] });
  for (const sx of [-1, 1]) A.mass("mst" + sx, { joint: "head", group: "moustache", at: [sx * 16, -34, 62], r: [25, 11, 12], rot: [sx * 12, 0, sx * -14], by: ["F05", "F58", "F64"] });
  // face features: surface-anchored → automatically foreshortened, hidden when turned away
  for (const [s, sx] of [["R", -1], ["L", 1]]) {
    const at = [Ff.eyes[0], sx * Ff.eyes[1]];
    if (eyeMode === "WHITE_SCLERA_ACTOR") {
      A.feature("eye" + s, { mass: "cranium", group: "head", at, shape: lens(15, 10), fill: C.eye, by: ["F05", "F65", "F52"], lift: 1.5 });
      A.feature("pup" + s, { mass: "cranium", group: "head", at, shape: circle(7, 10, 2.5, 0.5), fill: C.pupil, clipTo: "eye" + s, by: ["F65"], lift: 2 });
      A.feature("lid" + s, { mass: "cranium", group: "head", at, clipTo: "eye" + s, fill: C.skinS, lift: 2.2, by: ["F65", "F67"],
        shape: [[-19, -16], [19, -16], [19, -5], [9, -8], [0, -9], [-9, -8], [-19, -5]], states: { effort: [[-19, -16], [19, -16], [19, 1], [9, 0], [0, -1], [-9, 0], [-19, 1]], pleased: [[-19, -16], [19, -16], [19, -2], [9, -1], [0, -2], [-9, -1], [-19, -2]] } });
    } else A.feature("eye" + s, { mass: "cranium", group: "head", at, shape: circle(5, 10), fill: C.pupil, by: ["F65"], lift: 1.5 });
    A.feature("brow" + s, { mass: "cranium", group: "head", at: [Ff.brows[0], sx * Ff.brows[1]], fill: C.hairS, lift: 2, by: ["F05", "F65", "F67"],
      shape: [[-14, 2], [-8, -4], [0, -6], [8, -4], [14, 1], [8, 0], [0, -1], [-8, 0]], states: { effort: [[-14, 0], [-8, -2], [0, -2], [8, 0], [14, 5], [8, 4], [0, 3], [-8, 2]], pleased: [[-14, -2], [-8, -9], [0, -11], [8, -9], [14, -3], [8, -4], [0, -6], [-8, -5]] } });
    A.feature("rim" + s, { mass: "cranium", group: "head", at, shape: circle(20, 12), stroke: C.rim, sw: 4.5, lift: Ff.glassesLift, by: ["F13", "F63", "F62"] });
  }
  A.feature("bridge", { mass: "cranium", group: "head", at: [Ff.eyes[0] + 1, 0], open: true, shape: [[-9, 0], [0, -3], [9, 0]], stroke: C.rim, sw: 4, lift: Ff.glassesLift + 1, by: ["F13", "F59"] });
  for (const [s, sx] of [["R", -1], ["L", 1]]) A.feature("temple" + s, { mass: "cranium", group: "head", at: [Ff.eyes[0], sx * 62], open: true, shape: [[sx * -14, 0], [0, 0], [sx * 18, 4]], stroke: C.rim, sw: 4, lift: 3, minFacing: -0.2, by: ["F13", "F59"] });
  A.feature("cheekR", { mass: "jaw", group: "head", at: [12, -34], shape: lens(14, 8), fill: C.cheek, op: 0.45, by: ["F02", "F05"] });
  A.feature("cheekL", { mass: "jaw", group: "head", at: [12, 34], shape: lens(14, 8), fill: C.cheek, op: 0.45, by: ["F02", "F05"] });
  A.feature("mouth", { mass: "jaw", group: "head", at: Ff.mouth, fill: C.mouth, lift: 1, by: ["F05", "F65", "F67"],
    shape: lens(13, 3), states: { effort: [[-13, 0], [-7, -1], [0, -1.2], [7, -1], [13, 0], [7, 1], [0, 1.2], [-7, 1]], pleased: [[-15, -4], [-8, 0], [0, 1], [8, 0], [15, -4], [9, 6], [0, 9], [-9, 6]] } });
  // arms: sleeve + rolled cuff + forearm + hand masses on IK joints; hands: drawn states (open / grip) as alternate MASS sets
  for (const [s, sx] of [["R", -1], ["L", 1]]) {
    const far = sx === 1;
    A.group("sleeve" + s, { fill: far ? C.shirtS : C.shirt, shade: far ? "#24507a" : C.shirtS, kf: 0.3, by: ["F02", "F46", "F66"] });
    A.mass("shoulder" + s, { joint: "sh" + s, group: "sleeve" + s, at: [0, 14, 0], r: Ar.shoulder, by: ["F66", "F58"] });
    A.mass("upper" + s, { joint: "sh" + s, group: "sleeve" + s, at: [0, Ar.upper * 0.48, 0], r: Ar.sleeve, taper: [-0.12, -0.12], by: ["F66", "F58", "F06"] });
    A.group("cuff" + s, { fill: far ? C.shirt : C.shirtL, shade: C.shirtS, k: 4, zb: 2, by: ["F02", "F66"] });
    A.mass("cuffM" + s, { joint: "el" + s, group: "cuff" + s, at: [0, 6, 0], r: Ar.cuff, e: [0.6, 1], by: ["F66", "F59", "F79"] });
    A.group("fore" + s, { fill: far ? C.skinS : SK(), shade: far ? "#9c5534" : C.skinS, kf: 0.3, by: ["F02", "F46"] });
    A.mass("foreM" + s, { joint: "el" + s, group: "fore" + s, at: [0, Ar.fore * 0.52, 0], r: Ar.forearm, taper: [-0.25, -0.25], by: ["F66", "F58"] });
    A.group("palm" + s, { fill: far ? C.skinS : SK(), shade: far ? "#9c5534" : C.skinS, k: 4, zb: 1, by: ["F02", "F06"] });
    A.mass("palmM" + s, { joint: "wr" + s, group: "palm" + s, at: [0, 20, 0], r: Ar.palm, e: [0.55, 0.8], by: ["F06", "F58"] });
    // GRIP state: curled finger band + thumb in a FRONT group (over the rim), palm behind (F59 contact layering)
    A.group("fingers" + s, { fill: far ? C.skinS : C.skinL, shade: far ? "#9c5534" : C.skinS, k: 3, front: true, by: ["F06", "F59"] });
    A.mass("fist" + s, { joint: "wr" + s, group: "fingers" + s, at: [6, 44, 12], r: [30, 16, 18], e: [0.6, 0.9], state: ["hand" + s, 1, hands === "grip"], by: ["F06", "F59", "F30", "F14"] });
    A.mass("thumb" + s, { joint: "wr" + s, group: "fingers" + s, at: [-16, 24, 14], r: [8, 16, 8], rot: [0, 20, 30], state: ["hand" + s, 1, hands === "grip"], by: ["F06", "F59"] });
    for (let k = 0; k < 4; k++) A.mass(`fing${s}${k}`, { joint: "wr" + s, group: "palm" + s, at: [-18 + k * 12, 56, 0], r: Ar.finger, state: ["hand" + s, 0, hands !== "grip"], by: ["F06", "F30"] });
    A.limb("arm" + s, { joints: ["sh" + s, "el" + s, "wr" + s], lengths: [Ar.upper, Ar.fore], pole: [0, 0.6, -1], by: ["F06", "F15", "F31", "F66", "F79"] });
  }
  A.rigBind({ by: ["F15", "F30", "F31", "F66", "F79", "F14"], uses: ["motion.owners", "motion.keys", "states"], channels: ["view.yaw", "head.yaw", "torso.roll", "handR/L", "features"] });
  const out = A.compile({ place, pose });
  out.meta.expr = {
    neutral: { "lidR:effort": 0, "lidL:effort": 0, "lidR:pleased": 0, "lidL:pleased": 0, "browR:effort": 0, "browL:effort": 0, "browR:pleased": 0, "browL:pleased": 0, "mouth:effort": 0, "mouth:pleased": 0 },
    effort: { "lidR:effort": 1, "lidL:effort": 1, "lidR:pleased": 0, "lidL:pleased": 0, "browR:effort": 1, "browL:effort": 1, "browR:pleased": 0, "browL:pleased": 0, "mouth:effort": 1, "mouth:pleased": 0 },
    pleased: { "lidR:effort": 0, "lidL:effort": 0, "lidR:pleased": 1, "lidL:pleased": 1, "browR:effort": 0, "browL:effort": 0, "browR:pleased": 1, "browL:pleased": 1, "mouth:effort": 0, "mouth:pleased": 1 },
  };
  return out;
}
