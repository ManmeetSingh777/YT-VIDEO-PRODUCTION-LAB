// Writes hybrid_v2/evidence/STAGE_1_CONTRACT_PROOF.json and COVERAGE_F01_F80.json from live runs (never hand-edited).
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runCheck } from "../../engine/tools/art_bridge_check.mjs";
import { buildMethodTrace } from "../../engine/art_bridge/method_trace.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), ROOT = path.join(here, "fixtures"), OUT = path.join(REPO, "hybrid_v2", "evidence");
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(path.join(REPO, f))).digest("hex");
let tap; try { tap = execFileSync(process.execPath, ["--test", ...fs.readdirSync(here).filter((f) => f.endsWith(".test.mjs")).map((f) => path.join(here, f))], { encoding: "utf8" }); } catch (e) { tap = e.stdout; }
const pass = +(/# pass (\d+)/.exec(tap)?.[1] ?? 0), fail = +(/# fail (\d+)/.exec(tap)?.[1] ?? -1), names = [...tap.matchAll(/^(not ok|ok) \d+ - (.+)$/gm)].map((m) => ({ ok: m[1] === "ok", name: m[2] }));
const examples = {};
for (const n of ["valid_human_grip", "valid_world_portal", "invalid_unreachable_contact", "invalid_missing_underpaint", "invalid_illegal_view_morph"]) {
  const rel = `schemas/examples/${n}.json`, r = await runCheck({ root: ROOT, manifest: path.relative(ROOT, path.join(REPO, rel)) });
  examples[n] = { file: rel, sha256: sha(rel), pass: r.pass, error_codes: r.errors.map((e) => e.code), errors: r.errors, frames_covered: r.coverage?.framesCovered };
}
const trace = await buildMethodTrace({});
const modules = ["engine/art_bridge/errors.mjs", "engine/art_bridge/png.mjs", "engine/art_bridge/jsonschema.mjs", "engine/art_bridge/constraints.mjs", "engine/art_bridge/graph.mjs", "engine/art_bridge/method_trace.mjs", "engine/art_bridge/load_manifest.mjs", "engine/art_bridge/coverage.mjs", "engine/tools/art_bridge_check.mjs", "schemas/motion_art_manifest_v2.schema.json", "tests/art_bridge/stage1.test.mjs", "tests/art_bridge/make_fixtures.mjs"];
const okEx = examples.valid_human_grip.pass && examples.valid_world_portal.pass && !examples.invalid_unreachable_contact.pass && examples.invalid_unreachable_contact.error_codes.includes("UNREACHABLE_IK") && examples.invalid_missing_underpaint.error_codes.includes("MISSING_UNDERPAINT") && examples.invalid_illegal_view_morph.error_codes.includes("INVALID_MORPH_TOPOLOGY");
const proof = { stage: "STAGE_1_CONTRACT", generated_by: "tests/art_bridge/write_stage1_proof.mjs", status: fail === 0 && pass > 0 && okEx ? "MECHANICAL_PASS" : "BLOCKED",
  note: "Contract/compiler proof only. Fixtures are DIAGNOSTIC_FIXTURE rasters (provenance_class DIAGNOSTIC_FIXTURE), rejected by --production; they are not and never represent target art.",
  source_modules: modules.map((f) => ({ file: f, sha256: sha(f) })), cli: "node engine/tools/art_bridge_check.mjs check --manifest PATH --root ROOT --json OUT [--production] [--inspect]",
  tests: { command: "node --test tests/art_bridge/*.test.mjs", pass, fail, cases: names }, examples,
  method_registry: { rows: trace.length, verdict_counts: trace.reduce((m, r) => ((m[r.verdict] = (m[r.verdict] || 0) + 1), m), {}), file: "hybrid_v2/evidence/COVERAGE_F01_F80.json" } };
fs.mkdirSync(OUT, { recursive: true });
fs.writeFileSync(path.join(OUT, "STAGE_1_CONTRACT_PROOF.json"), JSON.stringify(proof, null, 1));
fs.writeFileSync(path.join(OUT, "COVERAGE_F01_F80.json"), JSON.stringify({ generated_by: "engine/art_bridge/method_trace.mjs#buildMethodTrace", note: "Verdicts are computed. IMAGE_AUTHORSHIP methods stay PENDING_PROVIDER_PIXELS until provider art exists; consumers not yet written report NO_CONSUMER_YET.", rows: trace }, null, 1));
console.log(proof.status, pass, fail, proof.method_registry.verdict_counts);
