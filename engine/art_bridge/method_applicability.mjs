// F01–F80 applicability and operative delivery (system-correction directive E1/F1). For EVERY method: its role, an executable
// applicability predicate over subjectFacts (with the reason, both when required and when not applicable), the construction PHASE in
// which its operation acts (which request stage must carry its full operative instruction), and the operative text extracted from the
// verbatim source (engine/methods/source/F_SOURCE.json). Nothing here is a universal ID list: a method is required only when its
// predicate holds for this subject, and every not-applicable result names the unmet condition.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const SOURCE = JSON.parse(fs.readFileSync(path.join(REPO, "engine", "methods", "source", "F_SOURCE.json"), "utf8"));
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");

/** operative instruction = the method's construction text with source-evidence citations removed (they are evidence, not instructions).
 *  Kept: Input, Procedure/Build, Trigger, branches, forbidden cases, Deliver. The operative text is hashed and delivered verbatim. */
export function operativeText(id) {
  const t = SOURCE[id]?.text; if (!t) throw new Error(`unknown method ${id}`);
  return t.split("\n").slice(1).join("\n").split(/\n\n+/).filter((p) => !/^\*\*(Evidence|Evidence contrast|Evidence of failure|Data-vs-observation boundary)[^*]*:\*\*/.test(p.trim())).join("\n\n").trim();
}
export const operativeSha = (id) => sha(operativeText(id));
export const title = (id) => SOURCE[id].text.split("\n")[0].replace(/^## /, "");

// phases: STRUCTURE (canonical creation: silhouette/topology/face/body/world geometry), SURFACE (colour/edge/light/material pass),
// STATE (source-attached state edits), ENGINE (executed by the bridge/engine, evidenced by consumer receipts), REVIEW (evidence/repair gates)
const A = "IMAGE_AUTHORSHIP", S = "STRUCTURE", M = "MOTION", D = "DIRECTION", E = "EVIDENCE", R = "REPAIR";
const any = (...k) => (f) => k.some((x) => (typeof x === "function" ? x(f) : !!f[x]));
const notFam = (...fams) => (f) => !fams.includes(f.family);
const always = () => true;
// [role, phase, predicate, condition text]
export const RULES = {
  F01: [A, "STRUCTURE", notFam("EFFECT_OR_MATERIAL", "TRANSITION_OR_CAMERA_PLATE"), "subject has a drawn physical silhouette"],
  F02: [A, "SURFACE", always, "every illustrated surface is built from owned colour regions"],
  F03: [A, "SURFACE", always, "every new image needs conditional colour roles"],
  F04: [A, "SURFACE", notFam("TYPOGRAPHY_OR_SYMBOL"), "lit surfaces need a lighting system choice"],
  F05: [A, "STRUCTURE", (f) => f.human && f.has_face, "a human face is visible"],
  F06: [A, "STRUCTURE", (f) => f.human && (f.contacts.length > 0 || f.articulated), "a human body acts, locomotes or contacts"],
  F07: [A, "STRUCTURE", (f) => f.organism, "an animal/mascot/organism is constructed"],
  F08: [A, "STRUCTURE", (f) => f.built, "architecture / built structure is present"],
  F09: [A, "STRUCTURE", (f) => f.machine, "a machine or functional apparatus is present"],
  F10: [A, "STRUCTURE", (f) => f.world, "a complete space with foreground/background integration"],
  F11: [A, "STRUCTURE", (f) => f.natural, "landscape/plant/environmental density is present"],
  F12: [A, "STRUCTURE", (f) => f.micro, "a dense biological network is present"],
  F13: [A, "SURFACE", any("optical_materials", "luminous_volume"), "luminous, optical or complex materials are present"],
  F14: [M, "STATE", (f) => f.states.length > 1, "the subject has alternate states"],
  F15: [M, "ENGINE", (f) => f.motion, "the subject is owned by motion tracks"],
  F16: [M, "ENGINE", (f) => f.transitions, "a transition involves the subject's shots"],
  F17: [E, "REVIEW", always, "every artwork needs whole-look / provider-control proof"],
  F18: [E, "REVIEW", always, "every frame is observed, not decoded"],
  F19: [D, "ENGINE", always, "medium and timing are routed per subject"],
  F20: [D, "ENGINE", always, "each beat is routed to a medium"],
  F21: [A, "STRUCTURE", (f) => f.portal, "a panel/glass shell/memory window acts as an optical machine"],
  F22: [A, "STATE", (f) => f.time_of_day, "day/night states are redrawn"],
  F23: [A, "SURFACE", (f) => f.perception, "perception effects are registered compositing passes"],
  F24: [A, "STRUCTURE", (f) => f.population && (f.micro || f.organism), "a dense biological field is present"],
  F25: [A, "STRUCTURE", (f) => f.scientific_interaction, "a scientific close-up shows physical interaction direction"],
  F26: [A, "STRUCTURE", (f) => f.map, "a map or spatial diagram is present"],
  F27: [A, "STRUCTURE", (f) => f.schematic, "a schematic graph with reveal states is present"],
  F28: [A, "STRUCTURE", (f) => f.era_specific, "a historical/technical recreation is present"],
  F29: [M, "STATE", (f) => f.comparison, "futures/options are compared as parallel states"],
  F30: [M, "STATE", (f) => (f.human || f.organism) && f.states.length > 1, "a character/organism needs a multi-state library"],
  F31: [M, "ENGINE", (f) => f.motion, "motion keys are owner-specific"],
  F32: [A, "SURFACE", (f) => f.effects, "time-bounded effects are present"],
  F33: [D, "STRUCTURE", always, "density/abstraction is scoped by view depth and task"],
  F34: [D, "STRUCTURE", any("world", "repeats", "natural"), "geography/patterns/materials need different generators"],
  F35: [M, "ENGINE", (f) => f.transitions, "storyboard transitions carry one conserved invariant"],
  F36: [D, "REVIEW", always, "source-to-new-script decisions compile into enforceable artifacts"],
  F37: [A, "STRUCTURE", (f) => f.world, "a world definition is required"],
  F38: [A, "STRUCTURE", (f) => f.world || f.depth_planes > 1 || f.repeats || f.built, "depth, scale levels, repeats or floating planes need a projection grammar"],
  F39: [A, "STRUCTURE", (f) => f.natural && f.world, "a living natural environment is built"],
  F40: [A, "STRUCTURE", (f) => f.world && f.built && f.repeats, "a dense architectural/ecological world with modular parts"],
  F41: [A, "STRUCTURE", (f) => f.micro && f.world, "a biological micro-world is built"],
  F42: [A, "STRUCTURE", (f) => f.family === "ABSTRACT_OR_MICRO_WORLD" && !f.micro, "an abstract stage with legible coordinates"],
  F43: [A, "STRUCTURE", (f) => f.diagram, "an information theatre is built"],
  F44: [A, "STRUCTURE", (f) => f.luminous_volume, "a luminous volume is present"],
  F45: [A, "STRUCTURE", (f) => f.machine, "machines/corridors by functional topology"],
  // F46/F47 triggers are scene/environment scoped ("any detailed environment, especially a world"; a per-material table for a scene) and the
  // installed skill compiles F37–F50 only with a world_system — characters get material/edge ownership from F02/F62 and detail from F33/F52
  F46: [A, "SURFACE", any("world", "built", "natural", "micro"), "a scene/environment needs material-owned edges, fills and luminance"],
  F47: [D, "STRUCTURE", any("world", "built", "natural", "micro"), "a detailed environment spends detail by semantic role and distance"],
  F48: [A, "STRUCTURE", (f) => f.nested_world || f.portal, "a world within a world is shown"],
  F49: [E, "ENGINE", (f) => f.world, "world construction data compiles into an enforceable ArtJob"],
  F50: [E, "REVIEW", (f) => f.world, "unfamiliar-world transfer tests"],
  F51: [A, "SURFACE", always, "palette is a system of roles and region ownership"],
  F52: [A, "STRUCTURE", notFam("EFFECT_OR_MATERIAL", "TRANSITION_OR_CAMERA_PLATE"), "scale and role determine facial/structural mark count"],
  F53: [D, "STRUCTURE", always, "density is caused by explanatory material"],
  F54: [S, "STRUCTURE", (f) => f.repeats, "repeated shapes need a parent-owned generator"],
  F55: [D, "ENGINE", (f) => f.world || f.camera_moves, "projection and camera-sized artwork follow the idea"],
  F56: [R, "REVIEW", always, "prompts execute as geometry; first pixels are inspected"],
  F57: [D, "STRUCTURE", (f) => f.causal || f.world || f.diagram, "a visible causal proof is required"],
  F58: [A, "STRUCTURE", notFam("EFFECT_OR_MATERIAL", "TRANSITION_OR_CAMERA_PLATE"), "silhouette is constructed before interior polish"],
  F59: [S, "STRUCTURE", (f) => f.parts || f.articulated, "parts join and occlude in a deliberate topology"],
  F60: [S, "STRUCTURE", (f) => f.world || f.depth_planes > 1 || f.built, "projection is chosen from the proof and all planes obey it"],
  F61: [A, "SURFACE", always, "conditional palette roles"],
  F62: [A, "SURFACE", always, "edges and shadows have owners"],
  F63: [A, "SURFACE", any("optical_materials", "effects", "luminous_volume", "portal"), "reflection/transparency/blur/glow stays inside physical optics"],
  F64: [A, "STRUCTURE", (f) => f.human || f.organism, "human/mascot/animal identity routed by illustration family"],
  F65: [A, "STRUCTURE", (f) => f.has_face, "eye/mouth construction depends on role and crop"],
  F66: [A, "STRUCTURE", (f) => f.human && (f.contacts.length > 0 || f.states.length > 1), "body acting needs weight, garment volumes and contact states"],
  F67: [M, "STATE", (f) => (f.human || f.organism || f.machine) && f.states.length > 1, "pose/expression/mechanism states form a registered family"],
  F68: [A, "STRUCTURE", (f) => f.machine, "machines are part-defined functional volumes"],
  F69: [A, "STRUCTURE", (f) => f.natural && f.world, "landscapes are coverage substrates"],
  F70: [A, "STRUCTURE", (f) => f.built && f.world, "built worlds use coherent projection and semantic repetition"],
  F71: [A, "STRUCTURE", (f) => f.micro, "dense microscopic biology is a connected graph"],
  F72: [A, "STRUCTURE", (f) => f.macro_lens, "macro organisms and lenses are distinct coordinate systems"],
  F73: [A, "STRUCTURE", (f) => f.cosmic, "cosmic/scale worlds depend on physical meaning"],
  F74: [A, "STRUCTURE", (f) => f.diagram || f.family === "ABSTRACT_OR_MICRO_WORLD", "abstract information worlds need a representational grammar"],
  F75: [A, "STRUCTURE", (f) => f.labels || f.diagram || f.typography, "typography and glyphs are illustration parts"],
  F76: [S, "STRUCTURE", (f) => f.repeats, "repeats come from a locally defined parent generator"],
  F77: [M, "ENGINE", (f) => f.motion || f.diagram, "information density is allocated locally and to motion owners"],
  F78: [M, "ENGINE", (f) => f.transitions || f.camera_moves, "camera/representational transitions obey a correspondence invariant"],
  F79: [S, "ENGINE", (f) => f.alpha !== "OPAQUE" || f.parts || f.depth_planes > 1 || f.overscan || f.camera_moves, "alpha, underpaint, parallax and offscreen budget are owned"],
  F80: [R, "REVIEW", always, "the first provider request contains the methods and unlike native pixels"],
};
if (Object.keys(RULES).length !== 80) throw new Error("method_applicability: all 80 methods must have a rule");

/** applicability(facts) → 80 rows {method, role, phase, required, reason}; reasons are stated for required AND not-applicable results */
export function applicability(facts) {
  return Object.entries(RULES).map(([method, [role, phase, when, cond]]) => { const required = !!when(facts); return { method, role, phase, required, reason: required ? `${cond} (family ${facts.family})` : `not applicable: condition "${cond}" does not hold for family ${facts.family}` }; });
}
/** methods whose operation shapes PIXELS produced by the provider (delivered in full in the stage that creates those pixels) */
export const PROVIDER_PHASES = ["STRUCTURE", "SURFACE", "STATE"];
