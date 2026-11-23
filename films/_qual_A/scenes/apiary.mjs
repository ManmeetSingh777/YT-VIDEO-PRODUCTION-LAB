// MOTION PROOF (qualification, not Film 001): every action is bound to a contract event from direction/EPISODE.json.
import { beekeeper } from "../subjects/beekeeper.mjs";
import { smoker } from "../subjects/smoker.mjs";
import { apiary, hive } from "../subjects/apiary.mjs";

const bee = (id) => `<g id="${id}" opacity="0"><g id="${id}-w" ><ellipse cx="-2" cy="-8" rx="7" ry="5" fill="#eaf6ff" opacity=".85"/><ellipse cx="5" cy="-7" rx="6" ry="4.5" fill="#eaf6ff" opacity=".75"/></g>
  <ellipse rx="10" ry="7" fill="#f2c230"/><path d="M-4,-6.6 L-4,6.6 M2,-7 L2,7" stroke="#2a1d12" stroke-width="3"/><circle cx="10" cy="0" r="4.5" fill="#2a1d12"/></g>`;
const puff = (id) => `<g id="${id}" opacity="0"><path d="M-30,6 C-34,-10 -16,-22 -2,-16 C4,-30 26,-28 30,-12 C42,-10 44,8 30,12 C20,22 -20,22 -30,6 Z" fill="#eef1f2"/><path d="M-26,8 C-14,16 16,16 30,10 C20,20 -16,22 -26,8 Z" fill="#cfd6da"/></g>`;

export function build(ctx) {
  const E = { raise: ctx.E("raise"), squeeze: ctx.E("squeeze"), arrive: ctx.E("smoke_arrives"), settle: ctx.E("settle"), relief: ctx.E("relief") };
  const W = apiary({ ctx, prefix: "ap-" }), H = hive({ ctx, prefix: "hv-" });
  const BK = beekeeper({ ctx, prefix: "bk-", place: [560, 1010] }), K = BK.out();
  const S = smoker({ ctx, prefix: "sm-" });
  const NB = 14, NP = 6;
  const body = `<g id="L-world">${W.svg}</g><g id="L-hive">${H.svg}</g>
    <g id="L-act"><ellipse cx="575" cy="1008" rx="150" ry="14" fill="#5f8a4d" opacity=".55"/><ellipse cx="1520" cy="906" rx="120" ry="12" fill="#5f8a4d" opacity=".55"/>
      ${K.svg}${S.svg}${K.front}
      <g id="puffs">${Array.from({ length: NP }, (_, i) => puff("pf" + i)).join("")}</g>
      <g id="bees">${Array.from({ length: NB }, (_, i) => bee("be" + i)).join("")}</g></g>`;
  const script = `
  const E = ${JSON.stringify(E)}, NB = ${NB}, NP = ${NP}, ENT = ${JSON.stringify(H.entrance)};
  MN.setLight(S, -50);
  const bk = MN.rig(S, RIGS.bk, {}), sm = MN.rig(S, RIGS.sm, {}), hv = MN.rig(S, RIGS.hv, {}), wd = MN.rig(S, RIGS.ap, {});
  bk.attach(${JSON.stringify(S.P + "rig")}, "grip", -1, 1e9, {});
  // performance: raise (arm up, head turns to hive, slight lean), squeezes, relief
  bk.pose(E.raise, { armF: -42, gloveF: 30, head: -4, torso: 4 }, 0.7, "back.out(1.4)");
  const sq = [E.squeeze, E.squeeze + 0.55, E.squeeze + 1.1];
  for (const t of sq) { bk.pose(t - 0.06, { gloveF: 36, armF: -44 }, 0.12, "power2.in"); bk.pose(t + 0.12, { gloveF: 30, armF: -42 }, 0.3, "power2.out");
    sm.key("upper.y", [[t - 0.06, 0], [t + 0.06, 9, "power2.in"], [t + 0.36, 0, "power2.out"]]); }
  bk.pose(E.relief, { armF: -10, gloveF: 8, head: 2, torso: -1 }, 0.9, "sine.inOut");
  // smoke: each squeeze emits from the spout socket (world position read from the rig every frame)
  const lerp = NU.lerp, clamp = NU.clamp;
  S.at((t) => {
    for (let i = 0; i < NP; i++) {
      const t0 = sq[i % 3] + Math.floor(i / 3) * 0.18, u = (t - t0) / 2.6;
      const id = "pf" + i; if (u < 0 || u > 1) { S.set(id, "o", 0); continue; }
      const n = sm.socket("nozzle", t); // container honours the hand attach (engine fix)
      const x = lerp(n[0], ENT[0] - 30 + i * 8, Math.pow(u, 0.8)), y = lerp(n[1], ENT[1] - 10 - (i % 3) * 16, u) - Math.sin(u * Math.PI) * 60;
      S.set(id, "a:transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + (0.35 + u * 1.5).toFixed(3) + ")");
      S.set(id, "o", Math.min(1, u * 6) * (1 - Math.pow(u, 2.2)) * 0.9);
    }
    // bees: busy orbits around the entrance; speed drops after the smoke arrives; after settle each flies INTO the entrance
    const calm = clamp((t - E.arrive) / 1.6);
    for (let i = 0; i < NB; i++) {
      const h1 = NU.hash(i + 2), h2 = NU.hash(i * 3 + 7), ph = h1 * 6.28, rr = 60 + h2 * 150, sp = (2.4 + h1 * 1.6) * (1 - 0.65 * calm);
      const T = (t < E.arrive ? t : E.arrive + (t - E.arrive) * (1 - 0.65 * calm));
      let x = ENT[0] + Math.cos(T * sp + ph) * rr * 1.3, y = ENT[1] - 90 + Math.sin(T * sp * 1.3 + ph) * rr * 0.55 - h2 * 60;
      const tin = E.settle + i * 0.17, k = clamp((t - tin) / 0.7);
      if (k > 0) { const e = S.ease("power2.in")(k); x = lerp(x, ENT[0] + (h1 - 0.5) * 60, e); y = lerp(y, ENT[1], e); }
      const dx = -Math.sin(T * sp + ph);
      S.set("be" + i, "a:transform", "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ") scale(" + ((dx < 0 ? -1 : 1) * (1 - 0.7 * k)).toFixed(3) + " " + (1 - 0.7 * k).toFixed(3) + ")");
      S.set("be" + i, "o", (t < 0.15 ? t / 0.15 : 1) * (k >= 1 ? 0 : 1));
      S.set("be" + i + "-w", "a:transform", "scale(1 " + (0.55 + 0.45 * Math.abs(Math.sin(t * 60 + i))).toFixed(2) + ")");
    }
  });
  MN.sway(S, Array.from({ length: 26 }, (_, i) => "ap-fl" + i), 4, 0.5, 2);
  MN.camera(S, { x: [[0, 0], [E.settle, 0], [E.settle + 3, 90, "sine.inOut"]], y: [[0, 0], [E.settle + 3, -20, "sine.inOut"]], z: [[0, 1], [E.settle, 1], [E.settle + 3, 1.1, "sine.inOut"]] },
    [["L-world", 0.5], ["L-hive", 1], ["L-act", 1]]);`;
  ctx.write({ bg: "#bfe3dc", body, script, rigs: { bk: K.meta, sm: S.meta, hv: H.meta, ap: W.meta } });
}
