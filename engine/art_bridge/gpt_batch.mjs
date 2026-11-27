// Batched manual GPT artwork route (E01 batch workflow). Extends EXTERNAL_GPT_OPERATOR_HANDOFF without replacing it:
//   exportBatch — every currently ELIGIBLE job/stage (dependency graph + approvals + committed predecessor selections) gets its normal sealed
//                 per-job handoff (exportGptJob, unchanged); the batch packs them into ONE zip with shared, de-duplicated witness bytes, exact
//                 per-request reference bindings, one Artwork GPT instruction file and one pre-filled return manifest.
//   importBatch — ONE returned zip: extracted safely, each candidate routed to its own handoff and imported through importGptCandidates
//                 (unchanged checks: seal, generation, stage, size/alpha, not-a-witness, not-seen-before). Per-entry ledger: partial success,
//                 safe resume (an imported image is never imported twice), precise failure per entry.
//   reviewSheet / selectBatch — grouped visual review of the imported candidates and one selection file (explicit human choice per job/stage).
// Never fabricated: image origin is the operator's claim (the operator id is a required CLI argument, never defaulted); selection is an explicit
// choice; approvals still go through signed review requests.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { err } from "./errors.mjs";
import { readCurrent } from "./outbox_store.mjs";
import { loadSelection, selectCandidate, loadResult } from "./candidate_store.mjs";
import { exportGptJob, importGptCandidates } from "./gpt_handoff.mjs";

const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f)), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const PY = process.env.PYTHON || "python", pad = (n) => String(n).padStart(2, "0");
const zipDir = (dir, zip) => execFileSync(PY, ["-I", "-c", "import sys,os,zipfile\nwith zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:\n  for d,_,fs in os.walk(sys.argv[1]):\n    for f in sorted(fs): p=os.path.join(d,f); z.write(p,os.path.relpath(p,sys.argv[1]))", dir, zip]);
// safe extraction: refuses absolute paths, drive letters, '..' and links; returns the extracted file list
const unzipSafe = (zip, dir) => JSON.parse(execFileSync(PY, ["-I", "-c", "import sys,os,zipfile,json\nz=zipfile.ZipFile(sys.argv[1]); root=os.path.realpath(sys.argv[2]); out=[]\nfor i in z.infolist():\n  n=i.filename\n  if n.endswith('/'): continue\n  if os.path.isabs(n) or ':' in n or '..' in n.replace('\\\\','/').split('/') or (i.external_attr>>16)&0o170000==0o120000: raise SystemExit('unsafe entry '+n)\n  t=os.path.realpath(os.path.join(root,n))\n  if not t.startswith(root+os.sep): raise SystemExit('unsafe entry '+n)\n  os.makedirs(os.path.dirname(t),exist_ok=True); open(t,'wb').write(z.read(i)); out.append(n.replace('\\\\','/'))\nprint(json.dumps(out))", zip, dir], { encoding: "utf8" }));
const stagesOf = (dir) => J(path.join(dir, "BRIDGE_REQUEST_CONTRACT.json")).stages.length;
const submissionsFor = (out, job, handoff) => { const d = path.join(out, "submissions", job); if (!fs.existsSync(d)) return [];
  return fs.readdirSync(d).filter((k) => fs.existsSync(path.join(d, k, "PROVIDER_RESULT.json"))).map((k) => loadResult(path.join(d, k)).record).filter((r) => r.handoff_id === handoff); };

