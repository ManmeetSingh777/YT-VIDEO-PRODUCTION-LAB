// Independent-audit P0 reproduction + regression tests (inputs/INDEPENDENT_HYBRID_V2_AUDIT.md, P0-1..P0-6).
// Written BEFORE the repairs; the pre-repair failing run is preserved in hybrid_v2/evidence/p0/P0_REPRODUCTION_BEFORE.txt.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), OUTBOX = path.join(REPO, "hybrid_v2", "art_outbox");
const { readCurrent } = await import("../../engine/art_bridge/outbox_store.mjs"); // content-addressed outbox (directive E3): records resolve through CURRENT.json
const jobs = () => Object.keys(JSON.parse(fs.readFileSync(path.join(OUTBOX, "CURRENT.json"), "utf8"))).map((id) => readCurrent(OUTBOX, id).job);
const tmpFilm = (tag) => { const d = path.join(REPO, "hybrid_v2", "work", "p0", tag); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(path.join(REPO, "films", "hv2_film001"), d, { recursive: true, filter: (s) => !s.includes(`${path.sep}qa${path.sep}`) }); fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "DIAGNOSTIC fixture film\n"); return d; };
const hash = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

/* P0-1 — motion context frame ranges */
test("P0-1a every exported ArtJob whose triggers carry frames has non-empty motion_context.frame_ranges", () => {
  const bad = jobs().filter((j) => j.triggered_by.some((t) => t.frame_range) && !(j.motion_context.frame_ranges || []).length);
  assert.equal(bad.length, 0, `${bad.length} jobs lost their frame ranges, e.g. ${bad[0]?.artjob_id}`);
});
test("P0-1b Ines master context covers the S02 interval and the master's shots", () => {
  const j = jobs().find((x) => x.root_dependency === "ines_master");
  assert.ok(j.motion_context.frame_ranges.some(([a, b]) => a <= 900 && b >= 1920), JSON.stringify(j.motion_context.frame_ranges));
  assert.ok(j.motion_context.shot_ids.includes("S02"));
});
test("P0-1c perturbing S02 grip timing changes only dependent job contexts", async () => {
  const { planJobs } = await import("../../engine/art_bridge/art_intake.mjs");
  const film = tmpFilm("p01"), mf = path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json");
  const before = Object.fromEntries((await planJobs({ film })).jobs.map((j) => [j.root_dependency, hash(j.motion_context)]));
  const doc = JSON.parse(fs.readFileSync(mf, "utf8")); const c = doc.actions.find((a) => a.id === "S02_operate_washer").contact_events.find((x) => x.contact_type === "GRIP"); c.start_frame += 30; c.end_frame += 30; fs.writeFileSync(mf, JSON.stringify(doc, null, 1));
  const after = Object.fromEntries((await planJobs({ film })).jobs.map((j) => [j.root_dependency, hash(j.motion_context)]));
  const changed = Object.keys(before).filter((k) => before[k] !== after[k]);
  assert.ok(changed.length > 0 && changed.every((k) => /^ines_(hand_r|master)|^washer_(door|master)|^ines_(forearm|elbow|sleeve)/.test(k)), `changed: ${changed}`);
  assert.ok(!changed.includes("laundromat_far") && !changed.includes("ledger_master") && !changed.includes("street_far"));
});

