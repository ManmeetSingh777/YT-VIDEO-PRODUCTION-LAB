#!/usr/bin/env node
// ONE consolidated Artwork GPT handoff for E01: (A) master corrections (restaurant + any masters still needing artistic work, as LOCALIZED
// edits of the strongest artwork) and (B) every released dependent of a sealed plan. One flat ATTACHMENTS folder, one execution prompt, one
// return format. `split` turns that single return back into the two existing, verified import routes (import-handoff for masters, import-plan
// for the sealed plan) — nothing is imported, selected or approved by this tool.
//   node tools/tbo/e01_consolidated_handoff.mjs build --film films/e01 --out <outbox> --plan <PLAN_ID> --corrections <json> --dir <output dir>
//   node tools/tbo/e01_consolidated_handoff.mjs split --return <consolidated return zip> --dir <output dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const B = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/gpt_batch.mjs")));

/** build — pure assembly from sealed sources; every attachment is a hash-identical copy. */
export function buildConsolidated({ out, planId, corrections, dir }) {
  const pdir = path.join(out, "gpt_plans", planId), pm = J(path.join(pdir, "PLAN_MANIFEST.json"));
  if (sha(path.join(pdir, "PLAN_MANIFEST.json")) !== fs.readFileSync(path.join(out, "gpt_plans", `${planId}.sha256`), "utf8").trim()) throw new Error(`plan ${planId} seal mismatch`);
  const id = `E01_CONSOLIDATED_${planId.replace("GPT_ART_PLAN_", "")}`, stage = path.join(dir, id), att = path.join(stage, "ATTACHMENTS"); fs.rmSync(stage, { recursive: true, force: true }); fs.mkdirSync(att, { recursive: true });
  const amap = [], copy = (src, name, meta) => { const d = path.join(att, name); fs.copyFileSync(src, d); const s = sha(d); amap.push({ file: name, sha256: s, ...meta }); return { file: name, sha256: s }; };
  const items = [], masterResults = [];
  // A. master corrections — localized edits of the strongest artwork (identity preserved; never a fresh whole-character generation)
  for (const [k, c] of corrections.masters.entries()) {
    const A = `A${String(k + 1).padStart(2, "0")}`, tgt = copy(c.edit_target, `${A}_${c.asset}__EDIT_TARGET__${sha(c.edit_target).slice(0, 8)}.png`, { item: A, role: "EDIT_TARGET (the image to edit; parent_sha256 of your result)" });
    const refs = (c.references || []).map((r, i) => copy(r.file, `${A}_${c.asset}__REF${i + 1}_${r.tag}__${sha(r.file).slice(0, 8)}.png`, { item: A, role: r.role }));
    const req = [`IMAGE REQUEST ${A} — ${c.asset}`, "", `Edit the attached EDIT_TARGET (${tgt.file}). ${c.scope}`, "", "Keep exactly:", ...c.keep.map((x) => `- ${x}`), "", "Change only:", ...c.change.map((x) => `- ${x}`), "",
      `Canvas: the EDIT_TARGET's own canvas (${c.canvas}); ${c.transparent ? "transparent background, real alpha" : "opaque"}; nothing else in the image.`, refs.length ? `References (do not copy their framing): ${refs.map((r) => r.file).join(", ")}.` : "", "",
      "Output: ONE production illustration. Never a sheet, panel, label, text or presentation layout."].filter((x) => x !== null).join("\n");
    fs.writeFileSync(path.join(att, `${A}_${c.asset}__IMAGE_REQUEST.txt`), req); amap.push({ file: `${A}_${c.asset}__IMAGE_REQUEST.txt`, sha256: sha(path.join(att, `${A}_${c.asset}__IMAGE_REQUEST.txt`)), item: A, role: "IMAGE REQUEST TEXT (the only text sent to the image tool)" });
    items.push({ id: A, section: "A_MASTER_CORRECTION", asset: c.asset, image_request: `${A}_${c.asset}__IMAGE_REQUEST.txt`, edit_target: tgt, references: refs, acceptance: c.acceptance, return_dir: `returns/${A}` });
    masterResults.push({ id: A, asset: c.asset, images: [{ file: `returns/${A}/<name>.png`, operation: "EDIT", attestation: "VERIFIED_EDIT | OPERATOR_ATTESTED_REFERENCE_GENERATION | UNKNOWN_ANCESTRY", parent_sha256: tgt.sha256, round: 1, evaluation: { acceptance_checked: [], defects: [] } }], landmarks_file: null, status: "PASS | UNRESOLVED", unresolved_blockers: [] });
  }
  // B. every released dependent of the sealed plan (prompts and edit inputs are the plan's own sealed files)
  for (const e of pm.entries) { const Bn = `B${String(e.n).padStart(3, "0")}`;
    const stages = e.stages.map((s) => { const p = copy(path.join(pdir, s.prompt_file), `${Bn}_${e.asset}__stage${String(s.stage).padStart(2, "0")}__REQUEST.txt`, { item: Bn, stage: s.stage, role: "STAGE REQUEST (sealed; send verbatim)" });
      const ein = s.edit_input && typeof s.edit_input === "object" ? copy(path.join(pdir, s.edit_input.file), `${Bn}_${e.asset}__stage${String(s.stage).padStart(2, "0")}__EDIT_INPUT__${s.edit_input.sha256.slice(0, 8)}.png`, { item: Bn, stage: s.stage, role: "EDIT INPUT (parent_sha256 of this stage's first image)" }) : null;
      if (ein && ein.sha256 !== s.edit_input.sha256) throw new Error(`${s.edit_input.file}: hash mismatch`);
      return { stage: s.stage, phase: s.phase, methods: s.methods, mode: s.mode, request: p.file, edit_input: ein || s.edit_input || null }; });
    const jd = path.join(pdir, e.folder), brief = ["CONTRACT_BRIEF.md", "ART_MOTION_CONSTRAINTS.json"].filter((f) => fs.existsSync(path.join(jd, f))).map((f) => copy(path.join(jd, f), `${Bn}_${e.asset}__${f}`, { item: Bn, role: "JOB CONTRACT (orchestration context; not sent to the image tool)" }).file);
    const wit = e.witnesses.map((w) => { const n = `W_${w.sha256.slice(0, 12)}${path.extname(w.file)}`; if (!fs.existsSync(path.join(att, n))) copy(path.join(pdir, w.file), n, { role: `STYLE WITNESS (${w.original_name})` }); return n; });
    items.push({ id: Bn, section: "B_DEPENDENT", asset: e.asset, artjob: e.artjob, canvas: e.accepted_canvases, transparent: e.transparent_background, stages, contract: brief, witnesses: wit, return_dir: `returns/${Bn}` }); }
  const tpl = J(path.join(pdir, "RETURN_MANIFEST.template.json"));
  const ret = { consolidated_handoff: id, masters: { handoff: id, results: masterResults }, dependents: { plan_id: planId, entries: tpl.entries.map((t) => { const it = items.find((i) => i.artjob === t.artjob); return { artjob: t.artjob, stages: t.stages.map((s) => ({ ...s, images: [], _image_format: { file: `<name>.png`, path: `${it.return_dir}/stage${String(s.stage).padStart(2, "0")}/<name>.png`, operation: "EDIT | REFERENCE_GENERATE | GENERATE", parent_sha256: "<sha256 of the stage EDIT_INPUT, the stage predecessor you selected, or an earlier image of this stage>", round: 1, evaluation: { obligations_checked: [], defects: [] } } })) }; }) } };
  fs.writeFileSync(path.join(stage, "RETURN_MANIFEST.template.json"), JSON.stringify(ret, null, 1));
  fs.writeFileSync(path.join(stage, "ITEMS.json"), JSON.stringify({ id, plan_id: planId, items }, null, 1));
  fs.writeFileSync(path.join(stage, "ATTACHMENT_MAP.json"), JSON.stringify({ id, note: "Every file in ATTACHMENTS/ is a hash-identical copy of its sealed source (plan, salvage or correction folder).", attachments: amap }, null, 1));
  const nA = items.filter((i) => i.section === "A_MASTER_CORRECTION").length, nB = items.length - nA, nS = items.reduce((a, i) => a + (i.stages?.length || 0), 0);
  fs.writeFileSync(path.join(stage, "EXECUTION_PROMPT.md"), [`# ${id} — execution prompt for Artwork GPT (orchestration; never send this text to the image tool)`, "",
    `Scope: ${nA} master corrections (section A) and ${nB} dependent art jobs = ${nS} sealed stage requests (section B). Everything you need is in ATTACHMENTS/ (flat). ITEMS.json lists every item, its files and where its results go.`, "",
    "## Order", "1. Section A first (A01…): each is a LOCALIZED EDIT of its EDIT_TARGET. Keep identity, proportions, palette and every untouched pixel region; change only what the request lists. Never start a new whole-character or whole-scene generation. Check the item's `acceptance` list on the actual pixels (full size and at 1/6 scale). At most 3 rounds; keep failed rounds in the return, marked.",
    "2. Section B in ITEMS.json order. Within an item, stages are sequential: stage N edits the image you selected for stage N−1 (stage 1 edits its EDIT_INPUT). Send the image tool exactly the stage REQUEST text with its EDIT_INPUT/predecessor attached and the item's witnesses (style only).",
    "3. Inspect every result against the stage request's obligations (named F-methods). Name the producing cause of any defect, retry narrower, reject regressions. Mark a stage UNRESOLVED rather than passing a defect.", "",
    "## Rules", "- The engine owns canvas, padding, cropping, alpha, registration, layering, typography, scale and camera: never regenerate for margins or size; never draw text or props that are separate assets.", "- Body parts and states must stay registrable to the master: same scale, same light direction, same line weight, joints where the request puts them, completed hidden surfaces where it asks.", "- No sheets, panels, labels, captions or presentation layouts. One illustration per image.", "",
    "## Return (one zip)", "- `RETURN_MANIFEST.json` = RETURN_MANIFEST.template.json filled in: section `masters.results[]` (A items) and `dependents.entries[].stages[]` (B items: put each image object in `images`, drop `_image_format`, set `status` PASS/UNRESOLVED and `machine_choice` to the chosen file).", "- Images at the paths the template shows (`returns/<item id>/...`). Report the true operation and parent for every image; never invent hashes or receipts.", "- Partial returns are fine: anything not returned stays open."].join("\n"));
  fs.writeFileSync(path.join(stage, "00_READ_FIRST.md"), [`# ${id}`, "", "One consolidated artwork handoff. Attach the whole ATTACHMENTS/ folder (flat) and follow EXECUTION_PROMPT.md. Return format: RETURN_MANIFEST.template.json.", "",
    `- Section A (${nA}): ${items.filter((i) => i.section === "A_MASTER_CORRECTION").map((i) => `${i.id} ${i.asset}`).join("; ")}.`, `- Section B (${nB} jobs, ${nS} stages): released dependents of sealed plan ${planId}.`, "",
    "Operator: import with `node tools/tbo/e01_consolidated_handoff.mjs split --return <zip> --dir <dir>`, then `art_outbox.mjs import-handoff` on MASTERS_RETURN.zip and `art_outbox.mjs import-plan` on DEPENDENTS_RETURN.zip. Selection and approval remain human steps."].join("\n"));
  const zip = path.join(dir, `${id}.zip`); fs.rmSync(zip, { force: true }); B.zipDir(stage, zip);
  return { id, dir: stage, zip, zip_sha256: sha(zip), section_a: nA, section_b_jobs: nB, section_b_stages: nS, attachments: amap.length };
}

