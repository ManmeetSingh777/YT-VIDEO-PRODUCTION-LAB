// Source-witness pixel regions (directive F1.2 / F027). A design's reference observation must point at a real rectangle of a real attached
// native frame. The engine verifies the file, its hash and that the region lies inside the decoded image; it crops the region to an evidence
// PNG whose hash enters the design-approval bundle. Whether the region actually SHOWS the claimed observation is a HUMAN art-review decision:
// the text never self-certifies (production needs the design receipt that covers these crop hashes).
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { spawnSync } from "node:child_process";
import url from "node:url";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), SKILL = path.join(REPO, "reference", "construct-kurzgesagt-art");
/** witness paths in first_pass_control.references are relative to the installed skill (or the repo) */
export const witnessPath = (w) => [path.join(SKILL, w), path.join(REPO, w)].find((p) => fs.existsSync(p)) || null;

/** imageSize(file) → {width,height} for PNG/JPEG (header parse; no decoding library needed) */
export function imageSize(file) {
  const b = fs.readFileSync(file);
  if (b.readUInt32BE(0) === 0x89504e47) return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) { let i = 2; while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1], len = b.readUInt16BE(i + 2); if (m >= 0xc0 && m <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(m)) return { height: b.readUInt16BE(i + 5), width: b.readUInt16BE(i + 7) }; i += 2 + len; } }
  throw new Error(`unsupported or corrupt image ${file}`);
}

/** validateRegions(decision, refs, repo) → failures[]; each region {witness, region_px:[x,y,w,h], observation} */
export function validateRegions(decision, refs, repo) {
  const out = [], regions = decision.source_witness_pixel_regions || [], refSet = new Set(refs.map((r) => r.path));
  if (!Array.isArray(regions) || regions.length < 1) return [{ code: "WITNESS_REGION_INVALID", method: decision.method_id, reason: "no source-witness pixel region" }];
  for (const r of regions) {
    if (!refSet.has(r.witness)) { out.push({ code: "WITNESS_REGION_INVALID", method: decision.method_id, reason: `witness ${r.witness} is not an attached first_pass_control reference` }); continue; }
    const f = witnessPath(r.witness); if (!f) { out.push({ code: "WITNESS_REGION_INVALID", method: decision.method_id, reason: `witness file ${r.witness} missing` }); continue; }
    const { width, height } = imageSize(f), [x, y, w, h] = r.region_px || [];
    if (![x, y, w, h].every(Number.isFinite) || w < 8 || h < 8 || x < 0 || y < 0 || x + w > width || y + h > height) out.push({ code: "WITNESS_REGION_INVALID", method: decision.method_id, reason: `region ${JSON.stringify(r.region_px)} not inside ${r.witness} (${width}×${height})` });
    if (!(typeof r.observation === "string" && r.observation.trim().length >= 12)) out.push({ code: "WITNESS_REGION_INVALID", method: decision.method_id, reason: `region on ${r.witness} has no concrete observation` });
  }
  return out;
}

/** cropRegions(design, repo, outDir) → [{method, witness, region_px, witness_sha256, crop, crop_sha256}] — evidence for the human reviewer */
export function cropRegions(design, repo, outDir) {
  const list = []; fs.mkdirSync(outDir, { recursive: true });
  for (const d of design.method_decisions || []) for (const [i, r] of (d.source_witness_pixel_regions || []).entries()) {
    const src = witnessPath(r.witness), crop = path.join(outDir, `${d.method_id}_${i}.png`);
    const p = spawnSync(process.env.PYTHON || "python", ["-I", "-c", "import sys\nfrom PIL import Image\nx,y,w,h=map(int,sys.argv[3:7])\nImage.open(sys.argv[1]).convert('RGB').crop((x,y,x+w,y+h)).save(sys.argv[2])", src, crop, ...r.region_px.map(String)], { encoding: "utf8" });
    if (p.status !== 0) throw new Error(`crop failed for ${r.witness}: ${p.stderr.slice(0, 200)}`);
    list.push({ method: d.method_id, witness: r.witness, region_px: r.region_px, observation: r.observation, witness_sha256: fsha(src), crop: path.basename(crop), crop_sha256: fsha(crop) });
  }
  return list;
}
