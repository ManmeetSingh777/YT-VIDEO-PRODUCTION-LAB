#!/usr/bin/env node
// CLI (spec §4 step 6, §7.4): node engine/tools/art_bridge_check.mjs check --manifest PATH --root ROOT --json OUT [--production] [--inspect]
// Deterministic; exits nonzero on any hard error; --inspect prints the dependency list without writing art or touching Neutrino sources.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
import { loadManifest } from "../art_bridge/load_manifest.mjs";
import { computeCoverage } from "../art_bridge/coverage.mjs";
import { assetStateCoverage } from "../art_bridge/asset_state.mjs";
import { missingArtJobs } from "../art_bridge/art_requests.mjs";

export async function runCheck({ root, manifest, production = false }) {
  const L = await loadManifest(root, manifest, { production });
  const cov = L.doc && L.errors.every((e) => e.code !== "SCHEMA_VIOLATION") ? computeCoverage(L.doc) : null;
  const st = cov ? assetStateCoverage(L.doc) : null;
  const errors = [...L.errors, ...(cov?.errors || []), ...(st?.errors || [])].map((e) => (e.toJSON ? e.toJSON() : e));
  errors.sort((a, b) => (a.code + a.record_id).localeCompare(b.code + b.record_id));
  const art = L.doc ? missingArtJobs(errors, { doc: L.doc }) : { jobs: [], routed_elsewhere: [] };
  // separated gates (audit P0-4/P0-6): structural validity ≠ verified approvals ≠ production readiness
  const ap = L.approvals || { failures: [], unreviewed: [], verified: [] }, diag = (L.doc?.assets || []).filter((a) => a.provenance_class === "DIAGNOSTIC_FIXTURE").length;
  const gates = { manifest_valid: errors.filter((e) => e.code !== "UNAPPROVED_ART").length === 0, approvals_verified: !!L.doc && ap.failures.length === 0 && ap.unreviewed.length === 0, no_diagnostic_assets: diag === 0 };
  gates.production_ready = production && gates.manifest_valid && gates.approvals_verified && gates.no_diagnostic_assets && errors.length === 0;
  return { stage: "MANIFEST_V2_CHECK", pass: errors.length === 0, gates, approval_failures: ap.failures, approvals_unreviewed: ap.unreviewed.map((u) => `${u.scope}:${u.record_id}`), approvals_verified_count: ap.verified.length, manifest, root, errors, coverage: cov ? { totalFrames: cov.totalFrames, framesCovered: cov.framesCovered, shotSpans: cov.shotSpans, missingArt: cov.missingArt } : null,
    asset_state: st ? { covered: st.covered, total: st.total, cells: st.cells } : null, art_jobs: art.jobs, routed_elsewhere: art.routed_elsewhere };
}

if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) {
  const a = process.argv.slice(2), get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  if (a[0] !== "check" || !get("--manifest") || !get("--root")) { console.error("usage: art_bridge_check.mjs check --manifest PATH --root ROOT [--json OUT] [--production] [--inspect]"); process.exit(2); }
  const r = await runCheck({ root: get("--root"), manifest: get("--manifest"), production: a.includes("--production") });
  if (get("--json")) { fs.mkdirSync(path.dirname(get("--json")), { recursive: true }); fs.writeFileSync(get("--json"), JSON.stringify(r, null, 1)); }
  if (a.includes("--inspect") || !get("--json")) { for (const e of r.errors) console.log(`${e.code.padEnd(26)} ${e.record_id ?? ""}${e.frame_range ? ` frames ${e.frame_range}` : ""} — ${e.human_readable_reason}`); if (r.coverage) console.log(`coverage: ${r.coverage.framesCovered}/${r.coverage.totalFrames} frames, missing art: ${r.coverage.missingArt.map((m) => m.asset_id).join(", ") || "none"}`); }
  console.log(r.pass ? "PASS" : `FAIL (${r.errors.length} error(s))`);
  process.exit(r.pass ? 0 : 1);
}
