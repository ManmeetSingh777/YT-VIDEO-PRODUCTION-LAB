#!/usr/bin/env node
// E01 packet amendment 06 (directive 2026-11-28 §3): separate BODY facing from HEAD view, and the limb drawings a real body turn needs.
// (1) body_facing per view from the directed performance (PERFORMANCE_STATES head_body_support/view_requirement) — film data below;
// (2) for views whose body genuinely turns, view-matched limb drawings `<asset>__<view>` computed by the engine's own view rule
//     (engine/art_bridge/view_demand.mjs) over every reachable state cell: arms/legs bound by the view state, hand states via bindings_by_view;
// (3) facial drawings carry the head view they are performed in (state.view = primary performed view; metadata only, no new art).
// Builds on the ACTIVE packet; approves nothing.   node tools/tbo/e01_amend_06_body_views.mjs --film films/e01 --hybrid-base <dir> --out <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), HB = path.resolve(arg("hybrid-base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs"), { viewDemand } = await imp("engine/art_bridge/view_demand.mjs");
const BODY = { // directed body facing per view (evidence: PERFORMANCE_STATES_P3_2.csv)
  CHAR_MIA: { to_regular: "to_regular", down_report: "to_regular", to_lens: "to_regular", to_lead: "to_lead" },          // MIA-P07/P08 chin dips, shoulders compress; P12 stable partner-facing head; P06 "True 3/4 toward lead; R shoulder advances"
  CHAR_LEAD: { to_mia: "to_mia", to_edge: "to_mia", to_staff: "to_staff", staff_side: "staff_side" },                     // LEAD-P02 head follows page; P03 "torso follows; genuine alternate turn/side view"
  CHAR_REGULAR: { to_mia: "to_mia", to_lead: "to_mia", room: "to_mia", own_screen: "to_mia" } };                         // REG-P02/P03/P04 head/eye turns over a grounded torso
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", active), before = J(path.join(pdir, "CREATIVE_PACKET.json")), after = structuredClone(before);
const doc = structuredClone(J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"))), planAssets = J(path.join(FILM, "handoff", "ART_DEPENDENCY_PLAN.json")).assets, PV = J(path.join(FILM, "geometry", "PERFORMANCE_VIEWS.json"));
// facial metadata: primary performed view on every existing facial drawing (plan + packet)
const primary = new Map(Object.values(PV).flatMap((r) => r.assignments.map((a) => [a.asset, a.primary_view]))), meta = [];
for (const a of planAssets) if (primary.has(a.asset_id) && a.view_id !== primary.get(a.asset_id)) a.view_id = primary.get(a.asset_id);
for (const r of after.art_requirements) if (primary.has(r.id) && r.state?.view !== primary.get(r.id)) { meta.push({ id: r.id, from: r.state?.view ?? null, to: primary.get(r.id) }); r.state = { ...r.state, view: primary.get(r.id) }; }
for (const r of doc.rigs) for (const v of r.view_states || []) if (BODY[r.id]?.[v.id]) v.body_facing = BODY[r.id][v.id];
const demand = viewDemand(doc, planAssets), body = demand.filter((x) => x.kind === "BODY"), face = demand.filter((x) => x.kind === "FACE"), added = [];
for (const ident of after.identities) { const R = ident.rig; if (!R || !BODY[R.id]) continue;
  for (const v of R.views) if (BODY[R.id][v.id] && BODY[R.id][v.id] !== v.id) v.body_facing = BODY[R.id][v.id];
  for (const x of body.filter((d) => d.rig === R.id)) { const base = after.art_requirements.find((a) => a.id === x.asset); if (!base) throw new Error(`no art requirement ${x.asset}`); const id = `${x.asset}__${x.view}`;
    if (!after.art_requirements.some((a) => a.id === id)) after.art_requirements.push({ ...structuredClone(base), id, kind: "CEL", state: { ...base.state, view: x.view }, purpose: `${base.purpose} — drawn for the ${x.view} body facing (Amendment 06; ${x.frames} frames).`, construction: `${base.construction} AMENDMENT 06: the same anatomical component drawn for the ${x.view} body facing, attaching to the ${x.view} torso.` });
    for (const aid of base.required_by) { const act = after.actions.find((a) => a.id === aid); if (act && !act.art_ids.includes(id)) act.art_ids.push(id); }
    const handCh = R.channels.find((c) => c.slots.includes(x.slot)), view = R.views.find((v) => v.id === x.view);
    if (handCh) { for (const st of handCh.states) if (st.bindings[x.slot] === x.asset) ((st.bindings_by_view ||= {})[x.view] ||= {})[x.slot] = id; }
    else view.bindings[x.slot] = id;
    added.push({ ...x, id }); } }
const DOC = "AMENDMENT_06_BODY_VIEWS.md", text = [`# E01 packet amendment 06: body facing separated from head view; view-matched limbs`, "", `Amends the active packet \`${active}\` (which carries amendments 04 and 05). Prepared by Claude Code at the director's directive (§3); it takes effect only under a newly signed packet receipt.`, "",
  "Each view now declares the facing of the BODY separately from the head view (from the directed performance): head-only turns keep the base limbs; real body turns get limb drawings matched to that body facing. Facial drawings carry the head view they are performed in (metadata). No dialogue, timing, choreography or expression changes.", "",
  "Body facing:", ...Object.entries(BODY).map(([r, m]) => `- ${r}: ${Object.entries(m).map(([v, b]) => `${v} → ${b}`).join(", ")}`), "", `View-matched limb drawings (${added.length}):`, ...added.map((x) => `- ${x.id} (${x.frames} frames)`), "", `Facial view metadata (${meta.length}): ${meta.map((m) => `${m.id}: ${m.to}`).join("; ")}`, ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true }); for (const f of fs.readdirSync(path.join(pdir, "source"))) fs.copyFileSync(path.join(pdir, "source", f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), text);
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(text) });
const d1 = packetDigest(after); fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), JSON.stringify(after, null, 1) + "\n");
const hyb = { ...J(path.join(HB, "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(HB, "private_audio_for_hybrid") });
// post-amendment check: with body facing + facial metadata + the new limb drawings bound, no view mismatch may remain
for (const x of added) { const pa = planAssets.find((a) => a.asset_id === x.asset); planAssets.push({ ...pa, asset_id: x.id, kind: "CEL", view_id: x.view }); const r = doc.rigs.find((q) => q.id === x.rig), ch = (r.state_channels || []).find((c) => (c.slots || []).includes(x.slot));
  if (ch) { for (const st of ch.states) if (st.asset_bindings[x.slot] === x.asset) ((st.asset_bindings_by_view ||= {})[x.view] ||= {})[x.slot] = x.id; } else r.view_states.find((v) => v.id === x.view).asset_bindings[x.slot] = x.id; }
const residual = viewDemand(doc, planAssets);
const rep = { amends: active, digest: d1, body_facing: BODY, limb_drawings_added: added.length, by_rig: Object.fromEntries(Object.keys(BODY).map((r) => [r, added.filter((x) => x.rig === r).length])), facial_metadata: meta.length, face_mismatch_before_metadata: face.length,
  residual_view_mismatch: residual.map((x) => `${x.asset}@${x.view}`), validate: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`).slice(0, 10), preflight: PF.status, hybrid: HY.status, added: added.map((x) => ({ id: x.id, slot: x.slot, frames: x.frames })) };
fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(rep, null, 1)); console.log(JSON.stringify({ ...rep, added: undefined }, null, 1)); if (V.status !== "STRUCTURAL_VALID" || residual.length) process.exit(1);
