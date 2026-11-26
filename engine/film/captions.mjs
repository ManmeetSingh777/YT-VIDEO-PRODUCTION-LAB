// CAPTION_OVERLAY (user-required 2026-11-26; P3.2 issue 7) — captions composited from the APPROVED subtitle files on the film's frame clock.
//   parseSRT / parseVTT            cue lists from the approved sidecars (no re-timing; hashes checked by the caller's source record)
//   compileCaptions(spec, {film})  binds every cue to half-open frames [ceil(start·fps), ceil(end·fps)), checks SRT ≡ VTT, readable dwell
//                                  (min seconds and max characters/second), safe-lane layout (font, wrap, max lines) and forbidden intervals
//                                  (e.g. "no caption over the report insert"); returns positioned cues for the compositor (scene_graph) + errors
//   extractEquivalence(phase, extract, offset)  the extract's cues are exactly the phase cues shifted by the extract offset (and clipped)
//   verifyCaptionCollisions(...)   on every caption frame the caption box covers no visible pixel of protected content (attended targets, held
//                                  hands/props) beyond the allowance — measured on registered alpha through the camera, like the attention gate
//   writeSidecars(cues, dir, base) frame-exact SRT + VTT of exactly what is burned in, with a receipt naming the approved sources
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
import { mul, apply, inv } from "../art_bridge/math2d.mjs";
import { cameraMatrix } from "../art_bridge/scene_graph.mjs";
import { stateAtFrame } from "../art_bridge/temporal.mjs";
import { canonicalToCrop } from "../art_bridge/asset_geometry.mjs";
import { readPNG } from "../art_bridge/png.mjs";
export const CAPTIONS_VERSION = "1.0.0";
export const DEFAULT_POLICY = Object.freeze({ min_dwell_s: 1.0, max_cps: 17, font_px: 44, line_height: 1.25, max_lines: 2, char_w: 0.56, lane: [192, 858, 1536, 150], pad_px: 12, collision_allowance_px: 0, samples: 48 });
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const ts = (s) => { const m = String(s).trim().match(/^(?:(\d+):)?(\d{1,2}):(\d{2})[.,](\d{3})$/); if (!m) throw new Error(`bad timestamp ${s}`); return (+(m[1] || 0)) * 3600 + +m[2] * 60 + +m[3] + +m[4] / 1000; };
function blocks(text) { return text.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.split("\n").filter((l) => l.length)).filter((b) => b.length); }
export function parseSRT(text) { return blocks(text).map((b) => { const i = b.findIndex((l) => l.includes("-->")); const [a, z] = b[i].split("-->"); return { start_s: ts(a), end_s: ts(z.trim().split(/\s+/)[0]), lines: b.slice(i + 1) }; }); }
export function parseVTT(text) { return blocks(text.replace(/^﻿?WEBVTT[^\n]*\n/, "")).filter((b) => b.some((l) => l.includes("-->"))).map((b) => { const i = b.findIndex((l) => l.includes("-->")); const [a, z] = b[i].split("-->"); return { start_s: ts(a), end_s: ts(z.trim().split(/\s+/)[0]), lines: b.slice(i + 1).map((l) => l.replace(/<[^>]+>/g, "")) }; }); }
const fmtT = (s, sep) => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor((ms % 3600000) / 60000), x = Math.floor((ms % 60000) / 1000), r = ms % 1000; return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}${sep}${String(r).padStart(3, "0")}`; };
/** wrap text into lines that fit `maxChars` (word boundaries; an over-long word stays whole and is reported) */
function wrap(lines, maxChars) { const out = []; for (const l of lines) { let cur = ""; for (const w of l.split(/\s+/)) { if (!cur) cur = w; else if ((cur + " " + w).length <= maxChars) cur += " " + w; else { out.push(cur); cur = w; } } if (cur) out.push(cur); } return out; }
/**
 * compileCaptions(spec, {film, fps, total}) — spec = plan.captions: { srt, vtt, srt_sha256?, vtt_sha256?, offset_s?, policy?, forbid?: [{frames, reason}], protect?: [rig|socket|identity] }
 * → { cues: [{id, frames:[a,b), start_s, end_s, text_lines, box:[x,y,w,h], font_px, line_height}], errors, sources }
 */
export function compileCaptions(spec, { film, fps = 60, total = null }) {
  const P = { ...DEFAULT_POLICY, ...(spec.policy || {}) }, errors = [], F = path.resolve(film), E = (code, rec, reason, o = {}) => errors.push(err(code, { record_id: rec, reason, failed_invariant: o.inv ?? code, frame_range: o.frames, producer: "engine/film/captions.mjs" }));
  const read = (k) => { const f = spec[k] && path.join(F, spec[k]); if (!f || !fs.existsSync(f)) { E("CAPTION_SOURCE_MISSING", k, `approved ${k.toUpperCase()} ${spec[k] ?? "(none)"} is not in the film`); return null; } const b = fs.readFileSync(f); if (spec[`${k}_sha256`] && sha(b) !== spec[`${k}_sha256`]) E("CAPTION_SOURCE_MISSING", k, `${spec[k]} bytes differ from the approved sha256`, { inv: "CAPTION_SOURCE_HASH" }); return { file: spec[k], sha256: sha(b), text: b.toString("utf8") }; };
  const S = read("srt"), V = read("vtt"); if (!S || !V) return { cues: [], errors, sources: { srt: S && { file: S.file, sha256: S.sha256 }, vtt: V && { file: V.file, sha256: V.sha256 } } };
  const a = parseSRT(S.text), b = parseVTT(V.text), off = spec.offset_s ?? 0;
  if (a.length !== b.length) E("CAPTION_SIDECAR_MISMATCH", "srt/vtt", `SRT has ${a.length} cues, VTT has ${b.length}`);
  else a.forEach((c, i) => { const d = b[i]; if (Math.abs(c.start_s - d.start_s) > 0.0015 || Math.abs(c.end_s - d.end_s) > 0.0015 || c.lines.join("\n") !== d.lines.join("\n")) E("CAPTION_SIDECAR_MISMATCH", `cue ${i + 1}`, `SRT and VTT disagree on cue ${i + 1} (${c.start_s}–${c.end_s} "${c.lines.join(" ")}" vs ${d.start_s}–${d.end_s} "${d.lines.join(" ")}")`); });
  const maxChars = Math.max(1, Math.floor((P.lane[2] - 2 * P.pad_px) / (P.font_px * P.char_w))), cues = [];
  a.forEach((c, i) => { const s = c.start_s - off, e = c.end_s - off, fr = [Math.ceil(s * fps - 1e-9), Math.ceil(e * fps - 1e-9)], id = `cap${String(i + 1).padStart(3, "0")}`, text = c.lines.join(" ").replace(/\s+/g, " ").trim();
    if (!(fr[1] > fr[0])) { E("CAPTION_DWELL_SHORT", id, `cue "${text}" maps to no frame`, { frames: fr }); return; }
    const dwell = (fr[1] - fr[0]) / fps, need = Math.max(P.min_dwell_s, text.replace(/\s/g, "").length / P.max_cps); if (dwell + 1e-9 < need) E("CAPTION_DWELL_SHORT", id, `"${text}" is on screen ${dwell.toFixed(3)} s; it needs ${need.toFixed(3)} s to be read (min ${P.min_dwell_s} s, ≤ ${P.max_cps} chars/s)`, { frames: fr });
    const lines = wrap(c.lines, maxChars); if (lines.length > P.max_lines || lines.some((l) => l.length > maxChars)) E("CAPTION_LAYOUT_OVERFLOW", id, `"${text}" needs ${lines.length} line(s) of ≤ ${maxChars} characters in the safe lane (max ${P.max_lines})`, { frames: fr });
    for (const z of spec.forbid || []) if (fr[0] < z.frames[1] && z.frames[0] < fr[1]) E("CAPTION_FORBIDDEN_INTERVAL", id, `"${text}" [${fr}) overlaps the caption-free interval [${z.frames}) (${z.reason})`, { frames: [Math.max(fr[0], z.frames[0]), Math.min(fr[1], z.frames[1])] });
    if (total !== null && (fr[0] < 0 || fr[1] > total)) E("CAPTION_FORBIDDEN_INTERVAL", id, `"${text}" [${fr}) leaves the film clock [0,${total})`, { frames: fr, inv: "CAPTION_INSIDE_CLOCK" });
    const lh = P.font_px * P.line_height, wpx = Math.min(P.lane[2], Math.max(...lines.map((l) => l.length)) * P.font_px * P.char_w + 2 * P.pad_px), hpx = lines.length * lh + 2 * P.pad_px, x = P.lane[0] + (P.lane[2] - wpx) / 2, y = P.lane[1] + P.lane[3] - hpx;
    cues.push({ id, frames: fr, start_s: s, end_s: e, text_lines: lines, box: [+x.toFixed(2), +y.toFixed(2), +wpx.toFixed(2), +hpx.toFixed(2)], font_px: P.font_px, line_height: P.line_height, pad_px: P.pad_px }); });
  return { version: CAPTIONS_VERSION, cues, errors, policy: P, sources: { srt: { file: S.file, sha256: S.sha256 }, vtt: { file: V.file, sha256: V.sha256 } } };
}
/** the extract's captions are exactly the phase captions shifted by offset_frames and clipped to [0, extractLength) */
export function extractEquivalence(phaseCues, extractCues, { offset_frames, length_frames }) {
  const want = phaseCues.map((c) => ({ text: c.text_lines.join(" "), frames: [Math.max(0, c.frames[0] - offset_frames), Math.min(length_frames, c.frames[1] - offset_frames)] })).filter((c) => c.frames[1] > c.frames[0]), got = extractCues.map((c) => ({ text: c.text_lines.join(" "), frames: c.frames })), errors = [];
  if (want.length !== got.length) errors.push(err("CAPTION_EXTRACT_MISMATCH", { record_id: "extract", reason: `extract has ${got.length} cues, the phase gives ${want.length} inside the extract` }));
  else want.forEach((w, i) => { const g = got[i]; if (w.text !== g.text || w.frames[0] !== g.frames[0] || w.frames[1] !== g.frames[1]) errors.push(err("CAPTION_EXTRACT_MISMATCH", { record_id: `cue ${i + 1}`, frame_range: g.frames, reason: `extract cue "${g.text}" [${g.frames}) ≠ phase cue "${w.text}" shifted by ${offset_frames} → [${w.frames})` })); });
  return { ok: errors.length === 0, errors, compared: want.length };
}
/** every caption frame: the caption box covers no visible pixel of protected content (rig | identity | socket ids) beyond the allowance */
export function verifyCaptionCollisions({ film, compiled: C, doc, plan = {}, cues, protect = [], policy = {} }) {
  const P = { ...DEFAULT_POLICY, ...(plan.captions?.policy || {}), ...policy }, assets = new Map(doc.assets.map((a) => [a.id, a])), png = new Map(), failures = [], results = [];
  const alpha = (a, M, w) => { const u = canonicalToCrop(a, apply(inv(M), w)), [sx, sy, sw, sh] = a.source_pixel_crop; if (u[0] < 0 || u[1] < 0 || u[0] >= sw || u[1] >= sh) return 0; if (!png.has(a.id)) png.set(a.id, readPNG(path.join(path.resolve(film), a.file))); const p = png.get(a.id), x = Math.floor(sx + u[0]), y = Math.floor(sy + u[1]); return x < 0 || y < 0 || x >= p.width || y >= p.height ? 0 : p.rgba[(y * p.width + x) * 4 + 3]; };
  const rigs = new Set(doc.rigs.filter((r) => protect.some((t) => t === r.id || t === r.identity_id || (r.sockets || []).some((s) => s.id === t))).map((r) => r.id));
  for (const c of cues) { let worst = 0, worstF = null, n = 0; const [bx, by, bw, bh] = c.box;
    for (let f = c.frames[0]; f < c.frames[1]; f++) { if (!C.shotAt(f)) continue; const st = stateAtFrame(C, f); n++; const tp = st.passes.filter((p) => p.visible && rigs.has(p.rig) && assets.get(p.asset_id) && assets.get(p.asset_id).kind !== "VECTOR_PATH").map((p) => ({ a: assets.get(p.asset_id), M: mul(cameraMatrix(st.camera, assets.get(p.asset_id).depth_band || "FOCAL", plan.parallax, doc.stage), p.matrix) }));
      let hit = 0; for (let i = 0; i < P.samples; i++) for (let j = 0; j < P.samples; j++) { const w = [bx + ((i + 0.5) / P.samples) * bw, by + ((j + 0.5) / P.samples) * bh]; if (tp.some((t) => alpha(t.a, t.M, w) >= 128)) hit++; }
      const px = (hit / (P.samples * P.samples)) * bw * bh; if (px > worst) { worst = px; worstF = f; } }
    results.push({ cue: c.id, frames_checked: n, worst_overlap_px: +worst.toFixed(1), worst_frame: worstF });
    if (worst > P.collision_allowance_px) failures.push(err("CAPTION_COLLISION", { record_id: c.id, frame_range: [worstF, worstF + 1], failed_invariant: "CAPTION_CLEAR_OF_REQUIRED_CONTENT", reason: `caption "${c.text_lines.join(" ")}" covers ≈${worst.toFixed(0)} px of protected content (${[...rigs].join(", ")}) at frame ${worstF} (allowance ${P.collision_allowance_px} px): move the lane or the staging` })); }
  return { ok: failures.length === 0, failures, results };
}
/** frame-exact SRT + VTT sidecars of exactly the burned cues (timestamps = frame boundaries), with a receipt naming the approved sources */
export function writeSidecars(compiled, dir, base, { fps = 60 } = {}) {
  fs.mkdirSync(dir, { recursive: true }); const t = (f, sep) => fmtT(f / fps, sep), srt = compiled.cues.map((c, i) => `${i + 1}\n${t(c.frames[0], ",")} --> ${t(c.frames[1], ",")}\n${c.text_lines.join("\n")}\n`).join("\n"), vtt = "WEBVTT\n\n" + compiled.cues.map((c) => `${t(c.frames[0], ".")} --> ${t(c.frames[1], ".")}\n${c.text_lines.join("\n")}\n`).join("\n");
  const fs_ = { srt: path.join(dir, `${base}.srt`), vtt: path.join(dir, `${base}.vtt`) }; fs.writeFileSync(fs_.srt, srt); fs.writeFileSync(fs_.vtt, vtt);
  const receipt = { kind: "CAPTION_SIDECARS", version: CAPTIONS_VERSION, fps, approved_sources: compiled.sources, cues: compiled.cues.map((c) => ({ id: c.id, frames: c.frames, text: c.text_lines.join(" ") })), srt_sha256: sha(fs.readFileSync(fs_.srt)), vtt_sha256: sha(fs.readFileSync(fs_.vtt)) };
  fs.writeFileSync(path.join(dir, `${base}.CAPTIONS_RECEIPT.json`), JSON.stringify(receipt, null, 1)); return { ...fs_, receipt };
}
