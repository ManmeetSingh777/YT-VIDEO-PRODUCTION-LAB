import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, tag, writeScene, f1 } from "./lib.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

export function dom(P, id) {
  return `<g id="${id}">
    <circle r="60" fill="url(#${P}domBody)"/>
    <path d="M-60,0 A60,60 0 0 0 60,0 Q0,16 -60,0Z" fill="url(#${P}domBase)"/>
    <ellipse cx="0" cy="28" rx="34" ry="22" fill="#061029"/><ellipse cx="-6" cy="24" rx="15" ry="7" fill="#6FA7D8" opacity=".5"/>
    <rect x="-61" y="-4" width="122" height="9" rx="2" fill="#10264A"/>
    <path d="M-40,-42 A58,58 0 0 1 8,-56" stroke="#D5F4FF" stroke-width="7" fill="none" stroke-linecap="round" opacity=".85"/>
    <path d="M-60,4 Q0,-16 60,4" stroke="#4A7CB0" stroke-width="2" fill="none" opacity=".7"/>
    <circle r="60" fill="none" stroke="#7CDCF5" stroke-width="2.5" opacity=".65"/>
  </g>`;
}
/** strings: {x,z}: all sensors listed so the wavefront can light them from their true place */
export function strings(P, list, tag0 = "") {
  let out = "", doms = [];
  list.forEach((st, si) => {
    const sc = st.z, x = st.x, step = 212 * sc, n = Math.ceil((1800) / step);
    const col = st.col;
    let s = `<path d="M${x},-400 V1500" stroke="${col}" stroke-width="${Math.max(1.4, 6 * sc)}"/>`;
    for (let i = 0; i < n; i++) {
      const y = -300 + st.y0 * step + i * step;
      const id = `${P}${tag0}d${si}_${i}`;
      s += `<g transform="translate(${x} ${f1(y)}) scale(${(sc * 0.72).toFixed(3)})"><use href="#${P}dom" opacity="${Math.min(1, 0.32 + sc * 0.75).toFixed(2)}"/></g>
        <circle id="${id}" cx="${x}" cy="${f1(y)}" r="${f1(sc * 150)}" fill="url(#${P}g0)" opacity="0"/>`;
      doms.push({ id, x, y: +y.toFixed(1), z: sc });
    }
    out += grp(`${P}${tag0}s${si}`, s);
  });
  return { out, doms };
}
export function iceDefs(P) {
  return lin(P + "ice", [[0, "#10356E"], [0.4, "#0A2152"], [1, "#040E2C"]]) +
    rad(P + "domBody", [[0, "#26508C"], [0.7, "#112B5F"], [1, "#0A1A42"]], 0.4, 0.3, 0.8) +
    lin(P + "domBase", [[0, "#0A1432"], [1, "#203F72"]]) +
    rad(P + "g0", [[0, "#FFFFFF", 1], [0.16, "#9FF0FF", 0.95], [0.45, "#40BEFF", 0.4], [1, "#40BEFF", 0]]) +
    rad(P + "gR", [[0, "#FFFFFF", 1], [0.16, "#FFB29E", 0.95], [0.45, "#F4564F", 0.45], [1, "#F4564F", 0]]) +
    rad(P + "gO", [[0, "#FFFFFF", 1], [0.16, "#FFE29C", 0.95], [0.45, "#F7A63A", 0.45], [1, "#F7A63A", 0]]) +
    rad(P + "gG", [[0, "#FFFFFF", 1], [0.16, "#C6FFC2", 0.95], [0.45, "#49D88A", 0.42], [1, "#49D88A", 0]]) +
    rad(P + "gB", [[0, "#FFFFFF", 1], [0.16, "#BBD9FF", 0.95], [0.45, "#5A8CFF", 0.42], [1, "#5A8CFF", 0]]) +
    rad(P + "haze", glowStops("#3F7BC4", 0.3)) +
    lin(P + "band", [[0, "#6E9AD0", 0], [0.5, "#6E9AD0", 0.2], [1, "#6E9AD0", 0]]) +
    lin(P + "cone", [[0, "#D8F7FF", 0.92], [0.28, "#55B8FF", 0.52], [1, "#2E6CFF", 0]], 1, 0, 0, 0) +
    rad(P + "impact", [[0, "#FFFFFF"], [0.3, "#D6FBFF", 0.9], [1, "#7CDCF5", 0]]);
}
export function iceBack(P, seed = 5) {
  const R = rng(seed);
  return `<rect x="-400" y="-400" width="2720" height="1880" fill="url(#${P}ice)"/>
    <ellipse cx="960" cy="400" rx="1100" ry="620" fill="url(#${P}haze)"/>
    ${rep(9, (i) => `<rect x="-400" y="${f1(-100 + i * 150 + R() * 70)}" width="2720" height="${f1(30 + R() * 80)}" fill="url(#${P}band)"/>`)}
    ${rep(150, () => `<circle cx="${f1(R() * 2400 - 240)}" cy="${f1(R() * 1600 - 260)}" r="${f1(0.8 + R() * 2.4)}" fill="#BCE7FF" opacity="${f1(0.14 + R() * 0.4)}"/>`)}`;
}

