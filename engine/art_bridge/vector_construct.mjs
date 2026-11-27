// Native VECTOR construction (engine side of the manufacturing boundary): a film-supplied spec (shapes measured on an approved master + exact
// copy in a hash-pinned font) → SVG → raster at the directed native size through the controlled Chrome path. The record
// {spec, svg, font, chrome, result} is re-executable; provenance ENGINE_VECTOR_CONSTRUCTION is accepted only when re-rasterizing the recorded SVG
// reproduces the bytes. General-purpose: no film content lives here (specs are film data).
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs"; import { launch } from "./render.mjs";
const P = "engine/art_bridge/vector_construct.mjs", sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
export const VECTOR_VERSION = "vector_construct_v1";
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const rr = ([x, y, w, h], r, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="${fill}"${extra}/>`;

/** pageSVG(spec) — spec units are the master's pixel space; the SVG is drawn at spec.scale (native size = canvas × scale). */
export function pageSVG(spec) {
  const [W, H] = spec.canvas, k = spec.scale, s = [], p = spec.page; if (!(k > 0) || (!p && !spec.text)) throw err("SCHEMA_VIOLATION", { reason: "vector spec needs canvas, scale and a page or text", producer: P });
  const clip = p ? `<clipPath id="pg">${rr(p.rect, p.radius, "#000")}</clipPath>` : "";
  if (p) {
  s.push(rr(p.rect, p.radius, p.edge?.rim?.fill || p.fill)); // outermost rim colour shows as the 1-2 px border where the inner layers inset
  if (p.edge) { const [x, y, w, h] = p.rect, e = p.edge, rim = e.rim?.width || 0;
    s.push(`<g clip-path="url(#pg)">${rr([x, y, w - rim, h - rim], p.radius, e.fill)}${rr([x, y, w - (e.right || 0), h - (e.bottom || 0)], p.radius, p.fill)}</g>`); }
  else s.push(rr(p.rect, p.radius, p.fill)); }
  for (const sh of spec.shapes || []) if (sh.type === "roundrect") s.push(rr(sh.rect, sh.radius, sh.fill)); else throw err("SCHEMA_VIOLATION", { reason: `unknown shape ${sh.type}`, producer: P });
  const t = spec.text; if (t) for (const l of t.lines) s.push(`<text x="${l.x}" y="${l.y}" font-family="${esc(t.font.family)}" font-size="${l.size}" font-weight="${l.weight || 400}" fill="${l.fill}"${l.letter_spacing ? ` letter-spacing="${l.letter_spacing}"` : ""}${l.anchor ? ` text-anchor="${l.anchor}"` : ""}>${esc(l.text)}</text>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${Math.round(W * k)}" height="${Math.round(H * k)}"><defs>${clip}</defs>${s.join("")}</svg>`;
}

/** layersSVG(spec) — layered environment geometry (film data): gradients + shapes per layer; spec.render_layers selects the layers drawn
 *  (one world plane, or all of them for the composed master). Shapes: rect, rrect, poly, ellipse, path, line; fill = colour or url(#gradient). */
export function layersSVG(spec) {
  const [W, H] = spec.canvas, k = spec.scale; if (!(k > 0) || !Array.isArray(spec.layers)) throw err("SCHEMA_VIOLATION", { reason: "layers spec needs canvas, scale and layers", producer: P });
  const g = Object.entries(spec.gradients || {}).map(([id, d]) => `<linearGradient id="${esc(id)}" x1="${d.x1 ?? 0}" y1="${d.y1 ?? 0}" x2="${d.x2 ?? 0}" y2="${d.y2 ?? 1}"${d.units === "user" ? ' gradientUnits="userSpaceOnUse"' : ""}>${d.stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a != null ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`).join("");
  const at = (sh) => `${sh.fill ? ` fill="${esc(sh.fill)}"` : ' fill="none"'}${sh.stroke ? ` stroke="${esc(sh.stroke)}" stroke-width="${sh.sw ?? 1}" stroke-linecap="round" stroke-linejoin="round"` : ""}${sh.opacity != null ? ` opacity="${sh.opacity}"` : ""}`;
  const shape = (sh) => { switch (sh.t) {
    case "rect": return `<rect x="${sh.x}" y="${sh.y}" width="${sh.w}" height="${sh.h}"${at(sh)}/>`;
    case "rrect": return `<rect x="${sh.x}" y="${sh.y}" width="${sh.w}" height="${sh.h}" rx="${sh.r}" ry="${sh.r}"${at(sh)}/>`;
    case "poly": return `<polygon points="${sh.pts.map((q) => q.join(",")).join(" ")}"${at(sh)}/>`;
    case "ellipse": return `<ellipse cx="${sh.cx}" cy="${sh.cy}" rx="${sh.rx}" ry="${sh.ry}"${at(sh)}/>`;
    case "path": return `<path d="${esc(sh.d)}"${at(sh)}/>`;
    case "line": return `<line x1="${sh.x1}" y1="${sh.y1}" x2="${sh.x2}" y2="${sh.y2}"${at({ ...sh, fill: null })}/>`;
    default: throw err("SCHEMA_VIOLATION", { reason: `unknown shape ${sh.t}`, producer: P }); } };
  const want = new Set(spec.render_layers || spec.layers.map((l) => l.id));
  for (const id of want) if (!spec.layers.some((l) => l.id === id)) throw err("SCHEMA_VIOLATION", { reason: `unknown layer ${id}`, producer: P });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${Math.round(W * k)}" height="${Math.round(H * k)}"><defs>${g}</defs>${spec.layers.filter((l) => want.has(l.id)).map((l) => `<g id="${esc(l.id)}">${l.shapes.map(shape).join("")}</g>`).join("")}</svg>`;
}
export const svgFor = (spec) => spec.type === "layers" ? layersSVG(spec) : pageSVG(spec);

