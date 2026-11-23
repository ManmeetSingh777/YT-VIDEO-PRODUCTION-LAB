// F01–F80 consumer trace (spec §4 step 5, §11.6). Classification is by the method's role in the HYBRID architecture: GPT authors visible
// art (IMAGE_AUTHORSHIP → consumed by the ArtJob compiler), the engine owns structure/motion/compositing, direction/evidence/repair govern.
// The consumer is verified by importing the module and checking the export is a function. The verdict is COMPUTED from evidence files;
// "METHOD_IMPLEMENTED" can never be set by hand and is never inferred from an empty gaps array.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { err } from "./errors.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), ROOT = path.resolve(here, "..", "..");
const SRC = JSON.parse(fs.readFileSync(path.join(ROOT, "engine", "methods", "source", "F_SOURCE.json"), "utf8"));

const A = "IMAGE_AUTHORSHIP", S = "STRUCTURE", M = "MOTION", D = "DIRECTION", E = "EVIDENCE", R = "REPAIR";
const ART = "engine/art_bridge/art_requests.mjs#compileArtJob";
// [class, consumer "module#export", applicability condition (evaluated against the film context by applies())]
export const TRACE_TABLE = {
  F01: [A, ART, "kind!=EFFECT"], F02: [A, ART, "always"], F03: [A, ART, "always"], F04: [A, ART, "always"], F05: [A, ART, "kind==CHARACTER"], F06: [S, "engine/art_bridge/temporal.mjs#stateAtFrame", "kind==CHARACTER"],
  F07: [A, ART, "family in MASCOT,ANIMAL"], F08: [A, ART, "world in BUILT,INTERIOR"], F09: [A, ART, "kind==MACHINE"], F10: [A, ART, "world==INTERIOR"], F11: [A, ART, "world==NATURAL"], F12: [A, ART, "world in MICRO,NETWORK"],
  F13: [A, ART, "effects"], F14: [M, "engine/art_bridge/state_router.mjs#validateStateEdge", "states"], F15: [M, "engine/art_bridge/temporal.mjs#compileMotionTracks", "motion"], F16: [M, "engine/art_bridge/transitions.mjs#compileTransition", "transitions"],
  F17: [E, "engine/tools/art_bridge_qa.mjs#runQA", "always"], F18: [E, "engine/art_bridge/coverage.mjs#computeCoverage", "always"], F19: [D, "engine/art_bridge/art_requests.mjs#routeMedium", "always"], F20: [D, "engine/art_bridge/art_requests.mjs#routeMedium", "beats"],
  F21: [A, ART, "portal"], F22: [A, ART, "timeOfDayStates"], F23: [A, ART, "perception"], F24: [A, ART, "population"], F25: [A, ART, "exchange"], F26: [A, ART, "map"], F27: [A, ART, "schematic"], F28: [A, ART, "historicalMachine"],
  F29: [M, "engine/art_bridge/state_router.mjs#validateStateEdge", "comparison"], F30: [M, "engine/art_bridge/temporal.mjs#stateAtFrame", "kind==CHARACTER"], F31: [M, "engine/art_bridge/temporal.mjs#stateAtFrame", "motion"], F32: [A, ART, "effects"],
  F33: [D, "engine/art_bridge/art_requests.mjs#compileArtJob", "always"], F34: [D, "engine/art_bridge/art_requests.mjs#routeMedium", "always"], F35: [M, "engine/art_bridge/transitions.mjs#compileTransition", "transitions"], F36: [D, "engine/art_bridge/art_requests.mjs#compileArtJob", "beats"],
  F37: [D, "engine/art_bridge/scene_graph.mjs#composeShot", "world"], F38: [S, "engine/art_bridge/scene_graph.mjs#composeShot", "world"], F39: [A, ART, "world==NATURAL"], F40: [A, ART, "world==BUILT"], F41: [A, ART, "world==MICRO"], F42: [A, ART, "abstractStage"],
  F43: [A, ART, "infoTheatre"], F44: [A, ART, "luminousVolume"], F45: [A, ART, "kind==MACHINE"], F46: [A, ART, "always"], F47: [D, ART, "always"], F48: [A, ART, "portal"], F49: [E, "engine/tools/art_bridge_check.mjs#runCheck", "world"], F50: [E, "engine/tools/art_bridge_qa.mjs#runQA", "transferClaim"],
  F51: [A, ART, "always"], F52: [A, ART, "kind==CHARACTER"], F53: [D, "engine/art_bridge/scene_graph.mjs#composeShot", "always"], F54: [S, "engine/art_bridge/scene_graph.mjs#composeShot", "repeats"], F55: [D, "engine/art_bridge/art_requests.mjs#routeMedium", "always"], F56: [R, "engine/art_bridge/art_requests.mjs#compileArtJob", "firstPass"],
  F57: [D, "engine/art_bridge/scene_graph.mjs#composeShot", "always"], F58: [A, ART, "kind!=EFFECT"], F59: [S, "engine/art_bridge/graph.mjs#buildGraphs", "parts"], F60: [S, "engine/art_bridge/scene_graph.mjs#composeShot", "world"], F61: [A, ART, "always"], F62: [A, ART, "always"],
  F63: [A, ART, "effects"], F64: [A, ART, "kind==CHARACTER"], F65: [A, ART, "kind==CHARACTER"], F66: [A, ART, "kind==CHARACTER"], F67: [M, "engine/art_bridge/state_router.mjs#validateStateEdge", "kind==CHARACTER"], F68: [A, ART, "kind==MACHINE"],
  F69: [A, ART, "world==NATURAL"], F70: [A, ART, "world==BUILT"], F71: [A, ART, "world==MICRO"], F72: [A, ART, "macroLens"], F73: [A, ART, "cosmic"], F74: [A, ART, "schematic"], F75: [A, ART, "labels"], F76: [A, ART, "repeats"],
  F77: [M, "engine/art_bridge/scene_graph.mjs#composeShot", "motion"], F78: [M, "engine/art_bridge/transitions.mjs#compileTransition", "transitions"], F79: [S, "engine/art_bridge/load_manifest.mjs#loadManifest", "motion"], F80: [R, "engine/art_bridge/art_requests.mjs#compileArtJob", "firstPass"],
};