/* P0-2 — master media routing */
test("P0-2a all six canonical-master jobs route to the canonical master medium", () => {
  const masters = jobs().filter((j) => j.state_kind === "MASTER");
  assert.equal(masters.length, 6);
  for (const m of masters) assert.match(m.medium.medium, /^(RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS|CANONICAL_WORLD_PLATE_WITH_OVERSCAN)$/, `${m.artjob_id}: ${m.medium.medium}`);
});
test("P0-2b routeMedium per typed kind; contradictory (state_kind, medium) refused", async () => {
  const { routeMedium, assertMediumContract } = await import("../../engine/art_bridge/art_requests.mjs");
  assert.equal(routeMedium({ kind: "MASTER", state_kind: "MASTER" }).medium, "RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS");
  assert.equal(routeMedium({ kind: "WORLD_PLANE", state_kind: "MASTER" }).medium, "CANONICAL_WORLD_PLATE_WITH_OVERSCAN");
  assert.equal(routeMedium({ kind: "PART" }).medium, "TRANSPARENT_REGISTERED_EDIT_OF_APPROVED_MASTER");
  assert.equal(routeMedium({ kind: "UNDERPAINT" }).medium, "TRANSPARENT_REGISTERED_EDIT_OF_APPROVED_MASTER");
  assert.equal(routeMedium({ kind: "WORLD_PLANE" }).medium, "OPAQUE_OR_LAYERED_RASTER_PLATE_WITH_OVERSCAN");
  assert.equal(routeMedium({ kind: "CEL" }).medium, "TRANSPARENT_RASTER_CEL_SEQUENCE");
  assert.equal(routeMedium({ kind: "TRANSITION_PLATE" }).medium, "OPAQUE_OR_LAYERED_RASTER_PLATE_WITH_OVERSCAN");
  assert.equal(routeMedium({ kind: "VECTOR_PATH" }).medium, "PROVIDER_SVG_IF_SUPPORTED");
  assert.equal(routeMedium({ kind: "TYPE" }).medium, "APPROVED_FONT_AND_VECTOR_TYPE");
  assert.throws(() => assertMediumContract({ state_kind: "MASTER", medium: { medium: "TRANSPARENT_RASTER_CUTOUT_PART" } }), (e) => e.code === "UNQUALIFIED_STYLE_ASSET");
});

/* P0-3 — master registration, review, dependent resumption, typed kinds, invalidation */
test("P0-3 intake API exists: ingest-master registers landmarks + identity hash; derived art refused before approval; kinds preserved", async () => {
  const I = await import("../../engine/art_bridge/art_intake.mjs");
  for (const f of ["ingestMaster", "reviewMaster", "ingestPart", "reviewPart", "approveStateEdge", "resumeDependentJobs"]) assert.equal(typeof I[f], "function", f);
  const R = await import("./roundtrip_fixture.mjs"); const rt = R.buildRoundTrip(path.join(REPO, "hybrid_v2", "work", "p0", "rt_test"));
  const m = await I.ingestMaster({ film: rt.film, asset: "pilot_master", file: rt.files.master, landmarks: rt.files.master_landmarks, provenance: "DIAGNOSTIC_FIXTURE" });
  const doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8")), id = doc.identities.find((i) => i.id === "pilot"), a = doc.assets.find((x) => x.id === "pilot_master");
  assert.equal(id.master_sha256, a.sha256); assert.ok(m.max_residual_px < 0.75); assert.ok(Object.keys(a.landmarks).length >= 5); assert.notDeepEqual(a.canonical_rect, [0, 0, a.width_px, a.height_px]);
  await assert.rejects(() => I.ingestPart({ film: rt.film, asset: "pilot_hand_open", file: rt.files.hand_open, landmarks: rt.files.hand_open_landmarks, provenance: "DIAGNOSTIC_FIXTURE" }), /not approved/);
  await I.reviewMaster({ film: rt.film, identity: "pilot", reviewer: "test-reviewer", verdict: "APPROVED", notes: "test", scope_note: "DIAGNOSTIC_ONLY" });
  const p = await I.ingestPart({ film: rt.film, asset: "pilot_underpaint", file: rt.files.underpaint, landmarks: rt.files.underpaint_landmarks, provenance: "DIAGNOSTIC_FIXTURE" });
  assert.equal(JSON.parse(fs.readFileSync(rt.manifest, "utf8")).assets.find((x) => x.id === "pilot_underpaint").kind, "UNDERPAINT"); assert.equal(p.status, "REGISTERED_PENDING_REVIEW");
});

