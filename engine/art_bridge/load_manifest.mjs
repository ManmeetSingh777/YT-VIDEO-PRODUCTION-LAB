// loadManifest(projectRoot, manifestPath) — parse, schema-validate, check referential integrity against REAL files (bytes, hashes, decoded
// alpha, dimensions), check semantic motion/art invariants, and return deeply frozen normalized objects. No defaults are invented: a field
// the schema requires is either present or the load fails with a structured error. Browser/DOM independent.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import url from "node:url";
import { validate } from "./jsonschema.mjs";
import { readPNG } from "./png.mjs";
import { err } from "./errors.mjs";
import { buildGraphs } from "./graph.mjs";
import { solveTwoBonePosition } from "./constraints.mjs";
import { checkMethodUses } from "./method_trace.mjs";
import { verifyAllApprovals } from "./approvals.mjs";
import { rectMismatch } from "./asset_geometry.mjs";
import { validateShotSpan } from "../story/action_span.mjs";
const here = path.dirname(url.fileURLToPath(import.meta.url));
export const SCHEMA = JSON.parse(fs.readFileSync(path.join(here, "..", "..", "schemas", "motion_art_manifest_v2.schema.json"), "utf8"));
const deepFreeze = (o) => { if (o && typeof o === "object" && !Object.isFrozen(o)) { Object.freeze(o); for (const v of Object.values(o)) deepFreeze(v); } return o; };
const sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

export function resolveInside(root, rel) {
  const abs = path.resolve(root, rel), r = path.resolve(root) + path.sep;
  if (!(abs + path.sep).startsWith(r) && abs !== path.resolve(root)) return null;
  return abs;
}

