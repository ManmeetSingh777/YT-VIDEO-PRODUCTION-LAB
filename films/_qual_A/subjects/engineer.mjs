// ENGINEER — original qualification subject (not Film 001 content, not derived from the keeper).
// An elderly hydro engineer: bald crown with a grey curled fringe, bushy moustache, round spectacles, broad rounded
// back and belly, mustard knit vest over a rolled-sleeve shirt. Three-quarter view facing right, medium shot
// (hips-up), gripping a valve wheel with both hands.
// Construction order follows CHARACTER_FAMILY_CONSTRUCTOR A–E + F05/F58/F59/F62/F64–F67; every region is authored here.
import { author } from "../../../engine/authoring/construct.mjs";

export function engineer({ ctx, x = 600, y = 830, prefix = "eng-", headPx = 210, support = "#2c5560" } = {}) {
  const cx = { kind: "character", family: "HUMAN_ACTING_CLOSE", projection: "FLAT", world_class: "NONE", subject_id: "engineer", view: "three_quarter_right", headPx, faceVisible: true, hasContact: true, moves: true, changesState: true, hasOptics: true, prefix, support_value: "dark", world_value: "dark", transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, hasRepeats: true, flowPath: false, hasEmission: false };
  const A = author("engineer", cx, ctx);

  // ---------- 1. source evidence inspected BEFORE design (style only, never content) ----------
  A.witness(["F05", "F52", "F64", "F65"], "character_native_anchors/MEMORIES_0753_clinic_humans.jpg", "question_native_witnesses/AI_0285_machine_actor_interior.jpg",
    "clinic: hair as 2–3 contiguous lobes over a flat face plane; separate ear with darker inner C; cheek patch; lid-cut white sclera + big pupil; glasses = coloured rims over the eye regions. AI@285 (unlike: small rear actor) uses a dark eye mark, no sclera — sclera is a scale/role decision, not a default.");
  A.witness(["F06", "F59", "F66"], "conditional_native_anchors/MEMORIES_10101_close_human.jpg", "question_native_witnesses/NUCLEAR_0145_lab_procedural_people.jpg",
    "close human: big two-tone mitten hands (darker back, lighter thumb), large flat garment masses, sleeve seams hidden under cuffs; lab: hands in contact with tools, coats raised above a dark support.");
  A.witness(["F02", "F46", "F62"], "character_native_anchors/BRAIN_0386_runner_human.jpg", "conditional_native_anchors/SOLAR_04897_suited_figures.jpg",
    "no outlines: forms separated by adjacent fills; local planes few and large; dark world keeps figures above the support value.");

  // ---------- 2. design decisions (subject-specific; each names the method knowledge that produced it) ----------
  A.decide("identity.family", "HUMAN_ACTING_CLOSE", { by: ["F64"], why: "face reaction + two-hand valve grip are the action; medium shot" });
  A.decide("identity.canonical", { traits: ["bald crown with curled grey fringe behind the ear", "bushy moustache hiding upper lip", "round copper spectacles", "broad rounded back + belly", "mustard knit vest over rolled teal sleeves"] }, { by: ["F64", "F30"] });
  A.decide("silhouette.view", "three_quarter_right", { by: ["F01"] });
  A.decide("silhouette.outer", "rounded hump of the back → bald dome → nose bulb → moustache → belly curve; arms reach forward to the wheel", { by: ["F01", "F58"] });
  A.decide("silhouette.identityFeatures", ["bald dome vs fringe lobes", "moustache brush", "spectacle rims", "belly curve"], { by: ["F01"] });
  A.decide("silhouette.voids", ["gap between the two forearms around the wheel", "space under chin above vest V"], { by: ["F58"] });
  A.decide("silhouette.smallRead", "at 160×90 the dome + moustache + vest block must still read as an old man at a wheel", { by: ["F58"] });
  A.decide("face.headPx", headPx, { by: ["F65", "F52"] });
  A.decide("face.eyeMode", headPx >= 150 ? "WHITE_SCLERA_ACTOR" : headPx >= 60 ? "DARK_MARK_ACTOR" : "REDUCED_ICON",
    { by: ["F65", "F52"], why: `head ${headPx}px: gaze toward the wheel/lamp must read; MEMORIES@753 sclera at this scale; AI@285 dark mark at small scale` });
  A.decide("face.roleBySize", headPx >= 150 ? "ACTING_CUE" : "SILHOUETTE_IDENTITY", { by: ["F52"] });
  A.decide("face.frame", { eyeLine: -104, median: 58, nose: [118, -72], mouth: [98, -26] }, { by: ["F65", "F05"] });
  A.decide("head.skull", "bald dome, forehead slope to brow, jaw tucked into collar", { by: ["F05"] });
  A.decide("head.hairMass", "fringe of 5 curled lobes from temple round the back of the skull; no strands", { by: ["F05", "F52"] });
  A.decide("head.facePlane", "one warm skin plane, ear on the far contour, cheek patch, nose bulb crossing the contour", { by: ["F05"] });
  A.decide("head.eyeSystem", "near eye larger, far eye narrower; lid line cuts each sclera; pupils clipped to sclera; spectacle rims over both", { by: ["F05", "F65"] });
  A.decide("head.expressionStates", ["neutral", "effort", "pleased"], { by: ["F05", "F67"] });
  A.decide("body.gesture", "weight forward over the wheel, shoulders rounded, elbows bent", { by: ["F06", "F66"] });
  A.decide("body.support", "standing; feet off-frame; pelvis is the root, torso leans into the turn", { by: ["F06", "F66"] });
  A.decide("body.garments", ["knit vest: back/belly planes + rib repeats + button seam", "shirt: shoulder caps, rolled cuff over each elbow seam", "trouser top under belt"], { by: ["F66"] });
  A.decide("contacts", [{ hand: "handN", prop: "wheel.rim", front: "fingers", back: "palm" }, { hand: "handF", prop: "wheel.rim", front: "fingers", back: "palm" }], { by: ["F06", "F59"] });
  A.decide("parts", "root→torso→neck→head→face; torso→upperN/upperF→fore→hand; vest over shirt; far arm behind torso", { by: ["F59"] });
  A.decide("states", { hands: ["open", "grip"], face: ["neutral", "effort", "pleased"] }, { by: ["F14", "F30", "F67"] });
  A.decide("landmarks", ["eyeLine", "nose tip", "mouth corner", "shoulder cap", "elbow cuff", "grip point"], { by: ["F67"] });
  A.decide("motion.owners", { body: "SUBJECT_PART (rig)", face: "REDRAWN_STATE + deform", hands: "REDRAWN_STATE" }, { by: ["F15"] });
  A.decide("motion.keys", ["reach", "grip", "turn", "release", "react"], { by: ["F31"] });
  A.decide("layers.underpaint", "shirt is complete under the vest; arm segments overlap at cuffs so rotations never open a gap", { by: ["F79"] });
  A.decide("materials", ["skin", "hair", "knit", "cotton", "glass", "metal-rim"], { by: ["F02", "F46"] });
  A.decide("lighting.system", "OPAQUE_FORM: hard authored planes; key = warm wall lamp upper-right, fill = cool room", { by: ["F04"] });
  A.decide("edges", { skin: "COLOR_ADJACENCY", vest: "MATERIAL_SEAM at button band", glasses: "OPTICAL_RIM", knit: "INTERNAL_CREASE ribs" }, { by: ["F62"] });
  A.decide("optics", "spectacle lenses: rim + clipped glint only; no tint over the eyes", { by: ["F13", "F63"] });
  A.decide("detail.owner", "focal_expression (face) + focal_structural (hands on rim)", { by: ["F33"] });
  A.decide("detail.tiers", { T0: "body mass + head", T1: "vest, arms, face", T2: "ribs, buttons, glasses, cuffs", T3: "glints" }, { by: ["F47", "F53"] });
  A.decide("medium", "vector, hard-edged fills", { by: ["F19"] });
  A.decide("repeats.parent", { ribs: "vest face (vertical, follow the belly curve)", buttons: "vest front seam" }, { by: ["F54", "F76"] });
  A.decide("palette.support", support, { by: ["F03", "F61"] });
  A.decide("palette.roles", { skin: "#d98a5c", skinS: "#b5683f", skinL: "#eaa77a", cheek: "#e0705a", hair: "#d5d0dc", hairS: "#a7a0b4", knit: "#e3a63a", knitS: "#b77a1f", knitL: "#f3c75e", shirt: "#3f80b6", shirtS: "#2c5d8c", shirtL: "#6aa5d6", rim: "#7a3326", eye: "#fff6ea", pupil: "#2a1830", mouth: "#6a2430" }, { by: ["F03", "F51", "F61"] });
  A.decide("palette.focalPair", "mustard vest/warm face vs cool teal wall: hue + luminance separation", { by: ["F03"] });
  A.decide("palette.pairs", [["vest", "wall", "hue+luma"], ["face", "hair", "luma"], ["sleeve", "vest", "hue"]], { by: ["F61"] });
  A.decide("face.facialHair", { kind: "brush moustache", coversMouth: true }, { by: ["F05", "F52"] });
  A.decide("palette.facialHair", "#d5d0dc", { by: ["F03"], why: "grey hair identity" });
  // Q04 repair (producing op): facial hair over the mouth must separate by VALUE from the face plane
  A.separateFrom("palette.facialHair", "#d98a5c", 2.2, "#4a4458", { by: ["F03", "F61", "F65"], uses: ["face.facialHair"] });
  A.decide("face.mouthPlacement", "separate dark mouth shape below the moustache with a skin gap (Q04)", { by: ["F65", "F05"], uses: [] });
  A.decide("palette.garment.trousers", "#272b4a", { by: ["F03"], why: "dark trousers anchor under the belt" });
  A.decide("palette.garmentLift", "#6f78b8", { by: ["F61"] });
  A.palette([["knit", support, 2.2, "hue+luma"], ["skin", "hair", 1.25, "luma"], ["shirt", "knit", 1.4, "hue"], ["skin", support, 2.5, "luma"]], { by: ["F03", "F51", "F61"], uses: ["palette.roles", "palette.pairs", "palette.support"] });
  A.learn(); // matching lessons rewrite decisions HERE, before any geometry exists
  const FH = A.get("palette.facialHair"), C = A.get("palette.roles"), trousers = A.get("palette.garment.trousers"), eyeMode = A.get("face.eyeMode");

  // ---------- 3. parts (parent-child anatomy) ----------
  A.part("root").part("hips", { parent: "root" })
    .part("torso", { parent: "hips", at: [0, -4], lag: 0.04, z: 2 })
    .part("upperF", { parent: "torso", at: [-62, -282], z: -5, lag: 0.07 }).part("foreF", { parent: "upperF", at: [0, 120], lag: 0.1 }).part("handF", { parent: "foreF", at: [0, 112], lag: 0.12 })
    .part("neck", { parent: "torso", at: [18, -300], z: 1 }).part("head", { parent: "neck", at: [4, -34] })
    .part("face", { parent: "head", at: [0, 0], z: 3 })
    .part("upperN", { parent: "torso", at: [74, -272], z: 6, lag: 0.07 }).part("foreN", { parent: "upperN", at: [0, 120], lag: 0.1 }).part("handN", { parent: "foreN", at: [0, 112], lag: 0.12 });
  A.socket("gripN", "handN", [2, 26]).socket("gripF", "handF", [2, 26]);

  // ---------- 4. torso: shirt underpaint, vest, trousers (F58 silhouette, F02/F46 materials, F62 edges, F54/F76 ribs) ----------
  A.region("trousers", { part: "hips", z: -1, fill: trousers, by: ["F58", "F02"], uses: ["palette.garment.trousers"],
    path: "M-104,8 C-60,0 60,0 120,10 C126,80 128,180 126,320 L-106,320 C-110,180 -110,60 -104,8 Z" });
  A.region("shirt", { part: "torso", z: 0, fill: C.shirt, by: ["F58", "F59", "F79"], uses: ["layers.underpaint", "palette.roles"],
    path: "M-108,-290 C-104,-318 40,-336 86,-302 C104,-284 116,-240 120,-200 L-118,-200 C-120,-240 -118,-268 -108,-290 Z" });
  A.region("collarB", { part: "torso", z: 0.2, fill: C.shirtS, by: ["F59"], uses: ["parts"], path: "M-6,-318 C8,-332 34,-334 44,-320 L36,-300 C20,-310 6,-310 -2,-300 Z" });
  A.region("vest", { part: "torso", z: 1, fill: C.knit, by: ["F58", "F01", "F02", "F46", "F64"], uses: ["silhouette.outer", "palette.roles"],
    path: "M-98,-296 C-126,-256 -134,-158 -124,-62 C-118,-18 -106,10 -96,26 L116,30 C138,-12 148,-84 136,-152 C128,-204 104,-254 80,-284 L54,-200 L20,-298 C-20,-306 -62,-308 -98,-296 Z" });
  A.patch("vestBack", "vest", { fill: C.knitS, by: ["F02", "F04", "F46"], uses: ["lighting.system"],
    path: "M-140,-320 L-60,-320 C-80,-250 -86,-140 -70,-50 C-64,-10 -56,20 -48,40 L-140,40 Z" });
  A.patch("vestBelly", "vest", { fill: C.knitL, by: ["F02", "F04"], uses: ["lighting.system"],
    path: "M98,-226 C126,-180 138,-108 128,-40 C124,-14 118,8 112,24 L96,24 C112,-30 116,-110 92,-196 Z" });
  A.repeat("ribs", "vest", Array.from({ length: 13 }, (_, i) => -104 + i * 17), (xx) => `<path d="M${xx},-320 C${xx - 4},-200 ${xx - 2},-80 ${xx + 6},40" stroke="${C.knitS}" stroke-width="3" fill="none" opacity=".45"/>`,
    { by: ["F54", "F76", "F62"], uses: ["edges"] });
  A.edge("vestSeam", "vest", { role: "MATERIAL_SEAM", color: C.knitS, w: 5, by: ["F62"], uses: ["edges"], path: "M54,-200 C70,-140 92,-60 112,28" });
  A.repeat("buttons", "vest", [[64, -168], [77, -120], [90, -72], [102, -24]], ([bx, by]) => `<circle cx="${bx}" cy="${by}" r="6" fill="#7a4a1a"/><circle cx="${bx - 1.5}" cy="${by - 1.5}" r="2" fill="#c08a3a"/>`,
    { by: ["F54", "F76"], uses: ["body.garments"] });
  A.region("collarF", { part: "torso", z: 2, fill: C.shirtL, by: ["F59"], uses: ["parts"], path: "M24,-300 C40,-306 60,-300 70,-292 L58,-252 Z" });
  A.region("belt", { part: "torso", z: 1.5, fill: "#3a2418", by: ["F59"], uses: ["parts"], path: "M-98,14 C-40,22 60,24 118,18 L120,36 C60,42 -40,40 -96,32 Z" });

  // ---------- 5. neck + head (F05 order: cranium/hair → face plane → ear/cheek → eyes → brows → nose → moustache → mouth → glasses) ----------
  A.region("neckSkin", { part: "neck", fill: C.skinS, by: ["F05", "F59"], uses: ["head.facePlane"], path: "M-30,10 C-32,-10 -30,-30 -26,-44 L40,-44 C44,-26 46,-6 44,12 Z" });
  A.region("hairBack", { part: "head", z: -1, fill: C.hairS, by: ["F05", "F52"], uses: ["head.hairMass"],
    path: "M-26,-168 C-62,-176 -96,-150 -102,-112 C-114,-100 -112,-78 -100,-70 C-110,-56 -100,-34 -84,-34 C-84,-18 -66,-10 -52,-16 C-64,-50 -66,-96 -54,-130 C-46,-150 -36,-162 -26,-168 Z" });
  A.region("skull", { part: "head", z: 0, fill: C.skin, by: ["F05", "F58", "F01", "F64"], uses: ["head.skull", "head.facePlane", "silhouette.outer"],
    path: "M-72,-70 C-92,-120 -76,-190 -20,-208 C20,-220 76,-210 100,-176 C116,-152 120,-126 114,-100 C112,-86 116,-74 118,-58 C120,-40 112,-20 96,-6 C80,8 52,12 26,10 C-4,8 -32,-4 -50,-22 C-62,-36 -68,-52 -72,-70 Z" });
  A.patch("domeLight", "skull", { fill: C.skinL, by: ["F04", "F02"], uses: ["lighting.system"], path: "M10,-206 C50,-214 88,-196 104,-168 C90,-176 60,-184 30,-182 C14,-182 4,-190 10,-206 Z" });
  A.patch("jawShade", "skull", { fill: C.skinS, by: ["F04", "F02"], uses: ["lighting.system"], path: "M-80,-110 C-74,-60 -50,-22 -4,-4 C30,8 60,6 86,-2 C60,26 0,28 -60,0 C-90,-30 -96,-80 -80,-110 Z" });
  A.attach("ear", "skull", { part: "head", z: 0.5, fill: C.skinS, by: ["F05"], uses: ["head.facePlane"], path: "M-56,-118 C-84,-126 -98,-98 -92,-74 C-88,-56 -72,-50 -58,-60 C-50,-80 -50,-100 -56,-118 Z" });
  A.patch("earIn", "ear", { fill: "#94512f", by: ["F05", "F02"], uses: ["head.facePlane"], path: "M-62,-108 C-80,-110 -86,-90 -80,-76 C-76,-70 -70,-70 -66,-74 C-74,-84 -72,-98 -62,-108 Z" });
  A.attach("hairFringe", "skull", { part: "head", z: 1, fill: C.hair, by: ["F05", "F52"], uses: ["head.hairMass", "silhouette.identityFeatures"],
    path: "M-30,-160 C-56,-160 -76,-140 -80,-120 C-94,-116 -98,-98 -88,-88 C-98,-76 -92,-58 -78,-58 C-80,-60 -70,-74 -66,-90 C-58,-96 -50,-112 -50,-126 C-40,-134 -32,-146 -30,-160 Z" });
  A.patch("hairFringeS", "hairFringe", { fill: C.hairS, by: ["F05", "F02"], uses: ["head.hairMass"], path: "M-100,-100 C-90,-104 -80,-102 -74,-96 C-80,-84 -84,-72 -96,-64 Z" });
  A.region("cheek", { part: "face", z: 0.2, fill: C.cheek, by: ["F05", "F02"], uses: ["head.facePlane"], attrs: 'opacity=".55"', path: "M48,-70 C62,-80 86,-76 92,-62 C90,-50 70,-44 56,-50 C48,-54 44,-62 48,-70 Z" });
  // eyes: WHITE_SCLERA_ACTOR geometry exists only if the F65 decision selected it; otherwise dark marks
  const lidN = "M48,-122 L90,-122 L90,-108 C78,-112 60,-112 48,-106 Z", lidF = "M0,-120 L32,-120 L32,-106 C22,-110 10,-110 0,-104 Z";
  if (eyeMode === "WHITE_SCLERA_ACTOR") {
    A.region("eyeN", { part: "face", z: 1, fill: C.eye, by: ["F05", "F65"], uses: ["face.eyeMode", "head.eyeSystem", "face.frame"], path: "M50,-104 C52,-120 82,-122 88,-104 C84,-92 56,-90 50,-104 Z" });
    A.patch("pupN", "eyeN", { fill: C.pupil, by: ["F65"], uses: ["face.eyeMode"], path: "M64,-106 C64,-114 80,-114 80,-106 C80,-98 64,-98 64,-106 Z" });
    A.patch("lidN", "eyeN", { fill: C.skinS, by: ["F65", "F05"], uses: ["head.eyeSystem"], path: lidN });
    A.region("eyeF", { part: "face", z: 1, fill: C.eye, by: ["F05", "F65"], uses: ["face.eyeMode", "head.eyeSystem"], path: "M2,-102 C4,-116 26,-118 30,-102 C26,-92 6,-92 2,-102 Z" });
    A.patch("pupF", "eyeF", { fill: C.pupil, by: ["F65"], uses: ["face.eyeMode"], path: "M12,-104 C12,-111 25,-111 25,-104 C25,-97 12,-97 12,-104 Z" });
    A.patch("lidF", "eyeF", { fill: C.skinS, by: ["F65", "F05"], uses: ["head.eyeSystem"], path: lidF });
  } else {
    A.region("eyeN", { part: "face", z: 1, fill: C.pupil, by: ["F65"], uses: ["face.eyeMode"], path: "M62,-106 C62,-115 78,-115 78,-106 C78,-97 62,-97 62,-106 Z" });
    A.region("eyeF", { part: "face", z: 1, fill: C.pupil, by: ["F65"], uses: ["face.eyeMode"], path: "M11,-104 C11,-112 24,-112 24,-104 C24,-96 11,-96 11,-104 Z" });
  }
  A.region("browN", { part: "face", z: 2, fill: C.hair, by: ["F05", "F65"], uses: ["head.expressionStates"], path: "M46,-132 C58,-146 84,-148 96,-134 C86,-136 62,-134 50,-126 Z" });
  A.region("browF", { part: "face", z: 2, fill: C.hairS, by: ["F05"], uses: ["head.expressionStates"], path: "M-2,-128 C6,-140 26,-142 34,-130 C24,-132 10,-130 2,-122 Z" });
  A.attach("nose", "skull", { part: "face", z: 2, fill: C.skin, by: ["F05", "F58"], uses: ["face.frame", "silhouette.identityFeatures"], path: "M104,-96 C126,-96 140,-74 132,-58 C124,-46 104,-48 98,-60 C94,-72 96,-88 104,-96 Z" });
  A.patch("noseS", "nose", { fill: C.skinS, by: ["F04", "F02"], uses: ["lighting.system"], path: "M90,-70 C104,-58 120,-54 136,-60 L136,-40 L90,-40 Z" });
  A.region("mouth", { part: "face", z: 2.5, fill: C.mouth, by: ["F05", "F65", "F67"], uses: ["head.expressionStates", "face.frame", "face.mouthPlacement"], path: "M86,-20 C94,-15 108,-15 118,-21 C110,-9 94,-9 86,-20 Z" });
  A.attach("moustache", "skull", { part: "face", z: 3, fill: FH, by: ["F05", "F58", "F65"], uses: ["silhouette.identityFeatures", "palette.facialHair", "face.facialHair"],
    path: "M68,-50 C80,-62 104,-64 124,-54 C138,-48 142,-36 132,-32 C124,-28 114,-32 104,-36 C92,-30 78,-30 68,-36 C62,-40 62,-46 68,-50 Z" });
  A.patch("moustacheTop", "moustache", { fill: C.hairS, by: ["F02", "F04"], uses: ["head.hairMass"], path: "M60,-70 L146,-70 L146,-52 C120,-58 92,-58 60,-50 Z" });
  // spectacles: optical rims over the eye regions (F13/F63) — glints clipped to lens; no tint
  A.region("lensN", { part: "face", z: 3.2, fill: "#ffffff", by: ["F13", "F63"], uses: ["optics"], attrs: 'fill-opacity="0.06"', path: "M44,-104 C44,-122 56,-130 70,-130 C86,-130 96,-120 96,-104 C96,-88 84,-80 70,-80 C56,-80 44,-88 44,-104 Z" });
  A.patch("glintN", "lensN", { fill: "#ffffff", op: 0.55, by: ["F63"], uses: ["optics"], path: "M76,-128 L94,-128 L66,-80 L48,-80 Z" });
  A.edge("rimN", "lensN", { role: "OPTICAL_RIM", color: C.rim, w: 5, clip: false, by: ["F62", "F13"], uses: ["edges"], path: "M44,-104 C44,-122 56,-130 70,-130 C86,-130 96,-120 96,-104 C96,-88 84,-80 70,-80 C56,-80 44,-88 44,-104 Z" });
  A.region("lensF", { part: "face", z: 3.2, fill: "#ffffff", by: ["F13", "F63"], uses: ["optics"], attrs: 'fill-opacity="0.06"', path: "M-2,-102 C-2,-118 6,-126 16,-126 C28,-126 34,-116 34,-102 C34,-88 26,-80 16,-80 C6,-80 -2,-88 -2,-102 Z" });
  A.edge("rimF", "lensF", { role: "OPTICAL_RIM", color: C.rim, w: 4.5, clip: false, by: ["F62", "F13"], uses: ["edges"], path: "M-2,-102 C-2,-118 6,-126 16,-126 C28,-126 34,-116 34,-102 C34,-88 26,-80 16,-80 C6,-80 -2,-88 -2,-102 Z" });
  A.edge("bridge", "lensN", { role: "OPTICAL_RIM", color: C.rim, w: 4, clip: false, by: ["F62", "F59"], uses: ["edges"], path: "M34,-106 C38,-112 42,-112 44,-106" });
  A.edge("temple", "lensF", { role: "OPTICAL_RIM", color: C.rim, w: 4, clip: false, by: ["F59", "F05"], uses: ["head.eyeSystem"], path: "M-2,-106 C-24,-110 -44,-104 -60,-96" });

  // ---------- 6. arms: rigid segments whose seams hide under authored sleeve/cuff shapes (F66), far arm darker ----------
  for (const [s, k, sh] of [["N", C.shirt, C.shirtS], ["F", C.shirtS, "#24507a"]]) {
    const far = s === "F";
    A.region("sleeve" + s, { part: "upper" + s, fill: k, by: ["F66", "F58", "F59"], uses: ["body.garments", "layers.underpaint"],
      path: "M-34,-8 C-36,-40 30,-42 34,-10 C36,34 30,84 26,126 L-22,126 C-28,84 -34,34 -34,-8 Z" });
    A.patch("sleeveShade" + s, "sleeve" + s, { fill: sh, by: ["F04", "F02"], uses: ["lighting.system"], path: "M-40,-20 L-12,-20 C-18,30 -16,80 -10,130 L-40,130 Z" });
    A.region("forearm" + s, { part: "fore" + s, z: 0, fill: far ? C.skinS : C.skin, by: ["F66", "F02"], uses: ["body.garments"],
      path: "M-21,4 C-24,40 -20,80 -15,112 L17,112 C22,80 25,40 22,4 Z" });
    if (!far) A.patch("foreShade" + s, "forearm" + s, { fill: C.skinS, by: ["F04"], uses: ["lighting.system"], path: "M-30,0 L-8,0 C-10,40 -8,80 -4,120 L-30,120 Z" });
    A.region("cuff" + s, { part: "fore" + s, z: 1, fill: far ? C.shirtS : C.shirtL, by: ["F66", "F59", "F79"], uses: ["body.garments", "layers.underpaint"],
      path: "M-32,-18 C-14,-26 16,-26 34,-18 L32,22 C14,28 -14,28 -32,22 Z" });
    A.patch("cuffFold" + s, "cuff" + s, { fill: far ? "#24507a" : C.shirt, by: ["F02", "F66"], uses: ["body.garments"], path: "M-40,2 C-14,8 16,8 40,2 L40,30 L-40,30 Z" });
    // hands: registered drawn states — OPEN and GRIP (grip = palm behind the rim, fingers + thumb in FRONT layer)
    const skin = far ? C.skinS : C.skin, skinD = far ? "#9c5534" : C.skinS;
    A.region("handOpen" + s, { part: "hand" + s, state: "open" + s, fill: skin, by: ["F06", "F59"], uses: ["contacts", "states"],
      path: "M-18,-4 C-26,10 -28,34 -22,52 C-18,62 -8,64 -2,56 C2,64 12,64 16,54 C22,58 28,50 26,40 C30,30 28,12 22,-2 C10,-10 -8,-10 -18,-4 Z" });
    A.patch("handOpenS" + s, "handOpen" + s, { fill: skinD, by: ["F02"], uses: ["states"], path: "M-30,20 C-18,26 -6,26 4,20 L4,70 L-30,70 Z" });
    A.region("palmGrip" + s, { part: "hand" + s, state: "grip" + s, fill: skinD, by: ["F06", "F59"], uses: ["contacts", "states"],
      path: "M-20,-4 C-28,8 -30,26 -24,38 C-12,44 12,44 22,36 C28,22 26,6 20,-4 C8,-12 -10,-12 -20,-4 Z" });
    A.region("fingersGrip" + s, { part: "hand" + s, state: "grip" + s, layer: "front", fill: skin, by: ["F06", "F59"], uses: ["contacts"],
      path: "M-24,18 C-26,30 -20,42 -8,44 C2,46 18,44 26,38 C34,32 34,20 26,14 C16,18 4,18 -6,16 C-14,14 -20,14 -24,18 Z" });
    A.patch("knuckles" + s, "fingersGrip" + s, { fill: skinD, by: ["F02", "F06"], uses: ["contacts"], path: "M-30,32 C-10,38 10,38 36,30 L36,50 L-30,50 Z" });
    A.region("thumbGrip" + s, { part: "hand" + s, state: "grip" + s, layer: "front", z: 0.5, fill: far ? skin : C.skinL, by: ["F06"], uses: ["contacts"],
      path: "M14,2 C26,4 34,14 32,26 C30,32 22,32 20,26 C18,18 12,12 8,8 Z" });
    A.states("hs" + s, ["open" + s, "grip" + s], { by: ["F14", "F30", "F67", "F06"], uses: ["states", "contacts"] });
    A.contact("grip" + s, { by: ["F59", "F06"], front: ["fingersGrip" + s, "thumbGrip" + s], back: ["palmGrip" + s], prop: "wheel.rim" });
  }
  // ---------- 7. expression states as homologous deforms (F67: same topology, landmarks preserved) ----------
  A.deform("mouth", { effort: "M88,-17 C96,-16 108,-16 116,-18 C108,-13 96,-13 88,-17 Z", pleased: "M82,-24 C92,-2 110,-2 122,-25 C110,-14 94,-14 82,-24 Z" }, { name: "mouth", by: ["F67"] });
  A.deform("browN", { effort: "M46,-128 C58,-136 84,-140 96,-140 C86,-134 62,-128 50,-120 Z", pleased: "M46,-136 C58,-152 84,-154 96,-140 C86,-142 62,-140 50,-132 Z" }, { name: "browN", by: ["F67"] });
  if (eyeMode === "WHITE_SCLERA_ACTOR") {
    A.deform("lidN", { effort: "M48,-122 L90,-122 L90,-100 C78,-104 60,-106 48,-100 Z", pleased: "M48,-122 L90,-122 L90,-104 C78,-106 60,-106 48,-102 Z" }, { name: "lidN", by: ["F67"] });
    A.deform("lidF", { effort: "M0,-120 L32,-120 L32,-99 C22,-103 10,-104 0,-98 Z", pleased: "M0,-120 L32,-120 L32,-102 C22,-104 10,-104 0,-100 Z" }, { name: "lidF", by: ["F67"] });
  }
  A.rigBind({ by: ["F15", "F30", "F31", "F66", "F79"], uses: ["motion.owners", "motion.keys", "layers.underpaint"], channels: ["hsN", "hsF", "mouth", "browN", "lidN", "lidF"] });
  return A.compile({ rig: { place: { x, y }, rest: { handN: 0, handF: 0, upperN: -30, foreN: -60, upperF: -40, foreF: -50, hsN: 1, hsF: 1 },
    expr: {
      neutral: { "mouth:effort": 0, "mouth:pleased": 0, "browN:effort": 0, "browN:pleased": 0, "lidN:effort": 0, "lidN:pleased": 0, "lidF:effort": 0, "lidF:pleased": 0 },
      effort: { "mouth:effort": 1, "mouth:pleased": 0, "browN:effort": 1, "browN:pleased": 0, "lidN:effort": 1, "lidN:pleased": 0, "lidF:effort": 1, "lidF:pleased": 0 },
      pleased: { "mouth:effort": 0, "mouth:pleased": 1, "browN:effort": 0, "browN:pleased": 1, "lidN:effort": 0, "lidN:pleased": 1, "lidF:effort": 0, "lidF:pleased": 1 },
    },
    idle: [["torso.sy", 0.005, 0.28, 0], ["head", 0.6, 0.21, 0.9]],
  } });
}
