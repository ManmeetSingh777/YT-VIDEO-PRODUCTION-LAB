#!/usr/bin/env node
// E01: compile the accepted performance into the executable PerformanceCommand packet + prop support contracts (engine/story/performance_packet.mjs),
// then verify through the REAL consumers: compilePerformance (all codes reported) and the runtime (temporal.mjs) on the award interval.
// Film data here: the three prop support contracts (accepted timing: MOTION_PLAN.support; award geometry: PHYSICAL_SOLVE.json) and the character
// performance profiles, which are PENDING_APPROVAL (they enter production only under a signed packet amendment — never self-approved).
//   node tools/tbo/e01_compile_performance.mjs --film films/e01 [--verify]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (r) => import(url.pathToFileURL(path.join(REPO, r))), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), H = (f) => path.join(FILM, "handoff", f), doc = J(H("ART_AND_MOTION_MANIFEST_V2.json")), plan = J(H("MOTION_PLAN.json")), phys = J(H("PHYSICAL_SOLVE.json"));
const cur = J(path.join(FILM, "creative", "CURRENT.json")), packet = J(path.join(FILM, "creative", "packets", cur.packet_sha256, "CREATIVE_PACKET.json"));
const { compilePerformancePacket } = await imp("engine/story/performance_packet.mjs");
const approvedMaster = (assetId) => !!doc.assets.find((a) => a.id === assetId)?.approved_review_id;
const T = plan.support, TOTAL = doc.stage.total_frames;
// ---- film data: support contracts ----
const award = phys.prop_support_contract.props[0]; // hands by geometry (right → grip_l), driver path, counter at 284, transfer 296 (tools/tbo/e01_solve_award.mjs)
const report = { id: "report", prop_rig_id: "PROP_REPORT", test_id: "E01-REPORT-HANDOVER", max_step_px: 4, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, human_quality_check: "the lead presents the page, Mia secures it, a shared hold, then the lead lets go; the page never jumps",
  hands: [{ ref: "CHAR_LEAD#r", prop_socket: "PROP_REPORT.edge_lead" }, { ref: "CHAR_MIA#r", prop_socket: "PROP_REPORT.edge_mia" }], surfaces: [],
  authority: [{ frames: [132, T.report.secure_mia], driver: "CHAR_LEAD#r", required_supports: [], mode: "ACTOR_DRIVEN" }, { frames: [T.report.secure_mia, T.report.driver_mia_from], driver: "CHAR_LEAD#r", required_supports: ["CHAR_MIA#r"], mode: "ACTOR_DRIVEN" },
    { frames: [T.report.driver_mia_from, T.report.lead_clear], driver: "CHAR_MIA#r", required_supports: [], mode: "ACTOR_DRIVEN" }, { frames: [T.report.lead_clear, TOTAL], driver: "CHAR_MIA#r", required_supports: [], mode: "ACTOR_DRIVEN" }] };
const phone = { id: "phone", prop_rig_id: "PROP_PHONE", test_id: "E01-PHONE-SUPPORT", max_step_px: 3, surface_tolerance_px: 1.5, settle_tolerance_px: 0.5, human_quality_check: "the regular's hand carries the phone continuously; the thumb works independently",
  hands: [{ ref: "CHAR_REGULAR#r", prop_socket: "PROP_PHONE.grip" }], surfaces: [], authority: [{ frames: [T.phone.support_interval[0], T.phone.support_interval[1]], driver: "CHAR_REGULAR#r", required_supports: [], mode: "ACTOR_DRIVEN" }] };
// ---- film data: performance profiles (PENDING_APPROVAL; values are the packet's own contact directions) ----
const layersOf = (rig, h) => { for (const a of packet.actions) for (const c of a.contact_events || []) if (c.source_socket === `${rig}.palm_${h}` && c.finger_layers) return c.finger_layers; return null; };
const prof = (rig) => ({ id: `${rig}.performance`, version: "1.0.0", actor_rig_id: rig, approval: { status: "PENDING_APPROVAL", note: "enters production only under a signed packet amendment carrying this profile" },
  timing: { acquire_ease: "sine.inOut", release_ease: "sine.inOut" }, contact: { allowed_error_px: 1.5, near_far: "HAND_IN_FRONT", prop_relation: "HELD", orient: "RELATIVE", finger_layers: Object.fromEntries(["r", "l"].map((h) => [h, layersOf(rig, h)]).filter(([, v]) => v)) } });
