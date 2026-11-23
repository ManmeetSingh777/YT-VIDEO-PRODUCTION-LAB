// Gate A regression cases (CLAUDE_STAGE1_IMPLEMENTATION_ORDER.md, Gate A 1–6). Run: node engine/methods/proofs/gateA.mjs
// Each case states the audited failure and asserts the corrected behaviour on LIVE code. Writes evidence/stage1/GATE_A.json.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import * as E from "../emit.mjs";
import { solvePalette, emitEdges, deriveAdjacency } from "../palette.mjs";
import { constructSilhouette, silhouetteElement } from "../contour.mjs";
import { prove } from "../proof.mjs";
import { buildStateFamily } from "../states.mjs";
import { compileWorldJob, transferMatrix, firstPassControl } from "../provider.mjs";
import { allocate } from "../density.mjs";
import { generateRepeats } from "../repeat.mjs";
import { assemble } from "../topology.mjs";
import { ownLayers } from "../layers.mjs";
import { render, pixelDiff } from "../render.mjs";

const OUT = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "evidence", "stage1"); fs.mkdirSync(OUT, { recursive: true });
const results = [];
const kase = (id, before, fn) => { let after, pass; try { after = fn(); pass = after.pass; } catch (e) { after = { detail: `unexpected: ${e.message}` }; pass = false; } results.push({ id, before, after: after.detail, pass }); console.log(`${pass ? "PASS" : "FAIL"}  ${id}\n      after: ${after.detail}`); };
const throws = (f) => { try { f(); return null; } catch (e) { return e.message.split("\n")[0].slice(0, 170); } };
const ring = (pts, ch = []) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "smooth" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: ch[i]?.[0] ?? "convex", amount: ch[i]?.[1] ?? 0.1 })) });
const SQ = (x, y, w, h, id = "a") => ({ view: "front", identity: [id], ...ring([[id, x, y, "corner"], ["b", x + w, y, "corner"], ["c", x + w, y + h, "corner"], ["d", x, y + h, "corner"]], [["straight", 0], ["straight", 0], ["straight", 0], ["straight", 0]]) });

// 1. forged provenance
kase("A1 forged mint / naked path cannot reach renderer", "mint('F99','totallyInvented',{d}) reached compose(): mint only checked a non-empty string + 'M' prefix",
  () => {
    const forged = throws(() => E.emitRegion("F99", "totallyInvented", { id: "blob", d: "M0,0 L10,0 L10,10 Z", fill: "#ff0000" }));
    const naked = throws(() => E.compose("x", [{ id: "blob", d: "M0,0 L10,0 L10,10 Z", fill: "#ff0000" }]));
    const unknownProducer = throws(() => E.registerProducer("x.totallyInvented", () => 1));
    const legit = silhouetteElement("ok", constructSilhouette(SQ(0, 0, 50, 40)), solvePalette({ situation: "quiet_light_field", roles: { s: { slot: "main_subject", hue: 200, chroma: 0.1, owners: ["ok"], L: 0.5 } }, pairs: [] }).roles.s);
    const composed = E.compose("legit", [legit]).elements.length === 1;
    return { pass: !!forged && !!naked && !!unknownProducer && composed, detail: `F99 emit refused: "${forged}" | naked object refused: "${naked?.slice(0, 80)}" | unknown producer refused: "${unknownProducer?.slice(0, 70)}" | registered contour composes: ${composed}` };
  });
