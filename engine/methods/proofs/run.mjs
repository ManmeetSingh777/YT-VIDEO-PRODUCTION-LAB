// Runs every Stage-1 proof suite, writes engine/methods/evidence/PROOFS.json (per-method causal records, without bulky outputs).
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "..", "evidence");
fs.mkdirSync(EV, { recursive: true });
const only = process.argv[2];
const suites = fs.readdirSync(here).filter((f) => /^p_.*\.mjs$/.test(f) && (!only || f.includes(only)));
const all = fs.existsSync(path.join(EV, "PROOFS.json")) ? JSON.parse(fs.readFileSync(path.join(EV, "PROOFS.json"), "utf8")) : {};
for (const s of suites) {
  const mod = await import(url.pathToFileURL(path.join(here, s)));
  for (const r of mod.run()) {
    const { base, ...rec } = r;
    all[rec.name] = { suite: s, ...rec, at: new Date().toISOString() };
    const bad = [...rec.consumes.filter((c) => !c.read).map((c) => `unread ${c.input}`), ...rec.causal.filter((c) => !c.pass).map((c) => `causal ${c.path} ${c.error || `changed=${c.changed} expected=${c.expectedChanged} leaks=${(c.leaks || []).join(",")} px=${JSON.stringify(c.pixels || {})} dispatch=${JSON.stringify(c.dispatch || "")}`}`), ...rec.refuses.filter((c) => !c.refused).map((c) => `not refused ${c.path}`), ...(rec.falsifier && !rec.falsifier.pass ? [`falsifier ${JSON.stringify(rec.falsifier.detail).slice(0, 200)}`] : []), ...(rec.error ? [rec.error] : []), ...(rec.problems || [])];
    console.log(`${rec.pass ? "PASS" : "FAIL"}  ${rec.name}  (outputs ${rec.outputs ?? "-"}, causal ${rec.causal.filter((c) => c.pass).length}/${rec.causal.length}, refuses ${rec.refuses.filter((c) => c.refused).length}/${rec.refuses.length})`);
    for (const b of bad) console.log("      ✗", b);
  }
  if (mod.pixels) await mod.pixels(EV);
}
fs.writeFileSync(path.join(EV, "PROOFS.json"), JSON.stringify(all, null, 1));