/** options: {production:boolean} — production manifests may not contain DIAGNOSTIC_FIXTURE assets */
export async function loadManifest(projectRoot, manifestPath, options = {}) {
  const errors = [], mf = path.resolve(projectRoot, manifestPath);
  let doc; try { doc = JSON.parse(fs.readFileSync(mf, "utf8")); } catch (e) { return { ok: false, errors: [err("SCHEMA_VIOLATION", { file: manifestPath, reason: `unreadable manifest: ${e.message}` })] }; }
  for (const v of validate(SCHEMA, doc)) errors.push(err("SCHEMA_VIOLATION", { file: manifestPath, record_id: v.path, reason: v.msg }));
  if (errors.length) return { ok: false, errors };
  const E = (code, o) => errors.push(err(code, { file: manifestPath, ...o }));

  // duplicate ids across top-level records
  const seen = new Map();
  for (const [kind, list] of [["identity", doc.identities], ["asset", doc.assets], ["rig", doc.rigs], ["world", doc.worlds], ["action", doc.actions], ["shot", doc.shots]])
    for (const r of list) { if (seen.has(r.id) && !(kind === "rig" && seen.get(r.id) === "identity" && r.identity_id === r.id)) E("DUPLICATE_ELEMENT_ID", { record_id: r.id, reason: `id used by ${seen.get(r.id)} and ${kind}` }); else if (!seen.has(r.id)) seen.set(r.id, kind); } // a rig may carry the id of its OWN identity (E01 packet: rig CHAR_MIA of identity CHAR_MIA): both name one subject; any other collision is refused
  const assets = new Map(doc.assets.map((a) => [a.id, a])), identities = new Map(doc.identities.map((i) => [i.id, i])), shots = new Map(doc.shots.map((s) => [s.id, s]));

  // authority files exist
  for (const [k, v] of Object.entries(doc.authority)) if (v !== null && !resolveInside(projectRoot, v)) E("ASSET_PATH_INVALID", { record_id: `authority.${k}`, reason: "path escapes the package root" });

  // assets: real bytes
  const decoded = new Map();
  for (const a of doc.assets) {
    const abs = resolveInside(projectRoot, a.file);
    if (!abs) { E("ASSET_PATH_INVALID", { record_id: a.id, reason: `path ${a.file} escapes the package root` }); continue; }
    if (!fs.existsSync(abs)) { E("MISSING_ART_ASSET", { record_id: a.id, dependency: a.file, suggested_producer: "GPT image provider (art_requests.missingArtJobs)", reason: "asset file absent" }); continue; }
    if (sha(abs) !== a.sha256) E("ASSET_HASH_MISMATCH", { record_id: a.id, reason: "file bytes do not match the recorded sha256 (any pixel edit invalidates dependent reviews)" });
    if (options.production && a.provenance_class === "DIAGNOSTIC_FIXTURE") E("UNQUALIFIED_STYLE_ASSET", { record_id: a.id, reason: "diagnostic fixture art cannot enter a production manifest" });
    if (a.approved_review_id === null) E("UNAPPROVED_ART", { record_id: a.id, reason: "asset has no approved review" });
    if (a.kind === "VECTOR_PATH") { const { parseSvgPaths } = await import("./art_intake.mjs"), got = parseSvgPaths(fs.readFileSync(abs, "utf8")); if (JSON.stringify(got.map((q) => [q.d, q.fill])) !== JSON.stringify((a.vector_paths || []).map((q) => [q.d, q.fill]))) E("ASSET_HASH_MISMATCH", { record_id: a.id, reason: "recorded vector_paths do not equal the approved SVG file's paths" }); }
    if (/\.png$/i.test(a.file)) {
      let p; try { p = readPNG(abs); } catch (e) { E(e.code || "IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: e.message }); continue; }
      decoded.set(a.id, p);
      if (p.width !== a.width_px || p.height !== a.height_px) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: `file is ${p.width}x${p.height}, manifest says ${a.width_px}x${a.height_px}` });
      const hasT = p.alpha.transparent + p.alpha.partial > 0;
      if (a.alpha_mode === "OPAQUE" && hasT) E("ALPHA_INVALID", { record_id: a.id, reason: "declared OPAQUE but decoded pixels contain transparency" });
      if ((a.alpha_mode === "STRAIGHT" || a.alpha_mode === "PREMULTIPLIED") && (!p.hasAlphaChannel || !hasT)) E("ALPHA_INVALID", { record_id: a.id, reason: "declared transparent but the decoded image has no transparent pixels / alpha channel" });
      if (a.alpha_mode === "BINARY_MASK" && p.alpha.partial > 0) E("ALPHA_INVALID", { record_id: a.id, reason: `declared BINARY_MASK but ${p.alpha.partial} pixels have partial alpha` });
      const [sx, sy, sw, sh] = a.source_pixel_crop;
      if (sx < 0 || sy < 0 || sw <= 0 || sh <= 0 || sx + sw > p.width || sy + sh > p.height) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: `source_pixel_crop ${a.source_pixel_crop} outside the ${p.width}x${p.height} image` });
    }
    const [, , cw, ch] = a.canonical_rect, [, , sw, sh] = a.source_pixel_crop;
    if ((Math.abs(cw - sw) > 1e-6 || Math.abs(ch - sh) > 1e-6) && !a.crop_to_canonical_matrix) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: `crop ${sw}x${sh} and canonical ${cw}x${ch} differ without an explicit crop_to_canonical_matrix` });
    for (const m of [a.crop_to_canonical_matrix, a.asset_to_canonical]) if (m && Math.abs(m[0] * m[3] - m[1] * m[2]) < 1e-9) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: "non-invertible affine matrix" });
    // geometry contract (re-audit B1): canonical_rect is the OCCUPIED canonical bbox of the transformed crop, never a pixel size
    if (a.crop_to_canonical_matrix && Math.abs(a.crop_to_canonical_matrix[0] * a.crop_to_canonical_matrix[3] - a.crop_to_canonical_matrix[1] * a.crop_to_canonical_matrix[2]) >= 1e-9) { const want = rectMismatch(a); if (want) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: `canonical_rect ${a.canonical_rect.map((v) => +v.toFixed(4))} is not the occupied bbox ${want.map((v) => +v.toFixed(4))} of crop_to_canonical_matrix applied to the crop`, details: { stored: a.canonical_rect, derived: want } }); }
    if (a.asset_to_canonical && !a.crop_to_canonical_matrix && options.production) E("IMAGE_DIMENSION_MISMATCH", { record_id: a.id, reason: "legacy asset_to_canonical (linear, about the rect origin) is ambiguous; production assets need crop_to_canonical_matrix" });
    // pivot registration: pivot must coincide with its named canonical landmark and lie inside the canonical rect
    if (a.pivot_landmark_id === null) { if (a.kind === "PART" || a.kind === "CEL") E("UNREGISTERED_PIVOT", { record_id: a.id, reason: "moving art needs a named pivot landmark" }); }
    else { const L = a.landmarks[a.pivot_landmark_id]; if (!L || Math.hypot(L[0] - a.pivot_xy[0], L[1] - a.pivot_xy[1]) > 0.5) E("UNREGISTERED_PIVOT", { record_id: a.id, dependency: a.pivot_landmark_id, reason: `pivot ${a.pivot_xy} does not coincide with landmark ${a.pivot_landmark_id} ${L ? L : "(missing)"}` }); }
    const [rx, ry, rw, rh] = a.canonical_rect; if (a.pivot_xy[0] < rx - rw || a.pivot_xy[0] > rx + 2 * rw || a.pivot_xy[1] < ry - rh || a.pivot_xy[1] > ry + 2 * rh) E("UNREGISTERED_PIVOT", { record_id: a.id, reason: "pivot far outside the part's canonical rect" });
    // hidden surfaces need real underpaint
    if (a.hidden_surfaces.length && !a.underpaint_asset_ids.length) E("MISSING_UNDERPAINT", { record_id: a.id, dependency: a.hidden_surfaces.join(","), suggested_producer: "GPT edit/outpaint job", reason: "declares hidden surfaces but no underpaint asset" });
    for (const u of a.underpaint_asset_ids) { const ua = assets.get(u); if (!ua) E("MISSING_UNDERPAINT", { record_id: a.id, dependency: u, reason: "underpaint asset not in manifest" }); else if (ua.kind !== "UNDERPAINT") E("MISSING_UNDERPAINT", { record_id: a.id, dependency: u, reason: `${u} is ${ua.kind}, not UNDERPAINT` }); }
    for (const k of ["mask_asset_ids", "occluder_asset_ids"]) for (const u of a[k]) if (!assets.has(u)) E("UNKNOWN_REFERENCE", { record_id: a.id, dependency: u, reason: `${k} references an unknown asset` });
  }
  // identities: canonical master
  for (const i of doc.identities) {
    const m = assets.get(i.canonical_asset_id);
    if (!m || !(m.kind === "MASTER" || (i.kind === "WORLD" && ["WORLD_PLANE", "CLEAN_PLATE", "TRANSITION_PLATE", "MASK"].includes(m.kind)))) E("MISSING_CANONICAL_MASTER", { record_id: i.id, dependency: i.canonical_asset_id, suggested_producer: "GPT master generation", reason: "identity has no MASTER asset" });
    else if (m.sha256 !== i.master_sha256) E("ART_IDENTITY_DRIFT", { record_id: i.id, reason: "identity master hash differs from the master asset" });
    if (i.approved_review_id === null) E("UNAPPROVED_ART", { record_id: i.id, reason: "identity master not approved" });
  }
  for (const a of doc.assets) if (!identities.has(a.identity_id)) E("UNKNOWN_REFERENCE", { record_id: a.id, dependency: a.identity_id, reason: "asset identity unknown" });

  // graphs (rig DAG, occlusion cycles, lineage)
  const graphs = buildGraphs(doc); for (const e of graphs.errors) { e.file = manifestPath; errors.push(e); }

  // rigs: parts, sockets, states, edges
  const rigs = new Map(doc.rigs.map((r) => [r.id, r]));
  for (const r of doc.rigs) {
    const ident = identities.get(r.identity_id), joints = new Map(r.joints.map((j) => [j.id, j]));
    for (const p of r.render_parts) { if (!assets.has(p.asset_id)) E("MISSING_ART_ASSET", { record_id: `${r.id}.${p.asset_id}`, reason: "render part asset absent" }); if (!joints.has(p.joint_id)) E("UNKNOWN_REFERENCE", { record_id: `${r.id}.${p.asset_id}`, dependency: p.joint_id, reason: "render part joint unknown" }); }
    for (const s of r.sockets) if (!joints.has(s.joint_id)) E("UNKNOWN_REFERENCE", { record_id: `${r.id}.${s.id}`, dependency: s.joint_id, reason: "socket joint unknown" });
    const states = new Map([...r.pose_states, ...r.view_states].map((s) => [s.id, s]));
    for (const s of states.values()) {
      if (ident && !ident.allowed_views.includes(s.view_facing)) E("UNSUPPORTED_VIEW", { record_id: `${r.id}.${s.id}`, dependency: s.view_facing, suggested_producer: "GPT view edit against the canonical master", reason: `view ${s.view_facing} not in the identity's approved views ${ident.allowed_views}` });
      for (const aid of Object.values(s.asset_bindings)) if (!assets.has(aid)) E("MISSING_ART_ASSET", { record_id: `${r.id}.${s.id}`, dependency: aid, reason: "state binds an absent asset" });
      for (const u of s.required_underpaint) { const ua = assets.get(u); if (!ua || ua.kind !== "UNDERPAINT") E("MISSING_UNDERPAINT", { record_id: `${r.id}.${s.id}`, dependency: u, suggested_producer: "GPT edit/outpaint job", reason: "state requires underpaint that is absent" }); }
      if (s.approved_review_id === null) E("UNAPPROVED_ART", { record_id: `${r.id}.${s.id}`, reason: "state not approved" });
    }
    for (const e of r.allowed_state_edges) {
      const A = states.get(e.from), B = states.get(e.to); if (!A || !B) { E("UNSUPPORTED_STATE_EDGE", { record_id: `${r.id}.${e.from}->${e.to}`, reason: "edge references unknown state" }); continue; }
      if (A.view_facing !== B.view_facing && !["REGISTERED_SWAP", "CEL_SEQUENCE"].includes(e.mode)) E(e.mode === "MATCHED_VECTOR_MORPH" ? "INVALID_MORPH_TOPOLOGY" : "UNSUPPORTED_STATE_EDGE", { record_id: `${r.id}.${e.from}->${e.to}`, reason: `view change ${A.view_facing}->${B.view_facing} by ${e.mode}: a view switch needs a registered swap or cel sequence` });
      if (e.mode === "MATCHED_VECTOR_MORPH") { const raster = [...Object.values(A.asset_bindings), ...Object.values(B.asset_bindings)].filter((id) => assets.get(id) && assets.get(id).kind !== "VECTOR_PATH"); if (raster.length) E("INVALID_MORPH_TOPOLOGY", { record_id: `${r.id}.${e.from}->${e.to}`, dependency: raster.join(","), reason: "vector morph between non-vector (raster) assets" }); }
      if ((e.mode === "REGISTERED_SWAP" || e.mode === "CEL_SEQUENCE") && !e.landmark_ids.length) E("UNSUPPORTED_STATE_EDGE", { record_id: `${r.id}.${e.from}->${e.to}`, reason: "registered swap needs landmark correspondence" });
      const common = e.landmark_ids.filter((l) => A.landmark_correspondence.includes(l) && B.landmark_correspondence.includes(l)); if (common.length !== e.landmark_ids.length) E("UNSUPPORTED_STATE_EDGE", { record_id: `${r.id}.${e.from}->${e.to}`, reason: "edge landmarks not shared by both states" });
      if (e.approved_assembly_review_id === null) E("UNAPPROVED_ART", { record_id: `${r.id}.${e.from}->${e.to}`, reason: "state edge assembly not approved" });
    }
  }
  // actions: frame ranges, states, reach
  for (const a of doc.actions) {
    const shot = shots.get(a.shot_id); if (!shot) { E("UNKNOWN_REFERENCE", { record_id: a.id, dependency: a.shot_id, reason: "action shot unknown" }); continue; }
    const [f0, f1] = a.frame_range;
    if (a.shot_span !== undefined) { if (!(f0 < f1)) E("INVALID_FRAME_RANGE", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: "action range must be non-empty" }); for (const x of validateShotSpan(a, { shots, transitions: doc.transitions || [] })) E(x.code === "UNKNOWN_SHOT" ? "UNKNOWN_REFERENCE" : "INVALID_FRAME_RANGE", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: `continuous parent action: ${x.code}: ${x.reason}` }); } // lives through its declared, contiguous, same-world cuts
    else if (!(f0 < f1) || f0 < shot.start_frame || f1 > shot.end_frame) E("INVALID_FRAME_RANGE", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, reason: "action range must be non-empty and inside its shot" });
    for (const id of a.required_assets) if (!assets.has(id)) E("MISSING_ART_ASSET", { record_id: a.id, shot_id: a.shot_id, frame_range: a.frame_range, dependency: id, suggested_producer: "GPT image provider", reason: "action requires an absent asset" });
    for (const actor of a.actors) {
      const r = rigs.get(actor.rig_id); if (!r) { E("UNKNOWN_REFERENCE", { record_id: a.id, dependency: actor.rig_id, reason: "actor rig unknown" }); continue; }
      const states = new Map([...r.pose_states, ...r.view_states].map((s) => [s.id, s])), joints = new Map(r.joints.map((j) => [j.id, j])), root = r.joints.find((j) => j.parent_id === null);
      const ownsState = (sid) => a.actors.some((x) => { const q = rigs.get(x.rig_id); return q && [...q.pose_states, ...q.view_states].some((s) => s.id === sid); });
      for (const pe of a.pose_events) if (!states.has(pe.state_id) && !ownsState(pe.state_id)) E("UNSUPPORTED_STATE_EDGE", { record_id: a.id, frame_range: [pe.frame, pe.frame + 1], dependency: pe.state_id, reason: "pose event state not in rig" });
      for (const ve of a.view_events) { if (!states.has(ve.to_state) && !states.has(ve.from_state) && ownsState(ve.to_state)) continue; const ok = r.allowed_state_edges.some((e) => e.from === ve.from_state && e.to === ve.to_state); const B = states.get(ve.to_state);
        if (!B) E("UNSUPPORTED_VIEW", { record_id: a.id, frame_range: [ve.frame, ve.frame + 1], dependency: ve.to_state, suggested_producer: "GPT view art", reason: "view event targets a state that has no approved art" });
        else if (!ok) E("UNSUPPORTED_STATE_EDGE", { record_id: a.id, frame_range: [ve.frame, ve.frame + 1], reason: `no approved edge ${ve.from_state}->${ve.to_state}` }); }
      for (const c of a.contact_events) {
        if (!(c.start_frame < c.end_frame) || c.start_frame < f0 || c.end_frame > f1) E("INVALID_FRAME_RANGE", { record_id: a.id, frame_range: [c.start_frame, c.end_frame], reason: "contact interval must lie inside the action" });
        const sock = r.sockets.find((s) => s.id === c.source_socket);
        if (!sock) { if (!a.actors.some((x) => rigs.get(x.rig_id)?.sockets.some((s) => s.id === c.source_socket))) E("UNKNOWN_REFERENCE", { record_id: a.id, dependency: c.source_socket, reason: "contact source socket not on any actor rig" }); continue; }
        const ikc = r.constraints.find((k) => k.type === "TWO_BONE_IK" && k.chain[2] === sock.joint_id);
        if ((c.contact_type === "GRIP" || c.contact_type === "PLANT") && ikc && c.target_world_xy && root && ikc.chain.every((k) => joints.has(k))) { // invalid rig DAG is already reported; reach is undefined without a root
          const sc = actor.root_scale ?? 1, P = (jid) => { const j = joints.get(jid); return [actor.root_world_xy[0] + (j.rest_xy[0] - root.rest_xy[0]) * sc, actor.root_world_xy[1] + (j.rest_xy[1] - root.rest_xy[1]) * sc]; };
          const [j0, j1, j2] = ikc.chain.map((k) => joints.get(k).rest_xy), L1 = Math.hypot(j1[0] - j0[0], j1[1] - j0[1]) * sc, L2 = Math.hypot(j2[0] - j1[0], j2[1] - j1[1]) * sc;
          const target = [c.target_world_xy[0] - sock.local_xy[0] * sc, c.target_world_xy[1] - sock.local_xy[1] * sc];
          try { solveTwoBonePosition(P(ikc.chain[0]), target, L1, L2, ikc.bend_sign ?? 1); }
          catch (e) { if (!e.code) throw e; E(e.code, { record_id: a.id, shot_id: a.shot_id, frame_range: [c.start_frame, c.end_frame], dependency: `${c.source_socket}->${c.target_socket}`, suggested_producer: "re-stage pose/root (approved compensation) or new pose art", reason: e.human_readable_reason, details: e.details }); }
        }
      }
    }
  }
  // transitions
  for (const t of doc.transitions) {
    if (!shots.has(t.from_shot) || !shots.has(t.to_shot)) E("UNKNOWN_REFERENCE", { record_id: `${t.from_shot}->${t.to_shot}`, reason: "transition shot unknown" });
    if (t.mode === "CONTINUOUS") for (const k of ["out_asset_ids", "middle_asset_ids", "in_asset_ids"]) { if (!t[k].length) E("MISSING_TRANSITION_STATE", { record_id: `${t.from_shot}->${t.to_shot}`, frame_range: t.frame_range, dependency: k, suggested_producer: "GPT OUT/MIDDLE/IN transition art", reason: `continuous transition lacks ${k}` }); for (const id of t[k]) if (!assets.has(id)) E("MISSING_TRANSITION_STATE", { record_id: `${t.from_shot}->${t.to_shot}`, frame_range: t.frame_range, dependency: id, reason: "transition art absent" }); }
  }
  for (const e of await checkMethodUses(doc.method_uses || [])) { e.file = manifestPath; errors.push(e); }
  // approval receipts (audit P0-4): every non-null approval id must name a valid, hash-scoped, non-stale receipt.
  // Production: any failure is a hard UNAPPROVED_ART. Mechanical runs: failures are reported (gates), not silently accepted.
  const approvals = verifyAllApprovals(doc, path.resolve(projectRoot), { requireHuman: !!options.production }); // production: only HUMAN-attested receipts count
  if (options.production) for (const f of approvals.failures) E("UNAPPROVED_ART", { record_id: f.record_id, reason: `${f.scope} approval ${f.status}: ${f.reason}${f.status === "NOT_HUMAN" ? " (not a human approval)" : ""}`, details: { scope: f.scope, status: f.status } });
  return { ok: errors.length === 0, errors, doc: deepFreeze(doc), graphs, decoded, approvals };
}