export function buildFlash() {
  const P = "f-";
  const start = +(T.s26[0] - 0.5).toFixed(3), DUR = +(T.s29[0] - 0.05 - start).toFixed(2);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const defs = iceDefs(P) + nuDefs(P, "#33C8B7", "#8FF5E2") + dom(P, P + "dom") +
    `<linearGradient id="${P}track" x1="0" x2="1"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset="0.8" stop-color="#D8F7FF"/><stop offset="1" stop-color="#fff"/></linearGradient>`;
  const R = rng(9);
  const far = [], mid = [], near = [];
  for (let i = 0; i < 17; i++) far.push({ x: f1(-80 + i * 124 + R() * 80), y0: R(), z: 0.17 + R() * 0.06, col: "#2A5A99" });
  for (let i = 0; i < 7; i++) mid.push({ x: f1(60 + i * 268 + R() * 120), y0: R(), z: 0.38 + R() * 0.1, col: "#2A5A99" });
  near.push({ x: 1420, y0: 0.2, z: 1.06, col: "#3D73B5" }, { x: 330, y0: 0.55, z: 0.92, col: "#3D73B5" }, { x: 1010, y0: 0.82, z: 0.72, col: "#34689F" });
  const SF = strings(P, far, "a"), SM = strings(P, mid, "b"), SN = strings(P, near, "c");
  const all = [...SF.doms, ...SM.doms, ...SN.doms];
  const fg = `<g transform="translate(1810 0) scale(1.9)"><path d="M0,-400 V1500" stroke="#071230" stroke-width="10"/>${rep(5, (i) => `<g transform="translate(0 ${80 + i * 300})"><circle r="82" fill="#061029"/><path d="M-60,-50 A80,80 0 0 1 20,-76" stroke="#2F5A98" stroke-width="7" fill="none"/></g>`)}</g>`;
  // Event geometry: neutrino descends from upper-right; muon continues down-left through the array.
  const VX = 880, VY = 440, ANG = 152; // direction of travel, degrees
  const body = `
  <g id="${P}camBack">${iceBack(P)}</g>
  ${grp(P + "camFar", SF.out)}
  <rect x="-20" y="-20" width="1960" height="1120" fill="#061740" opacity=".42"/>${grp(P + "camMid", SM.out)}<rect x="-20" y="-20" width="1960" height="1120" fill="#061740" opacity=".3"/>
  ${streakField(P, P + "pass", 16)}
  ${grp(P + "heroL", g(P + "hero", 0, 0, `<g transform="scale(2.3)"><use href="#${P}nu"/></g>`))}
  ${grp(P + "camNear", SN.out)}
  <g id="${P}evL">${g(P + "ev", VX, VY, `
     <g transform="rotate(${ANG})">
       <g id="${P}coneG" data-b="0,0" opacity="0"><polygon id="${P}conep" points="0,0 -10,-6 -10,6" fill="url(#${P}cone)"/></g>
       <path id="${P}ln" d="M0,0 L10,0" stroke="url(#${P}track)" stroke-width="7" stroke-linecap="round"/>
       <g id="${P}mu" data-b="0,0" opacity="0"><circle r="42" fill="url(#${P}impact)"/><circle r="9" fill="#fff"/></g>
     </g>
     ${g(P + "imp", 0, 0, `<circle r="170" fill="url(#${P}impact)"/>${rep(12, (i) => `<path transform="rotate(${i * 30 + (i % 2) * 11})" d="M26,0 L${84 + (i % 3) * 40},0" stroke="#fff" stroke-width="${3 + (i % 3)}" stroke-linecap="round"/>`)}`, `opacity="0"`)}
     <circle id="${P}bloom" cx="-440" cy="235" r="980" fill="url(#${P}g0)" opacity="0"/>
     ${g(P + "ghost", 0, 0, `<path id="${P}ghostP" d="M0,-18 C3,-6 7,-3 16,9 C6,5 -6,5 -16,9 C-7,-3 -3,-6 0,-18Z" fill="#8FF5E2" fill-opacity=".08" stroke="#8FF5E2" stroke-width="1.5" stroke-dasharray="3.2 2.6"/>`, `opacity="0"`)}
     ${g(P + "eye", 0, -176, `<path d="M-74,0 Q0,-62 74,0 Q0,62 -74,0Z" fill="#0A1A40" stroke="${C.chalk}" stroke-width="7" stroke-linejoin="round"/><circle r="23" fill="${C.chalk}"/><circle r="11" fill="#0A1A40"/><path d="M-66,48 L66,-48" stroke="${C.coral}" stroke-width="12" stroke-linecap="round"/>`, `opacity="0"`)}
  `)}</g>
  <path id="${P}fit" d="M-140,1190 L1990,44" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="2500" stroke-dashoffset="2500" opacity="0"/>
  <rect id="${P}dim" x="-20" y="-20" width="1960" height="1120" fill="#050B24" opacity="0"/>
  ${grp(P + "data", rep(all.length, (i) => `<circle id="${P}dot${i}" cx="${all[i].x}" cy="${all[i].y}" r="2" fill="#fff" opacity="0"/>`))}
  <g id="${P}arrowL"><path id="${P}arrow" d="M0,0" stroke="#FFF0DA" stroke-width="6" fill="none" stroke-linecap="round"/>
  <path id="${P}arrowH" d="M0,-18 L34,0 L0,18Z" fill="#FFF0DA" opacity="0"/></g>
  ${grp(P + "fgS", fg)}
  ${tag(P + "tMu", 330, 830, "charged particle", { size: 40, bg: "#D8F7FF" })}
  ${tag(P + "tBlue", 700, 960, "flash of blue light", { size: 40, bg: "#7CDCF5" })}
  ${tag(P + "tGhost", 1040, 454, "the neutrino itself: never seen", { size: 34, bg: C.seaL })}
  ${tag(P + "tHits", 660, 118, "sensor hits: red first, blue last", { size: 34, bg: C.chalk })}
  ${tag(P + "tDir", 1110, 200, "reconstructed direction", { size: 40, bg: C.citrus })}
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const all=${JSON.stringify(all)};
  const VX=${VX},VY=${VY},ANG=${ANG}*Math.PI/180, ux=Math.cos(ANG), uy=Math.sin(ANG);
  const t0=${L("s26", 2.65)}; // impact on "interacts"
  const tf=${L("s26", 5.7)}; // bloom on "sudden flash"
  const v=330; // px/s: stylised so the event can be read
  const dr=${L("s28", 0.2)};
  // camera: slow lateral dolly holds the rig; then a hard stop at impact, gentle recoil
  const cam={x:[[0,-140],[t0-.05,0,'sine.out'],[t0+.3,18,'power2.out'],[${L("s28", 0.1)},70,'sine.inOut'],[${DUR},100,'sine.inOut']],
    y:[[0,70],[t0-.05,0,'sine.out'],[t0+.3,-10,'power2.out'],[99,-10]],
    z:[[0,1.0],[t0-.05,1.08,'sine.inOut'],[t0+.28,1.03,'power2.out'],[tf,1.03],[tf+.12,1.0,'power2.out'],[${DUR},1.07,'sine.inOut']]};
  S.camera(cam,[[P+"camBack",.25],[P+"camFar",.35],[P+"camMid",.6],[P+"camNear",1],[P+"pass",.9],[P+"fgS",1.7],[P+"evL",1],[P+"heroL",1],[P+"data",1],[P+"arrowL",1]]);
  // "almost nothing touches": a sparse pass-through field, hero aimed at the vertex
  S.streaks(P+"pass",{n:16,angle:${ANG},speed:1050,seed:8,scale:1.4,alpha:.75,density:(T)=>S.ev([[0,1],[t0-.1,1],[t0+.6,.25]],T)});
  const hStart=t0-1.0;
  S.k(P+"hero",{x:[[hStart,VX-ux*1100],[t0,VX,'none']], y:[[hStart,VY-uy*1100],[t0,VY,'none']], r:[[0,${ANG}]], o:[[hStart,0],[hStart+.08,1],[t0+.01,1],[t0+.02,0]]});
  S.k(P+"imp",{o:[[t0-.01,0],[t0+.02,1],[t0+.5,0,'power2.out']], s:[[t0,.25],[t0+.5,1.35,'power3.out']], r:[[t0,0],[t0+.5,24]]});
  // Muon + Cherenkov cone. asymmetric, real geometry from the angle in ice
  const tan=Math.tan(41*Math.PI/180), L_END=1420;
  S.at((T)=>{ const dt=Math.max(0,T-t0); const d=Math.min(dt*v,L_END);
    const on=T>=t0?1:0;
    S.set(P+"mu","x",d); S.set(P+"mu","o",on*(d<L_END?1:0));
    S.set(P+"ln","d",\`M0,0 L\${Math.max(10,d).toFixed(1)},0\`); S.set(P+"ln","a:opacity",on*NU.clamp(1-(T-tf-1.4)/1.0));
    const behind=Math.min(d,620), w=behind*tan;
    S.set(P+"conep","a:points",\`\${d.toFixed(1)},0 \${(d-behind).toFixed(1)},\${(-w).toFixed(1)} \${(d-behind).toFixed(1)},\${w.toFixed(1)}\`);
    S.set(P+"coneG","o",on*NU.clamp(1-(T-tf-1.6)/.7)*(T<tf?NU.clamp((T-t0)/1.2)*.42:.42+.58*Math.exp(-(T-tf)*.7)));
    // Each sensor reacts when the light cone reaches it, brighter when closer.
    const colMap=["gR","gO","gG","g0","gB"];
    for(let i=0;i<all.length;i++){ const D=all[i];
      const rx=D.x-VX, ry=D.y-VY, along=rx*ux+ry*uy, perp=Math.abs(-rx*uy+ry*ux);
      const reach=Math.max(0,along)+perp/tan*.55;
      const hit=t0+reach/v;
      const k=T-hit;
      const close=NU.clamp(1-perp/(380+200*D.z));
      const inAhead=along>-60 && along<L_END+60;
      const e=S.el(D.id);
      let a=0;
      if(T>=t0 && inAhead && close>.02 && k>=0){ const att=k<.08?k/.08:Math.exp(-(k-.08)*.26); a=Math.min(1,close*att*1.5); if(T>=tf){ a=Math.max(a,close*Math.exp(-(T-tf)*.75)*Math.min(1,(T-tf)/.05)); } a*=1+.14*Math.sin(T*5+i); }
      if(e.__c===undefined){ e.setAttribute("fill",\`url(#\${P}g0)\`); e.__c=1; }
      e.setAttribute("opacity",a.toFixed(3));
      e.setAttribute("r",(D.z*(70+close*140)*(1+(a>0?(k<.2?(.2-k)*2.2:0):0))).toFixed(1));
      const dotT=dr+.05+(reach/1500)*.65; const hitOK=inAhead&&close>.05;
      S.set(P+"dot"+i,"o",(T>=dotT&&hitOK)?1:0);
      if(hitOK){ S.set(P+"dot"+i,"a:r",(4+close*(10+22*D.z))*NU.clamp(.2+(T-dotT)/.12,.2,1)); S.set(P+"dot"+i,"fill",["#F4564F","#F7A63A","#6FE08F","#55C8FF","#8C96FF"][Math.min(4,Math.floor((reach/1500)*5))]); }
      if(T>dr+.1) e.setAttribute("opacity",(a*.25).toFixed(3));
    }
  });
  // Standing by: DOMs twitch only faintly until impact (a lit noise blink, deterministic)
  // DATA RECONSTRUCTION: world drops away, hits remain, track fit grows through them
  S.k(P+"dim",{o:[[dr-.5,0],[dr+.25,.72,'power2.inOut']]});
  S.k(P+"camNear",{o:[[dr-.3,1],[dr+.2,.3]]});
  S.k(P+"camMid",{o:[[dr-.3,1],[dr+.2,.4]]});
  S.k(P+"fgS",{o:[[dr-.3,1],[dr+.2,.2]]});
  // Fit arrow (runs back UP the track: that's where the neutrino came from)
  const af=dr+.75;
  S.at((T)=>{ const P0={x:VX+ux*1000,y:VY+uy*1000}, P1={x:VX-ux*1120,y:VY-uy*1120};
    const p=gsap.parseEase("power2.inOut")(NU.clamp((T-af)/1.45));
    const X=P0.x+(P1.x-P0.x)*p, Y=P0.y+(P1.y-P0.y)*p;
    S.set(P+"arrow","d",\`M\${P0.x.toFixed(1)},\${P0.y.toFixed(1)} L\${X.toFixed(1)},\${Y.toFixed(1)}\`);
    S.set(P+"arrow","a:opacity",T>af?1:0);
    S.set(P+"arrowH","a:transform",\`translate(\${X.toFixed(1)} \${Y.toFixed(1)}) rotate(\${(${ANG}+180)})\`);
    S.set(P+"arrowH","a:opacity",T>af+.02?1:0); });
  S.k(P+"ghost",{ o:[[${L("s27", -0.05)},0],[${L("s27", 0.15)},1],[${L("s27", 2.3)},1],[${L("s27", 2.5)},0]], s:[[${L("s27", -0.05)},3],[${L("s27", 0.3)},6.4,'back.out(2)'],[${L("s27", 2.5)},7,'none']], r:[[${L("s27", -0.05)},-30],[${L("s27", 2.5)},50,'none']] });
  S.k(P+"eye",{ o:[[${L("s27", 0.35)},0],[${L("s27", 0.5)},1],[${L("s27", 2.3)},1],[${L("s27", 2.5)},0]], s:[[${L("s27", 0.35)},.6],[${L("s27", 0.65)},1,'back.out(2.2)']] });
  S.k(P+"bloom",{ o:[[tf-.04,0],[tf+.07,.82,'power2.out'],[tf+1.9,0,'power2.out']], s:[[tf-.04,.55],[tf+.5,1.05,'power2.out']] });
  S.at((T)=>{ S.set(P+"ghostP","a:stroke-dashoffset",-T*7);
    for(let i=0;i<all.length;i++){ if(T>dr){ const k=.92+.1*Math.sin(T*3+i*.7); const v=S.get(P+"dot"+i,"a:r",0); if(v) S.set(P+"dot"+i,"a:r",v*k); } } });
  S.k(P+"tGhost",{o:[[${L("s27", 0.1)},0],[${L("s27", 0.25)},1],[${L("s27", 2.3)},1],[${L("s27", 2.5)},0]], x:[[${L("s27", 0.1)},26],[${L("s27", 0.4)},0,'power3.out']]});
  S.k(P+"tMu",{o:[[t0+.68,0],[t0+.82,1],[${L("s27", -0.2)},1],[${L("s27", 0.0)},0]], y:[[t0+.68,16],[t0+.95,0,'power3.out']]});
  S.k(P+"tBlue",{o:[[tf+.1,0],[tf+.24,1],[${L("s27", -0.2)},1],[${L("s27", 0.0)},0]], s:[[tf+.1,.7],[tf+.4,1,'back.out(2)']]});
  S.k(P+"tHits",{o:[[dr+.25,0],[dr+.4,1],[af+1.2,1],[af+1.4,0]]});
  S.k(P+"tDir",{o:[[af+1.25,0],[af+1.4,1]], y:[[af+1.25,16],[af+1.5,0,'power3.out']]});
  `;
  writeScene("flash", DUR, { defs, body, script, bg: "#071A45" });
}
