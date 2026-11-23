// SMOKER — bellows smoker, a small MACHINE subject (F09/F45/F68). Truth table: squeezing the bellows (input) pushes air
// through the fire-can (process) and out of the spout as smoke (output); the operator holds the bellows board.
// Coordinates are relative to the grip point on the lower bellows board.
import { author } from "../../../engine/authoring/construct.mjs";
import { xform } from "../../../engine/lib/geom.mjs";
export function smoker({ ctx, prefix = "sm-" } = {}) {
  const A = author("smoker", { kind: "machine", subject_id: "smoker", projection: "FLAT", world_class: "NONE", hasOptics: false, hasEmission: false, hasRepeats: true, changesState: true, moves: true, flowPath: false, hasViewport: false, prefix,
    transitions: false, nestedWorld: false, relights: false, perceptionEffect: false, population: false, interface: false, comparison: false, infoTheatre: false, luminousVolume: false, macroLens: false, labels: false, historical: false }, ctx);
  A.witness(["F68", "F09", "F45"], "question_native_witnesses/AI_0285_machine_actor_interior.jpg", "question_native_witnesses/NUCLEAR_0137_optical_magnifier.jpg",
    "device housing as a few hard faces with inset parts and a dark functional opening; magnifier (unlike): an instrument read by its working part, not by decoration.");
  A.witness(["F02", "F04"], "character_native_anchors/BRAIN_0157_couch_human.jpg", "question_native_witnesses/NUCLEAR_0271_mechanism_scale_world.jpg", "hard flat planes: light face / base / shade face of one hue.");
  A.decide("machine.truthTable", { input: "squeeze bellows", process: "air through fire-can", output: "smoke from spout", operator: "hand on the lower board" }, { by: ["F45", "F68", "F09"] });
  A.decide("machine.partGraph", "board→leather→upper board→can→lid→spout", { by: ["F09"] });
  A.decide("machine.assemblies", ["bellows", "fire-can", "spout"], { by: ["F45"] });
  A.decide("machine.surfacePolicy", { tin: "HARD_BOUNDARY", leather: "HARD_BOUNDARY", wood: "HARD_BOUNDARY" }, { by: ["F68"] });
  A.decide("machine.sockets", ["grip (board)", "nozzle (spout tip)"], { by: ["F68"] });
  A.decide("repeats.parent", { rivets: "can top band" }, { by: ["F54", "F76"] });
  A.decide("proof.silent", "a squeeze of the bellows makes a puff leave the spout", { by: ["F57"] });
  A.decide("proof.anchors", { source: "bellows leather", target: "spout tip" }, { by: ["F57"] });
  for (const [k, by] of [["silhouette.outer", ["F01", "F58"]], ["silhouette.view", ["F01"]], ["silhouette.identityFeatures", ["F01"]], ["silhouette.voids", ["F58"]], ["silhouette.smallRead", ["F58"]], ["parts", ["F59"]], ["materials", ["F02", "F46"]], ["lighting.system", ["F04"]], ["edges", ["F62"]], ["palette.roles", ["F03", "F51", "F61"]], ["palette.focalPair", ["F03"]], ["palette.pairs", ["F61"]], ["detail.owner", ["F33"]], ["detail.tiers", ["F47", "F53"]], ["medium", ["F19"]], ["states", ["F14"]], ["motion.owners", ["F15"]], ["motion.keys", ["F31"]], ["layers.underpaint", ["F79"]], ["generator.family", ["F34"]]])
    A.decide(k, "authored in this module (tin can + spout + bellows, flat hard planes)", { by });
  A.palette([["#b9c3c9", "#7fae6a", 1.3], ["#a1452f", "#b9c3c9", 1.6]], { by: ["F03", "F51", "F61"] });
  const o = [-192, 280], R = (d) => xform(d, { x: o[0], y: o[1] });
  A.part("root").part("upper", { parent: "root", at: [0, -12], z: 1 });
  A.region("can", { part: "root", z: 1, fill: "#b9c3c9", path: R("M196,-388 L238,-388 L240,-318 C234,-310 202,-310 196,-318 Z"), by: ["F68", "F01", "F58", "F09", "F45", "F34"] });
  A.patch("canS", "can", { fill: "#8d99a1", path: R("M196,-392 L210,-392 L210,-308 L196,-308 Z"), by: ["F04", "F62", "F02", "F46"] });
  A.recess("vent", "can", { fill: "#2c2f33", path: R("M212,-336 C212,-342 222,-342 222,-336 C222,-330 212,-330 212,-336 Z"), wall: "#5b6268", wallPath: R("M210,-344 L224,-344 L224,-337 L210,-337 Z"), by: ["F68", "F09", "F45"] });
  A.repeat("rivets", "can", [200, 208, 216, 224, 232], (x) => `<circle cx="${x + o[0]}" cy="${-374 + o[1]}" r="2.2" fill="#7b868e"/>`, { by: ["F34", "F54", "F76", "F68"] });
  A.patch("canL", "can", { fill: "#e3e9ec", path: R("M226,-392 L232,-392 L234,-308 L228,-308 Z"), by: ["F04", "F02"] });
  A.attach("lid", "can", { part: "root", z: 2, fill: "#8d99a1", path: R("M192,-392 L242,-392 C238,-404 228,-410 218,-412 C206,-410 196,-404 192,-392 Z"), by: ["F68", "F59"] });
  A.attach("spout", "lid", { part: "root", z: 1.5, fill: "#6f7b83", path: R("M210,-410 C214,-424 222,-436 236,-444 L244,-434 C232,-428 226,-418 224,-408 Z"), by: ["F68", "F59"] });
  A.region("upperBoard", { part: "upper", z: 0, fill: "#7a4f2a", path: R("M188,-306 L246,-306 L240,-292 L190,-292 Z"), by: ["F68", "F59"] });
  A.region("leather", { part: "root", z: 0.5, fill: "#a1452f", path: R("M190,-304 L240,-304 C236,-292 226,-286 214,-286 C202,-286 194,-292 190,-304 Z"), by: ["F68", "F58"] });
  A.attach("board", "leather", { part: "root", z: 0.8, fill: "#8a5a30", path: R("M184,-286 L236,-286 L232,-276 L186,-276 Z"), by: ["F68", "F59"] });
  A.socket("nozzle", "root", [240 + o[0], -440 + o[1]]);
  A.states("bellows", ["open", "squeezed"], { by: ["F14"] });
  A.rigBind({ by: ["F15", "F31", "F79"], channels: ["upper.y (bellows squeeze)"] });
  return A.compile({ rig: { place: { x: 0, y: 0 } } });
}
