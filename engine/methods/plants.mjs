// F11 + F39 + F69 — landscapes, plants and environmental density.
// F11: strata (sky/far/mid/near); each plant = family of connected trunk/branches + rounded or angular crown lobes; repeated related
// silhouettes with variation; conditional density. F39: ground/water mask first; 3–7 macro vegetation masses with view apertures;
// tree = rooted trunk → 2–5 branch groups → crown sub-masses → leaf lobes (no floating crown); grouped overlapping lobes + few interior
// patches; ≥3 width/height ratios in a dense row; organisms attached after structure; separate foreground occluder masks; cluster masks
// correlated with ecology (not white noise); aquatic exception. F69: coverage substrate; canopy parent groups; quiet corridor; T3 removable.
// Producing operation: seeded branch growth from the trunk (count/angles/taper from species params) → crown lobes generated AT branch
// tips with lobe count collapsing by distance class → interior light/shade patches clipped to the crown → zone placement by density
// field with exclusion apertures.
import { need, add, sub, mul, nrm, rot, rng, polyPath, ribbon, lerp2, pointInPoly, len } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { RULES } from "./knowledge.mjs";

const LOBES = { near: 1, mid: 0.6, far: 0.3 };

/** constructTree(design): species params + root + distance class → connected trunk/branch/crown/leaf-lobe geometry */
function constructTree__impl(design) {
  need("F39 tree", design, { id: "str", root: "vec2", species: "obj", distance: ["near", "mid", "far"], seed: "num", layer: "num" });
  const S = need("F39 species", design.species, { trunkHeight: "num+", trunkWidth: "num+", lean: "num", branchGroups: "num", branchAngle: "num", branchLength: "num+", lobesPerTip: "num", lobeRadius: "num+", lobeCharacter: ["rounded", "angular", "flat_layer", "drooping"], crownLightPatches: "num" });
  if (S.branchGroups < 2 || S.branchGroups > 5) throw new Error("F39: 2–5 secondary branch groups (starting sketch complexity)");
  const C = assertSolved(design.colors, `F39 tree ${design.id}`), r = rng(design.seed), els = [];
  const top = add(design.root, rot([0, -S.trunkHeight], S.lean)), trunk = [design.root, lerp2(design.root, top, 0.5), top];
  els.push(emitRegion(["F39", "F11"], "constructTree.trunk", { id: `${design.id}.trunk`, d: polyPath(ribbon(trunk, (t) => S.trunkWidth * (1 - 0.55 * t))), fill: C.bark, layer: design.layer, owner: design.id }, ["species.trunkHeight", "species.trunkWidth", "species.lean"]));
  const tips = [];
  for (let g = 0; g < S.branchGroups; g++) {
    const t = 0.55 + (0.45 * g) / Math.max(1, S.branchGroups - 1), base = lerp2(design.root, top, t), side = g % 2 ? 1 : -1;
    const ang = side * (S.branchAngle + (r() - 0.5) * 14) + S.lean, tip = add(base, mul(rot([0, -1], ang), S.branchLength * (0.7 + 0.5 * r()) * (1.1 - 0.4 * t)));
    els.push(emitRegion(["F39"], "constructTree.branch", { id: `${design.id}.branch${g}`, d: polyPath(ribbon([base, lerp2(base, tip, 0.5), tip], (u) => S.trunkWidth * 0.45 * (1 - 0.6 * u))), fill: C.bark, layer: design.layer + 0.001, owner: design.id }, ["species.branchGroups", "species.branchAngle", "species.branchLength"]));
    tips.push(tip);
  }
  tips.push(top);
  // crown lobes AT branch tips; count collapses with distance (F39.4: distant foliage fewer lobes, one fill)
  const nL = Math.max(1, Math.round(S.lobesPerTip * LOBES[design.distance])), lobes = [];
  tips.forEach((tp, i) => { for (let k = 0; k < nL; k++) {
    const c = add(tp, [(r() - 0.5) * S.lobeRadius * 1.2, (r() - 0.6) * S.lobeRadius]), R = S.lobeRadius * (0.75 + 0.5 * r());
    const ch = S.lobeCharacter, n = ch === "angular" ? 5 : 6, lm = [];
    for (let j = 0; j < n; j++) { const a = (j / n) * 360 + r() * 20, rr = R * (ch === "flat_layer" ? (j % 3 === 0 ? 1.3 : 0.7) : ch === "drooping" && Math.sin((a * Math.PI) / 180) > 0 ? 1.25 : 1); lm.push({ id: `l${j}`, p: add(c, mul(rot([1, 0], a), rr * (ch === "flat_layer" ? 1 : 1))), joint: ch === "angular" ? "corner" : "smooth" }); }
    const sil = constructSilhouette({ view: "front", identity: ["l0"], landmarks: lm.map((l, j) => ({ ...l, p: ch === "flat_layer" ? [l.p[0], c[1] + (l.p[1] - c[1]) * 0.55] : l.p })), spans: lm.map((l, j) => ({ from: l.id, to: lm[(j + 1) % n].id, character: ch === "angular" ? "straight" : "convex", amount: ch === "angular" ? 0 : 0.18 })) });
    lobes.push(sil.d);
    els.push(emitRegion(["F39", "F11", "F69"], "constructTree.crown_lobe", { id: `${design.id}.lobe${i}_${k}`, d: sil.d, fill: C.leaf, layer: design.layer + 0.01, owner: design.id }, ["species.lobesPerTip", "species.lobeRadius", "species.lobeCharacter", "distance"]));
  } });
  // interior light patches on the light side of the crown, clipped to the crown union (only for near/mid)
  if (design.distance !== "far") { const crown = lobes.join(" "); for (let k = 0; k < S.crownLightPatches; k++) { const tp = tips[k % tips.length], c = add(tp, [-S.lobeRadius * 0.35, -S.lobeRadius * 0.35]);
    const lm = [0, 90, 180, 270].map((a, j) => ({ id: `p${j}`, p: add(c, mul(rot([1, 0], a), S.lobeRadius * (j % 2 ? 0.35 : 0.6))), joint: "smooth" }));
    els.push(emitRegion(["F39", "F02"], "constructTree.crown_patch", { id: `${design.id}.patch${k}`, d: constructSilhouette({ view: "front", identity: ["p0"], landmarks: lm, spans: lm.map((l, j) => ({ from: l.id, to: lm[(j + 1) % 4].id, character: "convex", amount: 0.15 })) }).d, clip: crown, fill: C.leafLight, layer: design.layer + 0.02, owner: design.id }, ["species.crownLightPatches"])); } }
  return { method: ["F39", "F11", "F69"], elements: els, data: { tips: tips.length, lobes: lobes.length, distance: design.distance } };
}

