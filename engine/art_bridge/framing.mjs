// P04 §5.7 — the complete camera path, checked on every frame against measured artwork:
//   SUBJECT_CROPPED       a subject the direction attends to (shot attention_path, or plan.framing[shot].subjects) is less visible than allowed.
//                         A filled background never excuses a cropped character. Entrances/exits are declared: {rig, frames, min_visible, reason}.
//   RENDER_SCALE_EXCEEDED artwork is enlarged beyond its declared render_scale_range (on-screen scale relative to its canonical size).
// and P04 §5.3 — the contact patch of a held GRIP is measured on the approved PIXELS (alpha) of the visible hand drawing and the gripped prop:
//   CONTACT_PATCH_MISS    the painted hand does not cover the painted handle around the contact (a matching coordinate is not a grip).
import fs from "node:fs"; import path from "node:path";
import { err } from "./errors.mjs";
import { mul, apply, inv } from "./math2d.mjs";
import { cameraMatrix, composeShot as composeShotDefault } from "./scene_graph.mjs";
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
/** P05 — a grounded character's shadow casters must form one connected silhouette in the approved pixels on every frame: a missing thigh would leave a torso
 *  patch floating away from the feet. The projection is affine, so connection of the painted casters IS connection of their shadow. */
export function verifyShadowContinuity({ film, compiled: C, doc, plan = {}, total = null, cell = 4, bridge = 2, minCells = 12 }) {
  const assets = new Map(doc.assets.map((a) => [a.id, a])), png = new Map(), failures = [], results = [], groups = new Map(); for (const s of (plan.shadows || []).filter((x) => x.ground_contact)) { const k = `${s.occluder.rig}|${s.receiver.id}`; groups.set(k, [...(groups.get(k) || []), s.occluder.slot]); }
  const rasterOf = (a) => { if (!png.has(a.id)) png.set(a.id, readPNG(path.join(path.resolve(film), a.file))); return png.get(a.id); };
  for (const [k, slots] of groups) { const rig = k.split("|")[0], acts = doc.actions.filter((a) => a.actors.some((x) => x.rig_id === rig)); if (!acts.length) continue; const f0 = Math.min(...acts.map((a) => a.frame_range[0])), f1 = Math.min(total ?? Infinity, Math.max(...acts.map((a) => a.frame_range[1]))); let worst = null, n = 0;
    for (let f = f0; f < f1; f++) { let st; try { st = stateAtFrame(C, f); } catch (e) { failures.push(err("FRAME_EVALUATION_FAILED", { record_id: rig, frame_range: [f, f + 1], reason: e.human_readable_reason || e.message })); continue; } const grid = new Set();
      for (const p of st.passes) { if (p.rig !== rig || !p.visible || !slots.includes(p.slot)) continue; const a = assets.get(p.asset_id); if (a.kind === "VECTOR_PATH") continue; const q = canonicalQuad(a).map((c) => apply(p.matrix, c)), xs = q.map((v) => v[0]), ys = q.map((v) => v[1]), Mi = inv(p.matrix), im = rasterOf(a), [sx, sy, sw, sh] = a.source_pixel_crop; for (let y = Math.floor(Math.min(...ys) / cell); y <= Math.max(...ys) / cell; y++) for (let x = Math.floor(Math.min(...xs) / cell); x <= Math.max(...xs) / cell; x++) { const u = canonicalToCrop(a, apply(Mi, [(x + 0.5) * cell, (y + 0.5) * cell])); if (u[0] < 0 || u[1] < 0 || u[0] >= sw || u[1] >= sh) continue; if (im.rgba[(Math.floor(sy + u[1]) * im.width + Math.floor(sx + u[0])) * 4 + 3] >= 128) grid.add(`${x},${y}`); } }
      if (!grid.size) continue; n++; const left = new Set(grid), comps = []; while (left.size) { const s0 = left.values().next().value, stack = [s0]; left.delete(s0); let size = 0; while (stack.length) { const [x, y] = stack.pop().split(",").map(Number); size++; for (let dy = -bridge; dy <= bridge; dy++) for (let dx = -bridge; dx <= bridge; dx++) { const t = `${x + dx},${y + dy}`; if (left.has(t)) { left.delete(t); stack.push(t); } } } if (size >= minCells) comps.push(size); }
      if (comps.length > 1 && (!worst || comps.length > worst.pieces)) worst = { frame: f, pieces: comps.length }; }
    results.push({ rig, frames: n, casters: slots.length, worst }); if (worst) failures.push(err("SHADOW_DISCONTINUOUS", { record_id: rig, frame_range: [worst.frame, worst.frame + 1], reason: `the shadow of ${rig} falls into ${worst.pieces} separate pieces (frame ${worst.frame}): a drawing that connects the body to the planted feet does not cast` })); }
  return { ok: failures.length === 0, failures, results };
}
void fs;

