import { C, rng, rep, g, grp, lin, rad, glowStops, f1 } from "./lib.mjs";

export function stars(id, seed, n, w = 1920, h = 1080, scale = 1) {
  const R = rng(seed);
  return grp(id, rep(n, () => {
    const x = R() * w, y = R() * h, r = (0.5 + R() * R() * 2.2) * scale, c = R() < 0.14 ? C.citrus : R() < 0.3 ? C.ice : R() < 0.4 ? "#FFB7A8" : "#fff";
    return r > 1.6 * scale && R() < 0.5
      ? `<path d="M${f1(x)},${f1(y - r * 3.4)} Q${f1(x)},${f1(y)} ${f1(x + r * 3.4)},${f1(y)} Q${f1(x)},${f1(y)} ${f1(x)},${f1(y + r * 3.4)} Q${f1(x)},${f1(y)} ${f1(x - r * 3.4)},${f1(y)} Q${f1(x)},${f1(y)} ${f1(x)},${f1(y - r * 3.4)}Z" fill="${c}"/>`
      : `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="${c}" opacity="${f1(0.45 + R() * 0.55)}"/>`;
  }));
}
export function nebula(P, id, seed, n, colors) {
  const R = rng(seed);
  return grp(id, rep(n, (i) => `<ellipse cx="${f1(R() * 1920)}" cy="${f1(R() * 1080)}" rx="${f1(240 + R() * 520)}" ry="${f1(120 + R() * 280)}" transform="rotate(${f1(R() * 60 - 30)} 960 540)" fill="url(#${P}${colors[i % colors.length]})"/>`));
}
export function spaceDefs(P) {
  return lin(P + "space", [[0, "#060A22"], [0.6, "#0E1640"], [1, "#1C1650"]], 0, 0, 1, 1) +
    rad(P + "nebA", glowStops("#3C57B8", 0.3)) + rad(P + "nebB", glowStops("#7A3C9A", 0.24)) + rad(P + "nebC", glowStops("#1E8A9A", 0.2)) +
    lin(P + "ocean", [[0, "#3FA7E0"], [0.55, "#2460B5"], [1, "#12295F"]], 0, 0, 1, 1) +
    rad(P + "atm", [[0, "#7CDCF5", 0], [0.86, "#7CDCF5", 0], [0.925, "#8FE6FA", 0.75], [0.965, "#5EB8F5", 0.3], [1, "#5EB8F5", 0]]) +
    rad(P + "shadeG", [[0, "#000", 0], [0.55, "#050A24", 0.25], [0.86, "#050A24", 0.86], [1, "#050A24", 0.96]], 0.32, 0.4, 0.82) +
    rad(P + "nightOcean", [[0, "#1B3A7E"], [0.7, "#0E1E50"], [1, "#07102F"]], 0.32, 0.36, 0.8) +
    rad(P + "sunG", [[0, "#FFFDEB"], [0.45, "#FFE27E"], [0.8, "#FFB23C"], [1, "#F4763B"]]) +
    rad(P + "sunHalo", glowStops("#FFC765", 0.75)) +
    lin(P + "land", [[0, "#7ED08E"], [1, "#2F8F6F"]], 0, 0, 1, 1) +
    lin(P + "cross1", [[0, "#7A5238"], [1, "#4C2F2D"]]) +
    `<clipPath id="${P}eclip"><circle r="400"/></clipPath>`;
}
const LAND = [
  "M-292,-214 C-246,-268 -176,-284 -120,-254 C-84,-236 -94,-196 -128,-182 C-152,-170 -160,-140 -142,-112 C-120,-82 -142,-52 -176,-58 C-214,-68 -238,-112 -274,-122 C-310,-134 -320,-182 -292,-214Z",
  "M-124,-34 C-92,-40 -66,-16 -66,22 C-66,62 -86,84 -96,124 C-104,162 -128,190 -144,172 C-158,148 -146,116 -158,84 C-170,48 -160,-26 -124,-34Z",
  "M34,-258 C86,-284 176,-268 232,-224 C282,-184 306,-126 276,-84 C252,-56 212,-72 186,-54 C156,-34 124,-60 92,-58 C62,-58 30,-74 30,-106 C30,-134 58,-140 54,-170 C50,-204 8,-232 34,-258Z",
  "M48,-46 C92,-62 150,-46 170,-8 C192,32 176,84 146,122 C124,150 92,172 76,148 C62,124 72,88 54,60 C36,32 18,-30 48,-46Z",
  "M236,88 C266,74 304,84 310,112 C316,140 280,166 248,156 C222,146 212,102 236,88Z",
  "M-34,258 C10,238 94,246 138,276 C160,296 80,330 2,326 C-60,322 -86,284 -34,258Z",
];
/** Earth globe, r=400 at origin. mode: day | night */
export function earth(P, id, { night = false, seed = 2, cloudsId } = {}) {
  const R = rng(seed);
  const lights = night ? rep(420, () => {
    const CT = [[-210, -170], [-120, 60], [150, -180], [110, 40], [270, 120], [20, 285], [60, -220], [-260, -120]][Math.floor(R() * 8)];
    const a = R() * Math.PI * 2, d = R() * R() * 95, x = CT[0] + Math.cos(a) * d, y = CT[1] + Math.sin(a) * d * 0.8;
    return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(0.8 + R() * 2.1)}" fill="${R() < 0.75 ? "#FFD98A" : "#FFF0DA"}" opacity="${f1(0.5 + R() * 0.5)}"/>`;
  }) : "";
  const clouds = rep(30, () => {
    const a = R() * Math.PI * 2, d = 60 + R() * 320, x = Math.cos(a) * d, y = Math.sin(a) * d, w = 16 + R() * 26, rot = R() * 50 - 25;
    const op = f1(night ? 0.1 : 0.5 + R() * 0.26);
    return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})" fill="#fff" opacity="${op}"><ellipse rx="${f1(w)}" ry="${f1(w * 0.42)}"/><ellipse cx="${f1(w * 0.8)}" cy="${f1(w * 0.12)}" rx="${f1(w * 0.72)}" ry="${f1(w * 0.3)}"/><ellipse cx="${f1(-w * 0.85)}" cy="${f1(w * 0.14)}" rx="${f1(w * 0.6)}" ry="${f1(w * 0.26)}"/><ellipse cx="${f1(w * 0.1)}" cy="${f1(-w * 0.24)}" rx="${f1(w * 0.55)}" ry="${f1(w * 0.3)}"/></g>`;
  });
  return `<g id="${id}" data-b="0,0">
    <circle r="470" fill="url(#${P}atm)"/>
    <g clip-path="url(#${P}eclip)">
      <circle r="400" fill="url(#${P}${night ? "nightOcean" : "ocean"})"/>
      <g id="${id}-spin" data-b="0,0">
        ${LAND.map((d) => `<path d="${d}" fill="${night ? "#16284F" : `url(#${P}land)`}"/><path d="${d}" fill="none" stroke="${night ? "#2C4A87" : "#D9F2B8"}" stroke-width="2.5" opacity=".6"/>`).join("")}
        ${night ? lights : ""}
        ${!night ? rep(40, () => { const x = -300 + R() * 600, y = -270 + R() * 540; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(8 + R() * 18)}" fill="#fff" opacity=".04"/>`; }) : ""}
      </g>
      <g id="${id}-clouds" data-b="0,0">${clouds}</g>
      <circle r="400" fill="url(#${P}shadeG)" opacity="${night ? 0.6 : 0.9}"/>
    </g>
    <circle r="400" fill="none" stroke="#BFEFFF" stroke-width="3" opacity="${night ? 0.5 : 0.8}"/>
  </g>`;
}
/** Small sun disc with halo and flares */
export function sunDisc(P, id, x, y) {
  const R = rng(9);
  return g(id, x, y, `
    <circle r="1500" fill="url(#${P}sunHalo)"/>
    <g id="${id}-fl">${rep(14, (i) => { const a = (i / 14) * 360 + R() * 12, L = 60 + R() * 90; return `<path transform="rotate(${f1(a)})" d="M395,-${f1(12 + R() * 22)} C${f1(395 + L * 0.8)},-${f1(L * 0.5)} ${395 + L},${f1(L * 0.25)} 396,${f1(14 + R() * 18)}" fill="none" stroke="#FFC24A" stroke-width="${f1(2.5 + R() * 4)}" stroke-linecap="round" opacity="${f1(0.4 + R() * 0.4)}"/>`; })}</g>
    <circle r="400" fill="url(#${P}sunG)"/>
    ${rep(620, () => { const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 392; const r = 3 + R() * 7; return `<ellipse cx="${f1(Math.cos(a) * d)}" cy="${f1(Math.sin(a) * d)}" rx="${f1(r)}" ry="${f1(r * 0.76)}" fill="${R() < 0.55 ? "#FFF2B0" : "#E8772B"}" opacity="${f1(0.3 + R() * 0.45)}"/>`; })}
  `);
}
