#!/usr/bin/env node
// E01 phase-1 ARTWORK-DESIGN handoff for the Artwork GPT (private ZIP). Built only from the reconciled packet (digest ceba6901…), the live engine
// (compilePacket → planJobs → gateForJob/motionFacts/requiredFigureHeightPx) and byte copies of the sources. It approves nothing, generates nothing,
// and ships no witness pixels, keys or audio.
//   node tools/tbo/e01_art_design_handoff.mjs --packet-dir E:/TBO_PRIVATE/E01_PHASE1_CREATIVE_PACKET_20261127
//        --designs E:/TBO_PRIVATE/E01_UNSIGNED_DESIGN_PREPARATION_V1 --scratch DIR --out E:/TBO_PRIVATE/E01_ARTWORK_DESIGN_HANDOFF_V1.zip
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const PD = path.resolve(arg("packet-dir")), DES = path.resolve(arg("designs")), SCR = path.resolve(arg("scratch")), OUT = path.resolve(arg("out"));
const { compilePacket } = await imp("engine/story/creative_adapter.mjs"), { packetDigest } = await imp("engine/story/creative_packet.mjs"), { planJobs } = await imp("engine/art_bridge/art_intake.mjs");
const AC = await imp("engine/art_bridge/art_contract.mjs"), { writeZip, verifyZip } = await imp("tools/tbo/zip_archive.mjs");
const p = J(path.join(PD, "RECONCILED", "CREATIVE_PACKET.json")), digest = packetDigest(p);
// scratch compile + job plan (PREVIEW: no approval exists)
const PV = path.join(SCR, "e01_handoff_film"); fs.rmSync(PV, { recursive: true, force: true }); fs.cpSync(path.join(REPO, "films", "e01"), PV, { recursive: true });
const { files } = compilePacket(p); for (const [rel, o] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(PV, rel)), { recursive: true }); fs.writeFileSync(path.join(PV, rel), JSON.stringify(o, null, 1)); }
const PJ = await planJobs({ film: PV }), doc = PJ.doc, plan = J(path.join(PV, "handoff", "ART_DEPENDENCY_PLAN.json"));
const DRAFT = { MIA_MASTER: "MIA_MASTER", REGULAR_MASTER: "REGULAR_MASTER", LEAD_MASTER: "LEAD_MASTER", "ART_ENV01.MASTER": "ENV_RESTAURANT_SH01" };
fs.mkdirSync(path.join(PV, "art_designs"), { recursive: true });
for (const [m, src] of Object.entries(DRAFT)) { fs.copyFileSync(path.join(DES, `${src}.design.json`), path.join(PV, "art_designs", `${m}.design.json`)); fs.copyFileSync(path.join(DES, `${src}.pregen_audit.json`), path.join(PV, "art_designs", `${m}.pregen_audit.json`)); }
const entries = [], add = (name, data) => entries.push({ name, data: Buffer.isBuffer(data) ? data : Buffer.from(typeof data === "string" ? data : JSON.stringify(data, null, 1) + "\n") });
// per-master contract: everything the design gate will demand, from the engine itself
const masters = PJ.jobs.filter((j) => j.state_kind === "MASTER"), contracts = {};
for (const j of masters) { const id = j.root_dependency, ident = doc.identities.find((i) => i.id === j.identity_id), rig = doc.rigs.find((r) => r.identity_id === ident.id), pi = p.identities.find((i) => i.id === ident.id);
  let facts = null, fig = null, gate = null; try { facts = AC.motionFacts({ job: j, doc }); } catch (e) { facts = { error: e.message }; } try { fig = AC.requiredFigureHeightPx({ job: j, doc }); } catch (e) { fig = { error: e.message }; }
  try { const { applicability_table, ...g } = AC.gateForJob({ film: PV, doc, job: j }); gate = g; } catch (e) { gate = { status: "NO_DESIGN", reason: e.human_readable_reason || e.message, code: e.code }; }
  const derived = PJ.jobs.filter((x) => x.derived_from === id || plan.assets.find((a) => a.asset_id === x.root_dependency)?.derived_from === id);
  contracts[id] = { master: id, artjob_id: j.artjob_id, identity: ident.id, kind: pi.kind, existing_draft: DRAFT[id] ? `designs/${DRAFT[id]}.design.json (rename job_id to ${id})` : null,
    views: pi.views, on_stage_height_px_nominal: pi.on_stage_height_px, required_figure_height_px: fig, palette_roles: pi.palette_roles, method_ids_named_by_packet: pi.method_ids,
    rig: rig ? { id: rig.id, root: rig.root_part, joints: rig.joints.map((x) => ({ id: x.id, parent: x.parent_id, landmark: x.landmark_id, limits_deg_PLANNING_ENVELOPE_NOT_ANATOMY: x.rotation_limits_deg })), sockets: rig.sockets.map((s) => ({ id: s.id, joint: s.joint_id })), state_channels: (rig.state_channels || []).map((c) => ({ id: c.id, states: c.states.map((s) => s.id) })), pose_states: rig.pose_states.map((s) => s.id), view_states: rig.view_states.map((s) => s.id), allowed_state_edges: (rig.allowed_state_edges || []).map((e) => `${e.from}->${e.to} ${e.mode}`) } : null,
    acting: pi.acting ?? null, motion_facts: facts, job_motion_context: j.motion_context, registration_contract: j.registration_contract, triggered_by_actions: [...new Set((j.triggered_by || []).map((t) => t.record_id).filter((r) => /^E01-S001-A/.test(r)))],
    dependents: { count: derived.length, by_state_kind: derived.reduce((m, x) => ((m[x.state_kind] = (m[x.state_kind] || 0) + 1), m), {}), assets: derived.map((x) => x.root_dependency) }, design_gate: gate, required_methods: gate?.required_methods?.map((m) => `${m.method} (${m.role}, ${m.phase}): ${m.reason}`) ?? null };
  add(`03_MASTER_CONTRACTS/${id}.contract.json`, contracts[id]); }
