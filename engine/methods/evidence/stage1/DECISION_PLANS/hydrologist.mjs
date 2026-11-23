// DECISION PLAN — Specimen 1: original field hydrologist (ORIGINAL_DESIGN_HYPOTHESIS unless marked otherwise).
// Brief (DIRECTION_REQUIREMENT): a field hydrologist cranks a cable reel to lower a water-level probe into a borehole; when the probe
// touches water its indicator lights; she reacts (concentration → surprised relief). Proof: BEFORE probe descending / CAUSE contact with
// water / AFTER indicator lit + reaction. Full-body gesture shot, three-quarter-left view, figure ≈ 600 px tall at 1080p (F64:
// HUMAN_GESTURE_FULL; head ≈ 105 px → F65 table: DARK_MARK_ACTOR unless the close-up specimen state is requested).
// Source conditions used (viewed witnesses, style only): NUCLEAR@145 (task-acting people, dark-mark eyes, big garment masses, thin hair-cap
// rim), BRAIN@386 (full-gesture actor: lean, dark trousers, mitten hands) as the unlike full-body case; MEMORIES@10101 (close: hair as
// 1–2 contiguous lobes, sclera eyes) bounds the close-up state only. NOT transferred: any face, hairstyle, costume, pose or palette of those
// actors. All coordinates below are Claude-authored design values (not decoded from the source).

const ring = (ids, chars) => ids.map((id, i) => ({ from: id, to: ids[(i + 1) % ids.length], character: chars[i][0], amount: chars[i][1] }));
const B = (id, a, b, u, v, jointType = "smooth") => ({ id, bone: [a, b], u, v, jointType });
const S = (id, joint, child, side, r, compress, jointType = "smooth") => ({ id, joint, child, side: side === "outer" ? 1 : side === "inner" ? -1 : side, r, compress, jointType }); // side: limb side (+1 = same side as v>0 landmarks)
const O = (id, joint, x, y, jointType = "smooth") => ({ id, joint, offset: [x, y], jointType });

// canonical skeleton (rest offsets; y down). Stocky adult proportions chosen for identity A; variants scale specific bones.
export function skeleton(v = {}) {
  const k = { torso: 1, limb: 1, shoulder: 1, ...v };
  return { root: "pelvis", joints: {
    pelvis: { parent: null, offset: [0, 0] }, chest: { parent: "pelvis", offset: [0, -150 * k.torso] }, neck: { parent: "chest", offset: [0, -62 * k.torso] }, head: { parent: "neck", offset: [-8, -40] },
    shoulderN: { parent: "chest", offset: [-30 * k.shoulder, -46] }, elbowN: { parent: "shoulderN", offset: [0, 104 * k.limb] }, wristN: { parent: "elbowN", offset: [0, 92 * k.limb] }, handN: { parent: "wristN", offset: [0, 34] },
    shoulderF: { parent: "chest", offset: [44 * k.shoulder, -52] }, elbowF: { parent: "shoulderF", offset: [0, 100 * k.limb] }, wristF: { parent: "elbowF", offset: [0, 88 * k.limb] }, handF: { parent: "wristF", offset: [0, 32] },
    hipN: { parent: "pelvis", offset: [-22, 12] }, kneeN: { parent: "hipN", offset: [0, 138 * k.limb] }, ankleN: { parent: "kneeN", offset: [0, 128 * k.limb] }, toeN: { parent: "ankleN", offset: [-40, 14] },
    hipF: { parent: "pelvis", offset: [30, 8] }, kneeF: { parent: "hipF", offset: [0, 136 * k.limb] }, ankleF: { parent: "kneeF", offset: [0, 126 * k.limb] }, toeF: { parent: "ankleF", offset: [-36, 12] },
  } };
}

