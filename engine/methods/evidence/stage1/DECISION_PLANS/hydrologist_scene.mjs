// DECISION PLAN — Specimen 1 scene (DIRECTION_REQUIREMENT + ORIGINAL_DESIGN_HYPOTHESIS).
// Causal proof (F57): BEFORE probe lowering, lamp dark / CAUSE probe contacts groundwater at depth / AFTER lamp lit + her reaction.
// World family: LAYERED_SIDE acting world. Source condition (F69/F11): "For acting, let background collapse to two or three broad support
// regions and put active motion in the subject" — BRAIN@334 sparse field is the witness; NUCLEAR@296 dense coastal canopy is the unlike
// case (not used: ecology is not the proof here). Palette situation: quiet_light_field (F03 row 1). Hues are original choices.
const R = (pts, chars) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "smooth" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: (chars?.[i] || ["straight", 0])[0], amount: (chars?.[i] || ["straight", 0])[1] })) });
// Chroma is NOT authored: each role's tier takes its saturation from the measured witness (designPalette). The 3rd argument of M()
// (former typed chroma) is ignored and kept only as a record of the rejected first-pass value.
const TIER = { primary_substrate: "substrate", secondary_support: "support", main_subject: "focal", shadow_anchor: "anchor", material_dark_plane: "plane", material_light_plane: "plane", accent: "accent", active_delta: "emission", optional_emission: "emission" };
const M = (slot, hue, _rejectedChroma, L, owners) => ({ slot, hue, tier: TIER[slot], L, owners });

// revision note: first-pass casing hue 95 merged with the ground (adjacency L 1.01) → cool concrete hue 228 (derived adjacency check)
export const PALETTE = { situation: "quiet_light_field", witness: "BRAIN@334", unlikeWitness: "AI@285", roles: {
  sky: { slot: "primary_substrate", tier: "substrate", hue: 88, owners: ["sky"] }, farField: M("secondary_support", 118, 0.05, 0.8, ["farField"]), ground: M("secondary_support", 80, 0.07, 0.8, ["ground"]), groundShade: M("material_dark_plane", 72, 0.07, 0.66, ["ground"]),
  vest: M("main_subject", 205, 0.085, 0.47, ["vest"]), vestShade: M("material_dark_plane", 215, 0.08, 0.38, ["vest"]),
  shirt: M("main_subject", 38, 0.11, 0.62, ["shirt"]), shirtShade: M("material_dark_plane", 32, 0.1, 0.52, ["shirt"]), shirtFar: M("material_dark_plane", 34, 0.1, 0.5, ["shirt"]),
  trouser: M("shadow_anchor", 268, 0.055, 0.32, ["trousers"]), trouserShade: M("shadow_anchor", 270, 0.05, 0.25, ["trousers"]), trouserFar: M("shadow_anchor", 270, 0.05, 0.24, ["trousers"]),
  boot: M("shadow_anchor", 50, 0.05, 0.3, ["boots"]), bootFar: M("shadow_anchor", 50, 0.04, 0.24, ["boots"]),
  skin: M("main_subject", 48, 0.085, 0.79, ["face", "hands"]), skinShade: M("material_dark_plane", 38, 0.095, 0.69, ["face"]), skinDeep: M("material_dark_plane", 30, 0.09, 0.6, ["face"]),
  hair: M("secondary_support", 250, 0.02, 0.88, ["hair"]), hairShade: M("material_dark_plane", 258, 0.03, 0.72, ["hair"]), brow: M("shadow_anchor", 260, 0.03, 0.48, ["brows"]),
  eyeDark: M("shadow_anchor", 270, 0.06, 0.22, ["eyes"]), sclera: M("material_light_plane", 90, 0.01, 0.97, ["eyes"]), mouth: M("shadow_anchor", 20, 0.1, 0.4, ["mouth"]), cheek: M("accent", 25, 0.11, 0.73, ["face"]),
  casing: M("secondary_support", 228, 0.012, 0.6, ["casing"]), casingTop: M("material_light_plane", 225, 0.01, 0.86, ["casing"]), casingShade: M("material_dark_plane", 232, 0.01, 0.48, ["casing"]), bore: M("shadow_anchor", 260, 0.03, 0.16, ["bore"]),
  tripod: M("accent", 72, 0.13, 0.72, ["tripod"]), tripodShade: M("material_dark_plane", 62, 0.12, 0.58, ["tripod"]),
  reel: M("main_subject", 25, 0.14, 0.52, ["reel"]), reelLight: M("material_light_plane", 30, 0.12, 0.66, ["reel"]), reelDark: M("material_dark_plane", 20, 0.12, 0.36, ["reel"]), hub: M("shadow_anchor", 260, 0.02, 0.3, ["reel"]),
  cable: M("shadow_anchor", 265, 0.03, 0.2, ["cable"]), housing: M("shadow_anchor", 250, 0.03, 0.28, ["indicator"]),
  lampOff: M("material_dark_plane", 150, 0.03, 0.4, ["lamp"]), lampOn: M("active_delta", 150, 0.2, 0.86, ["lamp"]), lampHalo: M("optional_emission", 150, 0.12, 0.92, ["lamp"]),
  core: M("active_delta", 150, 0.2, 0.88, ["lamp"]), halo: M("optional_emission", 150, 0.12, 0.93, ["lamp"]) },
  materials: { ground: { role: "ground", planeStep: 0.1, shadeHueShift: 16, ambientHue: 255 } }, // r8: drift 25 rejected by F03 hue_family once R9 made authored L effective
  pairs: [{ a: "vest", b: "ground", channel: "luminance", min: 2.6, adjust: "vest" }, { a: "hair", b: "skin", channel: "hue", min: 40, adjust: "hair" }, { a: "eyeDark", b: "skin", channel: "luminance", min: 4.5, adjust: "eyeDark" },
    { a: "lampOn", b: "housing", channel: "luminance", min: 4, adjust: "lampOn" }, { a: "reel", b: "sky", channel: "luminance", min: 2.5, adjust: "reel" }, { a: "trouser", b: "ground", channel: "luminance", min: 3.5, adjust: "trouser" }] };

