#!/usr/bin/env node
// E01 packet amendment 07 (directive §2.1): explicit, time-resolved HEAD-view and BODY-facing tracks. Body orientation persists until a directed
// body turn (film data below, evidence: PERFORMANCE_STATES_P3_2.csv); a head-view change never resets it. Each (head, body) segment uses a view
// state whose facing is the head view and whose body_facing is the body: existing views where they already agree, composite views
// `<head>__body_<body>` where they do not. Torso binds to the BODY's torso drawing (posture differences are articulation), limbs and hand states to
// body-matched drawings; the view-qualified drawings still needed are computed by the engine's own view rule. Unreachable drawings are reported
// (never deleted). No dialogue/timing/choreography change.   node tools/tbo/e01_amend_07_head_body_tracks.mjs --film films/e01 --hybrid-base <dir> --out <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), HB = path.resolve(arg("hybrid-base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs"), { viewDemand } = await imp("engine/art_bridge/view_demand.mjs");
const BODY_EVENTS = { // [frame, body facing] — directed body turns
  CHAR_MIA: { base: "to_regular", events: [[306, "to_lead", "MIA-P06 'True 3/4 toward lead; R shoulder advances' (P05 225–306 turns only the head)"], [745, "to_regular", "MIA-P09/P10 head returns 720–745; '3/4 toward regular'"]] },
  CHAR_LEAD: { base: "to_mia", events: [[416, "to_staff", "LEAD-P03 'eyes turn first, torso follows'; step 416–444"], [520, "staff_side", "LEAD-P03 genuine side/back view walking to the station by 520"]] },
  CHAR_REGULAR: { base: "to_mia", events: [] } }; // REG-P02..P06: head/eye turns over a grounded torso
