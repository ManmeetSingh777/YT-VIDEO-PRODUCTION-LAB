#!/usr/bin/env node
// E01 phase-1 packet reconciliation (2026-11-27). This tool is deterministic: it reads the verified Creative GPT packet and the private extraction, and
// it calls only the live engine (validate, preflight, hybrid-preflight, compilePacket, planJobs, check-design). Nothing here approves, signs or
// generates art.
//   node tools/tbo/e01_reconcile_packet.mjs --packet-dir E:/TBO_PRIVATE/E01_PHASE1_CREATIVE_PACKET_20261127 --designs E:/TBO_PRIVATE/E01_UNSIGNED_DESIGN_PREPARATION_V1
//        --scratch DIR --out engineering/e01_packet/reconciliation
// Outputs (public; no private audio, witness pixels or keys): RECONCILIATION.json, PREART_OBLIGATION_LEDGER.json, ARTJOB_DAG_PREVIEW.json,
// DESIGN_GATE_PREVIEW.json, PACKET_DELTA.json.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const arg = (k, d = null) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const PD = path.resolve(arg("packet-dir")), DES = path.resolve(arg("designs")), SCR = path.resolve(arg("scratch")), OUT = path.resolve(REPO, arg("out", "engineering/e01_packet/reconciliation"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs");
const { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs"), { compilePacket } = await imp("engine/story/creative_adapter.mjs"), { planJobs } = await imp("engine/art_bridge/art_intake.mjs");
const { shotSegments, verifySegments } = await imp("engine/story/action_span.mjs");
const origBytes = fs.readFileSync(path.join(PD, "CREATIVE_PACKET.json")), recBytes = fs.readFileSync(path.join(PD, "RECONCILED", "CREATIVE_PACKET.json"));
const orig = JSON.parse(origBytes), p = JSON.parse(recBytes), digest = packetDigest(p);
// 1. the packet delta: exactly the shot_span declarations, nothing else
const strip = structuredClone(p); for (const a of strip.actions) delete a.shot_span;
const delta = { original_file_sha256: sha(origBytes), original_digest: packetDigest(orig), reconciled_file_sha256: sha(recBytes), reconciled_digest: digest, only_change: JSON.stringify(strip) === JSON.stringify(orig) ? "actions[].shot_span added (nothing else differs)" : "UNEXPECTED_DIFFERENCE",
  added: p.actions.filter((a) => a.shot_span).map((a) => ({ action: a.id, shot_id: a.shot_id, frames: a.frames, shot_span: a.shot_span, segments: shotSegments(a, p.shots).map((s) => ({ segment_id: s.segment_id, frames: s.frames, events: s.events.length, contacts: s.contacts.map((c) => ({ index: c.index, begins_here: c.begins_here, release_here: c.release_here })) })), proof: verifySegments(a, shotSegments(a, p.shots)) })) };
// 2. the three official checks on the reconciled packet
const V = validatePacket(orig), V2 = validatePacket(p), PF = creativePreflight(p);
const hyb = J(path.join(PD, "RECONCILED", "HYBRID_CONTRACT.json")), HY = hybridPreflight(p, hyb, { sourceDir: path.join(PD, "private_audio_for_hybrid") });
// 3. pre-art obligation ledger: one row per directed action, what it is owed before it can render (no geometry claimed)
const rows = PF.ledger.map((r) => { const a = p.actions.find((x) => x.id === r.action); return { action: r.action, frames: a.frames, shot_id: a.shot_id, shot_span: a.shot_span ?? null, mode: r.mode, verb_class: r.verb_class, owners: r.owners, producer: r.producer, qa: [...new Set(r.qa)], contacts: r.contacts, states: r.states, art_ids: r.art, deferred: r.deferred, status: "OWED_PRE_ART: executes only after measured art (GEOMETRY_UNMEASURED until then)" }; });
// 4. compile (pure) + planJobs into a SCRATCH film copy (no approval exists; PREVIEW only)
const PV = path.join(SCR, "e01_preview_film"); fs.rmSync(PV, { recursive: true, force: true }); fs.cpSync(path.join(REPO, "films", "e01"), PV, { recursive: true });
const { files } = compilePacket(p); for (const [rel, o] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(PV, rel)), { recursive: true }); fs.writeFileSync(path.join(PV, rel), JSON.stringify(o, null, 1)); }
const PJ = await planJobs({ film: PV }), jobs = PJ.jobs.map((j) => ({ artjob_id: j.artjob_id, asset: j.root_dependency, identity: j.identity_id, state_kind: j.state_kind, asset_kind: j.asset_kind, medium: j.medium.medium, tier: j.manufacturing_order, derived_from: j.derived_from, dependents: j.dependents.length, motion_context_sha256: j.motion_context_sha256 }));
const checkCounts = PJ.check.errors.reduce((m, e) => ((m[e.code] = (m[e.code] || 0) + 1), m), {});
// 5. design gate on the unsigned drafts (PREVIEW film; drafts are not installed anywhere else)
const MAP = { MIA_MASTER: "MIA_MASTER", REGULAR_MASTER: "REGULAR_MASTER", LEAD_MASTER: "LEAD_MASTER", ENV_RESTAURANT_SH01: "ART_ENV01.MASTER" }, gates = {};
fs.mkdirSync(path.join(PV, "art_designs"), { recursive: true });
for (const [src, dst] of Object.entries(MAP)) { fs.copyFileSync(path.join(DES, `${src}.design.json`), path.join(PV, "art_designs", `${dst}.design.json`)); fs.copyFileSync(path.join(DES, `${src}.pregen_audit.json`), path.join(PV, "art_designs", `${dst}.pregen_audit.json`));
  let o; try { o = execFileSync(process.execPath, [path.join(REPO, "engine/tools/art_outbox.mjs"), "check-design", "--film", PV, "--asset", dst], { encoding: "utf8" }); } catch (e) { o = e.stdout; }
  const r = JSON.parse(o); gates[dst] = { draft: `${src}.design.json`, draft_sha256: sha(fs.readFileSync(path.join(DES, `${src}.design.json`))), job: r.job, status: r.status, failures: r.failures, required_methods: (r.required_methods || []).map((m) => m.method) }; }
