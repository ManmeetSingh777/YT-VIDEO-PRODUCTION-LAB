// P04 §2.4: ONE verified compilation from the approved action phrases to the production motion plan. story/ACTION_PHRASES.json is the approved
// direction artifact; the renderer reads `plan.phrases`. Two disconnected authority paths are refused: a plan that carries its own phrases which
// differ from the approved file is a PLAN_AMBIGUOUS conflict, never merged silently.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
import { compilePhrase } from "../art_bridge/motion_systems.mjs";
const J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (x) => crypto.createHash("sha256").update(typeof x === "string" || Buffer.isBuffer(x) ? x : JSON.stringify(x)).digest("hex"), fsha = (f) => sha(fs.readFileSync(f));
/** every motion-plan file of the film: {shot (null = whole film), file, plan} — deterministic order */
export function listMotionPlans(FILM) { const H = path.join(path.resolve(FILM), "handoff"), out = []; if (!fs.existsSync(H)) return out; for (const x of fs.readdirSync(H).sort()) { const m = x.match(/^MOTION_PLAN(?:_(.+))?\.json$/); if (m) out.push({ shot: m[1] || null, file: x, plan: J(path.join(H, x)) }); } return out; }
/** canonical motion plan for the film (P04 §7.2): exactly one film-level plan file is authoritative; per-shot files may only add shot-scoped content */
export function resolveMotionPlan(FILM, { explicit = null } = {}) {
  const F = path.resolve(FILM), errors = [];
  if (explicit) { if (!fs.existsSync(explicit)) throw err("PLAN_MISSING", { record_id: explicit, reason: `motion plan ${explicit} does not exist` }); return { file: path.resolve(explicit), plan: J(explicit), source: "explicit", sha256: fsha(explicit) }; }
  const all = listMotionPlans(F), film = all.filter((p) => p.shot === null); // MOTION_PLAN.json is the film plan; MOTION_PLAN_<shot>.json are per-shot plans (never "competing film plans")
  if (film.length > 1) throw err("PLAN_AMBIGUOUS", { record_id: "handoff", reason: `conflicting film-level motion plans: ${film.map((p) => p.file).join(", ")}` });
  if (!film.length) throw err("PLAN_MISSING", { record_id: "handoff/MOTION_PLAN.json", reason: "no film-level motion plan (handoff/MOTION_PLAN.json): the renderer has nothing to execute" });
  const f = path.join(F, "handoff", film[0].file); return { file: f, plan: film[0].plan, source: "handoff/MOTION_PLAN.json", sha256: fsha(f), shot_plans: all.filter((p) => p.shot !== null).map((p) => p.file), errors };
}
/** approved phrases (story/ACTION_PHRASES.json) → the production plan; the plan that renders is returned with its provenance */
export function compileProductionPlan(FILM, { explicit = null, phrasesFile = "story/ACTION_PHRASES.json" } = {}) {
  const F = path.resolve(FILM), r = resolveMotionPlan(F, { explicit }), pf = path.join(F, phrasesFile), errors = [];
  if (!fs.existsSync(pf)) return { ...r, phrases_source: null, errors };
  const approved = J(pf), own = (r.plan.phrases || []), canon = (x) => JSON.stringify(x, Object.keys(x).sort());
  if (own.length && JSON.stringify(own) !== JSON.stringify(approved)) errors.push(err("PLAN_AMBIGUOUS", { record_id: "plan.phrases", reason: `the motion plan carries ${own.length} phrase(s) that differ from the approved ${phrasesFile}: two disconnected authority paths are refused (remove plan.phrases; the approved file compiles into the production plan)` }));
  for (const ph of approved) { const c = compilePhrase(ph); if (!c.ok) errors.push(err("PHRASE_UNEXECUTABLE", { record_id: ph.id, reason: c.failures.map((x) => `${x.code}: ${x.reason}`).join("; "), producer: "engine/story/motion_plan_source.mjs#compileProductionPlan" })); }
  const plan = { ...r.plan, phrases: approved }; void canon;
  return { ...r, plan, phrases_source: { file: phrasesFile, sha256: fsha(pf), phrases: approved.map((p) => p.id) }, plan_sha256: sha(plan), errors };
}
