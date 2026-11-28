#!/usr/bin/env node
// E01: compile the semantic (geometry-independent) motion plan → films/e01/handoff/MOTION_PLAN.json, and validate it through the real acting
// compiler. Film data here: blink cadence (ENGINE DEFAULT pending the director — the packet directs only "microblink outside capture") and
// Mia's directed no-blink capture window [882,912) (PERFORMANCE_STATES MIA-P12 / photo intent aim_stable).
//   node tools/tbo/e01_compile_motion_plan.mjs --film films/e01
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), S = await import(url.pathToFileURL(path.join(REPO, "engine/story/semantic_motion_plan.mjs"))), A = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/acting.mjs")));
const pk = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", pk), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), { sources, used } = S.loadPacketSources(pdir);
const capture = sources.reconciliation?.photo_intent?.aim_stable || [882, 912];
const blinkDefaults = { CHAR_MIA: { period_frames: 210, duration_frames: 6, phase_frames: 96, exclude_frames: [capture], origin: "DIRECTOR_CONFIRMED 2026-11-28" },
  CHAR_LEAD: { period_frames: 230, duration_frames: 6, phase_frames: 150, origin: "DIRECTOR_CONFIRMED 2026-11-28" }, CHAR_REGULAR: { period_frames: 200, duration_frames: 6, phase_frames: 40, origin: "DIRECTOR_CONFIRMED 2026-11-28" } };
const plan = S.compileSemanticMotionPlan({ doc, sources, packetSha: pk, blinkDefaults, qualification: [180, doc.stage.total_frames] }); plan.sources = used;
const PH = path.join(FILM, "handoff", "PHYSICAL_SOLVE.json"); if (fs.existsSync(PH)) { const ph = J(PH); plan.ik_branches = ph.ik_branches; plan.physical = { source: "handoff/PHYSICAL_SOLVE.json", sha256: crypto.createHash("sha256").update(fs.readFileSync(PH)).digest("hex"), pending: ph.pending }; } // engine-solved physical inputs (tools/tbo/e01_solve_award.mjs)
const act = A.compileActing(doc, plan); plan.acting_compile = { events: act.events.length, errors: act.errors.map((e) => `${e.code} ${e.record_id}: ${(e.human_readable_reason || "").slice(0, 160)}`), report: act.report };
const out = path.join(FILM, "handoff", "MOTION_PLAN.json"); fs.writeFileSync(out, JSON.stringify(plan, null, 1));
console.log(JSON.stringify({ out, sha256: crypto.createHash("sha256").update(fs.readFileSync(out)).digest("hex"), rigs: Object.keys(plan.tracks).length, pose_targets: plan.pose_targets.length, view_targets: plan.view_targets.length, gaze: plan.gaze.length, reaches: Object.keys(plan.reaches).length, acting: Object.fromEntries(Object.entries(plan.acting).map(([k, v]) => [k, Object.keys(v)])), acting_events: act.events.length, acting_errors: plan.acting_compile.errors, cuts: plan.cuts, symbolic_bindings: plan.symbolic_bindings.length, outgoing: plan.outgoing }, null, 1));
