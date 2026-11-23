// Registration evidence binding (re-audit hardening 2). A registration receipt is evidence only if its CONTENT agrees with the active manifest:
// accepted status, the delivered/approved pixel hash = the asset's hash, the stored crop→canonical affine = the one the receipt's transform
// implies, residual within the recorded tolerance, and a reviewed landmark sidecar (reviewer + hash + values). Its digest is bound into the
// asset approval bundle (approvals.mjs), so replacing or editing the evidence file makes the approval stale.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { cropToCanonical } from "./asset_geometry.mjs";
import { mul, T } from "./math2d.mjs";

const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
export function registrationReceiptFile(root, a) {
  if (!root || !a?.provider_receipt_id) return null;
  const f = a.provider_receipt_id.startsWith("masterreg_") ? path.join(root, "registration", a.id, "MASTER_REGISTRATION_RECEIPT.json") : (a.provider_receipt_id.startsWith("partreg_") || a.provider_receipt_id.startsWith("vecreg_")) ? path.join(root, "registration", a.id, `${a.id}__REGISTRATION_RECEIPT.json`) : null;
  return f && fs.existsSync(f) ? f : null;
}
export const registrationReceiptDigest = (root, a) => { const f = registrationReceiptFile(root, a); return f ? fsha(f) : null; };
const close = (A, B, eps = 1e-6) => Array.isArray(A) && Array.isArray(B) && A.length === B.length && A.every((v, i) => Math.abs(v - B[i]) <= eps * Math.max(1, Math.abs(B[i])));