/** P08 C05 — directed readable-attention windows, measured on the target's ACTUAL VISIBLE PIXELS on every frame of each window:
 *  the target's visible drawings (registered alpha) are projected through the shot camera (per band), clipped to the frame, and every sample of
 *  the target that a later-painted drawing covers with alpha is occluded (the renderer's own paint order from composeShot). A window passes only when
 *  EVERY frame is readable (visible fraction ≥ min_visible_fraction and on-screen height ≥ min_target_height_px) and the window lasts at least
 *  min_window_frames. Inside a shot that directs attention, frames no window covers are an ATTENTION_GAP (accidental empty attention interval).
 *  Targets resolve to rig ids (rig id, identity id, or a socket of a rig). A moving camera or a filled background never proves readability.
 *  windows come from SHOT_SCORE shots[].attention [{frames, target}] (the packet's shots[].attention); policy from plan.attention_policy. */
export function verifyAttention({ film, compiled: C, registry, doc, plan = {}, score, total = null, composeShot = composeShotDefault, policy = {} }) {
  const P = { min_visible_fraction: DEFAULT_MIN_VISIBLE, min_target_height_px: 0, min_window_frames: 12, samples: 40, ...(plan.attention_policy || {}), ...policy };
  const assets = new Map(doc.assets.map((a) => [a.id, a])), W = doc.stage.width, H = doc.stage.height, png = new Map(), failures = [], windows = [];
  const raster = (a) => { if (!png.has(a.id)) png.set(a.id, readPNG(path.join(path.resolve(film), a.file))); return png.get(a.id); };
  const alpha = (a, M, w) => { const u = canonicalToCrop(a, apply(inv(M), w)), [sx, sy, sw, sh] = a.source_pixel_crop; if (u[0] < 0 || u[1] < 0 || u[0] >= sw || u[1] >= sh) return 0; const p = raster(a), x = Math.floor(sx + u[0]), y = Math.floor(sy + u[1]); return x < 0 || y < 0 || x >= p.width || y >= p.height ? 0 : p.rgba[(y * p.width + x) * 4 + 3]; };
  const rigsOf = (t) => { const r = doc.rigs.filter((x) => x.id === t || x.identity_id === t || (x.sockets || []).some((s) => s.id === t)).map((x) => x.id); if (r.length) return r; const a = doc.actions.find((x) => x.id === t); return a ? a.actors.map((x) => x.rig_id) : []; }; // rig | identity | socket | action (its actors)
  const F = (code, shot, rec, frames, reason, o = {}) => failures.push(err(code, { shot_id: shot, record_id: rec, frame_range: frames, reason, failed_invariant: o.inv ?? code, details: o.details }));
  const scenes = new Map(), orderOf = (sh) => { if (!scenes.has(sh.id)) { const sc = composeShot(sh, registry, C, { prefix: "" }), idx = new Map(); let k = 0; for (const b of ["FAR", "MID", "FOCAL", "NEAR", "FOREGROUND"]) for (const id of sc.order[b] || []) idx.set(id, k++); scenes.set(sh.id, idx); } return scenes.get(sh.id); };
  for (const sh of doc.shots) { const ss = (score?.shots || []).find((x) => x.shot === sh.id), ws = (ss?.attention || []).filter((w) => Array.isArray(w.frames)), end = total === null ? sh.end_frame : Math.min(total, sh.end_frame); if (!ws.length) continue;
    // accidental empty attention interval: shot frames no directed window covers
    const cov = ws.map((w) => [Math.max(w.frames[0], sh.start_frame), Math.min(w.frames[1], end)]).sort((a, b) => a[0] - b[0]); let at = sh.start_frame; const gaps = []; for (const [a, b] of cov) { if (a > at) gaps.push([at, a]); at = Math.max(at, b); } if (at < end) gaps.push([at, end]);
    for (const g of gaps) F("ATTENTION_GAP", sh.id, sh.id, g, `frames [${g}) of ${sh.id} have no directed attention target (an accidental empty attention interval)`);
    const order = orderOf(sh), world = doc.worlds.find((x) => x.id === sh.world_id), plates = (world?.depth_owners || []).flatMap((d) => d.asset_ids.map((aid) => ({ id: `world--${d.id}--${aid}`, a: assets.get(aid), band: d.depth_band }))).filter((q) => q.a && q.a.kind !== "VECTOR_PATH");
    for (const w of ws) { const fr = [Math.max(w.frames[0], sh.start_frame), Math.min(w.frames[1], end)]; if (fr[1] <= fr[0]) continue; const rigs = rigsOf(w.target), rec = { shot: sh.id, target: w.target, frames: fr, rigs, frames_checked: 0, unreadable: [], min_fraction: 1, min_height_px: Infinity };
      windows.push(rec); if (!rigs.length) { { const act = doc.actions.find((x) => x.id === w.target); F("ATTENTION_TARGET_UNKNOWN", sh.id, w.target, fr, act ? `attention target ${w.target} is an action with no rig actors (${act.mode}): its readability cannot be measured on drawn pixels; direct attention to a drawn owner` : `attention target ${w.target} is no rig, identity, socket or action of this film`); } continue; }
      if (fr[1] - fr[0] < P.min_window_frames) F("ATTENTION_WINDOW_TOO_SHORT", sh.id, w.target, fr, `the window on ${w.target} lasts ${fr[1] - fr[0]} frames, below the ${P.min_window_frames}-frame readable minimum`);
      for (let f = fr[0]; f < fr[1]; f++) { const st = stateAtFrame(C, f), cam = (p) => mul(cameraMatrix(st.camera, assets.get(p.asset_id)?.depth_band || "FOCAL", plan.parallax, doc.stage), p.matrix);
        const tp = st.passes.filter((p) => p.visible && rigs.includes(p.rig) && assets.get(p.asset_id) && assets.get(p.asset_id).kind !== "VECTOR_PATH"), above = (p) => order.get(p.pass_id) ?? -1;
        if (!tp.length) { rec.unreadable.push(f); rec.min_fraction = 0; continue; } rec.frames_checked++;
        const TM = tp.map((p) => ({ p, a: assets.get(p.asset_id), M: cam(p), o: above(p) })), quads = TM.flatMap((t) => canonicalQuad(t.a).map((c) => apply(t.M, c))), xs = quads.map((q) => q[0]), ys = quads.map((q) => q[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
        const occ = st.passes.filter((p) => p.visible && !rigs.includes(p.rig) && assets.get(p.asset_id) && assets.get(p.asset_id).kind !== "VECTOR_PATH").map((p) => ({ p, a: assets.get(p.asset_id), M: cam(p), o: above(p) }))
          .concat(plates.map((q) => ({ a: q.a, M: cameraMatrix(st.camera, q.band, plan.parallax, doc.stage), o: order.get(q.id) ?? -1 }))); // painted world plates occlude too (a near rock hides an actor)
        let tot = 0, vis = 0, oy0 = Infinity, oy1 = -Infinity;
        for (let i = 0; i < P.samples; i++) for (let j = 0; j < P.samples; j++) { const w_ = [x0 + ((i + 0.5) / P.samples) * (x1 - x0), y0 + ((j + 0.5) / P.samples) * (y1 - y0)]; let top = -1; for (const t of TM) if (alpha(t.a, t.M, w_) >= 128) top = Math.max(top, t.o); if (top < 0) continue; tot++; oy0 = Math.min(oy0, w_[1]); oy1 = Math.max(oy1, w_[1]);
          if (w_[0] < 0 || w_[1] < 0 || w_[0] >= W || w_[1] >= H) continue; if (occ.some((q) => q.o > top && alpha(q.a, q.M, w_) >= 128)) continue; vis++; }
        const frac = tot ? vis / tot : 0, hpx = tot ? oy1 - oy0 + (y1 - y0) / P.samples : 0; rec.min_fraction = Math.min(rec.min_fraction, frac); rec.min_height_px = Math.min(rec.min_height_px, hpx);
        if (frac < P.min_visible_fraction || hpx < P.min_target_height_px) rec.unreadable.push(f); }
      if (rec.unreadable.length) { const u = rec.unreadable; F("ATTENTION_TARGET_UNREADABLE", sh.id, w.target, [u[0], u.at(-1) + 1], `${w.target} is not readable on ${u.length} of ${fr[1] - fr[0]} frames of its attention window [${fr}) (min visible fraction ${rec.min_fraction.toFixed(2)} < ${P.min_visible_fraction}${P.min_target_height_px ? `, min height ${rec.min_height_px.toFixed(0)}px vs ${P.min_target_height_px}` : ""}; first ${u[0]})`, { details: { frames: u.length } }); } } }
  return { ok: failures.length === 0, failures, windows, policy: P };
}
