// Directive E4 — U01..U06: universal, fail-closed art/motion/design contract. Every refusal is asserted BEFORE the provider stub's call
// counter moves. Before-run: hybrid_v2/evidence/system_correction/BEFORE/P02_REPRODUCTION.json (live code at 9a2a9ad).
process.env.ART_BRIDGE_TEST_TRUST = "1"; // diagnostic receipts only; U06 proves it can never reach a real provider
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { tempFilm, approveAll, stubEnv, STUB_PNG, W, TT } from "./universal_fixture.mjs";
const C = await import("../../engine/art_bridge/art_contract.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs"), R = await import("../../engine/art_bridge/art_requests.mjs");
const O = await import("../../engine/tools/art_outbox.mjs"), { startProviderStub } = await import("./roundtrip_fixture.mjs"), A = await import("../../engine/art_bridge/art_families.mjs"), M = await import("../../engine/art_bridge/method_applicability.mjs");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), Wj = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1)), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
const MASTERS = ["ines_master", "washer_master", "ledger_master", "laundromat_far", "drum_in", "street_far"];

test("U01 all six masters produce a NON-NULL contract status; each incomplete design is BLOCKED (never COMPILED/SUBMITTED)", async () => {
  const film = tempFilm("u01"), { jobs } = await I.planJobs({ film });
  for (const a of MASTERS) { const j = jobs.find((x) => x.root_dependency === a), g = C.gateForJob({ film, job: j });
    assert.ok(g && typeof g.pass === "boolean" && g.status !== "NOT_EVALUATED", `${a}: gate report missing`); assert.ok(g.failures.length || g.pass, a); }
  // make every design incomplete in a different way: drop one required decision (ines), no family (others as authored today)
  const di = path.join(film, "art_designs", "ines_master.design.json"), d = J(di); d.method_decisions = d.method_decisions.filter((x) => x.method_id !== "F65"); Wj(di, d);
  const out = path.join(W, "u01", "outbox"), s = await O.exportOutbox({ film, out });
  for (const a of MASTERS) { const r = s.index.find((x) => x.asset === a); assert.equal(r.status, "BLOCKED_CONTRACT", `${a} status ${r.status}`); assert.equal(r.compiled, "BLOCKED_CONTRACT"); }
  const stub = await startProviderStub(STUB_PNG);
  try { for (const a of MASTERS) { const r = await I.submitJob({ film, out, job: s.index.find((x) => x.asset === a).artjob_id, env: stubEnv(stub.url) }); assert.equal(r.status, "REFUSED", a); } assert.equal(stub.requests().length, 0); } finally { await stub.close(); }
});

test("U02 two unlike families absent from the laundromat fixtures route distinct source methods and motion obligations", () => {
  const doc = (id, kind, rigs = [], extra = {}) => ({ identities: [{ id, kind, canonical_asset_id: `${id}_master`, landmarks: {} }], rigs, actions: [], shots: [], worlds: [], transitions: [], assets: [], ...extra });
  const job = (id) => ({ artjob_id: `ARTJOB_MASTER_${id}`, identity_id: id, root_dependency: `${id}_master`, state_kind: "MASTER", motion_context: { alpha_requirement: "STRAIGHT", view_id: "side" }, medium: { medium: "RASTER_MASTER_THEN_SOURCE_ATTACHED_EDITS" } });
  const arm = (n) => [{ id: `arm${n}_base`, parent_id: null }, { id: `arm${n}_mid`, parent_id: `arm${n}_base` }, { id: `arm${n}_tip`, parent_id: `arm${n}_mid` }];
  const octo = doc("octo", "CHARACTER", [{ id: "octo_rig", identity_id: "octo", joints: [...arm(1), ...arm(2)], sockets: [{ id: "sucker_grip", joint_id: "arm1_tip" }], pose_states: [{ id: "curl" }, { id: "grip" }, { id: "release" }], view_states: [], render_parts: [], constraints: [], allowed_state_edges: [] }]);
  const fo = A.subjectFacts({ design: { art_family: "ANIMAL_OR_ORGANISM", subject_profile: { face_visible: true } }, job: job("octo"), doc: octo, plan: { assets: [] } });
  const volcano = doc("volcano", "WORLD"), fv = A.subjectFacts({ design: { art_family: "NATURAL_WORLD", subject_profile: { natural_elements: true, scientific_interaction: true, effects: true, depth_planes: 3 } }, job: job("volcano"), doc: volcano, plan: { assets: [] } });
  const ro = M.applicability(fo).filter((r) => r.required).map((r) => r.method), rv = M.applicability(fv).filter((r) => r.required).map((r) => r.method), ri = MASTERS && ["F05", "F64", "F66"];
  for (const m of ["F07", "F64", "F65", "F67", "F14"]) assert.ok(ro.includes(m), `organism lacks ${m}`);
  for (const m of ["F05", "F06", "F66", "F37", "F39"]) assert.ok(!ro.includes(m), `organism wrongly requires ${m}`); // no humanoid default, no world rules
  for (const m of ["F11", "F37", "F38", "F39", "F69", "F25", "F32", "F63", "F46", "F47"]) assert.ok(rv.includes(m), `volcanic world lacks ${m}`);
  for (const m of ri) assert.ok(!rv.includes(m), `volcanic world wrongly requires human method ${m}`);
  assert.deepEqual(fo.topics, A.FAMILIES.ANIMAL_OR_ORGANISM.topics); assert.notDeepEqual(new Set(ro), new Set(rv));
  assert.deepEqual(fo.sockets, ["sucker_grip"]); assert.equal(fo.joints.length, 6); // motion obligations: every joint/socket needs attachment/contact semantics
  const g = C.validateAgreementUniversal({ design: { art_motion_agreement: { view_id: "side", motion_representation: "ARTICULATED", state_family: ["curl"] }, output: { alpha_mode: "STRAIGHT", authored_width_px: 1, authored_height_px: 1 }, motion_requirements: {} }, job: job("octo"), doc: octo, facts: fo });
  assert.ok(g.some((x) => x.code === "CONTRACT_INTERFACE_MISSING") && g.some((x) => x.code === "CONTRACT_STATE_MISSING"));
});

