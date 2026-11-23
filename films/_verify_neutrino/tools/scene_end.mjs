import fs from "node:fs";
import { C, rng, rep, g, grp, lin, rad, glowStops, nuDefs, charDefs, character, writeScene, f1 } from "./lib.mjs";
import { kitchenDefs, kitchenBack, kitchenFg, kettle, lamp } from "./art_kitchen.mjs";
import { spaceDefs, earth } from "./art_space.mjs";
const T = JSON.parse(fs.readFileSync("tools/timing.json"));

const RIVER = "M-200,180 C260,120 420,300 640,420 C860,540 1000,600 1240,520 C1480,440 1640,200 2120,260";

export function buildEnd() {
  const P = "e-";
  const start = +(T.s30[0] - 0.25).toFixed(3), DUR = +(120 - start).toFixed(3);
  const L = (k, d = 0) => +(T[k][0] - start + d).toFixed(3);
  const R = rng(19);
  const defs = kitchenDefs(P) + nuDefs(P) + charDefs(P) + spaceDefs(P) +
    lin(P + "rv1", [[0, "#6F5BE0", 0.5], [0.4, "#33C8B7", 0.75], [0.7, "#7CDCF5", 0.7], [1, "#F46E67", 0.5]], 0, 0, 1, 0) +
    lin(P + "rv2", [[0, "#FFF0DA", 0.2], [0.5, "#FFFFFF", 0.65], [1, "#FFF0DA", 0.2]], 0, 0, 1, 0) +
    rad(P + "gal", [[0, "#FFF7DA", 1], [0.2, "#FFD98A", 0.75], [0.6, "#A97CF0", 0.26], [1, "#7CDCF5", 0]]) +
    rad(P + "palm", glowStops("#7CE4FF", 1)) +
    rad(P + "warm", [[0, "#FFD98A", 0.26], [1, "#FFD98A", 0]]);
  const motes = rep(150, (i) => `<circle id="${P}m${i}" r="${f1(1.4 + R() * 4)}" fill="${["#FFF7DA", "#8FF5E2", "#7CDCF5", "#F3D85F", "#FFB7A8", "#C8B8FF"][i % 6]}" opacity="0"/>`);
  const sparks = rep(26, (i) => `<g id="${P}sp${i}"><use href="#${P}nu" /></g>`);
  const riverGroup = (id, wide) => grp(id, `
    <path d="${RIVER}" fill="none" stroke="url(#${P}rv1)" stroke-width="${wide}" stroke-linecap="round" opacity=".4"/>
    <path d="${RIVER}" fill="none" stroke="url(#${P}rv1)" stroke-width="${wide * 0.55}" stroke-linecap="round" opacity=".48"/>
    <path d="${RIVER}" fill="none" stroke="url(#${P}rv2)" stroke-width="3" stroke-linecap="round" stroke-dasharray="3 22 1 44"/>
    <path d="${RIVER}" transform="translate(0 46)" fill="none" stroke="url(#${P}rv2)" stroke-width="2" stroke-dasharray="60 90 4 30"/>
    <path d="${RIVER}" transform="translate(0 -52)" fill="none" stroke="url(#${P}rv2)" stroke-width="2" stroke-dasharray="90 140 4 60"/>`);
  const galaxy = (id, x, y, sc) => g(id, x, y, `<g transform="scale(${sc}) rotate(-20)"><ellipse rx="96" ry="34" fill="url(#${P}gal)"/><path d="M-82,10 C-40,44 40,20 26,-6 C10,-30 -44,-18 -20,4 M82,-10 C40,-44 -40,-20 -26,6 C-10,30 44,18 20,-4" stroke="#FFF0DA" stroke-width="3" fill="none" opacity=".75"/><circle r="10" fill="#FFF7DA"/></g>`);
  const body = `
  ${grp(P + "lBack", kitchenBack(P) + kettle(P))}
  <rect id="${P}dim" x="-400" y="-300" width="2720" height="1680" fill="#0A1030" opacity=".38"/>
  <g id="${P}lampL">${lamp(P)}</g>
  ${riverGroup(P + "rivB", 230)}
  <path id="${P}riverPath" d="${RIVER}" fill="none"/>
  ${grp(P + "mB", motes)}
  <g id="${P}cargoL">${g(P + "cargo1", 0, 0, `<g transform="scale(.1)">${earth(P, P + "ee")}</g>`)}
  ${galaxy(P + "cargo2", 0, 0, 1.0)}
  ${g(P + "cargo3", 0, 0, `<circle r="40" fill="#FFE27E"/><circle r="70" fill="url(#${P}gal)" opacity=".7"/>`)}</g>
  ${grp(P + "lMid", `
    <ellipse cx="900" cy="972" rx="190" ry="26" fill="#0B0A22" opacity=".55"/>
    ${g(P + "pos", 900, 732, character(P))}
  `)}
  ${grp(P + "spF", sparks)}
  <g id="${P}topL">${g(P + "palmG", 0, 0, `<circle r="110" fill="url(#${P}palm)"/><circle r="14" fill="#fff"/>`, `opacity="0"`)}
  ${g(P + "last", 0, 0, `<g transform="scale(1.9)"><use href="#${P}nu"/></g>`, `opacity="0"`)}</g>
  ${grp(P + "lFg", kitchenFg(P))}
  <rect width="1920" height="1080" fill="url(#${P}warm)" opacity=".7"/>
  <rect id="${P}fadeIn" width="1920" height="1080" fill="#050A24" opacity="1"/>
  <rect id="${P}fadeOut" width="1920" height="1080" fill="#050A24" opacity="0"/>
  `;
  const script = `
  const P=${JSON.stringify(P)};
  const path=document.getElementById(P+"riverPath"); const LEN=path.getTotalLength();
  const lut=[]; for(let i=0;i<=400;i++){ const q=path.getPointAtLength(LEN*i/400); lut.push([q.x,q.y]); }
  const at=(u)=>{ u=NU.clamp(u); const f=u*400, i=Math.min(399,Math.floor(f)), k=f-i; return [lut[i][0]+(lut[i+1][0]-lut[i][0])*k, lut[i][1]+(lut[i+1][1]-lut[i][1])*k, Math.atan2(lut[i+1][1]-lut[i][1],lut[i+1][0]-lut[i][0])*57.2958]; };
  S.k(P+"fadeIn",{o:[[0,1],[.55,0,'power2.out']]});
  S.camera({x:[[0,40],[${L("s31")},0,'sine.inOut'],[${L("s33")},-30,'sine.inOut'],[${DUR},-60,'sine.inOut']],
            y:[[0,-20],[${L("s31")},0,'sine.inOut'],[${L("s33")},-40,'sine.inOut'],[${DUR},-30]],
            z:[[0,1.0],[${L("s33")},1.1,'sine.inOut'],[${DUR},1.13,'sine.inOut']]},
    [[P+"lBack",.82],[P+"dim",.82],[P+"lampL",.95],[P+"rivB",.92],[P+"mB",.92],[P+"lMid",1],[P+"spF",1],[P+"lFg",1.32],[P+"topL",1],[P+"cargoL",.92]]);
  S.at((T)=>{
    S.set(P+"lamp","r",Math.sin(T*1.55)*3.2);
    S.set(P+"curtL","skx",Math.sin(T*.9)*1.1); S.set(P+"curtR","skx",Math.sin(T*.8+2)*1.2);
    S.set(P+"plant","r",Math.sin(T*1.3)*1.6);
    ["spoon","whisk","pan","ladle","spatula","pan2"].forEach((n,i)=>S.set(P+"ut-"+n,"r",Math.sin(T*2.2+i*1.3)*(i%2?3:2)));
    for(let i=0;i<5;i++){ const ph=((T*.55+i*.2)%1); const e=S.el(P+"st"+i);
      e.setAttribute("transform",\`translate(\${1458+ph*42+Math.sin(ph*6+i)*10} \${556-ph*220}) scale(\${.7+ph*1.2})\`); e.setAttribute("opacity",(Math.sin(ph*Math.PI)*.42).toFixed(3)); }
    for(let i=0;i<3;i++){ const ph=((T*.42+i*.33)%1); const e=S.el(P+"ms"+i);
      e.setAttribute("transform",\`translate(\${120+i*12+Math.sin(ph*5+i)*6} \${832-ph*70})\`); e.setAttribute("opacity",(Math.sin(ph*Math.PI)*.5).toFixed(3)); }
    for(let i=0;i<36;i++){ const e=S.el(P+"rainwin-"+i); const h=NU.hash(i+4), sp=800+h*500; const y=((T*sp+h*9000)%520)+150, x=((NU.hash(i*5)*560+130)-y*.18)+70;
      e.setAttribute("transform",\`translate(\${x.toFixed(1)} \${y.toFixed(1)}) rotate(102)\`); e.setAttribute("opacity",".6"); }
    S.set(P+"rivB","a:opacity",S.ev([[0,.7],[.9,1]],T));
    // star river: motes ride the same curve with a stable lateral offset
    for(let i=0;i<150;i++){ const h=NU.hash(i+2), h2=NU.hash(i*3+5), h3=NU.hash(i*7+11);
      const u=((T*(.05+h*.05)+h2)%1); const [x,y]=at(u); const off=(h3-.5)*220; const e=S.el(P+"m"+i);
      e.setAttribute("cx",x.toFixed(1)); e.setAttribute("cy",(y+off).toFixed(1)); e.setAttribute("opacity",(Math.sin(u*Math.PI)*(.45+h*.55)).toFixed(3)); }
    for(let i=0;i<26;i++){ const h=NU.hash(i*5+3), h2=NU.hash(i*11+1); const u=((T*(.1+h*.07)+h2)%1); const [x,y,a]=at(u); const off=(NU.hash(i*13)-.5)*170;
      S.el(P+"sp"+i).setAttribute("transform",\`translate(\${x.toFixed(1)} \${(y+off).toFixed(1)}) rotate(\${a.toFixed(1)}) scale(\${(.65+h*.5).toFixed(2)})\`);
      S.el(P+"sp"+i).setAttribute("opacity",(Math.min(1,Math.sin(u*Math.PI)*1.6)*.9).toFixed(3)); }
    [[P+"cargo1",.06,.12],[P+"cargo2",.05,.5],[P+"cargo3",.055,.8]].forEach(([id,sp,o])=>{ const [x,y]=at((T*sp+o)%1); S.set(id,"x",x); S.set(id,"y",y-70+Math.sin(T+o*9)*16); });
    S.set(P+"ee-spin","r",T*14);
  });
  // ACTING: an easy, changed person. Umbrella held loose. Eyes track the river.
  const A=S.actor(P,{armR:-30,foreR:-48,handR:0,armL:18,foreL:-16,head:-10,faceX:-12,faceY:-6,lookX:-.6,lookY:-.7,brow:.6,mouth:"o",lid:1});
  A.umbTilt=[[0,176]]; A.umbOpen=[[0,.17]];
  A.pose(.5,{head:-16,faceX:-14,faceY:-10,lookX:-.8,lookY:-1,mouth:"smile"},.9,"sine.inOut");
  A.pose(${L("s30", 1.4)},{head:-4,faceX:-2,lookX:0,lookY:-.4,torso:-1},.6);
  // "It's moving straight through you." -- looks down at own chest, opens free hand
  A.pose(${L("s31", -0.05)},{head:14,faceY:12,faceX:4,lookX:.1,lookY:1,armL:42,foreL:-62,spread:1,brow:1,mouth:"o"},.42,"power2.out");
  A.pose(${L("s32", 0)},{head:5,faceY:2,lookY:.2,lookX:.6,faceX:10,mouth:"m",lid:.84,brow:.4},.7);
  // "But once in a while" -- palm glints. Attention snaps, then wonder.
  A.pose(${L("s33", 0)},{armL:88,foreL:-74,spread:1,head:-8,faceX:-14,faceY:0,lookX:-1,lookY:0,lid:1.1,brow:1.1,mouth:"grin"},.46,"back.out(1.3)");
  A.pose(${L("s33", 2.25)},{head:-18,faceX:-4,faceY:-12,lookX:-.1,lookY:-1,armL:102,foreL:-96,mouth:"smile"},.8,"sine.inOut");
  // sensor-blue blink that echoes the detector
  const b=${L("s33", 0.42)};
  S.at((T)=>{ const px=S.el(P+"handL"); });
  S.k(P+"palmG",{x:[[${L("s33", 0.5)},722],[${L("s33", 2.25)},722],[${L("s33", 3.05)},738]],y:[[${L("s33", 0.5)},662],[${L("s33", 2.25)},662],[${L("s33", 3.05)},634]],o:[[b-.02,0],[b+.04,1],[b+.75,.62,'power2.out'],[${L("s33", 2.1)},0,'sine.in']],s:[[b,.2],[b+.16,1,'back.out(2.5)'],[b+1.8,.65]]});
  // last spark: rises from the hand, over the shoulder, out of frame, up and right
  const l0=${L("s33", 2.1)};
  S.k(P+"last",{x:[[l0,722],[${DUR - 0.5},2200,'power1.in']],y:[[l0,662],[${DUR - 0.5},-180,'power1.in']],o:[[l0-.02,0],[l0+.2,1]],r:[[0,-27]]});
  S.k(P+"fadeOut",{o:[[${DUR - 0.62},0],[${DUR - 0.08},1,'sine.in']]});
  `;
  writeScene("end", DUR, { defs, body, script, bg: "#111C3D" });
}
