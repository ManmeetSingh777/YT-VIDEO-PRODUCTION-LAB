// P02-R06 (F075/F090): the frame scan + coverage gate reject an uncovered edge, a missing required state/action, frozen motion on a moving
// interval and a broken transition/boundary — and PERMIT an intentional static hold. Runs the real renderFilm path (diagnostic renderer).
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import * as SR from "../../engine/film/segment_render.mjs";
import { coverageGate } from "../../engine/film/coverage_gate.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", ".."), W = path.join(REPO, "hybrid_v2", "work", "p02", "scan");
const size = { width: 160, height: 90 }, total = 600;
const doc = { stage: { total_frames: total, fps: 60 }, actions: [{ id: "swing", shot_id: "a", frame_range: [0, 300], actors: [], pose_events: [], view_events: [], contact_events: [] }], rigs: [], identities: [], assets: [], transitions: [], audio: {},
  shots: [{ id: "a", start_frame: 0, end_frame: 300 }, { id: "b", start_frame: 300, end_frame: 600 }] };
const index = { total, segments: [{ frames: [0, 300], shot: "a", actions: ["swing"], effects: [], static_hold: false }, { frames: [300, 600], shot: "b", actions: [], effects: [], static_hold: true }] };
async function film(tag, args = {}, t = total) { const F = path.join(W, tag); fs.rmSync(F, { recursive: true, force: true }); fs.mkdirSync(F, { recursive: true }); await SR.renderFilm({ film: F, revision: { digest: tag }, ...size, total: t, chunkSize: 300, rendererArgs: args, outName: "f.mp4" }); return F; }

test("P02-R06 positive: moving interval changes pixels; a static hold may repeat pixels without failing", async () => {
  const F = await film("ok", { frozenFrom: null }), r = coverageGate({ FILM: F, index, doc }); assert.equal(r.ok, true, JSON.stringify(r.failures)); assert.equal(r.frames_hashed, total);
  // the diagnostic renderer's held frames (frozenFrom inside a declared static hold) — the expected state also holds there → allowed
  const H = await film("hold", { frozenFrom: 450, holdState: true }); const rh = coverageGate({ FILM: H, index, doc });
  assert.ok(!rh.failures.some((f) => f.code === "INERT_ACTION_INTERVAL" && f.frame_ranges[0][0] === 300), "a declared static hold is not a frozen action");
});
test("P02-R06 negatives: frozen moving interval, missing frames/state, uncovered edge, broken boundary", async () => {
  const Z = await film("frozen", { frozenFrom: 120 }), rz = coverageGate({ FILM: Z, index, doc });
  assert.ok(rz.failures.some((f) => f.code === "FROZEN_FRAME"), "expected state changes while pixels repeat → FROZEN_FRAME"); assert.equal(rz.ok, false);
  const S = await film("short", {}, 450), rs = coverageGate({ FILM: S, index, doc }); assert.ok(rs.failures.some((f) => f.code === "COVERAGE_GAP" && /no rendered hash/.test(f.reason)));
  const doc2 = { ...doc, actions: [...doc.actions, { id: "late_grip", shot_id: "b", frame_range: [700, 720], actors: [], pose_events: [], view_events: [], contact_events: [] }] }; assert.ok(coverageGate({ FILM: (await film("ok2")), index, doc: doc2 }).failures.some((f) => f.record_id === "late_grip"), "an action outside the rendered film is uncovered");
  const edge = Buffer.alloc(160 * 90 * 3, 40); for (let y = 0; y < 90; y++) { const i = (y * 160) * 3; edge[i] = 255; edge[i + 1] = 0; edge[i + 2] = 255; } assert.equal(SR.frameDefects(edge, size).kind, "UNCOVERED_EDGE");
  const full = path.join(W, "ok2"), tdoc = { ...doc, transitions: [{ from_shot: "a", to_shot: "b", frame_range: [590, 610] }] }, rt = coverageGate({ FILM: full, index, doc: tdoc });
  assert.ok(rt.failures.some((f) => f.record_id === "a->b" && f.code === "COVERAGE_GAP"), "a transition interval that leaves the rendered film is broken"); assert.equal(coverageGate({ FILM: full, index, doc: { ...doc, transitions: [{ from_shot: "a", to_shot: "b", frame_range: [290, 310] }] } }).ok, true, "a rendered transition interval passes");
});
