// Typed design contracts (spec §2.1): DesignDecision, VisualSubjectPlan, review records. Fail-closed on UNRESOLVED.
// A DesignDecision is the ONLY way an identity-defining value enters a producer. It names its origin honestly:
//   SOURCE_OBSERVATION (seen in a native witness), SUBJECT_FACT (physical/functional truth of the subject), DIRECTION_REQUIREMENT
//   (what the shot must prove), ORIGINAL_DESIGN_HYPOTHESIS (Claude's authored art choice — never attributed to the source).
import fs from "node:fs"; import crypto from "node:crypto";
import { need } from "./core.mjs";
import { SRC } from "./rules.mjs";

export const ORIGINS = ["SOURCE_OBSERVATION", "SUBJECT_FACT", "DIRECTION_REQUIREMENT", "ORIGINAL_DESIGN_HYPOTHESIS"];
const DECISIONS = new Map(); // id → decision (per process); producers resolve values only through get()

export class DesignUnresolved extends Error { constructor(ids) { super(`DESIGN_UNRESOLVED: ${ids.join(", ")} — fix the design stage; no default may fill it`); this.unresolved = ids; } }

/** decide({...}) — record a decision. Source hashes are looked up from F_SOURCE, never typed. */
export function decide(d) {
  need("DesignDecision", d, { id: "str", methodId: "str", origin: ORIGINS, applicableBecause: "str", subjectReason: "str", rejectedAlternatives: "arr", ownerIds: "arr", expectedPixelEffect: "obj", status: ["RESOLVED", "UNRESOLVED"] });
  if (!SRC[d.methodId]) throw new Error(`DesignDecision ${d.id}: unknown method ${d.methodId}`);
  if (d.status === "RESOLVED" && d.value === undefined) throw new Error(`DesignDecision ${d.id}: RESOLVED without a value`);
  if (d.origin === "ORIGINAL_DESIGN_HYPOTHESIS" && !d.rejectedAlternatives.length) throw new Error(`DesignDecision ${d.id}: an original design choice must record the alternatives it rejected`);
  if (d.origin === "SOURCE_OBSERVATION" && !d.witness) throw new Error(`DesignDecision ${d.id}: SOURCE_OBSERVATION needs the witness id that was viewed`);
  need(`DesignDecision ${d.id} effect`, d.expectedPixelEffect, { regionIds: "arr", type: "str" });
  if (DECISIONS.has(d.id)) throw new Error(`DesignDecision ${d.id} already recorded`);
  const rec = Object.freeze({ ...d, sourceRuleHashes: [SRC[d.methodId].sha256.slice(0, 16)], recordedAt: new Date().toISOString() });
  DECISIONS.set(d.id, rec);
  return rec;
}
/** value of a resolved decision (throws DesignUnresolved instead of ever substituting a default) */
export function get(id) { const d = DECISIONS.get(id); if (!d) throw new DesignUnresolved([`${id} (never decided)`]); if (d.status !== "RESOLVED") throw new DesignUnresolved([id]); return d.value; }
export function requireResolved(ids) { const bad = ids.filter((i) => !DECISIONS.has(i) || DECISIONS.get(i).status !== "RESOLVED"); if (bad.length) throw new DesignUnresolved(bad); }
export const decisions = () => [...DECISIONS.values()];
export const resetDecisions = () => DECISIONS.clear();

/** a visual review of a REAL rendered file: hash must match the file now on disk (no review of an image that was later changed) */
export function review(r) {
  need("Review", r, { file: "str", verdict: ["ACCEPT", "REJECT", "ACCEPT_WITH_DEFECTS"], reviewer: "str", observations: "arr" });
  if (!fs.existsSync(r.file)) throw new Error(`Review: ${r.file} does not exist`);
  const h = crypto.createHash("sha256").update(fs.readFileSync(r.file)).digest("hex");
  if (r.sha256 && r.sha256 !== h) throw new Error(`Review: ${r.file} changed since it was reviewed (hash mismatch)`);
  return Object.freeze({ ...r, sha256: h });
}
export const fileHash = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
