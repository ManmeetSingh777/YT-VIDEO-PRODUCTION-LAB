import { C, rng, rep, g, grp, lin, rad, glowStops, f1 } from "./lib.mjs";

export function kitchenDefs(P) {
  return `
  ${lin(P + "wall", [[0, "#22407C"], [0.55, "#2B4F92"], [1, "#1E3A73"]])}
  ${lin(P + "wallL", [[0, "#142650"], [1, "#1D3468"]], 0, 0, 1, 0)}
  ${lin(P + "wallR", [[0, "#1D3468"], [1, "#101F45"]], 0, 0, 1, 0)}
  ${lin(P + "ceil", [[0, "#0D1736"], [1, "#172A58"]])}
  ${lin(P + "floor", [[0, "#3B2F58"], [1, "#1B1838"]])}
  ${lin(P + "night", [[0, "#0A1230"], [0.6, "#21306A"], [1, "#574A84"]])}
  ${lin(P + "cab", [[0, "#2FA79B"], [1, "#1B7A78"]])}
  ${lin(P + "cabD", [[0, "#1D7F7C"], [1, "#125958"]])}
  ${lin(P + "ctr", [[0, "#FFF0DA"], [1, "#C9B79E"]])}
  ${lin(P + "fridge", [[0, "#F7E8CF"], [0.55, "#E9D3B4"], [1, "#B9A081"]], 0, 0, 1, 0)}
  ${lin(P + "curt", [[0, "#F46E67"], [0.18, "#FF9A8F"], [0.36, "#D9504F"], [0.55, "#F46E67"], [0.75, "#FF9A8F"], [1, "#B73C44"]], 0, 0, 1, 0)}
  ${lin(P + "table", [[0, "#C97C4A"], [1, "#8C4E30"]])}
  ${lin(P + "tableF", [[0, "#7A4029"], [1, "#3E2019"]])}
  ${lin(P + "kettle", [[0, "#FFD98A"], [0.45, "#F46E67"], [1, "#8E2F3E"]], 0, 0, 1, 0.4)}
  ${lin(P + "cone", [[0, "#FFE7A8", 0.5], [0.7, "#FFD98A", 0.1], [1, "#FFD98A", 0]])}
  ${rad(P + "pool", glowStops("#FFD98A", 0.55))}
  ${rad(P + "bulb", [[0, "#FFFBEA"], [0.3, "#FFE9A8", 0.95], [1, "#FFD98A", 0]])}
  ${rad(P + "wglow", glowStops("#7CDCF5", 0.28))}
  ${lin(P + "shade", [[0, "#F3D85F"], [0.55, "#E9B23B"], [1, "#A9741F"]], 0, 0, 1, 0)}
  ${lin(P + "rainl", [[0, "#BFE6FF", 0], [1, "#BFE6FF", 0.75]], 0, 0, 0, 1)}
  <g id="${P}rain"><rect x="-28" y="-1" width="28" height="2" rx="1" fill="#CFEBFF"/></g>
  <clipPath id="${P}winclip"><rect x="130" y="172" width="440" height="462"/></clipPath>
  `;
}

export function windowOutside(P) {
  const R = rng(44);
  const bld = (x, w, h, col, lit) => {
    const y = 634 - h;
    let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${col}"/>`;
    for (let wy = y + 14; wy < 620; wy += 26) for (let wx = x + 10; wx < x + w - 12; wx += 20)
      if (R() < lit) s += `<rect x="${wx}" y="${wy}" width="10" height="14" fill="${R() < 0.2 ? C.coral : R() < 0.5 ? C.citrus : "#FFE7A8"}" opacity="${0.5 + R() * 0.5}"/>`;
    return s;
  };
  return `<g clip-path="url(#${P}winclip)">
    <rect x="130" y="172" width="440" height="462" fill="url(#${P}night)"/>
    <circle cx="470" cy="256" r="46" fill="#FFF0DA" opacity=".14"/><circle cx="470" cy="256" r="24" fill="#FFF0DA" opacity=".5"/>
    ${rep(40, () => `<circle cx="${130 + R() * 440}" cy="${172 + R() * 200}" r="${0.7 + R() * 1.4}" fill="#fff" opacity="${0.3 + R() * 0.6}"/>`)}
    ${bld(120, 120, 240, "#2A2F6C", 0.28)}${bld(235, 88, 310, "#252962", 0.3)}${bld(320, 130, 200, "#2F3576", 0.3)}${bld(446, 130, 270, "#262B66", 0.28)}
    ${bld(130, 150, 110, "#191E50", 0.42)}${bld(280, 110, 150, "#151A47", 0.42)}${bld(392, 180, 90, "#1A1F52", 0.42)}
    <g id="${P}rainwin">${rep(36, (i) => `<use id="${P}rainwin-${i}" href="#${P}rain" opacity="0"/>`)}</g>
    <g opacity=".3">${rep(16, () => { const x = 130 + R() * 440, y = 172 + R() * 400; return `<path d="M${x},${y} q${R() * 4 - 2},${14 + R() * 20} 0,${30 + R() * 30}" stroke="#D8F1FF" stroke-width="${1.5 + R() * 2}" fill="none" stroke-linecap="round"/>`; })}</g>
  </g>`;
}

