// P0.1 evidence writer: runs the real round trip and every Chrome pixel probe, copies the rendered witnesses, and writes
// hybrid_v2/evidence/p01/P01_EVIDENCE.json. DIAGNOSTIC rasters only — mechanics, never artistic quality.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runRoundTrip } from "./roundtrip_fixture.mjs";
import { probeAssetPixels, probeWorldFootprint, probeTransitionDensity, probeElbowBend, inesUnderpaintContract } from "./p01_probes.mjs";
import { cropQuadReport } from "./p01_geometry_report.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p01", "evidence"), EV = path.join(REPO, "hybrid_v2", "evidence", "p01"), IMG = path.join(EV, "images");
fs.rmSync(IMG, { recursive: true, force: true }); fs.mkdirSync(IMG, { recursive: true });
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), rel = (f) => path.relative(REPO, f).split(path.sep).join("/"), keep = (f, n) => { const t = path.join(IMG, n); fs.copyFileSync(f, t); return { file: rel(t), sha256: sha(t) }; };
const rt = await runRoundTrip(path.join(W, "rt")), doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8"));
const pixels = await probeAssetPixels(rt, path.join(W, "pixels")), foot = await probeWorldFootprint(rt, path.join(W, "footprint")), trans = await probeTransitionDensity(path.join(W, "transition")), bend = await probeElbowBend(rt, path.join(W, "bend")), ines = await inesUnderpaintContract(path.join(W, "ines"));
const ev = { generated_by: "tests/art_bridge/p01_evidence.mjs", tested_revision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), generated_at: new Date().toISOString(),
  truth: "DIAGNOSTIC capsule/box rasters; proves geometry, ownership and qualification mechanics only. No style image was fabricated; nothing here is target art or artistic evidence.",
  b1_geometry_640x900: { width_px: 640, height_px: 900, expected_canonical_rect: [-20, -15, 320, 450], stored: doc.assets.find((a) => a.id === "pilot_master").canonical_rect, crop_to_canonical_matrix: doc.assets.find((a) => a.id === "pilot_master").crop_to_canonical_matrix, quad: cropQuadReport(doc.assets.find((a) => a.id === "pilot_master")) },
  b1_all_assets: doc.assets.map((a) => ({ id: a.id, kind: a.kind, pixels: [a.width_px, a.height_px], crop: a.source_pixel_crop, canonical_rect: a.canonical_rect, crop_to_canonical_matrix: a.crop_to_canonical_matrix, quad: cropQuadReport(a) })),
  b1_asset_pixel_probes: { image: keep(pixels.image, "b1_asset_pixel_probe.png"), assets: pixels.assets },
  b1_camera_footprint: { plate_rect: foot.plate_rect, flagged_spans: foot.flagged_spans, sentinel_pixels_wide_f3650: foot.sentinel_wide, sentinel_pixels_pushed_f3950: foot.sentinel_pushed, plate_colour_probe_max_err: foot.grid_probe_max_err, probes: foot.probes, frames: [keep(foot.frames[0], "b1_footprint_wide_f3650.png"), keep(foot.frames[1], "b1_footprint_pushed_f3950.png")] },
  b1_transition_density: { frame: trans.frame, mean_abs_diff_1x_vs_2x: trans.mean_abs_diff, sentinel_2x: trans.sentinel_2x, frames: [keep(trans.frames["1x"].file, "b1_transition_1x_f3480.png"), keep(trans.frames["2x"].file, "b1_transition_2x_density_f3480.png")] },
  b2_elbow_bend: { frame: bend.frame, elbow_angle_deg: bend.elbow_angle, holes_with_owned_underpaint: bend.holes_with_underpaint, holes_with_underpaint_hidden: bend.holes_without, underpaint_painted_below_forearm: bend.underpaint_below_forearm, frames: [keep(bend.frames[0], "b2_bend_f450_with_underpaint.png"), keep(bend.frames[1], "b2_bend_f450_underpaint_hidden.png")] },
  b2_ines_real_contract: ines,
  steps: rt.steps.map((s) => ({ step: s.step, result: typeof s.result === "string" ? s.result : s.result?.status ?? s.result?.verdict ?? s.result })) };
fs.writeFileSync(path.join(EV, "P01_EVIDENCE.json"), JSON.stringify(ev, null, 1));
console.log("640x900 rect", ev.b1_geometry_640x900.stored, "| pixels", pixels.assets.map((a) => `${a.id}:${a.inside_matches}/${a.inside_samples}/out${a.outside_painted}`).join(" "), "| footprint", JSON.stringify(foot.flagged_spans), foot.sentinel_wide, foot.sentinel_pushed, "| transition", trans.mean_abs_diff.toFixed(3), "| bend", bend.holes_with_underpaint, bend.holes_without);
