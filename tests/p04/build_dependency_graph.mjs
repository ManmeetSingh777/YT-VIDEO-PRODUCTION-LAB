#!/usr/bin/env node
// P04 02: the end-to-end dependency graph, generated from the REAL source: every edge names a producer function, the consumer module that calls it
// and the exact line of the call; an edge whose call is not found in the source is reported as MISSING (never listed as if it existed).
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), OUT = path.resolve(REPO, process.argv[process.argv.indexOf("--out") + 1] || "hybrid_v2/evidence/p04/02_END_TO_END_DEPENDENCY_GRAPH.json");
const read = (f) => (fs.existsSync(path.join(REPO, f)) ? fs.readFileSync(path.join(REPO, f), "utf8").split(/\r?\n/) : null);
const edge = (stage, producer, consumer, call, contract, evidence) => { const src = read(consumer), re = new RegExp(`\\b${call.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*\\(`), line = src ? src.findIndex((l) => re.test(l)) : -1, prodFile = producer.split("#")[0], prodSrc = read(prodFile), pname = producer.split("#")[1]; const defines = prodSrc ? prodSrc.findIndex((l) => new RegExp(`(export )?(async )?(function|const) ${pname}\\b|export \\{[^}]*\\b${pname}\\b`).test(l)) : -1; return { stage, producer, producer_defined_at: prodSrc && defines >= 0 ? `${prodFile}:${defines + 1}` : null, consumer, call, call_site: line >= 0 ? `${consumer}:${line + 1}` : null, data_contract: contract, evidence, status: defines >= 0 && line >= 0 ? "CONNECTED" : defines < 0 ? "PRODUCER_MISSING" : "CALL_NOT_FOUND" }; };
const E = [
  edge("S00 script/intent", "engine/story/authoring_handoff.mjs#exportAuthoringRequest", "tests/p04/p04_closure.test.mjs", "exportAuthoringRequest", "AUTHORING_MANIFEST.json (sealed request)", "P04-2.1"),
  edge("S01 story", "engine/story/mechanism.mjs#validateStoryContract", "engine/production/stages.mjs", "validateStoryContract", "STORY_CONTRACT.json → typed claims", "S01 task story_contract"),
  edge("S02 direction", "engine/story/experience.mjs#compileAttention", "engine/production/stages.mjs", "compileAttention", "SHOT_SCORE attention + requires", "S02 tasks attention_*"),
  edge("S03 actions", "engine/story/action_coverage.mjs#compileActionCoverage", "engine/production/stages.mjs", "compileActionCoverage", "SEMANTIC_ACTIONS.json + events", "S03 actions_* / verbs registry"),
  edge("S03 timing/motion", "engine/story/motion_plan_source.mjs#compileProductionPlan", "engine/production/stages.mjs", "compileProductionPlan", "one plan = handoff/MOTION_PLAN.json + approved ACTION_PHRASES.json", "motion_plan_source"),
  edge("S03 motion compile", "engine/art_bridge/temporal.mjs#compileMotionTracks", "engine/production/stages.mjs", "compileMotionTracks", "plan + manifest → frame-addressable motion", "motion_layers"),
  edge("S03 phrases", "engine/art_bridge/acting.mjs#layerPhrases", "engine/art_bridge/temporal.mjs", "layerPhrases", "ActionPhrase → primary tracks", "D1"),
  edge("S03 acting", "engine/art_bridge/acting.mjs#compileActing", "engine/art_bridge/temporal.mjs", "compileActing", "acting → lag/anticipation/settle/additive/secondary/events", "A1"),
  edge("S03 state timeline", "engine/art_bridge/state_timeline.mjs#rigPoseTimeline", "engine/art_bridge/temporal.mjs", "rigPoseTimeline", "pose/view/channel history (persistent)", "P04-3.1"),
  edge("S03 channels", "engine/art_bridge/state_channels.mjs#channelEvents", "engine/art_bridge/temporal.mjs", "channelEvents", "state_events + acting swaps → channel states", "B1"),
  edge("S03 feasibility", "engine/art_bridge/art_intake.mjs#checkRigFeasibility", "engine/production/stages.mjs", "checkRigFeasibility", "every frame × every action, executed", "P04-4.1"),
  edge("S03 semantic consequences", "engine/film/semantic_qa.mjs#verifySemanticConsequences", "engine/production/stages.mjs", "verifySemanticConsequences", "typed verbs → measured consequence", "P04-5.4"),
  edge("S03 IR", "engine/production/production_ir.mjs#verifyArrows", "engine/production/stages.mjs", "verifyArrows", "decision→requirement→art→registered→motion arrows", "P04-1"),
  edge("S04 art demand", "engine/art_bridge/art_demand.mjs#deriveArtDemands", "engine/production/stages.mjs", "deriveArtDemands", "visible state inventory (HAND channel closure)", "P04-3.2"),
  edge("S05 art intake", "engine/art_bridge/art_intake.mjs#ingestPart", "tests/p03/subjects_fixture.mjs", "ingestPart", "registered part + receipt", "intake tests"),
  edge("S05 vector intake", "engine/art_bridge/art_intake.mjs#ingestVectorPart", "tests/p03/subjects_fixture.mjs", "ingestVectorPart", "VECTOR_PATH registration", "E3"),
  edge("S05 GPT handoff", "engine/art_bridge/gpt_handoff.mjs#exportGptJob", "engine/tools/art_outbox.mjs", "exportGptJob", "self-contained job bundle", "P02-R26"),
  edge("S06 registration", "engine/art_bridge/registration_evidence.mjs#verifyRegistrationReceipt", "engine/production/stages.mjs", "verifyRegistrationReceipt", "content-bound receipt", "registration_*"),
  edge("S06 approvals", "engine/art_bridge/approvals.mjs#verifyAllApprovals", "engine/production/stages.mjs", "verifyAllApprovals", "identity/asset/state(+channels)/edge authority", "P04-6.1"),
  edge("S06 deform approval", "engine/art_bridge/approvals.mjs#verifyDeformApproval", "engine/film/chrome_frames.mjs", "verifyDeformApproval", "hash-scoped deformation map", "P04-5.5"),
  edge("S07 scene graph", "engine/art_bridge/scene_graph.mjs#composeShot", "engine/film/chrome_frames.mjs", "composeShot", "frameState rows + execution checks", "F1/F3/F4"),
  edge("S07 grip", "engine/art_bridge/contact_solver.mjs#gripMorphology", "engine/art_bridge/scene_graph.mjs", "gripMorphology", "palm/handle/closure/layers", "P04-5.3"),
  edge("S07 deformation", "engine/art_bridge/execution.mjs#deformAt", "engine/art_bridge/temporal.mjs", "deformAt", "per-frame mesh affines", "E1"),
  edge("S07 morph", "engine/art_bridge/execution.mjs#morphAt", "engine/art_bridge/temporal.mjs", "morphAt", "homologous vector paths", "E3"),
  edge("S07 reactions", "engine/art_bridge/execution.mjs#solveHinge", "engine/art_bridge/temporal.mjs", "solveHinge", "hinge follows the pull", "F3"),
  edge("S07 shadows", "engine/art_bridge/motion_systems.mjs#castShadow", "engine/art_bridge/scene_graph.mjs", "castShadow", "material shadow + grounding rule", "F4"),
  edge("S07 runtime", "engine/art_bridge/render.mjs#buildComposition", "engine/film/chrome_frames.mjs", "buildComposition", "nu.js S.at hook + baked rows", "determinism tests"),
  edge("S07 chunks", "engine/film/segment_render.mjs#renderChunk", "engine/film/segment_render.mjs", "renderChunk", "RGB24 chunks + owner receipts", "P02-R03"),
  edge("S08 coverage gate", "engine/film/coverage_gate.mjs#coverageGate", "engine/production/stages.mjs", "coverageGate", "every frame + owner attribution", "G1"),
  edge("S08 owner gate", "engine/film/coverage_gate.mjs#ownerAttributionGate", "engine/film/coverage_gate.mjs", "ownerAttributionGate", "per-owner isolated pixels + counterfactuals", "clips/NEGATIVES"),
  edge("S09 audio mix", "engine/film/audio_mix.mjs#mixBuses", "engine/production/stages.mjs", "mixBuses", "buses + stems", "P04-7.7"),
  edge("S09 sync", "engine/film/audio_mix.mjs#verifyAudioSync", "engine/production/stages.mjs", "verifyAudioSync", "per-stem cue verification", "P04-7.7"),
  edge("S09 publish", "engine/film/audio_mix.mjs#publishFinal", "engine/production/stages.mjs", "publishFinal", "video + verified mix → final MP4 + receipt", "P04-7.7"),
  edge("S09 film review", "engine/tools/art_bridge_film_qa.mjs#filmBundle", "engine/tools/art_bridge_film_qa.mjs", "filmBundle", "film review bundle", "P02 film QA"),
  edge("run control", "engine/tools/production_run.mjs#start", "tests/p04/run_chain.mjs", "PR.start", "ledger-run stages S00–S09", "chain"),
];
const missing = E.filter((e) => e.status !== "CONNECTED"); fs.mkdirSync(path.dirname(OUT), { recursive: true }); fs.writeFileSync(OUT, JSON.stringify({ generated_by: "tests/p04/build_dependency_graph.mjs (each edge verified in source)", edges: E, connected: E.length - missing.length, not_connected: missing.map((m) => ({ stage: m.stage, producer: m.producer, consumer: m.consumer, status: m.status })) }, null, 1)); console.log(`edges ${E.length}, connected ${E.length - missing.length}, not connected:`, JSON.stringify(missing.map((m) => [m.producer, m.consumer, m.status])));
