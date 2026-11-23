#!/usr/bin/env node
// Builds hybrid_v2/evidence/system_correction/FAILURE_LEDGER.json (directive D.3) from tests/art_bridge/ledger_rows.mjs + the EXECUTED TAP log.
// Status is computed, never typed: a row is FAIL if any proof/transfer test is missing or failing; IMPLEMENTED_UNQUALIFIED when every
// mechanical proof passed but real art / human review / narration is required; QUALIFIED_ON_DIAGNOSTICS when the row is fully mechanical.
// Producers are checked by import (smoke) and by a static call-site scan outside tests (wired, not just exported).
//   node engine/tools/build_failure_ledger.mjs [TAP_LOG]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) { // CLI only: importing this module has no side effects
// one or more TAP logs (comma-separated, in execution order): a later log's outcome for the SAME test name supersedes an earlier one (supplementary
// reruns after a fix); every log is hashed into the ledger so the supersession is auditable
const taps = (process.argv[2] || path.join(REPO, "hybrid_v2", "work", "audit_logs", "node_test_tap.txt")).split(",").map((t) => path.resolve(REPO, t)), tap = taps[0];
const byName = new Map(), superseded = []; for (const t of taps) for (const m of fs.readFileSync(t, "utf8").split(/\r?\n/).map((l) => l.match(/^(not ok|ok) \d+ - (.+?)(?: # .*)?$/)).filter(Boolean)) { const name = m[2].trim(), ok = m[1] === "ok"; if (byName.has(name) && byName.get(name).ok !== ok) superseded.push({ test: name, was: byName.get(name).ok, now: ok, by: path.relative(REPO, t) }); byName.set(name, { ok, name, log: path.relative(REPO, t) }); }
const results = [...byName.values()];
const esc = (x) => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), find = (id) => results.filter((r) => new RegExp(`^${esc(id)}([a-z])?([ :]|$)`).test(r.name));
// rows: the historical F001–F072 definitions plus (optional) extra row modules, e.g. tests/p02/ledger_rows_p02.mjs (F073+)
const extra = (process.env.LEDGER_EXTRA_ROWS || "").split(",").filter(Boolean), ROWS = [...(await import(url.pathToFileURL(path.join(REPO, "tests", "art_bridge", "ledger_rows.mjs")))).ROWS];
for (const m of extra) ROWS.push(...(await import(url.pathToFileURL(path.resolve(REPO, m)))).ROWS);
const srcFiles = []; for (const d of ["engine", "films/hv2_film001/handoff"]) (function walk(p) { for (const f of fs.readdirSync(p)) { const q = path.join(p, f); if (fs.statSync(q).isDirectory()) walk(q); else if (q.endsWith(".mjs")) srcFiles.push(q); } })(path.join(REPO, d));
const callSites = (exp, defFile) => srcFiles.filter((f) => { const s = fs.readFileSync(f, "utf8"), n = (s.match(new RegExp(`\\b${exp}\\s*\\(`, "g")) || []).length, defs = (s.match(new RegExp(`function\\s+${exp}\\s*\\(`, "g")) || []).length; return n - defs > 0; }).map((f) => path.relative(REPO, f).split(path.sep).join("/"));
const rows = [];
for (const r of ROWS) {
  const proofs = [...r.proof_tests, ...r.transfer_tests].map((id) => { const m = find(id); return { id, executed: m.length > 0, passed: m.length > 0 && m.every((x) => x.ok), tests: m.map((x) => x.name) }; });
  const producers = [];
  for (const p of r.root_producers) { const [mod, exp] = p.split("#"), file = path.join(REPO, mod); let exported = false; try { exported = !exp || typeof (await import(url.pathToFileURL(file)))[exp] === "function"; } catch { exported = false; }
    producers.push({ producer: p, exists: fs.existsSync(file), exported, file_sha256: fs.existsSync(file) ? fsha(file) : null, production_call_sites: exp ? callSites(exp, file) : [] }); }
  const bad = proofs.filter((x) => !x.passed), brokenProd = producers.filter((x) => !x.exists || !x.exported);
  const status = bad.length || brokenProd.length ? "FAIL" : r.external_dependencies.length ? "IMPLEMENTED_UNQUALIFIED" : "QUALIFIED_ON_DIAGNOSTICS";
  rows.push({ id: r.id, failed_invariant: r.failed_invariant, root_producers: producers, applicability: "generalized (no scene/character branch; see unlike transfer tests)", repair: r.root_producers, proof_tests: proofs.filter((x) => r.proof_tests.includes(x.id)), transfer_tests: proofs.filter((x) => r.transfer_tests.includes(x.id)), external_dependencies: r.external_dependencies, status, evidence: { tap_log: path.relative(REPO, tap).split(path.sep).join("/"), failing: bad.map((x) => x.id), broken_producers: brokenProd.map((x) => x.producer) }, reviewer: "PENDING_INDEPENDENT_AUDIT" });
}
const rev = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), counts = rows.reduce((m, r) => ((m[r.status] = (m[r.status] || 0) + 1), m), {});
const out = { generated_by: "engine/tools/build_failure_ledger.mjs", schema: "schemas/failure_ledger.schema.json", revision: rev, tap_logs: taps.map((t) => ({ log: path.relative(REPO, t), sha256: fsha(t) })), superseded_outcomes: superseded, counts, rule: "QUALIFIED_ON_REAL_ART / QUALIFIED_FULL_FILM require provider pixels + human receipts: none exist, so no row can reach them", rows };
const dst = process.env.LEDGER_OUT ? path.resolve(REPO, process.env.LEDGER_OUT) : path.join(REPO, "hybrid_v2", "evidence", "system_correction", "FAILURE_LEDGER.json"); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.writeFileSync(dst, JSON.stringify(out, null, 1));
console.log(`ledger ${rows.length} rows ${JSON.stringify(counts)} → ${path.relative(REPO, dst)}`);
}
