// Hero/inspection scene for the qualification subjects: same constructors the motion proof will use.
import { engineer } from "../subjects/engineer.mjs";
import { turbineHall, hallWorld } from "../subjects/turbine.mjs";
export function build(ctx) {
  const H = hallWorld({ ctx, prefix: ctx.id + "-hw-" });
  const T = turbineHall({ ctx, prefix: ctx.id + "-th-" });
  const E = engineer({ ctx, prefix: ctx.id + "-eng-", x: 600, y: 860, headPx: +(process.env.MN_HEADPX || 210) });
  const pose = JSON.parse(process.env.MN_POSE || '{"hsN":1,"hsF":1,"expr":"neutral"}');
  const script = `
  const t = MN.rig(S, RIGS.turbine, ${JSON.stringify({ lamp: +(process.env.MN_LAMP || 0) })});
  const e = MN.rig(S, RIGS.engineer, ${JSON.stringify(Object.assign({}, pose, { expr: undefined }))});
  e.pose(0, ${JSON.stringify(pose.expr || "neutral")}, 0.01);
  const W = [798, 608];
  const rimPt = (a) => [W[0] + Math.cos(a * Math.PI / 180) * 87, W[1] + Math.sin(a * Math.PI / 180) * 87];
  e.reach(["upperN", "foreN", "handN"], -1, 1e9, rimPt(${process.env.MN_GRIPN || 168}), { in: 0.01, tip: [2, 26], bend: -1 });
  e.reach(["upperF", "foreF", "handF"], -1, 1e9, rimPt(${process.env.MN_GRIPF || 228}), { in: 0.01, tip: [2, 26], bend: -1 });
  `;
  ctx.write({ bg: "#1d3a42", body: H.svg + T.svg + E.svg + T.front + E.front, script, rigs: { turbine: T.meta, engineer: E.meta } });
}