/** The authored room. Everything is here: back plane, then a mid plane for the actor, then a foreground. */
export function kitchenBack(P) {
  const R = rng(7);
  // wall + perspective wedges
  let s = `<rect x="-400" y="-300" width="2720" height="1680" fill="#14224a"/>
  <polygon points="-400,-300 110,62 110,798 -400,1380" fill="url(#${P}wallL)"/>
  <polygon points="2320,-300 1810,62 1810,798 2320,1380" fill="url(#${P}wallR)"/>
  <polygon points="-400,-300 2320,-300 1810,62 110,62" fill="url(#${P}ceil)"/>
  <rect x="110" y="62" width="1700" height="738" fill="url(#${P}wall)"/>`;
  // ceiling beams
  for (const x of [-120, 360, 860, 1360, 1860, 2300]) s += `<polygon points="${960 + (x - 960) * 0.62},62 ${960 + (x - 960 + 70) * 0.62},62 ${x + 70},-300 ${x},-300" fill="#0A1230" opacity=".55"/>`;
  // wall wallpaper sprigs, subtle pattern
  for (let y = 86; y < 520; y += 58) for (let x = 130 + (y % 116 ? 28 : 0); x < 1800; x += 56)
    s += `<path d="M${x},${y} q5,-9 0,-16 q-5,7 0,16 M${x},${y} q9,3 12,-5" stroke="#3F6AB3" stroke-width="1.8" fill="none" opacity=".5"/>`;
  // wainscot tiles along lower wall left of the counter
  let tiles = "";
  for (let r = 0; r < 6; r++) for (let c = 0; c < 26; c++) {
    const x = 110 + c * 44 + (r % 2 ? 22 : 0), y = 642 + r * 27;
    if (x > 1130) continue;
    tiles += `<rect x="${x}" y="${y}" width="41" height="24" rx="2" fill="${["#1E8A87", "#21968F", "#1A7C7E"][Math.floor(R() * 3)]}"/>`;
  }
  s += `<rect x="110" y="636" width="1050" height="164" fill="#0F5B60"/>${tiles}<rect x="110" y="630" width="1050" height="10" fill="#E9D3B4"/>`;

  // window with deep frame
  s += `<rect x="108" y="150" width="484" height="506" rx="8" fill="#0C1534"/>
  <rect x="116" y="158" width="468" height="490" rx="6" fill="#E9D3B4"/>`;
  s += windowOutside(P);
  s += `<rect x="130" y="172" width="440" height="462" fill="url(#${P}wglow)"/>
  <path d="M350,172 V634 M130,400 H570" stroke="#E9D3B4" stroke-width="14"/>
  <path d="M136,178 L300,178 L180,380 L136,380Z" fill="#fff" opacity=".06"/>
  <path d="M400,178 L470,178 L330,420 L290,420Z" fill="#fff" opacity=".05"/>
  <rect x="90" y="640" width="520" height="24" rx="6" fill="#F6E5C9"/><rect x="96" y="662" width="508" height="10" fill="#0B1330" opacity=".45"/>`;
  // sill objects
  s += `<path d="M154,640 l6,-46 h60 l6,46Z" fill="${C.coral}"/><rect x="154" y="586" width="72" height="12" rx="3" fill="#FF9A8F"/>
  ${g(P + "plant", 190, 586, rep(9, (i) => { const a = -80 + i * 20; const L = 50 + (i % 3) * 18; return `<path d="M0,0 Q${a * 0.5},${-L * 0.8} ${a * 0.9},${-L}" stroke="${i % 2 ? "#2FA79B" : "#54D2A6"}" stroke-width="8" fill="none" stroke-linecap="round"/>`; }))}
  <path d="M470,642 h44 v-44 h-44Z" fill="${C.chalk}"/><path d="M514,606 q18,0 18,14 t-18,14" stroke="${C.chalk}" stroke-width="6" fill="none"/><rect x="470" y="598" width="44" height="7" fill="${C.ice}"/>`;
  // curtains on a rod (animated panels sit in separate groups for breathing)
  s += `<rect x="70" y="128" width="560" height="10" rx="5" fill="#C9A06A"/><circle cx="70" cy="133" r="11" fill="${C.citrus}"/><circle cx="630" cy="133" r="11" fill="${C.citrus}"/>`;
  s += g(P + "curtL", 84, 134, `<path id="${P}curtLp" d="M0,0 H112 C96,120 110,240 72,380 C60,420 44,490 40,540 L-16,540 C-10,360 -6,160 0,0Z" fill="url(#${P}curt)"/>
    <path d="M28,0 C26,160 12,380 4,540 M70,0 C66,130 50,320 30,540" stroke="#A9323B" stroke-width="3" fill="none" opacity=".6"/>
    <path d="M-8,366 Q44,392 78,366" stroke="${C.citrus}" stroke-width="9" fill="none" stroke-linecap="round"/>`);
  s += g(P + "curtR", 616, 134, `<path d="M0,0 H-112 C-96,120 -110,240 -72,380 C-60,420 -44,490 -40,540 L16,540 C10,360 6,160 0,0Z" fill="url(#${P}curt)"/>
    <path d="M-28,0 C-26,160 -12,380 -4,540 M-70,0 C-66,130 -50,320 -30,540" stroke="#A9323B" stroke-width="3" fill="none" opacity=".6"/>
    <path d="M8,366 Q-44,392 -78,366" stroke="${C.citrus}" stroke-width="9" fill="none" stroke-linecap="round"/>`);

  // picture frames (tiny story eggs: orbit sketch, sun)
  s += `<g transform="translate(686 214)"><rect x="-4" y="-4" width="96" height="124" fill="#C9A06A"/><rect width="88" height="116" fill="#FFF0DA"/><circle cx="44" cy="58" r="11" fill="${C.citrus}"/><ellipse cx="44" cy="58" rx="33" ry="13" stroke="${C.coral}" stroke-width="3" fill="none"/><circle cx="76" cy="58" r="5" fill="${C.ultra}"/></g>`;

  // upper cabinets + shelf
  s += `<rect x="1150" y="286" width="470" height="222" rx="5" fill="#0C1534" opacity=".5" transform="translate(5 12)"/>`;
  for (let i = 0; i < 4; i++) {
    const x = 1150 + i * 118;
    s += `<rect x="${x}" y="286" width="112" height="222" rx="5" fill="url(#${P}cab)"/><rect x="${x + 10}" y="298" width="92" height="196" rx="3" fill="none" stroke="#7FE6D5" stroke-width="2.5" opacity=".55"/><rect x="${x + (i % 2 ? 12 : 88)}" y="440" width="9" height="36" rx="4" fill="${C.citrus}"/>`;
  }
  // open shelf with jars
  s += `<rect x="1150" y="270" width="470" height="14" rx="3" fill="#C9A06A"/><rect x="1150" y="284" width="470" height="6" fill="#0B1330" opacity=".35"/>`;
  const jars = [[1172, 44, 56, C.citrus], [1224, 36, 74, C.coral], [1270, 50, 44, C.ice], [1336, 28, 62, C.chalk], [1378, 56, 84, "#54D2A6"], [1450, 40, 50, C.coral], [1500, 34, 68, C.citrus], [1548, 46, 40, C.chalk]];
  for (const [x, w, h, col] of jars) s += `<rect x="${x}" y="${270 - h}" width="${w}" height="${h}" rx="7" fill="${col}"/><rect x="${x - 2}" y="${270 - h - 8}" width="${w + 4}" height="10" rx="3" fill="#5A3A2C"/><rect x="${x + 6}" y="${270 - h + 8}" width="${w * 0.2}" height="${h * 0.6}" rx="3" fill="#fff" opacity=".35"/>`;
  // hanging utensil rail
  s += `<rect x="1160" y="536" width="440" height="6" rx="3" fill="#C9A06A"/>`;
  [["spoon", 1190], ["whisk", 1248], ["pan", 1330], ["ladle", 1430], ["spatula", 1504], ["pan2", 1556]].forEach(([n, x]) => {
    const h = n.startsWith("pan") ? `<path d="M0,0 V16" stroke="#333" stroke-width="3"/><circle cy="${n === "pan" ? 40 : 34}" r="${n === "pan" ? 26 : 20}" fill="#1B2552"/><circle cy="${n === "pan" ? 40 : 34}" r="${n === "pan" ? 18 : 13}" fill="#2C3A78"/>` : n === "whisk" ? `<path d="M0,0 V30 M0,30 q-14,20 0,42 q14,-22 0,-42 M0,30 q-6,22 0,42 q6,-20 0,-42" stroke="${C.chalk}" stroke-width="2.5" fill="none"/>` : `<path d="M0,0 V50" stroke="${C.chalk}" stroke-width="5" stroke-linecap="round"/><ellipse cy="60" rx="${n === "spatula" ? 13 : 10}" ry="15" fill="${C.chalk}"/>`;
    s += g(`${P}ut-${n}`, x, 540, h);
  });
  // backsplash
  let bs = "";
  for (let r = 0; r < 4; r++) for (let c = 0; c < 22; c++) bs += `<rect x="${1150 + c * 22 + (r % 2 ? 11 : 0)}" y="${544 + r * 22}" width="20" height="20" fill="${["#FFF0DA", "#EADBC2", "#F5E2C8"][Math.floor(R() * 3)]}" opacity="${0.16 + R() * 0.1}"/>`;
  s += bs;
  // base counter + stove
  s += `<rect x="1130" y="634" width="510" height="20" rx="4" fill="url(#${P}ctr)"/><rect x="1140" y="654" width="490" height="146" fill="url(#${P}cabD)"/>`;
  for (let i = 0; i < 4; i++) s += `<rect x="${1150 + i * 120}" y="664" width="112" height="126" rx="4" fill="url(#${P}cab)" opacity=".9"/><rect x="${1200 + i * 120}" y="676" width="14" height="6" rx="3" fill="${C.citrus}"/>`;
  s += `<rect x="1290" y="622" width="170" height="14" rx="3" fill="#10163A"/><ellipse cx="1375" cy="622" rx="48" ry="7" fill="${C.coral}" opacity=".5"/>`;
  // toaster, cutting board
  s += `<rect x="1170" y="580" width="88" height="54" rx="12" fill="${C.ice}"/><rect x="1180" y="572" width="28" height="10" fill="#0B1330"/><rect x="1216" y="572" width="28" height="10" fill="#0B1330"/><rect x="1176" y="590" width="10" height="34" rx="4" fill="#fff" opacity=".5"/>
  <rect x="1516" y="560" width="84" height="74" rx="10" fill="#C9804E"/><circle cx="1558" cy="572" r="6" fill="#7A4029"/>`;
  // fridge
  s += `<rect x="1648" y="228" width="170" height="572" rx="20" fill="url(#${P}fridge)"/>
  <path d="M1648,420 H1818" stroke="#8C7558" stroke-width="5"/><rect x="1664" y="290" width="10" height="100" rx="5" fill="#8C7558"/><rect x="1664" y="440" width="10" height="150" rx="5" fill="#8C7558"/>
  <rect x="1720" y="274" width="60" height="44" fill="#fff" transform="rotate(-5 1750 296)"/><circle cx="1750" cy="270" r="6" fill="${C.coral}"/><path d="M1731,290 h38 M1731,300 h28" stroke="${C.ultra}" stroke-width="3"/>
  <circle cx="1700" cy="350" r="11" fill="${C.citrus}"/><rect x="1730" y="470" width="50" height="66" fill="${C.ice}" transform="rotate(4 1755 500)"/><path d="M1745,510 l18,-30 l10,22" stroke="${C.ink}" stroke-width="3" fill="none"/>`;
  // floor in perspective
  s += `<polygon points="110,798 1810,798 2320,1380 -400,1380" fill="url(#${P}floor)"/>`;
  const vx = 960, vy = 300;
  for (let i = -14; i <= 14; i++) {
    const x0 = 960 + i * 115;
    const k = (1380 - vy) / (798 - vy);
    s += `<path d="M${x0},798 L${vx + (x0 - vx) * k},1380" stroke="#141132" stroke-width="2.5" opacity=".6"/>`;
  }
  for (const [y0, y1, odd] of [[798, 826, 0], [826, 860, 1], [860, 906, 0], [906, 970, 1], [970, 1070, 0], [1070, 1230, 1]]) {
    const k0 = (y0 - vy) / (798 - vy), k1 = (y1 - vy) / (798 - vy);
    for (let i = -14; i < 14; i++) if ((i + odd + 40) % 2 === 0) {
      const a = 960 + i * 115, b = 960 + (i + 1) * 115;
      s += `<polygon points="${vx + (a - vx) * k0},${y0} ${vx + (b - vx) * k0},${y0} ${vx + (b - vx) * k1},${y1} ${vx + (a - vx) * k1},${y1}" fill="#5A4A7C" opacity=".35"/>`;
    }
  }
  s += `<rect x="110" y="790" width="1020" height="12" fill="#0B1330" opacity=".6"/>`;
  // light pool on floor + wall
  s += `<ellipse id="${P}poolE" cx="760" cy="880" rx="640" ry="150" fill="url(#${P}pool)"/>`;
  return s;
}

