// Better One PRODUCTION_QUALITY_GATE_REGISTRY enforcer (docs/the-better-one/PRODUCTION_QUALITY_GATE_REGISTRY.json).
// The registry is normative; this module binds every gate to the code that PRODUCES its evidence, the code that CONSUMES it at runtime, the
// regression tests that exercise it (positive + negative, matched by test title in a TAP log) and the external input it still waits for.
// evaluateQualityGates() COMPUTES each status — nothing is hand-set:
//   FAILED                  any bound test failed in the supplied TAP
//   NOT_TESTED              no bound test ran (or the gate has no producer yet) — never an implicit pass
//   BLOCKED_EXTERNAL        mechanism tests pass, but the gate's proof needs real external inputs (GPT art, human receipt, voice, host, film)
//   VERIFIED_WITH_EVIDENCE  only from a PRODUCTION evidence record carrying every registry field (fixed SHA, producer, consumer, hashes,
//                           frame scope, test id, negative result, verified human receipt when required). Diagnostic evidence never qualifies.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { err } from "../art_bridge/errors.mjs";

const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
export const REGISTRY_FILE = path.join(REPO, "docs", "the-better-one", "PRODUCTION_QUALITY_GATE_REGISTRY.json");
const R = (s) => new RegExp(s);
/** gate → real producers/consumers (file#function), bound test titles (regex over TAP names) and what is still external */
export const GATE_BINDINGS = Object.freeze({
  "TBO-G01": { producers: ["engine/story/creative_packet.mjs#validatePacket (CLAIM_TRUTH_UNVERIFIED)", "engine/story/mechanism.mjs#validateStoryContract", "engine/story/hybrid_contract.mjs#hybridPreflight (claims F/R/M/H/X)"], consumers: ["engine/production/stages.mjs S01 story_contract"], tests: [R("^T04 "), R("^HYBRID_CONTRACT negatives")], external: "GPT/user claim ledger, model card and payoff proof for E01" },
  "TBO-G02": { producers: ["engine/story/creative_packet.mjs#validatePacket (12-part shot contract)"], consumers: ["engine/production/stages.mjs S01/S02 approvals"], tests: [R("^P05-A3 "), R("^P02-R23 S01 ")], external: "Value Blueprint, screenplay, audio-first animatic and human review", human: true },
  "TBO-G03": { producers: ["engine/story/direction_consequence.mjs", "engine/story/creative_preflight.mjs#creativePreflight"], consumers: ["engine/art_bridge/temporal.mjs#compileMotionTracks", "engine/production/stages.mjs direction_decisions"], tests: [R("^P06-C1 "), R("^P04-2\\.2[a-e]? "), R("^P05-B1 "), R("^P05-E5 "), R("^T07 ")], external: "approved E01 CREATIVE_PACKET 1.1.0 + HYBRID_CONTRACT" },
  "TBO-G04": { producers: ["engine/art_bridge/art_demand.mjs", "engine/story/creative_preflight.mjs (MISSING_ART_REQUIREMENT)"], consumers: ["engine/tools/art_outbox.mjs export"], tests: [R("^P06-A1 "), R("^P05-D2 "), R("^P04-3\\.[23] "), R("^H1 demands"), R("^M15 ")], external: "approved E01 action graph" },
  "TBO-G05": { producers: ["engine/art_bridge/method_applicability.mjs", "engine/art_bridge/source_method_causality.mjs", "engine/art_bridge/gpt_handoff.mjs"], consumers: ["engine/tools/art_outbox.mjs export-gpt-job"], tests: [R("^A05 "), R("^S3C-[1-6] "), R("^P02-R26 ")], external: "real ChatGPT F01–F80 images with local witnesses + human method review", human: true },
  "TBO-G06": { producers: ["engine/art_bridge/art_intake.mjs ingest-master/ingest-part (identity hash)", "engine/art_bridge/approvals.mjs"], consumers: ["engine/art_bridge/asset_registry.mjs"], tests: [R("^P0-3 "), R("^P0-4 "), R("^M06 ")], external: "approved Mia master + source-attached derived states", human: true },
  "TBO-G07": { producers: ["engine/art_bridge/art_intake.mjs (alpha/crop/hash/provenance)"], consumers: ["engine/art_bridge/asset_registry.mjs#createAssetRegistry"], tests: [R("^H1 planned alpha"), R("^R08 "), R("^hash mismatch")], external: "real GPT PNG/SVG bytes" },
  "TBO-G08": { producers: ["engine/art_bridge/registration.mjs#registerPart", "engine/art_bridge/registration_evidence.mjs"], consumers: ["engine/art_bridge/scene_graph.mjs (rest recomposition)"], tests: [R("^B1-[a-e] "), R("^B2-[a-d] "), R("^H2 "), R("^missing underpaint")], external: "reviewed landmark sidecars on real art" },
  "TBO-G09": { producers: ["engine/production/post_art_feedback.mjs#postArtFeasibility"], consumers: ["engine/production/stages.mjs S06 feasibility_*"], tests: [R("^P06-S2 "), R("^P04-4\\.1/4\\.2 "), R("^M10 "), R("^P05-E1 "), R("^P05-E2 ")], external: "measured real art" },
  "TBO-G10": { producers: ["engine/art_bridge/acting.mjs#compileActing", "engine/art_bridge/temporal.mjs"], consumers: ["engine/film/chrome_frames.mjs"], tests: [R("^P06-Q1 "), R("^P06-N1 "), R("^P06-R1 "), R("^A1 acting"), R("^A2 negatives"), R("^D[123] "), R("^F5 ")], external: "real art + human continuous-playback review", human: true },
  "TBO-G11": { producers: ["engine/art_bridge/contact_solver.mjs#gripMorphology", "engine/art_bridge/scene_graph.mjs (finger layers)"], consumers: ["engine/film/semantic_qa.mjs hand_closed_and_in_contact"], tests: [R("^P06-N1 "), R("^P06-R1 "), R("^F1 grip"), R("^P04-5\\.3[bc]? "), R("^M03 "), R("^grip and plant")], external: "approved HAND drawings (open/closed, near/far fingers)" },
  "TBO-G12": { producers: ["engine/art_bridge/state_router.mjs#validateStateEdge", "engine/art_bridge/execution.mjs#deformAt/morphAt"], consumers: ["engine/art_bridge/scene_graph.mjs"], tests: [R("^P06-N2 "), R("^P06-P1 "), R("^M06 "), R("^M07b? "), R("^E[123] "), R("^P04-5\\.5 ")], external: "approved alternate views/cels/deform maps" },
  "TBO-G13": { producers: ["engine/art_bridge/scene_graph.mjs#validateFootprint"], consumers: ["engine/production/stages.mjs framing"], tests: [R("^camera footprint"), R("^B1-d "), R("^P04-5\\.7b? ")], external: "approved restaurant world planes with overscan" },
  "TBO-G14": { producers: ["engine/host3d/blender_host_passes.py", "engine/host3d/host_pass.mjs#compileHostPasses"], consumers: ["engine/art_bridge/scene_graph.mjs#composeShot (host passes)", "engine/host3d/host_pass.mjs#verifyHostComposite"], tests: [R("^TBO-G14 ")], external: "HOST_3D_ASSET_PENDING: approved original Blender host (mesh, rig, face keys, performance)", human: true },
  "TBO-G15": { producers: ["engine/decoder/model_card.mjs#evaluateModel", "engine/decoder/model_bar.mjs#compileModelBars"], consumers: ["engine/art_bridge/temporal.mjs proceduralAt", "engine/decoder/decoder_qa.mjs#verifyModelBarFrames"], tests: [R("^P06 decoder"), R("^TBO-G15 ")], external: "approved E01 model card + decoder SYMBOL art" },
  "TBO-G16": { producers: ["engine/film/coverage_gate.mjs", "engine/film/chrome_frames.mjs (isolated owner capture)"], consumers: ["engine/production/stages.mjs S08 coverage_gate"], tests: [R("^P06-R1 "), R("^G1 owner gate"), R("^P02-R06 "), R("^P05-E12 "), R("^P04-7\\.5 ")], external: "real film frames" },
  "TBO-G17": { producers: ["engine/film/audio_mix.mjs#mixBuses/publishFinal"], consumers: ["engine/production/stages.mjs S09 audio_mix/final_mux"], tests: [R("^P06-N2 "), R("^H1 audio buses"), R("^P04-7\\.7 "), R("^P05 render negatives")], external: "NEEDS_RECORDED_VOICE: recorded dialogue, aligned words, SFX, music" },
  "TBO-G18": { producers: ["engine/film/final_review.mjs", "engine/art_bridge/reviewer_auth.mjs"], consumers: ["engine/production/stages.mjs S09 film_review"], tests: [R("^P04-7\\.7b "), R("^B3-[236] "), R("^P02-R16 ")], external: "human watch of the exact final MP4 with a signed receipt", human: true },
  "TBO-G19": { producers: ["engine/film/film_revision.mjs", "engine/production/ledger.mjs"], consumers: ["engine/tools/production_run.mjs resume/verify"], tests: [R("^P03 any upstream"), R("^P02-R08 "), R("^P04-7\\.8b? "), R("^P02-R15[a-d] "), R("^P05-K2 ")], external: null },
  "TBO-G20": { producers: [], consumers: [], tests: [], external: "accepted real E01 8–10 s segments, 90–120 s hybrid proof and film ledger (no producer yet: REAL_FOOTAGE_LEDGER is manual)", human: true },
});

