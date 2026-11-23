// DIAGNOSTIC two-minute production-rehearsal film (P02 §15). Built ONLY through the real intake API (round-trip fixture: registered
// character parts + world plate, receipts, states, edges) in a segregated diagnostic namespace, then given the remaining human-authored
// contracts as LABELLED diagnostic stand-ins: film intent, shot score with attention paths, typed semantic actions, measured-alignment test
// fixture with a synthetic tone, a seeded particle effect (sprite = a registered asset) and a shutter-blur interval. Every file says
// DIAGNOSTIC; none of it is target art, story or narration, and none of it can cross the production preflight.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { runRoundTrip } from "../art_bridge/roundtrip_fixture.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), W = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, JSON.stringify(o, null, 1)); };
const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json", TT = { method: "TEST_TRUST", note: "P02 rehearsal DIAGNOSTIC stand-in for an independent human (namespace only)" }, op = { reviewer: "p02-rehearsal-simulated-reviewer", scope_note: "DIAGNOSTIC rehearsal only" };
export async function buildRehearsalFilm(dir) {
  const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1";
  try {
    const rt = await runRoundTrip(path.join(dir, "rt")), film = rt.film, I = await import("../../engine/art_bridge/art_intake.mjs"), C = await import("../../engine/art_bridge/art_contract.mjs");
    W(path.join(film, "story", "FILM_INTENT.json"), { provenance: "DIAGNOSTIC_FIXTURE", objectives: ["exercise S00-S09 on two unlike motion families"], audience: "pipeline auditors (not a film audience)", length_s: 120, constraints: ["no paid calls", "no human authority outside the namespace"], note: "DIAGNOSTIC stand-in for a human-supplied intent" });
    W(path.join(film, "direction", "SHOT_SCORE_60FPS.json"), { provenance: "DIAGNOSTIC_FIXTURE", fps: 60, shots: [
      { shot: "rt_shot", frames: [0, 3600], attention_path: ["pilot_rig"], events: [{ pose: "open", frame: 0 }, { pose: "grip", frame: 100 }], note: "character family: arm swing, elbow bend over underpaint, open→grip registered swap; particles; shutter blur on the fast bend" },
      { shot: "rt_world_shot", frames: [3600, 7200], attention_path: ["cam_world"], events: [], note: "world/camera family: wide → push-in on the painted plate" }] });
    W(path.join(film, "story", "SEMANTIC_ACTIONS.json"), { provenance: "DIAGNOSTIC_FIXTURE", rt_shot: [{ id: "pilot_reach", verb_class: "REACH", actor: "pilot", frames: [0, 600] }], rt_world_shot: [], rt_shot__possession: {} });
    // effects + blur are CONTRACT entries of the motion plan consumed by the Chrome renderer
    // staging (P02 finding from the recovered phase F ledger: the character shot had NO world plate, so ~98% of every frame was the uncovered-canvas
    // sentinel and S07 correctly refused it): the character acts IN the painted world, framed by a static camera that stays inside the plate;
    // the world push-in likewise stays inside the plate (zoom >= 1.9).
    { const dm = J(path.join(film, MF)); dm.shots[0].world_id = "rt_world_w"; dm.shots[0].camera_track_id = "cam_char"; dm.actions[0].actors[0].root_world_xy = [520, 430]; dm.actions[0].actors[0].root_scale = 0.5; fs.writeFileSync(path.join(film, MF), JSON.stringify(dm, null, 1)); }
    const planF = path.join(film, "handoff", "MOTION_PLAN.json"), plan = J(planF); plan.cameras.cam_world.zoom = [[3600, 1.9], [3700, 1.9], [3900, 2.6, "sine.inOut"]]; plan.cameras.cam_char = { x: [[0, 500]], y: [[0, 277.5]], zoom: [[0, 1.9]] };
    plan.effects = [{ id: "dust", shot: "rt_shot", asset_id: "pilot_underpaint", count: 12, seed: 7, frames: [600, 2400], size: [24, 24], wind: [30, -12] }];
    // blur on the MOVING elbow (300→420); phases G–K used [420,480), a held pose where blur is correctly a no-op
    plan.motion_blur = [{ frames: [360, 420], shutter: 0.5, samples: 4 }]; fs.writeFileSync(planF, JSON.stringify(plan, null, 1));
    // audio: synthetic tone + measured-alignment TEST fixture (fixture aligner honoured only under test trust in this namespace)
    const A = path.join(film, "audio"); fs.mkdirSync(A, { recursive: true }); execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-f", "lavfi", "-i", "sine=frequency=220:duration=120", path.join(A, "narration_TEST_TONE.wav")]);
    fs.writeFileSync(path.join(A, "script_TEST.txt"), "diagnostic tone"); W(path.join(A, "alignment_output_TEST.json"), [{ w: "diagnostic", start_s: 1.0, end_s: 1.5 }, { w: "tone", start_s: 61.0, end_s: 61.4 }]);
    W(path.join(A, "narration_timeline_TEST.json"), { provenance: "TEST_FIXTURE", script_sha256: fsha(path.join(A, "script_TEST.txt")), audio_sha256: fsha(path.join(A, "narration_TEST_TONE.wav")), alignment: { method: "FORCED_ALIGNMENT", tool: "fixture-aligner", tool_version: "0", confidence: 1, output_file: "audio/alignment_output_TEST.json", output_sha256: fsha(path.join(A, "alignment_output_TEST.json")), words: [{ w: "diagnostic", start_s: 1.0, end_s: 1.5 }, { w: "tone", start_s: 61.0, end_s: 61.4 }] }, cues: [{ id: "world_reveal", word_index: 1, critical: true }] });
    const d = J(path.join(film, MF)); d.audio.narration_file = "audio/narration_TEST_TONE.wav"; d.audio.narration_timeline_file = "audio/narration_timeline_TEST.json"; d.audio.script_file = "audio/script_TEST.txt"; fs.writeFileSync(path.join(film, MF), JSON.stringify(d, null, 1));
    await (await import("./portal_fixture.mjs")).addPortal(film, { review: false }); // continuous portal rt_shot→rt_world_shot through the real intake
    await reapproveDiagnostic(film);
    fs.writeFileSync(path.join(film, "REHEARSAL_LABEL.txt"), "DIAGNOSTIC PRODUCTION REHEARSAL FILM — fixture rasters, simulated reviewer (TEST_TRUST, namespace-only), synthetic tone. NOT a film, NOT target art, NOT approved by any human.\n");
    return { ...rt, film, plan: planF, audio: path.join(A, "narration_TEST_TONE.wav") };
  } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; }
}
/** the simulated reviewer (TEST_TRUST, diagnostic namespace only) approves story, direction, masters, parts, states and edges of THIS film copy */
export async function reapproveDiagnostic(film) {
  const prev = process.env.ART_BRIDGE_TEST_TRUST; process.env.ART_BRIDGE_TEST_TRUST = "1";
  try { const I = await import("../../engine/art_bridge/art_intake.mjs"), C = await import("../../engine/art_bridge/art_contract.mjs");
    for (const scope of ["story", "direction"]) await C.approveScope({ film, scope, verdict: "APPROVED", attestation: TT, ...op });
    const doc = JSON.parse(fs.readFileSync(path.join(film, MF), "utf8")), masters = new Set(doc.identities.map((i) => i.canonical_asset_id));
    for (const i of doc.identities) await I.reviewMaster({ film, identity: i.id, verdict: "APPROVED", attestation: TT, ...op });
    for (const a of doc.assets.filter((x) => !masters.has(x.id))) await I.reviewPart({ film, asset: a.id, verdict: "APPROVED", attestation: TT, ...op });
    for (const r of doc.rigs) { for (const st of r.pose_states) await I.approveState({ film, rig: r.id, state: st.id, verdict: "APPROVED", attestation: TT, ...op }); for (const e of r.allowed_state_edges) await I.approveStateEdge({ film, rig: r.id, from: e.from, to: e.to, verdict: "APPROVED", attestation: TT, ...op }); }
  } finally { process.env.ART_BRIDGE_TEST_TRUST = prev ?? ""; }
}
