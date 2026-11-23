// STAGED CONSTRUCTOR — F01–F80 construction PROCEDURES executed as gated stages (2D authored geometry).
// The skill's knowledge acts here in three ways:
//   (1) ORDER      stages run in the skill's dependency order (CHARACTER_FAMILY_CONSTRUCTOR A–E, STYLE_OPERATIONS §3:
//                  silhouette → topology → depth → materials → internal construction → states → world)
//   (2) DERIVATION tables in the source decide things for the author (family → eye mode / mark budget / hand mode, F64/F65/F52;
//                  light direction → which side a shade plane may sit on, F04; edge roles, F62)
//   (3) FALSIFIERS each method's own test is executed geometrically on the authored paths before the next stage may run;
//                  a failure stops construction and names the method + its source line
// The artwork (every contour) is authored by the subject module; nothing here supplies shapes.
import { author } from "./construct.mjs";
import { byId } from "./methods.mjs";
import * as R from "./raster.mjs";

// CHARACTER_FAMILY_CONSTRUCTOR §A + F65 + F52 (source-derived tables; thresholds are engineering bounds for the role/size rule)
export const FAMILY = {
  HUMAN_ACTING_CLOSE: { eye: (px, gaze) => (px >= 140 ? (gaze ? "WHITE_SCLERA_ACTOR" : "DARK_MARK_ACTOR") : "DARK_MARK_ACTOR"), faceMarks: 12, hands: "TASK_SPECIFIC" },
  HUMAN_GESTURE_FULL: { eye: (px, gaze) => (px >= 120 && gaze ? "WHITE_SCLERA_ACTOR" : px >= 40 ? "DARK_MARK_ACTOR" : "CLOSED_LID_ARC"), faceMarks: 7, hands: "READABLE_SILHOUETTE" },
  HUMAN_REAR_OCCLUDED: { eye: () => "HIDDEN_REAR", faceMarks: 0, hands: "TOOL_CONTACT" },
  DISTANT_POPULATION: { eye: () => "REDUCED_ICON", faceMarks: 2, hands: "COLLAPSED" },
  MASCOT_SIMPLE: { eye: (px) => (px >= 60 ? "WHITE_SCLERA_ACTOR" : "DARK_MARK_ACTOR"), faceMarks: 6, hands: "SPECIES" },
};
const EYE_PARTS = { WHITE_SCLERA_ACTOR: ["sclera", "pupil", "lid"], DARK_MARK_ACTOR: ["mark"], CLOSED_LID_ARC: ["lidArc"], REDUCED_ICON: [], HIDDEN_REAR: [] };

