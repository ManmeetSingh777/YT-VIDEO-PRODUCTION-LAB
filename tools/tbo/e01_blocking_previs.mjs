// PREVIS-ONLY blocking diagrams for E01 V0.4-DIR-P1 SH01/SH02/SH03, drawn ONLY from positions the director text states (e.g. "Mia center ~x.52
// face y.40", "regular near left public side", "lead enters right work aisle", "page ~55–65% width"). Boxes and labels, no character design, no
// geometry, no art. They exist so the user can decide framing/screen sizes in context. Usage: node tools/tbo/e01_blocking_previs.mjs --out <dir>
import fs from "node:fs"; import path from "node:path";
const OUT = path.resolve(process.argv[process.argv.indexOf("--out") + 1] || "engineering/e01_v04/decisions/previs");
const W = 1920, H = 1080, esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
const svg = (title, body, notes) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="960" height="540" font-family="Arial, sans-serif">
<rect width="${W}" height="${H}" fill="#f4f1ea"/><rect x="0" y="0" width="${W}" height="64" fill="#222"/>
<text x="24" y="44" font-size="30" fill="#fff">${esc(title)} — PREVIS ONLY: blocking diagram, not art, not geometry</text>
${body}
<g font-size="22" fill="#333">${notes.map((n, i) => `<text x="24" y="${H - 24 - (notes.length - 1 - i) * 30}">${esc(n)}</text>`).join("")}</g>
<g stroke="#bbb" stroke-dasharray="6 8">${[1, 2].map((k) => `<line x1="${(W * k) / 3}" y1="64" x2="${(W * k) / 3}" y2="${H}"/><line x1="0" y1="${64 + ((H - 64) * k) / 3}" x2="${W}" y2="${64 + ((H - 64) * k) / 3}"/>`).join("")}</g></svg>\n`;
const box = (x, y, w, h, fill, label, sub = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" fill-opacity="0.55" stroke="#333" stroke-width="3"/><text x="${x + 10}" y="${y + 34}" font-size="28" fill="#111">${esc(label)}</text>${sub ? `<text x="${x + 10}" y="${y + 66}" font-size="22" fill="#222">${esc(sub)}</text>` : ""}`;
const head = (cx, cy, r, label) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#e9c9a8" stroke="#333" stroke-width="3"/><text x="${cx - r}" y="${cy - r - 10}" font-size="24">${esc(label)}</text>`;
fs.mkdirSync(OUT, { recursive: true });
// SH01: medium-wide three-quarter counter shot; Mia center ~x.52, face y.40; regular near left public side; lead enters from Mia's right (screen right) in the staff lane
fs.writeFileSync(path.join(OUT, "SH01_blocking_previs.svg"), svg("E01-S001-SH01 [0,432) medium-wide, locked", [
  box(0, 120, W, 300, "#c9d8e4", "far: window + small waiting queue (BG_QUEUE), occupied tables (BG_OCCUPANCY)", "A01 asynchronous background life; queue weight shift [600,670)"),
  box(120, 300, 520, 200, "#d9cdb8", "diner pair A/B", "A gesture [42,104), B head incline [136,184)"),
  box(0, 760, W, 120, "#8a6a4a", "COUNTER (public side ↓ / staff lane ↑)", "award base target: dry counter top"),
  box(1000 - 200, 380, 400, 380, "#f2d0c0", "MIA (behind counter)", "face ≈ x.52 y.40 · both hands on the award at f180"),
  head(1000, 432, 70, "Mia head ≈ x.52, y.40"),
  box(860, 560, 280, 150, "#d4b05a", "AWARD (chest height)", "two-hand support → counter f264/276"),
  box(40, 520, 360, 520, "#b8d2b0", "REGULAR (near left, public side)", "phone at chest; partial foreground"),
  box(1420, 420, 330, 340, "#c8c0e8", "SHIFT LEAD (staff lane, enters right)", "feet: counter may crop (decision D1)"),
  box(1300, 560, 160, 100, "#ffffff", "REPORT", "lead right hand"),
], ["Director positions only (V0.4-DIR-P1 SH01 fields 3–7). Camera: locked medium-wide, no push, no orbit.", "Hand-over A08 [338,374) happens in the gap between Mia's right hand and the lead's right hand above the counter."]));
// SH02: report insert; page ~55–65% of frame width; Mia's right hand/thumb at the lower near edge; same sheet and grip
fs.writeFileSync(path.join(OUT, "SH02_blocking_previs.svg"), svg("E01-S001-SH02 [432,576) report insert, fixed", [
  box(0, 64, W, H - 64, "#cfc6b8", "background subdued (same room, warm light)"),
  box(Math.round(W * 0.2), 200, Math.round(W * 0.6), 700, "#ffffff", "REPORT PAGE ≈ 60% of frame width", "YESTERDAY / Sales $3,210 / Operating result −$120 / LOSS (exact M01 type)"),
  box(Math.round(W * 0.2) - 40, 760, 360, 240, "#f2d0c0", "Mia right hand + thumb", "lower near edge; thumb never covers figures"),
], ["Own native-resolution drawings: page plate + insert hand (never an upscale of SH01).", "Readable for the whole 144 frames; residual settle [432,444) only."]));
// SH03: tighter medium close; Mia face ~x.52 y.38; award lower center; report low right grip; regular partial foreground left with face/phone; lead right edge or off crop
fs.writeFileSync(path.join(OUT, "SH03_blocking_previs.svg"), svg("E01-S001-SH03 [576,960) medium close, static", [
  box(0, 120, W, 260, "#c9d8e4", "room behind (A01 subdued)"),
  box(760, 260, 520, 600, "#f2d0c0", "MIA (medium close)", "face ≈ x.52 y.38"),
  head(1000, 410, 130, "Mia head ≈ x.52, y.38 (≈2× SH01 size)"),
  box(820, 820, 300, 180, "#d4b05a", "AWARD on counter (lower center)", "inside the phone's intended photo"),
  box(1230, 760, 260, 200, "#ffffff", "REPORT low, right grip", "below the photo crop by f807"),
  box(20, 420, 460, 640, "#b8d2b0", "REGULAR partial foreground", "face + phone/thumb readable at f900"),
  box(1760, 380, 160, 420, "#c8c0e8", "LEAD edge/off", ""),
], ["Static closer cut on the same axis; no reaction zoom. Phone lens faces Mia; screen never shown (decision D6).", "Smile echo A13 [861,882): built from inbetween expression cels (decision D4)."]));
console.log(JSON.stringify({ out: OUT, files: fs.readdirSync(OUT) }));
