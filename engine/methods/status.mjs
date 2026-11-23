// Computes Stage-1 status from evidence (never declared): REGISTRY × PROOFS.json × knowledge rules × F_SOURCE.
// Writes engine/methods/evidence/STATUS.json and STATUS.md.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { REGISTRY } from "./registry.mjs";
import { RULES, ARTISTIC_DERIVATIONS } from "./knowledge.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "evidence");
const P = JSON.parse(fs.readFileSync(path.join(EV, "PROOFS.json"), "utf8")), SRC = JSON.parse(fs.readFileSync(path.join(here, "source", "F_SOURCE.json"), "utf8"));
const rows = [];
for (let i = 1; i <= 80; i++) {
  const id = `F${String(i).padStart(2, "0")}`, r = REGISTRY[id]; if (!r) { rows.push({ id, mechanical: "MISSING", artistic: "MISSING", status: "INCOMPLETE" }); continue; }
  const proofs = r.proofs.map((n) => P[n]), mechOk = r.code.length > 0 && proofs.length > 0 && proofs.every((p) => p && p.pass);
  const rules = (r.rules || []).filter((k) => RULES[k]), derivs = [...(r.derivations || []), ...(ARTISTIC_DERIVATIONS[id] ? [ARTISTIC_DERIVATIONS[id]] : [])];
  const artisticRefusals = proofs.flatMap((p) => (p?.refuses || []).filter((x) => /ARTISTIC/.test(x.why) && x.refused)).length;
  const hasKnowledge = rules.length + derivs.length > 0;
  const mechanical = mechOk ? "PROVED" : r.code.length ? "UNPROVED" : "MISSING";
  const artistic = r.purpose !== "CONSTRUCTION" ? (r.gaps.length ? "PURPOSE_PARTIAL" : "PURPOSE_ENCODED") : !hasKnowledge ? "NOT_ENCODED" : r.gaps.length ? "PARTIAL" : "ENCODED";
  const status = mechanical === "PROVED" && (artistic === "ENCODED" || artistic === "PURPOSE_ENCODED") && r.gaps.length === 0 ? "IMPLEMENTED" : "INCOMPLETE";
  rows.push({ id, title: SRC[id].text.split("\n")[0].replace(/^## /, ""), purpose: r.purpose, code: r.code, proofs: r.proofs, mechanical, rules, derivations: derivs, artisticRefusalProofs: artisticRefusals, artistic, gaps: r.gaps, flow: r.flow, status, sourceSha: SRC[id].sha256.slice(0, 12) });
}
const sum = (k, v) => rows.filter((r) => r[k] === v).length;
const summary = { methods: rows.length, implemented: sum("status", "IMPLEMENTED"), incomplete: sum("status", "INCOMPLETE"), mechanicalProved: sum("mechanical", "PROVED"), mechanicalMissing: sum("mechanical", "MISSING"), artisticEncoded: rows.filter((r) => /ENCODED$/.test(r.artistic) && !/NOT/.test(r.artistic)).length, gapsTotal: rows.reduce((a, r) => a + (r.gaps?.length || 0), 0), stage1Complete: rows.every((r) => r.status === "IMPLEMENTED") };
fs.writeFileSync(path.join(EV, "STATUS.json"), JSON.stringify({ generated: new Date().toISOString(), summary, rows }, null, 1));
const md = [`# Stage 1 method status (computed ${new Date().toISOString().slice(0, 10)})`, "", `**Stage 1 complete: ${summary.stage1Complete ? "YES" : "NO"}** — ${summary.implemented}/80 IMPLEMENTED (both levels, no gaps); mechanical PROVED ${summary.mechanicalProved}/80; mechanical MISSING ${summary.mechanicalMissing}; open source-knowledge gaps ${summary.gapsTotal}.`, "",
  "| F | purpose | mechanical | artistic | status | open gaps |", "|---|---|---|---|---|---|",
  ...rows.map((r) => `| ${r.id} | ${r.purpose || "-"} | ${r.mechanical} | ${r.artistic} | ${r.status} | ${(r.gaps || []).join("; ") || "—"} |`)].join("\n");
fs.writeFileSync(path.join(EV, "STATUS.md"), md + "\n");
console.log(summary);
