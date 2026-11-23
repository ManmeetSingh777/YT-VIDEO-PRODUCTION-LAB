// EVIDENCE / PROVIDER-purpose methods, implemented for their actual purpose (not as drawing functions):
// F18 coverage states (separate, never collapsed); F17 whole-look proof record (real pixels, error at whole-visual level first);
// F50 adversarial transfer matrix (PROMPT_ONLY | VISIBLE_BUT_WEAK | VISIBLE_PASS | NOT_APPLICABLE; QUALIFIED only with outputs + look tests);
// F36 per-shot machine-readable contract (only applicable methods; placeholders refused); F49 world-system ArtJob strict compile;
// F56/F80 first-pass control: in CODE-NATIVE mode (spec §4) the invariant is that the first construction job's DESIGN CONTRACT carries the
// selected unlike native witnesses (verified files + sha256) and the chosen positive decisions, and that those decisions appear in the
// executed producer calls BEFORE the first render. A provider image request is compiled only as COMPILED_WITH_IMAGES_NOT_SUBMITTED.
import { registerProducer } from "./emit.mjs";
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { need } from "./core.mjs";
import { receipts } from "./emit.mjs";

const SKILL = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../../reference/construct-kurzgesagt-art");
export const COVERAGE = ["DECODED", "TIMELINE_VISUALLY_VIEWED", "NATIVE_ART_INSPECTED", "CONSTRUCTION_METHOD_MAPPED", "GENERATED_OUTPUT_TESTED"];
export const TRANSFER = ["PROMPT_ONLY", "VISIBLE_BUT_WEAK", "VISIBLE_PASS", "NOT_APPLICABLE"];
const PLACEHOLDER = /\b(tbd|todo|placeholder|describe|lorem|example|e\.g\.)\b|\[.*?\]/i;

/** F18: per-interval coverage record; a claim of NATIVE_ART_INSPECTED needs per-frame records — a frame-file count is never enough */
function coverageLedger__impl(entries) {
  const out = entries.map((e) => { need("F18 entry", e, { source: "str", frames: "arr", states: "arr" }); for (const s of e.states) if (!COVERAGE.includes(s)) throw new Error(`F18: unknown coverage state ${s}`);
    if (e.states.includes("NATIVE_ART_INSPECTED") && !(e.inspected || []).length) throw new Error(`F18 ${e.source}: NATIVE_ART_INSPECTED requires per-frame inspection records`); return e; });
  return { method: "F18", data: Object.fromEntries(COVERAGE.map((s) => [s, out.filter((e) => e.states.includes(s)).reduce((a, e) => a + (s === "NATIVE_ART_INSPECTED" ? e.inspected.length : e.frames.length), 0)])) };
}