const profiles = Object.fromEntries(["CHAR_MIA", "CHAR_LEAD", "CHAR_REGULAR"].map((r) => [`${r}.performance`, prof(r)]));
const sourceDigest = cur.packet_sha256, decisionIds = [`packet_${cur.packet_sha256.slice(0, 12)}`];
const out = compilePerformancePacket({ doc, packet, plan, sourceDigest, decisionIds, profiles, supportContracts: [award, report, phone], approvedMaster });
// ---- verification through the real consumers ----
const PC = await imp("engine/art_bridge/performance_commands.mjs"), PS = await imp("engine/art_bridge/prop_support.mjs"), { validate } = await imp("engine/art_bridge/jsonschema.mjs");
const schemaErr = validate(J(path.join(REPO, "schemas", "performance_command_v1_1.schema.json")), out.full).map((e) => `${e.path}: ${e.msg}`).slice(0, 10);
const pc = PC.compilePerformance(doc, { ...plan, performance: { packet: out.executable, profiles, ...(out.executable_prop_support ? { prop_support: out.executable_prop_support } : {}) } }, { packetDigest: sourceDigest });
const codes = {}; for (const e of pc.errors) { const k = `${e.code}${e.details?.failed_invariant ? `:${e.details.failed_invariant}` : ""}`; (codes[k] ||= []).push(e.record_id); }
const nonApproval = Object.keys(codes).filter((k) => !/PROFILE_APPROVAL|PERFORMANCE_PROFILE_INVALID:PROFILE_APPROVAL/.test(k));
const result = { generated_by: "tools/tbo/e01_compile_performance.mjs", packet_sha256: sourceDigest, schema_errors: schemaErr, commands: { total: out.full.commands.length, executable: out.executable.commands.length }, characters: out.full.characters.map((c) => c.actor_rig_id),
  pending: out.pending, profiles_required: out.profiles_required, compile_performance: { error_codes: Object.fromEntries(Object.entries(codes).map(([k, v]) => [k, v.length])), non_approval_codes: nonApproval, sample: Object.fromEntries(nonApproval.map((k) => [k, codes[k].slice(0, 4)])) },
  coverage_summary: out.coverage.reduce((m, c) => { const k = `${c.kind}:${c.status}`; m[k] = (m[k] || 0) + 1; return m; }, {}) };
fs.writeFileSync(H("PERFORMANCE_COMMANDS.json"), JSON.stringify(out.full, null, 1)); fs.writeFileSync(H("PERFORMANCE_COMMANDS.EXECUTABLE.json"), JSON.stringify(out.executable, null, 1));
fs.writeFileSync(H("PROP_SUPPORT.json"), JSON.stringify(out.prop_support, null, 1)); fs.writeFileSync(H("PERFORMANCE_PROFILES.PENDING.json"), JSON.stringify(profiles, null, 1)); fs.writeFileSync(H("PERFORMANCE_COVERAGE.json"), JSON.stringify(out.coverage, null, 1));
// runtime verification of the award (VERIFICATION ONLY: the support contract normalized onto the measured rigs, run through temporal.mjs; not footage)
if (process.argv.includes("--verify")) { const caps = Object.fromEntries(out.executable.characters.map((c) => [c.actor_rig_id, PC.deriveCapabilityProfile(doc, c).profile]));
  const N = PS.normalizePropSupport({ schema_version: "1.1.0", props: out.prop_support.props.filter((p) => p.id === "award") }, { doc, roleOf: (rid, k) => caps[rid]?.roles?.[k]?.id ?? null });
  const { compileMotionTracks, stateAtFrame } = await imp("engine/art_bridge/temporal.mjs"); let C = null, cerr = null;
  const { executableSubset } = await imp("engine/art_bridge/executable_subset.mjs"), RT = J(H("RUNTIME_PLAN.json")), X = executableSubset(doc, { ...RT, prop_support: { props: N.props } }); result.runtime_subset = { removed_rigs: X.removed.rigs, removed_counts: Object.fromEntries(Object.entries(X.removed).map(([k, v]) => [k, v.length])) };
  const WIN = ["E01-S001-A02", "E01-S001-A04", "E01-S001-A07"], acts = X.doc.actions.filter((a) => WIN.includes(a.id)), shots = X.doc.shots.filter((s) => s.id === "E01-S001-SH01"); result.runtime_subset.window = { actions: WIN, shots: shots.map((s) => s.id), excluded_overlapping: X.doc.actions.filter((a) => !WIN.includes(a.id) && a.frame_range[0] < 342).map((a) => `${a.id} ${a.mode}`) };
  X.doc.actions = acts; X.doc.shots = shots;
  try { C = compileMotionTracks(acts, shots, { doc: X.doc, plan: X.plan, requireApproval: false, geometryOnly: true }); result.runtime_subset.deferred_art = C.deferred_art.length; } catch (e) { cerr = (e.errors || [e]).slice(0, 12).map((x) => `${x.code} ${x.record_id ?? ""} ${(x.human_readable_reason || x.message || "").slice(0, 160)}`); }
  const frames = [0, 120, 224, 225, 260, 283, 284, 290, 295, 296, 300, 305, 306, 310, 319, 320, 330, 341];
  result.runtime = { normalize_errors: N.errors.map((e) => `${e.code} ${e.human_readable_reason}`), compile_errors: cerr, frames: C ? frames.map((f) => { const s = stateAtFrame(C, f), ps = (s.prop_support || []).find((x) => x.prop === "award" || x.prop_rig === "PROP_AWARD");
    const hands = s.contacts.filter((k) => /CHAR_MIA\.palm_/.test(k.socket) && /PROP_AWARD/.test(k.target_socket || "")).map((k) => `${k.socket.split(".")[1]}→${k.target_socket.split(".")[1]}${k.locked ? "" : `(w${(+k.w).toFixed(2)})`}`);
    return { f, driver: ps?.driver ?? null, mode: ps?.mode ?? null, supports_valid: ps?.supports_valid ?? ps?.valid ?? null, hands, failures: (s.failures || []).filter((x) => /CHAR_MIA|PROP_AWARD|award/.test(`${x.record_id} ${x.human_readable_reason}`)).map((x) => x.code).slice(0, 4) }; }) : null }; }
fs.writeFileSync(H("PERFORMANCE_COMPILE_REPORT.json"), JSON.stringify(result, null, 1)); console.log(JSON.stringify(result, null, 1).slice(0, 6000));
