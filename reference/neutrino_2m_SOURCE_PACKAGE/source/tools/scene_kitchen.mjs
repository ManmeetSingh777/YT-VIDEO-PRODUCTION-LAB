import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, streakField, heroNu, charDefs, character, label, tag, writeScene, f1 } from "./lib.mjs";
import { kitchenDefs, kitchenBack, kitchenFg, kettle, lamp } from "./art_kitchen.mjs";
export const T = JSON.parse(fs.readFileSync("tools/timing.json"));

// Apartment block that wraps the kitchen: the room is the camera-side window.
function facade(P) {
  const R = rng(91);
  const xs = [], W = 2640, H = 1760;
  let s = `<rect x="-10600" y="-8400" width="23200" height="22000" fill="url(#${P}brick)"/>`;
  // big surface shading + floors
  for (let r = -5; r <= 8; r++) s += `<rect x="-10600" y="${-290 + r * H}" width="23200" height="70" fill="#7A3A36" opacity=".8"/><rect x="-10600" y="${-222 + r * H}" width="23200" height="16" fill="#3E1E22" opacity=".5"/>`;
  for (let r = -4; r <= 7; r++) for (let c = -4; c <= 4; c++) {
    if (r === 0 && c === 0) continue;
    const x = 960 + c * W, y = 540 + r * H;
    const lit = R();
    const hue = lit < 0.55 ? "#FFD98A" : lit < 0.72 ? "#7CDCF5" : lit < 0.82 ? "#F46E67" : "#1A2455";
    const dark = hue === "#1A2455";
    s += `<rect x="${x - 800}" y="${y - 500}" width="1600" height="1000" fill="#1B1534"/>
      <rect x="${x - 760}" y="${y - 460}" width="1520" height="920" fill="${hue}" opacity="${dark ? 1 : 0.9}"/>
      ${dark ? "" : `<rect x="${x - 760}" y="${y + 120}" width="1520" height="340" fill="#3D2850" opacity=".5"/>`}
      ${!dark && R() < 0.6 ? `<g transform="translate(${x + (R() - 0.5) * 900} ${y + 460})"><circle cy="-420" r="90" fill="#2A1F46"/><path d="M-130,0 C-130,-200 -90,-330 0,-330 C90,-330 130,-200 130,0Z" fill="#2A1F46"/></g>` : ""}
      <path d="M${x - 760},${y - 460} h520 C${x - 280},${y - 200} ${x - 480},${y + 100} ${x - 760},${y + 240}Z" fill="${C.coral}" opacity="${dark ? 0.2 : 0.75}"/>
      <path d="M${x + 760},${y - 460} h-420 C${x + 420},${y - 180} ${x + 560},${y + 40} ${x + 760},${y + 180}Z" fill="#E85C5C" opacity="${dark ? 0.2 : 0.65}"/>
      <rect x="${x - 860}" y="${y + 500}" width="1720" height="70" fill="#D9B98F"/><rect x="${x - 860}" y="${y - 540}" width="1720" height="50" fill="#A7502F"/>`;
    if (R() < 0.45) s += `<rect x="${x - 700}" y="${y + 420}" width="1400" height="90" rx="10" fill="#7A3A36"/>${rep(8, (k) => `<circle cx="${x - 620 + k * 180}" cy="${y + 400}" r="${40 + R() * 40}" fill="${k % 2 ? "#2FA79B" : C.coral}"/>`)}`;
  }
  // masonry detail
  for (let i = 0; i < 620; i++) { const bx = -10600 + R() * 23200, by = -8400 + R() * 22000; s += `<rect x="${f1(bx)}" y="${f1(by)}" width="${f1(120 + R() * 200)}" height="52" fill="${R() < 0.5 ? "#B55A36" : "#6A2E2C"}" opacity="${f1(0.25 + R() * 0.4)}"/>`; }
  s += `<rect x="-1400" y="-8400" width="70" height="22000" fill="#41252C"/><rect x="3380" y="-8400" width="70" height="22000" fill="#41252C"/>`;
  // roof, tank, antenna
  s += `<rect x="-10800" y="-8600" width="23600" height="360" fill="#2E1D30"/>
    <g transform="translate(5400 -8600)"><rect x="-1100" y="-1800" width="2200" height="1800" fill="#3B2B3E"/><polygon points="-1250,-1800 0,-3000 1250,-1800" fill="#23182E"/><path d="M-1000,0 L-1000,-500 M1000,0 L1000,-500" stroke="#150F20" stroke-width="130"/></g>
    <path d="M-5000,-8600 V-11200" stroke="#150F20" stroke-width="90"/><path d="M-5800,-10500 H-4200 M-5500,-10000 H-4500" stroke="#150F20" stroke-width="56"/>`;
  return s;
}
function holeFrame(P) {
  // the hero window: frame, sill, curtains and flowers that sweep into frame during the pullback
  return `
   <path d="M-420,-400 H2340 V1480 H-420Z M-46,-46 V1126 H1966 V-46Z" fill="#8C4230" fill-rule="evenodd"/>
   <path d="M-46,-46 H1966 V1126 H-46Z" fill="none" stroke="#E9D3B4" stroke-width="110"/>
   <path d="M-100,-100 H2020 V1180 H-100Z" fill="none" stroke="#A7502F" stroke-width="30"/>
   <rect x="-170" y="1180" width="2260" height="110" fill="#D9B98F"/><rect x="-140" y="1290" width="2200" height="40" fill="#5C2E30"/>
   
  `;
}
function city(P, id, y, seed, col, n, hMin, hMax, litP) {
  const R = rng(seed);
  let s = "", x = -6000;
  while (x < 7900) {
    const w = 220 + R() * 340, h = hMin + R() * (hMax - hMin);
    s += `<rect x="${f1(x)}" y="${f1(y - h)}" width="${f1(w)}" height="${f1(h + 3000)}" fill="${col}"/>`;
    if (R() < 0.3) s += `<rect x="${f1(x + w * 0.4)}" y="${f1(y - h - 90)}" width="${f1(w * 0.2)}" height="90" fill="${col}"/>`;
    for (let wy = y - h + 26; wy < y + 900; wy += 58) for (let wx = x + 20; wx < x + w - 34; wx += 52)
      if (R() < litP) s += `<rect x="${f1(wx)}" y="${f1(wy)}" width="24" height="32" fill="${R() < 0.25 ? C.coral : R() < 0.5 ? "#7CDCF5" : "#FFD98A"}" opacity="${f1(0.5 + R() * 0.5)}"/>`;
    x += w + R() * 30;
  }
  return grp(id, s);
}

