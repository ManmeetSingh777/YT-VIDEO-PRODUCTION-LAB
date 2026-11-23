// Isolated Stage-1 proofs (NOT artwork): character-core producers. Fixtures are minimal abstract inputs that exist only to show
// input→output causality, refusal and the source falsifiers. They are not designs for any production subject.
import { prove } from "../proof.mjs";
import { constructSilhouette, silhouetteElement, silhouetteRead } from "../contour.mjs";
import { solvePalette, grayscaleRead } from "../palette.mjs";
import { constructSurface, constructEdge, flatColorTest } from "../surface.mjs";
import { assemble } from "../topology.mjs";
import { constructHead } from "../face.mjs";

const ring = (pts, ch = []) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: ch[i]?.[0] ?? "convex", amount: ch[i]?.[1] ?? 0.12 })) });
export const SIL = { view: "three_quarter_left", identity: ["notch"], ...ring([["top", 400, 150, "smooth"], ["notch", 470, 250, "corner"], ["r", 520, 380, "smooth"], ["b", 420, 520, "corner"], ["l", 320, 360, "smooth"]], [["convex", 0.1], ["concave", 0.12], ["convex", 0.15], ["straight", 0], ["convex", 0.2]]),
  voids: [{ id: "hole", ...ring([["h1", 400, 330, "smooth"], ["h2", 440, 360, "smooth"], ["h3", 410, 400, "smooth"], ["h4", 375, 365, "smooth"]]) }] };
export const PAL = { situation: "quiet_light_field", roles: {
  field: { slot: "primary_substrate", hue: 95, chroma: 0.07, owners: ["bg"] }, body: { slot: "main_subject", hue: 250, chroma: 0.12, owners: ["torso"], L: 0.6 },
  skin: { slot: "main_subject", hue: 55, chroma: 0.09, owners: ["face"], L: 0.78 }, skinShade: { slot: "material_dark_plane", hue: 40, chroma: 0.1, owners: ["face"], L: 0.66 },
  hair: { slot: "material_dark_plane", hue: 300, chroma: 0.1, owners: ["hair"], L: 0.3 }, eyeDark: { slot: "shadow_anchor", hue: 280, chroma: 0.05, owners: ["eyes"], L: 0.18 },
  mouthInterior: { slot: "shadow_anchor", hue: 20, chroma: 0.1, owners: ["mouth"], L: 0.32 }, brow: { slot: "shadow_anchor", hue: 300, chroma: 0.08, owners: ["brows"], L: 0.25 },
  sclera: { slot: "material_light_plane", hue: 90, chroma: 0.01, owners: ["eyes"], L: 0.98 }, cheek: { slot: "accent", hue: 20, chroma: 0.1, owners: ["face"], L: 0.72 }, iris: { slot: "accent", hue: 200, chroma: 0.12, owners: ["eyes"], L: 0.5 } },
  pairs: [{ a: "body", b: "field", channel: "luminance", min: 3, adjust: "body" }, { a: "hair", b: "skin", channel: "luminance", min: 3, adjust: "hair" }],
  materials: { cloth: { role: "body", planeStep: 0.09, shadeHueShift: 20, ambientHue: 280 } } };