/** nextStage — the stage a job may be handed off at NOW (a later stage needs the committed selection of the one before it) */
export function nextStage({ out, job }) {
  const cur = readCurrent(out, job); if (!cur?.compiledDir || !fs.existsSync(path.join(cur.compiledDir, "BRIDGE_REQUEST_CONTRACT.json"))) return { eligible: false, reason: "no compiled generation" };
  const n = stagesOf(cur.compiledDir); let done = 0;
  for (let k = 1; k <= n; k++) { try { loadSelection({ out, job, stage: k, generation: cur.digest }); done = k; } catch { break; } }
  if (done === n) return { eligible: false, generation: cur.digest, stages: n, reason: `all ${n} stages selected: ready for ingest-master/ingest-part and review` };
  const stage = done + 1, id = `GPT_ART_HANDOFF_${job}_${cur.digest}_${stage}`, subs = submissionsFor(out, job, id);
  if (subs.some((r) => r.status === "CANDIDATES_RECEIVED_PENDING_SELECTION")) return { eligible: false, generation: cur.digest, stage, stages: n, reason: `stage ${stage} candidates imported: awaiting selection` };
  return { eligible: true, generation: cur.digest, stage, stages: n };
}

/** exportBatch({film, out, jobs?}) → {batch_id, zip, entries, skipped} */
export async function exportBatch({ film, out, only = null, max = Infinity }) {
  const FILM = path.resolve(film), cur = J(path.join(out, "CURRENT.json")), entries = [], skipped = [];
  const order = Object.keys(cur).filter((j) => !only || only.includes(j)).sort((a, b) => (/MIA_MASTER/.test(b) - /MIA_MASTER/.test(a)) || a.localeCompare(b));
  for (const job of order) { if (entries.length >= max) break;
    const ns = nextStage({ out, job }); if (!ns.eligible) { if (ns.reason !== "no compiled generation") skipped.push({ job, reason: ns.reason }); continue; }
    try { const r = await exportGptJob({ film: FILM, out, job, stage: ns.stage }); entries.push({ job, stage: ns.stage, of: ns.stages, handoff_id: r.handoff_id, manifest: r.manifest }); }
    catch (e) { skipped.push({ job, stage: ns.stage, code: e.code || null, reason: e.human_readable_reason || e.message }); } }
  if (!entries.length) return { batch_id: null, zip: null, entries: [], skipped };
  const batch_id = `GPT_ART_BATCH_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${sha(entries.map((e) => e.handoff_id).sort().join("|")).slice(0, 12)}`;
  const dir = path.join(out, "gpt_batches", batch_id); if (fs.existsSync(path.join(dir, "BATCH_MANIFEST.json"))) return { batch_id, zip: `${dir}.zip`, entries: J(path.join(dir, "BATCH_MANIFEST.json")).entries, skipped, reused: true };
  fs.mkdirSync(path.join(dir, "witnesses"), { recursive: true }); const store = {};
  const rows = entries.map((e, i) => { const hd = path.join(out, "gpt_handoffs", e.handoff_id), hm = e.manifest, asset = readCurrent(out, e.job)?.job?.root_dependency || e.job;
    const folder = `jobs/${pad(i + 1)}__${e.job.replace(/^ARTJOB_/, "")}__stage${e.stage}of${e.of}`; fs.mkdirSync(path.join(dir, folder), { recursive: true });
    for (const f of fs.readdirSync(hd)) if (f !== "witnesses" && f !== "IMPORT_MANIFEST.template.json" && f !== "WHAT_TO_DO_IN_CHATGPT.md") fs.copyFileSync(path.join(hd, f), path.join(dir, folder, f));
    const wit = hm.witnesses.map((w) => { const src = path.join(hd, w.file); if (fsha(src) !== w.sha256) throw err("ASSET_HASH_MISMATCH", { record_id: e.handoff_id, reason: `${w.file} changed after the handoff was sealed` });
      const name = `witnesses/${w.sha256.slice(0, 16)}${path.extname(w.file)}`; if (!store[w.sha256]) { fs.copyFileSync(src, path.join(dir, name)); store[w.sha256] = { file: name, original_names: [] }; }
      if (!store[w.sha256].original_names.includes(path.basename(w.file))) store[w.sha256].original_names.push(path.basename(w.file)); return { sha256: w.sha256, file: name, original_name: path.basename(w.file), role: w.role || "STYLE_ONLY" }; });
    const edit = ["PREDECESSOR.png", "MASTER_EDIT_REFERENCE.png"].filter((f) => fs.existsSync(path.join(hd, f))).map((f) => ({ file: `${folder}/${f}`, sha256: fsha(path.join(hd, f)), role: f === "PREDECESSOR.png" ? "IMAGE_TO_EDIT (selected previous stage)" : hm.stage > 1 ? "IDENTITY_REFERENCE (approved master)" : "IMAGE_TO_EDIT (approved master)" }));
    return { n: i + 1, folder, return_folder: `returns/${pad(i + 1)}__${e.job.replace(/^ARTJOB_/, "")}__stage${e.stage}`, handoff_id: e.handoff_id, handoff_seal: fs.readFileSync(path.join(out, "gpt_handoffs", `${e.handoff_id}.sha256`), "utf8").trim(), artjob: e.job, asset,
      stage: e.stage, of: e.of, mode: hm.mode, requested_canvas: hm.size, transparent_background: hm.transparent_background, request_sha256: hm.request_sha256, prompt_file: `${folder}/REQUEST_PROMPT.txt`, prompt_characters: fs.readFileSync(path.join(hd, "REQUEST_PROMPT.txt"), "utf8").length, witnesses: wit, edit_inputs: edit, skill_md_sha256: hm.skill.skill_md_sha256 }; });
  const manifest = { schema: "gpt_art_batch_v1", batch_id, film: J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")).project_id, created_utc: new Date().toISOString(), entries: rows, witness_store: store, skipped,
    note: "Each entry is an individual sealed handoff (its HANDOFF_MANIFEST.json + seal travel with it). Witness bytes are stored once by hash; each entry lists exactly which it must attach." };
  const mtxt = JSON.stringify(manifest, null, 1); fs.writeFileSync(path.join(dir, "BATCH_MANIFEST.json"), mtxt, { flag: "wx" }); fs.writeFileSync(path.join(out, "gpt_batches", `${batch_id}.sha256`), sha(mtxt), { flag: "wx" });
  const tpl = { batch_id, operator_note: "Fill model/session per entry as ChatGPT reports them; leave unknown fields null. Do not compute hashes: the importer does.", entries: rows.map((r) => ({ handoff_id: r.handoff_id, return_folder: r.return_folder, images: ["candidate_1.png"], model: null, session: null, generation_ids: [], visual_evaluation: { method_checks: [], identity_preserved: null, problems: [] }, skipped_reason: null })) };
  fs.writeFileSync(path.join(dir, "RETURN_MANIFEST.template.json"), JSON.stringify(tpl, null, 1));
  fs.writeFileSync(path.join(dir, "ARTWORK_GPT_BATCH_INSTRUCTIONS.md"), batchInstructions(manifest)); zipDir(dir, `${dir}.zip`);
  return { batch_id, zip: `${dir}.zip`, entries: rows, skipped };
}

