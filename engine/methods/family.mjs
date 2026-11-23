// F64 (+ CHARACTER_FAMILY_CONSTRUCTOR A) — identity routed by illustration family; F07 — mascot / quadruped / macro creature construction.
// F64: choose ACTING_FACE | GESTURE_FULL_BODY | REAR_OR_OCCLUDED | DISTANT_POPULATION | ORGANISM_MACRO | MASCOT_SYMBOLIC | SPECIALIZED_GEAR
// BEFORE construction, from role + visibility in the new demonstration; small actors suppress inner eye/fabric detail but keep head cap,
// posture and contrasting body segments; new species need their own silhouette/limb system (no inherited cute bird).
// F07: mascot = one simple silhouette + large attached face + compact purposeful parts, only independently-moving parts layered;
// quadruped = species torso/neck/head transition, DIFFERENTIATED near/far limbs, ears/horns/eyes/muzzle, tail, weight, registered pattern;
// macro = more anatomy-specific local structure, detail increased by NAMED biological subparts, never uniform texture.
// Producing operation: routeFamily() derives the construction budget that downstream producers consume (eye-mode role, hand mode,
// garment detail, required views); constructCreature() builds the species part graph via F59 assemble with family-specific rules
// (far-limb value/layer offset, pattern registered to the body as F02 markings, subpart-named detail only).
import { registerProducer } from "./emit.mjs";
import { need } from "./core.mjs";
import { assemble } from "./topology.mjs";
import { constructSurface } from "./surface.mjs";

export const FAMILIES = ["ACTING_FACE", "GESTURE_FULL_BODY", "REAR_OR_OCCLUDED", "DISTANT_POPULATION", "ORGANISM_MACRO", "MASCOT_SYMBOLIC", "SPECIALIZED_GEAR"];

/** routeFamily({role, faceVisible, bodyVisible, screenHeightPx, headPx, subjectKind, gear}) → family + construction budget */
function routeFamily__impl(c) {
  need("F64 route", c, { subjectKind: ["human", "animal", "mascot", "organism", "machine_agent"], faceVisible: "bool", bodyVisible: "bool", screenHeightPx: "num+", headPx: "num+", task: ["expression", "gesture", "tool_contact", "population", "anatomy", "symbol"], gear: "bool" });
  let family, why;
  if (c.subjectKind === "organism" || c.task === "anatomy") { family = "ORGANISM_MACRO"; why = "anatomy is the demonstrated object"; }
  else if (c.subjectKind === "mascot" || c.task === "symbol") { family = "MASCOT_SYMBOLIC"; why = "symbolic species character"; }
  else if (c.screenHeightPx < 90 || c.task === "population") { family = "DISTANT_POPULATION"; why = `whole actor ${c.screenHeightPx}px tall`; }
  else if (!c.faceVisible) { family = "REAR_OR_OCCLUDED"; why = "face not visible: suppress frontal features"; }
  else if (c.gear) { family = "SPECIALIZED_GEAR"; why = "hard-shell gear overlaps flexible costume"; }
  else if (c.task === "expression" && c.headPx >= 120) { family = "ACTING_FACE"; why = "facial thought/expression must read"; }
  else { family = "GESTURE_FULL_BODY"; why = "full-body cause, reach, weight or support"; }
  const B = {
    ACTING_FACE: { faceRole: "ACTING_CUE", hands: "TASK_SPECIFIC", garmentFolds: true, views: ["canonical", "expression_states"], innerDetail: "full" },
    GESTURE_FULL_BODY: { faceRole: c.headPx >= 40 ? "ACTING_CUE" : "SILHOUETTE_IDENTITY", hands: "TASK_SILHOUETTE", garmentFolds: true, views: ["canonical", "pose_extremes"], innerDetail: "reduced" },
    REAR_OR_OCCLUDED: { faceRole: "ACTING_CUE", hands: "TOOL_CONTACT", garmentFolds: true, views: ["rear"], innerDetail: "reduced", forceRear: true },
    DISTANT_POPULATION: { faceRole: "SUPPORTING_BACKGROUND", hands: "COLLAPSED", garmentFolds: false, views: ["silhouette"], innerDetail: "collapsed" },
    ORGANISM_MACRO: { faceRole: "BIOLOGICAL_SUBJECT", hands: "SPECIES", garmentFolds: false, views: ["specimen"], innerDetail: "named_subparts" },
    MASCOT_SYMBOLIC: { faceRole: "ACTING_CUE", hands: "SPECIES", garmentFolds: false, views: ["canonical", "face_states"], innerDetail: "minimal" },
    SPECIALIZED_GEAR: { faceRole: "ACTING_CUE", hands: "TASK_SPECIFIC", garmentFolds: true, views: ["canonical", "pose_extremes"], innerDetail: "shell_regions" },
  }[family];
  return { method: "F64", family, why, budget: B };
}