/** F17: whole-look proof record — requires real pixel files (hashed) and errors named at whole-visual level, then high-salience part */
function wholeLookRecord__impl(r) {
  need("F17 record", r, { subject: "str", pixels: "arr", whole_level_errors: "arr", part_level_errors: "arr", producing_operation_for_each_error: "obj" });
  const hashes = r.pixels.map((p) => { if (!fs.existsSync(p)) throw new Error(`F17: pixel file ${p} does not exist — inspect real pixels`); return { file: p, sha256: crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex") }; });
  for (const e of [...r.whole_level_errors, ...r.part_level_errors]) if (!r.producing_operation_for_each_error[e]) throw new Error(`F17: error "${e}" has no producing operation named`);
  return { method: "F17", data: { subject: r.subject, pixels: hashes, verdict: "RECORDED_NOT_APPROVED" } };
}

/** F50: transfer acceptance matrix — QUALIFIED only with actual outputs and independent look tests across the six classes */
function transferMatrix__impl(rows) {
  const req = ["abstract_physical", "abstract_relational", "dense_organism", "built_world", "contained_world", "low_detail_counterexample"];
  for (const r of rows) { need("F50 row", r, { test: req, method: "str", state: TRANSFER }); if (r.state === "VISIBLE_PASS" && !(r.output && fs.existsSync(r.output))) throw new Error(`F50: ${r.test}/${r.method} VISIBLE_PASS without an actual output file`); }
  const covered = new Set(rows.filter((r) => r.state === "VISIBLE_PASS").map((r) => r.test));
  return { method: "F50", data: { qualified: req.every((t) => covered.has(t)) && rows.every((r) => r.independent_look_test === true || r.state !== "VISIBLE_PASS"), missing: req.filter((t) => !covered.has(t)) } };
}

/** F36: per-shot contract; only methods the router marked applicable; every field concrete */
function shotContract__impl(c, applicable) {
  need("F36 contract", c, { beat_id: "str", story_truth: "str", medium_tree: "arr", source_methods: "arr", source_witnesses: "arr", unlike_counterexample: "str", subjects: "arr", change_states: "arr", unverified: "arr" });
  for (const [k, v] of Object.entries(c)) if (typeof v === "string" && PLACEHOLDER.test(v)) throw new Error(`F36: field ${k} is a placeholder`);
  const extra = c.source_methods.filter((m) => !applicable.includes(m)); if (extra.length) throw new Error(`F36: methods ${extra.join(",")} are not applicable to this beat (a universal dump overdesigns)`);
  if (c.source_witnesses.length < 2) throw new Error("F36: at least two unlike source witnesses");
  return { method: "F36", data: { ...c, status: "METHOD_CANDIDATE" } };
}

/** F49: world-system ArtJob strict compile */
function compileWorldJob__impl(j) {
  need("F49 job", j, { world_class: "str", world_purpose: "str", substrate: "str", coord_system: "str", regions: "arr", parts: "arr", relationships: "arr", detail_generators: "arr", material_ownership: "arr", effect_ownership: "arr", visibility_masks: "arr", focal_read_test: "str", native_crop_tests: "arr", source_only_witnesses: "arr", allowed_subject_ids: "arr", forbidden_extras: "arr", content_noncopy_invariants: "arr" });
  const ids = new Set(j.parts.map((p) => p.id));
  for (const r of j.relationships) if (!ids.has(r.from) || !ids.has(r.to)) throw new Error(`F49: relationship ${r.from}→${r.to} endpoint is not a parts[].id`);
  for (const e of j.effect_ownership) need("F49 effect", e, { owner: "str", kind: "str", allowed_region: "str", count_or_coverage_limit: "str", forbidden_regions: "str" });
  for (const x of [...j.parts, ...j.regions]) for (const v of Object.values(x)) if (typeof v === "string" && /(specific novel geometry|complete new shape|large enclosing silhouette)/i.test(v)) throw new Error("F49: illustrative schema text left in a real job");
  if (j.source_only_witnesses.length < 2) throw new Error("F49: ≥2 unlike style-only witnesses");
  return { method: "F49", data: { status: "COMPILED", note: "a compiled job is a specification, not OUTPUT_DEMONSTRATED" } };
}

/** F56/F80 code-native first-pass control: witnesses verified on disk against the skill manifest; decisions must be bound to producer calls */
function firstPassControl__impl(c) {
  need("F80 control", c, { causal_frame_geometry: "obj", witnesses: "arr", chosen_methods: "arr", decisions: "arr", style_only: "bool" });
  if (!c.style_only) throw new Error("F80: witnesses are STYLE ONLY, DO NOT COPY CONTENT");
  const man = JSON.parse(fs.readFileSync(path.join(SKILL, "references/QUESTION_NATIVE_WITNESS_MANIFEST.json"), "utf8")).witnesses;
  const ws = c.witnesses.map((id) => { const w = man.find((m) => m.id === id); if (!w) throw new Error(`F80: witness ${id} is not in the native manifest`);
    const f = path.join(SKILL, w.relative_path); if (!fs.existsSync(f)) throw new Error(`F80: witness file missing ${w.relative_path}`);
    const h = crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"); if (h !== w.sha256) throw new Error(`F80: witness ${id} hash mismatch`); return { id, role: w.role, film: w.film, sha256: h }; });
  if (ws.length < 2 || new Set(ws.map((w) => w.film)).size < 2) throw new Error("F80: at least two UNLIKE native witnesses (different films/roles)");
  // Gate A (§4.10): every chosen method's decision must be bound to an EXECUTED producer call whose traced reads include the decision
  // parameter. Strings describing calls that never happened are rejected. Receipts come from emit.receipts(), never from the caller.
  const executed = receipts();
  const bindings = c.decisions.map((d) => {
    need("F80 decision", d, { method: "str", decision: "str", producer: "str", param: "str" });
    if (!c.chosen_methods.includes(d.method)) throw new Error(`F80: decision for unchosen method ${d.method}`);
    const hit = executed.find((r) => r.actualProducerId === d.producer && r.actualDecisionReads.some((x) => x === d.param || x.endsWith("." + d.param) || x.includes("." + d.param + ".")));
    if (!hit) throw new Error(`F80: decision "${d.decision}" claims ${d.producer} read "${d.param}" but no executed receipt shows that read`);
    return { ...d, callId: hit.callId, implementationHash: hit.implementationHash, regions: hit.emittedRegionIds.length };
  });
  const unbound = c.chosen_methods.filter((m) => !bindings.some((d) => d.method === m)); if (unbound.length) throw new Error(`F80: chosen methods without an executed producer binding: ${unbound.join(",")}`);
  // witness hashes prove file identity only. Visual application requires recorded observations of the viewed pixels.
  const obs = (c.observations || []).filter((o) => o && o.viewed === true && typeof o.observation === "string" && o.observation.length > 20 && o.transfer && o.nonTransfer);
  const viewed = ws.every((w) => obs.some((o) => o.witnessId === w.id));
  return { method: ["F80", "F56"], data: { witnesses: ws, bindings, observations: obs, status: viewed ? "WITNESSES_VIEWED_DECISIONS_EXECUTED" : "EVIDENCE_NOT_VIEWED", artisticCertification: false } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const coverageLedger = registerProducer("provider.coverageLedger", coverageLedger__impl);
export const wholeLookRecord = registerProducer("provider.wholeLookRecord", wholeLookRecord__impl);
export const transferMatrix = registerProducer("provider.transferMatrix", transferMatrix__impl);
export const shotContract = registerProducer("provider.shotContract", shotContract__impl);
export const compileWorldJob = registerProducer("provider.compileWorldJob", compileWorldJob__impl);
export const firstPassControl = registerProducer("provider.firstPassControl", firstPassControl__impl);