export function stages(id, cx, ctx, frame = [0, 0, 1920, 1080]) {
  const A = author(id, cx, ctx);
  const G = R.grid(frame[0], frame[1], frame[2], frame[3], 2);
  const log = [];
  let stage = 0;
  const need = (n, name) => { if (stage < n - 1) throw new Error(`${id}: stage "${name}" requires the previous stages first (skill dependency order)`); };
  const fail = (m, msg) => { const M = byId[m]; throw new Error(`${id} ✗ ${m} (${M.src.split("/").pop()}): ${msg}\n   falsifier: ${M.falsifier}`); };
  const PREVIEW = process.env.MN_STAGE_PREVIEW === "1"; // review mode: failures are recorded (never hidden) but construction continues so the stage can be SEEN
  const test = (m, name, value, pass, detail = "") => { log.push({ stage, method: m, test: name, value: typeof value === "number" ? +value.toFixed(3) : value, pass, detail }); if (!pass && !PREVIEW) fail(m, `${name} = ${typeof value === "number" ? value.toFixed(3) : value} ${detail}`); };
  const K = {
    A, log, masks: {}, parts: {}, heads: {}, mat: {}, fam: null,
    // ---------- 1. F64 / F65 / F52 / CHARACTER_FAMILY A: family decides the construction budget ----------
    family({ family, headPx, gaze = true, screenBbox }) {
      stage = 1;
      const F = FAMILY[family]; if (!F) fail("F64", `unknown family ${family}`);
      A.decide("identity.family", family, { by: ["F64"] });
      A.decide("face.headPx", headPx, { by: ["F65", "F52"] });
      const mode = A.decide("face.eyeMode", F.eye(headPx, gaze), { by: ["F65", "F52"], why: `derived by the F65/F52 table from family ${family}, head ${headPx}px, gaze ${gaze}` }); // construction reads the DECISION (overridable), not a private variable
      A.decide("face.roleBySize", headPx >= 120 ? "ACTING_CUE" : headPx >= 40 ? "SILHOUETTE_IDENTITY" : "MICRO_SYMBOL", { by: ["F52"] });
      K.fam = { family, headPx, mode, budget: F.faceMarks, hands: F.hands, eyeParts: EYE_PARTS[mode], screenBbox };
      log.push({ stage, method: "F65", test: "eye mode derived", value: mode, pass: true });
      return K.fam;
    },
    // ---------- 2. F01 / F58: whole silhouette FIRST, with identity voids; small-size read ----------
    silhouette({ outer, voids = [], gaps = [], displayH, identity = [] }) {
      need(2, "silhouette"); stage = 2;
      const So = R.mask(G, outer), area = R.area(So);
      test("F58", "outer silhouette is a closed non-empty region (cells)", area, area > 200);
      const Sv = voids.map((v) => R.mask(G, v.path));
      Sv.forEach((m, i) => test("F58", `void '${voids[i].name}' lies inside the outer silhouette`, R.inside(m, So), R.inside(m, So) > 0.9));
      const S = voids.reduce((acc, m, i) => R.minus(acc, Sv[i]), So);
      // small-size read: shrink to the subject's real display size, then 1/10 of it; every identity void must stay open
      const ys = []; for (let j = 0; j < G.H; j++) for (let i = 0; i < G.W; i++) if (S[j * G.W + i]) ys.push(j);
      const hCells = ys.length ? ys[ys.length - 1] - ys[0] : 1, f = Math.max(1, Math.round((hCells * G.cell) / ((displayH || hCells * G.cell) / 10)));
      const small = R.shrink(G, S, Math.min(f, 24));
      voids.forEach((v, i) => { const sv = R.shrink(G, R.and(Sv[i], So), Math.min(f, 24)); const open = R.area(R.and(sv.M, small.M.map((x) => 1 - x))); test("F58", `void '${v.name}' stays open at 1/10 display size`, open, open >= (v.minCells ?? 1)); });
      // identity-bearing CONCAVITIES (leg gap, arm-to-body gap): must be outside the silhouette yet stay open at 1/10
      for (const g of gaps) { const gm = R.mask(G, g.path); test("F58", `gap '${g.name}' is a real concavity (outside the silhouette)`, R.inside(gm, S), R.inside(gm, S) < 0.15);
        const sg = R.shrink(G, gm, Math.min(f, 24)); const open = R.area(R.and(sg.M, small.M.map((x) => 1 - x))); test("F58", `gap '${g.name}' stays open at 1/10 display size`, open, open >= (g.minCells ?? 1)); }
      A.decide("silhouette.outer", "authored outer path (see receipt geometry)", { by: ["F01", "F58"] });
      A.decide("silhouette.voids", voids.map((v) => v.name).length ? voids.map((v) => v.name) : ["none"], { by: ["F58"] });
      A.decide("silhouette.smallRead", `tested at 1/${f} scale`, { by: ["F58"] });
      A.decide("silhouette.view", cx.view || "declared by subject", { by: ["F01"] });
      A.decide("silhouette.identityFeatures", identity.length ? identity : ["outer contour"], { by: ["F01"] });
      K.masks.silhouette = S; K.sil = { outer, voids };
      return K;
    },
    // ---------- 3. F59 / F58 / F01 §2–3: parent masses split from the silhouette; joints insert into parents ----------
    topology(parts, { coverage = 0.93, overhang = [] } = {}) {
      need(3, "topology"); stage = 3;
      let U = new Uint8Array(G.W * G.H);
      for (const p of parts) { const m = R.mask(G, p.path); K.masks[p.id] = m; K.parts[p.id] = p; U = R.or(U, m); }
      test("F58", "union of parent masses reproduces the authored silhouette (IoU)", R.iou(U, K.masks.silhouette), R.iou(U, K.masks.silhouette) >= coverage);
      for (const p of parts) {
        const ins = R.inside(K.masks[p.id], K.masks.silhouette);
        test("F58", `part '${p.id}' stays within the silhouette`, ins, ins >= (overhang.includes(p.id) ? 0.5 : 0.85), "(detail may not alter the outer silhouette)");
        if (p.parent) { const par = K.masks[p.parent]; if (!par) fail("F59", `part '${p.id}' has unknown parent '${p.parent}'`); const ov = R.area(R.and(K.masks[p.id], par)); test("F59", `part '${p.id}' inserts into parent '${p.parent}' (shared cells)`, ov, ov > 6, "(no floating parts)"); }
      }
      A.decide("parts", parts.map((p) => `${p.id}→${p.parent || "root"} z${p.z}`), { by: ["F59"] });
      return K;
    },
    // ---------- 4. F05 head order: skull → hair → face plane → eyes(mode) → brows → nose → mouth → accessories ----------
    head(h) {
      need(4, "head"); stage = 4;
      const hp = K.masks[h.headPart]; if (!hp) fail("F05", `head part '${h.headPart}' not in topology`);
      const fp = R.mask(G, h.facePlane.path);
      test("F05", "face plane lies inside the head part", R.inside(fp, hp), R.inside(fp, hp) >= 0.9);
      const hair = R.mask(G, h.hair.map((x) => x.path));
      test("F05", "hair mass attaches to the head part", R.area(R.and(hair, hp)), R.area(R.and(hair, hp)) > 10);
      let marks = 0;
      for (const [side, eye] of Object.entries(h.eyes || {})) {
        const parts = Object.keys(eye).filter((k) => k !== "at");
        const missing = K.fam.eyeParts.filter((k) => !parts.includes(k));
        test("F65", `eye ${side} uses the derived mode ${K.fam.mode}`, missing.length ? "missing " + missing.join(",") : "ok", !missing.length);
        const extra = parts.filter((k) => !K.fam.eyeParts.includes(k) && k !== "brow");
        test("F65", `eye ${side} adds no parts outside mode ${K.fam.mode}`, extra.join(",") || "none", !extra.length);
        for (const k of parts) { const m = R.mask(G, eye[k].path); const host = k === "pupil" || k === "lid" ? R.mask(G, eye.sclera.path) : fp; const inside = R.inside(m, k === "lid" ? R.or(host, fp) : host); test("F05", `eye ${side}.${k} is owned by its host region`, inside, inside >= (k === "lid" ? 0.5 : 0.8)); marks++; }
      }
      for (const k of ["brows", "nose", "mouth", "cheeks"]) for (const r of [].concat(h[k] || [])) { const m = R.mask(G, r.path); const ins = R.inside(m, R.or(fp, hp)); test("F05", `${k} '${r.id}' sits on the face/head`, ins, ins >= 0.75); marks++; }
      test("F52", `face mark count within the ${K.fam.family} budget`, marks, marks <= K.fam.budget + 2, `(budget ${K.fam.budget})`);
      for (const a of h.accessories || []) { const m = R.mask(G, a.path); const touch = R.area(R.and(m, R.or(hp, hair))); test("F05", `accessory '${a.id}' contacts head/hair`, touch, touch > 4, "(no floating glasses/hats)"); }
      K.heads = h;
      for (const k of ["head.skull", "head.hairMass", "head.facePlane", "head.eyeSystem", "head.expressionStates"]) A.decide(k, `authored + tested in stage 4 (${k})`, { by: ["F05"] });
      A.decide("face.frame", "face plane + eye anchors authored in head stage", { by: ["F65", "F05"] });
      return K;
    },
    // ---------- 5. F02 / F04 / F46 / F62: owned materials, plane side from the light, edge roles ----------
    materials(light, table) {
      need(5, "materials"); stage = 5;
      const L = [Math.cos(light * Math.PI / 180), Math.sin(light * Math.PI / 180)];
      A.decide("lighting.system", `OPAQUE_FORM planes; light toward ${light}°`, { by: ["F04"] });
      for (const [pid, t] of Object.entries(table)) {
        const pm = K.masks[pid] || R.mask(G, t.ownerPath); if (!pm) fail("F02", `material owner '${pid}' not found`);
        const pc = R.centroid(G, pm);
        for (const pl of t.planes || []) {
          const m = R.and(R.mask(G, pl.path), pm), a = R.area(m);
          test("F02", `${pid}.${pl.role} plane is a meaningful owned region (cells)`, a, a > 6);
          if (pl.role === "cast") { // F62 CAST_SHADOW: must touch its declared occluder (projected from a real object onto this receiver)
            const occ = K.masks[pl.from]; if (!occ) fail("F62", `${pid} cast shadow names unknown occluder '${pl.from}'`);
            const near = R.area(R.and(m, R.or(occ, R.or(R.shiftMask(G, occ, 0, 3), R.shiftMask(G, occ, 0, 6)))));
            test("F62", `${pid}.cast plane touches its occluder '${pl.from}'`, near, near > 3);
          }
          if (pl.role === "shade" || pl.role === "light") {
            const c = R.centroid(G, m), d = (c[0] - pc[0]) * L[0] + (c[1] - pc[1]) * L[1];
            test("F04", `${pid}.${pl.role} plane sits on the ${pl.role === "shade" ? "far" : "near"} side of the light`, d, pl.role === "shade" ? d < 0 : d > 0, `(light ${light}°)`);
          }
        }
        for (const e of t.edges || []) if (!["MATERIAL_SEAM", "INTERNAL_CREASE", "OPTICAL_RIM", "EMISSIVE_EDGE", "CAST_SHADOW"].includes(e.role)) fail("F62", `${pid} edge '${e.role}' is not an owned edge role`);
        K.mat[pid] = t;
      }
      A.decide("materials", Object.keys(table), { by: ["F02", "F46"] });
      A.decide("edges", Object.fromEntries(Object.entries(table).map(([k, t]) => [k, (t.edges || []).map((e) => e.role).join(",") || "COLOR_ADJACENCY"])), { by: ["F62"] });
      return K;
    },
    // ---------- 6. F06 / F59 / F66: contacts — near fingers over the prop, palm behind ----------
    contacts(list) {
      need(6, "contacts"); stage = 6;
      for (const c of list) {
        const prop = R.mask(G, c.propPath), front = R.mask(G, c.front.map((x) => x.path));
        test("F06", `contact '${c.id}': front fingers overlap the prop`, R.area(R.and(front, prop)), R.area(R.and(front, prop)) > 4, "(hand must close ON the prop)");
        test("F59", `contact '${c.id}': front layer above prop, back layer below`, `${c.frontZ}>${c.propZ}>${c.backZ}`, c.frontZ > c.propZ && c.propZ > c.backZ);
      }
      A.decide("contacts", list.map((c) => c.id), { by: ["F06", "F59"] });
      K.contactList = list;
      return K;
    },
    done() { stage = 7; return K; },
    /** stage review sheet: (a) silhouette, (b) parent masses in distinct flat colours, (c) failures outlined */
    previewSVG(x0 = 0) {
      const hues = ["#e76f51", "#2a9d8f", "#e9c46a", "#264653", "#f4a261", "#8ab17d", "#6d597a", "#b56576", "#457b9d", "#ffb703", "#219ebc", "#9b5de5"];
      const sil = `<path d="${K.sil.outer}" fill="#111" fill-rule="evenodd"/>${(K.sil.voids || []).map((v) => `<path d="${v.path}" fill="#fff"/>`).join("")}`;
      const parts = Object.values(K.parts).sort((a, b) => a.z - b.z).map((p, i) => `<path d="${p.path}" fill="${hues[i % hues.length]}" fill-opacity=".85" stroke="#000" stroke-width="1.5"/>`).join("");
      const failed = log.filter((l) => !l.pass).map((l) => l.test).join(" | ");
      return { sil, parts, failed };
    },
    report() { return log; },
  };
  return K;
}