export const HEAD_FIXTURE = { id: "hd", pal: PAL, role: "ACTING_CUE", finalHeadPx: 220, gazeRequired: true, layer: 5,
    skull: { view: "three_quarter_left", identity: ["jaw"], ...ring([["crown", 400, 160, "smooth"], ["rear", 500, 250, "smooth"], ["jaw", 470, 380, "corner"], ["chin", 400, 420, "smooth"], ["cheek", 320, 330, "smooth"], ["brow", 315, 230, "smooth"]], [["convex", 0.18], ["convex", 0.12], ["straight", 0], ["convex", 0.1], ["convex", 0.08], ["convex", 0.15]]) },
    hair: { lobes: [{ id: "cap", root: "crown", front: true, design: { view: "three_quarter_left", identity: ["fringe"], ...ring([["h1", 300, 230, "corner"], ["h2", 380, 130, "smooth"], ["h3", 520, 210, "smooth"], ["h4", 505, 300, "corner"], ["fringe", 430, 215, "corner"]], [["convex", 0.2], ["convex", 0.2], ["convex", 0.1], ["concave", 0.1], ["sCurve", 0.08]]) } }] },
    frame: { center: [405, 290], rx: 95, ry: 125, yaw: -25, pitch: 0, roll: 0, eyeLine: 0.0, eyeSpread: 28, mouthLine: 0.62, noseLine: 0.33 },
    eye: { shape: "almond", width: 0.26, height: 0.09 },
    expression: { brow_tilt: 0, brow_raise: 0, lid_arc: 0.1, gaze_offset: [0, 0], cheek_shape: "relaxed", mouth_topology: "closed", mouth_open: 0 },
    features: { browWeight: 1, browLength: 1.1, noseProjection: 0.25, noseWidth: 0.2, mouthWidth: 0.55, earSize: 0.5,
    earShape: { view: "profile_left", identity: ["lobe"], ...ring([["top", 0.1, -1, "smooth"], ["back", 0.9, -0.3, "smooth"], ["lobe", 0.4, 1, "corner"], ["front", -0.7, 0.3, "smooth"]]) },
    cheekShape: { view: "front", identity: ["c1"], ...ring([["c1", -1, 0, "smooth"], ["c2", 0, -0.8, "smooth"], ["c3", 1, 0.1, "smooth"], ["c4", 0, 1, "smooth"]]) },
    markShape: { view: "front", identity: ["m1"], ...ring([["m1", 0, -1, "corner"], ["m2", 0.9, 0.1, "smooth"], ["m3", 0, 1, "smooth"], ["m4", -0.9, 0.1, "smooth"]]) } } };

