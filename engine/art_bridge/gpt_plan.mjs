// Consolidated ordered artwork execution plan (E01 autonomous artwork production). Extends the batched manual GPT route; nothing is replaced.
// Why it exists: the first batch could only "paste the sealed prompt, generate, return". It carried no authorized edit, no compiled repair
// request, no place for intermediate images or lineage, and every packing split of a stage needed a separate human handoff. Artwork GPT therefore
// (correctly) returned 10 audited originals and executed 0 repairs.
//   exportPlan — for each job: EVERY remaining stage's sealed request in order (stage k edits the image chosen at stage k-1), the open stage's
//                repair seeds (original candidates + their audits + a compiled source-attached REPAIR_EDIT request), shared de-duplicated
//                witnesses, motion constraints, resolution contract, and ONE execution protocol (the skill's own §3B prompt→pixels→repair loop).
//   importPlan — stage by stage: the normal handoff is exported only once its predecessor exists, its request hash must equal the plan's, every
//                image's declared parent must be the seed, the stage predecessor or an earlier image of the same stage; candidates are imported
//                through importGptCandidates (all existing checks). Artwork GPT's choice at an INTERMEDIATE stage is recorded as a MACHINE_GPT
//                selection (never a human approval) only when the stage reports PASS and the plan continues with the next stage; the last stage
//                of a plan is left for human selection; an UNRESOLVED stage stops that job's chain with its blockers.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { readCurrent } from "./outbox_store.mjs";
import { loadSelection, selectCandidate } from "./candidate_store.mjs";
import { exportGptJob, importGptCandidates, engineSectionDiff } from "./gpt_handoff.mjs";
import { nextStage, zipDir, unzipSafe } from "./gpt_batch.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f)), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), pad = (n) => String(n).padStart(2, "0");
// REFERENCE_GENERATE: a new generation conditioned on the parent image attached as a REFERENCE (when the tool cannot take it as an edit target);
// its parent is still the exact bytes it was conditioned on, and the same predecessor comparison and identity checks apply.
const OPS = ["GENERATE", "EDIT", "REPAIR_EDIT", "REFERENCE_GENERATE"];

/** the compact source-attached repair edit for one seed: exact preserve list, exact candidate findings, the director's correction, the canvas */
export function repairEditPrompt({ asset, stage, of, methods, canvas, transparent, seedSha, audit = {}, directive = null }) {
  const cs = audit.current_stage || {}, L = (x) => (Array.isArray(x) ? x : x ? [x] : []).map((s) => `- ${s}`);
  return [`# SOURCE-ATTACHED REPAIR EDIT — ${asset}, stage ${stage}/${of} (methods ${methods.join(", ")})`,
    `Edit the attached SEED image (sha256 ${seedSha}). It is this job's own stage-${stage} candidate. Change only what is listed under CORRECT; keep everything under PRESERVE.`,
    `The sealed stage request (REQUEST_PROMPT.txt of this stage) remains the complete governing specification; this edit corrects the seed toward it.`, "",
    "## PRESERVE (artistic identity that passed review)", ...L(cs.preserve), "", "## CORRECT (exact findings on this candidate's pixels)", ...L(cs.method_findings), ...L(audit.unresolved_blockers), "",
    ...(directive ? ["## DIRECTOR'S CORRECTION FOR THIS ASSET", ...L(directive), ""] : []), "## CORRECTIVE CONSTRUCTION OPERATIONS", ...L(cs.repair_instruction), "", "## RE-TEST AFTER THE EDIT", ...L(cs.falsification_retest), "",
    `## OUTPUT\nReturn the edited image at ${canvas.join(" or ")} (the tool's native size for this request), ${transparent ? "transparent background with real alpha" : "opaque"}; never resize, crop to fit, or upscale.`].join("\n");
}

