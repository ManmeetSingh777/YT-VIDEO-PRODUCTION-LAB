// F05 + F30 + F52 + F65 (+F02/F04 face planes) — view-registered face construction (spec §4.4). Replaces the ellipsoid/formula face.
// Input is an authored FaceDesign: per view, the skull contour, hair lobes (front/back of skull), ear, face planes (with a facing normal),
// and named feature specs in that view's own face-plane coordinates (origin = head centre, units = px at reference head height 200).
// Expression states are linked deltas on those features (brows, lids, pupils, mouth topology, cheek). The F65 table decides the eye
// CONSTRUCTION mode from role × final px × gaze × view; the shapes drawn in each mode come from the identity's own design.
// Nothing here supplies a default face: a missing view, feature or state is DESIGN_UNRESOLVED.
import { need, add, sub, mul, rot, lerp2, polyPath, smoothOpen, nrm, dot } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { selectEyeMode, ROLES } from "./face.mjs";
import { DesignUnresolved } from "./contracts.mjs";

const VIEWS = ["front", "three_quarter_left", "profile_left", "rear"];
const YAW = { front: 0, three_quarter_left: -40, profile_left: -85, rear: 180 };
const MARKS = { WHITE_SCLERA_ACTOR: 14, DARK_MARK_ACTOR: 9, CLOSED_LID_ARC: 7, REDUCED_ICON: 2, HIDDEN_REAR: 0, ANATOMICAL_SUBJECT: 99 };

