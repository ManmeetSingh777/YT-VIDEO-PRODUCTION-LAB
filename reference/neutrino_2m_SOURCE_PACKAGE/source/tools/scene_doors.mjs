import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, charDefs, character, tag, label, writeScene, f1 } from "./lib.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

function atom(P, id, x, y, r = 92) {
  return g(id, x, y, `<circle r="${r}" fill="url(#${P}cloud)"/><circle r="${f1(r * 0.62)}" fill="url(#${P}cloud2)"/>
    <circle r="11" fill="${C.coral}"/><circle cx="-3" cy="-3" r="3" fill="#fff"/><circle id="${id}-e" cx="${r - 18}" r="7" fill="${C.ice}"/>`);
}
function house(P, x, w, h, col, doorIdx, seed) {
  const R = rng(seed);
  const y = 840 - h;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}"/>
    <polygon points="${x - 14},${y} ${x + w * 0.5},${y - 72 - R() * 26} ${x + w + 14},${y}" fill="#1B1F52"/>
    <rect x="${x - 10}" y="${y + 2}" width="${w + 20}" height="14" fill="#FFF0DA" opacity=".62"/>
    <rect x="${x + w - 58}" y="${f1(y - 58)}" width="24" height="58" fill="#3D2A43"/>`;
  for (let r = 0; r < Math.floor((h - 190) / 96); r++) for (let c = 0; c < 3; c++) {
    const wx = x + 22 + c * ((w - 44) / 3) + 7, wy = y + 40 + r * 96;
    const lit = R() < 0.72;
    s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="${f1((w - 44) / 3 - 14)}" height="62" fill="#14183F"/><rect x="${f1(wx + 4)}" y="${f1(wy + 4)}" width="${f1((w - 44) / 3 - 22)}" height="54" fill="${lit ? (R() < 0.4 ? "#FFD98A" : "#FFE7A8") : "#232A66"}" opacity="${lit ? 0.92 : 1}"/><path d="M${f1(wx + (w - 44) / 6 - 7)},${f1(wy + 4)} V${f1(wy + 58)}" stroke="#14183F" stroke-width="3"/>`;
  }
  const dx = x + w / 2 - 44;
  s += `<rect x="${f1(dx - 34)}" y="670" width="${88 + 68}" height="170" fill="${col}"/>
    <g id="${P}door${doorIdx}"><rect x="${f1(dx)}" y="680" width="88" height="160" rx="8" fill="none" stroke="#FFF0DA" stroke-width="4" stroke-dasharray="11 10"/>
    <circle cx="${f1(dx + 72)}" cy="766" r="5" fill="#FFF0DA" opacity=".7"/></g>
    <rect x="${f1(dx - 8)}" y="838" width="104" height="9" fill="#FFF0DA" opacity=".35"/>`;
  return s;
}
export function buildDoors() {
  const P = "d-";
  const start = +(T.s20[0] - 0.12).toFixed(3), DUR = +(T.s23[0] + 0.9 - start).toFixed(3);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const R = rng(5);
  const atoms = []; const gridX = 8, gridY = 5;
  for (let r = 0; r < gridY; r++) for (let c = 0; c < gridX; c++) atoms.push([140 + c * 236 + (r % 2 ? 118 : 0), 80 + r * 230]);
  const defs = nuDefs(P) + charDefs(P) +
    rad(P + "cloud", [[0, "#4C86D5", 0.72], [0.7, "#4C86D5", 0.38], [1, "#4C86D5", 0]]) +
    rad(P + "cloud2", [[0, "#7CDCF5", 0.55], [1, "#7CDCF5", 0]]) +
    lin(P + "bgLat", [[0, "#142660"], [1, "#0B1642"]]) +
    lin(P + "skyN", [[0, "#080E2C"], [0.65, "#1D2A6C"], [1, "#54407E"]]) +
    lin(P + "street", [[0, "#2B2A58"], [1, "#14143A"]]) +
    rad(P + "doorG", glowStops(C.citrus, 0.9)) + rad(P + "knock", glowStops("#FFB29E", 1)) +
    rad(P + "lampG", glowStops("#FFE7A8", 0.8));
  const CHARGE = "M-8,0 H8";
  const body = `
  <!-- ATOM LATTICE: the 'matter' stage, unified across myth + charge beats -->
  ${grp(P + "lat", `<rect x="-300" y="-300" width="2520" height="1680" fill="url(#${P}bgLat)"/>
    ${atoms.map(([x, y], i) => atom(P, `${P}at${i}`, x, y)).join("")}
    <g id="${P}holes" opacity="0">${atoms.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="78" fill="#050A24" stroke="#284F95" stroke-width="3"/>`).join("")}</g>
    <path id="${P}chPath" d="M-60,300 C340,300 500,240 740,340 C900,400 980,290 1104,392" fill="none" stroke="${C.coral}" stroke-width="7" stroke-linecap="round" stroke-dasharray="1500" stroke-dashoffset="1500"/>
    ${g(P + "chg", 0, 0, `<circle r="46" fill="url(#${P}knock)"/><circle r="24" fill="${C.coral}"/><path d="${CHARGE}" stroke="#fff" stroke-width="6" stroke-linecap="round"/>`, `opacity="0"`)}
    ${streakField(P, P + "fL", 36)}
    ${g(P + "nuZ", 0, 0, `<g transform="scale(2.7)"><use href="#${P}nu"/></g>`, `opacity="0"`)}
  `)}
  ${tag(P + "tMyth", 660, 150, "“just empty holes”", { size: 50, bg: C.chalk })}
  <path id="${P}xA" d="M640,190 L1190,84" stroke="${C.coral}" stroke-width="15" stroke-linecap="round" stroke-dasharray="620" stroke-dashoffset="620"/>
  ${tag(P + "tCharge", 660, 920, "electric charge: none", { size: 44, bg: C.seaL })}
  ${tag(P + "tChg", 300, 170, "charged particle", { size: 36, bg: "#FFB29E" })}
  ${tag(P + "tBump", 1000, 500, "pushed, slowed, stopped", { size: 32, bg: C.chalk })}
  ${tag(P + "tNuZ", 1130, 820, "neutrino: straight on", { size: 36, bg: C.seaL })}
  ${g(P + "rare", 1370, 400, `<circle r="120" fill="url(#${P}cloud2)"/><path d="M-40,0 H40 M0,-40 V40 M-26,-26 L26,26 M-26,26 L26,-26" stroke="#fff" stroke-width="5" stroke-linecap="round"/>`, `opacity="0"`)}
  ${tag(P + "tRare", 1020, 240, "an interaction: incredibly rare", { size: 36, bg: "#BDF3FF" })}
  <!-- CITY: rows of doors -->
  <g id="${P}city" style="display:none">
    <rect width="1920" height="1080" fill="url(#${P}skyN)"/>
    ${rep(80, () => `<circle cx="${f1(R() * 1920)}" cy="${f1(R() * 460)}" r="${f1(0.8 + R() * 1.3)}" fill="#fff" opacity="${f1(0.4 + R() * 0.5)}"/>`)}
    ${grp(P + "cFar", rep(40, (i) => { const x = -300 + i * 90, h = 150 + R() * 340; return `<rect x="${x}" y="${f1(700 - h)}" width="${f1(70 + R() * 20)}" height="${f1(h)}" fill="#20276A"/>${rep(6, () => `<rect x="${f1(x + 8 + R() * 50)}" y="${f1(710 - h + R() * h * 0.9)}" width="8" height="12" fill="#FFD98A" opacity="${f1(0.4 + R() * 0.5)}"/>`)}`; }))}
    ${grp(P + "cHouses", (() => { let s = "", x = -300; const cols = ["#7A3A4E", "#37507C", "#71453A", "#2F6573", "#59427C", "#804D3D", "#2E5B6E", "#6B3C5B"]; for (let i = 0; i < 16; i++) { const w = 280 + (i % 3) * 36; s += house(P, x, w, 440 + ((i * 37) % 150), cols[i % cols.length], i, 100 + i); x += w + 6; } return s; })())}
    ${g(P + "lastDoor", 3770, 0, `<rect x="-10" y="660" width="108" height="182" rx="10" fill="#150F1E"/><rect id="${P}lastD" x="0" y="680" width="88" height="160" rx="8" fill="${C.citrus}"/><circle cx="48" cy="770" r="210" fill="url(#${P}doorG)"/>`)}
    <rect x="-20" y="840" width="1960" height="260" fill="url(#${P}street)"/>
    <path d="M-20,848 H1960" stroke="#FFF0DA" stroke-width="5" opacity=".2"/>
    ${grp(P + "dash", rep(30, (i) => `<rect x="${-300 + i * 200}" y="955" width="110" height="10" rx="4" fill="#FFF0DA" opacity=".45"/>`))}
    ${g(P + "walker", 660, 660, `<g transform="scale(.72)">${character(P, { withUmbrella: false })}</g>`)}
    ${streakField(P, P + "fC", 30)}
    ${grp(P + "cFg", rep(9, (i) => { const x = -200 + i * 620; return `<g transform="translate(${x} 0)"><rect x="-12" y="330" width="24" height="760" fill="#07092A"/><path d="M0,340 C0,280 80,280 110,296" stroke="#07092A" stroke-width="17" fill="none"/><ellipse cx="112" cy="310" rx="44" ry="19" fill="#07092A"/><circle cx="112" cy="322" r="100" fill="url(#${P}lampG)"/></g>`; }))}
    ${tag(P + "tDoor", 1160, 190, "almost every door: invisible to you", { size: 40, bg: C.seaL })}
    <circle id="${P}qFlash" cx="960" cy="540" r="10" fill="${C.citrus}" opacity="0"/>
  </g>
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const s20=${L("s20")}, s21=${L("s21")}, s22=${L("s22")}, s23=${L("s23")};
  const nA=${atoms.length}, atoms=${JSON.stringify(atoms)};
  // Lattice gently breathes; each electron cloud orbits at own rate
  S.at((T)=>{ for(let i=0;i<nA;i++){ const a=T*(2.3+i%5*.4)+i; const e=S.el(P+"at"+i+"-e"); e.setAttribute("cx",(Math.cos(a)*72).toFixed(1)); e.setAttribute("cy",(Math.sin(a)*42).toFixed(1));
      S.set(P+"at"+i,"x",NU.wig(T,1.5,i)*4); S.set(P+"at"+i,"y",NU.wig(T,1.5,i+60)*4); } });
  S.k(P+"lat",{s:[[0,.94],[s21,1.02,'sine.inOut'],[s22,1.02]]});
  // Myth: for one beat, atoms ARE holes... then the tag is struck, the holes fill back in.
  S.k(P+"holes",{o:[[0,.95],[s20+1.45,.95],[s20+1.95,0,'power2.out']]});
  S.k(P+"tMyth",{o:[[s20+.05,0],[s20+.2,1],[s20+2.0,1],[s20+2.2,0]],s:[[s20+.05,.7],[s20+.32,1,'back.out(2)']]});
  S.k(P+"xA",{"a:stroke-dashoffset":[[s20+1.1,620],[s20+1.42,0,'power3.in']],o:[[s20+2.0,1],[s20+2.2,0]]});
  // Contrast shot: a charged particle in the same matter gets shoved; the neutrino does not care.
  const c0=s20+2.15;
  S.k(P+"chPath",{"a:stroke-dashoffset":[[c0,1500],[c0+1.55,0,'power1.out']],o:[[s22-.8,1],[s22-.4,0]]});
  S.at((T)=>{ const pth=S.el(P+"chPath"); const LEN=pth.getTotalLength(); const p=gsap.parseEase("power1.out")(NU.clamp((T-c0)/1.55)); const q=pth.getPointAtLength(p*(LEN-2));
    const jolt=p>.88?0:Math.sin(T*25)*3; S.set(P+"chg","x",q.x); S.set(P+"chg","y",q.y+jolt); });
  S.k(P+"chg",{o:[[c0-.02,0],[c0+.1,1],[s22-.85,1],[s22-.4,0]],s:[[c0+1.4,1],[c0+1.55,.72,'power2.out']]});
  S.k(P+"tChg",{o:[[c0+.1,0],[c0+.28,1],[c0+1.7,1],[c0+1.9,0]]});
  S.k(P+"tBump",{o:[[c0+1.35,0],[c0+1.5,1],[s22-.85,1],[s22-.4,0]]});
  // The same-size spark goes straight, in one continuous line.
  const n0=c0+.75;
  S.k(P+"nuZ",{x:[[n0,-100],[n0+.95,2100,'none']],y:[[n0,700],[n0+.95,700,'none']],o:[[n0,0],[n0+.04,1],[n0+.94,1],[n0+.95,0]]});
  S.k(P+"tCharge",{o:[[n0+.1,0],[n0+.25,1],[s22-.3,1],[s22-.1,0]],y:[[n0+.1,20],[n0+.35,0,'power3.out']]});
  S.k(P+"tNuZ",{o:[[n0+.1,0],[n0+.25,1],[n0+1.7,1],[n0+1.9,0]]});
  // "incredibly rarely": a flood; then one single flash
  S.streaks(P+"fL",{n:36,angle:0,speed:1600,seed:7,scale:1.3,alpha:.85,area:[-200,-100,2320,1280],density:(T)=>S.ev([[n0+1.1,0],[n0+1.6,1]],T)});
  const rr=s22-1.15;
  S.k(P+"rare",{o:[[rr-.02,0],[rr+.03,1],[rr+.75,0,'power2.out']],s:[[rr,.3],[rr+.2,1.2,'back.out(2)'],[rr+.8,.9]]});
  S.k(P+"tRare",{o:[[rr+.02,0],[rr+.15,1],[s22-.12,1],[s22,0]]});
  // CITY: the person walks: each door they pass is only an outline.
  S.show(P+"city",s22-.01,999);
  const a=S.actor(P,{armL:14,foreL:-30,armR:-14,foreR:30,head:0,faceX:14,lookX:.8,lookY:-.1,mouth:"m"});
  // Walk cycle: pure function of its own phase, with contact bob and arm counter-swing.
  S.at((T)=>{ if(T<s22-.1) return; const st=NU.clamp((T-s22)/.35); const end=NU.clamp((${DUR}-.9-T)/.5); const w=(T-s22)*6.1; const amp=st*end;
    const legA=Math.sin(w)*30*amp, legB=-legA;
    S.set(P+"legL","r",legA); S.set(P+"legR","r",legB);
    S.set(P+"shinL","r",Math.max(0,-Math.cos(w))*36*amp); S.set(P+"shinR","r",Math.max(0,Math.cos(w))*36*amp);
    S.add(P+"root","y",-Math.abs(Math.sin(w))*11*amp+3); S.add(P+"torso","r",3*amp+Math.sin(w*2)*1.2*amp);
    S.set(P+"armL","r",14-legA*.7); S.set(P+"foreL","r",-30); S.set(P+"armR","r",-14+legA*.7); S.set(P+"foreR","r",30);
  });
  a.pose(s22+1.3,{faceX:16,lookX:1,lookY:-.2,brow:.6,head:-3},.3);
  a.pose(s22+2.2,{head:-6,lookX:.9,lid:.85,mouth:"smile"},.4);
  a.pose(${DUR - 1.05},{faceX:20,lookX:1,lookY:-.3,lid:1.15,brow:1.2,mouth:"o",torso:-3},.25);
  // Camera tracks; street parallax. Stops at the only solid door.
  const cx=[[s22,0],[${DUR - 0.9},-2750,'sine.inOut']];
  S.at((T)=>{ const x=S.ev(cx,T);
    S.set(P+"cHouses","x",x); S.set(P+"lastDoor","x",x); S.set(P+"dash","x",x); S.set(P+"cFar","x",x*.34); S.set(P+"cFg","x",x*1.5); });
  // Doors that were barely there fade to a bare hint as the walker goes
  S.at((T)=>{ for(let i=0;i<16;i++){ const base=-300+ i*316 +150; const cam=S.ev(cx,T); const sx=base+cam; const n=NU.clamp(Math.abs(sx-660)/640); S.set(P+"door"+i,"a:opacity",.15+.75*n); } });
  S.streaks(P+"fC",{n:30,angle:8,speed:1800,seed:13,scale:1.1,alpha:.7,area:[-100,100,2120,900]});
  S.k(P+"tDoor",{o:[[s22+.5,0],[s22+.65,1],[${DUR - 1.2},1],[${DUR - 1.02},0]],x:[[s22+.5,30],[s22+.8,0,'power3.out']]});
  // A knock at the last door, the only one that responds.
  const k0=${DUR - 0.62};
  S.k(P+"lastD",{fill:[[k0,"${C.citrus}"],[k0+.1,"#FFFFFF"]]});
  S.k(P+"qFlash",{"a:r":[[k0,10],[${DUR},1200,'power2.in']],o:[[k0,0],[k0+.04,1]],"a:cx":[[k0,960]],"a:cy":[[k0,740]]});
  `;
  writeScene("doors", DUR, { defs, body, script, bg: "#0B1642" });
}
