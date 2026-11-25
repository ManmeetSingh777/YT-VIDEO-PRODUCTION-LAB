#!/usr/bin/env node
// P06 short integration evidence (DIAGNOSTIC, run once on the frozen source): builds the two-unlike-subject film through the real intake, compiles the
// PerformanceCommand packet through compileMotionTracks, measures every effect, and writes the closure, the example packet and the QA results.
//   node tests/tbo/p06_integration_evidence.mjs --out engineering/p06 --source-sha <sha>
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const out = path.resolve(arg("--out", path.join(REPO, "engineering", "p06"))), W = path.join(REPO, "hybrid_v2", "work", "p06", "evidence_subjects");
const { runSubjects } = await import("../p03/subjects_fixture.mjs"), F = await import("./performance_fixture.mjs"), { createAssetRegistry } = await import("../../engine/art_bridge/asset_registry.mjs");
const { compileMotionTracks } = await import("../../engine/art_bridge/temporal.mjs"), { verifyPerformance } = await import("../../engine/film/performance_qa.mjs");
const rt = await runSubjects(W), reg = await createAssetRegistry(rt.film, "handoff/ART_AND_MOTION_MANIFEST_V2.json", {}), doc = F.augmentDoc(reg.doc), cue = F.speechCue(path.join(W, "audio")), plan = F.planWith(doc, F.packet(doc), cue);
const C = compileMotionTracks(doc.actions, doc.shots, { doc, plan, requireApproval: false }), Q = verifyPerformance(C); fs.mkdirSync(out, { recursive: true });
const cueRel = { ...cue, audio_file: path.relative(REPO, cue.audio_file).split(path.sep).join("/") };
fs.writeFileSync(path.join(out, "PERFORMANCE_COMMAND_EXAMPLE.json"), JSON.stringify({ diagnostic: true, note: "DIAGNOSTIC example on the P03 subjects (flat stand-in rasters, TEST_TRUST profiles, tone-burst cue); not E01 direction", packet: plan.performance.packet, profiles: plan.performance.profiles, audio_cues: { [cue.cue_id]: cueRel } }, null, 1));
fs.writeFileSync(path.join(out, "ART_CLOSURE_INPUT.json"), JSON.stringify({ capability_profiles: C.performance.capability_profiles, art_demands: C.performance.art_demands, missing_art: C.performance.missing_art, per_command: C.performance.commands.map((c) => ({ id: c.id, verb: c.verb, rig: c.rig, art_closure: c.art_closure })) }, null, 1));
const pix = path.join(REPO, "hybrid_v2", "work", "p06", "render", "PIXEL_EVIDENCE.json");
fs.writeFileSync(path.join(out, "SHORT_INTEGRATION_EVIDENCE.json"), JSON.stringify({ source_sha: arg("--source-sha"), diagnostic: true, film: path.relative(REPO, rt.film).split(path.sep).join("/"), packet_sha256: C.performance.packet_sha256, schema_sha256: C.performance.schema_sha256, adapter_version: C.performance.adapter_version, qa_ok: Q.ok, results: Q.results, failures: Q.failures.map((f) => f.toJSON()), human_review_pending: Q.human_review_pending, chrome_pixel_evidence: fs.existsSync(pix) ? JSON.parse(fs.readFileSync(pix, "utf8")) : "run tests/tbo/performance_commands.test.mjs first (P06-R1)" }, null, 1));
console.log(JSON.stringify({ qa_ok: Q.ok, effects: Q.results.length, failures: Q.failures.length, out: path.relative(REPO, out) }));
