// Typed story-claim / causal-mechanism contract (directive G1; F012, F016, F033). evaluateMechanism is ONE deterministic evaluator used by
// both the animated diagram and the truth tests: a visualization may be stylized but may not invert causality. Counterfactual tests and
// obstacle resolutions are checked against the evaluated state, never against dialogue.
import { err } from "../art_bridge/errors.mjs";

/* safe arithmetic over named variables: + - * / ^ ( ) min max abs, numbers, identifiers. No eval. */
export function compileExpr(src) {
  const toks = String(src).match(/\s*([0-9]*\.?[0-9]+(?:e[-+]?\d+)?|[A-Za-z_][A-Za-z0-9_]*|[-+*/^(),])\s*/gy);
  if (!toks || toks.join("").replace(/\s/g, "") !== String(src).replace(/\s/g, "")) throw err("SCHEMA_VIOLATION", { reason: `unparseable expression ${src}` });
  const t = toks.map((x) => x.trim()); let i = 0;
  const peek = () => t[i], eat = (x) => { if (t[i] !== x) throw err("SCHEMA_VIOLATION", { reason: `expected ${x} in ${src}` }); i++; };
  const prim = () => { const x = t[i++]; if (x === "(") { const v = add(); eat(")"); return v; } if (x === "-") { const v = prim(); return (e) => -v(e); }
    if (/^[0-9.]/.test(x)) { const n = +x; return () => n; }
    if (["min", "max", "abs"].includes(x)) { eat("("); const args = [add()]; while (peek() === ",") { i++; args.push(add()); } eat(")"); return (e) => Math[x](...args.map((a) => a(e))); }
    return (e) => { if (!(x in e)) throw err("SCHEMA_VIOLATION", { reason: `unknown variable ${x} in ${src}` }); return e[x]; }; };
  const pow = () => { let a = prim(); while (peek() === "^") { i++; const b = prim(), A = a; a = (e) => A(e) ** b(e); } return a; };
  const mul = () => { let a = pow(); while (["*", "/"].includes(peek())) { const op = t[i++], b = pow(), A = a; a = op === "*" ? (e) => A(e) * b(e) : (e) => A(e) / b(e); } return a; };
  const add = () => { let a = mul(); while (["+", "-"].includes(peek())) { const op = t[i++], b = mul(), A = a; a = op === "+" ? (e) => A(e) + b(e) : (e) => A(e) - b(e); } return a; };
  const f = add(); if (i !== t.length) throw err("SCHEMA_VIOLATION", { reason: `trailing tokens in ${src}` }); return f;
}

/** evaluateMechanism(mech, inputs, t) → {stocks, flows} at time t (seconds). mech = {stocks:{name:init}, parameters:{}, flows:[{id, from|null, to|null, rate, kind}]}
 *  inputs(t) → exogenous variables (e.g. n_events_per_s). Deterministic fixed-step integration (dt from mech, default 1/60 s). */
