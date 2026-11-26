// Standard ZIP archives for private handoffs (no external tools): clean relative entry names (no "./", no absolute paths, no "..", no directory
// entries), DEFLATE (method 8) for every file, CRC-32 per entry, one central directory. verifyZip() re-reads the archive from disk independently of
// the writer's memory: parses the central directory, checks every local header, inflates every entry, re-computes CRC-32 and SHA-256, and checks the
// archive's MANIFEST.json (every listed file present with its hash, nothing unlisted, nothing empty). Export reports success only after it passes.
import fs from "node:fs"; import zlib from "node:zlib"; import crypto from "node:crypto";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const DOS_TIME = 0, DOS_DATE = ((2026 - 1980) << 9) | (1 << 5) | 1; // fixed timestamp → reproducible bytes
export function cleanName(n) { const s = String(n).replace(/\\/g, "/"); if (!s || s.startsWith("/") || s.startsWith("./") || /^[A-Za-z]:/.test(s) || s.split("/").some((p) => p === "" || p === "." || p === "..")) throw new Error(`unsafe or unclean ZIP entry name: ${JSON.stringify(n)}`); return s; }
/** writeZip(file, [{name, data}]) — entries sorted by name; refuses duplicates and unclean names */
export function writeZip(file, entries) {
  const list = entries.map((e) => ({ name: cleanName(e.name), data: Buffer.isBuffer(e.data) ? e.data : Buffer.from(e.data) })).sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  for (let i = 1; i < list.length; i++) if (list[i].name === list[i - 1].name) throw new Error(`duplicate ZIP entry ${list[i].name}`);
  const parts = [], central = []; let off = 0;
  for (const e of list) { const nm = Buffer.from(e.name, "utf8"), comp = zlib.deflateRawSync(e.data, { level: 9 }), crc = zlib.crc32(e.data) >>> 0;
    if (e.data.length >= 0xffffffff || comp.length >= 0xffffffff || off >= 0xffffffff) throw new Error("ZIP64 is not supported by this writer");
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(8, 8); lh.writeUInt16LE(DOS_TIME, 10); lh.writeUInt16LE(DOS_DATE, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(e.data.length, 22); lh.writeUInt16LE(nm.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(8, 10); ch.writeUInt16LE(DOS_TIME, 12); ch.writeUInt16LE(DOS_DATE, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(comp.length, 20); ch.writeUInt32LE(e.data.length, 24); ch.writeUInt16LE(nm.length, 28); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(off, 42);
    parts.push(lh, nm, comp); central.push(ch, nm); off += 30 + nm.length + comp.length; }
  const cd = Buffer.concat(central), eocd = Buffer.alloc(22); eocd.writeUInt32LE(0x06054b50, 0); eocd.writeUInt16LE(list.length, 8); eocd.writeUInt16LE(list.length, 10); eocd.writeUInt32LE(cd.length, 12); eocd.writeUInt32LE(off, 16);
  if (list.length > 0xffff) throw new Error("ZIP64 is not supported by this writer");
  fs.writeFileSync(file, Buffer.concat([...parts, cd, eocd])); return { entries: list.length };
}
/** readZip(file) → [{name, data, method, crc}] — parsed from the central directory; every local header must agree */
export function readZip(file) {
  const b = fs.readFileSync(file); let e = -1; for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) if (b.readUInt32LE(i) === 0x06054b50) { e = i; break; } if (e < 0) throw new Error("no ZIP end-of-central-directory record");
  const n = b.readUInt16LE(e + 10), cdOff = b.readUInt32LE(e + 16), out = []; let p = cdOff;
  for (let k = 0; k < n; k++) { if (b.readUInt32LE(p) !== 0x02014b50) throw new Error(`central directory entry ${k} is corrupt`); const method = b.readUInt16LE(p + 10), crc = b.readUInt32LE(p + 16), csize = b.readUInt32LE(p + 20), usize = b.readUInt32LE(p + 24), nl = b.readUInt16LE(p + 28), xl = b.readUInt16LE(p + 30), cl = b.readUInt16LE(p + 32), lo = b.readUInt32LE(p + 42), name = b.toString("utf8", p + 46, p + 46 + nl);
    if (b.readUInt32LE(lo) !== 0x04034b50 || b.toString("utf8", lo + 30, lo + 30 + b.readUInt16LE(lo + 26)) !== name) throw new Error(`local header of ${name} does not match the central directory`);
    const ds = lo + 30 + b.readUInt16LE(lo + 26) + b.readUInt16LE(lo + 28), raw = b.subarray(ds, ds + csize), data = method === 8 ? zlib.inflateRawSync(raw) : method === 0 ? Buffer.from(raw) : null; if (!data) throw new Error(`${name}: unsupported method ${method}`);
    if (data.length !== usize) throw new Error(`${name}: inflated ${data.length} bytes, header says ${usize}`); if ((zlib.crc32(data) >>> 0) !== crc) throw new Error(`${name}: CRC-32 mismatch`);
    out.push({ name, data, method, crc }); p += 46 + nl + xl + cl; }
  return out;
}
/** verifyZip(file, {expectFiles, manifest: "MANIFEST.json", required: [names]}) → {ok, errors, entries, bytes, sha256} */
export function verifyZip(file, { expectFiles = null, manifest = "MANIFEST.json", required = [] } = {}) {
  const errors = []; let entries = []; try { entries = readZip(file); } catch (e) { return { ok: false, errors: [e.message], entries: 0 }; }
  const by = new Map(entries.map((x) => [x.name, x]));
  for (const x of entries) { try { cleanName(x.name); } catch (e) { errors.push(e.message); } if (x.name.endsWith("/")) errors.push(`directory entry ${x.name}`); if (x.method !== 8) errors.push(`${x.name} is not DEFLATE-compressed (method ${x.method})`); if (!x.data.length) errors.push(`${x.name} is empty`); }
  if (!entries.length) errors.push("the archive has no entries");
  if (expectFiles !== null && entries.length !== expectFiles) errors.push(`archive has ${entries.length} entries, expected ${expectFiles}`);
  for (const r of required) if (!by.has(r)) errors.push(`required file ${r} is missing`);
  let listed = 0; if (manifest) { const m = by.get(manifest); if (!m) errors.push(`${manifest} is missing`); else { let M; try { M = JSON.parse(m.data.toString("utf8")); } catch (e) { errors.push(`${manifest} is not JSON: ${e.message}`); }
    if (M) { const names = new Set(M.files.map((f) => f.file)); listed = names.size; for (const f of M.files) { const x = by.get(f.file); if (!x) errors.push(`manifest file ${f.file} is not in the archive`); else if (sha(x.data) !== f.sha256) errors.push(`${f.file}: sha256 differs from the manifest`); }
      for (const x of entries) if (x.name !== manifest && !names.has(x.name)) errors.push(`${x.name} is in the archive but not in the manifest`); } } }
  const buf = fs.readFileSync(file); return { ok: errors.length === 0, errors, entries: entries.length, manifest_listed: listed, bytes: buf.length, sha256: sha(buf) };
}
