// F09 + F68 + F45 — functional gear train (machine designer). Positions and rotations are DERIVED from the mechanism, never placed:
// pitch radius r = module·teeth/2; a meshing gear's centre = parent centre + (r_parent + r_child)·direction (spur, same plane) or sits on the
// parent's top pitch point (crown wheel driving a horizontal wallower); rotation = −ratio·parent + phase so teeth interlock.
// Tooth outlines are generated in the gear's own plane and projected through the world's single oblique basis (F60).
import { need, add, mul, polyPath, ribbon } from "./core.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";

const PLANES = { vertical_uh: (c, x, y) => [c[0] + x, c[1], c[2] + y], vertical_vh: (c, x, y) => [c[0], c[1] + x, c[2] + y], horizontal_uv: (c, x, y) => [c[0] + x, c[1] + y, c[2]] };
const NORMAL = { vertical_uh: [0, 1, 0], vertical_vh: [1, 0, 0], horizontal_uv: [0, 0, 1] };

function gearTrain__impl(proj, design) {
  need("F09 gear train", design, { id: "str", inputAngleDeg: "num", gears: "arr", layer: "num" });
  const C = assertSolved(design.colors, `F09 ${design.id}`), G = {}, els = [], ports = {};
  for (const g of design.gears) {
    need(`F09 gear ${g.id}`, g, { id: "str", teeth: "num", module: "num+", plane: Object.keys(PLANES), thickness: "num+", style: ["spoked_wheel", "solid_pinion", "paddle_wheel", "lantern"], fillRole: "str", shadeRole: "str", decision: "str" });
    const r = (g.module * g.teeth) / 2; let c, phi;
    if (g.coaxialWith) { const p = G[g.coaxialWith]; if (!p) throw new Error(`F68 ${g.id}: coaxial with undefined ${g.coaxialWith}`); need(`F68 ${g.id}`, g, { center3: "arr" }); c = g.center3; phi = p.phi; } // same shaft: same rotation
    else if (!g.meshWith) { need(`F09 driver ${g.id}`, g, { center3: "arr" }); c = g.center3; phi = (design.inputAngleDeg * Math.PI) / 180; }
    else {
      const p = G[g.meshWith]; if (!p) throw new Error(`F68 gear ${g.id}: meshes with undefined ${g.meshWith} (declare the driver first)`);
      if (g.mesh === "spur") { if (p.plane !== g.plane) throw new Error(`F68 ${g.id}: spur mesh requires the same plane as ${p.id}`); need(`F68 ${g.id}`, g, { meshAtDeg: "num" });
        const th = (g.meshAtDeg * Math.PI) / 180, d = p.r + r; c = PLANES[g.plane](p.c, d * Math.cos(th), d * Math.sin(th)); phi = -(p.teeth / g.teeth) * p.phi + (1 + p.teeth / g.teeth) * th + Math.PI + Math.PI / g.teeth; }
      else if (g.mesh === "crown_to_horizontal") { if (p.plane === "horizontal_uv" || g.plane !== "horizontal_uv") throw new Error(`F68 ${g.id}: crown mesh drives a horizontal gear from a vertical wheel`);
        const top = PLANES[p.plane](p.c, 0, p.r); c = [top[0], top[1] - r, top[2] + g.module * 0.6]; phi = (p.teeth / g.teeth) * p.phi; }
      else throw new Error(`F68 ${g.id}: mesh type must be spur | crown_to_horizontal`);
    }
    G[g.id] = { ...g, r, c, phi };
  }
  for (const g of Object.values(G)) {
    const lay = design.layer + (g.layerOffset ?? 0), P = (x, y, dz = 0) => { const q = PLANES[g.plane](g.c, x, y), n = NORMAL[g.plane]; return proj.P(q[0] + n[0] * dz, q[1] + n[1] * dz, q[2] + n[2] * dz); };
    const m = g.module, pz = (2 * Math.PI) / g.teeth, rr = g.r - 1.25 * m, rt = g.r + m, outline = [];
    for (let k = 0; k < g.teeth; k++) { const a = g.phi + k * pz; for (const [da, rad] of [[-0.5, rr], [-0.28, rr], [-0.16, rt], [0.16, rt], [0.28, rr]]) outline.push([rad * Math.cos(a + da * pz), rad * Math.sin(a + da * pz)]); }
    const face = (dz) => polyPath(outline.map(([x, y]) => P(x, y, dz)));
    const ring = (rad, dz, n = 40) => polyPath(Array.from({ length: n }, (_, i) => { const a = (i / n) * 2 * Math.PI; return P(rad * Math.cos(a), rad * Math.sin(a), dz); }));
    els.push(emitRegion(["F09", "F68"], "gearTrain.back_face", { id: `${design.id}.${g.id}.back`, d: g.style === "paddle_wheel" ? `${ring(g.r * 0.86, -g.thickness)} ${ring(g.r * 0.72, -g.thickness)}` : face(-g.thickness), fill: C[g.shadeRole], layer: lay, owner: g.id, decision: g.decision }, []));
    if (g.style === "paddle_wheel") { // radial paddle boards on a plain rim (a water wheel is not a toothed gear)
      els.push(emitRegion(["F09", "F68"], "gearTrain.rim", { id: `${design.id}.${g.id}.rim`, d: `${ring(g.r * 0.86, 0)} ${ring(g.r * 0.72, 0)}`, fill: C[g.fillRole], layer: lay + 0.01, owner: g.id, decision: g.decision }, []));
      for (let k = 0; k < g.teeth; k++) { const a = g.phi + k * pz; els.push(emitRegion(["F09", "F68"], "gearTrain.paddle", { id: `${design.id}.${g.id}.paddle${k}`, d: polyPath(ribbon([P(g.r * 0.7 * Math.cos(a), g.r * 0.7 * Math.sin(a)), P(g.r * 1.12 * Math.cos(a), g.r * 1.12 * Math.sin(a))], () => m * 1.3)), fill: C[g.fillRole], layer: lay + 0.011, owner: g.id, decision: g.decision }, [])); }
      const spokes = g.spokes ?? 6;
      for (let s = 0; s < spokes; s++) { const a = g.phi + (s / spokes) * 2 * Math.PI + 0.2; els.push(emitRegion(["F09", "F68"], "gearTrain.spoke", { id: `${design.id}.${g.id}.spoke${s}`, d: polyPath(ribbon([P(0, 0), P(g.r * 0.74 * Math.cos(a), g.r * 0.74 * Math.sin(a))], () => m * 0.9)), fill: C[g.fillRole], layer: lay + 0.012, owner: g.id, decision: g.decision }, [])); }
    } else if (g.style === "spoked_wheel") {
      els.push(emitRegion(["F09", "F68"], "gearTrain.rim", { id: `${design.id}.${g.id}.rim`, d: `${face(0)} ${ring(rr * 0.8, 0)}`, fill: C[g.fillRole], layer: lay + 0.01, owner: g.id, decision: g.decision }, []));
      const spokes = g.spokes ?? 6;
      for (let s = 0; s < spokes; s++) { const a = g.phi + (s / spokes) * 2 * Math.PI; els.push(emitRegion(["F09", "F68"], "gearTrain.spoke", { id: `${design.id}.${g.id}.spoke${s}`, d: polyPath(ribbon([P(0, 0), P(rr * 0.82 * Math.cos(a), rr * 0.82 * Math.sin(a))], () => m * 1.4)), fill: C[g.fillRole], layer: lay + 0.012, owner: g.id, decision: g.decision }, [])); }
    } else els.push(emitRegion(["F09", "F68"], "gearTrain.face", { id: `${design.id}.${g.id}.face`, d: face(0), fill: C[g.fillRole], layer: lay + 0.01, owner: g.id, decision: g.decision }, []));
    els.push(emitRegion(["F09", "F68"], "gearTrain.hub", { id: `${design.id}.${g.id}.hub`, d: ring(Math.max(m * 1.6, g.r * 0.16), 0.5, 20), fill: C[g.shadeRole], layer: lay + 0.02, owner: g.id, decision: g.decision }, []));
    ports[`${g.id}.center`] = P(0, 0); ports[`${g.id}.center3`] = g.c; ports[`${g.id}.r`] = g.r;
  }
  return { method: ["F09", "F68", "F45"], elements: els, ports, data: { gears: Object.fromEntries(Object.values(G).map((g) => [g.id, { r: +g.r.toFixed(2), phiDeg: +((g.phi * 180) / Math.PI).toFixed(2), center3: g.c.map((v) => +v.toFixed(1)) }])) } };
}
export const gearTrain = registerProducer("gears.gearTrain", gearTrain__impl);
