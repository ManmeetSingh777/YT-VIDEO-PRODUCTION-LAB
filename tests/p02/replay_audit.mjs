#!/usr/bin/env node
// Independent ZIP replay (P02-R12 / R25). Extracts audit_outbox/HYBRID_V2_P02_REPAIR_AUDIT.zip into a FRESH folder, verifies every member
// against AUDIT/INTEGRITY_MANIFEST.json, checks nu.js, then runs every advertised suite INSIDE the extraction and compares the executed test
// names/outcomes with the TAP log shipped in the archive. Output: <dest>/REPLAY_RESULT.json (+ TAP).
//   node tests/p02/replay_audit.mjs [ZIP] [DEST]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync, spawnSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), zip = path.resolve(process.argv[2] || path.join(REPO, "audit_outbox", "HYBRID_V2_P02_REPAIR_AUDIT.zip"));
const dest = path.resolve(process.argv[3] || path.join(REPO, "hybrid_v2", "work", "p02_replay")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
fs.rmSync(dest, { recursive: true, force: true }); fs.mkdirSync(dest, { recursive: true });
execFileSync(process.env.PYTHON || "python", ["-I", "-c", "import sys,zipfile; zipfile.ZipFile(sys.argv[1]).extractall(sys.argv[2])", zip, dest]);
const root = path.join(dest, "HYBRID_V2_P02_REPAIR_AUDIT"), man = JSON.parse(fs.readFileSync(path.join(root, "AUDIT", "INTEGRITY_MANIFEST.json"), "utf8")), bad = [];
for (const [rel, m] of Object.entries(man.files)) { const f = path.join(root, rel); if (!fs.existsSync(f)) bad.push(`${rel}: missing`); else if (sha(f) !== m.sha256) bad.push(`${rel}: hash`); }
const nu = sha(path.join(root, "engine", "runtime", "nu.js"));
const suites = [...fs.readdirSync(path.join(root, "tests", "art_bridge")).filter((f) => f.endsWith(".test.mjs")).map((f) => `tests/art_bridge/${f}`), ...fs.readdirSync(path.join(root, "tests", "p02")).filter((f) => f.endsWith(".test.mjs")).map((f) => `tests/p02/${f}`)];
const t0 = Date.now(), run = spawnSync(process.execPath, ["--test", "--test-concurrency=2", "--test-reporter=tap", ...suites], { cwd: root, encoding: "utf8", maxBuffer: 1 << 28, env: { ...process.env, ART_BRIDGE_TEST_TRUST: "" } });
fs.writeFileSync(path.join(dest, "REPLAY_TAP.txt"), run.stdout + run.stderr);
const parse = (s) => s.split(/\r?\n/).map((l) => l.match(/^(not ok|ok) \d+ - (.+?)(?: # .*)?$/)).filter(Boolean).map((m) => [m[2].trim(), m[1] === "ok"]);
const got = new Map(parse(run.stdout)), shipped = new Map(); // shipped outcome = the advertised logs merged in order (a later rerun supersedes)
for (const f of ["p02_tap.txt", "p02_tap_rerun_failed.txt", "p02_tap_final_code.txt", "p02_tap_fresh_film_check.txt"].map((x) => path.join(root, "hybrid_v2", "work", "audit_logs", x)).filter((x) => fs.existsSync(x))) for (const [k, v] of parse(fs.readFileSync(f, "utf8"))) shipped.set(k, v);
const missingTests = [...shipped.keys()].filter((k) => !got.has(k)), changed = [...shipped.entries()].filter(([k, v]) => got.has(k) && got.get(k) !== v).map(([k, v]) => ({ test: k, shipped: v, replay: got.get(k) }));
const res = { zip, zip_sha256: sha(zip), extracted_to: root, integrity_failures: bad, nu_js_sha256: nu, nu_js_preserved: nu === "773baf915657a2d95e120b52359e476651314673906293e261cdb86db793e7be", suites: suites.length,
  replay: { tests: got.size, passed: [...got.values()].filter(Boolean).length, failed: [...got.entries()].filter(([, v]) => !v).map(([k]) => k), seconds: Math.round((Date.now() - t0) / 1000) },
  shipped_tap: { tests: shipped.size, passed: [...shipped.values()].filter(Boolean).length }, shipped_tests_missing_in_replay: missingTests, outcome_changes: changed };
fs.writeFileSync(path.join(dest, "REPLAY_RESULT.json"), JSON.stringify(res, null, 1)); console.log(JSON.stringify({ ...res, replay: { ...res.replay, failed: res.replay.failed.length } }, null, 1));
process.exit(bad.length || missingTests.length || changed.length || !res.nu_js_preserved ? 1 : 0);
