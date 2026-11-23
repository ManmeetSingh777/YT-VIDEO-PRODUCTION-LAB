// DIAGNOSTIC renderer fixtures (sessions, same contract as engine/film/segment_render.mjs#RENDERERS): used only to prove that the REAL render
// path detects defects. blackAt30: the flat pattern with one all-black frame (30). nondeterministic: pixels depend on a per-session random salt.
import crypto from "node:crypto";
import { diagnosticFlatSession } from "../../engine/film/segment_render.mjs";
export const blackAt30 = (args = {}) => diagnosticFlatSession({ ...args, blackAt: 30 });
export async function nondeterministic(args = {}) {
  const base = await diagnosticFlatSession(args), salt = crypto.randomBytes(1)[0] | 1;
  return { ...base, info: { renderer: "fixture_nondeterministic", provenance: "DIAGNOSTIC_ONLY" }, async renderFrame(f) { const o = await base.renderFrame(f); o.rgb[0] = (o.rgb[0] + salt) & 255; return o; } };
}
