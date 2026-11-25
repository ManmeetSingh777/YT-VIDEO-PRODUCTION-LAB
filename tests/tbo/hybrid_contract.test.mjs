// HYBRID_CONTRACT v1 against the P05 DIAGNOSTIC packet fixture: a supported decoder/host/dialogue set passes in principle with only
// external authority pending (no approved host, no recorded voice); each removal or contradiction yields its typed refusal.
import test from "node:test"; import assert from "node:assert/strict";
import fs from "node:fs"; import os from "node:os"; import path from "node:path";
import { buildPacket } from "../p05/packet_fixture.mjs";
import { packetDigest } from "../../engine/story/creative_packet.mjs";
import { hybridPreflight } from "../../engine/story/hybrid_contract.mjs";
import { main } from "../../engine/tools/creative_handoff.mjs";
import { TEACHING_MODEL } from "./tbo_fixtures.mjs";

const clone = (o) => JSON.parse(JSON.stringify(o));
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tbo-hybrid-")), packet = buildPacket(dir);
const flowShot = packet.shots.find((s) => s.id === "sh_flow"); if (!flowShot.content_kinds.includes("quantity_change")) flowShot.content_kinds.push("quantity_change"); // directed as data for this fixture
const hybrid = () => ({ version: "1.0.0", film_id: packet.film_id, packet_sha256: packetDigest(packet),
  claims: [{ id: "c_model", text: "teaching model, not a forecast", mode: "M", source: null, shot_ids: ["sh_flow"] }],
  decoders: [{ id: "dec_net", shot_id: "sh_flow", action_id: "a_flow", model_card: clone(TEACHING_MODEL), output: "net", unit: "USD/day", symbol_art_id: "token", scenario_keys: [[460, "baseline"], [520, "discount", "sine.inOut"], [580, "better", "sine.inOut"]], baseline_xy: [960, 700], px_per_unit: 0.5, displays: [{ value_ref: "net", shown_provenance: "MODEL_DERIVED" }] }],
  hosts: [{ id: "host_breach", shot_id: "sh_pull", frames: [100, 260], band: "FOCAL", host_asset: { status: "PENDING" }, camera: { type: "ORTHO", location: [0, -10, 3.68], rotation_euler_deg: [75, 0, 0], ortho_scale: 6 }, ground: { z: 0 }, contact_points: [{ id: "sole_l", object: "HOST_SOLE_L" }],
    calibration_landmarks: [{ id: "k1", world: [-2, 0, 0], plate_art_id: "room_far", landmark: "tl" }, { id: "k2", world: [2, 0, 0], plate_art_id: "room_far", landmark: "tr" }], performance: [{ frames: [100, 180], action: "step_in", intent: "steps into the frozen room" }] }],
  dialogue: [{ line_id: "l1", speaker: "nova", text: "Wait. Why is the money going down?", frames: [30, 110], audio_file: null, alignment_file: null, mouth_scheme: "REST_MID_OPEN", limited_mouth_approved: true }] });
const inv = (r) => r.feedback.map((f) => f.failed_invariant);

test("HYBRID_CONTRACT: a supported set is feasible in principle; only external authority (host asset, recorded voice) is pending", () => {
  const r = hybridPreflight(packet, hybrid(), { sourceDir: dir });
  assert.equal(r.hybrid_feasible, true, JSON.stringify(r.feedback.filter((f) => f.needed_change_type !== "AUTHORITY_REQUIRED")));
  assert.equal(r.authority_pending, true);
  assert.deepEqual([...new Set(inv(r))].sort(), ["DIALOGUE_AUDIO_PRESENT", "HOST_ASSET_APPROVED"]);
  assert.equal(r.ledger.decoders[0].producer, "engine/decoder/model_bar.mjs#compileModelBars");
});
test("HYBRID_CONTRACT negatives: each contradiction names its invariant and owner", () => {
  const cases = [
    ["stale packet binding", (h) => { h.packet_sha256 = "0".repeat(64); }, "HYBRID_BOUND_TO_PACKET"],
    ["decoder on a non-procedural action", (h) => { h.decoders[0].action_id = "a_pull"; }, "DECODER_ACTION_PROCEDURAL"],
    ["decoder symbol is not a SYMBOL drawing", (h) => { h.decoders[0].symbol_art_id = "room_far"; }, "DECODER_SYMBOL_ART"],
    ["static number, no change", (h) => { h.decoders[0].scenario_keys = [[460, "baseline"]]; }, "DECODER_SHOWS_A_CHANGE"],
    ["scenario breaks kitchen capacity", (h) => { h.decoders[0].scenario_keys.push([590, "discount_more_volume"]); }, "MODEL_CONSTRAINTS_HOLD"],
    ["model value labelled as documented fact", (h) => { h.decoders[0].displays[0].shown_provenance = "REAL_DOCUMENTED"; }, "DISPLAY_PROVENANCE_HONEST"],
    ["documented input without a sourced F claim", (h) => { const v = h.decoders[0].model_card.variables[0]; v.provenance = "REAL_DOCUMENTED"; v.claim_id = "c_model"; v.source = "x"; }, "MODEL_DOCUMENTED_HAS_SOURCE"],
    ["F claim without source", (h) => { h.claims[0].mode = "F"; }, "CLAIM_TRUTH_UNVERIFIED"],
    ["perspective host camera", (h) => { h.hosts[0].camera.type = "PERSP"; }, "HOST_CAMERA_ORTHO"],
    ["calibration on an unrequested landmark", (h) => { h.hosts[0].calibration_landmarks[1].landmark = "floor_mark"; }, "HOST_WORLD_CALIBRATED"],
    ["host outside its shot", (h) => { h.hosts[0].frames = [200, 400]; }, "HOST_FRAMES_IN_SHOT"],
    ["undirected host acting", (h) => { h.hosts[0].performance = []; }, "HOST_PERFORMANCE_DIRECTED"],
    ["limited mouth not approved", (h) => { h.dialogue[0].limited_mouth_approved = false; }, "DIALOGUE_MOUTH_SCHEME_APPROVED"],
    ["unknown speaker", (h) => { h.dialogue[0].speaker = "mia"; }, "DIALOGUE_SPEAKER_EXISTS"],
  ];
  for (const [name, mut, want] of cases) { const h = hybrid(); mut(h); const r = hybridPreflight(packet, h, { sourceDir: dir }); assert.ok(inv(r).includes(want), `${name}: expected ${want}, got ${inv(r)}`); }
  // a camera move over the host interval is a missing engine producer, not a silent slide
  const p2 = clone(packet); p2.shots.find((s) => s.id === "sh_pull").camera.moves = [{ frames: [0, 270], operation: "PUSH", purpose: "push in" }];
  const h2 = hybrid(); h2.packet_sha256 = packetDigest(p2); const r2 = hybridPreflight(p2, h2, { sourceDir: dir });
  assert.ok(r2.feedback.some((f) => f.failed_invariant === "HOST_CAMERA_MATCHED" && f.needed_change_type === "MISSING_ENGINE_PRODUCER"));
});
test("creative_handoff hybrid-preflight CLI", async () => {
  const pf = path.join(dir, "CREATIVE_PACKET.json"), hf = path.join(dir, "HYBRID_CONTRACT.json"); fs.writeFileSync(pf, JSON.stringify(packet)); fs.writeFileSync(hf, JSON.stringify(hybrid()));
  const lines = []; const code = await main(["hybrid-preflight", "--packet", pf, "--hybrid", hf, "--sources", dir], (s) => lines.push(s));
  assert.equal(code, 0); assert.equal(JSON.parse(lines[0]).hybrid_feasible, true);
});
