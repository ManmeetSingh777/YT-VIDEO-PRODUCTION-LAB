// Versioned, complete method delivery (directive F1.5 / F028 / F050). Replaces the 32k "packing" workaround (hash strings, SAME AS
// pointers, dropped grounding). Every applicable AUTHORED method travels with its FULL operative source instruction and its complete
// design decision in the provider stage whose pixels it governs. When one request cannot hold them, the work is partitioned into ORDERED,
// content-addressed stages — structure creation, then source-attached surface edits, then state edits — each naming its predecessor.
// Stage A (the contract decision brief) is the canonical immutable payload: every required method's operative text + decision + evidence.
// Nothing is truncated; a single method block that cannot fit one stage is REQUEST_BUDGET_EXCEEDED (fail closed, exact numbers).
import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { operativeText, operativeSha, title, SOURCE } from "./method_applicability.mjs";
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
export const PROVIDER_PROMPT_LIMIT = 32000;
// Stages are FILLED to at most this many characters (headroom under the provider maximum); a single method block that only fits between the
// target and the maximum still gets a stage of its own. Refusal stays at the provider maximum; nothing is ever truncated.
export const STAGE_PACKING_TARGET = 30000;
const ORDER = { STRUCTURE: 0, SURFACE: 1, STATE: 2 };
// engine/review consumers that EXECUTE the non-pixel methods (their consumer receipts are written by those producers)
export const ENGINE_CONSUMERS = {
  F15: "engine/art_bridge/temporal.mjs#compileMotionTracks", F16: "engine/art_bridge/transitions.mjs#compileTransition", F17: "engine/tools/art_bridge_qa.mjs#runQA", F18: "engine/tools/art_bridge_qa.mjs#runQA",
  F19: "engine/art_bridge/art_requests.mjs#routeMedium", F20: "engine/art_bridge/source_method_causality.mjs#routeBeatMedia", F31: "engine/art_bridge/temporal.mjs#compileMotionTracks", F35: "engine/art_bridge/transitions.mjs#compileTransition",
  F36: "engine/art_bridge/art_contract.mjs#preGenerationGate", F49: "engine/art_bridge/source_method_causality.mjs#compileWorldSystem", F50: "engine/art_bridge/source_method_causality.mjs#unfamiliarTransferPlan", F55: "engine/art_bridge/source_method_causality.mjs#cameraSizedArtworkDemand",
  F56: "engine/art_bridge/repair_memory.mjs#selectRules", F77: "engine/art_bridge/source_method_causality.mjs#allocateDetail", F78: "engine/art_bridge/transitions.mjs#compileTransition", F79: "engine/art_bridge/art_intake.mjs#validatePlanContract", F80: "engine/art_bridge/art_requests.mjs#compileArtJob",
};

const decisionBlock = (d) => [
  `Specific decision: ${d.specific_decision}`, `Visible construction operation: ${d.visible_construction_operation}`, `Inputs it depends on: ${[].concat(d.input_dependencies).join("; ")}`,
  `Output art components: ${[].concat(d.output_art_components).join("; ")}`, `Falsified if: ${d.falsification_condition}`, `Source witness regions (STYLE ONLY): ${(d.source_witness_pixel_regions || []).map((r) => `${r.witness.split("/").pop()} [${r.region_px.join(",")}] — ${r.observation}`).join(" | ")}`,
  `Unlike witness contrast: ${d.unlike_witness_contrast}`].join("\n");
export const methodBlock = (id, d) => `### ${title(id)}\nSOURCE OPERATIVE INSTRUCTION (verbatim, sha256 ${operativeSha(id)}):\n${operativeText(id)}\n\nTHIS SUBJECT'S DECISION:\n${decisionBlock(d)}\n`;

/** planStages({design, gate, header, derived, footer}) → {brief, stages[], delivery}. header = the skill's validated identity/control block
 *  (repeated in EVERY stage so no edit drifts from the identity); footer = motion requirements + output + negative tests. */
