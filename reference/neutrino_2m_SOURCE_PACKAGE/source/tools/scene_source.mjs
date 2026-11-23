import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, tag, writeScene, f1 } from "./lib.mjs";
import { spaceDefs, earth, stars, nebula } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

function spiral(P, id, cx, cy, sc, tone, n = 280) {
  const R = rng(id.length * 91);
  let s = "";
  for (let i = 0; i < n; i++) {
    const arm = i % 2, k = R(), a = arm * Math.PI + k * 6.2 + (R() - 0.5) * 0.55, r = 18 + k * 340 + (R() - 0.5) * 22;
    s += `<circle cx="${f1(Math.cos(a) * r)}" cy="${f1(Math.sin(a) * r * 0.42)}" r="${f1(0.9 + R() * 2.2)}" fill="${R() < 0.2 ? "#FFB7A8" : R() < 0.5 ? tone : "#fff"}" opacity="${f1(0.35 + R() * 0.65)}"/>`;
  }
  return g(id, cx, cy, `<g transform="scale(${sc}) rotate(-18)"><ellipse rx="370" ry="170" fill="url(#${P}galG)"/>${s}<circle r="30" fill="#FFF7DA"/></g>`);
}
export function buildSource() {
  const P = "o-";
  const start = +(T.s29[0] - 0.05).toFixed(3), DUR = +(T.s30[0] - 0.25 - start).toFixed(3);
  const defs = spaceDefs(P) + nuDefs(P) +
    rad(P + "galG", [[0, "#FFF0C2", 0.95], [0.3, "#8C8CE0", 0.45], [1, "#6A58C8", 0]]) +
    rad(P + "agn", [[0, "#FFFFFF"], [0.14, "#E0F5FF", 0.95], [0.5, "#7CDCF5", 0.35], [1, "#7CDCF5", 0]]) +
    lin(P + "jet", [[0, "#FFFFFF", 0.95], [0.2, "#BCEBFF", 0.65], [1, "#6AA8FF", 0]], 0, 0, 1, 0) +
    lin(P + "line", [[0, "#FFF0DA", 0.5], [1, "#FFF0DA", 0.9]], 0, 0, 1, 0);
  const body = `
  <rect width="1920" height="1080" fill="url(#${P}space)"/>
  ${nebula(P, P + "nb", 9, 8, ["nebA", "nebB", "nebC"])}
  ${grp(P + "st1", stars(P + "s1", 71, 240))}
  ${grp(P + "st2", stars(P + "s2", 72, 80, 1920, 1080, 1.6))}
  ${g(P + "world", 960, 540, `
    <g id="${P}blazar" transform="translate(620 -240)">
      ${spiral(P, P + "gal", 0, 0, 0.66, "#BCD8FF")}
      <g transform="rotate(158)"><polygon points="0,-10 900,-90 900,90 0,10" fill="url(#${P}jet)"/></g>
      <g transform="rotate(-22)"><polygon points="0,-10 620,-70 620,70 0,10" fill="url(#${P}jet)" opacity=".5"/></g>
      ${rep(7, (i) => `<circle id="${P}kn${i}" r="${9 + i % 3 * 4}" fill="#E8F8FF"/>`)}<circle id="${P}core" r="62" fill="url(#${P}agn)"/>
    </g>
    ${g(P + "earthG", -620, 320, `<g transform="scale(.32)">${earth(P, P + "e")}</g>
      <g id="${P}iceDot"><circle cy="130" r="9" fill="#fff"/><circle cy="130" r="26" fill="none" stroke="#7CDCF5" stroke-width="3"/></g>`)}
    <path id="${P}ray" d="M-620,450 L620,-240" stroke="#FFF0DA" stroke-width="5" stroke-linecap="round" stroke-dasharray="1500" stroke-dashoffset="1500"/>
    ${spiral(P, P + "mw", -620, 320, 3.2, "#CFE5FF", 140)}
  `)}
  ${g(P + "spk", 0, 0, `<g transform="scale(2.5)"><use href="#${P}nu"/></g>`, `opacity="0"`)}
  ${tag(P + "tGal", 1190, 90, "another galaxy", { size: 40, bg: "#BCD8FF" })}
  ${tag(P + "tJet", 640, 170, "a violent jet", { size: 40, bg: C.ice })}
  ${tag(P + "tEarth", 120, 700, "us", { size: 36, bg: C.chalk })}
  <rect id="${P}fade" width="1920" height="1080" fill="#050A24" opacity="1"/>
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const D=${DUR};
  S.k(P+"fade",{o:[[0,1],[.35,0,'power2.out'],[D-.42,0],[D-.04,1,'sine.in']]});
  // Arrow from the detector keeps going: Earth is small -> galaxy -> distant galaxy.
  S.k(P+"world",{s:[[0,4.4],[1.5,1,'power3.inOut'],[D-1.2,1.08,'none'],[D-.05,.24,'power3.in']],x:[[0,2600],[1.5,0,'power3.inOut'],[D-1.2,-40,'sine.inOut'],[D-.05,620*.2,'power3.in']],y:[[0,-1400],[1.5,0,'power3.inOut'],[D-1.2,10,'sine.inOut'],[D-.05,-200,'power3.in']]});
  S.k(P+"ray",{"a:stroke-dashoffset":[[.25,1500],[1.65,0,'power2.inOut']],o:[[D-.5,1],[D-.3,.5]]});
  S.k(P+"mw",{o:[[.05,1],[.95,.0]]});
  S.at((T)=>{ S.set(P+"e-spin","r",T*6); S.set(P+"e-clouds","r",T*10);
    S.set(P+"st1","x",-T*8); S.set(P+"st2","x",-T*18);
    for(let i=0;i<7;i++){ const u=(T*.42+i/7)%1, e=S.el(P+"kn"+i), a=158*Math.PI/180; e.setAttribute("cx",(Math.cos(a)*u*800).toFixed(1)); e.setAttribute("cy",(Math.sin(a)*u*800+Math.sin(u*40)*6).toFixed(1)); e.setAttribute("opacity",(Math.sin(u*Math.PI)*.85).toFixed(3)); }
    const b=1+Math.sin(T*22)*.04*NU.clamp((T-1.2)/.4)+Math.sin(T*3.1)*.1; const c=S.el(P+"core"); c.setAttribute("r",(62*b).toFixed(1)); });
  S.k(P+"gal",{s:[[1,1],[D,1.08,'sine.inOut']]});
  S.k(P+"tGal",{o:[[1.55,0],[1.72,1],[D-1.1,1],[D-.9,0]],y:[[1.55,16],[1.8,0,'power3.out']]});
  S.k(P+"tJet",{o:[[1.95,0],[2.1,1],[D-1.1,1],[D-.9,0]],y:[[1.95,16],[2.2,0,'power3.out']]});
  S.k(P+"tEarth",{o:[[1.55,0],[1.72,1],[D-1.1,1],[D-.9,0]]});
  // The messenger itself makes the long trip home: returns along the ray.
  const r0=2.35, r1=D-.7; const A=[1580,300], B=[352,984];
  S.k(P+"spk",{ x:[[r0,A[0]],[r1,B[0],'sine.in']], y:[[r0,A[1]],[r1,B[1],'sine.in']], r:[[0,150.9]], o:[[r0-.01,0],[r0+.1,1],[r1-.02,1],[r1,0]] });
  `;
  writeScene("source", DUR, { defs, body, script, bg: "#060A22" });
}