function batchInstructions(m) {
  const L = [`# ${m.batch_id}: ${m.entries.length} artwork request(s)`, "", "You are Artwork GPT with the installed construct-kurzgesagt-art (F01–F80) skill. Work through the entries below in order. For EACH entry:", "",
    "1. Verify the skill: its SKILL.md sha256 must equal the entry's `skill_md_sha256` (in BATCH_MANIFEST.json). If it does not, stop and report.",
    "2. Attach exactly the entry's witness files (STYLE ONLY: copy no subject, face, layout or story) and, if listed, its edit inputs (the image to edit; identity reference).",
    "3. Use the entry's `REQUEST_PROMPT.txt` verbatim as the image prompt: no edits, summaries or truncation (every prompt is under 32,000 characters).",
    "4. Generate at exactly the entry's `requested_canvas`, transparent background where `transparent_background` is true. Never upscale or resize the result.",
    "5. Save the UNMODIFIED PNG(s) as `<return_folder>/candidate_1.png` (then candidate_2.png, ... if you make more than one).",
    "6. In RETURN_MANIFEST.json (copy RETURN_MANIFEST.template.json), fill that entry: images, model, session/generation ids as shown, and your visual evaluation (method checks, identity, problems). If you skip an entry, set `skipped_reason`.",
    "", "Finally, return ONE zip containing RETURN_MANIFEST.json and the `returns/` folder. Hashes are computed by the importer. Nothing you return is approved by import: a human selects and approves.", "", "| # | job | stage | canvas | mode | prompt | witnesses | edit inputs |", "|---|---|---|---|---|---|---|---|"];
  for (const e of m.entries) L.push(`| ${e.n} | ${e.artjob.replace(/^ARTJOB_/, "")} | ${e.stage}/${e.of} | ${e.requested_canvas} | ${e.mode} | ${e.prompt_file} | ${e.witnesses.map((w) => w.file).join(", ")} | ${e.edit_inputs.map((x) => x.file).join(", ") || "none"} |`);
  return L.join("\n") + "\n";
}

