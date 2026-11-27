// CH-1: one consolidated return splits into the two existing import routes (masters → import-handoff, dependents → import-plan) with the
// same image files, each with its own RETURN_MANIFEST.json; template placeholders are never forwarded.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { splitReturn } from "../../tools/tbo/e01_consolidated_handoff.mjs"; import { zipDir, unzipSafe } from "../../engine/art_bridge/gpt_batch.mjs";

test("CH-1 consolidated return splits into masters and dependents returns", () => {
  const t = fs.mkdtempSync(path.join(os.tmpdir(), "ch1-")), src = path.join(t, "ret"); fs.mkdirSync(path.join(src, "returns", "A01"), { recursive: true }); fs.mkdirSync(path.join(src, "returns", "B001", "stage01"), { recursive: true });
  fs.writeFileSync(path.join(src, "returns", "A01", "x.png"), "a"); fs.writeFileSync(path.join(src, "returns", "B001", "stage01", "y.png"), "b");
  fs.writeFileSync(path.join(src, "RETURN_MANIFEST.json"), JSON.stringify({ consolidated_handoff: "H", masters: { handoff: "H", results: [{ id: "A01", asset: "M", images: [{ file: "returns/A01/x.png" }] }, { id: "A02", asset: "N", images: [{ file: "returns/A02/<name>.png" }] }] },
    dependents: { plan_id: "GPT_ART_PLAN_x", entries: [{ artjob: "J", stages: [{ stage: 1, images: [{ file: "y.png", path: "returns/B001/stage01/y.png" }], _image_format: {} }] }] } }));
  const zip = path.join(t, "ret.zip"); zipDir(src, zip); const out = path.join(t, "out"); fs.mkdirSync(out);
  const r = splitReturn({ zip, dir: out });
  const m = path.join(t, "m"), d = path.join(t, "d"); fs.mkdirSync(m); fs.mkdirSync(d); const mf = unzipSafe(r.masters_zip, m), df = unzipSafe(r.dependents_zip, d);
  const mm = JSON.parse(fs.readFileSync(path.join(m, "RETURN_MANIFEST.json"), "utf8")), dm = JSON.parse(fs.readFileSync(path.join(d, "RETURN_MANIFEST.json"), "utf8"));
  assert.deepEqual(mm.results.map((x) => x.id), ["A01"]); assert.equal(dm.plan_id, "GPT_ART_PLAN_x"); assert.equal(dm.entries[0].stages[0]._image_format, undefined);
  assert.ok(mf.some((f) => f.endsWith("returns/A01/x.png"))); assert.ok(df.some((f) => f.endsWith("returns/B001/stage01/y.png")));
});
