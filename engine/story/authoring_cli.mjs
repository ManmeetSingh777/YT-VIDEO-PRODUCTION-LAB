#!/usr/bin/env node
// Operator CLI of the script authoring handoff (P04 §2.1). Nothing here authors direction and nothing here approves it.
//   export  --film DIR --script FILE --director FILE --out DIR [--research F1,F2] [--style FILE]
//   import  --film DIR --request REQUEST_DIR --bundle RETURNED_DIR   verifies the seal + script revision, validates, stores an UNACCEPTED proposal
//   accept  --film DIR --proposal DIR                                compiles ONLY a proposal with a verified approval receipt (review_sign.mjs)
import path from "node:path"; import url from "node:url";
import { exportAuthoringRequest, importAuthoringProposal, proposalApprovalStatus, compileAccepted } from "./authoring_handoff.mjs";
export function main(a = process.argv.slice(2), out = console.log) {
  const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; }, need = (...ks) => { const miss = ks.filter((k) => !get(k)); if (miss.length) throw new Error(`missing ${miss.join(", ")}`); }, cmd = a[0];
  if (cmd === "export") { need("--film", "--script", "--director", "--out"); const r = exportAuthoringRequest({ film: get("--film"), script: get("--script"), directorSpec: get("--director"), out: get("--out"), research: (get("--research") || "").split(",").filter(Boolean), channelStyle: get("--style") }); out(JSON.stringify({ handoff_id: r.handoff_id, bundle_dir: r.bundle_dir })); return 0; }
  if (cmd === "import") { need("--film", "--request", "--bundle"); const r = importAuthoringProposal({ film: get("--film"), bundle: get("--bundle"), requestDir: get("--request") }); out(JSON.stringify({ proposal_id: r.proposal_id, dir: r.dir, decisions: r.decisions, semantic_actions: r.semantic_actions, accepted: false })); return 0; }
  if (cmd === "accept") { need("--film", "--proposal"); const s = proposalApprovalStatus(get("--film"), get("--proposal")); if (!s.ok) { out(JSON.stringify({ status: "REFUSED", reason: s.reason })); return 3; } out(JSON.stringify(compileAccepted({ film: get("--film"), proposalDir: get("--proposal") }))); return 0; }
  out("usage: authoring_cli.mjs export|import|accept (see the header of this file)"); return 2;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) { try { process.exit(main()); } catch (e) { console.error(`${e.code || "ERROR"}: ${e.human_readable_reason || e.message}`); process.exit(1); } }
