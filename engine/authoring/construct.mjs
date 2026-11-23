// Illustration Construction Document (ICD) compiler.
// SOURCE KNOWLEDGE → ROUTED METHOD → SUBJECT DECISION → AUTHORED GEOMETRY → OPERATOR CALL → SVG REGION → RECEIPT
//
// A subject module does, in this order (enforced):
//   const A = author(id, cx, ctx)          // routes F01–F80 for this subject; loads matching lessons (pre-authoring)
//   A.witness(...)                          // inspected native source + unlike counter (files verified, hashed)
//   A.decide(key, value, {by:[F..], why})   // subject-specific design decisions; lesson rules run here
//   A.part / A.region / A.patch / ...       // operators that consume authored curves + decisions
//   return A.compile()                      // validates; emits SVG + rig meta + receipt; throws on missing construction
//
// Operators never invent geometry: every path is supplied by the subject author (or computed from authored
// inputs such as a projection basis + authored 3D polygon). Ablation (env MN_ABLATE=F62,F59) skips every
// operator bound to an ablated method so its visual consequence can be measured.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { route, byId } from "./methods.mjs";
import { RULES } from "./rules.mjs";
import { template } from "../lib/geom.mjs";
import { defineRig } from "../lib/rig.mjs";
import { createRequire } from "node:module";
const FORM3D = createRequire(import.meta.url)("../runtime/form3d.js");

const STUDIO = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")), "../..");
const ASSETS = path.join(STUDIO, "reference/construct-kurzgesagt-art/assets");
const f2 = (v) => +(+v).toFixed(2);
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const OVERRIDE = process.env.MN_DECIDE ? JSON.parse(process.env.MN_DECIDE) : null;
export const ABLATE = new Set((process.env.MN_ABLATE || "").split(",").filter(Boolean));

