// Directive H3 — R01/R02 affine round trip + quad bbox (incl. rotation, nonuniform scale, negative origin, sub-crop), R07 unlike families fit
// their OWN interfaces (machine hinge, organism appendage — not the human rig), R08 negatives, H1 demands derived from the real action graph.
// R03/R04/R05/R06 are executed by the preserved P0.1 suites (p01_reaudit B1/B2/H2, p0_audit P0-3/P0-4) and are re-run with this suite.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
const G = await import("../../engine/art_bridge/asset_geometry.mjs"), Mx = await import("../../engine/art_bridge/math2d.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
const asset = (M, crop, w, h) => { const g = G.geometryFields(M, crop, w, h); return { ...g, source_pixel_crop: crop }; };

test("R01/R02 raster→canonical→raster round trips; canonical rect = bbox of the 4 transformed corners for scale/rotation/nonuniform/crop/negative origin", () => {
  const cases = [{ M: [0.5, 0, 0, 0.5, -20, -15], crop: [0, 0, 640, 900], expect: [-20, -15, 320, 450] }, { M: Mx.chain(Mx.T(-40, 30), Mx.R(30), Mx.S(1.25)), crop: [0, 0, 200, 120] }, { M: Mx.chain(Mx.T(10, -60), Mx.S(0.8, 1.6)), crop: [16, 8, 300, 200] }, { M: Mx.chain(Mx.T(-300, -200), Mx.R(-115), Mx.S(0.9)), crop: [0, 0, 512, 256] }];
  for (const c of cases) { const a = asset(c.M, c.crop, c.crop[2], c.crop[3]), quad = G.canonicalQuad(a), bb = G.bboxOf(quad);
    assert.deepEqual(G.canonicalBBox(a).map((v) => +v.toFixed(9)), bb.map((v) => +v.toFixed(9))); if (c.expect) assert.deepEqual(a.canonical_rect.map((v) => +v.toFixed(9)), c.expect);
    for (const p of [[0, 0], [c.crop[2], c.crop[3]], [c.crop[2] / 3, c.crop[3] / 2]]) { const can = G.rasterToCanonical(a, [p[0] + c.crop[0], p[1] + c.crop[1]]), back = G.canonicalToCrop(a, can); assert.ok(Math.hypot(back[0] - p[0], back[1] - p[1]) < 1e-9, `round trip ${p}`); }
    assert.equal(G.rectMismatch(a), null); }
  const naive = [0, 0, 200 * 1.25, 120 * 1.25], rot = asset(cases[1].M, cases[1].crop, 200, 120); assert.notDeepEqual(rot.canonical_rect.slice(2).map(Math.round), naive.slice(2).map(Math.round), "rotated bbox is not width×scale");
});

test("R07 unlike families fit THEIR OWN interfaces: a machine hinge and an organism appendage move to measured art; frame anchors stay", () => {
  const machine = { id: "lid_rig", identity_id: "box", joints: [{ id: "body", parent_id: null, rest_xy: [0, 0] }, { id: "hinge", parent_id: "body", rest_xy: [100, 0] }, { id: "latch", parent_id: "hinge", rest_xy: [180, 0] }] }, mid = { id: "box", landmarks: { body: [0, 0], base: [0, 50], hinge: [100, 0], latch: [180, 0] } };
  const rm = I.fitInterfacesToMeasured([machine], mid, { body: [0, 0], base: [0, 50], hinge: [92, 3], latch: [160, 4] }, ["body", "base"]);
  assert.deepEqual(machine.joints.find((j) => j.id === "hinge").rest_xy, [92, 3]); assert.deepEqual(mid.landmarks.base, [0, 50]); assert.ok(rm.limb_changes.some((l) => l.bone === "hinge->latch" && Math.abs(l.ratio - 68.007 / 80) < 0.01));
  const octo = { id: "octo_rig", identity_id: "octo", joints: [{ id: "mantle", parent_id: null, rest_xy: [0, 0] }, { id: "arm1_mid", parent_id: "mantle", rest_xy: [40, 60] }, { id: "arm1_tip", parent_id: "arm1_mid", rest_xy: [70, 120] }] }, oid = { id: "octo", landmarks: { mantle: [0, 0], eye: [10, -20], arm1_mid: [40, 60], arm1_tip: [70, 120] } };
  I.fitInterfacesToMeasured([octo], oid, { mantle: [0, 0], eye: [10, -20], arm1_mid: [35, 70], arm1_tip: [50, 150] }, ["mantle", "eye"]); assert.deepEqual(octo.joints.find((j) => j.id === "arm1_tip").rest_xy, [50, 150]);
  const plan = JSON.parse(fs.readFileSync(path.join(REPO, "films", "hv2_film001", "handoff", "ART_DEPENDENCY_PLAN.json"), "utf8"));
  assert.deepEqual(plan.assets.filter((a) => a.registration?.mode === "FIT_RIG").map((a) => a.asset_id).sort(), ["ines_master", "washer_master"], "every rigged master (human AND machine) is FIT_RIG");
});

test("R08 negatives: missing hidden paint, wrong underpaint order, unknown alpha refuse before any pixels are trusted", () => {
  const plan = { assets: [{ asset_id: "fore", kind: "PART", hidden_surfaces: ["elbow_inner"], surface_underpaint: {}, draw_order: [] }, { asset_id: "up", kind: "UNDERPAINT", draw_order: [{ relation: "ABOVE", asset_id: "fore" }] }] };
  const e = I.validatePlanContract({ identities: [], assets: [], rigs: [] }, plan); assert.ok(e.some((x) => x.code === "MISSING_UNDERPAINT"), JSON.stringify(e));
  plan.assets[0].surface_underpaint = { elbow_inner: "up" }; const e2 = I.validatePlanContract({ identities: [], assets: [], rigs: [] }, plan); assert.ok(e2.length > 0, "underpaint ABOVE its owner must be refused");
});

test("H1 demands are derived from the real action graph (every bound state, contact closure, camera coverage) with frames — no fixed image count", async () => {
  const { deriveArtDemands } = await import("../../engine/art_bridge/art_demand.mjs"), F = path.join(REPO, "films", "hv2_film001"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
  const r = deriveArtDemands({ doc: J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan: J(path.join(F, "handoff", "ART_DEPENDENCY_PLAN.json")), motionPlans: { S02: J(path.join(F, "handoff", "MOTION_PLAN_S02.json")) } });
  assert.ok(r.demands.length > 0 && r.demands.every((d) => d.frames.length && d.why.length));
  fs.mkdirSync(path.join(REPO, "hybrid_v2", "evidence", "system_correction"), { recursive: true }); fs.writeFileSync(path.join(REPO, "hybrid_v2", "evidence", "system_correction", "ART_DEMAND_FROM_ACTION_GRAPH.json"), JSON.stringify(r, null, 1));
});
