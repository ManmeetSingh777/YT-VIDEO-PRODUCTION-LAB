// Extracts the VERBATIM text of every F01–F80 section from the installed skill references (no paraphrase).
// Output: engine/methods/source/F_SOURCE.json  { F01: { file, startLine, endLine, sha256, text }, ... }
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const REF = "reference/construct-kurzgesagt-art/references";
const files = ["STYLE_OPERATIONS.md", "FULL_FILM_ROUTER_AND_METHODS.md", "WORLD_SYSTEM_CONSTRUCTION.md", "CONDITIONAL_PALETTE_SCALE_AND_ABSTRACTION.md", "MOLECULAR_CONSTRUCTOR_F57_F80.md"];
const out = {};
for (const f of files) {
  const L = fs.readFileSync(path.join(REF, f), "utf8").split(/\r?\n/);
  const starts = []; L.forEach((l, i) => { const m = l.match(/^## (F\d\d) —/); if (m) starts.push([m[1], i]); });
  starts.forEach(([id, i], k) => {
    let end = k + 1 < starts.length ? starts[k + 1][1] : L.length;
    for (let j = i + 1; j < end; j++) if (/^## (?!F\d\d)/.test(L[j]) || /^# /.test(L[j])) { end = j; break; }
    const text = L.slice(i, end).join("\n").trim();
    out[id] = { file: `${REF}/${f}`, startLine: i + 1, endLine: end, chars: text.length, sha256: crypto.createHash("sha256").update(text).digest("hex"), text };
  });
}
const ids = Object.keys(out).sort();
fs.writeFileSync("engine/methods/source/F_SOURCE.json", JSON.stringify(out, null, 1));
console.log(ids.length, "methods extracted;", ids.filter((x, i) => x !== `F${String(i + 1).padStart(2, "0")}`).join(",") || "contiguous F01–F80", "| total chars", ids.reduce((a, k) => a + out[k].chars, 0));
for (const k of ids) if (out[k].chars < 400) console.log("  short section:", k, out[k].chars);
