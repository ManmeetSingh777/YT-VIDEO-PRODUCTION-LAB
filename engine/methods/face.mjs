// F05 + F52 + F65 (CHARACTER_FAMILY_CONSTRUCTOR B.3–B.4, B.7) — head, hair and facial-state fabrication.
// Source order (F05): cranial + hair masses → exposed facial plane (ear/cheek/jaw) → eye system with near/far size & occlusion
// (profile omits hidden eye) → expression (brow curvature/vertical relation, lid shape, mouth open/closed interior, cheek tension,
// head tilt) → accessory contact → pose coupling.
// F65: face_eye_mode chosen AFTER final projected head size and emotional function are known; features anchored to named local face
// coordinates (skull oval, median line, eye-line, nose/cheek wedge, brows); white/iris/mouth clipped to parents; expression is a linked
// action unit (brow_tilt, lid_arc, gaze_offset, cheek_shape, mouth_topology); gaze/brows rotate with the face frame; identity contours
// stay registered across expression states. F52: feature count from the FINAL on-screen footprint and narrative role.
// Producing operation: face-frame (u = angle around the head, v = vertical fraction) → projection on the head ellipsoid with
// yaw/pitch/roll → foreshortened, visibility-tested, parent-clipped feature contours.
import { need, add, sub, mul, rot, deg, ellipsePts, polyPath, smoothOpen, smoothClosedPath, lerp2 } from "./core.mjs";
import { constructSilhouette } from "./contour.mjs";
import { emitRegion, registerProducer } from "./emit.mjs";
import { assertSolved } from "./palette.mjs";
import { RULES } from "./knowledge.mjs";

/** an AUTHORED feature contour (landmarks in a local unit frame, x,y ∈ [-1,1]) placed into the face frame: centre, scale (sx,sy), roll.
 *  Used for ears/cheek patches/dark marks so no generic ellipse/circle template becomes a visible feature. */
function placeLocal(design, c, sx, sy, rollDeg, mirror = 1) {
  const map = (p) => rot([c[0] + mirror * p[0] * sx, c[1] + p[1] * sy], rollDeg, c);
  const spans = mirror < 0 ? design.spans : design.spans; // mirroring flips orientation; buildRing normalises orientation
  return constructSilhouette({ ...design, landmarks: design.landmarks.map((l) => ({ ...l, p: map(l.p) })), spans }).d;
}
// NOTE: the head "ellipsoid" (rx, ry, yaw, pitch, roll) is an INVISIBLE projection frame used only to place and foreshorten features.
// It is never minted. The visible head is always the subject-authored skull + hair contours (F05 step 1).
export const ROLES = ["ACTING_CUE", "BIOLOGICAL_SUBJECT", "SILHOUETTE_IDENTITY", "MICRO_SYMBOL", "SUPPORTING_BACKGROUND"];
export const EYE_MODES = ["ANATOMICAL_SUBJECT", "WHITE_SCLERA_ACTOR", "DARK_MARK_ACTOR", "CLOSED_LID_ARC", "REDUCED_ICON", "HIDDEN_REAR"];
export const MOUTHS = ["closed", "small_open", "wide_open", "smile", "frown"];

/** F65/F52 derivation table (thresholds are engineering bounds for the role/size rule, not source-measured studio ratios) */
export function selectEyeMode({ role, finalHeadPx, gazeRequired, yaw, lidClosed }) {
  if (role === "BIOLOGICAL_SUBJECT") return { mode: "ANATOMICAL_SUBJECT", why: "the eye IS the demonstrated object (BRAIN@51)" };
  if (Math.abs(yaw) > 110) return { mode: "HIDDEN_REAR", why: "rear view: suppress hidden front features (AI@285)" };
  if (role === "SUPPORTING_BACKGROUND" || role === "MICRO_SYMBOL" || finalHeadPx < 28) return { mode: "REDUCED_ICON", why: `final head ${finalHeadPx}px cannot resolve a scleral hierarchy` };
  if (lidClosed) return { mode: "CLOSED_LID_ARC", why: "closed lids: continuous bent mark, no globe (BRAIN@334)" };
  if (role === "ACTING_CUE" && finalHeadPx >= 140 && gazeRequired) return { mode: "WHITE_SCLERA_ACTOR", why: "close acting crop with tracked gaze (BRAIN@274 class)" };
  if (finalHeadPx >= 40) return { mode: "DARK_MARK_ACTOR", why: "mid-size actor: dark mark + lid/brow relation, sclera optional (NUCLEAR@145)" };
  return { mode: "REDUCED_ICON", why: "below dark-mark resolution" };
}
const BUDGET = { ANATOMICAL_SUBJECT: 99, WHITE_SCLERA_ACTOR: 14, DARK_MARK_ACTOR: 9, CLOSED_LID_ARC: 7, REDUCED_ICON: 2, HIDDEN_REAR: 0 };

