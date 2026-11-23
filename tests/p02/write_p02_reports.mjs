#!/usr/bin/env node
// Composes hybrid_v2/evidence/p02/{REHEARSAL_REPORT.md, TEST_RESULTS.md} FROM the recorded evidence (rehearsal phase transcripts/STATUS/VERIFY,
// injection summary, executed TAP log, computed failure ledger). Nothing here is typed by hand: every number is read from an evidence file.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), EV = path.join(REPO, "hybrid_v2", "evidence", "p02"), RH = path.join(REPO, "hybrid_v2", "work", "p02", "rehearsal", "evidence");
const J = (f) => (fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null), T = (f) => (fs.existsSync(f) ? fs.readFileSync(f, "utf8") : null);
const out = ["# P02 diagnostic production rehearsal (generated from evidence by tests/p02/write_p02_reports.mjs)", "", "Film: `hybrid_v2/work/p02/rehearsal/rt/film`. It is a DIAGNOSTIC namespace film built through the real intake API. Its content is fixture rasters, a simulated reviewer that is valid only inside the namespace, and a synthetic tone. The controller used for every phase is `engine/tools/production_run.mjs`.", ""];
for (const ph of fs.existsSync(RH) ? fs.readdirSync(RH).sort() : []) {
  const st = J(path.join(RH, ph, "STATUS.json")), v = J(path.join(RH, ph, "VERIFY.json")), tr = T(path.join(RH, ph, "TRANSCRIPT.txt")) || "";
  out.push(`## Phase ${ph}`, "");
  if (st) {
    out.push(`- Run \`${st.run_id}\`: ${st.events} events, chain head \`${String(st.chain_head).slice(0, 16)}…\`.`);
    out.push(`- Tasks verified: ${st.tasks.completed}/${st.tasks.total} (${st.tasks.percent_verified}%). Failed: ${st.tasks.failed}. Blocked: ${st.tasks.blocked}.`);
    out.push(`- Next operation: ${st.next_operation}.`, "");
  }
  if (st) out.push("| stage | status | verified/tasks | failed | blocked |", "|---|---|---|---|---|", ...st.stages.map((r) => `| ${r.stage} | ${r.status} | ${r.verified}/${r.tasks} | ${r.failed} | ${r.blocked} |`), "");
  for (const l of tr.split("\n").filter((x) => x.startsWith("[why") || x.startsWith("    "))) out.push(`    ${l}`);
  if (v) out.push("", `- verify: chain ok=${v.chain.ok}, ${v.chain.events} events; handoffs ${v.handoffs.map((h) => `${h.stage.slice(0, 3)}:${h.ok ? "ok" : "STALE/" + h.reason}`).join(", ")}`, "");
}
const inj = J(path.join(REPO, "hybrid_v2", "work", "p02", "injection", "INJECTION_SUMMARY.json"));
if (inj) {
  out.push("## Intentional failure injected at every stage (P02-R23)", "");
  out.push("| injection | first failure stage/task | class | repair owner | blast radius |", "|---|---|---|---|---|");
  for (const x of inj) out.push(`| ${x.injection} | ${x.first_failure?.stage}/${x.first_failure?.task} | ${x.first_failure?.class} | ${x.why?.owner ?? "—"} | ${(x.why?.blast_radius || []).length} nodes |`);
  out.push("");
}
fs.writeFileSync(path.join(EV, "REHEARSAL_REPORT.md"), out.join("\n") + "\n");
const LOGS = ["p02_tap.txt", "p02_tap_rerun_failed.txt", "p02_tap_final_code.txt", "p02_tap_fresh_film_check.txt"].map((f) => path.join(REPO, "hybrid_v2", "work", "audit_logs", f)).filter((f) => fs.existsSync(f)), merged = new Map();
for (const f of LOGS) for (const m of fs.readFileSync(f, "utf8").split(/\r?\n/).map((l) => l.match(/^(not ok|ok) \d+ - (.+?)(?: # .*)?$/)).filter(Boolean)) merged.set(m[2].trim(), [null, m[1], m[2].trim(), path.basename(f)]);
const res = [...merged.values()], led = J(path.join(EV, "FAILURE_LEDGER_P02.json"));
const t = ["# P02 test results (generated from the executed TAP logs, merged in order; a later log supersedes an earlier outcome of the same test)", "", ...LOGS.map((f) => `- \`${path.relative(REPO, f)}\``), "",
  `Command: \`node --test --test-concurrency=2 --test-reporter=tap tests/art_bridge/*.test.mjs tests/p02/*.test.mjs > hybrid_v2/work/audit_logs/p02_tap.txt\``, "",
  `Executed: ${res.length} tests. Passed: ${res.filter((m) => m[1] === "ok").length}. Failed: ${res.filter((m) => m[1] !== "ok").length}.`, "",
  ...res.filter((m) => m[1] !== "ok").map((m) => `- FAIL: ${m[2]} (${m[3]})`), "", ...(led?.superseded_outcomes?.length ? ["Superseded outcomes (a fix was applied, then the test was re-executed):", ...led.superseded_outcomes.map((x) => `- ${x.was ? "pass→FAIL" : "fail→pass"}: ${x.test} (by ${x.by})`), ""] : []),
  "## Failure ledger F001–F106 (computed by engine/tools/build_failure_ledger.mjs from that TAP)", "", led ? `Counts: ${JSON.stringify(led.counts)}` : "ledger not built", "",
  ...(led ? ["| id | status | external dependencies |", "|---|---|---|", ...led.rows.map((r) => `| ${r.id} | ${r.status} | ${(r.external_dependencies || []).join("; ") || "—"} |`)] : [])];
fs.writeFileSync(path.join(EV, "TEST_RESULTS.md"), t.join("\n") + "\n"); console.log("wrote REHEARSAL_REPORT.md, TEST_RESULTS.md");
