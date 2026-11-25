// Render path (spec §5.7). Builds a composition page that loads the PRESERVED engine/runtime/gsap.min.js + nu.js, binds the baked frame table
// via runtime/bridge_rt.js (S.at hook), registers window.__timelines through S.done() (HyperFrames contract), serves approved asset bytes
// from the same HTTP origin, preloads/decodes every image before capture, and captures exact frames with Chrome (puppeteer-core) at
// 1920×1080, deviceScaleFactor 1, by seeking the GSAP timeline to f/60. Console errors and failed requests are recorded as failures.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import http from "node:http"; import crypto from "node:crypto";
import { err } from "./errors.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const CHROME = process.env.CHROME_PATH || "C:/Program Files/Google/Chrome/Application/chrome.exe";
export async function loadPuppeteer() {
  const cands = [process.env.PUPPETEER_CORE_PATH, ...(() => { const base = path.join(process.env.LOCALAPPDATA || "", "npm-cache", "_npx"); try { return fs.readdirSync(base).map((d) => path.join(base, d, "node_modules", "puppeteer-core")); } catch { return []; } })()].filter(Boolean);
  for (const c of cands) { const pj = path.join(c, "package.json"); if (fs.existsSync(pj)) { const main = JSON.parse(fs.readFileSync(pj, "utf8")); const entry = path.join(c, "lib", "esm", "puppeteer", "puppeteer-core.js"); return (await import(url.pathToFileURL(fs.existsSync(entry) ? entry : path.join(c, main.main || "index.js")))).default; } }
  throw err("RENDER_CAPTURE_FAILURE", { reason: "puppeteer-core not found (set PUPPETEER_CORE_PATH)" });
}

/** write composition dir: index.html (+ baked table inline), rt/ (nu.js, gsap, bridge), assets → served from manifest root */
export function buildComposition(outDir, { id, scene, frameRange, fps = 60, registry, title = id }) {
  fs.mkdirSync(path.join(outDir, "rt"), { recursive: true });
  for (const [src, dst] of [["engine/runtime/gsap.min.js", "gsap.min.js"], ["engine/runtime/nu.js", "nu.js"], ["engine/art_bridge/runtime/bridge_rt.js", "bridge_rt.js"]]) fs.copyFileSync(path.join(REPO, src), path.join(outDir, "rt", dst));
  const [f0, f1] = frameRange, frames = [];
  let ids = null; const failures = [];
  for (let f = f0; f < f1; f++) { const fs_ = scene.frameState(f); if (!ids) ids = fs_.rows.map((r) => r[0]); if (fs_.rows.length !== ids.length || fs_.rows.some((r, i) => r[0] !== ids[i])) throw err("UNDETERMINISTIC_FRAME", { frame_range: [f, f + 1], reason: "runtime element set changed between frames" }); frames.push(fs_.rows.map((r) => (r[4] ? [r[1], r[2], r[3], r[4]] : [r[1], r[2], r[3]]))); failures.push(...fs_.state.failures.map((e) => (e.toJSON ? e.toJSON() : e))); }
  const urls = [...new Set([...scene.svg.matchAll(/href="(assets\/[^"]+)"/g)].map((m) => m[1]))];
  const baked = { ids, fps, first_frame: f0, frames };
  const dur = (f1 - f0) / fps; // the timeline spans absolute frames [0, f1); bind clamps below f0
  const html = `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>${title}</title><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden}svg{display:block}</style></head><body>
<div id="root" data-composition-id="${id}" data-width="${registry.doc.stage.width}" data-height="${registry.doc.stage.height}" data-start="0" data-duration="${f1 / fps}">${scene.svg}</div>
<script src="rt/gsap.min.js"></script><script src="rt/nu.js"></script><script src="rt/bridge_rt.js"></script>
<script id="baked" type="application/json">${JSON.stringify(baked).replace(/</g, "\\u003c")}</script>
<script>(function(){var baked=JSON.parse(document.getElementById("baked").textContent);var S=NU.scene(${JSON.stringify(id)},${f1 / fps});ARTB.bind(S,baked);window.__artbUrls=${JSON.stringify(urls)};
window.__artbReady=ARTB.preload(window.__artbUrls).then(function(r){window.__artbPreload=r;S.done();return r;});})();</script></body></html>`;
  fs.writeFileSync(path.join(outDir, "index.html"), html);
  return { dir: outDir, ids, frames: f1 - f0, urls, failures, html_sha256: crypto.createHash("sha256").update(html).digest("hex"), dur };
}

/** static server: / → composition dir, /assets/* → manifest root (contained) */
export function serve(compDir, assetRoot) {
  const types = { ".html": "text/html", ".js": "text/javascript", ".png": "image/png", ".svg": "image/svg+xml", ".json": "application/json" };
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, "http://x").pathname), isA = u.startsWith("/assets/"), base = path.resolve(isA ? assetRoot : compDir), f = path.resolve(base, "." + (isA ? u.slice(7) : u === "/" ? "/index.html" : u));
    if (!f.startsWith(base + path.sep) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { "content-type": types[path.extname(f)] || "application/octet-stream", "cache-control": "no-store" }); fs.createReadStream(f).pipe(res);
  });
  return new Promise((ok) => srv.listen(0, "127.0.0.1", () => ok({ srv, url: `http://127.0.0.1:${srv.address().port}/`, close: () => new Promise((d) => srv.close(d)) })));
}