test("U03 every missing authority refuses BEFORE the provider spy's call count moves (positive control proves the spy)", async () => {
  const film = tempFilm("u03"); await approveAll(film, ["ines_master"]); const out = path.join(W, "u03", "outbox"), s = await O.exportOutbox({ film, out }), ines = s.index.find((x) => x.asset === "ines_master").artjob_id;
  const di = path.join(film, "art_designs", "ines_master.design.json"), D0 = J(di), stub = await startProviderStub(STUB_PNG), env = stubEnv(stub.url), seen = {};
  const expectRefusal = async (name, mutate, restore, code) => { mutate(); try { const r = await I.submitJob({ film, out, job: ines, env }); assert.equal(r.status, "REFUSED", `${name}: ${r.status}`); if (code) assert.equal(r.code, code, `${name}: ${r.code}`); seen[name] = r.code; } finally { restore(); } assert.equal(stub.requests().length, 0, `${name} reached the provider`); };
  const mutD = (fn) => () => { const d = JSON.parse(JSON.stringify(D0)); fn(d); Wj(di, d); }, resD = () => Wj(di, D0);
  const mv = (f) => [() => fs.renameSync(f, f + ".off"), () => fs.renameSync(f + ".off", f)];
  try {
    { const r = await I.submitJob({ film, out, job: "ARTJOB_DOES_NOT_EXIST", env }); assert.equal(r.code, "ART_CONTRACT_NOT_EVALUATED"); }
    await expectRefusal("missing story receipt", ...mv(path.join(film, "approvals", "STORY.POINTER.json")), "STORY_APPROVAL_REQUIRED");
    await expectRefusal("missing direction receipt", ...mv(path.join(film, "approvals", "DIRECTION.POINTER.json")), "DIRECTION_APPROVAL_REQUIRED");
    await expectRefusal("missing design receipt", ...mv(path.join(film, "art_designs", "ines_master.APPROVAL_POINTER.json")), "DESIGN_APPROVAL_REQUIRED");
    await expectRefusal("stale source hash", mutD((d) => { d.method_decisions[0].source_clause_sha256 = "0".repeat(64); }), resD, "ART_CONTRACT_REFUSED");
    await expectRefusal("invalid agreement (view)", mutD((d) => { d.first_pass_control.character_designs[0].view_id = "front"; }), resD, "ART_CONTRACT_REFUSED");
    await expectRefusal("placeholder molecular", mutD((d) => { d.molecular_visual_decisions.highest_impact_question = "USE F57–F80 METHOD ROUTING"; }), resD, "ART_CONTRACT_REFUSED");
    await expectRefusal("missing witness image", mutD((d) => { d.first_pass_control.references[0].path = "assets/character_native_anchors/DOES_NOT_EXIST.jpg"; }), resD, "ART_CONTRACT_REFUSED");
    await expectRefusal("unknown family", mutD((d) => { d.art_family = "SPACESHIP"; }), resD, "ART_CONTRACT_REFUSED");
    await expectRefusal("approved design changed after approval", mutD((d) => { d.first_pass_control.palette_roles.focal_subject = "a different jacket colour"; }), resD, "DESIGN_APPROVAL_REQUIRED");
    const capsOff = { ...env, IMAGE_PROVIDER_CAPS: JSON.stringify({ generate: true, edit: true, transparentRaster: false, multipleReferences: true }) };
    { const r = await I.submitJob({ film, out, job: ines, env: capsOff }); assert.notEqual(r.status, "PIXELS_RECEIVED_PENDING_REGISTRATION_AND_REVIEW"); assert.equal(stub.requests().length, 0, "unsafe capability reached the provider"); seen["unsafe capability"] = r.code || r.status; }
    assert.throws(() => R.compileArtJob({ artjob_id: "X", state_kind: "MASTER" }, { outDir: path.join(W, "u03", "nofilm") }), (e) => e.code === "ART_CONTRACT_NOT_EVALUATED");
    for (const fam of Object.keys(A.FAMILIES)) assert.ok(Object.values(M.RULES).some(([, phase, when]) => ["STRUCTURE", "SURFACE"].includes(phase) && when({ family: fam, world: /_WORLD$/.test(fam), states: [], contacts: [], human: false, organism: false, diagram: false, typography: false })), `${fam} would get zero authored methods`);
    // positive control: with every authority present the same path DOES reach the stub (so the zero counts above are meaningful)
    const ok = await I.submitJob({ film, out, job: ines, env }); assert.equal(ok.provider_called, true, JSON.stringify(ok).slice(0, 300)); assert.equal(ok.provenance_to_ingest, "TEST_STUB"); assert.equal(stub.requests().length, 1);
  } finally { await stub.close(); fs.writeFileSync(path.join(W, "u03", "REFUSAL_CODES.json"), JSON.stringify(seen, null, 1)); }
});

