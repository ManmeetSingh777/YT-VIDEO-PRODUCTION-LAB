#!/usr/bin/env node
// Migration: the creative compiler dropped each pose/view event's owning rig (packet `rig`), so shared actions applied every actor's schedule to
// every actor. Copies `rig` from the ACTIVE approved packet into the compiled manifest's events as rig_id, matched by action, index, frame and
// state (any mismatch refuses). Registration data in the manifest is untouched. Backs up the manifest first.
//   node tools/tbo/e01_migrate_event_ownership.mjs --film <film dir> [--backup <dir>]
import fs from "node:fs"; import path from "node:path";
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; }, J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const F = path.resolve(arg("film")), mf = path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), doc = J(mf), active = J(path.join(F, "creative", "CURRENT.json")).packet_sha256, p = J(path.join(F, "creative", "packets", active, "CREATIVE_PACKET.json"));
if (arg("backup")) { fs.mkdirSync(arg("backup"), { recursive: true }); fs.copyFileSync(mf, path.join(arg("backup"), `ART_AND_MOTION_MANIFEST_V2.before_event_ownership.${Date.now()}.json`)); }
let n = 0; const changed = [];
for (const a of doc.actions) { const src = p.actions.find((x) => x.id === a.id); if (!src) continue;
  for (const [k, sk, same] of [["pose_events", "pose_events", (m, s) => m.frame === s.frame && m.state_id === s.state], ["view_events", "view_events", (m, s) => m.frame === s.frame && m.to_state === s.to]]) {
    const m = a[k] || [], s = src[sk] || []; if (m.length !== s.length) throw new Error(`${a.id}.${k}: ${m.length} compiled vs ${s.length} in the packet`);
    m.forEach((e, i) => { if (!same(e, s[i])) throw new Error(`${a.id}.${k}[${i}] differs from the packet`); if (s[i].rig && e.rig_id !== s[i].rig) { e.rig_id = s[i].rig; n++; changed.push(`${a.id}.${k}[${i}]`); } }); } }
fs.writeFileSync(mf, JSON.stringify(doc, null, 1)); console.log(JSON.stringify({ events_with_owner_added: n, actions: [...new Set(changed.map((c) => c.split(".")[0]))] }));
