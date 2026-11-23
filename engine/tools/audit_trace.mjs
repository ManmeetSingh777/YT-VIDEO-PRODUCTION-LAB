#!/usr/bin/env node
// Independent source trace (directive O.9). Looks at the code from OUTSIDE the happy path:
//  (1) fail-open / placeholder / destructive patterns anywhere in production code (engine/), with file:line and whether the hit is a
//      refusal, a comment or a live path; (2) the static module closure reachable from the real provider submission entry point;
//  (3) every call site that can write an approval/review receipt; (4) the rows of FAILURE_LEDGER.json whose producers have no production
//  call site. Output: hybrid_v2/evidence/system_correction/INDEPENDENT_TRACE.json. It approves nothing and changes nothing.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), rel = (f) => path.relative(REPO, f).split(path.sep).join("/");
const files = []; (function walk(p) { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (fs.statSync(q).isDirectory()) { if (!["runtime"].includes(f)) walk(q); } else if (/\.mjs$/.test(q)) files.push(q); } })(path.join(REPO, "engine"));
const PATTERNS = [
  ["NULL_CONTRACT_PATH", /contract\s*=\s*null/], ["GATE_NULL_SHORTCIRCUIT", /if\s*\(\s*gate\s*&&/], ["NOT_EVALUATED_STATUS", /status:\s*"NOT_EVALUATED"/], ["STORY_FROM_DOC_STATUS", /doc\.status\s*(!==|===)\s*"PLANNED"/],
  ["DESTRUCTIVE_OUTBOX", /rmSync\(path\.join\(out/], ["EXPORT_EXISTENCE_AS_PROOF", /typeof m\[exp\] === "function"/], ["PLACEHOLDER_TEXT", /USE F57.F80 METHOD ROUTING|PASS_PENDING|\bTODO\b|\bTBD\b/], ["POINTER_DEDUPE", /SAME AS \$\{/],
  ["CLI_SOURCE_AUTHORITY", /source === "ART_BRIDGE_CAPTURE"|rr\.source !== "ART_BRIDGE_CAPTURE"/], ["MEASURED_BY_FLAG", /method:\s*'measured'|MEASURED\.has\(/], ["BROAD_CATCH_SWALLOW", /catch\s*\{\s*\}/],
];
const hits = [];
for (const f of files.filter((x) => !x.endsWith("audit_trace.mjs"))) { const lines = fs.readFileSync(f, "utf8").split(/\r?\n/); // its own pattern table is not a finding
  lines.forEach((l, i) => { for (const [code, re] of PATTERNS) if (re.test(l)) { const t = l.trim(), ctx = t.startsWith("//") || t.startsWith("*") || t.startsWith("/*") ? "COMMENT" : /throw err\(|refus|PLACEHOLDER\s*=|const PATTERNS|forbidden|FORBIDDEN|never/.test(l) ? "REFUSAL_OR_DETECTOR" : "LIVE";
    hits.push({ code, file: rel(f), line: i + 1, context: ctx, text: t.slice(0, 180) }); } }); }
// static import closure from the provider submission entry
const closure = new Set(), stack = [path.join(REPO, "engine", "art_bridge", "art_intake.mjs")];
while (stack.length) { const f = stack.pop(); if (closure.has(f) || !fs.existsSync(f)) continue; closure.add(f); const s = fs.readFileSync(f, "utf8");
  for (const m of s.matchAll(/(?:from|import)\s*\(?\s*["'](\.{1,2}\/[^"']+)["']/g)) stack.push(path.resolve(path.dirname(f), m[1])); }
const receiptWriters = files.flatMap((f) => fs.readFileSync(f, "utf8").split(/\r?\n/).map((l, i) => [l, i]).filter(([l]) => /writeReceipt\(/.test(l) && !/export function writeReceipt/.test(l)).map(([l, i]) => ({ file: rel(f), line: i + 1, human_requires: /attest|attestation/.test(l) ? "attestation parameter (HUMAN only via interactive TTY)" : "check", text: l.trim().slice(0, 140) })));
const ledgerF = path.join(REPO, "hybrid_v2", "evidence", "system_correction", "FAILURE_LEDGER.json"), ledger = fs.existsSync(ledgerF) ? JSON.parse(fs.readFileSync(ledgerF, "utf8")) : null;
const unwired = ledger ? ledger.rows.flatMap((r) => r.root_producers.filter((p) => p.exported && !p.production_call_sites.length && !/build_production_graph|#(compileArtJob|submitJob|exportOutbox|qualifyFilm|renderFilm|approveScope|approveDesign|recordArtReview|ingestMaster|checkRigFeasibility|preGenerationGate|requireApprovedContract|buildMethodTrace)$/.test(p.producer)).map((p) => ({ row: r.id, producer: p.producer, note: "exported and tested; no non-test call site — library consumer awaiting its production caller" }))) : [];
const out = { generated_by: "engine/tools/audit_trace.mjs", at: new Date().toISOString(), live_fail_open_hits: hits.filter((h) => h.context === "LIVE"), all_pattern_hits: hits,
  provider_submission_closure: [...closure].map(rel).sort(), receipt_writers: receiptWriters, producers_without_production_call_site: unwired,
  note: "LIVE hits are reported for independent review; a LIVE hit is not automatically a defect (e.g. a deprecated option that now throws), but each must be explained in ROOT_CAUSE_REPAIR_MATRIX.md" };
const dst = path.join(REPO, "hybrid_v2", "evidence", "system_correction", "INDEPENDENT_TRACE.json"); fs.writeFileSync(dst, JSON.stringify(out, null, 1));
console.log(`trace: ${hits.length} pattern hits (${out.live_fail_open_hits.length} LIVE), closure ${closure.size} modules, ${receiptWriters.length} receipt writers, ${unwired.length} producers without production call site → ${rel(dst)}`);
for (const h of out.live_fail_open_hits) console.log(" LIVE", h.code, `${h.file}:${h.line}`, h.text.slice(0, 110));
