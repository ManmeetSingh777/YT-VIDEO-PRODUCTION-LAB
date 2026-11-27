#!/usr/bin/env node
// Director-authorized design amendment (2026-11-27, directive "COMPLETE COMPONENT MANUFACTURING AND ACTUAL MOTION", decision 1):
// complete the derived-view/state method declarations of the three prop designs from the authoritative skill (F14 state table added from its
// verbatim source clause; existing F01/F59/F62 (+F75 report, +F13/F63 phone) marked applies_to_states). Artwork is untouched. Writes a
// backup and an AMENDMENT_RECORD per design; the design approval must be re-signed (its receipt is bound to the design hash).
//   node tools/tbo/e01_amend_prop_states.mjs --film films/e01 --backup <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const { bundleHash } = await import(url.pathToFileURL(path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..", "engine", "art_bridge", "approvals.mjs")));
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), BK = path.resolve(arg("backup")), SRC = J(path.join(REPO, "engine", "methods", "source", "F_SOURCE.json"));
const F14 = { // state tables (recorded in the amendment record; F14 itself is not applicable to these subjects per method_applicability)
  ART_P01: { states: [["front (canonical)", "no (approved master)", "yes: master registration", "rigid lift/lower/placement; counter contact shadow"], ["back", "yes", "yes: plinth contact edge + both handle axes", "plain back face of the plaque, plinth back"], ["edge", "yes", "yes: base + handle axes", "plaque thickness and side grip surfaces (recessed grips per director decision 3)"], ["near/far grip", "no: deterministic masks from approved hand parts + this prop", "yes", "hand-over-handle occlusion"], ["contact shadow", "own part (F62 owner)", "yes: base contact line", "counter-receiver shadow only while supported"]],
    out: ["ART_P01.alternate_views (back, edge)", "ART_P01.body", "ART_P01.contact_mask", "ART_P01.contact_shadow"] },
  ART_P02: { states: [["front (canonical, typed)", "no: native vector page + live type (amendment 04)", "yes: page corners", "rigid handover, insert and lowering"], ["back", "yes", "yes: page corners", "unprinted reverse"], ["edge", "yes", "yes: grip edges", "thin sheet edge during the turn"], ["near/far grip", "no: deterministic masks", "yes", "thumb front, fingers behind"], ["contact shadow", "own part (F62 owner)", "yes", "only on support"]],
    out: ["ART_P02.alternate_views (back, edge)", "ART_P02.body (vector)", "ART_TXT01.report_native (type)", "ART_P02.contact_mask", "ART_P02.contact_shadow"] },
  ART_P03: { states: [["front (canonical, screen side)", "no (approved master)", "yes", "rigid lift/aim/lower; screen stays opaque (no reveal)"], ["back", "yes", "yes: LENS + lens_axis measured on this view", "rear lens island, deferred landmarks resolved here"], ["edge", "yes", "yes: grip axis", "side frame and shutter control surface"], ["near/far grip", "no: deterministic masks", "yes", "side/back finger support"], ["contact shadow", "own part (F62 owner)", "yes", "only on support"]],
    out: ["ART_P03.alternate_views (back, edge)", "ART_P03.body", "ART_P03.contact_mask", "ART_P03.contact_shadow"] } };
const MARK = { ART_P01: ["F01", "F59", "F62"], ART_P02: ["F01", "F59", "F62", "F75"], ART_P03: ["F01", "F59", "F62", "F13", "F63"] }, out = [];
fs.mkdirSync(BK, { recursive: true });
for (const [prop, t] of Object.entries(F14)) {
  const f = path.join(FILM, "art_designs", `${prop}.MASTER.design.json`), before = fs.readFileSync(f); fs.writeFileSync(path.join(BK, `${prop}.MASTER.design.before_prop_states.json`), before);
  const d = JSON.parse(before), ev = d.method_decisions[0].applicability_evidence, marked = [];
  for (const m of d.method_decisions) if (MARK[prop].includes(m.method_id) && m.applies_to_states !== true) { m.applies_to_states = true; marked.push(m.method_id); }
  const after = Buffer.from(JSON.stringify(d, null, 1)); fs.writeFileSync(f, after);
  // the pre-generation audit is bound to the design hash: rebind with an explicit delta (scoping flags only; no decision text, method set or
  // artwork changed). The director's design re-signature remains the authority over the amended design.
  const af = path.join(FILM, "art_designs", `${prop}.MASTER.pregen_audit.json`), audit = J(af), abefore = fs.readFileSync(af); fs.writeFileSync(path.join(BK, `${prop}.MASTER.pregen_audit.before_prop_states.json`), abefore);
  const delta = { date: "2026-11-27", authority: "director decision 1 (derived-view/state declarations)", audit_before_sha256: sha(abefore), from_design_sha256: audit.design_sha256, to_design_bundle_sha256: bundleHash(d), to_design_file_sha256: sha(after), delta: `applies_to_states=true on ${marked.join(", ")}; no decision text, method set or artwork changed`, passes_unchanged: true };
  audit.design_sha256 = bundleHash(d); fs.writeFileSync(af, JSON.stringify(audit, null, 1)); fs.writeFileSync(path.join(FILM, "art_designs", `${prop}.MASTER.pregen_audit.REBIND_RECORD.json`), JSON.stringify(delta, null, 1));
  const rec = { state_table: t.states, asset: `${prop}.MASTER`, date: "2026-11-27", by: "Claude Code at the director's explicit authorization (decision 1)", reason: "derived-view/state method declarations were missing (12 jobs BLOCKED_COMPILE)", added: [], marked_applies_to_states: marked, artwork_changed: false, before: { design_file_sha256: sha(before) }, after: { design_file_sha256: sha(after) }, consequence: "design approval must be re-signed (receipt bound to the design hash)" };
  fs.writeFileSync(path.join(FILM, "art_designs", `${prop}.MASTER.STATES_AMENDMENT_RECORD.json`), JSON.stringify(rec, null, 1)); out.push(rec);
}
console.log(JSON.stringify(out, null, 1));
