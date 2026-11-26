#!/usr/bin/env node
// E01 phase-1 speech preflight on the REAL selected takes (P3.1). Input stays private (the extracted P3.1 package outside git); full per-phone
// records and per-frame viseme schedules are written ONLY to --private-out (outside every git work tree). The repository receives a summary with
// hashes, counts and frame spans — no audio, no phone timings.
//   node tools/tbo/e01_speech_preflight.mjs --p31 <extracted P3.1 dir> --private-out E:/TBO_PRIVATE/E01_SPEECH_PREFLIGHT --summary engineering/p08/E01_SPEECH_PREFLIGHT_SUMMARY.json
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { importMfaTiming, normalizeSpeechAlignment, frameVisemes, absSample, VISEME_INVENTORY } from "../../engine/art_bridge/speech_visemes.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), a = process.argv.slice(2), opt = (k) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : null; };
const D = path.resolve(opt("p31") || ""), OUT = path.resolve(opt("private-out") || "E:/TBO_PRIVATE/E01_SPEECH_PREFLIGHT"), SUM = path.resolve(REPO, opt("summary") || "engineering/p08/E01_SPEECH_PREFLIGHT_SUMMARY.json");
const inGit = (d) => { try { execFileSync("git", ["-C", d, "rev-parse", "--is-inside-work-tree"], { stdio: "pipe" }); return true; } catch { return false; } };
fs.mkdirSync(OUT, { recursive: true }); if (inGit(OUT)) throw new Error(`${OUT} is inside a git work tree: private speech detail must stay outside every repository`);
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const sel = J(path.join(D, "E01_TAKE_SELECTIONS_P3.json")), approval = fs.existsSync(path.join(D, "AUDIO_APPROVAL_RECORD_P3_1.json")) ? J(path.join(D, "AUDIO_APPROVAL_RECORD_P3_1.json")) : null;
const csv = fs.readFileSync(path.join(D, "MEASURED_PHONE_TIMELINE.csv"), "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(","));
const rows = [], problems = [];
for (const s of sel.selections) {
  const wavF = path.join(D, s.master_path), wavSha = fs.existsSync(wavF) ? sha(fs.readFileSync(wavF)) : null;
  if (wavSha !== s.master_sha256) problems.push(`${s.cue_id}: master bytes ${wavSha?.slice(0, 12) ?? "missing"} ≠ selection ${s.master_sha256.slice(0, 12)}`);
  if (!s.alignment_path) { rows.push({ cue_id: s.cue_id, actor: s.actor, take_id: s.take_id, master_sha256: s.master_sha256, master_verified: wavSha === s.master_sha256, kind: "NONVERBAL", route: "NONVERBAL_PRODUCER_REQUIRED (no phone labels fabricated)", frames: null }); continue; }
  const t = J(path.join(D, s.alignment_path)); if (t.audio.sha256 !== wavSha) problems.push(`${s.cue_id}: alignment is of ${t.audio.sha256.slice(0, 12)}, the selected master is ${wavSha?.slice(0, 12)}`);
  const rec = importMfaTiming(t, s, { actorRigId: s.actor, cueId: s.cue_id }), n = normalizeSpeechAlignment(rec, { audioSha: wavSha });
  for (const e of n.errors) problems.push(`${s.cue_id}: ${e.code} ${e.human_readable_reason}`);
  const mine = csv.filter((r) => r[0] === s.cue_id), match = rec.phones.every((p, i) => mine[i] && mine[i][3] === p.phone && +mine[i][6] === absSample(rec, p.file_start_sample) && +mine[i][7] === absSample(rec, p.file_end_sample)) && mine.length === rec.phones.length;
  if (!match) problems.push(`${s.cue_id}: absolute phone samples differ from MEASURED_PHONE_TIMELINE.csv`);
  const fr = [Math.floor(absSample(rec, rec.phones[0].file_start_sample) / 800), Math.ceil(absSample(rec, rec.phones.at(-1).file_end_sample) / 800)], fv = frameVisemes(rec, { frames: fr });
  fs.writeFileSync(path.join(OUT, `${s.cue_id}.SPEECH_ALIGNMENT.json`), JSON.stringify(rec, null, 1)); fs.writeFileSync(path.join(OUT, `${s.cue_id}.FRAME_VISEMES.json`), JSON.stringify(fv, null, 1));
  rows.push({ cue_id: s.cue_id, actor: s.actor, take_id: s.take_id, master_sha256: s.master_sha256, master_verified: wavSha === s.master_sha256, alignment_sha256: sha(fs.readFileSync(path.join(D, s.alignment_path))), aligner: `${t.aligner.tool} ${t.aligner.version} ${t.aligner.acoustic_model}`,
    phones: rec.phones.length, phones_match_creative_csv: match, frames: fr, visemes_used: [...new Set(fv.perFrame.map((x) => x.viseme))].sort(), forced_closures: fv.ambiguities.filter((x) => x.kind.startsWith("CLOSURE_SHORTER")).length, subframe_not_visible: fv.ambiguities.filter((x) => x.kind === "SUBFRAME_PHONE_NOT_VISIBLE").length, record_sha256: sha(JSON.stringify(rec)) });
}
const byActor = {}; for (const r of rows.filter((x) => x.visemes_used)) (byActor[r.actor] ||= new Set()); for (const r of rows) if (r.visemes_used) r.visemes_used.forEach((v) => byActor[r.actor].add(v));
const summary = { kind: "E01_PHASE1_SPEECH_PREFLIGHT", source_package: "E01_PHASE1_MEASURED_P3_1_STORYBOARD (private; not in git)", inventory: { id: VISEME_INVENTORY.id, version: VISEME_INVENTORY.version }, clock: "48000 Hz / 60 fps = 800 samples per frame",
  approval_status: approval?.status ?? "NO_APPROVAL_RECORD", approval_kind: approval?.kind ?? null, note: "selected audio is user-approved (statement record, not an engine signature); A/V placement, animatic and packet are NOT approved",
  cues: rows, visemes_needed_per_actor_before_expression_context: Object.fromEntries(Object.entries(byActor).map(([k, v]) => [k, [...v].sort()])),
  art_demand_note: "the exact mouth tuples are (view, mouth family of the visible expression, viseme); families come from the approved expression timeline of the phase packet, so the final tuple list is generated by compilePerformance from the signed packet — not typed here",
  problems, ok: problems.length === 0, private_detail_dir: "outside git (operator-local)" };
fs.mkdirSync(path.dirname(SUM), { recursive: true }); fs.writeFileSync(SUM, JSON.stringify(summary, null, 1) + "\n");
console.log(JSON.stringify({ ok: summary.ok, cues: rows.length, problems: problems.length, summary: path.relative(REPO, SUM) }));
