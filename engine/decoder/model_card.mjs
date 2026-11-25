// Strategy-decoder MODEL CARD (Better One quality gate TBO-G15; Channel Bible §8.4–§8.6; production master §H).
// A model card is the ONLY source of every number a decoder graphic may show. It declares input variables (value, unit, provenance,
// claim reference), formulas over them (a small, safe expression language — no eval), constraints (capacity, non-negativity, …) and
// named scenarios (overrides of inputs). evaluateModel() recomputes every formula from the inputs with dimensional analysis, carries
// provenance to every output and refuses (typed) instead of clamping when a scenario breaks a constraint. The engine authors no
// economics: the card comes from the approved creative packet / model card JSON that GPT + the user produced and approved.
import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";

/** provenance classes (production master §H). MODEL_DERIVED is reserved for formula outputs; an input can never claim it. */
export const PROVENANCE = Object.freeze(["REAL_DOCUMENTED", "FICTIONAL_WORLD", "HYPOTHETICAL_PARAMETER", "MODEL_DERIVED"]);
export const OUTCOME_CLASSES = Object.freeze(["DEMONSTRATED_IN_MODEL", "PLAUSIBLE_EXTERNALLY", "EVIDENCE_BACKED_EXTERNALLY", "UNKNOWN"]);
const ID = /^[A-Za-z][A-Za-z0-9_]{0,63}$/;
const PR = "engine/decoder/model_card.mjs";

const canon = (v) => Array.isArray(v) ? `[${v.map(canon).join(",")}]` : v && typeof v === "object" ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(",")}}` : JSON.stringify(v);
/** content digest of a card: any changed input, formula, constraint or scenario changes it (stale-evidence detection, TBO-G19) */
export const modelDigest = (card) => crypto.createHash("sha256").update(canon(card)).digest("hex");

/* ───────────── units: "USD/meal", "meal/day", "USD*meal^-1", "1" (dimensionless) ───────────── */
export function parseUnit(s) {
  if (typeof s !== "string" || !s.trim()) throw err("DECODER_MODEL_INVALID", { reason: `unit must be a non-empty string ("1" for dimensionless), got ${JSON.stringify(s)}`, producer: `${PR}#parseUnit` });
  const u = {}, add = (b, e) => { if (b === "1") return; if (!ID.test(b)) throw err("DECODER_MODEL_INVALID", { reason: `bad unit symbol "${b}" in "${s}"`, producer: `${PR}#parseUnit` }); u[b] = (u[b] || 0) + e; if (!u[b]) delete u[b]; };
  const [num, ...den] = s.replace(/\s+/g, "").split("/");
  const term = (t, sign) => { for (const f of t.split("*")) { const m = f.match(/^([A-Za-z0-9_]+)(?:\^(-?\d+))?$/); if (!m) throw err("DECODER_MODEL_INVALID", { reason: `cannot parse unit factor "${f}" in "${s}"`, producer: `${PR}#parseUnit` }); add(m[1], sign * (m[2] ? +m[2] : 1)); } };
  term(num, 1); for (const d of den) term(d, -1);
  return u;
}
const umul = (a, b, k = 1) => { const o = { ...a }; for (const [x, e] of Object.entries(b)) { o[x] = (o[x] || 0) + k * e; if (!o[x]) delete o[x]; } return o; };
const ueq = (a, b) => { const ka = Object.keys(a), kb = Object.keys(b); return ka.length === kb.length && ka.every((k) => a[k] === b[k]); };
export const unitString = (u) => { const p = Object.entries(u).filter(([, e]) => e > 0).sort().map(([b, e]) => (e === 1 ? b : `${b}^${e}`)), n = Object.entries(u).filter(([, e]) => e < 0).sort().map(([b, e]) => (e === -1 ? b : `${b}^${-e}`)); return `${p.join("*") || "1"}${n.length ? "/" + n.join("/") : ""}`; };

