// A directed on-screen size may be a MEASUREMENT between two master landmarks (e.g. a head height) instead of the whole painted figure.
// One size statement per identity; the landmarks must be required of the master; registration scales the measured span, never the painted extent.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { validatePacket } from "../../engine/story/creative_packet.mjs"; import { compilePacket } from "../../engine/story/creative_adapter.mjs"; import { measuredFrame } from "../../engine/art_bridge/art_intake.mjs";
const { buildPacket } = await import("../p05/packet_fixture.mjs");
const fresh = () => buildPacket(fs.mkdtempSync(path.join(os.tmpdir(), "osr-")));
const REF = { measure: "head_height_px", px: 120, range_px: [110, 130], shot: "sh_pull", from_landmark: "head_top", to_landmark: "neck", source: "fixture: directed head height" };
const codes = (p, id = "nova") => validatePacket(p).errors.filter((e) => e.id === id).map((e) => e.code);

test("OSR-1 the packet states one size: a figure height OR a landmark measurement; each refusal is exact", () => {
  const p = fresh(), n = p.identities.find((i) => i.id === "nova"); n.on_stage_height_px = null; n.on_stage_reference = REF;
  assert.equal(validatePacket(p).status, "STRUCTURAL_VALID", JSON.stringify(validatePacket(p).errors.slice(0, 3)));
  n.on_stage_height_px = 450; assert.ok(codes(p).includes("AMBIGUOUS_DIRECTION")); n.on_stage_height_px = null;
  n.on_stage_reference = null; assert.ok(codes(p).includes("INCOMPLETE_DIRECTION"));
  n.on_stage_reference = { ...REF, to_landmark: "chin_missing" }; assert.ok(codes(p).includes("UNMEASURABLE_JOINT"));
  n.on_stage_reference = { ...REF, px: 200 }; assert.ok(codes(p).includes("SCHEMA_VIOLATION"));
  n.on_stage_reference = { ...REF, shot: "sh_nowhere" }; assert.ok(codes(p).includes("UNKNOWN_SHOT"));
});
test("OSR-2 the reference reaches the manifest identity and the master's MEASURE_FRAME registration unchanged", () => {
  const p = fresh(), n = p.identities.find((i) => i.id === "nova"); n.on_stage_height_px = null; n.on_stage_reference = REF;
  const { files } = compilePacket(p), id = files["handoff/ART_AND_MOTION_MANIFEST_V2.json"].identities.find((i) => i.id === "nova"), reg = files["handoff/ART_DEPENDENCY_PLAN.json"].assets.find((a) => a.asset_id === n.master_art).registration;
  assert.deepEqual(id.on_stage_reference, REF); assert.equal(id.on_stage_height_px, null); assert.equal(reg.mode, "MEASURE_FRAME"); assert.deepEqual(reg.on_stage_reference, REF);
});
test("OSR-3 registration scales the MEASURED span to the directed px (not the painted extent); missing landmarks refuse; the figure-height path is unchanged", () => {
  const w = 40, h = 600, rgba = Buffer.alloc(w * h * 4); for (let y = 50; y < 550; y++) rgba[(y * w + 5) * 4 + 3] = 255; const png = { width: w, height: h, rgba };
  const T = measuredFrame({ mode: "MEASURE_FRAME", on_stage_reference: REF }, png, "a", { landmarks: { head_top: [10, 60], neck: [10, 360] } }); assert.equal(T[0], 120 / 300); assert.equal(T[3], 120 / 300);
  assert.throws(() => measuredFrame({ mode: "MEASURE_FRAME", on_stage_reference: REF }, png, "a", { landmarks: { head_top: [10, 60] } }), (e) => e.code === "UNREGISTERED_PIVOT");
  assert.equal(measuredFrame({ mode: "MEASURE_FRAME", on_stage_height_px: 250 }, png, "a")[0], 250 / 500, "whole painted extent 500 px → 250 px");
});
