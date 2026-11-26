// P08 D03 — native artwork resolution against the MAXIMUM projected on-screen coverage, every frame.
//   effectiveUpscale(png, crop)  how many times the delivered pixels were enlarged from a smaller original: for k = 2,3,4 the drawing is box-reduced
//                                by k and enlarged back (nearest and bilinear); if the reconstruction reproduces the original on its EDGE pixels
//                                (where real detail lives; flat fills say nothing), the image carries only 1/k of its pixel count as native detail.
//   verifyNativeResolution(...)  for every visible drawing on every evaluated frame: screen pixels per NATIVE source pixel = |det(camera·pass·crop→canonical)|^½
//                                × upscale k. The design-approved factor F (E01 D3: 2×) requires ≥ F native source pixels per screen pixel at the
//                                largest coverage the camera path ever gives it. Failure names the asset, the worst frame and the source size needed.
import fs from "node:fs"; import path from "node:path";
import { err } from "./errors.mjs";
import { mul } from "./math2d.mjs";
import { cameraMatrix } from "./scene_graph.mjs";
import { stateAtFrame } from "./temporal.mjs";
import { cropToCanonical } from "./asset_geometry.mjs";
import { readPNG } from "./png.mjs";
const lum = (d, i) => 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2];
/** effectiveUpscale(png, [sx,sy,sw,sh]) → {k, edge_pixels, rmse:{2,3,4}} ; k = 1 when the delivered pixels are native */
export function effectiveUpscale(png, crop, { edge_threshold = 24, max_rmse = 3 } = {}) {
  const [sx, sy, sw, sh] = crop, W = png.width, d = png.rgba, A = (x, y) => d[((sy + y) * W + sx + x) * 4 + 3], L = (x, y) => lum(d, ((sy + y) * W + sx + x) * 4);
  const edges = []; for (let y = 1; y < sh - 1; y++) for (let x = 1; x < sw - 1; x++) { if (A(x, y) < 128) continue; const g = Math.max(Math.abs(L(x + 1, y) - L(x - 1, y)), Math.abs(L(x, y + 1) - L(x, y - 1))); if (g >= edge_threshold) edges.push([x, y]); }
  const out = { k: 1, edge_pixels: edges.length, rmse: {} }; if (edges.length < 64) return { ...out, note: "too few edge pixels to judge (flat drawing): treated as native" };
  for (const k of [4, 3, 2]) { const bw = Math.floor(sw / k), bh = Math.floor(sh / k); if (bw < 4 || bh < 4) continue; const box = new Float64Array(bw * bh);
    for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) { let s = 0; for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) s += L(bx * k + i, by * k + j); box[by * bw + bx] = s / (k * k); }
    const near = (x, y) => box[Math.min(bh - 1, Math.floor(y / k)) * bw + Math.min(bw - 1, Math.floor(x / k))];
    const bil = (x, y) => { const u = Math.max(0, Math.min(bw - 1, (x + 0.5) / k - 0.5)), v = Math.max(0, Math.min(bh - 1, (y + 0.5) / k - 0.5)), x0 = Math.floor(u), y0 = Math.floor(v), x1 = Math.min(bw - 1, x0 + 1), y1 = Math.min(bh - 1, y0 + 1), fx = u - x0, fy = v - y0; return (box[y0 * bw + x0] * (1 - fx) + box[y0 * bw + x1] * fx) * (1 - fy) + (box[y1 * bw + x0] * (1 - fx) + box[y1 * bw + x1] * fx) * fy; };
    let en = 0, eb = 0, n = 0; for (const [x, y] of edges) { if (x >= bw * k || y >= bh * k) continue; const o = L(x, y); en += (o - near(x, y)) ** 2; eb += (o - bil(x, y)) ** 2; n++; }
    const r = Math.sqrt(Math.min(en, eb) / Math.max(1, n)); out.rmse[k] = +r.toFixed(3); if (r <= max_rmse && out.k === 1) out.k = k; }
  return out;
}
/** verifyNativeResolution({film, compiled, doc, plan, total, factor}) → {ok, failures, assets:[{asset, frames_checked, worst_frame, native_px_per_screen_px, upscale_k, needed_source_px}]} */
export function verifyNativeResolution({ film, compiled: C, doc, plan = {}, total = null, factor = null, frames = null }) {
  const F_ = factor ?? plan.resolution_policy?.native_factor, failures = [], per = new Map(), assets = new Map(doc.assets.map((a) => [a.id, a])), up = new Map(), T = total ?? doc.stage.total_frames;
  if (!(F_ > 0)) return { ok: false, failures: [err("RENDER_SCALE_EXCEEDED", { record_id: "(policy)", reason: "no design-approved native resolution factor (plan.resolution_policy.native_factor): native resolution was not evaluated", failed_invariant: "NATIVE_FACTOR_DECLARED" })], assets: [] };
  const kOf = (a) => { if (!up.has(a.id)) { let r; try { r = effectiveUpscale(readPNG(path.join(path.resolve(film), a.file)), a.source_pixel_crop); } catch (e) { r = { k: 1, note: `unreadable: ${e.message}` }; } up.set(a.id, r); } return up.get(a.id); };
  const visit = (a, Mscreen, f) => { const M = mul(Mscreen, cropToCanonical(a)), s = Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2])), k = kOf(a).k, nat = 1 / (s * k), r = per.get(a.id) || { asset: a.id, frames_checked: 0, worst_frame: null, native_px_per_screen_px: Infinity, upscale_k: k, upscale: kOf(a), source_px: [a.source_pixel_crop[2], a.source_pixel_crop[3]] }; r.frames_checked++; if (nat < r.native_px_per_screen_px) { r.native_px_per_screen_px = nat; r.worst_frame = f; } per.set(a.id, r); };
  const list = frames ?? [...Array(T).keys()];
  for (const f of list) { if (!C.shotAt(f)) continue; let st; try { st = stateAtFrame(C, f); } catch (e) { if (e.code === "MISSING_ART_ASSET") continue; throw e; }
    for (const p of st.passes) { if (!p.visible) continue; const a = assets.get(p.asset_id); if (!a || a.kind === "VECTOR_PATH") continue; visit(a, mul(cameraMatrix(st.camera, a.depth_band || "FOCAL", plan.parallax, doc.stage), p.matrix), f); }
    const sh = C.shotAt(f), w = doc.worlds.find((x) => x.id === sh.world_id); for (const d of w?.depth_owners || []) for (const aid of d.asset_ids) { const a = assets.get(aid); if (a && a.kind !== "VECTOR_PATH") visit(a, cameraMatrix(st.camera, d.depth_band, plan.parallax, doc.stage), f); } }
  for (const r of per.values()) { r.native_px_per_screen_px = +r.native_px_per_screen_px.toFixed(3); if (r.native_px_per_screen_px + 1e-9 < F_) { const need = r.source_px.map((v) => Math.ceil((v * F_) / r.native_px_per_screen_px)); r.needed_source_px = need;
    failures.push(err("RENDER_SCALE_EXCEEDED", { record_id: r.asset, frame_range: [r.worst_frame, r.worst_frame + 1], failed_invariant: "NATIVE_RESOLUTION_FACTOR", reason: `${r.asset} has ${r.native_px_per_screen_px} native source px per screen px at frame ${r.worst_frame} (its largest coverage), below the approved ${F_}×${r.upscale_k > 1 ? `; its ${r.source_px.join("×")} pixels are a ${r.upscale_k}× enlargement of a smaller original (counted as ${Math.round(r.source_px[0] / r.upscale_k)}×${Math.round(r.source_px[1] / r.upscale_k)} native)` : ""}: needs a native source of at least ${need.join("×")} px or a smaller on-screen size`, details: { worst_frame: r.worst_frame, upscale: r.upscale } })); } }
  return { ok: failures.length === 0, failures, assets: [...per.values()], factor: F_ };
}
