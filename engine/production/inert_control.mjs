// INERT_CONTROL differential (P02 directive F088 / P02-R22). A decision is LIVE only if perturbing it changes what its declared consumer
// actually produces: a compiled request field, an asset demand, a motion/render state the browser applies, or rendered pixels. Logging a
// rule, recording a method name or adding a JSON field is not enough. Each probe runs the REAL consumer twice (base vs perturbed copy of the
// film) and compares the consumer's output; no change → INERT_CONTROL with the decision, consumer and evidence hashes.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "../art_bridge/errors.mjs";
import { createAssetRegistry } from "../art_bridge/asset_registry.mjs";
import { compileMotionTracks } from "../art_bridge/temporal.mjs";
import { composeShot } from "../art_bridge/scene_graph.mjs";
import { withEffects } from "../film/chrome_frames.mjs";
import { compileAttention } from "../story/experience.mjs";
import { deriveArtDemands } from "../art_bridge/art_demand.mjs";
import { attentionTracks, loadContext } from "./stages.mjs";
const sha = (v) => crypto.createHash("sha256").update(typeof v === "string" || Buffer.isBuffer(v) ? v : JSON.stringify(v)).digest("hex"), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const MF = "handoff/ART_AND_MOTION_MANIFEST_V2.json";
/** copy a film (excluding heavy outputs) and apply a mutation(FILM) */
export function perturbedCopy(FILM, dest, mutate) { fs.rmSync(dest, { recursive: true, force: true }); fs.cpSync(FILM, dest, { recursive: true, filter: (s) => !/^(render|production|qa)([\\/]|$)/.test(path.relative(FILM, s)) }); mutate(dest); return dest; }
/** CONSUMERS: each returns a hashable observation of the consumer's REAL output */
export const CONSUMERS = {
  /** the motion/render state the browser applies (scene frameState rows incl. effects) at the given frames */
  async render_state(FILM, { planFile = "handoff/MOTION_PLAN.json", frames }) {
    const reg = await createAssetRegistry(FILM, MF, { production: false }), doc = reg.doc, plan = J(path.join(FILM, planFile)), C = compileMotionTracks(doc.actions, doc.shots, { doc, plan });
    const scenes = doc.shots.map((s, k) => ({ s, sc: withEffects(composeShot(s, reg, C, { prefix: `s${k}-` }), plan.effects, reg, s.id, `s${k}-`) }));
    return frames.map((f) => { const x = scenes.find(({ s }) => s.start_frame <= f && f < s.end_frame); return [f, sha(x.sc.frameState(f).rows)]; });
  },
  /** the exact compiled first-stage request text for a planned asset (real compiler: engine/art_bridge/art_requests.mjs#compileArtJob) */
  async request_prompt(FILM, { asset }) {
    const { planJobs } = await import("../art_bridge/art_intake.mjs"), { compileArtJob } = await import("../art_bridge/art_requests.mjs"), { jobs } = await planJobs({ film: FILM }), job = jobs.find((j) => j.root_dependency === asset);
    const out = path.join(FILM, ".inert_probe", asset); fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true });
    compileArtJob(job, { film: FILM, outDir: out, repairMemory: path.join(FILM, "learning", "REPAIR_MEMORY.json") }); const f = fs.readdirSync(out).includes("STAGE_01_REQUEST.json") ? path.join(out, "STAGE_01_REQUEST.json") : null;
    return f ? J(f).prompt : null;
  },
  /** attention owners S02 binds per shot */
  attention(FILM) { const ctx = loadContext(FILM), tr = attentionTracks(ctx); return (ctx.score?.shots || []).map((sh) => { const r = compileAttention((sh.attention_path || []).map((el, i) => ({ id: `${sh.shot}.a${i}`, frames: sh.frames, primary_focus: el })), tr); return [sh.shot, r.attention_beats.map((b) => b.owners), r.errors.map((e) => e.code)]; }); },
  /** the art demand set S04 derives */
  art_demand(FILM) { const ctx = loadContext(FILM), d = deriveArtDemands({ doc: ctx.doc, plan: ctx.plan, motionPlans: Object.fromEntries(Object.entries(ctx.motionPlans).filter(([k]) => k !== "_film")) }); return d.demands.map((x) => [x.asset, x.frames, x.supplied_by_plan]); },
};
/** differential({FILM, workDir, decision, mutate, consumer, args}) → {live, base_sha, perturbed_sha} ; throws INERT_CONTROL when nothing changed */
export async function differential({ FILM, workDir, decision, mutate, consumer, args = {}, throwOnInert = true }) {
  const base = await CONSUMERS[consumer](FILM, args), copy = perturbedCopy(FILM, path.join(workDir, decision.replace(/[^\w.-]/g, "_")), mutate), pert = await CONSUMERS[consumer](copy, args);
  const r = { decision, consumer, base_sha256: sha(base), perturbed_sha256: sha(pert), live: sha(base) !== sha(pert) };
  if (!r.live && throwOnInert) throw err("INERT_CONTROL", { record_id: decision, reason: `perturbing ${decision} did not change the output of consumer ${consumer} (a recorded choice that reaches no consumer is inert)`, producer: "engine/production/inert_control.mjs#differential", failed_invariant: "every control input reaches a consumer and changes its output", diagnostic_evidence: [r] });
  return r;
}