/** verifyRegistrationReceipt(root, doc, asset) → {ok, reasons[], receipt_sha256} */
export function verifyRegistrationReceipt(root, doc, a) {
  const f = registrationReceiptFile(root, a), reasons = [];
  if (!f) return { ok: false, reasons: ["no registration receipt for this asset"], receipt_sha256: null };
  let r; try { r = JSON.parse(fs.readFileSync(f, "utf8")); } catch { return { ok: false, reasons: ["registration receipt unreadable"], receipt_sha256: fsha(f) }; }
  const sc = r.landmark_sidecar || r.landmark_review;
  if (!sc || !sc.reviewed_by || !sc.sha256 || !sc.landmarks) reasons.push("receipt does not carry the reviewed landmark sidecar (reviewer, hash, values)");
  // the sidecar file itself is kept next to the receipt: its hash, reviewer and values must match what the receipt claims
  const sf = path.join(root, "registration", a.id, "LANDMARK_SIDECAR.json");
  if (!fs.existsSync(sf)) reasons.push("reviewed landmark sidecar file missing");
  else if (sc) { const side = JSON.parse(fs.readFileSync(sf, "utf8")); if (fsha(sf) !== sc.sha256) reasons.push("sidecar file hash ≠ receipt");
    if (side.reviewed_by !== sc.reviewed_by) reasons.push("sidecar reviewer ≠ receipt reviewer");
    for (const [k, v] of Object.entries(sc.landmarks)) if (!close(side.landmarks?.[k] || [], v, 1e-9)) reasons.push(`sidecar landmark ${k} ≠ receipt`); }
  // P03 E: vector registration — residual recomputed from the reviewed sidecar and the stored similarity; approved SVG hash bound
  if (a.provider_receipt_id.startsWith("vecreg_")) { const ident = doc.identities.find((i) => i.id === a.identity_id), Tm = r.source_to_canonical;
    if (r.status !== "PENDING_REVIEW") reasons.push(`receipt status ${r.status}`); if (r.approved_sha256 !== a.sha256) reasons.push("receipt approved-vector hash ≠ asset hash");
    if (sc && ident && Tm) { const mx = Math.max(...Object.entries(sc.landmarks).map(([k, v]) => { const q = [Tm[0] * v[0] + Tm[2] * v[1] + Tm[4], Tm[1] * v[0] + Tm[3] * v[1] + Tm[5]]; return Math.hypot(q[0] - ident.landmarks[k][0], q[1] - ident.landmarks[k][1]); }));
      if (Math.abs(mx - r.max_residual_px) > 1e-6 * Math.max(1, mx)) reasons.push(`recomputed residual ${mx.toFixed(6)} ≠ receipt residual ${r.max_residual_px}`); if (!(mx <= r.tolerance_px)) reasons.push(`recomputed residual ${mx.toFixed(6)} > tolerance ${r.tolerance_px}`); }
    return { ok: reasons.length === 0, reasons, receipt_sha256: fsha(f) }; }
  // residuals are RECOMPUTED from the sidecar landmarks and the stored transform, never trusted from the receipt
  const ident = doc.identities.find((i) => i.id === a.identity_id), apT = (A, q) => [A[0] * q[0] + A[2] * q[1] + A[4], A[1] * q[0] + A[3] * q[1] + A[5]];
  if (sc && ident && r.raster_to_canonical) {
    let target;
    if (a.provider_receipt_id.startsWith("masterreg_")) target = (k) => ident.landmarks[k];
    else { const master = doc.assets.find((x) => x.id === r.master_asset_id); if (master) { const C = cropToCanonical(master), d = C[0] * C[3] - C[1] * C[2], Ci = [C[3] / d, -C[1] / d, -C[2] / d, C[0] / d, (C[2] * C[5] - C[3] * C[4]) / d, (C[1] * C[4] - C[0] * C[5]) / d]; target = (k) => apT(Ci, master.landmarks[k] ?? ident.landmarks[k]); } }
    if (target) { const res = Object.entries(sc.landmarks).map(([k, v]) => { const p = apT(r.raster_to_canonical, v), q = target(k); return Math.hypot(p[0] - q[0], p[1] - q[1]); }), mx = Math.max(...res);
      if (Math.abs(mx - r.max_residual_px) > 1e-6 * Math.max(1, mx)) reasons.push(`recomputed residual ${mx.toFixed(6)} ≠ receipt residual ${r.max_residual_px}`);
      if (!(mx <= r.tolerance_px)) reasons.push(`recomputed residual ${mx.toFixed(6)} > tolerance ${r.tolerance_px}`); }
  }
  if (a.provider_receipt_id.startsWith("masterreg_")) {
    if (r.status !== "REGISTERED_PENDING_REVIEW") reasons.push(`receipt status ${r.status}`);
    if (r.source?.sha256 !== a.sha256) reasons.push("receipt source pixel hash ≠ asset hash");
    if (!close(cropToCanonical(a), r.raster_to_canonical)) reasons.push("asset crop→canonical ≠ receipt raster→canonical");
    if (!(r.max_residual_px <= r.tolerance_px)) reasons.push(`residual ${r.max_residual_px} > tolerance ${r.tolerance_px}`);
    if (sc && JSON.stringify(Object.keys(sc.landmarks).sort()) !== JSON.stringify(Object.keys(r.residuals ? Object.fromEntries(r.residuals.map((x) => [x.landmark, 1])) : {}).sort())) reasons.push("sidecar landmark set ≠ residual landmark set");
  } else {
    if (r.status !== "PENDING_REVIEW") reasons.push(`receipt status ${r.status}`);
    if (r.approved_part_sha256 !== a.sha256) reasons.push("receipt approved-part hash ≠ asset hash");
    const master = doc.assets.find((x) => x.id === r.master_asset_id), M = master ? cropToCanonical(master) : null;
    if (!M) reasons.push("receipt's master asset is not in the manifest");
    else { const [x0, y0] = r.source_pixel_crop_in_raw, want = mul(mul(M, r.raster_to_canonical), T(x0, y0)); if (!close(cropToCanonical(a), want)) reasons.push("asset crop→canonical ≠ master affine · receipt transform · crop origin"); }
    if (master && r.master_sha256 !== master.sha256) reasons.push("receipt was registered against a different master image");
    if (!(r.max_residual_px <= r.tolerance_px)) reasons.push(`residual ${r.max_residual_px} > tolerance ${r.tolerance_px}`);
    if (r.failures?.length) reasons.push("receipt records registration failures");
  }
  return { ok: reasons.length === 0, reasons, receipt_sha256: fsha(f) };
}
