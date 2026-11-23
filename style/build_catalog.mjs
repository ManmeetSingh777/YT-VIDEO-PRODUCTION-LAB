// Generates style/F_METHOD_CATALOG.json from the ORIGINAL F01–F80 reference files (headings + line anchors)
// plus the explicit code-native classification below. The original text stays authoritative: every entry points
// back to its file and line. Run: node style/build_catalog.mjs
//
// class: A = transferable visual-construction requirement (applies to code-native drawing as written)
//        B = image-provider-specific operation → needs a code-native replacement (named in `replacement`)
//        C = conditional artistic decision (cannot be a universal function; must be decided per identity/scene)
//        D = code-native implementation currently unproven (op may exist; no accepted rendered evidence yet)
// ops: engine functions that EXECUTE the method (verified to exist by build.mjs when cited in a contract)
// test: the pixel test that can demonstrate it (QA render mode / inspection), or null
import fs from "node:fs";
import path from "node:path";
const REF = "reference/construct-kurzgesagt-art/references";
const files = ["STYLE_OPERATIONS.md", "FULL_FILM_ROUTER_AND_METHODS.md", "WORLD_SYSTEM_CONSTRUCTION.md", "CONDITIONAL_PALETTE_SCALE_AND_ABSTRACTION.md", "MOLECULAR_CONSTRUCTOR_F57_F80.md"];
const head = {};
for (const f of files) fs.readFileSync(path.join(REF, f), "utf8").split(/\r?\n/).forEach((l, i) => { const m = l.match(/^## (F\d\d) — (.*)$/); if (m) head[m[1]] = { title: m[2].replace(/\*/g, ""), source: `${REF}/${f}`, line: i + 1 }; });

const SURF = ["surf", "R.pose"], RIG = ["defineRig", "MN.rig"];
const M = {
  F01: ["A", ["defineRig", "surf"], "silhouette"], F02: ["A", ["surf"], "flat"], F03: ["C", ["roles", "recede"], "thumbnail"],
  F04: ["A", ["surf", "glass", "emissive", "MN.setLight"], "nofx"], F05: ["C", ["defineRig", "surf", "R.pose"], "native"],
  F06: ["A", ["R.reach", "R.attach", "R.walk", "handPath", "contactShadow"], "motion"], F07: ["C", ["defineRig"], "silhouette"],
  F08: ["A", ["oblique"], "native"], F09: ["A", ["oblique", "surf", "glass"], "native"], F10: ["A", ["stratum", "contactShadow", "portal"], "thumbnail"],
  F11: ["C", ["stratum", "repeat", "recede", "MN.sway"], "thumbnail"], F12: ["D", ["repeat"], null], F13: ["A", ["glass", "emissive", "portal"], "nofx"],
  F14: ["A", ["morphable", "R.pose", "defineRig"], "motion"], F15: ["A", ["MN.rig", "MN.camera", "R.pose"], "motion"], F16: ["A", ["maskGroup", "clipGroup", "portal"], "motion"],
  F17: ["B", [], null, "provider whole-look proof → rendered hero frames from the production scene + native/thumbnail inspection"],
  F18: ["A", [], "motion", "every-frame claims → inspect.py contact sheets, consecutive-pair diffs, motion report"],
  F19: ["C", [], null, "medium routing: code-native SVG default; registered raster plate allowed when code cannot reach the form (raster.mjs)"],
  F20: ["C", [], null], F21: ["A", ["portal", "glass"], "native"], F22: ["A", ["MN.setLight", "surf"], "motion"], F23: ["D", ["emissive"], null],
  F24: ["A", ["repeat"], "native"], F25: ["C", [], null], F26: ["D", ["clipGroup", "maskGroup"], null], F27: ["D", [], null],
  F28: ["C", [], null], F29: ["C", [], null], F30: ["A", ["defineRig", "R.pose", "defineRig", "morphable"], "motion"],
  F31: ["A", ["R.pose", "R.key", "R.drive"], "motion"], F32: ["A", ["emissive"], "nofx"], F33: ["C", ["recede"], "thumbnail"],
  F34: ["C", ["repeat", "oblique"], null], F35: ["A", ["portal", "maskGroup"], "motion"],
  F36: ["B", [], null, "source-to-script compilation → EPISODE.json + plan.mjs + per-identity construction contracts + ledger"],
  F37: ["A", ["stratum"], "thumbnail"], F38: ["A", ["oblique"], "native"], F39: ["C", ["repeat", "MN.sway"], null], F40: ["D", ["oblique", "repeat"], null],
  F41: ["D", ["repeat"], null], F42: ["C", [], null], F43: ["D", [], null], F44: ["A", ["glass", "emissive"], "nofx"], F45: ["D", ["oblique"], null],
  F46: ["A", ["surf", "glass", "emissive"], "flat"], F47: ["C", ["recede", "stratum"], "thumbnail"], F48: ["A", ["portal"], "native"],
  F49: ["B", [], null, "ArtJob world graph → cast/*.mjs construction contract (decisions → ops → components) checked by build.mjs"],
  F50: ["D", [], null, "adversarial unfamiliar-world tests → must be run on Film 001's unlike worlds; none passed yet"],
  F51: ["C", ["roles"], "thumbnail"], F52: ["C", ["defineRig"], "thumbnail"], F53: ["C", [], "thumbnail"], F54: ["A", ["repeat"], "native"],
  F55: ["C", ["oblique", "MN.camera"], null], F56: ["B", [], null, "prompt-as-geometry → the geometry IS the code; inspect first rendered pixels (hero stage)"],
  F57: ["C", [], "thumbnail"], F58: ["A", ["defineRig", "surf"], "silhouette"], F59: ["A", ["defineRig", "R.attach", "R.reach"], "motion"],
  F60: ["A", ["oblique"], "native"], F61: ["C", ["roles"], "thumbnail"], F62: ["A", ["surf"], "flat"], F63: ["A", ["glass", "emissive"], "nofx"],
  F64: ["C", ["defineRig"], "silhouette"], F65: ["C", ["defineRig", "R.pose"], "native"], F66: ["A", ["R.walk", "R.reach", "MN.rig"], "motion"],
  F67: ["A", ["morphable", "R.pose", "defineRig"], "motion"], F68: ["A", ["oblique", "surf", "glass"], "native"], F69: ["C", ["stratum", "repeat"], "thumbnail"],
  F70: ["A", ["oblique"], "native"], F71: ["D", ["repeat"], null], F72: ["D", ["glass"], null], F73: ["C", [], null], F74: ["D", [], null],
  F75: ["C", [], "native"], F76: ["A", ["repeat", "oblique"], "native"], F77: ["C", [], "thumbnail"], F78: ["A", ["portal", "maskGroup", "MN.camera"], "motion"],
  F79: ["A", ["stratum", "clipGroup", "maskGroup"], "motion"],
  F80: ["B", [], null, "provider request must contain methods + native witnesses → construction contract must cite methods, and build must execute their ops (ledger)"],
};
const methods = Object.keys(M).sort().map((id) => {
  const [cls, ops, test, replacement] = M[id];
  if (!head[id]) throw new Error("heading not found for " + id);
  return { id, title: head[id].title, source: head[id].source, line: head[id].line, class: cls, ops, test, ...(replacement ? { replacement } : {}), code_status: ops.length ? (cls === "D" ? "op_partial_unproven" : "op_available_not_qualified") : (cls === "B" ? "replaced_by_pipeline" : "decision_only") };
});
const out = { version: "CNSA-1", generated_from: files.map((f) => `${REF}/${f}`), note: "Original method text is authoritative; this catalog only maps it to code. No method is QUALIFIED.", methods };
fs.writeFileSync("style/F_METHOD_CATALOG.json", JSON.stringify(out, null, 1));
const c = methods.reduce((a, m) => ((a[m.class] = (a[m.class] || 0) + 1), a), {});
console.log("catalog", methods.length, "methods", c);
