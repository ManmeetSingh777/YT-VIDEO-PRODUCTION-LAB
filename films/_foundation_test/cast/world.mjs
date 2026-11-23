// ROOM + WINDOW WORLD + LANTERN — original foundation-test constructions.
// Stage space = 1920×1080 frame at camera rest; drawn with overscan so the camera can travel.
import { surf, emissive, oblique, repeat, roles, recede, contactShadow } from "../../../engine/lib/style.mjs";
import { morphable, shape } from "../../../engine/lib/geom.mjs";
import { rng, rep, lin, rad } from "../../../engine/lib/nu_lib.mjs";

const f1 = (v) => +v.toFixed(1);
export const R_ROOM = roles("room", { env: "#2c2652", focal: "#f4cf7e", recede: "#352e60", wall: "#2c2652", wallL: "#3a3370", wallS: "#221d44", wains: "#251f48", floor: "#3a2d5c", floorS: "#2a2048", board: "#33274f", wood: "#7a4e66", woodS: "#55344d", woodT: "#93627a", iron: "#171230", frame: "#4b4386", frameS: "#332c66", moon: "#cfe0ff" });
export const R_WIN = roles("window-world", { env: "#1a2156", focal: "#ffe3a0", recede: "#262c66", sky0: "#0e1442", sky1: "#2f3a86", far: "#2a3378", mid: "#252b69", near: "#161a46", house: "#3f4794", houseS: "#2d3475", roof: "#5a3d7a", lit: "#ffd987", tree: "#121640", treeL: "#1d2358" });
export const WIN = { x0: 420, x1: 760, y0: 200, y1: 520, cx: 590, cy: 360 };
export const WIN_D = `M${WIN.x0},${WIN.y1} L${WIN.x0},300 C${WIN.x0},236 482,${WIN.y0} ${WIN.cx},${WIN.y0} C698,${WIN.y0} ${WIN.x1},236 ${WIN.x1},300 L${WIN.x1},${WIN.y1} Z`;
export const GROUND_Y = 930;

/** F48: the window holds a COMPLETE second world with its own strata (each a camera layer with its own depth). */
export function innerWorld(P) {
  const C = R_WIN, R = rng(21);
  const defs = lin(P + "sky", [[0, C.sky0], [0.7, C.sky1], [1, "#5a4f9e"]]) + rad(P + "moonH", [[0, "#dfe8ff", 0.5], [0.4, "#dfe8ff", 0.12], [1, "#dfe8ff", 0]]);
  const ob = oblique(0.42, -0.3);
  // town: houses are oblique boxes + gable roofs on ONE projection; lit windows sit ON the front plane (F38/F76)
  const house = (x, y, w, h, d, seed) => {
    const roofH = h * 0.55;
    const gable = `M${x - 4},${y} L${x + w / 2},${y - roofH} L${x + w + 4},${y} Z`;
    const roofSide = `M${x + w / 2},${y - roofH} L${x + w / 2 + ob.dx * d},${y - roofH + ob.dy * d} L${x + w + 4 + ob.dx * d},${y + ob.dy * d} L${x + w + 4},${y} Z`;
    return ob.box(x, y, w, h, d, { front: C.house, side: C.houseS, top: C.houseS, frontInner: ob.grid(x + 6, y + 8, w - 12, h - 14, 2, Math.max(1, Math.round(w / 26)), { fill: "#232a63", wall: "#151a44", lit: C.lit, litP: 0.45, seed }) }) +
      `<path d="${roofSide}" fill="#46305f"/><path d="${gable}" fill="${C.roof}"/>`;
  };
  const townHill = "M60,470 C220,410 380,420 520,400 C700,376 880,410 1120,440 L1120,760 L60,760 Z";
  const houses = [[300, 418, 70, 46, 30], [392, 400, 56, 52, 26], [470, 392, 84, 40, 34], [574, 380, 60, 58, 28], [652, 388, 74, 44, 32], [744, 396, 58, 50, 26], [820, 410, 80, 40, 30], [214, 440, 60, 40, 26]];
  const trees = (poly, n, seed, col, colL, s0) => repeat(poly, { n, seed, minDist: 26, size: [0.8, 1.3], draw: (i, x, y, s) => `<g transform="translate(${x} ${y}) scale(${f1(s * s0)})"><rect x="-2" y="-6" width="4" height="12" fill="${col}"/><path d="M0,-40 C14,-34 18,-16 14,-6 C8,0 -8,0 -14,-6 C-18,-16 -14,-34 0,-40 Z" fill="${col}"/><path d="M0,-40 C14,-34 18,-16 14,-6 C10,-10 6,-24 0,-40 Z" fill="${colL}"/></g>` });
  const layers = {
    sky: `<rect x="-900" y="-700" width="3400" height="1800" fill="url(#${P}sky)"/>` +
      rep(90, () => `<circle cx="${f1(-200 + R() * 1600)}" cy="${f1(-100 + R() * 520)}" r="${f1(0.6 + R() * 1.4)}" fill="#fff" opacity="${f1(0.3 + R() * 0.6)}"/>`) +
      `<g id="${P}moon"><circle cx="690" cy="250" r="90" fill="url(#${P}moonH)" data-fx="halo"/><circle cx="690" cy="250" r="26" fill="#e9efff"/><circle cx="680" cy="244" r="22" fill="#cfd9f7"/><circle cx="699" cy="258" r="5" fill="#bfcaf0"/><circle cx="683" cy="252" r="3.5" fill="#bfcaf0"/></g>`,
    far: `<path d="M-300,470 C0,380 200,400 420,360 C620,330 860,380 1400,350 L1400,900 L-300,900 Z" fill="${C.far}"/>`,
    town: `<path d="${townHill}" fill="${C.mid}"/>` + houses.map((h, i) => house(...h, 30 + i)).join("") + trees([[100, 470], [300, 446], [300, 470], [100, 490]], 5, 4, C.tree, C.treeL, 0.6),
    near: `<path d="M-200,560 C80,500 300,520 560,540 C780,556 1000,520 1300,500 L1300,1000 L-200,1000 Z" fill="${C.near}"/>` + trees([[0, 560], [1200, 520], [1200, 620], [0, 640]], 18, 9, C.tree, C.treeL, 1.2),
  };
  return { defs, layers };
}

