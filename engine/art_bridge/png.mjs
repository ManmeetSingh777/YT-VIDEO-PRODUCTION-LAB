// Minimal real PNG decoder/encoder (no dependencies): dimensions, colour type, decoded RGBA, alpha statistics. Used to verify assets from
// actual bytes (spec §4 step 1: "Validate PNG dimensions and decode alpha"). Supports 8-bit greyscale/RGB/RGBA/grey+alpha, non-interlaced.
import fs from "node:fs"; import zlib from "node:zlib";
const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
export function readPNG(file) { return decodePNG(fs.readFileSync(file), file); }
/** decodePNG(buffer) — the same decoder over in-memory bytes (Chrome screenshots, provider responses) */
export function decodePNG(b, file = "<buffer>") {
  if (b.length < 33 || !b.subarray(0, 8).equals(SIG)) throw Object.assign(new Error(`not a PNG: ${file}`), { code: "IMAGE_DIMENSION_MISMATCH" });
  let p = 8, W, H, depth, ctype, interlace; const idat = [];
  while (p < b.length) { const len = b.readUInt32BE(p), type = b.toString("ascii", p + 4, p + 8), data = b.subarray(p + 8, p + 8 + len);
    if (type === "IHDR") { W = data.readUInt32BE(0); H = data.readUInt32BE(4); depth = data[8]; ctype = data[9]; interlace = data[12]; }
    else if (type === "IDAT") idat.push(data); else if (type === "IEND") break; p += 12 + len; }
  if (depth !== 8 || interlace !== 0 || ![0, 2, 4, 6].includes(ctype)) throw Object.assign(new Error(`unsupported PNG format (depth ${depth}, colour ${ctype}, interlace ${interlace}): ${file}`), { code: "ALPHA_INVALID" });
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[ctype], raw = zlib.inflateSync(Buffer.concat(idat)), stride = W * ch, px = Buffer.alloc(W * H * 4);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < H; y++) {
    const f = raw[y * (stride + 1)], line = Buffer.from(raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)));
    for (let x = 0; x < stride; x++) { const a = x >= ch ? line[x - ch] : 0, up = prev[x], c = x >= ch ? prev[x - ch] : 0;
      line[x] = (line[x] + (f === 0 ? 0 : f === 1 ? a : f === 2 ? up : f === 3 ? (a + up) >> 1 : (() => { const pp = a + up - c, pa = Math.abs(pp - a), pb = Math.abs(pp - up), pc = Math.abs(pp - c); return pa <= pb && pa <= pc ? a : pb <= pc ? up : c; })())) & 255; }
    for (let x = 0; x < W; x++) { const s = x * ch, d = (y * W + x) * 4;
      if (ch === 1) { px[d] = px[d + 1] = px[d + 2] = line[s]; px[d + 3] = 255; } else if (ch === 2) { px[d] = px[d + 1] = px[d + 2] = line[s]; px[d + 3] = line[s + 1]; }
      else if (ch === 3) { px[d] = line[s]; px[d + 1] = line[s + 1]; px[d + 2] = line[s + 2]; px[d + 3] = 255; } else { line.copy(px, d, s, s + 4); } }
    prev = line;
  }
  let transparent = 0, partial = 0; for (let i = 3; i < px.length; i += 4) { if (px[i] === 0) transparent++; else if (px[i] < 255) partial++; }
  return { width: W, height: H, colorType: ctype, hasAlphaChannel: ch === 2 || ch === 4, rgba: px, alpha: { transparent, partial, opaque: W * H - transparent - partial } };
}
function crc32(buf) { let c, crc = 0xffffffff; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return (crc ^ 0xffffffff) >>> 0; }
/** write 8-bit RGBA PNG from a Uint8 RGBA buffer */
export function writeRGBA(file, W, H, rgba) {
  const raw = Buffer.alloc((W * 4 + 1) * H); for (let y = 0; y < H; y++) { raw[y * (W * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1); }
  const chunk = (t, d) => { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]), c = Buffer.alloc(4); c.writeUInt32BE(crc32(td)); return Buffer.concat([l, td, c]); };
  const ih = Buffer.alloc(13); ih.writeUInt32BE(W, 0); ih.writeUInt32BE(H, 4); ih[8] = 8; ih[9] = 6;
  fs.writeFileSync(file, Buffer.concat([SIG, chunk("IHDR", ih), chunk("IDAT", zlib.deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]));
}
