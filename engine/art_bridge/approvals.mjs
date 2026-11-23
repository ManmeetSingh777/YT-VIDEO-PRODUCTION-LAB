// Hash-scoped, immutable review receipts (independent audit P0-4; re-audit hardening 2, 4, 5; spec §11.6).
// • `approved_review_id` is only a POINTER to the current receipt in `<root>/reviews/<receipt_id>.json`.
// • Every decision gets a NEW, never-overwritten receipt (unique id, exclusive create) and an append-only line in `reviews/HISTORY.jsonl`.
//   A later non-approval of the same record revokes earlier approvals; review commands also clear the pointer (art_intake.mjs).
// • The bundle hash covers the record's immutable content (pixels, geometry, landmarks, placement, bindings, edge) AND the digest of its
//   registration-evidence receipt, so editing or replacing evidence makes the approval stale.
// • reviewer_kind: HUMAN only through an interactive operator attestation (TTY confirmation of the bundle hash); API/automation calls are
//   DIAGNOSTIC. Production gates require HUMAN. TEST_TRUSTED exists only under ART_BRIDGE_TEST_TRUST=1 and is always labelled as such.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import readline from "node:readline";
import { registrationReceiptDigest } from "./registration_evidence.mjs";

const sha = (s) => crypto.createHash("sha256").update(typeof s === "string" ? s : JSON.stringify(s)).digest("hex");
const strip = (o, ...k) => { const c = { ...o }; for (const x of k) delete c[x]; return c; };
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
import { verifyEnvelope, consumeNonce, isDiagnosticNamespace } from "./reviewer_auth.mjs";
/** test trust is STRUCTURALLY isolated (F087): the env switch AND a diagnostic-namespace film; a production film can never be test-trusted */
export const testTrust = (root = null) => process.env.ART_BRIDGE_TEST_TRUST === "1" && (root === null ? true : isDiagnosticNamespace(root));

/** bundleFor(doc, scope, id, root) — the exact content an approval covers (root lets the bundle include evidence digests) */
export function bundleFor(doc, scope, id, root = null) {
  const assets = new Map(doc.assets.map((a) => [a.id, a]));
  if (scope === "asset") {
    const a = assets.get(id); if (!a) return null;
    const placements = doc.rigs.flatMap((r) => r.render_parts.filter((p) => p.asset_id === id || [...r.pose_states, ...r.view_states, ...(r.state_channels || []).flatMap((c) => c.states)].some((s) => s.asset_bindings[p.asset_id] === id)).map((p) => { const j = r.joints.find((x) => x.id === p.joint_id); return { rig: r.id, slot: p.asset_id, joint: p.joint_id, joint_rest: j?.rest_xy, parent: j?.parent_id, local: p.local_to_joint_matrix }; }));
    const ident = doc.identities.find((i) => i.id === a.identity_id);
    return canon({ scope, id, content: strip(a, "approved_review_id", "shot_usage"), identity_master_sha256: a.kind === "MASTER" ? null : ident?.master_sha256 ?? null, identity_landmarks: a.kind === "MASTER" ? null : ident?.landmarks ?? null, placements, registration_receipt_sha256: registrationReceiptDigest(root, a) });
  }
  if (scope === "identity") {
    const i = doc.identities.find((x) => x.id === id); if (!i) return null; const m = assets.get(i.canonical_asset_id);
    return canon({ scope, id, content: strip(i, "approved_review_id", "required_shot_ids"), master: m ? strip(m, "approved_review_id", "shot_usage") : null, master_registration_receipt_sha256: m ? registrationReceiptDigest(root, m) : null });
  }
  if (scope === "state") {
    const [rid, sid] = id.split("::"), r = doc.rigs.find((x) => x.id === rid), s0 = r && [...r.pose_states, ...r.view_states].find((x) => x.id === sid);
    // P03 B: channel states ("<channel>.<state>") are bundled over the drawings of their OWN slots
    const [cid, cst] = !s0 && sid?.includes(".") ? sid.split(".") : [null, null], ch = cid ? (r?.state_channels || []).find((c) => c.id === cid) : null, s = s0 || ch?.states.find((x) => x.id === cst); if (!s) return null;
    const visible = Object.fromEntries((ch ? ch.slots : r.render_parts.map((p) => p.asset_id)).map((slot) => [slot, s.asset_bindings[slot] ?? slot]));
    return canon({ scope, id, content: strip(s, "approved_review_id"), bound_asset_hashes: Object.fromEntries(Object.entries(visible).map(([slot, aid]) => [slot, assets.get(aid)?.sha256 ?? null])) });
  }
  if (scope === "edge") {
    const [rid, from, to] = id.split("::"), r = doc.rigs.find((x) => x.id === rid), e = r?.allowed_state_edges.find((x) => x.from === from && x.to === to); if (!e) return null;
    return canon({ scope, id, content: strip(e, "approved_assembly_review_id"), from: bundleFor(doc, "state", `${rid}::${from}`, root), to: bundleFor(doc, "state", `${rid}::${to}`, root) });
  }
  throw new Error(`unknown approval scope ${scope}`);
}
export const bundleHash = (b) => sha(canon(b));
export const receiptPath = (root, receiptId) => path.join(root, "reviews", `${receiptId}.json`);
const historyFile = (root) => path.join(root, "reviews", "HISTORY.jsonl");

