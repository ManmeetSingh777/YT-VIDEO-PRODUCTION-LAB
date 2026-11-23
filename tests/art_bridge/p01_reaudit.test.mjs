// Independent P0 re-audit (inputs/HYBRID_V2_P0_INDEPENDENT_REAUDIT.md): B1 canonical geometry, B2 underpaint ownership, hardening 1–5.
// Written BEFORE the repairs; the pre-repair failing run is kept in hybrid_v2/evidence/p01/P01_REPRODUCTION_BEFORE.txt.
// Pixel proofs render real transformed pixels in Chrome (DIAGNOSTIC rasters; never artistic evidence).
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { runRoundTrip, startProviderStub, WORLD } from "./roundtrip_fixture.mjs";
import { readPNG, writeRGBA } from "../../engine/art_bridge/png.mjs";
import { runCheck } from "../../engine/tools/art_bridge_check.mjs";

const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p01");
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), ap = (T, p) => [T[0] * p[0] + T[2] * p[1] + T[4], T[1] * p[0] + T[3] * p[1] + T[5]];
const bbox = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys)]; };
const close = (a, b, eps = 1e-6) => a.length === b.length && a.every((v, i) => Math.abs(v - b[i]) <= eps);
let rt, doc; const asset = (id) => doc.assets.find((a) => a.id === id);
before(async () => { process.env.IMAGE_PROVIDER_SIZE = "170x170"; /* H3 stub returns the 170x170 hand_grip fixture; size is part of every generation */ rt = await runRoundTrip(path.join(W, "rt")); doc = J(rt.manifest); });

/* ───── B1 canonical geometry ───── */
test("B1-a 640×900 master registered at 0.5×: canonical rect [-20,-15,320,450] and one full crop→canonical affine", () => {
  const m = asset("pilot_master");
  assert.deepEqual([m.width_px, m.height_px], [640, 900]);
  assert.ok(close(m.canonical_rect, [-20, -15, 320, 450]), `canonical_rect ${m.canonical_rect}`);
  assert.ok(close(m.crop_to_canonical_matrix || [], [0.5, 0, 0, 0.5, -20, -15]), `crop_to_canonical_matrix ${m.crop_to_canonical_matrix}`);
});
test("B1-b every registered part: canonical rect = bbox of its four transformed crop corners (independent ground truth from the delivery transform)", () => {
  const toCanon = (mp) => [(mp[0] - 40) / 2, (mp[1] - 30) / 2]; // fixture: master px = 2·canonical + (40,30)
  for (const k of ["body", "upper_arm", "forearm", "underpaint", "hand_open", "hand_grip"]) {
    const a = asset(`pilot_${k}`), rec = J(path.join(rt.film, "registration", a.id, `${a.id}__REGISTRATION_RECEIPT.json`)), [x0, y0, cw, ch] = rec.source_pixel_crop_in_raw, T = rt.files[`${k}_T`];
    const expected = bbox([[x0, y0], [x0 + cw, y0], [x0, y0 + ch], [x0 + cw, y0 + ch]].map((p) => toCanon(ap(T, p))));
    assert.ok(close(a.canonical_rect, expected, 1e-6), `${a.id}: stored ${a.canonical_rect.map((v) => v.toFixed(3))} expected ${expected.map((v) => v.toFixed(3))}`);
  }
});
test("B1-c the loader refuses a canonical rect that disagrees with its crop→canonical matrix", async () => {
  const d = J(rt.manifest); d.assets.find((a) => a.id === "pilot_master").canonical_rect = [-20, -15, 640, 900];
  const f = path.join(rt.film, "handoff", "b1c.json"); fs.writeFileSync(f, JSON.stringify(d));
  const r = await runCheck({ root: rt.film, manifest: "handoff/b1c.json" });
  assert.ok(r.errors.some((e) => e.code === "IMAGE_DIMENSION_MISMATCH" && e.record_id === "pilot_master"), JSON.stringify(r.errors.map((e) => e.code)));
});
test("B1-d world plate at 2 px/unit: rect [-100,-60,1200,675]; footprint flags the wide view and passes the push-in; Chrome pixels agree", async () => {
  const p = asset("rt_world_far"); assert.ok(close(p.canonical_rect, [-100, -60, 1200, 675]), `plate rect ${p.canonical_rect}`);
  const { probeWorldFootprint } = await import("./p01_probes.mjs"); const r = await probeWorldFootprint(rt, path.join(W, "footprint"));
  assert.ok(r.flagged_spans.length && r.flagged_spans[0][0] === 3600, JSON.stringify(r.flagged_spans)); assert.ok(r.flagged_spans.every(([, b]) => b <= 3900));
  assert.ok(r.sentinel_wide > 0, "wide view must reveal unpainted area in pixels"); assert.equal(r.sentinel_pushed, 0);
  assert.ok(r.grid_probe_max_err < 6, `plate pixels at predicted canonical points (max channel err ${r.grid_probe_max_err})`);
});
test("B1-e emitter applies scale/rotation/crop exactly once: interior source pixels land where crop→canonical predicts (0.5×, 1.25×+rot, 0.9×+rot, rot, sub-crop)", async () => {
  const { probeAssetPixels } = await import("./p01_probes.mjs"); const r = await probeAssetPixels(rt, path.join(W, "pixels"));
  for (const x of r.assets) { assert.ok(x.inside_matches >= 0.97 * x.inside_samples, `${x.id}: ${x.inside_matches}/${x.inside_samples} interior probes match`); assert.equal(x.outside_painted, 0, `${x.id}: paint outside its canonical quad`); }
});
test("B1-f transition plates delivered at 2× density render like 1× plates (mask aperture, anchor and scale applied once)", async () => {
  const { probeTransitionDensity } = await import("./p01_probes.mjs"); const r = await probeTransitionDensity(path.join(W, "transition"));
  assert.ok(r.mean_abs_diff < 3, `mean |Δ| ${r.mean_abs_diff}`); assert.equal(r.sentinel_2x, 0);
});

