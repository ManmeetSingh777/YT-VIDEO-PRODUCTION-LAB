// DECISION PLAN — hydrologist FaceDesign (ORIGINAL_DESIGN_HYPOTHESIS). Identity: ~55-year-old field hydrologist; broad cheekbones,
// soft rounded jaw with a slight under-chin, short silver bob with a heavy fringe swept from her right to left (sweep stays on the same
// side of the head in every view = cross-view identity anchor), small upturned nose, wide mouth. Units: px at reference head height 200,
// origin = head centre; three-quarter and profile views face LEFT. Source condition (style only): hair as 1–2 contiguous lobes over the
// skull + attached ear lobe + cheek planes (MEMORIES@10101, NUCLEAR@145); dark-mark eyes at gesture scale (NUCLEAR@145) vs sclera eyes
// at close scale (MEMORIES@10101 / BRAIN@274). No face, hairstyle or colour from those witnesses is copied.
const R = (pts, chars) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "smooth" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: (chars?.[i] || ["convex", 0.12])[0], amount: (chars?.[i] || ["convex", 0.12])[1] })) });

export const FACE = {
  identity: "hydrologist", decision: "hydrologist.face",
  skullByView: {
    front: { identity: ["jawL", "jawR"], ...R([["crown", 0, -100], ["templeR", 72, -58], ["cheekR", 80, 8], ["jawR", 60, 64, "corner"], ["chin", 0, 100], ["jawL", -60, 64, "corner"], ["cheekL", -80, 8], ["templeL", -72, -58]], [["convex", 0.16], ["convex", 0.08], ["convex", 0.1], ["convex", 0.18], ["convex", 0.18], ["convex", 0.1], ["convex", 0.08], ["convex", 0.16]]) },
    three_quarter_left: { identity: ["brow", "chin"], ...R([["crown", 14, -100], ["back", 80, -46], ["nape", 76, 30], ["jawAngle", 50, 66, "corner"], ["underChin", 4, 94], ["chin", -34, 92, "corner"], ["mouthEdge", -60, 58], ["cheek", -78, 14], ["brow", -72, -24, "corner"], ["forehead", -56, -72]], [["convex", 0.15], ["convex", 0.1], ["convex", 0.06], ["convex", 0.1], ["convex", 0.08], ["convex", 0.1], ["convex", 0.08], ["concave", 0.06], ["convex", 0.1], ["convex", 0.15]]) },
    profile_left: { identity: ["noseTip", "chin"], ...R([["crown", 20, -100], ["back", 70, -46], ["nape", 60, 34], ["jawAngle", 30, 66, "corner"], ["underChin", -16, 92], ["chin", -58, 86, "corner"], ["lip", -72, 54], ["underNose", -76, 32, "corner"], ["noseTip", -94, 20, "corner"], ["bridge", -74, -6], ["brow", -70, -26, "corner"], ["forehead", -54, -74]], [["convex", 0.15], ["convex", 0.1], ["convex", 0.06], ["convex", 0.08], ["convex", 0.1], ["convex", 0.12], ["concave", 0.1], ["straight", 0], ["concave", 0.12], ["concave", 0.1], ["convex", 0.1], ["convex", 0.15]]) },
    rear: { identity: ["napeL", "napeR"], ...R([["crown", 0, -100], ["sideR", 76, -36], ["earR", 78, 16], ["napeR", 46, 72, "corner"], ["neck", 0, 86], ["napeL", -46, 72, "corner"], ["earL", -78, 16], ["sideL", -76, -36]]) },
  },
  // hair: back mass framing the face + fringe lobe swept toward screen-left (her left) in every view
  hairByView: {
    front: [{ id: "back", front: false, tone: "hairShade", ...R([["a", -96, -64], ["b", 0, -122], ["c", 96, -64], ["d", 100, 24], ["e", 88, 70, "corner"], ["f", 60, 52], ["g", -60, 52], ["h", -88, 70, "corner"], ["i", -100, 24]], [["convex", 0.15], ["convex", 0.15], ["convex", 0.08], ["convex", 0.08], ["concave", 0.1], ["straight", 0], ["concave", 0.1], ["convex", 0.08], ["convex", 0.08]]) },
      { id: "fringe", front: true, ...R([["a", -90, -46, "corner"], ["b", -30, -118], ["c", 70, -102], ["d", 92, -40, "corner"], ["e", 60, -60], ["f", 20, -40, "corner"], ["g", -30, -50], ["h", -62, -24, "corner"]], [["convex", 0.15], ["convex", 0.12], ["convex", 0.12], ["concave", 0.12], ["concave", 0.08], ["sCurve", 0.06], ["concave", 0.1], ["straight", 0]]) },
      { id: "sideR", front: true, ...R([["a", 66, -40], ["b", 96, -30], ["c", 98, 40], ["d", 86, 74, "corner"], ["e", 72, 30]], [["convex", 0.1], ["convex", 0.08], ["convex", 0.1], ["concave", 0.12], ["concave", 0.1]]) }],
    three_quarter_left: [{ id: "back", front: false, tone: "hairShade", ...R([["a", -40, -96], ["b", 50, -114], ["c", 104, -50], ["d", 106, 30], ["e", 94, 78, "corner"], ["f", 50, 60], ["g", 30, -20]], [["convex", 0.15], ["convex", 0.15], ["convex", 0.08], ["convex", 0.08], ["concave", 0.08], ["convex", 0.06], ["concave", 0.1]]) },
      { id: "fringe", front: true, ...R([["a", -84, -40, "corner"], ["b", -50, -110], ["c", 30, -118], ["d", 100, -60], ["e", 70, -40, "corner"], ["f", 24, -60], ["g", -24, -44, "corner"], ["h", -56, -34]], [["convex", 0.15], ["convex", 0.12], ["convex", 0.12], ["concave", 0.06], ["concave", 0.1], ["sCurve", 0.06], ["concave", 0.1], ["straight", 0]]) },
      { id: "side", front: true, tone: "hairShade", ...R([["a", 40, -40], ["b", 104, -40], ["c", 106, 40], ["d", 92, 80, "corner"], ["e", 54, 40], ["f", 46, 0]], [["convex", 0.1], ["convex", 0.08], ["convex", 0.1], ["concave", 0.12], ["concave", 0.06], ["convex", 0.05]]) }],
    profile_left: [{ id: "mass", front: true, ...R([["a", -60, -60, "corner"], ["b", -30, -116], ["c", 60, -110], ["d", 96, -40], ["e", 92, 40], ["f", 74, 80, "corner"], ["g", 34, 50], ["h", 14, -10], ["i", -24, -40]], [["convex", 0.15], ["convex", 0.12], ["convex", 0.1], ["convex", 0.08], ["convex", 0.08], ["concave", 0.1], ["concave", 0.08], ["convex", 0.06], ["concave", 0.08]]) }],
    rear: [{ id: "mass", front: true, ...R([["a", -98, -50], ["b", 0, -122], ["c", 98, -50], ["d", 100, 30], ["e", 80, 74, "corner"], ["f", 0, 64], ["g", -80, 74, "corner"], ["h", -100, 30]], [["convex", 0.15], ["convex", 0.15], ["convex", 0.08], ["convex", 0.08], ["concave", 0.06], ["concave", 0.06], ["convex", 0.08], ["convex", 0.08]]) }],
  },
  planesByView: {
    front: [{ id: "jawR", cause: "jaw_turn", normal: [0.8, 0.3], ...R([["a", 68, -4], ["b", 84, 12], ["c", 64, 64], ["d", 28, 94], ["e", 54, 58], ["f", 72, 16]], [["convex", 0.1], ["convex", 0.08], ["convex", 0.08], ["concave", 0.08], ["concave", 0.08], ["concave", 0.06]]) }, { id: "underNose", cause: "under_nose", normal: [0, 1], ...R([["a", -12, 30], ["b", 12, 30], ["c", 6, 38], ["d", -6, 38]]) }],
    three_quarter_left: [{ id: "farCheek", cause: "cheek_plane", normal: [-0.9, 0.1], ...R([["a", -66, -10], ["b", -80, 14], ["c", -62, 58], ["d", -48, 30]]) },
      { id: "jawSide", cause: "jaw_turn", normal: [0.85, 0.25], ...R([["a", 44, -12], ["b", 80, -2], ["c", 76, 36], ["d", 50, 68], ["e", 16, 90], ["f", 42, 60], ["g", 58, 22]], [["convex", 0.1], ["convex", 0.06], ["convex", 0.06], ["convex", 0.08], ["concave", 0.08], ["concave", 0.08], ["concave", 0.06]]) },
      { id: "underNose", cause: "under_nose", normal: [0, 1], ...R([["a", -64, 32], ["b", -42, 30], ["c", -46, 40], ["d", -60, 40]]) }],
    profile_left: [{ id: "cheekSide", cause: "jaw_turn", normal: [0.9, 0.2], ...R([["a", 14, -4], ["b", 48, 8], ["c", 36, 58], ["d", -6, 86], ["e", 20, 52], ["f", 28, 14]], [["convex", 0.08], ["convex", 0.08], ["convex", 0.08], ["concave", 0.08], ["concave", 0.06], ["concave", 0.06]]) }],
    rear: [{ id: "nape", cause: "neck_shadow", normal: [0, 1], ...R([["a", -40, 50], ["b", 40, 50], ["c", 30, 84], ["d", -30, 84]]) }],
  },
  featuresByView: {
    front: { eyeNear: { center: [-30, -6], w: 26, h: 13 }, eyeFar: { center: [30, -6], w: 26, h: 13 }, browNear: { inner: [-12, -28], outer: [-46, -30], arch: 4, thick: 6 }, browFar: { inner: [12, -28], outer: [46, -30], arch: 4, thick: 6 },
      nose: R([["l", -9, 18], ["top", 0, 12], ["r", 9, 18], ["rb", 11, 28], ["tip", 0, 33], ["lb", -11, 28]], [["convex", 0.1], ["convex", 0.1], ["convex", 0.15], ["convex", 0.2], ["convex", 0.2], ["convex", 0.15]]), mouth: { left: [-26, 58], right: [26, 58], mid: [0, 60], width: 52 },
      cheek: R([["a", -64, 22], ["b", -40, 18], ["c", -42, 36], ["d", -62, 38]]), ear: R([["t", 76, -10], ["o", 92, 2], ["b", 86, 30, "corner"], ["i", 76, 24]]) },
    three_quarter_left: { eyeNear: { center: [-14, -6], w: 26, h: 13 }, eyeFar: { center: [-60, -6], w: 14, h: 12 }, browNear: { inner: [-28, -28], outer: [6, -32], arch: 4, thick: 6 }, browFar: { inner: [-50, -28], outer: [-70, -27], arch: 2, thick: 5 },
      nose: R([["top", -44, 6], ["tip", -62, 25, "corner"], ["base", -57, 33], ["wing", -44, 32]], [["concave", 0.08], ["convex", 0.2], ["convex", 0.1], ["convex", 0.15]]), mouth: { left: [-60, 56], right: [-14, 56], mid: [-38, 58], width: 46 },
      cheek: R([["a", -12, 20], ["b", 14, 18], ["c", 12, 38], ["d", -10, 38]]), ear: R([["t", 40, -8], ["o", 58, 4], ["b", 50, 34, "corner"], ["i", 38, 26]]) },
    profile_left: { eyeNear: { center: [-50, -6], w: 14, h: 12 }, eyeFar: null, browNear: { inner: [-62, -28], outer: [-36, -30], arch: 2, thick: 6 },
      nose: null, mouth: { left: [-72, 54], right: [-52, 54], mid: [-64, 55], width: 20 }, cheek: R([["a", -40, 18], ["b", -18, 18], ["c", -20, 36], ["d", -40, 36]]), ear: R([["t", 10, -10], ["o", 30, 2], ["b", 22, 34, "corner"], ["i", 8, 24]]) },
    rear: { eyeNear: null, eyeFar: null, nose: null, mouth: null, ear: R([["t", 76, -6], ["o", 90, 6], ["b", 84, 30, "corner"], ["i", 74, 22]]) },
  },
  // eye opening (local unit frame; y<0 = upper lid, scaled by openness) — almond with a heavier outer upper lid for this identity
  eyeShape: R([["inner", -1, 0.1, "corner"], ["upIn", -0.45, -0.9], ["upOut", 0.4, -1], ["outer", 1, -0.1, "corner"], ["low", 0.2, 0.8]], [["convex", 0.1], ["convex", 0.1], ["convex", 0.15], ["convex", 0.15], ["convex", 0.15]]),
  markShape: R([["t", 0, -1], ["tr", 0.7, -0.55], ["br", 0.7, 0.55], ["b", 0, 1], ["bl", -0.7, 0.55], ["tl", -0.7, -0.55]], [["convex", 0.2], ["convex", 0.12], ["convex", 0.2], ["convex", 0.2], ["convex", 0.12], ["convex", 0.2]]),
  pupilShape: R([["t", 0, -1], ["r", 1, 0], ["b", 0, 1], ["l", -1, 0]], [["convex", 0.28], ["convex", 0.28], ["convex", 0.28], ["convex", 0.28]]),
  // R4: identity-authored brow (heavy, straight, soft tail) and mouth shapes per topology (wide mouth, fuller lower lip)
  browShape: R([["inTop", 0, -0.55, "corner"], ["mid", 0.5, -0.6], ["tail", 1.02, -0.05, "corner"], ["midLow", 0.5, 0.42], ["inBot", 0, 0.5, "corner"]], [["straight", 0], ["convex", 0.1], ["convex", 0.08], ["straight", 0], ["straight", 0]]),
  mouthShapes: {
    closed: R([["l", -1, 0, "corner"], ["top", 0, -0.04], ["r", 1, 0, "corner"], ["bot", 0, 0.1]], [["convex", 0.05], ["convex", 0.05], ["convex", 0.12], ["convex", 0.12]]),
    small_open: R([["l", -1, 0.02, "corner"], ["tl", -0.4, -0.14], ["tr", 0.4, -0.14], ["r", 1, 0.02, "corner"], ["br", 0.45, 0.3], ["bl", -0.45, 0.3]], [["convex", 0.08], ["straight", 0], ["convex", 0.08], ["convex", 0.12], ["convex", 0.1], ["convex", 0.12]]),
    wide_open: R([["l", -1, 0, "corner"], ["tl", -0.45, -0.2], ["tr", 0.45, -0.2], ["r", 1, 0, "corner"], ["br", 0.5, 0.55], ["bl", -0.5, 0.55]], [["convex", 0.08], ["straight", 0], ["convex", 0.08], ["convex", 0.15], ["convex", 0.12], ["convex", 0.15]]),
    smile: R([["l", -1, -0.04, "corner"], ["top", 0, 0.03], ["r", 1, -0.04, "corner"], ["br", 0.5, 0.26], ["bl", -0.5, 0.26]], [["concave", 0.04], ["concave", 0.04], ["convex", 0.12], ["convex", 0.1], ["convex", 0.12]]),
    frown: R([["l", -1, 0.08, "corner"], ["top", 0, -0.05], ["r", 1, 0.08, "corner"], ["bot", 0, 0.02]], [["convex", 0.08], ["convex", 0.08], ["concave", 0.06], ["concave", 0.06]]),
  },
  // linked action states (brow inner/outer deltas, lid openness, gaze, mouth topology/corners, cheek)
  expressionStates: {
    concentrating: { brow: { inner: [2, 5], outer: [0, 1] }, lidOpen: -0.25, gaze: [-0.6, 0.5], mouth: { topology: "closed", cornerDy: 2 }, cheek: false },
    surprised: { brow: { inner: [0, -11], outer: [0, -9] }, browArch: 4, lidOpen: 0.25, gaze: [-0.4, 0.2], mouth: { topology: "small_open", cornerDy: 0, open: 14 }, cheek: false },
    relieved: { brow: { inner: [0, -6], outer: [0, -1] }, lidOpen: -0.15, gaze: [0.4, -0.1], mouth: { topology: "smile", cornerDy: -6, open: 8 }, cheek: true },
    worried: { browNear: { inner: [0, -8], outer: [0, 4] }, browFar: { inner: [0, -8], outer: [0, 4] }, lidOpen: 0.05, gaze: [0, 0.3], mouth: { topology: "closed", cornerDy: 6 }, cheek: false },
  },
};
