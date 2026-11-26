// Regression storage discipline (release regression 1488502 exhausted drive C:, which made 41 tests fail before their assertions ran).
// Two levers. Neither removes an assertion or a negative control:
//  1. copyFilmTree: a test copy of a film HARD-LINKS its rendered FFV1 segments (render/chunks/<key>/chunk_NNNNN_NNNNN.mkv). Each segment
//     is content-addressed and sha256-verified wherever it is used. Nothing writes into an existing segment path: the renderer unlinks a stale
//     segment before regenerating it and publishes a new one by rename. Every other file is a real copy, so a negative may append to,
//     overwrite or delete it freely (film.mp4, art bytes, manifests, receipts, the by_input store). Links fall back to copies across volumes.
//  2. reclaim: after a test's assertions have PASSED, disposable intermediate bytes (rendered segments, whole negative copies) are removed
//     when the runner sets TBO_RECLAIM_WORK=1. Without it (an interactive run, or debugging) everything is kept. A failing assertion throws
//     before reclaim, so a failure's work directory always survives for diagnosis.
import fs from "node:fs"; import path from "node:path";
const SEGMENT = /(^|[\\/])render[\\/]chunks[\\/](?!by_input[\\/])[^\\/]+[\\/]chunk_\d+_\d+\.mkv$/;
export const isImmutableSegment = (rel) => SEGMENT.test(rel);
/** copyFilmTree(src, dst, {filter}) → {linked, copied}; `filter(absSrc)` → false skips a file or directory (like fs.cpSync's filter) */
export function copyFilmTree(src, dst, { filter = null } = {}) {
  const n = { linked: 0, copied: 0 };
  const walk = (s, d) => { const st = fs.statSync(s);
    if (st.isDirectory()) { fs.mkdirSync(d, { recursive: true }); for (const e of fs.readdirSync(s)) { const cs = path.join(s, e); if (filter && !filter(cs)) continue; walk(cs, path.join(d, e)); } return; }
    if (isImmutableSegment(path.relative(src, s))) { try { fs.linkSync(s, d); n.linked++; return; } catch { /* other volume or links refused: copy */ } }
    fs.copyFileSync(s, d); n.copied++; };
  walk(src, dst); return n;
}
export const reclaimEnabled = () => process.env.TBO_RECLAIM_WORK === "1";
/** reclaim(...paths): remove disposable outputs after the assertions that needed them have passed (only under TBO_RECLAIM_WORK=1) */
export function reclaim(...paths) { if (!reclaimEnabled()) return false; for (const p of paths) fs.rmSync(p, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }); return true; }
