import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, charDefs, character, tag, label, writeScene, f1, streakField } from "./lib.mjs";
import { iceDefs, iceBack, strings, dom } from "./scene_flash.mjs";
import { spaceDefs } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

export function buildIce() {
  const P = "i-";
  const start = +(T.s23[0] + 0.9 - 0).toFixed(3), DUR = +(T.s26[0] - 0.5 - start).toFixed(3);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const R = rng(66);
  const defs = iceDefs(P) + nuDefs(P) + dom(P, P + "dom") + charDefs(P) + spaceDefs(P) +
    lin(P + "skyA", [[0, "#040A28"], [0.45, "#14226A"], [0.85, "#6A5AB0"], [1, "#E3A6C0"]]) +
    lin(P + "snow", [[0, "#FFFFFF"], [1, "#C8E2F5"]]) +
    lin(P + "aurora", [[0, "#54F0B5", 0], [0.5, "#54F0B5", 0.55], [1, "#7A5BFF", 0]]) +
    lin(P + "iceWall", [[0, "#CDEBFA"], [0.08, "#5FA9DE"], [0.35, "#205BA8"], [1, "#071A45"]]) +
    lin(P + "bld", [[0, "#6A7FAD"], [1, "#39487A"]]) +
    rad(P + "wire", glowStops(C.citrus, 0.65)) +
    rad(P + "domHalo", glowStops(C.ice, 0.5)) + lin(P + "qb", [[0, "#16225C"], [1, "#0B1236"]]);
  // "?" bent from one instrument string: cable path with sensors on it
  const Qp = "M720,430 C720,240 1200,220 1200,430 C1200,560 960,560 960,720 L960,800";
  const qDots = [0.02, 0.15, 0.3, 0.45, 0.6, 0.76, 0.93];
  // Surface props: south-pole style station. Original drawing.
  const station = `
    <g transform="translate(980 512)">
      ${rep(9, (i) => `<rect x="${-300 + i * 76}" y="-2" width="10" height="48" fill="#39487A"/>`)}
      <path d="M-330,-2 L-326,-82 L-120,-110 L120,-110 L330,-82 L330,-2Z" fill="url(#${P}bld)"/>
      <path d="M-326,-82 L-120,-110 L120,-110 L330,-82 L330,-72 L120,-98 L-120,-98 L-326,-72Z" fill="#9DB4DF"/>
      ${rep(18, (i) => `<rect x="${-300 + i * 34}" y="-58" width="20" height="22" fill="${i % 3 ? "#FFE7A8" : "#FFB78C"}" opacity="${i % 4 ? 1 : 0.4}"/>`)}
      <path d="M210,-110 V-200 M180,-186 H240" stroke="#2B3762" stroke-width="7"/><circle cx="210" cy="-210" r="8" fill="${C.coral}"/>
    </g>
    <g id="${P}tower" transform="translate(1440 540)">
      <path d="M-46,0 L-14,-200 H14 L46,0 M-36,-50 H36 M-26,-110 H26 M-18,-170 H18 M-36,-50 L26,-110 M36,-50 L-26,-110" stroke="#E05E5A" stroke-width="8" fill="none"/>
      <rect x="-78" y="-22" width="156" height="42" rx="6" fill="#39487A"/><rect x="-78" y="-22" width="156" height="10" fill="#9DB4DF"/>
      <circle cy="-210" r="10" fill="#FFE7A8"/>
    </g>`;
  const crew = (x, y, id, col) => g(id, x, y, `<rect x="-11" y="-36" width="22" height="30" rx="8" fill="${col}"/><circle cy="-46" r="9" fill="#E7D8BE"/><path d="M-11,-44 Q0,-60 11,-44" fill="${col}"/><path d="M-7,-6 L-8,8 M7,-6 L8,8" stroke="#1B2552" stroke-width="7"/>`);
  // Cross-section strings (86 in real life; a representative row drawn)
  const secStrings = rep(14, (i) => {
    const x = 300 + i * 100 + (i % 2) * 8;
    return `<g id="${P}str${i}" data-b="${x},0" transform="translate(${x} 0)"><path d="M0,0 V680" stroke="#BDE9FF" stroke-width="2.2"/>${rep(13, (k) => `<circle cy="${200 + k * 38}" r="7" fill="#07183F" stroke="#7CDCF5" stroke-width="2"/>`)}</g>`;
  });
  // Deep scene: racing down the strings. Real depth = 3 parallax planes with continuous vertical wrap.
  const fN = [{ x: 330, y0: 0.2, z: 1.1, col: "#3D73B5" }, { x: 1480, y0: 0.7, z: 1.22, col: "#3D73B5" }];
  const fM = Array.from({ length: 6 }, (_, i) => ({ x: 120 + i * 330 + (i % 2) * 60, y0: i * 0.27, z: 0.56, col: "#2A5A99" }));
  const fF = Array.from({ length: 13 }, (_, i) => ({ x: 40 + i * 150 + (i % 3) * 30, y0: i * 0.35, z: 0.26, col: "#1F4A87" }));
  const SN = strings(P, fN, "n"), SM = strings(P, fM, "m"), SF = strings(P, fF, "f");
  const body = `
  <g id="${P}qStage">
    <rect width="1920" height="1080" fill="url(#${P}qb)"/>
    <g stroke="#2F4A9A" stroke-width="1.5" opacity=".45">${rep(25, (i) => `<path d="M${i * 80},0 V1080"/>`)}${rep(14, (i) => `<path d="M0,${i * 80} H1920"/>`)}</g>
    <g fill="none" stroke="#9FBCF2" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" opacity=".5">
      <circle cx="1520" cy="250" r="96"/><path d="M1424,250 Q1520,300 1616,250"/><path d="M1400,160 L1640,340" stroke="${C.sea}" stroke-dasharray="14 12"/>
      <path d="M1400,640 h300 v230 h-300Z M1400,640 l70,-52 h300 l-70,52 M1770,588 v230 l-70,52"/>
      ${rep(6, (i) => `<path d="M${1440 + i * 48},640 v230"/>`)}
      <path d="M140,150 q60,-50 120,0 t120,0 M140,216 h210 M140,256 h150"/>
      <path d="M1160,890 l60,-54 l60,54Z M1220,836 v-46"/>
    </g>
    ${rep(120, () => `<circle cx="${f1(R() * 1920)}" cy="${f1(R() * 1080)}" r="${f1(0.6 + R() * 1.6)}" fill="#fff" opacity="${f1(0.2 + R() * 0.5)}"/>`)}
    <path id="${P}q" d="${Qp}" fill="none" stroke="${C.citrus}" stroke-width="13" stroke-linecap="round" stroke-dasharray="1700" stroke-dashoffset="1700"/>
    ${qDots.map((u, i) => `<g id="${P}qd${i}" opacity="0"><circle r="66" fill="url(#${P}domHalo)"/><g transform="scale(.58)"><use href="#${P}dom"/></g></g>`).join("")}
    ${g(P + "qDot", 960, 900, `<circle r="72" fill="url(#${P}domHalo)"/><g transform="scale(.8)"><use href="#${P}dom"/></g>`, `opacity="0"`)}
    ${g(P + "qC", 420, 780, `<g transform="scale(.74)">${character(P, { withUmbrella: false })}</g>`)}
  </g>
  <g id="${P}surf" style="display:none">
    ${g(P + "surfL", 0, 0, `
      <rect x="-1800" y="-1100" width="5600" height="1720" fill="url(#${P}skyA)"/>
      ${rep(110, () => `<circle cx="${f1(R() * 2400 - 200)}" cy="${f1(R() * 460 - 80)}" r="${f1(0.7 + R() * 1.5)}" fill="#fff" opacity="${f1(0.4 + R() * 0.6)}"/>`)}
      <path id="${P}a0" d="M-1700,300 C-1200,120 -700,280 -300,160 L-300,360 C-800,430 -1300,330 -1700,420Z" fill="url(#${P}aurora)" opacity=".6"/><path id="${P}a1" d="M-100,250 C400,70 900,330 1400,130 C1700,30 1900,130 2100,60 L2100,330 C1800,370 1500,260 1200,400 C800,520 300,360 -100,470Z" fill="url(#${P}aurora)"/>
      <path id="${P}a2" d="M200,110 C600,20 1100,240 1900,40 L1900,190 C1200,330 700,150 200,280Z" fill="url(#${P}aurora)" opacity=".6"/>
      ${station}
      <rect x="-1800" y="540" width="5600" height="2600" fill="url(#${P}iceWall)"/>
      <path d="M-1800,548 C-900,530 -300,556 200,528 C620,558 1000,538 1400,520 C1800,554 2600,530 3800,548 V584 H-1800Z" fill="url(#${P}snow)"/>
      <path d="M100,558 C300,540 520,556 700,548 L640,572 L140,572Z M1200,562 C1450,546 1650,558 1820,548 L1760,574 L1260,574Z" fill="#DFEFFA"/>
      ${g(P + "snowcat", 540, 556, `<rect x="-58" y="-34" width="118" height="38" rx="8" fill="${C.coral}"/><rect x="-30" y="-58" width="62" height="28" rx="6" fill="#8FD9F5"/><rect x="-58" y="-2" width="118" height="18" rx="9" fill="#14193F"/>`)}
      ${crew(840, 554, P + "cr1", "#E05E5A")}${crew(1320, 556, P + "cr2", C.must)}${crew(1380, 552, P + "cr3", "#2FA79B")}
      ${grp(P + "strs", secStrings)}
      <g id="${P}cubeS" opacity="0"><rect x="260" y="736" width="1400" height="688" fill="none" stroke="#FFF0DA" stroke-width="5" stroke-dasharray="20 14"/></g>
      ${g(P + "tower2", 170, 736, `<path d="M0,0 V688 M-30,0 H30 M-30,688 H30" stroke="#FFF0DA" stroke-width="6" fill="none"/><text x="-26" y="352" fill="#FFF0DA" font-size="42" font-weight="700" text-anchor="end">1 km</text>`, `opacity="0"`)}
      `)}
    ${grp(P + "snowF", rep(70, (i) => `<circle id="${P}sn${i}" r="${f1(1.6 + (i % 4))}" fill="#fff" opacity=".85"/>`))}
    ${tag(P + "tDet", 1140, 90, "the detector", { size: 42, bg: C.chalk })}
    ${tag(P + "tKm", 1150, 960, "1 cubic kilometer of ice", { size: 42, bg: C.chalk })}
  </g>
  <g id="${P}deep" style="display:none">
    <g id="${P}camBack">${iceBack(P, 12)}</g>
    ${grp(P + "pF", SF.out)}
    <rect x="-20" y="-20" width="1960" height="1120" fill="#061740" opacity=".4"/>
    ${grp(P + "pM", SM.out)}
    <rect x="-20" y="-20" width="1960" height="1120" fill="#061740" opacity=".24"/>
    ${grp(P + "pN", SN.out)}
    ${streakField(P, P + "fD", 14)}
    ${g(P + "domH", 1040, 500, `<circle r="520" fill="url(#${P}domHalo)" opacity=".7"/><g transform="scale(5.2)"><use href="#${P}dom"/></g>
       <g id="${P}blink" opacity="0"><circle r="430" fill="url(#${P}g0)"/></g>`)}
    <g id="${P}cubeW" opacity="0"><path d="M450,250 L1480,190 L1720,350 L650,430Z M450,250 V780 L650,960 V430 M1720,350 V880 L650,960 M1480,190 V720 L1720,880 M450,780 L1480,720" fill="none" stroke="#FFF0DA" stroke-width="3.5" stroke-dasharray="14 10" stroke-linejoin="round"/></g>
    ${tag(P + "tSens", 150, 330, "digital optical sensor", { size: 40, bg: C.ice })}
    ${tag(P + "tN", 150, 410, "5,160 in the ice", { size: 40, bg: C.chalk })}
    ${tag(P + "tDark", 110, 930, "crystal-clear darkness", { size: 40, bg: C.ice })}
  </g>
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const s23=${L("s23")}, s24=${L("s24")}, s25=${L("s25")};
  // ?: the door's light contracts into a cable that writes a question mark, then sensors slot on
  S.k(P+"q",{"a:stroke-dashoffset":[[0,1700],[1.4,0,'power2.inOut']]});
  const qPath=S.el(P+"q"), qL=qPath.getTotalLength();
  const us=${JSON.stringify(qDots)};
  S.at((T)=>{ for(let i=0;i<us.length;i++){ const u=us[i], t0=.6+i*.17; const q=qPath.getPointAtLength(u*qL); const a=NU.clamp((T-t0)/.2);
      const e=S.el(P+"qd"+i); e.setAttribute("opacity",a); e.setAttribute("transform",\`translate(\${q.x.toFixed(1)} \${(q.y-((1-a)*(1-a))*50).toFixed(1)}) scale(\${(.5+a*.5).toFixed(3)})\`); } });
  S.k(P+"qDot",{o:[[1.6,0],[1.72,1]],y:[[1.6,-44],[1.78,0,'bounce.out']]});
  // Character thinks: squash, hand to chin, looks up
  const c=S.actor(P,{armL:18,foreL:-16,armR:-18,foreR:16,head:-10,faceX:12,faceY:-6,lookX:.9,lookY:-.7,mouth:"m",brow:.2});
  c.pose(.8,{armR:-32,foreR:-136,head:-14,lookX:1,lookY:-.9,brow:.8,browTilt:.4},.4,"back.out(1.4)");
  c.pose(2.2,{squash:.1,head:-8,faceX:16,mouth:"o"},.25);
  c.pose(2.6,{squash:-.06,brow:1.2,lid:1.15,armR:-90,foreR:-80,spread:1},.3,"back.out(2)");
  S.k(P+"qC",{x:[[0,-260],[.45,0,'power3.out']]});
  S.show(P+"qStage",0,s24+.25);
  S.k(P+"qStage",{s:[[0,1],[s24+.25,1.07,'sine.inOut']],x:[[0,0],[s24+.25,-67,'sine.inOut']],y:[[0,0],[s24+.25,-38,'sine.inOut']]});
  S.at((T)=>{ S.set(P+"q","a:stroke-width",13+Math.sin(T*3.1)*1.6); });
  // Surface: wipe in. Crew move; drill actually works; strings lower one at a time.
  const su=s24-.1, dv=s24+3.65, deep=s25-.05;
  S.show(P+"surf",su,deep+.1);
  S.k(P+"surfL",{y:[[su,240],[su+.8,0,'power3.out'],[dv,0],[dv+1.0,-218,'power2.inOut'],[deep-.9,-218],[deep,-1400,'power3.in']],s:[[su,1.05],[su+.8,1,'power3.out'],[dv,1],[dv+1.0,.62,'power2.inOut'],[deep-.9,.62],[deep,1.5,'power3.in']],x:[[dv,0],[dv+1.0,360,'power2.inOut'],[deep-.9,360],[deep,-300,'power3.in']]});
  S.at((T)=>{ const a=Math.sin(T*.8)*26, b=Math.sin(T*.6+1)*20;
    S.set(P+"a1","a:transform",\`translate(\${b} \${a*.5})\`); S.set(P+"a2","a:transform",\`translate(\${-a} \${b*.4})\`);
    S.set(P+"snowcat","x",-Math.min(T,su+1)*0+Math.max(0,T-su)*38);
    S.set(P+"cr1","x",Math.max(0,T-su)*-22); S.set(P+"cr1","r",Math.sin(T*9)*3);
    S.set(P+"cr2","x",Math.sin(T*1.1)*14); S.set(P+"cr3","r",Math.sin(T*6)*5);
    for(let i=0;i<70;i++){ const h=NU.hash(i+31),h2=NU.hash(i*5+1); const sp=120+h*220; const y=((T*sp+h2*1200)%1180)-50, x=((h*2100+T*(60+h2*120))%2000)-40;
      const e=S.el(P+"sn"+i); e.setAttribute("cx",x.toFixed(1)); e.setAttribute("cy",y.toFixed(1)); }
  });
  // Each string lowers in staggered order; string is a cause, the array is the consequence.
  for(let i=0;i<14;i++){ const t=su+.65+i*.17; S.k(P+"str"+i,{y:[[t-.01,-40],[t,520],[t+.7,760,'power2.out']],o:[[t-.02,0],[t,1]]}); }
  S.k(P+"tDet",{o:[[su+.7,0],[su+.85,1],[dv-.05,1],[dv+.1,0]],y:[[su+.7,16],[su+1,0,'power3.out']]});
  S.k(P+"cubeS",{o:[[dv,0],[dv+.3,1]]}); S.k(P+"tower2",{o:[[dv+.3,0],[dv+.6,1]]});
  S.k(P+"tKm",{o:[[dv+.2,0],[dv+.35,1],[deep-.15,1],[deep,0]],y:[[dv+.2,16],[dv+.5,0,'power3.out']]});
  // DEEP: a real vertical descent. Multi-plane, continuous; brakes onto one sensor.
  S.show(P+"deep",deep,999);
  const brake=deep+2.7;
  const dist=[[deep,0],[brake,3200,'power3.out']];
  S.at((T)=>{ const D=S.ev(dist,T); S.set(P+"pN","y",-((D*1.0)%(212*1.1))); S.set(P+"pM","y",-((D*.56)%(212*.56))); S.set(P+"pF","y",-((D*.26)%(212*.26)));
    S.set(P+"camBack","y",-(D*.06)%70); });
  const hd=brake-.55;
  S.k(P+"domH",{y:[[hd,1300],[hd+.72,0,'power3.out'],[${DUR},0]],s:[[hd,1.2],[hd+.72,1,'power3.out'],[${DUR},1.05,'sine.inOut']]});
  // sensor checks in: quiet waking pulse, stays silent most of the time
  const b0=hd+.95; S.k(P+"blink",{o:[[b0,0],[b0+.08,.5],[b0+.5,0,'power2.out']]});
  S.k(P+"tSens",{o:[[hd+.25,0],[hd+.42,1],[${DUR - 0.2},1],[${DUR},0]],x:[[hd+.25,-26],[hd+.55,0,'power3.out']]});
  S.k(P+"tN",{o:[[hd+.5,0],[hd+.66,1],[${DUR - 0.2},1],[${DUR},0]],x:[[hd+.5,-26],[hd+.8,0,'power3.out']]});
  S.k(P+"tDark",{o:[[deep+1.05,0],[deep+1.2,1],[hd+.2,1],[hd+.35,0]]});
  S.k(P+"cubeW",{o:[[deep+.15,0],[deep+.45,.8],[hd,.55],[hd+.3,.12]]});
  S.streaks(P+"fD",{n:14,angle:152,speed:1200,seed:7,scale:1,alpha:.5,density:(T)=>S.ev([[deep+1.6,0],[deep+2.6,1]],T)});
  `;
  writeScene("ice", DUR, { defs, body, script, bg: "#0B1236" });
}
