#!/usr/bin/env node
// E01 packet amendment 02 (2026-11-27): one anatomical head-scale convention for MIA, LEAD and REGULAR (Creative Production GPT resolution, relayed
// by the director). Deterministic: starts from the ACTIVE approved packet, changes exactly the three characters' on-screen size statements, the
// measurement landmark their masters must carry, and its own source document; proves nothing else changed; validate / preflight / hybrid-preflight;
// rebinds the hybrid contract. It approves nothing.
//   node tools/tbo/e01_amend_02_head_scale.mjs --film films/e01 --hybrid-base <dir with HYBRID_CONTRACT.json + private_audio_for_hybrid> --out <private dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel)));
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), HB = path.resolve(arg("hybrid-base")), OUT = path.resolve(arg("out"));
const { validatePacket, packetDigest } = await imp("engine/story/creative_packet.mjs"), { creativePreflight } = await imp("engine/story/creative_preflight.mjs"), { hybridPreflight } = await imp("engine/story/hybrid_contract.mjs");
const active = J(path.join(FILM, "creative", "CURRENT.json")).packet_sha256, pdir = path.join(FILM, "creative", "packets", active), before = J(path.join(pdir, "CREATIVE_PACKET.json"));
if (packetDigest(before) !== active) throw new Error("active packet file does not match its digest");
const CONV = "cranial crown (excluding additional hairstyle volume) to the lowest anatomical chin point; vertical projected separation in the upright reference pose, before occlusion";
const DOC = "AMENDMENT_02_HEAD_SCALE_CONVENTION.md", SH = (n) => `E01-S001-SH0${n}`;
const REF = {
  CHAR_MIA: { px: 174, range_px: [160, 190], projections: [{ shot: SH(3), visibility: "VISIBLE", px: 250, range_px: [230, 270] }], native_min_px: 540 },
  CHAR_LEAD: { px: 174, projections: [{ shot: SH(2), visibility: "OFFSCREEN" }, { shot: SH(3), visibility: "OFFSCREEN" }], native_min_px: 348 },
  CHAR_REGULAR: { px: 174, projections: [{ shot: SH(2), visibility: "OFFSCREEN" }, { shot: SH(3), visibility: "VISIBLE", px: 265 }], native_min_px: 530 } };
