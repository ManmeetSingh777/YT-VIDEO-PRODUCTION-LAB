#!/usr/bin/env node
// Scoped design amendment: add view/pose states that an accepted packet amendment introduced to a design's declared state family (character design
// + the state-family method decision), rebind the pre-generation audit to the amended design with a delta record, and keep a backup. Nothing
// else changes; the design approval must be re-signed (receipt bound to the design hash).
//   node tools/tbo/e01_amend_design_states.mjs --film films/e01 --asset MIA_MASTER --add a,b --reason "<authority>" --backup <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const { bundleHash } = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/approvals.mjs")));
const FILM = path.resolve(REPO, arg("film")), A = arg("asset"), add = arg("add").split(",").filter(Boolean), BK = path.resolve(arg("backup")), df = path.join(FILM, "art_designs", `${A}.design.json`), af = path.join(FILM, "art_designs", `${A}.pregen_audit.json`);
fs.mkdirSync(BK, { recursive: true }); const before = fs.readFileSync(df), abefore = fs.readFileSync(af); fs.writeFileSync(path.join(BK, `${A}.design.before.json`), before); fs.writeFileSync(path.join(BK, `${A}.pregen_audit.before.json`), abefore);
const d = JSON.parse(before), touched = [];
const lists = [d.first_pass_control?.character_designs?.[0], ...(d.method_decisions || []).filter((m) => Array.isArray(m.structured_decision?.state_family)).map((m) => m.structured_decision)].filter((x) => Array.isArray(x?.state_family));
for (const l of lists) for (const s of add) if (!l.state_family.includes(s)) { l.state_family.push(s); touched.push(s); }
const after = Buffer.from(JSON.stringify(d, null, 1)); fs.writeFileSync(df, after);
const audit = JSON.parse(abefore), delta = { date: new Date().toISOString().slice(0, 10), authority: arg("reason"), audit_before_sha256: sha(abefore), from_design_sha256: audit.design_sha256, to_design_bundle_sha256: bundleHash(d), delta: `state_family += ${add.join(", ")} (${lists.length} declarations); no decision text, method set or artwork changed`, passes_unchanged: true };
audit.design_sha256 = bundleHash(d); fs.writeFileSync(af, JSON.stringify(audit, null, 1)); fs.writeFileSync(path.join(FILM, "art_designs", `${A}.pregen_audit.REBIND_RECORD.${Date.now()}.json`), JSON.stringify(delta, null, 1));
console.log(JSON.stringify({ asset: A, added: add, declarations: lists.length, design_before: sha(before), design_after: sha(after) }, null, 1));
