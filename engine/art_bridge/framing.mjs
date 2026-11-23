// P04 §5.7 — the complete camera path, checked on every frame against measured artwork:
//   SUBJECT_CROPPED       a subject the direction attends to (shot attention_path, or plan.framing[shot].subjects) is less visible than allowed.
//                         A filled background never excuses a cropped character. Entrances/exits are declared: {rig, frames, min_visible, reason}.
//   RENDER_SCALE_EXCEEDED artwork is enlarged beyond its declared render_scale_range (on-screen scale relative to its canonical size).
// and P04 §5.3 — the contact patch of a held GRIP is measured on the approved PIXELS (alpha) of the visible hand drawing and the gripped prop:
//   CONTACT_PATCH_MISS    the painted hand does not cover the painted handle around the contact (a matching coordinate is not a grip).
import fs from "node:fs"; import path from "node:path";
import { err } from "./errors.mjs";
import { mul, apply, inv } from "./math2d.mjs";
import { cameraMatrix } from "./scene_graph.mjs";
import { stateAtFrame } from "./temporal.mjs";
import { canonicalQuad, canonicalToCrop } from "./asset_geometry.mjs";
import { readPNG } from "./png.mjs";
const area = (p) => { let a = 0; for (let i = 0; i < p.length; i++) { const [x0, y0] = p[i], [x1, y1] = p[(i + 1) % p.length]; a += x0 * y1 - x1 * y0; } return Math.abs(a) / 2; };
/** Sutherland–Hodgman against the viewport */
function clip(poly, W, H) { const edges = [[(p) => p[0] >= 0, (a, b) => { const t = (0 - a[0]) / (b[0] - a[0]); return [0, a[1] + t * (b[1] - a[1])]; }], [(p) => p[0] <= W, (a, b) => { const t = (W - a[0]) / (b[0] - a[0]); return [W, a[1] + t * (b[1] - a[1])]; }], [(p) => p[1] >= 0, (a, b) => { const t = (0 - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), 0]; }], [(p) => p[1] <= H, (a, b) => { const t = (H - a[1]) / (b[1] - a[1]); return [a[0] + t * (b[0] - a[0]), H]; }]]; let out = poly; for (const [ins, x] of edges) { const inp = out; out = []; for (let i = 0; i < inp.length; i++) { const a = inp[i], b = inp[(i + 1) % inp.length]; if (ins(b)) { if (!ins(a)) out.push(x(a, b)); out.push(b); } else if (ins(a)) out.push(x(a, b)); } if (!out.length) break; } return out; }
export const DEFAULT_MIN_VISIBLE = 0.85;
/** verifyFraming({compiled, doc, plan, score, total}) → {ok, failures, checked} (every frame of every shot) */
export function verifyFraming({ compiled: C, doc, plan = {}, score = null, total = null }) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), W = doc.stage.width, H = doc.stage.height, bad = {}, checked = [], add = (code, shot, rec, f, reason) => { const b = (bad[`${code}|${shot}|${rec}`] ||= { code, shot, rec, frames: [], reason }); b.frames.push(f); };
  for (const sh of doc.shots) {
    const decl = plan.framing?.[sh.id]?.subjects || [], att = (score?.shots || []).find((x) => x.shot === sh.id)?.attention_path || [], rigs = new Set([...decl.map((s) => s.rig), ...att.filter((e) => doc.rigs.some((r) => r.id === e))]), end = total === null ? sh.end_frame : Math.min(total, sh.end_frame); let n = 0;
    const acting = doc.actions.filter((a) => a.shot_id === sh.id); // frames where the subject is on stage
    for (let f = sh.start_frame; f < end; f++) {
      if (!acting.some((a) => a.frame_range[0] <= f && f < a.frame_range[1])) continue; let st; try { st = stateAtFrame(C, f); } catch (e) { if (e.code === "MISSING_ART_ASSET") continue; add("FRAME_EVALUATION_FAILED", sh.id, e.code || "EXCEPTION", f, e.human_readable_reason || e.message); continue; } n++;
      const per = {};
      for (const p of st.passes) { if (!p.visible) continue; const a = assets.get(p.asset_id); if (!a || a.kind === "VECTOR_PATH") continue; const M = mul(cameraMatrix(st.camera, a.depth_band || "FOCAL", plan.parallax, doc.stage), p.matrix), s = Math.sqrt(Math.abs(M[0] * M[3] - M[1] * M[2])), rg = a.render_scale_range; if (rg && s > rg[1] + 1e-6) add("RENDER_SCALE_EXCEEDED", sh.id, p.asset_id, f, `${p.asset_id} is shown at ${s.toFixed(2)}× its canonical size (approved up to ${rg[1]}×): the artwork is enlarged beyond its resolution contract`);
        if (rigs.has(p.rig)) { const q = canonicalQuad(a).map((c) => apply(M, c)), t = (per[p.rig] ||= { all: 0, vis: 0 }); t.all += area(q); const v = clip(q, W, H); t.vis += v.length > 2 ? area(v) : 0; } }
      for (const r of rigs) { const t = per[r]; if (!t || t.all <= 0) continue; const d = decl.find((x) => x.rig === r && (!x.frames || (x.frames[0] <= f && f < x.frames[1]))), min = d ? d.min_visible ?? DEFAULT_MIN_VISIBLE : DEFAULT_MIN_VISIBLE; if (d && (d.min_visible ?? 1) < DEFAULT_MIN_VISIBLE && !d.reason) { add("SUBJECT_CROPPED", sh.id, r, f, `${r}: a declared crop (min_visible ${d.min_visible}) needs a reason`); continue; } const frac = t.vis / t.all; if (frac < min - 1e-9) add("SUBJECT_CROPPED", sh.id, r, f, `${r} is ${(frac * 100).toFixed(0)}% inside the frame (needs ${(min * 100).toFixed(0)}%): the camera or staging crops an attended subject without a declared crop`); }
    }
    checked.push({ shot: sh.id, frames: n, subjects: [...rigs] });
  }
  const failures = Object.values(bad).map((b) => err(b.code, { shot_id: b.shot, record_id: b.rec, frame_range: [b.frames[0], b.frames.at(-1) + 1], reason: `${b.reason} (${b.frames.length} frame(s), first ${b.frames[0]})`, details: { frames: b.frames.length } }));
  return { ok: failures.length === 0, failures, checked };
}
/** verifyContactPatch({film, compiled, doc, plan}) → every locked GRIP, every held frame: painted hand pixels over painted prop pixels around the contact */
export function verifyContactPatch({ film, compiled: C, doc, plan = {}, total = null }) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), png = new Map(), failures = [], results = [], raster = (a) => { if (!png.has(a.id)) png.set(a.id, readPNG(path.join(path.resolve(film), a.file))); return png.get(a.id); };
  const alphaAt = (a, M, w) => { const c = apply(inv(M), w), u = canonicalToCrop(a, c), [sx, sy, sw, sh] = a.source_pixel_crop, x = Math.floor(sx + u[0]), y = Math.floor(sy + u[1]); if (u[0] < 0 || u[1] < 0 || u[0] >= sw || u[1] >= sh) return 0; const p = raster(a); return x < 0 || y < 0 || x >= p.width || y >= p.height ? 0 : p.rgba[(y * p.width + x) * 4 + 3]; };
  for (const k of C.contacts.filter((x) => x.c.contact_type === "GRIP" && x.tgtRig)) {
    const g = plan.grips?.[`${k.action.id}:${k.c.source_socket}`] || plan.grips?.[k.action.id], id = `${k.action.id}:${k.c.source_socket}`; if (!g) continue; // GRIP_CONTRACT_MISSING is reported by the frame evaluation
    const R = g.patch_radius_px ?? 30, need = g.min_patch_px ?? 24, end = total === null ? k.c.end_frame : Math.min(total, k.c.end_frame), hj = k.socket.joint_id, tj = C.rigs.get(k.tgtRig).socketById.get(k.c.target_socket).joint_id, hc = (C.rigs.get(k.rig).rec.state_channels || []).find((x) => x.kind === "HAND" && (!g.hand_channel || x.id === g.hand_channel)), missing = []; let worst = Infinity, worstF = null, n = 0;
    for (let f = k.c.start_frame; f < end; f++) {
      let st; try { st = stateAtFrame(C, f); } catch (e) { missing.push(`${f}:${e.code}`); continue; } const ct = st.contacts.find((x) => x.action === k.action.id && x.socket === k.c.source_socket); if (!ct?.locked) continue; n++;
      const at = C.socketWorld(k.rig, st.matrices[k.rig], k.c.source_socket), hand = st.passes.filter((p) => p.rig === k.rig && p.visible && (hc ? hc.slots.includes(p.slot) : p.joint === hj)), prop = st.passes.filter((p) => p.rig === k.tgtRig && p.visible && p.joint === tj); let cover = 0;
      for (let y = -R; y <= R; y += 2) for (let x = -R; x <= R; x += 2) { if (x * x + y * y > R * R) continue; const w = [at[0] + x, at[1] + y]; if (prop.some((p) => alphaAt(assets.get(p.asset_id), p.matrix, w) >= 128) && hand.some((p) => alphaAt(assets.get(p.asset_id), p.matrix, w) >= 128)) cover += 4; }
      if (cover < worst) { worst = cover; worstF = f; }
    }
    if (missing.length) failures.push(err("FRAME_EVALUATION_FAILED", { record_id: id, reason: `contact patch not measurable on ${missing.length} frame(s): ${missing.slice(0, 3).join(", ")}` }));
    if (n === 0 && end > k.c.start_frame) failures.push(err("CONTACT_PATCH_MISS", { record_id: id, frame_range: [k.c.start_frame, end], reason: `grip ${id} is never locked: there is no contact patch to measure` }));
    else if (n && worst < need) failures.push(err("CONTACT_PATCH_MISS", { record_id: id, frame_range: [worstF, worstF + 1], reason: `the painted hand covers ${worst}px² of the painted handle within ${R}px of the contact at frame ${worstF} (needs ${need}px²)` }));
    results.push({ grip: id, held_frames: n, min_cover_px2: Number.isFinite(worst) ? worst : null, at_frame: worstF, required_px2: need });
  }
  return { ok: failures.length === 0, failures, results };
}
void fs;