/** importBatch({film, out, zip, operator, submission}) → per-entry outcomes (resumable: imported images are skipped, failures reported exactly) */
export function importBatch({ film, out, zip, operator, submission = null }) {
  if (!operator || !String(operator).trim()) throw err("SCHEMA_VIOLATION", { reason: "import-batch needs --operator <your id>: the person attesting the images came from the handoff (never defaulted)" });
  const zsha = fsha(zip), root = path.join(out, "batch_returns", zsha.slice(0, 16)); fs.mkdirSync(root, { recursive: true }); const files = unzipSafe(zip, root);
  const rmF = files.find((f) => /(^|\/)RETURN_MANIFEST\.json$/.test(f)); if (!rmF) throw err("SCHEMA_VIOLATION", { reason: "the return zip has no RETURN_MANIFEST.json" });
  const base = path.join(root, path.dirname(rmF)), rm = J(path.join(root, rmF)), bdir = path.join(out, "gpt_batches", String(rm.batch_id)), bmF = path.join(bdir, "BATCH_MANIFEST.json"), seal = path.join(out, "gpt_batches", `${rm.batch_id}.sha256`);
  if (!/^GPT_ART_BATCH_\w+$/.test(String(rm.batch_id)) || !fs.existsSync(bmF) || sha(fs.readFileSync(bmF, "utf8")) !== fs.readFileSync(seal, "utf8").trim()) throw err("OUTBOX_IMMUTABLE_VIOLATION", { reason: `unknown or altered batch ${rm.batch_id}` });
  const bm = J(bmF), ledgerF = path.join(out, "gpt_batches", `${rm.batch_id}.IMPORT_LEDGER.jsonl`), done = new Set(fs.existsSync(ledgerF) ? fs.readFileSync(ledgerF, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.outcome === "IMPORTED").flatMap((r) => r.images.map((i) => `${r.handoff_id}:${i.sha256}`)) : []);
  const log = (r) => fs.appendFileSync(ledgerF, JSON.stringify({ at: new Date().toISOString(), return_zip_sha256: zsha, ...r }) + "\n"), results = [];
  for (const be of bm.entries) {
    const re = (rm.entries || []).find((x) => x.handoff_id === be.handoff_id);
    if (!re) { results.push({ n: be.n, handoff_id: be.handoff_id, outcome: "NOT_RETURNED" }); continue; }
    if (re.skipped_reason) { const r = { n: be.n, handoff_id: be.handoff_id, outcome: "SKIPPED_BY_OPERATOR", reason: re.skipped_reason }; log(r); results.push(r); continue; }
    try {
      const imgs = (re.images || []).map((f) => { const p = path.resolve(base, re.return_folder || be.return_folder, f); if (!p.startsWith(path.resolve(base) + path.sep) || !fs.existsSync(p)) throw err("ASSET_PATH_INVALID", { reason: `${re.return_folder || be.return_folder}/${f} is missing from the return zip` }); return { file: p, sha256: fsha(p) }; });
      if (!imgs.length) throw err("SCHEMA_VIOLATION", { reason: "the entry lists no images" });
      const fresh = imgs.filter((i) => !done.has(`${be.handoff_id}:${i.sha256}`)); if (!fresh.length) { results.push({ n: be.n, handoff_id: be.handoff_id, outcome: "ALREADY_IMPORTED" }); continue; }
      const bundle = path.join(root, "bundles", pad(be.n)); fs.mkdirSync(bundle, { recursive: true });
      fresh.forEach((i, k) => fs.copyFileSync(i.file, path.join(bundle, `candidate_${k + 1}.png`)));
      const im = { handoff_id: be.handoff_id, images: fresh.map((i, k) => ({ file: `candidate_${k + 1}.png`, sha256: i.sha256 })), origin_claim: { model: re.model ?? null, session: re.session ?? (re.generation_ids?.length ? re.generation_ids.join(",") : null), operator: String(operator) },
        operator_submission_id: `${rm.batch_id}:${submission || zsha.slice(0, 12)}`, ...(re.carried_from ? { carried_from: re.carried_from } : {}) };
      fs.writeFileSync(path.join(bundle, "IMPORT_MANIFEST.json"), JSON.stringify(im, null, 1)); fs.writeFileSync(path.join(bundle, "VISUAL_EVALUATION.json"), JSON.stringify(re.visual_evaluation ?? null, null, 1));
      const rec = importGptCandidates({ film, out, bundleDir: bundle });
      const r = { n: be.n, handoff_id: be.handoff_id, artjob: be.artjob, stage: be.stage, outcome: rec.status === "CANDIDATES_RECEIVED_PENDING_SELECTION" ? "IMPORTED" : "IMPORTED_ALL_INVALID", images: rec.candidates.map((c) => ({ candidate_id: c.id, sha256: c.sha256, size: [c.width, c.height], valid: c.valid, problems: c.problems })), visual_evaluation: re.visual_evaluation ?? null, carried_from: rec.carried_from ?? null };
      log(r); results.push(r);
    } catch (e) { const r = { n: be.n, handoff_id: be.handoff_id, outcome: "FAILED", code: e.code || null, reason: e.human_readable_reason || e.message }; log(r); results.push(r); }
  }
  for (const x of rm.entries || []) if (!bm.entries.some((b) => b.handoff_id === x.handoff_id)) results.push({ handoff_id: x.handoff_id, outcome: "FAILED", reason: "not an entry of this batch" });
  return { batch_id: rm.batch_id, return_zip_sha256: zsha, summary: results.reduce((m, r) => ((m[r.outcome] = (m[r.outcome] || 0) + 1), m), {}), results };
}

