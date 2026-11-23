// Evidence authentication for film QA (P02 directive F078/F082). Editable JSON files are INDICES only:
//  • shot QA: the QA_RESULT records its inputs; film QA RE-EXECUTES the registered executor (engine/tools/art_bridge_qa.mjs#runQA) on the current
//    revision and compares; artistic review is a verified review receipt (scope "shot_review") over the re-executed evidence — never a boolean.
//  • unlike transfer: each passage resolves a real chain — sealed provider result record → selected/delivered asset bytes → verified registration
//    → verified asset approval → review receipt (scope "unlike_transfer") over the passage bundle on THIS film revision; families must differ.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { verifyApproval, bundleHash } from "../art_bridge/approvals.mjs";
import { verifyRegistrationReceipt } from "../art_bridge/registration_evidence.mjs";
import { isDiagnosticNamespace } from "../art_bridge/reviewer_auth.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const stable = (r) => ({ scene: r.scene, gates: { mechanical_fixture_pass: r.gates?.mechanical_fixture_pass, art_registration_pass: r.gates?.art_registration_pass }, missing_art: (r.missing_art || []).length, affected_frames: (r.affected_frames || []).length, film_revision: r.film_revision });
export const shotReviewBundle = (shot, reexec) => ({ scope: "shot_review", id: shot, evidence: stable(reexec) });
/** verifyShotQA(FILM, doc, shot, revisionDigest, runQA) → {ok, why, reexec} */
export async function verifyShotQA(FILM, doc, shot, revisionDigest, runQA, manifest) {
  const f = path.join(FILM, "qa", "shots", shot.id, "QA_RESULT.json"); if (!fs.existsSync(f)) return { ok: false, why: "no per-shot QA result" };
  const idx = J(f); if (!idx.inputs) return { ok: false, why: "QA result does not record its executor inputs (cannot be re-executed)" };
  if (idx.film_revision !== revisionDigest) return { ok: false, why: `QA ran on revision ${String(idx.film_revision).slice(0, 12)}, current ${revisionDigest.slice(0, 12)} (stale)` };
  const out = path.join(FILM, "qa", ".reexec", shot.id); fs.rmSync(out, { recursive: true, force: true });
  const re = await runQA({ root: FILM, manifest, scene: shot.id, out, plan: idx.inputs.plan && path.resolve(FILM, idx.inputs.plan), frames: idx.inputs.frames, argv: ["node", "art_bridge_qa.mjs", "reexec"] });
  const a = stable(idx), b = stable(re); if (JSON.stringify(a) !== JSON.stringify(b)) return { ok: false, why: `re-executed QA differs from the recorded QA (${JSON.stringify(a.gates)} vs ${JSON.stringify(b.gates)})`, reexec: re };
  if (!(re.gates.mechanical_fixture_pass && re.gates.art_registration_pass)) return { ok: false, why: `re-executed gates ${JSON.stringify(b.gates)}`, reexec: re };
  const ptrF = path.join(FILM, "qa", "shots", shot.id, "SHOT_REVIEW_POINTER.json"), ptr = fs.existsSync(ptrF) ? J(ptrF).receipt_id : null, v = verifyApproval(doc, FILM, "shot_review", shot.id, ptr, { requireHuman: true, bundle: shotReviewBundle(shot.id, re) });
  return v.ok ? { ok: true, reexec: re, review: v } : { ok: false, why: `artistic review: ${v.status} ${v.reason || ""}`, reexec: re };
}
export const unlikeBundle = (p, revisionDigest, doc) => ({ scope: "unlike_transfer", id: p.id, family: p.family, assets: p.asset_ids.map((id) => [id, doc.assets.find((a) => a.id === id)?.sha256 ?? null]), frames: p.frame_samples || [], revision: revisionDigest });
/** verifyUnlikeTransfer(FILM, doc, revisionDigest, outbox) → {ok, passages[], why[]} */
export function verifyUnlikeTransfer(FILM, doc, revisionDigest, outbox = null) {
  const f = path.join(FILM, "qa", "film", "UNLIKE_TRANSFER.json"); if (!fs.existsSync(f)) return { ok: false, why: ["no unlike-transfer index"], passages: [] };
  const idx = J(f), diag = isDiagnosticNamespace(FILM), why = [], good = [];
  for (const p of idx.passages || []) { const bad = [];
    if (!p.id || !p.family || !Array.isArray(p.asset_ids) || !p.asset_ids.length) { why.push(`passage ${p.id}: index lacks id/family/assets`); continue; }
    for (const id of p.asset_ids) { const a = doc.assets.find((x) => x.id === id); if (!a) { bad.push(`${id}: not in manifest`); continue; }
      if (!fs.existsSync(path.join(FILM, a.file)) || fsha(path.join(FILM, a.file)) !== a.sha256) bad.push(`${id}: bytes differ`);
      if (!diag && !["GPT_PROVIDER_ART", "GPT_OPERATOR_HANDOFF"].includes(a.provenance_class)) bad.push(`${id}: provenance ${a.provenance_class} is not provider/operator art`);
      if (!diag) { const lineage = a.provider_lineage && outbox ? findSealedCandidate(outbox, a.sha256) : null; if (!lineage) bad.push(`${id}: no sealed provider result contains these bytes`); }
      if (!verifyRegistrationReceipt(FILM, doc, a).ok) bad.push(`${id}: registration evidence does not verify`);
      const va = verifyApproval(doc, FILM, "asset", a.id, a.approved_review_id, { requireHuman: true }); if (!va.ok) bad.push(`${id}: asset approval ${va.status}`); }
    const ptr = p.review_receipt_id || null, v = verifyApproval(doc, FILM, "unlike_transfer", p.id, ptr, { requireHuman: true, bundle: unlikeBundle(p, revisionDigest, doc) }); if (!v.ok) bad.push(`review ${v.status}${v.reason ? ": " + v.reason : ""}`);
    if (bad.length) why.push(`passage ${p.id}: ${bad.join("; ")}`); else good.push(p); }
  const fams = new Set(good.map((p) => p.family)); if (good.length && fams.size < 2) why.push(`passages cover ${fams.size} family (two materially unlike families are required)`);
  return { ok: fams.size >= 2 && !why.length, why, passages: good.map((p) => ({ id: p.id, family: p.family })) };
}
function findSealedCandidate(outbox, sha) { const subs = path.join(outbox, "submissions"); if (!fs.existsSync(subs)) return null; for (const job of fs.readdirSync(subs)) { const jd = path.join(subs, job); if (!fs.statSync(jd).isDirectory()) continue; for (const k of fs.readdirSync(jd)) { const r = path.join(jd, k, "PROVIDER_RESULT.json"), h = path.join(jd, k, "RESULT.sha256"); if (fs.existsSync(r) && fs.existsSync(h) && fsha(r) === fs.readFileSync(h, "utf8").trim() && J(r).candidates?.some((c) => c.sha256 === sha && c.valid) && J(r).provenance_to_ingest !== "TEST_STUB") return { job, record: r }; } } return null; }