/** exportPlan({film, out, jobs, maxStage?, seeds?}) — seeds: {artjob: [{file, sha256, audit, directive, source}]}; maxStage: {artjob: k} */
export async function exportPlan({ film, out, jobs, maxStage = {}, seeds = {} }) {
  const FILM = path.resolve(film), rows = [], skipped = [], store = {};
  for (const job of jobs) {
    const ns = nextStage({ out, job }); if (!ns.eligible) { skipped.push({ job, reason: ns.reason }); continue; }
    const cur = readCurrent(out, job), brc = J(path.join(cur.compiledDir, "BRIDGE_REQUEST_CONTRACT.json")), rc = J(path.join(cur.compiledDir, "RESOLUTION_CONTRACT.json")), pre = J(path.join(cur.compiledDir, "PROVIDER_PRE_SUBMISSION_MANIFEST.json"));
    const last = Math.min(brc.stages.length, maxStage[job] ?? brc.stages.length); if (last < ns.stage) { skipped.push({ job, reason: `held at stage ${ns.stage - 1}` }); continue; }
    // the open stage must be exportable now (approved contract, intact generation); later stages are bound to it by the plan seal
    const open = await exportGptJob({ film: FILM, out, job, stage: ns.stage });
    rows.push({ job, asset: cur.job.root_dependency, generation: cur.digest, open, brc, rc, pre, first: ns.stage, last, of: brc.stages.length }); }
  if (!rows.length) return { plan_id: null, skipped };
  const plan_id = `GPT_ART_PLAN_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}_${sha(rows.map((r) => `${r.job}:${r.generation}:${r.first}-${r.last}`).join("|") + JSON.stringify(Object.values(seeds).flat().map((s) => s.sha256))).slice(0, 12)}`;
  const dir = path.join(out, "gpt_plans", plan_id); if (fs.existsSync(path.join(dir, "PLAN_MANIFEST.json"))) return { plan_id, zip: `${dir}.zip`, manifest: J(path.join(dir, "PLAN_MANIFEST.json")), skipped, reused: true };
  fs.mkdirSync(path.join(dir, "witnesses"), { recursive: true });
  const wit = (w) => { if (fsha(w.path) !== w.sha256) throw err("ASSET_HASH_MISMATCH", { reason: `witness ${path.basename(w.path)} changed` }); const name = `witnesses/${w.sha256.slice(0, 16)}${path.extname(w.path)}`; if (!store[w.sha256]) { fs.copyFileSync(w.path, path.join(dir, name)); store[w.sha256] = name; } return { sha256: w.sha256, file: name, original_name: path.basename(w.path), role: w.role || "STYLE_ONLY" }; };
  const entries = rows.map((r, i) => { const folder = `jobs/${pad(i + 1)}__${r.asset}`, D = path.join(dir, folder); fs.mkdirSync(D, { recursive: true });
    const hd = path.join(out, "gpt_handoffs", r.open.handoff_id); for (const f of ["CONTRACT_BRIEF.md", "DESIGN.json", "ART_MOTION_CONSTRAINTS.json", "PREDECESSOR.png", "MASTER_EDIT_REFERENCE.png"]) if (fs.existsSync(path.join(hd, f))) fs.copyFileSync(path.join(hd, f), path.join(D, f));
    fs.writeFileSync(path.join(D, "RESOLUTION_CONTRACT.json"), JSON.stringify(r.rc, null, 1));
    const stages = []; for (let k = r.first; k <= r.last; k++) { const req = J(path.join(readCurrent(out, r.job).compiledDir, `STAGE_${pad(k)}_REQUEST.json`)), sf = `${folder}/stage${pad(k)}_REQUEST_PROMPT.txt`; fs.writeFileSync(path.join(dir, sf), req.prompt);
      stages.push({ stage: k, phase: r.brc.stages.find((s) => s.index === k)?.phase ?? null, methods: req.methods, mode: req.mode, prompt_file: sf, request_sha256: sha(req.prompt), prompt_characters: req.prompt.length,
        edit_input: k === r.first ? (r.open.manifest.predecessor_sha256 ? { file: `${folder}/${fs.existsSync(path.join(D, "PREDECESSOR.png")) ? "PREDECESSOR.png" : "MASTER_EDIT_REFERENCE.png"}`, sha256: r.open.manifest.predecessor_sha256 } : null) : "THE_IMAGE_YOU_CHOSE_AT_THE_PREVIOUS_STAGE" }); }
    const sd = (seeds[r.job] || []).map((s, j) => { const f = `${folder}/seed_${j + 1}.png`; fs.copyFileSync(s.file, path.join(dir, f)); if (fsha(path.join(dir, f)) !== s.sha256) throw err("ASSET_HASH_MISMATCH", { reason: `seed ${s.file} ≠ ${s.sha256}` });
      if (s.audit) fs.writeFileSync(path.join(dir, `${folder}/seed_${j + 1}.CANDIDATE_AUDIT.json`), JSON.stringify(s.audit, null, 1));
      const rp = repairEditPrompt({ asset: r.asset, stage: r.first, of: r.of, methods: stages[0].methods, canvas: r.rc.accepted_canvases || [r.rc.requested_canvas], transparent: r.open.manifest.transparent_background, seedSha: s.sha256, audit: s.audit, directive: s.directive }), rf = `${folder}/seed_${j + 1}.REPAIR_EDIT_PROMPT.txt`; fs.writeFileSync(path.join(dir, rf), rp);
      return { seed: f, sha256: s.sha256, source: s.source || null, audit: s.audit ? `${folder}/seed_${j + 1}.CANDIDATE_AUDIT.json` : null, repair_edit_prompt: rf, repair_edit_sha256: sha(rp), repair_edit_characters: rp.length }; });
    return { n: i + 1, folder, artjob: r.job, asset: r.asset, generation: r.generation, stages_total: r.of, plan_stages: [r.first, r.last], open_stage_handoff: r.open.handoff_id, requested_canvas: r.rc.requested_canvas, accepted_canvases: r.rc.accepted_canvases || [r.rc.requested_canvas], transparent_background: r.open.manifest.transparent_background,
      witnesses: r.pre.source_image_inputs.map(wit), stages, repair_seeds: sd, skill_md_sha256: r.open.manifest.skill.skill_md_sha256, final_stage_is_job_final: r.last === r.of }; });
  const manifest = { schema: "gpt_art_plan_v1", plan_id, film: J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")).project_id, created_utc: new Date().toISOString(), entries, skipped, protocol: "ARTWORK_GPT_EXECUTION_PROTOCOL.md" };
  const mtxt = JSON.stringify(manifest, null, 1); fs.writeFileSync(path.join(dir, "PLAN_MANIFEST.json"), mtxt, { flag: "wx" }); fs.writeFileSync(path.join(out, "gpt_plans", `${plan_id}.sha256`), sha(mtxt), { flag: "wx" });
  fs.writeFileSync(path.join(dir, "ARTWORK_GPT_EXECUTION_PROTOCOL.md"), protocol(manifest));
  fs.writeFileSync(path.join(dir, "RETURN_MANIFEST.template.json"), JSON.stringify({ plan_id, entries: entries.map((e) => ({ artjob: e.artjob, stages: e.stages.map((s) => ({ stage: s.stage, status: null, machine_choice: null, images: [], unresolved_blockers: [] })) })) }, null, 1));
  zipDir(dir, `${dir}.zip`); const attachments = planAttachments({ out, plan_id }); return { plan_id, zip: `${dir}.zip`, attachments: attachments.dir, manifest, skipped };
}

function protocol(m) {
  const L = [`# ${m.plan_id}: authorized ordered artwork execution`, "",
    "You are Artwork GPT with the installed construct-kurzgesagt-art (F01–F80) skill. This plan AUTHORIZES you to execute, without returning to the user between steps, every listed stage of every entry, including image EDITS of your own candidates, following the skill's AUTONOMOUS_VISUAL_PRODUCTION_LOOP.md §3B (prompt → pixels → repair) and ITERATIVE_REPAIR.md. A report that describes a correctable defect is NOT completion; a repair instruction without an actual edited image is NOT a repair.", "",
    "## For every entry, for every stage in order", "1. Verify the skill (SKILL.md sha256 = entry.skill_md_sha256). Read the stage's REQUEST_PROMPT, the entry's DESIGN.json, CONTRACT_BRIEF.md, ART_MOTION_CONSTRAINTS.json and RESOLUTION_CONTRACT.json.",
    "2. Resolve the applicable molecular construction questions (F57–F80) for this stage before drawing.",
    "3. Produce the stage image with the best AUTHORIZED construction method the tool supports: an EDIT of the parent image when it can be the edit target, otherwise REFERENCE_GENERATE (a new generation with the parent attached as the identity reference). Record which one you used. FIRST STAGE WITH REPAIR SEEDS: do not regenerate from nothing; correct the seed with its REPAIR_EDIT_PROMPT.txt (seed attached; the stage witnesses attached as STYLE ONLY). FIRST STAGE WITHOUT SEEDS: generate with the stage REQUEST_PROMPT verbatim (plus edit_input if listed). LATER STAGES: edit the image you chose at the previous stage with that stage's REQUEST_PROMPT verbatim.",
    "4. Recover the actual generated PNG bytes and inspect them at full size, at a representative native crop and at 1/10 scale.", "5. Evaluate every method of the stage, the motion constraints (attached anatomy, joints, contacts, hidden surfaces, alternate views) and the resolution contract (accepted canvas, margins, alpha; plates bleed).",
    "6. For each defect name the producing cause (which construction decision is wrong).", "7. Write a source-grounded corrective construction instruction (method id + the visible operation).", "8. Execute that correction as an actual image EDIT of the image you just inspected (never describe it instead).",
    "9. Inspect the corrected pixels.", "10. Verify the edit did not damage identity, anatomy, style or any requirement that already passed; if it did, keep the better parent and try a narrower edit.", "11. Repeat 6–10 while a correctable defect remains, at most 3 repair rounds per stage. Never claim a repair you did not run.",
    "12. Choose the best image of the stage (`machine_choice`) only if it passes; set status PASS. Otherwise set status UNRESOLVED with exact blockers and STOP that entry (do not run its later stages).", "",
    "## Rules", "- Every image you create goes in the return, including failed intermediate ones, with its lineage: {file, operation GENERATE|EDIT|REPAIR_EDIT, parent_sha256 (the exact bytes you edited; null only for a from-nothing generation), round, evaluation}.",
    "- Never resize, crop to fit or upscale. Accepted sizes per entry: entry.accepted_canvases. Never bake another identity's prop or person into an asset: each owner is its own asset.", "- Your machine_choice is NOT an approval. The human reviews the consolidated results; canonical masters are approved only by signed human review.",
    "- If the tool cannot do something (e.g. attach the seed for an edit), record it as an unresolved blocker with the exact limitation; do not substitute a different operation silently.", "- For the final stage image of each MASTER also return `<image>.LANDMARKS.json` = {landmarks: {name: [x, y]}} in that image's pixels for every required_continuity_landmark you can actually locate (plus cranium_top for characters: the cranial crown, excluding hair); set the image entry's `landmarks_file`. These are PROPOSED; the human confirms them at master review. Never guess a point you cannot see.", "",
    "## Return", "ONE zip: RETURN_MANIFEST.json (from RETURN_MANIFEST.template.json) + `returns/<entry folder name>/stageNN/<files>.png`. In each stage: status, machine_choice (file name), images[], unresolved_blockers[], model, session/generation ids if shown. The importer computes hashes; you may include them.", "",
    "| # | asset | stages | canvas | seeds |", "|---|---|---|---|---|"];
  for (const e of m.entries) L.push(`| ${e.n} | ${e.asset} | ${e.plan_stages.join("–")} of ${e.stages_total}${e.final_stage_is_job_final ? "" : " (held after)"} | ${e.accepted_canvases.join(" / ")} | ${e.repair_seeds.length} |`);
  return L.join("\n") + "\n";
}

/** importPlan({film, out, zip, operator}) → per job, per stage outcomes; resumable (already imported images and existing selections are skipped) */
export async function importPlan({ film, out, zip, operator }) {
  if (!operator || !String(operator).trim()) throw err("SCHEMA_VIOLATION", { reason: "import-plan needs --operator <your id> (never defaulted)" });
  const zsha = fsha(zip), root = path.join(out, "plan_returns", zsha.slice(0, 16)); fs.mkdirSync(root, { recursive: true }); const files = unzipSafe(zip, root);
  const rmF = files.find((f) => /(^|\/)RETURN_MANIFEST\.json$/.test(f)); if (!rmF) throw err("SCHEMA_VIOLATION", { reason: "the return zip has no RETURN_MANIFEST.json" });
  const base = path.join(root, path.dirname(rmF)), rm = J(path.join(root, rmF)), pmF = path.join(out, "gpt_plans", String(rm.plan_id), "PLAN_MANIFEST.json"), seal = path.join(out, "gpt_plans", `${rm.plan_id}.sha256`);
  if (!/^GPT_ART_PLAN_\w+$/.test(String(rm.plan_id)) || !fs.existsSync(pmF) || sha(fs.readFileSync(pmF, "utf8")) !== fs.readFileSync(seal, "utf8").trim()) throw err("OUTBOX_IMMUTABLE_VIOLATION", { reason: `unknown or altered plan ${rm.plan_id}` });
  const pm = J(pmF), ledger = path.join(out, "gpt_plans", `${rm.plan_id}.IMPORT_LEDGER.jsonl`), log = (r) => fs.appendFileSync(ledger, JSON.stringify({ at: new Date().toISOString(), return_zip_sha256: zsha, ...r }) + "\n"), results = [];
  for (const pe of pm.entries) {
    const re = (rm.entries || []).find((x) => x.artjob === pe.artjob); if (!re) { results.push({ artjob: pe.artjob, outcome: "NOT_RETURNED" }); continue; }
    { const B = await import("./gpt_batch.mjs"), rb = await B.rebaseSelections({ film, out, job: pe.artjob, operator }); if (rb.rebased?.some((x) => x.outcome === "REBASED")) results.push({ artjob: pe.artjob, outcome: "EARLIER_SELECTIONS_REBASED", rebased: rb.rebased }); } // code/approved changes renew generations; verified-identical choices carry
    for (const ps of pe.stages) {
      const rs = (re.stages || []).find((x) => x.stage === ps.stage), tag = { artjob: pe.artjob, stage: ps.stage };
      if (!rs || !(rs.images || []).length) { results.push({ ...tag, outcome: "NOT_RETURNED" }); break; }
      try {
        const cur = readCurrent(out, pe.artjob); try { loadSelection({ out, job: pe.artjob, stage: ps.stage, generation: cur.digest }); results.push({ ...tag, outcome: "ALREADY_SELECTED" }); continue; } catch { /* open */ }
        const ns = nextStage({ out, job: pe.artjob }); if (ns.stage !== ps.stage) throw err("STAGE_PREDECESSOR_MISSING", { reason: `stage ${ps.stage} is not open (${ns.reason || `open stage ${ns.stage}`})` });
        const h = await exportGptJob({ film, out, job: pe.artjob, stage: ps.stage }); let requestDelta = null; if (h.manifest.request_sha256 !== ps.request_sha256) { // an approved change may alter only engine-computed sections (size contract, detail budget)
          const d = engineSectionDiff(fs.readFileSync(path.join(out, "gpt_plans", rm.plan_id, ps.prompt_file), "utf8"), fs.readFileSync(path.join(out, "gpt_handoffs", h.handoff_id, "REQUEST_PROMPT.txt"), "utf8"));
          if (!d.equal_outside_engine_sections) throw err("STALE_COMPILED_REQUEST", { record_id: h.handoff_id, reason: "the current stage request differs from the plan's sealed request beyond engine-computed sections: re-export the plan" }); requestDelta = d.delta; }
        const sd = new Set(ps.stage === pe.plan_stages[0] ? pe.repair_seeds.map((s) => s.sha256) : []), pred = h.manifest.predecessor_sha256 || null, imgs = rs.images.map((x) => { const p = path.resolve(base, x.path || `returns/${path.basename(pe.folder)}/stage${pad(ps.stage)}/${x.file}`); if (!p.startsWith(path.resolve(base) + path.sep) || !fs.existsSync(p)) throw err("ASSET_PATH_INVALID", { reason: `${x.file} is missing from the return zip` }); return { ...x, abs: p, sha256: fsha(p) }; });
        const seen = new Set(); for (const x of imgs) { if (!OPS.includes(x.operation)) throw err("SCHEMA_VIOLATION", { reason: `${x.file}: operation must be one of ${OPS}` }); const par = x.parent_sha256 ?? null;
          const ok = par === null ? x.operation === "GENERATE" && !sd.size && !pred : sd.has(par) || par === pred || seen.has(par); if (!ok) throw err("STAGE_PREDECESSOR_MISSING", { reason: `${x.file}: parent ${par ?? "none"} is not this stage's seed, predecessor or an earlier image of the stage (${x.operation})` }); seen.add(x.sha256); }
        const b = path.join(root, "bundles", `${pe.n}_${ps.stage}`); fs.mkdirSync(b, { recursive: true }); imgs.forEach((x, k) => fs.copyFileSync(x.abs, path.join(b, `img_${k + 1}.png`)));
        fs.writeFileSync(path.join(b, "IMPORT_MANIFEST.json"), JSON.stringify({ handoff_id: h.handoff_id, images: imgs.map((x, k) => ({ file: `img_${k + 1}.png`, sha256: x.sha256, lineage: { returned_as: x.file, operation: x.operation, parent_sha256: x.parent_sha256 ?? null, round: x.round ?? null, evaluation: x.evaluation ?? null } })), origin_claim: { model: rs.model ?? re.model ?? null, session: rs.session ?? null, operator: String(operator) }, operator_submission_id: `${rm.plan_id}:${pe.n}:${ps.stage}:${zsha.slice(0, 8)}` }, null, 1));
        const rec = importGptCandidates({ film, out, bundleDir: b }), byFile = Object.fromEntries(imgs.map((x, k) => [x.file, rec.candidates[k]]));
        // PROPOSED landmarks for registration (operator-proposed pixel coordinates; a human confirms them in the master review — never auto-reviewed)
        const proposed = []; for (const [k, x] of imgs.entries()) { if (!x.landmarks_file) continue; const lf = path.resolve(path.dirname(x.abs), x.landmarks_file); if (!lf.startsWith(path.resolve(base) + path.sep) || !fs.existsSync(lf)) throw err("ASSET_PATH_INVALID", { reason: `${x.landmarks_file} is missing from the return zip` });
          const L = J(lf), pts = L.landmarks || L; if (!pts || typeof pts !== "object" || !Object.values(pts).every((v) => Array.isArray(v) && v.length === 2 && v.every(Number.isFinite))) throw err("SCHEMA_VIOLATION", { reason: `${x.landmarks_file}: landmarks must be {name: [x, y]} pixel coordinates` });
          const c = rec.candidates[k], dst = path.join(path.dirname(c.file), `${path.basename(c.file, ".png")}.PROPOSED_LANDMARKS.json`), body = JSON.stringify({ candidate_sha256: c.sha256, status: "PROPOSED_BY_OPERATOR_NOT_REVIEWED", proposed_by: String(operator), landmarks: pts }, null, 1);
          if (!fs.existsSync(dst)) fs.writeFileSync(dst, body); proposed.push({ candidate_id: c.id, file: dst, sha256: sha(fs.readFileSync(dst)), count: Object.keys(pts).length }); }
        const r = { ...tag, outcome: "IMPORTED", status: rs.status, ...(proposed.length ? { proposed_landmarks: proposed } : {}), ...(requestDelta ? { request_changed_since_plan: requestDelta.map((x) => x.section) } : {}), candidates: rec.candidates.map((c, k) => ({ candidate_id: c.id, file: imgs[k].file, operation: imgs[k].operation, parent: imgs[k].parent_sha256 ?? null, valid: c.valid, problems: c.problems })), unresolved_blockers: rs.unresolved_blockers || [] };
        const continues = ps.stage < pe.plan_stages[1];
        if (rs.status === "PASS" && rs.machine_choice && continues) { const c = byFile[rs.machine_choice]; if (!c?.valid) throw err("STAGE_PREDECESSOR_MISSING", { reason: `machine_choice ${rs.machine_choice} is not a valid imported candidate (${c?.problems?.join("; ") || "absent"})` });
          selectCandidate({ out, job: pe.artjob, stage: ps.stage, generation: cur.digest, candidateId: c.id, selector: "MACHINE_GPT" }); r.machine_selected = c.id; }
        else r.selection = rs.status !== "PASS" ? "NONE (stage UNRESOLVED: chain stops here)" : continues ? "NONE (no machine_choice)" : "AWAITING_HUMAN_SELECTION (last stage of this plan)";
        log(r); results.push(r); if (!r.machine_selected) break;
      } catch (e) { const r = { ...tag, outcome: "FAILED", code: e.code || null, reason: e.human_readable_reason || e.message }; log(r); results.push(r); break; }
    } }
  return { plan_id: rm.plan_id, summary: results.reduce((m, r) => ((m[r.outcome] = (m[r.outcome] || 0) + 1), m), {}), results };
}

/** planAttachments({out, plan_id}) — a FLAT operator-attachment folder beside the sealed plan (the plan itself is untouched): every image the
 *  operator must attach, clearly named, with ATTACHMENT_MAP.json/.csv giving its exact ArtJob, stage, role, sha256 and the prompt to use it with. */
export function planAttachments({ out, plan_id }) {
  const dir = path.join(out, "gpt_plans", plan_id), pm = J(path.join(dir, "PLAN_MANIFEST.json")), dest = path.join(out, "gpt_plans", `${plan_id}__OPERATOR_ATTACHMENTS`); fs.mkdirSync(dest, { recursive: true });
  const rows = [], put = (src, name, row) => { const f = path.join(dest, name); if (!fs.existsSync(f)) fs.copyFileSync(path.join(dir, src), f); const h = fsha(f); if (row.sha256 && h !== row.sha256) throw err("ASSET_HASH_MISMATCH", { reason: `${src} ≠ ${row.sha256}` }); rows.push({ file: name, sha256: h, ...row }); };
  for (const e of pm.entries) { const a = e.asset.replace(/[^\w.-]/g, "_"), N = pad(e.n);
    e.repair_seeds.forEach((s, i) => put(s.seed, `${N}_${a}__stage${pad(e.plan_stages[0])}__REPAIR_SEED_${i + 1}__${s.sha256.slice(0, 8)}.png`, { artjob: e.artjob, asset: e.asset, stage: e.plan_stages[0], role: "IMAGE_TO_EDIT (repair seed: this job's own original candidate)", use_with: s.repair_edit_prompt, sha256: s.sha256 }));
    const ei = e.stages[0].edit_input; if (ei && typeof ei === "object") put(ei.file, `${N}_${a}__stage${pad(e.plan_stages[0])}__EDIT_INPUT__${ei.sha256.slice(0, 8)}.png`, { artjob: e.artjob, asset: e.asset, stage: e.plan_stages[0], role: "IMAGE_TO_EDIT (selected predecessor / approved master)", use_with: e.stages[0].prompt_file, sha256: ei.sha256 });
    for (const w of e.witnesses) put(w.file, `W_${w.sha256.slice(0, 8)}__${w.original_name}`, { artjob: e.artjob, asset: e.asset, stage: `${e.plan_stages[0]}-${e.plan_stages[1]}`, role: "STYLE_ONLY witness (attach with every stage of this job)", use_with: e.stages.map((s) => s.prompt_file).join(" | "), sha256: w.sha256 }); }
  const map = { plan_id, plan_manifest_sha256: fsha(path.join(dir, "PLAN_MANIFEST.json")), note: "Flat copies for attaching in ChatGPT. The sealed plan zip remains the authority; every file here is hash-identical to its plan source.", attachments: rows };
  fs.writeFileSync(path.join(dest, "ATTACHMENT_MAP.json"), JSON.stringify(map, null, 1));
  fs.writeFileSync(path.join(dest, "ATTACHMENT_MAP.csv"), ["file,sha256,artjob,asset,stage,role,use_with", ...rows.map((r) => [r.file, r.sha256, r.artjob, r.asset, r.stage, r.role, r.use_with].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))].join("\n") + "\n");
  return { dir: dest, files: new Set(rows.map((r) => r.file)).size, rows: rows.length };
}

