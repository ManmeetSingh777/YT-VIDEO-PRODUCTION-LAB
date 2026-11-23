// direction/EPISODE.json + production/timing.json (+ words.json) → production/{scenes,cues,film}.json + scene stubs.
// Run from a film directory: node ../../engine/tools/plan.mjs [--stubs]
// Time expressions (see contract/EPISODE_FORMAT.md):
//   12.5 | s3 | s3.end | s3@0.4 | s3:"word" | s3:"word"#2 | s3:"word".end | event_id | scene.event | sc02.start | sc02.end  (+/- offsets)
import fs from "node:fs";
const readJ = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);
const EP = readJ("direction/EPISODE.json", null);
if (!EP) { console.error("direction/EPISODE.json missing"); process.exit(2); }
const T = readJ("production/timing.json", null);
if (!T) { console.error("production/timing.json missing — run `studio narrate` first"); process.exit(2); }
const W = readJ("production/words.json", {});
const errs = [], warns = [], estimated = new Set();
const req = (o, k, where) => { if (o[k] === undefined || o[k] === "" || (Array.isArray(o[k]) && !o[k].length)) errs.push(`${where}: missing "${k}"`); };

// ---- structural validation of the GPT contract ----
if (EP.format !== "MNS-EPISODE/1") errs.push(`format must be "MNS-EPISODE/1"`);
req(EP, "film", "root"); req(EP, "narration", "root"); req(EP, "scenes", "root"); req(EP, "identities", "root");
const sceneKeys = ["id", "from", "understanding_before", "understanding_after", "main_event", "causal_mechanism", "start_composition", "end_composition", "identities", "owned_components", "events", "camera", "attention", "handoff", "unacceptable"];
for (const s of EP.scenes || []) for (const k of sceneKeys) req(s, k, `scene ${s.id || "?"}`);
const idents = new Set((EP.identities || []).map((i) => i.id));
for (const i of EP.identities || []) for (const k of ["id", "kind", "design_intent", "required_states"]) req(i, k, `identity ${i.id || "?"}`);
for (const s of EP.scenes || []) for (const i of s.identities || []) if (!idents.has(i)) errs.push(`scene ${s.id}: unknown identity ${i}`);
for (const s of EP.scenes || []) for (const e of s.events || []) { for (const k of ["id", "at", "what"]) req(e, k, `scene ${s.id} event ${e.id || "?"}`); if (e.what && e.what.length < 12) warns.push(`scene ${s.id} event ${e.id}: "what" is too short to be executable direction`); }