/** F07 species part-graph requirements per creature family */
const REQUIRED = {
  mascot: { classes: ["body", "face"], max: 7, note: "compact purposeful parts; only independently moving parts layered" },
  quadruped: { classes: ["torso", "neck_head", "leg_near", "leg_far", "tail"], max: 30, note: "differentiated near/far limbs, head/neck transition, tail" },
  macro: { classes: ["body_segment", "appendage", "eye"], max: 60, note: "named biological subparts" },
};

/** constructCreature(design): { id, family: mascot|quadruped|macro, species: str, parts:[{...F59 part, class, subpart?}], pattern?: [...F02 markings on a part], colors, farShade: role } */
function constructCreature__impl(design) {
  need("F07 creature", design, { id: "str", family: Object.keys(REQUIRED), species: "str", parts: "arr", farShift: "num" });
  const R = REQUIRED[design.family];
  for (const p of design.parts) {
    need(`F07 part ${p.id}`, p, { class: "str" });
    if (design.family === "macro" && !p.subpart) throw new Error(`F07 macro ${design.id}: part ${p.id} must name its biological subpart (detail by named anatomy, never texture)`);
  }
  const classes = new Set(design.parts.map((p) => p.class));
  const missing = R.classes.filter((c) => !classes.has(c)); if (missing.length) throw new Error(`F07 ${design.family} ${design.species}: species part graph lacks ${missing.join(", ")} (${R.note})`);
  if (design.parts.length > R.max) throw new Error(`F07 ${design.family}: ${design.parts.length} parts exceed the family's purposeful-part budget ${R.max}`);
  // far limbs: drawn behind their parent and in the far-plane role (value-shifted), near limbs in front — differentiated, not duplicated
  const parts = design.parts.map((p) => /_far$/.test(p.class) ? { ...p, front: false, fillRole: p.farRole || p.fillRole } : /_near$/.test(p.class) ? { ...p, front: true } : p);
  for (const p of design.parts.filter((p) => /_far$/.test(p.class))) if (!p.farRole) throw new Error(`F07 ${design.id}: far limb ${p.id} needs a far-plane role (near/far limbs must be differentiated)`);
  const asm = assemble({ id: design.id, parts, order: design.order, colors: design.colors, distinguishes: design.distinguishes });
  const pattern = (design.pattern || []).map((pt) => {
    need(`F07 pattern`, pt, { part: "str", forms: "arr", material: "str" });
    const parentEl = asm.elements.find((e) => e.id === `${design.id}.${pt.part}`); if (!parentEl) throw new Error(`F07 pattern: part ${pt.part} not constructed`);
    return constructSurface({ owner: `${design.id}.${pt.part}`, parent: parentEl, material: pt.material, colors: design.materialColors[pt.part], light: design.light, transition_policy: "HARD_BOUNDARY", forms: pt.forms });
  });
  return { method: ["F07", "F59"], elements: [...asm.elements, ...pattern.flatMap((s) => s.elements.filter((e) => !/\.base$/.test(e.id)))], data: { ...asm.data, species: design.species, family: design.family } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const routeFamily = registerProducer("family.routeFamily", routeFamily__impl);
export const constructCreature = registerProducer("family.constructCreature", constructCreature__impl);
