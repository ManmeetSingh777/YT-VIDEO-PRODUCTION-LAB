// Scene file writer (generalizes neutrino lib.sceneFile) + contract-bound event timing.
// A scene generator receives ctx from engine/tools/build.mjs:
//   ctx.E("event_id", offset)  → scene-local seconds of a contract event (throws if the contract has no such event)
//   ctx.N("s3"), ctx.N("s3.end") → narration anchors in scene-local time; ctx.W("s3", "word") → word start
//   ctx.param(key, default)     → value after applying matching REPAIR lessons (recorded in the build receipt)
//   ctx.write({defs, body, script, bg, rigs}) → compositions/<id>.html
import fs from "node:fs";
import { qaCSS } from "./style.mjs";

export function sceneFile(id, dur, { defs = "", body = "", script = "", bg = "#111C3D", rigs = {}, consts = {}, qa = "", fonts = "" }) {
  const R = Object.keys(rigs).length ? `const RIGS = ${JSON.stringify(rigs)};` : "";
  const K = Object.entries(consts).map(([k, v]) => `const ${k} = ${JSON.stringify(v)};`).join("\n    ");
  return `<template>
  <style>
    #root { position: absolute; inset: 0; overflow: hidden; background: ${bg}; }
    #root svg { position: absolute; left: 0; top: 0; }
    #root text { font-family: 'Outfit', sans-serif; }
    #root .tA { font-family: 'Archivo Black', sans-serif; }
    ${fonts}
    ${qaCSS(qa)}
  </style>
  <div id="root" data-composition-id="${id}" data-width="1920" data-height="1080" data-start="0" data-duration="${dur}">
    <svg xmlns="http://www.w3.org/2000/svg" id="${id}-svg" width="1920" height="1080" viewBox="0 0 1920 1080" data-layout-ignore style="overflow:hidden">
      <defs>${defs}</defs>
      ${body}
    </svg>
  </div>
  <script>
  (function(){
    const S = NU.scene(${JSON.stringify(id)}, ${dur});
    ${R}
    ${K}
    ${script}
    S.done();
  })();
  </script>
</template>
`;
}

export const matches = (l, cx) => Object.entries(l.applies_when || {}).every(([k, v]) => cx[k] !== undefined && (Array.isArray(v) ? v.includes(cx[k]) : cx[k] === v));

export function makeCtx(scene, cues, lessons, qa) {
  const c = cues.scenes[scene.id] || { events: {}, narration: {}, words: {} };
  const usedEvents = new Set(), applied = [];
  const ctx = {
    id: scene.id, dur: scene.dur, start: scene.start, qa,
    contract: c.contract || {},
    E(name, off = 0) {
      if (!(name in c.events)) throw new Error(`scene ${scene.id}: contract has no event "${name}" (events: ${Object.keys(c.events).join(", ")})`);
      usedEvents.add(name); return +(c.events[name] + off).toFixed(3);
    },
    N(anchor, off = 0) {
      const [sid, end] = anchor.split(".");
      const n = cues.narration[sid]; if (!n) throw new Error(`no narration sentence ${sid}`);
      return +((end === "end" ? n[1] : n[0]) - scene.start + off).toFixed(3);
    },
    W(sid, word, k = 1) {
      const ws = (cues.words || {})[sid]; if (!ws) throw new Error(`no word timing for ${sid}`);
      const hits = ws.filter((w) => w.w.toLowerCase().replace(/[^a-z0-9']/g, "") === word.toLowerCase());
      if (!hits[k - 1]) throw new Error(`word "${word}"#${k} not in ${sid}`);
      return +(hits[k - 1].start - scene.start).toFixed(3);
    },
    /** construction parameter, overridden by a REPAIR lesson whose applies_when matches this construction context */
    param(key, dflt, cx = {}) {
      for (const l of lessons) if (l.params && key in l.params && matches(l, cx)) { applied.push({ rule_id: l.rule_id, key, value: l.params[key], context: cx }); return l.params[key]; }
      return dflt;
    },
    /** lessons whose scope matches a construction context — read BEFORE drawing that identity */
    lessonsFor(cx) { const m = lessons.filter((l) => matches(l, cx)); m.forEach((l) => applied.push({ rule_id: l.rule_id, context: cx, read: true })); return m; },
    lessons,
    write(o) {
      fs.mkdirSync("compositions", { recursive: true });
      fs.writeFileSync(`compositions/${scene.id}.html`, sceneFile(scene.id, scene.dur, Object.assign({ qa }, o)));
    },
    _receipt: () => ({ scene: scene.id, used_events: [...usedEvents], contract_events: Object.keys(c.events), applied_lessons: applied }),
  };
  return ctx;
}
