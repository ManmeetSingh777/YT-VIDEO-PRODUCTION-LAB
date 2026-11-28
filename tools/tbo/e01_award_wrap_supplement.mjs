#!/usr/bin/env node
// E01: release the six award-wrap hand requests (V6 items 035, 036, 041, 042, 121, 122) held for the award-hold geometry. The V6 drawing text is
// kept (it is compatible); each request gains the SOLVED physical interface: which plaque flank the hand takes (geometry, amendment 08), palm and
// wrist orientation, the wrist interface direction toward the forearm drawing it attaches to, near/far depth order around the plaque, and the
// directed hold windows. Nothing is re-drawn that does not need to be.   node tools/tbo/e01_award_wrap_supplement.mjs --film films/e01 --v6 <dir> --out <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), V6 = path.resolve(arg("v6")), OUT = path.resolve(arg("out")), S = J(path.join(FILM, "handoff", "AWARD_SOLVE_REPORT.json")), items = J(path.join(V6, "ITEMS.json")).items;
const T = S.inputs.timing, F = S.foreshortened_forearm_requirement, flank = (h) => (S.sides.valid[h] === "grip_l" ? "screen-LEFT" : "screen-RIGHT"), toElbow = (h) => (((F[h].at_recommended.forearm_dir_deg_f0 + 180 + 540) % 360) - 180);
const HELD = { "035": ["r", "near", "to_regular"], "036": ["r", "far", "to_regular"], "041": ["l", "near", "to_regular"], "042": ["l", "far", "to_regular"], "121": ["l", "near", "to_lead"], "122": ["l", "far", "to_lead"] };
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "requests"), { recursive: true }); const rel = [];
for (const [n, [h, layer, body]] of Object.entries(HELD)) { const it = items.find((x) => x.n === n), src = path.join(V6, "requests", `${n}_${it.id}`, "REQUEST.md"); let md = fs.readFileSync(src, "utf8");
  const side = h === "r" ? "RIGHT" : "LEFT", far = h === "r" ? "the FAR arm (screen-left as she faces screen-left)" : "the NEAR arm (screen-right as she faces screen-left)";
  const window_ = h === "r" ? `[0, ${T.right_clear})` : body === "to_lead" ? `[306, ${T.left_clear}) (body turned to_lead)` : "[0, 306)";
  const wrist = body === "to_regular" ? `the wrist end opens toward ${toElbow(h).toFixed(0)}° on screen (toward the elbow of the foreshortened award-hold forearm ART_M02.CHAR_MIA.fore_${h}__award_hold, which rises ${Math.abs(F[h].at_recommended.forearm_dir_deg_f0).toFixed(0)}° from its elbow); the cuff edge meets that forearm's wrist end` : `the wrist end meets the to_lead forearm ART_M02.CHAR_MIA.fore_${h}__to_lead (direction taken from that drawing once registered)`;
  md += ["", "## Physical interface (solved; tools/tbo/e01_solve_award.mjs, amendment 08)", `- Anatomical ${side} hand = ${far}. It grips the plaque's ${flank(h)} flank (prop-local socket PROP_AWARD.${S.sides.valid[h]}): the hands never cross.`,
    `- Palm faces the flank it holds (toward the plaque's centre); the hand stays upright in the master's orientation; thumb on the FRONT face, fingertips in the front recess.`, `- Wrist interface: ${wrist}.`,
    `- Depth: this is the ${layer.toUpperCase()} layer — ${layer === "near" ? "drawn in FRONT of the plaque (thumb, front fingertips)" : "drawn BEHIND the plaque (palm and finger roots behind the solid flank)"}; the plaque sits between the near and far layers.`,
    `- Held over ${window_}; released at the directed frame (${h === "r" ? T.right_clear : T.left_clear}).`, ""].join("\n");
  fs.mkdirSync(path.join(OUT, "requests", `${n}_${it.id}`), { recursive: true }); fs.writeFileSync(path.join(OUT, "requests", `${n}_${it.id}`, "REQUEST.md"), md); rel.push({ n, id: it.id, yields: it.yields, hand: h, layer, body, flank: flank(h), window: window_ }); }
fs.writeFileSync(path.join(OUT, "RELEASE.json"), JSON.stringify({ released: rel, from: "HOLD_SUPPLEMENT_AWARD_GEOMETRY", drawing_text: "V6 unchanged; physical interface appended" }, null, 1)); console.log(JSON.stringify(rel.map((r) => `${r.n} ${r.id} → ${r.flank} flank, ${r.layer}, ${r.window}`), null, 1));
