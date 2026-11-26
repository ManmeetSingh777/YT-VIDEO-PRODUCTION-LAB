// E01 creative-packet compilation handoff (private ZIP for Creative Production GPT). Everything machine-derived here is read from the live repository:
// the schema field reference and enums come from schemas/creative_packet_v1_1.schema.json, the validator rule list from the err("CODE", …) calls in
// the actual validators, the diagnostic example is built by the P05 packet fixture + the P07 scope test shape and VALIDATED by validatePacket()
// (and its hybrid companion by hybridPreflight()). Nothing is approved, signed, generated or submitted.
// Usage: node tools/tbo/e01_packet_handoff.mjs --out E:/TBO_PRIVATE/E01_CREATIVE_PACKET_COMPILATION_HANDOFF.zip   (export; reports success only after read-back verification)
//        node tools/tbo/e01_packet_handoff.mjs --verify FILE.zip                                                    (verify an existing archive)
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import os from "node:os"; import { execFileSync } from "node:child_process";
import { validatePacket, packetDigest } from "../../engine/story/creative_packet.mjs";
import { creativePreflight } from "../../engine/story/creative_preflight.mjs";
import { hybridPreflight } from "../../engine/story/hybrid_contract.mjs";
import { buildPacket } from "../../tests/p05/packet_fixture.mjs";
import { writeZip, verifyZip } from "./zip_archive.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OUT = path.resolve(arg("--out") || "E:/TBO_PRIVATE/E01_CREATIVE_PACKET_COMPILATION_HANDOFF.zip"), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
if (arg("--verify")) { const V = verifyZip(path.resolve(arg("--verify")), { required: ["MANIFEST.json"] }); console.log(JSON.stringify({ verify: V.ok ? "VERIFIED" : "FAILED", file: path.resolve(arg("--verify")), sha256: V.sha256, bytes: V.bytes, files: V.entries, manifest_listed: V.manifest_listed, errors: V.errors.slice(0, 20) })); process.exit(V.ok ? 0 : 5); }
const head = execFileSync("git", ["rev-parse", "HEAD"], { cwd: REPO, encoding: "utf8" }).trim(), dirty = execFileSync("git", ["status", "--porcelain", "--", "engine", "schemas", "tools/tbo", "docs/the-better-one/episodes/E01/P3_2_MEASURED"], { cwd: REPO, encoding: "utf8" }).trim();
if (dirty) { console.error("refusing: engine/schemas/tools/P3.2 sources have uncommitted changes; the handoff must name an exact source SHA\n" + dirty); process.exit(2); }
const STAGE = fs.mkdtempSync(path.join(os.tmpdir(), "e01-packet-handoff-")), put = (rel, data) => { const f = path.join(STAGE, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, data); };
const copy = (src, rel) => put(rel, fs.readFileSync(path.join(REPO, src)));

// 1. normative contracts and validators, byte copies from the repository at HEAD
const SCHEMAS = ["schemas/creative_packet_v1_1.schema.json", "schemas/contact_continuity_v1.schema.json", "schemas/prop_support_v1.schema.json", "schemas/performance_command_v1_1.schema.json", "schemas/motion_art_manifest_v2.schema.json"];
const VALIDATORS = ["engine/story/creative_packet.mjs", "engine/story/creative_preflight.mjs", "engine/story/hybrid_contract.mjs", "engine/story/creative_adapter.mjs", "engine/tools/creative_handoff.mjs"];
const P08 = ["engine/art_bridge/composition.mjs", "engine/film/composition_qa.mjs", "engine/art_bridge/contact_continuity.mjs", "engine/art_bridge/prop_support.mjs", "engine/art_bridge/pinch.mjs", "engine/art_bridge/speech_visemes.mjs", "engine/art_bridge/performance_commands.mjs", "engine/film/photo_intent.mjs", "engine/film/phase_boundary.mjs", "engine/film/phase_audio.mjs", "engine/art_bridge/temporal.mjs", "engine/host3d/host_pass.mjs"];
const EVIDENCE = ["engineering/p08/P08_ART_CONTRACT_DELTA.json", "engineering/p08/P08_ACTION_COVERAGE_P3_2.json", "engineering/p08/P08_REQUIREMENT_RESULTS.json", "engineering/p08/E01_SPEECH_PREFLIGHT_SUMMARY.json", "engineering/p08/P08_FINAL_REPORT.md"];
for (const f of SCHEMAS) copy(f, `02_SCHEMAS/${path.basename(f)}`); for (const f of VALIDATORS) copy(f, `03_VALIDATORS/${f}`); for (const f of P08) copy(f, `04_P08_CONTRACTS/${f}`); for (const f of EVIDENCE) copy(f, `05_P08_EVIDENCE/${path.basename(f)}`);
const P32 = "docs/the-better-one/episodes/E01/P3_2_MEASURED/original", p32files = fs.readdirSync(path.join(REPO, P32), { recursive: true }).map(String).filter((f) => fs.statSync(path.join(REPO, P32, f)).isFile());
for (const f of p32files) copy(path.join(P32, f), `06_P3_2_SOURCE/${f.split(path.sep).join("/")}`);
const V04 = "docs/the-better-one/episodes/E01/V0_4_DIR_P1/original"; for (const f of fs.readdirSync(path.join(REPO, V04))) copy(path.join(V04, f), `07_PARENT_V0_4_SOURCE/${f}`);
copy("inputs/EXPERIENCE_DIRECTOR_V1.md", "08_STANDARDS/EXPERIENCE_DIRECTOR_V1.md");

