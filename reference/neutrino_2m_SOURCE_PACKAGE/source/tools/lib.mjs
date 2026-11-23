// Shared SVG art helpers for the neutrino film. All art is generated as static markup.
import fs from "node:fs";
export const C = {
  ink: "#111C3D", ink2: "#0B1330", ultra: "#284F95", ultra2: "#1B3568", sea: "#33C8B7", seaL: "#8FF5E2",
  citrus: "#F3D85F", coral: "#F46E67", coralD: "#C4453F", ice: "#7CDCF5", chalk: "#FFF0DA",
  must: "#E9B23B", mustD: "#C2872A", mustL: "#F8D670", skin: "#D79A6B", skinD: "#B5764D", plum: "#3A2A5E",
};
export function rng(seed) {
  let a = seed >>> 0;
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join("");
export const f1 = (v) => +v.toFixed(1);
export function g(id, x, y, inner, extra = "") {
  return `<g id="${id}" data-b="${x},${y}" transform="translate(${x} ${y})" ${extra}>${inner}</g>`;
}
export const grp = (id, inner, extra = "") => `<g id="${id}" ${extra}>${inner}</g>`;
export function lin(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1, units = "") {
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" ${units ? `gradientUnits="${units}"` : ""}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`).join("")}</linearGradient>`;
}
export function rad(id, stops, cx = 0.5, cy = 0.5, r = 0.5, extra = "") {
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}" ${extra}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ""}/>`).join("")}</radialGradient>`;
}
export const glowStops = (c, a = 1) => [[0, c, a], [0.25, c, a * 0.55], [0.6, c, a * 0.13], [1, c, 0]];

/** Three-point curved spark path: the film's neutrino motif (never a dot, never a circle). */
export const SPARK = "M0,-13 C2,-4 5,-2 12,6.5 C4,3.4 -4,3.4 -12,6.5 C-5,-2 -2,-4 0,-13Z";
/** Flavour morph targets share structure with SPARK so they tween. */
export const SPARK_B = "M0,-15 C5,-6 8,-6 15,0 C8,6 5,6 0,15 C-5,6 -8,6 -15,0 C-8,-6 -5,-6 0,-15Z".replace(/ C-5,6 -8,6 -15,0 C-8,-6 -5,-6 0,-15Z/, " C-6,6 -8,5 -15,0 C-8,-5 -6,-6 0,-15Z");
export function nuDefs(P, color = C.sea, light = C.seaL) {
  return `
  ${lin(P + "tail", [[0, color, 0], [0.7, color, 0.55], [1, light, 1]], 0, 0, 1, 0)}
  ${rad(P + "halo", glowStops(color, 0.8))}
  <g id="${P}nu">
    <rect x="-150" y="-2.2" width="150" height="4.4" rx="2.2" fill="url(#${P}tail)"/>
    <rect x="-62" y="-6" width="62" height="12" rx="6" fill="url(#${P}tail)" opacity="0.28"/>
    <circle r="26" fill="url(#${P}halo)"/>
    <path d="${SPARK}" transform="rotate(90)" fill="${light}" stroke="#fff" stroke-width="1.2" stroke-linejoin="round"/>
  </g>`;
}
export function streakField(P, id, n, sym = "nu") {
  return `<g id="${id}">${rep(n, (i) => `<use id="${id}-${i}" href="#${P}${sym}" opacity="0"/>`)}</g>`;
}
/** A single hero neutrino with a morphable spark head and identity ring */
export function heroNu(id, P, scale = 1) {
  return `<g id="${id}" data-b="0,0"><g transform="scale(${scale})">
    <rect x="-300" y="-3" width="300" height="6" rx="3" fill="url(#${P}tail)"/>
    <rect x="-140" y="-10" width="140" height="20" rx="10" fill="url(#${P}tail)" opacity="0.26"/>
    <circle r="46" fill="url(#${P}halo)"/>
    <path id="${id}-p" d="${SPARK}" transform="rotate(90) scale(1.5)" fill="${C.seaL}" stroke="#fff" stroke-width="1"/>
  </g></g>`;
}
export function label(id, x, y, text, o = {}) {
  const { size = 40, fill = C.chalk, anchor = "start", weight = 700, font = "Outfit", ls = 0, op = 0 } = o;
  return `<g id="${id}" data-b="${x},${y}" transform="translate(${x} ${y})" opacity="${op}"><text class="${font === "Archivo Black" ? "tA" : ""}" font-weight="${weight}" font-size="${size}" fill="${fill}" text-anchor="${anchor}" letter-spacing="${ls}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw || 8}" paint-order="stroke"` : ""} ${o.tid ? `id="${o.tid}"` : ""}>${text}</text></g>`;
}
/** pill tag with leader dot */
export function tag(id, x, y, text, o = {}) {
  const { size = 30, fill = C.ink, bg = C.chalk, w = text.length * size * 0.56 + 46, anchor = "left" } = o;
  const X = anchor === "center" ? -w / 2 : 0;
  return `<g id="${id}" data-b="${x},${y}" transform="translate(${x} ${y})" opacity="0"><rect x="${X}" y="${-size * 0.95}" width="${w}" height="${size * 1.7}" rx="${size * 0.85}" fill="${bg}"/><text x="${X + w / 2}" y="${size * 0.18}" font-weight="700" font-size="${size}" text-anchor="middle" fill="${fill}">${text}</text></g>`;
}

export function sceneFile(id, dur, { defs = "", body = "", script = "", bg = C.ink }) {
  return `<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: ${bg}; }
    #root svg { position: absolute; left: 0; top: 0; }
    #root text { font-family: 'Outfit', sans-serif; }
    #root .tA { font-family: 'Archivo Black', sans-serif; }
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-start="0" data-duration="${dur}">
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}-svg" width="1920" height="1080" viewBox="0 0 1920 1080" data-layout-ignore style="overflow:hidden">
      <defs>${defs}</defs>
      ${body}
    </svg>
  </div>
  <script>
  (function(){
    const S = NU.scene(${JSON.stringify(id)}, ${dur});
    ${script}
    S.done();
  })();
  </script>
