#!/usr/bin/env node
// E01 artwork salvage: import the strongest returned image per master (operator-attested; lineage as reported) and prepare deterministic
// derivatives (alpha_ceiling) with re-executable records. Selects and approves nothing.
//   node tools/tbo/e01_salvage.mjs --film films/e01 --out <outbox> --salvage <dir with CATALOG.json, STRONGEST.json, catalog/> --operator <id>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), OUT = path.resolve(arg("out")), SAL = path.resolve(arg("salvage")), OP = arg("operator"); if (!OP) throw new Error("--operator required");
const G = await imp("engine/art_bridge/gpt_handoff.mjs"), PR = await imp("engine/art_bridge/art_prepare.mjs"), I = await imp("engine/art_bridge/art_intake.mjs");
const strongest = J(path.join(SAL, "STRONGEST.json")), jobs = (await I.planJobs({ film: FILM })).jobs, record = { at: new Date().toISOString(), operator: OP, imported: [], prepared: [] };
const evals = {}; for (const d of fs.readdirSync("E:/TBO_PRIVATE/E01_ART_RETURNS/reconciled_extracted/returns")) { const st = `E:/TBO_PRIVATE/E01_ART_RETURNS/reconciled_extracted/returns/${d}/stage01`; for (const f of fs.readdirSync(st).filter((x) => x.endsWith(".CANDIDATE_EVALUATION.json"))) { const v = J(path.join(st, f)); evals[v.metrics.sha256] = v; } }
fs.mkdirSync(path.join(OUT, "prepared", "parents"), { recursive: true });
for (const [asset, s] of Object.entries(strongest)) {
  const job = jobs.find((j) => j.root_dependency === asset), file = path.join(SAL, "catalog", `${s.sha256.slice(0, 16)}.png`); if (sha(file) !== s.sha256) throw new Error(`catalog bytes changed: ${asset}`);
  let candidateFile = null;
  // already a valid imported candidate (e.g. Mia's human-selected stage-1 original)?
  try { I.requireProvenanceLineage({ file, provenance: "GPT_OPERATOR_HANDOFF", outbox: OUT, record_id: asset }); candidateFile = file; record.imported.push({ asset, sha256: s.sha256, outcome: "ALREADY_A_VALID_CANDIDATE" }); } catch { /* import below */ }
  if (!candidateFile) {
    const h = await G.exportGptJob({ film: FILM, out: OUT, job: job.artjob_id, stage: 1 }), v = evals[s.sha256], b = path.join(OUT, "batch_returns", "salvage", `${asset}__${s.sha256.slice(0, 12)}`); fs.mkdirSync(b, { recursive: true }); fs.copyFileSync(file, path.join(b, "candidate.png"));
    const lineage = v ? { operation: "REFERENCE_GENERATE", attestation: "OPERATOR_ATTESTED_REFERENCE_GENERATION", parent_sha256: v.intended_reference_sha256 || null, provider_edit_op: v.provider_edit_op ?? null, provider_parent_gen_id: v.provider_parent_gen_id ?? null, generation_id: v.generation_id, note: v.lineage_note }
      : { operation: "GENERATE", attestation: "OPERATOR_ATTESTED_GENERATION", parent_sha256: null, note: "original stage-1 generation (batch GPT_ART_BATCH_20261127_8b2ca7263773)" };
    fs.writeFileSync(path.join(b, "IMPORT_MANIFEST.json"), JSON.stringify({ handoff_id: h.handoff_id, images: [{ file: "candidate.png", sha256: s.sha256, lineage }], origin_claim: { model: v?.model_reported || "DALL-E", session: v?.generation_id || null, operator: OP }, operator_submission_id: `salvage:${s.sha256.slice(0, 12)}` }, null, 1));
    const rec = G.importGptCandidates({ film: FILM, out: OUT, bundleDir: b }); record.imported.push({ asset, sha256: s.sha256, version: s.version, handoff: h.handoff_id, candidate_id: rec.candidates[0].id, valid: rec.candidates[0].valid, problems: rec.candidates[0].problems, lineage }); candidateFile = rec.candidates[0].file; }
  // deterministic preparation: opaque interiors stored at alpha 253/254 by the provider → 255 (colour untouched, no resampling)
  if (s.alpha_max < 255 || s.n254 > 0) { fs.copyFileSync(candidateFile, path.join(OUT, "prepared", "parents", `${s.sha256.slice(0, 16)}.png`));
    const r = PR.prepareImage({ parentFile: path.join(OUT, "prepared", "parents", `${s.sha256.slice(0, 16)}.png`), ops: [{ op: "alpha_ceiling", from: 253 }], outDir: path.join(OUT, "prepared"), note: `${asset}: provider stored opaque interiors at alpha ${s.alpha_max === 255 ? "254" : s.alpha_max}` });
    const lin = I.requireProvenanceLineage({ file: r.file, provenance: "GPT_OPERATOR_HANDOFF", outbox: OUT, record_id: asset }); record.prepared.push({ asset, parent_sha256: s.sha256, prepared_sha256: r.record.result_sha256, file: r.file, ops: r.record.ops, lineage_verified: !!lin?.prepared }); }
}
fs.writeFileSync(path.join(SAL, "SALVAGE_RECORD.json"), JSON.stringify(record, null, 1)); console.log(JSON.stringify({ imported: record.imported.map((x) => `${x.asset} ${x.outcome || (x.valid ? "IMPORTED" : "INVALID " + x.problems)}`), prepared: record.prepared.map((x) => `${x.asset} ${x.prepared_sha256.slice(0, 12)} lineage ${x.lineage_verified}`) }, null, 1));
