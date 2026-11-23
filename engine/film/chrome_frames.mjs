// Production frame renderer `art_bridge_chrome_frames` (P02 directive F073/F076). ONE controlled Chrome session renders absolute frames of an
// approved film through the EXISTING path: manifest → createAssetRegistry (byte-verified assets) → compileMotionTracks → composeShot →
// buildComposition (preserved engine/runtime/nu.js + gsap + bridge_rt.js) → seek the timeline to f/60 → native 1920×1080 screenshot →
// decoded packed RGB24 (exactly width*height*3 bytes). Never upscales, never substitutes pixels; any missing/failed resource throws.
// Effects/blur are CONTRACT consumers: plan.effects → seededParticles baked as approved sprite images; plan.motion_blur → shutterSamples
// sub-frame composites of the SAME scene, averaged. Seeking is absolute: render order cannot change a frame.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { err } from "../art_bridge/errors.mjs";
import { createAssetRegistry } from "../art_bridge/asset_registry.mjs";
import { compileMotionTracks } from "../art_bridge/temporal.mjs";
import { composeShot } from "../art_bridge/scene_graph.mjs";
import { buildComposition, serve, loadPuppeteer, CHROME } from "../art_bridge/render.mjs";
import { decodePNG } from "../art_bridge/png.mjs";
import { seededParticles, shutterSamples } from "../art_bridge/motion_systems.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f)), REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";

/** effect contract → extra scene elements: N particles of an APPROVED sprite whose screen positions come from seededParticles(seed, f) + wind */
// P02 repair (rehearsal H, FROZEN_FRAME over the effect interval): the runtime toggles visibility through style.display ("vis" in nu.js); an
// inline visibility:hidden can never be overridden by that, so particles were hidden forever. Initial state is display:none, toggled per frame.
/** expected VISIBLE state of a frame (P02 repair, rehearsal I): a hidden row contributes only [id, hidden], so a hidden element whose transform
 *  keeps evolving (e.g. particles after their effect interval) is not "expected motion"; frozen-frame detection compares what should be SEEN. */
export const visibleStateSha = (rows) => sha(JSON.stringify(rows.map((r) => (r[2] === 1 ? r : [r[0], 0]))));
export function withEffects(scene, effects, registry, shotId, prefix) {
  const mine = (effects || []).filter((e) => e.shot === shotId); if (!mine.length) return scene;
  const assets = new Map(registry.doc.assets.map((a) => [a.id, a])); let svg = "", ids = [];
  for (const e of mine) { const a = assets.get(e.asset_id); if (!a) throw err("MISSING_ART_ASSET", { record_id: e.id, dependency: e.asset_id, reason: `effect ${e.id} sprite ${e.asset_id} is not a registered asset`, producer: "engine/film/chrome_frames.mjs#withEffects" });
    for (let i = 0; i < e.count; i++) { const id = `${prefix}fx-${e.id}-${i}`; ids.push(id); svg += `<g id="${id}" data-asset="${a.id}" transform="matrix(1 0 0 1 0 0)" style="display:none"><image href="assets/${a.file}" width="${e.size?.[0] ?? a.width_px}" height="${e.size?.[1] ?? a.height_px}"/></g>`; } }
  const close = scene.svg.lastIndexOf("</svg>");
  return { ...scene, svg: scene.svg.slice(0, close) + `<g id="${prefix}fx-layer">${svg}</g>` + scene.svg.slice(close), frameState(f, opts = {}) {
    const base = scene.frameState(f, opts), rows = [...base.rows];
    for (const e of mine) { const on = f >= e.frames[0] && f < e.frames[1], pts = seededParticles(e.seed, f, e.count), t = (f - e.frames[0]) / 60;
      pts.forEach(([x, y], i) => rows.push([`${prefix}fx-${e.id}-${i}`, `matrix(1 0 0 1 ${(x + (e.wind?.[0] ?? 0) * t).toFixed(3)} ${((y + (e.wind?.[1] ?? 0) * t) % 1080).toFixed(3)})`, on ? 1 : 0, 1])); }
    return { ...base, rows }; } };
}

/** createChromeFrameSession({film, manifest, planFile, seed, fps, width, height, runType}) → {renderFrame(f) → {rgb, state_sha}, close(), info} */
/** P03 G: attribution units of a shot — every placed rig, plus the slots that carry declared discrete or deformable change (state channels,
 *  posed slots, deform maps, morphs, grip hands). Each unit is captured ISOLATED (all other elements hidden, cameras kept) so a frozen owner
 *  cannot hide behind other motion in the frame. Element membership is by runtime id: `<rig>--<slot>--<asset>` (+ `--tri*`, `-path*`). */