function constructFaceView__impl(fd, req) {
  need("F05 face design", fd, { identity: "str", skullByView: "obj", hairByView: "obj", featuresByView: "obj", planesByView: "obj", expressionStates: "obj", eyeShape: "obj", markShape: "obj", decision: "str" });
  need("F30 view request", req, { view: VIEWS, state: "str", finalHeadPx: "num+", role: ROLES, gazeRequired: "bool", center: "vec2", light: "vec2", layer: "num" });
  const C = assertSolved(fd.colors, `F05 face ${fd.identity}`), v = req.view, k = req.finalHeadPx / 200, roll = req.roll ?? 0;
  for (const part of ["skullByView", "hairByView", "featuresByView", "planesByView"]) if (!fd[part][v]) throw new DesignUnresolved([`${fd.identity}.${part}.${v}`]);
  const X = fd.expressionStates[req.state]; if (!X) throw new DesignUnresolved([`${fd.identity}.expressionStates.${req.state}`]);
  const T = (p) => rot(add(req.center, mul(p, k)), roll, req.center); // face-plane local → screen
  const local = (design) => constructSilhouette({ ...design, featureContour: true, view: design.view || "front", identity: design.identity || [design.landmarks[0].id], landmarks: design.landmarks.map((l) => ({ ...l, p: T(l.p) })) });
  const els = [], L = req.layer, id = `${fd.identity}.${v}.${req.state}`, data = { view: v, state: req.state, features: [] };
  const mode = selectEyeMode({ role: req.role, finalHeadPx: req.finalHeadPx, gazeRequired: req.gazeRequired, yaw: YAW[v], lidClosed: (X.lidClose ?? 0) >= 0.95 });
  data.eyeMode = mode.mode; data.why = mode.why; data.budget = MARKS[mode.mode];
  // 1. hair behind skull → skull → face planes → features → ear → hair in front (F05 step order)
  const hair = fd.hairByView[v];
  for (const h of hair.filter((h) => !h.front)) els.push(emitRegion(["F05", "F30"], "constructFaceView.hair_back", { id: `${id}.hair.${h.id}`, d: local(h).d, fill: C[h.tone || "hair"], layer: L - 0.2, owner: fd.identity }, []));
  const skull = local(fd.skullByView[v]);
  els.push(emitRegion(["F05", "F30", "F02"], "constructFaceView.skull", { id: `${id}.skull`, d: skull.d, fill: C.skin, layer: L, owner: fd.identity }, []));
  // face planes: tone from the plane's authored facing normal against the scene light (F04 opaque form; no shifted-silhouette crescent)
  const Lv = nrm(req.light);
  for (const pl of fd.planesByView[v]) { need(`F05 plane ${pl.id}`, pl, { id: "str", cause: ["jaw_turn", "cheek_plane", "brow_shadow", "under_nose", "neck_shadow", "temple_turn"], normal: "vec2", landmarks: "arr", spans: "arr" });
    const facing = dot(nrm(pl.normal), Lv); if (facing > 0.25 && pl.cause !== "brow_shadow" && pl.cause !== "under_nose") continue; // lit plane merges with base skin
    els.push(emitRegion(["F05", "F02", "F04"], "constructFaceView.face_plane", { id: `${id}.plane.${pl.id}`, d: local(pl).d, clip: skull.d, fill: pl.cause === "neck_shadow" || pl.cause === "under_nose" ? C.skinDeep : C.skinShade, layer: L + 0.02, owner: fd.identity, cause: pl.cause }, [])); }
  const F = fd.featuresByView[v];
  if (mode.mode !== "HIDDEN_REAR") {
    if (v === "profile_left" && F.eyeFar) throw new Error(`F05 ${fd.identity}: profile view must omit the hidden far eye (source: "In a profile, omit the hidden eye")`);
    if (v === "rear" && (F.eyeNear || F.mouth)) throw new Error(`F65 ${fd.identity}: rear view cannot carry frontal features`);
    for (const side of ["Near", "Far"]) {
      const e = F[`eye${side}`]; if (!e) continue;
      const open = Math.max(0.05, Math.min(1.3, (e.open ?? 1) + (X.lidOpen ?? 0)));
      const sc = (des, cx, w, h, lidK = 1) => ({ ...des, landmarks: des.landmarks.map((l) => ({ ...l, p: add(cx, [l.p[0] * w, l.p[1] * h * (l.p[1] < 0 ? lidK : 1)]) })) });
      if (mode.mode === "WHITE_SCLERA_ACTOR") {
        const opening = local(sc(fd.eyeShape, e.center, e.w / 2, e.h / 2, open));
        els.push(emitRegion(["F65", "F05"], "constructFaceView.sclera", { id: `${id}.eye${side}.sclera`, d: opening.d, clip: skull.d, fill: C.sclera, layer: L + 0.1, owner: fd.identity }, []));
        const g = add(e.center, [(X.gaze?.[0] ?? 0) * e.w * 0.25, (X.gaze?.[1] ?? 0) * e.h * 0.2]);
        els.push(emitRegion(["F65"], "constructFaceView.pupil", { id: `${id}.eye${side}.pupil`, d: local(sc(fd.pupilShape || fd.markShape, g, e.h * 0.42, e.h * 0.48)).d, clip: opening.d, fill: C.eyeDark, layer: L + 0.11, owner: fd.identity }, []));
        const lidTop = fd.eyeShape.landmarks.filter((l) => l.p[1] <= 0).map((l) => T(add(e.center, [l.p[0] * e.w / 2, l.p[1] * e.h / 2 * open])));
        els.push(emitRegion(["F65", "F02"], "constructFaceView.lid_line", { id: `${id}.eye${side}.lid`, d: smoothOpen(lidTop), stroke: C.eyeDark, strokeWidth: Math.max(1.5, e.h * k * 0.28), layer: L + 0.12, owner: fd.identity, edgeRole: "INTERNAL_CREASE" }, []));
      } else if (mode.mode === "DARK_MARK_ACTOR") {
        const g = add(e.center, [(X.gaze?.[0] ?? 0) * e.w * 0.12, 0]);
        els.push(emitRegion(["F65", "F05"], "constructFaceView.dark_mark", { id: `${id}.eye${side}.mark`, d: local(sc(fd.markShape, g, e.h * 0.42, e.h * 0.62 * Math.max(0.35, open))).d, clip: skull.d, fill: C.eyeDark, layer: L + 0.1, owner: fd.identity }, []));
      } else if (mode.mode === "CLOSED_LID_ARC") {
        const pts = [-1, -0.5, 0, 0.5, 1].map((t) => T(add(e.center, [t * e.w / 2, (1 - t * t) * e.h * 0.25])));
        els.push(emitRegion(["F65"], "constructFaceView.closed_lid", { id: `${id}.eye${side}.lidArc`, d: smoothOpen(pts), stroke: C.eyeDark, strokeWidth: Math.max(1.5, e.h * k * 0.25), layer: L + 0.1, owner: fd.identity, edgeRole: "INTERNAL_CREASE" }, []));
      } else if (mode.mode === "REDUCED_ICON" && side === "Near") {
        els.push(emitRegion(["F65", "F52"], "constructFaceView.icon", { id: `${id}.eye${side}.icon`, d: local(sc(fd.markShape, e.center, e.h * 0.5, e.h * 0.5)).d, clip: skull.d, fill: C.eyeDark, layer: L + 0.1, owner: fd.identity }, []));
      }
      // brows: authored 4-point brow per view + expression delta on inner/outer ends (linked action unit)
      const b = F[`brow${side}`];
      if (b && ["WHITE_SCLERA_ACTOR", "DARK_MARK_ACTOR", "CLOSED_LID_ARC"].includes(mode.mode)) {
        const dIn = X[`brow${side}`]?.inner ?? X.brow?.inner ?? [0, 0], dOut = X[`brow${side}`]?.outer ?? X.brow?.outer ?? [0, 0];
        // R4 fix: the brow is the identity's AUTHORED shape (unit frame: x 0 = inner end → 1 = outer end, y in thickness units, y<0 up),
        // mapped onto the view's inner/outer points; the expression moves the ends and arch (linked action unit). No formula fallback.
        if (!fd.browShape) throw new DesignUnresolved([`${fd.identity}.browShape`]);
        const inner = add(b.inner, dIn), outer = add(b.outer, dOut), ax = sub(outer, inner), ay = [-ax[1] / (Math.hypot(...ax) || 1), ax[0] / (Math.hypot(...ax) || 1)], arch = (b.arch ?? 3) + (X.browArch ?? 0);
        const pts = fd.browShape.landmarks.map((l) => T(add(add(inner, mul(ax, l.p[0])), mul(ay, l.p[1] * b.thick - arch * Math.sin(Math.PI * Math.min(1, Math.max(0, l.p[0])))))));
        els.push(emitRegion(["F05", "F65"], "constructFaceView.brow", { id: `${id}.brow${side}`, d: constructSilhouette({ featureContour: true, view: "front", identity: [fd.browShape.landmarks[0].id], landmarks: fd.browShape.landmarks.map((l, i) => ({ ...l, p: pts[i] })), spans: fd.browShape.spans }).d, fill: C.brow, layer: L + 0.13, owner: fd.identity }, []));
      }
    }
    const reduced = mode.mode === "REDUCED_ICON"; // F52: at icon scale collapse interior marks to the few that carry the acting cue
    if (F.nose && !reduced) els.push(emitRegion(["F05"], "constructFaceView.nose", { id: `${id}.nose`, d: local(F.nose).d, clip: skull.d, fill: C.skinShade, layer: L + 0.09, owner: fd.identity }, []));
    if (F.mouth && (!reduced || (X.mouth?.topology && X.mouth.topology !== "closed"))) {
      // R4 fix: mouth geometry = the identity's AUTHORED contour for this topology (unit frame: x −1 = left corner → +1 = right corner,
      // y in mouth-width units, y>0 down). Expression: cornerDy lifts/lowers the corners; open scales the opening. No formula fallback.
      const m = F.mouth, topo = X.mouth?.topology ?? "closed", shape = fd.mouthShapes?.[topo]; if (!shape) throw new DesignUnresolved([`${fd.identity}.mouthShapes.${topo}`]);
      const cd = X.mouth?.cornerDy ?? 0, openK = 1 + (X.mouth?.open ?? 0) / 10, ax = sub(m.right, m.left), half = Math.hypot(...ax) / 2, ux = mul(ax, 1 / (2 * half)), uy = [-ux[1], ux[0]], c0 = lerp2(m.left, m.right, 0.5);
      const pts = shape.landmarks.map((l) => { const x = l.p[0], y = l.p[1] * (l.p[1] > 0 ? openK : 1) + (cd / half) * x * x; return T(add(add(add(c0, [0, m.mid[1] - c0[1]]), mul(ux, x * half)), mul(uy, y * half))); });
      els.push(emitRegion(["F05", "F65"], "constructFaceView.mouth", { id: `${id}.mouth`, d: constructSilhouette({ featureContour: true, view: "front", identity: [shape.landmarks[0].id], landmarks: shape.landmarks.map((l, i) => ({ ...l, p: pts[i] })), spans: shape.spans }).d, clip: skull.d, fill: C.mouth, layer: L + 0.1, owner: fd.identity }, []));
      data.mouth = topo;
    }
    if (X.cheek && F.cheek && !reduced) els.push(emitRegion(["F05", "F02"], "constructFaceView.cheek", { id: `${id}.cheek`, d: local(F.cheek).d, clip: skull.d, fill: C.cheek, layer: L + 0.05, owner: fd.identity }, []));
  }
  if (F.ear) els.push(emitRegion(["F05", "F30"], "constructFaceView.ear", { id: `${id}.ear`, d: local(F.ear).d, fill: C.skinShade, layer: L + 0.15, owner: fd.identity }, []));
  for (const h of hair.filter((h) => h.front)) els.push(emitRegion(["F05", "F30"], "constructFaceView.hair_front", { id: `${id}.hair.${h.id}`, d: local(h).d, fill: C[h.tone || "hair"], layer: L + 0.3, owner: fd.identity }, []));
  const marks = els.filter((e) => /eye|brow|nose|mouth|cheek/.test(e.id)).length; data.markCount = marks;
  if (marks > data.budget) throw new Error(`F52 ${id}: ${marks} facial marks exceed the ${mode.mode} budget ${data.budget} at ${req.finalHeadPx}px`);
  return { method: ["F05", "F30", "F52", "F65"], elements: els, data, skull: skull.d };
}
export const constructFaceView = registerProducer("faceview.constructFaceView", constructFaceView__impl);
