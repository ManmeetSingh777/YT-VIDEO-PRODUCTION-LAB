// P08 B05 (articulated silhouette / seam integrity) and B08 (support intent + collision policy), measured on the SAME evaluated frames the
// renderer draws, against the REAL registered alpha of each drawing (decoded PNG through crop→canonical→joint→world) — never a bbox stand-in.
//   seams      [{id, rig, joint, radius_px, parts:[slot], samples?, min_alpha?}]  every sample on the ring around the joint pivot (and the pivot) is
//              covered by ≥1 visible listed drawing with alpha ≥ min_alpha; part scale never changes (no stretched limb); missing → hole with angle
//   intents    [{owner, intent: GROUNDED|SEATED|HELD|ATTACHED|AIRBORNE|OFFSTAGE, frames, ...}]  the declared support is physically true per frame
//   collisions [{a, b, frames, same_depth: true|false, allowance_px}]  same-depth owners may not interpenetrate beyond the allowance; owners at
//              different declared depths are an OCCLUSION, never tested as a 2D collision (no naive overlap test on layered art)
import fs from "node:fs"; import path from "node:path";
import { stateAtFrame } from "../art_bridge/temporal.mjs";
import { apply, inv, mul, scaleOf } from "../art_bridge/math2d.mjs";
import { cropToCanonical, canonicalQuad, bboxOf } from "../art_bridge/asset_geometry.mjs";
import { decodePNG } from "../art_bridge/png.mjs";
import { err } from "../art_bridge/errors.mjs";
const alphaCache = new Map();
function alphaOf(film, a) { const k = `${film}|${a.id}`; if (!alphaCache.has(k)) { const png = decodePNG(fs.readFileSync(path.join(film, a.file)), a.file); alphaCache.set(k, png); } return alphaCache.get(k); }
/** alpha (0..255) of asset `a` drawn by pass matrix `Mp` at world point w */
function alphaAt(film, a, Mp, w) { const png = alphaOf(film, a), u = apply(inv(mul(Mp, cropToCanonical(a))), w), [sx, sy, sw, sh] = a.source_pixel_crop; if (u[0] < 0 || u[1] < 0 || u[0] >= sw || u[1] >= sh) return 0; const x = Math.floor(sx + u[0]), y = Math.floor(sy + u[1]); return png.rgba[(y * png.width + x) * 4 + 3]; }
const fail = (code, rec, fr, reason, inv_) => err(code, { record_id: rec, frame_range: [fr, fr + 1], reason, failed_invariant: inv_, producer: "engine/film/integrity_qa.mjs" });
export function verifySeams(C, film, seams, frames, st = (f) => stateAtFrame(C, f)) {
  const results = []; for (const sm of seams) { const bad = [], R_ = C.rigs.get(sm.rig), J = R_.joints.get(sm.joint), n0 = sm.samples ?? 24, minA = sm.min_alpha ?? 128, scale0 = new Map(); let n = 0, holes = 0;
    for (const f of frames) { const s = st(f), M = s.matrices[sm.rig]; if (!M) continue; n++; const piv = apply(M[sm.joint], J.rest_xy), parts = s.passes.filter((p) => p.rig === sm.rig && sm.parts.includes(p.slot) && p.visible);
      for (const p of parts) { const sc = scaleOf(p.matrix); if (!scale0.has(p.slot)) scale0.set(p.slot, sc); else if (Math.abs(sc - scale0.get(p.slot)) > 1e-6 * Math.max(1, sc)) bad.push(`frame ${f}: ${p.slot} scale changes ${scale0.get(p.slot).toFixed(4)} → ${sc.toFixed(4)} (a stretched limb)`); }
      const pts = [[0, piv], ...[...Array(n0)].map((_, i) => [i * 360 / n0, [piv[0] + sm.radius_px * Math.cos(i * 2 * Math.PI / n0), piv[1] + sm.radius_px * Math.sin(i * 2 * Math.PI / n0)]])];
      const open = pts.filter(([, w]) => !parts.some((p) => alphaAt(film, C.assets.get(p.asset_id), p.matrix, w) >= minA)); if (open.length) { holes++; bad.push(`frame ${f}: seam ${sm.id} exposes ${open.length} uncovered sample(s) around ${sm.joint} (first at ${open[0][0].toFixed(0)}°): an unpainted hole`); } }
    results.push({ kind: "SeamIntegrity", id: sm.id, owner: `${sm.rig}.${sm.joint}`, frames_checked: n, ok: !bad.length && n > 0, holes, reason: bad.slice(0, 4).join("; ") || (n ? null : "zero frames checked") }); }
  return { ok: results.every((r) => r.ok), results, failures: results.filter((r) => !r.ok).map((r) => fail("SILHOUETTE_INTEGRITY_FAILED", r.id, 0, r.reason, "SEAM_COVERED_EVERY_FRAME")) };
}
const ownerBox = (C, s, rid) => { const q = s.passes.filter((p) => p.rig === rid && p.visible).flatMap((p) => canonicalQuad(C.assets.get(p.asset_id)).map((c) => apply(p.matrix, c))); return q.length ? bboxOf(q) : null; };
export function verifySupportIntents(C, intents, st = (f) => stateAtFrame(C, f)) {
  const results = []; for (const it of intents) { const bad = []; let n = 0; const tol = it.tolerance_px ?? 1.5;
    for (let f = it.frames[0]; f < it.frames[1]; f++) { const s = st(f), M = s.matrices[it.owner]; if (!M) { bad.push(`frame ${f}: ${it.owner} not placed`); continue; } n++;
      if (it.intent === "GROUNDED") { const ys = it.sockets.map((sid) => C.socketWorld(it.owner, M, sid)[1]), low = Math.max(...ys); if (low > it.ground_y + tol) bad.push(`frame ${f}: ${it.owner} sinks ${(low - it.ground_y).toFixed(2)}px into the ground`); else if (low < it.ground_y - tol) bad.push(`frame ${f}: ${it.owner} floats ${(it.ground_y - low).toFixed(2)}px above the ground (declared GROUNDED)`); }
      else if (it.intent === "SEATED" || it.intent === "ATTACHED") { const a = C.socketWorld(it.owner, M, it.socket), b = it.target.world_xy ?? C.socketWorld(it.target.rig, s.matrices[it.target.rig], it.target.socket), d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (d > tol) bad.push(`frame ${f}: ${it.socket} is ${d.toFixed(2)}px from its ${it.intent === "SEATED" ? "seat" : "attachment"}`); }
      else if (it.intent === "HELD") { const r = (s.prop_support || []).find((x) => x.prop_rig === it.owner); if (!r || !r.ok) bad.push(`frame ${f}: ${it.owner} is declared HELD but has no valid driver (${r?.failures?.[0]?.human_readable_reason ?? "no support record"})`); }
      else if (it.intent === "AIRBORNE") { const ys = (it.sockets || []).map((sid) => C.socketWorld(it.owner, M, sid)[1]); if (ys.some((y) => Math.abs(y - it.ground_y) <= tol)) bad.push(`frame ${f}: declared AIRBORNE but touches the ground`); }
      else if (it.intent === "OFFSTAGE") { const b = ownerBox(C, s, it.owner), cam = s.camera, W = C.doc.stage.width, H = C.doc.stage.height, z = cam.zoom, sx = (x) => W / 2 + (x - cam.x) * z, sy = (y) => H / 2 + (y - cam.y) * z; if (b && sx(b[0] + b[2]) > 0 && sx(b[0]) < W && sy(b[1] + b[3]) > 0 && sy(b[1]) < H) bad.push(`frame ${f}: ${it.owner} is declared OFFSTAGE but projects into the frame`); }
      else bad.push(`unknown support intent ${it.intent}`); }
    results.push({ kind: "SupportIntent", id: `${it.owner}:${it.intent}`, owner: it.owner, frames_checked: n, ok: !bad.length && n > 0, reason: bad.slice(0, 4).join("; ") || (n ? null : "zero frames checked") }); }
  return { ok: results.every((r) => r.ok), results, failures: results.filter((r) => !r.ok).map((r) => fail("SUPPORT_INTENT_VIOLATED", r.id, 0, r.reason, "DECLARED_SUPPORT_TRUE")) };
}
export function verifyCollisions(C, pairs, st = (f) => stateAtFrame(C, f)) {
  const results = []; for (const pr of pairs) { const bad = []; let n = 0, worst = 0;
    if (pr.same_depth === false) { results.push({ kind: "Collision", id: `${pr.a}~${pr.b}`, ok: true, skipped: "OCCLUSION_NOT_COLLISION (declared different depths)", frames_checked: 0 }); continue; }
    for (let f = pr.frames[0]; f < pr.frames[1]; f++) { const s = st(f), A = ownerBox(C, s, pr.a), B = ownerBox(C, s, pr.b); if (!A || !B) continue; n++; const ox = Math.min(A[0] + A[2], B[0] + B[2]) - Math.max(A[0], B[0]), oy = Math.min(A[1] + A[3], B[1] + B[3]) - Math.max(A[1], B[1]), pen = ox > 0 && oy > 0 ? Math.min(ox, oy) : 0; worst = Math.max(worst, pen);
      if (pen > (pr.allowance_px ?? 0)) bad.push(`frame ${f}: ${pr.a} and ${pr.b} interpenetrate ${pen.toFixed(1)}px (allowance ${pr.allowance_px ?? 0}px)`); }
    results.push({ kind: "Collision", id: `${pr.a}~${pr.b}`, frames_checked: n, ok: !bad.length && n > 0, max_penetration_px: +worst.toFixed(2), reason: bad.slice(0, 4).join("; ") || (n ? null : "zero frames checked") }); }
  return { ok: results.every((r) => r.ok), results, failures: results.filter((r) => !r.ok).map((r) => fail("COLLISION_UNAPPROVED", r.id, 0, r.reason, "NO_UNAPPROVED_INTERPENETRATION")) };
}

