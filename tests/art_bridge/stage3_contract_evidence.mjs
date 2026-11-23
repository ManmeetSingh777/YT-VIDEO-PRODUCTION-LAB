// Stage 3 two-way contract evidence → hybrid_v2/evidence/stage3_contract/. Mechanical only: no image is generated or requested, nothing approved.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { spawnSync, execFileSync } from "node:child_process";
import { planJobs } from "../../engine/art_bridge/art_intake.mjs";
import { gateForJob, contractContext } from "../../engine/art_bridge/art_contract.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FILM = path.join(REPO, "films", "hv2_film001"), EV = path.join(REPO, "hybrid_v2", "evidence", "stage3_contract");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), W = (n, o) => fs.writeFileSync(path.join(EV, n), typeof o === "string" ? o : JSON.stringify(o, null, 1));
fs.mkdirSync(EV, { recursive: true });
const rev = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), dirty = execFileSync("git", ["status", "--porcelain"], { cwd: REPO, encoding: "utf8" }).trim().length > 0;
// 1. failing-first tests, after the repair
const t = spawnSync(process.execPath, ["--test", "tests/art_bridge/stage3_contract.test.mjs"], { cwd: REPO, encoding: "utf8" });
W("S3C_TESTS_AFTER.txt", `revision ${rev}${dirty ? " (+ uncommitted changes)" : ""}\n$ node --test tests/art_bridge/stage3_contract.test.mjs\n${t.stdout}${t.stderr}`);
// 2. the BEFORE gate on the revised Ines design (from disk) and on the audited design
const doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), job = (await planJobs({ film: FILM })).jobs.find((j) => j.root_dependency === "ines_master");
const gate = gateForJob({ film: FILM, doc, job }); W("INES_GATE_REPORT.json", { revision: rev, artjob_id: job.artjob_id, motion_view: job.motion_context.view_id, ...gate });
const { preGenerationGate } = await import("../../engine/art_bridge/art_contract.mjs");
const old = preGenerationGate({ design: J(path.join(here, "fixtures", "stage3", "ines_master.design.AUDITED_094a1d0.json")), job, ...contractContext(FILM, doc, job) });
W("INES_AUDITED_DESIGN_GATE_REPORT.json", { revision: rev, note: "the design audited at 094a1d0, evaluated by the new gate", pass: old.pass, failure_codes: old.failures.map((x) => `${x.code}${x.method ? ":" + x.method : ""}`), failures: old.failures });
// 3. what the compiled request actually delivers (outbox export at this revision)
const out = (await import("../../engine/art_bridge/outbox_store.mjs")).readCurrent(path.join(REPO, "hybrid_v2", "art_outbox"), job.artjob_id).compiledDir, brc = J(path.join(out, "BRIDGE_REQUEST_CONTRACT.json")), req = J(path.join(out, "IMAGEGEN_REQUEST.json")), man = J(path.join(out, "PROVIDER_PRE_SUBMISSION_MANIFEST.json"));
W("INES_REQUEST_DELIVERY.json", { revision: rev, artjob_id: job.artjob_id, prompt_characters: man.prompt_characters, provider_limit: 32000, headroom: 32000 - man.prompt_characters, transparent_background: req.transparent_background, referenced_image_paths: req.referenced_image_paths.map((p) => path.relative(REPO, p).split(path.sep).join("/")),
  method_delivery: brc.method_delivery, overrides: brc.overrides, machine_motion_context_in_prompt: req.prompt.includes("hybrid_v2_motion_context"), motion_requirements_in_prompt: req.prompt.includes("motion_requirements"), design_approval: brc.gate.design_approval, request_sha256: brc.request_sha256 });
// 4. FIT_RIG on the diagnostic case (S3C-8 work dir)
const fitF = path.join(REPO, "hybrid_v2", "work", "stage3_contract", "rigfit", "film", "registration", "pilot_master", "RIG_FIT_RECEIPT.json");
if (fs.existsSync(fitF)) W("RIG_FIT_RECEIPT_DIAGNOSTIC.json", { provenance: "DIAGNOSTIC_FIXTURE (tests/art_bridge/stage3_rigfit_fixture.mjs): proves the mechanism only, never art quality", ...J(fitF) });
console.log(`stage3_contract evidence @ ${rev}${dirty ? "+dirty" : ""}: tests exit ${t.status}; Ines gate ${gate.pass ? "PASS" : "FAIL"} (${gate.design_approval.status}); audited design refused with ${old.failures.length} failures; prompt ${man.prompt_characters}/32000`);
