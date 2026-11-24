#!/usr/bin/env node
// P04 evidence 07/08/09 + source inventory, built ONLY from executed artifacts (final TAP, chain report, coverage gate, receipts, Chrome negatives).
//   node tests/p04/build_final_evidence.mjs --tap FILE --code-sha SHA
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), arg = (k) => { const i = process.argv.indexOf(k); if (i < 0) throw new Error(`missing ${k}`); return process.argv[i + 1]; }, E = path.join(REPO, "hybrid_v2", "evidence", "p04"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), TAP = fs.readFileSync(arg("--tap"), "utf8"), CODE = arg("--code-sha");
const res = new Map([...TAP.matchAll(/^(not ok|ok) \d+ - (.*)$/gm)].map((m) => [m[2].trim(), m[1] === "ok"])), tests = (...pats) => [...res].filter(([n]) => pats.some((p) => n.startsWith(p))).map(([n, ok]) => ({ test: n, passed: ok }));
const chain = J(path.join(E, "chain", "CHAIN_REPORT.json")), cov = J(path.join(E, "chain", "COVERAGE_GATE.json")), fin = J(path.join(E, "chain", "FINAL_MEDIA_RECEIPT.json")), sync = J(path.join(E, "chain", "FILM_MIX.wav.SYNC.json")), neg = J(path.join(E, "render_negatives", "NEGATIVES.json")), W = (f, o) => fs.writeFileSync(path.join(E, f), typeof o === "string" ? o : JSON.stringify(o, null, 1));
const events = (() => { const d = path.join(REPO, "hybrid_v2", "work", "p04", "chain_film", "subjects", "film", "production", "runs", chain.run_id, "events"); return fs.existsSync(d) ? fs.readdirSync(d).sort().map((f) => J(path.join(d, f))) : []; })();
const done = events.filter((e) => e.event_type === "TASK_COMPLETED" || e.event_type === "TASK_FAILED").map((e) => ({ stage: e.stage_id, task: e.task_id, status: e.status_after, measurement: e.verification?.measurement ?? null }));
const pick = (re) => done.filter((t) => re.test(t.task));
W("07_REGISTRATION_AND_MOTION_FEASIBILITY.md", `# Registration and motion feasibility (P04 §4)

Engine code: \`${CODE}\`. Chained film run \`${chain.run_id}\` (DIAGNOSTIC fixture rasters; nothing here is target art).

## Feasibility executed on every required frame (S03) and again with delivered art (S06)

| stage | task | status | measured |
|---|---|---|---|
${pick(/^feasibility/).map((t) => `| ${t.stage} | ${t.task} | ${t.status} | ${String(t.measurement).replace(/\|/g, "/")} |`).join("\n")}

## Cross-state, contact, support, deformation and reaction checks

| stage | task | status | measured |
|---|---|---|---|
${pick(/^(motion_layers|deform_|morph_|reaction_|support_|grip_|semantic|direction|framing|contact_patch|production_ir|narration)/).map((t) => `| ${t.stage} | ${t.task} | ${t.status} | ${String(t.measurement).slice(0, 420).replace(/\|/g, "/")} |`).join("\n")}

## Registration (measured art decides geometry; the approved bytes are never altered)

${pick(/^registration_/).filter((t) => t.status === "COMPLETED").length} of ${pick(/^registration_/).length} registration tasks completed. The fitting, residual, pivot, alpha and seam rules are proven by the tests below.

## Refusals for impossible or unevaluated motion

${tests("P04-4", "P04-5", "S3C", "M0", "M1", "P02-RP", "P02-R14", "F1 ", "F2 ", "F3 ", "F4 ", "E1 ", "E2 ", "E3 ").map((t) => `- ${t.passed ? "pass" : "FAIL"}: ${t.test}`).join("\n")}

## Limits

- Landmarks are supplied by a reviewer (sidecar); there is no automatic landmark detection on real GPT art.
- No genuine GPT artwork has been registered. These results show the mechanism on fixtures only.
`);
W("08_ACTUAL_RENDER_NEGATIVES.json", { code_sha: CODE, chrome_rendered_negatives: neg, state_and_gate_negatives: { frozen_actor: tests("P04-2.2b", "P04-2.2d", "P04-2.2e"), wrong_grip: tests("P04-5.3"), missing_cel_or_state: tests("P04-3.2", "P04-3.3", "P04-6.1"), invalid_deformation: tests("P04-5.5", "E2"), missed_contact: tests("P04-5.3b", "P04-4"), silent_action_substitution: tests("P04-2.3", "P04-2.2c", "P04-2.2/5.4"), camera_and_blur: tests("P04-5.7", "P04-7.5"), broken_mechanism: tests("F3", "P04-2.2/5.4"), real_chrome: tests("P04-2.4c", "P04-7.6b", "P04-7.8b", "P02-R01", "P02-R02", "P02-R03", "P02-R07") } });
W("09_PRODUCTION_AND_AUDIO_PROOFS.json", { code_sha: CODE, run: chain.run_id, stages: chain.stages, stage_results: chain.results, only_blocked_task: chain.failures, ledger_verification: { ok: chain.ledger_verification.ok }, trace_frame_120: chain.trace_frame_120, tasks: done, coverage_gate: { ok: cov.ok, frames_hashed: cov.frames_hashed, total: cov.total_expected, decision_pixels: cov.decision_pixels }, final_media: fin, sync, preflight_purity: tests("P04-7.1"), plan_resolution: tests("P04-7.2"), obligations: tests("P04-7.4"), exceptions: tests("P04-7.3"), revision_invalidation: tests("P04-7.8", "P02-R08"), audio_publication: tests("P04-7.7"), replay_and_recovery: tests("P02-R15", "P02-F085", "P02-R13", "P02-R04", "P02-R05", "P02-R06"), authority: tests("P04-6", "P02-R16") });
const files = execFileSync("git", ["ls-files", "engine", "schemas", "tests", "inputs", "analysis", "CLAUDE.md", "HANDOFF.md"], { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 26 }).split("\n").filter((f) => f && !/fixtures\/_tmp\//.test(f) && fs.existsSync(path.join(REPO, f)));
W("SOURCE_INVENTORY.json", { code_commit: CODE, branch: execFileSync("git", ["branch", "--show-current"], { cwd: REPO, encoding: "utf8" }).trim(), nu_js_sha256: sha(path.join(REPO, "engine", "runtime", "nu.js")), files: Object.fromEntries(files.map((f) => [f, sha(path.join(REPO, f))])) });
console.log(`tests ${res.size} passed ${[...res.values()].filter(Boolean).length}; tasks ${done.length}; files ${files.length}; events ${events.length}`);