/** attestHuman — the ONLY way to mint reviewer_kind HUMAN: an interactive operator types the first 8 hex chars of the bundle hash */
export async function attestHuman({ reviewer, bundle_sha256, input = process.stdin, output = process.stdout }) {
  if (!input.isTTY || !output.isTTY) throw new Error("human approval requires an interactive operator (TTY attestation); automated or piped calls can only record DIAGNOSTIC reviews");
  const rl = readline.createInterface({ input, output });
  const typed = await new Promise((ok) => rl.question(`Reviewer ${reviewer}: type the first 8 characters of bundle ${bundle_sha256.slice(0, 8)}… to attest this HUMAN decision: `, ok)); rl.close();
  if (typed.trim() !== bundle_sha256.slice(0, 8)) throw new Error("attestation mismatch: human approval not recorded");
  return { method: "INTERACTIVE_TTY", at: new Date().toISOString(), typed_confirmation: typed.trim() };
}

/** writeReceipt — append-only. `attestation` from attestHuman → HUMAN; {method:"TEST_TRUST"} only under ART_BRIDGE_TEST_TRUST=1; otherwise DIAGNOSTIC */
export function writeReceipt(root, doc, { scope, id, reviewer, verdict, notes = "", evidence = [], scope_note = "", revision = null, attestation = null, bundle = null }) {
  if (!reviewer || !String(reviewer).trim()) throw new Error("a review receipt needs an explicit reviewer");
  if (!["APPROVED", "REJECTED", "REVISE_AT_ART_SOURCE", "REVISE_AT_RIG_SOURCE", "REVOKED"].includes(verdict)) throw new Error(`invalid verdict ${verdict}`);
  const b = bundle || bundleFor(doc, scope, id, root); if (!b) throw new Error(`no ${scope} record ${id}`);
  // F081: a typed-characters TTY confirmation is a LOCAL OPERATOR confirmation, never independent human authority. HUMAN requires a signed
  // review envelope verified against trust anchors provisioned outside the repo, bound to THIS bundle, scope and record (nonce single-use).
  const h = bundleHash(b); let kind = "DIAGNOSTIC";
  if (attestation?.method === "SIGNED_ENVELOPE") { const v = verifyEnvelope(attestation.envelope, { root, scope, recordId: id, bundleSha: h }); if (!v.ok) throw new Error(`review envelope refused: ${v.reason}`); if (attestation.envelope.verdict !== verdict) throw new Error("envelope verdict differs from the recorded verdict"); consumeNonce(root, attestation.envelope); kind = v.kind; }
  else if (attestation?.method === "INTERACTIVE_TTY") kind = "LOCAL_OPERATOR_CONFIRMATION";
  else if (attestation?.method === "TEST_TRUST") { if (!testTrust(root)) throw new Error("TEST_TRUST attestation is refused outside a diagnostic-namespace film with ART_BRIDGE_TEST_TRUST=1"); kind = "TEST_TRUSTED"; }
  const receipt_id = `${scope}__${id.replace(/[^A-Za-z0-9_-]/g, "_")}__${h.slice(0, 12)}__${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`;
  const rec = { receipt_id, scope, record_id: id, verdict, reviewer, reviewer_kind: kind, attestation, notes, scope_note, evidence, bundle_sha256: h, bundle: b, reviewed_at: new Date().toISOString(), tested_revision: revision };
  fs.mkdirSync(path.join(root, "reviews"), { recursive: true });
  fs.writeFileSync(receiptPath(root, receipt_id), JSON.stringify(rec, null, 1), { flag: "wx" }); // never overwrite a decision
  fs.appendFileSync(historyFile(root), JSON.stringify({ receipt_id, scope, record_id: id, verdict, reviewer, reviewer_kind: kind, bundle_sha256: h, at: rec.reviewed_at }) + "\n");
  return rec;
}
export function reviewHistory(root, scope, id) {
  const f = historyFile(root); if (!fs.existsSync(f)) return [];
  return fs.readFileSync(f, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l)).filter((x) => x.scope === scope && x.record_id === id);
}