test("U04 each upstream mutation yields a new dependency digest and stale approval; an unchanged rerun keeps the digest and the old bytes", async () => {
  const film = tempFilm("u04"), { jobs } = await I.planJobs({ film }), j = jobs.find((x) => x.root_dependency === "ines_master"), design = J(path.join(film, "art_designs", "ines_master.design.json")), mem = path.join(film, "learning", "REPAIR_MEMORY.json");
  const skillCopy = path.join(W, "u04", "skill"); fs.cpSync(R.SKILL + "/scripts", path.join(skillCopy, "scripts"), { recursive: true }); fs.cpSync(R.SKILL + "/references", path.join(skillCopy, "references"), { recursive: true });
  const base = (o = {}) => R.dependencyDigest({ job: j, design, repairMemory: mem, storyBundle: C.scopeBundle(film, "story"), directionBundle: C.scopeBundle(film, "direction"), size: "1536x1024", skillRoot: skillCopy, ...o }).digest, d0 = base();
  assert.equal(base(), d0, "unchanged rerun must keep its digest");
  const d2 = JSON.parse(JSON.stringify(design)); d2.method_decisions[0].specific_decision += " (revised)"; assert.notEqual(base({ design: d2 }), d0, "design");
  assert.notEqual(base({ job: { ...j, motion_context: { ...j.motion_context, view_id: "profile_r" } } }), d0, "motion context");
  assert.notEqual(base({ editReference: { sha256: "a".repeat(64) } }), d0, "master edit reference");
  fs.appendFileSync(path.join(skillCopy, "scripts", "prepare_first_pass.py"), "\n# mutated\n"); assert.notEqual(base(), d0, "skill"); fs.cpSync(R.SKILL + "/scripts", path.join(skillCopy, "scripts"), { recursive: true });
  const m0 = fs.readFileSync(mem); const mm = J(mem); mm.rules = [...(mm.rules || []), { rule_id: "U04-MATCHING", applies_when: { family: "ACTING_HUMAN" } }]; Wj(mem, mm); assert.notEqual(base(), d0, "a repair rule matching this job"); fs.writeFileSync(mem, m0); // non-matching rule changes are covered by L06
  const sf = path.join(film, "direction", "SHOT_SCORE_60FPS.json"), s0 = fs.readFileSync(sf); fs.appendFileSync(sf, " "); assert.notEqual(base(), d0, "direction"); fs.writeFileSync(sf, s0);
  assert.equal(base(), d0, "restored inputs restore the digest");
  // stale approval: approve, then mutate the design → the receipt no longer verifies
  await approveAll(film, ["ines_master"]); const doc = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
  assert.equal(C.gateForJob({ film, doc, job: j }).design_approval.status, "DESIGN_APPROVED");
  const di = path.join(film, "art_designs", "ines_master.design.json"); Wj(di, d2); assert.equal(C.gateForJob({ film, doc, job: j }).design_approval.status, "BLOCKED_ON_DESIGN_APPROVAL");
  fs.appendFileSync(sf, " "); assert.equal(C.scopeApprovalStatus(film, doc, "direction").ok, false, "direction edit must stale the direction receipt");
});