/** reviewSheet({out, batch}) → one HTML page of every imported candidate of the batch + SELECTIONS.template.json (choose = null until a human sets it) */
export function reviewSheet({ out, batch }) {
  const bm = J(path.join(out, "gpt_batches", batch, "BATCH_MANIFEST.json")), dir = path.join(out, "gpt_batches", batch, "review"); fs.mkdirSync(dir, { recursive: true });
  const rel = (f) => path.relative(dir, f).split(path.sep).join("/"), esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const sel = [], cards = [];
  for (const e of bm.entries) { const recs = submissionsFor(out, e.artjob, e.handoff_id), cands = recs.flatMap((r) => r.candidates.map((c) => ({ ...c, carried_from: r.carried_from || null })));
    sel.push({ artjob: e.artjob, stage: e.stage, of: e.of, candidates: cands.map((c) => ({ candidate_id: c.id, valid: c.valid, problems: c.problems })), choose: null });
    cards.push(`<section><h2>${e.n}. ${esc(e.artjob.replace(/^ARTJOB_/, ""))} · stage ${e.stage}/${e.of} · ${esc(e.requested_canvas)}</h2>${cands.length ? cands.map((c) => `<figure><img src="${esc(rel(c.file))}" alt=""><figcaption><code>${esc(c.id)}</code> ${c.width}x${c.height} ${c.valid ? "valid" : "INVALID: " + esc(c.problems.join("; "))}${c.carried_from ? `<br>carried from ${esc(c.carried_from.handoff_id)}` : ""}</figcaption></figure>`).join("") : "<p>no candidate imported yet</p>"}</section>`); }
  fs.writeFileSync(path.join(dir, "REVIEW_SHEET.html"), `<!doctype html><meta charset="utf-8"><title>${esc(batch)} review</title><style>body{font:14px system-ui;margin:24px;background:#f4f4f2}section{margin:0 0 28px}figure{display:inline-block;margin:6px;vertical-align:top;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0/16px 16px;padding:6px}img{max-height:520px;display:block}figcaption{background:#fff;padding:4px;font-size:12px;max-width:360px}</style><h1>${esc(batch)}</h1><p>Set <code>choose</code> to a candidate id per entry in SELECTIONS.json, then run select-batch. Nothing here selects or approves anything.</p>${cards.join("")}`);
  const tplF = path.join(dir, "SELECTIONS.template.json"); fs.writeFileSync(tplF, JSON.stringify({ batch_id: batch, selections: sel }, null, 1));
  return { sheet: path.join(dir, "REVIEW_SHEET.html"), selections_template: tplF, entries: sel.length, with_candidates: sel.filter((s) => s.candidates.length).length };
}

