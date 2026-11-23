import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, tag, label, writeScene, f1 } from "./lib.mjs";
import { spaceDefs, earth, stars, nebula, sunDisc } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

/** stacked cloud deck, screen-filling wipe */
function clouds(id, seed, col, n, y0, h) {
  const R = rng(seed);
  return grp(id, rep(n, () => `<ellipse cx="${f1(R() * 2600 - 340)}" cy="${f1(y0 + R() * h)}" rx="${f1(240 + R() * 420)}" ry="${f1(70 + R() * 130)}" fill="${col}"/>`));
}

/** 15.3 → sun: city under cloud → curved horizon → globe recedes → Sun swells to fill the frame */
export function buildAscent() {
  const P = "a-";
  const start = 15.3, DUR = +(T.s9[0] - 0.2 - start).toFixed(3);
  const defs = spaceDefs(P) + nuDefs(P) + lin(P + "dusk", [[0, "#050A24"], [0.6, "#15245E"], [1, "#6C4F9A"]]) + lin(P + "atmo", [[0, "#7CDCF5", 0], [1, "#7CDCF5", 0.62]]);
  const R = rng(4);
  const body = `
  <rect width="1920" height="1080" fill="url(#${P}space)"/>
  ${nebula(P, P + "neb", 6, 8, ["nebA", "nebB", "nebC"])}
  ${grp(P + "starsF", stars(P + "s1", 11, 220))}
  ${grp(P + "starsN", stars(P + "s2", 12, 70, 1920, 1080, 1.7))}
  ${g(P + "sunL", 500, 240, `<g id="${P}sunS" data-b="0,0">${sunDisc(P, P + "sun", 0, 0)}</g>`)}
  <ellipse id="${P}orbit" cx="1400" cy="760" rx="1020" ry="400" fill="none" stroke="#7CDCF5" stroke-width="2.5" stroke-dasharray="4 16" opacity=".5"/>
  ${g(P + "earthL", 1400, 760, `<g id="${P}earthS" data-b="0,0">${earth(P, P + "e")}</g>`)}
  ${streakField(P, P + "fS", 90)}
  ${g(P + "lead", 0, 0, `<g transform="scale(2.4)"><use href="#${P}nu"/></g>`)}
  ${clouds(P + "c1", 3, "#CFDDF2", 26, 400, 1000)}
  ${clouds(P + "c2", 5, "#E9F1FB", 20, 560, 800)}
  ${tag(P + "tE", 1370, 520, "Earth", { size: 34, bg: C.ice })}
  ${tag(P + "tS", 300, 90, "the Sun", { size: 40, bg: C.citrus })}
  `;
  const leave = 0.55, sunGo = +(T.s8[0] + 3.55 - start).toFixed(3); // "...dive straight into the Sun"
  const script = `
  const P=${JSON.stringify(P)};
  // clouds: starts opaque (a foreground wipe from the kitchen city), then fall away below
  S.k(P+"c1",{y:[[0,-260],[.9,800,'power2.in']],o:[[.7,1],[1.0,0]]});
  S.k(P+"c2",{y:[[0,-420],[.8,1000,'power2.in']],o:[[.6,1],[.85,0]]});
  // Earth: huge horizon -> whole globe -> recedes while Sun approaches
  S.k(P+"earthS",{s:[[0,7.2],[${leave},5.2,'power1.in'],[${leave + 1.05},0.96,'power3.out'],[${sunGo},.7,'sine.inOut'],[${DUR},.12,'power2.in']]});
  S.k(P+"earthL",{y:[[0,3400],[${leave + 1.05},0,'power3.out'],[${sunGo},0],[${DUR},260,'power2.in']],x:[[${sunGo},0],[${DUR},700,'power2.in']]});
  S.at((T)=>{ S.set(P+"e-spin","r",T*7-24); S.set(P+"e-clouds","r",T*10); });
  S.k(P+"orbit",{o:[[${leave + 0.95},0],[${leave + 1.3},.5],[${sunGo + 0.5},.5],[${sunGo + 1},0]]});
  // Sun: distant disc -> fills frame exactly as the sun scene opens (its surface = its next shot)
  S.k(P+"sunS",{s:[[0,.1],[${sunGo - 0.6},.14,'none'],[${DUR},4.2,'power3.in']]});
  S.k(P+"sunL",{x:[[${DUR - 1.0},0],[${DUR},460,'power3.in']],y:[[${DUR - 1.0},0],[${DUR},300,'power3.in']]});
  // stars parallax accelerates with the dive
  S.at((T)=>{ const p=NU.clamp((T-${sunGo})/(${DUR}-${sunGo})); const dz=gsap.parseEase("power3.in")(p);
    const s1=1+dz*.6, s2=1+dz*2.2; S.el(P+"starsF").setAttribute("transform",\`translate(500 240) scale(\${s1}) translate(-500 -240)\`);
    S.el(P+"starsN").setAttribute("transform",\`translate(500 240) scale(\${s2}) translate(-500 -240)\`); });
  // stream oncoming from the Sun's direction: keeps the identity of the sparks
  S.streaks(P+"fS",{n:90,radial:[500,240],arc:[-20,110],speed:1500,span:1900,seed:12,scale:1.4,alpha:.9,density:(T)=>S.ev([[.9,0],[1.8,.55],[${DUR},1]],T)});
  // the lead spark heads the OTHER way? no: camera flies along its reverse path, so it streaks past near camera
  S.k(P+"lead",{x:[[1.5,560],[2.1,1320,'none']],y:[[1.5,300],[2.1,700,'none']],r:[[0,27.8]],o:[[1.5,0],[1.58,1],[2.05,1],[2.1,0]]});
  S.k(P+"tE",{o:[[${leave + 1.0},0],[${leave + 1.15},1],[${sunGo - 0.2},1],[${sunGo},0]]});
  S.k(P+"tS",{o:[[${sunGo - 0.2},0],[${sunGo},1],[${DUR - 0.85},1],[${DUR - 0.6},0]],s:[[${sunGo - 0.2},.7],[${sunGo + 0.1},1,'back.out(2)']]});
  `;
  writeScene("ascent", DUR, { defs, body, script, bg: "#060A22" });
}