export function kettle(P) {
  return g(P + "kettleG", 1375, 622, `
    <ellipse cy="0" rx="50" ry="8" fill="#0B1330" opacity=".5"/>
    <path d="M-44,-4 C-52,-54 -28,-76 0,-76 C28,-76 52,-54 44,-4 Q0,6 -44,-4Z" fill="url(#${P}kettle)"/>
    <path d="M-32,-46 C-28,-62 -14,-68 -2,-68" stroke="#fff" stroke-width="5" fill="none" opacity=".65" stroke-linecap="round"/>
    <path d="M44,-40 L82,-64 L88,-54 L44,-20Z" fill="#B23C47"/>
    <path d="M-30,-68 C-24,-104 24,-104 30,-68" stroke="#2C2042" stroke-width="9" fill="none"/>
    ${g(P + "lid", 0, -76, `<ellipse rx="24" ry="6" fill="#C2404C"/><circle cy="-8" r="6" fill="${C.citrus}"/>`)}
  `) + grp(P + "steam", rep(5, (i) => `<path id="${P}st${i}" d="M0,0 C-14,-20 14,-34 0,-56 C-10,-70 8,-84 2,-98" stroke="#fff" stroke-width="${10 - i}" fill="none" stroke-linecap="round" opacity="0"/>`));
}

