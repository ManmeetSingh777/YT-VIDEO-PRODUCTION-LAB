// developer dry-run: compile + evaluate scenes numerically (no rendering)
import fs from "node:fs";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks, stateAtFrame } from "../../engine/art_bridge/temporal.mjs";
import { composeShot } from "../../engine/art_bridge/scene_graph.mjs";
const ROOT = "tests/art_bridge/fixtures";
for (const k of process.argv.slice(2)) {
  const reg = await createAssetRegistry(ROOT, `stage2/scene_${k}.manifest.json`);
  const plan = JSON.parse(fs.readFileSync(`${ROOT}/stage2/scene_${k}.plan.json`, "utf8"));
  let C; try { C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan }); } catch (e) { console.log(k, "COMPILE", e.message, (e.errors || [e]).map((x) => x.code + ":" + x.human_readable_reason)); continue; }
  const fails = {}; let maxErr = 0;
  for (let f = 0; f < 600; f++) { const s = stateAtFrame(C, f); for (const e of s.failures) (fails[e.code + " " + (e.record_id || "")] ||= []).push(f); for (const c of s.contacts) if (c.locked) maxErr = Math.max(maxErr, c.error_px); }
  const sc = composeShot(reg.doc.shots[0], reg, C, { prefix: `${k}-` });
  console.log(k, "failures:", Object.fromEntries(Object.entries(fails).map(([c, f]) => [c, `${f.length} frames ${f[0]}..${f.at(-1)}`])), "maxContactErr", maxErr.toExponential(2));
  console.log("  FOCAL order:", sc.order.FOCAL.join(" < "), "| rows", sc.frameState(300).rows.length);
}