// 2. impossible palette / edge channel
kase("A2 impossible contrast refused; edge relation creates owned boundary geometry", "solvePalette returned pass:false yet roles were accepted by assertSolved; 'edge' channel reported success with no geometry",
  () => {
    const impossible = throws(() => solvePalette({ situation: "quiet_light_field", roles: { a: { slot: "main_subject", hue: 90, chroma: 0.02, owners: ["x"], L: 0.95 }, b: { slot: "primary_substrate", hue: 90, chroma: 0.02, owners: ["bg"] } }, pairs: [{ a: "a", b: "b", channel: "luminance", min: 25, adjust: "a" }] }));
    const pal = solvePalette({ situation: "quiet_light_field", roles: { body: { slot: "main_subject", hue: 250, chroma: 0.1, owners: ["body"], L: 0.55 }, panel: { slot: "material_light_plane", hue: 245, chroma: 0.09, owners: ["panel"], L: 0.6 }, trim: { slot: "shadow_anchor", hue: 260, chroma: 0.05, owners: ["trim"], L: 0.2 } }, pairs: [{ a: "panel", b: "body", channel: "edge", min: 0, owner: "panel", width: 3, colorRole: "trim" }] });
    const body = silhouetteElement("body", constructSilhouette(SQ(100, 100, 200, 150)), pal.roles.body, 0), panel = silhouetteElement("panel", constructSilhouette(SQ(150, 130, 80, 60, "p")), pal.roles.panel, 1);
    const noGeom = throws(() => emitEdges(pal, {}));
    const ed = emitEdges(pal, { "panel/body": { regionA: panel, regionB: body, owner: "panel" } });
    const adj = deriveAdjacency([body, panel]);
    const dr0 = render(E.compose("e0", [body, panel]), { W: 200, H: 150, view: [80, 80, 260, 200] }), dr1 = render(E.compose("e1", [body, panel, ...ed.elements]), { W: 200, H: 150, view: [80, 80, 260, 200] });
    const diff = pixelDiff(dr0, dr1);
    return { pass: !!impossible && !!noGeom && ed.elements.length >= 1 && diff > 0 && adj.length === 1, detail: `impossible contrast throws: "${impossible?.slice(0, 90)}" | edge without geometry throws: "${noGeom?.slice(0, 80)}" | edge regions ${ed.elements.length}, changed px ${diff}, derived adjacency ${JSON.stringify(adj)}` };
  });
// 3. zero-perturbation proofs / validation reads
kase("A3 zero-perturbation proof cannot pass; validation-only read is not consumption", "F49/F50 PASSed with perturb=[]; need() reads counted as 'consumed'",
  () => {
    const p = prove({ method: "F01", class: "GEOMETRY", base: SQ(0, 0, 10, 10), producer: (d) => ({ elements: [silhouetteElement("q", constructSilhouette(d), "#000000")] }), inputs: ["landmarks"], perturb: [] });
    const v = prove({ method: "F49", class: "EVIDENCE_GATE", base: { a: 1, b: "x" }, producer: (d) => { (function check(o) { if (typeof o.b !== "string") throw new Error("b"); })(d); return { data: { ok: 1 } }; }, inputs: ["b"], refuse: [] });
    return { pass: !p.pass && p.problems.some((x) => /no causal perturbation/.test(x)) && !v.pass, detail: `empty-perturb geometry proof pass=${p.pass} (${p.problems.join("; ")}) | evidence proof with no accept/refusal pass=${v.pass} (${v.problems.join("; ")})` };
  });
// 4a. F14 tests its own routing
kase("A4a F14 state routing tested on its own table", "F14's only causal test perturbed the BODY producer, not the CHANGE table",
  () => {
    const pal = solvePalette({ situation: "quiet_light_field", roles: { s: { slot: "main_subject", hue: 200, chroma: 0.1, owners: ["x"], L: 0.5 } }, pairs: [] });
    const prod = (x) => ({ elements: [silhouetteElement("blob", constructSilhouette(SQ(0, 0, x.w, 40)), pal.roles.s)], landmarks: { a: [0, 0], b: [x.w, 0] } });
    const fam = (cls, grow) => buildStateFamily({ id: "f", producer: prod, canonical: { w: 50 }, anchors: ["a"], tolerance: 1, states: [{ id: "s1", change: cls, patch: (x) => ({ w: x.w + grow }) }] });
    const swollen = fam("soft_swell", 20).data.table[0], rigid = fam("minor_rigid", 0).data.table[0];
    const lightWithGeom = throws(() => fam("material_light", 20)), swellNoRedraw = throws(() => fam("soft_swell", 0));
    return { pass: swollen.ownsNewDrawing && !rigid.ownsNewDrawing && !!lightWithGeom && !!swellNoRedraw, detail: `soft_swell→ownsNewDrawing ${swollen.ownsNewDrawing}; minor_rigid→${rigid.ownsNewDrawing}; material_light with geometry change refused: ${!!lightWithGeom}; soft_swell without redraw refused: ${!!swellNoRedraw}` };
  });
