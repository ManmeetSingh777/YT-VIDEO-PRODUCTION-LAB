// Shared construction for sc01 + sc02: the SAME rig, prop and world builders are used in both scenes, so the
// cut preserves identity, pose, light and camera. Event times come from the contract (ctx.E) — never typed in.
import fs from "node:fs";
import { keeper, GROUND } from "../cast/keeper.mjs";
import { room, innerWorld, lantern, LAN_A, LAN_B, GROUND_Y, WIN } from "../cast/world.mjs";
import { prop } from "../../../engine/lib/rig.mjs";
import { rep } from "../../../engine/lib/nu_lib.mjs";

const cues = JSON.parse(fs.readFileSync("production/cues.json", "utf8"));
/** sc01 event times expressed in the CALLING scene's local clock (sc02 sees sc01's events at negative times) */
export function sc01Events(ctx, sceneId) {
  const a = cues.scenes.sc01, b = cues.scenes[sceneId];
  const shift = a.start - b.start;
  const E = {};
  for (const k in a.events) E[k] = +(a.events[k] + shift).toFixed(3);
  E.sc01_end = +(a.start + a.dur - b.start).toFixed(3);
  return E;
}

export const HANDLE = [1096, 452];
// Q02 repair: carry low after unhooking, then LIFT into a presentation region forward of the face (gap ≥ 30 px), gaze linked
export const CHEST = [1078, 640];
export const RAISE = [1176, 528];
export const CAM = { wx: WIN.cx, wy: WIN.cy, cx0: 370 - 30, cy0: 175 };