export function planStages({ design, gate, header, footer, derived = false, limit = PROVIDER_PROMPT_LIMIT, pack = STAGE_PACKING_TARGET, record_id = null }) {
  const fill = Math.min(pack, limit);
  const byId = new Map((design.method_decisions || []).map((d) => [d.method_id, d])), req = gate.required_methods;
  const authored = req.filter((r) => ORDER[r.phase] !== undefined).filter((r) => (derived ? r.phase === "STATE" || byId.get(r.method)?.applies_to_states === true : r.phase !== "STATE"));
  authored.sort((a, b) => ORDER[a.phase] - ORDER[b.phase] || a.method.localeCompare(b.method));
  const blocks = authored.map((r) => ({ method: r.method, phase: r.phase, text: methodBlock(r.method, byId.get(r.method)) }));
  const fixed = header.length + footer.length + 600; // stage banner + predecessor line
  const stages = []; let cur = null;
  for (const b of blocks) {
    if (fixed + b.text.length > limit) throw err("REQUEST_BUDGET_EXCEEDED", { record_id, reason: `method ${b.method} block (${b.text.length} chars) + identity header (${header.length}) + footer (${footer.length}) exceeds the provider limit ${limit} on its own`, producer: "engine/art_bridge/request_stages.mjs#planStages", failed_invariant: "every applicable method is delivered in full; nothing is truncated", repair_owner: "HUMAN_ART_DIRECTOR", resume_at: "ART_DESIGN_COMPILATION", required_art_or_operation: [`shorten the identity control block or the ${b.method} decision`] });
    if (!cur || cur.phase !== b.phase || fixed + cur.size + b.text.length > fill) { cur = { phase: b.phase, blocks: [], size: 0 }; stages.push(cur); }
    cur.blocks.push(b); cur.size += b.text.length;
  }
  // Stage A: the complete contract decision brief (all required methods, including engine-executed ones, with their consumers)
  const brief = [`# CONTRACT DECISION BRIEF — ${design.job_id} (${gate.family})`, `Required methods (${req.length}) with source applicability:`, ...req.map((r) => `- ${r.method} [${r.phase}] ${r.reason}`), "",
    ...req.map((r) => (byId.get(r.method) ? methodBlock(r.method, byId.get(r.method)) : `### ${title(r.method)}\nSOURCE OPERATIVE INSTRUCTION (verbatim, sha256 ${operativeSha(r.method)}):\n${operativeText(r.method)}\n\nEXECUTED BY ENGINE CONSUMER: ${ENGINE_CONSUMERS[r.method] || "(none registered)"}\n`)),
    "## Construction topics", JSON.stringify(design.construction_topics || {}, null, 1), "## Art/motion agreement", JSON.stringify(design.art_motion_agreement || {}, null, 1), "## Motion requirements (requirements, never coordinates)", JSON.stringify(design.motion_requirements || {}, null, 1)].join("\n");
  const briefSha = sha(brief); let prev = briefSha;
  const out = stages.map((s, i) => {
    const mode = derived ? "EDIT_APPROVED_MASTER" : i === 0 ? "GENERATE" : "EDIT_PREVIOUS_STAGE";
    const banner = `STAGE ${i + 1} OF ${stages.length} — ${s.phase} — ${mode === "GENERATE" ? "create the canonical artwork" : mode === "EDIT_APPROVED_MASTER" ? "edit the attached APPROVED master; preserve identity and every pixel outside the state change" : "edit the attached output of the previous stage; preserve everything earlier stages established"}.\nContract brief sha256 ${briefSha}; predecessor ${prev}.\n`;
    const prompt = `${header}\n${banner}\n## METHODS EXECUTED IN THIS STAGE (complete)\n${s.blocks.map((b) => b.text).join("\n")}\n${footer}`;
    if (prompt.length > limit) throw err("REQUEST_BUDGET_EXCEEDED", { record_id, reason: `stage ${i + 1} is ${prompt.length} > ${limit}`, producer: "engine/art_bridge/request_stages.mjs#planStages" });
    const st = { index: i + 1, phase: s.phase, mode, methods: s.blocks.map((b) => b.method), predecessor_sha256: prev, prompt, prompt_sha256: sha(prompt), characters: prompt.length }; prev = st.prompt_sha256; return st;
  });
  const delivery = req.map((r) => { const st = out.find((s) => s.methods.includes(r.method)); return st ? { method_id: r.method, phase: r.phase, delivered: "FULL_OPERATIVE_TEXT_AND_DECISION", stage: st.index, operative_sha256: operativeSha(r.method), source_clause_sha256: SOURCE[r.method].sha256 }
    : ORDER[r.phase] !== undefined ? { method_id: r.method, phase: r.phase, delivered: derived ? "IN_MASTER_STAGES" : "IN_STATE_EDIT_STAGES", stage: null, operative_sha256: operativeSha(r.method) }
    : { method_id: r.method, phase: r.phase, delivered: "BRIEF_AND_ENGINE_CONSUMER", consumer: ENGINE_CONSUMERS[r.method] || null, operative_sha256: operativeSha(r.method) }; });
  const unconsumed = delivery.filter((d) => d.delivered === "BRIEF_AND_ENGINE_CONSUMER" && !d.consumer);
  if (unconsumed.length) throw err("METHOD_NO_REAL_CONSUMER", { record_id, reason: `engine-phase methods without a registered consumer: ${unconsumed.map((d) => d.method_id)}`, producer: "engine/art_bridge/request_stages.mjs#planStages" });
  return { brief, brief_sha256: briefSha, stages: out, delivery };
}