// 4b. F49 / F50 behavioural record evidence
kase("A4b F49/F50 produce behavioural records (accept + refuse), not refusal-only passes", "F49/F50 PASS rested on refusals with zero causal tests",
  () => {
    const WJ = { world_class: "SCENIC_NATURAL", world_purpose: "wells share one aquifer", substrate: "soil cross-section", coord_system: "side-on layered", regions: [{ id: "soil", shape: "stratified polygon" }], parts: [{ id: "well" }, { id: "aquifer" }], relationships: [{ from: "well", to: "aquifer", type: "draws" }], detail_generators: [], material_ownership: [], effect_ownership: [{ owner: "aquifer", kind: "flow band", allowed_region: "aquifer lumen", count_or_coverage_limit: "one band", forbidden_regions: "sky" }], visibility_masks: ["soil"], focal_read_test: "well-aquifer link at 160x90", native_crop_tests: ["well head"], source_only_witnesses: ["NUCLEAR@296s", "MEMORIES@62s"], allowed_subject_ids: ["well"], forbidden_extras: ["narrator"], content_noncopy_invariants: ["no source layout"] };
    const ok = compileWorldJob(WJ).data.status === "COMPILED", bad = throws(() => compileWorldJob({ ...WJ, relationships: [{ from: "well", to: "ghost", type: "x" }] }));
    const png = path.join(OUT, "..", "F05_F65_head_states.png");
    const m1 = transferMatrix([{ test: "built_world", method: "F70", state: "PROMPT_ONLY" }]).data, fake = throws(() => transferMatrix([{ test: "built_world", method: "F70", state: "VISIBLE_PASS", output: "missing.png" }]));
    const m2 = transferMatrix([{ test: "built_world", method: "F70", state: "VISIBLE_PASS", output: png, independent_look_test: false }]).data;
    return { pass: ok && !!bad && !!fake && m1.qualified === false && m2.qualified === false, detail: `F49 valid job compiles: ${ok}; broken endpoint refused: ${!!bad} | F50 PASS without file refused: ${!!fake}; with a real file but no independent look test → qualified=${m2.qualified}, missing=${m2.missing.length}` };
  });
// 4c. F53 attention moves pixels
kase("A4c F53 causal path changes visible emphasis", "viewer_first_point/causal_path validated then echoed; budgets ignored them",
  () => {
    const pal = solvePalette({ situation: "quiet_light_field", roles: { u: { slot: "main_subject", hue: 30, chroma: 0.12, owners: ["rows"], L: 0.5 } }, pairs: [] });
    const D = (path) => ({ attention: { viewer_first_point: path[0], causal_path: path, second_read_destination: "C", coefficients: { firstPointGain: 0.3, pathGain: 0.5, secondReadGain: 0.1, offPathDecay: 0.4, decisionId: "gateA.attention.coeffs" } }, t0: ["ground", "rowA", "rowB", "sky"], graph: { A: ["C"], B: ["C"], C: ["A", "B"] },
      regions: [{ id: "main", kind: "MAIN_PROOF", owner: "focal_structural" }], candidates: [{ id: "rowA", node: "A", tier: "T2", region: "main", distance_class: "near", state: "on", baseCount: 10, parent_id: "beamA", material_or_function: "rivets" }, { id: "rowB", node: "B", tier: "T2", region: "main", distance_class: "near", state: "on", baseCount: 10, parent_id: "beamB", material_or_function: "rivets" }, { id: "core", node: "C", tier: "T1", region: "main", distance_class: "near", state: "on", baseCount: 1, parent_id: "frame", material_or_function: "structure" }] });
    const unit = SQ(-1, -1, 2, 2);
    const draw = (b) => [["rowA", 100], ["rowB", 220]].flatMap(([k, y]) => generateRepeats({ id: k, parentId: k, frame: "polyline", frameData: { line: [[40, y], [400, y]], closed: false }, unit, count: b[k].count, sizeFalloff: 0, orientation: "upright", variation: 0, seed: 1, exclusions: [], layer: 1, role: "u", colors: pal.roles, scale: b[k].scale }).elements);
    const bA = allocate(D(["A"])).data.budgets, bB = allocate(D(["B"])).data.budgets;
    const iA = render(E.compose("attA", draw(bA)), { W: 220, H: 140, view: [20, 60, 400, 200] }), iB = render(E.compose("attB", draw(bB)), { W: 220, H: 140, view: [20, 60, 400, 200] });
    return { pass: bA.rowA.count > bA.rowB.count && bB.rowB.count > bB.rowA.count && pixelDiff(iA, iB) > 0, detail: `path=A → rowA ${bA.rowA.count}/rowB ${bA.rowB.count}; path=B → rowA ${bB.rowA.count}/rowB ${bB.rowB.count}; rendered px changed ${pixelDiff(iA, iB)}; T1 core kept ${bA.core.count}/${bB.core.count}` };
  });