/** constructHead(design) — design keys documented inline; every feature is computed from the face frame + action units */
function constructHead__impl(design) {
  need("F05 head", design, { id: "str", role: ROLES, finalHeadPx: "num+", gazeRequired: "bool", skull: "obj", frame: "obj", hair: "obj", eye: "obj", expression: "obj", features: "obj", layer: "num" });
  const F = need("F65 face frame", design.frame, { center: "vec2", rx: "num+", ry: "num+", yaw: "num", pitch: "num", roll: "num", eyeLine: "num", eyeSpread: "num+", mouthLine: "num", noseLine: "num" });
  const E = need("F05 eye design", design.eye, { shape: ["almond", "round", "hooded", "narrow"], width: "num+", height: "num+" });
  const X = need("F65 expression", design.expression, { brow_tilt: "num", brow_raise: "num", lid_arc: "num", gaze_offset: "vec2", cheek_shape: ["relaxed", "raised", "tense"], mouth_topology: MOUTHS, mouth_open: "num" });
  const FT = need("F05 features", design.features, { browWeight: "num+", browLength: "num+", noseProjection: "num", noseWidth: "num+", mouthWidth: "num+", earSize: "num+", earShape: "obj", cheekShape: "obj", markShape: "obj" });
  const C = assertSolved(design.colors, `F05 head ${design.id}`);
  for (const r of ["skin", "skinShade", "hair", "eyeDark", "mouthInterior", "brow"]) if (!C[r]) throw new Error(`F05 head ${design.id}: solved palette lacks role "${r}"`);
  const em = design.eyeModeOverride ? (need("F65 override", design.eyeModeOverride, { mode: EYE_MODES, reason: "str", witness: "str" }), { mode: design.eyeModeOverride.mode, why: `override: ${design.eyeModeOverride.reason} (${design.eyeModeOverride.witness})` })
    : selectEyeMode({ role: design.role, finalHeadPx: design.finalHeadPx, gazeRequired: design.gazeRequired, yaw: F.yaw, lidClosed: X.lid_arc >= 0.95 });
  const id = design.id, L0 = design.layer, els = [], data = { eyeMode: em.mode, why: em.why, budget: BUDGET[em.mode], features: [] };

  // --- face frame projection: (u deg around head, v fraction) → screen; facing = cos of the turned angle (foreshortening & visibility)
  const proj = (u, v) => {
    const a = deg(u + F.yaw), x = F.center[0] + F.rx * Math.sin(a), y = F.center[1] + F.ry * v + F.ry * Math.sin(deg(F.pitch)) * Math.cos(a) * 0.35;
    return { p: rot([x, y], F.roll, F.center), facing: Math.cos(a) };
  };

  // 1. cranial mass and hair masses (authored identity contours; independent of expression)
  RULES.F05_skull_structure(design.skull, `F05 head ${id}`);
  const skull = constructSilhouette(design.skull);
  const hairLobes = (design.hair.lobes || []).map((h, i) => { need(`F05 hair lobe ${i}`, h, { id: "str", design: "obj", front: "bool", root: "str" }); return { ...h, sil: constructSilhouette(h.design) }; });
  if (!hairLobes.length && design.hair.bald !== true) throw new Error(`F05 head ${id}: author hair lobes (contiguous masses with roots) or declare hair.bald = true`);
  for (const h of hairLobes.filter((h) => !h.front)) els.push(emitRegion(["F05"], "constructHead.hair_back", { id: `${id}.hair.${h.id}`, d: h.sil.d, fill: C.hair, layer: L0 - 0.1, owner: id }, ["hair.lobes"]));
  // 2. exposed facial plane = skull (features clip to it; front hair lobes conceal parts of it)
  els.push(emitRegion(["F05", "F02"], "constructHead.face_plane", { id: `${id}.skull`, d: skull.d, fill: C.skin, layer: L0, owner: id }, ["skull"]));
  const clip = skull.d, add_ = (fn, eid, d, fill, l, reads, extra = {}) => { els.push(emitRegion(["F05", "F65"], `constructHead.${fn}`, { id: `${id}.${eid}`, d, fill, clip, layer: L0 + l, owner: id, ...extra }, reads)); data.features.push(eid); };

  // ear: side of head, visible near the silhouette edge of the turned side
  for (const side of [-1, 1]) {
    const e = proj(side * 88, F.eyeLine + 0.12); if (e.facing < -0.25 || em.mode === "HIDDEN_REAR" && false) continue;
    if (e.facing > 0.55) continue; // ear seen edge-on into the face plane only when turned; in front view it sits at the contour
    const s = FT.earSize * F.ry * 0.25, w = s * (0.55 + 0.45 * (1 - Math.abs(e.facing)));
    const earD = placeLocal(FT.earShape, e.p, w, s, F.roll, side);
    els.push(emitRegion(["F05"], "constructHead.ear", { id: `${id}.ear${side > 0 ? "R" : "L"}`, d: earD, fill: C.skinShade, layer: L0 + 0.05, owner: id }, ["features.earSize", "features.earShape", "frame.yaw"]));
  }
  // 3. eye system
  const eyes = [];
  for (const side of [-1, 1]) {
    const c = proj(side * F.eyeSpread, F.eyeLine);
    if (c.facing <= 0.18) { data.features.push(`eye${side > 0 ? "R" : "L"}:omitted(hidden by head turn)`); continue; } // F05: omit hidden eye, never duplicate symmetrically
    const fs = Math.max(0.25, c.facing), w = E.width * F.rx * fs, h = E.height * F.ry;
    eyes.push({ side, c: c.p, w, h, fs, near: c.facing >= proj(-side * F.eyeSpread, F.eyeLine).facing });
  }
  const lidDrop = Math.max(-0.4, Math.min(0.95, X.lid_arc));
  const opening = (e) => { // eye opening: upper and lower lid curves between inner and outer corners (shape-specific peak)
    const peak = { almond: 0.38, round: 0.5, hooded: 0.55, narrow: 0.45 }[E.shape], upH = e.h * (1 - lidDrop) * (E.shape === "narrow" ? 0.6 : 1), loH = e.h * (E.shape === "round" ? 0.85 : 0.55);
    const inner = add(e.c, [-e.side * e.w / 2, 0]), outer = add(e.c, [e.side * e.w / 2, 0]), up = [], lo = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10, x = lerp2(inner, outer, t); const bump = t < peak ? Math.sin((Math.PI / 2) * (t / peak)) : Math.sin((Math.PI / 2) * ((1 - t) / (1 - peak))); up.push(add(x, [0, -upH * bump])); lo.push(add(x, [0, loH * Math.sin(Math.PI * t) * 0.9])); }
    return { d: polyPath([...up, ...lo.reverse().slice(1, -1)].map((p) => rot(p, F.roll, e.c))), up };
  };
  for (const e of eyes) {
    const tag = e.side > 0 ? "R" : "L";
    if (em.mode === "WHITE_SCLERA_ACTOR" || em.mode === "ANATOMICAL_SUBJECT") {
      const o = opening(e), sc = emitRegion(["F05", "F65"], "constructHead.sclera", { id: `${id}.eye${tag}.sclera`, d: o.d, fill: C.sclera || "#ffffff", clip, layer: L0 + 0.1, owner: id }, ["eye.shape", "eye.width", "expression.lid_arc", "frame.yaw"]);
      if (!C.sclera) throw new Error(`F65 ${em.mode} requires a solved "sclera" role`);
      els.push(sc); data.features.push(`eye${tag}.sclera`);
      const pc = add(e.c, [X.gaze_offset[0] * e.w * 0.28, X.gaze_offset[1] * e.h * 0.25]), pr = e.h * (em.mode === "ANATOMICAL_SUBJECT" ? 0.62 : 0.46);
      if (em.mode === "ANATOMICAL_SUBJECT") { if (!C.iris) throw new Error("F65 ANATOMICAL_SUBJECT requires an iris role"); els.push(emitRegion(["F65"], "constructHead.iris", { id: `${id}.eye${tag}.iris`, d: smoothClosedPath(ellipsePts(pc, pr * e.fs, pr, 20)), fill: C.iris, clip: o.d, layer: L0 + 0.11, owner: id }, ["expression.gaze_offset"])); }
      els.push(emitRegion(["F05", "F65"], "constructHead.pupil", { id: `${id}.eye${tag}.pupil`, d: smoothClosedPath(ellipsePts(pc, (em.mode === "ANATOMICAL_SUBJECT" ? 0.45 : 1) * pr * e.fs, (em.mode === "ANATOMICAL_SUBJECT" ? 0.45 : 1) * pr, 16)), fill: C.eyeDark, clip: o.d, layer: L0 + 0.12, owner: id }, ["expression.gaze_offset", "eye.height"]));
      // upper lid patch: band between the lid curve and a crease raised above it (skin shade), parented to the face plane
      const crease = o.up.map((p) => add(p, [0, -e.h * 0.32])); add_("lid", `eye${tag}.lid`, polyPath([...o.up, ...crease.reverse()].map((p) => rot(p, F.roll, e.c))), C.skinShade, 0.13, ["expression.lid_arc"]);
    } else if (em.mode === "DARK_MARK_ACTOR") {
      const pc = add(e.c, [X.gaze_offset[0] * e.w * 0.12, X.gaze_offset[1] * e.h * 0.1]), rr = e.h * 0.55 * (1 - 0.6 * lidDrop);
      add_("mark", `eye${tag}.mark`, placeLocal(FT.markShape, pc, rr * 0.8 * e.fs, Math.max(1, rr), F.roll, e.side), C.eyeDark, 0.12, ["eye.height", "expression.lid_arc", "expression.gaze_offset", "features.markShape"]);
    } else if (em.mode === "CLOSED_LID_ARC") {
      const arc = []; for (let k = 0; k <= 8; k++) { const t = k / 8; arc.push(rot(add(e.c, [(t - 0.5) * e.w, Math.sin(Math.PI * t) * e.h * 0.35]), F.roll, e.c)); }
      els.push(emitRegion(["F65", "F02"], "constructHead.closed_lid_arc", { id: `${id}.eye${tag}.lidArc`, d: smoothOpen(arc), stroke: C.eyeDark, strokeWidth: Math.max(1.2, e.h * 0.22), clip, layer: L0 + 0.12, owner: id, edgeRole: "INTERNAL_CREASE" }, ["eye.width"])); data.features.push(`eye${tag}.lidArc`);
    } else if (em.mode === "REDUCED_ICON") {
      if (e.near || eyes.length === 1) add_("icon", `eye${tag}.icon`, placeLocal(FT.markShape, e.c, Math.max(1, e.h * 0.4), Math.max(1, e.h * 0.4), F.roll, e.side), C.eyeDark, 0.12, ["finalHeadPx"]);
    }
    // brows (ACTING modes): tapered block above each eye, tilt + raise from the action unit, rotating with the face frame
    if (["WHITE_SCLERA_ACTOR", "DARK_MARK_ACTOR", "CLOSED_LID_ARC"].includes(em.mode)) {
      const by = -e.h * (1.4 + X.brow_raise), len_ = FT.browLength * e.w, th = FT.browWeight * e.h * 0.4, tilt = X.brow_tilt * -e.side;
      const a = add(e.c, [-e.side * len_ * 0.5, by]), b = add(e.c, [e.side * len_ * 0.5, by]);
      const ra = rot(a, tilt, e.c), rb = rot(b, tilt, e.c), n = [0, -th];
      const shape = [ra, lerp2(ra, rb, 0.5), rb, add(rb, mul(n, 0.4)), add(lerp2(ra, rb, 0.45), n), add(ra, mul(n, 0.9))].map((p) => rot(p, F.roll, e.c));
      add_("brow", `eye${tag}.brow`, smoothClosedPath(shape), C.brow, 0.14, ["expression.brow_tilt", "expression.brow_raise", "features.browWeight"]);
    }
  }
  if (em.mode !== "HIDDEN_REAR" && em.mode !== "REDUCED_ICON") {
    // nose: wedge on the median line, projecting toward the turn side by its depth
    const top = proj(0, F.eyeLine + 0.08), tipBase = proj(0, F.noseLine), tip = add(tipBase.p, [Math.sin(deg(F.yaw)) * FT.noseProjection * F.rx, 0]);
    const wN = FT.noseWidth * F.rx * Math.max(0.35, tipBase.facing);
    add_("nose", "nose", smoothClosedPath([top.p, add(tip, [wN * 0.5, 0]), add(tip, [0, F.ry * 0.03]), add(tip, [-wN * 0.5, 0])]), C.skinShade, 0.09, ["features.noseProjection", "features.noseWidth", "frame.yaw"]);
    // cheek tension patch
    if (X.cheek_shape !== "relaxed") for (const e of eyes) { const c = proj(e.side * (F.eyeSpread + 6), F.eyeLine + (X.cheek_shape === "raised" ? 0.22 : 0.3)); if (c.facing > 0.2) add_("cheek", `cheek${e.side > 0 ? "R" : "L"}`, placeLocal(FT.cheekShape, c.p, F.rx * 0.16 * c.facing, F.ry * 0.07, F.roll, e.side), C.cheek || C.skinShade, 0.08, ["expression.cheek_shape", "features.cheekShape"]); }
    // mouth: actual open/closed topology (never a scaled oval)
    const half = FT.mouthWidth * F.eyeSpread, L = proj(-half, F.mouthLine), Rr = proj(half, F.mouthLine), mid = proj(0, F.mouthLine);
    const curve = { closed: 0, small_open: 0.1, wide_open: 0.1, smile: 0.6, frown: -0.6 }[X.mouth_topology], w = Math.abs(Rr.p[0] - L.p[0]);
    const openH = (X.mouth_topology === "wide_open" ? 0.5 : X.mouth_topology === "small_open" ? 0.25 : X.mouth_topology === "smile" ? 0.2 * X.mouth_open : 0) * F.ry * Math.max(0.05, X.mouth_open || 0.05);
    const upper = [], lower = [];
    for (let k = 0; k <= 10; k++) { const t = k / 10, base = lerp2(L.p, Rr.p, t), s = Math.sin(Math.PI * t); upper.push(add(base, [0, s * curve * w * 0.18 - s * openH * 0.25])); lower.push(add(base, [0, s * curve * w * 0.18 + s * (openH + w * 0.05)])); }
    if (X.mouth_topology === "closed" || (X.mouth_topology === "frown" && openH < 1)) add_("mouth", "mouth", polyPath([...upper, ...lower.slice().reverse()]), C.mouthInterior, 0.1, ["expression.mouth_topology"]);
    else add_("mouth", "mouth", polyPath([...upper, ...lower.slice().reverse()]), C.mouthInterior, 0.1, ["expression.mouth_topology", "expression.mouth_open"]);
    data.mouth = { topology: X.mouth_topology, width: +w.toFixed(1), openH: +openH.toFixed(1), center: mid.p };
  }
  // front hair lobes conceal skull/brow regions (F05 step 1: hair wraps the skull)
  for (const h of hairLobes.filter((h) => h.front)) els.push(emitRegion(["F05"], "constructHead.hair_front", { id: `${id}.hair.${h.id}`, d: h.sil.d, fill: C.hair, layer: L0 + 0.3, owner: id }, ["hair.lobes"]));
  RULES.F05_face_proportion(skull.d, els.filter((e) => /eye[LR]\.(sclera|mark|icon|lidArc)|mouth$/.test(e.id)), `F05 head ${id}`);
  const marks = els.filter((e) => /eye|brow|nose|mouth|cheek|lid/.test(e.id)).length;
  data.markCount = marks; data.withinBudget = marks <= data.budget;
  if (!data.withinBudget) throw new Error(`F52 ${id}: ${marks} facial marks exceed the ${em.mode} budget ${data.budget} for a ${design.finalHeadPx}px head`);
  return { method: ["F05", "F52", "F65"], elements: els, skull, data };
}

// Gate A: catalogued producers (bindings.mjs). Calls are traced; regions can only be emitted inside these calls.
export const constructHead = registerProducer("face.constructHead", constructHead__impl);
