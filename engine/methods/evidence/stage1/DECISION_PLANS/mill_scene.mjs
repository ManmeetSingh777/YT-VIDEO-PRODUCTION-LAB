// DECISION PLAN — Specimen 2: original tide-mill machine room (complex non-human world; ORIGINAL_DESIGN_HYPOTHESIS unless marked).
// Causal proof (F57): BEFORE still water, stones idle / CAUSE tide current turns the paddle wheel / AFTER the gear train turns the runner
// stone and flour pours down the chute into the sack. World family OBLIQUE_INTERIOR (F38-B / F60 single basis). Source (style only):
// AI@285 oblique machine interior — top faces lighter, side faces darker, recessed functional parts, bounded light pool; unlike AI@555
// axial perspective corridor (vanishing point) and AI@35 bright oblique city — oblique is chosen because the proof is a connected
// mechanism seen whole, not a corridor of depth. NOT transferred: any computer/desk/city object, palette or layout from those frames.
// revision r1: rescaled/re-centred after the causal-visibility check found the hopper 42% in frame
export const PROJ = { family: "OBLIQUE_TWO_AXES", origin: [1000, 660], u: [0.8, 0.35], v: [-0.8, 0.35], h: [0, -1], light: { dir: [-0.35, -0.55, 0.75] } };
const P = (x, y, z) => [PROJ.origin[0] + x * PROJ.u[0] + y * PROJ.v[0] + z * PROJ.h[0], PROJ.origin[1] + x * PROJ.u[1] + y * PROJ.v[1] + z * PROJ.h[1]];
const R = (pts, chars) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "corner" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: (chars?.[i] || ["straight", 0])[0], amount: (chars?.[i] || ["straight", 0])[1] })) });
const QUAD = (pts3) => R(pts3.map((q, i) => [`q${i}`, ...P(...q)]));
const M = (slot, tier, hue, L, owners) => ({ slot, tier, hue, L, owners });

// r1: floor = stone flags (distinct material family from timber; first-pass adjacency L 1.07)
// r3: floor value lifted (adjacency vs wall L 1.13), iron darkened, chute = tin (merged with timber posts L 1.01)
export const PALETTE = { situation: "dark_field", witness: "AI@285", unlikeWitness: "AI@35", roles: {
  wallStone: M("primary_substrate", "substrate", 222, undefined, ["walls"]), floor: M("secondary_support", "support", 228, 0.5, ["floor"]), platform: M("secondary_support", "support", 38, 0.5, ["platform"]),
  gearWood: M("main_subject", "focal", 62, 0.66, ["gears"]), gearShade: M("material_dark_plane", "plane", 50, 0.44, ["gears"]), iron: M("shadow_anchor", "anchor", 255, 0.16, ["axles"]), chuteTin: M("secondary_support", "support", 205, 0.74, ["chute"]),
  water: M("accent", "accent", 205, 0.62, ["water"]), waterLight: M("material_light_plane", "plane", 195, 0.8, ["water"]),
  stone: M("secondary_support", "support", 268, 0.58, ["stones"]), stoneTop: M("material_light_plane", "plane", 268, 0.72, ["stones"]), stoneShade: M("material_dark_plane", "plane", 270, 0.42, ["stones"]),
  hopper: M("secondary_support", "support", 30, 0.55, ["hopper"]), sack: M("secondary_support", "support", 75, 0.78, ["sack"]), sackShade: M("material_dark_plane", "plane", 65, 0.62, ["sack"]),
  flour: M("active_delta", "emission", 90, 0.95, ["flour"]), windowLight: M("optional_emission", "emission", 85, 0.94, ["window"]), ray: M("optional_emission", "emission", 85, 0.9, ["light"]), exposure: M("optional_emission", "emission", 85, 0.96, ["light"]) },
  pairs: [{ a: "gearWood", b: "wallStone", channel: "luminance", min: 3, adjust: "gearWood" }, { a: "water", b: "floor", channel: "hue", min: 60, adjust: "water" }, { a: "flour", b: "wallStone", channel: "luminance", min: 5, adjust: "flour" }, { a: "iron", b: "gearWood", channel: "luminance", min: 2.5, adjust: "iron" }],
  materials: { wall: { role: "wallStone", planeStep: 0.07, shadeHueShift: 10, ambientHue: 240 }, floor: { role: "floor", planeStep: 0.08, shadeHueShift: 10, ambientHue: 240 }, platform: { role: "platform", planeStep: 0.1, shadeHueShift: 10, ambientHue: 240 }, hopper: { role: "hopper", planeStep: 0.1, shadeHueShift: 10, ambientHue: 240 } } };