/** P08 C04 — pupil containment on the REGISTERED eye mask (not its bounding box). Every opaque pixel (alpha ≥ min_alpha) of the visible drawing in
 *  the pupil slot is mapped crop→canonical→world through its own pass matrix, then into the eye mask through the eye drawing's pass matrix (the mask is
 *  registered in the same canonical space as the eye it outlines, and is never drawn). A pixel where the mask alpha is < min_alpha has escaped.
 *  Also reports what a bounding-box test would have said, so a containment failure a bbox test passes is visible as such. */
export function verifyPupilContainment(C, film, rid, frames, st = (f) => stateAtFrame(C, f), { min_alpha = 128, max_escaped_px = 0, stride = 1 } = {}) {
  const R_ = C.rigs.get(rid)?.rec, fc = R_?.face_composition, pu = fc?.pupil; if (!pu) return null;
  const mask = C.assets.get(pu.eye_mask_asset_id), eyeRegion = (fc.regions || []).find((r) => r.role === "EYES" && r.mask_asset_id === pu.eye_mask_asset_id), bad = []; let n = 0, worst = 0, bboxWouldPass = true;
  if (!mask || !eyeRegion) return { kind: "PupilContainment", owner: rid, ok: false, frames_checked: 0, reason: `face_composition.pupil names ${!mask ? `eye mask ${pu.eye_mask_asset_id}, which is not a registered asset` : `no EYES region carrying mask ${pu.eye_mask_asset_id}`}` };
  const pupilSlot = (p) => p.slot === pu.pupil_asset_id || p.asset_id === pu.pupil_asset_id;
  for (const f of frames) { const s = st(f); if (s.error) { bad.push(`frame ${f}: ${s.error.message}`); continue; }
    const pp = s.passes.find((p) => p.rig === rid && p.visible && pupilSlot(p)), ep = s.passes.find((p) => p.rig === rid && p.slot === eyeRegion.slot); if (!pp || !ep) continue; n++;
    const a = C.assets.get(pp.asset_id), png = alphaOf(film, a), [sx, sy, sw, sh] = a.source_pixel_crop, Mw = mul(pp.matrix, cropToCanonical(a)); let esc = 0, opaque = 0;
    const pw = []; for (let y = 0; y < sh; y += stride) for (let x = 0; x < sw; x += stride) { if (png.rgba[((sy + y) * png.width + sx + x) * 4 + 3] < min_alpha) continue; opaque++; const w = apply(Mw, [x + 0.5, y + 0.5]); pw.push(w); if (alphaAt(film, mask, ep.matrix, w) < min_alpha) esc++; }
    // what a bounding-box-only test would conclude: the bbox of the pupil's opaque pixels inside the bbox of the eye mask's opaque pixels (world space)
    const mpng = alphaOf(film, mask), [mx, my, mw, mh] = mask.source_pixel_crop, Mm = mul(ep.matrix, cropToCanonical(mask)), mw_ = []; for (let y = 0; y < mh; y++) for (let x = 0; x < mw; x++) if (mpng.rgba[((my + y) * mpng.width + mx + x) * 4 + 3] >= min_alpha) mw_.push(apply(Mm, [x + 0.5, y + 0.5]));
    const bq = pw.length ? bboxOf(pw) : null, bm = mw_.length ? bboxOf(mw_) : null, inBox = !!(bq && bm) && bq[0] >= bm[0] - 0.5 && bq[1] >= bm[1] - 0.5 && bq[0] + bq[2] <= bm[0] + bm[2] + 0.5 && bq[1] + bq[3] <= bm[1] + bm[3] + 0.5; if (!inBox) bboxWouldPass = false;
    worst = Math.max(worst, esc); if (!opaque) bad.push(`frame ${f}: pupil drawing ${a.id} has no opaque pixel`); else if (esc > max_escaped_px) bad.push(`frame ${f}: ${esc} of ${opaque} opaque pupil pixels of ${a.id} lie outside the registered eye mask ${mask.id}${inBox ? " (its bounding box is inside the eye's: a bbox test would pass)" : ""}`); }
  if (!n) bad.push("zero frames with a visible pupil checked");
  return { kind: "PupilContainment", owner: rid, frames_checked: n, ok: !bad.length, reason: bad.slice(0, 4).join("; ") || null, measurement: { max_escaped_px: worst, bbox_test_would_pass: bboxWouldPass, mask: mask.id } };
}