/** selectBatch({out, file}) → applies each explicit `choose` (null entries are left untouched) */
export function selectBatch({ out, file }) {
  const doc = J(file), res = [];
  for (const s of doc.selections || []) { if (!s.choose) { res.push({ artjob: s.artjob, stage: s.stage, outcome: "NOT_CHOSEN" }); continue; }
    try { const cur = readCurrent(out, s.artjob); selectCandidate({ out, job: s.artjob, stage: s.stage, generation: cur.digest, candidateId: s.choose, selector: "OPERATOR" }); res.push({ artjob: s.artjob, stage: s.stage, outcome: "SELECTED", candidate_id: s.choose }); }
    catch (e) { res.push({ artjob: s.artjob, stage: s.stage, outcome: "FAILED", code: e.code || null, reason: e.human_readable_reason || e.message }); } }
  return { results: res };
}

/** carryForwardImport — import an image generated from an EARLIER sealed handoff into the job's CURRENT handoff for the same stage.
 *  verifyCarryForward (gpt_handoff.mjs) proves the requests differ only in the GENERATION CANVAS section; the normal import then checks the image
 *  against the CURRENT size contract. The operator is the attesting person (required); the generation id, if known, is recorded as the session. */
export async function carryForwardImport({ film, out, fromHandoff, png, operator, session = null, model = null, submission = null }) {
  if (!operator || !String(operator).trim()) throw err("SCHEMA_VIOLATION", { reason: "carry-forward needs --operator <your id> (never defaulted)" });
  const old = J(path.join(out, "gpt_handoffs", String(fromHandoff), "HANDOFF_MANIFEST.json")), ns = nextStage({ out, job: old.artjob });
  if (!ns.eligible || ns.stage !== old.stage) throw err("STAGE_PREDECESSOR_MISSING", { record_id: old.artjob, reason: `stage ${old.stage} is not the job's open stage (${ns.reason || `open stage ${ns.stage}`})` });
  const now = await exportGptJob({ film, out, job: old.artjob, stage: old.stage }), b = fs.readFileSync(png), bundle = path.join(out, "batch_returns", "carry_forward", `${now.handoff_id}__${sha(b).slice(0, 12)}`);
  fs.mkdirSync(bundle, { recursive: true }); fs.writeFileSync(path.join(bundle, "candidate_1.png"), b);
  const im = { handoff_id: now.handoff_id, images: [{ file: "candidate_1.png", sha256: sha(b) }], origin_claim: { model, session, operator: String(operator) }, operator_submission_id: submission || `carry-forward:${sha(b).slice(0, 12)}`, carried_from: { handoff_id: fromHandoff } };
  fs.writeFileSync(path.join(bundle, "IMPORT_MANIFEST.json"), JSON.stringify(im, null, 1));
  return importGptCandidates({ film, out, bundleDir: bundle });
}
