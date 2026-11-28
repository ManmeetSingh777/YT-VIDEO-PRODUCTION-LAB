#!/usr/bin/env node
// Deterministic component EXTRACTION from an APPROVED, REGISTERED master (no painting, no resampling):
//   segmentation masks (tools/tbo/e01_segment_master.py) → art_prepare mask_bitmap + crop (re-executable record, lineage inherited from the
//   approved master's sealed candidate) → reviewed master landmarks carried by the exact crop offset → ingest-part (registration receipt,
//   REGISTERED_PENDING_REVIEW). A human approves each part through the normal signed review. Parts whose contract cannot be met by existing
//   pixels (pivot hidden, native minimum) are REFUSED by ingest-part and reported, never forced.
// General-purpose: every film-specific input (segmentation seeds/masks, component→asset map) is film data under films/<film>/segmentation/.
//   node engine/art_bridge/component_extract.mjs --film films/<film> --out <outbox> --master <MASTER_ID> --seg <dir> --map <json> [--dry]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));

export async function extractComponents({ film, out, master, segDir, map, dry = false }) {
  const FILM = path.resolve(film), OUT = path.resolve(out), I = await imp("engine/art_bridge/art_intake.mjs"), PR = await imp("engine/art_bridge/art_prepare.mjs"), { readPNG } = await imp("engine/art_bridge/png.mjs");
  const doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), m = doc.assets.find((a) => a.id === master); if (!m) throw new Error(`unknown master ${master}`);
  const mFile = path.join(FILM, m.file); if (sha(mFile) !== m.sha256) throw new Error(`${master} bytes differ from the manifest`);
  const seg = J(path.join(segDir, "SEGMENTATION.json")); if (seg.master_sha256 !== m.sha256) throw new Error("segmentation was made on different master bytes");
  const reviewed = J(path.join(FILM, "registration", master, "LANDMARK_SIDECAR.json")).landmarks, prepared = path.join(OUT, "prepared"), parents = path.join(prepared, "parents"), masks = path.join(prepared, "masks");
  fs.mkdirSync(parents, { recursive: true }); fs.mkdirSync(masks, { recursive: true }); const parentFile = path.join(parents, `${m.sha256.slice(0, 16)}.png`); if (!fs.existsSync(parentFile)) fs.copyFileSync(mFile, parentFile);
  const { width: W, height: H } = readPNG(mFile), results = [];
  for (const [comp, assets] of Object.entries(map)) {
    const c = seg.components[comp]; if (!c) { results.push({ component: comp, outcome: "NO_SUCH_COMPONENT" }); continue; }
    const mk = path.join(masks, `${c.mask_sha256.slice(0, 16)}.png`); if (!fs.existsSync(mk)) fs.copyFileSync(path.join(segDir, `${c.mask_sha256.slice(0, 16)}.png`), mk); if (sha(mk) !== c.mask_sha256) throw new Error(`${comp}: mask bytes differ`);
    const [bx, by, bw, bh] = c.bbox, x0 = Math.max(0, bx - 2), y0 = Math.max(0, by - 2), rect = [x0, y0, Math.min(W, bx + bw + 2) - x0, Math.min(H, by + bh + 2) - y0];
    const r = PR.prepareImage({ parentFile, ops: [{ op: "mask_bitmap", mask_sha256: c.mask_sha256 }, { op: "crop", rect }], outDir: prepared, maskDir: masks, note: `component ${comp} selected from approved ${master} (${m.sha256.slice(0, 12)}); segmentation seeds ${seg.seeds_sha256.slice(0, 12)}` });
    if (!PR.verifyPreparation(r.record, parentFile, { maskDir: masks })) throw new Error(`${comp}: preparation does not re-execute`);
    const lm = Object.fromEntries(Object.entries(reviewed).map(([k, [x, y]]) => [k, [x - x0, y - y0]])), side = path.join(prepared, "reviewed_landmarks", `${path.basename(r.file, ".png")}.json`);
    fs.mkdirSync(path.dirname(side), { recursive: true }); fs.writeFileSync(side, JSON.stringify({ landmarks: lm, reviewed_by: `signed master registration of ${master} (landmarks carried by the exact crop offset [${x0}, ${y0}])`, method: "deterministic extraction: same pixels, same coordinates minus crop origin", image_sha256: r.record.result_sha256 }, null, 1));
    for (const asset of [].concat(assets)) {
      if (dry) { results.push({ component: comp, asset, outcome: "DRY", file: r.file }); continue; }
      { const cur = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")).assets.find((a) => a.id === asset); if (cur?.file && fs.existsSync(path.join(FILM, cur.file)) && sha(path.join(FILM, cur.file)) === sha(r.file)) { results.push({ component: comp, asset, outcome: "ALREADY_REGISTERED (identical bytes; approval pointer untouched)" }); continue; } } // idempotent
      try { const g = await I.ingestPart({ film: FILM, asset, file: r.file, landmarks: side, provenance: "GPT_OPERATOR_HANDOFF", outbox: OUT });
        results.push({ component: comp, asset, outcome: g.status, file: r.file, sha256: r.record.result_sha256, max_residual_px: g.receipt?.max_residual_px ?? null, failures: g.failures?.map((f) => f.human_readable_reason) || null }); }
      catch (e) { results.push({ component: comp, asset, outcome: "REFUSED", code: e.code || null, reason: e.human_readable_reason || e.message }); } }
  }
  return { master, master_sha256: m.sha256, segmentation: { seeds_sha256: seg.seeds_sha256, invisible_unassigned_px: seg.opaque_unlabelled_px }, results };
}

if (process.argv[1] && path.resolve(process.argv[1]) === url.fileURLToPath(import.meta.url)) {
  const r = await extractComponents({ film: path.resolve(REPO, arg("film")), out: arg("out"), master: arg("master"), segDir: path.resolve(arg("seg")), map: J(path.resolve(arg("map"))), dry: process.argv.includes("--dry") });
  console.log(JSON.stringify(r, null, 1));
}
