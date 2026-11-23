import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, charDefs, character, tag, label, writeScene, f1 } from "./lib.mjs";
import { spaceDefs, earth, stars, nebula, sunDisc } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

function ringSector(r0, r1, a0, a1) {
  const rd = (d) => (d * Math.PI) / 180;
  const p = (r, a) => `${f1(Math.cos(rd(a)) * r)},${f1(Math.sin(rd(a)) * r)}`;
  return `M${p(r1, a0)} A${r1},${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0},${r0} 0 0 0 ${p(r0, a0)}Z`;
}
/** limb decoration: mountains + city blocks standing radially on the globe's top arc */
function limbWorld(P) {
  const R = rng(14); let s = "";
  for (let a = -152; a < -28; a += 1.4) {
    const h = R(), rd = (a * Math.PI) / 180, x = Math.cos(rd) * 398, y = Math.sin(rd) * 398, rot = a + 90;
    const mountain = a < -100 || a > -60;
    if (mountain) s += `<path transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})" d="M${f1(-16 - h * 16)},4 L0,${f1(-10 - h * 34)} L${f1(16 + h * 16)},4Z" fill="#0F1C47"/><path transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})" d="M0,${f1(-10 - h * 34)} l-5,10 l10,0Z" fill="#CFE5F5"/>`;
    else s += `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)})"><rect x="-6" y="${f1(-12 - h * 34)}" width="11" height="${f1(16 + h * 34)}" fill="#142454"/>${R() < 0.8 ? `<rect x="-3" y="${f1(-8 - h * 26)}" width="3" height="4" fill="${C.citrus}"/><rect x="1" y="${f1(-4 - h * 12)}" width="3" height="4" fill="#FFE7A8"/>` : ""}</g>`;
  }
  return s;
}
/** Ground cross-section: the close-up that answers "the ground beneath your feet". */
function groundArt(P) {
  const R = rng(61);
  const band = (y, h, col, wob = 26) => { let d = `M-200,${y}`; for (let x = -200; x <= 2120; x += 150) d += ` Q${x + 75},${f1(y + (R() - 0.5) * wob)} ${x + 150},${f1(y + (R() - 0.5) * wob * 0.4)}`; return `<path d="${d} V${y + h} H-200Z" fill="${col}"/>`; };
  let s = `<rect width="1920" height="1080" fill="url(#${P}nsky)"/>${stars(P + "gst", 18, 130, 1920, 560)}
    <path d="M-40,560 L180,370 L320,500 L460,340 L640,520 L760,430 L920,560Z" fill="#1A2C63"/><path d="M180,370 l-34,30 l24,-6 l14,16 l22,-22 l18,12Z M460,340 l-40,44 l26,-10 l18,20 l18,-22 l22,12Z" fill="#CFE5F5"/>
    `;
  // skyline, right
  for (let i = 0; i < 14; i++) { const x = 1160 + i * 60, h = 90 + R() * 170; s += `<rect x="${x}" y="${f1(560 - h)}" width="54" height="${f1(h)}" fill="#14224F"/>${rep(10, () => `<rect x="${f1(x + 5 + R() * 40)}" y="${f1(566 - h + R() * (h - 16))}" width="6" height="9" fill="${R() < 0.2 ? C.coral : "#FFD98A"}" opacity="${f1(0.5 + R() * 0.5)}"/>`)}`; }
  s += band(560, 70, "#2B7A5E", 16) + `<path d="M-200,566 Q900,556 2120,566 V580 H-200Z" fill="#48A878"/>`;
  s += band(620, 110, "#6A4632", 22) + band(720, 120, "#54382D", 30) + band(830, 130, "#3E2C2C", 34) + band(950, 180, "#2E2230", 40);
  // pebbles
  for (let i = 0; i < 140; i++) { const x = R() * 1920, y = 640 + R() * 440; s += `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(5 + R() * 24)}" ry="${f1(3 + R() * 11)}" fill="${["#7E5A42", "#3A2730", "#8A6C5A", "#4A3D4E"][Math.floor(R() * 4)]}" opacity="${f1(0.45 + R() * 0.5)}"/>`; }
  // roots, pipe, fossil, worm, cable: reasons to look twice
  s += `<g stroke="#8C6545" fill="none" stroke-linecap="round"><path d="M1600,560 C1610,620 1570,660 1590,730 M1604,610 C1650,640 1660,690 1710,710 M1590,660 C1540,690 1520,720 1470,740" stroke-width="7"/></g>
    <path d="M1590,560 C1580,480 1590,400 1600,330" stroke="#3B2B2A" stroke-width="26" fill="none"/><circle cx="1600" cy="300" r="74" fill="#1F7A6E"/><circle cx="1560" cy="340" r="52" fill="#2FA79B"/><circle cx="1640" cy="346" r="48" fill="#176458"/>
    <rect x="-20" y="676" width="1000" height="26" fill="#56647E"/><rect x="-20" y="676" width="1000" height="7" fill="#90A4C4"/><rect x="420" y="668" width="24" height="42" fill="#3A4560"/>
    <g transform="translate(1320 880) rotate(-14)" fill="none" stroke="#D4C6AD" stroke-width="8" stroke-linecap="round"><path d="M0,0 C30,-40 80,-40 90,0 C96,28 56,38 48,12 C44,-2 62,-8 66,2"/></g>
    <path id="${P}worm" d="M240,800 q24,-22 48,0 t48,0" stroke="#E88F86" stroke-width="13" fill="none" stroke-linecap="round"/>`;
  return s;
}

export function buildPlanet() {
  const P = "p-";
  const start = +(T.s18[0] - 0.3).toFixed(3), DUR = +(T.s20[0] - 0.12 - start).toFixed(2);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const R = rng(33);
  const defs = spaceDefs(P) + nuDefs(P) + charDefs(P) + charDefs("q-") +
    lin(P + "nsky", [[0, "#07102F"], [0.6, "#16245E"], [1, "#3B3A80"]]) +
    rad(P + "m1", [[0, "#F2A15A"], [1, "#B8402A"]]) + rad(P + "c1", [[0, "#FFF0B5"], [1, "#F2923C"]]) +
    rad(P + "hit", glowStops("#BDF3FF", 1)) +
    rad(P + "sunEdge", glowStops("#FFB84A", 0.62)) +
    `<clipPath id="${P}frameC"><rect width="1920" height="1080"/></clipPath>`;

  const A0 = -8, A1 = 74; // cutaway quadrant lower-right
  const cut = `
    <path d="${ringSector(0, 400, A0, A1)}" fill="#201631"/>
    <path d="${ringSector(366, 400, A0, A1)}" fill="#6A4632"/>
    <path d="${ringSector(390, 400, A0, A1)}" fill="#2B7A5E"/>
    <path d="${ringSector(210, 366, A0, A1)}" fill="url(#${P}m1)"/>
    ${rep(5, (i) => { const a = A0 + 6 + i * 15.5, r = 288; const rd = (a * Math.PI) / 180, x = Math.cos(rd) * r, y = Math.sin(rd) * r; return `<g transform="translate(${f1(x)} ${f1(y)}) rotate(${a + 90})"><path id="${P}mc${i}" d="M-30,-44 C30,-58 40,44 -24,44" fill="none" stroke="#FFD6A0" stroke-width="5" stroke-dasharray="26 16" stroke-linecap="round" opacity=".75"/></g>`; })}
    <path d="${ringSector(100, 210, A0, A1)}" fill="#F7B93E"/>
    <path d="${ringSector(0, 100, A0, A1)}" fill="url(#${P}c1)"/>
    <path d="${ringSector(0, 400, A0, A1)}" fill="none" stroke="#FFF0DA" stroke-width="3.5"/>`;
  const body = `
  <rect width="1920" height="1080" fill="url(#${P}space)"/>
  ${nebula(P, P + "neb", 8, 8, ["nebA", "nebB", "nebC"])}
  ${grp(P + "camFar", stars(P + "s1", 3, 240) + `<ellipse cx="-260" cy="520" rx="760" ry="900" fill="url(#${P}sunEdge)"/>`)}
  ${g(P + "cam", 1010, 560, `
    <g id="${P}planet">
      <g id="${P}backF">${streakField(P, P + "fB", 80)}</g>
      <g transform="scale(1.18)">
        ${earth(P, P + "e", { night: true })}
        ${cut}
        ${g(P + "hitG", 240 * 0.86, 150 * 0.6, `<circle r="70" fill="url(#${P}hit)"/><path d="M-30,0 H30 M0,-30 V30 M-18,-18 L18,18 M-18,18 L18,-18" stroke="#fff" stroke-width="4" stroke-linecap="round"/>`, `opacity="0"`)}
        ${limbWorld(P)}
        ${g(P + "tiny", 0, -400, `<g transform="translate(0 -46) scale(.2)">${character("q-")}</g>`)}
      </g>
      <g id="${P}frontF">${streakField(P, P + "fF", 80)}</g>
    </g>
  `)}
  ${tag(P + "tMost", 80, 150, "most pass straight through", { size: 40, bg: C.seaL })}
  ${tag(P + "tRare", 1280, 960, "a very rare few interact", { size: 34, bg: "#BDF3FF" })}
  <g id="${P}ground" style="display:none">
    ${groundArt(P)}
    ${streakField(P, P + "gB", 60)}
    ${g(P + "gChar", 960, 400, `<g transform="scale(.8)"><ellipse cx="0" cy="210" rx="170" ry="16" fill="#0F2E2C" opacity=".65"/>${character(P)}</g>`)}
    ${streakField(P, P + "gF", 60)}
    ${tag(P + "tDown", 1180, 860, "coming up from below, too", { size: 36, bg: C.seaL })}
  </g>
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const zIn=${L("s19", -0.35)}, g0=${L("s19", 0.0)};
  // Earth drifts in under slow push; spin + clouds; camera goes to Character at s19
  S.k(P+"cam",{ s:[[0,0.86],[zIn,1.0,'sine.inOut'],[g0,9,'power3.in']], x:[[0,40],[zIn,0,'sine.inOut']], y:[[0,20],[zIn,0,'sine.inOut'],[g0,4100,'power3.in']] });
  S.at((T)=>{ S.set(P+"e-spin","r",T*3-12); S.set(P+"e-clouds","r",T*5);
    for(let i=0;i<5;i++) S.set(P+"mc"+i,"a:stroke-dashoffset",-T*60);
    S.set(P+"camFar","x",-T*14);
    S.set(P+"q-pos","x",0);
  });
  const fo={angle:6,speed:1150,area:[-1250,-760,2500,1520],seed:4,span:2900};
  S.streaks(P+"fB",{...fo,n:80,scale:1.5,alpha:1,density:(T)=>NU.clamp(T/0.8)});
  S.streaks(P+"fF",{...fo,n:80,scale:1.5,alpha:0.68,density:(T)=>NU.clamp(T/0.8)});
  // a single rare stop: visually tiny, on purpose
  const h=${L("s18", 3.3)};
  S.k(P+"hitG",{o:[[h,0],[h+.05,1],[h+.8,0,'power2.out']], s:[[h,.25],[h+.14,1.15,'back.out(2)'],[h+.8,.8]]});
  S.k(P+"tMost",{o:[[${L("s18", 0.9)},0],[${L("s18", 1.1)},1],[zIn-.1,1],[zIn+.1,0]], x:[[${L("s18", 0.9)},-30],[${L("s18", 1.25)},0,'power3.out']]});
  S.k(P+"tRare",{o:[[h+.05,0],[h+.2,1],[zIn-.1,1],[zIn+.1,0]], x:[[h+.05,30],[h+.35,0,'power3.out']]});
  // GROUND: a hard-won close-up
  S.show(P+"ground",g0-.08,99);
  const A=S.actor(P,{armR:-22,foreR:10,armL:12,foreL:-14,head:6,faceY:8,lookY:0.9,lookX:0.1,mouth:"m"});
  A.umbTilt=[[0,18]];
  // looks down at boots; lifts a boot in disbelief; eyes follow a streak up through the coat
  A.pose(g0+.2,{head:14,faceY:12,lookY:1,brow:0.7,torso:4,mouth:"o"},.3);
  A.pose(g0+.65,{legL:-24,shinL:42,squash:.08,armL:62,foreL:-24,spread:1,torso:-3,lookX:-.8},.3,"back.out(1.4)");
  A.pose(g0+1.2,{head:-6,faceY:-4,lookY:-1,lookX:.5,legL:4,shinL:0,squash:0,torso:0,mouth:"smile",brow:1},.42);
  const go={angle:-78,speed:980,area:[-100,-100,2120,1280],seed:11,scale:1.5};
  S.streaks(P+"gB",{...go,n:60,alpha:1});
  S.streaks(P+"gF",{...go,n:60,alpha:.45});
  S.k(P+"tDown",{o:[[g0+.55,0],[g0+.7,1],[${DUR - 0.15},1]],x:[[g0+.55,30],[g0+.85,0,'power3.out']]});
  S.at((T)=>{ const u=(Math.sin(T*3)*12).toFixed(1); S.set(P+"worm","transform",""); S.set(P+"worm","d",\`M240,800 q24,\${-22+ +u} 48,0 t48,0\`); });
  `;
  writeScene("planet", DUR, { defs, body, script, bg: "#060A22" });
}
