// Usable HUMAN approval (P04 §6.2): export → sign (on the reviewer's own machine) → import. The repository prepares the request and verifies the
// answer; it never holds a production key and cannot mark anything approved. One registry maps every reviewable scope to (a) the exact bundle the
// reviewer signs and (b) the one producer that records the decision.
//   exportReviewRequest({film, scope, id}) → <film>/reviews/requests/<request id>/{REVIEW_REQUEST.json, files to look at, HOW_TO_SIGN.md}
//   (reviewer) node engine/tools/reviewer_sign_offline.mjs --request … --key <outside repo> --reviewer ID --verdict V
//   importSignedReview({film, signed}) → verifies signature, anchor, scope, record, film, bundle, packet hash, nonce, expiry; then records it
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { bundleFor, bundleHash, deformBundle } from "./approvals.mjs";
import { scopeBundle, designBundle, approveScope, approveDesign, gateForJob, resolveContractContext } from "./art_contract.mjs";
import * as I from "./art_intake.mjs";
import { proposalBundle, approveProposal } from "../story/authoring_handoff.mjs";
import { finalFilmBundle, reviewFinalFilm } from "../film/final_review.mjs";
import { packetBundle, approvePacket, loadPacket } from "../story/creative_adapter.mjs";
import { resolveMotionPlan } from "../story/motion_plan_source.mjs";
import { verifyEnvelope } from "./reviewer_auth.mjs";
const sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";
const docOf = (F) => J(path.join(F, MF)), need = (b, scope, id) => { if (!b) throw err("STALE_DEPENDENCY", { record_id: `${scope}:${id}`, reason: `there is no ${scope} record "${id}" to review` }); return b; };
const jobFor = async (F, id) => { const jobs = await I.planJobs({ film: F }), list = Array.isArray(jobs) ? jobs : jobs.jobs, j = list.find((x) => x.artjob_id === id || x.asset_id === id); if (!j) throw err("STALE_DEPENDENCY", { record_id: id, reason: `no ArtJob ${id}` }); return { job: j, masterJob: j.root_dependency && j.root_dependency !== j.artjob_id ? list.find((x) => x.artjob_id === j.root_dependency) : null }; };
const mapOf = (F, id) => { const m = resolveMotionPlan(F).plan.deform_maps?.[id]; if (!m) throw err("STALE_DEPENDENCY", { record_id: id, reason: `the motion plan has no deform map ${id}` }); return m; };
const img = (F, ...ids) => { const d = docOf(F); return ids.filter(Boolean).map((i) => d.assets.find((a) => a.id === i)?.file).filter(Boolean); };
/** scope → {parts: [[receipt scope, record id, bundle]], files to inspect, apply(attestation by receipt scope)} */
const SUBJECTS = {
  story: { parts: (F) => [["story", path.basename(F), scopeBundle(F, "story")]], files: (F) => Object.keys(scopeBundle(F, "story").files).map((x) => x.split("#")[0]), apply: (F, id, o, att) => approveScope({ film: F, scope: "story", ...o, attestation: att("story") }) },
  direction: { parts: (F) => [["direction", path.basename(F), scopeBundle(F, "direction")]], files: (F) => Object.keys(scopeBundle(F, "direction").files).map((x) => x.split("#")[0]), apply: (F, id, o, att) => approveScope({ film: F, scope: "direction", ...o, attestation: att("direction") }) },
  proposal: { parts: (F, id) => [["proposal", id, proposalBundle(F, id)]], files: (F, id) => fs.readdirSync(path.join(F, "direction", "proposals", id)).map((x) => `direction/proposals/${id}/${x}`), apply: (F, id, o, att) => approveProposal({ film: F, proposal: id, ...o, attestation: att("proposal") }) },
  creative_packet: { parts: (F, id) => [["creative_packet", id, packetBundle(F, id)]], files: (F, id) => [`creative/packets/${id}/CREATIVE_PACKET.json`, ...loadPacket(F, id).record.source.map((x) => `creative/packets/${id}/source/${path.basename(x.file)}`)], apply: (F, id, o, att) => approvePacket({ film: F, packet: id, ...o, attestation: att("creative_packet") }) },
  design: { parts: async (F, id) => { const doc = docOf(F), { job, masterJob } = await jobFor(F, id), report = gateForJob({ film: F, doc, job, masterJob }), r = resolveContractContext({ film: F, doc, job }), d = J(r.context.designRef); return [["design", d.job_id, designBundle(d, report)]]; }, files: async (F, id) => { const { job } = await jobFor(F, id), ref = resolveContractContext({ film: F, doc: docOf(F), job }).context.designRef, rel = path.relative(F, ref).split(path.sep).join("/"); return [rel, rel.replace(/\.design\.json$/, ".pregen_audit.json")]; }, apply: async (F, id, o, att) => approveDesign({ film: F, doc: docOf(F), ...(await jobFor(F, id)), ...o, attestation: att("design") }) },
  // a master decision covers the pixels AND the identity they define: two bundles, two signatures, one decision
  master: { parts: (F, id) => { const d = docOf(F), i = d.identities.find((x) => x.id === id); return [["asset", i?.canonical_asset_id, need(i && bundleFor(d, "asset", i.canonical_asset_id, F), "master", id)], ["identity", id, need(bundleFor(d, "identity", id, F), "identity", id)]]; }, files: (F, id) => { const i = docOf(F).identities.find((x) => x.id === id); return img(F, i?.canonical_asset_id); }, apply: (F, id, o, att) => I.reviewMaster({ film: F, identity: id, ...o, attestation: { method: "SIGNED_ENVELOPE_SET", asset: att("asset"), identity: att("identity") } }) },
  part: { parts: (F, id) => [["asset", id, need(bundleFor(docOf(F), "asset", id, F), "asset", id)]], files: (F, id) => [...img(F, id), `registration/${id}/${id}__overlay_on_master.png`], apply: (F, id, o, att) => I.reviewPart({ film: F, asset: id, ...o, attestation: att("asset") }) },
  state: { parts: (F, id) => [["state", id, need(bundleFor(docOf(F), "state", id, F), "state", id)]], files: (F, id) => { const b = bundleFor(docOf(F), "state", id, F); return img(F, ...Object.values(b?.content?.asset_bindings || {})); }, apply: (F, id, o, att) => { const [rig, state] = id.split("::"); return I.approveState({ film: F, rig, state, ...o, attestation: att("state") }); } },
  edge: { parts: (F, id) => [["edge", id, need(bundleFor(docOf(F), "edge", id, F), "edge", id)]], files: () => [], apply: (F, id, o, att) => { const [rig, from, to] = id.split("::"); return I.approveStateEdge({ film: F, rig, from, to, ...o, attestation: att("edge") }); } },
  deform: { parts: (F, id) => [["deform", id, deformBundle(docOf(F), id, mapOf(F, id))]], files: (F, id) => img(F, mapOf(F, id).asset), apply: (F, id, o, att) => I.approveDeform({ film: F, id, map: mapOf(F, id), ...o, attestation: att("deform") }) },
  final_film: { parts: (F) => [["final_film", docOf(F).project_id, finalFilmBundle(F)]], files: () => ["render/film_final.mp4", "render/FINAL_MEDIA_RECEIPT.json"], apply: (F, id, o, att) => reviewFinalFilm({ film: F, ...o, attestation: att("final_film") }) },
};
export const REVIEW_SCOPES = Object.freeze(Object.keys(SUBJECTS));
const subject = (s) => { if (!SUBJECTS[s]) throw err("SCHEMA_VIOLATION", { record_id: s, reason: `unknown review scope ${s} (scopes: ${REVIEW_SCOPES.join(", ")})` }); return SUBJECTS[s]; };
export async function exportReviewRequest({ film, scope, id = null, validHours = 168 }) {
  const F = path.resolve(film), S = subject(scope), parts = await S.parts(F, id), files = [...new Set(await S.files(F, id))].filter((x) => fs.existsSync(path.join(F, x)) && fs.statSync(path.join(F, x)).isFile());
  const packet = { film_id: path.basename(F), scope, id, parts: parts.map(([s, r, b]) => ({ scope: s, record_id: r, bundle_sha256: bundleHash(b) })), files: files.map((x) => ({ file: x, sha256: sha(fs.readFileSync(path.join(F, x))) })) }, packet_sha256 = sha(JSON.stringify(packet)), rid = `${scope}__${String(id ?? packet.film_id).replace(/[^A-Za-z0-9_-]/g, "_")}__${packet_sha256.slice(0, 12)}`, dir = path.join(F, "reviews", "requests", rid);
  fs.mkdirSync(path.join(dir, "look_at"), { recursive: true }); for (const x of files) if (!/\.mp4$/.test(x)) fs.copyFileSync(path.join(F, x), path.join(dir, "look_at", x.replace(/[\\/]/g, "__")));
  const exp = new Date(Date.now() + validHours * 3600e3).toISOString(), req = { request_id: rid, packet, packet_sha256, envelopes: packet.parts.map((p) => ({ film_id: packet.film_id, scope: p.scope, record_id: p.record_id, bundle_sha256: p.bundle_sha256, packet_sha256, request_id: rid, issued_utc: new Date().toISOString(), expires_utc: exp, nonce: crypto.randomBytes(16).toString("hex"), verdict: null, reviewer_id: null })), note: "unsigned request: it approves nothing" };
  fs.writeFileSync(path.join(dir, "REVIEW_REQUEST.json"), JSON.stringify(req, null, 1));
  fs.writeFileSync(path.join(dir, "HOW_TO_SIGN.md"), `# Review request ${rid}\n\n1. Inspect the files in \`look_at/\` (for a final film: play \`${files.find((x) => /\.mp4$/.test(x)) ?? "the listed file"}\` in the film folder; its SHA-256 is in REVIEW_REQUEST.json).\n2. On YOUR machine, with YOUR private key kept outside this repository, run in an interactive terminal:\n\n   node engine/tools/reviewer_sign_offline.mjs --request "<this folder>/REVIEW_REQUEST.json" --key "<path to your private key>" --reviewer <your reviewer id> --verdict APPROVED|REJECTED|REVISE_AT_ART_SOURCE|REVISE_AT_RIG_SOURCE --out SIGNED_REVIEW.json\n\n3. Return SIGNED_REVIEW.json; import it with \`node engine/tools/review_sign.mjs import --film <film> --signed SIGNED_REVIEW.json\`.\n\nYour PUBLIC key must be listed in the trust-anchor file named by ART_BRIDGE_REVIEWER_KEYS_FILE (outside the repository). First time only:\n\n   openssl genpkey -algorithm ed25519 -out reviewer_private.pem\n   openssl pkey -in reviewer_private.pem -pubout -out reviewer_public.pem\n\nREVIEWERS.json = {"reviewers":[{"id":"<your reviewer id>","public_key_pem":"<contents of reviewer_public.pem>"}]}. To revoke a key add "revoked_utc".\n`);
  return { request_id: rid, dir, request: req };
}
/** importSignedReview — every envelope is verified BEFORE anything is recorded (no half-recorded decision) */
export async function importSignedReview({ film, signed, notes = "" }) {
  const F = path.resolve(film), s = typeof signed === "string" ? J(signed) : signed, dir = path.join(F, "reviews", "requests", String(s.request_id ?? "").replace(/[^A-Za-z0-9_-]/g, "_")), rf = path.join(dir, "REVIEW_REQUEST.json"), refuse = (reason) => { throw err("STALE_DEPENDENCY", { record_id: s.request_id ?? "(no request id)", reason: `signed review refused: ${reason}` }); };
  if (!fs.existsSync(rf)) refuse("it answers no request exported by this film");
  const req = J(rf); if (sha(JSON.stringify(req.packet)) !== req.packet_sha256) refuse("the stored request was altered after export");
  const S = subject(req.packet.scope), now = await S.parts(F, req.packet.id); if (s.envelopes?.length !== req.envelopes.length) refuse(`expected ${req.envelopes.length} signed envelopes`);
  for (const x of req.packet.files) if (!fs.existsSync(path.join(F, x.file)) || sha(fs.readFileSync(path.join(F, x.file))) !== x.sha256) refuse(`${x.file} changed after the reviewer's packet was exported`);
  const verdicts = new Set(s.envelopes.map((e) => e.verdict)), by = new Map(); if (verdicts.size !== 1) refuse("the envelopes carry different verdicts");
  for (const tmpl of req.envelopes) {
    const e = s.envelopes.find((x) => x.scope === tmpl.scope && x.record_id === tmpl.record_id); if (!e) refuse(`no envelope for ${tmpl.scope} ${tmpl.record_id}`);
    for (const k of ["film_id", "bundle_sha256", "packet_sha256", "request_id", "issued_utc", "expires_utc", "nonce"]) if (e[k] !== tmpl[k]) refuse(`envelope field ${k} differs from the exported request`);
    const b = now.find(([sc, r]) => sc === tmpl.scope && r === tmpl.record_id); if (!b || bundleHash(b[2]) !== tmpl.bundle_sha256) refuse(`${tmpl.scope} ${tmpl.record_id} changed since the request was exported`);
    const v = verifyEnvelope(e, { root: F, scope: tmpl.scope, recordId: tmpl.record_id, bundleSha: tmpl.bundle_sha256, filmId: path.basename(F) }); if (!v.ok) refuse(v.reason);
    by.set(tmpl.scope, { method: "SIGNED_ENVELOPE", envelope: e });
  }
  const verdict = [...verdicts][0], reviewer = s.envelopes[0].reviewer_id; if (s.envelopes.some((e) => e.reviewer_id !== reviewer)) refuse("the envelopes are signed by different reviewers");
  const r = await S.apply(F, req.packet.id, { reviewer, verdict, notes }, (sc) => by.get(sc)); fs.copyFileSync(rf, path.join(dir, "REVIEW_REQUEST.answered.json")); return { request_id: req.request_id, scope: req.packet.scope, id: req.packet.id, verdict, reviewer, result: r };
}