/* ───────────── expression language: + - * / unary-, parentheses, min(a,b,…) max(…) abs(x); constraints add < <= > >= == ───────────── */
function tokenize(src) {
  const out = [], re = /\s*(?:(\d+(?:\.\d+)?(?:e[+-]?\d+)?)|([A-Za-z][A-Za-z0-9_]*)|(<=|>=|==|[-+*/(),<>]))/y; let i = 0;
  while (i < src.length) { if (/\s/.test(src[i])) { i++; continue; } re.lastIndex = i; const m = re.exec(src); if (!m) throw err("DECODER_MODEL_INVALID", { reason: `unexpected character "${src[i]}" at ${i} in "${src}"`, producer: `${PR}#tokenize` }); out.push(m[1] !== undefined ? { t: "num", v: +m[1] } : m[2] !== undefined ? { t: "id", v: m[2] } : { t: "op", v: m[3] }); i = re.lastIndex; }
  return out;
}
/** parse(src) → AST; grammar: cmp := sum [(<|<=|>|>=|==) sum]; sum := prod {(+|-) prod}; prod := unary {(*|/) unary}; unary := -unary | atom */
export function parseExpr(src, { allowCompare = false } = {}) {
  const tk = tokenize(String(src)); let p = 0;
  const peek = () => tk[p], eat = (v) => { const t = tk[p]; if (!t || (v && t.v !== v)) throw err("DECODER_MODEL_INVALID", { reason: `expected ${v ?? "a term"} at token ${p} in "${src}"`, producer: `${PR}#parseExpr` }); p++; return t; };
  const atom = () => { const t = eat(); if (t.t === "num") return { k: "num", v: t.v }; if (t.t === "id") { if (peek()?.v === "(") { eat("("); const args = [sum()]; while (peek()?.v === ",") { eat(","); args.push(sum()); } eat(")"); if (!["min", "max", "abs"].includes(t.v)) throw err("DECODER_MODEL_INVALID", { reason: `unknown function ${t.v}() in "${src}" (min, max, abs only)`, producer: `${PR}#parseExpr` }); if (t.v === "abs" && args.length !== 1) throw err("DECODER_MODEL_INVALID", { reason: `abs() takes one argument in "${src}"`, producer: `${PR}#parseExpr` }); return { k: "fn", f: t.v, args }; } return { k: "ref", id: t.v }; } if (t.v === "(") { const e = sum(); eat(")"); return e; } throw err("DECODER_MODEL_INVALID", { reason: `unexpected "${t.v}" in "${src}"`, producer: `${PR}#parseExpr` }); };
  const unary = () => { if (peek()?.v === "-") { eat("-"); return { k: "neg", a: unary() }; } return atom(); };
  const prod = () => { let a = unary(); while (["*", "/"].includes(peek()?.v)) { const o = eat().v; a = { k: o, a, b: unary() }; } return a; };
  const sum = () => { let a = prod(); while (["+", "-"].includes(peek()?.v)) { const o = eat().v; a = { k: o, a, b: prod() }; } return a; };
  let e = sum(); if (["<", "<=", ">", ">=", "=="].includes(peek()?.v)) { if (!allowCompare) throw err("DECODER_MODEL_INVALID", { reason: `comparison is only allowed in a constraint: "${src}"`, producer: `${PR}#parseExpr` }); const o = eat().v; e = { k: "cmp", o, a: e, b: sum() }; }
  if (p !== tk.length) throw err("DECODER_MODEL_INVALID", { reason: `trailing tokens in "${src}"`, producer: `${PR}#parseExpr` });
  return e;
}
const refsOf = (n, s = new Set()) => { if (n.k === "ref") s.add(n.id); for (const c of [n.a, n.b, ...(n.args || [])]) if (c) refsOf(c, s); return s; };
/** evaluate an AST over env {id: {value, unit}} → {value, unit}; addition/comparison/min/max demand identical units */
function evalNode(n, env, where) {
  const bad = (reason) => { throw err("DECODER_MODEL_INVALID", { record_id: where, reason, producer: `${PR}#evaluate` }); };
  switch (n.k) {
    case "num": return { value: n.v, unit: {} };
    case "ref": { const x = env[n.id]; if (!x) bad(`unknown symbol ${n.id}`); return x; }
    case "neg": { const a = evalNode(n.a, env, where); return { value: -a.value, unit: a.unit }; }
    case "*": { const a = evalNode(n.a, env, where), b = evalNode(n.b, env, where); return { value: a.value * b.value, unit: umul(a.unit, b.unit) }; }
    case "/": { const a = evalNode(n.a, env, where), b = evalNode(n.b, env, where); if (b.value === 0) bad("division by zero"); return { value: a.value / b.value, unit: umul(a.unit, b.unit, -1) }; }
    case "+": case "-": { const a = evalNode(n.a, env, where), b = evalNode(n.b, env, where); if (!ueq(a.unit, b.unit)) throw err("DECODER_MODEL_INVALID", { record_id: where, reason: `unit mismatch: ${unitString(a.unit)} ${n.k} ${unitString(b.unit)}`, producer: `${PR}#evaluate`, details: { failed_invariant: "MODEL_UNITS_CONSISTENT" } }); return { value: n.k === "+" ? a.value + b.value : a.value - b.value, unit: a.unit }; }
    case "fn": { const xs = n.args.map((c) => evalNode(c, env, where)); if (xs.some((x) => !ueq(x.unit, xs[0].unit))) throw err("DECODER_MODEL_INVALID", { record_id: where, reason: `${n.f}() arguments have different units`, producer: `${PR}#evaluate`, details: { failed_invariant: "MODEL_UNITS_CONSISTENT" } }); const v = xs.map((x) => x.value); return { value: n.f === "abs" ? Math.abs(v[0]) : Math[n.f](...v), unit: xs[0].unit }; }
    case "cmp": { const a = evalNode(n.a, env, where), b = evalNode(n.b, env, where); if (!ueq(a.unit, b.unit)) throw err("DECODER_MODEL_INVALID", { record_id: where, reason: `unit mismatch in comparison: ${unitString(a.unit)} vs ${unitString(b.unit)}`, producer: `${PR}#evaluate`, details: { failed_invariant: "MODEL_UNITS_CONSISTENT" } }); const ok = { "<": a.value < b.value, "<=": a.value <= b.value + 1e-12, ">": a.value > b.value, ">=": a.value >= b.value - 1e-12, "==": Math.abs(a.value - b.value) <= 1e-9 * Math.max(1, Math.abs(a.value)) }[n.o]; return { ok, lhs: a.value, rhs: b.value, unit: a.unit }; }
  }
  return bad(`bad node ${n.k}`);
}