export function attributionUnits(doc, plan, scene, prefix, shot) {
  const ids = scene.runtimeIds, rigs = doc.rigs.filter((r) => ids.some((i) => i.startsWith(`${prefix}${r.id}--`))), units = [];
  for (const r of rigs) { units.push({ id: r.id, rig: r.id, kind: "RIG", match: `${prefix}${r.id}--` });
    const slots = new Set([...(r.state_channels || []).flatMap((c) => c.slots), ...[...r.pose_states, ...r.view_states].flatMap((s) => Object.keys(s.asset_bindings || {})),
      ...Object.values(plan.deform_maps || {}).filter((m) => m.rig === r.id).map((m) => m.slot), ...Object.values(plan.morphs || {}).filter((m) => m.rig === r.id).map((m) => m.slot)]);
    for (const s of slots) units.push({ id: `${r.id}:${s}`, rig: r.id, slot: s, kind: "SLOT", match: `${prefix}${r.id}--${s}--` }); }
  return units.filter((u) => ids.some((i) => i.startsWith(u.match)));
}
export async function createChromeFrameSession({ film, manifest = MF, planFile, seed = 1, fps = 60, width = 1920, height = 1080, runType = "PRODUCTION", workDir = null, attribution = true, diagnosticPerturb = null }) {
  if (diagnosticPerturb && runType === "PRODUCTION") throw err("RENDER_CAPTURE_FAILURE", { reason: "diagnostic perturbation is refused in a PRODUCTION session", producer: "engine/film/chrome_frames.mjs#createChromeFrameSession" });
  const FILM = path.resolve(film), reg = await createAssetRegistry(FILM, manifest, { production: runType === "PRODUCTION" }), doc = reg.doc, plan = JSON.parse(fs.readFileSync(planFile, "utf8"));
  if (doc.stage.width !== width || doc.stage.height !== height || doc.stage.fps !== fps) throw err("RENDER_CAPTURE_FAILURE", { reason: `film stage ${doc.stage.width}x${doc.stage.height}@${doc.stage.fps} ≠ requested ${width}x${height}@${fps}`, producer: "engine/film/chrome_frames.mjs#createChromeFrameSession" });
  // every asset the film binds must exist with the EXACT bytes the manifest declares (no filename trust)
  for (const a of doc.assets) { const f = path.join(FILM, a.file); if (!fs.existsSync(f)) throw err("MISSING_ART_ASSET", { record_id: a.id, reason: `asset file ${a.file} missing` }); if (fsha(f) !== a.sha256) throw err("ASSET_HASH_MISMATCH", { record_id: a.id, reason: "asset bytes differ from the manifest hash", producer: "engine/film/chrome_frames.mjs#createChromeFrameSession" }); }
  // P03 repair: the composition cache is keyed by EVERY module the bake can depend on (all of engine/art_bridge + the runtime), not a hand-kept
  // list — a fixed list missed execution.mjs/acting.mjs/state_channels.mjs, so an engine change silently reused stale baked frames
  const bakeSources = [...fs.readdirSync(path.join(REPO, "engine", "art_bridge")).filter((f) => f.endsWith(".mjs")).map((f) => `engine/art_bridge/${f}`), "engine/art_bridge/runtime/bridge_rt.js", "engine/runtime/nu.js", "engine/runtime/gsap.min.js", "engine/film/chrome_frames.mjs"].sort();
  const codeKey = sha(JSON.stringify(bakeSources.map((r) => [r, fsha(path.join(REPO, r))])));
  const C = compileMotionTracks(doc.actions, doc.shots, { doc, plan }), dir = workDir || path.join(FILM, "render", "compositions", sha(JSON.stringify({ m: fsha(path.join(FILM, manifest)), p: fsha(planFile), seed })).slice(0, 16));
  const shots = doc.shots.map((s, k) => { const prefix = `s${k}-`, scene = withEffects(composeShot(s, reg, C, { prefix }), plan.effects, reg, s.id, prefix); return { shot: s, scene, prefix, units: attributionUnits(doc, plan, scene, prefix, s) }; });
  const blur = plan.motion_blur || [], puppeteer = await loadPuppeteer();
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--force-color-profile=srgb", "--disable-gpu", "--disable-lcd-text", "--font-render-hinting=none", "--hide-scrollbars", "--deterministic-mode", "--disable-background-timer-throttling"] });
  const pages = new Map(), failures = []; let closed = false;
  const pageFor = async (k) => {
    if (pages.has(k)) return pages.get(k);
    for (const [kk, p] of pages) if (kk !== k) { await p.page.close(); await p.server.close(); pages.delete(kk); } // at most one live composition page: bounded memory
    // composition cache keyed by CONTENT (manifest, plan, seed, effects and the producing code); a stale or partial bake is rebuilt
    const { shot, scene } = shots[k], cdir = path.join(dir, shot.id), keyF = path.join(cdir, ".KEY"), key = sha(JSON.stringify({ codeKey, shot: shot.id, svg: sha(scene.svg), plan: fsha(planFile), manifest: fsha(path.join(FILM, manifest)), seed })); // P03: the baked rows depend on the plan + manifest, not only on the SVG
    const comp = fs.existsSync(keyF) && fs.readFileSync(keyF, "utf8") === key && fs.existsSync(path.join(cdir, "index.html")) ? { dir: cdir, reused: true } : (() => { fs.rmSync(keyF, { force: true }); const c = buildComposition(cdir, { id: `${shot.id}`, scene, frameRange: [shot.start_frame, shot.end_frame], registry: reg, fps }); fs.writeFileSync(keyF, key); return c; })();
    const server = await serve(comp.dir, FILM), page = await browser.newPage();
    page.on("pageerror", (e) => failures.push(`JS exception: ${e.message}`)); page.on("requestfailed", (r) => failures.push(`request failed ${r.url()}`)); page.on("response", (r) => { if (r.status() >= 400) failures.push(`HTTP ${r.status()} ${r.url()}`); });
    await page.setViewport({ width, height, deviceScaleFactor: 1 }); await page.goto(server.url, { waitUntil: "load" });
    const pre = await page.evaluate(() => window.__artbReady); const bad = pre.filter((p) => !p.ok); if (bad.length || failures.length) throw err("MISSING_ART_ASSET", { reason: `composition ${shot.id}: ${[...bad.map((b) => `decode failed ${b.u}`), ...failures].join("; ")}`, producer: "engine/film/chrome_frames.mjs#createChromeFrameSession" });
    const entry = { page, server, comp }; pages.set(k, entry); return entry;
  };
  const shotOf = (f) => shots.findIndex(({ shot }) => f >= shot.start_frame && f < shot.end_frame);
  const shoot = async (page) => { const png = await page.screenshot({ type: "png", clip: { x: 0, y: 0, width, height } }); const d = decodePNG(Buffer.from(png)); if (d.width !== width || d.height !== height) throw err("IMAGE_DIMENSION_MISMATCH", { reason: `screenshot ${d.width}x${d.height}` });
    const rgb = Buffer.allocUnsafe(width * height * 3); for (let i = 0, j = 0; i < d.rgba.length; i += 4, j += 3) { rgb[j] = d.rgba[i]; rgb[j + 1] = d.rgba[i + 1]; rgb[j + 2] = d.rgba[i + 2]; } return rgb; };
  async function renderFrame(f) {
    if (closed) throw err("RENDER_CAPTURE_FAILURE", { reason: "session closed" });
    const k = shotOf(f); if (k < 0) throw err("FRAME_TILING_GAP", { frame_range: [f, f + 1], reason: `no shot owns frame ${f}` });
    const { page } = await pageFor(k), { shot, scene } = shots[k];
    const got = await page.evaluate((f, id, fps) => { window.__timelines[id].seek(f / fps, false); return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(window.__artbFrame)))); }, f, shot.id, fps);
    if (got !== f) throw err("UNDETERMINISTIC_FRAME", { frame_range: [f, f + 1], reason: `runtime evaluated ${got} for requested ${f}` });
    if (failures.length) throw err("RENDER_CAPTURE_FAILURE", { frame_range: [f, f + 1], reason: failures.join("; ") });
    const rows = scene.frameState(f).rows, b = blur.find((x) => f >= x.frames[0] && f < x.frames[1]);
    // DIAGNOSTIC perturbation (negative proofs only): the EXPECTED state stays the true rows; only the pixels are perturbed
    const shown = diagnosticPerturb ? diagnosticPerturb(rows, f, shots[k].prefix) : null;
    if (shown) await page.evaluate((r, tag) => { ARTB.applyRows(r, tag); return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))); }, shown.map((r) => [r[0], r[1], r[2], r[3], r[4]]), f);
    // isolated capture per unit + COUNTERFACTUAL references: ref_swap = this frame drawn with the PREVIOUS frame's drawing set (a discrete swap
    // that did not reach the pixels equals it), ref_rigid = this frame drawn without the active deformation/morph (a dropped deformation equals it)
    const capture = async (r) => { await page.evaluate((x, tag) => { ARTB.applyRows(x, tag); return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))); }, r, f); return sha(await shoot(page)); };
    const deformables = scene.deformables || { tris: [], morphs: [] }; let prevRows = null; const prev = () => (prevRows ??= f > shot.start_frame ? scene.frameState(f - 1).rows : null);
    const visSet = (rs) => sha(JSON.stringify(rs.filter((r) => r[2] === 1).map((r) => r[0])));
    // isolation uses the shot's FIXED reference camera (its first frame): camera moves are attributed to the camera, never to an owner
    const camPre = `${shots[k].prefix}cam-`, camRef = (shots[k].camRef ??= new Map(scene.frameState(shot.start_frame).rows.filter((r) => r[0].startsWith(camPre)).map((r) => [r[0], r])));
    const attributionOf = async (base) => { if (!attribution) return {}; const out = {}; for (const u of shots[k].units) { const mineOnly = (r) => r[0].startsWith(u.match), own = (r) => mineOnly(r) || r[0].startsWith(camPre), iso = base.map((r) => (r[0].startsWith(camPre) ? camRef.get(r[0]) || r : mineOnly(r) ? r : [r[0], r[1], 0, r[3], r[4]])), mine = rows.filter(mineOnly);
        const o = (out[u.id] = { px: await capture(iso), state: visibleStateSha(mine), visible_set: visSet(mine), ref_swap: null, ref_rigid: null });
        if (u.kind !== "SLOT") continue;
        const pr = prev(), pmine = pr ? pr.filter(mineOnly) : null;
        if (pmine && visSet(pmine) !== o.visible_set) { const pv = new Map(pmine.map((r) => [r[0], r])); o.ref_swap = await capture(iso.map((r) => (mineOnly(r) && pv.has(r[0]) ? [r[0], r[1], pv.get(r[0])[2], pv.get(r[0])[3], r[4]] : r))); }
        const tris = deformables.tris.filter((t) => t.id.startsWith(u.match) && rows.find((r) => r[0] === t.id)?.[2] === 1), morphs = deformables.morphs.filter((m) => m.id.startsWith(u.match));
        const morphOn = morphs.some((m) => rows.find((r) => r[0] === m.id)?.[4]?.d !== m.d0);
        if (tris.length || morphOn) { const triIds = new Set(tris.map((t) => t.id)), bases = new Set(tris.map((t) => t.base)), d0 = new Map(morphs.map((m) => [m.id, m.d0]));
          o.ref_rigid = await capture(iso.map((r) => (triIds.has(r[0]) ? [r[0], r[1], 0, r[3], r[4]] : bases.has(r[0]) ? [r[0], r[1], 1, r[3], r[4]] : d0.has(r[0]) ? [r[0], r[1], r[2], r[3], { d: d0.get(r[0]) }] : r))); } }
      return out; };
    if (!b) { const rgb = await shoot(page), owners = await attributionOf(shown || rows); return { rgb, state_sha: visibleStateSha(rows), owners }; }
    // shutter: N sub-frame composites of the same scene at f + k·shutter/N, averaged per channel (a real compositor consumer, not a ghost layer)
    const times = shutterSamples((t) => t, f, { shutter: b.shutter, samples: b.samples }), acc = new Uint32Array(width * height * 3), all = [];
    for (const t of times) { const r = scene.frameState(t, { subframe: true }).rows; all.push(r); await page.evaluate((rows, tag) => { ARTB.applyRows(rows, tag); return new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok))); }, r, f); const s = await shoot(page); for (let i = 0; i < s.length; i++) acc[i] += s[i]; }
    const rgb = Buffer.allocUnsafe(acc.length); for (let i = 0; i < acc.length; i++) rgb[i] = Math.round(acc[i] / times.length);
    return { rgb, state_sha: visibleStateSha(all.flat()), blur: { shutter: b.shutter, samples: times.length } };
  }
  const browserVersion = await browser.version();
  return { renderFrame, width, height, info: { renderer: "art_bridge_chrome_frames", browser: browserVersion, chrome_path: CHROME, nu_js_sha256: fsha(path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "runtime", "nu.js")), run_type: runType, shots: shots.map((s) => s.shot.id), browser_pid: browser.process()?.pid ?? null },
    async close() { if (closed) return; closed = true; for (const p of pages.values()) { try { await p.page.close(); } catch {} try { await p.server.close(); } catch {} } await browser.close(); } };
}
export function chromeRss(pid) { try { const o = execFileSync("tasklist", ["/FI", `PID eq ${pid}`, "/FO", "CSV", "/NH"], { encoding: "utf8" }); const m = o.match(/"([\d,.]+) K"/); return m ? +m[1].replace(/[,.]/g, "") * 1024 : null; } catch { return null; } }