// world graph (LAYERED_SIDE). Coordinates: 1920×1080 frame, ground recedes upward (foot contacts lower = nearer).
export function worldPlan(crankDeg, lampOn, handStackLayer = null) {
  // F55 staging revision (R5): the reel is turned to three-quarter view so the crank handle reads SIDE-ON (axle direction on screen)
  // and the hand can wrap across it; first pass staged it end-on (knob read). Plates are ellipses offset along the axle.
  const reelC = [812, 600], axle = [0.97, 0.24], crankR = 36, a = (crankDeg * Math.PI) / 180;
  const nearC = [reelC[0] + axle[0] * 12, reelC[1] + axle[1] * 12], farC = [reelC[0] - axle[0] * 12, reelC[1] - axle[1] * 12];
  const handleBase = [nearC[0] + 0.42 * crankR * Math.cos(a), nearC[1] + crankR * Math.sin(a)], handleTip = [handleBase[0] + axle[0] * 46, handleBase[1] + axle[1] * 46] /* handle sized to hold a four-finger hand (grip producer refused 34px) */, handle = handleBase;
  return { id: "field", family: "LAYERED_SIDE", purpose: "a borehole in an open dry field where a hand-cranked probe measures the water table", depthOrder: ["sky", "farField", "ground", "casing", "tripodHead", "legBack", "legL", "reelFar", "bracket", "cable", "drum", "reel", "crank", "handle", "housing", "lamp", "legR"], parts: [
    { id: "sky", kind: "region", parent: "substrate", role: "far support", decision: "scene.sky", fillRole: "sky", shape: R([["a", -40, -40], ["b", 1960, -40], ["c", 1960, 640], ["d", -40, 640]]) },
    { id: "farField", kind: "region", parent: "substrate", role: "far support band", decision: "scene.farField", fillRole: "farField", shape: R([["a", -40, 612], ["b", 640, 582], ["c", 1380, 600], ["d", 1960, 574], ["e", 1960, 730], ["f", -40, 730]], [["convex", 0.03], ["sCurve", 0.03], ["convex", 0.02], ["straight", 0], ["straight", 0], ["straight", 0]]) },
    { id: "ground", kind: "region", parent: "substrate", role: "acting support plane", decision: "scene.ground", fillRole: "ground", shape: R([["a", -40, 700], ["b", 900, 690], ["c", 1960, 706], ["d", 1960, 1120], ["e", -40, 1120]], [["convex", 0.01], ["convex", 0.01], ["straight", 0], ["straight", 0], ["straight", 0]]) },
    { id: "casing", kind: "cylinder_upright", parent: "ground", role: "borehole casing (causal receiver)", decision: "scene.casing", base: [760, 884], rx: 46, ry: 13, height: 74, boreRatio: 0.64, fillRole: "casing", topRole: "casingTop", boreRole: "bore" },
    { id: "tripodHead", kind: "disc", parent: "ground", role: "tripod apex + pulley", decision: "scene.tripod", center: [760, 452], rx: 15, ry: 15, rotDeg: 0, fillRole: "tripodShade", hubRatio: 0.45, hubRole: "hub", portAngles: [270, 0] },
    { id: "legBack", kind: "bar", parent: "tripodHead", role: "tripod leg (far)", decision: "scene.tripod", from: "tripodHead.center", to: [792, 846], widths: [9, 7], fillRole: "tripodShade" },
    { id: "legL", kind: "bar", parent: "tripodHead", role: "tripod leg (left)", decision: "scene.tripod", from: "tripodHead.center", to: [610, 904], widths: [10, 8], fillRole: "tripod" },
    { id: "reelFar", kind: "disc", parent: "tripodHead", role: "reel far side plate", decision: "scene.reel", center: farC, rx: 20, ry: 46, rotDeg: 0, fillRole: "reelDark" },
    { id: "drum", kind: "bar", parent: "reelFar", role: "cable drum between the plates", decision: "scene.reel", from: "reelFar.center", to: nearC, widths: [64, 64], fillRole: "cable" },
    { id: "bracket", kind: "bar", parent: "reelFar", role: "reel mount clamped to the near leg", decision: "scene.reel", from: "reelFar.center", to: [846, 664], widths: [8, 8], fillRole: "tripodShade" },
    { id: "cable", kind: "connector", parent: "reelFar", role: "measuring cable (reel → pulley → bore)", decision: "scene.cable", fromPort: "reelFar.center", toPort: "casing.mouth", via: ["tripodHead.rim270"], width: 3, fillRole: "cable" },
    { id: "reel", kind: "disc", parent: "drum", role: "reel near side plate (input wheel)", decision: "scene.reel", center: nearC, rx: 20, ry: 46, rotDeg: 0, fillRole: "reel", hubRatio: 0.3, hubRole: "hub", portAngles: [] },
    { id: "crank", kind: "bar", parent: "reel", role: "crank arm (operator input)", decision: "scene.crank", from: "reel.center", to: handleBase, widths: [9, 7], fillRole: "hub" },
    { id: "handle", kind: "bar", parent: "crank", role: "crank handle (side-on capsule, gripped)", decision: "scene.crank", from: "crank.b", to: handleTip, widths: [12, 12], fillRole: "hub", ...(handStackLayer !== null ? { layerAbs: handStackLayer } : {}) },
    { id: "housing", kind: "region", parent: "reel", role: "indicator housing bolted to the reel plate", decision: "scene.indicator", fillRole: "housing", shape: R([["a", 812, 628, "corner"], ["b", 842, 625, "corner"], ["c", 846, 652, "corner"], ["d", 816, 655, "corner"]]) },
    { id: "lamp", kind: "disc", parent: "housing", role: "probe indicator lamp (causal state)", decision: "scene.indicator", center: [829, 640], rx: 7, ry: 7, rotDeg: 0, fillRole: lampOn ? "lampOn" : "lampOff" },
    { id: "legR", kind: "bar", parent: "tripodHead", role: "tripod leg (near, carries the reel)", decision: "scene.tripod", from: "tripodHead.center", to: [918, 912], widths: [11, 9], fillRole: "tripod" },
  ], crank: { center: nearC, radius: crankR, handle, handleTip } };
}
// figure placement and pose (pelvis + lean authored; near-hand IK target is DERIVED from the seated grip on the crank handle)
export const FIGURE = { rootAt: [1010, 640], view: "three_quarter_left", rot: { chest: -14, neck: 6, head: -8, kneeN: 22, ankleN: -32, toeN: 10, kneeF: -14, ankleF: 12, toeF: -4 }, farHandTarget: [1046, 612] };

// explicit adjacency exemptions (decisions with reasons; everything else must contrast)
export const ADJACENCY_ALLOW = [{ a: /field\.casing\.bore/, b: /field\.cable/, why: "the dark cable visibly enters the dark bore: continuity into the hole is the intended read" }];
