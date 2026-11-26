// P08 E02 — selective owner-group grading in the real compositor: linear-light Rec.709 luminance (0.2126/0.7152/0.0722) then sRGB encode, on the
// graded owner's OWN passes only; protected owners keep colour; never a global grayscale. Measured on real Chrome pixels. DIAGNOSTIC fixture.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs"), { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs");
const { composeShot } = await import("../../engine/art_bridge/scene_graph.mjs"), { buildComposition, capture, launch } = await import("../../engine/art_bridge/render.mjs"), { readPNG } = await import("../art_bridge/stage2_lib.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), FILM = rt.film, reg = await createAssetRegistry(FILM, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = reg.doc;
const GRADE = (o = {}) => ({ id: "memory_grade", owner_group: { rigs: ["kade_rig"] }, protected_rigs: ["pim_rig"], frames: [100, 200], weight: [[100, 0], [140, 1, "linear"]], ...o });
const compile = (grades) => compileMotionTracks(doc.actions, doc.shots, { doc, plan: { ...CF.basePlan(), grades }, requireApproval: false });
const lin = (c) => { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }, enc = (v) => Math.round(255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055));
const gray = (rgb, w) => { const L = rgb.map(lin), Y = 0.2126 * L[0] + 0.7152 * L[1] + 0.0722 * L[2]; return L.map((c) => enc(w * Y + (1 - w) * c)); };
test("E02-1 compile refusals: unnamed group (global grayscale), protected owner inside the group, weight outside [0,1]", () => {
  const codes = (g) => { try { compile([g]); return []; } catch (e) { return (e.errors || [e]).map((x) => x.failed_invariant); } };
  assert.ok(codes(GRADE({ owner_group: {} })).includes("GRADE_GROUP_NAMED")); assert.ok(codes(GRADE({ protected_rigs: ["kade_rig"] })).includes("PROTECTED_OUTSIDE_GROUP")); assert.ok(codes(GRADE({ weight: [[100, 0], [140, 1.4]] })).includes("GRADE_WEIGHT_RANGE"));
});
test("E02-2 real Chrome pixels: the graded owner becomes linear-light luminance at full weight, partial on the ramp; the protected owner keeps colour; removing the grade restores colour", async () => {
  const browser = await launch(), out = isolatedWork("p08_grade_render");
  try { const shoot = async (Cx, frames, name) => { const scene = composeShot(doc.shots[0], reg, Cx, { prefix: `${name}-` }), comp = buildComposition(path.join(out, name, "comp"), { id: name, scene, frameRange: [Math.min(...frames), Math.max(...frames) + 1], registry: reg }); const cap = await capture(comp, FILM, frames, path.join(out, name, "frames"), { id: name, browser }); return Object.fromEntries(frames.map((f, i) => [f, readPNG(cap.files[i])])); };
    const count = (png, c, tol = 3) => { let n = 0; for (let i = 0; i < png.rgba.length; i += 4) if (png.rgba[i + 3] > 200 && Math.abs(png.rgba[i] - c[0]) <= tol && Math.abs(png.rgba[i + 1] - c[1]) <= tol && Math.abs(png.rgba[i + 2] - c[2]) <= tol) n++; return n; };
    const A = await shoot(compile([GRADE()]), [90, 120, 160], "grade"), torso = CF.COL["kade:torso"], pimT = CF.COL["pim:torso"], g1 = gray(torso, 1), g05 = gray(torso, 0.5), ev = {};
    ev.before_color = count(A[90], torso); ev.full_gray = count(A[160], g1); ev.full_color_left = count(A[160], torso); ev.half = count(A[120], g05); ev.pim_color_at_full = count(A[160], pimT);
    assert.ok(ev.before_color > 1000, `kade torso in colour before the grade (${ev.before_color})`); assert.ok(ev.full_gray > 0.9 * ev.before_color && ev.full_color_left < 10, `full weight = Rec.709 linear-light luminance ${g1} (${JSON.stringify(ev)})`);
    assert.ok(ev.half > 0.9 * ev.before_color, `half weight on the ramp ${g05} (${JSON.stringify(ev)})`); assert.ok(ev.pim_color_at_full > 1000, "the protected owner keeps its colour");
    const B = await shoot(compile([]), [160], "nograde"); ev.removed = count(B[160], torso); assert.ok(ev.removed > 0.9 * ev.before_color, "grade producer removed → colour returns");
    fs.writeFileSync(path.join(out, "PIXEL_EVIDENCE.json"), JSON.stringify({ diagnostic: true, expected_full: g1, expected_half: g05, ...ev }, null, 1));
  } finally { await browser.close(); }
});
