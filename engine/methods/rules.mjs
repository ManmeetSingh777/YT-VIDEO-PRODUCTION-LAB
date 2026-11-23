// L0 — SourceRule registry (spec §2.1). Built from the VERBATIM F_SOURCE.json text:
//   positiveObligations ← Build / Procedure / Operation / Create / Construct / Deliver / Method / numbered & bulleted steps
//   forbiddenOutputs    ← Wrong output / Forbidden / Failure / Fail if / Reject / Never / Do not / Anti-rule
//   contrasts           ← Counterexample / Countercondition / Exception / unlike-source references (FILM@t)
// The class comes from the execution spec §3 table. appliesWhen is an executable PredicateAST (all/any/not + typed leaves), never prose.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const here = path.dirname(url.fileURLToPath(import.meta.url));
export const SRC = JSON.parse(fs.readFileSync(path.join(here, "source", "F_SOURCE.json"), "utf8"));

// spec §3 classes (primary class; "Art/state" etc. keep the art obligation primary and list the secondary)
export const CLASS = {
  F01: "ART_DESIGN", F02: "ART_DESIGN", F03: "ART_DESIGN", F04: "ART_DESIGN", F05: "ART_DESIGN", F06: "ART_DESIGN", F07: "ART_DESIGN", F08: "ART_DESIGN", F09: "ART_DESIGN", F10: "ART_DESIGN",
  F11: "ART_DESIGN", F12: "ART_DESIGN", F13: "ART_DESIGN", F14: "MOTION_STATE", F15: "MOTION_STATE", F16: "MOTION_STATE", F17: "EVIDENCE_GATE", F18: "EVIDENCE_GATE", F19: "ROUTING", F20: "ROUTING",
  F21: "ART_DESIGN", F22: "ART_DESIGN", F23: "ART_DESIGN", F24: "ART_DESIGN", F25: "ART_DESIGN", F26: "ART_DESIGN", F27: "ART_DESIGN", F28: "ART_DESIGN", F29: "MOTION_STATE", F30: "ART_DESIGN",
  F31: "MOTION_STATE", F32: "ART_DESIGN", F33: "ART_DESIGN", F34: "ROUTING", F35: "MOTION_STATE", F36: "EVIDENCE_GATE", F37: "ROUTING", F38: "GEOMETRY", F39: "ART_DESIGN", F40: "ART_DESIGN",
  F41: "ART_DESIGN", F42: "ART_DESIGN", F43: "ART_DESIGN", F44: "ART_DESIGN", F45: "ART_DESIGN", F46: "ART_DESIGN", F47: "ART_DESIGN", F48: "ART_DESIGN", F49: "EVIDENCE_GATE", F50: "EVIDENCE_GATE",
  F51: "ART_DESIGN", F52: "ART_DESIGN", F53: "ART_DESIGN", F54: "GEOMETRY", F55: "ROUTING", F56: "EVIDENCE_GATE", F57: "ROUTING", F58: "ART_DESIGN", F59: "GEOMETRY", F60: "GEOMETRY",
  F61: "ART_DESIGN", F62: "ART_DESIGN", F63: "ART_DESIGN", F64: "ROUTING", F65: "ART_DESIGN", F66: "ART_DESIGN", F67: "MOTION_STATE", F68: "ART_DESIGN", F69: "ART_DESIGN", F70: "GEOMETRY",
  F71: "ART_DESIGN", F72: "ART_DESIGN", F73: "ART_DESIGN", F74: "ART_DESIGN", F75: "ART_DESIGN", F76: "GEOMETRY", F77: "ART_DESIGN", F78: "MOTION_STATE", F79: "GEOMETRY", F80: "EVIDENCE_GATE",
};
export const SECONDARY = { F22: "MOTION_STATE", F30: "MOTION_STATE", F32: "MOTION_STATE", F37: "ART_DESIGN", F48: "MOTION_STATE", F53: "ROUTING", F55: "ART_DESIGN", F64: "ART_DESIGN", F70: "ART_DESIGN", F77: "MOTION_STATE", F79: "MOTION_STATE", F80: "ART_DESIGN" };