/* P0-4 — approvals are hash-scoped receipts */
test("P0-4 production refuses random strings, foreign receipts, replaced PNGs, moved pivots, changed edges", async () => {
  const { verifyApproval } = await import("../../engine/art_bridge/approvals.mjs");
  assert.equal(typeof verifyApproval, "function");
  const R = await import("./roundtrip_fixture.mjs"), rt = await R.runRoundTrip(path.join(REPO, "hybrid_v2", "work", "p0", "rt_p04"));
  const { runCheck } = await import("../../engine/tools/art_bridge_check.mjs");
  const ok = await runCheck({ root: rt.film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json" }); assert.equal(ok.gates.approvals_verified, true, JSON.stringify(ok.approval_failures));
  const mutate = async (fn) => { const doc = JSON.parse(fs.readFileSync(rt.manifest, "utf8")); fn(doc); const f = path.join(rt.film, "handoff", `m_${crypto.randomBytes(3).toString("hex")}.json`); fs.writeFileSync(f, JSON.stringify(doc)); return runCheck({ root: rt.film, manifest: path.relative(rt.film, f), production: true }); };
  const refused = (r, id) => r.gates.approvals_verified === false && r.approval_failures.some((x) => x.record_id === id);
  assert.ok(refused(await mutate((d) => { d.assets.find((a) => a.id === "pilot_hand_open").approved_review_id = "diag_review"; }), "pilot_hand_open"), "random string");
  assert.ok(refused(await mutate((d) => { const a = d.assets.find((x) => x.id === "pilot_hand_open"), b = d.assets.find((x) => x.id === "pilot_hand_grip"); a.approved_review_id = b.approved_review_id; }), "pilot_hand_open"), "foreign receipt");
  assert.ok(refused(await mutate((d) => { d.assets.find((a) => a.id === "pilot_hand_open").sha256 = "f".repeat(64); }), "pilot_hand_open"), "replaced png (hash)");
  assert.ok(refused(await mutate((d) => { d.assets.find((a) => a.id === "pilot_hand_open").pivot_xy[0] += 3; }), "pilot_hand_open"), "moved pivot");
  assert.ok((await mutate((d) => { d.rigs[0].allowed_state_edges[0].max_transition_frames += 4; })).approval_failures.some((x) => x.scope === "edge"), "changed edge");
});

/* P0-5 — provider submit path */
test("P0-5 submit path: no provider → exact WAITING status and no file; stub server → receipts, decoded alpha, ancestry, idempotent", async () => {
  const I = await import("../../engine/art_bridge/art_intake.mjs"); assert.equal(typeof I.submitJob, "function");
  process.env.IMAGE_PROVIDER_SIZE = "170x170"; // the stub returns the 170x170 hand_grip fixture; size is part of every exported generation
  const R = await import("./roundtrip_fixture.mjs"), rt = await R.runRoundTrip(path.join(REPO, "hybrid_v2", "work", "p0", "rt_p05"));
  // directive N3: authority precedes provider discovery. The round-trip approvals are TEST_TRUST (diagnostic), honoured only on a loopback endpoint.
  const prevTT = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1";
  const w = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env: { OPENAI_BASE_URL: "http://127.0.0.1:9/v1", IMAGE_PROVIDER_SIZE: "170x170" } }); // loopback, no IMAGE_PROVIDER configured
  assert.equal(w.status, "WAITING_FOR_GPT_ART"); assert.equal(w.provider_called, false); assert.ok(!fs.existsSync(path.join(rt.outbox, "inbox", `${rt.jobIds.hand_grip}.png`)));
  const stub = await R.startProviderStub(rt.files.hand_grip); // TEST STUB
  try {
    const env = { IMAGE_PROVIDER_SIZE: stub.size, IMAGE_PROVIDER: "openai-images", IMAGE_PROVIDER_MODEL: "stub-model", OPENAI_API_KEY: "test-key-not-real", OPENAI_BASE_URL: stub.url, IMAGE_PROVIDER_CAPS: JSON.stringify({ generate: true, edit: true, transparentRaster: true, multipleReferences: true, svgGeneration: false }) };
    const r = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env, provenanceOverride: "TEST_STUB" });
    assert.equal(r.status, "PIXELS_RECEIVED_PENDING_REGISTRATION_AND_REVIEW", JSON.stringify(r.error || r.candidates?.map((c) => c.problems))); assert.equal(r.mode, "edit"); assert.ok(r.reference_hashes.includes(rt.masterSha));
    assert.ok(r.outputs[0].alpha_present); assert.equal(stub.requests().length, 1);
    const again = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env, provenanceOverride: "TEST_STUB" });
    assert.equal(again.status, "ALREADY_SUBMITTED_SAME_PAYLOAD"); assert.equal(stub.requests().length, 1); assert.equal(r.provenance_to_ingest, "TEST_STUB");
  } finally { await stub.close(); process.env.ART_BRIDGE_TEST_TRUST = prevTT ?? ""; }
});

