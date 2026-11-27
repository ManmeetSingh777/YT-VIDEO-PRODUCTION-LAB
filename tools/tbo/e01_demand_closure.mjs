#!/usr/bin/env node
// E01 artwork demand closure: the ACTIVE approved packet's actions, shots, identities and art requirements reconciled against the live ArtJob
// dependency graph and outbox, with each requirement's production route and its genuine blocking dependency. Reads only; writes the report.
//   node tools/tbo/e01_demand_closure.mjs --film films/e01 --out-box <outbox> --report engineering/e01_production
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), OUT = path.resolve(arg("out-box")), REP = path.resolve(REPO, arg("report"));
const { planJobs } = await imp("engine/art_bridge/art_intake.mjs"), { derivationRoute } = await imp("engine/art_bridge/component_route.mjs"), { loadNativeRequirements } = await imp("engine/art_bridge/resolution_contract.mjs");
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, p = J(path.join(FILM, "creative", "packets", active, "CREATIVE_PACKET.json")), jobs = (await planJobs({ film: FILM })).jobs;
const idx = J(path.join(OUT, "OUTBOX_INDEX.json")).index, byJob = new Map(idx.map((r) => [r.artjob_id, r])), byAsset = new Map(jobs.map((j) => [j.root_dependency, j])), native = loadNativeRequirements(FILM).requirements;
const plans = fs.existsSync(path.join(OUT, "gpt_plans")) ? fs.readdirSync(path.join(OUT, "gpt_plans")).filter((f) => /^GPT_ART_PLAN_\w+$/.test(f) && fs.existsSync(path.join(OUT, "gpt_plans", f, "PLAN_MANIFEST.json"))).map((f) => J(path.join(OUT, "gpt_plans", f, "PLAN_MANIFEST.json"))) : [];
const inFlight = new Map(); for (const pm of plans) for (const e of pm.entries) inFlight.set(e.artjob, { plan: pm.plan_id, stages: e.plan_stages, of: e.stages_total, seeds: e.repair_seeds.length });
const pending = fs.readdirSync(path.join(FILM, "reviews", "requests")).filter((d) => !fs.existsSync(path.join(FILM, "reviews", "requests", d, "REVIEW_REQUEST.answered.json")));
const heldByAmendment = pending.some((d) => d.startsWith("creative_packet__")) ? ["LEAD_MASTER", "REGULAR_MASTER"] : [];
const usedBy = new Map(); for (const a of p.actions) for (const id of a.art_ids || []) { if (!usedBy.has(id)) usedBy.set(id, []); usedBy.get(id).push(a.id); }
const rows = p.art_requirements.map((r) => { const j = byAsset.get(r.id), rec = j && byJob.get(j.artjob_id), master = r.kind === "MASTER", fl = j && inFlight.get(j.artjob_id), own = native.filter((n) => n.component === r.id);
  const route = master ? (fl?.seeds ? "REFERENCE_CONDITIONED_CORRECTED_GENERATION (repair of the original candidate)" : fl ? "ORIGINAL_GENERATION_THEN_SOURCE_ATTACHED_STAGES" : "ORIGINAL_GENERATION") : own.length ? "SOURCE_ATTACHED_HIGH_RES_COMPONENT_CROP" : derivationRoute(j || { asset_kind: r.kind }).route;
  const blockedOn = !j ? ["NO_ARTJOB"] : master ? (heldByAmendment.includes(r.id) && fl && fl.stages[1] < fl.of ? [`stages ${fl.stages[1] + 1}-${fl.of}: packet amendment 02 approval`] : []) : [`master ${j.derived_from} approval`, ...(own.length ? [`master ${j.derived_from} registration (crop measured from its landmarks)`] : [])];
  return { art_id: r.id, kind: r.kind, identity: r.identity, master: r.master_id || null, artjob: j?.artjob_id ?? null, required_by_actions: usedBy.get(r.id) || r.required_by || [], shots: j?.motion_context?.shot_ids || [], route, generates_image: master || (own.length ? true : derivationRoute(j || { asset_kind: r.kind }).generates_image),
    native_minimum: own.map((n) => `${n.measure} >= ${n.min_native_px}px`), status: rec?.status ?? null, in_flight: fl ? `${fl.plan} stages ${fl.stages.join("-")}/${fl.of}` : null, blocked_on: blockedOn }; });
const reqIds = new Set(p.art_requirements.map((r) => r.id)), orphanJobs = jobs.filter((j) => !reqIds.has(j.root_dependency)).map((j) => j.artjob_id), missingJobs = rows.filter((r) => !r.artjob).map((r) => r.art_id);
const actionsWithoutArt = p.actions.filter((a) => !(a.art_ids || []).length).map((a) => ({ action: a.id, mode: a.mode, why: "motion-native operation on existing art (camera/procedural/transition), no drawing of its own" }));
const unusedByActions = rows.filter((r) => !r.required_by_actions.length).map((r) => r.art_id);
// redundancy: two requirements identical in identity, kind, medium, state, parts, landmarks, purpose and draw order (reported for review, nothing removed)
const sig = (r) => JSON.stringify([r.identity, r.kind, r.medium, r.state || null, [...(r.required_parts || [])].sort(), [...(r.landmarks || [])].sort(), r.purpose || null, r.draw_order || null]), seen = new Map(), dup = [];
for (const r of p.art_requirements) { if (!r.state || Object.values(r.state).every((v) => v === null)) continue; const k = sig(r); if (seen.has(k)) dup.push([seen.get(k), r.id]); else seen.set(k, r.id); }
const count = (f) => rows.reduce((m, r) => ((m[f(r)] = (m[f(r)] || 0) + 1), m), {});
const report = { packet: active, actions: p.actions.length, shots: p.shots.length, identities: p.identities.length, art_requirements: rows.length, artjobs: jobs.length,
  coverage: { every_requirement_has_an_artjob: missingJobs.length === 0, missing_jobs: missingJobs, jobs_without_requirement: orphanJobs, requirements_no_action_uses: unusedByActions, actions_without_own_art: actionsWithoutArt },
  by_route: count((r) => r.route), image_generation: { required: rows.filter((r) => r.generates_image).length, not_required: rows.filter((r) => !r.generates_image).map((r) => `${r.art_id} (${r.route})`) },
  possible_redundancy_for_review: dup, in_flight_plans: plans.map((pm) => ({ plan: pm.plan_id, entries: pm.entries.length })), pending_human_requests: pending, rows };
fs.mkdirSync(REP, { recursive: true }); fs.writeFileSync(path.join(REP, "DEMAND_CLOSURE.json"), JSON.stringify(report, null, 1) + "\n");
console.log(JSON.stringify({ ...report, rows: undefined }, null, 1));
