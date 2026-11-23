// Image part → live SVG joint (spec §5.2). The image keeps its approved pixels; SVG only places it. The runtime writes exactly one transform
// per pass group (the joint matrix × pivot); the paint wrapper is static (asset_to_canonical / crop_to_canonical only). Never auto-centres.
import { err } from "./errors.mjs";
import { fmt, mul, T } from "./math2d.mjs";
import { cropToCanonical } from "./asset_geometry.mjs";
import { bindableAssets } from "./state_channels.mjs";

export const xml = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
const finite = (v, n) => { if (!Number.isFinite(v)) throw err("RENDER_CAPTURE_FAILURE", { record_id: n, reason: `INVALID_NUMBER ${n}` }); return v; };

/** inner paint markup for asset a (static): the crop is drawn at its native crop-pixel size and mapped by ONE affine,
 *  paint transform = translate(−pivot) · crop_to_canonical (asset_geometry.mjs). Scale/rotation/crop are applied exactly once (re-audit B1). */
export function emitSpritePart(p, a, href, prefix) {
  if (!a || !href) throw err("MISSING_ART_ASSET", { record_id: p?.asset_id, reason: "sprite part without registered asset/href" });
  // P03 E: an approved VECTOR_PATH drawing is emitted as its registered canonical paths (pivot-relative); morphs rewrite each path's d per frame
  if (a.kind === "VECTOR_PATH") { if (!a.vector_paths?.length) throw err("MISSING_ART_ASSET", { record_id: a.id, reason: "VECTOR_PATH asset without registered paths" }); const [vx, vy] = a.pivot_xy;
    return `<g id="${xml(prefix + p.id)}-paint" transform="translate(${-vx} ${-vy})">${a.vector_paths.map((vp, i) => `<path id="${xml(prefix + p.id)}-path${i}" d="${xml(vp.d)}" fill="${xml(vp.fill)}"${vp.stroke ? ` stroke="${xml(vp.stroke)}" stroke-width="${vp.stroke_width ?? 1}"` : ""}/>`).join("")}</g>`; }
  const [px, py] = a.pivot_xy, C = cropToCanonical(a), [sx, sy, sw, sh] = a.source_pixel_crop;
  [...C, px, py, sw, sh].forEach((v, i) => finite(v, `${a.id}.${i}`));
  if (sw <= 0 || sh <= 0 || Math.abs(C[0] * C[3] - C[1] * C[2]) < 1e-12) throw err("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: "degenerate crop or crop→canonical matrix" });
  const id = xml(prefix + p.id), full = sx === 0 && sy === 0 && sw === a.width_px && sh === a.height_px;
  const img = full
    ? `<image id="${id}-image" href="${xml(href)}" x="0" y="0" width="${a.width_px}" height="${a.height_px}" preserveAspectRatio="none"/>`
    : `<svg id="${id}-crop" x="0" y="0" width="${sw}" height="${sh}" viewBox="${sx} ${sy} ${sw} ${sh}" preserveAspectRatio="none" overflow="hidden"><image id="${id}-image" href="${xml(href)}" x="0" y="0" width="${a.width_px}" height="${a.height_px}"/></svg>`;
  return `<g id="${id}-paint" transform="${fmt(mul(T(-px, -py), C))}">${img}</g>`;
}

/** one pass group: the ONLY runtime-written transform for this paint instance */
export function emitPass(passId, a, href, prefix, extra = "") {
  return `<g id="${xml(prefix + passId)}" data-asset="${xml(a.id)}"${extra}>${emitSpritePart({ id: passId, asset_id: a.id }, a, href, prefix)}</g>`;
}

/** emitRigTree(rig, registry, scenePrefix) → { passes: [{pass_id, slot, asset_id, joint}], markup: Map(pass_id → string) } for every slot × bindable asset */
export function emitRigTree(rig, registry, prefix) {
  const passes = [], markup = new Map(), seen = new Set();
  const bindable = (slot) => bindableAssets(rig, slot); // pose, view AND explicit channel states (P03 B)
  for (const p of rig.render_parts) for (const aid of bindable(p.asset_id)) {
    const passId = `${rig.id}--${p.asset_id}--${aid}`;
    if (seen.has(passId)) throw err("DUPLICATE_ELEMENT_ID", { record_id: passId, reason: "duplicate pass id" }); seen.add(passId);
    const r = registry.get(aid);
    passes.push({ pass_id: passId, slot: p.asset_id, asset_id: aid, joint: p.joint_id, rig: rig.id });
    markup.set(passId, emitPass(passId, r.asset, r.url, prefix));
  }
  return { passes, markup };
}
