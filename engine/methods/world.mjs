// F37 (world definition) + F42 (abstract stage) + F43 (information theatre) + F10 (complete space shell/zones) + F40 (eco-tech organisation).
// F37: world_purpose, world_class (typed children for mixed worlds), substrate (no silent default horizon), projection, physical/relational
// topology where EVERY major object has an edge, visual grammar (3–6 big masses, near/mid/far roles, emitters, vacant paths, exclusions),
// world_state; output WORLD_SYSTEM_SPEC; fail if only nouns/adjectives. F42: open dark coordinate stage (projected floor grid converging,
// focus patch under the actor) or task platform (bounded plane with thickness, cells attached). F43: PANE_RING (ring map, pane normal
// → width/contrast/occlusion by depth, contents aligned + clipped), EXPLODED_INTERFACE, BUILT_DATA_CORRIDOR, DASHBOARD_OVER_WORLD.
import { need, add, sub, mul, lerp2, polyPath, ribbon } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

export const WORLD_CLASSES = ["SCENIC_NATURAL", "SCENIC_BUILT", "SCENIC_INTERIOR", "COSMIC_SCALE", "BIOLOGICAL_MICRO", "SCHEMATIC_NETWORK", "ABSTRACT_STAGE", "ABSTRACT_VOLUME", "NESTED_HABITAT", "PARALLEL_WORLDS"];
const ADJ = /\b(beautiful|glowing|atmospheric|intricate|stunning|vibrant|magical|epic|cinematic|lush|amazing)\b/i;

/** defineWorld → WORLD_SYSTEM_SPEC (validated; the spec is the input every world producer consumes) */
function defineWorld__impl(w) {
  need("F37 world", w, { world_purpose: "str", world_class: WORLD_CLASSES, substrate: "str", projection: "str", parts: "arr", relationships: "arr", masses: "arr", layers: "arr", emitters: "arr", vacant_paths: "arr", exclusions: "arr" });
  if (ADJ.test(w.world_purpose) || ADJ.test(w.substrate)) throw new Error("F37: world fields must name contours/relations, not adjectives");
  if (w.masses.length < 3 || w.masses.length > 6) throw new Error("F37: 3–6 big spatial masses or regions");
  const ids = new Set(w.parts.map((p) => need("F37 part", p, { id: "str", role: ["major", "minor"], edge: ["anchored", "inside", "projected", "cabled", "mounted", "free_floating_declared"] }).id));
  for (const r of w.relationships) { need("F37 relation", r, { from: "str", to: "str", type: "str" }); if (!ids.has(r.from) || (!ids.has(r.to) && r.to !== "substrate")) throw new Error(`F37: relationship ${r.from}→${r.to} references undefined parts`); }
  const orphan = w.parts.filter((p) => p.role === "major" && p.edge !== "free_floating_declared" && !w.relationships.some((r) => r.from === p.id || r.to === p.id));
  if (orphan.length) throw new Error(`F37: major objects without a graph edge: ${orphan.map((p) => p.id).join(", ")}`);
  if (w.world_class === "PARALLEL_WORLDS" || w.world_class === "NESTED_HABITAT") need("F37 children", w, { children: "arr" });
  return { method: "F37", spec: { ...w, kind: "WORLD_SYSTEM_SPEC" } };
}