export function buildRoom(ctx, { E, camera, extraScript = "" }) {
  const id = ctx.id, P = id + "-";
  const KP = P + "k-", RP = P + "r-", LID = P + "lan";
  const K = keeper({ P: KP, x: 0, y: GROUND_Y - GROUND, ctx });
  const W = room(RP), IW = innerWorld(P + "iw-");
  const shadowF = `<filter id="${P}shadowF" x="-50%" y="-50%" width="200%" height="200%"><feColorMatrix type="matrix" values="0 0 0 0 0.05  0 0 0 0 0.03  0 0 0 0 0.12  0 0 0 0.5 0"/></filter>`;
  const pool = `<radialGradient id="${P}poolG"><stop offset="0" stop-color="#ffd56a" stop-opacity=".42"/><stop offset=".5" stop-color="#ffb84a" stop-opacity=".12"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient>`;
  const motes = rep(34, (i) => `<circle id="${P}m${i}" r="${(1.4 + (i % 4) * 0.7).toFixed(1)}" fill="#fff2cf" opacity="0"/>`);
  const body = `
  <g id="${P}iwsky">${IW.layers.sky}</g><g id="${P}iwfar">${IW.layers.far}</g><g id="${P}iwtown">${IW.layers.town}</g><g id="${P}iwnear">${IW.layers.near}</g>
  <g id="${P}wall">${W.wall}</g>
  <g id="${P}floor">${W.floor}</g>
  <g id="${P}stage">
    <ellipse id="${P}pool" data-fx="pool" cx="1100" cy="${GROUND_Y}" rx="520" ry="110" fill="url(#${P}poolG)" opacity="0"/>
    <use id="${P}shadow" href="#${KP}rig" filter="url(#${P}shadowF)" opacity=".85"/>
    ${K.svg}
    ${prop(LID, HANDLE[0], HANDLE[1], lantern(LID))}
    <g id="${P}motes">${motes}</g>
  </g>
  <g id="${P}table">${W.table}</g>
  <g id="${P}fg">${W.fg}</g>`;
  const surfPos = Object.fromEntries(Object.entries({ curtain: [800, 380], cup: [1582, 782], jar0: [1305, 360], jar1: [1352, 370], jar2: [1403, 350], jar3: [1451, 376], jar4: [1498, 364] }).map(([k, v]) => [RP + k, v]));
  const script = `
  const E = ${JSON.stringify(E)}, P = ${JSON.stringify(P)}, L = ${JSON.stringify(LID)}, RP = ${JSON.stringify(RP)};
  const HANDLE = ${JSON.stringify(HANDLE)}, CHEST = ${JSON.stringify(CHEST)}, RAISE = ${JSON.stringify(RAISE)};
  const LAN_A = ${JSON.stringify(LAN_A)}, LAN_B = ${JSON.stringify(LAN_B)};
  const lerp = NU.lerp, clamp = NU.clamp, ez = (n) => S.ease(n);
  // ---- keeper performance (all times from the contract) ----
  const k = MN.rig(S, RIGS.keeper, { "root.x": 330, lookX: 0.5 });
  k.walk(E.walk_start, E.arrive - 0.15, { x0: 330, x1: 1010, stride: 136, legs: [["thighF", "shinF", "footF"], ["thighB", "shinB", "footB"]], arms: [["upperF", -1], ["upperB", 1]], armSwing: 16, lift: 24, bob: 7, lean: ["torso", 4] });
  k.post((v) => { const s = clamp(((v.thighB || 0) - (v.thighF || 0)) / 46, -1, 1); v["skirt:f"] = Math.max(0, s); v["skirt:b"] = Math.max(0, -s); });
  k.pose(E.walk_start - 0.3, { lookX: 0.6, head: 2 }, 0.4);
  k.pose(E.arrive - 0.3, { expr: "curious", head: -12, torso: -3, lookX: 0.5, lookY: -0.8 }, 0.5, "power2.out");
  k.pose(E.grip - 0.95, { "handF:open": 1, "handF:grip": 0, head: -16, lookY: -1 }, 0.4);
  k.pose(E.grip - 0.12, { "handF:open": 0, "handF:grip": 1, expr: "effort" }, 0.14, "power2.out");
  k.pose(E.grip + 0.35, { head: -4, lookY: 0.2, lookX: 0.8, torso: 1 }, 0.5);
  k.pose(E.lift - 0.35, { squash: 0.35 }, 0.25, "power2.in");
  k.pose(E.lift - 0.1, { squash: -0.12, torso: -3, head: -8, lookY: 0.1, lookX: 1, "torso.sy": 1.03 }, 0.35, "back.out(1.6)");
  k.pose(E.lift + 0.45, { squash: 0 }, 0.4);
  k.pose(E.unfold + 0.1, { expr: "delighted", head: -6, torso: -5, lookX: 1, lookY: 0.4 }, 0.35, "back.out(2)");
  k.pose(E.light_turn, { lookX: 0.9, lookY: 0.2, head: -9 }, 1.2);
  // reach: handle → unhook → chest → raise; the IK target is the GRIP point (tip) not the wrist
  const P0 = ${JSON.stringify(HANDLE)};
  const tgt = (t) => {
    if (t < E.grip) return P0;
    if (t < E.grip + 0.25) { const u = ez("power2.out")((t - E.grip) / 0.25); return [P0[0], P0[1] - 12 * u]; }
    if (t < E.lift) { const u = ez("power2.inOut")(clamp((t - E.grip - 0.25) / 0.9)); return [lerp(P0[0], CHEST[0], u), lerp(P0[1] - 12, CHEST[1], u)]; }
    const u = ez("power3.inOut")(clamp((t - E.lift) / 0.85)); const b = Math.sin((t - E.lift) * 2.1) * 4 * clamp(t - E.lift - 0.9);
    return [lerp(CHEST[0], RAISE[0], u), lerp(CHEST[1], RAISE[1], u) + b];
  };
  k.reach(["upperF", "foreF", "handF"], E.grip - 0.85, 1e9, tgt, { in: 0.85, tip: [0, 17], bend: -1 });
  k.attach(L, "gripF", E.grip, 1e9, { upright: true });
  // ---- lantern: pendulum from hand velocity; unfold = outline interpolation (same topology) ----
  S.at((t) => {
    let r = Math.sin(t * 1.4) * 1.5;
    if (t >= E.grip) { const a = k.socket("gripF", t), b = k.socket("gripF", t - 0.12); r = clamp(-(a[0] - b[0]) * 0.9, -14, 14) + Math.sin(t * 2.2) * 1.2; }
    S.set(L + "-in", "r", r);
  });
  S.k(L + "-body-d", { "a:d": [[E.unfold, LAN_A], [E.unfold + 0.6, LAN_B, "back.out(1.5)"]] });
  S.k(L + "-body-S", { fill: [[E.unfold, "#d18e45"], [E.unfold + 0.5, "#ffc95a"]] });
  S.k(L + "-body-L", { fill: [[E.unfold, "#f6d083"], [E.unfold + 0.5, "#fff1b8"]] });
  S.k(L + "-pleats", { o: [[E.unfold, 1], [E.unfold + 0.3, 0]] });
  S.k(L + "-facets", { o: [[E.unfold + 0.2, 0], [E.unfold + 0.55, 1]] });
  S.k(L + "-tassel", { o: [[E.unfold, 1], [E.unfold + 0.25, 0]] });
  S.k(L + "-core", { "a:r": [[E.unfold, 24], [E.unfold + 0.4, 34, "back.out(2)"]], o: [[E.unfold, 0.75], [E.unfold + 0.3, 1]] });
  S.k(L + "-halo", { "a:r": [[E.unfold, 150], [E.unfold + 0.5, 360, "power2.out"]], o: [[E.unfold, 0.7], [E.unfold + 0.4, 1]] });
  S.k(P + "pool", { o: [[E.unfold, 0], [E.unfold + 0.6, 1]] });
  // ---- light: moon through the window (directional) → the star (point light, re-aims every attached plane) ----
  const star = (t) => { const g = k.socket("gripF", t); return [g[0], g[1] + 70]; };
  MN.setLight(S, { dir: -140, pos: star, posW: [[0, 0], [E.light_turn, 0], [E.light_turn + 1.3, 1, "power2.inOut"]] });
  MN.surfaces(S, ${JSON.stringify(Object.entries(surfPos).map(([id, pos]) => ({ id, k: 8, pos })))});
  S.k(RP + "beam", { o: [[E.light_turn, 1], [E.light_turn + 1.3, 0.4]] });
  // ---- floor cast shadow: the keeper's own drawing projected onto the floor along the current light ----
  const GY = ${GROUND_Y};
  S.at((t) => {
    const w = k.world("root", t), kp = [w[4], w[5] - 120];
    const L = MN.lightAt(S, t, kp) * Math.PI / 180;
    const sh = clamp(-Math.cos(L) / Math.max(0.3, -Math.sin(L)), -2.4, 2.4), sq = 0.2;
    S.set(P + "shadow", "a:transform", "matrix(1 0 " + (-sh).toFixed(4) + " " + sq + " " + (sh * GY).toFixed(2) + " " + (GY * (1 - sq)).toFixed(2) + ")");
    S.set(P + "pool", "a:cx", star(t)[0].toFixed(1));
    // motes drift; they light up only near the star after it unfolds
    const sp = star(t), lit = clamp((t - E.unfold) / 0.8);
    for (let i = 0; i < 34; i++) {
      const h1 = NU.hash(i + 3), h2 = NU.hash(i * 5 + 1);
      const x = 700 + h1 * 900 + NU.wig(t, 0.4, i) * 30, y = 300 + ((h2 * 600 - t * (8 + h1 * 10)) % 600 + 600) % 600;
      const d = Math.hypot(x - sp[0], y - sp[1]);
      S.set(P + "m" + i, "a:cx", x.toFixed(1)); S.set(P + "m" + i, "a:cy", y.toFixed(1));
      S.set(P + "m" + i, "o", (0.12 + lit * 0.8 * clamp(1 - d / 420)) * (0.6 + 0.4 * Math.sin(t * 2 + i)));
    }
  });
  MN.sway(S, ${JSON.stringify(Array.from({ length: 9 }, (_, i) => RP + "leaf" + i))}, 2.2, 0.35, 3);
  ${extraScript}
  MN.camera(S, ${camera}, [[P + "iwsky", 0.15], [P + "iwfar", 0.3], [P + "iwtown", 0.45], [P + "iwnear", 0.6], [P + "wall", 1], [P + "floor", 1], [P + "stage", 1], [P + "table", 1.06], [P + "fg", 1.3]]);
  `;
  ctx.write({ defs: W.defs + IW.defs + shadowF + pool, body, script, bg: "#1d1733", rigs: { keeper: K.meta } });
}
