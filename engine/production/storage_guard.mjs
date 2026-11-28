// Storage guard (general): every scratch-producing step checks real free space on the volume it writes to BEFORE writing, with a margin, and
// scratch goes to TBO_SCRATCH_DIR when set (a volume with room), never silently filling the repository drive.
import fs from "node:fs"; import path from "node:path"; import { err } from "../art_bridge/errors.mjs";
export const GB = 1024 ** 3, DEFAULT_MARGIN = 5 * GB;
/** freeBytes(dir) — free bytes on the volume holding dir (nearest existing ancestor) */
export function freeBytes(dir) { let d = path.resolve(dir); while (!fs.existsSync(d)) { const p = path.dirname(d); if (p === d) break; d = p; } const s = fs.statfsSync(d); return Number(s.bavail) * Number(s.bsize); }
/** requireFree(dir, needBytes, {margin, what}) → {free, need}; throws STORAGE_INSUFFICIENT if free < need + margin */
export function requireFree(dir, needBytes, { margin = DEFAULT_MARGIN, what = "write" } = {}) {
  const free = freeBytes(dir), need = Math.max(0, needBytes) + margin;
  if (free < need) throw err("STORAGE_INSUFFICIENT", { record_id: path.resolve(dir), reason: `${what} needs ${(need / GB).toFixed(2)} GB free (incl. ${(margin / GB).toFixed(1)} GB margin) on ${path.parse(path.resolve(dir)).root}, only ${(free / GB).toFixed(2)} GB available` });
  return { free, need };
}
/** scratchDir(name) — TBO_SCRATCH_DIR/<name> when configured, else the given fallback */
export const scratchDir = (name, fallback) => process.env.TBO_SCRATCH_DIR ? path.join(process.env.TBO_SCRATCH_DIR, name) : fallback;
/** render estimate: frames × width × height × bytesPerPixel(compressed≈0.5) */
export const renderEstimate = (frames, w = 1920, h = 1080, bpp = 0.5) => frames * w * h * bpp;
