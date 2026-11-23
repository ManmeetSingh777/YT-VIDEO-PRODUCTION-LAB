import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, tag, writeScene, f1 } from "./lib.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

// Large hand silhouette; all four views (skin, cross-section, bones) share it for masking.
const HAND = "M770,1180 C740,1020 700,880 620,760 C560,664 490,600 438,520 C410,478 452,428 500,456 C556,488 618,566 672,622 C650,470 610,330 588,206 C576,134 656,110 682,180 C716,296 744,420 776,536 C780,380 772,220 780,84 C786,0 876,-2 880,84 C884,230 872,390 878,532 C908,398 938,262 978,134 C1002,60 1082,88 1062,164 C1030,296 990,430 968,566 C1010,468 1058,358 1110,258 C1146,190 1216,228 1186,300 C1130,430 1070,560 1040,690 C1020,800 1040,1000 1060,1180Z";
function bones(P) {
  const seg = (x0, y0, x1, y1, w) => `<path d="M${x0},${y0} L${x1},${y1}" stroke="#FFF7E8" stroke-width="${w}" stroke-linecap="round"/><circle cx="${x0}" cy="${y0}" r="${w * 0.62}" fill="#FFF7E8"/><circle cx="${x1}" cy="${y1}" r="${w * 0.62}" fill="#FFF7E8"/>`;
  return `<g opacity=".96">
    ${seg(842, 720, 832, 96, 0).replace(/.*/, "")}
    ${seg(780, 760, 650, 660, 42)}${seg(650, 660, 550, 570, 30)}${seg(550, 570, 492, 500, 25)}
    ${seg(800, 760, 742, 540, 44)}${seg(742, 520, 670, 330, 32)}${seg(670, 330, 636, 196, 26)}
    ${seg(850, 760, 828, 520, 46)}${seg(828, 500, 830, 280, 34)}${seg(830, 280, 830, 100, 26)}
    ${seg(900, 760, 920, 530, 44)}${seg(925, 500, 990, 300, 31)}${seg(990, 300, 1024, 146, 25)}
    ${seg(950, 770, 996, 590, 40)}${seg(1006, 570, 1098, 400, 28)}${seg(1098, 400, 1152, 280, 22)}
    ${[[765,800,34],[830,790,36],[895,792,35],[955,808,30],[745,860,32],[812,855,38],[878,858,38],[942,866,30],[790,915,34],[862,915,36],[925,920,28]].map(([x,y,r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#F5EBD8" stroke="#BFD9EA" stroke-width="3"/>`).join("")}
    <path d="M790,975 C780,1040 774,1120 764,1240 L700,1240 C716,1120 724,1040 730,975 C740,950 780,950 790,975Z" fill="#FFF7E8"/>
    <path d="M950,975 C958,1040 968,1120 982,1240 L880,1240 C876,1120 860,1040 858,975 C868,946 938,946 950,975Z" fill="#FFF7E8"/>
  </g>`;
}
function cells(P) {
  const R = rng(29);
  return `<path d="${HAND}" fill="#E48E75"/>
  ${rep(150, (i) => {
    const x = 400 + R() * 860, y = 40 + R() * 1120, r = 28 + R() * 26;
    return `<g transform="translate(${f1(x)} ${f1(y)})"><path d="M${-r},0 C${-r},${-r * 0.8} ${r * 0.4},${-r} ${r},${-r * 0.1} C${r},${r} ${-r * 0.5},${r * 0.9} ${-r},0Z" fill="${["#F7B39A", "#EE9E86", "#F9C2A9"][i % 3]}" stroke="#B85C50" stroke-width="3"/><circle r="${f1(r * 0.3)}" fill="#7D3F68"/><circle cx="${f1(r * 0.42)}" cy="${f1(-r * 0.25)}" r="${f1(r * 0.1)}" fill="#D85C60"/><circle cx="${f1(-r * 0.44)}" cy="${f1(r * 0.28)}" r="${f1(r * 0.09)}" fill="#7CDCF5"/></g>`;
  })}`;
}
export function buildBody() {
  const P = "b-";
  const start = +(T.s16[0] - 0.3).toFixed(3), DUR = +(T.s18[0] - 0.3 - start).toFixed(3);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const defs = nuDefs(P) +
    lin(P + "skinG", [[0, "#E8AE80"], [1, "#B5764D"]], 0, 0, 1, 0.6) + lin(P + "cuff", [[0, C.must], [1, C.mustD]]) +
    lin(P + "room", [[0, "#1E3A73"], [1, "#101D45"]]) +
    rad(P + "scan", [[0, "#8EFFE9", 0.28], [0.86, "#8EFFE9", 0.12], [0.99, "#D4FFF6", 1], [1, "#D4FFF6", 0]]) +
    rad(P + "xr", [[0, "#1D4C87"], [1, "#071433"]]) +
    `<clipPath id="${P}handC"><path d="${HAND}"/></clipPath>
     <clipPath id="${P}scanC"><circle id="${P}scanCir" cx="830" cy="560" r="0"/></clipPath>
     <clipPath id="${P}cellC"><circle id="${P}cellCir" cx="800" cy="460" r="0"/></clipPath>`;
  const body = `
  ${grp(P + "bg", `<rect x="-200" y="-200" width="2320" height="1480" fill="url(#${P}room)"/>
    ${rep(14, (i) => `<rect x="${-100 + i * 150}" y="-60" width="10" height="1200" fill="#254A8F" opacity=".35"/>`)}
    <ellipse cx="460" cy="130" rx="260" ry="210" fill="#FFD98A" opacity=".08"/>`)}
  ${streakField(P, P + "fB", 80)}
  ${g(P + "hand", 0, 0, `
    <path d="${HAND}" fill="#0B1330" opacity=".28" transform="translate(16 18)"/>
    <path d="${HAND}" fill="url(#${P}skinG)"/>
    <path d="M1140,300 C1090,420 1040,540 1012,700 C992,830 1012,1040 1032,1180 L1060,1180 C1040,1000 1020,800 1040,690 C1070,560 1130,430 1186,300Z" fill="${C.skinD}" opacity=".6"/>
    <path d="M760,1120 C740,1000 700,890 640,790" stroke="#FFD4AE" stroke-width="10" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M660,790 C760,700 920,720 1010,820 M690,650 C780,600 910,610 980,670" stroke="${C.skinD}" stroke-width="7" fill="none" stroke-linecap="round" opacity=".7"/>
    <path d="M700,1130 C820,1090 960,1090 1100,1130 L1110,1300 L690,1300Z" fill="url(#${P}cuff)"/><path d="M700,1130 C820,1090 960,1090 1100,1130 L1104,1160 C960,1124 820,1124 696,1160Z" fill="${C.mustL}"/>
    <g clip-path="url(#${P}cellC)"><g clip-path="url(#${P}handC)">${cells(P)}</g></g>
    <circle id="${P}ring" cx="800" cy="460" r="0" fill="none" stroke="#FFF0DA" stroke-width="7"/>
    <g clip-path="url(#${P}scanC)">
      <rect x="0" y="-200" width="1920" height="1500" fill="#0A1540"/>
      <path d="${HAND}" fill="url(#${P}xr)" stroke="#7CDCF5" stroke-width="4"/>
      ${bones(P)}
    </g>
    <circle id="${P}sweep" cx="830" cy="560" r="0" fill="url(#${P}scan)"/>
  `)}
  ${streakField(P, P + "fF", 80)}
  ${tag(P + "tSkin", 1240, 300, "skin", { size: 50, bg: C.chalk })}
  ${tag(P + "tBone", 1240, 300, "bone", { size: 50, bg: "#FFF7E8" })}
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const s16=${L("s16")}, s17=${L("s17")}, end=${DUR};
  // Hand enters: same palm from the opening, offered up. Follow-through on arrival, fingers settle.
  S.k(P+"hand",{y:[[0,500],[.32,-14,'power3.out'],[.55,8,'sine.inOut'],[.8,0,'sine.out']],x:[[0,40],[.4,-40,'power3.out'],[end,-70,'sine.inOut']],r:[[0,9],[.5,-2,'power2.out'],[1,0,'sine.inOut']]});
  // Cause: sparks do not slow. Fields share a seed so they enter and exit at the same place.
  const fo={angle:62,speed:1120,seed:31,area:[-200,-200,2320,1480],scale:2.2};
  S.streaks(P+"fB",{...fo,n:80,alpha:1}); S.streaks(P+"fF",{...fo,n:80,alpha:.62});
  // Skin: disc of cells irises open from palm centre, with a hard rim
  const ca=s16+.32;
  S.k(P+"cellCir",{"a:r":[[ca,0],[ca+.55,360,'back.out(1.1)'],[s17-.1,380]]});
  S.k(P+"ring",{"a:r":[[ca,0],[ca+.55,360,'back.out(1.1)'],[s17-.1,380]],o:[[s17-.15,1],[s17+.05,0]]});
  S.k(P+"tSkin",{o:[[ca+.1,0],[ca+.25,1],[s17-.1,1],[s17+.02,0]],s:[[ca+.1,.6],[ca+.4,1,'back.out(2.2)']]});
  // Bones: scan ring grows from the same centre and overwrites
  const xa=s17+.02;
  S.k(P+"scanCir",{"a:r":[[xa,0],[xa+.85,1250,'power2.inOut']]});
  S.k(P+"sweep",{"a:r":[[xa,0],[xa+.85,1250,'power2.inOut']],o:[[xa+.75,1],[xa+.95,0]]});
  S.k(P+"tBone",{o:[[xa+.5,0],[xa+.65,1],[end-.1,1]],s:[[xa+.5,.6],[xa+.8,1,'back.out(2.2)']]});
  // Micro acting in the fingers: a slow flex (reads as alive)
  S.at((T)=>{ S.add(P+"hand","r",Math.sin(T*1.8)*.5); });
  `;
  writeScene("body", DUR, { defs, body, script, bg: "#101D45" });
}