/** F39.2/F39.8/F69: place vegetation by ecological zone density (not white noise), with protected view apertures / quiet corridors */
function placeVegetation__impl(design) {
  need("F39 placement", design, { zones: "arr", apertures: "arr", seed: "num", minSpacing: "num+" });
  const r = rng(design.seed), out = [];
  for (const z of design.zones) {
    need("F39 zone", z, { id: "str", polygon: "vecs", density: "num", species: "arr", distance: ["near", "mid", "far"] });
    const xs = z.polygon.map((p) => p[0]), ys = z.polygon.map((p) => p[1]), [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
    const n = Math.round(((x1 - x0) * (y1 - y0) * z.density) / 10000);
    for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
      const p = [x0 + r() * (x1 - x0), y0 + r() * (y1 - y0)];
      if (!pointInPoly(p, z.polygon) || design.apertures.some((a) => pointInPoly(p, a)) || out.some((o) => len(sub(o.root, p)) < design.minSpacing)) continue;
      out.push({ zone: z.id, root: p, species: z.species[i % z.species.length], distance: z.distance, seed: Math.floor(r() * 1e6) }); i++;
    }
  }
  if (out.length >= 12) { need("F39 catalog", design, { speciesCatalog: "obj" }); RULES.F39_row_variety([...new Set(out.map((o) => o.species))].map((k) => design.speciesCatalog[k]), true, "F39 placement"); }
  return { method: ["F39", "F69"], data: { placements: out.sort((a, b) => a.root[1] - b.root[1]), count: out.length, speciesVariety: new Set(out.map((o) => o.species)).size } };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructTree = registerProducer("plants.constructTree", constructTree__impl);
export const placeVegetation = registerProducer("plants.placeVegetation", placeVegetation__impl);
