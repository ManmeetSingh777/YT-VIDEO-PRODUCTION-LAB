import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, heroNu, tag, label, writeScene, f1 } from "./lib.mjs";
import { spaceDefs, earth, stars } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

function proton(id, x, y, r = 40, extra = "") {
  return g(id, x, y, `<circle r="${r}" fill="url(#s-pr)"/><circle cx="${-r * 0.32}" cy="${-r * 0.36}" r="${r * 0.2}" fill="#fff" opacity=".7"/><path d="M${-r * 0.3},0 H${r * 0.3} M0,${-r * 0.3} V${r * 0.3}" stroke="#7A1F2A" stroke-width="${r * 0.14}" stroke-linecap="round"/>`, extra);
}
function neutron(id, x, y, r = 40) {
  return g(id, x, y, `<circle r="${r}" fill="url(#s-ne)"/><circle cx="${-r * 0.32}" cy="${-r * 0.36}" r="${r * 0.2}" fill="#fff" opacity=".8"/>`);
}

export function buildSun() {
  const P = "s-";
  const start = T.s9[0] - 0.2, DUR = +(T.s11[0] - 0.15 - start).toFixed(2);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3); // local time helper
  const R = rng(77);
  const defs = spaceDefs(P) + nuDefs(P, "#0AA192", "#C8FFF4") + rad(P + "corona", [[0, "#FFD86A", 0.95], [0.34, "#FFB23C", 0.8], [0.5, "#F2732A", 0.35], [1, "#B4301A", 0]]) +
    rad(P + "pr", [[0, "#FFB3A0"], [0.55, C.coral], [1, "#A32A3A"]], 0.38, 0.34, 0.75) +
    rad(P + "ne", [[0, "#FFFFFF"], [0.6, "#CFEAF5"], [1, "#6C93B8"]], 0.38, 0.34, 0.75) +
    rad(P + "gran", [[0, "#FFE9A6"], [0.75, "#FF9A2E"], [1, "#B8390F"]]) +
    rad(P + "conv", [[0, "#FFD36A"], [0.7, "#F2732A"], [1, "#B4301A"]]) +
    rad(P + "radz", [[0, "#FFF5C5"], [0.6, "#FFC24A"], [1, "#F27B2A"]]) +
    rad(P + "coreBg", [[0, "#FFFDEB"], [0.22, "#FFEFA8"], [0.5, "#FFB63C"], [0.8, "#EE6A22"], [1, "#A32A14"]], 0.46, 0.5, 0.75) +
    rad(P + "flash", [[0, "#FFFFFF"], [0.2, "#FFF6C7", 0.95], [0.55, "#FFD860", 0.35], [1, "#FFB23C", 0]]) +
    rad(P + "blob", glowStops("#FFF3B0", 0.5)) +
    rad(P + "blobD", glowStops("#C2401C", 0.5)) +
    lin(P + "rib1", [[0, "#FFF6C7", 0], [0.5, "#FFF6C7", 0.55], [1, "#FFF6C7", 0]], 0, 0, 1, 0) +
    `<clipPath id="${P}coreClip"><circle id="${P}coreC" cx="960" cy="540" r="10"/></clipPath>`;

  // SUN CROSS-SECTION (r=480) ---------------------------------------------------
  const conv = rep(18, (i) => {
    const a = (i / 18) * 360;
    return `<g transform="rotate(${a})"><path id="${P}cv${i}" d="M0,-452 C70,-452 80,-356 0,-352 C-80,-356 -70,-452 0,-452Z" fill="none" stroke="#FFE48E" stroke-width="7" stroke-dasharray="46 24" stroke-linecap="round" opacity=".85"/><ellipse cy="-402" rx="30" ry="34" fill="#C2401C" opacity=".35"/></g>`;
  });
  const radiative = rep(72, (i) => {
    const a = (i / 72) * 360 + R() * 3;
    let d = `M0,-${160}`; for (let k = 1; k <= 9; k++) d += ` L${f1((k % 2 ? 1 : -1) * (5 + R() * 6))},-${160 + k * 20}`;
    return `<path transform="rotate(${f1(a)})" d="${d}" fill="none" stroke="#FFF2C0" stroke-width="2.4" opacity="${f1(0.35 + R() * 0.4)}"/>`;
  });
  const gran = rep(2300, () => {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * 478, x = Math.cos(a) * d, y = Math.sin(a) * d, r = 3.5 + R() * 6;
    return `<ellipse cx="${f1(x)}" cy="${f1(y)}" rx="${f1(r)}" ry="${f1(r * 0.8)}" transform="rotate(${f1(R() * 180)} ${f1(x)} ${f1(y)})" fill="${R() < 0.5 ? "#FFB44A" : R() < 0.5 ? "#F59A33" : "#FFC866"}" opacity="${f1(0.55 + R() * 0.4)}"/>`;
  });
  const section = g(P + "sect", 0, 0, `
    <circle r="482" fill="url(#${P}conv)"/>
    ${conv}
    <circle r="340" fill="url(#${P}radz)"/>
    ${radiative}
    <circle r="160" fill="#FFF6C7"/>
    <circle r="150" fill="url(#${P}coreBg)"/>
    ${rep(16, (i) => `<circle cx="${f1(Math.cos(i) * (40 + (i % 5) * 20))}" cy="${f1(Math.sin(i * 1.7) * (40 + (i % 4) * 22))}" r="${5 + (i % 3) * 3}" fill="#fff" opacity=".6"/>`)}
  `);
  // Outer shell: a real disc we cut a growing wedge out of (shape actually opens).
  const shell = `<mask id="${P}wedgeM" maskUnits="userSpaceOnUse" x="-700" y="-700" width="1400" height="1400"><rect x="-700" y="-700" width="1400" height="1400" fill="#fff"/><path id="${P}wedge" d="M0,0 L1,0 L0,1Z" fill="#000"/></mask>
    <g mask="url(#${P}wedgeM)"><circle r="486" fill="#E8791F"/>${gran}<circle r="486" fill="none" stroke="#FFEFA8" stroke-width="5"/></g>
    <path id="${P}edgeA" d="M0,0 L486,0" stroke="#FFF8D6" stroke-width="5" opacity="0"/><path id="${P}edgeB" d="M0,0 L486,0" stroke="#FFF8D6" stroke-width="5" opacity="0"/>`;

  // CORE STAGE (full frame, revealed through growing circle clip) ----------------
  const ribbons = rep(20, (i) => {
    const y0 = 20 + i * 54 + R() * 40, c1 = y0 + (R() - 0.5) * 900, c2 = y0 + (R() - 0.5) * 900, y3 = y0 + (R() - 0.5) * 300;
    return `<path id="${P}rb${i}" d="M-80,${f1(y0)} C520,${f1(c1)} 1300,${f1(c2)} 2000,${f1(y3)}" fill="none" stroke="${i % 3 === 0 ? "#FFF6C7" : i % 3 === 1 ? "#FF9A3C" : "#FFD86A"}" stroke-width="${f1(3 + R() * R() * 26)}" stroke-dasharray="${f1(420 + R() * 700)} ${f1(120 + R() * 240)}" opacity="${f1(0.16 + R() * 0.32)}"/>`;
  });
  const dustBg = rep(70, (i) => `<circle id="${P}du${i}" cx="${f1(R() * 1920)}" cy="${f1(R() * 1080)}" r="${f1(3 + R() * 9)}" fill="${R() < 0.5 ? "#FFF8D6" : "#FFE48E"}" opacity="${f1(0.3 + R() * 0.5)}"/>`);
  const bgNuc = rep(26, (i) => {
    const x = R() * 1920, y = R() * 1080, r = 12 + R() * 16;
    return R() < 0.7 ? proton(`${P}bn${i}`, f1(x), f1(y), f1(r)) : neutron(`${P}bn${i}`, f1(x), f1(y), f1(r));
  });
  const fgBlobs = rep(8, (i) => `<ellipse id="${P}fb${i}" cx="${f1(R() * 1920)}" cy="${f1(R() * 1080)}" rx="${f1(260 + R() * 260)}" ry="${f1(130 + R() * 130)}" fill="url(#${P}blobD)" opacity=".55"/>`);
  const coreStage = `<g clip-path="url(#${P}coreClip)">
    <rect width="1920" height="1080" fill="url(#${P}coreBg)"/>
    ${grp(P + "ribs", ribbons)}
    ${grp(P + "dust", dustBg)}
    ${grp(P + "nucFar", bgNuc, `opacity=".72"`)}
    ${streakField(P, P + "fSt", 70)}
    ${g(P + "fx1", 860, 500, `<circle r="330" fill="url(#${P}flash)"/>`, `opacity="0"`)}
    <circle id="${P}ring" cx="860" cy="500" r="10" fill="none" stroke="#FFF9D9" stroke-width="16" opacity="0"/>
    <circle id="${P}ring2" cx="860" cy="500" r="10" fill="none" stroke="#FFD860" stroke-width="28" opacity="0"/>
    ${g(P + "fx2", 1500, 240, `<circle r="170" fill="url(#${P}flash)"/>`, `opacity="0"`)}
    ${g(P + "fx3", 300, 800, `<circle r="190" fill="url(#${P}flash)"/>`, `opacity="0"`)}
    <!-- four hydrogen nuclei (protons) -> helium nucleus -->
    ${proton(P + "p1", 860, 500, 62)}${proton(P + "p2", 860, 500, 62)}${proton(P + "p3", 860, 500, 62)}${proton(P + "p4", 860, 500, 62)}
    ${g(P + "he", 860, 500, `${proton(P + "h1", -44, -28, 54)}${neutron(P + "h2", 42, -34, 54)}${neutron(P + "h3", -38, 42, 54)}${proton(P + "h4", 46, 36, 54)}`, `opacity="0"`)}
    ${g(P + "hero", 0, 0, `<g transform="scale(2.5)"><use href="#${P}nu"/></g>`)}
    ${g(P + "hero3", 0, 0, `<g transform="scale(1.6)"><use href="#${P}nu"/></g>`)}
    ${g(P + "hero4", 0, 0, `<g transform="scale(1.6)"><use href="#${P}nu"/></g>`)}
    ${grp(P + "fgb", fgBlobs)}
    <path d="M-40,1120 C200,860 420,960 560,1120Z M2000,-40 C1720,-10 1680,190 1980,300Z M-40,-40 C160,-30 300,50 180,170 C80,260 -40,220 -40,120Z" fill="#8E2412" opacity=".62"/>
    <path d="M-40,1120 C160,920 340,990 460,1120Z M2000,-40 C1800,-20 1780,120 1980,210Z" fill="#5E1508" opacity=".55"/>
    ${tag(P + "tH", 180, 200, "hydrogen nuclei", { size: 40, bg: C.chalk })}
    ${tag(P + "tHe", 980, 720, "helium nucleus", { size: 40, bg: C.chalk })}
    ${tag(P + "tEn", 1150, 200, "energy", { size: 40, bg: "#FFF6C7" })}
    ${tag(P + "tNu", 1240, 610, "neutrino", { size: 44, bg: C.seaL })}
    ${g(P + "lifeE", 1660, 180, `<g transform="scale(.26)">${earth(P, P + "e1")}</g><circle r="128" fill="none" stroke="#FFF9D9" stroke-width="5" opacity=".9"/>`, `opacity="0"`)}
  </g>`;

  const body = `
  <rect width="1920" height="1080" fill="#070B26"/>
  ${stars(P + "st", 21, 170)}
  ${g(P + "cam", 960, 540, `
     <circle r="1420" fill="url(#${P}corona)"/>
     ${rep(16, (i) => { const a = i * 22.5 + (i % 3) * 5, L = 70 + (i % 4) * 34; return `<path transform="rotate(${a})" d="M482,-34 C${482 + L},-70 ${482 + L},44 482,30" fill="none" stroke="#FFD86A" stroke-width="${6 + (i % 3) * 5}" stroke-linecap="round" opacity=".8"/>`; })}
     ${section}
     <g id="${P}shell">${shell}</g>
     ${tag(P + "tCore", 200, -250, "core", { size: 22 })}
     ${tag(P + "tRad", 330, -360, "radiative zone", { size: 22 })}
     ${tag(P + "tCon", 430, -470, "convective zone", { size: 22 })}
  `)}
  ${coreStage}
  <rect id="${P}white" width="1920" height="1080" fill="#FFFDF0" opacity="0"/>
  `;

  const script = `
  const P=${JSON.stringify(P)};
  const wIn=${L("s9", 0.0)}; // wedge begins with "deep in its core"
  const openKeys=[[wIn,0],[wIn+0.95,118,'power3.inOut']];
  S.at((T)=>{ const a=S.ev(openKeys,T); const A0=-78, A1=A0+a; const r=1200;
    const rd=d=>d*Math.PI/180;
    let d; if(a<0.2){d="M0,0Z";} else { const n=Math.ceil(a/30); d="M0,0"; for(let i=0;i<=n;i++){ const an=rd(A0+a*i/n); d+=\` L\${(Math.cos(an)*r).toFixed(1)},\${(Math.sin(an)*r).toFixed(1)}\`; } d+="Z"; }
    S.set(P+"wedge","d",d);
    const v=NU.clamp(a/8);
    S.set(P+"edgeA","transform",\`rotate(\${A0})\`); S.set(P+"edgeB","transform",\`rotate(\${A1})\`);
    S.set(P+"edgeA","a:transform",\`rotate(\${A0})\`); S.set(P+"edgeB","a:transform",\`rotate(\${A1})\`);
    S.set(P+"edgeA","a:opacity",v); S.set(P+"edgeB","a:opacity",v);
  });
  // camera on the sun section: fills frame -> pulls to see the layers -> dives to core
  S.k(P+"cam",{ s:[[0,3.2],[wIn,3.0,'none'],[wIn+1.1,1.02,'power3.inOut'],[${L("s9", 1.35)},0.96,'none'],[${L("s10", -0.05)},3.6,'power2.in']], x:[[0,0],[wIn+1.1,-170,'power3.inOut'],[${L("s10", -0.05)},0,'power2.in']], r:[[0,0],[wIn+1.1,-5,'power3.inOut'],[${L("s10", -0.05)},0]] });
  S.k(P+"tCore",{o:[[wIn+1.05,0],[wIn+1.2,1],[${L("s9", 2.25)},1],[${L("s9", 2.45)},0]]});
  S.k(P+"tRad",{o:[[wIn+1.15,0],[wIn+1.3,1],[${L("s9", 2.25)},1],[${L("s9", 2.45)},0]]});
  S.k(P+"tCon",{o:[[wIn+1.25,0],[wIn+1.4,1],[${L("s9", 2.25)},1],[${L("s9", 2.45)},0]]});
  // cell flow (motion cue that the layers are alive)
  S.at((T)=>{ for(let i=0;i<18;i++){ S.set(P+"cv"+i,"a:stroke-dashoffset",-T*(i%2?90:-90)); }
    for(let i=0;i<20;i++){ S.set(P+"rb"+i,"a:stroke-dashoffset",-T*(240+i*20)); }
    for(let i=0;i<8;i++){ S.set(P+"fb"+i,"x",Math.sin(T*.5+i)*70); S.set(P+"fb"+i,"y",Math.cos(T*.4+i*2)*40); }
    for(let i=0;i<26;i++){ S.set(P+"bn"+i,"x",NU.wig(T,.9,i)*44); S.set(P+"bn"+i,"y",NU.wig(T,.8,i+40)*44); }
    S.set(P+"dust","x",-T*38); });
  // CORE REVEAL: circle clip grows from the section's core (same centre, same colour)
  const rvA=${L("s9", 2.15)}, rvB=${L("s10", 0.0)};
  S.k(P+"coreC",{"a:r":[[rvA,1],[rvA+0.02,120],[rvB,1250,'power2.in']]});
  // FUSION: anticipation (drift in), collision, flash, helium settles
  const f0=rvB-0.1, fHit=${L("s10", 1.05)};
  S.k(P+"p1",{ x:[[f0,-420],[fHit-0.5,-210,'sine.inOut'],[fHit,-44,'power2.in']], y:[[f0,-290],[fHit-0.5,-160,'sine.inOut'],[fHit,-28,'power2.in']], o:[[fHit,1],[fHit+.02,0]], sx:[[fHit-.15,1],[fHit,1.1]], sy:[[fHit-.15,1],[fHit,.9]] });
  S.k(P+"p2",{ x:[[f0,480],[fHit-0.5,240,'sine.inOut'],[fHit,42,'power2.in']], y:[[f0,-240],[fHit-0.5,-130,'sine.inOut'],[fHit,-34,'power2.in']], o:[[fHit,1],[fHit+.02,0]] });
  S.k(P+"p3",{ x:[[f0,-370],[fHit-0.5,-180,'sine.inOut'],[fHit,-38,'power2.in']], y:[[f0,330],[fHit-0.5,170,'sine.inOut'],[fHit,42,'power2.in']], o:[[fHit,1],[fHit+.02,0]] });
  S.k(P+"p4",{ x:[[f0,430],[fHit-0.5,210,'sine.inOut'],[fHit,46,'power2.in']], y:[[f0,350],[fHit-0.5,180,'sine.inOut'],[fHit,36,'power2.in']], o:[[fHit,1],[fHit+.02,0]] });
  S.at((T)=>{ const k=NU.clamp(1-(T-f0)/ (fHit-f0)); [1,2,3,4].forEach(i=>{ if(k>.45){ S.add(P+"p"+i,"x",NU.wig(T,6,i)*6); S.add(P+"p"+i,"y",NU.wig(T,6,i+9)*6);} }); });
  S.k(P+"he",{o:[[fHit-.01,0],[fHit+.01,1]], s:[[fHit,1.32],[fHit+0.14,0.9,'power2.out'],[fHit+0.34,1.05,'sine.out'],[fHit+0.6,1,'sine.inOut']], r:[[fHit,-30],[fHit+0.8,0,'power3.out'],[9,14,'none']], x:[[fHit+0.8,0],[9,-110,'sine.inOut']], y:[[fHit+0.8,0],[9,60,'sine.inOut']]});
  S.k(P+"fx1",{o:[[fHit-.03,0],[fHit,1],[fHit+.55,0,'power2.out']], s:[[fHit,.3],[fHit+.5,1.6,'power2.out']]});
  S.k(P+"ring",{"a:r":[[fHit,10],[fHit+1.5,1250,'power2.out']], o:[[fHit,.95],[fHit+1.5,0,'power1.in']]});
  S.k(P+"ring2",{"a:r":[[fHit+.15,10],[fHit+2.0,1300,'power1.out']], o:[[fHit+.15,.75],[fHit+2.0,0,'power1.in']]});
  // background fusions: same event, elsewhere, sparks up the tempo
  const f2=fHit+1.6, f3=fHit+2.5;
  S.k(P+"fx2",{o:[[f2-.02,0],[f2,1],[f2+.45,0,'power2.out']], s:[[f2,.3],[f2+.45,1.4,'power2.out']]});
  S.k(P+"fx3",{o:[[f3-.02,0],[f3,1],[f3+.45,0,'power2.out']], s:[[f3,.3],[f3+.45,1.4,'power2.out']]});
  // the single hero neutrino: born at the flash, stays locked as the identifiable spark
  const fly0=fHit+0.05;
  S.k(P+"hero",{ x:[[fly0,860],[fly0+0.55,1210,'power3.out'],[${L("s10", 4.0)},1310,'sine.inOut'],[${L("s10", 6.2)},2300,'power2.in']], y:[[fly0,500],[fly0+0.55,610,'power3.out'],[${L("s10", 4.0)},640],[${L("s10", 6.2)},860,'power2.in']], r:[[0,18]], o:[[fly0-.02,0],[fly0,1]] });
  S.k(P+"hero3",{ x:[[f2,1500],[f2+1.8,2300,'power2.in']], y:[[f2,240],[f2+1.8,430,'power2.in']], r:[[0,14]], o:[[f2-.02,0],[f2,1]] });
  S.k(P+"hero4",{ x:[[f3,300],[f3+2.4,2300,'power2.in']], y:[[f3,800],[f3+2.4,430,'power2.in']], r:[[0,-10]], o:[[f3-.02,0],[f3,1]] });
  // from one to a stream: radial field from behind fusion centre
  S.streaks(P+"fSt",{n:70,radial:[860,500],arc:[-50,50],speed:1500,span:1700,seed:6,scale:2.0,alpha:1,density:(T)=>S.ev([[${L("s10", 2.6)},0],[${L("s10", 5.4)},1,'power2.in']],T)});
  // tags land on the word
  S.k(P+"tH",{o:[[rvB-.05,0],[rvB+.12,1],[fHit-.1,1],[fHit+.05,0]],s:[[rvB-.05,.7],[rvB+.2,1,'back.out(2)']]});
  S.k(P+"tHe",{o:[[fHit+.5,0],[fHit+.65,1],[${L("s10", 3.0)},1],[${L("s10", 3.2)},0]],s:[[fHit+.5,.7],[fHit+.75,1,'back.out(2)']]});
  const ec=${L("s10", 1.1)};
  S.k(P+"tEn",{o:[[ec,0],[ec+.14,1],[${L("s10", 2.9)},1],[${L("s10", 3.1)},0]],s:[[ec,.7],[ec+.25,1,'back.out(2)']]});
  S.k(P+"lifeE",{o:[[ec+.55,0],[ec+.75,1],[${L("s10", 3.25)},1],[${L("s10", 3.5)},0]],s:[[ec+.55,.5],[ec+.9,1,'back.out(1.7)']]});
  S.k(P+"tNu",{o:[[${L("s10", 3.5)},0],[${L("s10", 3.65)},1],[${L("s10", 5.4)},1],[${L("s10", 5.7)},0]],s:[[${L("s10", 3.5)},.7],[${L("s10", 3.75)},1,'back.out(2)']]});
  S.at((T)=>{ S.add(P+"tNu","y",0); });
  // bloom-out, carries the eye to +x and into space
  S.k(P+"white",{o:[[${DUR - 0.5},0],[${DUR - 0.05},1,'power2.in']]});
  `;
  writeScene("sun", DUR, { defs, body, script, bg: "#FF9A2E" });
}