// main task pose: leaning over the reel (left of her), near hand on the crank, far hand guiding the cable. Reach is validated by IK.
export const POSE_CRANK = { view: "three_quarter_left", rootAt: [640, 560], rootRot: 0, // pelvis; feet land ≈ y 835 (ground)
  // rot[j] rotates the bone ENDING at joint j (cumulative down the chain): kneeN = thigh, ankleN = shin relative to thigh
  rot: { chest: -13, neck: 6, head: -8, kneeN: 24, ankleN: -34, toeN: 10, kneeF: -16, ankleF: 12, toeF: -4 },
  ik: { wristN: { root: "shoulderN", mid: "elbowN", target: [455, 440], bendSign: -1 }, wristF: { root: "shoulderF", mid: "elbowF", target: [520, 480], bendSign: -1 } } };

/** per-identity pose: same task, targets re-authored where the identity's limb lengths differ (IK refuses unreachable targets) */
export function poseFor(vid) {
  const d = { A: [[492, 474], [540, 492]], B: [[486, 462], [534, 480]], C: [[506, 480], [552, 496]], D: [[484, 466], [532, 486]] }[vid];
  return { ...POSE_CRANK, ik: { wristN: { ...POSE_CRANK.ik.wristN, target: d[0] }, wristF: { ...POSE_CRANK.ik.wristF, target: d[1] } } };
}

// ---- garment / body masses for each identity candidate (A selected after review; B–D are genuine alternatives) ----
const legMass = (id, side, w, hemFlare, role, decision) => {
  const h = `hip${side}`, k = `knee${side}`, a = `ankle${side}`;
  return { id, physicalMass: `${side === "N" ? "near" : "far"} trouser leg`, function: "supports weight / shows stance", fillRole: role, decision, parent: "pelvisMass",
    landmarks: [B("hipO", h, k, 0.02, w * 0.62, "corner"), B("thighO", h, k, 0.5, w * 0.56), S("kneeO", k, a, "outer", w * 0.5, 0.2), B("shinO", k, a, 0.55, w * 0.47), B("hemO", k, a, 0.98, w * 0.5 + hemFlare, "corner"),
      B("hemI", k, a, 0.98, -(w * 0.5 + hemFlare), "corner"), B("shinI", k, a, 0.5, -w * 0.42), S("kneeI", k, a, "inner", w * 0.46, 0.7), B("thighI", h, k, 0.55, -w * 0.5), B("crotch", h, k, 0.06, -w * 0.5, "corner")],
    spans: ring(["hipO", "thighO", "kneeO", "shinO", "hemO", "hemI", "shinI", "kneeI", "thighI", "crotch"], [["convex", 0.06], ["convex", 0.05], ["convex", 0.04], ["straight", 0], ["straight", 0], ["concave", 0.03], ["concave", 0.05], ["concave", 0.04], ["straight", 0], ["concave", 0.08]]) };
};
const bootMass = (id, side, len, h, role, decision) => ({ id, physicalMass: "work boot", function: "ground contact (F06 planted foot)", fillRole: role, decision, parent: `leg${side}`,
  landmarks: [O("heelTop", `ankle${side}`, 14, -6, "corner"), O("heelBot", `ankle${side}`, 16, h, "corner"), O("toeBot", `ankle${side}`, -len, h, "smooth"), O("toeTop", `ankle${side}`, -len + 6, h * 0.35), O("instep", `ankle${side}`, -14, -14, "corner")],
  spans: ring(["heelTop", "heelBot", "toeBot", "toeTop", "instep"], [["convex", 0.04], ["straight", 0], ["convex", 0.35], ["concave", 0.12], ["straight", 0]]) });