/** The room: one projection, wall with a real window opening (the inner world shows THROUGH it), owned rims. */
export function room(P) {
  const C = R_ROOM, ob = oblique(0.36, -0.26), R = rng(5);
  const defs = lin(P + "wallG", [[0, "#2a2350"], [1, C.wall]]) + lin(P + "floorG", [[0, C.floor], [1, C.floorS]]) +
    lin(P + "moonbeam", [[0, C.moon, 0.18], [1, C.moon, 0]], 0, 0, 1, 1);
  const wall = `<path fill-rule="evenodd" d="M-900,-700 H2900 V${820} H-900 Z ${WIN_D}" fill="url(#${P}wallG)"/>`;
  // plaster planes: a lighter wall region ABOVE/RIGHT of the window owned by the moon spill (F04.4 atmospheric, bounded)
  const spill = `<path d="M760,240 L1040,330 L1040,820 L760,820 Z" fill="${C.wallL}" opacity=".35"/>`;
  const wains = `<rect x="-900" y="650" width="3800" height="170" fill="${C.wains}"/><rect x="-900" y="644" width="3800" height="10" fill="${C.frame}"/>` +
    rep(16, (i) => `<rect x="${-860 + i * 240}" y="676" width="200" height="118" rx="6" fill="none" stroke="${C.wallS}" stroke-width="5"/>`);
  // window: deep reveal on the near side (oblique side wall), sill with real top face, frame rim owned by the opening
  const reveal = `<path d="M${WIN.x1},300 C${WIN.x1},236 698,${WIN.y0} ${WIN.cx},${WIN.y0} L${WIN.cx + 10},${WIN.y0 + 14} C690,${WIN.y0 + 14} ${WIN.x1 - 12},244 ${WIN.x1 - 12},306 L${WIN.x1 - 12},${WIN.y1} L${WIN.x1},${WIN.y1} Z" fill="${C.frameS}"/>`;
  const rim = `<path d="${WIN_D}" fill="none" stroke="${C.frame}" stroke-width="14" stroke-linejoin="round"/>`;
  const sill = ob.box(WIN.x0 - 26, WIN.y1, WIN.x1 - WIN.x0 + 52, 16, 40, { front: C.frame, side: C.frameS, top: "#5c53a0" });
  const curtain = surf(P + "curtain", `M${WIN.x1 + 4},${WIN.y0 + 4} C${WIN.x1 + 40},${WIN.y0 + 60} ${WIN.x1 + 30},380 ${WIN.x1 + 56},${WIN.y1 + 40} L${WIN.x1 + 96},${WIN.y1 + 40} C${WIN.x1 + 80},380 ${WIN.x1 + 96},260 ${WIN.x1 + 70},${WIN.y0 - 10} Z`, { base: "#7b3f6e", shade: "#4e2550", k: 10, inner: rep(4, (i) => `<path d="M${WIN.x1 + 30 + i * 14},${WIN.y0 + 30} C${WIN.x1 + 40 + i * 14},300 ${WIN.x1 + 34 + i * 14},420 ${WIN.x1 + 52 + i * 12},${WIN.y1 + 40}" stroke="#5c2c5c" stroke-width="3" fill="none"/>`) });
  const rod = `<rect x="${WIN.x0 - 40}" y="${WIN.y0 - 30}" width="${WIN.x1 - WIN.x0 + 150}" height="8" rx="4" fill="${C.iron}"/>`;
  // shelf with jars (oblique box; jars stand ON the top face)
  const shelf = ob.box(1260, 400, 300, 16, 46, { front: C.wood, side: C.woodS, top: C.woodT }) +
    `<path d="M1280,416 l16,40 h-10Z M1530,416 l-16,40 h10Z" fill="${C.woodS}"/>` +
    [[1290, 30, 52, "#3f7f9a"], [1340, 24, 40, "#c06a5a"], [1386, 34, 64, "#5a8f6e"], [1440, 22, 34, "#d2a046"], [1484, 28, 48, "#6b5aa6"]].map(([x, w, h, c], i) =>
      surf(P + "jar" + i, `M${x},392 L${x},${392 - h + 8} Q${x},${392 - h} ${x + 6},${392 - h} L${x + w - 6},${392 - h} Q${x + w},${392 - h} ${x + w},${392 - h + 8} L${x + w},392 Z`, { base: c, shade: recede(c, "#120c2a", 0.35), k: 6, inner: `<rect x="${x + 4}" y="${392 - h + 12}" width="4" height="${h - 20}" fill="#fff" opacity=".25"/>` })).join("");
  // lantern bracket + chain + hook (the lantern hangs here until gripped)
  const bracket = `<path d="M1176,250 V320 M1176,262 H1096 M1120,262 L1176,300" stroke="${C.iron}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="1176" cy="250" r="8" fill="${C.iron}"/>` +
    rep(9, (i) => `<ellipse cx="1096" cy="${272 + i * 18}" rx="${i % 2 ? 3 : 5}" ry="8" fill="none" stroke="#4a4180" stroke-width="3"/>`) +
    `<path d="M1096,432 C1096,448 1108,450 1110,440" stroke="#4a4180" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  const floor = `<rect x="-900" y="820" width="3800" height="900" fill="url(#${P}floorG)"/>` +
    rep(9, (i) => `<path d="M-900,${f1(836 + i * i * 6 + i * 14)} H2900" stroke="${C.board}" stroke-width="${2 + i * 0.4}"/>`) +
    rep(26, (i) => { const x = -700 + i * 150 + (i % 3) * 20, y = 840 + (i % 5) * 46; return `<path d="M${x},${y} l${36 + (i % 4) * 10},0" stroke="${C.floorS}" stroke-width="3" opacity=".7"/>`; }) +
    `<path id="${P}beam" d="M430,830 L780,830 L1120,1080 L520,1080 Z" fill="url(#${P}moonbeam)"/>`;
  const rug = `<path d="M560,900 L1480,900 L1560,1000 L480,1000 Z" fill="#5a2f5e"/><path d="M590,912 L1452,912 L1520,988 L520,988 Z" fill="none" stroke="#b5714e" stroke-width="5"/>`;
  // table (front-right) and a cup: tabletop is a real top face; legs touch the floor (F10 support)
  const table = ob.box(1460, 800, 330, 26, 150, { front: C.wood, side: C.woodS, top: C.woodT }) +
    `<rect x="1476" y="826" width="18" height="150" fill="${C.woodS}"/><rect x="1760" y="826" width="18" height="150" fill="${C.woodS}"/><rect x="1530" y="790" width="14" height="80" fill="#3f2840" opacity=".5"/>` +
    surf(P + "cup", "M1560,800 L1564,764 L1600,764 L1604,800 Z", { base: "#e5d7f2", shade: "#a998c6", k: 5, inner: `<rect x="1560" y="770" width="46" height="6" fill="#c06a5a"/>` }) + `<path d="M1602,772 C1618,772 1618,792 1601,792" stroke="#e5d7f2" stroke-width="5" fill="none"/>`;
  // near-foreground: a leggy plant in a pot (darker, larger, separate parallax plane — F11 foreground stratum)
  const leaves = rep(9, (i) => { const a = -120 + i * 16 + (i % 2) * 5, L = 110 + (i % 3) * 36; const x2 = Math.cos(a * Math.PI / 180) * L, y2 = Math.sin(a * Math.PI / 180) * L; return `<g id="${P}leaf${i}" data-b="150,890" transform="translate(150 890)"><path d="M0,0 Q${f1(x2 * 0.4)},${f1(y2 * 0.6)} ${f1(x2)},${f1(y2)}" stroke="#0e0b24" stroke-width="5" fill="none"/><path d="M${f1(x2)},${f1(y2)} C${f1(x2 * 0.8 + 16)},${f1(y2 * 0.8)} ${f1(x2 * 0.7)},${f1(y2 * 0.7 + 18)} ${f1(x2 * 0.62)},${f1(y2 * 0.62)} C${f1(x2 * 0.8 - 16)},${f1(y2 * 0.8)} ${f1(x2 * 0.9)},${f1(y2 * 0.9 - 14)} ${f1(x2)},${f1(y2)} Z" fill="#150f33"/></g>`; });
  const fg = `<g id="${P}plant">${leaves}<path d="M96,890 L204,890 L192,1000 L108,1000 Z" fill="#1d1538"/><rect x="88" y="880" width="124" height="18" rx="6" fill="#2a1f4c"/></g>` +
    `<path d="M1830,700 L1990,700 L1990,1100 L1830,1100 Z" fill="#120d29"/><path d="M1840,700 C1840,640 1980,640 1990,700" fill="#120d29"/>`;
  return {
    defs,
    wall: wall + spill + wains + reveal + rim + rod + curtain + sill + shelf + bracket,
    floor: floor + rug,
    table,
    fg,
    surfs: ["curtain", "cup", "jar0", "jar1", "jar2", "jar3", "jar4"].map((s) => P + s),
  };
}

/** Lantern: folded paper lantern whose outline is resampled to the star's topology (F14: real geometry change). */
export const LANTERN_D = "M0,18 C30,20 44,46 42,74 C40,102 24,118 0,120 C-24,118 -40,102 -42,74 C-44,46 -30,20 0,18 Z";
export const [LAN_A, LAN_B] = morphable([LANTERN_D, shape.star(0, 70, 66, 28, 5, -90)], 80, 0.32);
export function lantern(id) {
  const pleats = rep(5, (i) => { const x = -28 + i * 14; return `<path d="M${x},22 C${x * 1.5},50 ${x * 1.5},92 ${x},118" stroke="#d99a52" stroke-width="2.6" fill="none"/>`; });
  const facets = rep(5, (i) => {
    const a = (-90 + i * 72) * Math.PI / 180, b1 = (-90 + i * 72 - 36) * Math.PI / 180, b2 = (-90 + i * 72 + 36) * Math.PI / 180;
    const tip = [Math.cos(a) * 66, 70 + Math.sin(a) * 66], l = [Math.cos(b1) * 28, 70 + Math.sin(b1) * 28], r = [Math.cos(b2) * 28, 70 + Math.sin(b2) * 28];
    return `<path d="M0,70 L${f1(l[0])},${f1(l[1])} L${f1(tip[0])},${f1(tip[1])}Z" fill="#fff8d8"/><path d="M0,70 L${f1(tip[0])},${f1(tip[1])} L${f1(r[0])},${f1(r[1])}Z" fill="#ffd56a"/>`;
  });
  const inner = `<g id="${id}-pleats">${pleats}<rect x="-42" y="40" width="84" height="5" fill="#d99a52" opacity=".7"/><rect x="-42" y="96" width="84" height="5" fill="#d99a52" opacity=".7"/></g>` +
    `<g id="${id}-facets" opacity="0">${facets}</g>`;
  return `<g id="${id}-glow" data-fx="halo"><circle id="${id}-halo" cx="0" cy="70" r="150" fill="url(#${id}-hg)" opacity=".7"/></g>
    <defs><radialGradient id="${id}-hg"><stop offset="0" stop-color="#ffd56a" stop-opacity=".55"/><stop offset=".4" stop-color="#ffb84a" stop-opacity=".16"/><stop offset="1" stop-color="#ffb84a" stop-opacity="0"/></radialGradient></defs>
    <circle cx="0" cy="0" r="8.5" fill="none" stroke="#c89a3c" stroke-width="3.6"/>
    <path d="M-12,8 L12,8 L16,20 L-16,20 Z" fill="#a8792c"/>
    ${surf(id + "-body", LAN_A, { base: "#f6d083", shade: "#d18e45", k: 9, inner: `<circle id="${id}-core" cx="0" cy="70" r="24" fill="#fff4c4" opacity=".75"/>` + inner })}
    <g id="${id}-tassel"><path d="M0,120 V140" stroke="#a8792c" stroke-width="3"/><circle cx="0" cy="144" r="5" fill="#c06a5a"/></g>`;
}

export const construction = [
  { id: "room", family: "FUNCTIONAL_INTERIOR", kind: "world", decisions: [
    { method: "F37", applies: "interior must be a world, not a backdrop", visible: "wall/wainscot/floor/window/shelf/table/foreground plant on separate strata", ops: ["stratum"], components: ["wall", "floor", "fg"] },
    { method: "F38", applies: "all built props share one projection", visible: "sill, shelf, table top faces recede along one oblique vector", ops: ["oblique"], components: ["wall", "table"] },
    { method: "F10", applies: "props are supported", visible: "jars stand on the shelf top, table legs reach the floor, cup on tabletop", ops: ["oblique", "surf"], components: ["r-jar0", "r-cup"] },
    { method: "F48", applies: "window shows another place", visible: "complete inner world with its own strata visible through a real opening, rim over it", ops: ["local:innerWorld"], components: ["iwsky", "iwtown"] },
    { method: "F76", applies: "repeated windows/trees", visible: "lit windows sit on house front planes; trees seeded inside hill polygons", ops: ["repeat", "oblique"], components: ["iwtown", "iwnear"] },
    { method: "F11", applies: "foreground/background strata", visible: "dark near plant plane with own parallax and sway", ops: ["MN.sway", "MN.camera"], components: ["fg"] },
    { method: "F51", applies: "scene palette as roles", visible: "cool indigo env; warm lantern is the single focal accent; recede tone measured", ops: ["roles"], components: ["wall"] },
  ] },
  { id: "lantern", family: "PROP_TRANSFORMING", kind: "object", decisions: [
    { method: "F14", applies: "lantern → star is a real state change", visible: "outline resampled to a common 80-point topology and interpolated; pleats retire, facets arrive inside the same parent", ops: ["morphable"], components: ["lan-body-d", "lan-facets"] },
    { method: "F13", applies: "luminous object", visible: "core and facets are drawn structure; halo is a separate fx layer", ops: ["emissive", "surf"], components: ["lan-core", "lan-halo"] },
    { method: "F63", applies: "glow belongs to the emitter", visible: "nofx render keeps the star legible (facets + core) with halo removed", ops: ["emissive"], components: ["lan-glow"] },
    { method: "F22", applies: "light change is re-lighting, not a grade", visible: "after unfold the lantern is a point light; every attached shade plane re-aims toward it", ops: ["MN.setLight", "surf"], components: ["k-coat-L", "r-cup-L"] },
  ] },
];
