#!/usr/bin/env node
// E01 packet amendment 08 (directive "Continue physical production", items 2–4). Data-only corrections, verified by engine geometry:
//  (a) bimanual award grip: which hand grips which prop socket is decided by GEOMETRY (engine physical_motion.contactSides on the registered
//      Mia rig and award landmarks), never by matching "r" to "r". Socket coordinates and the award's bytes/registration are unchanged.
//  (b) WORLD_RESTAURANT placement: root (landmark room_origin on the 2x native raster) at world (1186,470), scale 0.5 => world = frame px.
//  (c) pose-dependent forearms: over the award hold (poses ready/regal/lower, body to_regular) the measured fold needs foreshortened forearm
//      drawings; new CEL requirements, bound in those pose states only (views with their own limb drawings still override).
//  (d) restaurant construction authorizations re-bound to the re-constructed specs (counter at Mia's measured waist).
// No dialogue/timing/choreography change.   node tools/tbo/e01_amend_08_contact_world_arms.mjs --film films/e01 --hybrid-base <dir> --out <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), HB = path.resolve(arg("hybrid-base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs"), { contactSides } = await imp("engine/art_bridge/physical_motion.mjs");
// ---- film data ----
const BIMANUAL = { actor: "CHAR_MIA", prop: "PROP_AWARD", hands: { palm_r: "upper_r", palm_l: "upper_l" }, sockets: ["grip_r", "grip_l"], prop_asset: "ART_P01.MASTER" };
const WORLD_PLACEMENT = { rig: "WORLD_RESTAURANT", root_xy: [1186, 470], scale: 0.5, evidence: "room_origin native (2372,940) on the 2x constructed raster; diner seat contacts verify at world y 647/644 vs seat line 641" };
const HOLD = { poses: ["ready", "regal", "lower"], body: "to_regular", limbs: [["fore_r", "elbow_r", "wrist_r"], ["fore_l", "elbow_l", "wrist_l"]],
  evidence: "directed grip band world y 810–870: shoulder→grip 27–106 px vs arm length 209 (upper 124.8, forearm→palm 83.9); interior elbow angle R 12–57°, L 12–37°" };
const ENV = ["ART_ENV01.MASTER", "ART_ENV01.far", "ART_ENV01.mid", "ART_ENV01.counter", "ART_ENV01.counter_occluder"];
// ---- amend ----
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", active), before = J(path.join(pdir, "CREATIVE_PACKET.json")), after = structuredClone(before), log = { contacts: [], staging: [], arms: [], env: [] };
// (a) geometry decides the hand→socket mapping
const doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), rig = doc.rigs.find((r) => r.id === BIMANUAL.actor), jp = (id) => rig.joints.find((j) => j.id === id).rest_xy, lm = doc.identities.find((i) => i.id === BIMANUAL.prop).landmarks;
let cs = null;
for (const a of after.actions) for (const e of a.contact_events || []) { const [actor, hand] = e.source_socket.split("."), [prop, sock] = e.target_socket.split(".");
  if (actor !== BIMANUAL.actor || prop !== BIMANUAL.prop || !BIMANUAL.hands[hand]) continue;
  const declared = Object.fromEntries((a.contact_events || []).filter((x) => x.source_socket.startsWith(`${actor}.`) && x.target_socket.startsWith(`${prop}.grip_`)).map((x) => [x.source_socket.split(".")[1], x.target_socket.split(".")[1]]));
  cs = contactSides({ shoulders: Object.fromEntries(Object.entries(BIMANUAL.hands).map(([h, j]) => [h, jp(j)])), sockets: Object.fromEntries(BIMANUAL.sockets.map((s) => [s, lm[s]])), declared });
  const want = cs.valid[hand]; if (want === sock) continue; const side = want.split("_").pop();
  e.target_socket = `${prop}.${want}`; e.handle_landmarks = e.handle_landmarks.map((x) => x.replace(/_(r|l)$/, `_${side}`)); log.contacts.push(`${a.id} ${actor}.${hand}: ${sock} → ${want} [${e.frames}]`); }
// (b) world placement
for (const a of after.actions) for (const s of a.staging || []) if (s.rig === WORLD_PLACEMENT.rig) { log.staging.push(`${a.id}: ${JSON.stringify(s.root_xy)}x${s.scale} → ${JSON.stringify(WORLD_PLACEMENT.root_xy)}x${WORLD_PLACEMENT.scale}`); s.root_xy = [...WORLD_PLACEMENT.root_xy]; s.scale = WORLD_PLACEMENT.scale; }
// (c) pose-bound award-hold forearms
const R = after.identities.find((i) => i.id === BIMANUAL.actor).rig, ids = new Set(after.art_requirements.map((r) => r.id)), poseActs = after.actions.filter((a) => (a.pose_events || []).some((e) => e.rig === R.id && HOLD.poses.includes(e.state))).map((a) => a.id);
for (const [limb, pivot, end] of HOLD.limbs) { const baseId = `ART_M02.${R.id}.${limb}`, base = after.art_requirements.find((r) => r.id === baseId), id = `${baseId}__award_hold`;
  if (!ids.has(id)) { after.art_requirements.push({ ...structuredClone(base), id, state: { ...base.state, view: HOLD.body }, required_by: poseActs,
    purpose: `${base.purpose} — FORESHORTENED award-hold forearm (Amendment 08): poses ${HOLD.poses.join("/")}, body ${HOLD.body}.`,
    construction: `${base.construction} AMENDMENT 08: the forearm of the folded award-holding arm, body facing ${HOLD.body}, elbow flexed and the forearm turned toward camera so it reads shorter than the rest drawing (${HOLD.evidence}). Pivot ${pivot}, wrist/palm ${end} on the held award's side grip; sleeve cuff and wrist overlap painted; hidden overlap covered by the base underpaint.` }); ids.add(id);
    for (const aid of poseActs) { const act = after.actions.find((a) => a.id === aid); if (!act.art_ids.includes(id)) act.art_ids.push(id); } }
  for (const p of R.poses.filter((x) => HOLD.poses.includes(x.id))) { p.bindings[baseId] = id; log.arms.push(`${R.id}.${p.id}: ${baseId} → ${id}`); } }
