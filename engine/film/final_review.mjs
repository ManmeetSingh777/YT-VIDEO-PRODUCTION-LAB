// P04 §7.7(7–8): the human film decision covers the EXACT published file. The bundle binds the final MP4, its publication receipt, the verified
// render receipt (which binds the render's own film revision; a live revision would be changed by the review receipt itself). Any changed byte is stale. (Before P04 the S09 gate compared a film receipt with a
// null bundle, so a production film review could never verify.)
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { writeReceipt, verifyApproval, attestHuman, bundleHash } from "../art_bridge/approvals.mjs";
const fsha = (f) => (fs.existsSync(f) ? crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex") : null), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const FINAL_POINTER = path.join("qa", "film", "FINAL_FILM_REVIEW_POINTER.json");
export function finalFilmBundle(film) {
  const F = path.resolve(film), doc = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), rf = path.join(F, "render", "RENDER_COMPLETION_RECEIPT.json"), ff = path.join(F, "render", "FINAL_MEDIA_RECEIPT.json"), fin = fs.existsSync(ff) ? path.join(F, "render", "film_final.mp4") : fs.existsSync(rf) ? path.join(F, J(rf).mp4) : null;
  return { scope: "final_film", id: doc.project_id, final_mp4: fin ? path.relative(F, fin).split(path.sep).join("/") : null, final_mp4_sha256: fin ? fsha(fin) : null, final_media_receipt_sha256: fsha(ff), render_receipt_sha256: fsha(rf), render_revision: fs.existsSync(rf) ? J(rf).revision ?? J(rf).film_revision ?? null : null };
}
/** why the published file is not reviewable yet ([] = reviewable) */
export function finalFilmProblems(film) {
  const F = path.resolve(film), b = finalFilmBundle(F), out = []; if (!b.final_mp4_sha256) return ["no published film file"];
  const rf = path.join(F, "render", "RENDER_COMPLETION_RECEIPT.json"), ff = path.join(F, "render", "FINAL_MEDIA_RECEIPT.json"), rc = J(rf);
  if (fs.existsSync(ff)) { const fr = J(ff); if (fr.ok !== true) out.push("the publication receipt is not ok"); if (fr.final_sha256 !== b.final_mp4_sha256) out.push("the published file does not match its receipt"); if (fr.render_receipt_mp4_sha256 !== rc.mp4_sha256) out.push("the published file was made from another render"); }
  else if (rc.mp4_sha256 !== b.final_mp4_sha256) out.push("the rendered file does not match its receipt");
  return out;
}
export function finalFilmApproval(film, { requireHuman = true } = {}) { const F = path.resolve(film), doc = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), p = path.join(F, FINAL_POINTER), ptr = fs.existsSync(p) ? J(p).receipt_id : null, bad = finalFilmProblems(F); if (bad.length) return { ok: false, status: "NOT_REVIEWABLE", reason: bad.join("; ") }; return verifyApproval(doc, F, "final_film", doc.project_id, ptr, { requireHuman, bundle: finalFilmBundle(F) }); }
export async function reviewFinalFilm({ film, reviewer, verdict, notes = "", human = false, attestation = null }) {
  const F = path.resolve(film), doc = J(path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), bad = finalFilmProblems(F); if (verdict === "APPROVED" && bad.length) throw new Error(`refused: ${bad.join("; ")}`);
  const bundle = finalFilmBundle(F), att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null), r = writeReceipt(F, doc, { scope: "final_film", id: doc.project_id, reviewer, verdict, notes, bundle, attestation: att, evidence: [bundle.final_mp4, "render/FINAL_MEDIA_RECEIPT.json"] });
  fs.mkdirSync(path.join(F, "qa", "film"), { recursive: true }); fs.writeFileSync(path.join(F, FINAL_POINTER), JSON.stringify({ receipt_id: verdict === "APPROVED" ? r.receipt_id : null, last_decision: r.receipt_id, verdict }, null, 1)); return { verdict, reviewer_kind: r.reviewer_kind, receipt: r.receipt_id };
}