const sleeveMass = (id, side, w, rolled, role, decision) => {
  const s = `shoulder${side}`, e = `elbow${side}`, wr = `wrist${side}`, end = rolled ? 0.32 : 0.96;
  return { id, physicalMass: `${side === "N" ? "near" : "far"} shirt sleeve${rolled ? " (rolled above the forearm)" : ""}`, function: "arm action under cloth", fillRole: role, decision, parent: "torsoMass",
    landmarks: [B("cap", s, e, 0.02, w * 0.1, "smooth"), B("capO", s, e, 0.14, w * 0.52), S("elbO", e, wr, "outer", w * 0.48, 0.2), B("cuffO", e, wr, end, w * (rolled ? 0.5 : 0.42), "corner"), B("cuffI", e, wr, end, -w * (rolled ? 0.5 : 0.42), "corner"), S("elbI", e, wr, "inner", w * 0.42, 0.75), B("pit", s, e, 0.22, -w * 0.45, "corner")],
    spans: ring(["cap", "capO", "elbO", "cuffO", "cuffI", "elbI", "pit"], [["convex", 0.1], ["convex", 0.05], ["convex", 0.04], ["straight", 0], ["concave", 0.05], ["concave", 0.06], ["convex", 0.08]]) };
};
const forearmMass = (id, side, w, role, decision) => ({ id, physicalMass: "bare forearm (sleeve rolled)", function: "shows wrist orientation to the grip", fillRole: role, decision, parent: `sleeve${side}`,
  landmarks: [B("a", `elbow${side}`, `wrist${side}`, 0.22, w * 0.46), B("b", `elbow${side}`, `wrist${side}`, 1.02, w * 0.33, "corner"), B("c", `elbow${side}`, `wrist${side}`, 1.02, -w * 0.33, "corner"), B("d", `elbow${side}`, `wrist${side}`, 0.22, -w * 0.44)],
  spans: ring(["a", "b", "c", "d"], [["convex", 0.05], ["straight", 0], ["concave", 0.04], ["straight", 0]]) });

export const VARIANTS = {
  A: { intent: "stocky field hydrologist: broad sloped shoulders, quilted vest to mid-thigh with a flared hem, wide-leg cargo trousers, rolled near sleeve, heavy boots, short side-fringe bob", skel: {}, vestLen: 0.18, vestFlare: 16, torsoW: 1.0, leg: 58, hair: "bob", sleeveRolled: true, boot: [52, 24], extra: [] },
  B: { intent: "lean surveyor: narrow shoulders, knee-length straight field coat, slim trousers, high top-knot", skel: { shoulder: 0.78, limb: 1.1, torso: 1.05 }, vestLen: 0.62, vestFlare: 6, torsoW: 0.74, leg: 40, hair: "topknot", sleeveRolled: false, boot: [44, 18], extra: [] },
  C: { intent: "compact worker in a rain cape: triangular cape over the shoulders, wide-brim hat, short legs", skel: { limb: 0.88, torso: 0.95 }, vestLen: 0.05, vestFlare: 4, torsoW: 1.05, leg: 56, hair: "brim", sleeveRolled: false, boot: [50, 22], extra: ["cape"] },
  D: { intent: "hooded wader technician: long limbs, narrow torso, chest-high waders with wide straight legs, peaked hood up", skel: { shoulder: 0.88, limb: 1.1 }, vestLen: -1, vestFlare: 0, torsoW: 0.84, leg: 76, hair: "hood", sleeveRolled: false, boot: [60, 26], extra: ["bib"] },
};

