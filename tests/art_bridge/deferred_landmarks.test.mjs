// A landmark on a face the canonical master view cannot show may be deferred ONLY to a named alternate-view asset derived from that master,
// with a face and a reason; it is recorded as not measured.
import { test } from "node:test"; import assert from "node:assert/strict";
import { deferredLandmarks } from "../../engine/art_bridge/art_intake.mjs";
const plan = { assets: [{ asset_id: "P.MASTER" }, { asset_id: "P.alternate_views", derived_from: "P.MASTER" }, { asset_id: "Q.alt", derived_from: "Q.MASTER" }] };
test("DL-1 deferral to the master's own alternate view is recorded as unmeasured; anything else refuses", () => {
  const ok = deferredLandmarks({ lm: { deferred_landmarks: { LENS: { to_asset: "P.alternate_views", face: "back", reason: "rear lens" } } }, plan, asset: "P.MASTER" });
  assert.equal(ok.LENS.status, "DEFERRED_TO_ALTERNATE_VIEW_NOT_MEASURED");
  for (const bad of [{ to_asset: "Q.alt", face: "back", reason: "x" }, { to_asset: "P.alternate_views", face: "", reason: "x" }, { to_asset: "P.alternate_views", face: "back" }, { to_asset: "nope", face: "back", reason: "x" }])
    assert.throws(() => deferredLandmarks({ lm: { deferred_landmarks: { LENS: bad } }, plan, asset: "P.MASTER" }), (e) => e.code === "UNREGISTERED_PIVOT");
  assert.deepEqual(deferredLandmarks({ lm: {}, plan, asset: "P.MASTER" }), {});
});