/** capture(comp, assetRoot, frames[], outDir, {omitBackground}) → {files, failures, preload} — frames are ABSOLUTE frame numbers */
export async function capture(comp, assetRoot, frameList, outDir, { omitBackground = false, id, fps = 60, browser: shared = null, prefix = "f", perturb = null } = {}) {
  const puppeteer = await loadPuppeteer(), server = await serve(comp.dir, assetRoot);
  const browser = shared || await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--force-color-profile=srgb", "--disable-gpu", "--disable-lcd-text", "--font-render-hinting=none", "--hide-scrollbars"] });
  const page = await browser.newPage(), failures = [], files = [];
  page.on("console", (m) => { if (m.type() === "error") failures.push({ code: "RENDER_CAPTURE_FAILURE", human_readable_reason: `console error: ${m.text()}` }); });
  page.on("pageerror", (e) => failures.push({ code: "RENDER_CAPTURE_FAILURE", human_readable_reason: `JS exception: ${e.message}` }));
  page.on("requestfailed", (r) => failures.push({ code: "MISSING_ART_ASSET", human_readable_reason: `request failed ${r.url()}` }));
  page.on("response", (r) => { if (r.status() >= 400) failures.push({ code: "MISSING_ART_ASSET", human_readable_reason: `HTTP ${r.status()} ${r.url()}` }); });
  try {
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
    await page.goto(server.url, { waitUntil: "load" });
    const preload = await page.evaluate(() => window.__artbReady);
    for (const p of preload) if (!p.ok) failures.push({ code: "MISSING_ART_ASSET", human_readable_reason: `decode failed ${p.u}` });
    if (perturb) await page.evaluate(perturb); // DIAGNOSTIC perturbation only (negative proofs); never used for production capture
    const domOrder = await page.evaluate(() => [...document.querySelectorAll("g[data-asset]")].map((g) => g.id));
    fs.mkdirSync(outDir, { recursive: true });
    for (const f of frameList) {
      const got = await page.evaluate(async (f, id, fps) => { window.__timelines[id].seek(f / fps, false); await Promise.all([...document.querySelectorAll("image[data-seq]")].map((el) => { const im = new Image(); im.src = el.href.baseVal; return im.decode().catch(() => null); })); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(window.__artbFrame)))); }, f, id, fps); // TBO-G14: per-frame host pass images are decoded before the frame is captured
      if (got !== f) failures.push({ code: "UNDETERMINISTIC_FRAME", frame_range: [f, f + 1], human_readable_reason: `runtime evaluated frame ${got} for requested ${f}` });
      const file = path.join(outDir, `${prefix}${String(f).padStart(4, "0")}.png`);
      await page.screenshot({ path: file, type: "png", omitBackground, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      files.push(file);
    }
    return { files, failures, preload, domOrder };
  } finally { await page.close(); if (!shared) await browser.close(); await server.close(); }
}
export async function launch() { const p = await loadPuppeteer(); return p.launch({ executablePath: CHROME, headless: true, args: ["--force-color-profile=srgb", "--disable-gpu", "--disable-lcd-text", "--font-render-hinting=none", "--hide-scrollbars"] }); }

/** renderStaticSvg(svg, assetRoot, outFile, {omitBackground}) — one static SVG page (no timeline) through the same server/Chrome path as capture();
 *  used by geometry pixel probes. Images are decoded before the screenshot; console/request failures throw. */
export async function renderStaticSvg(svg, assetRoot, outFile, { omitBackground = false } = {}) {
  const dir = path.join(path.dirname(outFile), `.static_${path.basename(outFile, ".png")}`); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), `<!doctype html><html><head><meta charset="utf-8"><link rel="icon" href="data:,"><style>html,body{margin:0;background:transparent;overflow:hidden}svg{display:block}</style></head><body>${svg}<script>window.__ready=Promise.all([...document.querySelectorAll("image")].map((im)=>{const i=new Image();i.src=im.getAttribute("href");return i.decode();}));</script></body></html>`);
  const puppeteer = await loadPuppeteer(), server = await serve(dir, assetRoot), browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--force-color-profile=srgb", "--disable-gpu", "--disable-lcd-text", "--font-render-hinting=none", "--hide-scrollbars"] });
  const failures = [];
  try { const page = await browser.newPage(); page.on("pageerror", (e) => failures.push(e.message)); page.on("requestfailed", (r) => failures.push(`request failed ${r.url()}`)); page.on("response", (r) => { if (r.status() >= 400) failures.push(`HTTP ${r.status()} ${r.url()}`); });
    await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 }); await page.goto(server.url, { waitUntil: "load" }); await page.evaluate(() => window.__ready);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))); fs.mkdirSync(path.dirname(outFile), { recursive: true });
    await page.screenshot({ path: outFile, type: "png", omitBackground, clip: { x: 0, y: 0, width: 1920, height: 1080 } }); }
  finally { await browser.close(); await server.close(); }
  if (failures.length) throw new Error(`renderStaticSvg failures: ${failures.join("; ")}`);
  return outFile;
}
