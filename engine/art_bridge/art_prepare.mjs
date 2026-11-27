// Deterministic artwork preparation (engine side of the manufacturing boundary): operations that change no artistic content and never resample.
// Every prepared image carries a record {parent_sha256, ops, result_sha256}; provenance is verified by RE-EXECUTING the ops on the parent bytes.
//   alpha_ceiling {from}: alpha >= from → 255 (provider quantization of opaque interiors, e.g. 253/254); colour channels untouched
//   crop {rect: [x, y, w, h]}: lossless crop
//   pad {ltrb: [l, t, r, b]}: lossless transparent padding
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { readPNG, writeRGBA } from "./png.mjs";
const P = "engine/art_bridge/art_prepare.mjs", sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
export const PREPARE_VERSION = "art_prepare_v1";

export function applyOps(png, ops) {
  let { width: w, height: h } = png, px = Buffer.from(png.rgba);
  for (const o of ops) {
    if (o.op === "alpha_ceiling") { if (!(o.from >= 240 && o.from <= 255)) throw err("SCHEMA_VIOLATION", { reason: "alpha_ceiling.from must be 240..255 (quantization only)", producer: P }); for (let i = 3; i < px.length; i += 4) if (px[i] >= o.from) px[i] = 255; }
    else if (o.op === "crop") { const [x, y, cw, ch] = o.rect; if (x < 0 || y < 0 || x + cw > w || y + ch > h || cw < 1 || ch < 1) throw err("SCHEMA_VIOLATION", { reason: `crop ${o.rect} outside ${w}x${h}`, producer: P }); const n = Buffer.alloc(cw * ch * 4); for (let r = 0; r < ch; r++) px.copy(n, r * cw * 4, ((y + r) * w + x) * 4, ((y + r) * w + x + cw) * 4); px = n; w = cw; h = ch; }
    else if (o.op === "pad") { const [l, t, r, b] = o.ltrb, nw = w + l + r, nh = h + t + b, n = Buffer.alloc(nw * nh * 4); for (let y = 0; y < h; y++) px.copy(n, ((y + t) * nw + l) * 4, y * w * 4, (y + 1) * w * 4); px = n; w = nw; h = nh; }
    else throw err("SCHEMA_VIOLATION", { reason: `unknown preparation op ${o.op} (only lossless, non-resampling ops exist)`, producer: P });
  }
  return { width: w, height: h, rgba: px };
}
/** prepareImage({parentFile, ops, outDir}) → {file, record} ; the record is stored beside the file as <sha16>.PREPARATION.json */
export function prepareImage({ parentFile, ops, outDir, note = null }) {
  const pb = fs.readFileSync(parentFile), out = applyOps(readPNG(parentFile), ops), tmp = path.join(outDir, `.tmp_${process.pid}.png`);
  fs.mkdirSync(outDir, { recursive: true }); writeRGBA(tmp, out.width, out.height, out.rgba); const rs = sha(fs.readFileSync(tmp)), file = path.join(outDir, `${rs.slice(0, 16)}.png`); fs.renameSync(tmp, file);
  const record = { tool: PREPARE_VERSION, parent_sha256: sha(pb), ops, result_sha256: rs, result_size: [out.width, out.height], note }; fs.writeFileSync(path.join(outDir, `${rs.slice(0, 16)}.PREPARATION.json`), JSON.stringify(record, null, 1));
  return { file, record };
}
/** verifyPreparation(record, parentFile) — re-executes the ops on the parent bytes; true only if they reproduce result_sha256 exactly */
export function verifyPreparation(record, parentFile) {
  if (sha(fs.readFileSync(parentFile)) !== record.parent_sha256) return false; const out = applyOps(readPNG(parentFile), record.ops), tmp = path.join(path.dirname(parentFile), `.verify_${process.pid}_${Date.now()}.png`);
  writeRGBA(tmp, out.width, out.height, out.rgba); const ok = sha(fs.readFileSync(tmp)) === record.result_sha256; fs.rmSync(tmp, { force: true }); return ok;
}