/** F42 open coordinate stage: floor grid lines projected toward a vanishing point + focus patch at the actor's declared contact */
function constructStage__impl(design) {
  need("F42 stage", design, { id: "str", kind: ["open_dark", "task_platform"], horizonY: "num", vp: "vec2", floorY: "num", spacing: "num+", lines: "num", width: "num+", actorContact: "vec2", patchRadius: "num+", layer: "num" });
  const C = assertSolved(design.colors, "F42"), els = [];
  els.push(emitRegion(["F42"], "constructStage.field", { id: `${design.id}.field`, d: polyPath([[0, 0], [1920, 0], [1920, 1080], [0, 1080]]), fill: C.field, layer: design.layer - 1, owner: design.id }, ["kind"]));
  if (design.kind === "task_platform") { need("F42 platform", design, { platform: "vecs", thickness: "num+" }); const P = design.platform; els.push(emitRegion(["F42"], "constructStage.platform_side", { id: `${design.id}.side`, d: polyPath([P[3], P[2], add(P[2], [0, design.thickness]), add(P[3], [0, design.thickness])]), fill: C.platformSide, layer: design.layer, owner: design.id }, ["platform", "thickness"]), emitRegion(["F42"], "constructStage.platform_top", { id: `${design.id}.top`, d: polyPath(P), fill: C.platform, layer: design.layer + 0.01, owner: design.id }, ["platform"])); }
  for (let i = -design.lines; i <= design.lines; i++) { const x = design.vp[0] + i * design.spacing * 4; els.push(emitRegion(["F42"], "constructStage.grid_converging", { id: `${design.id}.gz${i}`, d: polyPath(ribbon([[x, 1080 + 200], lerp2([x, 1280], design.vp, 0.92)], () => design.width)), fill: C.grid, opacity: 0.5, layer: design.layer + 0.02, owner: design.id }, ["vp", "spacing", "lines"])); }
  for (let k = 1; k <= design.lines; k++) { const t = 1 - Math.pow(0.78, k), y = design.floorY + (design.vp[1] - design.floorY) * (1 - t) * 0 + lerp2([0, 1080], [0, design.horizonY], t)[1]; els.push(emitRegion(["F42"], "constructStage.grid_receding", { id: `${design.id}.gx${k}`, d: polyPath(ribbon([[-200, y], [2120, y]], () => design.width * (1 - t * 0.8))), fill: C.grid, opacity: 0.5, layer: design.layer + 0.02, owner: design.id }, ["horizonY", "lines"])); }
  const c = design.actorContact, r = design.patchRadius; els.push(emitRegion(["F42", "F62"], "constructStage.focus_patch", { id: `${design.id}.focus`, d: polyPath(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return [c[0] + r * Math.cos(a), c[1] + r * 0.22 * Math.sin(a)]; })), fill: C.focus, layer: design.layer + 0.03, owner: design.id }, ["actorContact", "patchRadius"]));
  return { method: ["F42"], elements: els };
}

/** F43 PANE_RING: panes on an ellipse; width ∝ |cos(facing)|, contrast + layer by depth, contents (data bars) aligned and clipped per pane */
function constructPaneRing__impl(design) {
  need("F43 pane ring", design, { id: "str", center: "vec2", rx: "num+", ry: "num+", panes: "num", paneW: "num+", paneH: "num+", barsPerPane: "num", meaning: "str", layer: "num" });
  const C = assertSolved(design.colors, "F43"), els = [];
  for (let i = 0; i < design.panes; i++) {
    const a = (i / design.panes) * Math.PI * 2, depth = (Math.sin(a) + 1) / 2, c = [design.center[0] + design.rx * Math.cos(a), design.center[1] + design.ry * Math.sin(a)];
    const w = design.paneW * (0.25 + 0.75 * Math.abs(Math.sin(a))) * (0.6 + 0.4 * depth), h = design.paneH * (0.6 + 0.4 * depth), lay = design.layer + depth;
    const q = [[c[0] - w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] - h / 2], [c[0] + w / 2, c[1] + h / 2], [c[0] - w / 2, c[1] + h / 2]], qd = polyPath(q);
    els.push(emitRegion(["F43"], "constructPaneRing.pane", { id: `${design.id}.pane${i}`, d: qd, fill: depth > 0.5 ? C.paneNear : C.paneFar, opacity: 0.55 + 0.45 * depth, layer: lay, owner: design.id }, ["panes", "rx", "ry", "paneW"]));
    for (let b = 0; b < design.barsPerPane; b++) { const lenK = [0.8, 0.55, 0.35][b % 3], y = c[1] - h / 2 + (h * (b + 1)) / (design.barsPerPane + 1), x0 = c[0] - w / 2 + w * 0.1;
      els.push(emitRegion(["F43", "F54"], "constructPaneRing.data_bar", { id: `${design.id}.pane${i}.bar${b}`, d: polyPath([[x0, y - h * 0.03], [x0 + w * 0.8 * lenK, y - h * 0.03], [x0 + w * 0.8 * lenK, y + h * 0.03], [x0, y + h * 0.03]]), clip: qd, fill: C.bar, layer: lay + 0.001, owner: `${design.id}.pane${i}` }, ["barsPerPane"])); }
  }
  return { method: ["F43"], elements: els, data: { meaning: design.meaning } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const defineWorld = registerProducer("world.defineWorld", defineWorld__impl);
export const constructStage = registerProducer("world.constructStage", constructStage__impl);
export const constructPaneRing = registerProducer("world.constructPaneRing", constructPaneRing__impl);
