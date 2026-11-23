// Gate B/C step: render the four authored silhouette candidates for Specimen 1 (flat, full + one-tenth) for visual review.
import path from "node:path"; import url from "node:url"; import fs from "node:fs";
import { solvePalette } from "../palette.mjs";
import { poseFigure } from "../figure.mjs";
import { renderCandidates } from "../subject.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url)), EV = path.join(here, "..", "evidence", "stage1");
const D = await import(url.pathToFileURL(path.join(EV, "DECISION_PLANS", "hydrologist.mjs")));
fs.mkdirSync(path.join(EV, "FIRST_PASS"), { recursive: true });
// candidate-stage palette: silhouettes are rendered flat; roles exist only so masses can be emitted
const R = (h, L) => ({ slot: "main_subject", hue: h, chroma: 0.05, owners: ["fig"], L });
const pal = solvePalette({ situation: "quiet_light_field", roles: Object.fromEntries(["trouser", "trouserFar", "boot", "bootFar", "shirt", "shirtFar", "shirtShade", "trouserShade", "vest", "vestShade", "skin", "skinShade", "hair"].map((k, i) => [k, R(30 * i, 0.4)])), pairs: [] });
const out = path.join(EV, "FIRST_PASS", "specimen1_silhouette_candidates.png");
const r = renderCandidates({ subjectId: "hydrologist", displayH: 420, candidates: Object.keys(D.VARIANTS).map((id) => ({ id, intent: D.VARIANTS[id].intent, build: () => poseFigure(D.plan(id, pal.roles), D.poseFor(id)).elements })) }, out);
fs.writeFileSync(path.join(EV, "FIRST_PASS", "specimen1_silhouette_candidates.json"), JSON.stringify(r.data, null, 1));
console.log(JSON.stringify(r.data.distinctness), r.data.sheetSha256.slice(0, 12));