export function buildKitchen() {
  const P = "k-";
  const DUR = 15.3;
  const defs = kitchenDefs(P) + nuDefs(P) + charDefs(P) +
    lin(P + "bk0", [[0,"#000",0],[1,"#000",0]]) + lin(P + "brick", [[0, "#A7502F"], [0.5, "#8C4230"], [1, "#6E3030"]]) +
    lin(P + "sky", [[0, "#080E2A"], [0.45, "#1A2A66"], [0.75, "#4A3F86"], [1, "#B8667F"]]) +
    lin(P + "bfTable", [[0, "#B46A3F"], [1, "#6E3A25"]]) +
    lin(P + "egg", [[0, "#FFF9EC"], [1, "#E9D9BD"]]) +
    lin(P + "yolk", [[0, "#FFE680"], [1, "#F3A93B"]], 0.2, 0, 0.7, 1) +
    lin(P + "toast", [[0, "#F9D594"], [1, "#D1893F"]]) +
    rad(P + "xglow", glowStops(C.seaL, 0.42)) +
    `<clipPath id="${P}frame"><rect width="1920" height="1080"/></clipPath>`;

  const body = `
  <rect width="1920" height="1080" fill="url(#${P}sky)"/>
  ${grp(P + "cityFar", `<circle cx="1500" cy="-1200" r="240" fill="#FFF0DA" opacity=".85"/>` + city(P, P + "c1", 300, 3, "#2D3380", 70, 500, 1300, 0.24))}
  ${grp(P + "cityMid", city(P, P + "c2", 660, 4, "#1D2260", 40, 400, 1500, 0.22))}
  ${grp(P + "cityNear", city(P, P + "c3", 1100, 5, "#111640", 22, 300, 1900, 0.2))}
  ${streakField(P, P + "fFar", 34)}
  ${g(P + "world", 960, 540, `<g transform="translate(-960 -540)">
    ${grp(P + "facadeG", facade(P) + holeFrame(P))}
    <g clip-path="url(#${P}frame)">
    ${grp(P + "lBack", kitchenBack(P) + kettle(P))}
    <rect id="${P}dim" x="-400" y="-300" width="2720" height="1680" fill="#0A1030" opacity="0"/>
    ${lamp(P)}
    ${streakField(P, P + "fB", 240)}
    ${grp(P + "lMid", `
      <ellipse id="${P}shadow" cx="860" cy="972" rx="190" ry="26" fill="#0B0A22" opacity=".55"/>
      ${g(P + "pos", 860, 732, character(P))}
    `)}
    ${streakField(P, P + "fF", 240)}
    ${g(P + "hero1", 0, 0, `<g transform="scale(1.7)"><use href="#${P}nu"/></g>`, `opacity="0"`)}
    ${grp(P + "lFg", kitchenFg(P))}
    </g>
    <g id="${P}box" opacity="0"><rect x="-90" y="1050" width="2100" height="130" rx="14" fill="#7A3A36"/>
   ${(() => { const R = rng(12); return rep(26, (k) => `<circle cx="${-60 + k * 80}" cy="${1040 - R() * 24}" r="${34 + R() * 26}" fill="${k % 3 === 0 ? C.coral : k % 3 === 1 ? "#2FA79B" : C.citrus}"/>`); })()}</g>
  </g>`)}
  ${streakField(P, P + "fNear", 60)}
  ${grp(P + "bf", `
    <rect width="1920" height="1080" fill="url(#${P}bfTable)"/>
    ${rep(9, (i) => `<path d="M-40,${60 + i * 126} Q900,${20 + i * 136} 1960,${90 + i * 118}" stroke="#8C4E30" stroke-width="5" fill="none" opacity=".5"/>`)}
    <ellipse cx="1000" cy="640" rx="780" ry="350" fill="#4B2619" opacity=".5"/>
    <ellipse cx="980" cy="590" rx="780" ry="350" fill="#F6E8D2"/>
    <ellipse cx="980" cy="580" rx="630" ry="270" fill="#E0CCAE"/>
    <ellipse cx="980" cy="566" rx="630" ry="270" fill="#FFF4E1"/>
    <g transform="translate(405 545) rotate(-12)">
      <path d="M-120,-96 C-168,-132 -158,-178 -96,-176 C-40,-196 60,-196 104,-176 C168,-178 172,-126 128,-92 L132,110 Q0,132 -126,110Z" fill="#C2803F" transform="translate(10 16)"/>
      <path d="M-120,-96 C-168,-132 -158,-178 -96,-176 C-40,-196 60,-196 104,-176 C168,-178 172,-126 128,-92 L132,110 Q0,132 -126,110Z" fill="url(#${P}toast)"/>
      <path d="M-100,-86 C-132,-120 -124,-154 -86,-154 C-36,-170 56,-170 94,-154 C136,-154 140,-118 108,-84 L110,92 Q0,110 -104,92Z" fill="#FBE2AC"/>
      <g fill="#D79A52" opacity=".5">${(() => { const R = rng(5); return rep(30, () => `<ellipse cx="${f1(-90 + R() * 180)}" cy="${f1(-130 + R() * 215)}" rx="${f1(4 + R() * 8)}" ry="${f1(2.5 + R() * 4)}"/>`); })()}</g>
    </g>
    <path d="M780,600 C760,440 960,360 1100,380 C1260,396 1420,380 1460,520 C1490,640 1320,720 1120,710 C960,706 800,720 780,600Z" fill="url(#${P}egg)"/>
    <path d="M790,620 C840,700 980,700 1120,710 C1320,720 1490,640 1460,520 C1440,640 1200,660 1060,650 C940,650 830,660 790,620Z" fill="#D9C39F" opacity=".6"/>
    ${g(P + "yolkG", 1110, 520, `<ellipse rx="150" ry="118" fill="#E08D2A" cy="10"/><ellipse rx="146" ry="112" fill="url(#${P}yolk)"/><ellipse cx="-52" cy="-44" rx="44" ry="24" fill="#fff" opacity=".78" transform="rotate(-20 -52 -44)"/>`)}
    ${g(P + "fork", 1960, 880, `<path d="M-40,0 L-720,-150" stroke="#CDD3E2" stroke-width="30" stroke-linecap="round"/><path d="M-740,-180 l-160,-40 M-740,-150 l-170,-38 M-746,-120 l-170,-38" stroke="#E5EAF4" stroke-width="16" stroke-linecap="round"/><path d="M-700,-182 L-740,-110" stroke="#CDD3E2" stroke-width="44" stroke-linecap="round"/>
      <circle cx="-20" cy="0" r="80" fill="${C.skin}"/><path d="M-20,-70 C50,-90 120,-40 140,40 L20,80Z" fill="${C.must}"/>`)}
    ${streakField(P, P + "fBf", 46)}
    ${g(P + "hero2", 0, 0, `<g transform="scale(2.7)"><use href="#${P}nu"/></g>`)}
  `, `style="display:none"`)}
  ${grp(P + "type", `
    ${label(P + "t1", 1210, 160, "1", { size: 120, font: "Archivo Black", fill: C.seaL })}
    <g id="${P}t1k" data-b="1210,160" transform="translate(1210 160)" opacity="0"><text class="tA" font-size="120" fill="${C.seaL}">1,000</text>
      <path id="${P}t1kx" d="M-10,-30 L370,-60" stroke="${C.coral}" stroke-width="14" stroke-linecap="round" stroke-dasharray="400" stroke-dashoffset="400"/></g>
    <g id="${P}num" data-b="1100,136" transform="translate(1100 136)" opacity="0">
      <text id="${P}numT" class="tA" font-size="66" fill="${C.citrus}" stroke="${C.ink}" stroke-width="10" paint-order="stroke" letter-spacing="-1">100</text>
      <text id="${P}numS" y="50" font-weight="700" font-size="32" fill="${C.chalk}" stroke="${C.ink}" stroke-width="7" paint-order="stroke" opacity="0">≈ 100 trillion, every single second</text>
    </g>
    ${tag(P + "nameTag", 1110, 300, "neutrino", { size: 54, bg: C.seaL })}
    <g id="${P}mNote" data-b="60,1030" transform="translate(60 1030)" opacity="0"><text font-weight="500" font-size="24" fill="${C.chalk}" stroke="${C.ink}" stroke-width="5" paint-order="stroke">Streaks are a drawing aid: real neutrinos are invisible.</text></g>
  `)}
  ${grp(P + "cloudwipe", rep(1, () => ""))}
  `;

  const script = `
  const t = ${JSON.stringify(T)};
  const P = ${JSON.stringify(P)};
  
  S.show(P+"bf",10.0,11.2);
  // inner room camera: 3 true depth planes
  S.camera({ x:[[0,-10],[4.3,20,'sine.inOut'],[8.2,-40,'sine.inOut'],[10,-90]], y:[[0,10],[4.3,-6],[8.2,40],[10,70]], z:[[0,1.0],[4.3,1.03,'sine.inOut'],[8.1,1.05],[9.7,1.26,'power2.inOut'],[10,1.3],[11.2,1.0,'none'],[12,1,'none']] },
    [[P+"lBack",0.82],[P+"lMid",1],[P+"lFg",1.32],[P+"fB",0.86],[P+"fF",1.05]]);
  // room-to-city pullback: object (window) becomes one lit cell in a whole city
  S.k(P+"world",{ s:[[0,1],[11.2,1],[12.15,0.34,'power3.inOut'],[14.3,0.235,'sine.inOut'],[15.3,0.045,'power3.in']] });
  S.at((T)=>{ const z=S.get(P+"world","s",1);
    const p=NU.clamp((1-z)/0.955);
    const place=(id,d,y0)=>{ const sc=Math.pow(z,d); const e=S.el(id); e.setAttribute("transform",\`translate(960 \${(540+y0*(1-p)).toFixed(1)}) scale(\${sc.toFixed(4)}) translate(-960 -540)\`); };
    place(P+"cityFar",0.25,380); place(P+"cityMid",0.42,560); place(P+"cityNear",0.62,820);
  });
  S.k(P+"facadeG",{o:[[10.9,0],[11.2,1,'none']]}); S.k(P+"box",{o:[[11.25,0],[11.3,1]]});
  // neutrino streak fields; same seed in back/front so a streak reads as passing THROUGH things
  const den=(T)=> S.ev([[0,0.02],[3.1,0.012],[3.4,0.09],[4.3,0.11],[5.3,1,'power2.in'],[99,1]],T);
  const fo={angle:62,speed:1250,area:[-300,-300,2520,1680],seed:3,density:den};
  S.streaks(P+"fB",{...fo,n:240,alpha:1,scale:1.5});
  S.streaks(P+"fF",{...fo,n:240,alpha:0.5,scale:1.5});
  S.k(P+"dim",{o:[[4.3,0],[5.5,0.42],[9.6,0.42],[10,0.1]]});
  S.streaks(P+"fFar",{n:34,angle:62,speed:900,seed:8,scale:0.55,alpha:0.8,density:(T)=>NU.clamp((T-11.2)/1)});
  S.streaks(P+"fNear",{n:60,angle:62,speed:1500,seed:15,scale:0.7,alpha:0.85,density:(T)=>S.ev([[11.4,0],[12.6,0.75],[14.8,1]],T)});
  S.streaks(P+"fBf",{n:46,angle:41,speed:1050,seed:5,scale:1.6,alpha:0.7,density:()=>1});
  // hero spark: first image of the film goes through canopy, chest, floor
  S.k(P+"hero1",{ x:[[0,620],[0.9,1120,'none']], y:[[0,-60],[0.9,1000,'none']], o:[[0,1],[0.85,1],[0.95,0]], r:[[0,64.8]] });
  // hero in close-up crosses yolk, exits toward the window
  S.k(P+"hero2",{ x:[[10.05,160],[11.1,1720,'none']], y:[[10.05,-120],[11.1,1200,'none']], r:[[10,39.7]] });
  S.k(P+"yolkG",{ sy:[[10.5,1],[10.62,0.96],[10.8,1.015],[11,1]], sx:[[10.5,1],[10.62,1.03],[10.8,0.99],[11,1]] });
  S.k(P+"fork",{ x:[[10,60],[10.7,-70,'power2.out'],[11.2,-90]], y:[[10,90],[10.7,0,'power2.out']], r:[[10,6],[10.7,0,'power2.out'],[10.9,1.5]] });

  // ACTING -------------------------------------------------------------
  const A = S.actor(P,{armR:-142,foreR:-30,armL:10,foreL:-20,head:-4,lookX:0.2,lookY:-0.2,mouth:"m",X:0});
  A.umbOpen=[[0,1],[9,1]]; A.umbTilt=[[0,9],[0.55,3],[0.75,12],[1.1,8],[8.3,8],[9.2,-14]];
  // 0.5 hit passes: anticipate (compress), flinch up with eyes on canopy
  A.pose(0.38,{squash:0.45,head:6,lid:0.6,brow:-0.6},0.12,"power2.in");
  A.pose(0.52,{squash:-0.25,head:-16,faceY:-10,lookY:-1,lookX:0.1,lid:1.15,brow:1,mouth:"o",armR:-152,foreR:-22},0.16,"power3.out");
  A.pose(0.9,{squash:0,head:-10,faceY:-7,armR:-146},0.3,"sine.out");
  // "Not one thing" -- checks chest, then lifts free palm
  A.pose(1.75,{head:12,faceY:6,lookY:1,lookX:-0.2,brow:0.4,mouth:"m",torso:-2},0.3);
  A.pose(2.2,{armL:128,foreL:50,spread:1,lookX:-0.9,lookY:-0.3,head:-8,faceX:-8,faceY:-2},0.34,"back.out(1.6)");
  // "Not a thousand" -- head darts as more arrive
  A.pose(3.2,{head:12,faceX:14,lookX:1,brow:1.1,browTilt:0.5,mouth:"o"},0.14,"power3.out");
  A.pose(3.62,{head:-12,faceX:-16,lookX:-1},0.14,"power3.out");
  // flood: tries to cover, umbrella jab, cringe
  A.pose(4.4,{squash:0.5,armR:-160,foreR:-8,armL:150,foreL:-36,head:6,faceY:8,lookY:-1,lid:0.75,browTilt:1,mouth:"frown"},0.2,"power2.out");
  A.pose(5.3,{squash:0.32,head:-8,faceX:10,lookX:0.8},0.3);
  A.pose(6.0,{head:10,faceX:-14,lookX:-0.9,armL:112,foreL:60,lid:1},0.26);
  A.pose(6.9,{squash:0,armL:80,foreL:80,head:4,faceX:-2,lookX:-0.2,lookY:0.7,spread:1,brow:0.8,browTilt:0.2,mouth:"m"},0.4);
  // "feel absolutely nothing": looks to camera, deadpan shrug, umbrella droops
  A.pose(8.3,{armL:42,foreL:-90,spread:1,armR:-96,foreR:-66,head:2,faceX:0,faceY:2,lookX:0,lookY:0,brow:0.4,browTilt:-0.5,mouth:"flat",torso:0,lid:0.72},0.34,"power2.out");
  A.pose(8.92,{squash:-0.12,head:-6},0.14,"power2.out");
  A.pose(9.14,{squash:0,head:-1},0.25,"sine.inOut");
  A.pose(11.2,{armR:-126,foreR:-30,armL:62,foreL:-60,head:-8,faceX:6,lookX:0.5,lookY:-0.6,mouth:"smile",brow:0.8,lid:1},0.5);
  S.k(P+"shadow",{ "a:rx":[[0,190],[0.5,214],[0.9,190]] });
  // Environment life -------------------------------------------------------
  S.at((T)=>{
    const sw=Math.sin(T*1.55)*5.2*(1+0.25*Math.sin(T*.31));
    S.set(P+"lamp","r",sw);
    S.set(P+"poolE","a:cx",760 - sw*34);
    S.set(P+"curtL","skx",Math.sin(T*.9)*1.1); S.set(P+"curtR","skx",Math.sin(T*.8+2)*1.2);
    S.set(P+"plant","r",Math.sin(T*1.3)*1.6);
    ["spoon","whisk","pan","ladle","spatula","pan2"].forEach((n,i)=>S.set(P+"ut-"+n,"r",Math.sin(T*2.2+i*1.3)*(i%2?3:2)));
    S.set(P+"lid","y",Math.max(0,Math.sin(T*23)-0.4)*-4);
    S.set(P+"kettleG","r",Math.sin(T*31)*0.35);
    for(let i=0;i<5;i++){ const ph=((T*.55+i*.2)%1); const e=S.el(P+"st"+i);
      e.setAttribute("transform",\`translate(\${1458+ph*42+Math.sin(ph*6+i)*10} \${556-ph*220}) scale(\${.7+ph*1.2})\`); e.setAttribute("opacity",(Math.sin(ph*Math.PI)*.42).toFixed(3)); }
    for(let i=0;i<3;i++){ const ph=((T*.42+i*.33)%1); const e=S.el(P+"ms"+i);
      e.setAttribute("transform",\`translate(\${120+i*12+Math.sin(ph*5+i)*6} \${832-ph*70})\`); e.setAttribute("opacity",(Math.sin(ph*Math.PI)*.5).toFixed(3)); }
    for(let i=0;i<36;i++){ const e=S.el(P+"rainwin-"+i); const h=NU.hash(i+4), sp=800+h*500; const y=((T*sp+h*9000)%520)+150, x=((NU.hash(i*5)*560+130)-y*.18)+70;
      e.setAttribute("transform",\`translate(\${x.toFixed(1)} \${y.toFixed(1)}) rotate(102)\`); e.setAttribute("opacity",".6"); }
  });
  // TYPE beats ---------------------------------------------------------
  S.k(P+"t1",{o:[[${0},0],[${T.s2[0]},0],[${T.s2[0]+0.12},1,'power2.out'],[${T.s3[0]-0.05},1],[${T.s3[0]},0]], s:[[${T.s2[0]},1.5],[${T.s2[0]+0.18},1,'back.out(2)']]});
  S.k(P+"t1k",{o:[[${T.s3[0]-0.02},0],[${T.s3[0]+0.08},1],[${T.s4[0]-0.02},1],[${T.s4[0]+0.06},0]], s:[[${T.s3[0]},1.4],[${T.s3[0]+0.16},1,'back.out(2)']]});
  S.k(P+"t1kx",{"a:stroke-dashoffset":[[${T.s3[0]+0.45},400],[${T.s3[0]+0.75},0,'power2.in']]});
  S.k(P+"num",{o:[[${T.s4[0]+0.2},0],[${T.s4[0]+0.3},1],[9.9,1],[10,0]], s:[[${T.s4[0]+0.2},1.2],[${T.s4[0]+0.4},1,'power3.out']]});
  S.at((T)=>{ const a=${T.s4[0]+0.3}, b=a+1.45; const n=Math.round(NU.clamp((T-a)/(b-a))*12); let z="100"; for(let i=1;i<=n;i++){ z+=(i%3===1?",":"")+"0"; }
    S.set(P+"numT","text",z); S.set(P+"numS","a:opacity",NU.clamp((T-b)/0.25)); });
  S.k(P+"mNote",{o:[[${T.s3[0]+0.2},0],[${T.s3[0]+0.6},0.92],[9.8,0.92],[10,0]]});
  S.k(P+"nameTag",{o:[[${T.s7[0]+0.1},0],[${T.s7[0]+0.22},1],[14.7,1],[14.9,0]], s:[[${T.s7[0]+0.1},0.6],[${T.s7[0]+0.42},1,'back.out(2.2)']]});
  `;
  writeScene("kitchen", DUR, { defs, body, script, bg: "#111C3D" });
}