// 2. field reference generated from the schema (no hand-copied field list)
const S = JSON.parse(fs.readFileSync(path.join(REPO, SCHEMAS[0]), "utf8")), deref = (v) => (v?.$ref ? S.$defs[v.$ref.split("/").pop()] : v);
const typeOf = (v) => { v = deref(v) ?? {}; if (v.const !== undefined) return `const ${JSON.stringify(v.const)}`; if (v.enum) return `enum ${v.enum.join(" | ")}`; if (v.anyOf) return v.anyOf.map(typeOf).join(" or "); if (v.type === "array") return `array of ${typeOf(v.items)}${v.minItems ? ` (min ${v.minItems})` : ""}`; if (v.pattern) return `${v.type} /${v.pattern}/`; return Array.isArray(v.type) ? v.type.join("|") : v.type || (v.properties ? "object" : "any"); };
const lines = [`# CREATIVE_PACKET v1.1.0 — field reference (generated from ${SCHEMAS[0]} @ ${head.slice(0, 12)}, sha256 ${fsha(path.join(REPO, SCHEMAS[0]))})`, "", "Every object has additionalProperties:false: a field not listed here is a schema error. Required fields are marked **R**.", ""];
const walk = (name, v, depth) => { v = deref(v); const o = v?.type === "array" ? deref(v.items) : v; if (!o?.properties) return; lines.push(`${"#".repeat(Math.min(6, depth + 2))} ${name}`); const req = new Set(o.required || []);
  for (const [k, p] of Object.entries(o.properties)) lines.push(`- \`${k}\`${req.has(k) ? " **R**" : ""} — ${typeOf(p)}${deref(p)?.description ? ` — ${deref(p).description}` : ""}`); lines.push("");
  for (const [k, p] of Object.entries(o.properties)) walk(`${name}.${k}`, p, depth + 1); };
for (const [k, v] of Object.entries(S.properties)) walk(k, v, 0); for (const [k, v] of Object.entries(S.$defs)) walk(`$defs.${k}`, v, 0);
put("01_READ_FIRST/FIELD_REFERENCE_v1_1.md", lines.join("\n") + "\n");

