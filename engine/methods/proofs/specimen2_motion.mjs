// Normal-speed motion passage for Specimen 2: the SAME producers evaluated per frame (function of time). The driver angle advances with
// the tide current; every gear's rotation is DERIVED by gears.gearTrain; flour appears once the runner stone has turned (causal order).
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
import { buildFrame, P } from "./specimen2_render.mjs";
import { render, writePNG } from "../render.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), OUT = path.join(here, "..", "evidence", "stage1", "MOTION", "specimen2_frames"); fs.mkdirSync(OUT, { recursive: true });
const FPS = 24, SECS = 10, W = 960, H = 540;
for (let f = 0; f < FPS * SECS; f++) {
  const t = f / FPS, ramp = Math.min(1, t / 2), angle = 40 * (t - (t < 2 ? (2 - t) * (2 - t) * 0.25 : 0)) * ramp; // wheel spins up over 2 s then turns at 40°/s
  const dr = buildFrame({ angleDeg: angle, flowing: t > 2.6 });
  writePNG(path.join(OUT, `f${String(f).padStart(4, "0")}.png`), render(dr, { W, H, bg: P.roles.wallStone }));
}
const mp4 = path.join(here, "..", "evidence", "stage1", "MOTION", "specimen2_motion_10s.mp4");
execFileSync("ffmpeg", ["-v", "error", "-y", "-framerate", String(FPS), "-i", path.join(OUT, "f%04d.png"), "-pix_fmt", "yuv420p", "-c:v", "libx264", "-crf", "20", mp4]);
console.log("wrote", mp4);