/** verifyApproval(doc, root, scope, id, approvedId, {requireHuman}) → {ok, status, reason} */
export function verifyApproval(doc, root, scope, id, approvedId, { requireHuman = false, bundle = null } = {}) {
  if (approvedId === null || approvedId === undefined) return { ok: false, status: "UNREVIEWED", reason: "no review" };
  const f = receiptPath(root, approvedId);
  if (!fs.existsSync(f)) return { ok: false, status: "UNKNOWN_RECEIPT", reason: `approved_review_id ${approvedId} names no receipt on disk` };
  let r; try { r = JSON.parse(fs.readFileSync(f, "utf8")); } catch { return { ok: false, status: "CORRUPT_RECEIPT", reason: "receipt unreadable" }; }
  if (r.receipt_id !== approvedId) return { ok: false, status: "CORRUPT_RECEIPT", reason: "receipt id mismatch" };
  if (r.scope !== scope || r.record_id !== id) return { ok: false, status: "FOREIGN_RECEIPT", reason: `receipt covers ${r.scope} ${r.record_id}, not ${scope} ${id}` };
  if (r.verdict !== "APPROVED") return { ok: false, status: "NOT_APPROVED", reason: `verdict ${r.verdict}` };
  if (!r.reviewer) return { ok: false, status: "NO_REVIEWER", reason: "receipt has no reviewer" };
  const hist = reviewHistory(root, scope, id), idx = hist.findIndex((x) => x.receipt_id === approvedId);
  if (idx < 0) return { ok: false, status: "NOT_IN_HISTORY", reason: "receipt is not recorded in the append-only review history" };
  const later = hist.slice(idx + 1).find((x) => x.verdict !== "APPROVED"); if (later) return { ok: false, status: "REVOKED", reason: `superseded by ${later.verdict} (${later.receipt_id})` };
  const now = bundle || bundleFor(doc, scope, id, root); if (!now) return { ok: false, status: "RECORD_MISSING", reason: "record no longer exists" };
  const h = bundleHash(now); if (h !== r.bundle_sha256 || bundleHash(r.bundle) !== r.bundle_sha256) return { ok: false, status: "STALE_RECEIPT", reason: "approved content changed since review (pixels, registration evidence, placement, bindings or edge)", details: { approved: r.bundle_sha256, now: h } };
  const kind = r.reviewer_kind || "DIAGNOSTIC";
  if (kind === "HUMAN") { const v = verifyEnvelope(r.attestation?.envelope, { root, scope, recordId: id, bundleSha: r.bundle_sha256 }); if (!v.ok || v.kind !== "HUMAN") return { ok: false, status: "NOT_HUMAN", reason: `HUMAN receipt signature no longer verifies: ${v.reason || v.kind}` }; }
  const diagOk = isDiagnosticNamespace(root) && testTrust(root) && ["TEST_TRUSTED", "DIAGNOSTIC_SIGNED"].includes(kind);
  if (requireHuman && !(kind === "HUMAN" || diagOk)) return { ok: false, status: kind === "LOCAL_OPERATOR_CONFIRMATION" ? "LOCAL_OPERATOR_ONLY" : "NOT_HUMAN", reason: `production requires an independently signed human approval; receipt reviewer_kind is ${kind}${kind === "LOCAL_OPERATOR_CONFIRMATION" ? " (a typed TTY confirmation is not independent authority)" : ""}` };
  return { ok: true, status: "VERIFIED", receipt: approvedId, reviewer: r.reviewer, reviewer_kind: kind, scope_note: r.scope_note };
}

/** verifyAllApprovals(doc, root, {requireHuman}) → per-record results for identities, assets, states, edges */
export function verifyAllApprovals(doc, root, opts = {}) {
  const results = [], v = (scope, id, ptr) => results.push({ scope, record_id: id, ...verifyApproval(doc, root, scope, id, ptr, opts) });
  for (const i of doc.identities) v("identity", i.id, i.approved_review_id);
  for (const a of doc.assets) v("asset", a.id, a.approved_review_id);
  // P04 §6.1: independent channel states (expression/eyes/mouth/hand/clothing/lighting/occlusion) carry authority too — every reachable state is enumerated
  for (const r of doc.rigs) { for (const s of [...r.pose_states, ...r.view_states]) v("state", `${r.id}::${s.id}`, s.approved_review_id); for (const c of r.state_channels || []) for (const s of c.states) v("state", `${r.id}::${c.id}.${s.id}`, s.approved_review_id); for (const e of r.allowed_state_edges) v("edge", `${r.id}::${e.from}::${e.to}`, e.approved_assembly_review_id); }
  return { results, failures: results.filter((r) => !r.ok && r.status !== "UNREVIEWED"), unreviewed: results.filter((r) => r.status === "UNREVIEWED"), verified: results.filter((r) => r.ok) };
}

/** P04 §5.5: hash-scoped approval of a deformation map — geometry, targets, seam and the EXACT approved pixels it moves. Changing any of these stales it. */
export const deformBundle = (doc, id, m) => ({ scope: "deform", id, rig: m.rig ?? null, slot: m.slot ?? null, asset: m.asset, asset_sha256: doc.assets.find((a) => a.id === m.asset)?.sha256 ?? null, vertices: m.vertices, triangles: m.triangles, targets: m.targets, seam_px: m.seam_px ?? null, approved_target_note: m.target_note ?? null });
export const verifyDeformApproval = (doc, root, id, m, opts = {}) => verifyApproval(doc, root, "deform", id, m.approved_receipt, { ...opts, bundle: deformBundle(doc, id, m) });