/** plan(variantId) → figure plan (masses bound to bones). Every number is an authored design value for THIS identity. */
export function plan(vid, colorsRoles, opts = {}) {
  const V = VARIANTS[vid], tw = V.torsoW, dec = (n) => `hydrologist.${vid}.${n}`;
  const masses = [];
  masses.push(legMass("legF", "F", V.leg * 0.95, 4, "trouserFar", dec("legs")), bootMass("bootF", "F", V.boot[0] * 0.92, V.boot[1], "bootFar", dec("boots")));
  masses.push(sleeveMass("sleeveF", "F", 44 * tw, false, "shirtFar", dec("sleeves")));
  // torso (shirt): design-selected landmarks bound to chest/pelvis bones — no fixed waist ratio
  masses.push({ id: "torsoMass", physicalMass: "shirt torso", function: "carries shoulder axis + lean", fillRole: "shirt", decision: dec("torso"), parent: null,
    landmarks: [B("neckN", "chest", "neck", 0.62, 24 * tw, "corner"), B("shN", "chest", "neck", 0.46, 70 * tw), B("pitN", "pelvis", "chest", 1.05, 64 * tw), B("waistN", "pelvis", "chest", 0.25, 56 * tw), B("hipN", "pelvis", "chest", -0.08, 62 * tw, "corner"),
      B("hipF", "pelvis", "chest", -0.08, -60 * tw, "corner"), B("waistF", "pelvis", "chest", 0.3, -52 * tw), B("pitF", "pelvis", "chest", 1.05, -58 * tw), B("shF", "chest", "neck", 0.5, -66 * tw), B("neckF", "chest", "neck", 0.62, -20 * tw, "corner")],
    spans: ring(["neckN", "shN", "pitN", "waistN", "hipN", "hipF", "waistF", "pitF", "shF", "neckF"], [["convex", 0.18], ["convex", 0.08], ["concave", 0.03], ["convex", 0.03], ["straight", 0], ["convex", 0.03], ["convex", 0.05], ["convex", 0.08], ["convex", 0.15], ["concave", 0.12]]) });
  if (V.vestLen >= 0) masses.push({ id: "vest", physicalMass: "quilted vest / coat body", function: "identity mass (layered over shirt)", fillRole: "vest", decision: dec("vest"), parent: "torsoMass",
    landmarks: [B("armholeN", "chest", "neck", 0.52, 62 * tw, "corner"), B("chestN", "pelvis", "chest", 0.8, 68 * tw), B("hemN", "pelvis", "chest", -V.vestLen, 60 * tw + V.vestFlare, "corner"), B("hemMid", "pelvis", "chest", -V.vestLen - 0.04, 0, "smooth"),
      B("hemF", "pelvis", "chest", -V.vestLen, -60 * tw - V.vestFlare * 0.6, "corner"), B("chestF", "pelvis", "chest", 0.8, -60 * tw), B("armholeF", "chest", "neck", 0.54, -62 * tw, "corner"), B("collarF", "chest", "neck", 0.62, -18 * tw), B("vNeck", "chest", "neck", 0.05, 4, "corner"), B("collarN", "chest", "neck", 0.62, 22 * tw)],
    spans: ring(["armholeN", "chestN", "hemN", "hemMid", "hemF", "chestF", "armholeF", "collarF", "vNeck", "collarN"], [["convex", 0.05], ["convex", 0.04], ["convex", 0.04], ["convex", 0.04], ["convex", 0.04], ["concave", 0.06], ["convex", 0.1], ["straight", 0], ["straight", 0], ["convex", 0.1]]) });
  if (V.extra.includes("cape")) masses.push({ id: "cape", physicalMass: "rain cape", function: "identity mass", fillRole: "vest", decision: dec("cape"), parent: "torsoMass",
    landmarks: [B("n", "chest", "neck", 0.1, 30, "corner"), B("sN", "chest", "neck", -0.1, 96, "smooth"), B("hN", "pelvis", "chest", 0.15, 118, "corner"), B("hF", "pelvis", "chest", 0.15, -110, "corner"), B("sF", "chest", "neck", -0.1, -90), B("f", "chest", "neck", 0.1, -26, "corner")],
    spans: ring(["n", "sN", "hN", "hF", "sF", "f"], [["convex", 0.1], ["straight", 0], ["convex", 0.06], ["straight", 0], ["convex", 0.1], ["concave", 0.1]]) });
  if (V.extra.includes("bib")) masses.push({ id: "bib", physicalMass: "bib waders", function: "identity mass", fillRole: "vest", decision: dec("bib"), parent: "torsoMass",
    landmarks: [B("tN", "pelvis", "chest", 0.78, 46, "corner"), B("wN", "pelvis", "chest", 0.2, 70), B("kN", "hipN", "kneeN", 0.9, 40, "corner"), B("kF", "hipF", "kneeF", 0.9, -40, "corner"), B("wF", "pelvis", "chest", 0.2, -66), B("tF", "pelvis", "chest", 0.78, -42, "corner")],
    spans: ring(["tN", "wN", "kN", "kF", "wF", "tF"], [["convex", 0.08], ["straight", 0], ["convex", 0.1], ["straight", 0], ["convex", 0.08], ["convex", 0.05]]) });
  masses.push(legMass("legN", "N", V.leg, V.vestFlare > 10 ? 9 : 4, "trouser", dec("legs")), bootMass("bootN", "N", V.boot[0], V.boot[1], "boot", dec("boots")));
  masses.push({ id: "neck", physicalMass: "neck", function: "head-to-torso connection (F05 step 6)", fillRole: "skinShade", decision: dec("neck"), parent: "torsoMass",
    landmarks: [B("a", "neck", "head", -0.5, 24, "corner"), B("b", "neck", "head", 0.9, 20), B("c", "neck", "head", 0.9, -19), B("d", "neck", "head", -0.5, -25, "corner")], spans: ring(["a", "b", "c", "d"], [["straight", 0], ["convex", 0.1], ["straight", 0], ["concave", 0.1]]) });
  // head silhouette masses for the candidate stage (the detailed head is constructed by faceview from the FaceDesign)
  const head = { bob: [[-30, -48], [26, -62], [58, -20], [52, 40], [12, 58], [-38, 46], [-56, 6]], topknot: [[-20, -54], [-6, -92], [20, -92], [30, -56], [50, -8], [36, 50], [-34, 52], [-50, 0]], brim: [[-92, -26], [-30, -62], [36, -66], [96, -24], [46, -12], [44, 46], [-36, 50], [-40, -14]], hood: [[-44, -40], [-6, -78], [52, -84], [96, -60], [70, -20], [58, 52], [10, 70], [-40, 52], [-56, 4]] }[V.hair];
  if (opts.withHead !== false) masses.push({ id: "headMass", physicalMass: "head + hair silhouette", function: "identity head read", fillRole: "hair", decision: dec("head"), parent: "neck",
    landmarks: head.map(([x, y], i) => O(`h${i}`, "head", x, y, i === 0 || (V.hair === "brim" && (i === 3 || i === 0)) ? "corner" : "smooth")), spans: ring(head.map((_, i) => `h${i}`), head.map(() => ["convex", 0.12])) });
  masses.push(sleeveMass("sleeveN", "N", 46 * tw, V.sleeveRolled, "shirt", dec("sleeves")));
  if (V.vestLen >= 0) masses.push({ id: "vestYokeN", physicalMass: "vest armhole edge over the near sleeve cap", function: "garment overlap (sleeve emerges from the armhole)", fillRole: "vest", decision: dec("vestYoke"), parent: "vest",
    landmarks: [B("n", "chest", "neck", 0.66, 20 * tw, "corner"), B("sh", "chest", "neck", 0.5, 70 * tw), B("capO", "shoulderN", "elbowN", 0.2, 26 * tw, "corner"), B("capI", "shoulderN", "elbowN", 0.2, -18 * tw, "corner"), B("in", "chest", "neck", 0.3, 34 * tw)],
    spans: ring(["n", "sh", "capO", "capI", "in"], [["convex", 0.1], ["convex", 0.12], ["convex", 0.06], ["straight", 0], ["concave", 0.05]]) });
  if (V.sleeveRolled) masses.push(forearmMass("forearmN", "N", 34, "skin", dec("forearm")));
  const order = ["legF", "bootF", "sleeveF", "torsoMass", ...(V.vestLen >= 0 ? ["vest"] : []), ...(V.extra.includes("bib") ? ["bib"] : []), "legN", "bootN", ...(V.extra.includes("cape") ? ["cape"] : []), "neck", ...(opts.withHead !== false ? ["headMass"] : []), "sleeveN", ...(V.vestLen >= 0 ? ["vestYokeN"] : []), ...(V.sleeveRolled ? ["forearmN"] : [])];
  const folds = [{ id: "elbowFoldN", mass: "sleeveN", joint: "elbowN", child: "wristN", cls: "soft_drape", stiffness: 0.35, reach: 30, shadeRole: "shirtShade", decision: dec("folds") },
    { id: "kneeBreakN", mass: "legN", joint: "kneeN", child: "ankleN", cls: "stiff_break", stiffness: 0.55, reach: 34, shadeRole: "trouserShade", decision: dec("folds") },
    ...(V.vestLen >= 0 ? [{ id: "vestQuilt", mass: "vest", joint: "chest", child: "neck", cls: "quilted_compress", stiffness: 0.2, reach: 40, shadeRole: "vestShade", decision: dec("quilt") }] : [])];
  return { id: `hydro${vid}`, skeleton: skeleton(V.skel), masses, order, folds, colors: colorsRoles, layer: 10 };
}