// sources (byte copies)
for (const f of fs.readdirSync(DES)) add(`01_EXISTING_UNSIGNED_DESIGNS/${f}`, fs.readFileSync(path.join(DES, f)));
add("02_DESIGN_GATE/DESIGN_GATE_PREVIEW.json", fs.readFileSync(path.join(REPO, "engineering/e01_packet/reconciliation/DESIGN_GATE_PREVIEW.json")));
for (const f of ["engine/art_bridge/art_contract.mjs", "engine/art_bridge/art_families.mjs", "engine/art_bridge/pregen_audit.mjs", "engine/art_bridge/art_requests.mjs", "schemas/pregen_audit_v1.schema.json"]) add(`04_SCHEMAS_AND_VALIDATORS/${f}`, fs.readFileSync(path.join(REPO, f)));
add("04_SCHEMAS_AND_VALIDATORS/EXAMPLE_ines_master.design.json", fs.readFileSync("E:/TBO_PRIVATE/E01_GPT_ART_DESIGN_PREPARATION_ONLY_V1/design_schema/EXAMPLE_ines_master.design.json"));
add("05_ARTJOB_DAG/ARTJOB_DAG_PREVIEW.json", fs.readFileSync(path.join(REPO, "engineering/e01_packet/reconciliation/ARTJOB_DAG_PREVIEW.json")));
add("05_ARTJOB_DAG/ART_DEPENDENCY_PLAN.json", fs.readFileSync(path.join(PV, "handoff", "ART_DEPENDENCY_PLAN.json")));
add("05_ARTJOB_DAG/DESIGN_REQUESTS.json", fs.readFileSync(path.join(PV, "art_designs", "DESIGN_REQUESTS.json")));
add("06_CREATIVE_DIRECTION/CREATIVE_PACKET_ceba6901.json", fs.readFileSync(path.join(PD, "RECONCILED", "CREATIVE_PACKET.json")));
for (const f of ["E01_EXPERIENCE_DIRECTOR_PHASE1_P3.md", "STORYBOARD_PHASE1_P3_2.md", "STORYBOARD_BOARD_INDEX_P3_2.csv", "PERFORMANCE_STATES_P3_2.csv", "ART_REQUIREMENTS_PHASE1_P3_2.md", "E01_CONTINUITY_PHASE1_P3.csv", "E01_ACTION_PLAN_PHASE1_P3.csv", "E01_SHOT_TIMELINE_PHASE1_P3.csv", "P08_ART_CONTRACT_DELTA.json", "PHONEME_ART_DEMANDS_PENDING_P08.json", "P08_MOTION_RECONCILIATION_SOURCE.json", "CAPTION_CORRECTION.md", "E01_OPENING_SCREENPLAY_V0_4_P1.md"]) add(`06_CREATIVE_DIRECTION/${f}`, fs.readFileSync(path.join(PD, "sources", f)));
for (const f of fs.readdirSync(path.join(PD, "sources", "PREVIS_ONLY")).filter((x) => /\.svg$/i.test(x))) add(`06_CREATIVE_DIRECTION/storyboard_PREVIS_ONLY/${f}`, fs.readFileSync(path.join(PD, "sources", "PREVIS_ONLY", f)));
// skill: text only (witness pixels are NOT redistributed; use the private skill archive the Artwork GPT already holds, verified by these hashes)
const SK = path.join(REPO, "reference", "construct-kurzgesagt-art"), skillHashes = [];
const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const f = path.join(d, e.name); if (e.isDirectory()) walk(f); else { const rel = path.relative(SK, f).split(path.sep).join("/"), b = fs.readFileSync(f); skillHashes.push({ file: rel, sha256: sha(b), bytes: b.length }); if (!/\.(png|jpe?g|webp|npz)$/i.test(e.name)) add(`07_SKILL_F01_F80_TEXT/${rel}`, b); } } };
walk(SK); add("07_SKILL_F01_F80_TEXT/SKILL_FILE_HASHES_INCLUDING_WITNESSES.json", { note: "every skill file incl. native witness pixels; pixels are not in this ZIP", files: skillHashes });
const ORDER = ["MIA_MASTER", "ART_P01.MASTER", "ART_P02.MASTER", "REGULAR_MASTER", "ART_P03.MASTER", "LEAD_MASTER", "ART_ENV01.MASTER", "ART_BG01.BG_DINER_A.MASTER", "ART_BG01.BG_DINER_B.MASTER", "ART_BG01.BG_OCCUPANCY.MASTER", "ART_BG02.BG_QUEUE.MASTER"];
const line = (m) => { const c = contracts[m], g = c.design_gate; return `| ${m} | ${c.artjob_id} | ${c.existing_draft ? "correct existing draft" : "**new design**"} | ${g?.status ?? "?"}${g?.failures ? ` (${g.failures.length})` : ""} | ${c.dependents.count} |`; };
add("00_READ_FIRST.md", `# E01 phase 1 — artwork design handoff for the Artwork GPT (V1, ${new Date().toISOString().slice(0, 10)})

**Status:** DESIGN PREPARATION. Nothing in this archive is approved, signed or generated, and no image may be generated from it until the design gate PASSES and a
human design receipt exists. Packet digest \`${digest}\` (structurally valid, pre-art feasible, human approval pending).

## Order of work: Mia first
MIA_MASTER is an independent ArtJob. Its export needs only the packet, story and direction receipts plus **its own** design receipt; it does not wait for the other ten
masters. Each derived job unlocks only after its own master is approved.

| Master | ArtJob | Work | Gate now | Dependents |
|---|---|---|---|---|
${ORDER.map(line).join("\n")}

## What to deliver per master
1. \`art_designs/<MASTER>.design.json\`, \`job_id\` exactly the master id. The existing \`ENV_RESTAURANT_SH01\` becomes \`ART_ENV01.MASTER\`.
2. \`art_designs/<MASTER>.pregen_audit.json\`: ten subject-specific passes with distinct findings, bound to the native witness manifest in use
   (\`skill/QUESTION_NATIVE_WITNESS_MANIFEST.json\`; see \`04_SCHEMAS_AND_VALIDATORS/schemas/pregen_audit_v1.schema.json\` and \`pregen_audit.mjs\`).

## Correcting the four existing drafts (\`02_DESIGN_GATE\`, \`03_MASTER_CONTRACTS\`)
Fix every listed refusal from the contract, not from prose:
- **view_id:** use the formal value (\`contract.views\` / \`motion_facts\`); the drafts give prose only.
- **authored size:** the figure height must cover \`required_figure_height_px\` at the 2× native factor.
- **canonical pose:** use the rig rest state (\`contract.rig.pose_states\`).
- **attachment semantics:** cover every joint in \`contract.rig.joints\`.
- **contact semantics:** cover every socket in \`contract.rig.sockets\`.
- **state family:** include every pose, view and channel state the action graph shows.
- **audit:** distinct findings in each pass (the drafts repeat findings across passes) and the witness-manifest binding.
- **environment:** additionally needs \`motion_representation\`, the \`room\` view, the \`base\` state, counter-support contact semantics, the authored pixel size,
  \`canonical_coverage_rect\` covering the overscan, and proof projection/planes.

## Preparing the seven missing designs (award, report, phone, four background people)
- Author them from the F01–F80 skill (\`07_SKILL_F01_F80_TEXT\`), following the source method for each subject family.
- Use the required methods listed in each contract and \`04_SCHEMAS_AND_VALIDATORS/EXAMPLE_ines_master.design.json\` for structure.
- The props need near/far grip topology matching the hand drawings (report: lower-right lead edge and lower-left Mia edge; award: both grips plus the base).
- **Report copy:** YESTERDAY / Sales $3,210 / Operating result −$120 / LOSS (model values, never a cash balance).
- **Phone:** the lens and shutter control must be separable from the support grip.

## Hard rules
- Joint limits and root positions in the contracts are **planning envelopes, not anatomy**; never draw to them as measured geometry.
- No invented landmarks or coordinates.
- Witness pixels are not in this ZIP. Use your private skill archive and verify it against \`SKILL_FILE_HASHES_INCLUDING_WITNESSES.json\`.
- Generic rounded silhouettes, tube limbs, template faces and default shading are refused by the gate.
- Return designs and audits only; Claude runs \`art_outbox check-design\` on the real film and reports the exact refusals until PASS.
`);
const man = entries.map((e) => ({ file: e.name, sha256: sha(e.data), bytes: e.data.length })); add("MANIFEST.json", { packet_sha256: digest, files: man });
const TMP = `${OUT}.tmp`; writeZip(TMP, entries); const v = verifyZip(TMP, { expectFiles: entries.length, required: ["00_READ_FIRST.md", "MANIFEST.json"] });
if (!v.ok) { console.log(JSON.stringify({ export: "FAILED_VERIFICATION", errors: v.errors.slice(0, 10) })); process.exit(5); }
fs.renameSync(TMP, OUT); const v2 = verifyZip(OUT, { expectFiles: entries.length }); console.log(JSON.stringify({ export: v2.ok ? "VERIFIED" : "FAILED", out: OUT, files: v2.entries, bytes: v2.bytes, sha256: v2.sha256, masters: Object.fromEntries(Object.entries(contracts).map(([k, c]) => [k, `${c.design_gate?.status} deps ${c.dependents.count}`])) }, null, 1));
