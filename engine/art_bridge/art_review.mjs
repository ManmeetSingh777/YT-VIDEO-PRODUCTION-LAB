// Independent native-style art review (directive F2 A07 / F027 / F033 / F061). The engine prepares the evidence a human art director
// needs (candidate at intended screen size beside the attached witness regions) and records the verdict. It never judges style itself:
// a schema-compliant but generic image is rejected by the reviewer, and every rejection must name the region, the method and the
// construction cause, plus the source decision that changes — that record feeds repair learning (repair_memory.mjs).
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { spawnSync } from "node:child_process";
import { err } from "./errors.mjs";
import { writeReceipt, attestHuman, bundleHash } from "./approvals.mjs";
import { cropRegions } from "./witness_regions.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

/** buildReviewPacket({candidate, design, outDir, intendedHeightPx}) → {strip, strip_sha256, witnesses[], candidate_sha256} */
export function buildReviewPacket({ candidate, design, outDir, intendedHeightPx, repo }) {
  fs.mkdirSync(outDir, { recursive: true }); const crops = cropRegions(design, repo, path.join(outDir, "witness_regions")), strip = path.join(outDir, "NATIVE_SIZE_REVIEW_STRIP.png");
  const p = spawnSync(process.env.PYTHON || "python", ["-I", "-c", "import sys\nfrom PIL import Image\nh=int(sys.argv[2])\nc=Image.open(sys.argv[3]).convert('RGBA')\nc=c.resize((max(1,int(c.width*h/c.height)),h))\nws=[Image.open(p).convert('RGB') for p in sys.argv[4:]]\nws=[w.resize((max(1,int(w.width*h/w.height)),h)) for w in ws]\nW=c.width+sum(w.width for w in ws)+10*len(ws)\nout=Image.new('RGB',(W,h),(128,128,128))\nout.paste(c,(0,0),c)\nx=c.width+10\nfor w in ws:\n  out.paste(w,(x,0)); x+=w.width+10\nout.save(sys.argv[1])", strip, String(intendedHeightPx), candidate, ...crops.slice(0, 6).map((c) => path.join(outDir, "witness_regions", c.crop))], { encoding: "utf8" });
  if (p.status !== 0) throw new Error(`review strip failed: ${p.stderr.slice(0, 200)}`);
  return { strip, strip_sha256: fsha(strip), candidate_sha256: fsha(candidate), intended_height_px: intendedHeightPx, witnesses: crops };
}

/** recordArtReview — a verdict over the exact candidate + packet. Non-approval needs region/method/cause/edited decision per defect. */
export async function recordArtReview({ film, candidateSha, packet, design, reviewer, verdict, defects = [], notes = "", human = false, attestation = null }) {
  if (verdict !== "APPROVED") { if (!defects.length) throw err("QA_LAYER_FAILED", { reason: "a rejection must name at least one defect (region, method, construction cause, edited source decision)", producer: "engine/art_bridge/art_review.mjs#recordArtReview" });
    for (const d of defects) { const miss = ["region_px", "method_id", "construction_cause", "edited_decision"].filter((k) => !d[k]); if (miss.length) throw err("QA_LAYER_FAILED", { reason: `defect lacks ${miss}: a reviewer comment must trace to a reusable producer`, producer: "engine/art_bridge/art_review.mjs#recordArtReview" }); } }
  const bundle = { scope: "art_review", id: candidateSha, candidate_sha256: candidateSha, packet_sha256: packet.strip_sha256, design_sha256: bundleHash(design), witness_crops: packet.witnesses.map((w) => w.crop_sha256), defects };
  const att = attestation || (human ? await attestHuman({ reviewer, bundle_sha256: bundleHash(bundle) }) : null);
  const doc = { identities: [], assets: [], rigs: [] };
  const r = writeReceipt(film, doc, { scope: "art_review", id: candidateSha, reviewer, verdict, notes, attestation: att, bundle, evidence: [packet.strip] });
  return { receipt_id: r.receipt_id, reviewer_kind: r.reviewer_kind, verdict, repair_inputs: defects.map((d) => ({ failure_class: `ART_${d.method_id}_${d.construction_cause.replace(/\W+/g, "_").toUpperCase()}`.slice(0, 80), method_id: d.method_id, region_px: d.region_px, edited_decision: d.edited_decision, candidate_sha256: candidateSha })) };
}
