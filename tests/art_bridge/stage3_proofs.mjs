// Stage 3 evidence (spec §6, §7.5): what can be proven WITHOUT a provider, and the exact blockers for the rest.
// Writes hybrid_v2/evidence/STAGE_3_ART_PROOF.json. Never generates or fabricates an image.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { discoverProvider } from "../../engine/art_bridge/providers/image_provider.mjs";
import { compileArtJob, missingArtJobs } from "../../engine/art_bridge/art_requests.mjs";
import { contractContext } from "../../engine/art_bridge/art_contract.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), FILM = path.join(REPO, "films", "hv2_film001"), OUT = path.join(REPO, "hybrid_v2", "work", "stage3");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const idx = J(path.join(REPO, "hybrid_v2", "art_outbox", "OUTBOX_INDEX.json")), provider = discoverProvider(), caps = await provider.capabilities();
const { readCurrent } = await import("../../engine/art_bridge/outbox_store.mjs"), OUTBOX = path.join(REPO, "hybrid_v2", "art_outbox"), job = readCurrent(OUTBOX, idx.index.find((r) => r.asset === "ines_master").artjob_id).job; // content-addressed outbox (directive E3)
const design = J(path.join(FILM, "art_designs", "ines_master.design.json")), mem = path.join(FILM, "learning", "REPAIR_MEMORY.json");
// Stage 3 contract: a character master compiles ONLY through the two-way contract gate (art_contract.mjs)
const ctx = contractContext(FILM, J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), job);
const run = (tag, base) => { try { return { ok: true, r: compileArtJob(job, { film: FILM, baseJob: base, outDir: path.join(OUT, tag), repairMemory: mem, contract: ctx }) }; } catch (e) { return { ok: false, code: e.code, reason: e.human_readable_reason || e.message, failures: (e.details?.failures || []).map((x) => `${x.code}${x.method ? ":" + x.method : ""}`) }; } };
const base = run("baseline", design);
const prompt = fs.readFileSync(path.join(OUT, "baseline", "IMAGEGEN_REQUEST.json"), "utf8"), req = JSON.parse(prompt);
const oneWitness = JSON.parse(JSON.stringify(design)); oneWitness.first_pass_control.references = oneWitness.first_pass_control.references.slice(0, 1); const n1 = run("one_witness", oneWitness);
const fakeWitness = JSON.parse(JSON.stringify(design)); fakeWitness.first_pass_control.references[1].path = "assets/character_native_anchors/DOES_NOT_EXIST.jpg"; const n2 = run("fake_witness", fakeWitness);
const noDesign = (() => { try { compileArtJob(job, { film: FILM, baseJob: {}, outDir: path.join(OUT, "nodesign") }); return { ok: true }; } catch (e) { return { ok: false, code: e.code }; } })();
const noF64 = JSON.parse(JSON.stringify(design)); noF64.method_decisions = noF64.method_decisions.filter((b) => b.method_id !== "F64"); const c1 = run("without_F64", noF64); // decisions are the authority since the universal contract
const masters = idx.index.filter((r) => r.order === 1);
const proof = { stage: "STAGE_3_ART", generated_by: "tests/art_bridge/stage3_proofs.mjs", tested_revision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), generated_at: new Date().toISOString(),
  status: "BLOCKED", blockers: [`NO_IMAGE_PROVIDER: ${caps.blocker}`, "STORY_APPROVAL_PENDING: films/hv2_film001/direction/EXPERIENCE_DIRECTOR_PROPOSAL.md is a proposal, not an approved script"],
  provider_discovery: { report: provider.report, capabilities: caps, adapter: "engine/art_bridge/providers/image_provider.mjs (OpenAIImagesProvider path implemented, NOT_TESTED: no credentials/model configured)" },
  outbox: { index: "hybrid_v2/art_outbox/OUTBOX_INDEX.json", instructions: "hybrid_v2/art_outbox/INSTRUCTIONS_FOR_IMAGE_PRODUCTION.md", jobs: idx.jobs, by_order: idx.by_order, by_status: idx.by_status, empty_frame_ranges_with_triggers: idx.empty_frame_ranges_with_triggers, compiled_masters: masters.map((m) => ({ artjob_id: m.artjob_id, asset: m.asset, medium: m.medium, frame_ranges: m.frame_ranges, compiled: m.compiled, witnesses: m.witnesses, contact_sheet: m.contact_sheet })) },
  mechanical_proofs: [
    { id: "S3-COMPILE", claim: "canonical master passes the universal contract gate and compiles through the installed skill into ordered, complete stage requests (≥2 verified native witnesses, repair memory applied); motion reaches the artist only as requirements; the machine rig contract stays in BRIDGE_MOTION_CONTEXT.json; transparency is contract-owned; not provider-ready without human receipts", pass: base.ok && base.r.gate.pass && base.r.provider_ready === false && base.r.stages.length >= 1 && base.r.stages.every((s) => s.characters <= 32000) && base.r.witnesses.filter((w) => w.verified).length >= 2 && base.r.repair_memory_applied && prompt.includes("MOTION REQUIREMENTS") && !prompt.includes("hybrid_v2_motion_context") && !prompt.includes("SAME AS ") && fs.existsSync(path.join(OUT, "baseline", "BRIDGE_MOTION_CONTEXT.json")) && req.transparent_background === true && req.referenced_image_paths.length >= 2, evidence: { request: base.ok ? base.r.request_file : null, stages: base.r?.stages, prompt_sha256: base.r?.prompt_sha256, witnesses: base.r?.witnesses } },
    { id: "S3-NEG-WITNESS", injection: "remove one approved source witness", expected: "refused before compile: the contract gate (grounding decisions cite the removed witness, ART_CONTRACT_REFUSED) or the skill compiler (UNQUALIFIED_STYLE_ASSET)", observed: n1.ok ? "COMPILED" : n1.code, reason: n1.reason, pass: !n1.ok && ["ART_CONTRACT_REFUSED", "UNQUALIFIED_STYLE_ASSET"].includes(n1.code) },
    { id: "S3-NEG-FAKE", injection: "reference a witness file that does not exist", expected: "compile refused; no fake attachment", observed: n2.ok ? "COMPILED" : n2.code, reason: n2.reason, pass: !n2.ok },
    { id: "S3-NEG-NODESIGN", injection: "ArtJob without skill-conditioned first_pass_control", expected: "UNQUALIFIED_STYLE_ASSET", observed: noDesign.code, pass: noDesign.code === "UNQUALIFIED_STYLE_ASSET" },
    { id: "S3-CAUSAL-F64", injection: "remove the F64 illustration-family identity-routing binding (F64 was previously misbound as hand construction)", expected: "refused BEFORE compile: MISSING_APPLICABLE_METHOD:F64 (an applicable method cannot be dropped)", observed: c1.ok ? { methods: c1.r.compiled_method_ids, prompt_sha256: c1.r.prompt_sha256 } : c1, pass: !c1.ok && c1.code === "ART_CONTRACT_REFUSED" && c1.failures.includes("MISSING_APPLICABLE_METHOD:F64"), note: "payload-level causality only; the pixel-level effect needs provider output" },
  ],
  acceptance: [
    { criterion: "approved polished character identity with registered cutouts/expression/view/contact states", status: "BLOCKED", dependency: "GPT art + story approval" },
    { criterion: "distinct environment and mechanism family generated from style-conditioned requests", status: "BLOCKED", dependency: "GPT art" },
    { criterion: "producer actually receives native witnesses + master/edit reference; receipts prove calls and pixels", status: "BLOCKED", dependency: "provider; requests are compiled and verified (S3-COMPILE) but not submitted" },
    { criterion: "every qualification state has real files, alphas, landmarks, pivots, masks/underpaint", status: "BLOCKED", dependency: "GPT art; registration producer proven on diagnostic raster (STAGE_2 S2-REG)" },
    { criterion: "removing a high-impact F-art choice changes the output class", status: "PARTIAL_MECHANICAL", dependency: "payload changes (S3-CAUSAL-F64); pixel change needs provider" },
    { criterion: "an actual repair changes the next matching provider payload and produces new inspected pixels", status: "NOT_TESTED", dependency: "repair_learning.py record requires real before/after provider images; none exist" },
    { criterion: "no unapproved image or code-art substitute enters the render manifest", status: "MECHANICAL_PASS", evidence: "film manifest assets: [] ; loader rejects DIAGNOSTIC_FIXTURE in --production (Stage 1 test); ingest marks provenance GPT_PROVIDER_ART with approved_review_id null until review" },
  ] };
proof.mechanical_pass = proof.mechanical_proofs.every((p) => p.pass);
fs.writeFileSync(path.join(REPO, "hybrid_v2", "evidence", "STAGE_3_ART_PROOF.json"), JSON.stringify(proof, null, 1));
console.log("STAGE_3", proof.status, "mechanical:", proof.mechanical_proofs.map((p) => `${p.id}=${p.pass}`).join(" "));
