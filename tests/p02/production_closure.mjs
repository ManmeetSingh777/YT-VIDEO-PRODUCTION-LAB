#!/usr/bin/env node
// Static import closure of the PRODUCTION entry points (CLIs + the Chrome page's runtime files) → which engine files are production-reachable.
// Used by the source snapshot to label files; dynamic import("…") string literals are followed too. Output: JSON to stdout or --out FILE.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const ENTRY = ["engine/tools/production_run.mjs", "engine/tools/art_outbox.mjs", "engine/tools/art_bridge_check.mjs", "engine/tools/art_bridge_qa.mjs", "engine/tools/art_bridge_film_qa.mjs", "engine/tools/build_failure_ledger.mjs", "engine/tools/compile_film_contracts.mjs"];
const PAGE_RUNTIME = ["engine/runtime/nu.js", "engine/runtime/gsap.min.js", "engine/art_bridge/runtime/bridge_rt.js"]; // copied into every composition page by render.mjs#buildComposition
// renderer modules are loaded by PATH from segment_render.mjs#RENDERERS (dynamic import of a registry string) — add them as roots
for (const m of fs.readFileSync(path.join(REPO, "engine/film/segment_render.mjs"), "utf8").matchAll(/module: "([^"]+)"/g)) ENTRY.push(m[1]);
const IMP = /(?:import\s+(?:[^'"]*?\sfrom\s+)?|import\(\s*|export\s+[^'"]*?\sfrom\s+)['"](\.{1,2}\/[^'"]+)['"]/g, seen = new Set();
(function walk(list) { for (const r of list) { if (seen.has(r) || !fs.existsSync(path.join(REPO, r))) continue; seen.add(r); const s = fs.readFileSync(path.join(REPO, r), "utf8"), next = [];
  for (const m of s.matchAll(IMP)) next.push(path.relative(REPO, path.resolve(path.dirname(path.join(REPO, r)), m[1])).split(path.sep).join("/")); walk(next); } })(ENTRY);
for (const p of PAGE_RUNTIME) seen.add(p);
const all = []; (function w(d) { for (const f of fs.readdirSync(path.join(REPO, d))) { const r = `${d}/${f}`; if (fs.statSync(path.join(REPO, r)).isDirectory()) { if (!/node_modules|__pycache__/.test(r)) w(r); } else if (/\.(mjs|js|py|json)$/.test(f)) all.push(r); } })("engine");
const out = { entry_points: ENTRY, page_runtime: PAGE_RUNTIME, production_reachable: [...seen].sort(), not_reachable_from_production: all.filter((f) => !seen.has(f) && /\.(mjs|js)$/.test(f)).sort(), note: "static closure; data files (json/py) loaded by path are listed separately by the snapshot" };
const o = process.argv.indexOf("--out"); if (o > 0) fs.writeFileSync(process.argv[o + 1], JSON.stringify(out, null, 1)); else console.log(JSON.stringify(out, null, 1));