/**
 * validateModelCard(card) → {ok, errors:[BridgeError], order:[formula ids in dependency order]}
 * card = { id, version, objective, truth_mode ("M"), outcome_classification, variables:[{id, label, value, unit, provenance, claim_id?, source?, range?:[lo,hi]}],
 *          formulas:[{id, label, expr, unit}], constraints:[{id, expr, reason}], scenarios:[{id, label, overrides:{varId:value}, status}], assumptions:[text], counterexamples:[text] }
 */
export function validateModelCard(card) {
  const errors = [], E = (record_id, reason, inv) => errors.push(err("DECODER_MODEL_INVALID", { record_id, reason, producer: `${PR}#validateModelCard`, details: { failed_invariant: inv } }));
  if (!card || typeof card !== "object") return { ok: false, errors: [err("DECODER_MODEL_INVALID", { reason: "no model card", producer: `${PR}#validateModelCard` })], order: [] };
  if (!ID.test(card.id || "")) E(card.id ?? null, "model id missing or invalid", "MODEL_ID");
  if (card.truth_mode !== "M") E(card.id, `a decoder model is a model/scenario (truth mode M), got ${JSON.stringify(card.truth_mode)}: a simulation never presents itself as documented fact`, "MODEL_TRUTH_MODE");
  if (!OUTCOME_CLASSES.includes(card.outcome_classification)) E(card.id, `outcome_classification must be one of ${OUTCOME_CLASSES.join(", ")}`, "MODEL_OUTCOME_CLASSIFIED");
  if (!Array.isArray(card.assumptions) || !card.assumptions.length) E(card.id, "a model card states its assumptions (Bible §8.4)", "MODEL_ASSUMPTIONS_STATED");
  if (!Array.isArray(card.counterexamples) || !card.counterexamples.length) E(card.id, "a model card states at least one counterexample / failure condition (Bible §8.4.9)", "MODEL_COUNTEREXAMPLE_STATED");
  const ids = new Set();
  for (const v of card.variables || []) {
    if (!ID.test(v.id || "") || ids.has(v.id)) E(v.id ?? null, "variable id missing, invalid or duplicated", "MODEL_SYMBOL_UNIQUE"); ids.add(v.id);
    if (!Number.isFinite(v.value)) E(v.id, "variable value must be a finite number", "MODEL_INPUT_NUMERIC");
    try { parseUnit(v.unit); } catch (e) { E(v.id, e.human_readable_reason || e.message, "MODEL_UNIT_PARSE"); }
    if (!PROVENANCE.includes(v.provenance)) E(v.id, `provenance must be one of ${PROVENANCE.join(", ")}`, "MODEL_PROVENANCE_DECLARED");
    if (v.provenance === "MODEL_DERIVED") E(v.id, "an input variable cannot be MODEL_DERIVED: only formula outputs are derived", "MODEL_PROVENANCE_DECLARED");
    if (v.provenance === "REAL_DOCUMENTED" && !(v.claim_id && v.source)) E(v.id, "a REAL_DOCUMENTED input names its claim_id and source (claim ledger, Bible §8.2)", "MODEL_DOCUMENTED_HAS_SOURCE");
    if (v.range && !(Array.isArray(v.range) && v.range.length === 2 && v.range[0] <= v.value && v.value <= v.range[1])) E(v.id, "range must be [lo, hi] containing the baseline value", "MODEL_RANGE_VALID");
  }
  const fids = new Set(), deps = new Map();
  for (const f of card.formulas || []) {
    if (!ID.test(f.id || "") || ids.has(f.id) || fids.has(f.id)) E(f.id ?? null, "formula id missing, invalid or colliding with another symbol", "MODEL_SYMBOL_UNIQUE"); fids.add(f.id);
    try { parseUnit(f.unit); } catch (e) { E(f.id, e.human_readable_reason || e.message, "MODEL_UNIT_PARSE"); }
    try { deps.set(f.id, [...refsOf(parseExpr(f.expr))]); } catch (e) { E(f.id, e.human_readable_reason || e.message, "MODEL_EXPRESSION_PARSES"); }
  }
  for (const [f, rs] of deps) for (const r of rs) if (!ids.has(r) && !fids.has(r)) E(f, `formula references unknown symbol ${r}`, "MODEL_SYMBOL_DEFINED");
  const order = [], state = new Map(), visit = (f, stack) => { if (state.get(f) === 2) return; if (state.get(f) === 1) { E(f, `formula cycle: ${[...stack, f].join(" -> ")}`, "MODEL_ACYCLIC"); return; } state.set(f, 1); for (const r of deps.get(f) || []) if (fids.has(r)) visit(r, [...stack, f]); state.set(f, 2); order.push(f); };
  for (const f of deps.keys()) visit(f, []);
  for (const c of card.constraints || []) { try { const n = parseExpr(c.expr, { allowCompare: true }); if (n.k !== "cmp") E(c.id, "a constraint is a comparison", "MODEL_CONSTRAINT_IS_COMPARISON"); for (const r of refsOf(n)) if (!ids.has(r) && !fids.has(r)) E(c.id, `constraint references unknown symbol ${r}`, "MODEL_SYMBOL_DEFINED"); } catch (e) { E(c.id, e.human_readable_reason || e.message, "MODEL_EXPRESSION_PARSES"); } if (!String(c.reason || "").trim()) E(c.id, "a constraint states the real limit it represents", "MODEL_CONSTRAINT_EXPLAINED"); }
  const sids = new Set();
  for (const s of card.scenarios || []) { if (!ID.test(s.id || "") || sids.has(s.id)) E(s.id ?? null, "scenario id missing, invalid or duplicated", "MODEL_SCENARIO_UNIQUE"); sids.add(s.id); for (const k of Object.keys(s.overrides || {})) { if (!ids.has(k)) E(s.id, `scenario overrides ${k}, which is not an input variable (formula outputs are never overridden)`, "MODEL_OVERRIDE_IS_INPUT"); else if (!Number.isFinite(s.overrides[k])) E(s.id, `override ${k} must be a finite number`, "MODEL_INPUT_NUMERIC"); } if (!OUTCOME_CLASSES.includes(s.status)) E(s.id, `scenario status must be one of ${OUTCOME_CLASSES.join(", ")}`, "MODEL_OUTCOME_CLASSIFIED"); }
  if (!sids.has("baseline")) E(card.id, "a model card has a scenario named baseline (the story's starting state)", "MODEL_BASELINE_PRESENT");
  return { ok: !errors.length, errors, order };
}