/** split — one consolidated return → the two existing import zips (same files; each with its own RETURN_MANIFEST.json). */
export function splitReturn({ zip, dir }) {
  const root = path.join(dir, `unpacked_${sha(zip).slice(0, 16)}`); fs.rmSync(root, { recursive: true, force: true }); fs.mkdirSync(root, { recursive: true });
  const files = B.unzipSafe(zip, root), rmF = files.find((f) => /(^|\/)RETURN_MANIFEST\.json$/.test(f)); if (!rmF) throw new Error("no RETURN_MANIFEST.json in the return");
  const base = path.join(root, path.dirname(rmF)), rm = J(path.join(root, rmF)); if (!rm.masters && !rm.dependents) throw new Error("not a consolidated return (needs masters and/or dependents)");
  const res = {}, emit = (name, manifest) => { const d = path.join(dir, `${name}_STAGING`); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(base, d, { recursive: true }); fs.writeFileSync(path.join(d, "RETURN_MANIFEST.json"), JSON.stringify(manifest, null, 1)); const z = path.join(dir, `${name}.zip`); fs.rmSync(z, { force: true }); B.zipDir(d, z); fs.rmSync(d, { recursive: true, force: true }); return z; };
  if (rm.masters?.results?.length) res.masters_zip = emit("MASTERS_RETURN", { handoff: rm.masters.handoff, results: rm.masters.results.filter((r) => !(r.images || []).some((x) => /<name>/.test(x.file || ""))) });
  if (rm.dependents?.entries?.length) res.dependents_zip = emit("DEPENDENTS_RETURN", { plan_id: rm.dependents.plan_id, entries: rm.dependents.entries.map((e) => ({ ...e, stages: e.stages.map(({ _image_format, ...s }) => s) })) });
  return res;
}

if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
  const cmd = process.argv[2];
  if (cmd === "build") console.log(JSON.stringify(buildConsolidated({ out: path.resolve(arg("out")), planId: arg("plan"), corrections: J(path.resolve(arg("corrections"))), dir: path.resolve(arg("dir")) }), null, 1));
  else if (cmd === "split") console.log(JSON.stringify(splitReturn({ zip: path.resolve(arg("return")), dir: path.resolve(arg("dir")) }), null, 1));
  else { console.error("usage: e01_consolidated_handoff.mjs build|split ..."); process.exit(2); }
}