const TORSO_OF = { to_regular: "torso_to_regular", to_lead: "torso_to_lead", to_mia: "torso_to_mia", to_staff: "torso_to_staff", staff_side: "torso_staff_side" };
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", active), before = J(path.join(pdir, "CREATIVE_PACKET.json")), after = structuredClone(before), log = { composite: [], rebound: [], view_events: [] };
for (const ident of after.identities) { const R = ident.rig, B = R && BODY_EVENTS[R.id]; if (!B) continue;
  const prefix = (slotSuffix) => Object.keys(R.views[0].bindings).find((k) => k.endsWith(`.${slotSuffix}`)), headSlot = prefix("head"), torsoSlot = prefix("torso"), torsoAsset = (b) => torsoSlot.replace(/\.torso$/, `.${TORSO_OF[b]}`);
  const vev = after.actions.flatMap((a) => (a.view_events || []).filter((e) => e.rig === R.id).map((e) => ({ a, e }))).sort((p, q) => p.e.frame - q.e.frame);
  const firstHead = vev[0]?.e.from ?? R.views[0].id, cuts = [...new Set([0, ...vev.map((x) => x.e.frame), ...B.events.map(([f]) => f)])].sort((p, q) => p - q);
  const headEv = vev.map(({ e }) => [e.frame, e.to]), headAt = (f) => { let h = firstHead; for (const [g, t] of headEv) if (g <= f) h = t; return h; }, bodyAt = (f) => { let b = B.base; for (const [g, x] of B.events) if (g <= f) b = x; return b; };
  const viewFor = (h, b) => { const v = R.views.find((x) => x.id === h); if ((v.body_facing || v.id) === b) return v.id;
    const id = `${h}__body_${b}`; if (!R.views.some((x) => x.id === id)) { const base = R.views.find((x) => x.id === b) || v, bind = { [headSlot]: v.bindings[headSlot], [torsoSlot]: torsoAsset(b) };
      for (const [slot, aid] of Object.entries(base.bindings)) if (slot !== headSlot && slot !== torsoSlot) bind[slot] = aid; // body-matched limbs of that body facing
      R.views.push({ id, facing: v.facing, body_facing: b, bindings: bind, landmarks: v.landmarks }); log.composite.push(id);
      for (const c of R.channels || []) { const face = ["EXPRESSION", "EYES", "MOUTH"].includes(c.kind); for (const st of c.states) { const src = st.bindings_by_view?.[face ? h : b]; if (src) ((st.bindings_by_view ||= {})[id] = { ...(st.bindings_by_view[id] || {}), ...src }); } } // facial drawings of the HEAD view, hand drawings of the BODY
      for (const e of [...R.edges]) { if (e.from === h || e.to === h) { const f2 = e.from === h ? id : e.from, t2 = e.to === h ? id : e.to; if (!R.edges.some((x) => x.from === f2 && x.to === t2)) R.edges.push({ ...e, from: f2, to: t2 }); } } }
    return id; };
  // torso of every existing view follows its declared body (head-only views keep the base body's torso)
  for (const v of R.views) { const b = v.body_facing || v.id; if (TORSO_OF[b] && v.bindings[torsoSlot] !== torsoAsset(b)) { log.rebound.push(`${R.id}.${v.id}: ${v.bindings[torsoSlot]} → ${torsoAsset(b)}`); v.bindings[torsoSlot] = torsoAsset(b); } }
  // rewrite the view timeline into (head, body) segments; add view events at body turns
  let prev = viewFor(headAt(0), bodyAt(0));
  for (const f of cuts.slice(1)) { const nv = viewFor(headAt(f), bodyAt(f)); if (nv === prev) continue; const ex = vev.find((x) => x.e.frame === f);
    if (ex) { ex.e.from = prev; ex.e.to = nv; } else { const owns = (x) => x.owner === R.id || x.owner === ident.id || [...(x.pose_events || []), ...(x.view_events || [])].some((e) => e.rig === R.id), cand = after.actions.filter((x) => owns(x) && x.frames[0] <= f && f < x.frames[1]), a = cand.sort((p, q) => (q.view_events?.length || 0) - (p.view_events?.length || 0))[0]; if (!a) throw new Error(`no ${R.id} action covers body turn f${f}`); (a.view_events ||= []).push({ frame: f, rig: R.id, from: prev, to: nv, transition: { policy: "SWAP", reason: `directed body turn (${B.events.find(([g]) => g === f)?.[2]})`, intermediate_states: [] } }); }
    if (!R.edges.some((x) => x.from === prev && x.to === nv)) { const tmpl = R.edges.find((x) => x.from === prev || x.to === nv) || R.edges[0]; R.edges.push({ ...tmpl, from: prev, to: nv }); log.edges = (log.edges || []).concat(`${R.id} ${prev}->${nv}`); } // every used transition is an allowed edge
    log.view_events.push(`${R.id}@${f}: ${prev} → ${nv}`); prev = nv; }
}
// limb/hand drawings the (head, body) timeline needs: engine view rule on the manifest with the amended views applied in memory
const doc = structuredClone(J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"))), planAssets = J(path.join(FILM, "handoff", "ART_DEPENDENCY_PLAN.json")).assets, ids = new Set(after.art_requirements.map((a) => a.id));
const A = await imp("engine/story/creative_adapter.mjs"); const adapted = A.adaptCreativePacket ? A.adaptCreativePacket(after) : null;
const sim = (pkt) => { for (const ident of pkt.identities) { const R = ident.rig; if (!R || !BODY_EVENTS[R.id]) continue; const r = doc.rigs.find((x) => x.id === R.id);
    r.view_states = R.views.map((v) => ({ id: v.id, asset_bindings: { ...v.bindings }, landmark_correspondence: v.landmarks, contact_set: [], view_facing: v.facing, ...(v.body_facing ? { body_facing: v.body_facing } : {}), required_underpaint: [], approved_review_id: null }));
    for (const c of R.channels) { const rc = r.state_channels.find((x) => x.id === c.id); for (const s of c.states) { const rs = rc.states.find((x) => x.id === s.id); if (s.bindings_by_view) rs.asset_bindings_by_view = structuredClone(s.bindings_by_view); } } }
  for (const a of doc.actions) { const pa = pkt.actions.find((x) => x.id === a.id); if (pa) a.view_events = (pa.view_events || []).map((e) => ({ frame: e.frame, from_state: e.from, to_state: e.to, rig_id: e.rig })); } };
sim(after); for (const r of after.art_requirements) if (!planAssets.some((p) => p.asset_id === r.id)) planAssets.push({ asset_id: r.id, kind: r.kind, view_id: r.state?.view ?? null });
const need = viewDemand(doc, planAssets).filter((x) => x.kind === "BODY"), added = [];
for (const x of need) { const R = after.identities.find((i) => i.rig?.id === x.rig).rig, id = `${x.asset}__${x.view}`, base = after.art_requirements.find((a) => a.id === x.asset);
  if (!ids.has(id)) { after.art_requirements.push({ ...structuredClone(base), id, kind: "CEL", state: { ...base.state, view: x.view }, purpose: `${base.purpose} — drawn for the ${x.view} body facing (Amendment 07; ${x.frames} frames).`, construction: `${base.construction} AMENDMENT 07: the same anatomical component for the ${x.view} body facing.` }); ids.add(id);
    for (const aid of base.required_by) { const act = after.actions.find((a) => a.id === aid); if (act && !act.art_ids.includes(id)) act.art_ids.push(id); } added.push({ ...x, id }); }
  const ch = R.channels.find((c) => c.slots.includes(x.slot)), cells = R.views.filter((v) => (v.body_facing || v.id) === x.view);
  for (const v of cells) { if (ch) { for (const st of ch.states) if (st.bindings[x.slot] === x.asset) ((st.bindings_by_view ||= {})[v.id] ||= {})[x.slot] = id; } else v.bindings[x.slot] = id; } }
// prop alternate views: one inventory obligation holds two drawings → explicit, separately registrable variant ids (no overwrite)
const variants = []; for (const pr of ["ART_P01", "ART_P02", "ART_P03"]) { const base = after.art_requirements.find((a) => a.id === `${pr}.alternate_views`); if (!base) continue;
  for (const v of ["back", "edge"]) { const id = `${pr}.alternate_views__${v}`; if (ids.has(id)) continue; after.art_requirements.push({ ...structuredClone(base), id, state: { ...base.state, view: v }, purpose: `${base.purpose} — ${v.toUpperCase()} variant (Amendment 07).` }); ids.add(id); variants.push(id);
    for (const aid of base.required_by) { const act = after.actions.find((a) => a.id === aid); if (act && !act.art_ids.includes(id)) act.art_ids.push(id); } } }
sim(after); for (const a of added) planAssets.push({ asset_id: a.id, kind: "CEL", view_id: a.view });
const residual = viewDemand(doc, planAssets);
const { stateIntervals } = await imp("engine/art_bridge/asset_state.mjs"), MP = fs.existsSync(path.join(FILM, "handoff", "MOTION_PLAN.json")) ? J(path.join(FILM, "handoff", "MOTION_PLAN.json")) : null, activeSet = new Set();
for (const c of stateIntervals(doc)) { Object.values(c.bindings).forEach((x) => activeSet.add(x)); const r = doc.rigs.find((q) => q.id === c.rig), A = MP?.acting?.[c.rig] || {};
  for (const ch of r?.state_channels || []) { const acting = [A.blink?.channel === ch.id ? [A.blink.open, A.blink.closed] : [], A.speech?.channel === ch.id ? [A.speech.open, A.speech.mid, A.speech.rest] : []].flat().filter(Boolean);
    for (const st of ch.states) if (acting.includes(st.id)) { Object.values(st.asset_bindings || {}).forEach((x) => activeSet.add(x)); Object.values(st.asset_bindings_by_view?.[c.view] || {}).forEach((x) => activeSet.add(x)); } } }

// drawings no (head, body) cell selects any more (reported; requirements kept, never deleted)
const bound = new Set(); for (const ident of after.identities) { const R = ident.rig; if (!R) continue; for (const v of R.views) Object.values(v.bindings).forEach((x) => bound.add(x)); for (const c of R.channels || []) for (const s of c.states) { Object.values(s.bindings).forEach((x) => bound.add(x)); for (const m of Object.values(s.bindings_by_view || {})) Object.values(m).forEach((x) => bound.add(x)); } }
const reachableViews = new Set(); for (const a of after.actions) for (const e of a.view_events || []) { reachableViews.add(`${e.rig}|${e.to}`); reachableViews.add(`${e.rig}|${e.from}`); }
const unreachable = after.art_requirements.filter((r) => /CHAR_(MIA|LEAD|REGULAR)\.(torso_|.*__)/.test(r.id) && !bound.has(r.id)).map((r) => r.id);
const DOC = "AMENDMENT_07_HEAD_BODY_TRACKS.md", text = [`# E01 packet amendment 07: explicit head-view and body-facing tracks`, "", `Amends the active packet \`${active}\`. Prepared by Claude Code at the director's directive (§2.1); it takes effect only under a newly signed packet receipt.`, "",
  "Body orientation persists until a directed body turn; head-view changes never reset it. Directed body turns:", ...Object.entries(BODY_EVENTS).map(([r, b]) => `- ${r}: base ${b.base}${b.events.map(([f, x, ev]) => `; f${f} → ${x} (${ev})`).join("")}`), "",
  `Composite (head, body) views: ${log.composite.join(", ") || "none"}. Torso bindings follow the body: ${log.rebound.join("; ") || "unchanged"}.`, `View timeline: ${log.view_events.join("; ")}.`, `Additional body-matched drawings (${added.length}): ${added.map((x) => x.id).join(", ") || "none"}.`,
  `Prop alternate-view variants (separately registrable): ${variants.join(", ")}.`, `Drawings no (head, body) cell selects any more (kept, not generated): ${unreachable.join(", ") || "none"}.`, ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true }); for (const f of fs.readdirSync(path.join(pdir, "source"))) fs.copyFileSync(path.join(pdir, "source", f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), text);
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(text) }); const d1 = packetDigest(after); fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), JSON.stringify(after, null, 1) + "\n");
const hyb = { ...J(path.join(HB, "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(HB, "private_audio_for_hybrid") });
const rep = { preflight_detail: (PF.findings || PF.errors || PF.blocking || []).slice?.(0, 8) ?? PF, amends: active, digest: d1, prop_view_variants: variants, composite_views: log.composite, edges_added: log.edges || [], torso_rebound: log.rebound, view_timeline: log.view_events, added: added.map((x) => ({ id: x.id, frames: x.frames })), unreachable, residual_view_mismatch: residual.map((x) => `${x.asset}@${x.view}`), validate: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`).slice(0, 10), preflight: PF.status, hybrid: HY.status };
fs.writeFileSync(path.join(OUT, "ACTIVE_DRAWINGS.json"), JSON.stringify([...activeSet].sort(), null, 1)); fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep, null, 1)); if (V.status !== "STRUCTURAL_VALID" || residual.length) process.exit(1);
