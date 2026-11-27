#!/usr/bin/env node
// E01 artwork handoff v2: ONLY genuinely new artistic pixels, after deterministic extraction/reuse has been executed. One item = one image.
// Image texts (IMAGE_REQUESTS.md) are artwork-only; orchestration lives in EXECUTION_PROMPT.md. Attachments are deduplicated and split into
// upload groups of <= 20 files; every item names its edit target and references by attachment file name.
//   node tools/tbo/e01_artwork_handoff_v2.mjs --film films/e01 --out <outbox> --requests <REQUESTS_V2.json> --dir <output dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; }, imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));

export async function buildHandoffV2({ out, requests, dir, maxPerGroup = 20 }) {
  const R = J(requests), PR = await imp("engine/art_bridge/art_prepare.mjs"), B = await imp("engine/art_bridge/gpt_batch.mjs");
  const id = `E01_ARTWORK_HANDOFF_V2_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}`, stage = path.join(dir, id), att = path.join(stage, "ATTACHMENTS");
  fs.rmSync(stage, { recursive: true, force: true }); fs.mkdirSync(att, { recursive: true });
  const src = (p) => path.isAbsolute(p) ? p : path.join(REPO, p), files = {}, groups = {}, amap = [];
  for (const [k, r] of Object.entries(R.refs)) { if (r.alias) continue; let f = r.src && src(r.src);
    if (r.crop_of) { const base = src(R.refs[r.crop_of].src), parents = path.join(out, "prepared", "parents"); fs.mkdirSync(parents, { recursive: true }); const pf = path.join(parents, `${sha(base).slice(0, 16)}.png`); if (!fs.existsSync(pf)) fs.copyFileSync(base, pf);
      f = PR.prepareImage({ parentFile: pf, ops: [{ op: "crop", rect: r.rect }], outDir: path.join(out, "prepared"), note: `${k}: lossless crop of ${r.crop_of}` }).file; }
    if (!f || !fs.existsSync(f)) throw new Error(`reference ${k}: missing ${f}`);
    const n = (groups[r.group] = (groups[r.group] || 0) + 1); if (n > maxPerGroup) throw new Error(`upload group ${r.group} exceeds ${maxPerGroup}`);
    const name = `${r.group}_${String(n).padStart(2, "0")}_${k}${path.extname(f)}`; fs.copyFileSync(f, path.join(att, name)); files[k] = { file: name, sha256: sha(f), role: r.role, group: r.group }; amap.push({ ref: k, ...files[k], source: f }); }
  for (const [k, r] of Object.entries(R.refs)) if (r.alias) files[k] = files[r.alias];
  const items = [];
  for (const q of R.requests) { const each = q.each || [null], edits = String(q.edit).split("|");
    each.forEach((e, i) => { const iid = q.each ? `${q.id}.${String(i + 1).padStart(2, "0")}` : q.id, editRef = edits.length > 1 ? edits[Math.min(edits.length - 1, Math.floor(i / Math.ceil(each.length / edits.length)))] : edits[0];
      const t = q.text.replaceAll("{each}", e ?? ""), target = files[editRef]; if (!target) throw new Error(`${iid}: unknown edit target ${editRef}`);
      items.push({ id: iid, subject: q.subject, variant: e, edit_target: target.file, edit_target_sha256: target.sha256, references: (q.refs || []).map((r) => files[r].file), canvas: q.canvas, methods: q.methods, text: t, yields: q.yields_each ? q.yields_each[i] ?? q.yields_each[0] : q.yields }); }); }
  const md = items.map((x) => `### ${x.id} — ${x.subject}${x.variant ? ` · ${x.variant.split(":")[0]}` : ""}\nAttach: ${x.edit_target} (edit this)${x.references.length ? `; references: ${x.references.join(", ")}` : ""}\nCanvas: ${x.canvas}\n\n${x.text}\n\nOne illustration only: no sheets, labels, text or layout.\n`).join("\n");
  fs.writeFileSync(path.join(stage, "IMAGE_REQUESTS.md"), `# E01 image requests (${items.length}) — send each block's text to the image tool with its attachments\n\n${md}`);
  fs.writeFileSync(path.join(stage, "EXECUTION_PROMPT.md"), [`# ${id} — execution prompt for Artwork GPT (orchestration; never send this text to the image tool)`, "",
    `Scope: ${items.length} images. Everything else for E01 (Mia's torso, arms, open left hand, eyes, brows, cheeks, mouth, diner bodies and rest states; the occupied table and queue masters as they stand) was manufactured by the engine from approved pixels and needs no generation.`, "",
    "1. Upload ATTACHMENTS/ in its upload groups (G1, G2, G3; each <= 20 files) once at the start; every request names its files.", "2. Work through IMAGE_REQUESTS.md in order. For each block: attach its edit target (and listed references), send ONLY that block's text, inspect the result at full size and at 1/6 scale.",
    "3. Accept only if identity, palette, line weight and scale match the edit target and the block's requirements hold; otherwise name the cause and retry narrower (max 3 rounds). Keep failed rounds, marked.", "4. M02/M03 faces must keep exactly the M01 head size and position (the engine extracts eyes/brows/cheeks/mouth from them by registration).",
    "5. Return ONE zip: RETURN_MANIFEST.json (from the template) + returns/<item id>/<file>.png. Report the true operation (EDIT or REFERENCE_GENERATE) and the parent (the edit target's sha256 or an earlier image of the same item). Never invent hashes or receipts. Partial returns are fine."].join("\n"));
  fs.writeFileSync(path.join(stage, "RETURN_MANIFEST.template.json"), JSON.stringify({ handoff: id, items: items.map((x) => ({ id: x.id, status: "PASS | UNRESOLVED", chosen: null, images: [{ file: `returns/${x.id}/<name>.png`, operation: "EDIT | REFERENCE_GENERATE", parent_sha256: x.edit_target_sha256, round: 1, defects: [] }] })) }, null, 1));
  fs.writeFileSync(path.join(stage, "ITEMS.json"), JSON.stringify({ id, items }, null, 1)); fs.writeFileSync(path.join(stage, "ATTACHMENT_MAP.json"), JSON.stringify({ id, groups, attachments: amap }, null, 1));
  fs.writeFileSync(path.join(stage, "00_READ_FIRST.md"), [`# ${id}`, "", `- ${items.length} images; ${amap.length} attachments in upload groups ${Object.entries(groups).map(([g, n]) => `${g} (${n})`).join(", ")}.`, "- EXECUTION_PROMPT.md: what to do. IMAGE_REQUESTS.md: the only texts for the image tool. RETURN_MANIFEST.template.json: the one return format.", "- ITEMS.json: per item, which film assets the engine extracts from the result."].join("\n"));
  const zip = path.join(dir, `${id}.zip`); fs.rmSync(zip, { force: true }); B.zipDir(stage, zip);
  return { id, zip, zip_sha256: sha(zip), images: items.length, attachments: amap.length, groups };
}
if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url))
  console.log(JSON.stringify(await buildHandoffV2({ out: path.resolve(arg("out")), requests: path.resolve(REPO, arg("requests")), dir: path.resolve(arg("dir")) }), null, 1));
