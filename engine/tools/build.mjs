// Film build: scene generators → compositions/*.html + index.html, contract-binding check, construction ledger.
// Run from a film directory:  node ../../engine/tools/build.mjs [--only id,id] [--qa silhouette|flat|nofx] [--rough]
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { pathToFileURL, fileURLToPath } from "node:url";
import { makeCtx } from "../lib/scene.mjs";

const ENGINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STUDIO = path.dirname(ENGINE);
const arg = (k) => (process.argv.includes(k) ? process.argv[process.argv.indexOf(k) + 1] : null);
const only = arg("--only") ? arg("--only").split(",") : null;
const qa = arg("--qa") || "";
const rough = process.argv.includes("--rough");
const readJ = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");

const SCENES = readJ("production/scenes.json", null);
if (!SCENES) { console.error("production/scenes.json missing — run `studio plan` first"); process.exit(2); }
const cues = readJ("production/cues.json", { scenes: {}, narration: {}, words: {} });
const lessons = [...readJ(path.join(STUDIO, "learning/REPAIR_MEMORY.json"), { lessons: [] }).lessons, ...readJ("learning/REPAIR_MEMORY.json", { lessons: [] }).lessons];
const film = readJ("production/film.json", { duration: SCENES.reduce((a, s) => Math.max(a, s.start + s.dur), 0), bg: "#111C3D" });

// runtime is copied from the engine on every build (single source of truth)
fs.mkdirSync("assets", { recursive: true });
for (const f of ["nu.js", "form3d.js", "mn.js"]) fs.copyFileSync(path.join(ENGINE, "runtime", f), path.join("assets", f));

// TRANSACTIONAL receipts: this build writes to production/icd.staging; only a build that completes replaces
// production/icd. A failed build leaves the last valid receipts untouched.
const STAGE_DIR = "production/icd.staging";
fs.rmSync(STAGE_DIR, { recursive: true, force: true }); fs.mkdirSync(STAGE_DIR, { recursive: true });
process.env.MN_ICD_DIR = STAGE_DIR;
process.on("exit", (code) => { if (fs.existsSync(STAGE_DIR) && (code !== 0 || process.exitCode)) fs.rmSync(STAGE_DIR, { recursive: true, force: true }); });
const receipts = [];
const problems = [];
for (const s of SCENES) {
  if (!s.src) continue;
  if (only && !only.includes(s.id)) continue;
  const m = await import(pathToFileURL(path.resolve("scenes", s.src)).href + `?v=${Date.now()}`);
  const fn = m[s.fn || "build"];
  if (!fn) { problems.push(`scene ${s.id}: scenes/${s.src} has no export ${s.fn || "build"}`); continue; }
  const ctx = makeCtx(s, cues, lessons, qa);
  await fn(ctx);
  const r = ctx._receipt();
  const unused = r.contract_events.filter((e) => !r.used_events.includes(e));
  if (unused.length) problems.push(`scene ${s.id}: contract events not bound to any code: ${unused.join(", ")}`);
  receipts.push(r);
}
// duplicate ids (from neutrino build.mjs)
const html = {};
for (const s of SCENES) {
  if (!s.src || !fs.existsSync(`compositions/${s.id}.html`)) continue;
  const h = (html[s.id] = fs.readFileSync(`compositions/${s.id}.html`, "utf8"));
  const ids = [...h.matchAll(/id="([^"$]+)"/g)].map((m) => m[1]); const seen = new Set(), dup = new Set();
  for (const i of ids) { if (seen.has(i)) dup.add(i); seen.add(i); }
  if (dup.size) problems.push(`DUP IDS ${s.id}: ${[...dup].slice(0, 12).join(" ")}`);
}

