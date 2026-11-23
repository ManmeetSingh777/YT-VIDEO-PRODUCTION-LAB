// sc02: camera pushes through the window into the complete inner world. Continuity: same constructors, sc01 events
// replayed at negative local times so pose, grip, light and camera are identical at the cut.
import { buildRoom, sc01Events, CAM } from "./room_common.mjs";
export function build(ctx) {
  const E = sc01Events(ctx, "sc02");
  const push = ctx.E("push"), through = ctx.E("through"), D = ctx.dur;
  const camera = JSON.stringify({ wx: CAM.wx, wy: CAM.wy,
    x: [[0, CAM.cx0 + 120], [push, CAM.cx0 + 120], [through + 0.6, 0, "power2.inOut"]],
    y: [[0, CAM.cy0 - 55], [push, CAM.cy0 - 55], [through + 0.6, 0, "power2.inOut"]],
    z: [[0, 1.12], [push, 1.12], [through, 4.2, "power3.in"], [D, 7.5, "power2.out"]] });
  buildRoom(ctx, { E, camera });
}