// PredicateAST leaves: {family:[...]}, {kind:[...]}, {view:[...]}, {pxAtFinalScale:{gte?,lt?}}, {material:[...]}, {effect:[...]},
// {causalRole:[...]}, {world:[...]}, {has:"field"}, {always:true}; composites {all:[...]}, {any:[...]}, {not:X}
const K = (...k) => ({ kind: k }), W = (...w) => ({ world: w }), H = (f) => ({ has: f }), any = (...a) => ({ any: a }), ALWAYS = { always: true };
export const APPLIES = {
  F01: K("character", "creature", "machine", "object", "plant", "structure"), F02: ALWAYS, F03: ALWAYS, F04: ALWAYS,
  F05: { all: [K("character"), { family: ["HUMAN_ACTING_CLOSE", "HUMAN_GESTURE_FULL", "HUMAN_REAR_OCCLUDED"] }] }, F06: { all: [K("character"), { family: ["HUMAN_ACTING_CLOSE", "HUMAN_GESTURE_FULL", "HUMAN_REAR_OCCLUDED"] }] },
  F07: { all: [K("creature"), { family: ["MASCOT_SIMPLE", "ANIMAL_OR_MACRO_BIO"] }] }, F08: W("SCENIC_BUILT", "SCENIC_INTERIOR"), F09: K("machine"), F10: W("SCENIC_INTERIOR"),
  F11: W("SCENIC_NATURAL"), F12: W("BIOLOGICAL_MICRO", "SCHEMATIC_NETWORK"), F13: { effect: ["optical", "emissive", "ribbon", "portal", "galaxy"] }, F14: H("states"), F15: H("motion"), F16: H("transition"),
  F17: ALWAYS, F18: H("sourceObservation"), F19: ALWAYS, F20: H("beat"), F21: { effect: ["portal", "screen", "glass_shell"] }, F22: H("timeOfDayStates"), F23: { effect: ["perception"] }, F24: W("BIOLOGICAL_MICRO", "SCHEMATIC_NETWORK", "COSMIC_SCALE"),
  F25: { causalRole: ["exchange"] }, F26: W("MAP"), F27: W("SCHEMATIC_NETWORK"), F28: { all: [K("machine"), H("historicalPeriod")] }, F29: H("comparison"), F30: { all: [K("character", "creature"), H("motion")] },
  F31: H("motion"), F32: { effect: ["emission", "particles", "exposure", "perception"] }, F33: ALWAYS, F34: ALWAYS, F35: H("transition"), F36: H("beat"), F37: H("world"), F38: H("world"),
  F39: W("SCENIC_NATURAL"), F40: W("SCENIC_BUILT"), F41: W("BIOLOGICAL_MICRO"), F42: W("ABSTRACT_STAGE"), F43: W("ABSTRACT_VOLUME", "SCHEMATIC_NETWORK"), F44: { effect: ["luminous_volume"] }, F45: any(K("machine"), W("SCENIC_INTERIOR")), F46: ALWAYS,
  F47: ALWAYS, F48: { effect: ["nested_world"] }, F49: H("world"), F50: H("transferClaim"), F51: ALWAYS, F52: { all: [K("character", "creature"), { pxAtFinalScale: { gte: 1 } }] }, F53: ALWAYS, F54: H("repeats"),
  F55: ALWAYS, F56: H("firstPass"), F57: ALWAYS, F58: K("character", "creature", "machine", "object", "plant", "structure"), F59: H("parts"), F60: H("world"), F61: ALWAYS, F62: ALWAYS,
  F63: { effect: ["optical", "emissive", "glass", "glow", "blur"] }, F64: K("character", "creature"), F65: { all: [K("character", "creature"), H("faceVisibleOrHidden")] }, F66: { all: [K("character"), H("pose")] }, F67: { all: [K("character", "creature"), H("motion")] }, F68: K("machine"), F69: W("SCENIC_NATURAL"), F70: W("SCENIC_BUILT", "SCENIC_INTERIOR"),
  F71: W("BIOLOGICAL_MICRO"), F72: { all: [W("BIOLOGICAL_MICRO", "MACRO"), { effect: ["lens"] }] }, F73: W("COSMIC_SCALE"), F74: W("SCHEMATIC_NETWORK", "ABSTRACT_STAGE", "ABSTRACT_VOLUME"), F75: H("labels"), F76: H("repeats"), F77: ALWAYS, F78: H("transition"), F79: H("motion"), F80: H("firstPass"),
};

