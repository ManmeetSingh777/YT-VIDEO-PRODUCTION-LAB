// sc01: keeper walks (planted feet), grips the lantern, lifts it; lantern unfolds into a star; shadows re-aim.
import { buildRoom, CAM } from "./room_common.mjs";
export function build(ctx) {
  const E = {
    walk_start: ctx.E("walk_start"), arrive: ctx.E("arrive"), grip: ctx.E("grip"),
    lift: ctx.E("lift"), unfold: ctx.E("unfold"), light_turn: ctx.E("light_turn"),
  };
  const D = ctx.dur;
  // camera: wide drift with the walk, then push + tilt up with the lift (pivot = window centre, shared with sc02)
  const camera = JSON.stringify({ wx: CAM.wx, wy: CAM.wy,
    x: [[0, CAM.cx0], [E.arrive, CAM.cx0 + 70, "sine.inOut"], [E.lift, CAM.cx0 + 80], [D, CAM.cx0 + 120, "sine.inOut"]],
    y: [[0, CAM.cy0], [E.lift, CAM.cy0], [D, CAM.cy0 - 55, "sine.inOut"]],
    z: [[0, 1], [E.lift, 1], [D, 1.12, "sine.inOut"]] });
  buildRoom(ctx, { E, camera });
}
