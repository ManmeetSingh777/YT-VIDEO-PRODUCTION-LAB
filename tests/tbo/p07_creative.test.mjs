// P07 creative-layer closures: (1) an unsupported PINCH can never disappear from a compiled plan, (2) a schema-valid, approval-scoped PRODUCTION
// PHASE packet (a part of a longer film from the parent's f0), (3) the ten-pass pre-generation audit is enforced, bound and content-checked.
//   node --test tests/tbo/p07_creative.test.mjs
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p07", "creative"); fs.rmSync(W, { recursive: true, force: true }); fs.mkdirSync(W, { recursive: true });
const { buildPacket } = await import("../p05/packet_fixture.mjs"), V = await import("../../engine/story/creative_packet.mjs"), PF = await import("../../engine/story/creative_preflight.mjs"), A = await import("../../engine/story/creative_adapter.mjs");
const PA = await import("../../engine/art_bridge/pregen_audit.mjs"), { bundleHash } = await import("../../engine/art_bridge/approvals.mjs"), C = await import("../../engine/art_bridge/art_contract.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
const clone = (o) => JSON.parse(JSON.stringify(o)), src = path.join(W, "src"), base = buildPacket(src), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const firstGrip = (p) => p.actions.flatMap((a) => a.contact_events.map((c) => ({ a, c }))).find((x) => x.c.type === "GRIP");
const codeOf = (fn) => { try { fn(); return null; } catch (e) { return { code: e.code, inv: e.failed_invariant, reason: e.human_readable_reason }; } };

test("P07-P1 PINCH is refused at preflight AND at compile; it is never dropped or silently turned into a GRIP", () => {
  const p = clone(base), g = firstGrip(p); assert.ok(g, "fixture has a GRIP to re-direct"); g.c.type = "PINCH";
  assert.equal(V.validatePacket(p).status, "STRUCTURAL_VALID", "a PINCH request is structurally expressible");
  const pf = PF.creativePreflight(p), fb = pf.feedback.find((x) => x.failed_invariant === "CONTACT_TYPE_SUPPORTED");
  assert.ok(fb && fb.needed_change_type === "MISSING_ENGINE_PRODUCER" && pf.preart_feasible === false, "preflight names the missing producer");
  const e = codeOf(() => A.compilePacket(p)); assert.equal(e?.code, "UNIMPLEMENTABLE_CREATIVE_REQUIREMENT"); assert.equal(e?.inv, "CONTACT_NOT_DROPPED"); assert.match(e.reason, /GRIP with WRAP near\/far finger layers/);
  assert.doesNotThrow(() => A.compilePacket(base), "the unmodified packet still compiles");
  const mf = A.compilePacket(base).files["handoff/ART_AND_MOTION_MANIFEST_V2.json"], n = base.actions.reduce((s, a) => s + a.contact_events.length, 0); assert.equal(mf.actions.reduce((s, a) => s + a.contact_events.length, 0), n, "every directed contact reaches the manifest");
});

const scoped = (o = {}) => { const p = clone(base); p.scope = { kind: "PRODUCTION_PHASE", phase_id: "phase_1", parent_frames: [0, 1200], frames: [0, 600], qualification_frames: [100, 600], parent_source_sha256: p.source.script_sha256, excluded_shot_ids: ["sh_freeze", "sh_host"],
  outgoing_continuity: [{ frame: 599, owners: ["nova", "lever", "gear", "lumen"], obligation: "every live owner keeps its exact f599 pose, contact and expression into the successor phase's first frame (freeze)", consumer: "successor phase f600 freeze" }],
  approval_statement: "Approves ONLY frames [0,600) of the 1200-frame parent film; frames [600,1200) are NOT approved by this digest.", ...o }; return p; };
const scodes = (p) => V.validatePacket(p).errors.filter((e) => e.code === "PHASE_SCOPE_INVALID").map((e) => e.reason);
test("P07-P2 production phase packet: schema-valid, keeps every original id and the whole pre-roll, binds approval to the phase only", () => {
  const p = scoped(); assert.deepEqual(V.validatePacket(p).errors, []);
  assert.notEqual(V.packetDigest(p), V.packetDigest(base), "the scope is part of what the human signs");
  assert.deepEqual(p.actions.map((a) => a.id), base.actions.map((a) => a.id), "no action is rewritten or re-identified");
  const { files } = A.compilePacket(p), ps = files["creative/PHASE_SCOPE.json"]; assert.deepEqual(ps.approved_frames, [0, 600]); assert.deepEqual(ps.NOT_APPROVED_parent_frames, [600, 1200]); assert.equal(ps.outgoing_continuity_status, "OWED_TO_SUCCESSOR_PHASE");
  assert.ok(A.FIELD_MAP.scope, "the lossless field map states where scope goes");
  assert.equal(PF.creativePreflight(p).status, PF.creativePreflight(base).status, "the phase is preflighted on its own actions only");
  const film = path.join(W, "film"); fs.mkdirSync(film, { recursive: true }); const pf = path.join(src, "PHASE1.json"); fs.writeFileSync(pf, JSON.stringify(p, null, 1));
  const r = A.importPacket({ film, packetFile: pf, sourceDir: src }); assert.deepEqual(r.record.scope.frames, [0, 600]);
  const b = A.packetBundle(film, r.packet_sha256); assert.deepEqual(b.production_phase.approved_frames, [0, 600], "the receipt bundle the human signs states the phase"); assert.match(b.production_phase.approval_statement, /NOT approved/);
  // refusals: later phase start (no state inheritance yet), phase equal to the parent, qualification outside, parent source not attached, wrong continuity frame, vague approval statement
  assert.ok(scodes(scoped({ frames: [100, 600] })).some((x) => /must start at the parent film's f0/.test(x)));
  assert.ok(scodes(scoped({ parent_frames: [0, 600] })).some((x) => /not a strict part/.test(x)));
  assert.ok(scodes(scoped({ qualification_frames: [100, 700] })).some((x) => /qualification/.test(x)));
  assert.ok(scodes(scoped({ parent_source_sha256: "0".repeat(64) })).some((x) => /parent director\/screenplay source/.test(x)));
  assert.ok(scodes(scoped({ outgoing_continuity: [{ frame: 598, owners: ["nova"], obligation: "keeps the exact pose into the next phase", consumer: "next" }] })).some((x) => /last frame 599/.test(x)));
  assert.ok(scodes(scoped({ approval_statement: "Approves the opening." })).some((x) => /approval_statement/.test(x)));
});

// ---------- ten-pass pre-generation audit ----------
const design = J(path.join(REPO, "films", "hv2_film001", "art_designs", "ines_master.design.json")), WIT = Object.values(design.design_grounding)[0].witness;
const auditFilm = (diag) => { const d = path.join(W, diag ? "audit_diag" : "audit_prod"); fs.rmSync(d, { recursive: true, force: true }); fs.mkdirSync(path.join(d, "skill"), { recursive: true }); fs.mkdirSync(path.join(d, "art_designs"), { recursive: true }); fs.copyFileSync(path.join(REPO, "reference", "construct-kurzgesagt-art", "references", "QUESTION_NATIVE_WITNESS_MANIFEST.json"), path.join(d, "skill", "QUESTION_NATIVE_WITNESS_MANIFEST.json")); if (diag) fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "DIAGNOSTIC P07 audit fixture\n"); return d; };
/** a DIAGNOSTIC audit built from the design's own recorded decisions (it proves the gate mechanics; it is not an art review) */
function goodAudit(film, d = design) {
  const md = d.method_decisions, w = (obs) => ({ file: WIT, region_px: [0, 0, 64, 64], observation: obs });
  const passes = PA.DOMAINS.map((dom, i) => ({ domain: dom, question: `DIAGNOSTIC ${dom}: what must ${d.job_id} decide about ${dom.replace(/_/g, " ")} before its first image (pass ${i + 1})?`,
    findings: `DIAGNOSTIC finding ${i + 1} for ${d.job_id}: ${md[i % md.length].specific_decision ?? md[i % md.length].method_id} — recorded from the design's own decision, checked against the witness grammar for ${dom}.`,
    decisions: dom === "method_to_construction_mapping" ? md.map((m) => ({ decision: `${m.method_id} → ${m.visible_construction_operation ?? m.specific_decision ?? "construction operation recorded in the design"}`, method_ids: [m.method_id] })) : [{ decision: `DIAGNOSTIC decision ${i + 1}: ${md[(i + 3) % md.length].visible_construction_operation ?? md[(i + 3) % md.length].specific_decision} (${dom})`, method_ids: [md[(i + 3) % md.length].method_id], ...(["native_grammar_witnesses_originality", "anatomy_proportion_perspective", "color_material_edge_light", "face_expression_hands_identity_views", "world_depth_camera_light"].includes(dom) ? { witness: w(`DIAGNOSTIC observation ${i + 1}: the witness reads through one continuous outline for ${dom}`) } : {}) }],
    ...(dom === "emergent_gap_finder" ? { reopens: ["articulation_occlusion_alternate_art"] } : {}) }));
  return { schema_version: "1.0.0", job_id: d.job_id, design_sha256: bundleHash(d), witness_manifest_sha256: PA.witnessManifestSha(film), operator: "p07-diagnostic", skill_version_verified: "DIAGNOSTIC SKILL.md sha recorded by the operator", passes };
}
const inv = (r) => r.failures.map((e) => e.failed_invariant);
test("P07-A1 pre-generation audit: present, bound to the design revision and witnesses, ten distinct substantive domains; filler and stale audits are refused", { skip: !fs.existsSync(path.join(REPO, "reference", "construct-kurzgesagt-art", WIT)) && "native witness images are local-only (git-ignored)" }, () => {
  const film = auditFilm(false), good = goodAudit(film);
  assert.deepEqual(PA.validatePregenAudit({ audit: good, design, film }).failures.map((e) => e.human_readable_reason), []);
  assert.deepEqual(inv(PA.validatePregenAudit({ audit: null, design, film })), ["AUDIT_PRESENT"]);
  const d2 = clone(design); d2.canvas.view = "full figure three-quarter LEFT"; assert.ok(inv(PA.validatePregenAudit({ audit: good, design: d2, film })).includes("AUDIT_BOUND_TO_DESIGN_REVISION"), "stale: design changed after the audit");
  assert.ok(inv(PA.validatePregenAudit({ audit: { ...clone(good), job_id: "someone_else_master" }, design, film })).includes("AUDIT_FOR_THIS_JOB"), "wrong job");
  const filler = clone(good); filler.passes[3].findings = "n/a"; assert.ok(inv(PA.validatePregenAudit({ audit: filler, design, film })).includes("PASS_IS_SUBSTANTIVE"), "filler finding");
  const dup = clone(good); dup.passes[5].question = dup.passes[4].question; assert.ok(inv(PA.validatePregenAudit({ audit: dup, design, film })).includes("PASSES_ARE_DISTINCT"), "ten copies of one checklist line");
  const order = clone(good); [order.passes[0], order.passes[1]] = [order.passes[1], order.passes[0]]; assert.ok(inv(PA.validatePregenAudit({ audit: order, design, film })).includes("TEN_DISTINCT_DOMAINS_IN_ORDER"));
  const nine = clone(good); nine.passes.pop(); assert.ok(PA.validatePregenAudit({ audit: nine, design, film }).failures.some((e) => e.code === "PREGEN_AUDIT_INVALID"), "nine passes");
  const nowit = clone(good); for (const d of nowit.passes[2].decisions) delete d.witness; assert.ok(inv(PA.validatePregenAudit({ audit: nowit, design, film })).includes("GROUNDED_IN_WITNESS"));
  const unmapped = clone(good); unmapped.passes[8].decisions.pop(); assert.ok(inv(PA.validatePregenAudit({ audit: unmapped, design, film })).includes("EVERY_METHOD_MAPPED"));
  const nogap = clone(good); delete nogap.passes[9].reopens; assert.ok(inv(PA.validatePregenAudit({ audit: nogap, design, film })).includes("GAP_FINDER_REOPENS_OR_JUSTIFIES"));
  const fake = clone(good); fake.passes[1].decisions[0].witness.file = "assets/not_a_witness.jpg"; assert.ok(inv(PA.validatePregenAudit({ audit: fake, design, film })).includes("WITNESS_EXISTS"));
  // gate entry: production requires it; a diagnostic namespace reports that it was not required (never silent); derived states are exempt
  assert.equal(PA.pregenAuditStatus({ film, design, isMaster: true }).status, "AUDIT_MISSING");
  assert.equal(PA.pregenAuditStatus({ film: auditFilm(true), design, isMaster: true }).status, "NOT_REQUIRED_DIAGNOSTIC_NAMESPACE");
  assert.equal(PA.pregenAuditStatus({ film, design, isMaster: false }).status, "NOT_APPLICABLE_DERIVED_STATE");
  fs.writeFileSync(PA.auditFile(film, design.job_id), JSON.stringify(good)); const st = PA.pregenAuditStatus({ film, design, isMaster: true }); assert.equal(st.status, "AUDIT_RECORDED"); assert.match(st.sha256, /^[a-f0-9]{64}$/);
});

test("P07-A2 the real pre-generation gate carries the audit status and the design approval bundle binds the audit digest", async () => {
  const F = await import("./support_fixture.mjs"), { rt } = await F.film(), { jobs, doc } = await I.planJobs({ film: rt.film }), mj = jobs.find((j) => j.root_dependency === "tova_master");
  const g = C.gateForJob({ film: rt.film, doc, job: mj }); assert.equal(g.pregen_audit.status, "NOT_REQUIRED_DIAGNOSTIC_NAMESPACE", "diagnostic namespace: reported, not required");
  // the same film outside a diagnostic namespace: the master job is refused until its audit exists
  const prod = path.join(W, "prod_copy"); fs.rmSync(prod, { recursive: true, force: true }); fs.cpSync(rt.film, prod, { recursive: true }); fs.rmSync(path.join(prod, ".diagnostic_namespace"));
  const { jobs: j2, doc: d2 } = await I.planJobs({ film: prod }), g2 = C.gateForJob({ film: prod, doc: d2, job: j2.find((j) => j.root_dependency === "tova_master") });
  assert.equal(g2.pass, false); assert.ok(g2.failures.some((x) => x.code === "PREGEN_AUDIT_MISSING"), g2.failures.map((x) => x.code).join(","));
  const bundle = C.designBundle(J(path.join(prod, "art_designs", "tova_master.design.json")), { ...g2, pregen_audit: { status: "AUDIT_RECORDED", sha256: "a".repeat(64) } }); assert.equal(bundle.pregen_audit_sha256, "a".repeat(64), "the human design receipt covers the audit bytes");
});
