// Scene graph (spec §5.1 composeShot, §5.6, §11.3). Semantic owner tree: per-depth-band camera ancestors → world plates / rig paint passes /
// cels / procedural symbols / light planes, paint order solved from explicit occlusion constraints (cycle → OCCLUSION_CONFLICT, never a z
// tweak), transition plates in a SCREEN band with authored aperture masks. frameState(f) lists EVERY runtime-owned element every frame,
// so a seek never inherits a previous frame's attribute (order-independent rendering).
import { err } from "./errors.mjs";
import { emitRigTree, emitPass, xml } from "./svg_parts.mjs";
import { stateAtFrame } from "./temporal.mjs";
import { compileTransition } from "./transitions.mjs";
import { applyApprovedLighting } from "./lighting.mjs";
import { chain, mul, T, S, R, apply, inv, fmt } from "./math2d.mjs";
import { cropToCanonical, coversCanonical } from "./asset_geometry.mjs";

const BANDS = ["FAR", "MID", "FOCAL", "NEAR", "FOREGROUND"];

export function cameraMatrix(cam, band, parallax, stage) {
  const p = parallax?.[band] ?? 1, cx0 = stage.width / 2, cy0 = stage.height / 2;
  const cx = cx0 + p * (cam.x - cx0), cy = cy0 + p * (cam.y - cy0), z = 1 + p * (cam.zoom - 1);
  return chain(T(cx0, cy0), R(-cam.rot), S(z), T(-cx, -cy));
}

function topoOrder(items, assets) {
  // items: [{id, asset_id, slot}] in declared priority order. Edges from asset draw_order_constraints (ABOVE x: x painted first).
  const n = items.length, idx = new Map(items.map((it, i) => [it.id, i])), out = Array.from({ length: n }, () => new Set()), indeg = new Array(n).fill(0);
  const bySlotOrAsset = (k) => items.filter((it) => it.slot === k || it.asset_id === k).map((it) => idx.get(it.id));
  for (const it of items) { const a = assets.get(it.slot) || assets.get(it.asset_id); for (const c of a?.draw_order_constraints || []) for (const j of bySlotOrAsset(c.asset_id)) { const i = idx.get(it.id); if (i === j) continue; const [from, to] = c.relation === "ABOVE" ? [j, i] : [i, j]; if (!out[from].has(to)) { out[from].add(to); indeg[to]++; } } }
  // an attached material/light plane sits directly on its owner: owner < plane, and plane < everything the owner must be below
  for (const it of items) if (it.after) { const i = idx.get(it.id), j = idx.get(it.after); if (j === undefined) continue; if (!out[j].has(i)) { out[j].add(i); indeg[i]++; } for (const k of [...out[j]]) if (k !== i && !out[i].has(k)) { out[i].add(k); indeg[k]++; } }
  const order = [], ready = []; for (let i = 0; i < n; i++) if (!indeg[i]) ready.push(i);
  while (ready.length) { ready.sort((a, b) => a - b); const i = ready.shift(); order.push(items[i]); for (const j of out[i]) if (!--indeg[j]) ready.push(j); }
  if (order.length !== n) { const left = items.filter((it) => !order.includes(it)).map((it) => it.id); throw err("OCCLUSION_CONFLICT", { record_id: left[0], reason: `circular paint order among ${left.join(", ")} — split authored cutout ownership or request registered pose art`, details: { cycle_members: left } }); }
  return order;
}

