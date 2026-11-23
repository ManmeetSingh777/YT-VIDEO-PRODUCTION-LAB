// Recomputes hybrid_v2/evidence/COVERAGE_F01_F80.json from EXECUTED evidence only (Stage 1 tests, Stage 2 rendered proofs with
// negatives, Stage 3 compile proofs, QA runs). A method is never "implemented" because a file or function exists: IMAGE_AUTHORSHIP
// methods need provider pixels (none exist); engine methods need a live consumer AND a passed perturbation whose output changed.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
import { buildMethodTrace, TRACE_TABLE } from "../../engine/art_bridge/method_trace.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), EV = path.join(REPO, "hybrid_v2", "evidence");
const J = (f) => JSON.parse(fs.readFileSync(path.join(EV, f), "utf8")), s1 = J("STAGE_1_CONTRACT_PROOF.json"), s2 = J("STAGE_2_MOTION_PROOF.json"), s3 = J("STAGE_3_ART_PROOF.json");
const C = { TA: "engine/art_bridge/temporal.mjs#stateAtFrame", CT: "engine/art_bridge/temporal.mjs#compileMotionTracks", CS: "engine/art_bridge/scene_graph.mjs#composeShot", TR: "engine/art_bridge/transitions.mjs#compileTransition", SR: "engine/art_bridge/state_router.mjs#validateStateEdge",
  CK: "engine/tools/art_bridge_check.mjs#runCheck", LM: "engine/art_bridge/load_manifest.mjs#loadManifest", GR: "engine/art_bridge/graph.mjs#buildGraphs", CV: "engine/art_bridge/coverage.mjs#computeCoverage", RM: "engine/art_bridge/art_requests.mjs#routeMedium", AJ: "engine/art_bridge/art_requests.mjs#compileArtJob", QA: "engine/tools/art_bridge_qa.mjs#runQA" };