/** advanceProduction({film, out, operator}) — ONE command after any return or approval: refresh generations, carry verified selections, export one
 *  plan of every newly executable job/stage (masters' next stages and dependents released by an approved master) that no existing plan covers,
 *  and write PRODUCTION_PROGRAM.json: per job its state, the plan carrying it, or the exact dependency it waits on. Never selects or approves. */
export async function advanceProduction({ film, out, operator, exportOutbox }) { // exportOutbox is passed in by the CLI (it lives in the CLI module)
  const FILM = path.resolve(film), B = await import("./gpt_batch.mjs");
  await exportOutbox({ film: FILM, out }); const cur = J(path.join(out, "CURRENT.json")), idx = new Map(J(path.join(out, "OUTBOX_INDEX.json")).index.map((r) => [r.artjob_id, r]));
  const plans = fs.existsSync(path.join(out, "gpt_plans")) ? fs.readdirSync(path.join(out, "gpt_plans")).filter((f) => /^GPT_ART_PLAN_\w+$/.test(f) && fs.existsSync(path.join(out, "gpt_plans", f, "PLAN_MANIFEST.json"))).map((f) => J(path.join(out, "gpt_plans", f, "PLAN_MANIFEST.json"))) : [];
  const covers = (job, stage) => plans.find((pm) => pm.entries.some((e) => e.artjob === job && e.plan_stages[0] <= stage && stage <= e.plan_stages[1]));
  const program = [], fresh = [];
  for (const job of Object.keys(cur)) { const rec = idx.get(job);
    if (operator) await B.rebaseSelections({ film: FILM, out, job, operator }).catch(() => null);
    const ns = B.nextStage({ out, job });
    if (ns.eligible) { const pm = covers(job, ns.stage); if (pm) program.push({ job, state: "IN_FLIGHT", stage: ns.stage, of: ns.stages, plan: pm.plan_id }); else { fresh.push(job); program.push({ job, state: "EXPORTED_NOW", stage: ns.stage, of: ns.stages }); } }
    else program.push({ job, state: rec?.status === "WAITING_ON_MASTER_APPROVAL" ? "WAITING_ON_MASTER_APPROVAL" : ns.reason?.startsWith("all ") ? "ALL_STAGES_SELECTED_READY_FOR_INGEST_AND_REVIEW" : rec?.status || "WAITING", detail: ns.reason || rec?.blocked_on?.join("; ") || null, derived_from: rec?.derived_from || null, derivation: rec?.derivation?.route || null }); }
  const r = fresh.length ? await exportPlan({ film: FILM, out, jobs: fresh }) : { plan_id: null, skipped: [] };
  const summary = program.reduce((m, x) => ((m[x.state] = (m[x.state] || 0) + 1), m), {});
  const doc = { at: new Date().toISOString(), summary, new_plan: r.plan_id ? { plan_id: r.plan_id, zip: r.zip, attachments: r.attachments, entries: r.manifest.entries.length } : null, plans_in_flight: plans.map((pm) => pm.plan_id), program };
  fs.writeFileSync(path.join(out, "PRODUCTION_PROGRAM.json"), JSON.stringify(doc, null, 1)); return doc;
}
