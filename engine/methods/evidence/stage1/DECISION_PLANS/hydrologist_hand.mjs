// DECISION PLAN — hydrologist HandDesign (ORIGINAL_DESIGN_HYPOTHESIS). Broad working hand: square palm wedge wider at the knuckles,
// short thick fingers grouped as two near + two far digit volumes (source condition: simplified fingers but readable hand/prop relation,
// F06; mitten-like groups at gesture scale, NUCLEAR@145 / BRAIN@386), blunt rounded-square fingertips, a heavy thumb pad.
// Hand frame: x along the forearm (wrist → knuckles), y toward the thumb side; units px at scale 1 (≈ final px at a 600 px figure).
const R = (pts, chars) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "smooth" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: (chars?.[i] || ["convex", 0.1])[0], amount: (chars?.[i] || ["convex", 0.1])[1] })) });
export const HAND = {
  identity: "hydrologist.hand", decision: "hydrologist.hand",
  palm: { identity: ["heel"], ...R([["heel", -2, -9, "corner"], ["thumbPad", 8, 13], ["knuckleT", 28, 12, "corner"], ["knuckleP", 30, -11, "corner"], ["outer", 8, -13]], [["convex", 0.2], ["convex", 0.12], ["convex", 0.08], ["convex", 0.1], ["convex", 0.08]]) },
  knuckles: [[30, 7], [31, -1], [30, -8]],
  // knuckle-crease plane: the turned band across the palm just behind the knuckle row (hand frame)
  knuckleCrease: { identity: ["a"], ...R([["a", 20, 12, "corner"], ["b", 30, 11], ["c", 31, -10], ["d", 22, -11, "corner"], ["e", 24, 0]], [["straight", 0], ["convex", 0.1], ["straight", 0], ["concave", 0.06], ["concave", 0.06]]) },
  fingers: [{ knuckle: 0, segments: [11, 8, 7], width: 8, depth: "near", openCurl: 6 }, { knuckle: 1, segments: [12, 9, 7], width: 8, depth: "near", openCurl: 8 }, { knuckle: 1, segments: [12, 8, 7], width: 7.5, depth: "far", openCurl: 10 }, { knuckle: 2, segments: [10, 7, 6], width: 7, depth: "far", openCurl: 12 }],
  thumb: { base: [12, 12], segments: [11, 10], width: 8.5 },
  fingertip: R([["a", -0.2, 1, "corner"], ["b", 0.9, 0.75], ["c", 1.15, 0], ["d", 0.9, -0.75], ["e", -0.2, -1, "corner"]], [["convex", 0.1], ["convex", 0.2], ["convex", 0.2], ["convex", 0.1], ["straight", 0]]),
};