/** SILHOUETTE SEGMENTS (F58 → F59): author the outer contour once as named cubic segments; parent parts are assembled
    from those SAME segments (+ internal split curves), so topology is derived from the silhouette, never redrawn.
    seg: [name, [x0,y0], [c1x,c1y], [c2x,c2y], [x1,y1]]  (a straight run: give c1=p0, c2=p1) */
export function segments(list, T = (d) => d) {
  const S = {};
  for (const [name, p0, c1, c2, p1] of list) S[name] = { p0, c1, c2, p1 };
  const names = list.map((x) => x[0]);
  for (let i = 0; i < names.length; i++) { const a = S[names[i]], b = S[names[(i + 1) % names.length]]; if (Math.hypot(a.p1[0] - b.p0[0], a.p1[1] - b.p0[1]) > 0.5) throw new Error(`silhouette segments not continuous at ${names[i]} → ${names[(i + 1) % names.length]}`); }
  const c = (s, rev) => (rev ? `C${s.c2} ${s.c1} ${s.p0}` : `C${s.c1} ${s.c2} ${s.p1}`);
  const outer = T(`M${S[names[0]].p0} ` + names.map((n) => c(S[n])).join(" ") + " Z");
  /** part(refs): refs are segment names ("-name" reversed) or inline curves {to:[x,y], c1, c2} continuing from the last point */
  const part = (refs) => {
    let d = "", cur = null;
    for (const r of refs) {
      if (typeof r === "string") { const rev = r[0] === "-", s = S[rev ? r.slice(1) : r]; if (!s) throw new Error(`unknown segment ${r}`); const start = rev ? s.p1 : s.p0;
        if (cur === null) d = `M${start}`; else if (Math.hypot(cur[0] - start[0], cur[1] - start[1]) > 0.5) throw new Error(`part path jumps before ${r}: ${cur} → ${start}`);
        d += " " + c(s, rev); cur = rev ? s.p0 : s.p1; }
      else { const c1 = r.c1 || cur, c2 = r.c2 || r.to; d += ` C${c1} ${c2} ${r.to}`; cur = r.to; }
    }
    return T(d + " Z");
  };
  return { S, outer, part };
}
