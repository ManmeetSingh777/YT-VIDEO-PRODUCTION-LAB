#!/usr/bin/env node
// Compute the Better One 20-gate status matrix from real TAP logs (and PRODUCTION evidence records when they exist).
//   node engine/tools/quality_gates.mjs --tap FINAL.tap [--tap MORE.tap ...] [--evidence EVIDENCE.json] [--source-sha SHA] --out GATES.json
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { evaluateQualityGates } from "../production/quality_gates.mjs";
export function main(a = process.argv.slice(2), log = console.log) {
  const all = (k) => a.flatMap((x, i) => (x === k ? [a[i + 1]] : [])), one = (k) => all(k)[0] ?? null;
  if (!all("--tap").length || !one("--out")) { log("usage: quality_gates.mjs --tap FILE [--tap FILE] [--evidence FILE] [--source-sha SHA] --out FILE"); return 2; }
  const tapText = all("--tap").map((f) => fs.readFileSync(f, "utf8")).join("\n"), ev = one("--evidence") ? JSON.parse(fs.readFileSync(one("--evidence"), "utf8")) : [];
  const r = evaluateQualityGates({ tapText, sourceSha: one("--source-sha"), productionEvidence: ev });
  r.inputs = { taps: all("--tap"), evidence: one("--evidence") }; fs.mkdirSync(path.dirname(path.resolve(one("--out"))), { recursive: true }); fs.writeFileSync(one("--out"), JSON.stringify(r, null, 1));
  log(JSON.stringify(r.summary)); for (const g of r.gates) log(`${g.id} ${g.status.padEnd(23)} ${g.phase}`); return r.gates.some((g) => g.status === "FAILED") ? 1 : 0;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) process.exit(main());