/** composeShot(shot, registry, compiled, {prefix}) */
export function composeShot(shot, registry, compiled, { prefix = "", sentinel = "#ff00ff", background = true } = {}) {
  const doc = compiled.doc, plan = compiled.plan, assets = compiled.assets, P = (id) => `${prefix}${id}`;
  const bands = Object.fromEntries(BANDS.map((b) => [b, []])), runtimeIds = [], defs = [];
  const world = doc.worlds.find((w) => w.id === shot.world_id) || null;
  // world plates: static under their band camera
  for (const d of world?.depth_owners || []) for (const aid of d.asset_ids) { const r = registry.get(aid); bands[d.depth_band].push({ id: `world--${d.id}--${aid}`, asset_id: aid, slot: aid, markup: `<g id="${xml(P(`world--${d.id}--${aid}`))}" transform="translate(${r.asset.pivot_xy[0]} ${r.asset.pivot_xy[1]})">${emitPass(`world--${d.id}--${aid}-p`, r.asset, r.url, prefix)}</g>`, static: true }); }
  // rigs placed in this shot
  const rigIds = doc.rigs.filter((r) => compiled.placement(r.id, shot)).map((r) => r.id), rigPasses = [];
  for (const rid of rigIds) {
    const rig = doc.rigs.find((r) => r.id === rid), { passes, markup } = emitRigTree(rig, registry, prefix);
    for (const p of passes) { const band = assets.get(p.asset_id).depth_band; (bands[band] || bands.FOCAL).push({ id: p.pass_id, asset_id: p.asset_id, slot: p.slot, markup: markup.get(p.pass_id) }); runtimeIds.push(p.pass_id); rigPasses.push(p); }
    for (const [planeId, L] of Object.entries(plan.lighting || {})) { const owner = passes.find((p) => p.slot === L.owner_part); if (!owner) continue; const r = registry.get(planeId), id = `${owner.pass_id}--light-${planeId}`; (bands[assets.get(owner.asset_id).depth_band] || bands.FOCAL).push({ id, asset_id: planeId, slot: `${owner.slot}:light`, after: owner.pass_id, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); }
  }
  // cels and procedural symbols active in this shot
  for (const [aid, cel] of Object.entries(plan.cels || {})) { const a = doc.actions.find((x) => x.id === aid); if (a?.shot_id !== shot.id) continue; for (const e of [...new Set(cel.cycle.map((c) => c.asset_id))]) { const r = registry.get(e), id = `${aid}--cel--${e}`; bands[cel.band || "FOCAL"].push({ id, asset_id: e, slot: e, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); } }
  for (const [aid, p] of Object.entries(plan.procedural || {})) { if (p.type !== "FLOW_PATH") continue; const a = doc.actions.find((x) => x.id === aid); if (a?.shot_id !== shot.id) continue; const max = Math.max(...p.count.map((k) => k[1])), r = registry.get(p.symbol_asset); for (let i = 0; i < max; i++) { const id = `${aid}--sym${i}`; bands[p.band || "FOCAL"].push({ id, asset_id: p.symbol_asset, slot: p.symbol_asset, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); } }
  const ordered = {}; for (const b of BANDS) ordered[b] = topoOrder(bands[b], assets);
  // transitions touching this shot (outgoing): screen band with aperture masks (static in plate-local coordinates)
  const trans = doc.transitions.filter((t) => t.from_shot === shot.id && t.mode === "CONTINUOUS").map((t) => compileTransition(shot, doc.shots.find((s) => s.id === t.to_shot), t, { doc }));
  const screen = [];
  for (const tr of trans) {
    const c = doc.transitions.find((t) => `${t.from_shot}->${t.to_shot}` === tr.id), plates = [c.out_asset_ids[0], c.middle_asset_ids[0], c.in_asset_ids[0]];
    defs.push(`<filter id="${xml(P("alpha-black"))}"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0"/></filter>`);
    plates.forEach((aid, k) => {
      const r = registry.get(aid), id = `trans--${tr.id.replace(/[^A-Za-z0-9_-]/g, "_")}--${k}`, [px, py] = r.asset.pivot_xy;
      let maskAttr = "";
      if (k < 2) { const m = registry.get(c.mask_or_occluder_ids[k] || c.mask_or_occluder_ids[0]), mid = P(`${id}-hole`), ma = m.asset, [sx, sy, sw, sh] = ma.source_pixel_crop, full = sx === 0 && sy === 0 && sw === ma.width_px && sh === ma.height_px;
        // mask user space = the masked pass group's space (canonical − plate pivot); the aperture uses the SAME crop→canonical contract (re-audit B1)
        const maskImg = full ? `<image href="${xml(m.url)}" x="0" y="0" width="${ma.width_px}" height="${ma.height_px}" preserveAspectRatio="none"/>` : `<svg x="0" y="0" width="${sw}" height="${sh}" viewBox="${sx} ${sy} ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden"><image href="${xml(m.url)}" x="0" y="0" width="${ma.width_px}" height="${ma.height_px}"/></svg>`;
        defs.push(`<mask id="${xml(mid)}" maskUnits="userSpaceOnUse" maskContentUnits="userSpaceOnUse" x="-100000" y="-100000" width="200000" height="200000"><rect x="-100000" y="-100000" width="200000" height="200000" fill="#fff"/><g transform="${fmt(mul(T(-px, -py), cropToCanonical(ma)))}" filter="url(#${xml(P("alpha-black"))})">${maskImg}</g></mask>`);
        maskAttr = ` mask="url(#${xml(mid)})"`; }
      screen.push({ id, k, tr, asset_id: aid, markup: `<g id="${xml(P(id))}">${emitPass(`${id}-p`, r.asset, r.url, prefix).replace(/^<g id="([^"]+)"/, `<g id="$1"${maskAttr}`)}</g>` });
      runtimeIds.push(id);
    });
  }
  const ids = new Set(); for (const id of runtimeIds) { if (ids.has(id)) throw err("DUPLICATE_ELEMENT_ID", { record_id: id, reason: "runtime id emitted twice" }); ids.add(id); }
  const camIds = BANDS.filter((b) => ordered[b].length).map((b) => `cam-${b}`);
  const W = doc.stage.width, H = doc.stage.height;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" id="${xml(P("stage"))}" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${[...new Set(defs)].join("")}</defs>` +
    (background ? `<rect id="${xml(P("sentinel"))}" x="0" y="0" width="${W}" height="${H}" fill="${sentinel}"/>` : "") +
    BANDS.filter((b) => ordered[b].length).map((b) => `<g id="${xml(P(`cam-${b}`))}" data-band="${b}">${ordered[b].map((it) => it.markup).join("")}</g>`).join("") +
    (screen.length ? `<g id="${xml(P("screen"))}">${screen.map((s) => s.markup).join("")}</g>` : "") + `</svg>`;
  const pivotOf = (aid) => assets.get(aid).pivot_xy;

  /** full runtime state for frame f: [[elementId, transform, visible, opacity]] for every runtime-owned element (+ the raw stateAtFrame) */
  function frameState(f, { subframe = false } = {}) {
    const st = stateAtFrame(compiled, f, { subframe }), rows = [], inShot = st.shotId === shot.id, cam = st.camera;
    for (const b of BANDS) if (ordered[b].length) rows.push([P(`cam-${b}`), fmt(cameraMatrix(cam, b, plan.parallax, doc.stage)), inShot ? 1 : 0, 1]);
    const live = new Map(st.passes.map((p) => [p.pass_id, p]));
    const lights = []; for (const p of st.passes) lights.push(...applyApprovedLighting(p, st.artStates[p.rig], f, { assets, lighting: plan.lighting }));
    const liveLight = new Map(lights.map((l) => [l.pass_id, l]));
    for (const p of rigPasses) { const q = live.get(p.pass_id); rows.push([P(p.pass_id), fmt(mul(q ? q.matrix : compiled.fk(p.rig, compiled.evalPrimary(f, shot)[p.rig])[p.joint], T(...pivotOf(p.asset_id)))), q && q.visible ? 1 : 0, 1]); }
    for (const id of runtimeIds) if (id.includes("--light-")) { const l = liveLight.get(id); const ownerId = id.slice(0, id.indexOf("--light-")), owner = live.get(ownerId), plane = id.slice(id.indexOf("--light-") + 8); rows.push([P(id), fmt(mul((l || owner)?.matrix || [1, 0, 0, 1, 0, 0], T(...pivotOf(plane)))), l && l.visible ? 1 : 0, l ? +l.opacity.toFixed(4) : 0]); }
    const cels = new Map(st.cels.map((c) => [`${c.action}--cel--${c.asset_id}`, c]));
    for (const id of runtimeIds) if (id.includes("--cel--")) { const c = cels.get(id), aid = id.slice(id.indexOf("--cel--") + 7); rows.push([P(id), fmt(mul(c ? c.matrix : [1, 0, 0, 1, 0, 0], T(...pivotOf(aid)))), c ? 1 : 0, 1]); }
    const syms = new Map(st.procedural.map((s) => [s.pass_id, s]));
    for (const id of runtimeIds) if (id.includes("--sym")) { const s = syms.get(id), aid = s?.asset_id; rows.push([P(id), s ? fmt(mul(s.matrix, T(...pivotOf(aid)))) : "matrix(1 0 0 1 0 0)", s ? 1 : 0, 1]); }
    const transitions = {};
    for (const s of screen) { const fr = s.tr.frameAt(f); transitions[s.tr.id] = fr; const L = fr?.layers.find((l) => l.asset_id === s.asset_id); rows.push([P(s.id), fmt(L ? mul(L.matrix, T(...pivotOf(s.asset_id))) : [1, 0, 0, 1, 0, 0]), L ? 1 : 0, 1]); }
    return { rows, state: st, transitions };
  }
  /** camera footprint over [f0,f1): the viewport mapped into each band must lie inside an opaque painted plate of that band */
  function validateFootprint(f0, f1) {
    const bad = [], plates = (world?.depth_owners || []).flatMap((d) => d.asset_ids.map((aid) => ({ band: d.depth_band, a: assets.get(aid) }))).filter((x) => x.a.alpha_mode === "OPAQUE");
    const farBands = [...new Set(plates.map((x) => x.band))];
    for (let f = f0; f < f1; f++) {
      if (compiled.shotAt(f)?.id !== shot.id) continue; const cam = compiled.cameraAt(f);
      for (const b of farBands) { const Mi = inv(cameraMatrix(cam, b, plan.parallax, doc.stage)), corners = [[0, 0], [W, 0], [0, H], [W, H]].map((c) => apply(Mi, c));
        // exact coverage: every viewport corner must fall inside the plate's transformed crop quad (convex), not a bbox (re-audit B1)
        const ok = plates.some((x) => x.band === b && corners.every((c) => coversCanonical(x.a, c)));
        if (!ok) bad.push({ f, band: b, corners }); }
    }
    const spans = []; for (const x of bad) { const l = spans.at(-1); if (l && l.band === x.band && l.range[1] === x.f) l.range[1]++; else spans.push({ band: x.band, range: [x.f, x.f + 1], corners: x.corners }); }
    return spans.map((s) => err("OUTSIDE_CAMERA_FOOTPRINT", { shot_id: shot.id, frame_range: s.range, record_id: `${shot.id}.${s.band}`, suggested_producer: "GPT world extension / overscan plate, or re-stage the camera", reason: `camera reveals unpainted area in band ${s.band} on frames ${s.range[0]}..${s.range[1] - 1}`, details: { first_frame_viewport_corners_world: s.corners } }));
  }
  return { svg, runtimeIds: runtimeIds.map(P), cameraIds: camIds.map(P), order: Object.fromEntries(BANDS.map((b) => [b, ordered[b].map((x) => x.id)])), frameState, validateFootprint, transitions: trans };
}