/* P0-6 — QA gate separation */
test("P0-6 fixture QA passes only the mechanical gate; production gate fails without audio and review", async () => {
  const { runQA } = await import("../../engine/tools/art_bridge_qa.mjs");
  const r = await runQA({ root: path.join(here, "fixtures"), manifest: "stage2/scene_P.manifest.json", scene: "shotP", out: path.join(REPO, "hybrid_v2", "work", "p0", "qa_p06"), plan: path.join(here, "fixtures", "stage2", "scene_P.plan.json"), frames: [5], argv: ["node", "art_bridge_qa.mjs"] });
  assert.equal(r.gates.mechanical_fixture_pass, true); assert.equal(r.gates.audio_alignment_pass, false); assert.equal(r.gates.artistic_review_pass, false); assert.equal(r.gates.production_pass, false);
  assert.equal(r.pass, false); assert.notEqual(r.exit_code, 0);
  const m = await runQA({ root: path.join(here, "fixtures"), manifest: "stage2/scene_P.manifest.json", scene: "shotP", out: path.join(REPO, "hybrid_v2", "work", "p0", "qa_p06m"), plan: path.join(here, "fixtures", "stage2", "scene_P.plan.json"), frames: [5], mechanicalOnly: true, argv: ["node", "art_bridge_qa.mjs"] });
  assert.equal(m.exit_code, 0); assert.equal(m.verdict_label, "MECHANICAL_FIXTURE_PASS");
});

test("P0-1d world-camera footprint perturbation changes only that world's jobs; compiled master prompt hash follows", async () => {
  const { planJobs } = await import("../../engine/art_bridge/art_intake.mjs"), { compileArtJob } = await import("../../engine/art_bridge/art_requests.mjs"), { contractContext } = await import("../../engine/art_bridge/art_contract.mjs");
  const film = tmpFilm("p01d"), mf = path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), design = JSON.parse(fs.readFileSync(path.join(film, "art_designs", "laundromat_far.design.json"), "utf8")), design2 = JSON.parse(fs.readFileSync(path.join(film, "art_designs", "ines_master.design.json"), "utf8"));
  const run = async (tag) => { const { jobs } = await planJobs({ film }); const by = Object.fromEntries(jobs.map((j) => [j.root_dependency, j]));
    const { dependencyDigest } = await import("../../engine/art_bridge/art_requests.mjs"), mem = path.join(film, "learning", "REPAIR_MEMORY.json");
    assert.throws(() => compileArtJob(by.laundromat_far, { film, outDir: path.join(film, "_c", tag, "l"), repairMemory: mem }), (e) => e.code === "ART_CONTRACT_REFUSED"); // world design is BLOCKED (no family/decisions)
    const c1 = { prompt_sha256: dependencyDigest({ job: by.laundromat_far, design, repairMemory: mem }).digest }, c2 = compileArtJob(by.ines_master, { baseJob: design2, outDir: path.join(film, "_c", tag, "i"), repairMemory: path.join(film, "learning", "REPAIR_MEMORY.json"), contract: contractContext(film, JSON.parse(fs.readFileSync(mf, "utf8")), by.ines_master) }); // Stage 3: character masters compile only through the contract gate
    return { ctx: Object.fromEntries(jobs.map((j) => [j.root_dependency, hash(j.motion_context)])), lp: c1.prompt_sha256, ip: c2.prompt_sha256 }; };
  const a = await run("a"); const doc = JSON.parse(fs.readFileSync(mf, "utf8")); doc.worlds.find((w) => w.id === "w_laundromat").overscan_rect = [-320, -180, 2560, 1440]; fs.writeFileSync(mf, JSON.stringify(doc, null, 1));
  const b = await run("b"), changed = Object.keys(a.ctx).filter((k) => a.ctx[k] !== b.ctx[k]);
  assert.ok(changed.length && changed.every((k) => k.startsWith("laundromat_")), `changed: ${changed}`);
  assert.notEqual(a.lp, b.lp); assert.equal(a.ip, b.ip);
});