/** evaluate a PredicateAST against a context (never eval) */
export function applies(ast, cx) {
  if (ast.always) return true;
  if (ast.all) return ast.all.every((a) => applies(a, cx));
  if (ast.any) return ast.any.some((a) => applies(a, cx));
  if (ast.not) return !applies(ast.not, cx);
  if (ast.kind) return ast.kind.includes(cx.kind);
  if (ast.family) return ast.family.includes(cx.family);
  if (ast.world) return ast.world.includes(cx.world);
  if (ast.view) return ast.view.includes(cx.view);
  if (ast.material) return (cx.materials || []).some((m) => ast.material.includes(m));
  if (ast.effect) return (cx.effects || []).some((m) => ast.effect.includes(m));
  if (ast.causalRole) return ast.causalRole.includes(cx.causalRole);
  if (ast.pxAtFinalScale) { const v = cx.pxAtFinalScale ?? 0; return (ast.pxAtFinalScale.gte === undefined || v >= ast.pxAtFinalScale.gte) && (ast.pxAtFinalScale.lt === undefined || v < ast.pxAtFinalScale.lt); }
  if (ast.has) return cx[ast.has] !== undefined && cx[ast.has] !== false;
  throw new Error(`PredicateAST: unknown node ${JSON.stringify(ast)}`);
}

const POS = /^(\*\*)?(Build|Procedure|Operation|Create|Construct|Construction|Deliver|Method|Input|Control|Part generator|Population generator|Construction algorithm|Face construction|Inside|External connections|Four illumination|Detail-selection|Three-tier|Two stage|Classes|Scale hierarchy|Shading\/edge|Before drawing|Before light|Test|Check|Pass check|Pass|Style invariant)/i;
const NEG = /(Wrong output|Forbidden|Failure|Fail if|Reject|Never |Do not |Don't |Anti-rule|Avoid |must not|cannot )/;
const CON = /(Counterexample|Countercondition|Exception|counter|unlike|Not invariant|Unknown:|exception)/i;

/** split a method text into clause sentences and classify each */
export function classifyClauses(text) {
  const lines = text.split("\n").slice(1).map((l) => l.trim()).filter(Boolean);
  const pos = [], neg = [], con = [], evidence = [];
  let section = "";
  for (const l of lines) {
    const head = l.match(/^\*\*([^*]+)\*\*/); if (head) section = head[1];
    const clause = l.replace(/^[-*\d.|\s]+/, "").trim(); if (!clause || /^---/.test(clause)) continue;
    if (/^\*\*Evidence/.test(l) || /^\| *(Role|Component|Family|Visual demand|State|Unlike|Required field)/.test(l)) evidence.push(clause);
    const isNeg = NEG.test(clause), isCon = CON.test(clause) || /Countercondition|Counterexample|Exception/i.test(section);
    const body = clause.replace(/^\*\*[^*]+\*\*:?\s*/, "").trim();
    if (isCon) con.push(clause);
    if (isNeg) neg.push(clause);
    const positiveMarker = POS.test(l) || /^\d+\./.test(l) || /^[-*] /.test(l) || /^\|/.test(l) || /Build|Procedure|Operation|Deliver|Construct|Create|Method|Inside|Classes|algorithm/i.test(section);
    const pureNegative = /^(\*\*)?(Wrong output|Forbidden|Failure|Fail if|Reject)/i.test(l);
    if (positiveMarker && !pureNegative && !/:\*\*\s*$/.test(clause) && body.length > 12 && !/^\|?\s*-{3}/.test(body)) pos.push(clause);
  }
  if (!pos.length) for (const l of lines) { const b = l.replace(/^\*\*[^*]+\*\*:?\s*/, "").trim(); if (b.length > 40 && !/^\*\*Evidence/.test(l) && !/^(\*\*)?(Wrong output|Forbidden|Failure)/i.test(l)) pos.push(b); } // prose-only methods (F18, F56): every instruction sentence is an obligation
  return { positiveObligations: pos, forbiddenOutputs: neg, contrasts: con, evidenceLines: evidence };
}
const WITNESS = /\b(AI|BRAIN|MEMORIES|NUCLEAR|SOLAR|VOLCANO)@[\d.,–\-]+s?/g;

export function buildSourceRules() {
  const out = {};
  for (const [id, s] of Object.entries(SRC)) {
    const c = classifyClauses(s.text), witnesses = [...new Set(s.text.match(WITNESS) || [])];
    out[id] = { id, title: s.text.split("\n")[0].replace(/^## /, ""), sourcePath: s.file, sourceSpan: [s.startLine, s.endLine], sha256: s.sha256, class: CLASS[id], secondaryClass: SECONDARY[id] || null, appliesWhen: APPLIES[id],
      positiveObligations: c.positiveObligations, forbiddenOutputs: c.forbiddenOutputs, contrasts: c.contrasts, sourceWitnessRefs: witnesses,
      noCopyBoundary: "Witnesses are STYLE-ONLY evidence; no source character, prop, background, composition or story may be copied.",
      obligationHash: crypto.createHash("sha256").update(JSON.stringify([c.positiveObligations, c.forbiddenOutputs])).digest("hex").slice(0, 16) };
  }
  return out;
}
