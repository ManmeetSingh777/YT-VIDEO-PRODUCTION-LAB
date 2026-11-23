// node tools/build.mjs [--only id,id]   writes compositions/*.html and index.html from the art source in tools/.
import fs from "node:fs";
const SCENES = JSON.parse(fs.readFileSync("tools/scenes.json"));
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1].split(",") : null;
for (const s of SCENES) {
  if (!s.src) continue;
  if (only && !only.includes(s.id)) continue;
  const m = await import(`./${s.src}`);
  m[s.fn]();
}
for (const s of SCENES) { if (!s.src) continue; const h = fs.readFileSync(`compositions/${s.id}.html`, "utf8"); const ids = [...h.matchAll(/id="([^"$]+)"/g)].map((m) => m[1]); const seen = new Set(), dup = new Set(); for (const i of ids) { if (seen.has(i)) dup.add(i); seen.add(i); } if (dup.size) console.log("DUP IDS", s.id, [...dup].slice(0, 12).join(" ")); }
const useList = only ? SCENES.filter((s) => only.includes(s.id)) : SCENES;
const dur = useList.reduce((a, s) => Math.max(a, s.start + s.dur), 0);
const hosts = SCENES.filter((s) => s.src).map((s, i) => `
      <div id="${s.id}" class="clip" data-composition-id="${s.id}" data-composition-src="compositions/${s.id}.html" data-start="${s.start}" data-duration="${s.dur}" data-track-index="${i + 1}" data-track-kind="graphics" data-width="1920" data-height="1080" style="z-index:${i + 1}"></div>`).join("");
const audioFiles = fs.existsSync("tools/audio.json") ? JSON.parse(fs.readFileSync("tools/audio.json")) : [];
const audio = audioFiles.map((a, i) => `
      <audio id="${a.id}" class="clip" src="${a.src}" data-start="0" data-duration="${a.dur}" data-track-index="${50 + i}" data-volume="${a.vol}"></audio>`).join("");
const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
    <script src="assets/nu.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #111C3D; }
      #grain { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; z-index: 40; pointer-events: none; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="120" data-width="1920" data-height="1080">${hosts}
      <img id="grain" class="clip" src="assets/grain.png" alt="" data-start="0" data-duration="120" data-track-index="30" />${audio}
    </div>
    <script>
      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = gsap.timeline({ paused: true });
    </script>
  </body>
</html>
`;
fs.writeFileSync("index.html", html);
console.log("built", useList.map((s) => s.id).join(","), "dur", dur);
