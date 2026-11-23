// FIRST-PASS REVIEW SHEET (mandatory before a master is accepted): one construction, several views and states.
import { warden } from "../subjects/warden.mjs";
export function build(ctx) {
  const views = [[-8, "neutral"], [38, "neutral"], [78, "neutral"], [38, "pleased"]];
  let body = "", script = "MN.setLight(S, -55); ";
  views.forEach(([yaw, ex], i) => {
    const W = warden({ ctx, id: `warden_v${i}`, prefix: `${ctx.id}-w${i}-`, place: [250 + i * 470, 990], view: { yaw, pitch: -3 }, hands: "open" });
    body += `<g transform="translate(0 0) scale(1)">${W.svg}${W.front}</g>`;
    script += `{ const f = MN.form(S, ${JSON.stringify(W.meta)}, {}); f.pose(0, ${JSON.stringify(ex)}, 0.01); }\n`;
  });
  ctx.write({ bg: "#2c5560", body: `<g transform="translate(0 120) scale(0.78)">${body}</g>`, script });
}