const unsignedMasters = p.identities.filter((i) => !Object.values(MAP).includes(i.master_art)).map((i) => i.master_art);
fs.mkdirSync(OUT, { recursive: true });
const W = (f, o) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(o, null, 1) + "\n");
W("PACKET_DELTA.json", delta);
W("PREART_OBLIGATION_LEDGER.json", { packet_sha256: digest, actions: rows.length, rows });
W("ARTJOB_DAG_PREVIEW.json", { status: "PREVIEW: compiled without approval in a scratch film; formal jobs are exported only after the packet, story/direction and design receipts verify", packet_sha256: digest, jobs: jobs.length, by_tier: jobs.reduce((m, j) => ((m[j.tier] = (m[j.tier] || 0) + 1), m), {}), by_state_kind: jobs.reduce((m, j) => ((m[j.state_kind] = (m[j.state_kind] || 0) + 1), m), {}), readiness_check: checkCounts, jobs });
W("DESIGN_GATE_PREVIEW.json", { status: "PREVIEW: unsigned V0.4 drafts run through the live design gate against the reconciled packet; drafts are not installed", packet_sha256: digest, gates, masters_without_any_draft: unsignedMasters });
W("RECONCILIATION.json", { packet_zip_sha256: "e86230b3561e9af252a548bdb6ba8fdd8d44368304cc541069d9040488dc24db", reconciled_digest: digest, hybrid_bound_to: hyb.packet_sha256,
  original: { validate: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`) }, reconciled: { validate: V2.status, errors: V2.errors.length, preflight: PF.status, preart_feasible: PF.preart_feasible, authority_pending: PF.authority_pending, feedback: PF.feedback.map((f) => `${f.code} ${f.failed_invariant || ""} ${f.record_id}`), hybrid: HY.status, hybrid_feasible: HY.hybrid_feasible, dialogue: HY.ledger.dialogue.map((d) => `${d.line} ${d.status} ${d.mouth_route?.route}`) },
  deferred_obligations: rows.flatMap((r) => r.deferred.map((d) => ({ action: r.action, ...d }))).reduce((m, d) => ((m[d.invariant] = (m[d.invariant] || 0) + 1), m), {}),
  prop_surface_supports: files["handoff/MOTION_OBLIGATIONS.json"].prop_surface_supports, artjobs: { total: jobs.length, masters: jobs.filter((j) => j.state_kind === "MASTER").map((j) => j.artjob_id) } });
console.log(JSON.stringify({ out: path.relative(REPO, OUT), digest, validate: V2.status, preflight: PF.status, hybrid: HY.status, jobs: jobs.length, gates: Object.fromEntries(Object.entries(gates).map(([k, g]) => [k, `${g.status} (${g.failures.length})`])) }, null, 1));