/**
 * evaluateModel(card, scenarioId) → { scenario, digest, values: {id: {value, unit, provenance, inputs, assumption_inputs}}, constraints: [{id, ok, lhs, rhs, reason}] }
 * Throws DECODER_MODEL_INVALID for a broken card and MODEL_CONSTRAINT_VIOLATED when the scenario breaks a declared limit
 * (never clamps: a capacity overflow is a story fact the creative author must face, not something the renderer hides).
 */
export function evaluateModel(card, scenarioId = "baseline", { allowViolations = false } = {}) {
  const V = validateModelCard(card); if (!V.ok) { const e = V.errors[0]; e.errors = V.errors; throw e; }
  const sc = card.scenarios.find((s) => s.id === scenarioId); if (!sc) throw err("DECODER_MODEL_INVALID", { record_id: scenarioId, reason: `model ${card.id} has no scenario ${scenarioId}`, producer: `${PR}#evaluateModel` });
  const env = {}, values = {};
  for (const v of card.variables) { const value = sc.overrides?.[v.id] ?? v.value; if (v.range && (value < v.range[0] || value > v.range[1])) throw err("MODEL_CONSTRAINT_VIOLATED", { record_id: `${scenarioId}.${v.id}`, reason: `scenario sets ${v.id}=${value}, outside its declared range [${v.range.join(", ")}]`, producer: `${PR}#evaluateModel`, details: { failed_invariant: "MODEL_INPUT_IN_RANGE" } }); env[v.id] = { value, unit: parseUnit(v.unit) }; values[v.id] = { value, unit: unitString(env[v.id].unit), provenance: v.provenance, overridden: sc.overrides?.[v.id] !== undefined, inputs: [v.id], assumption_inputs: v.provenance === "REAL_DOCUMENTED" ? [] : [v.id] }; }
  const byId = new Map(card.formulas.map((f) => [f.id, f]));
  for (const id of V.order) { const f = byId.get(id), n = parseExpr(f.expr), r = evalNode(n, env, id), want = parseUnit(f.unit);
    if (!ueq(r.unit, want)) throw err("DECODER_MODEL_INVALID", { record_id: id, reason: `formula ${id} computes ${unitString(r.unit)} but declares ${unitString(want)}`, producer: `${PR}#evaluateModel`, details: { failed_invariant: "MODEL_UNITS_CONSISTENT" } });
    if (!Number.isFinite(r.value)) throw err("DECODER_MODEL_INVALID", { record_id: id, reason: `formula ${id} is not finite`, producer: `${PR}#evaluateModel` });
    env[id] = r; const ins = [...refsOf(n)].flatMap((x) => values[x].inputs); const asm = [...refsOf(n)].flatMap((x) => values[x].assumption_inputs);
    values[id] = { value: r.value, unit: unitString(r.unit), provenance: "MODEL_DERIVED", formula: f.expr, inputs: [...new Set(ins)].sort(), assumption_inputs: [...new Set(asm)].sort() }; }
  const constraints = (card.constraints || []).map((c) => ({ id: c.id, reason: c.reason, ...evalNode(parseExpr(c.expr, { allowCompare: true }), env, c.id) }));
  const broken = constraints.filter((c) => !c.ok);
  if (broken.length && !allowViolations) throw err("MODEL_CONSTRAINT_VIOLATED", { record_id: `${scenarioId}.${broken[0].id}`, reason: `scenario ${scenarioId} violates ${broken.map((c) => `${c.id} (${c.reason}: ${+c.lhs.toFixed(6)} vs ${+c.rhs.toFixed(6)})`).join("; ")} — the model never clamps; revise the scenario or model the limit`, producer: `${PR}#evaluateModel`, details: { failed_invariant: "MODEL_CONSTRAINTS_HOLD", broken } });
  return { model: card.id, scenario: scenarioId, scenario_status: sc.status, digest: modelDigest(card), values, constraints };
}

