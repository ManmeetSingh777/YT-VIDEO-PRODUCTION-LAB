const fs = require("fs");
for (const s of JSON.parse(fs.readFileSync("tools/scenes.json"))) {
  const h = fs.readFileSync(`compositions/${s.id}.html`, "utf8");
  const ids = [...h.matchAll(/ id="([^"]+)"/g)].map((m) => m[1]);
  const seen = new Set(), d = new Set();
  for (const i of ids) { if (seen.has(i)) d.add(i); seen.add(i); }
  console.log(s.id, ids.length, [...d].slice(0, 20).join(" "));
}