/** parseTap(text) → Map(title → "ok" | "not ok") for every top-level and nested test line */
export function parseTap(text) {
  const m = new Map(); for (const line of text.split(/\r?\n/)) { const x = /^\s*(not ok|ok) \d+ - (.+?)(?: # .*)?$/.exec(line); if (x) { const prev = m.get(x[2]); m.set(x[2], prev === "not ok" ? "not ok" : x[1]); } } return m;
}
const REQUIRED = ["fixed_source_sha", "producer_function", "consumer_function", "input_hashes", "artifact_hashes", "frame_range_or_film_scope", "test_id", "negative_test_result"];

/**
 * evaluateQualityGates({tapText, sourceSha, productionEvidence:[records]}) → {gates:[...], summary}
 * A production record = {gate_id, provenance:"PRODUCTION", ...REQUIRED, human_receipt?: {verified:true, verifier:"engine/art_bridge/approvals.mjs", receipt_sha256}}
 */
export function evaluateQualityGates({ tapText = "", sourceSha = null, productionEvidence = [], registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8")) } = {}) {
  const tap = parseTap(tapText), humanGates = new Set(registry.release_policy.human_approval_required_for), out = [];
  for (const g of registry.gates) {
    const b = GATE_BINDINGS[g.id]; if (!b) throw err("QUALITY_GATE_UNPROVEN", { record_id: g.id, reason: "registry gate has no binding", producer: "engine/production/quality_gates.mjs" });
    const ran = [...tap].filter(([t]) => b.tests.some((r) => r.test(t))), failed = ran.filter(([, s]) => s === "not ok").map(([t]) => t), passed = ran.filter(([, s]) => s === "ok").map(([t]) => t);
    const prod = productionEvidence.filter((e) => e.gate_id === g.id), reasons = [];
    let status, verifiedBy = null;
    const valid = prod.filter((e) => { const miss = REQUIRED.filter((k) => e[k] === undefined || e[k] === null || (Array.isArray(e[k]) && !e[k].length)); if (e.provenance !== "PRODUCTION") reasons.push(`evidence ${e.test_id ?? "?"} is ${e.provenance}, not PRODUCTION`); else if (miss.length) reasons.push(`evidence ${e.test_id ?? "?"} lacks ${miss.join(", ")}`); else if (sourceSha && e.fixed_source_sha !== sourceSha) reasons.push(`evidence ${e.test_id} is for source ${e.fixed_source_sha}, not ${sourceSha}`); else if (e.negative_test_result !== "DETECTED") reasons.push(`evidence ${e.test_id} negative control was not detected`); else if (humanGates.has(g.id) && !(e.human_receipt?.verified === true && e.human_receipt?.verifier === "engine/art_bridge/approvals.mjs" && e.human_receipt?.receipt_sha256)) reasons.push(`evidence ${e.test_id} has no verified human receipt (${g.id} cannot self-certify)`); else return true; return false; });
    if (failed.length) status = "FAILED";
    else if (valid.length) { status = "VERIFIED_WITH_EVIDENCE"; verifiedBy = valid.map((e) => e.test_id); }
    else if (!b.producers.length || !passed.length) status = "NOT_TESTED";
    else status = b.external ? "BLOCKED_EXTERNAL" : "NOT_TESTED";
    if (status === "NOT_TESTED" && passed.length && !b.external) reasons.push("mechanism tests pass, but no PRODUCTION evidence record exists for the real film");
    out.push({ id: g.id, phase: g.phase, owner: g.owner, failure_code: g.failure_code, status, human_required: humanGates.has(g.id), producers: b.producers, consumers: b.consumers, mechanism_tests_passed: passed, mechanism_tests_failed: failed, diagnostic_only: !valid.length, external_dependency: b.external, verified_by: verifiedBy, reasons });
  }
  // P06 §6.14 vocabulary: VERIFIED_CODE | VERIFIED_REAL_ART | NEEDS_EXTERNAL_ART | NEEDS_HUMAN | FAILED | NOT_APPLICABLE_WITH_REASON (one primary status,
  // plus the release blockers that remain). No green by assertion: a gate with no executed passing test can never be VERIFIED_CODE.
  for (const x of out) { const blockers = [...(x.external_dependency ? ["NEEDS_EXTERNAL_ART"] : []), ...(x.human_required ? ["NEEDS_HUMAN"] : [])];
    x.p06_status = x.status === "FAILED" ? "FAILED" : x.status === "VERIFIED_WITH_EVIDENCE" ? "VERIFIED_REAL_ART" : x.mechanism_tests_passed.length && x.producers.length ? "VERIFIED_CODE" : x.external_dependency ? (x.human_required && !x.producers.length ? "NEEDS_HUMAN" : "NEEDS_EXTERNAL_ART") : "FAILED";
    x.p06_release_blockers = x.p06_status === "VERIFIED_REAL_ART" ? [] : blockers; if (x.p06_status === "FAILED" && !x.mechanism_tests_failed.length) x.reasons.push("no executed passing test binds this gate"); }
  const summary = Object.fromEntries(registry.release_policy.status_enum.map((s) => [s, out.filter((x) => x.status === s).length]));
  const p06_summary = Object.fromEntries(["VERIFIED_CODE", "VERIFIED_REAL_ART", "NEEDS_EXTERNAL_ART", "NEEDS_HUMAN", "FAILED", "NOT_APPLICABLE_WITH_REASON"].map((s) => [s, out.filter((x) => x.p06_status === s).length]));
  return { registry_version: registry.schema_version, source_sha: sourceSha, implicit_pass: false, gates: out, summary, p06_summary };
}