export function evaluateMechanism(mech, inputs, t) {
  const dt = mech.dt ?? 1 / 60, steps = Math.round(t / dt), stocks = { ...mech.stocks }, flows = mech.flows.map((f) => ({ ...f, fn: compileExpr(f.rate) }));
  let last = {};
  for (let k = 0; k <= steps; k++) {
    const env = { ...mech.parameters, ...stocks, ...inputs(k * dt), t: k * dt }; last = {};
    for (const f of flows) { const r = f.fn(env); if (!Number.isFinite(r)) throw err("MECHANISM_CONTRADICTION", { record_id: f.id, reason: `flow ${f.id} is not finite at t=${k * dt}` }); last[f.id] = r; }
    if (k === steps) break;
    for (const f of flows) { const q = last[f.id] * dt; if (f.from) stocks[f.from] -= q; if (f.to) stocks[f.to] += q; }
  }
  return { t, stocks, flows: last };
}
const REL = { ">": (a, b) => a > b, "<": (a, b) => a < b, ">=": (a, b) => a >= b, "<=": (a, b) => a <= b, "==": (a, b) => Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b)), "!=": (a, b) => Math.abs(a - b) > 1e-9 * Math.max(1, Math.abs(b)) };
/** runCounterfactuals(mech) → failures: each test {id, inputs:{var: value|[[t,v]...]}, at_t, expect:[{flow|stock, rel, value}]} */
export function runCounterfactuals(mech) {
  const out = [];
  for (const c of mech.counterfactuals || []) { const inp = (tt) => Object.fromEntries(Object.entries(c.inputs).map(([k, v]) => [k, Array.isArray(v) ? v.filter(([t0]) => t0 <= tt).at(-1)?.[1] ?? 0 : v]));
    const s = evaluateMechanism(mech, inp, c.at_t);
    for (const e of c.expect) { const got = e.flow ? s.flows[e.flow] : s.stocks[e.stock]; if (got === undefined || !REL[e.rel](got, e.value)) out.push({ code: "MECHANISM_CONTRADICTION", counterfactual: c.id, target: e.flow || e.stock, expected: `${e.rel} ${e.value}`, got, reason: c.claim || "" }); } }
  return out;
}
const CLAIM_KEYS = ["claim_id", "script_span", "citation", "verification_status", "entities", "causal_hypothesis", "variables", "predicted_observables", "viewer_should_infer"];
/** validateStoryContract(sc) → {status, failures}: unverified claims are FACT_CHECK_REQUIRED; mechanisms must survive their counterfactuals;
 *  obstacles marked RESOLVED must be supported by the evaluated mechanism state */
export function validateStoryContract(sc) {
  const f = [], mechs = new Map((sc.mechanisms || []).map((m) => [m.mechanism_id, m]));
  for (const c of sc.claims || []) { const miss = CLAIM_KEYS.filter((k) => c[k] === undefined || c[k] === "" || (Array.isArray(c[k]) && !c[k].length)); if (miss.length) f.push({ code: "SCHEMA_VIOLATION", record_id: c.claim_id, reason: `claim lacks ${miss}` });
    if (c.verification_status !== "VERIFIED") f.push({ code: "FACT_CHECK_REQUIRED", record_id: c.claim_id, reason: `claim "${c.script_span}" is ${c.verification_status || "unverified"}; it cannot be rendered as truth` });
    if (c.mechanism_id && !mechs.has(c.mechanism_id)) f.push({ code: "SCHEMA_VIOLATION", record_id: c.claim_id, reason: `mechanism ${c.mechanism_id} missing` }); }
  for (const m of mechs.values()) { for (const k of ["linked_claims", "mappings", "permitted_simplification", "counterfactuals"]) if (!m[k] || (Array.isArray(m[k]) && !m[k].length)) f.push({ code: "SCHEMA_VIOLATION", record_id: m.mechanism_id, reason: `mechanism lacks ${k}` });
    f.push(...runCounterfactuals(m).map((x) => ({ ...x, record_id: m.mechanism_id }))); }
  for (const o of sc.obstacles || []) { if (!["RESOLVED", "UNRESOLVED"].includes(o.status)) f.push({ code: "SCHEMA_VIOLATION", record_id: o.id, reason: "obstacle status" });
    if (o.status === "RESOLVED") { const m = mechs.get(o.evidence?.mechanism_id), ev = o.evidence; if (!m || !ev) { f.push({ code: "OBSTACLE_UNRESOLVED", record_id: o.id, reason: "declared resolved without mechanism evidence" }); continue; }
      const s = evaluateMechanism(m, () => ev.inputs || {}, ev.at_t), got = ev.flow ? s.flows[ev.flow] : s.stocks[ev.stock]; if (!REL[ev.rel](got, ev.value)) f.push({ code: "OBSTACLE_UNRESOLVED", record_id: o.id, reason: `resolution claims ${ev.flow || ev.stock} ${ev.rel} ${ev.value}; mechanism gives ${got}` }); }
    if (!o.audience_visible_evidence) f.push({ code: "OBSTACLE_UNRESOLVED", record_id: o.id, reason: "no audience-visible evidence" }); }
  return { status: f.length ? "NOT_APPROVABLE" : "APPROVABLE_PENDING_HUMAN_REVIEW", failures: f };
}