/* ───── B2 underpaint ownership ───── */
test("B2-a the real Ines plan declares surface→underpaint ownership; plan validation refuses unmapped / non-underpaint / wrongly ordered owners", async () => {
  const { validatePlanContract } = await import("../../engine/art_bridge/art_intake.mjs");
  const film = path.join(REPO, "films", "hv2_film001"), d = J(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), plan = J(path.join(film, "handoff", "ART_DEPENDENCY_PLAN.json"));
  const fa = plan.assets.find((a) => a.asset_id === "ines_forearm_r"); assert.deepEqual(fa.surface_underpaint, { elbow_inner_sleeve: "ines_elbow_r_underpaint" });
  assert.deepEqual(validatePlanContract(d, plan), []);
  const m1 = structuredClone(plan); m1.assets.find((a) => a.asset_id === "ines_forearm_r").surface_underpaint = {}; assert.ok(validatePlanContract(d, m1).some((e) => e.code === "MISSING_UNDERPAINT" && e.record_id === "ines_forearm_r"));
  const m2 = structuredClone(plan); m2.assets.find((a) => a.asset_id === "ines_forearm_r").surface_underpaint = { elbow_inner_sleeve: "ines_torso" }; assert.ok(validatePlanContract(d, m2).some((e) => e.code === "MISSING_UNDERPAINT"));
  const m3 = structuredClone(plan); m3.assets.find((a) => a.asset_id === "ines_elbow_r_underpaint").draw_order = [{ relation: "ABOVE", asset_id: "ines_forearm_r" }]; assert.ok(validatePlanContract(d, m3).some((e) => e.code === "OCCLUSION_CONFLICT"));
});
test("B2-b intake carries the ownership: forearm links pilot_underpaint, loader finds no MISSING_UNDERPAINT, unmapped plan refuses", async () => {
  const f = asset("pilot_forearm"); assert.deepEqual(f.hidden_surfaces, ["elbow_inner"]); assert.deepEqual(f.underpaint_asset_ids, ["pilot_underpaint"]);
  const r = await runCheck({ root: rt.film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json" }); assert.ok(!r.errors.some((e) => e.code === "MISSING_UNDERPAINT"), JSON.stringify(r.errors.map((e) => e.code)));
  const I = await import("../../engine/art_bridge/art_intake.mjs"), planF = path.join(rt.film, "handoff", "ART_DEPENDENCY_PLAN.json"), plan = J(planF), save = JSON.stringify(plan);
  plan.assets.find((a) => a.asset_id === "pilot_forearm").surface_underpaint = {}; fs.writeFileSync(planF, JSON.stringify(plan));
  try { await assert.rejects(() => I.ingestPart({ film: rt.film, asset: "pilot_forearm", file: rt.files.forearm, landmarks: rt.files.forearm_landmarks, provenance: "DIAGNOSTIC_FIXTURE" }), /MISSING_UNDERPAINT|underpaint/); }
  finally { fs.writeFileSync(planF, save); }
});
test("B2-c hard elbow bend in Chrome: owned underpaint closes the joint; hiding it opens a seam", async () => {
  const { probeElbowBend } = await import("./p01_probes.mjs"); const r = await probeElbowBend(rt, path.join(W, "bend"));
  assert.equal(r.holes_with_underpaint, 0); assert.ok(r.holes_without > 20, `holes without underpaint ${r.holes_without}`); assert.ok(r.underpaint_below_forearm);
});

/* ───── hardening ───── */
test("H1 planned alpha contract is enforced at intake (no silent rewrite)", async () => {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), d = path.join(W, "h1"); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(rt.film, d, { recursive: true });
  const r1 = await I.ingestMaster({ film: d, asset: "rt_world_far", file: rt.files.master, landmarks: rt.files.world_landmarks, provenance: "DIAGNOSTIC_FIXTURE" }).then((x) => x.status, (e) => e.code || e.message);
  assert.match(String(r1), /ALPHA_INVALID/);
  const op = readPNG(rt.files.hand_grip); for (let i = 3; i < op.rgba.length; i += 4) op.rgba[i] = 255; const opaque = path.join(d, "opaque_hand.png"); writeRGBA(opaque, op.width, op.height, op.rgba);
  const r2 = await I.ingestPart({ film: d, asset: "pilot_hand_grip", file: opaque, landmarks: rt.files.hand_grip_landmarks, provenance: "DIAGNOSTIC_FIXTURE" }).then((x) => x.status, (e) => e.code || e.message);
  assert.match(String(r2), /ALPHA_INVALID/);
});
test("H2 registration receipt content is verified and bound into the approval", async () => {
  const { verifyRegistrationReceipt } = await import("../../engine/art_bridge/art_intake.mjs"), { verifyApproval } = await import("../../engine/art_bridge/approvals.mjs");
  const d = path.join(W, "h2"); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(rt.film, d, { recursive: true }); const dd = J(path.join(d, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), a = dd.assets.find((x) => x.id === "pilot_hand_open");
  assert.equal(verifyRegistrationReceipt(d, dd, a).ok, true);
  const rf = path.join(d, "registration", a.id, `${a.id}__REGISTRATION_RECEIPT.json`), rec = J(rf); rec.max_residual_px = 0.0001; rec.landmark_sidecar = { ...(rec.landmark_sidecar || {}), reviewed_by: "someone else" }; fs.writeFileSync(rf, JSON.stringify(rec));
  assert.equal(verifyRegistrationReceipt(d, dd, a).ok, false); assert.equal(verifyApproval(dd, d, "asset", a.id, a.approved_review_id).ok, false);
});
test("H3 provider: model/size/config in the idempotency key; multiple outputs kept as immutable candidates; retry then resume", async () => {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), stub = await startProviderStub(rt.files.hand_grip, { outputs: 2, failFirst: 1, failStatus: 429 });
  const prevTT = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1"; // round-trip approvals are TEST_TRUST; honoured only on the loopback stub
  try {
    const env = (model) => ({ IMAGE_PROVIDER_SIZE: stub.size, IMAGE_PROVIDER: "openai-images", IMAGE_PROVIDER_MODEL: model, OPENAI_API_KEY: "test-key-not-real", OPENAI_BASE_URL: stub.url, IMAGE_PROVIDER_CAPS: JSON.stringify({ generate: true, edit: true, transparentRaster: true, multipleReferences: true, svgGeneration: false }) });
    const a = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env: env("stub-a"), provenanceOverride: "TEST_STUB" });
    assert.equal(a.status, "CANDIDATES_RECEIVED_PENDING_SELECTION", JSON.stringify(a.error || a.candidates?.map((c) => c.problems))); assert.equal(a.attempts, 2); assert.equal(a.candidates.length, 2); assert.notEqual(a.candidates[0].file, a.candidates[1].file);
    const b = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env: env("stub-b"), provenanceOverride: "TEST_STUB" });
    assert.notEqual(b.status, "ALREADY_SUBMITTED_SAME_PAYLOAD"); assert.notEqual(a.payload_key_sha256, b.payload_key_sha256);
    for (const c of [...a.candidates, ...b.candidates]) assert.ok(fs.existsSync(c.file));
    const again = await I.submitJob({ film: rt.film, out: rt.outbox, job: rt.jobIds.hand_grip, env: env("stub-a"), provenanceOverride: "TEST_STUB" }); assert.equal(again.status, "ALREADY_SUBMITTED_SAME_PAYLOAD");
  } finally { await stub.close(); process.env.ART_BRIDGE_TEST_TRUST = prevTT ?? ""; }
});
test("H4 review history is immutable; a rejection clears the current pointer; every decision survives", async () => {
  const I = await import("../../engine/art_bridge/art_intake.mjs"), { reviewHistory } = await import("../../engine/art_bridge/approvals.mjs");
  const d = path.join(W, "h4"); fs.rmSync(d, { recursive: true, force: true }); fs.cpSync(rt.film, d, { recursive: true });
  const op = { reviewer: "roundtrip-operator", scope_note: "DIAGNOSTIC_ONLY" };
  const r1 = await I.reviewPart({ film: d, asset: "pilot_hand_grip", verdict: "APPROVED", ...op }), r2 = await I.reviewPart({ film: d, asset: "pilot_hand_grip", verdict: "REJECTED", ...op });
  assert.notEqual(r1.receipt, r2.receipt); const dd = J(path.join(d, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")); assert.equal(dd.assets.find((a) => a.id === "pilot_hand_grip").approved_review_id, null);
  const h = reviewHistory(d, "asset", "pilot_hand_grip"); assert.ok(h.length >= 3, `history ${h.length}`); for (const x of h) assert.ok(fs.existsSync(path.join(d, "reviews", `${x.receipt_id}.json`)));
});
test("H5 API reviews are DIAGNOSTIC; production refuses non-human approvals; human attestation cannot be minted without an interactive operator", async () => {
  const r = J(path.join(rt.film, "reviews", `${asset("pilot_hand_open").approved_review_id}.json`)); assert.equal(r.reviewer_kind, "DIAGNOSTIC");
  const p = await runCheck({ root: rt.film, manifest: "handoff/ART_AND_MOTION_MANIFEST_V2.json", production: true });
  assert.ok(p.errors.some((e) => e.code === "UNAPPROVED_ART" && /human/i.test(e.human_readable_reason)), JSON.stringify(p.errors.slice(0, 3)));
  const I = await import("../../engine/art_bridge/art_intake.mjs");
  await assert.rejects(() => I.reviewPart({ film: rt.film, asset: "pilot_hand_open", verdict: "APPROVED", reviewer: "human", human: true }), /interactive|TTY|attest/i);
});
test("B2-d REAL Ines contract: forearm + elbow underpaint ingest with linked ownership and BELOW order; removing the link is refused", async () => {
  const { inesUnderpaintContract } = await import("./p01_probes.mjs"); const r = await inesUnderpaintContract(path.join(W, "ines_contract"));
  assert.deepEqual(r.steps, { master: "REGISTERED_PENDING_REVIEW", review: "APPROVED", underpaint: "REGISTERED_PENDING_REVIEW", forearm: "REGISTERED_PENDING_REVIEW" });
  assert.deepEqual(r.forearm.hidden_surfaces, ["elbow_inner_sleeve"]); assert.deepEqual(r.forearm.underpaint_asset_ids, ["ines_elbow_r_underpaint"]);
  assert.equal(r.underpaint.kind, "UNDERPAINT"); assert.ok(r.underpaint.draw_order.some((o) => o.relation === "BELOW" && o.asset_id === "ines_forearm_r"));
  assert.equal(r.forearm_missing_underpaint_errors, 0); assert.match(r.refusal_without_link, /MISSING_UNDERPAINT/);
});
