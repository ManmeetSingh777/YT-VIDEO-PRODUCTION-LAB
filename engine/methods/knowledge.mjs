// ARTISTIC-CONSTRUCTION LAYER. Mechanical producers make geometry from parameters; this layer makes the SKILL'S conditional design
// knowledge decide/limit those parameters. Each rule quotes its source sentence (F_SOURCE.json, verbatim), states its condition and
// exceptions, and is called INSIDE the producers (fail-closed), so a design that reproduces a source "wrong output" cannot be built.
// Derivation tables that choose parameters live with their producers (F65 selectEyeMode, F64 routeFamily, F14 CHANGE, F46 MATERIALS,
// F47/F77 allocate budgets, F03 SITUATIONS, F19/F20/F34/F55 routers) and are listed in ARTISTIC_DERIVATIONS for the registry.
// Engineering thresholds below are bounds for detecting the source's named failure, NOT measured studio ratios.
import { len, sub, pathPoly, bbox } from "./core.mjs";
import { hueDist } from "./color.mjs";

const fail = (method, rule, msg, quote) => { const e = new Error(`${method} artistic rule "${rule}": ${msg}\n   source: "${quote}"`); e.rule = `${method}.${rule}`; throw e; };

export const RULES = {
  /** F01/F58: "One universal round silhouette fails" / "Forbidden: bloated soft painterly contours with no known connecting anatomy" /
   *  "Not invariant: roundedness" → roundness is allowed only when it is the subject's purposeful identity (justified), never a default. */
  F01_generic_round(design, where) {
    const sp = design.spans, convex = sp.filter((s) => s.character === "convex").length / sp.length, amts = sp.map((s) => s.amount), mean = amts.reduce((a, b) => a + b, 0) / amts.length;
    const varA = Math.sqrt(amts.reduce((a, b) => a + (b - mean) ** 2, 0) / amts.length), allSmooth = design.landmarks.every((l) => l.joint === "smooth");
    if (convex === 1 && allSmooth && varA < 0.03 && !design.roundJustification) fail("F01", "generic_round", `${where}: every span convex with uniform bulge and no designed corner — a default rounded silhouette. Design purpose-specific contour character, or record roundJustification naming why roundness IS this subject's identity`, "Wrong output: sphere with four identical cylinders for a human; generic circular bird with glued-on beak");
  },
  /** F01 step 1: "Explicitly name what makes this species or object different from another subject of its family." */
  F01_distinguishes(design, where) { if (!design.distinguishes || typeof design.distinguishes !== "string" || design.distinguishes.length < 12) fail("F01", "distinguishes", `${where}: name what distinguishes this subject from others of its family (identity landmarks)`, "Explicitly name what makes this species or object different from another subject of its family."); },
  /** F06.2 "Not all arms or legs remain same width." + F01 wrong output "four identical cylinders" + spec §5.3 "rounded tube" */
  F06_limb_variety(limbs, where) {
    const sig = limbs.map((l) => l.widths.map((w) => Math.round(w)).join("/") + "|" + l.lengths.map((x) => Math.round(x)).join("/"));
    if (limbs.length >= 4 && new Set(sig).size === 1) fail("F06", "limb_variety", `${where}: all limbs share one width/length profile`, "Not all arms or legs remain same width.");
    for (const l of limbs) if (!(l.widths[2] < l.widths[0])) fail("F06", "limb_taper", `${where}: limb ${l.id} does not taper (uniform tube)`, "A generic function turning three joint points into a rounded tube is insufficient.");
  },
  /** F05 failure "tiny face on huge unstructured skull"; step 1 "one coherent skull/head contour" with structure (jaw/chin/crown) */
  F05_skull_structure(skull, where) {
    const ids = skull.landmarks.map((l) => l.id.toLowerCase()), need = [/crown|top|vertex/, /jaw|chin|mandible/];
    if (!need.every((re) => ids.some((i) => re.test(i)))) fail("F05", "skull_structure", `${where}: skull contour lacks named cranial structure (crown and jaw/chin landmarks)`, "Failure: ... tiny face on huge unstructured skull");
    if (!skull.landmarks.some((l) => l.joint !== "smooth") && !skull.roundJustification) fail("F05", "skull_structure", `${where}: skull has no jaw/cheek turn (all smooth) — an unstructured oval`, "construct one coherent skull/head contour");
  },
  F05_face_proportion(skullD, featureEls, where) {
    if (!featureEls.length) return; const sk = bbox(pathPoly(skullD, 12)), pts = featureEls.flatMap((e) => pathPoly(e.d, 6)), fb = bbox(pts);
    const ratio = (fb[3] - fb[1]) / (sk[3] - sk[1]);
    if (ratio < 0.22) fail("F05", "face_proportion", `${where}: facial features span only ${(ratio * 100).toFixed(0)}% of the head height`, "Failure: ... tiny face on huge unstructured skull");
  },
  /** F05 step 6 / F30 / F64: "entire head/face silhouette changes when tilting, running, reclining" / "redraw or reproject the visible
   *  silhouette ... not merely shift pupils" — view states must carry their own skull/hair contours */
  F30_view_redraw(atlas, viewStates, where) {
    const sk = (r) => r.elements.filter((e) => /skull|hair/.test(e.id)).map((e) => e.d).join("|");
    for (const v of viewStates) if (atlas[v] && sk(atlas[v]) === sk(atlas.canonical)) fail("F30", "view_redraw", `${where}: view state ${v} reuses the canonical skull/hair contour`, "For each key, redraw or reproject the visible silhouette and all occluded planes, not merely shift pupils.");
  },
  /** F06.5 "A static pelvis with disjointedly rotating elbow segments fails." */
  F06_static_pelvis(atlas, poseStates, where) {
    const pel = (r) => JSON.stringify(r.joints?.pelvis) + JSON.stringify(r.elements.find((e) => /\.torso$/.test(e.id))?.d);
    for (const s of poseStates) if (atlas[s] && pel(atlas[s]) === pel(atlas.canonical)) fail("F06", "static_pelvis", `${where}: pose state ${s} changes limbs over an unchanged pelvis/torso`, "A static pelvis with disjointedly rotating elbow segments fails.");
  },
  /** F03 "prohibit random unrelated hues inside one object unless those colors represent named separate materials" */
  F03_hue_family(planes, where, maxDeg = 40) { const b = planes.base; for (const k of ["light", "shade", "deep"]) if (planes[k] && hueDist(b, planes[k]) > maxDeg) fail("F03", "hue_family", `${where}: ${k} plane leaves the material's hue family (${hueDist(b, planes[k]).toFixed(0)}°)`, "prohibit random unrelated hues inside one object unless those colors represent named separate materials"); },
  /** F62 "Forbidden: every region with equal dark stroke" / F02 "not automatic thick black strokes" */
  F62_universal_outline(elements, where) {
    const fills = elements.filter((e) => !e.stroke), strokes = elements.filter((e) => e.stroke);
    if (fills.length >= 3 && strokes.length >= fills.length * 0.8 && new Set(strokes.map((s) => `${s.stroke}|${s.strokeWidth}`)).size === 1) fail("F62", "universal_outline", `${where}: equal stroke on (nearly) every region`, "Forbidden: every region with equal dark stroke, every shape with same drop shadow");
  },
  /** F39.5 "at least three different width/height ratios or leaf groupings for a high-density tree population" */
  F39_row_variety(speciesList, dense, where) { if (dense && new Set(speciesList.map((s) => `${s.lobeCharacter}|${Math.round(s.trunkHeight / s.lobeRadius)}`)).size < 3) fail("F39", "row_variety", `${where}: dense population with <3 distinct species proportions`, "introduce species-like variation across a row: at least three different width/height ratios or leaf groupings"); },
};

/** derivation tables (source knowledge that CHOOSES parameters) — implemented in their producer modules */
export const ARTISTIC_DERIVATIONS = {
  F65: "face.selectEyeMode: role × final head px × gaze × view → eye construction mode (+ F52 budget)",
  F52: "face.BUDGET: eye mode → facial mark budget (fail-closed in constructHead)",
  F64: "family.routeFamily: subject kind × visibility × size × task → family + construction budget",
  F07: "family.REQUIRED: creature family → required part classes, near/far differentiation, part budget",
  F14: "states.CHANGE: change class → owns new drawing / register / track (enforced in buildStateFamily)",
  F46: "surface.MATERIALS: material → allowed plane causes / edge roles / turn depth character",
  F04: "surface: lighting system → producer route; opaque_form = hard planes from light direction",
  F03: "palette.SITUATIONS + pair solver: situation × role slots × discrimination channel → solved values",
  F47: "density.allocate: tier × region × distance × state → generator budgets",
  F77: "density.REGION_T3/REGION_CONTRAST: region kind → T3 and contrast budget",
  F20: "direction.routeMedium: beat tokens → medium tree", F19: "direction.selectRenderer: demand → route", F34: "direction.routeGenerator", F55: "direction.chooseProjection",
};