/** segments: SVG path string or [["M",x,y],["C",x1,y1,x2,y2,x,y],["Q",..],["L",x,y],["Z"]] */
function toD(p) {
  if (typeof p === "string") return p.trim();
  return p.map((s) => s[0] + s.slice(1).map(f2).join(",")).join(" ");
}
const lum = (hex) => { const c = hex.replace("#", ""); const v = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
export const contrast = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
export function mix(a, b, t) { const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = h(a), B = h(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); }

export function author(subjectId, cx, ctx = null) {
  const routing = route(cx);
  const decisions = {}, regions = [], parts = [], ops = [], witnesses = [], resolved = {}, sockets = {}, states = {}, morphs = [], issues = [], lessonLog = [];
  const P = (cx.prefix || subjectId + "-");
  const form = { view: null, joints: [], groups: [], masses: [], features: [], limbs: [], contours: [] };
  let phase = "DESIGN";
  // ---- pre-authoring lesson retrieval (REPAIR_LEARNING_TO_FIRST_PASS, made operative) ----
  const memories = [path.join(STUDIO, "learning/REPAIR_MEMORY.json"), "learning/REPAIR_MEMORY.json"].filter((f) => fs.existsSync(f)).flatMap((f) => JSON.parse(fs.readFileSync(f, "utf8")).lessons || []);
  const matches = (l) => Object.entries(l.applies_when || {}).every(([k, v]) => cx[k] !== undefined && (Array.isArray(v) ? v.includes(cx[k]) : cx[k] === v));
  const lessons = memories.filter((l) => l.rule && RULES[l.rule] && matches(l));
  const noLearn = process.env.MN_NO_LESSONS === "1";

  const traced = new Set();
  const rec = (op, regionId, by, uses, extra = {}) => {
    const ablated = (by || []).filter((m) => ABLATE.has(m));
    const reads = [...traced]; traced.clear();
    ops.push({ op, region: regionId, by: by || [], uses: [...new Set([...(uses || []), ...reads])], traced: reads, declared: uses || [], ablated, ...extra });
    return ablated.length === 0;
  };
  const bindCheck = (by, where) => { for (const m of by || []) { if (!byId[m]) throw new Error(`${where}: unknown method ${m}`); if (routing[m].status === "NOT_APPLICABLE") issues.push(`${where}: binds ${m} but router marked it NOT_APPLICABLE (${routing[m].why})`); } };
  const useCheck = (uses, where) => { for (const u of uses || []) if (!(u in decisions)) throw new Error(`${where}: consumes decision "${u}" that was never decided (geometry before design)`); };

  const A = {
    id: subjectId, cx, P, routing, decisions,
    /** inspected native witness + unlike counterexample (paths relative to the skill's assets/) */
    witness(methods, confirm, counter, observed) {
      const c = path.join(ASSETS, confirm), x = path.join(ASSETS, counter);
      for (const f of [c, x]) if (!fs.existsSync(f)) throw new Error(`witness missing: ${f}`);
      witnesses.push({ methods, confirm, confirm_sha256: sha(c), counter, counter_sha256: sha(x), observed });
      return A;
    },
    /** a RESEARCH_REQUIRED method resolved by a recorded question (learning/QUESTIONS.json id) or explicit reason */
    resolve(methodId, how) { resolved[methodId] = how; return A; },
    /** subject-specific design decision. by: methods whose knowledge produced it. */
    decide(key, value, { by = [], why = "" } = {}) {
      // eslint-disable-next-line no-param-reassign
      if (phase !== "DESIGN") throw new Error(`decision "${key}" made after geometry started`);
      bindCheck(by, `decision ${key}`);
      if (value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length)) throw new Error(`decision "${key}" is empty`);
      if (OVERRIDE && key in OVERRIDE) { value = typeof OVERRIDE[key] === "object" && !Array.isArray(OVERRIDE[key]) && typeof value === "object" ? Object.assign({}, value, OVERRIDE[key]) : OVERRIDE[key]; why = `CAUSAL TEST OVERRIDE | ${why}`; }
      decisions[key] = { value, by, why };
      return value;
    },
    /** read a decision. Reads are TRACED: the next operator call records them as its actual inputs (provenance by data flow) */
    get: (key) => { if (!(key in decisions)) throw new Error(`decision "${key}" not made`); traced.add(key); return decisions[key].value; },
    /** apply matching lessons BEFORE geometry: each lesson's registered rule transforms decisions */
    learn() {
      for (const l of lessons) {
        if (noLearn) { lessonLog.push({ rule_id: l.rule_id, rule: l.rule, skipped: "MN_NO_LESSONS" }); continue; }
        const before = JSON.stringify(Object.fromEntries(Object.entries(decisions).map(([k, v]) => [k, v.value])));
        const changed = RULES[l.rule].apply(A, l) || [];
        lessonLog.push({ rule_id: l.rule_id, rule: l.rule, changed, before_hash: crypto.createHash("sha1").update(before).digest("hex").slice(0, 10) });
      }
      return A;
    },
    // ---------------- geometry phase ----------------
    part(name, o = {}) {
      phase = "GEOMETRY"; parts.push({ name, parent: o.parent || null, at: o.at || [0, 0], z: o.z || 0, lag: o.lag || 0, clipKids: o.clipKids });
      if (o.clipKids) { bindCheck(o.by, `part ${name}`); rec("maskReveal", name, o.by || [], o.uses || [], { clipBy: o.clipKids }); } // children revealed only through an owned aperture
      return A;
    },
    socket(name, joint, at, r = 0) { sockets[name] = { joint, at, r }; return A; },
    /** authorContour / compoundRegion: an authored closed region owned by a part */
    region(id, o) {
      phase = "GEOMETRY";
      const where = `region ${id}`;
      bindCheck(o.by, where); useCheck(o.uses, where);
      const d = toD(o.path);
      if (!d || !/[CQLcql]/.test(d)) throw new Error(`${where}: path is empty or not authored geometry`);
      if (!o.fill) throw new Error(`${where}: no material fill (F02/F46)`);
      const op = o.holes ? "compoundRegion" : "authorContour";
      const keep = rec(op, id, o.by, o.uses);
      const full = o.holes ? d + " " + o.holes.map(toD).join(" ") : d;
      regions.push({ id, part: o.part, z: o.z || 0, purpose: o.purpose || "SILHOUETTE", fill: o.fill, by: o.by || [], uses: o.uses || [], ablated: !keep, state: o.state, layer: o.layer,
        svg: keep ? `<path id="${P}${id}" data-r="${id}" d="${full}" fill="${o.fill}"${o.holes ? ' fill-rule="evenodd"' : ""}${o.attrs ? " " + o.attrs : ""}/>` : "" });
      return A;
    },
    /** materialPatch: authored plane clipped to its owner region (moves/deforms with it) */
    patch(id, owner, o) {
      const where = `patch ${id}`;
      bindCheck(o.by, where); useCheck(o.uses, where);
      const own = regions.find((r) => r.id === owner); if (!own) throw new Error(`${where}: owner ${owner} not drawn yet`);
      const d = toD(o.path); if (!d) throw new Error(`${where}: empty path`);
      const keep = rec("materialPatch", id, o.by, o.uses, { owner });
      regions.push({ id, part: own.part, z: own.z + (o.dz ?? 0.01), purpose: o.purpose || "MATERIAL_PATCH", fill: o.fill, owner, by: o.by || [], uses: o.uses || [], ablated: !keep, state: own.state, layer: own.layer,
        svg: keep && !own.ablated ? `<g clip-path="url(#${P}${owner}-cp)" data-r="${id}"><path id="${P}${id}" d="${d}" fill="${o.fill}"${o.op !== undefined ? ` opacity="${o.op}"` : ""}/></g>` : "", needsClip: owner });
      return A;
    },
    /** edgeRole: a declared owned edge (seam/crease/optical rim) — never a global outline */
    edge(id, owner, o) {
      bindCheck(o.by, `edge ${id}`); useCheck(o.uses, `edge ${id}`);
      if (!["MATERIAL_SEAM", "INTERNAL_CREASE", "OPTICAL_RIM", "EMISSIVE_EDGE", "COLOR_ADJACENCY", "CAST_SHADOW"].includes(o.role)) throw new Error(`edge ${id}: role must be an F62 edge role`);
      const own = regions.find((r) => r.id === owner); if (!own) throw new Error(`edge ${id}: owner ${owner} missing`);
      const keep = rec("edgeRole", id, o.by, o.uses, { owner, role: o.role });
      regions.push({ id, part: own.part, z: own.z + (o.dz ?? 0.02), purpose: "EDGE", by: o.by || [], uses: o.uses || [], ablated: !keep, state: own.state, layer: own.layer,
        svg: keep && !own.ablated ? `<g ${o.clip !== false ? `clip-path="url(#${P}${owner}-cp)"` : ""} data-r="${id}"><path id="${P}${id}" d="${toD(o.path)}" fill="none" stroke="${o.color}" stroke-width="${o.w}" stroke-linecap="round" stroke-linejoin="round"/></g>` : "", needsClip: o.clip !== false ? owner : null });
      return A;
    },
    /** projectFacet: authored 3D polygon (x,y,z in world units) through a declared basis → screen region */
    facet(id, basis, pts3, o) {
      const proj = ([x, y, z]) => [basis.o[0] + x * basis.u[0] + y * basis.v[0] + z * basis.h[0], basis.o[1] + x * basis.u[1] + y * basis.v[1] + z * basis.h[1]];
      const pts = pts3.map(proj);
      A.region(id, Object.assign({}, o, { path: [["M", ...pts[0]], ...pts.slice(1).map((p) => ["L", ...p]), ["Z"]], by: [...new Set([...(o.by || []), "F60"])] }));
      ops[ops.length - 1].op = "projectFacet"; ops[ops.length - 1].basis = basis.name || "declared";
      return A;
    },
    /** routeConnector: pipe/cable between two named sockets; both endpoints must exist */
    connector(id, from, to, o) {
      const s0 = sockets[from], s1 = sockets[to];
      if (!s0 || !s1) throw new Error(`connector ${id}: endpoints ${from}/${to} must be declared sockets (F68)`);
      bindCheck(o.by, `connector ${id}`); useCheck(o.uses, `connector ${id}`);
      const keep = rec("routeConnector", id, o.by, o.uses, { from, to });
      const pts = [s0.at, ...(o.via || []), s1.at];
      const d = "M" + pts.map((p) => `${f2(p[0])},${f2(p[1])}`).join(" L");
      regions.push({ id, part: o.part, z: o.z || 0, purpose: "CONNECTOR", by: o.by || [], uses: o.uses || [], ablated: !keep,
        svg: keep ? `<g data-r="${id}"><path id="${P}${id}" d="${d}" fill="none" stroke="${o.fill}" stroke-width="${o.w}" stroke-linejoin="round"/>${o.core ? `<path id="${P}${id}-core" d="${d}" fill="none" stroke="${o.core}" stroke-width="${o.coreW || o.w * 0.35}" stroke-linejoin="round" ${o.coreAttrs || ""}/>` : ""}${o.light ? `<path d="${d}" fill="none" stroke="${o.light}" stroke-width="${o.w * 0.18}" transform="translate(${o.lightOff || "-1 -2"})" opacity=".8"/>` : ""}</g>` : "" });
      return A;
    },
    /** repeatedOwnedModule: authored module instanced at parent-local anchors (all clipped to the parent) */
    repeat(id, owner, anchors, drawModule, o) {
      const own = regions.find((r) => r.id === owner); if (!own) throw new Error(`repeat ${id}: owner ${owner} missing`);
      bindCheck(o.by, `repeat ${id}`); useCheck(o.uses, `repeat ${id}`);
      const keep = rec("repeatedOwnedModule", id, o.by, o.uses, { owner, count: anchors.length });
      regions.push({ id, part: own.part, z: own.z + (o.dz ?? 0.03), purpose: "REPEAT", by: o.by || [], uses: o.uses || [], ablated: !keep, layer: own.layer, state: own.state,
        svg: keep && !own.ablated ? `<g ${o.clip === false ? "" : `clip-path="url(#${P}${owner}-cp)"`} data-r="${id}" id="${P}${id}">${anchors.map((a, i) => drawModule(a, i)).join("")}</g>` : "", needsClip: o.clip === false ? null : owner });
      return A;
    },
    /** composeOptic: emitter core (crisp) + bounded halo (fx) + optional receivers; halo never on unrelated surfaces */
    optic(id, o) {
      bindCheck(o.by, `optic ${id}`); useCheck(o.uses, `optic ${id}`);
      const keep = rec("composeOptic", id, o.by, o.uses, { kind: o.kind });
      const gid = `${P}${id}-g`;
      regions.push({ id, part: o.part, z: o.z || 0, purpose: "EFFECT", by: o.by || [], uses: o.uses || [], ablated: !keep, state: o.state,
        svg: keep ? `<g id="${P}${id}" data-r="${id}" data-fx="${o.kind || "halo"}"><defs><radialGradient id="${gid}"><stop offset="0" stop-color="${o.color}" stop-opacity="${o.op ?? 0.6}"/><stop offset=".45" stop-color="${o.color}" stop-opacity="${(o.op ?? 0.6) * 0.28}"/><stop offset="1" stop-color="${o.color}" stop-opacity="0"/></radialGradient></defs>${o.clip ? `<g clip-path="url(#${P}${o.clip}-cp)">` : ""}<circle id="${P}${id}-c" cx="${o.at[0]}" cy="${o.at[1]}" r="${o.r}" fill="url(#${gid})"/>${o.clip ? "</g>" : ""}</g>` : "", needsClip: o.clip || null });
      return A;
    },
    /** drawnState: registered alternate drawings selected by a channel index (POSE_STATE / view / hand grip / material state) */
    states(chan, names, o = {}) { bindCheck(o.by, `states ${chan}`); useCheck(o.uses, `states ${chan}`); states[chan] = names; rec("drawnState", chan, o.by, o.uses, { states: names }); return A; },
    /** paletteRoles: measured contrast between role pairs that the design depends on (F03/F51/F61); fails below min */
    palette(pairs, o = {}) {
      bindCheck(o.by, "palette"); useCheck(o.uses, "palette");
      const roles = o.roles || A.get("palette.roles"), res = [];
      for (const [a, b, min, axis] of pairs) {
        const ca = roles[a] || a, cb = roles[b] || b;
        if (axis === "hue") { // F61: discrimination may rest on HUE, not luminance — measured as hue-angle distance (deg)
          const hue = (h) => { const [r, g, bl] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), mx = Math.max(r, g, bl), mn = Math.min(r, g, bl), d = mx - mn; if (!d) return 0; const x = mx === r ? ((g - bl) / d) % 6 : mx === g ? (bl - r) / d + 2 : (r - g) / d + 4; return (x * 60 + 360) % 360; };
          let dh = Math.abs(hue(ca) - hue(cb)); dh = Math.min(dh, 360 - dh);
          res.push({ a, b, hueDistance: +dh.toFixed(1), min, axis }); if (dh < min) issues.push(`palette pair ${a}/${b} hue distance ${dh.toFixed(1)}° < ${min}°`);
        } else { const c = +contrast(ca, cb).toFixed(2); res.push({ a, b, contrast: c, min, axis }); if (c < min) issues.push(`palette pair ${a}/${b} contrast ${c} < ${min} (${axis || "luma"})`); }
      }
      rec("paletteRoles", "palette", o.by, o.uses, { pairs: res });
      return res;
    },
    /** separateFrom: move a colour DECISION toward `toward` until its contrast against `against` reaches `min`
        (value separation between adjacent owners, F03/F61). Records the before/after; design phase only. */
    separateFrom(key, against, min, toward, o = {}) {
      if (phase !== "DESIGN") throw new Error(`separateFrom ${key}: must run before geometry`);
      const d = decisions[key]; if (!d) throw new Error(`separateFrom: decision ${key} missing`);
      const from = d.value; let c = from, t = 0;
      while (contrast(c, against) < min && t < 0.95) { t += 0.02; c = mix(from, toward, t); }
      d.value = c; d.by = [...new Set([...d.by, ...(o.by || [])])]; if (o.from) d.derivedFrom = [...new Set([...(d.derivedFrom || []), ...[].concat(o.from)])];
      rec("paletteRoles", key, o.by || [], o.uses || [], { separate: { from, to: c, against, min, achieved: +contrast(c, against).toFixed(2) } });
      return c;
    },
    /** attachRegion: a region inserted INTO a named parent region (ear on skull, gauge on stem); parent must exist */
    attach(id, parentRegion, o) {
      if (!regions.find((r) => r.id === parentRegion)) throw new Error(`attach ${id}: parent region ${parentRegion} not drawn`);
      A.region(id, o); const last = ops[ops.length - 1]; last.op = "attachRegion"; last.parent = parentRegion; return A;
    },
    /** recess: inset region inside an owner with its own inner-wall plane (bezels, sockets, panel insets) */
    recess(id, owner, o) { A.patch(id, owner, o); ops[ops.length - 1].op = "recess"; if (o.wall) A.patch(id + "Wall", id, { fill: o.wall, path: o.wallPath, by: o.by, uses: o.uses }); return A; },
    /** rigBind: declares the motion parts/states this construction exposes to the MN runtime (F15/F30/F31/F79) */
    rigBind(o) { bindCheck(o.by, "rigBind"); useCheck(o.uses, "rigBind"); if (!parts.length && !form.joints.length) throw new Error("rigBind: no parts"); rec("rigBind", "rig", o.by, o.uses, { parts: parts.length ? parts.map((p) => p.name) : form.joints.map((j) => j.name), channels: o.channels || [] }); return A; },
    /** maskReveal: an animatable mask whose shape (id) reveals authored content underneath (F16/F21/F35/F48/F78) */
    maskReveal(id, o) {
      bindCheck(o.by, `mask ${id}`); useCheck(o.uses, `mask ${id}`);
      const keep = rec("maskReveal", id, o.by, o.uses);
      regions.push({ id, part: o.part, z: o.z || 0, purpose: "MASK", by: o.by || [], uses: o.uses || [], ablated: !keep,
        svg: keep ? `<g id="${P}${id}" data-r="${id}"><defs><mask id="${P}${id}-m" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000"><path id="${P}${id}-shape" d="${toD(o.path)}" fill="#fff"/></mask></defs><g mask="url(#${P}${id}-m)">${o.inner}</g></g>` : o.inner });
      return A;
    },
    /** deformMatched: homologous contour targets for a region; topology MUST match (no resampling, no silent smoothing) */
    deform(regionId, targets, o = {}) {
      const r = regions.find((x) => x.id === regionId); if (!r) throw new Error(`deform: region ${regionId} missing`);
      const base = (r.svg.match(/ d="([^"]+)"/) || [])[1];
      for (const [k, d] of Object.entries(targets)) if (template(base).tpl !== template(toD(d)).tpl) throw new Error(`deform ${regionId}→${k}: topology differs from the base contour (author a homologous target or a drawn state)`);
      bindCheck(o.by, `deform ${regionId}`);
      rec("deformMatched", regionId, o.by, o.uses, { targets: Object.keys(targets) });
      morphs.push({ name: o.name || regionId, region: regionId, base, targets: Object.fromEntries(Object.entries(targets).map(([k, d]) => [k, toD(d)])) });
      return A;
    },
    /** contactLayering: near fingers in front of the prop, far fingers behind (F59/F06); emits a front layer bound to the joint */
    contact(name, o) { bindCheck(o.by, `contact ${name}`); rec("contactLayering", name, o.by, o.uses, { front: o.front, back: o.back, prop: o.prop }); return A; },

    // ---------------- FORM CONSTRUCTION (geometry computed from designed volumes + one decided view) ----------------
    /** formView: the view is READ from a decision; every mass and feature is projected through it (F30/F55/F60/F64) */
    formView(viewKey = "view", o = {}) { const v = A.get(viewKey); form.view = { yaw: v.yaw, pitch: v.pitch || 0, roll: v.roll || 0 }; rec("formView", viewKey, o.by || [], []); return A; },
    fjoint(name, o = {}) { phase = "GEOMETRY"; form.joints.push({ name, parent: o.parent || null, at: o.at || [0, 0, 0], rest: o.rest || [0, 0, 0], lag: o.lag || 0 }); return A; },
    /** materialGroup: one material owner (union of its masses) with authored plane values (F02/F04/F46/F62) */
    group(id, o) { bindCheck(o.by, `group ${id}`); const keep = rec("materialGroup", id, o.by, o.uses, { fill: o.fill }); form.groups.push({ id, fill: o.fill, shade: o.shade || o.fill, light: o.light, k: o.k ?? 8, hk: o.hk || 0, kf: o.kf, hkf: o.hkf, zb: o.zb || 0, front: !!o.front, masses: [], ablated: !keep }); return A; },
    /** formMass: a designed volume (superquadric) owned by a joint, contributing to a material group's silhouette */
    mass(id, o) {
      bindCheck(o.by, `mass ${id}`);
      const g = form.groups.find((x) => x.id === o.group); if (!g) throw new Error(`mass ${id}: group ${o.group} not declared`);
      if (!form.joints.find((j) => j.name === o.joint)) throw new Error(`mass ${id}: joint ${o.joint} not declared`);
      if (!o.r || o.r.some((v) => !(v > 0))) throw new Error(`mass ${id}: radii must be positive designed values`);
      const keep = rec("formMass", id, o.by, o.uses, { joint: o.joint, group: o.group });
      if (!keep || g.ablated) return A;
      form.masses.push({ id, joint: o.joint, at: o.at || [0, 0, 0], r: o.r, e: o.e, taper: o.taper, rot: o.rot, zb: o.zb, state: o.state, nLat: o.nLat, nLon: o.nLon, round: o.round, substrate: !!o.substrate });
      if (!o.substrate) g.masses.push(id); return A;
    },
    /** surfaceFeature: a shape authored in a mass's surface tangent plane (eyes, brows, mouth, rims); states must be homologous */
    feature(id, o) {
      bindCheck(o.by, `feature ${id}`);
      if (!o.shape || o.shape.length < 2) throw new Error(`feature ${id}: shape points required`);
      if (o.states) for (const [k, pts] of Object.entries(o.states)) if (pts.length !== o.shape.length) throw new Error(`feature ${id} state ${k}: point count differs (states must be homologous)`);
      const keep = rec(o.states ? "surfaceFeatureStates" : "surfaceFeature", id, o.by, o.uses, { mass: o.mass });
      if (!keep) return A;
      form.features.push({ id, mass: o.mass, at: o.at, shape: o.shape, states: o.states, fill: o.fill, stroke: o.stroke, sw: o.sw, open: o.open, lift: o.lift, minFacing: o.minFacing, clipTo: o.clipTo, group: o.group, round: o.round, op: o.op });
      return A;
    },
    /** authoredContour: a DESIGNED closed outline in a joint frame with homologous view keys [[yaw, [[x,y,smooth]...]], ...]
        (custom asymmetric silhouettes; projection only positions/rolls it and selects the view correction) */
    contour(id, o) {
      bindCheck(o.by, `contour ${id}`);
      const g = form.groups.find((x) => x.id === o.group); if (!g) throw new Error(`contour ${id}: group ${o.group} not declared`);
      if (!o.views || !o.views.length) throw new Error(`contour ${id}: needs authored view keys`);
      const n = o.views[0][1].length; for (const [yaw, pts] of o.views) if (pts.length !== n) throw new Error(`contour ${id} view ${yaw}: node count ${pts.length} != ${n} (view keys must be homologous)`);
      const keep = rec("authorContour", id, o.by, o.uses, { joint: o.joint, group: o.group, views: o.views.map((v) => v[0]) });
      if (!keep || g.ablated) return A;
      form.contours.push({ id, joint: o.joint, group: o.group, at: o.at, views: o.views, mirror: o.mirror !== false, zb: o.zb, state: o.state });
      g.masses.push(id); return A;
    },
    /** limb: shoulder→elbow→wrist with lengths + pole; reach is validated at runtime (no silent clamp) */
    limb(id, o) { bindCheck(o.by, `limb ${id}`); rec("rigBind", id, o.by, o.uses, { limb: o.joints }); form.limbs.push({ id, joints: o.joints, lengths: o.lengths, pole: o.pole }); return A; },

    compile(opts = {}) {
      phase = "COMPILE";
      const errors = [...issues];
      const routed = Object.entries(routing).filter(([, v]) => v.status === "ROUTED").map(([k]) => k);
      for (const [m, v] of Object.entries(routing)) if (v.status === "RESEARCH_REQUIRED" && !resolved[m]) errors.push(`${m} RESEARCH_REQUIRED: ${v.why}`);
      for (const m of routed) {
        const M = byId[m];
        for (const need of M.needs) if (!(need in decisions)) errors.push(`${m} routed but decision "${need}" missing (${M.knows.slice(0, 70)}…)`);
        if (M.ops.length) {
          const bound = ops.filter((o) => o.by.includes(m) && M.ops.includes(o.op));
          const executed = bound.filter((o) => !o.ablated.includes(m));
          if (!bound.length) errors.push(`${m} routed but none of its producing operators [${M.ops.join(", ")}] was executed on a region bound to it`);
          else if (!executed.length) errors.push(`${m} ABLATED: all ${bound.length} producing operations skipped (${[...new Set(bound.map((o) => o.region))].slice(0, 8).join(", ")}) — expected visible failure: ${M.falsifier}`);
        }
      }
      if (witnesses.length < 2 || !witnesses.some((w) => w.counter)) errors.push("at least two inspected native witnesses with an unlike counterexample are required before construction (F80 code-native replacement)");
      for (const r of regions) if (r.state && !Object.values(states).some((ns) => ns.includes(r.state))) errors.push(`region ${r.id} belongs to undeclared state ${r.state}`);
      // emit: clip defs for owners that have patches, grouped per part and per state
      const clipOwners = new Set(regions.map((r) => r.needsClip).filter(Boolean));
      const byPart = {};
      for (const r of regions.sort((a, b) => a.z - b.z)) {
        const key = (r.part || "_root") + "|main"; // front-layer regions are separated inside svgFor (never dropped)
        (byPart[key] = byPart[key] || []).push(r);
      }
      const fronts = {};
      const svgFor = (part) => {
        const rs = (byPart[part + "|main"] || []);
        const groups = {}, order = [];
        let out = "";
        for (const r of rs) {
          let s = r.svg;
          if (clipOwners.has(r.id) && !r.ablated) s += `<defs><clipPath id="${P}${r.id}-cp"><use href="#${P}${r.id}"/></clipPath></defs>`;
          if (r.layer === "front") { (fronts[part] = fronts[part] || []).push(s); continue; }
          if (r.state) { if (!groups[r.state]) { groups[r.state] = []; out += `@@st:${r.state}@@`; } groups[r.state].push(s); continue; }
          out += s;
        }
        for (const st in groups) { const gid = `${P}st-${st}-${part}`; stateIds[st] = (stateIds[st] || []).concat(gid); out = out.replace(`@@st:${st}@@`, `<g id="${gid}" data-state="${st}">${groups[st].join("")}</g>`); }
        return out;
      };
      const stateIds = {};
      let rig = null, svg = "", formOut = null;
      if (form.joints.length) {
        if (!form.view) errors.push("form construction without a decided view (formView)");
        else {
          // material-plane offsets scale with the owner's size (kf/hkf fractions of its mean width) — designed, not fixed px
          // contours contribute their authored half-width (front key) to the owner's size
          const cw = (c) => { const xs = c.views[0][1].map((p) => p[0]); return (Math.max(...xs) - Math.min(...xs)) / 2; };
          for (const g of form.groups) { const ms = form.masses.filter((m) => g.masses.includes(m.id)).map((m) => Math.min(m.r[0], m.r[2])).concat(form.contours.filter((c) => g.masses.includes(c.id)).map(cw)); const w = ms.length ? ms.reduce((a, v) => a + v, 0) / ms.length : 0; if (g.kf) g.k = +(g.kf * w).toFixed(1); if (g.hkf) g.hk = +(g.hkf * w).toFixed(1); }
          const spec = { view: form.view, place: opts.place || [0, 0], joints: form.joints, groups: form.groups.filter((g) => !g.ablated), masses: form.masses, contours: form.contours, features: form.features, limbs: form.limbs, prefix: P, channels: opts.channels || {} };
          const ev = FORM3D.evaluate(spec, opts.pose || {});
          for (const g of spec.groups) if (!g.masses.length) errors.push(`group ${g.id} has no masses`);
          const featGroup = (f) => f.group || (spec.masses.find((m) => m.id === f.mass) || {}).group;
          const gEl = (g) => {
            const ms = g.masses.filter((m) => ev.masses[m]), all = g.masses;
            const feats = spec.features.filter((f) => featGroup(f) === g.id);
            const fsvg = feats.map((f) => {
              const fe = ev.features.find((x) => x.id === f.id); const vis = fe && fe.visible;
              const body = `<path id="${P}F-${f.id}" d="${fe ? fe.d : "M0,0"}" fill="${f.fill || "none"}"${f.stroke ? ` stroke="${f.stroke}" stroke-width="${f.sw || 3}" stroke-linecap="round" stroke-linejoin="round"` : ""} opacity="${vis ? f.op ?? 1 : 0}"/>`;
              return (f.clipTo ? `<g clip-path="url(#${P}FC-${f.clipTo})">${body}</g>` : body) + (spec.features.some((o) => o.clipTo === f.id) ? `<defs><clipPath id="${P}FC-${f.id}"><use href="#${P}F-${f.id}"/></clipPath></defs>` : "");
            }).join("");
            const md = (m) => (ev.masses[m] ? ev.masses[m].d : "M0,0");
            return `<g id="${P}G-${g.id}" data-group="${g.id}"><defs><clipPath id="${P}C-${g.id}">${all.map((m) => `<use href="#${P}M-${m}"/>`).join("")}</clipPath></defs>` +
              `<g fill="${g.shade}">${all.map((m) => `<path id="${P}M-${m}" d="${md(m)}"/>`).join("")}</g>` +
              `<g clip-path="url(#${P}C-${g.id})"><g id="${P}LIT-${g.id}" fill="${g.fill}" transform="translate(${-g.k * 0.6} ${-g.k * 0.8})">${all.map((m) => `<use href="#${P}M-${m}"/>`).join("")}</g>` +
              (g.light && g.hk ? `<g id="${P}HI-${g.id}" fill="${g.light}" transform="translate(${-g.hk * 0.6} ${-g.hk * 0.8})">${all.map((m) => `<use href="#${P}M-${m}"/>`).join("")}</g>` : "") + `</g>` + fsvg + `</g>`;
          };
          const order = ev.groups.slice().sort((a, b) => a.z - b.z);
          svg = `<g id="${P}form" data-focal>${order.filter((g) => !g.front).map((g) => gEl(spec.groups.find((x) => x.id === g.id))).join("")}</g>`;
          formOut = { spec, front: `<g id="${P}formF" data-focal>${order.filter((g) => g.front).map((g) => gEl(spec.groups.find((x) => x.id === g.id))).join("")}</g>` };
        }
      }

      if (parts.length) {
        const spec = Object.assign({}, opts.rig || {}, {
          joints: parts.map((p) => ({ name: p.name, parent: p.parent, at: p.at, z: p.z, lag: p.lag, clipKids: p.clipKids })),
          parts: parts.map((p) => ({ joint: p.name, z: 0, svg: svgFor(p.name) })),
          sockets,
        });
        rig = defineRig(P, spec);
        if (Object.keys(states).length) rig.meta.swaps = Object.fromEntries(Object.entries(states).map(([c, ns]) => [c, ns.map((n) => stateIds[n] || [])]));
        rig.meta.proxies = Object.keys(fronts).map((j) => ({ id: `${P}fx-${j}`, joint: j }));
        rig.front = Object.entries(fronts).map(([j, ss]) => `<g id="${P}fx-${j}" data-focal>${ss.join("")}</g>`).join("");
        for (const m of morphs) rig.meta.morphs[m.name] = (() => { const b = template(m.base); return { el: P + m.region, tpl: b.tpl, base: b.nums, d: Object.fromEntries(Object.entries(m.targets).map(([k, d]) => [k, template(d).nums.map((v, i) => f2(v - b.nums[i]))])) }; })();
        svg = rig.svg;
      } else if (!formOut) svg = `<g id="${P}root" data-focal>${svgFor("_root")}</g>`;
      const receipt = {
        subject: subjectId, context: cx, routing, witnesses, resolved,
        decisions: Object.fromEntries(Object.entries(decisions).map(([k, v]) => [k, { value: v.value, by: v.by, why: v.why, derivedFrom: v.derivedFrom || [] }])),
        lessons_available: lessons.map((l) => l.rule_id), lessons_applied: lessonLog,
        operations: ops, regions: regions.map((r) => ({ id: r.id, element: P + r.id, part: r.part, purpose: r.purpose, by: r.by, uses: r.uses, ablated: r.ablated, state: r.state || null })),
        ablated_methods: [...ABLATE], errors, status: errors.length ? "INCOMPLETE" : "CODE_EMITTED",
      };
      if (ctx && ctx.icdReceipt) ctx.icdReceipt(receipt);
      const ICD_DIR = process.env.MN_ICD_DIR || "production/icd";
      fs.mkdirSync(ICD_DIR, { recursive: true });
      fs.writeFileSync(`${ICD_DIR}/${subjectId}${ABLATE.size ? ".ablate-" + [...ABLATE].join("_") : ""}.json`, JSON.stringify(receipt, null, 1));
      if (errors.length && !opts.allowIncomplete) throw new Error(`ICD ${subjectId} INCOMPLETE:\n  - ` + errors.join("\n  - "));
      if (formOut) return { svg, front: formOut.front, meta: formOut.spec, form: true, receipt, P };
      return { svg, front: rig ? rig.front : "", meta: rig ? rig.meta : null, receipt, P };
    },
  };
  return A;
}
