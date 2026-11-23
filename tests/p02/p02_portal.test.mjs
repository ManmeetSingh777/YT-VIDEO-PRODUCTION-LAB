// P02-PORTAL-INTAKE (F105/F106): a continuous portal's OUT/MIDDLE/IN plates and aperture mask enter through the REAL intake
// (ingestMaster + reviewMaster), satisfy the transition's art demand, compile with ZERO shared-anchor drift on every transition frame, and are
// emitted as runtime layers; a missing mask, a plate without the shared landmark, or an unplanned plate is refused.
process.env.ART_BRIDGE_TEST_TRUST = "1";
import test, { before } from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { addPortal } from "./portal_fixture.mjs";
import { compileTransition } from "../../engine/art_bridge/transitions.mjs";
import { deriveArtDemands } from "../../engine/art_bridge/art_demand.mjs";
import { createAssetRegistry } from "../../engine/art_bridge/asset_registry.mjs";
import { compileMotionTracks } from "../../engine/art_bridge/temporal.mjs";
import { composeShot } from "../../engine/art_bridge/scene_graph.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "portal"), MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
let F;
before(async () => { fs.rmSync(W, { recursive: true, force: true }); const { runRoundTrip } = await import("../art_bridge/roundtrip_fixture.mjs"); const rt = await runRoundTrip(path.join(W, "rt")); F = rt.film; const r = await addPortal(F);
  for (const [id, x] of Object.entries(r)) assert.equal(x.status, "REGISTERED_PENDING_REVIEW", `${id} registered through ingestMaster`); });

test("P02-PORTAL-INTAKE plates + mask registered by intake satisfy the demand and compile with zero anchor drift; layers reach the scene", async () => {
  const doc = J(path.join(F, MF)), plan = J(path.join(F, "handoff", "ART_DEPENDENCY_PLAN.json")), t = doc.transitions[0];
  for (const id of ["portal_out", "portal_mid", "portal_in", "portal_aperture"]) { const a = doc.assets.find((x) => x.id === id); assert.ok(a && fs.existsSync(path.join(F, "registration", id, "MASTER_REGISTRATION_RECEIPT.json")), id); assert.ok(a.approved_review_id, `${id} reviewed`); }
  assert.deepEqual(deriveArtDemands({ doc, plan }).missing.filter((m) => /portal|::/.test(m.record_id)), [], "the portal's contract plates are all planned and delivered");
  const tr = compileTransition(doc.shots[0], doc.shots[1], t, { doc }); let worst = 0; for (let f = t.frame_range[0]; f < t.frame_range[1]; f++) worst = Math.max(worst, ...tr.frameAt(f).anchor_residuals_px);
  assert.ok(worst < 1e-6, `shared anchor drift ${worst}px`); assert.ok(tr.total_zoom > 1);
  const reg = await createAssetRegistry(F, MF, {}), C = compileMotionTracks(reg.doc.actions, reg.doc.shots, { doc: reg.doc, plan: J(path.join(F, "handoff", "MOTION_PLAN.json")) }), sc = composeShot(reg.doc.shots[0], reg, C, { prefix: "s0-" });
  const rows = (f) => sc.frameState(f).rows.filter((x) => /trans--/.test(x[0])); assert.ok(rows(3479).every((x) => x[2] === 0), "plates hidden before the transition"); assert.ok(rows(3540).every((x) => x[2] === 1), "plates shown during it"); assert.notEqual(JSON.stringify(rows(3500)), JSON.stringify(rows(3590)), "the push-through moves");
});
test("P02-PORTAL-INTAKE negatives: no mask, a plate lacking the shared landmark, an unplanned plate", () => {
  const doc = J(path.join(F, MF)), t = doc.transitions[0];
  assert.throws(() => compileTransition(doc.shots[0], doc.shots[1], { ...t, mask_or_occluder_ids: [] }, { doc }), (e) => e.code === "MISSING_TRANSITION_STATE");
  const d2 = JSON.parse(JSON.stringify(doc)); delete d2.assets.find((a) => a.id === "portal_mid").landmarks.portal_centre; assert.throws(() => compileTransition(d2.shots[0], d2.shots[1], t, { doc: d2 }), (e) => e.code === "MISSING_TRANSITION_STATE" && /portal_centre/.test(e.message));
  const plan = J(path.join(F, "handoff", "ART_DEPENDENCY_PLAN.json")); plan.assets = plan.assets.filter((a) => a.asset_id !== "portal_in"); assert.ok(deriveArtDemands({ doc, plan }).missing.some((m) => m.record_id === "portal_in"));
});
