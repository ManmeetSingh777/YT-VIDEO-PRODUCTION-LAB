import { loadScene, renderFrames, readPNG, centroid, near, stateAtFrame, FIX } from "./stage2_lib.mjs";
import { apply } from "../../engine/art_bridge/math2d.mjs";
import path from "node:path";
const S = await loadScene("P");
const t = Date.now();
const R = await renderFrames(S, 0, [5, 40, 100, 200, 300], "probeP", { background: false, omitBackground: true });
console.log("render ms", Date.now() - t, "failures", R.cap.failures, "preload", R.cap.preload);
const src = readPNG(path.join(FIX, "diag2/probe_arm.png")), out = readPNG(R.files[0]);
let maxd = 0, nd = 0; for (let y = 0; y < 160; y++) for (let x = 0; x < 40; x++) { const i = (y * 40 + x) * 4, j = ((280 + y) * 1920 + 580 + x) * 4; for (let c = 0; c < 4; c++) { const d = Math.abs(src.rgba[i + c] - out.rgba[j + c]); if (d) nd++; maxd = Math.max(maxd, d); } }
console.log("rest identity: maxdiff", maxd, "nonzero channels", nd, "colorType", out.colorType);
for (const [k, f] of [5, 40, 100, 200, 300].entries()) { const st = stateAtFrame(S.C, f), M = st.matrices.probe.arm, pred = apply(M, [20, 140]), c = centroid(readPNG(R.files[k]), near([255, 0, 0], 70)); console.log(f, "pred", pred.map((v) => v.toFixed(2)), "got", c && [c.x.toFixed(2), c.y.toFixed(2), c.n]); }