/** flavour star: same 40 point polygon so a real morph interpolates between type shapes */
function star(k, r0 = 30, r1 = 13) {
  const pts = [];
  for (let i = 0; i < 40; i++) {
    const a = (i / 40) * Math.PI * 2 - Math.PI / 2;
    const m = Math.pow(Math.abs(Math.cos(((a + Math.PI / 2) * k) / 2)), 2.4);
    const r = r1 + (r0 - r1) * m;
    pts.push(`${f1(Math.cos(a) * r)},${f1(Math.sin(a) * r)}`);
  }
  return "M" + pts.join(" L") + "Z";
}

/** s11-s15. Spark leaves Sun, overtakes planets, Moon whip, into atmosphere, flavour morphs */
export function buildFlight() {
  const P = "h-";
  const start = +(T.s11[0] - 0.15).toFixed(3), DUR = +(T.s16[0] - 0.3 - start).toFixed(3);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const R = rng(55);
  const craters = rep(44, () => { const a = R() * 6.28, d = Math.sqrt(R()) * 370, x = Math.cos(a) * d, y = Math.sin(a) * d, r = 8 + R() * R() * 58; return `<circle cx="${f1(x)}" cy="${f1(y)}" r="${f1(r)}" fill="#8F8AA6" opacity=".82"/><path d="M${f1(x - r * 0.7)},${f1(y - r * 0.7)} A${f1(r)},${f1(r)} 0 0 1 ${f1(x + r * 0.7)},${f1(y - r * 0.7)}" stroke="#FFF7E8" stroke-width="${f1(1.5 + r * 0.05)}" fill="none" opacity=".66"/>`; });
  const defs = spaceDefs(P) + nuDefs(P) +
    rad(P + "moon", [[0, "#F5F0E0"], [0.62, "#BDB6C8"], [1, "#4E4A68"]], 0.36, 0.34, 0.85) +
    rad(P + "venus", [[0, "#FFE8B5"], [1, "#B6703F"]], 0.36, 0.34, 0.85) +
    rad(P + "mars", [[0, "#FFB491"], [1, "#8C3A2C"]], 0.36, 0.34, 0.85) +
    lin(P + "beamG", [[0, "#FFF4C2", 0], [0.8, "#FFF4C2", 0.65], [1, "#FFFFFF", 1]], 0, 0, 1, 0) +
    lin(P + "aur", [[0, "#54F0B5", 0], [0.4, "#54F0B5", 0.5], [1, "#9B6BFF", 0]]) +
    rad(P + "tailC", glowStops(C.citrus, 0.8)) + rad(P + "tailR", glowStops(C.coral, 0.8)) + rad(P + "tailS", glowStops(C.sea, 0.8)) +
    `<clipPath id="${P}screen"><rect width="1920" height="1080"/></clipPath>`;
  const body = `
  <rect width="1920" height="1080" fill="url(#${P}space)"/>
  ${grp(P + "neb", nebula(P, P + "nb", 15, 9, ["nebA", "nebB", "nebC"]))}
  ${grp(P + "sF", stars(P + "s1", 41, 260, 3840))}
  ${grp(P + "sN", stars(P + "s2", 42, 90, 5760, 1080, 1.8))}
  ${g(P + "sunL", -260, 540, `<g transform="scale(1.35)">${sunDisc(P, P + "sun", 0, 0)}</g>`)}
  ${g(P + "venusP", 2300, 300, `<circle r="94" fill="url(#${P}venus)"/><path d="M-90,-20 Q0,-48 90,-16 M-86,30 Q0,6 88,36" stroke="#FFF2CF" stroke-width="10" fill="none" opacity=".5"/>`)}
  ${g(P + "marsP", 2600, 840, `<circle r="60" fill="url(#${P}mars)"/><ellipse cy="-52" rx="20" ry="7" fill="#fff"/>`)}
  ${streakField(P, P + "fM", 70)}
  ${g(P + "earthL", 1500, 1320, `<g id="${P}earthS" data-b="0,0">${earth(P, P + "e")}</g>`)}
  <path id="${P}aur1" d="M180,800 C640,560 1300,520 1820,760 C1300,330 640,340 180,800Z" fill="url(#${P}aur)" opacity="0"/>
  <g id="${P}beam" opacity="0"><rect x="-1700" y="-3" width="1700" height="6" rx="3" fill="url(#${P}beamG)"/></g>
  ${g(P + "leadL", 0, 0, g(P + "lead", 0, 0, `
    <rect x="-500" y="-4" width="500" height="8" rx="4" fill="url(#${P}tail)" id="${P}tl"/>
    <rect x="-240" y="-14" width="240" height="28" rx="14" fill="url(#${P}tail)" opacity=".28"/>
    <circle id="${P}hlS" r="96" fill="url(#${P}tailS)"/><circle id="${P}hlC" r="96" fill="url(#${P}tailC)" opacity="0"/><circle id="${P}hlR" r="96" fill="url(#${P}tailR)" opacity="0"/>
    <g id="${P}fl" data-b="0,0"><path id="${P}flP" d="${star(3)}" fill="${C.seaL}" stroke="#fff" stroke-width="2" stroke-linejoin="round"/></g>
  `))}
  ${g(P + "moonP", 2700, 480, `<circle r="400" fill="url(#${P}moon)"/>${craters}<circle r="400" fill="url(#${P}shadeG)" opacity=".62"/>`)}
  ${streakField(P, P + "fF", 40)}
  ${tag(P + "tC", 1040, 240, "almost the speed of light", { size: 38, bg: "#FFF4C2" })}
  ${tag(P + "tV", 1500, 150, "Venus", { size: 26, bg: "#FFE8B5" })}
  ${tag(P + "tMoon", 1420, 880, "the Moon", { size: 34, bg: C.chalk })}
  ${tag(P + "tAtm", 1250, 550, "atmosphere", { size: 34, bg: C.ice })}
  ${tag(P + "f1", 240, 880, "electron type", { size: 38, bg: C.seaL })}
  ${tag(P + "f2", 760, 880, "muon type", { size: 38, bg: C.citrus })}
  ${tag(P + "f3", 1270, 880, "tau type", { size: 38, bg: "#FF9D96" })}
  ${tag(P + "fNote", 960, 170, "same particle, new type: it does not split", { size: 34, bg: C.chalk, anchor: "center" })}
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const s12=${L("s12")},s13=${L("s13")},s14=${L("s14")},s15=${L("s15")},end=${DUR};
  // parallax velocity profile: everything far moves slower; a clear sense of speed with no shake
  const speed=(T)=>S.ev([[0,.2],[.7,1,'power2.out'],[s14+.8,1],[s15,.55],[end-.5,.55],[end,2.4,'power2.in']],T);
  const clockS=[]; for(let i=0;i<=${Math.ceil(DUR * 10)};i++){ clockS.push(0);} for(let i=1;i<clockS.length;i++){ clockS[i]=clockS[i-1]+speed(i/10)*.1; }
  const clock=(T)=>{ const f=T*10,i=Math.min(clockS.length-2,Math.floor(f)); return clockS[i]+(clockS[i+1]-clockS[i])*(f-i); };
  S.at((T)=>{ const c=clock(T);
    S.set(P+"sF","x",-((c*200)%1920)); S.set(P+"sN","x",-((c*620)%3840)); S.set(P+"neb","x",-c*40);
    S.set(P+"e-spin","r",T*5); S.set(P+"e-clouds","r",T*8); });
  S.k(P+"sunL",{x:[[0,250],[1.6,-900,'power2.in']],o:[[1.45,1],[1.7,0]]});
  // lead spark: hard anchor screen-centre; travels only in morph-close
  S.k(P+"lead",{ x:[[0,300],[.7,960,'power3.out'],[s15-.2,1000,'sine.inOut'],[s15+.5,960,'power2.inOut'],[end-.4,960],[end,1040,'power3.in']],
    y:[[0,540],[.7,540,'power3.out'],[s14,400,'sine.inOut'],[s14+.8,420],[s15+.5,500,'power2.inOut'],[end-.4,500],[end,1400,'power3.in']],
    r:[[s14,0],[s14+.3,10],[s15+.5,0,'power2.inOut'],[end-.4,0],[end-.05,88,'power2.in']],
    s:[[0,.6],[.7,1],[s15,1],[s15+.6,3.4,'power3.inOut'],[end-.4,3.4],[end,2.2,'power2.in']] });
  // light beam, ever so slightly ahead: speed comparison
  S.k(P+"beam",{o:[[.75,0],[.95,1],[s12-.05,1],[s12+.2,0]]});
  S.at((T)=>{ const e=S.el(P+"beam"); e.setAttribute("transform",\`translate(\${1020+Math.sin(T*2)*5} 544)\`); });
  S.k(P+"tC",{o:[[.95,0],[1.1,1],[s12-.05,1],[s12+.2,0]],y:[[.95,14],[1.2,0,'power3.out']]});
  // planets as whip-pass foreground events with size + velocity hierarchy
  S.k(P+"venusP",{x:[[s12-.15,0],[s12+1.1,-2800,'none']],s:[[s12-.15,.9],[s12+1.1,1.5]]});
  S.k(P+"tV",{o:[[s12+.1,0],[s12+.2,1],[s12+.6,1],[s12+.7,0]]});
  S.k(P+"marsP",{x:[[s12+.2,0],[s12+1.3,-3400,'none']]});
  // Moon: big near-camera pass, the spark goes BEHIND then OUT: occluded for a blink
  S.k(P+"moonP",{x:[[s13-.08,300],[s13+.5,-1600,'sine.inOut'],[s13+1.2,-3400,'power2.in']],y:[[s13,40],[s13+1.2,-60]],s:[[s13-.08,.8],[s13+1.2,1.4]],r:[[s13,0],[s13+1.2,-14]]});
  S.k(P+"tMoon",{o:[[s13+.15,0],[s13+.25,1],[s13+.72,1],[s13+.86,0]]});
  // Earth arrives; atmospheric rim becomes the stage of the morph
  S.k(P+"earthS",{s:[[s13+.5,.5],[s14+.4,1.9,'power3.out'],[end-.4,2.05],[end,3.8,'power3.in']]});
  S.k(P+"earthL",{y:[[s13+.5,240],[s14+.4,90,'power3.out'],[end-.4,60],[end,-500,'power3.in']],x:[[s13+.5,560],[s14+.4,-120,'power3.out'],[end,-300]],o:[[s13+.4,0],[s13+.55,1]]});
  S.k(P+"aur1",{o:[[s14+.05,0],[s14+.5,.55],[end-.4,.65]]});
  S.at((T)=>{ const a=Math.sin(T*1.1)*20; S.set(P+"aur1","d",\`M180,\${800+a*.2} C640,\${560-a} 1300,\${520+a} 1820,\${760-a*.2} C1300,\${330-a} 640,\${340+a} 180,\${800+a*.2}Z\`); });
  S.k(P+"tAtm",{o:[[s14+.3,0],[s14+.45,1],[s15-.1,1],[s15+.1,0]]});
  // Flavor morph: same polygon, three star shapes, three colours: never two objects
  const m1=s15+1.0,m2=s15+2.55;
  const star3=${JSON.stringify(star(3))},star4=${JSON.stringify(star(4, 34, 9))},star5=${JSON.stringify(star(5, 34, 18))};
  S.k(P+"flP",{d:[[m1,star3],[m1+.6,star4,'power2.inOut'],[m2,star4],[m2+.6,star5,'power2.inOut'],[end-.5,star5],[end-.2,star3]],fill:[[m1,"${C.seaL}"],[m1+.6,"${C.citrus}",'sine.inOut'],[m2,"${C.citrus}"],[m2+.6,"${C.coral}",'sine.inOut'],[end-.5,"${C.coral}"],[end-.2,"${C.seaL}"]]});
  S.k(P+"fl",{r:[[0,0],[m1-.1,-20],[m1+.6,110,'back.out(1.4)'],[m2,110],[m2+.6,250,'back.out(1.4)'],[end,290]],s:[[m1-.05,1],[m1+.1,1.2],[m1+.6,1],[m2-.05,1],[m2+.1,1.2],[m2+.6,1]]});
  S.k(P+"hlS",{o:[[m1,1],[m1+.5,0],[end-.5,0],[end-.2,1]]});
  S.k(P+"hlC",{o:[[m1,0],[m1+.5,1],[m2,1],[m2+.5,0]]});
  S.k(P+"hlR",{o:[[m2,0],[m2+.5,1],[end-.5,1],[end-.2,0]]});
  S.k(P+"f1",{o:[[s15+.3,0],[s15+.45,1],[m1+.05,1],[m1+.5,.32]],y:[[s15+.3,20],[s15+.55,0,'power3.out']]});
  S.k(P+"f2",{o:[[m1+.2,0],[m1+.35,1],[m2+.05,1],[m2+.5,.32]],y:[[m1+.2,20],[m1+.45,0,'power3.out']]});
  S.k(P+"f3",{o:[[m2+.2,0],[m2+.35,1],[end-.25,1],[end-.1,0]],y:[[m2+.2,20],[m2+.45,0,'power3.out']]});
  S.k(P+"fNote",{o:[[m1+.4,0],[m1+.55,1],[end-.3,1],[end-.15,0]]});
  // companions so one star never reads as alone in the void
  const dir=${0};
  S.streaks(P+"fM",{n:70,angle:0,speed:2100,span:2800,area:[-200,-100,2320,1280],seed:21,scale:1.1,alpha:.8,density:(T)=>S.ev([[.4,.1],[1,.8],[s15,.55]],T),clock});
  S.streaks(P+"fF",{n:40,angle:0,speed:3100,span:3400,area:[-300,-100,2520,1280],seed:22,scale:2.1,alpha:.8,density:(T)=>S.ev([[.8,0],[1.2,.6],[s15,.35]],T),clock});
  `;
  writeScene("flight", DUR, { defs, body, script, bg: "#060A22" });
}
export { };