export function lamp(P) {
  return g(P + "lamp", 700, -40, `
    <path d="M0,0 V190" stroke="#0B1330" stroke-width="5"/>
    <polygon id="${P}coneP" points="-66,248 66,248 520,900 -460,900" fill="url(#${P}cone)" style="mix-blend-mode:screen"/>
    <path d="M-82,250 C-70,214 -34,190 0,190 C34,190 70,214 82,250Z" fill="url(#${P}shade)"/>
    <path d="M-82,250 Q0,268 82,250 L74,256 Q0,274 -74,256Z" fill="#FFF5C9"/>
    <circle cy="258" r="56" fill="url(#${P}bulb)"/>
    <circle cy="256" r="15" fill="#FFFBEA"/>
  `);
}

export function kitchenFg(P) {
  const R = rng(31);
  // table + breakfast + chair silhouette + hanging fern, all at a nearer parallax
  return `
  <g id="${P}tableG">
    <path d="M-340,868 L760,852 L880,960 L-340,1000Z" fill="url(#${P}table)"/>
    <path d="M-340,1000 L880,960 L880,1000 L-340,1044Z" fill="url(#${P}tableF)"/>
    ${rep(5, (i) => `<path d="M-340,${884 + i * 22} Q200,${876 + i * 22} ${790 + i * 18},${866 + i * 20}" stroke="#A9623C" stroke-width="2.5" fill="none" opacity=".6"/>`)}
    <rect x="684" y="990" width="46" height="130" fill="#3E2019"/>
    <!-- plate -->
    <ellipse cx="340" cy="914" rx="168" ry="44" fill="#6E3D26" opacity=".55"/>
    <ellipse cx="340" cy="904" rx="168" ry="44" fill="#F5E6CE"/><ellipse cx="340" cy="902" rx="130" ry="31" fill="#E1CFB2"/><ellipse cx="340" cy="899" rx="130" ry="31" fill="#FFF3DF"/>
    <path d="M250,902 q-20,-34 22,-46 q38,-14 72,0 q24,12 -4,46 q-44,14 -90,0Z" fill="#E7A95C"/><path d="M256,894 q-14,-24 16,-34 q34,-12 66,0 q18,10 -6,34 q-40,12 -76,0Z" fill="#F7CF8C"/>
    <path d="M336,906 q30,-26 74,-18 q44,8 34,26 q-40,14 -96,6Z" fill="#fff"/><ellipse cx="394" cy="896" rx="23" ry="12" fill="${C.citrus}"/><ellipse cx="389" cy="893" rx="7" ry="3.5" fill="#fff" opacity=".8"/>
    <!-- mug -->
    <path d="M90,840 h86 l-8,68 q-35,12 -70,0Z" fill="${C.ice}"/><ellipse cx="133" cy="840" rx="43" ry="11" fill="#9EE7FA"/><ellipse cx="133" cy="841" rx="35" ry="8" fill="#50302A"/>
    <path d="M176,852 q28,4 16,30 q-8,14 -22,12" stroke="${C.ice}" stroke-width="9" fill="none"/>
    ${grp(P + "mugsteam", rep(3, (i) => `<path id="${P}ms${i}" d="M0,0 C-8,-14 8,-26 0,-42" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round" opacity="0"/>`))}
    <!-- fork + knife + salt + juice -->
    <path d="M540,872 L690,892" stroke="#D9DEE9" stroke-width="7" stroke-linecap="round"/><path d="M522,868 l22,4 M520,876 l22,4 M518,884 l22,4" stroke="#D9DEE9" stroke-width="3.5"/>
    <path d="M580,856 h40 l-4,-96 h-32Z" fill="${C.citrus}" opacity=".9"/><path d="M584,780 h32 l-2,-20 h-28Z" fill="#fff" opacity=".35"/>
    <ellipse cx="600" cy="758" rx="16" ry="5" fill="#fff" opacity=".5"/>
  </g>
  ${g(P + "chair", 1720, 760, `<path d="M-100,0 Q0,-30 150,-16 L180,340 L130,340 L108,70 L-40,70 L-60,340 L-110,340Z" fill="#090F28"/><path d="M-100,0 Q0,-30 150,-16 L150,-6 Q0,-20 -98,10Z" fill="#3C4F8F"/><path d="M-60,70 L120,70" stroke="#090F28" stroke-width="24"/>`)}
  ${g(P + "fern", -30, -10, rep(11, (i) => { const a = 8 + i * 15; const L = 260 + R() * 120; const x = Math.cos((a * Math.PI) / 180) * L * 0.8, y = Math.sin((a * Math.PI) / 180) * L; const leaves = rep(8, (k) => { const p = (k + 1) / 9; const lx = x * p, ly = y * p + p * p * 40; return `<ellipse cx="${f1(lx)}" cy="${f1(ly)}" rx="26" ry="9" transform="rotate(${f1(a + (k % 2 ? 60 : -60))} ${f1(lx)} ${f1(ly)})" fill="#0A1A36"/>`; }); return `<path d="M0,0 Q${f1(x * 0.5)},${f1(y * 0.4)} ${f1(x)},${f1(y + 40)}" stroke="#0A1A36" stroke-width="6" fill="none"/>${leaves}`; }))}
  `;
}
