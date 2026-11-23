import { readPNG, FIX } from "./stage2_lib.mjs"; import path from "node:path";
const src = readPNG(path.join(FIX, "diag2/probe_arm.png")), out = readPNG("hybrid_v2/work/stage2/probeP/frames/f0005.png");
const h = { a0: 0, opaqueDiff: 0, partial: 0, partialMaxPremul: 0, alphaDiffMax: 0, opaqueMax: 0 };
for (let y = 0; y < 160; y++) for (let x = 0; x < 40; x++) { const i = (y * 40 + x) * 4, j = ((280 + y) * 1920 + 580 + x) * 4, a = src.rgba[i + 3], b = out.rgba[j + 3];
  h.alphaDiffMax = Math.max(h.alphaDiffMax, Math.abs(a - b));
  if (a === 0) { h.a0++; continue; }
  if (a === 255) { for (let c = 0; c < 3; c++) { const d = Math.abs(src.rgba[i + c] - out.rgba[j + c]); if (d) h.opaqueDiff++; h.opaqueMax = Math.max(h.opaqueMax, d); } }
  else { h.partial++; for (let c = 0; c < 3; c++) h.partialMaxPremul = Math.max(h.partialMaxPremul, Math.abs(src.rgba[i + c] * a - out.rgba[j + c] * b) / 255); } }
console.log(h);