export function run() {
  const R = [];
  // F01/F58 silhouette
  R.push(prove({ method: "F01", class: "GEOMETRY", name: "F01/F58 constructSilhouette", base: SIL, producer: (d) => { const s = constructSilhouette(d); return { elements: [silhouetteElement("s", s, "#334455")], data: { voids: s.voids.length } }; },
    inputs: ["landmarks", "spans", "view", "identity", "voids"],
    perturb: [{ path: "spans.1.character", value: "convex", expect: /^s$/ }, { path: "spans.2.amount", value: 0.4, expect: /^s$/ }, { path: "landmarks.1.joint", value: "smooth", expect: /^s$/ }, { path: "landmarks.1.p", value: [500, 230], expect: /^s$/ }, { path: "voids.0.landmarks.0.p", value: [395, 300], expect: /^s$/ }],
    refuse: [{ path: "spans.0.character", value: "rounded", why: "unknown contour vocabulary" }, { path: "identity", value: [], why: "no identity landmark" }, { path: "landmarks", value: [], why: "primitive (<4 landmarks)" }, { path: "spans.4.to", value: "top2", why: "ring not closed" }],
    falsifier: () => { const r = silhouetteRead(constructSilhouette(SIL), { displayH: 120 }); return { pass: r.pass, detail: r }; } }));
  // F03/F51/F61 palette
  R.push(prove({ method: "F03", class: "ART_DESIGN", name: "F03/F51/F61 solvePalette", base: PAL, producer: (d) => { const p = solvePalette(d); return { data: { ...p.roles, cloth: p.materials.cloth } }; },
    inputs: ["situation", "roles", "pairs", "materials"],
    perturb: [{ path: "situation", value: "dark_field", expect: /data:field/ }, { path: "roles.body.hue", value: 140, expect: /data:body|data:cloth/, confine: /data:body|data:cloth/ }, { path: "pairs.0.min", value: 6, expect: /data:body/ }, { path: "materials.cloth.planeStep", value: 0.2, expect: /data:cloth/, confine: /data:cloth/ }],
    refuse: [{ path: "roles.body.owners", value: [], why: "colour before owners" }, { path: "roles.body.slot", value: "brand_blue", why: "not a role slot" }, { path: "pairs.0.a", value: "nope", why: "unknown role" }],
    falsifier: (r) => { const p = solvePalette(PAL); const g = grayscaleRead(p, "body", "field", 3); return { pass: g.pass && p.pass, detail: { g, pairs: p.pairs } }; } }));
  // F02/F04/F46 surface (parent + colours are produced inside the closure from the perturbed design)
  const SURF = { sil: SIL, pal: PAL, owner: "torso", material: "cloth", light: { dir: [-0.6, -0.8], system: "opaque_form" }, transition_policy: "HARD_BOUNDARY",
    forms: [{ id: "turn", cause: "volume_turn", side: "shade", depth: 2 }, { id: "front", cause: "view_plane", s0: 0.02, s1: 0.25, bulge: 0.25, tone: "light" }] };
  const surfP = (d) => { const p = solvePalette(d.pal); const base = silhouetteElement("torso", constructSilhouette(d.sil), p.materials.cloth.base, 1); return constructSurface({ ...d, parent: base, colors: p.materials.cloth }); };
  R.push(prove({ method: "F02", class: "ART_DESIGN", name: "F02/F04/F46 constructSurface", base: SURF, producer: surfP, inputs: ["material", "light.dir", "light.system", "forms", "transition_policy"],
    perturb: [{ path: "light.dir", value: [0.7, -0.7], expect: /torso\.turn/, confine: /torso\.turn|data:forms/ }, { path: "forms.0.depth", value: 4, expect: /torso\.turn/, confine: /torso\.turn|data:forms/ }, { path: "forms.1.s1", value: 0.4, expect: /torso\.front/, confine: /torso\.front|data:forms/ }, { path: "forms.1.tone", value: "shade", expect: /torso\.front/, confine: /torso\.front|data:forms/ }, { path: "sil.landmarks.0.p", value: [380, 120], expect: /torso\.(base|turn|front)/ }],
    refuse: [{ path: "light.system", value: "optical", why: "F04: optics are not opaque patches" }, { path: "forms.0.cause", value: "airbrush", why: "unknown cause" }, { path: "material", value: "wall", why: "F46 wall cannot own a volume_turn" }, { path: "forms.0.depth", value: 0, why: "zero turn" }],
    falsifier: (r) => { const t = flatColorTest(r.elements); return { pass: t.pass, detail: t }; } }));
  // F62 edges: seam + cast shadow onto a NAMED receiver
  const EDGE = { sil: SIL, pal: PAL, seam: { s0: 0.55, s1: 0.75, width: 3, inset: 14, function: "placket" }, light: [-0.5, -1], groundY: 540, squash: 1.2 };
  const edgeP = (d) => { const p = solvePalette(d.pal); const s = constructSilhouette(d.sil); const occ = silhouetteElement("torso", s, p.materials.cloth.base, 2);
    const ground = constructSilhouette({ view: "front", identity: ["g1"], ...ring([["g1", 0, 540, "corner"], ["g2", 1000, 540, "corner"], ["g3", 1000, 700, "corner"], ["g4", 0, 700, "corner"]], [["straight", 0], ["straight", 0], ["straight", 0], ["straight", 0]]) });
    const gEl = silhouetteElement("ground", ground, p.roles.field, 0);
    const a = constructEdge({ owner: "torso", role: "MATERIAL_SEAM", material: "cloth", parent: occ, colors: p.materials.cloth, ...d.seam });
    const b = constructEdge({ owner: "torso", role: "CAST_SHADOW", material: "cloth", occluder: occ, light: d.light, receiver: { id: "ground", element: gEl, groundY: d.groundY, squash: d.squash }, colors: p.materials.cloth });
    const c = constructEdge({ owner: "torso", role: "COLOR_ADJACENCY", material: "cloth" });
    return { elements: [...a.elements, ...b.elements, ...c.elements], data: { adj: c.data } }; };
  R.push(prove({ method: "F62", class: "ART_DESIGN", name: "F62 constructEdge", base: EDGE, producer: edgeP, inputs: ["seam.s0", "seam.width", "light", "groundY", "squash"],
    perturb: [{ path: "seam.inset", value: 30, expect: /MATERIAL_SEAM/, confine: /MATERIAL_SEAM/ }, { path: "light", value: [0.6, -1], expect: /cast_on/, confine: /cast_on/ }, { path: "squash", value: 2.5, expect: /cast_on/, confine: /cast_on/ }],
    refuse: [{ path: "light", value: [0, 1], why: "light cannot travel upward onto a ground receiver" }] }));
  // F59 topology
  const PART = (cx, cy, w, h, sock) => ({ view: "front", identity: ["a"], ...ring([["a", cx, cy - h], ["b", cx + w, cy], ["c", cx, cy + h], ["d", cx - w, cy]].map(([i, x, y]) => [i, x, y, "smooth"])) });
  const TORSO = { view: "front", identity: ["a"], ...ring([["a", 400, 270, "corner"], ["b", 480, 400, "smooth"], ["hem", 455, 530, "corner"], ["c", 400, 520, "corner"], ["d", 330, 400, "smooth"]], [["convex", 0.1], ["concave", 0.06], ["straight", 0], ["straight", 0], ["convex", 0.14]]) };
  const TOPO = { id: "rig", pal: PAL, distinguishes: "diagnostic fixture: asymmetric hem corner + concave flank identify the root mass", parts: [
    { id: "torso", parent: null, design: TORSO, joint_type: "rooted", fillRole: "body" },
    { id: "arm", parent: "torso", design: PART(0, 0, 25, 90), socket: "a", anchor: "b", joint_type: "hinged", insertion_depth: 18, angle: -30, front: true, fillRole: "skin" },
    { id: "hand", parent: "arm", design: PART(0, 0, 22, 22), socket: "a", anchor: "c", joint_type: "inserted", insertion_depth: 8, angle: 0, front: true, fillRole: "skinShade" },
    { id: "head", parent: "torso", design: PART(0, 0, 60, 60), socket: "c", anchor: "a", joint_type: "inserted", insertion_depth: 20, angle: 0, front: false, fillRole: "skin" }] };
  const topoP = (d) => assemble({ ...d, colors: solvePalette(d.pal).roles });
  R.push(prove({ method: "F59", class: "GEOMETRY", name: "F59 assemble", base: TOPO, producer: (d) => { const r = topoP(d); return { elements: r.elements, data: { order: r.data.order } }; }, inputs: ["parts"],
    perturb: [{ path: "parts.1.angle", value: 40, expect: /rig\.(arm|hand)$/, confine: /rig\.(arm|hand)$/ }, { path: "parts.1.insertion_depth", value: 40, expect: /rig\.(arm|hand)$/, confine: /rig\.(arm|hand)$/ }, { path: "parts.0.design.landmarks.1.p", value: [520, 400], expect: /rig\.(torso|arm|hand)$/ }, { path: "parts.3.front", value: true, expect: /data:order|rig\./ }],
    refuse: [{ path: "parts.0.design", value: PART(400, 400, 80, 130), why: "ARTISTIC F01: default round root mass (sphere-with-cylinders class)" }, { path: "distinguishes", delete: true, why: "ARTISTIC F01: identity not named" }, { path: "parts.1.anchor", value: "elbow", why: "anchor not a parent landmark" }, { path: "parts.2.parent", value: "ghost", why: "parent missing" }, { path: "parts.1.joint_type", value: "glued", why: "unknown joint" }],
    falsifier: () => { const r = topoP(TOPO); return { pass: r.pass, detail: r.data.joints }; } }));
  // F05/F52/F65 head
  const HEAD = HEAD_FIXTURE;
  const headP = (d) => constructHead({ ...d, colors: solvePalette(d.pal).roles });
  R.push(prove({ method: "F65", class: "ART_DESIGN", name: "F05/F52/F65 constructHead", base: HEAD, producer: headP, inputs: ["role", "finalHeadPx", "gazeRequired", "skull", "hair", "frame.yaw", "eye.shape", "expression.brow_tilt", "expression.mouth_topology", "expression.gaze_offset"],
    perturb: [{ path: "expression.brow_tilt", value: 18, expect: /brow/, confine: /brow/ }, { path: "expression.gaze_offset", value: [0.8, 0], expect: /pupil/, confine: /pupil/ }, { path: "expression.mouth_topology", value: "wide_open", expect: /mouth/, confine: /mouth|data:/ },
      { path: "expression.lid_arc", value: 0.5, expect: /sclera|lid/, confine: /eye[LR]\.(sclera|lid|pupil)|data:/ }, { path: "finalHeadPx", value: 70, expect: /mark|sclera|data:eyeMode/ }, { path: "role", value: "BIOLOGICAL_SUBJECT", expect: /data:eyeMode/ },
      { path: "frame.yaw", value: -75, expect: /eye|nose|data:features/ }, { path: "expression.cheek_shape", value: "raised", expect: /cheek/, confine: /cheek|data:features|data:markCount/ }, { path: "eye.shape", value: "hooded", expect: /sclera/ }, { path: "features.earShape.landmarks.2.p", value: [0.6, 1.3], expect: /ear/, confine: /ear[LR]$/ }],
    refuse: [{ path: "role", value: "cute", why: "not an F52 role" }, { path: "expression.mouth_topology", value: "oval", why: "scaled-oval mouth not a topology" }, { path: "hair", value: {}, why: "no hair construction and not declared bald" }, { path: "eye.shape", value: "anime", why: "unknown eye construction" }, { path: "features.earShape", delete: true, why: "no authored ear contour (no generic ellipse fallback)" }, { path: "skull.landmarks.2.id", value: "side", why: "ARTISTIC F05: skull without jaw/chin structure" }, { path: "skull.landmarks", value: (ls) => ls.map((l) => ({ ...l, joint: "smooth" })), why: "ARTISTIC F05: unstructured oval skull (no jaw turn)" }, { path: "frame", value: (f) => ({ ...f, rx: 20, ry: 24 }), why: "ARTISTIC F05: tiny face on huge skull" }],
    falsifier: () => { // F05: profile omits the hidden eye; F65: rear hides features; identity contour unchanged by expression
      const prof = headP({ ...HEAD, frame: { ...HEAD.frame, yaw: -80 } }), rear = headP({ ...HEAD, frame: { ...HEAD.frame, yaw: 160 } });
      const e1 = headP(HEAD), e2 = headP({ ...HEAD, expression: { ...HEAD.expression, brow_tilt: 20, mouth_topology: "smile", mouth_open: 0.5 } });
      const sk = (r) => r.elements.filter((e) => /skull|hair/.test(e.id)).map((e) => e.d).join("|");
      const eyesProf = prof.elements.filter((e) => /eye[LR]\.(sclera|mark)/.test(e.id)).length;
      return { pass: eyesProf === 1 && rear.data.eyeMode === "HIDDEN_REAR" && rear.data.markCount === 0 && sk(e1) === sk(e2), detail: { eyesInProfile: eyesProf, rear: rear.data.eyeMode, identityStable: sk(e1) === sk(e2) } }; } }));
  return R;
}

// pixel evidence: head producer under changed inputs (states are the SAME identity contours; only action units / frame change)
export async function pixels(EV) {
  const { compose } = await import("../emit.mjs"), { render, sheet, writePNG } = await import("../render.mjs");
  const H = HEAD_FIXTURE;
  const pal = solvePalette(PAL), mk = (o) => constructHead({ ...H, ...o, expression: { ...H.expression, ...(o.expression || {}) }, frame: { ...H.frame, ...(o.frame || {}) }, colors: pal.roles });
  const states = [{}, { expression: { brow_tilt: 20, brow_raise: -0.2, mouth_topology: "frown" } }, { expression: { mouth_topology: "smile", mouth_open: 0.6, cheek_shape: "raised", gaze_offset: [0.7, -0.2] } }, { expression: { mouth_topology: "wide_open", brow_raise: 0.5, lid_arc: -0.3 } }, { frame: { yaw: -80 } }, { frame: { yaw: 160 } }, { finalHeadPx: 60 }];
  const ims = states.map((o) => render(compose("head", mk(o).elements), { W: 220, H: 260, view: [280, 110, 260, 320], bg: pal.roles.field }));
  writePNG(`${EV}/F05_F65_head_states.png`, sheet(ims));
}
