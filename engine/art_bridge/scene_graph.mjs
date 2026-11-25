// Scene graph (spec §5.1 composeShot, §5.6, §11.3). Semantic owner tree: per-depth-band camera ancestors → world plates / rig paint passes /
// cels / procedural symbols / light planes, paint order solved from explicit occlusion constraints (cycle → OCCLUSION_CONFLICT, never a z
// tweak), transition plates in a SCREEN band with authored aperture masks. frameState(f) lists EVERY runtime-owned element every frame,
// so a seek never inherits a previous frame's attribute (order-independent rendering).
import { err } from "./errors.mjs";
import { emitRigTree, emitPass, emitSpritePart, xml } from "./svg_parts.mjs";
import { bindableAssets } from "./state_channels.mjs";
import { castShadow } from "./motion_systems.mjs";
import { gripMorphology } from "./contact_solver.mjs";
import { shadowAffine, dilate } from "./execution.mjs";
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

function topoOrder(items, assets, extra = []) {
  // items: [{id, asset_id, slot}] in declared priority order. Edges from asset draw_order_constraints (ABOVE x: x painted first).
  const n = items.length, idx = new Map(items.map((it, i) => [it.id, i])), out = Array.from({ length: n }, () => new Set()), indeg = new Array(n).fill(0);
  const bySlotOrAsset = (k) => items.filter((it) => it.slot === k || it.asset_id === k).map((it) => idx.get(it.id));
  for (const it of items) { const a = assets.get(it.slot) || assets.get(it.asset_id); for (const c of a?.draw_order_constraints || []) for (const j of bySlotOrAsset(c.asset_id)) { const i = idx.get(it.id); if (i === j) continue; const [from, to] = c.relation === "ABOVE" ? [j, i] : [i, j]; if (!out[from].has(to)) { out[from].add(to); indeg[to]++; } } }
  // P03: directed cross-rig paint order (near/far occlusion between characters and props): plan.paint_order [{above, below}] (slot/asset/rig ids)
  const match = (k) => items.filter((it) => it.slot === k || it.asset_id === k || it.rig === k).map((it) => idx.get(it.id));
  for (const { above, below } of extra) for (const i of match(above)) for (const j of match(below)) if (i !== j && !out[j].has(i)) { out[j].add(i); indeg[i]++; }
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
  const inThisShot = (actionId) => { const a = doc.actions.find((x) => x.id === actionId); return !a || a.shot_id === shot.id; };
  // P03 F: cast shadows re-use the APPROVED occluder drawing, projected onto the declared receiver plane and flattened by its material treatment
  const shadowPasses = [];
  const shadowGroups = new Map();
  for (const sh of plan.shadows || []) { if (!rigIds.includes(sh.occluder.rig)) continue; const rig = doc.rigs.find((r) => r.id === sh.occluder.rig), tr = castShadow({ light: sh.light, occluder: { id: sh.occluder.slot, polygon: [[0, 0], [1, 0], [1, 1]] }, receiver: sh.receiver }).treatment;
    for (const aid of bindableAssets(rig, sh.occluder.slot)) { const r = registry.get(aid), id = `shadow--${sh.id}--${aid}`, band = assets.get(aid).depth_band, gk = `${rig.id}--${sh.receiver.id}--${band}`, g = shadowGroups.get(gk) || { key: gk, band, sh, tr, aid, slot: sh.occluder.slot, parts: [] }; g.parts.push(emitPass(id, r.asset, r.url, prefix)); shadowGroups.set(gk, g); runtimeIds.push(id); shadowPasses.push({ id, sh, rig: rig.id, aid, pass_id: `${rig.id}--${sh.occluder.slot}--${aid}`, treatment: tr }); } }
  for (const g of shadowGroups.values()) { const fid = `shadowf-${g.key}`, rgb = g.sh.receiver.shadow_rgb || [0.12, 0.1, 0.16], blur = /soft/.test(g.tr.edge) ? '<feGaussianBlur stdDeviation="1.5"/>' : ""; defs.push(`<filter id="${xml(P(fid))}" x="-20%" y="-20%" width="140%" height="140%" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 ${rgb[0]} 0 0 0 0 ${rgb[1]} 0 0 0 0 ${rgb[2]} 0 0 0 1 0"/>${blur}</filter>`);
    (bands[g.band] || bands.FOCAL).push({ id: `shadowgroup--${g.key}`, asset_id: g.aid, slot: `${g.slot}:shadow`, markup: `<g id="${xml(P(`shadowgroup--${g.key}`))}" data-shadow-of="${xml(g.key)}" opacity="${+g.tr.opacity.toFixed(4)}" filter="url(#${xml(P(fid))})">${g.parts.join("")}</g>` }); }
  for (const rid of rigIds) {
    const rig = doc.rigs.find((r) => r.id === rid), { passes, markup } = emitRigTree(rig, registry, prefix);
    for (const p of passes) { const band = assets.get(p.asset_id).depth_band; (bands[band] || bands.FOCAL).push({ id: p.pass_id, asset_id: p.asset_id, slot: p.slot, rig: rid, markup: markup.get(p.pass_id) }); runtimeIds.push(p.pass_id); rigPasses.push(p); }
    for (const [planeId, L] of Object.entries(plan.lighting || {})) { const owner = passes.find((p) => p.slot === L.owner_part); if (!owner) continue; const r = registry.get(planeId), id = `${owner.pass_id}--light-${planeId}`; (bands[assets.get(owner.asset_id).depth_band] || bands.FOCAL).push({ id, asset_id: planeId, slot: `${owner.slot}:light`, after: owner.pass_id, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); }
  }
  // cels and procedural symbols active in this shot
  for (const [aid, cel] of Object.entries(plan.cels || {})) { const a = doc.actions.find((x) => x.id === aid); if (a?.shot_id !== shot.id) continue; for (const e of [...new Set(cel.cycle.map((c) => c.asset_id))]) { const r = registry.get(e), id = `${aid}--cel--${e}`; bands[cel.band || "FOCAL"].push({ id, asset_id: e, slot: e, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); } }
  for (const [aid, p] of Object.entries(plan.procedural || {})) { if (p.type !== "FLOW_PATH" && p.type !== "MODEL_BAR") continue; const a = doc.actions.find((x) => x.id === aid); if (a?.shot_id !== shot.id) continue; const max = p.type === "MODEL_BAR" ? 1 : Math.max(...p.count.map((k) => k[1])), r = registry.get(p.symbol_asset); for (let i = 0; i < max; i++) { const id = `${aid}--sym${i}`; bands[p.band || "FOCAL"].push({ id, asset_id: p.symbol_asset, slot: p.symbol_asset, markup: emitPass(id, r.asset, r.url, prefix) }); runtimeIds.push(id); } }
  // P03 E: approved raster mesh deformation = one clipped copy of the APPROVED drawing per mesh triangle, each moved by its own affine
  const triPasses = [];
  for (const [mid, m] of Object.entries(plan.deform_maps || {})) { if (!inThisShot(mid) || !rigIds.includes(m.rig)) continue; const base = rigPasses.find((q) => q.rig === m.rig && q.slot === m.slot && q.asset_id === m.asset); if (!base) throw err("DEFORM_RENDER_FAILURE", { record_id: mid, reason: `deform map targets ${m.rig}.${m.slot}=${m.asset}, which has no paint pass in shot ${shot.id}` });
    const r = registry.get(m.asset), [px, py] = r.asset.pivot_xy, band = assets.get(m.asset).depth_band;
    m.triangles.forEach((T_, i) => { const id = `${base.pass_id}--tri${i}`, cid = P(`${id}-clip`), pts = dilate(T_.map((q) => m.vertices[q]), m.seam_px ?? 0.6).map(([x, y]) => `${(x - px).toFixed(3)},${(y - py).toFixed(3)}`).join(" ");
      defs.push(`<clipPath id="${xml(cid)}" clipPathUnits="userSpaceOnUse"><polygon points="${pts}"/></clipPath>`);
      (bands[band] || bands.FOCAL).push({ id, asset_id: m.asset, slot: `${m.slot}:tri${i}`, rig: m.rig, after: base.pass_id, markup: `<g id="${xml(P(id))}" data-asset="${xml(m.asset)}"><g clip-path="url(#${xml(cid)})">${emitSpritePart({ id, asset_id: m.asset }, r.asset, r.url, prefix)}</g></g>` }); runtimeIds.push(id); triPasses.push({ id, map: mid, tri: i, base: base.pass_id, asset_id: m.asset }); }); }
  // P03 E: vector morph paths (REGISTERED_MORPH): the pass of the FROM drawing owns path elements whose d is written every frame
  const morphPaths = [];
  for (const [mid, m] of Object.entries(plan.morphs || {})) { if (!inThisShot(mid) || !rigIds.includes(m.rig)) continue; const base = rigPasses.find((q) => q.rig === m.rig && q.slot === m.slot && q.asset_id === m.from); if (!base) throw err("INVALID_MORPH_TOPOLOGY", { record_id: mid, reason: `morph source ${m.from} has no paint pass for ${m.rig}.${m.slot}` });
    assets.get(m.from).vector_paths.forEach((vp, i) => { morphPaths.push({ id: `${base.pass_id}-path${i}`, map: mid, i, d0: vp.d }); }); }
  const ordered = {}; for (const b of BANDS) ordered[b] = topoOrder(bands[b], assets, plan.paint_order || []);
  // transitions touching this shot (outgoing): screen band with aperture masks (static in plate-local coordinates)
  const trans = doc.transitions.filter((t) => (t.from_shot === shot.id || (t.to_shot === shot.id && t.frame_range[1] > shot.start_frame)) && t.mode === "CONTINUOUS").map((t) => compileTransition(doc.shots.find((s) => s.id === t.from_shot), doc.shots.find((s) => s.id === t.to_shot), t, { doc })); // P05: a transition that crosses the shot boundary is executed on BOTH sides of it (it used to vanish at the boundary)
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
    (screen.length ? `<g id="${xml(P("screen"))}">${[...screen].sort((x, y) => y.k - x.k).map((s) => s.markup).join("")}</g>` : "") + `</svg>`; // P05: IN is painted first, then MIDDLE, then OUT: each plate is seen only through the aperture of the plate in front of it
  const pivotOf = (aid) => assets.get(aid).pivot_xy;

  /** full runtime state for frame f: [[elementId, transform, visible, opacity]] for every runtime-owned element (+ the raw stateAtFrame) */
  function frameState(f, { subframe = false } = {}) {
    const st = stateAtFrame(compiled, f, { subframe }), rows = [], inShot = st.shotId === shot.id, cam = st.camera;
    for (const b of BANDS) if (ordered[b].length) rows.push([P(`cam-${b}`), fmt(cameraMatrix(cam, b, plan.parallax, doc.stage)), inShot ? 1 : 0, 1]);
    const live = new Map(st.passes.map((p) => [p.pass_id, p]));
    const lights = []; for (const p of st.passes) lights.push(...applyApprovedLighting(p, st.artStates[p.rig], f, { assets, lighting: plan.lighting }));
    const liveLight = new Map(lights.map((l) => [l.pass_id, l]));
    const execution = { shadows: [], grips: [], deforms: st.deforms.map((d) => ({ id: d.id, weight: d.weight })), morphs: st.morphs.map((m) => ({ id: m.id, weight: m.weight })) }, deformedBase = new Set(triPasses.filter((t) => st.deforms.some((d) => d.id === t.map)).map((t) => t.base));
    for (const p of rigPasses) { const q = live.get(p.pass_id); rows.push([P(p.pass_id), fmt(mul(q ? q.matrix : compiled.fk(p.rig, compiled.evalPrimary(f, shot)[p.rig])[p.joint], T(...pivotOf(p.asset_id)))), q && q.visible && !deformedBase.has(p.pass_id) ? 1 : 0, 1]); }
    for (const t of triPasses) { const q = live.get(t.base), d = st.deforms.find((x) => x.id === t.map), on = !!(q && q.visible && d); rows.push([P(t.id), fmt(mul(mul(q ? q.matrix : [1, 0, 0, 1, 0, 0], on ? d.affines[t.tri] : [1, 0, 0, 1, 0, 0]), T(...pivotOf(t.asset_id)))), on ? 1 : 0, 1]); }
    for (const mp of morphPaths) { const m = st.morphs.find((x) => x.id === mp.map); rows.push([P(mp.id), "matrix(1 0 0 1 0 0)", 1, 1, { d: m ? m.d[mp.i] : mp.d0 }]); }
    for (const s of shadowPasses) { const q = live.get(s.pass_id), A = shadowAffine(s.sh.light, s.sh.receiver), on = !!(q && q.visible); rows.push([P(s.id), fmt(mul(mul(A, q ? q.matrix : [1, 0, 0, 1, 0, 0]), T(...pivotOf(s.aid)))), on ? 1 : 0, 1]);
      if (on) { const [x, y, w, h] = assets.get(s.aid).canonical_rect, poly = [[x, y], [x + w, y], [x + w, y + h], [x, y + h]].map((c) => apply(q.matrix, c)); try { const cs = castShadow({ light: s.sh.light, occluder: { id: s.sh.occluder.slot, polygon: poly }, receiver: s.sh.receiver }); execution.shadows.push({ id: s.sh.id, asset: s.aid, footprint_x: [Math.min(...cs.polygon.map((v) => v[0])), Math.max(...cs.polygon.map((v) => v[0]))], treatment: cs.treatment }); } catch (e) { st.failures.push(e); } } }
    // P04 §5.8: a grounded character's shadow must reach its contact points — the union of the rig's ground_contact shadow footprints (x) must span the
    // planted feet (a torso-only shadow floating above the feet is refused)
    { const byRig = {}; for (const s of execution.shadows) { const sh = (plan.shadows || []).find((x) => x.id === s.id); if (sh?.ground_contact) (byRig[sh.occluder.rig] ||= []).push({ joint: compiled.rigs.get(sh.occluder.rig)?.rec.render_parts.find((r) => r.asset_id === sh.occluder.slot)?.joint_id ?? null, footprint_x: s.footprint_x }); }
      for (const [rig, fps] of Object.entries(byRig)) { const R_ = compiled.rigs.get(rig), anc = (j) => { const out = []; let c = j; while (c) { out.push(c); c = R_.joints.get(c)?.parent_id; } return out; }, feet = st.contacts.filter((c) => c.contact_type === "PLANT" && compiled.contacts.some((k) => k.action.id === c.action && k.c.source_socket === c.socket && k.rig === rig)), miss = feet.filter((c) => { const j = compiled.contacts.find((k) => k.action.id === c.action && k.c.source_socket === c.socket && k.rig === rig).socket.joint_id, chain = anc(j).slice(0, 2); return !fps.some((x) => chain.includes(x.joint)); });
        if (miss.length) st.failures.push(err("SHADOW_RELATION_MISSING", { record_id: rig, frame_range: [f, f + 1], reason: `cast shadow has no occluder on the grounded limb(s) of ${miss.map((c) => c.socket).join(", ")}: a torso-only shadow does not ground the character (the limb carrying the planted foot must cast it)` })); } }
    // P03 F: grip morphology on every locked GRIP contact that declares its grip (palm/handle bases, closure state, near/far, thumb)
    const layerIndex = new Map(); { let k = 0; for (const b of BANDS) for (const it of ordered[b]) layerIndex.set(it.id, k++); }
    for (const c of st.contacts.filter((x) => x.locked && x.contact_type === "GRIP")) { const g = plan.grips?.[`${c.action}:${c.socket}`] || plan.grips?.[c.action], gid = `${c.action}:${c.socket}`, fail = (code, reason, inv) => st.failures.push(err(code, { record_id: gid, frame_range: [f, f + 1], reason, details: { failed_invariant: inv } }));
      // P04 §5.3: a locked grip without a declared contract is a blocking failure (never an unchecked pass)
      if (!g) { execution.grips.push({ action: c.action, socket: c.socket, checked: false }); fail("GRIP_CONTRACT_MISSING", `locked GRIP ${gid} has no plan.grips entry (palm/handle basis, HAND-channel closure state, near/far, release): the grip cannot be verified and must not render unchecked`, "GRIP_CONTRACT_DECLARED"); continue; }
      const k = compiled.contacts.find((x) => x.action.id === c.action && x.c.source_socket === c.socket), M = st.matrices, src = k.socket.joint_id, srcRec = compiled.rigs.get(k.rig).rec, tgtJ = k.tgtRig ? compiled.rigs.get(k.tgtRig).socketById.get(k.c.target_socket).joint_id : null;
      const ang = (m) => (Math.atan2(m[1], m[0]) * 180) / Math.PI, palm = ang(M[k.rig][src]) + (g.palm_basis_deg ?? 0), handle = (tgtJ ? ang(M[k.tgtRig][tgtJ]) : 0) + (g.handle_basis_deg ?? 0);
      const vis = (rig, joint) => st.passes.filter((q) => q.rig === rig && q.joint === joint && q.visible).map((q) => layerIndex.get(q.pass_id) ?? -1), handLayer = Math.max(-1, ...vis(k.rig, src)), propLayer = tgtJ ? Math.max(-1, ...vis(k.tgtRig, tgtJ)) : -1;
      // closure is a HAND-channel state with its own approved drawing — NEVER inferred from the body pose
      const hands = (srcRec.state_channels || []).filter((x) => x.kind === "HAND"), hc = g.hand_channel ? hands.find((x) => x.id === g.hand_channel) : hands.length === 1 ? hands[0] : null;
      const handState = hc ? st.artStates[k.rig]?.channels?.[hc.id] ?? null : null, hst = hc?.states.find((x) => x.id === handState), drawn = hc ? Object.entries(hst?.asset_bindings || {}) : [], closureOk = !!hc && handState === g.closure_state, artOk = closureOk && drawn.length > 0 && drawn.every(([slot, aid]) => hc.slots.includes(slot) && aid !== slot && assets.has(aid) && st.passes.some((q) => q.rig === k.rig && q.slot === slot && q.asset_id === aid && q.visible));
      const r = gripMorphology({ palm_normal_deg: palm, handle_normal_deg: handle, closure_state: closureOk ? "GRIP" : handState ?? "NO_HAND_CHANNEL", phase: "HOLD", thumb_side: g.thumb_side ?? null, required_thumb_side: g.required_thumb_side ?? null, hand_layer: handLayer, prop_layer: propLayer, near_far: g.near_far === "WRAP" ? (handLayer > propLayer ? "HAND_IN_FRONT" : "PROP_IN_FRONT") : g.near_far || "HAND_IN_FRONT", tol_deg: g.tol_deg ?? 30 });
      if (!hc) fail("GRIP_CONTRACT_MISSING", `rig ${k.rig} declares no ${hands.length > 1 ? "unambiguous " : ""}HAND channel: closure cannot be proven from the body pose`, "HAND_CHANNEL_DECLARED");
      else if (!closureOk) fail("GRIP_MORPHOLOGY_FAILED", `HAND channel ${hc.id} shows ${handState} during the hold; contract requires closure state ${g.closure_state}`, "HAND_CLOSURE_DRAWING");
      else if (!artOk) fail("GRIP_MORPHOLOGY_FAILED", `HAND channel state ${handState} has no visible approved closure drawing bound to a hand slot`, "HAND_CLOSURE_DRAWING_VISIBLE");
      // the prop's motion during a hold must be physically related: an authored joint track on the gripped object without a reaction is unrelated motion
      if (tgtJ && k.tgtRig) { const tr = plan.tracks?.[k.tgtRig]?.joints?.[tgtJ], reacted = (plan.reactions || []).some((rx) => rx.rig === k.tgtRig && rx.joint === tgtJ && f >= rx.frames[0] && f < rx.frames[1]); if (tr?.length && tr.some(([fr, v], i) => i && v !== tr[i - 1][1] && tr[i - 1][0] < k.c.end_frame && fr > k.c.start_frame) && !reacted && g.prop_relation !== "AUTHORED") fail("GRIP_MORPHOLOGY_FAILED", `the gripped object's joint ${k.tgtRig}.${tgtJ} is moved by an unrelated authored track during the hold (no reaction contract)`, "PROP_MOTION_CAUSED"); }
      // near/far finger topology: every declared near drawing paints above the prop, every far drawing below it (one hand joint, separate drawings)
      if (g.near_far === "WRAP" && !(g.finger_layers?.near?.length && g.finger_layers?.far?.length)) fail("GRIP_MORPHOLOGY_FAILED", "a WRAP grip declares no finger_layers {near, far}: it cannot be drawn around the prop", "FINGER_LAYER_TOPOLOGY");
      if (!g.finger_layers && g.near_far !== "WRAP" && !String(g.single_layer_reason || "").trim()) fail("GRIP_MORPHOLOGY_FAILED", "the grip declares neither near/far finger drawings (finger_layers) nor why one hand layer is the complete drawing (single_layer_reason, e.g. a closed fist that hides the far fingers)", "FINGER_LAYER_TOPOLOGY");
      if (g.finger_layers) { const lay = (slot) => Math.max(-1, ...st.passes.filter((q) => q.rig === k.rig && q.slot === slot && q.visible).map((q) => layerIndex.get(q.pass_id) ?? -1)); for (const [side, slots] of Object.entries(g.finger_layers)) for (const sl of slots) { const L_ = lay(sl); if (L_ < 0) fail("GRIP_MORPHOLOGY_FAILED", `${side} finger drawing ${sl} is not visible during the hold`, "FINGER_LAYER_TOPOLOGY"); else if ((side === "near") !== (L_ > propLayer)) fail("GRIP_MORPHOLOGY_FAILED", `${side} finger drawing ${sl} paints ${L_ > propLayer ? "above" : "below"} the prop`, "FINGER_LAYER_TOPOLOGY"); } }
      execution.grips.push({ action: c.action, socket: c.socket, checked: true, ok: r.ok && closureOk && artOk, palm_deg: palm, handle_deg: handle, hand_layer: handLayer, prop_layer: propLayer, hand_channel: hc?.id ?? null, closure: handState });
      for (const x of r.failures) st.failures.push(err("GRIP_MORPHOLOGY_FAILED", { record_id: gid, frame_range: [f, f + 1], reason: `${x.code}: ${x.reason}`, details: { failed_invariant: x.code } })); }
    for (const id of runtimeIds) if (id.includes("--light-")) { const l = liveLight.get(id); const ownerId = id.slice(0, id.indexOf("--light-")), owner = live.get(ownerId), plane = id.slice(id.indexOf("--light-") + 8); rows.push([P(id), fmt(mul((l || owner)?.matrix || [1, 0, 0, 1, 0, 0], T(...pivotOf(plane)))), l && l.visible ? 1 : 0, l ? +l.opacity.toFixed(4) : 0]); }
    const cels = new Map(st.cels.map((c) => [`${c.action}--cel--${c.asset_id}`, c]));
    for (const id of runtimeIds) if (id.includes("--cel--")) { const c = cels.get(id), aid = id.slice(id.indexOf("--cel--") + 7); rows.push([P(id), fmt(mul(c ? c.matrix : [1, 0, 0, 1, 0, 0], T(...pivotOf(aid)))), c ? 1 : 0, 1]); }
    const syms = new Map(st.procedural.map((s) => [s.pass_id, s]));
    for (const id of runtimeIds) if (id.includes("--sym")) { const s = syms.get(id), aid = s?.asset_id; rows.push([P(id), s ? fmt(mul(s.matrix, T(...pivotOf(aid)))) : "matrix(1 0 0 1 0 0)", s ? 1 : 0, 1]); }
    const transitions = {};
    for (const s of screen) { const fr = s.tr.frameAt(f); transitions[s.tr.id] = fr; const L = fr?.layers.find((l) => l.asset_id === s.asset_id); rows.push([P(s.id), fmt(L ? mul(L.matrix, T(...pivotOf(s.asset_id))) : [1, 0, 0, 1, 0, 0]), L ? 1 : 0, 1]); }
    return { rows, state: st, transitions, execution };
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
  return { svg, runtimeIds: runtimeIds.map(P), cameraIds: camIds.map(P), deformables: { tris: triPasses.map((t) => ({ id: P(t.id), base: P(t.base), map: t.map })), morphs: morphPaths.map((m) => ({ id: P(m.id), map: m.map, d0: m.d0 })) }, order: Object.fromEntries(BANDS.map((b) => [b, ordered[b].map((x) => x.id)])), frameState, validateFootprint, transitions: trans };
}
