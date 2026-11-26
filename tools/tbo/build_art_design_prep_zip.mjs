// Builds the PRIVATE E01 art design-preparation ZIP for a new ChatGPT art chat. It is DESIGN PREPARATION ONLY, not a sealed ArtJob: it carries
// the current proposed creative sources, the operating standard, the locally installed F01–F80 skill INCLUDING its native witness images (private
// use; never committed or published), the engine's design/audit structures, the provisional motion needs and the open decisions.
// Usage: node tools/tbo/build_art_design_prep_zip.mjs --out E:/TBO_PRIVATE   (the output folder must be OUTSIDE every git checkout)
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), OUTROOT = path.resolve(process.argv[process.argv.indexOf("--out") + 1] || "E:/TBO_PRIVATE");
const inGit = (d) => { try { execFileSync("git", ["-C", d, "rev-parse", "--is-inside-work-tree"], { stdio: "pipe" }); return true; } catch { return false; } };
fs.mkdirSync(OUTROOT, { recursive: true }); if (inGit(OUTROOT)) throw new Error(`${OUTROOT} is inside a git work tree: the private bundle (licensed witnesses) must live outside every repository`);
const NAME = "E01_GPT_ART_DESIGN_PREPARATION_ONLY_V1", STAGE = path.join(OUTROOT, NAME); fs.rmSync(STAGE, { recursive: true, force: true });
const files = {}, sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const put = (rel, src) => { const d = path.join(STAGE, rel); fs.mkdirSync(path.dirname(d), { recursive: true }); fs.copyFileSync(src, d); files[rel] = sha(fs.readFileSync(d)); };
const putDir = (rel, src) => { for (const e of fs.readdirSync(src, { withFileTypes: true })) { if (e.name === "__pycache__" || e.name.endsWith(".pyc")) continue; const s = path.join(src, e.name); e.isDirectory() ? putDir(path.join(rel, e.name), s) : put(path.join(rel, e.name), s); } };
const R = (...p) => path.join(REPO, ...p), V04 = R("docs", "the-better-one", "episodes", "E01", "V0_4_DIR_P1", "original"), E = R("engineering", "e01_v04");
put("GPT_ART_NEXT_ACTION.md", path.join(E, "GPT_ART_NEXT_ACTION.md"));
for (const f of ["E01_OPENING_SCREENPLAY_V0_4_P1.md", "E01_EXPERIENCE_DIRECTOR_V0_4_P1.md", "E01_ART_REQUIREMENTS_V0_4_P1.md", "E01_ACTION_PLAN_V0_4_P1.csv", "E01_SHOT_TIMELINE_V0_4_P1.csv", "E01_CONTINUITY_CHECKPOINTS_V0_4_P1.csv", "E01_AUDIO_CUE_PLAN_V0_4_P1.csv", "DELTA_MANIFEST.json"]) put(path.join("creative_V0_4_DIR_P1_PROPOSED", f), path.join(V04, f));
put("standards/ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md", R("docs", "the-better-one", "ART_TO_FINISHED_FILM_OPERATING_STANDARD_V1.md"));
put("standards/NEW_F01_F80_ART_OPERATOR_CHAT_V1.md", R("docs", "the-better-one", "NEW_F01_F80_ART_OPERATOR_CHAT_V1.md"));
putDir("skill/construct-kurzgesagt-art", R("reference", "construct-kurzgesagt-art"));
put("design_schema/EXAMPLE_ines_master.design.json", R("films", "hv2_film001", "art_designs", "ines_master.design.json"));
put("design_schema/pregen_audit_v1.schema.json", R("schemas", "pregen_audit_v1.schema.json"));
put("motion_needs/PROVISIONAL_PREFLIGHT_TABLES.md", path.join(E, "PROVISIONAL_PREFLIGHT_TABLES.md"));
put("decisions/E01_DIRECTOR_DECISION_SHEET.md", path.join(E, "decisions", "E01_DIRECTOR_DECISION_SHEET.md"));
for (const f of fs.readdirSync(path.join(E, "decisions", "previs"))) put(path.join("decisions", "previs", f), path.join(E, "decisions", "previs", f));
const head = execFileSync("git", ["-C", REPO, "rev-parse", "HEAD"]).toString().trim();
const readme = `# ${NAME}\n\n**DESIGN PREPARATION ONLY — NOT A SEALED ARTJOB, NOT AN APPROVAL.** Private to the user: it contains the locally installed F01–F80 skill and its\nnative witness images for use inside the user's own ChatGPT art conversation. Do not publish or commit it.\n\nWhat to do: open a new ChatGPT art chat, attach this ZIP, paste GPT_ART_NEXT_ACTION.md, verify the skill/witnesses open, then draft the four master\ndesign proposals and their ten-pass pre-generation audits. Return the JSON files to Claude unsigned. No final images.\n\nStatus of the creative sources: V0.4-DIR-P1 is PROPOSED (not user-approved). Decisions D1–D6 are open (decisions/). Engine source: ${head}.\n`;
fs.writeFileSync(path.join(STAGE, "00_README_DESIGN_PREPARATION_ONLY.md"), readme); files["00_README_DESIGN_PREPARATION_ONLY.md"] = sha(readme);
const man = { kind: "E01_ART_DESIGN_PREPARATION_ONLY", sealed_artjob: false, approval: "NONE", private: true, contains_licensed_witnesses: true, engine_source_head: head, created_utc: new Date().toISOString(), files };
fs.writeFileSync(path.join(STAGE, "MANIFEST.json"), JSON.stringify(man, null, 1));
const zip = path.join(OUTROOT, `${NAME}.zip`); fs.rmSync(zip, { force: true });
execFileSync("powershell", ["-NoProfile", "-Command", `Compress-Archive -Path '${STAGE}\\*' -DestinationPath '${zip}' -Force`], { stdio: "pipe" });
console.log(JSON.stringify({ zip, bytes: fs.statSync(zip).size, sha256: sha(fs.readFileSync(zip)), files: Object.keys(files).length, witness_images: Object.keys(files).filter((f) => /\.(jpg|png|jpeg)$/i.test(f)).length }, null, 1));
