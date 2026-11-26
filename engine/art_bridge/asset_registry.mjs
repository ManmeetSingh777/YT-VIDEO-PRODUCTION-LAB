// Asset registry (spec §5.1): verifies every file/hash/alpha ONCE through the Stage 1 loader, maps stable asset ids to package-local URLs
// and decoded pixels. Never returns a placeholder: an unknown id is MISSING_ART_ASSET.
import path from "node:path";
import { loadManifest, resolveInside } from "./load_manifest.mjs";
import { err } from "./errors.mjs";
import { actionInShot, actionShots, shotSegments, validateShotSpan } from "../story/action_span.mjs";

const xmlSafe = /^[A-Za-z0-9_./-]+$/;
export async function createAssetRegistry(root, manifest, { production = false } = {}) {
  const L = await loadManifest(root, manifest, { production });
  if (!L.ok) { const e = new Error(`asset registry: manifest failed (${L.errors.length} error(s)): ${L.errors.slice(0, 3).map((x) => `${x.code} ${x.record_id ?? ""}`).join("; ")}`); e.errors = L.errors; e.code = L.errors[0]?.code; throw e; } // typed: the first violated invariant's code
  const doc = L.doc, byId = new Map();
  for (const a of doc.assets) {
    if (!xmlSafe.test(a.file)) throw err("ASSET_PATH_INVALID", { record_id: a.id, reason: "asset path contains characters not allowed in a package URL" });
    byId.set(a.id, Object.freeze({ asset: a, abs: resolveInside(path.resolve(root), a.file), url: `assets/${a.file}`, decoded: L.decoded?.[a.id] || null }));
  }
  const reg = {
    doc, root: path.resolve(root),
    get(id) { const r = byId.get(id); if (!r) throw err("MISSING_ART_ASSET", { record_id: id, suggested_producer: "art_requests.missingArtJobs", reason: `asset ${id} is not registered` }); return r; },
    has: (id) => byId.has(id),
    getState(identityId, view, pose) { return doc.assets.filter((a) => a.identity_id === identityId && (view == null || a.view_id === view) && (pose == null || a.pose_id === pose)).map((a) => byId.get(a.id)); },
    preloadForShot(shotId) {
      const shot = doc.shots.find((s) => s.id === shotId); if (!shot) throw err("UNKNOWN_REFERENCE", { record_id: shotId, reason: "unknown shot" });
      const ids = new Set(shot.required_asset_ids);
      for (const a of doc.actions) if (actionInShot(a, shotId)) { a.required_assets.forEach((x) => ids.add(x)); for (const act of a.actors) { const r = doc.rigs.find((q) => q.id === act.rig_id); r?.render_parts.forEach((p) => ids.add(p.asset_id)); for (const s of [...(r?.pose_states || []), ...(r?.view_states || [])]) Object.values(s.asset_bindings).forEach((x) => ids.add(x)); } }
      const w = doc.worlds.find((x) => x.id === shot.world_id); w?.depth_owners.forEach((d) => d.asset_ids.forEach((x) => ids.add(x)));
      return [...ids].map((id) => reg.get(id));
    },
    all: () => [...byId.values()],
  };
  return Object.freeze(reg);
}
