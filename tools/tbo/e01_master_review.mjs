#!/usr/bin/env node
// Consolidated master review. `prepare`: one review page for every master + REVIEW_DECISIONS.template.json. `apply`: for each master the director
// approves AND whose landmarks the director confirms, write the reviewed landmark sidecar, register it (ingest-master: measured, hash-bound) and
// create its signed master-review request. Nothing is approved by this tool: approval is the director's signature on that request.
//   node tools/tbo/e01_master_review.mjs prepare --film films/e01 --out <outbox> --salvage <dir> --review <dir>
//   node tools/tbo/e01_master_review.mjs apply   --film films/e01 --out <outbox> --salvage <dir> --review <dir> --decisions <json>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), imp = (rel) => import(url.pathToFileURL(path.join(REPO, rel))), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; }, cmd = process.argv[2];
const FILM = path.resolve(REPO, arg("film")), OUT = path.resolve(arg("out")), SAL = path.resolve(arg("salvage")), REV = path.resolve(arg("review"));
const sal = J(path.join(SAL, "SALVAGE_RECORD.json")), cat = J(path.join(SAL, "CATALOG.json")), dec = J(path.join(SAL, "MASTER_DECISIONS.json")), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
const proposal = (asset, file) => { const a = file.replace(".png", ".PROPOSED_LANDMARKS.json"), b = path.join(OUT, "prepared", "landmark_proposals", `${asset}.PROPOSED_LANDMARKS.json`); return fs.existsSync(a) ? J(a) : fs.existsSync(b) ? J(b) : null; };
if (cmd === "prepare") {
  fs.mkdirSync(path.join(REV, "img"), { recursive: true }); const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]), cards = [], tpl = {};
  for (const p of sal.prepared) { const a = p.asset, d = dec[a] || {}, ident = doc.identities.find((i) => i.canonical_asset_id === a), lm = proposal(a, p.file), need = Object.keys(ident.landmarks);
    fs.copyFileSync(p.file, path.join(REV, "img", `${a}__PREPARED.png`)); const alts = cat.filter((e) => e.asset === a && /CANDIDATE|SEED_COPY/.test(e.roles.join()) && e.sha256 !== p.parent_sha256).map((e) => { fs.copyFileSync(path.join(SAL, "catalog", `${e.sha256.slice(0, 16)}.png`), path.join(REV, "img", `${a}__${e.version || "x"}__${e.sha256.slice(0, 8)}.png`)); return `${a}__${e.version || "x"}__${e.sha256.slice(0, 8)}.png`; });
    const missing = lm ? need.filter((k) => !(k in lm.landmarks)) : need;
    cards.push(`<section><h2>${esc(a)} — ${esc(d.status || "REVIEW_FOR_APPROVAL")}</h2><p>${esc(d.note || "")}</p>${d.correct ? `<p><b>Artistic correction requested from Artwork GPT:</b> ${esc(d.correct.join(" · "))}</p>` : ""}<div class="row"><figure><img src="img/${esc(a)}__PREPARED.png"><figcaption>STRONGEST (alpha-prepared) ${p.prepared_sha256.slice(0, 12)}</figcaption></figure>${alts.map((f) => `<figure><img src="img/${esc(f)}"><figcaption>${esc(f)}</figcaption></figure>`).join("")}</div><p>Landmarks: ${lm ? `${Object.keys(lm.landmarks).length} proposed (${esc(lm.status)})` : "none proposed yet"}; required ${need.length}; missing ${esc(missing.join(", ") || "none")}${lm?.unresolved?.length ? ` — ${esc(lm.unresolved.join("; "))}` : ""}</p></section>`);
    tpl[a] = { approve_artwork: null, landmarks_confirmed: null, landmark_overrides: {}, notes: "" }; }
  fs.writeFileSync(path.join(REV, "MASTER_REVIEW.html"), `<!doctype html><meta charset="utf-8"><title>E01 master review</title><style>body{font:14px system-ui;margin:24px;background:#f5f5f2}figure{display:inline-block;margin:6px;vertical-align:top;background:repeating-conic-gradient(#ddd 0 25%,#fff 0 50%) 0/16px 16px;padding:4px}img{max-height:420px;display:block}figcaption{font-size:11px;background:#fff}section{margin-bottom:34px}</style><h1>E01 canonical masters — consolidated review</h1><p>Approve only artwork that meets its construction obligations. Confirm landmarks against LANDMARK_PROPOSALS_OVERLAY.png. Fill REVIEW_DECISIONS.json (copy of the template) and run <code>apply</code>. Nothing here approves anything; approval is your signature on the master-review requests that <code>apply</code> creates.</p>${cards.join("")}`);
  if (fs.existsSync(path.join(SAL, "LANDMARK_PROPOSALS_OVERLAY.png"))) fs.copyFileSync(path.join(SAL, "LANDMARK_PROPOSALS_OVERLAY.png"), path.join(REV, "LANDMARK_PROPOSALS_OVERLAY.png"));
  fs.writeFileSync(path.join(REV, "REVIEW_DECISIONS.template.json"), JSON.stringify({ reviewer: "e01_director", masters: tpl }, null, 1)); console.log(JSON.stringify({ review: path.join(REV, "MASTER_REVIEW.html"), masters: Object.keys(tpl).length }));
} else if (cmd === "apply") {
  const D = J(path.resolve(arg("decisions"))), I = await imp("engine/art_bridge/art_intake.mjs"), out = [];
  for (const [a, d] of Object.entries(D.masters || {})) { const p = sal.prepared.find((x) => x.asset === a), ident = doc.identities.find((i) => i.canonical_asset_id === a);
    if (d.approve_artwork !== true) { out.push({ asset: a, outcome: d.approve_artwork === false ? "REJECTED_BY_DIRECTOR (route back to Artwork GPT)" : "UNDECIDED" }); continue; }
    const lm = proposal(a, p.file); if (d.landmarks_confirmed !== true || !lm) { out.push({ asset: a, outcome: "APPROVAL_PENDING_LANDMARKS", missing: !lm ? "no proposal" : "not confirmed" }); continue; }
    const side = path.join(OUT, "prepared", "reviewed_landmarks", `${a}.json`); fs.mkdirSync(path.dirname(side), { recursive: true });
    fs.writeFileSync(side, JSON.stringify({ landmarks: { ...lm.landmarks, ...(d.landmark_overrides || {}) }, reviewed_by: D.reviewer, method: "operator/Claude proposal confirmed by the director in the consolidated master review", image_sha256: p.prepared_sha256 }, null, 1));
    try { const r = await I.ingestMaster({ film: FILM, asset: a, file: p.file, landmarks: side, provenance: "GPT_OPERATOR_HANDOFF", outbox: OUT });
      let request = null; if (r.status === "REGISTERED_PENDING_REVIEW") request = JSON.parse(execFileSync(process.execPath, [path.join(REPO, "engine/tools/review_sign.mjs"), "request", "--film", FILM, "--scope", "master", "--id", ident.id], { encoding: "utf8" }).trim().split("\n").pop()).request_id;
      out.push({ asset: a, outcome: r.status, request, scale: r.receipt?.scale ?? r.scale ?? null, failures: r.failures || null }); }
    catch (e) { out.push({ asset: a, outcome: "INGEST_REFUSED", code: e.code || null, reason: e.human_readable_reason || e.message }); } }
  fs.writeFileSync(path.join(REV, "APPLY_RESULT.json"), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
} else { console.error("usage: e01_master_review.mjs prepare|apply ..."); process.exit(2); }