// ---- time expression resolver ----
const sceneStart = {};
const evAbs = {}; // "scene.event" → abs seconds
function anchor(a, scene) {
  a = a.trim();
  if (/^-?\d+(\.\d+)?$/.test(a)) return +a;
  let m;
  if ((m = a.match(/^(s\d+)(?:\.(end))?$/))) { if (!T[m[1]]) throw `no sentence ${m[1]}`; return T[m[1]][m[2] ? 1 : 0]; }
  if ((m = a.match(/^(s\d+)@([\d.]+)$/))) { const n = T[m[1]]; if (!n) throw `no sentence ${m[1]}`; return n[0] + (n[1] - n[0]) * +m[2]; }
  if ((m = a.match(/^(s\d+):"([^"]+)"(?:#(\d+))?(\.end)?$/))) {
    const ws = W[m[1]];
    if (!ws) throw `word anchor ${a} needs production/words.json (run narrate with transcription)`;
    const norm = (x) => x.toLowerCase().replace(/[^a-z0-9']/g, "");
    const hits = ws.filter((w) => norm(w.w) === norm(m[2]));
    const h = hits[(+m[3] || 1) - 1]; if (!h) throw `word "${m[2]}" not found in ${m[1]}`;
    if (h.method === "estimated") estimated.add(a);
    return m[4] ? h.end : h.start;
  }
  if ((m = a.match(/^(\w+)\.(start|end)$/)) && sceneStart[m[1]]) return m[2] === "start" ? sceneStart[m[1]][0] : sceneStart[m[1]][1];
  if (a.includes(".") && evAbs[a] !== undefined) return evAbs[a];
  if (scene && evAbs[`${scene}.${a}`] !== undefined) return evAbs[`${scene}.${a}`];
  throw `unresolved anchor "${a}"`;
}
function when(expr, scene) {
  const m = String(expr).replace(/\s+/g, "").match(/^(.+?)((?:[+-]\d*\.?\d+)*)$/);
  let base = m[1], off = 0;
  // anchors may contain quotes with no +/-; offsets are trailing +n/-n groups
  const offs = m[2].match(/[+-]\d*\.?\d+/g) || [];
  for (const o of offs) off += +o;
  return +(anchor(base, scene) + off).toFixed(3);
}

// ---- scenes: contiguous, start at `from`, end at next scene's start ----
const sents = EP.narration.sentences;
const lastEnd = Math.max(...Object.values(T).map((v) => v[1]));
const filmDur = +(EP.film.duration ?? (lastEnd + (EP.film.tail ?? 1.5))).toFixed(3);
const scenes = [];
try {
  EP.scenes.forEach((s, i) => { const st = i === 0 ? 0 : when(s.from); scenes.push({ id: s.id, src: s.src || `${s.id}.mjs`, fn: "build", start: st }); });
  scenes.forEach((s, i) => { s.dur = +((i + 1 < scenes.length ? scenes[i + 1].start : filmDur) - s.start).toFixed(3); sceneStart[s.id] = [s.start, s.start + s.dur]; if (s.dur <= 0.2) errs.push(`scene ${s.id}: duration ${s.dur}`); });
  // events in order; later events may reference earlier ones (within scene by bare id, across scenes by scene.event)
  for (const s of EP.scenes) for (const e of s.events) {
    try { evAbs[`${s.id}.${e.id}`] = when(e.at, s.id); } catch (x) { errs.push(`scene ${s.id} event ${e.id}: ${x}`); }
  }
} catch (x) { errs.push(String(x)); }

const cues = { narration: T, words: W, scenes: {} };
for (const s of EP.scenes) {
  const sc = scenes.find((x) => x.id === s.id); if (!sc) continue;
  const events = {};
  for (const e of s.events) {
    const a = evAbs[`${s.id}.${e.id}`]; if (a === undefined) continue;
    const loc = +(a - sc.start).toFixed(3);
    if (loc < -0.001 || loc > sc.dur + 0.001) errs.push(`scene ${s.id} event ${e.id} at ${a}s falls outside the scene [${sc.start}, ${(sc.start + sc.dur).toFixed(3)}]`);
    events[e.id] = loc;
  }
  const sound = (s.sound || []).map((x) => { try { return Object.assign({}, x, { t: when(x.at, s.id) }, x.until ? { t1: when(x.until, s.id) } : {}); } catch (er) { errs.push(`scene ${s.id} sound: ${er}`); return null; } }).filter(Boolean);
  for (const e of s.events) if (e.sfx) sound.push({ t: evAbs[`${s.id}.${e.id}`], sfx: e.sfx, from_event: e.id });
  cues.scenes[s.id] = { start: sc.start, dur: sc.dur, events, sound, contract: { main_event: s.main_event, unacceptable: s.unacceptable, owned_components: s.owned_components, articulation: s.articulation || [] } };
}
const heroes = (EP.hero_frames || []).map((h) => { try { return Object.assign({}, h, { t: when(h.at, h.scene) }); } catch (x) { errs.push(`hero ${h.id}: ${x}`); return h; } });
let proof = null;
if (EP.motion_proof) { try { proof = { from: when(EP.motion_proof.from), to: when(EP.motion_proof.to), must_show: EP.motion_proof.must_show || [] }; if (proof.to - proof.from < 8 || proof.to - proof.from > 18) warns.push(`motion proof is ${(proof.to - proof.from).toFixed(1)}s (target 10–15 s)`); } catch (x) { errs.push(`motion_proof: ${x}`); } }

fs.mkdirSync("production", { recursive: true });
if (errs.length) { console.error("EPISODE CONTRACT ERRORS:\n  " + errs.join("\n  ")); process.exit(1); }
fs.writeFileSync("production/scenes.json", JSON.stringify(scenes, null, 1));
fs.writeFileSync("production/cues.json", JSON.stringify(cues, null, 1));
fs.writeFileSync("production/film.json", JSON.stringify({ id: EP.film.id, title: EP.film.title, duration: filmDur, bg: EP.film.bg || "#111C3D", heroes, proof }, null, 1));
// scene stubs: every contract event is pre-bound so prose cannot silently stand in for motion
if (process.argv.includes("--stubs")) {
  fs.mkdirSync("scenes", { recursive: true });
  for (const s of EP.scenes) {
    const f = `scenes/${s.id}.mjs`; if (fs.existsSync(f)) continue;
    fs.writeFileSync(f, `// ${s.id}: ${s.main_event}\n// mechanism: ${s.causal_mechanism}\n// UNACCEPTABLE: ${s.unacceptable.join(" | ")}\nexport function build(ctx) {\n${s.events.map((e) => `  const ${e.id.replace(/\W/g, "_")} = ctx.E(${JSON.stringify(e.id)}); // ${e.what}`).join("\n")}\n  // owned components: ${s.owned_components.map((c) => c.id || c).join(", ")}\n  throw new Error("scene ${s.id} not implemented");\n}\n`);
  }
}
console.log(`planned ${scenes.length} scenes, ${Object.values(cues.scenes).reduce((a, s) => a + Object.keys(s.events).length, 0)} events, film ${filmDur}s`);
for (const s of scenes) console.log(`  ${s.id.padEnd(10)} ${s.start.toFixed(2).padStart(7)} +${s.dur.toFixed(2)}  events: ${Object.entries(cues.scenes[s.id].events).map(([k, v]) => `${k}@${v}`).join(" ")}`);
if (estimated.size) warns.push(`${estimated.size} word anchors use ESTIMATED word timing (no ASR installed): ${[...estimated].join(", ")} — final sync needs \`hyperframes models install parakeet\` + re-narrate`);
if (warns.length) console.log("WARNINGS:\n  " + warns.join("\n  "));