const doc = [`# E01 packet amendment 02: one anatomical head-scale convention (MIA, LEAD, REGULAR)`, "", `Amends the active approved packet \`${active}\`. Prepared by Claude Code from Creative Production GPT's resolution, relayed by the director on 2026-11-27. Takes effect only under a newly signed packet receipt.`, "",
  "## Convention (applies to every on-screen head size below)", `Head height = ${CONV}. Measured from the master landmarks \`cranium_top\` (new: the cranial crown, NOT the top of the hair) to \`chin\`, vertical component only.`, "",
  "## Directed values (Creative Production GPT resolution)", "- MIA: SH01 nominal 174 px (range 160–190); SH03 nominal 250 px (range 230–270); minimum native head 540 px.", "- LEAD: SH01 nominal 174 px; SH02 and SH03 offscreen; minimum native head 348 px.", "- REGULAR: SH01 nominal 174 px; SH02 offscreen; SH03 nominal 265 px; minimum native head 530 px.", "",
  "## Reconciliation with amendment 01", "Amendment 01 stated Mia's 174 px SH01 head as `head_top`→`chin` without defining whether `head_top` includes hair volume. This amendment supersedes that measurement definition with the convention above (`cranium_top`→`chin`, vertical). Mia's directed value 174 px (160–190) is unchanged. No other definition remains in force.", "",
  "## Scale derivation", "Whole-character scale is derived from the measured artwork: registration scales the ENTIRE drawing uniformly so the measured head span equals the SH01 reference px; other shots reach their directed head size through camera projection in the motion plan. Heads are never resized independently.", "",
  "## Changed fields", "- identities[CHAR_MIA|CHAR_LEAD|CHAR_REGULAR].on_stage_reference (convention, landmarks, span, projections, native minimum); CHAR_LEAD and CHAR_REGULAR on_stage_height_px 174/265 → null (those numbers were head heights).", "- art_requirements[MIA_MASTER|LEAD_MASTER|REGULAR_MASTER].landmarks += cranium_top.", "- Screenplay, choreography, timing, actions, shots, approvals: unchanged.", ""].join("\n");
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "sources"), { recursive: true });
for (const f of fs.readdirSync(path.join(pdir, "source"))) fs.copyFileSync(path.join(pdir, "source", f), path.join(OUT, "sources", f)); fs.writeFileSync(path.join(OUT, "sources", DOC), doc);
const after = structuredClone(before), masters = {};
for (const [id, r] of Object.entries(REF)) { const i = after.identities.find((x) => x.id === id); masters[id] = i.master_art; i.on_stage_height_px = null;
  i.on_stage_reference = { measure: "head_height_px", px: r.px, ...(r.range_px ? { range_px: r.range_px } : {}), shot: SH(1), from_landmark: "cranium_top", to_landmark: "chin", span: "vertical", convention: CONV, projections: r.projections, native_min_px: r.native_min_px, ...(id === "CHAR_MIA" ? { supersedes: "AMENDMENT_01_ON_STAGE_REFERENCE.md measurement definition (head_top→chin, hair inclusion undefined)" } : {}), source: `${DOC}; Creative Production GPT head-scale resolution 2026-11-27` };
  const a = after.art_requirements.find((x) => x.id === i.master_art); if (!a.landmarks.includes("cranium_top")) a.landmarks.push("cranium_top"); }
after.source.documents.push({ role: "amendment", file: DOC, sha256: sha(doc) });
const d1 = packetDigest(after), bytes = JSON.stringify(after, null, 1) + "\n"; fs.writeFileSync(path.join(OUT, "CREATIVE_PACKET.json"), bytes);
const back = structuredClone(after); for (const id of Object.keys(REF)) { const i = back.identities.find((x) => x.id === id), o = before.identities.find((x) => x.id === id); i.on_stage_height_px = o.on_stage_height_px; if (o.on_stage_reference) i.on_stage_reference = o.on_stage_reference; else delete i.on_stage_reference; const a = back.art_requirements.find((x) => x.id === masters[id]); a.landmarks = before.art_requirements.find((x) => x.id === masters[id]).landmarks; }
back.source.documents = back.source.documents.filter((x) => x.file !== DOC); const onlyDelta = JSON.stringify(back) === JSON.stringify(before);
const hyb = { ...J(path.join(HB, "HYBRID_CONTRACT.json")), packet_sha256: d1 }; fs.writeFileSync(path.join(OUT, "HYBRID_CONTRACT.json"), JSON.stringify(hyb, null, 1) + "\n");
const V = validatePacket(after), PF = creativePreflight(after), HY = hybridPreflight(after, hyb, { sourceDir: path.join(HB, "private_audio_for_hybrid") });
const report = { amends: active, digest: d1, file_sha256: sha(bytes), only_delta: onlyDelta ? "three identities' on_stage size statements + cranium_top on their masters + amendment document" : "UNEXPECTED_DIFFERENCE", validate: { status: V.status, errors: V.errors.map((e) => `${e.code} ${e.id}: ${e.message || ""}`) }, preflight: { status: PF.status, feedback: PF.feedback.map((f) => `${f.code} ${f.record_id}`) }, hybrid: { status: HY.status, feasible: HY.hybrid_feasible } };
fs.writeFileSync(path.join(OUT, "AMENDMENT_REPORT.json"), JSON.stringify(report, null, 1) + "\n"); console.log(JSON.stringify(report, null, 1)); if (!onlyDelta || V.status !== "STRUCTURAL_VALID") process.exit(1);