const CAUSAL_F = path.join(ROOT, "hybrid_v2", "evidence", "system_correction", "SOURCE_TO_ART_F01_F80.json"), CAUSAL = fs.existsSync(CAUSAL_F) ? JSON.parse(fs.readFileSync(CAUSAL_F, "utf8")) : null;
/** consumerExists - SMOKE check only (module loads, export is a function); it can never qualify a method */
async function consumerExists(spec) {
  const [mod, exp] = spec.split("#"), file = path.join(ROOT, mod);
  if (!fs.existsSync(file)) return { ok: false, why: `module ${mod} not implemented` };
  try { const m = await import(url.pathToFileURL(file)); return typeof m[exp] === "function" ? { ok: true } : { ok: false, why: `export ${exp} is not a function in ${mod}` }; }
  catch (e) { return { ok: false, why: `import failed: ${e.message.slice(0, 120)}` }; }
}

/** buildMethodTrace({evidence}) — evidence = {proofs: {consumerId: [{fixture, perturbed:true, changed:true, passed}]}, providerPixels: {methodId: [hash...]}} */
export async function buildMethodTrace(evidence = {}) {
  const out = [];
  for (let i = 1; i <= 80; i++) {
    const id = `F${String(i).padStart(2, "0")}`, [cls, consumer, condition] = TRACE_TABLE[id], src = SRC[id];
    // per-METHOD evidence when supplied (a proof counts only if it perturbed a decision this method governs); consumer-wide proofs otherwise
    const pool = evidence.methodProofs ? (evidence.methodProofs[id] || []) : (evidence.proofs?.[consumer] || []);
    const c = await consumerExists(consumer), proofs = pool.filter((p) => p.perturbed && p.changed && p.passed);
    // directive F1.6 / F049: export existence is SMOKE evidence only; the level comes from the executed causal matrix
    // (source_method_causality.test.mjs -> SOURCE_TO_ART_F01_F80.json); REAL_ARTISTIC_FIDELITY needs provider pixels + human review.
    const causal = CAUSAL?.rows?.find((r) => r.method_id === id) || null;
    let verdict;
    if (!c.ok) verdict = "NO_CONSUMER_YET";
    else if (!causal) verdict = "EXPORT_EXISTS_ONLY_SMOKE";
    else if (cls === A) verdict = (evidence.providerPixels?.[id] || []).length ? "ART_PIXELS_PRESENT_REVIEW_PENDING" : "PENDING_PROVIDER_PIXELS";
    else if (evidence.pending?.[id]) verdict = evidence.pending[id].verdict;
    else verdict = proofs.length ? "CONSUMER_PROVED_MECHANICALLY" : "CONSUMER_PRESENT_PROOF_PENDING";
    const ev = evidence.byConsumer?.[consumer] || {};
    out.push({ method_id: id, title: src.text.split("\n")[0].replace(/^## /, ""), source_clause_id: `${src.file}:${src.startLine}-${src.endLine}`, source_sha256: src.sha256, class: cls, condition_evaluated: condition, consumer_id: consumer, consumer_status: c.ok ? "LIVE" : c.why,
      decision_id: ev.decision_ids || [], producer_or_request_id: cls === A ? (evidence.requests?.[id] || []) : [], causal_perturbation_fixture_ids: proofs.map((p) => p.fixture), observed_render_frame_paths: ev.frames || [], real_asset_hash_or_track_hash: evidence.providerPixels?.[id] || [],
      artistic_status: cls === A ? "BLOCKED_NO_PROVIDER_PIXELS" : "PENDING_REAL_ART_REVIEW", pending_reason: evidence.pending?.[id]?.reason || null, verdict, evidence_levels: { export_exists: c.ok, decision_changed_execution: causal ? causal.causal : null, real_artistic_fidelity: "EXTERNAL_PROVIDER_BLOCKED" }, qualified: false });
  }
  return out;
}

/** a self-declared "uses" record must point at a LIVE consumer registered for that method; otherwise METHOD_NO_REAL_CONSUMER */
export async function checkMethodUses(uses = []) {
  const errors = [];
  for (const u of uses) {
    const row = TRACE_TABLE[u.method_id];
    if (!u.consumer_id || !row || u.consumer_id !== row[1]) { errors.push(err("METHOD_NO_REAL_CONSUMER", { record_id: u.record_id, dependency: u.method_id, reason: `method ${u.method_id} declared as used by ${u.record_id} but ${u.consumer_id ? `consumer ${u.consumer_id} is not the registered consumer` : "no executable consumer is named"}` })); continue; }
    const c = await consumerExists(u.consumer_id); if (!c.ok) errors.push(err("METHOD_NO_REAL_CONSUMER", { record_id: u.record_id, dependency: u.method_id, reason: c.why }));
  }
  return errors;
}