/** sensitivity(card, outputId, inputId, deltas) → [{input_value, output}] around the baseline, refusing scenarios that break constraints */
export function sensitivity(card, outputId, inputId, deltas, scenarioId = "baseline") {
  const sc = card.scenarios.find((s) => s.id === scenarioId), base = card.variables.find((v) => v.id === inputId);
  if (!base) throw err("DECODER_MODEL_INVALID", { record_id: inputId, reason: `no input ${inputId}`, producer: `${PR}#sensitivity` });
  return deltas.map((d) => { const x = (sc?.overrides?.[inputId] ?? base.value) + d, probe = { ...card, scenarios: [...card.scenarios, { id: "sensitivity_probe", label: "sensitivity probe", overrides: { ...(sc?.overrides || {}), [inputId]: x }, status: "DEMONSTRATED_IN_MODEL" }] };
    try { return { input_value: x, output: evaluateModel(probe, "sensitivity_probe").values[outputId].value, ok: true }; } catch (e) { return { input_value: x, output: null, ok: false, code: e.code, reason: e.human_readable_reason || e.message }; } });
}

/**
 * displayLabelAudit(card, displays) — a decoder may only label a shown value with the provenance the MODEL computed for it.
 * displays: [{value_ref, shown_provenance}] → typed DECODER_INERT_OR_MISLEADING errors (fiction/assumption shown as documented fact, etc.)
 */
export function displayLabelAudit(card, displays, scenarioId = "baseline") {
  const R = evaluateModel(card, scenarioId, { allowViolations: true }), out = [];
  for (const d of displays) { const v = R.values[d.value_ref]; if (!v) { out.push(err("DECODER_INERT_OR_MISLEADING", { record_id: d.value_ref, reason: `display shows ${d.value_ref}, which the model does not define`, producer: `${PR}#displayLabelAudit`, details: { failed_invariant: "DISPLAY_VALUE_FROM_MODEL" } })); continue; }
    if (d.shown_provenance !== v.provenance) out.push(err("DECODER_INERT_OR_MISLEADING", { record_id: d.value_ref, reason: `display labels ${d.value_ref} as ${d.shown_provenance} but the model classifies it ${v.provenance}${v.assumption_inputs.length ? ` (depends on assumptions ${v.assumption_inputs.join(", ")})` : ""}`, producer: `${PR}#displayLabelAudit`, details: { failed_invariant: "DISPLAY_PROVENANCE_HONEST" } })); }
  return out;
}