async function rasterize(svg, fontFile, family, outFile) {
  const m = svg.match(/width="(\d+)" height="(\d+)"/), w = +m[1], h = +m[2], font = fontFile ? fs.readFileSync(fontFile).toString("base64") : null;
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>${font ? `@font-face{font-family:"${family}";src:url(data:font/ttf;base64,${font});font-weight:100 900}` : ""}html,body{margin:0;background:transparent}svg{display:block}</style></head><body>${svg}</body></html>`;
  const browser = await launch(); try { const page = await browser.newPage(); await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 }); await page.setContent(html, { waitUntil: "load" });
    const ok = await page.evaluate(async (fam) => { await document.fonts.ready; return !fam || document.fonts.check(`600 40px "${fam}"`); }, font ? family : null); if (!ok) throw err("RENDER_CAPTURE_FAILURE", { reason: `font ${family} did not load`, producer: P });
    await page.screenshot({ path: outFile, type: "png", omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } }); return { chrome: await browser.version(), size: [w, h] }; }
  finally { await browser.close(); }
}

/** constructVector({spec, outDir}) → {file, record}; outDir/<sha16>.png + .svg + .CONSTRUCTION.json */
export async function constructVector({ spec, outDir }) {
  const fontFile = spec.text?.font?.file || null; if (fontFile && sha(fs.readFileSync(fontFile)) !== spec.text.font.sha256) throw err("SCHEMA_VIOLATION", { reason: `font file ${fontFile} does not match its pinned sha256`, producer: P });
  const svg = svgFor(spec); fs.mkdirSync(outDir, { recursive: true }); const tmp = path.join(outDir, `.tmp_${process.pid}.png`), r = await rasterize(svg, fontFile, spec.text?.font?.family, tmp), rs = sha(fs.readFileSync(tmp)), file = path.join(outDir, `${rs.slice(0, 16)}.png`); fs.renameSync(tmp, file);
  fs.writeFileSync(path.join(outDir, `${rs.slice(0, 16)}.svg`), svg);
  const record = { tool: VECTOR_VERSION, spec, spec_sha256: sha(JSON.stringify(spec)), svg_sha256: sha(svg), font_sha256: spec.text?.font?.sha256 || null, chrome: r.chrome, result_sha256: rs, result_size: r.size };
  fs.writeFileSync(path.join(outDir, `${rs.slice(0, 16)}.CONSTRUCTION.json`), JSON.stringify(record, null, 1)); return { file, record };
}
/** verifyConstruction(record, outDir) — rebuilds the SVG from the recorded spec and re-rasterizes; true only on identical bytes */
export async function verifyConstruction(record, outDir) {
  if (record.tool !== VECTOR_VERSION || sha(svgFor(record.spec)) !== record.svg_sha256) return false; const f = record.spec.text?.font?.file;
  if (f && (!fs.existsSync(f) || sha(fs.readFileSync(f)) !== record.font_sha256)) return false;
  const tmp = path.join(outDir, `.verify_${process.pid}_${Date.now()}.png`); try { await rasterize(svgFor(record.spec), f, record.spec.text?.font?.family, tmp); return sha(fs.readFileSync(tmp)) === record.result_sha256; } catch { return false; } finally { fs.rmSync(tmp, { force: true }); }
}
