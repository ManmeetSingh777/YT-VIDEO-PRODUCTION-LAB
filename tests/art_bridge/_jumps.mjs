import fs from "node:fs";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks } from "../../engine/art_bridge/temporal.mjs";
const k = process.argv[2], reg = await createAssetRegistry("tests/art_bridge/fixtures", `stage2/scene_${k}.manifest.json`), plan = JSON.parse(fs.readFileSync(`tests/art_bridge/fixtures/stage2/scene_${k}.plan.json`));
const C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan }); let prev = null; const worst = {};
for (let f = 0; f < 600; f++) { const th = C.solveConstraints(f, C.evalPrimary(f, C.shotAt(f)), C.contactsAt(f)).state; for (const rid in th) for (const j in th[rid].theta) { const v = th[rid].theta[j]; if (prev) { const d = Math.abs(((v - prev[rid].theta[j] + 540) % 360) - 180); const key = rid + "." + j; if (!worst[key] || d > worst[key][0]) worst[key] = [+d.toFixed(2), f]; } } prev = th; }
console.log(worst);
