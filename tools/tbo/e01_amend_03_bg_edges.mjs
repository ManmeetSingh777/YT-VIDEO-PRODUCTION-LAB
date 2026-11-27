#!/usr/bin/env node
// E01 packet amendment 03: the background rigs' directed pose history swaps drawings (rest/gesture/settle cels) but the packet declares no state
// edges, so the swaps can never be approved. Declares EXACTLY the edges the directed history uses (CEL_SEQUENCE, instantaneous, on each rig's own
// registration landmarks), nothing else. Proves the delta, validates, preflights, rebinds the hybrid contract. Approves nothing.
//   node tools/tbo/e01_amend_03_bg_edges.mjs --film films/e01 --hybrid-base <dir> --out <private dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), HB = path.resolve(arg("hybrid-base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs");
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", active), before = J(path.join(pdir, "CREATIVE_PACKET.json")), after = structuredClone(before), added = {};
for (const id of after.identities) { const r = id.rig; if (!r || !/^BG_/.test(id.id)) continue; const binds = Object.fromEntries(r.poses.map((q) => [q.id, JSON.stringify(q.bindings)]));
  const hist = after.actions.flatMap((a) => (a.pose_events || []).filter((e) => e.rig === r.id).map((e) => ({ f: e.frame, s: e.state }))).sort((x, y) => x.f - y.f); let cur = r.poses[0]?.id, need = new Set();
  for (const e of hist) { if (e.s !== cur && binds[cur] !== binds[e.s]) need.add([cur, e.s].sort().join("|")); cur = e.s; }
  const lm = (r.poses[0]?.landmarks || []).slice(0, 4); added[id.id] = [];
  for (const k of need) { const [a, b] = k.split("|"); for (const [f, t] of [[a, b], [b, a]]) if (!r.edges.some((e) => e.from === f && e.to === t)) { r.edges.push({ from: f, to: t, mode: "CEL_SEQUENCE", landmarks: lm, max_transition_frames: 0, occluder: null }); added[id.id].push(`${f}->${t}`); } } }
const DOC = "AMENDMENT_03_BACKGROUND_STATE_EDGES.md", doc = [`# E01 packet amendment 03: background state edges`, "", `Amends the active approved packet \`${active}\`. Engineering amendment prepared by Claude Code; it takes effect only under a newly signed packet receipt.`, "",
  "The background rigs' directed pose history (unchanged) swaps drawings between their rest, gesture and settle cels, but no state edge was declared, so those swaps could never be approved or executed. This amendment declares exactly the edges that history uses, as instantaneous registered cel swaps on each rig's own registration landmarks:", "",
  ...Object.entries(added).map(([k, v]) => `- ${k}: ${v.join(", ") || "(none needed)"}`), "", "Nothing else changes: choreography, timing, states, drawings and every other identity are identical.", ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true }); for (const f of fs.readdirSync(path.join(pdir, "source"))) fs.copyFileSync(path.join(pdir, "source", f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), doc);
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(doc) });
const back = structuredClone(after); for (const id of back.identities) if (id.rig && /^BG_/.test(id.id)) id.rig.edges = before.identities.find((x) => x.id === id.id).rig.edges; back.source.documents = back.source.documents.filter((x) => x.file !== DOC);
const d1 = packetDigest(after), bytes = JSON.stringify(after, null, 1) + "\n"; fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), bytes);
const hyb = { ...J(path.join(HB, "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(HB, "private_audio_for_hybrid") });
const rep = { amends: active, digest: d1, edges_added: added, only_delta: JSON.stringify(back) === JSON.stringify(before) ? "background rig edges + amendment document" : "UNEXPECTED_DIFFERENCE", validate: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`), preflight: PF.status, hybrid: HY.status };
fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep, null, 1)); if (rep.only_delta === "UNEXPECTED_DIFFERENCE" || V.status !== "STRUCTURAL_VALID") process.exit(1);