test("U05 exporting twice keeps every earlier compiled request, candidate and receipt byte-identical; no whole-directory deletion", async () => {
  const film = tempFilm("u05"); await approveAll(film, ["ines_master"]); const out = path.join(W, "u05", "outbox");
  const s1 = await O.exportOutbox({ film, out }), ines = s1.index.find((x) => x.asset === "ines_master"), gen = path.join(out, "compiled", ines.artjob_id, ines.generation);
  const marker = path.join(out, "inbox", "candidates", "KEEP_ME.png"); fs.mkdirSync(path.dirname(marker), { recursive: true }); fs.copyFileSync(STUB_PNG, marker);
  const snap = Object.fromEntries(fs.readdirSync(gen).map((f) => [f, sha(path.join(gen, f))])), receipts = fs.readdirSync(path.join(film, "reviews")).map((f) => [f, sha(path.join(film, "reviews", f))]);
  const s2 = await O.exportOutbox({ film, out }); assert.equal(s2.index.find((x) => x.asset === "ines_master").generation, ines.generation);
  for (const [f, h] of Object.entries(snap)) assert.equal(sha(path.join(gen, f)), h, `${f} changed on re-export`);
  assert.ok(fs.existsSync(marker)); for (const [f, h] of receipts) assert.equal(sha(path.join(film, "reviews", f)), h);
  // a changed design creates a NEW generation beside the old one; the old one stays
  const di = path.join(film, "art_designs", "ines_master.design.json"), d = J(di); d.method_decisions[0].specific_decision += " (revised)"; Wj(di, d);
  const s3 = await O.exportOutbox({ film, out }), g3 = s3.index.find((x) => x.asset === "ines_master").generation; assert.notEqual(g3, ines.generation);
  for (const [f, h] of Object.entries(snap)) assert.equal(sha(path.join(gen, f)), h, `old generation ${f} must survive`);
});

test("U06 a rejected design cannot be bypassed by doc.status, human:true, test-trust or an edited pointer; test-trust never reaches a real provider", async () => {
  const film = tempFilm("u06"), jobs = await approveAll(film, ["ines_master"]), out = path.join(W, "u06", "outbox"), s = await O.exportOutbox({ film, out }), ines = s.index.find((x) => x.asset === "ines_master").artjob_id;
  const doc = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), j = jobs.find((x) => x.root_dependency === "ines_master"), ptr = path.join(film, "art_designs", "ines_master.APPROVAL_POINTER.json"), good = J(ptr);
  // test-trust can never reach a non-loopback provider, even with every receipt present
  { const r = await I.submitJob({ film, out, job: ines, env: { ...stubEnv("https://api.example.invalid/v1") } }); assert.equal(r.code, "TEST_TRUST_FORBIDDEN"); assert.equal(r.provider_called, false); }
  await C.approveDesign({ film, doc, job: j, reviewer: "fixture-art-director", verdict: "REJECTED", attestation: TT });
  const stub = await startProviderStub(STUB_PNG);
  try {
    const mf = path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), d = J(mf); d.status = "ART_READY"; Wj(mf, d);
    let r = await I.submitJob({ film, out, job: ines, env: stubEnv(stub.url) }); assert.equal(r.status, "REFUSED"); // doc.status change also stales direction; either way refused
    d.status = "PLANNED"; Wj(mf, d);
    Wj(ptr, good); r = await I.submitJob({ film, out, job: ines, env: stubEnv(stub.url) }); assert.equal(r.code, "DESIGN_APPROVAL_REQUIRED", "edited pointer to the revoked approval must not verify");
    await assert.rejects(C.approveDesign({ film, doc, job: j, reviewer: "x", verdict: "APPROVED", human: true }), /interactive operator/); // human:true without a TTY cannot mint HUMAN
    assert.equal(stub.requests().length, 0);
  } finally { await stub.close(); }
  const saved = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "";
  try { assert.throws(() => C.requireApprovedContract({ film, doc, job: j }), (e) => ["DESIGN_APPROVAL_REQUIRED", "STORY_APPROVAL_REQUIRED"].includes(e.code)); } finally { process.env.ART_BRIDGE_TEST_TRUST = saved; } // TEST_TRUSTED receipts do not verify without test mode
});