// 5. F80 bindings from executed calls
kase("A5 F80 bindings must match executed producer receipts; hashes alone ≠ visual application", "{producer,param} strings passed although code never read those values; witness hash treated as applied source",
  () => {
    silhouetteElement("rcpt", constructSilhouette(SQ(0, 0, 30, 30)), "#123456");
    const base = { causal_frame_geometry: { bbox: [0.1, 0.1, 0.8, 0.9] }, witnesses: ["AI@35s", "MEMORIES@62s"], chosen_methods: ["F01"], style_only: true };
    const fake = throws(() => firstPassControl({ ...base, decisions: [{ method: "F01", decision: "x", producer: "contour.constructSilhouette", param: "neverReadField" }] }));
    const real = firstPassControl({ ...base, decisions: [{ method: "F01", decision: "identity landmarks", producer: "contour.constructSilhouette", param: "landmarks" }] }).data;
    return { pass: !!fake && real.bindings[0].callId > 0 && real.status === "EVIDENCE_NOT_VIEWED" && real.artisticCertification === false, detail: `fabricated binding refused: "${fake?.slice(0, 90)}" | real binding → callId ${real.bindings[0].callId}; status without viewed observations = ${real.status}` };
  });
// 6. failed child checks are non-renderable
kase("A6 failed topology / palette / contact / underpaint cannot fall through", "assemble returned pass:false, weightFailure was a data note, ownLayers returned pass:false — rendering continued",
  () => {
    const pal = solvePalette({ situation: "quiet_light_field", roles: { s: { slot: "main_subject", hue: 200, chroma: 0.1, owners: ["x"], L: 0.5 } }, pairs: [] });
    const topo = throws(() => assemble({ id: "t", distinguishes: "gate A diagnostic: detached part must fail", colors: pal.roles, parts: [{ id: "root", parent: null, design: { ...SQ(0, 0, 100, 100), landmarks: SQ(0, 0, 100, 100).landmarks }, joint_type: "rooted", fillRole: "s" }, { id: "kid", parent: "root", design: SQ(0, 0, 20, 20, "k"), socket: "k", anchor: "b", joint_type: "inserted", insertion_depth: -400, angle: 0, front: true, fillRole: "s" }] }));
    const sub = E.compose("sub", [silhouetteElement("s1", constructSilhouette(SQ(100, 100, 50, 50)), pal.roles.s)]), und = E.compose("und", [silhouetteElement("u1", constructSilhouette(SQ(0, 0, 120, 400)), pal.roles.s)]);
    const under = throws(() => ownLayers({ subject: sub, underpaint: und, motion: [{ t: 0, dx: 0, dy: 0 }, { t: 1, dx: 300, dy: 0 }], cameras: [{ t: 0, rect: [0, 0, 100, 100] }], master: [-50, -50, 800, 600] }));
    const palette = throws(() => solvePalette({ situation: "dark_field", roles: { a: { slot: "primary_substrate", hue: 1, chroma: 0.01, owners: ["bg"] }, b: { slot: "secondary_support", hue: 1, chroma: 0.01, owners: ["x"] } }, pairs: [{ a: "b", b: "a", channel: "hue", min: 179, adjust: "b" }] }));
    return { pass: !!topo && !!under && !!palette, detail: `detached joint throws: ${!!topo} | uncovered underpaint throws: "${under?.slice(0, 80)}" | unsolved hue relation throws: ${!!palette}` };
  });
fs.writeFileSync(path.join(OUT, "GATE_A.json"), JSON.stringify({ ran: new Date().toISOString(), results }, null, 1));
console.log(`\nGate A: ${results.filter((r) => r.pass).length}/${results.length} cases corrected`);
