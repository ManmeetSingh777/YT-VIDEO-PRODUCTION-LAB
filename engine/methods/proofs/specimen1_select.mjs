// Records the reviewed silhouette selection for Specimen 1 through subject.selectCandidate (hash-bound to the viewed sheet).
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { selectCandidate } from "../subject.mjs";
import { review } from "../contracts.mjs";
const EV = path.join(path.dirname(url.fileURLToPath(import.meta.url)), "..", "evidence", "stage1");
const rendered = { data: JSON.parse(fs.readFileSync(path.join(EV, "FIRST_PASS", "specimen1_silhouette_candidates.json"), "utf8")) };
const rv = review({ file: rendered.data.sheet, sha256: rendered.data.sheetSha256, verdict: "ACCEPT_WITH_DEFECTS", reviewer: "Claude (model visual review; final artistic approval reserved to Manmeet)",
  observations: [
    "Pass 1 rejected: knee bow-tie self-intersections (compiler bend-side bug), arms hooked over heads (IK branch), parallel legs (pose semantics).",
    "Pass 3: A/B/C/D read as four different people at 1/10: rounded bob + flared vest mass (A), narrow coat + top-knot (B), brim hat + triangular cape (C), peaked hood + waders (D).",
    "A: lunge with forward bent near knee and planted back leg reads as effort over a low object; broad sloped shoulders and vest flare give a stocky field-worker identity.",
    "Defects carried forward: near hand not yet constructed so the arm reads as a stub; head is a single bob mass (fringe/face to come from the view-registered face design); D's bib leaves a white gap at the hips (not selected)."] });
const sel = selectCandidate(rendered, { chosen: "A",
  acceptance: ["At full display size the stocky torso, flared vest hem, wide trousers and forward lunge are distinct from the other three candidates.", "At one-tenth size the bob head mass, vest block and split stance still read as a working adult bent toward something low."],
  rejected: { B: "Lean coat silhouette reads as a passer-by; the narrow column loses the effort/weight read needed for cranking a reel.", C: "Cape + brim make a strong shape but hide both arms and the task; identity becomes weather, not work.", D: "Hood hides the face needed for the reaction beat and the bib leaves an unresolved gap at the hips; long limbs weaken the stocky weight read." },
  review: rv });
fs.writeFileSync(path.join(EV, "DECISION_PLANS", "hydrologist_selection.json"), JSON.stringify({ ...sel.data, receipt: sel.receipt }, null, 1));
console.log("selected", sel.data.chosen, "review", sel.data.review.sha256.slice(0, 12));
