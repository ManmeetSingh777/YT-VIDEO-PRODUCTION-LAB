// Measures contour construction quality of the CURRENT compiler on authored designs: for spans designed as convex/concave/straight
// (no intended inflection), count curvature sign reversals and handle overshoot. Usage: node contour_quality.mjs [label]
import path from "node:path"; import url from "node:url"; import fs from "node:fs";
import { buildRing } from "../contour.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), DP = path.join(here, "..", "evidence", "stage1", "DECISION_PLANS");
const H = await import(url.pathToFileURL(path.join(DP, "hydrologist.mjs"))), { FACE } = await import(url.pathToFileURL(path.join(DP, "hydrologist_face.mjs")));
const { solveSkeleton, placeLandmark } = await import("../figure.mjs");
const bez = (s, t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * s.p0[k] + 3 * u * u * t * s.c1[k] + 3 * u * t * t * s.c2[k] + t * t * t * s.p1[k]); };
function spanStats(s) { const P = Array.from({ length: 41 }, (_, i) => bez(s, i / 40)); let rev = 0, last = 0; for (let i = 1; i < 40; i++) { const a = [P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]], b = [P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]], c = a[0] * b[1] - a[1] * b[0]; if (Math.abs(c) < 1e-3) continue; const sg = Math.sign(c); if (last && sg !== last) rev++; last = sg; } return rev; }
function spanStatsN(s) { const P = Array.from({ length: 41 }, (_, i) => bez(s, i / 40)); let rev = 0, last = 0; for (let i = 1; i < 40; i++) { const a = [P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]], b = [P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]], la = Math.hypot(...a), lb = Math.hypot(...b); if (!la || !lb) continue; const c = (a[0] * b[1] - a[1] * b[0]) / (la * lb); if (Math.abs(c) < 2e-3) continue; const sg = Math.sign(c); if (last && sg !== last) rev++; last = sg; } return rev; }
const rings = [];
const W = solveSkeleton(H.skeleton(), H.poseFor("A"));
for (const m of H.plan("A", {}).masses) { const L = Object.fromEntries(m.landmarks.map((l) => [l.id, { id: l.id, joint: l.jointType || "smooth", p: placeLandmark(W, H.skeleton(), l) }])); rings.push([`body.${m.id}`, L, m.spans]); }
for (const [v, d] of Object.entries(FACE.skullByView)) rings.push([`skull.${v}`, Object.fromEntries(d.landmarks.map((l) => [l.id, l])), d.spans]);
let spans = 0, bad = 0; const worst = [];
for (const [name, L, S] of rings) { const r = buildRing(name, L, S); r.spans.forEach((s, i) => { if (S[i].character === "sCurve") return; spans++; const rev = spanStatsN(s); if (rev > 0) { bad++; worst.push(`${name}:${s.id}(${S[i].character})`); } }); }
const res = { label: process.argv[2] || "current", spansChecked: spans, spansWithUnintendedInflection: bad, fraction: +(bad / spans).toFixed(3), examples: worst.slice(0, 8) };
console.log(JSON.stringify(res));
fs.appendFileSync(path.join(here, "..", "evidence", "stage1", "CONTOUR_QUALITY.jsonl"), JSON.stringify({ at: new Date().toISOString(), ...res }) + "\n");