// 3. validator rule list generated from the actual err()/bad()/push() codes in the validators
const rules = []; for (const f of ["engine/story/creative_packet.mjs", "engine/story/creative_preflight.mjs", "engine/story/hybrid_contract.mjs"]) { const src = fs.readFileSync(path.join(REPO, f), "utf8"); for (const m of src.matchAll(/(?:err|bad|add|no)\(\s*"([A-Z][A-Z0-9_]{3,})"/g)) rules.push([f, m[1]]); for (const m of src.matchAll(/failed_invariant:\s*"([A-Z][A-Z0-9_]{3,})"/g)) rules.push([f, m[1]]); }
const byFile = {}; for (const [f, c] of rules) (byFile[f] ||= new Set()).add(c);
put("01_READ_FIRST/VALIDATOR_RULE_CODES.md", `# Rule codes raised by the actual validators @ ${head.slice(0, 12)} (extracted from source; read the code in 03_VALIDATORS for the exact condition)\n\n` + Object.entries(byFile).map(([f, s]) => `## ${f}\n${[...s].sort().map((c) => `- ${c}`).join("\n")}`).join("\n\n") + "\n");

// 4. DIAGNOSTIC example: the P05 fixture packet + the P07 scoped-phase shape, validated here (never target art, never E01 content)
const ex = path.join(STAGE, "09_DIAGNOSTIC_EXAMPLE", "sources"), base = buildPacket(ex), p = JSON.parse(JSON.stringify(base));
p.scope = { kind: "PRODUCTION_PHASE", phase_id: "phase_1", parent_frames: [0, 1200], frames: [0, 600], qualification_frames: [100, 600], parent_source_sha256: p.source.script_sha256, excluded_shot_ids: [],
  outgoing_continuity: [{ frame: 599, owners: ["nova", "lever", "gear", "lumen"], obligation: "every live owner keeps its exact f599 pose, contact and expression into the successor phase's first frame (freeze)", consumer: "successor phase f600 freeze" }],
  approval_statement: "Approves ONLY frames [0,600) of the 1200-frame parent film; frames [600,1200) are NOT approved by this digest." };
const v = validatePacket(p); if (v.status !== "STRUCTURAL_VALID") { console.error("diagnostic example is not valid:", JSON.stringify(v.errors.slice(0, 8))); process.exit(3); }
const pre = creativePreflight(p, {}), hyb = { version: "1.0.0", film_id: p.film_id, packet_sha256: packetDigest(p), claims: [], decoders: [], hosts: [],
  dialogue: [{ line_id: "l1", speaker: "nova", text: "Wait. Why is the money going down?", frames: [30, 110], audio_file: null, audio_sha256: null, alignment_file: "l1.timing.json", mouth_scheme: "VISEME", limited_mouth_approved: false }] }, hv = hybridPreflight(p, hyb, { sourceDir: ex });
put("09_DIAGNOSTIC_EXAMPLE/DIAGNOSTIC_EXAMPLE_PACKET.json", JSON.stringify(p, null, 1) + "\n"); put("09_DIAGNOSTIC_EXAMPLE/DIAGNOSTIC_EXAMPLE_HYBRID_CONTRACT.json", JSON.stringify(hyb, null, 1) + "\n");
put("09_DIAGNOSTIC_EXAMPLE/VALIDATION_RESULT.json", JSON.stringify({ packet: { status: v.status, errors: v.errors, counts: v.counts, packet_sha256: packetDigest(p) }, preflight: { status: pre.status, feedback_count: pre.feedback?.length ?? null, feedback_sample: (pre.feedback || []).slice(0, 12) }, hybrid: { status: hv.status, hybrid_feasible: hv.hybrid_feasible, authority_pending: hv.authority_pending, feedback: hv.feedback } }, null, 1) + "\n");
for (const f of fs.readdirSync(ex)) if (/\.(png|svg)$/.test(f)) fs.rmSync(path.join(ex, f)); // the fixture's synthetic drawings are not shipped (never target art); the sources dir keeps the script

// 5. source hashes + the authored instructions (kept in the repository so they are versioned and reviewable)
const H = (rel) => ({ file: rel, sha256: fsha(path.join(REPO, rel)) });
const hashes = { generated_at_source_sha: head, phase: { scope: [0, 960], qualification: [180, 960], parent: [0, 1950], fps: 60, resolution: [1920, 1080] },
  packet_source_fields: { "source.direction_spec": H("inputs/EXPERIENCE_DIRECTOR_V1.md"), "source.art_skill (construct-kurzgesagt-art)": H("reference/construct-kurzgesagt-art/SKILL.md"), "scope.parent_source_sha256 (parent V0.4 director, must also be attached in source.documents)": H(`${V04}/E01_EXPERIENCE_DIRECTOR_V0_4_P1.md`), "parent screenplay": H(`${V04}/E01_OPENING_SCREENPLAY_V0_4_P1.md`) },
  p3_2_phase_sources: Object.fromEntries(["E01_EXPERIENCE_DIRECTOR_PHASE1_P3.md", "E01_ACTION_PLAN_PHASE1_P3.csv", "E01_SHOT_TIMELINE_PHASE1_P3.csv", "E01_AUDIO_CUE_PLAN_PHASE1_P3.csv", "E01_CONTINUITY_PHASE1_P3.csv", "PERFORMANCE_STATES_P3_2.csv", "ART_REQUIREMENTS_PHASE1_P3_2.md", "STORYBOARD_PHASE1_P3_2.md", "STORYBOARD_BOARD_INDEX_P3_2.csv", "DELTA_MANIFEST_P3_2.json", "E01_TAKE_SELECTIONS_P3.json", "AUDIO_APPROVAL_RECORD_P3_1.json", "PHONEME_ART_DEMANDS_PENDING_P08.json", "PHASE1_DIALOGUE.srt", "PHASE1_DIALOGUE.vtt", "PHASE1_SDH.srt", "PHASE1_SDH.vtt"].map((f) => [f, fsha(path.join(REPO, P32, f))])),
  p3_2_package_zip_sha256: "ecd054815e4610805fe6861b6020554fef6d6f40c72c893b84e3a3382a0eeffc",
  private_audio_not_in_this_zip: "selected masters, stems and MFA phone timings stay in E:/TBO_PRIVATE (P3.2 package); the packet names them by file + sha256 from that package's source_audio/SHA256SUMS.txt" };
put("01_READ_FIRST/SOURCE_HASHES.json", JSON.stringify(hashes, null, 1) + "\n");
copy("engineering/e01_packet/GPT_PACKET_COMPILATION_INSTRUCTIONS.md", "01_READ_FIRST/GPT_PACKET_COMPILATION_INSTRUCTIONS.md");
copy("engineering/e01_packet/P08_CONTRACT_ROUTING.md", "01_READ_FIRST/P08_CONTRACT_ROUTING.md");
const all = fs.readdirSync(STAGE, { recursive: true }).map(String).filter((f) => fs.statSync(path.join(STAGE, f)).isFile()).map((f) => f.split(path.sep).join("/")).sort();
put("MANIFEST.json", JSON.stringify({ kind: "E01_CREATIVE_PACKET_COMPILATION_HANDOFF", engine_source_sha: head, status: "DIAGNOSTIC EXAMPLE ONLY; no approval, receipt, artwork or signature inside", files: all.map((f) => ({ file: f, sha256: fsha(path.join(STAGE, f)) })) }, null, 1) + "\n");
fs.mkdirSync(path.dirname(OUT), { recursive: true }); if (fs.existsSync(OUT)) { console.error(`refusing to overwrite ${OUT}`); process.exit(4); }
// standard ZIP (clean relative names, DEFLATE), written to a temporary file and moved to OUT only after an independent read-back verification:
// every entry inflates with its CRC-32, nothing is empty or a directory entry, the entry count is exact, and every MANIFEST.json hash matches.
const TMP_OUT = `${OUT}.partial-${process.pid}`; writeZip(TMP_OUT, all.concat("MANIFEST.json").map((name) => ({ name, data: fs.readFileSync(path.join(STAGE, name)) })));
const V = verifyZip(TMP_OUT, { expectFiles: all.length + 1, required: ["MANIFEST.json", "01_READ_FIRST/GPT_PACKET_COMPILATION_INSTRUCTIONS.md", "01_READ_FIRST/SOURCE_HASHES.json", "02_SCHEMAS/creative_packet_v1_1.schema.json", "09_DIAGNOSTIC_EXAMPLE/DIAGNOSTIC_EXAMPLE_PACKET.json"] });
if (!V.ok) { fs.rmSync(TMP_OUT, { force: true }); console.error(JSON.stringify({ export: "FAILED_VERIFICATION", errors: V.errors.slice(0, 20) })); process.exit(5); }
fs.renameSync(TMP_OUT, OUT); const V2 = verifyZip(OUT, { expectFiles: all.length + 1 }); if (!V2.ok || V2.sha256 !== V.sha256) { console.error(JSON.stringify({ export: "FAILED_AFTER_MOVE", errors: V2.errors })); process.exit(6); }
console.log(JSON.stringify({ export: "VERIFIED", out: OUT, sha256: V2.sha256, bytes: V2.bytes, files: V2.entries, manifest_listed: V2.manifest_listed, engine_source_sha: head, example: v.status, hybrid_example: hv.status }));