export function worldPlan() {
  return { id: "mill", family: "OBLIQUE_INTERIOR", projection: PROJ, purpose: "a tide current turns a paddle wheel whose gear train drives a grinding stone; flour leaves by a chute", layer: 0,
    depthOrder: ["backWall", "leftWall", "floor", "window", "channel", "current", "postBL", "postBR", "platform", "beamR", "beamX", "beamY", "postFL", "bedStone", "runnerStone", "hopper", "chute", "flourStream", "sack"], parts: [
    { id: "backWall", kind: "block", parent: "substrate", role: "room shell (back)", decision: "mill.shell", footprint: [[-470, -380], [420, -380], [420, -340], [-470, -340]], height: 640, material: "wall" },
    { id: "leftWall", kind: "block", parent: "substrate", role: "room shell (left)", decision: "mill.shell", footprint: [[-510, -380], [-470, -380], [-470, 300], [-510, 300]], height: 640, material: "wall" },
    { id: "floor", kind: "block", parent: "substrate", role: "ground floor", decision: "mill.shell", footprint: [[-470, -340], [420, -340], [420, 300], [-470, 300]], height: 6, material: "floor" },
    { id: "window", kind: "region", parent: "backWall", role: "window in the back wall (light source)", decision: "mill.light", fillRole: "windowLight", shape: QUAD([[60, -340, 300], [220, -340, 300], [220, -340, 470], [60, -340, 470]]) },
    { id: "channel", kind: "region", parent: "floor", role: "tide channel cut through the floor", decision: "mill.water", fillRole: "water", shape: QUAD([[-460, -340, 6], [-300, -340, 6], [-300, 300, 6], [-460, 300, 6]]) },
    { id: "current", kind: "region", parent: "channel", role: "current band (flow direction +y)", decision: "mill.water", fillRole: "waterLight", shape: QUAD([[-420, -120, 7], [-380, -120, 7], [-380, 220, 7], [-420, 220, 7]]) },
    { id: "postBL", kind: "block", parent: "floor", role: "platform post", decision: "mill.platform", footprint: [[-330, -260], [-306, -260], [-306, -236], [-330, -236]], height: 362, material: "platform" },
    { id: "postBR", kind: "block", parent: "floor", role: "platform post", decision: "mill.platform", footprint: [[40, -250], [64, -250], [64, -226], [40, -226]], height: 362, material: "platform" },
    // r1: open timber hurst frame instead of a solid deck — the wallower and shaft must stay visible (first pass: 0% visible)
    { id: "platform", kind: "block", parent: "postBL", role: "hurst frame back beam", decision: "mill.platform", footprint: [[-340, -260], [80, -260], [80, -230], [-340, -230]], height: 18, baseZ: 362, material: "platform" },
    { id: "beamR", kind: "block", parent: "postBL", role: "hurst frame side beam", decision: "mill.platform", footprint: [[50, -230], [80, -230], [80, 150], [50, 150]], height: 18, baseZ: 362, material: "platform" },
    { id: "beamX", kind: "block", parent: "postBL", role: "hurst cross beam behind the shaft", decision: "mill.platform", footprint: [[-320, -100], [50, -100], [50, -72], [-320, -72]], height: 18, baseZ: 362, material: "platform" },
    { id: "beamY", kind: "block", parent: "postBL", role: "hurst cross beam in front of the shaft (r2: shaft passes between the beams)", decision: "mill.platform", footprint: [[-320, 50], [50, 50], [50, 78], [-320, 78]], height: 18, baseZ: 362, material: "platform" },
    { id: "postFL", kind: "block", parent: "floor", role: "platform post", decision: "mill.platform", footprint: [[40, 120], [64, 120], [64, 144], [40, 144]], height: 362, material: "platform" },
    { id: "bedStone", kind: "cylinder_oblique", parent: "platform", role: "bed stone (fixed)", decision: "mill.stones", center: [-200, 4, 380], radius: 96, height: 18, fillRole: "stoneShade", topRole: "stone" },
    { id: "runnerStone", kind: "cylinder_oblique", parent: "bedStone", role: "runner stone (driven by the vertical shaft)", decision: "mill.stones", center: [-200, 4, 398], radius: 92, height: 24, fillRole: "stone", topRole: "stoneTop" },
    { id: "hopper", kind: "block", parent: "platform", role: "grain hopper above the eye of the stone", decision: "mill.stones", footprint: [[-240, -36], [-160, -36], [-160, 44], [-240, 44]], height: 70, baseZ: 482, material: "hopper" },
    { id: "chute", kind: "bar", parent: "platform", role: "tin flour chute (output path)", decision: "mill.output", from: "runnerStone.base", to: P(150, 170, 110), widths: [18, 14], fillRole: "chuteTin" },
    { id: "flourStream", kind: "bar", parent: "chute", role: "flour falling (causal output; animated)", decision: "mill.output", from: "chute.b", to: P(160, 180, 40), widths: [9, 15], fillRole: "flour" },
    { id: "sack", kind: "region", parent: "floor", role: "flour sack receiving the output", decision: "mill.output", fillRole: "sack", shape: R([["l", ...P(110, 150, 0), "corner"], ["sl", ...P(110, 150, 70), "smooth"], ["tl", ...P(130, 168, 112), "corner"], ["tr", ...P(186, 196, 112), "corner"], ["sr", ...P(206, 214, 70), "smooth"], ["r", ...P(206, 214, 0), "corner"]], [["convex", 0.06], ["convex", 0.08], ["concave", 0.08], ["convex", 0.08], ["convex", 0.06], ["convex", 0.1]]) },
  ] };
}
// the mechanism: positions/rotations derived by gears.gearTrain from the driver angle
export function gearPlan(angleDeg) {
  return { id: "drive", inputAngleDeg: angleDeg, layer: 4.5, gears: [
    { id: "waterWheel", teeth: 18, module: 16, plane: "vertical_vh", center3: [-410, 4, 150], thickness: 34, style: "paddle_wheel", spokes: 6, fillRole: "gearWood", shadeRole: "gearShade", decision: "mill.drive" },
    { id: "pitWheel", teeth: 48, module: 4.2, plane: "vertical_vh", coaxialWith: "waterWheel", center3: [-200, 4, 150], thickness: 18, style: "spoked_wheel", spokes: 8, fillRole: "gearWood", shadeRole: "gearShade", decision: "mill.drive", layerOffset: 0.2 },
    { id: "wallower", teeth: 14, module: 4.2, plane: "horizontal_uv", meshWith: "pitWheel", mesh: "crown_to_horizontal", thickness: 14, style: "solid_pinion", fillRole: "gearWood", shadeRole: "gearShade", decision: "mill.drive", layerOffset: 0.3 },
  ] };
}
export { P };

// causal chain parts that must stay visible (F57): water → wheel → axle → pit wheel → wallower → shaft → stones → chute → flour → sack
export const CAUSAL_PARTS = [{ id: "waterWheel", match: /drive\.waterWheel/ }, { id: "pitWheel", match: /drive\.pitWheel/ }, { id: "wallower", match: /drive\.wallower/, min: 0.35 }, { id: "spindle", match: /shaft\.spindle/, min: 0.3 },
  { id: "runnerStone", match: /mill\.runnerStone/ }, { id: "hopper", match: /mill\.hopper/ }, { id: "chute", match: /mill\.chute/ }, { id: "sack", match: /mill\.sack/ }, { id: "water", match: /mill\.channel|mill\.current/ }];
