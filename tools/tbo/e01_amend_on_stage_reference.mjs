#!/usr/bin/env node
// E01 packet amendment 01 (2026-11-27): Mia's directed on-screen size is her HEAD height, not her figure height.
// Deterministic and reproducible. It changes exactly one identity's size statement plus the amendment's own source document entry, proves that
// nothing else changed, runs validate / preflight / hybrid-preflight on the result, and rebinds the hybrid contract to the new digest.
// It approves nothing: the amended packet is imported AWAITING_APPROVAL and needs a newly signed packet receipt.
//   node tools/tbo/e01_amend_on_stage_reference.mjs --film films/e01 --base <packet dir with RECONCILED/> --out <private amendment dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), BASE = path.resolve(arg("base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs");
const before = J(path.join(BASE, "RECONCILED", "CREATIVE_PACKET.json")), d0 = packetDigest(before), srcDir = path.join(FILM, "creative", "packets", d0, "source");
if (!fs.existsSync(srcDir)) throw new Error(`the approved packet ${d0} is not imported in ${FILM}`);
// the evidence, quoted from the APPROVED packet's own sources (hash-pinned)
const cite = (file, pattern) => { const t = fs.readFileSync(path.join(srcDir, file), "utf8"), lines = t.split(/\r?\n/), n = lines.findIndex((l) => pattern.test(l)); if (n < 0) throw new Error(`${file}: evidence ${pattern} not found`); return { file, sha256: sha(fs.readFileSync(path.join(srcDir, file))), line: n + 1, text: lines[n].trim().slice(0, 300) }; };
const ev = [cite("STORYBOARD_PHASE1_P3_2.md", /1\.45× schematic crop of prior 120px head produces ~174px/), cite("ART_REQUIREMENTS_PHASE1_P3_2.md", /Mia head 160–190px SH01 \(~174px previs\)/), cite("STORYBOARD_BOARD_INDEX_P3_2.csv", /locked tighter SH01, head ~174px/)];
const DOC = "AMENDMENT_01_ON_STAGE_REFERENCE.md", doc = [`# E01 packet amendment 01: CHAR_MIA on-screen size is a head height`, "", `Amends packet \`${d0}\` (approved). Engineering amendment prepared by Claude Code at the director's instruction; it takes effect only under a newly signed packet receipt.`, "",
  "## Defect", "`identities[CHAR_MIA].on_stage_height_px = 174` is read by the engine as the height of the WHOLE painted figure (registration scales the master so the painted extent is 174 px; the gate and detail budget treat the figure as 174 px tall). The approved sources state 174 px as Mia's SH01 HEAD height:", "",
  ...ev.map((e) => `- \`${e.file}\` line ${e.line} (sha256 ${e.sha256.slice(0, 16)}…): "${e.text}"`), "",
  "## Amendment", "- `on_stage_height_px`: `174` → `null`.", "- `on_stage_reference` (new): head height 174 px (directed range 160–190 px) in E01-S001-SH01, measured from the master's `head_top` to `chin` landmarks (both already required of MIA_MASTER).", "",
  "## Unchanged", "Everything else, including the 540 px native head requirement (2× SH03 max 270 px) and every other identity. CHAR_LEAD (174) and CHAR_REGULAR (265) have no source stating what those numbers measure; they are left as stated and raised as an open direction question rather than guessed.", ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true });
for (const f of fs.readdirSync(srcDir)) fs.copyFileSync(path.join(srcDir, f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), doc);
const after = structuredClone(before), mia = after.identities.find((i) => i.id === "CHAR_MIA");
mia.on_stage_height_px = null; mia.on_stage_reference = { measure: "head_height_px", px: 174, range_px: [160, 190], shot: "E01-S001-SH01", from_landmark: "head_top", to_landmark: "chin", source: `${DOC}; P3.2 storyboard, board index and art requirements: nominal 174 px head, target 160-190 px` };
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(doc) });
const d1 = packetDigest(after), bytes = JSON.stringify(after, null, 1) + "\n"; fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), bytes);
// prove the delta: revert exactly the amended fields and the new document → identical to the approved packet
const back = structuredClone(after), m2 = back.identities.find((i) => i.id === "CHAR_MIA"); m2.on_stage_height_px = 174; delete m2.on_stage_reference; back.source.documents = back.source.documents.filter((x) => x.file !== DOC);
const onlyDelta = JSON.stringify(back) === JSON.stringify(before);
const hyb = { ...J(path.join(BASE, "RECONCILED", "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(BASE, "private_audio_for_hybrid") });
const report = { amends: d0, digest: d1, file_sha256: sha(bytes), only_delta: onlyDelta ? "identities[CHAR_MIA].on_stage_height_px 174→null, identities[CHAR_MIA].on_stage_reference added, source.documents += amendment" : "UNEXPECTED_DIFFERENCE",
  evidence: ev, validate: { status: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}`) }, preflight: { status: PF.status, authority_pending: PF.authority_pending, feedback: PF.feedback.map((f) => `${f.code} ${f.record_id}`) }, hybrid: { status: HY.status, feasible: HY.hybrid_feasible }, hybrid_bound_to: d1 };
fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(report, null, 1) + "\n"); console.log(JSON.stringify(report, null, 1));
if (!onlyDelta || V.status !== "STRUCTURAL_VALID") process.exit(1);