</template>
`;
}
export function writeScene(id, dur, o) {
  fs.mkdirSync("compositions", { recursive: true });
  fs.writeFileSync(`compositions/${id}.html`, sceneFile(id, dur, o));
}

/** Character: mustard raincoat, asymmetric coral curl, teal boots. Hips at origin; ~560 tall. */
export function charDefs(P) {
  return `
  ${lin(P + "coat", [[0, C.mustL], [0.34, C.must], [1, C.mustD]], 0, 0, 1, 0.3)}
  ${lin(P + "skin", [[0, "#E8AE80"], [1, C.skinD]], 0, 0, 1, 1)}
  ${lin(P + "hair", [[0, "#FF8B7E"], [1, "#C8403F"]], 0, 0, 1, 1)}
  ${lin(P + "canopy", [[0, "#FF8F85"], [0.55, C.coral], [1, "#B93B42"]], 0, 0, 1, 0.5)}
  ${lin(P + "boot", [[0, "#2FA6A0"], [1, "#14605F"]], 0, 0, 1, 1)}`;
}
function hand(id) {
  // palm + three fingers + thumb. fingers rotate for spread/grip.
  const fin = (n, x, y, a) => `<g id="${id}${n}" data-b="${x},${y}" transform="translate(${x} ${y})"><path d="M0,0 L0,17" stroke="${C.skin}" stroke-width="8.5" stroke-linecap="round"/></g>`;
  return `${fin(1, -9, 7)}${fin(2, 0, 10)}${fin(3, 9, 7)}
  <path d="M-12,-2 C-16,10 -6,16 2,15 C12,15 16,6 12,-4Z" fill="${C.skin}"/>
  <path d="M10,0 C18,3 21,8 21,13" stroke="${C.skin}" stroke-width="8" fill="none" stroke-linecap="round"/>`;
}
function arm(p, side, inner = "") {
  const sign = side === "L" ? -1 : 1;
  const sh = side === "L" ? "#D9A02F" : C.mustD;
  return g(`${p}arm${side}`, sign * 60, -176,
    `<path d="M0,0 L0,92" stroke="${side === "L" ? C.mustL : C.must}" stroke-width="40" stroke-linecap="round"/>
     <path d="M${sign * 13},4 L${sign * 13},92" stroke="${sh}" stroke-width="10" stroke-linecap="round" opacity=".7"/>` +
    g(`${p}fore${side}`, 0, 92,
      `<path d="M0,0 L0,84" stroke="${C.must}" stroke-width="35" stroke-linecap="round"/>
       <path d="M${sign * 11},3 L${sign * 11},84" stroke="${sh}" stroke-width="9" stroke-linecap="round" opacity=".7"/>
       <rect x="-20" y="78" width="40" height="13" rx="6" fill="${C.mustD}"/>` +
      g(`${p}hand${side}`, 0, 92, hand(`${p}hand${side}`) + inner)));
}
export function umbrella(p) {
  const panels = [[-210, -130, "#C8434A"], [-130, -44, C.coral], [-44, 44, "#FF8F85"], [44, 130, C.coral], [130, 210, "#C8434A"]];
  const arcs = panels.map(([a, b, col], i) => {
    const m = (a + b) / 2;
    return `<path d="M0,-96 C${m * 0.7},-90 ${a * 0.98},-40 ${a},18 Q${m},-12 ${b},18 C${b * 0.98},-40 ${m * 0.7},-90 0,-96Z" fill="${col}"/>`;
  }).join("");
  return g(`${p}umb`, 0, 6,
    `<path d="M0,28 L0,-222" stroke="#E7D8BE" stroke-width="7" stroke-linecap="round"/>
     <path d="M0,26 q0,30 -22,30" stroke="#8C3A3E" stroke-width="9" fill="none" stroke-linecap="round"/>` +
    g(`${p}canopyG`, 0, -212, `
      <path d="M-210,18 C-200,-62 -100,-100 0,-100 C100,-100 200,-62 210,18 Q168,-10 130,18 Q88,-10 44,18 Q0,-12 -44,18 Q-88,-10 -130,18 Q-168,-10 -210,18Z" fill="url(#${p}canopy)"/>
      ${arcs}
      <path d="M-186,-18 C-150,-70 -80,-90 -30,-92" stroke="#FFD1C9" stroke-width="6" fill="none" stroke-linecap="round" opacity=".7"/>
      <path d="M0,-100 L0,-122" stroke="#E7D8BE" stroke-width="7" stroke-linecap="round"/>
      <circle cy="-124" r="6" fill="${C.citrus}"/>`));
}
export function character(p, { withUmbrella = true } = {}) {
  const hipL = g(`${p}legL`, -26, 34,
    `<path d="M0,0 L0,92" stroke="#2A3564" stroke-width="38" stroke-linecap="round"/>` +
    g(`${p}shinL`, 0, 92, `<path d="M0,0 L0,70" stroke="#2A3564" stroke-width="33" stroke-linecap="round"/>
      <path d="M-22,12 L22,12 L24,72 C24,72 26,92 44,96 C54,100 54,112 44,112 L-22,112 Z" transform="scale(-1,1)" fill="url(#${p}boot)"/>
      <rect x="-48" y="108" width="72" height="9" rx="4" fill="#0E3E44"/>
      <rect x="-23" y="14" width="46" height="9" fill="#54D2C6" opacity=".55"/>`));
  const hipR = g(`${p}legR`, 26, 34,
    `<path d="M0,0 L0,92" stroke="#222C57" stroke-width="38" stroke-linecap="round"/>` +
    g(`${p}shinR`, 0, 92, `<path d="M0,0 L0,70" stroke="#222C57" stroke-width="33" stroke-linecap="round"/>
      <path d="M-22,12 L22,12 L24,72 C24,72 26,92 44,96 C54,100 54,112 44,112 L-22,112 Z" fill="url(#${p}boot)"/>
      <rect x="-24" y="108" width="72" height="9" rx="4" fill="#0E3E44"/>
      <rect x="-23" y="14" width="46" height="9" fill="#54D2C6" opacity=".55"/>`));
  const coat = `
    <path d="M-60,-196 C-78,-120 -98,-10 -112,100 Q-60,122 0,120 Q60,122 112,100 C98,-10 78,-120 60,-196 Q0,-224 -60,-196Z" fill="url(#${p}coat)"/>
    <path d="M26,-208 C50,-120 66,-20 72,114 Q96,108 112,100 C98,-10 78,-120 60,-196 Q44,-204 26,-208Z" fill="${C.mustD}" opacity=".55"/>
    <path d="M-59,-194 C-76,-120 -96,-10 -110,98" stroke="#FFEFA8" stroke-width="5" fill="none" opacity=".75" stroke-linecap="round"/>
    <path d="M0,-212 L3,118" stroke="#A9741F" stroke-width="4" opacity=".8"/>
    ${[-160, -105, -50, 5, 60].map((y) => `<rect x="-11" y="${y}" width="24" height="9" rx="4.5" fill="${C.ultra}"/><circle cx="-14" cy="${y + 4.5}" r="3" fill="${C.chalk}"/>`).join("")}
    <path d="M-76,20 l52,-8 l2,44 q-26,10 -50,4Z" fill="#D49A2C"/><path d="M-78,18 l56,-8 l1,13 l-58,8Z" fill="${C.mustL}"/>
    <path d="M26,12 l52,8 l3,48 q-30,6 -53,-2Z" fill="#B57C22"/><path d="M24,10 l56,8 l1,13 l-57,-8Z" fill="#DDA42F"/>
    <path d="M-60,-200 Q0,-168 60,-200 Q50,-232 0,-234 Q-50,-232 -60,-200Z" fill="#CF9326"/>
    <path d="M-42,-206 Q0,-184 42,-206 L30,-226 Q0,-212 -30,-226Z" fill="${C.mustL}"/>`;
  const face = `
    <g id="${p}eyeL" data-b="-26,-8" transform="translate(-26 -8)"><ellipse rx="14" ry="16.5" fill="#FFF7EA"/>${g(`${p}pupL`, 0, 0, `<circle r="8.6" fill="${C.ink}"/><circle cx="2.6" cy="-3.2" r="2.8" fill="#fff"/>`)}</g>
    <g id="${p}eyeR" data-b="26,-8" transform="translate(26 -8)"><ellipse rx="14" ry="16.5" fill="#FFF7EA"/>${g(`${p}pupR`, 0, 0, `<circle r="8.6" fill="${C.ink}"/><circle cx="2.6" cy="-3.2" r="2.8" fill="#fff"/>`)}</g>
    ${g(`${p}browL`, -27, -34, `<path d="M-15,2 Q0,-7 15,1" stroke="#7A2B31" stroke-width="7" fill="none" stroke-linecap="round"/>`)}
    ${g(`${p}browR`, 27, -34, `<path d="M-15,1 Q0,-7 15,2" stroke="#7A2B31" stroke-width="7" fill="none" stroke-linecap="round"/>`)}
    <path d="M1,4 q7,12 -1,16" stroke="${C.skinD}" stroke-width="5" fill="none" stroke-linecap="round"/>
    <ellipse cx="-44" cy="16" rx="13" ry="8" fill="${C.coral}" opacity=".4"/><ellipse cx="44" cy="16" rx="13" ry="8" fill="${C.coral}" opacity=".4"/>
    <g id="${p}mouth-m"><path d="M-13,36 Q0,44 13,36" stroke="#6E2B2B" stroke-width="6" fill="none" stroke-linecap="round"/></g>
    <g id="${p}mouth-o" opacity="0"><ellipse cy="38" rx="11" ry="14" fill="#6E2B2B"/><ellipse cy="43" rx="6" ry="5" fill="${C.coral}"/></g>
    <g id="${p}mouth-smile" opacity="0"><path d="M-22,31 Q0,54 22,31 Q0,38 -22,31Z" fill="#6E2B2B" stroke="#6E2B2B" stroke-width="4" stroke-linejoin="round"/></g>
    <g id="${p}mouth-grin" opacity="0"><path d="M-25,29 Q0,62 25,29Z" fill="#6E2B2B"/><path d="M-20,30.5 Q0,36 20,30.5 L18,35 Q0,40 -18,35Z" fill="#fff"/></g>
    <g id="${p}mouth-frown" opacity="0"><path d="M-14,43 Q0,31 14,43" stroke="#6E2B2B" stroke-width="6" fill="none" stroke-linecap="round"/></g>
    <g id="${p}mouth-flat" opacity="0"><path d="M-14,38 L13,36" stroke="#6E2B2B" stroke-width="6" fill="none" stroke-linecap="round"/></g>`;
  const head = g(`${p}head`, 0, -66, `
    <g id="${p}hairb" data-b="0,0"><path d="M-74,-42 C-92,14 -74,48 -56,50 L60,48 C78,30 88,-10 72,-48 C50,-104 -50,-104 -74,-42Z" fill="#B53A3A"/></g>
    <circle cx="-73" cy="4" r="14" fill="${C.skinD}"/>
    <circle cx="73" cy="4" r="14" fill="${C.skinD}"/>
    <path d="M-66,-32 C-70,40 -30,72 0,72 C32,72 70,40 66,-32 C60,-84 -60,-84 -66,-32Z" fill="url(#${p}skin)"/>
    <path d="M28,66 C50,56 66,26 66,-30 C66,-44 60,-54 52,-62 C62,0 48,44 28,66Z" fill="${C.skinD}" opacity=".55"/>
    <g id="${p}face" data-b="0,0">${face}</g>
    <path d="M-70,-26 C-78,-82 -30,-104 8,-102 C50,-104 80,-72 72,-20 C66,-44 44,-62 16,-60 C-8,-48 -46,-56 -70,-26Z" fill="url(#${p}hair)"/>
    <path d="M-52,-58 C-30,-86 8,-92 34,-84" stroke="#FFC0B0" stroke-width="5" fill="none" stroke-linecap="round" opacity=".7"/>
    ${g(`${p}curl`, -18, -92, `<path d="M0,0 C-30,-34 -66,-34 -70,-70 C-73,-102 -30,-112 -14,-88 C-4,-70 -26,-58 -38,-70" stroke="url(#${p}hair)" stroke-width="20" fill="none" stroke-linecap="round"/>
      <path d="M-58,-82 C-52,-96 -36,-98 -26,-90" stroke="#FFC0B0" stroke-width="4" fill="none" stroke-linecap="round" opacity=".8"/>`)}
  `);
  const neck = g(`${p}neck`, 0, -206, `<path d="M-20,8 L-20,-34 L20,-34 L20,8Z" fill="${C.skinD}"/>` + head);
  const inner = g(`${p}torso`, 0, 0,
    arm(p, "L") + coat + neck +
    arm(p, "R", withUmbrella ? umbrella(p) : ""));
  return grp(`${p}char`,
    g(`${p}root`, 0, 0, g(`${p}hips`, 0, 0, hipL + hipR) + inner));
}
