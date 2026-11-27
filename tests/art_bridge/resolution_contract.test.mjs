// Resolution contract: one generation is asked only for a size the route supports; an authored target it cannot carry is either delegated to real
// component jobs (masters) or refused; directed component minimums are cited, verified and never assumed met by a whole-master edit.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto";
import { resolutionContract, canvasSection, providerCanvases } from "../../engine/art_bridge/resolution_contract.mjs";
const ENV = {}; // the default gpt-image canvases
const job = (id, derived_from = null) => ({ artjob_id: `ARTJOB_${id}`, root_dependency: id, derived_from });
const fig = (w, h, f) => ({ output: { authored_width_px: w, authored_height_px: h, figure_height_px: f } }), box = (w, h) => ({ output: { authored_width_px: w, authored_height_px: h } });
const code = (fn) => { try { fn(); return null; } catch (e) { return e.code; } };
const film = (reqs) => { const F = fs.mkdtempSync(path.join(os.tmpdir(), "rc-")), src = "SRC.md", txt = "Mia head >= 540 at max\n"; fs.writeFileSync(path.join(F, src), txt);
  const s = crypto.createHash("sha256").update(txt).digest("hex"); fs.mkdirSync(path.join(F, "resolution")); fs.writeFileSync(path.join(F, "resolution", "NATIVE_RESOLUTION_REQUIREMENTS.json"), JSON.stringify({ requirements: reqs.map((r) => ({ ...r, source: { file: src, sha256: s } })) })); return F; };

test("RC-1 a figure is portrait-led: Mia's 1600 px figure gets 1024x1536 at fit 0.92 and is delegated to her components; with none it is refused", () => {
  assert.deepEqual(providerCanvases(ENV), ["1024x1024", "1536x1024", "1024x1536"]);
  const jobs = [job("M"), job("M.head", "M")], c = resolutionContract({ job: job("M"), design: fig(2048, 2048, 1600), jobs, env: ENV });
  assert.equal(c.requested_canvas, "1024x1536"); assert.equal(c.fit_scale, 0.9216); assert.equal(c.route, "IDENTITY_MASTER_THEN_SOURCE_ATTACHED_COMPONENTS"); assert.deepEqual(c.delegated_to_components, ["M.head"]);
  assert.equal(code(() => resolutionContract({ job: job("M"), design: fig(2048, 2048, 1600), jobs: [job("M")], env: ENV })), "IMPOSSIBLE_RESOLUTION_REQUEST");
});
test("RC-2 a target that fits is native in one image and keeps the design's own canvas shape (BG 600 px in a 1024 square; REGULAR 1400 px portrait)", () => {
  const bg = resolutionContract({ job: job("B"), design: fig(1024, 1024, 600), env: ENV }); assert.equal(bg.requested_canvas, "1024x1024"); assert.equal(bg.route, "NATIVE_IN_ONE_IMAGE");
  const rg = resolutionContract({ job: job("R"), design: fig(2048, 2048, 1400), env: ENV }); assert.equal(rg.requested_canvas, "1024x1536"); assert.equal(rg.fit_scale, 1);
  const pr = resolutionContract({ job: job("P"), design: box(1024, 1024), env: ENV }); assert.equal(pr.requested_canvas, "1024x1024"); assert.equal(pr.route, "NATIVE_IN_ONE_IMAGE");
});
test("RC-3 every family: a world/plate or prop larger than any canvas is delegated only to existing components, never requested at an unsupported size", () => {
  const w = resolutionContract({ job: job("W"), design: box(4608, 2592), jobs: [job("W"), job("W.far", "W")], env: ENV }); assert.equal(w.requested_canvas, "1536x1024"); assert.equal(w.fit_scale, 0.3333);
  assert.equal(code(() => resolutionContract({ job: job("W"), design: box(4608, 2592), env: ENV })), "IMPOSSIBLE_RESOLUTION_REQUEST");
  const p = resolutionContract({ job: job("P2"), design: box(3072, 3840), jobs: [job("P2"), job("P2.body", "P2")], env: ENV }); assert.equal(p.requested_canvas, "1024x1536");
  for (const c of [w, p]) assert.ok(providerCanvases(ENV).includes(c.requested_canvas));
  const none = resolutionContract({ job: job("X"), design: { output: {}, canvas: { aspect: "16:9" } }, env: ENV }); assert.equal(none.route, "NO_AUTHORED_TARGET_DECLARED"); assert.equal(none.requested_canvas, "1536x1024");
});
test("RC-4 directed component minimums: cited and hash-verified; a whole-master edit never satisfies one; a missing component job is refused", () => {
  const F = film([{ identity_asset: "M", component: "M.head", measure: "head_height_px", min_native_px: 540, basis: "2x SH03 270" }]), jobs = [job("M"), job("M.head", "M"), job("M.torso", "M")], d = fig(2048, 2048, 1600);
  const m = resolutionContract({ job: job("M"), design: d, film: F, jobs, env: ENV }); assert.equal(m.component_requirements[0].min_native_px, 540); assert.match(canvasSection(m), /M\.head: head_height_px >= 540 px native/);
  assert.equal(code(() => resolutionContract({ job: job("M.head", "M"), design: d, film: F, jobs, env: ENV })), "COMPONENT_NATIVE_RESOLUTION_UNVERIFIED");
  assert.equal(resolutionContract({ job: job("M.torso", "M"), design: d, film: F, jobs, env: ENV }).route, "MASTER_DENSITY_EDIT_EXPOSURE_CHECKED_AT_MOTION_PLAN");
  assert.equal(code(() => resolutionContract({ job: job("M"), design: d, film: F, jobs: [job("M"), job("M.torso", "M")], env: ENV })), "IMPOSSIBLE_RESOLUTION_REQUEST");
  fs.writeFileSync(path.join(F, "SRC.md"), "edited\n"); assert.equal(code(() => resolutionContract({ job: job("M"), design: d, film: F, jobs, env: ENV })), "STALE_DEPENDENCY");
});
test("RC-5 the request states one size: exact canvas, figure fill and margin; a pinned single provider size is honoured or refused, never exceeded", () => {
  const c = resolutionContract({ job: job("M"), design: fig(2048, 2048, 1600), jobs: [job("M"), job("M.h", "M")], env: ENV }), t = canvasSection(c);
  assert.match(t, /Deliver exactly 1024x1536 px/); assert.match(t, /about 1474 px tall/); assert.match(t, /never upscaled/);
  const pinned = resolutionContract({ job: job("B"), design: fig(1024, 1024, 600), env: { IMAGE_PROVIDER_SIZE: "1536x1024" } }); assert.equal(pinned.requested_canvas, "1536x1024"); assert.equal(pinned.fit_scale, 1);
  assert.notEqual(c.key, resolutionContract({ job: job("M"), design: fig(2048, 2048, 1500), jobs: [job("M"), job("M.h", "M")], env: ENV }).key, "the contract key changes with the target");
});