// ids are document-global once compositions are mounted together: a shared id lets one scene's script drive another
// scene's elements (observed in the foundation test). Every scene must prefix its cast.
{
  const owner = {};
  for (const [sid, h] of Object.entries(html)) for (const m of h.matchAll(/ id="([^"$]+)"/g)) { const i = m[1]; if (i === "root") continue; if (owner[i] && owner[i] !== sid) problems.push(`CROSS-SCENE ID "${i}" in ${owner[i]} and ${sid} (prefix cast ids with the scene id)`); owner[i] = sid; }
  const seen = new Set(); for (let k = problems.length - 1; k >= 0; k--) if (problems[k].startsWith("CROSS-SCENE")) { if (seen.size > 12) problems.splice(k, 1); seen.add(k); }
}
// ---- construction ledger v2: method → condition → decision → operator call → region → element → pixel evidence ----
// Statuses (spec §11): NOT_APPLICABLE | RESEARCH_REQUIRED | DESIGN_SPECIFIED | CODE_EMITTED | PIXELS_INSPECTED | MOTION_PROVED | APPROVED | FAILED
// CODE_EMITTED requires a non-ablated operator call bound to the method whose region element exists in the built HTML.
// Anything above CODE_EMITTED requires a hashed evidence record (learning/EVIDENCE.json) for that subject+method.
// The retired v1 status "implemented" (symbol + id present) is no longer produced.
const evidence = readJ("learning/EVIDENCE.json", { records: [] }).records;
const allHtml = Object.values(html).join(" ");
const ledger = [];
for (const f of fs.readdirSync(STAGE_DIR).filter((x) => x.endsWith(".json") && !x.includes(".ablate-"))) {
  const r = JSON.parse(fs.readFileSync(path.join(STAGE_DIR, f), "utf8"));
  for (const [m, rt] of Object.entries(r.routing)) {
    const decisions = Object.entries(r.decisions).filter(([, d]) => d.by.includes(m)).map(([k]) => k);
    const calls = r.operations.filter((o) => o.by.includes(m));
    const regions = [...new Set(calls.map((o) => o.region))];
    const elements = r.regions.filter((g) => regions.includes(g.id)).map((g) => ({ id: g.id, element: g.element, built: allHtml.includes(`id="${g.element}"`) }));
    const ev = evidence.filter((e) => e.identity === r.subject && (e.methods || []).includes(m) && fs.existsSync(e.png) && sha(e.png) === e.sha256);
    // design-only methods execute THROUGH their decisions: count the operator calls that consumed those decisions
    const consumers = r.operations.filter((o) => !o.ablated.length && (o.uses || []).some((u) => decisions.includes(u)));
    const evidenceOnly = !calls.length && !decisions.length;
    let status = rt.status !== "ROUTED" ? rt.status
      : calls.some((o) => !o.ablated.length) && (elements.some((e) => e.built) || calls.some((o) => ["paletteRoles", "drawnState", "rigBind", "deformMatched", "contactLayering"].includes(o.op))) ? "CODE_EMITTED"
      : calls.length && calls.every((o) => o.ablated.includes(m)) ? "FAILED"
      : consumers.length ? "CODE_EMITTED"
      : decisions.length ? "DESIGN_SPECIFIED"
      : evidenceOnly ? "RESEARCH_REQUIRED" : "FAILED";
    if (status === "CODE_EMITTED" && ev.length) status = ev.some((e) => e.verdict === "fail") ? "FAILED" : ev.some((e) => e.kind === "motion") ? "MOTION_PROVED" : "PIXELS_INSPECTED";
    ledger.push({ subject: r.subject, method: m, status, condition: rt.why, decisions, decision_consumers: consumers.map((o) => `${o.op}:${o.region}`).slice(0, 12), operators: [...new Set(calls.map((o) => o.op))], regions: elements, evidence: ev.map((e) => ({ png: e.png, kind: e.kind, verdict: e.verdict, note: e.note })), lessons_applied: r.lessons_applied });
  }
}
fs.mkdirSync("production/receipts", { recursive: true });
fs.writeFileSync("production/CONSTRUCTION_LEDGER.json", JSON.stringify({ built: new Date().toISOString(), qa, entries: ledger }, null, 1));
fs.writeFileSync("production/receipts/build.json", JSON.stringify({ qa, scenes: receipts, lessons_available: lessons.map((l) => l.rule_id), problems }, null, 1));

// ---- index.html ----
const audio = readJ("production/audio.json", []);
const dur = film.duration;
const hosts = SCENES.filter((s) => s.src).map((s, i) => `
      <div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join("");
const aud = audio.map((a, i) => `
      <audio id="${a.id}" class="clip" src="${a.src}" data-start="${a.start || 0}" data-duration="${a.dur}" data-track-index="${50 + i}" data-volume="${a.vol}"></audio>`).join("");
const grain = fs.existsSync("assets/grain.png") ? `
      <img id="grain" class="clip" src="assets/grain.png" alt="" data-start="0" data-duration="${dur}" data-track-index="30" />` : "";
fs.writeFileSync("index.html", `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <script src="assets/nu.js"></script>
    <script src="assets/form3d.js"></script>
    <script src="assets/mn.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: ${film.bg || "#111C3D"}; }
      #grain { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; z-index: 40; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${dur}" data-width="1920" data-height="1080">${hosts}${grain}${aud}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`);
const st = ledger.reduce((a, e) => ((a[e.status] = (a[e.status] || 0) + 1), a), {});
for (const f of fs.readdirSync(STAGE_DIR).filter((x) => x.endsWith(".json") && !x.includes(".ablate-"))) { const r = JSON.parse(fs.readFileSync(path.join(STAGE_DIR, f), "utf8")); for (const l of r.lessons_applied) console.log(`  lesson ${l.rule_id} -> ${r.subject}: ${l.skipped ? "SKIPPED (" + l.skipped + ")" : JSON.stringify(l.changed)}`); if (r.errors.length) console.log(`  ICD ${r.subject}: ${r.status} (${r.errors.length} errors)`); }
console.log(`built ${receipts.map((r) => r.scene).join(",")} dur ${dur}${qa ? " QA=" + qa : ""} | ledger ${JSON.stringify(st)}`);
for (const r of receipts) for (const a of r.applied_lessons) console.log(`  lesson ${a.rule_id} → ${r.scene}${a.key ? ` ${a.key}=${JSON.stringify(a.value)}` : " (read)"}`);
if (problems.length) { console.log("PROBLEMS:\n  " + problems.join("\n  ")); if (!rough) process.exitCode = 1; }

// commit receipts only after a complete build (problems in --rough mode still commit; a thrown build never reaches here)
if (!process.exitCode) { fs.rmSync("production/icd", { recursive: true, force: true }); fs.renameSync(STAGE_DIR, "production/icd"); }
