// Shared harness for Stage 2 proofs: compile a fixture scene, compose, bake, render with Chrome through nu.js, and measure pixels.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { composeShot } from "../../engine/art_bridge/scene_graph.mjs";
import { buildComposition, capture } from "../../engine/art_bridge/render.mjs";
import { readPNG } from "../../engine/art_bridge/png.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url));
export const REPO = path.resolve(here, "..", ".."), FIX = path.join(here, "fixtures"), EVID = path.join(REPO, "hybrid_v2", "evidence", "stage2"), WORK = path.join(REPO, "hybrid_v2", "work", "stage2");
export const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
export const rel = (f) => path.relative(REPO, f).split(path.sep).join("/");

export async function loadScene(k, { planOverride = null, manifestOverride = null } = {}) {
  let mrel = `stage2/scene_${k}.manifest.json`;
  if (manifestOverride) { const f = path.join(FIX, "_tmp", `scene_${k}_${crypto.randomBytes(4).toString("hex")}.json`); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(manifestOverride)); mrel = path.relative(FIX, f); }
  const reg = await createAssetRegistry(FIX, mrel);
  const plan = planOverride || JSON.parse(fs.readFileSync(path.join(FIX, "stage2", `scene_${k}.plan.json`), "utf8"));
  const C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan });
  return { reg, plan, C };
}
export async function renderFrames(S, shotIndex, frames, name, { background = true, omitBackground = false, range = null, browser = null, perturb = null, out = name } = {}) {
  const shot = S.reg.doc.shots[shotIndex], scene = composeShot(shot, S.reg, S.C, { prefix: `${name}-`, background });
  const r = range || [Math.min(...frames), Math.max(...frames) + 1];
  const comp = buildComposition(path.join(WORK, name, "comp"), { id: name, scene, frameRange: r, registry: S.reg });
  const cap = await capture(comp, FIX, frames, path.join(WORK, name, out), { omitBackground, id: name, browser, perturb });
  return { scene, comp, cap, files: cap.files };
}
export function centroid(png, pred, box = null) {
  let sx = 0, sy = 0, n = 0; const { width: W, height: H, rgba } = png, [x0, y0, x1, y1] = (box || [0, 0, W, H]).map(Math.round);
  for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) { const i = (y * W + x) * 4; if (pred(rgba[i], rgba[i + 1], rgba[i + 2], rgba[i + 3])) { sx += x + 0.5; sy += y + 0.5; n++; } }
  return n ? { x: sx / n, y: sy / n, n } : null;
}
export const near = (c, tol = 60) => (r, g, b, a) => a > 200 && Math.abs(r - c[0]) < tol && Math.abs(g - c[1]) < tol && Math.abs(b - c[2]) < tol;
export function countColour(png, c, tol = 6, box = null) { let n = 0; const { width: W, height: H, rgba } = png, [x0, y0, x1, y1] = (box || [0, 0, W, H]).map(Math.round); for (let y = Math.max(0, y0); y < Math.min(H, y1); y++) for (let x = Math.max(0, x0); x < Math.min(W, x1); x++) { const i = (y * W + x) * 4; if (Math.abs(rgba[i] - c[0]) <= tol && Math.abs(rgba[i + 1] - c[1]) <= tol && Math.abs(rgba[i + 2] - c[2]) <= tol) n++; } return n; }
export const pixel = (png, x, y) => { const i = (Math.floor(y) * png.width + Math.floor(x)) * 4; return [...png.rgba.slice(i, i + 4)]; };
export { stateAtFrame, readPNG, composeShot };