// (d) construction authorizations
for (const a of ENV) { const r = after.art_requirements.find((x) => x.id === a), c = J(path.join(FILM, "environment", "CONSTRUCTED.json"))[a], rec = J(c.file.replace(/\.png$/, ".CONSTRUCTION.json"));
  if (rec.result_sha256 !== c.sha256) throw new Error(`${a}: construction record does not match CONSTRUCTED.json`);
  const m = /ENGINE_VECTOR_CONSTRUCTION authorized: spec sha256 ([0-9a-f]{64})/.exec(r.construction); if (!m) throw new Error(`${a}: no construction authorization`);
  if (m[1] !== rec.spec_sha256) { r.construction = r.construction.replace(m[0], `ENGINE_VECTOR_CONSTRUCTION authorized: spec sha256 ${rec.spec_sha256}`).replace(/from spec films\/e01\/vector\/(ART_ENV01[^ ]*\.spec\.json)/, "from spec films/e01/environment/$1") + ` AMENDMENT 08: spec re-constructed with the counter at Mia's measured waist (back edge 911, support 945, front 1000 world px); previous spec ${m[1].slice(0, 12)}.`; log.env.push(`${a}: ${m[1].slice(0, 12)} → ${rec.spec_sha256.slice(0, 12)}`); } }
// ---- document, validate ----
const DOC = "AMENDMENT_08_CONTACT_WORLD_ARMS.md", text = [`# E01 packet amendment 08: award contact sides, restaurant world placement, award-hold forearms, counter height`, "",
  `Amends the active packet \`${active}\`. Prepared by Claude Code under the director's directive; it takes effect only under a newly signed packet receipt.`, "",
  "## Award grip sides (geometry, not names)", `Mia's anatomical right shoulder is screen-left of her left shoulder; the award's prop-local socket grip_l is screen-left of grip_r. Uncrossed mapping (engine contactSides): ${JSON.stringify(cs?.valid)}.`, ...log.contacts.map((x) => `- ${x}`), "Award bytes, registration and socket coordinates are unchanged.", "",
  "## Restaurant world placement", `${WORLD_PLACEMENT.rig} root at world ${JSON.stringify(WORLD_PLACEMENT.root_xy)}, scale ${WORLD_PLACEMENT.scale} (${WORLD_PLACEMENT.evidence}).`, ...log.staging.map((x) => `- ${x}`), "",
  "## Award-hold forearms", HOLD.evidence + ".", ...log.arms.map((x) => `- ${x}`), "",
  "## Restaurant construction (counter height)", ...log.env.map((x) => `- ${x}`), ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true }); for (const f of fs.readdirSync(path.join(pdir, "source"))) fs.copyFileSync(path.join(pdir, "source", f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), text);
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(text) }); const d1 = packetDigest(after); fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), JSON.stringify(after, null, 1) + "\n");
const hyb = { ...J(path.join(HB, "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(HB, "private_audio_for_hybrid") });
// only-delta check: nothing outside the four amended areas changed
const strip = (p) => { const q = structuredClone(p); q.source.documents = q.source.documents.filter((d) => d.file !== DOC); for (const a of q.actions) { for (const e of a.contact_events || []) if (e.target_socket?.startsWith(`${BIMANUAL.prop}.grip_`)) { e.target_socket = "*"; e.handle_landmarks = []; } for (const s of a.staging || []) if (s.rig === WORLD_PLACEMENT.rig) { s.root_xy = null; s.scale = null; } a.art_ids = a.art_ids.filter((x) => !x.endsWith("__award_hold")); }
  q.art_requirements = q.art_requirements.filter((r) => !r.id.endsWith("__award_hold")).map((r) => ENV.includes(r.id) ? { ...r, construction: null } : r); for (const p of q.identities.find((i) => i.id === BIMANUAL.actor).rig.poses) for (const k of Object.keys(p.bindings)) if (p.bindings[k].endsWith("__award_hold")) delete p.bindings[k]; return JSON.stringify(q); };
const rep = { amends: active, digest: d1, contact_valid: cs?.valid, contacts: log.contacts, staging: log.staging, arms: log.arms, env: log.env, only_delta: strip(before) === strip(after), validate: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`).slice(0, 10), preflight: PF.status, preflight_detail: (PF.findings || PF.errors || PF.blocking || []).slice?.(0, 8) ?? PF, hybrid: HY.status };
fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep, null, 1)); if (V.status !== "STRUCTURAL_VALID" || !rep.only_delta) process.exit(1);
