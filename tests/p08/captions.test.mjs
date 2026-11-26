// CAPTION_OVERLAY — compiled from the APPROVED E01 P3.2 subtitle files (docs copy, hash-checked), bound to the 60 fps frame clock, burned in by the
// real Chrome renderer through the scene graph, checked for readable dwell / safe-lane layout / forbidden intervals / collisions with required
// content, phase ↔ extract equivalence, and written back as frame-exact SRT + VTT sidecars. Negatives use the HISTORICAL P3.1 files (the 0.48 s
// "Thanks" the user reported) and mutations.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CAP = await import("../../engine/film/captions.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const P32 = path.resolve("docs/the-better-one/episodes/E01/P3_2_MEASURED/original"), W = isolatedWork("p08_captions"), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
for (const f of ["PHASE1_DIALOGUE.srt", "PHASE1_DIALOGUE.vtt", "EXTRACT_DIALOGUE.srt", "EXTRACT_DIALOGUE.vtt"]) fs.copyFileSync(path.join(P32, f), path.join(W, f));
for (const f of ["PHASE1_DIALOGUE.srt", "PHASE1_DIALOGUE.vtt"]) fs.copyFileSync(path.join(P32, "history", "P3_1", f), path.join(W, `P31_${f}`));
const spec = (o = {}) => ({ srt: "PHASE1_DIALOGUE.srt", vtt: "PHASE1_DIALOGUE.vtt", srt_sha256: sha(path.join(W, "PHASE1_DIALOGUE.srt")), vtt_sha256: sha(path.join(W, "PHASE1_DIALOGUE.vtt")), ...o });
const codes = (r) => r.errors.map((e) => e.code);
test("CAPTION_OVERLAY compile: the approved P3.2 dialogue binds to frames; 'Thanks' is the corrected 72 f; extract ≡ phase shifted by 180; P3.1's 0.48 s is refused; mismatches, overflow and forbidden overlaps are named", () => {
  const ph = CAP.compileCaptions(spec(), { film: W, fps: 60, total: 960 });
  // FINDING on the approved P3.2 files (reported, not hidden): "Too much?" [135,173) is on screen 0.633 s, below the 1.0 s default minimum dwell.
  // P3.2 corrected only "Thanks". Its reading rate is fine (9 chars); the dwell minimum is a policy the creative owner confirms or the cue is re-timed.
  assert.deepEqual(ph.errors.map((e) => [e.code, e.record_id]), [["CAPTION_DWELL_SHORT", "cap002"]], ph.errors.map((e) => e.human_readable_reason).join("; ")); assert.match(ph.errors[0].human_readable_reason, /Too much?/);
  assert.deepEqual(CAP.compileCaptions(spec({ policy: { min_dwell_s: 0.6 } }), { film: W, fps: 60, total: 960 }).errors, [], "with a 0.6 s minimum (a creative choice, not taken here) every approved cue is readable");
  const thanks = ph.cues.find((c) => /^Thanks/i.test(c.text_lines.join(" "))); assert.ok(thanks, ph.cues.map((c) => c.text_lines.join(" ")).join(" | ")); assert.deepEqual(thanks.frames, [326, 398], "5.433→6.633 s on the 60 fps clock = 72 frames (P3.2 issue 7)");
  const ex = CAP.compileCaptions({ srt: "EXTRACT_DIALOGUE.srt", vtt: "EXTRACT_DIALOGUE.vtt" }, { film: W, fps: 60, total: 780 }); assert.deepEqual(ex.errors, []); const eq = CAP.extractEquivalence(ph.cues, ex.cues, { offset_frames: 180, length_frames: 780 }); assert.ok(eq.ok, JSON.stringify(eq.errors.map((e) => e.human_readable_reason))); assert.ok(eq.compared >= 1);
  const old = CAP.compileCaptions({ srt: "P31_PHASE1_DIALOGUE.srt", vtt: "P31_PHASE1_DIALOGUE.vtt" }, { film: W, fps: 60, total: 960 }), dw = old.errors.find((e) => e.code === "CAPTION_DWELL_SHORT" && /Thanks/i.test(e.human_readable_reason)); assert.ok(dw, "the P3.1 'Thanks' is too short to read"); assert.match(dw.human_readable_reason, /Thanks/i);
  fs.writeFileSync(path.join(W, "BAD.vtt"), fs.readFileSync(path.join(W, "PHASE1_DIALOGUE.vtt"), "utf8").replace(/Thanks/, "Thank you")); assert.ok(codes(CAP.compileCaptions({ srt: "PHASE1_DIALOGUE.srt", vtt: "BAD.vtt" }, { film: W })).includes("CAPTION_SIDECAR_MISMATCH"));
  assert.ok(codes(CAP.compileCaptions(spec({ srt_sha256: "0".repeat(64) }), { film: W })).includes("CAPTION_SOURCE_MISSING"), "a changed approved file is refused by hash");
  assert.ok(codes(CAP.compileCaptions(spec({ policy: { font_px: 140 } }), { film: W })).includes("CAPTION_LAYOUT_OVERFLOW"));
  const fb = CAP.compileCaptions(spec({ forbid: [{ frames: [444, 588], reason: "no caption over the report insert (SH02)" }] }), { film: W }); assert.ok(!codes(fb).includes("CAPTION_FORBIDDEN_INTERVAL"), "no approved dialogue cue overlaps the SH02 report insert");
  assert.ok(codes(CAP.compileCaptions(spec({ forbid: [{ frames: [340, 360], reason: "diagnostic: caption-free" }] }), { film: W })).includes("CAPTION_FORBIDDEN_INTERVAL"));
  const sc = CAP.writeSidecars(ph, path.join(W, "out"), "E01_PHASE1"), back = CAP.parseSRT(fs.readFileSync(sc.srt, "utf8")), backV = CAP.parseVTT(fs.readFileSync(sc.vtt, "utf8"));
  assert.equal(back.length, ph.cues.length); back.forEach((c, i) => { assert.equal(Math.round(c.start_s * 60), ph.cues[i].frames[0]); assert.equal(Math.round(c.end_s * 60), ph.cues[i].frames[1]); assert.equal(backV[i].lines.join(" "), ph.cues[i].text_lines.join(" ")); });
  assert.equal(sc.receipt.approved_sources.srt.sha256, sha(path.join(W, "PHASE1_DIALOGUE.srt")));
});
test("CAPTION_OVERLAY compositor + collisions: the real Chrome frames show the caption exactly on its frames; a lane over a protected actor is refused", { timeout: 1800000 }, async () => {
  const CF = await import("./character_fixture.mjs"), { createChromeFrameSession } = await import("../../engine/film/chrome_frames.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs");
  const { rt } = await CF.film(), FILM = path.join(W, "film"); fs.cpSync(rt.film, FILM, { recursive: true, filter: (s) => !/[\\/](render|production|qa)([\\/]|$)/.test(s) });
  fs.writeFileSync(path.join(FILM, "cap.srt"), "1\n00:00:00,500 --> 00:00:01,600\nDiagnostic caption.\n"); fs.writeFileSync(path.join(FILM, "cap.vtt"), "WEBVTT\n\n00:00:00.500 --> 00:00:01.600\nDiagnostic caption.\n");
  const plan = { ...CF.basePlan(), captions: { srt: "cap.srt", vtt: "cap.vtt", protect: ["kade_rig"] } }, pf = path.join(FILM, "handoff", "MOTION_PLAN_CAP.json"); fs.writeFileSync(pf, JSON.stringify(plan));
  const cc = CAP.compileCaptions(plan.captions, { film: FILM, fps: 60, total: 600 }); assert.deepEqual(cc.cues[0].frames, [30, 96]); const [bx, by, bw, bh] = cc.cues[0].box.map(Math.round);
  const s = await createChromeFrameSession({ film: FILM, planFile: pf, runType: "DIAGNOSTIC", workDir: path.join(W, "chrome"), attribution: false }), box = {};
  try { for (const f of [29, 30, 60, 95, 96]) { const { rgb } = await s.renderFrame(f); let dark = 0, white = 0, n = 0; for (let y = by + 2; y < by + bh - 2; y += 2) for (let x = bx + 2; x < bx + bw - 2; x += 2) { const i = (y * 1920 + x) * 3, l = (rgb[i] + rgb[i + 1] + rgb[i + 2]) / 3; n++; if (l < 60) dark++; if (rgb[i] > 235 && rgb[i + 1] > 235 && rgb[i + 2] > 235) white++; } box[f] = { dark: dark / n, white: white / n }; } } finally { await s.close(); }
  for (const f of [30, 60, 95]) assert.ok(box[f].white > 0.03 && box[f].dark + box[f].white > 0.5, `caption burned in at ${f}: ${JSON.stringify(box[f])}`); for (const f of [29, 96]) assert.ok(box[f].white < 0.01, `no caption at ${f}: ${JSON.stringify(box[f])}`);
  const reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc, C = compileMotionTracks(doc.actions, doc.shots, { doc, plan: CF.basePlan(), requireApproval: false });
  const over = CAP.compileCaptions({ ...plan.captions, policy: { lane: [360, 420, 400, 150] } }, { film: FILM, fps: 60, total: 600 }), col = CAP.verifyCaptionCollisions({ film: FILM, compiled: C, doc, plan, cues: over.cues, protect: ["kade_rig"] });
  assert.equal(col.ok, false); assert.equal(col.failures[0].code, "CAPTION_COLLISION");
  const top = CAP.compileCaptions({ ...plan.captions, policy: { lane: [192, 20, 1536, 120] } }, { film: FILM, fps: 60, total: 600 }); assert.ok(CAP.verifyCaptionCollisions({ film: FILM, compiled: C, doc, plan, cues: top.cues, protect: ["kade_rig", "pim_rig"] }).ok, "a clear lane passes");
});