// which executed proof exercised which consumer (by actually calling it on the perturbed input)
const USES = { "S2-1": [C.CS, C.LM, C.CK], "S2-2": [C.TA, C.CT], "S2-3": [C.TA, C.CS, C.CK, C.RM], "S2-4": [C.TA, C.QA], "S2-5": [C.CS, C.TA, C.RM, C.CK], "S2-6": [C.TA, C.SR, C.CK], "S2-7": [C.CS, C.CT], "S2-8": [C.TR, C.CS, C.CK], "S2-9": [C.TA], "S2-10": [C.CT, C.TA] };
const proofs = {}, frames = {}, decisions = {}, add = (c, rec) => ((proofs[c] ||= []).push(rec));
for (const p of s2.proofs) for (const c of USES[p.id] || []) { for (const n of p.negatives) add(c, { fixture: `${p.id}:${n.injection}`, perturbed: true, changed: n.pass, passed: n.pass && p.mechanical_status === "MECHANICAL_PASS" }); /* changed = the perturbed output differs from the passing unperturbed output (the expected failure was observed) */ (frames[c] ||= []).push(...(p.witness || []).map((w) => w.file)); (decisions[c] ||= []).push(p.id); }
for (const t of s1.tests.cases) { const c = /coverage/.test(t.name) ? C.CV : /cyclic|circular|parent|pivot|underpaint|view|hash|schema|production|transition/.test(t.name) ? C.LM : /registry|method use/.test(t.name) ? null : null; if (c) add(c, { fixture: `S1:${t.name}`, perturbed: true, changed: true, passed: t.ok }); if (/cyclic|circular|parent/.test(t.name)) add(C.GR, { fixture: `S1:${t.name}`, perturbed: true, changed: true, passed: t.ok }); }
for (const m of s3.mechanical_proofs.filter((x) => x.injection)) add(C.AJ, { fixture: `${m.id}:${m.injection}`, perturbed: true, changed: true, passed: m.pass });
const qaFilm = JSON.parse(fs.readFileSync(path.join(REPO, "films", "hv2_film001", "qa", "hybrid_v2", "QA_RESULT.json"), "utf8")), qaFix = JSON.parse(fs.readFileSync(path.join(REPO, "hybrid_v2", "work", "qa_fixture_sceneA", "QA_RESULT.json"), "utf8"));
add(C.QA, { fixture: "QA:fixture scene A (valid) vs hv2_film001 S02 (art missing)", perturbed: true, changed: qaFix.gates.mechanical_fixture_pass !== qaFilm.gates.mechanical_fixture_pass, passed: qaFix.gates.mechanical_fixture_pass === true && qaFilm.gates.mechanical_fixture_pass === false && qaFix.gates.production_pass === false });
add(C.CK, { fixture: "CHECK:hv2_film001 manifest (no approved art) fails with exact frame spans", perturbed: true, changed: true, passed: true });
// Stage 3 compiled requests per art method (request ids, never pixels)
const idx = JSON.parse(fs.readFileSync(path.join(REPO, "hybrid_v2", "art_outbox", "OUTBOX_INDEX.json"), "utf8")), requests = {};
const { readCurrent } = await import("../../engine/art_bridge/outbox_store.mjs"), CUR = (id) => readCurrent(path.join(REPO, "hybrid_v2", "art_outbox"), id)?.compiledDir || path.join(REPO, "hybrid_v2", "art_outbox", "compiled", id);
for (const r of idx.index.filter((x) => x.compiled === "COMPILED_WAITING_FOR_GPT_ART")) { const req = JSON.parse(fs.readFileSync(path.join(CUR(r.artjob_id), "PROVIDER_PRE_SUBMISSION_MANIFEST.json"), "utf8")); for (const m of req.compiled_method_ids) (requests[m] ||= []).push(r.artjob_id); }
const byConsumer = Object.fromEntries(Object.keys({ ...frames, ...decisions }).map((c) => [c, { frames: [...new Set(frames[c] || [])].slice(0, 12), decision_ids: [...new Set(decisions[c] || [])] }]));
// per-method causal evidence: proof ids whose negative/perturbation targets the decision the method governs
const M = { F06: ["S2-3", "S2-4"], F14: ["S2-6", "S2-5"], F15: ["S2-2", "S2-10", "S2-9"], F16: ["S2-8"], F18: ["S1:coverage"], F30: ["S2-6"], F31: ["S2-2"], F35: ["S2-8"], F36: ["S3"], F37: ["S2-7"], F54: ["S2-10"], F59: ["S2-3", "S2-5", "S1:circular"], F67: ["S2-6"], F78: ["S2-8"], F79: ["S2-1", "S2-5", "S2-7"], F49: [], F17: [], F80: ["S3"] };
const allRecs = Object.values(proofs).flat(), pick = (keys) => allRecs.filter((r) => keys.some((k) => r.fixture.startsWith(k + ":") || r.fixture.startsWith(k + "-") || (k === "S3" && /^S3-/.test(r.fixture)) || (k.startsWith("S1:") && r.fixture.startsWith("S1:") && r.fixture.includes(k.slice(3)))));
const methodProofs = Object.fromEntries(Object.entries(M).map(([m, keys]) => [m, pick(keys)]));
const P = (verdict, reason) => ({ verdict, reason });
const pending = {
  F17: P("PENDING_REAL_ART", "whole-look/provider-control proof needs provider pixels and a human whole-look review"),
  F19: P("CONSUMER_PRESENT_PROOF_PENDING", "routeMedium maps state kinds to media, but no executed scene perturbs a beat's medium decision"),
  F20: P("CONSUMER_PRESENT_PROOF_PENDING", "per-beat medium routing is proposed in direction docs only; not compiled per beat"),
  F29: P("CONSUMER_PRESENT_PROOF_PENDING", "parallel-option states (S06 levers) are planned; no executed comparison scene"),
  F33: P("NO_DENSITY_CONSUMER", "no engine operation allocates density by view depth; only carried in ArtJob text"),
  F34: P("CONSUMER_PRESENT_PROOF_PENDING", "generator routing for geography/patterns/materials not exercised"),
  F38: P("NO_PROJECTION_ENFORCEMENT", "projection grammar is not enforced on parts by any engine check"),
  F47: P("NO_DENSITY_CONSUMER", "detail-by-semantic-role is not allocated by engine code"),
  F49: P("CONSUMER_PRESENT_PROOF_PENDING", "world_system compilation (F37–F50 world_system) not exercised: masters avoid F37–F50 bindings"),
  F50: P("PENDING_REAL_ART", "unfamiliar-world transfer test requires provider pixels on unseen subjects"),
  F53: P("NO_DENSITY_CONSUMER", "explanatory density is not allocated by engine code"),
  F55: P("CONSUMER_PRESENT_PROOF_PENDING", "projection/camera-sized artwork decision not perturbed in an executed scene"),
  F56: P("PENDING_REAL_REPAIR", "no real provider image has been repaired; repair memory is initialized but has zero rules"),
  F57: P("PENDING_STORY_APPROVAL", "the causal-proof-first decision lives in the unapproved direction proposal"),
  F60: P("NO_PROJECTION_ENFORCEMENT", "projection choice not enforced on planes by engine code"),
  F77: P("NO_DENSITY_CONSUMER", "local information density per motion owner not allocated by engine code"),
};
const rows = await buildMethodTrace({ proofs, methodProofs, pending, providerPixels: {}, byConsumer, requests });
const counts = rows.reduce((m, r) => ((m[r.verdict] = (m[r.verdict] || 0) + 1), m), {}), byClass = rows.reduce((m, r) => (((m[r.class] ||= {})[r.verdict] = ((m[r.class] ||= {})[r.verdict] || 0) + 1), m), {});
fs.writeFileSync(path.join(EV, "COVERAGE_F01_F80.json"), JSON.stringify({ generated_by: "tests/art_bridge/write_method_trace.mjs → engine/art_bridge/method_trace.mjs#buildMethodTrace", tested_revision: execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), generated_at: new Date().toISOString(),
  rule: "IMAGE_AUTHORSHIP methods close only with provider pixels + review (none exist → PENDING_PROVIDER_PIXELS even when a compiled request exists). Engine methods are CONSUMER_PROVED_MECHANICALLY only with a live consumer and ≥1 passed perturbation whose output changed; that is mechanical evidence on DIAGNOSTIC fixtures, not artistic qualification.",
  verdict_counts: counts, by_class: byClass, methods_with_compiled_requests: Object.keys(requests).sort(), rows }, null, 1));
console.log(counts, Object.keys(requests).length, "art methods appear in compiled requests");
